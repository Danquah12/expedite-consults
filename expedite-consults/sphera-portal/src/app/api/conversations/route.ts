import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generalRatelimit } from "@/lib/redis";
import { z } from "zod";

const createConversationSchema = z.object({
  type: z.enum(["DM", "GROUP"]).default("DM"),
  name: z.string().max(100).optional(),
  participantIds: z.array(z.string()).min(1),
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

// GET /api/conversations — list conversations for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;

    // Find all conversation IDs current user participates in
    const userParticipants = await db.conversationParticipant.findMany({
      where: { userId: currentUserId },
      select: { conversationId: true, lastReadAt: true },
    });

    const userMap = new Map(userParticipants.map((p) => [p.conversationId, p.lastReadAt]));
    const conversationIds = userParticipants.map((p) => p.conversationId);

    const conversations = await db.conversation.findMany({
      where: { id: { in: conversationIds } },
      orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
      include: {
        participants: {
          include: {
            user: { select: userSelect },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: { select: userSelect },
            reactions: true,
          },
        },
      },
    });

    // Calculate unread counts for each conversation
    const enriched = await Promise.all(
      conversations.map(async (c) => {
        const lastReadAt = userMap.get(c.id);
        const unreadCount = await db.message.count({
          where: {
            conversationId: c.id,
            senderId: { not: currentUserId },
            ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
            deletedAt: null,
          },
        });

        return {
          id: c.id,
          type: c.type,
          name: c.name,
          avatarUrl: c.avatarUrl,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          lastMessageAt: c.lastMessageAt,
          participants: c.participants,
          lastMessage: c.messages[0] || null,
          unreadCount,
        };
      })
    );

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    console.error("[GET /api/conversations]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/conversations — start new DM or Group
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { success: allowed } = await generalRatelimit.limit(session.user.id);
    if (!allowed) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = createConversationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { type, name, participantIds } = parsed.data;
    const currentUserId = session.user.id;

    // Filter and deduplicate participant IDs
    const targetUserIds = Array.from(
      new Set(participantIds.filter((id) => id !== currentUserId))
    );

    if (targetUserIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one other participant is required" },
        { status: 400 }
      );
    }

    // 1-on-1 DM: Idempotent lookup
    if (type === "DM" && targetUserIds.length === 1) {
      const targetId = targetUserIds[0];

      // Find existing DM with exactly these two participants
      const existing = await db.conversation.findFirst({
        where: {
          type: "DM",
          AND: [
            { participants: { some: { userId: currentUserId } } },
            { participants: { some: { userId: targetId } } },
          ],
        },
        include: {
          participants: {
            include: { user: { select: userSelect } },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: { select: userSelect },
              reactions: true,
            },
          },
        },
      });

      if (existing) {
        return NextResponse.json({
          success: true,
          data: {
            ...existing,
            lastMessage: existing.messages[0] || null,
            unreadCount: 0,
          },
        });
      }
    }

    // Create new conversation with participants
    const allParticipantIds = [currentUserId, ...targetUserIds];

    const conversation = await db.conversation.create({
      data: {
        type,
        name: type === "GROUP" ? name || "Group Chat" : null,
        participants: {
          create: allParticipantIds.map((userId) => ({
            userId,
            role: userId === currentUserId ? "ADMIN" : "MEMBER",
          })),
        },
      },
      include: {
        participants: {
          include: { user: { select: userSelect } },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...conversation,
          lastMessage: null,
          unreadCount: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/conversations]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
