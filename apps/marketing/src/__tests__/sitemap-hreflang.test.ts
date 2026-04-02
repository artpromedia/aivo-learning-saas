import { describe, it, expect } from "vitest";
import { generateSitemapXml, buildHreflangLinks } from "../../scripts/generate-sitemap.mjs";

describe("Sitemap hreflang generation", () => {
  const xml = generateSitemapXml();

  it("contains the xhtml namespace declaration", () => {
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  });

  it("contains xhtml:link elements", () => {
    expect(xml).toContain("<xhtml:link");
    expect(xml).toContain('rel="alternate"');
  });

  it("each URL has 10 hreflang alternate links plus x-default (11 total)", () => {
    // Count hreflang links for the homepage URL entry
    const homepageEntry = xml.split("<url>").find((entry) =>
      entry.includes("<loc>https://aivolearning.com/</loc>"),
    );
    expect(homepageEntry).toBeDefined();
    const hreflangCount = (homepageEntry!.match(/xhtml:link/g) || []).length;
    expect(hreflangCount).toBe(11);
  });

  it("contains Arabic hreflang ar-SA with correct URL", () => {
    expect(xml).toContain('hreflang="ar-SA"');
    expect(xml).toContain('href="https://aivolearning.com/ar/"');
  });

  it("contains Yoruba hreflang yo-NG with correct URL", () => {
    expect(xml).toContain('hreflang="yo-NG"');
    expect(xml).toContain('href="https://aivolearning.com/yo/"');
  });

  it("contains x-default hreflang pointing to English URL", () => {
    expect(xml).toContain('hreflang="x-default"');
    expect(xml).toContain(
      'hreflang="x-default" href="https://aivolearning.com/"',
    );
  });

  it("English hreflang en-US points to root URL without locale prefix", () => {
    expect(xml).toContain(
      'hreflang="en-US" href="https://aivolearning.com/"',
    );
  });

  it("non-English locales use /{locale}{path} pattern", () => {
    expect(xml).toContain('href="https://aivolearning.com/es/"');
    expect(xml).toContain('href="https://aivolearning.com/fr/pricing"');
    expect(xml).toContain('href="https://aivolearning.com/zh/demo"');
  });

  it("generates hreflang links for blog posts", () => {
    expect(xml).toContain(
      'href="https://aivolearning.com/ar/blog/introducing-aivo"',
    );
  });

  it("generates hreflang links for case study pages", () => {
    expect(xml).toContain(
      'href="https://aivolearning.com/pt/case-studies/springfield-district-reading-improvement"',
    );
  });

  it("buildHreflangLinks returns 11 links for a given path", () => {
    const links = buildHreflangLinks("/pricing");
    const linkLines = links.split("\n").filter((l) => l.includes("xhtml:link"));
    expect(linkLines.length).toBe(11);
  });
});
