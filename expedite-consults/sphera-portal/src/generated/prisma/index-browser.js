
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  emailVerified: 'emailVerified',
  phone: 'phone',
  phoneVerified: 'phoneVerified',
  passwordHash: 'passwordHash',
  mfaEnabled: 'mfaEnabled',
  mfaSecret: 'mfaSecret',
  role: 'role',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  username: 'username',
  displayName: 'displayName',
  bio: 'bio',
  avatar: 'avatar',
  coverPhoto: 'coverPhoto',
  location: 'location',
  website: 'website',
  birthDate: 'birthDate',
  gender: 'gender',
  pronouns: 'pronouns',
  isVerified: 'isVerified',
  verifiedType: 'verifiedType',
  skills: 'skills',
  interests: 'interests',
  profileVisibility: 'profileVisibility',
  postVisibility: 'postVisibility',
  messagePermission: 'messagePermission',
  searchable: 'searchable',
  joinedAt: 'joinedAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PersonaScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  name: 'name',
  avatar: 'avatar',
  bio: 'bio',
  isActive: 'isActive',
  data: 'data',
  createdAt: 'createdAt'
};

exports.Prisma.WorkExperienceScalarFieldEnum = {
  id: 'id',
  profileId: 'profileId',
  company: 'company',
  role: 'role',
  startDate: 'startDate',
  endDate: 'endDate',
  current: 'current',
  description: 'description'
};

exports.Prisma.EducationScalarFieldEnum = {
  id: 'id',
  profileId: 'profileId',
  school: 'school',
  degree: 'degree',
  field: 'field',
  startYear: 'startYear',
  endYear: 'endYear',
  current: 'current'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.FriendshipScalarFieldEnum = {
  id: 'id',
  senderId: 'senderId',
  receiverId: 'receiverId',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FollowScalarFieldEnum = {
  id: 'id',
  followerId: 'followerId',
  followingId: 'followingId',
  createdAt: 'createdAt'
};

exports.Prisma.BlockScalarFieldEnum = {
  id: 'id',
  blockerId: 'blockerId',
  blockedId: 'blockedId',
  createdAt: 'createdAt'
};

exports.Prisma.MuteScalarFieldEnum = {
  id: 'id',
  muterId: 'muterId',
  mutedId: 'mutedId',
  createdAt: 'createdAt'
};

exports.Prisma.PostScalarFieldEnum = {
  id: 'id',
  authorId: 'authorId',
  type: 'type',
  content: 'content',
  mediaUrls: 'mediaUrls',
  linkUrl: 'linkUrl',
  linkMeta: 'linkMeta',
  visibility: 'visibility',
  spaceId: 'spaceId',
  pageId: 'pageId',
  isPinned: 'isPinned',
  isSponsored: 'isSponsored',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.CommentScalarFieldEnum = {
  id: 'id',
  postId: 'postId',
  authorId: 'authorId',
  parentId: 'parentId',
  content: 'content',
  mediaUrl: 'mediaUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.ReactionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  postId: 'postId',
  commentId: 'commentId',
  type: 'type',
  createdAt: 'createdAt'
};

exports.Prisma.SaveScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  postId: 'postId',
  createdAt: 'createdAt'
};

exports.Prisma.ShareScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  postId: 'postId',
  message: 'message',
  createdAt: 'createdAt'
};

exports.Prisma.HashtagScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt'
};

exports.Prisma.PostHashtagScalarFieldEnum = {
  postId: 'postId',
  hashtagId: 'hashtagId'
};

exports.Prisma.MediaScalarFieldEnum = {
  id: 'id',
  ownerId: 'ownerId',
  url: 'url',
  type: 'type',
  size: 'size',
  mimeType: 'mimeType',
  width: 'width',
  height: 'height',
  duration: 'duration',
  alt: 'alt',
  createdAt: 'createdAt'
};

exports.Prisma.VideoScalarFieldEnum = {
  id: 'id',
  authorId: 'authorId',
  url: 'url',
  thumbnailUrl: 'thumbnailUrl',
  duration: 'duration',
  caption: 'caption',
  music: 'music',
  hashtags: 'hashtags',
  isReel: 'isReel',
  muxAssetId: 'muxAssetId',
  muxPlaybackId: 'muxPlaybackId',
  status: 'status',
  views: 'views',
  likes: 'likes',
  shares: 'shares',
  saves: 'saves',
  createdAt: 'createdAt'
};

