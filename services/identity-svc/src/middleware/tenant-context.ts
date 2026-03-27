import type { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    tenantId: string;
  }
}

export async function tenantContext(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (request.user?.tenantId) {
    request.tenantId = request.user.tenantId;
    return;
  }

  const headerTenantId = request.headers["x-tenant-id"];
  if (typeof headerTenantId === "string" && headerTenantId.length > 0) {
    request.tenantId = headerTenantId;
    return;
  }

  return reply.status(400).send({ error: "Tenant context required" });
}
