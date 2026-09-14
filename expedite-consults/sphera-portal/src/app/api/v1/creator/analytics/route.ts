import { NextRequest, NextResponse } from "next/server";
import { getCreatorAnalytics } from "@/lib/events/handlers/creator-analytics-handler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get("creatorId") || "kwesi";
  const stats = getCreatorAnalytics(creatorId);

  return NextResponse.json({
    success: true,
    creatorId,
    stats,
  });
}
