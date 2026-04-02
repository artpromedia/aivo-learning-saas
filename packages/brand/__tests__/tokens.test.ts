import { describe, it, expect } from "vitest";
import {
  AIVO_COLORS,
  AIVO_TYPOGRAPHY,
  AIVO_SPACING,
  AIVO_TRANSITIONS,
  tokens,
} from "../src/tokens.js";
import { cssVariables } from "../src/index.js";

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** Parse a hex color string to an { r, g, b } object (0–255). */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/**
 * Calculate the relative luminance of a color per WCAG 2.1.
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate the WCAG contrast ratio between two hex colors.
 * @returns Contrast ratio (1–21).
 */
function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ─── Color Palette Completeness ─────────────────────────────────────────────────

describe("Color palette completeness", () => {
  const hexRegex = /^#[0-9a-fA-F]{6}$/;
  const shadeKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  for (const palette of ["purple", "teal", "navy", "gray"] as const) {
    it(`${palette} palette has all 11 shades (50–950) as valid hex`, () => {
      const pal = AIVO_COLORS[palette];
      for (const shade of shadeKeys) {
        const value = pal[shade as keyof typeof pal];
        expect(value, `${palette}.${shade}`).toMatch(hexRegex);
      }
    });
  }

  it("semantic colors are valid hex", () => {
    expect(AIVO_COLORS.success).toMatch(hexRegex);
    expect(AIVO_COLORS.warning).toMatch(hexRegex);
    expect(AIVO_COLORS.error).toMatch(hexRegex);
    expect(AIVO_COLORS.white).toMatch(hexRegex);
  });
});

// ─── Typography Scale ───────────────────────────────────────────────────────────

describe("Typography scale", () => {
  const requiredSizes = [
    "hero",
    "h1",
    "h2",
    "h3",
    "h4",
    "body-lg",
    "body",
    "body-sm",
    "caption",
  ] as const;

  it("has all 9 required sizes", () => {
    expect(Object.keys(AIVO_TYPOGRAPHY.scale)).toHaveLength(
      requiredSizes.length,
    );
  });

  for (const size of requiredSizes) {
    it(`scale.${size} has fontSize and lineHeight`, () => {
      const entry = AIVO_TYPOGRAPHY.scale[size];
      expect(entry.fontSize).toMatch(/^\d+px$/);
      expect(entry.lineHeight).toMatch(/^\d+px$/);
    });
  }

  it("hero is larger than h1", () => {
    const heroSize = parseInt(AIVO_TYPOGRAPHY.scale.hero.fontSize, 10);
    const h1Size = parseInt(AIVO_TYPOGRAPHY.scale.h1.fontSize, 10);
    expect(heroSize).toBeGreaterThan(h1Size);
  });
});

// ─── Spacing Scale ──────────────────────────────────────────────────────────────

describe("Spacing scale", () => {
  const expectedKeys = [
    "px",
    "0",
    "0.5",
    "1",
    "1.5",
    "2",
    "2.5",
    "3",
    "3.5",
    "4",
    "5",
    "6",
    "8",
    "10",
    "12",
    "16",
    "20",
    "24",
    "32",
    "40",
    "48",
    "64",
    "80",
    "96",
  ];

  it("has all expected spacing values", () => {
    const keys = Object.keys(AIVO_SPACING);
    for (const key of expectedKeys) {
      expect(keys, `missing spacing.${key}`).toContain(key);
    }
  });

  it("values are valid CSS lengths", () => {
    for (const [key, value] of Object.entries(AIVO_SPACING)) {
      expect(value, `spacing.${key}`).toMatch(/^(\d+(\.\d+)?rem|0|1px)$/);
    }
  });
});

// ─── Transitions ────────────────────────────────────────────────────────────────

describe("AIVO_TRANSITIONS", () => {
  it("has fast, medium, and slow presets", () => {
    expect(AIVO_TRANSITIONS.fast).toBeDefined();
    expect(AIVO_TRANSITIONS.medium).toBeDefined();
    expect(AIVO_TRANSITIONS.slow).toBeDefined();
  });
});

// ─── cssVariables() ─────────────────────────────────────────────────────────────

describe("cssVariables()", () => {
  const css = cssVariables();

  it("returns a non-empty string", () => {
    expect(css.length).toBeGreaterThan(0);
  });

  it("contains --color-primary-500 (mapped as purple-500)", () => {
    expect(css).toContain("--color-purple-500: #7c3aed");
  });

  it("contains font-family token", () => {
    expect(css).toContain("--font-family-sans:");
  });

  it("contains spacing tokens", () => {
    expect(css).toContain("--spacing-4:");
  });

  it("contains shadow tokens", () => {
    expect(css).toContain("--shadow-sm:");
  });
});

// ─── Unified tokens object ──────────────────────────────────────────────────────

describe("Unified tokens object", () => {
  it("has all top-level categories", () => {
    expect(tokens.colors).toBe(AIVO_COLORS);
    expect(tokens.typography).toBe(AIVO_TYPOGRAPHY);
    expect(tokens.spacing).toBe(AIVO_SPACING);
    expect(tokens.transitions).toBe(AIVO_TRANSITIONS);
  });
});

// ─── WCAG Contrast Ratio ────────────────────────────────────────────────────────

describe("WCAG contrast ratios", () => {
  const WHITE = "#ffffff";

  it("purple-500 on white meets AA for normal text (≥ 4.5:1)", () => {
    const ratio = contrastRatio(AIVO_COLORS.purple[500], WHITE);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("purple-600 on white meets AA for normal text (≥ 4.5:1)", () => {
    const ratio = contrastRatio(AIVO_COLORS.purple[600], WHITE);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("navy-800 on white meets AAA for normal text (≥ 7:1)", () => {
    const ratio = contrastRatio(AIVO_COLORS.navy[800], WHITE);
    expect(ratio).toBeGreaterThanOrEqual(7);
  });

  it("navy-900 on white meets AAA for normal text (≥ 7:1)", () => {
    const ratio = contrastRatio(AIVO_COLORS.navy[900], WHITE);
    expect(ratio).toBeGreaterThanOrEqual(7);
  });

  it("danger red on white meets AA for large text (≥ 3:1)", () => {
    const ratio = contrastRatio(AIVO_COLORS.error, WHITE);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  it("success green on navy-900 meets AA for normal text (≥ 4.5:1)", () => {
    const ratio = contrastRatio(AIVO_COLORS.success, AIVO_COLORS.navy[900]);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("white on purple-500 meets AA for normal text (≥ 4.5:1)", () => {
    const ratio = contrastRatio(WHITE, AIVO_COLORS.purple[500]);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("relative luminance of white is 1.0", () => {
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1.0, 3);
  });

  it("relative luminance of black is 0.0", () => {
    expect(relativeLuminance("#000000")).toBeCloseTo(0.0, 3);
  });
});
