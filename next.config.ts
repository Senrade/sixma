import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  reactCompiler: true,
  // Allow dev resources to be fetched from 127.0.0.1 during Playwright tests.
  // Prevents cross-origin blocking when the test runner uses 127.0.0.1 but the dev server is bound to localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
