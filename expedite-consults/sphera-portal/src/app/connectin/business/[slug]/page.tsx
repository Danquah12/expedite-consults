"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Building2,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Star,
  Calendar,
  Wrench,
  Share2,
  ExternalLink,
  Send
} from "lucide-react"
import type {
  BusinessProfileTenant,
  BusinessServiceItem,
  BusinessVerifiedReview
} from "@/app/api/connectin/business/route"

export default function PublicBusinessStorefrontPage() {
  const params = useParams<{ slug: string }>()
  const slugParam = String(params?.slug || "").trim().toLowerCase()

  const [loading, setLoading] = useState(true)
  const [publishedBusinesses, setPublishedBusinesses] = useState<BusinessProfileTenant[]>([])
  const [activeBiz, setActiveBiz] = useState<BusinessProfileTenant | null>(null)
  const [services, setServices] = useState<BusinessServiceItem[]>([])
  const [reviews, setReviews] = useState<BusinessVerifiedReview[]>([])

  // MKT-02 & BOOK-01 Customer Quote & Appointment Form State
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerLocation, setCustomerLocation] = useState("")
  const [selectedServiceId, setSelectedServiceId] = useState("")
  const [projectScope, setProjectScope] = useState("")
  const [preferredDate, setPreferredDate] = useState("Next Available Morning Slot")
  const [estimatedBudget, setEstimatedBudget] = useState("Request Itemized Quote")
  const [submitting, setSubmitting] = useState(false)
  const [submittedNotice, setSubmittedNotice] = useState("")
  const [copiedUrlNotice, setCopiedUrlNotice] = useState(false)

  useEffect(() => {
    let mounted = true
    const loadStorefront = async () => {
      try {
        const res = await fetch("/api/connectin/business", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (!mounted || !data?.ok || !data.state) return

        const allPublic: BusinessProfileTenant[] = (
          data.publicBusinesses ||
          data.state.businesses.filter((b: BusinessProfileTenant) => b.status === "Published")
        )
        setPublishedBusinesses(allPublic)

        const matched =
          allPublic.find(
            (b) =>
              b.slug.toLowerCase() === slugParam ||
              b.id.toLowerCase() === slugParam
          ) ||
          allPublic[0] ||
          null

        setActiveBiz(matched)
        if (matched) {
          const activeServices: BusinessServiceItem[] = (data.state.services || []).filter(
            (s: BusinessServiceItem) => s.businessId === matched.id && s.status === "Active"
          )
          setServices(activeServices)
          if (activeServices[0]) {
            setSelectedServiceId(activeServices[0].id)
          }
          const bizReviews: BusinessVerifiedReview[] = (data.state.reviews || []).filter(
            (r: BusinessVerifiedReview) => r.businessId === matched.id
          )
          setReviews(bizReviews)
          setCustomerLocation(matched.location)
        }
      } catch {
        // ignore fetch error
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void loadStorefront()
    return () => {
      mounted = false
    }
  }, [slugParam])

  const handleCopyStorefrontLink = () => {
    if (typeof window === "undefined") return
    const url = window.location.href
    navigator.clipboard?.writeText(url).catch(() => {})
    setCopiedUrlNotice(true)
    setTimeout(() => setCopiedUrlNotice(false), 3000)
  }

  const handleSubmitQuoteRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeBiz || !customerName.trim() || !projectScope.trim() || submitting) return
    setSubmitting(true)
    setSubmittedNotice("")
    try {
      const chosenService = services.find((s) => s.id === selectedServiceId)
      const res = await fetch("/api/connectin/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_quote",
          businessId: activeBiz.id,
          serviceId: chosenService?.id,
          serviceTitle: chosenService?.title || activeBiz.category,
          actorName: customerName.trim(),
          actorEmail: customerEmail.trim() || "guest-customer@conectln.com",
          customerLocation: customerLocation.trim() || activeBiz.location,
          projectScope: projectScope.trim(),
          preferredDate: preferredDate.trim() || "Next Available Slot",
          estimatedBudget: estimatedBudget.trim() || "Request Itemized Quote",
        }),
      })
      const data = await res.json()
      if (data?.ok) {
        const recipientsList = Array.isArray(data.emailRecipients) && data.emailRecipients.length > 0
          ? ` Email confirmation sent to ${data.emailRecipients.join(", ")}.`
          : ""
        setSubmittedNotice(
          `Your quote & appointment request (${data.referenceId || "LOGGED"}) was delivered directly to ${activeBiz.name}'s Business Inbox & CRM!${recipientsList}`
        )
        setProjectScope("")
      }
    } catch {
      // ignore error
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F2EF] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Top Public Storefront Navigation Bar (Accessible Without Login — SRS Requirement #6) */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/connectin"
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 px-3 py-1.5 text-xs font-extrabold text-zinc-800 dark:text-zinc-100"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#0A66C2]" />
              <span>ConnectLn Home</span>
            </Link>
            <span className="hidden sm:inline-block text-xs font-bold text-[#0A66C2]">
              🌐 ConnectLn Public Business Storefront (BIZ-04)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {publishedBusinesses.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {publishedBusinesses.map((b) => (
                  <Link
                    key={b.id}
                    href={`/connectin/business/${b.slug}`}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border whitespace-nowrap ${
                      activeBiz?.id === b.id
                        ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleCopyStorefrontLink}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3 py-1.5 text-xs font-extrabold text-[#0A66C2] dark:text-sky-300 cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{copiedUrlNotice ? "✓ Storefront URL Copied!" : "Share Storefront"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {loading ? (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center text-sm font-bold text-zinc-500">
            Loading verified ConnectLn Business storefront...
          </div>
        ) : !activeBiz ? (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center space-y-3">
            <h1 className="text-lg font-black">No Published Business Storefront Found</h1>
            <Link
              href="/connectin?tab=workbusiness"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A66C2] text-white px-4 py-2 text-xs font-extrabold"
            >
              <span>Open ConnectLn Business Directory →</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Business Hero Card */}
            <section className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <div className="bg-gradient-to-r from-[#0A66C2] via-[#004182] to-slate-900 px-6 py-6 text-white">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="rounded-md bg-white/15 px-2.5 py-0.5 text-[10.5px] font-mono font-black uppercase">
                    {activeBiz.businessType}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/25 border border-emerald-300/40 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-100">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{activeBiz.verificationStatus}</span>
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-sky-100">
                    👁️ {activeBiz.storefrontViews} Storefront Visits
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
                  <Building2 className="h-7 w-7 text-sky-300 shrink-0" />
                  <span>{activeBiz.name}</span>
                </h1>
                <p className="text-sm text-sky-100 mt-1.5 max-w-3xl">{activeBiz.tagline}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-sky-200">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {activeBiz.location}
                  </span>
                  <span>Credential Ref: {activeBiz.verificationLicenseRef}</span>
                  <span>Category: {activeBiz.category}</span>
                </div>
              </div>
            </section>

            {/* Main Grid: Left = Services, Portfolio & Verified Reviews; Right = Request Quote Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 space-y-6">
                {/* Active Services & Portfolio Media (SRV-01, SRV-02) */}
                <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <h2 className="text-base font-black flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-[#0A66C2]" />
                      <span>Services &amp; Verified Work Portfolio ({services.length})</span>
                    </h2>
                  </div>

                  {services.length === 0 ? (
                    <p className="text-xs text-zinc-500">
                      This storefront has not published active services yet. Use the inquiry form to request a custom consultation.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {services.map((srv) => (
                        <div
                          key={srv.id}
                          className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="rounded bg-blue-50 dark:bg-blue-950/60 text-[#0A66C2] dark:text-sky-300 px-2.5 py-0.5 text-[10.5px] font-extrabold">
                              {srv.category} · {srv.pricingModel}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedServiceId(srv.id)}
                              className="text-xs font-extrabold text-[#0A66C2] hover:underline cursor-pointer"
                            >
                              Select for Quote →
                            </button>
                          </div>
                          <h3 className="text-sm sm:text-base font-black">{srv.title}</h3>
                          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                            {srv.description}
                          </p>
                          <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                            {srv.priceDisplay} · 📍 {srv.serviceArea}
                          </p>

                          {srv.portfolioMedia && srv.portfolioMedia.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                              {srv.portfolioMedia.map((pm) => (
                                <div
                                  key={pm.id}
                                  className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
                                >
                                  <img
                                    src={pm.url}
                                    alt={pm.title}
                                    className="h-32 w-full object-cover"
                                  />
                                  <p className="px-2.5 py-1.5 text-[11px] font-bold truncate">
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
                  )}
                </section>

                {/* Verified Transaction Reviews (REV-01) */}
                <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-xs">
                  <h2 className="text-base font-black flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span>Verified Customer Reviews ({reviews.length})</span>
                  </h2>
                  {reviews.length === 0 ? (
                    <p className="text-xs text-zinc-500">
                      Completed customer bookings will appear here with verified transaction badges.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-1.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="text-xs font-black">{rev.customerName}</span>
                              <span className="text-[11px] text-zinc-500 ml-2">
                                · {rev.serviceTitle}
                              </span>
                            </div>
                            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10.5px] font-extrabold text-emerald-700 dark:text-emerald-300">
                              {"★".repeat(rev.rating)} · Verified Transaction ✓
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-300 italic">
                            &ldquo;{rev.comment}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Right Column: Customer Quote & Appointment Request Form (MKT-02 & BOOK-01) */}
              <aside className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4 sticky top-20">
                <div>
                  <span className="rounded bg-blue-50 dark:bg-blue-950/60 text-[#0A66C2] dark:text-sky-300 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                    No Account Required · Direct Quote &amp; Booking
                  </span>
                  <h2 className="text-base font-black mt-1">
                    Request Estimate from {activeBiz.name}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Send your project scope directly to {activeBiz.ownerName}&apos;s team Business Inbox.
                  </p>
                </div>

                {submittedNotice && (
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-3 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{submittedNotice}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitQuoteRequest} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-zinc-600 dark:text-zinc-400 mb-1">
                      Select Service
                    </label>
                    <select
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                      {services.length === 0 && (
                        <option value="">General Service Consultation</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-zinc-600 dark:text-zinc-400 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Full Name..."
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-extrabold text-zinc-600 dark:text-zinc-400 mb-1">
                        Email or Phone
                      </label>
                      <input
                        type="text"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-zinc-600 dark:text-zinc-400 mb-1">
                        City / Location
                      </label>
                      <input
                        type="text"
                        value={customerLocation}
                        onChange={(e) => setCustomerLocation(e.target.value)}
                        placeholder="Laurel, MD"
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-zinc-600 dark:text-zinc-400 mb-1">
                      Project Scope &amp; Deliverables *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={projectScope}
                      onChange={(e) => setProjectScope(e.target.value)}
                      placeholder="Describe measurements, goals, or requirements..."
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-extrabold text-zinc-600 dark:text-zinc-400 mb-1">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Preferred Date / Slot
                      </label>
                      <input
                        type="text"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-zinc-600 dark:text-zinc-400 mb-1">
                        Target Budget
                      </label>
                      <input
                        type="text"
                        value={estimatedBudget}
                        onChange={(e) => setEstimatedBudget(e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-50 text-white py-2.5 px-4 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{submitting ? "Sending Request..." : "Submit Quote & Appointment Request"}</span>
                  </button>
                </form>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Operate this business?</span>
                  <Link
                    href="/connectin?tab=workbusiness"
                    className="font-extrabold text-[#0A66C2] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Manage in Business Workspace</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
