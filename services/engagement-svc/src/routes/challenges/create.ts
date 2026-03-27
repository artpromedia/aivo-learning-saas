import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { ChallengeService } from "../../services/challenge.service.js";

const bodySchema = z.object({
  learnerId: z.string().uuid(),
  learnerName: z.string().min(1),
  subject: z.string().min(1),
  questions: z.array(z.object({
    id: z.string(),
    prompt: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.string(),
    timeLimitMs: z.number().int().positive().default(5000),
  })).min(1).max(10),
});

export async function createChallengeRoute(app: FastifyInstance) {
  app.post("/engagement/challenges/create", { preHandler: [authenticate] }, async (request, reply) => {
    const body = bodySchema.parse(request.body);
    const service = new ChallengeService(app);
    const challenge = await service.createChallenge(body.learnerId, body.learnerName, body.subject, body.questions);
    return reply.status(201).send(challenge);
  });
}
