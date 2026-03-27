import type { FastifyRequest, FastifyReply } from "fastify";

type Role = "PARENT" | "TEACHER" | "CAREGIVER" | "LEARNER" | "DISTRICT_ADMIN" | "PLATFORM_ADMIN";

export function authorize(...allowedRoles: Role[]) {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: "Authentication required" });
    }

    if (!allowedRoles.includes(request.user.role as Role)) {
      return reply.status(403).send({ error: "Insufficient permissions" });
    }
  };
}
