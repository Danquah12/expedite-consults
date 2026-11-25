"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownAZ,
  ArrowUpZA,
  BarChart3,
  Bold,
  Calculator,
  Clipboard,
  Columns,
  Copy,
  CopyMinus,
  DollarSign,
  Download,
  Eraser,
  Eye,
  FilePlus2,
  Filter,
  FunctionSquare,
  Grid,
  Italic,
  LayoutGrid,
  LayoutTemplate,
  LineChart,
  Lock,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Percent,
  PieChart,
  Plus,
  Printer,
  Receipt,
  Redo2,
  RefreshCw,
  Rows,
  Scissors,
  Search,
  Share2,
  ShieldAlert,
  Sparkles,
  Star,
  Strikethrough,
  Table2,
  Trash2,
  Underline,
  Undo2,
  Upload,
  WrapText,
  X,
} from "lucide-react"
import type { UserProfile } from "@/lib/connectln-data"
import {
  colIndexToLabel,
  evaluateSheet,
  formatEvaluatedValue,
  gridToCsv,
  makeCellKey,
  matchesConditionalRule,
  parseCellKey,
  parseCsvToGrid,
  shiftFormulaRefs,
  type CellAlign,
  type CellFormat,
  type SheetCell,
  type SheetCellStyle,
} from "@/lib/connectln-sheets-engine"
import { buildXlsxBytes, downloadStudioFile } from "@/lib/connectln-studio-export"
import {
  loadStudioWorkbooks,
  saveStudioWorkbooks,
  SHEET_TEMPLATES,
  type SheetChartConfig,
  type SheetConditionalRule,
  type SheetTemplateItem,
  type StudioSheetTab,
  type StudioWorkbookRecord,
} from "@/lib/connectln-studio-storage"
import type { StudioSharePayload } from "./ConnectLnDocsEditor"
import { ConnectLnStudioHubDrawer } from "./ConnectLnStudioHubDrawer"
import { ConnectLnStudioPrintModal } from "./ConnectLnStudioPrintModal"

interface ConnectLnSheetsEditorProps {
  user: UserProfile
  onShareToFeed?: (payload: StudioSharePayload) => void
  onSendToInvoice?: (payload: { workbookTitle: string; sheet: StudioSheetTab }) => void
}

type SheetsRibbonTab = "home" | "insert" | "formulas" | "data" | "view"

const FILL_SWATCHES = [
  { label: "Clear", bg: undefined, color: undefined },
  { label: "Mist Blue", bg: "#DBEAFE", color: "#0B1F3A" },
  { label: "Emerald Mist", bg: "#DCFCE7", color: "#064E3B" },
  { label: "Warm Amber", bg: "#FEF3C7", color: "#78350F" },
  { label: "Soft Rose", bg: "#FFE4E6", color: "#881337" },
  { label: "Navy Header", bg: "#0B1F3A", color: "#FFFFFF" },
]

const FORMULA_CATALOG: Record<
  string,
  Array<{ name: string; syntax: string; snippet: string; desc: string }>
> = {
  "Math & Trig": [
    { name: "SUM", syntax: "=SUM(E2:E6)", snippet: "=SUM(E2:E6)", desc: "Adds numeric cells" },
    { name: "ROUND", syntax: "=ROUND(E2,2)", snippet: "=ROUND(E2,2)", desc: "Rounds to digits" },
    { name: "ROUNDUP", syntax: "=ROUNDUP(E2,0)", snippet: "=ROUNDUP(E2,0)", desc: "Rounds up away from 0" },
    { name: "ABS", syntax: "=ABS(D2)", snippet: "=ABS(D2)", desc: "Absolute value" },
    { name: "SQRT", syntax: "=SQRT(C2)", snippet: "=SQRT(C2)", desc: "Square root" },
    { name: "POWER", syntax: "=POWER(C2,2)", snippet: "=POWER(C2,2)", desc: "Exponent power" },
    { name: "MOD", syntax: "=MOD(C2,5)", snippet: "=MOD(C2,5)", desc: "Division remainder" },
    { name: "CEILING", syntax: "=CEILING(E2,5)", snippet: "=CEILING(E2,5)", desc: "Round up to multiple" },
  ],
  "Logical & Conditional": [
    { name: "IF", syntax: '=IF(E9>5000,"Executive","Standard")', snippet: '=IF(E9>5000,"Executive","Standard")', desc: "Branch by condition" },
    { name: "IFERROR", syntax: '=IFERROR(E2/C2,0)', snippet: '=IFERROR(E2/C2,0)', desc: "Catch formula errors cleanly" },
    { name: "AND", syntax: "=AND(C2>0,D2>0)", snippet: "=AND(C2>0,D2>0)", desc: "True if all arguments true" },
    { name: "OR", syntax: "=OR(C2>20,D2>100)", snippet: "=OR(C2>20,D2>100)", desc: "True if any argument true" },
    { name: "SUMIF", syntax: '=SUMIF(B2:B6,"Labor",E2:E6)', snippet: '=SUMIF(B2:B6,"Labor",E2:E6)', desc: "Conditional sum" },
    { name: "COUNTIF", syntax: '=COUNTIF(B2:B6,"Labor")', snippet: '=COUNTIF(B2:B6,"Labor")', desc: "Conditional count" },
    { name: "AVERAGEIF", syntax: '=AVERAGEIF(C2:C6,">10",E2:E6)', snippet: '=AVERAGEIF(C2:C6,">10",E2:E6)', desc: "Conditional average" },
  ],
  "Lookup & Finance": [
    { name: "VLOOKUP", syntax: '=VLOOKUP("Electrical & Panel Finish",A2:E6,5,FALSE)', snippet: '=VLOOKUP("Electrical & Panel Finish",A2:E6,5,FALSE)', desc: "Vertical table lookup" },
    { name: "INDEX", syntax: "=INDEX(A2:E6,2,5)", snippet: "=INDEX(A2:E6,2,5)", desc: "Value at row & col offset" },
    { name: "MATCH", syntax: '=MATCH("Materials",B2:B6,0)', snippet: '=MATCH("Materials",B2:B6,0)', desc: "1-based position in range" },
    { name: "PMT", syntax: "=PMT(0.06/12,36,10000)", snippet: "=PMT(0.06/12,36,10000)", desc: "Periodic loan payment" },
    { name: "FV", syntax: "=FV(0.05/12,12,-500,0)", snippet: "=FV(0.05/12,12,-500,0)", desc: "Future value" },
    { name: "NPV", syntax: "=NPV(0.08,3000,4500,6000)", snippet: "=NPV(0.08,3000,4500,6000)", desc: "Net present value" },
  ],
  "Text & Date": [
    { name: "CONCAT", syntax: '=CONCAT(A2," — ",B2)', snippet: '=CONCAT(A2," — ",B2)', desc: "Join text values" },
    { name: "TEXTJOIN", syntax: '=TEXTJOIN(", ",TRUE,A2:A4)', snippet: '=TEXTJOIN(", ",TRUE,A2:A4)', desc: "Join with delimiter" },
    { name: "PROPER", syntax: "=PROPER(A2)", snippet: "=PROPER(A2)", desc: "Title case each word" },
    { name: "LEFT", syntax: "=LEFT(A2,8)", snippet: "=LEFT(A2,8)", desc: "Leftmost characters" },
    { name: "TRIM", syntax: "=TRIM(A2)", snippet: "=TRIM(A2)", desc: "Strip extra whitespace" },
    { name: "TODAY", syntax: "=TODAY()", snippet: "=TODAY()", desc: "Current ISO date" },
    { name: "DATEDIF", syntax: '=DATEDIF("2026-01-01","2026-06-30","D")', snippet: '=DATEDIF("2026-01-01","2026-06-30","D")', desc: "Days/Months/Years between dates" },
  ],
}

function safeSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "connectln-workbook"
  )
}

function buildChartSvgMarkup(
  chart: SheetChartConfig,
  sheet: StudioSheetTab,
  evaluatedMap: Record<string, ReturnType<typeof evaluateSheet>[string]>
): string {
  const points: Array<{ label: string; value: number }> = []
  for (let r = chart.startRow; r <= Math.min(chart.endRow, sheet.rowCount - 1); r++) {
    const lblKey = makeCellKey(chart.labelCol, r)
    const valKey = makeCellKey(chart.valueCol, r)
    const lbl = String(evaluatedMap[lblKey]?.value ?? "").trim()
    const val = evaluatedMap[valKey]?.numeric
    if (lbl && typeof val === "number" && Number.isFinite(val)) {
      points.push({ label: lbl.slice(0, 14), value: Math.max(0, val) })
    }
  }
  if (points.length === 0) return ""
  const maxVal = Math.max(1, ...points.map((p) => p.value))
  const bars = points
    .map((p, idx) => {
      const h = Math.round((p.value / maxVal) * 110)
      const x = 30 + idx * 72
      const y = 130 - h
      return `<rect x="${x}" y="${y}" width="42" height="${h}" rx="4" fill="#107C41"/><text x="${
        x + 21
      }" y="146" font-size="9" text-anchor="middle" fill="#334155">${p.label}</text>`
    })
    .join("")
  return `<div style="margin-top:18px;border:1px solid #cbd5e1;border-radius:8px;padding:12px;"><strong style="font-size:12px;">${chart.title}</strong><svg width="100%" height="160" viewBox="0 0 ${Math.max(
    320,
    points.length * 75 + 40
  )} 160">${bars}</svg></div>`
}

