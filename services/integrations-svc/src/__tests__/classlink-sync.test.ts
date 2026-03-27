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

import { ClassLinkSync } from "../sync/classlink-sync.js";
import { publishEvent } from "@aivo/events";

const SYNC_LOG_ID = "00000000-0000-4000-a000-000000000001";
const CONNECTION_ID = "00000000-0000-4000-a000-000000000002";
const TENANT_ID = "00000000-0000-4000-a000-000000000003";
const ACCESS_TOKEN = "test-classlink-token";
const BASE_URL = "https://oneroster.classlink.com";
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

function oneRosterUserResponse(users: Array<{ sourcedId: string; givenName: string; familyName: string; email?: string; grades?: string[]; orgName?: string }>) {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue({
      users: users.map((u) => ({
        sourcedId: u.sourcedId,
        givenName: u.givenName,
        familyName: u.familyName,
        email: u.email,
        grades: u.grades,
        orgs: u.orgName ? [{ sourcedId: "org-1", name: u.orgName }] : undefined,
      })),
    }),
  };
}

describe("ClassLinkSync", () => {
  let app: ReturnType<typeof createMockApp>;
  let sync: ClassLinkSync;

  beforeEach(() => {
    app = createMockApp();
    sync = new ClassLinkSync(app);
    vi.clearAllMocks();
    global.fetch = mockFetch as any;
  });

  describe("fullSync", () => {
    it("should create sync log, fetch students and teachers, create users, and publish event", async () => {
      // First fetch call is for students, second is for teachers
      mockFetch
        .mockResolvedValueOnce(
          oneRosterUserResponse([
            { sourcedId: "stu-1", givenName: "Alice", familyName: "Smith", email: "alice@school.org", grades: ["5"], orgName: "Lincoln Elementary" },
          ]),
        )
        .mockResolvedValueOnce(
          oneRosterUserResponse([
            { sourcedId: "tch-1", givenName: "Bob", familyName: "Jones", email: "bob.jones@school.org" },
          ]),
        );

      const result = await sync.fullSync(CONNECTION_ID, TENANT_ID, ACCESS_TOKEN, BASE_URL);

      expect(result).toBe(SYNC_LOG_ID);

      // Verify sync log was created
      expect(app.db.insert).toHaveBeenCalled();

      // Verify teacher was created
      expect(app.identityClient.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: TENANT_ID,
          email: "bob.jones@school.org",
          role: "TEACHER",
          status: "INVITED",
        }),
      );

      // Verify fetch was called with correct URLs
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/ims/oneroster/v1p2/users?filter=role='student'`,
        expect.objectContaining({ headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/ims/oneroster/v1p2/users?filter=role='teacher'`,
        expect.objectContaining({ headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }),
      );

      // Verify event was published
      expect(publishEvent).toHaveBeenCalledWith(
        app.nats,
        "integrations.roster.synced",
        expect.objectContaining({
          tenantId: TENANT_ID,
          provider: "CLASSLINK",
          studentsAdded: 1,
          teachersAdded: 1,
        }),
      );
    });

    it("should skip existing teachers and still count students", async () => {
      app.identityClient.findUserByEmail.mockResolvedValue({
        id: "00000000-0000-4000-a000-000000000099",
        email: "existing@school.org",
      });

      mockFetch
        .mockResolvedValueOnce(
          oneRosterUserResponse([
            { sourcedId: "stu-1", givenName: "Alice", familyName: "Smith", email: "alice@school.org" },
          ]),
        )
        .mockResolvedValueOnce(
          oneRosterUserResponse([
            { sourcedId: "tch-1", givenName: "Existing", familyName: "Teacher", email: "existing@school.org" },
          ]),
        );

      await sync.fullSync(CONNECTION_ID, TENANT_ID, ACCESS_TOKEN, BASE_URL);

      // Teacher already exists so createUser should not be called with TEACHER role
      // But it will still be called for the student's parent (if parentEmail is set)
      // Since student has no parentEmail, createUser won't be called for teachers
      expect(publishEvent).toHaveBeenCalledWith(
        app.nats,
        "integrations.roster.synced",
        expect.objectContaining({
          teachersAdded: 0,
          studentsAdded: 1,
        }),
      );
    });

    it("should handle empty rosters", async () => {
      mockFetch
        .mockResolvedValueOnce(oneRosterUserResponse([]))
        .mockResolvedValueOnce(oneRosterUserResponse([]));

      const result = await sync.fullSync(CONNECTION_ID, TENANT_ID, ACCESS_TOKEN, BASE_URL);

      expect(result).toBe(SYNC_LOG_ID);
      expect(publishEvent).toHaveBeenCalledWith(
        app.nats,
        "integrations.roster.synced",
        expect.objectContaining({
          studentsAdded: 0,
          teachersAdded: 0,
        }),
      );
    });

    it("should mark sync log as FAILED on API error and rethrow", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

      await expect(sync.fullSync(CONNECTION_ID, TENANT_ID, ACCESS_TOKEN, BASE_URL)).rejects.toThrow(
        "ClassLink OneRoster API error: 401",
      );

      expect(app.db.update).toHaveBeenCalled();
    });
  });
});
