"use client"

import React, { useState, useMemo, useEffect } from "react"
import {
  Bot,
  Sparkles,
  CheckCircle2,
  Award,
  RefreshCw,
  Shield,
  ChevronLeft,
  ChevronRight,
  Download,
  BookOpen,
  Lightbulb,
  Check,
  Target,
  Copy
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  generateNoctisInterviewPrepForJob,
  NoctisInterviewQuestion
} from "@/lib/noctis-interview-prep"

interface CareerTwinModalProps {
  isOpen: boolean
  onClose: () => void
  job: any | null
}

const ROUND_FILTERS = [
  { id: 'all', label: 'All 25 Questions', short: 'All (25)' },
  { id: 'technical_clinical', label: 'Round 1: Role & Clinical/Technical (Q1–6)', short: 'R1: Role & Tech (6)' },
  { id: 'scenario_troubleshooting', label: 'Round 2: Live Scenarios & Triage (Q7–12)', short: 'R2: Scenarios (6)' },
  { id: 'compliance_safety', label: 'Round 3: Credentials & Safety (Q13–17)', short: 'R3: Compliance (5)' },
  { id: 'behavioral_star', label: 'Round 4: Behavioral STAR (Q18–21)', short: 'R4: STAR (4)' },
  { id: 'employer_strategy', label: 'Round 5: Fit, Salary & Closing (Q22–25)', short: 'R5: Closing (4)' }
] as const

