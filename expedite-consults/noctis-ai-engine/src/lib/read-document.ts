function latin1(bytes: Uint8Array) {
  let text = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return text;
}

async function inflate(data: Uint8Array, format: "deflate" | "deflate-raw") {
  const copy = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  const stream = new Blob([copy]).stream().pipeThrough(new DecompressionStream(format));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function decodePdfString(body: string) {
  const bytes: number[] = [];
  for (let i = 0; i < body.length; i += 1) {
    if (body[i] !== "\\") {
      bytes.push(body.charCodeAt(i) & 255);
      continue;
    }
    const next = body[(i += 1)];
    if (!next) break;
    if (next === "n") bytes.push(10);
    else if (next === "r") bytes.push(13);
    else if (next === "t") bytes.push(9);
    else if (next === "b") bytes.push(8);
    else if (next === "f") bytes.push(12);
    else if (next === "(" || next === ")" || next === "\\") bytes.push(next.charCodeAt(0));
    else if (next >= "0" && next <= "7") {
      let oct = next;
      for (let k = 0; k < 2 && body[i + 1] >= "0" && body[i + 1] <= "7"; k += 1) oct += body[(i += 1)];
      bytes.push(Number.parseInt(oct, 8));
    } else bytes.push(next.charCodeAt(0));
  }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    let text = "";
    for (let i = 2; i + 1 < bytes.length; i += 2) text += String.fromCharCode((bytes[i]! << 8) | bytes[i + 1]!);
    return text;
  }
  return new TextDecoder("windows-1252").decode(Uint8Array.from(bytes));
}

function pullPdfText(content: string) {
  const parts: string[] = [];
  const re = /\(((?:\\[0-7]{1,3}|\\.|[^\\)])*)\)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) && parts.length < 2500) {
    const decoded = decodePdfString(match[1] || "").replace(/\s+/g, " ").trim();
    if (/[A-Za-z0-9]/.test(decoded)) parts.push(decoded);
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export async function textFromPdf(buffer: ArrayBuffer) {
  try {
    const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
    if (!GlobalWorkerOptions.workerSrc) {
      const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
      GlobalWorkerOptions.workerSrc = worker.default;
    }
    const task = getDocument({ data: new Uint8Array(buffer) });
    const doc = await task.promise;
    const pages: string[] = [];
    const count = Math.min(doc.numPages, 30);
    for (let i = 1; i <= count; i += 1) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const line = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (line) pages.push(line);
    }
    await doc.destroy();
    const text = pages.join("\n").replace(/\n{3,}/g, "\n\n").trim();
    if (text) return text.slice(0, 18000);
  } catch {
    /* A few PDFs still yield to the plain reader below. */
  }
  const bytes = new Uint8Array(buffer);
  const raw = latin1(bytes);
  const parts: string[] = [];
  const streams = /\/FlateDecode\b[\s\S]{0,500}?stream\r?\n/g;
  let hit: RegExpExecArray | null;
  while ((hit = streams.exec(raw)) && parts.length < 40) {
    const start = hit.index + hit[0].length;
    const end = raw.indexOf("endstream", start);
    if (end < 0) break;
    let data = bytes.subarray(start, end);
    if (data.at(-1) === 0x0a) data = data.subarray(0, -1);
    if (data.at(-1) === 0x0d) data = data.subarray(0, -1);
    try {
      const opened = latin1(await inflate(data, "deflate"));
      if (!/Tj|TJ|'/.test(opened)) continue;
      const text = pullPdfText(opened);
      if (text) parts.push(text);
    } catch {
      /* this stream is not page text */
    }
  }
  const loose = parts.length ? "" : pullPdfText(raw);
  return [...parts, loose].filter(Boolean).join("\n").replace(/\s+/g, " ").trim().slice(0, 18000);
}

export async function textFromDocx(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let offset = 0;
  let xml = "";
  while (offset + 30 < bytes.length && view.getUint32(offset, true) === 0x04034b50) {
    const method = view.getUint16(offset + 8, true);
    const size = view.getUint32(offset + 18, true);
    const nameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const name = new TextDecoder().decode(bytes.subarray(nameStart, nameStart + nameLen));
    const dataStart = nameStart + nameLen + extraLen;
    const data = bytes.subarray(dataStart, dataStart + size);
    if (name === "word/document.xml") {
      if (method === 0) xml = new TextDecoder().decode(data);
      else if (method === 8) xml = new TextDecoder().decode(await inflate(data, "deflate-raw"));
      break;
    }
    offset = dataStart + size;
  }
  if (!xml) return "";
  return xml
    .replace(/<w:tab\/>/g, " ")
    .replace(/<w:br\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 18000);
}

export function textFromRtf(raw: string) {
  return raw
    .replace(/\\par[d]?/g, "\n")
    .replace(/\\'[0-9a-f]{2}/gi, (mark) => String.fromCharCode(Number.parseInt(mark.slice(2), 16)))
    .replace(/\\[a-z]+-?\d* ?/gi, "")
    .replace(/[{}]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 18000);
}
