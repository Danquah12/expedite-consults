import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const MIME_MAP: Record<string, string> = {
  ".webm": "video/webm",
  ".mp4": "video/mp4",
  ".ogg": "video/ogg",
  ".mov": "video/quicktime",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await context.params;
    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const relativeSubPath = path.join(...pathSegments);

    const searchDirs = [
      path.join(process.cwd(), "public", "uploads"),
      path.join(process.cwd(), "sphera-portal", "public", "uploads"),
      path.join(process.cwd(), "uploads"),
      path.join(process.cwd(), "sphera-portal", "uploads"),
    ];

    let foundFilePath: string | null = null;

    for (const dir of searchDirs) {
      const candidate = path.join(dir, relativeSubPath);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        foundFilePath = candidate;
        break;
      }
    }

    if (!foundFilePath) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const ext = path.extname(foundFilePath).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";
    const stat = fs.statSync(foundFilePath);
    const fileSize = stat.size;

    const rangeHeader = req.headers.get("range");

    if (rangeHeader && contentType.startsWith("video/")) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${fileSize}` },
        });
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(foundFilePath, { start, end });

      const readableStream = new ReadableStream({
        start(controller) {
          fileStream.on("data", (chunk) => controller.enqueue(chunk));
          fileStream.on("end", () => controller.close());
          fileStream.on("error", (err) => controller.error(err));
        },
      });

      return new NextResponse(readableStream as any, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const fileBuffer = await fs.promises.readFile(foundFilePath);

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileSize.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("[GET /uploads/[...path]]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
