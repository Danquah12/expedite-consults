import { NextRequest, NextResponse } from "next/server";
import { emitDomainEvent } from "@/lib/events";
import { getInteractionRecords } from "@/lib/events/handlers/telemetry-handler";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId = "kwesi",
      contentId,
      contentType = "REEL",
      interactionType = "VIEW",
      durationMs = 0,
      completionRate = 0,
      metadata = {},
    } = body;

    if (!contentId) {
      return NextResponse.json({ success: false, error: "contentId is required" }, { status: 400 });
    }

    let eventType: any = "CONTENT_VIEWED";
    if (interactionType === "COMPLETE" || completionRate >= 0.9) eventType = "REEL_COMPLETED";
    else if (interactionType === "WATCH") eventType = "REEL_WATCHED";
    else if (interactionType === "NOT_INTERESTED") eventType = "CONTENT_NOT_INTERESTED";

    await emitDomainEvent(eventType, userId, {
      contentId,
      contentType,
      metadata: { durationMs, completionRate, ...metadata },
    });

    return NextResponse.json({
      success: true,
      status: "ingested",
      contentId,
      interactionType,
    });
  } catch (error) {
    console.error("[POST /api/v1/interactions]", error);
    return NextResponse.json({ success: false, error: "Failed to record telemetry" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || undefined;
  const records = getInteractionRecords(userId);

  return NextResponse.json({
    success: true,
    count: records.length,
    interactions: records.slice(0, 50),
  });
}
