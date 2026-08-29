"use client"

import React, { useState } from "react"
import {
  Search,
  MoreHorizontal,
  Image as ImageIcon,
  Smile,
  Paperclip,
  Send,
  CheckCheck,
  Circle
} from "lucide-react"
import { MessageThread, initialMessages } from "@/lib/linkedin-data"

export function MessagingView() {
  const [threads, setThreads] = useState<MessageThread[]>(initialMessages)
  const [activeThreadId, setActiveThreadId] = useState<string>(initialMessages[0].id)
  const [messageInput, setMessageInput] = useState("")

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0]

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !activeThread) return

    const newMessage = {
      id: 'msg_' + Date.now(),
      senderId: 'me' as const,
      text: messageInput.trim(),
      timestamp: 'Just now'
    }

    setThreads(prev =>
      prev.map(t =>
        t.id === activeThreadId
          ? {
              ...t,
              lastMessage: messageInput.trim(),
              lastMessageTime: 'Just now',
              messages: [...t.messages, newMessage]
            }
          : t
      )
    )

    setMessageInput("")
  }

  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 grid grid-cols-1 md:grid-cols-12 min-h-[560px]">
      {/* Conversations List Rail */}
      <div className="md:col-span-5 lg:col-span-4 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
        <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            Messaging
          </h3>
          <MoreHorizontal className="h-4 w-4 text-zinc-400" />
        </div>

        {/* Search Chat */}
        <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800">
            <Search className="h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Threads List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {threads.map((t) => {
            const isActive = t.id === activeThreadId
            return (
              <div
                key={t.id}
                onClick={() => setActiveThreadId(t.id)}
                className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors ${
                  isActive
                    ? "bg-sky-50/70 border-l-4 border-[#0A66C2] dark:bg-sky-950/20"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={t.user.avatar}
                    alt={t.user.name}
                    className="h-11 w-11 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
                  />
                  {t.user.status === 'online' && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-900" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs sm:text-sm text-zinc-900 truncate dark:text-zinc-100">
                      {t.user.name}
                    </h4>
                    <span className="text-[10px] text-zinc-400">{t.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate dark:text-zinc-400 mt-0.5">
                    {t.lastMessage}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Message Chat Room Rail */}
      <div className="md:col-span-7 lg:col-span-8 flex flex-col h-[560px]">
        {/* Active Contact Header */}
        <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <img
              src={activeThread.user.avatar}
              alt={activeThread.user.name}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                {activeThread.user.name}
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-sm">
                {activeThread.user.headline}
              </p>
            </div>
          </div>
          <MoreHorizontal className="h-4 w-4 text-zinc-400" />
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/30 dark:bg-zinc-950/20">
          {activeThread.messages.map((msg) => {
            const isMe = msg.senderId === 'me'
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && (
                  <img
                    src={activeThread.user.avatar}
                    alt={activeThread.user.name}
                    className="h-7 w-7 rounded-full object-cover shrink-0 mb-1"
                  />
                )}
                <div
                  className={`max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isMe
                      ? "rounded-br-xs bg-[#0A66C2] text-white"
                      : "rounded-bl-xs bg-white text-zinc-800 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700"
                  }`}
                >
                  <p>{msg.text}</p>
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                      isMe ? "text-blue-100" : "text-zinc-400"
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck className="h-3 w-3" />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-center gap-2 rounded-full border border-zinc-300 bg-zinc-50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800/70">
            <input
              type="text"
              placeholder="Write a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100"
            />
            <div className="flex items-center gap-1.5 text-zinc-400 shrink-0">
              <button type="button" className="hover:text-zinc-600">
                <ImageIcon className="h-4 w-4" />
              </button>
              <button type="button" className="hover:text-zinc-600">
                <Smile className="h-4 w-4" />
              </button>
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="rounded-full bg-[#0A66C2] p-1.5 text-white transition-opacity hover:bg-[#004182] disabled:opacity-30"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
