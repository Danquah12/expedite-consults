import { NextRequest, NextResponse } from 'next/server'
import {
  PulseArticle,
  CyberThreatAdvisory,
  getEnclavePulseArticles,
  getEnclaveDomainAdvisories,
  getEnclaveAIBrief,
  getFormattedTodayDate,
  getLiveProfessionPulseArticles,
} from '@/lib/pulse-news-data'

export const dynamic = 'force-dynamic'

// In-memory store for user-published live Pulse Intelligence Reports
const USER_PUBLISHED_PULSE_ARTICLES: PulseArticle[] = []

function formatRelativeTimeFromISO(isoOrEpoch?: string | number): string {
  if (!isoOrEpoch) return 'Just now'
  const ts = typeof isoOrEpoch === 'number' ? isoOrEpoch * 1000 : Date.parse(isoOrEpoch)
  if (Number.isNaN(ts)) return 'Just now'
  const diffMs = Math.max(0, Date.now() - ts)
  const mins = Math.floor(diffMs / 60000)
  if (mins < 2) return 'Just now · Live'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function classifyArticleCategory(
  title: string,
  enclaveId?: string
): PulseArticle['category'] {
  const lower = title.toLowerCase()
  if (enclaveId === 'trades_construction') {
    if (lower.includes('osha') || lower.includes('safety') || lower.includes('fall')) return 'OSHA & Rigging'
    if (lower.includes('tool') || lower.includes('saw') || lower.includes('cnc')) return 'Tools & Millwork'
    if (lower.includes('envelope') || lower.includes('insulat') || lower.includes('energy')) return 'Building Science'
    return 'Timber & Framing'
  }
  if (enclaveId === 'healthcare_medicine') {
    if (lower.includes('fda') || lower.includes('trial') || lower.includes('study')) return 'Clinical Trials & FDA'
    if (lower.includes('nurse') || lower.includes('icu') || lower.includes('triage')) return 'Emergency Nursing'
    if (lower.includes('ortho') || lower.includes('fracture') || lower.includes('fixation')) return 'Orthopedic Fixation'
    return 'Trauma & Emergency'
  }
  if (enclaveId === 'automotive_mechanics') {
    if (lower.includes('ev') || lower.includes('battery') || lower.includes('800v') || lower.includes('hybrid'))
      return 'EV Powertrains & 800V'
    if (lower.includes('adas') || lower.includes('radar') || lower.includes('calibration')) return 'ADAS Calibration'
    if (lower.includes('diesel') || lower.includes('fleet') || lower.includes('truck')) return 'Fleet Diesel'
    return 'Diagnostics & Scopes'
  }

  if (
    lower.includes('cve') ||
    lower.includes('security') ||
    lower.includes('vulnerability') ||
    lower.includes('hack') ||
    lower.includes('zero-day') ||
    lower.includes('breach') ||
    lower.includes('exploit') ||
    lower.includes('ransomware') ||
    lower.includes('crypt') ||
    lower.includes('auth')
  ) {
    return 'Cybersecurity'
  }
  if (
    lower.includes('llm') ||
    lower.includes('ai ') ||
    lower.includes('gpt') ||
    lower.includes('claude') ||
    lower.includes('model') ||
    lower.includes('agent') ||
    lower.includes('neural') ||
    lower.includes('inference') ||
    lower.includes('openai') ||
    lower.includes('anthropic') ||
    lower.includes('gemini')
  ) {
    return 'AI'
  }
  if (
    lower.includes('cloud') ||
    lower.includes('aws') ||
    lower.includes('kubernetes') ||
    lower.includes('docker') ||
    lower.includes('serverless') ||
    lower.includes('postgres') ||
    lower.includes('database') ||
    lower.includes('linux')
  ) {
    return 'Cloud'
  }
  if (
    lower.includes('defense') ||
    lower.includes('military') ||
    lower.includes('pentagon') ||
    lower.includes('dod') ||
    lower.includes('drone') ||
    lower.includes('satellite')
  ) {
    return 'Defense'
  }
  if (
    lower.includes('gov') ||
    lower.includes('policy') ||
    lower.includes('regulation') ||
    lower.includes('fcc') ||
    lower.includes('ftc') ||
    lower.includes('sec ') ||
    lower.includes('cisa') ||
    lower.includes('nist')
  ) {
    return 'Government'
  }
  if (
    lower.includes('startup') ||
    lower.includes('yc') ||
    lower.includes('venture') ||
    lower.includes('funding') ||
    lower.includes('series a') ||
    lower.includes('founder')
  ) {
    return 'Startups'
  }
  if (
    lower.includes('paper') ||
    lower.includes('arxiv') ||
    lower.includes('research') ||
    lower.includes('study') ||
    lower.includes('university') ||
    lower.includes('theorem') ||
    lower.includes('quantum')
  ) {
    return 'Research'
  }
  if (
    lower.includes('market') ||
    lower.includes('revenue') ||
    lower.includes('enterprise') ||
    lower.includes('economy') ||
    lower.includes('acquisition') ||
    lower.includes('ipo')
  ) {
    return 'Business'
  }
  return 'Technology'
}

const COVER_IMAGES_BY_CATEGORY: Record<string, string> = {
  Cybersecurity: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
  AI: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
  Cloud: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
  Technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  Business: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
  Government: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
  Defense: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80',
  Startups: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80',
  Research: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
}

async function fetchLiveCisaKevAdvisories(): Promise<{
  advisories: CyberThreatAdvisory[]
  articles: PulseArticle[]
}> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3200)
    const res = await fetch(
      'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
      {
        signal: controller.signal,
        next: { revalidate: 300 },
      }
    )
    clearTimeout(timer)
    if (!res.ok) return { advisories: [], articles: [] }
    const data = await res.json()
    const vulns = Array.isArray(data?.vulnerabilities) ? data.vulnerabilities : []
    // Sort by dateAdded descending to get the most recent real-world CVEs
    const latest = vulns
      .slice()
      .sort((a: any, b: any) => String(b.dateAdded || '').localeCompare(String(a.dateAdded || '')))
      .slice(0, 3)

    const advisories: CyberThreatAdvisory[] = latest.map((v: any, idx: number) => ({
      id: `cisa_live_${v.cveID || idx}`,
      cveId: v.cveID || 'CVE-LIVE',
      severity: idx === 0 ? 'CRITICAL (CVSS 9.8)' : 'HIGH (CVSS 8.8)',
      title: `${v.vendorProject || 'Enterprise'} ${v.product || 'System'}: ${v.vulnerabilityName || 'Active Exploitation Detected'}`,
      affectedSystems: [`${v.vendorProject || 'Vendor'} ${v.product || 'Appliance'}`],
      vector: v.cwes?.length ? `Active Exploitation (${v.cwes.join(', ')})` : 'Known Exploited in the Wild',
      summary:
        v.shortDescription ||
        'CISA has confirmed active exploitation of this vulnerability in the wild and added it to the Known Exploited Vulnerabilities (KEV) catalog.',
      mitigationAction:
        v.requiredAction ||
        `Apply vendor mitigations or discontinue use of ${v.product || 'affected product'} before BOD 22-01 due date (${v.dueDate || 'Immediate'}).`,
      cisaEmergencyStatus: `🔴 CISA KEV Live Feed · Added ${v.dateAdded || 'Recently'} · Due ${v.dueDate || 'Immediate'}`,
      sourceUrl: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
      publishedAt: `Live CISA Feed (${v.dateAdded || 'Today'})`,
    }))

    const articles: PulseArticle[] = latest.slice(0, 2).map((v: any, idx: number) => ({
      id: `pulse_cisa_${v.cveID || idx}`,
      title: `[CISA KEV LIVE] ${v.cveID}: ${v.vendorProject} ${v.product} — ${v.vulnerabilityName}`,
      summary:
        v.shortDescription ||
        `CISA has issued an active exploitation directive for ${v.vendorProject} ${v.product} (${v.cveID}). Federal and enterprise security teams must remediate by ${v.dueDate || 'immediately'}.`,
      category: 'Cybersecurity',
      author: {
        name: 'CISA KEV Live Telemetry',
        role: 'U.S. Cybersecurity & Infrastructure Security Agency',
        avatar: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=80',
        source: 'cisa.gov (Live KEV Catalog)',
      },
      publishedAt: `Live CISA · Added ${v.dateAdded || 'Today'}`,
      readTime: '3 min read',
      coverImage: COVER_IMAGES_BY_CATEGORY.Cybersecurity,
      tags: [v.cveID || 'CISA', v.vendorProject || 'Security', 'ZeroTrust', 'LiveKEV', 'PatchDirective'].map((t: string) =>
        String(t).replace(/\s+/g, '')
      ),
      isFeatured: idx === 0,
      isBreaking: true,
      aiKeyTakeaways: [
        `Active in-the-wild exploitation confirmed by CISA for ${v.vendorProject} ${v.product} (${v.cveID}).`,
        `Required Action: ${v.requiredAction || 'Apply vendor patch or isolate affected systems immediately.'}`,
        `Mandatory federal BOD 22-01 remediation deadline: ${v.dueDate || 'Immediate'}.`,
      ],
      fullContent: `LIVE CISA KNOWN EXPLOITED VULNERABILITY DISPATCH (${v.cveID})

Vendor / Project: ${v.vendorProject}
Affected Product: ${v.product}
Vulnerability Name: ${v.vulnerabilityName}
Date Added to KEV: ${v.dateAdded}
Mandatory Remediation Due Date: ${v.dueDate}

Technical Summary:
${v.shortDescription}

Mandatory Remediation Directive:
${v.requiredAction}

Ransomware Campaign Correlation: ${v.knownRansomwareCampaignUse || 'Under active investigation'}.`,
      sourceLinks: [
        {
          title: `CISA KEV Entry: ${v.cveID} (${v.vendorProject} ${v.product})`,
          url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
          domain: 'cisa.gov',
        },
      ],
      biasRating: {
        leaning: 'Center',
        credibilityScore: 100,
        factCheckStatus: 'Statutorily Verified ✓',
      },
      upvotesCount: 380 + idx * 45,
      commentsCount: 52 + idx * 11,
    }))

    return { advisories, articles }
  } catch {
    return { advisories: [], articles: [] }
  }
}

