import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/veritaslens",
        destination: "https://expedite-consults.vercel.app/veritaslens",
      },
      {
        source: "/veritaslens/:path*",
        destination: "https://expedite-consults.vercel.app/veritaslens/:path*",
      },
      {
        source: "/api/veritaslens/:path*",
        destination: "https://expedite-consults.vercel.app/api/veritaslens/:path*",
      },
    ];
  },
};

export default nextConfig;
