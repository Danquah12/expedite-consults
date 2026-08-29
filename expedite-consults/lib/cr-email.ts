"use server";

import React from "react";


import { Resend } from "resend";
import {
	CRCreatedManagerEmail,
	CRCreatedRequestorEmail,
	CRAssignedEmail,
	CRInfoRequiredEmail,
	CABAgendaEmail,
	ApprovalRequestEmail,
	CRApprovedEmail,
	CRRejectedEmail,
	CRDeferredEmail,
	MaintenanceNoticeEmail,
	MaintenanceStartingSoonEmail,
	ImplementationStartedEmail,
	StatusUpdateEmail,
	IssueAlertEmail,
	MaintenanceCompleteEmail,
	RollbackNoticeEmail,
	CRClosedEmail,
	PIRInviteEmail,
	EscalationEmail,
} from "@/components/cr/email-templates/cr-templates";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = `IT Change Management <${process.env.RESEND_FORM_EMAIL ?? "onboarding@resend.dev"}>`;
const CHANGE_MANAGER_EMAIL = process.env.CR_MANAGER_EMAIL ?? "sanity.expediteconsults@gmail.com";

async function sendEmail(to: string | string[], subject: string, react: React.ReactElement) {
	try {
		const { error } = await resend.emails.send({ from: FROM, to: Array.isArray(to) ? to : [to], subject, react });
		if (error) throw error;
		return { success: true };
	} catch (e) {
		console.error("[CR Email Error]", e);
		return { success: false, error: e };
	}
}

// ── #1 & #2 ── CR Created ────────────────────────────────────────────────────

export async function sendCRCreated(params: {
	chgNumber: string;
	shortDescription: string;
	requestorName: string;
	requestorEmail: string;
	category: string;
	priority: string;
	plannedStart: string;
}) {
	await Promise.all([
		// #1 — to Change Manager
		sendEmail(
			CHANGE_MANAGER_EMAIL,
			`New Change Request: ${params.chgNumber}`,
			CRCreatedManagerEmail(params) as any
		),
		// #2 — to Requestor
		sendEmail(
			params.requestorEmail,
			`Your CR has been submitted: ${params.chgNumber}`,
			CRCreatedRequestorEmail(params) as any
		),
	]);
}

// ── #3 ── CR Assigned ────────────────────────────────────────────────────────

export async function sendCRAssigned(params: {
	chgNumber: string;
	shortDescription: string;
	assignedTo: string;
	assignedToEmail: string;
	assignmentGroup: string;
}) {
	return sendEmail(
		params.assignedToEmail,
		`CR ${params.chgNumber} assigned to you`,
		CRAssignedEmail(params) as any
	);
}

// ── #4 ── Info Required ──────────────────────────────────────────────────────

export async function sendInfoRequired(params: {
	chgNumber: string;
	requestorName: string;
	requestorEmail: string;
	comments: string;
}) {
	return sendEmail(
		params.requestorEmail,
		`CR ${params.chgNumber} — Additional information required`,
		CRInfoRequiredEmail(params) as any
	);
}

// ── #5 ── CAB Agenda ─────────────────────────────────────────────────────────

export async function sendCABAgenda(params: {
	chgNumber: string;
	shortDescription: string;
	requestorName: string;
	changeType: string;
	riskScore: number;
	plannedStart: string;
	cabLink: string;
	cabEmails: string[];
}) {
	return sendEmail(
		params.cabEmails,
		`CAB Review: CR ${params.chgNumber} requires approval`,
		CABAgendaEmail(params) as any
	);
}

// ── #6 ── Approval Request ───────────────────────────────────────────────────

export async function sendApprovalRequest(params: {
	chgNumber: string;
	shortDescription: string;
	requestorName: string;
	changeType: string;
	riskScore: number;
	plannedStart: string;
	impactDescription: string;
	approveLink: string;
	rejectLink: string;
	approverEmails: string[];
}) {
	return sendEmail(
		params.approverEmails,
		`[Action Required] Approve Change Request ${params.chgNumber}`,
		ApprovalRequestEmail(params) as any
	);
}

// ── #7 ── CR Approved ────────────────────────────────────────────────────────

export async function sendCRApproved(params: {
	chgNumber: string;
	shortDescription: string;
	requestorName: string;
	requestorEmail: string;
	plannedStart: string;
	plannedEnd: string;
	stakeholderEmails?: string[];
}) {
	const to = [params.requestorEmail, ...(params.stakeholderEmails ?? [])];
	return sendEmail(
		to,
		`✅ CR ${params.chgNumber} Approved — Scheduled for Implementation`,
		CRApprovedEmail(params) as any
	);
}

// ── #8 ── CR Rejected ────────────────────────────────────────────────────────

export async function sendCRRejected(params: {
	chgNumber: string;
	requestorName: string;
	requestorEmail: string;
	rejectionReason: string;
}) {
	return sendEmail(
		params.requestorEmail,
		`❌ CR ${params.chgNumber} Rejected`,
		CRRejectedEmail(params) as any
	);
}

