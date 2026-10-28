import { NextResponse } from 'next/server'
import { connectLnGrounding } from '@/lib/connectln-knowledge'

export const runtime = 'nodejs'
export const maxDuration = 30

const NOCTIS_API_URL = process.env.NOCTIS_API_URL || 'https://dstrike.app/api/noctis'

type Turn = { role: 'user' | 'assistant'; content: string }

/**
 * POST /api/connectin/noctis
 * body: { question: string, history?: Turn[], profile?: { name?, profession? }, language?: string }
 * Asks Noctis (server-to-server) and returns { text } for display inside ConnectLn.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    question?: string
    history?: Turn[]
    profile?: { name?: string; profession?: string }
    language?: string
  } | null

  const question = (body?.question || '').trim().slice(0, 2000)
  if (!question) return NextResponse.json({ error: 'Write a question first.' }, { status: 400 })

  const facts = connectLnGrounding(question)
  const who = [body?.profile?.name, body?.profile?.profession].filter(Boolean).join(', ')
  // Noctis weights the user turn, so the facts travel inside it.
  const isCareerAsk = /\b(become|becoming|career\s+(path|pathway|as|in)|path(way)?\s+to|what\s+does\s+it\s+take\s+to\s+be|how\s+much\s+(does|do|can)\s+.*(make|earn|cost)|salary|how\s+long\s+(does|to|will)|requirements?\s+(to|for)|interview\s+questions|resume\s+tips|skills\s+(does|do|needed)|what\s+does\s+an?\s+.*\s+do|careers?\s+(similar|like|good\s+for)|what\s+(careers|jobs)|jobs?\s+(in|for)\s+|switch\s+(to|from)|difference\s+between|good\s+career|where\s+(can|do)\s+i\s+(train|study)|steps?\s+to\s+(be|become)|how\s+to\s+start\s+(as|a\s+career))\b/i.test(question)
  // Career-pathway questions are answered from Noctis's repository, so send them unwrapped.
  const grounded = isCareerAsk
    ? question
    : `You are Noctis, answering inside ConnectLn (https://www.connectln.app), a professional network.\n` +
      `If the question is about ConnectLn, answer ONLY from these facts and do not invent features:\n${facts}\n\n` +
      (who ? `The member asking: ${who}.\n` : '') +
      `If the question is not about ConnectLn, answer it normally.\n\nQuestion: ${question}`

  const history = (Array.isArray(body?.history) ? body!.history! : [])
    .filter((t) => (t?.role === 'user' || t?.role === 'assistant') && typeof t.content === 'string')
    .slice(-6)
    .map((t) => ({ role: t.role, content: t.content.slice(0, 1500) }))

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 25000)
  try {
    const res = await fetch(NOCTIS_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(process.env.NOCTIS_API_KEY ? { 'x-noctis-key': process.env.NOCTIS_API_KEY } : {})
      },
      body: JSON.stringify({
        turns: [...history, { role: 'user', content: grounded }],
        language: body?.language || 'English',
        context: 'ConnectLn'
      }),
      signal: ctrl.signal,
      cache: 'no-store'
    })
    if (!res.ok) return NextResponse.json({ error: `Noctis returned ${res.status}` }, { status: 502 })
    const data = (await res.json()) as { text?: string; error?: string }
    if (!data?.text) return NextResponse.json({ error: data?.error || 'Noctis gave no answer.' }, { status: 502 })
    return NextResponse.json({ text: data.text, source: 'noctis' }, { headers: { 'cache-control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Noctis is unreachable right now.' }, { status: 504 })
  } finally {
    clearTimeout(timer)
  }
}
