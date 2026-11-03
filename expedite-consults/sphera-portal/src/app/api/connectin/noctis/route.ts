import { NextResponse } from 'next/server'
import { connectLnGrounding } from '@/lib/connectln-knowledge'

export const runtime = 'nodejs'
export const maxDuration = 30

const NOCTIS_API_URL = process.env.NOCTIS_API_URL || 'https://dstrike.app/api/noctis'

type Turn = { role: 'user' | 'assistant'; content: string }

export interface NoctisInboxThreadDigest {
  id: string
  title: string
  subtitle?: string
  channelType?: string
  unreadCount?: number
  isUnreadOrPending?: boolean
  dateHeading?: string
  lastMessage?: string
  lastMessageTime?: string
  attachments?: string[]
  messagesCount?: number
  recentMessages?: Array<{ sender: string; text: string; timestamp: string }>
}

function extractDateOnlyFromLabel(label?: string, dateHeading?: string): string {
  if (dateHeading && dateHeading.trim()) return dateHeading.trim()
  if (!label) return 'Recent'
  const parts = label.split('·').map((s) => s.trim())
  if (parts.length >= 1 && /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+/i.test(parts[0])) {
    return parts[0]
  }
  return label.trim() || 'Recent'
}

function buildDateGroupedUnreadSummary(
  memberName: string,
  threads: NoctisInboxThreadDigest[],
  customQuestion?: string
): { fullText: string; dateSummaries: Record<string, string> } {
  const firstName = (memberName || 'Member').trim().split(/\s+/)[0] || 'Member'
  const unreadTargets = threads.filter((t) => t.isUnreadOrPending || (t.unreadCount || 0) > 0)
  const targetList = unreadTargets.length > 0 ? unreadTargets : threads

  const byDate = new Map<string, NoctisInboxThreadDigest[]>()
  for (const t of targetList) {
    const dKey = extractDateOnlyFromLabel(t.lastMessageTime, t.dateHeading)
    const arr = byDate.get(dKey) || []
    arr.push(t)
    byDate.set(dKey, arr)
  }

  const dateSummaries: Record<string, string> = {}
  const dateBlocks: string[] = []

  for (const [dateKey, items] of byDate.entries()) {
    const itemSummaries = items.map((t) => {
      const attNote =
        t.attachments && t.attachments.length > 0
          ? ` [Attached: ${t.attachments.join(', ')}]`
          : ''
      const timeOnly = (t.lastMessageTime || '').includes('·')
        ? (t.lastMessageTime || '').split('·')[1]?.trim()
        : t.lastMessageTime || ''
      return `${t.title}${timeOnly ? ` (${timeOnly})` : ''}: "${(t.lastMessage || '').slice(0, 130)}"${attNote}`
    })

    const singleDateSummary =
      `On ${dateKey}, you received ${items.length} ${items.length === 1 ? 'email/message' : 'emails/messages'} from ${items.map((x) => x.title).join(', ')}. ` +
      itemSummaries.join(' · ')

    dateSummaries[dateKey] = singleDateSummary
    dateBlocks.push(`📅 ${dateKey} (${items.length} ${items.length === 1 ? 'Unread Email' : 'Unread Emails'}):\n` + items.map((t) => {
      const attNote = t.attachments && t.attachments.length > 0 ? ` (📎 Attached: ${t.attachments.join(', ')})` : ''
      return `  • ${t.title} (${t.subtitle || 'Verified Member'}) at ${t.lastMessageTime || dateKey}: "${(t.lastMessage || '').slice(0, 150)}"${attNote}`
    }).join('\n'))
  }

  if (customQuestion && customQuestion.trim()) {
    return {
      fullText:
        `Noctis Unread Email Search & Date Summary for ${firstName} ("${customQuestion.trim()}"):\n\n` +
        `Found ${targetList.length} unread/pending emails across ${byDate.size} ${byDate.size === 1 ? 'date' : 'dates'}:\n\n` +
        dateBlocks.join('\n\n'),
      dateSummaries,
    }
  }

  return {
    fullText:
      `Noctis searched your ConnectLn mailbox and found ${targetList.length} unread/pending emails across ${byDate.size} arrival ${byDate.size === 1 ? 'date' : 'dates'}, summarized chronologically below:\n\n` +
      dateBlocks.join('\n\n'),
    dateSummaries,
  }
}

