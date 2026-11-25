"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  CalendarClock,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FilePlus2,
  Kanban,
  LayoutTemplate,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Printer,
  Receipt,
  Search,
  Share2,
  Star,
  Trash2,
  X,
} from "lucide-react"
import type { UserProfile } from "@/lib/connectln-data"
import {
  BOARD_TEMPLATES,
  buildBoardBillableSheet,
  computeBoardMetrics,
  exportBoardToCsv,
  generateBoardCode,
  loadBoards,
  moveTaskToColumn,
  saveBoards,
  type BoardPriority,
  type BoardRecord,
  type BoardTaskCard,
  type BoardTemplateItem,
} from "@/lib/connectln-boards-storage"
import {
  buildPrintableBoardReportHtml,
  buildXlsxBytes,
  downloadStudioFile,
  type PrintableBoardInput,
  type SheetExportCell,
} from "@/lib/connectln-studio-export"
import type { StudioSheetTab } from "@/lib/connectln-studio-storage"
import type { StudioSharePayload } from "./ConnectLnDocsEditor"
import { ConnectLnStudioPrintModal } from "./ConnectLnStudioPrintModal"

interface ConnectLnBoardsAppProps {
  user: UserProfile
  pendingTasksFromForm?: {
    boardTitle: string
    tasks: Array<{ title: string; description: string; assignee?: string; tags?: string[] }>
  } | null
  onClearPendingTasks?: () => void
  onBillToInvoice?: (payload: { workbookTitle: string; sheet: StudioSheetTab }) => void
  onShareToFeed?: (payload: StudioSharePayload) => void
}

type BoardsTab = "kanban" | "table" | "timeline"

function priorityBadgeClasses(priority: BoardPriority): string {
  if (priority === "urgent") return "bg-rose-100 text-rose-800 border-rose-200"
  if (priority === "high") return "bg-amber-100 text-amber-800 border-amber-200"
  if (priority === "medium") return "bg-sky-100 text-sky-800 border-sky-200"
  return "bg-zinc-100 text-zinc-700 border-zinc-200"
}

