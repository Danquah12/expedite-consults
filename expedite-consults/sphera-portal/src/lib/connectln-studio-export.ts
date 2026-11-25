import { colIndexToLabel, parseCellKey } from './connectln-sheets-engine'

export interface DocExportPageSetup {
  paperSize?: 'letter' | 'a4' | 'legal'
  orientation?: 'portrait' | 'landscape'
  margins?: 'normal' | 'narrow' | 'moderate' | 'wide'
  columns?: 1 | 2 | 3
  lineSpacing?: string
  headerText?: string
  footerText?: string
  showPageNumbers?: boolean
  watermark?: string
  pageBg?: string
  pageBorder?: 'none' | 'thin' | 'double' | 'accent'
}

export interface DocExportBlock {
  type: 'h1' | 'h2' | 'h3' | 'p' | 'li' | 'quote' | 'hr' | 'pagebreak' | 'table'
  text: string
  rows?: string[][]
}

export interface SheetExportCell {
  raw: string
  evaluated?: string | number | boolean
  isNumeric?: boolean
}

export interface SheetExportTab {
  name: string
  rowCount: number
  colCount: number
  cells: Record<string, SheetExportCell>
}

export interface SlideExportMetric {
  value: string
  label: string
  delta?: string
}

export interface SlideExportItem {
  title: string
  subtitle?: string
  layout: string
  bullets?: string[]
  leftTitle?: string
  leftBullets?: string[]
  rightTitle?: string
  rightBullets?: string[]
  metrics?: SlideExportMetric[]
  quote?: string
  quoteAuthor?: string
  notes?: string
  customBgHex?: string
  hidden?: boolean
  tableData?: { headers: string[]; rows: string[][] }
  chartData?: { kind: string; title: string; items: Array<{ label: string; value: number }> }
  elements?: Array<{ id: string; kind: string; text: string; bgHex?: string; textHex?: string }>
}

export interface SlideThemePalette {
  id: string
  name: string
  bgHex: string
  surfaceHex: string
  primaryHex: string
  accentHex: string
  textHex: string
  mutedHex: string
}

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder('utf-8', { fatal: false })

export function escapeXml(input: string): string {
  return String(input ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function escapeHtml(input: string): string {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function sanitizeSafeHtml(html: string): string {
  let clean = String(html ?? '')
  clean = clean
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object\b[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"')
    .replace(/(href|src)\s*=\s*javascript:[^\s>]*/gi, '$1="#"')
  return clean
}

function decodeBasicHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, num) => {
      const code = Number.parseInt(num, 10)
      return Number.isFinite(code) && code > 0 ? String.fromCharCode(code) : ''
    })
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[i] = c >>> 0
  }
  return table
})()

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i++) {
    c = CRC32_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

export function buildStoredZipBytes(
  entries: Array<{ name: string; data: Uint8Array | string }>
): Uint8Array {
  const prepared = entries.map((entry) => {
    const cleanName = entry.name.replace(/^\/+/, '')
    const nameBytes = textEncoder.encode(cleanName)
    const contentBytes =
      typeof entry.data === 'string' ? textEncoder.encode(entry.data) : entry.data
    return {
      nameBytes,
      contentBytes,
      crc: crc32(contentBytes),
    }
  })

  const localChunks: Uint8Array[] = []
  const centralChunks: Uint8Array[] = []
  let offset = 0

  for (const item of prepared) {
    const localHeader = new Uint8Array(30 + item.nameBytes.length)
    const lv = new DataView(localHeader.buffer)
    lv.setUint32(0, 0x04034b50, true) // Local file header signature
    lv.setUint16(4, 20, true) // Version needed
    lv.setUint16(6, 0x0800, true) // UTF-8 filename flag
    lv.setUint16(8, 0, true) // Stored (method 0)
    lv.setUint16(10, 0, true) // Mod time
    lv.setUint16(12, 0x5421, true) // Mod date
    lv.setUint32(14, item.crc, true)
    lv.setUint32(18, item.contentBytes.length, true)
    lv.setUint32(22, item.contentBytes.length, true)
    lv.setUint16(26, item.nameBytes.length, true)
    lv.setUint16(28, 0, true) // Extra length
    localHeader.set(item.nameBytes, 30)

    localChunks.push(localHeader, item.contentBytes)

    const centralHeader = new Uint8Array(46 + item.nameBytes.length)
    const cv = new DataView(centralHeader.buffer)
    cv.setUint32(0, 0x02014b50, true) // Central directory signature
    cv.setUint16(4, 20, true) // Version made by
    cv.setUint16(6, 20, true) // Version needed
    cv.setUint16(8, 0x0800, true) // UTF-8 flag
    cv.setUint16(10, 0, true) // Stored
    cv.setUint16(12, 0, true) // Mod time
    cv.setUint16(14, 0x5421, true) // Mod date
    cv.setUint32(16, item.crc, true)
    cv.setUint32(20, item.contentBytes.length, true)
    cv.setUint32(24, item.contentBytes.length, true)
    cv.setUint16(28, item.nameBytes.length, true)
    cv.setUint16(30, 0, true) // Extra length
    cv.setUint16(32, 0, true) // Comment length
    cv.setUint16(34, 0, true) // Disk start
    cv.setUint16(36, 0, true) // Internal attrs
    cv.setUint32(38, 0, true) // External attrs
    cv.setUint32(42, offset, true) // Local header offset
    centralHeader.set(item.nameBytes, 46)

    centralChunks.push(centralHeader)
    offset += localHeader.length + item.contentBytes.length
  }

  const centralSize = centralChunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const eocd = new Uint8Array(22)
  const ev = new DataView(eocd.buffer)
  ev.setUint32(0, 0x06054b50, true) // End of central directory signature
  ev.setUint16(4, 0, true)
  ev.setUint16(6, 0, true)
  ev.setUint16(8, prepared.length, true)
  ev.setUint16(10, prepared.length, true)
  ev.setUint32(12, centralSize, true)
  ev.setUint32(16, offset, true)
  ev.setUint16(20, 0, true)

  const totalSize = offset + centralSize + eocd.length
  const out = new Uint8Array(totalSize)
  let cursor = 0
  for (const chunk of localChunks) {
    out.set(chunk, cursor)
    cursor += chunk.length
  }
  for (const chunk of centralChunks) {
    out.set(chunk, cursor)
    cursor += chunk.length
  }
  out.set(eocd, cursor)
  return out
}

function stripTagsToText(fragment: string): string {
  return decodeBasicHtmlEntities(
    fragment
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/td>\s*<td[^>]*>/gi, ' | ')
      .replace(/<\/th>\s*<th[^>]*>/gi, ' | ')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/[ \t]+/g, ' ')
    .trim()
}

function extractTableRowsFromHtml(tableHtml: string): string[][] {
  const rows: string[][] = []
  const trMatches = tableHtml.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || []
  for (const tr of trMatches) {
    const cells: string[] = []
    const cellRegex = /<(th|td)\b[^>]*>([\s\S]*?)<\/\1>/gi
    let cm: RegExpExecArray | null
    while ((cm = cellRegex.exec(tr)) !== null) {
      cells.push(stripTagsToText(cm[2] || ''))
    }
    if (cells.length > 0) rows.push(cells)
  }
  return rows
}

export function extractDocBlocksFromHtml(html: string): DocExportBlock[] {
  const safe = sanitizeSafeHtml(html)
  const blocks: DocExportBlock[] = []
  const tokenRegex =
    /<div\b[^>]*data-page-break="true"[^>]*>[\s\S]*?<\/div>|<table\b[^>]*>[\s\S]*?<\/table>|<(h1|h2|h3|blockquote|li|p)\b[^>]*>([\s\S]*?)<\/\1>|<hr\b[^>]*\/?>/gi
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tokenRegex.exec(safe)) !== null) {
    if (match.index > lastIndex) {
      const gapText = stripTagsToText(safe.slice(lastIndex, match.index))
      if (gapText) {
        blocks.push({ type: 'p', text: gapText })
      }
    }
    lastIndex = tokenRegex.lastIndex

    const full = match[0]
    if (/data-page-break="true"/i.test(full)) {
      blocks.push({ type: 'pagebreak', text: '' })
      continue
    }
    if (/^<table\b/i.test(full)) {
      const rows = extractTableRowsFromHtml(full)
      if (rows.length > 0) {
        blocks.push({
          type: 'table',
          text: rows.map((r) => r.join(' | ')).join('\n'),
          rows,
        })
      }
      continue
    }
    if (!match[1]) {
      blocks.push({ type: 'hr', text: '' })
      continue
    }

    const tag = match[1].toLowerCase()
    const inner = match[2] || ''
    if (tag === 'p' && /<(h1|h2|h3|li|blockquote|table)\b/i.test(inner)) {
      const nested = extractDocBlocksFromHtml(inner)
      blocks.push(...nested)
      continue
    }

    const text = stripTagsToText(inner)
    if (!text) continue

    if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
      blocks.push({ type: tag, text })
    } else if (tag === 'li') {
      blocks.push({ type: 'li', text })
    } else if (tag === 'blockquote') {
      blocks.push({ type: 'quote', text })
    } else {
      blocks.push({ type: 'p', text })
    }
  }

  if (lastIndex < safe.length) {
    const tail = stripTagsToText(safe.slice(lastIndex))
    if (tail) {
      blocks.push({ type: 'p', text: tail })
    }
  }

  if (blocks.length === 0) {
    const plain = stripTagsToText(safe)
    if (plain) {
      blocks.push({ type: 'p', text: plain })
    }
  }

  return blocks
}

export function htmlToMarkdown(html: string): string {
  const blocks = extractDocBlocksFromHtml(html)
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'h1':
          return `# ${b.text}`
        case 'h2':
          return `## ${b.text}`
        case 'h3':
          return `### ${b.text}`
        case 'li':
          return `- ${b.text}`
        case 'quote':
          return `> ${b.text}`
        case 'hr':
          return '---'
        case 'p':
        default:
          return b.text
      }
    })
    .join('\n\n')
}

