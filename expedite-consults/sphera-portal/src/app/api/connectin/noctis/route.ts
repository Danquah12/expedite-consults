import { NextResponse } from 'next/server'
import { connectLnGrounding } from '@/lib/connectln-knowledge'
import { MASTER_MARKETPLACE_PRODUCTS, MarketplaceProduct } from '@/lib/marketplace-engine-data'
import { ENTERPRISE_SOLUTIONS_DATA } from '@/lib/solutions-layer-data'
import { spheraAppsData } from '@/lib/nextgen-data'

export const runtime = 'nodejs'
export const maxDuration = 30

const NOCTIS_API_URL = process.env.NOCTIS_API_URL || 'https://dstrike.app/api/noctis'
const NOCTIS_WEB_URL = 'https://www.dstrike.app/noctis'

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

export interface NoctisAlertDigest {
  id: string
  category: string
  subType: string
  actorName?: string
  actorRole?: string
  title: string
  description: string
  timestamp: string
  unread: boolean
  priority?: string
  actionText?: string
  externalLabel?: string
  externalUrl?: string
}

export interface NoctisDetailedAlertExplanation {
  alertId: string
  whatItRepresents: string
  whyItMatters: string
  recommendedActionPlan: string[]
  liveNoctisNote?: string
}

export interface NoctisProductSalesPitch {
  productId: string
  productName: string
  vendorName: string
  category: string
  subCategory: string
  tagline: string
  displayPrice: string
  billingPeriod: string
  hasFreeTrial: boolean
  liveUrl?: string
  demoUrl?: string
  noctisAgentUrl: string
  headlinePitch: string
  whatItDoesAndHowItWorks: string
  featureHighlights: Array<{ title: string; desc: string }>
  architectureAndSecurity: string
  complianceBadges: string[]
  whyBuyNowAndROI: string[]
  pricingSummary: Array<{ name: string; price: string; period: string; description: string }>
  liveNoctisSalesResponse?: string
}

