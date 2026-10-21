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
  ChevronRight,
  ChevronLeft,
  FileText,
  Download,
  Printer,
  Microscope
} from "lucide-react"
import {
  LearningCourse,
  InteractiveLab,
  CertificationTrack,
  CareerLearningPath,
  LearningPathStep,
  LEARNING_COURSES_DATA,
  INTERACTIVE_LABS_DATA,
  CERTIFICATION_TRACKS_DATA,
  CLOUD_SECURITY_LEARNING_PATH,
  getEnclaveLearningPath,
  getEnclaveLearningCourses,
  getEnclaveInteractiveLabs,
  getEnclaveCertificationTracks
} from "@/lib/learning-platform-data"
import {
  getRoadmapStepWhitePaper,
  RoadmapStepWhitePaper,
  SkillDeepDiveSpec
} from "@/lib/learning-roadmap-whitepapers"
import { UserProfile } from "@/lib/linkedin-data"
import { ConnectInVideoWheel } from "@/components/linkedin/ConnectInVideoWheel"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface VibetokProductionRoute {
  id: string
  label: string
  shortLabel: string
  badge: string
  url: string
  description: string
  icon: string
}

export const VIBETOK_PRODUCTION_ROUTES: VibetokProductionRoute[] = [
  {
    id: "hub_core",
    label: "Core Learning Hub",
    shortLabel: "🎓 Hub Core",
    badge: "CANONICAL",
    url: "https://vibetok-learning-hub.vercel.app",
    description: "22 spatial academies, 44 expert playlists & live interactive events",
    icon: "🎓",
  },
  {
    id: "reels_studio",
    label: "9:16 Reels Studio (HD)",
    shortLabel: "🎬 Reels Studio",
    badge: "VERTICAL VIDEO",
    url: "https://vibetok-learning-hub.vercel.app/reels",
    description: "Embedded HTML5 video player, sound scrub bar, loop & 1-click MP4 download",
    icon: "🎬",
  },
  {
    id: "mitre_attack",
    label: "MITRE ATT&CK Sandbox",
    shortLabel: "🛡️ MITRE ATT&CK",
    badge: "CYBER DEFENSE",
    url: "https://vibetok-learning-hub.vercel.app/platform/security_courses_player",
    description: "Hands-on browser terminal sandbox for cyber threat defense & attack vectors",
    icon: "🛡️",
  },
  {
    id: "genai_swarm",
    label: "Agentic Swarm & GenAI Flywheel",
    shortLabel: "🤖 GenAI Swarm",
    badge: "AI FLYWHEEL",
    url: "https://vibetok-learning-hub.vercel.app/platform/generative_ai_player",
    description: "Autonomous multi-agent swarm orchestration & generative intelligence flywheel",
    icon: "🤖",
  },
  {
    id: "whitepaper",
    label: "Doctoral Dissertation & White Paper",
    shortLabel: "📄 White Paper",
    badge: "DOCTORAL",
    url: "https://vibetok-learning-hub.vercel.app/#whitepaper",
    description: "Kwesi Asiedu's doctoral dissertation, peer citations & architecture white paper",
    icon: "📄",
  },
  {
    id: "social_inky",
    label: "VibeTok App (In-App Feed)",
    shortLabel: "📱 Social Feed",
    badge: "LIVE APP",
    url: "https://vibe-tok-inky.vercel.app/reels",
    description: "Mobile-first social feed, community comments & native in-app vertical reels",
    icon: "📱",
  },
]

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
  // Master Mode: Courses vs Labs vs Certifications vs Learning Paths vs VibeTOK Hub
  const [learningMode, setLearningMode] = useState<'courses' | 'labs' | 'certifications' | 'paths' | 'vibetok'>('paths')
  const [vibetokExpanded, setVibetokExpanded] = useState(false)
  const [vibetokKey, setVibetokKey] = useState(0)
  const [vibetokRoute, setVibetokRoute] = useState<string>("https://vibetok-learning-hub.vercel.app")

  const learningPath = getEnclaveLearningPath(user.professionEnclave)
  const enclaveLabs = getEnclaveInteractiveLabs(user.professionEnclave)
  const enclaveCertTracks = getEnclaveCertificationTracks(user.professionEnclave)

  // Course & Labs State
  const [courses, setCourses] = useState<LearningCourse[]>(getEnclaveLearningCourses(user.professionEnclave))
  const [selectedCourseCat, setSelectedCourseCat] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCourse, setSelectedCourse] = useState<LearningCourse | null>(null)

  // Interactive 10-Page White Paper & Step Detail Reader Modal State
  const [selectedStepNumber, setSelectedStepNumber] = useState<number | null>(null)
  const [activeWhitePaperPage, setActiveWhitePaperPage] = useState<number>(1)
  const [whitePaperViewAll, setWhitePaperViewAll] = useState<boolean>(false)
  const [highlightedSkillName, setHighlightedSkillName] = useState<string | null>(null)
  const [customStepStatuses, setCustomStepStatuses] = useState<Record<string, 'Completed' | 'In Progress' | 'Up Next'>>({})

  useEffect(() => {
    setCourses(getEnclaveLearningCourses(user.professionEnclave))
    setSelectedStepNumber(null)
    setHighlightedSkillName(null)
  }, [user.professionEnclave])

  const getStepEffectiveStatus = (step: LearningPathStep): 'Completed' | 'In Progress' | 'Up Next' => {
    const key = `${learningPath.id}:${step.stepNumber}`
    return customStepStatuses[key] || step.status
  }

  const handleCycleStepStatus = (step: LearningPathStep, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const key = `${learningPath.id}:${step.stepNumber}`
    const current = getStepEffectiveStatus(step)
    const next: 'Completed' | 'In Progress' | 'Up Next' =
      current === 'Completed' ? 'In Progress' : current === 'In Progress' ? 'Up Next' : 'Completed'
    setCustomStepStatuses(prev => ({ ...prev, [key]: next }))
  }

  const openStepWhitePaper = (stepNumber: number, focusSkill?: string) => {
    const targetStep = learningPath.steps.find(s => s.stepNumber === stepNumber)
    if (!targetStep) return
    const wp = getRoadmapStepWhitePaper(learningPath, targetStep)
    setSelectedStepNumber(stepNumber)
    if (focusSkill) {
      setHighlightedSkillName(focusSkill)
      const matchedSpec = wp.skillDeepDives.find(s => s.skillName === focusSkill)
      setActiveWhitePaperPage(matchedSpec ? matchedSpec.pageNumber : 3)
      setWhitePaperViewAll(false)
    } else {
      setHighlightedSkillName(wp.skillDeepDives[0]?.skillName || null)
      setActiveWhitePaperPage(1)
    }
  }

  const activeRoadmapStep =
    selectedStepNumber !== null
      ? learningPath.steps.find(s => s.stepNumber === selectedStepNumber) || null
      : null

  const activeStepWhitePaper: RoadmapStepWhitePaper | null =
    activeRoadmapStep ? getRoadmapStepWhitePaper(learningPath, activeRoadmapStep) : null

  const handleDownloadStepWhitePaper = (wp: RoadmapStepWhitePaper) => {
    const blob = new Blob([wp.fullMarkdown], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${wp.docId.toLowerCase()}-step-${wp.stepNumber}-10page-whitepaper.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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
            title: "VibeTok Dev & Cloud Academies",
            desc: "Fullstack system design, Next.js, microVM masterclasses & live workshops",
            url: "https://vibetok-learning-hub.vercel.app",
            badge: "LIVE ACADEMIES HUB",
          },
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
          }
        ]
      case 'law_gov_defense':
        return [
          {
            title: "VibeTok Defense & Gov Academies",
            desc: "cATO compliance video lectures, NIST SP 800-53 OSCAL & clearance guides",
            url: "https://vibetok-learning-hub.vercel.app",
            badge: "LIVE ACADEMIES HUB",
          },
          {
            title: "Aegis RMF Continuous ATO",
            desc: "NIST SP 800-53 OSCAL machine-readable compliance & POAM engine",
            url: "https://aegis-rmf.vercel.app",
            badge: "LIVE cATO PLATFORM",
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
            title: "VibeTok Campus & STEM Hub",
            desc: "Interactive student labs, CS foundational lectures & career workshops",
            url: "https://vibetok-learning-hub.vercel.app",
            badge: "LIVE ACADEMIES HUB",
          },
          {
            title: "Salisbury Campus OS",
            desc: "University academic planner, class rosters & campus events",
            url: "https://20-salisbury-campus-kwesi-asiedus-projects.vercel.app",
            badge: "LIVE CAMPUS OS",
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
            title: "VibeTok Cyber Labs & Academies",
            desc: "Red team teardowns, breach investigations & 118K learning assets",
            url: "https://vibetok-learning-hub.vercel.app",
            badge: "LIVE ACADEMIES HUB",
          },
          {
            title: "11-DAST Dynamic Pentest Sandbox",
            desc: "Dynamic application penetration testing, OWASP Top 10 fuzzing engine",
            url: "https://11-dast-security-platform.vercel.app",
            badge: "LIVE PENTEST PLATFORM",
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
      {/* 1. TOP LEARNING BANNER */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 text-zinc-900 dark:text-zinc-100 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-blue-50 dark:bg-blue-950/50 px-3 py-0.5 text-xs font-semibold text-[#0A66C2] dark:text-sky-300 border border-blue-200/60 dark:border-blue-800/60 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                ConnectIn Learning &amp; Masterclasses
              </span>
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                Courses · Labs · Certifications · Blueprints
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Professional Skills &amp; Career Blueprints
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Advance your career through structured learning paths, practical hands-on labs, practice tests, and industry-recognized certifications.
            </p>

            {/* Direct VibeTOK Learning Hub Integration Banner */}
            <div className="pt-2 flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setLearningMode('vibetok')}
                className="group inline-flex items-center gap-2 rounded-full bg-[#0A66C2] hover:bg-[#004182] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Explore VibeTOK Video Hub</span>
                <span className="rounded-full bg-white/20 px-2 py-0.2 text-[10px] font-mono">118,314 Assets</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href="https://vibetok-learning-hub.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="h-3 w-3 text-zinc-400" />
              </a>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 p-4 text-center min-w-[170px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">Learning Progress</span>
              <p className="text-2xl font-black text-[#0A66C2] dark:text-sky-400">65%</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Specialist Track Active</p>
            </div>
          </div>
        </div>

        {/* Live Ecosystem External Learning Platforms */}
        {liveEcosystemPlatforms.length > 0 && (
          <div className="mt-5 pt-3.5 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#0A66C2]" />
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 tracking-wide uppercase">
                  Connected Learning Academies
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
                  className="group rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 p-3 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="rounded bg-blue-100 dark:bg-blue-950/60 px-1.5 py-0.5 text-[9px] font-mono font-bold text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                        {plat.badge}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-zinc-400 group-hover:text-[#0A66C2] transition-colors" />
                    </div>
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] transition-colors line-clamp-1">
                      {plat.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                      {plat.desc}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-[10px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                    <span className="font-mono truncate">{new URL(plat.url).hostname}</span>
                    <span className="font-bold text-[#0A66C2] group-hover:underline">Launch →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Master Modes Switcher */}
        <div className="mt-5 pt-3.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setLearningMode('vibetok')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                learningMode === 'vibetok'
                  ? "bg-[#0A66C2] text-white font-semibold shadow-xs"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>VibeTOK Video Hub (118K+)</span>
            </button>
            <button
              type="button"
              onClick={() => setLearningMode('paths')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                learningMode === 'paths'
                  ? "bg-[#0A66C2] text-white font-semibold shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Learning Paths</span>
            </button>

            <button
              type="button"
              onClick={() => setLearningMode('courses')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                learningMode === 'courses'
                  ? "bg-[#0A66C2] text-white font-semibold shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Courses ({courses.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setLearningMode('labs')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                learningMode === 'labs'
                  ? "bg-[#0A66C2] text-white font-semibold shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70"
              }`}
            >
              <FlaskConical className="h-3.5 w-3.5" />
              <span>Interactive Labs ({enclaveLabs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setLearningMode('certifications')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                learningMode === 'certifications'
                  ? "bg-[#0A66C2] text-white font-semibold shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70"
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>Certifications ({enclaveCertTracks.length})</span>
            </button>
          </div>
        </div>

        {/* Course Categories Ribbon (Visible in Courses Mode) */}
        {learningMode === 'courses' && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 shrink-0 mr-1">
              Category:
            </span>
            {['All', 'Cybersecurity', 'AI', 'Cloud', 'Programming', 'Business'].map((cat) => {
              const isSelected = selectedCourseCat === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCourseCat(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-[#0A66C2] text-white font-semibold shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70"
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
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-500/30 px-3 py-0.5 text-xs font-bold text-indigo-200 border border-indigo-400/40">
                    Featured Career Path
                  </span>
                  <span className="rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/40">
                    📜 {learningPath.steps.length * 10} Pages of Peer-Reviewed White Papers Attached
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {learningPath.title}
                </h2>
                <p className="text-xs sm:text-sm text-indigo-200">
                  Target Outcome: <strong>{learningPath.targetRole}</strong> · Est. Time: <strong>{learningPath.estimatedCompletion}</strong> · Pay Target: <strong>{learningPath.salaryTarget}</strong>
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                  Step 3 of {learningPath.steps.length} In Progress
                </span>
                <button
                  type="button"
                  onClick={() => openStepWhitePaper(1)}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-3.5 py-2 text-xs font-black text-white shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Read Full 10-Page White Papers (Steps 1–{learningPath.steps.length}) →</span>
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl pt-1">
              {learningPath.description}
            </p>
          </div>

          {/* 9-Step Roadmap Timeline */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Compass className="h-5 w-5 text-indigo-600" />
                <span>Multi-Stage Curriculum Roadmap ({learningPath.steps.length} Milestone Steps)</span>
              </h3>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-full px-3 py-1">
                💡 Click any Step card or Skill tag (e.g. {learningPath.steps[0]?.skills[0]}) to read its 10-Page White Paper &amp; Technical Details
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {learningPath.steps.map((step) => {
                const effectiveStatus = getStepEffectiveStatus(step)
                return (
                  <div
                    key={step.stepNumber}
                    role="button"
                    tabIndex={0}
                    onClick={() => openStepWhitePaper(step.stepNumber)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        openStepWhitePaper(step.stepNumber)
                      }
                    }}
                    className={`group rounded-2xl border p-5 flex flex-col justify-between space-y-3 transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-lg ${
                      effectiveStatus === 'Completed'
                        ? "border-emerald-300 bg-emerald-50/30 hover:border-emerald-500 dark:bg-emerald-950/10 dark:border-emerald-900"
                        : effectiveStatus === 'In Progress'
                        ? "border-indigo-500 bg-indigo-50/40 hover:border-indigo-600 dark:bg-indigo-950/30 dark:border-indigo-800 shadow-md ring-2 ring-indigo-500/20"
                        : "border-zinc-200 bg-white hover:border-indigo-400 dark:border-zinc-800 dark:bg-zinc-900"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase rounded-full bg-zinc-100 px-2.5 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          Step {step.stepNumber} · {step.duration}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCycleStepStatus(step, e)}
                          title="Click to cycle milestone status (Completed / In Progress / Up Next)"
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                            effectiveStatus === 'Completed'
                              ? "text-emerald-700 bg-emerald-100/80 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800"
                              : effectiveStatus === 'In Progress'
                              ? "text-indigo-700 bg-indigo-100/80 border-indigo-300 animate-pulse dark:text-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-800"
                              : "text-zinc-500 bg-zinc-100 border-zinc-200 dark:text-zinc-400 dark:bg-zinc-800 dark:border-zinc-700"
                          }`}
                        >
                          {effectiveStatus}
                        </button>
                      </div>

                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-[#0A66C2] dark:group-hover:text-indigo-400 transition-colors flex items-start justify-between gap-1.5">
                        <span>{step.title}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-[#0A66C2] group-hover:translate-x-0.5 transition-all mt-0.5" />
                      </h4>

                      {/* Clickable Skill Pills — Each opens the White Paper directly to that skill's deep dive! */}
                      <div className="space-y-1 pt-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                          Click any topic for deep-dive specs:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {step.skills.map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                openStepWhitePaper(step.stepNumber, skill)
                              }}
                              title={`Open 10-Page White Paper & Engineering Deep-Dive for: ${skill}`}
                              className="rounded-md bg-zinc-100 hover:bg-indigo-600 hover:text-white px-2 py-1 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-indigo-600 dark:hover:text-white border border-zinc-200/80 dark:border-zinc-700 transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <Microscope className="h-2.5 w-2.5 opacity-75 shrink-0" />
                              <span>{skill}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      {/* Connected Marketplace Tool in Roadmap Step */}
                      {step.recommendedTool && (
                        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                          <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 truncate">
                            {step.recommendedTool.icon} {step.recommendedTool.name}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (onNavigateMarketplace) onNavigateMarketplace()
                            }}
                            className="text-[10px] font-bold text-[#0A66C2] hover:underline shrink-0 cursor-pointer"
                          >
                            {step.recommendedTool.actionText} →
                          </button>
                        </div>
                      )}

                      {/* Explicit 10-Page White Paper & Full Details CTA Footer */}
                      <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            openStepWhitePaper(step.stepNumber)
                          }}
                          className="w-full rounded-xl bg-gradient-to-r from-[#0A66C2] to-indigo-600 hover:from-[#084e96] hover:to-indigo-700 px-3 py-2 text-[11px] font-bold text-white shadow-xs flex items-center justify-between gap-1.5 cursor-pointer transition-all"
                        >
                          <span className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                            <span>📜 Read 10-Page White Paper &amp; Details</span>
                          </span>
                          <span className="rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-mono">
                            10 Pgs →
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
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

      {/* 5. VIBETOK LEARNING HUB LIVE EMBEDDED MODE */}
      {learningMode === 'vibetok' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Action Bar */}
          <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-slate-900 via-rose-950/40 to-indigo-950 p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full bg-rose-500/20 px-3 py-0.5 text-xs font-bold text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  VibeTOK Enterprise Learning &amp; Defense Hub
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-mono text-zinc-300 border border-white/10">
                  118,314 Catalog Items
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Multi-Route Dynamic Engine
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Spatial Academies, 9:16 Vertical Reels Studio &amp; MITRE Sandbox
              </h2>
              <p className="text-xs text-zinc-300 max-w-2xl">
                Browse 22 progressive spatial academies, vertical 9:16 HD Reels Studio with 1-click MP4 export, MITRE ATT&amp;CK terminal sandboxes, and Dr. Kwesi Asiedu&apos;s Doctoral White Paper directly inside ConnectIn.
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => setVibetokKey(k => k + 1)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
                title="Reload Current Route"
              >
                <span>⟳ Reload</span>
              </button>
              <button
                onClick={() => setVibetokExpanded(!vibetokExpanded)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
                title="Toggle Full Height"
              >
                <span>{vibetokExpanded ? "⊟ Standard Height" : "⛶ Full Height"}</span>
              </button>
              <a
                href={vibetokRoute}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>Open Current Route ↗</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Interactive Multi-Route Navigation Ribbon */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-3 shadow-md">
            <div className="flex items-center justify-between gap-2 mb-2 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-rose-500" />
                Select VibeTok Production App / Route:
              </span>
              <span className="text-[11px] font-mono text-zinc-400 truncate max-w-xs hidden sm:inline">
                {vibetokRoute}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {VIBETOK_PRODUCTION_ROUTES.map((route) => {
                const isActive = vibetokRoute === route.url
                return (
                  <button
                    key={route.id}
                    onClick={() => {
                      setVibetokRoute(route.url)
                      setVibetokKey(k => k + 1)
                    }}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? "border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 dark:border-rose-500 shadow-xs ring-2 ring-rose-500/20"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-zinc-400 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-base">{route.icon}</span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                        isActive
                          ? "bg-rose-600 text-white"
                          : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                      }`}>
                        {route.badge}
                      </span>
                    </div>
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate w-full">
                      {route.shortLabel}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                      {route.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 🎬 Dedicated 9:16 Reels Studio Feature Banner (Appears when Reels Route is active) */}
          {vibetokRoute.includes('/reels') && (
            <div className="rounded-2xl border border-pink-500/40 bg-gradient-to-r from-pink-950/60 via-purple-950/50 to-slate-950 p-4 text-white shadow-lg animate-in slide-in-from-top duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center shrink-0 text-xl">
                    🎬
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-pink-200 flex items-center gap-2">
                      <span>9:16 Vertical HD Reels Studio &amp; HTML5 Video Engine</span>
                      <span className="rounded-md bg-pink-500/30 text-pink-300 text-[10px] font-mono px-2 py-0.5 font-bold border border-pink-500/40">VERTICAL HD</span>
                    </h3>
                    <p className="text-xs text-zinc-300">
                      HTML5 &lt;video&gt; player with sound, scrub bar, loop mode, 1-Click MP4 downloads &amp; caption copy.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap text-xs">
                  <span className="rounded-lg bg-black/40 border border-white/10 px-2.5 py-1 text-[11px] text-zinc-300">
                    🔊 Sound &amp; Scrub
                  </span>
                  <span className="rounded-lg bg-black/40 border border-white/10 px-2.5 py-1 text-[11px] text-zinc-300">
                    🔁 Auto-Loop
                  </span>
                  <span className="rounded-lg bg-black/40 border border-white/10 px-2.5 py-1 text-[11px] text-pink-300 font-semibold">
                    📥 1-Click MP4
                  </span>
                  <span className="rounded-lg bg-black/40 border border-white/10 px-2.5 py-1 text-[11px] text-purple-300 font-semibold">
                    📋 Copy Tags
                  </span>
                  <a
                    href="https://vibetok-learning-hub.vercel.app/reels"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold px-3 py-1.5 text-xs shadow-md transition-all inline-flex items-center gap-1"
                  >
                    <span>Full Reels Studio</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Quick Deep Jump Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <button
              onClick={() => {
                setVibetokRoute("https://vibetok-learning-hub.vercel.app")
                setVibetokKey(k => k + 1)
              }}
              className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-purple-500 hover:shadow-md transition-all text-left group cursor-pointer"
            >
              <p className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 flex items-center justify-between">
                <span>🏛️ Spatial Academies</span>
                <span className="text-[10px] font-mono bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 px-1.5 py-0.5 rounded font-bold">22 Academies</span>
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Multi-tiered spatial curricula across trades, tech &amp; defense.</p>
            </button>

            <button
              onClick={() => {
                setVibetokRoute("https://vibetok-learning-hub.vercel.app/platform/security_courses_player")
                setVibetokKey(k => k + 1)
              }}
              className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500 hover:shadow-md transition-all text-left group cursor-pointer"
            >
              <p className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 flex items-center justify-between">
                <span>🛡️ MITRE ATT&amp;CK Terminal</span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">Interactive</span>
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Browser terminal sandbox simulating cyber adversary tactics.</p>
            </button>

            <button
              onClick={() => {
                setVibetokRoute("https://vibetok-learning-hub.vercel.app/platform/generative_ai_player")
                setVibetokKey(k => k + 1)
              }}
              className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-500 hover:shadow-md transition-all text-left group cursor-pointer"
            >
              <p className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 flex items-center justify-between">
                <span>🤖 Agentic Swarm &amp; GenAI</span>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold">Swarm Lab</span>
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Multi-agent generative flywheel &amp; dynamic reasoning models.</p>
            </button>

            <button
              onClick={() => {
                setVibetokRoute("https://vibetok-learning-hub.vercel.app/#whitepaper")
                setVibetokKey(k => k + 1)
              }}
              className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-rose-500 hover:shadow-md transition-all text-left group cursor-pointer"
            >
              <p className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-rose-600 flex items-center justify-between">
                <span>📄 Doctoral White Paper</span>
                <span className="text-[10px] font-mono bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.5 rounded font-bold">Doctoral</span>
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Peer-reviewed dissertation &amp; defense architecture blueprints.</p>
            </button>
          </div>

          {/* Embedded Interactive Iframe */}
          <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-900 shadow-2xl transition-all">
            <div className="bg-zinc-800/90 px-4 py-2.5 flex items-center justify-between border-b border-zinc-700 text-xs text-zinc-300">
              <div className="flex items-center gap-2 overflow-hidden mr-2">
                <span className="h-3 w-3 rounded-full bg-red-500 inline-block shrink-0" />
                <span className="h-3 w-3 rounded-full bg-amber-500 inline-block shrink-0" />
                <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block shrink-0" />
                <span className="font-mono text-[11px] text-zinc-400 ml-2 truncate">{vibetokRoute}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="hidden sm:inline text-[11px] text-emerald-400 font-mono">● LIVE EMBED</span>
                <a
                  href={vibetokRoute}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1 font-semibold"
                >
                  <span>Open Full Window</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <iframe
              key={`${vibetokKey}-${vibetokRoute}`}
              src={vibetokRoute}
              title="VibeTOK Learning &amp; Defense Platform"
              className={`w-full ${vibetokExpanded ? "h-[1100px]" : "h-[850px]"} border-0 transition-all bg-white`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
            />
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

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 gap-2 flex-wrap">
                <button
                  onClick={() => handleClaimCertificate(selectedCourse.title)}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Claim & Add Certificate to Profile ✓
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href="https://vibetok-learning-hub.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-gradient-to-r from-rose-600 to-purple-600 px-3.5 py-2 text-xs font-bold text-white hover:opacity-90 transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    <span>Open in VibeTOK Hub ↗</span>
                  </a>

                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="rounded-full bg-zinc-200 px-4 py-2 text-xs font-bold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
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

      {/* ========================================================================= */}
      {/* MILESTONE STEP 10-PAGE WHITE PAPER & TECHNICAL SPECIFICATION READER MODAL */}
      {/* ========================================================================= */}
      <Dialog
        open={!!activeStepWhitePaper}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedStepNumber(null)
            setHighlightedSkillName(null)
          }
        }}
      >
        <DialogContent className="max-w-6xl w-[96vw] max-h-[92vh] overflow-y-auto p-0 border-indigo-500/40 bg-zinc-50 dark:bg-zinc-950">
          {activeStepWhitePaper && activeRoadmapStep && (
            <div className="flex flex-col">
              {/* Top Monograph Banner Header */}
              <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 border-b border-indigo-500/30 space-y-4">
                <DialogHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-amber-500/20 border border-amber-400/50 px-3 py-0.5 text-[11px] font-mono font-bold text-amber-300">
                        📜 {activeStepWhitePaper.docId} · 10-PAGE WHITE PAPER
                      </span>
                      <span className="rounded-full bg-indigo-500/30 border border-indigo-400/40 px-2.5 py-0.5 text-[11px] font-bold text-indigo-200">
                        Step {activeStepWhitePaper.stepNumber} of {learningPath.steps.length} · {activeStepWhitePaper.duration}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCycleStepStatus(activeRoadmapStep)}
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border cursor-pointer ${
                          getStepEffectiveStatus(activeRoadmapStep) === 'Completed'
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/50"
                            : getStepEffectiveStatus(activeRoadmapStep) === 'In Progress'
                            ? "bg-blue-500/30 text-blue-200 border-blue-400/50"
                            : "bg-white/10 text-zinc-300 border-white/20"
                        }`}
                      >
                        Status: {getStepEffectiveStatus(activeRoadmapStep)} (Click to Toggle)
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setWhitePaperViewAll(!whitePaperViewAll)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-all cursor-pointer ${
                          whitePaperViewAll
                            ? "bg-amber-500 text-slate-950 border-amber-400"
                            : "bg-white/10 text-white hover:bg-white/20 border-white/20"
                        }`}
                      >
                        {whitePaperViewAll ? "📖 Switch to Single-Page View" : "📜 View All 10 Pages Continuous"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadStepWhitePaper(activeStepWhitePaper)}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download 10-Page .MD</span>
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
                    Step {activeStepWhitePaper.stepNumber}: {activeStepWhitePaper.stepTitle}
                  </DialogTitle>
                  <p className="text-xs text-indigo-200">
                    <strong>Career Path:</strong> {activeStepWhitePaper.pathTitle} · <strong>Standards Body:</strong> {activeStepWhitePaper.standardsBody} · <strong>Authors:</strong> {activeStepWhitePaper.authors}
                  </p>
                </DialogHeader>

                {/* 9-Step Curriculum Switcher Bar Inside Modal */}
                <div className="pt-2 border-t border-white/15 flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 shrink-0 mr-1">
                    Jump to Step:
                  </span>
                  {learningPath.steps.map((s) => {
                    const isCurrent = s.stepNumber === activeStepWhitePaper.stepNumber
                    return (
                      <button
                        key={s.stepNumber}
                        type="button"
                        onClick={() => openStepWhitePaper(s.stepNumber)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-amber-400 text-slate-950 shadow-sm"
                            : "bg-white/10 text-zinc-200 hover:bg-white/20"
                        }`}
                      >
                        Step {s.stepNumber}: {s.title.split(" ").slice(0, 3).join(" ")}…
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-6">
                {/* Key Quantitative Engineering Metrics Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {activeStepWhitePaper.keyMetrics.map((m, idx) => (
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

                {/* Interactive Skill Deep-Dive Inspector (Clicking any Skill Tag jumps & highlights here) */}
                <div className="rounded-2xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/25 p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Microscope className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                        Interactive Competency &amp; Topic Deep-Dive Encyclopedia ({activeStepWhitePaper.skillDeepDives.length} Core Modules)
                      </h3>
                    </div>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Select any topic pill below to inspect its governing formulas, field protocol &amp; dedicated white paper page:
                    </span>
                  </div>

                  {/* Skill Selector Pills */}
                  <div className="flex flex-wrap gap-2">
                    {activeStepWhitePaper.skillDeepDives.map((spec) => {
                      const isSelected =
                        highlightedSkillName === spec.skillName ||
                        (!highlightedSkillName && spec.skillName === activeStepWhitePaper.skillDeepDives[0]?.skillName)
                      return (
                        <button
                          key={spec.skillName}
                          type="button"
                          onClick={() => {
                            setHighlightedSkillName(spec.skillName)
                            setActiveWhitePaperPage(spec.pageNumber)
                          }}
                          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            isSelected
                              ? "bg-[#0A66C2] text-white shadow-md ring-2 ring-blue-400/50"
                              : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400"
                          }`}
                        >
                          <Microscope className="h-3.5 w-3.5 shrink-0" />
                          <span>{spec.skillName}</span>
                          <span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-mono">
                            Pg {spec.pageNumber}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Active Skill Deep-Dive Card */}
                  {(() => {
                    const activeSpec: SkillDeepDiveSpec | undefined =
                      activeStepWhitePaper.skillDeepDives.find((s) => s.skillName === highlightedSkillName) ||
                      activeStepWhitePaper.skillDeepDives[0]
                    if (!activeSpec) return null
                    return (
                      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-800/80 p-4 sm:p-5 space-y-4 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
                              {activeSpec.categoryBadge} · {activeSpec.standardCode}
                            </span>
                            <h4 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                              {activeSpec.skillName} — Complete Technical Specification
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setWhitePaperViewAll(false)
                              setActiveWhitePaperPage(activeSpec.pageNumber)
                            }}
                            className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-bold text-white shrink-0 cursor-pointer"
                          >
                            Jump to Page {activeSpec.pageNumber} in Manuscript ↓
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {activeSpec.technicalSummary}
                        </p>

                        <div className="rounded-lg bg-slate-950 text-emerald-400 p-3.5 font-mono text-xs overflow-x-auto border border-slate-800">
                          <span className="text-zinc-400 block text-[10px] uppercase mb-1">
                            Governing Equation / Engineering Specification:
                          </span>
                          {activeSpec.governingEquation}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <h5 className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                              Mandatory 4-Step Field Execution Protocol:
                            </h5>
                            <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                              {activeSpec.fieldProtocol.map((p, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] px-1.5 py-0.5 shrink-0 mt-0.5">
                                    {i + 1}
                                  </span>
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-2.5 text-xs">
                            <div className="rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-3">
                              <span className="font-black text-emerald-800 dark:text-emerald-300 block uppercase text-[10px]">
                                ✓ Critical Acceptance Tolerance:
                              </span>
                              <span className="text-emerald-950 dark:text-emerald-200 font-semibold mt-0.5 block">
                                {activeSpec.criticalTolerance}
                              </span>
                            </div>

                            <div className="rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3">
                              <span className="font-black text-blue-800 dark:text-blue-300 block uppercase text-[10px]">
                                🧰 Calibrated Tooling &amp; Metrology Required:
                              </span>
                              <span className="text-blue-950 dark:text-blue-200 font-semibold mt-0.5 block">
                                {activeSpec.toolingRequired}
                              </span>
                            </div>

                            <div className="rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 p-3">
                              <span className="font-black text-rose-800 dark:text-rose-300 block uppercase text-[10px]">
                                ⚠️ Failure Mode Prevented:
                              </span>
                              <span className="text-rose-950 dark:text-rose-200 mt-0.5 block">
                                {activeSpec.failureMode}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* 10-PAGE WRITTEN WHITE PAPER MANUSCRIPT READER */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Sidebar: 10-Page Table of Contents */}
                  <div className="lg:col-span-3 space-y-2">
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-2 sticky top-3">
                      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                          10-Page Manuscript Index
                        </span>
                        <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                          ~5,700 Words
                        </span>
                      </div>

                      <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
                        {activeStepWhitePaper.pages.map((p) => {
                          const isCurrentPage = !whitePaperViewAll && activeWhitePaperPage === p.pageNumber
                          return (
                            <button
                              key={p.pageNumber}
                              type="button"
                              onClick={() => {
                                setWhitePaperViewAll(false)
                                setActiveWhitePaperPage(p.pageNumber)
                              }}
                              className={`w-full text-left rounded-lg px-2.5 py-2 text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                                isCurrentPage
                                  ? "bg-[#0A66C2] text-white font-bold shadow-xs"
                                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                              }`}
                            >
                              <span className="truncate">
                                <strong>Pg {p.pageNumber}:</strong> {p.summaryBadge}
                              </span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                                  isCurrentPage
                                    ? "bg-white/20 text-white"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                                }`}
                              >
                                {p.wordCountEst}w
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Manuscript Content Area */}
                  <div className="lg:col-span-9 space-y-6">
                    {(whitePaperViewAll
                      ? activeStepWhitePaper.pages
                      : activeStepWhitePaper.pages.filter((p) => p.pageNumber === activeWhitePaperPage)
                    ).map((page) => (
                      <div
                        key={page.pageNumber}
                        className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm space-y-6"
                      >
                        {/* Running Monograph Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-zinc-900 dark:border-zinc-700 pb-3">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                            {page.runningHeader}
                          </span>
                          <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 px-2.5 py-0.5 text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300">
                            Page {page.pageNumber} of 10
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                          {page.pageTitle}
                        </h3>

                        {page.sections.map((sec, idx) => (
                          <div key={idx} className="space-y-3">
                            <h4 className="text-sm sm:text-base font-bold text-indigo-950 dark:text-indigo-300 border-l-4 border-indigo-600 pl-3">
                              {sec.heading}
                            </h4>

                            <div className="space-y-2.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
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
                                        <th key={hIdx} className="p-2.5 font-bold border-b border-zinc-200 dark:border-zinc-700">
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {sec.tableData.rows.map((row, rIdx) => (
                                      <tr key={rIdx} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                                        {row.map((cell, cIdx) => (
                                          <td key={cIdx} className="p-2.5 text-zinc-700 dark:text-zinc-300">
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
                                <p className="font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                                  📌 {sec.calloutTitle}
                                </p>
                                <p className="text-amber-950 dark:text-amber-200 mt-1 leading-relaxed">
                                  {sec.calloutBody}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Bottom Page Pagination Bar */}
                        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            disabled={page.pageNumber <= 1}
                            onClick={() => {
                              setWhitePaperViewAll(false)
                              setActiveWhitePaperPage(Math.max(1, page.pageNumber - 1))
                            }}
                            className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            <span>Previous Page</span>
                          </button>

                          <span className="text-xs font-mono text-zinc-500">
                            {activeStepWhitePaper.docId} · Page {page.pageNumber} of 10
                          </span>

                          {page.pageNumber < 10 ? (
                            <button
                              type="button"
                              onClick={() => {
                                setWhitePaperViewAll(false)
                                setActiveWhitePaperPage(Math.min(10, page.pageNumber + 1))
                              }}
                              className="rounded-lg bg-[#0A66C2] hover:bg-[#084e96] px-3.5 py-1.5 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                            >
                              <span>Next Page (Pg {page.pageNumber + 1})</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (activeStepWhitePaper.stepNumber < learningPath.steps.length) {
                                  openStepWhitePaper(activeStepWhitePaper.stepNumber + 1)
                                } else {
                                  setSelectedStepNumber(null)
                                }
                              }}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                            >
                              <span>
                                {activeStepWhitePaper.stepNumber < learningPath.steps.length
                                  ? `Proceed to Step ${activeStepWhitePaper.stepNumber + 1} White Paper →`
                                  : "Complete Curriculum Review ✓"}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

