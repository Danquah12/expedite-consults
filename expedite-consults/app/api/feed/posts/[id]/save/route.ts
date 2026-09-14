import { NextRequest, NextResponse } from "next/server";
import { feedStore } from "@/lib/feed-store";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = feedStore.toggleSave(id);

    return NextResponse.json({
      success: true,
      postId: id,
      isSaved: result.isSaved,
      savesCount: result.savesCount,
    });
  } catch (error) {
    console.error("[POST /api/feed/posts/[id]/save]", error);
    return NextResponse.json({ success: false, error: "Failed to save post" }, { status: 500 });
  }
}
