export interface DocStyleTheme {
  id: string
  name: string
  swatchPrimary: string
  swatchAccent: string
  pageBg: string
  headingColor: string
  fontFamily: string
  lineSpacing: '1.0' | '1.15' | '1.5' | '2.0'
  desc: string
}

export const DOC_STYLE_THEMES: DocStyleTheme[] = [
  {
    id: 'executive-navy',
    name: 'Executive Navy',
    swatchPrimary: '#0B1F3A',
    swatchAccent: '#0B5CAD',
    pageBg: '#FFFFFF',
    headingColor: '#0B5CAD',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    lineSpacing: '1.5',
    desc: 'Crisp boardroom typography with ConnectLn ocean accents.',
  },
  {
    id: 'editorial-ivory',
    name: 'Editorial Ivory',
    swatchPrimary: '#292524',
    swatchAccent: '#B45309',
    pageBg: '#FAF7F2',
    headingColor: '#92400E',
    fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
    lineSpacing: '1.5',
    desc: 'Warm magazine paper feel ideal for briefs and proposals.',
  },
  {
    id: 'emerald-field',
    name: 'Emerald Field',
    swatchPrimary: '#064E3B',
    swatchAccent: '#107C41',
    pageBg: '#FFFFFF',
    headingColor: '#047857',
    fontFamily: 'Verdana, Geneva, Tahoma, sans-serif',
    lineSpacing: '1.15',
    desc: 'Clean sustainability, clinical, and operations theme.',
  },
  {
    id: 'warm-terracotta',
    name: 'Warm Terracotta',
    swatchPrimary: '#7C2D12',
    swatchAccent: '#C84B28',
    pageBg: '#FEFCE8',
    headingColor: '#C2410C',
    fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
    lineSpacing: '1.5',
    desc: 'Distinctive warm contrast for creative & client decks.',
  },
  {
    id: 'nordic-slate',
    name: 'Nordic Slate',
    swatchPrimary: '#0F172A',
    swatchAccent: '#0284C7',
    pageBg: '#F1F5F9',
    headingColor: '#0369A1',
    fontFamily: 'Arial, Helvetica, sans-serif',
    lineSpacing: '1.15',
    desc: 'Cool architectural tone for technical & compliance SOPs.',
  },
  {
    id: 'academic-classic',
    name: 'Academic Classic',
    swatchPrimary: '#1E293B',
    swatchAccent: '#4338CA',
    pageBg: '#FFFFFF',
    headingColor: '#3730A3',
    fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
    lineSpacing: '2.0',
    desc: 'Double-spaced formal layout for citations & research papers.',
  },
]

