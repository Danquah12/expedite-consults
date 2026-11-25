import { colIndexToLabel, parseCellKey } from './connectln-sheets-engine'

export interface DocExportBlock {
  type: 'h1' | 'h2' | 'h3' | 'p' | 'li' | 'quote' | 'hr'
  text: string
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

export function extractDocBlocksFromHtml(html: string): DocExportBlock[] {
  const safe = sanitizeSafeHtml(html)
  const blocks: DocExportBlock[] = []
  const tokenRegex =
    /<(h1|h2|h3|blockquote|li|p|tr)\b[^>]*>([\s\S]*?)<\/\1>|<hr\b[^>]*\/?>/gi
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

    if (!match[1]) {
      blocks.push({ type: 'hr', text: '' })
      continue
    }

    const tag = match[1].toLowerCase()
    const inner = match[2] || ''
    // Skip container tags whose children will match cleanly if it holds inner block tags
    if (tag === 'p' && /<(h1|h2|h3|li|blockquote)\b/i.test(inner)) {
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

export function buildDocxBytes(title: string, blocksOrHtml: DocExportBlock[] | string): Uint8Array {
  const blocks =
    typeof blocksOrHtml === 'string' ? extractDocBlocksFromHtml(blocksOrHtml) : blocksOrHtml
  const safeTitle = escapeXml(title || 'ConnectLn Document')
  const nowIso = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')

  const bodyXml = blocks
    .map((block) => {
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
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
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
  theme: SlideThemePalette
): Uint8Array {
  const safeSlides =
    slides.length > 0
      ? slides
      : [{ title: deckTitle || 'ConnectLn Slides', subtitle: 'Built with ConnectLn 360 Studio', layout: 'cover' }]
  const safeTitle = escapeXml(deckTitle || 'ConnectLn Presentation')
  const nowIso = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')

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

    const shapes: string[] = []
    // Title shape
    shapes.push(
      buildPptTextShape(2, 'Title', 762000, 520000, 10668000, 1100000, [
        {
          text: slide.title || `Slide ${slideNum}`,
          sizePt: slide.layout === 'cover' ? 36 : 28,
          bold: true,
          colorHex: slide.layout === 'cover' ? textHex : primaryHex,
          align: slide.layout === 'cover' ? 'ctr' : 'l',
        },
        ...(slide.subtitle
          ? [
              {
                text: slide.subtitle,
                sizePt: 16,
                colorHex: mutedHex,
                align: (slide.layout === 'cover' ? 'ctr' : 'l') as 'l' | 'ctr',
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

    const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr><a:solidFill><a:srgbClr val="${bgHex}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>
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
  <p:sldSz cx="12192000" cy="6858000"/>
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
