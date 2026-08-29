"use client"

import React, { useState } from "react"
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
  X
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

export function UniversalSearchModal({
  isOpen,
  onClose,
  initialQuery = "",
  onNavigateTab
}: UniversalSearchModalProps) {
  const [query, setQuery] = useState(initialQuery || "AWS security")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  const searchResults = {
    people: [
      { name: "Alex Taylor", role: "Principal Cloud Security Architect (Fellow)", org: "Expedite Consults", rating: 4.98, verified: true, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
      { name: "Marcus Vance", role: "VP of Defense Engineering", org: "CloudScale Corp", rating: 4.92, verified: true, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" }
    ],
    jobs: [
      { title: "Principal Cloud & Zero Trust Architect", company: "Expedite Consults", salary: "$195K–$235K Base ($245K TC)", clearance: "TS/SCI" },
      { title: "Lead AWS GovCloud Security Engineer", company: "Northrop Grumman", salary: "$185K–$215K Base", clearance: "Secret" }
    ],
    products: [
      { name: "AXIOM AI Cyber Suite", icon: "🛡️", tagline: "Autonomous Zero-Trust & Continuous cATO OSCAL telemetry.", price: "$499 / mo" },
      { name: "Expedite Strike ASPM", icon: "⚡", tagline: "Autonomous Red Teaming, ASPM & Hybrid AI AppSec.", price: "$499 / mo" }
    ],
    services: [
      { name: "AWS GovCloud cATO Architecture Sprint", vendor: "Expedite Consults Advisory", startingPrice: "$15,000 / Sprint" },
      { name: "Full-Scope Cloud Penetration Test (2,000 Hosts)", vendor: "Expedite Strike Labs", startingPrice: "$12,000 / Engagement" }
    ],
    courses: [
      { title: "AWS GovCloud Multi-Account Zero Trust Defense", duration: "12 Hours", labs: 4, level: "Advanced" },
      { title: "Kubernetes Cilium eBPF Micro-Segmentation", duration: "8 Hours", labs: 3, level: "Master" }
    ],
    research: [
      { title: "2026 Autonomous Threat Surface & AI-BOM Vulnerability Benchmark", date: "August 2026", format: "PDF Report" },
      { title: "OSCAL Continuous Monitoring Architecture for FedRAMP 2026", date: "July 2026", format: "Machine JSON" }
    ]
  }

  const categoryCounts = [
    { id: "All", label: "All Results", count: "4,468" },
    { id: "People", label: "People", count: "2,481", targetTab: "network" },
    { id: "Jobs", label: "Jobs", count: "1,283", targetTab: "jobs" },
    { id: "Products", label: "Products", count: "147", targetTab: "marketplace" },
    { id: "Services", label: "Services", count: "82", targetTab: "marketplace" },
    { id: "Courses", label: "Courses & Labs", count: "64", targetTab: "learning" },
    { id: "Research", label: "Research", count: "394", targetTab: "pulserooms" },
    { id: "Communities", label: "Communities", count: "17", targetTab: "ecosystem" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl">
        {/* Header Search Input */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-4 border-b border-white/10 shrink-0 text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-purple-500/30 px-2.5 py-0.5 text-[10px] font-bold text-purple-200 border border-purple-400/30 flex items-center gap-1">
                <Globe className="h-3 w-3 text-amber-300" />
                ConnectIn Universal Omnisearch
              </span>
              <span className="text-[11px] text-zinc-400">Indexed 18,400+ platform assets</span>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search people, companies, jobs, products, services, courses, experts, research..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl bg-white/10 border border-white/20 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categoryCounts.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-lg px-2.5 py-1 font-bold transition-all shrink-0 text-[11px] ${
                  selectedCategory === cat.id
                    ? "bg-white text-zinc-950 shadow-xs"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {cat.label} <span className="opacity-60 text-[10px]">({cat.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs bg-zinc-50 dark:bg-zinc-950">
          {/* 1. PEOPLE RESULTS */}
          {(selectedCategory === "All" || selectedCategory === "People") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#0A66C2]" />
                  <span>People &amp; Verified Experts (2,481 found)</span>
                </h4>
                <button onClick={() => { onClose(); onNavigateTab('network'); }} className="text-[#0A66C2] font-bold hover:underline">
                  View all in Network →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchResults.people.map((p, i) => (
                  <div key={i} className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={p.avatar} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{p.name}</p>
                          <ShieldCheck className="h-3.5 w-3.5 text-[#0A66C2]" />
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate">{p.role}</p>
                        <p className="text-[10px] text-amber-500 font-bold">{p.rating} ⭐ Rating</p>
                      </div>
                    </div>
                    <button onClick={() => { onClose(); onNavigateTab('network'); }} className="rounded-full bg-[#0A66C2] text-white px-3 py-1 text-[11px] font-bold shrink-0">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. PRODUCTS & SOFTWARE */}
          {(selectedCategory === "All" || selectedCategory === "Products") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-purple-600" />
                  <span>Enterprise Software &amp; Tools (147 found)</span>
                </h4>
                <button onClick={() => { onClose(); onNavigateTab('marketplace'); }} className="text-purple-600 font-bold hover:underline">
                  View all in Marketplace →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchResults.products.map((prod, i) => (
                  <div key={i} className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{prod.icon}</span>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{prod.name}</p>
                      </div>
                      <p className="text-[11px] text-zinc-500 line-clamp-1">{prod.tagline}</p>
                      <span className="font-mono text-emerald-600 font-bold text-[10px] block">{prod.price} · 14-Day Free Trial</span>
                    </div>
                    <button onClick={() => { onClose(); onNavigateTab('marketplace'); }} className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 text-[11px] font-bold shrink-0 shadow-xs">
                      Try Free
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. JOBS */}
          {(selectedCategory === "All" || selectedCategory === "Jobs") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-emerald-600" />
                  <span>Open Requisitions (1,283 found)</span>
                </h4>
                <button onClick={() => { onClose(); onNavigateTab('jobs'); }} className="text-[#0A66C2] font-bold hover:underline">
                  View all in Jobs →
                </button>
              </div>

              <div className="space-y-2">
                {searchResults.jobs.map((job, i) => (
                  <div key={i} className="rounded-xl border border-zinc-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">{job.title}</p>
                      <p className="text-[11px] text-zinc-500">{job.company} · Clearance: <strong className="text-purple-600">{job.clearance}</strong></p>
                      <span className="font-mono text-emerald-600 font-bold text-[10px]">{job.salary}</span>
                    </div>
                    <button onClick={() => { onClose(); onNavigateTab('jobs'); }} className="rounded-full bg-[#0A66C2] text-white px-3 py-1 text-[11px] font-bold shrink-0">
                      1-Click Apply
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