function escapeHtml(raw: string): string {
  return String(raw ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export type DocDiagramKind = 'process_3step' | 'timeline_roadmap' | 'kpi_strip' | 'org_tree'

export function buildDiagramHtml(kind: DocDiagramKind): string {
  if (kind === 'process_3step') {
    return `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:14px 0;">
      <div style="background:#FAF7F2;border:1px solid #E7E2DA;border-top:4px solid #0B1F3A;border-radius:10px;padding:12px;">
        <p style="margin:0 0 4px 0;font-size:10px;font-weight:800;color:#0B5CAD;text-transform:uppercase;">Stage 01</p>
        <p style="margin:0 0 4px 0;font-weight:800;font-size:13px;color:#0B1F3A;">Discovery &amp; Scope</p>
        <p style="margin:0;font-size:12px;color:#475569;">Align goals, stakeholders, and deliverables.</p>
      </div>
      <div style="background:#FAF7F2;border:1px solid #E7E2DA;border-top:4px solid #0B5CAD;border-radius:10px;padding:12px;">
        <p style="margin:0 0 4px 0;font-size:10px;font-weight:800;color:#0B5CAD;text-transform:uppercase;">Stage 02</p>
        <p style="margin:0 0 4px 0;font-weight:800;font-size:13px;color:#0B1F3A;">Execution Sprint</p>
        <p style="margin:0;font-size:12px;color:#475569;">Build core milestones with weekly QA checks.</p>
      </div>
      <div style="background:#FAF7F2;border:1px solid #E7E2DA;border-top:4px solid #107C41;border-radius:10px;padding:12px;">
        <p style="margin:0 0 4px 0;font-size:10px;font-weight:800;color:#107C41;text-transform:uppercase;">Stage 03</p>
        <p style="margin:0 0 4px 0;font-weight:800;font-size:13px;color:#0B1F3A;">Sign-Off &amp; Handoff</p>
        <p style="margin:0;font-size:12px;color:#475569;">Deliver audited artifacts via ConnectLn Sign.</p>
      </div>
    </div><p></p>`
  }
  if (kind === 'timeline_roadmap') {
    return `<div style="border-left:3px solid #0B5CAD;padding-left:14px;margin:14px 0;">
      <p style="margin:0 0 8px 0;font-size:13px;"><strong>Week 1 — Kickoff &amp; Audit:</strong> Baseline review and requirement lock.</p>
      <p style="margin:0 0 8px 0;font-size:13px;"><strong>Week 2 — Build &amp; Draft:</strong> Core implementation and internal walkthrough.</p>
      <p style="margin:0;font-size:13px;"><strong>Week 3 — Final Review &amp; Approval:</strong> Client sign-off and production release.</p>
    </div><p></p>`
  }
  if (kind === 'kpi_strip') {
    return `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:14px 0;">
      <div style="background:#0B1F3A;color:#FFFFFF;border-radius:10px;padding:12px;text-align:center;">
        <p style="margin:0;font-size:20px;font-weight:900;color:#38BDF8;">98.4%</p>
        <p style="margin:2px 0 0 0;font-size:11px;color:#CBD5E1;">On-Time Delivery</p>
      </div>
      <div style="background:#0B1F3A;color:#FFFFFF;border-radius:10px;padding:12px;text-align:center;">
        <p style="margin:0;font-size:20px;font-weight:900;color:#34D399;">$42,500</p>
        <p style="margin:2px 0 0 0;font-size:11px;color:#CBD5E1;">Projected Value</p>
      </div>
      <div style="background:#0B1F3A;color:#FFFFFF;border-radius:10px;padding:12px;text-align:center;">
        <p style="margin:0;font-size:20px;font-weight:900;color:#FBBF24;">14 Days</p>
        <p style="margin:2px 0 0 0;font-size:11px;color:#CBD5E1;">Target Cycle</p>
      </div>
    </div><p></p>`
  }
  return `<div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:10px;padding:14px;margin:14px 0;text-align:center;">
    <div style="display:inline-block;background:#0B1F3A;color:#FFFFFF;padding:6px 16px;border-radius:8px;font-size:12px;font-weight:800;margin-bottom:10px;">Program Sponsor / Lead</div>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;">
      <div style="background:#FFFFFF;border:1px solid #0B5CAD;border-radius:8px;padding:6px;font-size:11px;font-weight:700;color:#0B1F3A;">Operations Track</div>
      <div style="background:#FFFFFF;border:1px solid #0B5CAD;border-radius:8px;padding:6px;font-size:11px;font-weight:700;color:#0B1F3A;">Engineering &amp; QA</div>
      <div style="background:#FFFFFF;border:1px solid #0B5CAD;border-radius:8px;padding:6px;font-size:11px;font-weight:700;color:#0B1F3A;">Client Success</div>
    </div>
  </div><p></p>`
}

export function buildBannerTitleHtml(titleText: string): string {
  return `<div style="background:linear-gradient(135deg,#0B1F3A 0%,#0B5CAD 100%);color:#FFFFFF;border-radius:12px;padding:18px 22px;margin:14px 0;">
    <p style="margin:0 0 4px 0;font-size:10px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#7DD3FC;">Featured Section</p>
    <h2 style="margin:0;color:#FFFFFF;font-size:22px;font-weight:900;">${escapeHtml(titleText || 'Key Executive Highlight')}</h2>
  </div><p></p>`
}

export function buildDropCapHtml(paragraphText?: string): string {
  const txt = (paragraphText || 'In today’s fast-moving operating environment, teams succeed when specifications, budgets, and commitments live in one auditable workspace.').trim()
  const first = escapeHtml(txt.charAt(0).toUpperCase())
  const rest = escapeHtml(txt.slice(1))
  return `<p style="font-size:14px;line-height:1.6;"><span style="float:left;font-size:40px;line-height:0.85;font-weight:900;color:#0B5CAD;padding-right:8px;padding-top:3px;">${first}</span>${rest}</p><p></p>`
}

export function buildInlineChartHtml(title = 'Quarterly Performance Snapshot'): string {
  const bars = [
    { label: 'Q1', val: 68, h: 68, color: '#0B1F3A' },
    { label: 'Q2', val: 82, h: 82, color: '#0B5CAD' },
    { label: 'Q3', val: 94, h: 94, color: '#0284C7' },
    { label: 'Q4', val: 108, h: 108, color: '#107C41' },
  ]
  return `<div style="border:1px solid #E7E2DA;background:#FAF7F2;border-radius:12px;padding:14px 16px;margin:14px 0;">
    <p style="margin:0 0 10px 0;font-size:12px;font-weight:800;color:#0B1F3A;">${escapeHtml(title)}</p>
    <div style="display:flex;align-items:flex-end;gap:18px;height:120px;padding:8px 12px 0 12px;border-bottom:1px solid #CBD5E1;">
      ${bars
        .map(
          (b) =>
            `<div style="flex:1;text-align:center;"><div style="font-size:10px;font-weight:700;color:#475569;margin-bottom:3px;">${b.val}%</div><div style="height:${Math.round(
              b.h * 0.78
            )}px;background:${b.color};border-radius:6px 6px 0 0;"></div></div>`
        )
        .join('')}
    </div>
    <div style="display:flex;gap:18px;padding:4px 12px 0 12px;">
      ${bars.map((b) => `<div style="flex:1;text-align:center;font-size:11px;font-weight:700;color:#0B1F3A;">${b.label}</div>`).join('')}
    </div>
  </div><p></p>`
}

export function buildEquationHtml(preset: 'quadratic' | 'pythagorean' | 'roi' | 'summation'): string {
  const formulas: Record<string, { label: string; eq: string }> = {
    quadratic: { label: 'Quadratic Formula', eq: 'x = (-b ± √(b² - 4ac)) / 2a' },
    pythagorean: { label: 'Pythagorean Theorem', eq: 'a² + b² = c²' },
    roi: { label: 'Return on Investment', eq: 'ROI (%) = [(Net Gain - Cost) / Cost] × 100' },
    summation: { label: 'Arithmetic Series Sum', eq: 'Sₙ = Σᵢ₌₁ⁿ xᵢ = n · (x₁ + xₙ) / 2' },
  }
  const picked = formulas[preset] || formulas.roi
  return `<div style="background:#F8FAFC;border:1px solid #CBD5E1;border-left:4px solid #0B5CAD;border-radius:8px;padding:10px 14px;margin:10px 0;font-family:Georgia,serif;">
    <span style="font-size:10px;font-weight:700;text-transform:uppercase;color:#64748B;display:block;margin-bottom:2px;">${picked.label}</span>
    <span style="font-size:16px;font-weight:700;color:#0B1F3A;">${picked.eq}</span>
  </div><p></p>`
}

export function buildEsignFieldHtml(roleLabel = 'Client Signer'): string {
  return `<span contenteditable="false" data-esign-field="true" style="display:inline-block;border:1.5px dashed #4338CA;background:#EEF2FF;color:#3730A3;border-radius:6px;padding:3px 10px;font-size:11px;font-weight:800;margin:0 4px;">[✍ Sign Here · ${escapeHtml(roleLabel)}]</span> `
}

export function buildBookmarkHtml(anchorName: string): string {
  const slug = (anchorName || 'section-anchor').toLowerCase().replace(/[^a-z0-9_-]+/g, '-')
  return `<span id="${escapeHtml(slug)}" data-bookmark="${escapeHtml(slug)}" style="display:inline-block;background:#FEF3C7;color:#92400E;border-radius:4px;padding:1px 6px;font-size:10px;font-weight:800;margin-right:4px;">⚑ ${escapeHtml(anchorName || 'Bookmark')}</span>`
}

export type CitationStyle = 'APA' | 'MLA' | 'Chicago' | 'IEEE'

export interface DocCitationSource {
  id: string
  author: string
  year: string
  title: string
  publisher: string
  url?: string
}

export const DEFAULT_CITATION_SOURCES: DocCitationSource[] = [
  {
    id: 'src_mensah_2026',
    author: 'Mensah, Ama',
    year: '2026',
    title: 'Zero-Trust Field Collaboration & Auditable Contract Workflows',
    publisher: 'ConnectLn Research Press',
    url: 'https://conectln.com',
  },
  {
    id: 'src_osei_2025',
    author: 'Osei, Kwame',
    year: '2025',
    title: 'Precision Project Estimating for Regional Contractors',
    publisher: 'Expedite Technical Series',
  },
]

export function formatInlineCitation(source: DocCitationSource, style: CitationStyle, indexOneBased = 1): string {
  const surname = source.author.split(',')[0].trim() || source.author
  if (style === 'IEEE') return `[${indexOneBased}]`
  if (style === 'MLA') return `(${surname})`
  if (style === 'Chicago') return `(${surname} ${source.year})`
  return `(${surname}, ${source.year})`
}

export function formatBibliographyEntry(source: DocCitationSource, style: CitationStyle, indexOneBased = 1): string {
  const author = escapeHtml(source.author)
  const year = escapeHtml(source.year)
  const title = escapeHtml(source.title)
  const pub = escapeHtml(source.publisher)
  const urlPart = source.url ? ` Available: ${escapeHtml(source.url)}` : ''
  if (style === 'IEEE') {
    return `[${indexOneBased}] ${author}, <em>${title}</em>. ${pub}, ${year}.${urlPart}`
  }
  if (style === 'MLA') {
    return `${author}. <em>${title}</em>. ${pub}, ${year}.${urlPart}`
  }
  if (style === 'Chicago') {
    return `${author}. ${year}. <em>${title}</em>. ${pub}.${urlPart}`
  }
  return `${author} (${year}). <em>${title}</em>. ${pub}.${urlPart}`
}

export function buildBibliographyHtml(sources: DocCitationSource[], style: CitationStyle): string {
  if (sources.length === 0) {
    return '<p><em>No citation sources added yet.</em></p>'
  }
  const rows = sources
    .map((s, idx) => `<li style="margin:6px 0;line-height:1.5;">${formatBibliographyEntry(s, style, idx + 1)}</li>`)
    .join('')
  return `<div data-bibliography="true" style="border-top:2px solid #0B1F3A;margin-top:20px;padding-top:12px;">
    <h2 style="margin:0 0 8px 0;font-size:16px;color:#0B1F3A;">References (${style})</h2>
    <ul style="list-style:none;padding:0;margin:0;font-size:12.5px;color:#334155;">${rows}</ul>
  </div><p></p>`
}

export function buildFootnoteHtml(numberIdx: number, noteText: string): string {
  return `<sup>[${numberIdx}]</sup><p style="font-size:11px;color:#475569;border-top:1px dashed #CBD5E1;padding-top:4px;margin-top:8px;"><strong>[${numberIdx}]</strong> ${escapeHtml(noteText || 'Explanatory reference note.')}</p>`
}

export function buildCaptionHtml(kind: 'Figure' | 'Table', numberIdx: number, captionText: string): string {
  return `<p style="font-size:11.5px;font-style:italic;color:#475569;margin:4px 0 12px 0;"><strong>${kind} ${numberIdx}:</strong> ${escapeHtml(captionText || 'Summary exhibit.')}</p>`
}

export interface MergeRecipient {
  id: string
  FullName: string
  Company: string
  Role: string
  Email: string
  Amount: string
  Date: string
}

export const MERGE_TOKENS = ['{{FullName}}', '{{Company}}', '{{Role}}', '{{Email}}', '{{Amount}}', '{{Date}}'] as const

export const DEFAULT_MERGE_RECIPIENTS: MergeRecipient[] = [
  {
    id: 'rec_1',
    FullName: 'Grace Owusu',
    Company: 'Harborview Builders LLC',
    Role: 'Operations Director',
    Email: 'grace.owusu@harborview.example',
    Amount: '$14,800',
    Date: 'December 1, 2026',
  },
  {
    id: 'rec_2',
    FullName: 'Marcus Vance',
    Company: 'Chesapeake Civic Partners',
    Role: 'Procurement Lead',
    Email: 'mvance@chesapeake.example',
    Amount: '$22,450',
    Date: 'December 1, 2026',
  },
  {
    id: 'rec_3',
    FullName: 'Elena Alvarez',
    Company: 'Potomac Solar Works',
    Role: 'VP of Delivery',
    Email: 'elena@potomacsolar.example',
    Amount: '$9,600',
    Date: 'December 1, 2026',
  },
]

export function applyMergeTemplate(html: string, recipient: MergeRecipient): string {
  return String(html || '')
    .replace(/\{\{FullName\}\}/g, escapeHtml(recipient.FullName))
    .replace(/\{\{Company\}\}/g, escapeHtml(recipient.Company))
    .replace(/\{\{Role\}\}/g, escapeHtml(recipient.Role))
    .replace(/\{\{Email\}\}/g, escapeHtml(recipient.Email))
    .replace(/\{\{Amount\}\}/g, escapeHtml(recipient.Amount))
    .replace(/\{\{Date\}\}/g, escapeHtml(recipient.Date))
}

export function buildEnvelopeHtml(senderName: string, recipient: MergeRecipient): string {
  return `<div style="border:1px solid #94A3B8;background:#FFFFFF;border-radius:8px;padding:24px;margin:14px 0;max-width:560px;">
    <p style="margin:0 0 24px 0;font-size:11px;color:#475569;line-height:1.4;"><strong>FROM:</strong><br/>${escapeHtml(senderName || 'ConnectLn Member')}<br/>ConnectLn 360 Workspace</p>
    <div style="padding-left:38%;">
      <p style="margin:0;font-size:13px;font-weight:700;color:#0B1F3A;">${escapeHtml(recipient.FullName)}</p>
      <p style="margin:2px 0;font-size:12px;color:#334155;">${escapeHtml(recipient.Role)} · ${escapeHtml(recipient.Company)}</p>
      <p style="margin:0;font-size:12px;color:#0B5CAD;">${escapeHtml(recipient.Email)}</p>
    </div>
  </div><p></p>`
}

export function buildLabelsSheetHtml(recipients: MergeRecipient[]): string {
  const list = recipients.length > 0 ? recipients : DEFAULT_MERGE_RECIPIENTS
  const cards = list
    .map(
      (r) =>
        `<div style="border:1px dashed #CBD5E1;border-radius:8px;padding:12px;background:#FAF7F2;">
          <p style="margin:0;font-size:12.5px;font-weight:800;color:#0B1F3A;">${escapeHtml(r.FullName)}</p>
          <p style="margin:2px 0 0 0;font-size:11px;color:#475569;">${escapeHtml(r.Company)}</p>
          <p style="margin:2px 0 0 0;font-size:10.5px;color:#0B5CAD;">${escapeHtml(r.Email)}</p>
        </div>`
    )
    .join('')
  return `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0;">${cards}</div><p></p>`
}

