"use client"

import React, { useState } from "react"
import {
  Rocket,
  ArrowBigUp,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Plus,
  Flame,
  Star,
  Award,
  CheckCircle2,
  ShoppingBag
} from "lucide-react"
import { productLaunchesData, ProductLaunchItem } from "@/lib/nextgen-data"
import { UserProfile } from "@/lib/linkedin-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ProductLaunchLeaderboardProps {
  currentUser: UserProfile
  onNavigateMarketplace?: () => void
}

export function ProductLaunchLeaderboard({
  currentUser,
  onNavigateMarketplace
}: ProductLaunchLeaderboardProps) {
  const [launches, setLaunches] = useState<ProductLaunchItem[]>(productLaunchesData)
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newTagline, setNewTagline] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newCategory, setNewCategory] = useState("Developer Tools & Security")

  const categories = ["All", "Developer Tools & Security", "Web Architecture", "AI & Data", "Enterprise SaaS"]

  const handleToggleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setLaunches(prev =>
      prev.map(l => {
        if (l.id === id) {
          return {
            ...l,
            hasUpvoted: !l.hasUpvoted,
            upvotesCount: l.hasUpvoted ? l.upvotesCount - 1 : l.upvotesCount + 1
          }
        }
        return l
      })
    )
  }

  const handleCreateLaunch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newLaunch: ProductLaunchItem = {
      id: 'launch_' + Date.now(),
      title: newTitle.trim(),
      tagline: newTagline.trim() || 'Next-generation technical tool built by ' + currentUser.name,
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
      makers: [{ name: currentUser.name, avatar: currentUser.avatar }],
      upvotesCount: 1,
      hasUpvoted: true,
      category: newCategory,
      productUrl: newUrl.trim() || 'https://github.com',
      description: 'Submitted by verified member ' + currentUser.name,
      screenshots: [],
      commentsCount: 0
    }

    setLaunches([newLaunch, ...launches])
    setIsSubmitOpen(false)
    setNewTitle("")
    setNewTagline("")
    setNewUrl("")
  }

  const filtered = launches.filter(
    l => activeCategory === "All" || l.category === activeCategory
  )

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-orange-950 via-amber-950 to-slate-950 p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-orange-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-orange-400/40 flex items-center gap-1.5 w-fit">
              <Flame className="h-3.5 w-3.5 text-orange-400 fill-orange-400" /> ConnectIn Launchpad (Daily Leaderboard)
            </span>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight">
              Member Product Launches & Open-Source Showcases
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-amber-200 max-w-xl">
              Discover, upvote, and test ground-breaking tools, eBPF probes, and architectural blueprints crafted by the community.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateMarketplace && (
              <button
                onClick={onNavigateMarketplace}
                className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-xs border border-white/20 hover:bg-white/25 transition-all"
              >
                <ShoppingBag className="h-4 w-4 text-amber-300" />
                <span>Visit App Store 🛒</span>
              </button>
            )}

            <button
              onClick={() => setIsSubmitOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:from-orange-600 hover:to-amber-700 transition-all"
            >
              <Plus className="h-4 w-4" /> Launch Your Project
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 transition-all ${
              activeCategory === cat
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold shadow-xs"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Daily Leaderboard List */}
      <div className="space-y-3">
        {filtered.map((item, idx) => (
          <div
            key={item.id}
            className="group rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs hover:border-orange-500/50 hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <span className="text-base font-black text-zinc-400 w-5 text-center">
                #{idx + 1}
              </span>

              <img
                src={item.thumbnail}
                alt={item.title}
                className="h-16 w-16 rounded-xl object-cover ring-1 ring-zinc-200 dark:ring-zinc-800 shrink-0"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 group-hover:text-orange-600 dark:text-zinc-100 truncate">
                    {item.title}
                  </h3>
                  <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {item.category}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-1">
                  {item.tagline}
                </p>

                {/* Makers & Comments */}
                <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-500">Makers:</span>
                    <div className="flex -space-x-1.5">
                      {item.makers.map((m, mIdx) => (
                        <img
                          key={mIdx}
                          src={m.avatar}
                          alt={m.name}
                          className="h-5 w-5 rounded-full ring-1 ring-white dark:ring-zinc-900 object-cover"
                          title={m.name}
                        />
                      ))}
                    </div>
                  </div>

                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> {item.commentsCount} reviews
                  </span>

                  <span>·</span>
                  <a
                    href={item.productUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-0.5 text-sky-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Project <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Product Hunt-style Upvote Button */}
            <button
              onClick={(e) => handleToggleUpvote(item.id, e)}
              className={`flex flex-col items-center justify-center rounded-xl border px-4 py-2.5 min-w-[65px] transition-all shadow-xs ${
                item.hasUpvoted
                  ? "border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-950/40"
                  : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-orange-300 hover:bg-orange-50/50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              <ArrowBigUp className={`h-5 w-5 ${item.hasUpvoted ? "fill-orange-600" : ""}`} />
              <span className="text-xs font-black mt-0.5">{item.upvotesCount}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Submission Modal */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden sm:rounded-xl">
          <DialogHeader className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Launch Your Project on ConnectIn
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateLaunch} className="p-6 space-y-4 text-xs">
            <div>
              <label className="font-bold text-zinc-800 dark:text-zinc-200">
                Project Name
              </label>
              <input
                type="text"
                placeholder="e.g. VeritasLens eBPF Probe"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-800 dark:text-zinc-200">
                One-Sentence Tagline
              </label>
              <input
                type="text"
                placeholder="e.g. Zero-overhead kernel observability engine..."
                value={newTagline}
                onChange={(e) => setNewTagline(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-800 dark:text-zinc-200">
                Product or GitHub URL
              </label>
              <input
                type="url"
                placeholder="https://github.com/your-username/repo"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitOpen(false)}
                className="rounded-full px-4 py-1.5 font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-orange-600 px-5 py-1.5 font-bold text-white hover:bg-orange-700 shadow-xs"
              >
                Launch Now 🚀
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
