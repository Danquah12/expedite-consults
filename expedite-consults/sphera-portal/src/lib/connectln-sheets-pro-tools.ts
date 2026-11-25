import {
  colIndexToLabel,
  makeCellKey,
  parseCellKey,
  type EvaluatedValue as EvaluatedCell,
  type SheetCell,
} from './connectln-sheets-engine'
import type { StudioSheetTab, StudioWorkbookRecord } from './connectln-studio-storage'

export interface SheetTableTheme {
  id: string
  name: string
  headerBg: string
  headerColor: string
  stripeBg: string
  accentHex: string
  totalBg: string
  desc: string
}

export const SHEET_TABLE_THEMES: SheetTableTheme[] = [
  {
    id: 'emerald-ledger',
    name: 'Emerald Ledger',
    headerBg: '#107C41',
    headerColor: '#FFFFFF',
    stripeBg: '#F0FDF4',
    accentHex: '#107C41',
    totalBg: '#DCFCE7',
    desc: 'Signature ConnectLn Sheets ledger palette with crisp header contrast.',
  },
  {
    id: 'executive-navy',
    name: 'Executive Navy',
    headerBg: '#0B1F3A',
    headerColor: '#FFFFFF',
    stripeBg: '#F8FAFC',
    accentHex: '#0B5CAD',
    totalBg: '#DBEAFE',
    desc: 'Deep navy headers and neutral frost bands for board packets.',
  },
  {
    id: 'editorial-sand',
    name: 'Editorial Sand',
    headerBg: '#78350F',
    headerColor: '#FFFFFF',
    stripeBg: '#FAF7F2',
    accentHex: '#B45309',
    totalBg: '#FEF3C7',
    desc: 'Warm sandstone table banding designed to reduce glare.',
  },
  {
    id: 'ocean-sky',
    name: 'Ocean Sky',
    headerBg: '#0369A1',
    headerColor: '#FFFFFF',
    stripeBg: '#F0F9FF',
    accentHex: '#0284C7',
    totalBg: '#E0F2FE',
    desc: 'Bright analytical blue palette for revenue and ops scorecards.',
  },
  {
    id: 'warm-terracotta',
    name: 'Warm Terracotta',
    headerBg: '#9A3412',
    headerColor: '#FFFFFF',
    stripeBg: '#FFF7ED',
    accentHex: '#C84B28',
    totalBg: '#FFEDD5',
    desc: 'High-contrast orange-brown tables for sales & pitch forecasts.',
  },
  {
    id: 'nordic-slate',
    name: 'Nordic Slate',
    headerBg: '#334155',
    headerColor: '#FFFFFF',
    stripeBg: '#F1F5F9',
    accentHex: '#475569',
    totalBg: '#E2E8F0',
    desc: 'Minimal slate stripes for dense compliance & audit checklists.',
  },
]

function getPopulatedBounds(sheet: StudioSheetTab): { maxRow: number; maxCol: number } {
  let maxRow = 0
  let maxCol = 0
  for (const key of Object.keys(sheet.cells)) {
    if (!sheet.cells[key]?.raw) continue
    const pos = parseCellKey(key)
    if (pos) {
      maxRow = Math.max(maxRow, pos.row)
      maxCol = Math.max(maxCol, pos.col)
    }
  }
  return {
    maxRow: Math.min(sheet.rowCount - 1, Math.max(1, maxRow)),
    maxCol: Math.min(sheet.colCount - 1, Math.max(2, maxCol)),
  }
}

