// schemas/testimonial.ts

import { CommentIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const testimonialType = defineType({
	name: "testimonial",
	title: "Testimonial",
	type: "document",
	icon: CommentIcon,
	fields: [
		defineField({
			name: "name",
			title: "Name",
			description: "Name of the person giving the testimonial",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "role",
			title: "Role / Title",
			description: "Role or title of the person giving the testimonial",
			type: "string",
		}),
		defineField({
			name: "company",
			title: "Company",
			description:
				"Company or organization of the person giving the testimonial",
			type: "string",
		}),
		defineField({
			name: "quote",
			title: "Testimonial Quote",
			description: "The testimonial text provided by the person",
			type: "text",
			rows: 4,
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "image",
			title: "Avatar Image",
			description: "Avatar image of the person giving the testimonial",
			type: "image",
			options: {
				hotspot: true,
			},
		}),
		// defineField({
		// 	name: "rating",
		// 	title: "Rating",
		// 	type: "number",
		// 	validation: (Rule) => Rule.min(1).max(5),
		// }),
		defineField({
			name: "featured",
			title: "Featured",
			description: "Is this testimonial featured on the homepage?",
			type: "boolean",
		}),
	],
	preview: {
		select: {
			title: "name",
			subtitle: "quote",
			media: "image",
		},
		prepare({ title, subtitle, media }) {
			return {
				title,
				subtitle:
					subtitle?.length > 60 ? subtitle.slice(0, 57) + "..." : subtitle,
				media,
			};
		},
	},
});
