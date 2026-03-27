import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { tenantContext } from "../../middleware/tenant-context.js";
import { InvitationService } from "../../services/invitation.service.js";
import { EmailService } from "../../services/email.service.js";
import { LearnerService } from "../../services/learner.service.js";
import { UserService } from "../../services/user.service.js";
import { getConfig } from "../../config.js";

const inviteTeacherBodySchema = z.object({
  email: z.string().email().max(320),
  name: z.string().min(1).max(255),
  learnerId: z.string().uuid(),
});

export async function inviteTeacherRoute(app: FastifyInstance) {
  app.post(
    "/invitations/teacher",
    { preHandler: [authenticate, authorize("PARENT", "DISTRICT_ADMIN", "PLATFORM_ADMIN"), tenantContext] },
    async (request, reply) => {
      const body = inviteTeacherBodySchema.parse(request.body);
      const invitationService = new InvitationService(app);
      const emailService = new EmailService(app);
      const learnerService = new LearnerService(app);
      const userService = new UserService(app);
      const config = getConfig();

      const invitation = await invitationService.inviteTeacher(
        request.user.sub,
        request.tenantId,
        body,
      );

      const learner = await learnerService.getById(body.learnerId, request.tenantId);
      const inviter = await userService.getById(request.user.sub);

      await emailService.sendTemplate("invitation", body.email, {
        recipientName: body.name,
        inviterName: inviter.name,
        learnerName: learner.name,
        acceptUrl: `${config.APP_URL}/invitations/accept?token=${invitation.token}`,
      });

      return reply.status(201).send({
        invitation: {
          token: invitation.token,
          type: invitation.type,
          email: invitation.email,
          expiresAt: invitation.expiresAt,
        },
      });
    },
  );
}
