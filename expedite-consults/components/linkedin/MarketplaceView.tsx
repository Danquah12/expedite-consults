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
  Package
} from "lucide-react"
import {
  MarketplaceProduct,
  MARKETPLACE_CATEGORIES_CONFIG,
  MASTER_MARKETPLACE_PRODUCTS
} from "@/lib/marketplace-engine-data"
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
}

export function MarketplaceView({
  currentUser,
  onLaunchCareerSuite
}: MarketplaceViewProps) {
  // Master Category & Subcategory
  const [selectedMainCategory, setSelectedMainCategory] = useState<'Software' | 'Services' | 'Training' | 'Enterprise Solutions' | 'Sphera' | 'All'>('Software')
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price_low' | 'price_high'>('popular')

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

  // Active Main Category Config
  const activeMainCatConfig = MARKETPLACE_CATEGORIES_CONFIG.find(c => c.id === selectedMainCategory)

  // Filter Products
  const filteredProducts = MASTER_MARKETPLACE_PRODUCTS.filter(p => {
    const matchCategory = selectedMainCategory === 'All' || p.category === selectedMainCategory
    const matchSubCategory = selectedSubCategory === 'All' || selectedSubCategory.startsWith('All') || p.subCategory === selectedSubCategory
    const matchSearch = !searchQuery || (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.overview.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return matchCategory && matchSubCategory && matchSearch
  })

  // Handle Instant Free Trial or Buy License Generation
  const handleGenerateLicense = (product: MarketplaceProduct, type: 'trial' | 'commercial' = 'trial') => {
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

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-24">
      {/* 1. TOP MARKETPLACE HERO BANNER */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-purple-500/30 px-3 py-0.5 text-xs font-bold text-purple-200 border border-purple-400/40 flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5 text-amber-300" />
                ConnectIn Commercial Marketplace
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                Software · Services · Training · Enterprise
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Discover, Evaluate & License Enterprise Solutions
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Explore autonomous cybersecurity suites, advisory retainers, verified training masterclasses, and 137 Sphera micro-apps with 1-click sandbox demos and instant trial keys.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setIsVendorModalOpen(true)}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md flex items-center gap-1.5 transition-all border border-purple-400/40"
            >
              <PlusCircle className="h-4 w-4 text-amber-300" />
              <span>➕ Sell Product or Service</span>
            </button>
          </div>
        </div>

        {/* 4 MASTER CATEGORIES SWITCHER */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'Software', label: '💻 Software', count: '8' },
              { id: 'Services', label: '🛠️ Services', count: '6' },
              { id: 'Training', label: '🎓 Training', count: '12' },
              { id: 'Enterprise Solutions', label: '🏢 Enterprise Solutions', count: '5' },
              { id: 'Sphera', label: '🪐 Sphera Micro-Apps', count: '137' },
              { id: 'All', label: '🌐 All Catalog', count: '168' }
            ].map((cat) => {
              const isSelected = selectedMainCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedMainCategory(cat.id as any)
                    setSelectedSubCategory('All')
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                    isSelected
                      ? "bg-white text-zinc-950 shadow-md font-extrabold"
                      : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${isSelected ? "bg-zinc-900 text-white" : "bg-white/20 text-white/90"}`}>
                    {cat.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* DYNAMIC SUBCATEGORIES RIBBON */}
        {activeMainCatConfig && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 shrink-0 mr-1">
              Subcategory:
            </span>
            {activeMainCatConfig.subCategories.map((sub) => {
              const isSelected = selectedSubCategory === sub
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all shrink-0 ${
                    isSelected
                      ? "bg-purple-400 text-zinc-950 font-bold shadow-xs"
                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {sub}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 2. SEARCH & CONTROLS TOOLBAR */}
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

      {/* 3. PRIMARY PRODUCTS & SERVICES GRID (INSPIRED BY USER SCREENSHOTS) */}
      {selectedMainCategory === 'Sphera' ? (
        /* SPHERA 137 MICRO-APPS GRID */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>Sphera Intelligence & Micro-App Catalog (137 Specialized Tools)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {spheraAppsData.map((app) => (
              <div
                key={app.id}
                className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-2xs hover:border-purple-500/50 hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{app.icon}</span>
                    <span className="text-[9px] font-bold rounded-full bg-purple-50 px-2 py-0.5 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {app.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                    {app.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {app.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-600">Included in Suite</span>
                  <a
                    href={`https://portal.expediteconsults.com/apps/${app.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-[#0A66C2] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#004182] flex items-center gap-1"
                  >
                    <span>Launch</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* MASTER PRODUCTS / SERVICES GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="rounded-2xl border border-zinc-200 bg-white shadow-xs hover:border-purple-500 hover:shadow-xl transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Card Top Banner */}
                <div className="p-5 pb-4 bg-gradient-to-br from-zinc-50 via-white to-purple-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-purple-950/20 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-2xl shadow-md text-white shrink-0">
                        {prod.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3
                            onClick={() => {
                              setSelectedProduct(prod)
                              setActiveProductTab('overview')
                            }}
                            className="font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100 hover:text-[#0A66C2] cursor-pointer"
                          >
                            {prod.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-medium">{prod.vendor.name}</p>
                      </div>
                    </div>

                    {prod.badge && (
                      <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 shrink-0">
                        {prod.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-3 leading-relaxed">
                    {prod.tagline}
                  </p>
                </div>

                {/* Card Stats & Capabilities */}
                <div className="p-5 pt-3 space-y-3">
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      <span>{prod.rating}</span>
                      <span className="text-zinc-400 font-normal">({prod.reviewsCount})</span>
                    </div>

                    {prod.activeUsersCount && (
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {prod.activeUsersCount}
                      </span>
                    )}
                  </div>

                  {/* Feature Highlights */}
                  <div className="space-y-1.5 pt-1">
                    {prod.features.slice(0, 2).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{feat.title}</span>
                      </div>
                    ))}
                  </div>

                  {/* Integrations */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {prod.integrations.slice(0, 3).map((integ) => (
                      <span
                        key={integ}
                        className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        {integ}
                      </span>
                    ))}
                    {prod.integrations.length > 3 && (
                      <span className="text-[10px] text-zinc-400 self-center">
                        +{prod.integrations.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Price & Dual CTAs */}
              <div className="p-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between gap-2">
                <div>
                  <span className="text-base font-black text-zinc-900 dark:text-zinc-100">
                    {prod.pricing.displayPrice}
                  </span>
                  <span className="text-[10px] text-zinc-500 ml-1">
                    {prod.pricing.billingPeriod}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedProduct(prod)
                      setActiveProductTab('overview')
                    }}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    Preview
                  </button>

                  <button
                    onClick={() => handleGenerateLicense(prod, prod.pricing.hasFreeTrial ? 'trial' : 'commercial')}
                    className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-xs flex items-center gap-1 transition-all"
                  >
                    <Zap className="h-3 w-3 text-amber-300" />
                    <span>{prod.pricing.hasFreeTrial ? "Free Trial" : "Buy / Book"}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DEDICATED FULL PRODUCT DETAIL MODAL (ALL 12 SECTIONS) */}
      {/* ========================================================================= */}
      <Dialog
        open={!!selectedProduct}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null)
        }}
      >
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl">
          {selectedProduct && (
            <div className="space-y-0">
              {/* Product Modal Header */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-6 text-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-3xl shadow-xl shrink-0">
                      {selectedProduct.icon}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl sm:text-2xl font-black text-white">
                          {selectedProduct.name}
                        </h2>
                        {selectedProduct.badge && (
                          <span className="rounded-full bg-purple-500/30 px-2.5 py-0.5 text-xs font-bold text-purple-200 border border-purple-400/40">
                            {selectedProduct.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-purple-200/90 font-medium">
                        {selectedProduct.tagline}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-purple-300/80 pt-1 flex-wrap">
                        <span>Vendor: <strong>{selectedProduct.vendor.name}</strong></span>
                        <span className="flex items-center gap-1 text-amber-300 font-bold">
                          <Star className="h-3.5 w-3.5 fill-amber-300" />
                          {selectedProduct.rating} ({selectedProduct.reviewsCount} verified reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Primary High-Conversion Actions in Header */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-2xl font-black text-white">
                        {selectedProduct.pricing.displayPrice}
                      </span>
                      <span className="text-xs text-purple-300 ml-1">
                        {selectedProduct.pricing.billingPeriod}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedProduct.pricing.hasFreeTrial && (
                        <button
                          onClick={() => handleGenerateLicense(selectedProduct, 'trial')}
                          className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-bold text-white transition-all flex items-center gap-1 shadow-sm"
                        >
                          <Zap className="h-3.5 w-3.5 text-amber-300" />
                          <span>Free Trial</span>
                        </button>
                      )}

                      {selectedProduct.demoUrl && (
                        <a
                          href={selectedProduct.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-bold text-white transition-all flex items-center gap-1"
                        >
                          <Play className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Demo</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleGenerateLicense(selectedProduct, 'commercial')}
                        className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 px-4 py-2 text-xs font-extrabold text-white shadow-lg flex items-center gap-1"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>Buy Now</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 12-Section Navigation Tab Ribbon */}
                <div className="pt-4 border-t border-white/10 flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                  {[
                    { id: 'overview', label: '📋 Overview' },
                    { id: 'features', label: '⚡ Features' },
                    { id: 'screenshots', label: '🖼️ Screenshots' },
                    { id: 'demo', label: '▶️ Demo' },
                    { id: 'architecture', label: '🏛️ Architecture' },
                    { id: 'integrations', label: '🔌 Integrations' },
                    { id: 'security', label: '🛡️ Security & Compliance' },
                    { id: 'pricing', label: '💰 Pricing & Plans' },
                    { id: 'reviews', label: '⭐ Reviews' },
                    { id: 'docs', label: '📖 Documentation' },
                    { id: 'casestudies', label: '📊 Case Studies' },
                    { id: 'support', label: '💬 Support' }
                  ].map((tab) => {
                    const isSelected = activeProductTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveProductTab(tab.id as any)}
                        className={`rounded-lg px-3 py-1.5 font-bold transition-all shrink-0 whitespace-nowrap ${
                          isSelected
                            ? "bg-white text-zinc-950 shadow-md font-extrabold"
                            : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Product Modal Body (Dynamic Tabs) */}
              <div className="p-6 space-y-5 text-zinc-800 dark:text-zinc-200">
                {/* 1. OVERVIEW */}
                {activeProductTab === 'overview' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Product Overview & Business Value
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {selectedProduct.overview}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {selectedProduct.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-zinc-200 p-4 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 space-y-1"
                        >
                          <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                            <Check className="h-4 w-4 text-emerald-500" />
                            {feat.title}
                          </h4>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            {feat.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. FEATURES */}
                {activeProductTab === 'features' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Enterprise Capabilities & Feature Matrix
                    </h3>
                    <div className="space-y-3">
                      {selectedProduct.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 space-y-1"
                        >
                          <h4 className="font-bold text-sm text-[#0A66C2] flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            {feat.title}
                          </h4>
                          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                            {feat.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. SCREENSHOTS */}
                {activeProductTab === 'screenshots' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Product Visual Gallery & User Interfaces
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedProduct.screenshots.map((shot, idx) => (
                        <div key={idx} className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
                          <img src={shot} alt="" className="w-full h-48 object-cover hover:scale-105 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. DEMO */}
                {activeProductTab === 'demo' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Live Interactive Sandbox Demo
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Launch an isolated live sandbox terminal directly connected to our staging cluster.
                    </p>
                    <div className="rounded-xl border border-zinc-800 bg-black p-5 text-emerald-400 font-mono text-xs space-y-2">
                      <p className="text-zinc-400"># Connected to {selectedProduct.name} Sandbox v2.4.0</p>
                      <p className="text-zinc-400"># Authenticated: Guest Sandbox Session</p>
                      <p className="text-white">$ npx @expedite/sandbox-live --target=demo.expedite.internal</p>
                      <p className="text-emerald-400">✓ Target discovered: 14 Microservices, 3 Choke Points</p>
                      <p className="text-emerald-400">✓ AI-BOM generated: 0 Supply-Chain CVEs</p>
                      <p className="text-amber-400">⚡ Live Terminal Ready. Launch full interactive window below.</p>
                    </div>
                    {selectedProduct.demoUrl && (
                      <a
                        href={selectedProduct.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0A66C2] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#004182]"
                      >
                        <Play className="h-4 w-4 text-emerald-300" />
                        <span>Launch Full Sandbox Window →</span>
                      </a>
                    )}
                  </div>
                )}

                {/* 5. ARCHITECTURE */}
                {activeProductTab === 'architecture' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Architecture & Data Flow Blueprint
                    </h3>
                    <div className="rounded-xl border border-zinc-200 p-4 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
                      <h4 className="font-bold text-sm text-purple-700 dark:text-purple-300">
                        {selectedProduct.architecture.title}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {selectedProduct.architecture.summary}
                      </p>
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-zinc-700 dark:text-zinc-300">Architecture Layers:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedProduct.architecture.layers.map((l, i) => (
                            <span key={i} className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-zinc-800 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200">
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                        <span>Latency: <strong>{selectedProduct.architecture.latency}</strong></span>
                        <span>Privacy: <strong>{selectedProduct.architecture.dataPrivacy}</strong></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. INTEGRATIONS */}
                {activeProductTab === 'integrations' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Supported Native Integrations
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {selectedProduct.integrations.map((integ) => (
                        <div
                          key={integ}
                          className="rounded-xl border border-zinc-200 p-3 bg-white text-center dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-center gap-2 text-xs font-bold"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span>{integ}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. SECURITY & COMPLIANCE */}
                {activeProductTab === 'security' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Security Guarantees, Compliance & Enclave Isolation
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {selectedProduct.security.compliance.map((c) => (
                        <div key={c} className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs font-bold text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl border border-zinc-200 p-4 text-xs dark:border-zinc-800 space-y-2">
                      <p><strong>Encryption:</strong> {selectedProduct.security.encryption}</p>
                      <p><strong>Tenant Isolation:</strong> {selectedProduct.security.isolation}</p>
                    </div>
                  </div>
                )}

                {/* 8. PRICING & TIERS */}
                {activeProductTab === 'pricing' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Transparent Commercial Pricing Tiers
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedProduct.pricingTiers.map((tier, idx) => (
                        <div
                          key={idx}
                          className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 ${
                            tier.recommended
                              ? "border-purple-500 bg-purple-50/20 shadow-md dark:bg-purple-950/20"
                              : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                          }`}
                        >
                          <div className="space-y-2">
                            {tier.recommended && (
                              <span className="rounded-full bg-purple-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                                Most Popular
                              </span>
                            )}
                            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                              {tier.name}
                            </h4>
                            <p className="text-xs text-zinc-500">{tier.description}</p>
                            <div className="pt-2">
                              <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                                {tier.price}
                              </span>
                              <span className="text-xs text-zinc-500 ml-1">{tier.period}</span>
                            </div>

                            <ul className="space-y-1.5 pt-2 text-xs text-zinc-600 dark:text-zinc-300">
                              {tier.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <button
                            onClick={() => handleGenerateLicense(selectedProduct, 'commercial')}
                            className={`w-full rounded-xl py-2 text-xs font-bold transition-all ${
                              tier.recommended
                                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm hover:from-purple-500 hover:to-indigo-500"
                                : "bg-[#0A66C2] text-white hover:bg-[#004182]"
                            }`}
                          >
                            {tier.ctaText}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. REVIEWS */}
                {activeProductTab === 'reviews' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Verified Peer & Customer Reviews
                    </h3>
                    <div className="space-y-3">
                      {selectedProduct.reviews.map((rev, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-zinc-200 p-4 bg-white dark:border-zinc-800 dark:bg-zinc-900 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <img src={rev.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                              <div>
                                <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{rev.author}</h4>
                                <p className="text-[10px] text-zinc-500">{rev.role} @ {rev.company}</p>
                              </div>
                            </div>
                            <span className="text-amber-500 font-bold text-xs">⭐⭐⭐⭐⭐</span>
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
                            "{rev.text}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 10. DOCUMENTATION */}
                {activeProductTab === 'docs' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Developer Quickstart & API Reference
                    </h3>
                    <div className="rounded-xl border border-zinc-800 bg-black p-4 font-mono text-xs text-sky-400 space-y-2">
                      <p className="text-zinc-400"># 1-Line Terminal Quickstart</p>
                      <p className="text-white">{selectedProduct.documentation.quickstart}</p>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="font-bold">Key API Endpoints:</p>
                      {selectedProduct.documentation.apiEndpoints.map((ep, i) => (
                        <p key={i} className="font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                          {ep}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* 11. CASE STUDIES */}
                {activeProductTab === 'casestudies' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Enterprise Case Studies & Proven ROI
                    </h3>
                    {selectedProduct.caseStudies.map((cs, idx) => (
                      <div key={idx} className="rounded-xl border border-zinc-200 p-5 bg-gradient-to-r from-zinc-50 to-purple-50/40 dark:border-zinc-800 dark:from-zinc-900 dark:to-purple-950/20 space-y-3">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {cs.customer}: {cs.headline}
                        </h4>
                        <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                          {cs.results.map((res, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              <span>{res}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* 12. SUPPORT */}
                {activeProductTab === 'support' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Enterprise SLA & Dedicated Support Channels
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-xl border border-zinc-200 p-4 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 text-center space-y-1">
                        <p className="text-xs text-zinc-400">SLA Uptime</p>
                        <p className="text-sm font-black text-emerald-600">{selectedProduct.support.sla}</p>
                      </div>
                      <div className="rounded-xl border border-zinc-200 p-4 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 text-center space-y-1">
                        <p className="text-xs text-zinc-400">Channel</p>
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{selectedProduct.support.channel}</p>
                      </div>
                      <div className="rounded-xl border border-zinc-200 p-4 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 text-center space-y-1">
                        <p className="text-xs text-zinc-400">Incident Response</p>
                        <p className="text-sm font-black text-purple-600">{selectedProduct.support.responseHours}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* INSTANT LICENSE / TRIAL GENERATOR MODAL */}
      <Dialog open={isLicenseModalOpen} onOpenChange={setIsLicenseModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <span>Instant License Key Activated</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            <p className="text-zinc-600 dark:text-zinc-400">
              Your instant enterprise license has been registered to Alex Taylor (alex.taylor@expediteconsults.com).
            </p>

            <div className="rounded-xl border border-purple-500/40 bg-purple-950/30 p-4 space-y-2">
              <span className="text-[10px] font-mono uppercase text-purple-300">Generated Activation Key:</span>
              <div className="flex items-center justify-between gap-2 font-mono text-sm font-black text-white bg-black/60 p-2.5 rounded-lg border border-white/10">
                <span className="truncate">{generatedLicenseKey}</span>
                <button
                  onClick={handleCopyKey}
                  className="rounded-md bg-purple-600 hover:bg-purple-500 p-1.5 text-white transition-colors shrink-0"
                  title="Copy Key"
                >
                  {hasCopiedLicense ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-zinc-100 p-3 text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 space-y-1">
              <p>✓ 14-Day Full Unrestricted Access to all API endpoints and clusters.</p>
              <p>✓ Zero credit card required for trial evaluation.</p>
            </div>

            <button
              onClick={() => setIsLicenseModalOpen(false)}
              className="w-full rounded-xl bg-[#0A66C2] py-2.5 font-bold text-white hover:bg-[#004182]"
            >
              Done & Start Using
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* VENDOR SELF-LISTING MODAL */}
      <Dialog open={isVendorModalOpen} onOpenChange={setIsVendorModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Store className="h-5 w-5 text-purple-600" />
              <span>List Your Product or Service</span>
            </DialogTitle>
          </DialogHeader>

          {vendorSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Listing Submitted for Verification!
              </h4>
              <p className="text-xs text-zinc-500">
                Your listing will appear in ConnectIn Marketplace following automated security and identity review.
              </p>
            </div>
          ) : (
            <form onSubmit={handleVendorSubmit} className="space-y-4 pt-2 text-xs">
              <div className="space-y-1">
                <label className="font-bold">Offering Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js 16 Performance & Security Audit"
                  value={newVendorTitle}
                  onChange={(e) => setNewVendorTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold">Category</label>
                  <select
                    value={newVendorCategory}
                    onChange={(e) => setNewVendorCategory(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                  >
                    <option>Software</option>
                    <option>Services</option>
                    <option>Training</option>
                    <option>Enterprise Solutions</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Pricing</label>
                  <input
                    type="text"
                    required
                    value={newVendorPrice}
                    onChange={(e) => setNewVendorPrice(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold">Description & Key Deliverables</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail your capabilities, SLA, and architecture reviews provided..."
                  value={newVendorDesc}
                  onChange={(e) => setNewVendorDesc(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="rounded-full px-4 py-1.5 font-bold text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#0A66C2] px-5 py-2 font-bold text-white hover:bg-[#004182]"
                >
                  Publish to Marketplace
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
