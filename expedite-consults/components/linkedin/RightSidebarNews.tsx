"use client"

import React, { useState } from "react"
import {
  Info,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  UserPlus,
  ExternalLink,
  Shield,
  ArrowUpRight
} from "lucide-react"
import { NewsItem, SuggestedConnection } from "@/lib/linkedin-data"

interface RightSidebarNewsProps {
  news: NewsItem[]
  suggestedPeople: SuggestedConnection[]
  onToggleConnect: (personId: string) => void
  onNewsClick?: (headline: string) => void
}

export function RightSidebarNews({
  news,
  suggestedPeople,
  onToggleConnect,
  onNewsClick
}: RightSidebarNewsProps) {
  const [showAllNews, setShowAllNews] = useState(false)
  const displayedNews = showAllNews ? news : news.slice(0, 4)

  return (
    <aside className="space-y-3">
      {/* LinkedIn News Box */}
      <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-2">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            ConnectIn News
          </h3>
          <Info className="h-4 w-4 text-zinc-400 cursor-pointer hover:text-zinc-600" />
        </div>

        <p className="text-xs font-semibold text-zinc-500 mb-2 dark:text-zinc-400">
          Top stories & professional insights
        </p>

        <div className="space-y-3">
          {displayedNews.map((item) => (
            <div
              key={item.id}
              onClick={() => onNewsClick && onNewsClick(item.headline)}
              className="group cursor-pointer"
            >
              <div className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 group-hover:bg-[#0A66C2] transition-colors shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-zinc-800 group-hover:text-[#0A66C2] group-hover:underline dark:text-zinc-200 leading-snug">
                    {item.headline}
                  </h4>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    {item.timeAgo} · {item.readersCount}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAllNews(!showAllNews)}
          className="mt-3 flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 focus:outline-none"
        >
          <span>{showAllNews ? "Show less" : "Show more"}</span>
          {showAllNews ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Suggested Follows / Add to Feed */}
      <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-2">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            Add to your feed
          </h3>
          <Info className="h-4 w-4 text-zinc-400" />
        </div>

        <div className="space-y-3 mt-1">
          {suggestedPeople.slice(0, 3).map((person) => (
            <div key={person.id} className="flex items-start gap-2.5">
              <img
                src={person.avatar}
                alt={person.name}
                className="h-10 w-10 rounded-full object-cover shrink-0 ring-1 ring-zinc-200 dark:ring-zinc-800"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-zinc-900 hover:underline hover:text-[#0A66C2] cursor-pointer truncate dark:text-zinc-100">
                  {person.name}
                </p>
                <p className="text-[11px] text-zinc-500 line-clamp-2 dark:text-zinc-400 leading-tight">
                  {person.headline}
                </p>
                {person.mutualName && (
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Followed by {person.mutualName}
                  </p>
                )}
                <div className="mt-1.5">
                  <button
                    onClick={() => onToggleConnect(person.id)}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                      person.isPending
                        ? "border-zinc-300 text-zinc-500 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                        : person.isConnected
                        ? "border-emerald-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
                        : "border-zinc-500 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-900 dark:border-zinc-400 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {person.isPending ? (
                      <span>Pending</span>
                    ) : person.isConnected ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mini LinkedIn Legal & Discovery Footer */}
      <footer className="px-2 text-center text-[11px] text-zinc-400 space-y-1">
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-1">
          <span className="hover:text-[#0A66C2] cursor-pointer">About</span>
          <span>·</span>
          <span className="hover:text-[#0A66C2] cursor-pointer">Accessibility</span>
          <span>·</span>
          <span className="hover:text-[#0A66C2] cursor-pointer">Help Center</span>
          <span>·</span>
          <span className="hover:text-[#0A66C2] cursor-pointer">Privacy & Terms</span>
          <span>·</span>
          <span className="hover:text-[#0A66C2] cursor-pointer">Ad Choices</span>
          <span>·</span>
          <span className="hover:text-[#0A66C2] cursor-pointer">Advertising</span>
        </div>
        <div className="pt-2 flex items-center justify-center gap-1 font-semibold text-zinc-600 dark:text-zinc-400">
          <span className="text-zinc-800 dark:text-zinc-200 font-extrabold">Connect<span className="bg-[#0A66C2] text-white px-1 py-0.5 rounded-xs ml-0.5 text-xs font-black">In</span></span>
          <span>Expedite Corporation © 2026</span>
        </div>
      </footer>
    </aside>
  )
}
