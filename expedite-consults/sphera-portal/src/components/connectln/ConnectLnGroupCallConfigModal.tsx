"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  Check,
  CheckCircle2,
  Copy,
  Lock,
  MicOff,
  Phone,
  Search,
  Settings2,
  Shield,
  Sparkles,
  UserPlus,
  Users,
  Video,
  Wifi,
  X,
} from "lucide-react"
import { filterAndRankMembers } from "@/lib/connectin-search-match"
import {
  looksLikeClientPhone,
  prettyClientPhone,
} from "./ConnectLnCellPhoneSoftphone"
import type {
  GroupCallInitialConfig,
  GroupCallInviteeOption,
} from "./ConnectLnWhatsAppCallModal"

export interface GroupCallMemberOption {
  id: string
  name: string
  email?: string
  phone?: string
  prettyPhone?: string
  avatar?: string
  headline?: string
}

interface ConnectLnGroupCallConfigModalProps {
  open: boolean
  onClose: () => void
  callerName: string
  members: GroupCallMemberOption[]
  onLaunchGroupCall: (payload: {
    mode: "audio" | "video"
    roomTitle: string
    invitees: GroupCallInviteeOption[]
    config: GroupCallInitialConfig
    callId: string
  }) => void
}

const GROUP_CALL_PREFS_STORAGE_KEY = "connectln_group_call_config_v1"

interface SavedGroupPrefs {
  mode: "audio" | "video"
  lobbyEnabled: boolean
  muteOnEntry: boolean
  autoNotetaker: boolean
}

const DEFAULT_PREFS: SavedGroupPrefs = {
  mode: "video",
  lobbyEnabled: false,
  muteOnEntry: false,
  autoNotetaker: true,
}

function loadSavedGroupPrefs(): SavedGroupPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS
  try {
    const raw = window.localStorage.getItem(GROUP_CALL_PREFS_STORAGE_KEY)
    if (!raw) return DEFAULT_PREFS
    const parsed = JSON.parse(raw)
    return {
      mode: parsed?.mode === "audio" ? "audio" : "video",
      lobbyEnabled: Boolean(parsed?.lobbyEnabled),
      muteOnEntry: Boolean(parsed?.muteOnEntry),
      autoNotetaker:
        typeof parsed?.autoNotetaker === "boolean" ? parsed.autoNotetaker : true,
    }
  } catch {
    return DEFAULT_PREFS
  }
}

