import { NextRequest, NextResponse } from "next/server";
import { feedStore } from "@/lib/feed-store";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = feedStore.toggleLike(id);

    return NextResponse.json({
      success: true,
      postId: id,
      isLiked: result.isLiked,
      likes: result.likes,
    });
  } catch (error) {
    console.error("[POST /api/feed/posts/[id]/like]", error);
    return NextResponse.json({ success: false, error: "Failed to like post" }, { status: 500 });
  }
}
