import type { FastifyInstance } from "fastify";
import { StringCodec } from "nats";
import { WebhookService } from "../services/webhook.service.js";

const sc = StringCodec();

export async function setupSubscribers(app: FastifyInstance) {
  const nc = app.nats;
  const webhookService = new WebhookService(app);

  // lesson.completed → trigger outbound webhooks
  const lessonSub = nc.subscribe("aivo.lesson.completed");
  (async () => {
    for await (const msg of lessonSub) {
      try {
        const data = JSON.parse(sc.decode(msg.data));
        await webhookService.dispatchEvent("learner.session.completed", data);
      } catch (err) {
        app.log.error(err, "Failed to handle lesson.completed for webhooks");
      }
    }
  })();

  // brain.mastery.updated → trigger outbound webhooks
  const masterySub = nc.subscribe("aivo.brain.mastery.updated");
  (async () => {
    for await (const msg of masterySub) {
      try {
        const data = JSON.parse(sc.decode(msg.data));
        await webhookService.dispatchEvent("learner.mastery.updated", data);
      } catch (err) {
        app.log.error(err, "Failed to handle brain.mastery.updated for webhooks");
      }
    }
  })();

  // brain.recommendation.created → trigger outbound webhooks
  const recommendationSub = nc.subscribe("aivo.brain.recommendation.created");
  (async () => {
    for await (const msg of recommendationSub) {
      try {
        const data = JSON.parse(sc.decode(msg.data));
        await webhookService.dispatchEvent("brain.recommendation.created", data);
      } catch (err) {
        app.log.error(err, "Failed to handle brain.recommendation.created for webhooks");
      }
    }
  })();

  // brain.iep_goal.met → trigger outbound webhooks
  const iepGoalSub = nc.subscribe("aivo.brain.iep_goal.met");
  (async () => {
    for await (const msg of iepGoalSub) {
      try {
        const data = JSON.parse(sc.decode(msg.data));
        await webhookService.dispatchEvent("iep.goal.met", data);
      } catch (err) {
        app.log.error(err, "Failed to handle brain.iep_goal.met for webhooks");
      }
    }
  })();

  app.log.info("NATS subscribers initialized for webhook dispatching");

  app.addHook("onClose", async () => {
    lessonSub.unsubscribe();
    masterySub.unsubscribe();
    recommendationSub.unsubscribe();
    iepGoalSub.unsubscribe();
  });
}
