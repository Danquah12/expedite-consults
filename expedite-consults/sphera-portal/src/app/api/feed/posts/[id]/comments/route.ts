import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getOrCreateDefaultUser } from "@/lib/db-seed";
import { feedStore, CommentItem } from "@/lib/feed-store";

export const dynamic = "force-dynamic";

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const commentsFromDb = await db.comment.findMany({
      where: { postId: id, deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: { author: { include: { profile: true } } },
    }).catch(() => []);

    if (commentsFromDb.length > 0) {
      const comments: CommentItem[] = commentsFromDb.map((c) => ({
        id: c.id,
        user: c.author.profile?.displayName || "Sphera User",
        username: c.author.profile?.username || "user",
        avatar: c.author.profile?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
        text: c.content,
        time: formatTimeAgo(c.createdAt),
        likes: 0,
      }));

      return NextResponse.json({
        success: true,
        comments,
        count: comments.length,
      });
    }

    const posts = feedStore.getPosts();
    const post = posts.find((p) => p.id === id);

    return NextResponse.json({
      success: true,
      comments: post?.commentsList || [],
      count: post?.commentsCount || 0,
    });
  } catch (error) {
    console.error("[GET /api/feed/posts/[id]/comments]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { text, user: userName = "Kwesi Asiedu", username = "kwesi" } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ success: false, error: "Comment text required" }, { status: 400 });
    }

    let user: any = null;
    try {
      const session = await auth();
      if (session?.user?.id) {
        user = await db.user.findUnique({
          where: { id: session.user.id },
          include: { profile: true },
        });
      }
    } catch {}

    if (!user) {
      user = await getOrCreateDefaultUser(username || "kwesi");
    }

    if (user?.id) {
      const newComment = await db.comment.create({
        data: {
          postId: id,
          authorId: user.id,
          content: text.trim(),
        },
        include: {
          author: { include: { profile: true } },
        },
      });

      const mappedComment: CommentItem = {
        id: newComment.id,
        user: newComment.author.profile?.displayName || userName,
        username: newComment.author.profile?.username || username,
        avatar: newComment.author.profile?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
        text: newComment.content,
        time: "Just now",
        likes: 0,
      };

      feedStore.addComment(id, text, userName, username);

      return NextResponse.json({
        success: true,
        comment: mappedComment,
      }, { status: 201 });
    }

    const fallbackComment = feedStore.addComment(id, text, userName, username);
    return NextResponse.json({
      success: true,
      comment: fallbackComment,
    }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/feed/posts/[id]/comments]", error);
    return NextResponse.json({ success: false, error: "Failed to add comment" }, { status: 500 });
  }
}
