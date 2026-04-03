/**
 * generate-og-banners.ts
 *
 * Composites SEO text overlays onto clean-plate AI-generated collage images.
 * Reads clean plates from public/assets/og/ and writes text-overlay versions.
 *
 * Usage:
 *   npx tsx scripts/generate-og-banners.ts
 *
 * Prerequisites:
 *   Place clean-plate images (no text) from Gemini into public/assets/og/:
 *     - tutors-collage-og-clean.png      (1200×630)
 *     - tutors-collage-banner-clean.png   (1920×600)
 *     - tutors-collage-square-clean.png   (1080×1080)
 */

import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OG_DIR = path.join(__dirname, "../public/assets/og");

// ── SVG Text Overlay Generators ──────────────────────────────────────────────

function ogTextOverlay(): Buffer {
  const svg = `
  <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <!-- Top area: brand name + separator -->
    <text x="600" y="52" text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="16" font-weight="600" fill="#FFFFFF"
          letter-spacing="2" text-transform="uppercase">
      AIVO LEARNING
    </text>
    <defs>
      <linearGradient id="sep" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#7c3aed"/>
        <stop offset="100%" stop-color="#14b8a6"/>
      </linearGradient>
    </defs>
    <rect x="560" y="62" width="80" height="2" rx="1" fill="url(#sep)"/>

    <!-- Bottom gradient scrim for text legibility -->
    <defs>
      <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a1a2e" stop-opacity="0"/>
        <stop offset="40%" stop-color="#1a1a2e" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#1a1a2e" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <rect x="0" y="430" width="1200" height="200" fill="url(#scrim)"/>

    <!-- Bottom area: headline -->
    <text x="600" y="530" text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="32" font-weight="800" fill="#FFFFFF">
      Seven AI Tutors. One Personalized Learning Team.
    </text>

    <!-- Subject dots -->
    <text x="600" y="560" text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="14" font-weight="500" fill="rgba(255,255,255,0.7)"
          letter-spacing="1">
      Math &#x2022; ELA &#x2022; Science &#x2022; History &#x2022; Coding &#x2022; SEL &#x2022; Speech
    </text>

    <!-- Tagline -->
    <text x="600" y="585" text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="12" font-weight="400" fill="rgba(255,255,255,0.5)">
      Adaptive AI tutoring for K-12 learners — including IEP support
    </text>

    <!-- Bottom-right URL -->
    <text x="1170" y="618" text-anchor="end"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="10" fill="rgba(255,255,255,0.3)">
      aivolearning.com
    </text>
  </svg>`;
  return Buffer.from(svg);
}

function bannerTextOverlay(): Buffer {
  const svg = `
  <svg width="1920" height="600" xmlns="http://www.w3.org/2000/svg">
    <!-- Bottom gradient scrim -->
    <defs>
      <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a1a2e" stop-opacity="0"/>
        <stop offset="30%" stop-color="#1a1a2e" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#1a1a2e" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sep" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#7c3aed"/>
        <stop offset="100%" stop-color="#14b8a6"/>
      </linearGradient>
    </defs>
    <rect x="0" y="380" width="1920" height="220" fill="url(#scrim)"/>

    <!-- Brand -->
    <text x="960" y="42" text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="14" font-weight="600" fill="#FFFFFF"
          letter-spacing="2">
      AIVO LEARNING
    </text>
    <rect x="920" y="50" width="80" height="2" rx="1" fill="url(#sep)"/>

    <!-- Headline -->
    <text x="960" y="500" text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="36" font-weight="800" fill="#FFFFFF">
      Seven AI Tutors. One Personalized Learning Team.
    </text>

    <!-- Subject dots -->
    <text x="960" y="535" text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="16" font-weight="500" fill="rgba(255,255,255,0.7)"
          letter-spacing="1">
      Math &#x2022; ELA &#x2022; Science &#x2022; History &#x2022; Coding &#x2022; SEL &#x2022; Speech
    </text>

    <!-- Tagline -->
    <text x="960" y="565" text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="13" font-weight="400" fill="rgba(255,255,255,0.5)">
      Adaptive AI tutoring for K-12 learners — including IEP support
    </text>

    <!-- Bottom-right URL -->
    <text x="1888" y="588" text-anchor="end"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="10" fill="rgba(255,255,255,0.3)">
      aivolearning.com
    </text>
  </svg>`;
  return Buffer.from(svg);
}

