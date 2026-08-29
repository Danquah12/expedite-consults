import { BlockContentIcon } from "@sanity/icons";
import {
	ConditionalPropertyCallbackContext,
	defineField,
	defineType,
	ReferenceOptions,
} from "sanity";

import { client } from "../lib/client";

export const insightType = defineType({
	name: "insight",
	title: "Insight",
	type: "document",
	icon: BlockContentIcon,
	fields: [
		defineField({
			name: "title",
			description: "Title of the blog post or news article",
			title: "Title",
			type: "string",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "slug",
			type: "slug",
			description:
				"Unique identifier for the post, used in URLs. Or click 'Generate' to create one automatically.",
			title: "Slug",
			options: {
				source: "title",
			},
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "author",
			type: "reference",
			description:
				"Author of the post. Ensure the author is created in the 'Author' schema before selecting here.",
			title: "Author",
			to: { type: "author" },
		}),
		defineField({
			name: "mainImage",
			type: "image",
			description:
				"Main image for the post. This image will be used for social media sharing.",
			title: "Main Image",
			options: {
				hotspot: true,
			},
		}),
		defineField({
			name: "category",
			type: "reference",
			description: "Category of the post (e.g., Blog, News).",
			title: "Category",
			to: [{ type: "category" }],
			validation: (rule) => rule.required(),
			options: {
				// This shows the reference as a dropdown
				layout: "dropdown",
			} as ReferenceOptions,
		}),

		defineField({
			name: "isTopBlog",
			type: "boolean",
			title: "Top Blog",
			description: "Mark this post as a top blog",
			initialValue: false,
			hidden: (context: ConditionalPropertyCallbackContext) =>
				context.parent?.category?._ref !==
				"b41d3ff4-9964-4a65-82cd-0a1cc0d08eb4",
			validation: (Rule) =>
				Rule.custom(async (isTopBlog, context) => {
					if (isTopBlog) {
						const result = await client.fetch(
							`*[_type == "insight" && isTopBlog == true && _id != $id][0]`,
							{ id: context.document?._id }
						);
						if (result) {
							return "Only one blog can be marked as 'Top Blog' at a time.";
						}
					}
					return true;
				}),
		}),

		defineField({
			name: "isTopNews",
			type: "boolean",
			title: "Top News",
			description: "Mark this post as a top news item",
			initialValue: false,
			hidden: (context: ConditionalPropertyCallbackContext) =>
				context.parent?.category?._ref !==
				"48b5fbaf-4f35-40cb-b8a6-a0f3b34575ff",
			validation: (Rule) =>
				Rule.custom(async (isTopNews, context) => {
					if (isTopNews) {
						const result = await client.fetch(
							`*[_type == "insight" && isTopNews == true && _id != $id][0]`,
							{ id: context.document?._id }
						);
						if (result) {
							return "Only one news item can be marked as 'Top News' at a time.";
						}
					}
					return true;
				}),
		}),
		defineField({
			name: "publishedAt",
			type: "datetime",
			description:
				"Date and time when the post was published. This will be used for sorting and displaying posts.",
			title: "Published At",
		}),
		defineField({
			name: "description",
			title: "Description",
			type: "text",
			description:
				"Optional: short summary for SEO and previews. Will be auto-generated from the body if left empty.",
		}),
		defineField({
			name: "body",
			type: "blockContent",
			description:
				"Content of the post. Use blocks for rich text, images, and other media.",
			title: "Body",
		}),
	],
	preview: {
		select: {
			title: "title",
			author: "author.name",
			media: "mainImage",
			isTopBlog: "isTopBlog",
			isTopNews: "isTopNews",
		},
		prepare({ title, author, media, isTopBlog, isTopNews }) {
			let subtitleParts: string[] = [];

			if (author) {
				subtitleParts.push(`by ${author}`);
			}

			if (isTopBlog) {
				subtitleParts.push("🌟 Top Blog");
			}

			if (isTopNews) {
				subtitleParts.push("📰 Top News");
			}

			return {
				title,
				media,
				subtitle: subtitleParts.join(" – "),
			};
		},
	},
});
