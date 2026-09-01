import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import type { TournamentWithDetails } from "@/types";

const mockTournamentsData: TournamentWithDetails[] = [
  {
    id: "t1",
    game: "Valorant",
    gameIcon: "🎯",
    title: "Sphera Collegiate Champions Cup — Season 4 Finals",
    prizePool: "$5,000",
    participants: 32,
    maxParticipants: 32,
    status: "Live",
    startsAt: "Live Now · Grand Finals Bo5",
    organizer: "UMD Esports & Sphera Gaming",
  },
  {
    id: "t2",
    game: "Super Smash Bros. Ultimate",
    gameIcon: "🥊",
    title: "DMV Regional Campus Showdown 2026",
    prizePool: "$1,500",
    participants: 58,
    maxParticipants: 64,
    status: "Registration Open",
    startsAt: "Saturday · 4:00 PM EST",
    organizer: "DMV Smash League",
  },
  {
    id: "t3",
    game: "Rocket League",
    gameIcon: "🏎️",
    title: "Tri-State 3v3 Weekend Invitational",
    prizePool: "$800",
    participants: 18,
    maxParticipants: 24,
    status: "Registration Open",
    startsAt: "Sunday · 2:00 PM EST",
    organizer: "Sphera Gaming Guild",
  },
  {
    id: "t4",
    game: "Apex Legends",
    gameIcon: "👑",
    title: "Collegiate Predator Trios Championship",
    prizePool: "$2,500",
    participants: 19,
    maxParticipants: 20,
    status: "Registration Open",
    startsAt: "Next Friday · 7:00 PM EST",
    organizer: "East Coast Esports Alliance",
  },
];

const createTournamentSchema = z.object({
  game: z.string().min(1),
  title: z.string().min(3),
  prizePool: z.string().min(1),
  maxParticipants: z.number().int().positive(),
  startsAt: z.string().min(1),
  organizer: z.string().min(1),
});

// GET /api/gaming/tournaments — list tournaments
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const game = searchParams.get("game");
    const status = searchParams.get("status");

    let filtered = [...mockTournamentsData];

    if (game && game !== "All Games") {
      filtered = filtered.filter((t) => t.game.toLowerCase().includes(game.toLowerCase()));
    }

    if (status && status !== "all") {
      filtered = filtered.filter((t) => t.status.toLowerCase() === status.toLowerCase());
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    console.error("[GET /api/gaming/tournaments]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/gaming/tournaments — create tournament
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createTournamentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const newTournament: TournamentWithDetails = {
      id: `t_${Date.now()}`,
      game: parsed.data.game,
      gameIcon: "🎮",
      title: parsed.data.title,
      prizePool: parsed.data.prizePool,
      participants: 1,
      maxParticipants: parsed.data.maxParticipants,
      status: "Registration Open",
      startsAt: parsed.data.startsAt,
      organizer: parsed.data.organizer,
    };

    return NextResponse.json({ success: true, data: newTournament });
  } catch (error) {
    console.error("[POST /api/gaming/tournaments]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
