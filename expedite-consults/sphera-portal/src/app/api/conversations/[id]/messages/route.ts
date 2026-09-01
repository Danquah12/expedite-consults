import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generalRatelimit } from "@/lib/redis";
import { pusherServer, pusherChannels, pusherEvents } from "@/lib/pusher";
import { z } from "zod";

const sendMessageSchema = z.object({
  content: z.string().max(4000).optional(),
  type: z.enum(["TEXT", "IMAGE", "VIDEO", "AUDIO", "FILE", "GIF", "SYSTEM"]).default("TEXT"),
  mediaUrl: z.string().url().optional(),
  replyToId: z.string().optional(),
});

const userSelect = {
  id: true,
  role: true,
  profile: {
    select: {
      username: true,
      displayName: true,
      avatar: true,
      bio: true,
      isVerified: true,
      profileVisibility: true,
    },
  },
} as const;

// GET /api/conversations/[id]/messages — get message stream
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "30"), 100);

    // Verify current user is a participant
    const participant = await db.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const messages = await db.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        sender: { select: userSelect },
        reactions: true,
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                profile: { select: { displayName: true } },
              },
            },
          },
        },
      },
    });

    const hasMore = messages.length > limit;
    const page = hasMore ? messages.slice(0, -1) : messages;
    const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

    // Return in chronological order for frontend display
    return NextResponse.json({
      success: true,
      data: {
        messages: page.reverse(),
        nextCursor,
        hasMore,
      },
    });
  } catch (error) {
    console.error("[GET /api/conversations/[id]/messages]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/conversations/[id]/messages — send message
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
    const { id: conversationId } = await params;

    const { success: allowed } = await generalRatelimit.limit(currentUserId);
    if (!allowed) {
      return NextResponse.json({ success: false, error: "Too many messages. Please slow down." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { content, type, mediaUrl, replyToId } = parsed.data;

    if (!content && !mediaUrl) {
      return NextResponse.json(
        { success: false, error: "Message must contain text or media" },
        { status: 400 }
      );
    }

    // Verify participation
    const participant = await db.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUserId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // Create message and update conversation in transaction
    const message = await db.$transaction(async (tx) => {
      const newMsg = await tx.message.create({
        data: {
          conversationId,
          senderId: currentUserId,
          content,
          type,
          mediaUrl,
          replyToId,
        },
        include: {
          sender: { select: userSelect },
          reactions: true,
          replyTo: {
            select: {
              id: true,
              content: true,
              sender: {
                select: {
                  profile: { select: { displayName: true } },
                },
              },
            },
          },
        },
      });

      // Update lastMessageAt on conversation
      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });

      // Update current user's lastReadAt
      await tx.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId,
            userId: currentUserId,
          },
        },
        data: { lastReadAt: new Date() },
      });

      return newMsg;
    });

    // Real-time broadcast to conversation channel
    await pusherServer
      .trigger(
        pusherChannels.conversation(conversationId),
        pusherEvents.newMessage,
        message
      )
      .catch(() => {});

    // Notify other participants
    const otherParticipants = await db.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: { not: currentUserId },
      },
      select: { userId: true },
    });

    const senderName = message.sender.profile?.displayName || "Someone";
    for (const p of otherParticipants) {
      await pusherServer
        .trigger(
          pusherChannels.userNotifications(p.userId),
          pusherEvents.newNotification,
          {
            type: "MESSAGE",
            actorId: currentUserId,
            entityId: conversationId,
            message: `${senderName}: ${content ? content.slice(0, 60) : "Sent an attachment"}`,
          }
        )
        .catch(() => {});
    }

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/conversations/[id]/messages]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
