"use client"

import React, { useEffect, useState } from "react"
import {
  Award,
  Radar,
  Kanban,
  Building2,
  Layers,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  EyeOff,
  Eye,
  X,
  Network,
} from "lucide-react"
import type {
  HaloStatusCode,
  SovereignSuiteCloudState,
} from "@/app/api/connectin/sovereign-suite/route"

export const HALO_STATUS_META: Record<
  HaloStatusCode,
  {
    code: HaloStatusCode
    friendlyCode: string
    badgeLabel: string
    fullName: string
    ringClass: string
    pillBg: string
    description: string
  }
> = {
  AFT: {
    code: "AFT",
    friendlyCode: "#READY",
    badgeLabel: "#READY · Open for Work",
    fullName: "#READY — Ready for Projects, Shifts & Opportunities",
    ringClass: "ring-3 ring-emerald-500 border-2 border-white",
    pillBg: "bg-emerald-600 text-white",
    description: "Lets your circle know you are open to new roles, projects, and collaborations",
  },
  SCO: {
    code: "SCO",
    friendlyCode: "#TEAMING",
    badgeLabel: "#TEAMING · Building a Team",
    fullName: "#TEAMING — Hiring & Welcoming Teammates",
    ringClass: "ring-3 ring-amber-500 border-2 border-white",
    pillBg: "bg-amber-600 text-white",
    description: "Shows members you are actively hiring, partnering, or awarding projects",
  },
  FAC: {
    code: "FAC",
    friendlyCode: "#MENTOR",
    badgeLabel: "#MENTOR · Open to Advise",
    fullName: "#MENTOR — Available to Mentor, Review & Advise",
    ringClass: "ring-3 ring-indigo-500 border-2 border-white",
    pillBg: "bg-indigo-600 text-white",
    description: "Welcomes peers seeking mentorship, technical reviews, or fractional guidance",
  },
  LOCK: {
    code: "LOCK",
    friendlyCode: "#FOCUSED",
    badgeLabel: "#FOCUSED · On a Project",
    fullName: "#FOCUSED — Heads-Down on an Active Project",
    ringClass: "ring-2 ring-zinc-500 border-2 border-white",
    pillBg: "bg-zinc-700 text-white",
    description: "Currently booked on a full-time project, still open to friendly networking",
  },
}

function formatFriendlyCircle(tvr: string): string {
  if (tvr.includes("L1")) return "1st CIRCLE · Direct Friend"
  if (tvr.includes("L2")) return "2nd CIRCLE · Warm Intro"
  return "3rd CIRCLE · Community"
}

type SovereignTabId =
  | "tvr_halo"
  | "pvr_wcd"
  | "prt_radar"
  | "ftt_tor"
  | "esh_hubs"
  | "bdp_edw"
  | "bex_exchange"