function buildProductSalesPitch(product: MarketplaceProduct, customQuestion?: string): NoctisProductSalesPitch {
  const complianceList = product.security?.compliance || []
  const caseStudyBullets: string[] = []
  for (const cs of product.caseStudies || []) {
    caseStudyBullets.push(`${cs.customer}: ${cs.headline} (${(cs.results || []).join(', ')})`)
  }
  if (caseStudyBullets.length === 0) {
    caseStudyBullets.push(
      `Rated ${product.rating}/5.0 across ${product.reviewsCount} verified enterprise & field reviews${product.activeUsersCount ? ` (${product.activeUsersCount})` : ''}.`,
      `Zero-friction deployment with ${product.architecture?.latency || 'sub-second'} latency and ${product.security?.encryption || 'end-to-end'} encryption.`
    )
  }

  const featuresText = (product.features || [])
    .map((f) => `• ${f.title}: ${f.desc}`)
    .join('\n')

  const headlinePitch = `${product.icon} ${product.name} — ${product.tagline}`

  const whatItDoesAndHowItWorks =
    `${product.overview}\n\n` +
    `Key Capabilities & What It Does:\n${featuresText}\n\n` +
    (product.integrations && product.integrations.length > 0
      ? `Native Integrations & Ecosystem Compatibility: ${product.integrations.join(', ')}.`
      : '')

  const architectureAndSecurity =
    `${product.architecture?.title || 'Enterprise Cloud Architecture'}: ${product.architecture?.summary || ''}\n` +
    `• Performance & Latency: ${product.architecture?.latency || 'Real-time'} | Data Privacy: ${product.architecture?.dataPrivacy || 'Isolated'}\n` +
    `• Encryption & Isolation: ${product.security?.encryption || 'AES-256 / TLS 1.3'} · ${product.security?.isolation || 'Dedicated Tenant'}\n` +
    `• Support SLA: ${product.support?.sla || '99.9% Uptime SLA'} via ${product.support?.channel || '24/7 Priority Desk'} (Response: ${product.support?.responseHours || '< 1 hour'})`

  const defaultSalesNarrative =
    `✨ **Noctis AI Sales & Product Specialist (${NOCTIS_WEB_URL}) — Executive Deep-Dive on ${product.name}**\n\n` +
    `**1. Why ${product.name} Stands Out:**\n` +
    `${product.tagline} Built and verified by **${product.vendor.name}**, it gives your organization immediate operational capability in **${product.category} (${product.subCategory})**.\n\n` +
    `**2. Deep-Dive: Everything ${product.name} Has & Does:**\n` +
    `${product.overview}\n` +
    (product.features || []).map((f) => `  • **${f.title}**: ${f.desc}`).join('\n') +
    `\n\n**3. Architecture, Security & Compliance:**\n` +
    `  • **Architecture**: ${product.architecture?.title} — ${product.architecture?.summary} (${product.architecture?.latency})\n` +
    `  • **Compliance & Trust**: ${complianceList.join(' · ') || 'Enterprise Verified'} | ${product.security?.encryption}\n` +
    (product.integrations?.length ? `  • **Integrations**: ${product.integrations.join(', ')}\n` : '') +
    `\n**4. Proven ROI & Customer Outcomes:**\n` +
    caseStudyBullets.map((b) => `  • ${b}`).join('\n') +
    `\n\n**5. Commercial Pricing & How to Start Today:**\n` +
    `  • **Starting Price**: **${product.pricing.displayPrice}** (${product.pricing.billingPeriod})${product.pricing.hasFreeTrial ? ` — includes a **${product.pricing.trialDays || 14}-Day Free Evaluation Trial**` : ''}.\n` +
    (product.pricingTiers || []).map((t) => `  • **${t.name} (${t.price} ${t.period})**: ${t.description}`).join('\n') +
    (product.liveUrl ? `\n  • **Live Production Portal**: ${product.liveUrl}` : '') +
    (product.demoUrl ? `\n  • **Interactive Companion / Engine**: ${product.demoUrl}` : '') +
    `\n  • **Noctis Intelligence Desk**: ${NOCTIS_WEB_URL}`

  return {
    productId: product.id,
    productName: product.name,
    vendorName: product.vendor.name,
    category: product.category,
    subCategory: product.subCategory,
    tagline: product.tagline,
    displayPrice: product.pricing.displayPrice,
    billingPeriod: product.pricing.billingPeriod,
    hasFreeTrial: product.pricing.hasFreeTrial,
    liveUrl: product.liveUrl,
    demoUrl: product.demoUrl,
    noctisAgentUrl: NOCTIS_WEB_URL,
    headlinePitch,
    whatItDoesAndHowItWorks,
    featureHighlights: product.features || [],
    architectureAndSecurity,
    complianceBadges: complianceList,
    whyBuyNowAndROI: caseStudyBullets,
    pricingSummary: (product.pricingTiers || []).map((t) => ({
      name: t.name,
      price: t.price,
      period: t.period,
      description: t.description
    })),
    liveNoctisSalesResponse: customQuestion
      ? `✨ **Noctis Sales & Product Specialist Answer regarding ${product.name}** ("${customQuestion}"):\n\n${defaultSalesNarrative}`
      : defaultSalesNarrative
  }
}

function searchMarketplaceProductsForNoctis(query: string): MarketplaceProduct[] {
  const q = (query || '').toLowerCase().trim()
  if (!q) return MASTER_MARKETPLACE_PRODUCTS.slice(0, 8)

  const words = q.split(/[^a-z0-9]+/).filter((w) => w.length >= 2)
  const scored = MASTER_MARKETPLACE_PRODUCTS.map((p) => {
    const haystack = [
      p.id,
      p.name,
      p.tagline,
      p.category,
      p.subCategory,
      p.overview,
      p.vendor.name,
      p.liveUrl || '',
      p.demoUrl || '',
      ...(p.features || []).map((f) => `${f.title} ${f.desc}`),
      ...(p.security?.compliance || []),
      ...(p.integrations || [])
    ]
      .join(' ')
      .toLowerCase()

    let score = 0
    if (haystack.includes(q)) score += 25
    for (const w of words) {
      if (p.name.toLowerCase().includes(w)) score += 10
      if (p.tagline.toLowerCase().includes(w)) score += 6
      if (p.subCategory.toLowerCase().includes(w)) score += 5
      if (haystack.includes(w)) score += 3
    }
    return { product: p, score }
  })

  const matches = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.product)

  return matches.length > 0 ? matches.slice(0, 6) : MASTER_MARKETPLACE_PRODUCTS.slice(0, 6)
}

