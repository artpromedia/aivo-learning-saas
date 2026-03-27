import Fastify from "fastify";
import { ZodError } from "zod";
import { loadConfig } from "./config.js";

// Plugins
import dbPlugin from "./plugins/db.js";
import natsPlugin from "./plugins/nats.js";
import redisPlugin from "./plugins/redis.js";
import brainClientPlugin from "./plugins/brain-client.js";
import aiClientPlugin from "./plugins/ai-client.js";

// Routes — Sessions
import { startSessionRoute } from "./routes/sessions/start.js";
import { interactSessionRoute } from "./routes/sessions/interact.js";
import { completeSessionRoute } from "./routes/sessions/complete.js";
import { getSessionRoute } from "./routes/sessions/get.js";
import { sessionHistoryRoute } from "./routes/sessions/history.js";

// Routes — Learning Path
import { getLearningPathRoute } from "./routes/learning-path/get.js";
import { getNextRecommendationRoute } from "./routes/learning-path/next.js";
import { getSpacedReviewRoute } from "./routes/learning-path/spaced-review.js";

// Routes — Gradebook
import { gradebookSummaryRoute } from "./routes/gradebook/summary.js";
import { gradebookSubjectRoute } from "./routes/gradebook/subject.js";
import { gradebookSkillDetailRoute } from "./routes/gradebook/skill-detail.js";

// Routes — Quests
import { questWorldsRoute } from "./routes/quests/worlds.js";
import { questWorldDetailRoute } from "./routes/quests/world-detail.js";
import { startQuestRoute } from "./routes/quests/start.js";
import { questChapterRoute } from "./routes/quests/chapter.js";
import { chapterCompleteRoute } from "./routes/quests/chapter-complete.js";
import { bossAssessmentRoute } from "./routes/quests/boss.js";
import { questProgressRoute } from "./routes/quests/progress.js";

// Routes — Goals
import { listGoalsRoute } from "./routes/goals/list.js";
import { createGoalRoute } from "./routes/goals/create.js";
import { updateGoalRoute } from "./routes/goals/update.js";

// Routes — Health
import { healthRoutes } from "./routes/health.js";

// Events
import { setupSubscribers } from "./events/subscribers.js";

export async function buildApp() {
  const config = loadConfig();

  const app = Fastify({
    logger: {
      level: config.NODE_ENV === "production" ? "info" : "debug",
    },
  });

  // Error handler
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "Validation error",
        details: error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
    }

    const statusCode = (error as { statusCode?: number }).statusCode ?? 500;
    if (statusCode >= 500) {
      app.log.error(error);
    }
    return reply.status(statusCode).send({
      error: statusCode >= 500 ? "Internal server error" : (error as Error).message,
    });
  });

  // Infrastructure plugins
  await app.register(dbPlugin);
  await app.register(natsPlugin);
  await app.register(redisPlugin);
  await app.register(brainClientPlugin);
  await app.register(aiClientPlugin);

  // Health
  await app.register(healthRoutes);

  // Session routes
  await app.register(startSessionRoute);
  await app.register(interactSessionRoute);
  await app.register(completeSessionRoute);
  await app.register(getSessionRoute);
  await app.register(sessionHistoryRoute);

  // Learning path routes
  await app.register(getLearningPathRoute);
  await app.register(getNextRecommendationRoute);
  await app.register(getSpacedReviewRoute);

  // Gradebook routes
  await app.register(gradebookSummaryRoute);
  await app.register(gradebookSubjectRoute);
  await app.register(gradebookSkillDetailRoute);

  // Quest routes
  await app.register(questWorldsRoute);
  await app.register(questWorldDetailRoute);
  await app.register(startQuestRoute);
  await app.register(questChapterRoute);
  await app.register(chapterCompleteRoute);
  await app.register(bossAssessmentRoute);
  await app.register(questProgressRoute);

  // Goal routes
  await app.register(listGoalsRoute);
  await app.register(createGoalRoute);
  await app.register(updateGoalRoute);

  // NATS subscribers
  try {
    await setupSubscribers(app);
  } catch {
    app.log.warn("NATS subscribers could not be set up");
  }

  return app;
}

const config = loadConfig();
const app = await buildApp();

try {
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
  app.log.info(`learning-svc listening on port ${config.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
