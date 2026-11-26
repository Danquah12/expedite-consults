"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import {
  Sparkles,
  Eye,
  ArrowUp,
  MicOff,
  FileText,
  Download,
  CheckCircle2,
  X,
  Lock,
  Zap,
  Copy,
  CloudUpload,
  Plus,
  Square,
  ListTodo,
} from "lucide-react"

export interface CallTranscriptEntry {
  id: string
  speaker: string
  text: string
  tsMs: number
}

export interface CallNotesRecap {
  summary: string
  decisions: string[]
  actionItems: string[]
}

export interface AskNoctisMessage {
  id: string
  question: string
  answer: string
  mode: "private" | "live_ai"
  createdAtIso: string
}

const DECISION_CUES = [
  "decided",
  "agreed",
  "approved",
  "confirmed",
  "finalized",
  "let's go with",
  "we'll go with",
  "launch",
  "ship",
  "settled on",
  "sign off",
  "signed off",
]

const ACTION_CUES = [
  "will ",
  "need to",
  "needs to",
  "action",
  "todo",
  "to-do",
  "follow up",
  "follow-up",
  "send ",
  "schedule",
  "review",
  "update",
  "fix ",
  "create",
  "share ",
  "prepare",
  "deliver",
  "by monday",
  "by tuesday",
  "by wednesday",
  "by thursday",
  "by friday",
  "tomorrow",
  "next week",
]

export function formatNotetakerDuration(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec))
  const mins = String(Math.floor(safe / 60)).padStart(2, "0")
  const secs = String(safe % 60).padStart(2, "0")
  return `${mins}:${secs}`
}

export function extractCallRecap(
  entries: CallTranscriptEntry[],
  roomTitle: string,
  participants: string[]
): CallNotesRecap {
  if (!entries.length) {
    const people = participants.filter(Boolean).slice(0, 6).join(", ") || "Call participants"
    return {
      summary: `Noctis Notetaker is active in "${roomTitle || "ConnectLn Call"}" with ${people}. Spoken remarks and manual notes captured during the call will appear here automatically.`,
      decisions: [],
      actionItems: [],
    }
  }

  const decisions: string[] = []
  const actionItems: string[] = []
  const seenDecisions = new Set<string>()
  const seenActions = new Set<string>()

  for (const entry of entries) {
    const raw = entry.text.trim()
    if (!raw) continue
    // Split multi-clause sentences carefully on periods or " and " when helpful for clear bullets
    const clauses = raw
      .split(/(?<=[.!?])\s+|\s+(?:and|while|also)\s+(?=[A-Z][a-z]+\s+will\b|[A-Za-z]+\s+need\b)/i)
      .map((s) => s.trim())
      .filter(Boolean)

    for (const clause of clauses) {
      const lower = clause.toLowerCase()
      const hasDecision = DECISION_CUES.some((cue) => lower.includes(cue))
      const hasAction = ACTION_CUES.some((cue) => lower.includes(cue))

      if (hasDecision) {
        const formatted = `${entry.speaker}: ${clause}`
        if (!seenDecisions.has(formatted.toLowerCase())) {
          seenDecisions.add(formatted.toLowerCase())
          decisions.push(formatted)
        }
      }
      if (hasAction) {
        const formatted = `${entry.speaker}: ${clause}`
        if (!seenActions.has(formatted.toLowerCase())) {
          seenActions.add(formatted.toLowerCase())
          actionItems.push(formatted)
        }
      }
    }
  }

  const speakers = Array.from(new Set(entries.map((e) => e.speaker).filter(Boolean)))
  const firstSnippet = entries[0]?.text || ""
  const latestSnippet = entries[entries.length - 1]?.text || ""
  const summaryParts = [
    `${roomTitle || "ConnectLn Call"} (${entries.length} captured note${entries.length === 1 ? "" : "s"}, speakers: ${speakers.join(", ") || "Local"}).`,
  ]
  if (firstSnippet) {
    summaryParts.push(`Opening focus: "${firstSnippet.slice(0, 140)}${firstSnippet.length > 140 ? "..." : ""}"`)
  }
  if (entries.length > 1 && latestSnippet && latestSnippet !== firstSnippet) {
    summaryParts.push(`Most recent point: "${latestSnippet.slice(0, 140)}${latestSnippet.length > 140 ? "..." : ""}"`)
  }
  if (decisions.length > 0 || actionItems.length > 0) {
    summaryParts.push(`Extracted ${decisions.length} decision(s) and ${actionItems.length} action item(s).`)
  }

  return {
    summary: summaryParts.join(" "),
    decisions: decisions.slice(0, 12),
    actionItems: actionItems.slice(0, 15),
  }
}