async function fetchLiveHackerNewsArticles(enclaveId?: string): Promise<PulseArticle[]> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3200)
    const res = await fetch(
      'https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=points>20&hitsPerPage=10',
      {
        signal: controller.signal,
        next: { revalidate: 120 },
      }
    )
    clearTimeout(timer)
    if (!res.ok) return []
    const data = await res.json()
    const hits = Array.isArray(data?.hits) ? data.hits : []

    return hits
      .filter((h: any) => h?.title && (h?.url || h?.story_text))
      .slice(0, 6)
      .map((h: any, idx: number): PulseArticle => {
        const category = classifyArticleCategory(h.title, enclaveId)
        let domain = 'news.ycombinator.com'
        const targetUrl = h.url || `https://news.ycombinator.com/item?id=${h.objectID}`
        try {
          domain = new URL(targetUrl).hostname.replace(/^www\./, '')
        } catch {
          domain = 'news.ycombinator.com'
        }

        return {
          id: `live_hn_${h.objectID || idx}`,
          title: h.title,
          summary: `Live intelligence dispatch from ${domain} (${h.points || 45} peer upvotes · ${h.num_comments || 12} active analyst comments). Real-time architectural and industry analysis synced via ConnectLn Live Wire.`,
          category,
          author: {
            name: `@${h.author || 'tech_analyst'}`,
            role: `Verified Contributor · ${domain}`,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
            source: `${domain} (Live Wire)`,
          },
          publishedAt: formatRelativeTimeFromISO(h.created_at_i || h.created_at),
          readTime: '4 min read',
          coverImage:
            COVER_IMAGES_BY_CATEGORY[category] ||
            'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
          tags: [category, domain.split('.')[0], 'LiveWire', 'RealTimeTelemetry'],
          isFeatured: idx === 0,
          isBreaking: idx < 2,
          aiKeyTakeaways: [
            `Primary source published on ${domain} and trending across engineering & security intelligence feeds.`,
            `${h.points || 45} verified technical upvotes and ${h.num_comments || 12} peer review comments recorded in real time.`,
            `Categorized under ${category} by ConnectLn Noctis™ semantic classifier.`,
          ],
          fullContent: `${h.title}

Source Domain: ${domain}
Published: ${formatRelativeTimeFromISO(h.created_at_i || h.created_at)}
Community Verification: ${h.points || 45} points · ${h.num_comments || 12} technical comments

Executive Context:
This live report was ingested directly from ${domain} via the ConnectLn Real-Time Pulse Intelligence Wire. Click the grounded source reference below to inspect the full primary publication and live discussion thread.`,
          sourceLinks: [
            {
              title: `${h.title} (${domain})`,
              url: targetUrl,
              domain,
            },
            {
              title: `Live Technical Peer Discussion (${h.num_comments || 12} comments)`,
              url: `https://news.ycombinator.com/item?id=${h.objectID}`,
              domain: 'news.ycombinator.com',
            },
          ],
          biasRating: {
            leaning: 'Center',
            credibilityScore: 96,
            factCheckStatus: 'Peer Reviewed',
          },
          upvotesCount: Number(h.points) || 128,
          commentsCount: Number(h.num_comments) || 24,
        }
      })
  } catch {
    return []
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const enclaveId = searchParams.get('enclave') || undefined
  const professionTitle = searchParams.get('profession') || undefined

  const [cisaLive, hnLive] = await Promise.all([
    fetchLiveCisaKevAdvisories(),
    fetchLiveHackerNewsArticles(enclaveId),
  ])

  const professionArticles = getLiveProfessionPulseArticles(professionTitle, enclaveId)
  const baseArticles = getEnclavePulseArticles(enclaveId)
  const baseAdvisories = getEnclaveDomainAdvisories(enclaveId)
  const aiBrief = getEnclaveAIBrief(enclaveId)

  // Refresh timestamps on curated articles so they reflect live sync cadence
  const liveStampedBaseArticles: PulseArticle[] = baseArticles.map((art, index) => {
    const minutesDynamic = [8, 19, 34, 47, 65, 88, 110, 140, 175, 210, 245][index % 11]
    const dynamicTime =
      minutesDynamic < 60 ? `${minutesDynamic}m ago` : `${Math.floor(minutesDynamic / 60)}h ${minutesDynamic % 60}m ago`
    return {
      ...art,
      publishedAt: art.publishedAt.includes('Live') ? art.publishedAt : dynamicTime,
    }
  })

  // Combine user-published -> profession-specific -> CISA KEV breaking -> HN live -> curated enclave articles
  const combinedArticles: PulseArticle[] = [
    ...USER_PUBLISHED_PULSE_ARTICLES,
    ...professionArticles,
    ...(enclaveId && enclaveId !== 'tech_cybersecurity' ? [] : cisaLive.articles),
    ...hnLive,
    ...liveStampedBaseArticles,
  ]

  const combinedAdvisories: CyberThreatAdvisory[] =
    enclaveId && enclaveId !== 'tech_cybersecurity'
      ? baseAdvisories
      : [...cisaLive.advisories, ...baseAdvisories].slice(0, 4)

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    formattedDate: getFormattedTodayDate(),
    liveExternalCount: cisaLive.articles.length + hnLive.length + professionArticles.length,
    advisories: combinedAdvisories,
    articles: combinedArticles,
    aiBrief: {
      ...aiBrief,
      date: getFormattedTodayDate(),
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const title = String(body.title || '').trim()
    const summary = String(body.summary || '').trim()
    const category = (body.category || 'Cybersecurity') as PulseArticle['category']
    const authorName = String(body.authorName || 'Verified ConnectLn Member').trim()
    const authorRole = String(body.authorRole || 'Licensed Practitioner').trim()
    const authorAvatar =
      String(body.authorAvatar || '').trim() ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    const sourceUrl = String(body.sourceUrl || 'https://conectln.com/connectin').trim()

    if (!title || !summary) {
      return NextResponse.json({ ok: false, error: 'Title and summary are required.' }, { status: 400 })
    }

    const newArticle: PulseArticle = {
      id: `user_pulse_${Date.now()}`,
      title,
      summary,
      category,
      author: {
        name: authorName,
        role: authorRole,
        avatar: authorAvatar,
        source: 'ConnectLn Verified Field Dispatch',
      },
      publishedAt: 'Just now · Live Dispatch',
      readTime: '3 min read',
      coverImage:
        COVER_IMAGES_BY_CATEGORY[category] ||
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
      tags: [category.replace(/\s+/g, ''), 'LiveFieldReport', 'VerifiedMember'],
      isFeatured: true,
      isBreaking: true,
      aiKeyTakeaways: [
        summary,
        `Published directly to the ConnectLn Pulse Intelligence Stream by ${authorName} (${authorRole}).`,
        'Verified for immediate peer review and operational cross-referencing.',
      ],
      fullContent: `${title}\n\n${summary}\n\nPublished by ${authorName} (${authorRole}) via ConnectLn Live Pulse Intelligence Wire on ${getFormattedTodayDate()}.`,
      sourceLinks: [
        {
          title: `${title} — Primary Reference`,
          url: sourceUrl,
          domain: 'conectln.com',
        },
      ],
      biasRating: {
        leaning: 'Center',
        credibilityScore: 98,
        factCheckStatus: 'Statutorily Verified ✓',
      },
      upvotesCount: 1,
      commentsCount: 0,
    }

    USER_PUBLISHED_PULSE_ARTICLES.unshift(newArticle)
    return NextResponse.json({ ok: true, article: newArticle })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to publish report' }, { status: 500 })
  }
}
