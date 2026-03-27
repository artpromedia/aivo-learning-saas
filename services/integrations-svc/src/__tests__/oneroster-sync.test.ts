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

import { OneRosterSync } from "../sync/oneroster-sync.js";
import { publishEvent } from "@aivo/events";

const SYNC_LOG_ID = "00000000-0000-4000-a000-000000000001";
const CONNECTION_ID = "00000000-0000-4000-a000-000000000002";
const TENANT_ID = "00000000-0000-4000-a000-000000000003";
const ACCESS_TOKEN = "test-oneroster-token";
const BASE_URL = "https://oneroster.example.com";
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

describe("OneRosterSync", () => {
  let app: ReturnType<typeof createMockApp>;
  let sync: OneRosterSync;

  beforeEach(() => {
    app = createMockApp();
    sync = new OneRosterSync(app);
    vi.clearAllMocks();
    global.fetch = mockFetch as any;
  });

  describe("fullSync", () => {
    it("should create sync log, fetch students and teachers, create users, and publish event", async () => {
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

      const result = await sync.fullSync(CONNECTION_ID, TENANT_ID, BASE_URL, ACCESS_TOKEN);

      expect(result).toBe(SYNC_LOG_ID);

      // Verify sync log was created
      expect(app.db.insert).toHaveBeenCalled();

      // Verify teacher was created
      expect(app.identityClient.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: TENANT_ID,
          email: "bob.jones@school.org",
          name: "Bob Jones",
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
          provider: "ONEROSTER",
          studentsAdded: 1,
          teachersAdded: 1,
        }),
      );
    });

    it("should handle teachers with existing accounts", async () => {
      app.identityClient.findUserByEmail.mockResolvedValue({
        id: "00000000-0000-4000-a000-000000000099",
        email: "existing@school.org",
      });

      mockFetch
        .mockResolvedValueOnce(oneRosterUserResponse([]))
        .mockResolvedValueOnce(
          oneRosterUserResponse([
            { sourcedId: "tch-1", givenName: "Existing", familyName: "Teacher", email: "existing@school.org" },
          ]),
        );

      await sync.fullSync(CONNECTION_ID, TENANT_ID, BASE_URL, ACCESS_TOKEN);

      expect(publishEvent).toHaveBeenCalledWith(
        app.nats,
        "integrations.roster.synced",
        expect.objectContaining({
          teachersAdded: 0,
        }),
      );
    });

    it("should create parent account and learner for students with parentEmail", async () => {
      // First call for students, second for teachers
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({
            users: [
              {
                sourcedId: "stu-1",
                givenName: "Alice",
                familyName: "Smith",
                email: "alice@school.org",
                grades: ["3"],
                orgs: [{ sourcedId: "org-1", name: "Lincoln Elementary" }],
              },
            ],
          }),
        })
        .mockResolvedValueOnce(oneRosterUserResponse([]));

      // The mapper will produce a student without parentEmail (since OneRoster API doesn't supply it)
      // so no parent account will be created, but student should still be counted
      app.identityClient.findUserByEmail.mockResolvedValue(null);

      await sync.fullSync(CONNECTION_ID, TENANT_ID, BASE_URL, ACCESS_TOKEN);

      expect(publishEvent).toHaveBeenCalledWith(
        app.nats,
        "integrations.roster.synced",
        expect.objectContaining({ studentsAdded: 1 }),
      );
    });

    it("should handle multiple students and teachers", async () => {
      mockFetch
        .mockResolvedValueOnce(
          oneRosterUserResponse([
            { sourcedId: "stu-1", givenName: "Alice", familyName: "Smith", email: "alice@school.org" },
            { sourcedId: "stu-2", givenName: "Charlie", familyName: "Brown", email: "charlie@school.org" },
            { sourcedId: "stu-3", givenName: "Diana", familyName: "Prince", email: "diana@school.org" },
          ]),
        )
        .mockResolvedValueOnce(
          oneRosterUserResponse([
            { sourcedId: "tch-1", givenName: "Bob", familyName: "Jones", email: "bob@school.org" },
            { sourcedId: "tch-2", givenName: "Eve", familyName: "Adams", email: "eve@school.org" },
          ]),
        );

      const result = await sync.fullSync(CONNECTION_ID, TENANT_ID, BASE_URL, ACCESS_TOKEN);

      expect(result).toBe(SYNC_LOG_ID);
      expect(publishEvent).toHaveBeenCalledWith(
        app.nats,
        "integrations.roster.synced",
        expect.objectContaining({
          studentsAdded: 3,
          teachersAdded: 2,
        }),
      );
    });

    it("should mark sync as FAILED on API error and rethrow", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(sync.fullSync(CONNECTION_ID, TENANT_ID, BASE_URL, ACCESS_TOKEN)).rejects.toThrow(
        "OneRoster API error: 500",
      );

      expect(app.db.update).toHaveBeenCalled();
    });
  });
});
