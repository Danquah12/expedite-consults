export interface CardRenderParams {
  title: string;
  occasion?: string;
  artworkKey?: string;
  message: string;
  senderName?: string;
  envelopeColor?: string;
  paperStock?: string;
  imageUrl?: string;
}

export interface RenderedCardImage {
  blob: Blob;
  dataUrl: string;
  file: File;
  filename: string;
}

const OCCASION_BILINGUAL_MAP: Record<string, string> = {
  thanksgiving: "Thanksgiving · Action de Grâce",
  christmas: "Christmas · Noël",
  "new-year": "New Year's Eve · Nouvel An",
  "new year's eve": "New Year's Eve · Nouvel An",
  valentine: "Valentine's Day · Saint-Valentin",
  "valentine's day": "Valentine's Day · Saint-Valentin",
  "mothers-day": "Mother's Day · Fête des Mères",
  "mother's day": "Mother's Day · Fête des Mères",
  "fathers-day": "Father's Day · Fête des Pères",
  "father's day": "Father's Day · Fête des Pères",
  easter: "Easter & Spring · Pâques",
  "easter & spring": "Easter & Spring · Pâques",
  birthday: "Birthday · Anniversaire",
  wedding: "Wedding · Mariage",
  anniversary: "Anniversary · Anniversaire de Mariage",
  housewarming: "Housewarming · Crémaillère",
  "new-baby": "Baby Shower · Naissance",
  "baby shower": "Baby Shower · Naissance",
};

export function formatBilingualOccasion(
  occasion?: string,
  artworkKey?: string
): string {
  if (occasion && occasion.includes("·")) return occasion.trim();
  const key1 = (artworkKey || "").trim().toLowerCase();
  if (key1 && OCCASION_BILINGUAL_MAP[key1]) {
    return OCCASION_BILINGUAL_MAP[key1];
  }
  const key2 = (occasion || "").trim().toLowerCase();
  if (key2 && OCCASION_BILINGUAL_MAP[key2]) {
    return OCCASION_BILINGUAL_MAP[key2];
  }
  if (occasion?.trim()) {
    return occasion.trim();
  }
  return "Thanksgiving · Action de Grâce";
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const paragraphs = text.replace(/\r/g, "").split("\n");
  const lines: string[] = [];

  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      if (lines.length < maxLines) lines.push("");
      continue;
    }
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth) {
        current = test;
      } else {
        if (current) lines.push(current);
        current = word;
        if (lines.length >= maxLines) break;
      }
    }
    if (current && lines.length < maxLines) {
      lines.push(current);
    }
    if (lines.length >= maxLines) break;
  }

  if (lines.length > maxLines) {
    lines.length = maxLines;
  }
  if (lines.length === maxLines && paragraphs.join(" ").length > 10) {
    const last = lines[maxLines - 1] ?? "";
    if (!last.endsWith("...")) {
      lines[maxLines - 1] = last.length > 3 ? `${last.slice(0, -3)}...` : last;
    }
  }
  return lines;
}

function loadCorsImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Renders the exact vertical Keepsake Stationery Card shown in the user's screenshots:
 * 1. Top Navy Banner (#1B2A4A): CONNECTLN KEEPSAKE + Title + Bilingual Occasion
 * 2. Upper Cream Stage (#F3F1EC): Centered vertical greeting card artwork
 * 3. Lower White Message Body (#FFFFFF): "Warm greetings,", gold-left-bordered quote box,
 *    right-aligned sender signature + "Presented on <Stock> · <Envelope> Envelope",
 *    and centered navy pill CTA "Send Your Own Keepsake Card"
 * 4. Bottom Footer Strip (#F3F1EC): "Sent via ConnectLn Keepsake · Fine Letterpress & Digital Stationery"
 */
export async function renderPersonalizedCardPng(
  params: CardRenderParams
): Promise<RenderedCardImage> {
  const width = 900;
  const height = 1340;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2D canvas context unavailable.");
  }

  // Outer warm cream page backdrop (#FAF9F7)
  ctx.fillStyle = "#FAF9F7";
  ctx.fillRect(0, 0, width, height);

  const cardX = 50;
  const cardY = 32;
  const cardW = 800;
  const cardH = 1276;
  const cardR = 28;

  // Clip everything inside the rounded 28px stationery card container
  ctx.save();
  drawRoundedRectPath(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.clip();

  // 1. Top Navy Header (#1B2A4A)
  const headerH = 152;
  ctx.fillStyle = "#1B2A4A";
  ctx.fillRect(cardX, cardY, cardW, headerH);

  ctx.textAlign = "center";
  ctx.fillStyle = "#B8935A";
  ctx.font = "700 14px 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";
  ctx.fillText("C O N N E C T L N   K E E P S A K E", width / 2, cardY + 42);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 38px Georgia, 'Times New Roman', serif";
  ctx.fillText(params.title || "Golden Harvest", width / 2, cardY + 92);

  const bilingualOccasion = formatBilingualOccasion(
    params.occasion,
    params.artworkKey
  );
  ctx.fillStyle = "#CBD5E1";
  ctx.font = "400 18px 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";
  ctx.fillText(bilingualOccasion, width / 2, cardY + 126);

  // 2. Upper Cream Artwork Stage (#F3F1EC)
  const stageY = cardY + headerH;
  const stageH = 540;
  ctx.fillStyle = "#F3F1EC";
  ctx.fillRect(cardX, stageY, cardW, stageH);

  const img = params.imageUrl ? await loadCorsImage(params.imageUrl) : null;
  const artW = 368;
  const artH = 472;
  const artX = Math.round((width - artW) / 2);
  const artY = stageY + 34;

  // Card artwork frame & shadow
  ctx.save();
  ctx.shadowColor = "rgba(27, 42, 74, 0.10)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 6;
  drawRoundedRectPath(ctx, artX, artY, artW, artH, 16);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.restore();

  if (img) {
    ctx.save();
    drawRoundedRectPath(ctx, artX, artY, artW, artH, 16);
    ctx.clip();
    const targetRatio = artW / artH;
    const imgRatio = img.width / img.height;
    let sx = 0;
    let sy = 0;
    let sw = img.width;
    let sh = img.height;
    if (imgRatio > targetRatio) {
      sw = img.height * targetRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / targetRatio;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, artX, artY, artW, artH);
    ctx.restore();
  }

  ctx.save();
  drawRoundedRectPath(ctx, artX, artY, artW, artH, 16);
  ctx.strokeStyle = "#D8D0C5";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // 3. Lower White Message Body (#FFFFFF)
  const bodyY = stageY + stageH;
  const footerH = 72;
  const bodyH = cardH - headerH - stageH - footerH;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(cardX, bodyY, cardW, bodyH);

  const padX = cardX + 54;
  const contentW = cardW - 108;

  // "Warm greetings,"
  ctx.textAlign = "left";
  ctx.fillStyle = "#7C6239";
  ctx.font = "600 19px 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";
  ctx.fillText("Warm greetings,", padX, bodyY + 48);

  // Quote box (#FAF9F7 with 4px #B8935A left border)
  ctx.font = "italic 26px Georgia, 'Times New Roman', serif";
  const quotedMsg = `“${(params.message || "Grateful for every shared table, warm conversation, and autumn memory we gather this Thanksgiving.").trim()}”`;
  const msgLines = wrapCanvasText(ctx, quotedMsg, contentW - 56, 4);
  const lineH = 38;
  const quoteBoxY = bodyY + 68;
  const quoteBoxH = Math.max(108, msgLines.length * lineH + 34);

  ctx.save();
  drawRoundedRectPath(ctx, padX, quoteBoxY, contentW, quoteBoxH, 14);
  ctx.fillStyle = "#FAF9F7";
  ctx.fill();
  ctx.restore();

  // Gold left accent bar
  ctx.fillStyle = "#B8935A";
  ctx.fillRect(padX, quoteBoxY, 5, quoteBoxH);

  // Draw quoted italic message lines
  ctx.fillStyle = "#1B2A4A";
  ctx.font = "italic 26px Georgia, 'Times New Roman', serif";
  let textY = quoteBoxY + 42;
  for (const line of msgLines) {
    ctx.fillText(line, padX + 26, textY);
    textY += lineH;
  }

  // Right-aligned Sender Signature + Stock/Envelope subtitle
  const senderDisplay = (params.senderName || "Kwesi Asiedu").trim();
  const stockDisplay = (params.paperStock || "Handmade Stock").trim();
  const envelopeDisplay = (params.envelopeColor || "Cotton Ivory").trim();

  const sigY = quoteBoxY + quoteBoxH + 46;
  ctx.textAlign = "right";
  ctx.fillStyle = "#1B2A4A";
  ctx.font = "600 25px Georgia, 'Times New Roman', serif";
  ctx.fillText(senderDisplay, cardX + cardW - 54, sigY);

  ctx.fillStyle = "#5A6475";
  ctx.font = "400 16px 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";
  ctx.fillText(
    `Presented on ${stockDisplay} · ${envelopeDisplay} Envelope`,
    cardX + cardW - 54,
    sigY + 28
  );

  // Centered Navy Pill CTA: "Send Your Own Keepsake Card"
  const pillW = 330;
  const pillH = 54;
  const pillX = Math.round((width - pillW) / 2);
  const pillY = sigY + 60;
  ctx.save();
  drawRoundedRectPath(ctx, pillX, pillY, pillW, pillH, 27);
  ctx.fillStyle = "#1B2A4A";
  ctx.fill();
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 18px 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";
  ctx.fillText("Send Your Own Keepsake Card", width / 2, pillY + 33);

  // 4. Bottom Footer Strip (#F3F1EC)
  const footerY = cardY + cardH - footerH;
  ctx.fillStyle = "#F3F1EC";
  ctx.fillRect(cardX, footerY, cardW, footerH);
  ctx.strokeStyle = "#E5E0D8";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cardX, footerY);
  ctx.lineTo(cardX + cardW, footerY);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#5A6475";
  ctx.font = "500 15px 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";
  ctx.fillText(
    "Sent via ConnectLn Keepsake · Fine Letterpress & Digital Stationery",
    width / 2,
    footerY + 42
  );

  ctx.restore();

  // Outer card border (#E5E0D8)
  ctx.save();
  drawRoundedRectPath(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.strokeStyle = "#E5E0D8";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  const slug =
    params.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "keepsake-card";
  const filename = `${slug}-connectln-card.png`;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to encode PNG."))),
      "image/png"
    );
  });
  const dataUrl = canvas.toDataURL("image/png");
  const file = new File([blob], filename, { type: "image/png" });

  return { blob, dataUrl, file, filename };
}

export async function copyCardImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (
      typeof navigator === "undefined" ||
      !navigator.clipboard ||
      typeof ClipboardItem === "undefined"
    ) {
      return false;
    }
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

export function downloadCardBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function shareCardFileNatively(
  file: File,
  title: string,
  text: string
): Promise<"shared" | "cancelled" | "unsupported"> {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.share !== "function"
  ) {
    return "unsupported";
  }
  try {
    if (
      typeof navigator.canShare === "function" &&
      !navigator.canShare({ files: [file] })
    ) {
      return "unsupported";
    }
    await navigator.share({
      title,
      text,
      files: [file],
    });
    return "shared";
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return "cancelled";
    }
    return "unsupported";
  }
}
