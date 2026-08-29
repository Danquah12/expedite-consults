"use client"

import React, { useState, useEffect } from "react"
import {
  Briefcase,
  Search,
  MapPin,
  Bookmark,
  Sparkles,
  Building,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Send,
  X,
  Globe,
  Loader2,
  RefreshCw,
  Zap,
  Check,
  FileText,
  Shield,
  DollarSign,
  Languages,
  Compass,
  PlusCircle,
  Users,
  Target,
  GraduationCap,
  Layers,
  ShoppingBag,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  ThumbsUp,
  AlertCircle
} from "lucide-react"
import {
  COUNTRIES_CONFIG,
  CountryConfig,
  GlobalJobItem,
  GLOBAL_JOBS_CATALOG,
  initialUserApplications,
  initialCandidatesData,
  JobApplicationItem,
  CandidateProfile
} from "@/lib/global-jobs-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CareerTwinModal } from "./CareerTwinModal"

interface JobsViewProps {
  onNavigateCareerSuite?: () => void
  onNavigateLearning?: () => void
  onNavigateMarketplace?: () => void
}

const DOMAIN_CATEGORIES = [
  { id: 'All', label: 'All Openings', icon: '🌐' },
  { id: 'Recommended', label: 'Recommended for You', icon: '⭐' },
  { id: 'Cybersecurity', label: 'Cybersecurity & AppSec', icon: '🔐' },
  { id: 'Defense', label: 'Defense & Clearance', icon: '🛡️' },
  { id: 'Government', label: 'Government & Public Sector', icon: '🏛️' },
  { id: 'Remote', label: 'Remote Only', icon: '🌍' },
  { id: 'Contract', label: 'Contract & Fractional', icon: '📜' },
  { id: 'Full-time', label: 'Full-time', icon: '💼' }
]

