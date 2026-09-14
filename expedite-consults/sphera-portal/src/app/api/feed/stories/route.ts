import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getOrCreateDefaultUser } from "@/lib/db-seed";
import { feedStore, StoryItem } from "@/lib/feed-store";
import { MediaType } from "@/generated/client";

export const dynamic = "force-dynamic";

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export async function GET() {
  try {
    const storiesFromDb = await db.story.findMany({
      where: { expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      include: { author: { include: { profile: true } } },
    }).catch(() => []);

    if (storiesFromDb.length > 0) {
      const stories: StoryItem[] = storiesFromDb.map((s) => ({
        id: s.id,
        username: s.author.profile?.username || "user",
        displayName: s.author.profile?.displayName || "Sphera User",
        avatar: s.author.profile?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
        mediaUrl: s.mediaUrl,
        mediaType: s.mediaType === MediaType.VIDEO ? "video" : "image",
        caption: s.caption || undefined,
        timeAgo: formatTimeAgo(s.createdAt),
      }));

      return NextResponse.json({ success: true, stories });
    }

    const stories = feedStore.getStories();
    return NextResponse.json({ success: true, stories });
  } catch (error) {
    console.error("[GET /api/feed/stories]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      mediaUrl,
      mediaType = "image",
      caption,
      username = "kwesi",
      displayName = "Kwesi Asiedu",
      avatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    } = body;

    if (!mediaUrl) {
      return NextResponse.json({ success: false, error: "Story mediaUrl is required" }, { status: 400 });
    }

    let user: any = null;
    try {
      const session = await auth();
      if (session?.user?.id) {
        user = await db.user.findUnique({
          where: { id: session.user.id },
          include: { profile: true },
        });
      }
    } catch {}

    if (!user) {
      user = await getOrCreateDefaultUser(username || "kwesi");
    }

    if (user?.id) {
      const created = await db.story.create({
        data: {
          authorId: user.id,
          mediaUrl,
          mediaType: mediaType === "video" ? MediaType.VIDEO : MediaType.IMAGE,
          caption: caption || undefined,
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
        },
        include: { author: { include: { profile: true } } },
      });

      const mappedStory: StoryItem = {
        id: created.id,
        username: created.author.profile?.username || username,
        displayName: created.author.profile?.displayName || displayName,
        avatar: created.author.profile?.avatar || avatar,
        mediaUrl: created.mediaUrl,
        mediaType: created.mediaType === MediaType.VIDEO ? "video" : "image",
        caption: created.caption || undefined,
        timeAgo: "Just now",
        isUser: true,
      };

      feedStore.addStory(mappedStory);

      return NextResponse.json({ success: true, story: mappedStory }, { status: 201 });
    }

    const story = feedStore.addStory({
      username,
      displayName,
      avatar,
      mediaUrl,
      mediaType,
      caption,
      isUser: true,
    });

    return NextResponse.json({ success: true, story }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/feed/stories]", error);
    return NextResponse.json({ success: false, error: "Failed to create story" }, { status: 500 });
  }
}
