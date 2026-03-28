import Fastify from "fastify";
import { ZodError } from "zod";
import { loadConfig } from "./config.js";

// Plugins
import dbPlugin from "./plugins/db.js";
import natsPlugin from "./plugins/nats.js";
import redisPlugin from "./plugins/redis.js";
import brainClientPlugin from "./plugins/brain-client.js";
import identityClientPlugin from "./plugins/identity-client.js";
import s3Plugin from "./plugins/s3.js";

// Routes
import { healthRoutes } from "./routes/health.js";
import { dashboardOverviewRoute } from "./routes/dashboard/overview.js";
import { dashboardSummaryRoute } from "./routes/dashboard/summary.js";
import { listRecommendationsRoute } from "./routes/recommendations/list.js";
import { respondRecommendationRoute } from "./routes/recommendations/respond.js";
import { recommendationHistoryRoute } from "./routes/recommendations/history.js";
import { submitInsightRoute } from "./routes/insights/submit.js";
import { listInsightsRoute } from "./routes/insights/list.js";
import { teacherInsightRecommendationRoute } from "./routes/insights/teacher-insight.js";
import { collaborationMembersRoute } from "./routes/collaboration/members.js";
import { inviteTeacherRoute } from "./routes/collaboration/invite-teacher.js";
import { inviteCaregiverRoute } from "./routes/collaboration/invite-caregiver.js";
import { removeMemberRoute } from "./routes/collaboration/remove-member.js";
import { teacherInsightsRoute } from "./routes/collaboration/teacher-insights.js";
import { iepUploadRoute } from "./routes/iep/upload.js";
import { iepDocumentsRoute } from "./routes/iep/documents.js";
import { iepGoalsRoute } from "./routes/iep/goals.js";
import { iepGoalDetailRoute } from "./routes/iep/goal-detail.js";
import { iepRefreshRoute } from "./routes/iep/refresh.js";
import { brainProfileRoute } from "./routes/brain/profile.js";
import { brainFunctioningLevelRoute } from "./routes/brain/functioning-level.js";
import { brainAccommodationsRoute } from "./routes/brain/accommodations.js";
import { brainVersionsRoute } from "./routes/brain/versions.js";
import { brainExportRoute } from "./routes/brain/export.js";
import { brainRollbackRoute } from "./routes/brain/rollback.js";
import { subscriptionOverviewRoute } from "./routes/subscriptions/overview.js";
import { getSettingsRoute } from "./routes/settings/get.js";
import { updateSettingsRoute } from "./routes/settings/update.js";
import { privacySettingsRoute } from "./routes/settings/privacy.js";
import { dataExportRoute } from "./routes/settings/data-export.js";
import { deleteAllDataRoute } from "./routes/settings/delete-data.js";

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
  await app.register(identityClientPlugin);
  await app.register(s3Plugin);

  // Health
  await app.register(healthRoutes);

  // Dashboard — register summary BEFORE overview to avoid route conflict
  await app.register(dashboardSummaryRoute);
  await app.register(dashboardOverviewRoute);

  // Recommendations
  await app.register(listRecommendationsRoute);
  await app.register(respondRecommendationRoute);
  await app.register(recommendationHistoryRoute);

  // Insights
  await app.register(submitInsightRoute);
  await app.register(listInsightsRoute);
  await app.register(teacherInsightRecommendationRoute);

  // Collaboration
  await app.register(collaborationMembersRoute);
  await app.register(inviteTeacherRoute);
  await app.register(inviteCaregiverRoute);
  await app.register(removeMemberRoute);
  await app.register(teacherInsightsRoute);

  // IEP
  await app.register(iepUploadRoute);
  await app.register(iepDocumentsRoute);
  await app.register(iepGoalsRoute);
  await app.register(iepGoalDetailRoute);
  await app.register(iepRefreshRoute);

  // Brain
  await app.register(brainProfileRoute);
  await app.register(brainFunctioningLevelRoute);
  await app.register(brainAccommodationsRoute);
  await app.register(brainVersionsRoute);
  await app.register(brainExportRoute);
  await app.register(brainRollbackRoute);

  // Subscriptions
  await app.register(subscriptionOverviewRoute);

  // Settings
  await app.register(getSettingsRoute);
  await app.register(updateSettingsRoute);
  await app.register(privacySettingsRoute);

  // Data Lifecycle
  await app.register(dataExportRoute);
  await app.register(deleteAllDataRoute);

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
  app.log.info(`family-svc listening on port ${config.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
