import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Allow images from common financial data providers
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.alphavantage.co",
      },
    ],
  },

  // TODO (premium): Add i18n support for multi-language expansion
  // TODO (premium): Add redirects for old URL structure if needed
};

export default nextConfig;
