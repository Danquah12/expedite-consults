import { DocumentTextIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const frameworkContentType = defineType({
	name: "frameworkContent",
	title: "Framework Content",
	type: "document",
	icon: DocumentTextIcon,
	fields: [
		defineField({
			name: "title",
			title: "Title",
			description: "The title of the framework.",
			type: "string",
			validation: (rule) => rule.required(),
		}),

		defineField({
			name: "slug",
			title: "Slug",
			description:
				"Unique identifier for the framework, used in URLs. Or click 'Generate' to create one automatically.",
			type: "slug",
			options: {
				source: "title",
				maxLength: 96,
			},
			validation: (rule) => rule.required(),
		}),

		defineField({
			name: "description",
			title: "Description",
			description: "A brief overview of the service offered.",
			type: "text",
		}),

		defineField({
			name: "serviceSummary",
			title: "Service Summary",
			description: "A brief overview of the service offered.",
			type: "array",
			of: [{ type: "block" }],
		}),

		defineField({
			name: "keyChallenges",
			title: "Key Challenges",
			description:
				"State and address key challenges faced by clients in this area.",
			type: "array",
			of: [{ type: "block" }],
		}),

		defineField({
			name: "keyChallengeImage",
			title: "Key Challenge Image",
			type: "image",
			options: {
				hotspot: true,
			},
		}),
		defineField({
			name: "benefits",
			title: "Benefits",
			description: "List of benefits associated with the service.",
			type: "array",
			of: [{ type: "reference", to: { type: "benefits" } }],
		}),

		defineField({
			name: "howItWorks",
			title: "How it Works",
			description:
				"Describe how the service works, including any processes or methodologies used.",
			type: "array",
			of: [{ type: "block" }],
		}),

		defineField({
			name: "howItWorksImage",
			title: "How It Works Image",
			type: "image",
			options: {
				hotspot: true,
			},
		}),
	],
});
