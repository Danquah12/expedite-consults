import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/spaces/[id]/join — toggle space membership
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: spaceId } = await params;
    const currentUserId = session.user.id;

    const space = await db.space.findUnique({
      where: { id: spaceId },
      select: { id: true, ownerId: true, memberCount: true },
    });

    if (!space) {
      return NextResponse.json({ success: false, error: "Space not found" }, { status: 404 });
    }

    const existingMember = await db.spaceMember.findUnique({
      where: {
        spaceId_userId: {
          spaceId,
          userId: currentUserId,
        },
      },
    });

    let isJoined: boolean;
    let newMemberCount = space.memberCount;

    if (existingMember) {
      if (existingMember.role === "OWNER") {
        return NextResponse.json(
          { success: false, error: "Space owners cannot leave their own space." },
          { status: 400 }
        );
      }

      await db.$transaction([
        db.spaceMember.delete({
          where: {
            spaceId_userId: {
              spaceId,
              userId: currentUserId,
            },
          },
        }),
        db.space.update({
          where: { id: spaceId },
          data: { memberCount: { decrement: 1 } },
        }),
      ]);

      isJoined = false;
      newMemberCount = Math.max(0, space.memberCount - 1);
    } else {
      await db.$transaction([
        db.spaceMember.create({
          data: {
            spaceId,
            userId: currentUserId,
            role: "MEMBER",
          },
        }),
        db.space.update({
          where: { id: spaceId },
          data: { memberCount: { increment: 1 } },
        }),
      ]);

      isJoined = true;
      newMemberCount = space.memberCount + 1;
    }

    return NextResponse.json({
      success: true,
      data: {
        isJoined,
        memberCount: newMemberCount,
      },
    });
  } catch (error) {
    console.error("[POST /api/spaces/[id]/join]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
