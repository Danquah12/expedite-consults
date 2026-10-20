import { defineQuery } from "groq";
import { sanityFetch } from "../live";

async function getSiteSettings() {
	const getSiteSettingsQuery = defineQuery(`*[_type == "siteSettings"][0]`);

	const siteSettings = await sanityFetch({
		query: getSiteSettingsQuery,
	});

	return {
		...siteSettings.data,
		email: "kasiedu@expedite-consults.com",
		phone: "1-855-443-9733",
		whatsapp: "12402607898",
	};
}

export default getSiteSettings;
