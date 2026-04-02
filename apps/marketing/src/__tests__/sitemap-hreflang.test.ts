import { describe, it, expect, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/* Mocks — prevent file-system writes when the module loads            */
/* ------------------------------------------------------------------ */

vi.mock("fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("fs")>();
  return {
    ...actual,
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    existsSync: vi.fn(() => true),
  };
});

/* ------------------------------------------------------------------ */
/* Import the builder functions (exported from the .mjs module)        */
/* ------------------------------------------------------------------ */

// Dynamic import so mocks are registered first
const { buildSitemapXml, buildHreflangEntries } = await import(
  "../../scripts/generate-sitemap.mjs"
);

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

describe("Sitemap hreflang generation", () => {
  let xml: string;

  beforeEach(() => {
    xml = buildSitemapXml();
  });

  it("includes the xhtml namespace in urlset", () => {
    expect(xml).toContain(
      'xmlns:xhtml="http://www.w3.org/1999/xhtml"',
    );
  });

  it("includes xhtml:link elements in the output", () => {
    expect(xml).toContain("<xhtml:link");
    expect(xml).toContain('rel="alternate"');
  });

  it("each URL has 10 hreflang alternate links plus x-default (11 total)", () => {
    // Count xhtml:link entries for the first <url> block (the root "/")
    const firstUrl = xml.split("</url>")[0];
    const hreflangMatches = firstUrl.match(/<xhtml:link /g);
    expect(hreflangMatches).not.toBeNull();
    // 10 locales + 1 x-default = 11
    expect(hreflangMatches!.length).toBe(11);
  });

  it("contains hreflang='ar-SA' with /ar prefix", () => {
    expect(xml).toContain('hreflang="ar-SA"');
    expect(xml).toContain('href="https://aivolearning.com/ar/"');
  });

  it("contains hreflang='yo-NG' with /yo prefix", () => {
    expect(xml).toContain('hreflang="yo-NG"');
    expect(xml).toContain('href="https://aivolearning.com/yo/"');
  });

  it("contains hreflang='x-default' pointing to English URL", () => {
    expect(xml).toContain('hreflang="x-default"');
    expect(xml).toContain(
      'hreflang="x-default" href="https://aivolearning.com/"',
    );
  });

  it("contains all 10 locale hreflangs for a static route", () => {
    const expectedHreflangs = [
      "en-US",
      "es-ES",
      "fr-FR",
      "ar-SA",
      "zh-CN",
      "pt-BR",
      "sw-KE",
      "ig-NG",
      "yo-NG",
      "ha-NG",
    ];
    for (const hl of expectedHreflangs) {
      expect(xml).toContain(`hreflang="${hl}"`);
    }
  });

  it("generates hreflang entries for blog slugs", () => {
    expect(xml).toContain(
      'href="https://aivolearning.com/es/blog/introducing-aivo"',
    );
    expect(xml).toContain(
      'href="https://aivolearning.com/ar/blog/introducing-aivo"',
    );
  });

  it("generates hreflang entries for case-study slugs", () => {
    expect(xml).toContain(
      'href="https://aivolearning.com/fr/case-studies/springfield-district-reading-improvement"',
    );
  });

  it("buildHreflangEntries returns 11 links for a path", () => {
    const entries = buildHreflangEntries("/pricing");
    const links = entries.split("\n").filter((l: string) =>
      l.includes("<xhtml:link"),
    );
    expect(links.length).toBe(11);
  });
});
