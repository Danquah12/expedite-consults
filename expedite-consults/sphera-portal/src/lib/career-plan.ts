// Career plan tracking for ConnectLn: turns a Noctis "How to become…" reply into a checklist
// and keeps the member's progress in this browser (localStorage). No server storage.

export interface PlanStep { title: string; duration?: string; done: boolean }
export interface CareerPlan { id: string; title: string; savedAt: number; steps: PlanStep[] }

const KEY = 'connectln_career_plans_v1'

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9\u00c0-\uffff]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80)

/** Reads the title and numbered steps from a Noctis pathway reply. Returns null if the reply has no step list. */
export function parsePlanFromReply(text: string): CareerPlan | null {
  const head = /^#\s*🧭\s*[^:\n]+:\s*(.+)$/m.exec(text || '')
  if (!head) return null
  const steps: PlanStep[] = []
  for (const line of text.split(/\r?\n/)) {
    const m = /^\s*\d+\.\s+\*\*(.+?)\*\*(?:\s+_\((.+?)\)_)?/.exec(line)
    if (m) steps.push({ title: m[1].trim(), duration: m[2]?.trim(), done: false })
  }
  if (steps.length < 3) return null
  const title = head[1].replace(/\s*\(.*?\)\s*/g, ' ').trim()
  return { id: slug(title), title, savedAt: Date.now(), steps }
}

export function loadPlans(): CareerPlan[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.filter((p) => p && p.id && Array.isArray(p.steps)) : []
  } catch {
    return []
  }
}

function persist(plans: CareerPlan[]) {
  try { window.localStorage.setItem(KEY, JSON.stringify(plans)) } catch {}
}

/** Saves a plan; if it already exists the member's ticked steps are kept. */
export function savePlan(plan: CareerPlan): CareerPlan[] {
  const plans = loadPlans()
  const existing = plans.find((p) => p.id === plan.id)
  if (existing) {
    const done = new Map(existing.steps.map((s) => [s.title, s.done]))
    existing.steps = plan.steps.map((s) => ({ ...s, done: done.get(s.title) ?? false }))
  } else {
    plans.unshift(plan)
  }
  persist(plans)
  return plans
}

export function toggleStep(planId: string, index: number): CareerPlan[] {
  const plans = loadPlans()
  const p = plans.find((x) => x.id === planId)
  if (p && p.steps[index]) p.steps[index].done = !p.steps[index].done
  persist(plans)
  return plans
}

export function removePlan(planId: string): CareerPlan[] {
  const plans = loadPlans().filter((p) => p.id !== planId)
  persist(plans)
  return plans
}

export const planProgress = (p: CareerPlan) => {
  const done = p.steps.filter((s) => s.done).length
  return { done, total: p.steps.length, pct: p.steps.length ? Math.round((done / p.steps.length) * 100) : 0 }
}
