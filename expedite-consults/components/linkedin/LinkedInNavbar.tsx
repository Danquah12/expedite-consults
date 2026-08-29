"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Home,
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  Search,
  Grid3X3,
  ChevronDown,
  X,
  Sparkles,
  ShieldCheck,
  LogOut,
  Settings,
  Bookmark,
  BookOpen,
  GraduationCap,
  Sun,
  Moon,
  Radio,
  Layers,
  DollarSign,
  UserCheck,
  Rocket,
  EyeOff,
  Flame,
  Award,
  FileCheck,
  ShoppingBag
} from "lucide-react"
import { UserProfile } from "@/lib/linkedin-data"

interface LinkedInNavbarProps {
  activeTab:
    | 'home'
    | 'network'
    | 'jobs'
    | 'learning'
    | 'pulserooms'
    | 'peerreview'
    | 'compensation'
    | 'marketplace'
    | 'launchpad'
    | 'watercooler'
    | 'advisory'
    | 'startups'
    | 'careersuite'
    | 'messaging'
    | 'notifications'
    | 'profile'
  onSelectTab: (
    tab:
      | 'home'
      | 'network'
      | 'jobs'
      | 'learning'
      | 'pulserooms'
      | 'peerreview'
      | 'compensation'
      | 'marketplace'
      | 'launchpad'
      | 'watercooler'
      | 'advisory'
      | 'startups'
      | 'careersuite'
      | 'messaging'
      | 'notifications'
      | 'profile'
  ) => void
  user: UserProfile
  unreadMessagesCount: number
  networkInvitesCount: number
  searchQuery: string
  onSearchChange: (q: string) => void
}

