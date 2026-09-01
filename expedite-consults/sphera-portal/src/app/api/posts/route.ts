import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { postRatelimit } from "@/lib/redis";
import { z } from "zod";

const createPostSchema = z.object({
  content: z.string().max(2200).optional(),
  type: z.enum(["TEXT", "PHOTO", "VIDEO", "REEL"]).default("TEXT"),
  visibility: z.enum(["PUBLIC", "FRIENDS", "PRIVATE"]).default("PUBLIC"),
  mediaUrls: z.array(z.string().url()).optional().default([]),
  hashtags: z.array(z.string()).optional().default([]),
});

const postInclude = {
  author: {
    select: {
      id: true,
      role: true,
      profile: {
        select: {
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          isVerified: true,
          profileVisibility: true,
        },
      },
    },
  },
  _count: { select: { reactions: true, comments: true, saves: true } },
} as const;

// GET /api/posts — list posts
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const authorId = searchParams.get("authorId");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "12"), 50);

    const posts = await db.post.findMany({
      where: {
        ...(authorId ? { authorId } : {}),
        deletedAt: null,
        OR: [
          { visibility: "PUBLIC" },
          { authorId: session.user.id! },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: postInclude,
    });

    const hasMore = posts.length > limit;
    const page = hasMore ? posts.slice(0, -1) : posts;
    const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

    // Enrich with isLiked / isSaved
    const postIds = page.map((p) => p.id);
    const [reactions, saves] = await Promise.all([
      db.reaction.findMany({
        where: { userId: session.user.id!, postId: { in: postIds }, type: "LIKE" },
        select: { postId: true },
      }),
      db.save.findMany({
        where: { userId: session.user.id!, postId: { in: postIds } },
        select: { postId: true },
      }),
    ]);

    const likedIds = new Set(reactions.map((r) => r.postId));
    const savedIds = new Set(saves.map((s) => s.postId));

    const enriched = page.map((p) => ({
      ...p,
      isLiked: likedIds.has(p.id),
      isSaved: savedIds.has(p.id),
    }));

    return NextResponse.json({
      success: true,
      data: { posts: enriched, nextCursor, hasMore },
    });
  } catch (error) {
    console.error("[GET /api/posts]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/posts — create a post
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { success: allowed } = await postRatelimit.limit(session.user.id!);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "You're posting too fast. Slow down a bit." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { content, type, visibility, mediaUrls, hashtags } = parsed.data;

    if (!content && mediaUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: "A post must have content or media" },
        { status: 400 }
      );
    }

    const post = await db.$transaction(async (tx) => {
      const newPost = await tx.post.create({
        data: {
          authorId: session.user!.id!,
          type,
          content,
          visibility,
          mediaUrls,
        },
        include: postInclude,
      });

      // Upsert hashtags
      for (const tag of hashtags) {
        const normalized = tag.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!normalized) continue;
        const ht = await tx.hashtag.upsert({
          where: { name: normalized },
          update: {},
          create: { name: normalized },
        });
        await tx.postHashtag.create({
          data: { postId: newPost.id, hashtagId: ht.id },
        });
      }

      return newPost;
    });

    return NextResponse.json(
      { success: true, data: { ...post, isLiked: false, isSaved: false } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/posts]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
