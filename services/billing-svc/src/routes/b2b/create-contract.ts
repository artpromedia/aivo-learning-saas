import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const createContractBodySchema = z.object({
  districtName: z.string().min(1).max(255),
  seatCount: z.number().int().positive(),
  contractTermMonths: z.number().int().positive(),
  pricePerSeat: z.number().nonnegative(),
});

export async function createContractRoute(app: FastifyInstance) {
  app.post(
    "/billing/b2b/contracts",
    { preHandler: [authenticate, authorize("DISTRICT_ADMIN", "PLATFORM_ADMIN")] },
    async (request, reply) => {
      const body = createContractBodySchema.parse(request.body);
      const now = new Date();

      const contractEndDate = new Date(now);
      contractEndDate.setMonth(contractEndDate.getMonth() + body.contractTermMonths);

      // Insert b2b contract record
      const [contract] = await app.db
        .insert(app.db._.fullSchema.b2bContracts)
        .values({
          tenantId: request.user.tenantId,
          districtName: body.districtName,
          seatCount: body.seatCount,
          contractTermMonths: body.contractTermMonths,
          pricePerSeat: body.pricePerSeat,
          totalValue: body.seatCount * body.pricePerSeat * body.contractTermMonths,
          status: "ACTIVE",
          startDate: now,
          endDate: contractEndDate,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return reply.status(201).send({ contract });
    },
  );
}
