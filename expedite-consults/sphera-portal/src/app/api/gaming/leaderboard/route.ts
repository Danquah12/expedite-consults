import { NextResponse } from "next/server";
import type { EsportsClanRank } from "@/types";

const mockClansData: EsportsClanRank[] = [
  { rank: 1, name: "Terrapin Esports", members: 142, wins: 412, winRate: "78%", badge: "👑", tag: "#TERP", university: "University of Maryland" },
  { rank: 2, name: "CyberMatrix Defense Guild", members: 89, wins: 348, winRate: "74%", badge: "🥈", tag: "#CYBR", university: "Johns Hopkins" },
  { rank: 3, name: "Capital City Gamers", members: 110, wins: 295, winRate: "69%", badge: "🥉", tag: "#DCG", university: "Georgetown" },
  { rank: 4, name: "Virginia Tech Hokies Gaming", members: 95, wins: 260, winRate: "66%", badge: "⚡", tag: "#HOKI", university: "Virginia Tech" },
];

// GET /api/gaming/leaderboard — get collegiate clan rankings
export async function GET() {
  try {
    return NextResponse.json({ success: true, data: mockClansData });
  } catch (error) {
    console.error("[GET /api/gaming/leaderboard]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