export function answerPrivateCallQuestion(
  question: string,
  entries: CallTranscriptEntry[],
  recap: CallNotesRecap,
  roomTitle: string,
  participants: string[]
): string {
  const q = question.trim().toLowerCase()
  if (!entries.length) {
    return `🔒 Private Noctis (Only you): No spoken remarks or manual notes have been captured yet in "${roomTitle || "this call"}". Speak with mic unmuted or add a note line inside Noctis Notes, and I will analyze it privately on your device.`
  }

  if (q.includes("action") || q.includes("todo") || q.includes("task") || q.includes("follow")) {
    if (q.includes("draft") && q.includes("follow")) {
      const actionBlock = recap.actionItems.length
        ? recap.actionItems.map((a) => `• ${a}`).join("\n")
        : entries
            .slice(-3)
            .map((e) => `• ${e.speaker}: ${e.text}`)
            .join("\n")
      const decisionBlock = recap.decisions.length
        ? `\nDecisions:\n${recap.decisions.map((d) => `• ${d}`).join("\n")}`
        : ""
      return `Hi team,\n\nThanks for joining ${roomTitle || "our ConnectLn call"}. Here is a quick recap:${decisionBlock}\n\nNext steps / Action items:\n${actionBlock}\n\nBest regards`
    }
    if (recap.actionItems.length > 0) {
      return `Action items captured so far (${recap.actionItems.length}):\n${recap.actionItems
        .map((a, idx) => `${idx + 1}. ${a}`)
        .join("\n")}`
    }
    return `No explicit action items detected yet across ${entries.length} captured note(s). Latest remark: "${entries[entries.length - 1].speaker}: ${entries[entries.length - 1].text}".`
  }

  if (q.includes("decision") || q.includes("agree") || q.includes("approve") || q.includes("confirm")) {
    if (recap.decisions.length > 0) {
      return `Decisions noted so far (${recap.decisions.length}):\n${recap.decisions
        .map((d, idx) => `${idx + 1}. ${d}`)
        .join("\n")}`
    }
    return `No explicit decision keywords detected yet. ${recap.summary}`
  }

  if (q.includes("catch") || q.includes("miss") || q.includes("summar") || q.includes("recap") || q.includes("what happened")) {
    const recent = entries
      .slice(-5)
      .map((e) => `• ${e.speaker}: ${e.text}`)
      .join("\n")
    return `${recap.summary}\n\nRecent transcript highlights:\n${recent}`
  }

  // Keyword match across transcript entries
  const terms = q
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !["what", "when", "where", "who", "about", "there", "this", "that", "they", "with", "from"].includes(t))

  if (terms.length > 0) {
    const scored = entries
      .map((e) => {
        const lower = `${e.speaker} ${e.text}`.toLowerCase()
        const hits = terms.reduce((acc, term) => acc + (lower.includes(term) ? 1 : 0), 0)
        return { entry: e, hits }
      })
      .filter((item) => item.hits > 0)
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 4)

    if (scored.length > 0) {
      return `Matching moments from "${roomTitle || "Call"}":\n${scored
        .map((s) => `• ${s.entry.speaker}: ${s.entry.text}`)
        .join("\n")}`
    }
  }

  const activeParticipants = participants.filter(Boolean).join(", ") || "call participants"
  const tail = entries
    .slice(-3)
    .map((e) => `• ${e.speaker}: ${e.text}`)
    .join("\n")
  return `Active call with ${activeParticipants}.\n\n${recap.summary}\n\nLatest transcript lines:\n${tail}`
}

function parseExternalLine(raw: string, fallbackSpeaker: string): { speaker: string; text: string } {
  const cleaned = raw.replace(/^🎙️\s*/, "").trim()
  const match = cleaned.match(/^([^:]{1,60}):\s*["“]?([\s\S]+?)["”]?$/)
  if (match) {
    return {
      speaker: match[1].trim() || fallbackSpeaker,
      text: match[2].trim(),
    }
  }
  return {
    speaker: fallbackSpeaker,
    text: cleaned,
  }
}

