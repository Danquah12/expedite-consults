import { NextRequest, NextResponse } from "next/server";
import { crReadClient, writeClient } from "@/sanity/lib/write-client";
import {
	sendCRAssigned,
	sendCRApproved,
	sendCRRejected,
	sendCRDeferred,
	sendCRClosed,
	sendPIRInvite,
	sendImplementationStarted,
	sendMaintenanceComplete,
	sendRollbackNotice,
	sendIssueAlert,
} from "@/lib/cr-email";

// ── GET /api/cr/[chg] ── Fetch single CR ─────────────────────────────────────
export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ chg: string }> }
) {
	try {
		const { chg } = await params;
		const cr = await crReadClient.fetch(
			`*[_type == "changeRequest" && chgNumber == $chg][0]`,
			{ chg }
		);

		if (!cr) {
			return NextResponse.json({ error: "CR not found" }, { status: 404 });
		}

		return NextResponse.json(cr);
	} catch (e) {
		console.error("[GET /api/cr/[chg]]", e);
		return NextResponse.json({ error: "Failed to fetch CR" }, { status: 500 });
	}
}

// ── PATCH /api/cr/[chg] ── Update CR (state, assignment, notes, closure) ─────
export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ chg: string }> }
) {
	try {
		const { chg } = await params;
		const body = await req.json();

		// Find the CR document
		const cr = await crReadClient.fetch(
			`*[_type == "changeRequest" && chgNumber == $chg][0]{ _id, state, requestor, shortDescription, assignedTo, assignmentGroup, plannedStartDate, plannedEndDate }`,
			{ chg }
		);

		if (!cr) {
			return NextResponse.json({ error: "CR not found" }, { status: 404 });
		}

		const patch = writeClient.patch(cr._id);
		const updates: Record<string, unknown> = {};

		// ── State transition ────────────────────────────────────────────────────
		if (body.state && body.state !== cr.state) {
			updates.state = body.state;

			// Append system work note on state change
			const stateNote = {
				_key: `state-${Date.now()}`,
				author: body.updatedBy ?? "System",
				authorEmail: body.updatedByEmail ?? "system",
				note: `State changed from ${cr.state.toUpperCase()} to ${body.state.toUpperCase()}.`,
				timestamp: new Date().toISOString(),
				type: "system_event",
			};
			patch.append("workNotes", [stateNote]);

			// ── Email triggers on state changes ─────────────────────────────────
			if (body.state === "implement" && body.assignedTo) {
				await sendImplementationStarted({
					chgNumber: chg,
					shortDescription: cr.shortDescription,
					assignedTo: body.assignedTo ?? cr.assignedTo,
					startTime: new Date().toLocaleString(),
					nocEmails: body.nocEmails ?? [],
				});
			}

			if (body.state === "closed" && body.closeCode) {
				await sendCRClosed({
					chgNumber: chg,
					requestorName: cr.requestor?.name ?? "Requestor",
					requestorEmail: cr.requestor?.email ?? "",
					closeCode: body.closeCode,
					closeNotes: body.closeNotes ?? "",
				});

				if (body.pirRequired && body.pirDate) {
					await sendPIRInvite({
						chgNumber: chg,
						pirDate: new Date(body.pirDate).toLocaleString(),
						shortDescription: cr.shortDescription,
						participantEmails: body.participantEmails ?? [cr.requestor?.email],
					});
				}
			}
		}

		// ── Assignment ──────────────────────────────────────────────────────────
		if (body.assignedTo && body.assignedTo !== cr.assignedTo) {
			updates.assignedTo = body.assignedTo;
			if (body.assignedToEmail) {
				await sendCRAssigned({
					chgNumber: chg,
					shortDescription: cr.shortDescription,
					assignedTo: body.assignedTo,
					assignedToEmail: body.assignedToEmail,
					assignmentGroup: body.assignmentGroup ?? cr.assignmentGroup,
				});
			}
		}

		// ── CAB Decision ────────────────────────────────────────────────────────
		if (body.cabDecision) {
			updates.cabDecision = body.cabDecision;
			if (body.cabComments) updates.cabComments = body.cabComments;

			const plannedStart = cr.plannedStartDate
				? new Date(cr.plannedStartDate).toLocaleString()
				: "TBD";
			const plannedEnd = cr.plannedEndDate
				? new Date(cr.plannedEndDate).toLocaleString()
				: "TBD";

			if (body.cabDecision === "approved") {
				updates.state = "scheduled";
				await sendCRApproved({
					chgNumber: chg,
					shortDescription: cr.shortDescription,
					requestorName: cr.requestor?.name ?? "",
					requestorEmail: cr.requestor?.email ?? "",
					plannedStart,
					plannedEnd,
					stakeholderEmails: body.stakeholderEmails ?? [],
				});
			} else if (body.cabDecision === "rejected") {
				updates.state = "closed";
				updates.closeCode = "unsuccessful";
				await sendCRRejected({
					chgNumber: chg,
					requestorName: cr.requestor?.name ?? "",
					requestorEmail: cr.requestor?.email ?? "",
					rejectionReason: body.cabComments ?? "No reason provided",
				});
			} else if (body.cabDecision === "deferred") {
				updates.state = "assess";
				await sendCRDeferred({
					chgNumber: chg,
					requestorName: cr.requestor?.name ?? "",
					requestorEmail: cr.requestor?.email ?? "",
					cabComments: body.cabComments ?? "",
				});
			}
		}

		// ── Maintenance Complete / Rollback ─────────────────────────────────────
		if (body.outcome === "success") {
			await sendMaintenanceComplete({
				chgNumber: chg,
				system: body.system ?? cr.shortDescription,
				completionTime: new Date().toLocaleString(),
				recipientEmails: body.recipientEmails ?? [],
			});
		}

		if (body.outcome === "rollback") {
			await sendRollbackNotice({
				chgNumber: chg,
				system: body.system ?? cr.shortDescription,
				reason: body.rollbackReason ?? "Implementation failed",
				restoredAt: new Date().toLocaleString(),
				recipientEmails: body.recipientEmails ?? [],
			});
		}

		// ── Issue alert ─────────────────────────────────────────────────────────
		if (body.issueAlert) {
			await sendIssueAlert({
				chgNumber: chg,
				shortDescription: cr.shortDescription,
				issue: body.issueAlert,
				reportedBy: body.updatedBy ?? "Team",
				managerEmails: body.managerEmails ?? [],
			});
		}

		// ── Work note appended directly ─────────────────────────────────────────
		if (body.workNote) {
			const note = {
				_key: `note-${Date.now()}`,
				author: body.updatedBy ?? "Unknown",
				authorEmail: body.updatedByEmail ?? "",
				note: body.workNote,
				timestamp: new Date().toISOString(),
				type: body.noteType ?? "work_note",
			};
			patch.append("workNotes", [note]);
		}

		// ── Scalar field updates ────────────────────────────────────────────────
		const scalarFields = [
			"assignmentGroup", "configurationItem", "implementationPlan",
			"backoutPlan", "testPlan", "closeCode", "closeNotes",
			"pirRequired", "pirDate", "actualStartDate", "actualEndDate",
		];
		for (const field of scalarFields) {
			if (body[field] !== undefined) updates[field] = body[field];
		}

		await patch.set(updates).commit();

		return NextResponse.json({ success: true, chgNumber: chg });
	} catch (e) {
		console.error("[PATCH /api/cr/[chg]]", e);
		return NextResponse.json({ error: "Failed to update CR" }, { status: 500 });
	}
}
