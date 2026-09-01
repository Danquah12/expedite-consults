import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import type { BusinessPageWithDetails } from "@/types";

const mockPagesData: BusinessPageWithDetails[] = [
  {
    id: "pg1",
    name: "Expedite Consults LLC",
    handle: "expedite_consults",
    category: "Cybersecurity & Technology",
    description: "Enterprise defense architectures, zero-trust cloud enclaves, and autonomous AI intelligence platforms.",
    followers: 48900,
    postsCount: 184,
    isVerified: true,
    avatarImg: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
    coverImg: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    website: "expediteconsults.com",
    isFollowing: true,
  },
  {
    id: "pg2",
    name: "Sphera Studios & Creative",
    handle: "sphera_studios",
    category: "Media & Production",
    description: "Official creator tool suite, 4K rendering engines, and production network for Sphera creators worldwide.",
    followers: 124000,
    postsCount: 420,
    isVerified: true,
    avatarImg: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80",
    coverImg: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
    website: "sphera.io/studio",
    isFollowing: true,
  },
  {
    id: "pg3",
    name: "University of Maryland Alumni",
    handle: "umd_alumni",
    category: "University & Education",
    description: "Connecting 400,000+ Terps globally. Collegiate hackathons, campus mentorship, and cleared tech careers.",
    followers: 86400,
    postsCount: 512,
    isVerified: true,
    avatarImg: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&auto=format&fit=crop&q=80",
    coverImg: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80",
    website: "alumni.umd.edu",
    isFollowing: false,
  },
  {
    id: "pg4",
    name: "VeritasLens Media Watch",
    handle: "veritaslens",
    category: "AI & Media Trust",
    description: "Real-time automated media authenticity verification, synthetic deepfake detection, and news trust indices.",
    followers: 32100,
    postsCount: 96,
    isVerified: true,
    avatarImg: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=200&auto=format&fit=crop&q=80",
    coverImg: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80",
    website: "veritaslens.ai",
    isFollowing: false,
  },
];

const createPageSchema = z.object({
  name: z.string().min(2),
  handle: z.string().min(2).regex(/^[a-zA-Z0-9_]+$/),
  category: z.string().min(2),
  description: z.string().min(5),
  website: z.string().optional(),
  avatarImg: z.string().url().optional(),
  coverImg: z.string().url().optional(),
});

// GET /api/pages — list verified brand pages
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");

    let filtered = [...mockPagesData];

    if (category && category !== "All") {
      filtered = filtered.filter((p) =>
        p.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (q) {
      const term = q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.handle.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    console.error("[GET /api/pages]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/pages — create new business/brand page
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createPageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const newPage: BusinessPageWithDetails = {
      id: `pg_${Date.now()}`,
      name: parsed.data.name,
      handle: parsed.data.handle,
      category: parsed.data.category,
      description: parsed.data.description,
      website: parsed.data.website,
      followers: 1,
      postsCount: 0,
      isVerified: true,
      isFollowing: true,
      ownerId: session.user.id,
      avatarImg:
        parsed.data.avatarImg ||
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
      coverImg:
        parsed.data.coverImg ||
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    };

    return NextResponse.json({ success: true, data: newPage });
  } catch (error) {
    console.error("[POST /api/pages]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