export function ConnectLnSovereignSuiteHub({
  userName = "Kwesi Asiedu",
  userHeadline = "Verified ConnectLn Member",
  userPhone = "+1 (240) 260-7898",
}: {
  userName?: string
  userHeadline?: string
  userPhone?: string
}) {
  const [state, setState] = useState<SovereignSuiteCloudState | null>(null)
  const [myHalo, setMyHalo] = useState<HaloStatusCode>("AFT")
  const [myStealthCloak, setMyStealthCloak] = useState<boolean>(false)
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<SovereignTabId>("tvr_halo")
  const [deckIndex, setDeckIndex] = useState<number>(0)
  const [slideIndex, setSlideIndex] = useState<number>(0)
  const [toastMsg, setToastMsg] = useState<string>("")

  // Form states
  const [newSkillText, setNewSkillText] = useState<string>("")
  const [wcdTarget, setWcdTarget] = useState<string>("Esther Boa Asiedu")
  const [wcdDeliverable, setWcdDeliverable] = useState<string>("")
  const [wcdCitation, setWcdCitation] = useState<string>("")
  const [fttTitle, setFttTitle] = useState<string>("")
  const [fttEnterprise, setFttEnterprise] = useState<string>("Expedite Consults Team Hub")
  const [bdpTitle, setBdpTitle] = useState<string>("")
  const [bdpSlide1, setBdpSlide1] = useState<string>("")
  const [bdpSlide2, setBdpSlide2] = useState<string>("")
  const [rfpScopeByExpert, setRfpScopeByExpert] = useState<Record<string, string>>({})
  const [totFilterTvr, setTotFilterTvr] = useState<string>("ALL")
  const [totFilterHalo, setTotFilterHalo] = useState<string>("ALL")

  const showToast = (msg: string) => {
    setToastMsg(msg)
    window.setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? "" : prev))
    }, 3800)
  }

  const fetchSuiteState = async () => {
    try {
      const res = await fetch(
        `/api/connectin/sovereign-suite?viewerName=${encodeURIComponent(userName)}`,
        { cache: "no-store" }
      )
      if (!res.ok) return
      const data = await res.json()
      if (data?.ok && data.state) {
        setState(data.state)
        if (data.myHalo) {
          setMyHalo(data.myHalo)
          try {
            localStorage.setItem(
              `connectln_halo_v1__${userName.toLowerCase()}`,
              data.myHalo
            )
            window.dispatchEvent(new Event("connectln-halo-updated"))
          } catch {}
        }
        setMyStealthCloak(Boolean(data.myStealthCloak))
      }
    } catch {}
  }

  useEffect(() => {
    void fetchSuiteState()
    const onHaloSync = () => void fetchSuiteState()
    window.addEventListener("connectln-halo-updated", onHaloSync)
    return () => window.removeEventListener("connectln-halo-updated", onHaloSync)
  }, [userName])

  const dispatchAction = async (payload: Record<string, any>, successNotice?: string) => {
    try {
      const res = await fetch("/api/connectin/sovereign-suite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorName: userName,
          actorHeadline: userHeadline,
          actorPhone: userPhone,
          ...payload,
        }),
      })
      const data = await res.json()
      if (data?.ok && data.state) {
        setState(data.state)
        if (data.myHalo) {
          setMyHalo(data.myHalo)
          try {
            localStorage.setItem(
              `connectln_halo_v1__${userName.toLowerCase()}`,
              data.myHalo
            )
            window.dispatchEvent(new Event("connectln-halo-updated"))
          } catch {}
        }
        if (typeof data.myStealthCloak === "boolean") {
          setMyStealthCloak(data.myStealthCloak)
        }
        if (successNotice) showToast(successNotice)
      }
    } catch {}
  }

  const cycleHalo = () => {
    const order: HaloStatusCode[] = ["AFT", "SCO", "FAC", "LOCK"]
    const next = order[(order.indexOf(myHalo) + 1) % order.length]
    setMyHalo(next)
    void dispatchAction(
      { action: "set_halo", halo: next },
      `✓ Profile Status Ring switched to ${HALO_STATUS_META[next].badgeLabel}`
    )
  }

  const decks = state?.bdpDecks || []
  const currentDeck = decks[deckIndex % Math.max(1, decks.length)]
  const slides = currentDeck?.slides || []
  const currentSlide = slides[slideIndex % Math.max(1, slides.length)]

  const haloMeta = HALO_STATUS_META[myHalo] || HALO_STATUS_META.AFT
  const totalPvrVouches = (state?.pvrSkills || []).reduce((acc, s) => acc + s.vouchCount, 0)

  return (
    <div className="space-y-3">
      {/* 1. FRIENDLY CONNECTLN ACRONYM BAR (Warm, Human, Self-Explanatory Acronyms) */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 shadow-xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-[#0A66C2] text-white text-xs font-black shrink-0">
              CLN
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                  ConnectLn Career, Kudos &amp; Circle Hub
                </span>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                  1st CIRCLE · 16 Warm Bridges
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                Friendly ConnectLn Features: CIRCLE &amp; BRIDGES · #READY/#TEAMING Rings · KUDOS &amp; PROOF · SPOTLIGHT · QUICK-PITCH · TEAM-HUBS · SLIDE-STORIES · HIRE-A-PRO
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={cycleHalo}
              className={`rounded-full px-3 py-1 text-[11px] font-extrabold shadow-2xs transition-opacity hover:opacity-95 cursor-pointer ${haloMeta.pillBg}`}
              title="Click to switch your friendly photo ring (#READY, #TEAMING, #MENTOR, #FOCUSED)"
            >
              {haloMeta.badgeLabel}
            </button>
            <button
              type="button"
              onClick={() => setIsConsoleOpen(true)}
              className="rounded-full border border-[#0A66C2] bg-blue-50/80 dark:bg-blue-950/40 hover:bg-[#0A66C2] hover:text-white px-3 py-1 text-[11px] font-extrabold text-[#0A66C2] dark:text-sky-300 transition-colors cursor-pointer"
            >
              Explore All Features →
            </button>
          </div>
        </div>

        {/* Friendly Acronym Quick-Launch Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            {
              id: "tvr_halo" as SovereignTabId,
              acronym: "CIRCLE + BRIDGES",
              label: "Trusted Friends & Photo Rings",
              badge: haloMeta.friendlyCode,
            },
            {
              id: "pvr_wcd" as SovereignTabId,
              acronym: "KUDOS + PROOF",
              label: "Skill Kudos & Work Proof Notes",
              badge: `${totalPvrVouches || 93} Kudos`,
            },
            {
              id: "prt_radar" as SovereignTabId,
              acronym: "SPOTLIGHT + COZY",
              label: "Who Visited Your Profile",
              badge: myStealthCloak ? "Cozy Mode" : `${state?.prtRadarEvents.length || 4} Visitors`,
            },
            {
              id: "ftt_tor" as SovereignTabId,
              acronym: "QUICK-PITCH + MATCH",
              label: "1-Tap Apply & Hiring Board",
              badge: `${state?.torPipeline.length || 4} Matches`,
            },
            {
              id: "esh_hubs" as SovereignTabId,
              acronym: "TEAM-HUBS + FIND-PROS",
              label: "Company Hubs & Talent Finder",
              badge: `${state?.eshEnterprises.length || 3} Teams`,
            },
            {
              id: "bdp_edw" as SovereignTabId,
              acronym: "SLIDE-STORIES + SPARK",
              label: "Swipable Guides & Weekly Spark",
              badge: `${decks.length || 2} Guides`,
            },
            {
              id: "bex_exchange" as SovereignTabId,
              acronym: "HIRE-A-PRO",
              label: "Direct Project & Helper Desk",
              badge: `${state?.bexExperts.length || 3} Pros`,
            },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => {
                setActiveTab(pill.id)
                setIsConsoleOpen(true)
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 px-2.5 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-100 shrink-0 cursor-pointer transition-colors"
            >
              <span className="font-mono font-black text-[#0A66C2] dark:text-sky-400">
                {pill.acronym}
              </span>
              <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                {pill.label}
              </span>
              <span className="rounded bg-zinc-200/80 dark:bg-zinc-700 px-1.5 py-0.2 text-[10px] font-extrabold text-zinc-800 dark:text-zinc-200">
                {pill.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Inline Interactive SLIDE-STORIES Carousel Preview */}
        {currentDeck && currentSlide && (
          <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-[#0E1726] to-slate-900 p-3.5 text-white space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider">
                  SLIDE-STORY · Visual Guide
                </span>
                <span className="text-xs font-extrabold truncate">{currentDeck.title}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10.5px] font-mono text-indigo-300">
                  Card {slideIndex + 1}/{slides.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)
                  }
                  className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                  title="Previous Card"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSlideIndex((prev) => (prev + 1) % slides.length)}
                  className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                  title="Next Card"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                {decks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeckIndex((prev) => (prev + 1) % decks.length)
                      setSlideIndex(0)
                    }}
                    className="rounded-md bg-white/10 hover:bg-white/20 px-2 py-0.5 text-[10px] font-bold cursor-pointer"
                  >
                    Next Story ({(deckIndex + 1) % decks.length + 1}/{decks.length})
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-white/5 border border-white/10 p-3 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-extrabold text-emerald-300">{currentSlide.heading}</p>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-extrabold text-emerald-200">
                  {currentSlide.metricBadge}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{currentSlide.body}</p>
              <p className="text-[10.5px] font-mono text-indigo-300 pt-0.5">
                Takeaway: {currentSlide.keySpec}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[95] rounded-2xl bg-zinc-900 border border-emerald-500/50 text-white px-4 py-2.5 text-xs font-extrabold shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 2. FULL INTERACTIVE CONNECTLN CAREER, KUDOS & CIRCLE HUB MODAL */}
      {isConsoleOpen && state && (
        <div className="fixed inset-0 z-[85] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-5xl max-h-[90vh] rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#0A66C2] via-indigo-700 to-slate-900 text-white flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-mono font-black uppercase">
                    CONNECTLN CAREER &amp; COMMUNITY HUB · CLOUD SYNCED
                  </span>
                  <span className="rounded-full bg-emerald-500/25 border border-emerald-300/40 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-200">
                    {haloMeta.badgeLabel}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black mt-1">
                  ConnectLn Circle, Kudos, Spotlight &amp; Quick-Pitch Hub
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsConsoleOpen(false)}
                className="h-9 w-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sub-Navigation Friendly Tabs */}
            <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/70 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: "tvr_halo", label: "1. CIRCLE & #READY Rings", icon: Network },
                { id: "pvr_wcd", label: "2. KUDOS & PROOF Notes", icon: Award },
                { id: "prt_radar", label: "3. SPOTLIGHT & COZY Mode", icon: Radar },
                { id: "ftt_tor", label: "4. QUICK-PITCH & MATCH-BOARD", icon: Kanban },
                { id: "esh_hubs", label: "5. TEAM-HUBS & FIND-PROS", icon: Building2 },
                { id: "bdp_edw", label: "6. SLIDE-STORIES & WEEKLY-SPARK", icon: Layers },
                { id: "bex_exchange", label: "7. HIRE-A-PRO Helper Desk", icon: Briefcase },
              ].map((t) => {
                const Icon = t.icon
                const active = activeTab === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as SovereignTabId)}
                    className={`rounded-xl px-3 py-2 text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                      active
                        ? "bg-[#0A66C2] text-white shadow-xs"
                        : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{t.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Tab Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* TAB 1: CIRCLE, BRIDGES & #READY/#TEAMING/#MENTOR/#FOCUSED Photo Rings */}
              {activeTab === "tvr_halo" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-4 space-y-3">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                      Friendly Profile Photo Rings (`#READY` · `#TEAMING` · `#MENTOR` · `#FOCUSED`)
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Pick the friendly status ring around your profile photo so your circle knows how to collaborate with you:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {(["AFT", "SCO", "FAC", "LOCK"] as HaloStatusCode[]).map((code) => {
                        const meta = HALO_STATUS_META[code]
                        const selected = myHalo === code
                        return (
                          <button
                            key={code}
                            type="button"
                            onClick={() => {
                              setMyHalo(code)
                              void dispatchAction(
                                { action: "set_halo", halo: code },
                                `✓ Activated ${meta.badgeLabel}`
                              )
                            }}
                            className={`rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                              selected
                                ? "border-[#0A66C2] bg-blue-50/70 dark:bg-blue-950/40 shadow-sm"
                                : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold ${meta.pillBg}`}>
                                {meta.badgeLabel}
                              </span>
                              {selected && <CheckCircle2 className="h-4 w-4 text-[#0A66C2]" />}
                            </div>
                            <p className="text-xs font-bold mt-2 text-zinc-900 dark:text-zinc-100">
                              {meta.fullName}
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                              {meta.description}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* CIRCLE & BRIDGES Trusted Friends Graph */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-black">
                        CIRCLE (1st / 2nd / 3rd Circle) &amp; BRIDGES (Shared Friends Who Can Introduce You)
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Shows how closely you are connected to each member and which shared friends (`BRIDGES`) can make a warm introduction.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          name: "Esther Boa Asiedu",
                          role: "Principal Healthcare Operations Lead",
                          circle: "1st CIRCLE · Direct Friend",
                          bridges: "14 BRIDGES (Patience Addo, Isaac Boye + 12 shared friends)",
                          halo: state.haloByUser["esther boa asiedu"] || "AFT",
                        },
                        {
                          name: "Patience Addo",
                          role: "Director of Enterprise Procurement & Escrow",
                          circle: "1st CIRCLE · Direct Friend",
                          bridges: "12 BRIDGES (Esther Boa Asiedu, Adwoa larbi + 10 shared friends)",
                          halo: state.haloByUser["patience addo"] || "FAC",
                        },
                        {
                          name: "Isaac Boye",
                          role: "Senior Field Engineering & Infrastructure Lead",
                          circle: "1st CIRCLE · Direct Friend",
                          bridges: "11 BRIDGES (Kwesi Asiedu, Marcus Vance + 9 shared friends)",
                          halo: state.haloByUser["isaac boye"] || "AFT",
                        },
                        {
                          name: "Adwoa larbi",
                          role: "NHS Acute Care Clinical Specialist",
                          circle: "1st CIRCLE · Direct Friend",
                          bridges: "8 BRIDGES (Esther Boa Asiedu, Patience Addo + 6 shared friends)",
                          halo: state.haloByUser["adwoa larbi"] || "AFT",
                        },
                      ].map((op) => {
                        const hMeta = HALO_STATUS_META[op.halo] || HALO_STATUS_META.AFT
                        return (
                          <div
                            key={op.name}
                            className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 flex items-start justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-xs">{op.name}</span>
                                <span className={`rounded-full px-2 py-0.2 text-[9.5px] font-extrabold ${hMeta.pillBg}`}>
                                  {hMeta.badgeLabel}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{op.role}</p>
                              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                                <span className="rounded bg-emerald-100 dark:bg-emerald-950/70 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300">
                                  {op.circle}
                                </span>
                                <span className="text-[10.5px] font-semibold text-[#0A66C2] dark:text-sky-400">
                                  🤝 {op.bridges}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: KUDOS (Skill Kudos) & PROOF (Real-Work Proof Notes) */}
              {activeTab === "pvr_wcd" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* KUDOS Skill Vouches */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                    <h3 className="text-sm font-black">
                      KUDOS — Skill Kudos &amp; Vouches (`+ Give Kudos`)
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkillText}
                        onChange={(e) => setNewSkillText(e.target.value)}
                        placeholder="Add a skill to receive KUDOS on..."
                        className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newSkillText.trim()) return
                          void dispatchAction(
                            { action: "vouch_pvr_skill", customSkill: newSkillText.trim() },
                            `✓ Added "${newSkillText.trim()}" to your KUDOS Skill List`
                          )
                          setNewSkillText("")
                        }}
                        className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white px-3 py-1.5 text-xs font-extrabold cursor-pointer"
                      >
                        + Add Skill
                      </button>
                    </div>

                    <div className="space-y-2">
                      {state.pvrSkills.map((sk) => (
                        <div
                          key={sk.id}
                          className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                              {sk.skill}
                            </p>
                            <p className="text-[10.5px] text-zinc-500">
                              {sk.category} · Kudos from {sk.vouchers.slice(0, 3).join(", ")}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              void dispatchAction(
                                { action: "vouch_pvr_skill", skillId: sk.id },
                                `✓ Sent +1 KUDOS for "${sk.skill}"!`
                              )
                            }
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-extrabold shrink-0 cursor-pointer"
                          >
                            👏 Give Kudos ({sk.vouchCount})
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PROOF Real-Work Notes */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                    <h3 className="text-sm font-black">
                      PROOF — Real-Work Proof Notes (Written Peer Appreciation)
                    </h3>
                    <div className="space-y-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 border border-zinc-200 dark:border-zinc-700">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={wcdTarget}
                          onChange={(e) => setWcdTarget(e.target.value)}
                          placeholder="Teammate's Name"
                          className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs"
                        />
                        <input
                          type="text"
                          value={wcdDeliverable}
                          onChange={(e) => setWcdDeliverable(e.target.value)}
                          placeholder="Project or Great Work Delivered Together"
                          className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={wcdCitation}
                        onChange={(e) => setWcdCitation(e.target.value)}
                        placeholder="Write a warm PROOF note sharing what it was like working together..."
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!wcdDeliverable.trim() || !wcdCitation.trim()) return
                          void dispatchAction(
                            {
                              action: "file_wcd_citation",
                              targetMember: wcdTarget,
                              verifiedDeliverable: wcdDeliverable,
                              citationText: wcdCitation,
                            },
                            `✓ Shared a PROOF Note for ${wcdTarget}!`
                          )
                          setWcdDeliverable("")
                          setWcdCitation("")
                        }}
                        className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white px-3.5 py-1.5 text-xs font-extrabold cursor-pointer"
                      >
                        Share PROOF Note
                      </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {state.wcdCitations.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-black text-[#0A66C2] dark:text-sky-400">
                              PROOF #{c.ticketRef.slice(-4)} · {formatFriendlyCircle(c.authorTvRadius)}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                              For: {c.targetMember}
                            </span>
                          </div>
                          <p className="text-xs font-extrabold">{c.verifiedDeliverable}</p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-300 italic">
                            &ldquo;{c.citationText}&rdquo;
                          </p>
                          <p className="text-[10.5px] text-zinc-500">
                            Written by <strong>{c.authorName}</strong> ({c.authorHeadline})
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SPOTLIGHT (Who Visited Your Profile) & COZY Mode (Quiet Browsing) */}
              {activeTab === "prt_radar" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black">
                        SPOTLIGHT — Who Visited Your Profile &amp; COZY Mode (Browse Quietly)
                      </h3>
                      <p className="text-xs text-zinc-500">
                        See the friendly faces and teams who checked out your profile, or turn on COZY Mode whenever you want to browse privately.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        void dispatchAction(
                          { action: "toggle_stealth_cloak" },
                          !myStealthCloak
                            ? "✓ COZY Mode Turned On (You can now browse profiles privately)"
                            : "✓ COZY Mode Turned Off (Visitors can see when you say hello)"
                        )
                      }
                      className={`rounded-xl px-3.5 py-2 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer ${
                        myStealthCloak
                          ? "bg-purple-700 text-white"
                          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      {myStealthCloak ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span>
                        {myStealthCloak ? "COZY Private Mode: ON" : "Turn On COZY Private Mode"}
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {state.prtRadarEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded bg-blue-100 dark:bg-blue-950/70 px-2 py-0.5 text-[10px] font-mono font-extrabold text-[#0A66C2] dark:text-sky-300">
                            Found you via: {ev.entryVector.replace("TVR Graph Bridge", "Shared Friend Bridge")}
                          </span>
                          <span className="text-[10.5px] font-mono text-zinc-400">
                            {ev.timestampLabel}
                          </span>
                        </div>
                        <p className="text-xs font-extrabold">{ev.viewerName}</p>
                        <p className="text-[11px] text-zinc-500">{ev.viewerHeadline}</p>
                        <div className="flex items-center justify-between pt-1 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400">
                          <span>{ev.viewerOrg}</span>
                          <span>
                            {formatFriendlyCircle(ev.tvrLevel)} · {ev.sharedBridgeNodes} Bridges
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: QUICK-PITCH (1-Tap Apply) & MATCH-BOARD (Friendly Hiring Progress Board) */}
              {activeTab === "ftt_tor" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-4 space-y-2.5">
                    <h3 className="text-sm font-black">
                      QUICK-PITCH (1-Tap Apply) &amp; MATCH-BOARD (Live Hiring Progress)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        value={fttTitle}
                        onChange={(e) => setFttTitle(e.target.value)}
                        placeholder="Role or Project You Want to Pitch For..."
                        className="flex-1 min-w-[220px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        value={fttEnterprise}
                        onChange={(e) => setFttEnterprise(e.target.value)}
                        placeholder="Team or Company Name"
                        className="w-60 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          void dispatchAction(
                            {
                              action: "file_ftt_ticket",
                              ticketTitle: fttTitle || "Principal Cloud & Systems Lead",
                              enterpriseName: fttEnterprise,
                            },
                            "✓ Sent 1-Tap QUICK-PITCH with your Profile, KUDOS & Verified Phone!"
                          )
                          setFttTitle("")
                        }}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 text-xs font-extrabold cursor-pointer"
                      >
                        ⚡ 1-Tap QUICK-PITCH
                      </button>
                    </div>
                  </div>

                  {/* 4-Stage Friendly MATCH-BOARD */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(
                      [
                        { raw: "Ticket Filed", label: "1. Pitched 👋" },
                        { raw: "Dossier Vetted", label: "2. Reviewed ✨" },
                        { raw: "Technical Trial", label: "3. Team Chat 💬" },
                        { raw: "Ticket Awarded", label: "4. Welcomed / Hired 🎉" },
                      ] as const
                    ).map((stageObj) => {
                      const items = state.torPipeline.filter((c) => c.stage === stageObj.raw)
                      return (
                        <div
                          key={stageObj.raw}
                          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 p-3 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black tracking-wide">
                              {stageObj.label}
                            </span>
                            <span className="rounded-full bg-[#0A66C2] text-white px-2 py-0.2 text-[10px] font-black">
                              {items.length}
                            </span>
                          </div>
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 space-y-1.5 shadow-2xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] font-black text-[#0A66C2]">
                                  Match {item.pvrScore}% · KUDOS Verified
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700">
                                  1st Circle
                                </span>
                              </div>
                              <p className="text-xs font-extrabold">{item.ticketTitle}</p>
                              <p className="text-[11px] text-zinc-500">{item.enterpriseName}</p>
                              <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                                👤 {item.candidateName} ({item.candidatePhone})
                              </p>
                              <p className="text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-400">
                                {item.CompensationBand}
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  void dispatchAction(
                                    { action: "advance_tor_stage", candidateId: item.id },
                                    `✓ Moved ${item.candidateName} forward on the MATCH-BOARD!`
                                  )
                                }
                                className="w-full rounded-lg bg-zinc-100 hover:bg-[#0A66C2] hover:text-white dark:bg-zinc-800 px-2.5 py-1 text-[10.5px] font-extrabold transition-colors cursor-pointer"
                              >
                                Move to Next Step →
                              </button>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* TAB 5: TEAM-HUBS (Company Pages) & FIND-PROS (Smart People Filter) */}
              {activeTab === "esh_hubs" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-3.5">
                    <div>
                      <h3 className="text-sm font-black">
                        TEAM-HUBS (Company &amp; Community Hubs) &amp; FIND-PROS Filter
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Explore verified teams, see people who work there, and filter members by Circle or Photo Ring.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={totFilterTvr}
                        onChange={(e) => setTotFilterTvr(e.target.value)}
                        className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-bold"
                      >
                        <option value="ALL">All Circles</option>
                        <option value="TVR-L1">1st Circle (Direct Friends)</option>
                        <option value="TVR-L2">2nd Circle (Warm Intro)</option>
                      </select>
                      <select
                        value={totFilterHalo}
                        onChange={(e) => setTotFilterHalo(e.target.value)}
                        className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-bold"
                      >
                        <option value="ALL">All Photo Rings</option>
                        <option value="AFT">#READY (Open for Work)</option>
                        <option value="SCO">#TEAMING (Hiring)</option>
                        <option value="FAC">#MENTOR (Advising)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {state.eshEnterprises.map((hub) => {
                      const isSub = hub.subscribers.includes(userName)
                      const filteredOps = hub.featuredOperators.filter(
                        (op) =>
                          (totFilterTvr === "ALL" || op.tvr === totFilterTvr) &&
                          (totFilterHalo === "ALL" || op.halo === totFilterHalo)
                      )
                      return (
                        <div
                          key={hub.id}
                          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2.5 flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="rounded bg-indigo-100 dark:bg-indigo-950/70 px-2 py-0.5 text-[10px] font-mono font-black text-indigo-800 dark:text-indigo-300">
                                TEAM-HUB
                              </span>
                              <span className="text-[11px] font-extrabold text-emerald-700">
                                Community Rating: {hub.trustIndexScore}%
                              </span>
                            </div>
                            <h4 className="text-sm font-black">{hub.name}</h4>
                            <p className="text-[11px] text-zinc-500">{hub.sector}</p>
                            <p className="text-xs text-zinc-700 dark:text-zinc-300 italic">
                              {hub.tagline}
                            </p>
                            <div className="pt-1 flex items-center gap-3 text-[11px] font-bold text-[#0A66C2]">
                              <span>👥 {hub.verifiedOperatorsCount} Members</span>
                              <span>⚡ {hub.openFttTicketsCount} Open Roles</span>
                            </div>

                            <div className="pt-2 space-y-1 border-t border-zinc-100 dark:border-zinc-800">
                              <p className="text-[10px] font-extrabold uppercase text-zinc-400">
                                FIND-PROS Matches ({filteredOps.length}):
                              </p>
                              {filteredOps.map((op) => {
                                const hMeta = HALO_STATUS_META[op.halo] || HALO_STATUS_META.AFT
                                return (
                                  <div
                                    key={op.name}
                                    className="flex items-center justify-between text-[11px]"
                                  >
                                    <span className="font-bold">
                                      {op.name} · {op.role}
                                    </span>
                                    <span className="font-mono text-[10px] text-emerald-700">
                                      {hMeta.friendlyCode}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              void dispatchAction(
                                { action: "toggle_esh_subscribe", eshId: hub.id },
                                isSub
                                  ? `Unfollowed ${hub.name}`
                                  : `✓ Joined ${hub.name} TEAM-HUB!`
                              )
                            }
                            className={`w-full rounded-xl py-2 text-xs font-extrabold cursor-pointer ${
                              isSub
                                ? "bg-emerald-600 text-white"
                                : "bg-[#0A66C2] hover:bg-[#004182] text-white"
                            }`}
                          >
                            {isSub
                              ? `✓ Following Team (${hub.subscribers.length})`
                              : `+ Follow TEAM-HUB (${hub.subscribers.length})`}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* TAB 6: SLIDE-STORIES (Swipable Carousels) & WEEKLY-SPARK (Creator Newsletters) */}
              {activeTab === "bdp_edw" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* SLIDE-STORIES Publisher */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                    <h3 className="text-sm font-black">
                      SLIDE-STORIES — Create a Swipable Visual Guide
                    </h3>
                    <input
                      type="text"
                      value={bdpTitle}
                      onChange={(e) => setBdpTitle(e.target.value)}
                      placeholder="Slide Story Title (e.g., 3 Steps to Faster Field Estimates)..."
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs"
                    />
                    <textarea
                      rows={2}
                      value={bdpSlide1}
                      onChange={(e) => setBdpSlide1(e.target.value)}
                      placeholder="Card 1 Tip or Key Insight..."
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs"
                    />
                    <textarea
                      rows={2}
                      value={bdpSlide2}
                      onChange={(e) => setBdpSlide2(e.target.value)}
                      placeholder="Card 2 Action Step or Takeaway..."
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!bdpTitle.trim() || !bdpSlide1.trim()) return
                        void dispatchAction(
                          {
                            action: "publish_bdp_deck",
                            title: bdpTitle,
                            slide1: bdpSlide1,
                            slide2: bdpSlide2,
                          },
                          `✓ Published SLIDE-STORY "${bdpTitle}" to the Home Feed!`
                        )
                        setBdpTitle("")
                        setBdpSlide1("")
                        setBdpSlide2("")
                        setDeckIndex(0)
                        setSlideIndex(0)
                      }}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-xs font-extrabold cursor-pointer"
                    >
                      + Publish SLIDE-STORY
                    </button>
                  </div>

                  {/* WEEKLY-SPARK Digest Subscriptions */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                    <h3 className="text-sm font-black">
                      WEEKLY-SPARK — Friendly Creator Digests &amp; Series
                    </h3>
                    <div className="space-y-2.5">
                      {state.edwDispatches.map((wire) => {
                        const isSub = wire.subscribedBy.includes(userName)
                        return (
                          <div
                            key={wire.id}
                            className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-black text-[#0A66C2]">
                                WEEKLY-SPARK · {wire.cadence}
                              </span>
                              <span className="text-[10.5px] font-bold text-zinc-500">
                                {wire.subscribersCount.toLocaleString()} Readers
                              </span>
                            </div>
                            <h4 className="text-xs font-black">{wire.title}</h4>
                            <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                              {wire.summary}
                            </p>
                            <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                              ✨ {wire.latestIssueHeadline} ({wire.publishedAtLabel})
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                void dispatchAction(
                                  { action: "toggle_edw_subscribe", edwId: wire.id },
                                  isSub
                                    ? `Unsubscribed from ${wire.title}`
                                    : `✓ Subscribed to WEEKLY-SPARK: ${wire.title}!`
                                )
                              }
                              className={`rounded-lg px-3 py-1 text-[11px] font-extrabold cursor-pointer ${
                                isSub
                                  ? "bg-emerald-600 text-white"
                                  : "bg-[#0A66C2] text-white"
                              }`}
                            >
                              {isSub ? "✓ Subscribed to SPARK" : "+ Subscribe to WEEKLY-SPARK"}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: HIRE-A-PRO (Direct Project & Helper Desk) */}
              {activeTab === "bex_exchange" && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-black">
                      HIRE-A-PRO — Direct Project &amp; Expert Helper Desk
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Book verified ConnectLn pros directly for projects, consultations, or hands-on help.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {state.bexExperts.map((ex) => {
                      const hMeta = HALO_STATUS_META[ex.halo] || HALO_STATUS_META.AFT
                      const scopeText = rfpScopeByExpert[ex.id] || ""
                      return (
                        <div
                          key={ex.id}
                          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2.5 flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-black text-[#0A66C2]">
                                PRO · {formatFriendlyCircle(ex.tvrLevel)}
                              </span>
                              <span className={`rounded-full px-2 py-0.2 text-[9.5px] font-extrabold ${hMeta.pillBg}`}>
                                {hMeta.badgeLabel}
                              </span>
                            </div>
                            <h4 className="text-sm font-black">{ex.expertName}</h4>
                            <p className="text-[11px] text-zinc-500">{ex.expertHeadline}</p>
                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                              {ex.specialty}
                            </p>
                            <p className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400">
                              {ex.rateBand}
                            </p>
                            <p className="text-[10.5px] text-zinc-500">
                              ✓ {ex.completedTickets} Projects Completed · {ex.pvrVouches} KUDOS ·{" "}
                              {ex.sharedBridgeNodes} Shared Friends
                            </p>
                            {ex.rfpInquiries.length > 0 && (
                              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2 text-[10.5px]">
                                <strong>Latest Project Request:</strong>{" "}
                                {ex.rfpInquiries[0].projectScope} (from {ex.rfpInquiries[0].clientName})
                              </div>
                            )}
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            <input
                              type="text"
                              value={scopeText}
                              onChange={(e) =>
                                setRfpScopeByExpert((prev) => ({
                                  ...prev,
                                  [ex.id]: e.target.value,
                                }))
                              }
                              placeholder="Describe how they can help..."
                              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const scope =
                                  scopeText.trim() ||
                                  `Project & Consultation Request for ${ex.expertName}`
                                void dispatchAction(
                                  {
                                    action: "commission_bex_expert",
                                    bexId: ex.id,
                                    projectScope: scope,
                                  },
                                  `✓ Sent HIRE-A-PRO Request to ${ex.expertName}!`
                                )
                                setRfpScopeByExpert((prev) => ({ ...prev, [ex.id]: "" }))
                              }}
                              className="w-full rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white py-1.5 text-xs font-extrabold cursor-pointer"
                            >
                              🤝 Request Help from {ex.expertName.split(" ")[0]}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
