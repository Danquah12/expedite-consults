"use client"

import React, { useState } from "react"
import { ArrowLeft, CheckCircle2, FileText, Layers, Presentation, Table2 } from "lucide-react"
import type { UserProfile } from "@/lib/connectln-data"
import { ConnectLnDocsEditor, type StudioSharePayload } from "./ConnectLnDocsEditor"
import { ConnectLnSheetsEditor } from "./ConnectLnSheetsEditor"
import { ConnectLnSlidesEditor } from "./ConnectLnSlidesEditor"

export type StudioAppId = "docs" | "sheets" | "slides"

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
  icon: React.ComponentType<{ className?: string }>
  badgeClass: string
  activePillClass: string
}> = [
  {
    id: "docs",
    name: "ConnectLn Docs",
    tagline: "Rich Documents",
    icon: FileText,
    badgeClass: "bg-[#0B5CAD] text-white",
    activePillClass: "bg-[#0B5CAD] text-white shadow-xs",
  },
  {
    id: "sheets",
    name: "ConnectLn Sheets",
    tagline: "Formula Workbooks",
    icon: Table2,
    badgeClass: "bg-[#107C41] text-white",
    activePillClass: "bg-[#107C41] text-white shadow-xs",
  },
  {
    id: "slides",
    name: "ConnectLn Slides",
    tagline: "Presentation Decks",
    icon: Presentation,
    badgeClass: "bg-[#C84B28] text-white",
    activePillClass: "bg-[#C84B28] text-white shadow-xs",
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
              <span className="inline-flex items-center gap-1 rounded-full border border-[#E7E2DA] dark:border-zinc-700 bg-[#FAF7F2] dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0067B8] dark:text-sky-400">
                <Layers className="h-3 w-3" />
                ConnectLn 360 Studio · Built by ConnectLn
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              First-party proprietary workspace — own your documents, formula sheets &amp; decks with standard .docx, .xlsx &amp; .pptx export.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 p-1 gap-1">
            {STUDIO_APPS.map((app) => {
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
                  <span>{app.name.replace("ConnectLn ", "")}</span>
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
        <ConnectLnDocsEditor user={user} onShareToFeed={onShareToFeed ? handleShare : undefined} />
      )}
      {activeApp === "sheets" && (
        <ConnectLnSheetsEditor user={user} onShareToFeed={onShareToFeed ? handleShare : undefined} />
      )}
      {activeApp === "slides" && (
        <ConnectLnSlidesEditor user={user} onShareToFeed={onShareToFeed ? handleShare : undefined} />
      )}
    </section>
  )
}
