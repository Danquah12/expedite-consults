"use client"

import React, { useMemo, useState } from "react"
import { Download, ExternalLink, Printer, SlidersHorizontal, X } from "lucide-react"
import {
  colIndexToLabel,
  evaluateSheet,
  formatEvaluatedValue,
  makeCellKey,
} from "@/lib/connectln-sheets-engine"
import {
  buildPrintableBoardReportHtml,
  buildPrintableDocumentHtml,
  buildPrintableFormHtml,
  buildPrintableInvoiceHtml,
  buildPrintableSheetHtml,
  buildPrintableSignedContractHtml,
  buildPrintableSlidesHtml,
  printHtmlViaHiddenIframe,
  type PrintableBoardInput,
  type PrintableFormInput,
  type PrintableInvoiceInput,
  type PrintableSheetTabInput,
  type PrintableSignEnvelopeInput,
  type SlideExportItem,
  type SlidesPrintColorMode,
  type SlidesPrintLayout,
  type SlideThemePalette,
} from "@/lib/connectln-studio-export"
import type {
  DocMarginsPreset,
  DocOrientation,
  DocPageSetup,
  DocPaperSize,
  StudioSheetTab,
} from "@/lib/connectln-studio-storage"

type CommonPrintProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  onDownloadOpenXml: () => void
}

export type ConnectLnStudioPrintModalProps =
  | (CommonPrintProps & {
      mode: "docs"
      bodyHtml: string
      pageSetup: DocPageSetup
      onUpdatePageSetup: (patch: Partial<DocPageSetup>) => void
    })
  | (CommonPrintProps & {
      mode: "sheets"
      activeSheet: StudioSheetTab
      allSheets: StudioSheetTab[]
      chartsSvgHtml?: string
    })
  | (CommonPrintProps & {
      mode: "slides"
      slides: SlideExportItem[]
      currentSlideIndex: number
      theme: SlideThemePalette
    })
  | (CommonPrintProps & {
      mode: "sign"
      envelope: PrintableSignEnvelopeInput
    })
  | (CommonPrintProps & {
      mode: "invoice"
      invoice: PrintableInvoiceInput
    })
  | (CommonPrintProps & {
      mode: "boards"
      board: PrintableBoardInput
    })
  | (CommonPrintProps & {
      mode: "forms"
      form: PrintableFormInput
    })

function sheetTabToPrintable(tab: StudioSheetTab): PrintableSheetTabInput {
  const evalMap = evaluateSheet(tab.cells)
  let maxRow = Math.min(tab.rowCount - 1, 9)
  let maxCol = Math.min(tab.colCount - 1, 5)
  for (const key of Object.keys(tab.cells)) {
    const match = /^([A-Z]+)(\d+)$/i.exec(key)
    if (!match) continue
    const rowIdx = Number.parseInt(match[2], 10) - 1
    let colIdx = 0
    for (let i = 0; i < match[1].length; i++) {
      colIdx = colIdx * 26 + (match[1].toUpperCase().charCodeAt(i) - 64)
    }
    colIdx -= 1
    maxRow = Math.max(maxRow, rowIdx)
    maxCol = Math.max(maxCol, colIdx)
  }

  const headers: string[] = []
  for (let c = 0; c <= maxCol; c++) {
    headers.push(colIndexToLabel(c))
  }

  const rows: PrintableSheetTabInput["rows"] = []
  for (let r = 0; r <= maxRow; r++) {
    const rowCells = []
    for (let c = 0; c <= maxCol; c++) {
      const k = makeCellKey(c, r)
      const cell = tab.cells[k]
      const ev = evalMap[k]
      const display = cell
        ? formatEvaluatedValue(ev, cell.style?.format || "general", cell.style?.decimals)
        : ""
      rowCells.push({
        display,
        align: cell?.style?.align || (typeof ev?.numeric === "number" ? "right" : "left"),
        bold: cell?.style?.bold,
        bg: cell?.style?.bg,
        color: cell?.style?.color,
      })
    }
    rows.push({ rowNumber: r + 1, cells: rowCells })
  }

  return { name: tab.name, headers, rows }
}

