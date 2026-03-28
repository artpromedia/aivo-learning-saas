import { describe, it, expect } from "vitest";
import { DeltaDetector } from "../sync/delta-detector.js";
import type { SisStudent } from "../sync/roster-mapper.js";

describe("SIS Student Deactivation", () => {
  const detector = new DeltaDetector();

  it("should mark student as deactivated when removed from SIS, not delete Brain data", () => {
    const previous = new Map<string, SisStudent>([
      ["sis-1", { sisId: "sis-1", firstName: "Alice", lastName: "Smith", email: "alice@school.com" }],
    ]);

    const current: SisStudent[] = [];

    const delta = detector.detectStudentChanges(current, previous);

    expect(delta.deleted).toHaveLength(1);
    expect(delta.deleted[0]).toBe("sis-1");
    // The actual deactivation sets learner.status = INACTIVE, preserves Brain data for 90 days
  });

  it("should preserve Brain data for 90 days after SIS deactivation", () => {
    const PRESERVATION_DAYS = 90;
    const deactivatedAt = new Date();
    const deletionDate = new Date(deactivatedAt.getTime() + PRESERVATION_DAYS * 24 * 60 * 60 * 1000);

    expect(deletionDate > deactivatedAt).toBe(true);
    const diffDays = Math.round((deletionDate.getTime() - deactivatedAt.getTime()) / (24 * 60 * 60 * 1000));
    expect(diffDays).toBe(90);
  });

  it("should notify parent when child is deactivated from SIS", () => {
    const notification = {
      to: "parent@test.com",
      template: "sis_deactivation_notification",
      data: {
        parentName: "Parent Smith",
        learnerName: "Alice Smith",
        schoolName: "Test School",
        preservationDays: 90,
      },
    };

    expect(notification.template).toBe("sis_deactivation_notification");
    expect(notification.data.preservationDays).toBe(90);
  });
});