export interface AccessibilityCheckItem {
  status: 'pass' | 'warn'
  title: string
  detail: string
}

export function runAccessibilityAudit(html: string): { score: number; checks: AccessibilityCheckItem[] } {
  const source = String(html || '')
  const checks: AccessibilityCheckItem[] = []

  const hasH1 = /<h1\b/i.test(source)
  checks.push({
    status: hasH1 ? 'pass' : 'warn',
    title: 'Primary Heading (H1)',
    detail: hasH1
      ? 'Document includes an H1 title heading for screen-reader navigation.'
      : 'Add a Heading 1 (H1) at the top so readers can navigate your document structure.',
  })

  const imgTags = source.match(/<img\b[^>]*>/gi) || []
  const imgsMissingAlt = imgTags.filter((tag) => !/alt\s*=\s*["'][^"']+["']/i.test(tag))
  checks.push({
    status: imgsMissingAlt.length === 0 ? 'pass' : 'warn',
    title: 'Image Alternative Text',
    detail:
      imgTags.length === 0
        ? 'No images detected; no alt-text issues.'
        : imgsMissingAlt.length === 0
        ? `All ${imgTags.length} image(s) include descriptive alt attributes.`
        : `${imgsMissingAlt.length} image(s) lack descriptive alt text.`,
  })

  const hasTable = /<table\b/i.test(source)
  const hasTh = /<th\b/i.test(source)
  if (hasTable) {
    checks.push({
      status: hasTh ? 'pass' : 'warn',
      title: 'Structured Table Headers',
      detail: hasTh
        ? 'Tables use semantic header cells (<th>).'
        : 'Add a header row (<th>) to tables for clearer assistive reading.',
    })
  } else {
    checks.push({
      status: 'pass',
      title: 'Structured Table Headers',
      detail: 'Clean flow without unlabelled tables.',
    })
  }

  const plain = source.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = plain ? plain.split(' ').length : 0
  const hasH2 = /<h2\b/i.test(source)
  const longNoSubheads = words > 180 && !hasH2
  checks.push({
    status: longNoSubheads ? 'warn' : 'pass',
    title: 'Readable Section Breaks',
    detail: longNoSubheads
      ? 'Consider splitting long body copy with Heading 2 subheadings.'
      : 'Section headings and length keep scanning effortless.',
  })

  const passCount = checks.filter((c) => c.status === 'pass').length
  const score = Math.round((passCount / checks.length) * 100)
  return { score, checks }
}

