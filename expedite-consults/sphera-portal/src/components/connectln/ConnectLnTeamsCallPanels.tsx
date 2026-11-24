"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  BarChart3,
  Captions,
  Check,
  Download,
  FileText,
  Hand,
  HelpCircle,
  LayoutGrid,
  Maximize2,
  Mic,
  MicOff,
  Pause,
  Pencil,
  PhoneForwarded,
  Pin,
  Play,
  Plus,
  Radio,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Undo2,
  Users,
  Voicemail,
  X,
} from "lucide-react"

export interface CommTeamsStateClient {
  raised_hands: Array<{ user_id: string; name: string; raised_at_ms: number }>
  reactions: Array<{ id: string; user_id: string; name: string; emoji: string; ts: number }>
  spotlight_user_id: string | null
  lobby_enabled: boolean
  lobby_queue: Array<{ user_id: string; name: string; phone?: string; requested_at_ms: number }>
  admitted_user_ids: string[]
  denied_user_ids: string[]
  is_recording: boolean
  recording_by_name?: string
  recording_started_at_ms?: number
  captions: Array<{ id: string; user_id: string; speaker_name: string; text: string; ts: number }>
  polls: Array<{
    id: string
    question: string
    options: Array<{ id: string; text: string; votes: string[] }>
    created_by: string
    created_at_ms: number
    closed?: boolean
  }>
  qa_items: Array<{
    id: string
    question: string
    author: string
    upvotes: string[]
    answer?: string
    answered_by?: string
    ts: number
  }>
  whiteboard_strokes: Array<{
    id: string
    color: string
    width: number
    points: Array<[number, number]>
    isAnnotation?: boolean
  }>
  whiteboard_notes: Array<{
    id?: string
    x: number
    y: number
    text: string
    color: string
    author: string
  }>
  breakout_rooms: Array<{
    id: string
    name: string
    call_id: string
    assigned_user_ids: string[]
    ends_at_ms?: number
  }>
  breakout_broadcast: { text: string; ts: number } | null
  on_hold_user_ids: string[]
  attendance_log: Array<{
    user_id: string
    name: string
    joined_at_ms: number
    last_seen_ms: number
    left_at_ms?: number
  }>
  updated_at_ms: number
}

export const EMPTY_TEAMS_STATE: CommTeamsStateClient = {
  raised_hands: [],
  reactions: [],
  spotlight_user_id: null,
  lobby_enabled: false,
  lobby_queue: [],
  admitted_user_ids: [],
  denied_user_ids: [],
  is_recording: false,
  captions: [],
  polls: [],
  qa_items: [],
  whiteboard_strokes: [],
  whiteboard_notes: [],
  breakout_rooms: [],
  breakout_broadcast: null,
  on_hold_user_ids: [],
  attendance_log: [],
  updated_at_ms: 0,
}

export const TEAMS_CALL_REACTIONS = ["👍", "❤️", "👏", "😂", "🎉", "💡"]

export type TeamsSignalFn = (subAction: string, payload?: Record<string, any>) => Promise<void> | void

