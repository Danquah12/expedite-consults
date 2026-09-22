import * as React from "react";

// ── Shared layout ──────────────────────────────────────────────────────────────

const styles = {
	body: {
		fontFamily: "'Segoe UI', Arial, sans-serif",
		backgroundColor: "#f4f6f9",
		margin: 0,
		padding: "24px",
	} as React.CSSProperties,
	container: {
		maxWidth: "640px",
		margin: "0 auto",
		backgroundColor: "#ffffff",
		borderRadius: "8px",
		overflow: "hidden",
		boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
	} as React.CSSProperties,
	header: {
		backgroundColor: "#030c1d",
		padding: "20px 28px",
		display: "flex" as const,
		alignItems: "center" as const,
		gap: "12px",
	} as React.CSSProperties,
	headerTitle: {
		color: "#43bbd1",
		fontSize: "18px",
		fontWeight: 700,
		margin: 0,
	} as React.CSSProperties,
	headerSub: {
		color: "#8baab5",
		fontSize: "13px",
		margin: 0,
	} as React.CSSProperties,
	body2: {
		padding: "28px",
	} as React.CSSProperties,
	divider: {
		height: "1px",
		backgroundColor: "#e5eaf0",
		margin: "20px 0",
	} as React.CSSProperties,
	label: {
		fontSize: "11px",
		fontWeight: 600,
		color: "#8baab5",
		textTransform: "uppercase" as const,
		letterSpacing: "0.05em",
	} as React.CSSProperties,
	value: {
		fontSize: "14px",
		color: "#1a1a2e",
		marginTop: "2px",
	} as React.CSSProperties,
	chgBadge: {
		display: "inline-block",
		backgroundColor: "#43bbd1",
		color: "#030c1d",
		fontWeight: 700,
		fontSize: "14px",
		padding: "4px 12px",
		borderRadius: "20px",
		marginBottom: "16px",
	} as React.CSSProperties,
	button: {
		display: "inline-block",
		backgroundColor: "#43bbd1",
		color: "#030c1d",
		fontWeight: 700,
		fontSize: "14px",
		padding: "10px 24px",
		borderRadius: "6px",
		textDecoration: "none",
		marginTop: "8px",
	} as React.CSSProperties,
	footer: {
		backgroundColor: "#f4f6f9",
		padding: "16px 28px",
		fontSize: "12px",
		color: "#8baab5",
		textAlign: "center" as const,
	} as React.CSSProperties,
};

function EmailWrapper({ children, chgNumber, subject }: { children: React.ReactNode; chgNumber: string; subject: string }) {
	return (
		<div style={styles.body}>
			<div style={styles.container}>
				<div style={styles.header}>
					<div>
						<p style={styles.headerTitle}>⚙️ IT Change Management</p>
						<p style={styles.headerSub}>{subject}</p>
					</div>
				</div>
				<div style={styles.body2}>
					<span style={styles.chgBadge}>{chgNumber}</span>
					{children}
				</div>
				<div style={styles.footer}>
					<p>IT Change Management &bull; change-management@domain.com</p>
					<p style={{ margin: 0 }}>This is an automated notification from the CR Management System.</p>
				</div>
			</div>
		</div>
	);
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div style={{ marginBottom: "12px" }}>
			<p style={styles.label}>{label}</p>
			<p style={styles.value}>{value}</p>
		</div>
	);
}

// ── 1 & 2: CR Created ─────────────────────────────────────────────────────────

export function CRCreatedManagerEmail({
	chgNumber, shortDescription, requestorName, requestorEmail, category, priority, plannedStart,
}: {
	chgNumber: string; shortDescription: string; requestorName: string;
	requestorEmail: string; category: string; priority: string; plannedStart: string;
}) {
	return (
		<EmailWrapper chgNumber={chgNumber} subject="New Change Request Submitted">
			<p style={{ fontSize: "15px", color: "#1a1a2e", marginTop: 0 }}>
				A new Change Request has been submitted and requires your attention.
			</p>
			<div style={styles.divider} />
			<Row label="Short Description" value={shortDescription} />
			<Row label="Requested By" value={`${requestorName} (${requestorEmail})`} />
			<Row label="Category" value={category} />
			<Row label="Priority" value={priority} />
			<Row label="Planned Start" value={plannedStart} />
			<div style={styles.divider} />
			<p style={{ fontSize: "13px", color: "#555" }}>
				Please review and assign this CR for assessment.
			</p>
		</EmailWrapper>
	);
}

