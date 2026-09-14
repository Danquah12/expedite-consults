export interface Author {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  verified?: boolean;
  timeAgo: string;
  privacy?: string;
  isFollowed?: boolean;
  isFriend?: boolean;
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

export interface CommunityNoteData {
  content: string;
  sources: string[];
  helpfulCount: number;
}

export interface BountyData {
  title: string;
  reward: string;
  sponsor: string;
  clearanceRequired?: string;
  difficulty?: string;
  tags: string[];
}

export interface ArticleData {
  title: string;
  subtitle?: string;
  coverImage?: string;
  readTimeMinutes: number;
  slug?: string;
}

export interface PollData {
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  userVotedOptionId?: string;
}

export interface FeedPost {
  id: string;
  type: "standard" | "immersive_video" | "pulse_thread" | "article" | "bounty" | "poll";
  streamCategory?: "for_you" | "following" | "friends" | "pulse" | "live";
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
  repostsCount?: number;
  viewsCount?: number;
  savesCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isReposted?: boolean;
  likedByFriend?: string;
  commentsList?: CommentItem[];
  createdAt: string;

  // Sphera Pulse & Threading
  isThread?: boolean;
  threadIndex?: number;
  threadTotal?: number;
  threadReplies?: {
    id: string;
    content: string;
    mediaUrl?: string;
    author: Author;
  }[];
  communityNote?: CommunityNoteData;
  bounty?: BountyData;
  article?: ArticleData;
  poll?: PollData;
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
  // 1. Sphera Pulse 1/N Thread with Community Context Note
  {
    id: "pulse-t1",
    type: "pulse_thread",
    streamCategory: "pulse",
    author: {
      id: "u_kwesi",
      name: "Kwesi Asiedu",
      username: "kwesi",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      verified: true,
      timeAgo: "15m ago",
      privacy: "Public",
      isFollowed: true,
      isFriend: true,
    },
    content: "1/4 SpheraNet 2.0 is officially deploying sovereign zero-trust architecture across all connected campus graphs. Here is why decentralizing social graph ownership changes student IP forever 🧵👇 #SpheraLaunch #ZeroTrust",
    hashtags: ["#SpheraLaunch", "#ZeroTrust", "#CampusGraph", "#Web3OS"],
    likes: 4210,
    commentsCount: 382,
    sharesCount: 910,
    repostsCount: 540,
    viewsCount: 28400,
    isLiked: true,
    isThread: true,
    threadIndex: 1,
    threadTotal: 3,
    threadReplies: [
      {
        id: "pulse-t1-r1",
        content: "2/4 Every coursework repo, hackathon submission, and bazaar escrow transaction is cryptographically signed with local enclave keys. No central ad networks sniffing your private career passport.",
        author: {
          id: "u_kwesi",
          name: "Kwesi Asiedu",
          username: "kwesi",
          avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
          verified: true,
          timeAgo: "14m ago",
        },
      },
      {
        id: "pulse-t1-r2",
        content: "3/4 Try converting this entire discussion into a longform verified article with 1 click using the new AI Synthesizer at the top of your feed! 🚀",
        author: {
          id: "u_kwesi",
          name: "Kwesi Asiedu",
          username: "kwesi",
          avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
          verified: true,
          timeAgo: "12m ago",
        },
      },
    ],
    communityNote: {
      content: "Verified by UMD Cybersecurity Enclave benchmarks: SHA-256 local signature hashes prevent unauthorized scraping of collegiate builder profiles.",
      sources: ["https://cyber.umd.edu/research/sovereign-graph", "https://expediteconsults.com/security"],
      helpfulCount: 342,
    },
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },

  // 2. TikTok Style Immersive Reel
  {
    id: "p1",
    type: "immersive_video",
    streamCategory: "for_you",
    author: {
      id: "u1",
      name: "Amara Diallo",
      username: "amara_creates",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      verified: true,
      timeAgo: "2h ago",
      privacy: "Public",
      isFollowed: false,
      isFriend: false,
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
    repostsCount: 1420,
    viewsCount: 654000,
    savesCount: 12400,
    isLiked: true,
    likedByFriend: "Marcus Johnson",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    commentsList: [
      { id: "c1", user: "Marcus Johnson", username: "mj_tech", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", text: "This UI is next level! The sound synchronization is insane 🔥", time: "1h ago", likes: 242 },
      { id: "c2", user: "Zara Williams", username: "zara.w", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80", text: "Proud of you Amara! Collegiate hackathons will never be the same 👏", time: "45m ago", likes: 118 },
    ]
  },

  // 3. LinkedIn Proof-of-Work Career Bounty Card
  {
    id: "bounty-1",
    type: "bounty",
    streamCategory: "for_you",
    author: {
      id: "u_marcus",
      name: "Marcus Johnson",
      username: "mj_tech",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      verified: true,
      timeAgo: "4h ago",
      privacy: "Public",
      isFollowed: true,
      isFriend: true,
    },
    content: "New Defense Bounty Challenge posted for student & alumni developers: Zero-Trust Enclave Rust Driver Audit. Earn USDC & Skill Passport Credentials.",
    bounty: {
      title: "Rust SGX Enclave Memory Isolation Audit",
      reward: "$3,500 USDC",
      sponsor: "Defense Innovation & Cyber Guild",
      clearanceRequired: "TS/SCI Eligible",
      difficulty: "Zero-Day",
      tags: ["Rust", "SGX", "Zero-Trust", "Penetration Testing"],
    },
    hashtags: ["#CyberDefense2026", "#CareerBounty", "#RustLang", "#DefenseTech"],
    likes: 1240,
    commentsCount: 94,
    sharesCount: 310,
    viewsCount: 14200,
    isLiked: false,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },

  // 4. Friends Mutual Graph Post
  {
    id: "p3",
    type: "standard",
    streamCategory: "friends",
    author: {
      id: "u_zara",
      name: "Zara Williams",
      username: "zara.w",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      verified: true,
      timeAgo: "1d ago",
      privacy: "Friends",
      isFollowed: true,
      isFriend: true,
    },
    content: "Bitcamp 2026 kickoff team photo at the Brendan Iribe Center! Over 600 builders here hacking on autonomous AI agents, robotics, and next-gen social protocols 🔥",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80",
    hashtags: ["#BitcampHackathon", "#UMDTerps", "#CampusGraph", "#Builders"],
    likes: 3410,
    commentsCount: 142,
    sharesCount: 58,
    repostsCount: 44,
    viewsCount: 22100,
    likedByFriend: "Kwesi Asiedu",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },

  // 5. Longform Article Post
  {
    id: "art-1",
    type: "article",
    streamCategory: "for_you",
    author: {
      id: "u_amara",
      name: "Amara Diallo",
      username: "amara_creates",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      verified: true,
      timeAgo: "1d ago",
      privacy: "Public",
      isFollowed: true,
      isFriend: false,
    },
    content: "Why the Sovereign Social Web wins the decade: A technical deep-dive on combining TikTok algorithmic discovery with X public discourse and private escrow markets.",
    article: {
      title: "The Architecture of Sovereign Social Networks",
      subtitle: "Synthesizing TikTok, Instagram, X, and Campus Career Graphs into a Unified Experience",
      coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80",
      readTimeMinutes: 6,
      slug: "architecture-of-sovereign-social-networks",
    },
    hashtags: ["#SpheraNet", "#Architecture", "#FutureOfSocial"],
    likes: 8920,
    commentsCount: 420,
    sharesCount: 1800,
    viewsCount: 94000,
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
  },
];

export const initialStories: StoryItem[] = [
  {
    id: "s0",
    username: "kwesi",
    displayName: "Your Story",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80",
    mediaType: "image",
    timeAgo: "Just now",
    isUser: true,
  },
  {
    id: "s1",
    username: "amara_creates",
    displayName: "Amara Diallo",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80",
    mediaType: "image",
    caption: "Live keynote at Sphera HQ 🚀",
    timeAgo: "2h ago",
    hasLive: true,
  },
  {
    id: "s2",
    username: "mj_tech",
    displayName: "Marcus Johnson",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=500&auto=format&fit=crop&q=80",
    mediaType: "image",
    caption: "Zero-trust enclave testing 🦾",
    timeAgo: "4h ago",
  },
  {
    id: "s3",
    username: "zara.w",
    displayName: "Zara Williams",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80",
    mediaType: "image",
    caption: "Bitcamp registration is live 🔥",
    timeAgo: "6h ago",
    hasLive: true,
  },
  {
    id: "s4",
    username: "elena_v",
    displayName: "Elena Vasquez",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    mediaType: "image",
    caption: "New UI glassmorphism preview ✨",
    timeAgo: "8h ago",
  },
];

export const initialLiveStreams: LiveStreamItem[] = [
  {
    id: "ls1",
    name: "Amara Diallo",
    username: "amara_creates",
    viewers: "12.4K",
    viewerCount: 12400,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: "🎙️ SpheraNet 2.0 Launch Keynote & AMA",
    category: "Tech & Sovereign OS",
    startedAt: "15m ago",
  },
  {
    id: "ls2",
    name: "UMD Terps Esports",
    username: "terps_esports",
    viewers: "8.2K",
    viewerCount: 8200,
    avatar: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&auto=format&fit=crop&q=80",
    title: "🎮 Collegiate Valorant Finals vs CyberGuild",
    category: "Esports Arena",
    startedAt: "30m ago",
  },
];

// Helper for persistent JSON on server
function getStorageFilePaths(filename: string): string[] {
  if (typeof window !== "undefined") return [];
  try {
    const p = require("path");
    const fs = require("fs");
    const paths = [
      p.join(process.cwd(), "data", filename),
      p.join(process.cwd(), "sphera-portal", "data", filename),
    ];
    return paths;
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
    console.warn(`[FeedStore] Could not load ${filename}:`, err);
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

class FeedStore {
  private posts: FeedPost[];
  private stories: StoryItem[];
  private liveStreams: LiveStreamItem[];

  constructor() {
    this.posts = loadPersistedData<FeedPost[]>("feed-posts.json", [...initialFeedPosts]);
    this.stories = loadPersistedData<StoryItem[]>("feed-stories.json", [...initialStories]);
    this.liveStreams = loadPersistedData<LiveStreamItem[]>("feed-livestreams.json", [...initialLiveStreams]);
  }

  private refreshFromDisk() {
    this.posts = loadPersistedData<FeedPost[]>("feed-posts.json", this.posts);
    this.stories = loadPersistedData<StoryItem[]>("feed-stories.json", this.stories);
    this.liveStreams = loadPersistedData<LiveStreamItem[]>("feed-livestreams.json", this.liveStreams);
  }

  getPosts(mode: string = "for_you"): FeedPost[] {
    this.refreshFromDisk();
    if (mode === "following" || mode === "FOLLOWING") {
      return this.posts.filter((p) => p.author.isFollowed);
    }
    if (mode === "friends") {
      return this.posts.filter((p) => p.author.isFriend || p.streamCategory === "friends");
    }
    if (mode === "pulse") {
      return this.posts.filter((p) => p.type === "pulse_thread" || p.streamCategory === "pulse" || p.isThread);
    }
    if (mode === "live" || mode === "LIVE") {
      return this.posts.filter((p) => p.type === "immersive_video" || p.videoUrl);
    }
    return this.posts;
  }

  getStories(): StoryItem[] {
    this.refreshFromDisk();
    return this.stories;
  }

  getLiveStreams(): LiveStreamItem[] {
    this.refreshFromDisk();
    return this.liveStreams;
  }

  addPost(post: Partial<FeedPost>): FeedPost {
    const newPost: FeedPost = {
      id: post.id || `p-${Date.now()}`,
      type: post.type || "immersive_video",
      streamCategory: post.streamCategory || "for_you",
      author: post.author || {
        id: "u_me",
        name: "Kwesi Asiedu",
        username: "kwesi",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
        verified: true,
        timeAgo: "Just now",
        isFollowed: true,
        isFriend: true,
      },
      content: post.content || "",
      imageUrl: post.imageUrl,
      videoUrl: post.videoUrl,
      musicTitle: post.musicTitle,
      musicAuthor: post.musicAuthor,
      hashtags: post.hashtags || [],
      likes: 1,
      commentsCount: 0,
      sharesCount: 0,
      repostsCount: 0,
      viewsCount: 1,
      isLiked: true,
      isThread: post.isThread,
      threadIndex: post.threadIndex,
      threadTotal: post.threadTotal,
      threadReplies: post.threadReplies,
      communityNote: post.communityNote,
      bounty: post.bounty,
      article: post.article,
      createdAt: new Date().toISOString(),
      commentsList: [],
    };
    this.posts.unshift(newPost);
    savePersistedData("feed-posts.json", this.posts);
    return newPost;
  }

  addStory(story: Partial<StoryItem>): StoryItem {
    const newStory: StoryItem = {
      id: `s-${Date.now()}`,
      username: story.username || "kwesi",
      displayName: story.displayName || "Kwesi Asiedu",
      avatar: story.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      mediaUrl: story.mediaUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80",
      mediaType: story.mediaType || "image",
      timeAgo: "Just now",
      isUser: true,
    };
    this.stories.unshift(newStory);
    savePersistedData("feed-stories.json", this.stories);
    return newStory;
  }

  toggleLike(id: string): { isLiked: boolean; likes: number; liked: boolean; count: number } {
    const post = this.posts.find((p) => p.id === id);
    if (!post) return { isLiked: false, likes: 0, liked: false, count: 0 };
    post.isLiked = !post.isLiked;
    post.likes = post.isLiked ? post.likes + 1 : Math.max(0, post.likes - 1);
    savePersistedData("feed-posts.json", this.posts);
    return { isLiked: post.isLiked, likes: post.likes, liked: post.isLiked, count: post.likes };
  }

  toggleSave(id: string): { isSaved: boolean; savesCount: number; saved: boolean } {
    const post = this.posts.find((p) => p.id === id);
    if (!post) return { isSaved: false, savesCount: 0, saved: false };
    post.isSaved = !post.isSaved;
    post.savesCount = (post.savesCount || 0) + (post.isSaved ? 1 : -1);
    savePersistedData("feed-posts.json", this.posts);
    return { isSaved: post.isSaved, savesCount: post.savesCount, saved: post.isSaved };
  }

  toggleFollow(username: string): { isFollowed: boolean } {
    let result = false;
    this.posts.forEach((p) => {
      if (p.author.username === username) {
        p.author.isFollowed = !p.author.isFollowed;
        result = !!p.author.isFollowed;
      }
    });
    savePersistedData("feed-posts.json", this.posts);
    return { isFollowed: result };
  }

  addComment(
    postId: string,
    textOrObj: string | { text: string; user?: string; username?: string },
    user?: string,
    username?: string
  ): CommentItem | null {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return null;

    let commentText = "";
    let commentUser = user || "Kwesi Asiedu";
    let commentUsername = username || "kwesi";

    if (typeof textOrObj === "string") {
      commentText = textOrObj;
    } else if (textOrObj && typeof textOrObj === "object") {
      commentText = textOrObj.text;
      if (textOrObj.user) commentUser = textOrObj.user;
      if (textOrObj.username) commentUsername = textOrObj.username;
    }

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      user: commentUser,
      username: commentUsername,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
      text: commentText,
      time: "Just now",
      likes: 0,
    };
    if (!post.commentsList) post.commentsList = [];
    post.commentsList.unshift(newComment);
    post.commentsCount += 1;
    savePersistedData("feed-posts.json", this.posts);
    return newComment;
  }

  startLiveStream(stream: Partial<LiveStreamItem>): LiveStreamItem {
    return this.addLiveStream(stream);
  }

  addLiveStream(stream: Partial<LiveStreamItem>): LiveStreamItem {
    const newStream: LiveStreamItem = {
      id: `ls-${Date.now()}`,
      name: stream.name || "Kwesi Asiedu",
      username: stream.username || "kwesi",
      viewers: "1",
      viewerCount: 1,
      avatar: stream.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      title: stream.title || "Live Stream",
      category: stream.category || "General",
      startedAt: "Just now",
    };
    this.liveStreams.unshift(newStream);
    savePersistedData("feed-livestreams.json", this.liveStreams);
    return newStream;
  }
}

export const feedStore = new FeedStore();
