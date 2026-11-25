"use client"

import React, { useState } from "react"
import { ArrowLeft, CheckCircle2, ClipboardList, FileSignature, FileText, Kanban, Layers, Presentation, Receipt, Table2 } from "lucide-react"
import type { UserProfile } from "@/lib/connectln-data"
import type { StudioDocRecord, StudioSheetTab } from "@/lib/connectln-studio-storage"
import { ConnectLnDocsEditor, type StudioSharePayload } from "./ConnectLnDocsEditor"
import { ConnectLnSheetsEditor } from "./ConnectLnSheetsEditor"
import { ConnectLnSlidesEditor } from "./ConnectLnSlidesEditor"
import { ConnectLnSignApp } from "./ConnectLnSignApp"
import { ConnectLnInvoiceApp } from "./ConnectLnInvoiceApp"
import { ConnectLnBoardsApp } from "./ConnectLnBoardsApp"
import { ConnectLnFormsApp } from "./ConnectLnFormsApp"

export type StudioAppId = "docs" | "sheets" | "slides" | "sign" | "invoice" | "boards" | "forms"

interface ConnectLnStudioSuiteViewProps {
  activeApp: StudioAppId
  user: UserProfile
  onSwitchApp: (app: StudioAppId) => void
  onReturnHome: () => void
  onShareToFeed?: (payload: StudioSharePayload) => void
}

const STUDIO_APPS: Array<{
  id: StudioAppId
  name: string
  tagline: string
  group: "create" | "power"
  icon: React.ComponentType<{ className?: string }>
  badgeClass: string
  activePillClass: string
}> = [
  {
    id: "docs",
    name: "ConnectLn Docs",
    tagline: "Rich Documents",
    group: "create",
    icon: FileText,
    badgeClass: "bg-[#0B5CAD] text-white",
    activePillClass: "bg-[#0B5CAD] text-white shadow-xs",
  },
  {
    id: "sheets",
    name: "ConnectLn Sheets",
    tagline: "Formula Workbooks",
    group: "create",
    icon: Table2,
    badgeClass: "bg-[#107C41] text-white",
    activePillClass: "bg-[#107C41] text-white shadow-xs",
  },
  {
    id: "slides",
    name: "ConnectLn Slides",
    tagline: "Presentation Decks",
    group: "create",
    icon: Presentation,
    badgeClass: "bg-[#C84B28] text-white",
    activePillClass: "bg-[#C84B28] text-white shadow-xs",
  },
  {
    id: "sign",
    name: "ConnectLn Sign",
    tagline: "E-Signatures & Audit Certificates",
    group: "power",
    icon: FileSignature,
    badgeClass: "bg-[#4338CA] text-white",
    activePillClass: "bg-[#4338CA] text-white shadow-xs",
  },
  {
    id: "invoice",
    name: "ConnectLn Invoice & Ledger",
    tagline: "Invoices, Estimates & Cash Flow",
    group: "power",
    icon: Receipt,
    badgeClass: "bg-[#0F766E] text-white",
    activePillClass: "bg-[#0F766E] text-white shadow-xs",
  },
  {
    id: "boards",
    name: "ConnectLn Boards",
    tagline: "Kanban Sprints & Trackers",
    group: "power",
    icon: Kanban,
    badgeClass: "bg-[#B45309] text-white",
    activePillClass: "bg-[#B45309] text-white shadow-xs",
  },
  {
    id: "forms",
    name: "ConnectLn Forms",
    tagline: "Intake Surveys & Analytics",
    group: "power",
    icon: ClipboardList,
    badgeClass: "bg-[#9333EA] text-white",
    activePillClass: "bg-[#9333EA] text-white shadow-xs",
  },
]

