import { NextRequest, NextResponse } from "next/server";
import { feedStore } from "@/lib/feed-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stories = feedStore.getStories();
    return NextResponse.json({ success: true, stories });
  } catch (error) {
    console.error("[GET /api/feed/stories]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      mediaUrl,
      mediaType = "image",
      caption,
      username = "kwesi",
      displayName = "Kwesi Asiedu",
      avatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    } = body;

    if (!mediaUrl) {
      return NextResponse.json({ success: false, error: "Story mediaUrl is required" }, { status: 400 });
    }

    const story = feedStore.addStory({
      username,
      displayName,
      avatar,
      mediaUrl,
      mediaType,
      caption,
      isUser: true,
    });

    return NextResponse.json({ success: true, story }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/feed/stories]", error);
    return NextResponse.json({ success: false, error: "Failed to create story" }, { status: 500 });
  }
}
