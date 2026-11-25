"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownAZ,
  ArrowUpZA,
  Bold,
  Copy,
  DollarSign,
  Download,
  Eraser,
  FilePlus2,
  Italic,
  LayoutTemplate,
  PanelLeftClose,
  PanelLeftOpen,
  Percent,
  Plus,
  Search,
  Share2,
  Sigma,
  Star,
  Table2,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import type { UserProfile } from "@/lib/connectln-data"
import {
  colIndexToLabel,
  evaluateSheet,
  formatEvaluatedValue,
  gridToCsv,
  makeCellKey,
  parseCsvToGrid,
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
  type SheetTemplateItem,
  type StudioSheetTab,
  type StudioWorkbookRecord,
} from "@/lib/connectln-studio-storage"
import type { StudioSharePayload } from "./ConnectLnDocsEditor"

interface ConnectLnSheetsEditorProps {
  user: UserProfile
  onShareToFeed?: (payload: StudioSharePayload) => void
}

const FILL_SWATCHES = [
  { label: "Clear", bg: undefined, color: undefined },
  { label: "Mist Blue", bg: "#DBEAFE", color: "#0B1F3A" },
  { label: "Emerald Mist", bg: "#DCFCE7", color: "#064E3B" },
  { label: "Warm Amber", bg: "#FEF3C7", color: "#78350F" },
  { label: "Soft Rose", bg: "#FFE4E6", color: "#881337" },
  { label: "Navy Header", bg: "#0B1F3A", color: "#FFFFFF" },
]

function safeSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "connectln-workbook"
  )
}

