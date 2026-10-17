"use client"

import React, { useState, useEffect } from "react"
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
  CLOUD_SECURITY_LEARNING_PATH,
  getEnclaveLearningPath,
  getEnclaveLearningCourses,
  getEnclaveInteractiveLabs,
  getEnclaveCertificationTracks
} from "@/lib/learning-platform-data"
import { UserProfile } from "@/lib/linkedin-data"
import { ConnectInVideoWheel } from "@/components/linkedin/ConnectInVideoWheel"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface LearningViewProps {
  user: UserProfile
  onAddCertificateToProfile?: (certificate: any) => void
  onNavigateMarketplace?: () => void
}

export function LearningView({
  user,
  onAddCertificateToProfile,
  onNavigateMarketplace
}: LearningViewProps) {
  // Master Mode: Courses vs Labs vs Certifications vs Learning Paths
  const [learningMode, setLearningMode] = useState<'courses' | 'labs' | 'certifications' | 'paths'>('paths')

  const learningPath = getEnclaveLearningPath(user.professionEnclave)
  const enclaveLabs = getEnclaveInteractiveLabs(user.professionEnclave)
  const enclaveCertTracks = getEnclaveCertificationTracks(user.professionEnclave)

  // Course & Labs State
  const [courses, setCourses] = useState<LearningCourse[]>(getEnclaveLearningCourses(user.professionEnclave))
  const [selectedCourseCat, setSelectedCourseCat] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCourse, setSelectedCourse] = useState<LearningCourse | null>(null)

  useEffect(() => {
    setCourses(getEnclaveLearningCourses(user.professionEnclave))
  }, [user.professionEnclave])

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

  // Ecosystem Live Learning & Practice Platforms for Current Enclave
  const getEcosystemLivePlatforms = () => {
    switch (user.professionEnclave) {
      case 'trades_construction':
        return [
          {
            title: "SkillHands Vocational Trades",
            desc: "Apprenticeship modules, carpentry masterclasses & craftsman credentials",
            url: "https://skillhands-client.vercel.app",
            badge: "LIVE TRADES PLATFORM",
          },
          {
            title: "DeskNote Field Journal",
            desc: "Jobsite timber logs, blueprint takeoffs & cut-list calculations",
            url: "https://desk-note-kwesi-asiedus-projects.vercel.app",
            badge: "LIVE FIELD NOTEBOOK",
          },
          {
            title: "VibeTok Trades Hub",
            desc: "Bite-sized joinery videos, framing demos & tool restoration streams",
            url: "https://vibetok-learning-hub.vercel.app",
            badge: "LIVE VIDEO MASTERCLASSES",
          }
        ]
      case 'automotive_mechanics':
        return [
          {
            title: "DeskNote Diagnostic Bay",
            desc: "Field oscilloscope records, CAN-FD captures & repair logs",
            url: "https://desk-note-kwesi-asiedus-projects.vercel.app",
            badge: "LIVE DIAGNOSTICS",
          },
          {
            title: "SkillHands Automotive",
            desc: "ASE diagnostic training, EV isolation procedures & engine repair",
            url: "https://skillhands-client.vercel.app",
            badge: "LIVE VOCATIONAL",
          },
          {
            title: "VibeTok Waveform Academy",
            desc: "Bite-sized oscilloscope masterclasses & diagnostic walkthroughs",
            url: "https://vibetok-learning-hub.vercel.app",
            badge: "LIVE VIDEO MASTERCLASSES",
          }
        ]
      case 'healthcare_medicine':
        return [
          {
            title: "CareerOrbit Skill Passport",
            desc: "Physician & nursing CME tracking, fellowship credentials & AI resume",
            url: "https://careerorbit-standalone.vercel.app",
            badge: "LIVE CME PASSPORT",
          },
          {
            title: "VibeTok Grand Rounds",
            desc: "Surgical video masterclasses, emergency procedures & clinical briefs",
            url: "https://vibetok-learning-hub.vercel.app",
            badge: "LIVE CLINICAL HUB",
          }
        ]
      case 'tech_software':
        return [
          {
            title: "05-SAST Static Code Analyzer",
            desc: "Live AST vulnerability scanning & automated GitHub PR remediation",
            url: "https://05-sast-platform.vercel.app",
            badge: "LIVE SAST ENGINE",
          },
          {
            title: "CareerOrbit Skill Navigator",
            desc: "AI technical skills passport, Git contributions & career benchmarking",
            url: "https://careerorbit-standalone.vercel.app",
            badge: "LIVE SKILLS PASSPORT",
          },
          {
            title: "18-Unified Integration Bus",
            desc: "API gateways, event-driven webhooks & enterprise microservices",
            url: "https://18-unified-integration-layer.vercel.app",
            badge: "LIVE INTEGRATION BUS",
          }
        ]
      case 'law_gov_defense':
        return [
          {
            title: "Aegis RMF Continuous ATO",
            desc: "NIST SP 800-53 OSCAL machine-readable compliance & POAM engine",
            url: "https://aegis-rmf.vercel.app",
            badge: "LIVE cATO PLATFORM",
          },
          {
            title: "15-Threat Modeling Suite",
            desc: "STRIDE automated threat vectors, DFD graphs & mitigation catalog",
            url: "https://15-threat-modeling-platform.vercel.app",
            badge: "LIVE THREAT SUITE",
          },
          {
            title: "CareerOrbit DoD 8140 Hub",
            desc: "Defense credential verification, TS/SCI mapping & career paths",
            url: "https://careerorbit-standalone.vercel.app",
            badge: "LIVE CLEARANCE HUB",
          }
        ]
      case 'campus_students':
        return [
          {
            title: "Salisbury Campus OS",
            desc: "University academic planner, class rosters & campus events",
            url: "https://20-salisbury-campus-kwesi-asiedus-projects.vercel.app",
            badge: "LIVE CAMPUS OS",
          },
          {
            title: "TU Housing Portal",
            desc: "Off-campus & dorm room placement, roommate matching & leases",
            url: "https://tuhousing.vercel.app",
            badge: "LIVE HOUSING",
          },
          {
            title: "CareerOrbit Student Navigator",
            desc: "Entry-level tech internships, verified academic projects & portfolios",
            url: "https://careerorbit-standalone.vercel.app",
            badge: "LIVE STUDENT PASSPORT",
          }
        ]
      case 'tech_cybersecurity':
      default:
        return [
          {
            title: "11-DAST Dynamic Pentest Sandbox",
            desc: "Dynamic application penetration testing, OWASP Top 10 fuzzing engine",
            url: "https://11-dast-security-platform.vercel.app",
            badge: "LIVE PENTEST PLATFORM",
          },
          {
            title: "16-Malware Analysis Hypervisor",
            desc: "Safe binary detonation sandbox, API hook monitoring & memory dump analysis",
            url: "https://16-malware-analysis-platform.vercel.app",
            badge: "LIVE DETONATION LAB",
          },
          {
            title: "CareerOrbit Cyber Passport",
            desc: "CISSP, OSCP & CEH credential mapping, offensive skills benchmarking",
            url: "https://careerorbit-standalone.vercel.app",
            badge: "LIVE CAREER NAVIGATOR",
          }
        ]
    }
  }

  const liveEcosystemPlatforms = getEcosystemLivePlatforms()

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
              Upskill through multi-stage learning paths, live ephemeral sandboxes, practice exams, and direct connections to professional ecosystem tools.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl bg-black/40 border border-white/15 p-4 text-center min-w-[170px]">
              <span className="text-[10px] uppercase font-mono text-indigo-300">Your Learning Progress</span>
              <p className="text-2xl font-black text-amber-300">65% Completed</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Enclave Specialist Track</p>
            </div>
          </div>
        </div>

        {/* Live Ecosystem External Learning Platforms */}
        {liveEcosystemPlatforms.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  Connected Live Ecosystem Platforms
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">1-Click External Launch ↗</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {liveEcosystemPlatforms.map((plat, idx) => (
                <a
                  key={idx}
                  href={plat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl bg-black/40 hover:bg-black/60 border border-white/15 hover:border-white/30 p-3 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-amber-300 border border-indigo-400/30">
                        {plat.badge}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {plat.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                      {plat.desc}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400 group-hover:text-zinc-200">
                    <span className="font-mono truncate">{new URL(plat.url).hostname}</span>
                    <span className="font-bold text-amber-300 group-hover:underline">Launch →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 4 Master Modes Switcher */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
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
              <span>🧪 Interactive Labs ({enclaveLabs.length})</span>
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
              <span>📜 Certifications & Exams ({enclaveCertTracks.length})</span>
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

      {/* Expedite Consults Educational Video Talk Wheel */}
      <ConnectInVideoWheel
        activeEnclaveId={user?.professionEnclave}
        user={user}
        title="The Wheel — Multi-Profession Masterclasses & Briefings"
        subtitle="Curated trade apprenticeships, software architecture, healthcare, and verified field briefings across all disciplines."
      />

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
                  {learningPath.title}
                </h2>
                <p className="text-xs sm:text-sm text-indigo-200">
                  Target Outcome: <strong>{learningPath.targetRole}</strong> · Est. Time: <strong>{learningPath.estimatedCompletion}</strong> · Pay Target: <strong>{learningPath.salaryTarget}</strong>
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                  Step 3 of {learningPath.steps.length} In Progress
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl pt-1">
              {learningPath.description}
            </p>
          </div>

          {/* 9-Step Roadmap Timeline */}
          <div className="space-y-4">
            <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-600" />
              <span>Multi-Stage Curriculum Roadmap ({learningPath.steps.length} Milestone Steps)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {learningPath.steps.map((step) => (
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
                Recommended Professional Tools Used in this Learning Path
              </h3>
            </div>
            <p className="text-xs text-purple-200">
              Accelerate your practical mastery with the specialized tools, hardware and software utilized in the curriculum.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {learningPath.recommendedMarketplaceTools.map((tool) => (
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
                placeholder={
                  user.professionEnclave === 'trades_construction'
                    ? "Search timber framing, mortise and tenon, OSHA 30, CAD takeoffs..."
                    : user.professionEnclave === 'healthcare_medicine'
                    ? "Search trauma resuscitation, MTP protocols, ATLS, pelvic ORIF..."
                    : user.professionEnclave === 'automotive_mechanics'
                    ? "Search PicoScope CAN-FD waveforms, 800V EV, Cummins SCR..."
                    : "Search zero trust, prompt injection, Rust microVMs, CISO governance..."
                }
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
              Interactive Domain Sandboxes &amp; Simulators
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {user.professionEnclave === 'trades_construction'
                ? "Hands-On Craftsmanship & Joinery Simulators"
                : user.professionEnclave === 'healthcare_medicine'
                ? "Clinical Resuscitation & Surgical Navigation Simulators"
                : user.professionEnclave === 'automotive_mechanics'
                ? "PicoScope Oscilloscope & High-Voltage EV Diagnostic Bays"
                : "Hands-On Technical Labs (Cloud, Pentesting, Malware, Secure Coding)"}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
              {user.professionEnclave === 'trades_construction'
                ? "Launch interactive cut-list calculators, 3D compound miter solvers, and OSHA rigging load simulators."
                : user.professionEnclave === 'healthcare_medicine'
                ? "Execute simulated rapid blood infusions on the Belmont RI-2 and navigate interactive FAST bedside ultrasound cases."
                : user.professionEnclave === 'automotive_mechanics'
                ? "Analyze live 4-channel PicoScope CAN-FD waveforms and practice 800V EV battery pack lockout/tagout protocols."
                : "Launch pre-configured AWS MicroVMs, Kali Linux offensive clusters, and live IDE terminals to execute realistic breach attacks and defense mitigations."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {enclaveLabs.map((lab) => (
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

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[120px]">{lab.environment}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {lab.liveUrl && (
                      <button
                        onClick={() => window.open(lab.liveUrl, '_blank', 'noopener,noreferrer')}
                        className="rounded-full bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs flex items-center gap-1"
                        title={`Open live platform: ${lab.liveUrl}`}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Live Platform</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setActiveLab(lab)
                        setIsTerminalRunning(true)
                      }}
                      className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs flex items-center gap-1.5"
                    >
                      <Play className="h-3 w-3 fill-white" />
                      <span>Sandbox</span>
                    </button>
                  </div>
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
              Verified Industry Credentials &amp; Practice Exams
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {user.professionEnclave === 'trades_construction'
                ? "Master Carpenter Guild & OSHA 30 Exam Hub"
                : user.professionEnclave === 'healthcare_medicine'
                ? "Board Specialty & Critical Care Nursing Credential Hub"
                : user.professionEnclave === 'automotive_mechanics'
                ? "ASE World Class Master Technician Exam Hub"
                : "Certification Preparation & Interactive Practice Exam Hub"}
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 max-w-2xl leading-relaxed">
              {user.professionEnclave === 'trades_construction'
                ? "Prepare for Master Carpenter Guild and OSHA 30-Hour Construction Safety credentials with official practice exams and domain weightings."
                : user.professionEnclave === 'healthcare_medicine'
                ? "Prepare for ABOS Orthopedic Surgery, AACN CCRN, and ENA TNCC credentials with timed clinical practice simulations."
                : user.professionEnclave === 'automotive_mechanics'
                ? "Prepare for ASE Master Automobile Technician (A1–A8), L1 Advanced Engine, and L3 EV credentials with domain practice questions."
                : "Prepare for CISSP, AWS Certified Security, and OSCP with timed practice simulations, domain weighting breakdowns, and official certification add-ons to your ConnectIn profile."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {enclaveCertTracks.map((cert) => (
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
                <div className="flex items-center gap-2">
                  {activeLab.liveUrl && (
                    <button
                      onClick={() => window.open(activeLab.liveUrl, '_blank', 'noopener,noreferrer')}
                      className="rounded-full bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 shadow-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Open Deployed App ↗</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveLab(null)}
                    className="rounded-full bg-[#0A66C2] px-5 py-1.5 text-xs font-bold text-white hover:bg-[#084e96]"
                  >
                    Complete Lab Session
                  </button>
                </div>
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
