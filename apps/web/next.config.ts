import type { NextConfig } from "next";
import { platform } from "os";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: platform() === "win32" ? undefined : "standalone",
  reactStrictMode: true,
  transpilePackages: ["@aivo/brand"],
};

export default withNextIntl(nextConfig);
