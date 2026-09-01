import {
  NotificationType,
  UserRole,
  PostType,
  Visibility,
  MediaType,
  ConversationType,
  MessageType,
  ChatRole,
  SpaceType,
  SpaceRole,
  ChannelType,
  EventType,
  RsvpStatus,
  ListingCategory,
  ItemCondition,
  ListingStatus,
  OrderStatus,
} from "@/generated/client";

// ─── Re-export Prisma enums ────────────────────────────────────────────────────
export {
  NotificationType,
  UserRole,
  PostType,
  Visibility,
  MediaType,
  ConversationType,
  MessageType,
  ChatRole,
  SpaceType,
  SpaceRole,
  ChannelType,
  EventType,
  RsvpStatus,
  ListingCategory,
  ItemCondition,
  ListingStatus,
  OrderStatus,
};

// ─── User types ───────────────────────────────────────────────────────────────

export type PublicProfile = {
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  isVerified: boolean;
  profileVisibility: Visibility;
};

export type PublicUser = {
  id: string;
  role: UserRole;
  profile: PublicProfile | null;
  _count?: {
    posts: number;
    following: number;
    followers: number;
  };
  isFollowing?: boolean;
};

// ─── Post types ───────────────────────────────────────────────────────────────

export type PostWithDetails = {
  id: string;
  type: PostType;
  content: string | null;
  visibility: Visibility;
  mediaUrls: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: PublicUser;
  _count: {
    reactions: number;
    comments: number;
    saves: number;
  };
  isLiked?: boolean;
  isSaved?: boolean;
};

// ─── Reel / Video types ───────────────────────────────────────────────────────

export type ReelWithDetails = {
  id: string;
  authorId: string;
  author: PublicUser;
  url: string;
  thumbnailUrl: string | null;
  duration: number;
  caption: string | null;
  music: string | null;
  hashtags: string[];
  isReel: boolean;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  status: string;
  views: number;
  likes: number;
  shares: number;
  saves: number;
  createdAt: Date;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  _count?: {
    comments: number;
  };
};

export type ReelsPage = {
  reels: ReelWithDetails[];
  nextCursor: string | null;
  hasMore: boolean;
};

// ─── Story types ──────────────────────────────────────────────────────────────

export type StoryItem = {
  id: string;
  authorId: string;
  mediaUrl: string;
  mediaType: MediaType;
  caption: string | null;
  expiresAt: Date;
  createdAt: Date;
  hasViewed: boolean;
  viewsCount?: number;
};

export type StoryGroup = {
  author: PublicUser;
  stories: StoryItem[];
  allViewed: boolean;
  latestCreatedAt: Date;
};

// ─── Chat / SpheraChat types ──────────────────────────────────────────────────

export type MessageReactionItem = {
  id: string;
  emoji: string;
  userId: string;
  createdAt: Date;
};

export type MessageWithSender = {
  id: string;
  conversationId: string;
  senderId: string;
  sender: PublicUser;
  content: string | null;
  type: MessageType;
  mediaUrl: string | null;
  replyToId: string | null;
  replyTo?: {
    id: string;
    content: string | null;
    sender: {
      profile: {
        displayName: string;
      } | null;
    };
  } | null;
  isEdited: boolean;
  createdAt: Date;
  reactions: MessageReactionItem[];
};

export type ConversationParticipantInfo = {
  id: string;
  userId: string;
  user: PublicUser;
  role: ChatRole;
  lastReadAt: Date | null;
};

export type ConversationWithDetails = {
  id: string;
  type: ConversationType;
  name: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date | null;
  participants: ConversationParticipantInfo[];
  lastMessage?: MessageWithSender | null;
  unreadCount: number;
};

// ─── Spaces / Communities types ───────────────────────────────────────────────

export type SpaceChannelInfo = {
  id: string;
  spaceId: string;
  name: string;
  type: ChannelType;
  order: number;
};

export type SpaceWithDetails = {
  id: string;
  ownerId: string;
  owner?: PublicUser;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  type: SpaceType;
  category: string | null;
  rules: string[];
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
  channels: SpaceChannelInfo[];
  isJoined?: boolean;
  isOwner?: boolean;
  userRole?: SpaceRole | null;
};

// ─── Events types ─────────────────────────────────────────────────────────────

export type EventWithDetails = {
  id: string;
  creatorId: string;
  creator: PublicUser;
  spaceId: string | null;
  title: string;
  description: string | null;
  coverUrl: string | null;
  startAt: Date;
  endAt: Date | null;
  location: string | null;
  isOnline: boolean;
  meetingUrl: string | null;
  type: EventType;
  maxAttendees: number | null;
  createdAt: Date;
  _count: {
    rsvps: number;
  };
  isRsvpd?: boolean;
  userRsvpStatus?: RsvpStatus | null;
};

