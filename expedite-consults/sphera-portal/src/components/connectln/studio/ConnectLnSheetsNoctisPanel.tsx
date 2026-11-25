"use client"

import React, { useEffect, useState } from "react"
import {
  AlertTriangle,
  BarChart3,
  Check,
  Copy,
  FunctionSquare,
  Loader2,
  Sparkles,
  Wand2,
  X,
} from "lucide-react"
import type { UserProfile } from "@/lib/connectln-data"
import {
  colIndexToLabel,
  formatEvaluatedValue,
  makeCellKey,
  type EvaluatedValue as EvaluatedCell,
} from "@/lib/connectln-sheets-engine"
import { scanSheetErrors } from "@/lib/connectln-sheets-pro-tools"
import type { StudioSheetTab } from "@/lib/connectln-studio-storage"

interface ConnectLnSheetsNoctisPanelProps {
  workbookTitle: string
  sheet: StudioSheetTab
  evaluatedMap: Record<string, EvaluatedCell>
  selectedKey: string
  user: UserProfile
  initialPrompt?: string
  onClose: () => void
  onInsertFormula: (formula: string) => void
  onNotify: (msg: string) => void
}

function summarizeSheetContext(
  sheet: StudioSheetTab,
  evaluatedMap: Record<string, EvaluatedCell>
): { headers: string[]; sampleRows: string[]; numericTotals: Array<{ header: string; colLetter: string; sum: number }> } {
  const headers: string[] = []
  const maxCols = Math.min(sheet.colCount, 8)
  for (let c = 0; c < maxCols; c++) {
    const h = String(evaluatedMap[makeCellKey(c, 0)]?.value ?? "").trim()
    if (h) headers.push(`${colIndexToLabel(c)}: ${h}`)
  }

  const sampleRows: string[] = []
  for (let r = 1; r < Math.min(sheet.rowCount, 9); r++) {
    const parts: string[] = []
    for (let c = 0; c < maxCols; c++) {
      const k = makeCellKey(c, r)
      const cell = sheet.cells[k]
      if (cell?.raw) {
        parts.push(formatEvaluatedValue(evaluatedMap[k], cell.style?.format || "general"))
      }
    }
    if (parts.length > 0) sampleRows.push(parts.join(" | "))
  }

  const numericTotals: Array<{ header: string; colLetter: string; sum: number }> = []
  for (let c = 0; c < maxCols; c++) {
    let sum = 0
    let count = 0
    for (let r = 1; r < sheet.rowCount; r++) {
      const labelA = String(evaluatedMap[makeCellKey(0, r)]?.value || "").toLowerCase()
      if (/\b(total|subtotal|grand)\b/.test(labelA)) continue
      const n = evaluatedMap[makeCellKey(c, r)]?.numeric
      if (typeof n === "number" && Number.isFinite(n)) {
        sum += n
        count++
      }
    }
    if (count > 0) {
      numericTotals.push({
        header: String(evaluatedMap[makeCellKey(c, 0)]?.value || `Col ${colIndexToLabel(c)}`),
        colLetter: colIndexToLabel(c),
        sum: Math.round(sum * 100) / 100,
      })
    }
  }

  return { headers, sampleRows, numericTotals }
}