export function TeamsCallOverlays({
  teamsState,
  localUserId,
  canModerateCall,
  isHost,
  isCaptionsOn,
  isOnHold,
  activeBreakoutName,
  onReturnFromBreakout,
  onResumeHold,
  onLeaveDenied,
  onTeamsSignal,
}: {
  teamsState: CommTeamsStateClient
  localUserId: string
  canModerateCall: boolean
  isHost: boolean
  isCaptionsOn: boolean
  isOnHold: boolean
  activeBreakoutName?: string | null
  onReturnFromBreakout?: () => void
  onResumeHold: () => void
  onLeaveDenied: () => void
  onTeamsSignal: TeamsSignalFn
}) {
  const nowMs = Date.now()
  const visibleReactions = (teamsState.reactions || []).filter((r) => nowMs - r.ts < 5500)
  const latestCaptions = (teamsState.captions || []).slice(-2)
  const myAssignedBreakout = (teamsState.breakout_rooms || []).find((b) =>
    (b.assigned_user_ids || []).includes(localUserId)
  )

  const isDenied = (teamsState.denied_user_ids || []).includes(localUserId)
  const isWaitingInLobby =
    !canModerateCall &&
    teamsState.lobby_enabled &&
    !(teamsState.admitted_user_ids || []).includes(localUserId)

  if (isDenied) {
    return (
      <div className="fixed inset-0 z-[65] bg-[#0B141A]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-sm rounded-3xl bg-[#1F2C34] border border-rose-500/40 p-6 space-y-3 shadow-2xl">
          <p className="text-base font-extrabold text-white">Entry Declined by Organizer</p>
          <p className="text-xs text-slate-300">
            The meeting host declined entry from the waiting room lobby.
          </p>
          <button
            type="button"
            onClick={onLeaveDenied}
            className="w-full rounded-xl bg-rose-600 hover:bg-rose-500 py-2.5 text-xs font-extrabold text-white cursor-pointer"
          >
            Leave Call
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Guest Waiting Room Lobby Overlay */}
      {isWaitingInLobby && (
        <div className="fixed inset-0 z-[55] bg-[#0B141A]/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-sm rounded-3xl bg-[#1F2C34] border border-emerald-500/40 p-6 space-y-3 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-emerald-300" />
            </div>
            <h3 className="text-lg font-extrabold text-white">Waiting in Meeting Lobby</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We&apos;ve notified the organizer. You&apos;ll join the meeting automatically as soon as you&apos;re admitted.
            </p>
            <button
              type="button"
              onClick={onLeaveDenied}
              className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white cursor-pointer"
            >
              Leave Waiting Room
            </button>
          </div>
        </div>
      )}

      {/* Top Status Chips (Recording Badge, Raised Hands, Lobby Queue, Breakout Banner) */}
      <div className="fixed top-20 left-4 z-30 flex flex-col items-start gap-2 pointer-events-auto max-w-[85vw]">
        {teamsState.is_recording && (
          <div className="rounded-full bg-rose-950/90 border border-rose-400/60 px-3 py-1 flex items-center gap-1.5 shadow-lg">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[11px] font-extrabold text-rose-100">
              REC · {teamsState.recording_by_name || "Recording"}
            </span>
          </div>
        )}

        {(teamsState.raised_hands || []).length > 0 && (
          <div className="rounded-2xl bg-amber-950/90 border border-amber-400/50 px-3 py-1.5 flex items-center gap-2 shadow-lg">
            <Hand className="h-3.5 w-3.5 text-amber-300" />
            <span className="text-[11px] font-extrabold text-amber-100">
              {teamsState.raised_hands.length} Hand
              {teamsState.raised_hands.length === 1 ? "" : "s"} Raised:{" "}
              {teamsState.raised_hands.map((h) => h.name.split(" ")[0]).join(", ")}
            </span>
          </div>
        )}

        {canModerateCall && (teamsState.lobby_queue || []).length > 0 && (
          <div className="rounded-2xl bg-[#1F2C34]/95 border border-emerald-400/60 p-2.5 shadow-2xl space-y-1.5 min-w-[240px]">
            <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Lobby ({teamsState.lobby_queue.length} waiting)</span>
            </p>
            {teamsState.lobby_queue.slice(0, 3).map((guest) => (
              <div
                key={guest.user_id}
                className="flex items-center justify-between gap-2 rounded-xl bg-[#0B141A] px-2.5 py-1.5"
              >
                <span className="text-xs font-bold text-white truncate">{guest.name}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onTeamsSignal("admit_lobby", { target_user_id: guest.user_id })}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold text-white cursor-pointer"
                  >
                    Admit
                  </button>
                  <button
                    type="button"
                    onClick={() => onTeamsSignal("deny_lobby", { target_user_id: guest.user_id })}
                    className="rounded-lg bg-rose-700 hover:bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold text-white cursor-pointer"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeBreakoutName && onReturnFromBreakout && (
          <div className="rounded-2xl bg-indigo-950/95 border border-indigo-400/60 px-3 py-1.5 flex items-center gap-2 shadow-lg">
            <span className="text-[11px] font-extrabold text-indigo-100">
              🚪 Breakout: {activeBreakoutName}
            </span>
            <button
              type="button"
              onClick={onReturnFromBreakout}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-2.5 py-0.5 text-[10.5px] font-extrabold text-white cursor-pointer"
            >
              Return to Main
            </button>
          </div>
        )}

        {!activeBreakoutName &&
          myAssignedBreakout &&
          !isHost && (
            <div className="rounded-2xl bg-indigo-950/95 border border-indigo-400/60 px-3 py-1.5 flex items-center gap-2 shadow-lg">
              <span className="text-[11px] font-bold text-indigo-100">
                Assigned to <strong>{myAssignedBreakout.name}</strong>
              </span>
            </div>
          )}

        {teamsState.breakout_broadcast?.text &&
          nowMs - teamsState.breakout_broadcast.ts < 15000 && (
            <div className="rounded-2xl bg-indigo-900/95 border border-indigo-300/60 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
              📣 Host Broadcast: {teamsState.breakout_broadcast.text}
            </div>
          )}
      </div>

      {/* Floating Emoji Reactions */}
      {visibleReactions.length > 0 && (
        <div className="fixed bottom-28 right-6 z-30 flex flex-col-reverse items-end gap-1.5 pointer-events-none">
          {visibleReactions.slice(-6).map((r) => (
            <div
              key={r.id}
              className="rounded-full bg-black/70 border border-white/15 px-3 py-1 flex items-center gap-1.5 shadow-xl animate-bounce"
            >
              <span className="text-lg leading-none">{r.emoji}</span>
              <span className="text-[10.5px] font-bold text-white/90">
                {r.name.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Call On Hold Banner */}
      {(isOnHold || (teamsState.on_hold_user_ids || []).length > 0) && (
        <div className="fixed top-20 right-4 z-30 rounded-2xl bg-amber-950/95 border border-amber-400/70 px-3.5 py-2 shadow-2xl flex items-center gap-2.5">
          <Pause className="h-4 w-4 text-amber-300 shrink-0" />
          <div className="text-left">
            <p className="text-xs font-extrabold text-amber-100">
              {isOnHold ? "You placed this call on hold" : "Participant on hold"}
            </p>
            <p className="text-[10px] text-amber-200/80">Hold music playing · Mic muted</p>
          </div>
          {isOnHold && (
            <button
              type="button"
              onClick={onResumeHold}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-[11px] font-extrabold text-white cursor-pointer flex items-center gap-1"
            >
              <Play className="h-3 w-3" />
              <span>Resume</span>
            </button>
          )}
        </div>
      )}

      {/* Live Closed Captions Strip */}
      {isCaptionsOn && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-25 w-[92vw] max-w-2xl rounded-2xl bg-black/82 border border-white/15 px-4 py-2 text-center shadow-xl pointer-events-none">
          {latestCaptions.length === 0 ? (
            <p className="text-xs text-slate-300 italic">
              Live captions enabled — listening for speech...
            </p>
          ) : (
            <div className="space-y-0.5">
              {latestCaptions.map((c) => (
                <p key={c.id} className="text-xs sm:text-sm text-white leading-snug">
                  <span className="font-extrabold text-emerald-300">{c.speaker_name}: </span>
                  <span>{c.text}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

export function TeamsMoreMenuPopover({
  open,
  onClose,
  isRecording,
  isCaptionsOn,
  isWhiteboardOpen,
  isPollsOpen,
  isBreakoutsOpen,
  isLobbyEnabled,
  canModerateCall,
  layoutMode,
  isOnHold,
  onToggleRecord,
  onToggleCaptions,
  onToggleWhiteboard,
  onTogglePolls,
  onToggleBreakouts,
  onToggleLobby,
  onToggleLayout,
  onToggleHold,
  onOpenTransfer,
  onOpenRecap,
}: {
  open: boolean
  onClose: () => void
  isRecording: boolean
  isCaptionsOn: boolean
  isWhiteboardOpen: boolean
  isPollsOpen: boolean
  isBreakoutsOpen: boolean
  isLobbyEnabled: boolean
  canModerateCall: boolean
  layoutMode: "gallery" | "spotlight"
  isOnHold: boolean
  onToggleRecord: () => void
  onToggleCaptions: () => void
  onToggleWhiteboard: () => void
  onTogglePolls: () => void
  onToggleBreakouts: () => void
  onToggleLobby: () => void
  onToggleLayout: () => void
  onToggleHold: () => void
  onOpenTransfer: () => void
  onOpenRecap: () => void
}) {
  if (!open) return null

  const items = [
    {
      label: isRecording ? "Stop Recording" : "Record Meeting",
      icon: Radio,
      active: isRecording,
      onClick: onToggleRecord,
    },
    {
      label: isCaptionsOn ? "Hide Captions (CC)" : "Live Captions (CC)",
      icon: Captions,
      active: isCaptionsOn,
      onClick: onToggleCaptions,
    },
    {
      label: "Whiteboard & Annotate",
      icon: Pencil,
      active: isWhiteboardOpen,
      onClick: onToggleWhiteboard,
    },
    {
      label: "Polls & Q&A",
      icon: BarChart3,
      active: isPollsOpen,
      onClick: onTogglePolls,
    },
    {
      label: "Breakout Rooms",
      icon: Users,
      active: isBreakoutsOpen,
      onClick: onToggleBreakouts,
    },
    {
      label: layoutMode === "spotlight" ? "Gallery View" : "Spotlight View",
      icon: layoutMode === "spotlight" ? LayoutGrid : Maximize2,
      active: layoutMode === "spotlight",
      onClick: onToggleLayout,
    },
    {
      label: isOnHold ? "Resume Call" : "Put Call on Hold",
      icon: isOnHold ? Play : Pause,
      active: isOnHold,
      onClick: onToggleHold,
    },
    {
      label: "Transfer Call",
      icon: PhoneForwarded,
      active: false,
      onClick: onOpenTransfer,
    },
    ...(canModerateCall
      ? [
          {
            label: isLobbyEnabled ? "Lobby: On (Click Off)" : "Enable Waiting Lobby",
            icon: ShieldCheck,
            active: isLobbyEnabled,
            onClick: onToggleLobby,
          },
        ]
      : []),
    {
      label: "AI Recap & Attendance",
      icon: Sparkles,
      active: false,
      onClick: onOpenRecap,
    },
  ]

  return (
    <div className="fixed inset-x-0 bottom-22 z-45 mx-auto w-[92vw] max-w-md rounded-3xl bg-[#111B21]/98 border border-white/20 p-3.5 shadow-2xl">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">
          Meeting &amp; Phone Tools
        </span>
        <button
          type="button"
          onClick={onClose}
          className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                item.onClick()
                onClose()
              }}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold cursor-pointer transition-colors ${
                item.active
                  ? "bg-emerald-600 text-white"
                  : "bg-[#1F2C34] hover:bg-[#2A3B45] text-slate-100"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function TeamsWhiteboardOverlay({
  open,
  transparentAnnotate,
  onToggleTransparent,
  onClose,
  strokes,
  notes,
  callerName,
  onTeamsSignal,
}: {
  open: boolean
  transparentAnnotate: boolean
  onToggleTransparent: () => void
  onClose: () => void
  strokes: CommTeamsStateClient["whiteboard_strokes"]
  notes: CommTeamsStateClient["whiteboard_notes"]
  callerName: string
  onTeamsSignal: TeamsSignalFn
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)
  const currentPtsRef = useRef<Array<[number, number]>>([])
  const [penColor, setPenColor] = useState("#10B981")
  const [penWidth, setPenWidth] = useState(3)
  const [stickyDraft, setStickyDraft] = useState("")

  useEffect(() => {
    if (!open || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const s of strokes || []) {
      if (!s.points || s.points.length < 1) continue
      ctx.beginPath()
      ctx.strokeStyle = s.color || "#10B981"
      ctx.lineWidth = s.width || 3
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      const [x0, y0] = s.points[0]
      ctx.moveTo((x0 / 100) * canvas.width, (y0 / 100) * canvas.height)
      for (let i = 1; i < s.points.length; i++) {
        const [px, py] = s.points[i]
        ctx.lineTo((px / 100) * canvas.width, (py / 100) * canvas.height)
      }
      ctx.stroke()
    }
  }, [open, strokes])

  if (!open) return null

  const getPctCoords = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
    return [Number(x.toFixed(2)), Number(y.toFixed(2))]
  }

  return (
    <div
      className={`fixed inset-x-3 top-16 bottom-24 z-35 rounded-3xl border border-emerald-400/50 shadow-2xl flex flex-col overflow-hidden ${
        transparentAnnotate ? "bg-slate-950/25 backdrop-blur-[1px]" : "bg-[#FAF7F2]"
      }`}
    >
      <div className="px-3.5 py-2 bg-[#111B21]/95 border-b border-white/15 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Pencil className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-extrabold text-white">
            {transparentAnnotate ? "Live Screen Annotation" : "Collaborative Whiteboard"}
          </span>
          <button
            type="button"
            onClick={onToggleTransparent}
            className="rounded-lg bg-white/15 hover:bg-white/25 px-2 py-0.5 text-[10.5px] font-bold text-emerald-200 cursor-pointer"
          >
            {transparentAnnotate ? "Switch to Board" : "Overlay Screen"}
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {["#10B981", "#0A66C2", "#EF4444", "#F59E0B", "#1C1917", "#FFFFFF"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setPenColor(c)}
              className={`w-5 h-5 rounded-full border cursor-pointer ${
                penColor === c ? "ring-2 ring-emerald-400 border-white" : "border-white/30"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <select
            value={penWidth}
            onChange={(e) => setPenWidth(Number(e.target.value))}
            className="rounded-lg bg-[#1F2C34] text-white text-[10.5px] px-1.5 py-1 border border-white/15"
          >
            <option value={2}>Thin</option>
            <option value={4}>Med</option>
            <option value={8}>Bold</option>
          </select>
          <button
            type="button"
            onClick={() => onTeamsSignal("wb_undo")}
            className="rounded-lg bg-white/15 hover:bg-white/25 px-2 py-1 text-[10.5px] font-bold text-white cursor-pointer flex items-center gap-1"
          >
            <Undo2 className="h-3 w-3" />
            <span>Undo</span>
          </button>
          <button
            type="button"
            onClick={() => onTeamsSignal("wb_clear")}
            className="rounded-lg bg-rose-700/80 hover:bg-rose-600 px-2 py-1 text-[10.5px] font-bold text-white cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              if (!canvasRef.current) return
              const a = document.createElement("a")
              a.href = canvasRef.current.toDataURL("image/png")
              a.download = `connectln-whiteboard-${Date.now()}.png`
              a.click()
            }}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2 py-1 text-[10.5px] font-bold text-white cursor-pointer flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            <span>PNG</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-6 w-6 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-0">
        <canvas
          ref={canvasRef}
          width={1200}
          height={680}
          onPointerDown={(e) => {
            drawingRef.current = true
            const pt = getPctCoords(e)
            currentPtsRef.current = [pt, pt]
          }}
          onPointerMove={(e) => {
            if (!drawingRef.current || !canvasRef.current) return
            const pt = getPctCoords(e)
            const prev = currentPtsRef.current[currentPtsRef.current.length - 1]
            currentPtsRef.current.push(pt)
            const ctx = canvasRef.current.getContext("2d")
            if (ctx && prev) {
              ctx.beginPath()
              ctx.strokeStyle = penColor
              ctx.lineWidth = penWidth
              ctx.lineCap = "round"
              ctx.moveTo((prev[0] / 100) * canvasRef.current.width, (prev[1] / 100) * canvasRef.current.height)
              ctx.lineTo((pt[0] / 100) * canvasRef.current.width, (pt[1] / 100) * canvasRef.current.height)
              ctx.stroke()
            }
          }}
          onPointerUp={() => {
            if (!drawingRef.current) return
            drawingRef.current = false
            if (currentPtsRef.current.length >= 2) {
              onTeamsSignal("wb_stroke", {
                stroke: {
                  id: `st_${Date.now()}`,
                  color: penColor,
                  width: penWidth,
                  points: currentPtsRef.current.slice(0, 120),
                  isAnnotation: transparentAnnotate,
                },
              })
            }
            currentPtsRef.current = []
          }}
          className="w-full h-full touch-none cursor-crosshair block"
        />

        {(notes || []).map((n, idx) => (
          <div
            key={n.id || idx}
            style={{ left: `${n.x}%`, top: `${n.y}%`, backgroundColor: n.color || "#FDE68A" }}
            className="absolute -translate-x-1/2 -translate-y-1/2 max-w-[160px] rounded-xl p-2 shadow-lg border border-black/15 text-[11px] font-bold text-slate-900 pointer-events-none"
          >
            <p>{n.text}</p>
            <p className="text-[9px] text-slate-600 mt-0.5">— {n.author}</p>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!stickyDraft.trim()) return
          onTeamsSignal("wb_sticky", {
            note: {
              id: `note_${Date.now()}`,
              x: 18 + Math.floor(Math.random() * 64),
              y: 20 + Math.floor(Math.random() * 55),
              text: stickyDraft.trim(),
              color: "#FDE68A",
              author: callerName,
            },
          })
          setStickyDraft("")
        }}
        className="px-3 py-2 bg-[#111B21]/95 border-t border-white/15 flex items-center gap-2"
      >
        <input
          type="text"
          value={stickyDraft}
          onChange={(e) => setStickyDraft(e.target.value)}
          placeholder="Add a sticky note to the board..."
          className="flex-1 rounded-xl bg-[#1F2C34] border border-white/15 px-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-xl bg-amber-400 hover:bg-amber-300 px-3 py-1.5 text-xs font-extrabold text-slate-950 cursor-pointer"
        >
          + Sticky Note
        </button>
      </form>
    </div>
  )
}

export function TeamsPollsQaDrawer({
  open,
  onClose,
  polls,
  qaItems,
  localUserId,
  canModerateCall,
  onTeamsSignal,
}: {
  open: boolean
  onClose: () => void
  polls: CommTeamsStateClient["polls"]
  qaItems: CommTeamsStateClient["qa_items"]
  localUserId: string
  canModerateCall: boolean
  onTeamsSignal: TeamsSignalFn
}) {
  const [tab, setTab] = useState<"polls" | "qa">("polls")
  const [pollQ, setPollQ] = useState("")
  const [opt1, setOpt1] = useState("Yes")
  const [opt2, setOpt2] = useState("No")
  const [opt3, setOpt3] = useState("")
  const [qaDraft, setQaDraft] = useState("")
  const [answeringId, setAnsweringId] = useState<string | null>(null)
  const [answerDraft, setAnswerDraft] = useState("")

  if (!open) return null

  return (
    <div className="fixed inset-x-0 bottom-22 z-40 mx-auto w-[94vw] max-w-lg rounded-3xl bg-[#111B21]/98 border-2 border-emerald-500/50 p-4 shadow-2xl max-h-[68vh] flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("polls")}
            className={`rounded-xl px-3 py-1 text-xs font-extrabold cursor-pointer ${
              tab === "polls" ? "bg-emerald-600 text-white" : "bg-white/10 text-slate-300"
            }`}
          >
            📊 Polls ({polls.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("qa")}
            className={`rounded-xl px-3 py-1 text-xs font-extrabold cursor-pointer ${
              tab === "qa" ? "bg-emerald-600 text-white" : "bg-white/10 text-slate-300"
            }`}
          >
            ❓ Q&amp;A ({qaItems.length})
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {tab === "polls" ? (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!pollQ.trim() || !opt1.trim() || !opt2.trim()) return
              onTeamsSignal("create_poll", {
                question: pollQ.trim(),
                options: [opt1.trim(), opt2.trim(), opt3.trim()].filter(Boolean),
              })
              setPollQ("")
              setOpt3("")
            }}
            className="rounded-2xl bg-[#0B141A] border border-white/10 p-3 space-y-2"
          >
            <input
              type="text"
              value={pollQ}
              onChange={(e) => setPollQ(e.target.value)}
              placeholder="Ask a live poll question..."
              className="w-full rounded-xl bg-[#1F2C34] border border-white/15 px-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none"
            />
            <div className="grid grid-cols-3 gap-1.5">
              <input
                type="text"
                value={opt1}
                onChange={(e) => setOpt1(e.target.value)}
                placeholder="Option 1"
                className="rounded-lg bg-[#1F2C34] border border-white/10 px-2 py-1 text-[11px] text-white"
              />
              <input
                type="text"
                value={opt2}
                onChange={(e) => setOpt2(e.target.value)}
                placeholder="Option 2"
                className="rounded-lg bg-[#1F2C34] border border-white/10 px-2 py-1 text-[11px] text-white"
              />
              <input
                type="text"
                value={opt3}
                onChange={(e) => setOpt3(e.target.value)}
                placeholder="Option 3 (opt)"
                className="rounded-lg bg-[#1F2C34] border border-white/10 px-2 py-1 text-[11px] text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-1.5 text-xs font-extrabold text-white cursor-pointer"
            >
              Launch Live Poll
            </button>
          </form>

          {polls.map((poll) => {
            const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0)
            return (
              <div
                key={poll.id}
                className="rounded-2xl bg-[#1F2C34] border border-white/10 p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-extrabold text-white">{poll.question}</p>
                    <p className="text-[10px] text-slate-400">
                      By {poll.created_by} · {totalVotes} vote{totalVotes === 1 ? "" : "s"}
                      {poll.closed ? " · Closed" : ""}
                    </p>
                  </div>
                  {canModerateCall && !poll.closed && (
                    <button
                      type="button"
                      onClick={() => onTeamsSignal("close_poll", { poll_id: poll.id })}
                      className="rounded-lg bg-white/10 hover:bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white cursor-pointer"
                    >
                      Close
                    </button>
                  )}
                </div>
                <div className="space-y-1.5">
                  {poll.options.map((opt) => {
                    const pct = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0
                    const voted = opt.votes.includes(localUserId)
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={Boolean(poll.closed)}
                        onClick={() =>
                          onTeamsSignal("vote_poll", { poll_id: poll.id, option_id: opt.id })
                        }
                        className={`w-full relative overflow-hidden rounded-xl border px-3 py-1.5 text-left text-xs flex items-center justify-between cursor-pointer ${
                          voted
                            ? "border-emerald-400 bg-emerald-950/60 text-white font-bold"
                            : "border-white/10 bg-[#0B141A] text-slate-200 hover:border-white/30"
                        }`}
                      >
                        <span
                          className="absolute inset-y-0 left-0 bg-emerald-500/20 pointer-events-none"
                          style={{ width: `${pct}%` }}
                        />
                        <span className="relative z-10 flex items-center gap-1.5">
                          {voted && <Check className="h-3 w-3 text-emerald-400" />}
                          <span>{opt.text}</span>
                        </span>
                        <span className="relative z-10 text-[10.5px] font-mono text-emerald-300">
                          {pct}% ({opt.votes.length})
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!qaDraft.trim()) return
              onTeamsSignal("ask_qa", { question: qaDraft.trim() })
              setQaDraft("")
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={qaDraft}
              onChange={(e) => setQaDraft(e.target.value)}
              placeholder="Ask a question for the speaker..."
              className="flex-1 rounded-xl bg-[#1F2C34] border border-white/15 px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-extrabold text-white cursor-pointer"
            >
              Ask
            </button>
          </form>

          {qaItems.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              No questions yet. Attendees can submit and upvote Q&amp;A topics here.
            </p>
          ) : (
            qaItems.map((q) => {
              const upvoted = q.upvotes.includes(localUserId)
              return (
                <div
                  key={q.id}
                  className="rounded-2xl bg-[#1F2C34] border border-white/10 p-3 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">{q.question}</p>
                      <p className="text-[10px] text-slate-400">Asked by {q.author}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onTeamsSignal("upvote_qa", { qa_id: q.id })}
                      className={`rounded-lg px-2 py-1 text-[10.5px] font-extrabold shrink-0 cursor-pointer ${
                        upvoted ? "bg-emerald-600 text-white" : "bg-white/10 text-slate-200"
                      }`}
                    >
                      ▲ {q.upvotes.length}
                    </button>
                  </div>
                  {q.answer ? (
                    <p className="rounded-xl bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1.5 text-[11px] text-emerald-100">
                      <span className="font-extrabold">Answer ({q.answered_by}): </span>
                      {q.answer}
                    </p>
                  ) : (
                    canModerateCall &&
                    (answeringId === q.id ? (
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="text"
                          value={answerDraft}
                          onChange={(e) => setAnswerDraft(e.target.value)}
                          placeholder="Type answer..."
                          className="flex-1 rounded-lg bg-[#0B141A] border border-white/15 px-2 py-1 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onTeamsSignal("answer_qa", { qa_id: q.id, answer: answerDraft })
                            setAnsweringId(null)
                            setAnswerDraft("")
                          }}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10.5px] font-bold text-white cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAnsweringId(q.id)
                          setAnswerDraft("")
                        }}
                        className="text-[10.5px] font-bold text-emerald-300 hover:underline cursor-pointer"
                      >
                        + Reply / Mark Answered
                      </button>
                    ))
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export function TeamsBreakoutRoomsDrawer({
  open,
  onClose,
  mainCallId,
  breakoutRooms,
  peers,
  canModerateCall,
  onJoinBreakoutRoom,
  onTeamsSignal,
}: {
  open: boolean
  onClose: () => void
  mainCallId: string
  breakoutRooms: CommTeamsStateClient["breakout_rooms"]
  peers: Array<{ userId: string; name: string }>
  canModerateCall: boolean
  onJoinBreakoutRoom: (roomCallId: string, roomName: string) => void
  onTeamsSignal: TeamsSignalFn
}) {
  const [roomCount, setRoomCount] = useState(2)
  const [durationMin, setDurationMin] = useState(10)
  const [broadcastText, setBroadcastText] = useState("")

  if (!open) return null

  const handleCreateBreakouts = () => {
    const rooms = Array.from({ length: roomCount }, (_, idx) => ({
      id: `brk_${idx + 1}`,
      name: `Room ${idx + 1}`,
      call_id: `${mainCallId}_brk_${idx + 1}`,
      assigned_user_ids: [] as string[],
    }))
    peers.forEach((p, idx) => {
      rooms[idx % rooms.length].assigned_user_ids.push(p.userId)
    })
    onTeamsSignal("create_breakouts", { rooms, duration_min: durationMin })
  }

  return (
    <div className="fixed inset-x-0 bottom-22 z-40 mx-auto w-[94vw] max-w-lg rounded-3xl bg-[#111B21]/98 border-2 border-indigo-500/50 p-4 shadow-2xl max-h-[68vh] flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-300" />
          <h3 className="text-sm font-extrabold text-white">Breakout Rooms</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {canModerateCall && (
        <div className="rounded-2xl bg-[#0B141A] border border-white/10 p-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-[11px] font-bold text-slate-300">
              Rooms:
              <select
                value={roomCount}
                onChange={(e) => setRoomCount(Number(e.target.value))}
                className="ml-1.5 rounded-lg bg-[#1F2C34] px-2 py-1 text-white border border-white/10"
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </label>
            <label className="text-[11px] font-bold text-slate-300">
              Timer:
              <select
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="ml-1.5 rounded-lg bg-[#1F2C34] px-2 py-1 text-white border border-white/10"
              >
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
              </select>
            </label>
            <button
              type="button"
              onClick={handleCreateBreakouts}
              className="ml-auto rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-extrabold text-white cursor-pointer"
            >
              {breakoutRooms.length > 0 ? "Recreate Rooms" : "Open Rooms"}
            </button>
          </div>

          {breakoutRooms.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="Broadcast announcement to all rooms..."
                className="flex-1 rounded-xl bg-[#1F2C34] border border-white/10 px-2.5 py-1.5 text-xs text-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (!broadcastText.trim()) return
                  onTeamsSignal("broadcast_breakouts", { text: broadcastText.trim() })
                  setBroadcastText("")
                }}
                className="rounded-xl bg-sky-600 hover:bg-sky-500 px-2.5 py-1.5 text-xs font-bold text-white cursor-pointer"
              >
                Announce
              </button>
              <button
                type="button"
                onClick={() => onTeamsSignal("close_breakouts")}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-2.5 py-1.5 text-xs font-bold text-white cursor-pointer"
              >
                Recall All
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {breakoutRooms.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            No breakout rooms are currently open.
          </p>
        ) : (
          breakoutRooms.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl bg-[#1F2C34] border border-white/10 p-3 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-white">{r.name}</p>
                <p className="text-[10.5px] text-slate-300">
                  {r.assigned_user_ids.length} assigned · Active WebRTC Sub-room
                </p>
              </div>
              <button
                type="button"
                onClick={() => onJoinBreakoutRoom(r.call_id, r.name)}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-extrabold text-white cursor-pointer shrink-0"
              >
                Join Room
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function TeamsRecapAttendanceDrawer({
  open,
  onClose,
  callId,
  recipientName,
  elapsedSec,
  teamsState,
  chatMessages,
}: {
  open: boolean
  onClose: () => void
  callId: string
  recipientName: string
  elapsedSec: number
  teamsState: CommTeamsStateClient
  chatMessages: Array<{ sender_name: string; text: string }>
}) {
  const [aiRecap, setAiRecap] = useState<string>("")
  const [loadingRecap, setLoadingRecap] = useState(false)

  const captionsText = (teamsState.captions || [])
    .map((c) => `${c.speaker_name}: ${c.text}`)
    .join("\n")

  const deterministicRecap = () => {
    const mins = Math.floor(elapsedSec / 60)
    const secs = elapsedSec % 60
    const attendees = (teamsState.attendance_log || []).map((a) => a.name).join(", ") || recipientName
    const keyTopics = (teamsState.captions || []).slice(-5).map((c) => `- ${c.speaker_name}: ${c.text}`)
    const pollNotes = (teamsState.polls || []).map((p) => `- Poll "${p.question}": ${p.options.map((o) => `${o.text} (${o.votes.length})`).join(", ")}`)
    const actionItems = (chatMessages || [])
      .filter((m) => /\b(todo|action|follow|send|check|schedule|build|review)\b/i.test(m.text))
      .slice(-5)
      .map((m) => `- [${m.sender_name}] ${m.text}`)

    return [
      `## ConnectLn Meeting Recap · ${recipientName}`,
      `Duration: ${mins}m ${secs}s · Participants: ${attendees}`,
      "",
      "### Key Discussion Points",
      ...(keyTopics.length > 0 ? keyTopics : ["- Call conducted over E2EE ConnectLn audio/video."]),
      ...(pollNotes.length > 0 ? ["", "### Poll Outcomes", ...pollNotes] : []),
      "",
      "### Follow-up Action Items",
      ...(actionItems.length > 0 ? actionItems : ["- Share any follow-up files or schedule next check-in on ConnectLn Calendar."]),
    ].join("\n")
  }

  const handleGenerateAiRecap = async () => {
    setLoadingRecap(true)
    try {
      const prompt = `Summarize this ConnectLn meeting into 1) Summary, 2) Key Decisions, and 3) Action Items cleanly in markdown.\nParticipants: ${(teamsState.attendance_log || []).map((a) => a.name).join(", ") || recipientName}\nCaptions:\n${captionsText || "(none)"}\nChat:\n${(chatMessages || []).map((c) => `${c.sender_name}: ${c.text}`).join("\n") || "(none)"}`
      const res = await fetch("/api/connectin/noctis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode: "meeting_recap" }),
      })
      const data = await res.json().catch(() => null)
      const txt = data?.reply || data?.answer || data?.text || ""
      setAiRecap(txt.trim() || deterministicRecap())
    } catch {
      setAiRecap(deterministicRecap())
    } finally {
      setLoadingRecap(false)
    }
  }

  const handleDownloadAttendanceCsv = () => {
    const rows = [
      ["Participant Name", "User ID", "Joined At", "Last Active", "Duration (min)"].join(","),
      ...(teamsState.attendance_log || []).map((a) => {
        const end = a.left_at_ms || a.last_seen_ms || Date.now()
        const mins = Math.max(1, Math.round((end - a.joined_at_ms) / 60000))
        return [
          `"${(a.name || "").replace(/"/g, '""')}"`,
          `"${a.user_id}"`,
          `"${new Date(a.joined_at_ms).toISOString()}"`,
          `"${new Date(end).toISOString()}"`,
          String(mins),
        ].join(",")
      }),
    ].join("\n")
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `connectln-attendance-${callId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!open) return null

  const summaryToShow = aiRecap || deterministicRecap()

  return (
    <div className="fixed inset-x-0 bottom-22 z-40 mx-auto w-[94vw] max-w-lg rounded-3xl bg-[#111B21]/98 border-2 border-emerald-500/50 p-4 shadow-2xl max-h-[68vh] flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-300" />
          <h3 className="text-sm font-extrabold text-white">AI Meeting Recap &amp; Attendance</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={loadingRecap}
          onClick={handleGenerateAiRecap}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-extrabold text-white cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{loadingRecap ? "Synthesizing..." : "Generate AI Summary"}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            const blob = new Blob([summaryToShow], { type: "text/markdown;charset=utf-8" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `connectln-recap-${callId}.md`
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-white cursor-pointer flex items-center gap-1"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Save Recap (.md)</span>
        </button>
        <button
          type="button"
          onClick={handleDownloadAttendanceCsv}
          className="rounded-xl bg-sky-700 hover:bg-sky-600 px-3 py-1.5 text-xs font-bold text-white cursor-pointer flex items-center gap-1"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Attendance CSV</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        <pre className="whitespace-pre-wrap text-xs text-slate-100 bg-[#0B141A] border border-white/10 rounded-2xl p-3 font-sans leading-relaxed">
          {summaryToShow}
        </pre>

        <div className="rounded-2xl bg-[#1F2C34] border border-white/10 p-3 space-y-1.5">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
            Attendance Log ({(teamsState.attendance_log || []).length})
          </p>
          {(teamsState.attendance_log || []).length === 0 ? (
            <p className="text-xs text-slate-400">Attendance records populate automatically as members join.</p>
          ) : (
            (teamsState.attendance_log || []).map((a) => {
              const durMin = Math.max(
                1,
                Math.round(((a.left_at_ms || a.last_seen_ms || Date.now()) - a.joined_at_ms) / 60000)
              )
              return (
                <div
                  key={a.user_id}
                  className="flex items-center justify-between text-xs text-white border-b border-white/5 pb-1 last:border-b-0"
                >
                  <span className="font-bold truncate">{a.name}</span>
                  <span className="text-[10.5px] font-mono text-slate-300 shrink-0">
                    Joined {new Date(a.joined_at_ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · {durMin}m
                    {a.left_at_ms ? " (Left)" : " (Active)"}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export function TeamsTransferHoldDrawer({
  open,
  onClose,
  contacts,
  onTransfer,
}: {
  open: boolean
  onClose: () => void
  contacts: Array<{ name: string; phone?: string; email?: string; prettyPhone?: string }>
  onTransfer: (target: { name: string; phone?: string; email?: string; blind: boolean }) => Promise<void> | void
}) {
  const [search, setSearch] = useState("")
  const [blindMode, setBlindMode] = useState(false)
  const [status, setStatus] = useState("")

  if (!open) return null

  const filtered = contacts.filter(
    (c) =>
      !search.trim() ||
      `${c.name} ${c.phone || ""} ${c.email || ""}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-x-0 bottom-22 z-40 mx-auto w-[94vw] max-w-md rounded-3xl bg-[#111B21]/98 border-2 border-emerald-500/50 p-4 shadow-2xl max-h-[65vh] flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <PhoneForwarded className="h-4 w-4 text-emerald-300" />
          <h3 className="text-sm font-extrabold text-white">Transfer Call</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setBlindMode(false)}
          className={`flex-1 rounded-xl py-1.5 text-xs font-extrabold cursor-pointer ${
            !blindMode ? "bg-emerald-600 text-white" : "bg-white/10 text-slate-300"
          }`}
        >
          Warm Transfer (Consult First)
        </button>
        <button
          type="button"
          onClick={() => setBlindMode(true)}
          className={`flex-1 rounded-xl py-1.5 text-xs font-extrabold cursor-pointer ${
            blindMode ? "bg-amber-600 text-white" : "bg-white/10 text-slate-300"
          }`}
        >
          Blind Transfer (Send Now)
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search teammate or type phone number..."
        className="w-full rounded-xl bg-[#1F2C34] border border-white/15 px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none"
      />

      {status && (
        <p className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-3 py-1.5">
          {status}
        </p>
      )}

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-48">
        {filtered.slice(0, 20).map((c) => (
          <div
            key={`${c.name}_${c.phone || ""}`}
            className="flex items-center justify-between gap-2 rounded-xl bg-[#1F2C34] px-3 py-2"
          >
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{c.name}</p>
              <p className="text-[10.5px] font-mono text-emerald-300 truncate">
                {c.prettyPhone || c.phone || c.email || ""}
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                setStatus(`Transferring to ${c.name}...`)
                await onTransfer({ name: c.name, phone: c.phone, email: c.email, blind: blindMode })
              }}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-[11px] font-extrabold text-white cursor-pointer shrink-0"
            >
              Transfer
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TeamsVoicemailRecorderModal({
  open,
  onClose,
  callerName,
  callerPhone,
  callerEmail,
  recipientName,
  recipientPhone,
  recipientEmail,
  onSent,
}: {
  open: boolean
  onClose: () => void
  callerName: string
  callerPhone?: string
  callerEmail?: string
  recipientName: string
  recipientPhone?: string
  recipientEmail?: string
  onSent?: () => void
}) {
  const [recording, setRecording] = useState(false)
  const [sec, setSec] = useState(0)
  const [audioDataUrl, setAudioDataUrl] = useState("")
  const [transcript, setTranscript] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const recRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const speechRef = useRef<any>(null)

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    try {
      speechRef.current?.stop?.()
    } catch {}
    if (recRef.current && recRef.current.state !== "inactive") {
      try {
        recRef.current.stop()
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setRecording(false)
  }

  useEffect(() => {
    if (!open) {
      cleanup()
      setSec(0)
      setAudioDataUrl("")
      setTranscript("")
      setError("")
    }
  }, [open])

  if (!open) return null

  const startRec = async () => {
    setError("")
    setAudioDataUrl("")
    setSec(0)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream
      const chunks: BlobPart[] = []
      const mr = new MediaRecorder(stream)
      recRef.current = mr
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data)
      }
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: mr.mimeType || "audio/webm" })
        const reader = new FileReader()
        reader.onload = () => {
          setAudioDataUrl(String(reader.result || ""))
        }
        reader.readAsDataURL(blob)
        stream.getTracks().forEach((t) => t.stop())
      }
      mr.start(250)
      setRecording(true)
      timerRef.current = setInterval(() => setSec((s) => s + 1), 1000)

      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRec) {
        try {
          const sr = new SpeechRec()
          sr.continuous = true
          sr.interimResults = false
          sr.onresult = (ev: any) => {
            const added = Array.from(ev.results)
              .slice(ev.resultIndex)
              .map((r: any) => r[0]?.transcript || "")
              .join(" ")
              .trim()
            if (added) {
              setTranscript((prev) => (prev ? `${prev} ${added}` : added))
            }
          }
          sr.start()
          speechRef.current = sr
        } catch {}
      }
    } catch {
      setError("Microphone access unavailable — type a voicemail note below instead.")
    }
  }

  const stopRec = () => {
    cleanup()
  }

  const handleSendVoicemail = async () => {
    if (!audioDataUrl && !transcript.trim()) {
      setError("Record a voice message or type a short note first.")
      return
    }
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/connectin/voicemail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "leave_voicemail",
          callerName,
          callerPhone,
          callerEmail,
          recipientName,
          recipientPhone,
          recipientEmail,
          audioDataUrl,
          durationSec: Math.max(1, sec),
          transcript: transcript.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Could not send voicemail.")
        return
      }
      onSent?.()
      onClose()
    } catch {
      setError("Network error while sending voicemail.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#111B21] border border-emerald-500/45 p-5 shadow-2xl space-y-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Voicemail className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-extrabold">Leave Voicemail for {recipientName}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 py-2">
          {!recording ? (
            <button
              type="button"
              onClick={startRec}
              className="rounded-full bg-rose-600 hover:bg-rose-500 px-5 py-2.5 text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Mic className="h-4 w-4" />
              <span>{audioDataUrl ? "Re-record Voicemail" : "Start Recording"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRec}
              className="rounded-full bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs font-extrabold text-slate-950 flex items-center gap-2 cursor-pointer animate-pulse"
            >
              <MicOff className="h-4 w-4" />
              <span>Stop Recording ({sec}s)</span>
            </button>
          )}
        </div>

        {audioDataUrl && (
          <audio controls src={audioDataUrl} className="w-full h-10" />
        )}

        <div>
          <label className="block text-[11px] font-bold text-slate-300 mb-1">
            Voicemail Transcript / Note:
          </label>
          <textarea
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Auto-transcribed while speaking, or type your message..."
            className="w-full rounded-xl bg-[#1F2C34] border border-white/15 px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {error && <p className="text-xs font-bold text-rose-400">{error}</p>}

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={handleSendVoicemail}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{sending ? "Sending..." : "Send Voicemail"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
