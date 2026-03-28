import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AuthService } from "../../services/auth.service.js";

const resetPasswordBodySchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export async function resetPasswordRoute(app: FastifyInstance) {
  app.post("/auth/reset-password", async (request, reply) => {
    const body = resetPasswordBodySchema.parse(request.body);
    const authService = new AuthService(app);

    await authService.resetPassword(body.token, body.password);

    reply
      .clearCookie("access_token", { path: "/" })
      .clearCookie("refresh_token", { path: "/api/auth/refresh" });

    return reply.status(200).send({
      message: "Password has been reset. Please log in with your new password.",
    });
  });
}
