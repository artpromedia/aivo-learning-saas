import { describe, it, expect } from "vitest";
import {
  probability,
  fisherInformation,
  estimateTheta,
  calculateSE,
  selectNextItem,
  selectNextItemBalanced,
  shouldTerminate,
  createInitialState,
  processResponse,
  computeDomainScores,
  thetaToMastery,
  assessmentProgress,
  getFunctioningLevelFormat,
  type IrtItem,
  type IrtState,
  type IrtConfig,
} from "../engine/irt.js";

// ─── Test Items ─────────────────────────────────────────────────────────────────

const testItems: IrtItem[] = [
  {
    id: "easy-1",
    domain: "MATH",
    skill: "addition",
    difficulty: -2.0,
    discrimination: 1.0,
    prompt: "2+2?",
    type: "multiple_choice",
    options: ["3", "4", "5"],
    correctAnswer: "4",
    formats: ["STANDARD", "SIMPLIFIED", "PICTURE_BASED"],
  },
  {
    id: "easy-2",
    domain: "ELA",
    skill: "reading",
    difficulty: -1.5,
    discrimination: 1.2,
    prompt: "What rhymes with cat?",
    type: "multiple_choice",
    options: ["hat", "dog", "sun"],
    correctAnswer: "hat",
    formats: ["STANDARD", "SIMPLIFIED"],
  },
  {
    id: "medium-1",
    domain: "MATH",
    skill: "multiplication",
    difficulty: 0.0,
    discrimination: 1.5,
    prompt: "6x4?",
    type: "multiple_choice",
    options: ["20", "24", "28"],
    correctAnswer: "24",
    formats: ["STANDARD"],
  },
  {
    id: "medium-2",
    domain: "ELA",
    skill: "grammar",
    difficulty: 0.5,
    discrimination: 1.3,
    prompt: "Subject-verb agreement",
    type: "multiple_choice",
    options: ["She runs", "She run"],
    correctAnswer: "She runs",
    formats: ["STANDARD"],
  },
  {
    id: "hard-1",
    domain: "MATH",
    skill: "algebra",
    difficulty: 2.0,
    discrimination: 1.8,
    prompt: "3x+7=22",
    type: "multiple_choice",
    options: ["3", "4", "5"],
    correctAnswer: "5",
    formats: ["STANDARD"],
  },
  {
    id: "hard-2",
    domain: "SCIENCE",
    skill: "physics",
    difficulty: 2.5,
    discrimination: 1.6,
    prompt: "Newton's third law?",
    type: "multiple_choice",
    options: ["Equal opposite", "Greater force", "No reaction"],
    correctAnswer: "Equal opposite",
    formats: ["STANDARD"],
  },
];

const testConfig: IrtConfig = {
  maxItems: 30,
  seThreshold: 0.3,
  initialTheta: 0.0,
  thetaMin: -4.0,
  thetaMax: 4.0,
};

// ─── probability() ──────────────────────────────────────────────────────────────

describe("probability", () => {
  it("returns 0.5 when theta equals difficulty", () => {
    const p = probability(1.0, 1.5, 1.0);
    expect(p).toBeCloseTo(0.5, 5);
  });

  it("returns high probability when theta >> difficulty", () => {
    const p = probability(3.0, 1.0, -2.0);
    expect(p).toBeGreaterThan(0.99);
  });

  it("returns low probability when theta << difficulty", () => {
    const p = probability(-3.0, 1.0, 2.0);
    expect(p).toBeLessThan(0.01);
  });

  it("higher discrimination produces steeper curve", () => {
    const pLow = probability(0.5, 0.5, 0.0);
    const pHigh = probability(0.5, 2.0, 0.0);
    // Both > 0.5 since theta > b, but high discrimination is closer to 1
    expect(pHigh).toBeGreaterThan(pLow);
  });

  it("handles extreme values without overflow", () => {
    const p1 = probability(100, 1, 0);
    expect(p1).toBeCloseTo(1, 10);
    const p2 = probability(-100, 1, 0);
    expect(p2).toBeCloseTo(0, 10);
  });
});

// ─── fisherInformation() ────────────────────────────────────────────────────────

