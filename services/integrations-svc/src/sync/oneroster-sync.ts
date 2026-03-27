import type { FastifyInstance } from "fastify";
import type { SisStudent, SisTeacher } from "./roster-mapper.js";
import { RosterMapper } from "./roster-mapper.js";
import { syncLogs, sisConnections } from "@aivo/db";
import { eq } from "drizzle-orm";
import { publishEvent } from "@aivo/events";

export class OneRosterSync {
  private mapper = new RosterMapper();

  constructor(private readonly app: FastifyInstance) {}

  async fullSync(connectionId: string, tenantId: string, baseUrl: string, accessToken: string): Promise<string> {
    const [syncLog] = await this.app.db
      .insert(syncLogs)
      .values({ sisConnectionId: connectionId, status: "IN_PROGRESS", syncType: "FULL" })
      .returning();

    try {
      const students = await this.fetchUsers(baseUrl, accessToken, "student");
      const teachers = await this.fetchUsers(baseUrl, accessToken, "teacher");

      let studentsAdded = 0;
      let teachersAdded = 0;
      const errors: Array<{ item: string; error: string }> = [];

      for (const teacher of teachers) {
        try {
          const mapped = this.mapper.mapTeacher(teacher as SisTeacher);
          const existing = await this.app.identityClient.findUserByEmail(mapped.email);
          if (!existing) {
            await this.app.identityClient.createUser({
              tenantId, email: mapped.email, name: mapped.name, role: "TEACHER", status: "INVITED",
            });
            teachersAdded++;
          }
        } catch (err) {
          errors.push({ item: `teacher:${teacher.sisId}`, error: (err as Error).message });
        }
      }

      for (const student of students) {
        try {
          const { learner } = this.mapper.mapStudent(student);
          let parentId: string | undefined;
          if (learner.parentEmail) {
            const existingParent = await this.app.identityClient.findUserByEmail(learner.parentEmail);
            parentId = existingParent?.id;
            if (!parentId) {
              const parent = await this.app.identityClient.createUser({
                tenantId, email: learner.parentEmail, name: learner.parentName ?? learner.name + "'s Parent", role: "PARENT", status: "INVITED",
              });
              parentId = parent.id;
              await this.app.identityClient.sendInvitation(parent.id, "system");
            }
          }
          if (parentId) {
            await this.app.identityClient.createLearner({
              tenantId, parentId, name: learner.name, enrolledGrade: learner.enrolledGrade, schoolName: learner.schoolName,
            });
          }
          studentsAdded++;
        } catch (err) {
          errors.push({ item: `student:${student.sisId}`, error: (err as Error).message });
        }
      }

      await this.app.db
        .update(syncLogs)
        .set({ status: "COMPLETED", studentsAdded, teachersAdded, errors, completedAt: new Date() })
        .where(eq(syncLogs.id, syncLog.id));

      await this.app.db
        .update(sisConnections)
        .set({ lastSyncAt: new Date(), lastSyncStatus: "COMPLETED", updatedAt: new Date() })
        .where(eq(sisConnections.id, connectionId));

      await publishEvent(this.app.nats, "integrations.roster.synced", {
        tenantId, provider: "ONEROSTER" as const, studentsAdded, studentsUpdated: 0, studentsDeleted: 0, teachersAdded,
      });

      return syncLog.id;
    } catch (err) {
      await this.app.db
        .update(syncLogs)
        .set({ status: "FAILED", errors: [{ error: (err as Error).message }], completedAt: new Date() })
        .where(eq(syncLogs.id, syncLog.id));
      throw err;
    }
  }

  private async fetchUsers(baseUrl: string, accessToken: string, role: string): Promise<SisStudent[]> {
    const url = `${baseUrl}/ims/oneroster/v1p2/users?filter=role='${role}'`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!response.ok) throw new Error(`OneRoster API error: ${response.status}`);

    const json = (await response.json()) as {
      users: Array<{
        sourcedId: string; givenName: string; familyName: string; email?: string; grades?: string[];
        orgs?: Array<{ sourcedId: string; name: string }>;
      }>;
    };

    return json.users.map((u) => ({
      sisId: u.sourcedId,
      firstName: u.givenName,
      lastName: u.familyName,
      email: u.email,
      grade: u.grades?.[0],
      schoolName: u.orgs?.[0]?.name,
    }));
  }
}