function buildLocalSheetsFallback(
  mode: "explain" | "suggest" | "kpi" | "audit" | "custom",
  workbookTitle: string,
  sheet: StudioSheetTab,
  evaluatedMap: Record<string, EvaluatedCell>,
  selectedKey: string,
  customPrompt: string
): { answer: string; formula?: string } {
  const cell = sheet.cells[selectedKey]
  const ev = evaluatedMap[selectedKey]
  const { headers, numericTotals } = summarizeSheetContext(sheet, evaluatedMap)
  const errors = scanSheetErrors(sheet, evaluatedMap)
  const primaryNumCol = numericTotals[numericTotals.length - 1]
  const defaultFormula = primaryNumCol
    ? `=SUM(${primaryNumCol.colLetter}2:${primaryNumCol.colLetter}8)`
    : `=SUM(E2:E6)`

  if (mode === "explain") {
    if (!cell?.raw) {
      return {
        answer: `Cell ${selectedKey} in "${sheet.name}" is currently empty.\n\nTip: Click Suggest Formula to insert a dynamic total or conditional formula into ${selectedKey}.`,
        formula: defaultFormula,
      }
    }
    const isFormula = cell.raw.startsWith("=")
    return {
      answer: isFormula
        ? `Cell ${selectedKey} evaluates formula:\n${cell.raw}\n\nEvaluated Result: ${String(ev?.value ?? "")}\n\nHeaders in scope: ${headers.slice(0, 4).join(", ") || "Row 1 headers"}.`
        : `Cell ${selectedKey} holds static ${typeof ev?.numeric === "number" ? "numeric" : "text"} input "${cell.raw}" in sheet "${sheet.name}".`,
      formula: isFormula ? cell.raw : undefined,
    }
  }

  if (mode === "suggest") {
    const colSummary = primaryNumCol
      ? `${primaryNumCol.header} (${primaryNumCol.colLetter}2:${primaryNumCol.colLetter}8)`
      : "Column E"
    return {
      answer: `Recommended formula for ${selectedKey} based on ${colSummary}:\n\n• Total Rollup: ${defaultFormula}\n• Conditional Sum Example: =SUMIF(B2:B6,"Labor",E2:E6)`,
      formula: defaultFormula,
    }
  }

  if (mode === "audit") {
    return {
      answer:
        errors.length === 0
          ? `Formula Audit on "${sheet.name}" passed with 0 errors across all active cells.`
          : `Detected ${errors.length} formula issue(s):\n` +
            errors.map((e) => `• ${e.key}: ${e.error} (${e.raw})`).join("\n"),
    }
  }

  const totalLine =
    numericTotals.length > 0
      ? numericTotals
          .map((t) => `• ${t.header} (Col ${t.colLetter}): ${t.sum.toLocaleString("en-US")}`)
          .join("\n")
      : "• No numeric columns tallied yet."

  return {
    answer:
      `Executive KPI Brief — ${workbookTitle} (${sheet.name})\n\n` +
      (customPrompt ? `Focus: "${customPrompt}"\n\n` : "") +
      `Column Totals:\n${totalLine}\n\nNext Step: Use Pivot Summary or What-If Forecast to model growth scenarios.`,
    formula: defaultFormula,
  }
}

