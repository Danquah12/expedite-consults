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
  lastMessage?: string
  lastMessageTime?: string
  attachments?: string[]
  messagesCount?: number
  recentMessages?: Array<{ sender: string; text: string; timestamp: string }>
}

function buildSynthesizedInboxExplanation(
  memberName: string,
  threads: NoctisInboxThreadDigest[],
  customQuestion?: string
): string {
  const firstName = (memberName || 'Member').trim().split(/\s+/)[0] || 'Member'
  const totalThreads = threads.length
  const unreadThreads = threads.filter((t) => (t.unreadCount || 0) > 0)
  const withAttachments = threads.filter((t) => (t.attachments && t.attachments.length > 0) || (t.lastMessage || '').includes('📎') || (t.lastMessage || '').toLowerCase().includes('attached:'))
  const directPeers = threads.filter((t) => t.channelType === 'People')
  const recruiters = threads.filter((t) => t.channelType === 'Companies')
  const vendors = threads.filter((t) => t.channelType === 'Products')
  const guilds = threads.filter((t) => t.channelType === 'Communities')

  const topHighlights = threads.slice(0, 5).map((t) => {
    const attNote = t.attachments && t.attachments.length > 0 ? ` (includes attachment: ${t.attachments.join(', ')})` : ''
    return `• ${t.title} (${t.lastMessageTime || 'Recent'}): "${(t.lastMessage || '').slice(0, 140)}"${attNote}`
  })

  if (customQuestion && customQuestion.trim()) {
    return (
      `Noctis Inbox Analysis for ${firstName} regarding "${customQuestion.trim()}":\n\n` +
      `Your ConnectLn mailbox currently holds ${totalThreads} active conversations (${unreadThreads.length} unread, ${withAttachments.length} with attached documents, ${directPeers.length} direct peer threads, ${recruiters.length} recruiter outreach threads, ${vendors.length} commercial vendor quotes, and ${guilds.length} profession guild channels).\n\n` +
      `Key Inbox Contents:\n${topHighlights.join('\n')}`
    )
  }

  return (
    `Noctis has analyzed all ${totalThreads} conversations in your ConnectLn Inbox (${unreadThreads.length} unread, ${withAttachments.length} containing files or engineering/career attachments). ` +
    `Priority attention is recommended for ${directPeers.slice(0, 3).map((d) => d.title).join(', ') || 'your direct peer messages'}` +
    (recruiters.length > 0 ? `, along with ${recruiters.length} hiring/recruiter inquiry (${recruiters[0].title})` : '') +
    (vendors.length > 0 ? ` and ${vendors.length} commercial vendor desk thread (${vendors[0].title}).` : '.')
  )
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
    const digestLines = inboxThreads
      .map((t, i) => {
        const atts = t.attachments && t.attachments.length > 0 ? ` | Attachments: ${t.attachments.join(', ')}` : ''
        const unread = t.unreadCount && t.unreadCount > 0 ? ` [UNREAD: ${t.unreadCount}]` : ''
        return `${i + 1}. [${t.channelType || 'Direct'}] ${t.title} (${t.subtitle || 'Verified Member'}) — Sent/Updated: ${t.lastMessageTime || 'Recent'}${unread} — Message: "${(t.lastMessage || '').slice(0, 180)}"${atts}`
      })
      .join('\n')

    const fallbackSummary = buildSynthesizedInboxExplanation(memberName, inboxThreads, customQ)

    const noctisPrompt =
      `You are Noctis, the AI Inbox & Executive Intelligence assistant inside ConnectLn (https://www.connectln.app).\n` +
      `The signed-in member is ${memberName}${body?.profile?.profession ? ` (${body.profile.profession})` : ''}.\n` +
      `Here are the exact live contents of ${memberName}'s ConnectLn Inbox:\n${digestLines}\n\n` +
      (customQ
        ? `Answer the member's specific question about their inbox concisely and accurately based ONLY on the inbox contents above: "${customQ}"`
        : `Provide a concise, executive 3-to-4 sentence briefing explaining the contents of ${memberName}'s inbox: highlight the most urgent direct messages, any attached reports/screenshots (with their dates), recruiter opportunities, and recommended immediate actions.`)

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
              source: 'noctis-live-api',
              analyzedCount: inboxThreads.length,
              timestampIso: new Date().toISOString()
            },
            { headers: { 'cache-control': 'no-store' } }
          )
        }
      }
    } catch {
      // Fall through to synthesized Noctis briefing so the inbox explanation is always instant & reliable
    } finally {
      clearTimeout(timer)
    }

    return NextResponse.json(
      {
        text: fallbackSummary,
        source: 'noctis-engine',
        analyzedCount: inboxThreads.length,
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
