import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/stories/[id]/view — record view for story
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: storyId } = await params;
    const viewerId = session.user.id;

    // Idempotent record
    await db.storyView.upsert({
      where: {
        storyId_viewerId: { storyId, viewerId },
      },
      create: {
        storyId,
        viewerId,
      },
      update: {
        viewedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: { viewed: true } });
  } catch (error) {
    console.error("[POST /api/stories/[id]/view]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