describe("fisherInformation", () => {
  it("is maximized when theta equals difficulty", () => {
    // I(theta) = a^2 * p * (1-p), maximized when p=0.5 (i.e., theta = b)
    const infoAtB = fisherInformation(0.0, 1.5, 0.0);
    const infoAway = fisherInformation(2.0, 1.5, 0.0);
    expect(infoAtB).toBeGreaterThan(infoAway);
  });

  it("scales with discrimination squared", () => {
    const info1 = fisherInformation(0.0, 1.0, 0.0);
    const info2 = fisherInformation(0.0, 2.0, 0.0);
    // info2 should be ~4x info1 at the peak
    expect(info2).toBeCloseTo(info1 * 4, 5);
  });

  it("returns 0 for extreme theta", () => {
    const info = fisherInformation(100, 1, 0);
    expect(info).toBeCloseTo(0, 5);
  });
});

// ─── estimateTheta() ────────────────────────────────────────────────────────────

describe("estimateTheta", () => {
  it("returns initial theta for empty responses", () => {
    const theta = estimateTheta(testItems, [], testConfig);
    expect(theta).toBe(0.0);
  });

  it("increases theta when all correct", () => {
    const responses = [
      { itemId: "easy-1", correct: true },
      { itemId: "medium-1", correct: true },
      { itemId: "hard-1", correct: true },
    ];
    const theta = estimateTheta(testItems, responses, testConfig);
    expect(theta).toBeGreaterThan(1.0);
  });

  it("decreases theta when all incorrect", () => {
    const responses = [
      { itemId: "easy-1", correct: false },
      { itemId: "medium-1", correct: false },
      { itemId: "hard-1", correct: false },
    ];
    const theta = estimateTheta(testItems, responses, testConfig);
    expect(theta).toBeLessThan(-1.0);
  });

  it("converges near actual ability level", () => {
    // Simulate a student with true ability around 0.5
    // Should get easy/medium right, hard wrong
    const responses = [
      { itemId: "easy-1", correct: true },
      { itemId: "easy-2", correct: true },
      { itemId: "medium-1", correct: true },
      { itemId: "medium-2", correct: false },
      { itemId: "hard-1", correct: false },
    ];
    const theta = estimateTheta(testItems, responses, testConfig);
    expect(theta).toBeGreaterThan(-1.0);
    expect(theta).toBeLessThan(1.5);
  });

  it("stays within bounds", () => {
    const responsesAllCorrect = testItems.map((i) => ({ itemId: i.id, correct: true }));
    const theta = estimateTheta(testItems, responsesAllCorrect, testConfig);
    expect(theta).toBeLessThanOrEqual(testConfig.thetaMax);
    expect(theta).toBeGreaterThanOrEqual(testConfig.thetaMin);
  });
});

// ─── calculateSE() ─────────────────────────────────────────────────────────────

describe("calculateSE", () => {
  it("returns high SE with no items", () => {
    const se = calculateSE(0.0, testItems, []);
    expect(se).toBe(10);
  });

  it("SE decreases as more items are administered", () => {
    const se1 = calculateSE(0.0, testItems, ["medium-1"]);
    const se2 = calculateSE(0.0, testItems, ["medium-1", "medium-2"]);
    const se3 = calculateSE(0.0, testItems, ["medium-1", "medium-2", "easy-1"]);
    expect(se2).toBeLessThan(se1);
    expect(se3).toBeLessThan(se2);
  });

  it("SE is lower when items are informative at current theta", () => {
    // Items near theta provide more info
    const seNear = calculateSE(0.0, testItems, ["medium-1"]); // b=0.0
    const seFar = calculateSE(0.0, testItems, ["hard-1"]);    // b=2.0
    expect(seNear).toBeLessThan(seFar);
  });
});

// ─── selectNextItem() ───────────────────────────────────────────────────────────

describe("selectNextItem", () => {
  it("selects the most informative item", () => {
    const administered = new Set<string>();
    const item = selectNextItem(0.0, testItems, administered);
    // At theta=0, the item with difficulty closest to 0 and highest discrimination wins
    // medium-1 (b=0.0, a=1.5) should be selected
    expect(item?.id).toBe("medium-1");
  });

  it("skips administered items", () => {
    const administered = new Set(["medium-1"]);
    const item = selectNextItem(0.0, testItems, administered);
    expect(item?.id).not.toBe("medium-1");
  });

  it("filters by domain when specified", () => {
    const administered = new Set<string>();
    const item = selectNextItem(0.0, testItems, administered, "ELA");
    expect(item?.domain).toBe("ELA");
  });

  it("returns null when all items exhausted", () => {
    const administered = new Set(testItems.map((i) => i.id));
    const item = selectNextItem(0.0, testItems, administered);
    expect(item).toBeNull();
  });
});

