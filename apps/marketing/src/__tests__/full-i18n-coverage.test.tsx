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

type LocaleMessages = Record<string, Record<string, string>>;

const locales: Record<string, LocaleMessages> = {};
for (const id of LOCALE_IDS) {
  const filePath = path.join(MESSAGES_DIR, `${id}.json`);
  locales[id] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

const enMessages = locales["en"];
const nonEnLocales = LOCALE_IDS.filter((id) => id !== "en");

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getKeys(obj: LocaleMessages): string[] {
  const keys: string[] = [];
  for (const section of Object.keys(obj)) {
    for (const key of Object.keys(obj[section])) {
      keys.push(`${section}.${key}`);
    }
  }
  return keys.sort();
}

function getSections(obj: LocaleMessages): string[] {
  return Object.keys(obj).sort();
}

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

describe("Full i18n coverage", () => {
  const enKeys = getKeys(enMessages);
  const enSections = getSections(enMessages);

  it("en.json has all expected top-level sections", () => {
    const expected = [
      "nav",
      "hero",
      "features",
      "howItWorks",
      "aiTutors",
      "socialProof",
      "audienceTabs",
      "statsBand",
      "testimonials",
      "walkthrough",
      "demo",
      "pricing",
      "contact",
      "cta",
      "footer",
      "common",
    ].sort();
    expect(enSections).toEqual(expected);
  });

  describe.each(nonEnLocales)("%s.json has full key parity with en.json", (localeId) => {
    const localeMessages = locales[localeId];
    const localeKeys = getKeys(localeMessages);

    it("has every section that en.json has", () => {
      const localeSections = getSections(localeMessages);
      const missingSections = enSections.filter((s) => !localeSections.includes(s));
      expect(missingSections).toEqual([]);
    });

    it("has every key that en.json has", () => {
      const missingKeys = enKeys.filter((k) => !localeKeys.includes(k));
      expect(missingKeys).toEqual([]);
    });

    it("has no extra keys beyond en.json", () => {
      const extraKeys = localeKeys.filter((k) => !enKeys.includes(k));
      expect(extraKeys).toEqual([]);
    });

    it("has the same number of keys as en.json", () => {
      expect(localeKeys.length).toBe(enKeys.length);
    });
  });

  describe("no untranslated values", () => {
    // Keys whose values are allowed to match en.json (proper nouns, brand names, universal terms)
    const ALLOWED_IDENTICAL = new Set([
      "socialProof.badge",
      "footer.linkApi", // "API" is universal
      "features.brainCloneTitle", // brand name "Brain Clone AI"
      "features.gamificationTitle", // "Gamification" kept as-is in many languages
      "nav.blog", // "Blog" is used as-is in most languages
      "footer.linkBlog", // "Blog"
      "footer.cookies", // "Cookies" is a universal web term
      "footer.columnLegal", // "Legal" used as-is in some languages
      "footer.linkDocumentation", // "Documentation" kept in some languages
      "footer.linkContact", // "Contact" kept in some languages
      "demo.emailLabel", // "Email" is universal
      "audienceTabs.parents", // short labels may match
      "audienceTabs.teachers",
      "audienceTabs.districts",
    ]);

    for (const localeId of nonEnLocales) {
      it(`${localeId}.json has no values identical to en.json (except allowed)`, () => {
        const identicalKeys: string[] = [];
        for (const section of Object.keys(enMessages)) {
          for (const key of Object.keys(enMessages[section])) {
            const fullKey = `${section}.${key}`;
            if (ALLOWED_IDENTICAL.has(fullKey)) continue;
            const enVal = enMessages[section][key];
            const localeVal = locales[localeId]?.[section]?.[key];
            if (localeVal === enVal) {
              identicalKeys.push(fullKey);
            }
          }
        }
        // Allow up to 0 untranslated values — all should be translated
        expect(identicalKeys).toEqual([]);
      });
    }
  });

  it("all locale JSON files are valid JSON with no duplicate keys", () => {
    for (const id of LOCALE_IDS) {
      const filePath = path.join(MESSAGES_DIR, `${id}.json`);
      const raw = fs.readFileSync(filePath, "utf-8");
      expect(() => JSON.parse(raw)).not.toThrow();
    }
  });
});
