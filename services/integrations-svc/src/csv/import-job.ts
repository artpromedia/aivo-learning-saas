import type { FastifyInstance } from "fastify";
import { csvImportJobs } from "@aivo/db";
import { eq } from "drizzle-orm";
import { CsvParser, type CsvRow } from "./parser.js";
import { RosterMapper } from "../sync/roster-mapper.js";
import { publishEvent } from "@aivo/events";

export class ImportJob {
  private parser = new CsvParser();
  private mapper = new RosterMapper();

  constructor(private readonly app: FastifyInstance) {}

  async process(jobId: string, tenantId: string, csvContent: string): Promise<void> {
    await this.app.db
      .update(csvImportJobs)
      .set({ status: "PROCESSING", startedAt: new Date() })
      .where(eq(csvImportJobs.id, jobId));

    const parseResult = this.parser.parse(csvContent);

    await this.app.db
      .update(csvImportJobs)
      .set({ totalRows: parseResult.totalRows })
      .where(eq(csvImportJobs.id, jobId));

    if (parseResult.errors.length > 0 && parseResult.rows.length === 0) {
      await this.app.db
        .update(csvImportJobs)
        .set({
          status: "FAILED",
          errors: parseResult.errors,
          completedAt: new Date(),
        })
        .where(eq(csvImportJobs.id, jobId));
      return;
    }

    let processedRows = 0;
    let successRows = 0;
    let errorRows = 0;
    const errors: Array<{ row: number; field: string; message: string }> = [...parseResult.errors];

    for (let i = 0; i < parseResult.rows.length; i++) {
      const row = parseResult.rows[i];
      try {
        await this.processRow(row, tenantId);
        successRows++;
      } catch (err) {
        errorRows++;
        errors.push({ row: i + 2, field: "", message: (err as Error).message });
      }
      processedRows++;

      // Update progress every 10 rows
      if (processedRows % 10 === 0) {
        await this.app.db
          .update(csvImportJobs)
          .set({ processedRows, successRows, errorRows, errors })
          .where(eq(csvImportJobs.id, jobId));
      }
    }

    await this.app.db
      .update(csvImportJobs)
      .set({
        status: errorRows === parseResult.totalRows ? "FAILED" : "COMPLETED",
        processedRows,
        successRows,
        errorRows,
        errors,
        completedAt: new Date(),
      })
      .where(eq(csvImportJobs.id, jobId));

    await publishEvent(this.app.nats, "integrations.roster.synced", {
      tenantId,
      provider: "CSV" as const,
      studentsAdded: successRows,
      studentsUpdated: 0,
      studentsDeleted: 0,
      teachersAdded: 0,
    });
  }

  private async processRow(row: CsvRow, tenantId: string): Promise<void> {
    const student = this.mapper.mapStudent({
      sisId: row.student_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      grade: row.grade,
      parentEmail: row.parent_email,
      parentName: row.parent_name,
    });

    // Create or find parent
    let parentId: string | undefined;
    if (row.parent_email) {
      const existing = await this.app.identityClient.findUserByEmail(row.parent_email);
      if (existing) {
        parentId = existing.id;
      } else {
        const parent = await this.app.identityClient.createUser({
          tenantId,
          email: row.parent_email,
          name: row.parent_name ?? `${row.first_name}'s Parent`,
          role: "PARENT",
          status: "INVITED",
        });
        parentId = parent.id;
        await this.app.identityClient.sendInvitation(parent.id, "system");
      }
    }

    // Create teacher if provided
    if (row.teacher_email) {
      const existingTeacher = await this.app.identityClient.findUserByEmail(row.teacher_email);
      if (!existingTeacher) {
        await this.app.identityClient.createUser({
          tenantId,
          email: row.teacher_email,
          name: row.teacher_email.split("@")[0],
          role: "TEACHER",
          status: "INVITED",
        });
      }
    }

    // Create learner
    if (parentId) {
      await this.app.identityClient.createLearner({
        tenantId,
        parentId,
        name: student.learner.name,
        enrolledGrade: student.learner.enrolledGrade,
      });
    }
  }
}
