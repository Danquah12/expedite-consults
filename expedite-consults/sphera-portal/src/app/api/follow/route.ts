import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { pusherServer, pusherChannels, pusherEvents } from "@/lib/pusher";
import { generalRatelimit } from "@/lib/redis";

// POST /api/follow — follow or unfollow a user
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { success: allowed } = await generalRatelimit.limit(session.user.id!);
    if (!allowed) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }

    const { targetUserId } = await req.json();

    if (!targetUserId || typeof targetUserId !== "string") {
      return NextResponse.json({ success: false, error: "targetUserId is required" }, { status: 400 });
    }

    if (targetUserId === session.user.id) {
      return NextResponse.json({ success: false, error: "You cannot follow yourself" }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({
      where: { id: targetUserId, status: "ACTIVE" },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id!,
          followingId: targetUserId,
        },
      },
    });

    let following: boolean;

    if (existingFollow) {
      await db.follow.delete({
        where: {
          followerId_followingId: {
            followerId: session.user.id!,
            followingId: targetUserId,
          },
        },
      });
      following = false;
    } else {
      await db.follow.create({
        data: {
          followerId: session.user.id!,
          followingId: targetUserId,
        },
      });
      following = true;

      await db.notification.create({
        data: {
          userId: targetUserId,
          type: "FOLLOW",
          actorId: session.user.id!,
          entityType: "user",
          message: "started following you",
        },
      });

      await pusherServer
        .trigger(
          pusherChannels.userNotifications(targetUserId),
          pusherEvents.newNotification,
          { type: "FOLLOW", actorId: session.user.id }
        )
        .catch(() => {});
    }

    const followerCount = await db.follow.count({ where: { followingId: targetUserId } });

    return NextResponse.json({
      success: true,
      data: { following, followerCount },
    });
  } catch (error) {
    console.error("[POST /api/follow]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
