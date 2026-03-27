import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { authenticate } from "../../middleware/authenticate.js";

const addSeatsBodySchema = z.object({
  count: z.number().int().positive(),
});

export async function addSeatsRoute(app: FastifyInstance) {
  app.post("/billing/b2b/contracts/:id/seats", { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = addSeatsBodySchema.parse(request.body);

    const schema = app.db._.fullSchema;

    const [contract] = await app.db
      .select()
      .from(schema.b2bContracts)
      .where(eq(schema.b2bContracts.id, id));

    if (!contract) {
      return reply.status(404).send({ error: "Contract not found" });
    }

    const newSeatCount = contract.seatCount + body.count;
    const now = new Date();

    await app.db
      .update(schema.b2bContracts)
      .set({
        seatCount: newSeatCount,
        totalValue: newSeatCount * contract.pricePerSeat * contract.contractTermMonths,
        updatedAt: now,
      })
      .where(eq(schema.b2bContracts.id, id));

    return reply.status(200).send({
      message: `Added ${body.count} seats. New total: ${newSeatCount}`,
      seatCount: newSeatCount,
    });
  });
}