exports.Prisma.StoryScalarFieldEnum = {
  id: 'id',
  authorId: 'authorId',
  mediaUrl: 'mediaUrl',
  mediaType: 'mediaType',
  caption: 'caption',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.StoryViewScalarFieldEnum = {
  id: 'id',
  storyId: 'storyId',
  viewerId: 'viewerId',
  viewedAt: 'viewedAt'
};

exports.Prisma.ConversationScalarFieldEnum = {
  id: 'id',
  type: 'type',
  name: 'name',
  avatarUrl: 'avatarUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastMessageAt: 'lastMessageAt'
};

exports.Prisma.ConversationParticipantScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  userId: 'userId',
  role: 'role',
  joinedAt: 'joinedAt',
  lastReadAt: 'lastReadAt'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  senderId: 'senderId',
  content: 'content',
  type: 'type',
  mediaUrl: 'mediaUrl',
  replyToId: 'replyToId',
  isEdited: 'isEdited',
  deletedAt: 'deletedAt',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.MessageReactionScalarFieldEnum = {
  id: 'id',
  messageId: 'messageId',
  userId: 'userId',
  emoji: 'emoji',
  createdAt: 'createdAt'
};

exports.Prisma.SpaceScalarFieldEnum = {
  id: 'id',
  ownerId: 'ownerId',
  name: 'name',
  slug: 'slug',
  description: 'description',
  avatarUrl: 'avatarUrl',
  coverUrl: 'coverUrl',
  type: 'type',
  category: 'category',
  rules: 'rules',
  memberCount: 'memberCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SpaceMemberScalarFieldEnum = {
  id: 'id',
  spaceId: 'spaceId',
  userId: 'userId',
  role: 'role',
  joinedAt: 'joinedAt'
};

exports.Prisma.SpaceChannelScalarFieldEnum = {
  id: 'id',
  spaceId: 'spaceId',
  name: 'name',
  type: 'type',
  order: 'order'
};

exports.Prisma.ListingScalarFieldEnum = {
  id: 'id',
  sellerId: 'sellerId',
  title: 'title',
  description: 'description',
  price: 'price',
  category: 'category',
  condition: 'condition',
  images: 'images',
  location: 'location',
  lat: 'lat',
  lng: 'lng',
  status: 'status',
  views: 'views',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  buyerId: 'buyerId',
  sellerId: 'sellerId',
  amount: 'amount',
  status: 'status',
  note: 'note',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SellerReviewScalarFieldEnum = {
  id: 'id',
  sellerId: 'sellerId',
  buyerId: 'buyerId',
  listingId: 'listingId',
  rating: 'rating',
  comment: 'comment',
  createdAt: 'createdAt'
};

exports.Prisma.EventScalarFieldEnum = {
  id: 'id',
  creatorId: 'creatorId',
  spaceId: 'spaceId',
  title: 'title',
  description: 'description',
  coverUrl: 'coverUrl',
  startAt: 'startAt',
  endAt: 'endAt',
  location: 'location',
  isOnline: 'isOnline',
  meetingUrl: 'meetingUrl',
  type: 'type',
  maxAttendees: 'maxAttendees',
  createdAt: 'createdAt'
};

exports.Prisma.EventRsvpScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  userId: 'userId',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.PageScalarFieldEnum = {
  id: 'id',
  ownerId: 'ownerId',
  name: 'name',
  handle: 'handle',
  type: 'type',
  description: 'description',
  avatarUrl: 'avatarUrl',
  coverUrl: 'coverUrl',
  website: 'website',
  phone: 'phone',
  email: 'email',
  isVerified: 'isVerified',
  followerCount: 'followerCount',
  createdAt: 'createdAt'
};

exports.Prisma.PageFollowScalarFieldEnum = {
  id: 'id',
  pageId: 'pageId',
  userId: 'userId',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  actorId: 'actorId',
  entityId: 'entityId',
  entityType: 'entityType',
  message: 'message',
  isRead: 'isRead',
  createdAt: 'createdAt'
};

exports.Prisma.AlertSubscriptionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  conditions: 'conditions',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.ReputationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  socialScore: 'socialScore',
  creatorScore: 'creatorScore',
  sellerScore: 'sellerScore',
  proScore: 'proScore',
  communityScore: 'communityScore',
  updatedAt: 'updatedAt'
};

exports.Prisma.BadgeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  label: 'label',
  awardedAt: 'awardedAt'
};

