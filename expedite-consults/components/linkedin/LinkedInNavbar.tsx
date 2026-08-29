"use client"

import React, { useState, useEffect } from "react"
import {
  Search,
  House,
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  Grid3X3,
  Award,
  Radio,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Sun,
  Moon,
  Bookmark,
  LogOut,
  UserCheck,
  Building,
  ShieldCheck,
  Layers,
  ShoppingBag,
  Flame,
  EyeOff,
  Rocket,
  FileCheck,
  X,
  GraduationCap,
  Store,
  DollarSign,
  Calendar,
  Shield,
  Building2,
  Lock,
  Wrench,
  Bot,
  Zap,
  Tv
} from "lucide-react"
import { UserProfile } from "@/lib/linkedin-data"

interface LinkedInNavbarProps {
  user: UserProfile
  activeTab: string
  onSelectTab: (tabId: string) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  unreadMessagesCount?: number
  unreadNotificationsCount?: number
  onOpenAIAssistant?: () => void
  onOpenUniversalSearch?: () => void
  activeWorkspace?: 'personal' | 'enterprise' | 'creator' | 'seller'
  onSelectWorkspace?: (ws: 'personal' | 'enterprise' | 'creator' | 'seller') => void
}

export function LinkedInNavbar({
  user,
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  unreadMessagesCount = 1,
  unreadNotificationsCount = 3,
  onOpenAIAssistant,
  onOpenUniversalSearch,
  activeWorkspace = 'personal',
  onSelectWorkspace
}: LinkedInNavbarProps) {
  const [isMeOpen, setIsMeOpen] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark")
      setIsDarkMode(isDark)
    }
  }, [])

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      const root = document.documentElement
      if (root.classList.contains("dark")) {
        root.classList.remove("dark")
        setIsDarkMode(false)
      } else {
        root.classList.add("dark")
        setIsDarkMode(true)
      }
    }
  }

  // Streamlined Clean Primary Navigation
  const primaryNavItems = [
    { id: "home", label: "Home", icon: House, badge: 0 },
    { id: "network", label: "Network", icon: Users, badge: 2 },
    { id: "jobs", label: "Jobs", icon: Briefcase, badge: 0 },
    { id: "marketplace", label: "Marketplace 🛍️", icon: ShoppingBag, badge: 0, isMarketplace: true },
    { id: "media", label: "Media 🎥", icon: Tv, badge: 0 },
    { id: "pulserooms", label: "Pulse 📰", icon: Radio, badge: 1 },
    { id: "learning", label: "Learning 🎓", icon: GraduationCap, badge: 0 },
    { id: "messaging", label: "Messages 💬", icon: MessageSquare, badge: unreadMessagesCount },
  ]

  const moreMenuItems = [
    { id: "aiagents", label: "🤖 AI Agents Marketplace", desc: "Discover, test & deploy autonomous agents" },
    { id: "code", label: "🧑‍💻 ConnectIn Code & Repos", desc: "GitHub sync & recruit by verified code" },
    { id: "wallet", label: "💳 Pay, Wallet & Invoicing", desc: "$2,430 Balance, Escrow & SOWs" },
    { id: "missions", label: "🔥 Career Missions & Journey", desc: "Trackable progression & XP (72%)" },
    { id: "procurement", label: "🏢 Corporate Procurement & RFPs", desc: "$2.4M enterprise spend & bids" },
    { id: "collaboration", label: "🤝 Co-Founders & Ideas Incubator", desc: "Crowdsource, build & co-found" },
    { id: "mentorship", label: "👨‍🏫 Mentorship & Creator Economy", desc: "1:1 CISO bookings & brand briefs" },
    { id: "labs", label: "🧪 Interactive Security Labs", desc: "Firecracker microVM sandboxes" },
    { id: "marketplace", label: "🎯 Solutions Hub", desc: "Outcome packages & blueprints" },
    { id: "company", label: "🏢 Company Page (Expedite Consults)", desc: "Enterprise corporate hub" },
    { id: "sellercenter", label: "💼 Seller Center", desc: "Manage products, sales & escrow" },
    { id: "trustcenter", label: "🛡️ Trust Center", desc: "SOC 2, FedRAMP & security telemetry" },
    { id: "events", label: "📅 Events & Demos", desc: "Webinars & live teardowns" },
    { id: "peerreview", label: "⭐ Peer Review", desc: "Verified expert validation platform" },
    { id: "compensation", label: "💰 Compensation", desc: "Salary benchmarks & contractor rates" },
    { id: "ecosystem", label: "🌐 Ecosystem Platform", desc: "Developers API/SDKs & multi-cloud" },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 shadow-xs">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-2 sm:px-4 lg:px-6 gap-2">
        {/* Left Side: Brand Logo & Global Search */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xs sm:max-w-sm shrink-0">
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

          {/* Search Input Box (Clicks open Universal Omnisearch) */}
          <div className="relative flex-1">
            <div
              onClick={() => onOpenUniversalSearch && onOpenUniversalSearch()}
              className={`flex items-center gap-2 rounded-md bg-[#EDF3F8] px-2.5 py-1.5 transition-all dark:bg-zinc-800/80 cursor-pointer ${
                isSearchFocused ? "ring-2 ring-[#0A66C2] bg-white shadow-xs dark:bg-zinc-900" : ""
              }`}
            >
              <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              <input
                type="text"
                placeholder="Universal Search (people, jobs, tools, RFPs...)"
                value={searchQuery}
                readOnly
                className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400 cursor-pointer"
              />
              <span className="text-[9px] font-mono bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300 font-bold hidden sm:inline">⌘K</span>
            </div>
          </div>
        </div>

        {/* Center Primary Navigation Tabs */}
        <nav className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-none py-1">
          {primaryNavItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative flex min-w-[48px] sm:min-w-[56px] lg:min-w-[62px] flex-col items-center justify-center py-1 text-xs transition-all group shrink-0 ${
                  isActive
                    ? "text-[#0A66C2] font-semibold border-b-2 border-[#0A66C2]"
                    : item.isMarketplace
                    ? "text-purple-600 dark:text-purple-400 font-bold hover:text-purple-700"
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
        </nav>

        {/* Right Side Controls (More Dropdown + AI Assistant + Notifications + Me Profile + Theme) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-1">
          {/* "More ▾" Dropdown Menu (Outside scroll container so never clipped!) */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setIsMoreOpen(!isMoreOpen)
                setIsMeOpen(false)
              }}
              className={`flex min-w-[44px] flex-col items-center justify-center py-1 text-xs transition-colors cursor-pointer ${
                isMoreOpen
                  ? "text-[#0A66C2] font-bold"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
              title="More Modules & Hubs"
            >
              <Grid3X3 className="h-4.5 w-4.5" />
              <span className="flex items-center gap-0.5 text-[10px] lg:text-[11px] mt-0.5 font-medium">
                More <ChevronDown className="h-3 w-3" />
              </span>
            </button>

            {isMoreOpen && (
              <>
                <div className="fixed inset-0 z-50 bg-black/10" onClick={() => setIsMoreOpen(false)} />
                <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 space-y-2">
                  <div className="border-b border-zinc-100 pb-2 dark:border-zinc-800">
                    <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                      ConnectIn Modules &amp; Hubs
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      Enterprise Solutions, Company Pages &amp; Trust Operations
                    </p>
                  </div>

                  <div className="space-y-1 max-h-[70vh] overflow-y-auto">
                    {moreMenuItems.map((menu) => (
                      <button
                        key={menu.id + menu.label}
                        onClick={() => {
                          onSelectTab(menu.id)
                          setIsMoreOpen(false)
                        }}
                        className="w-full rounded-xl p-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2]">
                            {menu.label}
                          </p>
                          <p className="text-[10px] text-zinc-400">{menu.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          {/* ConnectIn AI Launcher Button */}
          <button
            onClick={onOpenAIAssistant}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all"
            title="Open ConnectIn AI Assistant"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">ConnectIn AI</span>
          </button>

          {/* Notifications Tab Button */}
          <button
            onClick={() => onSelectTab('notifications')}
            className={`relative flex min-w-[40px] flex-col items-center justify-center py-1 text-xs transition-colors ${
              activeTab === 'notifications'
                ? "text-[#0A66C2] font-semibold"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
            title="Notifications"
          >
            <div className="relative">
              <Bell className="h-4.5 w-4.5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs">
                  {unreadNotificationsCount}
                </span>
              )}
            </div>
            <span className="hidden lg:inline text-[10px] mt-0.5">Alerts</span>
          </button>

          {/* "Me" Profile Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsMeOpen(!isMeOpen)
                setIsMoreOpen(false)
              }}
              className={`flex min-w-[45px] flex-col items-center justify-center py-1 text-xs transition-colors cursor-pointer ${
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
              <span className="hidden sm:flex items-center gap-0.5 text-[10px] mt-0.5">
                Me <ChevronDown className="h-3 w-3" />
              </span>
            </button>

            {/* Dropdown Menu Modal/Popover */}
            {isMeOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMeOpen(false)}
                />
                <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95">
                  <div className="flex items-start gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-[#0A66C2]/20 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-bold text-sm text-zinc-900 truncate dark:text-zinc-100">
                          {user.name}
                        </p>
                        <ShieldCheck className="h-4 w-4 text-[#0A66C2] shrink-0" />
                      </div>
                      <p className="text-xs text-zinc-500 truncate dark:text-zinc-400">
                        {user.headline}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 space-y-1.5">
                    <p className="px-2 py-0.5 font-bold text-zinc-900 dark:text-zinc-100 text-[10px] uppercase tracking-wider font-mono">
                      Active Workspace Switcher
                    </p>

                    {/* 4 Persona Cards */}
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <button
                        onClick={() => {
                          if (onSelectWorkspace) onSelectWorkspace('personal')
                          onSelectTab('home')
                          setIsMeOpen(false)
                        }}
                        className={`p-2 rounded-xl text-left border transition-all ${
                          activeWorkspace === 'personal'
                            ? "bg-blue-50 border-[#0A66C2] text-[#0A66C2] font-bold dark:bg-blue-950/40 dark:border-blue-700"
                            : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        <p className="font-bold text-[11px]">👤 Personal</p>
                        <p className="text-[9px] opacity-70">Feed, Jobs &amp; Labs</p>
                      </button>

                      <button
                        onClick={() => {
                          if (onSelectWorkspace) onSelectWorkspace('enterprise')
                          onSelectTab('procurement')
                          setIsMeOpen(false)
                        }}
                        className={`p-2 rounded-xl text-left border transition-all ${
                          activeWorkspace === 'enterprise'
                            ? "bg-emerald-50 border-emerald-600 text-emerald-700 font-bold dark:bg-emerald-950/40 dark:border-emerald-700"
                            : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        <p className="font-bold text-[11px]">🏢 Enterprise</p>
                        <p className="text-[9px] opacity-70">$2.4M Spend Desk</p>
                      </button>

                      <button
                        onClick={() => {
                          if (onSelectWorkspace) onSelectWorkspace('creator')
                          onSelectTab('media')
                          setIsMeOpen(false)
                        }}
                        className={`p-2 rounded-xl text-left border transition-all ${
                          activeWorkspace === 'creator'
                            ? "bg-purple-50 border-purple-600 text-purple-700 font-bold dark:bg-purple-950/40 dark:border-purple-700"
                            : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        <p className="font-bold text-[11px]">🎬 Studio</p>
                        <p className="text-[9px] opacity-70">Video &amp; Podcasts</p>
                      </button>

                      <button
                        onClick={() => {
                          if (onSelectWorkspace) onSelectWorkspace('seller')
                          onSelectTab('sellercenter')
                          setIsMeOpen(false)
                        }}
                        className={`p-2 rounded-xl text-left border transition-all ${
                          activeWorkspace === 'seller'
                            ? "bg-amber-50 border-amber-600 text-amber-700 font-bold dark:bg-amber-950/40 dark:border-amber-700"
                            : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        <p className="font-bold text-[11px]">💼 Seller</p>
                        <p className="text-[9px] opacity-70">$122.7K MRR</p>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        onSelectTab('profile')
                        setIsMeOpen(false)
                      }}
                      className="w-full rounded-xl bg-[#0A66C2] py-2 text-center text-xs font-bold text-white hover:bg-[#004182] transition-colors shadow-xs mt-2"
                    >
                      View Unified Profile &amp; Portfolio 📁
                    </button>
                  </div>

                  <div className="mt-3 space-y-1 border-t border-zinc-100 pt-2 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
                    <p className="px-2 py-1 font-bold text-zinc-900 dark:text-zinc-100 text-[11px] uppercase tracking-wider">
                      Verified Identity Roles
                    </p>
                    <div className="px-2 text-[11px] text-zinc-500 space-y-0.5">
                      <p>• Professional: Cloud Security Architect</p>
                      <p>• Clearance: TS/SCI with Polygraph</p>
                      <p>• Seller: AXIOM Suite &amp; Expedite Strike</p>
                    </div>
                    <button
                      onClick={() => setIsMeOpen(false)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold mt-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
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
        </div>
      </div>
    </header>
  )
}
