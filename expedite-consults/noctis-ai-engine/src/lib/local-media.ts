export const MEDIA_ACCEPT = "image/*,video/*,.mp4,.webm,.mov,.jpg,.jpeg,.png,.webp";
const MAX = 80 * 1024 * 1024;

let picking = false;
let inbound: File | null = null;

export function beginPick() {
  picking = true;
}
export function endPick() {
  picking = false;
}
export function isPickingMedia() {
  return picking;
}
export function stashInbound(file: File) {
  inbound = file;
}
export function takeInbound() {
  const f = inbound;
  inbound = null;
  return f;
}

function sniff(buf: ArrayBuffer): "image" | "video" | null {
  const b = new Uint8Array(buf.slice(0, 16));
  if (b[0] === 0xff && b[1] === 0xd8) return "image";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image";
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return "video";
  const ascii = String.fromCharCode(...b);
  if (ascii.includes("ftyp")) return "video";
  return null;
}

export async function inspectLocalFile(file: File): Promise<{ file: File; kind: "image" | "video"; url: string } | null> {
  if (file.size > MAX) return null;
  let kind: "image" | "video" | null = file.type.startsWith("video")
    ? "video"
    : file.type.startsWith("image")
      ? "image"
      : null;
  if (!kind) {
    const head = await file.slice(0, 16).arrayBuffer();
    kind = sniff(head);
  }
  if (!kind) {
    if (/\.(mp4|webm|mov)$/i.test(file.name)) kind = "video";
    else if (/\.(jpe?g|png|webp|gif)$/i.test(file.name)) kind = "image";
  }
  if (!kind) return null;
  return { file, kind, url: URL.createObjectURL(file) };
}
