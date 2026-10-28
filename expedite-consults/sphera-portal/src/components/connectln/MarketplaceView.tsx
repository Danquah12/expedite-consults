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
import { UserProfile } from "@/lib/connectln-data"
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
  // Master Category & Subcategory: Discover | Launchpad | Solutions | Software | Services | Cybersecurity | AI | Cloud | Training | Enterprise | Deals | Sphera
  const [selectedMainCategory, setSelectedMainCategory] = useState<
    'Discover' | 'Launchpad' | 'Solutions' | 'Software' | 'Services' | 'Cybersecurity' | 'AI' | 'Cloud' | 'Training' | 'Enterprise' | 'Deals' | 'Sphera' | 'All'
  >('Discover')
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price_low' | 'price_high'>('popular')
  const [showAllEcosystem, setShowAllEcosystem] = useState<boolean>(false)

  // Solutions Layer State
  const [solutions] = useState<SolutionPackage[]>(ENTERPRISE_SOLUTIONS_DATA)
  const [selectedSolution, setSelectedSolution] = useState<SolutionPackage | null>(ENTERPRISE_SOLUTIONS_DATA[0])
  const [showFlagshipInSolutions, setShowFlagshipInSolutions] = useState<boolean>(false)
  const [solutionActionModal, setSolutionActionModal] = useState<{
    type: 'sow' | 'expert'
    title: string
    provider: string
    price: string
    detail: string
  } | null>(null)
  const [solutionActionSuccess, setSolutionActionSuccess] = useState<boolean>(false)
  const [solutionActionNotes, setSolutionActionNotes] = useState<string>("")

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

  const userEnclave = currentUser?.professionEnclave || 'trades_construction'

  const activateSolutionsHub = (solutionId?: string) => {
    setSelectedMainCategory('Solutions')
    setShowFlagshipInSolutions(false)
    if (solutionId) {
      const matched = solutions.find(s => s.id === solutionId)
      if (matched) setSelectedSolution(matched)
    } else if (!selectedSolution) {
      setSelectedSolution(solutions[0])
    }
    setTimeout(() => {
      const el = document.getElementById('solutions-blueprint-hub')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 60)
  }

  // Filter Products strictly based on user enclave and category selection
  const filteredProducts = MASTER_MARKETPLACE_PRODUCTS.filter(p => {
    // 0. If user is in Launchpad mode, show all deployed Launchpad apps directly!
    if (selectedMainCategory === 'Launchpad') {
      if (!p.isLaunchpadDeployed) return false
      if (selectedSubCategory !== 'All' && !selectedSubCategory.startsWith('All')) {
        const catMatch =
          p.launchpadCategory === selectedSubCategory ||
          p.subCategory.toLowerCase().includes(selectedSubCategory.toLowerCase()) ||
          p.category.toLowerCase().includes(selectedSubCategory.toLowerCase())
        if (!catMatch) return false
      }
      const matchSearch = !searchQuery || (
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.overview.toLowerCase().includes(searchQuery.toLowerCase())
      )
      return matchSearch
    }

    // 1. Strict Enclave Least-Privilege Isolation
    // Only apply enclave restriction when in 'Discover' without search query and when showAllEcosystem is false
    const isGlobalCategory = ['Cybersecurity', 'Launchpad', 'Software', 'AI', 'Cloud', 'Training', 'Enterprise', 'Solutions', 'Sphera', 'Deals'].includes(selectedMainCategory)
    const isFeaturedGlobalApp =
      p.id === 'prod_expedite_ecosystem_launchpad' ||
      p.id === 'prod_aagiis_federal_rmf' ||
      p.id === 'prod_expedite_strike_dast_engine' ||
      p.id === 'prod_expedite_strike_dast_landing' ||
      p.id === 'prod_dstrike_main_app' ||
      p.id === 'prod_dstrike_noctis_platform' ||
      p.id === 'prod_desknote_lime_live' ||
      p.id === 'prod_expedite_consults_official_portal' ||
      p.id === 'prod_sphera_production_launchpad' ||
      p.id === 'prod_pdfadore_suite'

    if (!showAllEcosystem && !searchQuery.trim() && !isGlobalCategory && !isFeaturedGlobalApp && selectedSubCategory === 'All') {
      if (userEnclave === 'trades_construction') {
        if (p.professionEnclave && p.professionEnclave !== 'trades_construction') return false
        if (!p.professionEnclave && !['Tools & Joinery', 'CAD & Measurement', 'Lumber & Materials', 'Hardware', 'Trades & Vocational Network', 'Productivity & Field Notes', 'Trade Machinery & Commerce', 'Video Masterclasses & Tutorials'].includes(p.subCategory)) return false
      } else if (userEnclave === 'healthcare_medicine') {
        if (p.professionEnclave && p.professionEnclave !== 'healthcare_medicine') return false
        if (!p.professionEnclave && !['Diagnostic Devices', 'Trauma & Resuscitation', 'Surgical Implants', 'Clinical Gear'].includes(p.subCategory)) return false
      } else if (userEnclave === 'automotive_mechanics') {
        if (p.professionEnclave && p.professionEnclave !== 'automotive_mechanics') return false
        if (!p.professionEnclave && !['Scan Tools', 'Oscilloscopes', 'EV Safety Gear', 'OEM Repair Data', 'Productivity & Field Notes'].includes(p.subCategory)) return false
      } else if (userEnclave === 'tech_software') {
        if (p.professionEnclave && p.professionEnclave !== 'tech_software') return false
      } else if (userEnclave === 'law_gov_defense') {
        if (p.professionEnclave && p.professionEnclave !== 'law_gov_defense') return false
      } else if (userEnclave === 'finance_accounting') {
        if (p.professionEnclave && p.professionEnclave !== 'finance_accounting') return false
      } else {
        // Tech & Cyber (tech_cybersecurity or default)
        if (p.professionEnclave && p.professionEnclave !== 'tech_cybersecurity') return false
      }
    }

    let matchCategory = true
    if (selectedMainCategory === 'Software') matchCategory = p.category === 'Software' || p.subCategory.toLowerCase().includes('software')
    else if (selectedMainCategory === 'Services') matchCategory = p.category === 'Services'
    else if (selectedMainCategory === 'Training') matchCategory = p.category === 'Training'
    else if (selectedMainCategory === 'Enterprise') matchCategory = p.category === 'Enterprise Solutions'
    else if (selectedMainCategory === 'Cybersecurity') {
      matchCategory = p.subCategory.toLowerCase().includes('cyber') ||
                      p.subCategory.toLowerCase().includes('dast') ||
                      p.subCategory.toLowerCase().includes('rmf') ||
                      p.subCategory.toLowerCase().includes('security') ||
                      p.overview.toLowerCase().includes('security') ||
                      p.name.toLowerCase().includes('strike') ||
                      p.name.toLowerCase().includes('aagiis') ||
                      p.name.toLowerCase().includes('aegis') ||
                      p.name.toLowerCase().includes('sast') ||
                      p.name.toLowerCase().includes('axiom') ||
                      p.launchpadCategory === 'security' ||
                      p.launchpadCategory === 'orchestration'
    }
    else if (selectedMainCategory === 'AI') {
      matchCategory = p.subCategory.toLowerCase().includes('ai') ||
                      p.subCategory.toLowerCase().includes('prediction') ||
                      p.overview.toLowerCase().includes('ai') ||
                      p.name.toLowerCase().includes('noctis') ||
                      p.launchpadCategory === 'ai'
    }
    else if (selectedMainCategory === 'Cloud') matchCategory = p.subCategory.toLowerCase().includes('cloud') || p.overview.toLowerCase().includes('cloud')
    else if (selectedMainCategory === 'Deals') matchCategory = p.pricing.hasFreeTrial || p.badge?.includes('Featured') || false

    let matchSubCategory = true
    if (selectedSubCategory === 'All' || selectedSubCategory.startsWith('All')) {
      matchSubCategory = true
    } else if (selectedSubCategory === 'Compliance_RMF') {
      matchSubCategory =
        p.id === 'prod_aagiis_federal_rmf' ||
        p.id === 'prod_aegis_rmf' ||
        p.subCategory.toLowerCase().includes('compliance') ||
        p.subCategory.toLowerCase().includes('rmf') ||
        p.subCategory.toLowerCase().includes('cato')
    } else if (selectedSubCategory === 'DAST_Offensive') {
      matchSubCategory =
        p.id === 'prod_expedite_strike_dast_engine' ||
        p.id === 'prod_expedite_strike_dast_landing' ||
        p.id === 'prod_11_dast' ||
        p.id === 'prod_05_sast' ||
        p.subCategory.toLowerCase().includes('dast') ||
        p.subCategory.toLowerCase().includes('web interface') ||
        p.name.toLowerCase().includes('dast')
    } else if (selectedSubCategory === 'Cyber_Prediction') {
      matchSubCategory =
        p.id === 'prod_dstrike_main_app' ||
        p.id === 'prod_dstrike_noctis_platform' ||
        p.id === 'prod_axiom' ||
        p.name.toLowerCase().includes('dstrike') ||
        p.name.toLowerCase().includes('noctis') ||
        p.subCategory.toLowerCase().includes('prediction')
    } else if (selectedSubCategory === 'Productivity_Notes') {
      matchSubCategory =
        p.id === 'prod_desknote_lime_live' ||
        p.id === 'prod_desknote' ||
        p.id === 'prod_pdfadore_suite' ||
        p.subCategory.toLowerCase().includes('productivity') ||
        p.subCategory.toLowerCase().includes('field notes')
    } else if (selectedSubCategory === 'Portals_Launchpads') {
      matchSubCategory =
        p.id === 'prod_expedite_consults_official_portal' ||
        p.id === 'prod_sphera_production_launchpad' ||
        p.id === 'prod_expedite_ecosystem_launchpad' ||
        p.id === 'prod_aegis_mission_control' ||
        p.launchpadCategory === 'orchestration'
    } else {
      matchSubCategory = p.subCategory === selectedSubCategory
    }

    const matchSearch = !searchQuery || (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subCategory.toLowerCase().includes(searchQuery.toLowerCase())
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

  const marketplaceTabs = (() => {
    const launchpadTab = { id: 'Launchpad', label: '🚀 Launchpad Fleet (24+ Deployed)', isLaunchpad: true }
    const solutionsTab = { id: 'Solutions', label: '⚡ Solutions Hub (Outcome Blueprints)', isSolutions: true }

    if (userEnclave === 'trades_construction') {
      return [
        launchpadTab,
        solutionsTab,
        { id: 'Cybersecurity', label: '🛡️ Cybersecurity & DevSecOps' },
        { id: 'Discover', label: '✨ All Trade Tools & Lumber' },
        { id: 'Software', label: '🧰 Power Tools & Joinery' },
        { id: 'Services', label: '📐 CAD & Total Station Measure' },
        { id: 'Enterprise', label: '🪵 Lumber & Materials Stock' },
        { id: 'Deals', label: '🏷️ Subcontractor Deals' },
      ]
    }
    if (userEnclave === 'healthcare_medicine') {
      return [
        launchpadTab,
        solutionsTab,
        { id: 'Discover', label: '✨ All Clinical, Pharmacy & Hospital' },
        { id: 'Enterprise', label: '💊 Pharmacy, Formulary & Hospital EHR' },
        { id: 'Software', label: '🩺 Physicians, Nursing & MDCalc' },
        { id: 'Services', label: '🔪 Surgical, Medical Aides & Implants' },
        { id: 'Cybersecurity', label: '🛡️ HIPAA & Clinical Security' },
        { id: 'Deals', label: '🏷️ Hospital RFP Deals' },
      ]
    }
    if (userEnclave === 'automotive_mechanics') {
      return [
        launchpadTab,
        solutionsTab,
        { id: 'Cybersecurity', label: '🛡️ Cybersecurity & CAN Bus' },
        { id: 'Discover', label: '✨ All Diagnostic Gear' },
        { id: 'Software', label: '🧰 Snap-on & Scan Tools' },
        { id: 'Services', label: '⚡ PicoScope Oscilloscopes' },
        { id: 'Enterprise', label: '🔋 EV Safety & NFPA 70E' },
        { id: 'Deals', label: '🏷️ Shop Equipment Deals' },
      ]
    }
    return [
      launchpadTab,
      solutionsTab,
      { id: 'Discover', label: '✨ Discover' },
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
  })()

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-24">
      {/* 1. TOP MARKETPLACE BANNER & FLAGSHIP CARDS GRID */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 text-zinc-900 dark:text-zinc-100 shadow-xs space-y-5">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-blue-50 dark:bg-blue-950/50 px-3 py-0.5 text-xs font-semibold text-[#0A66C2] dark:text-sky-300 border border-blue-200/60 dark:border-blue-800/60 flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5" />
                ConnectIn Solutions &amp; Tools Marketplace
              </span>
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                Verified Tools, Products &amp; Services
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {userEnclave === 'trades_construction'
                ? "Skilled Trades Tools, CAD Equipment & Enterprise Platforms"
                : userEnclave === 'healthcare_medicine'
                ? "Clinical Diagnostic Devices, Surgical Sets & Solutions"
                : userEnclave === 'automotive_mechanics'
                ? "Diagnostic Scan Tools, Lab Scopes & Shop Equipment"
                : "Discover Tools, Products & Enterprise Solutions"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              {userEnclave === 'trades_construction'
                ? "Procure verified trade tools, CAD equipment, lumber indices, joinery jigs, and enterprise security & productivity suites."
                : userEnclave === 'healthcare_medicine'
                ? "Procure clinical ultrasound devices, rapid infusion systems, orthopedic hardware, and verified medical supplies."
                : userEnclave === 'automotive_mechanics'
                ? "Equip your shop with verified diagnostic stations, multi-channel oscilloscopes, EV lineman safety gear, and OEM repair data."
                : "Find vetted software tools, consulting services, developer kits, and turnkey business solutions from verified industry providers."}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedMainCategory('Launchpad')
                setSelectedSubCategory('All')
              }}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                selectedMainCategory === 'Launchpad'
                  ? "bg-purple-600 text-white ring-2 ring-purple-400/50 shadow-md"
                  : "bg-[#0A66C2] hover:bg-[#004182] text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Launchpad Fleet Catalog</span>
            </button>

            <button
              type="button"
              onClick={() => activateSolutionsHub()}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                selectedMainCategory === 'Solutions'
                  ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 border border-amber-400 shadow-md ring-2 ring-amber-400/50"
                  : "bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-2xs"
              }`}
            >
              <Zap className={`h-3.5 w-3.5 ${selectedMainCategory === 'Solutions' ? 'text-zinc-950 fill-zinc-950' : 'text-amber-500 fill-amber-500'}`} />
              <span>{selectedMainCategory === 'Solutions' ? 'Solutions Hub (Active)' : 'Solutions Hub'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsVendorModalOpen(true)}
              className="rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>List Product / Service</span>
            </button>
          </div>
        </div>

        {/* FEATURED PLATFORMS IN CARDS (Automatically collapses when Solutions Hub is active so Solutions Blueprints appear immediately above the fold!) */}
        <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-md bg-[#0A66C2]/10 text-[#0A66C2] dark:text-sky-400 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                📂 Categorized Flagship Platforms (8 Live Cards)
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Every platform organized into dedicated cards with direct launch buttons
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedMainCategory === 'Solutions' && (
                <button
                  type="button"
                  onClick={() => setShowFlagshipInSolutions(!showFlagshipInSolutions)}
                  className="rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 text-xs font-bold cursor-pointer transition-colors"
                >
                  {showFlagshipInSolutions ? '▲ Hide 8 Flagship Cards' : '▼ Show 8 Flagship Cards'}
                </button>
              )}
              {selectedSubCategory !== 'All' && (
                <button
                  type="button"
                  onClick={() => setSelectedSubCategory('All')}
                  className="text-xs font-bold text-[#0A66C2] hover:underline cursor-pointer"
                >
                  Show All Categories ✕
                </button>
              )}
            </div>
          </div>

          {(selectedMainCategory !== 'Solutions' || showFlagshipInSolutions) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Aagiis — Federal Compliance & DoD RMF */}
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-md transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-md bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    1. Federal Compliance &amp; RMF
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    DoDI 8510.01
                  </span>
                </div>
                <div className="flex items-start gap-2 pt-0.5">
                  <span className="text-xl shrink-0">🛡️</span>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                      Aagiis — Federal Compliance Solutions
                    </h3>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-0.5">
                      DoD RMF &amp; DCSA NISP Platform (DoDI 8510.01), Continuous ATO (cATO), eMASS &amp; NIST 800-53 Rev 5.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/50 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubCategory('Compliance_RMF')}
                  className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 hover:underline cursor-pointer"
                >
                  Filter Category
                </button>
                <a
                  href="https://aagiis.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>Launch aagiis.com ↗</span>
                </a>
              </div>
            </div>

            {/* Card 2: EXPEDITE STRIKE™ — DAST Engine (/engine) */}
            <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 p-3.5 flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-md transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-md bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    2. DAST &amp; Vulnerability Engine
                  </span>
                  <span className="text-[10px] font-mono font-bold text-red-700 dark:text-red-300">
                    XTRIKE · /engine
                  </span>
                </div>
                <div className="flex items-start gap-2 pt-0.5">
                  <span className="text-xl shrink-0">🎯</span>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                      EXPEDITE STRIKE™ — DAST Engine Dashboard
                    </h3>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-0.5">
                      XTRIKE &amp; Aegis.SOC live DAST Engine &amp; Vulnerability Scanner Dashboard for web &amp; API targets.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-red-200/60 dark:border-red-800/50 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubCategory('DAST_Offensive')}
                  className="text-[11px] font-semibold text-red-800 dark:text-red-300 hover:underline cursor-pointer"
                >
                  Filter Category
                </button>
                <a
                  href="https://11-dast-security-platform.vercel.app/engine"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>Open DAST /engine ↗</span>
                </a>
              </div>
            </div>

            {/* Card 3: EXPEDITE STRIKE™ — Main Platform Landing Page */}
            <div className="rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/40 dark:bg-orange-950/20 p-3.5 flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-md transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-md bg-orange-600 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    2. Web Interface Security
                  </span>
                  <span className="text-[10px] font-mono font-bold text-orange-700 dark:text-orange-300">
                    OWASP Top 10
                  </span>
                </div>
                <div className="flex items-start gap-2 pt-0.5">
                  <span className="text-xl shrink-0">🌐</span>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                      EXPEDITE STRIKE™ — Main Platform Landing
                    </h3>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-0.5">
                      Main DAST &amp; Web Interface Security Platform command portal, architecture specs &amp; compliance matrix.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-orange-200/60 dark:border-orange-800/50 flex items-center justify-between gap-2">
                <a
                  href="https://11-dast-security-platform.vercel.app/engine"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-orange-800 dark:text-orange-300 hover:underline"
                >
                  Engine ↗
                </a>
                <a
                  href="https://11-dast-security-platform.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>Main Landing Page ↗</span>
                </a>
              </div>
            </div>

            {/* Card 4: DSTRIKE — Main App */}
            <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-3.5 flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-md transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-md bg-indigo-700 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    3. Autonomous Cyber Defense
                  </span>
                  <span className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300">
                    dstrike.app
                  </span>
                </div>
                <div className="flex items-start gap-2 pt-0.5">
                  <span className="text-xl shrink-0">⚡</span>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                      DSTRIKE — Main App
                    </h3>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-0.5">
                      Autonomous cyber defense, attack surface management, and continuous threat telemetry platform.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-800/50 flex items-center justify-between gap-2">
                <a
                  href="https://dstrike.app/noctis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-indigo-800 dark:text-indigo-300 hover:underline"
                >
                  Noctis Desk ↗
                </a>
                <a
                  href="https://dstrike.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-1.5 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>Launch dstrike.app ↗</span>
                </a>
              </div>
            </div>

            {/* Card 5: DSTRIKE Prediction Desk (Noctis) */}
            <div className="rounded-xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/40 dark:bg-violet-950/20 p-3.5 flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-md transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-md bg-violet-700 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    3. Threat Prediction Desk
                  </span>
                  <span className="text-[10px] font-mono font-bold text-violet-700 dark:text-violet-300">
                    /noctis
                  </span>
                </div>
                <div className="flex items-start gap-2 pt-0.5">
                  <span className="text-xl shrink-0">🔮</span>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                      DSTRIKE Prediction Desk (Noctis)
                    </h3>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-0.5">
                      Probabilistic cyber threat forecasting, zero-day exploit probability curves &amp; geopolitical risk modeling.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-violet-200/60 dark:border-violet-800/50 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubCategory('Cyber_Prediction')}
                  className="text-[11px] font-semibold text-violet-800 dark:text-violet-300 hover:underline cursor-pointer"
                >
                  Filter Category
                </button>
                <a
                  href="https://dstrike.app/noctis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-violet-700 hover:bg-violet-800 text-white px-3 py-1.5 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>Open /noctis ↗</span>
                </a>
              </div>
            </div>

            {/* Card 6: DeskNote — Productivity & Field Notes */}
            <div className="rounded-xl border border-lime-300 dark:border-lime-900/60 bg-lime-50/40 dark:bg-lime-950/20 p-3.5 flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-md transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-md bg-lime-700 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    4. Productivity &amp; Field Notes
                  </span>
                  <span className="text-[10px] font-mono font-bold text-lime-800 dark:text-lime-300">
                    E2EE Notebook
                  </span>
                </div>
                <div className="flex items-start gap-2 pt-0.5">
                  <span className="text-xl shrink-0">📓</span>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                      DeskNote — Productivity Workspace
                    </h3>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-0.5">
                      Tactile multi-subject digital notebook with voice notes, sketch canvas, punch-lists &amp; AES-256 encryption.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-lime-200/60 dark:border-lime-800/50 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubCategory('Productivity_Notes')}
                  className="text-[11px] font-semibold text-lime-800 dark:text-lime-300 hover:underline cursor-pointer"
                >
                  Filter Category
                </button>
                <a
                  href="https://desk-note-lime.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-lime-700 hover:bg-lime-800 text-white px-3 py-1.5 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>Launch DeskNote ↗</span>
                </a>
              </div>
            </div>

            {/* Card 7: Expedite Consults — Official Enterprise Portal */}
            <div className="rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20 p-3.5 flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-md transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-md bg-[#0A66C2] text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    5. Enterprise Advisory Portal
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#0A66C2] dark:text-sky-300">
                    Official HQ
                  </span>
                </div>
                <div className="flex items-start gap-2 pt-0.5">
                  <span className="text-xl shrink-0">🏛️</span>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                      Expedite Consults — Official Portal
                    </h3>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-0.5">
                      Enterprise Cyber, AI &amp; Federal Advisory headquarters for DevSecOps, Zero Trust &amp; executive retainers.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-sky-200/60 dark:border-sky-800/50 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubCategory('Portals_Launchpads')}
                  className="text-[11px] font-semibold text-[#0A66C2] dark:text-sky-300 hover:underline cursor-pointer"
                >
                  Filter Category
                </button>
                <a
                  href="https://www.expediteconsults.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white px-3 py-1.5 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>expediteconsults.com ↗</span>
                </a>
              </div>
            </div>

            {/* Card 8: Sphera Portal — Live Production Launchpad */}
            <div className="rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 p-3.5 flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-md transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-md bg-purple-700 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    5. Production Launchpad
                  </span>
                  <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300">
                    Cloud OS
                  </span>
                </div>
                <div className="flex items-start gap-2 pt-0.5">
                  <span className="text-xl shrink-0">🚀</span>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                      Sphera Portal — Production Launchpad
                    </h3>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-0.5">
                      Live multi-enclave Cloud OS hosting ConnectLn, Career Passport, Bazaar Marketplace &amp; Campus Hubs.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/50 flex items-center justify-between gap-2">
                <a
                  href="https://www.pdfadore.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-purple-800 dark:text-purple-300 hover:underline"
                >
                  PDFAdore ↗
                </a>
                <a
                  href="https://sphera-portal.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-purple-700 hover:bg-purple-800 text-white px-3 py-1.5 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>sphera-portal ↗</span>
                </a>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Master Category Tabs (Wrapped cleanly into cards/pills so none are hidden off-screen) */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {marketplaceTabs.map((cat: any) => {
              const isSelected = selectedMainCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    if (cat.id === 'Solutions') {
                      activateSolutionsHub()
                    } else {
                      setSelectedMainCategory(cat.id as any)
                      setSelectedSubCategory('All')
                    }
                  }}
                  className={`rounded-xl px-3.5 py-2 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? cat.id === 'Solutions'
                        ? "bg-amber-500 text-zinc-950 font-bold shadow-sm ring-2 ring-amber-400/50"
                        : "bg-[#0A66C2] text-white font-semibold shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70"
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>

          {/* QUICK SOLUTIONS ACTION BAR (High-contrast & wrapped so nothing is hidden) */}
          <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 shrink-0 mr-1 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Outcome Blueprints:
            </span>
            {[
              { label: '🔐 Secure my AWS cloud', id: 'sol_secure_aws' },
              { label: '📋 Achieve FedRAMP & cATO', id: 'sol_fedramp_cato' },
              { label: '🛡️ Autonomous PenTest & ASPM', id: 'sol_pentest_aspm' },
              { label: '🤖 Deploy AI Securely (MCP)', id: 'sol_ai_security' },
              { label: '🏗️ Jobsite CAD & Total Station', id: 'sol_trades_cad_jobsite' },
              { label: '🏥 Clinical Pharmacy, Nursing & Admin', id: 'sol_clinical_pharmacy_health' }
            ].map((sol) => {
              const isPillActive = selectedMainCategory === 'Solutions' && selectedSolution?.id === sol.id
              return (
                <button
                  key={sol.id}
                  type="button"
                  onClick={() => activateSolutionsHub(sol.id)}
                  className={`rounded-lg text-xs px-3 py-1.5 font-semibold transition-all border cursor-pointer ${
                    isPillActive
                      ? "bg-amber-500 text-zinc-950 border-amber-500 font-bold shadow-xs ring-2 ring-amber-400/40"
                      : "bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border-amber-200/80 dark:border-amber-800/60"
                  }`}
                >
                  {sol.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SOLUTIONS LAYER: SOLVING BUSINESS OUTCOMES */}
      {/* ========================================================================= */}
      {selectedMainCategory === 'Solutions' ? (
        <div id="solutions-blueprint-hub" className="space-y-6">
          {/* Solutions Problem Selector Ribbon */}
          <div className="rounded-2xl border-2 border-amber-500/60 bg-white p-5 shadow-md dark:border-amber-500/40 dark:bg-zinc-900 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  🎯 ConnectIn Enterprise &amp; Clinical Solutions Blueprint Hub
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
                  Select Your Business or Clinical Objective
                </h2>
                <p className="text-xs text-zinc-500 max-w-2xl">
                  Instead of searching fragmented tool lists, choose your outcome to get an interconnected blueprint: Live Platforms + Consulting Retainers + Verified Experts + Accredited Training Labs + Open Requisitions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMainCategory('Discover')}
                className="rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-3.5 py-2 text-xs font-bold shrink-0 cursor-pointer transition-colors self-start"
              >
                ← Back to All Marketplace Tools
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                      <span className="font-bold text-amber-700 dark:text-amber-300">
                        {isSelected ? '✓ Active Blueprint' : 'View Blueprint →'}
                      </span>
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
                  <span>1. Recommended Enterprise &amp; Clinical Platforms (Instant Live Launch &amp; Trials)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedSolution.recommendedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
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

                      <div className="flex items-center gap-2 shrink-0">
                        {prod.liveUrl && (
                          <a
                            href={prod.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 shadow-xs flex items-center gap-1"
                          >
                            <span>Launch Live ↗</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleGenerateLicense(prod, 'trial')}
                          className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 shadow-xs shrink-0 cursor-pointer"
                        >
                          {prod.actionText}
                        </button>
                      </div>
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
                          type="button"
                          onClick={() => {
                            setSolutionActionSuccess(false)
                            setSolutionActionNotes("")
                            setSolutionActionModal({
                              type: 'sow',
                              title: srv.name,
                              provider: srv.provider,
                              price: `${srv.price} (${srv.deliveryTimeline})`,
                              detail: srv.scope
                            })
                          }}
                          className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold px-3 py-1.5 shadow-xs cursor-pointer"
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
                          type="button"
                          onClick={() => {
                            setSolutionActionSuccess(false)
                            setSolutionActionNotes("")
                            setSolutionActionModal({
                              type: 'expert',
                              title: `1-on-1 Advisory Session with ${exp.name}`,
                              provider: exp.role,
                              price: exp.hourlyRate,
                              detail: `Verified ${exp.badge} (${exp.rating}★ across ${exp.reviewsCount} engagements)`
                            })
                          }}
                          className="mt-1 rounded-md bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 text-[11px] font-bold text-[#0A66C2] dark:text-sky-300 hover:bg-blue-100 cursor-pointer"
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
                        type="button"
                        onClick={() => {
                          if (onNavigateTab) onNavigateTab('learning')
                        }}
                        className="text-xs font-bold text-[#0A66C2] hover:underline text-right block cursor-pointer"
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
                    <span>5. Need Verified Specialists Experienced in This Solution?</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab('jobs')
                    }}
                    className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-300 cursor-pointer"
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
                    {app.tagline}
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
        /* STANDARD & LAUNCHPAD PRODUCTS GRID */
        <div className="space-y-4">
          {/* DEDICATED LAUNCHPAD FLEET SHOWCASE SHELF */}
          {selectedMainCategory === 'Launchpad' && (
            <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/60 p-5 shadow-lg space-y-3 dark:border-purple-800/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-xl shadow-inner">
                    🚀
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white flex items-center gap-2">
                      <span>Launchpad Deployed Fleet (24+ Commercial Cards)</span>
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
                        Production Ready
                      </span>
                    </h3>
                    <p className="text-xs text-purple-200/80">
                      Federated directly from Launchpad: Local Ports (9000, 9012, 9011, 9020), Vercel Live Cloud suites, autonomous ASPM, and trade field utilities.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-purple-300 shrink-0 flex-wrap">
                  <a
                    href="https://expedite-consults.vercel.app/launchpad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-zinc-950 font-sans font-black text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>🚀 Open Master Launchpad (67+ Platforms) ↗</span>
                  </a>
                  <a
                    href="https://www.pdfadore.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-sans font-black text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>📄 Open PDFAdore (31+ PDF Tools) ↗</span>
                  </a>
                  <span className="rounded-lg bg-white/10 px-3 py-1.5 border border-white/15">
                    {filteredProducts.length} Platforms Live
                  </span>
                </div>
              </div>

              {/* Sub-Category Filter Pills */}
              <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 flex-wrap text-xs">
                {[
                  { id: 'All', label: '🚀 All Fleet (26+)' },
                  { id: 'security', label: '🛡️ Cyber & PenTest' },
                  { id: 'ai', label: '🤖 AI & Media Intelligence' },
                  { id: 'marketplace', label: '🛍️ Escrow Commerce & Eats' },
                  { id: 'career', label: '💼 Career & Skill Passport' },
                  { id: 'trades', label: '🔧 Trade & Field Engineering' },
                  { id: 'campus', label: '🎓 Campus OS & Video Academy' },
                  { id: 'orchestration', label: '🌐 Cross-Platform SOAR' },
                ].map((sub) => {
                  const isSubSelected = selectedSubCategory === sub.id
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubCategory(sub.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                        isSubSelected
                          ? "bg-purple-600 text-white shadow-md font-black ring-2 ring-purple-400/40"
                          : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/10"
                      }`}
                    >
                      {sub.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* SEARCH & SORT TOOLBAR */}
          <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 flex items-center rounded-lg bg-zinc-50 px-3 py-2 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800/80">
              <Search className="h-4 w-4 text-zinc-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search Launchpad, PDFAdore, software, pentests, zero trust retainers, certifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-500 shrink-0">
              {/* Guild vs All Ecosystem Toggle */}
              <button
                onClick={() => setShowAllEcosystem(!showAllEcosystem)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  showAllEcosystem
                    ? "bg-purple-600 text-white border-purple-400 shadow-sm"
                    : "bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                }`}
                title="Toggle between strict profession enclave filter and all catalog apps"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{showAllEcosystem ? "🌐 All Products Active" : "Filter by Guild Enclave"}</span>
              </button>

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

          {/* CATEGORIZED ECOSYSTEM DIRECTORY & STRUCTURED MARKETPLACE PILLARS */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A66C2] dark:text-sky-400">
                  📂 Structured Marketplace Taxonomy
                </span>
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Browse Featured Platforms by Category
                </h3>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'All', label: '✨ All Categories' },
                  { id: 'Compliance_RMF', label: '🏛️ Federal Compliance & RMF' },
                  { id: 'DAST_Offensive', label: '🎯 DAST & Web Security' },
                  { id: 'Cyber_Prediction', label: '⚡ Cyber Defense & Prediction' },
                  { id: 'Productivity_Notes', label: '📓 Productivity & Field Notes' },
                  { id: 'Portals_Launchpads', label: '🚀 Enterprise Portals & Launchpads' }
                ].map((catFilter) => {
                  const isActive = selectedSubCategory === catFilter.id
                  return (
                    <button
                      key={catFilter.id}
                      type="button"
                      onClick={() => setSelectedSubCategory(catFilter.id)}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#0A66C2] text-white shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {catFilter.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 5 Categorized Shelf Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Category 1: Federal Compliance & DoD RMF */}
              <div
                onClick={() => setSelectedSubCategory(selectedSubCategory === 'Compliance_RMF' ? 'All' : 'Compliance_RMF')}
                className={`rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  selectedSubCategory === 'Compliance_RMF'
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/30"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-emerald-400"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">🛡️</span>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[9px] font-bold uppercase">
                      DoDI 8510.01 · NISP
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    1. Federal Compliance &amp; DoD RMF
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                    Aagiis DoD RMF, DCSA NISP (32 CFR Part 117), DISA STIG &amp; cATO governance.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-700/60 flex flex-col gap-1">
                  <a
                    href="https://aagiis.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center justify-between"
                  >
                    <span>🛡️ Aagiis Platform</span>
                    <span>aagiis.com ↗</span>
                  </a>
                </div>
              </div>

              {/* Category 2: DAST & Web Interface Security */}
              <div
                onClick={() => setSelectedSubCategory(selectedSubCategory === 'DAST_Offensive' ? 'All' : 'DAST_Offensive')}
                className={`rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  selectedSubCategory === 'DAST_Offensive'
                    ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 ring-2 ring-orange-500/30"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-orange-400"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">🎯</span>
                    <span className="rounded-full bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 px-2 py-0.5 text-[9px] font-bold uppercase">
                      XTRIKE &amp; Aegis.SOC
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    2. DAST &amp; Web Security
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                    EXPEDITE STRIKE™ Live DAST Engine (/engine) &amp; Vulnerability Scanner.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-700/60 flex flex-col gap-1">
                  <a
                    href="https://11-dast-security-platform.vercel.app/engine"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-bold text-orange-700 dark:text-orange-400 hover:underline flex items-center justify-between"
                  >
                    <span>🎯 DAST Engine</span>
                    <span>/engine ↗</span>
                  </a>
                  <a
                    href="https://11-dast-security-platform.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:underline flex items-center justify-between"
                  >
                    <span>🌐 Main Landing</span>
                    <span>Platform ↗</span>
                  </a>
                </div>
              </div>

              {/* Category 3: Cyber Defense & Threat Prediction */}
              <div
                onClick={() => setSelectedSubCategory(selectedSubCategory === 'Cyber_Prediction' ? 'All' : 'Cyber_Prediction')}
                className={`rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  selectedSubCategory === 'Cyber_Prediction'
                    ? "border-violet-500 bg-violet-50/50 dark:bg-violet-950/30 ring-2 ring-violet-500/30"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-violet-400"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">🔮</span>
                    <span className="rounded-full bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 px-2 py-0.5 text-[9px] font-bold uppercase">
                      DSTRIKE &amp; Noctis
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    3. Cyber Defense &amp; Prediction
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                    DSTRIKE Autonomous Cyber Defense &amp; Noctis Threat Prediction Desk.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-700/60 flex flex-col gap-1">
                  <a
                    href="https://dstrike.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-bold text-violet-700 dark:text-violet-400 hover:underline flex items-center justify-between"
                  >
                    <span>⚡ Main App</span>
                    <span>dstrike.app ↗</span>
                  </a>
                  <a
                    href="https://dstrike.app/noctis"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-semibold text-fuchsia-700 dark:text-fuchsia-400 hover:underline flex items-center justify-between"
                  >
                    <span>🔮 Prediction Desk</span>
                    <span>/noctis ↗</span>
                  </a>
                </div>
              </div>

              {/* Category 4: Productivity, Field Notes & Document Tools */}
              <div
                onClick={() => setSelectedSubCategory(selectedSubCategory === 'Productivity_Notes' ? 'All' : 'Productivity_Notes')}
                className={`rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  selectedSubCategory === 'Productivity_Notes'
                    ? "border-lime-500 bg-lime-50/50 dark:bg-lime-950/30 ring-2 ring-lime-500/30"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-lime-400"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">📓</span>
                    <span className="rounded-full bg-lime-100 dark:bg-lime-950 text-lime-800 dark:text-lime-300 px-2 py-0.5 text-[9px] font-bold uppercase">
                      E2EE Workspace
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    4. Productivity &amp; Field Notes
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                    DeskNote E2EE digital notebook, voice logs &amp; PDFAdore utilities.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-700/60 flex flex-col gap-1">
                  <a
                    href="https://desk-note-lime.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-bold text-lime-700 dark:text-lime-400 hover:underline flex items-center justify-between"
                  >
                    <span>📓 DeskNote Live</span>
                    <span>desk-note ↗</span>
                  </a>
                  <a
                    href="https://www.pdfadore.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center justify-between"
                  >
                    <span>📄 PDFAdore</span>
                    <span>pdfadore.com ↗</span>
                  </a>
                </div>
              </div>

              {/* Category 5: Enterprise Portals & Production Launchpads */}
              <div
                onClick={() => setSelectedSubCategory(selectedSubCategory === 'Portals_Launchpads' ? 'All' : 'Portals_Launchpads')}
                className={`rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  selectedSubCategory === 'Portals_Launchpads'
                    ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 ring-2 ring-sky-500/30"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-sky-400"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">🏛️</span>
                    <span className="rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 px-2 py-0.5 text-[9px] font-bold uppercase">
                      Official Flagship
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    5. Portals &amp; Launchpads
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                    Expedite Consults Official Portal &amp; Sphera Live Production Launchpad.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-700/60 flex flex-col gap-1">
                  <a
                    href="https://www.expediteconsults.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-bold text-[#0A66C2] dark:text-sky-400 hover:underline flex items-center justify-between"
                  >
                    <span>🏛️ Expedite Consults</span>
                    <span>Official ↗</span>
                  </a>
                  <a
                    href="https://sphera-portal.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-between"
                  >
                    <span>🚀 Sphera Launchpad</span>
                    <span>Live Portal ↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-[#0A66C2] hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Top Badges Strip */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#0A66C2] dark:text-sky-300 border border-blue-200/70 dark:border-blue-800/70 px-2 py-0.5 text-[10px] font-bold">
                        📂 {product.category} · {product.subCategory}
                      </span>
                      {product.isVercelLive && (
                        <span className="rounded-md bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-400/40 px-2 py-0.5 text-[10px] font-mono font-bold">
                          ☁️ LIVE
                        </span>
                      )}
                    </div>

                    {product.badge && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300 shrink-0">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{product.icon}</span>
                      <div>
                        <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 leading-tight">
                          {product.name}
                        </h4>
                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                          <span>{product.vendor.name}</span>
                          {product.vendor.isVerified && (
                            <ShieldCheck className="h-3 w-3 text-[#0A66C2]" />
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {product.tagline}
                  </p>

                  {/* Architecture & Compliance tags */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {product.architecture?.latency && (
                      <span className="text-[10px] text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-750">
                        ⚡ {product.architecture.latency}
                      </span>
                    )}
                    {product.security?.compliance?.slice(0, 2).map((comp, idx) => (
                      <span key={idx} className="text-[10px] text-zinc-600 dark:text-zinc-400 font-semibold bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-750">
                        {comp}
                      </span>
                    ))}
                  </div>

                  {/* Pricing and Rating */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {product.pricing.displayPrice} <span className="text-[10px] font-normal text-zinc-400">{product.pricing.billingPeriod}</span>
                    </span>
                    <span className="text-amber-500 font-bold">
                      ★ {product.rating} ({product.reviewsCount})
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedProduct(product)
                      setActiveProductTab('overview')
                    }}
                    className="text-xs font-bold text-[#0A66C2] hover:underline"
                  >
                    View Details →
                  </button>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {product.liveUrl && (
                      <button
                        onClick={() => {
                          if (product.liveUrl?.startsWith('/')) {
                            if (onNavigateTab && product.liveUrl === '/feed') onNavigateTab('home')
                            else if (onNavigateTab && product.liveUrl === '/bazaar') onNavigateTab('marketplace')
                            else if (onNavigateTab && product.liveUrl === '/career') onNavigateTab('careersuite')
                            else window.open(product.liveUrl, '_blank', 'noopener,noreferrer')
                          } else {
                            window.open(product.liveUrl, '_blank', 'noopener,noreferrer')
                          }
                        }}
                        className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        title={product.liveUrl}
                      >
                        <Zap className="h-3 w-3 fill-amber-300 text-amber-300" />
                        <span>Launch Live ↗</span>
                      </button>
                    )}

                    {product.demoUrl && product.demoUrl !== product.liveUrl && product.demoUrl.startsWith('http') && (
                      <a
                        href={product.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        title={product.demoUrl}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>
                          {product.demoUrl.includes('/noctis')
                            ? 'Noctis Desk ↗'
                            : product.demoUrl.includes('/engine')
                            ? 'DAST Engine ↗'
                            : product.demoUrl.includes('sphera-portal')
                            ? 'Sphera Launchpad ↗'
                            : 'Companion URL ↗'}
                        </span>
                      </a>
                    )}

                    <button
                      onClick={() => handleGenerateLicense(product, 'trial')}
                      className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      {product.pricing.hasFreeTrial ? "Free Trial" : "Buy Now"}
                    </button>
                  </div>
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
                  {selectedProduct.liveUrl && (
                    <button
                      onClick={() => window.open(selectedProduct.liveUrl, '_blank', 'noopener,noreferrer')}
                      className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-all"
                    >
                      <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                      <span>Launch Live Application →</span>
                    </button>
                  )}
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

      {/* SOLUTIONS HUB SOW & EXPERT BOOKING MODAL */}
      <Dialog open={!!solutionActionModal} onOpenChange={(open) => !open && setSolutionActionModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              {solutionActionModal?.type === 'sow' ? (
                <>
                  <FileText className="h-5 w-5 text-[#0A66C2]" />
                  <span>Request Statement of Work (SOW)</span>
                </>
              ) : (
                <>
                  <Calendar className="h-5 w-5 text-amber-500" />
                  <span>Book 1-on-1 Subject Matter Expert Slot</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {solutionActionModal && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/70 p-3.5 border border-zinc-200 dark:border-zinc-700 space-y-1">
                <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{solutionActionModal.title}</p>
                <p className="text-zinc-500 dark:text-zinc-400">{solutionActionModal.provider}</p>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 pt-1">{solutionActionModal.detail}</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 pt-1">{solutionActionModal.price}</p>
              </div>

              {solutionActionSuccess ? (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-4 text-center space-y-2">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                    ✓ {solutionActionModal.type === 'sow' ? 'Statement of Work Dispatched!' : 'Advisory Session Slot Reserved!'}
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-300">
                    A dossier &amp; calendar invite has been generated for <strong>{currentUser.name}</strong>. You can also continue the conversation in Direct Messaging.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSolutionActionModal(null)
                        if (onNavigateTab) onNavigateTab('messaging')
                      }}
                      className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white font-bold px-3.5 py-2 cursor-pointer"
                    >
                      Open Direct Messaging →
                    </button>
                    <button
                      type="button"
                      onClick={() => setSolutionActionModal(null)}
                      className="rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold px-3.5 py-2 cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSolutionActionSuccess(true)
                  }}
                  className="space-y-3"
                >
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">
                      {solutionActionModal.type === 'sow'
                        ? 'Organization / Facility Scope & Target Timeline:'
                        : 'Preferred Date/Time Window & Advisory Agenda:'}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={solutionActionNotes}
                      onChange={(e) => setSolutionActionNotes(e.target.value)}
                      placeholder={
                        solutionActionModal.type === 'sow'
                          ? 'Describe your environment, compliance requirements, or clinical/field deployment goals...'
                          : 'e.g., Thursday 2:00 PM EST — Review architecture blueprint and implementation checklist...'
                      }
                      className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSolutionActionModal(null)}
                      className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3.5 py-2 font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] px-4 py-2 font-bold text-white shadow-xs cursor-pointer"
                    >
                      {solutionActionModal.type === 'sow' ? 'Generate & Send SOW Request 🚀' : 'Confirm Advisory Slot 📅'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

