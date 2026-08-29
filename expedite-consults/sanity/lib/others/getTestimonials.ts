import { defineQuery } from "groq";
import { sanityFetch } from "../live";

async function getTestimonial() {
	const getTestimonialQuery =
		defineQuery(`*[_type == "testimonial" && featured == true] | order(_createdAt desc){
    name,
    role,
    company,
    quote,
    image
}`);

	const testimonials = await sanityFetch({
		query: getTestimonialQuery,
	});

	return testimonials.data;
}

export default getTestimonial;
