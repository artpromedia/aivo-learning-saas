import Fastify from "fastify";
import { ZodError } from "zod";
import { loadConfig } from "./config.js";
import { observabilityPlugin } from "@aivo/observability";

// Plugins
import dbPlugin from "./plugins/db.js";
import natsPlugin from "./plugins/nats.js";
import redisPlugin from "./plugins/redis.js";
import brainClientPlugin from "./plugins/brain-client.js";

// Routes
import { healthRoutes } from "./routes/health.js";
import { xpSummaryRoute } from "./routes/xp/summary.js";
import { xpHistoryRoute } from "./routes/xp/history.js";
import { getStreakRoute } from "./routes/streaks/get.js";
import { streakFreezeRoute } from "./routes/streaks/freeze.js";
import { earnedBadgesRoute } from "./routes/badges/earned.js";
import { availableBadgesRoute } from "./routes/badges/available.js";
import { badgeProgressRoute } from "./routes/badges/progress.js";
import { shopCatalogRoute } from "./routes/shop/catalog.js";
import { shopPurchaseRoute } from "./routes/shop/purchase.js";
import { shopInventoryRoute } from "./routes/shop/inventory.js";
import { getAvatarRoute } from "./routes/avatar/get.js";
import { updateAvatarRoute } from "./routes/avatar/update.js";
import { createChallengeRoute } from "./routes/challenges/create.js";
import { joinChallengeRoute } from "./routes/challenges/join.js";
import { playChallengeRoute } from "./routes/challenges/play.js";
import { challengeResultRoute } from "./routes/challenges/result.js";
import { listChallengesRoute } from "./routes/challenges/list.js";
import { globalLeaderboardRoute } from "./routes/leaderboard/global.js";
import { classroomLeaderboardRoute } from "./routes/leaderboard/classroom.js";
import { friendsLeaderboardRoute } from "./routes/leaderboard/friends.js";
import { selCheckinRoute } from "./routes/sel/checkin.js";
import { selHistoryRoute } from "./routes/sel/history.js";
import { selBreakRoute } from "./routes/sel/break.js";
import { dailyChallengesRoute } from "./routes/daily/challenges.js";

// Events
import { setupSubscribers } from "./events/subscribers.js";

export async function buildApp() {
  const config = loadConfig();

  const app = Fastify({
    logger: { level: config.NODE_ENV === "production" ? "info" : "debug" },
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "Validation error",
        details: error.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
      });
    }
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500;
    if (statusCode >= 500) app.log.error(error);
    return reply.status(statusCode).send({
      error: statusCode >= 500 ? "Internal server error" : (error as Error).message,
    });
  });

  // Plugins
  await app.register(dbPlugin);
  await app.register(natsPlugin);
  await app.register(redisPlugin);
  await app.register(brainClientPlugin);

  await app.register(observabilityPlugin, {
    serviceName: 'engagement-svc',
    environment: config.NODE_ENV,
    sentryDsn: process.env.SENTRY_DSN,
  });

  // Health
  await app.register(healthRoutes);

  // XP
  await app.register(xpSummaryRoute);
  await app.register(xpHistoryRoute);

  // Streaks
  await app.register(getStreakRoute);
  await app.register(streakFreezeRoute);

  // Badges
  await app.register(earnedBadgesRoute);
  await app.register(availableBadgesRoute);
  await app.register(badgeProgressRoute);

  // Shop
  await app.register(shopCatalogRoute);
  await app.register(shopPurchaseRoute);
  await app.register(shopInventoryRoute);

  // Avatar
  await app.register(getAvatarRoute);
  await app.register(updateAvatarRoute);

  // Challenges
  await app.register(createChallengeRoute);
  await app.register(joinChallengeRoute);
  await app.register(playChallengeRoute);
  await app.register(challengeResultRoute);
  await app.register(listChallengesRoute);

  // Leaderboard
  await app.register(globalLeaderboardRoute);
  await app.register(classroomLeaderboardRoute);
  await app.register(friendsLeaderboardRoute);

  // SEL
  await app.register(selCheckinRoute);
  await app.register(selHistoryRoute);
  await app.register(selBreakRoute);

  // Daily challenges
  await app.register(dailyChallengesRoute);

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
  app.log.info(`engagement-svc listening on port ${config.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
