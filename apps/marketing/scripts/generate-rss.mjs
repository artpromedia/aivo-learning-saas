import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "out");

const SITE_URL = "https://aivolearning.com";
const SITE_TITLE = "AIVO Learning Blog";
const SITE_DESCRIPTION = "AI-powered personalized learning insights, product updates, and education research.";

const posts = [
  {
    slug: "introducing-aivo",
    title: "Introducing AIVO: AI-Native Adaptive Learning",
    date: "2025-01-15",
    excerpt: "Today we're launching AIVO Learning — a platform built from the ground up with AI at its core.",
  },
  {
    slug: "how-brain-clone-works",
    title: "How the Learner Brain Works: Inside AIVO's Clone Architecture",
    date: "2025-01-22",
    excerpt: "A deep dive into the technical architecture behind Brain Clone AI.",
  },
  {
    slug: "no-learner-left-behind",
    title: "No Learner Left Behind: Supporting All Functioning Levels",
    date: "2025-02-05",
    excerpt: "How AIVO's inclusive design ensures every student gets the support they need.",
  },
];

function generateRss() {
  const items = posts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(
      (post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`,
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}/blog</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }
  writeFileSync(join(outDir, "feed.xml"), rss, "utf-8");
  console.log("Generated feed.xml");
}

generateRss();
