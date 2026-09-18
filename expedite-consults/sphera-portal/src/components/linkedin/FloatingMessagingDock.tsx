"use client"

import React, { useState } from "react"
import {
  MessageSquare,
  ChevronUp,
  ChevronDown,
  X,
  Send,
  MoreHorizontal,
  Edit3,
  Search,
  CheckCheck,
  Minimize2,
  Maximize2
} from "lucide-react"
import { MessageThread, initialMessages, UserProfile } from "@/lib/linkedin-data"

interface FloatingMessagingDockProps {
  currentUser: UserProfile
}

export function FloatingMessagingDock({ currentUser }: FloatingMessagingDockProps) {
  const [isDockOpen, setIsDockOpen] = useState(false)
  const [threads, setThreads] = useState<MessageThread[]>(initialMessages)
  const [activeChatThread, setActiveChatThread] = useState<MessageThread | null>(null)
  const [miniMessageInput, setMiniMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const totalUnread = threads.reduce((acc, t) => acc + t.unreadCount, 0)

  const handleSendMiniMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!miniMessageInput.trim() || !activeChatThread) return

    const newMsg = {
      id: 'mini_msg_' + Date.now(),
      senderId: 'me' as const,
      text: miniMessageInput.trim(),
      timestamp: 'Just now'
    }

    const updated = threads.map(t =>
      t.id === activeChatThread.id
        ? {
            ...t,
            lastMessage: miniMessageInput.trim(),
            lastMessageTime: 'Just now',
            messages: [...t.messages, newMsg]
          }
        : t
    )

    setThreads(updated)
    setActiveChatThread({
      ...activeChatThread,
      lastMessage: miniMessageInput.trim(),
      lastMessageTime: 'Just now',
      messages: [...activeChatThread.messages, newMsg]
    })
    setMiniMessageInput("")
  }

  const filteredThreads = threads.filter(t =>
    t.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="fixed bottom-0 right-4 z-50 flex items-end gap-3 pointer-events-none">
      {/* 1. Mini Floating Chat Pop-up Window (if a conversation is clicked) */}
      {activeChatThread && (
        <div className="pointer-events-auto flex flex-col w-80 h-96 rounded-t-xl border border-zinc-300 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={activeChatThread.user.avatar}
                  alt={activeChatThread.user.name}
                  className="h-7 w-7 rounded-full object-cover"
                />
                {activeChatThread.user.status === 'online' && (
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-zinc-900" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-zinc-900 truncate dark:text-zinc-100">
                  {activeChatThread.user.name}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">
                  {activeChatThread.user.status === 'online' ? 'Active now' : 'Available on mobile'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-zinc-400">
              <button
                onClick={() => setActiveChatThread(null)}
                className="rounded-sm p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs">
            {activeChatThread.messages.map((msg) => {
              const isMe = msg.senderId === 'me'
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 leading-relaxed ${
                      isMe
                        ? "bg-[#0A66C2] text-white rounded-br-xs"
                        : "bg-white text-zinc-800 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 rounded-bl-xs"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div
                      className={`mt-1 text-[9px] text-right flex items-center justify-end gap-1 ${
                        isMe ? "text-blue-100" : "text-zinc-400"
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="h-2.5 w-2.5" />}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMiniMessage} className="border-t border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900 flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Write a message..."
              value={miniMessageInput}
              onChange={(e) => setMiniMessageInput(e.target.value)}
              className="flex-1 bg-transparent px-2 py-1 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
              autoFocus
            />
            <button
              type="submit"
              disabled={!miniMessageInput.trim()}
              className="rounded-full bg-[#0A66C2] p-1.5 text-white disabled:opacity-30 hover:bg-[#004182]"
            >
              <Send className="h-3 w-3" />
            </button>
          </form>
        </div>
      )}

      {/* 2. Collapsible Messaging Dock Drawer */}
      <div className="pointer-events-auto w-72 rounded-t-xl border border-zinc-300 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 overflow-hidden">
        {/* Dock Header Bar */}
        <div
          onClick={() => setIsDockOpen(!isDockOpen)}
          className="flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-zinc-900 cursor-pointer border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850"
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
            <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
              Messaging
            </span>
            {totalUnread > 0 && (
              <span className="rounded-full bg-[#0A66C2] px-1.5 py-0.2 text-[10px] font-bold text-white">
                {totalUnread}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-zinc-500">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setActiveChatThread(threads[0])
              }}
              className="p-1 hover:text-[#0A66C2]"
              title="New message"
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
          <div className="h-80 flex flex-col bg-white dark:bg-zinc-900 animate-in fade-in">
            {/* Search Input */}
            <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
                <Search className="h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search messages"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredThreads.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setActiveChatThread(t)
                    setThreads(threads.map(th => th.id === t.id ? { ...th, unreadCount: 0 } : th))
                  }}
                  className="flex items-start gap-2.5 p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                >
                  <div className="relative shrink-0">
                    <img
                      src={t.user.avatar}
                      alt={t.user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    {t.user.status === 'online' && (
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-zinc-900 truncate dark:text-zinc-100">
                        {t.user.name}
                      </p>
                      <span className="text-[10px] text-zinc-400">{t.lastMessageTime}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate dark:text-zinc-400 mt-0.5">
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
