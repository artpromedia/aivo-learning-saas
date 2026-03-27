import type { FastifyRequest, FastifyReply } from "fastify";
import { eq, and, or } from "drizzle-orm";
import { learners, learnerCaregivers, learnerTeachers } from "@aivo/db";

export type LearnerAccessRole = "parent" | "teacher" | "caregiver";

declare module "fastify" {
  interface FastifyRequest {
    learnerAccess?: {
      learnerId: string;
      role: LearnerAccessRole;
    };
  }
}

export function requireLearnerAccess(...allowedAccessRoles: LearnerAccessRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const learnerId = (request.params as { learnerId?: string }).learnerId;
    if (!learnerId) {
      return reply.status(400).send({ error: "Missing learnerId parameter" });
    }

    const userId = request.user.sub;
    const db = request.server.db;

    // Check if parent
    const [learner] = await db
      .select()
      .from(learners)
      .where(eq(learners.id, learnerId))
      .limit(1);

    if (!learner) {
      return reply.status(404).send({ error: "Learner not found" });
    }

    if (learner.parentId === userId) {
      if (!allowedAccessRoles.includes("parent")) {
        return reply.status(403).send({ error: "Access denied for this role" });
      }
      request.learnerAccess = { learnerId, role: "parent" };
      return;
    }

    // Check if teacher
    const [teacherLink] = await db
      .select()
      .from(learnerTeachers)
      .where(
        and(
          eq(learnerTeachers.learnerId, learnerId),
          eq(learnerTeachers.teacherUserId, userId),
        ),
      )
      .limit(1);

    if (teacherLink) {
      if (!allowedAccessRoles.includes("teacher")) {
        return reply.status(403).send({ error: "Teachers cannot perform this action" });
      }
      request.learnerAccess = { learnerId, role: "teacher" };
      return;
    }

    // Check if caregiver
    const [caregiverLink] = await db
      .select()
      .from(learnerCaregivers)
      .where(
        and(
          eq(learnerCaregivers.learnerId, learnerId),
          eq(learnerCaregivers.caregiverUserId, userId),
        ),
      )
      .limit(1);

    if (caregiverLink) {
      if (!allowedAccessRoles.includes("caregiver")) {
        return reply.status(403).send({ error: "Caregivers cannot perform this action" });
      }
      request.learnerAccess = { learnerId, role: "caregiver" };
      return;
    }

    return reply.status(403).send({ error: "No access to this learner" });
  };
}
