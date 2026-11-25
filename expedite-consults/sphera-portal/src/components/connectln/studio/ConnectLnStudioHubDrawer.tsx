"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import {
  BookOpen,
  Download,
  ExternalLink,
  FilePlus2,
  FileText,
  FolderOpen,
  Home,
  Info,
  Keyboard,
  Layers,
  Presentation,
  Printer,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Table2,
  X,
} from "lucide-react"
import type { UserProfile } from "@/lib/connectln-data"

export interface StudioHubItemSummary {
  id: string
  title: string
  category: string
  updatedAt: string
  starred?: boolean
}

export interface StudioHubTemplateSummary {
  id: string
  name: string
  category: string
  description: string
  badge?: string
}

interface ConnectLnStudioHubDrawerProps {
  app: "docs" | "sheets" | "slides"
  user: UserProfile
  activeTitle: string
  activeStatsSummary: string
  items: StudioHubItemSummary[]
  templates: StudioHubTemplateSummary[]
  onClose: () => void
  onSelectItem: (id: string) => void
  onToggleStar: (id: string) => void
  onCreateBlank: () => void
  onCreateFromTemplate: (templateId: string) => void
  onTriggerImport: () => void
  onTriggerPrint: () => void
  onTriggerExportPrimary: () => void
}

type HubNavTab = "home" | "new" | "info" | "guide"

function getTimeGreeting(): string {
  const hr = new Date().getHours()
  if (hr < 12) return "Good morning"
  if (hr < 17) return "Good afternoon"
  return "Good evening"
}