function buildMarketplaceCatalogPromptContext(products: MarketplaceProduct[]): string {
  return products
    .map((p, idx) => {
      const feats = (p.features || []).map((f) => `${f.title} (${f.desc})`).join('; ')
      const tiers = (p.pricingTiers || []).map((t) => `${t.name}: ${t.price} ${t.period}`).join(' | ')
      const comp = (p.security?.compliance || []).join(', ')
      return (
        `${idx + 1}. PRODUCT: "${p.name}" (ID: ${p.id}) by ${p.vendor.name}\n` +
        `   - Category: ${p.category} / ${p.subCategory} | Rating: ${p.rating}/5 (${p.reviewsCount} reviews)\n` +
        `   - Tagline: ${p.tagline}\n` +
        `   - Full Overview: ${p.overview}\n` +
        `   - Core Features & What It Does: ${feats}\n` +
        `   - Architecture & Latency: ${p.architecture?.title} — ${p.architecture?.summary} (${p.architecture?.latency})\n` +
        `   - Security & Compliance: ${comp} | Encryption: ${p.security?.encryption}\n` +
        `   - Pricing: ${p.pricing.displayPrice} (${p.pricing.billingPeriod}) | Tiers: ${tiers}\n` +
        `   - Live URLs: ${p.liveUrl || 'In-App'} ${p.demoUrl ? `| Companion URL: ${p.demoUrl}` : ''}`
      )
    })
    .join('\n\n')
}

