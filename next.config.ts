import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Node.js-only packages in server-side API routes
  serverExternalPackages: ["yahoo-finance2", "cheerio"],
};

export default nextConfig;
