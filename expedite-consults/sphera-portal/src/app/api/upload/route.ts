import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

// POST /api/upload — handle file upload via Uploadthing
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // Max 50MB for images, 500MB for videos
    const maxSize = file.type.startsWith("video/") ? 500 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File too large" },
        { status: 413 }
      );
    }

    const response = await utapi.uploadFiles(file);

    if (response.error) {
      return NextResponse.json(
        { success: false, error: response.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        url: response.data.url,
        key: response.data.key,
        name: response.data.name,
        size: response.data.size,
      },
    });
  } catch (error) {
    console.error("[POST /api/upload]", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
