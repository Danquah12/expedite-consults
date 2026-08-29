import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function getLegal() {
	const getLegalQuery = defineQuery(`*[_type == "legal"] {
    slug,
    title,
}`);

	const legal = await sanityFetch({
		query: getLegalQuery,
	});

	return legal.data;
}

export async function getLegalBySlug(slug: string) {
	const getLegalBySlugQuery =
		defineQuery(`*[_type == "legal" && slug.current == $slug][0] {
    ...,
    body
}`);

	const legal = await sanityFetch({
		query: getLegalBySlugQuery,
		params: { slug },
	});

	return legal.data;
}