export function CRCreatedRequestorEmail({
	chgNumber, shortDescription, requestorName,
}: { chgNumber: string; shortDescription: string; requestorName: string }) {
	return (
		<EmailWrapper chgNumber={chgNumber} subject="Your Change Request has been submitted">
			<p style={{ fontSize: "15px", color: "#1a1a2e", marginTop: 0 }}>
				Hi {requestorName}, your Change Request has been submitted successfully.
			</p>
			<div style={styles.divider} />
			<Row label="Change #" value={chgNumber} />
			<Row label="Description" value={shortDescription} />
			<Row label="Status" value="New — Pending Assessment" />
			<div style={styles.divider} />
			<p style={{ fontSize: "13px", color: "#555" }}>
				You will receive notifications as your CR progresses through the approval process.
			</p>
		</EmailWrapper>
	);
}

// ── 3: CR Assigned ────────────────────────────────────────────────────────────

export function CRAssignedEmail({
	chgNumber, shortDescription, assignedTo, assignmentGroup,
}: { chgNumber: string; shortDescription: string; assignedTo: string; assignmentGroup: string }) {
	return (
		<EmailWrapper chgNumber={chgNumber} subject="Change Request Assigned to You">
			<p style={{ fontSize: "15px", color: "#1a1a2e", marginTop: 0 }}>
				A Change Request has been assigned to you for assessment.
			</p>
			<div style={styles.divider} />
			<Row label="Change #" value={chgNumber} />
			<Row label="Description" value={shortDescription} />
			<Row label="Assigned To" value={assignedTo} />
			<Row label="Assignment Group" value={assignmentGroup} />
			<div style={styles.divider} />
			<p style={{ fontSize: "13px", color: "#555" }}>
				Please complete the risk assessment and populate the implementation, backout, and test plans.
			</p>
		</EmailWrapper>
	);
}

// ── 4: Info Required ──────────────────────────────────────────────────────────

export function CRInfoRequiredEmail({
	chgNumber, requestorName, comments,
}: { chgNumber: string; requestorName: string; comments: string }) {
	return (
		<EmailWrapper chgNumber={chgNumber} subject="Additional Information Required">
			<p style={{ fontSize: "15px", color: "#1a1a2e", marginTop: 0 }}>
				Hi {requestorName}, additional information is needed for your Change Request.
			</p>
			<div style={styles.divider} />
			<Row label="Change #" value={chgNumber} />
			<Row label="Comments from Change Manager" value={comments} />
			<div style={styles.divider} />
			<p style={{ fontSize: "13px", color: "#555" }}>
				Please update your Change Request with the requested information as soon as possible.
			</p>
		</EmailWrapper>
	);
}

// ── 5: CAB Agenda ─────────────────────────────────────────────────────────────

export function CABAgendaEmail({
	chgNumber, shortDescription, requestorName, changeType, riskScore, plannedStart, cabLink,
}: {
	chgNumber: string; shortDescription: string; requestorName: string;
	changeType: string; riskScore: number; plannedStart: string; cabLink: string;
}) {
	return (
		<EmailWrapper chgNumber={chgNumber} subject="CAB Review Required">
			<p style={{ fontSize: "15px", color: "#1a1a2e", marginTop: 0 }}>
				A Change Request has been submitted for CAB review and requires your decision.
			</p>
			<div style={styles.divider} />
			<Row label="Change #" value={chgNumber} />
			<Row label="Description" value={shortDescription} />
			<Row label="Requested By" value={requestorName} />
			<Row label="Change Type" value={changeType.toUpperCase()} />
			<Row label="Risk Score" value={`${riskScore}/10`} />
			<Row label="Planned Start" value={plannedStart} />
			<div style={styles.divider} />
			<a href={cabLink} style={styles.button}>Review in Portal →</a>
		</EmailWrapper>
	);
}

