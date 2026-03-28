import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClassroomService } from "../services/classroom.service.js";

const MOCK_UUID = "00000000-0000-4000-a000-000000000001";
const MOCK_TENANT = "00000000-0000-4000-a000-000000000010";
const MOCK_TEACHER = "00000000-0000-4000-a000-000000000020";
const MOCK_LEARNER_1 = "00000000-0000-4000-a000-000000000030";
const MOCK_LEARNER_2 = "00000000-0000-4000-a000-000000000031";

function createMockApp() {
  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
          onConflictDoNothing: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
  } as any;
}

describe("ClassroomService", () => {
  let app: ReturnType<typeof createMockApp>;
  let service: ClassroomService;

  beforeEach(() => {
    app = createMockApp();
    service = new ClassroomService(app);
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a classroom with name and grade band", async () => {
      const expected = {
        id: MOCK_UUID,
        tenantId: MOCK_TENANT,
        name: "Math Grade 3",
        gradeBand: "K-5",
        teacherId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([expected]),
        }),
      });

      const result = await service.create(MOCK_TENANT, {
        name: "Math Grade 3",
        gradeBand: "K-5",
      }, "admin-user-id");

      expect(result).toEqual(expected);
      expect(app.db.insert).toHaveBeenCalled();
    });

    it("should create a classroom with teacher assigned", async () => {
      const expected = {
        id: MOCK_UUID,
        tenantId: MOCK_TENANT,
        name: "ELA Grade 5",
        gradeBand: "3-5",
        teacherId: MOCK_TEACHER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([expected]),
        }),
      });

      const result = await service.create(MOCK_TENANT, {
        name: "ELA Grade 5",
        gradeBand: "3-5",
        teacherId: MOCK_TEACHER,
      }, "admin-user-id");

      expect(result.teacherId).toBe(MOCK_TEACHER);
    });
  });

  describe("list", () => {
    it("should return classrooms for a tenant", async () => {
      const classrooms = [
        {
          id: MOCK_UUID,
          name: "Math Grade 3",
          gradeBand: "K-5",
          teacherId: MOCK_TEACHER,
          teacherName: "Jane Smith",
          teacherEmail: "jane@school.org",
          learnerCount: 15,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(classrooms),
            }),
          }),
        }),
      });

      const result = await service.list(MOCK_TENANT);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Math Grade 3");
      expect(result[0].learnerCount).toBe(15);
    });
  });

  describe("getById", () => {
    it("should return a classroom by ID within tenant", async () => {
      const classroom = {
        id: MOCK_UUID,
        name: "Math Grade 3",
        tenantId: MOCK_TENANT,
      };

      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([classroom]),
            }),
          }),
        }),
      });

      const result = await service.getById(MOCK_UUID, MOCK_TENANT);
      expect(result).toBeTruthy();
      expect(result!.id).toBe(MOCK_UUID);
    });

    it("should return null if classroom not found", async () => {
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      const result = await service.getById("nonexistent-id", MOCK_TENANT);
      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should update classroom name", async () => {
      const updated = {
        id: MOCK_UUID,
        name: "Updated Name",
        tenantId: MOCK_TENANT,
      };

      app.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updated]),
          }),
        }),
      });

      const result = await service.update(MOCK_UUID, MOCK_TENANT, {
        name: "Updated Name",
      });
      expect(result).toBeTruthy();
      expect(result!.name).toBe("Updated Name");
    });
  });

  describe("softDelete", () => {
    it("should soft delete a classroom", async () => {
      const deleted = { id: MOCK_UUID, isDeleted: true };

      app.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([deleted]),
          }),
        }),
      });

      const result = await service.softDelete(MOCK_UUID, MOCK_TENANT);
      expect(result).toBeTruthy();
    });
  });

  describe("addLearners", () => {
    it("should add learners to a classroom", async () => {
      const added = [
        { classroomId: MOCK_UUID, learnerId: MOCK_LEARNER_1 },
        { classroomId: MOCK_UUID, learnerId: MOCK_LEARNER_2 },
      ];

      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflictDoNothing: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue(added),
          }),
        }),
      });

      const result = await service.addLearners(MOCK_UUID, [
        MOCK_LEARNER_1,
        MOCK_LEARNER_2,
      ]);
      expect(result).toHaveLength(2);
    });
  });

  describe("removeLearner", () => {
    it("should remove a learner from a classroom", async () => {
      const removed = { classroomId: MOCK_UUID, learnerId: MOCK_LEARNER_1 };

      app.db.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([removed]),
        }),
      });

      const result = await service.removeLearner(MOCK_UUID, MOCK_LEARNER_1);
      expect(result).toBeTruthy();
    });

    it("should return null if learner not in classroom", async () => {
      app.db.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.removeLearner(MOCK_UUID, "not-enrolled");
      expect(result).toBeNull();
    });
  });

  describe("getClassroomAnalytics", () => {
    it("should compute functioning level breakdown", async () => {
      const learners = [
        { learnerId: MOCK_LEARNER_1, name: "Alice", functioningLevel: "STANDARD", enrolledGrade: 3 },
        { learnerId: MOCK_LEARNER_2, name: "Bob", functioningLevel: "SUPPORTED", enrolledGrade: 3 },
      ];

      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(learners),
          }),
        }),
      });

      const result = await service.getClassroomAnalytics(MOCK_UUID);
      expect(result.learnerCount).toBe(2);
      expect(result.functioningLevelBreakdown.STANDARD).toBe(1);
      expect(result.functioningLevelBreakdown.SUPPORTED).toBe(1);
      expect(result.averageGrade).toBe(3);
    });
  });
});
