import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getOrCreateDefaultUser } from "@/lib/db-seed";
import { feedStore } from "@/lib/feed-store";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    let userId: string | null = null;
    try {
      const session = await auth();
      if (session?.user?.id) userId = session.user.id;
    } catch {}

    if (!userId) {
      const defaultUser = await getOrCreateDefaultUser("kwesi");
      if (defaultUser) userId = defaultUser.id;
    }

    if (userId) {
      const existingSave = await db.save.findFirst({
        where: { userId, postId: id },
      }).catch(() => null);

      let isSaved = false;
      if (existingSave) {
        await db.save.delete({ where: { id: existingSave.id } }).catch(() => {});
        isSaved = false;
      } else {
        await db.save.create({
          data: { userId, postId: id },
        }).catch(() => {});
        isSaved = true;
      }

      const count = await db.save.count({
        where: { postId: id },
      }).catch(() => (isSaved ? 1 : 0));

      feedStore.toggleSave(id);

      return NextResponse.json({
        success: true,
        postId: id,
        isSaved,
        savesCount: count,
      });
    }

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
