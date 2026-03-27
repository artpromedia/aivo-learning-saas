import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { subscribeEvent, BRAIN_SCHEMAS } from "@aivo/events";
import { publishEvent } from "@aivo/events";
import { brainStates, learners, users } from "@aivo/db";
import { RecommendationService } from "../services/recommendation.service.js";

export async function setupSubscribers(app: FastifyInstance): Promise<void> {
  const nc = app.nats;
  const recService = new RecommendationService(app);

  // brain.recommendation.created → store locally + notify parent
  try {
    await subscribeEvent(nc, "brain.recommendation.created", BRAIN_SCHEMAS["brain.recommendation.created"], async (data) => {
      app.log.info({ data }, "Received brain.recommendation.created");
      try {
        const [brainState] = await app.db
          .select()
          .from(brainStates)
          .where(eq(brainStates.learnerId, data.learnerId))
          .limit(1);

        if (brainState) {
          await recService.createRecommendation({
            learnerId: data.learnerId,
            brainStateId: brainState.id,
            type: data.type as Parameters<typeof recService.createRecommendation>[0]["type"],
            description: `Recommendation: ${recService.getDefaultTitle(data.type)}`,
            payload: {},
          });

          // Notify parent
          const [learner] = await app.db
            .select()
            .from(learners)
            .where(eq(learners.id, data.learnerId))
            .limit(1);

          if (learner) {
            await publishEvent(nc, "comms.notification.created", {
              userId: learner.parentId,
              type: "recommendation_pending",
              title: `New recommendation for ${learner.name}`,
              body: recService.getDefaultTitle(data.type),
            });
          }
        }
      } catch (err) {
        app.log.error({ err, data }, "Failed to process brain.recommendation.created");
      }
    });
  } catch { app.log.warn("Could not subscribe to brain.recommendation.created"); }

  // brain.iep_goal.met → create iep_goal_met recommendation
  try {
    await subscribeEvent(nc, "brain.iep_goal.met", BRAIN_SCHEMAS["brain.iep_goal.met"], async (data) => {
      app.log.info({ data }, "Received brain.iep_goal.met");
      try {
        const [brainState] = await app.db
          .select()
          .from(brainStates)
          .where(eq(brainStates.learnerId, data.learnerId))
          .limit(1);

        if (brainState) {
          await recService.createRecommendation({
            learnerId: data.learnerId,
            brainStateId: brainState.id,
            type: "IEP_GOAL_UPDATE",
            title: `IEP Goal Met: ${data.goalText}`,
            description: `Your child has met the IEP goal: "${data.goalText}". Would you like to update the goal or set a new target?`,
            payload: { goalId: data.goalId, goalText: data.goalText },
          });
        }
      } catch (err) {
        app.log.error({ err, data }, "Failed to process brain.iep_goal.met");
      }
    });
  } catch { app.log.warn("Could not subscribe to brain.iep_goal.met"); }

  // brain.cloned → create initial brain_profile_review recommendation
  try {
    await subscribeEvent(nc, "brain.cloned", BRAIN_SCHEMAS["brain.cloned"], async (data) => {
      app.log.info({ data }, "Received brain.cloned");
      try {
        await recService.createRecommendation({
          learnerId: data.learnerId,
          brainStateId: data.brainStateId,
          type: "ASSESSMENT_REBASELINE",
          title: "Review your child's Brain profile",
          description: "Your child's Brain has been initialized. Please review the profile to ensure accuracy.",
          payload: { functioningLevel: data.functioningLevel },
        });
      } catch (err) {
        app.log.error({ err, data }, "Failed to process brain.cloned");
      }
    });
  } catch { app.log.warn("Could not subscribe to brain.cloned"); }

  // brain.regression.detected → create regression_alert recommendation
  try {
    await subscribeEvent(nc, "brain.regression.detected", BRAIN_SCHEMAS["brain.regression.detected"], async (data) => {
      app.log.info({ data }, "Received brain.regression.detected");
      try {
        const [brainState] = await app.db
          .select()
          .from(brainStates)
          .where(eq(brainStates.learnerId, data.learnerId))
          .limit(1);

        if (brainState) {
          await recService.createRecommendation({
            learnerId: data.learnerId,
            brainStateId: brainState.id,
            type: "REGRESSION_ALERT",
            title: `Skill regression detected in ${data.domain}`,
            description: `A ${data.dropPercent}% drop in ${data.domain} performance was detected. Would you like to adjust the learning path?`,
            payload: { domain: data.domain, dropPercent: data.dropPercent },
          });
        }
      } catch (err) {
        app.log.error({ err, data }, "Failed to process brain.regression.detected");
      }
    });
  } catch { app.log.warn("Could not subscribe to brain.regression.detected"); }

  app.log.info("Family-svc NATS subscribers set up");
}
