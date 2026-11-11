import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the framework badge clear of the bottom-left design preview controls.
  devIndicators: false,
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