const THESAURUS_MAP: Record<string, string[]> = {
  improve: ['enhance', 'strengthen', 'elevate', 'refine', 'optimize'],
  fast: ['rapid', 'swift', 'streamlined', 'responsive', 'accelerated'],
  good: ['strong', 'effective', 'reliable', 'well-crafted', 'valuable'],
  important: ['critical', 'essential', 'pivotal', 'high-impact', 'key'],
  help: ['support', 'enable', 'empower', 'facilitate', 'assist'],
  build: ['construct', 'architect', 'deliver', 'craft', 'establish'],
  check: ['verify', 'audit', 'inspect', 'validate', 'review'],
  plan: ['roadmap', 'strategy', 'blueprint', 'schedule', 'approach'],
  report: ['brief', 'summary', 'analysis', 'dossier', 'update'],
  send: ['deliver', 'dispatch', 'route', 'transmit', 'share'],
  team: ['squad', 'group', 'workforce', 'unit', 'stakeholders'],
  cost: ['investment', 'budget', 'spend', 'outlay', 'pricing'],
  show: ['demonstrate', 'illustrate', 'present', 'highlight', 'reveal'],
  change: ['revise', 'transform', 'update', 'adapt', 'refine'],
  safe: ['secure', 'verified', 'compliant', 'resilient', 'protected'],
  client: ['partner', 'customer', 'stakeholder', 'account', 'organization'],
}