export function applyTableThemeToCells(
  sheet: StudioSheetTab,
  theme: SheetTableTheme
): Record<string, SheetCell> {
  const next: Record<string, SheetCell> = { ...sheet.cells }
  const { maxRow, maxCol } = getPopulatedBounds(sheet)

  for (let r = 0; r <= maxRow; r++) {
    const firstCellRaw = String(next[makeCellKey(0, r)]?.raw || '').toLowerCase()
    const isTotalRow =
      r > 0 && /\b(total|subtotal|grand\s+total|net\s+profit)\b/.test(firstCellRaw)

    for (let c = 0; c <= maxCol; c++) {
      const k = makeCellKey(c, r)
      const prev = next[k]
      if (r === 0) {
        next[k] = {
          raw: prev?.raw || `Column ${colIndexToLabel(c)}`,
          style: {
            ...(prev?.style || {}),
            bold: true,
            bg: theme.headerBg,
            color: theme.headerColor,
          },
        }
      } else if (isTotalRow && prev) {
        next[k] = {
          ...prev,
          style: {
            ...(prev.style || {}),
            bold: true,
            bg: theme.totalBg,
            color: '#0B1F3A',
            border: 'topBottom',
          },
        }
      } else if (prev && r % 2 === 0) {
        next[k] = {
          ...prev,
          style: {
            ...(prev.style || {}),
            bg: theme.stripeBg,
          },
        }
      } else if (prev && prev.style?.bg) {
        const restStyle = { ...prev.style }
        delete restStyle.bg
        next[k] = { ...prev, style: restStyle }
      }
    }
  }
  return next
}

export function detectBestCategoryCol(
  sheet: StudioSheetTab,
  evaluatedMap: Record<string, EvaluatedCell>,
  preferredCol?: number
): number {
  const candidates =
    typeof preferredCol === 'number'
      ? [preferredCol, 1, 0, 2]
      : [1, 0, 2]
  for (const c of candidates) {
    if (c < 0 || c >= sheet.colCount) continue
    let textCount = 0
    for (let r = 1; r < Math.min(sheet.rowCount, 20); r++) {
      const ev = evaluatedMap[makeCellKey(c, r)]
      if (ev && typeof ev.numeric !== 'number' && String(ev.value || '').trim()) {
        textCount++
      }
    }
    if (textCount > 0) return c
  }
  return 0
}

export function buildPivotSummarySheet(
  sourceSheet: StudioSheetTab,
  evaluatedMap: Record<string, EvaluatedCell>,
  groupColIdx?: number
): StudioSheetTab {
  const catCol = detectBestCategoryCol(sourceSheet, evaluatedMap, groupColIdx)
  const { maxRow, maxCol } = getPopulatedBounds(sourceSheet)

  // Detect numeric columns (excluding category col and skipping total rows)
  const numericCols: Array<{ col: number; label: string }> = []
  for (let c = 0; c <= maxCol; c++) {
    if (c === catCol) continue
    let numCount = 0
    for (let r = 1; r <= maxRow; r++) {
      const ev = evaluatedMap[makeCellKey(c, r)]
      if (ev && typeof ev.numeric === 'number') numCount++
    }
    if (numCount > 0) {
      const header = String(evaluatedMap[makeCellKey(c, 0)]?.value || `Col ${colIndexToLabel(c)}`)
      numericCols.push({ col: c, label: header })
    }
  }

  const chosenNumCol = numericCols[numericCols.length - 1] || numericCols[0] || null
  const groups = new Map<string, { count: number; sum: number }>()

  for (let r = 1; r <= maxRow; r++) {
    const firstRaw = String(evaluatedMap[makeCellKey(0, r)]?.value || '').toLowerCase()
    if (/\b(total|subtotal|grand\s+total)\b/.test(firstRaw)) continue
    const catVal = String(evaluatedMap[makeCellKey(catCol, r)]?.value ?? '').trim()
    if (!catVal) continue

    const prev = groups.get(catVal) || { count: 0, sum: 0 }
    prev.count += 1
    if (chosenNumCol) {
      const v = evaluatedMap[makeCellKey(chosenNumCol.col, r)]?.numeric
      if (typeof v === 'number' && Number.isFinite(v)) prev.sum += v
    }
    groups.set(catVal, prev)
  }

  const cells: Record<string, SheetCell> = {
    A1: {
      raw: String(evaluatedMap[makeCellKey(catCol, 0)]?.value || 'Category'),
      style: { bold: true, bg: '#0B1F3A', color: '#FFFFFF' },
    },
    B1: {
      raw: 'Row Count',
      style: { bold: true, align: 'right', bg: '#0B1F3A', color: '#FFFFFF' },
    },
    C1: {
      raw: chosenNumCol ? `Sum of ${chosenNumCol.label}` : 'Total',
      style: { bold: true, align: 'right', bg: '#0B1F3A', color: '#FFFFFF' },
    },
    D1: {
      raw: chosenNumCol ? `Avg ${chosenNumCol.label}` : 'Average',
      style: { bold: true, align: 'right', bg: '#0B1F3A', color: '#FFFFFF' },
    },
  }

  let rowIdx = 1
  for (const [label, agg] of groups.entries()) {
    const rNum = rowIdx + 1
    cells[`A${rNum}`] = { raw: label, style: { bold: true } }
    cells[`B${rNum}`] = { raw: String(agg.count), style: { format: 'integer', align: 'right' } }
    cells[`C${rNum}`] = {
      raw: String(Math.round(agg.sum * 100) / 100),
      style: { format: 'currency', align: 'right' },
    }
    cells[`D${rNum}`] = {
      raw: `=C${rNum}/B${rNum}`,
      style: { format: 'currency', align: 'right' },
    }
    rowIdx++
  }

  const lastDataRow = Math.max(2, rowIdx)
  const totalRow = lastDataRow + 1
  cells[`A${totalRow}`] = {
    raw: 'Grand Total',
    style: { bold: true, bg: '#DCFCE7', color: '#064E3B', border: 'topBottom' },
  }
  cells[`B${totalRow}`] = {
    raw: `=SUM(B2:B${lastDataRow})`,
    style: { bold: true, format: 'integer', align: 'right', bg: '#DCFCE7', color: '#064E3B' },
  }
  cells[`C${totalRow}`] = {
    raw: `=SUM(C2:C${lastDataRow})`,
    style: { bold: true, format: 'currency', align: 'right', bg: '#DCFCE7', color: '#064E3B' },
  }
  cells[`D${totalRow}`] = {
    raw: `=AVERAGE(D2:D${lastDataRow})`,
    style: { bold: true, format: 'currency', align: 'right', bg: '#DCFCE7', color: '#064E3B' },
  }

  return {
    id: `sheet_pivot_${Date.now()}`,
    name: 'Pivot Summary',
    rowCount: Math.max(16, totalRow + 4),
    colCount: 8,
    cells,
    freezeRow1: true,
  }
}

