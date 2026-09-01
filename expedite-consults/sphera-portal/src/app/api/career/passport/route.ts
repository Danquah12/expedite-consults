import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { SkillPassportData } from "@/types";

// GET /api/career/passport — get user's cryptographic Skill Passport
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id || "u_kwesi";
    const name = session?.user?.name || "Kwesi Asiedu";
    const handle = (session?.user as any)?.username || "kwesi";

    const passport: SkillPassportData = {
      userId,
      name,
      handle,
      clearanceLevel: "TS/SCI Polygraph (Active)",
      gpa: "3.94 / 4.0",
      university: "University of Maryland · Computer Science",
      skills: [
        { name: "Zero-Trust Enclave Architectures", level: "Expert", verifiedBy: "Expedite Defense" },
        { name: "Full-Stack Distributed Systems (Next.js/Postgres)", level: "Principal", verifiedBy: "Sphera Core" },
        { name: "AppSec Penetration Testing & Cryptography", level: "Advanced", verifiedBy: "CyberMatrix Defense" },
        { name: "Multi-Agent AI & LLM Pipelines", level: "Expert", verifiedBy: "VeritasLens Labs" },
      ],
      bountiesCompleted: 14,
      overallPercentile: 99,
      signatureHash: "0x9f88b432a68e91cf738120b064c391aa",
      issuedAt: new Date("2026-01-15T00:00:00Z"),
    };

    return NextResponse.json({ success: true, data: passport });
  } catch (error) {
    console.error("[GET /api/career/passport]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
