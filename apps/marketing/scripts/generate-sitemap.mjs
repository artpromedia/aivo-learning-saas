import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "out");

const SITE_URL = "https://aivolearning.com";

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

function generateSitemap() {
  const today = new Date().toISOString().split("T")[0];

  const urls = [
    ...staticRoutes.map(
      (route) => `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
    ),
    ...blogSlugs.map(
      (slug) => `  <url>
    <loc>${SITE_URL}/blog/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`,
    ),
    ...caseStudySlugs.map(
      (slug) => `  <url>
    <loc>${SITE_URL}/case-studies/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`,
    ),
  ].join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }
  writeFileSync(join(outDir, "sitemap.xml"), sitemap, "utf-8");
  console.log("Generated sitemap.xml");
}

generateSitemap();