function buildDetailedExplanationForAlert(alert: NoctisAlertDigest): NoctisDetailedAlertExplanation {
  const t = `${alert.title} ${alert.description}`.toLowerCase()

  if (t.includes('cve-2026-44921') || t.includes('perimeter concentrators')) {
    return {
      alertId: alert.id,
      whatItRepresents:
        'This is an emergency CISA Known Exploited Vulnerabilities (KEV) Zero-Day Security Advisory regarding active in-the-wild exploitation of enterprise VPN/perimeter concentrators (CVE-2026-44921).',
      whyItMatters:
        'Unauthenticated threat actors can bypass edge authentication on unpatched perimeter concentrators and move laterally into internal enclaves. CISA mandates federal and defense-industrial-base (DIB) remediation or micro-segmentation within 24 hours.',
      recommendedActionPlan: [
        'Isolate and micro-segment exposed perimeter concentrator interfaces immediately.',
        'Verify Indicators of Compromise (IoCs) against the CISA KEV Catalog and rotate active session tokens.',
        'Open the Threat Playbook in Pulse Rooms to coordinate incident containment and patch verification.'
      ]
    }
  }

  if (t.includes('usp <797>') || t.includes('usp <800>') || t.includes('heparin') || t.includes('vancomycin')) {
    return {
      alertId: alert.id,
      whatItRepresents:
        'This is a Clinical Pharmacy & Drug Safety Alert from FDA MedWatch & NIH DailyMed covering updated USP <797> (Sterile Compounding) and USP <800> (Hazardous Drugs) standards alongside high-alert IV Heparin and Vancomycin Bayesian AUC/MIC dosing guardrails.',
      whyItMatters:
        'Heparin and IV Vancomycin are high-alert medications with narrow therapeutic indices. Updated Bayesian AUC/MIC nomograms and Barcode Medication Administration (BCMA) guardrails prevent nephrotoxicity, thrombosis, and sterile compounding contamination across inpatient pharmacies and ICUs.',
      recommendedActionPlan: [
        'Review updated Vancomycin AUC/MIC target trough/AUC nomograms in NIH DailyMed Live.',
        'Verify cleanroom ISO Class 5/7 air-change and beyond-use-date (BUD) logs for USP <797>/<800> compliance.',
        'Confirm smart-pump drug library guardrails and BCMA dual-signoff rules with Clinical Pharmacists and ICU RNs.'
      ]
    }
  }

  if (t.includes('national patient safety goals') || t.includes('npsg') || t.includes('sepsis hour-1')) {
    return {
      alertId: alert.id,
      whatItRepresents:
        'This advisory from The Joint Commission (TJC) & CDC Clinical Command represents the 2026 National Patient Safety Goals (NPSG) and the mandatory Sepsis Hour-1 Bundle protocol for hospitals and clinical teams.',
      whyItMatters:
        'Every hour of delayed antibiotic administration and lactate/blood-culture draw in septic shock significantly increases inpatient mortality. It also enforces CLSI venipuncture order-of-draw (to avoid specimen contamination), 12-lead ECG triage timing (<10 min for chest pain), and HIPAA zero-trust EHR audit logging.',
      recommendedActionPlan: [
        'Ensure ED & inpatient triage teams complete serum lactate, 2 sets of blood cultures (prior to antibiotics), broad-spectrum IV antibiotics, and 30 mL/kg crystalloid bolus within 60 minutes.',
        'Verify CLSI venipuncture order-of-draw compliance among RNs, LPNs, and Medical Assistants (CCMA/CNA).',
        'Launch MDCalc Clinical to run SOFA / qSOFA and Sepsis risk scoring during bedside triage.'
      ]
    }
  }

  if (t.includes('nonce verification') || t.includes('mcp tool gateways') || t.includes('prompt injection')) {
    return {
      alertId: alert.id,
      whatItRepresents:
        'This is an automated application security vulnerability notice from the AXIOM Autonomous Scanner identifying an indirect prompt-injection vector across Model Context Protocol (MCP) tool gateways.',
      whyItMatters:
        'Without cryptographic nonce verification on tool-call payloads, untrusted external documents or emails processed by an AI agent could trigger unauthorized downstream tool execution (confused deputy attack).',
      recommendedActionPlan: [
        'Apply the cryptographic nonce-verification Auto-PR patch to enforce per-invocation signature binding.',
        'Inspect MCP tool gateway logs in Expedite Strike for anomalous tool call parameters.',
        'Require human-in-the-loop approval for state-modifying MCP actions.'
      ]
    }
  }

  if (t.includes('healthcare requisitions') || t.includes('johns hopkins') || t.includes('mayo clinic')) {
    return {
      alertId: alert.id,
      whatItRepresents:
        'This Career Signal represents 6 verified clinical and healthcare leadership job requisitions across premier health systems (Johns Hopkins, Mayo Clinic, Kaiser Permanente, Mass General Brigham).',
      whyItMatters:
        'These direct-hire and travel PRN openings match verified clinical credentials on ConnectLn with total compensation packages ranging from $56K to $410K+ and immediate sign-on bonuses.',
      recommendedActionPlan: [
        'Click "View Clinical Jobs" to filter openings by licensure (PharmD, MD/DO, RN/CCRN, CCMA/CNA, MHA/FACHE).',
        'Attach your verified ConnectLn Career Passport and clinical license credentials for fast-track review.',
        'Open the Hopkins Careers Portal to compare shift differentials and relocation packages.'
      ]
    }
  }

  if (alert.category === 'Career') {
    return {
      alertId: alert.id,
      whatItRepresents: `This is a verified ConnectLn Career Signal (${alert.subType}) issued by ${alert.actorName || 'a hiring partner'}${alert.actorRole ? ` (${alert.actorRole})` : ''}.`,
      whyItMatters: `${alert.description} Career signals on ConnectLn are matched directly against your verified skills, enclave credentials, and peer reviews.`,
      recommendedActionPlan: [
        `Click "${alert.actionText || 'View Opportunity'}" to open the role, interview prep, or recruiter thread.`,
        'Review compensation bands and technical/clinical requirements before responding.',
        'Use CareerTwin or ConnectLn Messaging to confirm your availability.'
      ]
    }
  }

  if (alert.category === 'Marketplace') {
    return {
      alertId: alert.id,
      whatItRepresents: `This Solutions & Marketplace Signal (${alert.subType}) from ${alert.actorName || 'ConnectLn Solutions'} highlights a verified enterprise or clinical platform update.`,
      whyItMatters: `${alert.description} It enables direct access to production tools, clinical references, or compliance retainers inside your enclave.`,
      recommendedActionPlan: [
        `Use "${alert.actionText || 'Open Marketplace'}" to inspect the solution specifications and licensing status.`,
        alert.externalLabel ? `Launch "${alert.externalLabel}" to access the live external portal directly.` : 'Compare vendor SLA and compliance documentation in the Solutions Hub.'
      ]
    }
  }

  if (alert.category === 'Learning') {
    return {
      alertId: alert.id,
      whatItRepresents: `This Learning & Credentialing Signal (${alert.subType}) from ${alert.actorName || 'ConnectLn Academy'} tracks your continuing education (CME/CEU/CPE) and technical mastery.`,
      whyItMatters: `${alert.description} Completing verified masterclasses and practice domains strengthens your ConnectLn Trust & Skill verification score.`,
      recommendedActionPlan: [
        `Click "${alert.actionText || 'Continue Learning'}" to resume the masterclass or practice engine.`,
        'Log completed modules toward your annual professional credentialing requirements.'
      ]
    }
  }

  return {
    alertId: alert.id,
    whatItRepresents: `This ${alert.category} Alert (${alert.subType}) from ${alert.actorName || 'ConnectLn Network'} notifies you of real-time activity in your professional enclave.`,
    whyItMatters: alert.description,
    recommendedActionPlan: [
      `Select "${alert.actionText || 'View Alert'}" to inspect the full context and respond.`,
      'Mark the alert as read once you have completed any required follow-up.'
    ]
  }
}

