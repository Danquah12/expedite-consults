import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getOrCreateDefaultUser } from "@/lib/db-seed";
import { feedStore } from "@/lib/feed-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 });
    }

    let currentUserId: string | null = null;
    try {
      const session = await auth();
      if (session?.user?.id) currentUserId = session.user.id;
    } catch {}

    if (!currentUserId) {
      const defaultUser = await getOrCreateDefaultUser("kwesi");
      if (defaultUser) currentUserId = defaultUser.id;
    }

    if (currentUserId) {
      const targetProfile = await db.profile.findUnique({
        where: { username },
        select: { userId: true },
      }).catch(() => null);

      if (targetProfile?.userId) {
        const existing = await db.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: targetProfile.userId,
            },
          },
        }).catch(() => null);

        let isFollowed = false;
        if (existing) {
          await db.follow.delete({
            where: {
              followerId_followingId: {
                followerId: currentUserId,
                followingId: targetProfile.userId,
              },
            },
          }).catch(() => {});
          isFollowed = false;
        } else {
          await db.follow.create({
            data: {
              followerId: currentUserId,
              followingId: targetProfile.userId,
            },
          }).catch(() => {});
          isFollowed = true;
        }

        feedStore.toggleFollow(username);

        return NextResponse.json({
          success: true,
          username,
          isFollowed,
        });
      }
    }

    const fallbackResult = feedStore.toggleFollow(username);
    return NextResponse.json({
      success: true,
      username,
      isFollowed: fallbackResult.isFollowed,
    });
  } catch (error) {
    console.error("[POST /api/feed/follow]", error);
    return NextResponse.json({ success: false, error: "Failed to update follow state" }, { status: 500 });
  }
}
