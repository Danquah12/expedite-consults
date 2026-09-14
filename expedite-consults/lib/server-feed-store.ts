import fs from "fs";
import path from "path";
import {
  FeedPost,
  StoryItem,
  LiveStreamItem,
  CommentItem,
  initialFeedPosts,
  initialStories,
  initialLiveStreams,
} from "./feed-store";

declare global {
  // eslint-disable-next-line no-var
  var __SPHERA_FEED_POSTS__: FeedPost[] | undefined;
  // eslint-disable-next-line no-var
  var __SPHERA_FEED_STORIES__: StoryItem[] | undefined;
  // eslint-disable-next-line no-var
  var __SPHERA_FEED_LIVE__: LiveStreamItem[] | undefined;
  // eslint-disable-next-line no-var
  var __SPHERA_FOLLOWED_USERS__: Set<string> | undefined;
}

function getStorageFilePaths(filename: string): string[] {
  try {
    const primary = path.join(process.cwd(), "data", "db", filename);
    const dir = path.dirname(primary);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return [
      primary,
      path.join(process.cwd(), "app", "linkedin", "data", filename),
      path.join(process.cwd(), "data", filename),
    ];
  } catch {
    return [];
  }
}

function loadPersistedData<T>(filename: string, fallback: T): T {
  try {
    const filePaths = getStorageFilePaths(filename);
    for (const filePath of filePaths) {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as unknown as T;
        }
      }
    }
  } catch (err) {
    console.warn(`[FeedStore Server] Notice for ${filename}:`, err);
  }
  return fallback;
}

