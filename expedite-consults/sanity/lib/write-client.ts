import { createClient } from "next-sanity";
import { apiVersion } from "../env";

/**
 * Write-capable Sanity client for CR operations.
 * Points to the DEDICATED CR Sanity project (tmo23gzo) — separate from the website project.
 * Requires CR_SANITY_TOKEN with Editor permissions.
 */
export const writeClient = createClient({
	projectId: process.env.CR_SANITY_PROJECT_ID ?? "tmo23gzo",
	dataset: process.env.CR_SANITY_DATASET ?? "production",
	apiVersion,
	useCdn: false,
	token: process.env.CR_SANITY_TOKEN,
});

/**
 * Read-only client for the CR project (no token needed for public reads).
 */
export const crReadClient = createClient({
	projectId: process.env.CR_SANITY_PROJECT_ID ?? "tmo23gzo",
	dataset: process.env.CR_SANITY_DATASET ?? "production",
	apiVersion,
	useCdn: false,
	token: process.env.CR_SANITY_TOKEN,
});

