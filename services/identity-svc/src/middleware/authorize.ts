import type { FastifyRequest, FastifyReply } from "fastify";

type Role = "PARENT" | "TEACHER" | "CAREGIVER" | "LEARNER" | "DISTRICT_ADMIN" | "PLATFORM_ADMIN";

export function authorize(...allowedRoles: Role[]) {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: "Authentication required" });
    }

    const normalizedRole = (request.user.role as string).toUpperCase() as Role;
    if (!allowedRoles.includes(normalizedRole)) {
      return reply.status(403).send({ error: "Insufficient permissions" });
    }
  };
}
