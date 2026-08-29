import { defineField } from "sanity";

export const partnerImage = defineField({
	name: "partnerImage", // add this line
	type: "image",
	options: {
		hotspot: true,
	},
	fields: [
		defineField({
			name: "alt",
			title: "Alt Text",
			type: "string",
			description: "Alternative text for screen readers and SEO",
		}),
	],
});
