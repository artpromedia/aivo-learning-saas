import type { FastifyInstance } from "fastify";
import { InvitationService } from "../../services/invitation.service.js";

export async function acceptInvitationRoute(app: FastifyInstance) {
  app.post<{ Params: { token: string } }>(
    "/invitations/:token/accept",
    async (request, reply) => {
      const invitationService = new InvitationService(app);
      const { user, invitation } = await invitationService.acceptInvitation(
        request.params.token,
      );

      return reply.status(200).send({
        accepted: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        role: invitation.type,
      });
    },
  );
}
