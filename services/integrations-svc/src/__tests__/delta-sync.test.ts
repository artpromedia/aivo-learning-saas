import { describe, it, expect } from "vitest";
import { DeltaDetector } from "../sync/delta-detector.js";
import type { SisStudent, SisTeacher } from "../sync/roster-mapper.js";

describe("Delta Sync Detection", () => {
  const detector = new DeltaDetector();

  it("should detect added students after full sync then delta", () => {
    const previous = new Map<string, SisStudent>([
      ["sis-1", { sisId: "sis-1", firstName: "Alice", lastName: "Smith", email: "alice@school.com", grade: "3" }],
    ]);

    const current: SisStudent[] = [
      { sisId: "sis-1", firstName: "Alice", lastName: "Smith", email: "alice@school.com", grade: "3" },
      { sisId: "sis-2", firstName: "Bob", lastName: "Jones", email: "bob@school.com", grade: "4" },
    ];

    const delta = detector.detectStudentChanges(current, previous);

    expect(delta.added).toHaveLength(1);
    expect(delta.added[0].sisId).toBe("sis-2");
    expect(delta.updated).toHaveLength(0);
    expect(delta.deleted).toHaveLength(0);
  });

  it("should detect updated students when fields change", () => {
    const previous = new Map<string, SisStudent>([
      ["sis-1", { sisId: "sis-1", firstName: "Alice", lastName: "Smith", email: "alice@school.com", grade: "3" }],
    ]);

    const current: SisStudent[] = [
      { sisId: "sis-1", firstName: "Alice", lastName: "Smith", email: "alice@school.com", grade: "4" },
    ];

    const delta = detector.detectStudentChanges(current, previous);

    expect(delta.added).toHaveLength(0);
    expect(delta.updated).toHaveLength(1);
    expect(delta.updated[0].grade).toBe("4");
    expect(delta.deleted).toHaveLength(0);
  });

  it("should detect deactivated students removed from SIS", () => {
    const previous = new Map<string, SisStudent>([
      ["sis-1", { sisId: "sis-1", firstName: "Alice", lastName: "Smith", email: "alice@school.com", grade: "3" }],
      ["sis-2", { sisId: "sis-2", firstName: "Bob", lastName: "Jones", email: "bob@school.com", grade: "4" }],
    ]);

    const current: SisStudent[] = [
      { sisId: "sis-1", firstName: "Alice", lastName: "Smith", email: "alice@school.com", grade: "3" },
    ];

    const delta = detector.detectStudentChanges(current, previous);

    expect(delta.added).toHaveLength(0);
    expect(delta.updated).toHaveLength(0);
    expect(delta.deleted).toHaveLength(1);
    expect(delta.deleted[0]).toBe("sis-2");
  });

  it("should detect teacher changes", () => {
    const previous = new Map<string, SisTeacher>([
      ["t-1", { sisId: "t-1", firstName: "Jane", lastName: "Doe", email: "jane@school.com" }],
    ]);

    const current: SisTeacher[] = [
      { sisId: "t-1", firstName: "Jane", lastName: "Doe-Smith", email: "jane@school.com" },
      { sisId: "t-2", firstName: "John", lastName: "Teacher", email: "john@school.com" },
    ];

    const delta = detector.detectTeacherChanges(current, previous);

    expect(delta.added).toHaveLength(1);
    expect(delta.added[0].sisId).toBe("t-2");
    expect(delta.updated).toHaveLength(1);
    expect(delta.updated[0].lastName).toBe("Doe-Smith");
  });

  it("should handle empty previous roster (first sync treated as all added)", () => {
    const previous = new Map<string, SisStudent>();
    const current: SisStudent[] = [
      { sisId: "sis-1", firstName: "Alice", lastName: "Smith", email: "alice@school.com" },
      { sisId: "sis-2", firstName: "Bob", lastName: "Jones", email: "bob@school.com" },
    ];

    const delta = detector.detectStudentChanges(current, previous);

    expect(delta.added).toHaveLength(2);
    expect(delta.updated).toHaveLength(0);
    expect(delta.deleted).toHaveLength(0);
  });
});
