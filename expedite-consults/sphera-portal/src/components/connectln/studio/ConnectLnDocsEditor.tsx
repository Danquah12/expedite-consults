"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  Copy,
  Download,
  FilePlus2,
  FileText,
  Highlighter,
  ImagePlus,
  Italic,
  LayoutTemplate,
  List,
  ListOrdered,
  Minus,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Printer,
  Quote,
  Redo2,
  Search,
  Share2,
  Star,
  Strikethrough,
  Table2,
  Trash2,
  Underline,
  Undo2,
  Upload,
  X,
} from "lucide-react"
import type { UserProfile } from "@/lib/connectln-data"
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
  DOC_TEMPLATES,
  loadStudioDocs,
  saveStudioDocs,
  type DocTemplateItem,
  type StudioDocRecord,
} from "@/lib/connectln-studio-storage"

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
    const esc = line
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
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
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [docSearch, setDocSearch] = useState("")
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showFindBar, setShowFindBar] = useState(false)
  const [findTerm, setFindTerm] = useState("")
  const [replaceTerm, setReplaceTerm] = useState("")
  const [fontFamily, setFontFamily] = useState<"sans" | "serif" | "mono">("sans")
  const [zoomPct, setZoomPct] = useState<90 | 100 | 115>(100)
  const [statusNotice, setStatusNotice] = useState<string | null>(null)
  const [savedLabel, setSavedLabel] = useState("Saved locally")

  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const activeDoc = useMemo(
    () => docs.find((d) => d.id === activeDocId) || docs[0],
    [docs, activeDocId]
  )

  useEffect(() => {
    saveStudioDocs(user, docs)
  }, [docs, user])

  // Sync uncontrolled contentEditable ONLY when switching document or applying template/replace
  useEffect(() => {
    if (!editorRef.current || !activeDoc) return
    editorRef.current.innerHTML = sanitizeSafeHtml(activeDoc.contentHtml)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDocId, editorRevision])

  const notify = (msg: string) => {
    setStatusNotice(msg)
    setTimeout(() => {
      setStatusNotice((prev) => (prev === msg ? null : prev))
    }, 3200)
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

  const handleEditorInput = () => {
    if (!editorRef.current || !activeDoc) return
    const rawHtml = editorRef.current.innerHTML
    updateActiveDoc({ contentHtml: rawHtml })
  }

  const execCmd = (command: string, value?: string) => {
    if (typeof document === "undefined") return
    editorRef.current?.focus()
    try {
      document.execCommand(command, false, value)
    } catch {
      // ignore unsupported browser command
    }
    handleEditorInput()
  }

  const insertHtmlSnippet = (html: string) => {
    editorRef.current?.focus()
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

  const handleExport = (kind: "docx" | "html" | "md" | "print") => {
    if (!activeDoc) return
    setShowExportMenu(false)
    const html = editorRef.current?.innerHTML ?? activeDoc.contentHtml
    const slug = safeSlug(activeDoc.title)

    if (kind === "docx") {
      const bytes = buildDocxBytes(activeDoc.title, html)
      downloadStudioFile(
        bytes,
        `${slug}.docx`,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
      notify(`Exported ${slug}.docx`)
      return
    }
    if (kind === "html") {
      const docHtml = buildStandaloneHtmlDocument(activeDoc.title, html)
      downloadStudioFile(docHtml, `${slug}.html`, "text/html;charset=utf-8")
      notify(`Exported ${slug}.html`)
      return
    }
    if (kind === "md") {
      const md = htmlToMarkdown(html)
      downloadStudioFile(md, `${slug}.md`, "text/markdown;charset=utf-8")
      notify(`Exported ${slug}.md`)
      return
    }
    if (kind === "print") {
      const win = window.open("", "_blank", "width=920,height=740")
      if (!win) {
        notify("Allow pop-ups to print or save as PDF")
        return
      }
      win.document.write(buildStandaloneHtmlDocument(activeDoc.title, html))
      win.document.close()
      win.focus()
      setTimeout(() => win.print(), 250)
    }
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
      content: b.text,
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

  const stats = useMemo(() => {
    const plain = stripHtmlForStats(activeDoc?.contentHtml || "")
    const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0
    const chars = plain.length
    const readMin = Math.max(1, Math.ceil(words / 200))
    return { words, chars, readMin }
  }, [activeDoc?.contentHtml])

  const filteredDocs = useMemo(() => {
    const q = docSearch.trim().toLowerCase()
    const list = q
      ? docs.filter(
          (d) => d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
        )
      : docs
    return [...list].sort((a, b) => Number(Boolean(b.starred)) - Number(Boolean(a.starred)))
  }, [docs, docSearch])

  const fontClass =
    fontFamily === "serif"
      ? "font-serif"
      : fontFamily === "mono"
      ? "font-mono text-[14px]"
      : "font-sans"

  return (
    <div className="flex flex-col lg:flex-row rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm min-h-[760px]">
      {/* Left Document Library Sidebar */}
      {sidebarOpen && (
        <aside className="w-full lg:w-[270px] shrink-0 border-b lg:border-b-0 lg:border-r border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/80 dark:bg-zinc-950/60 flex flex-col">
          <div className="p-3 border-b border-[#E7E2DA] dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0B5CAD] dark:text-sky-400 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                My Documents ({docs.length})
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowTemplatesModal(true)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#0B5CAD] hover:bg-[#094a8d] text-white px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                >
                  <FilePlus2 className="h-3.5 w-3.5" />
                  New
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  title="Collapse document sidebar"
                  className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 cursor-pointer lg:hidden"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </div>
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

          <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[260px] lg:max-h-none">
            {filteredDocs.map((doc) => {
              const isSelected = activeDoc?.id === doc.id
              return (
                <div
                  key={doc.id}
                  className={`group rounded-xl border p-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#0B5CAD] bg-white dark:bg-zinc-900 shadow-xs"
                      : "border-transparent hover:border-[#E7E2DA] hover:bg-white/70 dark:hover:bg-zinc-900/60"
                  }`}
                  onClick={() => {
                    setActiveDocId(doc.id)
                    setEditorRevision((r) => r + 1)
                  }}
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
                        className="p-1 rounded text-zinc-400 hover:text-[#0B5CAD] hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 group-hover:opacity-100 cursor-pointer"
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
                        className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 cursor-pointer"
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
        {/* Document Header + Export / Share Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900">
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
              className="min-w-[160px] flex-1 max-w-md rounded-lg border border-transparent hover:border-[#E7E2DA] focus:border-[#0B5CAD] bg-transparent px-2 py-1 text-sm sm:text-base font-extrabold text-[#0B1F3A] dark:text-white outline-none"
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
              onClick={() => setShowFindBar((v) => !v)}
              className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold cursor-pointer ${
                showFindBar
                  ? "border-[#0B5CAD] bg-sky-50 text-[#0B5CAD]"
                  : "border-[#E7E2DA] dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-[#FAF7F2] dark:hover:bg-zinc-800"
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Find</span>
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
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#0B1F3A] dark:text-zinc-100 hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <span>Standard Document (.docx)</span>
                    <span className="text-[10px] font-mono text-[#0B5CAD]">OpenXML</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("html")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#0B1F3A] dark:text-zinc-100 hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <span>Web Page (.html)</span>
                    <span className="text-[10px] font-mono text-zinc-400">HTML5</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("md")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#0B1F3A] dark:text-zinc-100 hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <span>Markdown (.md)</span>
                    <span className="text-[10px] font-mono text-zinc-400">Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("print")}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#0B1F3A] dark:text-zinc-100 hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
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

        {/* Rich Formatting Ribbon */}
        <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950/70">
          <button
            type="button"
            onClick={() => execCmd("undo")}
            title="Undo"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 cursor-pointer"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("redo")}
            title="Redo"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 cursor-pointer"
          >
            <Redo2 className="h-4 w-4" />
          </button>

          <span className="h-5 w-px bg-[#E7E2DA] dark:bg-zinc-700 mx-1" />

          <select
            aria-label="Paragraph style"
            defaultValue="p"
            onChange={(e) => execCmd("formatBlock", e.target.value)}
            className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs font-semibold text-[#0B1F3A] dark:text-zinc-100 cursor-pointer"
          >
            <option value="p">Body Text</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="blockquote">Blockquote</option>
          </select>

          <select
            aria-label="Font family"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value as "sans" | "serif" | "mono")}
            className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs font-semibold text-[#0B1F3A] dark:text-zinc-100 cursor-pointer"
          >
            <option value="sans">Modern Sans</option>
            <option value="serif">Editorial Serif</option>
            <option value="mono">Technical Mono</option>
          </select>

          <span className="h-5 w-px bg-[#E7E2DA] dark:bg-zinc-700 mx-1" />

          <button type="button" onClick={() => execCmd("bold")} title="Bold" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
            <Bold className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => execCmd("italic")} title="Italic" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
            <Italic className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => execCmd("underline")} title="Underline" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
            <Underline className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => execCmd("strikeThrough")} title="Strikethrough" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
            <Strikethrough className="h-4 w-4" />
          </button>

          <label title="Text color" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-0.5">
            <Palette className="h-4 w-4 text-[#0B5CAD]" />
            <input
              type="color"
              defaultValue="#0B1F3A"
              onChange={(e) => execCmd("foreColor", e.target.value)}
              className="h-4 w-4 p-0 border-0 bg-transparent cursor-pointer"
            />
          </label>
          <label title="Highlight color" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-0.5">
            <Highlighter className="h-4 w-4 text-amber-600" />
            <input
              type="color"
              defaultValue="#FEF08A"
              onChange={(e) => execCmd("hiliteColor", e.target.value)}
              className="h-4 w-4 p-0 border-0 bg-transparent cursor-pointer"
            />
          </label>

          <span className="h-5 w-px bg-[#E7E2DA] dark:bg-zinc-700 mx-1" />

          <button type="button" onClick={() => execCmd("justifyLeft")} title="Align Left" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
            <AlignLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => execCmd("justifyCenter")} title="Align Center" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
            <AlignCenter className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => execCmd("justifyRight")} title="Align Right" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
            <AlignRight className="h-4 w-4" />
          </button>

          <span className="h-5 w-px bg-[#E7E2DA] dark:bg-zinc-700 mx-1" />

          <button type="button" onClick={() => execCmd("insertUnorderedList")} title="Bullet List" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
            <List className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => execCmd("insertOrderedList")} title="Numbered List" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertHtmlSnippet("<ul><li>[ ] Action item — owner &amp; due date</li></ul>")}
            title="Insert Checklist Item"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
          >
            <CheckSquare className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              insertHtmlSnippet(
                '<table style="width:100%;border-collapse:collapse;margin:12px 0;"><tr><th style="border:1px solid #cbd5e1;padding:8px;background:#f1f5f9;">Item</th><th style="border:1px solid #cbd5e1;padding:8px;background:#f1f5f9;">Owner</th><th style="border:1px solid #cbd5e1;padding:8px;background:#f1f5f9;">Status</th></tr><tr><td style="border:1px solid #cbd5e1;padding:8px;">Deliverable 1</td><td style="border:1px solid #cbd5e1;padding:8px;">Team Lead</td><td style="border:1px solid #cbd5e1;padding:8px;">Planned</td></tr></table><p></p>'
              )
            }
            title="Insert Table"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
          >
            <Table2 className="h-3.5 w-3.5 text-[#0B5CAD]" />
            <span className="hidden md:inline">Table</span>
          </button>
          <button
            type="button"
            onClick={() =>
              insertHtmlSnippet(
                '<blockquote style="border-left:4px solid #0B5CAD;background:#f0f6ff;padding:10px 14px;border-radius:0 8px 8px 0;margin:12px 0;">Key callout note: Add summary highlight here.</blockquote><p></p>'
              )
            }
            title="Insert Callout Quote"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
          >
            <Quote className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("insertHorizontalRule")}
            title="Insert Divider"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            title="Insert Image"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
          >
            <ImagePlus className="h-3.5 w-3.5 text-[#0B5CAD]" />
            <span className="hidden md:inline">Image</span>
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleInsertImageFile}
            className="hidden"
          />
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

        {/* Paper Canvas Stage */}
        <div className="flex-1 overflow-y-auto bg-[#EFECE6] dark:bg-zinc-950 p-4 sm:p-8">
          <div
            style={{ zoom: `${zoomPct}%` }}
            className={`mx-auto max-w-[816px] min-h-[760px] rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 sm:px-14 py-10 sm:py-12 shadow-[0_12px_40px_rgba(11,31,58,0.08)] ${fontClass}`}
          >
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              aria-label="ConnectLn Docs rich text editor canvas"
              className="min-h-[640px] outline-none text-[#0B1F3A] dark:text-zinc-100 leading-relaxed prose prose-slate dark:prose-invert max-w-none [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#0B5CAD] [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-zinc-300 [&_th]:bg-zinc-100 [&_th]:dark:bg-zinc-800 [&_th]:px-3 [&_th]:py-1.5 [&_td]:border [&_td]:border-zinc-300 [&_td]:px-3 [&_td]:py-1.5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
            />
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-t border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <span>{stats.words} words</span>
            <span>·</span>
            <span>{stats.chars} characters</span>
            <span>·</span>
            <span>{stats.readMin} min read</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Zoom:</span>
            {([90, 100, 115] as const).map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setZoomPct(pct)}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                  zoomPct === pct
                    ? "bg-[#0B5CAD] text-white"
                    : "hover:bg-white dark:hover:bg-zinc-800"
                }`}
              >
                {pct}%
              </button>
            ))}
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
    </div>
  )
}
