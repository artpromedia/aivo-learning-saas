import type { FastifyInstance } from "fastify";
import { subscribeEvent } from "@aivo/events";
import { ProvisioningService } from "../services/provisioning.service.js";
import { DeprovisioningService } from "../services/deprovisioning.service.js";

export async function setupSubscribers(app: FastifyInstance): Promise<void> {
  const nc = app.nats;
  const provisioning = new ProvisioningService(app);
  const deprovisioning = new DeprovisioningService(app);

  // Listen for tutor addon activated (from billing-svc after Stripe confirms)
  try {
    await subscribeEvent(
      nc,
      "tutor.addon.activated",
      (await import("@aivo/events")).getSchema("tutor.addon.activated"),
      async (data) => {
        app.log.info({ data }, "Received tutor.addon.activated");
        try {
          await provisioning.provision(data.learnerId, data.tenantId, data.sku);
        } catch (err) {
          app.log.error({ err, data }, "Failed to provision tutor addon");
        }
      },
    );
  } catch {
    app.log.warn("Could not subscribe to tutor.addon.activated");
  }

  // Listen for tutor addon deactivated
  try {
    await subscribeEvent(
      nc,
      "tutor.addon.deactivated",
      (await import("@aivo/events")).getSchema("tutor.addon.deactivated"),
      async (data) => {
        app.log.info({ data }, "Received tutor.addon.deactivated");
        try {
          // Find the subscription and finalize deprovisioning
          const subs = await app.db
            .select()
            .from((await import("@aivo/db")).tutorSubscriptions)
            .where(
              (await import("drizzle-orm")).and(
                (await import("drizzle-orm")).eq(
                  (await import("@aivo/db")).tutorSubscriptions.learnerId,
                  data.learnerId,
                ),
                (await import("drizzle-orm")).eq(
                  (await import("@aivo/db")).tutorSubscriptions.sku,
                  data.sku,
                ),
                (await import("drizzle-orm")).eq(
                  (await import("@aivo/db")).tutorSubscriptions.status,
                  "GRACE_PERIOD",
                ),
              ),
            );
          for (const sub of subs) {
            await deprovisioning.finalizeDeprovisioning(sub.id);
          }
        } catch (err) {
          app.log.error({ err, data }, "Failed to deprovision tutor addon");
        }
      },
    );
  } catch {
    app.log.warn("Could not subscribe to tutor.addon.deactivated");
  }

  app.log.info("Tutor-svc NATS subscribers set up");
}
