import type { FastifyRequest, FastifyReply } from "fastify";

export function authorize(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      return reply.status(401).send({ error: "Authentication required" });
    }
    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({ error: "Insufficient permissions" });
    }
  };
}