export interface UseNoctisCallNotetakerOptions {
  callId: string
  roomTitle: string
  userKey: string
  userName: string
  participants: string[]
  isCallActive: boolean
  externalTranscriptLine?: string
  externalCaptionItems?: Array<{ id: string; speaker_name?: string; text: string; created_at?: string }>
  skipOwnSpeechRecognition?: boolean
  threadIdForWorkspaceSync?: string
}

export function useNoctisCallNotetaker({
  callId,
  roomTitle,
  userKey,
  userName,
  participants,
  isCallActive,
  externalTranscriptLine,
  externalCaptionItems,
  skipOwnSpeechRecognition = false,
  threadIdForWorkspaceSync,
}: UseNoctisCallNotetakerOptions) {
  const [notetakerActive, setNotetakerActive] = useState<boolean>(false)
  const [elapsedSec, setElapsedSec] = useState<number>(0)
  const [transcriptEntries, setTranscriptEntries] = useState<CallTranscriptEntry[]>([])
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(false)
  const [isSavingCloud, setIsSavingCloud] = useState<boolean>(false)
  const [cloudSavedAt, setCloudSavedAt] = useState<string | null>(null)
  const [workspaceSyncedAt, setWorkspaceSyncedAt] = useState<string | null>(null)
  const [speechListening, setSpeechListening] = useState<boolean>(false)
  const [speechSupported, setSpeechSupported] = useState<boolean>(true)
  const [statusNotice, setStatusNotice] = useState<string | null>(null)

  const startedAtIsoRef = useRef<string>(new Date().toISOString())
  const seenExternalIdsRef = useRef<Set<string>>(new Set())
  const lastExternalLineRef = useRef<string>("")
  const recognitionRef = useRef<any>(null)

  // Reset per-call state cleanly if callId changes
  useEffect(() => {
    startedAtIsoRef.current = new Date().toISOString()
    seenExternalIdsRef.current = new Set()
    lastExternalLineRef.current = ""
    setTranscriptEntries([])
    setElapsedSec(0)
    setCloudSavedAt(null)
    setWorkspaceSyncedAt(null)
  }, [callId])

  // Elapsed timer when Notetaker is active during an active call
  useEffect(() => {
    if (!notetakerActive || !isCallActive) return
    const timer = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [notetakerActive, isCallActive])

  const appendEntry = useCallback((speaker: string, text: string, customId?: string) => {
    const cleanText = text.trim()
    if (!cleanText) return
    setTranscriptEntries((prev) => {
      if (customId && prev.some((item) => item.id === customId)) return prev
      const last = prev[prev.length - 1]
      if (last && last.speaker === speaker && last.text === cleanText) return prev
      return [
        ...prev.slice(-249),
        {
          id: customId || `nt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          speaker: speaker.trim() || "Participant",
          text: cleanText,
          tsMs: Date.now(),
        },
      ]
    })
  }, [])

  // Ingest external single-line transcript (VibeVideoCallStudio liveSpokenTranscript)
  useEffect(() => {
    if (!externalTranscriptLine || !isCallActive) return
    const normalized = externalTranscriptLine.trim()
    if (!normalized || normalized === lastExternalLineRef.current) return
    lastExternalLineRef.current = normalized
    if (!notetakerActive) return
    const parsed = parseExternalLine(normalized, userName || "You")
    appendEntry(parsed.speaker, parsed.text)
  }, [externalTranscriptLine, isCallActive, notetakerActive, userName, appendEntry])

  // Ingest external structured caption items (ConnectLnWhatsAppCallModal teamsState.captions)
  useEffect(() => {
    if (!Array.isArray(externalCaptionItems) || !externalCaptionItems.length || !notetakerActive) return
    for (const item of externalCaptionItems) {
      if (!item?.id || !item?.text || seenExternalIdsRef.current.has(item.id)) continue
      seenExternalIdsRef.current.add(item.id)
      appendEntry(item.speaker_name || "Participant", item.text, `ext_${item.id}`)
    }
  }, [externalCaptionItems, notetakerActive, appendEntry])

  // Passive local speech-to-text when parent isn't already holding a SpeechRecognition instance
  useEffect(() => {
    if (typeof window === "undefined") return
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSpeechSupported(Boolean(SpeechRec))

    if (!notetakerActive || !isCallActive || skipOwnSpeechRecognition || !SpeechRec) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {}
        recognitionRef.current = null
      }
      setSpeechListening(false)
      return
    }

    let cancelled = false
    try {
      const rec = new SpeechRec()
      rec.continuous = true
      rec.interimResults = false
      rec.lang = "en-US"
      rec.onstart = () => {
        if (!cancelled) setSpeechListening(true)
      }
      rec.onresult = (event: any) => {
        if (cancelled || !event?.results) return
        for (let i = event.resultIndex || 0; i < event.results.length; i += 1) {
          const result = event.results[i]
          if (result?.isFinal && result[0]?.transcript) {
            appendEntry(userName || "You", String(result[0].transcript))
          }
        }
      }
      rec.onerror = () => {
        if (!cancelled) setSpeechListening(false)
      }
      rec.onend = () => {
        if (!cancelled) setSpeechListening(false)
      }
      rec.start()
      recognitionRef.current = rec
    } catch {
      setSpeechListening(false)
    }

    return () => {
      cancelled = true
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {}
        recognitionRef.current = null
      }
      setSpeechListening(false)
    }
  }, [notetakerActive, isCallActive, skipOwnSpeechRecognition, userName, appendEntry])

  const recap = useMemo(
    () => extractCallRecap(transcriptEntries, roomTitle, participants),
    [transcriptEntries, roomTitle, participants]
  )

  const toggleNotetaker = useCallback(() => {
    setNotetakerActive((prev) => {
      const next = !prev
      if (next) {
        startedAtIsoRef.current = startedAtIsoRef.current || new Date().toISOString()
        setStatusNotice("Noctis Notetaker joined tile & is capturing meeting notes.")
      } else {
        setStatusNotice("Noctis Notetaker paused.")
      }
      return next
    })
  }, [])

  const addManualNoteLine = useCallback(
    (text: string, speaker?: string) => {
      const clean = text.trim()
      if (!clean) return
      if (!notetakerActive) {
        setNotetakerActive(true)
      }
      appendEntry(speaker || userName || "You", clean)
    },
    [appendEntry, notetakerActive, userName]
  )

  const saveRecapToCloud = useCallback(async () => {
    if (!callId) return false
    setIsSavingCloud(true)
    try {
      const res = await fetch("/api/connectin/call-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userKey: userKey || userName || "default",
          callId,
          roomTitle: roomTitle || "ConnectLn Call",
          participants,
          startedAtIso: startedAtIsoRef.current,
          durationSec: elapsedSec,
          summary: recap.summary,
          decisions: recap.decisions,
          actionItems: recap.actionItems,
          transcript: transcriptEntries,
          savedBy: userName || userKey || "ConnectLn Member",
        }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok && data?.ok) {
        const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        setCloudSavedAt(ts)
        setStatusNotice(`Saved meeting notes to cloud (${ts})`)
        return true
      }
      return false
    } catch {
      return false
    } finally {
      setIsSavingCloud(false)
    }
  }, [callId, userKey, userName, roomTitle, participants, elapsedSec, recap, transcriptEntries])

  const syncRecapToWorkspaceNotes = useCallback(async () => {
    const targetThreadId = threadIdForWorkspaceSync || `call_${callId || "session"}`
    const contentLines = [
      recap.summary,
      recap.decisions.length ? `\nDecisions:\n${recap.decisions.map((d) => `- ${d}`).join("\n")}` : "",
      recap.actionItems.length ? `\nAction Items:\n${recap.actionItems.map((a) => `- ${a}`).join("\n")}` : "",
      transcriptEntries.length
        ? `\nTranscript Highlights:\n${transcriptEntries
            .slice(-20)
            .map((e) => `- [${new Date(e.tsMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}] ${e.speaker}: ${e.text}`)
            .join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n")

    try {
      const res = await fetch("/api/connectin/teams-workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_note",
          threadId: targetThreadId,
          userName: userName || "ConnectLn Member",
          note: {
            id: `call_note_${callId || Date.now()}`,
            title: `Noctis Notes · ${roomTitle || "ConnectLn Call"}`,
            content: contentLines,
            updatedBy: `${userName || "Member"} (Noctis Notetaker)`,
          },
        }),
      })
      if (recap.actionItems.length > 0) {
        await Promise.all(
          recap.actionItems.slice(0, 4).map((item, idx) =>
            fetch("/api/connectin/teams-workspace", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "upsert_task",
                threadId: targetThreadId,
                userName: userName || "ConnectLn Member",
                task: {
                  id: `call_task_${callId || "s"}_${idx}`,
                  title: item.slice(0, 170),
                  status: "todo",
                  assignee: participants[0] || userName || "Team",
                  priority: "medium",
                  createdBy: "Noctis Notetaker",
                },
              }),
            }).catch(() => null)
          )
        )
      }
      if (res.ok) {
        const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        setWorkspaceSyncedAt(ts)
        setStatusNotice(`Synced recap to Mail & Chat Notes (${ts})`)
        return true
      }
      return false
    } catch {
      return false
    }
  }, [threadIdForWorkspaceSync, callId, roomTitle, recap, transcriptEntries, userName, participants])

  const buildMarkdownText = useCallback(() => {
    const lines = [
      `# Noctis Meeting Notes — ${roomTitle || "ConnectLn Call"}`,
      `- **Room ID:** ${callId}`,
      `- **Participants:** ${participants.join(", ") || userName}`,
      `- **Duration:** ${formatNotetakerDuration(elapsedSec)}`,
      "",
      "## Executive Summary",
      recap.summary,
      "",
      "## Decisions",
      ...(recap.decisions.length ? recap.decisions.map((d) => `- ${d}`) : ["- None recorded"]),
      "",
      "## Action Items",
      ...(recap.actionItems.length ? recap.actionItems.map((a) => `- [ ] ${a}`) : ["- None recorded"]),
      "",
      "## Transcript",
      ...(transcriptEntries.length
        ? transcriptEntries.map(
            (e) =>
              `- **${e.speaker}** (${new Date(e.tsMs).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}): ${e.text}`
          )
        : ["- No spoken remarks recorded yet."]),
    ]
    return lines.join("\n")
  }, [roomTitle, callId, participants, userName, elapsedSec, recap, transcriptEntries])

  const downloadTranscriptMarkdown = useCallback(() => {
    if (typeof window === "undefined") return
    const md = buildMarkdownText()
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `noctis-notes-${(callId || "call").slice(0, 14)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [buildMarkdownText, callId])

  const askNoctis = useCallback(
    async (question: string, useLiveAi: boolean): Promise<string> => {
      const cleanQ = question.trim()
      if (!cleanQ) return ""
      const localAnswer = answerPrivateCallQuestion(
        cleanQ,
        transcriptEntries,
        recap,
        roomTitle,
        participants
      )
      if (!useLiveAi) {
        return localAnswer
      }

      try {
        const compactContext = transcriptEntries
          .slice(-24)
          .map((e) => `${e.speaker}: ${e.text}`)
          .join("\n")
        const res = await fetch("/api/connectin/noctis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `You are Noctis AI inside an active ConnectLn video call ("${roomTitle}"). Answer concisely for ONLY the asking user based on this live call transcript:\n\n${compactContext || "(No transcript lines yet)"}\n\nSummary: ${recap.summary}\n\nUser question: ${cleanQ}`,
            history: [],
          }),
        })
        const data = await res.json().catch(() => null)
        const reply = String(data?.reply || data?.answer || data?.message || "").trim()
        return reply || localAnswer
      } catch {
        return localAnswer
      }
    },
    [transcriptEntries, recap, roomTitle, participants]
  )

  return {
    notetakerActive,
    setNotetakerActive,
    toggleNotetaker,
    elapsedSec,
    transcriptEntries,
    recap,
    speechSupported,
    speechListening,
    showNotesDrawer,
    setShowNotesDrawer,
    isSavingCloud,
    cloudSavedAt,
    workspaceSyncedAt,
    statusNotice,
    addManualNoteLine,
    saveRecapToCloud,
    syncRecapToWorkspaceNotes,
    buildMarkdownText,
    downloadTranscriptMarkdown,
    askNoctis,
  }
}

export function NoctisNotetakerTile({
  elapsedSec,
  entryCount,
  speechListening,
  onOpenNotes,
  onStop,
  minHeight = "280px",
  className = "",
}: {
  elapsedSec: number
  entryCount: number
  speechListening?: boolean
  onOpenNotes: () => void
  onStop: () => void
  minHeight?: string
  className?: string
}) {
  return (
    <div
      data-testid="noctis-notetaker-tile"
      onClick={onOpenNotes}
      style={{ backgroundColor: "#28292C", minHeight }}
      className={`rounded-2xl border border-white/15 hover:border-emerald-400/50 overflow-hidden relative flex flex-col justify-between transition-all cursor-pointer group ${className}`}
    >
      {/* Top Bar: Quiet Live Status + Muted Mic Pill */}
      <div className="p-2.5 flex items-center justify-between gap-2 relative z-20">
        <span className="px-2 py-0.5 rounded-full bg-black/45 border border-white/10 text-[10px] font-mono text-emerald-300 flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${
              speechListening ? "animate-ping" : "animate-pulse"
            }`}
          />
          <span>REC {formatNotetakerDuration(elapsedSec)}</span>
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onStop()
            }}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 px-2 py-0.5 rounded-full bg-black/60 hover:bg-rose-600/80 text-[10px] font-bold text-zinc-200 border border-white/10 transition-opacity cursor-pointer"
            title="Remove Noctis Notetaker from call"
          >
            Stop
          </button>
          <span
            className="h-7 w-7 rounded-full bg-black/45 border border-white/10 flex items-center justify-center text-zinc-300"
            title="Passive listener (muted)"
          >
            <MicOff className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {/* Center Minimalist Status Message (Clean Meet/Notetaker Look) */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-4 text-center space-y-2.5">
        <p className="text-lg sm:text-xl font-medium text-zinc-100 tracking-tight leading-snug select-none">
          Recording and taking notes
        </p>
        <p className="text-[11px] text-zinc-400 font-medium">
          {entryCount > 0
            ? `${entryCount} captured note${entryCount === 1 ? "" : "s"} · Click to view summary`
            : "Listening live · Private & E2EE on ConnectLn"}
        </p>
      </div>

      {/* Bottom Branding Strip + Participant Label */}
      <div className="relative z-20 bg-gradient-to-t from-black/80 via-black/45 to-transparent pt-3 pb-2.5 px-3 space-y-2">
        <div className="flex items-center justify-between gap-2 rounded-xl bg-black/45 border border-white/10 px-2.5 py-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] font-black tracking-wider text-white">NOCTIS</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[9px] font-extrabold uppercase">
              AI
            </span>
            <span className="text-[10.5px] text-zinc-300 truncate">
              Native AI Notetaker
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-300 shrink-0">
            Open Notes ↗
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-white truncate">
            Noctis Notetaker
          </span>
          <span className="text-[10px] text-zinc-400">Only saved by host/you</span>
        </div>
      </div>
    </div>
  )
}

