import type { FastifyInstance } from "fastify";
import { csvImportJobs } from "@aivo/db";
import { eq, and } from "drizzle-orm";
import { ImportJob } from "../csv/import-job.js";
import { CsvParser } from "../csv/parser.js";

export class CsvImportService {
  private parser = new CsvParser();

  constructor(private readonly app: FastifyInstance) {}

  async startImport(tenantId: string, fileName: string, csvContent: string, uploadedBy: string): Promise<string> {
    const [job] = await this.app.db
      .insert(csvImportJobs)
      .values({
        tenantId,
        fileName,
        status: "PENDING",
        uploadedBy,
      })
      .returning();

    // Process in background
    const importJob = new ImportJob(this.app);
    importJob.process(job.id, tenantId, csvContent).catch((err) => {
      this.app.log.error({ err, jobId: job.id }, "CSV import job failed");
    });

    return job.id;
  }

  async getJobStatus(jobId: string, tenantId: string) {
    const [job] = await this.app.db
      .select()
      .from(csvImportJobs)
      .where(and(eq(csvImportJobs.id, jobId), eq(csvImportJobs.tenantId, tenantId)))
      .limit(1);

    if (!job) throw Object.assign(new Error("Import job not found"), { statusCode: 404 });

    return {
      id: job.id,
      status: job.status,
      fileName: job.fileName,
      totalRows: job.totalRows,
      processedRows: job.processedRows,
      successRows: job.successRows,
      errorRows: job.errorRows,
      errors: job.errors,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    };
  }

  getTemplate(): string {
    return this.parser.getTemplate();
  }
}
