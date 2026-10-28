"use client"

import { X } from "lucide-react"
import React, { useState, useRef } from "react"
import {
  FileText,
  PlayCircle,
  Presentation,
  Image as ImageIcon,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  CheckCircle2,
  Sparkles,
  Award,
  Microscope,
  Search,
  Shield,
  BookOpen,
  Users,
  Clock,
  Check,
  Plus,
  Globe
} from "lucide-react"
import {
  CONNECTLN_CYBER_SPECIALIST_SHELVES,
  CONNECTLN_AI_STUDIES_SHELVES,
  CONNECTLN_CERTIFICATIONS_AND_CEU_SHELVES,
  CONNECTLN_TOP_10_AI_SKILLS,
  ConnectLnCatalogCourse,
  ConnectLnCourseShelf,
  ConnectLnCourseMultimediaDossier,
  getConnectLnCourseMultimediaDossier
} from "@/lib/connectln-cyber-specialist-catalog"
import { SkillDeepDiveSpec } from "@/lib/learning-roadmap-whitepapers"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

interface ConnectLnStudiesCatalogViewProps {
  onClaimCertificate?: (title: string) => void
  initialAcademyFilter?: "all" | "cyber_specialist" | "ai_studies" | "certifications_ceu"
}

export function ConnectLnStudiesCatalogView({
  onClaimCertificate,
  initialAcademyFilter = "all"
}: ConnectLnStudiesCatalogViewProps) {
  const [activeAcademyFilter, setActiveAcademyFilter] = useState<
    "all" | "cyber_specialist" | "ai_studies" | "certifications_ceu"
  >(initialAcademyFilter)

  React.useEffect(() => {
    setActiveAcademyFilter(initialAcademyFilter)
  }, [initialAcademyFilter])
  const [searchFilter, setSearchFilter] = useState("")
  const [selectedFrameworkPill, setSelectedFrameworkPill] = useState<string>("All")

  // Followed AI Skills State (Top 10 AI Skills)
  const [followedAiSkills, setFollowedAiSkills] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    CONNECTLN_TOP_10_AI_SKILLS.forEach((s) => {
      init[s.name] = s.defaultFollowed
    })
    return init
  })

  // Active Multimedia Dossier Modal State
  const [activeDossier, setActiveDossier] = useState<ConnectLnCourseMultimediaDossier | null>(null)
  const [activeModalTab, setActiveModalTab] = useState<
    "whitepaper" | "video" | "slides" | "sources"
  >("whitepaper")
  const [activeWhitePaperPage, setActiveWhitePaperPage] = useState<number>(1)
  const [whitePaperViewAll, setWhitePaperViewAll] = useState<boolean>(false)
  const [highlightedSkillName, setHighlightedSkillName] = useState<string | null>(null)
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0)
  const [activeVideoChapter, setActiveVideoChapter] = useState<number>(1)
  const [useMp4Fallback, setUseMp4Fallback] = useState<boolean>(false)
  const [claimedCertIds, setClaimedCertIds] = useState<Record<string, boolean>>({})

  // Shelf horizontal scroll refs
  const shelfRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const scrollShelf = (shelfId: string, dir: "left" | "right") => {
    const el = shelfRefs.current[shelfId]
    if (!el) return
    el.scrollBy({ left: dir === "left" ? -640 : 640, behavior: "smooth" })
  }

  const openCourseDossier = (
    course: ConnectLnCatalogCourse,
    shelfTitle?: string,
    initialTab: "whitepaper" | "video" | "slides" | "sources" = "whitepaper",
    focusSkill?: string
  ) => {
    const dossier = getConnectLnCourseMultimediaDossier(course, shelfTitle)
    setActiveDossier(dossier)
    setActiveModalTab(initialTab)
    setActiveSlideIndex(0)
    setActiveVideoChapter(1)
    if (focusSkill) {
      setHighlightedSkillName(focusSkill)
      const matched = dossier.whitePaper.skillDeepDives.find((s) => s.skillName === focusSkill)
      setActiveWhitePaperPage(matched ? matched.pageNumber : 3)
      setWhitePaperViewAll(false)
    } else {
      setHighlightedSkillName(dossier.whitePaper.skillDeepDives[0]?.skillName || null)
      setActiveWhitePaperPage(1)
    }
  }

  const openAiSkillWhitePaper = (skillObj: (typeof CONNECTLN_TOP_10_AI_SKILLS)[0]) => {
    const syntheticCourse: ConnectLnCatalogCourse = {
      id: `cln-skill-${skillObj.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      shelfId: "shelf-ai-top-10-skills",
      academyTrack: "ai_studies",
      title: `ConnectLn Studies Deep-Dive Monograph: ${skillObj.name}`,
      badge: "Popular",
      duration: "4h 30m Complete Skill Track",
      author: "ConnectLn Studies AI & Mathematical Foundations Council",
      learnersCount: skillObj.learners,
      skills: [
        skillObj.name,
        `${skillObj.category} Architecture`,
        "Production Benchmarks & Evals",
        "NIST AI RMF Compliance"
      ],
      category: "AI & Agentic Systems",
      thumbnail: "/images/connectln-studies/ai-studies-cover.jpg",
      customCoverArt: "/images/connectln-studies/ai-studies-cover.jpg",
      referenceUrl: "https://www.nist.gov/itl/ai-risk-management-framework",
      summary: skillObj.summary
    }
    openCourseDossier(syntheticCourse, "Top Artificial Intelligence Skills — ConnectLn Studies", "whitepaper")
  }

  const handleDownloadMarkdown = (dossier: ConnectLnCourseMultimediaDossier) => {
    const blob = new Blob([dossier.whitePaper.fullMarkdown], {
      type: "text/markdown;charset=utf-8"
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${dossier.whitePaper.docId.toLowerCase()}-10page-whitepaper.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filterShelves = (shelves: ConnectLnCourseShelf[]) => {
    if (!searchFilter.trim()) return shelves
    const q = searchFilter.toLowerCase()
    return shelves
      .map((shelf) => ({
        ...shelf,
        courses: shelf.courses.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.author.toLowerCase().includes(q) ||
            c.summary.toLowerCase().includes(q) ||
            c.skills.some((sk) => sk.toLowerCase().includes(q))
        )
      }))
      .filter((shelf) => shelf.courses.length > 0)
  }

  const visibleCyberShelves =
    activeAcademyFilter === "all" || activeAcademyFilter === "cyber_specialist"
      ? filterShelves(CONNECTLN_CYBER_SPECIALIST_SHELVES)
      : []

  const visibleAiShelves =
    activeAcademyFilter === "all" || activeAcademyFilter === "ai_studies"
      ? filterShelves(CONNECTLN_AI_STUDIES_SHELVES)
      : []

  const visibleCertShelves =
    activeAcademyFilter === "all" || activeAcademyFilter === "certifications_ceu"
      ? filterShelves(CONNECTLN_CERTIFICATIONS_AND_CEU_SHELVES)
      : []

  const renderShelf = (shelf: ConnectLnCourseShelf) => {
    const isUpskillingShelf = shelf.id === "shelf-ai-upskilling-framework"
    const displayedCourses =
      isUpskillingShelf && selectedFrameworkPill !== "All"
        ? shelf.courses.filter((c) => c.aiFrameworkLevel === selectedFrameworkPill)
        : shelf.courses

    return (
      <div
        key={shelf.id}
        className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4"
      >
        {/* Shelf Header with Previous / Next Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-100 dark:bg-indigo-950/80 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                {shelf.academyTrack === "ai_studies"
                  ? "ConnectLn Studies · Artificial Intelligence"
                  : "ConnectLn Studies · Cyber Security Specialist"}
              </span>
              {shelf.totalCountBadge && (
                <span className="rounded-full bg-amber-100 dark:bg-amber-950/70 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800">
                  {shelf.totalCountBadge}
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
              {shelf.title}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{shelf.subtitle}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scrollShelf(shelf.id, "left")}
              className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-1 cursor-pointer transition-all"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={() => scrollShelf(shelf.id, "right")}
              className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-1 cursor-pointer transition-all"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Interactive Filter / Topic Pills for the Shelf */}
        {shelf.filterPills && shelf.filterPills.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {isUpskillingShelf && (
              <button
                type="button"
                onClick={() => setSelectedFrameworkPill("All")}
                className={`rounded-full px-3 py-1 text-[11px] font-bold shrink-0 cursor-pointer transition-all ${
                  selectedFrameworkPill === "All"
                    ? "bg-[#0A66C2] text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                }`}
              >
                All 5 AI Framework Levels
              </button>
            )}
            {shelf.filterPills.map((pill, idx) => {
              const isSelected = isUpskillingShelf && selectedFrameworkPill === pill
              return (
                <button
                  key={pill}
                  type="button"
                  onClick={() => {
                    if (isUpskillingShelf) {
                      setSelectedFrameworkPill(selectedFrameworkPill === pill ? "All" : pill)
                    } else {
                      const targetCourse = shelf.courses[idx % shelf.courses.length]
                      if (targetCourse) openCourseDossier(targetCourse, shelf.title, "whitepaper")
                    }
                  }}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold shrink-0 cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                      : "bg-zinc-100/90 hover:bg-indigo-600 hover:text-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {pill}
                </button>
              )
            })}
          </div>
        )}

        {/* Horizontal Scrollable Course Cards */}
        <div
          ref={(el) => {
            shelfRefs.current[shelf.id] = el
          }}
          className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin"
        >
          {displayedCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => openCourseDossier(course, shelf.title, "whitepaper")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  openCourseDossier(course, shelf.title, "whitepaper")
                }
              }}
              className="group snap-start shrink-0 w-[300px] sm:w-[335px] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/60 overflow-hidden flex flex-col justify-between hover:border-indigo-500 hover:shadow-xl transition-all cursor-pointer"
            >
              <div>
                {/* Custom Generated 8K Cover Art Header */}
                <div className="relative h-40 w-full overflow-hidden bg-slate-950">
                  <img
                    src={course.customCoverArt}
                    alt={course.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                    {course.badge ? (
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm ${
                          course.badge === "New"
                            ? "bg-emerald-500 text-slate-950"
                            : course.badge === "Certification" || course.badge === "Cert Prep"
                            ? "bg-amber-400 text-slate-950"
                            : course.badge === "Learning Path"
                            ? "bg-purple-600 text-white"
                            : "bg-[#0A66C2] text-white"
                        }`}
                      >
                        {course.badge}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="rounded-md bg-black/75 backdrop-blur-xs border border-white/15 px-2 py-0.5 text-[10px] font-mono font-bold text-white">
                      {course.duration}
                    </span>
                  </div>

                  {/* Multimedia Pill Strip at Bottom of Cover */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-amber-300 truncate">
                      ConnectLn Studies
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="rounded bg-white/15 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-white">
                        📜 10-Pg Paper
                      </span>
                      <span className="rounded bg-white/15 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-white">
                        🎬 Video
                      </span>
                      <span className="rounded bg-white/15 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-white">
                        📊 10 Slides
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-4 space-y-2.5">
                  {course.aiFrameworkLevel && (
                    <span className="inline-block rounded bg-indigo-100 dark:bg-indigo-950/90 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                      {course.aiFrameworkLevel}
                    </span>
                  )}

                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                    {course.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span>
                      By: <strong className="text-zinc-700 dark:text-zinc-200">{course.author}</strong>
                    </span>
                    {course.releaseDate && <span>· {course.releaseDate}</span>}
                    {course.learnersCount && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        · {course.learnersCount}
                      </span>
                    )}
                  </div>

                  {course.socialProof && (
                    <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-md px-2 py-1">
                      👍 {course.socialProof}
                    </p>
                  )}

                  {course.updateNotice && (
                    <p className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 rounded-md px-2 py-1 leading-tight">
                      {course.updateNotice}
                    </p>
                  )}

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {course.summary}
                  </p>

                  {/* Clickable Skill Pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {course.skills.slice(0, 4).map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          openCourseDossier(course, shelf.title, "whitepaper", skill)
                        }}
                        title={`Read 10-Page White Paper section for: ${skill}`}
                        className="rounded bg-zinc-200/70 hover:bg-indigo-600 hover:text-white dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-3.5 pt-2 border-t border-zinc-200/80 dark:border-zinc-800 space-y-2 bg-white dark:bg-zinc-900">
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      openCourseDossier(course, shelf.title, "whitepaper")
                    }}
                    className="rounded-lg bg-[#0A66C2] hover:bg-[#084e96] px-2 py-1.5 text-[10px] font-bold text-white flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileText className="h-3 w-3 shrink-0" />
                    <span>10-Pg Paper</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      openCourseDossier(course, shelf.title, "video")
                    }}
                    className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-2 py-1.5 text-[10px] font-bold text-white flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <PlayCircle className="h-3 w-3 shrink-0" />
                    <span>Watch Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      openCourseDossier(course, shelf.title, "slides")
                    }}
                    className="rounded-lg bg-purple-600 hover:bg-purple-700 px-2 py-1.5 text-[10px] font-bold text-white flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Presentation className="h-3 w-3 shrink-0" />
                    <span>10 Slides</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      openCourseDossier(course, shelf.title, "sources")
                    }}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    🖼️ Visuals &amp; Legitimate Sources
                  </button>
                  <a
                    href={course.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>Official Source</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ===================================================================== */}
      {/* CONNECTLN STUDIES HERO BANNER & ACADEMY FILTER BAR                    */}
      {/* ===================================================================== */}
      <div className="rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-400 text-slate-950 px-3 py-0.5 text-xs font-black uppercase tracking-wider">
                🎓 ConnectLn Studies Official Academy
              </span>
              <span className="rounded-full bg-indigo-500/30 border border-indigo-400/40 px-3 py-0.5 text-xs font-bold text-indigo-200">
                1,318+ AI Courses · 76 Learning Paths · 175+ Certifications &amp; CEUs
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              ConnectLn Studies: Cyber Security Specialist, Artificial Intelligence &amp; Official Certifications
            </h2>

            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed max-w-3xl">
              Artificial intelligence (AI) and Zero-Trust Cybersecurity are transforming how we work, and staying up-to-date is critical for any future-looking professional. Every course, learning path, and certification below includes a custom <strong>10-Page Written White Paper</strong>, <strong>HD Video Masterclass</strong>, <strong>10-Slide Executive Presentation Deck</strong>, and direct links to legitimate certification authorities.
            </p>

            {/* Academy Track Switcher Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveAcademyFilter("all")}
                className={`rounded-xl px-3.5 py-2 text-xs font-black transition-all cursor-pointer ${
                  activeAcademyFilter === "all"
                    ? "bg-amber-400 text-slate-950 shadow-md"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/15"
                }`}
              >
                🌐 All ConnectLn Studies ({CONNECTLN_CYBER_SPECIALIST_SHELVES.length + CONNECTLN_AI_STUDIES_SHELVES.length + CONNECTLN_CERTIFICATIONS_AND_CEU_SHELVES.length} Shelves)
              </button>
              <button
                type="button"
                onClick={() => setActiveAcademyFilter("cyber_specialist")}
                className={`rounded-xl px-3.5 py-2 text-xs font-black transition-all cursor-pointer ${
                  activeAcademyFilter === "cyber_specialist"
                    ? "bg-amber-400 text-slate-950 shadow-md"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/15"
                }`}
              >
                🛡️ Cyber Security Specialist (12 Shelves)
              </button>
              <button
                type="button"
                onClick={() => setActiveAcademyFilter("ai_studies")}
                className={`rounded-xl px-3.5 py-2 text-xs font-black transition-all cursor-pointer ${
                  activeAcademyFilter === "ai_studies"
                    ? "bg-amber-400 text-slate-950 shadow-md"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/15"
                }`}
              >
                🤖 ConnectLn Studies: Artificial Intelligence (1,318 Courses)
              </button>
              <button
                type="button"
                onClick={() => setActiveAcademyFilter("certifications_ceu")}
                className={`rounded-xl px-3.5 py-2 text-xs font-black transition-all cursor-pointer ${
                  activeAcademyFilter === "certifications_ceu"
                    ? "bg-amber-400 text-slate-950 shadow-md"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/15"
                }`}
              >
                🏅 Certifications, Practice Exams &amp; CEUs (175+ Credentials)
              </button>
            </div>
          </div>

          {/* Right Featured Cover Preview Grid */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-2.5">
            <img
              src="/images/connectln-studies/cyber-specialist-cover.jpg"
              alt="Cyber Security Specialist"
              className="rounded-xl border border-white/20 h-28 w-full object-cover shadow-lg"
            />
            <img
              src="/images/connectln-studies/ai-studies-cover.jpg"
              alt="ConnectLn Studies AI"
              className="rounded-xl border border-white/20 h-28 w-full object-cover shadow-lg"
            />
            <img
              src="/images/connectln-studies/agentic-mcp-cover.jpg"
              alt="Agentic AI & MCP"
              className="rounded-xl border border-white/20 h-28 w-full object-cover shadow-lg"
            />
            <img
              src="/images/connectln-studies/certifications-hub-cover.jpg"
              alt="Certifications Hub"
              className="rounded-xl border border-white/20 h-28 w-full object-cover shadow-lg"
            />
          </div>
        </div>

        {/* Search Bar across all 110+ ConnectLn Studies Courses & Certifications */}
        <div className="mt-5 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 flex items-center rounded-xl bg-black/40 border border-white/20 px-3.5 py-2">
            <Search className="h-4 w-4 text-indigo-300 mr-2.5 shrink-0" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search CISSP, Defender XDR, Claude Code, CompTIA SecAI+, NVIDIA NCA-GENL, GraphRAG, AKYLADE, Azure AI-900, Wireshark..."
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-indigo-200/60 focus:outline-none"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter("")}
                className="text-xs text-amber-300 font-bold ml-2 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <span className="text-[11px] font-mono text-amber-300 shrink-0">
            ✓ Click any card for 10-Page White Paper · Video · 10 Slides · Official Links
          </span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 1: CONNECTLN STUDIES — ARTIFICIAL INTELLIGENCE HUB            */}
      {/* ===================================================================== */}
      {visibleAiShelves.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-l-4 border-amber-500 pl-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                ConnectLn Studies · Artificial Intelligence Academy
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                Artificial Intelligence — New &amp; Featured, Upskilling Framework (Levels 1–5), Learning Paths &amp; Build with AI
              </h2>
            </div>
          </div>

          {visibleAiShelves.map((shelf) => renderShelf(shelf))}

          {/* Top Artificial Intelligence Skills — 10 Skills to Develop */}
          <div className="rounded-2xl border border-indigo-300 dark:border-indigo-800 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 dark:from-indigo-950/40 dark:via-zinc-900 dark:to-purple-950/30 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
                  Provided by ConnectLn Studies · 10 Skills to Develop
                </span>
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  Top Artificial Intelligence Skills — Follow &amp; Read 10-Page Skill Monographs
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  You can manage the skills you have on your ConnectLn profile or click any skill below to open its 10-Page Technical White Paper, Video &amp; Slide Deck.
                </p>
              </div>
              <a
                href="https://connectln.vercel.app/connectin"
                className="rounded-xl bg-[#0A66C2] hover:bg-[#084e96] px-4 py-2 text-xs font-bold text-white shrink-0 inline-flex items-center gap-1.5"
              >
                <span>Edit Skills on ConnectLn Profile</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {CONNECTLN_TOP_10_AI_SKILLS.map((sk, idx) => {
                const isFollowed = !!followedAiSkills[sk.name]
                return (
                  <div
                    key={sk.name}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 flex flex-col justify-between gap-2.5 shadow-2xs hover:border-indigo-500 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          #{idx + 1} · {sk.category}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setFollowedAiSkills((prev) => ({
                              ...prev,
                              [sk.name]: !prev[sk.name]
                            }))
                          }
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer ${
                            isFollowed
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {isFollowed ? <Check className="h-2.5 w-2.5" /> : <Plus className="h-2.5 w-2.5" />}
                          <span>{isFollowed ? "Following" : "Follow"}</span>
                        </button>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 mt-1">
                        {sk.name}
                      </h4>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        {sk.learners}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                        {sk.summary}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => openAiSkillWhitePaper(sk)}
                      className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1.5 text-[10px] font-bold text-white flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <FileText className="h-3 w-3" />
                      <span>Read 10-Pg Skill Paper →</span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 2: GROW AND ADVANCE AS A CYBER SECURITY SPECIALIST (12 SHELVES)*/}
      {/* ===================================================================== */}
      {visibleCyberShelves.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-l-4 border-[#0A66C2] pl-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#0A66C2] dark:text-blue-400">
                ConnectLn Studies · Cyber Security Specialist Flagship Catalog
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                Grow and Advance as a Cyber Security Specialist (All 12 Curated Shelves)
              </h2>
            </div>
          </div>

          {visibleCyberShelves.map((shelf) => renderShelf(shelf))}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 3: CERTIFICATIONS, PRACTICE EXAMS, CEUs & OFFICE HOURS        */}
      {/* ===================================================================== */}
      {visibleCertShelves.length > 0 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-slate-950 via-amber-950/60 to-indigo-950 p-6 text-white space-y-2">
            <span className="rounded-full bg-amber-400 text-slate-950 px-3 py-0.5 text-[11px] font-black uppercase">
              🏅 Official Certification &amp; CEU Portal · 175+ Credentials
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              ConnectLn Studies Certifications: Professional Certificates, Exam Prep, Practice Simulators &amp; CEUs
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/90 max-w-3xl">
              Earn a professional certificate from top brands on ConnectLn Studies or prepare for off-platform certifications and CEUs with prep courses, 10-page white papers, slide decks, and assessment options available for over 175 different credentials.
            </p>
          </div>

          {visibleCertShelves.map((shelf) => renderShelf(shelf))}
        </div>
      )}

      {/* ===================================================================== */}
      {/* CUSTOMIZED CONNECTLN STUDIES FOOTER                                   */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-[#0A66C2]" />
            <span>ConnectLn Studies · English (English)</span>
          </span>
          <a href="https://connectln.vercel.app/connectin" className="hover:text-[#0A66C2] hover:underline">
            About ConnectLn Studies
          </a>
          <a href="https://connectln.vercel.app/connectin" className="hover:text-[#0A66C2] hover:underline">
            Become an Instructor
          </a>
          <a href="https://connectln.vercel.app/connectin" className="hover:text-[#0A66C2] hover:underline">
            Buy for my team
          </a>
          <a href="https://connectln.vercel.app/connectin" className="hover:text-[#0A66C2] hover:underline">
            Help Center
          </a>
          <a href="https://connectln.vercel.app/connectin" className="hover:text-[#0A66C2] hover:underline">
            Privacy &amp; Terms
          </a>
          <a href="https://connectln.vercel.app/connectin" className="hover:text-[#0A66C2] hover:underline">
            Accessibility
          </a>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          ConnectLn Studies Enterprise Learning · Powered by Expedite Consults
        </span>
      </div>

      {/* ===================================================================== */}
      {/* MULTIMEDIA TRAINING DOSSIER MODAL (10-PG PAPER + VIDEO + 10 SLIDES)   */}
      {/* ===================================================================== */}
      <Dialog
        open={!!activeDossier}
        onOpenChange={(open) => {
          if (!open) setActiveDossier(null)
        }}
      >
        <DialogContent className="max-w-6xl w-[96vw] max-h-[92vh] overflow-y-auto p-0 border-indigo-500/40 bg-zinc-50 dark:bg-zinc-950">
          {activeDossier && (
            <div className="flex flex-col">
              {/* Always-visible close button (stays on screen while scrolling) */}
              <div className="sticky top-0 z-50 h-0 flex justify-end">
                <button
                  type="button"
                  onClick={() => { setActiveDossier(null) }}
                  aria-label="Close"
                  title="Close"
                  className="m-3 h-9 w-9 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center shadow-lg border border-white/30 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {/* Top Hero Banner with Custom 8K Cover Background */}
              <div className="relative bg-slate-950 text-white p-5 sm:p-6 border-b border-indigo-500/30 overflow-hidden">
                <img
                  src={activeDossier.course.customCoverArt}
                  alt={activeDossier.course.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-indigo-950/85" />

                <div className="relative z-10 space-y-4">
                  <DialogHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-amber-400 text-slate-950 px-3 py-0.5 text-[11px] font-mono font-black">
                          🎓 {activeDossier.whitePaper.docId} · CONNECTLN STUDIES DOSSIER
                        </span>
                        <span className="rounded-full bg-indigo-500/30 border border-indigo-400/40 px-2.5 py-0.5 text-[11px] font-bold text-indigo-200">
                          {activeDossier.course.duration} · By {activeDossier.course.author}
                        </span>
                        {activeDossier.course.learnersCount && (
                          <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                            {activeDossier.course.learnersCount}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={activeDossier.course.referenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 text-xs font-black flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Official Certification / Source</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDownloadMarkdown(activeDossier)}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download 10-Pg .MD</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>Print / PDF</span>
                        </button>
                      </div>
                    </div>

                    <DialogTitle className="text-xl sm:text-2xl font-black text-white pt-1 leading-tight">
                      {activeDossier.course.title}
                    </DialogTitle>
                    <p className="text-xs text-indigo-200">
                      <strong>Governing Standards:</strong> {activeDossier.whitePaper.standardsBody} · <strong>Track:</strong> {activeDossier.whitePaper.pathTitle}
                    </p>
                  </DialogHeader>

                  {/* 4-Mode Multimedia Switcher Bar */}
                  <div className="pt-2 border-t border-white/15 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveModalTab("whitepaper")}
                        className={`rounded-xl px-3.5 py-2 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                          activeModalTab === "whitepaper"
                            ? "bg-amber-400 text-slate-950 shadow-md"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        <FileText className="h-4 w-4" />
                        <span>📜 10-Page Written White Paper</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveModalTab("video")}
                        className={`rounded-xl px-3.5 py-2 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                          activeModalTab === "video"
                            ? "bg-amber-400 text-slate-950 shadow-md"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        <PlayCircle className="h-4 w-4" />
                        <span>🎬 Video Masterclass (5 Chapters)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveModalTab("slides")}
                        className={`rounded-xl px-3.5 py-2 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                          activeModalTab === "slides"
                            ? "bg-amber-400 text-slate-950 shadow-md"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        <Presentation className="h-4 w-4" />
                        <span>📊 10-Slide Training Deck</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveModalTab("sources")}
                        className={`rounded-xl px-3.5 py-2 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                          activeModalTab === "sources"
                            ? "bg-amber-400 text-slate-950 shadow-md"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        <ImageIcon className="h-4 w-4" />
                        <span>🖼️ Visuals &amp; Legitimate Sources ({activeDossier.legitimateSources.length})</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setClaimedCertIds((prev) => ({
                          ...prev,
                          [activeDossier.course.id]: true
                        }))
                        if (onClaimCertificate) {
                          onClaimCertificate(activeDossier.course.title)
                        }
                      }}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-black text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Award className="h-4 w-4" />
                      <span>
                        {claimedCertIds[activeDossier.course.id]
                          ? "✓ Added to ConnectLn Profile"
                          : "Claim ConnectLn Certificate"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* =============================================================== */}
              {/* TAB 1: 10-PAGE WRITTEN WHITE PAPER & SKILL DEEP-DIVE INSPECTOR  */}
              {/* =============================================================== */}
              {activeModalTab === "whitepaper" && (
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Key Quantitative Metrics Strip */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {activeDossier.whitePaper.keyMetrics.map((m, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-indigo-200/80 bg-white p-3.5 shadow-2xs dark:border-indigo-900/50 dark:bg-zinc-900"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                          {m.label}
                        </span>
                        <span className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                          {m.value}
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                          {m.subtext}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Skill Deep-Dive Inspector */}
                  <div className="rounded-2xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/25 p-4 sm:p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Microscope className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                          Interactive Skill &amp; Competency Deep-Dive ({activeDossier.whitePaper.skillDeepDives.length} Modules)
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setWhitePaperViewAll(!whitePaperViewAll)}
                        className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-bold text-white cursor-pointer self-start sm:self-auto"
                      >
                        {whitePaperViewAll
                          ? "📖 Switch to Page-by-Page (1–10)"
                          : "📜 View All 10 Pages Continuous"}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {activeDossier.whitePaper.skillDeepDives.map((spec) => {
                        const isSelected =
                          highlightedSkillName === spec.skillName ||
                          (!highlightedSkillName &&
                            spec.skillName === activeDossier.whitePaper.skillDeepDives[0]?.skillName)
                        return (
                          <button
                            key={spec.skillName}
                            type="button"
                            onClick={() => {
                              setHighlightedSkillName(spec.skillName)
                              setActiveWhitePaperPage(spec.pageNumber)
                            }}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? "bg-[#0A66C2] text-white shadow-sm"
                                : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                            }`}
                          >
                            <Microscope className="h-3.5 w-3.5" />
                            <span>{spec.skillName}</span>
                            <span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-mono">
                              Pg {spec.pageNumber}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {(() => {
                      const activeSpec: SkillDeepDiveSpec | undefined =
                        activeDossier.whitePaper.skillDeepDives.find(
                          (s) => s.skillName === highlightedSkillName
                        ) || activeDossier.whitePaper.skillDeepDives[0]
                      if (!activeSpec) return null
                      return (
                        <div className="rounded-xl bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-800/80 p-4 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
                                {activeSpec.categoryBadge} · {activeSpec.standardCode}
                              </span>
                              <h4 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                                {activeSpec.skillName}
                              </h4>
                            </div>
                            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-3 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                              Tolerance: {activeSpec.criticalTolerance}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            {activeSpec.technicalSummary}
                          </p>
                          <div className="rounded-lg bg-slate-950 text-emerald-400 p-3 font-mono text-xs overflow-x-auto">
                            {activeSpec.governingEquation}
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* 10-Page Manuscript Reader */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-3 space-y-1.5">
                      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-1.5 sticky top-3">
                        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                          <span className="text-xs font-black uppercase text-zinc-800 dark:text-zinc-200">
                            10-Page White Paper
                          </span>
                          <span className="text-[10px] font-mono text-indigo-600 font-bold">
                            ~5,800w
                          </span>
                        </div>
                        {activeDossier.whitePaper.pages.map((p) => {
                          const isCurrent =
                            !whitePaperViewAll && activeWhitePaperPage === p.pageNumber
                          return (
                            <button
                              key={p.pageNumber}
                              type="button"
                              onClick={() => {
                                setWhitePaperViewAll(false)
                                setActiveWhitePaperPage(p.pageNumber)
                              }}
                              className={`w-full text-left rounded-lg px-2.5 py-2 text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                                isCurrent
                                  ? "bg-[#0A66C2] text-white font-bold"
                                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                              }`}
                            >
                              <span className="truncate">
                                <strong>Pg {p.pageNumber}:</strong> {p.summaryBadge}
                              </span>
                              <span className="text-[9px] font-mono opacity-75">
                                {p.wordCountEst}w
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="lg:col-span-9 space-y-6">
                      {(whitePaperViewAll
                        ? activeDossier.whitePaper.pages
                        : activeDossier.whitePaper.pages.filter(
                            (p) => p.pageNumber === activeWhitePaperPage
                          )
                      ).map((page) => (
                        <div
                          key={page.pageNumber}
                          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm space-y-5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-zinc-900 dark:border-zinc-700 pb-3">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
                              {page.runningHeader}
                            </span>
                            <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 px-2.5 py-0.5 text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300">
                              Page {page.pageNumber} of 10
                            </span>
                          </div>

                          <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                            {page.pageTitle}
                          </h3>

                          {page.sections.map((sec, sIdx) => (
                            <div key={sIdx} className="space-y-3">
                              <h4 className="text-sm sm:text-base font-bold text-indigo-950 dark:text-indigo-300 border-l-4 border-indigo-600 pl-3">
                                {sec.heading}
                              </h4>
                              <div className="space-y-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                {sec.body.map((para, pIdx) => (
                                  <p key={pIdx}>{para}</p>
                                ))}
                              </div>
                              {sec.codeOrFormulaBlock && (
                                <pre className="rounded-xl bg-slate-950 text-emerald-400 p-4 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                                  {sec.codeOrFormulaBlock}
                                </pre>
                              )}
                              {sec.tableData && (
                                <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                                  <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                      <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                                        {sec.tableData.headers.map((h, hIdx) => (
                                          <th
                                            key={hIdx}
                                            className="p-2.5 font-bold border-b border-zinc-200 dark:border-zinc-700"
                                          >
                                            {h}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                      {sec.tableData.rows.map((row, rIdx) => (
                                        <tr key={rIdx}>
                                          {row.map((cell, cIdx) => (
                                            <td
                                              key={cIdx}
                                              className="p-2.5 text-zinc-700 dark:text-zinc-300"
                                            >
                                              {cell}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                              {sec.calloutTitle && sec.calloutBody && (
                                <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 p-4 text-xs">
                                  <p className="font-black text-amber-900 dark:text-amber-300 uppercase">
                                    📌 {sec.calloutTitle}
                                  </p>
                                  <p className="text-amber-950 dark:text-amber-200 mt-1">
                                    {sec.calloutBody}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}

                          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                            <button
                              type="button"
                              disabled={page.pageNumber <= 1}
                              onClick={() => {
                                setWhitePaperViewAll(false)
                                setActiveWhitePaperPage(Math.max(1, page.pageNumber - 1))
                              }}
                              className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-bold disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                              <span>Previous Page</span>
                            </button>
                            <span className="text-xs font-mono text-zinc-500">
                              Page {page.pageNumber} of 10
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (page.pageNumber < 10) {
                                  setWhitePaperViewAll(false)
                                  setActiveWhitePaperPage(page.pageNumber + 1)
                                } else {
                                  setActiveModalTab("slides")
                                }
                              }}
                              className="rounded-lg bg-[#0A66C2] hover:bg-[#084e96] px-3.5 py-1.5 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                            >
                              <span>
                                {page.pageNumber < 10
                                  ? `Next Page (Pg ${page.pageNumber + 1})`
                                  : "Open 10-Slide Presentation Deck →"}
                              </span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* TAB 2: HD VIDEO MASTERCLASS PLAYER & TIMESTAMPED CHAPTERS       */}
              {/* =============================================================== */}
              {activeModalTab === "video" && (
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-4">
                      <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-black aspect-video relative shadow-xl">
                        {!useMp4Fallback ? (
                          <iframe
                            key={`${activeDossier.youtubeId}-${activeVideoChapter}`}
                            src={`https://www.youtube.com/embed/${activeDossier.youtubeId}?autoplay=1&rel=0`}
                            title={activeDossier.course.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={activeDossier.fallbackMp4Url}
                            poster={activeDossier.course.customCoverArt}
                            controls
                            autoPlay
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase text-indigo-600">
                            Active Chapter {activeVideoChapter} of {activeDossier.videoChapters.length}
                          </span>
                          <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                            {activeDossier.videoChapters[activeVideoChapter - 1]?.title}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUseMp4Fallback(!useMp4Fallback)}
                          className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                        >
                          {useMp4Fallback
                            ? "Switch to YouTube Masterclass Stream"
                            : "Switch to Native HTML5 MP4 Stream"}
                        </button>
                      </div>
                    </div>

                    {/* Right Column: 5 Interactive Video Chapters */}
                    <div className="lg:col-span-4 space-y-3">
                      <h4 className="font-black text-sm uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                        🎬 Course Video Chapters ({activeDossier.course.duration})
                      </h4>
                      <div className="space-y-2">
                        {activeDossier.videoChapters.map((ch) => {
                          const isCurrent = activeVideoChapter === ch.chapterNumber
                          return (
                            <button
                              key={ch.chapterNumber}
                              type="button"
                              onClick={() => setActiveVideoChapter(ch.chapterNumber)}
                              className={`w-full text-left rounded-xl p-3.5 border transition-all cursor-pointer ${
                                isCurrent
                                  ? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs"
                                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400"
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                <span>
                                  CHAPTER {ch.chapterNumber} · {ch.timestamp}
                                </span>
                                <span>{ch.duration}</span>
                              </div>
                              <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 mt-1">
                                {ch.title}
                              </p>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                                {ch.summary}
                              </p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* TAB 3: 10-SLIDE INTERACTIVE TRAINING PRESENTATION DECK          */}
              {/* =============================================================== */}
              {activeModalTab === "slides" && (
                <div className="p-4 sm:p-6 space-y-6">
                  {(() => {
                    const currentSlide =
                      activeDossier.slides[activeSlideIndex] || activeDossier.slides[0]
                    if (!currentSlide) return null
                    return (
                      <div className="space-y-5">
                        {/* Slide Stage Canvas */}
                        <div className="rounded-3xl border-2 border-indigo-500/40 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white overflow-hidden shadow-2xl">
                          <div className="grid grid-cols-1 lg:grid-cols-12">
                            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                              <div className="space-y-3">
                                <span className="rounded-full bg-amber-400 text-slate-950 px-3 py-0.5 text-[10px] font-mono font-black">
                                  {currentSlide.badge}
                                </span>
                                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                                  {currentSlide.title}
                                </h3>
                                <p className="text-xs text-indigo-200">{currentSlide.subtitle}</p>

                                <ul className="space-y-2.5 pt-2">
                                  {currentSlide.bullets.map((b, bIdx) => (
                                    <li
                                      key={bIdx}
                                      className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-200 leading-relaxed"
                                    >
                                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                      <span>{b}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="rounded-xl bg-black/60 border border-white/15 p-3.5 text-xs text-amber-200">
                                <strong className="uppercase text-[10px] text-amber-400 block mb-0.5">
                                  🎙️ Instructor Speaker Notes:
                                </strong>
                                {currentSlide.speakerNotes}
                              </div>
                            </div>

                            {/* Slide Visual & Code Architecture Panel */}
                            <div className="lg:col-span-5 bg-black/50 p-6 flex flex-col justify-between space-y-4 border-t lg:border-t-0 lg:border-l border-white/10">
                              <div className="rounded-xl overflow-hidden border border-white/15 h-48 relative">
                                <img
                                  src={currentSlide.coverImage}
                                  alt={currentSlide.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                                  ConnectLn Studies Visual Plate #{currentSlide.slideNumber}
                                </div>
                              </div>

                              <pre className="rounded-xl bg-slate-950 text-emerald-400 p-3.5 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed flex-1">
                                {currentSlide.codeOrDiagram}
                              </pre>
                            </div>
                          </div>

                          {/* Slide Deck Navigation Bar */}
                          <div className="bg-black/80 px-6 py-3.5 border-t border-white/15 flex items-center justify-between gap-3">
                            <button
                              type="button"
                              disabled={activeSlideIndex <= 0}
                              onClick={() =>
                                setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))
                              }
                              className="rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              <span>Previous Slide</span>
                            </button>

                            <div className="flex items-center gap-1.5 overflow-x-auto">
                              {activeDossier.slides.map((s, idx) => (
                                <button
                                  key={s.slideNumber}
                                  type="button"
                                  onClick={() => setActiveSlideIndex(idx)}
                                  className={`h-7 w-7 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                                    idx === activeSlideIndex
                                      ? "bg-amber-400 text-slate-950"
                                      : "bg-white/10 text-zinc-300 hover:bg-white/20"
                                  }`}
                                >
                                  {s.slideNumber}
                                </button>
                              ))}
                            </div>

                            <button
                              type="button"
                              disabled={activeSlideIndex >= activeDossier.slides.length - 1}
                              onClick={() =>
                                setActiveSlideIndex(
                                  Math.min(activeDossier.slides.length - 1, activeSlideIndex + 1)
                                )
                              }
                              className="rounded-xl bg-[#0A66C2] hover:bg-[#084e96] disabled:opacity-40 px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Next Slide</span>
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* =============================================================== */}
              {/* TAB 4: VISUAL GALLERY & LEGITIMATE CERTIFICATION/PRIMARY SOURCES*/}
              {/* =============================================================== */}
              {activeModalTab === "sources" && (
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                      🖼️ High-Resolution Architecture &amp; Training Visual Plates
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeDossier.visualPlates.map((plate) => (
                        <div
                          key={plate.id}
                          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs"
                        >
                          <img
                            src={plate.imageUrl}
                            alt={plate.title}
                            className="h-48 w-full object-cover"
                          />
                          <div className="p-4 space-y-1">
                            <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
                              {plate.standardTag}
                            </span>
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                              {plate.title}
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {plate.caption}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verified Legitimate Primary Sources & Certification Portals */}
                  <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400">
                        Verified Primary Standards &amp; Official Certification Authorities
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                        🔗 Direct Links to Legitimate Certification Sources, Study Guides &amp; RFCs
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeDossier.legitimateSources.map((src, idx) => (
                        <a
                          key={idx}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex items-start justify-between gap-3 hover:border-emerald-500 hover:shadow-md transition-all"
                        >
                          <div className="space-y-1">
                            <span className="rounded bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                              {src.type}
                            </span>
                            <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                              {src.title}
                            </h4>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {src.organization}
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-emerald-600 shrink-0 mt-1" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
