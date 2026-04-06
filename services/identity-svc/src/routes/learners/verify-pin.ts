import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { LearnerService } from "../../services/learner.service.js";

const paramsSchema = z.object({ learnerId: z.string().uuid() });
const bodySchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits"),
});

export async function verifyLearnerPinRoute(app: FastifyInstance) {
  // PIN verification does NOT require a parent JWT — the learner enters
  // the PIN on a shared device to unlock their dashboard.
  app.post(
    "/learners/:learnerId/pin/verify",
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const { pin } = bodySchema.parse(request.body);
      const learnerService = new LearnerService(app);

      try {
        await learnerService.verifyPin(learnerId, pin);
        // Return a short-lived learner session token
        const token = await app.auth.signAccessToken({
          sub: learnerId,
          role: "LEARNER",
          tenantId: "",
          email: "",
        });
        return reply.send({ success: true, token, learnerId });
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode ?? 401;
        return reply.status(statusCode).send({
          error: (err as Error).message,
        });
      }
    },
  );
}