export function ConnectLnSheetsNoctisPanel({
  workbookTitle,
  sheet,
  evaluatedMap,
  selectedKey,
  user,
  initialPrompt = "",
  onClose,
  onInsertFormula,
  onNotify,
}: ConnectLnSheetsNoctisPanelProps) {
  const [promptText, setPromptText] = useState(initialPrompt)
  const [loading, setLoading] = useState(false)
  const [answerText, setAnswerText] = useState("")
  const [suggestedFormula, setSuggestedFormula] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (initialPrompt) setPromptText(initialPrompt)
  }, [initialPrompt])

  const runSheetsNoctis = async (mode: "explain" | "suggest" | "kpi" | "audit" | "custom") => {
    const ctx = summarizeSheetContext(sheet, evaluatedMap)
    const selectedRaw = sheet.cells[selectedKey]?.raw || "(empty)"
    const selectedVal = String(evaluatedMap[selectedKey]?.value ?? "(empty)")
    const sheetContext = `Workbook: "${workbookTitle}", Sheet: "${sheet.name}". Headers: ${ctx.headers.join(
      ", "
    )}. Selected cell ${selectedKey} = ${selectedRaw} (value: ${selectedVal}). Sample rows: ${ctx.sampleRows
      .slice(0, 4)
      .join(" ; ")}`

    const questionMap: Record<typeof mode, string> = {
      explain: `Explain what cell ${selectedKey} does and how this sheet uses it cleanly: ${sheetContext}`,
      suggest: `Suggest the single best spreadsheet formula (=SUM, =SUMIF, =AVERAGE, or =IF) for cell ${selectedKey} and include the formula starting with = cleanly: ${sheetContext}`,
      kpi: `Provide a crisp 4-bullet executive KPI brief with totals and actionable insights from this sheet: ${sheetContext}`,
      audit: `Audit this sheet data & formula structure for potential calculation mistakes, missing totals, or outliers: ${sheetContext}`,
      custom: `${promptText.trim() || "Summarize trends and key totals."} Context: ${sheetContext}`,
    }

    setLoading(true)
    setCopied(false)
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 14000)

    try {
      const res = await fetch("/api/connectin/noctis", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question: questionMap[mode],
          language: "English",
          profile: {
            name: user.name || "ConnectLn Member",
            profession: user.profession || "Analyst",
          },
        }),
        signal: ctrl.signal,
      })
      if (res.ok) {
        const data = (await res.json()) as { text?: string }
        if (data?.text && data.text.trim()) {
          const text = data.text.trim()
          const matchFormula = text.match(/=(?:SUMIF|COUNTIF|AVERAGEIF|SUM|AVERAGE|MIN|MAX|IF|VLOOKUP|ROUND)\([^)\n]+\)/i)
          setAnswerText(text)
          if (matchFormula) {
            setSuggestedFormula(matchFormula[0].toUpperCase())
          } else {
            const fallback = buildLocalSheetsFallback(mode, workbookTitle, sheet, evaluatedMap, selectedKey, promptText)
            setSuggestedFormula(fallback.formula || "")
          }
          clearTimeout(timer)
          setLoading(false)
          return
        }
      }
      throw new Error("Local Noctis fallback")
    } catch {
      const local = buildLocalSheetsFallback(
        mode,
        workbookTitle,
        sheet,
        evaluatedMap,
        selectedKey,
        promptText
      )
      setAnswerText(local.answer)
      setSuggestedFormula(local.formula || "")
    } finally {
      clearTimeout(timer)
      setLoading(false)
    }
  }

  return (
    <aside
      aria-label="Noctis Data Studio"
      className="w-full sm:w-[310px] shrink-0 border-l border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 p-3.5 flex flex-col gap-3 overflow-y-auto"
    >
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E7E2DA] dark:border-zinc-800">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B1F3A] to-[#107C41] text-white shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-[#0B1F3A] dark:text-white leading-tight truncate">
              Noctis Data Studio
            </p>
            <p className="text-[10px] font-semibold text-[#107C41] dark:text-emerald-400">
              Active Cell: {selectedKey}
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close Noctis Data Studio"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          disabled={loading}
          onClick={() => runSheetsNoctis("explain")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#107C41] px-2.5 py-1.5 text-[11px] font-bold text-[#0B1F3A] dark:text-zinc-100 cursor-pointer"
        >
          <FunctionSquare className="h-3.5 w-3.5 text-[#107C41]" />
          Explain Cell
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => runSheetsNoctis("suggest")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#107C41] px-2.5 py-1.5 text-[11px] font-bold text-[#0B1F3A] dark:text-zinc-100 cursor-pointer"
        >
          <Wand2 className="h-3.5 w-3.5 text-[#107C41]" />
          Suggest Formula
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => runSheetsNoctis("kpi")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#107C41] px-2.5 py-1.5 text-[11px] font-bold text-[#0B1F3A] dark:text-zinc-100 cursor-pointer"
        >
          <BarChart3 className="h-3.5 w-3.5 text-[#107C41]" />
          Executive KPI Brief
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => runSheetsNoctis("audit")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#107C41] px-2.5 py-1.5 text-[11px] font-bold text-[#0B1F3A] dark:text-zinc-100 cursor-pointer"
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          Audit Sheet
        </button>
      </div>

      <div className="space-y-1.5">
        <textarea
          rows={2}
          aria-label="Prompt Noctis Data Studio"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Ask Noctis for a formula, variance insight, or column summary..."
          className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 text-xs outline-none focus:border-[#107C41]"
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => runSheetsNoctis("custom")}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0B1F3A] to-[#107C41] hover:opacity-95 text-white py-2 text-xs font-extrabold shadow-xs cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Noctis is analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Ask Noctis
            </>
          )}
        </button>
      </div>

      {answerText && (
        <div className="rounded-xl border border-[#107C41]/30 bg-white dark:bg-zinc-900 p-2.5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#107C41]">
            <span>Noctis Analysis</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(answerText)
                  setCopied(true)
                  onNotify("Copied Noctis insight")
                } catch {}
              }}
              className="inline-flex items-center gap-1 text-zinc-500 hover:text-[#107C41] cursor-pointer"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="max-h-44 overflow-y-auto whitespace-pre-wrap text-[11.5px] leading-relaxed text-[#0B1F3A] dark:text-zinc-200 border-t border-zinc-100 dark:border-zinc-800 pt-1.5">
            {answerText}
          </div>
          {suggestedFormula && (
            <button
              type="button"
              onClick={() => {
                onInsertFormula(suggestedFormula)
                onNotify(`Applied ${suggestedFormula} to ${selectedKey}`)
              }}
              className="w-full rounded-lg bg-[#107C41] hover:bg-[#0c6032] text-white py-1.5 px-2 text-[11px] font-bold cursor-pointer truncate"
            >
              Apply to {selectedKey}: {suggestedFormula}
            </button>
          )}
        </div>
      )}
    </aside>
  )
}
