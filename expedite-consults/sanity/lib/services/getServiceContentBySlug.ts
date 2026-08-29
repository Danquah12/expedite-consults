import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function getServicesContentBySlug(slug: string) {
	const getServicesContentQuery =
		defineQuery(`*[_type == "serviceContent" && slug.current == $slug][0]{
        ...,
		benefits[]->{...},
        cyberSecurityServices[]->{
            title,
            slug
        }
    }`);

	const services = await sanityFetch({
		query: getServicesContentQuery,
		params: { slug },
	});

	return services.data;
}

export async function getServicesByContentSlug(slug: string) {
	const getServicesByContentQuery =
		defineQuery(`*[_type == "service" && references(*[_type == "serviceContent" && slug.current == $slug][0]._id)][0]{
		name,
		icon,
		color,
		slug
	}`);

	const services = await sanityFetch({
		query: getServicesByContentQuery,
		params: { slug },
	});

	return services.data;
}