export function ConnectLnStudioPrintModal(props: ConnectLnStudioPrintModalProps) {
  // Docs local print toggles
  const [docsGrayscale, setDocsGrayscale] = useState(false)
  const [docsIncludeHF, setDocsIncludeHF] = useState(true)
  const [docsIncludeWatermark, setDocsIncludeWatermark] = useState(true)
  const [docsIncludeBg, setDocsIncludeBg] = useState(true)

  // Sheets local print settings
  const [sheetScope, setSheetScope] = useState<"active" | "workbook">("active")
  const [sheetOrientation, setSheetOrientation] = useState<DocOrientation>("landscape")
  const [sheetPaper, setSheetPaper] = useState<DocPaperSize>("letter")
  const [sheetMargin, setSheetMargin] = useState<"normal" | "narrow" | "wide">("narrow")
  const [sheetFitCols, setSheetFitCols] = useState(true)
  const [sheetGridlines, setSheetGridlines] = useState(true)
  const [sheetRowColHeaders, setSheetRowColHeaders] = useState(true)
  const [sheetRepeatHeader, setSheetRepeatHeader] = useState(true)
  const [sheetGrayscale, setSheetGrayscale] = useState(false)

  // Slides local print settings
  const [slidesLayout, setSlidesLayout] = useState<SlidesPrintLayout>("full")
  const [slidesRange, setSlidesRange] = useState<"all" | "current">("all")
  const [slidesColorMode, setSlidesColorMode] = useState<SlidesPrintColorMode>("color")
  const [slidesFrame, setSlidesFrame] = useState(true)
  const [slidesNumbers, setSlidesNumbers] = useState(true)

  // Sign local print settings
  const [signIncludeCert, setSignIncludeCert] = useState(true)
  const [signGrayscale, setSignGrayscale] = useState(false)

  // Invoice local print settings
  const [invoiceShowPayments, setInvoiceShowPayments] = useState(true)
  const [invoiceGrayscale, setInvoiceGrayscale] = useState(false)

  // Boards & Forms local print settings
  const [boardIncludeChecklists, setBoardIncludeChecklists] = useState(true)
  const [boardGrayscale, setBoardGrayscale] = useState(false)
  const [formPrintView, setFormPrintView] = useState<"blank" | "summary">("summary")
  const [formGrayscale, setFormGrayscale] = useState(false)

  const [printToast, setPrintToast] = useState<string | null>(null)

  const appLabel =
    props.mode === "docs"
      ? "Docs"
      : props.mode === "sheets"
      ? "Sheets"
      : props.mode === "sign"
      ? "Sign"
      : props.mode === "invoice"
      ? "Invoice"
      : props.mode === "boards"
      ? "Boards"
      : props.mode === "forms"
      ? "Forms"
      : "Slides"
  const exportExt =
    props.mode === "docs" || props.mode === "sign"
      ? ".docx"
      : props.mode === "sheets" || props.mode === "invoice" || props.mode === "boards" || props.mode === "forms"
      ? ".xlsx"
      : ".pptx"

  const printableHtml = useMemo(() => {
    if (props.mode === "boards") {
      return buildPrintableBoardReportHtml(props.board, {
        includeChecklists: boardIncludeChecklists,
        grayscale: boardGrayscale,
      })
    }
    if (props.mode === "forms") {
      return buildPrintableFormHtml(props.form, {
        viewMode: formPrintView,
        grayscale: formGrayscale,
      })
    }
    if (props.mode === "invoice") {
      return buildPrintableInvoiceHtml(props.invoice, {
        showPaymentHistory: invoiceShowPayments,
        grayscale: invoiceGrayscale,
      })
    }
    if (props.mode === "sign") {
      return buildPrintableSignedContractHtml(props.envelope, {
        includeAuditCertificate: signIncludeCert,
        grayscale: signGrayscale,
      })
    }
    if (props.mode === "docs") {
      return buildPrintableDocumentHtml({
        title: props.title,
        bodyHtml: props.bodyHtml,
        pageSetup: props.pageSetup,
        grayscale: docsGrayscale,
        includeHeaderFooter: docsIncludeHF,
        includeWatermark: docsIncludeWatermark,
        includeBackground: docsIncludeBg,
      })
    }
    if (props.mode === "sheets") {
      const sourceTabs = sheetScope === "workbook" ? props.allSheets : [props.activeSheet]
      const tabs = sourceTabs.map((t, idx) => {
        const mapped = sheetTabToPrintable(t)
        if (idx === 0 && props.chartsSvgHtml) {
          mapped.chartsSvgHtml = props.chartsSvgHtml
        }
        return mapped
      })
      return buildPrintableSheetHtml({
        workbookTitle: props.title,
        tabs,
        paperSize: sheetPaper,
        orientation: sheetOrientation,
        margins: sheetMargin,
        showGridlines: sheetGridlines,
        showRowColHeaders: sheetRowColHeaders,
        fitAllColumns: sheetFitCols,
        repeatHeaderRow: sheetRepeatHeader,
        grayscale: sheetGrayscale,
      })
    }
    const chosenSlides =
      slidesRange === "current"
        ? [props.slides[props.currentSlideIndex] || props.slides[0]].filter(Boolean)
        : props.slides.filter((s) => !s.hidden)
    return buildPrintableSlidesHtml({
      deckTitle: props.title,
      slides: chosenSlides.length > 0 ? chosenSlides : props.slides,
      theme: props.theme,
      layout: slidesLayout,
      colorMode: slidesColorMode,
      frameSlides: slidesFrame,
      showSlideNumbers: slidesNumbers,
    })
  }, [
    props,
    docsGrayscale,
    docsIncludeHF,
    docsIncludeWatermark,
    docsIncludeBg,
    sheetScope,
    sheetPaper,
    sheetOrientation,
    sheetMargin,
    sheetGridlines,
    sheetRowColHeaders,
    sheetFitCols,
    sheetRepeatHeader,
    sheetGrayscale,
    slidesLayout,
    slidesRange,
    slidesColorMode,
    slidesFrame,
    slidesNumbers,
    signIncludeCert,
    signGrayscale,
    invoiceShowPayments,
    invoiceGrayscale,
    boardIncludeChecklists,
    boardGrayscale,
    formPrintView,
    formGrayscale,
  ])

  if (!props.isOpen) return null

  const handlePrintNow = () => {
    const ok = printHtmlViaHiddenIframe(printableHtml)
    setPrintToast(
      ok
        ? "Print dialog launched — choose your printer or Save as PDF."
        : "Use Open Print Window if your browser blocked printing."
    )
    setTimeout(() => setPrintToast(null), 4000)
  }

  const handleOpenWindowPrint = () => {
    const win = window.open("", "_blank", "width=1024,height=780")
    if (!win) {
      setPrintToast("Pop-up blocked — click Print Now / Save as PDF instead.")
      return
    }
    win.document.open()
    win.document.write(printableHtml)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 250)
  }

  return (
    <div
      role="dialog"
      aria-label={`ConnectLn ${appLabel} Print Preview`}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-xs"
    >
      <div className="flex flex-col lg:flex-row w-full max-w-6xl h-[90vh] rounded-2xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xl">
        {/* Left Print Settings Panel */}
        <aside className="w-full lg:w-[320px] shrink-0 border-b lg:border-b-0 lg:border-r border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 p-4 flex flex-col justify-between overflow-y-auto max-h-[42vh] lg:max-h-none">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#0067B8]" />
                <h2 className="text-sm font-extrabold text-[#0B1F3A] dark:text-white">
                  ConnectLn {appLabel} Print Studio
                </h2>
              </div>
              <button
                type="button"
                onClick={props.onClose}
                aria-label="Close Print Preview"
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handlePrintNow}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0067B8] hover:bg-[#00559b] text-white py-2.5 px-4 text-xs font-extrabold shadow-xs cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                Print Now / Save as PDF
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleOpenWindowPrint}
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 py-1.5 px-2 text-[11px] font-bold hover:border-[#0067B8] cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Print Window
                </button>
                <button
                  type="button"
                  onClick={props.onDownloadOpenXml}
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 py-1.5 px-2 text-[11px] font-bold hover:border-[#0067B8] cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export {exportExt}
                </button>
              </div>
              {printToast && (
                <p className="rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 px-2.5 py-1.5 text-[11px] font-semibold text-[#0B5CAD] dark:text-sky-300">
                  {printToast}
                </p>
              )}
            </div>

            {props.mode === "docs" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    Paper Size
                  </label>
                  <select
                    value={props.pageSetup.paperSize}
                    onChange={(e) =>
                      props.onUpdatePageSetup({ paperSize: e.target.value as DocPaperSize })
                    }
                    className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 font-semibold"
                  >
                    <option value="letter">US Letter (8.5&quot; × 11&quot;)</option>
                    <option value="a4">A4 (210 × 297 mm)</option>
                    <option value="legal">Legal (8.5&quot; × 14&quot;)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                      Orientation
                    </label>
                    <select
                      value={props.pageSetup.orientation}
                      onChange={(e) =>
                        props.onUpdatePageSetup({
                          orientation: e.target.value as DocOrientation,
                        })
                      }
                      className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 font-semibold"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                      Margins
                    </label>
                    <select
                      value={props.pageSetup.margins}
                      onChange={(e) =>
                        props.onUpdatePageSetup({ margins: e.target.value as DocMarginsPreset })
                      }
                      className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 font-semibold"
                    >
                      <option value="normal">Normal (1&quot;)</option>
                      <option value="narrow">Narrow (0.5&quot;)</option>
                      <option value="moderate">Moderate (0.75&quot;)</option>
                      <option value="wide">Wide (1.5&quot;)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    Running Header
                  </label>
                  <input
                    type="text"
                    value={props.pageSetup.headerText}
                    onChange={(e) => props.onUpdatePageSetup({ headerText: e.target.value })}
                    placeholder="Defaults to document title"
                    className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    Running Footer
                  </label>
                  <input
                    type="text"
                    value={props.pageSetup.footerText}
                    onChange={(e) => props.onUpdatePageSetup({ footerText: e.target.value })}
                    placeholder="Defaults to ConnectLn Docs"
                    className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5"
                  />
                </div>
                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docsIncludeHF}
                      onChange={(e) => setDocsIncludeHF(e.target.checked)}
                    />
                    <span>Include Header &amp; Footer</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docsIncludeWatermark}
                      onChange={(e) => setDocsIncludeWatermark(e.target.checked)}
                    />
                    <span>Include Watermark</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docsIncludeBg}
                      onChange={(e) => setDocsIncludeBg(e.target.checked)}
                    />
                    <span>Include Page Background &amp; Borders</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docsGrayscale}
                      onChange={(e) => setDocsGrayscale(e.target.checked)}
                    />
                    <span>Black &amp; White Ink Mode</span>
                  </label>
                </div>
              </div>
            )}

            {props.mode === "sheets" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    Print Scope
                  </label>
                  <select
                    value={sheetScope}
                    onChange={(e) => setSheetScope(e.target.value as "active" | "workbook")}
                    className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 font-semibold"
                  >
                    <option value="active">Active Sheet Only ({props.activeSheet.name})</option>
                    <option value="workbook">
                      Entire Workbook ({props.allSheets.length} Sheets)
                    </option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                      Orientation
                    </label>
                    <select
                      value={sheetOrientation}
                      onChange={(e) => setSheetOrientation(e.target.value as DocOrientation)}
                      className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 font-semibold"
                    >
                      <option value="landscape">Landscape</option>
                      <option value="portrait">Portrait</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                      Paper Size
                    </label>
                    <select
                      value={sheetPaper}
                      onChange={(e) => setSheetPaper(e.target.value as DocPaperSize)}
                      className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 font-semibold"
                    >
                      <option value="letter">Letter</option>
                      <option value="a4">A4</option>
                      <option value="legal">Legal</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    Margins
                  </label>
                  <select
                    value={sheetMargin}
                    onChange={(e) =>
                      setSheetMargin(e.target.value as "normal" | "narrow" | "wide")
                    }
                    className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 font-semibold"
                  >
                    <option value="narrow">Narrow (Fit More Data)</option>
                    <option value="normal">Normal</option>
                    <option value="wide">Wide</option>
                  </select>
                </div>
                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sheetFitCols}
                      onChange={(e) => setSheetFitCols(e.target.checked)}
                    />
                    <span>Fit All Columns on One Page</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sheetGridlines}
                      onChange={(e) => setSheetGridlines(e.target.checked)}
                    />
                    <span>Print Cell Gridlines</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sheetRowColHeaders}
                      onChange={(e) => setSheetRowColHeaders(e.target.checked)}
                    />
                    <span>Print Row &amp; Column Headings (A, B, 1, 2)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sheetRepeatHeader}
                      onChange={(e) => setSheetRepeatHeader(e.target.checked)}
                    />
                    <span>Repeat Top Header Row</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sheetGrayscale}
                      onChange={(e) => setSheetGrayscale(e.target.checked)}
                    />
                    <span>Black &amp; White Ink Mode</span>
                  </label>
                </div>
              </div>
            )}

            {props.mode === "slides" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    Print Layout
                  </label>
                  <select
                    aria-label="Slides Print Layout"
                    value={slidesLayout}
                    onChange={(e) => setSlidesLayout(e.target.value as SlidesPrintLayout)}
                    className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 font-semibold"
                  >
                    <option value="full">Full-Page Slides (1 Slide / Page)</option>
                    <option value="handouts_2">Handouts (2 Slides / Page)</option>
                    <option value="handouts_4">Handouts (4 Slides / Page)</option>
                    <option value="notes">Notes Pages (Slide + Speaker Notes)</option>
                    <option value="outline">Text Outline View</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    Slide Range
                  </label>
                  <select
                    value={slidesRange}
                    onChange={(e) => setSlidesRange(e.target.value as "all" | "current")}
                    className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 font-semibold"
                  >
                    <option value="all">
                      All Visible Slides ({props.slides.filter((s) => !s.hidden).length})
                    </option>
                    <option value="current">
                      Current Slide Only (Slide {props.currentSlideIndex + 1})
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    Color Mode
                  </label>
                  <select
                    value={slidesColorMode}
                    onChange={(e) => setSlidesColorMode(e.target.value as SlidesPrintColorMode)}
                    className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 font-semibold"
                  >
                    <option value="color">Full Color Theme</option>
                    <option value="grayscale">Grayscale</option>
                    <option value="pure_bw">Pure Black &amp; White (Ink Saver)</option>
                  </select>
                </div>
                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slidesFrame}
                      onChange={(e) => setSlidesFrame(e.target.checked)}
                    />
                    <span>Frame Slides</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slidesNumbers}
                      onChange={(e) => setSlidesNumbers(e.target.checked)}
                    />
                    <span>Show Slide Numbers</span>
                  </label>
                </div>
              </div>
            )}

            {props.mode === "sign" && (
              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-1">
                  <p className="text-[11px] font-extrabold text-[#4338CA] uppercase">
                    Envelope Summary
                  </p>
                  <p className="font-mono text-[11px]">{props.envelope.envelopeCode}</p>
                  <p className="text-[11px] text-zinc-500">
                    Signers:{" "}
                    {props.envelope.signers.filter((s) => s.status === "signed").length} /{" "}
                    {props.envelope.signers.length} executed
                  </p>
                </div>
                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={signIncludeCert}
                      onChange={(e) => setSignIncludeCert(e.target.checked)}
                    />
                    <span>Include Certificate of Completion &amp; Audit Trail</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={signGrayscale}
                      onChange={(e) => setSignGrayscale(e.target.checked)}
                    />
                    <span>Black &amp; White Ink Mode</span>
                  </label>
                </div>
              </div>
            )}

            {props.mode === "invoice" && (
              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-1">
                  <p className="text-[11px] font-extrabold text-[#0F766E] uppercase">
                    Invoice Summary
                  </p>
                  <p className="font-mono text-[11px]">{props.invoice.invoiceNumber}</p>
                  <p className="text-[11px] text-zinc-500">
                    Total: {props.invoice.currencySymbol}
                    {props.invoice.grandTotal.toFixed(2)} · Balance: {props.invoice.currencySymbol}
                    {props.invoice.balanceDue.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={invoiceShowPayments}
                      onChange={(e) => setInvoiceShowPayments(e.target.checked)}
                    />
                    <span>Include Payment Receipt History</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={invoiceGrayscale}
                      onChange={(e) => setInvoiceGrayscale(e.target.checked)}
                    />
                    <span>Black &amp; White Ink Mode</span>
                  </label>
                </div>
              </div>
            )}

            {props.mode === "boards" && (
              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-1">
                  <p className="text-[11px] font-extrabold text-[#B45309] uppercase">
                    Board Status Summary
                  </p>
                  <p className="font-mono text-[11px]">{props.board.boardCode}</p>
                  <p className="text-[11px] text-zinc-500">
                    Completion: {props.board.metrics.completionPct}% ({props.board.metrics.doneTasks}/
                    {props.board.metrics.totalTasks} tasks)
                  </p>
                </div>
                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={boardIncludeChecklists}
                      onChange={(e) => setBoardIncludeChecklists(e.target.checked)}
                    />
                    <span>Include Task Checklists</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={boardGrayscale}
                      onChange={(e) => setBoardGrayscale(e.target.checked)}
                    />
                    <span>Black &amp; White Ink Mode</span>
                  </label>
                </div>
              </div>
            )}

            {props.mode === "forms" && (
              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-1">
                  <p className="text-[11px] font-extrabold text-[#9333EA] uppercase">
                    Form Summary
                  </p>
                  <p className="font-mono text-[11px]">{props.form.formCode}</p>
                  <p className="text-[11px] text-zinc-500">
                    Responses: {props.form.analytics.totalResponses}
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    Print View Mode
                  </label>
                  <select
                    aria-label="Forms Print View Mode"
                    value={formPrintView}
                    onChange={(e) => setFormPrintView(e.target.value as "blank" | "summary")}
                    className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 font-semibold"
                  >
                    <option value="summary">Analytics &amp; Responses Summary</option>
                    <option value="blank">Printable Blank Worksheet</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formGrayscale}
                    onChange={(e) => setFormGrayscale(e.target.checked)}
                  />
                  <span>Black &amp; White Ink Mode</span>
                </label>
              </div>
            )}
          </div>

          <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 pt-3 border-t border-[#E7E2DA] dark:border-zinc-800">
            Shortcut: Press <kbd className="rounded bg-zinc-200 dark:bg-zinc-800 px-1">Ctrl</kbd> +{" "}
            <kbd className="rounded bg-zinc-200 dark:bg-zinc-800 px-1">P</kbd> anywhere inside
            ConnectLn {appLabel} to preview &amp; print cleanly.
          </p>
        </aside>

        {/* Right Live Print Preview Pane */}
        <div className="flex-1 bg-zinc-200 dark:bg-zinc-950 p-3 sm:p-5 flex flex-col">
          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-2">
            <span className="font-bold">Live Print Preview — {props.title}</span>
            <span className="text-[11px]">Ready for Printer or PDF</span>
          </div>
          <iframe
            title={`ConnectLn ${appLabel} Print Preview Frame`}
            srcDoc={printableHtml}
            className="flex-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white shadow-inner"
          />
        </div>
      </div>
    </div>
  )
}
