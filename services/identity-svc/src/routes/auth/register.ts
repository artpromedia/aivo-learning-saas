import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AuthService } from "../../services/auth.service.js";
import { EmailService } from "../../services/email.service.js";
import { getConfig } from "../../config.js";

const registerBodySchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(255),
  role: z.enum(["PARENT", "TEACHER"]).optional(),
});

export async function registerRoute(app: FastifyInstance) {
  app.post("/auth/register", async (request, reply) => {
    const body = registerBodySchema.parse(request.body);
    const authService = new AuthService(app);
    const emailService = new EmailService(app);
    const config = getConfig();

    const { user, tenant, session } = await authService.register(body);

    // Send welcome email
    await emailService.sendTemplate("welcome", user.email, {
      recipientName: user.name,
    });

    // Send verification email
    const verificationToken = session.accessToken;
    await emailService.sendTemplate("email_verification", user.email, {
      recipientName: user.name,
      verificationUrl: `${config.APP_URL}/auth/verify-email?token=${verificationToken}`,
    });

    reply
      .setCookie("access_token", session.accessToken, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60, // 15 minutes
      })
      .setCookie("refresh_token", session.refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth/refresh",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      })
      .setCookie("user_role", user.role, {
        httpOnly: false,
        secure: config.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

    return reply.status(201).send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: tenant.id,
      },
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
  });
}
