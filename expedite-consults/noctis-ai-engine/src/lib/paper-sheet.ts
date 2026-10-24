const MARGIN = 76;

export type PaperFit = "full" | "linkedin" | "facebook" | "whatsapp" | "instagram" | "x";

export type PaperSheetInput = {
  title: string;
  lede: string;
  source: string;
  steps: string[];
  fit?: PaperFit;
};

type SheetLayout = { w: number; h: number; header: number; footer: number; pages: number };
type Block = { text: string; font: string; color: string; gap: number; size: number };

const LAYOUTS: Record<PaperFit, SheetLayout> = {
  full: { w: 1080, h: 1440, header: 230, footer: 96, pages: 8 },
  linkedin: { w: 1080, h: 1350, header: 300, footer: 0, pages: 1 },
  facebook: { w: 1080, h: 1080, header: 280, footer: 0, pages: 1 },
  whatsapp: { w: 1080, h: 1350, header: 300, footer: 0, pages: 1 },
  instagram: { w: 1080, h: 1350, header: 340, footer: 0, pages: 1 },
  x: { w: 1600, h: 900, header: 0, footer: 0, pages: 1 },
};

function clipWords(text: string, max: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (!max || words.length <= max) return words.join(" ");
  return `${words.slice(0, max).join(" ")}…`;
}

function sectionParts(step: string) {
  const [head, ...rest] = step.split(/\n\n/);
  const titled = rest.length > 0 && head.length < 48;
  return { head: titled ? head : "", body: titled ? rest.join(" ") : step };
}

function sectionBody(steps: string[], name: string) {
  const row = steps.map(sectionParts).find((item) => item.head.toLowerCase() === name.toLowerCase());
  return row?.body ?? "";
}

