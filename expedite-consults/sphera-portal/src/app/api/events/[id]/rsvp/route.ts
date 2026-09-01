import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const rsvpSchema = z.object({
  status: z.enum(["GOING", "INTERESTED", "NOT_GOING"]).default("GOING"),
});

// POST /api/events/[id]/rsvp — update or toggle RSVP status
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;
    const currentUserId = session.user.id;

    const body = await req.json().catch(() => ({}));
    const parsed = rsvpSchema.safeParse(body);
    const requestedStatus = parsed.success ? parsed.data.status : "GOING";

    const event = await db.event.findUnique({
      where: { id: eventId },
      select: { id: true, maxAttendees: true },
    });

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const existingRsvp = await db.eventRsvp.findUnique({
      where: {
        eventId_userId: { eventId, userId: currentUserId },
      },
    });

    let newStatus: string | null = requestedStatus;

    if (existingRsvp) {
      if (existingRsvp.status === requestedStatus) {
        // Toggle off
        await db.eventRsvp.delete({
          where: { id: existingRsvp.id },
        });
        newStatus = null;
      } else {
        // Update status
        await db.eventRsvp.update({
          where: { id: existingRsvp.id },
          data: { status: requestedStatus },
        });
      }
    } else {
      await db.eventRsvp.create({
        data: {
          eventId,
          userId: currentUserId,
          status: requestedStatus,
        },
      });
    }

    const totalRsvps = await db.eventRsvp.count({
      where: { eventId, status: "GOING" },
    });

    return NextResponse.json({
      success: true,
      data: {
        status: newStatus,
        isRsvpd: newStatus === "GOING",
        totalGoing: totalRsvps,
      },
    });
  } catch (error) {
    console.error("[POST /api/events/[id]/rsvp]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
