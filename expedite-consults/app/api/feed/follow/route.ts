import { NextRequest, NextResponse } from "next/server";
import { feedStore } from "@/lib/feed-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 });
    }

    const isFollowed = feedStore.toggleFollow(username);

    return NextResponse.json({
      success: true,
      username,
      isFollowed,
    });
  } catch (error) {
    console.error("[POST /api/feed/follow]", error);
    return NextResponse.json({ success: false, error: "Failed to update follow state" }, { status: 500 });
  }
}
