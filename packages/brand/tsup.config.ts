import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/tokens.ts",
    "src/email.ts",
    "src/flutter.ts",
  ],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
});
