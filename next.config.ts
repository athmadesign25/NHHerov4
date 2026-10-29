import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "stgaccinwbsprdlrs02.blob.core.windows.net",
      },
    ],
    // Allow local assets served from /public
  },
  devIndicators: false,
};

export default nextConfig;