function squareTextOverlay(): Buffer {
  const svg = `
  <svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <!-- Bottom gradient scrim -->
    <defs>
      <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a1a2e" stop-opacity="0"/>
        <stop offset="40%" stop-color="#1a1a2e" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#1a1a2e" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sep" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#7c3aed"/>
        <stop offset="100%" stop-color="#14b8a6"/>
      </linearGradient>
    </defs>
    <rect x="0" y="750" width="1080" height="330" fill="url(#scrim)"/>

    <!-- Brand -->
    <text x="540" y="52" text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="16" font-weight="600" fill="#FFFFFF"
          letter-spacing="2">
      AIVO LEARNING
    </text>
    <rect x="500" y="62" width="80" height="2" rx="1" fill="url(#sep)"/>

    <!-- Headline -->
    <text x="540" y="920" text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="36" font-weight="800" fill="#FFFFFF">
      Seven AI Tutors.
    </text>
    <text x="540" y="960" text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="36" font-weight="800" fill="#FFFFFF">
      One Personalized Learning Team.
    </text>

    <!-- Subject dots -->
    <text x="540" y="1000" text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="14" font-weight="500" fill="rgba(255,255,255,0.7)"
          letter-spacing="1">
      Math &#x2022; ELA &#x2022; Science &#x2022; History &#x2022; Coding &#x2022; SEL &#x2022; Speech
    </text>

    <!-- Tagline -->
    <text x="540" y="1030" text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="12" font-weight="400" fill="rgba(255,255,255,0.5)">
      Adaptive AI tutoring for K-12 learners — including IEP support
    </text>

    <!-- Bottom-right URL -->
    <text x="1050" y="1065" text-anchor="end"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="10" fill="rgba(255,255,255,0.3)">
      aivolearning.com
    </text>
  </svg>`;
  return Buffer.from(svg);
}

// ── Main Pipeline ────────────────────────────────────────────────────────────

interface BannerSpec {
  cleanPlate: string;
  outputPrefix: string;
  width: number;
  height: number;
  overlay: () => Buffer;
  maxSizeKb: number;
}

const SPECS: BannerSpec[] = [
  {
    cleanPlate: "tutors-collage-og-clean.png",
    outputPrefix: "tutors-collage-og",
    width: 1200,
    height: 630,
    overlay: ogTextOverlay,
    maxSizeKb: 200,
  },
  {
    cleanPlate: "tutors-collage-banner-clean.png",
    outputPrefix: "tutors-collage-banner",
    width: 1920,
    height: 600,
    overlay: bannerTextOverlay,
    maxSizeKb: 300,
  },
  {
    cleanPlate: "tutors-collage-square-clean.png",
    outputPrefix: "tutors-collage-square",
    width: 1080,
    height: 1080,
    overlay: squareTextOverlay,
    maxSizeKb: 150,
  },
];

async function processSpec(spec: BannerSpec): Promise<void> {
  const inputPath = path.join(OG_DIR, spec.cleanPlate);

  // Check if clean plate exists
  try {
    await sharp(inputPath).metadata();
  } catch {
    console.warn(
      `  ⚠ Skipping ${spec.cleanPlate} — file not found. Place the clean-plate image in public/assets/og/`,
    );
    return;
  }

  console.log(`  Processing ${spec.cleanPlate}...`);

  // 1. Resize/crop clean plate to exact dimensions
  const base = sharp(inputPath)
    .resize(spec.width, spec.height, { fit: "cover", position: "center" })
    .toFormat("png");

  // 2. Clean plate WebP (no text)
  await base
    .clone()
    .webp({ quality: 85 })
    .toFile(path.join(OG_DIR, `${spec.outputPrefix}.webp`));

  // 3. Clean plate PNG (for OG fallback)
  if (spec.outputPrefix.includes("og")) {
    await base
      .clone()
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(path.join(OG_DIR, `${spec.outputPrefix}.png`));
  }

  // 4. Composite text overlay → WebP with text baked in
  const svgOverlay = spec.overlay();
  await base
    .clone()
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .webp({ quality: 85 })
    .toFile(path.join(OG_DIR, `${spec.outputPrefix}-text.webp`));

  // 5. OG text variant also needs a PNG fallback
  if (spec.outputPrefix.includes("og")) {
    await base
      .clone()
      .composite([{ input: svgOverlay, top: 0, left: 0 }])
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(path.join(OG_DIR, `${spec.outputPrefix}-text.png`));
  }

  // Report sizes
  const { promises: fsp } = await import("node:fs");
  const files = [
    `${spec.outputPrefix}.webp`,
    `${spec.outputPrefix}-text.webp`,
    ...(spec.outputPrefix.includes("og")
      ? [`${spec.outputPrefix}.png`, `${spec.outputPrefix}-text.png`]
      : []),
  ];

  for (const f of files) {
    const filePath = path.join(OG_DIR, f);
    try {
      const stat = await fsp.stat(filePath);
      const kb = (stat.size / 1024).toFixed(1);
      const status =
        stat.size / 1024 > spec.maxSizeKb ? " ⚠ OVER BUDGET" : " ✓";
      console.log(`    ${f}: ${kb} KB${status}`);
    } catch {
      // File didn't get created
    }
  }
}

async function main() {
  console.log("🎨 Generating OG banners with text overlays...\n");

  for (const spec of SPECS) {
    await processSpec(spec);
  }

  console.log("\n✅ Done! Output files are in public/assets/og/");
  console.log(
    "\nReminder: Place clean-plate images from Gemini before running this script:",
  );
  console.log("  - tutors-collage-og-clean.png      (1200×630)");
  console.log("  - tutors-collage-banner-clean.png   (1920×600)");
  console.log("  - tutors-collage-square-clean.png   (1080×1080)");
}

main().catch(console.error);
