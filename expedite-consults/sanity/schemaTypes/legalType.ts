import { VersionsIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const legalType = defineType({
	name: "legal",
	title: "Legal",
	type: "document",
	icon: VersionsIcon,
	fields: [
		defineField({
			name: "title",
			type: "string",
			description: "Title of the legal document",
		}),
		defineField({
			name: "slug",
			type: "slug",
			description:
				"Unique identifier for the document, used in URLs. Or click 'Generate' to create one automatically.",
			options: {
				source: "title",
			},
		}),

		defineField({
			name: "body",
			title: "Content",
			description: "Content of the legal document",
			type: "blockContent",
		}),
	],
	preview: {
		select: {
			title: "title",
		},
		prepare({ title }) {
			let subtitleParts: string[] = [];

			return {
				title,
				subtitle: subtitleParts.join(" – "),
			};
		},
	},
});
