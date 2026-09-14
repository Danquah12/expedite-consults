import { NextRequest, NextResponse } from "next/server";
import { fileReport } from "@/lib/moderation";
import { ReportReason } from "@/generated/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      reporterId = "kwesi",
      targetId,
      targetType = "POST",
      reason = "MISINFORMATION",
      details,
    } = body;

    if (!targetId) {
      return NextResponse.json({ success: false, error: "targetId is required" }, { status: 400 });
    }

    const modCase = await fileReport({
      reporterId,
      targetId,
      targetType,
      reason: reason as ReportReason,
      details,
    });

    return NextResponse.json({
      success: true,
      case: modCase,
      message: "Report filed and queued for automated AI screening.",
    });
  } catch (error) {
    console.error("[POST /api/v1/moderation/report]", error);
    return NextResponse.json({ success: false, error: "Failed to file report" }, { status: 500 });
  }
}
