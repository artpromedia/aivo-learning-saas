import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/fastify-plugin.ts", "src/react.tsx"],
  format: ["esm"],
  dts: false,
  splitting: true,
  clean: true,
});
