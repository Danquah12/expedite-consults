import { NextRequest, NextResponse } from "next/server";
import { crReadClient } from "@/sanity/lib/write-client";

/** GET /api/cr/[chg]/votes — returns all approval votes for a CR */
export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ chg: string }> }
) {
	const { chg } = await params;
	const votes = await crReadClient.fetch(
		`*[_type == "crApproval" && chgNumber == $chg] | order(createdAt asc) {
      _id, approverName, approverEmail,
      decision, comments, votedAt, expiresAt, createdAt
    }`,
		{ chg }
	);
	return NextResponse.json(votes ?? []);
}
