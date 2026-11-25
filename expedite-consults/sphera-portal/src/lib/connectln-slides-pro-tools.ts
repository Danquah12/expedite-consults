import type { SlideThemePalette } from './connectln-studio-export'
import type {
  SlideExtraElement,
  StudioDeckRecord,
} from './connectln-studio-storage'

export type SlideMotionPresetId =
  | 'none'
  | 'fade_in'
  | 'rise_up'
  | 'slide_left'
  | 'zoom_pop'
  | 'pulse_glow'

export const SLIDE_MOTION_PRESETS: Array<{
  id: SlideMotionPresetId
  label: string
  desc: string
}> = [
  { id: 'none', label: 'None', desc: 'Instant static entrance' },
  { id: 'fade_in', label: 'Fade In', desc: 'Gentle opacity reveal' },
  { id: 'rise_up', label: 'Rise Up', desc: 'Smooth upward entrance' },
  { id: 'slide_left', label: 'Slide Left', desc: 'Directional sweep from right' },
  { id: 'zoom_pop', label: 'Zoom Pop', desc: 'Focused scale emphasis' },
  { id: 'pulse_glow', label: 'Pulse Glow', desc: 'Subtle key-point highlight' },
]

export const SLIDE_FONT_PAIRINGS: Array<{
  id: string
  label: string
  fontFamily: string
}> = [
  {
    id: 'editorial-sans',
    label: 'Editorial Sans',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  {
    id: 'keynote-serif',
    label: 'Keynote Serif',
    fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
  },
  {
    id: 'executive-grotesk',
    label: 'Executive Grotesk',
    fontFamily: 'Verdana, Geneva, Tahoma, sans-serif',
  },
  {
    id: 'technical-mono',
    label: 'Technical Mono',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
  {
    id: 'modern-humanist',
    label: 'Modern Humanist',
    fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
  },
]

export type SlideDiagramKind =
  | 'process_3step'
  | 'kpi_strip'
  | 'milestone_timeline'
  | 'banner_title'

export function buildSlideDiagramElements(
  kind: SlideDiagramKind,
  theme: SlideThemePalette
): SlideExtraElement[] {
  const ts = Date.now()
  if (kind === 'process_3step') {
    return [
      {
        id: `el_${ts}_1`,
        kind: 'callout',
        text: 'Step 01 · Align Scope & Goals',
        bgHex: theme.surfaceHex,
        textHex: theme.primaryHex,
      },
      {
        id: `el_${ts}_2`,
        kind: 'arrow',
        text: 'Step 02 · Build & Validate →',
        bgHex: theme.surfaceHex,
        textHex: theme.accentHex,
      },
      {
        id: `el_${ts}_3`,
        kind: 'badge',
        text: 'Step 03 · Launch & Measure',
        bgHex: theme.accentHex,
        textHex: '#0B1F3A',
      },
    ]
  }
  if (kind === 'kpi_strip') {
    return [
      {
        id: `el_${ts}_k1`,
        kind: 'badge',
        text: '98.5% Reliability',
        bgHex: theme.surfaceHex,
        textHex: theme.accentHex,
      },
      {
        id: `el_${ts}_k2`,
        kind: 'badge',
        text: '+34% Velocity',
        bgHex: theme.surfaceHex,
        textHex: theme.primaryHex,
      },
      {
        id: `el_${ts}_k3`,
        kind: 'badge',
        text: '14-Day Cycle',
        bgHex: theme.surfaceHex,
        textHex: theme.accentHex,
      },
    ]
  }
  if (kind === 'milestone_timeline') {
    return [
      {
        id: `el_${ts}_m1`,
        kind: 'callout',
        text: 'Q1: Baseline & Design',
        bgHex: theme.surfaceHex,
        textHex: theme.textHex,
      },
      {
        id: `el_${ts}_m2`,
        kind: 'callout',
        text: 'Q2: Pilot Rollout',
        bgHex: theme.surfaceHex,
        textHex: theme.accentHex,
      },
      {
        id: `el_${ts}_m3`,
        kind: 'callout',
        text: 'Q3: Full Scale',
        bgHex: theme.surfaceHex,
        textHex: theme.primaryHex,
      },
    ]
  }
  return [
    {
      id: `el_${ts}_b`,
      kind: 'callout',
      text: 'KEY EXECUTIVE HIGHLIGHT · VERIFIED OUTCOME',
      bgHex: theme.accentHex,
      textHex: '#0B1F3A',
    },
  ]
}

export interface DeckStatsSummary {
  slideCount: number
  hiddenCount: number
  totalWords: number
  estimatedMinutes: number
  notesCoveragePct: number
  totalComments: number
}

export function computeDeckStats(deck: StudioDeckRecord | undefined): DeckStatsSummary {
  if (!deck) {
    return {
      slideCount: 0,
      hiddenCount: 0,
      totalWords: 0,
      estimatedMinutes: 0,
      notesCoveragePct: 0,
      totalComments: 0,
    }
  }
  let wordCount = 0
  let notesCount = 0
  let totalComments = 0
  let hiddenCount = 0

  for (const s of deck.slides) {
    if (s.hidden) hiddenCount++
    if (s.notes?.trim()) notesCount++
    totalComments += (s.comments || []).length
    const text = [
      s.title,
      s.subtitle,
      s.quote,
      ...(s.bullets || []),
      ...(s.leftBullets || []),
      ...(s.rightBullets || []),
    ]
      .filter(Boolean)
      .join(' ')
    const tokens = text.trim().split(/\s+/).filter(Boolean)
    wordCount += tokens.length
  }

  const slideCount = deck.slides.length
  return {
    slideCount,
    hiddenCount,
    totalWords: wordCount,
    estimatedMinutes: Math.max(1, Math.round((slideCount - hiddenCount) * 1.5)),
    notesCoveragePct:
      slideCount > 0 ? Math.round((notesCount / slideCount) * 100) : 0,
    totalComments,
  }
}

export function runDeckAccessibilityAudit(
  deck: StudioDeckRecord | undefined,
  theme: SlideThemePalette
): {
  score: number
  checks: Array<{ status: 'pass' | 'warn'; title: string; detail: string }>
} {
  const checks: Array<{ status: 'pass' | 'warn'; title: string; detail: string }> = []
  const slides = deck?.slides || []

  const untitled = slides.filter((s) => !s.title?.trim()).length
  checks.push({
    status: untitled === 0 ? 'pass' : 'warn',
    title: 'Descriptive Slide Titles',
    detail:
      untitled === 0
        ? `All ${slides.length} slide(s) define clear navigation headings.`
        : `${untitled} slide(s) are missing a title heading.`,
  })

  const denseSlides = slides.filter((s) => (s.bullets?.length || 0) > 6).length
  checks.push({
    status: denseSlides === 0 ? 'pass' : 'warn',
    title: 'Readable Bullet Density (<= 6 items)',
    detail:
      denseSlides === 0
        ? 'Every slide keeps bullet counts scannable for audiences.'
        : `${denseSlides} slide(s) exceed 6 bullets; consider splitting for clarity.`,
  })

  const notesPct = computeDeckStats(deck).notesCoveragePct
  checks.push({
    status: notesPct >= 40 ? 'pass' : 'warn',
    title: 'Speaker Notes & Caption Support',
    detail:
      notesPct >= 40
        ? `${notesPct}% of slides carry speaker notes for presenter readiness.`
        : `Only ${notesPct}% of slides have speaker notes; use Noctis Pitch Studio to draft notes.`,
  })

  const hasThemeContrast = theme.bgHex.toLowerCase() !== theme.textHex.toLowerCase()
  checks.push({
    status: hasThemeContrast ? 'pass' : 'warn',
    title: 'Theme Foreground/Background Contrast',
    detail: hasThemeContrast
      ? `Theme "${theme.name}" separates surface (${theme.bgHex}) and ink (${theme.textHex}).`
      : 'Foreground and background colors match; pick a distinct contrast theme.',
  })

  const passCount = checks.filter((c) => c.status === 'pass').length
  return { score: Math.round((passCount / checks.length) * 100), checks }
}

export interface SlidesCommandItem {
  id: string
  label: string
  category: string
  keywords: string
}

export const SLIDES_COMMAND_CATALOG: SlidesCommandItem[] = [
  { id: 'open_noctis', label: 'Ask Noctis Pitch Studio', category: 'Noctis AI', keywords: 'ai generate slide speaker notes translate' },
  { id: 'open_hub', label: 'Open ConnectLn Slides Hub', category: 'Workspace', keywords: 'hub backstage templates recent favorites' },
  { id: 'add_slide', label: 'Add New Content Slide', category: 'Home', keywords: 'new slide insert duplicate' },
  { id: 'add_section', label: 'Add Section Divider Slide', category: 'Home', keywords: 'section divider header break' },
  { id: 'insert_diagram', label: 'Insert 3-Step Visual Diagram', category: 'Insert', keywords: 'diagram process step kpi visual' },
  { id: 'insert_table', label: 'Switch Slide to Data Table', category: 'Insert', keywords: 'table rows columns grid' },
  { id: 'insert_chart', label: 'Switch Slide to Live Chart', category: 'Insert', keywords: 'chart bar graph visualization' },
  { id: 'open_design', label: 'Switch Theme & Typography Pairing', category: 'Design', keywords: 'theme colors font master slide' },
  { id: 'open_motion', label: 'Configure Slide Motion Animations', category: 'Motion', keywords: 'animate entrance rise fade zoom preview' },
  { id: 'start_present', label: 'Start Full-Screen Presentation', category: 'Slide Show', keywords: 'present full screen play show' },
  { id: 'open_presenter', label: 'Launch Presenter View with Timer', category: 'Slide Show', keywords: 'presenter rehearse timer next slide notes' },
  { id: 'open_record', label: 'Record Voice Narration & Teleprompter', category: 'Record', keywords: 'record audio voiceover teleprompter' },
  { id: 'open_sorter', label: 'Open Slide Sorter Grid', category: 'View', keywords: 'sorter reorder thumbnails grid' },
  { id: 'open_outline', label: 'Switch to Outline View', category: 'View', keywords: 'outline text edit structure' },
  { id: 'toggle_guides', label: 'Toggle Alignment Guides & Grid', category: 'View', keywords: 'guides gridlines align ruler' },
  { id: 'open_stats', label: 'Deck Statistics & Timing', category: 'Review', keywords: 'stats words minutes coverage' },
  { id: 'run_a11y', label: 'Run Deck Accessibility Audit', category: 'Review', keywords: 'a11y accessibility contrast check' },
  { id: 'open_print', label: 'Print Handouts / Save PDF', category: 'Print', keywords: 'pdf handouts notes print export' },
]
