import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const RAW_DIR = path.join(__dirname, "../public/assets/tutors/raw");
const OUTPUT_DIR = path.join(__dirname, "../public/assets/tutors/optimized");
const MANIFEST_PATH = path.join(
  __dirname,
  "../public/assets/tutors/manifest.json",
);

const PERSONAS = [
  "nova",
  "sage",
  "spark",
  "chrono",
  "pixel",
  "harmony",
  "echo",
];
const FORMATS = ["avif", "webp", "png"] as const;

const CONFIG = {
  hero: {
    widths: [480, 768, 1024, 1536],
    sizes: "(max-width: 768px) 100vw, 480px",
    quality: { avif: 80, webp: 85, png: 90 },
  },
  avatar: {
    widths: [48, 96, 160, 320, 640],
    sizes: "(max-width: 640px) 100vw, 320px",
    quality: { avif: 80, webp: 85, png: 90 },
  },
};

interface ManifestEntry {
  srcSet: Record<(typeof FORMATS)[number], string>;
  sizes: string;
  blurDataURL: string;
  width: number;
  height: number;
}

interface Manifest {
  generated: string;
  tutors: Record<string, { hero?: ManifestEntry; avatar?: ManifestEntry }>;
}

async function ensureDirs() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function generateBlurPlaceholder(inputPath: string): Promise<string> {
  const buffer = await sharp(inputPath).resize(10).blur(1).toBuffer();
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

async function run() {
  console.log("Starting AIVO Tutor Image Optimization Pipeline...");
  const startTime = Date.now();
  await ensureDirs();

  const manifest: Manifest = {
    generated: new Date().toISOString(),
    tutors: {},
  };

  let totalFiles = 0;
  let totalSize = 0;

  for (const [index, persona] of PERSONAS.entries()) {
    manifest.tutors[persona] = {};

    for (const type of ["hero", "avatar"] as const) {
      const fileName = `${persona}-${type}.png`;
      const inputPath = path.join(RAW_DIR, fileName);

      try {
        await fs.access(inputPath);
      } catch {
        console.warn(`  Skipping: ${fileName} (not found in raw directory)`);
        continue;
      }

      console.log(`[${index + 1}/7] Optimizing ${fileName}...`);

      const config = CONFIG[type];
      const srcSet: Record<string, string[]> = { avif: [], webp: [], png: [] };

      const blurDataURL = await generateBlurPlaceholder(inputPath);

      for (const width of config.widths) {
        for (const format of FORMATS) {
          const outName = `${persona}-${type}-${width}w.${format}`;
          const outputPath = path.join(OUTPUT_DIR, outName);

          const transformer = sharp(inputPath).resize(width);

          if (format === "avif")
            transformer.avif({ quality: config.quality.avif });
          if (format === "webp")
            transformer.webp({ quality: config.quality.webp });
          if (format === "png")
            transformer.png({ quality: config.quality.png, palette: true });

          const info = await transformer.toFile(outputPath);

          srcSet[format].push(
            `/assets/tutors/optimized/${outName} ${width}w`,
          );
          totalFiles++;
          totalSize += info.size;
        }
      }

      manifest.tutors[persona][type] = {
        srcSet: {
          avif: srcSet.avif.join(", "),
          webp: srcSet.webp.join(", "),
          png: srcSet.png.join(", "),
        },
        sizes: config.sizes,
        blurDataURL,
        width: Math.max(...config.widths),
        height: Math.max(...config.widths),
      };

      console.log(
        `   Done: ${type} (${config.widths.length} sizes x 3 formats)`,
      );
    }
  }

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);

  console.log("\n--- Pipeline Summary ---");
  console.log(`Complete: ${totalFiles} files generated`);
  console.log(`Total Size: ${sizeMB}MB`);
  console.log(`Duration: ${duration}s`);
  console.log(`Manifest: ${MANIFEST_PATH}`);
}

run().catch((err) => {
  console.error("Pipeline Failed:", err);
  process.exit(1);
});