export function ConnectLnSheetsEditor({ user, onShareToFeed }: ConnectLnSheetsEditorProps) {
  const [workbooks, setWorkbooks] = useState<StudioWorkbookRecord[]>(() =>
    loadStudioWorkbooks(user)
  )
  const [activeWorkbookId, setActiveWorkbookId] = useState<string>(() => workbooks[0]?.id || "")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [wbSearch, setWbSearch] = useState("")
  const [selectedCell, setSelectedCell] = useState<{ col: number; row: number }>({
    col: 0,
    row: 0,
  })
  const [editingCellKey, setEditingCellKey] = useState<string | null>(null)
  const [draftCellValue, setDraftCellValue] = useState("")
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
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

  const evaluatedMap = useMemo(
    () => evaluateSheet(activeSheet.cells),
    [activeSheet.cells]
  )

  const selectedKey = makeCellKey(selectedCell.col, selectedCell.row)
  const selectedCellData = activeSheet.cells[selectedKey]
  const selectedEval = evaluatedMap[selectedKey]

  useEffect(() => {
    saveStudioWorkbooks(user, workbooks)
  }, [workbooks, user])

  useEffect(() => {
    if (editingCellKey) {
      setTimeout(() => inlineInputRef.current?.focus(), 0)
    }
  }, [editingCellKey])

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

  const updateActiveSheet = (updater: (sheet: StudioSheetTab) => StudioSheetTab) => {
    updateActiveWorkbook((wb) => ({
      ...wb,
      sheets: wb.sheets.map((s) => (s.id === activeSheet.id ? updater(s) : s)),
    }))
  }

  const setCellRaw = (key: string, raw: string) => {
    updateActiveSheet((sheet) => {
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

  const applyCellStyle = (stylePatch: Partial<SheetCellStyle>) => {
    updateActiveSheet((sheet) => {
      const current = sheet.cells[selectedKey] || { raw: "" }
      const mergedStyle: SheetCellStyle = { ...(current.style || {}), ...stylePatch }
      return {
        ...sheet,
        cells: {
          ...sheet.cells,
          [selectedKey]: { raw: current.raw, style: mergedStyle },
        },
      }
    })
  }

  const beginEdit = (col: number, row: number, initialOverride?: string) => {
    const key = makeCellKey(col, row)
    setSelectedCell({ col, row })
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
    // Scan contiguous cells directly above selected cell
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

    updateActiveSheet((sheet) => {
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

  const handleExport = (kind: "xlsx" | "csv" | "json") => {
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
        return {
          name: tab.name,
          rowCount: tab.rowCount,
          colCount: tab.colCount,
          cells: mappedCells,
        }
      })
      const bytes = buildXlsxBytes(activeWorkbook.title, exportTabs)
      downloadStudioFile(
        bytes,
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
            ? formatEvaluatedValue(evaluatedMap[k], cell.style?.format || "general")
            : ""
          if (formatted) hasContent = true
          line.push(formatted)
        }
        if (hasContent || rows.length > 0) rows.push(line)
      }
      // Trim trailing blank rows
      while (rows.length > 0 && rows[rows.length - 1].every((v) => v === "")) {
        rows.pop()
      }
      downloadStudioFile(gridToCsv(rows), `${slug}.csv`, "text/csv;charset=utf-8")
      notify(`Exported ${slug}.csv`)
      return
    }

    downloadStudioFile(
      JSON.stringify(activeWorkbook, null, 2),
      `${slug}.json`,
      "application/json;charset=utf-8"
    )
    notify(`Exported ${slug}.json`)
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

  const columnSummary = useMemo(() => {
    let numericCount = 0
    let sum = 0
    for (let r = 0; r < activeSheet.rowCount; r++) {
      const k = makeCellKey(selectedCell.col, r)
      const ev = evaluatedMap[k]
      if (ev && typeof ev.numeric === "number") {
        numericCount++
        sum += ev.numeric
      }
    }
    return {
      colLabel: colIndexToLabel(selectedCell.col),
      numericCount,
      sum,
      avg: numericCount > 0 ? sum / numericCount : 0,
    }
  }, [activeSheet.rowCount, selectedCell.col, evaluatedMap])

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

  return (
    <div className="flex flex-col lg:flex-row rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm min-h-[760px]">
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
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleImportCsv}
                className="hidden"
              />
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
                        <Star
                          className={`h-3.5 w-3.5 ${
                            wb.starred ? "fill-amber-400 text-amber-500" : "text-zinc-400"
                          }`}
                        />
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

      {/* Main Spreadsheet Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-[#E7E2DA] dark:border-zinc-800">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen((s) => !s)}
              className="rounded-lg p-1.5 border border-[#E7E2DA] dark:border-zinc-700 hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer shrink-0"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </button>
            <input
              type="text"
              aria-label="Workbook title"
              value={activeWorkbook?.title || ""}
              onChange={(e) => updateActiveWorkbook((wb) => ({ ...wb, title: e.target.value }))}
              className="min-w-[160px] flex-1 max-w-md rounded-lg border border-transparent hover:border-[#E7E2DA] focus:border-[#107C41] bg-transparent px-2 py-1 text-sm sm:text-base font-extrabold text-[#0B1F3A] dark:text-white outline-none"
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
                  <button
                    type="button"
                    onClick={() => handleExport("xlsx")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <span>Standard Workbook (.xlsx)</span>
                    <span className="text-[10px] font-mono text-[#107C41]">OpenXML</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("csv")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <span>Active Sheet (.csv)</span>
                    <span className="text-[10px] font-mono text-zinc-400">UTF-8</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("json")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <span>Workbook Data (.json)</span>
                    <span className="text-[10px] font-mono text-zinc-400">JSON</span>
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

        {/* Spreadsheet Formatting & Formula Ribbon */}
        <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950/70">
          <button
            type="button"
            onClick={() => applyCellStyle({ bold: !selectedCellData?.style?.bold })}
            title="Bold Cell"
            className={`p-1.5 rounded-lg cursor-pointer ${
              selectedCellData?.style?.bold ? "bg-[#0B1F3A] text-white" : "hover:bg-white dark:hover:bg-zinc-800"
            }`}
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyCellStyle({ italic: !selectedCellData?.style?.italic })}
            title="Italic Cell"
            className={`p-1.5 rounded-lg cursor-pointer ${
              selectedCellData?.style?.italic ? "bg-[#0B1F3A] text-white" : "hover:bg-white dark:hover:bg-zinc-800"
            }`}
          >
            <Italic className="h-3.5 w-3.5" />
          </button>

          <span className="h-5 w-px bg-[#E7E2DA] dark:bg-zinc-700 mx-1" />

          <button
            type="button"
            onClick={() => applyCellStyle({ format: "currency", align: "right" })}
            title="Format as Currency ($)"
            className={`p-1.5 rounded-lg cursor-pointer ${
              activeFormat === "currency" ? "bg-[#107C41] text-white" : "hover:bg-white dark:hover:bg-zinc-800"
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyCellStyle({ format: "percent", align: "right" })}
            title="Format as Percent (%)"
            className={`p-1.5 rounded-lg cursor-pointer ${
              activeFormat === "percent" ? "bg-[#107C41] text-white" : "hover:bg-white dark:hover:bg-zinc-800"
            }`}
          >
            <Percent className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyCellStyle({ format: "number", align: "right" })}
            title="Format Number (0.00)"
            className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
              activeFormat === "number" ? "bg-[#107C41] text-white" : "hover:bg-white dark:hover:bg-zinc-800"
            }`}
          >
            0.00
          </button>
          <button
            type="button"
            onClick={() => applyCellStyle({ format: "general" })}
            title="General Format"
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
              activeFormat === "general" ? "bg-zinc-200 dark:bg-zinc-700" : "hover:bg-white dark:hover:bg-zinc-800"
            }`}
          >
            Gen
          </button>

          <span className="h-5 w-px bg-[#E7E2DA] dark:bg-zinc-700 mx-1" />

          {(
            [
              { align: "left", Icon: AlignLeft },
              { align: "center", Icon: AlignCenter },
              { align: "right", Icon: AlignRight },
            ] as Array<{ align: CellAlign; Icon: React.ComponentType<{ className?: string }> }>
          ).map(({ align, Icon }) => (
            <button
              key={align}
              type="button"
              onClick={() => applyCellStyle({ align })}
              title={`Align ${align}`}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}

          <span className="h-5 w-px bg-[#E7E2DA] dark:bg-zinc-700 mx-1" />

          {/* Quick Functions */}
          <button
            type="button"
            onClick={() => handleInsertQuickFormula("SUM")}
            className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-1 text-[11px] font-bold hover:border-[#107C41] cursor-pointer"
          >
            <Sigma className="h-3 w-3 text-[#107C41]" />
            SUM
          </button>
          {(["AVERAGE", "MIN", "MAX", "IF"] as const).map((fn) => (
            <button
              key={fn}
              type="button"
              onClick={() => handleInsertQuickFormula(fn)}
              className="rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-1 text-[11px] font-bold hover:border-[#107C41] cursor-pointer"
            >
              {fn}
            </button>
          ))}

          <span className="h-5 w-px bg-[#E7E2DA] dark:bg-zinc-700 mx-1" />

          <button
            type="button"
            onClick={() => handleSortActiveColumn(true)}
            title="Sort Column A-Z"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
          >
            <ArrowDownAZ className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleSortActiveColumn(false)}
            title="Sort Column Z-A"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
          >
            <ArrowUpZA className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => updateActiveSheet((s) => ({ ...s, rowCount: s.rowCount + 5 }))}
            className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-[11px] font-semibold cursor-pointer hover:border-[#107C41]"
          >
            +5 Rows
          </button>
          <button
            type="button"
            onClick={() => updateActiveSheet((s) => ({ ...s, colCount: s.colCount + 2 }))}
            className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-[11px] font-semibold cursor-pointer hover:border-[#107C41]"
          >
            +2 Cols
          </button>
          <button
            type="button"
            onClick={() => setCellRaw(selectedKey, "")}
            title="Clear Selected Cell"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 text-rose-600 cursor-pointer"
          >
            <Eraser className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center gap-1 ml-1">
            {FILL_SWATCHES.map((sw) => (
              <button
                key={sw.label}
                type="button"
                title={`Fill: ${sw.label}`}
                onClick={() => applyCellStyle({ bg: sw.bg, color: sw.color })}
                style={{ backgroundColor: sw.bg || "#FFFFFF" }}
                className="h-4 w-4 rounded-full border border-zinc-300 dark:border-zinc-600 cursor-pointer"
              />
            ))}
          </div>
        </div>

        {/* Formula Bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <span className="inline-flex min-w-[46px] justify-center rounded-lg bg-[#FAF7F2] dark:bg-zinc-800 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-1 text-xs font-mono font-bold text-[#0B1F3A] dark:text-zinc-100">
            {selectedKey}
          </span>
          <span className="text-xs font-serif italic font-bold text-[#107C41]">fx</span>
          <input
            type="text"
            aria-label="Formula bar input"
            value={selectedCellData?.raw || ""}
            onChange={(e) => setCellRaw(selectedKey, e.target.value)}
            placeholder='Enter text, number, or formula (e.g. =SUM(E2:E6) or =IF(C2>10,"High","Low"))'
            className="flex-1 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-[#FAF7F2]/50 dark:bg-zinc-950 px-3 py-1 text-xs font-mono text-[#0B1F3A] dark:text-zinc-100 outline-none focus:border-[#107C41]"
          />
          {selectedEval && selectedCellData?.raw?.startsWith("=") && (
            <span className="hidden md:inline-flex items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
              = {formatEvaluatedValue(selectedEval, activeFormat)}
            </span>
          )}
        </div>

        {/* Interactive Grid */}
        <div
          className="flex-1 overflow-auto bg-[#F8FAFC] dark:bg-zinc-950 select-none"
          tabIndex={0}
          onKeyDown={(e) => {
            if (editingCellKey) return
            if (document.activeElement?.tagName === "INPUT") return
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setSelectedCell((p) => ({ col: p.col, row: Math.min(activeSheet.rowCount - 1, p.row + 1) }))
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              setSelectedCell((p) => ({ col: p.col, row: Math.max(0, p.row - 1) }))
            } else if (e.key === "ArrowRight" || e.key === "Tab") {
              e.preventDefault()
              setSelectedCell((p) => ({ col: Math.min(activeSheet.colCount - 1, p.col + 1), row: p.row }))
            } else if (e.key === "ArrowLeft") {
              e.preventDefault()
              setSelectedCell((p) => ({ col: Math.max(0, p.col - 1), row: p.row }))
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
                  const isActiveCol = selectedCell.col === cIdx
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
                const isActiveRow = selectedCell.row === rIdx
                return (
                  <tr key={rIdx}>
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
                      const isSel = selectedCell.col === cIdx && selectedCell.row === rIdx
                      const isEditing = editingCellKey === key
                      const style = cell?.style
                      const displayVal = formatEvaluatedValue(ev, style?.format || "general")
                      const defaultAlign =
                        style?.align || (typeof ev?.numeric === "number" ? "right" : "left")

                      return (
                        <td
                          key={key}
                          data-cell-key={key}
                          onClick={() => {
                            if (editingCellKey && editingCellKey !== key) {
                              commitInlineEdit()
                            }
                            setSelectedCell({ col: cIdx, row: rIdx })
                          }}
                          onDoubleClick={() => beginEdit(cIdx, rIdx)}
                          style={{
                            backgroundColor: style?.bg,
                            color: ev?.error ? "#DC2626" : style?.color,
                            textAlign: defaultAlign,
                          }}
                          className={`relative h-8 border px-2 truncate cursor-cell ${
                            isSel
                              ? "border-2 border-[#107C41] ring-1 ring-[#107C41]/30 z-10 bg-white dark:bg-zinc-900"
                              : "border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-950"
                          } ${style?.bold ? "font-bold" : "font-normal"} ${
                            style?.italic ? "italic" : ""
                          }`}
                        >
                          {isEditing ? (
                            <input
                              ref={inlineInputRef}
                              type="text"
                              value={draftCellValue}
                              onChange={(e) => setDraftCellValue(e.target.value)}
                              onBlur={() => commitInlineEdit()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  commitInlineEdit("down")
                                } else if (e.key === "Tab") {
                                  e.preventDefault()
                                  commitInlineEdit("right")
                                } else if (e.key === "Escape") {
                                  e.preventDefault()
                                  setEditingCellKey(null)
                                }
                              }}
                              className="w-full h-full bg-white dark:bg-zinc-900 text-[#0B1F3A] dark:text-white outline-none font-mono text-xs"
                            />
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
        </div>

        {/* Sheet Tabs & Column Stats Footer */}
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
                            activeSheetId:
                              wb.activeSheetId === sheet.id ? rem[0].id : wb.activeSheetId,
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

          <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
            <span>
              Col {columnSummary.colLabel}: {columnSummary.numericCount} numeric
            </span>
            {columnSummary.numericCount > 0 && (
              <>
                <span>
                  Sum:{" "}
                  <strong className="text-[#0B1F3A] dark:text-zinc-100">
                    {columnSummary.sum.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </strong>
                </span>
                <span>
                  Avg:{" "}
                  <strong className="text-[#0B1F3A] dark:text-zinc-100">
                    {columnSummary.avg.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </strong>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Templates Picker Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
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
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
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
                    <span className="text-sm font-extrabold text-[#0B1F3A] dark:text-white">
                      {tpl.name}
                    </span>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 text-[10px] font-bold text-[#107C41] dark:text-emerald-300">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{tpl.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
