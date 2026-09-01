import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { postRatelimit } from "@/lib/redis";
import { z } from "zod";

const createReelSchema = z.object({
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.number().int().min(1).default(15),
  caption: z.string().max(2200).optional(),
  music: z.string().max(100).optional(),
  hashtags: z.array(z.string()).optional().default([]),
  muxAssetId: z.string().optional(),
  muxPlaybackId: z.string().optional(),
});

const authorSelect = {
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
  _count: {
    select: {
      followers: true,
    },
  },
} as const;

// GET /api/reels — get paginated vertical video feed
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "foryou"; // foryou | following | trending
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 20);

    let whereClause: any = { isReel: true, status: "ready" };

    if (type === "following" && currentUserId) {
      const following = await db.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
      });
      const followingIds = following.map((f) => f.followingId);
      whereClause.authorId = { in: followingIds };
    }

    const orderBy: any =
      type === "trending"
        ? [{ views: "desc" }, { likes: "desc" }]
        : [{ createdAt: "desc" }];

    const reels = await db.video.findMany({
      where: whereClause,
      orderBy,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        author: { select: authorSelect },
      },
    });

    const hasMore = reels.length > limit;
    const page = hasMore ? reels.slice(0, -1) : reels;
    const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

    // Enrich with follow status and reaction counts
    let enriched = page.map((reel) => ({
      ...reel,
      isLiked: false,
      isSaved: false,
      isFollowing: false,
    }));

    if (currentUserId) {
      const authorIds = page.map((r) => r.authorId);
      const follows = await db.follow.findMany({
        where: {
          followerId: currentUserId,
          followingId: { in: authorIds },
        },
        select: { followingId: true },
      });
      const followingSet = new Set(follows.map((f) => f.followingId));

      enriched = page.map((reel) => ({
        ...reel,
        isLiked: false,
        isSaved: false,
        isFollowing: followingSet.has(reel.authorId),
      }));
    }

    return NextResponse.json({
      success: true,
      data: { reels: enriched, nextCursor, hasMore },
    });
  } catch (error) {
    console.error("[GET /api/reels]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/reels — create a new Reel
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { success: allowed } = await postRatelimit.limit(session.user.id);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "You're posting too fast. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = createReelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      url,
      thumbnailUrl,
      duration,
      caption,
      music,
      hashtags,
      muxAssetId,
      muxPlaybackId,
    } = parsed.data;

    const reel = await db.video.create({
      data: {
        authorId: session.user.id,
        url,
        thumbnailUrl:
          thumbnailUrl ||
          (muxPlaybackId ? `https://image.mux.com/${muxPlaybackId}/thumbnail.jpg` : null),
        duration,
        caption,
        music,
        hashtags,
        isReel: true,
        muxAssetId,
        muxPlaybackId,
        status: muxAssetId ? "processing" : "ready",
      },
      include: {
        author: { select: authorSelect },
      },
    });

    return NextResponse.json({ success: true, data: reel }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/reels]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
