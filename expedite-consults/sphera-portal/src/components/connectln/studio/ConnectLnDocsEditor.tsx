"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  AArrowDown,
  AArrowUp,
  BarChart2,
  Bold,
  BookOpen,
  Calendar,
  CaseSensitive,
  CheckCircle2,
  CheckSquare,
  Clipboard,
  Code2,
  Columns,
  Copy,
  Download,
  Eraser,
  Eye,
  FilePlus2,
  FileText,
  Highlighter,
  History,
  ImagePlus,
  Indent,
  Italic,
  LayoutTemplate,
  Link2,
  List,
  ListOrdered,
  ListTree,
  Maximize2,
  MessageSquarePlus,
  Mic,
  MicOff,
  Minus,
  Outdent,
  Paintbrush,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  PenTool,
  Printer,
  Quote,
  Redo2,
  RotateCcw,
  Ruler,
  Scissors,
  Search,
  SeparatorHorizontal,
  Share2,
  Sigma,
  SpellCheck,
  Star,
  Strikethrough,
  Subscript,
  Superscript,
  Table2,
  Trash2,
  Underline,
  Undo2,
  Upload,
  Volume2,
  VolumeX,
  X,
} from "lucide-react"
import type { UserProfile } from "@/lib/connectln-data"
import {
  buildCoverPageHtml,
  buildSignatureBlockHtml,
  buildTableHtml,
  buildTocHtml,
  computeDetailedDocStats,
  DOC_FONT_FAMILIES,
  DOC_FONT_SIZES,
  DOC_SYMBOLS,
  extractOutlineHeadings,
  formatDateStamp,
  getMarginPx,
  getPaperDimensionsPx,
  transformTextCase,
  type TextCaseMode,
} from "@/lib/connectln-docs-helpers"
import {
  buildDocxBytes,
  buildStandaloneHtmlDocument,
  downloadStudioFile,
  extractDocBlocksFromHtml,
  extractTextHtmlFromDocxBytes,
  htmlToMarkdown,
  sanitizeSafeHtml,
} from "@/lib/connectln-studio-export"
import {
  DEFAULT_DOC_PAGE_SETUP,
  DOC_TEMPLATES,
  loadStudioDocs,
  saveStudioDocs,
  type DocMarginsPreset,
  type DocOrientation,
  type DocPageBorder,
  type DocPageSetup,
  type DocPaperSize,
  type DocTemplateItem,
  type StudioDocRecord,
} from "@/lib/connectln-studio-storage"
import { ConnectLnStudioPrintModal } from "./ConnectLnStudioPrintModal"

export interface StudioSharePayload {
  title: string
  summary: string
  appLabel: "ConnectLn Docs" | "ConnectLn Sheets" | "ConnectLn Slides"
  slides?: Array<{
    slideNumber: number
    title: string
    content: string
    visualTag?: string
  }>
}

interface ConnectLnDocsEditorProps {
  user: UserProfile
  onShareToFeed?: (payload: StudioSharePayload) => void
}

type DocsRibbonTab = "home" | "insert" | "layout" | "review" | "view"

function stripHtmlForStats(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
}

function safeSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "connectln-document"
  )
}

function markdownToSimpleHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n")
  const out: string[] = []
  let inList = false
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      if (inList) {
        out.push("</ul>")
        inList = false
      }
      continue
    }
    const esc = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    if (line.startsWith("### ")) {
      if (inList) { out.push("</ul>"); inList = false }
      out.push(`<h3>${esc.slice(4)}</h3>`)
    } else if (line.startsWith("## ")) {
      if (inList) { out.push("</ul>"); inList = false }
      out.push(`<h2>${esc.slice(3)}</h2>`)
    } else if (line.startsWith("# ")) {
      if (inList) { out.push("</ul>"); inList = false }
      out.push(`<h1>${esc.slice(2)}</h1>`)
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        out.push("<ul>")
        inList = true
      }
      out.push(`<li>${esc.slice(2)}</li>`)
    } else if (line.startsWith("> ")) {
      if (inList) { out.push("</ul>"); inList = false }
      out.push(`<blockquote>${esc.slice(2)}</blockquote>`)
    } else if (line === "---") {
      if (inList) { out.push("</ul>"); inList = false }
      out.push("<hr />")
    } else {
      if (inList) { out.push("</ul>"); inList = false }
      out.push(`<p>${esc}</p>`)
    }
  }
  if (inList) out.push("</ul>")
  return out.join("\n") || "<p>Imported document</p>"
}

