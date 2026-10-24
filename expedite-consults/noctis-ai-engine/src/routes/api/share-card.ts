import { createFileRoute } from "@tanstack/react-router";
import jpeg from "jpeg-js";
import { KWESI_AVATAR, OG_LOGO } from "@/lib/og-logo";

function safePhoto(raw: string) {
  try {
    const url = new URL(raw);
    const host = url.hostname;
    const blocked = url.protocol !== "https:" || host === "localhost" || host.endsWith(".local") || /^(10\.|127\.|192\.168\.|169\.254\.|0\.0\.0\.0)/.test(host);
    return blocked ? "" : url.toString().slice(0, 800);
  } catch {
    return "";
  }
}

function isJpeg(bytes: Uint8Array) {
  return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8;
}

function paintFace(base: Uint8Array, width: number, height: number, face: Uint8Array, fw: number, fh: number) {
  const r = 150;
  const cx = 190;
  const cy = Math.round(height / 2);
  for (let y = -r - 6; y <= r + 6; y += 1) {
    for (let x = -r - 6; x <= r + 6; x += 1) {
      const dist = x * x + y * y;
      const dx = cx + x;
      const dy = cy + y;
      if (dx < 0 || dy < 0 || dx >= width || dy >= height) continue;
      const di = (dy * width + dx) * 4;
      if (dist > r * r) {
        if (dist <= (r + 6) * (r + 6)) {
          base[di] = 228;
          base[di + 1] = 184;
          base[di + 2] = 106;
          base[di + 3] = 255;
        }
        continue;
      }
      const sx = Math.min(fw - 1, Math.max(0, Math.floor(((x + r) / (r * 2)) * fw)));
      const sy = Math.min(fh - 1, Math.max(0, Math.floor(((y + r) / (r * 2)) * fh)));
      const si = (sy * fw + sx) * 4;
      base[di] = face[si];
      base[di + 1] = face[si + 1];
      base[di + 2] = face[si + 2];
      base[di + 3] = 255;
    }
  }
}

function jpegResponse(bytes: Uint8Array) {
  return new Response(new Uint8Array(bytes), {
    headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=300" },
  });
}

export const Route = createFileRoute("/api/share-card")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const logoBytes = Buffer.from(OG_LOGO, "base64");
        try {
          const logo = jpeg.decode(logoBytes, { useTArray: true, formatAsRGBA: true });
          const requestedPhoto = safePhoto(new URL(request.url).searchParams.get("a") || "");
          let painted = false;
          if (requestedPhoto && !requestedPhoto.endsWith("/media/avatars/kwesi.jpg")) {
            try {
              const res = await fetch(requestedPhoto, { signal: AbortSignal.timeout(8000) });
              const bytes = Buffer.from(await res.arrayBuffer());
              if (res.ok && isJpeg(bytes)) {
                const face = jpeg.decode(bytes, { useTArray: true, formatAsRGBA: true });
                paintFace(logo.data, logo.width, logo.height, face.data, face.width, face.height);
                painted = true;
              }
            } catch {
              /* fall back to built-in Kwesi avatar */
            }
          }
          if (!painted) {
            const kwesiBytes = Buffer.from(KWESI_AVATAR, "base64");
            const face = jpeg.decode(kwesiBytes, { useTArray: true, formatAsRGBA: true });
            paintFace(logo.data, logo.width, logo.height, face.data, face.width, face.height);
          }
          const encoded = jpeg.encode({ data: logo.data, width: logo.width, height: logo.height }, 84);
          return jpegResponse(encoded.data);
        } catch {
          return jpegResponse(logoBytes);
        }
      },
    },
  },
});
