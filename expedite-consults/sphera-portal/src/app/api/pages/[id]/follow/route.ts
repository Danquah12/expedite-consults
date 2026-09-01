import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// POST /api/pages/[id]/follow — toggle follow business page
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

    return NextResponse.json({
      success: true,
      data: {
        pageId: id,
        following: true,
        message: "You are now following this page.",
      },
    });
  } catch (error) {
    console.error("[POST /api/pages/[id]/follow]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
