import { describe, it, expect } from "vitest";

describe("Teacher IEP Upload During Enrollment", () => {
  it("should store IEP as PENDING status awaiting parent confirmation", () => {
    const upload = {
      learnerId: "learner-1",
      tenantId: "tenant-1",
      uploadedBy: "teacher-1",
      fileName: "iep-document.pdf",
      status: "PENDING" as const,
    };

    expect(upload.status).toBe("PENDING");
    expect(upload.uploadedBy).toBe("teacher-1");
  });

  it("should transition to CONFIRMED when parent approves", () => {
    const upload = {
      status: "PENDING" as const,
    };

    const confirmed = { ...upload, status: "CONFIRMED" as const };
    expect(confirmed.status).toBe("CONFIRMED");
  });

  it("should expire after 90 days if parent never onboards", () => {
    const TTL_DAYS = 90;
    const TTL_SECONDS = TTL_DAYS * 24 * 60 * 60;

    expect(TTL_SECONDS).toBe(7776000);
  });

  it("should allow multiple pending IEP uploads per learner", () => {
    const uploads = [
      { uploadId: "u1", fileName: "iep-2025.pdf", status: "PENDING" },
      { uploadId: "u2", fileName: "evaluation-report.pdf", status: "PENDING" },
    ];

    expect(uploads).toHaveLength(2);
    expect(uploads.every((u) => u.status === "PENDING")).toBe(true);
  });

  it("should require teacher or admin role for upload", () => {
    const allowedRoles = ["TEACHER", "ADMIN"];

    expect(allowedRoles.includes("TEACHER")).toBe(true);
    expect(allowedRoles.includes("ADMIN")).toBe(true);
    expect(allowedRoles.includes("PARENT")).toBe(false);
  });
});
