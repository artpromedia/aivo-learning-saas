import { describe, it, expect } from "vitest";
import { DeltaDetector } from "../sync/delta-detector.js";
import { ConflictResolver } from "../sync/conflict-resolver.js";
import type { SisStudent, SisTeacher } from "../sync/roster-mapper.js";

describe("DeltaDetector", () => {
  const detector = new DeltaDetector();

  describe("detectStudentChanges", () => {
    it("should identify added students", () => {
      const current: SisStudent[] = [
        { sisId: "stu-1", firstName: "Alice", lastName: "Smith", email: "alice@school.org", grade: "5" },
        { sisId: "stu-2", firstName: "Bob", lastName: "Jones", email: "bob@school.org", grade: "3" },
      ];
      const previous = new Map<string, SisStudent>();

      const result = detector.detectStudentChanges(current, previous);

      expect(result.added).toHaveLength(2);
      expect(result.added[0].sisId).toBe("stu-1");
      expect(result.added[1].sisId).toBe("stu-2");
      expect(result.updated).toHaveLength(0);
      expect(result.deleted).toHaveLength(0);
    });

    it("should identify updated students", () => {
      const current: SisStudent[] = [
        { sisId: "stu-1", firstName: "Alice", lastName: "Smith", email: "alice@school.org", grade: "6" },
      ];
      const previous = new Map<string, SisStudent>([
        ["stu-1", { sisId: "stu-1", firstName: "Alice", lastName: "Smith", email: "alice@school.org", grade: "5" }],
      ]);

      const result = detector.detectStudentChanges(current, previous);

      expect(result.added).toHaveLength(0);
      expect(result.updated).toHaveLength(1);
      expect(result.updated[0].grade).toBe("6");
      expect(result.deleted).toHaveLength(0);
    });

    it("should identify deleted students", () => {
      const current: SisStudent[] = [];
      const previous = new Map<string, SisStudent>([
        ["stu-1", { sisId: "stu-1", firstName: "Alice", lastName: "Smith", email: "alice@school.org", grade: "5" }],
        ["stu-2", { sisId: "stu-2", firstName: "Bob", lastName: "Jones", email: "bob@school.org", grade: "3" }],
      ]);

      const result = detector.detectStudentChanges(current, previous);

      expect(result.added).toHaveLength(0);
      expect(result.updated).toHaveLength(0);
      expect(result.deleted).toHaveLength(2);
      expect(result.deleted).toContain("stu-1");
      expect(result.deleted).toContain("stu-2");
    });

    it("should handle mixed adds, updates, and deletes", () => {
      const current: SisStudent[] = [
        { sisId: "stu-1", firstName: "Alice", lastName: "Smith", email: "alice@school.org", grade: "6" }, // updated grade
        { sisId: "stu-3", firstName: "Charlie", lastName: "Brown", email: "charlie@school.org", grade: "4" }, // new
      ];
      const previous = new Map<string, SisStudent>([
        ["stu-1", { sisId: "stu-1", firstName: "Alice", lastName: "Smith", email: "alice@school.org", grade: "5" }],
        ["stu-2", { sisId: "stu-2", firstName: "Bob", lastName: "Jones", email: "bob@school.org", grade: "3" }], // deleted
      ]);

      const result = detector.detectStudentChanges(current, previous);

      expect(result.added).toHaveLength(1);
      expect(result.added[0].sisId).toBe("stu-3");
      expect(result.updated).toHaveLength(1);
      expect(result.updated[0].sisId).toBe("stu-1");
      expect(result.deleted).toHaveLength(1);
      expect(result.deleted[0]).toBe("stu-2");
    });

    it("should detect no changes when rosters match", () => {
      const student: SisStudent = { sisId: "stu-1", firstName: "Alice", lastName: "Smith", email: "alice@school.org", grade: "5" };
      const current: SisStudent[] = [student];
      const previous = new Map<string, SisStudent>([["stu-1", { ...student }]]);

      const result = detector.detectStudentChanges(current, previous);

      expect(result.added).toHaveLength(0);
      expect(result.updated).toHaveLength(0);
      expect(result.deleted).toHaveLength(0);
    });

    it("should detect name changes", () => {
      const current: SisStudent[] = [
        { sisId: "stu-1", firstName: "Alicia", lastName: "Smith", email: "alice@school.org", grade: "5" },
      ];
      const previous = new Map<string, SisStudent>([
        ["stu-1", { sisId: "stu-1", firstName: "Alice", lastName: "Smith", email: "alice@school.org", grade: "5" }],
      ]);

      const result = detector.detectStudentChanges(current, previous);

      expect(result.updated).toHaveLength(1);
      expect(result.updated[0].firstName).toBe("Alicia");
    });

    it("should detect email changes", () => {
      const current: SisStudent[] = [
        { sisId: "stu-1", firstName: "Alice", lastName: "Smith", email: "newalice@school.org", grade: "5" },
      ];
      const previous = new Map<string, SisStudent>([
        ["stu-1", { sisId: "stu-1", firstName: "Alice", lastName: "Smith", email: "alice@school.org", grade: "5" }],
      ]);

      const result = detector.detectStudentChanges(current, previous);

      expect(result.updated).toHaveLength(1);
    });

    it("should detect school name changes", () => {
      const current: SisStudent[] = [
        { sisId: "stu-1", firstName: "Alice", lastName: "Smith", email: "alice@school.org", grade: "5", schoolName: "New School" },
      ];
      const previous = new Map<string, SisStudent>([
        ["stu-1", { sisId: "stu-1", firstName: "Alice", lastName: "Smith", email: "alice@school.org", grade: "5", schoolName: "Old School" }],
      ]);

      const result = detector.detectStudentChanges(current, previous);

      expect(result.updated).toHaveLength(1);
    });
  });

  describe("detectTeacherChanges", () => {
    it("should identify added teachers", () => {
      const current: SisTeacher[] = [
        { sisId: "tch-1", firstName: "Bob", lastName: "Jones", email: "bob@school.org" },
      ];
      const previous = new Map<string, SisTeacher>();

      const result = detector.detectTeacherChanges(current, previous);

      expect(result.added).toHaveLength(1);
      expect(result.added[0].sisId).toBe("tch-1");
      expect(result.updated).toHaveLength(0);
      expect(result.deleted).toHaveLength(0);
    });

    it("should identify updated teachers", () => {
      const current: SisTeacher[] = [
        { sisId: "tch-1", firstName: "Robert", lastName: "Jones", email: "bob@school.org" },
      ];
      const previous = new Map<string, SisTeacher>([
        ["tch-1", { sisId: "tch-1", firstName: "Bob", lastName: "Jones", email: "bob@school.org" }],
      ]);

      const result = detector.detectTeacherChanges(current, previous);

      expect(result.added).toHaveLength(0);
      expect(result.updated).toHaveLength(1);
      expect(result.updated[0].firstName).toBe("Robert");
      expect(result.deleted).toHaveLength(0);
    });

    it("should identify deleted teachers", () => {
      const current: SisTeacher[] = [];
      const previous = new Map<string, SisTeacher>([
        ["tch-1", { sisId: "tch-1", firstName: "Bob", lastName: "Jones", email: "bob@school.org" }],
      ]);

      const result = detector.detectTeacherChanges(current, previous);

      expect(result.added).toHaveLength(0);
      expect(result.updated).toHaveLength(0);
      expect(result.deleted).toHaveLength(1);
      expect(result.deleted[0]).toBe("tch-1");
    });

    it("should detect teacher email changes", () => {
      const current: SisTeacher[] = [
        { sisId: "tch-1", firstName: "Bob", lastName: "Jones", email: "robert.jones@school.org" },
      ];
      const previous = new Map<string, SisTeacher>([
        ["tch-1", { sisId: "tch-1", firstName: "Bob", lastName: "Jones", email: "bob@school.org" }],
      ]);

      const result = detector.detectTeacherChanges(current, previous);

      expect(result.updated).toHaveLength(1);
    });

    it("should detect no changes when teachers match", () => {
      const teacher: SisTeacher = { sisId: "tch-1", firstName: "Bob", lastName: "Jones", email: "bob@school.org" };
      const current: SisTeacher[] = [teacher];
      const previous = new Map<string, SisTeacher>([["tch-1", { ...teacher }]]);

      const result = detector.detectTeacherChanges(current, previous);

      expect(result.added).toHaveLength(0);
      expect(result.updated).toHaveLength(0);
      expect(result.deleted).toHaveLength(0);
    });
  });
});

