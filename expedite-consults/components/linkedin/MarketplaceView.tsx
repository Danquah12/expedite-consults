"use client"

import React, { useState } from "react"
import {
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Star,
  Download,
  ExternalLink,
  Check,
  CheckCircle2,
  Tag,
  Search,
  Code2,
  Terminal,
  Zap,
  ArrowRight,
  Layers,
  Flame,
  Clock,
  Key,
  Copy,
  Globe,
  Film,
  MessageSquare,
  Briefcase,
  Bot,
  Shield,
  Activity,
  Server,
  Lock,
  Cpu,
  User,
  PartyPopper,
  Calendar,
  Radio,
  Eye,
  ChevronRight,
  Filter
} from "lucide-react"
import {
  flagshipProductsData,
  spheraAppsData,
  FlagshipProduct,
  SpheraMicroApp
} from "@/lib/nextgen-data"
import { UserProfile } from "@/lib/linkedin-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface MarketplaceViewProps {
  currentUser: UserProfile
  onLaunchCareerSuite?: () => void
}

export function MarketplaceView({
  currentUser,
  onLaunchCareerSuite
}: MarketplaceViewProps) {
  const [activeMainTab, setActiveMainTab] = useState<'flagship' | 'sphera'>('flagship')
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpheraCategory, setSelectedSpheraCategory] = useState<string>("All")
  const [selectedProduct, setSelectedProduct] = useState<FlagshipProduct | null>(null)
  const [selectedMicroApp, setSelectedMicroApp] = useState<SpheraMicroApp | null>(null)
  const [generatedKey, setGeneratedKey] = useState("")
  const [copiedKey, setCopiedKey] = useState(false)
  const [isLiveIframeOpen, setIsLiveIframeOpen] = useState(false)

  // Sphera Categories
  const spheraCategories = [
    { id: "All", label: "All Sphera Apps", count: spheraAppsData.length, icon: Globe },
    { id: "Profile & Identity", label: "Profile & Identity", count: 3, icon: User },
    { id: "Content & Creation (SPHERA Studio)", label: "Content & Creation", count: 10, icon: Film },
    { id: "Social & Community (SPHERA Social)", label: "Social & Community", count: 9, icon: MessageSquare },
    { id: "Career & Professional (CareerOrbit)", label: "Career & Professional", count: 44, icon: Briefcase },
    { id: "Marketplace & Services (BAZAAR)", label: "Marketplace & Services", count: 5, icon: ShoppingBag },
    { id: "Events & Time", label: "Events & Time", count: 2, icon: PartyPopper },
    { id: "AI & Media Intelligence", label: "AI & Media Intelligence", count: 10, icon: Bot },
    { id: "Security & Threat Intelligence", label: "Security & Threat Intel", count: 54, icon: Shield }
  ]

  // Filtered Lists
  const filteredFlagship = flagshipProductsData.filter((p) => {
    const q = searchQuery.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    )
  })

  const filteredSphera = spheraAppsData.filter((a) => {
    const matchCat = selectedSpheraCategory === "All" || a.category === selectedSpheraCategory
    const q = searchQuery.toLowerCase()
    const matchSearch =
      a.name.toLowerCase().includes(q) ||
      a.tagline.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  const handleOpenLicenseModal = (prod: FlagshipProduct) => {
    const key = 'EXP-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-2026'
    setGeneratedKey(key)
    setSelectedProduct(prod)
  }

  const handleCopyKey = () => {
    navigator.clipboard?.writeText(generatedKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-20">
      {/* Top Header Bar matching portal.expediteconsults.com */}
      <div className="rounded-2xl border border-zinc-800 bg-[#070b14]/90 p-4 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 font-black text-white text-lg shadow-md shadow-sky-500/20">
            E
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-wide flex items-center gap-1.5">
              Expedite Consults
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">PORTAL</span>
            </span>
            <p className="text-[10px] text-zinc-400">Enterprise Cyber & Sphera Universe Mesh</p>
          </div>
        </div>

        {/* Global Live Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search all 137 apps, features, tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-zinc-700/80 bg-zinc-900/95 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-400 focus:border-sky-500 focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* Live System Count */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-emerald-400">136 Active</span>
          <span className="text-zinc-500">·</span>
          <span className="text-zinc-400">137 Total Apps</span>
        </div>
      </div>

      {/* Main Hero Banner: Exact recreation of portal.expediteconsults.com */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-b from-[#0a1128] via-[#070b19] to-[#04060d] p-8 sm:p-12 text-center text-white shadow-2xl">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="absolute right-10 bottom-0 h-64 w-64 rounded-full bg-indigo-600/15 blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          {/* Status Capsule */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-950/50 px-4 py-1 text-xs font-semibold text-sky-300 backdrop-blur-md shadow-xs">
            <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
            <span className="h-2 w-2 rounded-full bg-sky-400 -ml-3.5" />
            <span>All Systems Operational</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Your Digital <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Ecosystem</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-sky-200/80 max-w-2xl mx-auto leading-relaxed">
            Access all Expedite Consults products and Sphera platform modules from one place. Cybersecurity, services, social, and AI — all connected.
          </p>

          {/* 4 Key Ecosystem Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 max-w-2xl mx-auto">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 backdrop-blur-sm shadow-inner">
              <span className="text-2xl sm:text-3xl font-black text-sky-400">16</span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">PRODUCTS</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 backdrop-blur-sm shadow-inner">
              <span className="text-2xl sm:text-3xl font-black text-indigo-400">137</span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">SPHERA APPS</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 backdrop-blur-sm shadow-inner">
              <span className="text-2xl sm:text-3xl font-black text-purple-400">9</span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">CATEGORIES</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 backdrop-blur-sm shadow-inner">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">99.3%</span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">UPTIME</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Switcher: Flagship Products (16) vs Sphera Platform (137) */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-[#070b14] px-4 py-2 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMainTab('flagship')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeMainTab === 'flagship'
                ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Products & Services (16)</span>
          </button>

          <button
            onClick={() => setActiveMainTab('sphera')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeMainTab === 'sphera'
                ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Sphera Platform Apps (137)</span>
          </button>
        </div>

        <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-500">
          Sync status: connected
        </span>
      </div>

      {/* VIEW 1: 16 FLAGSHIP PRODUCTS & SERVICES */}
      {activeMainTab === 'flagship' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>Flagship Enterprise Products & Services</span>
              <span className="rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2.5 py-0.5 text-xs font-mono font-bold">
                {filteredFlagship.length} Active
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlagship.map((prod) => (
              <div
                key={prod.id}
                onClick={() => handleOpenLicenseModal(prod)}
                className="group relative rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#070b16] p-5 shadow-sm transition-all duration-300 hover:border-sky-500/60 hover:shadow-xl hover:shadow-sky-500/10 cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3.5">
                  {/* Visual Header */}
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-zinc-900">
                    <img
                      src={prod.coverImage}
                      alt={prod.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070b16] via-[#070b16]/30 to-transparent" />

                    {/* Domain Icon */}
                    <div className="absolute left-3.5 bottom-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900/90 text-2xl shadow-xl border border-zinc-700/80 backdrop-blur-md">
                      {prod.icon}
                    </div>

                    {/* Badge */}
                    <span className="absolute right-3.5 top-3.5 rounded-full bg-sky-500/90 px-3 py-1 text-[10px] font-black text-white uppercase tracking-wider backdrop-blur-md shadow-md">
                      {prod.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-500/20">
                        {prod.category}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                      </span>
                    </div>

                    <h3 className="mt-2 font-bold text-base text-zinc-900 dark:text-white group-hover:text-sky-400 transition-colors leading-snug">
                      {prod.name}
                    </h3>

                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {prod.tagline}
                    </p>
                  </div>

                  {/* Highlights Bullet Checklist */}
                  <div className="space-y-1 pt-1">
                    {prod.highlights.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer & Action */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm font-bold text-zinc-900 dark:text-sky-300">
                      {prod.priceDisplay}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={prod.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:from-sky-600 hover:to-indigo-700 transition-all flex items-center gap-1"
                    >
                      <span>Visit →</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: 137 SPHERA PLATFORM APPS BY CATEGORY */}
      {activeMainTab === 'sphera' && (
        <div className="space-y-6">
          {/* Category Filter Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {spheraCategories.map((cat) => {
              const IconComp = cat.icon
              const isSelected = selectedSpheraCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedSpheraCategory(cat.id)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                    isSelected
                      ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20"
                      : "border border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <IconComp className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-sky-400"}`} />
                  <span>{cat.label}</span>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    isSelected ? "bg-white/20 text-white" : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {cat.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Section Heading */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>Sphera Micro-Apps</span>
              <span className="rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2.5 py-0.5 text-xs font-mono font-bold">
                {filteredSphera.length} Apps
              </span>
            </h2>
            <span className="text-xs text-zinc-400">Deep-linked to standalone Vercel nodes</span>
          </div>

          {/* Sphera Micro-Apps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredSphera.map((app) => (
              <a
                key={app.id}
                href={app.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-zinc-800 bg-[#070b16] p-4 shadow-sm transition-all duration-200 hover:border-sky-500 hover:bg-[#0c1326] flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-xl border border-zinc-700/80 group-hover:border-sky-500/50 transition-colors">
                      {app.icon}
                    </div>

                    {app.badge && (
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                        app.badge === 'HOT'
                          ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                          : app.badge === 'LIVE'
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : app.badge === 'PRO'
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      }`}>
                        {app.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-sky-400 transition-colors truncate">
                      {app.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mt-0.5">
                      {app.tagline}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {app.status}
                  </span>
                  <span className="font-bold text-sky-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-[11px]">
                    Open →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Product Detail & License Activation Modal */}
      <Dialog open={Boolean(selectedProduct)} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden sm:rounded-3xl border border-sky-500/30 bg-[#070b16] text-white">
          {selectedProduct && (
            <>
              <DialogHeader className="border-b border-zinc-800 bg-gradient-to-r from-[#0a1128] via-[#070b19] to-[#04060d] px-6 py-5 text-white">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/90 text-3xl shadow-inner border border-zinc-700 shrink-0">
                    {selectedProduct.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[10px] font-bold text-sky-300 border border-sky-500/30">
                        {selectedProduct.category}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified Expedite System
                      </span>
                    </div>
                    <DialogTitle className="text-lg sm:text-xl font-bold text-white mt-1">
                      {selectedProduct.name}
                    </DialogTitle>
                    <p className="text-xs text-sky-200/80">{selectedProduct.tagline}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs">
                {/* Description */}
                <div>
                  <h4 className="font-bold text-xs text-sky-400 uppercase tracking-wider">
                    Architectural Overview
                  </h4>
                  <p className="mt-1 text-zinc-300 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Highlights */}
                <div>
                  <h4 className="font-bold text-xs text-sky-400 uppercase tracking-wider mb-2">
                    Core Platform Capabilities
                  </h4>
                  <div className="space-y-1.5">
                    {selectedProduct.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2 text-zinc-200">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* License Box */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Key className="h-3.5 w-3.5 text-sky-400" /> Generated Node License Key
                    </span>
                    <span className="text-emerald-400 font-mono">STATUS: ACTIVE</span>
                  </span>
                  <p className="font-mono text-sm font-black text-sky-300 tracking-wider">
                    {generatedKey}
                  </p>
                  <button
                    onClick={handleCopyKey}
                    className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-white"
                  >
                    {copiedKey ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey ? "Copied to clipboard" : "Copy License Key"}</span>
                  </button>
                </div>

                {/* Action Footer */}
                <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xl font-mono font-black text-sky-300">
                      {selectedProduct.priceDisplay}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={selectedProduct.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-2 text-xs font-bold text-white shadow-md hover:from-sky-600 hover:to-indigo-700 transition-all flex items-center gap-1"
                    >
                      <span>Launch App Now 🚀</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
