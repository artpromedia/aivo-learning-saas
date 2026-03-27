import type { FastifyInstance } from "fastify";
import { LtiService } from "../../services/lti.service.js";

export async function ltiJwksRoute(app: FastifyInstance) {
  app.get("/integrations/lti/jwks.json", async (_request, reply) => {
    const service = new LtiService(app);
    const jwks = await service.getJwks();
    return reply.header("content-type", "application/json").send(jwks);
  });
}
