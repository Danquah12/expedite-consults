"use client"

import React, { useEffect, useState } from "react"
import {
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Crown,
  FileSignature,
  FileText,
  Kanban,
  Mail,
  Presentation,
  Receipt,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Table2,
  Video,
} from "lucide-react"
import type { UserProfile } from "@/lib/connectln-data"

interface ConnectLnPlansBillingViewProps {
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
  initialPlanId?: string
  initialCycle?: "yearly" | "monthly"
  initialSeats?: number
}

const PLAN_APP_ICONS = [
  { key: "mail", label: "Mail & Chat", icon: Mail, color: "bg-[#0078D4]" },
  { key: "calls", label: "HD Calls", icon: Video, color: "bg-emerald-600" },
  { key: "docs", label: "Docs", icon: FileText, color: "bg-[#0B5CAD]" },
  { key: "sheets", label: "Sheets", icon: Table2, color: "bg-[#107C41]" },
  { key: "slides", label: "Slides", icon: Presentation, color: "bg-[#C84B28]" },
  { key: "sign", label: "Sign", icon: FileSignature, color: "bg-[#4338CA]" },
  { key: "invoice", label: "Invoice", icon: Receipt, color: "bg-[#0F766E]" },
  { key: "boards", label: "Boards", icon: Kanban, color: "bg-[#B45309]" },
  { key: "forms", label: "Forms", icon: ClipboardList, color: "bg-[#9333EA]" },
  { key: "noctis", label: "Noctis AI", icon: Sparkles, color: "bg-[#0B1F3A]" },
] as const

const PLAN_TIERS = {
  individual: [
    {
      id: "free",
      name: "ConnectLn Free",
      yearlyPrice: "$0",
      monthlyPrice: "$0",
      unit: "forever",
      highlight: false,
      description: "Messaging, 1-on-1 & group WebRTC calls, verified profile, jobs browsing, and profession feed.",
      cta: "Activate Free Plan",
      includedApps: ["mail", "calls", "docs", "sheets", "slides"],
    },
    {
      id: "basic",
      name: "ConnectLn Basic",
      yearlyPrice: "$19.99",
      monthlyPrice: "$2.49",
      unit: "year",
      unitMonthly: "month",
      highlight: false,
      description: "Ad-free workspace, expanded file sharing in calls, priority dispatch alerts, and verified badge tools.",
      cta: "Select Basic",
      includedApps: ["mail", "calls", "docs", "sheets", "slides", "forms"],
    },
    {
      id: "pro",
      name: "ConnectLn Pro",
      yearlyPrice: "$69.99",
      monthlyPrice: "$6.99",
      unit: "first year",
      unitMonthly: "month",
      strikePrice: "$99.99",
      highlight: true,
      badge: "Recommended",
      description: "Full Noctis AI Assistant, CareerSuite interview coach, HD call recording & recaps, and priority jobs matching.",
      cta: "Activate Pro Trial",
      includedApps: ["mail", "calls", "docs", "sheets", "slides", "sign", "invoice", "boards", "forms", "noctis"],
    },
    {
      id: "pro_plus",
      name: "ConnectLn Pro Plus",
      yearlyPrice: "$129.99",
      monthlyPrice: "$12.99",
      unit: "year",
      unitMonthly: "month",
      highlight: false,
      description: "Share workspace benefits across up to 6 crew members or collaborators with shared calendars & files.",
      cta: "Choose Pro Plus",
      includedApps: ["mail", "calls", "docs", "sheets", "slides", "sign", "invoice", "boards", "forms", "noctis"],
    },
  ],
  business: [
    {
      id: "starter_crew",
      name: "Starter Crew",
      yearlyPrice: "$0",
      monthlyPrice: "$0",
      unit: "up to 3 seats",
      highlight: false,
      description: "Company profile, verified directory listing, group messaging, and team voice/video huddles.",
      cta: "Activate Starter Crew",
      includedApps: ["mail", "calls", "docs", "sheets", "boards"],
    },
    {
      id: "business_standard",
      name: "Business Standard",
      yearlyPrice: "$149.00",
      monthlyPrice: "$14.50",
      unit: "user / year",
      unitMonthly: "user / month",
      highlight: false,
      description: "Procurement & RFP desk, calendar booking, Seller Center storefronts, and audit-ready call attendance logs.",
      cta: "Select Standard",
      includedApps: ["mail", "calls", "docs", "sheets", "slides", "sign", "invoice", "boards", "forms"],
    },
    {
      id: "business_premium",
      name: "Business Premium",
      yearlyPrice: "$249.00",
      monthlyPrice: "$22.90",
      unit: "user / year",
      unitMonthly: "user / month",
      strikePrice: "$299.00",
      highlight: true,
      badge: "Best Value",
      description: "Everything in Standard plus Noctis AI Executive Advisor, FIDO2 passkey enforcement, and multi-org IAM.",
      cta: "Activate Business Premium",
      includedApps: ["mail", "calls", "docs", "sheets", "slides", "sign", "invoice", "boards", "forms", "noctis"],
    },
    {
      id: "sovereign_enterprise",
      name: "Sovereign Enterprise",
      yearlyPrice: "Custom",
      monthlyPrice: "Custom",
      unit: "dedicated deployment",
      highlight: false,
      description: "Private trade enclaves, dedicated TURN media relay, custom SSO/SAML, and compliance retention controls.",
      cta: "Request Architecture",
      includedApps: ["mail", "calls", "docs", "sheets", "slides", "sign", "invoice", "boards", "forms", "noctis"],
    },
  ],
}

