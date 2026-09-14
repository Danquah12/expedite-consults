import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { seedDatabaseIfNeeded, getOrCreateDefaultUser } from "@/lib/db-seed";
import { feedStore, FeedPost, StoryItem, LiveStreamItem } from "@/lib/feed-store";
import { rankFeedPostsForUser } from "@/lib/recommendations/engine";
import { emitDomainEvent } from "@/lib/events";
import { PostType, Visibility } from "@/generated/client";

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = (searchParams.get("mode") as string) || "for_you";

    await seedDatabaseIfNeeded().catch(() => {});

    let currentUserId: string = "kwesi";
    try {
      const session = await auth();
      if (session?.user?.id) currentUserId = session.user.id;
    } catch {}

    const defaultUser = await getOrCreateDefaultUser("kwesi").catch(() => null);
    if (defaultUser && currentUserId === "kwesi") currentUserId = defaultUser.id;

    // Fetch from PostgreSQL
    const postsFromDb = await db.post.findMany({
      where: { deletedAt: null, threadParentId: null },
      orderBy: { createdAt: "desc" },
      include: {
        author: { include: { profile: true } },
        reactions: true,
        saves: true,
        shares: true,
        comments: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          include: { author: { include: { profile: true } } },
        },
        communityNotes: { orderBy: { helpfulCount: "desc" }, take: 1 },
        threadReplies: {
          where: { deletedAt: null },
          orderBy: { threadIndex: "asc" },
          include: { author: { include: { profile: true } } },
        },
      },
    }).catch(() => []);

    let rawPosts: FeedPost[] = [];

    if (postsFromDb.length > 0) {
      rawPosts = postsFromDb.map((p) => {
        const isLiked = p.reactions.some((r) => r.userId === currentUserId && r.type === "LIKE");
        const isSaved = p.saves.some((s) => s.userId === currentUserId);
        const meta = (p.linkMeta as any) || {};

        let postType: FeedPost["type"] = "standard";
        if (p.type === PostType.REEL || p.type === PostType.VIDEO) postType = "immersive_video";
        else if (p.type === PostType.THREAD || p.isThread) postType = "pulse_thread";
        else if (p.type === PostType.ARTICLE) postType = "article";
        else if (p.type === PostType.BOUNTY) postType = "bounty";
        else if (p.type === PostType.POLL) postType = "poll";

        return {
          id: p.id,
          type: postType,
          streamCategory: p.visibility === Visibility.FRIENDS ? "friends" : p.isThread ? "pulse" : "for_you",
          author: {
            id: p.author.id,
            name: p.author.profile?.displayName || "Sphera User",
            username: p.author.profile?.username || "user",
            avatarUrl: p.author.profile?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
            verified: p.author.profile?.isVerified ?? true,
            timeAgo: formatTimeAgo(p.createdAt),
            privacy: p.visibility === Visibility.FRIENDS ? "Friends" : "Public",
            isFollowed: true,
            isFriend: p.visibility === Visibility.FRIENDS,
          },
          content: p.content || "",
          imageUrl: p.mediaUrls?.[0] || undefined,
          videoUrl: (p.type === PostType.VIDEO || p.type === PostType.REEL || p.mediaUrls?.[0]?.includes("video") || p.mediaUrls?.[0]?.includes("blob") || p.mediaUrls?.[0]?.startsWith("data:video"))
            ? p.mediaUrls?.[0]
            : undefined,
          musicTitle: meta.musicTitle || undefined,
          musicAuthor: meta.musicAuthor || undefined,
          likes: p.reactions.filter((r) => r.type === "LIKE").length,
          commentsCount: p.comments.length,
          sharesCount: p.shares.length,
          repostsCount: 0,
          viewsCount: Math.max(1, p.reactions.length * 15 + 32),
          savesCount: p.saves.length,
          isLiked,
          isSaved,
          isThread: p.isThread,
          threadIndex: p.threadIndex || undefined,
          threadTotal: p.threadTotal || undefined,
          threadReplies: p.threadReplies?.map((r) => ({
            id: r.id,
            content: r.content || "",
            mediaUrl: r.mediaUrls?.[0],
            author: {
              id: r.author.id,
              name: r.author.profile?.displayName || "Sphera User",
              username: r.author.profile?.username || "user",
              avatarUrl: r.author.profile?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
              verified: r.author.profile?.isVerified ?? true,
              timeAgo: formatTimeAgo(r.createdAt),
            },
          })),
          communityNote: p.communityNotes?.[0]
            ? {
                content: p.communityNotes[0].content,
                sources: p.communityNotes[0].sources,
                helpfulCount: p.communityNotes[0].helpfulCount,
              }
            : undefined,
          bounty: p.type === PostType.BOUNTY && meta.title ? meta : undefined,
          article: p.type === PostType.ARTICLE && meta.title ? meta : undefined,
          commentsList: p.comments.map((c) => ({
            id: c.id,
            user: c.author.profile?.displayName || "Sphera User",
            username: c.author.profile?.username || "user",
            avatar: c.author.profile?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
            text: c.content,
            time: formatTimeAgo(c.createdAt),
            likes: 0,
          })),
          createdAt: p.createdAt.toISOString(),
        };
      });
    } else {
      rawPosts = feedStore.getPosts(mode);
    }

    // Apply Universal Recommendation Engine re-ranking
    const { posts: rankedPosts, explanations } = rankFeedPostsForUser(rawPosts, currentUserId);

    // Emit view events asynchronously
    if (rankedPosts.length > 0) {
      emitDomainEvent("CONTENT_VIEWED", currentUserId, {
        contentId: rankedPosts[0]?.id,
        contentType: "POST",
      });
    }

    return NextResponse.json({
      success: true,
      version: "v1",
      mode,
      posts: rankedPosts,
      explanations,
      stories: feedStore.getStories(),
      liveStreams: feedStore.getLiveStreams(),
    });
  } catch (error) {
    console.error("[GET /api/v1/feed]", error);
    return NextResponse.json({ success: false, error: "Failed to load v1 feed" }, { status: 500 });
  }
}
