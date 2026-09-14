import { NextRequest, NextResponse } from "next/server";
import { feedStore } from "@/lib/feed-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const liveStreams = feedStore.getLiveStreams();
    return NextResponse.json({ success: true, liveStreams });
  } catch (error) {
    console.error("[GET /api/feed/live]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch live streams" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      category = "General",
      streamUrl,
      name = "Kwesi Asiedu",
      username = "kwesi",
      avatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "Broadcast title is required" }, { status: 400 });
    }

    const live = feedStore.startLiveStream({
      name,
      username,
      avatar,
      title,
      category,
      streamUrl,
    });

    return NextResponse.json({ success: true, liveStream: live }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/feed/live]", error);
    return NextResponse.json({ success: false, error: "Failed to start live stream" }, { status: 500 });
  }
}
