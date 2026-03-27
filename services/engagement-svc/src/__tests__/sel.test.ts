import { describe, it, expect, vi } from "vitest";
import { SEL_EMOTIONS, BREAK_ACTIVITIES, getBreakActivity } from "../data/sel-activities.js";
import { SelService } from "../services/sel.service.js";

describe("SEL Emotions", () => {
  it("has 5 emotion options", () => {
    expect(SEL_EMOTIONS).toHaveLength(5);
  });

  it("covers happy, calm, tired, frustrated, sad", () => {
    const emotions = SEL_EMOTIONS.map((e) => e.emotion);
    expect(emotions).toEqual(["happy", "calm", "tired", "frustrated", "sad"]);
  });

  it("each emotion has emoji, label, and follow-up prompt", () => {
    for (const emotion of SEL_EMOTIONS) {
      expect(emotion.emoji).toBeTruthy();
      expect(emotion.label).toBeTruthy();
      expect(emotion.followUpPrompt).toBeTruthy();
    }
  });
});

describe("Break Activities", () => {
  it("has 4 break activities", () => {
    expect(BREAK_ACTIVITIES).toHaveLength(4);
  });

  it("covers breathing, stretch, mindfulness, fidget", () => {
    const types = BREAK_ACTIVITIES.map((a) => a.type);
    expect(types).toEqual(["breathing", "stretch", "mindfulness", "fidget"]);
  });

  it("breathing is 60 seconds", () => {
    const breathing = getBreakActivity("breathing")!;
    expect(breathing.durationSeconds).toBe(60);
    expect(breathing.xpReward).toBe(5);
  });

  it("stretch is 90 seconds", () => {
    const stretch = getBreakActivity("stretch")!;
    expect(stretch.durationSeconds).toBe(90);
  });

  it("mindfulness is 120 seconds", () => {
    const mindfulness = getBreakActivity("mindfulness")!;
    expect(mindfulness.durationSeconds).toBe(120);
  });

  it("fidget is 30 seconds", () => {
    const fidget = getBreakActivity("fidget")!;
    expect(fidget.durationSeconds).toBe(30);
  });

  it("each activity has instructions", () => {
    for (const activity of BREAK_ACTIVITIES) {
      expect(activity.instructions.length).toBeGreaterThan(0);
    }
  });

  it("all activities reward 5 XP", () => {
    for (const activity of BREAK_ACTIVITIES) {
      expect(activity.xpReward).toBe(5);
    }
  });
});

describe("SelService", () => {
  function createMockApp() {
    const redisStore = new Map<string, string>();
    const redisList = new Map<string, string[]>();

    return {
      redis: {
        get: vi.fn().mockImplementation(async (key: string) => redisStore.get(key) ?? null),
        set: vi.fn().mockImplementation(async (key: string, value: string) => {
          redisStore.set(key, value);
        }),
        lpush: vi.fn().mockImplementation(async (key: string, value: string) => {
          if (!redisList.has(key)) redisList.set(key, []);
          redisList.get(key)!.unshift(value);
        }),
        ltrim: vi.fn().mockResolvedValue("OK"),
        lrange: vi.fn().mockImplementation(async (key: string) => {
          return redisList.get(key) ?? [];
        }),
      },
      nats: {
        jetstream: vi.fn().mockReturnValue({
          publish: vi.fn().mockResolvedValue(undefined),
        }),
      },
      db: {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                { id: "xp-1", learnerId: "l1", totalXp: 50, level: 1, virtualCurrency: 100 },
              ]),
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue(undefined),
        }),
      },
      brainClient: {
        getEngagementProfile: vi.fn().mockResolvedValue({ functioningLevel: "STANDARD" }),
      },
      log: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    };
  }

  describe("submitCheckin", () => {
    it("saves checkin and awards 5 XP", async () => {
      const mockApp = createMockApp();
      const service = new SelService(mockApp as never);
      const result = await service.submitCheckin("learner-1", "happy", "Had a great morning!");

      expect(result.xpAwarded).toBe(5);
      expect(result.followUpPrompt).toContain("wonderful");
    });

    it("returns appropriate follow-up for frustrated", async () => {
      const mockApp = createMockApp();
      const service = new SelService(mockApp as never);
      const result = await service.submitCheckin("learner-1", "frustrated", null);

      expect(result.followUpPrompt).toContain("frustrated");
    });
  });

  describe("getHistory", () => {
    it("returns empty array for new learner", async () => {
      const mockApp = createMockApp();
      const service = new SelService(mockApp as never);
      const history = await service.getHistory("learner-1");

      expect(history).toEqual([]);
    });
  });
});