export interface SparklineSeriesItem {
  label: string
  values: number[]
  min: number
  max: number
  deltaPct: number
}

export function extractRowSparklines(
  sheet: StudioSheetTab,
  evaluatedMap: Record<string, EvaluatedCell>
): SparklineSeriesItem[] {
  const items: SparklineSeriesItem[] = []
  const { maxRow, maxCol } = getPopulatedBounds(sheet)
  for (let r = 1; r <= Math.min(maxRow, 12); r++) {
    const label = String(evaluatedMap[makeCellKey(0, r)]?.value ?? '').trim()
    if (!label || /\btotal\b/i.test(label)) continue
    const values: number[] = []
    for (let c = 1; c <= maxCol; c++) {
      const num = evaluatedMap[makeCellKey(c, r)]?.numeric
      if (typeof num === 'number' && Number.isFinite(num)) values.push(num)
    }
    if (values.length >= 2) {
      const min = Math.min(...values)
      const max = Math.max(...values)
      const first = values[0] || 1
      const last = values[values.length - 1]
      const deltaPct = first !== 0 ? Math.round(((last - first) / Math.abs(first)) * 100) : 0
      items.push({ label, values, min, max, deltaPct })
    }
  }
  return items.slice(0, 6)
}

function expandRangeKeys(startKey: string, endKey: string): string[] {
  const a = parseCellKey(startKey)
  const b = parseCellKey(endKey)
  if (!a || !b) return []
  const minC = Math.min(a.col, b.col)
  const maxC = Math.max(a.col, b.col)
  const minR = Math.min(a.row, b.row)
  const maxR = Math.max(a.row, b.row)
  const keys: string[] = []
  for (let c = minC; c <= maxC && keys.length < 150; c++) {
    for (let r = minR; r <= maxR && keys.length < 150; r++) {
      keys.push(makeCellKey(c, r))
    }
  }
  return keys
}

