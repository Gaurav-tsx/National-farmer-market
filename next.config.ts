import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
    ],
  },
  // If an external backend on Render or Koyeb is provided, proxy /api/v1 calls to it
  async rewrites() {
    if (backendUrl && backendUrl.startsWith("http")) {
      return [
        {
          source: "/backend-api/:path*",
          destination: `${backendUrl}/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