describe("ConflictResolver", () => {
  const resolver = new ConflictResolver();

  describe("resolveStudentConflict", () => {
    it("should return MOVE when student changed schools", () => {
      const incoming: SisStudent = {
        sisId: "stu-1",
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@school.org",
        grade: "5",
        schoolName: "New School",
      };
      const existing = { name: "Alice Smith", schoolName: "Old School", grade: "5" };

      const result = resolver.resolveStudentConflict(incoming, existing);

      expect(result.action).toBe("MOVE");
      expect(result.reason).toContain("Old School");
      expect(result.reason).toContain("New School");
    });

    it("should return UPDATE when name changed", () => {
      const incoming: SisStudent = {
        sisId: "stu-1",
        firstName: "Alicia",
        lastName: "Smith",
        email: "alice@school.org",
        grade: "5",
        schoolName: "Lincoln Elementary",
      };
      const existing = { name: "Alice Smith", schoolName: "Lincoln Elementary", grade: "5" };

      const result = resolver.resolveStudentConflict(incoming, existing);

      expect(result.action).toBe("UPDATE");
      expect(result.reason).toContain("Name changed");
    });

    it("should return UPDATE when grade changed", () => {
      const incoming: SisStudent = {
        sisId: "stu-1",
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@school.org",
        grade: "6",
        schoolName: "Lincoln Elementary",
      };
      const existing = { name: "Alice Smith", schoolName: "Lincoln Elementary", grade: "5" };

      const result = resolver.resolveStudentConflict(incoming, existing);

      expect(result.action).toBe("UPDATE");
      expect(result.reason).toContain("Grade changed");
    });

    it("should return SKIP when no meaningful changes detected", () => {
      const incoming: SisStudent = {
        sisId: "stu-1",
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@school.org",
        grade: "5",
        schoolName: "Lincoln Elementary",
      };
      const existing = { name: "Alice Smith", schoolName: "Lincoln Elementary", grade: "5" };

      const result = resolver.resolveStudentConflict(incoming, existing);

      expect(result.action).toBe("SKIP");
      expect(result.reason).toBe("No meaningful changes detected");
    });

    it("should prioritize school move over name change", () => {
      const incoming: SisStudent = {
        sisId: "stu-1",
        firstName: "Alicia",
        lastName: "Smith-Jones",
        email: "alice@school.org",
        grade: "5",
        schoolName: "New School",
      };
      const existing = { name: "Alice Smith", schoolName: "Old School", grade: "5" };

      const result = resolver.resolveStudentConflict(incoming, existing);

      expect(result.action).toBe("MOVE");
    });
  });

  describe("resolveEmailConflict", () => {
    it("should return UPDATE when email changed", () => {
      const result = resolver.resolveEmailConflict("new@school.org", "old@school.org");

      expect(result.action).toBe("UPDATE");
      expect(result.reason).toContain("new@school.org");
    });

    it("should return SKIP when emails are the same", () => {
      const result = resolver.resolveEmailConflict("same@school.org", "same@school.org");

      expect(result.action).toBe("SKIP");
      expect(result.reason).toBe("Emails match");
    });
  });
});
