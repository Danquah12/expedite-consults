"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  RefreshCw,
  Sparkles,
  Wand2
} from "lucide-react"
import { UserProfile } from "@/lib/connectln-data"

interface TargetJobBrief {
  title: string
  company: string
  location?: string
  salaryRange?: string
  description?: string
  tags?: string[]
}

interface ResumePrepStudioEmbedProps {
  currentUser?: UserProfile
  targetJob?: TargetJobBrief | null
  iframeKey?: number
  onReloadIframe?: () => void
  isFullscreen?: boolean
}

const STOPWORDS = new Set([
  "with", "from", "that", "this", "have", "will", "your", "their", "about", "into", "over",
  "under", "across", "using", "work", "working", "team", "teams", "role", "roles", "years",
  "year", "experience", "strong", "ability", "including", "must", "plus", "preferred", "required",
  "full", "time", "part", "remote", "hybrid", "onsite", "position", "company", "looking", "join"
])

function buildInitialResumeFromProfile(user?: UserProfile): string {
  if (!user) return ""
  const skills = (user.skills || []).map((s) => s.name).join(", ")
  const expBlocks = (user.experience || [])
    .map(
      (e) =>
        `${e.role} — ${e.company} (${e.duration})\n• ${e.description}\n• Core Skills: ${(e.skills || []).join(", ")}`
    )
    .join("\n\n")
  const certs = (user.certifications || []).map((c) => `• ${c.title} (${c.issuer})`).join("\n")

  return [
    `${user.name}`,
    `${user.headline || user.profession || "Verified ConnectLn Professional"}`,
    `${user.location || "United States"}${user.email ? ` | ${user.email}` : ""}`,
    "",
    "PROFESSIONAL SUMMARY",
    user.about || `Results-driven ${user.profession || "specialist"} with verified field credentials and operational execution.`,
    "",
    skills ? `CORE SKILLS\n${skills}` : "",
    expBlocks ? `\nEXPERIENCE\n${expBlocks}` : "",
    certs ? `\nCERTIFICATIONS & LICENSES\n${certs}` : ""
  ]
    .filter(Boolean)
    .join("\n")
}

function formatTargetJobDescription(job?: TargetJobBrief | null): string {
  if (!job) return ""
  return [
    `${job.title} at ${job.company}`,
    job.location ? `Location: ${job.location}` : "",
    job.salaryRange ? `Compensation: ${job.salaryRange}` : "",
    job.description || "",
    job.tags && job.tags.length > 0 ? `Key Skills & Requirements: ${job.tags.join(", ")}` : ""
  ]
    .filter(Boolean)
    .join("\n")
}