export function traceFormulaPrecedents(sheet: StudioSheetTab, cellKey: string): string[] {
  const raw = String(sheet.cells[cellKey]?.raw || '').trim()
  if (!raw.startsWith('=')) return []
  const cleaned = raw.replace(/"[^"]*"/g, '')
  const found = new Set<string>()
  const rangeRe = /([A-Z]{1,2}[0-9]{1,3}):([A-Z]{1,2}[0-9]{1,3})/gi
  let m: RegExpExecArray | null
  while ((m = rangeRe.exec(cleaned)) !== null) {
    for (const k of expandRangeKeys(m[1].toUpperCase(), m[2].toUpperCase())) {
      found.add(k)
    }
  }
  const singleRe = /\b([A-Z]{1,2}[0-9]{1,3})\b/gi
  while ((m = singleRe.exec(cleaned)) !== null) {
    const key = m[1].toUpperCase()
    if (parseCellKey(key)) found.add(key)
  }
  found.delete(cellKey.toUpperCase())
  return [...found]
}

export function traceFormulaDependents(sheet: StudioSheetTab, targetKey: string): string[] {
  const upper = targetKey.toUpperCase()
  const dependents: string[] = []
  for (const [key, cell] of Object.entries(sheet.cells)) {
    if (!cell?.raw?.startsWith('=') || key === upper) continue
    const precedents = traceFormulaPrecedents(sheet, key)
    if (precedents.includes(upper)) {
      dependents.push(key)
    }
  }
  return dependents
}

export interface SheetErrorItem {
  key: string
  raw: string
  error: string
}

export function scanSheetErrors(
  sheet: StudioSheetTab,
  evaluatedMap: Record<string, EvaluatedCell>
): SheetErrorItem[] {
  const out: SheetErrorItem[] = []
  for (const [key, cell] of Object.entries(sheet.cells)) {
    if (!cell?.raw) continue
    const ev = evaluatedMap[key]
    const strVal = String(ev?.value ?? '')
    if (ev?.error || /^#(DIV\/0!|REF!|NAME\?|VALUE!|N\/A|ERR)/i.test(strVal)) {
      out.push({ key, raw: cell.raw, error: ev?.error || strVal })
    }
  }
  return out
}

export interface WorkbookStatsSummary {
  sheetCount: number
  populatedCells: number
  formulaCells: number
  numericCells: number
  textCells: number
  commentCount: number
  chartCount: number
}

export function computeWorkbookStats(
  workbook: StudioWorkbookRecord | undefined,
  activeSheet: StudioSheetTab,
  evaluatedMap: Record<string, EvaluatedCell>
): WorkbookStatsSummary {
  let populatedCells = 0
  let formulaCells = 0
  let numericCells = 0
  let textCells = 0

  for (const [key, cell] of Object.entries(activeSheet.cells)) {
    if (!cell?.raw) continue
    populatedCells++
    if (cell.raw.startsWith('=')) formulaCells++
    if (typeof evaluatedMap[key]?.numeric === 'number') numericCells++
    else textCells++
  }

  return {
    sheetCount: workbook?.sheets.length || 1,
    populatedCells,
    formulaCells,
    numericCells,
    textCells,
    commentCount: Object.keys(activeSheet.comments || {}).length,
    chartCount: (activeSheet.charts || []).length,
  }
}

export function runSheetAccessibilityAudit(
  sheet: StudioSheetTab,
  evaluatedMap: Record<string, EvaluatedCell>
): {
  score: number
  checks: Array<{ status: 'pass' | 'warn'; title: string; detail: string }>
} {
  const checks: Array<{ status: 'pass' | 'warn'; title: string; detail: string }> = []
  const row0HasHeader = Boolean(sheet.cells['A1']?.raw || sheet.cells['B1']?.raw)
  checks.push({
    status: row0HasHeader ? 'pass' : 'warn',
    title: 'Header Row Labels (Row 1)',
    detail: row0HasHeader
      ? 'Row 1 defines column labels so screen readers and summaries understand the grid.'
      : 'Add descriptive labels in Row 1 (A1, B1...) to identify columns.',
  })

  const errors = scanSheetErrors(sheet, evaluatedMap)
  checks.push({
    status: errors.length === 0 ? 'pass' : 'warn',
    title: 'Zero Formula Errors',
    detail:
      errors.length === 0
        ? 'All formulas resolve cleanly without #DIV/0! or #REF! errors.'
        : `${errors.length} formula error(s) detected (${errors.map((e) => e.key).join(', ')}).`,
  })

  const charts = sheet.charts || []
  const chartsHaveTitles = charts.every((c) => Boolean(c.title?.trim()))
  checks.push({
    status: chartsHaveTitles ? 'pass' : 'warn',
    title: 'Descriptive Chart Titles',
    detail:
      charts.length === 0
        ? 'No charts require alt descriptions.'
        : chartsHaveTitles
        ? `All ${charts.length} chart(s) carry descriptive titles.`
        : 'Add descriptive titles to embedded charts.',
  })

  const passCount = checks.filter((c) => c.status === 'pass').length
  return { score: Math.round((passCount / checks.length) * 100), checks }
}

