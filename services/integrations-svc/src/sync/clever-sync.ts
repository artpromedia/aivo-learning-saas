import type { FastifyInstance } from "fastify";
import type { SisStudent, SisTeacher, SisSection } from "./roster-mapper.js";
import { RosterMapper } from "./roster-mapper.js";
import { DeltaDetector } from "./delta-detector.js";
import { ConflictResolver } from "./conflict-resolver.js";
import { syncLogs, sisConnections } from "@aivo/db";
import { eq } from "drizzle-orm";
import { publishEvent } from "@aivo/events";

interface CleverApiResponse<T> {
  data: Array<{ data: T }>;
  links?: Array<{ rel: string; uri: string }>;
}

export class CleverSync {
  private mapper = new RosterMapper();
  private deltaDetector = new DeltaDetector();
  private conflictResolver = new ConflictResolver();

  constructor(private readonly app: FastifyInstance) {}

  async fullSync(connectionId: string, tenantId: string, accessToken: string): Promise<string> {
    const [syncLog] = await this.app.db
      .insert(syncLogs)
      .values({
        sisConnectionId: connectionId,
        status: "IN_PROGRESS",
        syncType: "FULL",
      })
      .returning();

    try {
      const students = await this.fetchAllStudents(accessToken);
      const teachers = await this.fetchAllTeachers(accessToken);
      const sections = await this.fetchAllSections(accessToken);

      let studentsAdded = 0;
      let teachersAdded = 0;
      let sectionsAdded = 0;
      const errors: Array<{ item: string; error: string }> = [];

      // Sync teachers first
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

      // Sync students with parent invitations
      const newParentNotifications: Array<{
        parentEmail: string;
        parentName: string;
        learnerName: string;
        schoolName: string;
        isExisting: boolean;
      }> = [];

      for (const student of students) {
        try {
          const { user, learner } = this.mapper.mapStudent(student);
          const existing = await this.app.identityClient.findUserByEmail(user.email);

          if (!existing) {
            // Create parent account if parent email provided
            let parentId: string | undefined;
            let isExistingParent = false;
            if (learner.parentEmail) {
              const existingParent = await this.app.identityClient.findUserByEmail(learner.parentEmail);
              if (existingParent) {
                parentId = existingParent.id;
                isExistingParent = true;
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

              newParentNotifications.push({
                parentEmail: learner.parentEmail,
                parentName: learner.parentName ?? learner.name + "'s Parent",
                learnerName: learner.name,
                schoolName: learner.schoolName ?? "",
                isExisting: isExistingParent,
              });
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
          }
        } catch (err) {
          errors.push({ item: `student:${student.sisId}`, error: (err as Error).message });
        }
      }

      // Notify parents of SIS enrollment
      for (const notification of newParentNotifications) {
        try {
          await publishEvent(this.app.nats, "comms.email.send", {
            to: notification.parentEmail,
            template: "sis_enrollment_notification",
            data: {
              parentName: notification.parentName,
              learnerName: notification.learnerName,
              schoolName: notification.schoolName,
              isExistingParent: notification.isExisting,
            },
          });
        } catch (err) {
          this.app.log.error({ err, email: notification.parentEmail }, "Failed to send SIS enrollment notification");
        }
      }

      sectionsAdded = sections.length;

      await this.app.db
        .update(syncLogs)
        .set({
          status: "COMPLETED",
          studentsAdded,
          teachersAdded,
          sectionsAdded,
          errors,
          completedAt: new Date(),
        })
        .where(eq(syncLogs.id, syncLog.id));

      await this.app.db
        .update(sisConnections)
        .set({ lastSyncAt: new Date(), lastSyncStatus: "COMPLETED", updatedAt: new Date() })
        .where(eq(sisConnections.id, connectionId));

      await publishEvent(this.app.nats, "integrations.roster.synced", {
        tenantId,
        provider: "CLEVER" as const,
        studentsAdded,
        studentsUpdated: 0,
        studentsDeleted: 0,
        teachersAdded,
      });

      return syncLog.id;
    } catch (err) {
      await this.app.db
        .update(syncLogs)
        .set({
          status: "FAILED",
          errors: [{ error: (err as Error).message }],
          completedAt: new Date(),
        })
        .where(eq(syncLogs.id, syncLog.id));

      await this.app.db
        .update(sisConnections)
        .set({ lastSyncStatus: "FAILED", updatedAt: new Date() })
        .where(eq(sisConnections.id, connectionId));

      throw err;
    }
  }

  async deltaSync(connectionId: string, tenantId: string, accessToken: string): Promise<string> {
    const [syncLog] = await this.app.db
      .insert(syncLogs)
      .values({
        sisConnectionId: connectionId,
        status: "IN_PROGRESS",
        syncType: "DELTA",
      })
      .returning();

    try {
      const currentStudents = await this.fetchAllStudents(accessToken);
      const previousStudents = await this.loadPreviousRoster(connectionId, "students");

      const previousMap = new Map<string, SisStudent>();
      for (const s of previousStudents) {
        previousMap.set(s.sisId, s);
      }

      const delta = this.deltaDetector.detectStudentChanges(currentStudents, previousMap);

      let studentsAdded = 0;
      let studentsUpdated = 0;
      const errors: Array<{ item: string; error: string }> = [];

      for (const student of delta.added) {
        try {
          const { user, learner } = this.mapper.mapStudent(student);
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

      studentsUpdated = delta.updated.length;

      // Save current roster for next delta
      await this.saveCurrentRoster(connectionId, "students", currentStudents);

      await this.app.db
        .update(syncLogs)
        .set({
          status: "COMPLETED",
          studentsAdded,
          studentsUpdated,
          studentsDeleted: delta.deleted.length,
          errors,
          completedAt: new Date(),
        })
        .where(eq(syncLogs.id, syncLog.id));

      await this.app.db
        .update(sisConnections)
        .set({ lastSyncAt: new Date(), lastSyncStatus: "COMPLETED", updatedAt: new Date() })
        .where(eq(sisConnections.id, connectionId));

      await publishEvent(this.app.nats, "integrations.roster.synced", {
        tenantId,
        provider: "CLEVER" as const,
        studentsAdded,
        studentsUpdated,
        studentsDeleted: delta.deleted.length,
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

  async handleWebhookEvent(event: { type: string; data: Record<string, unknown> }, tenantId: string) {
    const eventType = event.type;
    const data = event.data;

    if (eventType === "students.created" || eventType === "students.updated") {
      const student: SisStudent = {
        sisId: data.id as string,
        firstName: (data.name as Record<string, string>)?.first ?? "",
        lastName: (data.name as Record<string, string>)?.last ?? "",
        email: data.email as string | undefined,
        grade: data.grade as string | undefined,
      };

      const { learner } = this.mapper.mapStudent(student);
      this.app.log.info({ eventType, sisId: student.sisId, tenantId }, "Clever webhook: student event");
    } else if (eventType === "students.deleted") {
      this.app.log.info({ eventType, sisId: data.id, tenantId }, "Clever webhook: student deleted");
    }
  }

  private async fetchAllStudents(accessToken: string): Promise<SisStudent[]> {
    const response = await fetch("https://api.clever.com/v3.0/users?role=student", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) throw new Error(`Clever API error: ${response.status}`);

    const json = (await response.json()) as CleverApiResponse<{
      id: string;
      name: { first: string; last: string };
      email?: string;
      roles: { student?: { grade?: string; school?: string } };
    }>;

    return json.data.map((item) => ({
      sisId: item.data.id,
      firstName: item.data.name.first,
      lastName: item.data.name.last,
      email: item.data.email,
      grade: item.data.roles?.student?.grade,
      schoolName: item.data.roles?.student?.school,
    }));
  }

  private async fetchAllTeachers(accessToken: string): Promise<SisTeacher[]> {
    const response = await fetch("https://api.clever.com/v3.0/users?role=teacher", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) throw new Error(`Clever API error: ${response.status}`);

    const json = (await response.json()) as CleverApiResponse<{
      id: string;
      name: { first: string; last: string };
      email: string;
    }>;

    return json.data.map((item) => ({
      sisId: item.data.id,
      firstName: item.data.name.first,
      lastName: item.data.name.last,
      email: item.data.email,
    }));
  }

  private async fetchAllSections(accessToken: string): Promise<SisSection[]> {
    const response = await fetch("https://api.clever.com/v3.0/sections", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) throw new Error(`Clever API error: ${response.status}`);

    const json = (await response.json()) as CleverApiResponse<{
      id: string;
      name: string;
      subject?: string;
      grade?: string;
      teacher?: string;
      students: string[];
    }>;

    return json.data.map((item) => ({
      sisId: item.data.id,
      name: item.data.name,
      subject: item.data.subject,
      grade: item.data.grade,
      teacherSisId: item.data.teacher,
      studentSisIds: item.data.students ?? [],
    }));
  }

  private async loadPreviousRoster(connectionId: string, type: string): Promise<SisStudent[]> {
    const cached = await this.app.redis.get(`sis:roster:${connectionId}:${type}`);
    return cached ? JSON.parse(cached) : [];
  }

  private async saveCurrentRoster(connectionId: string, type: string, data: SisStudent[]) {
    await this.app.redis.setex(`sis:roster:${connectionId}:${type}`, 86400 * 7, JSON.stringify(data));
  }
}
