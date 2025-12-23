/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public", // folder to store the service worker
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // disable PWA in dev
});

const nextConfig = withPWA({
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    dangerouslyAllowSVG: true,
    unoptimized: true,
  },
});

module.exports = nextConfig;
