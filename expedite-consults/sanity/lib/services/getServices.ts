import { defineQuery } from "groq";
import { sanityFetch } from "../live";

async function getServices() {
	const getServicesQuery = defineQuery(`*[_type == "service"]{
		name,
		slug,
		description,
		icon,
		color,
		cyberSecurityServices[]->{
			title,
			slug
		},
		cyberSecurityFrameworks[]->{
			title,
			slug
		},
	}`);

	const services = await sanityFetch({
		query: getServicesQuery,
	});

	return services.data;
}

export default getServices;