export function ConnectLnStudioSuiteView({
  activeApp,
  user,
  onSwitchApp,
  onReturnHome,
  onShareToFeed,
}: ConnectLnStudioSuiteViewProps) {
  const [sharedBanner, setSharedBanner] = useState<string | null>(null)
  const [pendingSignDoc, setPendingSignDoc] = useState<StudioDocRecord | null>(null)
  const [pendingInvoiceSheet, setPendingInvoiceSheet] = useState<{
    workbookTitle: string
    sheet: StudioSheetTab
  } | null>(null)
  const [pendingBoardTasks, setPendingBoardTasks] = useState<{
    boardTitle: string
    tasks: Array<{ title: string; description: string; assignee?: string; tags?: string[] }>
  } | null>(null)
  const currentAppMeta = STUDIO_APPS.find((a) => a.id === activeApp) || STUDIO_APPS[0]
  const CurrentIcon = currentAppMeta.icon

  const handleShare = (payload: StudioSharePayload) => {
    onShareToFeed?.(payload)
    setSharedBanner(`Published "${payload.title}" to your ConnectLn Home Feed`)
    setTimeout(() => {
      setSharedBanner((prev) =>
        prev?.includes(payload.title) ? null : prev
      )
    }, 5000)
  }

  return (
    <section
      aria-label="ConnectLn 360 Studio Productivity Suite"
      className="space-y-3"
    >
      {/* ConnectLn 360 Studio Suite Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-xs ${currentAppMeta.badgeClass}`}
          >
            <CurrentIcon className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-extrabold text-[#0B1F3A] dark:text-white tracking-tight">
                {currentAppMeta.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 rounded-full border border-[#E7E2DA] dark:border-zinc-700 bg-[#FAF7F2] dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                  currentAppMeta.group === "power"
                    ? "text-[#4338CA] dark:text-indigo-400"
                    : "text-[#0067B8] dark:text-sky-400"
                }`}
              >
                <Layers className="h-3 w-3" />
                {currentAppMeta.group === "power"
                  ? "ConnectLn Power Apps · Built by ConnectLn"
                  : "ConnectLn 360 Studio · Built by ConnectLn"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              {activeApp === "invoice"
                ? "First-party billing & accounting studio — build invoices, convert estimates, log payments & track net cash flow."
                : activeApp === "boards"
                ? "First-party Kanban sprint & job tracker — manage deliverables, checklists, hours & hand off directly to ConnectLn Invoice."
                : activeApp === "forms"
                ? "First-party form & survey builder — capture client intake, track live analytics & send submissions straight to Boards."
                : currentAppMeta.group === "power"
                ? "First-party professional workflow app — draw or type signatures, route approvals & seal contracts with SHA-256 certificates."
                : "First-party proprietary workspace — own your documents, formula sheets & decks with standard .docx, .xlsx & .pptx export."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex flex-wrap items-center rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 p-1 gap-1">
            <span className="px-1.5 text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Create:
            </span>
            {STUDIO_APPS.filter((a) => a.group === "create").map((app) => {
              const Icon = app.icon
              const isSelected = activeApp === app.id
              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => onSwitchApp(app.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? app.activePillClass
                      : "text-[#0B1F3A] dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{app.name.replace("ConnectLn ", "").replace(" & Ledger", "")}</span>
                </button>
              )
            })}
            <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-[#E7E2DA] dark:bg-zinc-700" />
            <span className="px-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#4338CA] dark:text-indigo-400">
              Power Apps:
            </span>
            {STUDIO_APPS.filter((a) => a.group === "power").map((app) => {
              const Icon = app.icon
              const isSelected = activeApp === app.id
              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => onSwitchApp(app.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? app.activePillClass
                      : "text-[#4338CA] dark:text-indigo-300 hover:bg-white dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{app.name.replace("ConnectLn ", "").replace(" & Ledger", "")}</span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={onReturnHome}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 px-3 py-1.5 text-xs font-bold text-[#0B1F3A] dark:text-zinc-200 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Feed
          </button>
        </div>
      </div>

      {sharedBanner && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-4 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            {sharedBanner}
          </span>
          <button
            type="button"
            onClick={onReturnHome}
            className="underline font-extrabold hover:text-emerald-950 dark:hover:text-white cursor-pointer"
          >
            View in Home Feed →
          </button>
        </div>
      )}

      {activeApp === "docs" && (
        <ConnectLnDocsEditor
          user={user}
          onShareToFeed={onShareToFeed ? handleShare : undefined}
          onSendToSign={(doc) => {
            setPendingSignDoc(doc)
            onSwitchApp("sign")
          }}
        />
      )}
      {activeApp === "sheets" && (
        <ConnectLnSheetsEditor
          user={user}
          onShareToFeed={onShareToFeed ? handleShare : undefined}
          onSendToInvoice={(payload) => {
            setPendingInvoiceSheet(payload)
            onSwitchApp("invoice")
          }}
        />
      )}
      {activeApp === "slides" && (
        <ConnectLnSlidesEditor user={user} onShareToFeed={onShareToFeed ? handleShare : undefined} />
      )}
      {activeApp === "sign" && (
        <ConnectLnSignApp
          user={user}
          pendingImportDoc={pendingSignDoc}
          onClearPendingImport={() => setPendingSignDoc(null)}
          onShareToFeed={onShareToFeed ? handleShare : undefined}
        />
      )}
      {activeApp === "invoice" && (
        <ConnectLnInvoiceApp
          user={user}
          pendingImportSheet={pendingInvoiceSheet}
          onClearPendingImport={() => setPendingInvoiceSheet(null)}
          onSendToSign={(doc) => {
            const now = new Date().toISOString()
            setPendingSignDoc({
              id: doc.id,
              title: doc.title,
              category: doc.category || "Billing Authorization",
              contentHtml: doc.contentHtml,
              createdAt: now,
              updatedAt: now,
              authorName: user.name || "ConnectLn Member",
            })
            onSwitchApp("sign")
          }}
          onShareToFeed={onShareToFeed ? handleShare : undefined}
        />
      )}
      {activeApp === "boards" && (
        <ConnectLnBoardsApp
          user={user}
          pendingTasksFromForm={pendingBoardTasks}
          onClearPendingTasks={() => setPendingBoardTasks(null)}
          onBillToInvoice={(payload) => {
            setPendingInvoiceSheet(payload)
            onSwitchApp("invoice")
          }}
          onShareToFeed={onShareToFeed ? handleShare : undefined}
        />
      )}
      {activeApp === "forms" && (
        <ConnectLnFormsApp
          user={user}
          onSendResponsesToBoards={(payload) => {
            setPendingBoardTasks(payload)
            onSwitchApp("boards")
          }}
          onShareToFeed={onShareToFeed ? handleShare : undefined}
        />
      )}
    </section>
  )
}
