"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Play, Pause, Sparkles, ShieldCheck, Layers, Grid } from "lucide-react"
import { PROFESSION_ENCLAVES, ALL_PROFESSIONS, findEnclaveById, type ProfessionDefinition } from "@/lib/connectin-professions"

interface ConnectLnProfessionAnimatedVideoProps {
  professionId?: string
  professionTitle?: string
  enclaveId?: string
  compact?: boolean
  className?: string
}

const ENCLAVE_CREW_ROLES: Record<string, [string, string, string]> = {
  trades_construction: ["survey & layout", "frame & install", "code sign-off"],
  automotive_mechanics: ["CAN-bus scan", "powertrain repair", "road-test verify"],
  agriculture_natural_resources: ["soil & stand scan", "precision harvest", "cold-chain grade"],
  personal_services_wellness: ["consult & prep", "precision craft", "finish & aftercare"],
  culinary_hospitality_events: ["mise-en-place", "fire & plate", "HACCP pass"],
  commerce_small_business: ["valuation & comp", "contract & escrow", "closing settlement"],
  creative_media_arts: ["pre-pro & script", "capture & grade", "master delivery"],
  healthcare_medicine: ["triage & vitals", "clinical intervention", "SBAR handoff"],
  education_workforce: ["diagnostic baseline", "hands-on lab drill", "competency sign-off"],
  community_civic_security: ["CAD dispatch", "tactical response", "all-clear recovery"],
  tech_cybersecurity: ["threat hunt & recon", "contain & detonate", "continuous ATO"],
  tech_software: ["architect & typecheck", "sandbox build", "zero-downtime deploy"],
  law_gov_defense: ["precedent shepardize", "motion & hearing", "judgment / cATO"],
  finance_accounting: ["ingest & 3-way match", "audit & underwrite", "fiduciary sign-off"],
  campus_students: ["literature & aims", "lab experiment", "peer-reviewed grant"],
  manufacturing_industrial: ["CAD/CAM toolpath", "5-axis cut & sinter", "CMM micron pass"],
  energy_utilities_environment: ["string & relay calc", "energize & sync", "grid telemetry lock"],
  science_laboratory_research: ["sample prep & assay", "HPLC / DNA run", "COA release"],
  aviation_aerospace_maritime: ["borescope & preflight", "overhaul & rig", "airworthy release"],
  telecom_digital_infrastructure: ["azimuth & splice", "dBmV spectrum lock", "gigabit link pass"],
  veterans_military: ["MOS crosswalk", "SkillBridge fellowship", "executive / SDVOSB win"],
  franchise_networks: ["territory & FDD model", "NSO store launch", "multi-unit EBITDA"],
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t))
}

