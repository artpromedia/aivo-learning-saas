import { describe, it, expect } from "vitest";
import {
  AIVO_COLORS,
  AIVO_TYPOGRAPHY,
  AIVO_SPACING,
  AIVO_BORDER_RADIUS,
  AIVO_SHADOWS,
  AIVO_GRADIENTS,
  AIVO_ANIMATION,
  AIVO_TRANSITIONS,
} from "../src/tokens.js";
import { AIVO_BRAND } from "../src/email.js";
import {
  AIVO_FLUTTER_COLORS,
  AIVO_FLUTTER_TYPOGRAPHY,
  AIVO_FLUTTER_SPACING,
  AIVO_FLUTTER_BORDER_RADIUS,
} from "../src/flutter.js";

// ─── Color Tokens ───────────────────────────────────────────────────────────────
describe("AIVO_COLORS", () => {
  it("should have purple palette with 11 shades (50–950)", () => {
    expect(Object.keys(AIVO_COLORS.purple)).toHaveLength(11);
  });

  it("should have teal palette with 11 shades (50–950)", () => {
    expect(Object.keys(AIVO_COLORS.teal)).toHaveLength(11);
  });

  it("should have navy palette with 11 shades (50–950)", () => {
    expect(Object.keys(AIVO_COLORS.navy)).toHaveLength(11);
  });

  it("should have gray palette with 11 shades (50–950)", () => {
    expect(Object.keys(AIVO_COLORS.gray)).toHaveLength(11);
  });

  it("all hex colors should be valid format", () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    function validateColors(obj: Record<string, unknown>, path = ""): void {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string" && value.startsWith("#")) {
          expect(value, `${path}.${key}`).toMatch(hexRegex);
        } else if (typeof value === "object" && value !== null) {
          validateColors(value as Record<string, unknown>, `${path}.${key}`);
        }
      }
    }
    validateColors(AIVO_COLORS as unknown as Record<string, unknown>);
  });

  it("should have PRD-correct purple 500", () => {
    expect(AIVO_COLORS.purple[500]).toBe("#7c3aed");
  });

  it("should have PRD-correct teal 500", () => {
    expect(AIVO_COLORS.teal[500]).toBe("#14b8c8");
  });

  it("should have navy 900 as dark navy", () => {
    expect(AIVO_COLORS.navy[900]).toBe("#0f172a");
  });

  it("should have semantic colors", () => {
    expect(AIVO_COLORS.success).toBe("#22c55e");
    expect(AIVO_COLORS.warning).toBe("#f59e0b");
    expect(AIVO_COLORS.danger).toBe("#ef4444");
  });
});

// ─── Typography ─────────────────────────────────────────────────────────────────
describe("AIVO_TYPOGRAPHY", () => {
  it("should use Plus Jakarta Sans font family", () => {
    expect(AIVO_TYPOGRAPHY.fontFamily).toContain("Plus Jakarta Sans");
  });

  it("should have 5 font weights", () => {
    expect(Object.keys(AIVO_TYPOGRAPHY.fontWeights)).toHaveLength(5);
  });

  it("should have typography scale with all required sizes", () => {
    const requiredSizes = ["hero", "h1", "h2", "h3", "h4", "body-lg", "body", "body-sm", "caption"];
    for (const size of requiredSizes) {
      expect(AIVO_TYPOGRAPHY.scale).toHaveProperty(size);
    }
  });
});

// ─── Shadows ────────────────────────────────────────────────────────────────────
describe("AIVO_SHADOWS", () => {
  it("should have card and nav shadows", () => {
    expect(AIVO_SHADOWS.card).toBeDefined();
    expect(AIVO_SHADOWS.cardHover).toBeDefined();
    expect(AIVO_SHADOWS.nav).toBeDefined();
    expect(AIVO_SHADOWS.navScrolled).toBeDefined();
  });
});

// ─── Gradients ──────────────────────────────────────────────────────────────────
describe("AIVO_GRADIENTS", () => {
  it("should have all gradient definitions", () => {
    expect(AIVO_GRADIENTS.purple).toContain("linear-gradient");
    expect(AIVO_GRADIENTS.teal).toContain("linear-gradient");
    expect(AIVO_GRADIENTS.hero).toContain("linear-gradient");
    expect(AIVO_GRADIENTS.purpleHeader).toContain("linear-gradient");
  });
});

// ─── Spacing & Border Radius ────────────────────────────────────────────────────
describe("AIVO_SPACING", () => {
  it("should have spacing scale", () => {
    expect(Object.keys(AIVO_SPACING).length).toBeGreaterThan(15);
  });
});

describe("AIVO_BORDER_RADIUS", () => {
  it("should have full radius", () => {
    expect(AIVO_BORDER_RADIUS.full).toBe("9999px");
  });

  it("should have standard radius scale", () => {
    expect(AIVO_BORDER_RADIUS.sm).toBeDefined();
    expect(AIVO_BORDER_RADIUS.md).toBeDefined();
    expect(AIVO_BORDER_RADIUS.lg).toBeDefined();
  });
});

// ─── Animation ──────────────────────────────────────────────────────────────────
describe("AIVO_ANIMATION", () => {
  it("should have duration and easing tokens", () => {
    expect(AIVO_ANIMATION.duration.fast).toBe("150ms");
    expect(AIVO_ANIMATION.easing.bounce).toContain("cubic-bezier");
  });
});

// ─── Email Brand ────────────────────────────────────────────────────────────────
describe("AIVO_BRAND (email)", () => {
  it("should have email layout values", () => {
    expect(AIVO_BRAND.maxWidth).toBe(600);
    expect(AIVO_BRAND.borderRadius).toBe(12);
  });

  it("should have correct CTA colors", () => {
    expect(AIVO_BRAND.ctaBackground).toBe("#7c3aed");
    expect(AIVO_BRAND.ctaTextColor).toBe("#ffffff");
  });

  it("should have font family with Inter", () => {
    expect(AIVO_BRAND.fontFamily).toContain("Inter");
  });
});

// ─── Flutter Tokens ─────────────────────────────────────────────────────────────
describe("Flutter tokens", () => {
  it("should have ARGB color values for purple", () => {
    expect(AIVO_FLUTTER_COLORS.purple["500"]).toMatch(/^0xFF[0-9A-Fa-f]{6}$/);
  });

  it("should have Inter font family", () => {
    expect(AIVO_FLUTTER_TYPOGRAPHY.fontFamily).toBe("Inter");
  });

  it("should have numeric spacing values", () => {
    expect(AIVO_FLUTTER_SPACING.md).toBe(16);
  });

  it("should have numeric border radius values", () => {
    expect(AIVO_FLUTTER_BORDER_RADIUS.full).toBe(9999);
  });
});
