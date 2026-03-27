import type { FastifyRequest, FastifyReply } from "fastify";

const ADMIN_ROLES = ["PLATFORM_ADMIN", "DISTRICT_ADMIN"] as const;

export async function adminOnly(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!request.user) {
    return reply.status(401).send({ error: "Authentication required" });
  }

  if (!ADMIN_ROLES.includes(request.user.role as (typeof ADMIN_ROLES)[number])) {
    return reply.status(403).send({ error: "Admin access required" });
  }
}
