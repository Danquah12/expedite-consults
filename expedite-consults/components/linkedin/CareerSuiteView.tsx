"use client"

import React, { useState } from "react"
import {
  FileText,
  Sparkles,
  Rocket,
  Briefcase,
  Calendar,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Award,
  Sliders,
  ChevronRight,
  TrendingUp,
  Download,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight
} from "lucide-react"
import { UserProfile } from "@/lib/linkedin-data"

interface CareerSuiteViewProps {
  currentUser: UserProfile
}

export function CareerSuiteView({ currentUser }: CareerSuiteViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'maximizer' | 'tailor' | 'tracker' | 'live_app'>('maximizer')

  // Profile Maximizer State
  const [targetIndustry, setTargetIndustry] = useState("Cloud Security & AI Architecture")
  const [isMaximizing, setIsMaximizing] = useState(false)
  const [optimizedProfile, setOptimizedProfile] = useState<{
    atsScore: number
    suggestedHeadline: string
    suggestedAbout: string
    missingKeywords: string[]
  } | null>({
    atsScore: 94,
    suggestedHeadline: "Principal Cloud Security Architect | Zero Trust Multi-Cloud & Autonomous AI Containment | CISSP | Advisory Fellow",
    suggestedAbout: "Executive Security Architect and AI Advisory Fellow with 10+ years designing zero-trust infrastructures across AWS, Kubernetes, and enterprise microservices. Pioneer of ephemeral sandbox defense loops and deterministic multi-agent guardrails.",
    missingKeywords: ["eBPF Observability", "SOC 2 Type II", "mTLS MicroVMs", "LLM Guardrails", "Cryptographic Nonces"]
  })

  // Resume Tailor State
  const [masterResume, setMasterResume] = useState(
    `ALEX TAYLOR
Principal Cloud Security Architect | New York, NY
Summary: 10+ years engineering zero-trust cloud security and container isolation.
Experience:
• Expedite Consults: Led multi-agent defense architectures for 20+ enterprise clients.
• Apex Defense: Designed Firecracker MicroVM sandboxes reducing containment latency by 74%.
• Core Skills: AWS, Kubernetes, eBPF, Next.js, SOC 2, Zero Trust Architecture.`
  )
  const [jobDescription, setJobDescription] = useState(
    `Looking for a Staff/Principal Security Architect to design deterministic AI agent sandboxes, enforce zero-trust policies on AWS VPCs, and oversee SOC 2 Type II enterprise compliance.`
  )
  const [isTailoring, setIsTailoring] = useState(false)
  const [tailoredResult, setTailoredResult] = useState<{
    matchRate: number
    tailoredBullets: string[]
    coverLetter: string
  } | null>(null)

  // Job Tracker State
  const [trackedJobs, setTrackedJobs] = useState([
    { id: '1', company: 'Apex Defense Labs', role: 'Founding Security Architect', status: 'Interviewing', appliedDate: 'Aug 26, 2026', nextStep: 'Architecture Presentation (Tomorrow 2 PM)' },
    { id: '2', company: 'Horizon FinTech', role: 'VP of Information Security', status: 'Applied', appliedDate: 'Aug 28, 2026', nextStep: 'Recruiter Screen' },
    { id: '3', company: 'Quantico Cloud', role: 'Principal Edge Architect', status: 'Offer Received', appliedDate: 'Aug 20, 2026', nextStep: 'Equity Negotiation ($220k + 2.5%)' }
  ])

  const [copied, setCopied] = useState(false)

  const handleRunMaximizer = (e: React.FormEvent) => {
    e.preventDefault()
    setIsMaximizing(true)
    setTimeout(() => {
      setOptimizedProfile({
        atsScore: 98,
        suggestedHeadline: `Principal Cloud & AI Security Architect | Zero Trust Multi-Cloud & LLM Guardrails | Stanford AI Fellow | Expedite Advisory`,
        suggestedAbout: `High-impact technical leader specializing in deterministic multi-agent sandboxing, eBPF kernel security, and SOC 2 Type II compliance. Proven track record scaling zero-trust architectures to 10M+ daily events.`,
        missingKeywords: ["Agent Sandboxing", "Kernel Observability", "Zero-Trust VPC", "Threat Modeling"]
      })
      setIsMaximizing(false)
    }, 700)
  }

  const handleRunTailor = (e: React.FormEvent) => {
    e.preventDefault()
    setIsTailoring(true)
    setTimeout(() => {
      setTailoredResult({
        matchRate: 97,
        tailoredBullets: [
          "Architected deterministic ephemeral microVM sandboxes (AWS Firecracker) for autonomous AI tools, achieving sub-10ms containment cycle with 0 escapes.",
          "Spearheaded enterprise-wide Zero Trust VPC migration across 4 multi-cloud regions, eliminating implicit lateral trust and meeting SOC 2 Type II controls.",
          "Engineered kernel-level packet inspection probes using eBPF and Cilium, reducing DDoS attack surface by 88%."
        ],
        coverLetter: `Dear Hiring Committee,\n\nI am writing to express my strong interest in the Principal Security Architect role. With over a decade architecting zero-trust multi-cloud environments and authoring deterministic sandbox defense loops for enterprise AI tools at Expedite Consults, my background directly aligns with your mandate.\n\nI would welcome the opportunity to discuss how my hands-on experience in AWS VPC containment and SOC 2 compliance can accelerate your team's security posture.\n\nSincerely,\nAlex Taylor`
      })
      setIsTailoring(false)
    }, 800)
  }

  const handleCopyText = (text: string) => {
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-400/20 px-2.5 py-0.5 text-xs font-bold text-sky-300 border border-blue-400/40 flex items-center gap-1.5 w-fit">
                <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" /> Expedite CareerSuite™
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                Connected to tuhousing.vercel.app
              </span>
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight">
              AI-Powered Resume Tailoring & Profile Maximizer
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-sky-200 max-w-xl">
              Instantly tailor your Master Resume and Cover Letter to any target job description. Optimize keywords to pass ATS screeners with 95%+ match scores.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://tuhousing.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur-xs border border-white/20 hover:bg-white/25 transition-all"
            >
              <span>Open Vercel App</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 rounded-xl shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-x-auto text-xs font-bold">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('maximizer')}
            className={`py-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'maximizer'
                ? "border-[#0A66C2] text-[#0A66C2]"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Rocket className="h-4 w-4 text-sky-500" />
            <span>Profile Maximizer</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tailor')}
            className={`py-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'tailor'
                ? "border-[#0A66C2] text-[#0A66C2]"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <FileText className="h-4 w-4 text-emerald-500" />
            <span>AI Resume & Cover Tailor</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tracker')}
            className={`py-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'tracker'
                ? "border-[#0A66C2] text-[#0A66C2]"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Briefcase className="h-4 w-4 text-purple-500" />
            <span>Job Tracker ({trackedJobs.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('live_app')}
            className={`py-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'live_app'
                ? "border-[#0A66C2] text-[#0A66C2]"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <ExternalLink className="h-4 w-4 text-amber-500" />
            <span>Live Cloud Hub (Iframe)</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: PROFILE MAXIMIZER */}
      {activeSubTab === 'maximizer' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Profile Maximizer & Platform Optimizer
                </h3>
                <p className="text-xs text-zinc-500">
                  Optimize your ConnectIn & LinkedIn profiles using your Master Resume to dramatically increase visibility to recruiters.
                </p>
              </div>

              <div className="rounded-xl bg-sky-50 px-4 py-2 border border-sky-200 text-center dark:bg-sky-950/40 dark:border-sky-900 min-w-[120px]">
                <span className="text-2xl font-black text-[#0A66C2]">
                  {optimizedProfile?.atsScore}%
                </span>
                <p className="text-[10px] uppercase font-bold text-zinc-500">ATS Match Score</p>
              </div>
            </div>

            <form onSubmit={handleRunMaximizer} className="space-y-3 pt-2">
              <div>
                <label className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
                  Target Job Title / Industry Focus
                </label>
                <input
                  type="text"
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isMaximizing}
                  className="flex items-center gap-1.5 rounded-full bg-[#0A66C2] px-6 py-2 text-xs font-bold text-white hover:bg-[#004182] transition-all shadow-xs disabled:opacity-50"
                >
                  {isMaximizing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Maximizing Profile...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Maximize Profile with AI
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* AI Optimization Results */}
          {optimizedProfile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Suggested Headline */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#0A66C2]" /> AI Optimized Headline
                  </span>
                  <button
                    onClick={() => handleCopyText(optimizedProfile.suggestedHeadline)}
                    className="text-[11px] text-[#0A66C2] font-semibold flex items-center gap-1 hover:underline"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  {optimizedProfile.suggestedHeadline}
                </p>
              </div>

              {/* Keyword Recommendations */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> High-Impact Keywords to Embed
                </span>
                <p className="text-xs text-zinc-500">
                  Adding these keywords boosts search placement by 3.8x:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {optimizedProfile.missingKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: RESUME & COVER TAILOR */}
      {activeSubTab === 'tailor' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Master Resume */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
              <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-[#0A66C2]" /> Master Resume
              </span>
              <textarea
                rows={8}
                value={masterResume}
                onChange={(e) => setMasterResume(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white p-3 font-mono text-xs text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Target Job Description */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
              <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-emerald-600" /> Target Job Description
              </span>
              <textarea
                rows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here..."
                className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-xs text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleRunTailor}
              disabled={isTailoring}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50"
            >
              {isTailoring ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Tailoring Resume & Cover Letter...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" /> Generate Tailored Resume & Cover Letter
                </>
              )}
            </button>
          </div>

          {/* Tailored Output Box */}
          {tailoredResult && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Tailored Match Score: {tailoredResult.matchRate}% (High ATS Probability)
                </span>
                <button
                  onClick={() => handleCopyText(tailoredResult.tailoredBullets.join('\n') + '\n\n' + tailoredResult.coverLetter)}
                  className="rounded-full bg-emerald-600 px-4 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" /> Copy All Tailored Content
                </button>
              </div>

              {/* Tailored Bullets */}
              <div className="space-y-2 bg-white/80 dark:bg-zinc-900/80 p-4 rounded-xl border border-emerald-100 dark:border-emerald-950">
                <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  🎯 Tailored Experience Bullets:
                </p>
                <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                  {tailoredResult.tailoredBullets.map((b, bIdx) => (
                    <li key={bIdx} className="leading-relaxed">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tailored Cover Letter */}
              <div className="space-y-2 bg-white/80 dark:bg-zinc-900/80 p-4 rounded-xl border border-emerald-100 dark:border-emerald-950">
                <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  ✉️ Tailored Cover Letter:
                </p>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed font-serif">
                  {tailoredResult.coverLetter}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: JOB TRACKER */}
      {activeSubTab === 'tracker' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Application Pipeline & Next Milestones
              </h3>
              <span className="text-xs font-semibold text-zinc-500">
                {trackedJobs.length} active applications
              </span>
            </div>

            <div className="space-y-3">
              {trackedJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 dark:bg-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {job.role}
                      </h4>
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-[#0A66C2] dark:bg-blue-950/40">
                        {job.company}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Applied on {job.appliedDate} · Next: <span className="font-semibold text-emerald-600">{job.nextStep}</span>
                    </p>
                  </div>

                  <span className={`rounded-full px-3 py-1 text-xs font-bold text-center ${
                    job.status === 'Offer Received'
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : job.status === 'Interviewing'
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: LIVE CLOUD HUB (IFRAME) */}
      {activeSubTab === 'live_app' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Embedded instance from <strong className="text-zinc-800 dark:text-zinc-200">https://tuhousing.vercel.app/</strong></span>
            <a
              href="https://tuhousing.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[#0A66C2] font-semibold hover:underline"
            >
              Open in New Tab <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-2xl border border-zinc-200 overflow-hidden shadow-lg dark:border-zinc-800 bg-white h-[750px]">
            <iframe
              src="https://tuhousing.vercel.app/"
              title="Expedite CareerSuite Live App"
              className="w-full h-full border-0"
              allow="camera; microphone; clipboard-write; clipboard-read"
            />
          </div>
        </div>
      )}
    </div>
  )
}
