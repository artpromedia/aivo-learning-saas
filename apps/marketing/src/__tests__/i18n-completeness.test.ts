import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/* ------------------------------------------------------------------ */
/* Load all locale JSON files                                          */
/* ------------------------------------------------------------------ */

const MESSAGES_DIR = path.resolve(__dirname, "../../messages");
const LOCALE_IDS = [
  "en",
  "es",
  "fr",
  "ar",
  "zh",
  "pt",
  "sw",
  "ig",
  "yo",
  "ha",
] as const;

type NestedMessages = Record<string, Record<string, string>>;

const locales: Record<string, NestedMessages> = {};
for (const id of LOCALE_IDS) {
  const filePath = path.join(MESSAGES_DIR, `${id}.json`);
  locales[id] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

const enMessages = locales["en"];
const nonEnLocales = LOCALE_IDS.filter((id) => id !== "en");

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Recursively flattens a nested object into dot-notation keys.
 *   { nav: { features: "Features" } }  →  ["nav.features"]
 */
function flattenKeys(
  obj: Record<string, unknown>,
  prefix = "",
): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flattenKeys(v as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

/**
 * Looks up a dot-notation key in a nested object.
 *   getValue(obj, "nav.features") → obj.nav.features
 */
function getValue(
  obj: Record<string, unknown>,
  dotKey: string,
): unknown {
  const parts = dotKey.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

const enKeys = flattenKeys(enMessages);

describe("i18n completeness — every locale has every key", () => {
  it("en.json has keys (sanity check)", () => {
    expect(enKeys.length).toBeGreaterThan(0);
  });

  for (const localeId of nonEnLocales) {
    describe(`${localeId}.json`, () => {
      const localeKeys = flattenKeys(locales[localeId]);

      it("has every key present in en.json", () => {
        const missing = enKeys.filter((k) => !localeKeys.includes(k));
        if (missing.length > 0) {
          // Produce a readable failure message for debugging
          const report = missing
            .map((k) => `  ✗ ${localeId} missing key: "${k}"`)
            .join("\n");
          expect(missing, `Missing keys in ${localeId}.json:\n${report}`).toEqual([]);
        }
      });

      it("has no empty-string values", () => {
        const emptyKeys: string[] = [];
        for (const key of localeKeys) {
          const val = getValue(locales[localeId], key);
          if (val === "") {
            emptyKeys.push(key);
          }
        }
        if (emptyKeys.length > 0) {
          const report = emptyKeys
            .map((k) => `  ✗ ${localeId}["${k}"] is empty string`)
            .join("\n");
          expect(emptyKeys, `Empty values in ${localeId}.json:\n${report}`).toEqual([]);
        }
      });

      it("has no undefined values", () => {
        const undefinedKeys: string[] = [];
        for (const key of enKeys) {
          const val = getValue(locales[localeId], key);
          if (val === undefined) {
            undefinedKeys.push(key);
          }
        }
        if (undefinedKeys.length > 0) {
          const report = undefinedKeys
            .map((k) => `  ✗ ${localeId}["${k}"] is undefined`)
            .join("\n");
          expect(
            undefinedKeys,
            `Undefined values in ${localeId}.json:\n${report}`,
          ).toEqual([]);
        }
      });
    });
  }
});