export function buildStandaloneHtmlDocument(title: string, bodyHtml: string): string {
  const safeBody = sanitizeSafeHtml(bodyHtml)
  const safeTitle = escapeHtml(title || 'ConnectLn Document')
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} — ConnectLn Docs</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #faf7f2;
      color: #0b1f3a;
      margin: 0;
      padding: 40px 20px;
      line-height: 1.65;
    }
    .page {
      max-width: 816px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e7e2da;
      border-radius: 12px;
      padding: 56px 64px;
      box-shadow: 0 12px 32px rgba(11, 31, 58, 0.06);
    }
    h1 { font-size: 26px; margin-top: 0; color: #0b1f3a; }
    h2 { font-size: 20px; color: #0b5cad; margin-top: 24px; }
    h3 { font-size: 16px; color: #0b1f3a; margin-top: 18px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
    th { background: #f3f4f6; font-weight: 700; }
    blockquote {
      border-left: 4px solid #0b5cad;
      margin: 16px 0;
      padding: 8px 16px;
      background: #f0f6ff;
      border-radius: 0 8px 8px 0;
    }
    .footer-brand {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      font-size: 11px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <article class="page">
    ${safeBody}
    <div class="footer-brand">Created with ConnectLn Docs · ConnectLn 360 Studio</div>
  </article>
</body>
</html>`
}

export function buildDocxBytes(
  title: string,
  blocksOrHtml: DocExportBlock[] | string,
  pageSetup?: DocExportPageSetup
): Uint8Array {
  const blocks =
    typeof blocksOrHtml === 'string' ? extractDocBlocksFromHtml(blocksOrHtml) : blocksOrHtml
  const safeTitle = escapeXml(title || 'ConnectLn Document')
  const nowIso = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')

  const baseDims =
    pageSetup?.paperSize === 'a4'
      ? { w: 11906, h: 16838 }
      : pageSetup?.paperSize === 'legal'
      ? { w: 12240, h: 20160 }
      : { w: 12240, h: 15840 }
  const isLandscape = pageSetup?.orientation === 'landscape'
  const pgW = isLandscape ? baseDims.h : baseDims.w
  const pgH = isLandscape ? baseDims.w : baseDims.h
  const orientAttr = isLandscape ? ' w:orient="landscape"' : ''
  const marTwips =
    pageSetup?.margins === 'narrow'
      ? 720
      : pageSetup?.margins === 'moderate'
      ? 1080
      : pageSetup?.margins === 'wide'
      ? 2160
      : 1440

  const bodyXml = blocks
    .map((block) => {
      if (block.type === 'pagebreak') {
        return `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`
      }
      if (block.type === 'table' && block.rows && block.rows.length > 0) {
        const rowsXml = block.rows
          .map((row, rIdx) => {
            const cellsXml = row
              .map((cellText) => {
                const shade = rIdx === 0 ? '<w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>' : ''
                const runBold = rIdx === 0 ? '<w:rPr><w:b/></w:rPr>' : ''
                return `<w:tc><w:tcPr>${shade}</w:tcPr><w:p><w:r>${runBold}<w:t xml:space="preserve">${escapeXml(
                  cellText
                )}</w:t></w:r></w:p></w:tc>`
              })
              .join('')
            return `<w:tr>${cellsXml}</w:tr>`
          })
          .join('')
        return `<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/></w:tblBorders></w:tblPr>${rowsXml}</w:tbl><w:p/>`
      }
      if (block.type === 'hr') {
        return `<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="D1D5DB"/></w:pBdr></w:pPr></w:p>`
      }
      const lines = block.text.split(/\n/)
      const runsXml = lines
        .map((line, idx) => {
          const br = idx > 0 ? '<w:br/>' : ''
          return `${br}<w:t xml:space="preserve">${escapeXml(line)}</w:t>`
        })
        .join('')

      if (block.type === 'h1') {
        return `<w:p><w:pPr><w:pStyle w:val="Heading1"/><w:spacing w:before="120" w:after="120"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="0B1F3A"/><w:sz w:val="36"/></w:rPr>${runsXml}</w:r></w:p>`
      }
      if (block.type === 'h2') {
        return `<w:p><w:pPr><w:pStyle w:val="Heading2"/><w:spacing w:before="160" w:after="80"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="0B5CAD"/><w:sz w:val="28"/></w:rPr>${runsXml}</w:r></w:p>`
      }
      if (block.type === 'h3') {
        return `<w:p><w:pPr><w:pStyle w:val="Heading3"/><w:spacing w:before="120" w:after="60"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="1E293B"/><w:sz w:val="24"/></w:rPr>${runsXml}</w:r></w:p>`
      }
      if (block.type === 'li') {
        return `<w:p><w:pPr><w:ind w:left="480" w:hanging="240"/><w:spacing w:after="80"/></w:pPr><w:r><w:t xml:space="preserve">• ${escapeXml(block.text)}</w:t></w:r></w:p>`
      }
      if (block.type === 'quote') {
        return `<w:p><w:pPr><w:ind w:left="420"/><w:pBdr><w:left w:val="single" w:sz="18" w:space="10" w:color="0B5CAD"/></w:pBdr><w:spacing w:before="100" w:after="100"/></w:pPr><w:r><w:rPr><w:i/><w:color w:val="334155"/></w:rPr>${runsXml}</w:r></w:p>`
      }
      return `<w:p><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr><w:r>${runsXml}</w:r></w:p>`
    })
    .join('')

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>`

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`

  const wordRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`

  const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${safeTitle}</dc:title>
  <dc:creator>ConnectLn Docs</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF">${nowIso}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${nowIso}</dcterms:modified>
</cp:coreProperties>`

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/><w:color w:val="0F172A"/></w:rPr></w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="36"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style>
</w:styles>`

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyXml || '<w:p><w:r><w:t></w:t></w:r></w:p>'}
    <w:sectPr>
      <w:pgSz w:w="${pgW}" w:h="${pgH}"${orientAttr}/>
      <w:pgMar w:top="${marTwips}" w:right="${marTwips}" w:bottom="${marTwips}" w:left="${marTwips}"/>
    </w:sectPr>
  </w:body>
</w:document>`

  return buildStoredZipBytes([
    { name: '[Content_Types].xml', data: contentTypesXml },
    { name: '_rels/.rels', data: rootRelsXml },
    { name: 'docProps/core.xml', data: coreXml },
    { name: 'word/_rels/document.xml.rels', data: wordRelsXml },
    { name: 'word/styles.xml', data: stylesXml },
    { name: 'word/document.xml', data: documentXml },
  ])
}

async function inflateRawDeflateBytes(compressed: Uint8Array): Promise<Uint8Array | null> {
  if (typeof DecompressionStream === 'undefined') return null
  try {
    const stream = new Blob([compressed as unknown as BlobPart])
      .stream()
      .pipeThrough(new DecompressionStream('deflate-raw'))
    const buf = await new Response(stream).arrayBuffer()
    return new Uint8Array(buf)
  } catch {
    return null
  }
}

export async function extractTextHtmlFromDocxBytes(bytes: Uint8Array): Promise<string> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let offset = 0
  let docXmlStr: string | null = null

  // Walk local file headers (supports Stored method 0 & Deflate method 8)
  while (offset + 30 <= bytes.length) {
    const sig = view.getUint32(offset, true)
    if (sig !== 0x04034b50) break
    const method = view.getUint16(offset + 8, true)
    const compSize = view.getUint32(offset + 18, true)
    const nameLen = view.getUint16(offset + 26, true)
    const extraLen = view.getUint16(offset + 28, true)
    const nameStart = offset + 30
    const dataStart = nameStart + nameLen + extraLen
    const entryName = textDecoder.decode(bytes.subarray(nameStart, nameStart + nameLen))

    if (entryName === 'word/document.xml' && compSize > 0 && dataStart + compSize <= bytes.length) {
      const payload = bytes.subarray(dataStart, dataStart + compSize)
      if (method === 0) {
        docXmlStr = textDecoder.decode(payload)
      } else if (method === 8) {
        const inflated = await inflateRawDeflateBytes(payload)
        if (inflated) {
          docXmlStr = textDecoder.decode(inflated)
        }
      }
      break
    }

    if (compSize === 0 && (view.getUint16(offset + 6, true) & 0x08) !== 0) {
      // Data-descriptor streaming zip: stop local scan cleanly
      break
    }
    offset = dataStart + compSize
  }

  if (!docXmlStr) {
    throw new Error('Could not read document body from this archive.')
  }

  const pMatches = docXmlStr.match(/<w:p\b[\s\S]*?<\/w:p>/gi) || []
  const htmlParts: string[] = []
  for (const pXml of pMatches) {
    const styleMatch = /<w:pStyle\b[^>]*w:val="([^"]+)"/i.exec(pXml)
    const styleVal = (styleMatch?.[1] || '').toLowerCase()
    const texts: string[] = []
    const tRegex = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>/gi
    let tm: RegExpExecArray | null
    while ((tm = tRegex.exec(pXml)) !== null) {
      texts.push(decodeBasicHtmlEntities(tm[1]))
    }
    const line = texts.join('').trim()
    if (!line) continue
    if (styleVal.includes('heading1') || styleVal === 'title') {
      htmlParts.push(`<h1>${escapeHtml(line)}</h1>`)
    } else if (styleVal.includes('heading2')) {
      htmlParts.push(`<h2>${escapeHtml(line)}</h2>`)
    } else if (styleVal.includes('heading3')) {
      htmlParts.push(`<h3>${escapeHtml(line)}</h3>`)
    } else {
      htmlParts.push(`<p>${escapeHtml(line)}</p>`)
    }
  }

  return htmlParts.join('\n') || '<p>Imported empty document.</p>'
}

function sanitizeSheetTabName(name: string, index: number): string {
  const cleaned = String(name || `Sheet${index + 1}`)
    .replace(/[\\/?*[\]:]/g, ' ')
    .trim()
    .slice(0, 31)
  return cleaned || `Sheet${index + 1}`
}

export function buildXlsxBytes(title: string, sheets: SheetExportTab[]): Uint8Array {
  const safeSheets = sheets.length > 0 ? sheets : [{ name: 'Sheet1', rowCount: 10, colCount: 6, cells: {} }]
  const safeTitle = escapeXml(title || 'ConnectLn Workbook')
  const nowIso = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')

  const sheetFiles: Array<{ name: string; data: string }> = []
  const workbookSheetsXml: string[] = []
  const workbookRelsXml: string[] = []
  const contentTypeOverrides: string[] = []

  safeSheets.forEach((tab, sIdx) => {
    const sheetNum = sIdx + 1
    const safeName = escapeXml(sanitizeSheetTabName(tab.name, sIdx))
    workbookSheetsXml.push(`<sheet name="${safeName}" sheetId="${sheetNum}" r:id="rId${sheetNum}"/>`)
    workbookRelsXml.push(
      `<Relationship Id="rId${sheetNum}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${sheetNum}.xml"/>`
    )
    contentTypeOverrides.push(
      `<Override PartName="/xl/worksheets/sheet${sheetNum}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    )

    // Group occupied cells by 1-based row
    const rowsMap = new Map<number, Array<{ col: number; ref: string; cell: SheetExportCell }>>()
    for (const [key, cell] of Object.entries(tab.cells || {})) {
      if (!cell || (cell.raw === '' && cell.evaluated === undefined)) continue
      const parsed = parseCellKey(key)
      if (!parsed) continue
      const row1 = parsed.row + 1
      const ref = `${colIndexToLabel(parsed.col)}${row1}`
      const list = rowsMap.get(row1) || []
      list.push({ col: parsed.col, ref, cell })
      rowsMap.set(row1, list)
    }

    const sortedRowNums = Array.from(rowsMap.keys()).sort((a, b) => a - b)
    const rowsXml = sortedRowNums
      .map((rowNum) => {
        const entries = (rowsMap.get(rowNum) || []).sort((a, b) => a.col - b.col)
        const cellsXml = entries
          .map(({ ref, cell }) => {
            const raw = String(cell.raw ?? '')
            const isFormula = raw.trimStart().startsWith('=')
            if (isFormula) {
              const formulaBody = escapeXml(raw.trimStart().slice(1))
              if (typeof cell.evaluated === 'number' && Number.isFinite(cell.evaluated)) {
                return `<c r="${ref}"><f>${formulaBody}</f><v>${cell.evaluated}</v></c>`
              }
              return `<c r="${ref}" t="str"><f>${formulaBody}</f><v>${escapeXml(
                String(cell.evaluated ?? '')
              )}</v></c>`
            }

            if (cell.isNumeric && typeof cell.evaluated === 'number' && Number.isFinite(cell.evaluated)) {
              return `<c r="${ref}"><v>${cell.evaluated}</v></c>`
            }
            const plainNum = Number(raw)
            if (raw.trim() !== '' && /^-?\d+(\.\d+)?$/.test(raw.trim()) && Number.isFinite(plainNum)) {
              return `<c r="${ref}"><v>${plainNum}</v></c>`
            }

            return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(raw)}</t></is></c>`
          })
          .join('')
        return `<row r="${rowNum}">${cellsXml}</row>`
      })
      .join('')

    const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rowsXml}</sheetData>
</worksheet>`

    sheetFiles.push({ name: `xl/worksheets/sheet${sheetNum}.xml`, data: sheetXml })
  })

  const stylesRelId = safeSheets.length + 1
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  ${contentTypeOverrides.join('\n  ')}
</Types>`

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`

  const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${safeTitle}</dc:title>
  <dc:creator>ConnectLn Sheets</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF">${nowIso}</dcterms:created>
</cp:coreProperties>`

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    ${workbookSheetsXml.join('\n    ')}
  </sheets>
</workbook>`

  const workbookRelsDocXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${workbookRelsXml.join('\n  ')}
  <Relationship Id="rId${stylesRelId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
</styleSheet>`

  return buildStoredZipBytes([
    { name: '[Content_Types].xml', data: contentTypesXml },
    { name: '_rels/.rels', data: rootRelsXml },
    { name: 'docProps/core.xml', data: coreXml },
    { name: 'xl/workbook.xml', data: workbookXml },
    { name: 'xl/_rels/workbook.xml.rels', data: workbookRelsDocXml },
    { name: 'xl/styles.xml', data: stylesXml },
    ...sheetFiles,
  ])
}

function normalizeHex6(hex: string, fallback: string): string {
  const clean = String(hex || '').replace('#', '').trim().toUpperCase()
  return /^[0-9A-F]{6}$/.test(clean) ? clean : fallback
}

function buildPptTextShape(
  id: number,
  name: string,
  x: number,
  y: number,
  cx: number,
  cy: number,
  paragraphs: Array<{ text: string; sizePt: number; bold?: boolean; italic?: boolean; colorHex: string; align?: 'l' | 'ctr' | 'r' }>
): string {
  const parasXml = paragraphs
    .map((p) => {
      const algn = p.align || 'l'
      const sz = Math.round(p.sizePt * 100)
      const boldAttr = p.bold ? ' b="1"' : ''
      const italicAttr = p.italic ? ' i="1"' : ''
      return `<a:p><a:pPr algn="${algn}"/><a:r><a:rPr lang="en-US" sz="${sz}"${boldAttr}${italicAttr}><a:solidFill><a:srgbClr val="${p.colorHex}"/></a:solidFill></a:rPr><a:t>${escapeXml(p.text)}</a:t></a:r></a:p>`
    })
    .join('')

  return `<p:sp>
  <p:nvSpPr><p:cNvPr id="${id}" name="${escapeXml(name)}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
  <p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr>
  <p:txBody><a:bodyPr wrap="square"/><a:lstStyle/>${parasXml}</p:txBody>
</p:sp>`
}

export function buildPptxBytes(
  deckTitle: string,
  slides: SlideExportItem[],
  theme: SlideThemePalette,
  aspectRatio: '16:9' | '4:3' = '16:9'
): Uint8Array {
  const visibleSlides = slides.filter((s) => !s.hidden)
  const safeSlides =
    visibleSlides.length > 0
      ? visibleSlides
      : [{ title: deckTitle || 'ConnectLn Slides', subtitle: 'Built with ConnectLn 360 Studio', layout: 'cover' }]
  const safeTitle = escapeXml(deckTitle || 'ConnectLn Presentation')
  const nowIso = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  const sldCx = aspectRatio === '4:3' ? 9144000 : 12192000
  const sldCy = 6858000

  const bgHex = normalizeHex6(theme.bgHex, 'FFFFFF')
  const primaryHex = normalizeHex6(theme.primaryHex, '0067B8')
  const accentHex = normalizeHex6(theme.accentHex, '0B5CAD')
  const textHex = normalizeHex6(theme.textHex, '0B1F3A')
  const mutedHex = normalizeHex6(theme.mutedHex, '4B5563')

  const slideFiles: Array<{ name: string; data: string }> = []
  const sldIdEntries: string[] = []
  const presRels: string[] = []
  const contentTypeOverrides: string[] = []

  safeSlides.forEach((slide, idx) => {
    const slideNum = idx + 1
    const rId = `rId${slideNum}`
    const sldId = 256 + idx
    sldIdEntries.push(`<p:sldId id="${sldId}" r:id="${rId}"/>`)
    presRels.push(
      `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${slideNum}.xml"/>`
    )
    contentTypeOverrides.push(
      `<Override PartName="/ppt/slides/slide${slideNum}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
    )

    const slideBgHex = slide.customBgHex ? normalizeHex6(slide.customBgHex, bgHex) : bgHex
    const shapes: string[] = []
    // Title shape
    shapes.push(
      buildPptTextShape(2, 'Title', 762000, 520000, Math.min(10668000, sldCx - 1524000), 1100000, [
        {
          text: slide.title || `Slide ${slideNum}`,
          sizePt: slide.layout === 'cover' || slide.layout === 'section' ? 36 : 28,
          bold: true,
          colorHex: slide.layout === 'cover' || slide.layout === 'section' ? textHex : primaryHex,
          align: slide.layout === 'cover' || slide.layout === 'section' ? 'ctr' : 'l',
        },
        ...(slide.subtitle
          ? [
              {
                text: slide.subtitle,
                sizePt: 16,
                colorHex: mutedHex,
                align: (slide.layout === 'cover' || slide.layout === 'section' ? 'ctr' : 'l') as 'l' | 'ctr',
              },
            ]
          : []),
      ])
    )

    if (slide.layout === 'two_column') {
      const leftLines = [
        { text: slide.leftTitle || 'Key Track A', sizePt: 18, bold: true, colorHex: accentHex },
        ...(slide.leftBullets || []).map((b) => ({ text: `• ${b}`, sizePt: 15, colorHex: textHex })),
      ]
      const rightLines = [
        { text: slide.rightTitle || 'Key Track B', sizePt: 18, bold: true, colorHex: accentHex },
        ...(slide.rightBullets || []).map((b) => ({ text: `• ${b}`, sizePt: 15, colorHex: textHex })),
      ]
      shapes.push(buildPptTextShape(3, 'LeftColumn', 762000, 1950000, 5050000, 4000000, leftLines))
      shapes.push(buildPptTextShape(4, 'RightColumn', 6380000, 1950000, 5050000, 4000000, rightLines))
    } else if (slide.layout === 'metrics') {
      const metricLines = (slide.metrics || []).map((m) => ({
        text: `${m.value} — ${m.label}${m.delta ? ` (${m.delta})` : ''}`,
        sizePt: 20,
        bold: true,
        colorHex: textHex,
      }))
      shapes.push(buildPptTextShape(3, 'MetricsBody', 762000, 2000000, 10668000, 3800000, metricLines))
    } else if (slide.layout === 'quote') {
      shapes.push(
        buildPptTextShape(3, 'QuoteBody', 1100000, 2200000, 9992000, 2900000, [
          {
            text: `"${slide.quote || slide.subtitle || ''}"`,
            sizePt: 24,
            italic: true,
            colorHex: textHex,
            align: 'ctr',
          },
          ...(slide.quoteAuthor
            ? [{ text: `— ${slide.quoteAuthor}`, sizePt: 15, bold: true, colorHex: accentHex, align: 'ctr' as const }]
            : []),
        ])
      )
    } else if (slide.layout === 'table' && slide.tableData) {
      const tableLines = [
        { text: slide.tableData.headers.join('  |  '), sizePt: 16, bold: true, colorHex: accentHex },
        ...slide.tableData.rows.map((r) => ({ text: r.join('  |  '), sizePt: 14, colorHex: textHex })),
      ]
      shapes.push(buildPptTextShape(3, 'TableBody', 762000, 1950000, 10668000, 4200000, tableLines))
    } else if (slide.layout === 'chart' && slide.chartData) {
      const chartLines = [
        { text: `${slide.chartData.title} (${slide.chartData.kind.toUpperCase()} Chart)`, sizePt: 18, bold: true, colorHex: accentHex },
        ...slide.chartData.items.map((item) => ({ text: `• ${item.label}: ${item.value}`, sizePt: 16, colorHex: textHex })),
      ]
      shapes.push(buildPptTextShape(3, 'ChartBody', 762000, 1950000, 10668000, 4200000, chartLines))
    } else {
      const bullets = (slide.bullets || []).map((b) => ({
        text: `• ${b}`,
        sizePt: 17,
        colorHex: textHex,
      }))
      if (bullets.length > 0) {
        shapes.push(buildPptTextShape(3, 'BodyContent', 762000, 1950000, 10668000, 4000000, bullets))
      }
    }

    if (slide.elements && slide.elements.length > 0) {
      slide.elements.forEach((el, eIdx) => {
        shapes.push(
          buildPptTextShape(10 + eIdx, `Element${eIdx + 1}`, 762000, 5600000 + eIdx * 360000, 8000000, 340000, [
            { text: el.text, sizePt: 13, bold: true, colorHex: accentHex },
          ])
        )
      })
    }

    const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr><a:solidFill><a:srgbClr val="${slideBgHex}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      ${shapes.join('\n      ')}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`

    const slideRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`

    slideFiles.push(
      { name: `ppt/slides/slide${slideNum}.xml`, data: slideXml },
      { name: `ppt/slides/_rels/slide${slideNum}.xml.rels`, data: slideRelsXml }
    )
  })

  const masterRelId = `rId${safeSlides.length + 1}`
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  ${contentTypeOverrides.join('\n  ')}
</Types>`

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`

  const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${safeTitle}</dc:title>
  <dc:creator>ConnectLn Slides</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF">${nowIso}</dcterms:created>
</cp:coreProperties>`

  const presentationXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="${masterRelId}"/></p:sldMasterIdLst>
  <p:sldIdLst>
    ${sldIdEntries.join('\n    ')}
  </p:sldIdLst>
  <p:sldSz cx="${sldCx}" cy="${sldCy}"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`

  const presentationRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${presRels.join('\n  ')}
  <Relationship Id="${masterRelId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
</Relationships>`

  const slideMasterXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
</p:sldMaster>`

  const slideMasterRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`

  const slideLayoutXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank">
  <p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
</p:sldLayout>`

  const slideLayoutRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`

  const themeXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="ConnectLn Theme">
  <a:themeElements>
    <a:clrScheme name="ConnectLn">
      <a:dk1><a:srgbClr val="${textHex}"/></a:dk1>
      <a:lt1><a:srgbClr val="${bgHex}"/></a:lt1>
      <a:dk2><a:srgbClr val="${primaryHex}"/></a:dk2>
      <a:lt2><a:srgbClr val="F8FAFC"/></a:lt2>
      <a:accent1><a:srgbClr val="${accentHex}"/></a:accent1>
      <a:accent2><a:srgbClr val="0F766E"/></a:accent2>
      <a:accent3><a:srgbClr val="C84B28"/></a:accent3>
      <a:accent4><a:srgbClr val="D97706"/></a:accent4>
      <a:accent5><a:srgbClr val="4F46E5"/></a:accent5>
      <a:accent6><a:srgbClr val="059669"/></a:accent6>
      <a:hlink><a:srgbClr val="0067B8"/></a:hlink>
      <a:folHlink><a:srgbClr val="4B5563"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="ConnectLn">
      <a:majorFont><a:latin typeface="Calibri"/></a:majorFont>
      <a:minorFont><a:latin typeface="Calibri"/></a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="ConnectLn">
      <a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>
      <a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>
      <a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
      <a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
</a:theme>`

  return buildStoredZipBytes([
    { name: '[Content_Types].xml', data: contentTypesXml },
    { name: '_rels/.rels', data: rootRelsXml },
    { name: 'docProps/core.xml', data: coreXml },
    { name: 'ppt/presentation.xml', data: presentationXml },
    { name: 'ppt/_rels/presentation.xml.rels', data: presentationRelsXml },
    { name: 'ppt/slideMasters/slideMaster1.xml', data: slideMasterXml },
    { name: 'ppt/slideMasters/_rels/slideMaster1.xml.rels', data: slideMasterRelsXml },
    { name: 'ppt/slideLayouts/slideLayout1.xml', data: slideLayoutXml },
    { name: 'ppt/slideLayouts/_rels/slideLayout1.xml.rels', data: slideLayoutRelsXml },
    { name: 'ppt/theme/theme1.xml', data: themeXml },
    ...slideFiles,
  ])
}

export function buildStandaloneHtmlDeck(
  deckTitle: string,
  slides: SlideExportItem[],
  theme: SlideThemePalette
): string {
  const safeTitle = escapeHtml(deckTitle || 'ConnectLn Slides')
  const slidesHtml = slides
    .map((s, idx) => {
      let body = ''
      if (s.layout === 'two_column') {
        body = `<div class="cols">
          <div class="card"><h3>${escapeHtml(s.leftTitle || 'Column 1')}</h3><ul>${(s.leftBullets || [])
            .map((b) => `<li>${escapeHtml(b)}</li>`)
            .join('')}</ul></div>
          <div class="card"><h3>${escapeHtml(s.rightTitle || 'Column 2')}</h3><ul>${(s.rightBullets || [])
            .map((b) => `<li>${escapeHtml(b)}</li>`)
            .join('')}</ul></div>
        </div>`
      } else if (s.layout === 'metrics') {
        body = `<div class="metrics">${(s.metrics || [])
          .map(
            (m) =>
              `<div class="metric-card"><div class="metric-val">${escapeHtml(
                m.value
              )}</div><div class="metric-lbl">${escapeHtml(m.label)}</div>${
                m.delta ? `<div class="metric-delta">${escapeHtml(m.delta)}</div>` : ''
              }</div>`
          )
          .join('')}</div>`
      } else if (s.layout === 'quote') {
        body = `<div class="quote-box"><blockquote>“${escapeHtml(
          s.quote || s.subtitle || ''
        )}”</blockquote>${
          s.quoteAuthor ? `<p class="quote-author">— ${escapeHtml(s.quoteAuthor)}</p>` : ''
        }</div>`
      } else {
        body = `<ul class="bullets">${(s.bullets || [])
          .map((b) => `<li>${escapeHtml(b)}</li>`)
          .join('')}</ul>`
      }

      return `<section class="slide ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
        <div class="slide-inner ${s.layout === 'cover' ? 'cover' : ''}">
          <h2>${escapeHtml(s.title)}</h2>
          ${s.subtitle ? `<p class="subtitle">${escapeHtml(s.subtitle)}</p>` : ''}
          ${body}
          <div class="brand-foot">ConnectLn Slides · ${idx + 1} / ${slides.length}</div>
        </div>
      </section>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle} — ConnectLn Slides</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #${normalizeHex6(
      theme.textHex,
      '0B1F3A'
    )}; display: flex; flex-direction: column; min-height: 100vh; align-items: center; justify-content: center; padding: 24px; }
    .stage { width: min(1100px, 95vw); aspect-ratio: 16 / 9; position: relative; }
    .slide { display: none; width: 100%; height: 100%; background: #${normalizeHex6(
      theme.bgHex,
      'FFFFFF'
    )}; border-radius: 18px; overflow: hidden; box-shadow: 0 28px 80px rgba(0,0,0,0.45); padding: 52px 60px; }
    .slide.active { display: block; }
    .slide-inner { height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
    .slide-inner.cover { justify-content: center; text-align: center; }
    h2 { font-size: 38px; margin: 0 0 12px 0; color: #${normalizeHex6(
      theme.primaryHex,
      '0067B8'
    )}; }
    .subtitle { font-size: 20px; color: #${normalizeHex6(theme.mutedHex, '4B5563')}; margin: 0 0 24px 0; }
    .bullets { font-size: 22px; line-height: 1.6; padding-left: 26px; margin: 0; }
    .bullets li { margin-bottom: 12px; }
    .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .card, .metric-card { background: #${normalizeHex6(
      theme.surfaceHex,
      'FAF7F2'
    )}; border-radius: 14px; padding: 22px; border: 1px solid rgba(128,128,128,0.18); }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .metric-val { font-size: 38px; font-weight: 800; color: #${normalizeHex6(
      theme.accentHex,
      '0B5CAD'
    )}; }
    .metric-lbl { font-size: 16px; margin-top: 8px; font-weight: 600; }
    .metric-delta { font-size: 13px; margin-top: 6px; opacity: 0.8; }
    .quote-box { text-align: center; padding: 32px; }
    .quote-box blockquote { font-size: 30px; font-style: italic; margin: 0 0 16px 0; }
    .brand-foot { font-size: 12px; opacity: 0.6; text-align: right; margin-top: 16px; }
    .controls { margin-top: 16px; display: flex; gap: 12px; align-items: center; color: #fff; }
    .controls button { background: #0067b8; color: #fff; border: 0; border-radius: 10px; padding: 10px 18px; font-weight: 700; cursor: pointer; }
  </style>
</head>
<body>
  <div class="stage">${slidesHtml}</div>
  <div class="controls">
    <button onclick="move(-1)">Prev</button>
    <span id="counter">1 / ${slides.length}</span>
    <button onclick="move(1)">Next</button>
  </div>
  <script>
    let idx = 0;
    const all = Array.from(document.querySelectorAll('.slide'));
    function show(n) {
      idx = Math.max(0, Math.min(all.length - 1, n));
      all.forEach((el, i) => el.classList.toggle('active', i === idx));
      document.getElementById('counter').textContent = (idx + 1) + ' / ' + all.length;
    }
    function move(d) { show(idx + d); }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    });
  </script>
