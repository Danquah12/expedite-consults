"use client"

import React, { useState, useEffect } from "react"
import {
  ChevronUp,
  ChevronDown,
  X,
  Send,
  Edit3,
  Search,
  CheckCheck,
  Maximize2
} from "lucide-react"
import { UserProfile } from "@/lib/linkedin-data"
import { getEnclaveB2BThreads, B2BConversationThread, B2BMessageItem } from "@/lib/b2b-messaging-data"
import { resolveUserProfilePicture } from "@/lib/connectin-storage"

interface FloatingMessagingDockProps {
  currentUser: UserProfile
  onOpenFullMessaging?: () => void
}

export function FloatingMessagingDock({
  currentUser,
  onOpenFullMessaging,
}: FloatingMessagingDockProps) {
  const enclaveId = currentUser?.professionEnclave || "trades_construction"
  const [isDockOpen, setIsDockOpen] = useState(false)
  const [threads, setThreads] = useState<B2BConversationThread[]>(() =>
    getEnclaveB2BThreads(enclaveId)
  )
  const [activeChatThread, setActiveChatThread] = useState<B2BConversationThread | null>(null)
  const [miniMessageInput, setMiniMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const encThreads = getEnclaveB2BThreads(enclaveId)
    setThreads(encThreads)
    setActiveChatThread(null)

    fetch(`/api/connectin/messages?enclave=${encodeURIComponent(enclaveId)}`, {
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.threads && Array.isArray(data.threads) && data.threads.length > 0) {
          setThreads(data.threads)
        }
      })
      .catch(() => {})
  }, [enclaveId])

  const totalUnread = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0)

  const handleSendMiniMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = miniMessageInput.trim()
    if (!trimmed || !activeChatThread) return

    const newMsg: B2BMessageItem = {
      id: "mini_msg_" + Date.now(),
      sender: {
        id: "me",
        name: currentUser?.name || "You",
        avatar: currentUser?.avatar || "",
        role: currentUser?.headline || "Verified ConnectIn Member",
      },
      text: trimmed,
      timestamp: "Just now",
    }

    const targetId = activeChatThread.id

    const updated = threads.map((t) =>
      t.id === targetId
        ? {
            ...t,
            unreadCount: 0,
            lastMessage: trimmed,
            lastMessageTime: "Just now",
            messages: [...t.messages, newMsg],
          }
        : t
    )

    setThreads(updated)
    setActiveChatThread((prev) =>
      prev
        ? {
            ...prev,
            lastMessage: trimmed,
            lastMessageTime: "Just now",
            messages: [...prev.messages, newMsg],
          }
        : null
    )
    setMiniMessageInput("")

    try {
      const res = await fetch("/api/connectin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          enclave: enclaveId,
          threadId: targetId,
          text: trimmed,
          senderName: currentUser?.name || "You",
          senderAvatar: currentUser?.avatar,
          senderRole: currentUser?.headline,
        }),
      })
      const data = await res.json()
      if (data?.ok && data.autoReply) {
        setTimeout(() => {
          setThreads((prev) =>
            prev.map((t) =>
              t.id === targetId
                ? {
                    ...t,
                    lastMessage: data.autoReply.text,
                    lastMessageTime: "Just now",
                    messages: [...t.messages, data.autoReply],
                  }
                : t
            )
          )
          setActiveChatThread((prev) =>
            prev && prev.id === targetId
              ? {
                  ...prev,
                  lastMessage: data.autoReply.text,
                  lastMessageTime: "Just now",
                  messages: [...prev.messages, data.autoReply],
                }
              : prev
          )
        }, 800)
      }
    } catch {
      // Ignore network errors in mini dock
    }
  }

  const filteredThreads = threads.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="hidden lg:flex fixed bottom-0 right-4 z-50 items-end gap-3 pointer-events-none">
      {/* 1. Mini Floating Chat Pop-up Window */}
      {activeChatThread && (
        <div className="pointer-events-auto flex flex-col w-80 h-96 rounded-t-xl border border-zinc-300 bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={activeChatThread.avatar}
                  alt={activeChatThread.title}
                  className="h-7 w-7 rounded-full object-cover"
                />
                {activeChatThread.onlineStatus === "online" && (
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-zinc-900 truncate">
                  {activeChatThread.title}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">
                  {activeChatThread.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-zinc-400">
              {onOpenFullMessaging && (
                <button
                  onClick={() => {
                    setActiveChatThread(null)
                    setIsDockOpen(false)
                    onOpenFullMessaging()
                  }}
                  className="rounded-sm p-1 hover:bg-zinc-100 hover:text-zinc-700"
                  title="Open Full Messaging View"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setActiveChatThread(null)}
                className="rounded-sm p-1 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-zinc-50/70 text-xs">
            {activeChatThread.messages.map((msg) => {
              const isMe = msg.sender.id === "me" || msg.sender.name === "You"
              const myPic = resolveUserProfilePicture(currentUser, msg.sender.avatar)
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] overflow-hidden rounded-xl leading-relaxed ${
                      isMe
                        ? "rounded-br-xs font-semibold"
                        : "bg-white text-zinc-800 border border-zinc-200 rounded-bl-xs px-3 py-2"
                    }`}
                    style={
                      isMe
                        ? {
                            backgroundColor: "#171513",
                            color: "#F5F0EB",
                            border: "1px solid #2C2825"
                          }
                        : undefined
                    }
                  >
                    {isMe && (
                      <div
                        className="flex items-center justify-between gap-2 px-2.5 py-1.5 border-b"
                        style={{
                          backgroundColor: "#1F1C1A",
                          borderColor: "rgba(255,255,255,0.1)"
                        }}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <img
                            src={myPic}
                            alt={currentUser?.name || "You"}
                            onError={(e) => {
                              e.currentTarget.src = "/brand/kwesi-avatar.png"
                            }}
                            className="h-5 w-5 rounded-full object-cover ring-1 ring-[#0066FF] shrink-0"
                          />
                          <span className="text-[10px] font-bold truncate" style={{ color: "#F5F0EB" }}>
                            {currentUser?.name || "Kwesi Asiedu"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <img
                            src="/brand/connectln-icon-256.png"
                            alt="ConnectLn"
                            className="h-4 w-4 rounded-xs object-contain"
                          />
                          <span className="text-[10px] font-black tracking-tight" style={{ color: "#F5F0EB" }}>
                            ConnectLn
                          </span>
                        </div>
                      </div>
                    )}
                    <div className={isMe ? "px-3 py-2" : ""}>
                      <p style={isMe ? { color: "#F5F0EB" } : undefined}>{msg.text}</p>
                      <div
                        className={`mt-1 text-[9px] text-right flex items-center justify-end gap-1 ${
                          isMe ? "text-zinc-400" : "text-zinc-400"
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {isMe && <CheckCheck className="h-2.5 w-2.5 text-emerald-400" />}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleSendMiniMessage}
            className="border-t border-zinc-200 bg-white p-2 flex items-center gap-1.5"
          >
            <input
              type="text"
              placeholder="Write a message..."
              value={miniMessageInput}
              onChange={(e) => setMiniMessageInput(e.target.value)}
              className="flex-1 bg-transparent px-2 py-1 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={!miniMessageInput.trim()}
              className="rounded-full bg-[#0A66C2] p-1.5 disabled:opacity-30 hover:bg-[#004182]"
              style={{ color: "#FFFFFF" }}
            >
              <Send className="h-3 w-3" />
            </button>
          </form>
        </div>
      )}

      {/* 2. Collapsible Messaging Dock Drawer */}
      <div className="pointer-events-auto w-72 rounded-t-xl border border-zinc-300 bg-white shadow-2xl overflow-hidden">
        {/* Dock Header Bar */}
        <div
          onClick={() => setIsDockOpen(!isDockOpen)}
          className="flex items-center justify-between px-3.5 py-2.5 bg-white cursor-pointer border-b border-zinc-200 hover:bg-zinc-50"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt="Me"
                className="h-6 w-6 rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
            </div>
            <span className="font-bold text-xs text-zinc-900">Messaging</span>
            {totalUnread > 0 && (
              <span
                className="rounded-full bg-[#0A66C2] px-1.5 py-0.2 text-[10px] font-bold"
                style={{ color: "#FFFFFF" }}
              >
                {totalUnread}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-zinc-500">
            {onOpenFullMessaging && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenFullMessaging()
                }}
                className="p-1 hover:text-[#0A66C2]"
                title="Open Full Messaging Tab"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setActiveChatThread(threads[0] || null)
              }}
              className="p-1 hover:text-[#0A66C2]"
              title="Quick message"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            {isDockOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </div>
        </div>

        {/* Expanded Drawer Body */}
        {isDockOpen && (
          <div className="h-80 flex flex-col bg-white animate-in fade-in">
            {/* Search Input */}
            <div className="p-2 border-b border-zinc-100">
              <div className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-1">
                <Search className="h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search messages"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
              {filteredThreads.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setActiveChatThread(t)
                    setThreads((prev) =>
                      prev.map((th) =>
                        th.id === t.id ? { ...th, unreadCount: 0 } : th
                      )
                    )
                  }}
                  className="flex items-start gap-2.5 p-2.5 hover:bg-zinc-50 cursor-pointer transition-colors"
                >
                  <div className="relative shrink-0">
                    <img
                      src={t.avatar}
                      alt={t.title}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    {t.onlineStatus === "online" && (
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-zinc-900 truncate">
                        {t.title}
                      </p>
                      <span className="text-[10px] text-zinc-400">
                        {t.lastMessageTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                      {t.lastMessage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
