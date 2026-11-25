"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Copy,
  Download,
  FilePlus2,
  Kanban,
  LayoutTemplate,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Printer,
  Search,
  Send,
  Share2,
  Star,
  Trash2,
  Unlock,
  X,
} from "lucide-react"
import type { UserProfile } from "@/lib/connectln-data"
import {
  buildTasksFromFormResponses,
  computeFormAnalytics,
  exportFormResponsesToCsv,
  FORM_TEMPLATES,
  generateFormCode,
  loadForms,
  saveForms,
  validateFormSubmission,
  type FormField,
  type FormFieldType,
  type FormRecord,
  type FormResponseRecord,
  type FormTemplateItem,
} from "@/lib/connectln-forms-storage"
import {
  buildPrintableFormHtml,
  buildXlsxBytes,
  downloadStudioFile,
  type PrintableFormInput,
  type SheetExportCell,
} from "@/lib/connectln-studio-export"
import type { StudioSharePayload } from "./ConnectLnDocsEditor"
import { ConnectLnStudioPrintModal } from "./ConnectLnStudioPrintModal"

interface ConnectLnFormsAppProps {
  user: UserProfile
  onSendResponsesToBoards?: (payload: {
    boardTitle: string
    tasks: Array<{ title: string; description: string; assignee?: string; tags?: string[] }>
  }) => void
  onShareToFeed?: (payload: StudioSharePayload) => void
}

type FormsTab = "builder" | "fill" | "analytics"

const FIELD_TYPES: Array<{ type: FormFieldType; label: string }> = [
  { type: "short_text", label: "Short Text" },
  { type: "long_text", label: "Long Text" },
  { type: "email", label: "Email" },
  { type: "number", label: "Number" },
  { type: "select", label: "Dropdown" },
  { type: "checkbox", label: "Checkboxes" },
  { type: "rating", label: "1–5 Rating" },
  { type: "date", label: "Date" },
]

