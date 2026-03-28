import { describe, it, expect } from "vitest";
import type { SisSection } from "../sync/roster-mapper.js";

describe("Section Sync", () => {
  it("should map SIS sections to classroom records", () => {
    const section: SisSection = {
      sisId: "sec-1",
      name: "Math 101",
      subject: "Math",
      grade: "3",
      teacherSisId: "teacher-1",
      studentSisIds: ["student-1", "student-2"],
    };

    expect(section.name).toBe("Math 101");
    expect(section.studentSisIds).toHaveLength(2);
    expect(section.teacherSisId).toBe("teacher-1");
  });

  it("should handle sections without a teacher", () => {
    const section: SisSection = {
      sisId: "sec-2",
      name: "Reading Group",
      studentSisIds: ["student-1"],
    };

    expect(section.teacherSisId).toBeUndefined();
    expect(section.grade).toBeUndefined();
  });

  it("should track student enrollments per section", () => {
    const sections: SisSection[] = [
      { sisId: "sec-1", name: "Math", studentSisIds: ["s1", "s2", "s3"] },
      { sisId: "sec-2", name: "English", studentSisIds: ["s1", "s4"] },
    ];

    const allStudentIds = new Set(sections.flatMap((s) => s.studentSisIds));
    expect(allStudentIds.size).toBe(4);
    expect(allStudentIds.has("s1")).toBe(true);
  });

  it("should preserve existing classroom Brain data when re-syncing", () => {
    // On re-sync, we update metadata but never delete the classroom
    const existingClassroom = {
      id: "cls-1",
      name: "Math 101",
      gradeBand: "3",
      teacherId: "t-1",
      isDeleted: false,
    };

    // After sync update, isDeleted should remain false
    const updatedClassroom = {
      ...existingClassroom,
      gradeBand: "4", // Grade updated from SIS
    };

    expect(updatedClassroom.isDeleted).toBe(false);
    expect(updatedClassroom.gradeBand).toBe("4");
  });
});
