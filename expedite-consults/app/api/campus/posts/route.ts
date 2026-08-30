// app/api/campus/posts/route.ts
import { NextResponse } from "next/server";
import { initialCampusPosts, CampusPost } from "@/lib/campus-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  let posts = [...initialCampusPosts];
  if (scope && scope !== "ALL") {
    posts = posts.filter((p) => p.scope === scope);
  }

  return NextResponse.json({
    success: true,
    count: posts.length,
    posts,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, scope, location, imageUrl } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Post content is required" },
        { status: 400 }
      );
    }

    const newPost: CampusPost = {
      id: `p-${Date.now()}`,
      authorId: "usr-alex-rivera",
      authorName: "Alex Rivera",
      authorMajor: "Computer Science • Class of 2027",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      scope: scope || "CAMPUS_WIDE",
      location: location || "Student Union Quad",
      content: content.trim(),
      imageUrl: imageUrl?.trim() || undefined,
      likesCount: 1,
      isLiked: true,
      commentsCount: 0,
      comments: [],
      timeAgo: "Just now",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid post payload" },
      { status: 500 }
    );
  }
}
