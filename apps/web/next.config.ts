import type { NextConfig } from "next";
import { platform } from "os";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001";

const proxiedApiPrefixes = [
  "auth",
  "users",
  "learners",
  "lessons",
  "curriculum",
  "analytics",
  "notifications",
  "billing",
  "learning",
  "tutors",
  "shop",
  "teacher",
  "onboarding",
  "assessment",
  "family",
  "invitations",
  "tenants",
];

const nextConfig: NextConfig = {
  output: platform() === "win32" ? undefined : "standalone",
  reactStrictMode: true,
  transpilePackages: ["@aivo/brand"],
  async rewrites() {
    return [
      ...proxiedApiPrefixes.map((prefix) => ({
        source: `/api/${prefix}/:path*`,
        destination: `${BACKEND_URL}/api/${prefix}/:path*`,
      })),
      {
        source: "/family/:path*",
        destination: `${BACKEND_URL}/family/:path*`,
      },
      {
        source: "/assessment/:path*",
        destination: `${BACKEND_URL}/assessment/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
