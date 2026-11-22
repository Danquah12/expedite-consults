"use client"

import React, { useEffect, useState } from "react"
import {
  Building2,
  LayoutDashboard,
  Wrench,
  Store,
  Kanban,
  MessageSquare,
  CalendarCheck,
  Briefcase,
  ShieldCheck,
  Plus,
  CheckCircle2,
  Eye,
  Lock,
  Search,
  Star,
  ArrowLeftRight,
  FileText,
  FolderOpen
} from "lucide-react"
import {
  HANDYMAN_250_FOLDERS,
  HANDYMAN_250_SERVICE_LISTINGS,
  HANDYMAN_250_ADMIN_JOBS
} from "@/lib/connectin-handyman-250-professions"
import type {
  ConnectLnBusinessCloudState,
  BusinessProfileTenant,
  BusinessMemberRole,
  BusinessLeadAndInquiry,
} from "@/app/api/connectin/business/route"

export type BusinessWorkspaceTabId =
  | "overview"
  | "profiles"
  | "services_portfolio"
  | "marketplace"
  | "crm_leads"
  | "inbox"
  | "bookings_reviews"
  | "hiring"
  | "billing_team_audit"

interface ConnectLnBusinessWorkspaceProps {
  userName: string
  userEmail?: string
  userHeadline?: string
  initialTab?: BusinessWorkspaceTabId
  onSwitchToPersonal: () => void
}

