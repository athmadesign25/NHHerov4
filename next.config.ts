import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    // Allow local assets served from /public
  },
  async redirects() {
    return [
      {
        source: '/find-a-doctor',
        destination: '/search?q=Doctor&location=All',
        permanent: false,
      },
      {
        source: '/book',
        destination: '/search?q=Doctor&location=All',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
