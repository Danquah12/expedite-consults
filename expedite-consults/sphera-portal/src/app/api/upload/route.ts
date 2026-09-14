import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// POST /api/upload — handle persistent file upload with disk + cloud fallback
export async function POST(req: NextRequest) {
  try {
    const session = await auth().catch(() => null);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // Max 500MB for videos, 50MB for images
    const isVideo = file.type.startsWith("video/") || file.name.endsWith(".webm") || file.name.endsWith(".mp4");
    const maxSize = isVideo ? 500 * 1024 * 1024 : 50 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: "File too large" }, { status: 413 });
    }

    // 1. Try Uploadthing if token is present
    if (process.env.UPLOADTHING_TOKEN || process.env.UPLOADTHING_SECRET) {
      try {
        const { UTApi } = await import("uploadthing/server");
        const utapi = new UTApi();
        const response = await utapi.uploadFiles(file);
        if (response?.data?.url) {
          return NextResponse.json({
            success: true,
            data: {
              url: response.data.url,
              key: response.data.key,
              name: response.data.name,
              size: response.data.size,
              storage: "uploadthing",
            },
          });
        }
      } catch (utErr) {
        console.warn("[Uploadthing fallback to disk]:", utErr);
      }
    }

    // 2. Persistent Local Storage in public/uploads/
    const subfolder = isVideo ? "videos" : "images";
    const fileNameString = typeof file.name === "string" ? file.name : "";
    let safeExt = "";
    if (fileNameString && fileNameString.includes(".")) {
      safeExt = path.extname(fileNameString);
    }
    if (!safeExt) {
      if (file.type.includes("webm")) safeExt = ".webm";
      else if (file.type.includes("mp4")) safeExt = ".mp4";
      else if (file.type.includes("png")) safeExt = ".png";
      else if (file.type.includes("jpeg") || file.type.includes("jpg")) safeExt = ".jpg";
      else safeExt = isVideo ? ".webm" : ".png";
    }

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileName = `${subfolder === "videos" ? "video" : "media"}_${timestamp}_${randomSuffix}${safeExt}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write to both potential public folders (sphera-portal/public and workspace root public)
    const targetDirs = [
      path.join(process.cwd(), "public", "uploads", subfolder),
      path.join(process.cwd(), "sphera-portal", "public", "uploads", subfolder),
    ];

    for (const dir of targetDirs) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        await fs.promises.writeFile(path.join(dir, fileName), buffer);
      } catch (writeErr) {
        console.warn(`[Upload write notice for ${dir}]:`, writeErr);
      }
    }

    const publicUrl = `/uploads/${subfolder}/${fileName}`;

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        key: fileName,
        name: fileNameString || fileName,
        size: file.size,
        type: file.type,
        storage: "local-persistent",
      },
    });
  } catch (error: any) {
    console.error("[POST /api/upload]", error);
    return NextResponse.json({ success: false, error: error?.message || "Upload failed" }, { status: 500 });
  }
}