function lessonWords(input: PaperSheetInput) {
  return [input.lede, ...input.steps]
    .join(" ")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/[#•]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fitted(input: PaperSheetInput): PaperSheetInput {
  const fit = input.fit ?? "full";
  if (fit === "full") return input;
  const words = lessonWords(input);
  const next = sectionBody(input.steps, "What to Do Next");
  if (fit === "linkedin") {
    return { ...input, lede: clipWords(words, 70), steps: [`Why it matters\n\n${clipWords(words, 40)}`] };
  }
  if (fit === "facebook") return { ...input, lede: clipWords(words, 40), steps: [] };
  if (fit === "whatsapp") return { ...input, lede: clipWords(words, 48), steps: [`Next\n\n${clipWords(next || words, 18)}`] };
  if (fit === "instagram") return { ...input, lede: clipWords(words, 24), source: "", steps: [] };
  return { ...input, lede: clipWords(words, 22), steps: [] };
}

export function fitAsked(text: string): PaperFit | null {
  if (/\blinkedin\b/i.test(text)) return "linkedin";
  if (/\binstagram\b/i.test(text)) return "instagram";
  if (/\bwhatsapp\b|what'?s\s*app/i.test(text)) return "whatsapp";
  if (/\bfacebook\b/i.test(text)) return "facebook";
  return null;
}

export function paperCaption(input: PaperSheetInput) {
  const fit = input.fit ?? "full";
  const by = "Written by Noctis · Noctis Clinic";
  const title = input.title || "White paper";
  const abstract = sectionBody(input.steps, "Abstract") || input.lede;
  const matters = sectionBody(input.steps, "Why It Matters");
  const next = sectionBody(input.steps, "What to Do Next");
  if (fit === "x") return `${title}. ${clipWords(abstract, 16)} ${by}`.replace(/\s+/g, " ").slice(0, 240);
  if (fit === "instagram") return `${title}\n\n${clipWords(abstract, 24)}\n\n${by}`;
  if (fit === "facebook") return `${title}\n\n${clipWords(abstract, 40)}\n\n${by}`;
  if (fit === "whatsapp") return `${title}\n\n${clipWords(abstract, 36)}\n\nNext: ${clipWords(next || matters, 18)}\n\n${by}`;
  if (fit === "linkedin") return `${title}\n\n${clipWords(abstract, 70)}\n\n${matters ? `${clipWords(matters, 35)}\n\n` : ""}${by}`;
  return `${title}\n\n${abstract}\n\n${by}`;
}

function bytesOf(parts: Uint8Array[]) {
  const len = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(len);
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

function pdfFromJpegs(pages: { jpeg: Uint8Array; w: number; h: number }[]) {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let cursor = 0;
  const push = (data: Uint8Array) => {
    chunks.push(data);
    cursor += data.length;
  };
  const obj = (body: string | Uint8Array) => {
    offsets.push(cursor);
    push(typeof body === "string" ? enc.encode(body) : body);
  };
  push(enc.encode("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n"));
  const kids = pages.map((_, index) => `${3 + index * 3} 0 R`).join(" ");
  obj("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  obj(`2 0 obj\n<< /Type /Pages /Count ${pages.length} /Kids [${kids}] >>\nendobj\n`);
  pages.forEach((page, index) => {
    const pageId = 3 + index * 3;
    const contentId = pageId + 1;
    const imageId = pageId + 2;
    const stream = `q ${page.w} 0 0 ${page.h} 0 0 cm /Im0 Do Q\n`;
    obj(`${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.w} ${page.h}] /Contents ${contentId} 0 R /Resources << /XObject << /Im0 ${imageId} 0 R >> >> >>\nendobj\n`);
    obj(`${contentId} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`);
    const head = enc.encode(`${imageId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${page.w} /Height ${page.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.jpeg.length} >>\nstream\n`);
    const tail = enc.encode("endstream\nendobj\n");
    offsets.push(cursor);
    push(bytesOf([head, page.jpeg, tail]));
  });
  const xrefAt = cursor;
  let xref = `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) xref += `${String(off).padStart(10, "0")} 00000 n \n`;
  push(enc.encode(`${xref}trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`));
  return bytesOf(chunks);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width ? img : null);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawStar(ctx: CanvasRenderingContext2D, star: HTMLImageElement | null, x: number, y: number, size: number) {
  if (!star) return;
  ctx.drawImage(star, x, y, size, size);
}

function paintChrome(ctx: CanvasRenderingContext2D, lockup: HTMLImageElement | null, star: HTMLImageElement | null, pageNo: number, pages: number, layout: SheetLayout) {
  ctx.fillStyle = "#f7f7f4";
  ctx.fillRect(0, 0, layout.w, layout.h);
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, layout.w, layout.header);
  const crop = lockup ? logoBounds(lockup) : null;
  if (lockup && crop) {
    const boxW = layout.w - 220;
    const boxH = layout.header - 28;
    const scale = Math.min(boxW / crop.w, boxH / crop.h);
    const dw = crop.w * scale;
    const dh = crop.h * scale;
    ctx.drawImage(lockup, crop.x, crop.y, crop.w, crop.h, (layout.w - dw) / 2 + 36, (layout.header - dh) / 2, dw, dh);
  }
  drawStar(ctx, star, 36, (layout.header - 120) / 2, 120);
  if (!lockup || !crop) {
    ctx.fillStyle = "#f4efe4";
    ctx.font = "700 54px Syne, Georgia, serif";
    ctx.textAlign = "left";
    ctx.fillText("Noctis", 176, layout.header * 0.48);
    ctx.fillStyle = "#e4b86a";
    ctx.font = "600 16px Figtree, sans-serif";
    ctx.fillText("CLINIC", 176, layout.header * 0.7);
  }
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, layout.h - layout.footer, layout.w, layout.footer);
  drawStar(ctx, star, 36, layout.h - layout.footer + 12, 72);
  ctx.fillStyle = "#e4b86a";
  ctx.font = "600 22px Figtree, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Written by Noctis   ·   Noctis Clinic", layout.w / 2, layout.h - layout.footer + 36);
  ctx.fillStyle = "#f4efe4";
  ctx.font = "500 16px Figtree, sans-serif";
  ctx.fillText(`Page ${pageNo} of ${pages}`, layout.w / 2, layout.h - 22);
}

function blocksOf(input: PaperSheetInput): Block[] {
  const blocks: Block[] = [
    { text: "WHITE PAPER", font: "600 18px Figtree, sans-serif", color: "#3d5a80", gap: 28, size: 18 },
    { text: input.title || "White paper", font: "700 42px Syne, Georgia, serif", color: "#1a1d23", gap: 36, size: 42 },
    { text: "Written by Noctis  ·  Noctis Clinic", font: "600 22px Figtree, sans-serif", color: "#8a5e22", gap: 36, size: 22 },
  ];
  if (input.source && !/written by vibe/i.test(input.source)) {
    blocks.push({ text: `Source  ·  ${input.source}`, font: "500 18px Figtree, sans-serif", color: "#5c6570", gap: 28, size: 18 });
  }
  if (input.lede.trim()) blocks.push({ text: input.lede.trim(), font: "400 26px Figtree, Georgia, serif", color: "#1a1d23", gap: 32, size: 26 });
  for (const step of input.steps) {
    const clean = step.trim();
    if (!clean || clean === input.title || /^written by vibe/i.test(clean)) continue;
    const [head, ...rest] = clean.split(/\n\n/);
    const titled = rest.length > 0 && head.length < 90 && head !== input.title;
    if (titled) blocks.push({ text: head, font: "700 28px Syne, Georgia, serif", color: "#1d3557", gap: 16, size: 28 });
    for (const line of (titled ? rest.join("\n") : clean).split("\n").map((row) => row.trim()).filter(Boolean)) {
      if (line.startsWith("• ")) {
        blocks.push({ text: line, font: "400 24px Figtree, Georgia, serif", color: "#1a1d23", gap: 34, size: 24 });
      } else {
        blocks.push({ text: line, font: "400 26px Figtree, Georgia, serif", color: "#1a1d23", gap: 32, size: 26 });
      }
    }
  }
  return blocks;
}

export function lessonToPaper(raw: string): PaperSheetInput {
  const text = raw
    .replace(/\r/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .split(/\n\s*Claim standing:/i)[0]
    .trim();
  const lines = text.split("\n").map((line) => line.trim()).filter((line) => line && !/^written by vibe/i.test(line) && !/^source\s*[·|-]/i.test(line));
  let title = "";
  const sections: { head: string; body: string[] }[] = [];
  let current: { head: string; body: string[] } | null = null;
  const use = (head: string) => {
    current = { head, body: [] };
    sections.push(current);
  };
  for (const line of lines) {
    const heading = line.match(/^#{1,3}\s+(.+)/);
    const bullet = line.match(/^(?:[-*]|\d+[.)])\s+(.+)/);
    if (heading) {
      if (!title) title = heading[1];
      else use(heading[1]);
      continue;
    }
    if (!title && line.length < 90 && !bullet) {
      title = line.replace(/[.?!]$/, "");
      continue;
    }
    if (/\?$/.test(line) && line.length < 160) {
      use(line);
      continue;
    }
    if (line.length < 48 && !/[.?!]$/.test(line) && !bullet) {
      use(line);
      continue;
    }
    if (!current) use("");
    current!.body.push(bullet ? `• ${bullet[1]}` : line);
  }
  const opening = sections.find((section) => !section.head);
  const lede = (opening?.body.filter((line) => !line.startsWith("• ")).slice(0, 2).join(" ") || "").slice(0, 420);
  const steps = sections.flatMap((section) => {
    const body = section.body.join("\n");
    if (!section.head) return section.body.some((line) => line.startsWith("• ")) ? [`Points\n\n${section.body.filter((line) => line.startsWith("• ")).join("\n")}`] : [];
    return [`${section.head}\n\n${body}`];
  });
  return { title: title || "Noctis lesson", lede, source: "", steps };
}

function logoBounds(img: HTMLImageElement) {
  const sample = document.createElement("canvas");
  sample.width = img.width;
  sample.height = img.height;
  const ctx = sample.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, sample.width, sample.height).data;
  let minX = sample.width;
  let minY = sample.height;
  let maxX = 0;
  let maxY = 0;
  const step = 3;
  for (let y = 0; y < sample.height; y += step) {
    for (let x = 0; x < sample.width; x += step) {
      const p = (y * sample.width + x) * 4;
      const navy = data[p]! < 45 && data[p + 1]! < 55 && data[p + 2]! < 80;
      if (navy) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX <= minX || maxY <= minY) return null;
  const pad = 28;
  const sx = Math.max(0, minX - pad);
  const sy = Math.max(0, minY - pad);
  return { x: sx, y: sy, w: Math.min(sample.width - sx, maxX - minX + pad * 2), h: Math.min(sample.height - sy, maxY - minY + pad * 2) };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function paintSocial(ctx: CanvasRenderingContext2D, mark: HTMLImageElement | null, star: HTMLImageElement | null, layout: SheetLayout, fit: PaperFit, input: PaperSheetInput) {
  const { w, h } = layout;
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, w, h);
  const crop = mark ? logoBounds(mark) : null;
  const landscape = fit === "x";
  const band = landscape ? 560 : layout.header || 300;
  if (mark && crop) {
    const boxW = landscape ? band - 96 : w - 220;
    const boxH = landscape ? h - 160 : band - 56;
    const scale = Math.min(boxW / crop.w, boxH / crop.h);
    const dw = crop.w * scale;
    const dh = crop.h * scale;
    const dx = landscape ? (band - dw) / 2 : (w - dw) / 2;
    const dy = landscape ? (h - dh) / 2 : (band - dh) / 2;
    ctx.drawImage(mark, crop.x, crop.y, crop.w, crop.h, dx, dy, dw, dh);
    drawStar(ctx, star, landscape ? 36 : 28, landscape ? 36 : 24, landscape ? 88 : 72);
  } else {
    drawStar(ctx, star, landscape ? (band - 140) / 2 : (w - 140) / 2, landscape ? (h - 140) / 2 : 40, 140);
    ctx.fillStyle = "#f4efe4";
    ctx.textAlign = "center";
    ctx.font = "700 64px Syne, Georgia, serif";
    ctx.fillText("Noctis", landscape ? band / 2 : w / 2, landscape ? h / 2 : band / 2);
  }
  const panelX = landscape ? band + 28 : 48;
  const panelY = landscape ? 40 : band + 16;
  const panelW = landscape ? w - panelX - 40 : w - 96;
  const panelH = landscape ? h - 80 : h - panelY - 40;
  ctx.fillStyle = "#f7f7f4";
  roundRect(ctx, panelX, panelY, panelW, panelH, 32);
  ctx.fill();
  const textX = panelX + 52;
  const textW = panelW - 104;
  let y = panelY + 72;
  const bottom = panelY + panelH - 78;
  ctx.textAlign = "left";
  ctx.fillStyle = "#8a5e22";
  ctx.font = "600 18px Figtree, sans-serif";
  const kicker = fit === "linkedin" ? "LINKEDIN BRIEF" : fit === "facebook" ? "FACEBOOK" : fit === "whatsapp" ? "WHATSAPP" : fit === "instagram" ? "INSTAGRAM" : "NOTE";
  ctx.fillText(kicker, textX, y);
  y += 42;
  ctx.fillStyle = "#1a1d23";
  const titleSize = landscape ? 40 : fit === "facebook" ? 40 : 44;
  ctx.font = `700 ${titleSize}px Syne, Georgia, serif`;
  for (const line of wrap(ctx, input.title || "White paper", textW).slice(0, 3)) {
    if (y > bottom - 90) break;
    ctx.fillText(line, textX, y);
    y += titleSize + 10;
  }
  y += 6;
  ctx.strokeStyle = "#e4b86a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(textX, y);
  ctx.lineTo(textX + 92, y);
  ctx.stroke();
  y += 40;
  ctx.fillStyle = "#1a1d23";
  const bodySize = landscape ? 26 : 30;
  ctx.font = `400 ${bodySize}px Figtree, Georgia, serif`;
  const body = [input.lede, ...input.steps].filter(Boolean).join("  ");
  for (const line of wrap(ctx, body, textW)) {
    if (y + bodySize > bottom) break;
    ctx.fillText(line, textX, y);
    y += bodySize + 14;
  }
  ctx.fillStyle = "#5c6570";
  ctx.font = "600 18px Figtree, sans-serif";
  ctx.fillText("Written by Noctis  ·  Noctis Clinic", textX, panelY + panelH - 40);
}

async function canvasBlob(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  if (!blob) throw new Error("The paper page did not render.");
  return new Uint8Array(await blob.arrayBuffer());
}

async function pageFile(canvas: HTMLCanvasElement, fit: PaperFit) {
  const jpeg = await canvasBlob(canvas);
  const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  const pdfBytes = pdfFromJpegs([{ jpeg, w: canvas.width, h: canvas.height }]);
  const pdf = new File([pdfBytes], fit === "full" ? "vibetok-white-paper.pdf" : `vibetok-${fit}.pdf`, { type: "application/pdf" });
  const images = png ? [new File([png], `vibetok-${fit}.png`, { type: "image/png" })] : [];
  return { pdf, images, pages: [{ jpeg, w: canvas.width, h: canvas.height }] };
}

function shortTitle(line: string) {
  const clean = line.replace(/^#+\s*/, "").replace(/[.?!]$/, "").trim();
  if (clean.length <= 36 && !/\b(are|is|was|were|both)\b/i.test(clean)) return clean || "Noctis lesson";
  const cut = clean.split(/\s+(?:are|is|was|were|means|help|helps|both)\s+/i)[0]?.trim() || "";
  if (cut.length >= 3 && cut.length < 42 && cut !== clean) return cut;
  return clean.split(/\s+/).slice(0, 5).join(" ") || "Noctis lesson";
}

function arrangePaper(input: PaperSheetInput): PaperSheetInput {
  const title = shortTitle(input.title || "Noctis lesson");
  const spoken = (input.title || "").replace(/^#+\s*/, "").trim();
  const opening = spoken && spoken.replace(/[.?!]$/, "") !== title ? spoken : "";
  const source = !input.source || /written by vibe|^vibe\b/i.test(input.source) ? "" : input.source;
  const steps = input.steps.map((step) => step.replace(/\*\*(.+?)\*\*/g, "$1").trim()).filter((step) => step && !/^written by vibe/i.test(step) && !/^source\s*[·|-]/i.test(step));
  const blob = [opening, input.lede, ...steps].filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  const names = title.split(/\s+and\s+/i).map((part) => part.trim()).filter((part) => part.length > 1 && part.length < 28);
  if (names.length === 2) {
    const at = blob.search(new RegExp(`(?:^|[.!?]\\s+)${names[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"));
    if (at > 30) {
      return {
        ...input,
        title,
        lede: "",
        source,
        steps: [`${names[0]}\n\n${blob.slice(0, at).trim()}`, `${names[1]}\n\n${blob.slice(at).trim()}`],
      };
    }
  }
  return { ...input, title, lede: [opening, input.lede].filter(Boolean).join(" ").replace(/\s+/g, " ").trim(), source, steps };
}

export async function renderVibePaper(input: PaperSheetInput) {
  const fit = input.fit ?? "full";
  const layout = LAYOUTS[fit];
  const ready = (input.fit ?? "full") === "full" ? arrangePaper({ ...input, fit }) : { ...input, fit, source: !input.source || /written by vibe/i.test(input.source) ? "" : input.source };
  const shaped = fitted(ready);
  await document.fonts.ready.catch(() => undefined);
  const [lockup, star] = await Promise.all([loadImage("/brand/lockup.jpg"), loadImage("/brand/mark.jpg")]);
  if (fit !== "full") {
    const canvas = document.createElement("canvas");
    canvas.width = layout.w;
    canvas.height = layout.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("This browser cannot format the paper.");
    paintSocial(ctx, lockup, star, layout, fit, shaped);
    const file = await pageFile(canvas, fit);
    return { pdf: file.pdf, images: file.images, caption: paperCaption({ ...input, fit }) };
  }
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) throw new Error("This browser cannot format the paper.");
  const width = layout.w - MARGIN * 2;
  const drafted: { font: string; color: string; line: string; gap: number }[] = [];
  for (const block of blocksOf(shaped)) {
    for (const chunk of block.text.split("\n").map((line) => line.trim()).filter(Boolean)) {
      measure.font = block.font;
      const lines = wrap(measure, chunk, width);
      lines.forEach((line, index) => {
        drafted.push({
          font: block.font,
          color: block.color,
          line,
          gap: index === lines.length - 1 ? Math.max(block.gap, Math.round(block.size * 1.7)) : Math.round(block.size * 1.45),
        });
      });
    }
  }
  const contentTop = layout.header + 56;
  const contentBottom = layout.h - layout.footer - 28;
  const pageLines: typeof drafted[] = [];
  let cursor = contentTop;
  let bucket: typeof drafted = [];
  for (const row of drafted) {
    if (cursor + row.gap > contentBottom && bucket.length) {
      pageLines.push(bucket);
      bucket = [];
      cursor = contentTop;
    }
    bucket.push(row);
    cursor += row.gap;
  }
  if (bucket.length) pageLines.push(bucket);
  const sheets = pageLines.length ? pageLines : [[]];
  const jpegs: { jpeg: Uint8Array; w: number; h: number }[] = [];
  const pngPages: Blob[] = [];
  for (let index = 0; index < sheets.length; index += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = layout.w;
    canvas.height = layout.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("This browser cannot format the paper.");
    paintChrome(ctx, lockup, star, index + 1, sheets.length, layout);
    ctx.textAlign = "left";
    let y = contentTop;
    for (const row of sheets[index] ?? []) {
      ctx.font = row.font;
      ctx.fillStyle = row.color;
      ctx.fillText(row.line, MARGIN + (row.line.startsWith("• ") ? 12 : 0), y);
      y += row.gap;
    }
    jpegs.push({ jpeg: await canvasBlob(canvas), w: layout.w, h: layout.h });
    const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (png) pngPages.push(png);
  }
  const pdf = new File([pdfFromJpegs(jpegs)], "vibetok-white-paper.pdf", { type: "application/pdf" });
  const images = pngPages.map((blob, index) => new File([blob], `vibetok-white-paper-${index + 1}.png`, { type: "image/png" }));
  return { pdf, images, caption: paperCaption({ ...input, fit }) };
}