// ─── Bazaar & Marketplace / Tiers ─────────────────────────────────────────────

export type SellerTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

export type ListingWithSeller = {
  id: string;
  sellerId: string;
  seller: PublicUser & {
    salesCount?: number;
    rating?: number;
    sellerTier?: SellerTier;
  };
  title: string;
  description: string | null;
  price: number;
  category: ListingCategory;
  condition: ItemCondition;
  images: string[];
  location: string | null;
  status: ListingStatus;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  tag?: string;
  specs?: string;
  isSaved?: boolean;
  savesCount?: number;
};

// ─── Career & Skill Passport types ────────────────────────────────────────────

export type JobType = "Full-Time" | "Contract" | "Remote" | "Defense Bounty";

export type JobListingWithMatch = {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  type: JobType;
  salary: string;
  clearance?: string;
  matchScore: number;
  skills: string[];
  postedAt: string;
  featured?: boolean;
  description?: string;
  applied?: boolean;
};

export type SkillPassportData = {
  userId: string;
  name: string;
  handle: string;
  clearanceLevel: string;
  gpa: string;
  university: string;
  skills: { name: string; level: string; verifiedBy: string }[];
  bountiesCompleted: number;
  overallPercentile: number;
  signatureHash: string;
  issuedAt: Date;
};

// ─── Gaming & Esports types ───────────────────────────────────────────────────

export type GameRankTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND" | "MASTER" | "RADIANT";

export type TournamentStatus = "Live" | "Upcoming" | "Registration Open" | "Completed";

export type TournamentWithDetails = {
  id: string;
  game: string;
  gameIcon: string;
  title: string;
  prizePool: string;
  participants: number;
  maxParticipants: number;
  status: TournamentStatus;
  startsAt: string;
  organizer: string;
  isRegistered?: boolean;
  teamTag?: string;
};

export type EsportsClanRank = {
  rank: number;
  name: string;
  members: number;
  wins: number;
  winRate: string;
  badge: string;
  tag: string;
  university?: string;
};

// ─── Pages & Institutional types ──────────────────────────────────────────────

export type BusinessPageWithDetails = {
  id: string;
  name: string;
  handle: string;
  category: string;
  description: string;
  followers: number;
  isVerified: boolean;
  avatarImg: string;
  coverImg: string;
  website?: string;
  postsCount: number;
  isFollowing?: boolean;
  ownerId?: string;
};

// ─── AI Studio & VeritasLens types ────────────────────────────────────────────

export type AiTaskType = "CAPTION" | "HOOKS" | "HASHTAGS" | "STORY_PROMPT" | "REASONING";

export type AiGenerationResponse = {
  task: AiTaskType;
  result: string;
  hooks?: string[];
  hashtags?: string[];
  model: string;
  latencyMs: number;
};

export type FactCheckClaim = {
  claim: string;
  verdict: "VERIFIED" | "QUESTIONABLE" | "FABRICATED" | "MISLEADING";
  confidence: number;
  source: string;
  explanation: string;
};

export type FaceMeshTelemetry = {
  faceDetected: boolean;
  anomalyDetected: boolean;
  blinkRateNormal: boolean;
  lightingConsistent: boolean;
  frequencySpectrumPurity: number; // 0-100%
};

export type VeritasScanResult = {
  id: string;
  mediaUrl?: string;
  textClaim?: string;
  isAuthentic: boolean;
  deepfakeProbability: number; // 0-100%
  metadataIntegrity: number; // 0-100%
  factCheckStatus: "VERIFIED" | "QUESTIONABLE" | "FABRICATED" | "MISLEADING";
  claims: FactCheckClaim[];
  faceMesh: FaceMeshTelemetry;
  signatureHash: string;
  scannedAt: Date;
};

// ─── Comment types ────────────────────────────────────────────────────────────

export type CommentWithAuthor = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: PublicUser;
  parentId: string | null;
  _count?: { replies: number; reactions: number };
};

// ─── Notification types ───────────────────────────────────────────────────────

export type NotificationWithActor = {
  id: string;
  type: NotificationType;
  message: string | null;
  isRead: boolean;
  createdAt: Date;
  actorId: string | null;
  entityId: string | null;
  entityType: string | null;
  actor?: PublicUser | null;
};

// ─── Feed types ───────────────────────────────────────────────────────────────

export type FeedPage = {
  posts: PostWithDetails[];
  nextCursor: string | null;
  hasMore: boolean;
};

// ─── API response types ───────────────────────────────────────────────────────

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: string;
  code?: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
