import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { FastifyInstance } from "fastify";
import { users, learners, learnerTeachers, learnerCaregivers } from "@aivo/db";
import { publishEvent } from "@aivo/events";


// In-memory invitation store (production would use Redis or a DB table)
// Token -> invitation data
export const invitationStore = new Map<
  string,
  {
    token: string;
    type: "TEACHER" | "CAREGIVER";
    email: string;
    name: string;
    learnerId: string;
    tenantId: string;
    invitedBy: string;
    relationship?: string;
    createdAt: Date;
    expiresAt: Date;
  }
>();

export interface InviteTeacherInput {
  email: string;
  name: string;
  learnerId: string;
}

export interface InviteCaregiverInput {
  email: string;
  name: string;
  learnerId: string;
  relationship: string;
}

export class InvitationService {
  constructor(private readonly app: FastifyInstance) {}

  async inviteTeacher(invitedBy: string, tenantId: string, input: InviteTeacherInput) {
    // Validate learner belongs to tenant
    const [learner] = await this.app.db
      .select()
      .from(learners)
      .where(
        and(
          eq(learners.id, input.learnerId),
          eq(learners.tenantId, tenantId),
        ),
      )
      .limit(1);

    if (!learner) {
      throw Object.assign(new Error("Learner not found"), { statusCode: 404 });
    }

    // Enforce 1 teacher slot for B2C
    const existingTeachers = await this.app.db
      .select({ id: learnerTeachers.id })
      .from(learnerTeachers)
      .where(eq(learnerTeachers.learnerId, input.learnerId));

    if (existingTeachers.length >= 1) {
      throw Object.assign(new Error("Teacher slot limit reached (max 1 for B2C)"), { statusCode: 409 });
    }

    // Check pending invitations
    for (const inv of invitationStore.values()) {
      if (
        inv.learnerId === input.learnerId &&
        inv.type === "TEACHER" &&
        inv.expiresAt > new Date()
      ) {
        throw Object.assign(new Error("A pending teacher invitation already exists"), { statusCode: 409 });
      }
    }

    const token = nanoid(48);
    const invitation = {
      token,
      type: "TEACHER" as const,
      email: input.email.toLowerCase(),
      name: input.name,
      learnerId: input.learnerId,
      tenantId,
      invitedBy,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    invitationStore.set(token, invitation);

    await publishEvent(this.app.nats, "identity.user.invited", {
      userId: invitedBy,
      invitedBy,
      role: "TEACHER",
    });

    return invitation;
  }

  async inviteCaregiver(invitedBy: string, tenantId: string, input: InviteCaregiverInput) {
    // Validate learner belongs to tenant
    const [learner] = await this.app.db
      .select()
      .from(learners)
      .where(
        and(
          eq(learners.id, input.learnerId),
          eq(learners.tenantId, tenantId),
        ),
      )
      .limit(1);

    if (!learner) {
      throw Object.assign(new Error("Learner not found"), { statusCode: 404 });
    }

    // Enforce 2 caregiver slots for B2C
    const existingCaregivers = await this.app.db
      .select({ id: learnerCaregivers.id })
      .from(learnerCaregivers)
      .where(eq(learnerCaregivers.learnerId, input.learnerId));

    if (existingCaregivers.length >= 2) {
      throw Object.assign(new Error("Caregiver slot limit reached (max 2 for B2C)"), { statusCode: 409 });
    }

    // Check pending invitations count
    let pendingCount = 0;
    for (const inv of invitationStore.values()) {
      if (
        inv.learnerId === input.learnerId &&
        inv.type === "CAREGIVER" &&
        inv.expiresAt > new Date()
      ) {
        pendingCount++;
      }
    }

    if (existingCaregivers.length + pendingCount >= 2) {
      throw Object.assign(new Error("Caregiver slot limit reached (max 2 for B2C)"), { statusCode: 409 });
    }

    const token = nanoid(48);
    const invitation = {
      token,
      type: "CAREGIVER" as const,
      email: input.email.toLowerCase(),
      name: input.name,
      learnerId: input.learnerId,
      tenantId,
      invitedBy,
      relationship: input.relationship,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    invitationStore.set(token, invitation);

    await publishEvent(this.app.nats, "identity.user.invited", {
      userId: invitedBy,
      invitedBy,
      role: "CAREGIVER",
    });

    return invitation;
  }

  async acceptInvitation(token: string) {
    const invitation = invitationStore.get(token);

    if (!invitation) {
      throw Object.assign(new Error("Invitation not found"), { statusCode: 404 });
    }

    if (invitation.expiresAt < new Date()) {
      invitationStore.delete(token);
      throw Object.assign(new Error("Invitation expired"), { statusCode: 410 });
    }

    // Find or create user
    let [user] = await this.app.db
      .select()
      .from(users)
      .where(eq(users.email, invitation.email))
      .limit(1);

    if (!user) {
      // Create user with the invited role
      [user] = await this.app.db
        .insert(users)
        .values({
          tenantId: invitation.tenantId,
          email: invitation.email,
          name: invitation.name,
          role: invitation.type,
          status: "ACTIVE",
          emailVerifiedAt: new Date(),
        })
        .returning();

      await publishEvent(this.app.nats, "identity.user.created", {
        userId: user.id,
        tenantId: invitation.tenantId,
        role: invitation.type,
        email: user.email,
      });
    }

    // Link to learner
    if (invitation.type === "TEACHER") {
      await this.app.db
        .insert(learnerTeachers)
        .values({
          learnerId: invitation.learnerId,
          teacherUserId: user.id,
        })
        .onConflictDoNothing();
    } else {
      await this.app.db
        .insert(learnerCaregivers)
        .values({
          learnerId: invitation.learnerId,
          caregiverUserId: user.id,
          relationship: invitation.relationship ?? "caregiver",
        })
        .onConflictDoNothing();
    }

    invitationStore.delete(token);

    return { user, invitation };
  }

  listInvitations(tenantId: string) {
    const results: Array<{
      token: string;
      type: string;
      email: string;
      name: string;
      learnerId: string;
      createdAt: Date;
      expiresAt: Date;
    }> = [];

    for (const inv of invitationStore.values()) {
      if (inv.tenantId === tenantId && inv.expiresAt > new Date()) {
        results.push({
          token: inv.token,
          type: inv.type,
          email: inv.email,
          name: inv.name,
          learnerId: inv.learnerId,
          createdAt: inv.createdAt,
          expiresAt: inv.expiresAt,
        });
      }
    }

    return results;
  }
}
