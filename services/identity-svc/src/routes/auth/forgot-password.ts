import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AuthService } from "../../services/auth.service.js";
import { EmailService } from "../../services/email.service.js";
import { getConfig } from "../../config.js";

const forgotPasswordBodySchema = z.object({
  email: z.string().email().max(320),
});

export async function forgotPasswordRoute(app: FastifyInstance) {
  app.post("/auth/forgot-password", async (request, reply) => {
    const body = forgotPasswordBodySchema.parse(request.body);
    const authService = new AuthService(app);
    const emailService = new EmailService(app);
    const config = getConfig();

    const token = await authService.createPasswordResetToken(body.email);

    // Send reset email if user exists (token is non-empty)
    if (token) {
      await emailService.sendTemplate("password_reset", body.email, {
        recipientName: body.email.split("@")[0],
        resetUrl: `${config.APP_URL}/auth/reset-password?token=${token}`,
      });
    }

    // Always return 200 to not leak user existence
    return reply.status(200).send({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  });
}
