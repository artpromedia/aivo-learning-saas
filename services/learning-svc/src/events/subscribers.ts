import type { FastifyInstance } from "fastify";
import { subscribeEvent, BRAIN_SCHEMAS, type Subscription } from "@aivo/events";
import { LearningPathService } from "../services/learning-path.service.js";
import { GoalService } from "../services/goal.service.js";

export async function setupSubscribers(app: FastifyInstance): Promise<void> {
  const nc = app.nats;
  const subs: Subscription[] = [];

  // brain.cloned → initialize first learning path for new learner
  try {
    const sub = await subscribeEvent(
      nc,
      "brain.cloned",
      BRAIN_SCHEMAS["brain.cloned"],
      async (data) => {
        app.log.info({ data }, "Received brain.cloned — initializing learning path");
        try {
          const pathService = new LearningPathService(app);
          await pathService.initializeForNewLearner(data.learnerId);
          app.log.info({ learnerId: data.learnerId }, "Learning path initialized for new learner");
        } catch (err) {
          app.log.error({ err, data }, "Failed to initialize learning path for new learner");
        }
      },
    );
    subs.push(sub);
  } catch {
    app.log.warn("Could not subscribe to brain.cloned");
  }

  // brain.mastery.updated → recalculate learning path priorities
  try {
    const sub = await subscribeEvent(
      nc,
      "brain.mastery.updated",
      BRAIN_SCHEMAS["brain.mastery.updated"],
      async (data) => {
        app.log.info({ data }, "Received brain.mastery.updated — refreshing goals");
        try {
          const goalService = new GoalService(app);
          await goalService.refreshMastery(data.learnerId);
        } catch (err) {
          app.log.error({ err, data }, "Failed to refresh goals after mastery update");
        }
      },
    );
    subs.push(sub);
  } catch {
    app.log.warn("Could not subscribe to brain.mastery.updated");
  }

  // Clean up on close
  app.addHook("onClose", async () => {
    for (const sub of subs) {
      sub.unsubscribe();
    }
  });

  app.log.info("Learning-svc NATS subscribers set up");
}
