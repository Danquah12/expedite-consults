import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"
import { recordGlobalUserActivity } from "@/lib/connectin-cloud-sync"
import {
  addConnectLnPostComment,
  deleteConnectLnSharedPost,
  FeedReactionKind,
  listConnectLnSharedPostsAndInteractions,
  PersistedPostComment,
  toggleConnectLnCommentLike,
  toggleConnectLnPostReaction,
  upsertConnectLnSharedPost,
} from "@/lib/connectln-mongodb"

export const dynamic = "force-dynamic"
export const revalidate = 0

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET() {
  try {
    const [{ posts: cloudPosts, interactions, mongoConnected }] = await Promise.all([
      listConnectLnSharedPostsAndInteractions(),
    ])
    const memoryPosts = connectinDb.getPosts()
    const seenIds = new Set(cloudPosts.map((p) => String(p.id)))
    const combinedPosts = [
      ...cloudPosts,
      ...memoryPosts.filter((mp) => mp?.id && !seenIds.has(String(mp.id))),
    ]

    return NextResponse.json(
      {
        success: true,
        posts: combinedPosts,
        interactions,
        mongoConnected,
      },
      { headers: { "Cache-Control": "no-store, max-age=0", ...CORS_HEADERS } }
    )
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const incomingFullPost = body?.post && typeof body.post === "object" ? body.post : null

    if (incomingFullPost) {
      const content = String(incomingFullPost.content || "").trim()
      const authorName = String(incomingFullPost?.author?.name || body?.authorName || "").trim()
      if (!content && !incomingFullPost.media && !incomingFullPost.poll && !incomingFullPost.document) {
        return NextResponse.json(
          { error: "Post content or media is required" },
          { status: 400, headers: CORS_HEADERS }
        )
      }
      if (!authorName) {
        return NextResponse.json(
          { error: "Author name is required" },
          { status: 400, headers: CORS_HEADERS }
        )
      }

      const persistedResult = await upsertConnectLnSharedPost({
        ...incomingFullPost,
        authorEmail:
          body?.authorEmail ||
          incomingFullPost.authorEmail ||
          incomingFullPost?.author?.email ||
          undefined,
      })

      const resolvedAvatar = String(persistedResult.post?.author?.avatar || "")
      connectinDb.createPost({
        authorId: String(persistedResult.post?.author?.id || "USR-MEMBER"),
        authorName,
        authorHeadline: String(persistedResult.post?.author?.headline || "ConnectLn Member"),
        authorAvatar: resolvedAvatar,
        content: content || String(incomingFullPost?.media?.title || "Shared a ConnectLn update"),
        feedCategory: incomingFullPost.feedCategory || "for_you",
        feedSubCategory: incomingFullPost.feedSubCategory,
        hashtags: Array.isArray(incomingFullPost.hashtags) ? incomingFullPost.hashtags : [],
        mediaUrl: incomingFullPost?.media?.url,
      })

      await recordGlobalUserActivity({
        id: `act_post_${persistedResult.post.id}`,
        userId: String(persistedResult.post?.author?.id || "USR-MEMBER"),
        userName: authorName,
        userEmail:
          persistedResult.post.authorEmail ||
          `${authorName.toLowerCase().replace(/\s+/g, ".")}@connectin.app`,
        userAvatar: resolvedAvatar,
        actionType: "POST_CREATED",
        actionLabel: `Published Post to ${incomingFullPost.feedSubCategory || incomingFullPost.feedCategory || "Feed"}`,
        category: "content",
        targetId: persistedResult.post.id,
        targetTitle: `Feed Post by ${authorName}`,
        details: (content || String(incomingFullPost?.media?.title || "")).slice(0, 160),
        timestampIso: new Date().toISOString(),
      }).catch(() => {})

      return NextResponse.json(
        {
          success: true,
          post: persistedResult.post,
          persisted: persistedResult.ok,
          mongoConnected: persistedResult.mongoConnected,
        },
        { headers: CORS_HEADERS }
      )
    }

    const {
      authorId,
      authorName: rawAuthorName,
      authorEmail,
      authorHeadline,
      authorRole,
      authorAvatar,
      content,
      feedCategory = "for_you",
      feedSubCategory,
      hashtags = [],
      tags = [],
      mediaUrl: rawMediaUrl,
      cardAttachment,
    } = body

    const authorName = String(
      rawAuthorName || cardAttachment?.senderName || "ConnectLn Keepsake"
    ).trim()
    const mediaUrl = rawMediaUrl || cardAttachment?.imageUrl

    if (!content || !authorName) {
      return NextResponse.json(
        { error: "Content and author name are required" },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const normalizedHashtags = Array.isArray(hashtags) && hashtags.length > 0
      ? hashtags
      : Array.isArray(tags)
      ? tags.map((t: unknown) => {
          const s = String(t || "").trim()
          return s.startsWith("#") ? s : `#${s}`
        })
      : []

    const headline = String(
      authorHeadline ||
        authorRole ||
        (cardAttachment?.occasion
          ? `${cardAttachment.occasion} · ConnectLn Keepsake Studio`
          : "ConnectLn Member")
    )
    const post = connectinDb.createPost({
      authorId: authorId || "USR-MEMBER",
      authorName,
      authorHeadline: headline,
      authorAvatar:
        authorAvatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`,
      content,
      feedCategory,
      feedSubCategory,
      hashtags: normalizedHashtags,
      mediaUrl,
    })

    const cloudPostId = `user_post_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    const persistedResult = await upsertConnectLnSharedPost({
      id: cloudPostId,
      isUserCreated: true,
      feedCategory,
      feedSubCategory: feedSubCategory || "All",
      authorEmail: authorEmail ? String(authorEmail).trim().toLowerCase() : undefined,
      author: {
        id: authorId || "USR-MEMBER",
        name: authorName,
        headline,
        avatar: post.authorAvatar,
        email: authorEmail ? String(authorEmail).trim().toLowerCase() : undefined,
        connectionDegree: "1st",
      },
      timestamp: "Just now · 🌐",
      visibility: "Public",
      content: String(content),
      hashtags: normalizedHashtags,
      postType: "standard",
      media: mediaUrl ? { type: "image", url: String(mediaUrl) } : undefined,
      stats: {
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
      },
      userReaction: null,
      comments: [],
    })

    await recordGlobalUserActivity({
      id: `act_post_${persistedResult.post.id}`,
      userId: post.authorId,
      userName: authorName,
      userEmail: authorEmail || `${authorName.toLowerCase().replace(/\s+/g, ".")}@connectin.app`,
      userAvatar: post.authorAvatar,
      actionType: "POST_CREATED",
      actionLabel: `Published Post to ${feedSubCategory || feedCategory}`,
      category: "content",
      targetId: persistedResult.post.id,
      targetTitle: `Feed Post by ${authorName}`,
      details: String(content).slice(0, 160),
      timestampIso: new Date().toISOString(),
    }).catch(() => {})

    return NextResponse.json(
      {
        success: true,
        post: persistedResult.post,
        persisted: persistedResult.ok,
        mongoConnected: persistedResult.mongoConnected,
      },
      { headers: CORS_HEADERS }
    )
  } catch {
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const postId = String(body?.postId || "").trim()
    const action = String(body?.action || "").trim()
    const userName = String(body?.userName || body?.author?.name || "ConnectLn Member").trim()
    const userEmail = String(body?.userEmail || body?.author?.email || "").trim().toLowerCase()
    const userId = String(body?.userId || "").trim()
    const userKey = userEmail || userId || userName || "member"

    if (!postId || !action) {
      return NextResponse.json({ error: "Valid postId and action required" }, { status: 400 })
    }

    if (action === "react" || action === "like") {
      const requestedReaction: FeedReactionKind | null =
        action === "like" && body?.reaction === undefined
          ? "like"
          : (body?.reaction ?? null)

      const { interaction, mongoConnected } = await toggleConnectLnPostReaction({
        postId,
        userKey,
        reaction: requestedReaction,
      })
      connectinDb.likePost(postId)

      await recordGlobalUserActivity({
        id: `act_like_${postId}_${Date.now().toString().slice(-5)}`,
        userName,
        userEmail: userEmail || `${userName.toLowerCase().replace(/\s+/g, ".")}@connectin.app`,
        actionType: requestedReaction ? "POST_LIKED" : "POST_UNLIKED",
        actionLabel: requestedReaction ? `Reacted (${requestedReaction}) to Feed Post` : "Removed Feed Reaction",
        category: "engagement",
        targetId: postId,
        targetTitle: `Post ${postId}`,
        details: `${userName} ${requestedReaction ? `reacted (${requestedReaction}) to` : "removed reaction from"} post ${postId}`,
        timestampIso: new Date().toISOString(),
      }).catch(() => {})

      return NextResponse.json({
        success: true,
        postId,
        liked: Boolean(requestedReaction),
        interaction,
        mongoConnected,
      })
    }

    if (action === "comment") {
      const content = String(body?.content || "").trim().slice(0, 2000)
      const parentCommentId = body?.parentCommentId ? String(body.parentCommentId).trim() : undefined
      if (!content) {
        return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
      }

      const authorObj = body?.author && typeof body.author === "object" ? body.author : {}
      const authorName = String(authorObj.name || userName || "ConnectLn Member").trim()
      const authorHeadline = String(authorObj.headline || "ConnectLn Professional").trim()
      const authorAvatar = String(authorObj.avatar || "")
      const authorEmail = String(authorObj.email || userEmail || "").trim().toLowerCase() || undefined
      const nowMs = Date.now()
      const nowTime = new Date(nowMs).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })

      const clientCommentId =
        typeof body?.commentId === "string" && /^c_[a-zA-Z0-9_-]{4,48}$/.test(body.commentId.trim())
          ? body.commentId.trim()
          : ""
      const newComment: PersistedPostComment = {
        id: clientCommentId || `c_${nowMs}_${Math.random().toString(36).slice(2, 6)}`,
        author: {
          name: authorName,
          headline: authorHeadline,
          avatar: authorAvatar,
          email: authorEmail,
          connectionDegree: "1st",
        },
        content,
        timestamp: `Today · ${nowTime}`,
        createdAtMs: nowMs,
        likesCount: 0,
        replies: [],
      }

      const { interaction, mongoConnected } = await addConnectLnPostComment({
        postId,
        comment: newComment,
        parentCommentId,
      })

      await recordGlobalUserActivity({
        id: `act_cmt_${postId}_${nowMs.toString().slice(-5)}`,
        userName: authorName,
        userEmail: authorEmail || `${authorName.toLowerCase().replace(/\s+/g, ".")}@connectin.app`,
        actionType: parentCommentId ? "COMMENT_REPLIED" : "POST_COMMENTED",
        actionLabel: parentCommentId ? "Replied to a Feed Comment" : "Commented on a Feed Post",
        category: "engagement",
        targetId: postId,
        targetTitle: `Post ${postId}`,
        details: `${authorName}: "${content.slice(0, 140)}"`,
        timestampIso: new Date(nowMs).toISOString(),
      }).catch(() => {})

      return NextResponse.json({
        success: true,
        postId,
        comment: newComment,
        interaction,
        mongoConnected,
      })
    }

    if (action === "like_comment") {
      const commentId = String(body?.commentId || "").trim()
      if (!commentId) {
        return NextResponse.json({ error: "Valid commentId is required" }, { status: 400 })
      }
      const { interaction, mongoConnected } = await toggleConnectLnCommentLike({
        postId,
        commentId,
        userKey,
      })
      return NextResponse.json({
        success: true,
        postId,
        commentId,
        interaction,
        mongoConnected,
      })
    }

    return NextResponse.json({ error: "Unsupported post patch action" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = String(searchParams.get("id") || "").trim()
    if (!id) {
      return NextResponse.json({ error: "Post id is required" }, { status: 400 })
    }
    const deleted = await deleteConnectLnSharedPost(id)
    return NextResponse.json({ success: true, deleted, deletedId: id })
  } catch {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
