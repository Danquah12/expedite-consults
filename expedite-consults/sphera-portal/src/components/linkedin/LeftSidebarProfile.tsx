"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  Bookmark,
  Users,
  Hash,
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
  TrendingUp,
  Award,
  FolderKanban,
  ShoppingBag,
  Briefcase,
  GraduationCap,
  Star,
  DollarSign,
  BarChart3,
  Sparkles,
  ShieldCheck,
  Flame,
  ExternalLink,
  SlidersHorizontal,
  Pin,
  Check
} from "lucide-react"
import { UserProfile } from "@/lib/linkedin-data"
import { isSuperAdminUser } from "@/lib/connectin-profile"
import { findEnclaveById, ALL_PROFESSIONS, ProfessionDefinition } from "@/lib/connectin-professions"
import { useLanguage } from "@/context/LanguageContext"
import { TradeEnclaveWidgets } from "@/components/linkedin/TradeEnclaveWidgets"

interface LeftSidebarProfileProps {
  user: UserProfile
  onViewProfile: () => void
  onSelectTag: (tag: string) => void
  onNavigateTab?: (tab: string) => void
  onOpenIDModal?: () => void
  onOpenInboundBountiesModal?: () => void
  onOpenAuthModal?: () => void
  onOpenAnalytics?: (tab: 'viewers' | 'reach' | 'discoveries') => void
}

