import type { FastifyInstance } from "fastify";
import { LtiService } from "../../services/lti.service.js";

export async function ltiLoginRoute(app: FastifyInstance) {
  app.post("/integrations/lti/login", async (request, reply) => {
    const { iss, login_hint, target_link_uri, client_id, lti_message_hint } =
      request.body as {
        iss: string;
        login_hint: string;
        target_link_uri: string;
        client_id: string;
        lti_message_hint: string;
      };

    const service = new LtiService(app);
    const redirectUrl = await service.initiateLogin({
      iss,
      login_hint,
      target_link_uri,
      client_id,
      lti_message_hint,
    });

    return reply.redirect(redirectUrl);
  });
}
