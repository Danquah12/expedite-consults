import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getOrCreateDefaultUser } from "@/lib/db-seed";
import { feedStore } from "@/lib/feed-store";
import { emitDomainEvent } from "@/lib/events";

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
      const post = await db.post.findUnique({
        where: { id },
        select: { id: true, authorId: true, type: true },
      }).catch(() => null);

      const existingReaction = await db.reaction.findFirst({
        where: { userId, postId: id, type: "LIKE" },
      }).catch(() => null);

      let isLiked = false;
      if (existingReaction) {
        await db.reaction.delete({ where: { id: existingReaction.id } }).catch(() => {});
        isLiked = false;
        await emitDomainEvent("POST_UNLIKED", userId, {
          contentId: id,
          contentType: "POST",
          targetAuthorId: post?.authorId,
        });
      } else {
        await db.reaction.create({
          data: { userId, postId: id, type: "LIKE" },
        }).catch(() => {});
        isLiked = true;
        await emitDomainEvent("POST_LIKED", userId, {
          contentId: id,
          contentType: "POST",
          targetAuthorId: post?.authorId,
        });
      }

      const count = await db.reaction.count({
        where: { postId: id, type: "LIKE" },
      }).catch(() => (isLiked ? 1 : 0));

      feedStore.toggleLike(id);

      return NextResponse.json({
        success: true,
        postId: id,
        isLiked,
        likes: count,
      });
    }

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