</body>
</html>`
}

export function downloadStudioFile(
  data: Uint8Array | string,
  filename: string,
  mimeType: string
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const blobPart: BlobPart = typeof data === 'string' ? data : (data as unknown as BlobPart)
  const blob = new Blob([blobPart], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function printHtmlViaHiddenIframe(html: string): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false
  try {
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    iframe.style.opacity = '0'
    iframe.setAttribute('aria-hidden', 'true')
    document.body.appendChild(iframe)

    const win = iframe.contentWindow
    const doc = iframe.contentDocument || win?.document
    if (!doc || !win) {
      document.body.removeChild(iframe)
      return false
    }
    doc.open()
    doc.write(html)
    doc.close()

    const cleanup = () => {
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe)
      }, 1000)
    }

    setTimeout(() => {
      try {
        win.focus()
        win.print()
      } finally {
        cleanup()
      }
    }, 250)
    return true
  } catch {
    return false
  }
}

export interface PrintableDocumentOptions {
  title: string
  bodyHtml: string
  pageSetup?: DocExportPageSetup
  grayscale?: boolean
  includeHeaderFooter?: boolean
  includeWatermark?: boolean
  includeBackground?: boolean
}

export function buildPrintableDocumentHtml(opts: PrintableDocumentOptions): string {
  const setup = opts.pageSetup || {}
  const paperLabel =
    setup.paperSize === 'a4' ? 'A4' : setup.paperSize === 'legal' ? 'legal' : 'letter'
  const orientation = setup.orientation === 'landscape' ? 'landscape' : 'portrait'
  const marginCss =
    setup.margins === 'narrow'
      ? '0.5in'
      : setup.margins === 'moderate'
      ? '0.75in'
      : setup.margins === 'wide'
      ? '1.5in'
      : '1in'
  const cols = setup.columns === 2 || setup.columns === 3 ? setup.columns : 1
  const lineSpacing = setup.lineSpacing || '1.5'
  const safeTitle = escapeHtml(opts.title || 'ConnectLn Document')
  const safeBody = sanitizeSafeHtml(opts.bodyHtml || '<p></p>')
  const includeBg = opts.includeBackground !== false
  const bg = includeBg && setup.pageBg ? escapeHtml(setup.pageBg) : '#FFFFFF'
  const borderCss =
    includeBg && setup.pageBorder === 'thin'
      ? 'border: 1px solid #94A3B8; padding: 24px;'
      : includeBg && setup.pageBorder === 'double'
      ? 'border: 4px double #0B1F3A; padding: 24px;'
      : includeBg && setup.pageBorder === 'accent'
      ? 'border-top: 6px solid #0B5CAD; padding-top: 20px;'
      : ''
  const watermarkText =
    opts.includeWatermark !== false && setup.watermark ? escapeHtml(setup.watermark) : ''
  const showHF = opts.includeHeaderFooter !== false
  const headerText = showHF ? escapeHtml(setup.headerText || opts.title || '') : ''
  const footerText = showHF
    ? escapeHtml(setup.footerText || 'ConnectLn Docs · ConnectLn 360 Studio')
    : ''
  const filterCss = opts.grayscale ? 'filter: grayscale(100%);' : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle} — Print Preview</title>
  <style>
    @page {
      size: ${paperLabel} ${orientation};
      margin: ${marginCss};
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px;
      background: #e5e7eb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0b1f3a;
      ${filterCss}
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      position: relative;
      max-width: ${orientation === 'landscape' ? '1040px' : '816px'};
      min-height: 920px;
      margin: 0 auto;
      background: ${bg};
      padding: 40px 48px;
      box-shadow: 0 12px 36px rgba(15, 23, 42, 0.14);
      border-radius: 6px;
      overflow: hidden;
    }
    .watermark {
      position: fixed;
      top: 46%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-32deg);
      font-size: 68px;
      font-weight: 900;
      letter-spacing: 0.14em;
      color: rgba(100, 116, 139, 0.14);
      pointer-events: none;
      white-space: nowrap;
      z-index: 0;
    }
    .running-header {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
      margin-bottom: 20px;
    }
    .doc-body {
      position: relative;
      z-index: 1;
      line-height: ${lineSpacing};
      ${cols > 1 ? `column-count: ${cols}; column-gap: 28px;` : ''}
      ${borderCss}
    }
    .doc-body h1 { font-size: 24px; margin: 0 0 10px 0; color: #0b1f3a; }
    .doc-body h2 { font-size: 18px; color: #0b5cad; margin: 18px 0 8px 0; }
    .doc-body h3 { font-size: 15px; color: #0b1f3a; margin: 14px 0 6px 0; }
    .doc-body p { margin: 0 0 10px 0; }
    .doc-body table { width: 100%; border-collapse: collapse; margin: 14px 0; break-inside: avoid; }
    .doc-body th, .doc-body td { border: 1px solid #cbd5e1; padding: 7px 10px; text-align: left; font-size: 12.5px; }
    .doc-body th { background: #f1f5f9; font-weight: 700; }
    .doc-body blockquote { border-left: 4px solid #0b5cad; padding: 8px 14px; background: #f0f6ff; margin: 12px 0; }
    .cln-page-break {
      page-break-after: always !important;
      break-after: page !important;
      border: none !important;
      height: 0 !important;
      margin: 0 !important;
    }
    .cln-page-break span { display: none !important; }
    .running-footer {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      margin-top: 28px;
    }
    @media print {
      body { background: #ffffff !important; padding: 0 !important; }
      .sheet { box-shadow: none !important; margin: 0 !important; max-width: none !important; padding: 0 !important; min-height: auto !important; border-radius: 0 !important; }
    }
  </style>
</head>
<body>
  ${watermarkText ? `<div class="watermark">${watermarkText}</div>` : ''}
  <div class="sheet">
    ${headerText ? `<div class="running-header"><span>${headerText}</span><span>ConnectLn Docs</span></div>` : ''}
    <div class="doc-body">${safeBody}</div>
    ${
      showHF
        ? `<div class="running-footer"><span>${footerText}</span><span>${
            setup.showPageNumbers !== false ? new Date().toLocaleDateString() : ''
          }</span></div>`
        : ''
    }
  </div>
</body>
</html>`
}

