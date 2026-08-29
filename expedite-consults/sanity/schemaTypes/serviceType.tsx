import LucideIconPicker from "@/components/LucideIconPicker";
import { CaseIcon, IconComponent } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import * as LucideIcons from "lucide-react";

export const serviceType = defineType({
	name: "service",
	title: "Services",
	type: "document",
	icon: CaseIcon,
	fields: [
		defineField({
			name: "name",
			title: "Name",
			description: "Name of the service (e.g., 'Cybersecurity Assessment')",
			type: "string",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "slug",
			title: "Slug",
			description:
				"Unique identifier for the service, used in URLs. Or click 'Generate' to create one automatically.",
			type: "slug",
			options: {
				source: "name",
				maxLength: 96,
			},
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "description",
			title: "Description",
			description: "A brief description of the service.",
			type: "text",
		}),
		defineField({
			name: "icon",
			title: "Icon",
			type: "string",
			description: "Icon representing the service.",
			components: {
				input: LucideIconPicker,
			},
		}),
		// defineField({
		// 	name: "icon",
		// 	title: "Icon",
		// 	type: "string",
		// 	description: "Icon identifier (e.g., for using with icon libraries)",
		// }),
		defineField({
			name: "color",
			title: "Color",
			type: "color",
			options: {
				disableAlpha: true, // set to false if you want alpha channel
			},
			description:
				"Color associated with the service, used for branding or UI purposes.",
		}),
		defineField({
			name: "serviceBrief",
			title: "Service Brief / Overview",
			type: "blockContent",
			description: "A brief overview of the service offered.",
		}),

		defineField({
			name: "serviceImage",
			title: "Service Image",
			type: "image",
			description: "Image representing the service.",
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
			name: "importanceOfService",
			title: "Importance of Service",
			type: "blockContent",
			description: "Importance of the service offered.",
		}),
		defineField({
			name: "howItWorks",
			title: "How It Works",
			type: "blockContent",
			description: "Explanation of how the service works.",
		}),
		defineField({
			name: "cyberSecurityServices",
			title: "Cyber Security Services",
			description: "List of cybersecurity services related to this service.",
			type: "array",
			of: [{ type: "reference", to: { type: "serviceContent" } }],
		}),
		defineField({
			name: "cyberSecurityFrameworks",
			title: "Cyber Security Frameworks",
			description: "List of cybersecurity frameworks related to this service.",
			type: "array",
			of: [{ type: "reference", to: { type: "frameworkContent" } }],
		}),
	],
	preview: {
		select: {
			title: "name",
			icon: "icon",
		},
		prepare({ title, icon }) {
			const IconComponent =
				icon && LucideIcons[icon as keyof typeof LucideIcons];

			return {
				title,
				media: IconComponent ? <IconComponent /> : undefined,
			};
		},
	},
});
