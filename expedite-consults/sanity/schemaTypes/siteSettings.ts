// schemas/siteSettings.ts
import { CogIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
	name: "siteSettings",
	title: "Site Settings",
	type: "document",
	icon: CogIcon,
	fields: [
		// defineField({
		// 	name: "siteTitle",
		// 	title: "Site Title",
		// 	type: "string",
		// }),
		defineField({
			name: "heroHeading",
			title: "Hero Heading",
			type: "string",
		}),
		defineField({
			name: "heroSubheading",
			title: "Hero Subheading",
			type: "text",
		}),
		defineField({
			name: "heroImage",
			title: "Hero Image",
			type: "image",
			options: {
				hotspot: true,
			},
		}),
		defineField({
			name: "email",
			title: "Contact Email",
			type: "string",
		}),
		defineField({
			name: "phone",
			title: "Phone Number",
			type: "string",
		}),
		defineField({
			name: "whatsapp",
			title: "Whatsapp Number",
			description:
				"Include country code and Omit any zeroes, plus, brackets, or dashes when adding the phone number in international format. eg. 11234567890",
			type: "string",
			validation: (Rule) =>
				Rule.regex(/^[1-9][0-9]{7,14}$/, {
					name: "international format",
					invert: false,
				}).error(
					"Invalid format. Use digits only (no +, 0s, or symbols). E.g., 11234567890"
				),
		}),
		defineField({
			name: "address",
			title: "Office Address",
			type: "text",
		}),
		defineField({
			name: "officeMap",
			title: "Office Map",
			description: "Google Maps link eg. https://goo.gl/maps/...",
			type: "url",
		}),
		defineField({
			name: "partnerImage", // add this line
			type: "array",
			of: [{ type: "partnerImage" }],
		}),
		defineField({
			name: "socialLinks",
			title: "Social Links",
			type: "array",
			of: [{ type: "socialLink" }],
		}),
	],
	preview: {
		prepare() {
			return {
				title: "Site Settings",
			};
		},
	},
});
