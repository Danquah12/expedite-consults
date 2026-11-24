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
      "frame-src 'self' blob: data: https://connectln-devhub.vercel.app https://*.vercel.app https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://www.facebook.com https://web.facebook.com https://m.facebook.com https://*.facebook.com https://fb.watch https://www.tiktok.com https://*.tiktok.com https://player.vimeo.com https://vimeo.com https://*.vimeo.com https://geo.dailymotion.com https://www.dailymotion.com https://*.dailymotion.com https://archive.org https://*.archive.org https://embed.ted.com https://www.ted.com https://*.ted.com https://makertube.net https://tilvids.com https://video.blender.org https://diode.zone https://spectra.video https://framatube.org https://peertube.tv https://*.peertube.tv https://tuhousing.vercel.app https://dstrike.app https://*.dstrike.app; object-src 'self' blob: data:;"
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
