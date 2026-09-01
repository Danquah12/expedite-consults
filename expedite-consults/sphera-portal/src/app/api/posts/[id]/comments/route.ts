import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generalRatelimit } from "@/lib/redis";
import { z } from "zod";

const addCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().optional(),
});

const commentInclude = {
  author: {
    select: {
      id: true,
      role: true,
      profile: {
        select: {
          username: true,
          displayName: true,
          avatar: true,
          isVerified: true,
          profileVisibility: true,
        },
      },
    },
  },
  _count: { select: { replies: true, reactions: true } },
} as const;

// GET /api/posts/[id]/comments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: postId } = await params;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

    const comments = await db.comment.findMany({
      where: { postId, parentId: null, deletedAt: null },
      orderBy: { createdAt: "asc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: commentInclude,
    });

    const hasMore = comments.length > limit;
    const page = hasMore ? comments.slice(0, -1) : comments;
    const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

    return NextResponse.json({
      success: true,
      data: { comments: page, nextCursor, hasMore },
    });
  } catch (error) {
    console.error("[GET /api/posts/[id]/comments]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/posts/[id]/comments
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

    const body = await req.json();
    const parsed = addCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const post = await db.post.findUnique({
      where: { id: postId, deletedAt: null },
      select: { id: true, authorId: true },
    });
    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    const comment = await db.comment.create({
      data: {
        authorId: session.user.id!,
        postId,
        content: parsed.data.content,
        parentId: parsed.data.parentId,
      },
      include: commentInclude,
    });

    if (post.authorId !== session.user.id) {
      await db.notification.create({
        data: {
          userId: post.authorId,
          type: "POST_COMMENT",
          actorId: session.user.id!,
          entityId: postId,
          entityType: "post",
          message: `commented: "${parsed.data.content.slice(0, 80)}"`,
        },
      });
    }

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/posts/[id]/comments]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