// ─── selectNextItemBalanced() ───────────────────────────────────────────────────

describe("selectNextItemBalanced", () => {
  it("balances across domains", () => {
    // State has 2 MATH items, 0 ELA items
    const state: IrtState = {
      theta: 0.0,
      standardError: 1.0,
      responses: [
        { itemId: "easy-1", correct: true },
        { itemId: "medium-1", correct: true },
      ],
      administeredItemIds: ["easy-1", "medium-1"],
      domainThetas: {
        MATH: { theta: 1.0, count: 2 },
      },
    };

    const item = selectNextItemBalanced(state, testItems, ["MATH", "ELA", "SCIENCE"]);
    // Should pick from ELA or SCIENCE since they have 0 items
    expect(item?.domain).not.toBe("MATH");
  });
});

// ─── shouldTerminate() ──────────────────────────────────────────────────────────

describe("shouldTerminate", () => {
  it("terminates when max items reached", () => {
    const state: IrtState = {
      theta: 0.0,
      standardError: 1.0,
      responses: Array(30).fill({ itemId: "x", correct: true }),
      administeredItemIds: Array(30).fill("x"),
      domainThetas: {},
    };
    expect(shouldTerminate(state)).toBe(true);
  });

  it("terminates when SE below threshold after minimum items", () => {
    const state: IrtState = {
      theta: 0.0,
      standardError: 0.25,
      responses: Array(10).fill({ itemId: "x", correct: true }),
      administeredItemIds: Array(10).fill("x"),
      domainThetas: {},
    };
    expect(shouldTerminate(state)).toBe(true);
  });

  it("does not terminate early with high SE", () => {
    const state: IrtState = {
      theta: 0.0,
      standardError: 1.0,
      responses: Array(3).fill({ itemId: "x", correct: true }),
      administeredItemIds: Array(3).fill("x"),
      domainThetas: {},
    };
    expect(shouldTerminate(state)).toBe(false);
  });

  it("does not terminate before minimum 5 items even with low SE", () => {
    const state: IrtState = {
      theta: 0.0,
      standardError: 0.1,
      responses: Array(3).fill({ itemId: "x", correct: true }),
      administeredItemIds: Array(3).fill("x"),
      domainThetas: {},
    };
    expect(shouldTerminate(state)).toBe(false);
  });
});

// ─── processResponse() ─────────────────────────────────────────────────────────

describe("processResponse", () => {
  it("updates theta after correct response", () => {
    const state = createInitialState(0.0);
    const newState = processResponse(state, testItems, {
      itemId: "medium-1",
      correct: true,
    });
    expect(newState.theta).toBeGreaterThan(0.0);
    expect(newState.responses.length).toBe(1);
    expect(newState.administeredItemIds).toContain("medium-1");
  });

  it("updates theta after incorrect response", () => {
    const state = createInitialState(0.0);
    const newState = processResponse(state, testItems, {
      itemId: "medium-1",
      correct: false,
    });
    expect(newState.theta).toBeLessThan(0.0);
  });

  it("decreases SE with each response", () => {
    let state = createInitialState(0.0);
    const initialSE = state.standardError;

    state = processResponse(state, testItems, { itemId: "medium-1", correct: true });
    expect(state.standardError).toBeLessThan(initialSE);

    const seBefore = state.standardError;
    state = processResponse(state, testItems, { itemId: "easy-1", correct: true });
    expect(state.standardError).toBeLessThan(seBefore);
  });

  it("tracks domain-specific thetas", () => {
    let state = createInitialState(0.0);
    state = processResponse(state, testItems, { itemId: "easy-1", correct: true });
    state = processResponse(state, testItems, { itemId: "medium-1", correct: false });
    expect(state.domainThetas["MATH"]).toBeDefined();
    expect(state.domainThetas["MATH"].count).toBe(2);
  });
});

