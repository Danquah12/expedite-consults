"use client"

import React, { useState } from "react"
import {
  ShieldAlert,
  Lock,
  ArrowBigUp,
  MessageSquare,
  Building,
  Plus,
  Flame,
  CheckCircle2,
  Sparkles,
  Send,
  EyeOff
} from "lucide-react"
import { watercoolerThreadsData, WatercoolerThread } from "@/lib/nextgen-data"
import { UserProfile } from "@/lib/linkedin-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface WatercoolerBlindViewProps {
  currentUser: UserProfile
}

export function WatercoolerBlindView({ currentUser }: WatercoolerBlindViewProps) {
  const [threads, setThreads] = useState<WatercoolerThread[]>(watercoolerThreadsData)
  const [selectedCompany, setSelectedCompany] = useState<string>("All")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false)
  const [activeThread, setActiveThread] = useState<WatercoolerThread | null>(null)
  const [replyText, setReplyText] = useState("")

  // Form State
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [companyTag, setCompanyTag] = useState("Expedite Consults")
  const [threadCategory, setThreadCategory] = useState<'Compensation' | 'Layoffs & Reorg' | 'Interview Prep' | 'Culture & Execs'>('Compensation')

  const companies = ["All", "Expedite Consults", "AWS / Amazon", "Google", "Meta", "Microsoft"]
  const categories = ["All", "Compensation", "Layoffs & Reorg", "Interview Prep", "Culture & Execs"]

  const handleToggleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setThreads(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextUpvoted = !t.hasUpvoted
          return {
            ...t,
            hasUpvoted: nextUpvoted,
            upvotes: nextUpvoted ? t.upvotes + 1 : t.upvotes - 1
          }
        }
        return t
      })
    )
  }

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    const newTh: WatercoolerThread = {
      id: 'wc_' + Date.now(),
      companyTag: companyTag,
      companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80',
      verifiedRole: 'Verified ' + currentUser.headline.split('|')[0].trim(),
      title: title.trim(),
      content: content.trim(),
      upvotes: 1,
      hasUpvoted: true,
      commentsCount: 0,
      timestamp: 'Just now',
      category: threadCategory,
      comments: []
    }

    setThreads([newTh, ...threads])
    setIsNewThreadOpen(false)
    setTitle("")
    setContent("")
  }

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeThread || !replyText.trim()) return

    const newComment = {
      id: 'wcc_' + Date.now(),
      verifiedRole: 'Verified ' + currentUser.headline.split('|')[0].trim(),
      content: replyText.trim(),
      timestamp: 'Just now',
      likes: 0
    }

    setThreads(prev =>
      prev.map(t =>
        t.id === activeThread.id
          ? { ...t, commentsCount: t.commentsCount + 1, comments: [...t.comments, newComment] }
          : t
      )
    )

    setActiveThread(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1, comments: [...prev.comments, newComment] } : null)
    setReplyText("")
  }

  const filtered = threads.filter(t => {
    const matchCompany = selectedCompany === "All" || t.companyTag.toLowerCase().includes(selectedCompany.toLowerCase())
    const matchCategory = selectedCategory === "All" || t.category === selectedCategory
    return matchCompany && matchCategory
  })

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-slate-950 via-zinc-900 to-sky-950 p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5 w-fit">
              <EyeOff className="h-3.5 w-3.5 text-emerald-400" /> ConnectIn Watercooler™ (Verified Anonymous)
            </span>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight">
              Candid Workplace Channels & Real Compensation Intel
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-300 max-w-xl">
              Discuss internal compensation bands, executive leadership, interview loops, and reorgs anonymously with verified company badges.
            </p>
          </div>

          <button
            onClick={() => setIsNewThreadOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-700 transition-all"
          >
            <Plus className="h-4 w-4" /> Post Anonymously
          </button>
        </div>
      </div>

      {/* Filter Bars */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Company Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
          {companies.map((comp) => (
            <button
              key={comp}
              onClick={() => setSelectedCompany(comp)}
              className={`rounded-full px-3.5 py-1 transition-all ${
                selectedCompany === comp
                  ? "bg-[#0A66C2] text-white font-bold"
                  : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"
              }`}
            >
              {comp}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Threads Feed */}
      <div className="space-y-3">
        {filtered.map((thread) => (
          <div
            key={thread.id}
            onClick={() => setActiveThread(thread)}
            className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-[#0A66C2] hover:shadow-md transition-all cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#0A66C2] border border-blue-200 dark:bg-blue-950/40 dark:border-blue-900 dark:text-sky-300 flex items-center gap-1">
                  <Building className="h-3 w-3" /> {thread.companyTag}
                </span>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {thread.verifiedRole}
                </span>
              </div>

              <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {thread.category}
              </span>
            </div>

            <h3 className="font-bold text-base text-zinc-900 group-hover:text-[#0A66C2] dark:text-zinc-100 leading-snug">
              {thread.title}
            </h3>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-2">
              {thread.content}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400">
              <span>{thread.timestamp} · Verified Company Identity Shielded</span>

              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handleToggleUpvote(thread.id, e)}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${
                    thread.hasUpvoted
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
                      : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  <ArrowBigUp className={`h-4 w-4 ${thread.hasUpvoted ? "fill-emerald-600" : ""}`} />
                  <span>{thread.upvotes}</span>
                </button>

                <span className="flex items-center gap-1 font-semibold text-zinc-600 dark:text-zinc-300">
                  <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                  {thread.commentsCount} comments
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Thread Discussion Modal */}
      <Dialog open={Boolean(activeThread)} onOpenChange={() => setActiveThread(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden sm:rounded-xl">
          {activeThread && (
            <>
              <DialogHeader className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#0A66C2] border border-blue-200 dark:bg-blue-950/40">
                    {activeThread.companyTag}
                  </span>
                  <span className="text-xs text-zinc-500">{activeThread.verifiedRole}</span>
                </div>
                <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                  {activeThread.title}
                </DialogTitle>
              </DialogHeader>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed bg-zinc-50 dark:bg-zinc-850 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  {activeThread.content}
                </p>

                {/* Comments List */}
                <div className="space-y-3 pt-2">
                  <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    Anonymous Verified Responses ({activeThread.comments.length})
                  </p>

                  {activeThread.comments.map((cmt) => (
                    <div key={cmt.id} className="rounded-xl border border-zinc-100 bg-white p-3.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="font-bold text-[#0A66C2]">{cmt.verifiedRole}</span>
                        <span>{cmt.timestamp}</span>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {cmt.content}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Post Reply Form */}
                <form onSubmit={handleAddReply} className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <input
                    type="text"
                    placeholder="Write an anonymous response with your verified badge..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700 shadow-xs"
                  >
                    Reply
                  </button>
                </form>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Anonymous Thread Modal */}
      <Dialog open={isNewThreadOpen} onOpenChange={setIsNewThreadOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden sm:rounded-xl">
          <DialogHeader className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <EyeOff className="h-5 w-5 text-emerald-600" />
              <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Post to Anonymous Watercooler
              </DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateThread} className="p-6 space-y-4 text-xs">
            <div>
              <label className="font-bold text-zinc-800 dark:text-zinc-200">
                Target Company Channel
              </label>
              <select
                value={companyTag}
                onChange={(e) => setCompanyTag(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {companies.filter(c => c !== "All").map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-zinc-800 dark:text-zinc-200">
                Category
              </label>
              <select
                value={threadCategory}
                onChange={(e) => setThreadCategory(e.target.value as any)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {categories.filter(c => c !== "All").map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-zinc-800 dark:text-zinc-200">
                Thread Headline
              </label>
              <input
                type="text"
                placeholder="e.g. Real numbers on L7 Staff Architect TC..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-800 dark:text-zinc-200">
                Discussion Content & Details
              </label>
              <textarea
                rows={4}
                placeholder="Share compensation breakdown, interview loop feedback, or reorg updates..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white p-3 text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewThreadOpen(false)}
                className="rounded-full px-4 py-1.5 font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-5 py-1.5 font-bold text-white hover:bg-emerald-700 shadow-xs"
              >
                Post Anonymously
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
