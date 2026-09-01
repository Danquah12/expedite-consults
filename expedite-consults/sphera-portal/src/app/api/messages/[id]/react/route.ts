import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { pusherServer, pusherChannels, pusherEvents } from "@/lib/pusher";
import { z } from "zod";

const reactSchema = z.object({
  emoji: z.string().min(1).max(10),
});

// POST /api/messages/[id]/react — toggle emoji reaction
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const { id: messageId } = await params;

    const body = await req.json();
    const parsed = reactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { emoji } = parsed.data;

    const message = await db.message.findUnique({
      where: { id: messageId, deletedAt: null },
      select: { id: true, conversationId: true },
    });

    if (!message) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 });
    }

    const existingReaction = await db.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: currentUserId,
          emoji,
        },
      },
    });

    let action: "added" | "removed";

    if (existingReaction) {
      await db.messageReaction.delete({
        where: { id: existingReaction.id },
      });
      action = "removed";
    } else {
      await db.messageReaction.create({
        data: {
          messageId,
          userId: currentUserId,
          emoji,
        },
      });
      action = "added";
    }

    // Broadcast reaction update
    await pusherServer
      .trigger(
        pusherChannels.conversation(message.conversationId),
        pusherEvents.messageReaction,
        {
          messageId,
          userId: currentUserId,
          emoji,
          action,
        }
      )
      .catch(() => {});

    return NextResponse.json({ success: true, data: { action, emoji } });
  } catch (error) {
    console.error("[POST /api/messages/[id]/react]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