export function ConnectLnFormsApp({
  user,
  onSendResponsesToBoards,
  onShareToFeed,
}: ConnectLnFormsAppProps) {
  const [forms, setForms] = useState<FormRecord[]>(() => loadForms(user))
  const [activeFormId, setActiveFormId] = useState<string>(() => forms[0]?.id || "")
  const [activeTab, setActiveTab] = useState<FormsTab>("builder")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [statusNotice, setStatusNotice] = useState<string | null>(null)
  const [savedLabel, setSavedLabel] = useState("Saved")

  // Live Fill & Test Form state
  const [respondentName, setRespondentName] = useState(user.name || "ConnectLn Respondent")
  const [formAnswers, setFormAnswers] = useState<Record<string, string | number | boolean>>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null)

  const notify = (msg: string) => {
    setStatusNotice(msg)
    setTimeout(() => setStatusNotice((prev) => (prev === msg ? null : prev)), 4000)
  }

  useEffect(() => {
    setSavedLabel("Saving...")
    const timer = setTimeout(() => {
      saveForms(user, forms)
      setSavedLabel("Saved cleanly")
    }, 200)
    return () => clearTimeout(timer)
  }, [forms, user])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault()
        setShowPrintModal(true)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const activeForm = useMemo(
    () => forms.find((f) => f.id === activeFormId) || forms[0] || null,
    [forms, activeFormId]
  )

  const analytics = useMemo(
    () => (activeForm ? computeFormAnalytics(activeForm) : null),
    [activeForm]
  )

  const printableForm: PrintableFormInput | null = useMemo(() => {
    if (!activeForm || !analytics) return null
    return {
      formCode: activeForm.formCode,
      title: activeForm.title,
      category: activeForm.category,
      description: activeForm.description,
      isOpen: activeForm.isOpen,
      fields: activeForm.fields,
      responses: activeForm.responses,
      analytics: {
        totalResponses: analytics.totalResponses,
        completionRatePct: analytics.completionRatePct,
        averageRating: analytics.averageRating,
      },
    }
  }, [activeForm, analytics])

  const filteredForms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return forms
    return forms.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.formCode.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    )
  }, [forms, searchQuery])

  const updateActiveForm = (patch: Partial<FormRecord>) => {
    if (!activeForm) return
    const nowIso = new Date().toISOString()
    setForms((prev) =>
      prev.map((f) => (f.id === activeForm.id ? { ...f, ...patch, updatedAt: nowIso } : f))
    )
  }

  const handleCreateBlankForm = () => {
    const nowIso = new Date().toISOString()
    const created: FormRecord = {
      id: `frm_${Date.now()}`,
      formCode: generateFormCode(),
      title: `New ConnectLn Form ${forms.length + 1}`,
      category: "Intake & Survey",
      description: "Collect structured client intake details, approvals, and feedback.",
      isOpen: true,
      fields: [
        {
          id: `fld_${Date.now()}_1`,
          label: "Full Name or Organization",
          type: "short_text",
          required: true,
          placeholder: "Your name or company",
        },
        {
          id: `fld_${Date.now()}_2`,
          label: "Contact Email",
          type: "email",
          required: true,
          placeholder: "name@company.com",
        },
      ],
      responses: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    }
    setForms((prev) => [created, ...prev])
    setActiveFormId(created.id)
    setFormAnswers({})
    setValidationErrors([])
    setSubmittedNotice(null)
    notify(`Created ${created.formCode}`)
  }

  const handleCreateFromTemplate = (tpl: FormTemplateItem) => {
    const nowIso = new Date().toISOString()
    const created: FormRecord = {
      id: `frm_${Date.now()}`,
      formCode: generateFormCode(),
      title: tpl.name,
      category: tpl.category,
      description: tpl.description,
      isOpen: true,
      fields: tpl.fields.map((f, idx) => ({
        ...f,
        id: `fld_${Date.now()}_${idx}`,
      })),
      responses: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    }
    setForms((prev) => [created, ...prev])
    setActiveFormId(created.id)
    setShowTemplatesModal(false)
    setFormAnswers({})
    setValidationErrors([])
    setSubmittedNotice(null)
    notify(`Loaded form template "${tpl.name}"`)
  }

  const handleAddField = (type: FormFieldType = "short_text") => {
    if (!activeForm) return
    const typeLabel = FIELD_TYPES.find((t) => t.type === type)?.label || "Question"
    const nextField: FormField = {
      id: `fld_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      label: `New ${typeLabel} Question ${activeForm.fields.length + 1}`,
      type,
      required: false,
      placeholder: "Enter response...",
      options: type === "select" ? ["Option A", "Option B", "Option C"] : undefined,
    }
    updateActiveForm({ fields: [...activeForm.fields, nextField] })
    notify(`Added ${typeLabel} field`)
  }

  const handleUpdateField = (fieldId: string, patch: Partial<FormField>) => {
    if (!activeForm) return
    updateActiveForm({
      fields: activeForm.fields.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)),
    })
  }

  const handleMoveField = (idx: number, delta: -1 | 1) => {
    if (!activeForm) return
    const next = [...activeForm.fields]
    const targetIdx = idx + delta
    if (targetIdx < 0 || targetIdx >= next.length) return
    const tmp = next[idx]
    next[idx] = next[targetIdx]
    next[targetIdx] = tmp
    updateActiveForm({ fields: next })
  }

  const handleSubmitTestResponse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeForm) return
    const check = validateFormSubmission(activeForm, formAnswers)
    if (!check.valid) {
      setValidationErrors(check.errors)
      setSubmittedNotice(null)
      return
    }

    const createdResp: FormResponseRecord = {
      id: `resp_${Date.now()}`,
      submittedAt: new Date().toISOString(),
      respondentName: respondentName.trim() || "ConnectLn Member",
      answers: { ...formAnswers },
    }
    updateActiveForm({ responses: [...activeForm.responses, createdResp] })
    setValidationErrors([])
    setSubmittedNotice(`Response Recorded (${activeForm.responses.length + 1} total)`)
    setFormAnswers({})
    notify(`Response submitted cleanly to ${activeForm.formCode}`)
  }

  const handleCopyShareLink = async () => {
    if (!activeForm) return
    const link = `${window.location.origin}/connectin?tab=forms&form=${encodeURIComponent(
      activeForm.formCode
    )}`
    try {
      await navigator.clipboard.writeText(link)
      notify("Copied ConnectLn Forms share link!")
    } catch {
      notify(`Share URL: ${link}`)
    }
  }

  const handleSendToBoards = () => {
    if (!activeForm || !onSendResponsesToBoards) return
    onSendResponsesToBoards({
      boardTitle: `${activeForm.title} — Intake Board`,
      tasks: buildTasksFromFormResponses(activeForm),
    })
  }

  const handleExport = (fmt: "xlsx" | "csv" | "html" | "print") => {
    setShowExportMenu(false)
    if (!activeForm || !printableForm) return
    const slug = (activeForm.formCode || "connectln-form").toLowerCase()
    if (fmt === "print") {
      setShowPrintModal(true)
      return
    }
    if (fmt === "html") {
      downloadStudioFile(
        buildPrintableFormHtml(printableForm, { viewMode: "summary" }),
        `${slug}-summary.html`,
        "text/html;charset=utf-8"
      )
      notify(`Exported ${slug}-summary.html`)
      return
    }
    if (fmt === "csv") {
      downloadStudioFile(exportFormResponsesToCsv(activeForm), `${slug}-responses.csv`, "text/csv;charset=utf-8")
      notify(`Exported ${slug}-responses.csv`)
      return
    }

    const cells: Record<string, SheetExportCell> = {
      A1: { raw: "Respondent" },
      B1: { raw: "Submitted At" },
    }
    activeForm.fields.slice(0, 5).forEach((f, cIdx) => {
      const colChar = String.fromCharCode(67 + cIdx)
      cells[`${colChar}1`] = { raw: f.label }
    })
    activeForm.responses.forEach((resp, rIdx) => {
      const r = rIdx + 2
      cells[`A${r}`] = { raw: resp.respondentName }
      cells[`B${r}`] = { raw: resp.submittedAt.slice(0, 10) }
      activeForm.fields.slice(0, 5).forEach((f, cIdx) => {
        const colChar = String.fromCharCode(67 + cIdx)
        const v = resp.answers[f.id]
        if (typeof v === "number") {
          cells[`${colChar}${r}`] = { raw: String(v), isNumeric: true, evaluated: v }
        } else {
          cells[`${colChar}${r}`] = { raw: typeof v === "boolean" ? (v ? "Yes" : "No") : String(v ?? "") }
        }
      })
    })
    const bytes = buildXlsxBytes(activeForm.title || "ConnectLn Form", [
      {
        name: "Form Responses",
        rowCount: Math.max(15, activeForm.responses.length + 5),
        colCount: 8,
        cells,
      },
    ])
    downloadStudioFile(
      bytes,
      `${slug}-responses.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    notify(`Exported ${slug}-responses.xlsx`)
  }

  const handleShareMilestone = () => {
    if (!activeForm || !analytics || !onShareToFeed) return
    onShareToFeed({
      title: `${activeForm.title} (${activeForm.formCode})`,
      summary: `Live intake/survey published in ConnectLn Forms: ${activeForm.fields.length} question(s) · ${analytics.totalResponses} recorded response(s).`,
      appLabel: "ConnectLn Forms",
    })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-3 min-h-[760px]">
      {/* Left Forms Sidebar */}
      {sidebarOpen && (
        <aside className="w-full lg:w-72 shrink-0 rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[#E7E2DA] dark:border-zinc-800 space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={handleCreateBlankForm}
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#9333EA] hover:bg-[#7E22CE] text-white px-2.5 py-2 text-xs font-bold shadow-xs cursor-pointer"
              >
                <FilePlus2 className="h-3.5 w-3.5" />
                New Form
              </button>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(true)}
                className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2 text-xs font-bold text-[#0B1F3A] dark:text-zinc-200 hover:border-[#9333EA] cursor-pointer"
              >
                <LayoutTemplate className="h-3.5 w-3.5 text-[#9333EA]" />
                Templates
              </button>
            </div>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search forms & surveys..."
                className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-8 pr-2.5 py-1.5 text-xs outline-none focus:border-[#9333EA]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[250px] lg:max-h-none">
            {filteredForms.map((f) => {
              const isSelected = f.id === activeForm?.id
              return (
                <div
                  key={f.id}
                  onClick={() => {
                    setActiveFormId(f.id)
                    setFormAnswers({})
                    setValidationErrors([])
                    setSubmittedNotice(null)
                  }}
                  className={`group rounded-xl border p-2.5 transition-all cursor-pointer space-y-1 ${
                    isSelected
                      ? "border-[#9333EA] bg-white dark:bg-zinc-900 shadow-xs"
                      : "border-transparent hover:border-[#E7E2DA] hover:bg-white/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <p className="text-xs font-bold text-[#0B1F3A] dark:text-zinc-100 line-clamp-1 flex-1">
                      {f.title}
                    </p>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setForms((prev) =>
                            prev.map((x) => (x.id === f.id ? { ...x, starred: !x.starred } : x))
                          )
                        }}
                        className="p-0.5 cursor-pointer"
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${
                            f.starred ? "fill-amber-400 text-amber-500" : "text-zinc-400"
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (forms.length <= 1) {
                            notify("Keep at least one form")
                            return
                          }
                          const rem = forms.filter((x) => x.id !== f.id)
                          setForms(rem)
                          if (activeFormId === f.id && rem[0]) setActiveFormId(rem[0].id)
                        }}
                        className="p-0.5 text-zinc-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span
                      className={`rounded-full px-2 py-0.5 font-extrabold uppercase ${
                        f.isOpen
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-zinc-200 text-zinc-600"
                      }`}
                    >
                      {f.isOpen ? "OPEN" : "CLOSED"}
                    </span>
                    <span className="font-bold text-[#9333EA]">
                      {f.responses.length} response(s)
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>
      )}

      {/* Main Forms Workspace */}
      <div className="flex-1 min-w-0 rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 border-b border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/60 dark:bg-zinc-950/60">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-1.5 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 hover:text-[#9333EA] cursor-pointer"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </button>
            <input
              type="text"
              aria-label="Form title"
              value={activeForm?.title || ""}
              onChange={(e) => updateActiveForm({ title: e.target.value })}
              placeholder="Form or survey title..."
              className="min-w-[160px] flex-1 max-w-md rounded-lg border border-transparent hover:border-[#E7E2DA] focus:border-[#9333EA] bg-transparent px-2 py-1 text-sm sm:text-base font-extrabold text-[#0B1F3A] dark:text-white outline-none"
            />
            {activeForm && (
              <button
                type="button"
                onClick={() => updateActiveForm({ isOpen: !activeForm.isOpen })}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase cursor-pointer ${
                  activeForm.isOpen
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : "bg-zinc-200 text-zinc-700 border-zinc-300"
                }`}
              >
                {activeForm.isOpen ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {activeForm.isOpen ? "Accepting Responses" : "Closed"}
              </button>
            )}
            <span className="hidden xl:inline-flex text-[11px] font-semibold text-zinc-500">
              {savedLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {statusNotice && (
              <span className="rounded-lg bg-purple-50 border border-purple-200 px-2.5 py-1 text-xs font-semibold text-[#9333EA]">
                {statusNotice}
              </span>
            )}

            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] bg-white px-3 py-1.5 text-xs font-bold hover:border-[#9333EA] cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5 text-[#9333EA]" />
              Copy Link
            </button>

            {onSendResponsesToBoards && (
              <button
                type="button"
                onClick={handleSendToBoards}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#B45309] bg-amber-50 hover:bg-amber-100 px-3 py-1.5 text-xs font-extrabold text-[#B45309] cursor-pointer"
              >
                <Kanban className="h-3.5 w-3.5" />
                Send to Boards
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              title="Print Blank Form or Summary Report (Ctrl+P)"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#9333EA] bg-purple-50 hover:bg-purple-100 px-3 py-1.5 text-xs font-extrabold text-[#9333EA] cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] px-3 py-1.5 text-xs font-bold hover:border-[#9333EA] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#9333EA]" />
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-10 z-30 w-56 rounded-xl border border-[#E7E2DA] bg-white dark:bg-zinc-900 p-1.5 shadow-xl space-y-1">
                  <button
                    type="button"
                    onClick={() => handleExport("xlsx")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] cursor-pointer"
                  >
                    <span>Responses Workbook (.xlsx)</span>
                    <span className="text-[10px] font-mono text-[#9333EA]">OpenXML</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("csv")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] cursor-pointer"
                  >
                    <span>Responses Data (.csv)</span>
                    <span className="text-[10px] font-mono text-zinc-400">UTF-8</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("html")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] cursor-pointer"
                  >
                    <span>Analytics Report (.html)</span>
                    <span className="text-[10px] font-mono text-zinc-400">Web</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("print")}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5 text-[#9333EA]" />
                    <span>Print / Save as PDF</span>
                  </button>
                </div>
              )}
            </div>

            {onShareToFeed && (
              <button
                type="button"
                onClick={handleShareMilestone}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0067B8] hover:bg-[#00559b] text-white px-3 py-1.5 text-xs font-bold shadow-xs cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share to Feed
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between gap-2 px-3 pt-1.5 border-b border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {(
              [
                { id: "builder", label: "Form Builder", Icon: ClipboardList },
                { id: "fill", label: "Fill & Test Form", Icon: Send },
                { id: "analytics", label: "Responses & Analytics", Icon: BarChart3 },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-1.5 rounded-t-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === id
                    ? "bg-white dark:bg-zinc-900 text-[#9333EA] dark:text-purple-300 border-t-2 border-x border-t-[#9333EA] border-x-[#E7E2DA] dark:border-x-zinc-800"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-[#0B1F3A]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
          {analytics && (
            <span className="hidden md:inline-flex text-[11px] font-bold text-[#9333EA] pb-1.5">
              {analytics.totalResponses} Responses · {analytics.completionRatePct}% Completion
            </span>
          )}
        </div>

        {/* Workspace Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#FAF7F2]/40 dark:bg-zinc-950/40">
          {/* TAB 1: FORM BUILDER */}
          {activeTab === "builder" && activeForm && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-[#9333EA]">{activeForm.formCode}</span>
                  <button
                    type="button"
                    onClick={() => handleAddField("short_text")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#9333EA] hover:bg-[#7E22CE] text-white px-3.5 py-1.5 text-xs font-extrabold cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Question
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={activeForm.description}
                  onChange={(e) => updateActiveForm({ description: e.target.value })}
                  placeholder="Form instructions shown to respondents..."
                  className="w-full rounded-xl border border-[#E7E2DA] px-3 py-2 outline-none focus:border-[#9333EA]"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {FIELD_TYPES.map((ft) => (
                    <button
                      key={ft.type}
                      type="button"
                      onClick={() => handleAddField(ft.type)}
                      className="rounded-lg border border-[#E7E2DA] bg-[#FAF7F2] hover:border-[#9333EA] px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                    >
                      + {ft.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                {activeForm.fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2.5 text-xs"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-zinc-400">#{idx + 1}</span>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                        className="flex-1 min-w-[200px] rounded-lg border border-[#E7E2DA] px-2.5 py-1.5 font-bold outline-none focus:border-[#9333EA]"
                      />
                      <select
                        value={field.type}
                        onChange={(e) =>
                          handleUpdateField(field.id, { type: e.target.value as FormFieldType })
                        }
                        className="rounded-lg border border-[#E7E2DA] px-2 py-1.5 font-bold"
                      >
                        {FIELD_TYPES.map((ft) => (
                          <option key={ft.type} value={ft.type}>
                            {ft.label}
                          </option>
                        ))}
                      </select>
                      <label className="inline-flex items-center gap-1 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) =>
                            handleUpdateField(field.id, { required: e.target.checked })
                          }
                        />
                        Required
                      </label>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveField(idx, -1)}
                        className="p-1 rounded border border-[#E7E2DA] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === activeForm.fields.length - 1}
                        onClick={() => handleMoveField(idx, 1)}
                        className="p-1 rounded border border-[#E7E2DA] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (activeForm.fields.length <= 1) {
                            notify("Keep at least one question")
                            return
                          }
                          updateActiveForm({
                            fields: activeForm.fields.filter((x) => x.id !== field.id),
                          })
                        }}
                        className="p-1 text-zinc-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {field.type === "select" && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10.5px] font-bold text-zinc-500">
                          Options (comma-separated):
                        </span>
                        <input
                          type="text"
                          value={(field.options || []).join(", ")}
                          onChange={(e) =>
                            handleUpdateField(field.id, {
                              options: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          className="flex-1 rounded-lg border border-[#E7E2DA] px-2.5 py-1"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FILL & TEST FORM */}
          {activeTab === "fill" && activeForm && (
            <form
              onSubmit={handleSubmitTestResponse}
              className="max-w-2xl mx-auto rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4 text-xs"
            >
              <div className="border-b-2 border-[#9333EA] pb-3">
                <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#9333EA]">
                  {activeForm.formCode} · Live Respondent View
                </p>
                <h2 className="text-lg font-extrabold text-[#0B1F3A] dark:text-white mt-0.5">
                  {activeForm.title}
                </h2>
                <p className="text-zinc-500 mt-1">{activeForm.description}</p>
              </div>

              {submittedNotice && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{submittedNotice}</span>
                </div>
              )}

              {validationErrors.length > 0 && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 space-y-1">
                  {validationErrors.map((err, i) => (
                    <p key={i} className="font-bold">
                      • {err}
                    </p>
                  ))}
                </div>
              )}

              <div>
                <label className="block font-bold text-[#0B1F3A] dark:text-zinc-200 mb-1">
                  Submitted By (Your Name)
                </label>
                <input
                  type="text"
                  aria-label="Respondent name"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  className="w-full rounded-xl border border-[#E7E2DA] px-3 py-2"
                />
              </div>

              {activeForm.fields.map((field) => {
                const val = formAnswers[field.id]
                return (
                  <div key={field.id} data-field-id={field.id} className="space-y-1.5">
                    <label className="block font-bold text-[#0B1F3A] dark:text-zinc-200">
                      {field.label}
                      {field.required && <span className="text-rose-600 ml-1">*</span>}
                    </label>

                    {field.type === "long_text" ? (
                      <textarea
                        rows={3}
                        aria-label={field.label}
                        value={String(val ?? "")}
                        onChange={(e) =>
                          setFormAnswers((prev) => ({ ...prev, [field.id]: e.target.value }))
                        }
                        placeholder={field.placeholder || ""}
                        className="w-full rounded-xl border border-[#E7E2DA] px-3 py-2 outline-none focus:border-[#9333EA]"
                      />
                    ) : field.type === "select" ? (
                      <select
                        aria-label={field.label}
                        value={String(val ?? "")}
                        onChange={(e) =>
                          setFormAnswers((prev) => ({ ...prev, [field.id]: e.target.value }))
                        }
                        className="w-full rounded-xl border border-[#E7E2DA] px-3 py-2 font-semibold"
                      >
                        <option value="">Select an option...</option>
                        {(field.options || []).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "checkbox" ? (
                      <label className="flex items-center gap-2 rounded-xl border border-[#E7E2DA] bg-[#FAF7F2] px-3 py-2 cursor-pointer">
                        <input
                          type="checkbox"
                          aria-label={field.label}
                          checked={Boolean(val)}
                          onChange={(e) =>
                            setFormAnswers((prev) => ({ ...prev, [field.id]: e.target.checked }))
                          }
                        />
                        <span>Yes, I confirm</span>
                      </label>
                    ) : field.type === "rating" ? (
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              setFormAnswers((prev) => ({ ...prev, [field.id]: star }))
                            }
                            className={`h-9 w-9 rounded-xl border font-extrabold cursor-pointer ${
                              Number(val) === star
                                ? "bg-[#9333EA] text-white border-[#9333EA]"
                                : "bg-white border-[#E7E2DA] hover:border-[#9333EA]"
                            }`}
                          >
                            {star}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type={
                          field.type === "email"
                            ? "email"
                            : field.type === "number"
                            ? "number"
                            : field.type === "date"
                            ? "date"
                            : "text"
                        }
                        aria-label={field.label}
                        value={String(val ?? "")}
                        onChange={(e) =>
                          setFormAnswers((prev) => ({ ...prev, [field.id]: e.target.value }))
                        }
                        placeholder={field.placeholder || ""}
                        className="w-full rounded-xl border border-[#E7E2DA] px-3 py-2 outline-none focus:border-[#9333EA]"
                      />
                    )}
                  </div>
                )
              })}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-[#9333EA] hover:bg-[#7E22CE] text-white px-5 py-2.5 text-xs font-extrabold shadow-xs cursor-pointer"
                >
                  Submit Response
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: RESPONSES & ANALYTICS */}
          {activeTab === "analytics" && activeForm && analytics && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-[#E7E2DA] bg-white dark:bg-zinc-900 p-3.5">
                  <p className="text-[10.5px] font-bold uppercase text-zinc-500">Total Responses</p>
                  <p className="text-xl font-extrabold text-[#9333EA]">
                    {analytics.totalResponses}
                  </p>
                </div>
                <div className="rounded-xl border border-[#E7E2DA] bg-white dark:bg-zinc-900 p-3.5">
                  <p className="text-[10.5px] font-bold uppercase text-zinc-500">Completion Rate</p>
                  <p className="text-xl font-extrabold text-emerald-700">
                    {analytics.completionRatePct}%
                  </p>
                </div>
                <div className="rounded-xl border border-[#E7E2DA] bg-white dark:bg-zinc-900 p-3.5">
                  <p className="text-[10.5px] font-bold uppercase text-zinc-500">Average Rating</p>
                  <p className="text-xl font-extrabold text-amber-600">
                    {analytics.averageRating !== null ? `${analytics.averageRating} / 5` : "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {analytics.fieldStats.map((fs) => (
                  <div
                    key={fs.fieldId}
                    className="rounded-2xl border border-[#E7E2DA] bg-white dark:bg-zinc-900 p-4 space-y-2"
                  >
                    <div className="flex justify-between font-bold">
                      <span>{fs.label}</span>
                      <span className="text-zinc-500">{fs.answerCount} answer(s)</span>
                    </div>
                    {fs.optionBreakdown ? (
                      <div className="space-y-1.5">
                        {fs.optionBreakdown.map((ob) => (
                          <div key={ob.option} className="space-y-0.5">
                            <div className="flex justify-between text-[11px]">
                              <span>{ob.option}</span>
                              <span className="font-mono">
                                {ob.count} ({ob.pct}%)
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                              <div
                                className="h-full bg-[#9333EA]"
                                style={{ width: `${ob.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : fs.averageRating !== undefined ? (
                      <p className="font-extrabold text-sm text-[#9333EA]">
                        Avg Score: {fs.averageRating} / 5
                      </p>
                    ) : (
                      <ul className="space-y-1 text-[11px] text-zinc-600">
                        {fs.recentValues.map((rv, idx) => (
                          <li key={idx} className="truncate">
                            • {rv}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-[#E7E2DA] bg-white dark:bg-zinc-900 p-4 overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF7F2] text-zinc-500 uppercase text-[10px]">
                      <th className="border border-[#E7E2DA] px-2.5 py-2 text-left">Respondent</th>
                      <th className="border border-[#E7E2DA] px-2.5 py-2 text-left">Submitted</th>
                      {activeForm.fields.slice(0, 4).map((f) => (
                        <th key={f.id} className="border border-[#E7E2DA] px-2.5 py-2 text-left">
                          {f.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeForm.responses.map((resp) => (
                      <tr key={resp.id}>
                        <td className="border border-[#E7E2DA] px-2.5 py-2 font-bold">
                          {resp.respondentName}
                        </td>
                        <td className="border border-[#E7E2DA] px-2.5 py-2 font-mono">
                          {resp.submittedAt.slice(0, 10)}
                        </td>
                        {activeForm.fields.slice(0, 4).map((f) => {
                          const v = resp.answers[f.id]
                          return (
                            <td key={f.id} className="border border-[#E7E2DA] px-2.5 py-2">
                              {typeof v === "boolean" ? (v ? "Yes" : "No") : String(v ?? "—")}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-[#E7E2DA] bg-white dark:bg-zinc-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-3">
              <h3 className="text-base font-extrabold text-[#0B1F3A] dark:text-white">
                ConnectLn Forms &amp; Survey Templates
              </h3>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[62vh] overflow-y-auto">
              {FORM_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleCreateFromTemplate(tpl)}
                  className="rounded-xl border border-[#E7E2DA] p-3.5 text-left hover:border-[#9333EA] hover:bg-purple-50/40 space-y-1.5 cursor-pointer"
                >
                  <span className="text-[10px] font-extrabold uppercase text-[#9333EA]">
                    {tpl.category}
                  </span>
                  <p className="text-xs font-extrabold text-[#0B1F3A] dark:text-white">
                    {tpl.name}
                  </p>
                  <p className="text-[11px] text-zinc-500">{tpl.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Print Preview Modal */}
      {printableForm && activeForm && (
        <ConnectLnStudioPrintModal
          mode="forms"
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          title={`${activeForm.title} (${activeForm.formCode})`}
          form={printableForm}
          onDownloadOpenXml={() => handleExport("xlsx")}
        />
      )}
    </div>
  )
}