export function CareerTwinModal({
  isOpen,
  onClose,
  job
}: CareerTwinModalProps) {
  const [activeTab, setActiveTab] = useState<'interview' | 'study_guide' | 'match' | 'gatekeeper'>('interview')
  const [selectedRound, setSelectedRound] = useState<string>('all')

  // Generate 25 job-specific Noctis questions dynamically for whichever job is selected
  const prepPack = useMemo(() => generateNoctisInterviewPrepForJob(job), [job])

  const filteredQuestions = useMemo(() => {
    if (selectedRound === 'all') return prepPack.questions
    return prepPack.questions.filter((q) => q.round === selectedRound)
  }, [prepPack.questions, selectedRound])

  // Mock Interview Simulator State
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(1)
  const [userAnswer, setUserAnswer] = useState("")
  const [showCoachingBlueprint, setShowCoachingBlueprint] = useState(true)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluatedScores, setEvaluatedScores] = useState<Record<number, { score: number; feedback: string }>>({})
  const [copiedGuide, setCopiedGuide] = useState(false)
  const [downloadedPack, setDownloadedPack] = useState(false)

  // Reset to Question 1 when job changes
  useEffect(() => {
    setCurrentQuestionNumber(1)
    setSelectedRound('all')
    setUserAnswer("")
    setEvaluatedScores({})
    setActiveTab('interview')
  }, [job?.id, job?.title])

  const activeQuestion: NoctisInterviewQuestion =
    prepPack.questions.find((q) => q.number === currentQuestionNumber) ||
    filteredQuestions[0] ||
    prepPack.questions[0]

  const currentEvaluation = evaluatedScores[activeQuestion.number] || null

  const handleSelectQuestion = (num: number) => {
    setCurrentQuestionNumber(num)
    setUserAnswer("")
  }

  const handleEvaluateAnswer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userAnswer.trim()) return

    setIsEvaluating(true)
    setTimeout(() => {
      const wordCount = userAnswer.trim().split(/\s+/).length
      const computedScore = wordCount >= 35 ? 96 : wordCount >= 18 ? 91 : 86
      const feedback =
        wordCount >= 25
          ? `Strong, interview-ready response for ${prepPack.company}. You clearly addressed ${activeQuestion.keyTalkingPoints[0].toLowerCase()}. Noctis Tip: Quantify one specific outcome or safety metric from your past shifts/projects to lock in a top-1% panel impression.`
          : `Good foundation! To turn this into a 95+ panel answer for "${prepPack.jobTitle}", expand your example using the 3 Noctis Talking Points—especially: "${activeQuestion.keyTalkingPoints[0]}".`

      setEvaluatedScores((prev) => ({
        ...prev,
        [activeQuestion.number]: { score: computedScore, feedback }
      }))
      setIsEvaluating(false)
    }, 550)
  }

  const handlePrevQuestion = () => {
    const idx = filteredQuestions.findIndex((q) => q.number === activeQuestion.number)
    if (idx > 0) {
      handleSelectQuestion(filteredQuestions[idx - 1].number)
    } else if (activeQuestion.number > 1) {
      handleSelectQuestion(activeQuestion.number - 1)
    }
  }

  const handleNextQuestion = () => {
    const idx = filteredQuestions.findIndex((q) => q.number === activeQuestion.number)
    if (idx >= 0 && idx < filteredQuestions.length - 1) {
      handleSelectQuestion(filteredQuestions[idx + 1].number)
    } else if (activeQuestion.number < prepPack.questions.length) {
      handleSelectQuestion(activeQuestion.number + 1)
    }
  }

  const buildStudyGuideText = () => {
    const lines: string[] = [
      `================================================================================`,
      `NOCTIS™ CAREERTWIN — 25-QUESTION INTERVIEW PREPARATION MASTER GUIDE`,
      `================================================================================`,
      `Target Role:    ${prepPack.jobTitle}`,
      `Employer:       ${prepPack.company}`,
      `Location:       ${prepPack.location}`,
      `Compensation:   ${prepPack.salaryRange}`,
      `Core Skills:    ${prepPack.primarySkills} | ${prepPack.secondarySkills}`,
      `--------------------------------------------------------------------------------`,
      `EXECUTIVE BRIEFING:`,
      prepPack.executiveBriefing,
      `================================================================================`,
      ``
    ]

    prepPack.questions.forEach((q) => {
      lines.push(`QUESTION #${q.number} [${q.roundLabel} · ${q.difficulty}]`)
      lines.push(`"${q.question}"`)
      lines.push(`• Why the Hiring Panel Asks This: ${q.interviewerIntent}`)
      lines.push(`• Key Talking Points to Hit:`)
      q.keyTalkingPoints.forEach((pt, idx) => {
        lines.push(`   ${idx + 1}) ${pt}`)
      })
      lines.push(`• Noctis Model Sample Answer:`)
      lines.push(`  ${q.sampleAnswer}`)
      lines.push(`--------------------------------------------------------------------------------`)
      lines.push(``)
    })

    return lines.join('\n')
  }

  const handleDownloadStudyGuide = () => {
    if (typeof window === 'undefined') return
    const text = buildStudyGuideText()
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const safeTitle = prepPack.jobTitle.replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 40)
    link.href = url
    link.download = `Noctis_25_Interview_Questions_${safeTitle}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setDownloadedPack(true)
    setTimeout(() => setDownloadedPack(false), 4000)
  }

  const handleCopyAllQuestions = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(buildStudyGuideText()).catch(() => {})
      setCopiedGuide(true)
      setTimeout(() => setCopiedGuide(false), 3000)
    }
  }

  const practicedCount = Object.keys(evaluatedScores).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden sm:rounded-2xl">
        {/* Top Header */}
        <DialogHeader className="border-b border-zinc-800 bg-gradient-to-r from-[#14181C] via-[#1B222C] to-[#0F2942] px-5 sm:px-6 py-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-xs">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-sm sm:text-base font-bold text-white">
                    Noctis™ CareerTwin Interview Prep Studio
                  </DialogTitle>
                  <span className="rounded-full bg-amber-500/20 border border-amber-400/40 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                    ✨ {prepPack.questions.length} Tailored Interview Questions Ready
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-0.5 line-clamp-1">
                  Prepared for: <strong className="text-white">{prepPack.jobTitle}</strong> at <strong className="text-sky-300">{prepPack.company}</strong> ({prepPack.location})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyAllQuestions}
                className="rounded-full bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy all 25 questions and Noctis sample answers"
              >
                {copiedGuide ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedGuide ? "Copied 25 Q&As!" : "Copy All 25"}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadStudyGuide}
                className="rounded-full bg-[#0A66C2] hover:bg-[#004182] px-3.5 py-1.5 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Download complete 25-question interview prep guide"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{downloadedPack ? "✓ Guide Downloaded" : "Download 25-Q Guide"}</span>
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Sub-Tabs */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 sm:px-6 pt-2.5 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 gap-2 overflow-x-auto text-xs font-bold">
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('interview')}
              className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'interview'
                  ? "border-[#0A66C2] text-[#0A66C2] dark:text-sky-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <span>🎙️ Interactive 25-Question Simulator</span>
              <span className="rounded-full bg-[#0A66C2]/10 text-[#0A66C2] dark:bg-sky-500/20 dark:text-sky-300 px-2 py-0.5 text-[10px]">
                {practicedCount}/{prepPack.questions.length} Practiced
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('study_guide')}
              className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'study_guide'
                  ? "border-[#0A66C2] text-[#0A66C2] dark:text-sky-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Full 25-Question Study Sheet (All Q&amp;As)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('match')}
              className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
                activeTab === 'match'
                  ? "border-[#0A66C2] text-[#0A66C2] dark:text-sky-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              🎯 Fit Analysis ({prepPack.matchScore}% Match)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gatekeeper')}
              className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
                activeTab === 'gatekeeper'
                  ? "border-[#0A66C2] text-[#0A66C2] dark:text-sky-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              🛡️ Recruiter Gatekeeper
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 max-h-[76vh] overflow-y-auto text-xs">
          {/* =================================================================== */}
          {/* TAB 1: INTERACTIVE 25-QUESTION SIMULATOR WITH NOCTIS COACHING       */}
          {/* =================================================================== */}
          {activeTab === 'interview' && (
            <div className="space-y-4">
              {/* Noctis Executive Briefing Banner */}
              <div className="rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50/90 via-sky-50/70 to-emerald-50/80 p-3.5 dark:border-amber-800/60 dark:from-amber-950/30 dark:via-sky-950/30 dark:to-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 text-xs">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Noctis™ Interview Intelligence — {prepPack.questions.length} Role-Specific Questions</span>
                  </div>
                  <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {prepPack.executiveBriefing}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('study_guide')}
                  className="shrink-0 rounded-lg bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 px-3 py-1.5 text-[11px] font-bold text-amber-900 dark:text-amber-300 hover:bg-amber-50 cursor-pointer"
                >
                  View All 25 Q&amp;As at Once →
                </button>
              </div>

              {/* 5-Round Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {ROUND_FILTERS.map((rf) => {
                  const isSelected = selectedRound === rf.id
                  return (
                    <button
                      key={rf.id}
                      type="button"
                      onClick={() => {
                        setSelectedRound(rf.id)
                        const firstInRound =
                          rf.id === 'all'
                            ? prepPack.questions[0]
                            : prepPack.questions.find((q) => q.round === rf.id)
                        if (firstInRound) handleSelectQuestion(firstInRound.number)
                      }}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? "bg-[#0A66C2] text-white shadow-2xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                      }`}
                    >
                      {rf.short}
                    </button>
                  )
                })}
              </div>

              {/* 25-Question Number Navigator Grid */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">
                    Jump to Any Question (1–{prepPack.questions.length}):
                  </span>
                  <span>
                    Green = Graded by Noctis ({practicedCount}/{prepPack.questions.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {prepPack.questions.map((q) => {
                    const isCurrent = q.number === activeQuestion.number
                    const isGraded = Boolean(evaluatedScores[q.number])
                    const isInFilter = selectedRound === 'all' || q.round === selectedRound
                    return (
                      <button
                        key={q.number}
                        type="button"
                        onClick={() => handleSelectQuestion(q.number)}
                        title={`Q${q.number}: ${q.question}`}
                        className={`h-7 min-w-[28px] px-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isCurrent
                            ? "bg-[#0A66C2] text-white ring-2 ring-[#0A66C2]/40 shadow-xs"
                            : isGraded
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                            : isInFilter
                            ? "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:border-[#0A66C2]"
                            : "bg-zinc-100/60 dark:bg-zinc-800/40 text-zinc-400 border border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        {q.number}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Active Question Card */}
              <div className="rounded-xl bg-white dark:bg-zinc-900 p-4 sm:p-5 border-2 border-[#0A66C2]/30 dark:border-sky-800/60 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-[#0A66C2] px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                      Question {activeQuestion.number} of {prepPack.questions.length}
                    </span>
                    <span className="rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 text-[11px] font-bold text-purple-800 dark:text-purple-300">
                      {activeQuestion.roundLabel}
                    </span>
                    <span className="rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                      {activeQuestion.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevQuestion}
                      disabled={activeQuestion.number === 1}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      disabled={activeQuestion.number === prepPack.questions.length}
                      className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] px-3 py-1 text-[11px] font-bold text-white disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 leading-snug">
                  &ldquo;{activeQuestion.question}&rdquo;
                </h3>

                {/* Why the Hiring Panel Asks This + Key Talking Points */}
                <div className="rounded-lg bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-[#0A66C2]" />
                      <span>Why {prepPack.company} Asks This Question:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCoachingBlueprint((prev) => !prev)}
                      className="text-[11px] font-bold text-[#0A66C2] dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      {showCoachingBlueprint ? "Hide Coaching Tips" : "Show Coaching Tips & Model Answer"}
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-700 dark:text-zinc-300">
                    {activeQuestion.interviewerIntent}
                  </p>

                  {showCoachingBlueprint && (
                    <div className="pt-2 border-t border-sky-200/70 dark:border-sky-800/60 space-y-2">
                      <p className="font-bold text-[11px] text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                        <span>3 Key Talking Points to Hit in Your Answer:</span>
                      </p>
                      <ul className="space-y-1 pl-1">
                        {activeQuestion.keyTalkingPoints.map((pt, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-700 dark:text-zinc-300">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="rounded-lg bg-white dark:bg-zinc-900 p-2.5 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            ✨ Noctis Recommended Model Answer Blueprint:
                          </span>
                          <button
                            type="button"
                            onClick={() => setUserAnswer(activeQuestion.sampleAnswer.replace(/^"|"$/g, ''))}
                            className="text-[10px] font-bold text-[#0A66C2] hover:underline cursor-pointer"
                          >
                            Load into My Answer Box ↓
                          </button>
                        </div>
                        <p className="text-[11px] text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                          {activeQuestion.sampleAnswer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Candidate Practice Answer Box */}
                <form onSubmit={handleEvaluateAnswer} className="space-y-2.5 pt-1">
                  <label className="block font-bold text-xs text-zinc-800 dark:text-zinc-200">
                    Practice Your Response for Question #{activeQuestion.number}:
                  </label>
                  <textarea
                    rows={4}
                    placeholder={`Type your interview response for "${prepPack.jobTitle}" here (or click "Use Noctis Sample Answer" below)...`}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 p-3 text-xs text-zinc-900 focus:border-[#0A66C2] focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setUserAnswer(activeQuestion.sampleAnswer.replace(/^"|"$/g, ''))}
                      className="rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3 py-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 cursor-pointer"
                    >
                      ✨ Use Noctis Sample Answer for Q#{activeQuestion.number}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={!userAnswer.trim() || isEvaluating}
                        className="flex items-center gap-1.5 rounded-full bg-[#0A66C2] px-5 py-2 font-bold text-white hover:bg-[#004182] disabled:opacity-40 shadow-xs cursor-pointer"
                      >
                        {isEvaluating ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Grading with Noctis AI...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Grade My Answer
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Noctis Evaluation Feedback */}
                {currentEvaluation && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/30 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                        <Award className="h-4 w-4 text-emerald-600" />
                        Noctis Score for Q#{activeQuestion.number}: {currentEvaluation.score} / 100 (Interview Ready ✓)
                      </span>
                      {activeQuestion.number < prepPack.questions.length && (
                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="rounded-full bg-emerald-600 px-4 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 cursor-pointer"
                        >
                          Continue to Question #{activeQuestion.number + 1} →
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {currentEvaluation.feedback}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 2: FULL 25-QUESTION STUDY SHEET (ALL QUESTIONS & ANSWERS)       */}
          {/* =================================================================== */}
          {activeTab === 'study_guide' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Complete {prepPack.questions.length}-Question Interview Prep Guide — {prepPack.jobTitle}
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Review all {prepPack.questions.length} Noctis questions, interviewer rubrics, and sample answers before your interview with {prepPack.company}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadStudyGuide}
                  className="rounded-full bg-[#0A66C2] hover:bg-[#004182] px-4 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Printable Study Guide (.txt)</span>
                </button>
              </div>

              <div className="space-y-3">
                {prepPack.questions.map((q) => (
                  <div
                    key={q.number}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-md bg-[#0A66C2] px-2 py-0.5 text-[11px] font-extrabold text-white">
                          Q#{q.number}
                        </span>
                        <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300">
                          {q.roundLabel}
                        </span>
                        <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
                          {q.difficulty}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleSelectQuestion(q.number)
                          setActiveTab('interview')
                        }}
                        className="rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-3 py-0.5 text-[11px] font-bold text-[#0A66C2] dark:text-sky-300 hover:bg-sky-100 cursor-pointer"
                      >
                        Practice in Simulator →
                      </button>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                      &ldquo;{q.question}&rdquo;
                    </h4>

                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      <strong className="text-zinc-700 dark:text-zinc-300">Panel Intent:</strong> {q.interviewerIntent}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
                      {q.keyTalkingPoints.map((pt, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-2 border border-zinc-200/70 dark:border-zinc-700/60 text-[11px] text-zinc-700 dark:text-zinc-300 flex items-start gap-1.5"
                        >
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 p-2.5 text-[11px] text-zinc-700 dark:text-zinc-300">
                      <strong className="text-emerald-800 dark:text-emerald-300 block mb-0.5">
                        Noctis Sample Answer:
                      </strong>
                      <span className="italic">{q.sampleAnswer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 3: DYNAMIC ROLE FIT & CREDENTIAL ANALYSIS                       */}
          {/* =================================================================== */}
          {activeTab === 'match' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 dark:border-sky-900/50 dark:bg-sky-950/30 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-[#0A66C2] dark:text-sky-400">
                    {prepPack.enclaveIcon} {prepPack.enclaveName}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                    {prepPack.jobTitle}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {prepPack.company} · {prepPack.location} · <strong className="text-emerald-600">{prepPack.salaryRange}</strong>
                  </p>
                </div>
                <div className="rounded-xl bg-[#0A66C2] px-4 py-2 text-center text-white shrink-0">
                  <span className="text-lg font-black">{prepPack.matchScore}%</span>
                  <span className="text-[9px] block uppercase font-bold">Match Score</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="font-bold text-emerald-600 text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Core Competency Match
                  </span>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-1">
                    {prepPack.primarySkills} &amp; {prepPack.secondarySkills} verified.
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="font-bold text-emerald-600 text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {prepPack.badgeText}
                  </span>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-1">
                    Meets employer clinical, trade, and regulatory readiness benchmarks.
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="font-bold text-emerald-600 text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Compensation Alignment
                  </span>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-1">
                    Band ({prepPack.salaryRange}) aligns with verified specialist market rates.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
                <p className="font-bold text-zinc-900 dark:text-zinc-100">
                  Noctis™ Strategic Interview Advice for {prepPack.company}
                </p>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {prepPack.executiveBriefing} Practice at least 5 questions from Round 1 (Role Mastery) and Round 2 (Live Scenarios) using the simulator tab to maximize your offer conversion rate.
                </p>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 4: RECRUITER GATEKEEPER                                         */}
          {/* =================================================================== */}
          {activeTab === 'gatekeeper' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  Autonomous Recruiter InMail Gatekeeper Rules
                </h4>
                <p className="text-xs text-zinc-500">
                  CareerTwin screens incoming recruiter messages for {prepPack.jobTitle} roles and prioritizes verified direct-hire employers.
                </p>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Target Compensation Filter ({prepPack.salaryRange})
                    </span>
                    <span className="font-bold text-emerald-600">Active ✓</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Fast-Track Interview Scheduling with Hiring Managers
                    </span>
                    <span className="font-bold text-emerald-600">Active ✓</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Auto-Attach Verified Credentials ({prepPack.primarySkills})
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
