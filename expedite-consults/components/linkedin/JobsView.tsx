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
  Compass
} from "lucide-react"
import { COUNTRIES_CONFIG, CountryConfig, GlobalJobItem, GLOBAL_JOBS_CATALOG } from "@/lib/global-jobs-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CareerTwinModal } from "./CareerTwinModal"

interface JobsViewProps {
  onNavigateCareerSuite?: () => void
}

export function JobsView({ onNavigateCareerSuite }: JobsViewProps) {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("US")
  const [selectedHub, setSelectedHub] = useState<string>("All Hubs")
  const [selectedWorkplace, setSelectedWorkplace] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [jobs, setJobs] = useState<GlobalJobItem[]>([])
  const [selectedJob, setSelectedJob] = useState<GlobalJobItem | null>(null)
  const [careerTwinJob, setCareerTwinJob] = useState<any | null>(null)
  const [isCareerTwinOpen, setIsCareerTwinOpen] = useState(false)
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([])
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [applyStep, setApplyStep] = useState<'form' | 'success'>('form')
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)

  // Current active country config
  const currentCountry = COUNTRIES_CONFIG.find(c => c.code === selectedCountryCode) || COUNTRIES_CONFIG[0]

  const filterOptions = ["All", "Remote", "Hybrid", "Full-time"]

  // Fetch jobs for selected country from API
  const fetchJobs = async (countryCode: string, hub: string = 'All Hubs', query: string = '', isRemote: boolean = false) => {
    setIsLoadingJobs(true)
    try {
      const params = new URLSearchParams()
      params.set('country', countryCode)
      if (hub && hub !== 'All Hubs') params.set('hub', hub)
      if (query) params.set('q', query)
      if (isRemote) params.set('remote', 'true')

      const res = await fetch(`/api/jobs/search?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.jobs)) {
          setJobs(data.jobs)
        }
      }
    } catch (err) {
      console.error("Failed to load country jobs:", err)
      // Client-side fallback
      const fallback = GLOBAL_JOBS_CATALOG.filter(j => j.countryCode === countryCode)
      setJobs(fallback)
    } finally {
      setIsLoadingJobs(false)
    }
  }

  // Reload jobs when country or hub changes
  useEffect(() => {
    fetchJobs(selectedCountryCode, selectedHub, searchQuery, selectedWorkplace === 'Remote')
  }, [selectedCountryCode, selectedHub, selectedWorkplace])

  // Switch country handler
  const handleCountryChange = (newCode: string) => {
    setSelectedCountryCode(newCode)
    setSelectedHub("All Hubs")
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchJobs(selectedCountryCode, selectedHub, searchQuery, selectedWorkplace === 'Remote')
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
      setApplyStep('success')
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-16">
      {/* 1. Global Country & Spoken Languages Selector Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-5 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-blue-500/20 px-3 py-0.5 text-xs font-bold text-sky-300 border border-blue-400/30 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Global Multi-Country Job Engine
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                15 Countries · Real Local Currencies
              </span>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <span className="text-3xl sm:text-4xl">{currentCountry.flag}</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  {currentCountry.name}
                  <span className="text-sm font-semibold text-sky-300 font-mono">({currentCountry.code})</span>
                </h2>
                <div className="flex items-center gap-2 text-xs text-zinc-300 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-amber-300">
                    <Languages className="h-3.5 w-3.5" /> Spoken Languages:
                  </span>
                  <span>{currentCountry.languages.join(' · ')}</span>
                  <span>·</span>
                  <span className="font-semibold text-emerald-300">
                    Currency: {currentCountry.currency} ({currentCountry.currencySymbol})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Country Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedCountryCode}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-white backdrop-blur-md hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer appearance-none pr-9 shadow-md"
              >
                {COUNTRIES_CONFIG.map((c) => (
                  <option key={c.code} value={c.code} className="bg-zinc-900 text-white">
                    {c.flag} {c.name} ({c.languages[0]})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-white/70">
                ▼
              </div>
            </div>

            <button
              onClick={() => fetchJobs(selectedCountryCode, selectedHub, searchQuery, selectedWorkplace === 'Remote')}
              className="rounded-xl bg-white/15 p-2.5 text-white hover:bg-white/25 transition-colors border border-white/20"
              title="Refresh Country Feed"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingJobs ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Scrollable Country Flag Quick-Select Ribbon */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-zinc-400 shrink-0">Switch Country:</span>
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
      </div>

      {/* 2. Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Sidebar Preferences & Hubs */}
        <div className="md:col-span-4 lg:col-span-3 space-y-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Filter className="h-4 w-4 text-zinc-500" />
                {currentCountry.flag} Preferences
              </h3>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:bg-blue-950/40">
                {currentCountry.code} Market
              </span>
            </div>
            <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
              <div className="flex items-center justify-between py-2 px-2 rounded-md bg-sky-50 font-semibold text-[#0A66C2] dark:bg-sky-950/40 cursor-pointer">
                <span>My Applications</span>
                <span className="text-xs">{appliedJobIds.length > 0 ? appliedJobIds.length : '4'}</span>
              </div>
              <div
                onClick={() => {
                  if (onNavigateCareerSuite) onNavigateCareerSuite()
                }}
                className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-purple-600 dark:text-purple-400 font-semibold"
              >
                <span>Expedite CareerSuite™</span>
                <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              </div>
              <div className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                <span>Local Currency</span>
                <span className="font-bold text-emerald-600">{currentCountry.currency} ({currentCountry.currencySymbol})</span>
              </div>
              <div className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                <span>Primary Language</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{currentCountry.primaryLanguage}</span>
              </div>
            </div>
          </div>

          {/* Regional Tech Centers in Selected Country */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2.5">
            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#0A66C2]" />
              {currentCountry.name} Tech Centers
            </h4>
            <p className="text-[11px] text-zinc-500">
              Filter openings by regional innovation hubs in {currentCountry.name}.
            </p>
            <div className="space-y-1 pt-1">
              {currentCountry.hubs.map((hub) => {
                const isSelected = selectedHub === hub
                return (
                  <button
                    key={hub}
                    onClick={() => setSelectedHub(hub)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#0A66C2] text-white shadow-2xs"
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
        </div>

        {/* Main Jobs Section */}
        <div className="md:col-span-8 lg:col-span-9 space-y-4">
          {/* Search Header Bar */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 flex items-center rounded-lg bg-zinc-50 px-3 py-2 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800/80">
                <Search className="h-4 w-4 text-zinc-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder={`Search jobs in ${currentCountry.name} (e.g. Security, Next.js, AI, Lead)...`}
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
                {isLoadingJobs ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Search in {currentCountry.name}</span>
                  </>
                )}
              </button>
            </form>

            {/* Workplace Filters */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {filterOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedWorkplace(opt)}
                    className={`rounded-full px-3 py-1 font-semibold transition-colors whitespace-nowrap ${
                      selectedWorkplace === opt
                        ? "bg-[#0A66C2] text-white"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <span className="text-xs text-zinc-500 font-medium">
                {jobs.length} openings in {currentCountry.flag} {currentCountry.name}
              </span>
            </div>
          </div>

          {/* Jobs List */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Openings in {currentCountry.flag} {currentCountry.name}</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {currentCountry.currency} Compensation
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-500">
                  {selectedHub !== "All Hubs" ? `Filtered to: ${selectedHub}` : `Showing all verified roles across ${currentCountry.name}`}
                </p>
              </div>
            </div>

            {jobs.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                  No openings found for this filter in {currentCountry.name}
                </p>
                <p className="text-xs text-zinc-500">
                  Try searching for a different keyword or resetting the regional hub filter.
                </p>
                <button
                  onClick={() => {
                    setSelectedHub("All Hubs")
                    setSearchQuery("")
                    setSelectedWorkplace("All")
                  }}
                  className="rounded-full bg-[#0A66C2] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#004182] mt-2"
                >
                  Reset All Filters
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
                            {job.source && (
                              <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-mono text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400">
                                {job.source}
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
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                {job.salaryRange}
                              </span>
                            )}
                            <span>{job.postedTime}</span>
                            <span>· {job.applicantsCount} applicants</span>
                          </div>

                          {/* Language Requirement Badge */}
                          {job.languageRequirement && (
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300 pt-0.5">
                              <Languages className="h-3 w-3 text-amber-600" />
                              <span>{job.languageRequirement}</span>
                            </div>
                          )}

                          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 pt-1 leading-relaxed">
                            {job.description}
                          </p>

                          {/* Skills & Location Tags */}
                          {job.tags && job.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1.5">
                              {job.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                                >
                                  {tag}
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
                            className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 border border-purple-200/80 hover:bg-purple-100 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300 transition-all flex items-center gap-1"
                            title="AI Interview Simulation & Tailored Talking Points"
                          >
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            <span>CareerTwin™ Prep</span>
                          </button>

                          <button
                            onClick={() => toggleSaveJob(job.id)}
                            className={`rounded-full p-1.5 transition-colors ${
                              job.isSaved
                                ? "text-[#0A66C2] bg-sky-50 dark:bg-sky-950"
                                : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
                            }`}
                            title={job.isSaved ? "Saved" : "Save Job"}
                          >
                            <Bookmark className={`h-4 w-4 ${job.isSaved ? "fill-[#0A66C2]" : ""}`} />
                          </button>
                        </div>

                        {/* Apply Button */}
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

      {/* Easy Apply / Application Modal */}
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
                    <p className="text-[11px] text-emerald-600 font-medium">
                      📍 Target Market: {selectedJob.countryName} ({selectedJob.location})
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
                          Alex_Taylor_International_Architect_2026.pdf
                        </span>
                      </div>
                      <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800">
                        Default
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Language & Fit Note for {selectedJob.company} (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder={`Highlight experience relevant to ${selectedJob.location} and proficiency in ${selectedJob.languageRequirement}...`}
                      className="w-full rounded-lg border border-zinc-300 p-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsApplyModalOpen(false)}
                      className="rounded-full px-4 py-1.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-[#0A66C2] px-5 py-1.5 text-xs font-bold text-white hover:bg-[#004182] flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Application</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-6 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    Application Submitted!
                  </h4>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Your profile and verified credentials have been transmitted directly to the hiring team at {selectedJob.company} in {selectedJob.countryName}.
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

      {/* CareerTwin AI Interview Prep Modal */}
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
