import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createMuxUpload } from "@/lib/mux";

// POST /api/reels/upload — get direct upload URL for Mux video
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { uploadId, uploadUrl } = await createMuxUpload();

    return NextResponse.json({
      success: true,
      data: {
        uploadId,
        uploadUrl,
      },
    });
  } catch (error: any) {
    console.error("[POST /api/reels/upload]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create video upload URL" },
      { status: 500 }
    );
  }
}
