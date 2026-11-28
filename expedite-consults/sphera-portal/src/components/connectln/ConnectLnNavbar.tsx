"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
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
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Settings,
  HelpCircle,
  Globe,
  TrendingUp,
  Plus,
  Compass,
  CheckCircle2,
  PhoneCall,
  Download,
  PlayCircle,
  ClipboardList,
  FileSignature,
  FileText,
  Kanban,
  Table2,
  Presentation,
  Receipt,
  Crown
} from "lucide-react"
import { UserProfile, SuggestedConnection, getEnclaveConnectedMembers } from "@/lib/connectln-data"
import { WORK_BUSINESS_MENU_ITEMS, WorkBusinessItemId } from "@/lib/work-business-data"
import { ConnectInLogo } from "@/components/brand/ConnectInLogo"
import { isSuperAdminUser } from "@/lib/connectin-profile"
import { getCategorizedMoreMenu, getEnclaveSearchPlaceholder, getEnclaveModules } from "@/lib/connectin-navbar-data"
import { findEnclaveById, ALL_PROFESSIONS, PROFESSION_ENCLAVES } from "@/lib/connectin-professions"
import { loadStoredAdminUsers } from "@/lib/connectin-storage"
import { CONNECTLN_POWER_APPS, loadPinnedPowerAppIds } from "@/lib/connectln-power-apps"
import { recordLiveDirectoryDiscovery } from "@/lib/connectin-analytics"
import { ThemeColorSwitcher } from "@/components/theme/ThemeColorSwitcher"
import { LanguageSwitcher } from "@/components/language/LanguageSwitcher"
import { useLanguage } from "@/context/LanguageContext"

