import { defineQuery } from "groq";
import { sanityFetch } from "../live";

async function getInsightBySlug(slug: string) {
	const getInsightBySlugQuery = defineQuery(
		`*[_type == "insight" && slug.current == $slug][0]{
      ...,
      category->{ ... },
      author->{ ... }
    }`
	);

	const insight = await sanityFetch({
		query: getInsightBySlugQuery,
		params: { slug },
	});

	return insight.data;
}

export default getInsightBySlug;
