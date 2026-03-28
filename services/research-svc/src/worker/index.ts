import type { FastifyInstance } from "fastify";
import { startSnapshotGenerator } from "./snapshot-generator.js";
import { startExportProcessor } from "./export-processor.js";
import { startFederatedAggregator } from "./federated-aggregator.js";

export async function startWorkers(app: FastifyInstance): Promise<void> {
  app.log.info("Starting research-svc workers...");

  startSnapshotGenerator(app);
  await startExportProcessor(app);
  await startFederatedAggregator(app);

  app.log.info("All research-svc workers started");
}
