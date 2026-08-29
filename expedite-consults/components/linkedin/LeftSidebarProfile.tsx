"use client"

import React, { useState } from "react"
import {
  Bookmark,
  Users,
  Hash,
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
  TrendingUp,
  Award
} from "lucide-react"
import { UserProfile } from "@/lib/linkedin-data"

interface LeftSidebarProfileProps {
  user: UserProfile
  onViewProfile: () => void
  onSelectTag?: (tag: string) => void
}

export function LeftSidebarProfile({
  user,
  onViewProfile,
  onSelectTag
}: LeftSidebarProfileProps) {
  const [isRecentExpanded, setIsRecentExpanded] = useState(true)

  const recentItems = [
    { type: 'group', name: 'AI & Zero Trust Cybersecurity Architects', icon: Users },
    { type: 'group', name: 'Next.js & React Core Engineering', icon: Users },
    { type: 'hashtag', name: 'CloudSecurity', icon: Hash },
    { type: 'hashtag', name: 'AgenticAI', icon: Hash },
    { type: 'event', name: 'Global Enterprise Cloud Summit 2026', icon: Calendar }
  ]

  return (
    <aside className="space-y-2.5">
      {/* Profile Card */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Cover Banner */}
        <div className="relative h-16 w-full bg-gradient-to-r from-[#0A66C2] via-sky-600 to-indigo-700">
          <img
            src={user.coverImage}
            alt="Cover"
            className="h-full w-full object-cover opacity-60"
          />
        </div>

        {/* Avatar & User Details */}
        <div className="relative px-4 pb-3 pt-0 text-center">
          <div className="-mt-10 mb-2 flex justify-center">
            <div
              onClick={onViewProfile}
              className="relative h-18 w-18 cursor-pointer rounded-full border-2 border-white bg-white shadow-md transition-transform hover:scale-105 dark:border-zinc-900"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="h-full w-full rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-900" title="Available" />
            </div>
          </div>

          <button
            onClick={onViewProfile}
            className="group block w-full focus:outline-none"
          >
            <h2 className="font-bold text-zinc-900 text-sm group-hover:underline dark:text-zinc-100">
              {user.name}
            </h2>
            <p className="mt-1 text-xs text-zinc-500 leading-snug line-clamp-2 dark:text-zinc-400">
              {user.headline}
            </p>
          </button>
        </div>

        {/* Metrics & Analytics */}
        <div className="border-t border-zinc-100 px-4 py-2.5 text-xs dark:border-zinc-800/80">
          <div
            onClick={onViewProfile}
            className="flex cursor-pointer items-center justify-between py-1 hover:text-[#0A66C2]"
          >
            <span className="text-zinc-500 dark:text-zinc-400">Profile viewers</span>
            <span className="font-semibold text-[#0A66C2]">
              {user.profileViews.toLocaleString()}
            </span>
          </div>
          <div
            onClick={onViewProfile}
            className="flex cursor-pointer items-center justify-between py-1 hover:text-[#0A66C2]"
          >
            <span className="text-zinc-500 dark:text-zinc-400">Post impressions</span>
            <span className="font-semibold text-[#0A66C2]">
              {user.postImpressions.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Premium Upgrade Badge */}
        <div className="border-t border-zinc-100 bg-amber-50/50 p-3 text-xs dark:border-zinc-800/80 dark:bg-amber-950/20">
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
            Access exclusive tools & insights
          </p>
          <div className="mt-1 flex items-center gap-1.5 font-semibold text-amber-900 hover:underline cursor-pointer dark:text-amber-300">
            <Award className="h-3.5 w-3.5 text-amber-600" />
            <span>Try Premium for $0</span>
          </div>
        </div>

        {/* Saved Items */}
        <div className="border-t border-zinc-100 p-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer dark:border-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <Bookmark className="h-3.5 w-3.5 text-zinc-500" />
            <span>Saved items</span>
          </div>
        </div>
      </div>

      {/* Recent Communities & Shortcuts */}
      <div className="hidden md:block sticky top-18 rounded-xl border border-zinc-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Recent & Followed
          </p>
          <button
            onClick={() => setIsRecentExpanded(!isRecentExpanded)}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            {isRecentExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {isRecentExpanded && (
          <div className="space-y-1 text-xs">
            {recentItems.map((item, idx) => {
              const Icon = item.icon
              return (
                <button
                  key={idx}
                  onClick={() => onSelectTag && onSelectTag(item.name)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                >
                  <Icon className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </button>
              )
            })}

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <button className="flex w-full items-center justify-between text-[#0A66C2] font-semibold py-1 hover:underline">
                <span>Groups</span>
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button className="flex w-full items-center justify-between text-[#0A66C2] font-semibold py-1 hover:underline">
                <span>Events</span>
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button className="flex w-full items-center justify-between text-[#0A66C2] font-semibold py-1 hover:underline">
                <span>Followed Hashtags</span>
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="pt-2 text-center border-t border-zinc-100 dark:border-zinc-800/80">
              <span className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 cursor-pointer dark:hover:text-zinc-200">
                Discover more
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
