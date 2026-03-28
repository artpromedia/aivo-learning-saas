import type { FastifyInstance } from "fastify";
import type { SisSection } from "./roster-mapper.js";
import { classrooms, classroomLearners, syncLogs } from "@aivo/db";
import { eq, and } from "drizzle-orm";
import { publishEvent } from "@aivo/events";

export class SectionSync {
  constructor(private readonly app: FastifyInstance) {}

  async syncSections(
    tenantId: string,
    sections: SisSection[],
    syncLogId: string,
  ): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    for (const section of sections) {
      try {
        // Find existing classroom by SIS section ID
        const [existing] = await this.app.db
          .select()
          .from(classrooms)
          .where(
            and(
              eq(classrooms.tenantId, tenantId),
              eq(classrooms.name, section.name),
            ),
          )
          .limit(1);

        // Resolve teacher
        let teacherId: string | undefined;
        if (section.teacherSisId) {
          const teacher = await this.app.identityClient.findUserBySisId(section.teacherSisId, tenantId);
          teacherId = teacher?.id;
        }

        if (existing) {
          // Update classroom
          await this.app.db
            .update(classrooms)
            .set({
              gradeBand: section.grade ?? existing.gradeBand,
              teacherId: teacherId ?? existing.teacherId,
              updatedAt: new Date(),
            })
            .where(eq(classrooms.id, existing.id));
          updated++;

          // Sync student enrollments
          await this.syncEnrollments(existing.id, section.studentSisIds, tenantId);
        } else {
          // Create new classroom
          const [classroom] = await this.app.db
            .insert(classrooms)
            .values({
              tenantId,
              name: section.name,
              gradeBand: section.grade,
              teacherId,
            })
            .returning();

          created++;

          // Create student enrollments
          await this.syncEnrollments(classroom.id, section.studentSisIds, tenantId);
        }
      } catch (err) {
        this.app.log.error(
          { err, sectionSisId: section.sisId },
          "Failed to sync section",
        );
      }
    }

    // Update sync log with section counts
    await this.app.db
      .update(syncLogs)
      .set({ sectionsAdded: created })
      .where(eq(syncLogs.id, syncLogId));

    this.app.log.info(
      { tenantId, created, updated },
      "Section sync completed",
    );

    return { created, updated };
  }

  private async syncEnrollments(
    classroomId: string,
    studentSisIds: string[],
    tenantId: string,
  ): Promise<void> {
    for (const sisId of studentSisIds) {
      try {
        const learner = await this.app.identityClient.findLearnerBySisId(sisId, tenantId);
        if (!learner) continue;

        // Check if enrollment already exists
        const [existing] = await this.app.db
          .select()
          .from(classroomLearners)
          .where(
            and(
              eq(classroomLearners.classroomId, classroomId),
              eq(classroomLearners.learnerId, learner.id),
            ),
          )
          .limit(1);

        if (!existing) {
          await this.app.db
            .insert(classroomLearners)
            .values({
              classroomId,
              learnerId: learner.id,
            });
        }
      } catch (err) {
        this.app.log.error(
          { err, studentSisId: sisId, classroomId },
          "Failed to sync enrollment",
        );
      }
    }
  }
}
