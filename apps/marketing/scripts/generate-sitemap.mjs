import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "out");

const SITE_URL = "https://aivolearning.com";

const LOCALE_HREFLANGS = [
  { hreflang: "en-US", prefix: "" },
  { hreflang: "es-ES", prefix: "/es" },
  { hreflang: "fr-FR", prefix: "/fr" },
  { hreflang: "ar-SA", prefix: "/ar" },
  { hreflang: "zh-CN", prefix: "/zh" },
  { hreflang: "pt-BR", prefix: "/pt" },
  { hreflang: "sw-KE", prefix: "/sw" },
  { hreflang: "ig-NG", prefix: "/ig" },
  { hreflang: "yo-NG", prefix: "/yo" },
  { hreflang: "ha-NG", prefix: "/ha" },
];

const staticRoutes = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/pricing", priority: "0.8", changefreq: "monthly" },
  { path: "/for-parents", priority: "0.8", changefreq: "monthly" },
  { path: "/for-teachers", priority: "0.8", changefreq: "monthly" },
  { path: "/for-districts", priority: "0.8", changefreq: "monthly" },
  { path: "/tutors", priority: "0.8", changefreq: "monthly" },
  { path: "/blog", priority: "0.8", changefreq: "weekly" },
  { path: "/case-studies", priority: "0.7", changefreq: "monthly" },
  { path: "/demo", priority: "0.8", changefreq: "monthly" },
  { path: "/contact", priority: "0.6", changefreq: "monthly" },
  { path: "/faq", priority: "0.7", changefreq: "monthly" },
  { path: "/about", priority: "0.6", changefreq: "monthly" },
  { path: "/help", priority: "0.6", changefreq: "monthly" },
  { path: "/careers", priority: "0.5", changefreq: "monthly" },
  { path: "/partners", priority: "0.5", changefreq: "monthly" },
  { path: "/legal", priority: "0.3", changefreq: "yearly" },
  { path: "/legal/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/legal/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/accessibility", priority: "0.3", changefreq: "yearly" },
  { path: "/cookies", priority: "0.3", changefreq: "yearly" },
];

const blogSlugs = [
  "introducing-aivo",
  "how-brain-clone-works",
  "no-learner-left-behind",
];

const caseStudySlugs = [
  "springfield-district-reading-improvement",
  "martinez-family-adhd-transformation",
];

export function buildHreflangEntries(path) {
  const entries = LOCALE_HREFLANGS.map(
    ({ hreflang, prefix }) =>
      `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${SITE_URL}${prefix}${path}" />`,
  );
  // x-default points to the English (no prefix) URL
  entries.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${path}" />`,
  );
  return entries.join("\n");
}

export function buildUrlEntry(path, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${buildHreflangEntries(path)}
  </url>`;
}

export function buildSitemapXml() {
  const today = new Date().toISOString().split("T")[0];

  const urls = [
    ...staticRoutes.map((route) =>
      buildUrlEntry(route.path, today, route.changefreq, route.priority),
    ),
    ...blogSlugs.map((slug) =>
      buildUrlEntry(`/blog/${slug}`, today, "monthly", "0.6"),
    ),
    ...caseStudySlugs.map((slug) =>
      buildUrlEntry(`/case-studies/${slug}`, today, "monthly", "0.6"),
    ),
  ].join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;
}

function generateSitemap() {
  const sitemap = buildSitemapXml();

  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }
  writeFileSync(join(outDir, "sitemap.xml"), sitemap, "utf-8");
  console.log("Generated sitemap.xml");
}

generateSitemap();
