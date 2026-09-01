import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generalRatelimit } from "@/lib/redis";
import { z } from "zod";

const createStorySchema = z.object({
  mediaUrl: z.string().url(),
  mediaType: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  caption: z.string().max(200).optional(),
});

const profileSelect = {
  username: true,
  displayName: true,
  avatar: true,
  bio: true,
  isVerified: true,
  profileVisibility: true,
} as const;

// GET /api/stories — get active stories grouped by user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const now = new Date();

    // Get list of users followed by current user + current user
    const following = await db.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });
    const userIds = [currentUserId, ...following.map((f) => f.followingId)];

    // Fetch active stories (expiresAt > now)
    const rawStories = await db.story.findMany({
      where: {
        authorId: { in: userIds },
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: {
            id: true,
            role: true,
            profile: { select: profileSelect },
          },
        },
        views: {
          where: { viewerId: currentUserId },
          select: { id: true },
        },
        _count: {
          select: { views: true },
        },
      },
    });

    // Group stories by author
    const groupsMap = new Map<string, {
      author: any;
      stories: any[];
      allViewed: boolean;
      latestCreatedAt: Date;
    }>();

    for (const story of rawStories) {
      const authorId = story.authorId;
      const hasViewed = story.views.length > 0;

      if (!groupsMap.has(authorId)) {
        groupsMap.set(authorId, {
          author: story.author,
          stories: [],
          allViewed: true,
          latestCreatedAt: story.createdAt,
        });
      }

      const group = groupsMap.get(authorId)!;
      group.stories.push({
        id: story.id,
        authorId: story.authorId,
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType,
        caption: story.caption,
        expiresAt: story.expiresAt,
        createdAt: story.createdAt,
        hasViewed,
        viewsCount: story._count.views,
      });

      if (!hasViewed) {
        group.allViewed = false;
      }
      if (story.createdAt > group.latestCreatedAt) {
        group.latestCreatedAt = story.createdAt;
      }
    }

    // Convert map to array: current user first, then unviewed stories, then viewed
    const storyGroups = Array.from(groupsMap.values()).sort((a, b) => {
      if (a.author.id === currentUserId) return -1;
      if (b.author.id === currentUserId) return 1;
      if (!a.allViewed && b.allViewed) return -1;
      if (a.allViewed && !b.allViewed) return 1;
      return b.latestCreatedAt.getTime() - a.latestCreatedAt.getTime();
    });

    return NextResponse.json({ success: true, data: storyGroups });
  } catch (error) {
    console.error("[GET /api/stories]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/stories — create a 24h story
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { success: allowed } = await generalRatelimit.limit(session.user.id);
    if (!allowed) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = createStorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { mediaUrl, mediaType, caption } = parsed.data;

    // 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = await db.story.create({
      data: {
        authorId: session.user.id,
        mediaUrl,
        mediaType,
        caption,
        expiresAt,
      },
      include: {
        author: {
          select: {
            id: true,
            role: true,
            profile: { select: profileSelect },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: story }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/stories]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
