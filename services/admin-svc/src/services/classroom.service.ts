import { eq, and, sql, count } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import {
  classrooms,
  classroomLearners,
  users,
  learners,
} from "@aivo/db";

export class ClassroomService {
  constructor(private readonly app: FastifyInstance) {}

  async create(
    tenantId: string,
    data: { name: string; gradeBand?: string; teacherId?: string },
    adminUserId: string,
  ) {
    const [classroom] = await this.app.db
      .insert(classrooms)
      .values({
        tenantId,
        name: data.name,
        gradeBand: data.gradeBand,
        teacherId: data.teacherId,
      })
      .returning();

    return classroom;
  }

  async list(tenantId: string) {
    const results = await this.app.db
      .select({
        id: classrooms.id,
        name: classrooms.name,
        gradeBand: classrooms.gradeBand,
        teacherId: classrooms.teacherId,
        createdAt: classrooms.createdAt,
        updatedAt: classrooms.updatedAt,
        teacherName: users.name,
        teacherEmail: users.email,
        learnerCount: sql<number>`(
          SELECT COUNT(*)::int FROM classroom_learners
          WHERE classroom_learners.classroom_id = ${classrooms.id}
        )`,
      })
      .from(classrooms)
      .leftJoin(users, eq(classrooms.teacherId, users.id))
      .where(
        and(
          eq(classrooms.tenantId, tenantId),
          eq(classrooms.isDeleted, false),
        ),
      )
      .orderBy(classrooms.name);

    return results;
  }

  async getById(classroomId: string, tenantId: string) {
    const [classroom] = await this.app.db
      .select({
        id: classrooms.id,
        name: classrooms.name,
        gradeBand: classrooms.gradeBand,
        teacherId: classrooms.teacherId,
        tenantId: classrooms.tenantId,
        createdAt: classrooms.createdAt,
        updatedAt: classrooms.updatedAt,
        teacherName: users.name,
        teacherEmail: users.email,
      })
      .from(classrooms)
      .leftJoin(users, eq(classrooms.teacherId, users.id))
      .where(
        and(
          eq(classrooms.id, classroomId),
          eq(classrooms.tenantId, tenantId),
          eq(classrooms.isDeleted, false),
        ),
      )
      .limit(1);

    return classroom ?? null;
  }

  async update(
    classroomId: string,
    tenantId: string,
    data: { name?: string; gradeBand?: string; teacherId?: string | null },
  ) {
    const [updated] = await this.app.db
      .update(classrooms)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.gradeBand !== undefined && { gradeBand: data.gradeBand }),
        ...(data.teacherId !== undefined && { teacherId: data.teacherId }),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(classrooms.id, classroomId),
          eq(classrooms.tenantId, tenantId),
          eq(classrooms.isDeleted, false),
        ),
      )
      .returning();

    return updated ?? null;
  }

  async softDelete(classroomId: string, tenantId: string) {
    const [deleted] = await this.app.db
      .update(classrooms)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(
        and(
          eq(classrooms.id, classroomId),
          eq(classrooms.tenantId, tenantId),
        ),
      )
      .returning();

    return deleted ?? null;
  }

  async addLearners(classroomId: string, learnerIds: string[]) {
    const values = learnerIds.map((learnerId) => ({
      classroomId,
      learnerId,
    }));

    const result = await this.app.db
      .insert(classroomLearners)
      .values(values)
      .onConflictDoNothing()
      .returning();

    return result;
  }

  async removeLearner(classroomId: string, learnerId: string) {
    const [removed] = await this.app.db
      .delete(classroomLearners)
      .where(
        and(
          eq(classroomLearners.classroomId, classroomId),
          eq(classroomLearners.learnerId, learnerId),
        ),
      )
      .returning();

    return removed ?? null;
  }

  async getClassroomLearners(classroomId: string) {
    return this.app.db
      .select({
        learnerId: classroomLearners.learnerId,
        enrolledAt: classroomLearners.enrolledAt,
        name: learners.name,
        functioningLevel: learners.functioningLevel,
        enrolledGrade: learners.enrolledGrade,
      })
      .from(classroomLearners)
      .innerJoin(learners, eq(classroomLearners.learnerId, learners.id))
      .where(eq(classroomLearners.classroomId, classroomId));
  }

  async getClassroomAnalytics(classroomId: string) {
    const classroomLearnersList = await this.getClassroomLearners(classroomId);

    const functioningLevelBreakdown: Record<string, number> = {};
    let totalGrade = 0;
    let gradeCount = 0;

    for (const l of classroomLearnersList) {
      const fl = l.functioningLevel ?? "STANDARD";
      functioningLevelBreakdown[fl] = (functioningLevelBreakdown[fl] ?? 0) + 1;
      if (l.enrolledGrade) {
        totalGrade += l.enrolledGrade;
        gradeCount++;
      }
    }

    return {
      learnerCount: classroomLearnersList.length,
      functioningLevelBreakdown,
      averageGrade: gradeCount > 0 ? totalGrade / gradeCount : null,
      learners: classroomLearnersList,
    };
  }

  async getClassroomsForTeacher(teacherId: string) {
    return this.app.db
      .select({
        id: classrooms.id,
        name: classrooms.name,
        gradeBand: classrooms.gradeBand,
        tenantId: classrooms.tenantId,
        createdAt: classrooms.createdAt,
        learnerCount: sql<number>`(
          SELECT COUNT(*)::int FROM classroom_learners
          WHERE classroom_learners.classroom_id = ${classrooms.id}
        )`,
      })
      .from(classrooms)
      .where(
        and(
          eq(classrooms.teacherId, teacherId),
          eq(classrooms.isDeleted, false),
        ),
      )
      .orderBy(classrooms.name);
  }
}
