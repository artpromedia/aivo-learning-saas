import { describe, it, expect } from "vitest";
import { cssVariables } from "../src/index.js";

// ─── CSS Output Verification ────────────────────────────────────────────────────

describe("cssVariables() output format", () => {
  const css = cssVariables();
  const lines = css
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  it("produces a non-empty list of declarations", () => {
    expect(lines.length).toBeGreaterThan(50);
  });

  it("every line is a valid CSS custom property declaration", () => {
    for (const line of lines) {
      expect(line, `malformed line: ${line}`).toMatch(
        /^--[a-zA-Z][a-zA-Z0-9.-]*:\s*.+;$/,
      );
    }
  });

  it("no line contains 'undefined' or 'null'", () => {
    for (const line of lines) {
      expect(line).not.toContain("undefined");
      expect(line).not.toContain("null");
    }
  });

  it("no line contains '[object Object]'", () => {
    for (const line of lines) {
      expect(line).not.toContain("[object Object]");
    }
  });

  it("variable names follow --{category}-{name} convention", () => {
    const keyPattern = /^--([a-zA-Z][a-zA-Z0-9.-]*):/;
    for (const line of lines) {
      const match = line.match(keyPattern);
      expect(match, `no key found in: ${line}`).not.toBeNull();
      // Must have at least two segments (e.g. --color-purple)
      const segments = match![1].split("-");
      expect(
        segments.length,
        `key "${match![1]}" should have ≥ 2 segments`,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it("contains expected category prefixes", () => {
    const expectedPrefixes = [
      "--color-",
      "--font-",
      "--font-size-",
      "--line-height-",
      "--spacing-",
      "--radius-",
      "--shadow-",
      "--transition-",
    ];
    for (const prefix of expectedPrefixes) {
      const found = lines.some((l) => l.startsWith(prefix));
      expect(found, `missing prefix: ${prefix}`).toBe(true);
    }
  });

  it("color values are valid hex codes", () => {
    const colorLines = lines.filter((l) => l.startsWith("--color-"));
    expect(colorLines.length).toBeGreaterThan(0);
    for (const line of colorLines) {
      const value = line.split(":")[1].trim().replace(";", "");
      expect(value, `invalid color value in: ${line}`).toMatch(
        /^#[0-9a-fA-F]{6}$/,
      );
    }
  });

  it("no duplicate variable names", () => {
    const keys = lines.map((l) => l.split(":")[0]);
    const uniqueKeys = new Set(keys);
    expect(keys.length).toBe(uniqueKeys.size);
  });
});
