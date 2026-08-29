import { defineQuery } from "groq";
import { sanityFetch } from "../live";

async function getAllInsights() {
	const getAllInsightsQuery = defineQuery(
		`*[_type == "insight"] | order(_createdAt desc) {
     	_id,
	  title,
	  slug,
	  isTopBlog,
    isTopNews,
	  mainImage,
	  category->{
		...
	  },
	  publishedAt,
	   "description": body[0..1].children[].text
    }`
	);

	const insight = await sanityFetch({
		query: getAllInsightsQuery,
	});

	return insight.data;
}

export default getAllInsights;
