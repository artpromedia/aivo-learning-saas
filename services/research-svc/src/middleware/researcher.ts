import type { FastifyRequest, FastifyReply } from "fastify";

const RESEARCHER_ROLES = ["PLATFORM_ADMIN"] as const;

export async function researcherOnly(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!request.user) {
    return reply.status(401).send({ error: "Authentication required" });
  }

  if (!RESEARCHER_ROLES.includes(request.user.role as (typeof RESEARCHER_ROLES)[number])) {
    return reply.status(403).send({ error: "Researcher access required" });
  }
}