// ── 6: Approval Request ───────────────────────────────────────────────────────

export function ApprovalRequestEmail({
	chgNumber, shortDescription, requestorName, changeType, riskScore, plannedStart,
	impactDescription, approveLink, rejectLink,
}: {
	chgNumber: string; shortDescription: string; requestorName: string; changeType: string;
	riskScore: number; plannedStart: string; impactDescription: string;
	approveLink: string; rejectLink: string;
}) {
	const riskColor = riskScore >= 7 ? "#dc2626" : riskScore >= 4 ? "#f59e0b" : "#16a34a";
	return (
		<EmailWrapper chgNumber={chgNumber} subject="Action Required: Approve Change Request">
			<div style={{ backgroundColor: "#fff3cd", padding: "12px 16px", borderLeft: "4px solid #ffc107", borderRadius: "4px", marginBottom: "16px" }}>
				<strong>⚠️ This Change Request requires your approval. Please respond promptly.</strong>
			</div>
			<Row label="Change #" value={chgNumber} />
			<Row label="Description" value={shortDescription} />
			<Row label="Requested By" value={requestorName} />
			<Row label="Change Type" value={changeType.toUpperCase()} />
			<Row label="Risk Score" value={<span style={{ color: riskColor, fontWeight: 700 }}>{riskScore}/10</span>} />
			<Row label="Planned Start" value={plannedStart} />
			<Row label="Impact" value={impactDescription} />
			<div style={styles.divider} />
			<div style={{ display: "flex", gap: "12px" }}>
				<a href={approveLink} style={{ ...styles.button, backgroundColor: "#16a34a", color: "#fff" }}>✅ Approve</a>
				<a href={rejectLink} style={{ ...styles.button, backgroundColor: "#dc2626", color: "#fff", marginLeft: "12px" }}>❌ Reject</a>
			</div>
			<p style={{ fontSize: "13px", color: "#555", marginTop: "16px" }}>
				Or reply to this email with "APPROVED" or "REJECTED" followed by any comments.
			</p>
		</EmailWrapper>
	);
}

// ── 7: CR Approved ────────────────────────────────────────────────────────────

export function CRApprovedEmail({
	chgNumber, shortDescription, requestorName, plannedStart, plannedEnd,
}: { chgNumber: string; shortDescription: string; requestorName: string; plannedStart: string; plannedEnd: string }) {
	return (
		<EmailWrapper chgNumber={chgNumber} subject="✅ Change Request Approved — Scheduled for Implementation">
			<div style={{ backgroundColor: "#dcfce7", padding: "12px 16px", borderLeft: "4px solid #16a34a", borderRadius: "4px", marginBottom: "16px" }}>
				<strong>✅ Your Change Request has been approved by the CAB.</strong>
			</div>
			<Row label="Change #" value={chgNumber} />
			<Row label="Description" value={shortDescription} />
			<Row label="Requestor" value={requestorName} />
			<Row label="Approved Start" value={plannedStart} />
			<Row label="Approved End" value={plannedEnd} />
			<div style={styles.divider} />
			<p style={{ fontSize: "13px", color: "#555" }}>
				Maintenance notifications will be sent to affected users 48 and 24 hours before the change window.
			</p>
		</EmailWrapper>
	);
}

// ── 8: CR Rejected ────────────────────────────────────────────────────────────

