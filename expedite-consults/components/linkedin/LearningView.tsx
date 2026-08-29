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
  Cpu,
  FlaskConical,
  Compass,
  FileCheck2,
  Terminal,
  Zap,
  ShoppingBag,
  ArrowRight,
  Shield,
  Play,
  CheckSquare,
  BadgeCheck,
  ChevronRight
} from "lucide-react"
import {
  LearningCourse,
  InteractiveLab,
  CertificationTrack,
  CareerLearningPath,
  LEARNING_COURSES_DATA,
  INTERACTIVE_LABS_DATA,
  CERTIFICATION_TRACKS_DATA,
  CLOUD_SECURITY_LEARNING_PATH
} from "@/lib/learning-platform-data"
import { UserProfile } from "@/lib/linkedin-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface LearningViewProps {
  user: UserProfile
  onAddCertificateToProfile?: (certificateName: string) => void
  onNavigateMarketplace?: () => void
}

export function LearningView({
  user,
  onAddCertificateToProfile,
  onNavigateMarketplace
}: LearningViewProps) {
  // Master Mode: Courses vs Labs vs Certifications vs Learning Paths
  const [learningMode, setLearningMode] = useState<'courses' | 'labs' | 'certifications' | 'paths'>('paths')

  // Course & Labs State
  const [courses, setCourses] = useState<LearningCourse[]>(LEARNING_COURSES_DATA)
  const [selectedCourseCat, setSelectedCourseCat] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCourse, setSelectedCourse] = useState<LearningCourse | null>(null)

  // Interactive Lab Modal State
  const [activeLab, setActiveLab] = useState<InteractiveLab | null>(null)
  const [isTerminalRunning, setIsTerminalRunning] = useState(false)

  // Practice Exam Modal State
  const [activeCertTrack, setActiveCertTrack] = useState<CertificationTrack | null>(null)
  const [practiceExamScore, setPracticeExamScore] = useState<number | null>(null)

  // Certificates Earned
  const [earnedCertificates, setEarnedCertificates] = useState<string[]>([])

  // Filter Courses
  const filteredCourses = courses.filter(c => {
    const matchCat = selectedCourseCat === 'All' || c.category === selectedCourseCat
    const matchSearch = !searchQuery || (
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return matchCat && matchSearch
  })

  const handleEnrollCourse = (courseId: string) => {
    setCourses(prev =>
      prev.map(c => (c.id === courseId ? { ...c, isEnrolled: true, progressPercent: 10 } : c))
    )
  }

  const handleClaimCertificate = (courseName: string) => {
    setEarnedCertificates(prev => [...prev, courseName])
    if (onAddCertificateToProfile) {
      onAddCertificateToProfile(courseName)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      {/* 1. TOP LEARNING HERO BANNER */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-indigo-500/20 px-3 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-400/40 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-amber-300" />
                ConnectIn Enterprise Learning & Skills Engine
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                Courses · Interactive Labs · Certifications · Career Paths
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Hands-On Technical Mastery & Career Blueprints
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Upskill through multi-stage learning paths, live ephemeral cloud & pentesting sandboxes, practice exams for CISSP and AWS Security, and direct connections to marketplace tools.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl bg-black/40 border border-white/15 p-4 text-center min-w-[170px]">
              <span className="text-[10px] uppercase font-mono text-indigo-300">Your Learning Progress</span>
              <p className="text-2xl font-black text-amber-300">65% Completed</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Cloud Security Engineer Path</p>
            </div>
          </div>
        </div>

        {/* 4 Master Modes Switcher */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setLearningMode('paths')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                learningMode === 'paths'
                  ? "bg-white text-zinc-950 shadow-md font-extrabold"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              <Compass className="h-3.5 w-3.5 text-indigo-600" />
              <span>🗺️ Career Learning Paths</span>
            </button>

            <button
              onClick={() => setLearningMode('courses')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                learningMode === 'courses'
                  ? "bg-white text-zinc-950 shadow-md font-extrabold"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 text-[#0A66C2]" />
              <span>🎓 Courses ({courses.length})</span>
            </button>

            <button
              onClick={() => setLearningMode('labs')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                learningMode === 'labs'
                  ? "bg-white text-zinc-950 shadow-md font-extrabold"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              <FlaskConical className="h-3.5 w-3.5 text-emerald-500" />
              <span>🧪 Interactive Labs ({INTERACTIVE_LABS_DATA.length})</span>
            </button>

            <button
              onClick={() => setLearningMode('certifications')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                learningMode === 'certifications'
                  ? "bg-white text-zinc-950 shadow-md font-extrabold"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              <Award className="h-3.5 w-3.5 text-amber-500" />
              <span>📜 Certifications & Exams ({CERTIFICATION_TRACKS_DATA.length})</span>
            </button>
          </div>
        </div>

        {/* 5 Course Categories Ribbon (Visible in Courses Mode) */}
        {learningMode === 'courses' && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 shrink-0 mr-1">
              Category:
            </span>
            {['All', 'Cybersecurity', 'AI', 'Cloud', 'Programming', 'Business'].map((cat) => {
              const isSelected = selectedCourseCat === cat
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCourseCat(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all shrink-0 ${
                    isSelected
                      ? "bg-indigo-400 text-zinc-950 font-bold shadow-xs"
                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: CAREER LEARNING PATHS (e.g. Become a Cloud Security Engineer) */}
      {/* ========================================================================= */}
      {learningMode === 'paths' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="rounded-full bg-indigo-500/30 px-3 py-0.5 text-xs font-bold text-indigo-200 border border-indigo-400/40">
                  Featured Career Path
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {CLOUD_SECURITY_LEARNING_PATH.title}
                </h2>
                <p className="text-xs sm:text-sm text-indigo-200">
                  Target Outcome: <strong>{CLOUD_SECURITY_LEARNING_PATH.targetRole}</strong> · Est. Time: <strong>{CLOUD_SECURITY_LEARNING_PATH.estimatedCompletion}</strong> · Pay Target: <strong>{CLOUD_SECURITY_LEARNING_PATH.salaryTarget}</strong>
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                  Step 3 of 9 In Progress
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl pt-1">
              {CLOUD_SECURITY_LEARNING_PATH.description}
            </p>
          </div>

          {/* 9-Step Roadmap Timeline */}
          <div className="space-y-4">
            <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-600" />
              <span>Multi-Stage Curriculum Roadmap (9 Milestone Steps)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CLOUD_SECURITY_LEARNING_PATH.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className={`rounded-2xl border p-5 flex flex-col justify-between space-y-3 transition-all ${
                    step.status === 'Completed'
                      ? "border-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/10 dark:border-emerald-900"
                      : step.status === 'In Progress'
                      ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 dark:border-indigo-800 shadow-md ring-2 ring-indigo-500/20"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        Step {step.stepNumber} · {step.duration}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          step.status === 'Completed'
                            ? "text-emerald-600"
                            : step.status === 'In Progress'
                            ? "text-indigo-600 animate-pulse"
                            : "text-zinc-400"
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {step.title}
                    </h4>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {step.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Connected Marketplace Tool in Roadmap Step */}
                  {step.recommendedTool && (
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 truncate">
                        {step.recommendedTool.icon} {step.recommendedTool.name}
                      </span>
                      <button
                        onClick={onNavigateMarketplace}
                        className="text-[10px] font-bold text-[#0A66C2] hover:underline shrink-0"
                      >
                        {step.recommendedTool.actionText} →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Connected Marketplace Banner at End of Learning Path */}
          <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-amber-300" />
              <h3 className="text-base sm:text-lg font-black text-white">
                Recommended Enterprise Tools Used in this Learning Path
              </h3>
            </div>
            <p className="text-xs text-purple-200">
              Accelerate your practical mastery with the exact offensive and zero-trust software suites utilized in the curriculum.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {CLOUD_SECURITY_LEARNING_PATH.recommendedMarketplaceTools.map((tool) => (
                <div
                  key={tool.id}
                  className="rounded-xl bg-black/40 border border-white/15 p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{tool.icon}</span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white">{tool.name}</h4>
                      <p className="text-[11px] text-zinc-300 line-clamp-1">{tool.tagline}</p>
                      <span className="text-xs font-black text-emerald-400">{tool.price}</span>
                    </div>
                  </div>

                  <button
                    onClick={onNavigateMarketplace}
                    className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shrink-0"
                  >
                    {tool.actionText}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: COURSES CATALOG (Cybersecurity, AI, Cloud, Programming, Business) */}
      {/* ========================================================================= */}
      {learningMode === 'courses' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between gap-3">
            <div className="relative flex-1 flex items-center rounded-lg bg-zinc-50 px-3 py-2 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800/80">
              <Search className="h-4 w-4 text-zinc-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search zero trust, prompt injection, Rust microVMs, CISO governance..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100"
              />
            </div>
            <span className="text-xs text-zinc-500 font-semibold shrink-0">
              {filteredCourses.length} courses
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="rounded-2xl border border-zinc-200 bg-white shadow-xs hover:border-indigo-500 hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                    <img src={course.coverImage} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                    <div className="absolute top-3 left-3 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white border border-white/20">
                      {course.category}
                    </div>
                    <div className="absolute bottom-3 right-3 rounded-full bg-indigo-950/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/40">
                      {course.provider}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-500">{course.duration}</span>
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-500" />
                        {course.rating} ({course.reviewsCount})
                      </span>
                    </div>

                    <h3
                      onClick={() => setSelectedCourse(course)}
                      className="font-black text-base text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] cursor-pointer leading-snug"
                    >
                      {course.title}
                    </h3>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {course.summary}
                    </p>

                    {/* Instructor */}
                    <div className="flex items-center gap-2 text-xs pt-1">
                      <img src={course.instructor.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">{course.instructor.name}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-600">
                    {course.hasCertificate ? "Verified Certificate ✓" : "Self-Paced"}
                  </span>

                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="rounded-full bg-[#0A66C2] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#004182]"
                  >
                    View Syllabus & Tools →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: INTERACTIVE LABS & SANDBOX ENVIRONMENTS */}
      {/* ========================================================================= */}
      {learningMode === 'labs' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-emerald-950 to-indigo-950 p-6 text-white shadow-xl space-y-2">
            <span className="rounded-full bg-emerald-500/30 px-3 py-0.5 text-xs font-bold text-emerald-200 border border-emerald-400/40">
              Ephemeral Sandboxes & Attack Enclaves
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Hands-On Technical Labs (Cloud, Pentesting, Malware, Secure Coding)
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
              Launch pre-configured AWS MicroVMs, Kali Linux offensive clusters, and live IDE terminals to execute realistic breach attacks and defense mitigations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {INTERACTIVE_LABS_DATA.map((lab) => (
              <div
                key={lab.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-emerald-500 hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                      {lab.category}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">{lab.estimatedDuration}</span>
                  </div>

                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 leading-snug">
                    {lab.title}
                  </h3>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {lab.summary}
                  </p>

                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-zinc-700 dark:text-zinc-300">Learning Objectives:</p>
                    <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                      {lab.learningObjectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400">{lab.environment}</span>
                  <button
                    onClick={() => {
                      setActiveLab(lab)
                      setIsTerminalRunning(true)
                    }}
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs flex items-center gap-1.5"
                  >
                    <Play className="h-3 w-3 fill-white" />
                    <span>Launch Sandbox</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 4: CERTIFICATIONS & PRACTICE EXAM ENGINE */}
      {/* ========================================================================= */}
      {learningMode === 'certifications' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-950 to-indigo-950 p-6 text-white shadow-xl space-y-2">
            <span className="rounded-full bg-amber-500/30 px-3 py-0.5 text-xs font-bold text-amber-200 border border-amber-400/40">
              Industry Credentials & Practice Exams
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Certification Preparation & Interactive Practice Exam Hub
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 max-w-2xl leading-relaxed">
              Prepare for CISSP, AWS Certified Security, and OSCP with timed practice simulations, domain weighting breakdowns, and official certification add-ons to your ConnectIn profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CERTIFICATION_TRACKS_DATA.map((cert) => (
              <div
                key={cert.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-amber-500 hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{cert.badgeIcon}</span>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 leading-snug">
                        {cert.name}
                      </h3>
                      <span className="text-[11px] text-zinc-400 font-mono">{cert.examCode} · {cert.issuingBody}</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {cert.overview}
                  </p>

                  <div className="rounded-xl bg-amber-50/60 p-3 text-xs dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                    <p className="font-bold text-amber-900 dark:text-amber-300">Median Salary Unlock:</p>
                    <p className="text-base font-black text-amber-800 dark:text-amber-200">{cert.medianSalaryUnlock}</p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-zinc-700 dark:text-zinc-300">Exam Domains Weighting:</p>
                    {cert.domains.slice(0, 3).map((dom, i) => (
                      <div key={i} className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-400">
                        <span className="truncate">{dom.name}</span>
                        <strong className="ml-2 shrink-0">{dom.weight}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">{cert.questionsCount} Questions</span>
                  <button
                    onClick={() => {
                      setActiveCertTrack(cert)
                      setPracticeExamScore(null)
                    }}
                    className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs"
                  >
                    Start Practice Exam
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COURSE SYLLABUS & CONNECTED MARKETPLACE TOOLS MODAL */}
      <Dialog
        open={!!selectedCourse}
        onOpenChange={(open) => {
          if (!open) setSelectedCourse(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCourse && (
            <div className="space-y-5">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    {selectedCourse.category}
                  </span>
                  <span className="text-xs text-zinc-400">{selectedCourse.duration}</span>
                </div>
                <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedCourse.title}
                </DialogTitle>
              </DialogHeader>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {selectedCourse.summary}
              </p>

              {/* Modules List */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Curriculum Modules:</h4>
                <div className="space-y-1">
                  {selectedCourse.curriculumModules.map((mod, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{mod}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Marketplace Tools Box */}
              <div className="rounded-xl border border-purple-300 bg-purple-50/50 p-4 dark:bg-purple-950/30 dark:border-purple-900 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4 text-purple-600" />
                  Recommended Marketplace Tools Used in This Course:
                </h4>
                {selectedCourse.recommendedMarketplaceTools.map((tool) => (
                  <div key={tool.id} className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-purple-200 dark:border-purple-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{tool.icon}</span>
                      <div>
                        <p className="font-bold">{tool.name}</p>
                        <p className="text-[10px] text-zinc-500">{tool.tagline}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCourse(null)
                        if (onNavigateMarketplace) onNavigateMarketplace()
                      }}
                      className="rounded-md bg-purple-600 px-3 py-1 text-white font-bold hover:bg-purple-700 text-[11px]"
                    >
                      {tool.actionText}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => handleClaimCertificate(selectedCourse.title)}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Claim & Add Certificate to Profile ✓
                </button>

                <button
                  onClick={() => setSelectedCourse(null)}
                  className="rounded-full bg-zinc-200 px-4 py-2 text-xs font-bold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* LIVE INTERACTIVE LAB TERMINAL MODAL */}
      <Dialog
        open={!!activeLab}
        onOpenChange={(open) => {
          if (!open) setActiveLab(null)
        }}
      >
        <DialogContent className="max-w-2xl">
          {activeLab && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                  <Terminal className="h-4 w-4" />
                  <span>Live Sandbox Environment: {activeLab.environment}</span>
                </div>
                <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {activeLab.title}
                </DialogTitle>
              </DialogHeader>

              {/* Terminal Box */}
              <div className="rounded-xl border border-zinc-800 bg-black p-4 font-mono text-xs text-emerald-400 space-y-2">
                <p className="text-zinc-500"># Initializing ephemeral sandbox cluster (Session ID: SBX-9942)...</p>
                <p className="text-zinc-500"># Attached interface: eth0 (10.244.0.12/24)</p>
                <p className="text-white">$ kubectl get pods -n kube-system -l k8s-app=cilium</p>
                <p className="text-emerald-400">cilium-operator-7f6d4d-k92lx   1/1   Running   0   12s</p>
                <p className="text-emerald-400">cilium-mesh-node-agent-p89xc    1/1   Running   0   12s</p>
                <p className="text-white">$ npx @expedite/strike-cli audit --target=k8s.internal</p>
                <p className="text-amber-400">⚡ Attack Chain Simulated: Lateral pod traversal blocked by mTLS rule #14.</p>
                <p className="text-emerald-400">✓ Lab Objective 1 &amp; 2 Complete!</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-xs text-emerald-600 font-bold">✓ Sandbox Session Active</span>
                <button
                  onClick={() => setActiveLab(null)}
                  className="rounded-full bg-[#0A66C2] px-5 py-1.5 text-xs font-bold text-white"
                >
                  Complete Lab Session
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PRACTICE EXAM MODAL */}
      <Dialog
        open={!!activeCertTrack}
        onOpenChange={(open) => {
          if (!open) setActiveCertTrack(null)
        }}
      >
        <DialogContent className="max-w-md">
          {activeCertTrack && (
            <div className="space-y-4 pt-1">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  <span>{activeCertTrack.name}</span>
                </DialogTitle>
              </DialogHeader>

              {practiceExamScore !== null ? (
                <div className="py-6 text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-7 w-7" />
                  </div>
                  <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                    Practice Exam Score: {practiceExamScore}%
                  </h4>
                  <p className="text-xs text-emerald-600 font-bold">
                    🎉 PASSED! (Passing Threshold: {activeCertTrack.passingScore})
                  </p>
                  <p className="text-xs text-zinc-500">
                    Ready to take the official exam code {activeCertTrack.examCode}.
                  </p>
                  <button
                    onClick={() => setActiveCertTrack(null)}
                    className="rounded-full bg-[#0A66C2] px-5 py-2 text-xs font-bold text-white"
                  >
                    Done & Return
                  </button>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800 space-y-1">
                    <p><strong>Exam Code:</strong> {activeCertTrack.examCode}</p>
                    <p><strong>Simulated Questions:</strong> 25 Quick Review Questions</p>
                    <p><strong>Passing Benchmark:</strong> {activeCertTrack.passingScore}</p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <p className="font-bold">Sample Question 1 of 25:</p>
                    <p className="text-zinc-600 dark:text-zinc-300">
                      When implementing zero trust network architecture under NIST SP 800-207, which component is strictly responsible for granting or denying access to a resource?
                    </p>
                    <div className="space-y-1.5 pt-1">
                      <button
                        onClick={() => setPracticeExamScore(92)}
                        className="w-full text-left p-2 rounded-lg border border-zinc-200 hover:border-amber-500 hover:bg-amber-50/40 dark:border-zinc-700"
                      >
                        A) Policy Decision Point (PDP) via Policy Engine &amp; Policy Administrator
                      </button>
                      <button
                        onClick={() => setPracticeExamScore(68)}
                        className="w-full text-left p-2 rounded-lg border border-zinc-200 hover:border-amber-500 hover:bg-amber-50/40 dark:border-zinc-700"
                      >
                        B) State-level Network Edge Firewall
                      </button>
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