export function ConnectLnStudioHubDrawer({
  app,
  user,
  activeTitle,
  activeStatsSummary,
  items,
  templates,
  onClose,
  onSelectItem,
  onToggleStar,
  onCreateBlank,
  onCreateFromTemplate,
  onTriggerImport,
  onTriggerPrint,
  onTriggerExportPrimary,
}: ConnectLnStudioHubDrawerProps) {
  const [navTab, setNavTab] = useState<HubNavTab>("home")
  const [fileFilterTab, setFileFilterTab] = useState<"recent" | "favorites">("recent")

  const firstName = useMemo(() => {
    const raw = (user?.name || "Member").trim().split(/\s+/)[0]
    return raw || "Member"
  }, [user?.name])

  const appMeta =
    app === "sheets"
      ? {
          title: "ConnectLn Sheets Hub",
          itemNoun: "Workbook",
          ext: ".xlsx",
          accentHex: "#107C41",
          accentBgClass: "bg-[#107C41]",
          accentTextClass: "text-[#107C41]",
          Icon: Table2,
        }
      : app === "slides"
      ? {
          title: "ConnectLn Slides Hub",
          itemNoun: "Deck",
          ext: ".pptx",
          accentHex: "#C84B28",
          accentBgClass: "bg-[#C84B28]",
          accentTextClass: "text-[#C84B28]",
          Icon: Presentation,
        }
      : {
          title: "ConnectLn Docs Hub",
          itemNoun: "Document",
          ext: ".docx",
          accentHex: "#0B5CAD",
          accentBgClass: "bg-[#0B5CAD]",
          accentTextClass: "text-[#0B5CAD]",
          Icon: FileText,
        }

  const AppIcon = appMeta.Icon

  const guidedTourCards = useMemo(() => {
    if (app === "sheets") {
      return [
        {
          id: "tour_sheets_welcome",
          name: "Welcome Tour",
          badge: "Guided",
          description: "Interactive walkthrough of live formulas, conditional rules, and invoice handoff.",
        },
        {
          id: "tour_sheets_formula",
          name: "Formula Lab",
          badge: "Tutorial",
          description: "Practice SUMIF, VLOOKUP, PMT, and dynamic totals in an interactive grid.",
        },
        {
          id: "tour_sheets_pivot",
          name: "Pivot Summary",
          badge: "Analytics",
          description: "Roll up multi-category budgets and compare regional performance cleanly.",
        },
      ]
    }
    if (app === "slides") {
      return [
        {
          id: "tour_slides_quick",
          name: "Deck Quick Tour",
          badge: "Guided",
          description: "Learn speaker notes, Presenter View timer, and Slide Sorter workflows.",
        },
      ]
    }
    return [
      {
        id: "tour_docs_quick",
        name: "Docs Quick Tour",
        badge: "Guided",
        description: "Explore Noctis AI drafting, ConnectLn Themes, APA citations, and Sign handoff.",
      },
    ]
  }, [app])

  const displayedItems = useMemo(() => {
    const sorted = [...items].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    if (fileFilterTab === "favorites") {
      return sorted.filter((i) => i.starred)
    }
    return sorted
  }, [items, fileFilterTab])

  return (
    <div
      role="dialog"
      aria-label={appMeta.title}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/55 p-3 sm:p-6 backdrop-blur-xs"
    >
      <div className="w-full max-w-5xl max-h-[90vh] rounded-3xl border border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left ConnectLn Navy Rail */}
        <aside className="w-full md:w-[215px] shrink-0 bg-[#0B1F3A] text-white p-3.5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-xl ${appMeta.accentBgClass} text-white shadow-xs`}
                >
                  <AppIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-extrabold tracking-tight leading-none">
                    ConnectLn 360
                  </p>
                  <p className="text-[10px] text-sky-300 font-semibold mt-0.5">
                    {appMeta.itemNoun} Hub
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close Studio Hub"
                onClick={onClose}
                className="md:hidden p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="grid grid-cols-3 md:grid-cols-1 gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setNavTab("home")}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors cursor-pointer ${
                  navTab === "home"
                    ? "bg-white text-[#0B1F3A]"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                <Home className="h-3.5 w-3.5 shrink-0" />
                <span>Studio Home</span>
              </button>
              <button
                type="button"
                onClick={() => setNavTab("new")}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors cursor-pointer ${
                  navTab === "new"
                    ? "bg-white text-[#0B1F3A]"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                <FilePlus2 className="h-3.5 w-3.5 shrink-0" />
                <span>New</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onTriggerImport()
                }}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                <span>Open / Import</span>
              </button>
              <button
                type="button"
                onClick={() => setNavTab("info")}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors cursor-pointer ${
                  navTab === "info"
                    ? "bg-white text-[#0B1F3A]"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                <Info className="h-3.5 w-3.5 shrink-0" />
                <span>File Info</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onTriggerPrint()
                }}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5 shrink-0" />
                <span>Print / PDF</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onTriggerExportPrimary()
                }}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 shrink-0" />
                <span>Export {appMeta.ext}</span>
              </button>
              <button
                type="button"
                onClick={() => setNavTab("guide")}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors cursor-pointer ${
                  navTab === "guide"
                    ? "bg-white text-[#0B1F3A]"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                <Keyboard className="h-3.5 w-3.5 shrink-0" />
                <span>Shortcuts &amp; Guide</span>
              </button>
            </nav>
          </div>

          <div className="hidden md:block rounded-2xl bg-white/10 p-3 space-y-1 text-[11px]">
            <p className="font-extrabold text-sky-300 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              ConnectLn 360 Workspace
            </p>
            <p className="text-slate-300 leading-relaxed">
              Local-first privacy with standard OpenXML exports and audit-ready workflows.
            </p>
          </div>
        </aside>

        {/* Main Warm-Ivory Canvas */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Top Greeting & Close */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#E7E2DA] dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#E7E2DA] dark:border-zinc-700 bg-[#FAF7F2] dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0B5CAD] dark:text-sky-400">
                <Sparkles className="h-3 w-3" />
                ConnectLn 360 Studio Hub
              </span>
              <h2 className="text-lg sm:text-xl font-black text-[#0B1F3A] dark:text-white mt-1 tracking-tight">
                {getTimeGreeting()}, {firstName}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[#0B1F3A] px-3 py-1.5 text-xs font-bold text-[#0B1F3A] dark:text-zinc-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
              Back to Editor
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {(navTab === "home" || navTab === "new") && (
              <>
                {/* Start Fresh & Guided Tours */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                      Start Fresh &amp; Guided Tours
                    </h3>
                    <span className="text-[11px] font-semibold text-zinc-500">
                      Instant templates · zero setup
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Blank Starter Card */}
                    <button
                      type="button"
                      onClick={() => {
                        onCreateBlank()
                        onClose()
                      }}
                      className="group rounded-2xl border-2 border-dashed border-[#0B5CAD]/40 bg-white dark:bg-zinc-900 hover:border-[#0B5CAD] p-3.5 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-xl ${appMeta.accentBgClass} text-white`}
                        >
                          <FilePlus2 className="h-4 w-4" />
                        </span>
                        <span className="rounded-full bg-[#FAF7F2] dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-extrabold text-[#0B1F3A] dark:text-zinc-200">
                          Blank
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[#0B1F3A] dark:text-white group-hover:text-[#0B5CAD]">
                          Blank {appMeta.itemNoun}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                          Start from a clean canvas with full ConnectLn 360 tools.
                        </p>
                      </div>
                    </button>

                    {/* Guided Tours */}
                    {guidedTourCards.map((tour) => (
                      <button
                        key={tour.id}
                        type="button"
                        onClick={() => {
                          onCreateFromTemplate(tour.id)
                          onClose()
                        }}
                        className="group rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#0B5CAD] p-3.5 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/50 text-[#0B5CAD]">
                            <BookOpen className="h-4 w-4" />
                          </span>
                          <span className="rounded-full bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 text-[10px] font-extrabold text-[#0B5CAD] dark:text-sky-300">
                            {tour.badge}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-[#0B1F3A] dark:text-white group-hover:text-[#0B5CAD]">
                            {tour.name}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                            {tour.description}
                          </p>
                        </div>
                      </button>
                    ))}

                    {/* Studio Templates */}
                    {templates.slice(0, navTab === "new" ? templates.length : 4).map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => {
                          onCreateFromTemplate(tpl.id)
                          onClose()
                        }}
                        className="group rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#0B5CAD] p-3.5 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF7F2] dark:bg-zinc-800 text-[#0B1F3A] dark:text-zinc-200">
                            <AppIcon className="h-4 w-4" />
                          </span>
                          <span className="rounded-full bg-[#FAF7F2] dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                            {tpl.badge || tpl.category}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-[#0B1F3A] dark:text-white group-hover:text-[#0B5CAD] truncate">
                            {tpl.name}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                            {tpl.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Recent & Favorites File List */}
                {navTab === "home" && (
                  <section className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex rounded-xl bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-800 p-1 gap-1">
                        <button
                          type="button"
                          onClick={() => setFileFilterTab("recent")}
                          className={`rounded-lg px-3 py-1 text-xs font-extrabold cursor-pointer ${
                            fileFilterTab === "recent"
                              ? "bg-[#0B1F3A] text-white"
                              : "text-zinc-600 dark:text-zinc-400 hover:text-[#0B1F3A]"
                          }`}
                        >
                          Recent ({items.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setFileFilterTab("favorites")}
                          className={`rounded-lg px-3 py-1 text-xs font-extrabold cursor-pointer ${
                            fileFilterTab === "favorites"
                              ? "bg-[#0B1F3A] text-white"
                              : "text-zinc-600 dark:text-zinc-400 hover:text-[#0B1F3A]"
                          }`}
                        >
                          Favorites ({items.filter((i) => i.starred).length})
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden divide-y divide-[#E7E2DA]/60 dark:divide-zinc-800">
                      {displayedItems.length === 0 ? (
                        <div className="p-6 text-center text-xs text-zinc-500">
                          {fileFilterTab === "favorites"
                            ? "Star any file in your library to pin it to Favorites."
                            : "No files found yet."}
                        </div>
                      ) : (
                        displayedItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              onSelectItem(item.id)
                              onClose()
                            }}
                            className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-[#FAF7F2] dark:hover:bg-zinc-800/70 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${appMeta.accentBgClass} text-white`}
                              >
                                <AppIcon className="h-4 w-4" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-extrabold text-[#0B1F3A] dark:text-white truncate">
                                  {item.title || `Untitled ${appMeta.itemNoun}`}
                                </p>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                  {item.category} · Updated{" "}
                                  {new Date(item.updatedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                aria-label={`Toggle favorite ${item.title}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onToggleStar(item.id)
                                }}
                                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                              >
                                <Star
                                  className={`h-3.5 w-3.5 ${
                                    item.starred
                                      ? "fill-amber-400 text-amber-500"
                                      : "text-zinc-400"
                                  }`}
                                />
                              </button>
                              <span className="hidden sm:inline text-[11px] font-bold text-[#0B5CAD]">
                                Open →
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                )}
              </>
            )}

            {navTab === "info" && (
              <section className="rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#0B5CAD]">
                      Active {appMeta.itemNoun} Details
                    </p>
                    <h3 className="text-lg font-black text-[#0B1F3A] dark:text-white mt-0.5">
                      {activeTitle}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">{activeStatsSummary}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Local-First Encrypted Browser Vault
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onTriggerPrint()
                    }}
                    className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 hover:border-[#0B5CAD] p-3.5 text-left cursor-pointer space-y-1"
                  >
                    <p className="text-xs font-extrabold text-[#0B1F3A] dark:text-white flex items-center gap-1.5">
                      <Printer className="h-4 w-4 text-[#0B5CAD]" />
                      Print or Save Clean PDF
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Launch crisp ConnectLn Print Studio with custom margins and orientation.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onTriggerExportPrimary()
                    }}
                    className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 hover:border-[#0B5CAD] p-3.5 text-left cursor-pointer space-y-1"
                  >
                    <p className="text-xs font-extrabold text-[#0B1F3A] dark:text-white flex items-center gap-1.5">
                      <Download className="h-4 w-4 text-[#0B5CAD]" />
                      Export Standard {appMeta.ext}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Download portable OpenXML files compatible with external readers anytime.
                    </p>
                  </button>
                </div>
              </section>
            )}

            {navTab === "guide" && (
              <section className="space-y-4">
                <div className="rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                  <h3 className="text-sm font-black text-[#0B1F3A] dark:text-white">
                    Keyboard Shortcuts &amp; Studio Productivity Tips
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      ["Ctrl / Cmd + P", "Open ConnectLn Print & PDF Studio"],
                      ["Ctrl / Cmd + F", "Open Find & Replace bar"],
                      ["Ctrl / Cmd + B / I / U", "Bold, Italic, or Underline selection"],
                      ["Format Painter", "Copy text formatting and click target text"],
                      ["Noctis Studio", "AI draft, rewrite, summarize, and translate"],
                      ["Send to Sign", "Route document into SHA-256 e-signature workflow"],
                    ].map(([shortcut, desc]) => (
                      <div
                        key={shortcut}
                        className="flex items-center justify-between gap-2 rounded-xl bg-[#FAF7F2] dark:bg-zinc-950 px-3 py-2 border border-[#E7E2DA]/70 dark:border-zinc-800"
                      >
                        <kbd className="font-mono text-[11px] font-bold text-[#0B5CAD]">{shortcut}</kbd>
                        <span className="text-[11px] text-zinc-600 dark:text-zinc-300 text-right">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#0B5CAD]/25 bg-white dark:bg-zinc-900 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B1F3A] text-white">
                      <Smartphone className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-[#0B1F3A] dark:text-white">
                        Take ConnectLn 360 Anywhere
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Access mobile companion downloads and workspace setup guides.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/connectin-portal#download-app"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B5CAD] hover:bg-[#094a8d] text-white px-3.5 py-2 text-xs font-extrabold"
                  >
                    Get ConnectLn Mobile App
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
