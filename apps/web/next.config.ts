import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    "*.replit.dev",
    "*.replit.app",
    "*.janeway.replit.dev",
  ],
  async rewrites() {
    return [
      { source: "/api/auth/:path*", destination: "http://localhost:3001/api/auth/:path*" },
      { source: "/api/users/:path*", destination: "http://localhost:3001/api/users/:path*" },
      { source: "/api/consent/:path*", destination: "http://localhost:3001/api/consent/:path*" },
      { source: "/api/assessments/:path*", destination: "http://localhost:3003/api/assessments/:path*" },
      { source: "/api/iep/:path*", destination: "http://localhost:3003/api/iep/:path*" },
      { source: "/api/brain/:path*", destination: "http://localhost:3002/api/brain/:path*" },
    ];
  },
};

export default nextConfig;
