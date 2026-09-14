import { NextRequest, NextResponse } from "next/server";
import { getUserAlgorithmControls, saveUserAlgorithmControls } from "@/lib/recommendations/engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "kwesi";
  const preferences = getUserAlgorithmControls(userId);

  return NextResponse.json({ success: true, userId, preferences });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = "kwesi", topicSliders, mutedTopics, mutedCreators, engagementThreshold } = body;

    const updated = saveUserAlgorithmControls(userId, {
      topicSliders,
      mutedTopics,
      mutedCreators,
      engagementThreshold,
    });

    return NextResponse.json({
      success: true,
      message: "Algorithm preference vector saved successfully",
      preferences: updated,
    });
  } catch (error) {
    console.error("[POST /api/v1/recommendations/preferences]", error);
    return NextResponse.json({ success: false, error: "Failed to save preferences" }, { status: 500 });
  }
}
