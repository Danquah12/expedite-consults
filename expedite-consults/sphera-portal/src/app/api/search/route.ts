import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/search?q=...&type=all|users|posts|hashtags
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";
    const type = searchParams.get("type") ?? "all";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 30);

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ success: true, data: { users: [], posts: [], hashtags: [] } });
    }

    const term = q.trim();

    const profileSelect = {
      username: true,
      displayName: true,
      avatar: true,
      bio: true,
      isVerified: true,
      profileVisibility: true,
    } as const;

    const [users, posts, hashtags] = await Promise.all([
      // Users — search by profile username or displayName
      type === "posts" || type === "hashtags"
        ? []
        : db.user.findMany({
            where: {
              status: "ACTIVE",
              profile: {
                OR: [
                  { username: { contains: term, mode: "insensitive" } },
                  { displayName: { contains: term, mode: "insensitive" } },
                ],
              },
            },
            select: {
              id: true,
              role: true,
              profile: { select: profileSelect },
            },
            take: limit,
          }),

      // Posts — search by content
      type === "users" || type === "hashtags"
        ? []
        : db.post.findMany({
            where: {
              content: { contains: term, mode: "insensitive" },
              deletedAt: null,
              visibility: "PUBLIC",
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
              author: {
                select: {
                  id: true,
                  role: true,
                  profile: { select: profileSelect },
                },
              },
              _count: { select: { reactions: true, comments: true, saves: true } },
            },
          }),

      // Hashtags
      type === "users" || type === "posts"
        ? []
        : db.hashtag.findMany({
            where: { name: { contains: term.replace(/^#/, ""), mode: "insensitive" } },
            orderBy: { createdAt: "desc" },
            take: limit,
          }),
    ]);

    return NextResponse.json({ success: true, data: { users, posts, hashtags } });
  } catch (error) {
    console.error("[GET /api/search]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
