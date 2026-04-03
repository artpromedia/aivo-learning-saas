import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ─── Configuration ─────────────────────────────────────────────── */

const RAW_DIR = path.join(__dirname, "../public/hero/raw");
const OUTPUT_DIR = path.join(__dirname, "../public/hero/optimized");
const MANIFEST_PATH = path.join(__dirname, "../public/hero/manifest.json");

const FORMATS = ["avif", "webp", "jpeg"] as const;
type Format = (typeof FORMATS)[number];

/** Background hero images — landscape responsive widths */
const HERO_WIDTHS = [640, 1024, 1536, 1920, 2560];
/** Mobile-specific images (portrait) — smaller widths */
const MOBILE_WIDTHS = [375, 640, 1024];

const QUALITY: Record<Format, number> = {
  avif: 75,
  webp: 82,
  jpeg: 85,
};

/** Portrait images get mobile widths; landscape images get hero widths */
function isPortrait(width: number, height: number): boolean {
  return height > width;
}

/* ─── Types ─────────────────────────────────────────────────────── */

interface ManifestEntry {
  srcSet: Record<Format, string>;
  sizes: string;
  blurDataURL: string;
  width: number;
  height: number;
  aspectRatio: string;
}

interface Manifest {
  generated: string;
  slides: Record<string, ManifestEntry>;
}

/* ─── Helpers ───────────────────────────────────────────────────── */

async function ensureDirs() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function generateBlurPlaceholder(inputPath: string): Promise<string> {
  const buffer = await sharp(inputPath)
    .resize(10)
    .blur(1)
    .jpeg({ quality: 50 })
    .toBuffer();
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function aspectRatio(w: number, h: number): string {
  const d = gcd(w, h);
  return `${w / d}/${h / d}`;
}

/* ─── Per-Format Encoding ───────────────────────────────────────── */

function applyFormat(transformer: sharp.Sharp, format: Format): void {
  if (format === "avif") {
    transformer.avif({ quality: QUALITY.avif });
  } else if (format === "webp") {
    transformer.webp({ quality: QUALITY.webp });
  } else {
    transformer.jpeg({ quality: QUALITY.jpeg, mozjpeg: true });
  }
}

function formatExt(format: Format): string {
  return format === "jpeg" ? "jpg" : format;
}

/* ─── Process Single Image ──────────────────────────────────────── */

async function processImage(
  inputPath: string,
  slug: string,
  index: number,
  total: number,
): Promise<{ entry: ManifestEntry; files: number; bytes: number }> {
  console.log(`[${index + 1}/${total}] Processing ${slug}...`);

  const meta = await sharp(inputPath).metadata();
  const origWidth = meta.width ?? 1920;
  const origHeight = meta.height ?? 1080;

  const portrait = isPortrait(origWidth, origHeight);
  const widths = (portrait ? MOBILE_WIDTHS : HERO_WIDTHS).filter(
    (w) => w <= origWidth,
  );
  const sizes = portrait
    ? "(max-width: 768px) 100vw, 50vw"
    : "(max-width: 768px) 100vw, 60vw";

  const blurDataURL = await generateBlurPlaceholder(inputPath);

  const srcSet: Record<Format, string[]> = { avif: [], webp: [], jpeg: [] };
  let files = 0;
  let bytes = 0;

  for (const width of widths) {
    for (const format of FORMATS) {
      const ext = formatExt(format);
      const outName = `${slug}-${width}w.${ext}`;
      const outputPath = path.join(OUTPUT_DIR, outName);

      const transformer = sharp(inputPath).resize(width);
      applyFormat(transformer, format);

      const info = await transformer.toFile(outputPath);
      srcSet[format].push(`/hero/optimized/${outName} ${width}w`);
      files++;
      bytes += info.size;

      if (width === 1920 && info.size > 200 * 1024) {
        console.warn(
          `   WARNING: ${outName}: ${(info.size / 1024).toFixed(0)}KB exceeds 200KB target`,
        );
      }
    }
  }

  console.log(
    `   Done: ${widths.length} sizes x ${FORMATS.length} formats = ${widths.length * FORMATS.length} files`,
  );

  return {
    entry: {
      srcSet: {
        avif: srcSet.avif.join(", "),
        webp: srcSet.webp.join(", "),
        jpeg: srcSet.jpeg.join(", "),
      },
      sizes,
      blurDataURL,
      width: origWidth,
      height: origHeight,
      aspectRatio: aspectRatio(origWidth, origHeight),
    },
    files,
    bytes,
  };
}

/* ─── Main Pipeline ─────────────────────────────────────────────── */

async function run() {
  console.log("Starting AIVO Hero Image Optimization Pipeline...\n");
  const startTime = Date.now();
  await ensureDirs();

  const rawFiles = await glob("*.{png,webp,jpg,jpeg}", { cwd: RAW_DIR });

  if (rawFiles.length === 0) {
    console.warn("No raw images found in", RAW_DIR);
    process.exit(0);
  }

  console.log(`Found ${rawFiles.length} raw images in ${RAW_DIR}\n`);

  const manifest: Manifest = {
    generated: new Date().toISOString(),
    slides: {},
  };

  let totalFiles = 0;
  let totalSize = 0;

  for (const [index, fileName] of rawFiles.entries()) {
    const inputPath = path.join(RAW_DIR, fileName);
    const slug = path.parse(fileName).name;

    const result = await processImage(inputPath, slug, index, rawFiles.length);
    manifest.slides[slug] = result.entry;
    totalFiles += result.files;
    totalSize += result.bytes;
  }

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);

  console.log("\n--- Hero Image Pipeline Summary ---");
  console.log(`Images processed: ${rawFiles.length}`);
  console.log(`Files generated:  ${totalFiles}`);
  console.log(`Total size:       ${sizeMB} MB`);
  console.log(`Duration:         ${duration}s`);
  console.log(`Manifest:         ${MANIFEST_PATH}`);
}

run().catch((err) => {
  console.error("Hero Image Pipeline Failed:", err);
  process.exit(1);
});
