import { defineQuery } from "groq";
import { sanityFetch } from "../live";

async function getSiteSettings() {
	const getSiteSettingsQuery = defineQuery(`*[_type == "siteSettings"][0]`);

	const siteSettings = await sanityFetch({
		query: getSiteSettingsQuery,
	});

	return siteSettings.data;
}

export default getSiteSettings;
