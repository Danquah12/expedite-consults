import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const customId = (formData.get("id") as string) || `vid_${Date.now()}`;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || (file.type.includes("mp4") ? ".mp4" : ".webm");
    const safeFileName = `${customId}${ext}`;

    const baseDir = process.env.TMPDIR || "/tmp";
    const targetDir = path.join(/*turbopackIgnore: true*/ baseDir, "uploads", "videos");

    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.writeFileSync(path.join(targetDir, safeFileName), buffer);
    } catch (writeErr) {
      console.warn("[Upload API] Dir write notice:", writeErr);
    }

    // Direct streaming URL
    const url = `/api/videos/${safeFileName}`;

    return NextResponse.json({
      success: true,
      url,
      fileName: safeFileName,
      size: buffer.length,
      mimeType: file.type || "video/webm",
    });
  } catch (error) {
    console.error("[POST /api/upload]", error);
    return NextResponse.json({ success: false, error: "Video upload failed" }, { status: 500 });
  }
}
