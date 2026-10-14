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
  Radio,
  Globe,
  ArrowRight,
  ShieldCheck,
  Star,
  ExternalLink,
  Sparkles,
  X,
  Check,
  RefreshCw
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { UserProfile, getEnclaveConnectedMembers } from "@/lib/linkedin-data"
import { getEnclaveGlobalJobs } from "@/lib/global-jobs-data"
import { getEnclaveMarketplaceProducts } from "@/lib/marketplace-engine-data"
import { getEnclaveLearningCourses } from "@/lib/learning-platform-data"
import { getEnclavePulseArticles } from "@/lib/pulse-news-data"

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
  const enclaveId = currentUser?.professionEnclave || 'tech_cybersecurity'
  const [query, setQuery] = useState(initialQuery || "")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  const basePeople: PersonSearchResult[] = getEnclaveConnectedMembers(enclaveId).map(m => ({
    id: m.id,
    name: m.name,
    role: m.headline,
    org: m.mutualClearance || "Verified Trade Network",
    rating: 4.95,
    verified: true,
    avatar: m.avatar,
    skills: m.tags || []
  }))

  const [liveUsers, setLiveUsers] = useState<PersonSearchResult[]>(basePeople)
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set())
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  useEffect(() => {
    setLiveUsers(getEnclaveConnectedMembers(enclaveId).map(m => ({
      id: m.id,
      name: m.name,
      role: m.headline,
      org: m.mutualClearance || "Verified Trade Network",
      rating: 4.95,
      verified: true,
      avatar: m.avatar,
      skills: m.tags || []
    })))
  }, [enclaveId])

  const ALL_JOBS = getEnclaveGlobalJobs(enclaveId).map(j => ({
    title: j.title,
    company: j.company,
    salary: j.salary,
    clearance: j.clearance,
    skills: j.tags
  }))

  const ALL_PRODUCTS = getEnclaveMarketplaceProducts(enclaveId).map(p => ({
    name: p.name,
    icon: enclaveId === 'trades_construction' ? '🧰' : (enclaveId === 'healthcare_medicine' ? '🩺' : (enclaveId === 'automotive_mechanics' ? '🔧' : '🛡️')),
    tagline: p.description,
    price: p.pricing,
    category: p.category
  }))

  const ALL_SERVICES = [
    { name: `${currentUser?.profession || 'Trade'} Verified Advisory Sprint`, vendor: "ConnectIn Verified Network", startingPrice: "$8,500 / Project", desc: "Expert assessment, compliance audit, and operational readiness." },
    { name: "Full-Scope Safety & Process Audit", vendor: "Ecosystem Quality Group", startingPrice: "$12,000 / Engagement", desc: "Rigorous standards inspection and field certification." }
  ]

  const ALL_COURSES = getEnclaveLearningCourses(enclaveId).map(c => ({
    title: c.title,
    duration: c.duration,
    labs: 3,
    level: c.level,
    instructor: c.instructor.name
  }))

  const ALL_RESEARCH = getEnclavePulseArticles(enclaveId).map(a => ({
    title: a.title,
    date: a.publishedTime,
    format: a.category,
    author: a.source
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
              name: u.name,
              role: u.headline || "ConnectIn Member",
              org: u.role ? `ConnectIn ${u.role.charAt(0).toUpperCase() + u.role.slice(1)}` : "ConnectIn Member",
              rating: 4.9,
              verified: true,
              avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}&backgroundColor=0a66c2`,
              skills: ["Cyber Security", "Zero Trust", "Cloud Security"]
            }))

            // Merge with BASE_PEOPLE, avoiding duplicate names
            const merged = [...apiPeople, ...BASE_PEOPLE].filter((item, index, self) =>
              index === self.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase())
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

  const q = query.toLowerCase().trim()

  // Filter people
  const filteredPeople = liveUsers.filter(p => {
    if (!q) return true
    return (
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.org.toLowerCase().includes(q) ||
      p.skills?.some(s => s.toLowerCase().includes(q))
    )
  })

  // Filter jobs
  const filteredJobs = ALL_JOBS.filter(j => {
    if (!q) return true
    return (
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.clearance.toLowerCase().includes(q) ||
      j.skills?.some(s => s.toLowerCase().includes(q))
    )
  })

  // Filter products
  const filteredProducts = ALL_PRODUCTS.filter(prod => {
    if (!q) return true
    return (
      prod.name.toLowerCase().includes(q) ||
      prod.tagline.toLowerCase().includes(q) ||
      prod.category.toLowerCase().includes(q)
    )
  })

  // Filter services
  const filteredServices = ALL_SERVICES.filter(s => {
    if (!q) return true
    return (
      s.name.toLowerCase().includes(q) ||
      s.vendor.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q)
    )
  })

  // Filter courses
  const filteredCourses = ALL_COURSES.filter(c => {
    if (!q) return true
    return (
      c.title.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q) ||
      c.level.toLowerCase().includes(q)
    )
  })

  // Filter research
  const filteredResearch = ALL_RESEARCH.filter(r => {
    if (!q) return true
    return (
      r.title.toLowerCase().includes(q) ||
      r.author.toLowerCase().includes(q) ||
      r.format.toLowerCase().includes(q)
    )
  })

  const totalResultsCount =
    filteredPeople.length +
    filteredJobs.length +
    filteredProducts.length +
    filteredServices.length +
    filteredCourses.length +
    filteredResearch.length

  const categoryCounts = [
    { id: "All", label: "All Results", count: String(totalResultsCount) },
    { id: "People", label: "People & Members", count: String(filteredPeople.length), targetTab: "network" },
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
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        {/* Header Search Input */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-4 border-b border-white/10 shrink-0 text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-purple-500/30 px-2.5 py-0.5 text-[10px] font-bold text-purple-200 border border-purple-400/30 flex items-center gap-1">
                <Globe className="h-3 w-3 text-amber-300" />
                ConnectIn Universal Omnisearch
              </span>
              <span className="text-[11px] text-zinc-400">
                {isLoadingUsers ? "Indexing platform members..." : `Indexed ${liveUsers.length} members & enterprise assets`}
              </span>
            </div>
            {isLoadingUsers && (
              <RefreshCw className="h-3.5 w-3.5 text-zinc-400 animate-spin" />
            )}
          </div>

          <div className="relative flex items-center">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search members (Rhoda, Kwesi, Alex...), jobs, products, services, courses, research..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full rounded-xl bg-white/10 border border-white/20 pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-3 text-zinc-400 hover:text-white cursor-pointer"
                title="Clear query"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categoryCounts.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-lg px-2.5 py-1 font-bold transition-all shrink-0 text-[11px] cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-white text-zinc-950 shadow-xs"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
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
                Try searching for <strong>Rhoda</strong>, <strong>Kwesi</strong>, <strong>Alex</strong>, <strong>Zero Trust</strong>, or <strong>FedRAMP</strong>.
              </p>
              <button
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

          {/* 2. PRODUCTS & SOFTWARE */}
          {(selectedCategory === "All" || selectedCategory === "Products") && filteredProducts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-purple-600" />
                  <span>Enterprise Software &amp; Tools ({filteredProducts.length} found)</span>
                </h4>
                <button onClick={() => { onClose(); onNavigateTab('marketplace'); }} className="text-purple-600 font-bold hover:underline cursor-pointer">
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
                    <button onClick={() => { onClose(); onNavigateTab('marketplace'); }} className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 text-[11px] font-bold shrink-0 shadow-xs cursor-pointer">
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
                <button onClick={() => { onClose(); onNavigateTab('jobs'); }} className="text-[#0A66C2] font-bold hover:underline cursor-pointer">
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
                    <button onClick={() => { onClose(); onNavigateTab('jobs'); }} className="rounded-full bg-[#0A66C2] text-white px-3 py-1 text-[11px] font-bold shrink-0 cursor-pointer">
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
                <button onClick={() => { onClose(); onNavigateTab('marketplace'); }} className="text-[#0A66C2] font-bold hover:underline cursor-pointer">
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
                    <button onClick={() => { onClose(); onNavigateTab('marketplace'); }} className="rounded-full bg-[#0A66C2] text-white px-3 py-1 text-[11px] font-bold shrink-0 cursor-pointer">
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
                <button onClick={() => { onClose(); onNavigateTab('learning'); }} className="text-[#0A66C2] font-bold hover:underline cursor-pointer">
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
                    <button onClick={() => { onClose(); onNavigateTab('learning'); }} className="rounded-full bg-[#0A66C2] text-white px-3 py-1 text-[11px] font-bold shrink-0 cursor-pointer">
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
                <button onClick={() => { onClose(); onNavigateTab('pulserooms'); }} className="text-[#0A66C2] font-bold hover:underline cursor-pointer">
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
                    <button onClick={() => { onClose(); onNavigateTab('pulserooms'); }} className="rounded-full bg-[#0A66C2] text-white px-3 py-1 text-[11px] font-bold shrink-0 cursor-pointer">
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

