import type { FastifyInstance } from "fastify";
import { StringCodec } from "nats";
import { federatedModelUpdates } from "@aivo/db";
import { eq, and } from "drizzle-orm";
import { ResearchModelContributionSchema } from "@aivo/events";

const sc = StringCodec();

async function processContribution(app: FastifyInstance, data: {
  modelVersion: string;
  tenantId: string;
  sampleCount: number;
}): Promise<void> {
  app.log.info(`Processing model contribution from tenant ${data.tenantId} for version ${data.modelVersion}`);

  const [existing] = await app.db
    .select()
    .from(federatedModelUpdates)
    .where(
      and(
        eq(federatedModelUpdates.modelVersion, data.modelVersion),
        eq(federatedModelUpdates.tenantId, data.tenantId),
      ),
    )
    .limit(1);

  if (existing) {
    await app.db
      .update(federatedModelUpdates)
      .set({
        sampleCount: existing.sampleCount + data.sampleCount,
        contributedAt: new Date(),
      })
      .where(eq(federatedModelUpdates.id, existing.id));
  } else {
    await app.db
      .insert(federatedModelUpdates)
      .values({
        modelVersion: data.modelVersion,
        tenantId: data.tenantId,
        gradientAggregate: {},
        sampleCount: data.sampleCount,
      });
  }

  app.log.info(`Contribution processed for model ${data.modelVersion}`);
}

export async function startFederatedAggregator(app: FastifyInstance): Promise<void> {
  const js = app.nats.jetstream();

  try {
    const consumer = await js.consumers.get("AIVO_RESEARCH", "federated-aggregator");
    const messages = await consumer.consume();

    (async () => {
      for await (const msg of messages) {
        try {
          const raw = JSON.parse(sc.decode(msg.data));
          const validated = ResearchModelContributionSchema.parse(raw);
          await processContribution(app, validated);
          msg.ack();
        } catch (err) {
          app.log.error(`Failed to process model contribution: ${err}`);
          msg.nak();
        }
      }
    })();

    app.log.info("Federated aggregator started");
  } catch (err) {
    app.log.warn(`Could not start federated aggregator consumer: ${err}`);
  }
}
