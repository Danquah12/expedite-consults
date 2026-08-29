import { defineQuery } from "groq";
import { sanityFetch } from "../live";

async function getServicesBySlug(slug: string) {
	const getServicesBySlugQuery =
		defineQuery(`*[_type == "service" && slug.current == $slug][0]{
        ...,
		serviceBrief,
        serviceImage,
          benefits[]->{...},
          importanceOfService,
          howItWorks,
        cyberSecurityServices[]->{
            title,
            slug,
			description,
        },
        cyberSecurityFrameworks[]->{
             title,
            slug,
			description,
        }
    }`);

	const services = await sanityFetch({
		query: getServicesBySlugQuery,
		params: { slug },
	});

	return services.data;
}

export default getServicesBySlug;