export function JobsView({
  onNavigateCareerSuite,
  onNavigateLearning,
  onNavigateMarketplace
}: JobsViewProps) {
  // Primary Master Mode
  const [masterMode, setMasterMode] = useState<'find' | 'applications' | 'recruiting'>('find')

  // Find Jobs Filters
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("US")
  const [selectedHub, setSelectedHub] = useState<string>("All Hubs")
  const [selectedDomain, setSelectedDomain] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [jobs, setJobs] = useState<GlobalJobItem[]>([])
  const [selectedJob, setSelectedJob] = useState<GlobalJobItem | null>(null)

  // Applications State
  const [applications, setApplications] = useState<JobApplicationItem[]>(initialUserApplications)
  const [appStageFilter, setAppStageFilter] = useState<'all' | 'applied' | 'interview' | 'offer' | 'rejected'>('all')

  // Recruiting State
  const [candidates, setCandidates] = useState<CandidateProfile[]>(initialCandidatesData)
  const [selectedRecruitingFilter, setSelectedRecruitingFilter] = useState<string>('All')
  const [isPostJobOpen, setIsPostJobOpen] = useState(false)
  const [postJobSuccess, setPostJobSuccess] = useState(false)

  // Post Job Form State
  const [newJobTitle, setNewJobTitle] = useState("")
  const [newJobCompany, setNewJobCompany] = useState("Expedite Consults")
  const [newJobLocation, setNewJobLocation] = useState("Washington, DC / Hybrid")
  const [newJobSalary, setNewJobSalary] = useState("$190,000 - $240,000 / yr")
  const [newJobProductRequired, setNewJobProductRequired] = useState("Expedite Strike & Fusion 2026")
  const [newJobDescription, setNewJobDescription] = useState("")

  // Modals
  const [careerTwinJob, setCareerTwinJob] = useState<any | null>(null)
  const [isCareerTwinOpen, setIsCareerTwinOpen] = useState(false)
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([])
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [applyStep, setApplyStep] = useState<'form' | 'success'>('form')
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)

  // Current active country config
  const currentCountry = COUNTRIES_CONFIG.find(c => c.code === selectedCountryCode) || COUNTRIES_CONFIG[0]

  // Fetch jobs for selected country from API
  const fetchJobs = async (countryCode: string, hub: string = 'All Hubs', query: string = '', domain: string = 'All') => {
    setIsLoadingJobs(true)
    try {
      const params = new URLSearchParams()
      params.set('country', countryCode)
      if (hub && hub !== 'All Hubs') params.set('hub', hub)
      if (query) params.set('q', query)
      if (domain === 'Remote') params.set('remote', 'true')

      const res = await fetch(`/api/jobs/search?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.jobs)) {
          let list: GlobalJobItem[] = data.jobs

          // Filter by domain category if specified
          if (domain && domain !== 'All' && domain !== 'Remote') {
            const dLower = domain.toLowerCase()
            list = list.filter(j =>
              j.title.toLowerCase().includes(dLower) ||
              j.description.toLowerCase().includes(dLower) ||
              j.tags.some(t => t.toLowerCase().includes(dLower)) ||
              (domain === 'Defense' && (j.clearanceRequired || j.tags.includes('Defense') || j.tags.includes('GovTech'))) ||
              (domain === 'Cybersecurity' && (j.title.toLowerCase().includes('security') || j.tags.includes('Cybersecurity') || j.tags.includes('Zero Trust')))
            )
          }

          setJobs(list)
        }
      }
    } catch (err) {
      console.error("Failed to load country jobs:", err)
      let fallback = GLOBAL_JOBS_CATALOG.filter(j => j.countryCode === countryCode)
      setJobs(fallback)
    } finally {
      setIsLoadingJobs(false)
    }
  }

  // Reload jobs when country, hub, or domain changes
  useEffect(() => {
    fetchJobs(selectedCountryCode, selectedHub, searchQuery, selectedDomain)
  }, [selectedCountryCode, selectedHub, selectedDomain])

  const handleCountryChange = (newCode: string) => {
    setSelectedCountryCode(newCode)
    setSelectedHub("All Hubs")
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchJobs(selectedCountryCode, selectedHub, searchQuery, selectedDomain)
  }

  const toggleSaveJob = (jobId: string) => {
    setJobs(prev =>
      prev.map(j => (j.id === jobId ? { ...j, isSaved: !j.isSaved } : j))
    )
  }

  const handleOpenApply = (job: GlobalJobItem) => {
    setSelectedJob(job)
    setApplyStep('form')
    setIsApplyModalOpen(true)
  }

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedJob) {
      setAppliedJobIds(prev => [...prev, selectedJob.id])
      const newApp: JobApplicationItem = {
        id: 'app_' + Date.now(),
        jobTitle: selectedJob.title,
        company: selectedJob.company,
        companyLogo: selectedJob.companyLogo,
        location: selectedJob.location,
        salary: selectedJob.salaryRange,
        stage: 'applied',
        appliedDate: 'Just now',
        nextStep: 'Application submitted · Awaiting recruiter review',
        productVerifiedMatch: 'Direct Profile Sync'
      }
      setApplications(prev => [newApp, ...prev])
      setApplyStep('success')
    }
  }

  const handlePostJobSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPostJobSuccess(true)
    setTimeout(() => {
      setPostJobSuccess(false)
      setIsPostJobOpen(false)
      const created: GlobalJobItem = {
        id: 'job_' + Date.now(),
        countryCode: 'US',
        countryName: 'United States',
        title: newJobTitle,
        company: newJobCompany,
        companyLogo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
        location: newJobLocation,
        hub: 'Washington, DC / MD / VA',
        workplaceType: 'Hybrid',
        employmentType: 'Full-time',
        postedTime: 'Just now',
        applicantsCount: 1,
        salaryRange: newJobSalary,
        easyApply: true,
        description: newJobDescription || 'Enterprise opening posted directly via ConnectIn Recruiting Console.',
        requirements: ['Verified Experience in ' + newJobProductRequired, 'CISSP / Security+ Certification'],
        languageRequirement: 'Fluent English',
        applyUrl: '',
        source: 'Expedite Direct ATS',
        tags: ['ExpediteStrike', 'ZeroTrust', 'Cybersecurity', 'GovTech'],
        requiredProductExperience: [newJobProductRequired]
      }
      setJobs(prev => [created, ...prev])
    }, 1800)
  }

  const filteredApplications = applications.filter(a => {
    if (appStageFilter === 'all') return true
    return a.stage === appStageFilter
  })

  const filteredCandidates = candidates.filter(c => {
    if (selectedRecruitingFilter === 'All') return true
    if (selectedRecruitingFilter === 'ProductVerified') return c.verifiedProducts && c.verifiedProducts.length > 0
    if (selectedRecruitingFilter === 'Clearance') return c.clearance && c.clearance.includes('Secret')
    return true
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      {/* 1. TOP JOBS BANNER & 3-MODE SWITCHER */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-blue-500/20 px-3 py-0.5 text-xs font-bold text-sky-300 border border-blue-400/40 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                ConnectIn Careers & Talent Engine
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                Jobs + Marketplace + Learning Flywheel
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Smarter Career Opportunities & AI Candidate Matching
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Match jobs based on verified product experience, certifications, and security capabilities. Upskill directly via ConnectIn Masterclasses to qualify for elite enterprise roles.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-white/15 shrink-0 flex-wrap">
            <button
              onClick={() => setMasterMode('find')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                masterMode === 'find'
                  ? "bg-[#0A66C2] text-white shadow-md"
                  : "text-zinc-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Find Jobs</span>
            </button>

            <button
              onClick={() => setMasterMode('applications')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                masterMode === 'applications'
                  ? "bg-[#0A66C2] text-white shadow-md"
                  : "text-zinc-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>My Applications ({applications.length})</span>
            </button>

            <button
              onClick={() => setMasterMode('recruiting')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                masterMode === 'recruiting'
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-extrabold"
                  : "text-purple-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Users className="h-3.5 w-3.5 text-amber-300" />
              <span>Recruiting Hub</span>
            </button>
          </div>
        </div>

        {/* Dynamic Country Ribbon (Visible in Find Jobs Mode) */}
        {masterMode === 'find' && (
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-zinc-400 shrink-0">Country:</span>
              {COUNTRIES_CONFIG.map((c) => {
                const isSelected = selectedCountryCode === c.code
                return (
                  <button
                    key={c.code}
                    onClick={() => handleCountryChange(c.code)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-gradient-to-r from-sky-400 to-blue-500 text-zinc-950 shadow-md font-extrabold"
                        : "bg-white/10 text-white/80 hover:bg-white/20"
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span>{c.name.split(' ')[0]}</span>
                  </button>
                )
              })}
            </div>

            <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1 shrink-0">
              <Languages className="h-3.5 w-3.5 text-amber-300" />
              {currentCountry.languages[0]} · {currentCountry.currency} ({currentCountry.currencySymbol})
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: FIND JOBS (ADVANCED DOMAINS & FLYWHEEL CONNECTION) */}
      {/* ========================================================================= */}
      {masterMode === 'find' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Rail: Domain Categories & Hubs */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            {/* Domain Categories */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-[#0A66C2]" />
                Job Categories
              </h3>
              <div className="space-y-1 text-xs">
                {DOMAIN_CATEGORIES.map((dom) => {
                  const isSelected = selectedDomain === dom.id
                  return (
                    <button
                      key={dom.id}
                      onClick={() => setSelectedDomain(dom.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left font-semibold transition-all ${
                        isSelected
                          ? "bg-[#0A66C2] text-white shadow-2xs"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{dom.icon}</span>
                        <span>{dom.label}</span>
                      </span>
                      {isSelected && <Check className="h-3 w-3 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Regional Tech Centers */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
              <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#0A66C2]" />
                {currentCountry.name} Hubs
              </h4>
              <div className="space-y-1 pt-1">
                {currentCountry.hubs.map((hub) => {
                  const isSelected = selectedHub === hub
                  return (
                    <button
                      key={hub}
                      onClick={() => setSelectedHub(hub)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span className="truncate">{hub}</span>
                      {isSelected && <Check className="h-3 w-3 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* CareerSuite Quick Link */}
            <div
              onClick={() => {
                if (onNavigateCareerSuite) onNavigateCareerSuite()
              }}
              className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-4 shadow-xs dark:border-purple-900/40 dark:from-purple-950/30 dark:to-indigo-950/30 cursor-pointer hover:border-purple-400 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Expedite CareerSuite™
                </span>
                <ExternalLink className="h-3 w-3 text-purple-600" />
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Tailor your resume with AI specifically for these openings with 98% ATS pass rates.
              </p>
            </div>
          </div>

          {/* Main Job Results Feed */}
          <div className="md:col-span-8 lg:col-span-9 space-y-4">
            {/* Search Header */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 flex items-center rounded-lg bg-zinc-50 px-3 py-2 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800/80">
                  <Search className="h-4 w-4 text-zinc-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder={`Search roles in ${currentCountry.name} (e.g. Threat Hunter, Zero Trust, Anthropic)...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery("")} className="text-zinc-400 hover:text-zinc-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoadingJobs}
                  className="rounded-lg bg-[#0A66C2] px-5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#004182] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {isLoadingJobs ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  <span>Search</span>
                </button>
              </form>

              <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500">
                <span>Category: <strong>{selectedDomain}</strong> · Hub: <strong>{selectedHub}</strong></span>
                <span>{jobs.length} openings found</span>
              </div>
            </div>

            {/* Jobs List */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              {jobs.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                    No openings found for this filter in {currentCountry.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Try resetting domain categories or searching another keyword.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedDomain("All")
                      setSelectedHub("All Hubs")
                      setSearchQuery("")
                    }}
                    className="rounded-full bg-[#0A66C2] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#004182] mt-2"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {jobs.map((job) => {
                    const isApplied = appliedJobIds.includes(job.id)

                    return (
                      <div
                        key={job.id}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <img
                            src={job.companyLogo}
                            alt={job.company}
                            className="h-12 w-12 rounded-lg object-cover border border-zinc-200 shrink-0 dark:border-zinc-800"
                          />

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4
                                onClick={() => setSelectedJob(job)}
                                className="font-bold text-sm sm:text-base text-zinc-900 hover:text-[#0A66C2] hover:underline cursor-pointer dark:text-zinc-100 leading-snug"
                              >
                                {job.title}
                              </h4>
                              {job.clearanceRequired && (
                                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300">
                                  🛡️ {job.clearanceRequired}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                              {job.company}
                            </p>

                            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                              <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                                <MapPin className="h-3.5 w-3.5 text-[#0A66C2]" />
                                {job.location}
                              </span>
                              {job.salaryRange && (
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                  {job.salaryRange}
                                </span>
                              )}
                              <span>{job.postedTime}</span>
                            </div>

                            {/* 🔥 JOBS + MARKETPLACE + LEARNING PRODUCT FLYWHEEL CONNECTION */}
                            <div className="rounded-lg bg-gradient-to-r from-purple-50/70 to-sky-50/70 border border-purple-200/80 p-2.5 my-2 dark:bg-purple-950/20 dark:border-purple-900/40 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                                  Product & Skill Connection:
                                </span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                  ✓ Top 5% Applicant Fit
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                                This employer recommends experience in <strong>Expedite Strike™</strong> or <strong>Zero Trust Architecture</strong>.
                              </p>
                              <div className="flex items-center gap-2 pt-0.5">
                                <button
                                  onClick={() => {
                                    if (onNavigateLearning) onNavigateLearning()
                                  }}
                                  className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-[#0A66C2] border border-blue-200 shadow-2xs hover:bg-sky-50 dark:bg-zinc-800 dark:border-zinc-700"
                                >
                                  🎓 Take Masterclass →
                                </button>
                                <button
                                  onClick={() => {
                                    if (onNavigateMarketplace) onNavigateMarketplace()
                                  }}
                                  className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200 shadow-2xs hover:bg-purple-50 dark:bg-zinc-800 dark:border-zinc-700"
                                >
                                  🛍️ Try Product in Marketplace →
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 pt-0.5 leading-relaxed">
                              {job.description}
                            </p>

                            {/* Tags */}
                            {job.tags && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {job.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions Right Side */}
                        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setCareerTwinJob(job)
                                setIsCareerTwinOpen(true)
                              }}
                              className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 border border-purple-200 hover:bg-purple-100 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300 transition-all flex items-center gap-1"
                              title="AI Interview Simulation"
                            >
                              <Sparkles className="h-3 w-3 text-amber-500" />
                              <span>CareerTwin™ Prep</span>
                            </button>

                            <button
                              onClick={() => toggleSaveJob(job.id)}
                              className={`rounded-full p-1.5 transition-colors ${
                                job.isSaved
                                  ? "text-[#0A66C2] bg-sky-50 dark:bg-sky-950"
                                  : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                              }`}
                            >
                              <Bookmark className={`h-4 w-4 ${job.isSaved ? "fill-[#0A66C2]" : ""}`} />
                            </button>
                          </div>

                          {isApplied ? (
                            <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-600 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              <span>Applied</span>
                            </span>
                          ) : job.applyUrl ? (
                            <a
                              href={job.applyUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full bg-[#0A66C2] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#004182] transition-colors flex items-center gap-1 shadow-xs"
                            >
                              <span>Apply on Site</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <button
                              onClick={() => handleOpenApply(job)}
                              className="rounded-full bg-[#0A66C2] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#004182] transition-colors shadow-xs"
                            >
                              Easy Apply
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: MY APPLICATIONS PIPELINE (KANBAN TRACKER) */}
      {/* ========================================================================= */}
      {masterMode === 'applications' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#0A66C2]" />
                <span>My Applications Tracking Pipeline</span>
              </h2>
              <p className="text-xs text-zinc-500">
                Track real-time status across recruiter reviews, interview panels, and formal offers.
              </p>
            </div>

            {/* Stage Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {[
                { id: 'all', label: `All (${applications.length})` },
                { id: 'applied', label: `Applied (${applications.filter(a => a.stage === 'applied').length})` },
                { id: 'interview', label: `Interview (${applications.filter(a => a.stage === 'interview').length})` },
                { id: 'offer', label: `Offer (${applications.filter(a => a.stage === 'offer').length})` },
                { id: 'rejected', label: `Archived (${applications.filter(a => a.stage === 'rejected').length})` }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setAppStageFilter(pill.id as any)}
                  className={`rounded-full px-3 py-1 font-bold transition-all whitespace-nowrap ${
                    appStageFilter === pill.id
                      ? "bg-[#0A66C2] text-white shadow-2xs"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  {/* Stage Badge Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        app.stage === 'offer'
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                          : app.stage === 'interview'
                          ? "bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-950 dark:text-purple-300"
                          : app.stage === 'rejected'
                          ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          : "bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950 dark:text-sky-300"
                      }`}
                    >
                      {app.stage === 'interview' ? '🎙️ Interview Stage' : app.stage === 'offer' ? '🎉 Offer Received' : app.stage === 'rejected' ? 'Archived' : '📤 Applied'}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">{app.appliedDate}</span>
                  </div>

                  {/* Company & Role */}
                  <div className="flex items-start gap-3">
                    <img
                      src={app.companyLogo}
                      alt={app.company}
                      className="h-10 w-10 rounded-lg object-cover border border-zinc-200 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                        {app.jobTitle}
                      </h4>
                      <p className="text-xs text-zinc-500 font-medium">{app.company} · {app.location}</p>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {app.salary}
                  </p>

                  {/* Next Step Note */}
                  <div className="rounded-lg bg-zinc-50 p-2.5 text-xs dark:bg-zinc-800/60 space-y-1">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      Next Step:
                    </p>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      {app.nextStep}
                    </p>
                    {app.offerDetails && (
                      <p className="text-[11px] font-bold text-emerald-600 pt-1">
                        📦 Package: {app.offerDetails}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setCareerTwinJob({
                        title: app.jobTitle,
                        company: app.company,
                        description: `Interview preparation for ${app.jobTitle} at ${app.company}.`
                      })
                      setIsCareerTwinOpen(true)
                    }}
                    className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>Interview Prep</span>
                  </button>

                  <span className="text-[11px] text-zinc-400">
                    {app.recruiterName || 'Talent Ops'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: RECRUITING HUB (AI CANDIDATE MATCHING + POST JOB) */}
      {/* ========================================================================= */}
      {masterMode === 'recruiting' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>Recruiter Command Center & AI Candidate Matching</span>
              </h2>
              <p className="text-xs text-zinc-500">
                Find talent with verified product experience, certifications, and high skill-match rankings.
              </p>
            </div>

            <button
              onClick={() => setIsPostJobOpen(true)}
              className="rounded-xl bg-[#0A66C2] px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#004182] transition-colors flex items-center gap-1.5 shadow-md shrink-0"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post New Job Opening</span>
            </button>
          </div>

          {/* Candidate Filter Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            <span className="font-bold text-zinc-400 uppercase text-[10px] shrink-0">Filter Talent:</span>
            {[
              { id: 'All', label: 'All Verified Candidates' },
              { id: 'ProductVerified', label: '⚡ Product Experience Verified' },
              { id: 'Clearance', label: '🛡️ Active Clearance (Secret/TS)' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedRecruitingFilter(f.id)}
                className={`rounded-full px-3 py-1 font-bold transition-all whitespace-nowrap ${
                  selectedRecruitingFilter === f.id
                    ? "bg-[#0A66C2] text-white shadow-2xs"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* AI Candidate Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCandidates.map((cand) => (
              <div
                key={cand.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-purple-500/50 hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <img
                        src={cand.avatar}
                        alt={cand.name}
                        className="h-12 w-12 rounded-full object-cover border-2 border-purple-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                            {cand.name}
                          </h4>
                          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[9px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            {cand.currentStatus}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                          {cand.headline}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          📍 {cand.location} · {cand.experienceYears} yrs experience {cand.clearance && `· 🛡️ ${cand.clearance}`}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                      🎯 {cand.matchScore}% Match
                    </span>
                  </div>

                  {/* Verified Products Badge List */}
                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      Verified Product Licenses & Lab Experience:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {cand.verifiedProducts.map((vp, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200 dark:bg-purple-950 dark:text-purple-300"
                        >
                          {vp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Capabilities Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {cand.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recruiter Action Buttons */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-medium">
                    Certifications: {cand.certifications.join(', ')}
                  </span>

                  <button
                    onClick={() => {
                      alert(`Direct recruiting invitation sent to ${cand.name}. Calendar link and salary briefing dispatched.`)
                    }}
                    className="rounded-full bg-[#0A66C2] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#004182] transition-colors"
                  >
                    Reach Out
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POST NEW JOB MODAL */}
      <Dialog open={isPostJobOpen} onOpenChange={setIsPostJobOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-[#0A66C2]" />
              <span>Post New Role on ConnectIn</span>
            </DialogTitle>
          </DialogHeader>

          {postJobSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Job Published Successfully!
              </h4>
              <p className="text-xs text-zinc-500">
                Your opening is now live and automatically recommending candidates with verified product experience.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePostJobSubmit} className="space-y-4 pt-2 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Cloud Security Architect"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Company</label>
                  <input
                    type="text"
                    required
                    value={newJobCompany}
                    onChange={(e) => setNewJobCompany(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Salary Band</label>
                  <input
                    type="text"
                    required
                    value={newJobSalary}
                    onChange={(e) => setNewJobSalary(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">
                  Required Product Experience (Flywheel Matching)
                </label>
                <select
                  value={newJobProductRequired}
                  onChange={(e) => setNewJobProductRequired(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                >
                  <option>Expedite Strike & Fusion 2026</option>
                  <option>ÆGIS SOC Autonomous PenTest</option>
                  <option>VeritasLens Fact Verification</option>
                  <option>AWS Security Hub & Transit Gateway</option>
                  <option>Checkmarx MCP Server</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Job Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe responsibilities, security requirements, and team setup..."
                  value={newJobDescription}
                  onChange={(e) => setNewJobDescription(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsPostJobOpen(false)}
                  className="rounded-full px-4 py-1.5 font-bold text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#0A66C2] px-5 py-2 font-bold text-white hover:bg-[#004182]"
                >
                  Publish Job
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* EASY APPLY MODAL */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="max-w-lg">
          {selectedJob && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs text-[#0A66C2] font-semibold">
                  <Building className="h-3.5 w-3.5" />
                  <span>{selectedJob.company} ({selectedJob.countryName})</span>
                </div>
                <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Apply for {selectedJob.title}
                </DialogTitle>
              </DialogHeader>

              {applyStep === 'form' ? (
                <form onSubmit={handleSubmitApplication} className="space-y-4 pt-2">
                  <div className="rounded-lg bg-zinc-50 p-3 text-xs dark:bg-zinc-800/60 space-y-1">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Submitting as Alex Taylor
                    </p>
                    <p className="text-zinc-500">
                      Principal Cloud & Security Architect | alex.taylor@expediteconsults.com
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Resume Version
                    </label>
                    <div className="flex items-center justify-between rounded-lg border border-zinc-300 p-2.5 text-xs dark:border-zinc-700">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#0A66C2]" />
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          Alex_Taylor_Security_Architect_2026.pdf
                        </span>
                      </div>
                      <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800">
                        Default
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsApplyModalOpen(false)}
                      className="rounded-full px-4 py-1.5 text-xs font-bold text-zinc-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-[#0A66C2] px-5 py-1.5 text-xs font-bold text-white hover:bg-[#004182] flex items-center gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Application</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-6 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    Application Submitted!
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Added to your Applications Pipeline. You can track progress under "My Applications".
                  </p>
                  <button
                    onClick={() => setIsApplyModalOpen(false)}
                    className="rounded-full bg-[#0A66C2] px-5 py-2 text-xs font-bold text-white hover:bg-[#004182]"
                  >
                    Done
                  </button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* CAREERTWIN INTERVIEW PREP MODAL */}
      {careerTwinJob && (
        <CareerTwinModal
          isOpen={isCareerTwinOpen}
          onClose={() => setIsCareerTwinOpen(false)}
          job={careerTwinJob}
        />
      )}
    </div>
  )
}
