import { defineField, defineType } from "sanity";

/**
 * Stores one approval token per CAB member per CR.
 * Lives in the dedicated CR Sanity project (tmo23gzo).
 */
export const crApprovalType = defineType({
	name: "crApproval",
	title: "CR Approval",
	type: "document",
	fields: [
		defineField({ name: "chgNumber",      type: "string",   title: "CHG Number" }),
		defineField({ name: "approverName",   type: "string",   title: "Approver Name" }),
		defineField({ name: "approverEmail",  type: "string",   title: "Approver Email" }),
		defineField({ name: "token",          type: "string",   title: "Vote Token (UUID)" }),
		defineField({
			name: "decision",
			type: "string",
			title: "Decision",
			options: {
				list: [
					{ title: "Pending",  value: "pending" },
					{ title: "Approved", value: "approved" },
					{ title: "Rejected", value: "rejected" },
					{ title: "Deferred", value: "deferred" },
				],
			},
			initialValue: "pending",
		}),
		defineField({ name: "comments",  type: "text",     title: "Approver Comments" }),
		defineField({ name: "createdAt", type: "datetime", title: "Sent At" }),
		defineField({ name: "expiresAt", type: "datetime", title: "Expires At" }),
		defineField({ name: "votedAt",   type: "datetime", title: "Voted At" }),
	],
	preview: {
		select: { title: "chgNumber", subtitle: "approverEmail", decision: "decision" },
		prepare({ title, subtitle, decision }: any) {
			const icon = decision === "approved" ? "✅" : decision === "rejected" ? "❌" : decision === "deferred" ? "⏸️" : "⏳";
			return { title: `${title} — ${subtitle}`, subtitle: `${icon} ${decision}` };
		},
	},
});
