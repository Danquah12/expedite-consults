import { NextRequest, NextResponse } from "next/server";
import { feedStore } from "@/lib/server-feed-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = (searchParams.get("mode") as "FYP" | "FOLLOWING" | "LIVE") || "FYP";
    const posts = feedStore.getPosts(mode);
    const stories = feedStore.getStories();
    const liveStreams = feedStore.getLiveStreams();

    return NextResponse.json({
      success: true,
      mode,
      posts,
      stories,
      liveStreams,
    });
  } catch (error) {
    console.error("[GET /api/feed]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch feed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      content,
      type = "immersive_video",
      videoUrl,
      imageUrl,
      musicTitle,
      musicAuthor,
      hashtags = [],
      authorName = "Kwesi Asiedu",
      authorUsername = "kwesi",
      authorAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      isThread,
      threadIndex,
      threadTotal,
      threadReplies,
      communityNote,
      bounty,
      article,
    } = body;

    if (!content && !videoUrl && !imageUrl) {
      return NextResponse.json({ success: false, error: "Content or media required" }, { status: 400 });
    }

    const newPost = feedStore.addPost({
      id,
      type,
      author: {
        id: `user-${authorUsername}`,
        name: authorName,
        username: authorUsername,
        avatarUrl: authorAvatar,
        verified: true,
        timeAgo: "Just now",
        privacy: "Public",
        isFollowed: true,
      },
      content: content || "",
      videoUrl,
      imageUrl: imageUrl || videoUrl,
      musicTitle,
      musicAuthor,
      hashtags,
      isThread,
      threadIndex,
      threadTotal,
      threadReplies,
      communityNote,
      bounty,
      article,
    });

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/feed]", error);
    return NextResponse.json({ success: false, error: "Failed to publish post" }, { status: 500 });
  }
}