export function ResumePrepStudioEmbed({
  currentUser,
  targetJob,
  iframeKey = 0,
  onReloadIframe,
  isFullscreen = false
}: ResumePrepStudioEmbedProps) {
  const [studioMode, setStudioMode] = useState<"native" | "external">("native")
  const [resumeDraft, setResumeDraft] = useState<string>(() => buildInitialResumeFromProfile(currentUser))
  const [jobDescDraft, setJobDescDraft] = useState<string>(() =>
    formatTargetJobDescription(targetJob) ||
    "Lead specialist responsible for safety compliance, technical diagnostics, quality assurance, project execution, cross-functional coordination, and client delivery."
  )
  const [copiedOutput, setCopiedOutput] = useState(false)
  const [isIframeLoading, setIsIframeLoading] = useState(true)
  const [iframeSlowWarning, setIframeSlowWarning] = useState(false)

  useEffect(() => {
    if (currentUser) {
      setResumeDraft((prev) => (prev.trim().length === 0 ? buildInitialResumeFromProfile(currentUser) : prev))
    }
  }, [currentUser])

  useEffect(() => {
    if (targetJob) {
      setJobDescDraft(formatTargetJobDescription(targetJob))
    }
  }, [targetJob])

  useEffect(() => {
    if (studioMode !== "external") return
    setIsIframeLoading(true)
    setIframeSlowWarning(false)
    const timer = setTimeout(() => {
      setIframeSlowWarning(true)
    }, 8000)
    return () => clearTimeout(timer)
  }, [studioMode, iframeKey])

  const atsAnalysis = useMemo(() => {
    const rawKeywords = Array.from(
      new Set(
        jobDescDraft
          .toLowerCase()
          .replace(/[^a-z0-9+#./\-\s]/g, " ")
          .split(/\s+/)
          .filter((w) => w.length >= 4 && !STOPWORDS.has(w) && !/^\d+$/.test(w))
      )
    ).slice(0, 24)

    const resumeLower = resumeDraft.toLowerCase()
    const matched = rawKeywords.filter((kw) => resumeLower.includes(kw))
    const missing = rawKeywords.filter((kw) => !resumeLower.includes(kw))
    const score = rawKeywords.length === 0 ? 85 : Math.min(99, Math.max(35, Math.round((matched.length / rawKeywords.length) * 100)))

    return { score, matched, missing }
  }, [resumeDraft, jobDescDraft])

  const handleInjectMissingKeywords = () => {
    if (atsAnalysis.missing.length === 0) return
    const topMissing = atsAnalysis.missing.slice(0, 8).join(", ")
    const roleHeader = targetJob ? `${targetJob.title} (${targetJob.company})` : "Target Role Alignment"
    setResumeDraft((prev) =>
      `${prev.trim()}\n\nTAILORED COMPETENCIES — ${roleHeader.toUpperCase()}\n• Verified proficiency across ${topMissing}, aligned to operational KPIs, safety standards, and quality benchmarks.`
    )
  }

  const handleCopyResume = () => {
    navigator.clipboard?.writeText(resumeDraft)
    setCopiedOutput(true)
    setTimeout(() => setCopiedOutput(false), 2200)
  }

  const handleDownloadResume = () => {
    const blob = new Blob([resumeDraft], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const safeName = (currentUser?.name || "ConnectLn_Member").replace(/[^a-zA-Z0-9_-]/g, "_")
    a.download = `${safeName}_Tailored_Resume.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-lg bg-white dark:bg-zinc-900 flex flex-col ${isFullscreen ? "flex-1 min-h-[75vh]" : ""}`}>
      {/* Mode Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStudioMode("native")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              studioMode === "native"
                ? "bg-[#0A66C2] text-white shadow-2xs"
                : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>In-App ATS Resume Tailor</span>
          </button>
          <button
            type="button"
            onClick={() => setStudioMode("external")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              studioMode === "external"
                ? "bg-[#0A66C2] text-white shadow-2xs"
                : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>External CareerSuite App</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {studioMode === "external" && (
            <>
              {onReloadIframe && (
                <button
                  type="button"
                  onClick={onReloadIframe}
                  className="rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1 font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-1 hover:bg-zinc-100 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Reload</span>
                </button>
              )}
              <a
                href="https://tuhousing.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 hover:bg-emerald-100"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )}
        </div>
      </div>

      {studioMode === "native" ? (
        <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Target Job + ATS Fit Breakdown */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                <span>1. Target Job Description &amp; KSAs</span>
                <span className="text-[11px] font-normal text-zinc-500">Paste any posting</span>
              </label>
              <textarea
                value={jobDescDraft}
                onChange={(e) => setJobDescDraft(e.target.value)}
                rows={7}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950 p-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                placeholder="Paste target job description, qualifications, or USAJOBS KSA requirements..."
              />
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">ATS Keyword Match Score</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                    atsAnalysis.score >= 75
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {atsAnalysis.score}% Fit
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    atsAnalysis.score >= 75 ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${atsAnalysis.score}%` }}
                />
              </div>

              {atsAnalysis.matched.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Matched Keywords ({atsAnalysis.matched.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {atsAnalysis.matched.slice(0, 12).map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 px-2 py-0.5 text-[10px] font-medium text-emerald-800 dark:text-emerald-300"
                      >
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {atsAnalysis.missing.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                    Missing Keywords to Add ({atsAnalysis.missing.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {atsAnalysis.missing.slice(0, 10).map((kw) => (
                      <span
                        key={kw}
                        className="rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/70 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:text-amber-300"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleInjectMissingKeywords}
                    className="w-full rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    <span>Auto-Tailor Resume with Missing Keywords</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Editable Tailored Resume */}
          <div className="lg:col-span-7 flex flex-col space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-[#0A66C2]" />
                <span>2. Tailored Resume Draft (Synced from {currentUser?.name || "Your Profile"})</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResumeDraft(buildInitialResumeFromProfile(currentUser))}
                  className="rounded-full border border-zinc-200 dark:border-zinc-700 px-3 py-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Reset from Profile
                </button>
                <button
                  type="button"
                  onClick={handleCopyResume}
                  className="rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 py-1 text-[11px] font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1 cursor-pointer"
                >
                  {copiedOutput ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedOutput ? "Copied!" : "Copy"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadResume}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  <span>Export .MD</span>
                </button>
              </div>
            </div>

            <textarea
              value={resumeDraft}
              onChange={(e) => setResumeDraft(e.target.value)}
              rows={18}
              className="w-full flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-3.5 font-mono text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
            />
          </div>
        </div>
      ) : (
        <div className={`relative w-full ${isFullscreen ? "flex-1 min-h-[72vh]" : "h-[780px]"}`}>
          {isIframeLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 dark:bg-zinc-950/95 p-6 text-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-[#0A66C2]" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Loading External CareerSuite Studio (tuhousing.vercel.app)...
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Prefer zero wait? Switch back to the built-in In-App ATS Resume Tailor anytime.
                </p>
              </div>
              {iframeSlowWarning && (
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStudioMode("native")}
                    className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-1.5 text-xs font-bold cursor-pointer"
                  >
                    Use In-App Resume Tailor Instead
                  </button>
                  <a
                    href="https://tuhousing.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-zinc-300 dark:border-zinc-700 px-4 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Open External App in New Tab ↗
                  </a>
                </div>
              )}
            </div>
          )}
          <iframe
            key={iframeKey}
            src="https://tuhousing.vercel.app/"
            title="Expedite CareerSuite — AI-Powered Resume Preparation & Tailoring App"
            className="w-full h-full border-0"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups allow-modals"
            allow="clipboard-write; clipboard-read"
            onLoad={() => setIsIframeLoading(false)}
          />
        </div>
      )}
    </div>
  )
}
