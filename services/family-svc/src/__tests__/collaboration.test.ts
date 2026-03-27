import { describe, it, expect, vi } from "vitest";
import { CollaborationService } from "../services/collaboration.service.js";

const LEARNER_ID = "b0000000-0000-4000-a000-000000000001";
const USER_ID = "c0000000-0000-4000-a000-000000000001";
const TENANT_ID = "e0000000-0000-4000-a000-000000000001";

function mockSelect(results: Record<number, unknown[]>) {
  let callNum = 0;
  return vi.fn().mockImplementation(() => ({
    from: vi.fn().mockImplementation(() => ({
      where: vi.fn().mockImplementation(() => {
        callNum++;
        const result = results[callNum] ?? [];
        return {
          limit: vi.fn().mockResolvedValue(result),
          then: (fn: (v: unknown[]) => unknown) => Promise.resolve(result).then(fn),
        };
      }),
      innerJoin: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    })),
  }));
}

describe("CollaborationService", () => {
  describe("Slot enforcement", () => {
    it("allows first teacher invite for B2C", async () => {
      // Call 1: learner lookup, Call 2: tenant lookup, Call 3: teacher count
      const mockApp = {
        db: {
          select: mockSelect({
            1: [{ tenantId: TENANT_ID }],
            2: [{ id: TENANT_ID, type: "B2C_FAMILY" }],
            3: [],
          }),
          delete: vi.fn(),
        },
        identityClient: {
          sendInvitation: vi.fn().mockResolvedValue({ invitationId: "inv-1" }),
          revokeAccess: vi.fn(),
        },
      };

      const service = new CollaborationService(mockApp as never);
      const result = await service.inviteTeacher(LEARNER_ID, USER_ID, "teacher@school.edu");
      expect(result.invitationId).toBe("inv-1");
    });

    it("rejects 2nd teacher invite for B2C (max 1)", async () => {
      const mockApp = {
        db: {
          select: mockSelect({
            1: [{ tenantId: TENANT_ID }],
            2: [{ id: TENANT_ID, type: "B2C_FAMILY" }],
            3: [{ id: "existing-teacher" }],
          }),
          delete: vi.fn(),
        },
        identityClient: {
          sendInvitation: vi.fn().mockResolvedValue({ invitationId: "inv-1" }),
          revokeAccess: vi.fn(),
        },
      };

      const service = new CollaborationService(mockApp as never);
      await expect(
        service.inviteTeacher(LEARNER_ID, USER_ID, "teacher2@school.edu"),
      ).rejects.toThrow("Maximum 1 teacher");
    });

    it("rejects 3rd caregiver invite for B2C (max 2)", async () => {
      const mockApp = {
        db: {
          select: mockSelect({
            1: [{ tenantId: TENANT_ID }],
            2: [{ id: TENANT_ID, type: "B2C_FAMILY" }],
            3: [{ id: "cg1" }, { id: "cg2" }],
          }),
          delete: vi.fn(),
        },
        identityClient: {
          sendInvitation: vi.fn().mockResolvedValue({ invitationId: "inv-1" }),
          revokeAccess: vi.fn(),
        },
      };

      const service = new CollaborationService(mockApp as never);
      await expect(
        service.inviteCaregiver(LEARNER_ID, USER_ID, "cg3@example.com", "aunt"),
      ).rejects.toThrow("Maximum 2 caregiver");
    });
  });

  describe("removeMember", () => {
    it("deletes from both teacher and caregiver tables + revokes access", async () => {
      const mockApp = {
        db: {
          select: vi.fn(),
          delete: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        },
        identityClient: {
          sendInvitation: vi.fn(),
          revokeAccess: vi.fn().mockResolvedValue(undefined),
        },
      };

      const service = new CollaborationService(mockApp as never);
      await service.removeMember(LEARNER_ID, "member-1");

      expect(mockApp.db.delete).toHaveBeenCalledTimes(2);
      expect(mockApp.identityClient.revokeAccess).toHaveBeenCalledWith("member-1", LEARNER_ID);
    });
  });
});
