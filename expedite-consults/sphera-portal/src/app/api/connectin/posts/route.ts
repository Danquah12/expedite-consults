import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"
import { recordGlobalUserActivity } from "@/lib/connectin-cloud-sync"

export async function GET(req: NextRequest) {
  try {
    const posts = connectinDb.getPosts()
    return NextResponse.json({ success: true, posts })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { authorId, authorName, authorEmail, authorHeadline, authorAvatar, content, feedCategory = "for_you", feedSubCategory, hashtags = [], mediaUrl } = body

    if (!content || !authorName) {
      return NextResponse.json({ error: "Content and author name are required" }, { status: 400 })
    }

    const post = connectinDb.createPost({
      authorId: authorId || "USR-MEMBER",
      authorName,
      authorHeadline: authorHeadline || "ConnectIn Member",
      authorAvatar: authorAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`,
      content,
      feedCategory,
      feedSubCategory,
      hashtags,
      mediaUrl
    })

    await recordGlobalUserActivity({
      id: `act_post_${post.id}`,
      userId: post.authorId,
      userName: authorName,
      userEmail: authorEmail || `${authorName.toLowerCase().replace(/\s+/g, ".")}@connectin.app`,
      userAvatar: post.authorAvatar,
      actionType: "POST_CREATED",
      actionLabel: `Published Post to ${feedSubCategory || feedCategory}`,
      category: "content",
      targetId: post.id,
      targetTitle: `Feed Post by ${authorName}`,
      details: String(content).slice(0, 160),
      timestampIso: new Date().toISOString()
    }).catch(() => {})

    return NextResponse.json({ success: true, post })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { postId, action, userName = "ConnectLn Member", userEmail = "" } = await req.json()
    if (!postId || action !== "like") {
      return NextResponse.json({ error: "Valid postId and action required" }, { status: 400 })
    }

    const liked = connectinDb.likePost(postId)
    await recordGlobalUserActivity({
      id: `act_like_${postId}_${Date.now().toString().slice(-5)}`,
      userName,
      userEmail: userEmail || `${userName.toLowerCase().replace(/\s+/g, ".")}@connectin.app`,
      actionType: "POST_LIKED",
      actionLabel: "Liked a Feed Post",
      category: "engagement",
      targetId: postId,
      targetTitle: `Post ${postId}`,
      details: `${userName} reacted to post ${postId}`,
      timestampIso: new Date().toISOString()
    }).catch(() => {})
    return NextResponse.json({ success: true, liked })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }
}
