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
	outputFileTracingExcludes: {
		"*": [
			"**/*.zip",
			"**/*.docx",
			"**/*.pdf",
			"**/*.db",
			"**/backups/**",
			"**/BACKUPS/**",
			"**/desk-note-midterms/**",
			"**/desk-note-src/**",
			"**/evidence_vault/**",
			"**/noctis-ai/**",
			"**/noctis-ai-engine/**",
			"**/accra-helsinki-platform/**",
			"**/sphera-portal/**",
			"**/tuhousing-careersuite/**",
			"**/careerorbit/**",
			"**/orea-prezi/**",
			"**/staged_*/**",
		],
	},
};

export default nextConfig;