exports.Prisma.ReportScalarFieldEnum = {
  id: 'id',
  reporterId: 'reporterId',
  entityId: 'entityId',
  entityType: 'entityType',
  reason: 'reason',
  details: 'details',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserRole = exports.$Enums.UserRole = {
  USER: 'USER',
  CREATOR: 'CREATOR',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN'
};

exports.UserStatus = exports.$Enums.UserStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED',
  DEACTIVATED: 'DEACTIVATED'
};

exports.Visibility = exports.$Enums.Visibility = {
  PUBLIC: 'PUBLIC',
  FRIENDS: 'FRIENDS',
  PRIVATE: 'PRIVATE'
};

exports.PersonaType = exports.$Enums.PersonaType = {
  PERSONAL: 'PERSONAL',
  PROFESSIONAL: 'PROFESSIONAL',
  CREATOR: 'CREATOR',
  SELLER: 'SELLER',
  GAMING: 'GAMING'
};

exports.FriendshipStatus = exports.$Enums.FriendshipStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  WITHDRAWN: 'WITHDRAWN'
};

exports.PostType = exports.$Enums.PostType = {
  TEXT: 'TEXT',
  PHOTO: 'PHOTO',
  VIDEO: 'VIDEO',
  REEL: 'REEL',
  POLL: 'POLL',
  EVENT: 'EVENT',
  LINK: 'LINK',
  PRODUCT: 'PRODUCT',
  JOB: 'JOB'
};

exports.ReactionType = exports.$Enums.ReactionType = {
  LIKE: 'LIKE',
  LOVE: 'LOVE',
  HAHA: 'HAHA',
  WOW: 'WOW',
  SAD: 'SAD',
  ANGRY: 'ANGRY',
  CELEBRATE: 'CELEBRATE',
  SUPPORT: 'SUPPORT'
};

exports.MediaType = exports.$Enums.MediaType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  DOCUMENT: 'DOCUMENT',
  GIF: 'GIF'
};

exports.ConversationType = exports.$Enums.ConversationType = {
  DM: 'DM',
  GROUP: 'GROUP',
  SPACE_CHANNEL: 'SPACE_CHANNEL'
};

exports.ChatRole = exports.$Enums.ChatRole = {
  MEMBER: 'MEMBER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR'
};

exports.MessageType = exports.$Enums.MessageType = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  FILE: 'FILE',
  GIF: 'GIF',
  SYSTEM: 'SYSTEM'
};

exports.SpaceType = exports.$Enums.SpaceType = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  CAMPUS: 'CAMPUS',
  PROFESSIONAL: 'PROFESSIONAL',
  GAMING: 'GAMING',
  NEIGHBORHOOD: 'NEIGHBORHOOD',
  ALUMNI: 'ALUMNI'
};

exports.SpaceRole = exports.$Enums.SpaceRole = {
  MEMBER: 'MEMBER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
  OWNER: 'OWNER'
};

exports.ChannelType = exports.$Enums.ChannelType = {
  TEXT: 'TEXT',
  VOICE: 'VOICE',
  ANNOUNCEMENTS: 'ANNOUNCEMENTS',
  MEDIA: 'MEDIA'
};

exports.ListingCategory = exports.$Enums.ListingCategory = {
  ELECTRONICS: 'ELECTRONICS',
  CLOTHING: 'CLOTHING',
  FURNITURE: 'FURNITURE',
  VEHICLES: 'VEHICLES',
  HOUSING: 'HOUSING',
  BOOKS: 'BOOKS',
  SERVICES: 'SERVICES',
  TICKETS: 'TICKETS',
  HANDMADE: 'HANDMADE',
  DIGITAL: 'DIGITAL',
  FOOD: 'FOOD',
  OTHER: 'OTHER'
};

