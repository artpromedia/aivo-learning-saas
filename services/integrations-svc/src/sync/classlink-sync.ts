import type { FastifyInstance } from "fastify";
import type { SisStudent, SisTeacher } from "./roster-mapper.js";
import { RosterMapper } from "./roster-mapper.js";
import { DeltaDetector } from "./delta-detector.js";
import { syncLogs, sisConnections } from "@aivo/db";
import { eq } from "drizzle-orm";
import { publishEvent } from "@aivo/events";

export class ClassLinkSync {
  private mapper = new RosterMapper();
  private deltaDetector = new DeltaDetector();

  constructor(private readonly app: FastifyInstance) {}

  async fullSync(connectionId: string, tenantId: string, accessToken: string, baseUrl: string): Promise<string> {
    const [syncLog] = await this.app.db
      .insert(syncLogs)
      .values({ sisConnectionId: connectionId, status: "IN_PROGRESS", syncType: "FULL" })
      .returning();

    try {
      const students = await this.fetchOneRosterUsers(baseUrl, accessToken, "student");
      const teachers = await this.fetchOneRosterUsers(baseUrl, accessToken, "teacher");

      let studentsAdded = 0;
      let teachersAdded = 0;
      const errors: Array<{ item: string; error: string }> = [];

      for (const teacher of teachers) {
        try {
          const mapped = this.mapper.mapTeacher(teacher);
          const existing = await this.app.identityClient.findUserByEmail(mapped.email);
          if (!existing) {
            await this.app.identityClient.createUser({
              tenantId,
              email: mapped.email,
              name: mapped.name,
              role: "TEACHER",
              status: "INVITED",
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
            if (existingParent) {
              parentId = existingParent.id;
            } else {
              const parent = await this.app.identityClient.createUser({
                tenantId,
                email: learner.parentEmail,
                name: learner.parentName ?? learner.name + "'s Parent",
                role: "PARENT",
                status: "INVITED",
              });
              parentId = parent.id;
              await this.app.identityClient.sendInvitation(parent.id, "system");
            }
          }
          if (parentId) {
            await this.app.identityClient.createLearner({
              tenantId,
              parentId,
              name: learner.name,
              enrolledGrade: learner.enrolledGrade,
              schoolName: learner.schoolName,
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
        tenantId,
        provider: "CLASSLINK" as const,
        studentsAdded,
        studentsUpdated: 0,
        studentsDeleted: 0,
        teachersAdded,
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

  async deltaSync(
    connectionId: string,
    tenantId: string,
    accessToken: string,
    baseUrl: string,
    lastSyncTimestamp: string,
  ): Promise<string> {
    const [syncLog] = await this.app.db
      .insert(syncLogs)
      .values({ sisConnectionId: connectionId, status: "IN_PROGRESS", syncType: "DELTA" })
      .returning();

    try {
      const students = await this.fetchOneRosterUsers(
        baseUrl,
        accessToken,
        "student",
        `dateLastModified>'${lastSyncTimestamp}'`,
      );

      const changes = this.deltaDetector.detectChanges([], students as SisStudent[]);

      let studentsAdded = 0;
      let studentsUpdated = 0;
      const errors: Array<{ item: string; error: string }> = [];

      for (const student of changes.added) {
        try {
          const { learner } = this.mapper.mapStudent(student);
          let parentId: string | undefined;
          if (learner.parentEmail) {
            const existingParent = await this.app.identityClient.findUserByEmail(learner.parentEmail);
            if (existingParent) {
              parentId = existingParent.id;
            } else {
              const parent = await this.app.identityClient.createUser({
                tenantId,
                email: learner.parentEmail,
                name: learner.parentName ?? learner.name + "'s Parent",
                role: "PARENT",
                status: "INVITED",
              });
              parentId = parent.id;
              await this.app.identityClient.sendInvitation(parent.id, "system");
            }
          }
          if (parentId) {
            await this.app.identityClient.createLearner({
              tenantId,
              parentId,
              name: learner.name,
              enrolledGrade: learner.enrolledGrade,
              schoolName: learner.schoolName,
            });
          }
          studentsAdded++;
        } catch (err) {
          errors.push({ item: `student:${student.sisId}`, error: (err as Error).message });
        }
      }

      for (const student of changes.updated) {
        try {
          const { learner } = this.mapper.mapStudent(student);
          const existing = await this.app.identityClient.findLearnerBySisId(student.sisId, tenantId);
          if (existing) {
            await this.app.identityClient.updateLearner(existing.id, {
              name: learner.name,
              enrolledGrade: learner.enrolledGrade,
              schoolName: learner.schoolName,
            });
            studentsUpdated++;
          }
        } catch (err) {
          errors.push({ item: `student:${student.sisId}`, error: (err as Error).message });
        }
      }

      await this.app.db
        .update(syncLogs)
        .set({ status: "COMPLETED", studentsAdded, studentsUpdated, errors, completedAt: new Date() })
        .where(eq(syncLogs.id, syncLog.id));

      await this.app.db
        .update(sisConnections)
        .set({ lastSyncAt: new Date(), lastSyncStatus: "COMPLETED", updatedAt: new Date() })
        .where(eq(sisConnections.id, connectionId));

      await publishEvent(this.app.nats, "integrations.roster.synced", {
        tenantId,
        provider: "CLASSLINK" as const,
        studentsAdded,
        studentsUpdated,
        studentsDeleted: 0,
        teachersAdded: 0,
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

  private async fetchOneRosterUsers(baseUrl: string, accessToken: string, role: "student" | "teacher", filter?: string): Promise<(SisStudent | SisTeacher)[]> {
    let url = `${baseUrl}/ims/oneroster/v1p2/users?filter=role='${role}'`;
    if (filter) {
      url += ` AND ${filter}`;
    }
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) throw new Error(`ClassLink OneRoster API error: ${response.status}`);

    const json = (await response.json()) as {
      users: Array<{
        sourcedId: string;
        givenName: string;
        familyName: string;
        email?: string;
        grades?: string[];
        orgs?: Array<{ sourcedId: string; name: string }>;
      }>;
    };

    return json.users.map((u) => ({
      sisId: u.sourcedId,
      firstName: u.givenName,
      lastName: u.familyName,
      email: u.email ?? "",
      grade: u.grades?.[0],
      schoolName: u.orgs?.[0]?.name,
    }));
  }
}