export interface PrintableSheetTabInput {
  name: string
  headers: string[]
  rows: Array<{
    rowNumber: number
    cells: Array<{ display: string; align?: string; bold?: boolean; bg?: string; color?: string }>
  }>
  chartsSvgHtml?: string
}

export interface PrintableSheetOptions {
  workbookTitle: string
  tabs: PrintableSheetTabInput[]
  paperSize?: 'letter' | 'a4' | 'legal'
  orientation?: 'portrait' | 'landscape'
  margins?: 'normal' | 'narrow' | 'wide'
  showGridlines?: boolean
  showRowColHeaders?: boolean
  fitAllColumns?: boolean
  repeatHeaderRow?: boolean
  grayscale?: boolean
}

export function buildPrintableSheetHtml(opts: PrintableSheetOptions): string {
  const paperLabel =
    opts.paperSize === 'a4' ? 'A4' : opts.paperSize === 'legal' ? 'legal' : 'letter'
  const orientation = opts.orientation === 'portrait' ? 'portrait' : 'landscape'
  const marginCss =
    opts.margins === 'narrow' ? '0.35in' : opts.margins === 'wide' ? '0.85in' : '0.5in'
  const gridColor = opts.showGridlines !== false ? '#cbd5e1' : 'transparent'
  const filterCss = opts.grayscale ? 'filter: grayscale(100%);' : ''
  const fontScale = opts.fitAllColumns ? '10.5px' : '12px'

  const sectionsHtml = opts.tabs
    .map((tab, tIdx) => {
      const thHtml = opts.showRowColHeaders
        ? `<tr><th class="rc-head">#</th>${tab.headers
            .map((h) => `<th class="rc-head">${escapeHtml(h)}</th>`)
            .join('')}</tr>`
        : ''

      const firstDataRow = opts.repeatHeaderRow && tab.rows[0] ? tab.rows[0] : null
      const bodyStartIdx = firstDataRow ? 1 : 0
      const repeatHeadHtml = firstDataRow
        ? `<tr>${opts.showRowColHeaders ? `<th class="rc-head">${firstDataRow.rowNumber}</th>` : ''}${firstDataRow.cells
            .map(
              (c) =>
                `<th style="text-align:${escapeHtml(c.align || 'left')};background:${escapeHtml(
                  c.bg || '#f1f5f9'
                )};color:${escapeHtml(c.color || '#0b1f3a')};">${escapeHtml(c.display)}</th>`
            )
            .join('')}</tr>`
        : ''

      const rowsHtml = tab.rows
        .slice(bodyStartIdx)
        .map(
          (r) =>
            `<tr>${
              opts.showRowColHeaders ? `<td class="rc-head">${r.rowNumber}</td>` : ''
            }${r.cells
              .map(
                (c) =>
                  `<td style="text-align:${escapeHtml(c.align || 'left')};font-weight:${
                    c.bold ? '700' : '400'
                  };${c.bg ? `background:${escapeHtml(c.bg)};` : ''}${
                    c.color ? `color:${escapeHtml(c.color)};` : ''
                  }">${escapeHtml(c.display)}</td>`
              )
              .join('')}</tr>`
        )
        .join('')

      return `<section class="sheet-section ${tIdx > 0 ? 'page-break-before' : ''}">
        <div class="sheet-meta">
          <strong>${escapeHtml(opts.workbookTitle)}</strong>
          <span>Sheet: ${escapeHtml(tab.name)}</span>
        </div>
        <table>
          ${thHtml || repeatHeadHtml ? `<thead>${thHtml}${repeatHeadHtml}</thead>` : ''}
          <tbody>${rowsHtml}</tbody>
        </table>
        ${tab.chartsSvgHtml || ''}
      </section>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(opts.workbookTitle)} — Print Preview</title>
  <style>
    @page { size: ${paperLabel} ${orientation}; margin: ${marginCss}; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px;
      background: #e5e7eb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0b1f3a;
      ${filterCss}
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet-section {
      background: #ffffff;
      padding: 20px 24px;
      margin: 0 auto 20px auto;
      max-width: ${orientation === 'landscape' ? '1060px' : '820px'};
      border-radius: 6px;
      box-shadow: 0 8px 28px rgba(15, 23, 42, 0.12);
    }
    .page-break-before { page-break-before: always; break-before: page; }
    .sheet-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      padding-bottom: 8px;
      margin-bottom: 10px;
      border-bottom: 2px solid #107C41;
    }
    table { width: 100%; border-collapse: collapse; font-size: ${fontScale}; ${
    opts.fitAllColumns ? 'table-layout: fixed;' : ''
  } }
    th, td {
      border: 1px solid ${gridColor};
      padding: 5px 7px;
      word-wrap: break-word;
    }
    .rc-head {
      background: #f8fafc !important;
      color: #64748b !important;
      font-weight: 700;
      text-align: center !important;
      width: 34px;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .sheet-section { box-shadow: none; margin: 0; padding: 0; max-width: none; }
    }
  </style>
