'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Trash2, Sparkles, Loader2, ChevronRight, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QUIZ, scoreCareers, askTitle, type QuizAnswers, type QuizMatch } from '@/lib/career-quiz'
import { loadPlans, parsePlanFromReply, planProgress, removePlan, savePlan, toggleStep, type CareerPlan } from '@/lib/career-plan'

interface Props {
  language: string
  /** Sends a question to the Noctis chat and switches to it. */
  onAsk: (question: string) => void
  onNavigateTab: (tab: string) => void
  onClose: () => void
  initialSub?: 'plans' | 'quiz'
}

export function CareerPlanner({ language, onAsk, onNavigateTab, onClose, initialSub = 'plans' }: Props) {
  const [sub, setSub] = useState<'plans' | 'quiz'>(initialSub)
  const [plans, setPlans] = useState<CareerPlan[]>([])
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [step, setStep] = useState(0)
  const [results, setResults] = useState<QuizMatch[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [note, setNote] = useState('')

  useEffect(() => { setPlans(loadPlans()) }, [])

  const planCareer = async (title: string) => {
    setBusy(title); setNote('')
    try {
      const res = await fetch('/api/connectin/noctis', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: `How do I become a ${askTitle(title)}?`, language }),
      })
      const data = await res.json().catch(() => null)
      const plan = data?.text ? parsePlanFromReply(data.text) : null
      if (!plan) { setNote('Could not build a plan for that career right now. Try asking in the chat.'); return }
      setPlans(savePlan(plan))
      setSub('plans')
      setNote(`Saved “${plan.title}” to My Career Plan.`)
    } catch {
      setNote('Noctis is unreachable right now. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  const q = QUIZ[step]
  const pick = (optionId: string) => {
    const next = { ...answers, [q.id]: optionId }
    setAnswers(next)
    if (step + 1 < QUIZ.length) setStep(step + 1)
    else setResults(scoreCareers(next))
  }
  const restart = () => { setAnswers({}); setStep(0); setResults(null) }

  const goJobs = (title: string) => {
    try { window.sessionStorage.setItem('connectln_jobs_prefill', askTitle(title).toLowerCase()) } catch {}
    onClose()
    onNavigateTab('jobs')
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-[#1D2226]">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        {(['plans', 'quiz'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSub(s)}
            className={cn('px-3 py-1 rounded-md text-xs font-semibold cursor-pointer', sub === s ? 'bg-[#0A66C2] text-white' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800')}
          >
            {s === 'plans' ? `📋 My Career Plan (${plans.length})` : '🧭 Career Quiz'}
          </button>
        ))}
      </div>
      {note && <div className="px-4 py-2 text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-b border-emerald-200 dark:border-emerald-900">{note}</div>}

      <div className="flex-1 overflow-y-auto p-4 text-xs space-y-4">
        {sub === 'plans' && (
          plans.length === 0 ? (
            <div className="text-center text-zinc-500 dark:text-zinc-400 py-10 space-y-3">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">No saved career plans yet</p>
              <p>Ask Noctis “How do I become a …?” and press <b>Save to My Career Plan</b>, or take the quiz to find careers that fit you.</p>
              <button onClick={() => setSub('quiz')} className="rounded-md bg-[#0A66C2] text-white px-3 py-1.5 font-semibold cursor-pointer">Take the Career Quiz</button>
            </div>
          ) : (
            plans.map((p) => {
              const pr = planProgress(p)
              return (
                <div key={p.id} className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-3 space-y-2 bg-zinc-50 dark:bg-zinc-900/60">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{p.title}</p>
                      <p className="text-[10px] text-zinc-500">{pr.done} of {pr.total} steps done · {pr.pct}%</p>
                    </div>
                    <button onClick={() => setPlans(removePlan(p.id))} className="text-zinc-400 hover:text-red-500 cursor-pointer" title="Remove plan"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${pr.pct}%` }} /></div>
                  <ul className="space-y-1">
                    {p.steps.map((s, i) => (
                      <li key={i}>
                        <button onClick={() => setPlans(toggleStep(p.id, i))} className="flex items-start gap-2 text-left w-full cursor-pointer">
                          {s.done ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <Circle className="h-4 w-4 text-zinc-400 shrink-0" />}
                          <span className={cn(s.done && 'line-through text-zinc-400')}>{s.title}{s.duration ? <span className="text-zinc-400"> · {s.duration}</span> : null}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button onClick={() => onAsk(`What should I do next to become a ${askTitle(p.title)}? I have finished ${pr.done} of ${pr.total} steps.`)} className="rounded-md bg-[#0A66C2] text-white px-2.5 py-1 text-[10px] font-semibold cursor-pointer">Ask Noctis about this career</button>
                    <button onClick={() => goJobs(p.title)} className="rounded-md border border-zinc-300 dark:border-zinc-600 px-2.5 py-1 text-[10px] font-semibold cursor-pointer">Browse jobs</button>
                  </div>
                </div>
              )
            })
          )
        )}

        {sub === 'quiz' && !results && (
          <div className="max-w-xl mx-auto space-y-3">
            <p className="text-[10px] uppercase font-bold text-zinc-500">Question {step + 1} of {QUIZ.length}</p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{q.text}</p>
            <div className="grid gap-2">
              {q.options.map((o) => (
                <button key={o.id} onClick={() => pick(o.id)} className="text-left rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-[#0A66C2] hover:bg-blue-50 dark:hover:bg-zinc-800 px-3 py-2 cursor-pointer flex items-center justify-between">
                  <span>{o.label}</span><ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                </button>
              ))}
            </div>
            {step > 0 && <button onClick={() => setStep(step - 1)} className="text-[11px] text-zinc-500 underline cursor-pointer">← Back</button>}
          </div>
        )}

        {sub === 'quiz' && results && (
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-[#0A66C2]" /> Careers worth exploring</p>
              <button onClick={restart} className="text-[11px] text-zinc-500 flex items-center gap-1 cursor-pointer"><RotateCcw className="h-3 w-3" /> Retake</button>
            </div>
            <p className="text-[10px] text-zinc-500">Suggestions based on your answers — not guarantees. Open a career to see requirements, steps and jobs.</p>
            {results.length === 0 && <p>No strong matches. Try different answers.</p>}
            {results.map((m) => (
              <div key={m.id} className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-3 space-y-1.5">
                <p className="font-bold text-zinc-900 dark:text-zinc-100">{m.title}</p>
                <p className="text-[10px] text-zinc-500">{m.field}{m.reasons.length ? ` · ${m.reasons.slice(0, 2).join(' · ')}` : ''}</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => onAsk(`How do I become a ${askTitle(m.title)}?`)} className="rounded-md bg-[#0A66C2] text-white px-2.5 py-1 text-[10px] font-semibold cursor-pointer">How to become</button>
                  <button disabled={busy === m.title} onClick={() => planCareer(m.title)} className="rounded-md border border-zinc-300 dark:border-zinc-600 px-2.5 py-1 text-[10px] font-semibold cursor-pointer flex items-center gap-1">
                    {busy === m.title ? <Loader2 className="h-3 w-3 animate-spin" /> : null} Save plan
                  </button>
                  <button onClick={() => goJobs(m.title)} className="rounded-md border border-zinc-300 dark:border-zinc-600 px-2.5 py-1 text-[10px] font-semibold cursor-pointer">Browse jobs</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