export function ConnectLnDocsEditor({ user, onShareToFeed }: ConnectLnDocsEditorProps) {
  const [docs, setDocs] = useState<StudioDocRecord[]>(() => loadStudioDocs(user))
  const [activeDocId, setActiveDocId] = useState<string>(() => docs[0]?.id || "")
  const [editorRevision, setEditorRevision] = useState(1)
  const [ribbonTab, setRibbonTab] = useState<DocsRibbonTab>("home")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [docSearch, setDocSearch] = useState("")
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [showFindBar, setShowFindBar] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [findTerm, setFindTerm] = useState("")
  const [replaceTerm, setReplaceTerm] = useState("")
  const [fontFamily, setFontFamily] = useState<string>(DOC_FONT_FAMILIES[0].value)
  const [fontSizePt, setFontSizePt] = useState<number>(12)
  const [zoomPct, setZoomPct] = useState<75 | 90 | 100 | 115 | 130>(100)
  const [statusNotice, setStatusNotice] = useState<string | null>(null)
  const [savedLabel, setSavedLabel] = useState("Saved locally")

  // Popovers & Tools
  const [showTablePicker, setShowTablePicker] = useState(false)
  const [tableHover, setTableHover] = useState<{ r: number; c: number }>({ r: 3, c: 3 })
  const [showSymbolPicker, setShowSymbolPicker] = useState(false)
  const [showLinkPopover, setShowLinkPopover] = useState(false)
  const [linkUrl, setLinkUrl] = useState("https://")
  const [linkLabel, setLinkLabel] = useState("")
  const [showCaseMenu, setShowCaseMenu] = useState(false)
  const [showHeaderFooterEditor, setShowHeaderFooterEditor] = useState(false)

  // Format Painter state
  const [paintedFormat, setPaintedFormat] = useState<{
    bold: boolean
    italic: boolean
    underline: boolean
    color: string
  } | null>(null)

  // Review & View features
  const [spellcheckEnabled, setSpellcheckEnabled] = useState(true)
  const [showOutlinePane, setShowOutlinePane] = useState(false)
  const [showRuler, setShowRuler] = useState(true)
  const [rightPanel, setRightPanel] = useState<"none" | "comments" | "history">("none")
  const [commentDraft, setCommentDraft] = useState("")
  const [snapshotDraft, setSnapshotDraft] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechRate, setSpeechRate] = useState<0.85 | 1.0 | 1.25>(1.0)
  const [isDictating, setIsDictating] = useState(false)

  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const savedRangeRef = useRef<Range | null>(null)
  const recognitionRef = useRef<any>(null)

  const activeDoc = useMemo(
    () => docs.find((d) => d.id === activeDocId) || docs[0],
    [docs, activeDocId]
  )

  const pageSetup: DocPageSetup = useMemo(
    () => ({ ...DEFAULT_DOC_PAGE_SETUP, ...(activeDoc?.pageSetup || {}) }),
    [activeDoc?.pageSetup]
  )

  useEffect(() => {
    saveStudioDocs(user, docs)
  }, [docs, user])

  useEffect(() => {
    if (!editorRef.current || !activeDoc) return
    editorRef.current.innerHTML = sanitizeSafeHtml(activeDoc.contentHtml)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDocId, editorRevision])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault()
        setShowPrintModal(true)
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "f" || e.key.toLowerCase() === "h")) {
        e.preventDefault()
        setShowFindBar(true)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
      try {
        recognitionRef.current?.stop()
      } catch {}
    }
  }, [])

  const notify = (msg: string) => {
    setStatusNotice(msg)
    setTimeout(() => {
      setStatusNotice((prev) => (prev === msg ? null : prev))
    }, 3200)
  }

  const saveSelectionRange = () => {
    if (typeof window === "undefined") return
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange()
    }
  }

  const restoreSelectionRange = () => {
    editorRef.current?.focus()
    if (typeof window === "undefined" || !savedRangeRef.current) return
    const sel = window.getSelection()
    if (sel) {
      sel.removeAllRanges()
      sel.addRange(savedRangeRef.current)
    }
  }

  const updateActiveDoc = (patch: Partial<StudioDocRecord>, forceSyncDom = false) => {
    if (!activeDoc) return
    const nowIso = new Date().toISOString()
    setDocs((prev) =>
      prev.map((d) => (d.id === activeDoc.id ? { ...d, ...patch, updatedAt: nowIso } : d))
    )
    setSavedLabel(
      `Saved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    )
    if (forceSyncDom) {
      setEditorRevision((r) => r + 1)
    }
  }

  const updatePageSetup = (patch: Partial<DocPageSetup>) => {
    updateActiveDoc({ pageSetup: { ...pageSetup, ...patch } })
  }

  const handleEditorInput = () => {
    if (!editorRef.current || !activeDoc) return
    saveSelectionRange()
    updateActiveDoc({ contentHtml: editorRef.current.innerHTML })
  }

  const execCmd = (command: string, value?: string) => {
    if (typeof document === "undefined") return
    restoreSelectionRange()
    try {
      document.execCommand(command, false, value)
    } catch {
      // ignore unsupported command
    }
    handleEditorInput()
  }

  const insertHtmlSnippet = (html: string) => {
    restoreSelectionRange()
    try {
      const ok = document.execCommand("insertHTML", false, html)
      if (!ok && editorRef.current) {
        editorRef.current.innerHTML += html
      }
    } catch {
      if (editorRef.current) editorRef.current.innerHTML += html
    }
    handleEditorInput()
  }

  const applyFontSizePx = (ptSize: number) => {
    setFontSizePt(ptSize)
    restoreSelectionRange()
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const spanHtml = `<span style="font-size:${ptSize}pt;">${sanitizeSafeHtml(
        sel.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      )}</span>`
      execCmd("insertHTML", spanHtml)
    } else {
      notify(`Active font size indicator set to ${ptSize}pt`)
    }
  }

  const handleChangeCase = (mode: TextCaseMode) => {
    setShowCaseMenu(false)
    restoreSelectionRange()
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) {
      notify("Select text inside the document first to transform case")
      return
    }
    const transformed = transformTextCase(sel.toString(), mode)
    execCmd("insertText", transformed)
    notify(`Applied ${mode} case`)
  }

  const handleToggleFormatPainter = () => {
    if (paintedFormat) {
      setPaintedFormat(null)
      notify("Format Painter cleared")
      return
    }
    restoreSelectionRange()
    const sel = window.getSelection()
    const node = sel?.anchorNode?.parentElement
    if (!node) {
      notify("Place cursor inside formatted text to copy its style")
      return
    }
    const style = window.getComputedStyle(node)
    setPaintedFormat({
      bold: Number(style.fontWeight) >= 600 || style.fontWeight === "bold",
      italic: style.fontStyle === "italic",
      underline: style.textDecorationLine.includes("underline"),
      color: style.color,
    })
    notify("Format Painter armed — select target text in document")
  }

  const handleEditorMouseUp = () => {
    saveSelectionRange()
    if (paintedFormat) {
      const sel = window.getSelection()
      if (sel && !sel.isCollapsed) {
        try {
          if (paintedFormat.bold !== document.queryCommandState("bold")) {
            document.execCommand("bold")
          }
          if (paintedFormat.italic !== document.queryCommandState("italic")) {
            document.execCommand("italic")
          }
          if (paintedFormat.underline !== document.queryCommandState("underline")) {
            document.execCommand("underline")
          }
          document.execCommand("foreColor", false, paintedFormat.color)
          handleEditorInput()
        } catch {}
        setPaintedFormat(null)
        notify("Style applied with Format Painter")
      }
    }
  }

  const findEnclosingTableCell = (): HTMLTableCellElement | null => {
    const sel = window.getSelection()
    let node: Node | null = sel?.anchorNode || null
    while (node && node !== editorRef.current) {
      if (node.nodeName === "TD" || node.nodeName === "TH") {
        return node as HTMLTableCellElement
      }
      node = node.parentNode
    }
    return null
  }

  const handleTableAction = (action: "add_row" | "add_col" | "del_row" | "del_table") => {
    restoreSelectionRange()
    const cell = findEnclosingTableCell()
    if (!cell) {
      notify("Click inside a table cell first")
      return
    }
    const tr = cell.parentElement as HTMLTableRowElement | null
    const table = cell.closest("table")
    if (!table || !tr) return

    if (action === "del_table") {
      table.remove()
    } else if (action === "del_row") {
      if (table.rows.length <= 1) table.remove()
      else tr.remove()
    } else if (action === "add_row") {
      const newRow = table.insertRow(tr.rowIndex + 1)
      for (let i = 0; i < tr.cells.length; i++) {
        const td = newRow.insertCell()
        td.style.border = "1px solid #cbd5e1"
        td.style.padding = "8px 10px"
        td.textContent = "Entry"
      }
    } else if (action === "add_col") {
      const targetIdx = cell.cellIndex + 1
      for (let r = 0; r < table.rows.length; r++) {
        const rowEl = table.rows[r]
        const newCell = rowEl.insertCell(Math.min(targetIdx, rowEl.cells.length))
        newCell.style.border = "1px solid #cbd5e1"
        newCell.style.padding = "8px 10px"
        if (r === 0) {
          newCell.style.background = "#f1f5f9"
          newCell.style.fontWeight = "700"
          newCell.textContent = "New Col"
        } else {
          newCell.textContent = "Entry"
        }
      }
    }
    handleEditorInput()
  }

  const handleInsertPageBreak = () => {
    insertHtmlSnippet(
      `<div data-page-break="true" class="cln-page-break" contenteditable="false" style="margin:22px 0;border-top:2px dashed #94a3b8;text-align:center;line-height:0;"><span style="background:#ffffff;padding:0 10px;font-size:10px;font-weight:700;letter-spacing:0.08em;color:#64748b;text-transform:uppercase;">Page Break</span></div><p><br/></p>`
    )
    notify("Inserted Page Break")
  }

  const handleInsertLinkConfirm = () => {
    const cleanUrl = linkUrl.trim()
    if (!cleanUrl || /^javascript:/i.test(cleanUrl)) {
      notify("Enter a valid https:// link URL")
      return
    }
    const safeHref = cleanUrl.replace(/"/g, "")
    const label = (linkLabel.trim() || safeHref).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    insertHtmlSnippet(
      `<a href="${safeHref}" target="_blank" rel="noopener noreferrer" style="color:#0B5CAD;text-decoration:underline;">${label}</a> `
    )
    setShowLinkPopover(false)
    setLinkUrl("https://")
    setLinkLabel("")
  }

  const handleInsertImageUrlPrompt = () => {
    const url = window.prompt("Paste an https:// image URL to insert:")
    if (url && /^https?:\/\//i.test(url.trim())) {
      insertHtmlSnippet(
        `<p><img src="${url.trim().replace(/"/g, "")}" alt="Embedded image" style="max-width:100%;border-radius:10px;margin:10px 0;" /></p>`
      )
    }
  }

  const handleClipboardOp = async (op: "cut" | "copy" | "paste") => {
    restoreSelectionRange()
    if (op === "paste") {
      try {
        const text = await navigator.clipboard.readText()
        if (text) {
          execCmd("insertText", text)
          return
        }
      } catch {
        notify("Use Ctrl+V to paste from your system clipboard")
      }
      return
    }
    try {
      document.execCommand(op)
      handleEditorInput()
    } catch {
      notify(`Use Ctrl+${op === "cut" ? "X" : "C"} inside the editor`)
    }
  }

  const handleToggleReadAloud = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      notify("Text-to-speech is unavailable in this browser")
      return
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }
    const plain = stripHtmlForStats(editorRef.current?.innerHTML ?? activeDoc?.contentHtml ?? "")
    if (!plain) {
      notify("Document is empty")
      return
    }
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(plain)
    utter.rate = speechRate
    utter.onend = () => setIsSpeaking(false)
    utter.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utter)
  }

  const handleToggleDictation = () => {
    if (typeof window === "undefined") return
    if (isDictating) {
      try {
        recognitionRef.current?.stop()
      } catch {}
      setIsDictating(false)
      return
    }
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRec) {
      notify("Live microphone dictation requires a Chromium/Edge SpeechRecognition browser")
      return
    }
    try {
      const rec = new SpeechRec()
      rec.continuous = true
      rec.interimResults = false
      rec.lang = "en-US"
      rec.onresult = (event: any) => {
        const last = event.results[event.results.length - 1]
        if (last?.isFinal && last[0]?.transcript) {
          execCmd("insertText", `${last[0].transcript.trim()} `)
        }
      }
      rec.onerror = () => setIsDictating(false)
      rec.onend = () => setIsDictating(false)
      recognitionRef.current = rec
      rec.start()
      setIsDictating(true)
      notify("Listening — speak clearly to dictate into your document")
    } catch {
      setIsDictating(false)
      notify("Could not start microphone dictation")
    }
  }

  const handleAddComment = () => {
    if (!activeDoc || !commentDraft.trim()) return
    const sel = typeof window !== "undefined" ? window.getSelection() : null
    const quote = sel && !sel.isCollapsed ? sel.toString().slice(0, 120) : undefined
    const nextComments = [
      {
        id: `cmt_${Date.now()}`,
        author: user.name || "ConnectLn Member",
        quote,
        text: commentDraft.trim(),
        createdAt: new Date().toISOString(),
        resolved: false,
      },
      ...(activeDoc.comments || []),
    ]
    updateActiveDoc({ comments: nextComments })
    setCommentDraft("")
    notify("Comment added to Review panel")
  }

  const handleSaveSnapshot = () => {
    if (!activeDoc) return
    const currentHtml = editorRef.current?.innerHTML ?? activeDoc.contentHtml
    const label =
      snapshotDraft.trim() ||
      `Checkpoint ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    const nextSnaps = [
      {
        id: `snap_${Date.now()}`,
        label,
        createdAt: new Date().toISOString(),
        contentHtml: currentHtml,
      },
      ...(activeDoc.snapshots || []),
    ].slice(0, 20)
    updateActiveDoc({ snapshots: nextSnaps, contentHtml: currentHtml })
    setSnapshotDraft("")
    notify(`Saved version "${label}"`)
  }

  const handleCreateFromTemplate = (tpl: DocTemplateItem) => {
    const now = new Date().toISOString()
    const newDoc: StudioDocRecord = {
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: tpl.name === "Blank Document" ? `Untitled Document ${docs.length + 1}` : tpl.name,
      category: tpl.category,
      contentHtml: tpl.contentHtml,
      createdAt: now,
      updatedAt: now,
      authorName: user.name || "ConnectLn Member",
      pageSetup: { ...DEFAULT_DOC_PAGE_SETUP },
    }
    setDocs((prev) => [newDoc, ...prev])
    setActiveDocId(newDoc.id)
    setEditorRevision((r) => r + 1)
    setShowTemplatesModal(false)
    notify(`Created "${newDoc.title}"`)
  }

  const handleDuplicateDoc = (doc: StudioDocRecord) => {
    const now = new Date().toISOString()
    const copy: StudioDocRecord = {
      ...doc,
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: `${doc.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      starred: false,
    }
    setDocs((prev) => [copy, ...prev])
    setActiveDocId(copy.id)
    setEditorRevision((r) => r + 1)
    notify("Document duplicated")
  }

  const handleDeleteDoc = (docId: string) => {
    if (docs.length <= 1) {
      notify("Keep at least one document in your library")
      return
    }
    const remaining = docs.filter((d) => d.id !== docId)
    setDocs(remaining)
    if (activeDocId === docId && remaining[0]) {
      setActiveDocId(remaining[0].id)
      setEditorRevision((r) => r + 1)
    }
    notify("Document deleted")
  }

  const handleFindReplaceAll = () => {
    if (!activeDoc || !findTerm.trim()) return
    const currentHtml = editorRef.current?.innerHTML ?? activeDoc.contentHtml
    const escaped = findTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const nextHtml = currentHtml.replace(new RegExp(escaped, "gi"), replaceTerm)
    updateActiveDoc({ contentHtml: nextHtml }, true)
    notify(`Replaced occurrences of "${findTerm}"`)
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const ext = file.name.split(".").pop()?.toLowerCase() || ""
    const titleBase = file.name.replace(/\.[^.]+$/, "") || "Imported Document"

    try {
      let importedHtml = ""
      if (ext === "docx") {
        const bytes = new Uint8Array(await file.arrayBuffer())
        importedHtml = await extractTextHtmlFromDocxBytes(bytes)
      } else {
        const text = await file.text()
        if (ext === "html" || ext === "htm") {
          importedHtml = sanitizeSafeHtml(text)
        } else if (ext === "md") {
          importedHtml = markdownToSimpleHtml(text)
        } else {
          importedHtml = text
            .split(/\r?\n\r?\n/)
            .map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
            .join("\n")
        }
      }
      const now = new Date().toISOString()
      const newDoc: StudioDocRecord = {
        id: `doc_${Date.now()}`,
        title: titleBase,
        category: "Imported",
        contentHtml: importedHtml || "<p>Imported document.</p>",
        createdAt: now,
        updatedAt: now,
        authorName: user.name || "ConnectLn Member",
        pageSetup: { ...DEFAULT_DOC_PAGE_SETUP },
      }
      setDocs((prev) => [newDoc, ...prev])
      setActiveDocId(newDoc.id)
      setEditorRevision((r) => r + 1)
      notify(`Imported "${file.name}"`)
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not import document file")
    }
  }

  const handleInsertImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : ""
      if (dataUrl) {
        insertHtmlSnippet(
          `<p><img src="${dataUrl}" alt="${file.name.replace(/"/g, "")}" style="max-width:100%;border-radius:10px;margin:10px 0;" /></p>`
        )
      }
    }
    reader.readAsDataURL(file)
  }

  const handleExport = (kind: "docx" | "html" | "md" | "txt" | "print") => {
    if (!activeDoc) return
    setShowExportMenu(false)
    const html = editorRef.current?.innerHTML ?? activeDoc.contentHtml
    const slug = safeSlug(activeDoc.title)

    if (kind === "docx") {
      const bytes = buildDocxBytes(activeDoc.title, html, pageSetup)
      downloadStudioFile(
        bytes,
        `${slug}.docx`,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
      notify(`Exported ${slug}.docx`)
      return
    }
    if (kind === "html") {
      downloadStudioFile(
        buildStandaloneHtmlDocument(activeDoc.title, html),
        `${slug}.html`,
        "text/html;charset=utf-8"
      )
      notify(`Exported ${slug}.html`)
      return
    }
    if (kind === "md") {
      downloadStudioFile(htmlToMarkdown(html), `${slug}.md`, "text/markdown;charset=utf-8")
      notify(`Exported ${slug}.md`)
      return
    }
    if (kind === "txt") {
      downloadStudioFile(
        stripHtmlForStats(html),
        `${slug}.txt`,
        "text/plain;charset=utf-8"
      )
      notify(`Exported ${slug}.txt`)
      return
    }
    setShowPrintModal(true)
  }

  const handleShareDoc = () => {
    if (!activeDoc || !onShareToFeed) return
    const html = editorRef.current?.innerHTML ?? activeDoc.contentHtml
    const blocks = extractDocBlocksFromHtml(html)
    const plain = stripHtmlForStats(html)
    const summary = plain.slice(0, 220) + (plain.length > 220 ? "..." : "")
    const slides = blocks.slice(0, 4).map((b, idx) => ({
      slideNumber: idx + 1,
      title: b.type.startsWith("h") ? b.text : `${activeDoc.title} · Section ${idx + 1}`,
      content: b.text || "Document section",
      visualTag: "ConnectLn Docs",
    }))
    onShareToFeed({
      title: activeDoc.title,
      summary: summary || `Published document "${activeDoc.title}" from ConnectLn Docs.`,
      appLabel: "ConnectLn Docs",
      slides: slides.length > 0 ? slides : undefined,
    })
    notify("Shared document to ConnectLn Home Feed")
  }

  const scrollToHeadingIndex = (idx: number) => {
    if (!editorRef.current) return
    const allHeadings = editorRef.current.querySelectorAll("h1, h2, h3")
    const target = allHeadings[idx]
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const stats = useMemo(
    () => computeDetailedDocStats(activeDoc?.contentHtml || ""),
    [activeDoc?.contentHtml]
  )
  const outlineHeadings = useMemo(
    () => extractOutlineHeadings(activeDoc?.contentHtml || ""),
    [activeDoc?.contentHtml]
  )
  const filteredDocs = useMemo(() => {
    const q = docSearch.trim().toLowerCase()
    const list = q
      ? docs.filter(
          (d) => d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
        )
      : docs
    return [...list].sort((a, b) => Number(Boolean(b.starred)) - Number(Boolean(a.starred)))
  }, [docs, docSearch])

  const paperDims = getPaperDimensionsPx(pageSetup.paperSize, pageSetup.orientation)
  const marginInfo = getMarginPx(pageSetup.margins)

  const pageBorderStyle =
    pageSetup.pageBorder === "thin"
      ? "1px solid #94A3B8"
      : pageSetup.pageBorder === "double"
      ? "4px double #0B1F3A"
      : undefined

  return (
    <div className="flex flex-col lg:flex-row rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm min-h-[780px]">
      {/* Left Sidebar: Document Library & Navigation Outline */}
      {sidebarOpen && (
        <aside className="w-full lg:w-[270px] shrink-0 border-b lg:border-b-0 lg:border-r border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/80 dark:bg-zinc-950/60 flex flex-col">
          <div className="p-3 border-b border-[#E7E2DA] dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0B5CAD] dark:text-sky-400 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                My Documents ({docs.length})
              </span>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0B5CAD] hover:bg-[#094a8d] text-white px-2.5 py-1 text-[11px] font-bold cursor-pointer"
              >
                <FilePlus2 className="h-3.5 w-3.5" />
                New
              </button>
            </div>

            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="Search documents..."
                className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-8 pr-3 py-1.5 text-xs text-[#0B1F3A] dark:text-zinc-100 outline-none focus:border-[#0B5CAD]"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowTemplatesModal(true)}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-[11px] font-semibold text-[#0B1F3A] dark:text-zinc-200 hover:border-[#0B5CAD] cursor-pointer"
              >
                <LayoutTemplate className="h-3.5 w-3.5 text-[#0B5CAD]" />
                Templates
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-[11px] font-semibold text-[#0B1F3A] dark:text-zinc-200 hover:border-[#0B5CAD] cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5 text-[#0B5CAD]" />
                Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.html,.htm,.md,.txt"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
          </div>

          {showOutlinePane && (
            <div className="p-2.5 border-b border-[#E7E2DA] dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 space-y-1.5 max-h-[210px] overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#0B5CAD]">
                  Navigation Outline
                </span>
                <button
                  type="button"
                  onClick={() => setShowOutlinePane(false)}
                  className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {outlineHeadings.length === 0 ? (
                <p className="text-[11px] text-zinc-500">Add headings to build outline.</p>
              ) : (
                outlineHeadings.map((h) => (
                  <button
                    key={`${h.index}_${h.text}`}
                    type="button"
                    onClick={() => scrollToHeadingIndex(h.index)}
                    style={{ paddingLeft: `${(h.level - 1) * 10 + 6}px` }}
                    className="w-full text-left rounded-lg py-1 pr-2 text-xs font-semibold text-[#0B1F3A] dark:text-zinc-200 hover:bg-sky-50 dark:hover:bg-zinc-800 truncate cursor-pointer"
                  >
                    {h.text}
                  </button>
                ))
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[240px] lg:max-h-none">
            {filteredDocs.map((doc) => {
              const isSelected = activeDoc?.id === doc.id
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setActiveDocId(doc.id)
                    setEditorRevision((r) => r + 1)
                  }}
                  className={`group rounded-xl border p-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#0B5CAD] bg-white dark:bg-zinc-900 shadow-xs"
                      : "border-transparent hover:border-[#E7E2DA] hover:bg-white/70 dark:hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#0B1F3A] dark:text-zinc-100 truncate">
                        {doc.title || "Untitled Document"}
                      </p>
                      <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                        {doc.category} · {new Date(doc.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDocs((prev) =>
                            prev.map((d) => (d.id === doc.id ? { ...d, starred: !d.starred } : d))
                          )
                        }}
                        title="Star document"
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${
                            doc.starred ? "fill-amber-400 text-amber-500" : "text-zinc-400"
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDuplicateDoc(doc)
                        }}
                        title="Duplicate document"
                        className="p-1 rounded text-zinc-400 hover:text-[#0B5CAD] opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteDoc(doc.id)
                        }}
                        title="Delete document"
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

      {/* Main Editor Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen((s) => !s)}
              title={sidebarOpen ? "Hide document list" : "Show document list"}
              className="rounded-lg p-1.5 border border-[#E7E2DA] dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer shrink-0"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </button>
            <input
              type="text"
              aria-label="Document title"
              value={activeDoc?.title || ""}
              onChange={(e) => updateActiveDoc({ title: e.target.value })}
              className="min-w-[150px] flex-1 max-w-md rounded-lg border border-transparent hover:border-[#E7E2DA] focus:border-[#0B5CAD] bg-transparent px-2 py-1 text-sm sm:text-base font-extrabold text-[#0B1F3A] dark:text-white outline-none"
            />
            <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
              {savedLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {statusNotice && (
              <span className="rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-2.5 py-1 text-xs font-semibold text-[#0B5CAD] dark:text-sky-300">
                {statusNotice}
              </span>
            )}

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              title="Print or Save as PDF (Ctrl+P)"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#0B5CAD] bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 px-3 py-1.5 text-xs font-extrabold text-[#0B5CAD] dark:text-sky-300 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[#0B5CAD] px-3 py-1.5 text-xs font-bold text-[#0B1F3A] dark:text-zinc-100 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#0B5CAD]" />
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-10 z-30 w-56 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1.5 shadow-xl space-y-1">
                  <button
                    type="button"
                    onClick={() => handleExport("docx")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <span>Standard Document (.docx)</span>
                    <span className="text-[10px] font-mono text-[#0B5CAD]">OpenXML</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("html")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <span>Web Page (.html)</span>
                    <span className="text-[10px] font-mono text-zinc-400">HTML5</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("md")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <span>Markdown (.md)</span>
                    <span className="text-[10px] font-mono text-zinc-400">MD</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("txt")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <span>Plain Text (.txt)</span>
                    <span className="text-[10px] font-mono text-zinc-400">TXT</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("print")}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5 text-[#0B5CAD]" />
                    <span>Print / Save as PDF</span>
                  </button>
                </div>
              )}
            </div>

            {onShareToFeed && (
              <button
                type="button"
                onClick={handleShareDoc}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0067B8] hover:bg-[#00559b] text-white px-3 py-1.5 text-xs font-bold shadow-xs cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share to Feed
              </button>
            )}
          </div>
        </div>

        {/* 5-Tab Ribbon Selector */}
        <div className="flex items-center justify-between gap-2 px-3 pt-1.5 border-b border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {(
              [
                { id: "home", label: "Home" },
                { id: "insert", label: "Insert" },
                { id: "layout", label: "Layout" },
                { id: "review", label: "Review" },
                { id: "view", label: "View" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRibbonTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-t-lg border-b-2 transition-colors cursor-pointer ${
                  ribbonTab === tab.id
                    ? "border-[#0B5CAD] bg-white dark:bg-zinc-900 text-[#0B5CAD] dark:text-sky-400"
                    : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-[#0B1F3A]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="hidden md:inline text-[10.5px] font-mono text-zinc-500 pr-1">
            {pageSetup.paperSize.toUpperCase()} · {pageSetup.orientation} · {pageSetup.columns} col
          </span>
        </div>

        {/* Ribbon Tool Strip by Active Tab */}
        <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/70 dark:bg-zinc-950/70 text-xs">
          {ribbonTab === "home" && (
            <>
              <button type="button" onClick={() => execCmd("undo")} title="Undo" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
                <Undo2 className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => execCmd("redo")} title="Redo" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
                <Redo2 className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => handleClipboardOp("cut")} title="Cut" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
                <Scissors className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => handleClipboardOp("copy")} title="Copy" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => handleClipboardOp("paste")} title="Paste" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
                <Clipboard className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleToggleFormatPainter}
                title="Format Painter"
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold cursor-pointer ${
                  paintedFormat ? "bg-[#0B5CAD] text-white" : "hover:bg-white dark:hover:bg-zinc-800"
                }`}
              >
                <Paintbrush className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">Painter</span>
              </button>
              <button type="button" onClick={() => execCmd("removeFormat")} title="Clear All Formatting" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
                <Eraser className="h-3.5 w-3.5" />
              </button>

              <span className="h-5 w-px bg-[#E7E2DA] dark:bg-zinc-700 mx-0.5" />

              <select
                aria-label="Text style preset"
                defaultValue="p"
                onChange={(e) => {
                  const val = e.target.value
                  if (val === "title") {
                    insertHtmlSnippet(`<h1 style="font-size:28pt;margin-bottom:8px;">Document Title</h1>`)
                  } else if (val === "subtitle") {
                    insertHtmlSnippet(`<p style="font-size:14pt;color:#64748b;margin-bottom:14px;">Document Subtitle</p>`)
                  } else {
                    execCmd("formatBlock", val)
                  }
                }}
                className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 font-semibold cursor-pointer"
              >
                <option value="p">Normal</option>
                <option value="title">Title</option>
                <option value="subtitle">Subtitle</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="blockquote">Quote</option>
              </select>

              <select
                aria-label="Font family"
                value={fontFamily}
                onChange={(e) => {
                  setFontFamily(e.target.value)
                  execCmd("fontName", e.target.value)
                }}
                className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 font-semibold cursor-pointer max-w-[130px]"
              >
                {DOC_FONT_FAMILIES.map((f) => (
                  <option key={f.label} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>

              <select
                aria-label="Font size points"
                value={fontSizePt}
                onChange={(e) => applyFontSizePx(Number(e.target.value))}
                className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 py-1 font-semibold cursor-pointer"
              >
                {DOC_FONT_SIZES.map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}pt
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => applyFontSizePx(Math.min(48, fontSizePt + 2))}
                title="Increase Font Size"
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
              >
                <AArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyFontSizePx(Math.max(8, fontSizePt - 2))}
                title="Decrease Font Size"
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
              >
                <AArrowDown className="h-3.5 w-3.5" />
              </button>

              <span className="h-5 w-px bg-[#E7E2DA] dark:bg-zinc-700 mx-0.5" />

              <button type="button" onClick={() => execCmd("bold")} title="Bold" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"><Bold className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => execCmd("italic")} title="Italic" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"><Italic className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => execCmd("underline")} title="Underline" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"><Underline className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => execCmd("strikeThrough")} title="Strikethrough" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"><Strikethrough className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => execCmd("subscript")} title="Subscript" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"><Subscript className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => execCmd("superscript")} title="Superscript" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"><Superscript className="h-3.5 w-3.5" /></button>

              {/* Change Case Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { saveSelectionRange(); setShowCaseMenu((v) => !v) }}
                  title="Change Text Case"
                  className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <CaseSensitive className="h-4 w-4" />
                </button>
                {showCaseMenu && (
                  <div className="absolute left-0 top-9 z-30 w-44 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1 shadow-xl">
                    {(
                      [
                        { id: "sentence", label: "Sentence case." },
                        { id: "lower", label: "lowercase" },
                        { id: "upper", label: "UPPERCASE" },
                        { id: "title", label: "Title Case" },
                        { id: "toggle", label: "tOGGLE cASE" },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleChangeCase(m.id)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 text-xs font-semibold cursor-pointer"
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <label title="Font Color" className="p-1 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-0.5">
                <Palette className="h-3.5 w-3.5 text-[#0B5CAD]" />
                <input type="color" defaultValue="#0B1F3A" onChange={(e) => execCmd("foreColor", e.target.value)} className="h-4 w-4 border-0 bg-transparent cursor-pointer" />
              </label>
              <label title="Text Highlight" className="p-1 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-0.5">
                <Highlighter className="h-3.5 w-3.5 text-amber-600" />
                <input type="color" defaultValue="#FEF08A" onChange={(e) => execCmd("hiliteColor", e.target.value)} className="h-4 w-4 border-0 bg-transparent cursor-pointer" />
              </label>

              <span className="h-5 w-px bg-[#E7E2DA] dark:bg-zinc-700 mx-0.5" />

              <button type="button" onClick={() => execCmd("justifyLeft")} title="Align Left" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"><AlignLeft className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => execCmd("justifyCenter")} title="Align Center" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"><AlignCenter className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => execCmd("justifyRight")} title="Align Right" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"><AlignRight className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => execCmd("justifyFull")} title="Justify" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"><AlignJustify className="h-3.5 w-3.5" /></button>

              <button type="button" onClick={() => execCmd("insertUnorderedList")} title="Bullets" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"><List className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => execCmd("insertOrderedList")} title="Numbering" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"><ListOrdered className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => insertHtmlSnippet("<ul><li>[ ] Action item — owner &amp; due date</li></ul>")} title="Checklist" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"><CheckSquare className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => execCmd("outdent")} title="Decrease Indent" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"><Outdent className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => execCmd("indent")} title="Increase Indent" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"><Indent className="h-3.5 w-3.5" /></button>

              <select
                aria-label="Line spacing"
                value={pageSetup.lineSpacing}
                onChange={(e) => updatePageSetup({ lineSpacing: e.target.value as DocPageSetup["lineSpacing"] })}
                className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 py-1 font-semibold cursor-pointer"
                title="Line Spacing"
              >
                <option value="1.0">1.0x</option>
                <option value="1.15">1.15x</option>
                <option value="1.5">1.5x</option>
                <option value="2.0">2.0x</option>
              </select>

              <button
                type="button"
                onClick={() => setShowFindBar((v) => !v)}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold cursor-pointer ${
                  showFindBar ? "bg-[#0B5CAD] text-white" : "hover:bg-white dark:hover:bg-zinc-800"
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                Find
              </button>
            </>
          )}

          {ribbonTab === "insert" && (
            <>
              <button
                type="button"
                onClick={() =>
                  insertHtmlSnippet(
                    buildCoverPageHtml(activeDoc?.title || "Report", user.name || "Author")
                  )
                }
                className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold hover:border-[#0B5CAD] cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#0B5CAD]" />
                Cover Page
              </button>
              <button
                type="button"
                onClick={handleInsertPageBreak}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold hover:border-[#0B5CAD] cursor-pointer"
              >
                <SeparatorHorizontal className="h-3.5 w-3.5 text-[#0B5CAD]" />
                Page Break
              </button>

              {/* Interactive Table Matrix Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { saveSelectionRange(); setShowTablePicker((v) => !v) }}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold hover:border-[#0B5CAD] cursor-pointer"
                >
                  <Table2 className="h-3.5 w-3.5 text-[#0B5CAD]" />
                  Table ({tableHover.r}×{tableHover.c})
                </button>
                {showTablePicker && (
                  <div className="absolute left-0 top-9 z-30 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 shadow-xl">
                    <p className="text-[11px] font-bold mb-2 text-center">
                      Insert {tableHover.r} × {tableHover.c} Table
                    </p>
                    <div className="grid grid-cols-8 gap-1">
                      {Array.from({ length: 8 }).map((_, rIdx) =>
                        Array.from({ length: 8 }).map((__, cIdx) => {
                          const active = rIdx < tableHover.r && cIdx < tableHover.c
                          return (
                            <button
                              key={`${rIdx}_${cIdx}`}
                              type="button"
                              onMouseEnter={() => setTableHover({ r: rIdx + 1, c: cIdx + 1 })}
                              onClick={() => {
                                insertHtmlSnippet(buildTableHtml(rIdx + 1, cIdx + 1))
                                setShowTablePicker(false)
                              }}
                              className={`h-4 w-4 rounded-xs border cursor-pointer ${
                                active
                                  ? "bg-[#0B5CAD] border-[#0B5CAD]"
                                  : "bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                              }`}
                            />
                          )
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button type="button" onClick={() => handleTableAction("add_row")} className="rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-1 font-semibold hover:border-[#0B5CAD] cursor-pointer">+ Row</button>
              <button type="button" onClick={() => handleTableAction("add_col")} className="rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-1 font-semibold hover:border-[#0B5CAD] cursor-pointer">+ Col</button>
              <button type="button" onClick={() => handleTableAction("del_row")} className="rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-1 font-semibold hover:border-rose-500 text-rose-600 cursor-pointer">- Row</button>

              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-2.5 py-1 font-bold hover:border-[#0B5CAD] cursor-pointer"
              >
                <ImagePlus className="h-3.5 w-3.5 text-[#0B5CAD]" />
                Picture
              </button>
              <button
                type="button"
                onClick={handleInsertImageUrlPrompt}
                className="rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-1 font-semibold hover:border-[#0B5CAD] cursor-pointer"
              >
                Image URL
              </button>
              <input ref={imageInputRef} type="file" accept="image/*" onChange={handleInsertImageFile} className="hidden" />

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    saveSelectionRange()
                    const selText = window.getSelection()?.toString() || ""
                    if (selText) setLinkLabel(selText)
                    setShowLinkPopover((v) => !v)
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-2.5 py-1 font-bold hover:border-[#0B5CAD] cursor-pointer"
                >
                  <Link2 className="h-3.5 w-3.5 text-[#0B5CAD]" />
                  Link
                </button>
                {showLinkPopover && (
                  <div className="absolute left-0 top-9 z-30 w-64 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 shadow-xl space-y-2">
                    <input
                      type="text"
                      value={linkLabel}
                      onChange={(e) => setLinkLabel(e.target.value)}
                      placeholder="Display text"
                      className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-transparent px-2.5 py-1 text-xs"
                    />
                    <input
                      type="text"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-transparent px-2.5 py-1 text-xs"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button type="button" onClick={() => setShowLinkPopover(false)} className="px-2 py-1 text-xs text-zinc-500 cursor-pointer">Cancel</button>
                      <button type="button" onClick={handleInsertLinkConfirm} className="rounded-lg bg-[#0B5CAD] text-white px-3 py-1 text-xs font-bold cursor-pointer">Insert</button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => insertHtmlSnippet(`<span>${formatDateStamp("long")}</span> `)}
                className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-1 font-semibold hover:border-[#0B5CAD] cursor-pointer"
              >
                <Calendar className="h-3.5 w-3.5 text-[#0B5CAD]" />
                Date
              </button>

              <button
                type="button"
                onClick={() => insertHtmlSnippet(buildSignatureBlockHtml(user.name || "Authorized Signer"))}
                className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-1 font-semibold hover:border-[#0B5CAD] cursor-pointer"
              >
                <PenTool className="h-3.5 w-3.5 text-[#0B5CAD]" />
                Signature
              </button>

              <button
                type="button"
                onClick={() =>
                  insertHtmlSnippet(
                    buildTocHtml(editorRef.current?.innerHTML ?? activeDoc?.contentHtml ?? "")
                  )
                }
                className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-1 font-semibold hover:border-[#0B5CAD] cursor-pointer"
              >
                <ListTree className="h-3.5 w-3.5 text-[#0B5CAD]" />
                Table of Contents
              </button>

              <button
                type="button"
                onClick={() =>
                  insertHtmlSnippet(
                    '<blockquote style="border-left:4px solid #0B5CAD;background:#f0f6ff;padding:10px 14px;border-radius:0 8px 8px 0;margin:12px 0;">Callout Note: Add key summary here.</blockquote><p></p>'
                  )
                }
                className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-1 font-semibold cursor-pointer"
              >
                <Quote className="h-3.5 w-3.5" />
                Callout
              </button>

              <button
                type="button"
                onClick={() =>
                  insertHtmlSnippet(
                    '<pre style="background:#0f172a;color:#e2e8f0;padding:12px 16px;border-radius:10px;font-family:monospace;font-size:12px;">// Technical block\nconst status = "ready";</pre><p></p>'
                  )
                }
                className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-1 font-semibold cursor-pointer"
              >
                <Code2 className="h-3.5 w-3.5" />
                Code
              </button>

              <button type="button" onClick={() => execCmd("insertHorizontalRule")} title="Horizontal Line" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
                <Minus className="h-3.5 w-3.5" />
              </button>

              {/* Symbols Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { saveSelectionRange(); setShowSymbolPicker((v) => !v) }}
                  className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-1 font-bold hover:border-[#0B5CAD] cursor-pointer"
                >
                  <Sigma className="h-3.5 w-3.5 text-[#0B5CAD]" />
                  Symbols
                </button>
                {showSymbolPicker && (
                  <div className="absolute right-0 top-9 z-30 w-64 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 shadow-xl">
                    <div className="grid grid-cols-8 gap-1">
                      {DOC_SYMBOLS.map((sym) => (
                        <button
                          key={sym.name}
                          type="button"
                          title={sym.name}
                          onClick={() => {
                            execCmd("insertText", sym.char)
                            setShowSymbolPicker(false)
                          }}
                          className="h-7 w-7 rounded hover:bg-sky-50 dark:hover:bg-zinc-800 font-bold text-sm cursor-pointer"
                        >
                          {sym.char}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowHeaderFooterEditor((v) => !v)}
                className={`rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  showHeaderFooterEditor
                    ? "bg-[#0B5CAD] text-white"
                    : "border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900"
                }`}
              >
                Header &amp; Footer
              </button>
            </>
          )}

          {ribbonTab === "layout" && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-500">Margins:</span>
                <select
                  aria-label="Page margins"
                  value={pageSetup.margins}
                  onChange={(e) => updatePageSetup({ margins: e.target.value as DocMarginsPreset })}
                  className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 font-semibold cursor-pointer"
                >
                  <option value="normal">Normal (1&quot;)</option>
                  <option value="narrow">Narrow (0.5&quot;)</option>
                  <option value="moderate">Moderate (0.75&quot;)</option>
                  <option value="wide">Wide (1.5&quot;)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-500">Orientation:</span>
                {(["portrait", "landscape"] as DocOrientation[]).map((orient) => (
                  <button
                    key={orient}
                    type="button"
                    onClick={() => updatePageSetup({ orientation: orient })}
                    className={`rounded-lg px-2.5 py-1 font-bold capitalize cursor-pointer ${
                      pageSetup.orientation === orient
                        ? "bg-[#0B5CAD] text-white"
                        : "border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    }`}
                  >
                    {orient}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-500">Paper:</span>
                <select
                  aria-label="Paper size"
                  value={pageSetup.paperSize}
                  onChange={(e) => updatePageSetup({ paperSize: e.target.value as DocPaperSize })}
                  className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 font-semibold cursor-pointer"
                >
                  <option value="letter">Letter</option>
                  <option value="a4">A4</option>
                  <option value="legal">Legal</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <Columns className="h-3.5 w-3.5 text-zinc-500" />
                {([1, 2, 3] as const).map((cols) => (
                  <button
                    key={cols}
                    type="button"
                    onClick={() => updatePageSetup({ columns: cols })}
                    className={`rounded-lg px-2 py-1 font-bold cursor-pointer ${
                      pageSetup.columns === cols
                        ? "bg-[#0B5CAD] text-white"
                        : "border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    }`}
                  >
                    {cols} Col
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-500">Watermark:</span>
                <select
                  aria-label="Watermark preset"
                  value={pageSetup.watermark}
                  onChange={(e) => updatePageSetup({ watermark: e.target.value })}
                  className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 font-semibold cursor-pointer"
                >
                  <option value="">None</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="DO NOT COPY">DO NOT COPY</option>
                  <option value="INTERNAL ONLY">INTERNAL ONLY</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="font-bold text-zinc-500">Page Tint:</span>
                {["#FFFFFF", "#FAF7F2", "#FEFCE8", "#F1F5F9", "#F0F9FF"].map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => updatePageSetup({ pageBg: hex })}
                    style={{ backgroundColor: hex }}
                    className={`h-5 w-5 rounded-full border cursor-pointer ${
                      pageSetup.pageBg === hex ? "ring-2 ring-[#0B5CAD] border-[#0B5CAD]" : "border-zinc-300"
                    }`}
                  />
                ))}
              </div>

              <select
                aria-label="Page border"
                value={pageSetup.pageBorder}
                onChange={(e) => updatePageSetup({ pageBorder: e.target.value as DocPageBorder })}
                className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 font-semibold cursor-pointer"
              >
                <option value="none">Border: None</option>
                <option value="thin">Border: Thin Line</option>
                <option value="double">Border: Double Formal</option>
                <option value="accent">Border: Top Accent Bar</option>
              </select>
            </>
          )}

          {ribbonTab === "review" && (
            <>
              <button
                type="button"
                onClick={() => setSpellcheckEnabled((s) => !s)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  spellcheckEnabled
                    ? "bg-[#0B5CAD] text-white"
                    : "border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900"
                }`}
              >
                <SpellCheck className="h-3.5 w-3.5" />
                Spellcheck: {spellcheckEnabled ? "ON" : "OFF"}
              </button>

              <button
                type="button"
                onClick={() => setShowStatsModal(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold hover:border-[#0B5CAD] cursor-pointer"
              >
                <BarChart2 className="h-3.5 w-3.5 text-[#0B5CAD]" />
                Statistics
              </button>

              <button
                type="button"
                onClick={handleToggleReadAloud}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  isSpeaking
                    ? "bg-emerald-600 text-white"
                    : "border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900"
                }`}
              >
                {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-[#0B5CAD]" />}
                {isSpeaking ? "Stop Reading" : "Read Aloud"}
              </button>
              <select
                aria-label="Read aloud speed"
                value={speechRate}
                onChange={(e) => setSpeechRate(Number(e.target.value) as 0.85 | 1.0 | 1.25)}
                className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 py-1 font-semibold cursor-pointer"
              >
                <option value={0.85}>0.85x</option>
                <option value={1}>1.0x</option>
                <option value={1.25}>1.25x</option>
              </select>

              <button
                type="button"
                onClick={handleToggleDictation}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  isDictating
                    ? "bg-rose-600 text-white"
                    : "border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900"
                }`}
              >
                {isDictating ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5 text-[#0B5CAD]" />}
                {isDictating ? "Stop Dictation" : "Dictate"}
              </button>

              <button
                type="button"
                onClick={() => setRightPanel((p) => (p === "comments" ? "none" : "comments"))}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  rightPanel === "comments"
                    ? "bg-[#0B5CAD] text-white"
                    : "border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900"
                }`}
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                Comments ({activeDoc?.comments?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setRightPanel((p) => (p === "history" ? "none" : "history"))}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  rightPanel === "history"
                    ? "bg-[#0B5CAD] text-white"
                    : "border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900"
                }`}
              >
                <History className="h-3.5 w-3.5" />
                Version History ({activeDoc?.snapshots?.length || 0})
              </button>
            </>
          )}

          {ribbonTab === "view" && (
            <>
              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0B5CAD] text-white px-2.5 py-1 font-bold cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                Print Layout Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  setSidebarOpen(true)
                  setShowOutlinePane((v) => !v)
                }}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  showOutlinePane
                    ? "bg-[#0B5CAD] text-white"
                    : "border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900"
                }`}
              >
                <ListTree className="h-3.5 w-3.5" />
                Navigation Outline
              </button>
              <button
                type="button"
                onClick={() => setShowRuler((r) => !r)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  showRuler
                    ? "bg-[#0B5CAD] text-white"
                    : "border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900"
                }`}
              >
                <Ruler className="h-3.5 w-3.5" />
                Ruler
              </button>
              <button
                type="button"
                onClick={() => setSidebarOpen((s) => !s)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold cursor-pointer"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Focus Mode
              </button>
              <div className="flex items-center gap-1 ml-1">
                <span className="font-bold text-zinc-500">Zoom:</span>
                {([75, 90, 100, 115, 130] as const).map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setZoomPct(pct)}
                    className={`rounded-lg px-2 py-1 font-bold cursor-pointer ${
                      zoomPct === pct ? "bg-[#0B5CAD] text-white" : "bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Optional Find & Replace Bar */}
        {showFindBar && (
          <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-sky-50/70 dark:bg-zinc-800/80 border-b border-[#E7E2DA] dark:border-zinc-700 text-xs">
            <input
              type="text"
              value={findTerm}
              onChange={(e) => setFindTerm(e.target.value)}
              placeholder="Find text..."
              className="rounded-lg border border-[#E7E2DA] dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2.5 py-1 outline-none"
            />
            <input
              type="text"
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              placeholder="Replace with..."
              className="rounded-lg border border-[#E7E2DA] dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2.5 py-1 outline-none"
            />
            <button
              type="button"
              onClick={handleFindReplaceAll}
              className="rounded-lg bg-[#0B5CAD] text-white px-3 py-1 font-bold cursor-pointer"
            >
              Replace All
            </button>
            <button
              type="button"
              onClick={() => setShowFindBar(false)}
              className="ml-auto p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Optional Running Header & Footer Editor Strip */}
        {showHeaderFooterEditor && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-4 py-2 bg-[#FAF7F2] dark:bg-zinc-900 border-b border-[#E7E2DA] dark:border-zinc-800 text-xs">
            <input
              type="text"
              value={pageSetup.headerText}
              onChange={(e) => updatePageSetup({ headerText: e.target.value })}
              placeholder="Running Header text..."
              className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2.5 py-1 outline-none"
            />
            <input
              type="text"
              value={pageSetup.footerText}
              onChange={(e) => updatePageSetup({ footerText: e.target.value })}
              placeholder="Running Footer text..."
              className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2.5 py-1 outline-none"
            />
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={pageSetup.showPageNumbers}
                  onChange={(e) => updatePageSetup({ showPageNumbers: e.target.checked })}
                />
                Page Numbers
              </label>
              <button type="button" onClick={() => setShowHeaderFooterEditor(false)} className="text-zinc-500 hover:text-zinc-800 cursor-pointer">Done</button>
            </div>
          </div>
        )}

        {/* Workspace Row: Centered Paper Canvas + Optional Review / History Right Drawer */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <div className="flex-1 overflow-auto bg-[#EFECE6] dark:bg-zinc-950 p-4 sm:p-7">
            {/* Horizontal Inch Ruler */}
            {showRuler && (
              <div
                style={{ maxWidth: `${paperDims.widthPx}px`, zoom: `${zoomPct}%` }}
                className="mx-auto mb-2 h-5 rounded-md bg-white/90 dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-800 flex items-center justify-between px-4 text-[9.5px] font-mono text-zinc-400 select-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((inch) => (
                  <span key={inch}>|{inch}&quot;</span>
                ))}
              </div>
            )}

            {/* Live Styled Paper Canvas */}
            <div
              style={{
                maxWidth: `${paperDims.widthPx}px`,
                minHeight: `${Math.min(paperDims.minHeightPx, 820)}px`,
                backgroundColor: pageSetup.pageBg || "#FFFFFF",
                paddingLeft: `${marginInfo.px}px`,
                paddingRight: `${marginInfo.px}px`,
                paddingTop: "40px",
                paddingBottom: "40px",
                borderTop: pageSetup.pageBorder === "accent" ? "6px solid #0B5CAD" : pageBorderStyle,
                borderRight: pageBorderStyle,
                borderBottom: pageBorderStyle,
                borderLeft: pageBorderStyle,
                zoom: `${zoomPct}%`,
              }}
              className="relative mx-auto rounded-xl border border-[#E7E2DA] dark:border-zinc-800 shadow-[0_12px_40px_rgba(11,31,58,0.08)] flex flex-col justify-between overflow-hidden"
            >
              {/* Diagonal Watermark Overlay */}
              {pageSetup.watermark && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none select-none absolute inset-0 flex items-center justify-center z-0"
                >
                  <span className="-rotate-30 text-5xl sm:text-6xl font-black tracking-[0.2em] text-zinc-400/20 whitespace-nowrap">
                    {pageSetup.watermark}
                  </span>
                </div>
              )}

              {(pageSetup.headerText || showHeaderFooterEditor) && (
                <div className="relative z-10 flex items-center justify-between border-b border-zinc-200 pb-2 mb-4 text-[11px] text-zinc-400">
                  <span>{pageSetup.headerText || activeDoc?.title}</span>
                  <span>ConnectLn Docs</span>
                </div>
              )}

              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                spellCheck={spellcheckEnabled}
                onInput={handleEditorInput}
                onMouseUp={handleEditorMouseUp}
                onKeyUp={saveSelectionRange}
                onBlur={saveSelectionRange}
                style={{
                  fontFamily,
                  lineHeight: pageSetup.lineSpacing,
                  columnCount: pageSetup.columns > 1 ? pageSetup.columns : undefined,
                  columnGap: pageSetup.columns > 1 ? "28px" : undefined,
                }}
                aria-label="ConnectLn Docs rich text editor canvas"
                className="relative z-10 flex-1 min-h-[600px] outline-none text-[#0B1F3A] prose prose-slate max-w-none [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#0B5CAD] [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-zinc-300 [&_th]:bg-zinc-100 [&_th]:px-3 [&_th]:py-1.5 [&_td]:border [&_td]:border-zinc-300 [&_td]:px-3 [&_td]:py-1.5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
              />

              {(pageSetup.footerText || pageSetup.showPageNumbers || showHeaderFooterEditor) && (
                <div className="relative z-10 flex items-center justify-between border-t border-zinc-200 pt-2 mt-6 text-[10.5px] text-zinc-400">
                  <span>{pageSetup.footerText || "ConnectLn 360 Studio"}</span>
                  {pageSetup.showPageNumbers && <span>Page 1 · {stats.estimatedPages} est.</span>}
                </div>
              )}
            </div>
          </div>

          {/* Right Review / Version History Drawer */}
          {rightPanel !== "none" && activeDoc && (
            <aside className="w-full sm:w-[290px] shrink-0 border-l border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 p-3 flex flex-col gap-3 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#E7E2DA] dark:border-zinc-800 pb-2">
                <span className="text-xs font-extrabold text-[#0B1F3A] dark:text-white">
                  {rightPanel === "comments" ? "Document Comments" : "Version History"}
                </span>
                <button type="button" onClick={() => setRightPanel("none")} className="p-1 rounded hover:bg-white cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {rightPanel === "comments" ? (
                <>
                  <div className="space-y-1.5">
                    <textarea
                      rows={2}
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      placeholder="Select text and add a review note..."
                      className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 text-xs outline-none focus:border-[#0B5CAD]"
                    />
                    <button
                      type="button"
                      onClick={handleAddComment}
                      className="w-full rounded-xl bg-[#0B5CAD] text-white py-1.5 text-xs font-bold cursor-pointer"
                    >
                      Post Comment
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(activeDoc.comments || []).map((c) => (
                      <div
                        key={c.id}
                        className={`rounded-xl border p-2.5 text-xs space-y-1 ${
                          c.resolved
                            ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 opacity-75"
                            : "border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{c.author}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                updateActiveDoc({
                                  comments: (activeDoc.comments || []).map((x) =>
                                    x.id === c.id ? { ...x, resolved: !x.resolved } : x
                                  ),
                                })
                              }
                              title="Resolve"
                              className="text-emerald-600 cursor-pointer"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateActiveDoc({
                                  comments: (activeDoc.comments || []).filter((x) => x.id !== c.id),
                                })
                              }
                              title="Delete"
                              className="text-rose-500 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        {c.quote && (
                          <p className="border-l-2 border-[#0B5CAD] pl-2 text-[11px] italic text-zinc-500 truncate">
                            “{c.quote}”
                          </p>
                        )}
                        <p>{c.text}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={snapshotDraft}
                      onChange={(e) => setSnapshotDraft(e.target.value)}
                      placeholder="Snapshot label (e.g. Client Draft v2)"
                      className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs outline-none focus:border-[#0B5CAD]"
                    />
                    <button
                      type="button"
                      onClick={handleSaveSnapshot}
                      className="w-full rounded-xl bg-[#0B5CAD] text-white py-1.5 text-xs font-bold cursor-pointer"
                    >
                      Save Snapshot
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(activeDoc.snapshots || []).map((snap) => (
                      <div
                        key={snap.id}
                        className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold truncate">{snap.label}</span>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(snap.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              updateActiveDoc({ contentHtml: snap.contentHtml }, true)
                              notify(`Restored "${snap.label}"`)
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-[#0B5CAD] px-2 py-1 text-[11px] font-bold cursor-pointer"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Restore
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateActiveDoc({
                                snapshots: (activeDoc.snapshots || []).filter((x) => x.id !== snap.id),
                              })
                            }
                            className="text-zinc-400 hover:text-rose-600 p-1 cursor-pointer ml-auto"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </aside>
          )}
        </div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-t border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setShowStatsModal(true)} className="hover:underline font-bold cursor-pointer">
              {stats.words} words · {stats.charsWithSpaces} chars · {stats.paragraphs} paragraphs
            </button>
            <span>·</span>
            <span>{stats.readingMinutes} min read</span>
            <span>·</span>
            <span>~{stats.estimatedPages} page{stats.estimatedPages > 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{pageSetup.paperSize.toUpperCase()}</span>
            <span>·</span>
            <span className="capitalize">{pageSetup.orientation}</span>
            <span>·</span>
            <span>{zoomPct}%</span>
          </div>
        </div>
      </div>

      {/* Document Statistics Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] dark:border-zinc-800 pb-2">
              <h3 className="text-sm font-extrabold">Document Statistics</h3>
              <button type="button" onClick={() => setShowStatsModal(false)} className="p-1 rounded cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-1.5 text-xs">
              {[
                ["Estimated Pages", stats.estimatedPages],
                ["Words", stats.words],
                ["Characters (with spaces)", stats.charsWithSpaces],
                ["Characters (no spaces)", stats.charsNoSpaces],
                ["Paragraphs", stats.paragraphs],
                ["Sentences", stats.sentences],
                ["Headings", stats.headings],
                ["Reading Time", `${stats.readingMinutes} min`],
                ["Speaking Time", `${stats.speakingMinutes} min`],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">{k}</span>
                  <strong className="text-[#0B1F3A] dark:text-white">{v}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#0B1F3A] dark:text-white">
                  Choose a ConnectLn Docs Template
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Start clean or launch with structured sections, tables, and callouts.
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
              {DOC_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleCreateFromTemplate(tpl)}
                  className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/60 dark:bg-zinc-950/60 hover:border-[#0B5CAD] p-4 text-left transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold text-[#0B1F3A] dark:text-white">
                      {tpl.name}
                    </span>
                    <span className="rounded-full bg-sky-100 dark:bg-sky-900/50 px-2 py-0.5 text-[10px] font-bold text-[#0B5CAD] dark:text-sky-300">
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

      {/* Live Print Preview & Setup Modal */}
      {activeDoc && (
        <ConnectLnStudioPrintModal
          mode="docs"
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          title={activeDoc.title}
          bodyHtml={editorRef.current?.innerHTML ?? activeDoc.contentHtml}
          pageSetup={pageSetup}
          onUpdatePageSetup={updatePageSetup}
          onDownloadOpenXml={() => handleExport("docx")}
        />
      )}
    </div>
  )
}