</head>
<body>${sectionsHtml}</body>
</html>`
}

export type SlidesPrintLayout = 'full' | 'handouts_2' | 'handouts_4' | 'notes' | 'outline'
export type SlidesPrintColorMode = 'color' | 'grayscale' | 'pure_bw'

export interface PrintableSlidesOptions {
  deckTitle: string
  slides: SlideExportItem[]
  theme: SlideThemePalette
  layout?: SlidesPrintLayout
  colorMode?: SlidesPrintColorMode
  frameSlides?: boolean
  showSlideNumbers?: boolean
}

export function buildPrintableSlidesHtml(opts: PrintableSlidesOptions): string {
  const layout = opts.layout || 'full'
  const colorMode = opts.colorMode || 'color'
  const showNumbers = opts.showSlideNumbers !== false
  const frameCss = opts.frameSlides !== false ? 'border: 1.5px solid #94a3b8;' : ''
  const isLandscape = layout === 'full'
  const filterCss = colorMode === 'grayscale' ? 'filter: grayscale(100%);' : ''
  const inkSaver = colorMode === 'pure_bw'

  const renderSlideCard = (s: SlideExportItem, idx: number) => {
    const bg = inkSaver ? '#FFFFFF' : s.customBgHex || opts.theme.bgHex
    const text = inkSaver ? '#0F172A' : opts.theme.textHex
    const primary = inkSaver ? '#0F172A' : opts.theme.primaryHex
    const muted = inkSaver ? '#475569' : opts.theme.mutedHex
    const accent = inkSaver ? '#0F172A' : opts.theme.accentHex

    let body = ''
    if (s.layout === 'two_column') {
      body = `<div class="cols">
        <div><h4 style="color:${accent};margin:0 0 6px 0;">${escapeHtml(s.leftTitle || 'Left Track')}</h4><ul>${(s.leftBullets || [])
          .map((b) => `<li>${escapeHtml(b)}</li>`)
          .join('')}</ul></div>
        <div><h4 style="color:${accent};margin:0 0 6px 0;">${escapeHtml(s.rightTitle || 'Right Track')}</h4><ul>${(s.rightBullets || [])
          .map((b) => `<li>${escapeHtml(b)}</li>`)
          .join('')}</ul></div>
      </div>`
    } else if (s.layout === 'metrics') {
      body = `<div class="metrics">${(s.metrics || [])
        .map(
          (m) =>
            `<div class="mcard"><div class="mval" style="color:${accent};">${escapeHtml(
              m.value
            )}</div><div>${escapeHtml(m.label)}</div></div>`
        )
        .join('')}</div>`
    } else if (s.layout === 'quote') {
      body = `<blockquote style="font-style:italic;font-size:1.15em;margin:12px 0;">“${escapeHtml(
        s.quote || s.subtitle || ''
      )}”</blockquote>${s.quoteAuthor ? `<p><strong>— ${escapeHtml(s.quoteAuthor)}</strong></p>` : ''}`
    } else if (s.layout === 'table' && s.tableData) {
      body = `<table class="stbl"><thead><tr>${s.tableData.headers
        .map((h) => `<th>${escapeHtml(h)}</th>`)
        .join('')}</tr></thead><tbody>${s.tableData.rows
        .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`)
        .join('')}</tbody></table>`
    } else {
      body = `<ul>${(s.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
    }

    return `<div class="slide-box" style="background:${escapeHtml(bg)};color:${escapeHtml(text)};${frameCss}">
      <h2 style="color:${escapeHtml(primary)};margin:0 0 4px 0;">${escapeHtml(s.title)}</h2>
      ${s.subtitle ? `<p style="color:${escapeHtml(muted)};margin:0 0 10px 0;">${escapeHtml(s.subtitle)}</p>` : ''}
      <div class="slide-body">${body}</div>
      ${
        showNumbers
          ? `<div class="slide-foot"><span>${escapeHtml(opts.deckTitle)}</span><span>${idx + 1} / ${
              opts.slides.length
            }</span></div>`
          : ''
      }
    </div>`
  }

  let contentHtml = ''
  if (layout === 'outline') {
    contentHtml = `<div class="outline-wrap"><h1>${escapeHtml(opts.deckTitle)} — Presentation Outline</h1>${opts.slides
      .map(
        (s, i) => `<div class="outline-item"><h3>Slide ${i + 1}: ${escapeHtml(s.title)}</h3>
          ${s.subtitle ? `<p>${escapeHtml(s.subtitle)}</p>` : ''}
          <ul>${(s.bullets || s.leftBullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>
          ${s.notes ? `<p class="notes">Notes: ${escapeHtml(s.notes)}</p>` : ''}
        </div>`
      )
      .join('')}</div>`
  } else if (layout === 'notes') {
    contentHtml = opts.slides
      .map(
        (s, i) => `<div class="notes-page">${renderSlideCard(s, i)}<div class="notes-card"><h4>Speaker Notes (Slide ${
          i + 1
        })</h4><p>${escapeHtml(s.notes || 'No presenter notes added for this slide.')}</p></div></div>`
      )
      .join('')
  } else if (layout === 'handouts_2') {
    contentHtml = `<div class="grid-2">${opts.slides.map((s, i) => renderSlideCard(s, i)).join('')}</div>`
  } else if (layout === 'handouts_4') {
    contentHtml = `<div class="grid-4">${opts.slides.map((s, i) => renderSlideCard(s, i)).join('')}</div>`
  } else {
    contentHtml = opts.slides
      .map((s, i) => `<div class="full-page">${renderSlideCard(s, i)}</div>`)
      .join('')
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(opts.deckTitle)} — Print Slides</title>
  <style>
    @page { size: letter ${isLandscape ? 'landscape' : 'portrait'}; margin: 0.45in; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px;
      background: #e5e7eb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      ${filterCss}
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .full-page { page-break-after: always; break-after: page; margin: 0 auto 20px auto; max-width: 960px; }
    .full-page:last-child { page-break-after: auto; }
    .slide-box {
      aspect-ratio: 16 / 9;
      border-radius: 10px;
      padding: 24px 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      font-size: ${layout === 'handouts_4' ? '10.5px' : layout === 'handouts_2' ? '12.5px' : '15px'};
    }
    .slide-body { flex: 1; overflow: hidden; }
    .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .mcard { border: 1px solid rgba(148,163,184,0.3); border-radius: 8px; padding: 10px; text-align: center; }
    .mval { font-size: 1.5em; font-weight: 800; }
    .stbl { width: 100%; border-collapse: collapse; font-size: 0.85em; }
    .stbl th, .stbl td { border: 1px solid rgba(148,163,184,0.35); padding: 4px 8px; }
    .slide-foot { display: flex; justify-content: space-between; font-size: 0.72em; opacity: 0.7; padding-top: 8px; border-top: 1px solid rgba(148,163,184,0.25); }
    .grid-2 { display: grid; grid-template-columns: 1fr; gap: 18px; max-width: 780px; margin: 0 auto; }
    .grid-4 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; max-width: 820px; margin: 0 auto; }
    .notes-page { max-width: 760px; margin: 0 auto 22px auto; page-break-after: always; break-after: page; }
    .notes-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px 18px; margin-top: 10px; font-size: 12.5px; color: #0f172a; }
    .notes-card h4 { margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; color: #64748b; }
    .outline-wrap { background: #ffffff; padding: 28px 34px; border-radius: 8px; max-width: 780px; margin: 0 auto; color: #0f172a; }
    .outline-item { border-bottom: 1px solid #e2e8f0; padding: 10px 0; }
    .outline-item .notes { color: #64748b; font-style: italic; font-size: 12px; }
    @media print {
      body { background: #ffffff; padding: 0; }
    }
  </style>
</head>
<body>${contentHtml}</body>
</html>`
}

