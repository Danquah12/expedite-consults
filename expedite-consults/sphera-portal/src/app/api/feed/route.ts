import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { seedDatabaseIfNeeded, getOrCreateDefaultUser } from "@/lib/db-seed";
import { feedStore, FeedPost, StoryItem, LiveStreamItem } from "@/lib/feed-store";
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
    const mode = (searchParams.get("mode") as string) || "FYP";

    // Attempt to seed initial posts/users if empty in PostgreSQL
    await seedDatabaseIfNeeded().catch((err) => {
      console.warn("[GET /api/feed] seed check warning:", err?.message || err);
    });

    let currentUserId: string | null = null;
    try {
      const session = await auth();
      if (session?.user?.id) {
        currentUserId = session.user.id;
      }
    } catch {
      // Unauthenticated / public viewer
    }

    if (!currentUserId) {
      const defaultUser = await getOrCreateDefaultUser("kwesi").catch(() => null);
      if (defaultUser) {
        currentUserId = defaultUser.id;
      }
    }

    // Query PostgreSQL for authoritative posts
    const whereClause: any = {
      deletedAt: null,
      threadParentId: null, // Only fetch root posts in main feed
    };

    if (mode === "following" || mode === "FOLLOWING") {
      if (currentUserId) {
        const following = await db.follow.findMany({
          where: { followerId: currentUserId },
          select: { followingId: true },
        }).catch(() => []);
        const followingIds = following.map((f) => f.followingId);
        whereClause.authorId = { in: [...followingIds, currentUserId] };
      }
    } else if (mode === "friends") {
      whereClause.OR = [
        { visibility: Visibility.FRIENDS },
        { visibility: Visibility.PUBLIC },
      ];
    } else if (mode === "pulse") {
      whereClause.OR = [
        { isThread: true },
        { type: PostType.THREAD },
      ];
    } else if (mode === "live" || mode === "LIVE") {
      whereClause.OR = [
        { type: PostType.REEL },
        { type: PostType.VIDEO },
        { type: PostType.LIVE_STAGE },
      ];
    }

    const postsFromDb = await db.post.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          include: {
            profile: true,
            followers: currentUserId ? { where: { followerId: currentUserId } } : false,
          },
        },
        reactions: true,
        saves: true,
        shares: true,
        comments: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          include: {
            author: { include: { profile: true } },
          },
        },
        communityNotes: {
          orderBy: { helpfulCount: "desc" },
          take: 1,
        },
        threadReplies: {
          where: { deletedAt: null },
          orderBy: { threadIndex: "asc" },
          include: {
            author: { include: { profile: true } },
          },
        },
      },
    }).catch((err) => {
      console.error("[GET /api/feed] DB query error:", err);
      return [];
    });

    if (postsFromDb.length > 0) {
      const mappedPosts: FeedPost[] = postsFromDb.map((p) => {
        const isLiked = currentUserId ? p.reactions.some((r) => r.userId === currentUserId && r.type === "LIKE") : false;
        const isSaved = currentUserId ? p.saves.some((s) => s.userId === currentUserId) : false;
        const isFollowed = currentUserId ? (p.author.followers?.length > 0 || p.author.id === currentUserId) : false;

        let postType: FeedPost["type"] = "standard";
        if (p.type === PostType.REEL || p.type === PostType.VIDEO) postType = "immersive_video";
        else if (p.type === PostType.THREAD || p.isThread) postType = "pulse_thread";
        else if (p.type === PostType.ARTICLE) postType = "article";
        else if (p.type === PostType.BOUNTY) postType = "bounty";
        else if (p.type === PostType.POLL) postType = "poll";

        const meta = (p.linkMeta as any) || {};

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
            isFollowed,
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
          bounty: p.type === PostType.BOUNTY && meta.title
            ? {
                title: meta.title,
                reward: meta.reward,
                sponsor: meta.sponsor,
                clearanceRequired: meta.clearanceRequired,
                difficulty: meta.difficulty,
                tags: meta.tags || [],
              }
            : undefined,
          article: p.type === PostType.ARTICLE && meta.title
            ? {
                title: meta.title,
                subtitle: meta.subtitle,
                coverImage: meta.coverImage || p.mediaUrls?.[0],
                readTimeMinutes: meta.readTimeMinutes || 5,
                slug: meta.slug,
              }
            : undefined,
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

      // Query Stories from PostgreSQL
      const storiesFromDb = await db.story.findMany({
        where: { expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
        include: { author: { include: { profile: true } } },
      }).catch(() => []);

      const mappedStories: StoryItem[] = storiesFromDb.length > 0
        ? storiesFromDb.map((s) => ({
            id: s.id,
            username: s.author.profile?.username || "user",
            displayName: s.author.profile?.displayName || "Sphera User",
            avatar: s.author.profile?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
            mediaUrl: s.mediaUrl,
            mediaType: s.mediaType === "VIDEO" ? "video" : "image",
            caption: s.caption || undefined,
            timeAgo: formatTimeAgo(s.createdAt),
            isUser: s.author.id === currentUserId,
          }))
        : feedStore.getStories();

      const liveStreams = feedStore.getLiveStreams();

      return NextResponse.json({
        success: true,
        mode,
        posts: mappedPosts,
        stories: mappedStories,
        liveStreams,
      });
    }

    // Safe fallback if DB has 0 items or offline
    const fallbackPosts = feedStore.getPosts(mode);
    const fallbackStories = feedStore.getStories();
    const fallbackLiveStreams = feedStore.getLiveStreams();

    return NextResponse.json({
      success: true,
      mode,
      posts: fallbackPosts,
      stories: fallbackStories,
      liveStreams: fallbackLiveStreams,
    });
  } catch (error) {
    console.error("[GET /api/feed]", error);
    const fallbackPosts = feedStore.getPosts();
    return NextResponse.json({
      success: true,
      posts: fallbackPosts,
      stories: feedStore.getStories(),
      liveStreams: feedStore.getLiveStreams(),
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      content,
      type = "immersive_video",
      videoUrl,
      imageUrl,
      musicTitle,
      musicAuthor,
      hashtags = [],
      authorName = "Kwesi Asiedu",
      authorUsername = "kwesi",
      authorAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      isThread,
      threadIndex,
      threadTotal,
      threadReplies,
      communityNote,
      bounty,
      article,
    } = body;

    if (!content && !videoUrl && !imageUrl) {
      return NextResponse.json({ success: false, error: "Content or media required" }, { status: 400 });
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
      user = await getOrCreateDefaultUser(authorUsername || "kwesi");
    }

    const mediaList: string[] = [];
    if (videoUrl) mediaList.push(videoUrl);
    if (imageUrl && !mediaList.includes(imageUrl)) mediaList.push(imageUrl);

    let prismaType: PostType = PostType.TEXT;
    if (type === "immersive_video" || videoUrl) prismaType = PostType.REEL;
    else if (type === "pulse_thread" || isThread) prismaType = PostType.THREAD;
    else if (type === "article" || article) prismaType = PostType.ARTICLE;
    else if (type === "bounty" || bounty) prismaType = PostType.BOUNTY;
    else if (imageUrl) prismaType = PostType.PHOTO;

    const linkMetaData: any = {};
    if (musicTitle) linkMetaData.musicTitle = musicTitle;
    if (musicAuthor) linkMetaData.musicAuthor = musicAuthor;
    if (bounty) Object.assign(linkMetaData, bounty);
    if (article) Object.assign(linkMetaData, article);

    if (user?.id) {
      const createdPost = await db.post.create({
        data: {
          authorId: user.id,
          type: prismaType,
          content: content || "",
          mediaUrls: mediaList,
          visibility: Visibility.PUBLIC,
          isThread: !!isThread || prismaType === PostType.THREAD,
          threadIndex: threadIndex || (isThread ? 1 : null),
          threadTotal: threadTotal || (isThread ? (threadReplies?.length || 0) + 1 : null),
          linkMeta: Object.keys(linkMetaData).length > 0 ? linkMetaData : undefined,
          communityNotes: communityNote
            ? {
                create: {
                  authorId: user.id,
                  content: communityNote.content,
                  sources: communityNote.sources || [],
                  helpfulCount: communityNote.helpfulCount || 0,
                },
              }
            : undefined,
        },
        include: {
          author: { include: { profile: true } },
          reactions: true,
          saves: true,
          comments: true,
          communityNotes: true,
        },
      });

      // If thread replies are provided, save them in PostgreSQL
      if (Array.isArray(threadReplies) && threadReplies.length > 0) {
        for (let idx = 0; idx < threadReplies.length; idx++) {
          const r = threadReplies[idx];
          await db.post.create({
            data: {
              authorId: user.id,
              type: PostType.THREAD,
              content: r.content || "",
              mediaUrls: r.mediaUrl ? [r.mediaUrl] : [],
              visibility: Visibility.PUBLIC,
              isThread: true,
              threadIndex: idx + 2,
              threadTotal: threadReplies.length + 1,
              threadParentId: createdPost.id,
            },
          }).catch(() => {});
        }
      }

      // Also save initial author like
      await db.reaction.create({
        data: {
          userId: user.id,
          postId: createdPost.id,
          type: "LIKE",
        },
      }).catch(() => {});

      const mappedFeedPost: FeedPost = {
        id: createdPost.id,
        type: type || "immersive_video",
        streamCategory: "for_you",
        author: {
          id: user.id,
          name: user.profile?.displayName || authorName,
          username: user.profile?.username || authorUsername,
          avatarUrl: user.profile?.avatar || authorAvatar,
          verified: true,
          timeAgo: "Just now",
          privacy: "Public",
          isFollowed: true,
          isFriend: true,
        },
        content: createdPost.content || "",
        videoUrl,
        imageUrl: imageUrl || videoUrl,
        musicTitle,
        musicAuthor,
        hashtags,
        likes: 1,
        commentsCount: 0,
        sharesCount: 0,
        repostsCount: 0,
        viewsCount: 1,
        savesCount: 0,
        isLiked: true,
        isSaved: false,
        isThread: createdPost.isThread,
        threadIndex: createdPost.threadIndex || undefined,
        threadTotal: createdPost.threadTotal || undefined,
        threadReplies: threadReplies || [],
        communityNote,
        bounty,
        article,
        createdAt: createdPost.createdAt.toISOString(),
        commentsList: [],
      };

      // Also mirror to memory feedStore for zero-latency local fallback
      feedStore.addPost(mappedFeedPost);

      return NextResponse.json({ success: true, post: mappedFeedPost }, { status: 201 });
    }

    // Fallback if user ID creation was skipped
    const fallbackPost = feedStore.addPost({
      type,
      author: {
        id: `user-${authorUsername}`,
        name: authorName,
        username: authorUsername,
        avatarUrl: authorAvatar,
        verified: true,
        timeAgo: "Just now",
        privacy: "Public",
        isFollowed: false,
      },
      content: content || "",
      videoUrl,
      imageUrl: imageUrl || videoUrl,
      musicTitle,
      musicAuthor,
      hashtags,
    });

    return NextResponse.json({ success: true, post: fallbackPost }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/feed]", error);
    return NextResponse.json({ success: false, error: "Failed to publish post" }, { status: 500 });
  }
}
