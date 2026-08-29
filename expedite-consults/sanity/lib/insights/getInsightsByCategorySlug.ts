import { sanityFetch } from "../live";
import { defineQuery } from "groq";

export async function getInsightsByCategorySlug(slug: string) {
	const getInsightByCategoryQuery = defineQuery(
		`*[_type == "insight" && category->slug.current == $slug] | order(_createdAt desc) {
		_id,
		_createdAt,
	  title,
	  slug,
	  isTopBlog,
	  isTopNews,
	  mainImage,
	  category->{
		...
	  },
	  publishedAt,
	   "description": body[0].children[].text
	}`
	);

	const category = await sanityFetch({
		query: getInsightByCategoryQuery,
		params: { slug },
	});
	return category.data;
}
