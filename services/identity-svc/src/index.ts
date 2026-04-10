import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { ZodError } from "zod";

import { loadConfig } from "./config.js";
import { observabilityPlugin } from "@aivo/observability";

// Plugins
import dbPlugin from "./plugins/db.js";
import natsPlugin from "./plugins/nats.js";
import emailPlugin from "./plugins/email.js";
import authPlugin from "./plugins/auth.js";

// Routes — Auth
import { registerRoute } from "./routes/auth/register.js";
import { loginRoute } from "./routes/auth/login.js";
import { logoutRoute } from "./routes/auth/logout.js";
import { oauthCallbackRoute } from "./routes/auth/oauth-callback.js";
import { verifyEmailRoute } from "./routes/auth/verify-email.js";
import { forgotPasswordRoute } from "./routes/auth/forgot-password.js";
import { resetPasswordRoute } from "./routes/auth/reset-password.js";
import { changePasswordRoute } from "./routes/auth/change-password.js";
import { refreshRoute } from "./routes/auth/refresh.js";
import { sessionRoute } from "./routes/auth/session.js";

// Routes — Users
import { meRoute } from "./routes/users/me.js";
import { updateProfileRoute } from "./routes/users/update-profile.js";
import { deleteAccountRoute } from "./routes/users/delete-account.js";

// Routes — Tenants
import { createTenantRoute } from "./routes/tenants/create.js";
import { getTenantRoute } from "./routes/tenants/get.js";
import { updateTenantRoute } from "./routes/tenants/update.js";

// Routes — Learners
import { createLearnerRoute } from "./routes/learners/create.js";
import { listLearnersRoute } from "./routes/learners/list.js";
import { getLearnerRoute } from "./routes/learners/get.js";
import { setLearnerPinRoute } from "./routes/learners/set-pin.js";
import { verifyLearnerPinRoute } from "./routes/learners/verify-pin.js";

// Routes — Invitations
import { inviteTeacherRoute } from "./routes/invitations/invite-teacher.js";
import { inviteCaregiverRoute } from "./routes/invitations/invite-caregiver.js";
import { acceptInvitationRoute } from "./routes/invitations/accept.js";
import { listInvitationsRoute } from "./routes/invitations/list.js";

// Routes — Internal
import { internalEmailRoute } from "./routes/internal/email.js";

// Routes — Onboarding
import { baselineRoutes } from "./routes/onboarding/baseline.js";
import { onboardingCompleteRoute } from "./routes/onboarding/complete.js";

// Routes — Brain Proxy (API Gateway → brain-svc)
import { brainProxyRoutes } from "./routes/brain-proxy.js";

// Routes — Notifications Proxy (API Gateway → comms-svc)
import { notificationsProxyRoutes } from "./routes/notifications-proxy.js";

// Routes — Health
import { healthRoutes } from "./routes/health.js";
import { billingProxyRoutes } from "./routes/billing-proxy.js";

// Routes — Assessment Proxy (API Gateway → assessment-svc)
import { assessmentProxyRoutes } from "./routes/assessment-proxy.js";

// Routes — Family Proxy (API Gateway → family-svc)
import { familyProxyRoutes } from "./routes/family-proxy.js";

// Routes — Tutor Proxy (API Gateway → tutor-svc)
import { tutorProxyRoutes } from "./routes/tutor-proxy.js";

// Routes — Learning Proxy (API Gateway → learning-svc)
import { learningProxyRoutes } from "./routes/learning-proxy.js";

// Routes — Engagement Proxy (API Gateway → engagement-svc)
import { engagementProxyRoutes } from "./routes/engagement-proxy.js";

// Routes — District Lookup
import { districtLookupRoute } from "./routes/districts/lookup.js";

// Routes — Test support (non-production only)
import { testSupportRoutes } from "./routes/test-support.js";

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

  // Core plugins
  await app.register(cookie);
  const corsOrigins = config.CORS_ORIGINS
    ? config.CORS_ORIGINS.split(",").map(s => s.trim())
    : [config.APP_URL];
  await app.register(cors, {
    origin: corsOrigins,
    credentials: true,
  });
  await app.register(rateLimit, {
    max: config.NODE_ENV === "test" ? 10_000 : 100,
    timeWindow: "1 minute",
  });

  // Capture raw body for JSON requests (needed for Stripe webhook signature
  // verification when proxying to billing-svc).
  app.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (req, body, done) => {
      (req as any).rawBody = body;
      try {
        done(null, JSON.parse(body as string));
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  // Allow multipart/form-data to pass through unparsed for proxy routes
  // (e.g. homework upload). The body is streamed raw to the downstream service.
  app.addContentTypeParser("multipart/form-data", function (_request, _payload, done) {
    done(null);
  });

  // Infrastructure plugins
  await app.register(dbPlugin);
  await app.register(natsPlugin);
  await app.register(emailPlugin);
  await app.register(authPlugin);

  await app.register(observabilityPlugin, {
    serviceName: 'identity-svc',
    environment: config.NODE_ENV,
    sentryDsn: process.env.SENTRY_DSN,
  });

  // Register routes
  await app.register(healthRoutes);

  // Test-support routes — only in test environments, no /api prefix
  if (config.NODE_ENV === "test") {
    await app.register(testSupportRoutes);
  }

  await app.register(async function apiRoutes(api) {
    await api.register(registerRoute);
    await api.register(loginRoute);
    await api.register(logoutRoute);
    await api.register(oauthCallbackRoute);
    await api.register(verifyEmailRoute);
    await api.register(forgotPasswordRoute);
    await api.register(resetPasswordRoute);
    await api.register(changePasswordRoute);
    await api.register(refreshRoute);
    await api.register(sessionRoute);
    await api.register(meRoute);
    await api.register(updateProfileRoute);
    await api.register(deleteAccountRoute);
    await api.register(createTenantRoute);
    await api.register(getTenantRoute);
    await api.register(updateTenantRoute);
    await api.register(createLearnerRoute);
    await api.register(listLearnersRoute);
    await api.register(getLearnerRoute);
    await api.register(setLearnerPinRoute);
    await api.register(verifyLearnerPinRoute);
    await api.register(inviteTeacherRoute);
    await api.register(inviteCaregiverRoute);
    await api.register(acceptInvitationRoute);
    await api.register(listInvitationsRoute);
    await api.register(internalEmailRoute);
    await api.register(baselineRoutes);
    await api.register(onboardingCompleteRoute);
    await api.register(brainProxyRoutes);
    await api.register(billingProxyRoutes);
    await api.register(notificationsProxyRoutes);
    await api.register(assessmentProxyRoutes);
    await api.register(tutorProxyRoutes);
    await api.register(learningProxyRoutes);
    await api.register(engagementProxyRoutes);
    await api.register(districtLookupRoute);
  }, { prefix: "/api" });

  // Register at root level for direct /family/* access (used by e2e + family-svc clients)
  await app.register(familyProxyRoutes);

  return app;
}

const config = loadConfig();
const app = await buildApp();

try {
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
  app.log.info(`identity-svc listening on port ${config.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