/**
 * POST /api/connectin/noctis
 * body: {
 *   mode?: 'inbox_briefing' | 'qa',
 *   question?: string,
 *   inboxThreads?: NoctisInboxThreadDigest[],
 *   history?: Turn[],
 *   profile?: { name?: string; profession?: string },
 *   language?: string
 * }
 * Connects to Noctis (server-to-server) to explain the contents of the member's inbox or answer questions.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    mode?: 'inbox_briefing' | 'qa'
    question?: string
    inboxThreads?: NoctisInboxThreadDigest[]
    history?: Turn[]
    profile?: { name?: string; profession?: string }
    language?: string
  } | null

  const inboxThreads = Array.isArray(body?.inboxThreads) ? body!.inboxThreads!.slice(0, 25) : []
  const memberName = body?.profile?.name || 'ConnectLn Member'
  const isInboxBriefing = body?.mode === 'inbox_briefing' || inboxThreads.length > 0

  if (isInboxBriefing) {
    const customQ = (body?.question || '').trim()
    const unreadOrPending = inboxThreads.filter((t) => t.isUnreadOrPending || (t.unreadCount || 0) > 0)
    const targetThreads = unreadOrPending.length > 0 ? unreadOrPending : inboxThreads

    const digestLines = targetThreads
      .map((t, i) => {
        const atts = t.attachments && t.attachments.length > 0 ? ` | Attachments: ${t.attachments.join(', ')}` : ''
        const dateHeading = extractDateOnlyFromLabel(t.lastMessageTime, t.dateHeading)
        return `${i + 1}. [Date: ${dateHeading}] [${t.channelType || 'Direct'}] From: ${t.title} (${t.subtitle || 'Verified Member'}) — Received: ${t.lastMessageTime || dateHeading} — Content: "${(t.lastMessage || '').slice(0, 180)}"${atts}`
      })
      .join('\n')

    const { fullText: fallbackSummary, dateSummaries } = buildDateGroupedUnreadSummary(
      memberName,
      inboxThreads,
      customQ
    )

    const noctisPrompt =
      `You are Noctis, the AI Unread Email & Inbox Intelligence assistant inside ConnectLn (https://www.connectln.app).\n` +
      `The signed-in member is ${memberName}${body?.profile?.profession ? ` (${body.profile.profession})` : ''}.\n` +
      `Below are the unread/pending emails found in ${memberName}'s ConnectLn Inbox, along with the exact dates they arrived:\n${digestLines}\n\n` +
      (customQ
        ? `Answer the member's question about their unread emails grouped by the dates they arrived based ONLY on the inbox contents above: "${customQ}"`
        : `Search and summarize these unread emails grouped chronologically by the exact calendar dates they arrived (e.g., Nov 2, 2026, Oct 26, 2026, Oct 23, 2026). For each date, clearly state who sent the email/message, what they wrote or attached, and the recommended next step.`)

    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 14000)
    try {
      const res = await fetch(NOCTIS_API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(process.env.NOCTIS_API_KEY ? { 'x-noctis-key': process.env.NOCTIS_API_KEY } : {})
        },
        body: JSON.stringify({
          turns: [{ role: 'user', content: noctisPrompt }],
          language: body?.language || 'English',
          context: 'ConnectLn'
        }),
        signal: ctrl.signal,
        cache: 'no-store'
      })
      if (res.ok) {
        const data = (await res.json()) as { text?: string }
        if (data?.text && data.text.trim()) {
          return NextResponse.json(
            {
              text: data.text.trim(),
              fallbackSummary,
              dateSummaries,
              source: 'noctis-live-api',
              analyzedCount: targetThreads.length,
              timestampIso: new Date().toISOString()
            },
            { headers: { 'cache-control': 'no-store' } }
          )
        }
      }
    } catch {
      // Fall through to synthesized Noctis date-grouped unread summary
    } finally {
      clearTimeout(timer)
    }

    return NextResponse.json(
      {
        text: fallbackSummary,
        fallbackSummary,
        dateSummaries,
        source: 'noctis-engine',
        analyzedCount: targetThreads.length,
        timestampIso: new Date().toISOString()
      },
      { headers: { 'cache-control': 'no-store' } }
    )
  }

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