function buildAlertsExecutiveBriefing(
  memberName: string,
  alerts: NoctisAlertDigest[],
  categoryFilter?: string,
  customQuestion?: string
): {
  fullText: string
  alertExplanations: Record<string, NoctisDetailedAlertExplanation>
} {
  const firstName = (memberName || 'Member').trim().split(/\s+/)[0] || 'Member'
  const unreadAlerts = alerts.filter((a) => a.unread)
  const criticalAlerts = alerts.filter((a) => a.priority === 'critical' || a.category === 'Security')

  const alertExplanations: Record<string, NoctisDetailedAlertExplanation> = {}
  for (const a of alerts) {
    alertExplanations[a.id] = buildDetailedExplanationForAlert(a)
  }

  const byCategory = new Map<string, NoctisAlertDigest[]>()
  for (const a of alerts) {
    const list = byCategory.get(a.category) || []
    list.push(a)
    byCategory.set(a.category, list)
  }

  const categoryLines: string[] = []
  for (const [cat, items] of byCategory.entries()) {
    const unreadInCat = items.filter((i) => i.unread).length
    const icon =
      cat === 'Security'
        ? '🛡️'
        : cat === 'Career'
        ? '💼'
        : cat === 'Marketplace'
        ? '🛍️'
        : cat === 'Learning'
        ? '🎓'
        : '💬'
    categoryLines.push(
      `${icon} ${cat === 'Security' ? 'Account, Safety & Clinical Advisories' : cat} (${items.length} ${items.length === 1 ? 'alert' : 'alerts'}, ${unreadInCat} unread):\n` +
        items
          .map((item) => {
            const exp = alertExplanations[item.id]
            return `  • ${item.title} (${item.timestamp}${item.unread ? ' · UNREAD' : ''})\n    ↳ What it represents: ${exp.whatItRepresents}\n    ↳ Recommended Action: ${exp.recommendedActionPlan[0]}`
          })
          .join('\n')
    )
  }

  const headerLine = customQuestion
    ? `Noctis Alert Intelligence Answer for ${firstName} ("${customQuestion}"):\n\n`
    : `Noctis analyzed ${alerts.length} alerts${categoryFilter && categoryFilter !== 'All' ? ` in ${categoryFilter}` : ''} (${unreadAlerts.length} unread, ${criticalAlerts.length} high/critical priority) for ${firstName} and prepared a detailed breakdown of what each alert represents:\n\n`

  return {
    fullText: headerLine + categoryLines.join('\n\n'),
    alertExplanations
  }
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
    mode?:
      | 'inbox_briefing'
      | 'alerts_briefing'
      | 'explain_single_alert'
      | 'marketplace_sales_agent'
      | 'pitch_single_product'
      | 'qa'
    question?: string
    inboxThreads?: NoctisInboxThreadDigest[]
    alerts?: NoctisAlertDigest[]
    selectedAlert?: NoctisAlertDigest
    productId?: string
    categoryFilter?: string
    history?: Turn[]
    profile?: { name?: string; profession?: string }
    language?: string
  } | null

  const memberName = body?.profile?.name || 'ConnectLn Member'
  const isMarketplaceMode =
    body?.mode === 'marketplace_sales_agent' ||
    body?.mode === 'pitch_single_product' ||
    Boolean(body?.productId)

  if (isMarketplaceMode) {
    const customQ = (body?.question || '').trim()
    const explicitProduct = body?.productId
      ? MASTER_MARKETPLACE_PRODUCTS.find((p) => p.id === body.productId) ||
        MASTER_MARKETPLACE_PRODUCTS.find((p) => p.name.toLowerCase() === body.productId?.toLowerCase())
      : undefined

    const matchedProducts = explicitProduct
      ? [explicitProduct]
      : searchMarketplaceProductsForNoctis(customQ || body?.categoryFilter || '')

    const primaryProduct = explicitProduct || matchedProducts[0] || MASTER_MARKETPLACE_PRODUCTS[0]
    const primaryPitch = buildProductSalesPitch(primaryProduct, customQ)
    const allPitches = matchedProducts.map((p) => buildProductSalesPitch(p, customQ))

    const catalogContext = buildMarketplaceCatalogPromptContext(
      explicitProduct ? [explicitProduct] : matchedProducts.slice(0, 8)
    )

    const solutionsContext = ENTERPRISE_SOLUTIONS_DATA.slice(0, 5)
      .map(
        (s) =>
          `• Solution Blueprint "${s.title}" (${s.complianceFramework}, ${s.estimatedTime}): Solves "${s.problemStatement}" -> Outcome: "${s.targetOutcome}".`
      )
      .join('\n')

    const noctisSalesPrompt =
      `You are Noctis (${NOCTIS_WEB_URL}), the official AI Product Marketing & Enterprise Solutions Sales Agent inside ConnectLn (https://www.conectln.com).\n` +
      `You have learned every detail, feature, architecture spec, compliance framework, pricing tier, and live URL of all ${MASTER_MARKETPLACE_PRODUCTS.length} Marketplace products, ${ENTERPRISE_SOLUTIONS_DATA.length} Outcome Solution Blueprints, and ${spheraAppsData.length} Sphera Micro-Apps.\n` +
      `The prospective buyer/member is ${memberName}${body?.profile?.profession ? ` (${body.profile.profession})` : ''}.\n\n` +
      `=== VERIFIED MARKETPLACE PRODUCT KNOWLEDGE BASE ===\n` +
      `${catalogContext}\n\n` +
      `=== VERIFIED ENTERPRISE OUTCOME BLUEPRINTS ===\n` +
      `${solutionsContext}\n\n` +
      (explicitProduct
        ? `Act as an enthusiastic, deeply knowledgeable enterprise sales & technical marketing specialist for "${explicitProduct.name}". ` +
          (customQ
            ? `Answer the buyer's specific question about "${explicitProduct.name}" persuasively and accurately using the verified specs above: "${customQ}"`
            : `Give a compelling executive deep-dive sales pitch for "${explicitProduct.name}", explaining everything it has and does, its technical architecture, compliance certifications, proven ROI, pricing tiers, and how to launch it or start a 14-day free trial right now.`)
        : customQ
        ? `Act as a consultative AI marketing and sales agent. Answer the buyer's request persuasively using the exact products, features, pricing, and live URLs from the ConnectLn Market catalog above: "${customQ}"`
        : `Introduce yourself as Noctis (${NOCTIS_WEB_URL}), the ConnectLn Marketplace Sales & Product Intelligence Agent, and pitch our flagship platforms (DSTRIKE & Noctis Threat Prediction Desk at https://www.dstrike.app/noctis, Aagiis Federal DoD RMF at https://aagiis.com, EXPEDITE STRIKE™ DAST Engine at https://11-dast-security-platform.vercel.app/engine, DeskNote E2EE, and PDFAdore), highlighting what each does, why teams buy them, and their pricing/free trials.`)

    const fallbackSalesText = explicitProduct
      ? primaryPitch.liveNoctisSalesResponse!
      : customQ
      ? `✨ **Noctis AI Marketing & Sales Agent (${NOCTIS_WEB_URL}) — Product Recommendation & Deep-Dive for ${memberName}**\n\n` +
        `Based on your inquiry (*"${customQ}"*), here is a complete breakdown of the top ${matchedProducts.length} solutions in the ConnectLn Market and everything they do:\n\n` +
        allPitches
          .slice(0, 3)
          .map(
            (p, idx) =>
              `### ${idx + 1}. ${p.headlinePitch}\n` +
              `• **Vendor**: ${p.vendorName} | **Category**: ${p.category} (${p.subCategory})\n` +
              `• **What It Has & Does**: ${p.whatItDoesAndHowItWorks.split('\n')[0]}\n` +
              `• **Core Capabilities**: ${p.featureHighlights.map((f) => `${f.title} (${f.desc})`).join(' · ')}\n` +
              `• **Compliance & Architecture**: ${p.complianceBadges.join(', ') || 'Enterprise Grade'} — ${p.architectureAndSecurity.split('\n')[0]}\n` +
              `• **Pricing & Trial**: **${p.displayPrice}** (${p.billingPeriod})${p.hasFreeTrial ? ' · **14-Day Free Trial Available**' : ''}${p.liveUrl ? ` · **Live Portal**: ${p.liveUrl}` : ''}`
          )
          .join('\n\n')
      : `✨ **Welcome to Noctis Market Intelligence & Sales Concierge (${NOCTIS_WEB_URL})**\n\n` +
        `I have learned every specification, feature, architecture diagram, compliance standard, and pricing tier across all **${MASTER_MARKETPLACE_PRODUCTS.length} Marketplace Platforms**, **${ENTERPRISE_SOLUTIONS_DATA.length} Outcome Blueprints**, and **${spheraAppsData.length} Sphera Micro-Apps**.\n\n` +
        `**Flagship Platforms Ready to Deploy Today:**\n` +
        `• **🔮 DSTRIKE & Noctis Threat Prediction Desk (${NOCTIS_WEB_URL})**: Autonomous cyber defense, attack surface telemetry, and AI-driven predictive security intelligence.\n` +
        `• **🛡️ Aagiis — Federal Compliance & DoD RMF (https://aagiis.com)**: Full DoDI 8510.01, DCSA NISP, Continuous ATO (cATO), eMASS automation, and NIST 800-53 Rev 5 governance.\n` +
        `• **🎯 EXPEDITE STRIKE™ — Live DAST Engine (https://11-dast-security-platform.vercel.app/engine)**: Real-time dynamic application security testing, OWASP Top 10 & API exploit validation with zero false positives.\n` +
        `• **📓 DeskNote E2EE & PDFAdore (https://www.pdfadore.com)**: Zero-knowledge encrypted field notebook and 31+ browser-native PDF & document engineering tools.\n` +
        `• **🏥 Clinical, Skilled Trades & Automotive Suites**: NIH DailyMed, MDCalc Clinical, Festool/Mafell joinery systems, and 800V EV diagnostic scopes.\n\n` +
        `*Click **"✨ Ask Noctis"** on any product card below or type any question above to get a custom executive sales pitch, technical deep-dive, or side-by-side ROI comparison!*`

    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 15000)
    try {
      const res = await fetch(NOCTIS_API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(process.env.NOCTIS_API_KEY ? { 'x-noctis-key': process.env.NOCTIS_API_KEY } : {})
        },
        body: JSON.stringify({
          turns: [{ role: 'user', content: noctisSalesPrompt }],
          language: body?.language || 'English',
          context: 'ConnectLn-Marketplace-Sales-Agent'
        }),
        signal: ctrl.signal,
        cache: 'no-store'
      })
      if (res.ok) {
        const data = (await res.json()) as { text?: string }
        if (data?.text && data.text.trim()) {
          primaryPitch.liveNoctisSalesResponse = data.text.trim()
          return NextResponse.json(
            {
              text: data.text.trim(),
              fallbackSummary: fallbackSalesText,
              productPitch: primaryPitch,
              matchedPitches: allPitches,
              noctisAgentUrl: NOCTIS_WEB_URL,
              source: 'noctis-live-sales-api',
              totalCatalogCount: MASTER_MARKETPLACE_PRODUCTS.length,
              timestampIso: new Date().toISOString()
            },
            { headers: { 'cache-control': 'no-store' } }
          )
        }
      }
    } catch {
      // Fall through to synthesized Noctis Market Sales Agent pitch
    } finally {
      clearTimeout(timer)
    }

    return NextResponse.json(
      {
        text: fallbackSalesText,
        fallbackSummary: fallbackSalesText,
        productPitch: primaryPitch,
        matchedPitches: allPitches,
        noctisAgentUrl: NOCTIS_WEB_URL,
        source: 'noctis-market-sales-engine',
        totalCatalogCount: MASTER_MARKETPLACE_PRODUCTS.length,
        timestampIso: new Date().toISOString()
      },
      { headers: { 'cache-control': 'no-store' } }
    )
  }

  const alertsList = Array.isArray(body?.alerts) ? body!.alerts!.slice(0, 30) : []
  const isAlertsMode =
    body?.mode === 'alerts_briefing' ||
    body?.mode === 'explain_single_alert' ||
    alertsList.length > 0 ||
    Boolean(body?.selectedAlert)

  if (isAlertsMode) {
    const customQ = (body?.question || '').trim()
    const targetAlerts = body?.selectedAlert
      ? [body.selectedAlert]
      : alertsList

    const { fullText: fallbackAlertSummary, alertExplanations } = buildAlertsExecutiveBriefing(
      memberName,
      targetAlerts,
      body?.categoryFilter,
      customQ
    )

    const singleExp = body?.selectedAlert
      ? alertExplanations[body.selectedAlert.id] || buildDetailedExplanationForAlert(body.selectedAlert)
      : undefined

    const alertsDigestText = targetAlerts
      .map(
        (a, idx) =>
          `${idx + 1}. [${a.category} / ${a.subType}] (${a.priority || 'normal'} priority, ${a.timestamp}, ${a.unread ? 'UNREAD' : 'Read'}) Title: "${a.title}" — Actor: ${a.actorName || 'ConnectLn'} (${a.actorRole || 'System'}) — Details: "${a.description}" — Action Button: "${a.actionText || 'Open'}"`
      )
      .join('\n')

    const noctisAlertsPrompt = body?.selectedAlert
      ? `You are Noctis, the AI Alert & Signal Intelligence engine inside ConnectLn (https://www.connectln.app).\n` +
        `Explain in clear, authoritative detail what this specific alert represents, why it matters operationally/clinically/technically, and the exact steps ${memberName} should take:\n` +
        `${alertsDigestText}\n` +
        (customQ ? `\nMember's specific question about this alert: "${customQ}"` : '')
      : `You are Noctis, the AI Alert & Signal Intelligence engine inside ConnectLn (https://www.connectln.app).\n` +
        `The signed-in member is ${memberName}${body?.profile?.profession ? ` (${body.profile.profession})` : ''}.\n` +
        `Below are the active alerts in ${memberName}'s ConnectLn Alerts feed:\n${alertsDigestText}\n\n` +
        (customQ
          ? `Answer the member's question about their alerts based on the signals above: "${customQ}"`
          : `Provide a structured executive explanation of what these alerts represent across Security/Clinical Safety, Career Signals, Solutions/Marketplace, Learning, and Network, highlighting unread and critical advisories first and what actions to take.`)

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
          turns: [{ role: 'user', content: noctisAlertsPrompt }],
          language: body?.language || 'English',
          context: 'ConnectLn'
        }),
        signal: ctrl.signal,
        cache: 'no-store'
      })
      if (res.ok) {
        const data = (await res.json()) as { text?: string }
        if (data?.text && data.text.trim()) {
          if (singleExp) {
            singleExp.liveNoctisNote = data.text.trim()
          }
          return NextResponse.json(
            {
              text: data.text.trim(),
              fallbackSummary: fallbackAlertSummary,
              alertExplanations,
              singleExplanation: singleExp,
              source: 'noctis-live-api',
              analyzedCount: targetAlerts.length,
              timestampIso: new Date().toISOString()
            },
            { headers: { 'cache-control': 'no-store' } }
          )
        }
      }
    } catch {
      // Fall through to structured Noctis alert explanation engine
    } finally {
      clearTimeout(timer)
    }

    return NextResponse.json(
      {
        text: fallbackAlertSummary,
        fallbackSummary: fallbackAlertSummary,
        alertExplanations,
        singleExplanation: singleExp,
        source: 'noctis-alert-engine',
        analyzedCount: targetAlerts.length,
        timestampIso: new Date().toISOString()
      },
      { headers: { 'cache-control': 'no-store' } }
    )
  }

  const inboxThreads = Array.isArray(body?.inboxThreads) ? body!.inboxThreads!.slice(0, 25) : []
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