interface ConnectLnNavbarProps {
  user: UserProfile
  activeTab: string
  onSelectTab: (tabId: string) => void
  onSelectWorkBusinessItem?: (itemId: WorkBusinessItemId) => void
  activeWorkBusinessItem?: WorkBusinessItemId
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
  onSelectWorkBusinessItem,
  activeWorkBusinessItem = 'find_work',
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
  const [isAppLauncherOpen, setIsAppLauncherOpen] = useState(false)
  const [pinnedPowerAppIds, setPinnedPowerAppIds] = useState<string[]>(["sign", "invoice", "fetch", "services"])
  useEffect(() => {
    setPinnedPowerAppIds(loadPinnedPowerAppIds())
    const syncPins = () => setPinnedPowerAppIds(loadPinnedPowerAppIds())
    window.addEventListener("connectln_pinned_power_apps_change", syncPins)
    window.addEventListener("storage", syncPins)
    return () => {
      window.removeEventListener("connectln_pinned_power_apps_change", syncPins)
      window.removeEventListener("storage", syncPins)
    }
  }, [])
  const [hoveredWorkBusinessId, setHoveredWorkBusinessId] = useState<WorkBusinessItemId>(activeWorkBusinessItem || 'find_work')
  const [showLegacyHubsInMore, setShowLegacyHubsInMore] = useState(false)
  const [showMeWorkspaceSwitcher, setShowMeWorkspaceSwitcher] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchDropdownTab, setSearchDropdownTab] = useState<'all' | 'members' | 'modules' | 'skills'>('all')
  const [liveDirectoryUsers, setLiveDirectoryUsers] = useState<Array<{
    id: string
    name: string
    email?: string
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
  const appLauncherRef = useRef<HTMLDivElement>(null)

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
      if (isAppLauncherOpen && appLauncherRef.current && !appLauncherRef.current.contains(target)) {
        setIsAppLauncherOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMoreOpen(false)
        setIsMeOpen(false)
        setIsAppLauncherOpen(false)
        setIsMobileSearchOpen(false)
        setIsMobileDrawerOpen(false)
      }
    }

    if (isMoreOpen || isMeOpen || isAppLauncherOpen) {
      document.addEventListener("mousedown", handleOutsideClick)
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isMoreOpen, isMeOpen, isAppLauncherOpen])

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

  // Mobile tab strip reference (always starts cleanly at Home on the left, matching laptop order)
  const tabStripRef = useRef<HTMLDivElement>(null)

  // Tablet/mobile tab strip: show scroll hints so tabs past the edge (RFPs, Launchpad, Resume Prep...) are discoverable
  const [stripCanScrollLeft, setStripCanScrollLeft] = useState(false)
  const [stripCanScrollRight, setStripCanScrollRight] = useState(false)
  useEffect(() => {
    const el = tabStripRef.current
    if (!el) return
    const update = () => {
      setStripCanScrollLeft(el.scrollLeft > 4)
      setStripCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    }
    update()
    el.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      el.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])
  const scrollTabStrip = (direction: 1 | -1) => {
    tabStripRef.current?.scrollBy({ left: direction * 240, behavior: "smooth" })
  }
  // Keep the active tab in view in the strip (e.g. after opening RFPs from the More menu)
  useEffect(() => {
    const el = tabStripRef.current
    if (!el || !activeTab) return
    const btn = el.querySelector<HTMLElement>(`[data-nav-id="${activeTab}"]`)
    if (btn && btn.offsetParent !== null) {
      const target = btn.offsetLeft - el.clientWidth / 2 + btn.clientWidth / 2
      el.scrollTo({ left: Math.max(0, target), behavior: "smooth" })
    }
  }, [activeTab])

  // Streamlined Clean Primary Navigation with Responsive Priority Levels
  const [visitedBadgeTabs, setVisitedBadgeTabs] = React.useState<Record<string, boolean>>({})
  React.useEffect(() => {
    if (activeTab) setVisitedBadgeTabs((p) => (p[activeTab] ? p : { ...p, [activeTab]: true }))
  }, [activeTab])
  const primaryNavItemsRaw = [
    { id: "home", label: t("nav_home", "Home"), shortLabel: t("nav_home_short", "Home"), icon: House, badge: 0, priority: "always" },
    { id: "network", label: t("nav_network", "My Network"), shortLabel: t("nav_network_short", "My Network"), icon: Users, badge: 0, priority: "always" },
    { id: "jobs", label: t("nav_jobs", "Jobs"), shortLabel: t("nav_jobs_short", "Jobs"), icon: Briefcase, badge: 0, priority: "always" },
    { id: "messaging", label: t("nav_messages", "Messaging"), shortLabel: t("nav_messages_short", "Messaging"), icon: MessageSquare, badge: unreadMessagesCount || 0, priority: "always" },
    { id: "notifications", label: t("nav_alerts", "Alerts"), shortLabel: t("nav_alerts_short", "Alerts"), icon: Bell, badge: unreadNotificationsCount || 3, priority: "always" },
    { id: "marketplace", label: t("nav_marketplace", "Marketplace"), shortLabel: t("nav_marketplace_short", "Market"), icon: ShoppingBag, badge: 0, isMarketplace: true, priority: "always" },
    { id: "learning", label: t("nav_learning", "Learning"), shortLabel: t("nav_learning_short", "Learning"), icon: GraduationCap, badge: 0, priority: "always" },
    { id: "media", label: t("nav_media", "Media"), shortLabel: t("nav_media_short", "Media"), icon: Tv, badge: 0, priority: "always" },
    { id: "pulserooms", label: t("nav_pulse", "Pulse"), shortLabel: t("nav_pulse_short", "Pulse"), icon: Radio, badge: 0, priority: "always" },
  ]
  const primaryNavItems = primaryNavItemsRaw.map((i) => ({ ...i, badge: visitedBadgeTabs[i.id] ? 0 : i.badge }))

  const isAdminUser = isSuperAdminUser(user)

  const categorizedMoreMenu = getCategorizedMoreMenu(user.professionEnclave, isAdminUser, user.profession)

  // Load all registered accounts from localStorage vault + live /api/connectin/users
  useEffect(() => {
    const loadAllUsers = () => {
      try {
        const localAccounts = loadStoredAdminUsers().map((acc, idx) => ({
          id: acc.id || `vault_${idx}_${acc.email}`,
          name: acc.name || acc.email.split("@")[0],
          email: acc.email || "",
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

    fetch("/api/connectin/users", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (data?.users && Array.isArray(data.users)) {
          const apiUsers = data.users.map((u: any) => ({
            id: u.id || `api_${u.email || u.name}`,
            name: u.name || "ConnectIn Member",
            email: u.email || "",
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
              index === self.findIndex(t =>
                t.name.toLowerCase() === item.name.toLowerCase() &&
                (t.email || "").toLowerCase() === (item.email || "").toLowerCase()
              )
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
      name: "Elena Rostova, RN, CCRN",
      headline: "Lead Trauma Clinical Nurse Specialist (BSN, CCRN, TNCC) · Johns Hopkins Hospital",
      avatar: "https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=400&auto=format&fit=crop&q=80",
      capabilities: ["Level 1 Trauma Triage", "CCRN Critical Care", "TNCC Protocol"],
      role: "Trauma Nurse Lead"
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
      email: (p as any).email || "",
      headline: p.headline,
      avatar: p.avatar,
      capabilities: p.capabilities || [],
      role: "Member"
    })),
    ...defaultDirectory.map(d => ({ ...d, email: "" })),
    ...allEnclaveMembers.map(m => ({ ...m, email: "" }))
  ].filter((item, index, self) =>
    index === self.findIndex(t =>
      t.name.toLowerCase() === item.name.toLowerCase() &&
      ((t as any).email || "").toLowerCase() === ((item as any).email || "").toLowerCase()
    )
  )

  // Core Platform Modules & Connected Ecosystem Apps + All Enclave Modules
  const CORE_PLATFORM_MODULES = [
    { id: "home", label: "Home Feed & Command Stream", icon: "🏠", badge: "Core", desc: "Primary professional feed, announcements, and enclave updates", url: undefined as string | undefined },
    { id: "network", label: "My Network & Member Directory", icon: "👥", badge: "Core", desc: "Discover and connect with verified professionals across all enclaves", url: undefined },
    { id: "jobs", label: "Jobs & Talent Board", icon: "💼", badge: "Careers", desc: "Cleared roles, enterprise positions, and AI-matched opportunities", url: undefined },
    { id: "veterans", label: "ConnectLn Veterans Network", icon: "🎖️", badge: "Veterans", desc: "Military Skills Translator, career transition jobs, VetFran & veteran mentorship", url: undefined },
    { id: "franchises", label: "ConnectLn Franchise Network", icon: "🏪", badge: "Franchises", desc: "Franchise directory, FDD opportunities, investors, suppliers & resale marketplace", url: undefined },
    { id: "careersuite", label: "Resume Prep & CareerSuite AI", icon: "📄", badge: "AI", desc: "Upload resume, ATS optimizer, salary intelligence, and interview simulator", url: undefined },
    { id: "messaging", label: "Encrypted Messaging", icon: "💬", badge: "Comms", desc: "Direct messages and end-to-end encrypted professional threads", url: undefined },
    { id: "vibecomms", label: "NoctisChat & Video Conferencing", icon: "📹", badge: "Live", desc: "HD video meetings, screen sharing, and team war rooms", url: undefined },
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
    { id: "noctissocial", label: "Noctis Social (noctis.social)", icon: "🎬", badge: "360 Universe", desc: "Create, learn, and connect in 60 seconds — embedded inside ConnectLn 360", url: undefined },
    { id: "noctisclinic", label: "Noctis Clinic (dstrike.app/noctis)", icon: "⚡", badge: "360 Universe", desc: "Watch a Spark. Pass a drill. Take the stamp — embedded inside ConnectLn 360", url: undefined },
    { id: "ext-desknote", label: "Desk Note", icon: "📓", badge: "Live App", desc: "Unified digital notebook, field logs & collaborative workspace (https://desk-note.app/)", url: "https://desk-note.app/" },
    { id: "ext-noctis-ai", label: "Ask Noctis AI", icon: "🌌", badge: "Live App", desc: "Autonomous Cyber & Enterprise Intelligence Assistant (www.dstrike.app/noctis)", url: "https://www.dstrike.app/noctis" },
    { id: "ext-pdfadore", label: "PDFAdore Document Suite", icon: "📑", badge: "Live App", desc: "Sign, convert, redact, and analyze PDF documents", url: "https://www.pdfadore.com" },
    { id: "ext-launchpad", label: "Expedite Launchpad Hub", icon: "⚡", badge: "Live App", desc: "Unified Expedite Consults enterprise application portal", url: "https://launchpad.expediteconsults.com" },
    { id: "powerapps", label: `ConnectLn Power Apps Hub (All ${CONNECTLN_POWER_APPS.length} Apps)`, icon: "⚡", badge: "Power Apps", desc: `Launch all ${CONNECTLN_POWER_APPS.length} ConnectLn Power Apps from one uncluttered workspace`, url: undefined },
    ...CONNECTLN_POWER_APPS.filter((a) => a.kind === "external").map((app) => ({
      id: `powerapp_${app.id}`,
      label: `${app.name} — Power App`,
      icon: app.emoji,
      badge: "Power App",
      desc: app.tagline,
      url: app.liveUrl,
    })),
  ]

  const allEnclaveModules = [
    ... getEnclaveModules(user.professionEnclave, isAdminUser),
    ...PROFESSION_ENCLAVES.flatMap(e => getEnclaveModules(e.id, isAdminUser))
  ]

  const ALL_MODULES = [...CORE_PLATFORM_MODULES, ...allEnclaveModules].filter(
    (mod, idx, self) =>
      idx === self.findIndex(m => m.id === mod.id || m.label.toLowerCase() === mod.label.toLowerCase())
  )

  const isNavbarTokenEditOne = (a: string, b: string) => {
    if (a === b) return true
    if (Math.abs(a.length - b.length) > 1) return false
    let i = 0
    let j = 0
    let edits = 0
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) {
        i += 1
        j += 1
      } else {
        edits += 1
        if (edits > 1) return false
        if (a.length > b.length) i += 1
        else if (b.length > a.length) j += 1
        else {
          i += 1
          j += 1
        }
      }
    }
    if (i < a.length || j < b.length) edits += 1
    return edits <= 1
  }

  const scoreNavbarSearchTokens = (fields: (string | undefined)[], query: string): number => {
    const q = query.toLowerCase().trim()
    if (!q) return 1
    const tokens = q.split(/\s+/).filter(Boolean)
    const haystack = fields.filter(Boolean).join(" ").toLowerCase()
    const words = haystack.split(/[^a-z0-9]+/).filter(Boolean)
    let score = 0
    for (const token of tokens) {
      if (haystack.includes(token)) {
        score += 2
        continue
      }
      if (
        token.length >= 3 &&
        words.some(
          (w) =>
            isNavbarTokenEditOne(token, w) ||
            (w.length >= token.length && isNavbarTokenEditOne(token, w.slice(0, token.length)))
        )
      ) {
        score += 1
        continue
      }
      return 0
    }
    return score
  }

  // Multi-word token matcher so users can search any combination of words
  const matchesSearchTokens = (fields: (string | undefined)[], query: string) =>
    scoreNavbarSearchTokens(fields, query) > 0

  // Filter members by query (exact substring matches prioritized ahead of 1-typo fuzzy matches)
  const matchingMembers = (searchQuery.trim()
    ? allSearchableMembers
        .map((p) => ({
          member: p,
          score: scoreNavbarSearchTokens(
            [p.name, (p as any).email, p.headline, p.role, ...(p.capabilities || [])],
            searchQuery
          ),
        }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.member)
    : allSearchableMembers.filter(p => p.name.toLowerCase() !== (user?.name || "").toLowerCase())
  ).slice(0, searchDropdownTab === 'members' ? 12 : 5)

  // Track search lookup appearances when a user searches for members in the Navbar
  useEffect(() => {
    const qTrimmed = searchQuery.trim()
    if (!isSearchFocused || qTrimmed.length < 2) return
    const timer = setTimeout(() => {
      matchingMembers.slice(0, 5).forEach((member) => {
        recordLiveDirectoryDiscovery({
          targetName: member.name,
          keyword: qTrimmed,
          searcherName: user?.name || 'ConnectLn Member',
          searcherHeadline: user?.headline || 'Verified ConnectLn Professional',
          searcherAvatar: user?.avatar,
          searcherCompany: (user as any)?.company || 'ConnectLn Network',
          source: 'Navbar Directory Lookup',
          discoveryType: 'search_appearance'
        })
      })
    }, 550)
    return () => clearTimeout(timer)
  }, [isSearchFocused, searchQuery, matchingMembers.length, user?.name])

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
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full max-w-full border-b border-[#E7E2DA] bg-white/95 dark:border-zinc-800 dark:bg-zinc-950/95 backdrop-blur-md shadow-xs"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* Mobile Expandable Search Bar Overlay (when search icon tapped on mobile) */}
      {isMobileSearchOpen && (
        <div
          className="lg:hidden absolute inset-x-0 top-0 z-50 bg-white dark:bg-zinc-900 px-3 pb-2 border-b border-zinc-200 dark:border-zinc-800 shadow-md flex items-center gap-2"
          style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 8px)" }}
        >
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

      {/* Top Header: ConnectLn 360 App Launcher, Brand Logo, Spacious Search Pill & Clean Right Actions */}
      <div className="mx-auto flex min-h-[56px] h-[56px] lg:h-[52px] max-w-[1600px] items-center justify-between px-2.5 sm:px-4 gap-2">
        {/* Left Side: 9-Dot App Launcher (Desktop), Mobile Menu Drawer Button, Brand Logo & Search Input */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 lg:flex-initial lg:shrink-0">
          {/* Far-Left ConnectLn 360 9-Dot App Launcher (lg+) */}
          <div ref={appLauncherRef} className="hidden lg:block relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsAppLauncherOpen((prev) => !prev)
                setIsMeOpen(false)
                setIsMoreOpen(false)
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors cursor-pointer ${
                isAppLauncherOpen
                  ? "bg-[#0067B8] text-white shadow-xs"
                  : "text-[#0B1F3A] hover:bg-[#FAF7F2] dark:text-zinc-200 dark:hover:bg-zinc-800"
              }`}
              title="ConnectLn 360 App Launcher"
              aria-label="Open ConnectLn 360 App Launcher"
            >
              <Grid3X3 strokeWidth={1.9} className="h-5 w-5" />
            </button>

            {isAppLauncherOpen && (
              <div className="absolute left-0 top-11 z-[60] w-[356px] max-h-[calc(100vh-76px)] overflow-y-auto rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-[0_24px_60px_rgba(11,31,58,0.16)] animate-in fade-in zoom-in-95 space-y-3">
                <div className="flex items-center justify-between border-b border-[#EFECE6] dark:border-zinc-800 pb-2.5">
                  <span className="text-xs font-extrabold tracking-tight text-[#0B1F3A] dark:text-zinc-100">
                    ConnectLn 360 Apps
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAppLauncherOpen(false)
                      setIsMoreOpen(true)
                    }}
                    className="text-[11px] font-bold text-[#0067B8] dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    All Business Hubs →
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "home", label: "Home", icon: House, bg: "bg-[#0067B8]" },
                    { id: "messaging", label: "Mail & Chat", icon: MessageSquare, bg: "bg-[#0F6CBD]" },
                    { id: "vibecomms", label: "HD Calls", icon: PhoneCall, bg: "bg-emerald-600" },
                    { id: "network", label: "Network", icon: Users, bg: "bg-indigo-600" },
                    { id: "jobs", label: "Jobs", icon: Briefcase, bg: "bg-sky-700" },
                    { id: "learning", label: "Learning", icon: GraduationCap, bg: "bg-amber-600" },
                    { id: "marketplace", label: "Market", icon: ShoppingBag, bg: "bg-violet-600" },
                    { id: "media", label: "Media", icon: Tv, bg: "bg-rose-600" },
                    { id: "pulserooms", label: "Pulse", icon: Radio, bg: "bg-teal-600" },
                    { id: "workbusiness", label: "Business", icon: Building2, bg: "bg-[#0B1F3A]" },
                    { id: "__noctis", label: "Noctis AI", icon: Sparkles, bg: "bg-blue-700" },
                    { id: "accountsecurity", label: "Security", icon: ShieldCheck, bg: "bg-zinc-700" },
                    { id: "plans", label: "Plans", icon: Crown, bg: "bg-[#0067B8]" },
                  ].map((app) => {
                    const AppIcon = app.icon
                    const isAppActive =
                      activeTab === app.id ||
                      (app.id === "vibecomms" && activeTab === "vibe")
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => {
                          setIsAppLauncherOpen(false)
                          if (app.id === "__noctis") {
                            onOpenAIAssistant && onOpenAIAssistant()
                          } else {
                            onSelectTab(app.id)
                          }
                        }}
                        className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-center border transition-all cursor-pointer ${
                          isAppActive
                            ? "border-[#0067B8] bg-[#FAF7F2] dark:bg-zinc-800"
                            : "border-transparent hover:border-[#E7E2DA] hover:bg-[#FAF7F2]/80 dark:hover:bg-zinc-800/70"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-2xs ${app.bg}`}
                        >
                          <AppIcon className="h-4.5 w-4.5" />
                        </span>
                        <span className="mt-1.5 text-[11px] font-semibold text-[#0B1F3A] dark:text-zinc-100 truncate w-full">
                          {app.label}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* ConnectLn 360 Studio — Proprietary Docs, Sheets & Slides */}
                <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/90 dark:bg-zinc-950/70 p-2.5 space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B5CAD] dark:text-sky-400">
                      ConnectLn 360 Studio
                    </span>
                    <span className="rounded-full bg-white dark:bg-zinc-800 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-0.5 text-[9.5px] font-bold text-[#0B1F3A] dark:text-zinc-300">
                      Built by ConnectLn
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        id: "docs",
                        label: "Docs",
                        sub: "Documents",
                        icon: FileText,
                        bg: "bg-[#0B5CAD]",
                      },
                      {
                        id: "sheets",
                        label: "Sheets",
                        sub: "Spreadsheets",
                        icon: Table2,
                        bg: "bg-[#107C41]",
                      },
                      {
                        id: "slides",
                        label: "Slides",
                        sub: "Decks",
                        icon: Presentation,
                        bg: "bg-[#C84B28]",
                      },
                    ].map((sApp) => {
                      const SIcon = sApp.icon
                      const isSActive = activeTab === sApp.id
                      return (
                        <button
                          key={sApp.id}
                          type="button"
                          onClick={() => {
                            setIsAppLauncherOpen(false)
                            onSelectTab(sApp.id)
                          }}
                          className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all cursor-pointer ${
                            isSActive
                              ? "border-[#0067B8] bg-white dark:bg-zinc-800 shadow-2xs"
                              : "border-transparent bg-white/80 dark:bg-zinc-900/80 hover:border-[#E7E2DA] dark:hover:border-zinc-700"
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-2xs ${sApp.bg}`}
                          >
                            <SIcon className="h-4 w-4" />
                          </span>
                          <span className="mt-1 text-[11px] font-extrabold text-[#0B1F3A] dark:text-zinc-100 leading-tight">
                            {sApp.label}
                          </span>
                          <span className="text-[9.5px] text-[#6B7280] dark:text-zinc-400 truncate max-w-full">
                            {sApp.sub}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* ConnectLn Power Apps — Top 4 Pinned + All 20 Hub Link */}
                <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/30 p-2.5 space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4338CA] dark:text-indigo-400">
                      ConnectLn Power Apps
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAppLauncherOpen(false)
                        onSelectTab("powerapps")
                      }}
                      className="rounded-full bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 text-[10px] font-bold text-[#4338CA] dark:text-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      All {CONNECTLN_POWER_APPS.length} Apps →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {pinnedPowerAppIds
                      .map((pid) => CONNECTLN_POWER_APPS.find((a) => a.id === pid))
                      .filter((a): a is (typeof CONNECTLN_POWER_APPS)[number] => Boolean(a))
                      .slice(0, 4)
                      .map((pApp) => {
                        const isPActive =
                          (pApp.studioTab && activeTab === pApp.studioTab) ||
                          activeTab === "powerapps"
                        return (
                          <button
                            key={pApp.id}
                            type="button"
                            onClick={() => {
                              setIsAppLauncherOpen(false)
                              if (pApp.kind === "studio" && pApp.studioTab) {
                                onSelectTab(pApp.studioTab)
                              } else {
                                if (typeof window !== "undefined") {
                                  window.dispatchEvent(
                                    new CustomEvent("connectln_open_power_app", {
                                      detail: { appId: pApp.id },
                                    })
                                  )
                                }
                                onSelectTab("powerapps")
                              }
                            }}
                            className={`flex items-center gap-2 rounded-xl border p-2 text-left transition-all cursor-pointer ${
                              isPActive
                                ? "border-[#4338CA] bg-white dark:bg-zinc-800 shadow-2xs"
                                : "border-transparent bg-white/85 dark:bg-zinc-900/85 hover:border-indigo-300 dark:hover:border-indigo-700"
                            }`}
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-sm shadow-2xs ${pApp.solidBgClass}`}
                            >
                              {pApp.emoji}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] font-extrabold text-[#0B1F3A] dark:text-zinc-100 leading-tight truncate">
                                {pApp.name}
                              </div>
                              <div className="text-[9.5px] text-[#6B7280] dark:text-zinc-400 truncate">
                                {pApp.category}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                  </div>
                </div>

                {/* ConnectLn 360 Universe */}
                <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/80 dark:bg-zinc-950/60 p-2 space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0067B8] dark:text-sky-400">
                      ConnectLn 360 Universe
                    </span>
                    <span className="text-[10px] font-semibold text-[#6B7280] dark:text-zinc-400">
                      Unified Apps
                    </span>
                  </div>
                  {[
                    {
                      id: "noctissocial",
                      name: "Noctis Social",
                      host: "noctis.social",
                      desc: "60s video, learning & community",
                      href: "https://noctis.social",
                      icon: PlayCircle,
                      accentBg: "bg-fuchsia-600",
                    },
                    {
                      id: "noctisclinic",
                      name: "Noctis Clinic",
                      host: "www.dstrike.app/noctis",
                      desc: "Watch a Spark · Pass a drill · Take the stamp",
                      href: "https://www.dstrike.app/noctis",
                      icon: Zap,
                      accentBg: "bg-cyan-600",
                    },
                  ].map((uApp) => {
                    const UIcon = uApp.icon
                    const isUActive = activeTab === uApp.id
                    return (
                      <div
                        key={uApp.id}
                        className={`flex items-center justify-between gap-2 rounded-xl border px-2 py-1.5 transition-colors ${
                          isUActive
                            ? "border-[#0067B8] bg-white dark:bg-zinc-800"
                            : "border-transparent bg-white/80 dark:bg-zinc-900/70 hover:border-[#E7E2DA] dark:hover:border-zinc-700"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setIsAppLauncherOpen(false)
                            onSelectTab(uApp.id)
                          }}
                          className="flex flex-1 min-w-0 items-center gap-2.5 text-left cursor-pointer"
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs ${uApp.accentBg}`}
                          >
                            <UIcon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#0B1F3A] dark:text-zinc-100 truncate">
                              {uApp.name}{" "}
                              <span className="font-mono text-[10px] font-medium text-[#6B7280] dark:text-zinc-400">
                                ({uApp.host})
                              </span>
                            </p>
                            <p className="text-[10.5px] text-[#4B5563] dark:text-zinc-400 truncate">
                              {uApp.desc}
                            </p>
                          </div>
                        </button>
                        <a
                          href={uApp.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsAppLauncherOpen(false)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#4B5563] hover:text-[#0067B8] hover:bg-[#FAF7F2] dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                          title={`Open ${uApp.name} in new tab (${uApp.href})`}
                          aria-label={`Open ${uApp.name} in new tab`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )
                  })}
                </div>

                <Link
                  href="/connectin-portal#download-app"
                  onClick={() => setIsAppLauncherOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-[#FAF7F2] dark:bg-zinc-800/70 px-3 py-2 text-xs font-bold text-[#0B1F3A] dark:text-zinc-100 hover:border-[#0067B8] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Download className="h-3.5 w-3.5 text-[#0067B8]" />
                    <span>ConnectLn 360 Portal &amp; Mobile App</span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                </Link>
              </div>
            )}
          </div>

          {/* Prominent Mobile Menu Drawer Button (< lg) */}
          <button
            type="button"
            onClick={() => {
              setIsMobileDrawerOpen(true)
              setIsMeOpen(false)
              setIsMoreOpen(false)
            }}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all shrink-0 cursor-pointer"
            title="Open ConnectLn menus"
            aria-label="Open ConnectLn menus"
          >
            <Menu strokeWidth={2} className="h-5 w-5" />
          </button>

          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-1.5 focus:outline-none group shrink-0 cursor-pointer"
            title="ConnectLn 360 Home"
          >
            <ConnectInLogo size="sm" showSubtitle={false} compactOnMobile className="shrink-0" />
          </button>

          {/* Mobile & Tablet Search Pill (< lg) */}
          <button
            type="button"
            onClick={() => {
              if (onOpenUniversalSearch) {
                onOpenUniversalSearch()
              } else {
                setIsMobileSearchOpen(true)
              }
            }}
            className="lg:hidden flex h-10 flex-1 min-w-0 max-w-none sm:max-w-[360px] items-center gap-2 rounded-full bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3.5 text-left transition-colors cursor-pointer"
            title={t("search_placeholder", "I'm looking for...")}
          >
            <Search className="h-4 w-4 text-[#666666] dark:text-zinc-400 shrink-0" />
            <span
              style={{ fontWeight: 400 }}
              className="text-[13.5px] leading-5 text-[#666666] dark:text-zinc-400 truncate"
            >
              {searchQuery || t("search_placeholder", "I'm looking for...")}
            </span>
          </button>

          {/* Spacious ConnectLn 360 Desktop Search Bar */}
          <div className="hidden lg:block relative w-[270px] xl:w-[370px] 2xl:w-[440px] ml-2 transition-all duration-200">
            <div
              className={`flex h-[36px] items-center gap-2 rounded-full bg-[#FAF7F2] px-3.5 transition-all dark:bg-zinc-900 border ${
                isSearchFocused
                  ? "ring-2 ring-[#0067B8]/30 border-[#0067B8] bg-white shadow-xs dark:border-sky-400"
                  : "border-[#E7E2DA] hover:border-[#C9C2B6] dark:border-zinc-700"
              }`}
            >
              <Search
                className="h-4 w-4 text-[#666666] dark:text-zinc-400 shrink-0 cursor-pointer"
                onClick={() => {
                  onOpenUniversalSearch && onOpenUniversalSearch()
                  setIsSearchFocused(false)
                }}
              />
              <input
                type="text"
                placeholder={t("search_placeholder", "I'm looking for...")}
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
                style={{ fontWeight: 400 }}
                className="w-full bg-transparent text-[14px] leading-5 text-[#191919] placeholder:text-[#666666] focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400 truncate"
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
                                recordLiveDirectoryDiscovery({
                                  targetName: member.name,
                                  keyword: searchQuery.trim() || member.name,
                                  searcherName: user?.name || 'ConnectLn Member',
                                  searcherHeadline: user?.headline || 'Verified ConnectLn Professional',
                                  searcherAvatar: user?.avatar,
                                  searcherCompany: (user as any)?.company || 'ConnectLn Network',
                                  source: 'Navbar Lookup Click',
                                  discoveryType: 'profile_click'
                                })
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

        {/* Right ConnectLn 360 Utility Bar (Primary sections live cleanly in the Left Rail & 9-Dot App Launcher on lg+) */}
        <div className="flex items-center gap-1 xl:gap-1.5 ml-auto shrink-0">
          <nav className="hidden lg:flex items-center h-[52px] gap-1.5 shrink-0">
            <Link
              href="/connectin-portal#download-app"
              className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-[#E7E2DA] dark:border-zinc-700 bg-[#FAF7F2] dark:bg-zinc-900 hover:border-[#0067B8] px-3 py-1.5 text-xs font-bold text-[#0B1F3A] dark:text-zinc-200 transition-colors shrink-0"
              title="Open ConnectLn 360 Portal & Mobile Downloads"
            >
              <Download className="h-3.5 w-3.5 text-[#0067B8]" />
              <span>360 Portal</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                if (onOpenAIAssistant) onOpenAIAssistant()
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 dark:border-sky-800 bg-sky-50/90 dark:bg-sky-950/50 hover:bg-sky-100 px-3 py-1.5 text-xs font-bold text-[#0067B8] dark:text-sky-300 transition-colors shrink-0 cursor-pointer"
              title="Ask Noctis AI"
            >
              <Sparkles strokeWidth={2} className="h-3.5 w-3.5" />
              <span>{t("nav_ask_noctis", "Ask Noctis")}</span>
            </button>

            {(() => {
              const alertsItem = primaryNavItems.find((i) => i.id === "notifications")
              const alertsBadge = alertsItem?.badge || 0
              const alertsActive = activeTab === "notifications"
              return (
                <button
                  type="button"
                  onClick={() => onSelectTab("notifications")}
                  className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors shrink-0 cursor-pointer ${
                    alertsActive
                      ? "bg-[#FAF7F2] text-[#0067B8] dark:bg-zinc-800 dark:text-sky-400"
                      : "text-[#4B5563] hover:bg-[#FAF7F2] hover:text-[#0B1F3A] dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                  }`}
                  title={t("nav_alerts", "Alerts")}
                  aria-label={t("nav_alerts", "Alerts")}
                >
                  <Bell strokeWidth={alertsActive ? 2.2 : 1.8} className="h-4.5 w-4.5" />
                  {alertsBadge > 0 && (
                    <span
                      style={{ backgroundColor: "#CB112D", color: "#FFFFFF", fontWeight: 600 }}
                      className="absolute right-0.5 top-0.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full px-1 text-[9.5px] leading-none text-white shadow-2xs"
                    >
                      {alertsBadge}
                    </span>
                  )}
                </button>
              )
            })()}
          </nav>

          {/* Mobile Ask Noctis Trigger (< lg) — Compact Monochrome Icon Matching Top Bar */}
          <button
            type="button"
            onClick={() => {
              if (onOpenAIAssistant) onOpenAIAssistant()
            }}
            className="lg:hidden flex h-[52px] min-w-[34px] flex-col items-center justify-center px-1 text-[#666666] hover:text-[#191919] dark:text-zinc-300 dark:hover:text-white shrink-0 cursor-pointer"
            title="Ask Noctis AI"
            aria-label="Ask Noctis AI"
          >
            <Sparkles strokeWidth={1.75} className="h-[20px] w-[20px]" />
            <span style={{ fontWeight: 400 }} className="hidden sm:inline-block text-[11px] leading-none mt-1">
              Noctis
            </span>
          </button>

          {/* "Me" Profile Menu Dropdown — LinkedIn 24px Avatar + "Me ▾" in 12px Regular */}
          <div ref={meMenuRef} className="relative shrink-0">
            <button
              onClick={() => {
                setIsMeOpen(!isMeOpen)
                setIsMoreOpen(false)
              }}
              className={`flex h-[52px] min-w-[40px] sm:min-w-[48px] flex-col items-center justify-center px-1 border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'profile' || isMeOpen
                  ? "text-[#191919] dark:text-white border-[#191919] dark:border-white"
                  : "text-[#666666] hover:text-[#191919] dark:text-zinc-400 dark:hover:text-white border-transparent"
              }`}
              title={`${user.name} (${t("nav_me", "Me")})`}
            >
              <div className="relative h-6 w-6 rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-700 shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span
                style={{ fontWeight: 400 }}
                className="flex items-center gap-0.5 text-[12px] leading-[1.33333] mt-0.5 whitespace-nowrap"
              >
                {t("nav_me", "Me")} <ChevronDown className="h-3 w-3" />
              </span>
            </button>

            {/* Dropdown Menu Modal/Popover — Clean LinkedIn-Style "Me" Menu */}
            {isMeOpen && (
              <>
                <div
                  className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-2xs lg:bg-black/20"
                  onClick={() => setIsMeOpen(false)}
                />
                <div className="fixed lg:absolute inset-x-2 lg:inset-x-auto lg:right-0 top-[calc(var(--safe-top,0px)+4.25rem)] bottom-[calc(var(--safe-bottom,0px)+4.75rem)] lg:top-12 lg:bottom-auto lg:max-h-[85vh] lg:w-[340px] max-w-[360px] sm:left-auto sm:right-2 sm:w-[340px] rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 flex flex-col overflow-hidden z-[60]">
                  <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-0.5">
                    {/* 1. Clickable Profile Card (Name + Shield + Headline + >) */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab('profile')
                        setIsMeOpen(false)
                      }}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 p-3 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-12 w-12 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <p className="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate">
                              {user.name}
                            </p>
                            <ShieldCheck className="h-4 w-4 text-zinc-700 dark:text-zinc-300 shrink-0" />
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-snug mt-0.5">
                            {user.headline}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-zinc-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>

                    {/* 2. Analytics Card Row (> opens Real Activity & Insights) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectWorkBusinessItem) {
                          onSelectWorkBusinessItem('activity_insights')
                        } else {
                          onSelectTab('workbusiness')
                        }
                        setIsMeOpen(false)
                      }}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 px-3.5 py-3 flex items-center justify-between text-left transition-colors cursor-pointer group"
                    >
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Analytics
                      </span>
                      <ChevronRight className="h-4.5 w-4.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>

                    {/* 3. Saved posts Card Row (> opens Saved work & posts) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectWorkBusinessItem) {
                          onSelectWorkBusinessItem('my_work_applications')
                        } else {
                          onSelectTab('workbusiness')
                        }
                        setIsMeOpen(false)
                      }}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 px-3.5 py-3 flex items-center justify-between text-left transition-colors cursor-pointer group"
                    >
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Saved posts
                      </span>
                      <ChevronRight className="h-4.5 w-4.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>

                    {/* 4. Action Links List */}
                    <div className="pt-1 space-y-0.5">
                      {/* Job Posting Account */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectWorkBusinessItem) {
                            onSelectWorkBusinessItem('post_job_project')
                          } else {
                            onSelectTab('jobs')
                          }
                          setIsMeOpen(false)
                        }}
                        className="w-full rounded-lg px-2.5 py-2.5 flex items-center gap-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <Briefcase className="h-5 w-5 text-zinc-600 dark:text-zinc-400 shrink-0" />
                        <span>Job Posting Account</span>
                      </button>

                      {/* Plans & Billing */}
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTab('plans')
                          setIsMeOpen(false)
                        }}
                        className="w-full rounded-lg px-2.5 py-2.5 flex items-center justify-between gap-3 text-left text-sm font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Crown className="h-5 w-5 text-[#0067B8] shrink-0" />
                          <span>Plans &amp; Billing</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-[#0067B8] dark:text-sky-300">
                          360
                        </span>
                      </button>

                      {/* Settings & Privacy */}
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTab('accountsecurity')
                          setIsMeOpen(false)
                        }}
                        className="w-full rounded-lg px-2.5 py-2.5 flex items-center justify-between gap-3 text-left text-sm font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Settings className="h-5 w-5 text-zinc-700 dark:text-zinc-300 shrink-0" />
                          <span>Settings &amp; Privacy</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          FIDO2
                        </span>
                      </button>

                      {/* Help */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenAIAssistant) onOpenAIAssistant()
                          setIsMeOpen(false)
                        }}
                        className="w-full rounded-lg px-2.5 py-2.5 flex items-center gap-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <HelpCircle className="h-5 w-5 text-zinc-600 dark:text-zinc-400 shrink-0" />
                        <span>Help</span>
                      </button>

                      {/* ConnectLn 360 Portal & Mobile Downloads */}
                      <Link
                        href="/connectin-portal#download-app"
                        onClick={() => setIsMeOpen(false)}
                        className="w-full rounded-lg px-2.5 py-2.5 flex items-center justify-between gap-3 text-left text-sm font-semibold text-[#0067B8] dark:text-sky-400 hover:bg-sky-50/70 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Download className="h-5 w-5 shrink-0" />
                          <span>360 Portal &amp; Mobile App</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-[#0067B8] dark:text-sky-300">
                          APK/iOS
                        </span>
                      </Link>

                      {/* Language & Theme */}
                      <div className="rounded-lg px-2.5 py-2 flex items-center justify-between gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <div className="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                          <Globe className="h-5 w-5 text-zinc-600 dark:text-zinc-400 shrink-0" />
                          <span>{t("language_label", "Language")}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ThemeColorSwitcher align="right" />
                          <LanguageSwitcher align="right" />
                        </div>
                      </div>
                      {/* Mobile Quick Admin & Gate Row (< md) */}
                      {isAdminUser && (
                        <div className="md:hidden grid grid-cols-2 gap-1.5 px-1 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTab('adminiam')
                              setIsMeOpen(false)
                            }}
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-2 text-xs font-semibold text-[#191919] dark:text-zinc-100 cursor-pointer"
                          >
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            <span>{t("nav_backend", "Backend")}</span>
                          </button>
                          {onOpenAuthModal && (
                            <button
                              type="button"
                              onClick={() => {
                                onOpenAuthModal()
                                setIsMeOpen(false)
                              }}
                              className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-2 text-xs font-semibold text-[#191919] dark:text-zinc-100 cursor-pointer"
                            >
                              <Key className="h-3.5 w-3.5" />
                              <span>{t("nav_gate", "Gate")}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Collapsible Workspace & Admin Controls */}
                    <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setShowMeWorkspaceSwitcher(!showMeWorkspaceSwitcher)}
                        className="w-full px-2.5 py-1.5 flex items-center justify-between text-[11px] font-bold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        <span>Workspaces &amp; Identity Controls</span>
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMeWorkspaceSwitcher ? "rotate-180" : ""}`} />
                      </button>

                      {showMeWorkspaceSwitcher && (
                        <div className="mt-1.5 space-y-2 px-1 pb-1">
                          <div className="grid grid-cols-2 gap-1.5 text-xs">
                            <button
                              onClick={() => {
                                if (onSelectWorkspace) onSelectWorkspace('personal')
                                onSelectTab('home')
                                setIsMeOpen(false)
                              }}
                              className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
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
                              className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
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
                              className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
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
                              className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                                activeWorkspace === 'seller'
                                  ? "bg-amber-50 border-amber-600 text-amber-700 font-bold dark:bg-amber-950/40 dark:border-amber-700"
                                  : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                              }`}
                            >
                              <p className="font-bold text-[11px]">💼 {t("workspace_seller", "Seller")}</p>
                              <p className="text-[9px] opacity-70">{t("workspace_seller_desc", "$122.7K MRR")}</p>
                            </button>
                          </div>

                          {isAdminUser && (
                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                              <button
                                onClick={() => {
                                  onSelectTab('adminiam')
                                  setIsMeOpen(false)
                                }}
                                className="rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50/50 dark:bg-red-950/40 p-1.5 text-center text-[11px] font-bold text-red-700 dark:text-red-300 hover:bg-red-100 cursor-pointer"
                              >
                                🛡️ Admin Console
                              </button>
                              {onOpenAuthModal && (
                                <button
                                  onClick={() => {
                                    onOpenAuthModal()
                                    setIsMeOpen(false)
                                  }}
                                  className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 p-1.5 text-center text-[11px] font-bold hover:opacity-90 cursor-pointer"
                                >
                                  🔑 Auth Gate
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sign out footer matching Screenshot 1 */}
                  <div className="mt-2 border-t border-zinc-200 dark:border-zinc-800 pt-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMeOpen(false)
                        if (onSignOut) {
                          onSignOut()
                        } else {
                          window.location.href = '/connectin-login'
                        }
                      }}
                      className="w-full rounded-lg px-2.5 py-2 text-left text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      {t("sign_out", "Sign out")}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* LinkedIn Vertical Divider between "Me ▾" and "More ▾" */}
          <div className="hidden sm:block h-9 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 shrink-0" />

          {/* "For Business ▾" Dropdown Menu Trigger — Matching LinkedIn's "For Business ▾" 3x3 Grid Item */}
          <div ref={desktopMoreBtnRef} className="hidden sm:block relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsMoreOpen(!isMoreOpen)
                setIsMeOpen(false)
              }}
              className={`flex h-[52px] min-w-[38px] xl:min-w-[68px] flex-col items-center justify-center px-1 border-b-2 transition-colors cursor-pointer shrink-0 ${
                isMoreOpen || activeTab === "workbusiness"
                  ? "text-[#191919] dark:text-white border-[#191919] dark:border-white"
                  : "text-[#666666] hover:text-[#191919] dark:text-zinc-400 dark:hover:text-white border-transparent"
              }`}
              title="ConnectLn For Business — Workspace, Storefronts, Services, CRM & Hiring"
            >
              <Grid3X3 strokeWidth={1.75} className="h-[20px] w-[20px]" />
              <span
                style={{ fontWeight: 400 }}
                className="flex items-center gap-0.5 text-[12px] leading-[1.33333] mt-0.5 whitespace-nowrap"
              >
                {t("nav_for_business", "For Business")} <ChevronDown className="h-3 w-3" />
              </span>
            </button>
          </div>
          {isAdminUser && (
            <button
              type="button"
              onClick={() => {
                onSelectTab('adminiam')
                setIsMoreOpen(false)
                setIsMeOpen(false)
              }}
              className={`hidden md:flex h-[52px] min-w-[38px] xl:min-w-[48px] flex-col items-center justify-center px-1 border-b-2 transition-colors shrink-0 cursor-pointer ${
                activeTab === 'adminiam'
                  ? "text-[#191919] dark:text-white border-[#191919] dark:border-white"
                  : "text-[#666666] hover:text-[#191919] dark:text-zinc-400 dark:hover:text-white border-transparent"
              }`}
              title="Open ConnectLn Admin & Media Backend"
            >
              <SlidersHorizontal strokeWidth={activeTab === 'adminiam' ? 2.2 : 1.75} className="h-[20px] w-[20px]" />
              <span
                style={{ fontWeight: 400 }}
                className="hidden xl:inline-block text-[12px] leading-[1.33333] mt-0.5 whitespace-nowrap"
              >
                {t("nav_backend", "Backend")}
              </span>
            </button>
          )}
          {isAdminUser && onOpenAuthModal && (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="hidden md:flex h-[52px] min-w-[36px] xl:min-w-[40px] flex-col items-center justify-center px-1 border-b-2 border-transparent text-[#666666] hover:text-[#191919] dark:text-zinc-400 dark:hover:text-white transition-colors shrink-0 cursor-pointer"
              title="Access Role Gate & Persona Switcher"
            >
              <Key strokeWidth={1.75} className="h-[20px] w-[20px]" />
              <span
                style={{ fontWeight: 400 }}
                className="hidden xl:inline-block text-[12px] leading-[1.33333] mt-0.5 whitespace-nowrap"
              >
                {t("nav_gate", "Gate")}
              </span>
            </button>
          )}

          {/* Theme & Background Color Switcher — Uniform LinkedIn Icon-Over-Label Item (accessible via Me menu on < sm phones) */}
          <div className="hidden sm:block shrink-0">
            <ThemeColorSwitcher align="right" navItem />
          </div>

          {/* Global Multi-Language Switcher — Desktop / >= sm top bar (also inside Mobile Menu Drawer) */}
          <div className="hidden sm:block shrink-0">
            <LanguageSwitcher align="right" navItem />
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Row 2: High-contrast horizontally scrollable Hub & Business strip (< lg) */}
      <nav aria-label="Mobile hub shortcuts" className="relative lg:hidden border-t border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div
          ref={tabStripRef}
          className="flex items-center overflow-x-auto no-scrollbar px-2.5 py-2 gap-2 whitespace-nowrap scroll-smooth"
        >
          {[
            { id: '__more', label: 'For Business', icon: Grid3X3, badge: 0, kind: 'blue' },
            { id: 'noctissocial', label: 'Noctis Social', icon: PlayCircle, badge: 0, kind: 'purple' },
            { id: 'noctisclinic', label: 'Noctis Clinic', icon: Zap, badge: 0, kind: 'cyan' },
            ...primaryNavItems
              .filter((i) => !['home', 'network', 'jobs', 'messaging', 'notifications'].includes(i.id))
              .map((i) => ({
                id: i.id,
                label: i.shortLabel || i.label,
                icon: i.icon,
                badge: i.badge,
                kind: i.isMarketplace
                  ? 'purple'
                  : i.id === 'learning'
                    ? 'blue'
                    : i.id === 'media'
                      ? 'rose'
                      : i.id === 'pulserooms'
                        ? 'emerald'
                        : 'default',
              })),
            { id: 'vibecomms', label: 'NoctisChat', icon: MessageSquare, badge: 0, kind: 'emerald' },
            { id: 'veterans', label: 'Veterans', icon: Award, badge: 0, kind: 'emerald' },
            { id: 'franchises', label: 'Franchise', icon: Store, badge: 0, kind: 'amber' },
            { id: 'wallet', label: 'Wallet', icon: DollarSign, badge: 0, kind: 'emerald' },
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
            const isActive = isMore ? isMoreOpen : activeTab === item.id
            const colors: Record<string, string> = {
              default: "text-zinc-600 dark:text-zinc-300",
              purple: "text-purple-600 dark:text-purple-400",
              blue: "text-[#0A66C2] dark:text-blue-400",
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
                key={item.id}
                type="button"
                data-nav-id={item.id}
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
                className={`relative min-h-[36px] shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold border whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? "bg-[#0A66C2] text-white border-[#0A66C2] shadow-xs"
                    : "bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon
                  strokeWidth={2}
                  className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : colors[item.kind] || colors.default}`}
                />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span
                    className={`inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none ${
                      isActive ? "bg-white text-[#0A66C2]" : "bg-[#CB112D] text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Scroll hints: fade + arrow on whichever side still has hidden tabs (RFPs, Launchpad, Resume Prep ...) */}
        {stripCanScrollLeft && (
          <button
            type="button"
            aria-label="Scroll tabs left"
            onClick={() => scrollTabStrip(-1)}
            className="absolute left-0 top-0 bottom-0 z-10 flex w-9 items-center justify-start bg-gradient-to-r from-white via-white/90 to-transparent pl-0.5 text-zinc-500 dark:from-zinc-950 dark:via-zinc-950/90 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {stripCanScrollRight && (
          <button
            type="button"
            aria-label="Scroll tabs right to see more (RFPs, Launchpad, Resume Prep...)"
            onClick={() => scrollTabStrip(1)}
            className="absolute right-0 top-0 bottom-0 z-10 flex w-9 items-center justify-end bg-gradient-to-l from-white via-white/90 to-transparent pr-0.5 text-zinc-500 dark:from-zinc-950 dark:via-zinc-950/90 cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </nav>


      {/* ── Global "ConnectLn 360 — Sovereign Business Suite" Clean Two-Column Popover ── */}
      {isMoreOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-[#0B1F3A]/20 backdrop-blur-[1px] transition-opacity"
            onClick={() => setIsMoreOpen(false)}
          />
          <div
            ref={moreDropdownRef}
            data-testid="connectln-for-business-popover"
            className="fixed z-[60] inset-x-2 sm:inset-x-auto sm:right-4 lg:right-8 top-[calc(var(--safe-top,0px)+3.65rem)] max-h-[86vh] sm:w-[660px] max-w-[680px] rounded-2xl border border-[#E5DFD5] bg-white shadow-[0_24px_64px_rgba(11,31,58,0.18)] dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 flex flex-col overflow-hidden"
          >
            {/* Subtle Sovereign Navy & Gold Top Kicker Bar */}
            <div className="flex items-center justify-between border-b border-[#EFECE6] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 px-6 py-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#B8935A]" />
                <span className="text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-[#0B1F3A] dark:text-zinc-200">
                  ConnectLn 360 · Sovereign Business Suite
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectWorkBusinessItem) {
                      onSelectWorkBusinessItem("my_business_pages")
                    } else {
                      onSelectTab("workbusiness")
                    }
                    setIsMoreOpen(false)
                  }}
                  className="text-[11px] font-bold text-[#0B1F3A] hover:text-[#B8935A] dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  Full Business Hub →
                </button>
                <button
                  type="button"
                  onClick={() => setIsMoreOpen(false)}
                  className="rounded-full p-1 text-zinc-400 hover:text-[#0B1F3A] dark:hover:text-zinc-200 hover:bg-white/80 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Close"
                  aria-label="Close menu"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Clean Two-Column Body: Left = "Command Desks", Right = "Launch & Scale" */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-[#EFECE6] dark:divide-zinc-800">
                {/* LEFT COLUMN: Command Desks (5 cols) */}
                <div className="sm:col-span-5 p-6 flex flex-col justify-between bg-white dark:bg-zinc-900">
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-[17px] font-bold tracking-tight text-[#0B1F3A] dark:text-zinc-100">
                        Command Desks
                      </h3>
                      <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Your active trade, client &amp; AI desks
                      </p>
                    </div>

                    {/* Core Desks — Purely Original ConnectLn 360 Sovereign Geometric SVG Emblems */}
                    <div className="space-y-1.5">
                      {[
                        {
                          id: "my_services_inquiries" as WorkBusinessItemId,
                          label: "Deal & Quote Desk",
                          sub: "Inquiries, estimates & bookings",
                          code: "DQ",
                          badgeBg: "bg-[#0B1F3A] text-[#E6C687] border border-[#B8935A]/40",
                          svg: (
                            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none">
                              <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke="currentColor" strokeWidth="1.8" />
                              <polygon points="12,6.5 16.5,12 12,17.5 7.5,12" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" />
                              <circle cx="12" cy="12" r="1.6" fill="currentColor" />
                            </svg>
                          ),
                        },
                        {
                          id: "my_communities" as WorkBusinessItemId,
                          label: "Enclave Guilds",
                          sub: "Trade chapters & veteran circles",
                          code: "EG",
                          badgeBg: "bg-[#14335A] text-amber-200 border border-amber-300/30",
                          svg: (
                            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none">
                              <circle cx="9.5" cy="10" r="4.5" stroke="currentColor" strokeWidth="1.7" />
                              <circle cx="15" cy="10" r="4.5" stroke="currentColor" strokeWidth="1.7" />
                              <circle cx="12.25" cy="14.8" r="4.5" stroke="currentColor" strokeWidth="1.7" />
                              <circle cx="12.25" cy="11.5" r="1.5" fill="currentColor" />
                            </svg>
                          ),
                        },
                      ].map((desk) => (
                        <button
                          key={desk.id}
                          type="button"
                          onClick={() => {
                            if (onSelectWorkBusinessItem) {
                              onSelectWorkBusinessItem(desk.id)
                            } else {
                              onSelectTab("workbusiness")
                            }
                            setIsMoreOpen(false)
                          }}
                          className="group w-full rounded-xl px-2.5 py-2 flex items-center gap-3.5 text-left hover:bg-[#FAF7F2] dark:hover:bg-zinc-800/70 transition-all cursor-pointer"
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-2xs transition-transform group-hover:scale-105 ${desk.badgeBg}`}
                          >
                            {desk.svg}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13.5px] font-bold text-[#0B1F3A] dark:text-zinc-100 group-hover:text-[#9A7438] dark:group-hover:text-amber-300 transition-colors">
                              {desk.label}
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                              {desk.sub}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Pillar: Talent & Intelligence */}
                    <div className="space-y-1.5 pt-1">
                      <p className="px-2.5 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-[#8C734B] dark:text-amber-400/90">
                        Talent &amp; Intelligence
                      </p>
                      {[
                        {
                          id: "noctis_talent_match" as WorkBusinessItemId,
                          label: "Noctis Talent Match",
                          sub: "AI role builder & candidate shortlists",
                          badgeBg: "bg-gradient-to-br from-[#0B1F3A] to-[#234876] text-[#E6C687] border border-[#B8935A]/45",
                          svg: (
                            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none">
                              <ellipse cx="12" cy="12" rx="9" ry="4.2" transform="rotate(-30 12 12)" stroke="currentColor" strokeWidth="1.6" />
                              <ellipse cx="12" cy="12" rx="9" ry="4.2" transform="rotate(30 12 12)" stroke="currentColor" strokeWidth="1.6" />
                              <polygon points="12,7 14,12 12,17 10,12" fill="currentColor" />
                            </svg>
                          ),
                        },
                        {
                          id: "workforce_radar" as WorkBusinessItemId,
                          label: "Workforce Radar",
                          sub: "Regional rates & credential supply",
                          badgeBg: "bg-[#F3EFE6] text-[#0B1F3A] border border-[#DFD5C5]",
                          svg: (
                            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none">
                              <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" strokeDasharray="4 2" />
                              <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M12 12 L18 7.5" stroke="#B8935A" strokeWidth="2.2" strokeLinecap="round" />
                              <circle cx="12" cy="12" r="1.8" fill="currentColor" />
                            </svg>
                          ),
                        },
                      ].map((desk) => (
                        <button
                          key={desk.id}
                          type="button"
                          onClick={() => {
                            if (onSelectWorkBusinessItem) {
                              onSelectWorkBusinessItem(desk.id)
                            } else {
                              onSelectTab("workbusiness")
                            }
                            setIsMoreOpen(false)
                          }}
                          className="group w-full rounded-xl px-2.5 py-2 flex items-center gap-3.5 text-left hover:bg-[#FAF7F2] dark:hover:bg-zinc-800/70 transition-all cursor-pointer"
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-2xs transition-transform group-hover:scale-105 ${desk.badgeBg}`}
                          >
                            {desk.svg}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13.5px] font-bold text-[#0B1F3A] dark:text-zinc-100 group-hover:text-[#9A7438] dark:group-hover:text-amber-300 transition-colors">
                              {desk.label}
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                              {desk.sub}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Pillar: Field Commerce */}
                    <div className="space-y-1.5 pt-1">
                      <p className="px-2.5 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-[#8C734B] dark:text-amber-400/90">
                        Field Commerce
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectWorkBusinessItem) {
                            onSelectWorkBusinessItem("find_professional")
                          } else {
                            onSelectTab("workbusiness")
                          }
                          setIsMoreOpen(false)
                        }}
                        className="group w-full rounded-xl px-2.5 py-2 flex items-center gap-3.5 text-left hover:bg-[#FAF7F2] dark:hover:bg-zinc-800/70 transition-all cursor-pointer"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/30 shadow-2xs transition-transform group-hover:scale-105">
                          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none">
                            <polygon points="12,2.5 20.5,8.5 17.5,19.5 6.5,19.5 3.5,8.5" stroke="currentColor" strokeWidth="1.7" />
                            <path d="M8.5 12.5 L11 15 L16 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13.5px] font-bold text-[#0B1F3A] dark:text-zinc-100 group-hover:text-[#9A7438] dark:group-hover:text-amber-300 transition-colors">
                            Pro Services Exchange
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                            Verified trades &amp; specialist bids
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Subtle bottom shortcut to My Applications & Saved Work */}
                  <div className="mt-6 pt-3 border-t border-[#EFECE6] dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectWorkBusinessItem) {
                          onSelectWorkBusinessItem("my_work_applications")
                        } else {
                          onSelectTab("workbusiness")
                        }
                        setIsMoreOpen(false)
                      }}
                      className="w-full rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs font-bold text-[#0B1F3A] dark:text-zinc-200 hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <span>My Applications &amp; Quotes</span>
                      <ChevronRight className="h-3.5 w-3.5 text-[#B8935A]" />
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: Launch & Scale (7 cols) */}
                <div className="sm:col-span-7 p-6 flex flex-col justify-between bg-white dark:bg-zinc-900">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-[17px] font-bold tracking-tight text-[#0B1F3A] dark:text-zinc-100">
                        Launch &amp; Scale
                      </h3>
                      <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Grow your practice, crew, or enterprise across ConnectLn
                      </p>
                    </div>

                    <div className="space-y-1">
                      {[
                        {
                          key: "recruit",
                          title: "Recruit Verified Pros",
                          subtitle: "Source licensed trades, engineers, and cleared specialists",
                          action: () =>
                            onSelectWorkBusinessItem
                              ? onSelectWorkBusinessItem("find_work")
                              : onSelectTab("workbusiness"),
                        },
                        {
                          key: "offer",
                          title: "Offer Pro Services",
                          subtitle: "Publish your capabilities, portfolio, and service radius",
                          action: () =>
                            onSelectWorkBusinessItem
                              ? onSelectWorkBusinessItem("offer_services")
                              : onSelectTab("workbusiness"),
                        },
                        {
                          key: "publish_opp",
                          title: "Publish an Opportunity",
                          subtitle: "Post a direct role, contract project, or paid apprenticeship",
                          action: () =>
                            onSelectWorkBusinessItem
                              ? onSelectWorkBusinessItem("post_job_project")
                              : onSelectTab("workbusiness"),
                        },
                        {
                          key: "spotlight",
                          title: "Spotlight Your Practice",
                          subtitle: "Boost local directory placement and enclave reach",
                          action: () =>
                            onSelectWorkBusinessItem
                              ? onSelectWorkBusinessItem("spotlight_practice")
                              : onSelectTab("workbusiness"),
                        },
                        {
                          key: "upgrade_360",
                          title: "Upgrade to ConnectLn 360",
                          subtitle: "Unlock Sovereign Suite, priority escrow, and AI desks",
                          action: () => onSelectTab("plans"),
                        },
                        {
                          key: "skill_tracks",
                          title: "Team Skill Tracks",
                          subtitle: "Assign practical trade lessons and CEU/CPE certifications",
                          action: () =>
                            onSelectWorkBusinessItem
                              ? onSelectWorkBusinessItem("learn_practical_skills")
                              : onSelectTab("learning"),
                        },
                        {
                          key: "operations",
                          title: "Operations & Treasury",
                          subtitle: "Manage billing, escrow receipts, and workspace roles",
                          action: () =>
                            onSelectWorkBusinessItem
                              ? onSelectWorkBusinessItem("billing_settings")
                              : onSelectTab("workbusiness"),
                        },
                      ].map((row) => (
                        <button
                          key={row.key}
                          type="button"
                          onClick={() => {
                            row.action()
                            setIsMoreOpen(false)
                          }}
                          className="group w-full rounded-xl px-3 py-2 text-left hover:bg-[#FAF7F2] dark:hover:bg-zinc-800/70 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[13.5px] font-bold text-[#0B1F3A] dark:text-zinc-100 group-hover:text-[#9A7438] dark:group-hover:text-amber-300 transition-colors leading-snug">
                              {row.title}
                            </p>
                            <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                              {row.subtitle}
                            </p>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-[#B8935A] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Distinct Sovereign Bottom Action: Launch a Business or Franchise Page */}
                  <div className="mt-4 pt-3 border-t border-[#EFECE6] dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectWorkBusinessItem) {
                          onSelectWorkBusinessItem("create_business_page")
                        } else {
                          onSelectTab("workbusiness")
                        }
                        setIsMoreOpen(false)
                      }}
                      className="group w-full rounded-xl border border-[#E5DFD5] dark:border-zinc-700 bg-[#FAF7F2] hover:bg-[#0B1F3A] dark:bg-zinc-800/90 dark:hover:bg-zinc-800 px-3.5 py-2.5 flex items-center justify-between gap-3 transition-all cursor-pointer"
                    >
                      <div className="text-left min-w-0">
                        <p className="text-[13px] font-extrabold text-[#0B1F3A] group-hover:text-white dark:text-zinc-100 transition-colors">
                          Launch a Business or Franchise Page
                        </p>
                        <p className="text-[10.5px] text-zinc-500 group-hover:text-zinc-300 dark:text-zinc-400 truncate transition-colors">
                          Independent shop, practice, or multi-location franchise
                        </p>
                      </div>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0B1F3A] text-[#E6C687] group-hover:bg-[#B8935A] group-hover:text-[#0B1F3A] transition-colors">
                        <Plus className="h-4 w-4" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
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
            <div
              className="px-3.5 pb-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50/90 dark:bg-zinc-800/40 shrink-0"
              style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 14px)" }}
            >
              <button
                type="button"
                onClick={() => {
                  onSelectTab('profile')
                  setIsMobileDrawerOpen(false)
                }}
                className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group"
              >
                <div className="relative h-11 w-11 rounded-full overflow-hidden border-2 border-[#0A66C2]/40 shrink-0 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-700 dark:text-zinc-200">
                  {user.avatar && user.avatar.trim() ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <span>{(user.name || "C").charAt(0).toUpperCase()}</span>
                  )}
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
                className="p-2 rounded-full text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
                title="Close navigation"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Content: Scrollable Body */}
            <div
              className="flex-1 min-h-0 overflow-y-auto p-3 space-y-4"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 5.5rem)" }}
            >
              {/* Quick Mobile Actions: For Business & Account Switch */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false)
                    setIsMoreOpen(true)
                  }}
                  className="flex items-center justify-center gap-1.5 min-h-[40px] px-2.5 py-2 rounded-xl bg-[#0A66C2] text-white text-xs font-bold shadow-xs hover:bg-[#004182] active:scale-95 transition-all cursor-pointer"
                >
                  <Grid3X3 className="h-4 w-4 shrink-0" />
                  <span className="truncate">For Business</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false)
                    if (onSignOut) {
                      onSignOut()
                    } else if (typeof window !== "undefined") {
                      window.location.assign("/connectin-login")
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 min-h-[40px] px-2.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="truncate">Sign Out / Switch</span>
                </button>
              </div>
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

                  {/* Veterans Network */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('veterans')
                      setIsMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === 'veterans'
                        ? "bg-emerald-50 border-emerald-600 text-emerald-700 font-bold dark:bg-emerald-950/40"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">Veterans Network</p>
                      <p className="text-[10px] text-zinc-400 truncate">Skills &amp; Transition</p>
                    </div>
                  </button>

                  {/* Franchise Network */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('franchises')
                      setIsMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === 'franchises'
                        ? "bg-amber-50 border-amber-600 text-amber-700 font-bold dark:bg-amber-950/40"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <Store className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">Franchise Network</p>
                      <p className="text-[10px] text-zinc-400 truncate">FDD &amp; Opportunities</p>
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

                {/* ConnectLn 360 Studio Mobile Quick Launch */}
                <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/90 dark:bg-zinc-950/70 p-2.5 space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B5CAD] dark:text-sky-400">
                      ConnectLn 360 Studio
                    </span>
                    <span className="text-[9.5px] font-bold text-[#6B7280] dark:text-zinc-400">
                      Built by ConnectLn
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "docs", label: "Docs", sub: "Documents", icon: FileText, bg: "bg-[#0B5CAD]" },
                      { id: "sheets", label: "Sheets", sub: "Sheets", icon: Table2, bg: "bg-[#107C41]" },
                      { id: "slides", label: "Slides", sub: "Decks", icon: Presentation, bg: "bg-[#C84B28]" },
                    ].map((sApp) => {
                      const SIcon = sApp.icon
                      return (
                        <button
                          key={sApp.id}
                          type="button"
                          onClick={() => {
                            onSelectTab(sApp.id)
                            setIsMobileDrawerOpen(false)
                          }}
                          className="flex flex-col items-center justify-center rounded-xl border border-transparent bg-white/90 dark:bg-zinc-900/90 hover:border-[#0B5CAD] p-2 text-center cursor-pointer"
                        >
                          <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-white ${sApp.bg}`}>
                            <SIcon className="h-3.5 w-3.5" />
                          </span>
                          <span className="mt-1 text-[11px] font-bold text-[#0B1F3A] dark:text-zinc-100">
                            {sApp.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* ConnectLn Power Apps Mobile Quick Launch */}
                <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/30 p-2.5 space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4338CA] dark:text-indigo-400">
                      ConnectLn Power Apps
                    </span>
                    <span className="text-[9.5px] font-bold text-[#4338CA] dark:text-indigo-300">
                      Built by ConnectLn
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab("sign")
                        setIsMobileDrawerOpen(false)
                      }}
                      className="flex items-center gap-2 rounded-xl border border-transparent bg-white/90 dark:bg-zinc-900/90 hover:border-[#4338CA] p-2 text-left cursor-pointer"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white bg-[#4338CA]">
                        <FileSignature className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-extrabold text-[#0B1F3A] dark:text-zinc-100">
                          Sign
                        </div>
                        <div className="text-[9.5px] text-[#6B7280] dark:text-zinc-400 truncate">
                          E-Signatures
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab("invoice")
                        setIsMobileDrawerOpen(false)
                      }}
                      className="flex items-center gap-2 rounded-xl border border-transparent bg-white/90 dark:bg-zinc-900/90 hover:border-[#0F766E] p-2 text-left cursor-pointer"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white bg-[#0F766E]">
                        <Receipt className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-extrabold text-[#0B1F3A] dark:text-zinc-100">
                          Invoice
                        </div>
                        <div className="text-[9.5px] text-[#6B7280] dark:text-zinc-400 truncate">
                          Billing &amp; Ledger
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab("boards")
                        setIsMobileDrawerOpen(false)
                      }}
                      className="flex items-center gap-2 rounded-xl border border-transparent bg-white/90 dark:bg-zinc-900/90 hover:border-[#B45309] p-2 text-left cursor-pointer"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white bg-[#B45309]">
                        <Kanban className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-extrabold text-[#0B1F3A] dark:text-zinc-100">
                          Boards
                        </div>
                        <div className="text-[9.5px] text-[#6B7280] dark:text-zinc-400 truncate">
                          Kanban &amp; Tasks
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab("forms")
                        setIsMobileDrawerOpen(false)
                      }}
                      className="flex items-center gap-2 rounded-xl border border-transparent bg-white/90 dark:bg-zinc-900/90 hover:border-[#9333EA] p-2 text-left cursor-pointer"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white bg-[#9333EA]">
                        <ClipboardList className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-extrabold text-[#0B1F3A] dark:text-zinc-100">
                          Forms
                        </div>
                        <div className="text-[9.5px] text-[#6B7280] dark:text-zinc-400 truncate">
                          Intake &amp; Surveys
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* ConnectLn 360 Universe Mobile Quick Launch */}
                <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/80 dark:bg-zinc-950/60 p-2 space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0067B8] dark:text-sky-400">
                      ConnectLn 360 Universe
                    </span>
                    <span className="text-[10px] font-semibold text-[#6B7280] dark:text-zinc-400">
                      Unified Apps
                    </span>
                  </div>
                  {[
                    {
                      id: "noctissocial",
                      name: "Noctis Social",
                      host: "noctis.social",
                      desc: "60s video, learning & community",
                      href: "https://noctis.social",
                      icon: PlayCircle,
                      accentBg: "bg-fuchsia-600",
                    },
                    {
                      id: "noctisclinic",
                      name: "Noctis Clinic",
                      host: "www.dstrike.app/noctis",
                      desc: "Watch a Spark · Pass a drill · Take the stamp",
                      href: "https://www.dstrike.app/noctis",
                      icon: Zap,
                      accentBg: "bg-cyan-600",
                    },
                  ].map((uApp) => {
                    const UIcon = uApp.icon
                    const isUActive = activeTab === uApp.id
                    return (
                      <div
                        key={uApp.id}
                        className={`flex items-center justify-between gap-2 rounded-xl border px-2 py-1.5 transition-colors ${
                          isUActive
                            ? "border-[#0067B8] bg-white dark:bg-zinc-800"
                            : "border-transparent bg-white/80 dark:bg-zinc-900/70 hover:border-[#E7E2DA] dark:hover:border-zinc-700"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTab(uApp.id)
                            setIsMobileDrawerOpen(false)
                          }}
                          className="flex flex-1 min-w-0 items-center gap-2.5 text-left cursor-pointer"
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs ${uApp.accentBg}`}
                          >
                            <UIcon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#0B1F3A] dark:text-zinc-100 truncate">
                              {uApp.name}{" "}
                              <span className="font-mono text-[10px] font-medium text-[#6B7280] dark:text-zinc-400">
                                ({uApp.host})
                              </span>
                            </p>
                            <p className="text-[10.5px] text-[#4B5563] dark:text-zinc-400 truncate">
                              {uApp.desc}
                            </p>
                          </div>
                        </button>
                        <a
                          href={uApp.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsMobileDrawerOpen(false)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#4B5563] hover:text-[#0067B8] hover:bg-[#FAF7F2] dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                          title={`Open ${uApp.name} in new tab (${uApp.href})`}
                          aria-label={`Open ${uApp.name} in new tab`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )
                  })}
                </div>

                <Link
                  href="/connectin-portal#download-app"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-sky-50/80 dark:bg-sky-950/30 hover:bg-sky-100/80 text-xs font-bold text-[#0067B8] dark:text-sky-300 border border-sky-200/70 dark:border-sky-800/60"
                >
                  <span className="flex items-center gap-1.5">📲 360 Portal &amp; Mobile App (APK / iOS)</span>
                  <span>→</span>
                </Link>
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

    {/* Thumb-Friendly Fixed Mobile Primary Bottom Navigation (< lg) */}
    <nav
      ref={mobileMoreMenuRef}
      aria-label="Mobile primary navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 6px)" }}
    >
      <div className="mx-auto grid grid-cols-6 max-w-2xl px-1 pt-1">
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => {
            onSelectTab('home')
            setIsMoreOpen(false)
            setIsMeOpen(false)
            setIsMobileDrawerOpen(false)
          }}
          className={`min-h-[54px] flex flex-col items-center justify-center gap-1 rounded-xl px-1 transition-colors cursor-pointer ${
            activeTab === 'home'
              ? "text-[#0A66C2] dark:text-blue-400 font-bold"
              : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <House strokeWidth={activeTab === 'home' ? 2.25 : 1.8} className="h-5 w-5" />
          <span className="text-[11px] leading-none">{t("nav_home_short", "Home")}</span>
        </button>

        {/* 2. Network */}
        <button
          type="button"
          onClick={() => {
            onSelectTab('network')
            setIsMoreOpen(false)
            setIsMeOpen(false)
            setIsMobileDrawerOpen(false)
          }}
          className={`min-h-[54px] flex flex-col items-center justify-center gap-1 rounded-xl px-1 transition-colors cursor-pointer ${
            activeTab === 'network'
              ? "text-[#0A66C2] dark:text-blue-400 font-bold"
              : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Users strokeWidth={activeTab === 'network' ? 2.25 : 1.8} className="h-5 w-5" />
          <span className="text-[11px] leading-none">{t("nav_network_short", "Network")}</span>
        </button>

        {/* 3. Jobs */}
        <button
          type="button"
          onClick={() => {
            onSelectTab('jobs')
            setIsMoreOpen(false)
            setIsMeOpen(false)
            setIsMobileDrawerOpen(false)
          }}
          className={`min-h-[54px] flex flex-col items-center justify-center gap-1 rounded-xl px-1 transition-colors cursor-pointer ${
            activeTab === 'jobs'
              ? "text-[#0A66C2] dark:text-blue-400 font-bold"
              : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Briefcase strokeWidth={activeTab === 'jobs' ? 2.25 : 1.8} className="h-5 w-5" />
          <span className="text-[11px] leading-none">{t("nav_jobs_short", "Jobs")}</span>
        </button>

        {/* 4. Msgs */}
        <button
          type="button"
          onClick={() => {
            onSelectTab('messaging')
            setIsMoreOpen(false)
            setIsMeOpen(false)
            setIsMobileDrawerOpen(false)
          }}
          className={`min-h-[54px] flex flex-col items-center justify-center gap-1 rounded-xl px-1 transition-colors cursor-pointer ${
            activeTab === 'messaging'
              ? "text-[#0A66C2] dark:text-blue-400 font-bold"
              : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <div className="relative">
            <MessageSquare strokeWidth={activeTab === 'messaging' ? 2.25 : 1.8} className="h-5 w-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#CB112D] px-1 text-[10px] font-bold text-white leading-none">
                {unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-none">{t("nav_messages_short", "Msgs")}</span>
        </button>

        {/* 5. Alerts */}
        <button
          type="button"
          onClick={() => {
            onSelectTab('notifications')
            setIsMoreOpen(false)
            setIsMeOpen(false)
            setIsMobileDrawerOpen(false)
          }}
          className={`min-h-[54px] flex flex-col items-center justify-center gap-1 rounded-xl px-1 transition-colors cursor-pointer ${
            activeTab === 'notifications'
              ? "text-[#0A66C2] dark:text-blue-400 font-bold"
              : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <div className="relative">
            <Bell strokeWidth={activeTab === 'notifications' ? 2.25 : 1.8} className="h-5 w-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#CB112D] px-1 text-[10px] font-bold text-white leading-none">
                {unreadNotificationsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-none">{t("nav_alerts_short", "Alerts")}</span>
        </button>

        {/* 6. Menu (Slide-over drawer with For Business & All Hubs) */}
        <button
          type="button"
          onClick={() => {
            setIsMobileDrawerOpen((prev) => !prev)
            setIsMoreOpen(false)
            setIsMeOpen(false)
          }}
          className={`min-h-[54px] flex flex-col items-center justify-center gap-1 rounded-xl px-1 transition-colors cursor-pointer ${
            isMobileDrawerOpen
              ? "text-[#0A66C2] dark:text-blue-400 font-bold"
              : "text-zinc-700 dark:text-zinc-200 hover:text-[#0A66C2] dark:hover:text-white"
          }`}
          aria-label="Open all navigation menus"
        >
          <Grid3X3 strokeWidth={isMobileDrawerOpen ? 2.25 : 1.8} className="h-5 w-5" />
          <span className="text-[11px] font-semibold leading-none">{t("nav_menu_short", "Menu")}</span>
        </button>
      </div>
    </nav>

    {/* Safe-area-aware spacer matching the fixed mobile header (safe-top + 108px) and desktop header (56px) */}
    <div className="h-[calc(var(--safe-top,0px)+108px)] lg:h-14 w-full shrink-0" aria-hidden="true" />
    </>
  )
}
