import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"

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
    const { authorId, authorName, authorHeadline, authorAvatar, content, feedCategory = "for_you", feedSubCategory, hashtags = [], mediaUrl } = body

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

    return NextResponse.json({ success: true, post })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { postId, action } = await req.json()
    if (!postId || action !== "like") {
      return NextResponse.json({ error: "Valid postId and action required" }, { status: 400 })
    }

    const liked = connectinDb.likePost(postId)
    return NextResponse.json({ success: true, liked })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }
}
