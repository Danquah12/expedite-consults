"use client"

import React, { useState } from "react"
import {
  ShieldCheck,
  Award,
  Layers,
  Star,
  CheckCircle2,
  MessageSquare,
  Plus,
  Send,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Cpu,
  Code2,
  FileText,
  DollarSign,
  UserCheck,
  Check,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Clock,
  ThumbsUp,
  Target,
  Zap,
  Lock,
  Search,
  BookOpen,
  ShoppingBag
} from "lucide-react"
import {
  ValidationSubmission,
  ExpertReviewer,
  VALIDATION_TYPES,
  VERIFIED_EXPERT_REVIEWERS,
  VALIDATION_SUBMISSIONS_DATA
} from "@/lib/peer-validation-data"
import { UserProfile } from "@/lib/linkedin-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PeerReviewViewProps {
  currentUser: UserProfile
}

export function PeerReviewView({ currentUser }: PeerReviewViewProps) {
  // Master View Mode
  const [viewMode, setViewMode] = useState<'submissions' | 'experts' | 'submit'>('submissions')

  // Validation Type Filter
  const [selectedType, setSelectedType] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [submissions, setSubmissions] = useState<ValidationSubmission[]>(VALIDATION_SUBMISSIONS_DATA)
  const [experts, setExperts] = useState<ExpertReviewer[]>(VERIFIED_EXPERT_REVIEWERS)

  // Review Modal State
  const [activeReviewSubmission, setActiveReviewSubmission] = useState<ValidationSubmission | null>(null)
  const [reviewVerdict, setReviewVerdict] = useState<'Reviewed & Approved ✓' | 'Changes Requested ⚠️' | 'Conditionally Approved'>('Reviewed & Approved ✓')
  const [reviewFeedback, setReviewFeedback] = useState("")
  const [reviewScore, setReviewScore] = useState(10)
  const [userReputationPoints, setUserReputationPoints] = useState(840)

  // Request Expert Modal
  const [activeExpertTarget, setActiveExpertTarget] = useState<ExpertReviewer | null>(null)
  const [expertBookingSuccess, setExpertBookingSuccess] = useState(false)

  // Submit New Validation Modal
  const [isNewSubmissionOpen, setIsNewSubmissionOpen] = useState(false)
  const [newSubTitle, setNewSubTitle] = useState("")
  const [newSubType, setNewSubType] = useState<'Architecture' | 'Security' | 'Code' | 'Product' | 'Research' | 'Resume'>('Architecture')
  const [newSubSummary, setNewSubSummary] = useState("")
  const [newSubCode, setNewSubCode] = useState("")
  const [newSubBounty, setNewSubBounty] = useState("150")
  const [newSubSuccess, setNewSubSuccess] = useState(false)

  // Filter Submissions
  const filteredSubmissions = submissions.filter(sub => {
    const matchType = selectedType === 'All' || sub.type === selectedType
    const matchSearch = !searchQuery || (
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.author.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return matchType && matchSearch
  })

  // Submit Review Handler
  const handlePerformReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeReviewSubmission || !reviewFeedback.trim()) return

    const newReviewItem = {
      reviewerName: currentUser.name,
      reviewerRole: currentUser.headline.split('|')[0].trim(),
      reviewerAvatar: currentUser.avatar,
      rating: 5,
      formalVerdict: reviewVerdict,
      detailedFeedback: reviewFeedback.trim(),
      rubricRatings: [
        { criteria: 'Technical Rigor', score: reviewScore },
        { criteria: 'Production Viability', score: reviewScore }
      ],
      timestamp: 'Just now'
    }

    setSubmissions(prev =>
      prev.map(item => {
        if (item.id !== activeReviewSubmission.id) return item
        return {
          ...item,
          status: reviewVerdict === 'Reviewed & Approved ✓' ? 'Reviewed & Approved' : 'Revisions Requested',
          reviews: [newReviewItem, ...item.reviews]
        }
      })
    )

    setUserReputationPoints(prev => prev + activeReviewSubmission.bountyPoints)
    setActiveReviewSubmission(null)
    setReviewFeedback("")
  }

  // Create Submission Handler
  const handleCreateValidationSubmission = (e: React.FormEvent) => {
    e.preventDefault()
    setNewSubSuccess(true)
    setTimeout(() => {
      setNewSubSuccess(false)
      setIsNewSubmissionOpen(false)

      const created: ValidationSubmission = {
        id: 'val_' + Date.now(),
        type: newSubType,
        title: newSubTitle,
        author: {
          name: currentUser.name,
          role: currentUser.headline.split('|')[0].trim(),
          avatar: currentUser.avatar,
          company: 'Expedite Consults'
        },
        summary: newSubSummary,
        artifactType: newSubType === 'Code' ? 'Code Snippet' : newSubType === 'Resume' ? 'Technical Resume' : 'Architecture Diagram',
        codeSnippet: newSubCode || undefined,
        submittedAt: 'Just now',
        status: 'Open for Review',
        bountyPoints: parseInt(newSubBounty) || 150,
        reviews: []
      }

      setSubmissions(prev => [created, ...prev])
      setNewSubTitle("")
      setNewSubSummary("")
      setNewSubCode("")
    }, 1600)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      {/* 1. TOP HERO BANNER */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-amber-950 p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/40 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5" />
                ConnectIn Peer Review & Professional Validation
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                Architecture · Security · Code · Products · Research · Resumes
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Professional Validation & Expert Review Engine
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Submit your cloud architectures, security postures, codebases, and research papers for formal evaluation by verified Principal Architects and CISOs.
            </p>
          </div>

          {/* User Reputation & Mode Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="rounded-xl bg-black/40 border border-white/15 px-4 py-2 text-center text-xs">
              <span className="text-[10px] text-zinc-400 uppercase font-mono">Your Reputation Score</span>
              <p className="text-lg font-black text-amber-300 flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-amber-300" />
                {userReputationPoints} PTS
              </p>
            </div>

            <button
              onClick={() => setIsNewSubmissionOpen(true)}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Submit for Validation</span>
            </button>
          </div>
        </div>

        {/* 3 Master Modes Switcher */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setViewMode('submissions')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                viewMode === 'submissions'
                  ? "bg-white text-zinc-950 shadow-md font-extrabold"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Validation Queue ({submissions.length})</span>
            </button>

            <button
              onClick={() => setViewMode('experts')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                viewMode === 'experts'
                  ? "bg-white text-zinc-950 shadow-md font-extrabold"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5 text-purple-600" />
              <span>Verified Expert Reviewers ({experts.length})</span>
            </button>
          </div>
        </div>

        {/* The 6 Validation Types Filter Ribbon */}
        {viewMode === 'submissions' && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 shrink-0 mr-1">
              Review Type:
            </span>
            {VALIDATION_TYPES.map((type) => {
              const isSelected = selectedType === type.id
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-amber-400 text-zinc-950 font-bold shadow-xs"
                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: VALIDATION QUEUE (SUBMISSIONS STREAM) */}
      {/* ========================================================================= */}
      {viewMode === 'submissions' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between gap-3">
            <div className="relative flex-1 flex items-center rounded-lg bg-zinc-50 px-3 py-2 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800/80">
              <Search className="h-4 w-4 text-zinc-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search architectures, zero trust blueprints, code modules, CVE benchmarks, and resumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100"
              />
            </div>
            <span className="text-xs text-zinc-500 font-semibold shrink-0">
              {filteredSubmissions.length} active validations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-amber-500 hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Card Header: Type Badge & Status */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-900 border border-amber-200 dark:bg-amber-950 dark:text-amber-300">
                      {sub.type} Review
                    </span>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          sub.status === 'Reviewed & Approved'
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                            : sub.status === 'In Review'
                            ? "bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-950 dark:text-purple-300"
                            : "bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950 dark:text-sky-300"
                        }`}
                      >
                        {sub.status}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">{sub.submittedAt}</span>
                    </div>
                  </div>

                  {/* Author Row */}
                  <div className="flex items-center gap-3">
                    <img
                      src={sub.author.avatar}
                      alt={sub.author.name}
                      className="h-10 w-10 rounded-full object-cover border border-zinc-200"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {sub.author.name}
                      </h4>
                      <p className="text-xs text-zinc-500">{sub.author.role} {sub.author.company && `· ${sub.author.company}`}</p>
                    </div>
                  </div>

                  <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100 leading-snug">
                    {sub.title}
                  </h3>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {sub.summary}
                  </p>

                  {/* Artifact Preview (Diagram or Code) */}
                  {sub.artifactPreview && (
                    <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-48">
                      <img src={sub.artifactPreview} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {sub.codeSnippet && (
                    <div className="rounded-xl bg-black border border-zinc-800 p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-36">
                      <pre>{sub.codeSnippet}</pre>
                    </div>
                  )}

                  {/* Rubric Scores Matrix if Reviewed */}
                  {sub.rubricScores && (
                    <div className="rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-800/60 space-y-1.5">
                      <p className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                        <span>Formal Rubric Evaluation:</span>
                        <span className="text-emerald-600 font-black">Average: 9.6/10</span>
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 pt-1">
                        <div>🔒 Security: <strong>{sub.rubricScores.security}/10</strong></div>
                        <div>⚡ Scalability: <strong>{sub.rubricScores.scalability}/10</strong></div>
                        <div>🧩 Modularity: <strong>{sub.rubricScores.modularity}/10</strong></div>
                        <div>💰 Cost Efficiency: <strong>{sub.rubricScores.costEfficiency}/10</strong></div>
                      </div>
                    </div>
                  )}

                  {/* Reviewer Feedback Quote */}
                  {sub.reviews.length > 0 && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs dark:bg-emerald-950/20 dark:border-emerald-900/40 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900 dark:text-emerald-300">
                          {sub.reviews[0].reviewerName} ({sub.reviews[0].reviewerRole})
                        </span>
                        <span className="font-bold text-emerald-600">{sub.reviews[0].formalVerdict}</span>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 italic text-[11px]">
                        "{sub.reviews[0].detailedFeedback}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                    <Award className="h-4 w-4" />
                    <span>+{sub.bountyPoints} Rep Bounty</span>
                    {sub.cashBounty && (
                      <span className="text-emerald-600 ml-1">· {sub.cashBounty}</span>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveReviewSubmission(sub)}
                    className="rounded-full bg-[#0A66C2] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#004182] transition-colors"
                  >
                    Submit Critique & Score
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: VERIFIED EXPERT REVIEWER NETWORK (PAID / RETAINERS) */}
      {/* ========================================================================= */}
      {viewMode === 'experts' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 p-6 text-white shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-purple-500/30 px-3 py-0.5 text-xs font-bold text-purple-200 border border-purple-400/40 flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-purple-300" />
                Verified Expert Reviewer Network
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                100% Verified Technical Credentials
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Request 1-on-1 Architectural Audits & Code Reviews from Top Experts
            </h2>
            <p className="text-xs sm:text-sm text-purple-100 max-w-2xl leading-relaxed">
              Book dedicated reviews with former Fortune 500 CISOs, Stanford AI fellows, and OSCP/OSCE exploit leads with guaranteed 24-48 hour turnarounds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {experts.map((exp) => (
              <div
                key={exp.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-purple-500 hover:shadow-xl transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={exp.avatar}
                        alt={exp.name}
                        className="h-14 w-14 rounded-2xl object-cover border-2 border-purple-200 dark:border-purple-900 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                            {exp.name}
                          </h3>
                        </div>
                        <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                          {exp.specialtyTitle}
                        </p>
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs mt-0.5">
                          <Star className="h-3.5 w-3.5 fill-amber-500" />
                          <span>{exp.rating}</span>
                          <span className="text-zinc-400 font-normal">({exp.reviewsCompletedCount} reviews completed)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                    {exp.bio}
                  </p>

                  {/* Tech Stack Chips */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold uppercase text-zinc-400">Expertise:</span>
                    <div className="flex flex-wrap gap-1">
                      {exp.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price & Booking Button */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                      {exp.pricePerReview}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">{exp.turnaroundTime} SLA</span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveExpertTarget(exp)
                      setExpertBookingSuccess(false)
                    }}
                    className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-1.5 text-xs font-bold text-white shadow-xs"
                  >
                    Request Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBMIT FORMAL REVIEW CRITIQUE MODAL */}
      <Dialog
        open={!!activeReviewSubmission}
        onOpenChange={(open) => {
          if (!open) setActiveReviewSubmission(null)
        }}
      >
        <DialogContent className="max-w-xl">
          {activeReviewSubmission && (
            <form onSubmit={handlePerformReviewSubmit} className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs font-bold text-[#0A66C2]">
                  <Award className="h-4 w-4" />
                  <span>Validation Critique: {activeReviewSubmission.type} Review</span>
                </div>
                <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {activeReviewSubmission.title}
                </DialogTitle>
              </DialogHeader>

              <div className="rounded-lg bg-zinc-50 p-3 text-xs dark:bg-zinc-800/60 space-y-1">
                <p className="text-zinc-600 dark:text-zinc-300">{activeReviewSubmission.summary}</p>
              </div>

              {/* Verdict Selection */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold">Formal Review Verdict:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    'Reviewed & Approved ✓',
                    'Conditionally Approved',
                    'Changes Requested ⚠️'
                  ].map((verdict) => (
                    <button
                      key={verdict}
                      type="button"
                      onClick={() => setReviewVerdict(verdict as any)}
                      className={`p-2 rounded-lg border text-center font-bold text-[11px] transition-all ${
                        reviewVerdict === verdict
                          ? "border-[#0A66C2] bg-blue-50 text-[#0A66C2] dark:bg-blue-950/40"
                          : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {verdict}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Technical Feedback */}
              <div className="space-y-1 text-xs">
                <label className="font-bold">Detailed Technical Feedback & Rubric Notes:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail architectural trade-offs, attack surface risks, memory safety concerns, and recommendations..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-xs dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-amber-600">
                  +{activeReviewSubmission.bountyPoints} Rep Points Earned on Submission
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveReviewSubmission(null)}
                    className="rounded-full px-4 py-1.5 text-xs font-bold text-zinc-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-[#0A66C2] px-5 py-1.5 text-xs font-bold text-white hover:bg-[#004182]"
                  >
                    Publish Formal Review
                  </button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* REQUEST SPECIFIC EXPERT BOOKING MODAL */}
      <Dialog
        open={!!activeExpertTarget}
        onOpenChange={(open) => {
          if (!open) setActiveExpertTarget(null)
        }}
      >
        <DialogContent className="max-w-md">
          {activeExpertTarget && (
            <div className="space-y-4 pt-1">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-purple-600" />
                  <span>Request Review from {activeExpertTarget.name}</span>
                </DialogTitle>
              </DialogHeader>

              {expertBookingSuccess ? (
                <div className="py-6 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    Expert Review Request Dispatched!
                  </h4>
                  <p className="text-xs text-zinc-500">
                    {activeExpertTarget.name} has received your artifact and SLA commitment ({activeExpertTarget.turnaroundTime}).
                  </p>
                  <button
                    onClick={() => setActiveExpertTarget(null)}
                    className="rounded-full bg-[#0A66C2] px-5 py-2 text-xs font-bold text-white"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 dark:bg-purple-950/30 dark:border-purple-900/40 space-y-1">
                    <p className="font-bold text-purple-900 dark:text-purple-300">{activeExpertTarget.specialtyTitle}</p>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Fee: <strong>{activeExpertTarget.pricePerReview}</strong> · Turnaround: <strong>{activeExpertTarget.turnaroundTime}</strong>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">Select Artifact to Submit:</label>
                    <select className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700">
                      <option>Multi-Region Zero Trust Egress Topology (Diagram)</option>
                      <option>Rust WebAssembly MCP Token Validation (Code)</option>
                      <option>Alex_Taylor_Security_Architect_2026.pdf (Resume)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">Specific Focus / Concerns for the Reviewer:</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Please evaluate edge mTLS performance and potential nonce replay vulnerabilities..."
                      className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => setActiveExpertTarget(null)}
                      className="rounded-full px-4 py-1.5 font-bold text-zinc-600 hover:bg-zinc-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setExpertBookingSuccess(true)}
                      className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 font-bold text-white shadow-md hover:from-purple-500 hover:to-indigo-500"
                    >
                      Confirm Booking ({activeExpertTarget.pricePerReview})
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* SUBMIT ARTIFACT FOR VALIDATION MODAL */}
      <Dialog open={isNewSubmissionOpen} onOpenChange={setIsNewSubmissionOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <span>Submit Artifact for Peer Validation</span>
            </DialogTitle>
          </DialogHeader>

          {newSubSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Submission Published to Validation Queue!
              </h4>
              <p className="text-xs text-zinc-500">
                Verified community peers and assigned experts will review your artifact against formal rubrics.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCreateValidationSubmission} className="space-y-4 pt-2 text-xs">
              <div className="space-y-1">
                <label className="font-bold">Validation Type</label>
                <select
                  value={newSubType}
                  onChange={(e) => setNewSubType(e.target.value as any)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700 font-bold"
                >
                  <option value="Architecture">🏛️ Architecture Review (Cloud & Zero Trust)</option>
                  <option value="Security">🛡️ Security Review (Threat Modeling & Audits)</option>
                  <option value="Code">💻 Code Review (Rust, Go, Next.js, Smart Contracts)</option>
                  <option value="Product">🛍️ Product Review (Enterprise Software Benchmark)</option>
                  <option value="Research">📑 Research Review (Academic Paper / Preprints)</option>
                  <option value="Resume">📄 Resume Review (Technical Career & ATS Audit)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Zero-Trust Microservice Topology on GCP"
                  value={newSubTitle}
                  onChange={(e) => setNewSubTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">Summary & Review Objectives</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your design choices, trade-offs, and what specific feedback you are seeking..."
                  value={newSubSummary}
                  onChange={(e) => setNewSubSummary(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              {newSubType === 'Code' && (
                <div className="space-y-1">
                  <label className="font-bold">Paste Code Snippet</label>
                  <textarea
                    rows={4}
                    placeholder="pub fn verify_signature(...) { ... }"
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 font-mono text-xs dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-xs text-zinc-500 font-semibold">
                  Reputation Bounty: <strong>150 PTS</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewSubmissionOpen(false)}
                    className="rounded-full px-4 py-1.5 font-bold text-zinc-600 hover:bg-zinc-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-[#0A66C2] px-5 py-2 font-bold text-white hover:bg-[#004182]"
                  >
                    Submit for Validation
                  </button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
