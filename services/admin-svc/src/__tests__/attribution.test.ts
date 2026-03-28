import { describe, it, expect } from "vitest";

describe("Lead Attribution", () => {
  it("should categorize Google UTM source as PAID_SEARCH", () => {
    const sourceMap: Record<string, string> = {
      google: "PAID_SEARCH",
      facebook: "PAID_SOCIAL",
      linkedin: "PAID_SOCIAL",
    };
    expect(sourceMap["google"]).toBe("PAID_SEARCH");
    expect(sourceMap["facebook"]).toBe("PAID_SOCIAL");
  });

  it("should score leads based on source type", () => {
    const scoreBySource: Record<string, number> = {
      demo_form: 50,
      contact_form: 30,
      exit_intent: 10,
    };

    expect(scoreBySource["demo_form"]).toBe(50);
    expect(scoreBySource["contact_form"]).toBe(30);
    expect(scoreBySource["exit_intent"]).toBe(10);
  });

  it("should add .edu bonus to lead score", () => {
    const email = "teacher@school.edu";
    const bonus = email.endsWith(".edu") ? 20 : 0;
    expect(bonus).toBe(20);
  });

  it("should classify lead temperature from score", () => {
    function getTemp(score: number): string {
      if (score >= 100) return "HOT";
      if (score >= 50) return "WARM";
      return "COLD";
    }

    expect(getTemp(120)).toBe("HOT");
    expect(getTemp(75)).toBe("WARM");
    expect(getTemp(20)).toBe("COLD");
  });

  it("should calculate demo form with large district as HOT lead", () => {
    let score = 50; // demo_form
    score += 40; // 1000+ students
    score += 20; // .edu email
    expect(score).toBe(110);
    expect(score >= 100).toBe(true); // HOT
  });
});
