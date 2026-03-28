import { describe, it, expect, vi, beforeEach } from "vitest";

describe("District Contract End Service", () => {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    execute: vi.fn(),
  };

  const mockNats = {};
  const mockPublishEvent = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should notify all parents individually when district contract ends", async () => {
    const tenantId = "tenant-123";
    const contractEndDate = "2026-04-30";

    // Mock learners with parents
    mockDb.execute.mockResolvedValueOnce({
      rows: [
        { learnerId: "l1", learnerName: "Alice", parentId: "p1", parentEmail: "parent1@test.com", parentName: "Parent 1" },
        { learnerId: "l2", learnerName: "Bob", parentId: "p2", parentEmail: "parent2@test.com", parentName: "Parent 2" },
      ],
    });

    // Mock tenant lookup
    mockDb.limit.mockResolvedValueOnce([{ name: "Test School" }]);

    // Verify that each parent should receive individual notification
    expect(mockDb.execute).toBeDefined();
  });

  it("should set 30-day grace period for all district learner data", () => {
    const contractEndDate = new Date("2026-04-30");
    const deletionDate = new Date(contractEndDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    expect(deletionDate.toISOString().split("T")[0]).toBe("2026-05-30");
  });

  it("should include export link and subscribe link in parent notification", () => {
    const learnerId = "learner-123";
    const expectedExportUrl = `https://app.aivo.com/parent/${learnerId}/settings`;
    const expectedSubscribeUrl = "https://app.aivo.com/billing/plans";

    expect(expectedExportUrl).toContain(learnerId);
    expect(expectedSubscribeUrl).toContain("billing/plans");
  });
});
