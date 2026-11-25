"use client"

import React, { useEffect, useState } from "react"
import {
  Check,
  Copy,
  FilePlus2,
  Globe2,
  ListChecks,
  Loader2,
  Sparkles,
  Wand2,
  X,
} from "lucide-react"
import type { UserProfile } from "@/lib/connectln-data"

interface ConnectLnDocsNoctisPanelProps {
  docTitle: string
  docHtml: string
  selectedText: string
  user: UserProfile
  initialPrompt?: string
  initialMode?: "draft" | "polish" | "summary" | "checklist" | "translate" | "expand"
  onClose: () => void
  onInsertHtml: (html: string) => void
  onInsertAtTop: (html: string) => void
  onNotify: (msg: string) => void
}

function stripPlain(html: string): string {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function formatTextToHtmlBlocks(raw: string): string {
  const lines = raw.replace(/\r\n/g, "\n").split("\n")
  const out: string[] = []
  let inList = false
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (inList) {
        out.push("</ul>")
        inList = false
      }
      continue
    }
    if (trimmed.startsWith("### ")) {
      if (inList) { out.push("</ul>"); inList = false }
      out.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`)
    } else if (trimmed.startsWith("## ")) {
      if (inList) { out.push("</ul>"); inList = false }
      out.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`)
    } else if (trimmed.startsWith("# ")) {
      if (inList) { out.push("</ul>"); inList = false }
      out.push(`<h1>${escapeHtml(trimmed.slice(2))}</h1>`)
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList) {
        out.push("<ul>")
        inList = true
      }
      out.push(`<li>${escapeHtml(trimmed.slice(2))}</li>`)
    } else {
      if (inList) { out.push("</ul>"); inList = false }
      out.push(`<p>${escapeHtml(trimmed)}</p>`)
    }
  }
  if (inList) out.push("</ul>")
  return out.join("\n") || `<p>${escapeHtml(raw)}</p>`
}

function buildLocalNoctisFallback(
  mode: string,
  title: string,
  excerpt: string,
  targetLang: string,
  customPrompt: string
): string {
  const safeTitle = title || "ConnectLn Document"
  const preview = excerpt.slice(0, 260) || "Project scope, timeline milestones, and client deliverables."

  if (mode === "summary") {
    return [
      `## Executive Summary — ${safeTitle}`,
      `- Core Purpose: Outlines key objectives, scope boundaries, and verified deliverables.`,
      `- Context Snapshot: ${preview}`,
      `- Recommended Next Step: Confirm milestone owners and route final agreement through ConnectLn Sign.`,
    ].join("\n")
  }
  if (mode === "checklist") {
    return [
      `### Action Checklist — ${safeTitle}`,
      `- [ ] Confirm stakeholder sign-off and budget ceiling`,
      `- [ ] Assign primary owner and target completion date`,
      `- [ ] Verify quality & compliance requirements before delivery`,
      `- [ ] Export clean PDF or route via ConnectLn Sign`,
    ].join("\n")
  }
  if (mode === "polish") {
    const base = excerpt || safeTitle
    return `Polished Draft:\n\n${base.replace(/\s+/g, " ").trim()}. Prepared with clear milestones, measurable accountability, and transparent review checkpoints.`
  }
  if (mode === "translate") {
    return `[Noctis ${targetLang} Translation Preview — ${safeTitle}]\n\n${excerpt.slice(0, 320) || safeTitle}`
  }
  return [
    `## Draft Section: ${customPrompt ? customPrompt.slice(0, 60) : safeTitle}`,
    `Prepared in ConnectLn Docs to establish clear scope, timeline expectations, and measurable outcomes.`,
    `- Deliverable 1: Initial discovery, site/system review, and baseline verification`,
    `- Deliverable 2: Core execution milestone with transparent progress tracking`,
    `- Deliverable 3: Final QA review, handover documentation, and ConnectLn Sign approval`,
  ].join("\n")
}

