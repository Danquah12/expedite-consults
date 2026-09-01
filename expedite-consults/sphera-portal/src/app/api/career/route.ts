import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generalRatelimit } from "@/lib/redis";
import { z } from "zod";
import type { JobListingWithMatch } from "@/types";

const mockJobsData: JobListingWithMatch[] = [
  {
    id: "j1",
    title: "Lead Cybersecurity Architect & IAM Enclave Engineer",
    company: "Expedite Federal Systems",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
    location: "Bethesda, MD (Hybrid)",
    type: "Full-Time",
    salary: "$185,000 - $225,000",
    clearance: "TS/SCI Polygraph",
    matchScore: 98,
    skills: ["Zero Trust", "FIDO2 Passkeys", "OAuth/SAML", "Next.js 16"],
    postedAt: "2 hours ago",
    featured: true,
    description: "Lead zero-trust defense architectures, cryptographic hardware enclave keys, and secure cloud enclaves for federal missions.",
  },
  {
    id: "j2",
    title: "Autonomous AI Agent Systems & Distributed Core Engineer",
    company: "Sphera Core Labs",
    companyLogo: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&auto=format&fit=crop&q=80",
    location: "Remote (US/Global)",
    type: "Full-Time",
    salary: "$170,000 - $210,000",
    matchScore: 95,
    skills: ["PostgreSQL", "Prisma", "Real-Time WebSockets", "Python", "LLMs"],
    postedAt: "1 day ago",
    featured: true,
    description: "Architect real-time social and commerce multi-agent pipelines with sub-50ms latency across 15 interconnected worlds.",
  },
  {
    id: "j3",
    title: "Penetration Tester & AppSec Bounty Specialist",
    company: "CyberMatrix Defense",
    companyLogo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80",
    location: "Annapolis Junction, MD",
    type: "Defense Bounty",
    salary: "$120 - $160 / hr",
    clearance: "Secret Required",
    matchScore: 91,
    skills: ["Burp Suite", "SAST/DAST", "Network Forensics", "Python"],
    postedAt: "2 days ago",
    description: "Hunt zero-day vulnerabilities in mission-critical sovereign software stacks with automated vulnerability report generation.",
  },
  {
    id: "j4",
    title: "Principal Frontend Design Engineer (UI/UX Systems)",
    company: "Orbit Digital",
    companyLogo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    location: "Remote (US)",
    type: "Full-Time",
    salary: "$140,000 - $180,000",
    matchScore: 89,
    skills: ["React 19", "Tailwind CSS", "Framer Motion", "WebGL/Canvas"],
    postedAt: "3 days ago",
    description: "Design high-contrast dark mode interfaces and interactive real-time video components for millions of users.",
  },
];

const applySchema = z.object({
  jobId: z.string().min(1),
  passportHash: z.string().optional(),
});

// GET /api/career — search & list jobs with match scores
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const q = searchParams.get("q");
    const clearanceOnly = searchParams.get("clearance") === "true";

    let filtered = [...mockJobsData];

    if (type && type !== "All Roles") {
      filtered = filtered.filter((j) => j.type === type);
    }

    if (clearanceOnly) {
      filtered = filtered.filter((j) => !!j.clearance);
    }

    if (q) {
      const term = q.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(term) ||
          j.company.toLowerCase().includes(term) ||
          j.skills.some((s) => s.toLowerCase().includes(term))
      );
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    console.error("[GET /api/career]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/career — 1-Click apply
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = applySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { jobId } = parsed.data;

    return NextResponse.json({
      success: true,
      data: {
        applied: true,
        jobId,
        message: "Your Verified Skill Passport was encrypted and delivered to the hiring team.",
        appliedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[POST /api/career]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