export interface PrintableSignEnvelopeInput {
  envelopeCode: string
  title: string
  status: string
  documentHtml: string
  documentSha256?: string
  completedAt?: string
  signers: Array<{
    name: string
    email: string
    role: string
    status: string
    signedAt?: string
    signatureDataUrl?: string
    typedSignature?: string
    signatureFont?: string
  }>
  requiredChecks?: Array<{ label: string; checked: boolean }>
  auditTrail?: Array<{ timestamp: string; actor: string; action: string; detail: string }>
}

export function buildPrintableSignedContractHtml(
  envelope: PrintableSignEnvelopeInput,
  opts?: { includeAuditCertificate?: boolean; grayscale?: boolean }
): string {
  const safeTitle = escapeHtml(envelope.title || 'ConnectLn Agreement')
  const safeCode = escapeHtml(envelope.envelopeCode || 'CLN-SIGN')
  const safeBody = sanitizeSafeHtml(envelope.documentHtml || '<p></p>')
  const isCompleted = envelope.status === 'completed'
  const filterCss = opts?.grayscale ? 'filter: grayscale(100%);' : ''

  const signerBlocksHtml = (envelope.signers || [])
    .map((s) => {
      const signed = s.status === 'signed'
      const sigVisual = signed
        ? s.signatureDataUrl && /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(s.signatureDataUrl)
          ? `<img src="${s.signatureDataUrl}" alt="${escapeHtml(
              s.name
            )} signature" style="max-height:56px;max-width:220px;object-fit:contain;" />`
          : `<div style="font-family:Georgia,serif;font-style:italic;font-size:24px;font-weight:700;color:#0B1F3A;">${escapeHtml(
              s.typedSignature || s.name
            )}</div>`
        : `<div style="color:#94A3B8;font-style:italic;font-size:12px;">Awaiting signature...</div>`

      return `<div style="border:1px solid ${signed ? '#10B981' : '#CBD5E1'};border-radius:10px;padding:14px 16px;background:${
        signed ? '#F0FDF4' : '#F8FAFC'
      };break-inside:avoid;">
        <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:${
          signed ? '#047857' : '#64748B'
        };margin-bottom:8px;">${escapeHtml(s.role)} · ${signed ? 'ELECTRONICALLY SIGNED' : 'PENDING'}</div>
        <div style="min-height:58px;display:flex;align-items:center;border-bottom:1px solid #94A3B8;padding-bottom:6px;margin-bottom:8px;">${sigVisual}</div>
        <div style="font-size:12px;font-weight:700;color:#0B1F3A;">${escapeHtml(s.name)}</div>
        <div style="font-size:11px;color:#475569;">${escapeHtml(s.email)}</div>
        ${
          signed && s.signedAt
            ? `<div style="font-size:10px;color:#047857;margin-top:4px;font-family:monospace;">Signed UTC: ${escapeHtml(
                new Date(s.signedAt).toISOString()
              )}</div>`
            : ''
        }
      </div>`
    })
    .join('')

  const checksHtml =
    envelope.requiredChecks && envelope.requiredChecks.length > 0
      ? `<div style="margin:20px 0;padding:12px 16px;border:1px solid #E2E8F0;border-radius:8px;background:#F8FAFC;">
          <div style="font-size:11px;font-weight:800;text-transform:uppercase;color:#475569;margin-bottom:6px;">Compliance Acknowledgments</div>
          ${envelope.requiredChecks
            .map(
              (c) =>
                `<div style="font-size:12px;margin:4px 0;">${c.checked ? '☑' : '☐'} ${escapeHtml(
                  c.label
                )}</div>`
            )
            .join('')}
        </div>`
      : ''

  const auditCertHtml =
    opts?.includeAuditCertificate !== false
      ? `<section class="cert-page">
          <div style="border-bottom:2px solid #4338CA;padding-bottom:10px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:11px;font-weight:800;letter-spacing:0.1em;color:#4338CA;text-transform:uppercase;">ConnectLn Sign · ConnectLn 360 Studio</div>
              <h2 style="margin:4px 0 0 0;font-size:20px;color:#0B1F3A;">Certificate of Completion &amp; Audit Trail</h2>
            </div>
            <div style="font-family:monospace;font-size:11px;font-weight:700;color:#0B1F3A;">${safeCode}</div>
          </div>
          <div style="border:1px solid #CBD5E1;border-radius:10px;padding:14px 16px;background:#F8FAFC;margin-bottom:18px;font-size:12px;">
            <div><strong>Agreement Title:</strong> ${safeTitle}</div>
            <div style="margin-top:4px;"><strong>Envelope Status:</strong> ${escapeHtml(envelope.status.toUpperCase())}</div>
            <div style="margin-top:4px;"><strong>Document Integrity SHA-256 Digest:</strong></div>
            <div style="font-family:monospace;font-size:11px;word-break:break-all;background:#FFFFFF;border:1px solid #E2E8F0;padding:8px 10px;border-radius:6px;margin-top:4px;">${escapeHtml(
              envelope.documentSha256 || 'Pending final signature seal'
            )}</div>
          </div>
          <table class="audit-table">
            <thead>
              <tr><th>Timestamp (ISO UTC)</th><th>Actor</th><th>Event</th><th>Details</th></tr>
            </thead>
            <tbody>
              ${(envelope.auditTrail || [])
                .map(
                  (a) =>
                    `<tr><td style="font-family:monospace;font-size:10.5px;">${escapeHtml(
                      a.timestamp
                    )}</td><td><strong>${escapeHtml(a.actor)}</strong></td><td>${escapeHtml(
                      a.action
                    )}</td><td>${escapeHtml(a.detail)}</td></tr>`
                )
                .join('')}
            </tbody>
          </table>
        </section>`
      : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle} — ${safeCode}</title>
  <style>
    @page { size: letter portrait; margin: 0.7in; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px;
      background: #e5e7eb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0b1f3a;
      ${filterCss}
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet, .cert-page {
      max-width: 816px;
      margin: 0 auto 24px auto;
      background: #ffffff;
      padding: 40px 48px;
      border-radius: 8px;
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
    }
    .cert-page { page-break-before: always; break-before: page; }
    .body-content h1 { font-size: 22px; margin-top: 0; }
    .body-content h2 { font-size: 16px; color: #0b5cad; margin-top: 18px; }
    .body-content table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    .body-content th, .body-content td { border: 1px solid #cbd5e1; padding: 7px 10px; font-size: 12.5px; text-align: left; }
    .body-content th { background: #f1f5f9; }
    .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 24px; }
    .audit-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
    .audit-table th, .audit-table td { border: 1px solid #cbd5e1; padding: 7px 9px; text-align: left; }
    .audit-table th { background: #f1f5f9; font-weight: 700; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .sheet, .cert-page { box-shadow: none; margin: 0; padding: 0; max-width: none; }
    }
  </style>
</head>
<body>
  <section class="sheet">
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #0B1F3A;padding-bottom:10px;margin-bottom:20px;">
      <div>
        <div style="font-size:10.5px;font-weight:800;letter-spacing:0.08em;color:#4338CA;text-transform:uppercase;">ConnectLn Sign · Electronic Agreement</div>
        <div style="font-family:monospace;font-size:11px;color:#475569;">Envelope ID: ${safeCode}</div>
      </div>
      <div style="border-radius:999px;padding:4px 12px;font-size:11px;font-weight:800;background:${
        isCompleted ? '#DCFCE7' : '#FEF3C7'
      };color:${isCompleted ? '#065F46' : '#92400E'};">
        ${isCompleted ? 'EXECUTED · ELECTRONICALLY SIGNED' : `${escapeHtml(envelope.status.toUpperCase())}`}
      </div>
    </div>
    <div class="body-content">${safeBody}</div>
    ${checksHtml}
    <div class="sig-grid">${signerBlocksHtml}</div>
  </section>
  ${auditCertHtml}
</body>
</html>`
}

export interface PrintableInvoiceInput {
  invoiceNumber: string
  kind: 'invoice' | 'estimate' | 'receipt'
  status: string
  currencySymbol: string
  title: string
  poNumber?: string
  issueDate: string
  dueDate: string
  paymentTerms: string
  senderCompany: string
  senderName: string
  senderEmail: string
  senderAddress: string
  clientCompany: string
  clientName: string
  clientEmail: string
  clientAddress: string
  items: Array<{
    description: string
    category: string
    qty: number
    unitPrice: number
    taxable?: boolean
  }>
  subtotal: number
  discountAmount: number
  taxRatePct: number
  taxAmount: number
  retainagePct: number
  retainageAmount: number
  grandTotal: number
  amountPaid: number
  balanceDue: number
  payments?: Array<{
    amount: number
    date: string
    method: string
    reference: string
    note?: string
  }>
  notes?: string
  paymentInstructions?: string
}

export function buildPrintableInvoiceHtml(
  invoice: PrintableInvoiceInput,
  opts?: { showPaymentHistory?: boolean; grayscale?: boolean }
): string {
  const sym = escapeHtml(invoice.currencySymbol || '$')
  const fmt = (val: number) =>
    `${sym}${(Math.round((Number.isFinite(val) ? val : 0) * 100) / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const kindHeading =
    invoice.kind === 'estimate'
      ? 'PROJECT ESTIMATE'
      : invoice.kind === 'receipt'
      ? 'PAYMENT RECEIPT'
      : 'INVOICE'

  const statusUpper = String(invoice.status || 'draft').toUpperCase()
  const statusLabel =
    statusUpper === 'PAID'
      ? 'PAID IN FULL'
      : statusUpper === 'PARTIAL'
      ? 'PARTIAL PAYMENT'
      : statusUpper === 'OVERDUE'
      ? 'OVERDUE'
      : invoice.kind === 'estimate'
      ? `ESTIMATE · ${statusUpper}`
      : statusUpper === 'SENT'
      ? 'OPEN · SENT'
      : statusUpper

  const statusColors =
    statusUpper === 'PAID'
      ? { bg: '#DCFCE7', fg: '#065F46' }
      : statusUpper === 'OVERDUE'
      ? { bg: '#FFE4E6', fg: '#9F1239' }
      : statusUpper === 'PARTIAL'
      ? { bg: '#E0F2FE', fg: '#075985' }
      : { bg: '#F1F5F9', fg: '#334155' }

  const filterCss = opts?.grayscale ? 'filter: grayscale(100%);' : ''

  const itemRowsHtml = (invoice.items || [])
    .map(
      (item, idx) => `<tr>
        <td>${idx + 1}</td>
        <td><strong>${escapeHtml(item.description || 'Line Item')}</strong><div style="font-size:10.5px;color:#64748b;">${escapeHtml(
        item.category || ''
      )}</div></td>
        <td style="text-align:right;">${Number(item.qty) || 0}</td>
        <td style="text-align:right;">${fmt(Number(item.unitPrice) || 0)}</td>
        <td style="text-align:center;">${item.taxable ? 'Yes' : '—'}</td>
        <td style="text-align:right;font-weight:700;">${fmt((Number(item.qty) || 0) * (Number(item.unitPrice) || 0))}</td>
      </tr>`
    )
    .join('')

  const paymentsHtml =
    opts?.showPaymentHistory !== false && invoice.payments && invoice.payments.length > 0
      ? `<div style="margin-top:22px;break-inside:avoid;">
          <h3 style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:#0F766E;">Payment History</h3>
          <table class="tbl">
            <thead><tr><th>Date</th><th>Method</th><th>Reference</th><th>Notes</th><th style="text-align:right;">Amount</th></tr></thead>
            <tbody>
              ${invoice.payments
                .map(
                  (p) =>
                    `<tr><td>${escapeHtml(p.date)}</td><td>${escapeHtml(p.method)}</td><td style="font-family:monospace;">${escapeHtml(
                      p.reference
                    )}</td><td>${escapeHtml(p.note || '—')}</td><td style="text-align:right;font-weight:700;color:#065F46;">${fmt(
                      p.amount
                    )}</td></tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>`
      : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(kindHeading)} ${escapeHtml(invoice.invoiceNumber)} — ${escapeHtml(invoice.title)}</title>
  <style>
    @page { size: letter portrait; margin: 0.65in; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px;
      background: #e5e7eb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0b1f3a;
      ${filterCss}
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      max-width: 816px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px 46px;
      border-radius: 8px;
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
    }
    .hdr { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0F766E; padding-bottom: 16px; margin-bottom: 18px; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; font-size: 12px; }
    .party-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; background: #f8fafc; }
    .tbl { width: 100%; border-collapse: collapse; font-size: 12px; }
    .tbl th, .tbl td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
    .tbl th { background: #f1f5f9; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #334155; }
    .totals-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
    .totals-box { width: 290px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; font-size: 12px; }
    .totals-row { display: flex; justify-content: space-between; padding: 7px 12px; border-bottom: 1px solid #e2e8f0; }
    .totals-row:last-child { border-bottom: none; }
    .totals-grand { background: #0F766E; color: #ffffff; font-weight: 800; font-size: 13.5px; }
    .notes-box { margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11.5px; color: #334155; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .sheet { box-shadow: none; margin: 0; padding: 0; max-width: none; }
    }
  </style>
</head>
<body>
  <section class="sheet">
    <header class="hdr">
      <div>
        <div style="font-size:10.5px;font-weight:800;letter-spacing:0.09em;color:#0F766E;text-transform:uppercase;">ConnectLn Invoice &amp; Ledger · Power Apps</div>
        <h1 style="margin:4px 0 2px 0;font-size:24px;color:#0B1F3A;">${escapeHtml(kindHeading)}</h1>
        <div style="font-size:13px;font-weight:700;color:#334155;">${escapeHtml(invoice.title)}</div>
      </div>
      <div style="text-align:right;">
        <div style="display:inline-block;border-radius:999px;padding:4px 12px;font-size:11px;font-weight:800;background:${
          statusColors.bg
        };color:${statusColors.fg};margin-bottom:8px;">${escapeHtml(statusLabel)}</div>
        <div style="font-family:monospace;font-size:12px;font-weight:700;">#${escapeHtml(invoice.invoiceNumber)}</div>
        <div style="font-size:11px;color:#475569;margin-top:3px;">Issued: ${escapeHtml(invoice.issueDate)}</div>
        <div style="font-size:11px;color:#475569;">Due: ${escapeHtml(invoice.dueDate)} (${escapeHtml(invoice.paymentTerms)})</div>
        ${invoice.poNumber ? `<div style="font-size:11px;color:#475569;">PO / Ref: ${escapeHtml(invoice.poNumber)}</div>` : ''}
      </div>
    </header>

    <div class="parties">
      <div class="party-box">
        <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:#64748b;margin-bottom:4px;">From</div>
        <div style="font-weight:800;font-size:13px;">${escapeHtml(invoice.senderCompany || invoice.senderName)}</div>
        <div>${escapeHtml(invoice.senderName)}</div>
        <div style="color:#475569;">${escapeHtml(invoice.senderEmail)}</div>
        <div style="color:#475569;margin-top:2px;">${escapeHtml(invoice.senderAddress)}</div>
      </div>
      <div class="party-box">
        <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:#64748b;margin-bottom:4px;">Bill To</div>
        <div style="font-weight:800;font-size:13px;">${escapeHtml(invoice.clientCompany || invoice.clientName)}</div>
        <div>${escapeHtml(invoice.clientName)}</div>
        <div style="color:#475569;">${escapeHtml(invoice.clientEmail)}</div>
        <div style="color:#475569;margin-top:2px;">${escapeHtml(invoice.clientAddress)}</div>
      </div>
    </div>

    <table class="tbl">
      <thead>
        <tr><th style="width:36px;">#</th><th>Description &amp; Category</th><th style="text-align:right;width:64px;">Qty</th><th style="text-align:right;width:105px;">Rate</th><th style="text-align:center;width:54px;">Tax</th><th style="text-align:right;width:115px;">Amount</th></tr>
      </thead>
      <tbody>${itemRowsHtml}</tbody>
    </table>

    <div class="totals-wrap">
      <div class="totals-box">
        <div class="totals-row"><span>Subtotal</span><span>${fmt(invoice.subtotal)}</span></div>
        ${
          invoice.discountAmount > 0
            ? `<div class="totals-row"><span>Discount</span><span>-${fmt(invoice.discountAmount)}</span></div>`
            : ''
        }
        <div class="totals-row"><span>Tax (${invoice.taxRatePct}%)</span><span>${fmt(invoice.taxAmount)}</span></div>
        ${
          invoice.retainageAmount > 0
            ? `<div class="totals-row"><span>Retainage (${invoice.retainagePct}%)</span><span>-${fmt(invoice.retainageAmount)}</span></div>`
            : ''
        }
        <div class="totals-row" style="font-weight:800;background:#f8fafc;"><span>Total</span><span>${fmt(invoice.grandTotal)}</span></div>
        <div class="totals-row" style="color:#065F46;"><span>Amount Paid</span><span>-${fmt(invoice.amountPaid)}</span></div>
        <div class="totals-row totals-grand"><span>Balance Due</span><span>${fmt(invoice.balanceDue)}</span></div>
      </div>
    </div>

    ${paymentsHtml}

    <div class="notes-box">
      <div><strong>Notes &amp; Scope</strong><p style="margin:4px 0 0 0;">${escapeHtml(invoice.notes || '—')}</p></div>
      <div><strong>Payment Instructions</strong><p style="margin:4px 0 0 0;">${escapeHtml(invoice.paymentInstructions || '—')}</p></div>
    </div>
  </section>
</body>
</html>`
}

export interface PrintableBoardInput {
  boardCode: string
  title: string
  category: string
  clientOrTeam: string
  columns: Array<{ id: string; title: string; colorHex: string }>
  tasks: Array<{
    code: string
    columnId: string
    title: string
    priority: string
    assignee: string
    dueDate: string
    estimatedHours: number
    loggedHours: number
    hourlyRate: number
    billable: boolean
    checklist?: Array<{ text: string; done: boolean }>
  }>
  metrics: {
    totalTasks: number
    doneTasks: number
    completionPct: number
    totalEstimatedHours: number
    totalLoggedHours: number
    billableValue: number
  }
}

export function buildPrintableBoardReportHtml(
  board: PrintableBoardInput,
  opts?: { includeChecklists?: boolean; grayscale?: boolean }
): string {
  const safeTitle = escapeHtml(board.title || 'ConnectLn Project Board')
  const safeCode = escapeHtml(board.boardCode || 'CLN-BRD')
  const colNameById = new Map((board.columns || []).map((c) => [c.id, c.title]))
  const filterCss = opts?.grayscale ? 'filter: grayscale(100%);' : ''
  const includeChecklists = opts?.includeChecklists !== false

  const columnsSummaryHtml = (board.columns || [])
    .map((col) => {
      const count = (board.tasks || []).filter((t) => t.columnId === col.id).length
      return `<div style="border:1px solid #cbd5e1;border-top:4px solid ${escapeHtml(
        col.colorHex || '#B45309'
      )};border-radius:8px;padding:10px 12px;background:#f8fafc;">
        <div style="font-size:10.5px;font-weight:800;color:#475569;text-transform:uppercase;">${escapeHtml(
          col.title
        )}</div>
        <div style="font-size:20px;font-weight:800;color:#0b1f3a;margin-top:2px;">${count}</div>
      </div>`
    })
    .join('')

  const taskRowsHtml = (board.tasks || [])
    .map((t) => {
      const stage = colNameById.get(t.columnId) || t.columnId
      const chkList =
        includeChecklists && t.checklist && t.checklist.length > 0
          ? `<div style="margin-top:4px;font-size:10.5px;color:#475569;">${t.checklist
              .map((c) => `${c.done ? '☑' : '☐'} ${escapeHtml(c.text)}`)
              .join(' &nbsp;·&nbsp; ')}</div>`
          : ''
      return `<tr>
        <td style="font-family:monospace;font-weight:700;">${escapeHtml(t.code)}</td>
        <td><strong>${escapeHtml(t.title)}</strong>${chkList}</td>
        <td>${escapeHtml(stage)}</td>
        <td style="text-transform:uppercase;font-weight:700;">${escapeHtml(t.priority)}</td>
        <td>${escapeHtml(t.assignee)}</td>
        <td>${escapeHtml(t.dueDate || '—')}</td>
        <td style="text-align:right;font-family:monospace;">${t.loggedHours.toFixed(1)} / ${t.estimatedHours.toFixed(1)}h</td>
        <td style="text-align:center;">${t.billable ? 'Yes' : 'No'}</td>
      </tr>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle} — ${safeCode}</title>
  <style>
    @page { size: letter landscape; margin: 0.55in; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 18px;
      background: #e5e7eb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0b1f3a;
      ${filterCss}
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      max-width: 1020px;
      margin: 0 auto;
      background: #ffffff;
      padding: 32px 38px;
      border-radius: 8px;
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
    }
    .hdr { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #B45309; padding-bottom: 12px; margin-bottom: 16px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 14px; }
    .kpi { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #fffbeb; }
    .col-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 18px; }
    .tbl { width: 100%; border-collapse: collapse; font-size: 11.5px; }
    .tbl th, .tbl td { border: 1px solid #cbd5e1; padding: 7px 9px; text-align: left; vertical-align: top; }
    .tbl th { background: #f1f5f9; font-size: 10.5px; text-transform: uppercase; color: #334155; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .sheet { box-shadow: none; margin: 0; padding: 0; max-width: none; }
    }
  </style>
</head>
<body>
  <section class="sheet">
    <header class="hdr">
      <div>
        <div style="font-size:10.5px;font-weight:800;letter-spacing:0.08em;color:#B45309;text-transform:uppercase;">ConnectLn Boards · Project Status &amp; Workload Report</div>
        <h1 style="margin:4px 0 2px 0;font-size:22px;">${safeTitle}</h1>
        <div style="font-size:12px;color:#475569;">${escapeHtml(board.category)} · ${escapeHtml(board.clientOrTeam)}</div>
      </div>
      <div style="text-align:right;font-family:monospace;font-size:12px;font-weight:700;">
        <div>${safeCode}</div>
        <div style="font-size:11px;color:#475569;margin-top:4px;">Generated ${escapeHtml(new Date().toISOString().slice(0, 10))}</div>
      </div>
    </header>
    <div class="kpi-grid">
      <div class="kpi"><div style="font-size:10px;font-weight:800;color:#92400E;">COMPLETION</div><div style="font-size:18px;font-weight:800;">${board.metrics.completionPct}% (${board.metrics.doneTasks}/${board.metrics.totalTasks})</div></div>
      <div class="kpi"><div style="font-size:10px;font-weight:800;color:#92400E;">LOGGED HOURS</div><div style="font-size:18px;font-weight:800;">${board.metrics.totalLoggedHours.toFixed(1)}h</div></div>
      <div class="kpi"><div style="font-size:10px;font-weight:800;color:#92400E;">ESTIMATED SCOPE</div><div style="font-size:18px;font-weight:800;">${board.metrics.totalEstimatedHours.toFixed(1)}h</div></div>
      <div class="kpi"><div style="font-size:10px;font-weight:800;color:#92400E;">BILLABLE VALUE</div><div style="font-size:18px;font-weight:800;">\$${board.metrics.billableValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
    </div>
    <div class="col-grid">${columnsSummaryHtml}</div>
    <table class="tbl">
      <thead>
        <tr><th>Code</th><th>Task &amp; Checklists</th><th>Stage</th><th>Priority</th><th>Assignee</th><th>Due Date</th><th style="text-align:right;">Hours</th><th style="text-align:center;">Billable</th></tr>
      </thead>
      <tbody>${taskRowsHtml}</tbody>
    </table>
  </section>
</body>
</html>`
}

export interface PrintableFormInput {
  formCode: string
  title: string
  category: string
  description: string
  isOpen: boolean
  fields: Array<{
    id: string
    label: string
    type: string
    required: boolean
    options?: string[]
  }>
  responses: Array<{
    submittedAt: string
    respondentName: string
    answers: Record<string, string | number | boolean>
  }>
  analytics: {
    totalResponses: number
    completionRatePct: number
    averageRating: number | null
  }
}

export function buildPrintableFormHtml(
  form: PrintableFormInput,
  opts?: { viewMode?: 'blank' | 'summary'; grayscale?: boolean }
): string {
  const safeTitle = escapeHtml(form.title || 'ConnectLn Form')
  const safeCode = escapeHtml(form.formCode || 'CLN-FRM')
  const mode = opts?.viewMode || 'summary'
  const filterCss = opts?.grayscale ? 'filter: grayscale(100%);' : ''

  const blankFieldsHtml = (form.fields || [])
    .map((f, idx) => {
      const reqTag = f.required ? ' <span style="color:#E11D48;">*</span>' : ''
      let answerBox = '<div style="border:1px solid #cbd5e1;border-radius:6px;height:30px;margin-top:6px;"></div>'
      if (f.type === 'long_text') {
        answerBox = '<div style="border:1px solid #cbd5e1;border-radius:6px;height:66px;margin-top:6px;"></div>'
      } else if (f.type === 'select' && f.options && f.options.length > 0) {
        answerBox = `<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:12px;font-size:11.5px;">${f.options
          .map((o) => `<span>☐ ${escapeHtml(o)}</span>`)
          .join('')}</div>`
      } else if (f.type === 'checkbox') {
        answerBox = '<div style="margin-top:6px;font-size:11.5px;">☐ Confirmed / Checked</div>'
      } else if (f.type === 'rating') {
        answerBox = '<div style="margin-top:6px;font-size:12px;">○ 1 &nbsp;&nbsp; ○ 2 &nbsp;&nbsp; ○ 3 &nbsp;&nbsp; ○ 4 &nbsp;&nbsp; ○ 5</div>'
      }
      return `<div style="margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #f1f5f9;">
        <div style="font-size:12px;font-weight:700;">${idx + 1}. ${escapeHtml(f.label)}${reqTag}</div>
        ${answerBox}
      </div>`
    })
    .join('')

  const responseHeadHtml = ['Respondent', 'Submitted', ...(form.fields || []).slice(0, 5).map((f) => f.label)]
    .map((h) => `<th>${escapeHtml(h)}</th>`)
    .join('')

  const responseRowsHtml = (form.responses || [])
    .map((r) => {
      const cells = [
        `<td><strong>${escapeHtml(r.respondentName)}</strong></td>`,
        `<td style="font-family:monospace;font-size:10.5px;">${escapeHtml(r.submittedAt.slice(0, 10))}</td>`,
        ...(form.fields || []).slice(0, 5).map((f) => {
          const val = r.answers[f.id]
          const str = typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val ?? '—')
          return `<td>${escapeHtml(str)}</td>`
        }),
      ].join('')
      return `<tr>${cells}</tr>`
    })
    .join('')

  const bodySectionHtml =
    mode === 'blank'
      ? `<div>${blankFieldsHtml}</div>`
      : `<div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:18px;">
            <div style="border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;background:#faf5ff;">
              <div style="font-size:10px;font-weight:800;color:#7e22ce;">TOTAL RESPONSES</div>
              <div style="font-size:20px;font-weight:800;">${form.analytics.totalResponses}</div>
            </div>
            <div style="border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;background:#faf5ff;">
              <div style="font-size:10px;font-weight:800;color:#7e22ce;">COMPLETION RATE</div>
              <div style="font-size:20px;font-weight:800;">${form.analytics.completionRatePct}%</div>
            </div>
            <div style="border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;background:#faf5ff;">
              <div style="font-size:10px;font-weight:800;color:#7e22ce;">AVG RATING</div>
              <div style="font-size:20px;font-weight:800;">${form.analytics.averageRating !== null ? `${form.analytics.averageRating} / 5` : 'N/A'}</div>
            </div>
          </div>
          <h3 style="font-size:12px;text-transform:uppercase;color:#7e22ce;margin:0 0 8px 0;">Submitted Responses Log</h3>
          <table class="tbl"><thead><tr>${responseHeadHtml}</tr></thead><tbody>${
          responseRowsHtml || '<tr><td colspan="7">No responses recorded yet.</td></tr>'
        }</tbody></table>
        </div>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle} — ${safeCode}</title>
  <style>
    @page { size: letter portrait; margin: 0.65in; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px;
      background: #e5e7eb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0b1f3a;
      ${filterCss}
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      max-width: 816px;
      margin: 0 auto;
      background: #ffffff;
      padding: 36px 44px;
      border-radius: 8px;
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
    }
    .hdr { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #9333EA; padding-bottom: 14px; margin-bottom: 18px; }
    .tbl { width: 100%; border-collapse: collapse; font-size: 11px; }
    .tbl th, .tbl td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
    .tbl th { background: #f1f5f9; font-size: 10px; text-transform: uppercase; color: #334155; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .sheet { box-shadow: none; margin: 0; padding: 0; max-width: none; }
    }
  </style>
</head>
<body>
  <section class="sheet">
    <header class="hdr">
      <div>
        <div style="font-size:10.5px;font-weight:800;letter-spacing:0.08em;color:#9333EA;text-transform:uppercase;">ConnectLn Forms &amp; Workflows · ${
          mode === 'blank' ? 'Printable Worksheet' : 'Responses Summary Report'
        }</div>
        <h1 style="margin:4px 0 2px 0;font-size:21px;">${safeTitle}</h1>
        <div style="font-size:12px;color:#475569;">${escapeHtml(form.category)} — ${escapeHtml(form.description)}</div>
      </div>
      <div style="text-align:right;font-family:monospace;font-size:11.5px;font-weight:700;">
        <div>${safeCode}</div>
        <div style="margin-top:4px;color:${form.isOpen ? '#065F46' : '#64748B'};">${
          form.isOpen ? 'OPEN' : 'CLOSED'
        }</div>
      </div>
    </header>
    ${bodySectionHtml}
  </section>
</body>
</html>`
}