const PLAN_COMPARISON_ROWS: Record<
  "individual" | "business",
  Array<{ feature: string; values: [string, string, string, string] }>
> = {
  individual: [
    { feature: "Mail, Messaging & 1:1 / Group HD Calls", values: ["Included", "Included", "HD + Screenshare", "Up to 6 crew members"] },
    { feature: "ConnectLn Docs, Sheets & Slides + Print", values: ["Core editing", "Full editing", "Full + Snapshots", "Shared team templates"] },
    { feature: "Power Apps (Sign, Invoice, Boards, Forms)", values: ["Up to 3 active", "Standard limits", "Unlimited", "Unlimited + Shared"] },
    { feature: "Noctis AI Assistant & Thread Recaps", values: ["Daily quota", "Standard", "Unlimited Pro", "Unlimited · 6 seats"] },
    { feature: "Verified Jobs & Noctis Learning Academy", values: ["Included", "Ad-free", "Priority Matching", "Priority · 6 seats"] },
    { feature: "SHA-256 Document Sealing & Passkeys", values: ["Included", "Included", "Included", "Included"] },
  ],
  business: [
    { feature: "Mail, Group HD Calls & Team Rooms", values: ["Up to 3 seats", "Unlimited hosts", "Unlimited + Recaps", "Dedicated relay"] },
    { feature: "ConnectLn Docs, Sheets & Slides Suite", values: ["Included", "Full + Exports", "Full + Audit History", "Custom Branding"] },
    { feature: "Power Apps (Sign, Invoice, Boards, Forms)", values: ["Starter limits", "Full Workflow", "Unlimited + Ledger", "Unlimited + API"] },
    { feature: "Procurement, RFPs & Seller Center", values: ["Directory listing", "Full RFP Desk", "Priority RFPs + Escrow", "Private Enclaves"] },
    { feature: "Noctis AI Executive Advisor", values: ["Preview", "Team Drafting", "Full Unlimited", "Isolated Tenant"] },
    { feature: "Security (FIDO2 Passkeys, E2EE, IAM)", values: ["Standard", "Passkeys + Logs", "Enforced FIDO2 + IAM", "Custom SSO/SAML"] },
  ],
}

const STACK_REPLACEMENTS = [
  { category: "Business Email & Team Chat", standaloneMonthly: 12, app: "Mail & Chat" },
  { category: "HD Video Conferencing & Voice", standaloneMonthly: 15, app: "Vibe Calls & Studio" },
  { category: "Docs, Sheets & Slides Editors", standaloneMonthly: 12, app: "ConnectLn Studio" },
  { category: "Electronic Signatures & SHA-256", standaloneMonthly: 25, app: "ConnectLn Sign" },
  { category: "Invoicing & Expense Ledger", standaloneMonthly: 20, app: "ConnectLn Invoice" },
  { category: "Project & Crew Task Boards", standaloneMonthly: 10, app: "ConnectLn Boards" },
  { category: "Intake Forms & Response Analytics", standaloneMonthly: 15, app: "ConnectLn Forms" },
]

