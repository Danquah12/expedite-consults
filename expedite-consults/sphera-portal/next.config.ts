import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost:3004", "127.0.0.1:3004", "192.168.61.1:3004", "192.168.61.1", "localhost", "127.0.0.1"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "uploadthing.com" },
      { protocol: "https", hostname: "image.mux.com" },
      { protocol: "https", hostname: "stream.mux.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async headers() {
    const frameCsp =
      "frame-src 'self' blob: data: https://connectln-devhub.vercel.app https://*.vercel.app https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://tuhousing.vercel.app https://dstrike.app https://*.dstrike.app; object-src 'self' blob: data:;"
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: frameCsp,
          },
        ],
      },
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/connectin",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
