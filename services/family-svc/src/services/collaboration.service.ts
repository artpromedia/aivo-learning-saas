import type { FastifyInstance } from "fastify";
import { eq, and } from "drizzle-orm";
import { learners, learnerCaregivers, learnerTeachers, users, tenants } from "@aivo/db";

const MAX_TEACHERS_B2C = 1;
const MAX_CAREGIVERS_B2C = 2;

export interface CollaborationMember {
  userId: string;
  name: string;
  email: string;
  role: string;
  status: string;
  relationship?: string;
  invitedAt: string;
  acceptedAt: string | null;
}

export class CollaborationService {
  constructor(private readonly app: FastifyInstance) {}

  async getMembers(learnerId: string): Promise<CollaborationMember[]> {
    const members: CollaborationMember[] = [];

    // Get teachers
    const teacherLinks = await this.app.db
      .select({
        teacher: learnerTeachers,
        user: users,
      })
      .from(learnerTeachers)
      .innerJoin(users, eq(learnerTeachers.teacherUserId, users.id))
      .where(eq(learnerTeachers.learnerId, learnerId));

    for (const { teacher, user } of teacherLinks) {
      members.push({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: "TEACHER",
        status: teacher.acceptedAt ? "ACCEPTED" : "INVITED",
        invitedAt: teacher.invitedAt.toISOString(),
        acceptedAt: teacher.acceptedAt?.toISOString() ?? null,
      });
    }

    // Get caregivers
    const caregiverLinks = await this.app.db
      .select({
        caregiver: learnerCaregivers,
        user: users,
      })
      .from(learnerCaregivers)
      .innerJoin(users, eq(learnerCaregivers.caregiverUserId, users.id))
      .where(eq(learnerCaregivers.learnerId, learnerId));

    for (const { caregiver, user } of caregiverLinks) {
      members.push({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: "CAREGIVER",
        status: caregiver.acceptedAt ? "ACCEPTED" : "INVITED",
        relationship: caregiver.relationship,
        invitedAt: caregiver.invitedAt.toISOString(),
        acceptedAt: caregiver.acceptedAt?.toISOString() ?? null,
      });
    }

    return members;
  }

  async inviteTeacher(
    learnerId: string,
    invitedBy: string,
    email: string,
  ): Promise<{ invitationId: string }> {
    // Check tenant type and slot limits
    await this.enforceSlotLimit(learnerId, "TEACHER");

    return this.app.identityClient.sendInvitation({
      invitedBy,
      email,
      role: "TEACHER",
      learnerId,
    });
  }

  async inviteCaregiver(
    learnerId: string,
    invitedBy: string,
    email: string,
    relationship: string,
  ): Promise<{ invitationId: string }> {
    await this.enforceSlotLimit(learnerId, "CAREGIVER");

    return this.app.identityClient.sendInvitation({
      invitedBy,
      email,
      role: "CAREGIVER",
      learnerId,
      relationship,
    });
  }

  async removeMember(learnerId: string, userId: string): Promise<void> {
    // Remove from teacher links
    await this.app.db
      .delete(learnerTeachers)
      .where(
        and(
          eq(learnerTeachers.learnerId, learnerId),
          eq(learnerTeachers.teacherUserId, userId),
        ),
      );

    // Remove from caregiver links
    await this.app.db
      .delete(learnerCaregivers)
      .where(
        and(
          eq(learnerCaregivers.learnerId, learnerId),
          eq(learnerCaregivers.caregiverUserId, userId),
        ),
      );

    await this.app.identityClient.revokeAccess(userId, learnerId);
  }

  private async enforceSlotLimit(learnerId: string, role: "TEACHER" | "CAREGIVER"): Promise<void> {
    // Get learner's tenant type
    const [learner] = await this.app.db
      .select({ tenantId: learners.tenantId })
      .from(learners)
      .where(eq(learners.id, learnerId))
      .limit(1);

    if (!learner) throw Object.assign(new Error("Learner not found"), { statusCode: 404 });

    const [tenant] = await this.app.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, learner.tenantId))
      .limit(1);

    // B2B districts have different rules — skip enforcement
    if (tenant?.type === "B2B_DISTRICT") return;

    if (role === "TEACHER") {
      const existing = await this.app.db
        .select()
        .from(learnerTeachers)
        .where(eq(learnerTeachers.learnerId, learnerId));

      if (existing.length >= MAX_TEACHERS_B2C) {
        throw Object.assign(
          new Error(`Maximum ${MAX_TEACHERS_B2C} teacher(s) allowed for B2C families`),
          { statusCode: 409 },
        );
      }
    }

    if (role === "CAREGIVER") {
      const existing = await this.app.db
        .select()
        .from(learnerCaregivers)
        .where(eq(learnerCaregivers.learnerId, learnerId));

      if (existing.length >= MAX_CAREGIVERS_B2C) {
        throw Object.assign(
          new Error(`Maximum ${MAX_CAREGIVERS_B2C} caregiver(s) allowed for B2C families`),
          { statusCode: 409 },
        );
      }
    }
  }
}
