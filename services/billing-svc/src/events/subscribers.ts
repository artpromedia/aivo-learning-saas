import type { FastifyInstance } from "fastify";
import { subscribeEvent, BILLING_SCHEMAS } from "@aivo/events";
import { DistrictContractEndService } from "../services/district-contract-end.service.js";

export async function setupSubscribers(app: FastifyInstance): Promise<void> {
  const nc = app.nats;

  // billing.payment.succeeded
  try {
    await subscribeEvent(nc, "billing.payment.succeeded", BILLING_SCHEMAS["billing.payment.succeeded"], async (data) => {
      app.log.info({ data }, "Received billing.payment.succeeded");
    });
  } catch { app.log.warn("Could not subscribe to billing.payment.succeeded"); }

  // billing.payment.failed
  try {
    await subscribeEvent(nc, "billing.payment.failed", BILLING_SCHEMAS["billing.payment.failed"], async (data) => {
      app.log.info({ data }, "Received billing.payment.failed");
    });
  } catch { app.log.warn("Could not subscribe to billing.payment.failed"); }

  // billing.b2b.contract.ended — notify parents and set grace periods
  try {
    const sub = nc.subscribe("aivo.billing.b2b.contract.ended");
    (async () => {
      for await (const msg of sub) {
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

  app.log.info("Billing-svc NATS subscribers set up");
}