export function ConnectLnGroupCallConfigModal({
  open,
  onClose,
  callerName,
  members,
  onLaunchGroupCall,
}: ConnectLnGroupCallConfigModalProps) {
  const [draftCallId, setDraftCallId] = useState<string>(
    () => `wa_grp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
  )
  const [roomTitle, setRoomTitle] = useState<string>("")
  const [mode, setMode] = useState<"audio" | "video">(() => loadSavedGroupPrefs().mode)
  const [lobbyEnabled, setLobbyEnabled] = useState<boolean>(
    () => loadSavedGroupPrefs().lobbyEnabled
  )
  const [muteOnEntry, setMuteOnEntry] = useState<boolean>(
    () => loadSavedGroupPrefs().muteOnEntry
  )
  const [autoNotetaker, setAutoNotetaker] = useState<boolean>(
    () => loadSavedGroupPrefs().autoNotetaker
  )

  const [memberSearch, setMemberSearch] = useState<string>("")
  const [externalPhone, setExternalPhone] = useState<string>("")
  const [selectedInvitees, setSelectedInvitees] = useState<
    Array<GroupCallInviteeOption & { key: string; prettyPhone?: string }>
  >([])
  const [copiedLink, setCopiedLink] = useState<boolean>(false)

  // Live group call transport telemetry
  const [transportLoading, setTransportLoading] = useState<boolean>(false)
  const [transportInfo, setTransportInfo] = useState<{
    modeLabel: string
    sfuConfigured: boolean
    coturnConfigured: boolean
    stunCount: number
    turnCount: number
  } | null>(null)

  useEffect(() => {
    if (!open) return
    setDraftCallId(
      `wa_grp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
    )
    setCopiedLink(false)
    setMemberSearch("")

    let cancelled = false
    setTransportLoading(true)
    Promise.allSettled([
      fetch("/api/v1/calls/sfu-token?status=1", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch("/api/v1/calls?ice=1", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null
      ),
    ])
      .then(([sfuRes, iceRes]) => {
        if (cancelled) return
        const sfuData = sfuRes.status === "fulfilled" ? sfuRes.value : null
        const iceData = iceRes.status === "fulfilled" ? iceRes.value : null
        const servers: any[] = Array.isArray(iceData?.ice_servers)
          ? iceData.ice_servers
          : []
        let stunCount = 0
        let turnCount = 0
        for (const s of servers) {
          const urls = Array.isArray(s?.urls) ? s.urls : [s?.urls]
          for (const u of urls) {
            const str = String(u || "").toLowerCase()
            if (str.startsWith("turn:") || str.startsWith("turns:")) {
              turnCount += 1
            } else if (str.startsWith("stun:")) {
              stunCount += 1
            }
          }
        }
        const sfuConfigured = Boolean(sfuData?.sfuConfigured)
        const coturnConfigured = Boolean(sfuData?.coturnConfigured)
        setTransportInfo({
          modeLabel: sfuConfigured
            ? "LiveKit SFU · HD Multi-Party"
            : coturnConfigured
              ? "Dedicated Coturn TURN"
              : "WebRTC Mesh + ICE/TURN Relay",
          sfuConfigured,
          coturnConfigured,
          stunCount,
          turnCount,
        })
      })
      .finally(() => {
        if (!cancelled) setTransportLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open])

  // Persist user's group call config preferences cleanly
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const prefs: SavedGroupPrefs = {
        mode,
        lobbyEnabled,
        muteOnEntry,
        autoNotetaker,
      }
      window.localStorage.setItem(GROUP_CALL_PREFS_STORAGE_KEY, JSON.stringify(prefs))
    } catch {}
  }, [mode, lobbyEnabled, muteOnEntry, autoNotetaker])

  const rankedMembers = useMemo(
    () =>
      filterAndRankMembers(members, memberSearch, (m) => [
        m.name,
        m.email,
        m.phone,
        m.prettyPhone,
        m.headline,
      ]),
    [members, memberSearch]
  )

  if (!open) return null

  const makeKey = (item: { name: string; email?: string; phone?: string }) =>
    `${String(item.email || "").toLowerCase().trim()}::${String(item.name || "").toLowerCase().trim()}::${String(item.phone || "").trim()}`

  const toggleMember = (m: GroupCallMemberOption) => {
    const k = makeKey(m)
    setSelectedInvitees((prev) => {
      if (prev.some((p) => p.key === k)) {
        return prev.filter((p) => p.key !== k)
      }
      return [
        ...prev,
        {
          key: k,
          name: m.name,
          phone: m.phone,
          prettyPhone: m.prettyPhone,
          email: m.email,
          avatar: m.avatar,
        },
      ]
    })
  }

  const handleAddExternalPhone = () => {
    const clean = externalPhone.trim()
    if (!clean || !looksLikeClientPhone(clean)) return
    const pretty = prettyClientPhone(clean)
    const item = {
      key: makeKey({ name: pretty, phone: clean }),
      name: pretty,
      phone: clean,
      prettyPhone: pretty,
    }
    setSelectedInvitees((prev) =>
      prev.some((p) => p.phone === clean) ? prev : [...prev, item]
    )
    setExternalPhone("")
  }

  const shareableJoinUrl = `https://conectln.com/connectin?waCall=${encodeURIComponent(
    draftCallId
  )}&mode=${mode}&callerName=${encodeURIComponent(
    callerName || "ConnectLn Host"
  )}&autoAnswer=1`

  const handleCopyGroupLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareableJoinUrl).catch(() => {})
    }
    setCopiedLink(true)
    window.setTimeout(() => setCopiedLink(false), 2200)
  }

  const handleLaunch = () => {
    onLaunchGroupCall({
      mode,
      roomTitle: roomTitle.trim(),
      invitees: selectedInvitees.map(({ name, phone, email, avatar }) => ({
        name,
        phone,
        email,
        avatar,
      })),
      config: {
        roomTitle: roomTitle.trim() || undefined,
        lobbyEnabled,
        muteOnEntry,
        autoNotetaker,
      },
      callId: draftCallId,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-3 sm:p-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Group Call and Configuration"
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-[#D0C4AE] bg-[#FBF8F3] text-[#1C1917] shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#EFE8DA] border-b border-[#E0D6C5] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="h-10 w-10 rounded-2xl bg-[#7C4225] text-[#FBF8F3] flex items-center justify-center shadow-xs shrink-0">
              <Users className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-extrabold text-[#1C1917] truncate">
                Group Call &amp; Configuration
              </h3>
              <p className="text-[11px] text-[#57534E] truncate">
                Pre-select registered members, configure room controls &amp; inspect live group transport.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Group Call Config"
            className="h-9 w-9 rounded-full bg-[#FBF8F3] hover:bg-[#E2D9C8] border border-[#D0C4AE] flex items-center justify-center text-[#5E3119] cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* 1. Live Group Transport Status Banner */}
          <div
            data-testid="group-transport-status"
            className="rounded-2xl border border-emerald-700/20 bg-emerald-950/5 px-4 py-3 flex flex-wrap items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="h-8 w-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Wifi className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold text-emerald-950">
                    {transportLoading
                      ? "Checking live group transport..."
                      : transportInfo?.modeLabel || "WebRTC Mesh + ICE/TURN Relay"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    <Lock className="h-2.5 w-2.5" />
                    E2EE Ready
                  </span>
                </div>
                <p className="text-[11px] text-[#57534E] mt-0.5">
                  {transportInfo
                    ? `${transportInfo.stunCount} STUN · ${transportInfo.turnCount} TURN relays active · ${
                        transportInfo.sfuConfigured
                          ? "SFU scaled for large rooms"
                          : "2–4 HD video streams on Mesh (unlimited voice/screenshare)"
                      }`
                    : "Connecting to signaling & NAT traversal directory..."}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Room Title & Mode Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-7 space-y-1">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#5E3119]">
                Group Room Name (Optional)
              </label>
              <input
                type="text"
                value={roomTitle}
                onChange={(e) => setRoomTitle(e.target.value)}
                placeholder="e.g. Site Ops Huddle or Engineering Sync"
                className="w-full rounded-xl border border-[#D0C4AE] bg-white px-3.5 py-2 text-xs font-medium text-[#1C1917] placeholder:text-[#78716C] focus:border-[#7C4225] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-5 space-y-1">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#5E3119]">
                Call Mode
              </label>
              <div className="grid grid-cols-2 rounded-xl bg-[#EFE8DA] p-1 border border-[#D0C4AE]">
                <button
                  type="button"
                  onClick={() => setMode("video")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold cursor-pointer transition-colors ${
                    mode === "video"
                      ? "bg-[#7C4225] text-[#FBF8F3] shadow-2xs"
                      : "text-[#5E3119] hover:bg-[#E2D9C8]"
                  }`}
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("audio")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold cursor-pointer transition-colors ${
                    mode === "audio"
                      ? "bg-[#7C4225] text-[#FBF8F3] shadow-2xs"
                      : "text-[#5E3119] hover:bg-[#E2D9C8]"
                  }`}
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Voice</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Pre-Select Participants from Registered Directory */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5E3119]">
                Select Group Participants ({selectedInvitees.length} selected)
              </span>
              {selectedInvitees.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedInvitees([])}
                  className="text-[11px] font-bold text-[#7C4225] hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {selectedInvitees.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedInvitees.map((sel) => (
                  <span
                    key={sel.key}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#7C4225] text-[#FBF8F3] px-2.5 py-1 text-[11px] font-bold"
                  >
                    <span className="truncate max-w-[150px]">{sel.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedInvitees((prev) => prev.filter((p) => p.key !== sel.key))
                      }
                      aria-label={`Remove ${sel.name}`}
                      className="hover:opacity-75 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-7 relative">
                <Search className="h-3.5 w-3.5 text-[#78716C] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search registered members by name, email, or phone..."
                  className="w-full rounded-xl border border-[#D0C4AE] bg-white pl-8 pr-3 py-2 text-xs text-[#1C1917] placeholder:text-[#78716C] focus:border-[#7C4225] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-5 flex items-center gap-1.5">
                <input
                  type="tel"
                  value={externalPhone}
                  onChange={(e) => setExternalPhone(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddExternalPhone()
                    }
                  }}
                  placeholder="+1 phone number..."
                  className="flex-1 rounded-xl border border-[#D0C4AE] bg-white px-3 py-2 text-xs text-[#1C1917] placeholder:text-[#78716C] focus:border-[#7C4225] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddExternalPhone}
                  className="rounded-xl bg-[#EFE8DA] hover:bg-[#E2D9C8] border border-[#D0C4AE] px-2.5 py-2 text-xs font-bold text-[#5E3119] cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="max-h-44 overflow-y-auto rounded-2xl border border-[#E0D6C5] bg-white divide-y divide-[#F1EAE0]">
              {rankedMembers.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#78716C]">
                  No matching registered members found. Add a phone number above or copy the group link.
                </div>
              ) : (
                rankedMembers.slice(0, 25).map((member) => {
                  const k = makeKey(member)
                  const isSelected = selectedInvitees.some((p) => p.key === k)
                  const avatarUrl =
                    member.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=7c4225`
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleMember(member)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                        isSelected ? "bg-[#EFE8DA]/80" : "hover:bg-[#FBF8F3]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={avatarUrl}
                          alt={member.name}
                          className="h-8 w-8 rounded-xl object-cover border border-[#D0C4AE] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#1C1917] truncate">
                              {member.name}
                            </span>
                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-50 border border-emerald-200 text-[9px] font-bold text-emerald-700 shrink-0">
                              Registered
                            </span>
                          </div>
                          <p className="text-[10.5px] text-[#78716C] truncate">
                            {member.prettyPhone || member.headline || member.email || "Verified ConnectLn Member"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-[#7C4225] border-[#7C4225] text-white"
                            : "border-[#C7B9A3] bg-white"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* 4. Pre-Call Group Settings */}
          <div className="rounded-2xl border border-[#E0D6C5] bg-[#EFE8DA]/60 p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#5E3119]">
              <Settings2 className="h-3.5 w-3.5" />
              <span>Pre-Call Group Settings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="flex items-start gap-2 rounded-xl border border-[#D0C4AE] bg-white p-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lobbyEnabled}
                  onChange={(e) => setLobbyEnabled(e.target.checked)}
                  className="mt-0.5 accent-[#7C4225]"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1C1917] flex items-center gap-1">
                    <Shield className="h-3 w-3 text-[#7C4225]" />
                    <span>Waiting Lobby</span>
                  </p>
                  <p className="text-[10px] text-[#78716C]">Host admits joiners</p>
                </div>
              </label>

              <label className="flex items-start gap-2 rounded-xl border border-[#D0C4AE] bg-white p-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={muteOnEntry}
                  onChange={(e) => setMuteOnEntry(e.target.checked)}
                  className="mt-0.5 accent-[#7C4225]"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1C1917] flex items-center gap-1">
                    <MicOff className="h-3 w-3 text-[#7C4225]" />
                    <span>Mute on Entry</span>
                  </p>
                  <p className="text-[10px] text-[#78716C]">Join with mic muted</p>
                </div>
              </label>

              <label className="flex items-start gap-2 rounded-xl border border-[#D0C4AE] bg-white p-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoNotetaker}
                  onChange={(e) => setAutoNotetaker(e.target.checked)}
                  className="mt-0.5 accent-[#7C4225]"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1C1917] flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-[#7C4225]" />
                    <span>Noctis Notetaker</span>
                  </p>
                  <p className="text-[10px] text-[#78716C]">Auto-transcribe &amp; recap</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#EFE8DA] border-t border-[#E0D6C5] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyGroupLink}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D0C4AE] bg-[#FBF8F3] hover:bg-[#E2D9C8] px-3.5 py-2 text-xs font-bold text-[#5E3119] cursor-pointer"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                <span>Group Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Group Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleLaunch}
            style={{ color: "#FBF8F3" }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#7C4225] hover:bg-[#5E3119] px-5 py-2.5 text-xs sm:text-sm font-extrabold shadow-md cursor-pointer transition-colors"
          >
            {mode === "video" ? (
              <Video className="h-4 w-4" />
            ) : (
              <Phone className="h-4 w-4" />
            )}
            <span>
              {selectedInvitees.length > 0
                ? `Start Group ${mode === "video" ? "Video" : "Voice"} Call (${selectedInvitees.length})`
                : `Start Open Group ${mode === "video" ? "Video" : "Voice"} Room`}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
