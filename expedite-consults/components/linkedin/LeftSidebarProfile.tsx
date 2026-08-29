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
  Award,
  FolderKanban,
  ShoppingBag,
  Briefcase,
  GraduationCap,
  Star,
  DollarSign,
  BarChart3,
  Sparkles,
  ShieldCheck
} from "lucide-react"
import { UserProfile } from "@/lib/linkedin-data"

interface LeftSidebarProfileProps {
  user: UserProfile
  onViewProfile: () => void
  onSelectTag?: (tag: string) => void
  onNavigateTab?: (tab: string) => void
}

export function LeftSidebarProfile({
  user,
  onViewProfile,
  onSelectTag,
  onNavigateTab
}: LeftSidebarProfileProps) {
  const [isRecentExpanded, setIsRecentExpanded] = useState(true)

  const workspaceShortcuts = [
    { id: 'missions', label: '🔥 Career Mission (72%)', badge: '+1,850 XP' },
    { id: 'labs', label: '🧪 Security Labs Sandbox', badge: 'Active' },
    { id: 'procurement', label: '🏢 Corporate Procurement', badge: '$2.4M Spend' },
    { id: 'collaboration', label: '🤝 Co-Founders & Ideas', badge: 'Trending' },
    { id: 'mentorship', label: '👨‍🏫 Mentorship & Creator', badge: '1:1 Open' },
    { id: 'profile', label: '📁 Portfolio & Evidence', badge: '6 Projects' },
    { id: 'sellercenter', label: '🛍️ My Products & Sales', badge: '$122.7K MRR' },
    { id: 'jobs', label: '💼 Active Applications', badge: '4 Status' },
    { id: 'peerreview', label: '⭐ Peer Reviews', badge: '4.98 ★' },
    { id: 'compensation', label: '💰 Compensation Benchmarks', badge: 'Top 5%' },
  ]

  const recentItems = [
    { type: 'group', name: 'AI & Zero Trust Cybersecurity Architects', icon: Users },
    { type: 'group', name: 'Next.js & React Core Engineering', icon: Users },
    { type: 'hashtag', name: 'CloudSecurity', icon: Hash },
    { type: 'hashtag', name: 'AgenticAI', icon: Hash },
    { type: 'event', name: 'Global Enterprise Cloud Summit 2026', icon: Calendar }
  ]

  return (
    <aside className="space-y-3">
      {/* Profile & Personal Command Center Card */}
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
            <div className="flex items-center justify-center gap-1">
              <h2 className="font-bold text-zinc-900 text-sm group-hover:underline dark:text-zinc-100">
                {user.name}
              </h2>
              <ShieldCheck className="h-4 w-4 text-[#0A66C2]" />
            </div>
            <p className="mt-1 text-xs text-zinc-500 leading-snug line-clamp-2 dark:text-zinc-400">
              {user.headline}
            </p>
          </button>
        </div>

        {/* Profile Strength & Career Mission Gauge */}
        <div className="border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800/80 space-y-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Profile Strength</span>
              <span className="font-black text-[#0A66C2]">94%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#0A66C2] to-emerald-500 w-[94%]" />
            </div>
          </div>

          <div
            onClick={() => onNavigateTab && onNavigateTab('missions')}
            className="rounded-lg bg-amber-500/10 p-2 border border-amber-400/30 cursor-pointer hover:bg-amber-500/20 transition-colors space-y-1"
          >
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Flame className="h-3 w-3 text-amber-500" /> Career Mission
              </span>
              <span className="text-amber-700 dark:text-amber-300 font-mono">72%</span>
            </div>
            <div className="h-1 w-full rounded-full bg-amber-200/50 dark:bg-amber-950 overflow-hidden">
              <div className="h-full rounded-full bg-amber-500 w-[72%]" />
            </div>
          </div>
        </div>

        {/* Metrics & Analytics */}
        <div className="border-t border-zinc-100 px-4 py-2 text-xs dark:border-zinc-800/80 space-y-1">
          <div
            onClick={onViewProfile}
            className="flex cursor-pointer items-center justify-between py-0.5 hover:text-[#0A66C2]"
          >
            <span className="text-zinc-500 dark:text-zinc-400">Profile viewers</span>
            <span className="font-semibold text-[#0A66C2]">{user.profileViews.toLocaleString()}</span>
          </div>
          <div
            onClick={onViewProfile}
            className="flex cursor-pointer items-center justify-between py-0.5 hover:text-[#0A66C2]"
          >
            <span className="text-zinc-500 dark:text-zinc-400">Post impressions</span>
            <span className="font-semibold text-[#0A66C2]">{user.postImpressions.toLocaleString()}</span>
          </div>
          <div
            onClick={onViewProfile}
            className="flex cursor-pointer items-center justify-between py-0.5 hover:text-[#0A66C2]"
          >
            <span className="text-zinc-500 dark:text-zinc-400">Search appearances</span>
            <span className="font-semibold text-emerald-600">76</span>
          </div>
        </div>

        {/* Personal Command Center Shortcuts */}
        <div className="border-t border-zinc-100 p-2.5 text-xs dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-1">
          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Personal Command Center
          </p>
          {workspaceShortcuts.map((ws) => (
            <button
              key={ws.id + ws.label}
              onClick={() => {
                if (onNavigateTab) onNavigateTab(ws.id)
                else onViewProfile()
              }}
              className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-zinc-700 hover:bg-white hover:shadow-xs dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all group"
            >
              <span className="font-medium truncate group-hover:text-[#0A66C2]">{ws.label}</span>
              <span className="rounded-md bg-zinc-100 px-1.5 py-0.2 text-[9px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {ws.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Discover & Recent Groups */}
      <div className="hidden md:block sticky top-18 rounded-xl border border-zinc-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Recent &amp; Followed
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
          </div>
        )}
      </div>
    </aside>
  )
}
