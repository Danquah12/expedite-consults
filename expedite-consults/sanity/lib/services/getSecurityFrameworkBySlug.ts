import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function getSecurityFrameworkBySlug(slug: string) {
	const getSecurityFrameworkQuery =
		defineQuery(`*[_type == "frameworkContent" && slug.current == $slug][0]{
        ...,
        benefits[]->{...},
        cyberSecurityFrameworks[]->{
            title,
            slug
        }
    }`);

	const services = await sanityFetch({
		query: getSecurityFrameworkQuery,
		params: { slug },
	});

	return services.data;
}

export async function getSecurityFrameworkByContentSlug(slug: string) {
	const getFrameworkByContentQuery =
		defineQuery(`*[_type == "service" && references(*[_type == "frameworkContent" && slug.current == $slug][0]._id)][0]{
        name,
        icon,
        color,
        slug
    }`);

	const services = await sanityFetch({
		query: getFrameworkByContentQuery,
		params: { slug },
	});

	return services.data;
}