function savePersistedData(filename: string, data: any) {
  try {
    const filePaths = getStorageFilePaths(filename);
    for (const filePath of filePaths) {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn(`[FeedStore Server] Could not save ${filename}:`, err);
  }
}

if (!globalThis.__SPHERA_FEED_POSTS__) {
  globalThis.__SPHERA_FEED_POSTS__ = loadPersistedData<FeedPost[]>("feed_posts.json", [...initialFeedPosts]);
}

if (!globalThis.__SPHERA_FEED_STORIES__) {
  globalThis.__SPHERA_FEED_STORIES__ = loadPersistedData<StoryItem[]>("feed_stories.json", [...initialStories]);
}

if (!globalThis.__SPHERA_FEED_LIVE__) {
  globalThis.__SPHERA_FEED_LIVE__ = loadPersistedData<LiveStreamItem[]>("feed_livestreams.json", [...initialLiveStreams]);
}

if (!globalThis.__SPHERA_FOLLOWED_USERS__) {
  globalThis.__SPHERA_FOLLOWED_USERS__ = new Set(["mj_tech", "zara.w"]);
}

export const feedStore = {
  getPosts: (mode: "FYP" | "FOLLOWING" | "LIVE" = "FYP"): FeedPost[] => {
    globalThis.__SPHERA_FEED_POSTS__ = loadPersistedData<FeedPost[]>(
      "feed_posts.json",
      globalThis.__SPHERA_FEED_POSTS__ || [...initialFeedPosts]
    );
    const posts = globalThis.__SPHERA_FEED_POSTS__ || [];
    const followed = globalThis.__SPHERA_FOLLOWED_USERS__ || new Set();

    if (mode === "FOLLOWING") {
      return posts.filter((p) => followed.has(p.author.username) || p.author.isFollowed);
    }
    return posts;
  },

  addPost: (post: Omit<FeedPost, "id" | "likes" | "commentsCount" | "sharesCount" | "createdAt"> & { id?: string }): FeedPost => {
    const newPost: FeedPost = {
      ...post,
      id: post.id || `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      likes: 1,
      commentsCount: 0,
      sharesCount: 0,
      savesCount: 0,
      isLiked: true,
      isSaved: false,
      commentsList: [],
      createdAt: new Date().toISOString(),
    };
    globalThis.__SPHERA_FEED_POSTS__ = [newPost, ...(globalThis.__SPHERA_FEED_POSTS__ || [])];
    savePersistedData("feed_posts.json", globalThis.__SPHERA_FEED_POSTS__);
    return newPost;
  },

  toggleLike: (postId: string): { isLiked: boolean; likes: number } => {
    const posts = globalThis.__SPHERA_FEED_POSTS__ || [];
    let updated = { isLiked: false, likes: 0 };

    globalThis.__SPHERA_FEED_POSTS__ = posts.map((p) => {
      if (p.id === postId) {
        const nextLiked = !p.isLiked;
        const nextLikes = nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1);
        updated = { isLiked: nextLiked, likes: nextLikes };
        return {
          ...p,
          isLiked: nextLiked,
          likes: nextLikes,
        };
      }
      return p;
    });

    savePersistedData("feed_posts.json", globalThis.__SPHERA_FEED_POSTS__);
    return updated;
  },

  toggleSave: (postId: string): { isSaved: boolean; savesCount: number } => {
    const posts = globalThis.__SPHERA_FEED_POSTS__ || [];
    let updated = { isSaved: false, savesCount: 0 };

    globalThis.__SPHERA_FEED_POSTS__ = posts.map((p) => {
      if (p.id === postId) {
        const nextSaved = !p.isSaved;
        const nextSaves = nextSaved ? (p.savesCount || 0) + 1 : Math.max(0, (p.savesCount || 0) - 1);
        updated = { isSaved: nextSaved, savesCount: nextSaves };
        return {
          ...p,
          isSaved: nextSaved,
          savesCount: nextSaves,
        };
      }
      return p;
    });

    savePersistedData("feed_posts.json", globalThis.__SPHERA_FEED_POSTS__);
    return updated;
  },

  recordShare: (postId: string): number => {
    const posts = globalThis.__SPHERA_FEED_POSTS__ || [];
    let shares = 0;
    globalThis.__SPHERA_FEED_POSTS__ = posts.map((p) => {
      if (p.id === postId) {
        shares = (p.sharesCount || 0) + 1;
        return { ...p, sharesCount: shares };
      }
      return p;
    });
    savePersistedData("feed_posts.json", globalThis.__SPHERA_FEED_POSTS__);
    return shares;
  },

  toggleFollow: (username: string): boolean => {
    const followed = globalThis.__SPHERA_FOLLOWED_USERS__ || new Set();
    const isCurrentlyFollowed = followed.has(username);

    if (isCurrentlyFollowed) {
      followed.delete(username);
    } else {
      followed.add(username);
    }

    const posts = globalThis.__SPHERA_FEED_POSTS__ || [];
    globalThis.__SPHERA_FEED_POSTS__ = posts.map((p) => {
      if (p.author.username === username) {
        return {
          ...p,
          author: { ...p.author, isFollowed: !isCurrentlyFollowed },
        };
      }
      return p;
    });

    savePersistedData("feed_posts.json", globalThis.__SPHERA_FEED_POSTS__);
    return !isCurrentlyFollowed;
  },

  addComment: (postId: string, text: string, user = "Kwesi Asiedu", username = "kwesi"): CommentItem | null => {
    const posts = globalThis.__SPHERA_FEED_POSTS__ || [];
    const newComment: CommentItem = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user,
      username,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
      text: text.trim(),
      time: "Just now",
      likes: 0,
    };

    let added = false;
    globalThis.__SPHERA_FEED_POSTS__ = posts.map((p) => {
      if (p.id === postId) {
        added = true;
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          commentsList: [newComment, ...(p.commentsList || [])],
        };
      }
      return p;
    });

    savePersistedData("feed_posts.json", globalThis.__SPHERA_FEED_POSTS__);
    return added ? newComment : null;
  },

  getStories: (): StoryItem[] => {
    return globalThis.__SPHERA_FEED_STORIES__ || [];
  },

  addStory: (story: Omit<StoryItem, "id" | "timeAgo">): StoryItem => {
    const newStory: StoryItem = {
      ...story,
      id: `story-${Date.now()}`,
      timeAgo: "Just now",
    };
    globalThis.__SPHERA_FEED_STORIES__ = [newStory, ...(globalThis.__SPHERA_FEED_STORIES__ || [])];
    savePersistedData("feed_stories.json", globalThis.__SPHERA_FEED_STORIES__);
    return newStory;
  },

  getLiveStreams: (): LiveStreamItem[] => {
    return globalThis.__SPHERA_FEED_LIVE__ || [];
  },

  startLiveStream: (stream: Omit<LiveStreamItem, "id" | "viewers" | "viewerCount" | "startedAt">): LiveStreamItem => {
    const newLive: LiveStreamItem = {
      ...stream,
      id: `live-${Date.now()}`,
      viewers: "1",
      viewerCount: 1,
      startedAt: "Just now",
    };
    globalThis.__SPHERA_FEED_LIVE__ = [newLive, ...(globalThis.__SPHERA_FEED_LIVE__ || [])];
    savePersistedData("feed_livestreams.json", globalThis.__SPHERA_FEED_LIVE__);
    return newLive;
  },
};
