import type { FastifyInstance } from "fastify";
import { AuthService } from "../../services/auth.service.js";
import { getConfig } from "../../config.js";

export async function refreshRoute(app: FastifyInstance) {
  app.post("/auth/refresh", async (request, reply) => {
    const refreshToken =
      request.cookies?.refresh_token ??
      (request.headers.authorization?.replace("Bearer ", "") || "");

    if (!refreshToken) {
      return reply.status(401).send({ error: "Refresh token required" });
    }

    const authService = new AuthService(app);
    const config = getConfig();
    const result = await authService.refreshSession(refreshToken);

    reply
      .setCookie("access_token", result.accessToken, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60,
      })
      .setCookie("refresh_token", result.refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth/refresh",
        maxAge: 7 * 24 * 60 * 60,
      });

    return reply.status(200).send({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        tenantId: result.user.tenantId,
      },
    });
  });
}
