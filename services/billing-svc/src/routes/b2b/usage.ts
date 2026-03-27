import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { authenticate } from "../../middleware/authenticate.js";

export async function contractUsageRoute(app: FastifyInstance) {
  app.get("/billing/b2b/contracts/:id/usage", { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const schema = app.db._.fullSchema;

    const [contract] = await app.db
      .select()
      .from(schema.b2bContracts)
      .where(eq(schema.b2bContracts.id, id));

    if (!contract) {
      return reply.status(404).send({ error: "Contract not found" });
    }

    // Count active learners under this contract's tenant
    const learnerRows = await app.db
      .select()
      .from(schema.learners)
      .where(eq(schema.learners.tenantId, contract.tenantId));

    const seatsUsed = learnerRows.length;

    return reply.status(200).send({
      contractId: contract.id,
      districtName: contract.districtName,
      seatCount: contract.seatCount,
      seatsUsed,
      seatsRemaining: contract.seatCount - seatsUsed,
      status: contract.status,
    });
  });
}
