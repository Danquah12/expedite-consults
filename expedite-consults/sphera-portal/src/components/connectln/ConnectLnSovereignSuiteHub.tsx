"use client"

import React, { useEffect, useState } from "react"
import {
  ShieldCheck,
  Award,
  Radar,
  Kanban,
  Building2,
  Layers,
  Newspaper,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  EyeOff,
  Eye,
  Sparkles,
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
    badgeLabel: string
    fullName: string
    ringClass: string
    pillBg: string
    description: string
  }
> = {
  AFT: {
    code: "AFT",
    badgeLabel: "#AFT · Active For Tickets",
    fullName: "Active For Tickets (AFT)",
    ringClass: "ring-3 ring-emerald-500 border-2 border-white",
    pillBg: "bg-emerald-600 text-white",
    description: "Ready for new contracts, field tickets, shifts & direct missions",
  },
  SCO: {
    code: "SCO",
    badgeLabel: "#SCO · Seeking Core Operators",
    fullName: "Seeking Core Operators (SCO)",
    ringClass: "ring-3 ring-amber-500 border-2 border-white",
    pillBg: "bg-amber-600 text-white",
    description: "Actively commissioning operators, awarding bounties & hiring talent",
  },
  FAC: {
    code: "FAC",
    badgeLabel: "#FAC · Fractional Advisory",
    fullName: "Fractional Advisory Console (FAC)",
    ringClass: "ring-3 ring-indigo-500 border-2 border-white",
    pillBg: "bg-indigo-600 text-white",
    description: "Available for architectural reviews, board advisory & expert audits",
  },
  LOCK: {
    code: "LOCK",
    badgeLabel: "#LOCK · Mission Locked",
    fullName: "Mission Locked (LOCK)",
    ringClass: "ring-2 ring-zinc-500 border-2 border-white",
    pillBg: "bg-zinc-700 text-white",
    description: "Deployed at full capacity on active sovereign assignment",
  },
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
  userHeadline = "Verified ConnectLn Operator",
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
  const [fttEnterprise, setFttEnterprise] = useState<string>("Expedite Consults Sovereign Group")
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
      `✓ Sovereign Avatar Halo switched to ${HALO_STATUS_META[next].badgeLabel}`
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
      {/* 1. COMPACT SOVEREIGN COMMAND STRIP (100% Original ConnectLn Acronyms) */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 shadow-xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-[#0A66C2] text-white text-xs font-black shrink-0">
              CLN
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                  Sovereign Operator Telemetry &amp; Execution Suite
                </span>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                  TVR-L1 · 16 SBNs
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                Proprietary ConnectLn stack: TVR Graph · #AFT/#SCO Halo · PVR Vouches · WCD Citations · PRT Radar · FTT/TOR Pipeline · ESH Hubs · BDP Decks · BEX
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={cycleHalo}
              className={`rounded-full px-3 py-1 text-[11px] font-extrabold shadow-2xs transition-opacity hover:opacity-95 cursor-pointer ${haloMeta.pillBg}`}
              title="Click to cycle your Sovereign Avatar Halo (#AFT, #SCO, #FAC, #LOCK)"
            >
              {haloMeta.badgeLabel}
            </button>
            <button
              type="button"
              onClick={() => setIsConsoleOpen(true)}
              className="rounded-full border border-[#0A66C2] bg-blue-50/80 dark:bg-blue-950/40 hover:bg-[#0A66C2] hover:text-white px-3 py-1 text-[11px] font-extrabold text-[#0A66C2] dark:text-sky-300 transition-colors cursor-pointer"
            >
              Open Sovereign Suite →
            </button>
          </div>
        </div>

        {/* Acronym Quick-Launch Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            {
              id: "tvr_halo" as SovereignTabId,
              acronym: "TVR + SBN",
              label: "Trust Vector & Halo Rings",
              badge: haloMeta.code,
            },
            {
              id: "pvr_wcd" as SovereignTabId,
              acronym: "PVR + WCD",
              label: "Peer Vouches & Citations",
              badge: `${totalPvrVouches || 93}`,
            },
            {
              id: "prt_radar" as SovereignTabId,
              acronym: "PRT + SCM",
              label: "Profile Radar Telemetry",
              badge: myStealthCloak ? "Cloaked" : `${state?.prtRadarEvents.length || 4} Live`,
            },
            {
              id: "ftt_tor" as SovereignTabId,
              acronym: "FTT + TOR",
              label: "Fast-Track & Talent Radar",
              badge: `${state?.torPipeline.length || 4} Tickets`,
            },
            {
              id: "esh_hubs" as SovereignTabId,
              acronym: "ESH + TOT",
              label: "Enterprise Sovereign Hubs",
              badge: `${state?.eshEnterprises.length || 3} Hubs`,
            },
            {
              id: "bdp_edw" as SovereignTabId,
              acronym: "BDP + EDW",
              label: "Blueprint Decks & Dispatches",
              badge: `${decks.length || 2} Decks`,
            },
            {
              id: "bex_exchange" as SovereignTabId,
              acronym: "BEX",
              label: "Bounty & Expert Exchange",
              badge: `${state?.bexExperts.length || 3} Experts`,
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

        {/* Inline Interactive BDP (Blueprint Deck Carousel) Preview */}
        {currentDeck && currentSlide && (
          <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-[#0E1726] to-slate-900 p-3.5 text-white space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider">
                  {currentDeck.code} · BDP Carousel
                </span>
                <span className="text-xs font-extrabold truncate">{currentDeck.title}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10.5px] font-mono text-indigo-300">
                  Slide {slideIndex + 1}/{slides.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)
                  }
                  className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                  title="Previous Slide"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSlideIndex((prev) => (prev + 1) % slides.length)}
                  className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                  title="Next Slide"
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
                    Next Deck ({(deckIndex + 1) % decks.length + 1}/{decks.length})
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
                Spec: {currentSlide.keySpec}
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

      {/* 2. FULL INTERACTIVE SOVEREIGN SUITE MODAL / WORKSPACE */}
      {isConsoleOpen && state && (
        <div className="fixed inset-0 z-[85] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-5xl max-h-[90vh] rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#0A66C2] via-indigo-700 to-slate-900 text-white flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-mono font-black uppercase">
                    CONNECTLN SOVEREIGN SUITE · CLOUD KV SYNCED
                  </span>
                  <span className="rounded-full bg-emerald-500/25 border border-emerald-300/40 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-200">
                    {haloMeta.badgeLabel}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black mt-1">
                  ConnectLn Sovereign Intelligence &amp; Execution Architecture
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

            {/* Sub-Navigation Acronym Tabs */}
            <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/70 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: "tvr_halo", label: "1. TVR Graph & #AFT/#SCO Halo", icon: Network },
                { id: "pvr_wcd", label: "2. PVR Vouches & WCD Citations", icon: Award },
                { id: "prt_radar", label: "3. PRT Profile Radar & SCM Cloak", icon: Radar },
                { id: "ftt_tor", label: "4. FTT Fast-Track & TOR Kanban", icon: Kanban },
                { id: "esh_hubs", label: "5. ESH Enterprise Hubs & TOT Filters", icon: Building2 },
                { id: "bdp_edw", label: "6. BDP Blueprint Decks & EDW Wire", icon: Layers },
                { id: "bex_exchange", label: "7. BEX Bounty & Expert Exchange", icon: Briefcase },
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
              {/* TAB 1: TVR (Trust Vector Radius), SBN (Shared Bridge Nodes) & AFT/SCO/FAC Avatar Halo Rings */}
              {activeTab === "tvr_halo" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-4 space-y-3">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                      Sovereign Avatar Halo Ring (`#AFT` · `#SCO` · `#FAC` · `#LOCK`)
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Select your active operator halo ring. It updates your profile ring across ConnectLn and syncs to Firebase Cloud KV:
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

                  {/* TVR & SBN Live Operator Graph Matrix */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-black">
                          TVR (Trust Vector Radius) &amp; SBN (Shared Bridge Nodes) Graph
                        </h3>
                        <p className="text-xs text-zinc-500">
                          Replaces generic connection degrees with cryptographic trust distance (`TVR-L1 Direct`, `TVR-L2 Bridged`, `TVR-L3 Extended`) and exact Shared Bridge Nodes (`SBNs`).
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          name: "Esther Boa Asiedu",
                          role: "Principal Healthcare Operations Lead",
                          phone: "+1 (410) 841-8358",
                          tvr: "TVR-L1 · Direct Verified Peer",
                          sbns: "14 SBNs (Patience Addo, Isaac Boye + 12 others)",
                          halo: state.haloByUser["esther boa asiedu"] || "AFT",
                        },
                        {
                          name: "Patience Addo",
                          role: "Director of Enterprise Procurement & Escrow",
                          phone: "+1 (240) 555-0821",
                          tvr: "TVR-L1 · Direct Verified Peer",
                          sbns: "12 SBNs (Esther Boa Asiedu, Adwoa larbi + 10 others)",
                          halo: state.haloByUser["patience addo"] || "FAC",
                        },
                        {
                          name: "Isaac Boye",
                          role: "Senior Field Engineering & Infrastructure Lead",
                          phone: "+233 20 555 0412",
                          tvr: "TVR-L1 · Direct Verified Peer",
                          sbns: "11 SBNs (Kwesi Asiedu, Marcus Vance + 9 others)",
                          halo: state.haloByUser["isaac boye"] || "AFT",
                        },
                        {
                          name: "Adwoa larbi",
                          role: "NHS Acute Care Clinical Specialist",
                          phone: "+44 7534 700899",
                          tvr: "TVR-L1 · Direct Verified Peer",
                          sbns: "8 SBNs (Esther Boa Asiedu, Patience Addo + 6 others)",
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
                                  {op.tvr}
                                </span>
                                <span className="text-[10.5px] font-semibold text-[#0A66C2] dark:text-sky-400">
                                  🔗 {op.sbns}
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

              {/* TAB 2: PVR (Peer Vouch Ledger) & WCD (Work Citation Dossiers) */}
              {activeTab === "pvr_wcd" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* PVR Skill Vouches */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                    <h3 className="text-sm font-black">
                      PVR — Peer Vouch Ledger (`+1 Vouch` Verified Capabilities)
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkillText}
                        onChange={(e) => setNewSkillText(e.target.value)}
                        placeholder="Add new capability to PVR Ledger..."
                        className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newSkillText.trim()) return
                          void dispatchAction(
                            { action: "vouch_pvr_skill", customSkill: newSkillText.trim() },
                            `✓ Added "${newSkillText.trim()}" to PVR Peer Vouch Ledger`
                          )
                          setNewSkillText("")
                        }}
                        className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white px-3 py-1.5 text-xs font-extrabold cursor-pointer"
                      >
                        + Add PVR
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
                              {sk.category} · Vouched by {sk.vouchers.slice(0, 3).join(", ")}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              void dispatchAction(
                                { action: "vouch_pvr_skill", skillId: sk.id },
                                `✓ Issued PVR Vouch for "${sk.skill}"`
                              )
                            }
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-extrabold shrink-0 cursor-pointer"
                          >
                            + Vouch ({sk.vouchCount})
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* WCD Work Citation Dossiers */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                    <h3 className="text-sm font-black">
                      WCD — Work Citation Dossiers (Verified Deliverable Attestations)
                    </h3>
                    <div className="space-y-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 border border-zinc-200 dark:border-zinc-700">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={wcdTarget}
                          onChange={(e) => setWcdTarget(e.target.value)}
                          placeholder="Recipient Operator Name"
                          className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs"
                        />
                        <input
                          type="text"
                          value={wcdDeliverable}
                          onChange={(e) => setWcdDeliverable(e.target.value)}
                          placeholder="Verified Ticket / Deliverable Name"
                          className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={wcdCitation}
                        onChange={(e) => setWcdCitation(e.target.value)}
                        placeholder="Write Work Citation Dossier (WCD) attesting to real work delivered..."
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
                            `✓ Filed WCD Work Citation Dossier for ${wcdTarget}`
                          )
                          setWcdDeliverable("")
                          setWcdCitation("")
                        }}
                        className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white px-3.5 py-1.5 text-xs font-extrabold cursor-pointer"
                      >
                        File WCD Citation Dossier
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
                              {c.ticketRef} · {c.authorTvRadius}
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
                            Signed by <strong>{c.authorName}</strong> ({c.authorHeadline})
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PRT (Profile Radar Telemetry) & SCM (Stealth Cloaking Mode) */}
              {activeTab === "prt_radar" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black">
                        PRT — Profile Radar Telemetry &amp; SCM (Stealth Cloaking Mode)
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Tracks every operator, recruiter, and enterprise enclave that inspected your dossier and which discovery vector brought them.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        void dispatchAction(
                          { action: "toggle_stealth_cloak" },
                          !myStealthCloak
                            ? "✓ SCM Stealth Cloaking Mode Activated (Anonymous Radar Browsing)"
                            : "✓ SCM Stealth Cloaking Mode Deactivated (Full Radar Visibility)"
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
                        {myStealthCloak ? "SCM Stealth Cloak: ACTIVE" : "Enable SCM Stealth Cloak"}
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
                            Vector: {ev.entryVector}
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
                            {ev.tvrLevel} · {ev.sharedBridgeNodes} SBNs
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: FTT (1-Tap Fast-Track Ticket) & TOR (Talent Operations Radar Kanban) */}
              {activeTab === "ftt_tor" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-4 space-y-2.5">
                    <h3 className="text-sm font-black">
                      1-Tap FTT (Fast-Track Ticket) &amp; TOR (Talent Operations Radar Kanban)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        value={fttTitle}
                        onChange={(e) => setFttTitle(e.target.value)}
                        placeholder="Role / Mission Ticket Title (e.g., Senior Zero-Trust Cloud Architect)..."
                        className="flex-1 min-w-[220px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        value={fttEnterprise}
                        onChange={(e) => setFttEnterprise(e.target.value)}
                        placeholder="Enterprise Hub"
                        className="w-60 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          void dispatchAction(
                            {
                              action: "file_ftt_ticket",
                              ticketTitle: fttTitle || "Principal Sovereign Systems Architect",
                              enterpriseName: fttEnterprise,
                            },
                            "✓ Filed 1-Tap FTT (Fast-Track Ticket) with auto-attached PVR & 2FA Dossier!"
                          )
                          setFttTitle("")
                        }}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 text-xs font-extrabold cursor-pointer"
                      >
                        ⚡ 1-Tap File FTT Ticket
                      </button>
                    </div>
                  </div>

                  {/* 4-Stage TOR Kanban Board */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(
                      [
                        "Ticket Filed",
                        "Dossier Vetted",
                        "Technical Trial",
                        "Ticket Awarded",
                      ] as const
                    ).map((stage) => {
                      const items = state.torPipeline.filter((c) => c.stage === stage)
                      return (
                        <div
                          key={stage}
                          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 p-3 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider">
                              {stage}
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
                                  {item.ticketId} · PVR {item.pvrScore}%
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700">
                                  {item.tvrLevel}
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
                                    `✓ Advanced ${item.candidateName} (${item.ticketId}) in TOR Pipeline`
                                  )
                                }
                                className="w-full rounded-lg bg-zinc-100 hover:bg-[#0A66C2] hover:text-white dark:bg-zinc-800 px-2.5 py-1 text-[10.5px] font-extrabold transition-colors cursor-pointer"
                              >
                                Advance Stage →
                              </button>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* TAB 5: ESH (Enterprise Sovereign Hubs) & TOT (Talent & Operator Telemetry Filters) */}
              {activeTab === "esh_hubs" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-3.5">
                    <div>
                      <h3 className="text-sm font-black">
                        ESH (Enterprise Sovereign Hubs) &amp; TOT (Operator Telemetry Filter)
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Filter verified enterprise operators by Trust Vector Radius (`TVR`) and Sovereign Halo (`#AFT / #SCO / #FAC`).
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={totFilterTvr}
                        onChange={(e) => setTotFilterTvr(e.target.value)}
                        className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-bold"
                      >
                        <option value="ALL">All TVR Levels</option>
                        <option value="TVR-L1">TVR-L1 Direct Only</option>
                        <option value="TVR-L2">TVR-L2 Bridged</option>
                      </select>
                      <select
                        value={totFilterHalo}
                        onChange={(e) => setTotFilterHalo(e.target.value)}
                        className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-bold"
                      >
                        <option value="ALL">All Halo Rings</option>
                        <option value="AFT">#AFT Active For Tickets</option>
                        <option value="SCO">#SCO Seeking Operators</option>
                        <option value="FAC">#FAC Fractional Advisory</option>
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
                                {hub.code}
                              </span>
                              <span className="text-[11px] font-extrabold text-emerald-700">
                                Trust Index: {hub.trustIndexScore}%
                              </span>
                            </div>
                            <h4 className="text-sm font-black">{hub.name}</h4>
                            <p className="text-[11px] text-zinc-500">{hub.sector}</p>
                            <p className="text-xs text-zinc-700 dark:text-zinc-300 italic">
                              {hub.tagline}
                            </p>
                            <div className="pt-1 flex items-center gap-3 text-[11px] font-bold text-[#0A66C2]">
                              <span>👥 {hub.verifiedOperatorsCount} Operators</span>
                              <span>⚡ {hub.openFttTicketsCount} Open FTTs</span>
                            </div>

                            <div className="pt-2 space-y-1 border-t border-zinc-100 dark:border-zinc-800">
                              <p className="text-[10px] font-extrabold uppercase text-zinc-400">
                                TOT Filtered Operators ({filteredOps.length}):
                              </p>
                              {filteredOps.map((op) => (
                                <div
                                  key={op.name}
                                  className="flex items-center justify-between text-[11px]"
                                >
                                  <span className="font-bold">
                                    {op.name} · {op.role}
                                  </span>
                                  <span className="font-mono text-[10px] text-emerald-700">
                                    {op.tvr} · #{op.halo}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              void dispatchAction(
                                { action: "toggle_esh_subscribe", eshId: hub.id },
                                isSub
                                  ? `Unfollowed ${hub.name}`
                                  : `✓ Subscribed to ${hub.name} (${hub.code})`
                              )
                            }
                            className={`w-full rounded-xl py-2 text-xs font-extrabold cursor-pointer ${
                              isSub
                                ? "bg-emerald-600 text-white"
                                : "bg-[#0A66C2] hover:bg-[#004182] text-white"
                            }`}
                          >
                            {isSub
                              ? `✓ Subscribed (${hub.subscribers.length})`
                              : `+ Subscribe to ESH Hub (${hub.subscribers.length})`}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* TAB 6: BDP (Blueprint Deck Carousel) & EDW (Executive Dispatch Wire) */}
              {activeTab === "bdp_edw" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* BDP Blueprint Deck Publisher */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                    <h3 className="text-sm font-black">
                      BDP — Publish a Multi-Slide Blueprint Deck Carousel
                    </h3>
                    <input
                      type="text"
                      value={bdpTitle}
                      onChange={(e) => setBdpTitle(e.target.value)}
                      placeholder="Blueprint Deck Title (e.g., Zero-Trust Cloud & Field Spec)..."
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs"
                    />
                    <textarea
                      rows={2}
                      value={bdpSlide1}
                      onChange={(e) => setBdpSlide1(e.target.value)}
                      placeholder="Slide 1 Specification & Metrics..."
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs"
                    />
                    <textarea
                      rows={2}
                      value={bdpSlide2}
                      onChange={(e) => setBdpSlide2(e.target.value)}
                      placeholder="Slide 2 Field Verification & Milestone Spec..."
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
                          `✓ Published BDP Blueprint Deck "${bdpTitle}" to Feed Carousel!`
                        )
                        setBdpTitle("")
                        setBdpSlide1("")
                        setBdpSlide2("")
                        setDeckIndex(0)
                        setSlideIndex(0)
                      }}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-xs font-extrabold cursor-pointer"
                    >
                      + Publish BDP Blueprint Deck
                    </button>
                  </div>

                  {/* EDW Executive Dispatch Wire */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                    <h3 className="text-sm font-black">
                      EDW — Executive Dispatch Wire (Serialized Briefings)
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
                                {wire.wireCode} · {wire.cadence}
                              </span>
                              <span className="text-[10.5px] font-bold text-zinc-500">
                                {wire.subscribersCount.toLocaleString()} Subscribers
                              </span>
                            </div>
                            <h4 className="text-xs font-black">{wire.title}</h4>
                            <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                              {wire.summary}
                            </p>
                            <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                              📰 {wire.latestIssueHeadline} ({wire.publishedAtLabel})
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                void dispatchAction(
                                  { action: "toggle_edw_subscribe", edwId: wire.id },
                                  isSub
                                    ? `Unsubscribed from ${wire.wireCode}`
                                    : `✓ Subscribed to ${wire.title} (${wire.wireCode})`
                                )
                              }
                              className={`rounded-lg px-3 py-1 text-[11px] font-extrabold cursor-pointer ${
                                isSub
                                  ? "bg-emerald-600 text-white"
                                  : "bg-[#0A66C2] text-white"
                              }`}
                            >
                              {isSub ? "✓ Subscribed to EDW Wire" : "+ Subscribe to EDW Wire"}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: BEX (Bounty & Expert Exchange — Direct RFP Commission Desk) */}
              {activeTab === "bex_exchange" && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-black">
                      BEX — Bounty &amp; Expert Exchange (Direct RFP &amp; Milestone Commissions)
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Commission 2FA-verified ConnectLn specialists directly with milestone escrow and `PVR` vouch guarantees.
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
                                {ex.bexCode} · {ex.tvrLevel}
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
                              ✓ {ex.completedTickets} Tickets Delivered · {ex.pvrVouches} PVR Vouches ·{" "}
                              {ex.sharedBridgeNodes} SBNs
                            </p>
                            {ex.rfpInquiries.length > 0 && (
                              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2 text-[10.5px]">
                                <strong>Latest RFP Ticket:</strong>{" "}
                                {ex.rfpInquiries[0].projectScope} (by {ex.rfpInquiries[0].clientName})
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
                              placeholder="Enter RFP mission scope..."
                              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const scope =
                                  scopeText.trim() ||
                                  `Direct BEX Architecture & Execution Ticket for ${ex.expertName}`
                                void dispatchAction(
                                  {
                                    action: "commission_bex_expert",
                                    bexId: ex.id,
                                    projectScope: scope,
                                  },
                                  `✓ Dispatched BEX Commission Ticket to ${ex.expertName}`
                                )
                                setRfpScopeByExpert((prev) => ({ ...prev, [ex.id]: "" }))
                              }}
                              className="w-full rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white py-1.5 text-xs font-extrabold cursor-pointer"
                            >
                              ⚡ Issue BEX Commission Ticket
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
