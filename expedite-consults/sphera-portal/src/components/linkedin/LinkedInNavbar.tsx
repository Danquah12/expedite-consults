"use client"

import React, { useState, useEffect, useRef } from "react"
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
  Tv,
  Key,
  ExternalLink
} from "lucide-react"
import { UserProfile, SuggestedConnection } from "@/lib/linkedin-data"
import { ConnectInLogo } from "@/components/brand/ConnectInLogo"
import { isSuperAdminUser } from "@/lib/connectin-profile"
import { getCategorizedMoreMenu, getEnclaveSearchPlaceholder, getEnclaveModules } from "@/lib/connectin-navbar-data"
import { findEnclaveById } from "@/lib/connectin-professions"
import { ThemeColorSwitcher } from "@/components/theme/ThemeColorSwitcher"
import { LanguageSwitcher } from "@/components/language/LanguageSwitcher"
import { useLanguage } from "@/context/LanguageContext"

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
  onOpenAuthModal?: () => void
  onSignOut?: () => void
  activeWorkspace?: 'personal' | 'enterprise' | 'creator' | 'seller'
  onSelectWorkspace?: (ws: 'personal' | 'enterprise' | 'creator' | 'seller') => void
  suggestedPeople?: SuggestedConnection[]
  onToggleConnect?: (personId: string) => void
  onOpenVideoGuide?: () => void
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
  onOpenAuthModal,
  onSignOut,
  activeWorkspace = 'personal',
  onSelectWorkspace,
  suggestedPeople = [],
  onToggleConnect,
  onOpenVideoGuide
}: LinkedInNavbarProps) {
  const [isMeOpen, setIsMeOpen] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set())
  const { t } = useLanguage()

  const moreMenuRef = useRef<HTMLDivElement>(null)
  const meMenuRef = useRef<HTMLDivElement>(null)

  // Document-level click-outside and Escape key listener to close menus reliably
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (isMoreOpen && moreMenuRef.current && !moreMenuRef.current.contains(target)) {
        setIsMoreOpen(false)
      }
      if (isMeOpen && meMenuRef.current && !meMenuRef.current.contains(target)) {
        setIsMeOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMoreOpen(false)
        setIsMeOpen(false)
      }
    }

    if (isMoreOpen || isMeOpen) {
      document.addEventListener("mousedown", handleOutsideClick)
      document.addEventListener("touchstart", handleOutsideClick)
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("touchstart", handleOutsideClick)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isMoreOpen, isMeOpen])

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
    { id: "home", label: t("nav_home", "Home"), icon: House, badge: 2 },
    { id: "network", label: t("nav_network", "Network"), icon: Users, badge: 0 },
    { id: "jobs", label: t("nav_jobs", "Jobs"), icon: Briefcase, badge: 0 },
    { id: "marketplace", label: t("nav_marketplace", "Marketplace 🛍️"), icon: ShoppingBag, badge: 0, isMarketplace: true },
    { id: "media", label: t("nav_media", "Media 🎥"), icon: Tv, badge: 1 },
    { id: "pulserooms", label: t("nav_pulse", "Pulse 📰"), icon: Radio, badge: 0 },
    { id: "learning", label: t("nav_learning", "Learning 🎓"), icon: GraduationCap, badge: 1 },
    { id: "messaging", label: t("nav_messages", "Messages 💬"), icon: MessageSquare, badge: unreadMessagesCount || 1 },
  ]

  const isAdminUser = isSuperAdminUser(user)

  const categorizedMoreMenu = getCategorizedMoreMenu(user.professionEnclave, isAdminUser, user.profession)

  // Complete directory profiles (merging suggested with verified seed accounts)
  const defaultDirectory = [
    {
      id: "usr_rhoda_1",
      name: "Rhoda Mensah",
      headline: "Senior Cyber Compliance & Risk Analyst · ConnectIn Member",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      capabilities: ["FedRAMP Compliance", "NIST SP 800-53", "Zero Trust"],
      role: "Compliance Lead"
    },
    {
      id: "usr_rhoda_2",
      name: "Rhoda",
      headline: "Cybersecurity & Technology Professional · ConnectIn Member",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Rhoda&backgroundColor=0a66c2",
      capabilities: ["Cloud Security", "Enterprise IAM"],
      role: "Member"
    },
    {
      id: "usr_kwesi",
      name: "Kwesi Asiedu",
      headline: "Founder & Chief Security Officer @ Expedite Consults",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      capabilities: ["Zero Trust Architecture", "GovCloud Security", "Enterprise IAM"],
      role: "Founder & CSO"
    },
    {
      id: "usr_hayes",
      name: "Commander Robert Hayes",
      headline: "Platform IAM & Super Administrator · ConnectIn Master Control",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
      capabilities: ["SOC 2 Type II", "RBAC / ABAC", "FedRAMP High"],
      role: "Super Admin"
    },
    {
      id: "usr_alex",
      name: "Alex Taylor",
      headline: "Principal Cloud Security Architect (Fellow) @ Expedite Consults",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      capabilities: ["AWS GovCloud Security", "Kubernetes Zero Trust", "cATO"],
      role: "Principal Architect"
    },
    {
      id: "usr_marcus",
      name: "Marcus Vance",
      headline: "VP Enterprise Procurement & Spend @ Defense Systems Group",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      capabilities: ["Enterprise Procurement", "FAR / DFARS", "GovCloud RFPs"],
      role: "VP Defense"
    },
    {
      id: "usr_elena",
      name: "Dr. Elena Rostova",
      headline: "Chief AI Research Scientist | Stanford AI Lab Fellow",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      capabilities: ["AI Security", "Deterministic Sandboxing"],
      role: "AI Fellow"
    }
  ]

  // Combined searchable member pool
  const allSearchableMembers = [
    ...suggestedPeople.map(p => ({
      id: p.id,
      name: p.name,
      headline: p.headline,
      avatar: p.avatar,
      capabilities: p.capabilities || [],
      role: "Member"
    })),
    ...defaultDirectory
  ].filter((item, index, self) =>
    index === self.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase())
  ).filter(p => p.name.toLowerCase() !== (user?.name || "").toLowerCase())

  // Filter members by query
  const matchingMembers = (searchQuery.trim()
    ? allSearchableMembers.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        p.headline.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        p.capabilities?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase().trim()))
      )
    : allSearchableMembers
  ).slice(0, 4)

  // Module & Hub fast shortcuts
  const ALL_MODULES = getEnclaveModules(user.professionEnclave, isAdminUser)

  const matchingModules = searchQuery.trim()
    ? ALL_MODULES.filter(m =>
        m.label.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        m.desc.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase().trim())
      ).slice(0, 3)
    : []

  const handleConnectClick = (e: React.MouseEvent, personId: string) => {
    e.stopPropagation()
    setConnectedIds(prev => new Set(prev).add(personId))
    if (onToggleConnect) {
      onToggleConnect(personId)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 shadow-xs">
      <div className="mx-auto flex h-14 max-w-[1720px] items-center justify-between px-2 sm:px-4 lg:px-6 gap-2">
        {/* Left Side: Brand Logo & Interactive Live Search */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 relative">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center focus:outline-none group shrink-0"
            title="ConnectIn Home"
          >
            <ConnectInLogo size="sm" showSubtitle={false} />
          </button>

          {/* Interactive Search Box - Responsive Expanding Width */}
          <div className="relative w-40 sm:w-52 md:w-60 lg:w-64 xl:w-72 2xl:w-80 focus-within:w-60 sm:focus-within:w-72 md:focus-within:w-80 lg:focus-within:w-96 transition-all duration-300">
            <div
              className={`flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#EDF3F8] px-2.5 sm:px-3.5 py-1.5 sm:py-2 transition-all dark:bg-zinc-800/90 border border-zinc-200/50 dark:border-zinc-700/50 ${
                isSearchFocused ? "ring-2 ring-[#0A66C2] bg-white border-[#0A66C2] shadow-md dark:bg-zinc-900" : "hover:bg-[#E2ECF3] dark:hover:bg-zinc-800"
              }`}
            >
              <Search className="h-4 w-4 text-zinc-500 shrink-0" />
              <input
                type="text"
                placeholder={t("search_placeholder", getEnclaveSearchPlaceholder(user.professionEnclave))}
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value)
                  setIsSearchFocused(true)
                }}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onOpenUniversalSearch && onOpenUniversalSearch()
                    setIsSearchFocused(false)
                  }
                }}
                className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {/* Dedicated Search Action Button */}
              <button
                type="button"
                onClick={() => {
                  onOpenUniversalSearch && onOpenUniversalSearch()
                  setIsSearchFocused(false)
                }}
                className="rounded-full bg-[#0A66C2] text-white px-2.5 sm:px-3 py-1 text-xs font-bold hover:bg-[#004182] transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                title="Search platform"
              >
                <Search className="h-3 w-3" />
                <span className="hidden sm:inline">{t("search_button", "Search")}</span>
              </button>
            </div>

            {/* Live Autocomplete Popover Dropdown */}
            {isSearchFocused && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/10 backdrop-blur-2xs"
                  onClick={() => setIsSearchFocused(false)}
                />
                <div className="absolute left-0 top-11 sm:top-12 z-50 w-[calc(100vw-24px)] sm:w-[480px] lg:w-[540px] max-w-[92vw] rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 space-y-2.5 max-h-[80vh] overflow-y-auto">
                  {/* Header info */}
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                    <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-[#0A66C2]" />
                      {searchQuery.trim() ? `Results for "${searchQuery}"` : "Suggested Members & Discovery"}
                    </span>
                    <button
                      onClick={() => setIsSearchFocused(false)}
                      className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      Close ✕
                    </button>
                  </div>

                  {/* Matching People Section */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                      People &amp; Profiles
                    </p>
                    {matchingMembers.length > 0 ? (
                      <div className="space-y-1">
                        {matchingMembers.map((member) => {
                          const isConnected = connectedIds.has(member.id)
                          return (
                            <div
                              key={member.id}
                              onClick={() => {
                                onSelectTab('network')
                                setIsSearchFocused(false)
                              }}
                              className="group flex items-center justify-between gap-2 rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={member.avatar}
                                  alt=""
                                  className="h-8 w-8 rounded-full object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1">
                                    <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] truncate">
                                      {member.name}
                                    </p>
                                    <ShieldCheck className="h-3 w-3 text-[#0A66C2] shrink-0" />
                                  </div>
                                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                                    {member.headline}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => handleConnectClick(e, member.id)}
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 transition-all ${
                                  isConnected
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                    : "bg-[#0A66C2] text-white hover:bg-[#004182]"
                                }`}
                              >
                                {isConnected ? t("sent", "✓ Sent") : t("connect", "Connect")}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="p-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
                        {t("no_members_found", `No members matching "${searchQuery}". Try Omnisearch below.`)}
                      </div>
                    )}
                  </div>

                  {/* Matching Modules Section */}
                  {matchingModules.length > 0 && (
                    <div className="space-y-1.5 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                        {t("hubs_and_modules", "Platform Hubs & Modules")}
                      </p>
                      <div className="space-y-1">
                        {matchingModules.map((mod) => (
                          <button
                            key={mod.id}
                            type="button"
                            onClick={() => {
                              if (mod.url) {
                                window.open(mod.url, '_blank', 'noopener,noreferrer')
                              } else {
                                onSelectTab(mod.id)
                              }
                              setIsSearchFocused(false)
                            }}
                            className="w-full flex items-center justify-between rounded-xl p-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-base shrink-0">{mod.icon}</span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] truncate">
                                    {mod.label}
                                  </p>
                                  {mod.badge && (
                                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 shrink-0">
                                      {mod.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-zinc-400 truncate">{mod.desc}</p>
                              </div>
                            </div>
                            {mod.url ? (
                              <ExternalLink className="h-3.5 w-3.5 text-zinc-400 group-hover:text-[#0A66C2] shrink-0" />
                            ) : (
                              <span className="text-xs text-zinc-400 group-hover:text-[#0A66C2] shrink-0">→</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Omnisearch Action CTA */}
                  <div className="border-t border-zinc-100 pt-2 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        onOpenUniversalSearch && onOpenUniversalSearch()
                        setIsSearchFocused(false)
                      }}
                      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-2 text-center text-xs font-bold text-white shadow-xs hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Search className="h-3.5 w-3.5" />
                      <span>
                        {searchQuery.trim()
                          ? t("search_all_results", `Search all results for "${searchQuery}" in Omnisearch →`).replace("{query}", searchQuery)
                          : t("search_open_omnisearch", "Open Universal Omnisearch Directory →")}
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center Primary Navigation Tabs */}
        <nav className="flex items-center gap-0.5 sm:gap-1 shrink-0 py-1">
          {primaryNavItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative flex min-w-[42px] sm:min-w-[48px] lg:min-w-[56px] xl:min-w-[62px] flex-col items-center justify-center py-1 px-1 sm:px-1.5 text-xs transition-all group shrink-0 cursor-pointer ${
                  isActive
                    ? "text-[#0A66C2] font-semibold border-b-2 border-[#0A66C2]"
                    : item.isMarketplace
                    ? "text-purple-600 dark:text-purple-400 font-bold hover:text-purple-700"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
                title={item.label}
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
                <span className="hidden md:inline-block text-[10px] xl:text-[11px] mt-0.5 truncate max-w-[70px]">
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Right Side Controls (More Dropdown + AI Assistant + Notifications + Me Profile + Theme) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-1">
          {/* "More ▾" Dropdown Menu (Outside scroll container so never clipped!) */}
          <div ref={moreMenuRef} className="relative shrink-0">
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
                {t("nav_more", "More")} <ChevronDown className="h-3 w-3" />
              </span>
            </button>

            {isMoreOpen && (
              <>
                <div className="fixed inset-0 z-50 bg-black/10" onClick={() => setIsMoreOpen(false)} />
                <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 space-y-2">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                    <div>
                      <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {t("connectin_modules_hubs", "ConnectIn Modules & Hubs")}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {t("enterprise_solutions_desc", "Enterprise Solutions, Company Pages & Trust Operations")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMoreOpen(false)}
                      className="rounded-full p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
                      title="Close"
                      aria-label="Close menu"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                    {categorizedMoreMenu.map((group) => (
                      <div key={group.category} className="space-y-1">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2">
                          {group.category}
                        </p>
                        <div className="space-y-0.5">
                          {group.items.map((menu) => (
                            <button
                              key={menu.id + menu.label}
                              onClick={() => {
                                if (menu.url) {
                                  window.open(menu.url, '_blank', 'noopener,noreferrer')
                                } else {
                                  onSelectTab(menu.id)
                                }
                                setIsMoreOpen(false)
                              }}
                              className="w-full rounded-xl p-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between group cursor-pointer"
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] truncate">
                                    {menu.label}
                                  </p>
                                  {menu.badge && (
                                    <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 shrink-0">
                                      {menu.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-zinc-400 truncate">{menu.desc}</p>
                              </div>
                              {menu.url && (
                                <ExternalLink className="h-3.5 w-3.5 text-zinc-400 group-hover:text-[#0A66C2] shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Vibe AI Global Assistant Launcher Button - LinkedIn Premium Styling */}
          <button
            onClick={onOpenAIAssistant}
            className="group flex items-center gap-1 sm:gap-1.5 rounded-full bg-[#FBF5E9] hover:bg-[#F5EAD2] dark:bg-amber-950/30 dark:hover:bg-amber-950/50 text-[#7A4B00] dark:text-amber-200 border border-[#C88A24]/40 dark:border-amber-700/50 px-2.5 sm:px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all shrink-0 cursor-pointer"
            title="Ask Vibe AI — Interactive Q&A, Campus Intelligence & Answers"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#C88A24] dark:text-amber-300 transition-transform group-hover:scale-110 shrink-0" />
            <span className="hidden sm:inline">Vibe AI</span>
            <span className="sm:hidden font-semibold">Vibe</span>
            <span className="hidden md:inline rounded bg-amber-200/60 dark:bg-amber-900/60 px-1.5 py-0.2 text-[9px] font-bold text-[#5C3800] dark:text-amber-100">
              Q&amp;A
            </span>
          </button>

          {/* Interactive User Video Guide Launcher */}
          {onOpenVideoGuide && (
            <button
              onClick={onOpenVideoGuide}
              className="group flex items-center gap-1 sm:gap-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300/40 dark:border-indigo-700/50 px-2 sm:px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all shrink-0 cursor-pointer"
              title="Watch ConnectIn Interactive Video Guide & Masterclasses"
            >
              <GraduationCap className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110 shrink-0" />
              <span className="hidden sm:inline">Guide</span>
              <span className="hidden md:inline rounded bg-indigo-200/60 dark:bg-indigo-900/60 px-1.5 py-0.2 text-[9px] font-bold text-indigo-800 dark:text-indigo-200">
                Videos
              </span>
            </button>
          )}

          {/* Notifications Tab Button */}
          <button
            onClick={() => onSelectTab('notifications')}
            className={`relative flex min-w-[38px] sm:min-w-[42px] flex-col items-center justify-center py-1 text-xs transition-colors shrink-0 cursor-pointer ${
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
            <span className="hidden sm:inline text-[10px] mt-0.5">Alerts</span>
          </button>

          {/* "Me" Profile Menu Dropdown */}
          <div ref={meMenuRef} className="relative shrink-0">
            <button
              onClick={() => {
                setIsMeOpen(!isMeOpen)
                setIsMoreOpen(false)
              }}
              className={`flex min-w-[42px] sm:min-w-[48px] flex-col items-center justify-center py-1 text-xs transition-colors cursor-pointer shrink-0 ${
                activeTab === 'profile'
                  ? "text-[#0A66C2] font-semibold border-b-2 border-[#0A66C2]"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
              title={`${user.name} (Me)`}
            >
              <div className="relative h-5 w-5 rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-700 shrink-0">
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
                  <div className="flex items-start justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
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
                        {user.professionEnclave && (() => {
                          const enc = findEnclaveById(user.professionEnclave)
                          return (
                            <div className="mt-1 flex items-center gap-1">
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {enc?.icon || '🛡️'} {enc?.shortName || enc?.name || 'Verified Enclave'}
                              </span>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMeOpen(false)}
                      className="rounded-full p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ml-1 shrink-0 cursor-pointer"
                      title="Close"
                      aria-label="Close profile menu"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="pt-2 space-y-1.5">
                    <p className="px-2 py-0.5 font-bold text-zinc-900 dark:text-zinc-100 text-[10px] uppercase tracking-wider font-mono">
                      {t("active_workspace_switcher", "Active Workspace Switcher")}
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
                        <p className="font-bold text-[11px]">👤 {t("workspace_personal", "Personal")}</p>
                        <p className="text-[9px] opacity-70">{t("workspace_personal_desc", "Feed, Jobs & Labs")}</p>
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
                        <p className="font-bold text-[11px]">🏢 {t("workspace_enterprise", "Enterprise")}</p>
                        <p className="text-[9px] opacity-70">{t("workspace_enterprise_desc", "$2.4M Spend Desk")}</p>
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
                        <p className="font-bold text-[11px]">🎬 {t("workspace_studio", "Studio")}</p>
                        <p className="text-[9px] opacity-70">{t("workspace_studio_desc", "Video & Podcasts")}</p>
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
                        <p className="font-bold text-[11px]">💼 {t("workspace_seller", "Seller")}</p>
                        <p className="text-[9px] opacity-70">{t("workspace_seller_desc", "$122.7K MRR")}</p>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        onSelectTab('profile')
                        setIsMeOpen(false)
                      }}
                      className="w-full rounded-xl bg-[#0A66C2] py-2 text-center text-xs font-bold text-white hover:bg-[#004182] transition-colors shadow-xs mt-2"
                    >
                      {t("view_unified_profile", "View Unified Profile & Portfolio 📁")}
                    </button>

                    {isAdminUser ? (
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <button
                          onClick={() => {
                            onSelectTab('accountsecurity')
                            setIsMeOpen(false)
                          }}
                          className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-1.5 text-center text-[11px] font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100"
                        >
                          {t("security_keys", "🔐 Security & Keys")}
                        </button>
                        <button
                          onClick={() => {
                            onSelectTab('adminiam')
                            setIsMeOpen(false)
                          }}
                          className="rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50/50 dark:bg-red-950/40 p-1.5 text-center text-[11px] font-bold text-red-700 dark:text-red-300 hover:bg-red-100"
                        >
                          {t("admin_console", "🛡️ Admin Console")}
                        </button>
                      </div>
                    ) : (
                      <div className="pt-1">
                        <button
                          onClick={() => {
                            onSelectTab('accountsecurity')
                            setIsMeOpen(false)
                          }}
                          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2 text-center text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 transition-colors"
                        >
                          {t("account_security_passkeys", "🔐 Account Security & Passkeys")}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 space-y-1 border-t border-zinc-100 pt-2 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
                    <p className="px-2 py-1 font-bold text-zinc-900 dark:text-zinc-100 text-[11px] uppercase tracking-wider">
                      {t("verified_identity_status", "Verified Identity Status")}
                    </p>
                    <div className="px-2 text-[11px] text-zinc-500 space-y-0.5">
                      <p>• {t("role_label", "Role")}: <span className="font-semibold text-zinc-700 dark:text-zinc-200 capitalize">{(user as any).role || "personal"}</span></p>
                      <p>• {t("clearance_label", "Clearance")}: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{(user as any).clearanceLevel || "Level 2 Verified Identity"}</span></p>
                      <p>• {t("verification_label", "Verification")}: <span className="text-emerald-600 font-semibold">FIDO2 / Zero-Trust Active ✓</span></p>
                    </div>

                    {isAdminUser && onOpenAuthModal && (
                      <button
                        onClick={() => {
                          onOpenAuthModal()
                          setIsMeOpen(false)
                        }}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-2 text-xs font-bold shadow-xs hover:opacity-90 transition-all mt-2 cursor-pointer"
                      >
                        <Key className="h-3.5 w-3.5 text-amber-300" />
                        <span>{t("switch_persona_gate", "Switch Persona / Auth Gate 🔑")}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsMeOpen(false)
                        if (onSignOut) {
                          onSignOut()
                        } else {
                          window.location.href = '/connectin-login'
                        }
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold mt-1.5 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t("sign_out", "Sign Out")}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Auth / Role Gate Button */}
          {isAdminUser && onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-2.5 sm:px-3 py-1.5 text-xs font-bold shadow-xs hover:opacity-90 transition-all shrink-0 cursor-pointer"
              title="Access Role Gate & Persona Switcher"
            >
              <Key className="h-3.5 w-3.5 text-amber-300 dark:text-amber-500 shrink-0" />
              <span className="hidden sm:inline">Auth / Role Gate</span>
              <span className="sm:hidden text-[10px]">Gate</span>
            </button>
          )}

          {/* Theme & Background Color Switcher Popover */}
          <div className="shrink-0">
            <ThemeColorSwitcher align="right" />
          </div>

          {/* Global Multi-Language Switcher Popover */}
          <div className="shrink-0">
            <LanguageSwitcher align="right" />
          </div>
        </div>
      </div>
    </header>
  )
}