// ── #9 ── CR Deferred ────────────────────────────────────────────────────────

export async function sendCRDeferred(params: {
	chgNumber: string;
	requestorName: string;
	requestorEmail: string;
	cabComments: string;
}) {
	return sendEmail(
		params.requestorEmail,
		`⏸️ CR ${params.chgNumber} Deferred — Additional information required`,
		CRDeferredEmail(params) as any
	);
}

// ── #10 & #11 ── Maintenance Notice (T-48h / T-24h) ─────────────────────────

export async function sendMaintenanceNotice(params: {
	chgNumber: string;
	system: string;
	date: string;
	startTime: string;
	endTime: string;
	duration: string;
	timezone: string;
	impact: string;
	hoursUntil: 48 | 24;
	recipientEmails: string[];
}) {
	const label = params.hoursUntil === 48 ? "48-Hour" : "24-Hour";
	return sendEmail(
		params.recipientEmails,
		`[Scheduled Maintenance] ${params.system} — ${params.date} (${label} Notice)`,
		MaintenanceNoticeEmail(params) as any
	);
}

// ── #12 ── T-1h Alert ────────────────────────────────────────────────────────

export async function sendMaintenanceStartingSoon(params: {
	chgNumber: string;
	system: string;
	startTime: string;
	assignedTo: string;
	itTeamEmails: string[];
}) {
	return sendEmail(
		params.itTeamEmails,
		`Maintenance Starting Soon — ${params.chgNumber}`,
		MaintenanceStartingSoonEmail(params) as any
	);
}

// ── #13 ── Implementation Started ───────────────────────────────────────────

export async function sendImplementationStarted(params: {
	chgNumber: string;
	shortDescription: string;
	assignedTo: string;
	startTime: string;
	nocEmails: string[];
}) {
	return sendEmail(
		params.nocEmails,
		`Implementation Started: ${params.chgNumber}`,
		ImplementationStartedEmail(params) as any
	);
}

// ── #14 ── Status Update ─────────────────────────────────────────────────────

export async function sendStatusUpdate(params: {
	chgNumber: string;
	status: string;
	updatedBy: string;
	timestamp: string;
	recipientEmails: string[];
}) {
	return sendEmail(
		params.recipientEmails,
		`Implementation Update: ${params.chgNumber}`,
		StatusUpdateEmail(params) as any
	);
}

// ── #15 ── Issue Alert ───────────────────────────────────────────────────────

export async function sendIssueAlert(params: {
	chgNumber: string;
	shortDescription: string;
	issue: string;
	reportedBy: string;
	managerEmails: string[];
}) {
	return sendEmail(
		[CHANGE_MANAGER_EMAIL, ...params.managerEmails],
		`⚠️ Implementation Issue: ${params.chgNumber}`,
		IssueAlertEmail(params) as any
	);
}

// ── #16 ── Maintenance Complete ──────────────────────────────────────────────

export async function sendMaintenanceComplete(params: {
	chgNumber: string;
	system: string;
	completionTime: string;
	recipientEmails: string[];
}) {
	return sendEmail(
		params.recipientEmails,
		`✅ Maintenance Complete — Services Restored: ${params.chgNumber}`,
		MaintenanceCompleteEmail(params) as any
	);
}

// ── #17 ── Rollback Notice ───────────────────────────────────────────────────

export async function sendRollbackNotice(params: {
	chgNumber: string;
	system: string;
	reason: string;
	restoredAt: string;
	recipientEmails: string[];
}) {
	return sendEmail(
		params.recipientEmails,
		`🔙 Change Rolled Back: ${params.chgNumber}`,
		RollbackNoticeEmail(params) as any
	);
}

// ── #18 ── CR Closed ─────────────────────────────────────────────────────────

export async function sendCRClosed(params: {
	chgNumber: string;
	requestorName: string;
	requestorEmail: string;
	closeCode: string;
	closeNotes: string;
}) {
	return sendEmail(
		params.requestorEmail,
		`CR ${params.chgNumber} Closed`,
		CRClosedEmail(params) as any
	);
}

// ── #19 ── PIR Invite ────────────────────────────────────────────────────────

export async function sendPIRInvite(params: {
	chgNumber: string;
	pirDate: string;
	shortDescription: string;
	participantEmails: string[];
}) {
	return sendEmail(
		params.participantEmails,
		`PIR Meeting: ${params.chgNumber} — ${params.pirDate}`,
		PIRInviteEmail(params) as any
	);
}

// ── #20 ── Escalation ────────────────────────────────────────────────────────

export async function sendEscalation(params: {
	chgNumber: string;
	level: string;
	reason: string;
	escalatedBy: string;
	escalationEmails: string[];
}) {
	return sendEmail(
		[CHANGE_MANAGER_EMAIL, ...params.escalationEmails],
		`🚨 Escalation: ${params.chgNumber} — Level ${params.level}`,
		EscalationEmail(params) as any
	);
}
