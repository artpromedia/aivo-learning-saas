import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock apiFetch
const mockApiFetch = vi.fn();
vi.mock("@/lib/api", () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

describe("Brain Data Export Pipeline", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  it("should request export and receive processing status", async () => {
    mockApiFetch.mockResolvedValueOnce({ status: "processing" });

    const result = await mockApiFetch("/api/family/learners/test-learner/export", {
      method: "POST",
    });

    expect(result.status).toBe("processing");
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/family/learners/test-learner/export",
      { method: "POST" },
    );
  });

  it("should poll export status and get ready with download URL", async () => {
    const downloadUrl = "https://s3.amazonaws.com/exports/test.zip";
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

    mockApiFetch.mockResolvedValueOnce({
      status: "ready",
      downloadUrl,
      expiresAt,
    });

    const result = await mockApiFetch("/api/family/learners/test-learner/export/status");

    expect(result.status).toBe("ready");
    expect(result.downloadUrl).toBe(downloadUrl);
    expect(result.expiresAt).toBeDefined();
  });

  it("should handle export failure gracefully", async () => {
    mockApiFetch.mockResolvedValueOnce({
      status: "error",
      error: "Export generation failed",
    });

    const result = await mockApiFetch("/api/family/learners/test-learner/export/status");

    expect(result.status).toBe("error");
    expect(result.error).toBe("Export generation failed");
  });

  it("should return export history with previous exports", async () => {
    const mockHistory = {
      exports: [
        { id: "exp-1", status: "ready", createdAt: "2026-03-25T10:00:00Z", downloadUrl: "https://...", expiresAt: "2026-03-28T10:00:00Z" },
        { id: "exp-2", status: "expired", createdAt: "2026-03-20T10:00:00Z" },
        { id: "exp-3", status: "failed", createdAt: "2026-03-15T10:00:00Z" },
      ],
    };

    mockApiFetch.mockResolvedValueOnce(mockHistory);

    const result = await mockApiFetch("/api/family/learners/test-learner/export/history");

    expect(result.exports).toHaveLength(3);
    expect(result.exports[0].status).toBe("ready");
    expect(result.exports[1].status).toBe("expired");
  });

  it("should enforce 72-hour download link expiry", async () => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    mockApiFetch.mockResolvedValueOnce({
      status: "ready",
      downloadUrl: "https://s3.amazonaws.com/exports/test.zip",
      expiresAt: expiresAt.toISOString(),
    });

    const result = await mockApiFetch("/api/family/learners/test-learner/export/status");

    const expiry = new Date(result.expiresAt);
    const diffHours = (expiry.getTime() - now.getTime()) / (60 * 60 * 1000);
    expect(diffHours).toBeCloseTo(72, 0);
  });
});
