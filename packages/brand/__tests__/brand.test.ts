import { describe, it, expect } from "vitest";
import { AIVO_BRAND } from "../src/tokens.js";
import { aivoPreset } from "../src/tailwind-preset.js";
import { EMAIL_CONSTANTS } from "../src/email-constants.js";
import { FLUTTER_TOKENS } from "../src/flutter-tokens.js";

// ─── Tokens ─────────────────────────────────────────────────────────────────────
describe("AIVO_BRAND tokens", () => {
  it("should have purple palette with 10 shades", () => {
    expect(Object.keys(AIVO_BRAND.colors.purple)).toHaveLength(10);
  });

  it("should have teal palette with 10 shades", () => {
    expect(Object.keys(AIVO_BRAND.colors.teal)).toHaveLength(10);
  });

  it("should have navy palette with 10 shades", () => {
    expect(Object.keys(AIVO_BRAND.colors.navy)).toHaveLength(10);
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
    validateColors(AIVO_BRAND.colors);
  });

  it("should have primary purple at 500", () => {
    expect(AIVO_BRAND.colors.purple[500]).toBe("#7C4DFF");
  });

  it("should have three font families", () => {
    expect(AIVO_BRAND.typography.fontFamily.display).toContain("Nunito");
    expect(AIVO_BRAND.typography.fontFamily.body).toContain("Inter");
    expect(AIVO_BRAND.typography.fontFamily.mono).toContain("JetBrains Mono");
  });

  it("should have 9 font sizes", () => {
    expect(Object.keys(AIVO_BRAND.typography.fontSize)).toHaveLength(9);
  });

  it("should have spacing scale", () => {
    expect(Object.keys(AIVO_BRAND.spacing).length).toBeGreaterThan(15);
  });

  it("should have border radius scale", () => {
    expect(AIVO_BRAND.borderRadius.full).toBe("9999px");
  });

  it("should have shadow presets", () => {
    expect(Object.keys(AIVO_BRAND.shadow)).toHaveLength(5);
  });

  it("should have animation tokens", () => {
    expect(AIVO_BRAND.animation.duration.fast).toBe("150ms");
    expect(AIVO_BRAND.animation.easing.bounce).toContain("cubic-bezier");
  });

  it("should have email-specific tokens", () => {
    expect(AIVO_BRAND.email.maxWidth).toBe("600px");
    expect(AIVO_BRAND.email.headerBg).toBe("#7C4DFF");
    expect(AIVO_BRAND.email.buttonRadius).toBe("8px");
  });
});

// ─── Tailwind Preset ────────────────────────────────────────────────────────────
describe("Tailwind preset", () => {
  it("should export theme with extended colors", () => {
    expect(aivoPreset.theme.extend.colors.purple).toBeDefined();
    expect(aivoPreset.theme.extend.colors.teal).toBeDefined();
    expect(aivoPreset.theme.extend.colors.navy).toBeDefined();
  });

  it("should map font families", () => {
    expect(aivoPreset.theme.extend.fontFamily.display).toBeDefined();
    expect(aivoPreset.theme.extend.fontFamily.body).toBeDefined();
  });

  it("should include spacing and borderRadius", () => {
    expect(aivoPreset.theme.extend.spacing).toBeDefined();
    expect(aivoPreset.theme.extend.borderRadius).toBeDefined();
  });

  it("should include shadows and transitions", () => {
    expect(aivoPreset.theme.extend.boxShadow).toBeDefined();
    expect(aivoPreset.theme.extend.transitionDuration).toBeDefined();
    expect(aivoPreset.theme.extend.transitionTimingFunction).toBeDefined();
  });
});

// ─── Email Constants ────────────────────────────────────────────────────────────
describe("Email constants", () => {
  it("should have colors derived from brand", () => {
    expect(EMAIL_CONSTANTS.colors.primary).toBe("#7C4DFF");
  });

  it("should have email layout values", () => {
    expect(EMAIL_CONSTANTS.maxWidth).toBe("600px");
    expect(EMAIL_CONSTANTS.fontFamily).toContain("Inter");
  });

  it("should have typography settings", () => {
    expect(EMAIL_CONSTANTS.typography.bodySize).toBe("16px");
    expect(EMAIL_CONSTANTS.typography.headingSize).toBe("24px");
  });
});

// ─── Flutter Tokens ─────────────────────────────────────────────────────────────
describe("Flutter tokens", () => {
  it("should have ARGB color values", () => {
    const colors = FLUTTER_TOKENS.colors;
    const someColor = Object.values(colors)[0];
    expect(someColor).toMatch(/^0xFF[0-9A-Fa-f]{6}$/);
  });

  it("should have flutter font families", () => {
    expect(FLUTTER_TOKENS.typography.fontFamilyDisplay).toBe("Nunito");
    expect(FLUTTER_TOKENS.typography.fontFamilyBody).toBe("Inter");
  });

  it("should have numeric spacing values", () => {
    expect(FLUTTER_TOKENS.spacing.md).toBe(16);
  });

  it("should have numeric border radius values", () => {
    expect(FLUTTER_TOKENS.borderRadius.full).toBe(9999);
  });
});