exports.ItemCondition = exports.$Enums.ItemCondition = {
  NEW: 'NEW',
  USED_LIKE_NEW: 'USED_LIKE_NEW',
  USED_GOOD: 'USED_GOOD',
  USED_FAIR: 'USED_FAIR',
  FOR_PARTS: 'FOR_PARTS'
};

exports.ListingStatus = exports.$Enums.ListingStatus = {
  ACTIVE: 'ACTIVE',
  SOLD: 'SOLD',
  PENDING: 'PENDING',
  ARCHIVED: 'ARCHIVED'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED'
};

exports.EventType = exports.$Enums.EventType = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  CAMPUS: 'CAMPUS',
  PROFESSIONAL: 'PROFESSIONAL'
};

exports.RsvpStatus = exports.$Enums.RsvpStatus = {
  GOING: 'GOING',
  INTERESTED: 'INTERESTED',
  NOT_GOING: 'NOT_GOING'
};

exports.PageType = exports.$Enums.PageType = {
  BUSINESS: 'BUSINESS',
  CREATOR: 'CREATOR',
  NONPROFIT: 'NONPROFIT',
  UNIVERSITY: 'UNIVERSITY',
  GOVERNMENT: 'GOVERNMENT',
  COMMUNITY: 'COMMUNITY'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  FRIEND_REQUEST: 'FRIEND_REQUEST',
  FRIEND_ACCEPTED: 'FRIEND_ACCEPTED',
  POST_LIKE: 'POST_LIKE',
  POST_COMMENT: 'POST_COMMENT',
  POST_SHARE: 'POST_SHARE',
  COMMENT_REPLY: 'COMMENT_REPLY',
  COMMENT_LIKE: 'COMMENT_LIKE',
  FOLLOW: 'FOLLOW',
  MESSAGE: 'MESSAGE',
  SPACE_INVITE: 'SPACE_INVITE',
  SPACE_POST: 'SPACE_POST',
  MARKETPLACE_INQUIRY: 'MARKETPLACE_INQUIRY',
  ORDER_UPDATE: 'ORDER_UPDATE',
  EVENT_INVITE: 'EVENT_INVITE',
  MENTION: 'MENTION',
  ALERT_MATCH: 'ALERT_MATCH',
  SYSTEM: 'SYSTEM'
};

exports.ReportReason = exports.$Enums.ReportReason = {
  SPAM: 'SPAM',
  HARASSMENT: 'HARASSMENT',
  HATE_SPEECH: 'HATE_SPEECH',
  VIOLENCE: 'VIOLENCE',
  NUDITY: 'NUDITY',
  MISINFORMATION: 'MISINFORMATION',
  SCAM: 'SCAM',
  COPYRIGHT: 'COPYRIGHT',
  OTHER: 'OTHER'
};

exports.ReportStatus = exports.$Enums.ReportStatus = {
  PENDING: 'PENDING',
  REVIEWING: 'REVIEWING',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED'
};

exports.Prisma.ModelName = {
  User: 'User',
  Profile: 'Profile',
  Persona: 'Persona',
  WorkExperience: 'WorkExperience',
  Education: 'Education',
  Account: 'Account',
  Session: 'Session',
  VerificationToken: 'VerificationToken',
  Friendship: 'Friendship',
  Follow: 'Follow',
  Block: 'Block',
  Mute: 'Mute',
  Post: 'Post',
  Comment: 'Comment',
  Reaction: 'Reaction',
  Save: 'Save',
  Share: 'Share',
  Hashtag: 'Hashtag',
  PostHashtag: 'PostHashtag',
  Media: 'Media',
  Video: 'Video',
  Story: 'Story',
  StoryView: 'StoryView',
  Conversation: 'Conversation',
  ConversationParticipant: 'ConversationParticipant',
  Message: 'Message',
  MessageReaction: 'MessageReaction',
  Space: 'Space',
  SpaceMember: 'SpaceMember',
  SpaceChannel: 'SpaceChannel',
  Listing: 'Listing',
  Order: 'Order',
  SellerReview: 'SellerReview',
  Event: 'Event',
  EventRsvp: 'EventRsvp',
  Page: 'Page',
  PageFollow: 'PageFollow',
  Notification: 'Notification',
  AlertSubscription: 'AlertSubscription',
  Reputation: 'Reputation',
  Badge: 'Badge',
  Report: 'Report'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
