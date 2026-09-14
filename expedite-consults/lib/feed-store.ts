export interface Author {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  verified?: boolean;
  timeAgo: string;
  privacy?: string;
  isFollowed?: boolean;
}

export interface CommentItem {
  id: string;
  user: string;
  username: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
}

export interface FeedPost {
  id: string;
  type: "standard" | "immersive_video";
  author: Author;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  musicTitle?: string;
  musicAuthor?: string;
  hashtags?: string[];
  likes: number;
  commentsCount: number;
  sharesCount: number;
  savesCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  likedByFriend?: string;
  commentsList?: CommentItem[];
  createdAt: string;
}

export interface StoryItem {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string;
  timeAgo: string;
  hasLive?: boolean;
  isUser?: boolean;
}

export interface LiveStreamItem {
  id: string;
  name: string;
  username: string;
  viewers: string;
  viewerCount: number;
  avatar: string;
  title: string;
  streamUrl?: string;
  category: string;
  startedAt: string;
}

export const initialFeedPosts: FeedPost[] = [
  {
    id: "p1",
    type: "immersive_video",
    author: {
      id: "u1",
      name: "Amara Diallo",
      username: "amara_creates",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      verified: true,
      timeAgo: "2h ago",
      privacy: "Public",
      isFollowed: false,
    },
    content: "3 years of building in the dark, and today our largest platform update is finally live across SpheraNet! 🚀✨ Full breakdown dropping on Reels tonight. Tag a friend who needs to see this! 💫",
    videoUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80",
    musicTitle: "Afrobeats Synthwave Future Mix Vol. 4",
    musicAuthor: "DJ Khaled x Sphera Sound",
    hashtags: ["#SpheraViral", "#FYP", "#TechPulse", "#BuildInPublic", "#AI2026"],
    likes: 184200,
    commentsCount: 3210,
    sharesCount: 8900,
    savesCount: 12400,
    isLiked: true,
    likedByFriend: "Marcus Johnson",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    commentsList: [
      { id: "c1", user: "Marcus Johnson", username: "mj_tech", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", text: "This UI is next level! The sound synchronization is insane 🔥", time: "1h ago", likes: 242 },
      { id: "c2", user: "Zara Williams", username: "zara.w", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80", text: "Proud of you Amara! Collegiate hackathons will never be the same 👏", time: "45m ago", likes: 118 },
    ]
  },
  {
    id: "p2",
    type: "immersive_video",
    author: {
      id: "u2",
      name: "Marcus Johnson",
      username: "mj_tech",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      verified: true,
      timeAgo: "4h ago",
      privacy: "Public",
      isFollowed: true,
    },
    content: "5 VS Code & AI shortcuts that changed my development workflow in 2026. Number 3 will save you 2 hours every single day 🤯 Try this right now and thank me later! 🦾💻",
    videoUrl: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1000&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1000&auto=format&fit=crop&q=80",
    musicTitle: "Lo-Fi Study Beats & Cyber Bass",
    musicAuthor: "ChillHop Cafe Records",
    hashtags: ["#CodingHacks", "#VSCode", "#DevLife", "#Productivity", "#Nextjs"],
    likes: 94200,
    commentsCount: 1780,
    sharesCount: 14200,
    savesCount: 31000,
    likedByFriend: "Zara Williams",
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    commentsList: [
      { id: "c3", user: "Elena Vasquez", username: "elena_v", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80", text: "Shortcut #3 just fixed my entire terminal layout thank you!", time: "2h ago", likes: 89 },
    ]
  },
  {
    id: "p3",
    type: "immersive_video",
    author: {
      id: "u3",
      name: "Zara Williams",
      username: "zara.w",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      verified: true,
      timeAgo: "1d ago",
      privacy: "Public",
      isFollowed: true,
    },
    content: "Collegiate hackathon kickoff at University of Maryland! Over 600 builders here hacking on autonomous AI agents, robotics, and next-gen gaming protocols 🔥 The energy in the Iribe Center is unbelievable.",
    videoUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80",
    musicTitle: "Cyberpunk 2077 Nightcore Anthem",
    musicAuthor: "Sphera EDM Collective",
    hashtags: ["#HackUMD", "#StudentBuilders", "#CampusLife", "#Robotics"],
    likes: 34100,
    commentsCount: 1420,
    sharesCount: 5800,
    savesCount: 3120,
    likedByFriend: "Kwesi Asiedu",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    commentsList: [
      { id: "c4", user: "David Chen", username: "dchen", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80", text: "Best hackathon project of the season!", time: "5h ago", likes: 45 }
    ]
  },
];

export const initialStories: StoryItem[] = [
  {
    id: "s0",
    username: "Your Story",
    displayName: "Kwesi Asiedu",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop&q=80",
    mediaType: "image",
    caption: "Late night building across SpheraNet! ⚡",
    timeAgo: "Just now",
    isUser: true,
  },
  {
    id: "s1",
    username: "amara_creates",
    displayName: "Amara Diallo",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    mediaType: "image",
    caption: "Live coding the new AI duets! Join the stream 🎙️",
    timeAgo: "2h ago",
    hasLive: true,
  },
  {
    id: "s2",
    username: "mj_tech",
    displayName: "Marcus J.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
    mediaType: "image",
    caption: "New desk setup with triple curved monitors 🚀",
    timeAgo: "4h ago",
  },
  {
    id: "s3",
    username: "zara.w",
    displayName: "Zara W.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
    mediaType: "image",
    caption: "HackUMD day 2 breakfast round ☕🥞",
    timeAgo: "6h ago",
  },
  {
    id: "s4",
    username: "elena_v",
    displayName: "Elena V.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80",
    mediaType: "image",
    caption: "Sunset over campus library 🌅📚",
    timeAgo: "8h ago",
  },
];

export const initialLiveStreams: LiveStreamItem[] = [
  {
    id: "l1",
    name: "Amara Diallo",
    username: "amara_creates",
    viewers: "4.2K",
    viewerCount: 4230,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: "Live Coding & UI Architecture",
    streamUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80",
    category: "Tech & Coding",
    startedAt: "35m ago",
  },
  {
    id: "l2",
    name: "Cyber Club Live",
    username: "cyber_club",
    viewers: "1.8K",
    viewerCount: 1810,
    avatar: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80",
    title: "CTF Ethical Hacking Speedrun",
    streamUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80",
    category: "Cybersecurity",
    startedAt: "1h ago",
  },
  {
    id: "l3",
    name: "DJ Chillhop",
    username: "dj_chillhop",
    viewers: "920",
    viewerCount: 920,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    title: "Midnight Coding Beats & Q&A",
    streamUrl: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1000&auto=format&fit=crop&q=80",
    category: "Music & Beats",
    startedAt: "12m ago",
  },
];

// Global persistent in-memory store instance
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

// Persistent storage on D: Drive
function getStorageFilePaths(filename: string): string[] {
  if (typeof window !== "undefined") return [];
  try {
    const p = require("path");
    const fs = require("fs");
    const primary = p.join(process.cwd(), "data", "db", filename);
    const dir = p.dirname(primary);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return [
      primary,
      p.join(process.cwd(), "app", "linkedin", "data", filename),
      p.join(process.cwd(), "data", filename),
    ];
  } catch {
    return [];
  }
}

function loadPersistedData<T>(filename: string, fallback: T): T {
  if (typeof window !== "undefined") return fallback;
  try {
    const fs = require("fs");
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
    console.warn(`[FeedStore] Notice for ${filename}:`, err);
  }
  return fallback;
}

function savePersistedData(filename: string, data: any) {
  if (typeof window !== "undefined") return;
  try {
    const fs = require("fs");
    const p = require("path");
    const filePaths = getStorageFilePaths(filename);
    for (const filePath of filePaths) {
      const dir = p.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn(`[FeedStore] Could not save ${filename}:`, err);
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
    globalThis.__SPHERA_FEED_POSTS__ = loadPersistedData<FeedPost[]>("feed_posts.json", globalThis.__SPHERA_FEED_POSTS__ || [...initialFeedPosts]);
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

    return updated;
  },

  toggleFollow: (username: string): boolean => {
    const followed = globalThis.__SPHERA_FOLLOWED_USERS__ || new Set();
    const isCurrentlyFollowed = followed.has(username);

    if (isCurrentlyFollowed) {
      followed.delete(username);
    } else {
      followed.add(username);
    }

    // Update posts author followed flags
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
    return newLive;
  },
};