export function buildWhatIfProjectionCells(
  sheet: StudioSheetTab,
  evaluatedMap: Record<string, EvaluatedCell>,
  sourceColIdx: number,
  growthPct: number
): { nextCells: Record<string, SheetCell>; targetColIdx: number; targetColLabel: string } {
  const { maxRow, maxCol } = getPopulatedBounds(sheet)
  const targetColIdx = Math.min(sheet.colCount - 1, Math.max(sourceColIdx + 1, maxCol + 1))
  const srcLetter = colIndexToLabel(sourceColIdx)
  const targetColLabel = colIndexToLabel(targetColIdx)
  const nextCells: Record<string, SheetCell> = { ...sheet.cells }
  const sign = growthPct >= 0 ? `+${growthPct}%` : `${growthPct}%`
  const factor = (1 + growthPct / 100).toFixed(2)

  const srcHeader = String(evaluatedMap[makeCellKey(sourceColIdx, 0)]?.value || srcLetter)
  nextCells[makeCellKey(targetColIdx, 0)] = {
    raw: `${srcHeader} (${sign})`,
    style: { bold: true, align: 'right', bg: '#0B1F3A', color: '#FFFFFF' },
  }

  for (let r = 1; r <= maxRow; r++) {
    const num = evaluatedMap[makeCellKey(sourceColIdx, r)]?.numeric
    if (typeof num === 'number') {
      nextCells[makeCellKey(targetColIdx, r)] = {
        raw: `=${srcLetter}${r + 1}*${factor}`,
        style: { format: 'currency', align: 'right', bg: '#ECFDF5', color: '#065F46' },
      }
    }
  }

  return { nextCells, targetColIdx, targetColLabel }
}

export function applyFlashFillColumn(
  sheet: StudioSheetTab,
  colIdx: number
): { nextCells: Record<string, SheetCell>; updatedCount: number } {
  const nextCells: Record<string, SheetCell> = { ...sheet.cells }
  let updatedCount = 0
  for (let r = 1; r < sheet.rowCount; r++) {
    const key = makeCellKey(colIdx, r)
    const cell = nextCells[key]
    if (!cell?.raw || cell.raw.startsWith('=') || !Number.isNaN(Number(cell.raw))) continue
    const normalized = cell.raw
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    if (normalized !== cell.raw) {
      nextCells[key] = { ...cell, raw: normalized }
      updatedCount++
    }
  }
  return { nextCells, updatedCount }
}

export function buildSubtotalRowCells(
  sheet: StudioSheetTab,
  evaluatedMap: Record<string, EvaluatedCell>
): { nextCells: Record<string, SheetCell>; rowNum: number } {
  const { maxRow, maxCol } = getPopulatedBounds(sheet)
  const insertRow = Math.min(sheet.rowCount - 1, maxRow + 1)
  const nextCells: Record<string, SheetCell> = { ...sheet.cells }
  const firstLetter = 'A'

  nextCells[`${firstLetter}${insertRow + 1}`] = {
    raw: 'Subtotal',
    style: { bold: true, bg: '#FEF3C7', color: '#78350F', border: 'topBottom' },
  }

  for (let c = 1; c <= maxCol; c++) {
    let hasNum = false
    for (let r = 1; r <= maxRow; r++) {
      if (typeof evaluatedMap[makeCellKey(c, r)]?.numeric === 'number') {
        hasNum = true
        break
      }
    }
    if (hasNum) {
      const colLet = colIndexToLabel(c)
      nextCells[`${colLet}${insertRow + 1}`] = {
        raw: `=SUM(${colLet}2:${colLet}${insertRow})`,
        style: { bold: true, format: 'currency', align: 'right', bg: '#FEF3C7', color: '#78350F', border: 'topBottom' },
      }
    }
  }

  return { nextCells, rowNum: insertRow + 1 }
}

