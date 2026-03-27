import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { EmailService, type TemplateName } from "../../services/email.service.js";

const internalEmailBodySchema = z.object({
  template: z.enum([
    "welcome",
    "email_verification",
    "password_reset",
    "invitation",
    "caregiver_invite",
    "subscription_confirmation",
  ]),
  recipientEmail: z.string().email().max(320),
  recipientName: z.string().min(1).max(255),
  data: z.record(z.unknown()).default({}),
});

export async function internalEmailRoute(app: FastifyInstance) {
  app.post("/internal/email", async (request, reply) => {
    // Validate internal service key
    const authHeader = request.headers["x-internal-key"];
    const expectedKey = process.env.AUTH_SECRET;

    if (!authHeader || authHeader !== expectedKey) {
      return reply.status(401).send({ error: "Unauthorized internal request" });
    }

    const body = internalEmailBodySchema.parse(request.body);
    const emailService = new EmailService(app);

    const result = await emailService.sendTemplate(
      body.template as TemplateName,
      body.recipientEmail,
      {
        recipientName: body.recipientName,
        ...body.data,
      },
    );

    return reply.status(200).send(result);
  });
}
