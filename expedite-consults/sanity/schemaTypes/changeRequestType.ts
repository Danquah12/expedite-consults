import { defineField, defineType } from "sanity";

export const changeRequestType = defineType({
	name: "changeRequest",
	title: "Change Request",
	type: "document",
	fields: [
		// ── Identity ──────────────────────────────────────────────────────────
		defineField({
			name: "chgNumber",
			title: "CHG Number",
			type: "string",
			readOnly: true,
			description: "Auto-generated (e.g. CHG0000001)",
		}),
		defineField({
			name: "state",
			title: "State",
			type: "string",
			options: {
				list: [
					{ title: "New", value: "new" },
					{ title: "Assess", value: "assess" },
					{ title: "Plan", value: "plan" },
					{ title: "Approve", value: "approve" },
					{ title: "Scheduled", value: "scheduled" },
					{ title: "Implement", value: "implement" },
					{ title: "Review", value: "review" },
					{ title: "Closed", value: "closed" },
				],
			},
			initialValue: "new",
		}),

		// ── Classification ────────────────────────────────────────────────────
		defineField({
			name: "changeType",
			title: "Change Type",
			type: "string",
			options: {
				list: [
					{ title: "Standard", value: "standard" },
					{ title: "Normal", value: "normal" },
					{ title: "Emergency", value: "emergency" },
				],
			},
		}),
		defineField({
			name: "category",
			title: "Category",
			type: "string",
			options: {
				list: [
					{ title: "Servers & Infrastructure", value: "servers" },
					{ title: "Network & Firewalls", value: "network" },
					{ title: "Applications & Databases", value: "applications" },
					{ title: "Cloud & Virtualization", value: "cloud" },
					{ title: "Security & Compliance", value: "security" },
					{ title: "End-User Systems", value: "end-user" },
					{ title: "Email & Collaboration", value: "email" },
					{ title: "Integrations", value: "integrations" },
				],
			},
		}),
		defineField({
			name: "priority",
			title: "Priority",
			type: "string",
			options: {
				list: [
					{ title: "Low", value: "low" },
					{ title: "Medium", value: "medium" },
					{ title: "High", value: "high" },
					{ title: "Critical", value: "critical" },
				],
			},
			initialValue: "medium",
		}),
		defineField({
			name: "riskScore",
			title: "Risk Score (1-10)",
			type: "number",
			description: "Auto-calculated from impact, complexity, and reversibility",
		}),

		// ── Description ───────────────────────────────────────────────────────
		defineField({
			name: "shortDescription",
			title: "Short Description",
			type: "string",
			validation: (rule) => rule.required().max(200),
		}),
		defineField({
			name: "description",
			title: "Description",
			type: "text",
			rows: 4,
		}),
		defineField({
			name: "justification",
			title: "Justification",
			type: "text",
			rows: 4,
		}),

		// ── Plans ─────────────────────────────────────────────────────────────
		defineField({
			name: "implementationPlan",
			title: "Implementation Plan",
			type: "text",
			rows: 6,
		}),
		defineField({
			name: "backoutPlan",
			title: "Backout Plan",
			type: "text",
			rows: 4,
		}),
		defineField({
			name: "testPlan",
			title: "Test Plan",
			type: "text",
			rows: 4,
		}),

		// ── Assignment ────────────────────────────────────────────────────────
		defineField({
			name: "configurationItem",
			title: "Configuration Item (CMDB)",
			type: "string",
		}),
		defineField({
			name: "assignmentGroup",
			title: "Assignment Group",
			type: "string",
		}),
		defineField({
			name: "assignedTo",
			title: "Assigned To",
			type: "string",
		}),

		// ── Requestor ─────────────────────────────────────────────────────────
		defineField({
			name: "requestor",
			title: "Requestor",
			type: "object",
			fields: [
				defineField({ name: "name", title: "Name", type: "string" }),
				defineField({ name: "email", title: "Email", type: "string" }),
				defineField({ name: "department", title: "Department", type: "string" }),
			],
		}),

		// ── Affected Users ────────────────────────────────────────────────────
		defineField({
			name: "affectedUsers",
			title: "Affected Users Scope",
			type: "string",
			options: {
				list: [
					{ title: "All Users", value: "all" },
					{ title: "Department Only", value: "department" },
					{ title: "Specific Group", value: "group" },
					{ title: "No User Impact", value: "none" },
				],
			},
		}),
		defineField({
			name: "affectedUserDetails",
			title: "Affected User / Group Details",
			type: "string",
			description: "Department name, group name, or specific user list",
		}),
		defineField({
			name: "impactDescription",
			title: "Impact Description",
			type: "text",
			rows: 3,
			description: "What users will experience during the change",
		}),

		// ── Schedule ──────────────────────────────────────────────────────────
		defineField({
			name: "plannedStartDate",
			title: "Planned Start Date",
			type: "datetime",
		}),
		defineField({
			name: "plannedEndDate",
			title: "Planned End Date",
			type: "datetime",
		}),
		defineField({
			name: "actualStartDate",
			title: "Actual Start Date",
			type: "datetime",
		}),
		defineField({
			name: "actualEndDate",
			title: "Actual End Date",
			type: "datetime",
		}),

		// ── Risk Assessment ───────────────────────────────────────────────────
		defineField({
			name: "riskAssessment",
			title: "Risk Assessment",
			type: "object",
			fields: [
				defineField({
					name: "impact",
					title: "Impact (1-5)",
					type: "number",
					description: "1 = Minimal, 5 = Service-wide outage",
				}),
				defineField({
					name: "downtime",
					title: "Downtime (1-5)",
					type: "number",
					description: "1 = No downtime, 5 = Extended outage",
				}),
				defineField({
					name: "complexity",
					title: "Complexity (1-5)",
					type: "number",
					description: "1 = Simple, 5 = Highly complex",
				}),
				defineField({
					name: "reversibility",
					title: "Reversibility (1-5)",
					type: "number",
					description: "1 = Easily reversible, 5 = Irreversible",
				}),
			],
		}),

		// ── CAB / Approvals ───────────────────────────────────────────────────
		defineField({
			name: "cabDecision",
			title: "CAB Decision",
			type: "string",
			options: {
				list: [
					{ title: "Pending", value: "pending" },
					{ title: "Approved", value: "approved" },
					{ title: "Rejected", value: "rejected" },
					{ title: "Deferred", value: "deferred" },
				],
			},
			initialValue: "pending",
		}),
		defineField({
			name: "cabComments",
			title: "CAB Comments",
			type: "text",
			rows: 3,
		}),
		defineField({
			name: "approvals",
			title: "Approvals",
			type: "array",
			of: [
				{
					type: "object",
					fields: [
						defineField({ name: "approverName", type: "string", title: "Approver Name" }),
						defineField({ name: "approverEmail", type: "string", title: "Approver Email" }),
						defineField({
							name: "decision",
							type: "string",
							title: "Decision",
							options: {
								list: [
									{ title: "Approved", value: "approved" },
									{ title: "Rejected", value: "rejected" },
									{ title: "Deferred", value: "deferred" },
								],
							},
						}),
						defineField({ name: "comments", type: "text", title: "Comments" }),
						defineField({ name: "timestamp", type: "datetime", title: "Timestamp" }),
					],
				},
			],
		}),

		// ── Closure ───────────────────────────────────────────────────────────
		defineField({
			name: "closeCode",
			title: "Close Code",
			type: "string",
			options: {
				list: [
					{ title: "Successful", value: "successful" },
					{ title: "Successful with Issues", value: "successful_with_issues" },
					{ title: "Unsuccessful", value: "unsuccessful" },
				],
			},
		}),
		defineField({
			name: "closeNotes",
			title: "Close Notes",
			type: "text",
			rows: 4,
		}),
		defineField({
			name: "pirRequired",
			title: "PIR Required?",
			type: "boolean",
			initialValue: false,
		}),
		defineField({
			name: "pirDate",
			title: "PIR Date",
			type: "datetime",
		}),

		// ── Work Notes ────────────────────────────────────────────────────────
		defineField({
			name: "workNotes",
			title: "Work Notes",
			type: "array",
			of: [
				{
					type: "object",
					fields: [
						defineField({ name: "author", type: "string", title: "Author" }),
						defineField({ name: "authorEmail", type: "string", title: "Author Email" }),
						defineField({ name: "note", type: "text", title: "Note" }),
						defineField({ name: "timestamp", type: "datetime", title: "Timestamp" }),
						defineField({
							name: "type",
							type: "string",
							title: "Note Type",
							options: {
								list: [
									{ title: "Work Note", value: "work_note" },
									{ title: "Status Update", value: "status_update" },
									{ title: "Issue Alert", value: "issue_alert" },
									{ title: "System Event", value: "system_event" },
								],
							},
							initialValue: "work_note",
						}),
					],
				},
			],
		}),

		// ── Notifications Sent ────────────────────────────────────────────────
		defineField({
			name: "notificationsSent",
			title: "Notifications Sent",
			type: "array",
			of: [
				{
					type: "object",
					fields: [
						defineField({ name: "notificationId", type: "number", title: "Notification #" }),
						defineField({ name: "subject", type: "string", title: "Subject" }),
						defineField({ name: "sentAt", type: "datetime", title: "Sent At" }),
						defineField({ name: "recipients", type: "string", title: "Recipients" }),
					],
				},
			],
		}),

		// ── Related Records ───────────────────────────────────────────────────
		defineField({
			name: "relatedIncidents",
			title: "Related Incidents",
			type: "array",
			of: [{ type: "string" }],
		}),
		defineField({
			name: "relatedProblems",
			title: "Related Problems",
			type: "array",
			of: [{ type: "string" }],
		}),
	],

	preview: {
		select: {
			title: "chgNumber",
			subtitle: "shortDescription",
			state: "state",
		},
		prepare({ title, subtitle, state }) {
			return {
				title: title || "Draft CR",
				subtitle: `[${state?.toUpperCase() ?? "NEW"}] ${subtitle ?? ""}`,
			};
		},
	},
});
