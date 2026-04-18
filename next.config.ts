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
    // Explicitly set X-Robots-Tag on production. Vercel preview deployments
    // inject their own noindex at platform level regardless of this header —
    // this only reinforces correct indexing on the production domain.
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Robots-Tag", value: "index, follow" },
        ],
      },
    ];
  },
};

export default nextConfig;