export function LeftSidebarProfile({
  user,
  onViewProfile,
  onSelectTag,
  onNavigateTab,
  onOpenIDModal,
  onOpenInboundBountiesModal,
  onOpenAuthModal,
  onOpenAnalytics
}: LeftSidebarProfileProps) {
  const [isRecentExpanded, setIsRecentExpanded] = useState(true)
  const [isAllToolsExpanded, setIsAllToolsExpanded] = useState(false)
  const [isCustomizingCenter, setIsCustomizingCenter] = useState(false)
  const [customProfessionId, setCustomProfessionId] = useState<string>("")
  const [pinnedIds, setPinnedIds] = useState<string[]>([])
  const [professionFilterQuery, setProfessionFilterQuery] = useState("")
  const { t } = useLanguage()

  const isAdminUser = isSuperAdminUser(user)
  const userStorageKey = `connectin_cmd_center_${(user.email || user.name || 'default').toLowerCase().replace(/[^a-z0-9]/g, '_')}`

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const savedProf = localStorage.getItem(`${userStorageKey}_prof`)
      const savedPins = localStorage.getItem(`${userStorageKey}_pins`)
      if (savedProf) setCustomProfessionId(savedProf)
      else setCustomProfessionId("")
      if (savedPins) setPinnedIds(JSON.parse(savedPins))
      else setPinnedIds([])
    } catch {}
  }, [userStorageKey, user.profession])

  // Match the logged-in user's individual profession to a specific ProfessionDefinition
  const matchedProfession: ProfessionDefinition | undefined = useMemo(() => {
    if (customProfessionId) {
      const found = ALL_PROFESSIONS.find(p => p.id === customProfessionId)
      if (found) return found
    }
    const rawProf = (user.profession || "").trim().toLowerCase()
    const rawHeadline = (user.headline || "").trim().toLowerCase()

    if (rawProf) {
      // 1. Exact ID or title match
      const exact = ALL_PROFESSIONS.find(
        p => p.id.toLowerCase() === rawProf || p.title.toLowerCase() === rawProf
      )
      if (exact) return exact

      // 2. Substring match on title
      const sub = ALL_PROFESSIONS.find(
        p => p.title.toLowerCase().includes(rawProf) || rawProf.includes(p.id.replace(/_/g, ' '))
      )
      if (sub) return sub
    }

    // 3. Keyword overlap scoring across title + typicalSkills + categoryName
    const searchTokens = `${rawProf} ${rawHeadline}`
      .split(/[^a-z0-9]+/)
      .filter(tok => tok.length >= 3 && !['and', 'the', 'for', 'senior', 'lead', 'master', 'certified', 'verified', 'specialist'].includes(tok))

    const candidatePool = user.professionEnclave
      ? ALL_PROFESSIONS.filter(p => p.enclaveId === user.professionEnclave)
      : ALL_PROFESSIONS

    let bestMatch: ProfessionDefinition | undefined = candidatePool[0]
    let bestScore = -1
    for (const prof of candidatePool) {
      const haystack = `${prof.id} ${prof.title} ${prof.categoryName} ${prof.typicalSkills.join(' ')}`.toLowerCase()
      let score = 0
      for (const tok of searchTokens) {
        if (haystack.includes(tok)) score += 2
      }
      if (score > bestScore) {
        bestScore = score
        bestMatch = prof
      }
    }
    return bestMatch
  }, [customProfessionId, user.profession, user.headline, user.professionEnclave])

  const effectiveEnclaveId = matchedProfession?.enclaveId || user.professionEnclave || (isAdminUser ? 'law_gov_defense' : 'trades_construction')
  const enclaveInfo = findEnclaveById(effectiveEnclaveId)
  const displayProfessionTitle = matchedProfession?.title || user.profession || 'Verified Specialist'

  // Enclave-Segregated Command Center Workspace Tools (Strict Need-to-Know)
  const getShortcutsForEnclave = () => {
    const adminShortcuts = isAdminUser ? [
      { id: 'adminiam', label: '🛡️ Admin IAM Console', badge: 'Privileged', isCore: true },
      { id: 'auth_gate', label: '🔑 Switch Persona / Role', badge: 'Enclaves', isCore: true }
    ] : []

    if (effectiveEnclaveId === 'trades_construction') {
      return [
        ...adminShortcuts,
        { id: 'skillhands', label: '🛠️ SkillHands Trade Hub', badge: 'Live App', url: 'https://skillhands-client.vercel.app' },
        { id: 'desknote', label: '📓 DeskNote Field Notebook', badge: 'Live App', url: 'https://desk-note-lime.vercel.app/' },
        { id: 'vibetok_trades', label: '🎥 VibeTok Trade Videos', badge: 'Live Hub', url: 'https://vibetok-learning-hub.vercel.app' },
        { id: 'bazaar_trades', label: '🛍️ Bazaar Trade Market', badge: 'Commerce', url: 'https://bazaar-standalone.vercel.app' },
        { id: 'blueprints', label: '📐 Blueprint & CAD Specs', badge: 'Active' },
        { id: 'joinery_calc', label: '🪚 Compound Miter & Joinery Calc', badge: 'Precision' },
        { id: 'lumber_index', label: '🌲 Lumber Market Futures', badge: 'Live Data' },
        { id: 'subcontractor_rfp', label: '📋 Subcontractor Job Board', badge: '8 Bids' },
        { id: 'osha_locker', label: '🦺 OSHA Safety & Toolbox Talks', badge: 'OSHA 30' },
        { id: 'wallet', label: '💳 Trade Escrow & Draws', badge: '$18,400' },
        { id: 'guilds', label: '🔨 Master Craftsman Guild', badge: 'Active' },
        { id: 'jobs', label: '💼 Subcontractor Bids', badge: '4 Status' },
        { id: 'accountsecurity', label: '🔐 Safety & FIDO2 Identity', badge: 'FIDO2' }
      ]
    }

    if (effectiveEnclaveId === 'automotive_mechanics') {
      return [
        ...adminShortcuts,
        { id: 'desknote_auto', label: '📓 DeskNote Diagnostic Logs', badge: 'Live App', url: 'https://desk-note-lime.vercel.app/' },
        { id: 'skillhands_auto', label: '🛠️ SkillHands Auto Techs', badge: 'Live App', url: 'https://skillhands-client.vercel.app' },
        { id: 'vibetok_auto', label: '🎥 VibeTok Auto Masterclasses', badge: 'Live Hub', url: 'https://vibetok-learning-hub.vercel.app' },
        { id: 'diagnostic_scanner', label: '📟 Snap-On ZEUS+ Diagnostic Hub', badge: 'CAN-FD' },
        { id: 'can_oscilloscope', label: '⚡ OBD-II PicoScope & Bus Waveforms', badge: '4-Channel' },
        { id: 'oem_wiring', label: '📋 Mitchell 1 & ALLDATA Schematics', badge: 'ProDemand' },
        { id: 'ev_lockout', label: '🔋 800V High-Voltage LOTO Protocol', badge: 'NFPA 70E' },
        { id: 'fmcsa_fleet', label: '🚛 Cummins & Detroit Diesel Fleet Log', badge: 'FMCSA DOT' },
        { id: 'guilds', label: '🔧 ASE Master Technicians Guild', badge: 'L1 Advanced' },
        { id: 'wallet', label: '💳 Shop ROs & Flat-Rate Draws', badge: '$12,850' },
        { id: 'accountsecurity', label: '🔐 Shop Lockout & FIDO2 Auth', badge: 'FIDO2' }
      ]
    }

    if (effectiveEnclaveId === 'healthcare_medicine') {
      return [
        ...adminShortcuts,
        { id: 'vibetok_med', label: '🎥 VibeTok Grand Rounds Video', badge: 'Live Hub', url: 'https://vibetok-learning-hub.vercel.app' },
        { id: 'desknote_med', label: '📓 DeskNote Clinical Notes', badge: 'Live App', url: 'https://desk-note-lime.vercel.app/' },
        { id: 'esi_trauma', label: '🩺 Level 1 Trauma Triage & ESI', badge: 'TNCC Ready' },
        { id: 'surgical_roster', label: '🔪 OR Schedule & Instrument Packs', badge: 'OR Suite' },
        { id: 'shifts', label: '🕒 Nurse Shift & Locum Exchange', badge: 'Hospital' },
        { id: 'hipaa_consults', label: '🏥 HIPAA Encrypted Consults', badge: 'BAA Verified' },
        { id: 'protocols', label: '📋 Critical Care ICU Protocols', badge: 'Evidence' },
        { id: 'clinical_trials', label: '📑 Clinical Trials & PubMed', badge: 'PubMed' },
        { id: 'guilds', label: '🩺 Nursing & Medical Staff Guild', badge: 'Active' },
        { id: 'wallet', label: '💳 Locum Tenens Disbursements', badge: '$14,200' },
        { id: 'accountsecurity', label: '🔐 HIPAA FIDO2 Passkeys', badge: 'Compliant' }
      ]
    }

    if (effectiveEnclaveId === 'tech_cybersecurity') {
      return [
        ...adminShortcuts,
        { id: 'aagiis_rmf', label: '🛡️ Aagiis — DoD RMF & DCSA NISP', badge: 'DoDI 8510.01', url: 'https://aagiis.com/' },
        { id: 'expedite_strike_engine', label: '🎯 EXPEDITE STRIKE™ DAST Engine', badge: '/engine', url: 'https://11-dast-security-platform.vercel.app/engine' },
        { id: 'dast_platform', label: '🌐 11-DAST Platform Landing', badge: 'Landing', url: 'https://11-dast-security-platform.vercel.app' },
        { id: 'dstrike_main', label: '⚡ DSTRIKE Main App', badge: 'dstrike.app', url: 'https://dstrike.app' },
        { id: 'dstrike_noctis', label: '🔮 DSTRIKE Prediction Desk', badge: '/noctis', url: 'https://dstrike.app/noctis' },
        { id: 'expedite_official', label: '🏛️ Expedite Consults Official', badge: 'Portal', url: 'https://www.expediteconsults.com' },
        { id: 'sphera_launchpad', label: '🚀 Sphera Production Launchpad', badge: 'Launchpad', url: 'https://sphera-portal.vercel.app' },
        { id: 'desknote_cyber', label: '📓 DeskNote Pentest Notebook', badge: 'Live App', url: 'https://desk-note-lime.vercel.app/' },
        { id: 'exploit_platform', label: '🕸️ 14-Exploitability Attack Graph', badge: 'Live Graph', url: 'https://14-exploitability-platform.vercel.app' },
        { id: 'malware_platform', label: '🔬 16-Malware Analysis Sandbox', badge: 'Live Sandbox', url: 'https://16-malware-analysis-platform.vercel.app' },
        { id: 'ransomware_platform', label: '☣️ 17-Ransomware Recovery Console', badge: 'Live Recovery', url: 'https://17-ransomware-recovery-platform.vercel.app' },
        { id: 'cloud_cspm', label: '☁️ 19-Cloud Security CSPM', badge: 'Live CSPM', url: 'https://19-cloud-security-platform.vercel.app' },
        { id: 'careerorbit_cyber', label: '🪐 CareerOrbit Cyber Passport', badge: 'Live Orbit', url: 'https://careerorbit-standalone.vercel.app' },
        { id: 'vibetok_cyber', label: '🎥 VibeTok Cyber Labs', badge: 'Live Hub', url: 'https://vibetok-learning-hub.vercel.app' },
        { id: 'bounties', label: '🏆 High-Severity Bug Bounties', badge: '$25K-$50K' },
        { id: 'guilds', label: '🛡️ OSCP/CRTO Red Team Guild', badge: 'Classified' },
        { id: 'wallet', label: '💳 Bounty Escrow & Retainers', badge: '$38,500' },
        { id: 'accountsecurity', label: '🔐 Hardware FIDO2 / YubiKey CAC', badge: 'Strict' }
      ]
    }

    if (effectiveEnclaveId === 'law_gov_defense') {
      return [
        ...adminShortcuts,
        { id: 'aegis_rmf', label: '🛡️ Aagiis — DoD RMF & DCSA NISP', badge: 'DoDI 8510.01', url: 'https://aagiis.com/' },
        { id: 'expedite_strike_gov', label: '🎯 EXPEDITE STRIKE™ DAST Engine', badge: '/engine', url: 'https://11-dast-security-platform.vercel.app/engine' },
        { id: 'dstrike_gov', label: '⚡ DSTRIKE & Noctis Desk', badge: 'dstrike.app', url: 'https://dstrike.app/noctis' },
        { id: 'expedite_advisory', label: '🏛️ Expedite Consults Official', badge: 'Advisory', url: 'https://www.expediteconsults.com' },
        { id: 'sphera_gov', label: '🚀 Sphera Production Launchpad', badge: 'Launchpad', url: 'https://sphera-portal.vercel.app' },
        { id: 'threat_modeling', label: '📐 15-Threat Modeling Suite', badge: 'Live STRIDE', url: 'https://15-threat-modeling-platform.vercel.app' },
        { id: 'secrets_vault', label: '🔐 07-Secrets Detection Platform', badge: 'Live Secrets', url: 'https://07-secrets-platform.vercel.app' },
        { id: 'sam_gov', label: '🏛️ Federal SAM.gov RFP Feed', badge: 'SAM.gov' },
        { id: 'cmmc_audit', label: '🛡️ CMMC 2.0 Audit Workspace', badge: 'Level 3' },
        { id: 'procurement', label: '🏢 Defense Procurement', badge: '$2.4M Spend' },
        { id: 'guilds', label: '⚖️ Cleared Counsel Enclave', badge: 'TS/SCI' },
        { id: 'wallet', label: '💳 Retainers & Escrow', badge: '$45,000' },
        { id: 'accountsecurity', label: '🔐 Top Secret CAC / Passkeys', badge: 'FIDO2' }
      ]
    }

    if (effectiveEnclaveId === 'finance_accounting') {
      return [
        ...adminShortcuts,
        { id: 'dstrike_fin', label: '🔮 DSTRIKE Noctis Prediction Desk', badge: '/noctis', url: 'https://dstrike.app/noctis' },
        { id: 'desknote_fin', label: '📓 DeskNote Audit & Ledger Notes', badge: 'Live App', url: 'https://desk-note-lime.vercel.app/' },
        { id: 'gaap_ledger', label: '📑 GAAP Ledger Reconciler', badge: 'GAAP Ready' },
        { id: 'dcf_engine', label: '📈 Valuation DCF Engine', badge: 'Realtime' },
        { id: 'edgar_feed', label: '🏛️ SEC EDGAR 10-K Stream', badge: 'EDGAR Live' },
        { id: 'lbo_matrix', label: '💼 LBO & Sensitivity Matrix', badge: 'Financial' },
        { id: 'guilds', label: '📊 Fiduciary CPA Guild', badge: 'AICPA' },
        { id: 'wallet', label: '💳 Treasury & Disbursements', badge: '$124,500' },
        { id: 'accountsecurity', label: '🔐 SEC Compliant FIDO2 Auth', badge: 'FIDO2' }
      ]
    }

    if (effectiveEnclaveId === 'agriculture_natural_resources') {
      return [
        ...adminShortcuts,
        { id: 'desknote_ag', label: '📓 DeskNote Field Notebook', badge: 'Live App', url: 'https://desk-note-lime.vercel.app/' },
        { id: 'skillhands_ag', label: '🛠️ SkillHands Agronomy Hub', badge: 'Live App', url: 'https://skillhands-client.vercel.app' },
        { id: 'vibetok_ag', label: '🎥 VibeTok Ag & Farming', badge: 'Live Hub', url: 'https://vibetok-learning-hub.vercel.app' },
        { id: 'soil_iot', label: '🌱 Soil Sensor IoT & Irrigation', badge: 'Telemetry' },
        { id: 'livestock_matrix', label: '🐄 Livestock Genetics & Feed Ratios', badge: 'Precision' },
        { id: 'aquaculture_tank', label: '🐟 Aquaculture Telemetry & DO', badge: 'Water Temp' },
        { id: 'grain_futures', label: '🌾 Chicago Board of Trade Futures', badge: 'CBOT Live' },
        { id: 'guilds', label: '🚜 American Farm Bureau Guild', badge: 'Active' },
        { id: 'wallet', label: '💳 Crop Proceeds & USDA Draws', badge: '$28,400' },
        { id: 'accountsecurity', label: '🔐 Farm IoT & FIDO2 Identity', badge: 'Secure' }
      ]
    }

    if (effectiveEnclaveId === 'personal_services_wellness') {
      return [
        ...adminShortcuts,
        { id: 'bazaar_beauty', label: '🛍️ Bazaar Grooming Market', badge: 'Live Shop', url: 'https://bazaar-standalone.vercel.app' },
        { id: 'vibetok_wellness', label: '🎥 VibeTok Grooming & Fitness', badge: 'Live Hub', url: 'https://vibetok-learning-hub.vercel.app' },
        { id: 'desknote_client', label: '📓 DeskNote Client Formula Ledger', badge: 'Live App', url: 'https://desk-note-lime.vercel.app/' },
        { id: 'chair_booking', label: '💈 Chair & Studio Calendar', badge: 'Square Sync' },
        { id: 'strength_biomech', label: '🏋️ 1RM & Biomechanics Calc', badge: 'Kinematics' },
        { id: 'color_ratio', label: '🎨 Color Formulation Matrix', badge: 'Olaplex/Gold' },
        { id: 'guilds', label: '✂️ Master Barbers & Trainers Guild', badge: 'NSCA/Barber' },
        { id: 'wallet', label: '💳 Service Tips & Weekly Payouts', badge: '$5,920' },
        { id: 'accountsecurity', label: '🔐 Client Records Privacy FIDO2', badge: 'FIDO2' }
      ]
    }

    if (effectiveEnclaveId === 'culinary_hospitality_events') {
      return [
        ...adminShortcuts,
        { id: 'bazaar_food', label: '🛍️ Bazaar Wholesale Pantry', badge: 'Wholesale', url: 'https://bazaar-standalone.vercel.app' },
        { id: 'vibetok_culinary', label: '🎥 VibeTok Culinary Masterclasses', badge: 'Live Hub', url: 'https://vibetok-learning-hub.vercel.app' },
        { id: 'desknote_kitchen', label: '📓 DeskNote Kitchen Prep Logs', badge: 'Live App', url: 'https://desk-note-lime.vercel.app/' },
        { id: 'beo_manager', label: '📋 Banquet Event Orders (BEO)', badge: '14 Events' },
        { id: 'food_costing', label: '🍳 Food Cost & Portion Yield Calc', badge: 'Prime Cost' },
        { id: 'haccp_log', label: '🌡️ HACCP Critical Cold-Chain Log', badge: 'FDA ServSafe' },
        { id: 'guilds', label: '🍷 ACF Master Chefs & Planners Guild', badge: 'Executive' },
        { id: 'wallet', label: '💳 Catering Deposits & Banquet Draws', badge: '$22,600' },
        { id: 'accountsecurity', label: '🔐 Venue FIDO2 Passkeys', badge: 'FIDO2' }
      ]
    }

    if (effectiveEnclaveId === 'commerce_small_business') {
      return [
        ...adminShortcuts,
        { id: 'bazaar_commerce', label: '🛍️ Bazaar Merchant Storefront', badge: 'Storefront', url: 'https://bazaar-standalone.vercel.app' },
        { id: 'desknote_crm', label: '📓 DeskNote Client CRM Ledger', badge: 'Live App', url: 'https://desk-note-lime.vercel.app/' },
        { id: 'vibetok_retail', label: '🎥 VibeTok Merchant Academy', badge: 'Live Hub', url: 'https://vibetok-learning-hub.vercel.app' },
        { id: 'mls_feed', label: '🏡 Live MLS Property Stream', badge: 'MLS Direct' },
        { id: 'cap_rate', label: '📊 Commercial Cap Rate & NOI Calc', badge: 'Yield' },
        { id: 'pos_reconciler', label: '💳 Clover / Shopify POS Sync', badge: 'Realtime' },
        { id: 'guilds', label: '🤝 National Realtors & Merchants Guild', badge: 'NAR Member' },
        { id: 'wallet', label: '💳 Escrow Commissions & Draws', badge: '$34,750' },
        { id: 'accountsecurity', label: '🔐 Title & Wire FIDO2 Verification', badge: 'Encrypted' }
      ]
    }

    if (effectiveEnclaveId === 'creative_media_arts') {
      return [
        ...adminShortcuts,
        { id: 'vibetok_creative', label: '🎥 VibeTok Creator Hub', badge: 'Live Hub', url: 'https://vibetok-learning-hub.vercel.app' },
        { id: 'desknote_script', label: '📓 DeskNote Storyboard & Script', badge: 'Live App', url: 'https://desk-note-lime.vercel.app/' },
        { id: 'careerorbit_creative', label: '🪐 CareerOrbit Artist Passport', badge: 'Live Orbit', url: 'https://careerorbit-standalone.vercel.app' },
        { id: 'atmos_desk', label: '🎧 Dolby Atmos Stems & Mixing Desk', badge: '7.1.4 Surround' },
        { id: 'lut_manager', label: '🎞️ ARRI / RED RAW LUT & Grade Lab', badge: 'DaVinci' },
        { id: 'call_sheets', label: '🎬 SAG-AFTRA Call Sheets & Crew', badge: 'Production' },
        { id: 'guilds', label: '🎨 Grammy & Directors Guild Circle', badge: 'ASCAP/BMI' },
        { id: 'wallet', label: '💳 Royalties & Sync Licensing', badge: '$16,800' },
        { id: 'accountsecurity', label: '🔐 Copyright & Media Passkeys', badge: 'FIDO2' }
      ]
    }

    if (effectiveEnclaveId === 'education_workforce') {
      return [
        ...adminShortcuts,
        { id: 'vibetok_edu', label: '🎥 VibeTok Educational Video Hub', badge: 'Live Hub', url: 'https://vibetok-learning-hub.vercel.app' },
        { id: 'desknote_tutor', label: '📓 DeskNote Student Diagnostic Logs', badge: 'Live App', url: 'https://desk-note-lime.vercel.app/' },
        { id: 'careerorbit_apprentice', label: '🪐 CareerOrbit Apprenticeship Track', badge: 'Live Orbit', url: 'https://careerorbit-standalone.vercel.app' },
        { id: 'sat_act_rubric', label: '📚 SAT/ACT & Diagnostic Rubric', badge: 'College Board' },
        { id: 'apprentice_hours', label: '⏱️ OJT Apprenticeship Hours Log', badge: 'DoL Certified' },
        { id: 'curriculum_engine', label: '📝 Bloom Taxonomy Lesson Planner', badge: 'Pedagogy' },
        { id: 'guilds', label: '🎓 National Educators & Tutors Guild', badge: 'Accredited' },
        { id: 'wallet', label: '💳 Student Stipends & Tutoring Draws', badge: '$7,450' },
        { id: 'accountsecurity', label: '🔐 FERPA Compliant FIDO2 Auth', badge: 'FIDO2' }
      ]
    }

    if (effectiveEnclaveId === 'community_civic_security') {
      return [
        ...adminShortcuts,
        { id: 'desknote_civic', label: '📓 DeskNote Incident Log & Post Orders', badge: 'Live App', url: 'https://desk-note-lime.vercel.app/' },
        { id: 'careerorbit_vet', label: '🪐 CareerOrbit Veteran Transition Hub', badge: 'Live Orbit', url: 'https://careerorbit-standalone.vercel.app' },
        { id: 'vibetok_security', label: '🎥 VibeTok Physical Security Labs', badge: 'Live Hub', url: 'https://vibetok-learning-hub.vercel.app' },
        { id: 'perimeter_threat', label: '🛡️ Perimeter Access & Threat Matrix', badge: 'CCTV/Access' },
        { id: 'va_navigator', label: '🎖️ VA Benefits & SkillBridge Stream', badge: 'Veterans' },
        { id: 'grant_allocations', label: '🤝 501(c)(3) Donor & Grant Ledger', badge: 'Guidestar' },
        { id: 'guilds', label: '⚔️ Veterans & First Responders Guild', badge: 'Honorary' },
        { id: 'wallet', label: '💳 Civic Grants & Security Retainers', badge: '$19,300' },
        { id: 'accountsecurity', label: '🔐 Defense / Security Passkeys', badge: 'FIDO2' }
      ]
    }

    // Default: Software Engineering & Cloud Infrastructure
    return [
      ...adminShortcuts,
      { id: 'aagiis_dev', label: '🛡️ Aagiis — DoD RMF & DCSA NISP', badge: 'DoDI 8510.01', url: 'https://aagiis.com/' },
      { id: 'expedite_strike_dev', label: '🎯 EXPEDITE STRIKE™ DAST Engine', badge: '/engine', url: 'https://11-dast-security-platform.vercel.app/engine' },
      { id: 'dstrike_dev', label: '⚡ DSTRIKE & Noctis Desk', badge: 'dstrike.app', url: 'https://dstrike.app' },
      { id: 'desknote_dev', label: '📓 DeskNote Dev Notebook', badge: 'Live App', url: 'https://desk-note-lime.vercel.app/' },
      { id: 'expedite_portal_dev', label: '🏛️ Expedite Consults Portal', badge: 'Official', url: 'https://www.expediteconsults.com' },
      { id: 'sphera_portal_dev', label: '🚀 Sphera Production Launchpad', badge: 'Launchpad', url: 'https://sphera-portal.vercel.app' },
      { id: 'sast_platform', label: '🔍 05-SAST Static Code Analyzer', badge: 'Live SAST', url: 'https://05-sast-platform.vercel.app' },
      { id: 'sca_platform', label: '📦 06-SCA AI-BOM Dependency Guard', badge: 'Live SCA', url: 'https://06-sca-platform.vercel.app' },
      { id: 'iac_platform', label: '☁️ 10-IaC Terraform Guard', badge: 'Live IaC', url: 'https://10-iac-security-platform.vercel.app' },
      { id: 'api_platform', label: '⚡ 12-API Security Shield', badge: 'Live API', url: 'https://12-api-security-platform.vercel.app' },
      { id: 'integration_bus', label: '🌐 18-Unified Integration Bus', badge: 'Live Bus', url: 'https://18-unified-integration-layer.vercel.app' },
      { id: 'careerorbit', label: '🪐 CareerOrbit Skill Passport', badge: 'Live Orbit', url: 'https://careerorbit-standalone.vercel.app' },
      { id: 'vibetok_dev', label: '🎥 VibeTok Dev Masterclasses', badge: 'Live Hub', url: 'https://vibetok-learning-hub.vercel.app' },
      { id: 'labs', label: '🧪 Proof of Work Sandbox', badge: 'Sub-4ms' },
      { id: 'code', label: '🧑‍💻 ConnectIn Code Repos', badge: '3 Repos' },
      { id: 'guilds', label: '⚡ Systems Architects Guild', badge: 'Active' },
      { id: 'wallet', label: '💳 Dev Pay & Invoicing', badge: '$9,430' },
      { id: 'accountsecurity', label: '🔐 Security & Passkeys', badge: 'FIDO2' }
    ]
  }

  const allEnclaveShortcuts = getShortcutsForEnclave()

  // Build individual profession-specific tools from matchedProfession.tools + enclave shortcuts
  const { primaryShortcuts, extraShortcuts, allCustomizableShortcuts } = useMemo(() => {
    const roleTools = (matchedProfession?.tools || []).map((tool, idx) => ({
      id: `prof_tool_${matchedProfession?.id || 'role'}_${idx}`,
      label: `${tool.icon} ${tool.name}`,
      badge: tool.badge || 'Role Tool',
      description: tool.description,
      isRoleSpecific: true,
      targetTab: 'learning'
    }))

    // Merge role-specific tools at the top (after any Super Admin shortcuts), avoiding duplicates
    const adminItems = allEnclaveShortcuts.filter((s: any) => s.id === 'adminiam' || s.id === 'auth_gate')
    const nonAdminEnclaveItems = allEnclaveShortcuts.filter((s: any) => s.id !== 'adminiam' && s.id !== 'auth_gate')

    // Pick the most relevant enclave items for this specific profession
    const profKeywords = `${matchedProfession?.title || ''} ${(matchedProfession?.typicalSkills || []).join(' ')}`.toLowerCase()
    const scoredEnclaveItems = [...nonAdminEnclaveItems].sort((a, b) => {
      const aMatch = profKeywords.split(/\s+/).some(w => w.length > 3 && a.label.toLowerCase().includes(w)) ? 1 : 0
      const bMatch = profKeywords.split(/\s+/).some(w => w.length > 3 && b.label.toLowerCase().includes(w)) ? 1 : 0
      return bMatch - aMatch
    })

    const combined = [...adminItems, ...roleTools, ...scoredEnclaveItems]

    // If user has custom pinned tool IDs, show those first
    if (pinnedIds.length > 0) {
      const pinned = combined.filter(item => pinnedIds.includes(item.id))
      const unpinned = combined.filter(item => !pinnedIds.includes(item.id))
      return {
        primaryShortcuts: pinned.length > 0 ? pinned : combined.slice(0, 6),
        extraShortcuts: pinned.length > 0 ? unpinned : combined.slice(6),
        allCustomizableShortcuts: combined
      }
    }

    // Default focused view: Admin (if admin) + Role-Specific Tools + Top 3 Enclave Essentials (max 6 items total)
    const defaultCount = isAdminUser ? 6 : 5
    return {
      primaryShortcuts: combined.slice(0, defaultCount),
      extraShortcuts: combined.slice(defaultCount),
      allCustomizableShortcuts: combined
    }
  }, [matchedProfession, allEnclaveShortcuts, pinnedIds, isAdminUser])

  const handleSelectCustomProfession = (profId: string) => {
    setCustomProfessionId(profId)
    setPinnedIds([])
    try {
      if (profId) {
        localStorage.setItem(`${userStorageKey}_prof`, profId)
      } else {
        localStorage.removeItem(`${userStorageKey}_prof`)
      }
      localStorage.removeItem(`${userStorageKey}_pins`)
    } catch {}
  }

  const handleTogglePin = (toolId: string) => {
    setPinnedIds(prev => {
      const base = prev.length > 0 ? prev : primaryShortcuts.map(s => s.id)
      const next = base.includes(toolId)
        ? base.filter(id => id !== toolId)
        : [...base, toolId]
      try {
        localStorage.setItem(`${userStorageKey}_pins`, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  // Enclave-Segregated Recent & Followed Groups
  const getRecentItemsForEnclave = () => {
    if (effectiveEnclaveId === 'trades_construction') {
      return [
        { type: 'group', name: 'Master Heavy Timber & Finish Carpenters Guild', icon: Users },
        { type: 'group', name: 'Commercial General Contractors & Superintendents', icon: Users },
        { type: 'hashtag', name: 'CarpentryCraft', icon: Hash },
        { type: 'hashtag', name: 'TimberFraming', icon: Hash },
        { type: 'hashtag', name: 'LumberMarket', icon: Hash },
        { type: 'event', name: 'International Woodworking Fair (IWF) 2026', icon: Calendar }
      ]
    }

    if (effectiveEnclaveId === 'automotive_mechanics') {
      return [
        { type: 'group', name: 'ASE Master Technicians & CAN-Bus Diagnosticians', icon: Users },
        { type: 'group', name: 'Heavy Diesel Fleet & 800V EV Specialist Network', icon: Users },
        { type: 'hashtag', name: 'OBD2Diagnostics', icon: Hash },
        { type: 'hashtag', name: 'DieselFleetTech', icon: Hash },
        { type: 'hashtag', name: 'EVHighVoltage', icon: Hash },
        { type: 'event', name: 'Heavy Duty Aftermarket Week (HDAW) 2026', icon: Calendar }
      ]
    }

    if (effectiveEnclaveId === 'healthcare_medicine') {
      return [
        { type: 'group', name: 'Emergency & Critical Care Trauma Nurses (CCRN/TNCC)', icon: Users },
        { type: 'group', name: 'American College of Surgeons & Interventionalists', icon: Users },
        { type: 'hashtag', name: 'TraumaNursing', icon: Hash },
        { type: 'hashtag', name: 'OrthopedicSurgery', icon: Hash },
        { type: 'hashtag', name: 'ClinicalTrials', icon: Hash },
        { type: 'event', name: 'Emergency Nurses Association (ENA) Annual 2026', icon: Calendar }
      ]
    }

    if (effectiveEnclaveId === 'tech_cybersecurity') {
      return [
        { type: 'group', name: 'Offensive Security (OSCP/CRTO) Red Team Guild', icon: Users },
        { type: 'group', name: 'Critical Infrastructure SCADA/ICS Cyber Defense', icon: Users },
        { type: 'hashtag', name: 'RedTeaming', icon: Hash },
        { type: 'hashtag', name: 'OTSecurity', icon: Hash },
        { type: 'hashtag', name: 'MalwareAnalysis', icon: Hash },
        { type: 'event', name: 'DEF CON 34 & Black Hat USA 2026', icon: Calendar }
      ]
    }

    if (effectiveEnclaveId === 'law_gov_defense') {
      return [
        { type: 'group', name: 'Cleared Defense Contractors & CMMC Leaders', icon: Users },
        { type: 'group', name: 'Corporate Counsel & Federal Bar Association', icon: Users },
        { type: 'hashtag', name: 'DefenseIntelligence', icon: Hash },
        { type: 'hashtag', name: 'CMMC', icon: Hash },
        { type: 'event', name: 'DoD SAM.gov Defense Contracting Summit', icon: Calendar }
      ]
    }

    if (effectiveEnclaveId === 'finance_accounting') {
      return [
        { type: 'group', name: 'AICPA Corporate Controllers & CPAs', icon: Users },
        { type: 'group', name: 'Private Equity & Valuation Modeling Circle', icon: Users },
        { type: 'hashtag', name: 'GAAPAudits', icon: Hash },
        { type: 'hashtag', name: 'PrivateEquity', icon: Hash },
        { type: 'event', name: 'Global CFO & Treasury Conference 2026', icon: Calendar }
      ]
    }

    if (effectiveEnclaveId === 'agriculture_natural_resources') {
      return [
        { type: 'group', name: 'Regenerative Agriculture & Precision Farming Network', icon: Users },
        { type: 'group', name: 'Commercial Apiary & Honey Producers Guild', icon: Users },
        { type: 'hashtag', name: 'PrecisionFarming', icon: Hash },
        { type: 'hashtag', name: 'SoilHealth', icon: Hash },
        { type: 'hashtag', name: 'Aquaculture', icon: Hash },
        { type: 'event', name: 'Commodity Classic & World Ag Expo 2026', icon: Calendar }
      ]
    }

    if (effectiveEnclaveId === 'personal_services_wellness') {
      return [
        { type: 'group', name: 'Master Barber Alliance & Textured Hair Artists', icon: Users },
        { type: 'group', name: 'NSCA Strength Coaches & Sports Kinesiologists', icon: Users },
        { type: 'hashtag', name: 'MasterBarber', icon: Hash },
        { type: 'hashtag', name: 'FitnessCoaching', icon: Hash },
        { type: 'hashtag', name: 'Cosmetology', icon: Hash },
        { type: 'event', name: 'International Salon & Spa Expo 2026', icon: Calendar }
      ]
    }

    if (effectiveEnclaveId === 'culinary_hospitality_events') {
      return [
        { type: 'group', name: 'Executive Chefs & Catering Operations Directors', icon: Users },
        { type: 'group', name: 'Luxury Wedding Service & Hospitality Guild', icon: Users },
        { type: 'hashtag', name: 'CateringLogistics', icon: Hash },
        { type: 'hashtag', name: 'HospitalityLeadership', icon: Hash },
        { type: 'hashtag', name: 'CulinaryArts', icon: Hash },
        { type: 'event', name: 'National Restaurant Association (NRA) Show 2026', icon: Calendar }
      ]
    }

    if (effectiveEnclaveId === 'commerce_small_business') {
      return [
        { type: 'group', name: 'National Association of Realtors (NAR) Commercial Circle', icon: Users },
        { type: 'group', name: 'Independent Boutique Retailers & Merchants Coalition', icon: Users },
        { type: 'hashtag', name: 'CommercialRealEstate', icon: Hash },
        { type: 'hashtag', name: 'RetailCommerce', icon: Hash },
        { type: 'hashtag', name: 'SmallBusinessGrowth', icon: Hash },
        { type: 'event', name: 'National Retail Federation (NRF) Big Show 2026', icon: Calendar }
      ]
    }

    if (effectiveEnclaveId === 'creative_media_arts') {
      return [
        { type: 'group', name: 'Audio Engineering Society (AES) & Record Producers', icon: Users },
        { type: 'group', name: 'American Society of Cinematographers & Visual Artists', icon: Users },
        { type: 'hashtag', name: 'MusicProduction', icon: Hash },
        { type: 'hashtag', name: 'Cinematography', icon: Hash },
        { type: 'hashtag', name: 'CreativeDesign', icon: Hash },
        { type: 'event', name: 'NAB Show & NAMM Music Convention 2026', icon: Calendar }
      ]
    }

    if (effectiveEnclaveId === 'education_workforce') {
      return [
        { type: 'group', name: 'National Tutoring Association & STEM Mentors', icon: Users },
        { type: 'group', name: 'Vocational Trade School Educators & OJT Coordinators', icon: Users },
        { type: 'hashtag', name: 'VocationalTraining', icon: Hash },
        { type: 'hashtag', name: 'WorkforceDevelopment', icon: Hash },
        { type: 'hashtag', name: 'STEMMentorship', icon: Hash },
        { type: 'event', name: 'ACTE CareerTech Vision Conference 2026', icon: Calendar }
      ]
    }

    if (effectiveEnclaveId === 'community_civic_security') {
      return [
        { type: 'group', name: 'Military Veterans in Corporate Leadership (VFW/SVA)', icon: Users },
        { type: 'group', name: 'ASIS Physical Security & Asset Protection Professionals', icon: Users },
        { type: 'hashtag', name: 'VeteranMentorship', icon: Hash },
        { type: 'hashtag', name: 'AssetProtection', icon: Hash },
        { type: 'hashtag', name: 'CivicAction', icon: Hash },
        { type: 'event', name: 'Global Security Exchange (GSX) & Veterans Gala 2026', icon: Calendar }
      ]
    }

    return [
      { type: 'group', name: 'AI & Zero Trust Cybersecurity Architects', icon: Users },
      { type: 'group', name: 'Next.js & React Core Engineering', icon: Users },
      { type: 'hashtag', name: 'CloudSecurity', icon: Hash },
      { type: 'hashtag', name: 'AgenticAI', icon: Hash },
      { type: 'event', name: 'Global Enterprise Cloud Summit 2026', icon: Calendar }
    ]
  }

  const recentItems = getRecentItemsForEnclave()
  const visibleShortcuts = isAllToolsExpanded
    ? [...primaryShortcuts, ...extraShortcuts]
    : primaryShortcuts

  const filteredProfessionsForPicker = useMemo(() => {
    const q = professionFilterQuery.trim().toLowerCase()
    const enclaveProfs = ALL_PROFESSIONS.filter(p => p.enclaveId === effectiveEnclaveId)
    if (!q) return enclaveProfs
    return ALL_PROFESSIONS.filter(
      p =>
        p.title.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.typicalSkills.some(s => s.toLowerCase().includes(q))
    ).slice(0, 25)
  }, [professionFilterQuery, effectiveEnclaveId])

  return (
    <aside className="space-y-3">
      {/* Profile & Personal Command Center Card */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Cover Banner */}
        <div className="relative h-16 w-full bg-gradient-to-r from-[#0A66C2] via-sky-600 to-indigo-700">
          <img
            src={user.coverImage}
            alt="Cover"
            className="h-full w-full object-cover opacity-60"
          />
        </div>

        {/* Avatar & User Details */}
        <div className="relative px-4 pb-3 pt-0 text-center">
          <div className="-mt-10 mb-2 flex justify-center">
            <div
              onClick={onViewProfile}
              className="relative h-18 w-18 cursor-pointer rounded-full border-2 border-white bg-white shadow-md transition-transform hover:scale-105 dark:border-zinc-900"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="h-full w-full rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-900" title="Available" />
            </div>
          </div>

          <button
            onClick={onViewProfile}
            className="group block w-full focus:outline-none"
          >
            <div className="flex items-center justify-center gap-1">
              <h2 className="font-bold text-zinc-900 text-sm group-hover:underline dark:text-zinc-100">
                {user.name}
              </h2>
              <ShieldCheck className="h-4 w-4 text-[#0A66C2]" />
            </div>
            <p className="mt-1 text-xs text-zinc-500 leading-snug line-clamp-2 dark:text-zinc-400">
              {user.headline}
            </p>
          </button>

          {/* Portable Professional ID Button */}
          {onOpenIDModal && (
            <div className="pt-2">
              <button
                onClick={onOpenIDModal}
                className="w-full rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 px-2.5 py-1 text-[11px] font-bold text-[#0A66C2] dark:text-sky-300 hover:bg-sky-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>🪪 {t("connectin_id", "ConnectIn ID")} (#{user.name ? user.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'member'})</span>
                <span className="text-[9px] font-mono bg-sky-200/60 dark:bg-sky-900 px-1 rounded">{t("verified", "Verified")}</span>
              </button>
            </div>
          )}

          {/* Verified Specialty Community Badge */}
          <div className="pt-2 text-left">
            <div className={`rounded-xl border p-2.5 space-y-1 ${enclaveInfo?.badgeBg || 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-xs text-zinc-900 dark:text-zinc-100">
                  <span>{enclaveInfo?.icon || '🔨'}</span>
                  <span className="truncate">{enclaveInfo?.shortName || 'Trades'} Community</span>
                </span>
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white/90 dark:bg-zinc-800 text-[#0A66C2] dark:text-sky-300 border border-zinc-200/50 dark:border-zinc-700/50 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              </div>
              <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {displayProfessionTitle}
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate">
                {matchedProfession?.categoryName || 'Verified Specialist'}
              </p>
            </div>

            {/* Reconciled Trade Dispatch Status & Rate Badge (When Trades Enclave Active) */}
            {effectiveEnclaveId === 'trades_construction' && (
              <div className="pt-2 text-left">
                <TradeEnclaveWidgets user={user} onNavigateTab={onNavigateTab} variant="badge_only" />
              </div>
            )}
          </div>
        </div>

        {/* Profile Strength & Career Mission Gauge */}
        <div className="border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800/80 space-y-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{t("profile_strength", "Profile Strength")}</span>
              <span className="font-black text-[#0A66C2]">{user.profileStrength ?? 50}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0A66C2] to-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, user.profileStrength ?? 50))}%` }}
              />
            </div>
          </div>

          <div
            onClick={() => onNavigateTab && onNavigateTab('missions')}
            className="rounded-lg bg-amber-500/10 p-2 border border-amber-400/30 cursor-pointer hover:bg-amber-500/20 transition-colors space-y-1"
          >
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Flame className="h-3 w-3 text-amber-500" /> {t("career_mission", "Career Mission")}
              </span>
              <span className="text-amber-700 dark:text-amber-300 font-mono">{t("active_status", "Active")}</span>
            </div>
          </div>
        </div>

        {/* Metrics & Analytics */}
        <div className="border-t border-zinc-100 px-4 py-2 text-xs dark:border-zinc-800/80 space-y-1">
          <div
            onClick={() => onOpenAnalytics ? onOpenAnalytics('viewers') : onViewProfile()}
            className="flex cursor-pointer items-center justify-between py-0.5 hover:text-[#0A66C2] group"
            title="Inspect active member profile viewers"
          >
            <span className="text-zinc-500 dark:text-zinc-400 group-hover:text-[#0A66C2]">{t("profile_viewers", "Profile viewers")}</span>
            <span className="font-semibold text-[#0A66C2]">{(user.profileViews ?? 1428).toLocaleString()}</span>
          </div>
          <div
            onClick={() => onOpenAnalytics ? onOpenAnalytics('reach') : onViewProfile()}
            className="flex cursor-pointer items-center justify-between py-0.5 hover:text-[#0A66C2] group"
            title="Inspect multi-channel post broadcast reach"
          >
            <span className="text-zinc-500 dark:text-zinc-400 group-hover:text-purple-600">{t("content_reach", "Content reach")}</span>
            <span className="font-semibold text-purple-600 dark:text-purple-400">{(user.postImpressions ?? 9840).toLocaleString()}</span>
          </div>
          <div
            onClick={() => onOpenAnalytics ? onOpenAnalytics('discoveries') : onViewProfile()}
            className="flex cursor-pointer items-center justify-between py-0.5 hover:text-[#0A66C2] group"
            title="Inspect talent directory search queries and index matches"
          >
            <span className="text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-600">{t("directory_discoveries", "Directory discoveries")}</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{(user.searchAppearances ?? 342).toLocaleString()}</span>
          </div>
        </div>

        {/* Profession-Tailored Personal Command Center */}
        <div className="border-t border-zinc-100 p-2.5 text-xs dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-1.5">
          <div className="flex items-center justify-between px-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">
                {t("personal_command_center", "Personal Command Center")}
              </p>
              <p className="text-[10px] text-[#0A66C2] dark:text-sky-400 font-semibold truncate" title={displayProfessionTitle}>
                🎯 {displayProfessionTitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCustomizingCenter(!isCustomizingCenter)}
              className={`rounded-lg px-2 py-1 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                isCustomizingCenter
                  ? "bg-[#0A66C2] text-white"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-[#0A66C2]"
              }`}
              title="Customize Command Center for your specific profession"
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span>{isCustomizingCenter ? "Done" : "Customize"}</span>
            </button>
          </div>

          {/* Inline Profession & Tool Pin Customizer Drawer */}
          {isCustomizingCenter && (
            <div className="mx-1 rounded-xl border border-[#0A66C2]/30 bg-white dark:bg-zinc-900 p-2.5 space-y-2.5 shadow-sm">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  1. Tailor to Your Exact Profession
                </label>
                <input
                  type="text"
                  value={professionFilterQuery}
                  onChange={(e) => setProfessionFilterQuery(e.target.value)}
                  placeholder="Search 170+ professions (e.g. Nurse, Electrician, IAM, CPA)..."
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-[11px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0A66C2]"
                />
                <select
                  value={matchedProfession?.id || ""}
                  onChange={(e) => handleSelectCustomProfession(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#0A66C2]"
                >
                  {filteredProfessionsForPicker.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    2. Pin Your Top Tools
                  </label>
                  {pinnedIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setPinnedIds([])
                        try { localStorage.removeItem(`${userStorageKey}_pins`) } catch {}
                      }}
                      className="text-[10px] font-semibold text-[#0A66C2] hover:underline cursor-pointer"
                    >
                      Reset Default
                    </button>
                  )}
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                  {allCustomizableShortcuts.map((item) => {
                    const activeSet = pinnedIds.length > 0 ? pinnedIds : primaryShortcuts.map(s => s.id)
                    const isPinned = activeSet.includes(item.id)
                    return (
                      <button
                        key={item.id + item.label}
                        type="button"
                        onClick={() => handleTogglePin(item.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-[11px] border transition-colors cursor-pointer ${
                          isPinned
                            ? "border-[#0A66C2]/40 bg-blue-50/60 dark:bg-blue-950/30 text-zinc-900 dark:text-zinc-100 font-semibold"
                            : "border-zinc-200/60 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <span className="truncate pr-2">{item.label}</span>
                        <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold">
                          {isPinned ? (
                            <span className="text-[#0A66C2] dark:text-sky-400 flex items-center gap-0.5">
                              <Check className="h-3 w-3" /> Pinned
                            </span>
                          ) : (
                            <span className="text-zinc-400">+ Pin</span>
                          )}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Focused Role-Specific Shortcuts List */}
          <div className="space-y-0.5">
            {visibleShortcuts.map((ws: any) => (
              <button
                key={ws.id + ws.label}
                onClick={() => {
                  if (ws.url) {
                    window.open(ws.url, '_blank', 'noopener,noreferrer')
                  } else if (ws.id === 'auth_gate' && onOpenAuthModal) {
                    onOpenAuthModal()
                  } else if (ws.id === 'inbound_bounty' && onOpenInboundBountiesModal) {
                    onOpenInboundBountiesModal()
                  } else if (ws.targetTab && onNavigateTab) {
                    onNavigateTab(ws.targetTab)
                  } else if (onNavigateTab) {
                    onNavigateTab(ws.id)
                  } else {
                    onViewProfile()
                  }
                }}
                title={ws.description || ws.label}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-zinc-700 hover:bg-white hover:shadow-xs dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
                  <span className="font-medium truncate group-hover:text-[#0A66C2]">{ws.label}</span>
                  {ws.url && (
                    <ExternalLink className="h-3 w-3 text-zinc-400 group-hover:text-[#0A66C2] shrink-0" />
                  )}
                </div>
                <span className={`rounded-md px-1.5 py-0.2 text-[9px] font-bold shrink-0 ${
                  ws.isRoleSpecific
                    ? "bg-blue-50 text-[#0A66C2] border border-blue-200/60 dark:bg-blue-950/50 dark:text-sky-300 dark:border-blue-800/60"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                }`}>
                  {ws.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Expand / Collapse Extra Enclave Tools Toggle */}
          {extraShortcuts.length > 0 && (
            <button
              type="button"
              onClick={() => setIsAllToolsExpanded(!isAllToolsExpanded)}
              className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 py-1.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-[#0A66C2] hover:border-[#0A66C2]/40 transition-colors cursor-pointer"
            >
              {isAllToolsExpanded ? (
                <>
                  <span>Show Focused Role View</span>
                  <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <span>+ {extraShortcuts.length} More {enclaveInfo?.shortName || 'Enclave'} Tools</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Reconciled Trade Enclave Modules (Tickets Desk, Hall Invites, Bench Shops) */}
      {effectiveEnclaveId === 'trades_construction' && (
        <TradeEnclaveWidgets user={user} onNavigateTab={onNavigateTab} variant="sidebar" />
      )}

      {/* Discover & Recent Groups */}
      <div className="hidden md:block sticky top-18 rounded-xl border border-zinc-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {t("recent_followed", "Recent & Followed")}
          </p>
          <button
            onClick={() => setIsRecentExpanded(!isRecentExpanded)}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            {isRecentExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {isRecentExpanded && (
          <div className="space-y-1 text-xs">
            {recentItems.map((item, idx) => {
              const Icon = item.icon
              return (
                <button
                  key={idx}
                  onClick={() => onSelectTag && onSelectTag(item.name)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                >
                  <Icon className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
