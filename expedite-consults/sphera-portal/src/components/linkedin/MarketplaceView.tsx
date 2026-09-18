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
  Users,
  Play,
  FileText,
  SlidersHorizontal,
  ThumbsUp,
  Award,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Package,
  Wrench,
  GraduationCap,
  Boxes,
  HelpCircleIcon
} from "lucide-react"
import {
  MarketplaceProduct,
  MARKETPLACE_CATEGORIES_CONFIG,
  MASTER_MARKETPLACE_PRODUCTS
} from "@/lib/marketplace-engine-data"
import {
  ENTERPRISE_SOLUTIONS_DATA,
  SolutionPackage
} from "@/lib/solutions-layer-data"
import {
  spheraAppsData,
  flagshipProductsData,
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
  onNavigateTab?: (tab: string) => void
}

export function MarketplaceView({
  currentUser,
  onLaunchCareerSuite,
  onNavigateTab
}: MarketplaceViewProps) {
  // Master Category & Subcategory: Discover | Solutions | Software | Services | Cybersecurity | AI | Cloud | Training | Enterprise | Deals | Sphera
  const [selectedMainCategory, setSelectedMainCategory] = useState<
    'Discover' | 'Solutions' | 'Software' | 'Services' | 'Cybersecurity' | 'AI' | 'Cloud' | 'Training' | 'Enterprise' | 'Deals' | 'Sphera' | 'All'
  >('Discover')
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price_low' | 'price_high'>('popular')

  // Solutions Layer State
  const [solutions, setSolutions] = useState<SolutionPackage[]>(ENTERPRISE_SOLUTIONS_DATA)
  const [selectedSolution, setSelectedSolution] = useState<SolutionPackage | null>(ENTERPRISE_SOLUTIONS_DATA[0])

  // Selected Product Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null)
  const [activeProductTab, setActiveProductTab] = useState<'overview' | 'features' | 'screenshots' | 'demo' | 'architecture' | 'integrations' | 'security' | 'pricing' | 'reviews' | 'docs' | 'casestudies' | 'support'>('overview')

  // License Modal State
  const [generatedLicenseKey, setGeneratedLicenseKey] = useState<string | null>(null)
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false)
  const [hasCopiedLicense, setHasCopiedLicense] = useState(false)

  // Vendor Listing Modal
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false)
  const [vendorSuccess, setVendorSuccess] = useState(false)
  const [newVendorTitle, setNewVendorTitle] = useState("")
  const [newVendorCategory, setNewVendorCategory] = useState("Software")
  const [newVendorPrice, setNewVendorPrice] = useState("$299 / mo")
  const [newVendorDesc, setNewVendorDesc] = useState("")

  // Filter Products based on category selection
  const filteredProducts = MASTER_MARKETPLACE_PRODUCTS.filter(p => {
    let matchCategory = true
    if (selectedMainCategory === 'Software') matchCategory = p.category === 'Software'
    else if (selectedMainCategory === 'Services') matchCategory = p.category === 'Services'
    else if (selectedMainCategory === 'Training') matchCategory = p.category === 'Training'
    else if (selectedMainCategory === 'Enterprise') matchCategory = p.category === 'Enterprise Solutions'
    else if (selectedMainCategory === 'Cybersecurity') matchCategory = p.subCategory.toLowerCase().includes('cyber') || p.overview.toLowerCase().includes('security') || p.name.toLowerCase().includes('strike')
    else if (selectedMainCategory === 'AI') matchCategory = p.subCategory.toLowerCase().includes('ai') || p.overview.toLowerCase().includes('ai')
    else if (selectedMainCategory === 'Cloud') matchCategory = p.subCategory.toLowerCase().includes('cloud') || p.overview.toLowerCase().includes('cloud')
    else if (selectedMainCategory === 'Deals') matchCategory = p.pricing.hasFreeTrial || p.badge?.includes('Featured') || false

    const matchSubCategory = selectedSubCategory === 'All' || selectedSubCategory.startsWith('All') || p.subCategory === selectedSubCategory
    const matchSearch = !searchQuery || (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.overview.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return matchCategory && matchSubCategory && matchSearch
  })

  // Handle Instant Free Trial or Buy License Generation
  const handleGenerateLicense = (product: MarketplaceProduct | { name: string }, type: 'trial' | 'commercial' = 'trial') => {
    const prefix = type === 'trial' ? 'TRIAL-EXP' : 'COMM-EXP'
    const code = `${prefix}-${product.name.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-2026`
    setGeneratedLicenseKey(code)
    setHasCopiedLicense(false)
    setIsLicenseModalOpen(true)
  }

  const handleCopyKey = () => {
    if (generatedLicenseKey) {
      navigator.clipboard.writeText(generatedLicenseKey)
      setHasCopiedLicense(true)
      setTimeout(() => setHasCopiedLicense(false), 2500)
    }
  }

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setVendorSuccess(true)
    setTimeout(() => {
      setVendorSuccess(false)
      setIsVendorModalOpen(false)
    }, 2000)
  }

  const marketplaceTabs = [
    { id: 'Discover', label: '✨ Discover' },
    { id: 'Solutions', label: '🎯 Solutions (Business Outcomes)', isSolutions: true },
    { id: 'Software', label: '💻 Software' },
    { id: 'Services', label: '🛠️ Services' },
    { id: 'Cybersecurity', label: '🛡️ Cybersecurity' },
    { id: 'AI', label: '🤖 AI' },
    { id: 'Cloud', label: '☁️ Cloud' },
    { id: 'Training', label: '🎓 Training' },
    { id: 'Enterprise', label: '🏢 Enterprise' },
    { id: 'Deals', label: '🏷️ Deals' },
    { id: 'Sphera', label: '🪐 Sphera (137 Apps)' },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-24">
      {/* 1. TOP MARKETPLACE HERO BANNER */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-purple-500/30 px-3 py-0.5 text-xs font-bold text-purple-200 border border-purple-400/40 flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5 text-amber-300" />
                ConnectIn Commercial Engine &amp; Solutions Layer
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                Products · Services · Experts · Learning · Jobs
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Discover Products &amp; Solve Business Outcomes
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Find individual enterprise tools or select a business problem to receive a complete tailored package: Products + Consulting Services + Verified Experts + Hands-on Training.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setSelectedMainCategory('Solutions')}
              className="rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2.5 text-xs sm:text-sm font-black text-zinc-950 shadow-md flex items-center gap-1.5 transition-all"
            >
              <Zap className="h-4 w-4 text-zinc-950 fill-zinc-950" />
              <span>Explore Solutions Hub</span>
            </button>

            <button
              onClick={() => setIsVendorModalOpen(true)}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md flex items-center gap-1.5 transition-all border border-purple-400/40"
            >
              <PlusCircle className="h-4 w-4 text-amber-300" />
              <span>➕ Sell Product / Service</span>
            </button>
          </div>
        </div>

        {/* 10 MASTER CATEGORY TABS (DISCOVER | SOLUTIONS | SOFTWARE | SERVICES | CYBERSECURITY | AI | CLOUD | TRAINING | ENTERPRISE | DEALS | SPHERA) */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none w-full">
            {marketplaceTabs.map((cat) => {
              const isSelected = selectedMainCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedMainCategory(cat.id as any)
                    setSelectedSubCategory('All')
                  }}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? cat.isSolutions
                        ? "bg-amber-400 text-zinc-950 shadow-lg font-black"
                        : "bg-white text-zinc-950 shadow-md font-black"
                      : cat.isSolutions
                      ? "bg-amber-500/20 text-amber-300 border border-amber-400/40 hover:bg-amber-500/30"
                      : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* QUICK SOLUTIONS ACTION BAR */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 shrink-0 mr-1 flex items-center gap-1">
            <Zap className="h-3 w-3" /> I need to:
          </span>
          {[
            { label: '🔐 Secure my AWS cloud', id: 'sol_secure_aws' },
            { label: '📋 Achieve FedRAMP & cATO', id: 'sol_fedramp_cato' },
            { label: '🛡️ Autonomous PenTest & ASPM', id: 'sol_pentest_aspm' },
            { label: '🤖 Deploy AI Securely (MCP)', id: 'sol_ai_security' }
          ].map((sol) => (
            <button
              key={sol.id}
              onClick={() => {
                setSelectedMainCategory('Solutions')
                const matched = solutions.find(s => s.id === sol.id)
                if (matched) setSelectedSolution(matched)
              }}
              className="rounded-full bg-white/15 hover:bg-white/25 text-white text-xs px-3 py-1 font-semibold transition-all shrink-0 border border-white/10 hover:border-amber-300"
            >
              {sol.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SOLUTIONS LAYER: SOLVING BUSINESS OUTCOMES */}
      {/* ========================================================================= */}
      {selectedMainCategory === 'Solutions' ? (
        <div className="space-y-6">
          {/* Solutions Problem Selector Ribbon */}
          <div className="rounded-2xl border border-amber-500/40 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div>
              <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                🎯 ConnectIn Enterprise Solutions Blueprint
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
                Select Your Business Objective
              </h2>
              <p className="text-xs text-zinc-500 max-w-2xl">
                Instead of searching fragmented tool lists, choose your outcome to get an interconnected blueprint: Products + Services + Verified Experts + Training Labs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {solutions.map((sol) => {
                const isSelected = selectedSolution?.id === sol.id
                return (
                  <div
                    key={sol.id}
                    onClick={() => setSelectedSolution(sol)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 flex flex-col justify-between ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 ring-2 ring-amber-500/40 shadow-sm"
                        : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 hover:bg-zinc-50"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <span className="text-2xl">{sol.icon}</span>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-tight">
                        {sol.title}
                      </h3>
                      <p className="text-[11px] text-zinc-500 line-clamp-2">
                        {sol.problemStatement}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>{sol.estimatedTime}</span>
                      <span className="font-bold text-amber-700 dark:text-amber-300">View Blueprint →</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ACTIVE SOLUTION BLUEPRINT PACKAGE (PRODUCTS + SERVICES + EXPERTS + LEARNING + JOBS) */}
          {selectedSolution && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-5 dark:border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{selectedSolution.icon}</span>
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                      {selectedSolution.title}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
                    <strong>Target Outcome:</strong> {selectedSolution.targetOutcome}
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-3 text-right shrink-0">
                  <span className="text-[10px] uppercase font-mono text-zinc-400">Framework Standard</span>
                  <p className="font-bold text-xs text-[#0A66C2] dark:text-sky-400">
                    {selectedSolution.complianceFramework}
                  </p>
                </div>
              </div>

              {/* PILLAR 1: RECOMMENDED PRODUCTS */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-600" />
                  <span>1. Recommended Enterprise Products (Instant Trials)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedSolution.recommendedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{prod.icon}</span>
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                            {prod.name}
                          </h5>
                          <p className="text-[11px] text-zinc-500 mt-0.5">{prod.tagline}</p>
                          <span className="font-bold text-xs text-emerald-600 block mt-1">{prod.price}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleGenerateLicense(prod, 'trial')}
                        className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 shadow-xs shrink-0"
                      >
                        {prod.actionText}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* PILLAR 2: RECOMMENDED CONSULTING SERVICES */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-indigo-600" />
                  <span>2. Recommended Consulting Retainers &amp; Assessments</span>
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {selectedSolution.recommendedServices.map((srv, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <h5 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                          {srv.name}
                        </h5>
                        <p className="text-[11px] text-zinc-500">Provider: <strong>{srv.provider}</strong> · Scope: {srv.scope}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="font-bold text-xs text-emerald-600 block">{srv.price}</span>
                          <span className="text-[10px] text-zinc-400">{srv.deliveryTimeline}</span>
                        </div>
                        <button
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab('messaging')
                          }}
                          className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold px-3 py-1.5 shadow-xs"
                        >
                          Request Statement of Work
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PILLAR 3 & 4: EXPERTS & LEARNING GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Verified Experts */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    <span>3. Verified Subject Matter Experts</span>
                  </h4>
                  {selectedSolution.recommendedExperts.map((exp, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img src={exp.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-amber-400" />
                        <div>
                          <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                            {exp.name} <ShieldCheck className="h-3.5 w-3.5 text-[#0A66C2]" />
                          </h5>
                          <p className="text-[11px] text-zinc-500">{exp.role}</p>
                          <span className="text-[10px] text-amber-600 font-bold">★ {exp.rating} ({exp.reviewsCount} reviews)</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">{exp.hourlyRate}</span>
                        <button
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab('peerreview')
                          }}
                          className="mt-1 text-[11px] font-bold text-[#0A66C2] hover:underline"
                        >
                          Book Slot →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hands-on Learning */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-sky-600" />
                    <span>4. Hands-On Training Labs &amp; Masterclasses</span>
                  </h4>
                  {selectedSolution.recommendedLearning.map((lrn, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {lrn.title}
                        </h5>
                        <p className="text-[11px] text-zinc-500">{lrn.provider} · {lrn.duration}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {lrn.skillsGained.map((sk, i) => (
                            <span key={i} className="rounded bg-sky-100 px-1.5 py-0.2 text-[9px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (onNavigateTab) onNavigateTab('learning')
                        }}
                        className="text-xs font-bold text-[#0A66C2] hover:underline text-right block"
                      >
                        Launch Interactive Lab →
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* PILLAR 5: RECOMMENDED RECRUITING & OPEN JOBS */}
              <div className="rounded-xl bg-emerald-50/60 p-4 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-emerald-600" />
                    <span>5. Need Engineers Experienced in This Solution?</span>
                  </h4>
                  <button
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab('jobs')
                    }}
                    className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-300"
                  >
                    View Matching Candidates →
                  </button>
                </div>
                {selectedSolution.recommendedJobs.map((jb, idx) => (
                  <p key={idx} className="text-xs text-zinc-600 dark:text-zinc-400">
                    Active requisition: <strong>{jb.title}</strong> @ {jb.company} ({jb.salary} · {jb.location})
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : selectedMainCategory === 'Sphera' ? (
        /* SPHERA 137 MICRO-APPS GRID */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>Sphera Micro-Apps Directory (137 Specialized Utilities)</span>
            </h3>
            <span className="text-xs text-zinc-400">Included in All Enterprise Subscriptions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {spheraAppsData.map((app) => (
              <div
                key={app.id}
                className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs hover:border-purple-500 hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{app.icon}</span>
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                      {app.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                    {app.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                    {app.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    handleGenerateLicense({ name: app.name }, 'trial')
                  }}
                  className="w-full rounded-lg bg-purple-50 py-1.5 text-center text-xs font-bold text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 transition-colors"
                >
                  Launch App Demo →
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* STANDARD PRODUCTS GRID */
        <div className="space-y-4">
          {/* SEARCH & SORT TOOLBAR */}
          <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 flex items-center rounded-lg bg-zinc-50 px-3 py-2 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800/80">
              <Search className="h-4 w-4 text-zinc-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search software, pentests, zero trust retainers, O'Reilly certifications, APIs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100"
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-500 shrink-0">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <option value="popular">🔥 Most Popular</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="price_low">💰 Price: Low to High</option>
                <option value="price_high">💎 Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-[#0A66C2] hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{product.icon}</span>
                      <div>
                        <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                          {product.name}
                        </h4>
                        <p className="text-xs text-zinc-500">{product.vendor.name}</p>
                      </div>
                    </div>

                    {product.badge && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {product.tagline}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {product.pricing.displayPrice}
                    </span>
                    <span className="text-amber-500 font-bold">
                      ★ {product.rating} ({product.reviewsCount})
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedProduct(product)
                      setActiveProductTab('overview')
                    }}
                    className="text-xs font-bold text-[#0A66C2] hover:underline"
                  >
                    View Details →
                  </button>

                  <button
                    onClick={() => handleGenerateLicense(product, 'trial')}
                    className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-1.5 text-xs font-bold shadow-xs transition-all"
                  >
                    {product.pricing.hasFreeTrial ? "Free Trial" : "Buy Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. INTERCONNECTED PRODUCT FLYWHEEL DIAGRAM */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-zinc-900 via-slate-900 to-indigo-950 p-6 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider font-mono">
              ⚡ ConnectIn Contextual Commercial Engine
            </span>
            <h3 className="text-lg font-black text-white">
              The Connected Product Lifecycle Flywheel
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
            Zero-Ad Natural Conversion
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5 text-center text-[10px] font-mono">
          {[
            { step: '1. CONTENT', desc: 'Pulse News / CVE' },
            { step: '2. PROBLEM', desc: 'Identified Risk' },
            { step: '3. SOLUTION', desc: 'Outcome Package' },
            { step: '4. PRODUCT', desc: 'Enterprise Tool' },
            { step: '5. DEMO', desc: 'Live Sandbox' },
            { step: '6. TRIAL', desc: '14-Day Eval Key' },
            { step: '7. PURCHASE', desc: 'GovCloud SOW' },
            { step: '8. SUPPORT', desc: 'B2B Vendor Desk' },
            { step: '9. REVIEW', desc: 'Peer Validation' }
          ].map((item, idx) => (
            <div key={idx} className="rounded-xl bg-white/10 p-2.5 border border-white/10 space-y-1">
              <span className="font-bold text-amber-300 block">{item.step}</span>
              <span className="text-zinc-300 text-[9px]">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FULL PRODUCT DETAIL MODAL */}
      <Dialog
        open={!!selectedProduct}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null)
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <div className="space-y-5">
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{selectedProduct.icon}</span>
                    <div>
                      <DialogTitle className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                        {selectedProduct.name}
                      </DialogTitle>
                      <p className="text-xs text-zinc-500">
                        {selectedProduct.vendor.name} · {selectedProduct.category}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-emerald-600 block">
                      {selectedProduct.pricing.displayPrice}
                    </span>
                    <span className="text-xs text-amber-500 font-bold">
                      ★ {selectedProduct.rating} ({selectedProduct.reviewsCount} reviews)
                    </span>
                  </div>
                </div>
              </DialogHeader>

              {/* Product Modal Navigation Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto border-b border-zinc-200 pb-2 text-xs dark:border-zinc-800">
                {['overview', 'features', 'architecture', 'pricing', 'reviews', 'support'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveProductTab(tab as any)}
                    className={`rounded-lg px-3 py-1 font-bold capitalize transition-colors ${
                      activeProductTab === tab
                        ? "bg-[#0A66C2] text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Product Tab Content */}
              {activeProductTab === 'overview' && (
                <div className="space-y-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  <p>{selectedProduct.overview}</p>

                  <div className="rounded-xl bg-purple-50 p-3.5 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-purple-900 dark:text-purple-300">
                      Core Differentiators:
                    </h5>
                    <ul className="space-y-1 text-xs">
                      {selectedProduct.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span><strong>{f.title}:</strong> {f.desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeProductTab === 'features' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {selectedProduct.features.map((feat, idx) => (
                    <div key={idx} className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800 space-y-1">
                      <h5 className="font-bold text-zinc-900 dark:text-zinc-100">{feat.title}</h5>
                      <p className="text-zinc-500">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeProductTab === 'architecture' && (
                <div className="rounded-xl bg-zinc-900 text-white p-4 font-mono text-xs space-y-2">
                  <p className="text-emerald-400 font-bold">{selectedProduct.architecture.title}</p>
                  <p className="text-zinc-400">{selectedProduct.architecture.summary}</p>
                  <p className="text-sky-300">Latency: {selectedProduct.architecture.latency} · Isolation: {selectedProduct.architecture.dataPrivacy}</p>
                </div>
              )}

              {activeProductTab === 'pricing' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedProduct.pricingTiers.map((tier, i) => (
                    <div key={i} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 space-y-2 text-xs flex flex-col justify-between">
                      <div>
                        <h5 className="font-bold text-zinc-900 dark:text-zinc-100">{tier.name}</h5>
                        <p className="text-lg font-black text-emerald-600">{tier.price}</p>
                        <p className="text-zinc-500 text-[11px]">{tier.description}</p>
                      </div>
                      <button
                        onClick={() => handleGenerateLicense(selectedProduct, 'trial')}
                        className="w-full rounded-lg bg-[#0A66C2] py-1.5 font-bold text-white text-xs hover:bg-[#004182]"
                      >
                        {tier.ctaText}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeProductTab === 'reviews' && (
                <div className="space-y-3">
                  {selectedProduct.reviews.map((rev, i) => (
                    <div key={i} className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{rev.author} · {rev.role}</span>
                        <span className="text-amber-500 font-bold">★ {rev.rating}</span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-300">{rev.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeProductTab === 'support' && (
                <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950/40 space-y-2 text-xs">
                  <h5 className="font-bold text-blue-950 dark:text-blue-200">ConnectIn Direct B2B Vendor Support</h5>
                  <p className="text-zinc-600 dark:text-zinc-300">
                    Have a technical question about GovCloud support, FedRAMP authorization, or custom API limits? Message the vendor directly.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedProduct(null)
                      if (onNavigateTab) onNavigateTab('messaging')
                    }}
                    className="rounded-lg bg-[#0A66C2] text-white px-4 py-2 font-bold hover:bg-[#004182]"
                  >
                    Open Vendor Desk Chat →
                  </button>
                </div>
              )}

              {/* Modal Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="rounded-full bg-zinc-100 px-4 py-2 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerateLicense(selectedProduct, 'trial')}
                    className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:from-purple-500 hover:to-indigo-500"
                  >
                    Generate 14-Day Staging Key ⚡
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* INSTANT TRIAL / LICENSE MODAL */}
      <Dialog open={isLicenseModalOpen} onOpenChange={setIsLicenseModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-amber-500" />
              <span>Instant License Provisioned!</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs">
            <p className="text-zinc-600 dark:text-zinc-300">
              Your 14-day fully featured evaluation key has been generated and provisioned to your ConnectIn developer workspace.
            </p>

            <div className="rounded-xl bg-zinc-900 p-3 text-emerald-400 font-mono flex items-center justify-between select-all">
              <span className="truncate">{generatedLicenseKey}</span>
              <button
                onClick={handleCopyKey}
                className="ml-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 text-xs shrink-0 flex items-center gap-1"
              >
                {hasCopiedLicense ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{hasCopiedLicense ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="rounded-xl bg-purple-50 p-3 text-[11px] text-purple-900 dark:bg-purple-950/40 dark:text-purple-300">
              ⚡ Firecracker MicroVM sandbox environment ready at: <span className="font-mono underline">https://sandbox.connectin.internal</span>
            </div>

            <button
              onClick={() => setIsLicenseModalOpen(false)}
              className="w-full rounded-full bg-[#0A66C2] py-2 text-xs font-bold text-white hover:bg-[#004182]"
            >
              Done &amp; Return to Marketplace
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* VENDOR LISTING MODAL */}
      <Dialog open={isVendorModalOpen} onOpenChange={setIsVendorModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Publish New Product or Service to Marketplace
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleVendorSubmit} className="space-y-3 text-xs">
            {vendorSuccess ? (
              <div className="rounded-xl bg-emerald-50 p-4 text-center font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                ✓ Product Submitted Successfully for Instant Review!
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="font-bold">Product / Service Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CloudGuard AI Sentinel"
                    value={newVendorTitle}
                    onChange={(e) => setNewVendorTitle(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold">Category:</label>
                  <select
                    value={newVendorCategory}
                    onChange={(e) => setNewVendorCategory(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <option value="Software">Software</option>
                    <option value="Services">Services (Consulting / PenTest)</option>
                    <option value="Training">Training (Masterclass / Labs)</option>
                    <option value="Enterprise">Enterprise Solutions</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold">Pricing:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $499 / mo or $12,000 One-Time"
                    value={newVendorPrice}
                    onChange={(e) => setNewVendorPrice(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold">Description &amp; Key Features:</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe problem solved, compliance standards, and demo sandbox URL..."
                    value={newVendorDesc}
                    onChange={(e) => setNewVendorDesc(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 py-2.5 font-bold text-white shadow-md hover:from-purple-500 hover:to-indigo-500"
                  >
                    Publish to ConnectIn Marketplace 🚀
                  </button>
                </div>
              </>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
