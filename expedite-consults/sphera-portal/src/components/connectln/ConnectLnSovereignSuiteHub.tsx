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
  QrCode,
  FileDown,
  Sparkles,
  Brain,
  Bell,
  Rocket,
  CalendarClock,
  PartyPopper,
  GraduationCap,
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

type HubCategoryTabId =
  | "circle_identity"
  | "kudos_spotlight"
  | "stories_wisdom"
  | "cheers_brain"
  | "jobs_teams_boost"

const DAILY_BRAIN_QUESTIONS = [
  {
    q: "In NEC electrical & commercial framing rough-ins, when must a 16-gauge steel nail plate be installed over a bored stud?",
    options: [
      "When the edge of the hole is less than 1.25 inches from the nearest edge of the wood stud",
      "Only on exterior masonry walls",
      "Only when running low-voltage Cat6 cables",
    ],
    correctIdx: 0,
    explanation:
      "Correct! NEC 300.4(A)(1) requires a 1/16-inch (16-gauge) steel plate whenever the edge of a bored hole is less than 1.25 inches from the stud edge.",
  },
  {
    q: "In WebRTC internet voice/video calling across symmetric NAT firewalls, what server relays encrypted media packets when direct STUN P2P is blocked?",
    options: ["TURN Server (Traversal Using Relays around NAT)", "DNS MX Record", "SMTP Relay"],
    correctIdx: 0,
    explanation:
      "Correct! A TURN relay (like ConnectLn's Cloudflare TURN + OpenRelay fabric) guarantees audio/video delivery across strict firewalls.",
  },
]

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
  const [activeTab, setActiveTab] = useState<HubCategoryTabId>("circle_identity")
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

  // New 7 features states
  const [cohortSearch, setCohortSearch] = useState<string>("")
  const [wisdomTipByNote, setWisdomTipByNote] = useState<Record<string, string>>({})
  const [laterPostContent, setLaterPostContent] = useState<string>("")
  const [laterPostWhen, setLaterPostWhen] = useState<string>("Tomorrow · 9:00 AM")
  const [brainQuestionIdx, setBrainQuestionIdx] = useState<number>(0)
  const [selectedBrainOption, setSelectedBrainOption] = useState<number | null>(null)
  const [boostTitle, setBoostTitle] = useState<string>("")
  const [boostProfession, setBoostProfession] = useState<string>("Skilled Trades, Healthcare & Cloud")
  const [boostCity, setBoostCity] = useState<string>("Maryland, London & Accra")
  const [boostBudget, setBoostBudget] = useState<string>("$25/day")

  // Zero-clutter additions: VOICE-TAG & PIN-BOARD
  const [voiceTagPhrase, setVoiceTagPhrase] = useState<string>("")
  const [pinTitle, setPinTitle] = useState<string>("")
  const [pinSummary, setPinSummary] = useState<string>("")

  const handlePlayVoiceTag = (customPhrase?: string) => {
    const phraseToSpeak =
      (customPhrase ||
        voiceTagPhrase ||
        state?.voiceTagByUser?.[userName.toLowerCase()] ||
        `${userName} — ${userHeadline}`).trim()
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(phraseToSpeak)
        u.rate = 0.96
        u.pitch = 1.0
        window.speechSynthesis.speak(u)
      } catch {}
    }
    showToast(`🔊 Playing VOICE-TAG: "${phraseToSpeak}"`)
  }

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
    const onOpenPinBoard = () => {
      setActiveTab("circle_identity")
      setIsConsoleOpen(true)
    }
    window.addEventListener("connectln-halo-updated", onHaloSync)
    window.addEventListener("connectln-open-pinboard", onOpenPinBoard)
    return () => {
      window.removeEventListener("connectln-halo-updated", onHaloSync)
      window.removeEventListener("connectln-open-pinboard", onOpenPinBoard)
    }
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

  const handlePrintPdfBio = () => {
    const w = window.open("", "_blank", "width=760,height=900")
    if (!w) {
      showToast("Allow pop-ups to save your PDF-BIO Resume Sheet.")
      return
    }
    const skillsHtml = (state?.pvrSkills || [])
      .map((s) => `<li><strong>${s.skill}</strong> — ${s.vouchCount} KUDOS Vouches</li>`)
      .join("")
    const hiddenSet = new Set(state?.hiddenCitationIds || [])
    const proofsHtml = (state?.wcdCitations || [])
      .filter((c) => !hiddenSet.has(c.id))
      .map(
        (c) =>
          `<div style="margin-bottom:10px;padding:10px;border-left:3px solid #0A66C2;background:#f8fafc;">
            <div><strong>${c.verifiedDeliverable}</strong></div>
            <div style="font-style:italic;margin:4px 0;">"${c.citationText}"</div>
            <div style="font-size:12px;color:#475569;">— ${c.authorName} (${c.authorHeadline})</div>
          </div>`
      )
      .join("")
    w.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${userName} — ConnectLn PDF-BIO Resume</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 36px; color: #0f172a; max-width: 720px; margin: 0 auto; }
            h1 { margin: 0 0 4px 0; font-size: 26px; }
            .sub { color: #0A66C2; font-weight: 700; font-size: 14px; margin-bottom: 16px; }
            h2 { font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; }
          </style>
        </head>
        <body>
          <h1>${userName}</h1>
          <div class="sub">${userHeadline} · Verified Phone: ${userPhone} · ${HALO_STATUS_META[myHalo].badgeLabel}</div>
          <p>Verified ConnectLn Member · 1st CIRCLE Network · 🌟 GOLD-VOICE Contributor</p>
          <h2>KUDOS — Peer-Vouched Skills</h2>
          <ul>${skillsHtml}</ul>
          <h2>PROOF — Real-Work Peer Notes</h2>
          ${proofsHtml}
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `)
    w.document.close()
    showToast("✓ Generated your PDF-BIO Resume Sheet!")
  }

  const decks = state?.bdpDecks || []
  const currentDeck = decks[deckIndex % Math.max(1, decks.length)]
  const slides = currentDeck?.slides || []
  const currentSlide = slides[slideIndex % Math.max(1, slides.length)]

  const haloMeta = HALO_STATUS_META[myHalo] || HALO_STATUS_META.AFT
  const totalPvrVouches = (state?.pvrSkills || []).reduce((acc, s) => acc + s.vouchCount, 0)
  const myStreak = state?.dailyBrainStreaks?.[userName.toLowerCase()] || 7
  const hasGoldVoice = (state?.goldVoiceMembers || []).some(
    (m) => m.toLowerCase() === userName.toLowerCase()
  )
  const myPingPrefs = state?.instantPingByUser?.[userName.toLowerCase()] || {
    dms: true,
    kudos: true,
    matches: true,
  }
  const profileShareUrl = `https://conectln.com/connectin?member=${encodeURIComponent(userName)}`
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    profileShareUrl
  )}`

  return (
    <>
      {/* SINGLE ULTRA-CLEAN 1-LINE PILL BAR (Zero Feed Clutter!) */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <button
            type="button"
            onClick={cycleHalo}
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold shadow-2xs transition-opacity hover:opacity-95 cursor-pointer ${haloMeta.pillBg}`}
            title="Click to switch your friendly photo ring (#READY, #TEAMING, #MENTOR, #FOCUSED)"
          >
            {haloMeta.badgeLabel}
          </button>

          {hasGoldVoice && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("stories_wisdom")
                setIsConsoleOpen(true)
              }}
              className="rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 px-2.5 py-0.5 text-[10.5px] font-extrabold text-amber-900 dark:text-amber-300 cursor-pointer"
              title="You earned the ConnectLn GOLD-VOICE community badge!"
            >
              🌟 GOLD-VOICE
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setActiveTab("kudos_spotlight")
              setIsConsoleOpen(true)
            }}
            className="rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 px-2.5 py-0.5 text-[10.5px] font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer"
          >
            👏 {totalPvrVouches || 93} KUDOS
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("cheers_brain")
              setIsConsoleOpen(true)
            }}
            className="rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 px-2.5 py-0.5 text-[10.5px] font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer"
          >
            🧠 DAILY-BRAIN ({myStreak}d)
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("circle_identity")
              setIsConsoleOpen(true)
            }}
            className="rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 px-2.5 py-0.5 text-[10.5px] font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer hidden sm:inline-flex items-center gap-1"
          >
            <QrCode className="h-3 w-3 text-[#0A66C2]" />
            <span>SNAP-BADGE &amp; PDF</span>
          </button>

          <button
            type="button"
            onClick={() => handlePlayVoiceTag()}
            className="rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 px-2.5 py-0.5 text-[10.5px] font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer inline-flex items-center gap-1"
            title="Play your VOICE-TAG Name Pronunciation"
          >
            <span>🔊 VOICE-TAG</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("circle_identity")
              setIsConsoleOpen(true)
            }}
            className="rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 px-2.5 py-0.5 text-[10.5px] font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer inline-flex items-center gap-1"
            title="Open your PIN-BOARD Featured Work Showcase"
          >
            <span>📌 PIN-BOARD</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsConsoleOpen(true)}
          className="rounded-full bg-blue-50 dark:bg-blue-950/50 hover:bg-[#0A66C2] hover:text-white border border-blue-200 dark:border-blue-800 px-3 py-1 text-[11px] font-extrabold text-[#0A66C2] dark:text-sky-300 transition-colors cursor-pointer shrink-0"
        >
          ✨ Career &amp; Circle Hub (23 Tools) →
        </button>
      </div>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[95] rounded-2xl bg-zinc-900 border border-emerald-500/50 text-white px-4 py-2.5 text-xs font-extrabold shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* UNIFIED 5-TAB MODAL (Holds All 17 Friendly Features With Zero Page Clutter) */}
      {isConsoleOpen && state && (
        <div className="fixed inset-0 z-[85] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-5xl max-h-[90vh] rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#0A66C2] via-indigo-700 to-slate-900 text-white flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-mono font-black uppercase">
                    CONNECTLN CAREER &amp; CIRCLE HUB · ALL 17 TOOLS
                  </span>
                  <span className="rounded-full bg-emerald-500/25 border border-emerald-300/40 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-200">
                    {haloMeta.badgeLabel}
                  </span>
                  {hasGoldVoice && (
                    <span className="rounded-full bg-amber-400/25 border border-amber-300/50 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-200">
                      🌟 GOLD-VOICE Contributor
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-black mt-0.5">
                  Your Circle, Kudos, Spotlight, Slide-Stories, Daily-Brain &amp; Quick-Pitch Hub
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsConsoleOpen(false)}
                className="h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 5 Clean Category Tabs */}
            <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/70 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto">
              {[
                {
                  id: "circle_identity",
                  label: "1. PIN-BOARD · CIRCLE · #READY · SNAP-BADGE · COHORTS",
                  icon: Network,
                },
                {
                  id: "kudos_spotlight",
                  label: "2. KUDOS · PROOF · SPOTLIGHT · INSTANT-PING",
                  icon: Award,
                },
                {
                  id: "stories_wisdom",
                  label: "3. SLIDE-STORIES · WEEKLY-SPARK · WISDOM-NOTES",
                  icon: Layers,
                },
                {
                  id: "cheers_brain",
                  label: "4. CHEERS · LATER-POST · DAILY-BRAIN",
                  icon: Brain,
                },
                {
                  id: "jobs_teams_boost",
                  label: "5. QUICK-PITCH · TEAM-HUBS · HIRE-A-PRO · SPOT-BOOST",
                  icon: Rocket,
                },
              ].map((t) => {
                const Icon = t.icon
                const active = activeTab === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as HubCategoryTabId)}
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

            {/* Modal Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* TAB 1: PIN-BOARD, CIRCLE, #READY Rings, SNAP-BADGE QR + PDF-BIO, & COHORT-FINDER */}
              {activeTab === "circle_identity" && (
                <div className="space-y-4">
                  {/* PIN-BOARD — Featured Work Showcase (Top 3 Highlights) */}
                  <div className="rounded-2xl border border-blue-300 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20 p-3.5 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xs sm:text-sm font-black text-[#0A66C2] dark:text-sky-300">
                        📌 PIN-BOARD — Featured Work Showcase (Pin Your Top Highlights)
                      </h3>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <input
                          type="text"
                          value={pinTitle}
                          onChange={(e) => setPinTitle(e.target.value)}
                          placeholder="Highlight title..."
                          className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 text-xs"
                        />
                        <input
                          type="text"
                          value={pinSummary}
                          onChange={(e) => setPinSummary(e.target.value)}
                          placeholder="Link or 1-line summary..."
                          className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!pinTitle.trim()) return
                            void dispatchAction(
                              {
                                action: "pin_board_add",
                                title: pinTitle.trim(),
                                linkOrSummary: pinSummary.trim(),
                              },
                              `📌 Pinned "${pinTitle.trim()}" to your PIN-BOARD!`
                            )
                            setPinTitle("")
                            setPinSummary("")
                          }}
                          className="rounded-lg bg-[#0A66C2] text-white px-2.5 py-1 text-xs font-extrabold cursor-pointer"
                        >
                          + Pin Work
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {(state.pinBoardItems || []).slice(0, 3).map((pin) => (
                        <div
                          key={pin.id}
                          className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 flex flex-col justify-between gap-1"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="rounded bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[9.5px] font-extrabold text-[#0A66C2]">
                              📌 {pin.badge}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                void dispatchAction(
                                  { action: "pin_board_remove", pinId: pin.id },
                                  "Removed from PIN-BOARD"
                                )
                              }
                              className="text-[10px] text-zinc-400 hover:text-rose-600 cursor-pointer"
                              title="Unpin"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-xs font-extrabold">{pin.title}</p>
                          <p className="text-[10.5px] text-zinc-500 truncate">{pin.linkOrSummary}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Row: #READY Photo Rings + SNAP-BADGE QR & PDF-BIO */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-4 space-y-2.5">
                      <h3 className="text-sm font-black">
                        Friendly Profile Photo Rings (`#READY` · `#TEAMING` · `#MENTOR` · `#FOCUSED`)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                              className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                                selected
                                  ? "border-[#0A66C2] bg-blue-50/70 dark:bg-blue-950/40"
                                  : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${meta.pillBg}`}
                                >
                                  {meta.badgeLabel}
                                </span>
                                {selected && <CheckCircle2 className="h-4 w-4 text-[#0A66C2]" />}
                              </div>
                              <p className="text-[11px] text-zinc-500 mt-1.5">{meta.description}</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* SNAP-BADGE QR, PDF-BIO & VOICE-TAG Name Audio */}
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col items-center justify-between text-center space-y-2">
                      <div>
                        <span className="rounded bg-blue-100 dark:bg-blue-950/70 px-2 py-0.5 text-[10px] font-mono font-black text-[#0A66C2]">
                          SNAP-BADGE · PDF-BIO · VOICE-TAG
                        </span>
                        <h4 className="text-xs font-black mt-1">QR Badge, PDF Resume &amp; Name Audio</h4>
                      </div>
                      <img
                        src={qrImageUrl}
                        alt="ConnectLn SNAP-BADGE QR"
                        className="h-24 w-24 rounded-xl border border-zinc-200 p-1.5 bg-white"
                      />
                      <div className="w-full flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(profileShareUrl).catch(() => {})
                            showToast("✓ Copied your SNAP-BADGE Direct Profile Link!")
                          }}
                          className="flex-1 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 py-1.5 text-[10.5px] font-extrabold cursor-pointer"
                        >
                          Copy QR Link
                        </button>
                        <button
                          type="button"
                          onClick={handlePrintPdfBio}
                          className="flex-1 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white py-1.5 text-[10.5px] font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FileDown className="h-3 w-3" />
                          <span>PDF-BIO</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePlayVoiceTag()}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 text-[10.5px] font-extrabold cursor-pointer"
                          title="Play your VOICE-TAG Name Pronunciation"
                        >
                          🔊 VOICE-TAG
                        </button>
                      </div>
                      <div className="w-full flex gap-1">
                        <input
                          type="text"
                          value={voiceTagPhrase}
                          onChange={(e) => setVoiceTagPhrase(e.target.value)}
                          placeholder={`Custom pronunciation for ${userName}...`}
                          className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-[10.5px]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const phrase = voiceTagPhrase.trim() || `${userName} — ${userHeadline}`
                            try {
                              localStorage.setItem(
                                `connectln_voicetag_v1__${userName.toLowerCase()}`,
                                phrase
                              )
                            } catch {}
                            void dispatchAction(
                              { action: "save_voice_tag", phrase },
                              `🔊 Saved your VOICE-TAG pronunciation!`
                            )
                            handlePlayVoiceTag(phrase)
                          }}
                          className="rounded-lg bg-zinc-900 dark:bg-zinc-700 text-white px-2 py-1 text-[10px] font-extrabold cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CIRCLE & BRIDGES + COHORT-FINDER */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2.5">
                      <h3 className="text-sm font-black">
                        CIRCLE (1st / 2nd / 3rd Circle) &amp; BRIDGES (Shared Friends)
                      </h3>
                      <div className="space-y-2">
                        {[
                          {
                            name: "Esther Boa Asiedu",
                            role: "Principal Healthcare Operations Lead",
                            circle: "1st CIRCLE · Direct Friend",
                            bridges: "14 BRIDGES (Patience Addo, Isaac Boye + 12 others)",
                            halo: state.haloByUser["esther boa asiedu"] || "AFT",
                          },
                          {
                            name: "Patience Addo",
                            role: "Director of Enterprise Procurement & Escrow",
                            circle: "1st CIRCLE · Direct Friend",
                            bridges: "12 BRIDGES (Esther Boa Asiedu, Adwoa larbi + 10 others)",
                            halo: state.haloByUser["patience addo"] || "FAC",
                          },
                          {
                            name: "Isaac Boye",
                            role: "Senior Field Engineering Lead",
                            circle: "1st CIRCLE · Direct Friend",
                            bridges: "11 BRIDGES (Kwesi Asiedu, Marcus Vance + 9 others)",
                            halo: state.haloByUser["isaac boye"] || "AFT",
                          },
                        ].map((op) => {
                          const hMeta = HALO_STATUS_META[op.halo] || HALO_STATUS_META.AFT
                          return (
                            <div
                              key={op.name}
                              className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-2.5 space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-xs">{op.name}</span>
                                <span
                                  className={`rounded-full px-2 py-0.2 text-[9.5px] font-extrabold ${hMeta.pillBg}`}
                                >
                                  {hMeta.badgeLabel}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-500">{op.role}</p>
                              <p className="text-[10.5px] font-semibold text-[#0A66C2]">
                                {op.circle} · 🤝 {op.bridges}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* COHORT-FINDER (School, Bootcamp & Trade Union Classmates) */}
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-black flex items-center gap-1.5">
                          <GraduationCap className="h-4 w-4 text-[#0A66C2]" />
                          <span>COHORT-FINDER — School &amp; Trade Classmates</span>
                        </h3>
                      </div>
                      <input
                        type="text"
                        value={cohortSearch}
                        onChange={(e) => setCohortSearch(e.target.value)}
                        placeholder="Filter by school, trade guild, year (2025/2026), or city..."
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs"
                      />
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {(state.cohortAlumni || [])
                          .filter((a) => {
                            if (!cohortSearch.trim()) return true
                            const q = cohortSearch.toLowerCase()
                            return (
                              a.name.toLowerCase().includes(q) ||
                              a.program.toLowerCase().includes(q) ||
                              a.city.toLowerCase().includes(q) ||
                              a.classYear.includes(q)
                            )
                          })
                          .map((alum) => (
                            <div
                              key={alum.id}
                              className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-2.5 flex items-center justify-between gap-2"
                            >
                              <div>
                                <p className="text-xs font-extrabold">
                                  {alum.name} · <span className="text-[#0A66C2]">Class of {alum.classYear}</span>
                                </p>
                                <p className="text-[11px] text-zinc-500">
                                  {alum.program} · 📍 {alum.city}
                                </p>
                              </div>
                              <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 text-[10px] font-extrabold text-emerald-700">
                                {alum.currentRole}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: KUDOS, PROOF, SPOTLIGHT & INSTANT-PING */}
              {activeTab === "kudos_spotlight" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* KUDOS */}
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                      <h3 className="text-sm font-black">KUDOS — Skill Kudos &amp; Vouches</h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSkillText}
                          onChange={(e) => setNewSkillText(e.target.value)}
                          placeholder="Add a skill to receive KUDOS..."
                          className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newSkillText.trim()) return
                            void dispatchAction(
                              { action: "vouch_pvr_skill", customSkill: newSkillText.trim() },
                              `✓ Added "${newSkillText.trim()}" to KUDOS!`
                            )
                            setNewSkillText("")
                          }}
                          className="rounded-xl bg-[#0A66C2] text-white px-3 py-1.5 text-xs font-extrabold cursor-pointer"
                        >
                          + Add Skill
                        </button>
                      </div>
                      <div className="space-y-2">
                        {state.pvrSkills.map((sk) => (
                          <div
                            key={sk.id}
                            className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-2.5 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-extrabold">{sk.skill}</p>
                              <p className="text-[10.5px] text-zinc-500">
                                Kudos from {sk.vouchers.slice(0, 3).join(", ")}
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

                    {/* PROOF & VOUCH-NOTES */}
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                      <h3 className="text-sm font-black">
                        PROOF &amp; VOUCH-NOTES — Peer Testimonials (With Show/Hide Control)
                      </h3>
                      <div className="space-y-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 border border-zinc-200 dark:border-zinc-700">
                        <div className="grid grid-cols-2 gap-2">
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
                            placeholder="Project Delivered Together"
                            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={wcdCitation}
                          onChange={(e) => setWcdCitation(e.target.value)}
                          placeholder="Write a warm PROOF / VOUCH-NOTE testimonial..."
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
                              `✓ Shared a VOUCH-NOTE for ${wcdTarget}!`
                            )
                            setWcdDeliverable("")
                            setWcdCitation("")
                          }}
                          className="rounded-xl bg-[#0A66C2] text-white px-3.5 py-1.5 text-xs font-extrabold cursor-pointer"
                        >
                          Share VOUCH-NOTE
                        </button>
                      </div>
                      <div className="space-y-2 max-h-44 overflow-y-auto">
                        {state.wcdCitations.map((c) => {
                          const isHidden = (state.hiddenCitationIds || []).includes(c.id)
                          return (
                            <div
                              key={c.id}
                              className={`rounded-xl border border-zinc-200 dark:border-zinc-800 p-2.5 space-y-1 ${
                                isHidden ? "opacity-50" : ""
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-extrabold">
                                  {c.verifiedDeliverable} ·{" "}
                                  <span className="text-emerald-700">For {c.targetMember}</span>
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void dispatchAction(
                                      { action: "toggle_wcd_visibility", citationId: c.id },
                                      isHidden
                                        ? "✓ VOUCH-NOTE shown on Profile & PDF-BIO"
                                        : "✓ VOUCH-NOTE hidden from Profile"
                                    )
                                  }
                                  className={`rounded-full px-2 py-0.5 text-[9.5px] font-extrabold cursor-pointer ${
                                    isHidden
                                      ? "bg-zinc-200 text-zinc-600 dark:bg-zinc-800"
                                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  }`}
                                >
                                  {isHidden ? "Hidden" : "✓ Shown on Profile"}
                                </button>
                              </div>
                              <p className="text-xs text-zinc-600 dark:text-zinc-300 italic">
                                &ldquo;{c.citationText}&rdquo; — <strong>{c.authorName}</strong>
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* SPOTLIGHT + COZY Mode & INSTANT-PING Push Alerts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-black">SPOTLIGHT Visitors &amp; COZY Mode</h3>
                        <button
                          type="button"
                          onClick={() =>
                            void dispatchAction(
                              { action: "toggle_stealth_cloak" },
                              !myStealthCloak ? "✓ COZY Private Mode ON" : "✓ COZY Private Mode OFF"
                            )
                          }
                          className={`rounded-xl px-3 py-1 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer ${
                            myStealthCloak ? "bg-purple-700 text-white" : "bg-zinc-200 dark:bg-zinc-800"
                          }`}
                        >
                          {myStealthCloak ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          <span>{myStealthCloak ? "COZY Mode: ON" : "COZY Mode: OFF"}</span>
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {state.prtRadarEvents.slice(0, 3).map((ev) => (
                          <div
                            key={ev.id}
                            className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-2.5 flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-extrabold">{ev.viewerName}</p>
                              <p className="text-[11px] text-zinc-500">{ev.viewerOrg}</p>
                            </div>
                            <span className="text-[10.5px] font-mono text-[#0A66C2]">
                              {ev.timestampLabel}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* INSTANT-PING Mobile & Desktop Push Notification Control */}
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black flex items-center gap-1.5">
                          <Bell className="h-4 w-4 text-[#0A66C2]" />
                          <span>INSTANT-PING — Real-Time Push Alerts</span>
                        </h3>
                        <button
                          type="button"
                          onClick={async () => {
                            if (typeof Notification !== "undefined") {
                              if (Notification.permission === "default") {
                                await Notification.requestPermission().catch(() => {})
                              }
                              if (Notification.permission === "granted") {
                                new Notification("ConnectLn INSTANT-PING ✓", {
                                  body: `Real-time push alerts for DMs, KUDOS & Job Matches are active for ${userName}!`,
                                  icon: "/brand/connectln-icon-192.png",
                                })
                              }
                            }
                            showToast("🔔 Dispatched live INSTANT-PING notification!")
                          }}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 text-[11px] font-extrabold cursor-pointer"
                        >
                          🔔 Send Test Ping
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500">
                        Choose which events wake up your phone &amp; browser in addition to incoming voice/video calls:
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {(
                          [
                            { id: "dms", label: "💬 New DMs" },
                            { id: "kudos", label: "👏 New KUDOS" },
                            { id: "matches", label: "⚡ Job Matches" },
                          ] as const
                        ).map((item) => {
                          const on = myPingPrefs[item.id]
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                void dispatchAction(
                                  { action: "update_instant_ping", field: item.id },
                                  `✓ Updated INSTANT-PING for ${item.label}`
                                )
                              }
                              className={`rounded-xl border p-2.5 text-xs font-extrabold cursor-pointer ${
                                on
                                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300"
                                  : "border-zinc-200 dark:border-zinc-700 text-zinc-500"
                              }`}
                            >
                              {item.label}: {on ? "ON" : "OFF"}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SLIDE-STORIES, WEEKLY-SPARK & WISDOM-NOTES (GOLD-VOICE) */}
              {activeTab === "stories_wisdom" && (
                <div className="space-y-4">
                  {/* SLIDE-STORIES Swipable Visual Guide Viewer */}
                  {currentDeck && currentSlide && (
                    <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-[#0E1726] to-slate-900 p-4 text-white space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-mono font-black uppercase">
                            SLIDE-STORIES
                          </span>
                          <span className="text-xs font-extrabold">{currentDeck.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono text-indigo-300">
                            Card {slideIndex + 1}/{slides.length}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)
                            }
                            className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSlideIndex((prev) => (prev + 1) % slides.length)}
                            className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          {decks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeckIndex((prev) => (prev + 1) % decks.length)
                                setSlideIndex(0)
                              }}
                              className="rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[10.5px] font-bold cursor-pointer"
                            >
                              Switch Deck ({(deckIndex + 1) % decks.length + 1}/{decks.length})
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold text-emerald-300">
                            {currentSlide.heading}
                          </p>
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-200">
                            {currentSlide.metricBadge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200">{currentSlide.body}</p>
                        <p className="text-[10.5px] font-mono text-indigo-300">
                          Takeaway: {currentSlide.keySpec}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* WISDOM-NOTES (Collaborative Community Guides + GOLD-VOICE Badge) */}
                  <div className="rounded-2xl border border-amber-300/70 dark:border-amber-800/60 bg-amber-50/30 dark:bg-amber-950/15 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-black flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-amber-600" />
                          <span>
                            WISDOM-NOTES — Collaborative Field Guides (Add a Tip to Earn 🌟 GOLD-VOICE)
                          </span>
                        </h3>
                        <p className="text-xs text-zinc-500">
                          Share your real-world experience on community topics below to automatically unlock the 🌟 GOLD-VOICE badge on your profile.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(state.wisdomNotes || []).map((note) => {
                        const draft = wisdomTipByNote[note.id] || ""
                        return (
                          <div
                            key={note.id}
                            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 space-y-2"
                          >
                            <span className="rounded bg-amber-100 dark:bg-amber-950/70 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 dark:text-amber-300">
                              WISDOM-NOTE · {note.topic}
                            </span>
                            <p className="text-xs font-black">{note.promptQuestion}</p>
                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                              {note.contributions.map((c) => (
                                <div
                                  key={c.id}
                                  className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-2 text-[11px]"
                                >
                                  <strong>{c.authorName}</strong> ({c.authorRole}): &ldquo;{c.tipText}&rdquo;
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-1.5 pt-1">
                              <input
                                type="text"
                                value={draft}
                                onChange={(e) =>
                                  setWisdomTipByNote((prev) => ({
                                    ...prev,
                                    [note.id]: e.target.value,
                                  }))
                                }
                                placeholder="Add your tip to earn 🌟 GOLD-VOICE..."
                                className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!draft.trim()) return
                                  void dispatchAction(
                                    {
                                      action: "add_wisdom_note",
                                      noteId: note.id,
                                      tipText: draft.trim(),
                                    },
                                    "🌟 Published your WISDOM-NOTE & unlocked the GOLD-VOICE Badge!"
                                  )
                                  setWisdomTipByNote((prev) => ({ ...prev, [note.id]: "" }))
                                }}
                                className="rounded-lg bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 text-xs font-extrabold cursor-pointer"
                              >
                                + Add Tip
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Create SLIDE-STORY & Subscribe to WEEKLY-SPARK */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2.5">
                      <h3 className="text-sm font-black">Create a SLIDE-STORY Guide</h3>
                      <input
                        type="text"
                        value={bdpTitle}
                        onChange={(e) => setBdpTitle(e.target.value)}
                        placeholder="Slide Story Title..."
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        value={bdpSlide1}
                        onChange={(e) => setBdpSlide1(e.target.value)}
                        placeholder="Card 1 Key Insight..."
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        value={bdpSlide2}
                        onChange={(e) => setBdpSlide2(e.target.value)}
                        placeholder="Card 2 Action Takeaway..."
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
                            `✓ Published SLIDE-STORY "${bdpTitle}"!`
                          )
                          setBdpTitle("")
                          setBdpSlide1("")
                          setBdpSlide2("")
                        }}
                        className="rounded-xl bg-indigo-600 text-white px-4 py-1.5 text-xs font-extrabold cursor-pointer"
                      >
                        + Publish SLIDE-STORY
                      </button>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2.5">
                      <h3 className="text-sm font-black">WEEKLY-SPARK Creator Digests</h3>
                      {state.edwDispatches.map((wire) => {
                        const isSub = wire.subscribedBy.includes(userName)
                        return (
                          <div
                            key={wire.id}
                            className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-black truncate">{wire.title}</p>
                              <p className="text-[11px] text-zinc-500">
                                {wire.cadence} · {wire.subscribersCount.toLocaleString()} Readers
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                void dispatchAction(
                                  { action: "toggle_edw_subscribe", edwId: wire.id },
                                  isSub ? "Unsubscribed" : `✓ Subscribed to ${wire.title}!`
                                )
                              }
                              className={`rounded-xl px-3 py-1.5 text-[11px] font-extrabold shrink-0 cursor-pointer ${
                                isSub ? "bg-emerald-600 text-white" : "bg-[#0A66C2] text-white"
                              }`}
                            >
                              {isSub ? "✓ Subscribed" : "+ Subscribe"}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CHEERS Milestones, LATER-POST Scheduler & DAILY-BRAIN 60s Challenge */}
              {activeTab === "cheers_brain" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* CHEERS Milestone Celebrations */}
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                      <h3 className="text-sm font-black flex items-center gap-1.5">
                        <PartyPopper className="h-4 w-4 text-amber-500" />
                        <span>CHEERS — Celebrate Circle Milestones &amp; Work Wins</span>
                      </h3>
                      <div className="space-y-2">
                        {(state.cheersMilestones || []).map((ch) => (
                          <div
                            key={ch.id}
                            className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 flex items-center justify-between gap-2"
                          >
                            <div>
                              <span className="rounded bg-amber-100 dark:bg-amber-950/70 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:text-amber-300">
                                {ch.milestoneType}
                              </span>
                              <p className="text-xs font-extrabold mt-1">{ch.memberName}</p>
                              <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                                {ch.title}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                void dispatchAction(
                                  { action: "send_cheers", cheersId: ch.id },
                                  `🎉 Sent CHEERS to ${ch.memberName}!`
                                )
                              }
                              className="rounded-xl bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 text-xs font-extrabold shrink-0 cursor-pointer"
                            >
                              🎉 Cheers ({ch.cheersCount})
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* LATER-POST Scheduler */}
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                      <h3 className="text-sm font-black flex items-center gap-1.5">
                        <CalendarClock className="h-4 w-4 text-[#0A66C2]" />
                        <span>LATER-POST — Schedule Posts Ahead of Time</span>
                      </h3>
                      <textarea
                        rows={2}
                        value={laterPostContent}
                        onChange={(e) => setLaterPostContent(e.target.value)}
                        placeholder="Write a post or update to schedule for later..."
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={laterPostWhen}
                          onChange={(e) => setLaterPostWhen(e.target.value)}
                          placeholder="When (e.g., Tomorrow · 9:00 AM)"
                          className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!laterPostContent.trim()) return
                            void dispatchAction(
                              {
                                action: "schedule_later_post",
                                content: laterPostContent.trim(),
                                scheduledForLabel: laterPostWhen,
                              },
                              `✓ Scheduled LATER-POST for ${laterPostWhen}!`
                            )
                            setLaterPostContent("")
                          }}
                          className="rounded-xl bg-[#0A66C2] text-white px-4 py-1.5 text-xs font-extrabold cursor-pointer"
                        >
                          Schedule Post
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {(state.laterPosts || []).map((lp) => (
                          <div
                            key={lp.id}
                            className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 p-2.5 text-xs"
                          >
                            <div className="flex items-center justify-between font-bold text-[#0A66C2]">
                              <span>⏰ {lp.scheduledForLabel}</span>
                              <span>{lp.status}</span>
                            </div>
                            <p className="text-zinc-700 dark:text-zinc-300 mt-1">{lp.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* DAILY-BRAIN 60-Second Trivia & Circle Streak Leaderboard */}
                  <div className="rounded-2xl border border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/15 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-black flex items-center gap-1.5">
                        <Brain className="h-4 w-4 text-emerald-600" />
                        <span>
                          DAILY-BRAIN — 60-Second Skill &amp; Logic Challenge (🔥 {myStreak}-Day Streak)
                        </span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setBrainQuestionIdx((prev) => (prev + 1) % DAILY_BRAIN_QUESTIONS.length)
                          setSelectedBrainOption(null)
                        }}
                        className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                      >
                        Next Question →
                      </button>
                    </div>

                    {(() => {
                      const qObj = DAILY_BRAIN_QUESTIONS[brainQuestionIdx]
                      return (
                        <div className="space-y-2">
                          <p className="text-xs font-extrabold">{qObj.q}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {qObj.options.map((opt, idx) => {
                              const picked = selectedBrainOption === idx
                              const isCorrect = idx === qObj.correctIdx
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => {
                                    setSelectedBrainOption(idx)
                                    if (isCorrect) {
                                      void dispatchAction(
                                        { action: "solve_daily_brain" },
                                        `🧠 Correct! Your DAILY-BRAIN streak is now ${myStreak + 1} days!`
                                      )
                                    }
                                  }}
                                  className={`rounded-xl border p-2.5 text-left text-xs font-bold cursor-pointer transition-all ${
                                    picked
                                      ? isCorrect
                                        ? "border-emerald-600 bg-emerald-600 text-white"
                                        : "border-rose-500 bg-rose-50 text-rose-800"
                                      : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[#0A66C2]"
                                  }`}
                                >
                                  {opt}
                                </button>
                              )
                            })}
                          </div>
                          {selectedBrainOption !== null && (
                            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 pt-1">
                              {qObj.explanation}
                            </p>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </div>
              )}

              {/* TAB 5: QUICK-PITCH, MATCH-BOARD, TEAM-HUBS, HIRE-A-PRO & SPOT-BOOST */}
              {activeTab === "jobs_teams_boost" && (
                <div className="space-y-5">
                  {/* ONE-TAP APPLY · QUICK-PITCH · MY-TRACKER */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-black">
                          ONE-TAP APPLY · QUICK-PITCH · MY-TRACKER (MATCH-BOARD)
                        </h3>
                        <p className="text-[11px] text-zinc-500">
                          Auto-attaches your saved PDF-BIO &amp; KUDOS in 1 tap and tracks every role from Pitched → Hired.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={fttTitle}
                          onChange={(e) => setFttTitle(e.target.value)}
                          placeholder="Role for ONE-TAP APPLY..."
                          className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1 text-xs"
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
                              "⚡ Sent ONE-TAP APPLY with your PDF-BIO & QUICK-PITCH!"
                            )
                            setFttTitle("")
                          }}
                          className="rounded-xl bg-emerald-600 text-white px-3.5 py-1 text-xs font-extrabold cursor-pointer"
                        >
                          ⚡ ONE-TAP APPLY
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {(
                        [
                          { raw: "Ticket Filed", label: "1. Pitched 👋" },
                          { raw: "Dossier Vetted", label: "2. Reviewed ✨" },
                          { raw: "Technical Trial", label: "3. Team Chat 💬" },
                          { raw: "Ticket Awarded", label: "4. Hired 🎉" },
                        ] as const
                      ).map((stageObj) => {
                        const items = state.torPipeline.filter((c) => c.stage === stageObj.raw)
                        return (
                          <div
                            key={stageObj.raw}
                            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 p-2.5 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black">{stageObj.label}</span>
                              <span className="rounded-full bg-[#0A66C2] text-white px-2 text-[10px] font-black">
                                {items.length}
                              </span>
                            </div>
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 space-y-1"
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <p className="text-xs font-extrabold truncate">{item.ticketTitle}</p>
                                  <span className="rounded bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[9.5px] font-extrabold text-emerald-700 shrink-0">
                                    {item.pvrScore || 97}% Fit
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-500">
                                  👤 {item.candidateName} · {item.CompensationBand}
                                </p>
                                <p className="text-[10px] font-semibold text-[#0A66C2]">
                                  ✓ PDF-BIO + QUICK-PITCH Attached
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void dispatchAction(
                                      { action: "advance_tor_stage", candidateId: item.id },
                                      `✓ Moved ${item.candidateName} to next MY-TRACKER step!`
                                    )
                                  }
                                  className="w-full rounded bg-zinc-100 hover:bg-[#0A66C2] hover:text-white dark:bg-zinc-800 py-1 text-[10px] font-extrabold cursor-pointer"
                                >
                                  Advance in MY-TRACKER →
                                </button>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* TEAM-HUBS, HIRE-A-PRO & SPOT-BOOST */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* HIRE-A-PRO */}
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2.5">
                      <h3 className="text-sm font-black">HIRE-A-PRO — Direct Project Helper Desk</h3>
                      <div className="space-y-2">
                        {state.bexExperts.slice(0, 2).map((ex) => (
                          <div
                            key={ex.id}
                            className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 flex items-center justify-between gap-2"
                          >
                            <div>
                              <p className="text-xs font-extrabold">{ex.expertName}</p>
                              <p className="text-[11px] text-zinc-500">
                                {ex.specialty} · <strong className="text-emerald-700">{ex.rateBand}</strong>
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                void dispatchAction(
                                  {
                                    action: "commission_bex_expert",
                                    bexId: ex.id,
                                    projectScope: `Direct Project Request for ${ex.expertName}`,
                                  },
                                  `✓ Sent HIRE-A-PRO Request to ${ex.expertName}!`
                                )
                              }
                              className="rounded-xl bg-[#0A66C2] text-white px-3 py-1.5 text-xs font-extrabold shrink-0 cursor-pointer"
                            >
                              🤝 Request Help
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SPOT-BOOST (Promote a Post or Job by Profession & City) */}
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2.5">
                      <h3 className="text-sm font-black flex items-center gap-1.5">
                        <Rocket className="h-4 w-4 text-[#0A66C2]" />
                        <span>SPOT-BOOST — Promote a Post or Job to Target Cities</span>
                      </h3>
                      <input
                        type="text"
                        value={boostTitle}
                        onChange={(e) => setBoostTitle(e.target.value)}
                        placeholder="Post or Job Title to Boost..."
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={boostProfession}
                          onChange={(e) => setBoostProfession(e.target.value)}
                          placeholder="Professions"
                          className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-xs"
                        />
                        <input
                          type="text"
                          value={boostCity}
                          onChange={(e) => setBoostCity(e.target.value)}
                          placeholder="Target Cities"
                          className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            void dispatchAction(
                              {
                                action: "create_spot_boost",
                                title: boostTitle || "Featured ConnectLn Team Opportunity",
                                targetProfession: boostProfession,
                                targetCity: boostCity,
                                dailyBudget: boostBudget,
                              },
                              "🚀 Launched SPOT-BOOST Campaign!"
                            )
                            setBoostTitle("")
                          }}
                          className="rounded-lg bg-emerald-600 text-white px-2 py-1 text-xs font-extrabold cursor-pointer"
                        >
                          🚀 Launch Boost
                        </button>
                      </div>
                      {(state.spotBoosts || []).slice(0, 2).map((sb) => (
                        <div
                          key={sb.id}
                          className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between font-extrabold">
                            <span>🚀 {sb.title}</span>
                            <span className="text-emerald-700">{sb.dailyBudget}</span>
                          </div>
                          <p className="text-[11px] text-zinc-500">
                            Target: {sb.targetProfession} · 📍 {sb.targetCity} ({sb.estimatedReach})
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
