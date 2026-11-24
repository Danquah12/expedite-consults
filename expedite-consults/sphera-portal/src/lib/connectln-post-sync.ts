import type { Comment, Post, ReactionType, UserProfile } from "./connectln-data"
import type { PersistedPostComment, PersistedPostInteractionDoc } from "./connectln-mongodb"

export interface PostBaselineSnapshot {
  likesCount: number
  commentsCount: number
  reactionsBreakdown: Record<ReactionType, number>
  baseCommentIds: string[]
  commentBaseLikes: Record<string, number>
}

export function encodeClientUserKey(raw: string): string {
  const clean = String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 96)
  return clean || "member"
}

export function sanitizeClientMapKey(raw: string): string {
  const clean = String(raw || "")
    .trim()
    .replace(/[.$]/g, "_")
    .slice(0, 120)
  return clean || "item"
}

export function getCurrentUserReactionKey(
  user?: { email?: string; id?: string; name?: string } | null
): string {
  return encodeClientUserKey(user?.email || user?.id || user?.name || "member")
}

export function isPostOwnedByCurrentUser(
  post: Partial<Post>,
  user?: Partial<UserProfile> | null
): boolean {
  if (!post || !user) return false
  const myEmail = String(user.email || "").trim().toLowerCase()
  const myName = String(user.name || "").trim().toLowerCase()
  const myId = String(user.id || "").trim()

  const postEmail = String(post.authorEmail || post.author?.email || "").trim().toLowerCase()
  const postName = String(post.author?.name || "").trim().toLowerCase()
  const postAuthorId = String(post.author?.id || "").trim()

  if (myEmail && postEmail) return myEmail === postEmail
  if (post.isCloudSharedPost) {
    return Boolean(
      (myId && postAuthorId && myId === postAuthorId && postAuthorId !== "USR-MEMBER") ||
        (myName && postName && myName === postName)
    )
  }
  return post.author?.connectionDegree === "You" || Boolean(post.isUserCreated)
}

function captureBaseline(
  post: Post,
  baselineMap: Map<string, PostBaselineSnapshot>
): PostBaselineSnapshot {
  const existing = baselineMap.get(post.id)
  if (existing) return existing

  const commentBaseLikes: Record<string, number> = {}
  for (const c of post.comments || []) {
    commentBaseLikes[c.id] = Number(c.likesCount || 0)
    for (const r of c.replies || []) {
      commentBaseLikes[r.id] = Number(r.likesCount || 0)
    }
  }

  const snap: PostBaselineSnapshot = {
    likesCount: Number(post.stats?.likesCount || 0),
    commentsCount: Number(post.stats?.commentsCount || 0),
    reactionsBreakdown: {
      like: Number(post.stats?.reactionsBreakdown?.like || 0),
      celebrate: Number(post.stats?.reactionsBreakdown?.celebrate || 0),
      support: Number(post.stats?.reactionsBreakdown?.support || 0),
      love: Number(post.stats?.reactionsBreakdown?.love || 0),
      insightful: Number(post.stats?.reactionsBreakdown?.insightful || 0),
      funny: Number(post.stats?.reactionsBreakdown?.funny || 0),
    },
    baseCommentIds: (post.comments || []).map((c) => c.id),
    commentBaseLikes,
  }
  baselineMap.set(post.id, snap)
  return snap
}