export function NoctisLiveNotesDrawer({
  open,
  onClose,
  roomTitle,
  elapsedSec,
  recap,
  transcriptEntries,
  isSavingCloud,
  cloudSavedAt,
  workspaceSyncedAt,
  onAddNoteLine,
  onSaveCloud,
  onSyncWorkspace,
  onDownloadMarkdown,
  buildMarkdownText,
}: {
  open: boolean
  onClose: () => void
  roomTitle: string
  elapsedSec: number
  recap: CallNotesRecap
  transcriptEntries: CallTranscriptEntry[]
  isSavingCloud: boolean
  cloudSavedAt: string | null
  workspaceSyncedAt: string | null
  onAddNoteLine: (text: string) => void
  onSaveCloud: () => void
  onSyncWorkspace: () => void
  onDownloadMarkdown: () => void
  buildMarkdownText: () => string
}) {
  const [draftLine, setDraftLine] = useState("")
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const handleAddLine = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draftLine.trim()) return
    onAddNoteLine(draftLine.trim())
    setDraftLine("")
  }

  return (
    <div
      data-testid="noctis-notes-drawer"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[86vh] rounded-2xl bg-[#18191C] border border-white/15 shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3 bg-[#1F2024]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">
                Noctis Meeting Notes · {roomTitle || "ConnectLn Call"}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Duration {formatNotetakerDuration(elapsedSec)} · {transcriptEntries.length} captured lines
                {cloudSavedAt ? ` · Cloud saved ${cloudSavedAt}` : ""}
                {workspaceSyncedAt ? ` · Synced to Mail & Chat ${workspaceSyncedAt}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Executive Summary */}
          <div className="rounded-xl bg-[#222429] border border-white/10 p-3.5 space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              Executive Summary
            </p>
            <p className="text-xs leading-relaxed text-zinc-200">{recap.summary}</p>
          </div>

          {/* Decisions & Action Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#222429] border border-white/10 p-3 space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Decisions ({recap.decisions.length})</span>
              </p>
              {recap.decisions.length > 0 ? (
                <ul className="space-y-1 text-xs text-zinc-200 list-disc pl-4">
                  {recap.decisions.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-zinc-500">No decisions flagged yet.</p>
              )}
            </div>

            <div className="rounded-xl bg-[#222429] border border-white/10 p-3 space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <ListTodo className="h-3.5 w-3.5" />
                <span>Action Items ({recap.actionItems.length})</span>
              </p>
              {recap.actionItems.length > 0 ? (
                <ul className="space-y-1 text-xs text-zinc-200 list-disc pl-4">
                  {recap.actionItems.map((a, idx) => (
                    <li key={idx}>{a}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-zinc-500">No action items flagged yet.</p>
              )}
            </div>
          </div>

          {/* Add Timestamped Note Line */}
          <form onSubmit={handleAddLine} className="flex items-center gap-2">
            <input
              type="text"
              data-testid="noctis-manual-note-input"
              value={draftLine}
              onChange={(e) => setDraftLine(e.target.value)}
              placeholder='Add note or decision (e.g. "Agreed to launch Friday; Kwesi will audit security")'
              className="flex-1 rounded-xl bg-[#121316] border border-white/15 px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              data-testid="noctis-manual-note-add"
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-2 text-xs font-extrabold flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Note</span>
            </button>
          </form>

          {/* Live Transcript List */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Live Transcript
            </p>
            {transcriptEntries.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">
                Waiting for speech or manual notes...
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {transcriptEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg bg-[#141518] border border-white/5 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] text-zinc-400 mb-0.5">
                      <span className="font-bold text-emerald-300">{entry.speaker}</span>
                      <span>
                        {new Date(entry.tsMs).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-zinc-200 leading-relaxed">{entry.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 border-t border-white/10 bg-[#1F2024] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="noctis-save-cloud-btn"
              disabled={isSavingCloud}
              onClick={onSaveCloud}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 px-3 py-1.5 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <CloudUpload className="h-3.5 w-3.5" />
              <span>{isSavingCloud ? "Saving..." : cloudSavedAt ? "Saved ✓" : "Save to Cloud"}</span>
            </button>
            <button
              type="button"
              onClick={onSyncWorkspace}
              className="rounded-xl bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-emerald-300" />
              <span>{workspaceSyncedAt ? "Synced to Notes ✓" : "Save to Mail & Chat Notes"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(buildMarkdownText()).catch(() => {})
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 px-2.5 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              type="button"
              onClick={onDownloadMarkdown}
              className="rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 px-2.5 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>.md</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AskNoctisInCallBar({
  onAsk,
  hasTranscriptEntries,
  className = "",
}: {
  onAsk: (question: string, useLiveAi: boolean) => Promise<string>
  hasTranscriptEntries: boolean
  className?: string
}) {
  const [question, setQuestion] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [useLiveAi, setUseLiveAi] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<AskNoctisMessage[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const submitQuestion = async (rawQ: string) => {
    const q = rawQ.trim()
    if (!q || isLoading) return
    setIsOpen(true)
    setIsLoading(true)
    const activeMode: "private" | "live_ai" = useLiveAi ? "live_ai" : "private"
    try {
      const answer = await onAsk(q, useLiveAi)
      setMessages((prev) => [
        ...prev.slice(-11),
        {
          id: `an_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          question: q,
          answer,
          mode: activeMode,
          createdAtIso: new Date().toISOString(),
        },
      ])
      setQuestion("")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`relative inline-flex flex-col items-start ${className}`}>
      {/* Expandable Private Answer Popover (Anchored cleanly ABOVE the pill) */}
      {isOpen && (
        <div
          data-testid="ask-noctis-incall-popover"
          className="absolute bottom-full left-0 mb-2 w-[310px] sm:w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl bg-[#1D1F24]/98 border border-white/15 shadow-2xl overflow-hidden z-50 text-zinc-100"
        >
          <div className="px-3 py-2 border-b border-white/10 bg-[#252830] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-white truncate">Ask Noctis</span>
              <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] text-zinc-300 flex items-center gap-1 shrink-0">
                <Eye className="h-2.5 w-2.5" />
                <span>Only you</span>
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setUseLiveAi((prev) => !prev)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer border ${
                  useLiveAi
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/40"
                    : "bg-white/10 text-zinc-300 border-white/10"
                }`}
                title={
                  useLiveAi
                    ? "Live AI mode (sends prompt + recent transcript to /api/connectin/noctis)"
                    : "Private Mode (100% local on-device analysis)"
                }
              >
                {useLiveAi ? <Zap className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
                <span>{useLiveAi ? "Live AI" : "Private"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 rounded-full hover:bg-white/15 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                title="Minimize"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 pt-2 pb-1.5 flex flex-wrap gap-1 border-b border-white/5">
            {["Catch me up", "Action items", "Decisions", "Draft follow-up"].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => void submitQuestion(chip)}
                className="px-2 py-0.5 rounded-full bg-white/10 hover:bg-emerald-500/25 hover:text-emerald-200 text-[10.5px] font-medium text-zinc-200 cursor-pointer transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Q&A History */}
          <div className="max-h-[220px] overflow-y-auto p-3 space-y-2.5">
            {messages.length === 0 ? (
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {hasTranscriptEntries
                  ? "Ask anything about what has been said so far. Answers stay visible only to you."
                  : "Ask a question or pick a quick prompt above. Turn on Noctis Notetaker or capture live captions to query spoken remarks."}
              </p>
            ) : (
              messages.map((item) => (
                <div key={item.id} className="space-y-1">
                  <p className="text-[11px] font-semibold text-emerald-300">
                    You: {item.question}
                  </p>
                  <div className="rounded-xl bg-black/40 border border-white/10 p-2.5 text-xs text-zinc-100 whitespace-pre-wrap leading-relaxed relative group">
                    {item.answer}
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(item.answer).catch(() => {})
                        setCopiedId(item.id)
                        setTimeout(() => setCopiedId(null), 1500)
                      }}
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <Copy className="h-2.5 w-2.5" />
                      <span>{copiedId === item.id ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <p className="text-[11px] text-emerald-300 animate-pulse">Noctis is thinking...</p>
            )}
          </div>
        </div>
      )}

      {/* Sleek Bottom-Left Floating Pill: "✨ Ask Noctis  👁 Only you  [↑]" */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void submitQuestion(question)
        }}
        className="flex items-center gap-2 rounded-full bg-[#1E1F23]/95 border border-white/15 px-3 py-1.5 shadow-xl max-w-[calc(100vw-2rem)]"
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-emerald-400 hover:text-emerald-300 flex items-center cursor-pointer shrink-0"
          title="Open private Ask Noctis assistant"
        >
          <Sparkles className="h-4 w-4" />
        </button>

        <input
          type="text"
          data-testid="ask-noctis-incall-input"
          value={question}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask Noctis"
          className="w-28 sm:w-36 bg-transparent text-xs text-white placeholder:text-zinc-400 focus:outline-none"
        />

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-zinc-300 flex items-center gap-1 shrink-0 cursor-pointer hover:bg-white/15"
          title="Private to you — never visible to other call participants"
        >
          <Eye className="h-3 w-3 text-zinc-400" />
          <span className="whitespace-nowrap">Only you</span>
        </button>

        <button
          type="submit"
          data-testid="ask-noctis-incall-submit"
          disabled={isLoading || !question.trim()}
          className="h-6 w-6 rounded-full bg-white/15 hover:bg-emerald-500 hover:text-slate-950 disabled:opacity-40 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
          title="Send private question to Noctis"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  )
}
