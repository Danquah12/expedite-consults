import type { DocMarginsPreset, DocOrientation, DocPaperSize } from './connectln-studio-storage'

export type TextCaseMode = 'sentence' | 'lower' | 'upper' | 'title' | 'toggle'

export interface OutlineHeadingItem {
  index: number
  level: 1 | 2 | 3
  text: string
}

export interface DetailedDocStats {
  words: number
  charsWithSpaces: number
  charsNoSpaces: number
  paragraphs: number
  sentences: number
  headings: number
  readingMinutes: number
  speakingMinutes: number
  estimatedPages: number
}

export const DOC_FONT_FAMILIES: Array<{ label: string; value: string }> = [
  { label: 'Modern Sans', value: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' },
  { label: 'Editorial Serif', value: 'Georgia, Cambria, "Times New Roman", serif' },
  { label: 'Technical Mono', value: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' },
  { label: 'Classic Humanist', value: 'Verdana, Geneva, Tahoma, sans-serif' },
  { label: 'Executive Narrow', value: '"Trebuchet MS", "Segoe UI", sans-serif' },
  { label: 'Literary Book', value: '"Palatino Linotype", "Book Antiqua", Palatino, serif' },
  { label: 'Clean Grotesk', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Formal Slab', value: '"Courier New", Courier, monospace' },
]

export const DOC_FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48] as const

export const DOC_SYMBOLS: Array<{ char: string; name: string }> = [
  { char: '©', name: 'Copyright' },
  { char: '®', name: 'Registered' },
  { char: '™', name: 'Trademark' },
  { char: '§', name: 'Section' },
  { char: '¶', name: 'Paragraph' },
  { char: '°', name: 'Degree' },
  { char: '±', name: 'Plus-Minus' },
  { char: '×', name: 'Multiply' },
  { char: '÷', name: 'Divide' },
  { char: '≤', name: 'Less or Equal' },
  { char: '≥', name: 'Greater or Equal' },
  { char: '≠', name: 'Not Equal' },
  { char: '≈', name: 'Approx' },
  { char: '∞', name: 'Infinity' },
  { char: '€', name: 'Euro' },
  { char: '£', name: 'Pound' },
  { char: '¥', name: 'Yen' },
  { char: '₵', name: 'Cedi' },
  { char: '¢', name: 'Cent' },
  { char: '—', name: 'Em Dash' },
  { char: '–', name: 'En Dash' },
  { char: '•', name: 'Bullet' },
  { char: '✓', name: 'Checkmark' },
  { char: '✗', name: 'Cross' },
  { char: '→', name: 'Right Arrow' },
  { char: '←', name: 'Left Arrow' },
  { char: '↑', name: 'Up Arrow' },
  { char: '↓', name: 'Down Arrow' },
  { char: '★', name: 'Star' },
  { char: 'π', name: 'Pi' },
  { char: 'Σ', name: 'Sigma' },
  { char: 'Ω', name: 'Omega' },
]

export function transformTextCase(text: string, mode: TextCaseMode): string {
  switch (mode) {
    case 'lower':
      return text.toLowerCase()
    case 'upper':
      return text.toUpperCase()
    case 'title':
      return text.replace(/\S+/g, (tok) => {
        if (tok.length === 0) return tok
        return tok.charAt(0).toUpperCase() + tok.slice(1).toLowerCase()
      })
    case 'sentence':
      return text
        .toLowerCase()
        .replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (m) => m.toUpperCase())
    case 'toggle':
      return Array.from(text)
        .map((ch) =>
          ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()
        )
        .join('')
    default:
      return text
  }
}

function decodeText(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeText(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function extractOutlineHeadings(html: string): OutlineHeadingItem[] {
  const headings: OutlineHeadingItem[] = []
  const re = /<(h[1-3])\b[^>]*>([\s\S]*?)<\/\1>/gi
  let match: RegExpExecArray | null
  let index = 0
  while ((match = re.exec(html || '')) !== null) {
    const level = Number(match[1].slice(1)) as 1 | 2 | 3
    const text = decodeText(match[2] || '')
    if (text) {
      headings.push({ index, level, text })
      index++
    }
  }
  return headings
}

export function computeDetailedDocStats(html: string): DetailedDocStats {
  const plain = decodeText(html || '')
  const wordsArr = plain ? plain.split(/\s+/).filter(Boolean) : []
  const words = wordsArr.length
  const charsWithSpaces = plain.length
  const charsNoSpaces = plain.replace(/\s+/g, '').length
  const pMatches = (html || '').match(/<(p|h1|h2|h3|li|blockquote)\b[^>]*>/gi) || []
  const paragraphs = Math.max(plain ? 1 : 0, pMatches.length)
  const sentences = plain
    ? plain.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
    : 0
  const headings = extractOutlineHeadings(html).length
  const readingMinutes = words > 0 ? Math.max(1, Math.ceil(words / 200)) : 0
  const speakingMinutes = words > 0 ? Math.max(1, Math.ceil(words / 130)) : 0
  const pageBreaks = ((html || '').match(/data-page-break="true"/gi) || []).length
  const estimatedPages = Math.max(1 + pageBreaks, Math.ceil(Math.max(1, words) / 450))
  return {
    words,
    charsWithSpaces,
    charsNoSpaces,
    paragraphs,
    sentences,
    headings,
    readingMinutes,
    speakingMinutes,
    estimatedPages,
  }
}

export function buildTableHtml(rows: number, cols: number): string {
  const safeRows = Math.max(1, Math.min(20, Math.floor(rows)))
  const safeCols = Math.max(1, Math.min(12, Math.floor(cols)))
  const headerCells = Array.from({ length: safeCols })
    .map(
      (_, c) =>
        `<th style="border:1px solid #cbd5e1;padding:8px 10px;background:#f1f5f9;font-weight:700;text-align:left;">Column ${c + 1}</th>`
    )
    .join('')
  const bodyRows = Array.from({ length: Math.max(1, safeRows - 1) })
    .map(
      () =>
        `<tr>${Array.from({ length: safeCols })
          .map(
            () =>
              '<td style="border:1px solid #cbd5e1;padding:8px 10px;">Entry</td>'
          )
          .join('')}</tr>`
    )
    .join('')
  return `<table style="width:100%;border-collapse:collapse;margin:14px 0;"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table><p></p>`
}

export function buildCoverPageHtml(title: string, author: string): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return `<div style="padding:48px 24px;border-left:6px solid #0B5CAD;background:#F8FAFC;border-radius:0 12px 12px 0;margin:8px 0 18px 0;">
    <p style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#0B5CAD;margin:0 0 12px 0;">ConnectLn 360 Studio Brief</p>
    <h1 style="font-size:32px;margin:0 0 12px 0;color:#0B1F3A;">${escapeText(title || 'Executive Report')}</h1>
    <p style="font-size:14px;color:#475569;margin:0;">Prepared by <strong>${escapeText(author || 'ConnectLn Member')}</strong> · ${escapeText(dateStr)}</p>
  </div>
  <div data-page-break="true" class="cln-page-break" contenteditable="false" style="margin:22px 0;border-top:2px dashed #94a3b8;text-align:center;line-height:0;"><span style="background:#ffffff;padding:0 10px;font-size:10px;font-weight:700;letter-spacing:0.08em;color:#64748b;text-transform:uppercase;">Page Break</span></div><p></p>`
}

export function buildSignatureBlockHtml(author: string): string {
  return `<table style="width:100%;border-collapse:collapse;margin:24px 0 12px 0;">
    <tr>
      <td style="width:48%;border:1px solid #cbd5e1;border-radius:8px;padding:16px;">
        <p style="font-size:11px;font-weight:700;color:#64748b;margin:0 0 24px 0;">AUTHORIZED SIGNATURE (PROVIDER)</p>
        <p style="border-top:1px solid #0B1F3A;padding-top:6px;margin:0;font-size:13px;"><strong>${escapeText(author || 'Authorized Representative')}</strong> · Date: ____________</p>
      </td>
      <td style="width:4%;border:none;"></td>
      <td style="width:48%;border:1px solid #cbd5e1;border-radius:8px;padding:16px;">
        <p style="font-size:11px;font-weight:700;color:#64748b;margin:0 0 24px 0;">CLIENT ACCEPTANCE SIGNATURE</p>
        <p style="border-top:1px solid #0B1F3A;padding-top:6px;margin:0;font-size:13px;"><strong>Client Name</strong> · Date: ____________</p>
      </td>
    </tr>
  </table><p></p>`
}

export function buildTocHtml(html: string): string {
  const headings = extractOutlineHeadings(html)
  if (headings.length === 0) {
    return `<div style="border:1px solid #e2e8f0;background:#f8fafc;border-radius:10px;padding:14px 18px;margin:12px 0;"><p style="margin:0;font-size:13px;color:#475569;"><strong>Table of Contents:</strong> Add Heading 1, Heading 2, or Heading 3 sections to populate this index.</p></div><p></p>`
  }
  const items = headings
    .map((h, idx) => {
      const indent = (h.level - 1) * 18
      return `<li style="margin:4px 0;margin-left:${indent}px;font-weight:${h.level === 1 ? 700 : 500};">${idx + 1}. ${escapeText(h.text)}</li>`
    })
    .join('')
  return `<div style="border:1px solid #cbd5e1;background:#f8fafc;border-radius:10px;padding:14px 18px;margin:14px 0;">
    <p style="margin:0 0 8px 0;font-size:12px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#0B5CAD;">Table of Contents</p>
    <ul style="list-style:none;padding:0;margin:0;font-size:13px;color:#0B1F3A;">${items}</ul>
  </div><p></p>`
}

export function formatDateStamp(style: 'short' | 'long' | 'iso' | 'datetime'): string {
  const now = new Date()
  if (style === 'iso') return now.toISOString().slice(0, 10)
  if (style === 'short') return now.toLocaleDateString('en-US')
  if (style === 'datetime') {
    return `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  }
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getPaperDimensionsPx(
  paperSize: DocPaperSize,
  orientation: DocOrientation
): { widthPx: number; minHeightPx: number; cssSize: string } {
  const dims =
    paperSize === 'a4'
      ? { w: 794, h: 1123, label: 'A4' }
      : paperSize === 'legal'
      ? { w: 816, h: 1344, label: 'legal' }
      : { w: 816, h: 1056, label: 'letter' }

  return orientation === 'landscape'
    ? { widthPx: dims.h, minHeightPx: dims.w, cssSize: `${dims.label} landscape` }
    : { widthPx: dims.w, minHeightPx: dims.h, cssSize: `${dims.label} portrait` }
}

export function getMarginPx(margins: DocMarginsPreset): { px: number; cssIn: string; twips: number } {
  switch (margins) {
    case 'narrow':
      return { px: 36, cssIn: '0.5in', twips: 720 }
    case 'moderate':
      return { px: 54, cssIn: '0.75in', twips: 1080 }
    case 'wide':
      return { px: 96, cssIn: '1.5in', twips: 2160 }
    case 'normal':
    default:
      return { px: 72, cssIn: '1in', twips: 1440 }
  }
}
