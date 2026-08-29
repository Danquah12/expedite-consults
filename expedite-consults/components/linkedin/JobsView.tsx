"use client"

import React, { useState } from "react"
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
  X
} from "lucide-react"
import { JobItem, initialJobs } from "@/lib/linkedin-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CareerTwinModal } from "./CareerTwinModal"

export function JobsView() {
  const [jobs, setJobs] = useState<JobItem[]>(initialJobs)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedWorkplace, setSelectedWorkplace] = useState<string>("All")
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null)
  const [careerTwinJob, setCareerTwinJob] = useState<JobItem | null>(null)
  const [isCareerTwinOpen, setIsCareerTwinOpen] = useState(false)
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([])
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [applyStep, setApplyStep] = useState<'form' | 'success'>('form')

  const filterOptions = ["All", "Remote", "Hybrid", "Full-time"]

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-5 pb-12">
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
              <span className="text-xs">4</span>
            </div>
            <div className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
              <span>Job alerts</span>
              <span className="text-xs text-zinc-400">2 active</span>
            </div>
            <div className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
              <span>Demonstrate skills</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
              <span>Salary insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Jobs Section */}
      <div className="md:col-span-8 lg:col-span-9 space-y-4">
        {/* Search Bar & Filter Badges */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/70">
            <Search className="h-4 w-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by title, skill, or company (e.g. Cloud Security, Next.js, Expedite)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedWorkplace(filter)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  selectedWorkplace === filter
                    ? "bg-[#0A66C2] text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Job Listings List */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Recommended for you
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Based on your profile and search history
              </p>
            </div>
            <span className="text-xs font-semibold text-zinc-400">
              {filteredJobs.length} results
            </span>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredJobs.map((job) => {
              const hasApplied = appliedJobIds.includes(job.id)

              return (
                <div key={job.id} className="py-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={job.companyLogo}
                        alt={job.company}
                        className="h-12 w-12 rounded-lg object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
                      />
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-zinc-900 hover:text-[#0A66C2] hover:underline cursor-pointer dark:text-zinc-100">
                          {job.title}
                        </h4>
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {job.company}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                          {job.location} · {job.workplaceType}
                        </p>
                        {job.salaryRange && (
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                            {job.salaryRange}
                          </p>
                        )}
                        <p className="text-[11px] text-zinc-400 mt-1">
                          {job.postedTime} · {job.applicantsCount} applicants
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCareerTwinJob(job)
                          setIsCareerTwinOpen(true)
                        }}
                        className="rounded-full border border-purple-600/30 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300 transition-all flex items-center gap-1"
                        title="Prepare with AI CareerTwin"
                      >
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        <span className="hidden sm:inline">CareerTwin™ Prep</span>
                      </button>

                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
                        title="Save Job"
                      >
                        <Bookmark
                          className={`h-5 w-5 ${
                            job.isSaved ? "fill-[#0A66C2] text-[#0A66C2]" : ""
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleOpenApply(job)}
                        disabled={hasApplied}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                          hasApplied
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 cursor-default"
                            : "bg-[#0A66C2] text-white hover:bg-[#004182] shadow-xs"
                        }`}
                      >
                        {hasApplied ? "Applied ✓" : job.easyApply ? "Easy Apply" : "Apply"}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 pl-15 leading-relaxed line-clamp-2">
                    {job.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Easy Apply Modal Dialog */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden sm:rounded-xl">
          <DialogHeader className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Apply to {selectedJob?.company}
            </DialogTitle>
          </DialogHeader>

          {applyStep === 'form' && selectedJob && (
            <form onSubmit={handleSubmitApplication} className="p-6 space-y-4">
              <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60 flex items-center gap-3">
                <img
                  src={selectedJob.companyLogo}
                  alt={selectedJob.company}
                  className="h-10 w-10 rounded-md object-cover"
                />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                    {selectedJob.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {selectedJob.location} · {selectedJob.salaryRange}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Alex Taylor"
                    required
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="alex.taylor@expedite-consults.com"
                    required
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Resume / CV
                  </label>
                  <div className="mt-1 flex items-center justify-between rounded-md border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
                    <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                      Alex_Taylor_Principal_Architect.pdf
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-sm">
                      Ready
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="rounded-full px-4 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#0A66C2] px-5 py-1.5 text-xs font-semibold text-white hover:bg-[#004182] shadow-xs"
                >
                  Submit application
                </button>
              </div>
            </form>
          )}

          {applyStep === 'success' && (
            <div className="p-8 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Application Submitted!
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Your application for <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedJob?.title}</span> has been sent to the recruiting team.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setIsApplyModalOpen(false)}
                  className="rounded-full bg-[#0A66C2] px-6 py-2 text-xs font-semibold text-white hover:bg-[#004182]"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CareerTwin AI Matchmaker & Mock Interviewer */}
      <CareerTwinModal
        isOpen={isCareerTwinOpen}
        onClose={() => setIsCareerTwinOpen(false)}
        job={careerTwinJob}
      />
    </div>
  )
}