export function ConnectLnDocsNoctisPanel({
  docTitle,
  docHtml,
  selectedText,
  user,
  initialPrompt = "",
  initialMode,
  onClose,
  onInsertHtml,
  onInsertAtTop,
  onNotify,
}: ConnectLnDocsNoctisPanelProps) {
  const [promptText, setPromptText] = useState(initialPrompt)
  const [translateLang, setTranslateLang] = useState<"Twi" | "French" | "Spanish" | "German">("Spanish")
  const [loading, setLoading] = useState(false)
  const [resultText, setResultText] = useState("")
  const [copied, setCopied] = useState(false)
  const [resultSource, setResultSource] = useState<"noctis" | "local" | "">("")

  useEffect(() => {
    if (initialPrompt) {
      setPromptText(initialPrompt)
    }
  }, [initialPrompt])

  const runNoctisAction = async (
    mode: "draft" | "polish" | "summary" | "checklist" | "translate" | "expand" | "custom"
  ) => {
    const plainDoc = stripPlain(docHtml)
    const contextText = (selectedText || plainDoc).slice(0, 1200)
    const instructionMap: Record<typeof mode, string> = {
      draft: `Write a crisp, professional next section for a document titled "${docTitle}". Based on context: ${contextText.slice(0, 500)}`,
      polish: `Rewrite and polish the following text to be clearer, tighter, and executive-ready without losing meaning: ${contextText.slice(0, 700)}`,
      summary: `Write a concise 3-bullet executive summary for this document ("${docTitle}"):\n${contextText.slice(0, 800)}`,
      checklist: `Turn the key points from "${docTitle}" into an actionable bullet checklist with owners and verification steps:\n${contextText.slice(0, 700)}`,
      translate: `Translate the following document excerpt cleanly into ${translateLang}, preserving professional tone:\n${contextText.slice(0, 700)}`,
      expand: `Expand on the current draft for "${docTitle}" with practical details, risks to mitigate, and measurable success metrics:\n${contextText.slice(0, 600)}`,
      custom: `${promptText.trim()} (Document title: "${docTitle}". Excerpt: ${contextText.slice(0, 450)})`,
    }

    const question =
      mode === "custom" && !promptText.trim()
        ? instructionMap.draft
        : instructionMap[mode]

    setLoading(true)
    setCopied(false)

    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 14000)

    try {
      const res = await fetch("/api/connectin/noctis", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question,
          language: mode === "translate" ? translateLang : "English",
          profile: {
            name: user.name || "ConnectLn Member",
            profession: user.profession || "Professional",
          },
        }),
        signal: ctrl.signal,
      })

      if (res.ok) {
        const data = (await res.json()) as { text?: string }
        if (data?.text && data.text.trim()) {
          setResultText(data.text.trim())
          setResultSource("noctis")
          setLoading(false)
          clearTimeout(timer)
          return
        }
      }
      throw new Error("Fallback to ConnectLn Studio Writer")
    } catch {
      const localText = buildLocalNoctisFallback(
        mode,
        docTitle,
        contextText,
        translateLang,
        promptText
      )
      setResultText(localText)
      setResultSource("local")
    } finally {
      clearTimeout(timer)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialMode === "translate") {
      setPromptText("Translate key sections smoothly while preserving formatting.")
    }
  }, [initialMode])

  return (
    <aside
      aria-label="Noctis Writing Studio"
      className="w-full sm:w-[320px] shrink-0 border-l border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 p-3.5 flex flex-col gap-3 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E7E2DA] dark:border-zinc-800">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B1F3A] to-[#0B5CAD] text-white shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-[#0B1F3A] dark:text-white leading-tight truncate">
              Noctis Writing Studio
            </p>
            <p className="text-[10px] font-semibold text-[#0B5CAD] dark:text-sky-400">
              ConnectLn 360 Intelligence
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close Noctis Writing Studio"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Selected context indicator */}
      <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-2 text-[11px] text-zinc-600 dark:text-zinc-400">
        <span className="font-bold text-[#0B1F3A] dark:text-zinc-200">
          {selectedText ? "Target: Selected text" : "Target: Full document"}
        </span>
        <p className="truncate mt-0.5 text-[10.5px]">
          {selectedText || stripPlain(docHtml).slice(0, 90) || docTitle}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">
          Instant Writing Actions
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            disabled={loading}
            onClick={() => runNoctisAction("draft")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#0B5CAD] px-2.5 py-1.5 text-[11px] font-bold text-[#0B1F3A] dark:text-zinc-100 cursor-pointer"
          >
            <Wand2 className="h-3 w-3 text-[#0B5CAD]" />
            Draft Section
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => runNoctisAction("polish")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#0B5CAD] px-2.5 py-1.5 text-[11px] font-bold text-[#0B1F3A] dark:text-zinc-100 cursor-pointer"
          >
            <Sparkles className="h-3 w-3 text-[#0B5CAD]" />
            Polish Tone
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => runNoctisAction("summary")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#0B5CAD] px-2.5 py-1.5 text-[11px] font-bold text-[#0B1F3A] dark:text-zinc-100 cursor-pointer"
          >
            <FilePlus2 className="h-3 w-3 text-[#0B5CAD]" />
            Exec Summary
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => runNoctisAction("checklist")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#0B5CAD] px-2.5 py-1.5 text-[11px] font-bold text-[#0B1F3A] dark:text-zinc-100 cursor-pointer"
          >
            <ListChecks className="h-3 w-3 text-[#0B5CAD]" />
            Action List
          </button>
        </div>
      </div>

      {/* Translate Row */}
      <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-[#0B1F3A] dark:text-zinc-200 flex items-center gap-1">
            <Globe2 className="h-3.5 w-3.5 text-[#0B5CAD]" />
            Translate Excerpt
          </span>
          <select
            aria-label="Noctis translation language"
            value={translateLang}
            onChange={(e) => setTranslateLang(e.target.value as any)}
            className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-[#FAF7F2] dark:bg-zinc-950 px-2 py-0.5 text-[11px] font-semibold cursor-pointer"
          >
            <option value="Twi">Twi</option>
            <option value="French">French</option>
            <option value="Spanish">Spanish</option>
            <option value="German">German</option>
          </select>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => runNoctisAction("translate")}
          className="w-full rounded-lg bg-[#0B5CAD]/10 hover:bg-[#0B5CAD]/20 text-[#0B5CAD] dark:text-sky-300 py-1 text-[11px] font-extrabold cursor-pointer"
        >
          Translate to {translateLang}
        </button>
      </div>

      {/* Custom Prompt */}
      <div className="space-y-1.5">
        <textarea
          rows={2}
          aria-label="Prompt Noctis Writing Studio"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Ask Noctis to draft clauses, tighten wording, or structure sections..."
          className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 text-xs outline-none focus:border-[#0B5CAD]"
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => runNoctisAction("custom")}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0B1F3A] to-[#0B5CAD] hover:opacity-95 text-white py-2 text-xs font-extrabold shadow-xs cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Noctis is writing...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Ask Noctis
            </>
          )}
        </button>
      </div>

      {/* Output Preview & Insert Actions */}
      {resultText && (
        <div className="rounded-xl border border-[#0B5CAD]/30 bg-white dark:bg-zinc-900 p-2.5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#0B5CAD]">
            <span>
              {resultSource === "noctis" ? "Noctis Live Draft" : "Noctis Studio Draft"}
            </span>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(resultText)
                  setCopied(true)
                  onNotify("Copied Noctis output")
                } catch {}
              }}
              className="inline-flex items-center gap-1 text-zinc-500 hover:text-[#0B5CAD] cursor-pointer"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="max-h-44 overflow-y-auto whitespace-pre-wrap text-[11.5px] leading-relaxed text-[#0B1F3A] dark:text-zinc-200 border-t border-zinc-100 dark:border-zinc-800 pt-1.5">
            {resultText}
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => {
                onInsertHtml(formatTextToHtmlBlocks(resultText))
                onNotify("Inserted Noctis draft at cursor")
              }}
              className="rounded-lg bg-[#0B5CAD] hover:bg-[#094a8d] text-white py-1.5 text-[11px] font-bold cursor-pointer"
            >
              Insert at Cursor
            </button>
            <button
              type="button"
              onClick={() => {
                onInsertAtTop(formatTextToHtmlBlocks(resultText))
                onNotify("Added Noctis summary at top")
              }}
              className="rounded-lg border border-[#0B5CAD] text-[#0B5CAD] hover:bg-sky-50 dark:hover:bg-sky-950/30 py-1.5 text-[11px] font-bold cursor-pointer"
            >
              Insert at Top
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
