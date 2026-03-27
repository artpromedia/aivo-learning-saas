import { eq, and } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { learners } from "@aivo/db";
import { publishEvent } from "@aivo/events";

export interface CreateLearnerInput {
  name: string;
  dateOfBirth?: Date;
  enrolledGrade?: number;
  schoolName?: string;
  functioningLevel?: "STANDARD" | "SUPPORTED" | "LOW_VERBAL" | "NON_VERBAL" | "PRE_SYMBOLIC";
  communicationMode?: "VERBAL" | "LIMITED_VERBAL" | "NON_VERBAL_AAC" | "NON_VERBAL_PARTNER" | "PRE_INTENTIONAL";
}

export class LearnerService {
  constructor(private readonly app: FastifyInstance) {}

  async create(parentId: string, tenantId: string, input: CreateLearnerInput) {
    const [learner] = await this.app.db
      .insert(learners)
      .values({
        tenantId,
        parentId,
        name: input.name,
        dateOfBirth: input.dateOfBirth,
        enrolledGrade: input.enrolledGrade,
        schoolName: input.schoolName,
        functioningLevel: input.functioningLevel ?? "STANDARD",
        communicationMode: input.communicationMode ?? "VERBAL",
        status: "ACTIVE",
      })
      .returning();

    await publishEvent(this.app.nats, "identity.learner.created", {
      learnerId: learner.id,
      tenantId,
      parentId,
    });

    return learner;
  }

  async listByParent(parentId: string, tenantId: string) {
    return this.app.db
      .select()
      .from(learners)
      .where(
        and(
          eq(learners.parentId, parentId),
          eq(learners.tenantId, tenantId),
        ),
      );
  }

  async getById(learnerId: string, tenantId: string) {
    const [learner] = await this.app.db
      .select()
      .from(learners)
      .where(
        and(
          eq(learners.id, learnerId),
          eq(learners.tenantId, tenantId),
        ),
      )
      .limit(1);

    if (!learner) {
      throw Object.assign(new Error("Learner not found"), { statusCode: 404 });
    }

    return learner;
  }
}
