import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const actorSelect = {
  id: true,
  role: true,
  profile: {
    select: {
      username: true,
      displayName: true,
      avatar: true,
      isVerified: true,
      profileVisibility: true,
    },
  },
} as const;

// GET /api/notifications
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

    const notifications = await db.notification.findMany({
      where: { userId: session.user.id! },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = notifications.length > limit;
    const page = hasMore ? notifications.slice(0, -1) : notifications;
    const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

    // Fetch actors
    const actorIds = [...new Set(page.map((n) => n.actorId).filter(Boolean))] as string[];
    const actors = actorIds.length > 0
      ? await db.user.findMany({
          where: { id: { in: actorIds } },
          select: actorSelect,
        })
      : [];

    const actorMap = new Map(actors.map((a) => [a.id, a]));

    const enriched = page.map((n) => ({
      ...n,
      actor: n.actorId ? actorMap.get(n.actorId) ?? null : null,
    }));

    const unreadCount = await db.notification.count({
      where: { userId: session.user.id!, isRead: false },
    });

    return NextResponse.json({
      success: true,
      data: { notifications: enriched, nextCursor, hasMore, unreadCount },
    });
  } catch (error) {
    console.error("[GET /api/notifications]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/notifications — mark all as read
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await db.notification.updateMany({
      where: { userId: session.user.id!, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true, data: { marked: true } });
  } catch (error) {
    console.error("[PATCH /api/notifications]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
