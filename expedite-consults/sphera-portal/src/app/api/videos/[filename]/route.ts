import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ filename: string }> | { filename: string } }
) {
  try {
    const resolvedParams = await context.params;
    const filename = resolvedParams.filename;

    const candidatePaths = [
      path.join(process.cwd(), "data", "videos", filename),
      path.join(process.cwd(), "public", "uploads", "videos", filename),
      path.join(process.cwd(), "..", "data", "videos", filename),
    ];

    let foundPath: string | null = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (!foundPath) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const stat = fs.statSync(foundPath);
    const fileSize = stat.size;
    const range = req.headers.get("range");
    const ext = path.extname(filename).toLowerCase();
    const contentType = ext === ".mp4" ? "video/mp4" : ext === ".ogg" ? "video/ogg" : "video/webm";

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const fileStream = fs.createReadStream(foundPath, { start, end });

      const headers = new Headers({
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize.toString(),
        "Content-Type": contentType,
      });

      // @ts-ignore
      return new Response(fileStream as any, { status: 206, headers });
    } else {
      const fileStream = fs.createReadStream(foundPath);
      const headers = new Headers({
        "Content-Length": fileSize.toString(),
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
      });

      // @ts-ignore
      return new Response(fileStream as any, { status: 200, headers });
    }
  } catch (error) {
    console.error("[GET /api/videos]", error);
    return NextResponse.json({ error: "Failed to stream video" }, { status: 500 });
  }
}
