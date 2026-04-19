import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.alphavantage.co",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.dcatracker.fr" }],
        destination: "https://dcatracker.fr/:path*",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        // Only set index/follow on the canonical domain.
        // Requests to *.vercel.app are redirected by middleware before reaching here.
        source: "/(.*)",
        has: [{ type: "host", value: "dcatracker.fr" }],
        headers: [{ key: "X-Robots-Tag", value: "index, follow" }],
      },
    ];
  },
};

export default nextConfig;
