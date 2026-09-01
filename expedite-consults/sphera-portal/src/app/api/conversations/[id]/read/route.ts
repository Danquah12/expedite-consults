import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { pusherServer, pusherChannels, pusherEvents } from "@/lib/pusher";

// POST /api/conversations/[id]/read — mark conversation as read
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const currentUserId = session.user.id;

    await db.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUserId,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    // Broadcast read receipt
    await pusherServer
      .trigger(
        pusherChannels.conversation(conversationId),
        pusherEvents.messageRead,
        {
          conversationId,
          userId: currentUserId,
          readAt: new Date(),
        }
      )
      .catch(() => {});

    return NextResponse.json({ success: true, data: { read: true } });
  } catch (error) {
    console.error("[POST /api/conversations/[id]/read]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