export function ConnectLnSheetsEditor({ user, onShareToFeed, onSendToInvoice }: ConnectLnSheetsEditorProps) {
  const [workbooks, setWorkbooks] = useState<StudioWorkbookRecord[]>(() =>
    loadStudioWorkbooks(user)
  )
  const [activeWorkbookId, setActiveWorkbookId] = useState<string>(() => workbooks[0]?.id || "")
  const [ribbonTab, setRibbonTab] = useState<SheetsRibbonTab>("home")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [wbSearch, setWbSearch] = useState("")
  const [selectedCell, setSelectedCell] = useState<{ col: number; row: number }>({ col: 0, row: 0 })
  const [selectionEnd, setSelectionEnd] = useState<{ col: number; row: number } | null>(null)
  const [editingCellKey, setEditingCellKey] = useState<string | null>(null)
  const [draftCellValue, setDraftCellValue] = useState("")
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [showHubDrawer, setShowHubDrawer] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [showFindBar, setShowFindBar] = useState(false)
  const [findTerm, setFindTerm] = useState("")
  const [replaceTerm, setReplaceTerm] = useState("")
  const [showFormulas, setShowFormulas] = useState(false)
  const [showGridlines, setShowGridlines] = useState(true)
  const [showFormulaBar, setShowFormulaBar] = useState(true)
  const [zoomPct, setZoomPct] = useState<80 | 90 | 100 | 115>(100)
  const [autoFilterEnabled, setAutoFilterEnabled] = useState(false)
  const [colFilterCol, setColFilterCol] = useState(0)
  const [colFilterQuery, setColFilterQuery] = useState("")
  const [formulaCategory, setFormulaCategory] = useState<string>("Math & Trig")
  const [showCondDrawer, setShowCondDrawer] = useState(false)
  const [condOp, setCondOp] = useState<SheetConditionalRule["op"]>("gt")
  const [condTarget, setCondTarget] = useState("1000")
  const [condBg, setCondBg] = useState("#FEF3C7")
  const [showValDrawer, setShowValDrawer] = useState(false)
  const [valListDraft, setValListDraft] = useState("Labor,Materials,Specialty,Compliance,Closeout")
  const [showCommentPopover, setShowCommentPopover] = useState(false)
  const [commentDraft, setCommentDraft] = useState("")
  const [clipboardRange, setClipboardRange] = useState<string[][] | null>(null)
  const [undoStack, setUndoStack] = useState<Array<Record<string, SheetCell>>>([])
  const [redoStack, setRedoStack] = useState<Array<Record<string, SheetCell>>>([])
  const [statusNotice, setStatusNotice] = useState<string | null>(null)
  const [savedLabel, setSavedLabel] = useState("Saved locally")

  const csvInputRef = useRef<HTMLInputElement>(null)
  const inlineInputRef = useRef<HTMLInputElement>(null)

  const activeWorkbook = useMemo(
    () => workbooks.find((w) => w.id === activeWorkbookId) || workbooks[0],
    [workbooks, activeWorkbookId]
  )

  const activeSheet: StudioSheetTab = useMemo(() => {
    if (!activeWorkbook) {
      return { id: "sheet-1", name: "Sheet 1", rowCount: 20, colCount: 10, cells: {} }
    }
    return (
      activeWorkbook.sheets.find((s) => s.id === activeWorkbook.activeSheetId) ||
      activeWorkbook.sheets[0]
    )
  }, [activeWorkbook])

  const evaluatedMap = useMemo(() => evaluateSheet(activeSheet.cells), [activeSheet.cells])

  const selectedKey = makeCellKey(selectedCell.col, selectedCell.row)
  const selectedCellData = activeSheet.cells[selectedKey]
  const selectedEval = evaluatedMap[selectedKey]

  const normRange = useMemo(() => {
    const end = selectionEnd || selectedCell
    return {
      minCol: Math.min(selectedCell.col, end.col),
      maxCol: Math.max(selectedCell.col, end.col),
      minRow: Math.min(selectedCell.row, end.row),
      maxRow: Math.max(selectedCell.row, end.row),
    }
  }, [selectedCell, selectionEnd])

  useEffect(() => {
    saveStudioWorkbooks(user, workbooks)
  }, [workbooks, user])

  useEffect(() => {
    if (editingCellKey) {
      setTimeout(() => inlineInputRef.current?.focus(), 0)
    }
  }, [editingCellKey])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault()
        setShowPrintModal(true)
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "f" || e.key.toLowerCase() === "h")) {
        e.preventDefault()
        setShowFindBar(true)
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d" && !editingCellKey) {
        e.preventDefault()
        handleFillDown()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !editingCellKey) {
        if (document.activeElement?.tagName !== "INPUT") {
          e.preventDefault()
          handleUndo()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y" && !editingCellKey) {
        if (document.activeElement?.tagName !== "INPUT") {
          e.preventDefault()
          handleRedo()
        }
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  })

  const notify = (msg: string) => {
    setStatusNotice(msg)
    setTimeout(() => {
      setStatusNotice((prev) => (prev === msg ? null : prev))
    }, 3200)
  }

  const updateActiveWorkbook = (updater: (wb: StudioWorkbookRecord) => StudioWorkbookRecord) => {
    if (!activeWorkbook) return
    const now = new Date().toISOString()
    setWorkbooks((prev) =>
      prev.map((wb) => (wb.id === activeWorkbook.id ? { ...updater(wb), updatedAt: now } : wb))
    )
    setSavedLabel(
      `Saved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    )
  }

  const pushHistoryAndApplySheet = (updater: (sheet: StudioSheetTab) => StudioSheetTab) => {
    setUndoStack((prev) => [...prev.slice(-24), { ...activeSheet.cells }])
    setRedoStack([])
    updateActiveWorkbook((wb) => ({
      ...wb,
      sheets: wb.sheets.map((s) => (s.id === activeSheet.id ? updater(s) : s)),
    }))
  }

  const updateActiveSheet = (updater: (sheet: StudioSheetTab) => StudioSheetTab) => {
    updateActiveWorkbook((wb) => ({
      ...wb,
      sheets: wb.sheets.map((s) => (s.id === activeSheet.id ? updater(s) : s)),
    }))
  }

  const handleUndo = () => {
    if (undoStack.length === 0) return
    const prevCells = undoStack[undoStack.length - 1]
    setUndoStack((s) => s.slice(0, -1))
    setRedoStack((r) => [...r, { ...activeSheet.cells }])
    updateActiveSheet((sheet) => ({ ...sheet, cells: prevCells }))
    notify("Undid last spreadsheet change")
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return
    const nextCells = redoStack[redoStack.length - 1]
    setRedoStack((r) => r.slice(0, -1))
    setUndoStack((u) => [...u, { ...activeSheet.cells }])
    updateActiveSheet((sheet) => ({ ...sheet, cells: nextCells }))
    notify("Redid spreadsheet change")
  }

  const setCellRaw = (key: string, raw: string) => {
    pushHistoryAndApplySheet((sheet) => {
      const nextCells = { ...sheet.cells }
      const existing = nextCells[key]
      if (raw === "" && !existing?.style) {
        delete nextCells[key]
      } else {
        nextCells[key] = { raw, style: existing?.style }
      }
      return { ...sheet, cells: nextCells }
    })
  }

  const applyRangeStyle = (stylePatch: Partial<SheetCellStyle>) => {
    pushHistoryAndApplySheet((sheet) => {
      const nextCells = { ...sheet.cells }
      for (let r = normRange.minRow; r <= normRange.maxRow; r++) {
        for (let c = normRange.minCol; c <= normRange.maxCol; c++) {
          const k = makeCellKey(c, r)
          const current = nextCells[k] || { raw: "" }
          nextCells[k] = {
            raw: current.raw,
            style: { ...(current.style || {}), ...stylePatch },
          }
        }
      }
      return { ...sheet, cells: nextCells }
    })
  }

  const adjustDecimals = (delta: 1 | -1) => {
    const curDec = selectedCellData?.style?.decimals ?? 2
    const nextDec = Math.max(0, Math.min(4, curDec + delta))
    applyRangeStyle({
      decimals: nextDec,
      format: selectedCellData?.style?.format || "number",
    })
  }

  const handleFillDown = () => {
    const startRow = normRange.minRow
    const endRow =
      normRange.maxRow > startRow
        ? normRange.maxRow
        : Math.min(activeSheet.rowCount - 1, startRow + 1)
    pushHistoryAndApplySheet((sheet) => {
      const nextCells = { ...sheet.cells }
      for (let c = normRange.minCol; c <= normRange.maxCol; c++) {
        const srcKey = makeCellKey(c, startRow)
        const srcCell = nextCells[srcKey]
        if (!srcCell) continue
        for (let r = startRow + 1; r <= endRow; r++) {
          const destKey = makeCellKey(c, r)
          nextCells[destKey] = {
            raw: shiftFormulaRefs(srcCell.raw, 0, r - startRow),
            style: srcCell.style ? { ...srcCell.style } : undefined,
          }
        }
      }
      return { ...sheet, cells: nextCells }
    })
    notify(`Filled down across rows ${startRow + 1}–${endRow + 1}`)
  }

  const handleCopyRange = (cut: boolean) => {
    const copied: string[][] = []
    for (let r = normRange.minRow; r <= normRange.maxRow; r++) {
      const rowArr: string[] = []
      for (let c = normRange.minCol; c <= normRange.maxCol; c++) {
        rowArr.push(activeSheet.cells[makeCellKey(c, r)]?.raw || "")
      }
      copied.push(rowArr)
    }
    setClipboardRange(copied)
    if (cut) {
      pushHistoryAndApplySheet((sheet) => {
        const nextCells = { ...sheet.cells }
        for (let r = normRange.minRow; r <= normRange.maxRow; r++) {
          for (let c = normRange.minCol; c <= normRange.maxCol; c++) {
            const k = makeCellKey(c, r)
            if (nextCells[k]?.style) nextCells[k] = { raw: "", style: nextCells[k].style }
            else delete nextCells[k]
          }
        }
        return { ...sheet, cells: nextCells }
      })
    }
    notify(`${cut ? "Cut" : "Copied"} ${copied.length}×${copied[0]?.length || 1} cell range`)
  }

  const handlePasteRange = () => {
    if (!clipboardRange) {
      notify("Copy cells inside ConnectLn Sheets first")
      return
    }
    pushHistoryAndApplySheet((sheet) => {
      const nextCells = { ...sheet.cells }
      clipboardRange.forEach((rowArr, rOff) => {
        rowArr.forEach((rawVal, cOff) => {
          const destKey = makeCellKey(selectedCell.col + cOff, selectedCell.row + rOff)
          const existing = nextCells[destKey]
          nextCells[destKey] = {
            raw: shiftFormulaRefs(rawVal, cOff, rOff),
            style: existing?.style,
          }
        })
      })
      return { ...sheet, cells: nextCells }
    })
    notify("Pasted cells")
  }

  const handleStructuralEdit = (op: "insert_row" | "delete_row" | "insert_col" | "delete_col") => {
    pushHistoryAndApplySheet((sheet) => {
      const nextCells: Record<string, SheetCell> = {}
      for (const [k, cell] of Object.entries(sheet.cells)) {
        const p = parseCellKey(k)
        if (!p) continue
        if (op === "insert_row") {
          const nr = p.row >= selectedCell.row ? p.row + 1 : p.row
          nextCells[makeCellKey(p.col, nr)] = cell
        } else if (op === "delete_row") {
          if (p.row === selectedCell.row) continue
          const nr = p.row > selectedCell.row ? p.row - 1 : p.row
          nextCells[makeCellKey(p.col, nr)] = cell
        } else if (op === "insert_col") {
          const nc = p.col >= selectedCell.col ? p.col + 1 : p.col
          nextCells[makeCellKey(nc, p.row)] = cell
        } else if (op === "delete_col") {
          if (p.col === selectedCell.col) continue
          const nc = p.col > selectedCell.col ? p.col - 1 : p.col
          nextCells[makeCellKey(nc, p.row)] = cell
        }
      }
      return {
        ...sheet,
        rowCount:
          op === "insert_row"
            ? sheet.rowCount + 1
            : op === "delete_row"
            ? Math.max(5, sheet.rowCount - 1)
            : sheet.rowCount,
        colCount:
          op === "insert_col"
            ? sheet.colCount + 1
            : op === "delete_col"
            ? Math.max(3, sheet.colCount - 1)
            : sheet.colCount,
        cells: nextCells,
      }
    })
    notify(`Applied ${op.replace("_", " ")}`)
  }

  const handleAddChart = (kind: SheetChartConfig["kind"]) => {
    // Pick first text col as label & active col (or col E/B) as numeric series
    let labelCol = 0
    let valueCol = selectedCell.col
    if (valueCol === labelCol) {
      for (let c = 1; c < activeSheet.colCount; c++) {
        const ev = evaluatedMap[makeCellKey(c, 1)]
        if (ev && typeof ev.numeric === "number") {
          valueCol = c
          break
        }
      }
    }
    const newChart: SheetChartConfig = {
      id: `chart_${Date.now()}`,
      kind,
      title: `${activeSheet.name} — ${kind.toUpperCase()} Chart`,
      labelCol,
      valueCol: Math.max(1, valueCol),
      startRow: 1,
      endRow: Math.min(8, activeSheet.rowCount - 1),
    }
    updateActiveSheet((sheet) => ({
      ...sheet,
      charts: [...(sheet.charts || []), newChart],
    }))
    notify(`Inserted live ${kind.toUpperCase()} Chart below grid`)
  }

  const handleRemoveDuplicates = () => {
    const seenSigs = new Set<string>()
    const keepRows: number[] = []
    let removed = 0
    for (let r = 0; r < activeSheet.rowCount; r++) {
      const vals: string[] = []
      let nonEmpty = false
      for (let c = 0; c < activeSheet.colCount; c++) {
        const raw = activeSheet.cells[makeCellKey(c, r)]?.raw || ""
        if (raw.trim() !== "") nonEmpty = true
        vals.push(raw.trim().toLowerCase())
      }
      if (!nonEmpty) continue
      const sig = vals.join("\u0001")
      if (r > 0 && seenSigs.has(sig)) {
        removed++
      } else {
        seenSigs.add(sig)
        keepRows.push(r)
      }
    }
    if (removed === 0) {
      notify("No duplicate rows found")
      return
    }
    pushHistoryAndApplySheet((sheet) => {
      const nextCells: Record<string, SheetCell> = {}
      keepRows.forEach((srcR, destR) => {
        for (let c = 0; c < sheet.colCount; c++) {
          const cell = sheet.cells[makeCellKey(c, srcR)]
          if (cell) nextCells[makeCellKey(c, destR)] = cell
        }
      })
      return { ...sheet, cells: nextCells }
    })
    notify(`Removed ${removed} duplicate row${removed > 1 ? "s" : ""}`)
  }

  const handleTextToColumns = () => {
    let splitCount = 0
    pushHistoryAndApplySheet((sheet) => {
      const nextCells = { ...sheet.cells }
      for (let r = 0; r < sheet.rowCount; r++) {
        const k = makeCellKey(selectedCell.col, r)
        const raw = nextCells[k]?.raw || ""
        if (raw && !raw.startsWith("=") && /[,;]/.test(raw)) {
          const parts = raw.split(/[,;]/).map((p) => p.trim())
          if (parts.length > 1) {
            splitCount++
            parts.forEach((part, idx) => {
              nextCells[makeCellKey(selectedCell.col + idx, r)] = {
                raw: part,
                style: idx === 0 ? nextCells[k]?.style : undefined,
              }
            })
          }
        }
      }
      return { ...sheet, cells: nextCells }
    })
    notify(splitCount > 0 ? `Split ${splitCount} delimited cell(s)` : "No comma/semicolon cells found in column")
  }

  const handleFindReplaceSheet = () => {
    if (!findTerm.trim()) return
    let count = 0
    pushHistoryAndApplySheet((sheet) => {
      const nextCells = { ...sheet.cells }
      const q = findTerm.toLowerCase()
      for (const [k, cell] of Object.entries(nextCells)) {
        if (cell.raw.toLowerCase().includes(q)) {
          count++
          const escaped = findTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          nextCells[k] = {
            ...cell,
            raw: cell.raw.replace(new RegExp(escaped, "gi"), replaceTerm),
          }
        }
      }
      return { ...sheet, cells: nextCells }
    })
    notify(`Replaced in ${count} cell(s)`)
  }

  const handleAddConditionalRule = () => {
    const nextRule: SheetConditionalRule = {
      id: `cr_${Date.now()}`,
      col: selectedCell.col,
      op: condOp,
      target: condTarget,
      bg: condBg,
      color: "#0B1F3A",
    }
    updateActiveSheet((sheet) => ({
      ...sheet,
      conditionalRules: [...(sheet.conditionalRules || []), nextRule],
    }))
    setShowCondDrawer(false)
    notify(`Added highlight rule on Column ${colIndexToLabel(selectedCell.col)}`)
  }

  const handleApplyValidation = () => {
    const options = valListDraft
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    updateActiveSheet((sheet) => ({
      ...sheet,
      validations: [
        ...(sheet.validations || []).filter((v) => v.col !== selectedCell.col),
        { col: selectedCell.col, kind: "list", options },
      ],
    }))
    setShowValDrawer(false)
    notify(`Applied dropdown list validation to Column ${colIndexToLabel(selectedCell.col)}`)
  }

  const handleSaveCellComment = () => {
    updateActiveSheet((sheet) => {
      const nextComments = { ...(sheet.comments || {}) }
      if (!commentDraft.trim()) delete nextComments[selectedKey]
      else nextComments[selectedKey] = commentDraft.trim()
      return { ...sheet, comments: nextComments }
    })
    setShowCommentPopover(false)
    notify(commentDraft.trim() ? `Saved note on ${selectedKey}` : `Removed note on ${selectedKey}`)
  }

  const beginEdit = (col: number, row: number, initialOverride?: string) => {
    const key = makeCellKey(col, row)
    setSelectedCell({ col, row })
    setSelectionEnd(null)
    setEditingCellKey(key)
    setDraftCellValue(
      initialOverride !== undefined ? initialOverride : activeSheet.cells[key]?.raw || ""
    )
  }

  const commitInlineEdit = (moveDir?: "down" | "right") => {
    if (!editingCellKey) return
    setCellRaw(editingCellKey, draftCellValue)
    setEditingCellKey(null)
    if (moveDir === "down") {
      setSelectedCell((prev) => ({
        col: prev.col,
        row: Math.min(activeSheet.rowCount - 1, prev.row + 1),
      }))
    } else if (moveDir === "right") {
      setSelectedCell((prev) => ({
        col: Math.min(activeSheet.colCount - 1, prev.col + 1),
        row: prev.row,
      }))
    }
  }

  const handleInsertQuickFormula = (fn: "SUM" | "AVERAGE" | "MIN" | "MAX" | "IF") => {
    if (fn === "IF") {
      const targetRef =
        selectedCell.col > 0 ? makeCellKey(selectedCell.col - 1, selectedCell.row) : "A1"
      setCellRaw(selectedKey, `=IF(${targetRef}>0,"Approved","Review")`)
      notify(`Inserted =IF(...) formula in ${selectedKey}`)
      return
    }
    const colLabel = colIndexToLabel(selectedCell.col)
    let startRow = -1
    let endRow = -1
    for (let r = selectedCell.row - 1; r >= 0; r--) {
      const k = makeCellKey(selectedCell.col, r)
      const ev = evaluatedMap[k]
      if (ev && typeof ev.numeric === "number") {
        if (endRow === -1) endRow = r
        startRow = r
      } else if (endRow !== -1) {
        break
      }
    }
    const rangeExpr =
      startRow !== -1 && endRow !== -1
        ? `${colLabel}${startRow + 1}:${colLabel}${endRow + 1}`
        : `${colLabel}2:${colLabel}${Math.max(2, selectedCell.row)}`
    setCellRaw(selectedKey, `=${fn}(${rangeExpr})`)
    notify(`Inserted =${fn}(${rangeExpr}) in ${selectedKey}`)
  }

  const handleSortActiveColumn = (ascending: boolean) => {
    const colIdx = selectedCell.col
    const rowIndices: number[] = []
    for (let r = 1; r < activeSheet.rowCount; r++) {
      let hasData = false
      for (let c = 0; c < activeSheet.colCount; c++) {
        if (activeSheet.cells[makeCellKey(c, r)]?.raw) {
          hasData = true
          break
        }
      }
      if (hasData) rowIndices.push(r)
    }
    if (rowIndices.length < 2) {
      notify("Add at least two data rows below header Row 1 to sort")
      return
    }

    const rowData = rowIndices.map((r) => {
      const sortKeyEval = evaluatedMap[makeCellKey(colIdx, r)]
      const cellsInRow: Array<{ col: number; cell?: SheetCell }> = []
      for (let c = 0; c < activeSheet.colCount; c++) {
        cellsInRow.push({ col: c, cell: activeSheet.cells[makeCellKey(c, r)] })
      }
      return { r, sortKeyEval, cellsInRow }
    })

    rowData.sort((a, b) => {
      const av = a.sortKeyEval?.value ?? ""
      const bv = b.sortKeyEval?.value ?? ""
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv))
      return ascending ? cmp : -cmp
    })

    pushHistoryAndApplySheet((sheet) => {
      const nextCells = { ...sheet.cells }
      rowIndices.forEach((targetRow, idx) => {
        rowData[idx].cellsInRow.forEach(({ col, cell }) => {
          const destKey = makeCellKey(col, targetRow)
          if (cell) nextCells[destKey] = cell
          else delete nextCells[destKey]
        })
      })
      return { ...sheet, cells: nextCells }
    })
    notify(`Sorted Column ${colIndexToLabel(colIdx)} ${ascending ? "A → Z" : "Z → A"}`)
  }

  const handleAddSheetTab = () => {
    if (!activeWorkbook) return
    const nextNum = activeWorkbook.sheets.length + 1
    const newTab: StudioSheetTab = {
      id: `sheet_${Date.now()}`,
      name: `Sheet ${nextNum}`,
      rowCount: 22,
      colCount: 10,
      cells: {},
    }
    updateActiveWorkbook((wb) => ({
      ...wb,
      sheets: [...wb.sheets, newTab],
      activeSheetId: newTab.id,
    }))
    setSelectedCell({ col: 0, row: 0 })
    notify(`Added ${newTab.name}`)
  }

  const handleRenameActiveSheet = () => {
    const next = window.prompt("Rename sheet tab:", activeSheet.name)
    if (next && next.trim()) {
      updateActiveSheet((s) => ({ ...s, name: next.trim().slice(0, 31) }))
    }
  }

  const handleDuplicateSheetTab = () => {
    if (!activeWorkbook) return
    const copyTab: StudioSheetTab = {
      ...activeSheet,
      id: `sheet_${Date.now()}`,
      name: `${activeSheet.name.slice(0, 24)} Copy`,
      cells: JSON.parse(JSON.stringify(activeSheet.cells)),
    }
    updateActiveWorkbook((wb) => ({
      ...wb,
      sheets: [...wb.sheets, copyTab],
      activeSheetId: copyTab.id,
    }))
    notify(`Duplicated "${activeSheet.name}"`)
  }

  const handleCreateFromTemplate = (tpl: SheetTemplateItem) => {
    const sheets = tpl.buildSheets()
    const now = new Date().toISOString()
    const newWb: StudioWorkbookRecord = {
      id: `wb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: tpl.name === "Blank Spreadsheet" ? `Untitled Workbook ${workbooks.length + 1}` : tpl.name,
      category: tpl.category,
      sheets,
      activeSheetId: sheets[0].id,
      createdAt: now,
      updatedAt: now,
      authorName: user.name || "ConnectLn Member",
    }
    setWorkbooks((prev) => [newWb, ...prev])
    setActiveWorkbookId(newWb.id)
    setSelectedCell({ col: 0, row: 0 })
    setShowTemplatesModal(false)
    notify(`Created "${newWb.title}"`)
  }

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const text = await file.text()
    const grid = parseCsvToGrid(text)
    const cells: Record<string, SheetCell> = {}
    let maxCols = 8
    grid.forEach((rowVals, rIdx) => {
      maxCols = Math.max(maxCols, rowVals.length)
      rowVals.forEach((val, cIdx) => {
        if (val !== "") {
          cells[makeCellKey(cIdx, rIdx)] = {
            raw: val,
            style: rIdx === 0 ? { bold: true, bg: "#F0F6FF" } : undefined,
          }
        }
      })
    })
    const now = new Date().toISOString()
    const sheetId = `sheet_${Date.now()}`
    const wb: StudioWorkbookRecord = {
      id: `wb_${Date.now()}`,
      title: file.name.replace(/\.[^.]+$/, "") || "Imported CSV Workbook",
      category: "Imported CSV",
      sheets: [
        {
          id: sheetId,
          name: "Imported Sheet",
          rowCount: Math.max(20, grid.length + 5),
          colCount: Math.max(10, maxCols + 2),
          cells,
        },
      ],
      activeSheetId: sheetId,
      createdAt: now,
      updatedAt: now,
      authorName: user.name || "ConnectLn Member",
    }
    setWorkbooks((prev) => [wb, ...prev])
    setActiveWorkbookId(wb.id)
    setSelectedCell({ col: 0, row: 0 })
    notify(`Imported ${file.name} (${grid.length} rows)`)
  }

  const handleExport = (kind: "xlsx" | "csv" | "json" | "print") => {
    if (!activeWorkbook) return
    setShowExportMenu(false)
    const slug = safeSlug(activeWorkbook.title)

    if (kind === "xlsx") {
      const exportTabs = activeWorkbook.sheets.map((tab) => {
        const evalMap = evaluateSheet(tab.cells)
        const mappedCells: Record<
          string,
          { raw: string; evaluated?: string | number | boolean; isNumeric?: boolean }
        > = {}
        for (const [key, cell] of Object.entries(tab.cells)) {
          const ev = evalMap[key]
          mappedCells[key] = {
            raw: cell.raw,
            evaluated: ev?.value,
            isNumeric: typeof ev?.numeric === "number",
          }
        }
        return { name: tab.name, rowCount: tab.rowCount, colCount: tab.colCount, cells: mappedCells }
      })
      downloadStudioFile(
        buildXlsxBytes(activeWorkbook.title, exportTabs),
        `${slug}.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
      notify(`Exported ${slug}.xlsx`)
      return
    }

    if (kind === "csv") {
      const rows: string[][] = []
      for (let r = 0; r < activeSheet.rowCount; r++) {
        const line: string[] = []
        let hasContent = false
        for (let c = 0; c < activeSheet.colCount; c++) {
          const k = makeCellKey(c, r)
          const cell = activeSheet.cells[k]
          const formatted = cell
            ? formatEvaluatedValue(evaluatedMap[k], cell.style?.format || "general", cell.style?.decimals)
            : ""
          if (formatted) hasContent = true
          line.push(formatted)
        }
        if (hasContent || rows.length > 0) rows.push(line)
      }
      while (rows.length > 0 && rows[rows.length - 1].every((v) => v === "")) rows.pop()
      downloadStudioFile(gridToCsv(rows), `${slug}.csv`, "text/csv;charset=utf-8")
      notify(`Exported ${slug}.csv`)
      return
    }

    if (kind === "json") {
      downloadStudioFile(
        JSON.stringify(activeWorkbook, null, 2),
        `${slug}.json`,
        "application/json;charset=utf-8"
      )
      notify(`Exported ${slug}.json`)
      return
    }

    setShowPrintModal(true)
  }

  const handleShareSheet = () => {
    if (!activeWorkbook || !onShareToFeed) return
    const previewLines: string[] = []
    for (let r = 0; r < Math.min(6, activeSheet.rowCount); r++) {
      const rowTexts: string[] = []
      for (let c = 0; c < Math.min(5, activeSheet.colCount); c++) {
        const k = makeCellKey(c, r)
        const cell = activeSheet.cells[k]
        if (cell) {
          rowTexts.push(formatEvaluatedValue(evaluatedMap[k], cell.style?.format || "general"))
        }
      }
      if (rowTexts.length > 0) previewLines.push(rowTexts.join(" · "))
    }
    onShareToFeed({
      title: activeWorkbook.title,
      summary: `Shared live workbook "${activeWorkbook.title}" (${activeSheet.name}) from ConnectLn Sheets.`,
      appLabel: "ConnectLn Sheets",
      slides: [
        {
          slideNumber: 1,
          title: `${activeWorkbook.title} — ${activeSheet.name}`,
          content: previewLines.join("\n") || "Live spreadsheet calculations published via ConnectLn Sheets.",
          visualTag: "ConnectLn Sheets",
        },
      ],
    })
    notify("Shared workbook summary to ConnectLn Feed")
  }

  const rangeStats = useMemo(() => {
    let count = 0
    let sum = 0
    let min = Infinity
    let max = -Infinity
    const end = selectionEnd || { col: selectedCell.col, row: activeSheet.rowCount - 1 }
    const r0 = selectionEnd ? normRange.minRow : 0
    const r1 = selectionEnd ? normRange.maxRow : activeSheet.rowCount - 1
    const c0 = selectionEnd ? normRange.minCol : selectedCell.col
    const c1 = selectionEnd ? normRange.maxCol : selectedCell.col

    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const ev = evaluatedMap[makeCellKey(c, r)]
        if (ev && typeof ev.numeric === "number") {
          count++
          sum += ev.numeric
          min = Math.min(min, ev.numeric)
          max = Math.max(max, ev.numeric)
        }
      }
    }
    return {
      label: selectionEnd
        ? `${makeCellKey(normRange.minCol, normRange.minRow)}:${makeCellKey(normRange.maxCol, normRange.maxRow)}`
        : `Col ${colIndexToLabel(selectedCell.col)}`,
      count,
      sum,
      avg: count > 0 ? sum / count : 0,
      min: count > 0 ? min : 0,
      max: count > 0 ? max : 0,
    }
  }, [activeSheet.rowCount, selectedCell, selectionEnd, normRange, evaluatedMap])

  const filteredWorkbooks = useMemo(() => {
    const q = wbSearch.trim().toLowerCase()
    const list = q
      ? workbooks.filter(
          (w) => w.title.toLowerCase().includes(q) || w.category.toLowerCase().includes(q)
        )
      : workbooks
    return [...list].sort((a, b) => Number(Boolean(b.starred)) - Number(Boolean(a.starred)))
  }, [workbooks, wbSearch])

  const activeFormat: CellFormat = selectedCellData?.style?.format || "general"
  const validationMap = useMemo(() => {
    const map = new Map<number, string[]>()
    for (const v of activeSheet.validations || []) {
      if (v.kind === "list" && v.options?.length) map.set(v.col, v.options)
    }
    return map
  }, [activeSheet.validations])

  const chartsSvgHtml = useMemo(() => {
    if (!activeSheet.charts || activeSheet.charts.length === 0) return ""
    return activeSheet.charts
      .map((ch) => buildChartSvgMarkup(ch, activeSheet, evaluatedMap))
      .join("")
  }, [activeSheet, evaluatedMap])

  return (
    <div className="flex flex-col lg:flex-row rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm min-h-[780px]">
      {/* Workbooks Library Sidebar */}
      {sidebarOpen && (
        <aside className="w-full lg:w-[260px] shrink-0 border-b lg:border-b-0 lg:border-r border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/80 dark:bg-zinc-950/60 flex flex-col">
          <div className="p-3 border-b border-[#E7E2DA] dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Table2 className="h-3.5 w-3.5" />
                Workbooks ({workbooks.length})
              </span>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-[#107C41] hover:bg-[#0c6032] text-white px-2.5 py-1 text-[11px] font-bold cursor-pointer"
              >
                <FilePlus2 className="h-3.5 w-3.5" />
                New
              </button>
            </div>

            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={wbSearch}
                onChange={(e) => setWbSearch(e.target.value)}
                placeholder="Search workbooks..."
                className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-8 pr-3 py-1.5 text-xs outline-none focus:border-[#107C41]"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowTemplatesModal(true)}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-[11px] font-semibold cursor-pointer hover:border-[#107C41]"
              >
                <LayoutTemplate className="h-3.5 w-3.5 text-[#107C41]" />
                Templates
              </button>
              <button
                type="button"
                onClick={() => csvInputRef.current?.click()}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-[11px] font-semibold cursor-pointer hover:border-[#107C41]"
              >
                <Upload className="h-3.5 w-3.5 text-[#107C41]" />
                Import CSV
              </button>
              <input ref={csvInputRef} type="file" accept=".csv,text/csv" onChange={handleImportCsv} className="hidden" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[240px] lg:max-h-none">
            {filteredWorkbooks.map((wb) => {
              const isSelected = activeWorkbook?.id === wb.id
              return (
                <div
                  key={wb.id}
                  onClick={() => {
                    setActiveWorkbookId(wb.id)
                    setSelectedCell({ col: 0, row: 0 })
                    setSelectionEnd(null)
                    setEditingCellKey(null)
                  }}
                  className={`group rounded-xl border p-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#107C41] bg-white dark:bg-zinc-900 shadow-xs"
                      : "border-transparent hover:border-[#E7E2DA] hover:bg-white/70 dark:hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#0B1F3A] dark:text-zinc-100 truncate">
                        {wb.title}
                      </p>
                      <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                        {wb.sheets.length} sheet{wb.sheets.length > 1 ? "s" : ""} · {wb.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setWorkbooks((prev) =>
                            prev.map((w) => (w.id === wb.id ? { ...w, starred: !w.starred } : w))
                          )
                        }}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <Star className={`h-3.5 w-3.5 ${wb.starred ? "fill-amber-400 text-amber-500" : "text-zinc-400"}`} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          const now = new Date().toISOString()
                          const copy: StudioWorkbookRecord = {
                            ...wb,
                            id: `wb_${Date.now()}`,
                            title: `${wb.title} (Copy)`,
                            createdAt: now,
                            updatedAt: now,
                            starred: false,
                          }
                          setWorkbooks((prev) => [copy, ...prev])
                          setActiveWorkbookId(copy.id)
                          notify("Workbook duplicated")
                        }}
                        className="p-1 rounded text-zinc-400 hover:text-[#107C41] opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (workbooks.length <= 1) {
                            notify("Keep at least one workbook")
                            return
                          }
                          const rem = workbooks.filter((w) => w.id !== wb.id)
                          setWorkbooks(rem)
                          if (activeWorkbookId === wb.id && rem[0]) setActiveWorkbookId(rem[0].id)
                          notify("Workbook deleted")
                        }}
                        className="p-1 rounded text-zinc-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>
      )}

      {/* Main Spreadsheet Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-[#E7E2DA] dark:border-zinc-800">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen((s) => !s)}
              className="rounded-lg p-1.5 border border-[#E7E2DA] dark:border-zinc-700 hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer shrink-0"
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
            <button
              type="button"
              aria-label="Open ConnectLn Sheets Hub"
              onClick={() => setShowHubDrawer(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B1F3A] hover:bg-[#132D52] text-white px-2.5 py-1.5 text-xs font-extrabold shadow-2xs cursor-pointer shrink-0"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Studio Hub</span>
            </button>
            <input
              type="text"
              aria-label="Workbook title"
              value={activeWorkbook?.title || ""}
              onChange={(e) => updateActiveWorkbook((wb) => ({ ...wb, title: e.target.value }))}
              className="min-w-[150px] flex-1 max-w-md rounded-lg border border-transparent hover:border-[#E7E2DA] focus:border-[#107C41] bg-transparent px-2 py-1 text-sm sm:text-base font-extrabold text-[#0B1F3A] dark:text-white outline-none"
            />
            <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              {savedLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {statusNotice && (
              <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                {statusNotice}
              </span>
            )}

            {onSendToInvoice && activeWorkbook && (
              <button
                type="button"
                onClick={() =>
                  onSendToInvoice({
                    workbookTitle: activeWorkbook.title,
                    sheet: activeSheet,
                  })
                }
                title="Convert this sheet into a client invoice in ConnectLn Invoice & Ledger"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#0F766E] bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 px-3 py-1.5 text-xs font-extrabold text-[#0F766E] dark:text-teal-300 cursor-pointer"
              >
                <Receipt className="h-3.5 w-3.5" />
                Create Invoice
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              title="Print or Save Workbook as PDF (Ctrl+P)"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#107C41] bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 px-3 py-1.5 text-xs font-extrabold text-[#107C41] dark:text-emerald-300 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 px-3 py-1.5 text-xs font-bold hover:border-[#107C41] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#107C41]" />
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-10 z-30 w-56 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1.5 shadow-xl space-y-1">
                  <button type="button" onClick={() => handleExport("xlsx")} className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer">
                    <span>Standard Workbook (.xlsx)</span>
                    <span className="text-[10px] font-mono text-[#107C41]">OpenXML</span>
                  </button>
                  <button type="button" onClick={() => handleExport("csv")} className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer">
                    <span>Active Sheet (.csv)</span>
                    <span className="text-[10px] font-mono text-zinc-400">UTF-8</span>
                  </button>
                  <button type="button" onClick={() => handleExport("json")} className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer">
                    <span>Workbook Data (.json)</span>
                    <span className="text-[10px] font-mono text-zinc-400">JSON</span>
                  </button>
                  <button type="button" onClick={() => handleExport("print")} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer">
                    <Printer className="h-3.5 w-3.5 text-[#107C41]" />
                    <span>Print / Save as PDF</span>
                  </button>
                </div>
              )}
            </div>

            {onShareToFeed && (
              <button
                type="button"
                onClick={handleShareSheet}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#107C41] hover:bg-[#0c6032] text-white px-3 py-1.5 text-xs font-bold shadow-xs cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share to Feed
              </button>
            )}
          </div>
        </div>

        {/* 5-Tab Ribbon */}
        <div className="flex items-center justify-between gap-2 px-3 pt-1.5 border-b border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {(
              [
                { id: "home", label: "Home" },
                { id: "insert", label: "Insert" },
                { id: "formulas", label: "Formulas" },
                { id: "data", label: "Data" },
                { id: "view", label: "View" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRibbonTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-t-lg border-b-2 transition-colors cursor-pointer ${
                  ribbonTab === tab.id
                    ? "border-[#107C41] bg-white dark:bg-zinc-900 text-[#107C41] dark:text-emerald-400"
                    : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-[#0B1F3A]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="hidden md:inline text-[10.5px] font-mono text-zinc-500 pr-1">
            45+ Functions · Shift+Click Multi-Select · Ctrl+D Fill Down
          </span>
        </div>

        {/* Ribbon Tool Strip */}
        <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/70 dark:bg-zinc-950/70 text-xs">
          {ribbonTab === "home" && (
            <>
              <button type="button" onClick={handleUndo} disabled={undoStack.length === 0} title="Undo (Ctrl+Z)" className="p-1.5 rounded-lg hover:bg-white disabled:opacity-35 cursor-pointer"><Undo2 className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={handleRedo} disabled={redoStack.length === 0} title="Redo (Ctrl+Y)" className="p-1.5 rounded-lg hover:bg-white disabled:opacity-35 cursor-pointer"><Redo2 className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => handleCopyRange(true)} title="Cut Range" className="p-1.5 rounded-lg hover:bg-white cursor-pointer"><Scissors className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => handleCopyRange(false)} title="Copy Range" className="p-1.5 rounded-lg hover:bg-white cursor-pointer"><Copy className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={handlePasteRange} title="Paste Range" className="p-1.5 rounded-lg hover:bg-white cursor-pointer"><Clipboard className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={handleFillDown} title="Fill Down (Ctrl+D)" className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 font-bold hover:border-[#107C41] cursor-pointer">Fill ↓</button>

              <span className="h-5 w-px bg-[#E7E2DA] dark:bg-zinc-700 mx-0.5" />

              <button type="button" onClick={() => applyRangeStyle({ bold: !selectedCellData?.style?.bold })} title="Bold" className={`p-1.5 rounded-lg cursor-pointer ${selectedCellData?.style?.bold ? "bg-[#0B1F3A] text-white" : "hover:bg-white"}`}><Bold className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => applyRangeStyle({ italic: !selectedCellData?.style?.italic })} title="Italic" className={`p-1.5 rounded-lg cursor-pointer ${selectedCellData?.style?.italic ? "bg-[#0B1F3A] text-white" : "hover:bg-white"}`}><Italic className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => applyRangeStyle({ underline: !selectedCellData?.style?.underline })} title="Underline" className={`p-1.5 rounded-lg cursor-pointer ${selectedCellData?.style?.underline ? "bg-[#0B1F3A] text-white" : "hover:bg-white"}`}><Underline className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => applyRangeStyle({ strikethrough: !selectedCellData?.style?.strikethrough })} title="Strikethrough" className={`p-1.5 rounded-lg cursor-pointer ${selectedCellData?.style?.strikethrough ? "bg-[#0B1F3A] text-white" : "hover:bg-white"}`}><Strikethrough className="h-3.5 w-3.5" /></button>

              <select
                aria-label="Cell border style"
                value={selectedCellData?.style?.border || "none"}
                onChange={(e) => applyRangeStyle({ border: e.target.value as SheetCellStyle["border"] })}
                className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 py-1 font-semibold cursor-pointer"
              >
                <option value="none">Border: Default</option>
                <option value="all">Borders: All</option>
                <option value="bottom">Border: Bottom</option>
                <option value="topBottom">Border: Top &amp; Bottom</option>
                <option value="box">Border: Thick Box</option>
              </select>

              <span className="h-5 w-px bg-[#E7E2DA] dark:bg-zinc-700 mx-0.5" />

              <button type="button" onClick={() => applyRangeStyle({ format: "currency", align: "right" })} title="Currency ($)" className={`p-1.5 rounded-lg cursor-pointer ${activeFormat === "currency" ? "bg-[#107C41] text-white" : "hover:bg-white"}`}><DollarSign className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => applyRangeStyle({ format: "percent", align: "right" })} title="Percent (%)" className={`p-1.5 rounded-lg cursor-pointer ${activeFormat === "percent" ? "bg-[#107C41] text-white" : "hover:bg-white"}`}><Percent className="h-3.5 w-3.5" /></button>
              <select
                aria-label="Number format"
                value={activeFormat}
                onChange={(e) => applyRangeStyle({ format: e.target.value as CellFormat })}
                className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 py-1 font-semibold cursor-pointer"
              >
                <option value="general">General</option>
                <option value="currency">Currency ($)</option>
                <option value="accounting">Accounting</option>
                <option value="percent">Percent (%)</option>
                <option value="number">Number (0.00)</option>
                <option value="integer">Integer</option>
                <option value="date">Date</option>
                <option value="scientific">Scientific</option>
              </select>
              <button type="button" onClick={() => adjustDecimals(1)} title="Increase Decimals" className="rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-1.5 py-1 font-mono font-bold cursor-pointer">+.0</button>
              <button type="button" onClick={() => adjustDecimals(-1)} title="Decrease Decimals" className="rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-1.5 py-1 font-mono font-bold cursor-pointer">-.0</button>

              {(
                [
                  { align: "left", Icon: AlignLeft },
                  { align: "center", Icon: AlignCenter },
                  { align: "right", Icon: AlignRight },
                ] as Array<{ align: CellAlign; Icon: React.ComponentType<{ className?: string }> }>
              ).map(({ align, Icon }) => (
                <button key={align} type="button" onClick={() => applyRangeStyle({ align })} className="p-1.5 rounded-lg hover:bg-white cursor-pointer"><Icon className="h-3.5 w-3.5" /></button>
              ))}
              <button
                type="button"
                onClick={() => applyRangeStyle({ wrapText: !selectedCellData?.style?.wrapText })}
                title="Wrap Text"
                className={`p-1.5 rounded-lg cursor-pointer ${selectedCellData?.style?.wrapText ? "bg-[#107C41] text-white" : "hover:bg-white"}`}
              >
                <WrapText className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowCondDrawer((v) => !v)}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-bold cursor-pointer ${
                  showCondDrawer ? "bg-[#107C41] text-white" : "border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Highlight Rules
              </button>

              <div className="flex items-center gap-1 ml-1">
                {FILL_SWATCHES.map((sw) => (
                  <button
                    key={sw.label}
                    type="button"
                    title={`Fill: ${sw.label}`}
                    onClick={() => applyRangeStyle({ bg: sw.bg, color: sw.color })}
                    style={{ backgroundColor: sw.bg || "#FFFFFF" }}
                    className="h-4 w-4 rounded-full border border-zinc-300 dark:border-zinc-600 cursor-pointer"
                  />
                ))}
              </div>
              <button type="button" onClick={() => setCellRaw(selectedKey, "")} title="Clear Cell" className="p-1.5 rounded-lg hover:bg-white text-rose-600 cursor-pointer"><Eraser className="h-3.5 w-3.5" /></button>
            </>
          )}

          {ribbonTab === "insert" && (
            <>
              <button type="button" onClick={() => handleAddChart("bar")} className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold hover:border-[#107C41] cursor-pointer"><BarChart3 className="h-3.5 w-3.5 text-[#107C41]" />Bar Chart</button>
              <button type="button" onClick={() => handleAddChart("line")} className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold hover:border-[#107C41] cursor-pointer"><LineChart className="h-3.5 w-3.5 text-[#107C41]" />Line Chart</button>
              <button type="button" onClick={() => handleAddChart("pie")} className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold hover:border-[#107C41] cursor-pointer"><PieChart className="h-3.5 w-3.5 text-[#107C41]" />Pie Chart</button>

              <span className="h-5 w-px bg-[#E7E2DA] dark:bg-zinc-700 mx-1" />

              <button type="button" onClick={() => handleStructuralEdit("insert_row")} className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-1 font-semibold hover:border-[#107C41] cursor-pointer"><Rows className="h-3.5 w-3.5" />+ Row Above</button>
              <button type="button" onClick={() => handleStructuralEdit("delete_row")} className="rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-1 font-semibold text-rose-600 cursor-pointer">- Delete Row</button>
              <button type="button" onClick={() => handleStructuralEdit("insert_col")} className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-1 font-semibold hover:border-[#107C41] cursor-pointer"><Columns className="h-3.5 w-3.5" />+ Col Left</button>
              <button type="button" onClick={() => handleStructuralEdit("delete_col")} className="rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-1 font-semibold text-rose-600 cursor-pointer">- Delete Col</button>

              <button
                type="button"
                onClick={() => {
                  setCommentDraft(activeSheet.comments?.[selectedKey] || "")
                  setShowCommentPopover((v) => !v)
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-2.5 py-1 font-bold hover:border-[#107C41] cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5 text-amber-600" />
                Cell Note ({selectedKey})
              </button>
            </>
          )}

          {ribbonTab === "formulas" && (
            <div className="w-full space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <button type="button" onClick={() => handleInsertQuickFormula("SUM")} className="rounded-lg bg-[#107C41] text-white px-2.5 py-1 font-bold cursor-pointer">Σ AutoSum</button>
                {(["AVERAGE", "MIN", "MAX", "IF"] as const).map((fn) => (
                  <button key={fn} type="button" onClick={() => handleInsertQuickFormula(fn)} className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 font-bold cursor-pointer">{fn}</button>
                ))}
                <span className="h-4 w-px bg-[#E7E2DA] mx-1" />
                {Object.keys(FORMULA_CATALOG).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormulaCategory(cat)}
                    className={`rounded-lg px-2 py-1 font-bold cursor-pointer ${
                      formulaCategory === cat ? "bg-[#0B1F3A] text-white" : "bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowFormulas((s) => !s)}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold ml-auto cursor-pointer ${
                    showFormulas ? "bg-amber-600 text-white" : "border border-[#E7E2DA] bg-white dark:bg-zinc-900"
                  }`}
                >
                  <FunctionSquare className="h-3.5 w-3.5" />
                  {showFormulas ? "Showing Formulas" : "Show Formulas"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    evaluateSheet(activeSheet.cells)
                    notify("Recalculated all workbook formulas")
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2 py-1 font-bold cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-[#107C41]" />
                  Recalculate
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {(FORMULA_CATALOG[formulaCategory] || []).map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    title={`${f.syntax} — ${f.desc}`}
                    onClick={() => {
                      setCellRaw(selectedKey, f.snippet)
                      notify(`Inserted ${f.syntax} into ${selectedKey}`)
                    }}
                    className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[#107C41] px-2 py-1 text-[11px] font-mono font-bold cursor-pointer"
                  >
                    {f.name}()
                  </button>
                ))}
              </div>
            </div>
          )}

          {ribbonTab === "data" && (
            <>
              <button type="button" onClick={() => handleSortActiveColumn(true)} className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold cursor-pointer"><ArrowDownAZ className="h-3.5 w-3.5 text-[#107C41]" />Sort A→Z</button>
              <button type="button" onClick={() => handleSortActiveColumn(false)} className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold cursor-pointer"><ArrowUpZA className="h-3.5 w-3.5 text-[#107C41]" />Sort Z→A</button>
              <button
                type="button"
                onClick={() => {
                  setColFilterCol(selectedCell.col)
                  setAutoFilterEnabled((v) => !v)
                }}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  autoFilterEnabled ? "bg-[#107C41] text-white" : "border border-[#E7E2DA] bg-white dark:bg-zinc-900"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                AutoFilter
              </button>
              <button
                type="button"
                onClick={() => setShowFindBar((v) => !v)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  showFindBar ? "bg-[#107C41] text-white" : "border border-[#E7E2DA] bg-white dark:bg-zinc-900"
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                Find &amp; Replace
              </button>
              <button type="button" onClick={handleRemoveDuplicates} className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold cursor-pointer"><CopyMinus className="h-3.5 w-3.5 text-[#107C41]" />Remove Duplicates</button>
              <button type="button" onClick={handleTextToColumns} className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold cursor-pointer"><Columns className="h-3.5 w-3.5 text-[#107C41]" />Text to Columns</button>
              <button
                type="button"
                onClick={() => setShowValDrawer((v) => !v)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  showValDrawer ? "bg-[#107C41] text-white" : "border border-[#E7E2DA] bg-white dark:bg-zinc-900"
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Data Validation
              </button>
            </>
          )}

          {ribbonTab === "view" && (
            <>
              <button type="button" onClick={() => setShowPrintModal(true)} className="inline-flex items-center gap-1 rounded-lg bg-[#107C41] text-white px-2.5 py-1 font-bold cursor-pointer"><Eye className="h-3.5 w-3.5" />Print Preview</button>
              <button
                type="button"
                onClick={() => updateActiveSheet((s) => ({ ...s, freezeRow1: !s.freezeRow1 }))}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  activeSheet.freezeRow1 ? "bg-[#0B1F3A] text-white" : "border border-[#E7E2DA] bg-white dark:bg-zinc-900"
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                Freeze Row 1
              </button>
              <button
                type="button"
                onClick={() => updateActiveSheet((s) => ({ ...s, freezeColA: !s.freezeColA }))}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  activeSheet.freezeColA ? "bg-[#0B1F3A] text-white" : "border border-[#E7E2DA] bg-white dark:bg-zinc-900"
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                Freeze Col A
              </button>
              <button
                type="button"
                onClick={() => setShowGridlines((g) => !g)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  showGridlines ? "bg-[#107C41] text-white" : "border border-[#E7E2DA] bg-white dark:bg-zinc-900"
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                Gridlines
              </button>
              <button
                type="button"
                onClick={() => setShowFormulaBar((f) => !f)}
                className={`rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  showFormulaBar ? "bg-[#107C41] text-white" : "border border-[#E7E2DA] bg-white dark:bg-zinc-900"
                }`}
              >
                Formula Bar
              </button>
              <button type="button" onClick={handleRenameActiveSheet} className="rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold cursor-pointer">Rename Sheet</button>
              <button type="button" onClick={handleDuplicateSheetTab} className="rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold cursor-pointer">Duplicate Sheet</button>
              <div className="flex items-center gap-1 ml-1">
                {([80, 90, 100, 115] as const).map((pct) => (
                  <button key={pct} type="button" onClick={() => setZoomPct(pct)} className={`rounded-lg px-2 py-1 font-bold cursor-pointer ${zoomPct === pct ? "bg-[#107C41] text-white" : "border border-[#E7E2DA] bg-white"}`}>
                    {pct}%
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Conditional / Validation / Note / Find / Filter Drawers */}
        {showCondDrawer && (
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-amber-50/70 dark:bg-zinc-900 border-b border-[#E7E2DA] text-xs">
            <span className="font-bold">Highlight Col {colIndexToLabel(selectedCell.col)} when:</span>
            <select value={condOp} onChange={(e) => setCondOp(e.target.value as any)} className="rounded-lg border px-2 py-1 bg-white dark:bg-zinc-800">
              <option value="gt">Greater than (&gt;)</option>
              <option value="lt">Less than (&lt;)</option>
              <option value="eq">Equals (=)</option>
              <option value="contains">Contains text</option>
            </select>
            <input type="text" value={condTarget} onChange={(e) => setCondTarget(e.target.value)} className="rounded-lg border px-2 py-1 w-28 bg-white dark:bg-zinc-800" />
            <input type="color" value={condBg} onChange={(e) => setCondBg(e.target.value)} className="h-6 w-8" />
            <button type="button" onClick={handleAddConditionalRule} className="rounded-lg bg-[#107C41] text-white px-3 py-1 font-bold cursor-pointer">Apply Rule</button>
            {(activeSheet.conditionalRules || []).length > 0 && (
              <button type="button" onClick={() => updateActiveSheet((s) => ({ ...s, conditionalRules: [] }))} className="text-rose-600 font-bold ml-2 cursor-pointer">Clear Rules</button>
            )}
          </div>
        )}

        {showValDrawer && (
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-emerald-50/70 dark:bg-zinc-900 border-b border-[#E7E2DA] text-xs">
            <span className="font-bold">Dropdown choices for Col {colIndexToLabel(selectedCell.col)}:</span>
            <input type="text" value={valListDraft} onChange={(e) => setValListDraft(e.target.value)} className="flex-1 min-w-[200px] rounded-lg border px-2.5 py-1 bg-white dark:bg-zinc-800" />
            <button type="button" onClick={handleApplyValidation} className="rounded-lg bg-[#107C41] text-white px-3 py-1 font-bold cursor-pointer">Save Validation</button>
          </div>
        )}

        {showCommentPopover && (
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-amber-50/70 dark:bg-zinc-900 border-b border-[#E7E2DA] text-xs">
            <span className="font-bold">Note on {selectedKey}:</span>
            <input type="text" value={commentDraft} onChange={(e) => setCommentDraft(e.target.value)} placeholder="Add explanation or audit note..." className="flex-1 min-w-[200px] rounded-lg border px-2.5 py-1 bg-white dark:bg-zinc-800" />
            <button type="button" onClick={handleSaveCellComment} className="rounded-lg bg-[#0B1F3A] text-white px-3 py-1 font-bold cursor-pointer">Save Note</button>
          </div>
        )}

        {showFindBar && (
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-emerald-50/70 dark:bg-zinc-800 border-b border-[#E7E2DA] text-xs">
            <input type="text" value={findTerm} onChange={(e) => setFindTerm(e.target.value)} placeholder="Find cell value..." className="rounded-lg border px-2.5 py-1 bg-white dark:bg-zinc-900" />
            <input type="text" value={replaceTerm} onChange={(e) => setReplaceTerm(e.target.value)} placeholder="Replace with..." className="rounded-lg border px-2.5 py-1 bg-white dark:bg-zinc-900" />
            <button type="button" onClick={handleFindReplaceSheet} className="rounded-lg bg-[#107C41] text-white px-3 py-1 font-bold cursor-pointer">Replace All</button>
            <button type="button" onClick={() => setShowFindBar(false)} className="ml-auto p-1 cursor-pointer"><X className="h-4 w-4" /></button>
          </div>
        )}

        {autoFilterEnabled && (
          <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 bg-sky-50/80 dark:bg-zinc-900 border-b border-[#E7E2DA] text-xs">
            <Filter className="h-3.5 w-3.5 text-[#107C41]" />
            <span className="font-bold">Filter Column:</span>
            <select value={colFilterCol} onChange={(e) => setColFilterCol(Number(e.target.value))} className="rounded-lg border px-2 py-0.5 bg-white dark:bg-zinc-800">
              {Array.from({ length: activeSheet.colCount }).map((_, c) => (
                <option key={c} value={c}>Col {colIndexToLabel(c)}</option>
              ))}
            </select>
            <input type="text" value={colFilterQuery} onChange={(e) => setColFilterQuery(e.target.value)} placeholder="Type text to match rows below header..." className="rounded-lg border px-2.5 py-0.5 bg-white dark:bg-zinc-800 w-56" />
            {colFilterQuery && (
              <button type="button" onClick={() => setColFilterQuery("")} className="text-zinc-500 underline cursor-pointer">Reset</button>
            )}
          </div>
        )}

        {/* Formula Bar */}
        {showFormulaBar && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <span className="inline-flex min-w-[54px] justify-center rounded-lg bg-[#FAF7F2] dark:bg-zinc-800 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-1 text-xs font-mono font-bold text-[#0B1F3A] dark:text-zinc-100">
              {selectionEnd
                ? `${makeCellKey(normRange.minCol, normRange.minRow)}:${makeCellKey(normRange.maxCol, normRange.maxRow)}`
                : selectedKey}
            </span>
            <span className="text-xs font-serif italic font-bold text-[#107C41]">fx</span>
            <input
              type="text"
              aria-label="Formula bar input"
              value={selectedCellData?.raw || ""}
              onChange={(e) => setCellRaw(selectedKey, e.target.value)}
              placeholder='Enter value or formula (e.g. =SUMIF(B2:B6,"Labor",E2:E6) or =VLOOKUP(...))'
              className="flex-1 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-[#FAF7F2]/50 dark:bg-zinc-950 px-3 py-1 text-xs font-mono text-[#0B1F3A] dark:text-zinc-100 outline-none focus:border-[#107C41]"
            />
            {selectedEval && selectedCellData?.raw?.startsWith("=") && (
              <span className="hidden md:inline-flex items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                = {formatEvaluatedValue(selectedEval, activeFormat, selectedCellData?.style?.decimals)}
              </span>
            )}
          </div>
        )}

        {/* Interactive Grid */}
        <div
          className="flex-1 overflow-auto bg-[#F8FAFC] dark:bg-zinc-950 select-none"
          tabIndex={0}
          style={{ zoom: `${zoomPct}%` }}
          onKeyDown={(e) => {
            if (editingCellKey || document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "SELECT") return
            if (e.key === "ArrowDown") {
              e.preventDefault()
              const next = { col: selectedCell.col, row: Math.min(activeSheet.rowCount - 1, selectedCell.row + 1) }
              if (e.shiftKey) setSelectionEnd(next)
              else { setSelectedCell(next); setSelectionEnd(null) }
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              const next = { col: selectedCell.col, row: Math.max(0, selectedCell.row - 1) }
              if (e.shiftKey) setSelectionEnd(next)
              else { setSelectedCell(next); setSelectionEnd(null) }
            } else if (e.key === "ArrowRight" || e.key === "Tab") {
              e.preventDefault()
              const next = { col: Math.min(activeSheet.colCount - 1, selectedCell.col + 1), row: selectedCell.row }
              if (e.shiftKey) setSelectionEnd(next)
              else { setSelectedCell(next); setSelectionEnd(null) }
            } else if (e.key === "ArrowLeft") {
              e.preventDefault()
              const next = { col: Math.max(0, selectedCell.col - 1), row: selectedCell.row }
              if (e.shiftKey) setSelectionEnd(next)
              else { setSelectedCell(next); setSelectionEnd(null) }
            } else if (e.key === "Enter" || e.key === "F2") {
              e.preventDefault()
              beginEdit(selectedCell.col, selectedCell.row)
            } else if (e.key === "Delete" || e.key === "Backspace") {
              e.preventDefault()
              setCellRaw(selectedKey, "")
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
              e.preventDefault()
              beginEdit(selectedCell.col, selectedCell.row, e.key)
            }
          }}
        >
          <table className="border-collapse table-fixed min-w-full text-xs">
            <thead className="sticky top-0 z-20 bg-[#FAF7F2] dark:bg-zinc-900">
              <tr>
                <th className="w-11 sticky left-0 z-30 border border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-900 py-1.5 text-[10px] font-bold text-zinc-500">
                  #
                </th>
                {Array.from({ length: activeSheet.colCount }).map((_, cIdx) => {
                  const colLetter = colIndexToLabel(cIdx)
                  const isActiveCol = cIdx >= normRange.minCol && cIdx <= normRange.maxCol
                  return (
                    <th
                      key={colLetter}
                      className={`w-32 border border-[#E7E2DA] dark:border-zinc-800 py-1.5 text-[11px] font-bold ${
                        isActiveCol
                          ? "bg-emerald-100/80 dark:bg-emerald-950/60 text-[#107C41] dark:text-emerald-300"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {colLetter}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: activeSheet.rowCount }).map((_, rIdx) => {
                if (autoFilterEnabled && colFilterQuery.trim() && rIdx > 0) {
                  const ev = evaluatedMap[makeCellKey(colFilterCol, rIdx)]
                  const text = String(ev?.value ?? "").toLowerCase()
                  if (!text.includes(colFilterQuery.trim().toLowerCase())) return null
                }
                const isActiveRow = rIdx >= normRange.minRow && rIdx <= normRange.maxRow
                const isFrozenRow = Boolean(activeSheet.freezeRow1 && rIdx === 0)
                return (
                  <tr key={rIdx} className={isFrozenRow ? "sticky top-[28px] z-10 shadow-xs" : ""}>
                    <td
                      className={`sticky left-0 z-10 border border-[#E7E2DA] dark:border-zinc-800 text-center text-[11px] font-bold ${
                        isActiveRow
                          ? "bg-emerald-100/80 dark:bg-emerald-950/60 text-[#107C41] dark:text-emerald-300"
                          : "bg-[#FAF7F2] dark:bg-zinc-900 text-zinc-500"
                      }`}
                    >
                      {rIdx + 1}
                    </td>
                    {Array.from({ length: activeSheet.colCount }).map((__, cIdx) => {
                      const key = makeCellKey(cIdx, rIdx)
                      const cell = activeSheet.cells[key]
                      const ev = evaluatedMap[key]
                      const isPrimarySel = selectedCell.col === cIdx && selectedCell.row === rIdx
                      const isInRange =
                        cIdx >= normRange.minCol &&
                        cIdx <= normRange.maxCol &&
                        rIdx >= normRange.minRow &&
                        rIdx <= normRange.maxRow
                      const isEditing = editingCellKey === key
                      const style = cell?.style
                      const displayVal = showFormulas
                        ? cell?.raw || ""
                        : formatEvaluatedValue(ev, style?.format || "general", style?.decimals)
                      const defaultAlign =
                        style?.align || (typeof ev?.numeric === "number" && !showFormulas ? "right" : "left")
                      const condHit = (activeSheet.conditionalRules || []).find(
                        (rule) => rule.col === cIdx && matchesConditionalRule(ev, rule.op, rule.target)
                      )
                      const note = activeSheet.comments?.[key]
                      const valOptions = rIdx > 0 ? validationMap.get(cIdx) : undefined
                      const isFrozenCol = Boolean(activeSheet.freezeColA && cIdx === 0)

                      return (
                        <td
                          key={key}
                          data-cell-key={key}
                          title={note ? `Note: ${note}` : undefined}
                          onClick={(e) => {
                            if (editingCellKey && editingCellKey !== key) commitInlineEdit()
                            if (e.shiftKey) setSelectionEnd({ col: cIdx, row: rIdx })
                            else { setSelectedCell({ col: cIdx, row: rIdx }); setSelectionEnd(null) }
                          }}
                          onDoubleClick={() => beginEdit(cIdx, rIdx)}
                          style={{
                            backgroundColor: condHit?.bg || style?.bg || (isInRange && !isPrimarySel ? "#ECFDF5" : undefined),
                            color: ev?.error ? "#DC2626" : condHit?.color || style?.color,
                            textAlign: defaultAlign,
                            borderBottom:
                              style?.border === "bottom" || style?.border === "topBottom"
                                ? "2px solid #0B1F3A"
                                : undefined,
                            borderTop: style?.border === "topBottom" ? "2px solid #0B1F3A" : undefined,
                          }}
                          className={`relative h-8 px-2 cursor-cell ${
                            style?.wrapText ? "whitespace-normal break-words" : "truncate"
                          } ${isFrozenCol ? "sticky left-[44px] z-10" : ""} ${
                            isPrimarySel
                              ? "border-2 border-[#107C41] ring-1 ring-[#107C41]/30 z-10 bg-white dark:bg-zinc-900"
                              : showGridlines
                              ? style?.border === "all" || style?.border === "box"
                                ? "border border-zinc-600"
                                : "border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-950"
                              : "border border-transparent bg-white dark:bg-zinc-950"
                          } ${style?.bold ? "font-bold" : "font-normal"} ${
                            style?.italic ? "italic" : ""
                          } ${style?.underline ? "underline" : ""} ${
                            style?.strikethrough ? "line-through" : ""
                          }`}
                        >
                          {note && (
                            <span className="absolute right-0 top-0 h-0 w-0 border-t-[6px] border-t-amber-500 border-l-[6px] border-l-transparent" />
                          )}
                          {isEditing ? (
                            valOptions && !draftCellValue.startsWith("=") ? (
                              <select
                                value={draftCellValue}
                                onChange={(e) => {
                                  setCellRaw(key, e.target.value)
                                  setEditingCellKey(null)
                                }}
                                onBlur={() => setEditingCellKey(null)}
                                className="w-full h-full bg-white dark:bg-zinc-900 text-xs outline-none"
                              >
                                <option value="">Select...</option>
                                {valOptions.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                ref={inlineInputRef}
                                type="text"
                                value={draftCellValue}
                                onChange={(e) => setDraftCellValue(e.target.value)}
                                onBlur={() => commitInlineEdit()}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") { e.preventDefault(); commitInlineEdit("down") }
                                  else if (e.key === "Tab") { e.preventDefault(); commitInlineEdit("right") }
                                  else if (e.key === "Escape") { e.preventDefault(); setEditingCellKey(null) }
                                }}
                                className="w-full h-full bg-white dark:bg-zinc-900 text-[#0B1F3A] dark:text-white outline-none font-mono text-xs"
                              />
                            )
                          ) : (
                            <span className="block truncate">{displayVal}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Live Embedded Sheet Charts Dock */}
          {activeSheet.charts && activeSheet.charts.length > 0 && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-900">
              {activeSheet.charts.map((chart) => {
                const pts: Array<{ label: string; value: number }> = []
                for (let r = chart.startRow; r <= Math.min(chart.endRow, activeSheet.rowCount - 1); r++) {
                  const lbl = String(evaluatedMap[makeCellKey(chart.labelCol, r)]?.value ?? "").trim()
                  const v = evaluatedMap[makeCellKey(chart.valueCol, r)]?.numeric
                  if (lbl && typeof v === "number" && Number.isFinite(v)) {
                    pts.push({ label: lbl.slice(0, 18), value: Math.max(0, v) })
                  }
                }
                const maxV = Math.max(1, ...pts.map((p) => p.value))
                return (
                  <div
                    key={chart.id}
                    className="rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-950 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={chart.title}
                        onChange={(e) =>
                          updateActiveSheet((s) => ({
                            ...s,
                            charts: (s.charts || []).map((c) =>
                              c.id === chart.id ? { ...c, title: e.target.value } : c
                            ),
                          }))
                        }
                        className="text-xs font-extrabold text-[#0B1F3A] dark:text-white bg-transparent outline-none flex-1"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveSheet((s) => ({
                            ...s,
                            charts: (s.charts || []).filter((c) => c.id !== chart.id),
                          }))
                        }
                        className="text-zinc-400 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {pts.length === 0 ? (
                      <p className="text-[11px] text-zinc-500">Add numeric data to rows 2–9 to populate chart.</p>
                    ) : chart.kind === "pie" ? (
                      <div className="space-y-1.5">
                        {pts.map((p, idx) => {
                          const total = pts.reduce((a, b) => a + b.value, 0) || 1
                          const pct = Math.round((p.value / total) * 100)
                          return (
                            <div key={idx} className="flex items-center gap-2 text-[11px]">
                              <span className="w-28 truncate font-medium">{p.label}</span>
                              <div className="flex-1 h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                <div style={{ width: `${pct}%` }} className="h-full bg-[#107C41]" />
                              </div>
                              <span className="font-mono font-bold w-10 text-right">{pct}%</span>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex items-end gap-2 h-32 pt-2">
                        {pts.map((p, idx) => {
                          const pct = Math.max(8, Math.round((p.value / maxV) * 100))
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end min-w-0">
                              <span className="text-[9.5px] font-mono text-zinc-500 truncate">
                                {p.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                              </span>
                              <div
                                style={{ height: `${pct}%` }}
                                className={`w-full max-w-[36px] rounded-t-md ${
                                  chart.kind === "line" ? "bg-[#0067B8]" : "bg-[#107C41]"
                                }`}
                              />
                              <span className="text-[9.5px] text-zinc-600 dark:text-zinc-400 truncate w-full text-center">
                                {p.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Bottom Sheet Tabs & Range Calculator Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-t border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {activeWorkbook?.sheets.map((sheet) => {
              const isTabActive = sheet.id === activeSheet.id
              return (
                <div
                  key={sheet.id}
                  onClick={() => {
                    updateActiveWorkbook((wb) => ({ ...wb, activeSheetId: sheet.id }))
                    setSelectedCell({ col: 0, row: 0 })
                    setSelectionEnd(null)
                    setEditingCellKey(null)
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-bold cursor-pointer shrink-0 ${
                    isTabActive
                      ? "border-[#107C41] bg-white dark:bg-zinc-900 text-[#107C41] dark:text-emerald-300 shadow-2xs"
                      : "border-[#E7E2DA] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-white/80"
                  }`}
                >
                  <span>{sheet.name}</span>
                  {activeWorkbook.sheets.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        updateActiveWorkbook((wb) => {
                          const rem = wb.sheets.filter((s) => s.id !== sheet.id)
                          return {
                            ...wb,
                            sheets: rem,
                            activeSheetId: wb.activeSheetId === sheet.id ? rem[0].id : wb.activeSheetId,
                          }
                        })
                      }}
                      title="Delete sheet"
                      className="text-zinc-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )
            })}
            <button
              type="button"
              onClick={handleAddSheetTab}
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#E7E2DA] dark:border-zinc-700 px-2.5 py-1 text-[11px] font-bold text-[#0B1F3A] dark:text-zinc-200 hover:border-[#107C41] cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Sheet
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <Calculator className="h-3 w-3 text-[#107C41]" />
              {rangeStats.label}: {rangeStats.count} numeric
            </span>
            {rangeStats.count > 0 && (
              <>
                <span>Sum: <strong className="text-[#0B1F3A] dark:text-white">{rangeStats.sum.toLocaleString("en-US", { maximumFractionDigits: 2 })}</strong></span>
                <span>Avg: <strong className="text-[#0B1F3A] dark:text-white">{rangeStats.avg.toLocaleString("en-US", { maximumFractionDigits: 2 })}</strong></span>
                <span>Min/Max: <strong>{rangeStats.min.toLocaleString("en-US", { maximumFractionDigits: 1 })}</strong>/<strong>{rangeStats.max.toLocaleString("en-US", { maximumFractionDigits: 1 })}</strong></span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#0B1F3A] dark:text-white">
                  Choose a ConnectLn Sheets Template
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Launch a pre-wired formula workbook or start with a blank grid.
                </p>
              </div>
              <button type="button" onClick={() => setShowTemplatesModal(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
              {SHEET_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleCreateFromTemplate(tpl)}
                  className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/60 dark:bg-zinc-950/60 hover:border-[#107C41] p-4 text-left transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold text-[#0B1F3A] dark:text-white">{tpl.name}</span>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 text-[10px] font-bold text-[#107C41] dark:text-emerald-300">{tpl.category}</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{tpl.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Print Preview & Setup Modal */}
      {activeWorkbook && (
        <ConnectLnStudioPrintModal
          mode="sheets"
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          title={activeWorkbook.title}
          activeSheet={activeSheet}
          allSheets={activeWorkbook.sheets}
          chartsSvgHtml={chartsSvgHtml}
          onDownloadOpenXml={() => handleExport("xlsx")}
        />
      )}

      {/* ConnectLn Sheets Studio Hub Drawer */}
      {showHubDrawer && (
        <ConnectLnStudioHubDrawer
          app="sheets"
          user={user}
          activeTitle={activeWorkbook?.title || "Untitled Workbook"}
          activeStatsSummary={`${activeWorkbook?.sheets.length || 1} sheet(s) · Active: ${activeSheet.name}`}
          items={workbooks.map((w) => ({
            id: w.id,
            title: w.title,
            category: w.category,
            updatedAt: w.updatedAt,
            starred: w.starred,
          }))}
          templates={SHEET_TEMPLATES.map((t) => ({
            id: t.id,
            name: t.name,
            category: t.category,
            description: t.description,
          }))}
          onClose={() => setShowHubDrawer(false)}
          onSelectItem={(id) => {
            setActiveWorkbookId(id)
            setSelectedCell({ col: 0, row: 0 })
            setSelectionEnd(null)
            setEditingCellKey(null)
          }}
          onToggleStar={(id) =>
            setWorkbooks((prev) =>
              prev.map((w) => (w.id === id ? { ...w, starred: !w.starred } : w))
            )
          }
          onCreateBlank={() => {
            const blank = SHEET_TEMPLATES[0]
            if (blank) handleCreateFromTemplate(blank)
          }}
          onCreateFromTemplate={(tid) => {
            if (tid.startsWith("tour_sheets_")) {
              const now = new Date().toISOString()
              const titleMap: Record<string, string> = {
                tour_sheets_welcome: "ConnectLn Sheets Welcome Tour",
                tour_sheets_formula: "ConnectLn Formula Lab",
                tour_sheets_pivot: "Regional Pivot Summary",
              }
              const demoCells: Record<string, SheetCell> = {
                A1: { raw: "Category", style: { bold: true, bg: "#0B1F3A", color: "#FFFFFF" } },
                B1: { raw: "Region", style: { bold: true, bg: "#0B1F3A", color: "#FFFFFF" } },
                C1: { raw: "Units", style: { bold: true, align: "right", bg: "#0B1F3A", color: "#FFFFFF" } },
                D1: { raw: "Unit Price", style: { bold: true, align: "right", bg: "#0B1F3A", color: "#FFFFFF" } },
                E1: { raw: "Total", style: { bold: true, align: "right", bg: "#0B1F3A", color: "#FFFFFF" } },
                A2: { raw: "Solar Kits" },
                B2: { raw: "East" },
                C2: { raw: "14", style: { format: "integer", align: "right" } },
                D2: { raw: "450", style: { format: "currency", align: "right" } },
                E2: { raw: "=C2*D2", style: { format: "currency", align: "right" } },
                A3: { raw: "Smart Panels" },
                B3: { raw: "North" },
                C3: { raw: "9", style: { format: "integer", align: "right" } },
                D3: { raw: "620", style: { format: "currency", align: "right" } },
                E3: { raw: "=C3*D3", style: { format: "currency", align: "right" } },
                A5: { raw: "Grand Total", style: { bold: true, bg: "#E6F4EA" } },
                E5: { raw: "=SUM(E2:E3)", style: { bold: true, format: "currency", align: "right", bg: "#E6F4EA" } },
              }
              const tourWb: StudioWorkbookRecord = {
                id: `wb_${Date.now()}`,
                title: titleMap[tid] || "ConnectLn Guided Workbook",
                category: "Guided Tour",
                sheets: [{ id: `sheet_${Date.now()}`, name: "Tour Grid", rowCount: 18, colCount: 8, cells: demoCells }],
                activeSheetId: "",
                createdAt: now,
                updatedAt: now,
                authorName: user.name || "ConnectLn Member",
              }
              tourWb.activeSheetId = tourWb.sheets[0].id
              setWorkbooks((prev) => [tourWb, ...prev])
              setActiveWorkbookId(tourWb.id)
              setSelectedCell({ col: 0, row: 0 })
              notify(`Opened "${tourWb.title}"`)
              return
            }
            const tpl = SHEET_TEMPLATES.find((t) => t.id === tid)
            if (tpl) handleCreateFromTemplate(tpl)
          }}
          onTriggerImport={() => csvInputRef.current?.click()}
          onTriggerPrint={() => setShowPrintModal(true)}
          onTriggerExportPrimary={() => handleExport("xlsx")}
        />
      )}
    </div>
  )
}
