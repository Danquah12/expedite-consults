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
  Circle,
  Building2,
  ShoppingBag,
  Users,
  User,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Zap,
  Check,
  Star,
  Briefcase,
  Layers,
  Store,
  ArrowRight,
  Filter
} from "lucide-react"
import {
  B2BConversationThread,
  B2BMessageItem,
  B2B_MESSAGING_THREADS_DATA
} from "@/lib/b2b-messaging-data"

interface MessagingViewProps {
  onNavigateMarketplace?: () => void
  onNavigateJobs?: () => void
}

export function MessagingView({
  onNavigateMarketplace,
  onNavigateJobs
}: MessagingViewProps) {
  // Active Channel Filter: All vs People vs Companies vs Products vs Communities
  const [activeChannel, setActiveChannel] = useState<'All' | 'People' | 'Companies' | 'Products' | 'Communities'>('Products')
  const [threads, setThreads] = useState<B2BConversationThread[]>(B2B_MESSAGING_THREADS_DATA)
  const [activeThreadId, setActiveThreadId] = useState<string>(B2B_MESSAGING_THREADS_DATA[0].id)
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Filtered threads by active channel and search
  const filteredThreads = threads.filter(t => {
    const matchChannel = activeChannel === 'All' || t.channelType === activeChannel
    const matchSearch = !searchQuery || (
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return matchChannel && matchSearch
  })

  const activeThread = threads.find(t => t.id === activeThreadId) || filteredThreads[0] || threads[0]

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !activeThread) return

    const newMessage: B2BMessageItem = {
      id: 'msg_' + Date.now(),
      sender: {
        id: 'me',
        name: 'Alex Taylor',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        role: 'Principal Cloud & Security Architect'
      },
      text: messageInput.trim(),
      timestamp: 'Just now'
    }

    setThreads(prev =>
      prev.map(t =>
        t.id === activeThread.id
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

    // Automated Simulated Vendor / Recruiter Response
    if (activeThread.channelType === 'Products') {
      setTimeout(() => {
        const vendorReply: B2BMessageItem = {
          id: 'reply_' + Date.now(),
          sender: {
            id: 'vendor_auto',
            name: activeThread.title,
            avatar: activeThread.avatar,
            role: 'Verified Vendor Account',
            isCompany: true,
            isProduct: true,
            isVerified: true
          },
          text: `Thank you for your message! Our engineering team has provisioned your staging access. You can activate your cluster credentials in the Marketplace tab.`,
          timestamp: 'Just now'
        }
        setThreads(prev =>
          prev.map(t =>
            t.id === activeThread.id
              ? {
                  ...t,
                  lastMessage: vendorReply.text,
                  lastMessageTime: 'Just now',
                  messages: [...t.messages, vendorReply]
                }
              : t
          )
        )
      }, 1500)
    }
  }

  const handleQuickReply = (text: string) => {
    setMessageInput(text)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-20">
      {/* 1. TOP B2B CHANNELS BAR */}
      <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-sky-500/20 px-3 py-0.5 text-xs font-bold text-sky-300 border border-sky-400/40 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-amber-300" />
              ConnectIn Enterprise B2B Communications Hub
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            People, Companies, Products &amp; Communities
          </h2>
          <p className="text-xs text-zinc-300">
            Communicate directly with colleagues, recruiters, enterprise product sellers, and specialized architectural guilds.
          </p>
        </div>

        {/* 4 Master Channels Switcher */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/15 overflow-x-auto shrink-0">
          {[
            { id: 'Products', label: '🛍️ Products & Vendors', count: 1 },
            { id: 'Companies', label: '🏢 Companies & Recruiters', count: 1 },
            { id: 'People', label: '👥 People (DMs)', count: 1 },
            { id: 'Communities', label: '🌐 Communities (Guilds)', count: 1 },
            { id: 'All', label: 'All Inboxes', count: 4 }
          ].map((ch) => {
            const isSelected = activeChannel === ch.id
            return (
              <button
                key={ch.id}
                onClick={() => {
                  setActiveChannel(ch.id as any)
                  const firstMatch = threads.find(t => ch.id === 'All' || t.channelType === ch.id)
                  if (firstMatch) setActiveThreadId(firstMatch.id)
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#0A66C2] text-white shadow-md font-extrabold"
                    : "text-zinc-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{ch.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. SPLIT CHAT INTERFACE */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Side: Threads Stream */}
        <div className="md:col-span-5 lg:col-span-4 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
          <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-zinc-500">
              {activeChannel === 'All' ? 'All Conversations' : `${activeChannel} Inbox`}
            </span>
            <span className="text-xs text-zinc-400 font-mono">{filteredThreads.length} channels</span>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800">
              <Search className="h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search conversations, vendors, recruiters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Thread Cards */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {filteredThreads.map((t) => {
              const isActive = t.id === activeThread?.id
              return (
                <div
                  key={t.id}
                  onClick={() => setActiveThreadId(t.id)}
                  className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors ${
                    isActive
                      ? "bg-sky-50/80 border-l-4 border-[#0A66C2] dark:bg-sky-950/30"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={t.avatar}
                      alt={t.title}
                      className="h-11 w-11 rounded-xl object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
                    />
                    {t.badgeIcon && (
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs shadow-xs dark:bg-zinc-900">
                        {t.badgeIcon}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900 truncate dark:text-zinc-100">
                        {t.title}
                      </h4>
                      <span className="text-[10px] text-zinc-400 whitespace-nowrap ml-1 font-mono">
                        {t.lastMessageTime}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-500 truncate dark:text-zinc-400">
                      {t.subtitle}
                    </p>

                    <p className="text-xs text-zinc-600 truncate mt-1 dark:text-zinc-300">
                      {t.lastMessage}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Side: Active Chat Window */}
        {activeThread ? (
          <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between">
            {/* Chat Top Header */}
            <div>
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={activeThread.avatar}
                    alt={activeThread.title}
                    className="h-11 w-11 rounded-xl object-cover ring-1 ring-zinc-200 dark:ring-zinc-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-sm text-zinc-900 truncate dark:text-zinc-100">
                        {activeThread.title}
                      </h3>
                      {activeThread.isVerified && (
                        <ShieldCheck className="h-4 w-4 text-[#0A66C2] shrink-0" title="Verified B2B Entity" />
                      )}
                      <span className="rounded-full bg-zinc-100 px-2 py-0.2 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {activeThread.subType}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate">{activeThread.subtitle}</p>
                  </div>
                </div>

                {/* Right Header Action depending on channel type */}
                {activeThread.productMetadata && (
                  <button
                    onClick={onNavigateMarketplace}
                    className="rounded-lg bg-purple-600 hover:bg-purple-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs flex items-center gap-1 shrink-0"
                  >
                    <Store className="h-3.5 w-3.5" />
                    <span>View Product</span>
                  </button>
                )}

                {activeThread.companyMetadata?.openJobsCount && (
                  <button
                    onClick={onNavigateJobs}
                    className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] px-3 py-1.5 text-xs font-bold text-white shadow-xs flex items-center gap-1 shrink-0"
                  >
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>View {activeThread.companyMetadata.openJobsCount} Jobs</span>
                  </button>
                )}
              </div>

              {/* Product / Company Live Context Banner */}
              {activeThread.productMetadata && (
                <div className="mx-4 mt-3 rounded-xl border border-purple-200 bg-purple-50/70 p-3 dark:bg-purple-950/20 dark:border-purple-900/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🛡️</span>
                    <div>
                      <p className="font-bold text-purple-900 dark:text-purple-300">
                        B2B Product Desk: {activeThread.productMetadata.productName}
                      </p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        Price: <strong>{activeThread.productMetadata.price}</strong> · License: <strong>{activeThread.productMetadata.licenseType}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="text-emerald-600 font-bold text-[11px]">✓ 14-Day Staging Active</span>
                </div>
              )}
            </div>

              {/* Messages Stream */}
            <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[380px]">
              {activeThread.messages.map((msg) => {
                const isMe = msg.sender.id === 'me'
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                  >
                    <img
                      src={msg.sender.avatar}
                      alt={msg.sender.name}
                      className="h-8 w-8 rounded-full object-cover shrink-0 mt-0.5"
                    />

                    <div className={`space-y-1 max-w-[78%] ${isMe ? "items-end text-right" : ""}`}>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">
                          {msg.sender.name}
                        </span>
                        <span>·</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? "bg-[#0A66C2] text-white rounded-tr-xs"
                            : "bg-zinc-100 text-zinc-900 rounded-tl-xs dark:bg-zinc-800 dark:text-zinc-100"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Quick Reply Chips & Message Input */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2">
              {/* Contextual Quick Replies */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[10px] font-bold text-zinc-400 uppercase mr-1">Quick Reply:</span>
                {activeThread.channelType === 'Products' ? (
                  <>
                    <button
                      onClick={() => handleQuickReply("Yes, please generate a 14-day GovCloud trial key!")}
                      className="rounded-full bg-purple-100 hover:bg-purple-200 px-3 py-1 text-[11px] font-bold text-purple-900 dark:bg-purple-950 dark:text-purple-300 shrink-0"
                    >
                      "Yes, please generate a 14-day GovCloud trial key!"
                    </button>
                    <button
                      onClick={() => handleQuickReply("What is the licensing cost for 500+ AWS accounts?")}
                      className="rounded-full bg-zinc-200 hover:bg-zinc-300 px-3 py-1 text-[11px] font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 shrink-0"
                    >
                      "What is the licensing cost for 500+ AWS accounts?"
                    </button>
                  </>
                ) : activeThread.channelType === 'Companies' ? (
                  <>
                    <button
                      onClick={() => handleQuickReply("I'd be glad to jump on a briefing call this Thursday!")}
                      className="rounded-full bg-blue-100 hover:bg-blue-200 px-3 py-1 text-[11px] font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300 shrink-0"
                    >
                      "I'd be glad to jump on a briefing call this Thursday!"
                    </button>
                  </>
                ) : null}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex-1 flex items-center rounded-xl bg-white border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700">
                  <input
                    type="text"
                    placeholder={`Reply to ${activeThread.title}...`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100"
                  />
                  <div className="flex items-center gap-1 text-zinc-400 ml-2">
                    <Paperclip className="h-4 w-4 hover:text-zinc-600 cursor-pointer" />
                    <Smile className="h-4 w-4 hover:text-zinc-600 cursor-pointer" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-[#0A66C2] p-2.5 text-white hover:bg-[#004182] transition-colors shadow-xs"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="md:col-span-7 lg:col-span-8 flex items-center justify-center p-8 text-center text-zinc-500">
            Select a conversation to start messaging.
          </div>
        )}
      </div>
    </div>
  )
}
