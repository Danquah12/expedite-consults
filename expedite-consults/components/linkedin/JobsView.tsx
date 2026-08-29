"use client"

import React, { useState, useEffect, useTransition } from "react"
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
  FileText
} from "lucide-react"
import { JobItem, initialJobs } from "@/lib/linkedin-data"
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
  const [jobs, setJobs] = useState<JobItem[]>(initialJobs)
  const [searchQuery, setSearchQuery] = useState("")
  const [locationQuery, setLocationQuery] = useState("")
  const [selectedWorkplace, setSelectedWorkplace] = useState<string>("All")
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null)
  const [careerTwinJob, setCareerTwinJob] = useState<JobItem | null>(null)
  const [isCareerTwinOpen, setIsCareerTwinOpen] = useState(false)
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([])
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [applyStep, setApplyStep] = useState<'form' | 'success'>('form')
  const [isLoadingLiveJobs, setIsLoadingLiveJobs] = useState(false)
  const [liveSources, setLiveSources] = useState<string[]>([
    'Expedite Direct ATS',
    'Greenhouse Public Boards',
    'Lever API',
    'Arbeitnow Web Feed'
  ])

  const filterOptions = ["All", "Remote", "Hybrid", "Full-time"]

  const trendingSearches = [
    'Cloud Security',
    'AI / LLM Engineer',
    'Next.js / React',
    'Zero Trust Architect',
    'Kubernetes SRE',
    'AppSec Lead'
  ]

  // Function to fetch live jobs from our aggregation API
  const fetchLiveJobs = async (query: string = '', location: string = '', isRemote: boolean = false) => {
    setIsLoadingLiveJobs(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (location) params.set('location', location)
      if (isRemote) params.set('remote', 'true')

      const res = await fetch(`/api/jobs/search?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.jobs) && data.jobs.length > 0) {
          setJobs(data.jobs)
          if (data.sourcesConnected) setLiveSources(data.sourcesConnected)
        }
      }
    } catch (err) {
      console.error("Failed to fetch live jobs:", err)
    } finally {
      setIsLoadingLiveJobs(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchLiveJobs(searchQuery, locationQuery, selectedWorkplace === 'Remote')
  }

  const handleTrendingClick = (term: string) => {
    setSearchQuery(term)
    fetchLiveJobs(term, locationQuery, selectedWorkplace === 'Remote')
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.tags && job.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))

    const matchesWorkplace =
      selectedWorkplace === "All" ||
      job.workplaceType === selectedWorkplace ||
      job.employmentType === selectedWorkplace
    return matchesSearch && matchesWorkplace
  })

  const toggleSaveJob = (jobId: string) => {
    setJobs(prev =>
      prev.map(j => (j.id === jobId ? { ...j, isSaved: !j.isSaved } : j))
    )
  }

  const handleOpenApply = (job: JobItem) => {
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
    <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-5 pb-16">
      {/* Left Sidebar Filters */}
      <div className="md:col-span-4 lg:col-span-3 space-y-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-500" />
            Job Preferences
          </h3>
          <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center justify-between py-2 px-2 rounded-md bg-sky-50 font-semibold text-[#0A66C2] dark:bg-sky-950/40 cursor-pointer">
              <span>My Jobs</span>
              <span className="text-xs">{appliedJobIds.length > 0 ? appliedJobIds.length : '4'}</span>
            </div>
            <div className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
              <span>Job alerts</span>
              <span className="text-xs text-zinc-400">2 active</span>
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
              <span>Salary insights</span>
            </div>
          </div>
        </div>

        {/* Live Aggregation Engine Status */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Job Feeds Connected
            </h4>
            <button
              onClick={() => fetchLiveJobs(searchQuery, locationQuery)}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              title="Refresh Live Feeds"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingLiveJobs ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Real-time multi-source pipeline aggregating direct enterprise ATS boards, Greenhouse, Lever, and tech job APIs.
          </p>
          <div className="space-y-1 pt-1">
            {liveSources.map((src, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">
                <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                <span className="truncate">{src}</span>
              </div>
            ))}
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
                placeholder="Search real jobs (e.g. Cloud Security, Next.js, AI Engineer)..."
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
              disabled={isLoadingLiveJobs}
              className="rounded-lg bg-[#0A66C2] px-5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#004182] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              {isLoadingLiveJobs ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Search Real Jobs</span>
                </>
              )}
            </button>
          </form>

          {/* Trending Searches Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
            <span className="text-[11px] text-zinc-400 font-semibold mr-1">Trending:</span>
            {trendingSearches.map((term) => (
              <button
                key={term}
                onClick={() => handleTrendingClick(term)}
                className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-700 hover:bg-sky-50 hover:text-[#0A66C2] transition-colors dark:bg-zinc-800 dark:text-zinc-300"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setSelectedWorkplace(opt)
                    fetchLiveJobs(searchQuery, locationQuery, opt === 'Remote')
                  }}
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
              {filteredJobs.length} live openings found
            </span>
          </div>
        </div>

        {/* Jobs List */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Recommended for you
              </h3>
              <p className="text-[11px] text-zinc-500">
                Based on your profile, zero-trust cybersecurity expertise, and live ATS feeds
              </p>
            </div>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredJobs.map((job) => {
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
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                          {job.location} · {job.workplaceType}
                        </span>
                        {job.salaryRange && (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {job.salaryRange}
                          </span>
                        )}
                        <span>{job.postedTime}</span>
                        <span>· {job.applicantsCount} applicants</span>
                      </div>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 pt-1 leading-relaxed">
                        {job.description}
                      </p>

                      {/* Skills Tags */}
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
                  <span>{selectedJob.company}</span>
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
                          Alex_Taylor_ZeroTrust_Architect_2026.pdf
                        </span>
                      </div>
                      <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800">
                        Default
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Why are you a great fit for {selectedJob.company}? (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Highlight relevant experience in zero-trust architecture, multi-cloud governance, or agentic security..."
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
                    Your profile and verified credentials have been transmitted directly to the hiring team at {selectedJob.company}.
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
