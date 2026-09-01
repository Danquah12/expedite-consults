import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { pusherServer, pusherChannels, pusherEvents } from "@/lib/pusher";
import { generalRatelimit } from "@/lib/redis";

// POST /api/posts/[id]/like — toggle like (Reaction with type LIKE)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: postId } = await params;

    const { success: allowed } = await generalRatelimit.limit(session.user.id!);
    if (!allowed) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }

    const post = await db.post.findUnique({
      where: { id: postId, deletedAt: null },
      select: { id: true, authorId: true },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    const existingReaction = await db.reaction.findUnique({
      where: { userId_postId: { userId: session.user.id!, postId } },
    });

    let liked: boolean;

    if (existingReaction) {
      await db.reaction.delete({
        where: { userId_postId: { userId: session.user.id!, postId } },
      });
      liked = false;
    } else {
      await db.reaction.create({
        data: { userId: session.user.id!, postId, type: "LIKE" },
      });
      liked = true;

      if (post.authorId !== session.user.id) {
        await db.notification.create({
          data: {
            userId: post.authorId,
            type: "POST_LIKE",
            actorId: session.user.id!,
            entityId: postId,
            entityType: "post",
            message: "liked your post",
          },
        });

        await pusherServer
          .trigger(
            pusherChannels.userNotifications(post.authorId),
            pusherEvents.newNotification,
            { type: "POST_LIKE", actorId: session.user.id, entityId: postId }
          )
          .catch(() => {});
      }
    }

    const count = await db.reaction.count({ where: { postId, type: "LIKE" } });

    return NextResponse.json({ success: true, data: { liked, count } });
  } catch (error) {
    console.error("[POST /api/posts/[id]/like]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
