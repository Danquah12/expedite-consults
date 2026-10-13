"use client"

import React, { useState } from "react"
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
  Flame
} from "lucide-react"
import { UserProfile } from "@/lib/linkedin-data"
import { isSuperAdminUser } from "@/lib/connectin-profile"
import { findEnclaveById } from "@/lib/connectin-professions"

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

  const isAdminUser = isSuperAdminUser(user)
  const effectiveEnclaveId = user.professionEnclave || (isAdminUser ? 'law_gov_defense' : 'trades_construction')
  const enclaveInfo = findEnclaveById(effectiveEnclaveId)

  // Enclave-Segregated Command Center Workspace Tools (Strict Need-to-Know)
  const getShortcutsForEnclave = () => {
    const adminShortcuts = isAdminUser ? [
      { id: 'adminiam', label: '🛡️ Admin IAM Console', badge: 'Privileged' },
      { id: 'auth_gate', label: '🔑 Switch Persona / Role', badge: 'Enclaves' }
    ] : []

    if (effectiveEnclaveId === 'trades_construction') {
      return [
        ...adminShortcuts,
        { id: 'blueprints', label: '📐 Blueprint & CAD Specs', badge: 'Active' },
        { id: 'lumber_index', label: '🌲 Lumber Market Futures', badge: 'Live Data' },
        { id: 'subcontractor_rfp', label: '📋 Subcontractor Job Board', badge: '8 Bids' },
        { id: 'tool_vault', label: '🧰 Tool & Rigging Vault', badge: 'Verified' },
        { id: 'osha_locker', label: '🦺 OSHA Safety & Toolbox Talks', badge: 'OSHA 30' },
        { id: 'permits', label: '🏗️ Job-Site Manifest & Permits', badge: 'Active' },
        { id: 'wallet', label: '💳 Trade Escrow & Draws', badge: '$18,400' },
        { id: 'guilds', label: '🔨 Master Craftsman Guild', badge: 'Active' },
        { id: 'jobs', label: '💼 Subcontractor Bids', badge: '4 Status' },
        { id: 'profile', label: '📁 Job-Site Proof & Portfolio', badge: '6 Builds' },
        { id: 'peerreview', label: '⭐ Trade Peer Reviews', badge: '4.98 ★' },
        { id: 'compensation', label: '💰 Regional Prevailing Wages', badge: 'Top 10%' },
        { id: 'accountsecurity', label: '🔐 Safety & FIDO2 Identity', badge: 'FIDO2' }
      ]
    }

    if (effectiveEnclaveId === 'healthcare_medicine') {
      return [
        ...adminShortcuts,
        { id: 'hipaa_consults', label: '🏥 HIPAA Case Consults', badge: 'BAA Verified' },
        { id: 'clinical_trials', label: '📑 Clinical Trials & PubMed', badge: 'PubMed' },
        { id: 'ceu_locker', label: '🎖️ CEU Credential Locker', badge: 'Active CME' },
        { id: 'shifts', label: '🕒 Peer Shift Exchange', badge: 'Hospital' },
        { id: 'protocols', label: '📋 ICU Protocol Reference', badge: 'Evidence' },
        { id: 'guilds', label: '🩺 Medical Staff Guild', badge: 'Active' },
        { id: 'wallet', label: '💳 Locum Tenens Disbursements', badge: '$8,920' },
        { id: 'jobs', label: '💼 Clinical & Hospital Roles', badge: '3 Matches' },
        { id: 'profile', label: '📁 Board Certs & Credentials', badge: 'Verified' },
        { id: 'peerreview', label: '⭐ Clinical Peer Reviews', badge: '4.99 ★' },
        { id: 'accountsecurity', label: '🔐 HIPAA FIDO2 Passkeys', badge: 'Compliant' }
      ]
    }

    if (effectiveEnclaveId === 'law_gov_defense') {
      return [
        ...adminShortcuts,
        { id: 'legal_vault', label: '📚 Legal Brief & Precedent Vault', badge: 'Fast Search' },
        { id: 'contract_redline', label: '🖋️ Contract Redline Engine', badge: 'Automated' },
        { id: 'sam_gov', label: '🏛️ Federal SAM.gov RFP Feed', badge: 'SAM.gov' },
        { id: 'cmmc_audit', label: '🛡️ CMMC 2.0 Audit Workspace', badge: 'Level 3' },
        { id: 'procurement', label: '🏢 Defense Procurement', badge: '$2.4M Spend' },
        { id: 'guilds', label: '⚖️ Cleared Counsel Enclave', badge: 'TS/SCI' },
        { id: 'wallet', label: '💳 Retainers & Escrow', badge: '$45,000' },
        { id: 'jobs', label: '💼 Cleared Defense Openings', badge: '4 Bids' },
        { id: 'accountsecurity', label: '🔐 Top Secret CAC / Passkeys', badge: 'FIDO2' }
      ]
    }

    if (effectiveEnclaveId === 'finance_accounting') {
      return [
        ...adminShortcuts,
        { id: 'gaap_ledger', label: '📑 GAAP Ledger Reconciler', badge: 'GAAP Ready' },
        { id: 'dcf_engine', label: '📈 Valuation DCF Engine', badge: 'Realtime' },
        { id: 'edgar_feed', label: '🏛️ SEC EDGAR 10-K Stream', badge: 'EDGAR Live' },
        { id: 'lbo_matrix', label: '💼 LBO & Sensitivity Matrix', badge: 'Financial' },
        { id: 'guilds', label: '📊 Fiduciary CPA Guild', badge: 'AICPA' },
        { id: 'wallet', label: '💳 Treasury & Disbursements', badge: '$124,500' },
        { id: 'jobs', label: '💼 Controller & PE Roles', badge: 'Active' },
        { id: 'accountsecurity', label: '🔐 SEC Compliant FIDO2 Auth', badge: 'FIDO2' }
      ]
    }

    // Default: Software Engineering & Cyber Defense
    return [
      ...adminShortcuts,
      { id: 'labs', label: '🧪 Proof of Work Sandbox', badge: 'Sub-4ms' },
      { id: 'code', label: '🧑‍💻 ConnectIn Code Repos', badge: '3 Repos' },
      { id: 'aiagents', label: '🐙 GitHub Auto-PR & AI Agents', badge: 'Connected' },
      { id: 'cve_radar', label: '🛡️ Bug Bounty & CVE Radar', badge: 'CVE-2026' },
      { id: 'bounties', label: '🏆 Enterprise Bounties', badge: '$15K-$25K' },
      { id: 'guilds', label: '🛡️ Zero-Trust Security Guild', badge: '3 Enclaves' },
      { id: 'wallet', label: '💳 Pay & Invoicing', badge: '$2,430' },
      { id: 'missions', label: '🔥 Career Mission (72%)', badge: '+1,850 XP' },
      { id: 'jobs', label: '💼 Active Engineering Roles', badge: '4 Status' },
      { id: 'profile', label: '📁 Repos & Cryptographic Proof', badge: '6 Projects' },
      { id: 'peerreview', label: '⭐ Peer Code Reviews', badge: '4.98 ★' },
      { id: 'compensation', label: '💰 Tech Compensation Benchmarks', badge: 'Top 5%' },
      { id: 'accountsecurity', label: '🔐 Security & Passkeys', badge: 'FIDO2' }
    ]
  }

  const workspaceShortcuts = getShortcutsForEnclave()

  // Enclave-Segregated Recent & Followed Groups
  const getRecentItemsForEnclave = () => {
    if (effectiveEnclaveId === 'trades_construction') {
      return [
        { type: 'group', name: 'Custom Joinery & Heavy Timber Framing Guild', icon: Users },
        { type: 'group', name: 'Commercial General Contractors & Superintendents', icon: Users },
        { type: 'hashtag', name: 'TimberFraming', icon: Hash },
        { type: 'hashtag', name: 'LumberMarket', icon: Hash },
        { type: 'event', name: 'National Builders & Craftsmen Expo 2026', icon: Calendar }
      ]
    }

    if (effectiveEnclaveId === 'healthcare_medicine') {
      return [
        { type: 'group', name: 'American College of Physicians Network', icon: Users },
        { type: 'group', name: 'Critical Care Medicine & ICU Protocols', icon: Users },
        { type: 'hashtag', name: 'ClinicalTrials', icon: Hash },
        { type: 'hashtag', name: 'HIPAACompliance', icon: Hash },
        { type: 'event', name: 'Annual Clinical Cardiology Symposium 2026', icon: Calendar }
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

    return [
      { type: 'group', name: 'AI & Zero Trust Cybersecurity Architects', icon: Users },
      { type: 'group', name: 'Next.js & React Core Engineering', icon: Users },
      { type: 'hashtag', name: 'CloudSecurity', icon: Hash },
      { type: 'hashtag', name: 'AgenticAI', icon: Hash },
      { type: 'event', name: 'Global Enterprise Cloud Summit 2026', icon: Calendar }
    ]
  }

  const recentItems = getRecentItemsForEnclave()

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
                <span>🪪 ConnectIn ID (#{user.name ? user.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'member'})</span>
                <span className="text-[9px] font-mono bg-sky-200/60 dark:bg-sky-900 px-1 rounded">Verified</span>
              </button>
            </div>
          )}

          {/* Verified Need-to-Know Enclave Badge */}
          <div className="pt-2 text-left">
            <div className={`rounded-xl border p-2.5 space-y-1 ${enclaveInfo?.badgeBg || 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-xs text-zinc-900 dark:text-zinc-100">
                  <span>{enclaveInfo?.icon || '🔨'}</span>
                  <span className="truncate">{enclaveInfo?.shortName || 'Trades'} Enclave</span>
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-700/50">
                  🔒 Segregated
                </span>
              </div>
              <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {user.profession || 'Master Carpenter (Framing & Finish Joinery)'}
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
                {enclaveInfo?.securityClearanceTier || 'Level 2 Clearance'}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Strength & Career Mission Gauge */}
        <div className="border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800/80 space-y-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Profile Strength</span>
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
                <Flame className="h-3 w-3 text-amber-500" /> Career Mission
              </span>
              <span className="text-amber-700 dark:text-amber-300 font-mono">Active</span>
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
            <span className="text-zinc-500 dark:text-zinc-400 group-hover:text-[#0A66C2]">Profile viewers</span>
            <span className="font-semibold text-[#0A66C2]">{(user.profileViews ?? 1428).toLocaleString()}</span>
          </div>
          <div
            onClick={() => onOpenAnalytics ? onOpenAnalytics('reach') : onViewProfile()}
            className="flex cursor-pointer items-center justify-between py-0.5 hover:text-[#0A66C2] group"
            title="Inspect multi-channel post broadcast reach"
          >
            <span className="text-zinc-500 dark:text-zinc-400 group-hover:text-purple-600">Content reach</span>
            <span className="font-semibold text-purple-600 dark:text-purple-400">{(user.postImpressions ?? 9840).toLocaleString()}</span>
          </div>
          <div
            onClick={() => onOpenAnalytics ? onOpenAnalytics('discoveries') : onViewProfile()}
            className="flex cursor-pointer items-center justify-between py-0.5 hover:text-[#0A66C2] group"
            title="Inspect talent directory search queries and index matches"
          >
            <span className="text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-600">Directory discoveries</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{(user.searchAppearances ?? 342).toLocaleString()}</span>
          </div>
        </div>

        {/* Personal Command Center Shortcuts */}
        <div className="border-t border-zinc-100 p-2.5 text-xs dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-1">
          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Personal Command Center
          </p>
          {workspaceShortcuts.map((ws) => (
            <button
              key={ws.id + ws.label}
              onClick={() => {
                if (ws.id === 'auth_gate' && onOpenAuthModal) {
                  onOpenAuthModal()
                } else if (ws.id === 'inbound_bounty' && onOpenInboundBountiesModal) {
                  onOpenInboundBountiesModal()
                } else if (onNavigateTab) {
                  onNavigateTab(ws.id)
                } else {
                  onViewProfile()
                }
              }}
              className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-zinc-700 hover:bg-white hover:shadow-xs dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all group cursor-pointer"
            >
              <span className="font-medium truncate group-hover:text-[#0A66C2]">{ws.label}</span>
              <span className="rounded-md bg-zinc-100 px-1.5 py-0.2 text-[9px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {ws.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Discover & Recent Groups */}
      <div className="hidden md:block sticky top-18 rounded-xl border border-zinc-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Recent &amp; Followed
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
