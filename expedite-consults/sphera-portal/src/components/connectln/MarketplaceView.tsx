"use client"

import React, { useState, useEffect } from "react"
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
import { LiveHarvestedMediaShowcase } from "./LiveHarvestedMediaShowcase"
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
  const [activeProductTab, setActiveProductTab] = useState<'overview' | 'noctis_sales' | 'features' | 'screenshots' | 'demo' | 'architecture' | 'integrations' | 'security' | 'pricing' | 'reviews' | 'docs' | 'casestudies' | 'support'>('overview')

  // Noctis AI Marketing & Sales Agent States (Connected to /api/connectin/noctis & https://www.dstrike.app/noctis)
  const [showNoctisSalesHub, setShowNoctisSalesHub] = useState<boolean>(true)
  const [isNoctisSalesLoading, setIsNoctisSalesLoading] = useState<boolean>(false)
  const [noctisSalesText, setNoctisSalesText] = useState<string>("")
  const [noctisSalesQuestion, setNoctisSalesQuestion] = useState<string>("")
  const [noctisUpdatedAtLabel, setNoctisUpdatedAtLabel] = useState<string>("Synced with Noctis")
  const [noctisActivePitch, setNoctisActivePitch] = useState<{
    productId: string
    productName: string
    vendorName: string
    category: string
    subCategory: string
    tagline: string
    displayPrice: string
    billingPeriod: string
    hasFreeTrial: boolean
    liveUrl?: string
    demoUrl?: string
    noctisAgentUrl: string
    headlinePitch: string
    whatItDoesAndHowItWorks: string
    featureHighlights: Array<{ title: string; desc: string }>
    architectureAndSecurity: string
    complianceBadges: string[]
    whyBuyNowAndROI: string[]
    pricingSummary: Array<{ name: string; price: string; period: string; description: string }>
    liveNoctisSalesResponse?: string
  } | null>(null)
  const [noctisProductFollowUpInput, setNoctisProductFollowUpInput] = useState<string>("")

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

  const fetchNoctisMarketplaceSalesAgent = async (opts?: {
    question?: string
    productId?: string
    scrollToHub?: boolean
  }) => {
    setIsNoctisSalesLoading(true)
    if (opts?.scrollToHub) {
      setShowNoctisSalesHub(true)
      setTimeout(() => {
        const el = document.getElementById('noctis-marketplace-sales-hub')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 60)
    }
    try {
      const res = await fetch('/api/connectin/noctis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: opts?.productId ? 'pitch_single_product' : 'marketplace_sales_agent',
          productId: opts?.productId || undefined,
          question: opts?.question || undefined,
          categoryFilter: selectedMainCategory,
          profile: {
            name: currentUser?.name || 'Kwesi Asiedu',
            profession: currentUser?.headline || currentUser?.professionEnclave || ''
          }
        })
      })
      const data = await res.json().catch(() => null)
      if (data?.text) {
        setNoctisSalesText(data.text)
        setNoctisUpdatedAtLabel(
          `Synced ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
        )
      }
      if (data?.productPitch) {
        setNoctisActivePitch(data.productPitch)
      }
    } catch {
      // Keep existing pitch
    } finally {
      setIsNoctisSalesLoading(false)
    }
  }

  useEffect(() => {
    fetchNoctisMarketplaceSalesAgent()
  }, [])

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
      p.id === 'prod_pdfadore_suite' ||
      p.id === 'prod_ignored_cdl_lineman_elevator_suite' ||
      p.id === 'prod_ignored_arborist_septic_evs_suite' ||
      p.id === 'prod_veterans_sdvosb_skillbridge_hub'

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
              style={{ color: '#FBF8F3' }}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                selectedMainCategory === 'Launchpad'
                  ? "bg-[#5E3119] text-[#FBF8F3] ring-2 ring-[#7C4225]/40 shadow-md"
                  : "bg-[#7C4225] hover:bg-[#5E3119] text-[#FBF8F3]"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Launchpad Fleet Catalog</span>
            </button>

            <button
              type="button"
              onClick={() => activateSolutionsHub()}
              style={selectedMainCategory === 'Solutions' ? { color: '#FBF8F3' } : undefined}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                selectedMainCategory === 'Solutions'
                  ? "bg-[#7C4225] hover:bg-[#5E3119] text-[#FBF8F3] border border-[#5E3119] shadow-md"
                  : "bg-[#EFE8DA] dark:bg-zinc-800 hover:bg-[#E5DEC9] dark:hover:bg-zinc-700 text-[#5E3119] dark:text-zinc-200 border border-[#DDD3C2] dark:border-zinc-700 shadow-2xs"
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{selectedMainCategory === 'Solutions' ? 'Solutions Hub (Active)' : 'Solutions Hub'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowNoctisSalesHub(prev => !prev)
                if (!showNoctisSalesHub) {
                  fetchNoctisMarketplaceSalesAgent({ scrollToHub: true })
                }
              }}
              style={showNoctisSalesHub ? { color: '#FBF8F3' } : undefined}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                showNoctisSalesHub
                  ? "bg-[#292521] hover:bg-[#1C1917] text-[#FBF8F3]"
                  : "bg-[#EFE8DA] hover:bg-[#E5DEC9] text-[#292521] border border-[#DDD3C2]"
              }`}
            >
              <Bot className="h-3.5 w-3.5" />
              <span>{showNoctisSalesHub ? "Noctis Sales Agent: ON" : "Ask Noctis Sales Agent"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsVendorModalOpen(true)}
              className="rounded-xl bg-[#FBF8F3] dark:bg-zinc-800 hover:bg-[#EFE8DA] dark:hover:bg-zinc-700 text-[#57534E] dark:text-zinc-300 border border-[#DDD3C2] dark:border-zinc-700 px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>List Product / Service</span>
            </button>
          </div>
        </div>

        {/* Live 1-Minute Auto-Pulled Product Demo Videos & Solution Visuals */}
        <LiveHarvestedMediaShowcase
          destination="market"
          onOpenAdminBackend={() => onNavigateTab && onNavigateTab('adminiam')}
        />

        {/* NOCTIS AI MARKETING & SALES CONCIERGE HUB (In-App API Connection via /api/connectin/noctis) */}
        {showNoctisSalesHub && (
          <div
            id="noctis-marketplace-sales-hub"
            className="rounded-2xl border border-[#DDD3C2] bg-[#FBF8F3] p-4 sm:p-5 text-[#292521] shadow-xs space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#EFE8DA] text-[#5E3119] border border-[#DDD3C2] px-2.5 py-0.5 text-xs font-extrabold">
                  <span>Noctis Marketing &amp; Sales Agent</span>
                </span>
                <span className="text-[11px] font-semibold text-[#57534E] bg-[#F3EDE2] border border-[#DDD3C2] px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#7C4225]" />
                  <span>Learned All {MASTER_MARKETPLACE_PRODUCTS.length} Market Products · {ENTERPRISE_SOLUTIONS_DATA.length} Blueprints · {spheraAppsData.length} Sphera Apps</span>
                </span>
                <span className="text-[11px] font-semibold text-[#5E3119] bg-[#EFE8DA] border border-[#DDD3C2] px-2.5 py-0.5 rounded-full">
                  Noctis API Connected
                </span>
              </div>

              <button
                type="button"
                onClick={() => fetchNoctisMarketplaceSalesAgent()}
                disabled={isNoctisSalesLoading}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#EFE8DA] hover:bg-[#E5DEC9] text-[#57534E] border border-[#DDD3C2] px-3 py-1 text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
              >
                <span>{isNoctisSalesLoading ? "Noctis pitching..." : noctisUpdatedAtLabel}</span>
                <span className={isNoctisSalesLoading ? "animate-spin" : ""}>↻</span>
              </button>
            </div>

            {/* Active Product Sales Deep-Dive Card (When user clicks "Ask Noctis" on a product or asks about a specific product) */}
            {noctisActivePitch && (
              <div className="rounded-2xl border border-[#DDD3C2] bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E6DEC8] pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        style={{ color: '#FBF8F3' }}
                        className="rounded-md bg-[#7C4225] text-[#FBF8F3] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                      >
                        Noctis Product Sales Deep-Dive
                      </span>
                      <span className="text-xs font-bold text-[#78716C]">
                        {noctisActivePitch.vendorName} · {noctisActivePitch.category} ({noctisActivePitch.subCategory})
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-[#292521]">
                      {noctisActivePitch.headlinePitch}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-lg bg-[#EFE8DA] border border-[#DDD3C2] px-3 py-1 text-xs font-black text-[#5E3119]">
                      {noctisActivePitch.displayPrice} ({noctisActivePitch.billingPeriod})
                    </span>
                    {noctisActivePitch.liveUrl && !noctisActivePitch.liveUrl.includes('/noctis') && (
                      <a
                        href={noctisActivePitch.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#FBF8F3' }}
                        className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] text-[#FBF8F3] px-3 py-1.5 text-xs font-extrabold shadow-2xs"
                      >
                        Launch {noctisActivePitch.productName.split('—')[0].trim()} ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* 4-Column Sales Pitch Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-xl bg-[#FBF8F3] border border-[#E6DEC8] p-3 space-y-1.5">
                    <div className="font-extrabold text-[#5E3119]">
                      What It Has &amp; Does
                    </div>
                    <p className="text-[#57534E] leading-relaxed line-clamp-5">
                      {noctisActivePitch.whatItDoesAndHowItWorks}
                    </p>
                    <ul className="space-y-1 pt-1 text-[11px] text-[#57534E]">
                      {noctisActivePitch.featureHighlights.slice(0, 3).map((f, idx) => (
                        <li key={idx}>
                          • <strong>{f.title}:</strong> {f.desc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-[#FBF8F3] border border-[#E6DEC8] p-3 space-y-1.5">
                    <div className="font-extrabold text-[#5E3119]">
                      Architecture &amp; Compliance
                    </div>
                    <p className="text-[#57534E] leading-relaxed whitespace-pre-line">
                      {noctisActivePitch.architectureAndSecurity}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {noctisActivePitch.complianceBadges.map((b, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-white border border-[#DDD3C2] px-1.5 py-0.5 text-[10px] font-bold text-[#57534E]"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#FBF8F3] border border-[#E6DEC8] p-3 space-y-1.5">
                    <div className="font-extrabold text-[#5E3119]">
                      Proven ROI &amp; Why Buy Now
                    </div>
                    <ul className="space-y-1.5 text-[#57534E] list-disc pl-4">
                      {noctisActivePitch.whyBuyNowAndROI.map((roi, idx) => (
                        <li key={idx} className="leading-snug">
                          {roi}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-[#FBF8F3] border border-[#E6DEC8] p-3 flex flex-col justify-between space-y-2">
                    <div className="space-y-1.5">
                      <div className="font-extrabold text-[#5E3119]">
                        Pricing Tiers &amp; Trial Offer
                      </div>
                      {noctisActivePitch.pricingSummary.slice(0, 3).map((tier, idx) => (
                        <div key={idx} className="rounded-lg bg-white border border-[#DDD3C2] p-2">
                          <div className="flex items-center justify-between font-bold text-[#292521]">
                            <span>{tier.name}</span>
                            <span className="text-[#7C4225]">{tier.price}</span>
                          </div>
                          <p className="text-[10px] text-[#78716C] line-clamp-1">{tier.description}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleGenerateLicense({ name: noctisActivePitch.productName }, 'trial')
                      }
                      style={{ color: '#FBF8F3' }}
                      className="w-full rounded-lg bg-[#7C4225] hover:bg-[#5E3119] text-[#FBF8F3] py-1.5 text-xs font-extrabold cursor-pointer"
                    >
                      Claim 14-Day Free Trial Key
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Live Noctis Sales Narrative Box */}
            <div className="rounded-xl bg-white border border-[#E6DEC8] p-4 text-xs sm:text-sm text-[#292521] leading-relaxed whitespace-pre-line break-words overflow-x-hidden font-medium max-h-64 overflow-y-auto">
              {(noctisSalesText ||
                `Hi ${currentUser?.name?.split(' ')[0] || 'there'}! I am Noctis, your AI Marketing & Enterprise Solutions Sales Agent inside the ConnectLn Market. I know every feature, architecture spec, compliance standard, and pricing tier across all ${MASTER_MARKETPLACE_PRODUCTS.length} products. Ask me to pitch any platform or click "Ask Noctis" on any product card below!`)
                .replace(/```noctis-dashboard[\s\S]*?```/gi, '')
                .replace(/\*\*/g, '')
                .replace(/^#{1,4}\s+/gm, '')}
            </div>

            {/* Interactive Ask Noctis Marketing & Sales Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!noctisSalesQuestion.trim()) return
                fetchNoctisMarketplaceSalesAgent({
                  question: noctisSalesQuestion.trim(),
                  productId: noctisActivePitch?.productId
                })
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                value={noctisSalesQuestion}
                onChange={(e) => setNoctisSalesQuestion(e.target.value)}
                placeholder="Ask Noctis Sales Agent about any Market product, pricing, ROI, compliance, or ask for a custom executive pitch..."
                className="flex-1 rounded-xl border border-[#DDD3C2] bg-white px-3.5 py-2 text-xs sm:text-sm text-[#292521] focus:border-[#7C4225] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isNoctisSalesLoading || !noctisSalesQuestion.trim()}
                style={{ color: '#FBF8F3' }}
                className="rounded-xl bg-[#7C4225] hover:bg-[#5E3119] disabled:bg-[#D8CEBE] px-4 py-2 text-xs font-extrabold text-[#FBF8F3] transition-all cursor-pointer shrink-0"
              >
                {isNoctisSalesLoading ? "Asking Noctis..." : "Ask Noctis Sales Agent →"}
              </button>
            </form>

            {/* 1-Click Product Pitch & Sales Prompt Chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                {
                  label: "Pitch DSTRIKE & Noctis Threat Prediction",
                  productId: "prod_dstrike_noctis_platform",
                  q: "Pitch DSTRIKE and Noctis Threat Prediction — explain everything it does, features, compliance, and ROI."
                },
                {
                  label: "Pitch Aagiis DoD RMF & cATO (aagiis.com)",
                  productId: "prod_aagiis_federal_rmf",
                  q: "Give me a full executive sales pitch for Aagiis Federal Compliance & DoD RMF (https://aagiis.com) and why defense teams buy it."
                },
                {
                  label: "Pitch EXPEDITE STRIKE™ DAST Engine (/engine)",
                  productId: "prod_expedite_strike_dast_engine",
                  q: "Deep-dive EXPEDITE STRIKE DAST Engine (/engine) — how it works, zero false positives, OWASP Top 10 coverage, and pricing."
                },
                {
                  label: "Pitch DeskNote E2EE & PDFAdore Suite",
                  productId: "prod_desknote_lime_live",
                  q: "Pitch DeskNote E2EE Notebook and PDFAdore (31+ PDF Tools) for field engineering and enterprise teams."
                },
                {
                  label: "Pitch Master Launchpad (67+ Platforms)",
                  productId: "prod_expedite_ecosystem_launchpad",
                  q: "Explain everything included in the Expedite Consults Digital Ecosystem Launchpad (67+ Platforms) and how to get started."
                },
                {
                  label: "Compare Pricing Tiers & Free Trials",
                  productId: "",
                  q: "Compare pricing tiers, 14-day free trials, and enterprise ROI across our top Marketplace platforms."
                }
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    setNoctisSalesQuestion(chip.q)
                    fetchNoctisMarketplaceSalesAgent({
                      question: chip.q,
                      productId: chip.productId || undefined
                    })
                  }}
                  className="rounded-full bg-[#EFE8DA] hover:bg-[#E5DEC9] text-[#5E3119] border border-[#DDD3C2] px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FEATURED PLATFORMS IN CARDS (Automatically collapses when Solutions Hub is active so Solutions Blueprints appear immediately above the fold!) */}
        <div className="space-y-3 pt-2 border-t border-[#E6DEC8] dark:border-zinc-800">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-md bg-[#EFE8DA] text-[#5E3119] border border-[#D8CEBE] dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                Categorized Flagship Platforms (11 Live Cards)
              </span>
              <span className="text-xs text-[#78716C] dark:text-zinc-400">
                Every platform organized into dedicated cards with direct launch buttons
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedMainCategory === 'Solutions' && (
                <button
                  type="button"
                  onClick={() => setShowFlagshipInSolutions(!showFlagshipInSolutions)}
                  className="rounded-lg bg-[#EFE8DA] dark:bg-zinc-800 hover:bg-[#E5DEC9] dark:hover:bg-zinc-700 text-[#292521] dark:text-zinc-300 px-2.5 py-1 text-xs font-bold cursor-pointer transition-colors"
                >
                  {showFlagshipInSolutions ? '▲ Hide 11 Flagship Cards' : '▼ Show 11 Flagship Cards'}
                </button>
              )}
              {selectedSubCategory !== 'All' && (
                <button
                  type="button"
                  onClick={() => setSelectedSubCategory('All')}
                  className="text-xs font-bold text-[#7C4225] hover:underline cursor-pointer"
                >
                  Show All Categories ✕
                </button>
              )}
            </div>
          </div>

          {(selectedMainCategory !== 'Solutions' || showFlagshipInSolutions) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Aagiis — Federal Compliance & DoD RMF */}
            <div className="rounded-xl border border-[#DDD3C2] dark:border-zinc-800 bg-[#FBF8F3] dark:bg-zinc-900 p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-[#7C4225]/50 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-md bg-[#EFE8DA] text-[#5E3119] border border-[#DDD3C2] dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    1. Federal Compliance &amp; RMF
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#78716C] dark:text-zinc-400 shrink-0">
                    DoDI 8510.01
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#292521] dark:text-zinc-100 leading-snug">
                    Aagiis — Federal Compliance Solutions
                  </h3>
                  <p className="text-[11px] text-[#57534E] dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    DoD RMF &amp; DCSA NISP Platform (DoDI 8510.01), Continuous ATO (cATO), eMASS &amp; NIST 800-53 Rev 5.
                  </p>
                </div>
              </div>
              <div className="pt-2.5 border-t border-[#E6DEC8] dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    fetchNoctisMarketplaceSalesAgent({
                      productId: 'prod_aagiis_federal_rmf',
                      question: 'Pitch Aagiis Federal Compliance & DoD RMF (https://aagiis.com) — explain everything it has and does, cATO, and pricing.',
                      scrollToHub: true
                    })
                  }
                  className="text-[11px] font-semibold text-[#57534E] hover:text-[#292521] dark:text-zinc-400 dark:hover:text-zinc-200 hover:underline cursor-pointer"
                >
                  Ask Noctis
                </button>
                <a
                  href="https://aagiis.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#FBF8F3' }}
                  className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] text-[#FBF8F3] px-3 py-1.5 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>Launch aagiis.com ↗</span>
                </a>
              </div>
            </div>

            {/* Card 2: EXPEDITE STRIKE™ — DAST Engine (/engine) */}
            <div className="rounded-xl border border-[#DDD3C2] dark:border-zinc-800 bg-[#FBF8F3] dark:bg-zinc-900 p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-[#7C4225]/50 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-md bg-[#EFE8DA] text-[#5E3119] border border-[#DDD3C2] dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    2. DAST &amp; Vulnerability Engine
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#78716C] dark:text-zinc-400 shrink-0">
                    XTRIKE · /engine
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#292521] dark:text-zinc-100 leading-snug">
                    EXPEDITE STRIKE™ — DAST Engine Dashboard
                  </h3>
                  <p className="text-[11px] text-[#57534E] dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    XTRIKE &amp; Aegis.SOC live DAST Engine &amp; Vulnerability Scanner Dashboard for web &amp; API targets.
                  </p>
                </div>
              </div>
              <div className="pt-2.5 border-t border-[#E6DEC8] dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    fetchNoctisMarketplaceSalesAgent({
                      productId: 'prod_expedite_strike_dast_engine',
                      question: 'Pitch EXPEDITE STRIKE DAST Engine (/engine) — explain everything it does, OWASP Top 10 & API scanning, and ROI.',
                      scrollToHub: true
                    })
                  }
                  className="text-[11px] font-semibold text-[#57534E] hover:text-[#292521] dark:text-zinc-400 dark:hover:text-zinc-200 hover:underline cursor-pointer"
                >
                  Ask Noctis
                </button>
                <a
                  href="https://11-dast-security-platform.vercel.app/engine"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#FBF8F3' }}
                  className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] text-[#FBF8F3] px-3 py-1.5 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>Open DAST /engine ↗</span>
                </a>
              </div>
            </div>

            {/* Card 3: EXPEDITE STRIKE™ — Main Platform Landing Page */}
            <div className="rounded-xl border border-[#DDD3C2] dark:border-zinc-800 bg-[#FBF8F3] dark:bg-zinc-900 p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-[#7C4225]/50 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-md bg-[#EFE8DA] text-[#5E3119] border border-[#DDD3C2] dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    2. Web Interface Security
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#78716C] dark:text-zinc-400 shrink-0">
                    OWASP Top 10
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#292521] dark:text-zinc-100 leading-snug">
                    EXPEDITE STRIKE™ — Main Platform Landing
                  </h3>
                  <p className="text-[11px] text-[#57534E] dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    Main DAST &amp; Web Interface Security Platform command portal, architecture specs &amp; compliance matrix.
                  </p>
                </div>
              </div>
              <div className="pt-2.5 border-t border-[#E6DEC8] dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    fetchNoctisMarketplaceSalesAgent({
                      productId: 'prod_expedite_strike_dast_landing',
                      question: 'Pitch EXPEDITE STRIKE Web Interface Security Platform — explain its features, compliance matrix, and pricing.',
                      scrollToHub: true
                    })
                  }
                  className="text-[11px] font-semibold text-[#57534E] hover:text-[#292521] dark:text-zinc-400 dark:hover:text-zinc-200 hover:underline cursor-pointer"
                >
                  Ask Noctis
                </button>
                <a
                  href="https://11-dast-security-platform.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#FBF8F3' }}
                  className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] text-[#FBF8F3] px-3 py-1.5 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>Main Landing Page ↗</span>
                </a>
              </div>
            </div>

            {/* Card 4: DSTRIKE — Main App */}
            <div className="rounded-xl border border-[#DDD3C2] dark:border-zinc-800 bg-[#FBF8F3] dark:bg-zinc-900 p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-[#7C4225]/50 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-md bg-[#EFE8DA] text-[#5E3119] border border-[#DDD3C2] dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    3. Autonomous Cyber Defense
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#78716C] dark:text-zinc-400 shrink-0">
                    dstrike.app
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#292521] dark:text-zinc-100 leading-snug">
                    DSTRIKE — Main App
                  </h3>
                  <p className="text-[11px] text-[#57534E] dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    Autonomous cyber defense, attack surface management, and continuous threat telemetry platform.
                  </p>
                </div>
              </div>
              <div className="pt-2.5 border-t border-[#E6DEC8] dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    fetchNoctisMarketplaceSalesAgent({
                      productId: 'prod_dstrike_main_app',
                      question: 'Pitch DSTRIKE Autonomous Cyber Defense (https://dstrike.app) — explain everything it does, telemetry, and ROI.',
                      scrollToHub: true
                    })
                  }
                  className="text-[11px] font-semibold text-[#57534E] hover:text-[#292521] dark:text-zinc-400 dark:hover:text-zinc-200 hover:underline cursor-pointer"
                >
                  Ask Noctis
                </button>
                <a
                  href="https://dstrike.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#FBF8F3' }}
                  className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] text-[#FBF8F3] px-3 py-1.5 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>Launch dstrike.app ↗</span>
                </a>
              </div>
            </div>

            {/* Card 5: DSTRIKE Prediction Desk (Noctis) */}
            <div className="rounded-xl border border-[#DDD3C2] dark:border-zinc-800 bg-[#FBF8F3] dark:bg-zinc-900 p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-[#7C4225]/50 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-md bg-[#EFE8DA] text-[#5E3119] border border-[#DDD3C2] dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    3. Threat Prediction Intelligence
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#78716C] dark:text-zinc-400 shrink-0">
                    Noctis AI
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#292521] dark:text-zinc-100 leading-snug">
                    DSTRIKE Threat Prediction (Noctis)
                  </h3>
                  <p className="text-[11px] text-[#57534E] dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    Probabilistic cyber threat forecasting, zero-day exploit probability curves &amp; geopolitical risk modeling.
                  </p>
                </div>
              </div>
              <div className="pt-2.5 border-t border-[#E6DEC8] dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubCategory('Cyber_Prediction')}
                  className="text-[11px] font-semibold text-[#57534E] hover:text-[#292521] dark:text-zinc-400 dark:hover:text-zinc-200 hover:underline cursor-pointer"
                >
                  Filter Category
                </button>
                <button
                  type="button"
                  onClick={() =>
                    fetchNoctisMarketplaceSalesAgent({
                      productId: 'prod_dstrike_noctis_platform',
                      question: 'Pitch DSTRIKE Threat Prediction — explain how it works, its features, and why CISOs buy it.',
                      scrollToHub: true
                    })
                  }
                  style={{ color: '#FBF8F3' }}
                  className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] text-[#FBF8F3] px-3 py-1.5 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Ask Noctis</span>
                </button>
              </div>
            </div>

            {/* Card 6: DeskNote — Productivity & Field Notes */}
            <div className="rounded-xl border border-[#DDD3C2] dark:border-zinc-800 bg-[#FBF8F3] dark:bg-zinc-900 p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-[#7C4225]/50 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-md bg-[#EFE8DA] text-[#5E3119] border border-[#DDD3C2] dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    4. Productivity &amp; Field Notes
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#78716C] dark:text-zinc-400 shrink-0">
                    E2EE Notebook
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#292521] dark:text-zinc-100 leading-snug">
                    DeskNote — Productivity Workspace
                  </h3>
                  <p className="text-[11px] text-[#57534E] dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    Tactile multi-subject digital notebook with voice notes, sketch canvas, punch-lists &amp; AES-256 encryption.
                  </p>
                </div>
              </div>
              <div className="pt-2.5 border-t border-[#E6DEC8] dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    fetchNoctisMarketplaceSalesAgent({
                      productId: 'prod_desknote_lime_live',
                      question: 'Pitch DeskNote E2EE Digital Notebook — explain all its features, voice logs, encryption, and pricing.',
                      scrollToHub: true
                    })
                  }
                  className="text-[11px] font-semibold text-[#57534E] hover:text-[#292521] dark:text-zinc-400 dark:hover:text-zinc-200 hover:underline cursor-pointer"
                >
                  Ask Noctis
                </button>
                <a
                  href="https://desk-note-lime.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#FBF8F3' }}
                  className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] text-[#FBF8F3] px-3 py-1.5 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>Launch DeskNote ↗</span>
                </a>
              </div>
            </div>

            {/* Card 7: Expedite Consults — Official Enterprise Portal */}
            <div className="rounded-xl border border-[#DDD3C2] dark:border-zinc-800 bg-[#FBF8F3] dark:bg-zinc-900 p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-[#7C4225]/50 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-md bg-[#EFE8DA] text-[#5E3119] border border-[#DDD3C2] dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    5. Enterprise Advisory Portal
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#78716C] dark:text-zinc-400 shrink-0">
                    Official HQ
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#292521] dark:text-zinc-100 leading-snug">
                    Expedite Consults — Official Portal
                  </h3>
                  <p className="text-[11px] text-[#57534E] dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    Enterprise Cyber, AI &amp; Federal Advisory headquarters for DevSecOps, Zero Trust &amp; executive retainers.
                  </p>
                </div>
              </div>
              <div className="pt-2.5 border-t border-[#E6DEC8] dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    fetchNoctisMarketplaceSalesAgent({
                      productId: 'prod_expedite_consults_official_portal',
                      question: 'Pitch Expedite Consults Official Enterprise Advisory Portal (https://www.expediteconsults.com) and executive retainers.',
                      scrollToHub: true
                    })
                  }
                  className="text-[11px] font-semibold text-[#57534E] hover:text-[#292521] dark:text-zinc-400 dark:hover:text-zinc-200 hover:underline cursor-pointer"
                >
                  Ask Noctis
                </button>
                <a
                  href="https://www.expediteconsults.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#FBF8F3' }}
                  className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] text-[#FBF8F3] px-3 py-1.5 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>expediteconsults.com ↗</span>
                </a>
              </div>
            </div>

            {/* Card 8: Sphera Portal — Live Production Launchpad */}
            <div className="rounded-xl border border-[#DDD3C2] dark:border-zinc-800 bg-[#FBF8F3] dark:bg-zinc-900 p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-[#7C4225]/50 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-md bg-[#EFE8DA] text-[#5E3119] border border-[#DDD3C2] dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    5. Production Launchpad
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#78716C] dark:text-zinc-400 shrink-0">
                    Cloud OS
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#292521] dark:text-zinc-100 leading-snug">
                    Sphera Portal — Production Launchpad
                  </h3>
                  <p className="text-[11px] text-[#57534E] dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    Live multi-enclave Cloud OS hosting ConnectLn, Career Passport, Bazaar Marketplace &amp; Campus Hubs.
                  </p>
                </div>
              </div>
              <div className="pt-2.5 border-t border-[#E6DEC8] dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    fetchNoctisMarketplaceSalesAgent({
                      productId: 'prod_sphera_production_launchpad',
                      question: 'Pitch Sphera Portal Production Launchpad & PDFAdore Suite — explain everything included and how teams use it.',
                      scrollToHub: true
                    })
                  }
                  className="text-[11px] font-semibold text-[#57534E] hover:text-[#292521] dark:text-zinc-400 dark:hover:text-zinc-200 hover:underline cursor-pointer"
                >
                  Ask Noctis
                </button>
                <a
                  href="https://sphera-portal.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#FBF8F3' }}
                  className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] text-[#FBF8F3] px-3 py-1.5 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>sphera-portal ↗</span>
                </a>
              </div>
            </div>

            {/* Card 9: 05-SAST — Penetration Testing & Static Analysis Platform */}
            <div className="rounded-xl border border-[#DDD3C2] dark:border-zinc-800 bg-[#FBF8F3] dark:bg-zinc-900 p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-[#7C4225]/50 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-md bg-[#EFE8DA] text-[#5E3119] border border-[#DDD3C2] dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    6. Penetration Testing &amp; SAST
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#78716C] dark:text-zinc-400 shrink-0">
                    05-SAST Live
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#292521] dark:text-zinc-100 leading-snug">
                    05-SAST — Penetration Testing &amp; AST
                  </h3>
                  <p className="text-[11px] text-[#57534E] dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    Sub-4ms AST static code analysis, penetration testing vulnerability detection &amp; automated fix PRs.
                  </p>
                </div>
              </div>
              <div className="pt-2.5 border-t border-[#E6DEC8] dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    fetchNoctisMarketplaceSalesAgent({
                      productId: 'prod_05_sast',
                      question: 'Pitch 05-SAST Penetration Testing & Static Code Analysis Platform (https://05-sast-platform.vercel.app) — explain its AST engine, auto-PRs, and ROI.',
                      scrollToHub: true
                    })
                  }
                  className="text-[11px] font-semibold text-[#57534E] hover:text-[#292521] dark:text-zinc-400 dark:hover:text-zinc-200 hover:underline cursor-pointer"
                >
                  Ask Noctis
                </button>
                <a
                  href="https://05-sast-platform.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#FBF8F3' }}
                  className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] text-[#FBF8F3] px-3 py-1.5 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>Launch 05-SAST ↗</span>
                </a>
              </div>
            </div>

            {/* Card 10: Trepath 2.0 — Autonomous Penetration Testing & Attack Path */}
            <div className="rounded-xl border border-[#DDD3C2] dark:border-zinc-800 bg-[#FBF8F3] dark:bg-zinc-900 p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-[#7C4225]/50 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-md bg-[#EFE8DA] text-[#5E3119] border border-[#DDD3C2] dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    6. Autonomous PenTest &amp; ASPM
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#78716C] dark:text-zinc-400 shrink-0">
                    Trepath 2.0
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#292521] dark:text-zinc-100 leading-snug">
                    Trepath 2.0 — Penetration Testing
                  </h3>
                  <p className="text-[11px] text-[#57534E] dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    Autonomous penetration testing, multi-hop attack path discovery, exploit verification &amp; ASPM engine.
                  </p>
                </div>
              </div>
              <div className="pt-2.5 border-t border-[#E6DEC8] dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    fetchNoctisMarketplaceSalesAgent({
                      productId: 'prod_trepath_2_0',
                      question: 'Pitch Trepath 2.0 Autonomous Penetration Testing & Attack Path Engine (https://trepath-2-0.vercel.app) — explain how it works and why Red Teams use it.',
                      scrollToHub: true
                    })
                  }
                  className="text-[11px] font-semibold text-[#57534E] hover:text-[#292521] dark:text-zinc-400 dark:hover:text-zinc-200 hover:underline cursor-pointer"
                >
                  Ask Noctis
                </button>
                <a
                  href="https://trepath-2-0.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#FBF8F3' }}
                  className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] text-[#FBF8F3] px-3 py-1.5 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>Launch Trepath 2.0 ↗</span>
                </a>
              </div>
            </div>

            {/* Card 11: Standalone Penetration Testing & Red Team App */}
            <div className="rounded-xl border border-[#DDD3C2] dark:border-zinc-800 bg-[#FBF8F3] dark:bg-zinc-900 p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-[#7C4225]/50 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-md bg-[#EFE8DA] text-[#5E3119] border border-[#DDD3C2] dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    6. Standalone PenTest App
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#78716C] dark:text-zinc-400 shrink-0">
                    /app/?standalone=1
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#292521] dark:text-zinc-100 leading-snug">
                    Standalone PenTest &amp; Red Team App
                  </h3>
                  <p className="text-[11px] text-[#57534E] dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    Interactive standalone penetration testing console, live exploit sandbox &amp; red-team assessment terminal.
                  </p>
                </div>
              </div>
              <div className="pt-2.5 border-t border-[#E6DEC8] dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    fetchNoctisMarketplaceSalesAgent({
                      productId: 'prod_pentest_standalone_lab',
                      question: 'Pitch the Standalone Penetration Testing & Red Team App (https://dome-jerry-females-creations.trycloudflare.com/app/?standalone=1) — explain its capabilities and live sandbox.',
                      scrollToHub: true
                    })
                  }
                  className="text-[11px] font-semibold text-[#57534E] hover:text-[#292521] dark:text-zinc-400 dark:hover:text-zinc-200 hover:underline cursor-pointer"
                >
                  Ask Noctis
                </button>
                <a
                  href="https://dome-jerry-females-creations.trycloudflare.com/app/?standalone=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#FBF8F3' }}
                  className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] text-[#FBF8F3] px-3 py-1.5 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>Launch Standalone App ↗</span>
                </a>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Master Category Tabs (Wrapped cleanly into cards/pills so none are hidden off-screen) */}
        <div className="pt-3 border-t border-[#E6DEC8] dark:border-zinc-800 space-y-2.5">
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
                  style={isSelected ? { color: '#FBF8F3' } : undefined}
                  className={`rounded-xl px-3.5 py-2 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-[#7C4225] text-[#FBF8F3] font-bold shadow-xs"
                      : "bg-[#EFE8DA] dark:bg-zinc-800 text-[#292521] dark:text-zinc-300 hover:bg-[#E5DEC9] dark:hover:bg-zinc-700 border border-[#DDD3C2] dark:border-zinc-700/70"
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>

          {/* QUICK SOLUTIONS ACTION BAR (High-contrast & wrapped so nothing is hidden) */}
          <div className="pt-2.5 border-t border-[#E6DEC8] dark:border-zinc-800 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C4225] dark:text-amber-400 shrink-0 mr-1 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5" /> Outcome Blueprints:
            </span>
            {[
              { label: 'Secure my AWS cloud', id: 'sol_secure_aws' },
              { label: 'Achieve FedRAMP & cATO', id: 'sol_fedramp_cato' },
              { label: 'Autonomous PenTest & ASPM', id: 'sol_pentest_aspm' },
              { label: 'Deploy AI Securely (MCP)', id: 'sol_ai_security' },
              { label: 'Jobsite CAD & Total Station', id: 'sol_trades_cad_jobsite' },
              { label: 'Clinical Pharmacy, Nursing & Admin', id: 'sol_clinical_pharmacy_health' }
            ].map((sol) => {
              const isPillActive = selectedMainCategory === 'Solutions' && selectedSolution?.id === sol.id
              return (
                <button
                  key={sol.id}
                  type="button"
                  onClick={() => activateSolutionsHub(sol.id)}
                  style={isPillActive ? { color: '#FBF8F3' } : undefined}
                  className={`rounded-lg text-xs px-3 py-1.5 font-semibold transition-all border cursor-pointer ${
                    isPillActive
                      ? "bg-[#7C4225] text-[#FBF8F3] border-[#5E3119] font-bold shadow-xs"
                      : "bg-[#FBF8F3] dark:bg-zinc-900 hover:bg-[#EFE8DA] dark:hover:bg-zinc-800 text-[#5E3119] dark:text-zinc-200 border-[#DDD3C2] dark:border-zinc-700"
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
                      {sol.id === 'sol_pentest_aspm' && (
                        <div className="pt-1.5 flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                          <a
                            href="https://05-sast-platform.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[10px] font-bold shadow-2xs inline-flex items-center gap-1 transition-colors"
                          >
                            <span>🚀 Launch 05-SAST ↗</span>
                          </a>
                          <a
                            href="https://trepath-2-0.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white px-2.5 py-1 text-[10px] font-bold shadow-2xs inline-flex items-center gap-1 transition-colors"
                          >
                            <span>🎯 Launch Trepath 2.0 ↗</span>
                          </a>
                          <a
                            href="https://dome-jerry-females-creations.trycloudflare.com/app/?standalone=1"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-amber-700 hover:bg-amber-800 text-white px-2.5 py-1 text-[10px] font-bold shadow-2xs inline-flex items-center gap-1 transition-colors"
                          >
                            <span>🛡️ Launch Standalone PenTest App ↗</span>
                          </a>
                        </div>
                      )}
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{selectedSolution.icon}</span>
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                      {selectedSolution.title}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
                    <strong>Target Outcome:</strong> {selectedSolution.targetOutcome}
                  </p>
                  {selectedSolution.id === 'sol_pentest_aspm' && (
                    <div className="pt-1 flex items-center gap-2.5 flex-wrap">
                      <a
                        href="https://05-sast-platform.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-extrabold shadow-xs inline-flex items-center gap-1.5 transition-colors"
                      >
                        <span>🚀 Launch 05-SAST Platform (05-sast-platform.vercel.app) ↗</span>
                      </a>
                      <a
                        href="https://trepath-2-0.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white px-3.5 py-2 text-xs font-extrabold shadow-xs inline-flex items-center gap-1.5 transition-colors"
                      >
                        <span>🎯 Launch Trepath 2.0 PenTest (trepath-2-0.vercel.app) ↗</span>
                      </a>
                      <a
                        href="https://dome-jerry-females-creations.trycloudflare.com/app/?standalone=1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-2 text-xs font-extrabold shadow-xs inline-flex items-center gap-1.5 transition-colors"
                      >
                        <span>🛡️ Launch Standalone PenTest App (/app/?standalone=1) ↗</span>
                      </a>
                    </div>
                  )}
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
          <div className="rounded-2xl border border-[#DDD3C2] dark:border-zinc-800 bg-[#FBF8F3] dark:bg-zinc-900 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6DEC8] dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C4225] dark:text-amber-300">
                  Structured Marketplace Taxonomy
                </span>
                <h3 className="text-sm sm:text-base font-bold text-[#292521] dark:text-zinc-100">
                  Browse Featured Platforms by Category
                </h3>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'All', label: 'All Categories' },
                  { id: 'Compliance_RMF', label: 'Federal Compliance & RMF' },
                  { id: 'DAST_Offensive', label: 'DAST & Web Security' },
                  { id: 'Cyber_Prediction', label: 'Cyber Defense & Prediction' },
                  { id: 'Productivity_Notes', label: 'Productivity & Field Notes' },
                  { id: 'Portals_Launchpads', label: 'Enterprise Portals & Launchpads' }
                ].map((catFilter) => {
                  const isActive = selectedSubCategory === catFilter.id
                  return (
                    <button
                      key={catFilter.id}
                      type="button"
                      onClick={() => setSelectedSubCategory(catFilter.id)}
                      style={isActive ? { color: '#FBF8F3' } : undefined}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#7C4225] text-[#FBF8F3] shadow-xs"
                          : "bg-[#EFE8DA] dark:bg-zinc-800 text-[#57534E] dark:text-zinc-300 hover:bg-[#E5DEC9] dark:hover:bg-zinc-700"
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
                    ? "border-[#7C4225] bg-[#F5EFE4] dark:bg-zinc-800 ring-1 ring-[#7C4225]/30"
                    : "border-[#DDD3C2] dark:border-zinc-800 bg-white/70 dark:bg-zinc-800/40 hover:border-[#7C4225]/50"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-[#EFE8DA] text-[#5E3119] border border-[#DDD3C2] dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 text-[9px] font-bold uppercase">
                      DoDI 8510.01 · NISP
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#292521] dark:text-zinc-100">
                    1. Federal Compliance &amp; DoD RMF
                  </h4>
                  <p className="text-[11px] text-[#57534E] dark:text-zinc-400 leading-snug">
                    Aagiis DoD RMF, DCSA NISP (32 CFR Part 117), DISA STIG &amp; cATO governance.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E6DEC8] dark:border-zinc-700/60 flex flex-col gap-1">
                  <a
                    href="https://aagiis.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-bold text-[#7C4225] dark:text-amber-300 hover:underline flex items-center justify-between"
                  >
                    <span>Aagiis Platform</span>
                    <span>aagiis.com ↗</span>
                  </a>
                </div>
              </div>

              {/* Category 2: DAST & Web Interface Security */}
              <div
                onClick={() => setSelectedSubCategory(selectedSubCategory === 'DAST_Offensive' ? 'All' : 'DAST_Offensive')}
                className={`rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  selectedSubCategory === 'DAST_Offensive'
                    ? "border-[#7C4225] bg-[#F5EFE4] dark:bg-zinc-800 ring-1 ring-[#7C4225]/30"
                    : "border-[#DDD3C2] dark:border-zinc-800 bg-white/70 dark:bg-zinc-800/40 hover:border-[#7C4225]/50"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-[#EFE8DA] text-[#5E3119] border border-[#DDD3C2] dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 text-[9px] font-bold uppercase">
                      XTRIKE &amp; Aegis.SOC
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#292521] dark:text-zinc-100">
                    2. DAST &amp; Web Security
                  </h4>
                  <p className="text-[11px] text-[#57534E] dark:text-zinc-400 leading-snug">
                    EXPEDITE STRIKE™ Live DAST Engine (/engine) &amp; Vulnerability Scanner.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E6DEC8] dark:border-zinc-700/60 flex flex-col gap-1">
                  <a
                    href="https://11-dast-security-platform.vercel.app/engine"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-bold text-[#7C4225] dark:text-amber-300 hover:underline flex items-center justify-between"
                  >
                    <span>DAST Engine</span>
                    <span>/engine ↗</span>
                  </a>
                  <a
                    href="https://11-dast-security-platform.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-semibold text-[#57534E] dark:text-zinc-300 hover:underline flex items-center justify-between"
                  >
                    <span>Main Landing</span>
                    <span>Platform ↗</span>
                  </a>
                </div>
              </div>

              {/* Category 3: Cyber Defense & Threat Prediction */}
              <div
                onClick={() => setSelectedSubCategory(selectedSubCategory === 'Cyber_Prediction' ? 'All' : 'Cyber_Prediction')}
                className={`rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  selectedSubCategory === 'Cyber_Prediction'
                    ? "border-[#7C4225] bg-[#F5EFE4] dark:bg-zinc-800 ring-1 ring-[#7C4225]/30"
                    : "border-[#DDD3C2] dark:border-zinc-800 bg-white/70 dark:bg-zinc-800/40 hover:border-[#7C4225]/50"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-[#EFE8DA] text-[#5E3119] border border-[#DDD3C2] dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 text-[9px] font-bold uppercase">
                      DSTRIKE &amp; Noctis
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#292521] dark:text-zinc-100">
                    3. Cyber Defense &amp; Prediction
                  </h4>
                  <p className="text-[11px] text-[#57534E] dark:text-zinc-400 leading-snug">
                    DSTRIKE Autonomous Cyber Defense &amp; Noctis Threat Prediction Desk.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E6DEC8] dark:border-zinc-700/60 flex flex-col gap-1">
                  <a
                    href="https://dstrike.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-bold text-[#7C4225] dark:text-amber-300 hover:underline flex items-center justify-between"
                  >
                    <span>Main App</span>
                    <span>dstrike.app ↗</span>
                  </a>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      fetchNoctisMarketplaceSalesAgent({
                        productId: 'prod_dstrike_noctis_platform',
                        question: 'Pitch DSTRIKE Threat Prediction — explain how it works and why CISOs buy it.',
                        scrollToHub: true
                      })
                    }}
                    className="text-[11px] font-semibold text-[#57534E] dark:text-zinc-300 hover:underline flex items-center justify-between cursor-pointer text-left"
                  >
                    <span>Ask Noctis</span>
                    <span>In-App Pitch →</span>
                  </button>
                </div>
              </div>

              {/* Category 4: Productivity, Field Notes & Document Tools */}
              <div
                onClick={() => setSelectedSubCategory(selectedSubCategory === 'Productivity_Notes' ? 'All' : 'Productivity_Notes')}
                className={`rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  selectedSubCategory === 'Productivity_Notes'
                    ? "border-[#7C4225] bg-[#F5EFE4] dark:bg-zinc-800 ring-1 ring-[#7C4225]/30"
                    : "border-[#DDD3C2] dark:border-zinc-800 bg-white/70 dark:bg-zinc-800/40 hover:border-[#7C4225]/50"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-[#EFE8DA] text-[#5E3119] border border-[#DDD3C2] dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 text-[9px] font-bold uppercase">
                      E2EE Workspace
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#292521] dark:text-zinc-100">
                    4. Productivity &amp; Field Notes
                  </h4>
                  <p className="text-[11px] text-[#57534E] dark:text-zinc-400 leading-snug">
                    DeskNote E2EE digital notebook, voice logs &amp; PDFAdore utilities.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E6DEC8] dark:border-zinc-700/60 flex flex-col gap-1">
                  <a
                    href="https://desk-note-lime.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-bold text-[#7C4225] dark:text-amber-300 hover:underline flex items-center justify-between"
                  >
                    <span>DeskNote Live</span>
                    <span>desk-note ↗</span>
                  </a>
                  <a
                    href="https://www.pdfadore.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-semibold text-[#57534E] dark:text-zinc-300 hover:underline flex items-center justify-between"
                  >
                    <span>PDFAdore</span>
                    <span>pdfadore.com ↗</span>
                  </a>
                </div>
              </div>

              {/* Category 5: Enterprise Portals & Production Launchpads */}
              <div
                onClick={() => setSelectedSubCategory(selectedSubCategory === 'Portals_Launchpads' ? 'All' : 'Portals_Launchpads')}
                className={`rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  selectedSubCategory === 'Portals_Launchpads'
                    ? "border-[#7C4225] bg-[#F5EFE4] dark:bg-zinc-800 ring-1 ring-[#7C4225]/30"
                    : "border-[#DDD3C2] dark:border-zinc-800 bg-white/70 dark:bg-zinc-800/40 hover:border-[#7C4225]/50"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-[#EFE8DA] text-[#5E3119] border border-[#DDD3C2] dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 text-[9px] font-bold uppercase">
                      Official Flagship
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#292521] dark:text-zinc-100">
                    5. Portals &amp; Launchpads
                  </h4>
                  <p className="text-[11px] text-[#57534E] dark:text-zinc-400 leading-snug">
                    Expedite Consults Official Portal &amp; Sphera Live Production Launchpad.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E6DEC8] dark:border-zinc-700/60 flex flex-col gap-1">
                  <a
                    href="https://www.expediteconsults.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-bold text-[#7C4225] dark:text-amber-300 hover:underline flex items-center justify-between"
                  >
                    <span>Expedite Consults</span>
                    <span>Official ↗</span>
                  </a>
                  <a
                    href="https://sphera-portal.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-semibold text-[#57534E] dark:text-zinc-300 hover:underline flex items-center justify-between"
                  >
                    <span>Sphera Launchpad</span>
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
                className="rounded-2xl border border-[#DDD3C2] bg-[#FBF8F3] p-5 shadow-xs hover:border-[#7C4225]/60 hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Top Badges Strip */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="rounded-md bg-[#EFE8DA] dark:bg-zinc-800 text-[#5E3119] dark:text-zinc-300 border border-[#DDD3C2] dark:border-zinc-700 px-2 py-0.5 text-[10px] font-bold">
                        {product.category} · {product.subCategory}
                      </span>
                      {product.isVercelLive && (
                        <span className="rounded-md bg-[#F3EDE2] text-[#78716C] dark:bg-zinc-800 dark:text-zinc-400 border border-[#DDD3C2] dark:border-zinc-700 px-2 py-0.5 text-[10px] font-mono font-bold">
                          LIVE
                        </span>
                      )}
                    </div>

                    {product.badge && (
                      <span className="rounded-full bg-[#EFE8DA] px-2 py-0.5 text-[10px] font-bold text-[#5E3119] border border-[#DDD3C2] dark:bg-zinc-800 dark:text-zinc-300 shrink-0">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{product.icon}</span>
                      <div>
                        <h4 className="font-bold text-base text-[#292521] dark:text-zinc-100 leading-tight">
                          {product.name}
                        </h4>
                        <p className="text-xs text-[#78716C] flex items-center gap-1 mt-0.5">
                          <span>{product.vendor.name}</span>
                          {product.vendor.isVerified && (
                            <ShieldCheck className="h-3 w-3 text-[#7C4225]" />
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#57534E] dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {product.tagline}
                  </p>

                  {/* Architecture & Compliance tags */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {product.architecture?.latency && (
                      <span className="text-[10px] text-[#78716C] font-mono bg-[#F3EDE2] dark:bg-zinc-800 px-2 py-0.5 rounded border border-[#DDD3C2] dark:border-zinc-750">
                        {product.architecture.latency}
                      </span>
                    )}
                    {product.security?.compliance?.slice(0, 2).map((comp, idx) => (
                      <span key={idx} className="text-[10px] text-[#57534E] dark:text-zinc-400 font-semibold bg-[#F3EDE2] dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-[#DDD3C2] dark:border-zinc-750">
                        {comp}
                      </span>
                    ))}
                  </div>

                  {/* Pricing and Rating */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-[#292521] dark:text-zinc-100">
                      {product.pricing.displayPrice} <span className="text-[10px] font-normal text-[#78716C]">{product.pricing.billingPeriod}</span>
                    </span>
                    <span className="text-[#7C4225] dark:text-amber-400 font-bold">
                      ★ {product.rating} ({product.reviewsCount})
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E6DEC8] dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        setSelectedProduct(product)
                        setActiveProductTab('overview')
                      }}
                      className="text-xs font-bold text-[#7C4225] hover:underline cursor-pointer"
                    >
                      View Details →
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(product)
                        setActiveProductTab('noctis_sales')
                        fetchNoctisMarketplaceSalesAgent({
                          productId: product.id,
                          question: `Give a full marketing and sales deep-dive on ${product.name}: everything it has, what it does, architecture, ROI, and pricing.`
                        })
                      }}
                      className="rounded-lg bg-[#EFE8DA] hover:bg-[#E5DEC9] text-[#5E3119] border border-[#DDD3C2] px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                      title={`Ask Noctis AI Sales Agent to pitch and explain ${product.name}`}
                    >
                      <span>Ask Noctis</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {product.liveUrl && !product.liveUrl.includes('/noctis') && (
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
                        style={{ color: '#FBF8F3' }}
                        className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] text-[#FBF8F3] px-3 py-1.5 text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        title={product.liveUrl}
                      >
                        <span>Launch Live ↗</span>
                      </button>
                    )}

                    {product.demoUrl &&
                      product.demoUrl !== product.liveUrl &&
                      product.demoUrl.startsWith('http') &&
                      !product.demoUrl.includes('/noctis') && (
                      <a
                        href={product.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-[#EFE8DA] hover:bg-[#E5DEC9] text-[#5E3119] border border-[#DDD3C2] px-3 py-1.5 text-xs font-bold shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                        title={product.demoUrl}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>
                          {product.demoUrl.includes('/engine')
                            ? 'DAST Engine ↗'
                            : product.demoUrl.includes('sphera-portal')
                            ? 'Sphera Launchpad ↗'
                            : 'Companion URL ↗'}
                        </span>
                      </a>
                    )}

                    <button
                      onClick={() => handleGenerateLicense(product, 'trial')}
                      className="rounded-lg bg-[#292521] hover:bg-[#1C1917] text-[#FBF8F3] px-3 py-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer"
                      style={{ color: '#FBF8F3' }}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          {selectedProduct && (
            <div className="space-y-5 min-w-0">
              <DialogHeader>
                <div className="flex items-start justify-between gap-4 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-4xl shrink-0">{selectedProduct.icon}</span>
                    <div className="min-w-0">
                      <DialogTitle className="text-xl font-black text-zinc-900 dark:text-zinc-100 break-words">
                        {selectedProduct.name}
                      </DialogTitle>
                      <p className="text-xs text-zinc-500">
                        {selectedProduct.vendor.name} · {selectedProduct.category}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
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
              <div className="flex items-center gap-1.5 flex-wrap border-b border-zinc-200 pb-2 text-xs dark:border-zinc-800">
                {[
                  { id: 'overview', label: 'overview' },
                  { id: 'noctis_sales', label: '✨ Ask Noctis Sales Agent' },
                  { id: 'features', label: 'features' },
                  { id: 'architecture', label: 'architecture' },
                  { id: 'pricing', label: 'pricing' },
                  { id: 'reviews', label: 'reviews' },
                  { id: 'support', label: 'support' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveProductTab(tab.id as any)
                      if (tab.id === 'noctis_sales' && selectedProduct) {
                        fetchNoctisMarketplaceSalesAgent({
                          productId: selectedProduct.id,
                          question: `Give a full marketing and sales deep-dive on ${selectedProduct.name}.`
                        })
                      }
                    }}
                    className={`rounded-lg px-3 py-1.5 font-bold capitalize transition-colors cursor-pointer ${
                      activeProductTab === tab.id
                        ? "bg-[#0A66C2] text-white"
                        : tab.id === 'noctis_sales'
                        ? "bg-[#E8F0FE] text-[#1967D2] hover:bg-[#D2E3FC] border border-[#1967D2]/30"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Noctis Sales Agent Tab inside Product Modal */}
              {activeProductTab === 'noctis_sales' && (
                <div className="rounded-2xl border border-[#D3E3FD] bg-[#F8FAFD] p-4 space-y-3.5 text-slate-900 min-w-0 overflow-x-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/70 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-md bg-[#1967D2] text-white px-2.5 py-0.5 text-[11px] font-extrabold">
                        ✨ Noctis AI Sales Specialist
                      </span>
                      <span className="text-xs font-bold text-slate-600">
                        Deep-Dive Product Pitch &amp; Technical Consultation
                      </span>
                    </div>
                    <span className="text-[11px] font-extrabold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full">
                      🔮 Noctis In-App Sales Agent
                    </span>
                  </div>

                  {/* Quick 3-Card Executive Snapshot for this Product */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="rounded-xl bg-white border border-blue-100 p-3 space-y-1">
                      <div className="font-extrabold text-[#1967D2]">⚙️ What It Does</div>
                      <p className="text-slate-700 leading-snug line-clamp-3">
                        {selectedProduct.tagline} — {selectedProduct.overview}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white border border-blue-100 p-3 space-y-1">
                      <div className="font-extrabold text-indigo-800">🔒 Architecture &amp; Trust</div>
                      <p className="text-slate-700 leading-snug">
                        {selectedProduct.architecture.title} ({selectedProduct.architecture.latency}) ·{' '}
                        {(selectedProduct.security.compliance || []).join(', ') || 'Enterprise Verified'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white border border-blue-100 p-3 space-y-1">
                      <div className="font-extrabold text-emerald-800">💳 Commercial Offer</div>
                      <p className="text-slate-700 leading-snug">
                        <strong>{selectedProduct.pricing.displayPrice}</strong> ({selectedProduct.pricing.billingPeriod})
                        {selectedProduct.pricing.hasFreeTrial
                          ? ` · ${selectedProduct.pricing.trialDays || 14}-Day Free Trial Available`
                          : ''}
                      </p>
                    </div>
                  </div>

                  {/* Clean Formatted Noctis Sales Response Box (no horizontal scrollbar, no raw markdown clutter) */}
                  <div className="rounded-xl bg-white border border-blue-100 p-4 text-xs sm:text-sm text-slate-800 whitespace-pre-line break-words overflow-x-hidden leading-relaxed max-h-72 overflow-y-auto">
                    {isNoctisSalesLoading
                      ? `✨ Noctis is preparing your customized executive sales & technical deep-dive for ${selectedProduct.name}...`
                      : (noctisActivePitch?.productId === selectedProduct.id &&
                        noctisActivePitch.liveNoctisSalesResponse
                          ? noctisActivePitch.liveNoctisSalesResponse
                          : `✨ Noctis AI Sales & Product Specialist — Executive Deep-Dive on ${selectedProduct.name}\n\n` +
                            `1. Why ${selectedProduct.name} Stands Out:\n` +
                            `${selectedProduct.tagline} Built by ${selectedProduct.vendor.name} for ${selectedProduct.category} (${selectedProduct.subCategory}).\n\n` +
                            `2. Everything ${selectedProduct.name} Has & Does:\n` +
                            `${selectedProduct.overview}\n` +
                            selectedProduct.features.map((f) => `  • ${f.title}: ${f.desc}`).join('\n') +
                            `\n\n3. Architecture, Security & Pricing:\n` +
                            `  • Architecture: ${selectedProduct.architecture.title} (${selectedProduct.architecture.latency})\n` +
                            `  • Compliance: ${(selectedProduct.security.compliance || []).join(' · ') || 'Enterprise Grade'}\n` +
                            `  • Pricing: ${selectedProduct.pricing.displayPrice} (${selectedProduct.pricing.billingPeriod})`
                        )
                          .replace(/```noctis-dashboard[\s\S]*?```/gi, '')
                          .replace(/\*\*/g, '')
                          .replace(/^#{1,4}\s+/gm, '')}
                  </div>

                  {/* Interactive Question Input for THIS Product */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (!noctisProductFollowUpInput.trim()) return
                      fetchNoctisMarketplaceSalesAgent({
                        productId: selectedProduct.id,
                        question: noctisProductFollowUpInput.trim()
                      })
                    }}
                    className="flex flex-col sm:flex-row gap-2 min-w-0"
                  >
                    <input
                      type="text"
                      value={noctisProductFollowUpInput}
                      onChange={(e) => setNoctisProductFollowUpInput(e.target.value)}
                      placeholder={`Ask Noctis anything about ${selectedProduct.name} (ROI, compliance, integration, pricing)...`}
                      className="flex-1 min-w-0 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#0A66C2] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isNoctisSalesLoading || !noctisProductFollowUpInput.trim()}
                      className="rounded-xl bg-[#1967D2] hover:bg-[#1557B0] disabled:bg-slate-300 px-4 py-2 text-xs font-extrabold text-white cursor-pointer shrink-0"
                    >
                      {isNoctisSalesLoading ? "Asking Noctis..." : "Ask Noctis →"}
                    </button>
                  </form>

                  {/* 2-Column Wrapped Prompt Grid so long product names never get cut off */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      `Why should our organization buy ${selectedProduct.name} over competitors?`,
                      `Write a 3-paragraph executive purchase justification for ${selectedProduct.name}`,
                      `Explain the architecture, latency, and security compliance of ${selectedProduct.name}`,
                      `What is included in the pricing tiers and free trial for ${selectedProduct.name}?`
                    ].map((qChip) => (
                      <button
                        key={qChip}
                        type="button"
                        onClick={() => {
                          setNoctisProductFollowUpInput(qChip)
                          fetchNoctisMarketplaceSalesAgent({
                            productId: selectedProduct.id,
                            question: qChip
                          })
                        }}
                        className="rounded-xl bg-white hover:bg-blue-50 text-[#0A66C2] border border-blue-200 px-3 py-2 text-[11px] font-bold cursor-pointer text-left whitespace-normal break-words leading-snug transition-colors"
                      >
                        ✨ {qChip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                  {selectedProduct.liveUrl && !selectedProduct.liveUrl.includes('/noctis') && (
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

