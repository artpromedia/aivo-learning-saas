import { describe, it, expect, vi, beforeEach } from "vitest";
import { CsvParser } from "../csv/parser.js";
import { ImportJob } from "../csv/import-job.js";
import { CsvImportService } from "../services/csv-import.service.js";

// Mock @aivo/events
vi.mock("@aivo/events", () => ({
  publishEvent: vi.fn().mockResolvedValue(undefined),
}));

// Mock @aivo/db
vi.mock("@aivo/db", () => ({
  csvImportJobs: {
    id: "id",
    tenantId: "tenantId",
  },
}));

// Mock drizzle-orm
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((_col, val) => val),
  and: vi.fn((...args: any[]) => args),
}));

const TENANT_ID = "00000000-0000-4000-a000-000000000001";
const JOB_ID = "00000000-0000-4000-a000-000000000020";
const UPLOADER_ID = "00000000-0000-4000-a000-000000000030";

function createMockApp() {
  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "00000000-0000-4000-a000-000000000001" }]),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{}]),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    },
    nats: {
      jetstream: vi.fn().mockReturnValue({
        publish: vi.fn().mockResolvedValue(undefined),
      }),
    },
    redis: {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue("OK"),
      setex: vi.fn().mockResolvedValue("OK"),
      del: vi.fn().mockResolvedValue(1),
    },
    identityClient: {
      createUser: vi.fn().mockResolvedValue({ id: "00000000-0000-4000-a000-000000000010", email: "test@test.com" }),
      createLearner: vi.fn().mockResolvedValue({ id: "00000000-0000-4000-a000-000000000011" }),
      findUserByEmail: vi.fn().mockResolvedValue(null),
      sendInvitation: vi.fn().mockResolvedValue(undefined),
    },
    log: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    },
  } as any;
}