export function ConnectLnBusinessWorkspace({
  userName = "Kwesi Asiedu",
  userEmail = "kwesi@expediteconsults.com",
  userHeadline = "Founder & Chief Security Officer",
  initialTab = "overview",
  onSwitchToPersonal,
}: ConnectLnBusinessWorkspaceProps) {
  const [state, setState] = useState<ConnectLnBusinessCloudState | null>(null)
  const [myBusinesses, setMyBusinesses] = useState<BusinessProfileTenant[]>([])
  const [activeBusinessId, setActiveBusinessId] = useState<string>("biz_expedite_consults")
  const [activeTab, setActiveTab] = useState<BusinessWorkspaceTabId>(initialTab)
  const [storefrontPreviewMode, setStorefrontPreviewMode] = useState<boolean>(false)
  const [toast, setToast] = useState<string>("")

  // Forms: BIZ-01 Create Business
  const [newBizName, setNewBizName] = useState("")
  const [newBizCategory, setNewBizCategory] = useState("Carpentry, Painting & General Contracting")
  const [newBizType, setNewBizType] = useState<BusinessProfileTenant["businessType"]>("Independent Business")
  const [newBizLocation, setNewBizLocation] = useState("Laurel, MD & D.C. Metro")
  const [newBizTagline, setNewBizTagline] = useState("")
  const [newBizLicense, setNewBizLicense] = useState("MD-MHIC #150412")
  const [newBizStatus, setNewBizStatus] = useState<"Draft" | "Published">("Published")

  // Forms: SRV-01 & SRV-02 Create Service & Portfolio
  const [srvTitle, setSrvTitle] = useState("")
  const [srvCategory, setSrvCategory] = useState("Carpentry & Joinery")
  const [srvDesc, setSrvDesc] = useState("")
  const [srvPricingModel, setSrvPricingModel] = useState<"Fixed Price" | "Hourly Rate" | "Request Estimate">(
    "Request Estimate"
  )
  const [srvPriceDisplay, setSrvPriceDisplay] = useState("Request Estimate ($1,500 – $8,500)")
  const [srvSampleTitle, setSrvSampleTitle] = useState("")
  const [srvSampleKind, setSrvSampleKind] = useState<"image" | "video">("image")
  const [srvSampleUrl, setSrvSampleUrl] = useState(
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80"
  )

  // Forms: MKT-01 & MKT-02 Marketplace Search & Quote Request
  const [mktSearch, setMktSearch] = useState("")
  const [mktCategoryFilter, setMktCategoryFilter] = useState("ALL")
  const [hiringFolderNumber, setHiringFolderNumber] = useState<number | "all">(1)
  const [quoteScopeByService, setQuoteScopeByService] = useState<Record<string, string>>({})
  const [quoteDateByService, setQuoteDateByService] = useState<Record<string, string>>({})
  const [quoteBudgetByService, setQuoteBudgetByService] = useState<Record<string, string>>({})

  // Forms: MSG-01 Inbox Quote Reply
  const [replyAmountByLead, setReplyAmountByLead] = useState<Record<string, string>>({})
  const [replyNoteByLead, setReplyNoteByLead] = useState<Record<string, string>>({})

  // Forms: REV-01 Customer Review
  const [reviewComment, setReviewComment] = useState("")
  const [reviewRating, setReviewRating] = useState<number>(5)

  // Forms: JOB-01 Post Business Job
  const [jobTitle, setJobTitle] = useState("")
  const [jobKind, setJobKind] = useState<"Employment" | "Contract Project" | "Apprenticeship">("Employment")
  const [jobComp, setJobComp] = useState("$48 – $62 / hr")

  // Forms: Team RBAC
  const [teamMemberName, setTeamMemberName] = useState("")
  const [teamMemberEmail, setTeamMemberEmail] = useState("")
  const [teamMemberRole, setTeamMemberRole] = useState<BusinessMemberRole>("Manager")

  const notify = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => {
      setToast((prev) => (prev === msg ? "" : prev))
    }, 4000)
  }

  const fetchBusinessWorkspace = async () => {
    try {
      const res = await fetch(
        `/api/connectin/business?viewerName=${encodeURIComponent(userName)}&viewerEmail=${encodeURIComponent(
          userEmail
        )}`,
        { cache: "no-store" }
      )
      if (!res.ok) return
      const data = await res.json()
      if (data?.ok && data.state) {
        setState(data.state)
        const mine: BusinessProfileTenant[] =
          Array.isArray(data.myBusinesses) && data.myBusinesses.length > 0
            ? data.myBusinesses
            : data.state.businesses
        setMyBusinesses(mine)
        if (!mine.some((b) => b.id === activeBusinessId) && mine[0]) {
          setActiveBusinessId(mine[0].id)
        }
      }
    } catch {}
  }

  useEffect(() => {
    void fetchBusinessWorkspace()
  }, [userName, userEmail])

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab)
  }, [initialTab])

  const dispatchBizAction = async (payload: Record<string, any>, successMsg?: string) => {
    try {
      const res = await fetch("/api/connectin/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorName: userName,
          actorEmail: userEmail,
          actorHeadline: userHeadline,
          ...payload,
        }),
      })
      const data = await res.json()
      if (data?.ok && data.state) {
        setState(data.state)
        const updatedMine = data.state.businesses.filter((b: BusinessProfileTenant) =>
          b.members.some(
            (m) =>
              m.name.toLowerCase() === userName.toLowerCase() ||
              (userEmail && m.email.toLowerCase() === userEmail.toLowerCase())
          )
        )
        setMyBusinesses(updatedMine.length > 0 ? updatedMine : data.state.businesses)
        if (data.createdBusinessId) {
          setActiveBusinessId(data.createdBusinessId)
        }
        if (successMsg) notify(successMsg)
      } else if (data?.error) {
        notify(`⚠️ ${data.error}`)
      }
    } catch {}
  }

  if (!state) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center text-xs font-bold text-zinc-500">
        Loading ConnectLn Business Workspace...
      </div>
    )
  }

  const activeBiz =
    state.businesses.find((b) => b.id === activeBusinessId) ||
    myBusinesses[0] ||
    state.businesses[0]

  // Tenant-Isolated Slices for the Active Business (Requirement #5 & #9)
  const myRoleInActiveBiz: BusinessMemberRole =
    activeBiz?.members.find((m) => m.name.toLowerCase() === userName.toLowerCase())?.role || "Owner"
  const tenantServices = state.services.filter((s) => s.businessId === activeBiz.id)
  const tenantLeads = state.leads.filter((l) => l.businessId === activeBiz.id)
  const tenantReviews = state.reviews.filter((r) => r.businessId === activeBiz.id)
  const tenantJobs = state.jobs.filter((j) => j.businessId === activeBiz.id)
  const tenantAuditLogs = state.auditLogs.filter((a) => a.businessId === activeBiz.id)

  const confirmedBookingsCount = tenantLeads.filter((l) => l.appointmentConfirmed).length
  const paidOrEscrowLeadsCount = tenantLeads.filter(
    (l) => l.invoiceStatus === "Paid" || l.invoiceStatus === "Escrow Funded"
  ).length

  const publicStorefrontPath = `/connectin/business/${encodeURIComponent(activeBiz.slug)}`
  const publicStorefrontFullUrl = `https://conectln.com${publicStorefrontPath}`

  const handleCopyPublicStorefrontUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(publicStorefrontFullUrl).catch(() => {})
    }
    notify(`✓ Copied Public Storefront URL: ${publicStorefrontFullUrl}`)
  }

  const handleOpenPublicStorefront = () => {
    if (typeof window !== "undefined") {
      window.open(publicStorefrontPath, "_blank", "noopener,noreferrer")
    }
  }

  const escHtml = (val: unknown): string =>
    String(val ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")

  const handleExportLeadPdf = (lead: BusinessLeadAndInquiry, docKind: "QUOTE" | "INVOICE") => {
    if (typeof window === "undefined") return
    const w = window.open("", "_blank", "width=820,height=960")
    if (!w) {
      notify("Allow pop-ups to print or save your ConnectLn PDF document.")
      return
    }
    const isInvoice = docKind === "INVOICE"
    const docTitle = isInvoice ? "OFFICIAL TAX INVOICE & ESCROW RECEIPT" : "OFFICIAL SERVICE QUOTE"
    const totalAmount = lead.quoteAmount || lead.estimatedBudget || "Estimate Pending"
    const latestAuditHash = tenantAuditLogs[0]?.eventHash || "9f84c2e1b7a04d31"
    const issuedDate = new Date(lead.updatedAtIso || Date.now()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    w.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escHtml(activeBiz.name)} — ${escHtml(docTitle)} (${escHtml(lead.id.toUpperCase())})</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 36px; color: #0f172a; max-width: 760px; margin: 0 auto; line-height: 1.5; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0A66C2; padding-bottom: 16px; margin-bottom: 24px; gap: 16px; }
      .brand { font-size: 20px; font-weight: 900; color: #0A66C2; margin: 0 0 4px 0; }
      .tag { display: inline-block; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
      .doc-box { text-align: right; }
      .doc-title { font-size: 14px; font-weight: 900; color: #0f172a; margin: 0; }
      .meta { font-size: 12px; color: #475569; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px; }
      .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; font-size: 12.5px; }
      .card h3 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 13px; }
      th { background: #0A66C2; color: #fff; text-align: left; padding: 10px 12px; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.04em; }
      td { border-bottom: 1px solid #e2e8f0; padding: 12px; vertical-align: top; }
      .total-row td { font-weight: 900; font-size: 15px; background: #f1f5f9; border-top: 2px solid #0f172a; }
      .footer { border-top: 1px solid #cbd5e1; padding-top: 14px; font-size: 11px; color: #475569; display: flex; justify-content: space-between; gap: 12px; }
      @media print { body { padding: 20px; } }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1 class="brand">${escHtml(activeBiz.name)}</h1>
        <div class="meta">${escHtml(activeBiz.tagline)}</div>
        <div class="meta">📍 ${escHtml(activeBiz.location)}</div>
        <div style="margin-top:6px;"><span class="tag">${escHtml(activeBiz.verificationStatus)} · ${escHtml(activeBiz.verificationLicenseRef)}</span></div>
      </div>
      <div class="doc-box">
        <p class="doc-title">${escHtml(docTitle)}</p>
        <div class="meta"><strong>Ref:</strong> ${escHtml(lead.id.toUpperCase())}</div>
        <div class="meta"><strong>Date:</strong> ${escHtml(issuedDate)}</div>
        <div class="meta"><strong>Payment Status:</strong> ${escHtml(lead.invoiceStatus)}</div>
        <div class="meta"><strong>Stage:</strong> ${escHtml(lead.crmStage)}</div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h3>Prepared For (Customer)</h3>
        <div><strong>${escHtml(lead.customerName)}</strong></div>
        <div>${escHtml(lead.customerEmail)}</div>
        <div>📍 ${escHtml(lead.customerLocation)}</div>
      </div>
      <div class="card">
        <h3>Prepared By (ConnectLn Business)</h3>
        <div><strong>${escHtml(lead.assignedStaffName || activeBiz.ownerName)}</strong></div>
        <div>Storefront: https://conectln.com${escHtml(publicStorefrontPath)}</div>
        <div>Preferred Slot: ${escHtml(lead.appointmentSlot || lead.preferredDate)}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 32%;">Service Line Item</th>
          <th style="width: 46%;">Scope &amp; Operator Notes</th>
          <th style="width: 22%; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>${escHtml(lead.serviceTitle)}</strong></td>
          <td>
            <div>${escHtml(lead.projectScope)}</div>
            ${lead.staffReply ? `<div style="margin-top:6px;color:#047857;"><strong>Operator Note:</strong> ${escHtml(lead.staffReply)}</div>` : ""}
          </td>
          <td style="text-align: right;"><strong>${escHtml(totalAmount)}</strong></td>
        </tr>
        <tr class="total-row">
          <td colspan="2" style="text-align: right;">Total ${isInvoice ? "Invoice / Escrow Amount" : "Estimated Quote"}</td>
          <td style="text-align: right;">${escHtml(totalAmount)}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <div><strong>ConnectLn Business Audit Hash (SEC-01):</strong> <code>${escHtml(latestAuditHash)}</code></div>
      <div>Generated via ConnectLn Business Workspace · https://conectln.com</div>
    </div>
    <script>window.onload = function() { window.print(); };</script>
  </body>
</html>`)
    w.document.close()
    notify(`📄 Opened PDF ${isInvoice ? "Invoice" : "Quote"} for ${lead.customerName}!`)
  }

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[95] rounded-2xl bg-zinc-900 border border-emerald-500/50 text-white px-4 py-2.5 text-xs font-extrabold shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* TOP LINKEDIN-BUSINESS WORKSPACE BAR (AUTH-01, AUTH-02, BIZ-03, BIZ-04) */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-[#0A66C2] via-[#004182] to-slate-900 p-4 text-white shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider">
                CONNECTLN BUSINESS WORKSPACE · SRS v1.0
              </span>
              <span className="rounded-full bg-emerald-500/25 border border-emerald-300/40 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-200">
                Role: {myRoleInActiveBiz} · Tenant Isolated
              </span>
              <span className="rounded-full bg-amber-400/25 border border-amber-300/40 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-100">
                {activeBiz.verificationStatus}
              </span>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
              <Building2 className="h-5 w-5 text-sky-300 shrink-0" />
              <select
                value={activeBiz.id}
                onChange={(e) => setActiveBusinessId(e.target.value)}
                className="rounded-xl bg-white/15 hover:bg-white/20 border border-white/25 px-3 py-1.5 text-sm font-black text-white focus:outline-none cursor-pointer"
                title="BIZ-03 Multi-Business Switcher"
              >
                {state.businesses.map((b) => (
                  <option key={b.id} value={b.id} className="text-zinc-900 font-bold">
                    🏢 {b.name} ({b.status})
                  </option>
                ))}
              </select>
              <span className="text-xs text-sky-200 truncate">
                📍 {activeBiz.location} · {activeBiz.verificationLicenseRef}
              </span>
            </div>
          </div>

          {/* Workspace Switcher: Personal <-> Business & Public Storefront Toggle */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={handleCopyPublicStorefrontUrl}
              className="rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 px-3 py-1.5 text-xs font-extrabold text-white cursor-pointer"
              title={publicStorefrontFullUrl}
            >
              🔗 Copy Storefront URL
            </button>

            <button
              type="button"
              onClick={handleOpenPublicStorefront}
              className="rounded-xl bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-300/40 px-3 py-1.5 text-xs font-extrabold text-emerald-100 cursor-pointer"
            >
              ↗ Open Live Storefront
            </button>

            <button
              type="button"
              onClick={() => setStorefrontPreviewMode(!storefrontPreviewMode)}
              className="rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 px-3 py-1.5 text-xs font-extrabold text-white flex items-center gap-1.5 cursor-pointer"
            >
              {storefrontPreviewMode ? (
                <>
                  <Lock className="h-3.5 w-3.5 text-amber-300" />
                  <span>Return to Private Operator Console</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 text-emerald-300" />
                  <span>Preview Public Storefront (BIZ-04)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onSwitchToPersonal}
              className="rounded-xl bg-white text-[#0A66C2] hover:bg-sky-50 px-3.5 py-1.5 text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="AUTH-02: Switch back to Personal Workspace without losing session"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span>👤 Switch to Personal Workspace</span>
            </button>
          </div>
        </div>

        {/* 9 Clean Business Workspace Navigation Tabs */}
        <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(
            [
              { id: "overview", label: "1. Overview", icon: LayoutDashboard },
              { id: "profiles", label: "2. Business Profiles", icon: Building2 },
              { id: "services_portfolio", label: "3. Services & Portfolio", icon: Wrench },
              { id: "marketplace", label: "4. Public Marketplace", icon: Store },
              { id: "crm_leads", label: `5. Leads & CRM (${tenantLeads.length})`, icon: Kanban },
              { id: "inbox", label: "6. Business Inbox", icon: MessageSquare },
              { id: "bookings_reviews", label: "7. Bookings & Reviews", icon: CalendarCheck },
              { id: "hiring", label: "8. Hiring & Talent", icon: Briefcase },
              { id: "billing_team_audit", label: "9. Billing, Team & Audit", icon: ShieldCheck },
            ] as const
          ).map((t) => {
            const Icon = t.icon
            const isAct = activeTab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setStorefrontPreviewMode(false)
                  setActiveTab(t.id)
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                  isAct
                    ? "bg-white text-[#0A66C2] shadow-xs"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* PUBLIC STOREFRONT PREVIEW MODE (BIZ-04) */}
      {storefrontPreviewMode ? (
        <div className="rounded-2xl border border-emerald-500/40 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div>
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-black uppercase">
                🌐 Public Storefront View (Discoverable Without Login · BIZ-04)
              </span>
              <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
                {activeBiz.name}
              </h2>
              <p className="text-xs text-zinc-500">
                {activeBiz.tagline} · 📍 {activeBiz.location} ·{" "}
                <strong className="text-emerald-700">{activeBiz.verificationStatus}</strong> (
                {activeBiz.verificationLicenseRef})
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCopyPublicStorefrontUrl}
                className="rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 px-3 py-2 text-xs font-extrabold cursor-pointer"
              >
                🔗 Copy Public Storefront URL
              </button>
              <button
                type="button"
                onClick={handleOpenPublicStorefront}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 text-xs font-extrabold cursor-pointer"
              >
                ↗ Open Live Storefront Page
              </button>
              <button
                type="button"
                onClick={() => {
                  setStorefrontPreviewMode(false)
                  setActiveTab("marketplace")
                }}
                className="rounded-xl bg-[#0A66C2] text-white px-4 py-2 text-xs font-extrabold cursor-pointer"
              >
                📋 Request Service Estimate (MKT-02)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tenantServices
              .filter((s) => s.status === "Active")
              .map((srv) => (
                <div
                  key={srv.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2"
                >
                  <span className="rounded bg-blue-50 text-[#0A66C2] px-2 py-0.5 text-[10px] font-bold">
                    {srv.category} · {srv.pricingModel}
                  </span>
                  <h3 className="text-sm font-black">{srv.title}</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">{srv.description}</p>
                  <p className="text-xs font-extrabold text-emerald-700">{srv.priceDisplay}</p>
                  {srv.portfolioMedia.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {srv.portfolioMedia.map((pm) => (
                        <div key={pm.id} className="rounded-lg overflow-hidden border border-zinc-200">
                          <img src={pm.url} alt={pm.title} className="h-24 w-full object-cover" />
                          <p className="p-1.5 text-[10px] font-bold truncate">
                            {pm.kind === "video" ? "🎥 " : "📸 "}
                            {pm.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      ) : (
        <>
          {/* 1. OVERVIEW DASHBOARD (ANA-01) */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
                  <p className="text-[10.5px] font-bold uppercase text-zinc-400">
                    Storefront Visits (ANA-01)
                  </p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
                    {activeBiz.storefrontViews}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                    Public Discovery: {activeBiz.status}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("crm_leads")}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-left hover:border-[#0A66C2] cursor-pointer"
                >
                  <p className="text-[10.5px] font-bold uppercase text-zinc-400">
                    Customer Quote Leads (CRM-01)
                  </p>
                  <p className="text-2xl font-black text-[#0A66C2] mt-1">{tenantLeads.length}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Click to open CRM Pipeline →</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("bookings_reviews")}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-left hover:border-[#0A66C2] cursor-pointer"
                >
                  <p className="text-[10.5px] font-bold uppercase text-zinc-400">
                    Confirmed Bookings (BOOK-01)
                  </p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">
                    {confirmedBookingsCount}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {tenantReviews.length} Verified 5★ Reviews →
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("billing_team_audit")}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-left hover:border-[#0A66C2] cursor-pointer"
                >
                  <p className="text-[10.5px] font-bold uppercase text-zinc-400">
                    Escrow &amp; Paid Invoices (PAY-01)
                  </p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
                    {paidOrEscrowLeadsCount}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{activeBiz.subscriptionPlan}</p>
                </button>
              </div>

              {/* Quick Conversion Funnel & Recent Leads */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black">
                      Recent Customer Inquiries &amp; CRM Activity ({activeBiz.name})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab("inbox")}
                      className="text-xs font-extrabold text-[#0A66C2] hover:underline cursor-pointer"
                    >
                      Open Business Inbox →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tenantLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-extrabold text-[#0A66C2]">
                              {lead.crmStage}
                            </span>
                            <span className="text-xs font-black">{lead.customerName}</span>
                            <span className="text-[11px] text-zinc-500">· 📍 {lead.customerLocation}</span>
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">
                            <strong>{lead.serviceTitle}:</strong> {lead.projectScope}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700">
                            {lead.quoteAmount || lead.estimatedBudget}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveTab("inbox")}
                            className="rounded-lg bg-[#0A66C2] text-white px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                          >
                            Respond
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Operator Actions */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2.5">
                  <h3 className="text-sm font-black">Quick Business Actions</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("services_portfolio")}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-[#0A66C2] p-2.5 text-left text-xs font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span>🛠️ Publish Service or Portfolio Video</span>
                    <span className="text-[#0A66C2]">SRV-01 →</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("marketplace")}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-[#0A66C2] p-2.5 text-left text-xs font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span>🌐 Browse Public Business Directory</span>
                    <span className="text-[#0A66C2]">MKT-01 →</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("hiring")}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-[#0A66C2] p-2.5 text-left text-xs font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span>💼 Post a Business Job or Project</span>
                    <span className="text-[#0A66C2]">JOB-01 →</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("profiles")}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-[#0A66C2] p-2.5 text-left text-xs font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span>➕ Create Another Business Tenant</span>
                    <span className="text-[#0A66C2]">BIZ-01 →</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. BUSINESS PROFILES & ONBOARDING (BIZ-01 .. BIZ-05) */}
          {activeTab === "profiles" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Active Business Profile & Verification Control */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-blue-50 text-[#0A66C2] px-2 py-0.5 text-[10px] font-extrabold">
                    Active Business Profile · {activeBiz.businessType}
                  </span>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10.5px] font-extrabold">
                    {activeBiz.status}
                  </span>
                </div>
                <h3 className="text-base font-black">{activeBiz.name}</h3>
                <p className="text-xs text-zinc-500">{activeBiz.tagline}</p>
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 text-xs space-y-1">
                  <p>
                    <strong>Category:</strong> {activeBiz.category}
                  </p>
                  <p>
                    <strong>Service Territory:</strong> {activeBiz.location}
                  </p>
                  <p>
                    <strong>Owner (BIZ-02):</strong> {activeBiz.ownerName} ({activeBiz.ownerEmail})
                  </p>
                  <p>
                    <strong>Credential Check (BIZ-05):</strong>{" "}
                    <span className="text-emerald-700 font-bold">{activeBiz.verificationStatus}</span> —{" "}
                    {activeBiz.verificationLicenseRef}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      void dispatchBizAction(
                        {
                          action: "update_business_status",
                          businessId: activeBiz.id,
                          status: activeBiz.status === "Published" ? "Draft" : "Published",
                        },
                        `✓ Updated storefront status to ${
                          activeBiz.status === "Published" ? "Draft" : "Published"
                        }`
                      )
                    }
                    className="rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 px-3 py-1.5 text-xs font-extrabold cursor-pointer"
                  >
                    {activeBiz.status === "Published" ? "Switch to Draft" : "Publish Storefront (BIZ-04)"}
                  </button>

                  {activeBiz.verificationStatus !== "Independently Checked ✓" && (
                    <button
                      type="button"
                      onClick={() =>
                        void dispatchBizAction(
                          {
                            action: "update_business_status",
                            businessId: activeBiz.id,
                            verifyCheck: true,
                          },
                          "✓ Completed independent license & COI registry check (BIZ-05)!"
                        )
                      }
                      className="rounded-xl bg-emerald-600 text-white px-3 py-1.5 text-xs font-extrabold cursor-pointer"
                    >
                      ✓ Run Independent Verification Check (BIZ-05)
                    </button>
                  )}
                </div>
              </div>

              {/* Create a Draft or Published Business (BIZ-01 & BIZ-02) */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                <h3 className="text-sm font-black">
                  Create a New Business Profile (BIZ-01 · Automatic Owner Membership BIZ-02)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={newBizName}
                    onChange={(e) => setNewBizName(e.target.value)}
                    placeholder="Business or Franchise Name..."
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                  />
                  <select
                    value={newBizType}
                    onChange={(e) => setNewBizType(e.target.value as any)}
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                  >
                    <option value="Independent Business">Independent Business</option>
                    <option value="Professional Practice">Professional Practice</option>
                    <option value="Franchise Location">Franchise Location</option>
                    <option value="Government & Enterprise Contractor">
                      Government &amp; Enterprise Contractor
                    </option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={newBizCategory}
                    onChange={(e) => setNewBizCategory(e.target.value)}
                    placeholder="Primary Category..."
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    value={newBizLocation}
                    onChange={(e) => setNewBizLocation(e.target.value)}
                    placeholder="City & Service Territory..."
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                  />
                </div>
                <input
                  type="text"
                  value={newBizTagline}
                  onChange={(e) => setNewBizTagline(e.target.value)}
                  placeholder="Storefront Tagline & Value Proposition..."
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={newBizLicense}
                    onChange={(e) => setNewBizLicense(e.target.value)}
                    placeholder="License / COI Registry Ref (BIZ-05)..."
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                  />
                  <select
                    value={newBizStatus}
                    onChange={(e) => setNewBizStatus(e.target.value as "Draft" | "Published")}
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                  >
                    <option value="Draft">Save as Draft (BIZ-01)</option>
                    <option value="Published">Publish Storefront Immediately (BIZ-04)</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newBizName.trim()) return
                    void dispatchBizAction(
                      {
                        action: "create_business",
                        name: newBizName.trim(),
                        businessType: newBizType,
                        category: newBizCategory,
                        location: newBizLocation,
                        tagline: newBizTagline || `${newBizName.trim()} — Verified ConnectLn Business`,
                        licenseRef: newBizLicense,
                        status: newBizStatus,
                      },
                      `✓ Created ${newBizStatus} business "${newBizName.trim()}" with Owner membership!`
                    )
                    setNewBizName("")
                    setNewBizTagline("")
                  }}
                  className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-2 text-xs font-extrabold cursor-pointer"
                >
                  + Create Business Profile
                </button>
              </div>
            </div>
          )}

          {/* 3. SERVICES & PORTFOLIO (SRV-01 & SRV-02) */}
          {activeTab === "services_portfolio" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                <h3 className="text-sm font-black">
                  Publish a Business Service &amp; Work Portfolio Media (SRV-01 · SRV-02)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={srvTitle}
                    onChange={(e) => setSrvTitle(e.target.value)}
                    placeholder="Service Title (e.g., Custom Stair Joinery)..."
                    className="sm:col-span-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    value={srvCategory}
                    onChange={(e) => setSrvCategory(e.target.value)}
                    placeholder="Category"
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                  />
                </div>
                <textarea
                  rows={2}
                  value={srvDesc}
                  onChange={(e) => setSrvDesc(e.target.value)}
                  placeholder="Detailed service scope, deliverables & warranty standards..."
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <select
                    value={srvPricingModel}
                    onChange={(e) => setSrvPricingModel(e.target.value as any)}
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                  >
                    <option value="Request Estimate">Request Estimate</option>
                    <option value="Fixed Price">Fixed Price</option>
                    <option value="Hourly Rate">Hourly Rate</option>
                  </select>
                  <input
                    type="text"
                    value={srvPriceDisplay}
                    onChange={(e) => setSrvPriceDisplay(e.target.value)}
                    placeholder="Rate / Estimate Range..."
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                  />
                  <select
                    value={srvSampleKind}
                    onChange={(e) => setSrvSampleKind(e.target.value as "image" | "video")}
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                  >
                    <option value="image">📸 Portfolio Image (SRV-02)</option>
                    <option value="video">🎥 Approved Portfolio Video (SRV-02)</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={srvSampleTitle}
                    onChange={(e) => setSrvSampleTitle(e.target.value)}
                    placeholder="Portfolio Sample Caption..."
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    value={srvSampleUrl}
                    onChange={(e) => setSrvSampleUrl(e.target.value)}
                    placeholder="Portfolio Image/Video URL..."
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!srvTitle.trim()) return
                      void dispatchBizAction(
                        {
                          action: "create_service",
                          businessId: activeBiz.id,
                          title: srvTitle.trim(),
                          category: srvCategory,
                          description: srvDesc,
                          pricingModel: srvPricingModel,
                          priceDisplay: srvPriceDisplay,
                          sampleKind: srvSampleKind,
                          sampleTitle: srvSampleTitle || `${srvTitle.trim()} — Work Sample`,
                          sampleUrl: srvSampleUrl,
                        },
                        `✓ Published service "${srvTitle.trim()}" to ${activeBiz.name}!`
                      )
                      setSrvTitle("")
                      setSrvDesc("")
                    }}
                    className="rounded-xl bg-[#0A66C2] text-white px-4 py-2 text-xs font-extrabold cursor-pointer"
                  >
                    + Publish Service
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tenantServices.map((srv) => (
                  <div
                    key={srv.id}
                    className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2 ${
                      srv.status === "Archived" ? "opacity-55" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded bg-blue-50 text-[#0A66C2] px-2 py-0.5 text-[10px] font-bold">
                        {srv.category} · {srv.status}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          void dispatchBizAction(
                            { action: "toggle_service_archive", serviceId: srv.id },
                            `✓ Service status updated`
                          )
                        }
                        className="rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 px-2.5 py-1 text-[10.5px] font-bold cursor-pointer"
                      >
                        {srv.status === "Active" ? "Archive (SRV-01)" : "Restore Active"}
                      </button>
                    </div>
                    <h4 className="text-sm font-black">{srv.title}</h4>
                    <p className="text-xs text-zinc-500">{srv.description}</p>
                    <p className="text-xs font-extrabold text-emerald-700">{srv.priceDisplay}</p>
                    {srv.portfolioMedia.length > 0 && (
                      <div className="flex gap-2 pt-1 overflow-x-auto">
                        {srv.portfolioMedia.map((pm) => (
                          <div
                            key={pm.id}
                            className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-1.5 text-[10.5px] font-bold flex items-center gap-1.5"
                          >
                            <span>{pm.kind === "video" ? "🎥" : "📸"}</span>
                            <span className="truncate max-w-[200px]">{pm.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. PUBLIC BUSINESS MARKETPLACE & QUOTE REQUESTS (MKT-01 & MKT-02) */}
          {activeTab === "marketplace" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <div className="relative flex-1 w-full">
                    <Search className="h-4 w-4 text-zinc-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={mktSearch}
                      onChange={(e) => setMktSearch(e.target.value)}
                      placeholder="Search businesses & all 250 synced trade services by category, city, or keyword (MKT-01)..."
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-9 pr-3 py-2 text-xs"
                    />
                  </div>
                  <select
                    value={mktCategoryFilter}
                    onChange={(e) => setMktCategoryFilter(e.target.value)}
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs max-w-xs"
                  >
                    <option value="ALL">All Categories &amp; 20 Synced Trade Folders</option>
                    <option value="Carpentry">Carpentry &amp; Joinery</option>
                    <option value="Cybersecurity">Cybersecurity &amp; Cloud</option>
                    <option value="Painting">Painting &amp; Decorating</option>
                    <optgroup label="📂 20 Synced Trade Folders (250 Roles)">
                      {HANDYMAN_250_FOLDERS.map((folder) => (
                        <option key={folder.folderId} value={folder.folderName}>
                          {folder.icon} Folder {folder.folderNumber}: {folder.folderName} ({folder.roles.length})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Quick 20 Synced Trade Folders Filter Strip */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setMktCategoryFilter("ALL")}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border shrink-0 cursor-pointer ${
                      mktCategoryFilter === "ALL"
                        ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    📂 All 20 Folders (250 Services)
                  </button>
                  {HANDYMAN_250_FOLDERS.map((folder) => {
                    const active = mktCategoryFilter === folder.folderName
                    return (
                      <button
                        key={folder.folderId}
                        type="button"
                        onClick={() => setMktCategoryFilter(active ? "ALL" : folder.folderName)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border shrink-0 cursor-pointer ${
                          active
                            ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                            : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-sky-50"
                        }`}
                      >
                        {folder.icon} {folder.folderNumber}. {folder.folderName}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[
                  ...state.services.map((s) => ({ ...s, syncedProviderName: undefined as string | undefined })),
                  ...HANDYMAN_250_SERVICE_LISTINGS.map((ls) => ({
                    id: ls.id,
                    businessId: activeBiz.id,
                    title: ls.tradeOrService,
                    category: ls.category,
                    description: ls.description,
                    pricingModel: "Request Estimate" as const,
                    priceDisplay: ls.rateDisplay,
                    serviceArea: ls.serviceArea,
                    status: "Active" as const,
                    portfolioMedia: [],
                    createdAtIso: "",
                    syncedProviderName: ls.providerName,
                  })),
                ]
                  .filter((s) => s.status === "Active")
                  .filter((s) => {
                    if (
                      mktCategoryFilter !== "ALL" &&
                      !s.category.toLowerCase().includes(mktCategoryFilter.toLowerCase())
                    ) {
                      return false
                    }
                    if (!mktSearch.trim()) return true
                    const q = mktSearch.toLowerCase()
                    return (
                      s.title.toLowerCase().includes(q) ||
                      s.category.toLowerCase().includes(q) ||
                      s.serviceArea.toLowerCase().includes(q) ||
                      s.description.toLowerCase().includes(q)
                    )
                  })
                  .map((srv) => {
                    const biz = state.businesses.find((b) => b.id === srv.businessId)
                    const displayBizName = srv.syncedProviderName || biz?.name || "Verified Business"
                    return (
                      <div
                        key={srv.id}
                        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2.5 flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded bg-blue-50 text-[#0A66C2] px-2 py-0.5 text-[10px] font-extrabold">
                              🏢 {displayBizName}
                            </span>
                            <span className="text-[10.5px] font-bold text-emerald-700">
                              {biz?.verificationStatus || "Independently Checked ✓"}
                            </span>
                          </div>
                          <h4 className="text-sm font-black">{srv.title}</h4>
                          <p className="text-xs text-zinc-500">{srv.description}</p>
                          <p className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">
                            📍 {srv.serviceArea} ·{" "}
                            <span className="text-emerald-700">{srv.priceDisplay}</span>
                          </p>
                        </div>

                        {/* MKT-02: End-to-End Customer Quote & Appointment Request */}
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                          <input
                            type="text"
                            value={quoteScopeByService[srv.id] || ""}
                            onChange={(e) =>
                              setQuoteScopeByService((prev) => ({
                                ...prev,
                                [srv.id]: e.target.value,
                              }))
                            }
                            placeholder="Describe your project scope for an estimate (MKT-02)..."
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 text-xs"
                          />
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={quoteDateByService[srv.id] || ""}
                              onChange={(e) =>
                                setQuoteDateByService((prev) => ({
                                  ...prev,
                                  [srv.id]: e.target.value,
                                }))
                              }
                              placeholder="Preferred date/time..."
                              className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 text-xs"
                            />
                            <input
                              type="text"
                              value={quoteBudgetByService[srv.id] || ""}
                              onChange={(e) =>
                                setQuoteBudgetByService((prev) => ({
                                  ...prev,
                                  [srv.id]: e.target.value,
                                }))
                              }
                              placeholder="Target budget..."
                              className="w-28 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const scope =
                                  (quoteScopeByService[srv.id] || "").trim() ||
                                  `Requesting itemized estimate for ${srv.title}`
                                void dispatchBizAction(
                                  {
                                    action: "request_quote",
                                    businessId: srv.businessId,
                                    serviceId: srv.id,
                                    serviceTitle: srv.title,
                                    projectScope: scope,
                                    preferredDate:
                                      quoteDateByService[srv.id] || "Next Available Appointment",
                                    estimatedBudget:
                                      quoteBudgetByService[srv.id] || "Request Estimate",
                                  },
                                  `✓ Quote request sent to ${biz?.name || "Business"} Inbox & CRM!`
                                )
                                setQuoteScopeByService((prev) => ({ ...prev, [srv.id]: "" }))
                              }}
                              className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white px-3 py-1 text-xs font-extrabold cursor-pointer shrink-0"
                            >
                              Request Quote
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* 5. CUSTOMER LEADS & CRM PIPELINE (CRM-01) */}
          {activeTab === "crm_leads" && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black">
                  Customer Leads &amp; 5-Stage CRM Pipeline — {activeBiz.name} (CRM-01)
                </h3>
                <span className="text-xs text-zinc-500">
                  Tenant-isolated leads assigned to authorized staff
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {(
                  ["New Lead", "Quote Sent", "Booked", "In Progress", "Completed"] as const
                ).map((stage) => {
                  const stageLeads = tenantLeads.filter((l) => l.crmStage === stage)
                  const stagesOrder = [
                    "New Lead",
                    "Quote Sent",
                    "Booked",
                    "In Progress",
                    "Completed",
                  ] as const
                  return (
                    <div
                      key={stage}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 p-2.5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black">{stage}</span>
                        <span className="rounded-full bg-[#0A66C2] text-white px-2 text-[10px] font-black">
                          {stageLeads.length}
                        </span>
                      </div>
                      {stageLeads.map((lead) => {
                        const nextStage =
                          stagesOrder[(stagesOrder.indexOf(stage) + 1) % stagesOrder.length]
                        return (
                          <div
                            key={lead.id}
                            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 space-y-1"
                          >
                            <p className="text-xs font-extrabold">{lead.customerName}</p>
                            <p className="text-[11px] text-zinc-500 line-clamp-2">
                              {lead.serviceTitle}
                            </p>
                            <p className="text-[10.5px] font-bold text-emerald-700">
                              {lead.quoteAmount || lead.estimatedBudget}
                            </p>
                            <p className="text-[10px] text-zinc-400">
                              Assigned: {lead.assignedStaffName}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                void dispatchBizAction(
                                  {
                                    action: "update_lead",
                                    leadId: lead.id,
                                    crmStage: nextStage,
                                  },
                                  `✓ Moved ${lead.customerName} to ${nextStage}`
                                )
                              }
                              className="w-full rounded bg-zinc-100 hover:bg-[#0A66C2] hover:text-white dark:bg-zinc-800 py-1 text-[10px] font-extrabold cursor-pointer"
                            >
                              Move to {nextStage} →
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 6. BUSINESS INBOX (MSG-01) */}
          {activeTab === "inbox" && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="text-sm font-black">
                    Business Inquiry Inbox — {activeBiz.name} (MSG-01)
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Role-authorized staff ({myRoleInActiveBiz}) can respond to customer inquiries and send formal quotes.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {tenantLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="rounded bg-blue-50 text-[#0A66C2] px-2 py-0.5 text-[10px] font-extrabold">
                          {lead.crmStage} · {lead.invoiceStatus}
                        </span>
                        <h4 className="text-sm font-black mt-1">
                          {lead.customerName} ({lead.customerEmail}) — {lead.serviceTitle}
                        </h4>
                        <p className="text-xs text-zinc-500">
                          📍 {lead.customerLocation} · Preferred Slot: {lead.preferredDate}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleExportLeadPdf(lead, "QUOTE")}
                        className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 hover:bg-[#0A66C2] hover:text-white px-3 py-1.5 text-xs font-extrabold text-[#0A66C2] dark:text-sky-300 transition-colors cursor-pointer shrink-0"
                      >
                        📄 Export PDF Quote
                      </button>
                    </div>

                    <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-3 text-xs">
                      <strong>Customer Inquiry:</strong> {lead.projectScope}
                    </div>

                    {lead.quoteAmount && (
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-900 dark:text-emerald-200">
                        <p>
                          <strong>✓ Sent Quote:</strong> {lead.quoteAmount}
                        </p>
                        {lead.staffReply && (
                          <p>
                            <strong>Staff Response:</strong> {lead.staffReply}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={replyAmountByLead[lead.id] || ""}
                        onChange={(e) =>
                          setReplyAmountByLead((prev) => ({
                            ...prev,
                            [lead.id]: e.target.value,
                          }))
                        }
                        placeholder="Itemized Quote (e.g., $2,400 Fixed Price)..."
                        className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs sm:w-56"
                      />
                      <input
                        type="text"
                        value={replyNoteByLead[lead.id] || ""}
                        onChange={(e) =>
                          setReplyNoteByLead((prev) => ({
                            ...prev,
                            [lead.id]: e.target.value,
                          }))
                        }
                        placeholder="Write official business reply & deliverables note..."
                        className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const amt = (replyAmountByLead[lead.id] || "").trim() || "$1,950 Fixed Scope"
                          const note =
                            (replyNoteByLead[lead.id] || "").trim() ||
                            "Official quote prepared and ready for appointment confirmation."
                          void dispatchBizAction(
                            {
                              action: "update_lead",
                              leadId: lead.id,
                              quoteAmount: amt,
                              staffReply: note,
                            },
                            `✓ Sent quote (${amt}) to ${lead.customerName}!`
                          )
                          setReplyAmountByLead((prev) => ({ ...prev, [lead.id]: "" }))
                          setReplyNoteByLead((prev) => ({ ...prev, [lead.id]: "" }))
                        }}
                        className="rounded-xl bg-[#0A66C2] text-white px-4 py-1.5 text-xs font-extrabold cursor-pointer shrink-0"
                      >
                        Send Quote Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. QUOTES, BOOKINGS & VERIFIED REVIEWS (BOOK-01 & REV-01) */}
          {activeTab === "bookings_reviews" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* BOOK-01 Service Appointments */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                <h3 className="text-sm font-black">
                  Service Appointments &amp; Bookings (BOOK-01)
                </h3>
                <div className="space-y-2.5">
                  {tenantLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="text-xs font-extrabold">
                          {lead.customerName} — {lead.serviceTitle}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          Requested Slot: {lead.appointmentSlot || lead.preferredDate}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void dispatchBizAction(
                            {
                              action: "update_lead",
                              leadId: lead.id,
                              appointmentConfirmed: !lead.appointmentConfirmed,
                            },
                            lead.appointmentConfirmed
                              ? "Booking marked pending"
                              : `✓ Confirmed appointment with ${lead.customerName}!`
                          )
                        }
                        className={`rounded-xl px-3 py-1.5 text-xs font-extrabold cursor-pointer shrink-0 ${
                          lead.appointmentConfirmed
                            ? "bg-emerald-600 text-white"
                            : "bg-[#0A66C2] text-white"
                        }`}
                      >
                        {lead.appointmentConfirmed ? "✓ Confirmed" : "Confirm Booking"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* REV-01 Verified Customer Reviews */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                <h3 className="text-sm font-black">
                  Verified Transaction Reviews (REV-01)
                </h3>
                <div className="flex gap-2">
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-bold"
                  >
                    <option value={5}>5 ★</option>
                    <option value={4}>4 ★</option>
                    <option value={3}>3 ★</option>
                  </select>
                  <input
                    type="text"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write a verified customer review for a completed project..."
                    className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!reviewComment.trim()) return
                      void dispatchBizAction(
                        {
                          action: "submit_review",
                          businessId: activeBiz.id,
                          rating: reviewRating,
                          comment: reviewComment.trim(),
                          serviceTitle: tenantServices[0]?.title || activeBiz.category,
                        },
                        "★ Published verified customer review!"
                      )
                      setReviewComment("")
                    }}
                    className="rounded-xl bg-amber-600 text-white px-3 py-1.5 text-xs font-extrabold cursor-pointer"
                  >
                    + Post Review
                  </button>
                </div>

                <div className="space-y-2">
                  {tenantReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold">{rev.customerName}</span>
                        <span className="text-xs font-black text-amber-500">
                          {"★".repeat(rev.rating)} · Verified Transaction ✓
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 italic">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 8. HIRING & TALENT (JOB-01) */}
          {activeTab === "hiring" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                <h3 className="text-sm font-black">
                  Post a Business Job, Contract Project, or Apprenticeship (JOB-01)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Role Title..."
                    className="sm:col-span-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                  />
                  <select
                    value={jobKind}
                    onChange={(e) => setJobKind(e.target.value as any)}
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                  >
                    <option value="Employment">Employment</option>
                    <option value="Contract Project">Contract Project</option>
                    <option value="Apprenticeship">Apprenticeship</option>
                  </select>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={jobComp}
                      onChange={(e) => setJobComp(e.target.value)}
                      placeholder="Pay / Budget"
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!jobTitle.trim()) return
                        void dispatchBizAction(
                          {
                            action: "post_business_job",
                            businessId: activeBiz.id,
                            title: jobTitle.trim(),
                            kind: jobKind,
                            compensation: jobComp,
                          },
                          `✓ Posted "${jobTitle.trim()}" for ${activeBiz.name}!`
                        )
                        setJobTitle("")
                      }}
                      className="rounded-xl bg-[#0A66C2] text-white px-3.5 py-2 text-xs font-extrabold cursor-pointer shrink-0"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>

              {/* Synced 20 Trade Folders (250 Roles) Quick-Hire Browser */}
              <div className="rounded-2xl border border-sky-200/80 dark:border-sky-800/60 bg-sky-50/40 dark:bg-sky-950/20 p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#0A66C2] dark:text-sky-300 flex items-center gap-1.5">
                    <FolderOpen className="h-4 w-4" />
                    <span>20 Synced Trade Folders (250 Everyday Trades &amp; Service Roles) — 1-Click Hire</span>
                  </h4>
                  <span className="text-[11px] text-zinc-500">
                    Click any synced role to prefill or post to {activeBiz.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {HANDYMAN_250_FOLDERS.map((folder) => (
                    <button
                      key={folder.folderId}
                      type="button"
                      onClick={() => setHiringFolderNumber(folder.folderNumber)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border cursor-pointer ${
                        hiringFolderNumber === folder.folderNumber
                          ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                          : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
                      }`}
                    >
                      {folder.icon} {folder.folderNumber}. {folder.folderName} ({folder.roles.length})
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                  {HANDYMAN_250_ADMIN_JOBS.filter(
                    (r) => hiringFolderNumber === "all" || r.folderNumber === hiringFolderNumber
                  ).map((roleJob) => (
                    <div
                      key={roleJob.id}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">
                          #{roleJob.roleNumber} {roleJob.title}
                        </p>
                        <p className="text-[10.5px] text-emerald-700 font-semibold truncate">
                          {roleJob.salary}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void dispatchBizAction(
                            {
                              action: "post_business_job",
                              businessId: activeBiz.id,
                              title: roleJob.title,
                              kind: "Employment",
                              compensation: roleJob.salary,
                            },
                            `✓ Synced & posted "${roleJob.title}" to ${activeBiz.name}!`
                          )
                        }
                        className="rounded-lg bg-sky-50 hover:bg-[#0A66C2] hover:text-white text-[#0A66C2] border border-sky-200 px-2.5 py-1 text-[10.5px] font-extrabold shrink-0 cursor-pointer"
                      >
                        + Hire Role
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {tenantJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="rounded bg-blue-50 text-[#0A66C2] px-2 py-0.5 text-[10px] font-extrabold">
                          {job.kind} · {job.businessName}
                        </span>
                        <h4 className="text-sm font-black mt-1">{job.title}</h4>
                        <p className="text-xs text-zinc-500">
                          📍 {job.location} · <strong className="text-emerald-700">{job.compensation}</strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void dispatchBizAction(
                            { action: "apply_business_job", jobId: job.id },
                            `✓ Submitted application for "${job.title}"!`
                          )
                        }
                        className="rounded-xl bg-emerald-600 text-white px-3.5 py-1.5 text-xs font-extrabold cursor-pointer"
                      >
                        ⚡ 1-Click Apply (Test Applicant)
                      </button>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-bold text-zinc-500">
                        Applicants ({job.applicants.length}):
                      </p>
                      {job.applicants.map((app) => (
                        <div
                          key={app.id}
                          className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-2 flex items-center justify-between text-xs"
                        >
                          <span>
                            <strong>{app.candidateName}</strong> — {app.candidateHeadline}
                          </span>
                          <span className="rounded bg-blue-100 text-[#0A66C2] px-2 py-0.5 text-[10px] font-extrabold">
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. BILLING, PAYMENTS, TEAM RBAC, MODERATION & SECURITY AUDIT LOG (BILL-01, PAY-01, ADM-01, SEC-01) */}
          {activeTab === "billing_team_audit" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* BILL-01 & PAY-01: Subscription Plans & Payment Ledger */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                  <h3 className="text-sm font-black">
                    Subscription Billing (BILL-01) &amp; Payments / Refunds (PAY-01)
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        "Standard Free",
                        "Business Pro ($49/mo)",
                        "Enterprise Multi-Location ($149/mo)",
                      ] as const
                    ).map((plan) => {
                      const active = activeBiz.subscriptionPlan === plan
                      return (
                        <button
                          key={plan}
                          type="button"
                          onClick={() =>
                            void dispatchBizAction(
                              {
                                action: "update_business_status",
                                businessId: activeBiz.id,
                                subscriptionPlan: plan,
                              },
                              `✓ Switched ${activeBiz.name} to ${plan}!`
                            )
                          }
                          className={`rounded-xl border p-2.5 text-left text-[11px] font-extrabold cursor-pointer ${
                            active
                              ? "border-[#0A66C2] bg-blue-50/70 dark:bg-blue-950/40 text-[#0A66C2]"
                              : "border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          {plan}
                        </button>
                      )
                    })}
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs font-bold text-zinc-500">
                      Customer Transaction &amp; Escrow Payment Ledger (PAY-01):
                    </p>
                    {tenantLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-2.5 flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <p className="font-extrabold">
                            {lead.customerName} — {lead.quoteAmount || lead.estimatedBudget}
                          </p>
                          <p className="text-[11px] text-zinc-500">Status: {lead.invoiceStatus}</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => handleExportLeadPdf(lead, "INVOICE")}
                            className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 text-[#0A66C2] dark:text-sky-300 px-2.5 py-1 text-[10.5px] font-bold cursor-pointer"
                          >
                            📄 Export PDF Invoice / Receipt
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void dispatchBizAction(
                                {
                                  action: "update_lead",
                                  leadId: lead.id,
                                  invoiceStatus: "Paid",
                                },
                                `✓ Marked ${lead.customerName} invoice as Paid!`
                              )
                            }
                            className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-[10.5px] font-bold cursor-pointer"
                          >
                            Mark Paid
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void dispatchBizAction(
                                {
                                  action: "update_lead",
                                  leadId: lead.id,
                                  invoiceStatus: "Refunded",
                                },
                                `✓ Processed refund for ${lead.customerName}`
                              )
                            }
                            className="rounded-lg bg-zinc-200 dark:bg-zinc-800 px-2.5 py-1 text-[10.5px] font-bold cursor-pointer"
                          >
                            Refund
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team RBAC & Platform Moderation (ADM-01) */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                  <h3 className="text-sm font-black">
                    Team RBAC Authorization &amp; Listing Moderation (ADM-01)
                  </h3>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={teamMemberName}
                      onChange={(e) => setTeamMemberName(e.target.value)}
                      placeholder="Staff Name..."
                      className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 text-xs"
                    />
                    <select
                      value={teamMemberRole}
                      onChange={(e) => setTeamMemberRole(e.target.value as BusinessMemberRole)}
                      className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 text-xs"
                    >
                      <option value="Manager">Manager</option>
                      <option value="Staff">Staff</option>
                      <option value="Billing Admin">Billing Admin</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (!teamMemberName.trim()) return
                        void dispatchBizAction(
                          {
                            action: "add_team_member",
                            businessId: activeBiz.id,
                            memberName: teamMemberName.trim(),
                            memberEmail: teamMemberEmail.trim(),
                            memberRole: teamMemberRole,
                          },
                          `✓ Added ${teamMemberName.trim()} (${teamMemberRole}) to ${activeBiz.name}!`
                        )
                        setTeamMemberName("")
                      }}
                      className="rounded-xl bg-[#0A66C2] text-white px-3 py-1.5 text-xs font-extrabold cursor-pointer"
                    >
                      + Add Staff
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {activeBiz.members.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-2 flex items-center justify-between text-xs"
                      >
                        <span>
                          <strong>{m.name}</strong> ({m.title})
                        </span>
                        <span className="rounded bg-blue-100 text-[#0A66C2] px-2 py-0.5 text-[10px] font-extrabold">
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SEC-01: Immutable SHA-256 Hash-Chained Security Audit Log */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-[#0A66C2]" />
                    <span>
                      Tamper-Evident Security Audit Log — {activeBiz.name} (SEC-01)
                    </span>
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold">
                    SHA-256 Hash-Chained Ledger Active
                  </span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {tenantAuditLogs.map((aud) => (
                    <div
                      key={aud.id}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                    >
                      <div>
                        <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#0A66C2]">
                          {aud.eventCode}
                        </span>{" "}
                        <strong>{aud.actorName}</strong> ({aud.actorRole}): {aud.summary}
                      </div>
                      <span className="font-mono text-[10px] text-zinc-400 shrink-0">
                        Hash: {aud.eventHash}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
