import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AuthService } from "../../services/auth.service.js";

const verifyEmailBodySchema = z.object({
  token: z.string().min(1),
});

export async function verifyEmailRoute(app: FastifyInstance) {
  app.post("/auth/verify-email", async (request, reply) => {
    const body = verifyEmailBodySchema.parse(request.body);
    const authService = new AuthService(app);

    const payload = await app.auth.verifyAccessToken(body.token);
    const user = await authService.verifyEmail(payload.sub);

    return reply.status(200).send({
      verified: true,
      user: {
        id: user.id,
        email: user.email,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    });
  });
}