export function ConnectLnBoardsApp({
  user,
  pendingTasksFromForm,
  onClearPendingTasks,
  onBillToInvoice,
  onShareToFeed,
}: ConnectLnBoardsAppProps) {
  const [boards, setBoards] = useState<BoardRecord[]>(() => loadBoards(user))
  const [activeBoardId, setActiveBoardId] = useState<string>(() => boards[0]?.id || "")
  const [activeTabView, setActiveTabView] = useState<BoardsTab>("kanban")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [statusNotice, setStatusNotice] = useState<string | null>(null)
  const [savedLabel, setSavedLabel] = useState("Saved")

  // Task Editor Modal state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [taskDraftTitle, setTaskDraftTitle] = useState("")
  const [taskDraftDesc, setTaskDraftDesc] = useState("")
  const [taskDraftColId, setTaskDraftColId] = useState("")
  const [taskDraftPriority, setTaskDraftPriority] = useState<BoardPriority>("medium")
  const [taskDraftAssignee, setTaskDraftAssignee] = useState("")
  const [taskDraftDue, setTaskDraftDue] = useState("")
  const [taskDraftEstHours, setTaskDraftEstHours] = useState("4")
  const [taskDraftLoggedHours, setTaskDraftLoggedHours] = useState("2")
  const [taskDraftRate, setTaskDraftRate] = useState("150")
  const [taskDraftBillable, setTaskDraftBillable] = useState(true)
  const [taskDraftChecklist, setTaskDraftChecklist] = useState<
    Array<{ id: string; text: string; done: boolean }>
  >([])
  const [newChecklistText, setNewChecklistText] = useState("")

  const notify = (msg: string) => {
    setStatusNotice(msg)
    setTimeout(() => setStatusNotice((prev) => (prev === msg ? null : prev)), 4000)
  }

  useEffect(() => {
    setSavedLabel("Saving...")
    const timer = setTimeout(() => {
      saveBoards(user, boards)
      setSavedLabel("Saved cleanly")
    }, 200)
    return () => clearTimeout(timer)
  }, [boards, user])

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

  // Handle 1-click Send to Boards from ConnectLn Forms
  useEffect(() => {
    if (!pendingTasksFromForm || pendingTasksFromForm.tasks.length === 0) return
    const nowIso = new Date().toISOString()
    const due = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
    const created: BoardRecord = {
      id: `brd_intake_${Date.now()}`,
      boardCode: generateBoardCode(),
      title: pendingTasksFromForm.boardTitle || "Forms Intake Triage Board",
      category: "Forms Intake",
      clientOrTeam: user.name ? `${user.name} Operations` : "ConnectLn Operations",
      columns: [
        { id: "col_intake", title: "New Intake", colorHex: "#9333EA" },
        { id: "col_progress", title: "In Progress", colorHex: "#0B5CAD" },
        { id: "col_review", title: "Review", colorHex: "#B45309" },
        { id: "col_done", title: "Done", colorHex: "#107C41" },
      ],
      tasks: pendingTasksFromForm.tasks.map((t, idx) => ({
        id: `t_frm_${Date.now()}_${idx}`,
        code: `FRM-${101 + idx}`,
        columnId: "col_intake",
        title: t.title,
        description: t.description,
        priority: "high",
        assignee: t.assignee || user.name || "Owner",
        dueDate: due,
        estimatedHours: 3,
        loggedHours: 0,
        hourlyRate: 150,
        billable: true,
        tags: t.tags || ["Forms"],
        checklist: [{ id: `chk_${idx}`, text: "Initial intake triage complete", done: false }],
        createdAt: nowIso,
        updatedAt: nowIso,
      })),
      createdAt: nowIso,
      updatedAt: nowIso,
    }
    setBoards((prev) => [created, ...prev])
    setActiveBoardId(created.id)
    setActiveTabView("kanban")
    notify(`Created board "${created.title}" with ${created.tasks.length} intake task(s)`)
    onClearPendingTasks?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTasksFromForm])

  const activeBoard = useMemo(
    () => boards.find((b) => b.id === activeBoardId) || boards[0] || null,
    [boards, activeBoardId]
  )

  const metrics = useMemo(
    () => (activeBoard ? computeBoardMetrics(activeBoard) : null),
    [activeBoard]
  )

  const printableBoard: PrintableBoardInput | null = useMemo(() => {
    if (!activeBoard || !metrics) return null
    return {
      boardCode: activeBoard.boardCode,
      title: activeBoard.title,
      category: activeBoard.category,
      clientOrTeam: activeBoard.clientOrTeam,
      columns: activeBoard.columns,
      tasks: activeBoard.tasks,
      metrics,
    }
  }, [activeBoard, metrics])

  const filteredBoards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return boards
    return boards.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.boardCode.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
    )
  }, [boards, searchQuery])

  const updateActiveBoard = (patch: Partial<BoardRecord>) => {
    if (!activeBoard) return
    const nowIso = new Date().toISOString()
    setBoards((prev) =>
      prev.map((b) => (b.id === activeBoard.id ? { ...b, ...patch, updatedAt: nowIso } : b))
    )
  }

  const handleCreateBlankBoard = () => {
    const nowIso = new Date().toISOString()
    const created: BoardRecord = {
      id: `brd_${Date.now()}`,
      boardCode: generateBoardCode(),
      title: `Project Delivery Board ${boards.length + 1}`,
      category: "Operations",
      clientOrTeam: user.name ? `${user.name} Team` : "ConnectLn Delivery",
      columns: [
        { id: "col_todo", title: "Backlog", colorHex: "#64748B" },
        { id: "col_doing", title: "In Progress", colorHex: "#0B5CAD", wipLimit: 4 },
        { id: "col_review", title: "Review", colorHex: "#B45309" },
        { id: "col_done", title: "Done", colorHex: "#107C41" },
      ],
      tasks: [
        {
          id: `t_${Date.now()}`,
          code: "TSK-101",
          columnId: "col_todo",
          title: "Scope Deliverables & Assign Milestone Owners",
          description: "Break deliverables into sprint tasks and set target due dates.",
          priority: "medium",
          assignee: user.name || "Project Lead",
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
          estimatedHours: 4,
          loggedHours: 0,
          hourlyRate: 150,
          billable: true,
          tags: ["Kickoff"],
          checklist: [{ id: "c_new_1", text: "Confirm target schedule", done: false }],
          createdAt: nowIso,
          updatedAt: nowIso,
        },
      ],
      createdAt: nowIso,
      updatedAt: nowIso,
    }
    setBoards((prev) => [created, ...prev])
    setActiveBoardId(created.id)
    notify(`Created ${created.boardCode}`)
  }

  const handleCreateFromTemplate = (tpl: BoardTemplateItem) => {
    const nowIso = new Date().toISOString()
    const created: BoardRecord = {
      id: `brd_${Date.now()}`,
      boardCode: generateBoardCode(),
      title: tpl.name,
      category: tpl.category,
      clientOrTeam: user.name ? `${user.name} Workspace` : "ConnectLn Team",
      columns: tpl.columns.map((c) => ({ ...c })),
      tasks: tpl.tasks.map((t, idx) => ({
        ...t,
        id: `t_${Date.now()}_${idx}`,
        checklist: t.checklist.map((c) => ({ ...c })),
        createdAt: nowIso,
        updatedAt: nowIso,
      })),
      createdAt: nowIso,
      updatedAt: nowIso,
    }
    setBoards((prev) => [created, ...prev])
    setActiveBoardId(created.id)
    setShowTemplatesModal(false)
    notify(`Loaded board template "${tpl.name}"`)
  }

  const openNewTaskModal = (colId?: string) => {
    if (!activeBoard) return
    setIsCreatingTask(true)
    setEditingTaskId(`new_${Date.now()}`)
    setTaskDraftTitle("")
    setTaskDraftDesc("")
    setTaskDraftColId(colId || activeBoard.columns[0]?.id || "")
    setTaskDraftPriority("high")
    setTaskDraftAssignee(user.name || "Lead Specialist")
    setTaskDraftDue(new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10))
    setTaskDraftEstHours("6")
    setTaskDraftLoggedHours("2")
    setTaskDraftRate("175")
    setTaskDraftBillable(true)
    setTaskDraftChecklist([])
    setNewChecklistText("")
  }

  const openEditTaskModal = (task: BoardTaskCard) => {
    setIsCreatingTask(false)
    setEditingTaskId(task.id)
    setTaskDraftTitle(task.title)
    setTaskDraftDesc(task.description)
    setTaskDraftColId(task.columnId)
    setTaskDraftPriority(task.priority)
    setTaskDraftAssignee(task.assignee)
    setTaskDraftDue(task.dueDate)
    setTaskDraftEstHours(String(task.estimatedHours))
    setTaskDraftLoggedHours(String(task.loggedHours))
    setTaskDraftRate(String(task.hourlyRate))
    setTaskDraftBillable(task.billable)
    setTaskDraftChecklist(task.checklist.map((c) => ({ ...c })))
    setNewChecklistText("")
  }

  const handleSaveTask = () => {
    if (!activeBoard || !editingTaskId) return
    const titleTrim = taskDraftTitle.trim() || "Deliverable Task"
    const nowIso = new Date().toISOString()
    const nextTask: BoardTaskCard = {
      id: isCreatingTask ? `task_${Date.now()}` : editingTaskId,
      code: isCreatingTask
        ? `TSK-${101 + activeBoard.tasks.length}`
        : activeBoard.tasks.find((t) => t.id === editingTaskId)?.code || "TSK-100",
      columnId: taskDraftColId || activeBoard.columns[0]?.id || "col_todo",
      title: titleTrim,
      description: taskDraftDesc.trim(),
      priority: taskDraftPriority,
      assignee: taskDraftAssignee.trim() || "Owner",
      dueDate: taskDraftDue,
      estimatedHours: Math.max(0, Number.parseFloat(taskDraftEstHours) || 0),
      loggedHours: Math.max(0, Number.parseFloat(taskDraftLoggedHours) || 0),
      hourlyRate: Math.max(0, Number.parseFloat(taskDraftRate) || 0),
      billable: taskDraftBillable,
      tags: isCreatingTask
        ? ["Active"]
        : activeBoard.tasks.find((t) => t.id === editingTaskId)?.tags || [],
      checklist: taskDraftChecklist,
      createdAt: nowIso,
      updatedAt: nowIso,
    }

    if (isCreatingTask) {
      updateActiveBoard({ tasks: [...activeBoard.tasks, nextTask] })
      notify(`Added task "${nextTask.title}"`)
    } else {
      updateActiveBoard({
        tasks: activeBoard.tasks.map((t) => (t.id === editingTaskId ? nextTask : t)),
      })
      notify(`Updated task "${nextTask.title}"`)
    }
    setEditingTaskId(null)
  }

  const handleMoveStage = (task: BoardTaskCard, delta: -1 | 1) => {
    if (!activeBoard) return
    const idx = activeBoard.columns.findIndex((c) => c.id === task.columnId)
    const targetCol = activeBoard.columns[idx + delta]
    if (!targetCol) return
    const updated = moveTaskToColumn(activeBoard, task.id, targetCol.id)
    updateActiveBoard({ tasks: updated.tasks })
    notify(`Moved "${task.title}" → ${targetCol.title}`)
  }

  const handleBillToInvoice = () => {
    if (!activeBoard || !onBillToInvoice) return
    onBillToInvoice(buildBoardBillableSheet(activeBoard))
  }

  const handleExport = (fmt: "xlsx" | "csv" | "html" | "print") => {
    setShowExportMenu(false)
    if (!activeBoard || !printableBoard) return
    const slug = (activeBoard.boardCode || "connectln-board").toLowerCase()
    if (fmt === "print") {
      setShowPrintModal(true)
      return
    }
    if (fmt === "html") {
      downloadStudioFile(
        buildPrintableBoardReportHtml(printableBoard, { includeChecklists: true }),
        `${slug}-report.html`,
        "text/html;charset=utf-8"
      )
      notify(`Exported ${slug}-report.html`)
      return
    }
    if (fmt === "csv") {
      downloadStudioFile(exportBoardToCsv(activeBoard), `${slug}.csv`, "text/csv;charset=utf-8")
      notify(`Exported ${slug}.csv`)
      return
    }

    const colNameById = new Map(activeBoard.columns.map((c) => [c.id, c.title]))
    const cells: Record<string, SheetExportCell> = {
      A1: { raw: "Code" },
      B1: { raw: "Task" },
      C1: { raw: "Stage" },
      D1: { raw: "Logged Hours" },
      E1: { raw: "Rate" },
      F1: { raw: "Billable Value" },
    }
    activeBoard.tasks.forEach((t, idx) => {
      const r = idx + 2
      const hrs = t.loggedHours > 0 ? t.loggedHours : t.estimatedHours
      cells[`A${r}`] = { raw: t.code }
      cells[`B${r}`] = { raw: t.title }
      cells[`C${r}`] = { raw: colNameById.get(t.columnId) || t.columnId }
      cells[`D${r}`] = { raw: String(hrs), isNumeric: true, evaluated: hrs }
      cells[`E${r}`] = { raw: String(t.hourlyRate), isNumeric: true, evaluated: t.hourlyRate }
      cells[`F${r}`] = { raw: `=D${r}*E${r}`, isNumeric: true, evaluated: hrs * t.hourlyRate }
    })
    const bytes = buildXlsxBytes(activeBoard.title || "ConnectLn Board", [
      {
        name: "Tasks & Hours",
        rowCount: Math.max(15, activeBoard.tasks.length + 5),
        colCount: 7,
        cells,
      },
    ])
    downloadStudioFile(
      bytes,
      `${slug}.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    notify(`Exported ${slug}.xlsx`)
  }

  const handleShareMilestone = () => {
    if (!activeBoard || !metrics || !onShareToFeed) return
    onShareToFeed({
      title: `${activeBoard.title} (${activeBoard.boardCode})`,
      summary: `Project milestone update in ConnectLn Boards: ${metrics.completionPct}% complete (${metrics.doneTasks}/${metrics.totalTasks} tasks done · ${metrics.totalLoggedHours}h logged).`,
      appLabel: "ConnectLn Boards",
    })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-3 min-h-[760px]">
      {/* Left Sidebar */}
      {sidebarOpen && (
        <aside className="w-full lg:w-72 shrink-0 rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[#E7E2DA] dark:border-zinc-800 space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={handleCreateBlankBoard}
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#B45309] hover:bg-[#92400E] text-white px-2.5 py-2 text-xs font-bold shadow-xs cursor-pointer"
              >
                <FilePlus2 className="h-3.5 w-3.5" />
                New Board
              </button>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(true)}
                className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2 text-xs font-bold text-[#0B1F3A] dark:text-zinc-200 hover:border-[#B45309] cursor-pointer"
              >
                <LayoutTemplate className="h-3.5 w-3.5 text-[#B45309]" />
                Templates
              </button>
            </div>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter project boards..."
                className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-8 pr-2.5 py-1.5 text-xs outline-none focus:border-[#B45309]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[250px] lg:max-h-none">
            {filteredBoards.map((b) => {
              const isSelected = b.id === activeBoard?.id
              const m = computeBoardMetrics(b)
              return (
                <div
                  key={b.id}
                  onClick={() => setActiveBoardId(b.id)}
                  className={`group rounded-xl border p-2.5 transition-all cursor-pointer space-y-1 ${
                    isSelected
                      ? "border-[#B45309] bg-white dark:bg-zinc-900 shadow-xs"
                      : "border-transparent hover:border-[#E7E2DA] hover:bg-white/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <p className="text-xs font-bold text-[#0B1F3A] dark:text-zinc-100 line-clamp-1 flex-1">
                      {b.title}
                    </p>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setBoards((prev) =>
                            prev.map((x) => (x.id === b.id ? { ...x, starred: !x.starred } : x))
                          )
                        }}
                        className="p-0.5 cursor-pointer"
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${
                            b.starred ? "fill-amber-400 text-amber-500" : "text-zinc-400"
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (boards.length <= 1) {
                            notify("Keep at least one project board")
                            return
                          }
                          const rem = boards.filter((x) => x.id !== b.id)
                          setBoards(rem)
                          if (activeBoardId === b.id && rem[0]) setActiveBoardId(rem[0].id)
                        }}
                        className="p-0.5 text-zinc-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-zinc-500">{b.boardCode}</span>
                    <span className="font-bold text-[#B45309]">
                      {m.completionPct}% ({m.doneTasks}/{m.totalTasks})
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>
      )}

      {/* Main Boards Workspace */}
      <div className="flex-1 min-w-0 rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 border-b border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/60 dark:bg-zinc-950/60">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-1.5 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 hover:text-[#B45309] cursor-pointer"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </button>
            <input
              type="text"
              aria-label="Board project title"
              value={activeBoard?.title || ""}
              onChange={(e) => updateActiveBoard({ title: e.target.value })}
              placeholder="Project board title..."
              className="min-w-[160px] flex-1 max-w-md rounded-lg border border-transparent hover:border-[#E7E2DA] focus:border-[#B45309] bg-transparent px-2 py-1 text-sm sm:text-base font-extrabold text-[#0B1F3A] dark:text-white outline-none"
            />
            {metrics && (
              <span className="hidden sm:inline-flex items-center rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-[10.5px] font-extrabold text-[#B45309]">
                {metrics.completionPct}% Complete
              </span>
            )}
            <span className="hidden xl:inline-flex text-[11px] font-semibold text-zinc-500">
              {savedLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {statusNotice && (
              <span className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-[#B45309]">
                {statusNotice}
              </span>
            )}

            <button
              type="button"
              onClick={() => openNewTaskModal()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#B45309] hover:bg-[#92400E] text-white px-3 py-1.5 text-xs font-extrabold shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Task
            </button>

            {onBillToInvoice && (
              <button
                type="button"
                onClick={handleBillToInvoice}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#0F766E] bg-teal-50 hover:bg-teal-100 px-3 py-1.5 text-xs font-extrabold text-[#0F766E] cursor-pointer"
              >
                <Receipt className="h-3.5 w-3.5" />
                Bill to Invoice
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              title="Print Board Status Report (Ctrl+P)"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#B45309] bg-amber-50 hover:bg-amber-100 px-3 py-1.5 text-xs font-extrabold text-[#B45309] cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] px-3 py-1.5 text-xs font-bold hover:border-[#B45309] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#B45309]" />
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-10 z-30 w-56 rounded-xl border border-[#E7E2DA] bg-white dark:bg-zinc-900 p-1.5 shadow-xl space-y-1">
                  <button
                    type="button"
                    onClick={() => handleExport("xlsx")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] cursor-pointer"
                  >
                    <span>Task &amp; Hours (.xlsx)</span>
                    <span className="text-[10px] font-mono text-[#B45309]">OpenXML</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("csv")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] cursor-pointer"
                  >
                    <span>Sprint Table (.csv)</span>
                    <span className="text-[10px] font-mono text-zinc-400">UTF-8</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("html")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] cursor-pointer"
                  >
                    <span>Executive Report (.html)</span>
                    <span className="text-[10px] font-mono text-zinc-400">Web</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("print")}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5 text-[#B45309]" />
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
                Share Milestone
              </button>
            )}
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex items-center justify-between gap-2 px-3 pt-1.5 border-b border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {(
              [
                { id: "kanban", label: "Kanban Board", Icon: Kanban },
                { id: "table", label: "List & Hours Table", Icon: ListChecks },
                { id: "timeline", label: "Timeline & Workload", Icon: CalendarClock },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTabView(id)}
                className={`inline-flex items-center gap-1.5 rounded-t-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeTabView === id
                    ? "bg-white dark:bg-zinc-900 text-[#B45309] dark:text-amber-300 border-t-2 border-x border-t-[#B45309] border-x-[#E7E2DA] dark:border-x-zinc-800"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-[#0B1F3A]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
          {metrics && (
            <span className="hidden md:inline-flex text-[11px] font-mono font-bold text-zinc-500 pb-1.5">
              Logged {metrics.totalLoggedHours}h · Billable ${metrics.billableValue.toLocaleString()}
            </span>
          )}
        </div>

        {/* Main Workspace Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#FAF7F2]/40 dark:bg-zinc-950/40 space-y-4">
          {/* TAB 1: KANBAN BOARD */}
          {activeTabView === "kanban" && activeBoard && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-start">
              {activeBoard.columns.map((col, colIndex) => {
                const colTasks = activeBoard.tasks.filter((t) => t.columnId === col.id)
                const colMetric = metrics?.byColumn.find((c) => c.columnId === col.id)
                return (
                  <div
                    key={col.id}
                    className="rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 p-2.5 space-y-2.5"
                    style={{ borderTopWidth: "4px", borderTopColor: col.colorHex }}
                  >
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#0B1F3A] dark:text-white">
                          {col.title}
                        </h2>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                            colMetric?.overWip
                              ? "bg-rose-100 text-rose-800"
                              : "bg-white dark:bg-zinc-800 text-zinc-600 border border-[#E7E2DA]"
                          }`}
                        >
                          {colTasks.length}
                          {col.wipLimit ? `/${col.wipLimit}` : ""}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openNewTaskModal(col.id)}
                        className="p-1 rounded-lg hover:bg-white text-zinc-500 hover:text-[#B45309] cursor-pointer"
                        title={`Add task in ${col.title}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {colTasks.map((task) => {
                        const chkDone = task.checklist.filter((c) => c.done).length
                        return (
                          <div
                            key={task.id}
                            onClick={() => openEditTaskModal(task)}
                            className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-2xs hover:border-[#B45309] transition-all cursor-pointer space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2 text-[10px]">
                              <span className="font-mono font-bold text-zinc-500">{task.code}</span>
                              <span
                                className={`rounded-full border px-2 py-0.5 font-extrabold uppercase ${priorityBadgeClasses(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-xs font-extrabold text-[#0B1F3A] dark:text-zinc-100">
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-[11px] text-zinc-500 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-[10.5px] text-zinc-500 pt-1 border-t border-[#F1EDE6] dark:border-zinc-800">
                              <span className="truncate font-semibold">{task.assignee}</span>
                              <span className="inline-flex items-center gap-1 font-mono">
                                <Clock className="h-3 w-3" />
                                {task.loggedHours}/{task.estimatedHours}h
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] text-zinc-400 inline-flex items-center gap-1">
                                {task.checklist.length > 0 && (
                                  <>
                                    <CheckSquare className="h-3 w-3 text-emerald-600" />
                                    {chkDone}/{task.checklist.length}
                                  </>
                                )}
                                {task.dueDate ? ` · Due ${task.dueDate}` : ""}
                              </span>
                              <div
                                className="flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  aria-label="Move task left"
                                  disabled={colIndex === 0}
                                  onClick={() => handleMoveStage(task, -1)}
                                  className="p-1 rounded border border-[#E7E2DA] disabled:opacity-30 hover:bg-[#FAF7F2] cursor-pointer"
                                >
                                  <ChevronLeft className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Move task right"
                                  disabled={colIndex === activeBoard.columns.length - 1}
                                  onClick={() => handleMoveStage(task, 1)}
                                  className="p-1 rounded border border-[#E7E2DA] disabled:opacity-30 hover:bg-[#FAF7F2] cursor-pointer"
                                >
                                  <ChevronRight className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* TAB 2: LIST & HOURS TABLE */}
          {activeTabView === "table" && activeBoard && (
            <div className="rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] dark:bg-zinc-950 text-zinc-500 uppercase text-[10.5px]">
                    <th className="border border-[#E7E2DA] px-3 py-2 text-left">Code</th>
                    <th className="border border-[#E7E2DA] px-3 py-2 text-left">Task</th>
                    <th className="border border-[#E7E2DA] px-3 py-2 text-left">Stage</th>
                    <th className="border border-[#E7E2DA] px-3 py-2 text-left">Priority</th>
                    <th className="border border-[#E7E2DA] px-3 py-2 text-left">Assignee</th>
                    <th className="border border-[#E7E2DA] px-3 py-2 text-right">Logged / Est</th>
                    <th className="border border-[#E7E2DA] px-3 py-2 text-right">Billable Est.</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBoard.tasks.map((t) => {
                    const col = activeBoard.columns.find((c) => c.id === t.columnId)
                    const hrs = t.loggedHours > 0 ? t.loggedHours : t.estimatedHours
                    return (
                      <tr
                        key={t.id}
                        onClick={() => openEditTaskModal(t)}
                        className="hover:bg-[#FAF7F2] cursor-pointer"
                      >
                        <td className="border border-[#E7E2DA] px-3 py-2 font-mono font-bold">
                          {t.code}
                        </td>
                        <td className="border border-[#E7E2DA] px-3 py-2 font-bold text-[#0B1F3A] dark:text-white">
                          {t.title}
                        </td>
                        <td className="border border-[#E7E2DA] px-3 py-2">{col?.title || t.columnId}</td>
                        <td className="border border-[#E7E2DA] px-3 py-2 uppercase font-bold">
                          {t.priority}
                        </td>
                        <td className="border border-[#E7E2DA] px-3 py-2">{t.assignee}</td>
                        <td className="border border-[#E7E2DA] px-3 py-2 text-right font-mono">
                          {t.loggedHours.toFixed(1)} / {t.estimatedHours.toFixed(1)}h
                        </td>
                        <td className="border border-[#E7E2DA] px-3 py-2 text-right font-mono font-bold text-[#0F766E]">
                          {t.billable ? `$${(hrs * t.hourlyRate).toFixed(2)}` : "Non-Billable"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: TIMELINE & WORKLOAD */}
          {activeTabView === "timeline" && activeBoard && metrics && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-xl border border-[#E7E2DA] bg-white dark:bg-zinc-900 p-3">
                  <p className="text-[10.5px] font-bold uppercase text-zinc-500">Sprint Progress</p>
                  <p className="text-lg font-extrabold text-[#B45309]">{metrics.completionPct}%</p>
                </div>
                <div className="rounded-xl border border-[#E7E2DA] bg-white dark:bg-zinc-900 p-3">
                  <p className="text-[10.5px] font-bold uppercase text-zinc-500">Logged Hours</p>
                  <p className="text-lg font-extrabold font-mono">{metrics.totalLoggedHours}h</p>
                </div>
                <div className="rounded-xl border border-[#E7E2DA] bg-white dark:bg-zinc-900 p-3">
                  <p className="text-[10.5px] font-bold uppercase text-zinc-500">Checklists</p>
                  <p className="text-lg font-extrabold">
                    {metrics.checklistDone} / {metrics.checklistTotal}
                  </p>
                </div>
                <div className="rounded-xl border border-[#E7E2DA] bg-white dark:bg-zinc-900 p-3">
                  <p className="text-[10.5px] font-bold uppercase text-zinc-500">Billable Value</p>
                  <p className="text-lg font-extrabold font-mono text-[#0F766E]">
                    ${metrics.billableValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E7E2DA] bg-white dark:bg-zinc-900 p-4 space-y-3 text-xs">
                <h2 className="font-extrabold uppercase tracking-wider text-zinc-500">
                  Schedule &amp; Capacity Bars
                </h2>
                <div className="space-y-2.5">
                  {activeBoard.tasks.map((t) => {
                    const pct =
                      t.estimatedHours > 0
                        ? Math.min(100, Math.round((t.loggedHours / t.estimatedHours) * 100))
                        : 100
                    const col = activeBoard.columns.find((c) => c.id === t.columnId)
                    return (
                      <div key={t.id} className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>
                            {t.code} · {t.title} ({col?.title})
                          </span>
                          <span className="font-mono text-zinc-500">
                            Due {t.dueDate || "TBD"} · {pct}% hours ({t.loggedHours}/{t.estimatedHours}h)
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.max(8, pct)}%`,
                              backgroundColor: col?.colorHex || "#B45309",
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Editor Modal */}
      {editingTaskId && (
        <div
          role="dialog"
          aria-label="ConnectLn Boards Task Editor"
          className="fixed inset-0 z-[105] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 shadow-2xl space-y-3.5 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-3">
              <h3 className="text-base font-extrabold text-[#0B1F3A] dark:text-white">
                {isCreatingTask ? "Add Deliverable Task" : "Edit Task Details"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTaskId(null)}
                className="p-1 rounded-lg hover:bg-zinc-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  aria-label="Task title input"
                  value={taskDraftTitle}
                  onChange={(e) => setTaskDraftTitle(e.target.value)}
                  placeholder="e.g., Complete Load Test & Compliance Sign-Off"
                  className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 px-3 py-2 font-bold outline-none focus:border-[#B45309]"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                  Description / Acceptance Criteria
                </label>
                <textarea
                  rows={2}
                  value={taskDraftDesc}
                  onChange={(e) => setTaskDraftDesc(e.target.value)}
                  className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                    Stage Column
                  </label>
                  <select
                    value={taskDraftColId}
                    onChange={(e) => setTaskDraftColId(e.target.value)}
                    className="w-full rounded-xl border border-[#E7E2DA] px-2.5 py-2 font-bold"
                  >
                    {activeBoard?.columns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskDraftPriority}
                    onChange={(e) => setTaskDraftPriority(e.target.value as BoardPriority)}
                    className="w-full rounded-xl border border-[#E7E2DA] px-2.5 py-2 font-bold uppercase"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                    Assignee
                  </label>
                  <input
                    type="text"
                    value={taskDraftAssignee}
                    onChange={(e) => setTaskDraftAssignee(e.target.value)}
                    className="w-full rounded-xl border border-[#E7E2DA] px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDraftDue}
                    onChange={(e) => setTaskDraftDue(e.target.value)}
                    className="w-full rounded-xl border border-[#E7E2DA] px-2.5 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                    Est. Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={taskDraftEstHours}
                    onChange={(e) => setTaskDraftEstHours(e.target.value)}
                    className="w-full rounded-xl border border-[#E7E2DA] px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                    Logged Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={taskDraftLoggedHours}
                    onChange={(e) => setTaskDraftLoggedHours(e.target.value)}
                    className="w-full rounded-xl border border-[#E7E2DA] px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                    Rate ($/hr)
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={taskDraftRate}
                    onChange={(e) => setTaskDraftRate(e.target.value)}
                    className="w-full rounded-xl border border-[#E7E2DA] px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={taskDraftBillable}
                  onChange={(e) => setTaskDraftBillable(e.target.checked)}
                />
                <span>Include in Client Billable Invoice Handoff</span>
              </label>

              {/* Checklists */}
              <div className="rounded-xl border border-[#E7E2DA] bg-[#FAF7F2] dark:bg-zinc-950 p-3 space-y-2">
                <p className="text-[10.5px] font-extrabold uppercase text-zinc-500">
                  Sub-Tasks / Checklist
                </p>
                {taskDraftChecklist.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={c.done}
                      onChange={() =>
                        setTaskDraftChecklist((prev) =>
                          prev.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x))
                        )
                      }
                    />
                    <span className={c.done ? "line-through text-zinc-400" : ""}>{c.text}</span>
                  </label>
                ))}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    placeholder="Add checklist step..."
                    className="flex-1 rounded-lg border border-[#E7E2DA] bg-white px-2.5 py-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newChecklistText.trim()) return
                      setTaskDraftChecklist((prev) => [
                        ...prev,
                        { id: `chk_${Date.now()}`, text: newChecklistText.trim(), done: false },
                      ])
                      setNewChecklistText("")
                    }}
                    className="rounded-lg bg-[#0B1F3A] text-white px-2.5 py-1 font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {!isCreatingTask && (
                <button
                  type="button"
                  onClick={() => {
                    if (!activeBoard) return
                    updateActiveBoard({
                      tasks: activeBoard.tasks.filter((t) => t.id !== editingTaskId),
                    })
                    setEditingTaskId(null)
                    notify("Task deleted")
                  }}
                  className="mr-auto rounded-xl border border-rose-200 text-rose-700 px-3 py-2 font-bold cursor-pointer"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={() => setEditingTaskId(null)}
                className="rounded-xl border border-[#E7E2DA] px-4 py-2 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTask}
                className="rounded-xl bg-[#B45309] hover:bg-[#92400E] text-white px-5 py-2 font-extrabold cursor-pointer"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-[#E7E2DA] bg-white dark:bg-zinc-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-3">
              <h3 className="text-base font-extrabold text-[#0B1F3A] dark:text-white">
                ConnectLn Boards Project Templates
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
              {BOARD_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleCreateFromTemplate(tpl)}
                  className="rounded-xl border border-[#E7E2DA] p-3.5 text-left hover:border-[#B45309] hover:bg-amber-50/40 space-y-1.5 cursor-pointer"
                >
                  <span className="text-[10px] font-extrabold uppercase text-[#B45309]">
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
      {printableBoard && activeBoard && (
        <ConnectLnStudioPrintModal
          mode="boards"
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          title={`${activeBoard.title} (${activeBoard.boardCode})`}
          board={printableBoard}
          onDownloadOpenXml={() => handleExport("xlsx")}
        />
      )}
    </div>
  )
}
