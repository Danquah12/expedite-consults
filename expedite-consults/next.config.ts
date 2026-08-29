import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		remotePatterns: [
			{
				hostname: "cdn.sanity.io",
				protocol: "https",
			},
			{
				hostname: "assets.aceternity.com",
				protocol: "https",
			},
		],
	},
};

export default nextConfig;
