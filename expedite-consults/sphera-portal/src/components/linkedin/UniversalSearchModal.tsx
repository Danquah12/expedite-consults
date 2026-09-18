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

interface UniversalSearchModalProps {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
  onNavigateTab: (tab: string) => void
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

const BASE_PEOPLE: PersonSearchResult[] = [
  {
    id: "usr_rhoda_1",
    name: "Rhoda Mensah",
    role: "Senior Cyber Compliance & Risk Analyst",
    org: "ConnectIn Verified Member",
    rating: 4.95,
    verified: true,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    skills: ["FedRAMP Compliance", "NIST SP 800-53", "Zero Trust", "SOC 2"]
  },
  {
    id: "usr_rhoda_2",
    name: "Rhoda",
    role: "Cybersecurity & Technology Professional",
    org: "ConnectIn Member",
    rating: 4.90,
    verified: true,
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Rhoda&backgroundColor=0a66c2",
    skills: ["Cloud Security", "Enterprise IAM"]
  },
  {
    id: "usr_kwesi",
    name: "Kwesi Asiedu",
    role: "Founder & Chief Security Officer",
    org: "Expedite Consults",
    rating: 4.99,
    verified: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    skills: ["Zero Trust Architecture", "GovCloud Security", "Enterprise IAM"]
  },
  {
    id: "usr_hayes",
    name: "Commander Robert Hayes",
    role: "Platform IAM & Super Administrator",
    org: "ConnectIn Master Control",
    rating: 4.99,
    verified: true,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    skills: ["SOC 2 Type II Auditing", "RBAC / ABAC Matrix", "FedRAMP High IAM"]
  },
  {
    id: "usr_alex",
    name: "Alex Taylor",
    role: "Principal Cloud Security Architect (Fellow)",
    org: "Expedite Consults",
    rating: 4.98,
    verified: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    skills: ["AWS GovCloud Security", "Kubernetes Zero Trust", "cATO OSCAL Automation"]
  },
  {
    id: "usr_marcus",
    name: "Marcus Vance",
    role: "VP of Defense Engineering",
    org: "CloudScale Corp",
    rating: 4.92,
    verified: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    skills: ["Enterprise Procurement", "FAR / DFARS Compliance", "GovCloud RFPs"]
  },
  {
    id: "usr_elena",
    name: "Dr. Elena Rostova",
    role: "Chief AI Research Scientist",
    org: "Stanford AI Lab / Expedite Research",
    rating: 4.97,
    verified: true,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    skills: ["AI Security", "Deterministic Sandboxing", "Agent Containment"]
  }
]

const ALL_JOBS = [
  { title: "Principal Cloud & Zero Trust Architect", company: "Expedite Consults", salary: "$195K–$235K Base ($245K TC)", clearance: "TS/SCI", skills: ["AWS", "Zero Trust", "FedRAMP"] },
  { title: "Lead AWS GovCloud Security Engineer", company: "Northrop Grumman", salary: "$185K–$215K Base", clearance: "Secret", skills: ["GovCloud", "cATO", "eBPF"] },
  { title: "Cyber Compliance & Risk Analyst (FedRAMP/GRC)", company: "Expedite Consults Advisory", salary: "$145K–$175K Base", clearance: "Public Trust / Tier 3", skills: ["FedRAMP", "NIST", "SOC 2"] },
  { title: "Senior AppSec & Penetration Test Engineer", company: "Apex Defense Labs", salary: "$170K–$200K Base", clearance: "Top Secret", skills: ["OSCP", "Red Team", "AppSec"] }
]

const ALL_PRODUCTS = [
  { name: "AXIOM AI Cyber Suite", icon: "🛡️", tagline: "Autonomous Zero-Trust & Continuous cATO OSCAL telemetry.", price: "$499 / mo", category: "Security" },
  { name: "Expedite Strike ASPM", icon: "⚡", tagline: "Autonomous Red Teaming, ASPM & Hybrid AI AppSec.", price: "$499 / mo", category: "AppSec" },
  { name: "KernelGuard eBPF Telemetry", icon: "🔒", tagline: "Kernel-level zero-trust telemetry and runtime defense for Kubernetes.", price: "$299 / mo", category: "Infrastructure" }
]

const ALL_SERVICES = [
  { name: "AWS GovCloud cATO Architecture Sprint", vendor: "Expedite Consults Advisory", startingPrice: "$15,000 / Sprint", desc: "Rapid 4-week ATO packaging with automated OSCAL artifacts." },
  { name: "Full-Scope Cloud Penetration Test (2,000 Hosts)", vendor: "Expedite Strike Labs", startingPrice: "$12,000 / Engagement", desc: "Autonomous and manual exploitation testing across VPCs." },
  { name: "SOC 2 Type II Audit Readiness Sprint", vendor: "Expedite Consults GRC", startingPrice: "$8,500 / Sprint", desc: "Pre-audit remediation and policy automation." }
]

const ALL_COURSES = [
  { title: "AWS GovCloud Multi-Account Zero Trust Defense", duration: "12 Hours", labs: 4, level: "Advanced", instructor: "Kwesi Asiedu" },
  { title: "Kubernetes Cilium eBPF Micro-Segmentation", duration: "8 Hours", labs: 3, level: "Master", instructor: "Alex Taylor" },
  { title: "FedRAMP High & NIST SP 800-53 Control Automation", duration: "10 Hours", labs: 2, level: "Intermediate", instructor: "Rhoda Mensah" }
]

const ALL_RESEARCH = [
  { title: "2026 Autonomous Threat Surface & AI-BOM Vulnerability Benchmark", date: "August 2026", format: "PDF Report", author: "Dr. Elena Rostova" },
  { title: "OSCAL Continuous Monitoring Architecture for FedRAMP 2026", date: "July 2026", format: "Machine JSON", author: "Kwesi Asiedu" },
  { title: "Multi-Agent AI Immunity & Cryptographic Sandboxing Guide", date: "June 2026", format: "Whitepaper", author: "Expedite Labs" }
]

export function UniversalSearchModal({
  isOpen,
  onClose,
  initialQuery = "",
  onNavigateTab
}: UniversalSearchModalProps) {
  const [query, setQuery] = useState(initialQuery || "")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [liveUsers, setLiveUsers] = useState<PersonSearchResult[]>(BASE_PEOPLE)
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set())
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

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

