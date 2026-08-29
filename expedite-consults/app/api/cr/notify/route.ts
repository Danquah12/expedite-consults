import { NextRequest, NextResponse } from "next/server";
import {
	sendMaintenanceNotice,
	sendMaintenanceStartingSoon,
	sendStatusUpdate,
	sendEscalation,
	sendApprovalRequest,
	sendCABAgenda,
} from "@/lib/cr-email";

/**
 * POST /api/cr/notify
 * Central notification trigger endpoint.
 * Body: { type, chgNumber, ...payload }
 */
export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { type, chgNumber, ...payload } = body;

		if (!type || !chgNumber) {
			return NextResponse.json({ error: "type and chgNumber are required" }, { status: 400 });
		}

		let result;

		switch (type) {
			// #5 — CAB Agenda
			case "cab_agenda":
				result = await sendCABAgenda({ chgNumber, ...payload });
				break;

			// #6 — Approval Request
			case "approval_request":
				result = await sendApprovalRequest({ chgNumber, ...payload });
				break;

			// #10 — T-48h Notice
			case "maintenance_48h":
				result = await sendMaintenanceNotice({ chgNumber, hoursUntil: 48, ...payload });
				break;

			// #11 — T-24h Reminder
			case "maintenance_24h":
				result = await sendMaintenanceNotice({ chgNumber, hoursUntil: 24, ...payload });
				break;

			// #12 — T-1h Alert
			case "maintenance_1h":
				result = await sendMaintenanceStartingSoon({ chgNumber, ...payload });
				break;

			// #14 — Status Update
			case "status_update":
				result = await sendStatusUpdate({ chgNumber, ...payload });
				break;

			// #20 — Escalation
			case "escalation":
				result = await sendEscalation({ chgNumber, ...payload });
				break;

			default:
				return NextResponse.json({ error: `Unknown notification type: ${type}` }, { status: 400 });
		}

		return NextResponse.json({ success: true, type, chgNumber, result });
	} catch (e) {
		console.error("[POST /api/cr/notify]", e);
		return NextResponse.json({ error: "Notification failed" }, { status: 500 });
	}
}
