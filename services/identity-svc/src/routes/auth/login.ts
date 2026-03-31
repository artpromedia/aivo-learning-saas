import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AuthService } from "../../services/auth.service.js";
import { getConfig } from "../../config.js";

const loginBodySchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(128),
});

export async function loginRoute(app: FastifyInstance) {
  app.post("/auth/login", async (request, reply) => {
    const body = loginBodySchema.parse(request.body);
    const authService = new AuthService(app);
    const config = getConfig();

    const { user, session } = await authService.login(body);

    reply
      .setCookie("access_token", session.accessToken, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60,
      })
      .setCookie("refresh_token", session.refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth/refresh",
        maxAge: 7 * 24 * 60 * 60,
      });

    return reply.status(200).send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
  });
}
