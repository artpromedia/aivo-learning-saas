import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

export async function createTenantRoute(app: FastifyInstance) {
  // Auto-tenant creation happens during registration.
  // This endpoint is for DISTRICT_ADMIN creating B2B tenants.
  app.post(
    "/tenants",
    { preHandler: [authenticate, authorize("PLATFORM_ADMIN", "DISTRICT_ADMIN")] },
    async (request, reply) => {
      const { name, type } = request.body as { name: string; type: string };

      if (!name || !type) {
        return reply.status(400).send({ error: "name and type are required" });
      }

      const { nanoid } = await import("nanoid");
      const { tenants } = await import("@aivo/db");

      const slug = `${type.toLowerCase()}-${nanoid(10)}`;

      const [tenant] = await app.db
        .insert(tenants)
        .values({
          name,
          slug,
          type: type as "B2C_FAMILY" | "B2B_DISTRICT",
          status: "ACTIVE",
        })
        .returning();

      return reply.status(201).send({ tenant });
    },
  );
}
