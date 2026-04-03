import type { FastifyInstance } from "fastify";
import { AuthService } from "../../services/auth.service.js";

export async function logoutRoute(app: FastifyInstance) {
  app.post("/auth/logout", async (request, reply) => {
    const sessionToken =
      request.cookies?.access_token ??
      request.headers.authorization?.replace("Bearer ", "");
    if (sessionToken) {
      const authService = new AuthService(app);
      await authService.logout(sessionToken);
    }

    reply
      .clearCookie("access_token", { path: "/" })
      .clearCookie("refresh_token", { path: "/api/auth/refresh" })
      .clearCookie("user_role", { path: "/" });

    return reply.status(200).send({ success: true });
  });
}
