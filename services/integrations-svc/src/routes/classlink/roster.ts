import type { FastifyInstance } from "fastify";

export async function classLinkRosterRoute(app: FastifyInstance) {
  app.get(
    "/integrations/classlink/roster/:districtId",
    async (_request, reply) => {
      return reply.status(501).send({ error: "Not implemented" });
    },
  );
}
