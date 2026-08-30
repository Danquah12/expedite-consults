// app/api/campus/events/[id]/rsvp/route.ts
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, studentId } = body;

    // Validate status
    if (status !== "GOING" && status !== "INTERESTED" && status !== null) {
      return NextResponse.json(
        { success: false, error: "Status must be 'GOING', 'INTERESTED', or null" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      eventId: id,
      studentId: studentId || "usr-alex-rivera",
      newStatus: status,
      updatedAt: new Date().toISOString(),
      message: status ? `RSVP status updated to ${status}` : "RSVP removed",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process RSVP" },
      { status: 500 }
    );
  }
}
