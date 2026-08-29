"use client"

import React, { useState } from "react"
import {
  GraduationCap,
  PlayCircle,
  Award,
  CheckCircle2,
  TrendingUp,
  Search,
  Star,
  Clock,
  Sparkles,
  BookOpen,
  Filter,
  Eye,
  Building,
  Check,
  ExternalLink,
  Layers,
  Code2,
  Key,
  Database,
  Globe,
  Radio,
  Cpu
} from "lucide-react"
import { CourseItem, initialCourses, analyticsData, UserProfile } from "@/lib/linkedin-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface LearningViewProps {
  user: UserProfile
  onAddCertificateToProfile?: (course: CourseItem) => void
}

export function LearningView({ user, onAddCertificateToProfile }: LearningViewProps) {
  const [courses, setCourses] = useState<CourseItem[]>(initialCourses)
  const [selectedLevel, setSelectedLevel] = useState<string>("All")
  const [selectedProvider, setSelectedProvider] = useState<string>("All")
  const [activeCourse, setActiveCourse] = useState<CourseItem | null>(null)
  const [addedCertificates, setAddedCertificates] = useState<string[]>([])
  const [showApiDocs, setShowApiDocs] = useState(false)

  const providers = ["All", "O'Reilly", "Coursera", "Udemy", "ConnectIn Masterclass"]

  const filteredCourses = courses.filter(c => {
    const matchLevel = selectedLevel === "All" || c.level === selectedLevel
    const matchProvider = selectedProvider === "All" || (c.provider || 'ConnectIn Masterclass') === selectedProvider
    return matchLevel && matchProvider
  })

  const handleEnroll = (courseId: string) => {
    setCourses(prev =>
      prev.map(c => (c.id === courseId ? { ...c, isEnrolled: true } : c))
    )
  }

  const handleAddCert = (course: CourseItem) => {
    setAddedCertificates(prev => [...prev, course.id])
    if (onAddCertificateToProfile) {
      onAddCertificateToProfile(course)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* 1. Top Premium Analytics Banner & Insights */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-950 p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/40">
                ⭐ ConnectIn Premium Learning & Intelligence
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                API Multi-Source Sync Active
              </span>
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight">
              Enterprise Learning Hub & Career Analytics
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-sky-200 max-w-xl">
              Upskill with verified courses from <strong>O&apos;Reilly Learning</strong>, <strong>Coursera</strong>, <strong>Udemy</strong>, and <strong>ConnectIn Masterclasses</strong>. Automatically sync verified certificates to your profile.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowApiDocs(!showApiDocs)}
              className="rounded-xl bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur-xs border border-white/20 hover:bg-white/25 transition-all flex items-center gap-1.5"
            >
              <Code2 className="h-4 w-4 text-sky-300" />
              <span>{showApiDocs ? "Hide API Specs" : "O'Reilly & Learning APIs"}</span>
            </button>

            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-xs text-center border border-white/10 min-w-[110px]">
              <p className="text-2xl font-black text-amber-300">
                {analyticsData.searchOccurrencesCount}
              </p>
              <p className="text-[11px] text-sky-200">Search Appearances</p>
            </div>
          </div>
        </div>
      </div>

      {/* API Architecture & Integration Info Panel (Expandable) */}
      {showApiDocs && (
        <div className="rounded-2xl border border-sky-500/30 bg-[#070b16] p-6 text-white space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
                <Database className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-white">
                  O&apos;Reilly & External Learning API Integration Blueprint
                </h3>
                <p className="text-xs text-zinc-400">
                  How ConnectIn connects with O&apos;Reilly Safari, Coursera, Udemy, and Pluralsight.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              SAML 2.0 / LTI / xAPI Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
              <span className="font-bold text-sky-400 flex items-center gap-1.5">
                <Globe className="h-4 w-4" /> 1. O&apos;Reilly Learning Platform API
              </span>
              <p className="text-zinc-400 leading-relaxed">
                O&apos;Reilly provides enterprise REST APIs (<code className="text-sky-300">api.oreilly.com/v2/</code>) for catalog search, book/video metadata ingestion, and reading list sync. Uses <strong>SAML 2.0 SSO</strong> and <strong>xAPI (Tin Can) statements</strong> to stream completed books and sandbox scenarios directly to our profile.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
              <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" /> 2. Coursera & edX Partner APIs
              </span>
              <p className="text-zinc-400 leading-relaxed">
                <strong>Coursera for Business API</strong> exposes programmatic learner enrollment, gradebook sync, and direct PDF certificate verification hashes. <strong>Open edX REST APIs</strong> enable embedding course video modules directly inside ConnectIn.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Award className="h-4 w-4" /> 3. Credly & Badge Verification
              </span>
              <p className="text-zinc-400 leading-relaxed">
                ConnectIn listens to webhook completion events and uses the <strong>Credly / Accredible API</strong> to issue tamper-proof cryptographic badges (CISSP, AWS SAP-C02, CISA) to candidate profiles.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. 90-Day Recruiter & Search Appearance Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Top Viewer Companies */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Building className="h-4 w-4 text-[#0A66C2]" />
            Where your profile viewers work
          </h3>
          <div className="mt-4 space-y-3">
            {analyticsData.topViewerCompanies.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-800 dark:text-zinc-200">{item.company}</span>
                  <span className="font-bold text-zinc-600 dark:text-zinc-400">{item.percentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-[#0A66C2]"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Keywords Used by Recruiters */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Search className="h-4 w-4 text-emerald-600" />
            Top Search Keywords that found you
          </h3>
          <div className="mt-4 space-y-2.5">
            {analyticsData.topSearchKeywords.map((k, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg bg-zinc-50 p-2.5 text-xs dark:bg-zinc-800/60"
              >
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  &ldquo;{k.keyword}&rdquo;
                </span>
                <span className="rounded-full bg-sky-100 px-2 py-0.5 font-bold text-[#0A66C2] dark:bg-sky-950 dark:text-sky-300">
                  {k.count} times
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Multi-Source Learning Course Catalog */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 gap-3">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#0A66C2]" />
              ConnectIn Learning Masterclasses & External Libraries
            </h3>
            <p className="text-xs text-zinc-500">
              Aggregated from O&apos;Reilly Learning, Coursera, Udemy, and ConnectIn Executive Masterclasses.
            </p>
          </div>

          {/* Provider Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {providers.map((prov) => {
              const isSelected = selectedProvider === prov
              return (
                <button
                  key={prov}
                  onClick={() => setSelectedProvider(prov)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-[#0A66C2] text-white shadow-xs"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {prov === "O'Reilly" ? "🔴 O'Reilly" : prov === "Coursera" ? "🔵 Coursera" : prov === "Udemy" ? "🟣 Udemy" : prov}
                </button>
              )
            })}
          </div>
        </div>

        {/* Level Filters */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 font-medium">
            Showing <strong>{filteredCourses.length}</strong> courses
          </span>

          <div className="flex gap-1.5">
            {["All", "Intermediate", "Advanced"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  selectedLevel === lvl
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {filteredCourses.map((course) => {
            const hasAdded = addedCertificates.includes(course.id)

            return (
              <div
                key={course.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-zinc-900">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-full w-full object-cover opacity-85 transition-transform duration-300 hover:scale-105"
                    />
                    <button
                      onClick={() => {
                        if (course.externalUrl) {
                          window.open(course.externalUrl, '_blank')
                        } else {
                          setActiveCourse(course)
                        }
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                    >
                      <PlayCircle className="h-12 w-12 text-white/90 drop-shadow-md" />
                    </button>

                    {/* Source Provider Badge */}
                    <span className="absolute top-3 left-3 rounded-full bg-zinc-950/80 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs border border-white/20">
                      {course.provider || "ConnectIn Masterclass"}
                    </span>

                    <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-xs">
                      {course.duration}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span className="font-semibold text-[#0A66C2]">{course.level}</span>
                      <span className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="h-3 w-3 fill-amber-500" /> {course.rating}
                      </span>
                    </div>

                    <h4
                      onClick={() => {
                        if (course.externalUrl) {
                          window.open(course.externalUrl, '_blank')
                        } else {
                          setActiveCourse(course)
                        }
                      }}
                      className="font-bold text-sm text-zinc-900 leading-snug hover:text-[#0A66C2] hover:underline cursor-pointer dark:text-zinc-100 line-clamp-2"
                    >
                      {course.title}
                    </h4>

                    {/* Instructor Row */}
                    <div className="flex items-center gap-2 pt-1">
                      <img
                        src={course.instructor.avatar}
                        alt={course.instructor.name}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                        {course.instructor.name}
                      </span>
                    </div>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {course.skillsCovered.map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 pt-0 space-y-2">
                  {course.isEnrolled ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (course.externalUrl) {
                            window.open(course.externalUrl, '_blank')
                          } else {
                            setActiveCourse(course)
                          }
                        }}
                        className="flex-1 rounded-full bg-zinc-100 py-1.5 text-xs font-bold text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors text-center"
                      >
                        {course.externalUrl ? "Open in " + course.provider : "Resume Learning"}
                      </button>

                      <button
                        onClick={() => handleAddCert(course)}
                        disabled={hasAdded}
                        className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1 ${
                          hasAdded
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400"
                            : "border border-amber-400/80 bg-amber-50/50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300"
                        }`}
                        title="Add Verified Certificate to ConnectIn Profile"
                      >
                        {hasAdded ? <Check className="h-3 w-3" /> : <Award className="h-3 w-3" />}
                        <span>{hasAdded ? "Added" : "Add Cert"}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (course.externalUrl) {
                          window.open(course.externalUrl, '_blank')
                        } else {
                          handleEnroll(course.id)
                        }
                      }}
                      className="w-full rounded-full bg-[#0A66C2] py-2 text-xs font-bold text-white hover:bg-[#004182] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>{course.externalUrl ? "Enroll on " + (course.provider || "Partner") : "Enroll Now"}</span>
                      {course.externalUrl && <ExternalLink className="h-3 w-3" />}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Video / Course Player Modal */}
      <Dialog open={Boolean(activeCourse)} onOpenChange={() => setActiveCourse(null)}>
        <DialogContent className="max-w-2xl">
          {activeCourse && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs text-[#0A66C2] font-semibold">
                  <span>{activeCourse.provider || "ConnectIn Masterclass"}</span>
                  <span>·</span>
                  <span>{activeCourse.level}</span>
                </div>
                <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {activeCourse.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="aspect-video w-full rounded-xl bg-black flex items-center justify-center relative overflow-hidden">
                  <img
                    src={activeCourse.thumbnail}
                    alt={activeCourse.title}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute flex flex-col items-center gap-2 text-white">
                    <PlayCircle className="h-16 w-16 text-white drop-shadow-lg" />
                    <p className="text-xs font-semibold">Stream Lesson 1: Introduction</p>
                  </div>
                </div>

                <div className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  <p>{activeCourse.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <img
                      src={activeCourse.instructor.avatar}
                      alt={activeCourse.instructor.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {activeCourse.instructor.name}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {activeCourse.instructor.role}
                      </p>
                    </div>
                  </div>

                  {activeCourse.externalUrl ? (
                    <a
                      href={activeCourse.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-[#0A66C2] px-5 py-2 text-xs font-bold text-white hover:bg-[#004182] flex items-center gap-1.5"
                    >
                      <span>Open in {activeCourse.provider}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        handleAddCert(activeCourse)
                        setActiveCourse(null)
                      }}
                      className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:from-amber-600 hover:to-amber-700 flex items-center gap-1.5"
                    >
                      <Award className="h-4 w-4" />
                      <span>Complete & Add Certificate</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
