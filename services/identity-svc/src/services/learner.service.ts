import { eq, and } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { learners, districtZipCodes } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import bcrypt from "bcryptjs";

export interface CreateLearnerInput {
  name: string;
  dateOfBirth?: Date;
  enrolledGrade?: number;
  schoolName?: string;
  state?: string;
  zipCode?: string;
  districtId?: string;
  functioningLevel?: "STANDARD" | "SUPPORTED" | "LOW_VERBAL" | "NON_VERBAL" | "PRE_SYMBOLIC";
  communicationMode?: "VERBAL" | "LIMITED_VERBAL" | "NON_VERBAL_AAC" | "NON_VERBAL_PARTNER" | "PRE_INTENTIONAL";
}

export class LearnerService {
  constructor(private readonly app: FastifyInstance) {}

  async resolveDistrictId(zipCode?: string, districtId?: string): Promise<string | undefined> {
    if (zipCode) {
      const [match] = await this.app.db
        .select({ districtId: districtZipCodes.districtId })
        .from(districtZipCodes)
        .where(eq(districtZipCodes.zipCode, zipCode))
        .limit(1);

      return match?.districtId ?? undefined;
    }

    return undefined;
  }

  async create(parentId: string, tenantId: string, input: CreateLearnerInput) {
    const resolvedDistrictId = await this.resolveDistrictId(input.zipCode, input.districtId);

    const [learner] = await this.app.db
      .insert(learners)
      .values({
        tenantId,
        parentId,
        name: input.name,
        dateOfBirth: input.dateOfBirth,
        enrolledGrade: input.enrolledGrade,
        schoolName: input.schoolName,
        state: input.state,
        zipCode: input.zipCode,
        districtId: resolvedDistrictId,
        functioningLevel: input.functioningLevel ?? "STANDARD",
        communicationMode: input.communicationMode ?? "VERBAL",
        status: "ACTIVE",
      })
      .returning();

    await publishEvent(this.app.nats, "identity.learner.created", {
      learnerId: learner.id,
      tenantId,
      parentId,
    }).catch((err: unknown) => {
      this.app.log.warn({ err }, "Failed to publish learner.created event");
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

  async setPin(learnerId: string, tenantId: string, pin: string) {
    if (!/^\d{4,6}$/.test(pin)) {
      throw Object.assign(new Error("PIN must be 4-6 digits"), { statusCode: 400 });
    }
    const pinHash = await bcrypt.hash(pin, 10);
    const [updated] = await this.app.db
      .update(learners)
      .set({ pinHash, pinSetAt: new Date(), updatedAt: new Date() })
      .where(and(eq(learners.id, learnerId), eq(learners.tenantId, tenantId)))
      .returning();
    if (!updated) {
      throw Object.assign(new Error("Learner not found"), { statusCode: 404 });
    }
    return { success: true, pinSetAt: updated.pinSetAt };
  }

  async verifyPin(learnerId: string, pin: string): Promise<boolean> {
    const [learner] = await this.app.db
      .select({ pinHash: learners.pinHash })
      .from(learners)
      .where(eq(learners.id, learnerId))
      .limit(1);
    if (!learner?.pinHash) {
      throw Object.assign(new Error("No PIN set for this learner"), { statusCode: 400 });
    }
    const valid = await bcrypt.compare(pin, learner.pinHash);
    if (!valid) {
      throw Object.assign(new Error("Invalid PIN"), { statusCode: 401 });
    }
    return true;
  }

  async hasPin(learnerId: string): Promise<boolean> {
    const [learner] = await this.app.db
      .select({ pinHash: learners.pinHash })
      .from(learners)
      .where(eq(learners.id, learnerId))
      .limit(1);
    return !!learner?.pinHash;
  }
}
