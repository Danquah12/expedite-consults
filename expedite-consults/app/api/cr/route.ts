import { NextRequest, NextResponse } from "next/server";
import { crReadClient } from "@/sanity/lib/write-client";
import { writeClient } from "@/sanity/lib/write-client";
import { generateChgNumber, calculateRiskScore } from "@/lib/cr-utils";
import { sendCRCreated } from "@/lib/cr-email";

// ── GET /api/cr ── List all CRs ───────────────────────────────────────────────
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const state = searchParams.get("state");
		const changeType = searchParams.get("changeType");
		const category = searchParams.get("category");
		const page = parseInt(searchParams.get("page") ?? "1");
		const limit = parseInt(searchParams.get("limit") ?? "20");
		const offset = (page - 1) * limit;

		let filter = `_type == "changeRequest"`;
		if (state) filter += ` && state == "${state}"`;
		if (changeType) filter += ` && changeType == "${changeType}"`;
		if (category) filter += ` && category == "${category}"`;

		const query = `{
      "total": count(*[${filter}]),
      "items": *[${filter}] | order(_createdAt desc) [${offset}...${offset + limit}] {
        _id,
        chgNumber,
        state,
        changeType,
        category,
        priority,
        riskScore,
        shortDescription,
        requestor,
        assignedTo,
        assignmentGroup,
        plannedStartDate,
        plannedEndDate,
        cabDecision,
        _createdAt,
        _updatedAt
      }
    }`;

		const data = await crReadClient.fetch(query);
		return NextResponse.json(data);
	} catch (e) {
		console.error("[GET /api/cr]", e);
		return NextResponse.json({ error: "Failed to fetch CRs" }, { status: 500 });
	}
}

// ── POST /api/cr ── Create a new CR ─────────────────────────────────────────
export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		// Validate required fields
		if (!body.shortDescription || !body.requestor?.email) {
			return NextResponse.json(
				{ error: "shortDescription and requestor.email are required" },
				{ status: 400 }
			);
		}

		// Auto-generate CHG number
		const chgNumber = await generateChgNumber();

		// Auto-calculate risk score if assessment provided
		let riskScore = body.riskScore ?? 1;
		let changeType = body.changeType ?? "standard";

		if (body.riskAssessment) {
			const { impact, downtime, complexity, reversibility } = body.riskAssessment;
			if (impact && downtime && complexity && reversibility) {
				const calc = calculateRiskScore(impact, downtime, complexity, reversibility);
				riskScore = calc.score;
				changeType = calc.changeType;
			}
		}

		// Build the Sanity document
		const crDoc = {
			_type: "changeRequest",
			chgNumber,
			state: "new",
			changeType,
			category: body.category ?? "servers",
			priority: body.priority ?? "medium",
			riskScore,
			shortDescription: body.shortDescription,
			description: body.description ?? "",
			justification: body.justification ?? "",
			implementationPlan: body.implementationPlan ?? "",
			backoutPlan: body.backoutPlan ?? "",
			testPlan: body.testPlan ?? "",
			configurationItem: body.configurationItem ?? "",
			assignmentGroup: body.assignmentGroup ?? "",
			assignedTo: body.assignedTo ?? "",
			requestor: body.requestor,
			affectedUsers: body.affectedUsers ?? "none",
			affectedUserDetails: body.affectedUserDetails ?? "",
			impactDescription: body.impactDescription ?? "",
			plannedStartDate: body.plannedStartDate ?? null,
			plannedEndDate: body.plannedEndDate ?? null,
			riskAssessment: body.riskAssessment ?? null,
			cabDecision: "pending",
			approvals: [],
			workNotes: [
				{
					_key: `system-${Date.now()}`,
					author: "System",
					authorEmail: "system",
					note: `Change Request ${chgNumber} created. State set to New.`,
					timestamp: new Date().toISOString(),
					type: "system_event",
				},
			],
			notificationsSent: [],
			pirRequired: false,
		};

		const created = await writeClient.create(crDoc);

		// Fire emails #1 and #2
		await sendCRCreated({
			chgNumber,
			shortDescription: body.shortDescription,
			requestorName: body.requestor.name,
			requestorEmail: body.requestor.email,
			category: body.category ?? "servers",
			priority: body.priority ?? "medium",
			plannedStart: body.plannedStartDate
				? new Date(body.plannedStartDate).toLocaleString()
				: "TBD",
		});

		return NextResponse.json({ success: true, chgNumber, id: created._id }, { status: 201 });
	} catch (e) {
		console.error("[POST /api/cr]", e);
		return NextResponse.json({ error: "Failed to create CR" }, { status: 500 });
	}
}
