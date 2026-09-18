"use client"

import React, { useState } from "react"
import {
  Building2,
  ShieldCheck,
  Users,
  Briefcase,
  ShoppingBag,
  Star,
  Download,
  Calendar,
  Check,
  CheckCircle2,
  Lock,
  ExternalLink,
  MessageSquare,
  Sparkles,
  FileText,
  Zap,
  Globe,
  Award,
  BookOpen,
  ArrowRight,
  Shield,
  Layers,
  MapPin,
  Flame,
  Plus
} from "lucide-react"
import {
  EXPEDITE_CONSULTS_COMPANY_DATA,
  CompanyProfileData
} from "@/lib/connectin-os-data"
import { UserProfile } from "@/lib/linkedin-data"

interface CompanyPageViewProps {
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

export function CompanyPageView({
  currentUser,
  onNavigateTab
}: CompanyPageViewProps) {
  const [company, setCompany] = useState<CompanyProfileData>(EXPEDITE_CONSULTS_COMPANY_DATA)
  const [activeSection, setActiveSection] = useState<
    'overview' | 'products' | 'services' | 'jobs' | 'reviews' | 'research' | 'security' | 'events'
  >('overview')
  const [isFollowing, setIsFollowing] = useState(true)

  const navSections = [
    { id: 'overview', label: 'About & Highlights' },
    { id: 'products', label: `Products (${company.products.length})` },
    { id: 'services', label: `Services (${company.services.length})` },
    { id: 'jobs', label: `Jobs (${company.openJobs.length})` },
    { id: 'reviews', label: `Verified Reviews (${company.clientReviews.length})` },
    { id: 'research', label: 'Research & Whitepapers' },
    { id: 'security', label: 'Security & Compliance' },
    { id: 'events', label: 'Events & Demos' }
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      {/* 1. COMPANY HEADER & HERO BANNER */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-md dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative h-44 w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950">
          <img
            src={company.coverImage}
            alt=""
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              {company.verifiedStatus}
            </span>
          </div>
        </div>

        <div className="p-6 relative">
          {/* Top Row: Overlapping Company Logo + Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 mb-3">
            <div className="h-24 w-24 rounded-2xl bg-white dark:bg-zinc-900 border-4 border-white dark:border-zinc-900 shadow-xl flex items-center justify-center text-4xl shrink-0">
              {company.logo}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all shadow-xs ${
                  isFollowing
                    ? "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
                    : "bg-[#0A66C2] text-white hover:bg-[#004182]"
                }`}
              >
                {isFollowing ? "Following ✓" : "+ Follow"}
              </button>

              <button
                onClick={() => onNavigateTab('messaging')}
                className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2 text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Contact RFP Desk</span>
              </button>
            </div>
          </div>

          {/* Company Title, Tagline & Details (Cleanly positioned on the card body) */}
          <div className="space-y-1 mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                {company.name}
              </h1>
              <ShieldCheck className="h-5 w-5 text-[#0A66C2]" />
            </div>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">
              {company.tagline}
            </p>
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 pt-0.5 flex-wrap">
              <span>{company.industry}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {company.headquarters}</span>
              <span>·</span>
              <span className="font-bold text-[#0A66C2]">{company.metrics.followersCount} followers</span>
              <span>·</span>
              <span>{company.companySize.split('(')[0].trim()}</span>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto border-t border-zinc-100 pt-3 text-xs dark:border-zinc-800 scrollbar-none">
            {navSections.map((sec) => {
              const isSelected = activeSection === sec.id
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id as any)}
                  className={`rounded-lg px-3.5 py-2 font-bold transition-all shrink-0 ${
                    isSelected
                      ? "bg-[#0A66C2] text-white shadow-xs"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {sec.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 2. SECTION VIEWS */}

      {/* OVERVIEW TAB */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
              <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100">
                About Expedite Consults
              </h3>
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {company.about}
              </p>
            </div>

            {/* Featured Enterprise Offerings */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-purple-600" />
                  <span>Commercial Products &amp; Solutions</span>
                </h3>
                <button
                  onClick={() => setActiveSection('products')}
                  className="text-xs font-bold text-[#0A66C2] hover:underline"
                >
                  View All Products →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {company.products.slice(0, 2).map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{p.icon}</span>
                        <span className="text-xs font-bold text-emerald-600">{p.price}</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500">{p.tagline}</p>
                    </div>
                    <button
                      onClick={() => onNavigateTab('marketplace')}
                      className="w-full rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white py-1.5 text-xs font-bold transition-colors"
                    >
                      Launch 14-Day Sandbox
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Company Factsheet */}
          <div className="md:col-span-4 space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3 text-xs">
              <h4 className="font-black text-zinc-900 dark:text-zinc-100">
                Organization Highlights
              </h4>
              <div className="space-y-2 text-zinc-600 dark:text-zinc-300 divide-y divide-zinc-100 dark:divide-zinc-800">
                <div className="pt-1 flex justify-between"><span>Founded</span><span className="font-bold">{company.founded}</span></div>
                <div className="pt-2 flex justify-between"><span>Company Size</span><span className="font-bold">{company.companySize}</span></div>
                <div className="pt-2 flex justify-between"><span>Active Products</span><span className="font-bold text-purple-600">{company.metrics.productsCount} Platforms</span></div>
                <div className="pt-2 flex justify-between"><span>Open Requisitions</span><span className="font-bold text-emerald-600">{company.metrics.openJobsCount} Roles</span></div>
                <div className="pt-2 flex justify-between"><span>Website</span><a href={company.website} target="_blank" rel="noreferrer" className="text-[#0A66C2] font-bold hover:underline">expediteconsults.com</a></div>
              </div>
            </div>

            {/* Certifications Card */}
            <div className="rounded-2xl border border-purple-500/30 bg-purple-50/50 p-5 dark:bg-purple-950/20 space-y-2 text-xs">
              <h4 className="font-bold text-purple-950 dark:text-purple-300 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-500" />
                <span>Statutory Compliance Badges:</span>
              </h4>
              <ul className="space-y-1.5 text-zinc-700 dark:text-zinc-300">
                {company.certifications.map((c, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[11px]">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeSection === 'products' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {company.products.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-purple-500 hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{p.icon}</span>
                    <span className="text-xs font-black text-emerald-600">{p.price}</span>
                  </div>
                  <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    {p.name}
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{p.tagline}</p>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold pt-1">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <span>{p.rating} ({p.reviewsCount} verified reviews)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={() => onNavigateTab('marketplace')}
                    className="w-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2 text-xs font-bold shadow-md"
                  >
                    14-Day Free Evaluation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SERVICES TAB */}
      {activeSection === 'services' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {company.services.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-[#0A66C2] hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    {s.name}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{s.scope}</p>
                  <div className="pt-2">
                    <span className="text-[10px] text-zinc-400 font-mono uppercase block">Starting Engagement</span>
                    <span className="font-black text-sm text-emerald-600">{s.startingPrice}</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('messaging')}
                  className="w-full rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white py-2 text-xs font-bold shadow-xs"
                >
                  Request Statement of Work
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* JOBS TAB */}
      {activeSection === 'jobs' && (
        <div className="space-y-3">
          {company.openJobs.map((j) => (
            <div
              key={j.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  {j.title}
                </h4>
                <p className="text-xs text-zinc-500">
                  {j.department} · {j.location} · Clearance: <strong className="text-purple-600">{j.clearanceReq}</strong>
                </p>
                <span className="font-mono text-xs font-bold text-emerald-600 block">{j.salaryRange}</span>
              </div>

              <button
                onClick={() => onNavigateTab('jobs')}
                className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-5 py-2 text-xs font-bold shrink-0 shadow-xs"
              >
                1-Click Apply
              </button>
            </div>
          ))}
        </div>
      )}

      {/* VERIFIED REVIEWS TAB */}
      {activeSection === 'reviews' && (
        <div className="space-y-4">
          {company.clientReviews.map((rev, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={rev.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                  <div>
                    <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{rev.author}</h5>
                    <p className="text-xs text-zinc-500">{rev.role} · {rev.company}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                    Verified Contract ✓
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{rev.tenure}</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      )}

      {/* SECURITY & TRUST TAB */}
      {activeSection === 'security' && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4 text-xs">
          <div className="flex items-center gap-2 text-base font-black text-zinc-900 dark:text-zinc-100">
            <Shield className="h-5 w-5 text-emerald-600" />
            <span>Expedite Consults Enterprise Security Posture</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800 space-y-1.5">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Data Residency &amp; Sovereignty:</span>
              <p className="text-zinc-600 dark:text-zinc-300">{company.securityPosture.dataResidency}</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800 space-y-1.5">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Cryptographic Encryption Standard:</span>
              <p className="text-zinc-600 dark:text-zinc-300">{company.securityPosture.encryptionStandard}</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800 space-y-1.5">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">FedRAMP &amp; Defense Authorization:</span>
              <p className="text-zinc-600 dark:text-zinc-300">{company.securityPosture.fedrampStatus}</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800 space-y-1.5">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Audit Logs &amp; Continuous cATO:</span>
              <p className="text-zinc-600 dark:text-zinc-300">Continuous OSCAL JSON machine telemetry assertion ready.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