export function ConnectLnProfessionAnimatedVideo({
  professionId,
  professionTitle,
  enclaveId,
  compact = false,
  className = "",
}: ConnectLnProfessionAnimatedVideoProps) {
  const [selectedEnclaveId, setSelectedEnclaveId] = useState<string>(enclaveId || "trades_construction")
  const [selectedProfId, setSelectedProfId] = useState<string>(professionId || "carpenter")
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [autoReel, setAutoReel] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<"4tier" | "grid">("4tier")
  const [clock, setClock] = useState<number>(0)

  useEffect(() => {
    if (enclaveId) setSelectedEnclaveId(enclaveId)
  }, [enclaveId])

  useEffect(() => {
    if (professionId) {
      const found = ALL_PROFESSIONS.find((p) => p.id === professionId)
      if (found) {
        setSelectedProfId(found.id)
        setSelectedEnclaveId(found.enclaveId)
      }
    }
  }, [professionId])

  const activeEnclave = useMemo(
    () => findEnclaveById(selectedEnclaveId) || PROFESSION_ENCLAVES[0],
    [selectedEnclaveId]
  )

  const enclaveProfessions = useMemo(
    () => ALL_PROFESSIONS.filter((p) => p.enclaveId === activeEnclave.id),
    [activeEnclave.id]
  )

  const activeProfession: ProfessionDefinition = useMemo(() => {
    const exact = enclaveProfessions.find((p) => p.id === selectedProfId)
    return exact || enclaveProfessions[0] || ALL_PROFESSIONS[0]
  }, [enclaveProfessions, selectedProfId])

  useEffect(() => {
    if (!isPlaying) return
    let rafId: number
    let last = performance.now()
    let reelAcc = 0

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      setClock((prev) => prev + dt)

      if (autoReel) {
        reelAcc += dt
        if (reelAcc >= 6.5) {
          reelAcc = 0
          setSelectedProfId((currId) => {
            const idx = ALL_PROFESSIONS.findIndex((p) => p.id === currId)
            const next = ALL_PROFESSIONS[(idx + 1) % ALL_PROFESSIONS.length]
            if (next) {
              setSelectedEnclaveId(next.enclaveId)
              return next.id
            }
            return currId
          })
        }
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isPlaying, autoReel])

  // Derive profession-specific labels
  const shortProfTitle = activeProfession.title.split("(")[0].trim()
  const tool0 = activeProfession.tools?.[0]?.name?.slice(0, 18) || activeProfession.typicalSkills?.[0]?.slice(0, 18) || "Spec Analyzer"
  const tool1 = activeProfession.tools?.[1]?.name?.slice(0, 18) || activeProfession.typicalSkills?.[1]?.slice(0, 18) || "Field Calibrator"
  const tool2 = activeProfession.tools?.[2]?.name?.slice(0, 18) || activeProfession.typicalSkills?.[2]?.slice(0, 18) || "Safety Checklist"
  const crewRoles = ENCLAVE_CREW_ROLES[activeEnclave.id] || ["plan & spec", "execute & build", "inspect & vouch"]
  const serialPlate = `CLN-ANIM-${activeEnclave.id.slice(0, 3).toUpperCase()}`

  // Normalized cycle timers for the 4 tiers
  const p1 = (clock / 3.1) % 1
  const p2 = ((clock + 0.8) / 3.9) % 1
  const p3 = (clock / 5.2) % 1
  const p4 = ((clock + 0.4) / 4.3) % 1
  const bob = Math.sin(clock * 4.5) * 2

  // Tier 1 interpolation
  const t1Dot1X = p1 < 0.36 ? lerp(154, 328, easeInOutCubic(clamp01(p1 / 0.36))) : 154
  const t1Dot1Op = p1 < 0.36 ? 1 : 0
  const t1Dot2X = p1 >= 0.56 && p1 < 0.88 ? lerp(418, 592, easeInOutCubic(clamp01((p1 - 0.56) / 0.32))) : 418
  const t1Dot2Op = p1 >= 0.56 && p1 < 0.88 ? 1 : 0

  // Tier 2 interpolation
  const t2Dot1X = p2 < 0.22 ? lerp(154, 232, easeInOutCubic(clamp01(p2 / 0.22))) : 154
  const t2Dot1Op = p2 < 0.22 ? 1 : 0
  const t2ActiveBar = p2 >= 0.20 && p2 < 0.45 ? Math.floor(((p2 - 0.20) / 0.25) * 3) : -1
  const t2Dot2X = p2 >= 0.42 && p2 < 0.60 ? lerp(292, 365, easeInOutCubic(clamp01((p2 - 0.42) / 0.18))) : 292
  const t2Dot2Op = p2 >= 0.42 && p2 < 0.60 ? 1 : 0
  const t2Dot3X = p2 >= 0.70 && p2 < 0.90 ? lerp(432, 596, easeInOutCubic(clamp01((p2 - 0.70) / 0.20))) : 432
  const t2Dot3Op = p2 >= 0.70 && p2 < 0.90 ? 1 : 0

  // Tier 3 tool loop interpolation
  const t3DotTaskX = p3 < 0.16 ? lerp(154, 255, easeInOutCubic(clamp01(p3 / 0.16))) : 154
  const t3DotTaskOp = p3 < 0.16 ? 1 : 0
  const t3LoopActive = p3 >= 0.16 && p3 < 0.76
  const t3Lp = t3LoopActive ? (p3 - 0.16) / 0.60 : 0
  const t3ToolIdx = t3LoopActive ? Math.min(2, Math.floor(t3Lp * 3)) : -1
  const t3Sub = t3LoopActive ? t3Lp * 3 - t3ToolIdx : 0
  const t3Bt = t3Sub < 0.5 ? easeInOutCubic(t3Sub / 0.5) : 1 - easeInOutCubic((t3Sub - 0.5) / 0.5)
  const toolY = [21, 61, 101]
  const t3DotToolX = t3LoopActive ? lerp(308, 378, t3Bt) : 308
  const t3DotToolY = t3LoopActive && t3ToolIdx >= 0 ? lerp(61, toolY[t3ToolIdx], t3Bt) : 61
  const t3DotDoneX = p3 >= 0.76 && p3 < 0.90 ? lerp(504, 598, easeInOutCubic(clamp01((p3 - 0.76) / 0.14))) : 504
  const t3DotDoneOp = p3 >= 0.76 && p3 < 0.90 ? 1 : 0

  // Tier 4 Guild convergence dots
  const subY = [21, 63, 105]
  const streamBase = (p4 * 1.35) % 1
  const offsets = [0.78, 0.50, 0.24]
  const gDots = [0, 1, 2].map((i) => {
    const lt =
      p4 >= 0.38 && p4 < 0.88
        ? clamp01(((p4 - 0.38) / 0.50 - i * 0.12) / 0.76)
        : (streamBase + offsets[i]) % 1
    const e = easeInOutCubic(lt)
    return { x: lerp(486, 594, e), y: lerp(subY[i], 63, e) }
  })

  return (
    <div className={`rounded-2xl border border-amber-500/50 bg-[#FAF8F5] text-[#1F1B18] overflow-hidden shadow-xl ${className}`}>
      {/* Official ConnectLn Ownership Top Chrome */}
      <div className="bg-[#171513] text-[#F5F0EB] px-3.5 py-2.5 border-b border-amber-500/40 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#231F1C] border border-[#A64532] font-serif font-black text-sm text-[#F5F0EB] shadow-xs">
            C
          </span>
          <span className="font-black text-xs sm:text-sm tracking-tight text-white">
            ConnectLn Original Animated Video
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#A64532]/25 border border-[#A64532] px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300 uppercase tracking-wider">
            <ShieldCheck className="h-3 w-3 text-amber-400" />
            <span>Belongs to ConnectLn · {serialPlate}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setViewMode("4tier")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              viewMode === "4tier"
                ? "bg-[#A64532] text-white"
                : "bg-white/10 text-[#EFE8DC]/80 hover:bg-white/15"
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>4-Tier Workflow</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              viewMode === "grid"
                ? "bg-[#A64532] text-white"
                : "bg-white/10 text-[#EFE8DC]/80 hover:bg-white/15"
            }`}
          >
            <Grid className="h-3 w-3" />
            <span>All {PROFESSION_ENCLAVES.length} Enclaves Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setAutoReel(!autoReel)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              autoReel
                ? "bg-amber-500 text-zinc-950"
                : "bg-white/10 text-[#EFE8DC]/80 hover:bg-white/15"
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>{autoReel ? "Auto-Reel: ON" : "Auto-Reel All"}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>
        </div>
      </div>

      {/* Profession Switcher Strip */}
      {!compact && (
        <div className="bg-[#231F1C] px-3.5 py-2 border-b border-[#35302B] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
              Enclave:
            </span>
            <select
              value={activeEnclave.id}
              onChange={(e) => {
                const nextEncId = e.target.value
                setSelectedEnclaveId(nextEncId)
                const firstProf = ALL_PROFESSIONS.find((p) => p.enclaveId === nextEncId)
                if (firstProf) setSelectedProfId(firstProf.id)
              }}
              className="rounded-lg bg-[#171513] border border-amber-500/40 px-2.5 py-1 text-[11px] font-bold text-white focus:outline-none"
            >
              {PROFESSION_ENCLAVES.map((enc) => (
                <option key={enc.id} value={enc.id}>
                  {enc.icon} {enc.shortName}
                </option>
              ))}
            </select>

            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 ml-1">
              Profession ({enclaveProfessions.length}):
            </span>
            <select
              value={activeProfession.id}
              onChange={(e) => setSelectedProfId(e.target.value)}
              className="rounded-lg bg-[#171513] border border-white/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 max-w-[260px] focus:outline-none"
            >
              {enclaveProfessions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[10px] font-mono font-bold text-[#D6D1C7]">
            🔒 ConnectLn Studio · {ALL_PROFESSIONS.length} Verified Professions
          </span>
        </div>
      )}

      {/* Shared SVG Definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="clnRainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF3B30" />
            <stop offset="18%" stopColor="#FF9500" />
            <stop offset="34%" stopColor="#FFCC00" />
            <stop offset="50%" stopColor="#34C759" />
            <stop offset="66%" stopColor="#00C7BE" />
            <stop offset="82%" stopColor="#4A90E2" />
            <stop offset="100%" stopColor="#FF2D95" />
          </linearGradient>
          <g id="clnMascot">
            <rect x="-29" y="-3" width="7" height="6" rx="1" fill="#FF3B30" />
            <rect x="22" y="-3" width="7" height="6" rx="1" fill="#FF2D95" />
            <rect x="-22" y="-21" width="10" height="6" rx="1" fill="#FF4F28" />
            <rect x="12" y="-21" width="10" height="6" rx="1" fill="#E935A1" />
            <rect x="-22" y="-15" width="44" height="27" rx="2" fill="url(#clnRainbowGrad)" />
            <rect x="-22" y="12" width="6" height="8" rx="1" fill="#FF3B30" />
            <rect x="-11" y="12" width="6" height="8" rx="1" fill="#FFCC00" />
            <rect x="5" y="12" width="6" height="8" rx="1" fill="#00C7BE" />
            <rect x="16" y="12" width="6" height="8" rx="1" fill="#FF2D95" />
            <rect x="-10" y="-8" width="5" height="11" rx="1" fill="#FFFFFF" />
            <rect x="5" y="-8" width="5" height="11" rx="1" fill="#FFFFFF" />
            <rect x="-6" y="1" width="12" height="9" rx="2" fill="#171513" opacity="0.88" />
            <text x="0" y="8" textAnchor="middle" fontSize="7" fontWeight="900" fill="#FBBF24">C</text>
          </g>
          <g id="clnMiniMascot">
            <rect x="-13" y="-1.5" width="3" height="3" rx="0.5" fill="#FF3B30" />
            <rect x="10" y="-1.5" width="3" height="3" rx="0.5" fill="#FF2D95" />
            <rect x="-10" y="-9.5" width="4.5" height="3" rx="0.5" fill="#FF4F28" />
            <rect x="5.5" y="-9.5" width="4.5" height="3" rx="0.5" fill="#E935A1" />
            <rect x="-10" y="-7" width="20" height="12.5" rx="1" fill="url(#clnRainbowGrad)" />
            <rect x="-10" y="5.5" width="2.8" height="3.5" rx="0.5" fill="#FF3B30" />
            <rect x="-5" y="5.5" width="2.8" height="3.5" rx="0.5" fill="#FFCC00" />
            <rect x="2.2" y="5.5" width="2.8" height="3.5" rx="0.5" fill="#00C7BE" />
            <rect x="7.2" y="5.5" width="2.8" height="3.5" rx="0.5" fill="#FF2D95" />
            <rect x="-4.5" y="-3.5" width="2.4" height="5.5" rx="0.5" fill="#FFFFFF" />
            <rect x="2.1" y="-3.5" width="2.4" height="5.5" rx="0.5" fill="#FFFFFF" />
          </g>
        </defs>
      </svg>

      {viewMode === "4tier" ? (
        <div className="p-3.5 sm:p-5 space-y-3">
          {/* Title Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E5DEC9]">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl">{activeEnclave.icon}</span>
                <h3 className="text-base sm:text-xl font-black text-[#9E4F14] tracking-tight">
                  {activeProfession.title}
                </h3>
              </div>
              <p className="text-xs font-bold text-[#5C534E]">
                Each ConnectLn tier is the last one plus one verified capability
              </p>
            </div>
            <span className="rounded-lg bg-[#171513] text-[#F5F0EB] border border-[#A64532] px-2.5 py-1 font-mono text-[10px] font-extrabold">
              C · CONNECTLN ORIGINAL · {serialPlate}
            </span>
          </div>

          {/* TIER 1 */}
          <div className="rounded-xl p-3 border border-[#EBD5B3] bg-gradient-to-b from-[#FDF8EE] to-[#FBF0D9]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-md bg-[#D7B274] text-[#4A3516] font-extrabold text-xs">
                  1. Solo Craft
                </span>
                <span className="text-xs font-bold text-[#5C534E]">the practitioner</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#8C3819]">ConnectLn Verified</span>
            </div>
            <svg viewBox="0 0 760 94" className="w-full h-auto block">
              <line x1="154" y1="47" x2="328" y2="47" stroke="#1E1B18" strokeWidth="2.3" />
              <path d="M 320 40 L 330 47 L 320 54" fill="none" stroke="#1E1B18" strokeWidth="2.3" />
              <line x1="418" y1="47" x2="592" y2="47" stroke="#1E1B18" strokeWidth="2.3" />
              <path d="M 584 40 L 594 47 L 584 54" fill="none" stroke="#1E1B18" strokeWidth="2.3" />
              <circle cx={t1Dot1X} cy="47" r="5" fill="#D97724" opacity={t1Dot1Op} />
              <circle cx={t1Dot2X} cy="47" r="5" fill="#1D93FF" opacity={t1Dot2Op} />
              <g transform="translate(88, 47)">
                <rect x="-60" y="-36" width="120" height="72" rx="6" fill="#F8E7C9" stroke="#D8C29D" strokeWidth="1.5" />
                <text x="0" y="-4" textAnchor="middle" fontSize="16">📋</text>
                <text x="0" y="21" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#2A2522">Job Brief</text>
              </g>
              <g transform={`translate(373, ${47 + bob})`}>
                <use href="#clnMascot" />
              </g>
              <g transform="translate(662, 47)">
                <rect x="-60" y="-36" width="120" height="72" rx="6" fill="#F8E7C9" stroke={p1 >= 0.85 ? "#D97724" : "#D8C29D"} strokeWidth={p1 >= 0.85 ? "2.4" : "1.5"} />
                <text x="0" y="-4" textAnchor="middle" fontSize="16">💬</text>
                <text x="0" y="21" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#2A2522">Field Output</text>
              </g>
            </svg>
            <div className="text-right text-[11px] font-bold text-[#3F3935]">knows only personal training &amp; memory</div>
          </div>

          {/* TIER 2 */}
          <div className="rounded-xl p-3 border border-[#C8DCFA] bg-gradient-to-b from-[#F4F8FF] to-[#EBF2FF]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-md bg-[#7AA7F7] text-[#163266] font-extrabold text-xs">
                  2. + Spec Vault
                </span>
                <span className="text-xs font-bold text-[#5C534E]">+ ConnectLn blueprints &amp; compliance codes</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#163266]">ConnectLn Enclave Vault</span>
            </div>
            <svg viewBox="0 0 760 94" className="w-full h-auto block">
              <line x1="154" y1="45" x2="232" y2="45" stroke="#1E1B18" strokeWidth="2.3" />
              <path d="M 224 38 L 234 45 L 224 52" fill="none" stroke="#1E1B18" strokeWidth="2.3" />
              <line x1="292" y1="45" x2="365" y2="45" stroke="#1E1B18" strokeWidth="2.3" />
              <line x1="432" y1="45" x2="596" y2="45" stroke="#1E1B18" strokeWidth="2.3" />
              <circle cx={t2Dot1X} cy="45" r="5" fill="#3B82F6" opacity={t2Dot1Op} />
              <circle cx={t2Dot2X} cy="45" r="5" fill="#06B6D4" opacity={t2Dot2Op} />
              <circle cx={t2Dot3X} cy="45" r="5" fill="#1D93FF" opacity={t2Dot3Op} />
              <g transform="translate(88, 47)">
                <rect x="-60" y="-36" width="120" height="72" rx="6" fill="#E3EEFF" stroke="#B4CEF5" strokeWidth="1.5" />
                <text x="0" y="-4" textAnchor="middle" fontSize="16">📋</text>
                <text x="0" y="21" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#2A2522">Job Brief</text>
              </g>
              <g transform="translate(263, 41)">
                <rect x="-14" y="-18" width="28" height="38" rx="2" fill="#89B4F8" />
                <rect x="-22" y="-23" width="44" height="11" rx="2" fill={t2ActiveBar === 0 ? "#2563EB" : "#465670"} />
                <rect x="-22" y="-5.5" width="44" height="11" rx="2" fill={t2ActiveBar === 1 ? "#2563EB" : "#465670"} />
                <rect x="-22" y="12" width="44" height="11" rx="2" fill={t2ActiveBar === 2 ? "#2563EB" : "#465670"} />
                <text x="0" y="38" textAnchor="middle" fontSize="11" fontWeight="700" fill="#2A2522">trade specs</text>
              </g>
              <g transform={`translate(399, ${45 + bob}) scale(0.84)`}>
                <use href="#clnMascot" />
              </g>
              <g transform="translate(662, 47)">
                <rect x="-60" y="-36" width="120" height="72" rx="6" fill="#E3EEFF" stroke={p2 >= 0.88 ? "#2563EB" : "#B4CEF5"} strokeWidth={p2 >= 0.88 ? "2.4" : "1.5"} />
                <text x="0" y="-4" textAnchor="middle" fontSize="16">📐</text>
                <text x="0" y="21" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#2A2522">Code Verified</text>
              </g>
            </svg>
            <div className="text-right text-[11px] font-bold text-[#3F3935]">executes from verified ConnectLn trade docs</div>
          </div>

          {/* TIER 3 */}
          <div className="rounded-xl p-3 border border-[#F3C6E4] bg-gradient-to-b from-[#FFF5FB] to-[#FDEBF6]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-md bg-[#F48AD7] text-[#5E164B] font-extrabold text-xs">
                  3. + Tool Loop
                </span>
                <span className="text-xs font-bold text-[#5C534E]">+ ConnectLn profession tools in a loop</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#5E164B]">ConnectLn Workbench</span>
            </div>
            <svg viewBox="0 0 760 116" className="w-full h-auto block">
              <line x1="154" y1="58" x2="255" y2="58" stroke="#1E1B18" strokeWidth="2.3" />
              <line x1="308" y1="58" x2="378" y2="21" stroke={t3ToolIdx === 0 ? "#DB2777" : "#1E1B18"} strokeWidth="2.2" />
              <line x1="308" y1="58" x2="378" y2="58" stroke={t3ToolIdx === 1 ? "#DB2777" : "#1E1B18"} strokeWidth="2.2" />
              <line x1="308" y1="58" x2="378" y2="95" stroke={t3ToolIdx === 2 ? "#DB2777" : "#1E1B18"} strokeWidth="2.2" />
              <line x1="504" y1="58" x2="598" y2="58" stroke="#1E1B18" strokeWidth="2.3" />
              <circle cx={t3DotTaskX} cy="58" r="5" fill="#EC4899" opacity={t3DotTaskOp} />
              <circle cx={t3DotToolX} cy={t3DotToolY} r="5" fill="#F43F5E" opacity={t3LoopActive ? 1 : 0} />
              <circle cx={t3DotDoneX} cy="58" r="5" fill="#22C55E" opacity={t3DotDoneOp} />
              <g transform="translate(88, 58)">
                <rect x="-60" y="-36" width="120" height="72" rx="6" fill="#FDE2F3" stroke="#EAB8D9" strokeWidth="1.5" />
                <text x="0" y="-4" textAnchor="middle" fontSize="16">📝</text>
                <text x="0" y="21" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#2A2522">Field Ticket</text>
              </g>
              <g transform={`translate(282, ${58 + bob}) scale(0.84)`}>
                <use href="#clnMascot" />
              </g>
              {[tool0, tool1, tool2].map((tName, idx) => (
                <g key={idx} transform={`translate(441, ${[21, 58, 95][idx]})`}>
                  <rect
                    x="-63"
                    y="-13"
                    width="126"
                    height="26"
                    rx="5"
                    fill={t3ToolIdx === idx ? "#FDF2F8" : "#FFFFFF"}
                    stroke={t3ToolIdx === idx ? "#DB2777" : "#E7C2DC"}
                    strokeWidth={t3ToolIdx === idx ? "2.2" : "1.4"}
                  />
                  <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="700" fill="#2A2522">
                    {tName}
                  </text>
                </g>
              ))}
              <g transform="translate(662, 58)">
                <rect x="-60" y="-36" width="120" height="72" rx="6" fill="#FDE2F3" stroke={p3 >= 0.88 ? "#22C55E" : "#EAB8D9"} strokeWidth={p3 >= 0.88 ? "2.4" : "1.5"} />
                <circle cx="0" cy="-6" r="12" fill="#5AC248" />
                <path d="M -5 -6 L -1.5 -2 L 5.5 -10" stroke="#FFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <text x="0" y="22" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#2A2522">Done</text>
              </g>
            </svg>
            <div className="text-right text-[11px] font-bold text-[#3F3935]">acts with ConnectLn tools until the task is done</div>
          </div>

          {/* TIER 4 */}
          <div className="rounded-xl p-3 border border-[#BDE8C4] bg-gradient-to-b from-[#F3FCF4] to-[#E6F8E9]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-md bg-[#77D387] text-[#134E1F] font-extrabold text-xs">
                  4. ConnectLn Guild
                </span>
                <span className="text-xs font-bold text-[#5C534E]">+ multi-specialist coordination &amp; vouches</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#134E1F]">ConnectLn Guild Network</span>
            </div>
            <svg viewBox="0 0 760 120" className="w-full h-auto block">
              <line x1="154" y1="60" x2="195" y2="60" stroke="#1E1B18" strokeWidth="2.3" />
              <line x1="250" y1="60" x2="338" y2="21" stroke="#1E1B18" strokeWidth="2.1" />
              <line x1="250" y1="60" x2="338" y2="60" stroke="#1E1B18" strokeWidth="2.1" />
              <line x1="250" y1="60" x2="338" y2="99" stroke="#1E1B18" strokeWidth="2.1" />
              <line x1="486" y1="21" x2="598" y2="60" stroke="#1E1B18" strokeWidth="2.1" />
              <line x1="486" y1="60" x2="598" y2="60" stroke="#1E1B18" strokeWidth="2.1" />
              <line x1="486" y1="99" x2="598" y2="60" stroke="#1E1B18" strokeWidth="2.1" />
              <path d="M 589 52 L 599 60 L 589 68" fill="none" stroke="#1E1B18" strokeWidth="2.3" />

              {gDots.map((gd, idx) => (
                <circle key={idx} cx={gd.x} cy={gd.y} r="5.5" fill="#167928" />
              ))}

              <g transform="translate(88, 60)">
                <rect x="-60" y="-36" width="120" height="72" rx="6" fill="#DCF6E0" stroke="#A9DFB2" strokeWidth="1.5" />
                <text x="0" y="-4" textAnchor="middle" fontSize="16">📝</text>
                <text x="0" y="21" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#2A2522">Guild Project</text>
              </g>
              <g transform={`translate(223, ${60 + bob}) scale(0.84)`}>
                <use href="#clnMascot" />
              </g>
              {crewRoles.map((role, idx) => (
                <g key={idx} transform={`translate(412, ${[21, 60, 99][idx]})`}>
                  <rect x="-74" y="-13" width="148" height="26" rx="5" fill="#FFFFFF" stroke="#B6E3BE" strokeWidth="1.5" />
                  <g transform="translate(-54, 0)">
                    <use href="#clnMiniMascot" />
                  </g>
                  <text x="10" y="4" textAnchor="middle" fontSize="11" fontWeight="700" fill="#2A2522">
                    {role}
                  </text>
                </g>
              ))}
              <g transform="translate(662, 60)">
                <rect x="-60" y="-36" width="120" height="72" rx="6" fill="#DCF6E0" stroke={p4 >= 0.85 ? "#16A34A" : "#A9DFB2"} strokeWidth={p4 >= 0.85 ? "2.4" : "1.5"} />
                <circle cx="0" cy="-6" r="12" fill="#5AC248" />
                <path d="M -5 -6 L -1.5 -2 L 5.5 -10" stroke="#FFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <text x="0" y="22" textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#134E1F">Vouched Done</text>
              </g>
            </svg>
            <div className="text-right text-[11px] font-bold text-[#3F3935]">many ConnectLn specialists, one vouched goal ({shortProfTitle})</div>
          </div>
        </div>
      ) : (
        /* ALL ENCLAVES ONE-PAGE ANIMATED POSTER GRID */
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PROFESSION_ENCLAVES.map((enc, idx) => {
            const firstProf = enc.professions[0]
            const tA = firstProf?.tools?.[0]?.name?.slice(0, 14) || "Spec Tool"
            const tB = firstProf?.tools?.[1]?.name?.slice(0, 14) || "Field Meter"
            const tC = firstProf?.tools?.[2]?.name?.slice(0, 14) || "QA Lockout"
            const activeBox = Math.floor(((clock * 0.8 + idx * 0.25) % 1) * 3)
            const isNavy = idx % 2 === 0
            return (
              <div
                key={enc.id}
                onClick={() => {
                  setSelectedEnclaveId(enc.id)
                  if (firstProf) setSelectedProfId(firstProf.id)
                  setViewMode("4tier")
                }}
                className={`rounded-xl border overflow-hidden cursor-pointer transition-transform hover:-translate-y-0.5 shadow-xs flex flex-col ${
                  isNavy ? "bg-[#E8F1FA] border-[#90B4D9]" : "bg-[#F3EAFC] border-[#BD9BE5]"
                }`}
              >
                <div
                  className={`px-3 py-1.5 text-white font-extrabold text-xs flex items-center justify-between ${
                    isNavy ? "bg-[#0D3C6E]" : "bg-[#6B1D9E]"
                  }`}
                >
                  <span className="truncate">
                    {enc.icon} {enc.shortName}
                  </span>
                  <span className="font-mono text-[9px] bg-black/30 px-1.5 py-0.5 rounded">ConnectLn</span>
                </div>
                <div className="bg-white m-1.5 rounded-lg p-1.5 border border-black/10">
                  <svg viewBox="0 0 220 92" className="w-full h-auto block">
                    <rect x="4" y="24" width="44" height="44" rx="4" fill="#F8FAFC" stroke="#94A3B8" />
                    <text x="26" y="45" textAnchor="middle" fontSize="13">{enc.icon}</text>
                    <text x="26" y="60" textAnchor="middle" fontSize="7" fontWeight="700" fill="#1E293B">Ticket</text>
                    <line x1="48" y1="46" x2="68" y2="46" stroke="#1E293B" strokeWidth="1.5" />
                    <g transform={`translate(79, ${46 + Math.sin(clock * 4 + idx) * 1.5})`}>
                      <use href="#clnMiniMascot" />
                    </g>
                    <line x1="91" y1="46" x2="108" y2="16" stroke="#334155" strokeWidth="1.3" />
                    <line x1="91" y1="46" x2="108" y2="46" stroke="#334155" strokeWidth="1.3" />
                    <line x1="91" y1="46" x2="108" y2="76" stroke="#334155" strokeWidth="1.3" />
                    {[tA, tB, tC].map((lbl, bIdx) => (
                      <g key={bIdx}>
                        <rect
                          x="108"
                          y={[6, 36, 66][bIdx]}
                          width="66"
                          height="20"
                          rx="3"
                          fill={activeBox === bIdx ? "#FEF3C7" : "#FFFFFF"}
                          stroke={activeBox === bIdx ? "#A64532" : "#94A3B8"}
                          strokeWidth={activeBox === bIdx ? "1.8" : "1.1"}
                        />
                        <text x="141" y={[19, 49, 79][bIdx]} textAnchor="middle" fontSize="7" fontWeight="800" fill="#0F172A">
                          {lbl}
                        </text>
                      </g>
                    ))}
                    <line x1="174" y1="16" x2="196" y2="46" stroke="#334155" strokeWidth="1.3" />
                    <line x1="174" y1="46" x2="196" y2="46" stroke="#334155" strokeWidth="1.3" />
                    <line x1="174" y1="76" x2="196" y2="46" stroke="#334155" strokeWidth="1.3" />
                    <circle cx="205" cy="46" r="10" fill="#22C55E" />
                    <path d="M 200 46 L 203.5 49.5 L 210 42.5" stroke="#FFF" strokeWidth="2" fill="none" />
                  </svg>
                </div>
                <div className="px-2.5 pb-2 mt-auto flex items-center justify-between text-[10px] font-bold text-slate-700">
                  <span className="rounded bg-[#171513] text-amber-300 px-1.5 py-0.5 font-mono text-[9px]">
                    ConnectLn Studio
                  </span>
                  <span className="text-[#A64532] font-extrabold">{enc.professions.length} Pros →</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