export function ConnectLnPlansBillingView({
  currentUser,
  onNavigateTab,
  initialPlanId,
  initialCycle,
  initialSeats,
}: ConnectLnPlansBillingViewProps) {
  const userKey = String((currentUser as any)?.email || currentUser?.id || currentUser?.name || "guest")
    .toLowerCase()
    .trim()

  const initialAud: "individual" | "business" =
    initialPlanId && PLAN_TIERS.business.some((p) => p.id === initialPlanId) ? "business" : "individual"

  const [planAudience, setPlanAudience] = useState<"individual" | "business">(initialAud)
  const [billingCycle, setBillingCycle] = useState<"yearly" | "monthly">(initialCycle || "yearly")
  const [businessSeats, setBusinessSeats] = useState<number>(
    initialSeats && initialSeats >= 1 && initialSeats <= 100 ? initialSeats : 5
  )
  const [activePlan, setActivePlan] = useState<{
    planId: string
    planName: string
    audience: "individual" | "business"
    billingCycle: "yearly" | "monthly"
    seats: number
    status: "active" | "trialing" | "enterprise_requested"
  }>({
    planId: "free",
    planName: "ConnectLn Free",
    audience: "individual",
    billingCycle: "yearly",
    seats: 1,
    status: "active",
  })
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showCompare, setShowCompare] = useState(false)
  const [showSavings, setShowSavings] = useState(false)
  const [showEnterpriseBox, setShowEnterpriseBox] = useState(false)
  const [enterpriseNote, setEnterpriseNote] = useState("")

  useEffect(() => {
    let cancelled = false
    fetch(`/api/connectin/plans?userKey=${encodeURIComponent(userKey)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.plan) return
        setActivePlan(data.plan)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [userKey])

  const handleSelectPlan = async (plan: (typeof PLAN_TIERS.individual)[number]) => {
    if (plan.id === "sovereign_enterprise") {
      setShowEnterpriseBox(true)
      return
    }
    setSavingPlanId(plan.id)
    const seats = planAudience === "business" ? businessSeats : plan.id === "pro_plus" ? 6 : 1
    const status = plan.id === "pro" ? "trialing" : "active"
    try {
      const res = await fetch("/api/connectin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userKey,
          planId: plan.id,
          planName: plan.name,
          audience: planAudience,
          billingCycle,
          seats,
          status,
        }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok && data?.plan) {
        setActivePlan(data.plan)
        setFeedback(`✓ Workspace updated to ${plan.name} (${billingCycle}, ${seats} ${seats === 1 ? "seat" : "seats"}).`)
      }
    } catch {
      setFeedback("Unable to reach billing service; please try again.")
    } finally {
      setSavingPlanId(null)
    }
  }

  const handleEnterpriseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPlanId("sovereign_enterprise")
    try {
      const res = await fetch("/api/connectin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userKey,
          planId: "sovereign_enterprise",
          planName: "Sovereign Enterprise",
          audience: "business",
          billingCycle,
          seats: businessSeats,
          status: "enterprise_requested",
          enterpriseNote: enterpriseNote.trim() || `Dedicated enclave & TURN deployment (${businessSeats} seats)`,
        }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok && data?.plan) {
        setActivePlan(data.plan)
      }
      await fetch("/api/connectin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          senderName: currentUser?.name || "ConnectLn Member",
          senderEmail: (currentUser as any)?.email || "",
          senderAvatar: currentUser?.avatar || "",
          senderRole: currentUser?.headline || "ConnectLn Member",
          recipientName: "Kwesi Asiedu",
          recipientHeadline: "Founder & Chief Security Officer @ Expedite Consults",
          text: `[Sovereign Enterprise Inquiry · ${businessSeats} seats · ${billingCycle}]\n${enterpriseNote.trim() || "Requesting dedicated trade enclave, TURN media relay & SSO/SAML setup."}`,
          channelType: "People",
        }),
      }).catch(() => {})
      setFeedback("✓ Sovereign Enterprise deployment request saved and routed to Expedite Architecture Desk.")
      setShowEnterpriseBox(false)
      setEnterpriseNote("")
    } finally {
      setSavingPlanId(null)
    }
  }

  const plans = PLAN_TIERS[planAudience]
  const totalStandaloneUsd = STACK_REPLACEMENTS.reduce((acc, item) => acc + item.standaloneMonthly, 0)

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      {/* Top Active Plan Banner */}
      <div className="rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-bold text-[#0A66C2] dark:text-sky-300">
              <Crown className="h-3.5 w-3.5" />
              <span>ConnectLn 360 Plans &amp; Billing</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>
                Active: {activePlan.planName} ({activePlan.seats} {activePlan.seats === 1 ? "seat" : "seats"} · {activePlan.billingCycle})
              </span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Manage your ConnectLn 360 subscription &amp; crew seats
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            All Mail, HD Calls, Studio Apps (Docs/Sheets/Slides), Power Apps (Sign/Invoice/Boards/Forms), and Noctis AI entitlements sync across every device.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab("home")}
          className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-3.5 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
        >
          Back to Feed
        </button>
      </div>

      {feedback && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 px-4 py-3 text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-2">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback(null)} className="text-xs underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Audience & Cycle Switchers */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(["individual", "business"] as const).map((aud) => (
            <button
              key={aud}
              type="button"
              onClick={() => setPlanAudience(aud)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold cursor-pointer transition-colors ${
                planAudience === aud
                  ? "bg-[#0B1F3A] text-white"
                  : "bg-[#EAE5DC] text-[#0B1F3A] hover:bg-[#DFD8CC] dark:bg-zinc-800 dark:text-zinc-200"
              }`}
            >
              {aud === "individual" ? "For individuals" : "For business"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-[10.5px] font-bold">
            Save up to 30%
          </span>
          <div className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1 text-xs font-bold">
            {(["yearly", "monthly"] as const).map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setBillingCycle(cycle)}
                className={`rounded-full px-3 py-1 capitalize cursor-pointer transition-colors ${
                  billingCycle === cycle
                    ? "bg-[#0B1F3A] text-white"
                    : "text-zinc-600 dark:text-zinc-300"
                }`}
              >
                {cycle}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Business Seat Estimator */}
      {planAudience === "business" && (
        <div className="rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="h-4 w-4 text-[#0067B8]" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Team Seat Estimator ({businessSeats} {businessSeats === 1 ? "seat" : "seats"}):
            </span>
            <input
              type="range"
              aria-label="Business team seats"
              min={1}
              max={100}
              value={businessSeats}
              onChange={(e) => setBusinessSeats(Number(e.target.value))}
              className="w-32 sm:w-44 accent-[#0067B8] cursor-pointer"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="text-zinc-600 dark:text-zinc-300 font-semibold">
              Standard:{" "}
              <strong className="text-zinc-900 dark:text-white">
                ${(businessSeats * (billingCycle === "yearly" ? 149 : 14.5)).toLocaleString()}/{billingCycle === "yearly" ? "yr" : "mo"}
              </strong>
            </span>
            <span className="text-zinc-600 dark:text-zinc-300 font-semibold">
              Premium:{" "}
              <strong className="text-[#0067B8] dark:text-sky-400">
                ${(businessSeats * (billingCycle === "yearly" ? 249 : 22.9)).toLocaleString()}/{billingCycle === "yearly" ? "yr" : "mo"}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {plans.map((plan) => {
          const isCurrent = activePlan.planId === plan.id
          const isHighlighted = plan.highlight || initialPlanId === plan.id
          const displayPrice = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice
          const displayUnit =
            billingCycle === "yearly" ? plan.unit : (plan as { unitMonthly?: string }).unitMonthly || plan.unit
          const badges = PLAN_APP_ICONS.filter((b) => plan.includedApps.includes(b.key))
          return (
            <div
              key={plan.id}
              className={`flex flex-col justify-between rounded-2xl border bg-white dark:bg-zinc-900 overflow-hidden shadow-xs ${
                isHighlighted
                  ? "border-[#0B1F3A] dark:border-sky-500 ring-1 ring-[#0B1F3A] dark:ring-sky-500"
                  : "border-[#E7E2DA] dark:border-zinc-800"
              }`}
            >
              <div>
                {(plan.badge || isCurrent) && (
                  <div
                    className={`px-4 py-1.5 text-center text-[11px] font-bold text-white ${
                      isCurrent ? "bg-emerald-600" : "bg-[#0B1F3A]"
                    }`}
                  >
                    {isCurrent ? "✓ Current Active Plan" : plan.badge}
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">{plan.name}</h2>
                  <div>
                    {billingCycle === "yearly" && plan.strikePrice && (
                      <p className="text-sm font-medium text-zinc-400 line-through">{plan.strikePrice}</p>
                    )}
                    <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">{displayPrice}</p>
                    <p className="text-xs text-zinc-500">/{displayUnit}</p>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{plan.description}</p>
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                      Apps included ({badges.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {badges.map((b) => {
                        const Icon = b.icon
                        return (
                          <span
                            key={b.key}
                            title={b.label}
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-white ${b.color}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  type="button"
                  disabled={savingPlanId === plan.id}
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full rounded-xl py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                    isCurrent
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : isHighlighted
                      ? "bg-[#0B1F3A] hover:bg-[#163259] !text-white"
                      : "bg-[#0067B8] hover:bg-[#00559B] !text-white"
                  }`}
                >
                  {savingPlanId === plan.id
                    ? "Saving..."
                    : isCurrent
                    ? "✓ Active on Account"
                    : plan.cta}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Sovereign Enterprise Inline Request Form */}
      {showEnterpriseBox && (
        <form
          onSubmit={handleEnterpriseSubmit}
          className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-xs"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-600" />
              <span>Request Sovereign Enterprise Deployment ({businessSeats} seats)</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowEnterpriseBox(false)}
              className="text-xs text-zinc-500 hover:text-zinc-900 cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <textarea
            rows={3}
            value={enterpriseNote}
            onChange={(e) => setEnterpriseNote(e.target.value)}
            placeholder="Describe compliance requirements (SSO/SAML, private enclave, dedicated TURN relay, retention policy)..."
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0067B8]"
          />
          <button
            type="submit"
            disabled={savingPlanId === "sovereign_enterprise"}
            className="rounded-xl bg-[#0B1F3A] hover:bg-[#163259] !text-white px-4 py-2 text-xs font-bold cursor-pointer"
          >
            {savingPlanId === "sovereign_enterprise" ? "Submitting..." : "Submit Enterprise Architecture Request"}
          </button>
        </form>
      )}

      {/* Comparison & Stack Consolidation Toggles */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowCompare((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer"
        >
          <span>Compare all plan features</span>
          {showCompare ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => setShowSavings((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 px-4 py-2 text-xs font-bold text-emerald-900 dark:text-emerald-200 cursor-pointer"
        >
          <span>Replace 7 separate tools with 1 (${totalStandaloneUsd}/mo standalone savings)</span>
          {showSavings ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {showCompare && (
        <div className="rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto shadow-xs">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-[#FAF7F2] dark:bg-zinc-800 border-b border-[#E7E2DA] dark:border-zinc-700">
              <tr>
                <th className="px-4 py-3 font-bold text-zinc-900 dark:text-white">Capability</th>
                {plans.map((p) => (
                  <th key={p.id} className="px-4 py-3 font-bold text-zinc-900 dark:text-white">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {PLAN_COMPARISON_ROWS[planAudience].map((row) => (
                <tr key={row.feature}>
                  <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">{row.feature}</td>
                  {row.values.map((val, idx) => (
                    <td key={`${row.feature}-${idx}`} className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showSavings && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Consolidate 7 standalone subscriptions into ConnectLn 360
            </h3>
            <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
              Typical stack: <span className="line-through text-zinc-400">${totalStandaloneUsd}/mo</span> vs ConnectLn Pro $6.99/mo
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {STACK_REPLACEMENTS.map((item) => (
              <div
                key={item.category}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-800/50 p-3 flex items-center justify-between gap-2"
              >
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.category}</p>
                  <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Included: {item.app}
                  </p>
                </div>
                <span className="text-[11px] font-mono text-zinc-400 line-through shrink-0">
                  ${item.standaloneMonthly}/mo
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Jump into Included Suite Apps */}
      <div className="rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-900/70 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Included across every plan: FIDO2 Passkeys, SHA-256 Sign Seals, and E2EE Calling</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab("docs")}
            className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:border-[#0067B8] cursor-pointer"
          >
            Open Studio Docs
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab("accountsecurity")}
            className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:border-[#0067B8] cursor-pointer"
          >
            Security &amp; Passkeys
          </button>
        </div>
      </div>
    </div>
  )
}
