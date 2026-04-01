import type { FastifyInstance } from "fastify";
import { subscribeEvent, BILLING_SCHEMAS, type Subscription } from "@aivo/events";
import { DistrictContractEndService } from "../services/district-contract-end.service.js";

export async function setupSubscribers(app: FastifyInstance): Promise<void> {
  const nc = app.nats;
  const subs: Subscription[] = [];

  // billing.payment.succeeded
  try {
    const sub = await subscribeEvent(nc, "billing.payment.succeeded", BILLING_SCHEMAS["billing.payment.succeeded"], async (data) => {
      app.log.info({ data }, "Received billing.payment.succeeded");
    });
    subs.push(sub);
  } catch { app.log.warn("Could not subscribe to billing.payment.succeeded"); }

  // billing.payment.failed
  try {
    const sub = await subscribeEvent(nc, "billing.payment.failed", BILLING_SCHEMAS["billing.payment.failed"], async (data) => {
      app.log.info({ data }, "Received billing.payment.failed");
    });
    subs.push(sub);
  } catch { app.log.warn("Could not subscribe to billing.payment.failed"); }

  // billing.b2b.contract.ended — notify parents and set grace periods
  try {
    const rawSub = nc.subscribe("aivo.billing.b2b.contract.ended");
    (async () => {
      for await (const msg of rawSub) {
        try {
          const data = JSON.parse(new TextDecoder().decode(msg.data)) as {
            tenantId: string;
            contractEndDate: string;
          };
          app.log.info({ data }, "Received billing.b2b.contract.ended");
          const service = new DistrictContractEndService(app);
          await service.handleContractEnd(data.tenantId, data.contractEndDate);
        } catch (err) {
          app.log.error({ err }, "Failed to handle B2B contract end event");
        }
      }
    })();
  } catch { app.log.warn("Could not subscribe to billing.b2b.contract.ended"); }

  // Clean up on close
  app.addHook("onClose", async () => {
    for (const sub of subs) {
      sub.unsubscribe();
    }
  });

  app.log.info("Billing-svc NATS subscribers set up");
}
