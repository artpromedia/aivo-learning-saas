import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { tenantContext } from "../../middleware/tenant-context.js";
import { InvitationService } from "../../services/invitation.service.js";

export async function listInvitationsRoute(app: FastifyInstance) {
  app.get(
    "/invitations",
    { preHandler: [authenticate, tenantContext] },
    async (request, reply) => {
      const invitationService = new InvitationService(app);
      const invitations = invitationService.listInvitations(request.tenantId);

      return reply.status(200).send({ invitations });
    },
  );
}