export function extractCategorySlicerValues(
  sheet: StudioSheetTab,
  evaluatedMap: Record<string, EvaluatedCell>,
  colIdx: number
): string[] {
  const vals = new Set<string>()
  for (let r = 1; r < sheet.rowCount; r++) {
    const first = String(evaluatedMap[makeCellKey(0, r)]?.value || '').toLowerCase()
    if (/\b(total|subtotal)\b/.test(first)) continue
    const v = String(evaluatedMap[makeCellKey(colIdx, r)]?.value ?? '').trim()
    if (v) vals.add(v)
  }
  return [...vals].slice(0, 8)
}

export interface SheetsCommandItem {
  id: string
  label: string
  category: string
  keywords: string
}

export const SHEETS_COMMAND_CATALOG: SheetsCommandItem[] = [
  { id: 'open_noctis', label: 'Ask Noctis Data Studio', category: 'Noctis AI', keywords: 'ai formula explain kpi brief' },
  { id: 'open_hub', label: 'Open ConnectLn Sheets Hub', category: 'Workspace', keywords: 'hub backstage templates recent favorites' },
  { id: 'insert_pivot', label: 'Generate Pivot Summary Tab', category: 'Insert', keywords: 'pivot summary group aggregate rollup' },
  { id: 'toggle_sparklines', label: 'Toggle Inline Row Sparklines', category: 'Insert', keywords: 'sparkline trend mini chart line' },
  { id: 'toggle_slicer', label: 'Toggle Category Slicer Pills', category: 'Insert', keywords: 'slicer filter interactive pills' },
  { id: 'insert_bar_chart', label: 'Insert Bar Chart', category: 'Insert', keywords: 'chart bar graph visualization' },
  { id: 'apply_emerald_theme', label: 'Style as Table: Emerald Ledger', category: 'Home', keywords: 'style table format zebra stripe' },
  { id: 'open_layout_tab', label: 'Sheet Layout & Headings', category: 'Sheet Layout', keywords: 'themes gridlines headings print setup' },
  { id: 'trace_precedents', label: 'Trace Formula Precedents', category: 'Formulas', keywords: 'audit trace precedent references' },
  { id: 'trace_dependents', label: 'Trace Formula Dependents', category: 'Formulas', keywords: 'audit trace dependent references' },
  { id: 'watch_cell', label: 'Watch Active Cell Formula', category: 'Formulas', keywords: 'watch window pin formula monitor' },
  { id: 'error_check', label: 'Run Formula Error Check', category: 'Formulas', keywords: 'errors div/0 ref audit' },
  { id: 'open_what_if', label: 'What-If Growth Forecast', category: 'Data', keywords: 'forecast scenario growth projection' },
  { id: 'insert_subtotal', label: 'Insert Subtotal Summary Row', category: 'Data', keywords: 'subtotal sum total row' },
  { id: 'run_flash_fill', label: 'Flash Fill Normalize Column', category: 'Data', keywords: 'clean format title case trim' },
  { id: 'open_stats', label: 'Workbook Statistics', category: 'Review', keywords: 'count cells formulas charts stats' },
  { id: 'run_a11y', label: 'Accessibility Audit', category: 'Review', keywords: 'a11y accessibility check' },
  { id: 'toggle_protect', label: 'Protect / Lock Active Sheet', category: 'Review', keywords: 'lock read only protect sheet' },
  { id: 'open_print', label: 'Print Preview / Save Clean PDF', category: 'Print', keywords: 'pdf print export' },
  { id: 'create_invoice', label: 'Convert Sheet to ConnectLn Invoice', category: 'Power App', keywords: 'invoice billing ledger' },
]
