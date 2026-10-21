"use client"

import React, { useState, useEffect } from "react"
import {
  Search,
  Users,
  Briefcase,
  ShoppingBag,
  Wrench,
  GraduationCap,
  FileText,
  Globe,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  X,
  RefreshCw,
  Layers
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

import { UserProfile, getEnclaveConnectedMembers } from "@/lib/linkedin-data"
import { getEnclaveGlobalJobs } from "@/lib/global-jobs-data"
import { getEnclaveMarketplaceProducts } from "@/lib/marketplace-engine-data"
import { getEnclaveLearningCourses } from "@/lib/learning-platform-data"
import { getEnclavePulseArticles } from "@/lib/pulse-news-data"
import { getEnclaveModules } from "@/lib/connectin-navbar-data"

interface UniversalSearchModalProps {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
  onNavigateTab: (tab: string) => void
  currentUser?: UserProfile
}

interface PersonSearchResult {
  id?: string
  name: string
  role: string
  org: string
  rating: number
  verified: boolean
  avatar: string
  skills?: string[]
}

export function UniversalSearchModal({
  isOpen,
  onClose,
  initialQuery = "",
  onNavigateTab,
  currentUser
}: UniversalSearchModalProps) {
  const enclaveId = currentUser?.professionEnclave || 'trades_construction'
  const [query, setQuery] = useState(initialQuery || "")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  const basePeople: PersonSearchResult[] = (getEnclaveConnectedMembers(enclaveId) || []).map(m => ({
    id: m.id,
    name: m.name || "Verified Member",
    role: m.headline || "ConnectIn Professional",
    org: m.mutualClearance || "Verified Trade Network",
    rating: 4.95,
    verified: true,
    avatar: m.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=Member&backgroundColor=0a66c2",
    skills: Array.isArray(m.tags) ? m.tags : []
  }))

  const [liveUsers, setLiveUsers] = useState<PersonSearchResult[]>(basePeople)
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set())
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  useEffect(() => {
    setLiveUsers((getEnclaveConnectedMembers(enclaveId) || []).map(m => ({
      id: m.id,
      name: m.name || "Verified Member",
      role: m.headline || "ConnectIn Professional",
      org: m.mutualClearance || "Verified Trade Network",
      rating: 4.95,
      verified: true,
      avatar: m.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=Member&backgroundColor=0a66c2",
      skills: Array.isArray(m.tags) ? m.tags : []
    })))
  }, [enclaveId])

  // Platform Modules & Connected Apps (including Resume Preparation App)
  const ALL_MODULES = [
    {
      id: "careersuite",
      label: "Expedite CareerSuite™ — Resume Preparation App",
      desc: "AI Resume Tailoring, ATS Fit Score, Corporate & USAJOBS Federal KSAs, and Profile Maximizer",
      icon: "📝",
      url: "https://tuhousing.vercel.app/",
      isExternal: false,
      badge: "RESUME AI"
    },
    ...(getEnclaveModules(enclaveId, true) || [])
  ]

  const ALL_JOBS = (getEnclaveGlobalJobs(enclaveId) || []).map(j => ({
    title: String(j.title || "Open Role"),
    company: String(j.company || "Verified Employer"),
    salary: String(j.salaryRange || (j as any).salary || "Competitive Compensation"),
    clearance: String(j.clearanceRequired || (j as any).clearance || "Verified Identity"),
    skills: Array.isArray(j.tags) ? j.tags.map(String) : []
  }))

  const ALL_PRODUCTS = (getEnclaveMarketplaceProducts(enclaveId) || []).map(p => ({
    name: String(p.name || "Enterprise Solution"),
    icon: p.icon || (enclaveId === 'trades_construction' ? '🧰' : (enclaveId === 'healthcare_medicine' ? '🩺' : (enclaveId === 'automotive_mechanics' ? '🔧' : '🛡️'))),
    tagline: String(p.tagline || p.overview || (p as any).description || "Verified ConnectIn Marketplace solution"),
    price: typeof p.pricing === 'object' && p.pricing !== null
      ? String(p.pricing.displayPrice || "$0")
      : String(p.pricing || "$0"),
    category: String(p.category || "Software")
  }))

  const ALL_SERVICES = [
    { name: `${currentUser?.profession || 'Professional'} Verified Advisory Sprint`, vendor: "ConnectIn Verified Network", startingPrice: "$8,500 / Project", desc: "Expert assessment, compliance audit, and operational readiness." },
    { name: "Full-Scope Safety & Process Audit", vendor: "Ecosystem Quality Group", startingPrice: "$12,000 / Engagement", desc: "Rigorous standards inspection and field certification." }
  ]

  const ALL_COURSES = (getEnclaveLearningCourses(enclaveId) || []).map(c => ({
    title: String(c.title || "Masterclass Course"),
    duration: String(c.duration || "4h 30m"),
    labs: 3,
    level: String(c.level || "Intermediate"),
    instructor: String(c.instructor?.name || "Verified Instructor")
  }))

  const ALL_RESEARCH = (getEnclavePulseArticles(enclaveId) || []).map(a => ({
    title: String(a.title || "Technical Briefing"),
    date: String(a.publishedAt || (a as any).publishedTime || "Recent"),
    format: String(a.category || "Research"),
    author: String(a.author?.name || a.author?.source || (a as any).source || "ConnectIn Intelligence")
  }))

  // Sync initial query when opened or changed
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery || "")
    }
  }, [isOpen, initialQuery])

  // Fetch live registered users from API
  useEffect(() => {
    if (!isOpen) return

    const fetchUsers = async () => {
      setIsLoadingUsers(true)
      try {
        const res = await fetch("/api/connectin/users")
        if (res.ok) {
          const data = await res.json()
          if (data.success && Array.isArray(data.users)) {
            const apiPeople: PersonSearchResult[] = data.users.map((u: any) => ({
              id: u.id,
              name: String(u.name || "ConnectIn Member"),
              role: String(u.headline || "ConnectIn Member"),
              org: u.role ? `ConnectIn ${String(u.role).charAt(0).toUpperCase() + String(u.role).slice(1)}` : "ConnectIn Member",
              rating: 4.9,
              verified: true,
              avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || "Member")}&backgroundColor=0a66c2`,
              skills: ["Verified Member", "Zero Trust", "ConnectIn Network"]
            }))

            const merged = [...apiPeople, ...basePeople].filter((item, index, self) =>
              index === self.findIndex(t => (t.name || "").toLowerCase() === (item.name || "").toLowerCase())
            )
            setLiveUsers(merged)
          }
        }
      } catch (err) {
        console.warn("Failed to load users for omnisearch:", err)
      } finally {
        setIsLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [isOpen])

  const q = (query || "").toLowerCase().trim()

  // Filter modules & hubs
  const filteredModules = ALL_MODULES.filter(m => {
    if (!q) return true
    return (
      (m.label || "").toLowerCase().includes(q) ||
      (m.desc || "").toLowerCase().includes(q) ||
      (m.id || "").toLowerCase().includes(q)
    )
  })

  // Filter people
  const filteredPeople = liveUsers.filter(p => {
    if (!q) return true
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.role || "").toLowerCase().includes(q) ||
      (p.org || "").toLowerCase().includes(q) ||
      p.skills?.some(s => (s || "").toLowerCase().includes(q))
    )
  })

  // Filter jobs
  const filteredJobs = ALL_JOBS.filter(j => {
    if (!q) return true
    return (
      (j.title || "").toLowerCase().includes(q) ||
      (j.company || "").toLowerCase().includes(q) ||
      (j.clearance || "").toLowerCase().includes(q) ||
      j.skills?.some(s => (s || "").toLowerCase().includes(q))
    )
  })

  // Filter products
  const filteredProducts = ALL_PRODUCTS.filter(prod => {
    if (!q) return true
    return (
      (prod.name || "").toLowerCase().includes(q) ||
      (prod.tagline || "").toLowerCase().includes(q) ||
      (prod.category || "").toLowerCase().includes(q)
    )
  })

  // Filter services
  const filteredServices = ALL_SERVICES.filter(s => {
    if (!q) return true
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.vendor || "").toLowerCase().includes(q) ||
      (s.desc || "").toLowerCase().includes(q)
    )
  })

  // Filter courses
  const filteredCourses = ALL_COURSES.filter(c => {
    if (!q) return true
    return (
      (c.title || "").toLowerCase().includes(q) ||
      (c.instructor || "").toLowerCase().includes(q) ||
      (c.level || "").toLowerCase().includes(q)
    )
  })

  // Filter research
  const filteredResearch = ALL_RESEARCH.filter(r => {
    if (!q) return true
    return (
      (r.title || "").toLowerCase().includes(q) ||
      (r.author || "").toLowerCase().includes(q) ||
      (r.format || "").toLowerCase().includes(q)
    )
  })

  const totalResultsCount =
    filteredModules.length +
    filteredPeople.length +
    filteredJobs.length +
    filteredProducts.length +
    filteredServices.length +
    filteredCourses.length +
    filteredResearch.length

  const categoryCounts = [
    { id: "All", label: "All Results", count: String(totalResultsCount) },
    { id: "People", label: "People & Members", count: String(filteredPeople.length), targetTab: "network" },
    { id: "Modules", label: "Hubs & Apps", count: String(filteredModules.length), targetTab: "home" },
    { id: "Jobs", label: "Jobs", count: String(filteredJobs.length), targetTab: "jobs" },
    { id: "Products", label: "Products", count: String(filteredProducts.length), targetTab: "marketplace" },
    { id: "Services", label: "Services", count: String(filteredServices.length), targetTab: "marketplace" },
    { id: "Courses", label: "Courses & Labs", count: String(filteredCourses.length), targetTab: "learning" },
    { id: "Research", label: "Research", count: String(filteredResearch.length), targetTab: "pulserooms" },
  ]

  const handleConnectPerson = (personId: string) => {
    setConnectedIds(prev => new Set(prev).add(personId))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[88vh] flex flex-col p-0 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        <DialogTitle className="sr-only">ConnectIn Universal Omnisearch Directory</DialogTitle>

        {/* Header Search Input */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 shrink-0 text-zinc-900 dark:text-zinc-100 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-[#0A66C2] dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-[#0A66C2]" />
                ConnectIn Universal Omnisearch Directory
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {isLoadingUsers ? "Indexing members..." : `${totalResultsCount} members, jobs, hubs & assets indexed`}
              </span>
            </div>
            {isLoadingUsers && (
              <RefreshCw className="h-4 w-4 text-zinc-400 animate-spin" />
            )}
          </div>

          <div className="relative flex items-center">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search members (Rhoda, Kwesi, Alex...), Resume Prep, jobs, solutions, courses..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 pl-12 pr-12 py-3 sm:py-3.5 text-sm sm:text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:bg-white dark:focus:bg-zinc-900 shadow-2xs transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-4 top-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                title="Clear query"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categoryCounts.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-3 py-1 font-semibold transition-all shrink-0 text-xs cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#0A66C2] text-white shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {cat.label} <span className="opacity-70 text-[10px]">({cat.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs bg-zinc-50 dark:bg-zinc-950">
          {totalResultsCount === 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                No results found matching &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-zinc-500">
                Try searching for <strong>Rhoda</strong>, <strong>Kwesi</strong>, <strong>Alex</strong>, <strong>Resume</strong>, <strong>Zero Trust</strong>, or <strong>FedRAMP</strong>.
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-2 rounded-lg bg-[#0A66C2] text-white px-3 py-1 font-bold text-xs hover:bg-[#004182] cursor-pointer"
              >
                View all directory assets
              </button>
            </div>
          )}

          {/* 1. PEOPLE & MEMBERS RESULTS */}
          {(selectedCategory === "All" || selectedCategory === "People") && filteredPeople.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#0A66C2]" />
                  <span>People &amp; Verified Members ({filteredPeople.length} found)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => { onClose(); onNavigateTab('network'); }}
                  className="text-[#0A66C2] font-bold hover:underline cursor-pointer"
                >
                  View all in Network →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredPeople.map((p, i) => {
                  const personKey = p.id || `p_${i}`
                  const isConnected = connectedIds.has(personKey) || connectedIds.has(p.name)

                  return (
                    <div
                      key={personKey}
                      className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between gap-3 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="h-10 w-10 rounded-full object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{p.name}</p>
                            <ShieldCheck className="h-3.5 w-3.5 text-[#0A66C2] shrink-0" />
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{p.role}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-zinc-400 font-medium truncate">{p.org}</span>
                            <span className="text-[10px] text-amber-500 font-bold shrink-0">★ {p.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleConnectPerson(personKey)}
                          className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                            isConnected
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-[#0A66C2] text-white hover:bg-[#004182]"
                          }`}
                        >
                          {isConnected ? "✓ Connected" : "Connect"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClose()
                            onNavigateTab('network')
                          }}
                          className="text-[10px] text-zinc-400 hover:text-[#0A66C2] text-center cursor-pointer"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 1.5. PLATFORM HUBS & CONNECTED APPS */}
          {(selectedCategory === "All" || selectedCategory === "Modules") && filteredModules.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  <span>Platform Hubs &amp; Connected Apps ({filteredModules.length} found)</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredModules.map((mod, i) => (
                  <div
                    key={`${mod.id}_${i}`}
                    className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between gap-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0">{mod.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{mod.label}</p>
                          {mod.badge && (
                            <span className="rounded bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 px-1.5 py-0.5 text-[9px] font-mono font-bold shrink-0">
                              {mod.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{mod.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (mod.isExternal && mod.url) {
                            window.open(mod.url, '_blank', 'noopener,noreferrer')
                          } else {
                            onClose()
                            onNavigateTab(mod.id)
                          }
                        }}
                        className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-3 py-1 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open</span>
                        {mod.isExternal && <ExternalLink className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. PRODUCTS & SOFTWARE */}
          {(selectedCategory === "All" || selectedCategory === "Products") && filteredProducts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-purple-600" />
                  <span>Enterprise Software &amp; Tools ({filteredProducts.length} found)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => { onClose(); onNavigateTab('marketplace'); }}
                  className="text-purple-600 font-bold hover:underline cursor-pointer"
                >
                  View all in Marketplace →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredProducts.map((prod, i) => (
                  <div key={i} className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{prod.icon}</span>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{prod.name}</p>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">{prod.tagline}</p>
                      <span className="font-mono text-emerald-600 font-bold text-[10px] block">{prod.price} · 14-Day Free Trial</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { onClose(); onNavigateTab('marketplace'); }}
                      className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 text-[11px] font-bold shrink-0 shadow-xs cursor-pointer"
                    >
                      Try Free
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. JOBS */}
          {(selectedCategory === "All" || selectedCategory === "Jobs") && filteredJobs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-emerald-600" />
                  <span>Open Requisitions &amp; Cleared Roles ({filteredJobs.length} found)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => { onClose(); onNavigateTab('jobs'); }}
                  className="text-[#0A66C2] font-bold hover:underline cursor-pointer"
                >
                  View all in Jobs →
                </button>
              </div>

              <div className="space-y-2">
                {filteredJobs.map((job, i) => (
                  <div key={i} className="rounded-xl border border-zinc-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">{job.title}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{job.company} · Clearance: <strong className="text-purple-600">{job.clearance}</strong></p>
                      <span className="font-mono text-emerald-600 font-bold text-[10px]">{job.salary}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { onClose(); onNavigateTab('jobs'); }}
                      className="rounded-full bg-[#0A66C2] text-white px-3 py-1 text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      1-Click Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. SERVICES */}
          {(selectedCategory === "All" || selectedCategory === "Services") && filteredServices.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-amber-500" />
                  <span>Advisory &amp; Engineering Services ({filteredServices.length} found)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => { onClose(); onNavigateTab('marketplace'); }}
                  className="text-[#0A66C2] font-bold hover:underline cursor-pointer"
                >
                  View in Marketplace →
                </button>
              </div>

              <div className="space-y-2">
                {filteredServices.map((svc, i) => (
                  <div key={i} className="rounded-xl border border-zinc-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">{svc.name}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{svc.vendor} · {svc.desc}</p>
                      <span className="font-mono text-emerald-600 font-bold text-[10px]">{svc.startingPrice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { onClose(); onNavigateTab('marketplace'); }}
                      className="rounded-full bg-[#0A66C2] text-white px-3 py-1 text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      Book Sprint
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. COURSES & LABS */}
          {(selectedCategory === "All" || selectedCategory === "Courses") && filteredCourses.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <span>Interactive Courses &amp; Defense Labs ({filteredCourses.length} found)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => { onClose(); onNavigateTab('learning'); }}
                  className="text-[#0A66C2] font-bold hover:underline cursor-pointer"
                >
                  View in Learning →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCourses.map((c, i) => (
                  <div key={i} className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">{c.title}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Instructor: {c.instructor} · {c.duration} ({c.labs} labs)</p>
                      <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 px-2 py-0.5 text-[9px] font-bold inline-block">
                        {c.level}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { onClose(); onNavigateTab('learning'); }}
                      className="rounded-full bg-[#0A66C2] text-white px-3 py-1 text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      Start Lab
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. RESEARCH & WHITEPAPERS */}
          {(selectedCategory === "All" || selectedCategory === "Research") && filteredResearch.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-600" />
                  <span>Research &amp; Technical Reports ({filteredResearch.length} found)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => { onClose(); onNavigateTab('pulserooms'); }}
                  className="text-[#0A66C2] font-bold hover:underline cursor-pointer"
                >
                  View in Pulse →
                </button>
              </div>

              <div className="space-y-2">
                {filteredResearch.map((r, i) => (
                  <div key={i} className="rounded-xl border border-zinc-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">{r.title}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{r.author} · {r.date}</p>
                      <span className="rounded bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 px-1.5 py-0.5 text-[9px] font-mono font-bold inline-block">
                        {r.format}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { onClose(); onNavigateTab('pulserooms'); }}
                      className="rounded-full bg-[#0A66C2] text-white px-3 py-1 text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      Read Report
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