export function CRRejectedEmail({
	chgNumber, requestorName, rejectionReason,
}: { chgNumber: string; requestorName: string; rejectionReason: string }) {
	return (
		<EmailWrapper chgNumber={chgNumber} subject="❌ Change Request Rejected">
			<div style={{ backgroundColor: "#fee2e2", padding: "12px 16px", borderLeft: "4px solid #dc2626", borderRadius: "4px", marginBottom: "16px" }}>
				<strong>❌ Your Change Request has been rejected by the CAB.</strong>
			</div>
			<p style={{ fontSize: "15px", color: "#1a1a2e", marginTop: 0 }}>Hi {requestorName},</p>
			<Row label="Change #" value={chgNumber} />
			<Row label="Rejection Reason" value={rejectionReason} />
			<div style={styles.divider} />
			<p style={{ fontSize: "13px", color: "#555" }}>
				Please review the feedback, address the concerns, and submit a new Change Request if applicable.
			</p>
		</EmailWrapper>
	);
}

// ── 9: CR Deferred ────────────────────────────────────────────────────────────

export function CRDeferredEmail({
	chgNumber, requestorName, cabComments,
}: { chgNumber: string; requestorName: string; cabComments: string }) {
	return (
		<EmailWrapper chgNumber={chgNumber} subject="⏸️ Change Request Deferred — Additional Information Required">
			<p style={{ fontSize: "15px", color: "#1a1a2e", marginTop: 0 }}>Hi {requestorName},</p>
			<p style={{ fontSize: "14px", color: "#555" }}>
				Your Change Request has been deferred by the CAB pending additional information.
			</p>
			<Row label="Change #" value={chgNumber} />
			<Row label="CAB Comments" value={cabComments} />
			<div style={styles.divider} />
			<p style={{ fontSize: "13px", color: "#555" }}>
				Please update your CR with the requested information. It will be re-presented at the next CAB meeting.
			</p>
		</EmailWrapper>
	);
}

// ── 10 & 11: Maintenance Notice (T-48h / T-24h) ───────────────────────────────

export function MaintenanceNoticeEmail({
	chgNumber, system, date, startTime, endTime, duration, timezone, impact, hoursUntil,
}: {
	chgNumber: string; system: string; date: string; startTime: string; endTime: string;
	duration: string; timezone: string; impact: string; hoursUntil: number;
}) {
	const isReminder = hoursUntil === 24;
	return (
		<EmailWrapper chgNumber={chgNumber} subject={`${isReminder ? "Reminder: " : ""}Scheduled Maintenance — ${date}`}>
			<div style={{ backgroundColor: "#eff6ff", padding: "12px 16px", borderLeft: "4px solid #3b82f6", borderRadius: "4px", marginBottom: "16px" }}>
				<strong>⚙️ {isReminder ? "REMINDER: " : ""}SCHEDULED MAINTENANCE NOTICE</strong>
			</div>
			<p style={{ fontSize: "14px", color: "#555" }}>Dear Colleagues,</p>
			<p style={{ fontSize: "14px", color: "#555" }}>
				Planned maintenance is scheduled for the following system{isReminder ? " (reminder — this is your 24-hour notice)" : ""}:
			</p>
			<div style={styles.divider} />
			<Row label="📋 Change #" value={chgNumber} />
			<Row label="🖥️ System" value={system} />
			<Row label="📅 Date" value={date} />
			<Row label="🕐 Time" value={`${startTime} – ${endTime} ${timezone}`} />
			<Row label="⏱️ Duration" value={duration} />
			<Row label="⚠️ Impact" value={impact} />
			<div style={styles.divider} />
			<p style={{ fontSize: "13px", color: "#555" }}>
				If you experience issues after the maintenance window, please contact the IT Service Desk.
			</p>
		</EmailWrapper>
	);
}

// ── 12: T-1h Alert ────────────────────────────────────────────────────────────

