import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { learners } from "@aivo/db";
import { authenticate } from "../../middleware/authenticate.js";
import { QuestService } from "../../services/quest.service.js";

const querySchema = z.object({
  learnerId: z.string().uuid(),
});

export async function questWorldsRoute(app: FastifyInstance) {
  app.get(
    "/learning/quests/worlds",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { learnerId } = querySchema.parse(request.query);

      // Get learner's enrolled grade
      const [learner] = await app.db
        .select()
        .from(learners)
        .where(eq(learners.id, learnerId))
        .limit(1);

      const enrolledGrade = learner?.enrolledGrade ?? null;
      const service = new QuestService(app);
      const worlds = await service.getWorlds(learnerId, enrolledGrade);
      return reply.send({ worlds });
    },
  );
}
