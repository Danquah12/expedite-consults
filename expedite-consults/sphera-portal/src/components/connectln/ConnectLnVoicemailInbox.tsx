"use client"

import React, { useCallback, useEffect, useState } from "react"
import { CheckCircle2, PhoneCall, Trash2, Voicemail } from "lucide-react"
import type { ConnectLnVoicemailItem } from "@/app/api/connectin/voicemail/route"
import { prettyClientPhone } from "./ConnectLnCellPhoneSoftphone"

export function ConnectLnVoicemailInbox({
  viewerName,
  viewerEmail,
  viewerPhone,
  onCallBack,
  onUnreadCountChange,
}: {
  viewerName?: string
  viewerEmail?: string
  viewerPhone?: string
  onCallBack: (targetNameOrPhone: string) => void
  onUnreadCountChange?: (count: number) => void
}) {
  const [items, setItems] = useState<ConnectLnVoicemailItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVoicemails = useCallback(async () => {
    if (!viewerName && !viewerEmail && !viewerPhone) {
      setLoading(false)
      return
    }
    try {
      const qs = new URLSearchParams()
      if (viewerName) qs.set("viewerName", viewerName)
      if (viewerEmail) qs.set("viewerEmail", viewerEmail)
      if (viewerPhone) qs.set("viewerPhone", viewerPhone)
      const res = await fetch(`/api/connectin/voicemail?${qs.toString()}`, { cache: "no-store" })
      const data = await res.json()
      if (data?.ok && Array.isArray(data.voicemails)) {
        setItems(data.voicemails)
        onUnreadCountChange?.(Number(data.unreadCount) || 0)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [viewerName, viewerEmail, viewerPhone, onUnreadCountChange])

  useEffect(() => {
    void fetchVoicemails()
    const timer = setInterval(() => void fetchVoicemails(), 18000)
    return () => clearInterval(timer)
  }, [fetchVoicemails])

  const markRead = async (id: string) => {
    setItems((prev) => prev.map((v) => (v.id === id ? { ...v, read: true } : v)))
    await fetch("/api/connectin/voicemail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_read", id, read: true }),
    }).catch(() => {})
    void fetchVoicemails()
  }

  const removeItem = async (id: string) => {
    setItems((prev) => prev.filter((v) => v.id !== id))
    await fetch("/api/connectin/voicemail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    }).catch(() => {})
    void fetchVoicemails()
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-xs font-semibold text-[#78716C]">
        Loading voicemails...
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="p-6 text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-[#EFE8DA] text-[#7C4225] flex items-center justify-center mx-auto">
          <Voicemail className="h-5 w-5" />
        </div>
        <p className="text-xs font-bold text-[#1C1917]">No Voicemails Yet</p>
        <p className="text-[11px] text-[#78716C]">
          When callers leave a voice message while a call goes unanswered, audio &amp; transcripts appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2 p-2">
      {items.map((vm) => (
        <div
          key={vm.id}
          className={`rounded-2xl border p-3 space-y-2 transition-colors ${
            vm.read
              ? "bg-[#FBF8F3] border-[#E0D6C5]"
              : "bg-amber-50/90 border-amber-300 shadow-2xs"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-[#1C1917] flex items-center gap-1.5 truncate">
                {!vm.read && <span className="h-2 w-2 rounded-full bg-[#7C4225] shrink-0" />}
                <span>{vm.callerName}</span>
              </p>
              <p className="text-[10.5px] text-[#78716C]">
                {vm.callerPhone ? `${prettyClientPhone(vm.callerPhone)} · ` : ""}
                {vm.durationSec}s ·{" "}
                {new Date(vm.createdAtIso).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onCallBack(vm.callerPhone || vm.callerName)}
                className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] px-2 py-1 text-[10.5px] font-bold text-white flex items-center gap-1 cursor-pointer"
                title="Call back"
              >
                <PhoneCall className="h-3 w-3" />
                <span>Call Back</span>
              </button>
              {!vm.read && (
                <button
                  type="button"
                  onClick={() => void markRead(vm.id)}
                  className="rounded-lg bg-[#EFE8DA] hover:bg-[#E2D9C8] p-1 text-[#5E3119] cursor-pointer"
                  title="Mark as read"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => void removeItem(vm.id)}
                className="rounded-lg bg-rose-50 hover:bg-rose-100 p-1 text-rose-700 cursor-pointer"
                title="Delete voicemail"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {vm.audioDataUrl && (
            <audio
              controls
              src={vm.audioDataUrl}
              onPlay={() => {
                if (!vm.read) void markRead(vm.id)
              }}
              className="w-full h-8"
            />
          )}

          {vm.transcript && (
            <p className="text-[11.5px] text-[#3D3730] bg-white/80 rounded-xl px-2.5 py-1.5 border border-[#E0D6C5]/70">
              &ldquo;{vm.transcript}&rdquo;
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