export function MaintenanceStartingSoonEmail({
	chgNumber, system, startTime, assignedTo,
}: { chgNumber: string; system: string; startTime: string; assignedTo: string }) {
	return (
		<EmailWrapper chgNumber={chgNumber} subject="🚨 Maintenance Starting in 1 Hour">
			<div style={{ backgroundColor: "#fef3c7", padding: "12px 16px", borderLeft: "4px solid #f59e0b", borderRadius: "4px", marginBottom: "16px" }}>
				<strong>⏰ Maintenance window begins in approximately 1 hour. Confirm go/no-go status.</strong>
			</div>
			<Row label="Change #" value={chgNumber} />
			<Row label="System" value={system} />
			<Row label="Scheduled Start" value={startTime} />
			<Row label="Implementation Lead" value={assignedTo} />
			<div style={styles.divider} />
			<p style={{ fontSize: "13px", color: "#555" }}>
				Ensure all pre-change checks are complete: backups verified, health checks done, team standing by.
			</p>
		</EmailWrapper>
	);
}

// ── 13: Implementation Started ────────────────────────────────────────────────

export function ImplementationStartedEmail({
	chgNumber, shortDescription, assignedTo, startTime,
}: { chgNumber: string; shortDescription: string; assignedTo: string; startTime: string }) {
	return (
		<EmailWrapper chgNumber={chgNumber} subject="🔧 Implementation Started">
			<div style={{ backgroundColor: "#eff6ff", padding: "12px 16px", borderLeft: "4px solid #3b82f6", borderRadius: "4px", marginBottom: "16px" }}>
				<strong>🔧 Change implementation has started.</strong>
			</div>
			<Row label="Change #" value={chgNumber} />
			<Row label="Description" value={shortDescription} />
			<Row label="Lead Engineer" value={assignedTo} />
			<Row label="Start Time" value={startTime} />
			<div style={styles.divider} />
			<p style={{ fontSize: "13px", color: "#555" }}>
				Monitor the NOC dashboard for live status updates.
			</p>
		</EmailWrapper>
	);
}

// ── 14: Status Update ─────────────────────────────────────────────────────────

export function StatusUpdateEmail({
	chgNumber, status, updatedBy, timestamp,
}: { chgNumber: string; status: string; updatedBy: string; timestamp: string }) {
	return (
		<EmailWrapper chgNumber={chgNumber} subject="📊 Implementation Update">
			<Row label="Change #" value={chgNumber} />
			<Row label="Current Status" value={status} />
			<Row label="Updated By" value={updatedBy} />
			<Row label="Timestamp" value={timestamp} />
		</EmailWrapper>
	);
}

// ── 15: Issue Alert ───────────────────────────────────────────────────────────

export function IssueAlertEmail({
	chgNumber, shortDescription, issue, reportedBy,
}: { chgNumber: string; shortDescription: string; issue: string; reportedBy: string }) {
	return (
		<EmailWrapper chgNumber={chgNumber} subject="⚠️ Implementation Issue Detected">
			<div style={{ backgroundColor: "#fee2e2", padding: "12px 16px", borderLeft: "4px solid #dc2626", borderRadius: "4px", marginBottom: "16px" }}>
				<strong>⚠️ An issue has been detected during implementation. Evaluating options.</strong>
			</div>
			<Row label="Change #" value={chgNumber} />
			<Row label="Description" value={shortDescription} />
			<Row label="Issue" value={issue} />
			<Row label="Reported By" value={reportedBy} />
			<div style={styles.divider} />
			<p style={{ fontSize: "13px", color: "#555" }}>
				Immediate action may be required. Stand by for further updates or rollback notification.
			</p>
		</EmailWrapper>
	);
}

// ── 16: Maintenance Complete ──────────────────────────────────────────────────

export function MaintenanceCompleteEmail({
	chgNumber, system, completionTime,
}: { chgNumber: string; system: string; completionTime: string }) {
	return (
		<EmailWrapper chgNumber={chgNumber} subject="✅ Maintenance Complete — Services Restored">
			<div style={{ backgroundColor: "#dcfce7", padding: "12px 16px", borderLeft: "4px solid #16a34a", borderRadius: "4px", marginBottom: "16px" }}>
				<strong>✅ Maintenance has been completed successfully. All services are restored.</strong>
			</div>
			<Row label="Change #" value={chgNumber} />
			<Row label="System" value={system} />
			<Row label="Completed At" value={completionTime} />
			<div style={styles.divider} />
			<p style={{ fontSize: "13px", color: "#555" }}>
				If you experience any issues, please contact the IT Service Desk immediately.
			</p>
		</EmailWrapper>
	);
}

