import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import {
  PARENT_ASSESSMENT_QUESTIONS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  getQuestionsByCategory,
} from "../../lib/parent-assessment-questions.js";

export async function parentQuestionsRoute(app: FastifyInstance) {
  app.get(
    "/assessment/parent/questions",
    { preHandler: [authenticate] },
    async (_request, reply) => {
      const grouped = getQuestionsByCategory();

      const categories = CATEGORY_ORDER.map((key) => ({
        key,
        label: CATEGORY_LABELS[key],
        questions: grouped[key] ?? [],
      }));

      return reply.send({
        totalQuestions: PARENT_ASSESSMENT_QUESTIONS.length,
        categories,
      });
    },
  );
}
