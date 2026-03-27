import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { InvitationService, invitationStore } from "../services/invitation.service.js";

vi.mock("@aivo/events", () => ({
  publishEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("argon2", () => ({
  hash: vi.fn().mockResolvedValue("$argon2id$hashed"),
}));

vi.mock("nanoid", () => ({
  nanoid: vi.fn().mockReturnValue("test-invitation-token"),
}));

function createMockApp() {
  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
          onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    },
    nats: {},
  } as any;
}

describe("InvitationService", () => {
  let app: ReturnType<typeof createMockApp>;
  let invitationService: InvitationService;

  beforeEach(() => {
    app = createMockApp();
    invitationService = new InvitationService(app);
    invitationStore.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    invitationStore.clear();
  });

  describe("inviteTeacher", () => {
    it("should create teacher invitation when learner exists and no existing teacher", async () => {
      const learner = { id: "learner-1", tenantId: "tenant-1", parentId: "user-1" };

      // Mock: learner exists
      app.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([learner]),
            }),
          }),
        })
        // Mock: no existing teachers
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        });

      const result = await invitationService.inviteTeacher("user-1", "tenant-1", {
        email: "teacher@example.com",
        name: "Teacher Bob",
        learnerId: "learner-1",
      });

      expect(result.token).toBe("test-invitation-token");
      expect(result.type).toBe("TEACHER");
      expect(result.email).toBe("teacher@example.com");
      expect(invitationStore.size).toBe(1);
    });

    it("should throw 404 if learner not found", async () => {
      await expect(
        invitationService.inviteTeacher("user-1", "tenant-1", {
          email: "teacher@example.com",
          name: "Teacher Bob",
          learnerId: "nonexistent",
        }),
      ).rejects.toThrow("Learner not found");
    });

    it("should throw 409 if teacher slot is full", async () => {
      const learner = { id: "learner-1", tenantId: "tenant-1" };

      app.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([learner]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ id: "existing-teacher" }]),
          }),
        });

      await expect(
        invitationService.inviteTeacher("user-1", "tenant-1", {
          email: "teacher2@example.com",
          name: "Teacher Two",
          learnerId: "learner-1",
        }),
      ).rejects.toThrow("Teacher slot limit reached");
    });
  });

  describe("inviteCaregiver", () => {
    it("should create caregiver invitation", async () => {
      const learner = { id: "learner-1", tenantId: "tenant-1" };

      app.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([learner]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        });

      const result = await invitationService.inviteCaregiver("user-1", "tenant-1", {
        email: "grandma@example.com",
        name: "Grandma Eve",
        learnerId: "learner-1",
        relationship: "grandmother",
      });

      expect(result.type).toBe("CAREGIVER");
      expect(result.relationship).toBe("grandmother");
    });

    it("should throw 409 if caregiver slots full (2 max)", async () => {
      const learner = { id: "learner-1", tenantId: "tenant-1" };

      app.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([learner]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              { id: "cg-1" },
              { id: "cg-2" },
            ]),
          }),
        });

      await expect(
        invitationService.inviteCaregiver("user-1", "tenant-1", {
          email: "third@example.com",
          name: "Third CG",
          learnerId: "learner-1",
          relationship: "aunt",
        }),
      ).rejects.toThrow("Caregiver slot limit reached");
    });
  });

  describe("acceptInvitation", () => {
    it("should accept valid invitation and create/link user", async () => {
      // Add invitation to store
      invitationStore.set("valid-token", {
        token: "valid-token",
        type: "TEACHER",
        email: "teacher@example.com",
        name: "Teacher Bob",
        learnerId: "learner-1",
        tenantId: "tenant-1",
        invitedBy: "user-1",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
      });

      // Mock: no existing user, then create
      const newUser = {
        id: "teacher-user-1",
        email: "teacher@example.com",
        name: "Teacher Bob",
        role: "TEACHER",
        tenantId: "tenant-1",
      };

      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([newUser]),
          onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const result = await invitationService.acceptInvitation("valid-token");

      expect(result.user).toEqual(newUser);
      expect(result.invitation.type).toBe("TEACHER");
      expect(invitationStore.has("valid-token")).toBe(false);
    });

    it("should throw 404 for invalid token", async () => {
      await expect(
        invitationService.acceptInvitation("invalid-token"),
      ).rejects.toThrow("Invitation not found");
    });

    it("should throw 410 for expired invitation", async () => {
      invitationStore.set("expired-token", {
        token: "expired-token",
        type: "CAREGIVER",
        email: "expired@example.com",
        name: "Expired User",
        learnerId: "learner-1",
        tenantId: "tenant-1",
        invitedBy: "user-1",
        createdAt: new Date(Date.now() - 86400000 * 8),
        expiresAt: new Date(Date.now() - 86400000),
      });

      await expect(
        invitationService.acceptInvitation("expired-token"),
      ).rejects.toThrow("Invitation expired");
    });
  });

  describe("listInvitations", () => {
    it("should return active invitations for tenant", () => {
      invitationStore.set("token-1", {
        token: "token-1",
        type: "TEACHER",
        email: "teacher@example.com",
        name: "Teacher",
        learnerId: "learner-1",
        tenantId: "tenant-1",
        invitedBy: "user-1",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
      });

      invitationStore.set("token-2", {
        token: "token-2",
        type: "CAREGIVER",
        email: "cg@example.com",
        name: "Caregiver",
        learnerId: "learner-1",
        tenantId: "tenant-2", // different tenant
        invitedBy: "user-2",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
      });

      const results = invitationService.listInvitations("tenant-1");
      expect(results).toHaveLength(1);
      expect(results[0].email).toBe("teacher@example.com");
    });

    it("should exclude expired invitations", () => {
      invitationStore.set("expired", {
        token: "expired",
        type: "TEACHER",
        email: "old@example.com",
        name: "Old",
        learnerId: "learner-1",
        tenantId: "tenant-1",
        invitedBy: "user-1",
        createdAt: new Date(Date.now() - 86400000 * 8),
        expiresAt: new Date(Date.now() - 86400000),
      });

      const results = invitationService.listInvitations("tenant-1");
      expect(results).toHaveLength(0);
    });
  });
});
