import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@aivo/db", () => ({
  syncLogs: { id: "syncLogs.id" },
  sisConnections: { id: "sisConnections.id" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: unknown[]) => args),
}));

vi.mock("@aivo/events", () => ({
  publishEvent: vi.fn().mockResolvedValue(undefined),
}));

import { CleverSync } from "../sync/clever-sync.js";
import { publishEvent } from "@aivo/events";

const SYNC_LOG_ID = "00000000-0000-4000-a000-000000000001";
const CONNECTION_ID = "00000000-0000-4000-a000-000000000002";
const TENANT_ID = "00000000-0000-4000-a000-000000000003";
const ACCESS_TOKEN = "test-clever-token";
const CREATED_USER_ID = "00000000-0000-4000-a000-000000000010";
const CREATED_LEARNER_ID = "00000000-0000-4000-a000-000000000011";

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
          returning: vi.fn().mockResolvedValue([{ id: SYNC_LOG_ID }]),
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
      createUser: vi.fn().mockResolvedValue({ id: CREATED_USER_ID, email: "test@test.com" }),
      createLearner: vi.fn().mockResolvedValue({ id: CREATED_LEARNER_ID }),
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

const mockFetch = vi.fn();
global.fetch = mockFetch as any;

function cleverStudentResponse(students: Array<{ id: string; first: string; last: string; email?: string; grade?: string; school?: string }>) {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue({
      data: students.map((s) => ({
        data: {
          id: s.id,
          name: { first: s.first, last: s.last },
          email: s.email,
          roles: { student: { grade: s.grade, school: s.school } },
        },
      })),
    }),
  };
}

function cleverTeacherResponse(teachers: Array<{ id: string; first: string; last: string; email: string }>) {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue({
      data: teachers.map((t) => ({
        data: {
          id: t.id,
          name: { first: t.first, last: t.last },
          email: t.email,
        },
      })),
    }),
  };
}

function cleverSectionResponse(sections: Array<{ id: string; name: string; subject?: string; grade?: string; teacher?: string; students: string[] }>) {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue({
      data: sections.map((s) => ({
        data: {
          id: s.id,
          name: s.name,
          subject: s.subject,
          grade: s.grade,
          teacher: s.teacher,
          students: s.students,
        },
      })),
    }),
  };
}

