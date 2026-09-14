import { NextRequest, NextResponse } from "next/server";
import { feedStore } from "@/lib/feed-store";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const posts = feedStore.getPosts();
    const post = posts.find((p) => p.id === id);

    return NextResponse.json({
      success: true,
      comments: post?.commentsList || [],
      count: post?.commentsCount || 0,
    });
  } catch (error) {
    console.error("[GET /api/feed/posts/[id]/comments]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { text, user = "Kwesi Asiedu", username = "kwesi" } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ success: false, error: "Comment text required" }, { status: 400 });
    }

    const newComment = feedStore.addComment(id, text, user, username);

    if (!newComment) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      comment: newComment,
    }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/feed/posts/[id]/comments]", error);
    return NextResponse.json({ success: false, error: "Failed to add comment" }, { status: 500 });
  }
}