export function LinkedInNavbar({
  activeTab,
  onSelectTab,
  user,
  unreadMessagesCount,
  networkInvitesCount,
  searchQuery,
  onSearchChange
}: LinkedInNavbarProps) {
  const [isMeOpen, setIsMeOpen] = useState(false)
  const [isAppsOpen, setIsAppsOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleTheme = () => {
    const next = !isDarkMode
    setIsDarkMode(next)
    if (next) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, badge: 0 },
    { id: 'network', label: 'Network', icon: Users, badge: networkInvitesCount },
    { id: 'jobs', label: 'Jobs', icon: Briefcase, badge: 0 },
    { id: 'marketplace', label: 'Marketplace 🛍️', icon: ShoppingBag, badge: 0, isMarketplace: true },
    { id: 'pulserooms', label: 'Pulse 📰', icon: Radio, badge: 1 },
    { id: 'peerreview', label: 'Peer Review ⭐', icon: Layers, badge: 0 },
    { id: 'compensation', label: 'Pricing/Comp 💰', icon: DollarSign, badge: 0 },
    { id: 'learning', label: 'Learning 🎓', icon: GraduationCap, badge: 0 },
    { id: 'messaging', label: 'Messaging 💬', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'notifications', label: 'Notifications 🔔', icon: Bell, badge: 3 }
  ] as const

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 shadow-xs">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-2 sm:px-4 lg:px-6">
        {/* Left Side: Brand Logo & Search Bar */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xs sm:max-w-sm">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-1.5 focus:outline-none group shrink-0"
            title="ConnectIn Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#0052cc] via-[#0070f3] to-[#00c6ff] text-white font-black text-lg tracking-tight shadow-md shadow-sky-500/25 transition-transform group-hover:scale-105">
              E
            </div>
            <span className="hidden xl:inline-block font-extrabold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
              Connect<span className="text-[#0A66C2]">In</span>
            </span>
          </button>

          {/* Search Box */}
          <div className="relative flex-1">
            <div
              className={`flex items-center gap-2 rounded-md bg-[#EDF3F8] px-2.5 py-1.5 transition-all dark:bg-zinc-800/80 ${
                isSearchFocused ? "ring-2 ring-[#0A66C2] bg-white shadow-xs dark:bg-zinc-900" : ""
              }`}
            >
              <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              <input
                type="text"
                placeholder="Search products, people, jobs..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="rounded-full p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Center/Right Navigation Icons */}
        <nav className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative flex min-w-[48px] sm:min-w-[56px] lg:min-w-[62px] flex-col items-center justify-center py-1 text-xs transition-all group ${
                  isActive
                    ? "text-[#0A66C2] font-semibold border-b-2 border-[#0A66C2]"
                    : item.isMarketplace
                    ? "text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                <div className="relative">
                  <Icon className={`h-4.5 w-4.5 sm:h-5 sm:w-5 transition-transform group-hover:scale-110 ${
                    isActive ? "text-[#0A66C2]" : item.isMarketplace ? "text-purple-600 dark:text-purple-400" : ""
                  }`} />
                  {item.badge > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline-block text-[10px] lg:text-[11px] mt-0.5 truncate max-w-[70px]">
                  {item.label}
                </span>
              </button>
            )
          })}

          {/* "Me" Profile Menu Dropdown */}
          <div className="relative ml-1">
            <button
              onClick={() => setIsMeOpen(!isMeOpen)}
              className={`flex min-w-[50px] flex-col items-center justify-center py-1 text-xs transition-colors ${
                activeTab === 'profile'
                  ? "text-[#0A66C2] font-semibold border-b-2 border-[#0A66C2]"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              <div className="relative h-5 w-5 rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-700">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="hidden sm:flex items-center gap-0.5 text-[11px] mt-0.5">
                Me <ChevronDown className="h-3 w-3" />
              </span>
            </button>

            {/* Dropdown Menu Modal/Popover */}
            {isMeOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsMeOpen(false)}
                />
                <div className="absolute right-0 top-12 z-40 w-72 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95">
                  <div className="flex items-start gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-[#0A66C2]/20"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-semibold text-sm text-zinc-900 truncate dark:text-zinc-100">
                          {user.name}
                        </p>
                        <ShieldCheck className="h-4 w-4 text-[#0A66C2] shrink-0" />
                      </div>
                      <p className="text-xs text-zinc-500 truncate dark:text-zinc-400">
                        {user.headline}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onSelectTab('profile')
                        setIsMeOpen(false)
                      }}
                      className="w-full rounded-full border border-[#0A66C2] py-1 text-center text-xs font-semibold text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors"
                    >
                      View Full Profile
                    </button>
                  </div>

                  <div className="mt-3 space-y-1 border-t border-zinc-100 pt-2 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
                    <p className="px-2 py-1 font-semibold text-zinc-900 dark:text-zinc-100 text-[11px] uppercase tracking-wider">
                      Account & Access
                    </p>
                    <button
                      onClick={() => {
                        onSelectTab('profile')
                        setIsMeOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <UserCheck className="h-4 w-4 text-zinc-500" />
                      <span>Settings & Privacy</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectTab('network')
                        setIsMeOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Bookmark className="h-4 w-4 text-zinc-500" />
                      <span>Saved Posts & Articles</span>
                    </button>
                    <button
                      onClick={() => setIsMeOpen(false)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="hidden md:flex h-7 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />

          {/* ConnectIn Ecosystem Super-Menu Launcher */}
          <div className="relative">
            <button
              onClick={() => setIsAppsOpen(!isAppsOpen)}
              className="hidden md:flex flex-col items-center justify-center min-w-[50px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 cursor-pointer focus:outline-none"
            >
              <Grid3X3 className="h-5 w-5" />
              <span className="flex items-center gap-0.5 text-[11px] mt-0.5">
                Ecosystem <ChevronDown className="h-3 w-3" />
              </span>
            </button>

            {isAppsOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsAppsOpen(false)}
                />
                <div className="absolute right-0 top-12 z-40 w-80 rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 space-y-3">
                  <div className="border-b border-zinc-100 pb-2 dark:border-zinc-800">
                    <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                      ConnectIn Super-App Ecosystem
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Tools inspired by Product Hunt, Blind, Toptal, Wellfound & Bento
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => {
                        onSelectTab('careersuite')
                        setIsAppsOpen(false)
                      }}
                      className="col-span-2 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-2.5 text-left hover:border-[#0A66C2] dark:border-blue-900/50 dark:bg-blue-950/40 transition-all flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-[#0A66C2] dark:text-sky-300 flex items-center gap-1.5">
                          <FileCheck className="h-4 w-4 text-[#0A66C2]" />
                          Expedite CareerSuite™ (AI Resume & ATS)
                        </span>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Profile Maximizer, Resume Tailor & Job Tracker (tuhousing.vercel.app)
                        </p>
                      </div>
                      <span className="rounded-full bg-[#0A66C2] px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                        AI Suite
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectTab('launchpad')
                        setIsAppsOpen(false)
                      }}
                      className="rounded-xl border border-zinc-100 p-2.5 text-left hover:border-orange-500 hover:bg-orange-50/50 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-all"
                    >
                      <span className="font-bold text-orange-600 flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 fill-orange-500" /> Launchpad
                      </span>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Product Hunt daily launches & upvotes</p>
                    </button>

                    <button
                      onClick={() => {
                        onSelectTab('watercooler')
                        setIsAppsOpen(false)
                      }}
                      className="rounded-xl border border-zinc-100 p-2.5 text-left hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-all"
                    >
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <EyeOff className="h-3.5 w-3.5" /> Watercooler
                      </span>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Blind anonymous verified comp intel</p>
                    </button>

                    <button
                      onClick={() => {
                        onSelectTab('advisory')
                        setIsAppsOpen(false)
                      }}
                      className="rounded-xl border border-zinc-100 p-2.5 text-left hover:border-blue-500 hover:bg-blue-50/50 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-all"
                    >
                      <span className="font-bold text-[#0A66C2] flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-amber-500" /> Advisory
                      </span>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Toptal 1:1 fractional CISO/CTO slots</p>
                    </button>

                    <button
                      onClick={() => {
                        onSelectTab('startups')
                        setIsAppsOpen(false)
                      }}
                      className="rounded-xl border border-zinc-100 p-2.5 text-left hover:border-purple-500 hover:bg-purple-50/50 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-all"
                    >
                      <span className="font-bold text-purple-600 flex items-center gap-1">
                        <Rocket className="h-3.5 w-3.5" /> Startups
                      </span>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Wellfound equity % & direct founder DM</p>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Try Premium Pill */}
          <button
            onClick={() => onSelectTab('learning')}
            className="hidden lg:flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 border border-amber-200/80 hover:bg-amber-100 transition-colors dark:bg-amber-950/40 dark:border-amber-700/50 dark:text-amber-300"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Try Premium for $0</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