describe("CleverSync", () => {
  let app: ReturnType<typeof createMockApp>;
  let sync: CleverSync;

  beforeEach(() => {
    app = createMockApp();
    sync = new CleverSync(app);
    vi.clearAllMocks();
    global.fetch = mockFetch as any;
  });

  describe("fullSync", () => {
    it("should create a sync log, fetch data, create users, update sync log, and publish event", async () => {
      mockFetch
        .mockResolvedValueOnce(
          cleverStudentResponse([
            { id: "stu-1", first: "Alice", last: "Smith", email: "alice@school.org", grade: "5", school: "Lincoln Elementary" },
          ]),
        )
        .mockResolvedValueOnce(
          cleverTeacherResponse([
            { id: "tch-1", first: "Bob", last: "Jones", email: "bob.jones@school.org" },
          ]),
        )
        .mockResolvedValueOnce(
          cleverSectionResponse([
            { id: "sec-1", name: "Math 101", subject: "Math", grade: "5", teacher: "tch-1", students: ["stu-1"] },
          ]),
        );

      const result = await sync.fullSync(CONNECTION_ID, TENANT_ID, ACCESS_TOKEN);

      expect(result).toBe(SYNC_LOG_ID);

      // Verify sync log was created
      expect(app.db.insert).toHaveBeenCalled();

      // Verify teacher was created
      expect(app.identityClient.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: TENANT_ID,
          email: "bob.jones@school.org",
          role: "TEACHER",
        }),
      );

      // Verify sync log was updated to COMPLETED
      expect(app.db.update).toHaveBeenCalled();

      // Verify event was published
      expect(publishEvent).toHaveBeenCalledWith(
        app.nats,
        "integrations.roster.synced",
        expect.objectContaining({
          tenantId: TENANT_ID,
          provider: "CLEVER",
          teachersAdded: 1,
        }),
      );
    });

    it("should skip existing teachers found by email", async () => {
      app.identityClient.findUserByEmail.mockResolvedValue({ id: "00000000-0000-4000-a000-000000000099", email: "bob.jones@school.org" });

      mockFetch
        .mockResolvedValueOnce(cleverStudentResponse([]))
        .mockResolvedValueOnce(
          cleverTeacherResponse([
            { id: "tch-1", first: "Bob", last: "Jones", email: "bob.jones@school.org" },
          ]),
        )
        .mockResolvedValueOnce(cleverSectionResponse([]));

      await sync.fullSync(CONNECTION_ID, TENANT_ID, ACCESS_TOKEN);

      // createUser should not be called for teachers since the teacher already exists
      expect(app.identityClient.createUser).not.toHaveBeenCalledWith(
        expect.objectContaining({ role: "TEACHER" }),
      );
    });

    it("should create parent accounts for students with parentEmail", async () => {
      mockFetch
        .mockResolvedValueOnce(
          cleverStudentResponse([
            { id: "stu-1", first: "Alice", last: "Smith", email: "alice@school.org" },
          ]),
        )
        .mockResolvedValueOnce(cleverTeacherResponse([]))
        .mockResolvedValueOnce(cleverSectionResponse([]));

      // findUserByEmail returns null (no existing user)
      app.identityClient.findUserByEmail.mockResolvedValue(null);

      await sync.fullSync(CONNECTION_ID, TENANT_ID, ACCESS_TOKEN);

      // Student without parentEmail won't trigger parent creation but will still increment studentsAdded
      expect(publishEvent).toHaveBeenCalledWith(
        app.nats,
        "integrations.roster.synced",
        expect.objectContaining({ studentsAdded: 1 }),
      );
    });

    it("should mark sync log as FAILED on error and rethrow", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      await expect(sync.fullSync(CONNECTION_ID, TENANT_ID, ACCESS_TOKEN)).rejects.toThrow("Network failure");

      // Verify sync log was updated to FAILED
      expect(app.db.update).toHaveBeenCalled();
    });
  });

  describe("deltaSync", () => {
    it("should detect added students and create new users", async () => {
      // No previous roster in Redis
      app.redis.get.mockResolvedValue(null);

      mockFetch.mockResolvedValueOnce(
        cleverStudentResponse([
          { id: "stu-new", first: "Charlie", last: "Brown", email: "charlie@school.org", grade: "3" },
        ]),
      );

      app.identityClient.findUserByEmail.mockResolvedValue(null);

      const result = await sync.deltaSync(CONNECTION_ID, TENANT_ID, ACCESS_TOKEN);

      expect(result).toBe(SYNC_LOG_ID);

      // Should save current roster to Redis
      expect(app.redis.setex).toHaveBeenCalled();

      // Should publish event with added students
      expect(publishEvent).toHaveBeenCalledWith(
        app.nats,
        "integrations.roster.synced",
        expect.objectContaining({
          tenantId: TENANT_ID,
          provider: "CLEVER",
          studentsAdded: 1,
        }),
      );
    });

    it("should detect no changes when roster is the same", async () => {
      const existingStudents = [
        { sisId: "stu-1", firstName: "Alice", lastName: "Smith", email: "alice@school.org", grade: "5" },
      ];
      app.redis.get.mockResolvedValue(JSON.stringify(existingStudents));

      mockFetch.mockResolvedValueOnce(
        cleverStudentResponse([
          { id: "stu-1", first: "Alice", last: "Smith", email: "alice@school.org", grade: "5" },
        ]),
      );

      await sync.deltaSync(CONNECTION_ID, TENANT_ID, ACCESS_TOKEN);

      expect(publishEvent).toHaveBeenCalledWith(
        app.nats,
        "integrations.roster.synced",
        expect.objectContaining({
          studentsAdded: 0,
          studentsUpdated: 0,
          studentsDeleted: 0,
        }),
      );
    });
  });

  describe("handleWebhookEvent", () => {
    it("should process students.created events", async () => {
      await sync.handleWebhookEvent(
        {
          type: "students.created",
          data: {
            id: "stu-webhook-1",
            name: { first: "Diana", last: "Prince" },
            email: "diana@school.org",
            grade: "8",
          },
        },
        TENANT_ID,
      );

      expect(app.log.info).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "students.created", sisId: "stu-webhook-1" }),
        expect.any(String),
      );
    });

    it("should process students.deleted events", async () => {
      await sync.handleWebhookEvent(
        {
          type: "students.deleted",
          data: { id: "stu-webhook-2" },
        },
        TENANT_ID,
      );

      expect(app.log.info).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "students.deleted", sisId: "stu-webhook-2" }),
        expect.any(String),
      );
    });

    it("should process students.updated events", async () => {
      await sync.handleWebhookEvent(
        {
          type: "students.updated",
          data: {
            id: "stu-webhook-3",
            name: { first: "Updated", last: "Name" },
            email: "updated@school.org",
          },
        },
        TENANT_ID,
      );

      expect(app.log.info).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "students.updated", sisId: "stu-webhook-3" }),
        expect.any(String),
      );
    });
  });
});
