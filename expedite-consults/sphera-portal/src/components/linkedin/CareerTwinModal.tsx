"use client"

import React, { useState } from "react"
import {
  Bot,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  Send,
  Award,
  RefreshCw,
  Sliders,
  Shield,
  Briefcase,
  Star,
  Check
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { JobItem } from "@/lib/linkedin-data"

interface CareerTwinModalProps {
  isOpen: boolean
  onClose: () => void
  job: JobItem | null
}

export function CareerTwinModal({
  isOpen,
  onClose,
  job
}: CareerTwinModalProps) {
  const [activeTab, setActiveTab] = useState<'match' | 'interview' | 'gatekeeper'>('match')
  
  // Mock Interview State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluatedScore, setEvaluatedScore] = useState<number | null>(null)
  const [evaluationFeedback, setEvaluationFeedback] = useState<string | null>(null)

  const interviewQuestions = [
    "How do you design a deterministic sandbox to isolate rogue tool executions in an autonomous multi-agent cluster?",
    "Describe your approach to eliminating implicit trust when interconnecting legacy on-prem networks with multi-cloud VPCs.",
    "How do you resolve architectural trade-offs between zero-trust latency overhead and sub-50ms user experience SLAs?"
  ]

  const handleEvaluateAnswer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userAnswer.trim()) return

    setIsEvaluating(true)
    setTimeout(() => {
      setEvaluatedScore(94)
      setEvaluationFeedback(
        "Outstanding response. Strong articulation of ephemeral microVM recycling and cryptographic verification nonces. Recommendation: Emphasize memory reclamation metrics to further impress the hiring committee."
      )
      setIsEvaluating(false)
    }, 700)
  }

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.min(interviewQuestions.length - 1, prev + 1))
    setUserAnswer("")
    setEvaluatedScore(null)
    setEvaluationFeedback(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden sm:rounded-xl">
        <DialogHeader className="border-b border-zinc-200 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 px-6 py-4 text-white dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-xs">
              <Bot className="h-5 w-5 text-sky-300 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white">
                CareerTwin™ Autonomous Career Agent
              </DialogTitle>
              <p className="text-xs text-sky-200">
                AI Candidate-Job Matchmaking & Interactive 5-Minute Mock Interview Simulator
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Sub-Tabs */}
        <div className="flex items-center border-b border-zinc-200 px-6 pt-3 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 gap-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('match')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'match'
                ? "border-[#0A66C2] text-[#0A66C2]"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            🎯 Fit Analysis (96% Match)
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'interview'
                ? "border-[#0A66C2] text-[#0A66C2]"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            🎙️ AI Mock Interview Simulation
          </button>
          <button
            onClick={() => setActiveTab('gatekeeper')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'gatekeeper'
                ? "border-[#0A66C2] text-[#0A66C2]"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            🛡️ Recruiter InMail Gatekeeper
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          {/* TAB 1: MATCH ANALYSIS */}
          {activeTab === 'match' && job && (
            <div className="space-y-4">
              <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 dark:border-sky-900/50 dark:bg-sky-950/30 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {job.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {job.company} · {job.location}
                  </p>
                </div>
                <div className="rounded-full bg-[#0A66C2] px-3.5 py-1 text-center text-white">
                  <span className="text-base font-black">96%</span>
                  <span className="text-[9px] block uppercase font-bold">Match Score</span>
                </div>
              </div>

              {/* Match Factors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="font-bold text-emerald-600 text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 100% Skills Match
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Zero Trust, Cloud Security, Next.js, Kubernetes confirmed.
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="font-bold text-emerald-600 text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Seniority Fit
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Matches your 10+ years executive architecture background.
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="font-bold text-emerald-600 text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Salary Alignment
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Offer exceeds your target threshold ($220k+).
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
                <p className="font-bold text-zinc-900 dark:text-zinc-100">
                  CareerTwin™ AI Strategic Advice
                </p>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Your profile ranks in the top 1% of applicants for this role. We recommend highlighting your recent research paper on <strong>Autonomous Defense Loops</strong> in your cover letter.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE MOCK INTERVIEW */}
          {activeTab === 'interview' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-zinc-800 dark:to-zinc-850 border border-blue-200 dark:border-zinc-700">
                <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                  <span>Question {currentQuestionIndex + 1} of {interviewQuestions.length}</span>
                  <span className="font-bold text-[#0A66C2]">AI Technical Screener</span>
                </div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                  &ldquo;{interviewQuestions[currentQuestionIndex]}&rdquo;
                </h4>
              </div>

              {/* Answer Input */}
              <form onSubmit={handleEvaluateAnswer} className="space-y-3">
                <textarea
                  rows={4}
                  placeholder="Type your technical response here (or speak your answer)..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-xs text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setUserAnswer("We deploy ephemeral MicroVMs (e.g. AWS Firecracker) with deterministic memory sandboxing and enforce cryptographic HMAC nonces on every sub-agent RPC call to prevent replay poisoning.")}
                    className="text-[11px] font-semibold text-[#0A66C2] hover:underline"
                  >
                    ✨ Use Sample Principal Architect Response
                  </button>

                  <button
                    type="submit"
                    disabled={!userAnswer.trim() || isEvaluating}
                    className="flex items-center gap-1.5 rounded-full bg-[#0A66C2] px-5 py-2 font-bold text-white hover:bg-[#004182] disabled:opacity-40 shadow-xs"
                  >
                    {isEvaluating ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Evaluating with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Grade My Response
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Feedback Box */}
              {evaluatedScore !== null && evaluationFeedback && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Award className="h-4 w-4" /> Score: {evaluatedScore} / 100 (Exceptional)
                    </span>
                    {currentQuestionIndex < interviewQuestions.length - 1 && (
                      <button
                        onClick={handleNextQuestion}
                        className="rounded-full bg-emerald-600 px-4 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                      >
                        Next Question →
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {evaluationFeedback}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RECRUITER GATEKEEPER */}
          {activeTab === 'gatekeeper' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  Autonomous InMail Gatekeeper Rules
                </h4>
                <p className="text-xs text-zinc-500">
                  CareerTwin screens incoming recruiter messages and filters out low-signal spam before it hits your inbox.
                </p>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Minimum Total Comp Filter ($200,000+)
                    </span>
                    <span className="font-bold text-emerald-600">Active ✓</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Remote / Hybrid Only Policy
                    </span>
                    <span className="font-bold text-emerald-600">Active ✓</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Auto-Response with Portfolio Sandbox
                    </span>
                    <span className="font-bold text-emerald-600">Active ✓</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
