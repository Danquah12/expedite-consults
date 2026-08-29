import LucideIconPicker from "@/components/LucideIconPicker";
import { CaseIcon, CheckmarkCircleIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import * as LucideIcons from "lucide-react";

export const benefitType = defineType({
	name: "benefits",
	title: "Benefits",
	type: "document",
	icon: CheckmarkCircleIcon,
	fields: [
		defineField({
			name: "icon",
			title: "Icon",
			description: "Icon representing the benefit.",
			type: "string",
			components: {
				input: LucideIconPicker,
			},
		}),

		defineField({
			name: "name",
			title: "Name",
			description: "Name of the benefit",
			type: "string",
			validation: (rule) => rule.required(),
		}),

		defineField({
			name: "description",
			title: "Description",
			description: "Brief description of the benefit",
			type: "text",
			validation: (rule) => rule.required(),
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
