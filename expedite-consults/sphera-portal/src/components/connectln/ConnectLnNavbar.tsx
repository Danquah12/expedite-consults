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
  Menu,
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
import { UserProfile, SuggestedConnection, getEnclaveConnectedMembers } from "@/lib/connectln-data"
import { ConnectInLogo } from "@/components/brand/ConnectInLogo"
import { isSuperAdminUser } from "@/lib/connectin-profile"
import { getCategorizedMoreMenu, getEnclaveSearchPlaceholder, getEnclaveModules } from "@/lib/connectin-navbar-data"
import { findEnclaveById, ALL_PROFESSIONS, PROFESSION_ENCLAVES } from "@/lib/connectin-professions"
import { loadStoredAdminUsers } from "@/lib/connectin-storage"
import { ThemeColorSwitcher } from "@/components/theme/ThemeColorSwitcher"
import { LanguageSwitcher } from "@/components/language/LanguageSwitcher"
import { useLanguage } from "@/context/LanguageContext"

interface ConnectLnNavbarProps {
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
  onSelectMember?: (member: any) => void
  onOpenVideoGuide?: () => void
}

export function ConnectLnNavbar({
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
  onSelectMember,
  onOpenVideoGuide
}: ConnectLnNavbarProps) {
  const [isMeOpen, setIsMeOpen] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchDropdownTab, setSearchDropdownTab] = useState<'all' | 'members' | 'modules' | 'skills'>('all')
  const [liveDirectoryUsers, setLiveDirectoryUsers] = useState<Array<{
    id: string
    name: string
    headline: string
    avatar: string
    capabilities: string[]
    role: string
  }>>([])
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set())
  const { t } = useLanguage()

  const desktopMoreBtnRef = useRef<HTMLDivElement>(null)
  const mobileMoreMenuRef = useRef<HTMLDivElement>(null)
  const moreDropdownRef = useRef<HTMLDivElement>(null)
  const meMenuRef = useRef<HTMLDivElement>(null)

  // Document-level click-outside and Escape key listener to close menus reliably
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (isMoreOpen) {
        const clickedInsideDropdown = moreDropdownRef.current?.contains(target)
        const clickedDesktopTrigger = desktopMoreBtnRef.current?.contains(target)
        const clickedMobileTrigger = mobileMoreMenuRef.current?.contains(target) || tabStripRef.current?.contains(target)
        if (!clickedInsideDropdown && !clickedDesktopTrigger && !clickedMobileTrigger) {
          setIsMoreOpen(false)
        }
      }
      if (isMeOpen && meMenuRef.current && !meMenuRef.current.contains(target)) {
        setIsMeOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMoreOpen(false)
        setIsMeOpen(false)
        setIsMobileSearchOpen(false)
        setIsMobileDrawerOpen(false)
      }
    }

    if (isMoreOpen || isMeOpen) {
      document.addEventListener("mousedown", handleOutsideClick)
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
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

  // Mobile tab strip: slow continuous auto-scroll (left → right), pauses while the user touches/hovers
  const tabStripRef = useRef<HTMLDivElement>(null)
  const tabStripPausedRef = useRef(false)
  const tabStripResumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const el = tabStripRef.current
    if (!el) return
    let raf = 0
    let pos = el.scrollWidth / 2
    el.scrollLeft = pos
    const step = () => {
      const node = tabStripRef.current
      if (node) {
        const half = node.scrollWidth / 2
        if (tabStripPausedRef.current) {
          pos = node.scrollLeft
        } else if (half > 0) {
          pos -= 0.35 // slow drift: content moves left → right
          if (pos <= 0) pos += half
          node.scrollLeft = pos
        }
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  const pauseTabStrip = () => {
    tabStripPausedRef.current = true
    if (tabStripResumeTimer.current) clearTimeout(tabStripResumeTimer.current)
  }
  const resumeTabStrip = (delay = 2500) => {
    if (tabStripResumeTimer.current) clearTimeout(tabStripResumeTimer.current)
    tabStripResumeTimer.current = setTimeout(() => {
      tabStripPausedRef.current = false
    }, delay)
  }

  // Streamlined Clean Primary Navigation with Responsive Priority Levels
  const [visitedBadgeTabs, setVisitedBadgeTabs] = React.useState<Record<string, boolean>>({})
  React.useEffect(() => {
    if (activeTab) setVisitedBadgeTabs((p) => (p[activeTab] ? p : { ...p, [activeTab]: true }))
  }, [activeTab])
  const primaryNavItemsRaw = [
    { id: "home", label: t("nav_home", "Home"), shortLabel: t("nav_home_short", "Home"), icon: House, badge: 2, priority: "always" },
    { id: "network", label: t("nav_network", "Network"), shortLabel: t("nav_network_short", "Network"), icon: Users, badge: 0, priority: "always" },
    { id: "jobs", label: t("nav_jobs", "Jobs"), shortLabel: t("nav_jobs_short", "Jobs"), icon: Briefcase, badge: 0, priority: "always" },
    { id: "veterans", label: t("nav_veterans", "Veterans"), shortLabel: t("nav_veterans_short", "Veterans"), icon: Award, badge: 1, priority: "always" },
    { id: "franchises", label: t("nav_franchises", "Franchises"), shortLabel: t("nav_franchises_short", "Franchise"), icon: Store, badge: 1, priority: "always" },
    { id: "messaging", label: t("nav_messages", "Messaging"), shortLabel: t("nav_messages_short", "Msgs"), icon: MessageSquare, badge: unreadMessagesCount || 1, priority: "always" },
    { id: "notifications", label: t("nav_alerts", "Notifications"), shortLabel: t("nav_alerts_short", "Alerts"), icon: Bell, badge: unreadNotificationsCount || 3, priority: "always" },
    { id: "marketplace", label: t("nav_marketplace", "Marketplace"), shortLabel: t("nav_marketplace_short", "Market"), icon: ShoppingBag, badge: 0, isMarketplace: true, priority: "always" },
    { id: "learning", label: t("nav_learning", "Learning"), shortLabel: t("nav_learning_short", "Learn"), icon: GraduationCap, badge: 1, priority: "always" },
    { id: "media", label: t("nav_media", "Media"), shortLabel: t("nav_media_short", "Media"), icon: Tv, badge: 1, priority: "always" },
    { id: "pulserooms", label: t("nav_pulse", "Pulse"), shortLabel: t("nav_pulse_short", "Pulse"), icon: Radio, badge: 0, priority: "always" },
  ]
  const primaryNavItems = primaryNavItemsRaw.map((i) => ({ ...i, badge: visitedBadgeTabs[i.id] ? 0 : i.badge }))

  const isAdminUser = isSuperAdminUser(user)

  const categorizedMoreMenu = getCategorizedMoreMenu(user.professionEnclave, isAdminUser, user.profession)

  // Load all registered accounts from localStorage vault + /api/connectin/users
  useEffect(() => {
    const loadAllUsers = () => {
      try {
        const localAccounts = loadStoredAdminUsers().map((acc, idx) => ({
          id: acc.id || `vault_${idx}_${acc.email}`,
          name: acc.name || acc.email.split("@")[0],
          headline: acc.headline || `${acc.organization || "Verified Member"} · ConnectIn`,
          avatar: acc.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(acc.name || acc.email)}&backgroundColor=0a66c2`,
          capabilities: [
            acc.organization || "Professional",
            acc.verificationLevel || "Verified Member"
          ],
          role: acc.roles?.[0] || "Member"
        }))
        setLiveDirectoryUsers(prev => {
          const combined = [...localAccounts, ...prev]
          return combined.filter((item, index, self) =>
            index === self.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase())
          )
        })
      } catch {
        // ignore storage errors
      }
    }

    loadAllUsers()

    fetch("/api/connectin/users")
      .then(res => res.json())
      .then(data => {
        if (data?.users && Array.isArray(data.users)) {
          const apiUsers = data.users.map((u: any) => ({
            id: u.id || `api_${u.email || u.name}`,
            name: u.name || "ConnectIn Member",
            headline: u.headline || `${u.profession || "Professional"} · ${u.company || "ConnectIn"}`,
            avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || "Member")}&backgroundColor=0a66c2`,
            capabilities: Array.isArray(u.capabilities) && u.capabilities.length > 0
              ? u.capabilities
              : [u.profession || "Enterprise", u.clearance || "Verified"].filter(Boolean),
            role: u.role || u.profession || "Member"
          }))
          setLiveDirectoryUsers(prev => {
            const combined = [...apiUsers, ...prev]
            return combined.filter((item, index, self) =>
              index === self.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase())
            )
          })
        }
      })
      .catch(() => {})
  }, [isSearchFocused])

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

  // All enclave members across every profession enclave
  const allEnclaveMembers = PROFESSION_ENCLAVES.flatMap(enclave =>
    getEnclaveConnectedMembers(enclave.id).map(m => ({
      id: m.id,
      name: m.name,
      headline: m.headline,
      avatar: m.avatar,
      capabilities: m.capabilities || [enclave.label],
      role: enclave.shortLabel
    }))
  )

  // Combined searchable member pool across live registered accounts, suggested people, seed directory, and all enclaves
  const allSearchableMembers = [
    ...liveDirectoryUsers,
    ...suggestedPeople.map(p => ({
      id: p.id,
      name: p.name,
      headline: p.headline,
      avatar: p.avatar,
      capabilities: p.capabilities || [],
      role: "Member"
    })),
    ...defaultDirectory,
    ...allEnclaveMembers
  ].filter((item, index, self) =>
    index === self.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase())
  )

  // Core Platform Modules & Connected Ecosystem Apps + All Enclave Modules
  const CORE_PLATFORM_MODULES = [
    { id: "home", label: "Home Feed & Command Stream", icon: "🏠", badge: "Core", desc: "Primary professional feed, announcements, and enclave updates", url: undefined as string | undefined },
    { id: "network", label: "My Network & Member Directory", icon: "👥", badge: "Core", desc: "Discover and connect with verified professionals across all enclaves", url: undefined },
    { id: "jobs", label: "Jobs & Talent Board", icon: "💼", badge: "Careers", desc: "Cleared roles, enterprise positions, and AI-matched opportunities", url: undefined },
    { id: "careersuite", label: "Resume Prep & CareerSuite AI", icon: "📄", badge: "AI", desc: "Upload resume, ATS optimizer, salary intelligence, and interview simulator", url: undefined },
    { id: "messaging", label: "Encrypted Messaging", icon: "💬", badge: "Comms", desc: "Direct messages and end-to-end encrypted professional threads", url: undefined },
    { id: "vibecomms", label: "VibeChat & Video Conferencing", icon: "📹", badge: "Live", desc: "HD video meetings, screen sharing, and team war rooms", url: undefined },
    { id: "pulserooms", label: "Pulse Audio Rooms", icon: "🎙️", badge: "Live Audio", desc: "Live interactive audio stages, townhalls, and expert panels", url: undefined },
    { id: "marketplace", label: "Enterprise Marketplace & Bazaar", icon: "🛍️", badge: "Commerce", desc: "Hardware, SaaS licenses, consulting templates, and enterprise gear", url: undefined },
    { id: "learning", label: "Learning Academy & Certifications", icon: "🎓", badge: "CEU/CPE", desc: "Accredited courses, certifications, and hands-on skill tracks", url: undefined },
    { id: "media", label: "ConnectIn Media & Broadcasts", icon: "📺", badge: "Video", desc: "Keynotes, technical briefings, and industry documentaries", url: undefined },
    { id: "wallet", label: "Wallet, Escrow & Invoicing", icon: "💳", badge: "Finance", desc: "Manage milestone escrow, payouts, invoices, and treasury", url: undefined },
    { id: "company", label: "Companies & Organizations", icon: "🏢", badge: "Directory", desc: "Explore verified enterprise organizations and defense contractors", url: undefined },
    { id: "guilds", label: "Professional Guilds & Working Groups", icon: "🛡️", badge: "Community", desc: "Join specialized domain guilds and standards committees", url: undefined },
    { id: "bounties", label: "Bounties & Paid Challenges", icon: "🎯", badge: "Rewards", desc: "Bug bounties, engineering challenges, and rapid task rewards", url: undefined },
    { id: "events", label: "Conferences & Events", icon: "📅", badge: "Events", desc: "Summits, workshops, expos, and networking meetups", url: undefined },
    { id: "procurement", label: "RFPs & Enterprise Procurement", icon: "📋", badge: "Contracts", desc: "Government and enterprise RFPs, bids, and vendor solicitations", url: undefined },
    { id: "launchpad", label: "Startup Launchpad & Deal Flow", icon: "🚀", badge: "Venture", desc: "Pitch decks, founder incubators, and venture capital matching", url: undefined },
    { id: "mentorship", label: "Executive Mentorship & Coaching", icon: "🧭", badge: "Growth", desc: "1-on-1 mentorship with industry fellows and senior leaders", url: undefined },
    { id: "trustcenter", label: "Trust Center & Compliance Vault", icon: "🔒", badge: "Security", desc: "SOC 2, FedRAMP, ISO 27001 attestations, and clearance verification", url: undefined },
    { id: "labs", label: "R&D Papers, Patents & Labs", icon: "🧪", badge: "Research", desc: "Peer-reviewed technical papers, benchmarks, and datasets", url: undefined },
    { id: "profile", label: "My Profile & Portfolio", icon: "👤", badge: "Account", desc: "View and customize your professional profile, skills, and resume", url: undefined },
    { id: "security", label: "Account Security & IAM Settings", icon: "🔑", badge: "Security", desc: "Passkeys, MFA, active sessions, and privacy controls", url: undefined },
    { id: "ext-noctis-ai", label: "Ask Noctis AI", icon: "🌌", badge: "Live App", desc: "Autonomous Cyber & Enterprise Intelligence Assistant (dstrike.app/noctis)", url: "https://dstrike.app/noctis" },
    { id: "ext-pdfadore", label: "PDFAdore Document Suite", icon: "📑", badge: "Live App", desc: "Sign, convert, redact, and analyze PDF documents", url: "https://www.pdfadore.com" },
    { id: "ext-launchpad", label: "Expedite Launchpad Hub", icon: "⚡", badge: "Live App", desc: "Unified Expedite Consults enterprise application portal", url: "https://launchpad.expediteconsults.com" },
  ]

  const allEnclaveModules = [
    ... getEnclaveModules(user.professionEnclave, isAdminUser),
    ...PROFESSION_ENCLAVES.flatMap(e => getEnclaveModules(e.id, isAdminUser))
  ]

  const ALL_MODULES = [...CORE_PLATFORM_MODULES, ...allEnclaveModules].filter(
    (mod, idx, self) =>
      idx === self.findIndex(m => m.id === mod.id || m.label.toLowerCase() === mod.label.toLowerCase())
  )

  // Multi-word token matcher so users can search any combination of words
  const matchesSearchTokens = (fields: (string | undefined)[], query: string) => {
    const q = query.toLowerCase().trim()
    if (!q) return true
    const tokens = q.split(/\s+/).filter(Boolean)
    const haystack = fields.filter(Boolean).join(" ").toLowerCase()
    return tokens.every(token => haystack.includes(token))
  }

  // Filter members by query
  const matchingMembers = (searchQuery.trim()
    ? allSearchableMembers.filter(p =>
        matchesSearchTokens([p.name, p.headline, p.role, ...(p.capabilities || [])], searchQuery)
      )
    : allSearchableMembers.filter(p => p.name.toLowerCase() !== (user?.name || "").toLowerCase())
  ).slice(0, searchDropdownTab === 'members' ? 12 : 5)

  // Filter modules by query (also show top modules when browsing)
  const matchingModules = (searchQuery.trim()
    ? ALL_MODULES.filter(m =>
        matchesSearchTokens([m.label, m.desc, m.id, m.badge], searchQuery)
      )
    : ALL_MODULES
  ).slice(0, searchDropdownTab === 'modules' ? 12 : 5)

  // Filter skills, professions & role tools from ALL_PROFESSIONS
  const matchingSkillsAndRoles = (searchQuery.trim()
    ? ALL_PROFESSIONS.filter(prof =>
        matchesSearchTokens(
          [
            prof.title,
            prof.categoryLabel,
            prof.enclaveId,
            ...prof.typicalSkills,
            ...prof.tools.map(t => `${t.label} ${t.desc}`)
          ],
          searchQuery
        )
      )
    : ALL_PROFESSIONS.filter(p => p.enclaveId === user.professionEnclave || p.title === user.profession)
  ).slice(0, searchDropdownTab === 'skills' ? 12 : 5)

  const handleConnectClick = (e: React.MouseEvent, personId: string) => {
    e.stopPropagation()
    setConnectedIds(prev => new Set(prev).add(personId))
    if (onToggleConnect) {
      onToggleConnect(personId)
    }
  }

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 w-full max-w-full border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
      {/* Mobile Expandable Search Bar Overlay (when search icon tapped on mobile) */}
      {isMobileSearchOpen && (
        <div className="lg:hidden absolute inset-x-0 top-0 z-50 bg-white dark:bg-zinc-900 px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 shadow-md flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-full bg-[#EDF3F8] dark:bg-zinc-800 px-3 py-1.5 border border-zinc-200/50 dark:border-zinc-700/50">
            <Search className="h-4 w-4 text-zinc-500 shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder={t("search_placeholder", "Search members, modules, skills...")}
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
                  setIsMobileSearchOpen(false)
                }
              }}
              className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="text-zinc-400 hover:text-zinc-600 p-0.5 shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setIsMobileSearchOpen(false)
              setIsSearchFocused(false)
            }}
            className="text-xs font-semibold text-[#0A66C2] px-2 py-1 shrink-0"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Top Header: Brand Logo, Adaptive Search, and Quick Actions */}
      <div className="mx-auto flex h-13 sm:h-14 max-w-[1720px] items-center justify-between px-2 sm:px-4 lg:px-6 gap-2 sm:gap-3">
        {/* Left Side: Brand Logo & Interactive Live Search */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 lg:flex-1 lg:min-w-0 max-w-sm sm:max-w-md lg:max-w-xs xl:max-w-sm 2xl:max-w-md relative">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center focus:outline-none group shrink-0"
            title="ConnectIn Home"
          >
            <ConnectInLogo size="sm" showSubtitle={false} className="shrink-0" />
          </button>

          {/* Interactive Search Box - Fluid on Desktop, Hidden on Mobile */}
          <div className="hidden lg:block relative flex-1 min-w-[140px] max-w-full transition-all duration-200">
            <div
              className={`flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#EDF3F8] px-2.5 sm:px-3 py-1 sm:py-1.5 transition-all dark:bg-zinc-800/90 border border-zinc-200/50 dark:border-zinc-700/50 ${
                isSearchFocused ? "ring-2 ring-[#0A66C2] bg-white border-[#0A66C2] shadow-md dark:bg-zinc-900" : "hover:bg-[#E2ECF3] dark:hover:bg-zinc-800"
              }`}
            >
              <Search
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500 shrink-0 cursor-pointer"
                onClick={() => {
                  onOpenUniversalSearch && onOpenUniversalSearch()
                  setIsSearchFocused(false)
                }}
              />
              <input
                type="text"
                placeholder={t("search_placeholder", "Search members, modules, skills...")}
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
                className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400 font-medium truncate"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 shrink-0 cursor-pointer"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Live Autocomplete Popover Dropdown (Works on both Desktop and Mobile Search) */}
          {isSearchFocused && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/10 backdrop-blur-2xs"
                onClick={() => setIsSearchFocused(false)}
              />
              <div className="fixed sm:absolute left-2 right-2 sm:left-0 sm:right-auto top-14 sm:top-12 z-50 w-auto sm:w-[520px] lg:w-[580px] max-w-[calc(100vw-16px)] rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 space-y-2.5 max-h-[82vh] overflow-y-auto">
                {/* Header info & Category Filter Pills */}
                <div className="space-y-2 border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#0A66C2]" />
                      {searchQuery.trim()
                        ? `Universal Search Results for "${searchQuery}"`
                        : "Search Members, Platform Modules, Skills & Professions"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSearchFocused(false)}
                      className="text-[10px] font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-1.5 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Close ✕
                    </button>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {[
                      { id: 'all', label: 'All Results' },
                      { id: 'members', label: `Members (${matchingMembers.length})` },
                      { id: 'modules', label: `Modules & Hubs (${matchingModules.length})` },
                      { id: 'skills', label: `Skills & Roles (${matchingSkillsAndRoles.length})` }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSearchDropdownTab(tab.id as any)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                          searchDropdownTab === tab.id
                            ? "bg-[#0A66C2] text-white shadow-xs"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Matching People & Members Section */}
                {(searchDropdownTab === 'all' || searchDropdownTab === 'members') && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                        People &amp; Verified Members
                      </p>
                      {searchDropdownTab === 'all' && matchingMembers.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSearchDropdownTab('members')}
                          className="text-[10px] font-bold text-[#0A66C2] hover:underline"
                        >
                          View More →
                        </button>
                      )}
                    </div>
                    {matchingMembers.length > 0 ? (
                      <div className="space-y-1">
                        {matchingMembers.map((member) => {
                          const isConnected = connectedIds.has(member.id)
                          return (
                            <div
                              key={member.id}
                              onClick={() => {
                                if (onSelectMember) {
                                  onSelectMember(member)
                                } else {
                                  onSelectTab('profile')
                                }
                                setIsSearchFocused(false)
                                setIsMobileSearchOpen(false)
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
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] truncate">
                                      {member.name}
                                    </p>
                                    <ShieldCheck className="h-3 w-3 text-[#0A66C2] shrink-0" />
                                    {member.role && (
                                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 shrink-0">
                                        {member.role}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                                    {member.headline}
                                  </p>
                                  {member.capabilities && member.capabilities.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                      {member.capabilities.slice(0, 3).map((cap) => (
                                        <span
                                          key={cap}
                                          className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-medium"
                                        >
                                          {cap}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => handleConnectClick(e, member.id)}
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold shrink-0 transition-all ${
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
                      <div className="p-2.5 text-center text-xs text-zinc-500 dark:text-zinc-400">
                        No members matching &ldquo;{searchQuery}&rdquo;
                      </div>
                    )}
                  </div>
                )}

                {/* Matching Modules & Platform Hubs Section */}
                {(searchDropdownTab === 'all' || searchDropdownTab === 'modules') && (
                  <div className="space-y-1.5 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                        {t("hubs_and_modules", "Platform Hubs, Modules & Connected Apps")}
                      </p>
                      {searchDropdownTab === 'all' && matchingModules.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSearchDropdownTab('modules')}
                          className="text-[10px] font-bold text-[#0A66C2] hover:underline"
                        >
                          View All Modules →
                        </button>
                      )}
                    </div>
                    {matchingModules.length > 0 ? (
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
                              setIsMobileSearchOpen(false)
                            }}
                            className="w-full flex items-center justify-between rounded-xl p-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
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
                              <span className="text-xs text-zinc-400 group-hover:text-[#0A66C2] shrink-0">Open →</span>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2.5 text-center text-xs text-zinc-500 dark:text-zinc-400">
                        No modules matching &ldquo;{searchQuery}&rdquo;
                      </div>
                    )}
                  </div>
                )}

                {/* Matching Skills, Professions & Role Tools Section */}
                {(searchDropdownTab === 'all' || searchDropdownTab === 'skills') && (
                  <div className="space-y-1.5 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                        Skills, Professions &amp; Role Workbenches
                      </p>
                      {searchDropdownTab === 'all' && matchingSkillsAndRoles.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSearchDropdownTab('skills')}
                          className="text-[10px] font-bold text-[#0A66C2] hover:underline"
                        >
                          View All Skills →
                        </button>
                      )}
                    </div>
                    {matchingSkillsAndRoles.length > 0 ? (
                      <div className="space-y-1">
                        {matchingSkillsAndRoles.map((prof) => (
                          <div
                            key={prof.id}
                            onClick={() => {
                              if (onSwitchEnclave && prof.enclaveId !== user.professionEnclave) {
                                onSwitchEnclave(prof.enclaveId, prof.title)
                              } else {
                                onSelectTab('jobs')
                              }
                              setIsSearchFocused(false)
                              setIsMobileSearchOpen(false)
                            }}
                            className="group flex items-start justify-between gap-2 rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <span className="text-base shrink-0 mt-0.5">{prof.icon}</span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] truncate">
                                    {prof.title}
                                  </p>
                                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 shrink-0">
                                    {prof.categoryLabel}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {prof.typicalSkills.slice(0, 4).map((skill) => (
                                    <span
                                      key={skill}
                                      className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-medium"
                                    >
                                      ✓ {skill}
                                    </span>
                                  ))}
                                  {prof.tools.slice(0, 2).map((tool) => (
                                    <span
                                      key={tool.id}
                                      className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 font-medium"
                                    >
                                      {tool.icon} {tool.label}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-[#0A66C2] shrink-0 self-center">
                              Switch Role →
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2.5 text-center text-xs text-zinc-500 dark:text-zinc-400">
                        No skills or professions matching &ldquo;{searchQuery}&rdquo;
                      </div>
                    )}
                  </div>
                )}

                {/* Omnisearch Action CTA */}
                <div className="border-t border-zinc-100 pt-2 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenUniversalSearch && onOpenUniversalSearch()
                      setIsSearchFocused(false)
                      setIsMobileSearchOpen(false)
                    }}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-2 text-center text-xs font-bold text-white shadow-xs hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>
                      {searchQuery.trim()
                        ? t("search_all_results", `Search all results for "${searchQuery}" in Omnisearch →`).replace("{query}", searchQuery)
                        : t("search_open_omnisearch", "Open Full-Screen Universal Omnisearch Directory →")}
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Center Primary Navigation Tabs (Visible on lg: screens and above) */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 2xl:gap-1.5 shrink-0 py-1">
          {primaryNavItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative flex min-w-[44px] xl:min-w-[52px] 2xl:min-w-[58px] flex-col items-center justify-center py-1 px-1 text-xs transition-all group shrink-0 cursor-pointer ${
                  isActive
                    ? "text-[#0A66C2] font-semibold border-b-2 border-[#0A66C2]"
                    : item.isMarketplace
                    ? "text-purple-600 dark:text-purple-400 font-bold hover:text-purple-700"
                    : item.id === 'learning'
                    ? "text-blue-600 dark:text-blue-400 hover:text-blue-700"
                    : item.id === 'media'
                    ? "text-rose-600 dark:text-rose-400 hover:text-rose-700"
                    : item.id === 'pulserooms'
                    ? "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
                title={item.label}
              >
                <div className="relative">
                  <Icon className={`h-4.5 w-4.5 xl:h-5 xl:w-5 transition-transform group-hover:scale-110 ${
                    isActive
                      ? "text-[#0A66C2]"
                      : item.isMarketplace
                      ? "text-purple-600 dark:text-purple-400"
                      : item.id === 'learning'
                      ? "text-blue-600 dark:text-blue-400"
                      : item.id === 'media'
                      ? "text-rose-600 dark:text-rose-400"
                      : item.id === 'pulserooms'
                      ? "text-emerald-600 dark:text-emerald-400"
                      : ""
                  }`} />
                  {item.badge > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="hidden xl:inline-block text-[10px] xl:text-[11px] mt-0.5 truncate max-w-[68px]">
                  {item.shortLabel || item.label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Right Side Controls (Mobile Search + AI Assistant + Me Profile + More Hubs + Theme) */}
        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 shrink-0">
          {/* Mobile Search Button (Compact icon, opens search overlay) */}
          <button
            type="button"
            onClick={() => {
              if (onOpenUniversalSearch) {
                onOpenUniversalSearch()
              } else {
                setIsMobileSearchOpen(true)
              }
            }}
            className="lg:hidden p-1.5 rounded-full text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
            title={t("search_placeholder", "Search...")}
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Subtle Divider for desktop */}
          <div className="hidden lg:block h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

          {/* Ask Noctis: opens the in-app Noctis chat (answers come from the Noctis API without leaving ConnectLn) */}
          <button
            type="button"
            onClick={() => {
              if (onOpenAIAssistant) onOpenAIAssistant()
              else window.open("https://dstrike.app/noctis", "_blank", "noopener,noreferrer")
            }}
            className="group flex items-center gap-1 sm:gap-1.5 rounded-full bg-[#FBF5E9] hover:bg-[#F5EAD2] dark:bg-amber-950/30 dark:hover:bg-amber-950/50 text-[#7A4B00] dark:text-amber-200 border border-[#C88A24]/40 dark:border-amber-700/50 px-2 sm:px-2.5 py-1 text-xs font-semibold shadow-2xs transition-all shrink-0 cursor-pointer"
            title="Ask Noctis"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#C88A24] dark:text-amber-300 transition-transform group-hover:scale-110 shrink-0" />
            <span className="hidden sm:inline text-xs font-semibold">Ask Noctis</span>
            <span className="hidden xl:inline rounded bg-amber-200/60 dark:bg-amber-900/60 px-1.5 py-0.2 text-[9px] font-bold text-[#5C3800] dark:text-amber-100">
              Q&amp;A
            </span>
          </button>

          {/* "Me" Profile Menu Dropdown — Always Visible with Label */}
          <div ref={meMenuRef} className="relative shrink-0">
            <button
              onClick={() => {
                setIsMeOpen(!isMeOpen)
                setIsMoreOpen(false)
              }}
              className={`flex min-w-[34px] sm:min-w-[42px] flex-col items-center justify-center py-1 text-xs transition-colors cursor-pointer shrink-0 ${
                activeTab === 'profile' || isMeOpen
                  ? "text-[#0A66C2] font-semibold"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
              title={`${user.name} (Me)`}
            >
              <div className="relative h-6 w-6 sm:h-6 sm:w-6 rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-700 shrink-0 ring-1 ring-[#0A66C2]/30">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="flex items-center gap-0.5 text-[10px] mt-0.5 font-medium">
                Me <ChevronDown className="h-3 w-3" />
              </span>
            </button>

            {/* Dropdown Menu Modal/Popover */}
            {isMeOpen && (
              <>
                <div
                  className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-2xs lg:bg-black/20"
                  onClick={() => setIsMeOpen(false)}
                />
                <div className="fixed lg:absolute inset-x-2 lg:inset-x-auto lg:right-0 top-[6.75rem] bottom-24 lg:top-12 lg:bottom-auto lg:max-h-[85vh] lg:w-80 max-w-[360px] sm:left-auto sm:right-2 sm:w-80 rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 flex flex-col overflow-hidden z-[60]">
                  <div className="flex items-start justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800 shrink-0">
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

                  <div className="flex-1 min-h-0 overflow-y-auto pt-2 space-y-2 pr-1">
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

                    {/* Quick Preferences: Theme & Language */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <p className="px-2 py-0.5 font-bold text-zinc-900 dark:text-zinc-100 text-[10px] uppercase tracking-wider font-mono">
                        {t("preferences_label", "Preferences & Appearance")}
                      </p>
                      <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                        <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">{t("theme_style", "Theme & Style")}</span>
                        <ThemeColorSwitcher align="right" />
                      </div>
                      <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                        <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">{t("language_label", "Language")}</span>
                        <LanguageSwitcher align="right" />
                      </div>
                    </div>

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

          {/* Subtle Divider before More */}
          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5 shrink-0" />

          {/* "More ▾" Dropdown Menu Trigger — Always Visible on Mobile and Desktop */}
          <div ref={desktopMoreBtnRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsMoreOpen(!isMoreOpen)
                setIsMeOpen(false)
              }}
              className={`flex min-w-[36px] sm:min-w-[44px] flex-col items-center justify-center py-1 text-xs transition-colors cursor-pointer shrink-0 ${
                isMoreOpen
                  ? "text-[#0A66C2] font-bold"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
              title="More Modules & Hubs"
            >
              <Grid3X3 className="h-4.5 w-4.5" />
              <span className="flex items-center gap-0.5 text-[10px] xl:text-[11px] mt-0.5 font-medium">
                {t("nav_more", "More")} <ChevronDown className="h-3 w-3" />
              </span>
            </button>
          </div>
          {isAdminUser && onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="hidden xl:flex items-center gap-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-2.5 py-1 text-xs font-bold shadow-xs hover:opacity-90 transition-all shrink-0 cursor-pointer"
              title="Access Role Gate & Persona Switcher"
            >
              <Key className="h-3.5 w-3.5 text-amber-300 dark:text-amber-500 shrink-0" />
              <span>Gate</span>
            </button>
          )}

          {/* Theme & Background Color Switcher — visible on all screen sizes (compact on mobile) */}
          <div className="block shrink-0">
            <ThemeColorSwitcher align="right" compact />
          </div>

          {/* Desktop-only Global Multi-Language Switcher Popover (Visible on 2xl+; also inside Me menu) */}
          <div className="hidden 2xl:block shrink-0">
            <LanguageSwitcher align="right" />
          </div>
        </div>
      </div>

      {/* Mobile & Tablet: one-line, slowly auto-scrolling strip of ALL menu items (pauses on touch; swipe or tap any) */}
      <nav className="lg:hidden border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div
          ref={tabStripRef}
          onTouchStart={pauseTabStrip}
          onTouchEnd={() => resumeTabStrip()}
          onMouseEnter={pauseTabStrip}
          onMouseLeave={() => resumeTabStrip(800)}
          onWheel={() => { pauseTabStrip(); resumeTabStrip() }}
          className="flex items-center overflow-x-auto no-scrollbar px-1 whitespace-nowrap"
        >
          {[0, 1].map((copy) =>
            [
              ...primaryNavItems.map((i) => ({ id: i.id, label: i.shortLabel || i.label, icon: i.icon, badge: i.badge, kind: i.isMarketplace ? 'purple' : i.id === 'learning' ? 'blue' : i.id === 'media' ? 'rose' : i.id === 'pulserooms' ? 'emerald' : 'default' })),
              { id: 'wallet', label: 'Wallet', icon: DollarSign, badge: 0, kind: 'emerald' },
              { id: 'vibecomms', label: 'VibeChat', icon: MessageSquare, badge: 0, kind: 'emerald' },
              { id: 'company', label: 'Companies', icon: Building2, badge: 0, kind: 'blue' },
              { id: 'guilds', label: 'Guilds', icon: Shield, badge: 0, kind: 'amber' },
              { id: 'bounties', label: 'Bounties', icon: Flame, badge: 0, kind: 'orange' },
              { id: 'events', label: 'Events', icon: Calendar, badge: 0, kind: 'indigo' },
              { id: 'procurement', label: 'RFPs', icon: FileCheck, badge: 0, kind: 'teal' },
              { id: 'launchpad', label: 'Launchpad', icon: Rocket, badge: 0, kind: 'purple' },
              { id: 'careersuite', label: 'Resume Prep', icon: Award, badge: 0, kind: 'cyan' },
            ].map((item) => {
              const Icon = item.icon
              const isMore = item.id === '__more'
              const isActive = !isMore && activeTab === item.id
              const colors: Record<string, string> = {
                default: "text-zinc-500 dark:text-zinc-400",
                purple: "text-purple-600 dark:text-purple-400",
                blue: "text-blue-600 dark:text-blue-400",
                rose: "text-rose-600 dark:text-rose-400",
                emerald: "text-emerald-600 dark:text-emerald-400",
                amber: "text-amber-600 dark:text-amber-400",
                orange: "text-orange-500",
                indigo: "text-indigo-600 dark:text-indigo-400",
                teal: "text-teal-600 dark:text-teal-400",
                cyan: "text-cyan-600 dark:text-cyan-400",
              }
              return (
                <button
                  key={`${copy}-${item.id}`}
                  type="button"
                  onClick={() => {
                    if (isMore) {
                      setIsMoreOpen(!isMoreOpen)
                      setIsMeOpen(false)
                    } else {
                      onSelectTab(item.id)
                      setIsMoreOpen(false)
                      setIsMeOpen(false)
                    }
                  }}
                  className={`relative shrink-0 min-w-[64px] flex flex-col items-center justify-center py-1.5 px-2 cursor-pointer border-b-2 ${
                    isActive ? "text-[#0A66C2] font-semibold border-[#0A66C2]" : `${colors[item.kind]} border-transparent`
                  }`}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {item.badge > 0 && (
                      <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] mt-0.5 leading-none">{item.label}</span>
                </button>
              )
            })
          )}
        </div>
      </nav>

      {/* Legacy bottom bar — hidden; tabs now live at the top like desktop */}
      <nav className="hidden">
        <div className="flex items-center justify-start sm:justify-center max-w-lg mx-auto overflow-x-auto no-scrollbar gap-0.5 scroll-smooth px-1">
          {/* 1. Home */}
          <button
            type="button"
            onClick={() => {
              onSelectTab('home')
              setIsMoreOpen(false)
            }}
            className={`shrink-0 min-w-[44px] max-w-[56px] flex-1 flex flex-col items-center justify-center py-1 text-center transition-colors cursor-pointer ${
              activeTab === 'home'
                ? "text-[#0A66C2] font-bold"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            <div className="relative">
              <House className="h-4.5 w-4.5" />
              <span className="absolute -top-1 -right-1.5 flex h-3 min-w-3 items-center justify-center rounded-full bg-red-600 px-0.5 text-[8px] font-bold text-white shadow-2xs">
                2
              </span>
            </div>
            <span className="text-[9px] mt-0.5 font-medium leading-none">{t("nav_home_short", "Home")}</span>
          </button>

          {/* 2. Network */}
          <button
            type="button"
            onClick={() => {
              onSelectTab('network')
              setIsMoreOpen(false)
            }}
            className={`shrink-0 min-w-[44px] max-w-[56px] flex-1 flex flex-col items-center justify-center py-1 text-center transition-colors cursor-pointer ${
              activeTab === 'network'
                ? "text-[#0A66C2] font-bold"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            <div className="relative">
              <Users className="h-4.5 w-4.5" />
            </div>
            <span className="text-[9px] mt-0.5 font-medium leading-none">{t("nav_network_short", "Network")}</span>
          </button>

          {/* 3. Jobs */}
          <button
            type="button"
            onClick={() => {
              onSelectTab('jobs')
              setIsMoreOpen(false)
            }}
            className={`shrink-0 min-w-[44px] max-w-[56px] flex-1 flex flex-col items-center justify-center py-1 text-center transition-colors cursor-pointer ${
              activeTab === 'jobs'
                ? "text-[#0A66C2] font-bold"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            <div className="relative">
              <Briefcase className="h-4.5 w-4.5" />
            </div>
            <span className="text-[9px] mt-0.5 font-medium leading-none">{t("nav_jobs_short", "Jobs")}</span>
          </button>

          {/* 4. Messages */}
          <button
            type="button"
            onClick={() => {
              onSelectTab('messaging')
              setIsMoreOpen(false)
            }}
            className={`shrink-0 min-w-[44px] max-w-[56px] flex-1 flex flex-col items-center justify-center py-1 text-center transition-colors cursor-pointer ${
              activeTab === 'messaging'
                ? "text-[#0A66C2] font-bold"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            <div className="relative">
              <MessageSquare className="h-4.5 w-4.5" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1.5 flex h-3 min-w-3 items-center justify-center rounded-full bg-red-600 px-0.5 text-[8px] font-bold text-white shadow-2xs">
                  {unreadMessagesCount}
                </span>
              )}
            </div>
            <span className="text-[9px] mt-0.5 font-medium leading-none">{t("nav_messages_short", "Msgs")}</span>
          </button>

          {/* 5. Alerts (Notifications) */}
          <button
            type="button"
            onClick={() => {
              onSelectTab('notifications')
              setIsMoreOpen(false)
            }}
            className={`shrink-0 min-w-[44px] max-w-[56px] flex-1 flex flex-col items-center justify-center py-1 text-center transition-colors cursor-pointer ${
              activeTab === 'notifications'
                ? "text-[#0A66C2] font-bold"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            <div className="relative">
              <Bell className="h-4.5 w-4.5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1.5 flex h-3 min-w-3 items-center justify-center rounded-full bg-red-600 px-0.5 text-[8px] font-bold text-white shadow-2xs">
                  {unreadNotificationsCount}
                </span>
              )}
            </div>
            <span className="text-[9px] mt-0.5 font-medium leading-none">{t("nav_alerts_short", "Alerts")}</span>
          </button>

          {/* 6. Market (Marketplace) */}
          <button
            type="button"
            onClick={() => {
              onSelectTab('marketplace')
              setIsMoreOpen(false)
            }}
            className={`shrink-0 min-w-[44px] max-w-[56px] flex-1 flex flex-col items-center justify-center py-1 text-center transition-colors cursor-pointer ${
              activeTab === 'marketplace'
                ? "text-purple-600 dark:text-purple-400 font-bold"
                : "text-zinc-500 hover:text-purple-600 dark:text-zinc-400 dark:hover:text-purple-400"
            }`}
          >
            <div className="relative">
              <ShoppingBag className={`h-4.5 w-4.5 ${activeTab === 'marketplace' ? "text-purple-600 dark:text-purple-400" : ""}`} />
            </div>
            <span className="text-[9px] mt-0.5 font-semibold text-purple-600 dark:text-purple-400 leading-none">{t("nav_marketplace_short", "Market")}</span>
          </button>

          {/* 7. Learn (Learning) */}
          <button
            type="button"
            onClick={() => {
              onSelectTab('learning')
              setIsMoreOpen(false)
            }}
            className={`shrink-0 min-w-[44px] max-w-[56px] flex-1 flex flex-col items-center justify-center py-1 text-center transition-colors cursor-pointer ${
              activeTab === 'learning'
                ? "text-[#0A66C2] font-bold"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            <div className="relative">
              <GraduationCap className="h-4.5 w-4.5" />
              <span className="absolute -top-1 -right-1.5 flex h-3 min-w-3 items-center justify-center rounded-full bg-blue-600 px-0.5 text-[8px] font-bold text-white shadow-2xs">
                1
              </span>
            </div>
            <span className="text-[9px] mt-0.5 font-medium leading-none">{t("nav_learning_short", "Learn")}</span>
          </button>

          {/* 8. Media */}
          <button
            type="button"
            onClick={() => {
              onSelectTab('media')
              setIsMoreOpen(false)
            }}
            className={`shrink-0 min-w-[44px] max-w-[56px] flex-1 flex flex-col items-center justify-center py-1 text-center transition-colors cursor-pointer ${
              activeTab === 'media'
                ? "text-rose-600 dark:text-rose-400 font-bold"
                : "text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400"
            }`}
          >
            <div className="relative">
              <Tv className={`h-4.5 w-4.5 ${activeTab === 'media' ? "text-rose-600 dark:text-rose-400" : ""}`} />
              <span className="absolute -top-1 -right-1.5 flex h-3 min-w-3 items-center justify-center rounded-full bg-rose-600 px-0.5 text-[8px] font-bold text-white shadow-2xs">
                1
              </span>
            </div>
            <span className="text-[9px] mt-0.5 font-medium leading-none">{t("nav_media_short", "Media")}</span>
          </button>

          {/* 9. Pulse */}
          <button
            type="button"
            onClick={() => {
              onSelectTab('pulserooms')
              setIsMoreOpen(false)
            }}
            className={`shrink-0 min-w-[44px] max-w-[56px] flex-1 flex flex-col items-center justify-center py-1 text-center transition-colors cursor-pointer ${
              activeTab === 'pulserooms'
                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
            }`}
          >
            <div className="relative">
              <Radio className={`h-4.5 w-4.5 ${activeTab === 'pulserooms' ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
            </div>
            <span className="text-[9px] mt-0.5 font-medium leading-none">{t("nav_pulse_short", "Pulse")}</span>
          </button>

          {/* 10. More (Modules & Hubs Dropdown) */}
          <div ref={mobileMoreMenuRef} className="shrink-0 min-w-[44px] max-w-[56px] flex-1">
            <button
              type="button"
              onClick={() => {
                setIsMoreOpen(!isMoreOpen)
                setIsMeOpen(false)
              }}
              className={`w-full flex flex-col items-center justify-center py-1 text-center transition-colors cursor-pointer ${
                isMoreOpen
                  ? "text-[#0A66C2] font-bold"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              <div className="relative">
                <Grid3X3 className="h-4.5 w-4.5" />
              </div>
              <span className="text-[9px] mt-0.5 font-bold leading-none">{t("nav_more", "More")}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Global "More Modules & Hubs" Modal Dropdown (Mobile, Tablet & Desktop) ── */}
      {isMoreOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs transition-opacity"
            onClick={() => setIsMoreOpen(false)}
          />
          <div
            ref={moreDropdownRef}
            className="fixed z-[60] inset-x-2 sm:inset-x-auto sm:right-4 lg:right-6 top-[6.75rem] bottom-24 lg:top-14 lg:bottom-auto sm:max-h-[85vh] sm:w-[440px] max-w-[460px] rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 dark:border-zinc-800 shrink-0">
              <div>
                <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Grid3X3 className="h-4 w-4 text-[#0A66C2]" />
                  <span>{t("connectin_modules_hubs", "ConnectIn Modules & Hubs")}</span>
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {t("enterprise_solutions_desc", "Enterprise Solutions, Company Pages & Trust Operations")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="rounded-full p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
                title="Close"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Categories List */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pt-2.5 pr-1">
              {/* Enterprise & Platform Hubs 9-Card Grid */}
              <div className="rounded-xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/20 p-2.5 border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-center justify-between mb-2 px-0.5">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Enterprise &amp; Specialized Hubs
                  </p>
                  <span className="text-[9px] font-semibold text-[#0A66C2]">9 Direct Hubs</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  {/* 1. Wallet & Escrow */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('wallet')
                      setIsMoreOpen(false)
                    }}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      activeTab === 'wallet'
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 hover:border-emerald-300"
                    }`}
                  >
                    <DollarSign className={`h-5 w-5 mb-1 ${activeTab === 'wallet' ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
                    <span className="text-[10px] font-bold truncate w-full">Wallet</span>
                  </button>

                  {/* 1.5. VibeChat (Next-Gen WhatsApp+ Unified Comms) */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('vibecomms')
                      setIsMoreOpen(false)
                    }}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      activeTab === 'vibecomms'
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-emerald-300/90 dark:border-emerald-700 hover:border-emerald-400"
                    }`}
                    title="Vibe / DeskNote Next-Gen WhatsApp+ Unified Communications (E2EE, WebRTC, Communities & AI)"
                  >
                    <MessageSquare className={`h-5 w-5 mb-1 ${activeTab === 'vibecomms' ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
                    <span className="text-[10px] font-bold truncate w-full">VibeChat</span>
                  </button>

                  {/* 2. Company Directory */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('company')
                      setIsMoreOpen(false)
                    }}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      activeTab === 'company'
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 hover:border-blue-300"
                    }`}
                  >
                    <Building2 className={`h-5 w-5 mb-1 ${activeTab === 'company' ? "text-white" : "text-blue-600 dark:text-blue-400"}`} />
                    <span className="text-[10px] font-bold truncate w-full">Companies</span>
                  </button>

                  {/* 3. Guilds & Ecosystem */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('guilds')
                      setIsMoreOpen(false)
                    }}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      activeTab === 'guilds'
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 hover:border-amber-300"
                    }`}
                  >
                    <Shield className={`h-5 w-5 mb-1 ${activeTab === 'guilds' ? "text-white" : "text-amber-600 dark:text-amber-400"}`} />
                    <span className="text-[10px] font-bold truncate w-full">Guilds</span>
                  </button>

                  {/* 4. Bounties & Hackathons */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('bounties')
                      setIsMoreOpen(false)
                    }}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      activeTab === 'bounties'
                        ? "bg-orange-600 text-white shadow-xs"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 hover:border-orange-300"
                    }`}
                  >
                    <Flame className={`h-5 w-5 mb-1 ${activeTab === 'bounties' ? "text-white" : "text-orange-500"}`} />
                    <span className="text-[10px] font-bold truncate w-full">Bounties</span>
                  </button>

                  {/* 5. Events & Live */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('events')
                      setIsMoreOpen(false)
                    }}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      activeTab === 'events'
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 hover:border-indigo-300"
                    }`}
                  >
                    <Calendar className={`h-5 w-5 mb-1 ${activeTab === 'events' ? "text-white" : "text-indigo-600 dark:text-indigo-400"}`} />
                    <span className="text-[10px] font-bold truncate w-full">Events</span>
                  </button>

                  {/* 6. Procurement & RFPs */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('procurement')
                      setIsMoreOpen(false)
                    }}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      activeTab === 'procurement'
                        ? "bg-teal-600 text-white shadow-xs"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 hover:border-teal-300"
                    }`}
                  >
                    <FileCheck className={`h-5 w-5 mb-1 ${activeTab === 'procurement' ? "text-white" : "text-teal-600 dark:text-teal-400"}`} />
                    <span className="text-[10px] font-bold truncate w-full">RFPs</span>
                  </button>

                  {/* 7. Launchpad */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('launchpad')
                      setIsMoreOpen(false)
                    }}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      activeTab === 'launchpad'
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 hover:border-purple-300"
                    }`}
                  >
                    <Rocket className={`h-5 w-5 mb-1 ${activeTab === 'launchpad' ? "text-white" : "text-purple-600 dark:text-purple-400"}`} />
                    <span className="text-[10px] font-bold truncate w-full">Launchpad</span>
                  </button>

                  {/* 8. CareerSuite AI / Resume Prep */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('careersuite')
                      setIsMoreOpen(false)
                    }}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      activeTab === 'careersuite'
                        ? "bg-cyan-600 text-white shadow-xs"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 hover:border-cyan-300"
                    }`}
                    title="Resume Preparation App & AI Tailoring Studio (https://www.connectln.app/connectin)"
                  >
                    <Award className={`h-5 w-5 mb-1 ${activeTab === 'careersuite' ? "text-white" : "text-cyan-600 dark:text-cyan-400"}`} />
                    <span className="text-[10px] font-bold truncate w-full">Resume Prep</span>
                  </button>

                  {/* 9. Noctis Social (https://www.noctis.social) */}
                  <a
                    href="https://www.noctis.social"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMoreOpen(false)}
                    className="p-2 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white border border-indigo-400/50 hover:border-indigo-300 shadow-xs col-span-3 sm:col-span-3 mt-1"
                    title="Open Noctis Social (https://www.noctis.social)"
                  >
                    <div className="flex items-center justify-center gap-2 w-full">
                      <Moon className="h-4 w-4 text-amber-300 shrink-0" />
                      <span className="text-xs font-extrabold tracking-tight">Noctis Social</span>
                      <span className="rounded-full bg-indigo-500/30 border border-indigo-400/40 px-2 py-0.2 text-[9px] font-mono font-bold text-indigo-200">
                        noctis.social ↗
                      </span>
                    </div>
                  </a>
                </div>
              </div>

              {categorizedMoreMenu.map((group) => (
                <div key={group.category} className="space-y-1">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2">
                    {group.category}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((menu) => (
                      <button
                        key={menu.id + menu.label}
                        type="button"
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

      {/* ── Mobile All-in-One Slide-Over Navigation Drawer (lg:hidden) ── */}
      {isMobileDrawerOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-[65] bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div
            className="lg:hidden fixed z-[70] inset-y-0 left-0 w-[min(380px,88vw)] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-200"
          >
            {/* Drawer Header: User Profile Summary */}
            <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50/90 dark:bg-zinc-800/40 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onSelectTab('profile')
                  setIsMobileDrawerOpen(false)
                }}
                className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group"
              >
                <div className="relative h-11 w-11 rounded-full overflow-hidden border-2 border-[#0A66C2]/40 shrink-0">
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate group-hover:text-[#0A66C2]">
                      {user.name}
                    </p>
                    <ShieldCheck className="h-3.5 w-3.5 text-[#0A66C2] shrink-0" />
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {user.headline}
                  </p>
                  <span className="text-[10px] font-semibold text-[#0A66C2] hover:underline">
                    View Profile →
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
                title="Close navigation"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Content: Scrollable Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-4 pb-20">
              {/* 1. PRIMARY CONNECTIN HUBS */}
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 px-1">
                  Core Navigation &amp; Hubs
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {/* Home */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('home')
                      setIsMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === 'home'
                        ? "bg-blue-50 border-[#0A66C2] text-[#0A66C2] font-bold dark:bg-blue-950/40"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <House className="h-5 w-5 text-[#0A66C2] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">Home Feed</p>
                      <p className="text-[10px] text-zinc-400 truncate">Main Stream</p>
                    </div>
                  </button>

                  {/* Marketplace */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('marketplace')
                      setIsMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === 'marketplace'
                        ? "bg-purple-50 border-purple-600 text-purple-700 font-bold dark:bg-purple-950/40 dark:text-purple-300"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <ShoppingBag className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate text-purple-700 dark:text-purple-300">Marketplace</p>
                      <p className="text-[10px] text-zinc-400 truncate">Tools &amp; Blueprints</p>
                    </div>
                  </button>

                  {/* Learning */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('learning')
                      setIsMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === 'learning'
                        ? "bg-blue-50 border-[#0A66C2] text-[#0A66C2] font-bold dark:bg-blue-950/40"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">Learning Hub</p>
                      <p className="text-[10px] text-zinc-400 truncate">Certs &amp; Sandboxes</p>
                    </div>
                  </button>

                  {/* Media */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('media')
                      setIsMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === 'media'
                        ? "bg-rose-50 border-rose-600 text-rose-700 font-bold dark:bg-rose-950/40 dark:text-rose-300"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <Tv className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate text-rose-700 dark:text-rose-300">Media Studio</p>
                      <p className="text-[10px] text-zinc-400 truncate">Talks &amp; Briefings</p>
                    </div>
                  </button>

                  {/* Messages */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('messaging')
                      setIsMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === 'messaging'
                        ? "bg-emerald-50 border-emerald-600 text-emerald-700 font-bold dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-bold truncate">Messaging</p>
                        {unreadMessagesCount > 0 && (
                          <span className="h-3.5 min-w-3.5 px-1 rounded-full bg-red-600 text-[9px] font-bold text-white flex items-center justify-center">
                            {unreadMessagesCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate">Direct Threads</p>
                    </div>
                  </button>

                  {/* Jobs */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('jobs')
                      setIsMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === 'jobs'
                        ? "bg-blue-50 border-[#0A66C2] text-[#0A66C2] font-bold dark:bg-blue-950/40"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">Jobs &amp; RFPs</p>
                      <p className="text-[10px] text-zinc-400 truncate">Bids &amp; Openings</p>
                    </div>
                  </button>

                  {/* Network */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('network')
                      setIsMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === 'network'
                        ? "bg-blue-50 border-[#0A66C2] text-[#0A66C2] font-bold dark:bg-blue-950/40"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <Users className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">My Network</p>
                      <p className="text-[10px] text-zinc-400 truncate">Peers &amp; Guilds</p>
                    </div>
                  </button>

                  {/* Notifications / Alerts */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('notifications')
                      setIsMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === 'notifications'
                        ? "bg-blue-50 border-[#0A66C2] text-[#0A66C2] font-bold dark:bg-blue-950/40"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-bold truncate">Alerts</p>
                        {unreadNotificationsCount > 0 && (
                          <span className="h-3.5 min-w-3.5 px-1 rounded-full bg-red-600 text-[9px] font-bold text-white flex items-center justify-center">
                            {unreadNotificationsCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate">Activity &amp; Invites</p>
                    </div>
                  </button>

                  {/* Pulse Rooms */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('pulserooms')
                      setIsMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === 'pulserooms'
                        ? "bg-blue-50 border-[#0A66C2] text-[#0A66C2] font-bold dark:bg-blue-950/40"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <Radio className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">Pulse Rooms</p>
                      <p className="text-[10px] text-zinc-400 truncate">Live Audio Stages</p>
                    </div>
                  </button>

                  {/* Wallet & Escrow */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('wallet')
                      setIsMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === 'wallet'
                        ? "bg-blue-50 border-[#0A66C2] text-[#0A66C2] font-bold dark:bg-blue-950/40"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <DollarSign className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">Wallet &amp; Escrow</p>
                      <p className="text-[10px] text-zinc-400 truncate">Draws &amp; Invoices</p>
                    </div>
                  </button>

                  {/* Company Directory */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('company')
                      setIsMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === 'company'
                        ? "bg-blue-50 border-[#0A66C2] text-[#0A66C2] font-bold dark:bg-blue-950/40"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">Company Directory</p>
                      <p className="text-[10px] text-zinc-400 truncate">GC &amp; Enterprise Registry</p>
                    </div>
                  </button>

                  {/* Guilds & Ecosystem */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('guilds')
                      setIsMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === 'guilds'
                        ? "bg-amber-50 border-amber-600 text-amber-700 font-bold dark:bg-amber-950/40"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">Guilds &amp; Enclaves</p>
                      <p className="text-[10px] text-zinc-400 truncate">Master Societies</p>
                    </div>
                  </button>

                  {/* Bounties & Hackathons */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('bounties')
                      setIsMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === 'bounties'
                        ? "bg-orange-50 border-orange-600 text-orange-700 font-bold dark:bg-orange-950/40"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <Flame className="h-5 w-5 text-orange-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">Bounties &amp; Prizes</p>
                      <p className="text-[10px] text-zinc-400 truncate">Open Challenges</p>
                    </div>
                  </button>

                  {/* Events & Live Demos */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('events')
                      setIsMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === 'events'
                        ? "bg-indigo-50 border-indigo-600 text-indigo-700 font-bold dark:bg-indigo-950/40"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">Events &amp; Demos</p>
                      <p className="text-[10px] text-zinc-400 truncate">Live Sessions</p>
                    </div>
                  </button>

                  {/* Procurement & RFPs */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('procurement')
                      setIsMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === 'procurement'
                        ? "bg-teal-50 border-teal-600 text-teal-700 font-bold dark:bg-teal-950/40"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <FileCheck className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">Procurement &amp; RFPs</p>
                      <p className="text-[10px] text-zinc-400 truncate">Spend &amp; Solicitations</p>
                    </div>
                  </button>

                  {/* Launchpad */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('launchpad')
                      setIsMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === 'launchpad'
                        ? "bg-purple-50 border-purple-600 text-purple-700 font-bold dark:bg-purple-950/40"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <Rocket className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">Launchpad</p>
                      <p className="text-[10px] text-zinc-400 truncate">Startups &amp; Projects</p>
                    </div>
                  </button>

                  {/* CareerSuite AI */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('careersuite')
                      setIsMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === 'careersuite'
                        ? "bg-cyan-50 border-cyan-600 text-cyan-700 font-bold dark:bg-cyan-950/40"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <Award className="h-5 w-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">CareerSuite AI</p>
                      <p className="text-[10px] text-zinc-400 truncate">Interview &amp; Resumes</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. ENCLAVE INDUSTRY MODULES */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 px-1">
                  Enclave Industry Tools &amp; Apps
                </p>
                <div className="space-y-3">
                  {categorizedMoreMenu.map((group) => (
                    <div key={group.category} className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 px-1">
                        {group.category}
                      </p>
                      <div className="space-y-1">
                        {group.items.map((menu) => (
                          <button
                            key={menu.id + menu.label}
                            type="button"
                            onClick={() => {
                              if (menu.url) {
                                window.open(menu.url, '_blank', 'noopener,noreferrer')
                              } else {
                                onSelectTab(menu.id)
                              }
                              setIsMobileDrawerOpen(false)
                            }}
                            className="w-full rounded-xl p-2 text-left bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between group cursor-pointer border border-zinc-200/50 dark:border-zinc-700/50"
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

              {/* 3. QUICK PREFERENCES & SETTINGS */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
                  Preferences &amp; Security
                </p>
                <div className="flex items-center justify-between gap-2 px-2 py-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
                  <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">Theme Mode</span>
                  <ThemeColorSwitcher align="right" />
                </div>
                <div className="flex items-center justify-between gap-2 px-2 py-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
                  <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">Language</span>
                  <LanguageSwitcher align="right" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('accountsecurity')
                    setIsMobileDrawerOpen(false)
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-700/50 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">🔐 Passkeys &amp; Security</span>
                  <span className="text-zinc-400">→</span>
                </button>
                {isAdminUser && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('adminiam')
                      setIsMobileDrawerOpen(false)
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-red-50/70 dark:bg-red-950/40 hover:bg-red-100 text-xs font-bold text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-900/60 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">🛡️ Admin &amp; IAM Console</span>
                    <span className="text-red-400">→</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
    {/* Spacer matching the fixed 2-row mobile header (99px / 103px) and 1-row desktop header (56px) */}
    <div className="h-[99px] sm:h-[103px] lg:h-14 w-full shrink-0" aria-hidden="true" />
    </>
  )
}
