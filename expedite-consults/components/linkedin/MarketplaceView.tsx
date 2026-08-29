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
  Filter,
  PlusCircle,
  DollarSign,
  Store,
  Box,
  CreditCard,
  Building2,
  Users
} from "lucide-react"
import {
  flagshipProductsData,
  spheraAppsData,
  advisorsData,
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

interface VendorServiceListing {
  id: string
  title: string
  provider: string
  providerAvatar: string
  category: string
  price: string
  rating: number
  reviewsCount: number
  badge: string
  description: string
  deliverables: string[]
  applyUrl?: string
}

const VENDOR_SERVICES: VendorServiceListing[] = [
  {
    id: 'serv_1',
    title: 'Fractional CISO & Zero Trust Cloud Transformation',
    provider: 'Alex Taylor (Expedite Fellow)',
    providerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    category: 'Cyber Advisory',
    price: '$350 / hr · $5,000 retainer',
    rating: 5.0,
    reviewsCount: 42,
    badge: '⭐ Top Rated Fellow',
    description: 'Enterprise guidance on zero-trust multi-cloud perimeter elimination, SOC2 Type II audit readiness, and AWS/Azure cloud security posture.',
    deliverables: ['Full Multi-Cloud Architecture Review', 'Threat Modeling Matrix (STRIDE)', 'Quarterly Board Audit Deck', 'Weekly 1:1 Executive Sync']
  },
  {
    id: 'serv_2',
    title: 'Autonomous Multi-Agent AI Containment & Safety Audit',
    provider: 'Dr. Elena Rostova',
    providerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    category: 'AI & Security',
    price: '$450 / hr · $8,500 package',
    rating: 4.98,
    reviewsCount: 56,
    badge: '🧠 Stanford Fellow',
    description: 'Cryptographic nonces, isolated microVM sandbox verification, and prompt injection defense evaluations for generative LLM tool-calling agents.',
    deliverables: ['PyTorch / Llama Guardrail Evaluation', 'Adversarial Jailbreak Fuzzing Report', 'Deterministic Execution Sandbox Blueprint']
  },
  {
    id: 'serv_3',
    title: 'High-Performance Next.js 16 & Turbopack Core Audit',
    provider: 'Devon Hughes',
    providerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    category: 'Frontend Architecture',
    price: '$250 / hr · $3,500 audit',
    rating: 4.92,
    reviewsCount: 28,
    badge: '⚡ Next.js Pioneer',
    description: 'Complete codebase optimization for sub-50ms TTFB, React Server Actions optimization, zero-bundle mutations, and Tailwind CSS v4 token migrations.',
    deliverables: ['Lighthouse 100/100 Core Web Vitals Audit', 'Server Actions & Cache Tag Blueprint', '2x Architecture Review Sessions']
  }
]

export function MarketplaceView({
  currentUser,
  onLaunchCareerSuite
}: MarketplaceViewProps) {
  const [activeTab, setActiveTab] = useState<'flagship' | 'services' | 'bazaar' | 'sphera'>('flagship')
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpheraCategory, setSelectedSpheraCategory] = useState<string>("All")
  const [selectedProduct, setSelectedProduct] = useState<FlagshipProduct | null>(null)
  const [selectedMicroApp, setSelectedMicroApp] = useState<SpheraMicroApp | null>(null)
  const [generatedKey, setGeneratedKey] = useState("")
  const [copiedKey, setCopiedKey] = useState(false)
  const [isSellModalOpen, setIsSellModalOpen] = useState(false)
  const [sellSuccess, setSellSuccess] = useState(false)

  // Sell form state
  const [productTitle, setProductTitle] = useState("")
  const [productPrice, setProductPrice] = useState("")
  const [productCategory, setProductCategory] = useState("Cybersecurity & SaaS")
  const [productDescription, setProductDescription] = useState("")

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

  const filteredServices = VENDOR_SERVICES.filter((s) => {
    const q = searchQuery.toLowerCase()
    return (
      s.title.toLowerCase().includes(q) ||
      s.provider.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
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

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSellSuccess(true)
    setTimeout(() => {
      setSellSuccess(false)
      setIsSellModalOpen(false)
      setProductTitle("")
      setProductPrice("")
      setProductDescription("")
    }, 2000)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-20">
      {/* Top Marketplace Commercial Banner */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-purple-500/20 px-3 py-0.5 text-xs font-bold text-purple-300 border border-purple-400/40 flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5" />
                ConnectIn Digital Marketplace & Store
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                16 Flagship Products · 137 Apps · Verified Sellers
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Discover & Sell Enterprise Products, Cyber Tools & Services
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl leading-relaxed">
              Explore enterprise cybersecurity suites, sovereign AI tools, fractional advisory packages, and software licenses. Buy directly with commercial API licenses or list your own solutions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => setIsSellModalOpen(true)}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center gap-2 border border-purple-400/40"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Sell Product / Service</span>
            </button>

            <a
              href="https://portal.expediteconsults.com"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition-all flex items-center gap-2 border border-white/20"
            >
              <span>Expedite Portal</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search products, cybersecurity tools, services, apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-black/40 pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-400 border border-white/15 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-300">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              99.3% System Uptime
            </span>
            <span>·</span>
            <span>136 Active Micro-Apps</span>
          </div>
        </div>
      </div>

      {/* 4 Core Marketplace Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('flagship')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === 'flagship'
              ? "bg-[#0A66C2] text-white shadow-md"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>Flagship Products & Cyber Suites (16)</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === 'services'
              ? "bg-[#0A66C2] text-white shadow-md"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Professional & Fractional Services</span>
        </button>

        <button
          onClick={() => setActiveTab('sphera')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === 'sphera'
              ? "bg-[#0A66C2] text-white shadow-md"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Sphera App Store (137 Micro-Apps)</span>
        </button>
      </div>

      {/* TAB 1: FLAGSHIP PRODUCTS & CYBERSECURITY PLATFORMS */}
      {activeTab === 'flagship' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#0A66C2]" />
                Flagship Enterprise Solutions
              </h2>
              <p className="text-xs text-zinc-500">
                Official offensive security platforms, automated pentesting consoles, and standalone products.
              </p>
            </div>
            <span className="text-xs text-zinc-500 font-medium">
              {filteredFlagship.length} solutions available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlagship.map((product) => (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition-all hover:border-sky-500/50 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-2xl dark:bg-zinc-800 shadow-2xs">
                        {product.icon}
                      </span>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-[#0A66C2] transition-colors">
                          {product.name}
                        </h3>
                        <span className="text-[11px] text-zinc-500 font-medium">
                          {product.category}
                        </span>
                      </div>
                    </div>

                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:bg-sky-950 dark:text-sky-300 shrink-0">
                      {product.priceDisplay}
                    </span>
                  </div>

                  {/* Tagline & Description */}
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    {product.tagline}
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Highlights checklist */}
                  {product.highlights && product.highlights.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {product.highlights.slice(0, 3).map((h, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                          <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span className="truncate">{h}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-xl bg-[#0A66C2] py-2 text-xs font-bold text-white hover:bg-[#004182] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Launch App</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <button
                    onClick={() => handleOpenLicenseModal(product)}
                    className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 transition-colors flex items-center gap-1"
                    title="Generate Instant Commercial License Key"
                  >
                    <Key className="h-3.5 w-3.5 text-amber-500" />
                    <span>License</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PROFESSIONAL & FRACTIONAL SERVICES STOREFRONTS */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
                Fractional Advisory & Expert Service Storefronts
              </h2>
              <p className="text-xs text-zinc-500">
                Book verified CISO advisory, code audits, architecture reviews, and red team engagements.
              </p>
            </div>
            <button
              onClick={() => setIsSellModalOpen(true)}
              className="rounded-xl bg-[#0A66C2] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#004182] transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>List Your Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition-all hover:border-purple-500/50 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {service.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-500" /> {service.rating} ({service.reviewsCount})
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 leading-snug">
                    {service.title}
                  </h3>

                  {/* Provider row */}
                  <div className="flex items-center gap-2 pt-1">
                    <img
                      src={service.providerAvatar}
                      alt={service.provider}
                      className="h-7 w-7 rounded-full object-cover border border-zinc-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {service.provider}
                      </p>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {service.badge}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1">
                    {service.description}
                  </p>

                  {/* Deliverables */}
                  <div className="space-y-1 pt-2">
                    <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      Includes:
                    </p>
                    {service.deliverables.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                        <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {service.price}
                  </span>

                  <button
                    onClick={() => {
                      alert(`Booking request initialized for ${service.title}. Direct invoice and calendar sync sent to your ConnectIn inbox.`)
                    }}
                    className="rounded-xl bg-[#0A66C2] px-4 py-2 text-xs font-bold text-white hover:bg-[#004182] transition-colors"
                  >
                    Book Engagement
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SPHERA MICRO-APP STORE (137 APPS) */}
      {activeTab === 'sphera' && (
        <div className="space-y-6">
          {/* Sphera Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {spheraCategories.map((cat) => {
              const Icon = cat.icon
              const isSelected = selectedSpheraCategory === cat.id

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedSpheraCategory(cat.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-[#0A66C2] text-white shadow-md"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${isSelected ? "bg-white/20 text-white" : "bg-zinc-200 dark:bg-zinc-700"}`}>
                    {cat.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Sphera Micro-Apps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredSphera.map((app) => (
              <div
                key={app.id}
                className="group rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs hover:border-[#0A66C2] hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{app.icon}</span>
                    {app.badge && (
                      <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[9px] font-bold text-[#0A66C2] border border-sky-200 dark:bg-sky-950 dark:text-sky-300">
                        {app.badge}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] transition-colors leading-snug">
                    {app.name}
                  </h4>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {app.tagline}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400">{app.status}</span>
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-[#0A66C2] hover:underline"
                  >
                    <span>Open →</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sell Your Product / Service Modal */}
      <Dialog open={isSellModalOpen} onOpenChange={setIsSellModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Store className="h-5 w-5 text-[#0A66C2]" />
              <span>List Your Product or Service on Marketplace</span>
            </DialogTitle>
          </DialogHeader>

          {sellSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Listing Submitted!
              </h4>
              <p className="text-xs text-zinc-500">
                Your storefront product has been verified and syndicated across the ConnectIn Marketplace.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSellSubmit} className="space-y-4 pt-2 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">
                  Product / Service Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Vulnerability Scanner Pro or Cloud Migration Consulting"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-xs text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Pricing / Rate
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $299 / mo or $250 / hr"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 text-xs text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Category
                  </label>
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 text-xs text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                  >
                    <option>Cybersecurity & SaaS</option>
                    <option>AI Tools & Models</option>
                    <option>Fractional CISO Advisory</option>
                    <option>DevOps & Cloud Infrastructure</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">
                  Description & Deliverables
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your software capabilities, API endpoints, or consulting deliverables..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-xs text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsSellModalOpen(false)}
                  className="rounded-full px-4 py-1.5 font-bold text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#0A66C2] px-5 py-2 font-bold text-white hover:bg-[#004182] flex items-center gap-1.5"
                >
                  <Store className="h-3.5 w-3.5" />
                  <span>Publish Listing</span>
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Commercial License Key Generation Modal */}
      <Dialog open={Boolean(selectedProduct)} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-md">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Key className="h-5 w-5 text-amber-500" />
                  <span>Instant Commercial License Activation</span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-2 text-xs">
                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60 flex items-center gap-3">
                  <span className="text-2xl">{selectedProduct.icon}</span>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100">
                      {selectedProduct.name}
                    </h4>
                    <p className="text-zinc-500">{selectedProduct.priceDisplay}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Generated Enterprise License Key
                  </label>
                  <div className="flex items-center justify-between rounded-lg border border-zinc-300 bg-zinc-100 p-2.5 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-800">
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      {generatedKey}
                    </span>
                    <button
                      onClick={handleCopyKey}
                      className="rounded-md bg-white px-2 py-1 text-[11px] font-bold text-zinc-700 shadow-2xs hover:bg-zinc-50 dark:bg-zinc-700 dark:text-zinc-200"
                    >
                      {copiedKey ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="rounded-full px-4 py-1.5 font-bold text-zinc-600"
                  >
                    Close
                  </button>
                  <a
                    href={selectedProduct.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-[#0A66C2] px-5 py-2 font-bold text-white hover:bg-[#004182] flex items-center gap-1.5"
                  >
                    <span>Launch & Authenticate</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
