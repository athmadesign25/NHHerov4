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
        destination: '/search/doctors',
        permanent: false,
      },
      {
        source: '/book',
        destination: '/search/doctors',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