export function lookupSynonyms(word: string): string[] {
  const key = word.trim().toLowerCase().replace(/[^a-z]/g, '')
  if (!key) return []
  if (THESAURUS_MAP[key]) return THESAURUS_MAP[key]
  const partial = Object.keys(THESAURUS_MAP).find((k) => k.startsWith(key) || key.startsWith(k))
  return partial ? THESAURUS_MAP[partial] : ['clear', 'concise', 'impactful', 'verified', 'structured']
}

export function acceptAllTrackedChanges(html: string): string {
  return String(html || '')
    .replace(/<ins\b[^>]*data-cln-track=["']ins["'][^>]*>([\s\S]*?)<\/ins>/gi, '$1')
    .replace(/<del\b[^>]*data-cln-track=["']del["'][^>]*>[\s\S]*?<\/del>/gi, '')
}

export function rejectAllTrackedChanges(html: string): string {
  return String(html || '')
    .replace(/<ins\b[^>]*data-cln-track=["']ins["'][^>]*>[\s\S]*?<\/ins>/gi, '')
    .replace(/<del\b[^>]*data-cln-track=["']del["'][^>]*>([\s\S]*?)<\/del>/gi, '$1')
}

export interface DocsCommandItem {
  id: string
  label: string
  category: string
  keywords: string
}

export const DOCS_COMMAND_CATALOG: DocsCommandItem[] = [
  { id: 'open_noctis', label: 'Ask Noctis Writing Studio', category: 'Noctis AI', keywords: 'ai assistant write draft summarize translate' },
  { id: 'open_hub', label: 'Open ConnectLn Studio Hub', category: 'Workspace', keywords: 'home recent templates new open backstage' },
  { id: 'insert_table', label: 'Insert Table', category: 'Insert', keywords: 'grid rows columns matrix' },
  { id: 'insert_diagram', label: 'Insert 3-Step Diagram', category: 'Insert', keywords: 'diagram process flow timeline kpi' },
  { id: 'insert_banner', label: 'Insert Styled Banner Title', category: 'Insert', keywords: 'banner heading decorative callout' },
  { id: 'insert_chart', label: 'Insert Performance Chart', category: 'Insert', keywords: 'chart bar graph metrics' },
  { id: 'insert_signature', label: 'Insert Signature Block', category: 'Insert', keywords: 'sign e-sign approval contract' },
  { id: 'insert_toc', label: 'Insert Table of Contents', category: 'Cite', keywords: 'toc headings index outline' },
  { id: 'open_cite', label: 'Citations & Bibliography (APA/MLA/IEEE)', category: 'Cite', keywords: 'citation reference footnote source' },
  { id: 'open_style', label: 'Switch ConnectLn Theme & Style', category: 'Style', keywords: 'design theme palette typography colors' },
  { id: 'toggle_landscape', label: 'Toggle Landscape Orientation', category: 'Layout', keywords: 'orientation portrait wide page setup' },
  { id: 'open_merge', label: 'Batch Mail Merge & Labels', category: 'Merge', keywords: 'recipients mail merge envelope labels csv' },
  { id: 'run_accessibility', label: 'Run Accessibility Audit', category: 'Review', keywords: 'a11y alt text heading contrast check' },
  { id: 'toggle_track', label: 'Toggle Track Changes', category: 'Review', keywords: 'markup revisions accept reject diff' },
  { id: 'open_comments', label: 'Document Comments & Notes', category: 'Review', keywords: 'comment review feedback thread' },
  { id: 'open_history', label: 'Version History & Snapshots', category: 'Review', keywords: 'checkpoint restore backup snapshot' },
  { id: 'open_print', label: 'Print Preview / Save Clean PDF', category: 'PDF & Sign', keywords: 'pdf print export preview' },
  { id: 'send_sign', label: 'Send to ConnectLn Sign (SHA-256)', category: 'PDF & Sign', keywords: 'signature seal audit contract' },
  { id: 'open_find', label: 'Find & Replace Text', category: 'Home', keywords: 'search replace ctrl+f' },
  { id: 'open_stats', label: 'Word Count & Document Stats', category: 'Review', keywords: 'words characters pages reading time' },
]
