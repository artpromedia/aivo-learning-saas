import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "out");

const SITE_URL = "https://aivolearning.com";

const localeHreflangMap = [
  { code: "en", hreflang: "en-US" },
  { code: "es", hreflang: "es-ES" },
  { code: "fr", hreflang: "fr-FR" },
  { code: "ar", hreflang: "ar-SA" },
  { code: "zh", hreflang: "zh-CN" },
  { code: "pt", hreflang: "pt-BR" },
  { code: "sw", hreflang: "sw-KE" },
  { code: "ig", hreflang: "ig-NG" },
  { code: "yo", hreflang: "yo-NG" },
  { code: "ha", hreflang: "ha-NG" },
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

export function buildHreflangLinks(path) {
  const enUrl = `${SITE_URL}${path}`;
  const links = localeHreflangMap.map(({ code, hreflang }) => {
    const href = code === "en" ? `${SITE_URL}${path}` : `${SITE_URL}/${code}${path}`;
    return `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />`;
  });
  links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />`);
  return links.join("\n");
}

function buildUrlEntry(path, today, changefreq, priority) {
  return `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${buildHreflangLinks(path)}
  </url>`;
}

export function generateSitemapXml() {
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
  const sitemap = generateSitemapXml();

  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }
  writeFileSync(join(outDir, "sitemap.xml"), sitemap, "utf-8");
  console.log("Generated sitemap.xml");
}

// Only run when executed directly (not when imported for testing)
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  generateSitemap();
}
