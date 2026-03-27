import type { FastifyInstance } from "fastify";
import { subscribeEvent, BILLING_SCHEMAS } from "@aivo/events";

export async function setupSubscribers(app: FastifyInstance): Promise<void> {
  const nc = app.nats;

  // billing.payment.succeeded
  try {
    await subscribeEvent(nc, "billing.payment.succeeded", BILLING_SCHEMAS["billing.payment.succeeded"], async (data) => {
      app.log.info({ data }, "Received billing.payment.succeeded");
      // Handle successful payment — update subscription status, clear dunning flags, etc.
    });
  } catch { app.log.warn("Could not subscribe to billing.payment.succeeded"); }

  // billing.payment.failed
  try {
    await subscribeEvent(nc, "billing.payment.failed", BILLING_SCHEMAS["billing.payment.failed"], async (data) => {
      app.log.info({ data }, "Received billing.payment.failed");
      // Handle failed payment — initiate dunning, notify tenant, etc.
    });
  } catch { app.log.warn("Could not subscribe to billing.payment.failed"); }

  app.log.info("Billing-svc NATS subscribers set up");
}
