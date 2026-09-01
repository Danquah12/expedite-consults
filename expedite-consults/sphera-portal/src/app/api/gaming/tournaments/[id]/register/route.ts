import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

const regSchema = z.object({
  teamName: z.string().min(2),
  teamTag: z.string().min(2).max(6),
  discordContact: z.string().optional(),
});

// POST /api/gaming/tournaments/[id]/register — register squad for tournament
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = regSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { teamName, teamTag, discordContact } = parsed.data;

    return NextResponse.json({
      success: true,
      data: {
        tournamentId: id,
        teamName,
        teamTag,
        discordContact,
        registeredAt: new Date(),
        message: `Squad [${teamTag}] ${teamName} registered successfully!`,
      },
    });
  } catch (error) {
    console.error("[POST /api/gaming/tournaments/[id]/register]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