function toClientComment(
  raw: PersistedPostComment,
  isMine: boolean
): Comment {
  return {
    id: String(raw.id),
    author: {
      name: String(raw.author?.name || "ConnectLn Member"),
      headline: String(raw.author?.headline || "ConnectLn Professional"),
      avatar:
        raw.author?.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          raw.author?.name || "ConnectLn Member"
        )}&backgroundColor=0a66c2`,
      email: raw.author?.email,
      connectionDegree: isMine ? "You" : raw.author?.connectionDegree || "1st",
    },
    content: String(raw.content || ""),
    timestamp: String(raw.timestamp || "Just now"),
    createdAtMs: Number(raw.createdAtMs || 0),
    likesCount: Number(raw.likesCount || 0),
    isLiked: false,
    replies: Array.isArray(raw.replies)
      ? raw.replies.map((r) => toClientComment(r, false))
      : [],
  }
}

export function applyInteractionToPost(
  post: Post,
  doc: PersistedPostInteractionDoc | undefined,
  baselineMap: Map<string, PostBaselineSnapshot>,
  myKey: string,
  myEmail: string,
  myName: string
): Post {
  const base = captureBaseline(post, baselineMap)
  if (!doc) return post

  // 1. Reactions
  const cloudCounts: Record<ReactionType, number> = {
    like: 0,
    celebrate: 0,
    support: 0,
    love: 0,
    insightful: 0,
    funny: 0,
  }
  let totalCloudReactions = 0
  for (const reaction of Object.values(doc.reactionsByUser || {})) {
    if (reaction in cloudCounts) {
      cloudCounts[reaction as ReactionType] += 1
      totalCloudReactions += 1
    }
  }

  const mergedBreakdown: Record<ReactionType, number> = {
    like: base.reactionsBreakdown.like + cloudCounts.like,
    celebrate: base.reactionsBreakdown.celebrate + cloudCounts.celebrate,
    support: base.reactionsBreakdown.support + cloudCounts.support,
    love: base.reactionsBreakdown.love + cloudCounts.love,
    insightful: base.reactionsBreakdown.insightful + cloudCounts.insightful,
    funny: base.reactionsBreakdown.funny + cloudCounts.funny,
  }
  const mergedLikesCount = Math.max(0, base.likesCount + totalCloudReactions)
  const myReaction = (doc.reactionsByUser?.[myKey] as ReactionType | undefined) ?? null

  // 2. Comments & replies
  const cloudComments = Array.isArray(doc.comments) ? doc.comments : []
  const existingBaseComments = (post.comments || []).filter((c) =>
    base.baseCommentIds.includes(c.id)
  )

  const commentMap = new Map<string, Comment>()
  for (const cc of cloudComments) {
    const ccEmail = String(cc.author?.email || "").trim().toLowerCase()
    const ccName = String(cc.author?.name || "").trim().toLowerCase()
    const mine = Boolean(
      (myEmail && ccEmail && myEmail === ccEmail) ||
        (!ccEmail && myName && ccName && myName === ccName)
    )
    commentMap.set(cc.id, toClientComment(cc, mine))
  }
  for (const bc of existingBaseComments) {
    if (!commentMap.has(bc.id)) {
      commentMap.set(bc.id, {
        ...bc,
        likesCount: base.commentBaseLikes[bc.id] ?? Number(bc.likesCount || 0),
        replies: Array.isArray(bc.replies) ? [...bc.replies] : [],
      })
    }
  }

  const orderedIds = [
    ...cloudComments.map((c) => c.id),
    ...existingBaseComments.map((c) => c.id).filter((id) => !cloudComments.some((c) => c.id === id)),
  ]
  const seenOrdered = new Set<string>()
  const mergedComments: Comment[] = []

  for (const cid of orderedIds) {
    if (seenOrdered.has(cid)) continue
    seenOrdered.add(cid)
    const commentObj = commentMap.get(cid)
    if (!commentObj) continue

    const safeCid = sanitizeClientMapKey(cid)
    const likers = Array.isArray(doc.commentLikesById?.[safeCid])
      ? doc.commentLikesById[safeCid]
      : []
    const baseLikes = base.commentBaseLikes[cid] ?? Number(commentObj.likesCount || 0)

    const cloudReplies = Array.isArray(doc.repliesByParentId?.[safeCid])
      ? doc.repliesByParentId[safeCid]
      : []
    const existingReplies = Array.isArray(commentObj.replies) ? commentObj.replies : []
    const replyMap = new Map<string, Comment>()
    for (const er of existingReplies) {
      replyMap.set(er.id, er)
    }
    for (const cr of cloudReplies) {
      const crEmail = String(cr.author?.email || "").trim().toLowerCase()
      const crName = String(cr.author?.name || "").trim().toLowerCase()
      const mine = Boolean(
        (myEmail && crEmail && myEmail === crEmail) ||
          (!crEmail && myName && crName && myName === crName)
      )
      replyMap.set(cr.id, toClientComment(cr, mine))
    }

    mergedComments.push({
      ...commentObj,
      likesCount: baseLikes + likers.length,
      isLiked: likers.includes(myKey),
      replies: Array.from(replyMap.values()),
    })
  }

  const extraCloudTopLevelCount = cloudComments.filter(
    (c) => !base.baseCommentIds.includes(c.id)
  ).length

  return {
    ...post,
    userReaction: myReaction,
    stats: {
      ...post.stats,
      likesCount: mergedLikesCount,
      commentsCount: Math.max(
        base.commentsCount + extraCloudTopLevelCount,
        mergedComments.length
      ),
      reactionsBreakdown: mergedBreakdown,
    },
    comments: mergedComments,
  }
}

export function mergeCloudPostsAndInteractions(params: {
  localPosts: Post[]
  cloudPosts: Record<string, any>[]
  interactions: Record<string, PersistedPostInteractionDoc>
  baselineMap: Map<string, PostBaselineSnapshot>
  currentUser: UserProfile
  skipPostIds?: Set<string>
}): Post[] {
  const { localPosts, cloudPosts, interactions, baselineMap, currentUser, skipPostIds } = params
  const myKey = getCurrentUserReactionKey(currentUser)
  const myEmail = String(currentUser.email || "").trim().toLowerCase()
  const myName = String(currentUser.name || "").trim().toLowerCase()

  const localById = new Map<string, Post>()
  for (const lp of localPosts) {
    if (lp?.id) localById.set(lp.id, lp)
  }

  const normalizedCloudPosts: Post[] = []
  const seenCloudIds = new Set<string>()
  for (const raw of cloudPosts) {
    if (!raw || !raw.id) continue
    const pid = String(raw.id)
    if (seenCloudIds.has(pid)) continue
    seenCloudIds.add(pid)

    const existingLocal = localById.get(pid)
    const ownedByMe = isPostOwnedByCurrentUser(raw as Partial<Post>, currentUser)
    const normalizedAuthor = {
      id: String(raw?.author?.id || "USR-MEMBER"),
      name: String(raw?.author?.name || "ConnectLn Member"),
      headline: String(raw?.author?.headline || "ConnectLn Professional"),
      avatar:
        raw?.author?.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          raw?.author?.name || "ConnectLn Member"
        )}&backgroundColor=0a66c2`,
      email: raw?.author?.email || raw?.authorEmail,
      connectionDegree: (ownedByMe ? "You" : "1st") as Post["author"]["connectionDegree"],
      isFollowing: Boolean(raw?.author?.isFollowing),
    }

    const baseStats = raw?.stats || existingLocal?.stats || {
      likesCount: 0,
      commentsCount: 0,
      repostsCount: 0,
      reactionsBreakdown: {
        like: 0,
        celebrate: 0,
        support: 0,
        love: 0,
        insightful: 0,
        funny: 0,
      },
    }

    normalizedCloudPosts.push({
      ...(existingLocal || {}),
      ...(raw as Post),
      id: pid,
      isCloudSharedPost: true,
      isUserCreated: ownedByMe || Boolean(raw?.isUserCreated),
      author: normalizedAuthor,
      timestamp: String(raw?.timestamp || existingLocal?.timestamp || "Recently"),
      visibility: raw?.visibility === "Connections" ? "Connections" : "Public",
      content: String(raw?.content || existingLocal?.content || ""),
      stats: baseStats,
      comments: Array.isArray(raw?.comments)
        ? raw.comments
        : existingLocal?.comments || [],
    })
  }

  // Put newly shared cloud posts from community + own cloud posts cleanly ahead of remaining seeded feed posts,
  // preserving existing order for seeded/harvested items without duplicating IDs.
  const combined: Post[] = []
  const emitted = new Set<string>()

  // 1. Existing local user-created posts not yet in cloud
  for (const lp of localPosts) {
    if (!lp?.id || emitted.has(lp.id)) continue
    if (!seenCloudIds.has(lp.id) && (lp.isUserCreated || lp.author?.connectionDegree === "You")) {
      emitted.add(lp.id)
      combined.push(lp)
    }
  }

  // 2. Cloud shared posts (newest first)
  for (const cp of normalizedCloudPosts) {
    if (emitted.has(cp.id)) continue
    emitted.add(cp.id)
    combined.push(cp)
  }

  // 3. All remaining local/seeded/harvested posts in original order
  for (const lp of localPosts) {
    if (!lp?.id || emitted.has(lp.id)) continue
    emitted.add(lp.id)
    combined.push(lp)
  }

  return combined.map((p) => {
    if (skipPostIds?.has(p.id)) {
      captureBaseline(p, baselineMap)
      return p
    }
    return applyInteractionToPost(p, interactions[p.id], baselineMap, myKey, myEmail, myName)
  })
}
