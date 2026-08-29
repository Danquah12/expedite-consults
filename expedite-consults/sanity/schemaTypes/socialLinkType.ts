import { defineField } from "sanity";

export const socialLinkType = defineField({
	name: "socialLink",
	title: "Social Link",
	type: "object",
	fields: [
		{ name: "platform", title: "Platform", type: "string" },
		{ name: "url", title: "URL", type: "url" },
	],
});
