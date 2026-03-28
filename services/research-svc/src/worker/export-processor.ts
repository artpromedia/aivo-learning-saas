import type { FastifyInstance } from "fastify";
import { StringCodec } from "nats";
import { researchExports } from "@aivo/db";
import { eq } from "drizzle-orm";
import { publishEvent, ResearchExportRequestedSchema } from "@aivo/events";
import {
  anonymizeRecords,
  generateExportSalt,
  type LearnerRecord,
  type AnonymizationConfig,
} from "../services/anonymizer.js";

const sc = StringCodec();

async function processExport(app: FastifyInstance, data: {
  exportId: string;
  cohortId: string;
  format: string;
  kLevel: number;
  epsilon: number;
  requestedBy: string;
}): Promise<void> {
  app.log.info(`Processing export ${data.exportId}...`);

  await app.db
    .update(researchExports)
    .set({ status: "PROCESSING" })
    .where(eq(researchExports.id, data.exportId));

  try {
    const rows = await app.sql`
      SELECT
        lp.id,
        lp.age,
        lp.grade,
        lp.disability_category,
        lp.zip_code,
        lp.gender,
        sm.score,
        sm.progress_rate,
        sm.mastery_level
      FROM learner_profiles lp
      LEFT JOIN skill_mastery sm ON sm.learner_id = lp.id
    `;

    const records: LearnerRecord[] = rows.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      quasiIdentifiers: {
        age: row.age as number | undefined,
        grade: row.grade as string | undefined,
        disability: row.disability_category as string | undefined,
        zipCode: row.zip_code as string | undefined,
        gender: row.gender as string | undefined,
      },
      metrics: {
        score: (row.score as number) ?? 0,
        progressRate: (row.progress_rate as number) ?? 0,
      },
    }));

    const config: AnonymizationConfig = {
      kLevel: data.kLevel,
      epsilon: data.epsilon,
      salt: generateExportSalt(),
    };

    const anonymized = anonymizeRecords(records, config);

    const fileUrl = `s3://aivo-research-exports/${data.exportId}.${data.format.toLowerCase()}`;

    await app.db
      .update(researchExports)
      .set({
        status: "COMPLETED",
        rowCount: anonymized.length,
        fileUrl,
        completedAt: new Date(),
      })
      .where(eq(researchExports.id, data.exportId));

    await publishEvent(app.nats, "research.export.completed", {
      exportId: data.exportId,
      cohortId: data.cohortId,
      fileUrl,
      rowCount: anonymized.length,
    });

    app.log.info(`Export ${data.exportId} completed with ${anonymized.length} rows`);
  } catch (err) {
    app.log.error(`Export ${data.exportId} failed: ${err}`);

    await app.db
      .update(researchExports)
      .set({ status: "FAILED" })
      .where(eq(researchExports.id, data.exportId));
  }
}

export async function startExportProcessor(app: FastifyInstance): Promise<void> {
  const js = app.nats.jetstream();

  try {
    const consumer = await js.consumers.get("AIVO_RESEARCH", "export-processor");
    const messages = await consumer.consume();

    (async () => {
      for await (const msg of messages) {
        try {
          const raw = JSON.parse(sc.decode(msg.data));
          const validated = ResearchExportRequestedSchema.parse(raw);
          await processExport(app, validated);
          msg.ack();
        } catch (err) {
          app.log.error(`Failed to process export message: ${err}`);
          msg.nak();
        }
      }
    })();

    app.log.info("Export processor started");
  } catch (err) {
    app.log.warn(`Could not start export processor consumer: ${err}`);
  }
}
