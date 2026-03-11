import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "dgalywyr863hv.cloudfront.net", // Strava images
      },
    ],
  },
};

export default nextConfig;
