import { NextRequest, NextResponse } from "next/server";
import { writeClient, crReadClient } from "@/sanity/lib/write-client";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { token, decision, comments } = body as {
			token: string;
			decision: "approved" | "rejected" | "deferred";
			comments?: string;
		};

		if (!token || !decision) {
			return NextResponse.json({ error: "Token and decision required" }, { status: 400 });
		}
		if (!["approved", "rejected", "deferred"].includes(decision)) {
			return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
		}

		// Find the approval document by token
		const approval = await crReadClient.fetch(
			`*[_type == "crApproval" && token == $token][0]`,
			{ token }
		);

		if (!approval) {
			return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
		}

		// Check expiry
		if (new Date(approval.expiresAt) < new Date()) {
			return NextResponse.json({ error: "This approval link has expired" }, { status: 410 });
		}

		// Check if already voted
		if (approval.decision !== "pending") {
			return NextResponse.json({
				error: `You already voted: ${approval.decision}`,
				decision: approval.decision,
				alreadyVoted: true,
			}, { status: 409 });
		}

		// Record the vote
		await writeClient
			.patch(approval._id)
			.set({
				decision,
				comments: comments ?? "",
				votedAt: new Date().toISOString(),
			})
			.commit();

		// Add work note to the CR
		const cr = await crReadClient.fetch(
			`*[_type == "changeRequest" && chgNumber == $chg][0]{ _id }`,
			{ chg: approval.chgNumber }
		);

		if (cr?._id) {
			const icon = decision === "approved" ? "✅" : decision === "rejected" ? "❌" : "⏸️";
			await writeClient
				.patch(cr._id)
				.append("workNotes", [{
					_key: `vote-${Date.now()}`,
					author: approval.approverName,
					authorEmail: approval.approverEmail,
					note: `${icon} CAB Vote: **${decision.toUpperCase()}**${comments ? ` — "${comments}"` : ""}`,
					timestamp: new Date().toISOString(),
					type: "status_update",
				}])
				.commit();
		}

		return NextResponse.json({
			success: true,
			decision,
			approverName: approval.approverName,
			chgNumber: approval.chgNumber,
		});
	} catch (e) {
		console.error("[POST /api/cr/vote]", e);
		return NextResponse.json({ error: String(e) }, { status: 500 });
	}
}

// GET — fetch vote status by token (used by the review page)
export async function GET(req: NextRequest) {
	const token = req.nextUrl.searchParams.get("token");
	if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

	const approval = await crReadClient.fetch(
		`*[_type == "crApproval" && token == $token][0]{
      _id, chgNumber, approverName, approverEmail,
      decision, comments, votedAt, expiresAt
    }`,
		{ token }
	);

	if (!approval) return NextResponse.json({ error: "Invalid token" }, { status: 404 });
	return NextResponse.json(approval);
}