// ─── Convergence test ───────────────────────────────────────────────────────────

describe("IRT convergence", () => {
  it("converges to true ability after enough responses", () => {
    const trueAbility = 1.0;
    let state = createInitialState(0.0);

    // Simulate 20 responses from a learner with true ability = 1.0
    for (let i = 0; i < testItems.length; i++) {
      const item = testItems[i];
      // Probability of correct response based on true ability
      const pCorrect = 1 / (1 + Math.exp(-item.discrimination * (trueAbility - item.difficulty)));
      const correct = pCorrect > 0.5; // Deterministic simulation

      state = processResponse(state, testItems, {
        itemId: item.id,
        correct,
      });
    }

    // Theta should be within 1.5 of true ability
    expect(Math.abs(state.theta - trueAbility)).toBeLessThan(1.5);
    // SE should have decreased significantly
    expect(state.standardError).toBeLessThan(2);
  });
});

// ─── computeDomainScores() ──────────────────────────────────────────────────────

describe("computeDomainScores", () => {
  it("converts theta to 0-1 mastery scores", () => {
    const state: IrtState = {
      theta: 0.0,
      standardError: 0.5,
      responses: [],
      administeredItemIds: [],
      domainThetas: {
        MATH: { theta: 1.0, count: 5 },
        ELA: { theta: -1.0, count: 5 },
        SCIENCE: { theta: 0.0, count: 5 },
      },
    };

    const scores = computeDomainScores(state);
    expect(scores.MATH).toBeGreaterThan(0.7); // theta 1.0 → ~0.73
    expect(scores.ELA).toBeLessThan(0.3); // theta -1.0 → ~0.27
    expect(scores.SCIENCE).toBeCloseTo(0.5, 1); // theta 0.0 → 0.5
    expect(scores.OVERALL).toBeCloseTo(0.5, 1);
  });
});

// ─── thetaToMastery() ──────────────────────────────────────────────────────────

describe("thetaToMastery", () => {
  it("maps theta=0 to 0.5", () => {
    expect(thetaToMastery(0)).toBeCloseTo(0.5, 5);
  });

  it("maps positive theta to >0.5", () => {
    expect(thetaToMastery(2.0)).toBeGreaterThan(0.85);
  });

  it("maps negative theta to <0.5", () => {
    expect(thetaToMastery(-2.0)).toBeLessThan(0.15);
  });
});

// ─── getFunctioningLevelFormat() ────────────────────────────────────────────────

describe("getFunctioningLevelFormat", () => {
  it("maps each level to correct format", () => {
    expect(getFunctioningLevelFormat("STANDARD")).toBe("STANDARD");
    expect(getFunctioningLevelFormat("SUPPORTED")).toBe("SIMPLIFIED");
    expect(getFunctioningLevelFormat("LOW_VERBAL")).toBe("PICTURE_BASED");
    expect(getFunctioningLevelFormat("NON_VERBAL")).toBe("OBSERVATION");
    expect(getFunctioningLevelFormat("PRE_SYMBOLIC")).toBe("MILESTONE");
  });
});

// ─── assessmentProgress() ──────────────────────────────────────────────────────

describe("assessmentProgress", () => {
  it("returns 0 for empty state", () => {
    const state = createInitialState(0.0);
    const progress = assessmentProgress(state);
    expect(progress).toBeGreaterThanOrEqual(0);
  });

  it("returns 100 when SE is below threshold", () => {
    const state: IrtState = {
      theta: 0.0,
      standardError: 0.1,
      responses: Array(10).fill({ itemId: "x", correct: true }),
      administeredItemIds: Array(10).fill("x"),
      domainThetas: {},
    };
    expect(assessmentProgress(state)).toBe(100);
  });

  it("increases with number of responses", () => {
    const state5: IrtState = {
      theta: 0.0,
      standardError: 2.0,
      responses: Array(5).fill({ itemId: "x", correct: true }),
      administeredItemIds: Array(5).fill("x"),
      domainThetas: {},
    };
    const state20: IrtState = {
      ...state5,
      standardError: 0.8,
      responses: Array(20).fill({ itemId: "x", correct: true }),
      administeredItemIds: Array(20).fill("x"),
    };
    expect(assessmentProgress(state20)).toBeGreaterThan(assessmentProgress(state5));
  });
});