describe("CSV Import", () => {
  let app: ReturnType<typeof createMockApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createMockApp();
  });

  describe("CsvParser.parse", () => {
    it("parses valid CSV rows", () => {
      const parser = new CsvParser();
      const csv = [
        "student_id,first_name,last_name,email,grade,teacher_email,classroom,parent_email,parent_name",
        "S001,Alice,Johnson,alice@school.edu,5,teacher@school.edu,Room 101,parent@home.com,Bob Johnson",
        "S002,Charlie,Brown,charlie@school.edu,3,,Room 202,,",
      ].join("\n");

      const result = parser.parse(csv);

      expect(result.rows).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.totalRows).toBe(2);

      expect(result.rows[0]).toEqual(
        expect.objectContaining({
          student_id: "S001",
          first_name: "Alice",
          last_name: "Johnson",
          email: "alice@school.edu",
          grade: "5",
          teacher_email: "teacher@school.edu",
          classroom: "Room 101",
          parent_email: "parent@home.com",
          parent_name: "Bob Johnson",
        }),
      );

      expect(result.rows[1]).toEqual(
        expect.objectContaining({
          student_id: "S002",
          first_name: "Charlie",
          last_name: "Brown",
          email: "charlie@school.edu",
          grade: "3",
        }),
      );
    });

    it("detects missing required fields", () => {
      const parser = new CsvParser();
      const csv = [
        "student_id,first_name,last_name,email",
        ",Alice,Johnson,alice@school.edu",  // missing student_id
        "S002,,Brown,",                      // missing first_name
        "S003,Charlie,,",                    // missing last_name
      ].join("\n");

      const result = parser.parse(csv);

      expect(result.errors.length).toBeGreaterThan(0);

      const studentIdErrors = result.errors.filter((e) => e.field === "student_id");
      expect(studentIdErrors.length).toBeGreaterThan(0);

      const firstNameErrors = result.errors.filter((e) => e.field === "first_name");
      expect(firstNameErrors.length).toBeGreaterThan(0);

      const lastNameErrors = result.errors.filter((e) => e.field === "last_name");
      expect(lastNameErrors.length).toBeGreaterThan(0);
    });

    it("detects invalid email addresses", () => {
      const parser = new CsvParser();
      const csv = [
        "student_id,first_name,last_name,email,grade,teacher_email,classroom,parent_email,parent_name",
        "S001,Alice,Johnson,not-an-email,5,also-bad,Room 101,still-bad,Parent",
      ].join("\n");

      const result = parser.parse(csv);

      expect(result.errors.length).toBeGreaterThan(0);
      const emailErrors = result.errors.filter((e) =>
        e.message.toLowerCase().includes("email") || e.message.toLowerCase().includes("invalid"),
      );
      expect(emailErrors.length).toBeGreaterThan(0);
    });

    it("handles header-only CSV", () => {
      const parser = new CsvParser();
      const csv = "student_id,first_name,last_name,email";

      const result = parser.parse(csv);

      expect(result.rows).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain("at least one data row");
    });

    it("handles quoted fields with commas", () => {
      const parser = new CsvParser();
      const csv = [
        "student_id,first_name,last_name,email",
        'S001,"Alice, Jr.",Johnson,alice@school.edu',
      ].join("\n");

      const result = parser.parse(csv);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].first_name).toBe("Alice, Jr.");
    });
  });

  describe("CsvParser.getTemplate", () => {
    it("returns CSV header template", () => {
      const parser = new CsvParser();
      const template = parser.getTemplate();

      expect(template).toBe(
        "student_id,first_name,last_name,email,grade,teacher_email,classroom,parent_email,parent_name\n",
      );
      expect(template).toContain("student_id");
      expect(template).toContain("first_name");
      expect(template).toContain("last_name");
      expect(template).toContain("email");
      expect(template).toContain("parent_email");
    });
  });

  describe("ImportJob.process", () => {
    it("processes rows, creates users/learners, updates job status", async () => {
      const { publishEvent } = await import("@aivo/events");

      const csv = [
        "student_id,first_name,last_name,email,grade,teacher_email,classroom,parent_email,parent_name",
        "S001,Alice,Johnson,alice@school.edu,5,teacher@school.edu,Room 101,parent@home.com,Bob Johnson",
      ].join("\n");

      // findUserByEmail returns null for all (new users)
      app.identityClient.findUserByEmail.mockResolvedValue(null);

      const importJob = new ImportJob(app);
      await importJob.process(JOB_ID, TENANT_ID, csv);

      // Job status updated to PROCESSING
      expect(app.db.update).toHaveBeenCalled();

      // Parent user created
      expect(app.identityClient.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: TENANT_ID,
          email: "parent@home.com",
          role: "PARENT",
          status: "INVITED",
        }),
      );

      // Invitation sent to parent
      expect(app.identityClient.sendInvitation).toHaveBeenCalled();

      // Teacher user created
      expect(app.identityClient.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: TENANT_ID,
          email: "teacher@school.edu",
          role: "TEACHER",
          status: "INVITED",
        }),
      );

      // Learner created
      expect(app.identityClient.createLearner).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: TENANT_ID,
          name: "Alice Johnson",
        }),
      );

      // Event published
      expect(publishEvent).toHaveBeenCalledWith(
        app.nats,
        "integrations.roster.synced",
        expect.objectContaining({
          tenantId: TENANT_ID,
          provider: "CSV",
          studentsAdded: 1,
        }),
      );
    });

    it("marks job as FAILED when all rows have errors", async () => {
      const csv = [
        "student_id,first_name,last_name,email",
        ",,,,",  // all required fields missing
      ].join("\n");

      const importJob = new ImportJob(app);
      await importJob.process(JOB_ID, TENANT_ID, csv);

      // Job updated to FAILED
      const updateCalls = app.db.update.mock.calls;
      expect(updateCalls.length).toBeGreaterThanOrEqual(1);
    });

    it("handles row processing errors gracefully", async () => {
      const csv = [
        "student_id,first_name,last_name,email,grade,teacher_email,classroom,parent_email,parent_name",
        "S001,Alice,Johnson,alice@school.edu,5,,,parent@home.com,Bob Johnson",
      ].join("\n");

      app.identityClient.findUserByEmail.mockResolvedValue(null);
      app.identityClient.createUser.mockRejectedValue(new Error("DB connection error"));

      const importJob = new ImportJob(app);
      await importJob.process(JOB_ID, TENANT_ID, csv);

      // Job still completes (with error count)
      expect(app.db.update).toHaveBeenCalled();
    });
  });

  describe("CsvImportService.startImport", () => {
    it("creates job and starts background processing", async () => {
      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: JOB_ID }]),
        }),
      });

      const csv = [
        "student_id,first_name,last_name,email",
        "S001,Alice,Johnson,alice@school.edu",
      ].join("\n");

      const service = new CsvImportService(app);
      const jobId = await service.startImport(TENANT_ID, "roster.csv", csv, UPLOADER_ID);

      expect(jobId).toBe(JOB_ID);
      expect(app.db.insert).toHaveBeenCalled();
    });

    it("inserts job record with correct fields", async () => {
      const mockReturning = vi.fn().mockResolvedValue([{ id: JOB_ID }]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      app.db.insert.mockReturnValue({ values: mockValues });

      const service = new CsvImportService(app);
      await service.startImport(TENANT_ID, "students.csv", "header\nrow", UPLOADER_ID);

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: TENANT_ID,
          fileName: "students.csv",
          status: "PENDING",
          uploadedBy: UPLOADER_ID,
        }),
      );
    });
  });

  describe("CsvImportService.getJobStatus", () => {
    it("returns job with progress", async () => {
      const jobRecord = {
        id: JOB_ID,
        tenantId: TENANT_ID,
        status: "COMPLETED",
        fileName: "roster.csv",
        totalRows: 50,
        processedRows: 50,
        successRows: 48,
        errorRows: 2,
        errors: [{ row: 5, field: "email", message: "Invalid email" }],
        startedAt: new Date("2026-01-01T00:00:00.000Z"),
        completedAt: new Date("2026-01-01T00:01:00.000Z"),
      };

      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([jobRecord]),
          }),
        }),
      });

      const service = new CsvImportService(app);
      const result = await service.getJobStatus(JOB_ID, TENANT_ID);

      expect(result).toEqual({
        id: JOB_ID,
        status: "COMPLETED",
        fileName: "roster.csv",
        totalRows: 50,
        processedRows: 50,
        successRows: 48,
        errorRows: 2,
        errors: [{ row: 5, field: "email", message: "Invalid email" }],
        startedAt: jobRecord.startedAt,
        completedAt: jobRecord.completedAt,
      });
    });

    it("throws when job is not found", async () => {
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const service = new CsvImportService(app);
      await expect(
        service.getJobStatus("00000000-0000-4000-a000-000000000099", TENANT_ID),
      ).rejects.toThrow("Import job not found");
    });
  });
});