// ── 17: Rollback Notice ───────────────────────────────────────────────────────

export function RollbackNoticeEmail({
	chgNumber, system, reason, restoredAt,
}: { chgNumber: string; system: string; reason: string; restoredAt: string }) {
	return (
		<EmailWrapper chgNumber={chgNumber} subject="🔙 Change Rolled Back — Services Restored">
			<div style={{ backgroundColor: "#fef3c7", padding: "12px 16px", borderLeft: "4px solid #f59e0b", borderRadius: "4px", marginBottom: "16px" }}>
				<strong>🔙 The change has been rolled back. Services have been restored to the pre-change state.</strong>
			</div>
			<Row label="Change #" value={chgNumber} />
			<Row label="System" value={system} />
			<Row label="Reason for Rollback" value={reason} />
			<Row label="Services Restored At" value={restoredAt} />
			<div style={styles.divider} />
			<p style={{ fontSize: "13px", color: "#555" }}>
				This Change Request will be rescheduled after root cause analysis. A PIR may be scheduled.
			</p>
		</EmailWrapper>
	);
}

// ── 18: CR Closed ─────────────────────────────────────────────────────────────

export function CRClosedEmail({
	chgNumber, requestorName, closeCode, closeNotes,
}: { chgNumber: string; requestorName: string; closeCode: string; closeNotes: string }) {
	const codeColor = closeCode === "successful" ? "#16a34a" : closeCode === "unsuccessful" ? "#dc2626" : "#f59e0b";
	return (
		<EmailWrapper chgNumber={chgNumber} subject="Change Request Closed">
			<p style={{ fontSize: "15px", color: "#1a1a2e", marginTop: 0 }}>Hi {requestorName},</p>
			<p>Your Change Request has been formally closed.</p>
			<Row label="Change #" value={chgNumber} />
			<Row label="Close Code" value={<span style={{ color: codeColor, fontWeight: 700 }}>{closeCode.replace(/_/g, " ").toUpperCase()}</span>} />
			<Row label="Close Notes" value={closeNotes} />
		</EmailWrapper>
	);
}

// ── 19: PIR Invite ────────────────────────────────────────────────────────────

export function PIRInviteEmail({
	chgNumber, pirDate, shortDescription,
}: { chgNumber: string; pirDate: string; shortDescription: string }) {
	return (
		<EmailWrapper chgNumber={chgNumber} subject="Post-Implementation Review Scheduled">
			<p>A Post-Implementation Review (PIR) has been scheduled for this Change Request.</p>
			<Row label="Change #" value={chgNumber} />
			<Row label="Change Description" value={shortDescription} />
			<Row label="PIR Date & Time" value={pirDate} />
			<div style={styles.divider} />
			<p style={{ fontSize: "13px", color: "#555" }}>
				All implementation participants are expected to attend. Please review your work notes prior to the meeting.
			</p>
		</EmailWrapper>
	);
}

// ── 20: Escalation ────────────────────────────────────────────────────────────

export function EscalationEmail({
	chgNumber, level, reason, escalatedBy,
}: { chgNumber: string; level: string; reason: string; escalatedBy: string }) {
	return (
		<EmailWrapper chgNumber={chgNumber} subject={`🚨 Escalation — Level ${level}`}>
			<div style={{ backgroundColor: "#fee2e2", padding: "12px 16px", borderLeft: "4px solid #dc2626", borderRadius: "4px", marginBottom: "16px" }}>
				<strong>🚨 ESCALATION — Level {level} — Immediate attention required.</strong>
			</div>
			<Row label="Change #" value={chgNumber} />
			<Row label="Escalation Level" value={level} />
			<Row label="Reason" value={reason} />
			<Row label="Escalated By" value={escalatedBy} />
		</EmailWrapper>
	);
}
