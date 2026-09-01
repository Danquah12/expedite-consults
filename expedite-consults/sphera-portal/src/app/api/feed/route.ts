import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generalRatelimit } from "@/lib/redis";

// GET /api/feed — personalized home feed
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "home";
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

    const userId = session.user.id!;

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

    // ── Following feed ──────────────────────────────────────────────────
    if (type === "following") {
      const follows = await db.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      const followingIds = follows.map((f) => f.followingId);

      const posts = await db.post.findMany({
        where: {
          authorId: { in: [...followingIds, userId] },
          deletedAt: null,
          visibility: { in: ["PUBLIC", "FRIENDS"] },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: postInclude,
      });

      return paginatedResponse(posts, limit, userId);
    }

    // ── Trending feed ───────────────────────────────────────────────────
    if (type === "trending") {
      const posts = await db.post.findMany({
        where: {
          deletedAt: null,
          visibility: "PUBLIC",
          createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: postInclude,
      });

      return paginatedResponse(posts, limit, userId);
    }

    // ── Home feed ───────────────────────────────────────────────────────
    const follows = await db.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = follows.map((f) => f.followingId);

    const posts = await db.post.findMany({
      where: {
        OR: [
          {
            authorId: { in: [...followingIds, userId] },
            visibility: { in: ["PUBLIC", "FRIENDS"] },
          },
          { visibility: "PUBLIC", createdAt: { gte: new Date(Date.now() - 72 * 60 * 60 * 1000) } },
        ],
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: postInclude,
    });

    return paginatedResponse(posts, limit, userId);
  } catch (error) {
    console.error("[GET /api/feed]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

async function paginatedResponse(posts: any[], limit: number, userId: string) {
  const hasMore = posts.length > limit;
  const page = hasMore ? posts.slice(0, -1) : posts;
  const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

  const postIds = page.map((p: any) => p.id);
  const [reactions, saves] = await Promise.all([
    db.reaction.findMany({
      where: { userId, postId: { in: postIds }, type: "LIKE" },
      select: { postId: true },
    }),
    db.save.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    }),
  ]);

  const likedIds = new Set(reactions.map((r) => r.postId));
  const savedIds = new Set(saves.map((s) => s.postId));

  const enriched = page.map((p: any) => ({
    ...p,
    isLiked: likedIds.has(p.id),
    isSaved: savedIds.has(p.id),
  }));

  return NextResponse.json({
    success: true,
    data: { posts: enriched, nextCursor, hasMore },
  });
}
