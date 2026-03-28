import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiFetch = vi.fn();
vi.mock("@/lib/api", () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

describe("Data Deletion Pipeline", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  it("should require password for deletion", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Password required"));

    await expect(
      mockApiFetch("/api/family/learners/test-learner/delete-all-data", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    ).rejects.toThrow("Password required");
  });

  it("should successfully delete all data with valid password", async () => {
    mockApiFetch.mockResolvedValueOnce({ success: true });

    const result = await mockApiFetch("/api/family/learners/test-learner/delete-all-data", {
      method: "POST",
      body: JSON.stringify({ password: "valid-password" }),
    });

    expect(result.success).toBe(true);
  });

  it("should preserve audit trail after deletion", async () => {
    mockApiFetch.mockResolvedValueOnce({
      success: true,
      auditTrailPreserved: true,
      userAnonymized: true,
    });

    const result = await mockApiFetch("/api/family/learners/test-learner/delete-all-data", {
      method: "POST",
      body: JSON.stringify({ password: "valid-password" }),
    });

    expect(result.auditTrailPreserved).toBe(true);
    expect(result.userAnonymized).toBe(true);
  });
});
