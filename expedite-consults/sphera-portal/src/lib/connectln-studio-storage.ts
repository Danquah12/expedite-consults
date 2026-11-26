import type { SheetCell } from './connectln-sheets-engine'
import type { SlideExportMetric, SlideThemePalette } from './connectln-studio-export'
import { pushStudioModuleCloud } from './connectln-studio-cloud'

export type DocPaperSize = 'letter' | 'a4' | 'legal'
export type DocOrientation = 'portrait' | 'landscape'
export type DocMarginsPreset = 'normal' | 'narrow' | 'moderate' | 'wide'
export type DocPageBorder = 'none' | 'thin' | 'double' | 'accent'

export interface DocPageSetup {
  paperSize: DocPaperSize
  orientation: DocOrientation
  margins: DocMarginsPreset
  columns: 1 | 2 | 3
  lineSpacing: '1.0' | '1.15' | '1.5' | '2.0'
  headerText: string
  footerText: string
  showPageNumbers: boolean
  watermark: string
  pageBg: string
  pageBorder: DocPageBorder
}

export const DEFAULT_DOC_PAGE_SETUP: DocPageSetup = {
  paperSize: 'letter',
  orientation: 'portrait',
  margins: 'normal',
  columns: 1,
  lineSpacing: '1.5',
  headerText: '',
  footerText: '',
  showPageNumbers: true,
  watermark: '',
  pageBg: '#FFFFFF',
  pageBorder: 'none',
}

export interface DocCommentItem {
  id: string
  author: string
  quote?: string
  text: string
  createdAt: string
  resolved?: boolean
}

export interface DocSnapshotItem {
  id: string
  label: string
  createdAt: string
  contentHtml: string
}

export interface StudioDocRecord {
  id: string
  title: string
  category: string
  contentHtml: string
  updatedAt: string
  createdAt: string
  authorName: string
  starred?: boolean
  pageSetup?: DocPageSetup
  comments?: DocCommentItem[]
  snapshots?: DocSnapshotItem[]
}

export interface SheetChartConfig {
  id: string
  kind: 'bar' | 'line' | 'pie' | 'area'
  title: string
  labelCol: number
  valueCol: number
  startRow: number
  endRow: number
}

export interface SheetConditionalRule {
  id: string
  col: number
  op: 'gt' | 'lt' | 'eq' | 'contains'
  target: string
  bg: string
  color: string
}

export interface SheetValidationRule {
  col: number
  kind: 'list' | 'number_range'
  options?: string[]
  min?: number
  max?: number
}

export interface StudioSheetTab {
  id: string
  name: string
  rowCount: number
  colCount: number
  cells: Record<string, SheetCell>
  charts?: SheetChartConfig[]
  conditionalRules?: SheetConditionalRule[]
  validations?: SheetValidationRule[]
  freezeRow1?: boolean
  freezeColA?: boolean
  colWidths?: Record<number, number>
  comments?: Record<string, string>
}

export interface StudioWorkbookRecord {
  id: string
  title: string
  category: string
  sheets: StudioSheetTab[]
  activeSheetId: string
  updatedAt: string
  createdAt: string
  authorName: string
  starred?: boolean
}

export type SlideLayoutType =
  | 'cover'
  | 'bullets'
  | 'two_column'
  | 'metrics'
  | 'quote'
  | 'visual_split'
  | 'section'
  | 'table'
  | 'chart'
  | 'blank'

export type SlideTransitionType = 'none' | 'fade' | 'slide' | 'zoom' | 'flip'

export interface SlideExtraElement {
  id: string
  kind: 'textbox' | 'callout' | 'badge' | 'shape_rect' | 'arrow'
  text: string
  bgHex: string
  textHex: string
}

export interface SlideChartData {
  kind: 'bar' | 'line' | 'pie'
  title: string
  items: Array<{ label: string; value: number }>
}

export interface SlideTableData {
  headers: string[]
  rows: string[][]
}

export interface SlideCommentItem {
  id: string
  author: string
  text: string
  createdAt: string
}

export interface StudioSlideItem {
  id: string
  layout: SlideLayoutType
  title: string
  subtitle?: string
  bullets?: string[]
  leftTitle?: string
  leftBullets?: string[]
  rightTitle?: string
  rightBullets?: string[]
  metrics?: SlideExportMetric[]
  quote?: string
  quoteAuthor?: string
  imageUrl?: string
  notes?: string
  transition?: SlideTransitionType
  transitionDurationMs?: number
  animateBullets?: boolean
  customBgHex?: string
  hidden?: boolean
  titleAlign?: 'left' | 'center' | 'right'
  tableData?: SlideTableData
  chartData?: SlideChartData
  elements?: SlideExtraElement[]
  comments?: SlideCommentItem[]
}

export interface StudioDeckRecord {
  id: string
  title: string
  category: string
  themeId: string
  slides: StudioSlideItem[]
  updatedAt: string
  createdAt: string
  authorName: string
  starred?: boolean
  aspectRatio?: '16:9' | '4:3'
  footerText?: string
  showSlideNumbers?: boolean
  showDateFooter?: boolean
}

export interface DocTemplateItem {
  id: string
  name: string
  category: string
  description: string
  contentHtml: string
}

export interface SheetTemplateItem {
  id: string
  name: string
  category: string
  description: string
  buildSheets: () => StudioSheetTab[]
}

export interface DeckTemplateItem {
  id: string
  name: string
  category: string
  description: string
  themeId: string
  buildSlides: () => StudioSlideItem[]
}

export const STUDIO_SLIDE_THEMES: SlideThemePalette[] = [
  {
    id: 'connectln-navy',
    name: 'ConnectLn Navy',
    bgHex: '#0B1F3A',
    surfaceHex: '#132D52',
    primaryHex: '#FFFFFF',
    accentHex: '#38BDF8',
    textHex: '#F8FAFC',
    mutedHex: '#CBD5E1',
  },
  {
    id: 'sandstone-editorial',
    name: 'Sandstone Editorial',
    bgHex: '#FAF7F2',
    surfaceHex: '#FFFFFF',
    primaryHex: '#0B1F3A',
    accentHex: '#0067B8',
    textHex: '#0B1F3A',
    mutedHex: '#4B5563',
  },
  {
    id: 'emerald-craft',
    name: 'Emerald Craft',
    bgHex: '#F4FAF6',
    surfaceHex: '#FFFFFF',
    primaryHex: '#064E3B',
    accentHex: '#107C41',
    textHex: '#064E3B',
    mutedHex: '#374151',
  },
  {
    id: 'cobalt-studio',
    name: 'Cobalt Studio',
    bgHex: '#FFFFFF',
    surfaceHex: '#F0F6FF',
    primaryHex: '#0067B8',
    accentHex: '#C84B28',
    textHex: '#0F172A',
    mutedHex: '#475569',
  },
  {
    id: 'midnight-obsidian',
    name: 'Midnight Obsidian',
    bgHex: '#111827',
    surfaceHex: '#1F2937',
    primaryHex: '#F9FAFB',
    accentHex: '#F59E0B',
    textHex: '#F3F4F6',
    mutedHex: '#9CA3AF',
  },
  {
    id: 'terracotta-sunset',
    name: 'Terracotta Sunset',
    bgHex: '#FFF7F3',
    surfaceHex: '#FFFFFF',
    primaryHex: '#9A3412',
    accentHex: '#C84B28',
    textHex: '#1C1917',
    mutedHex: '#57534E',
  },
  {
    id: 'arctic-minimal',
    name: 'Arctic Minimal',
    bgHex: '#F8FAFC',
    surfaceHex: '#FFFFFF',
    primaryHex: '#0F172A',
    accentHex: '#0284C7',
    textHex: '#0F172A',
    mutedHex: '#64748B',
  },
  {
    id: 'royal-slate',
    name: 'Royal Slate',
    bgHex: '#1E1B4B',
    surfaceHex: '#312E81',
    primaryHex: '#FFFFFF',
    accentHex: '#A5B4FC',
    textHex: '#EEF2FF',
    mutedHex: '#C7D2FE',
  },
]

export function getSlideThemeById(themeId: string): SlideThemePalette {
  return STUDIO_SLIDE_THEMES.find((t) => t.id === themeId) || STUDIO_SLIDE_THEMES[1]
}

export const DOC_TEMPLATES: DocTemplateItem[] = [
  {
    id: 'blank-doc',
    name: 'Blank Document',
    category: 'General',
    description: 'Clean ConnectLn Docs page ready for structured writing.',
    contentHtml: '<h1>Untitled Document</h1><p>Start drafting your proposal, memo, or field report here...</p>',
  },
  {
    id: 'exec-proposal',
    name: 'Executive Business Proposal',
    category: 'Business',
    description: 'Client-ready scope, deliverables, milestones, and commercial summary.',
    contentHtml: `<h1>Executive Project Proposal</h1>
<p><strong>Prepared via ConnectLn Docs</strong> · Verified Partner Brief</p>
<h2>1. Executive Summary</h2>
<p>This proposal outlines our structured delivery plan, field supervision standards, and milestone-based schedule designed for predictable execution and transparent budgeting.</p>
<h2>2. Scope &amp; Core Deliverables</h2>
<ul>
  <li>Site assessment, permitting verification, and mobilization schedule</li>
  <li>Primary installation &amp; structural fabrication with weekly QA checkpoints</li>
  <li>Commissioning, final safety walk-through, and warranty documentation</li>
</ul>
<h2>3. Milestone &amp; Fee Schedule</h2>
<table>
  <tr><th>Milestone</th><th>Deliverable</th><th>Target Week</th><th>Allocation</th></tr>
  <tr><td>Phase 1</td><td>Mobilization &amp; Materials</td><td>Week 1 – 2</td><td>35%</td></tr>
  <tr><td>Phase 2</td><td>Core Execution &amp; Inspection</td><td>Week 3 – 5</td><td>45%</td></tr>
  <tr><td>Phase 3</td><td>Handover &amp; Sign-Off</td><td>Week 6</td><td>20%</td></tr>
</table>
<blockquote>All deliverables are tracked inside the ConnectLn 360 Business Workspace with timestamped verification.</blockquote>`,
  },
  {
    id: 'service-sow',
    name: 'Service Agreement & SOW',
    category: 'Legal & Ops',
    description: 'Clean Statement of Work with SLA terms, roles, and acceptance sign-off.',
    contentHtml: `<h1>Statement of Work (SOW)</h1>
<p><strong>Reference:</strong> CLN-SOW-2026-01 · <strong>Status:</strong> Draft for Review</p>
<h2>Parties &amp; Engagement</h2>
<p>This Statement of Work governs technical services, turnaround commitments, and acceptance criteria between the Client Organization and Service Provider on ConnectLn.</p>
<h2>Service Level Commitments</h2>
<ul>
  <li>Response window within 4 business hours for priority operational requests</li>
  <li>Written weekly progress summary posted to the shared ConnectLn channel</li>
  <li>Full compliance with local safety, licensing, and insurance regulations</li>
</ul>
<h2>Acceptance &amp; Authorization</h2>
<p>Authorized signatures confirm agreement to the scope, fee structure, and delivery schedule outlined above.</p>`,
  },
  {
    id: 'meeting-notes',
    name: 'Team Meeting Minutes',
    category: 'Operations',
    description: 'Capture agenda topics, decisions made, owners, and due dates.',
    contentHtml: `<h1>Weekly Operations Sync — Minutes</h1>
<p><strong>Facilitator:</strong> Team Lead · <strong>Location:</strong> ConnectLn HD Call Room</p>
<h2>Key Decisions</h2>
<ul>
  <li>Confirmed Q4 procurement vendor shortlist and escrow release gates</li>
  <li>Approved Friday site safety audit checklist across active teams</li>
</ul>
<h2>Action Items</h2>
<table>
  <tr><th>Action</th><th>Owner</th><th>Due Date</th><th>Status</th></tr>
  <tr><td>Finalize bid estimate workbook</td><td>Operations Lead</td><td>Wednesday</td><td>In Progress</td></tr>
  <tr><td>Publish client kickoff deck</td><td>Project Manager</td><td>Friday</td><td>Ready</td></tr>
</table>`,
  },
  {
    id: 'field-inspection',
    name: 'Field Inspection & Safety Report',
    category: 'Trades & Field',
    description: 'Structured site readiness, PPE compliance, and corrective findings log.',
    contentHtml: `<h1>Field Inspection &amp; Safety Report</h1>
<p><strong>Site ID:</strong> Sector B · <strong>Condition Rating:</strong> Pass — Verified</p>
<h2>Safety &amp; Compliance Checks</h2>
<ul>
  <li>[✓] Perimeter barriers, lockout/tagout tags, and PPE verified</li>
  <li>[✓] Structural load clearances inspected and photographed</li>
  <li>[✓] Emergency egress routes clear and crew briefed</li>
</ul>
<h2>Inspector Notes</h2>
<p>Crew execution met specification requirements with zero critical findings. Next verification scheduled at framing completion.</p>`,
  },
]

function buildBidSheetCells(): Record<string, SheetCell> {
  return {
    A1: { raw: 'Item Description', style: { bold: true, bg: '#0B1F3A', color: '#FFFFFF' } },
    B1: { raw: 'Category', style: { bold: true, bg: '#0B1F3A', color: '#FFFFFF' } },
    C1: { raw: 'Qty', style: { bold: true, align: 'right', bg: '#0B1F3A', color: '#FFFFFF' } },
    D1: { raw: 'Unit Rate', style: { bold: true, align: 'right', bg: '#0B1F3A', color: '#FFFFFF' } },
    E1: { raw: 'Line Total', style: { bold: true, align: 'right', bg: '#0B1F3A', color: '#FFFFFF' } },
    A2: { raw: 'Site Preparation & Framing' },
    B2: { raw: 'Labor' },
    C2: { raw: '24', style: { format: 'integer', align: 'right' } },
    D2: { raw: '85', style: { format: 'currency', align: 'right' } },
    E2: { raw: '=C2*D2', style: { bold: true, format: 'currency', align: 'right' } },
    A3: { raw: 'Timber & Structural Hardware' },
    B3: { raw: 'Materials' },
    C3: { raw: '18', style: { format: 'integer', align: 'right' } },
    D3: { raw: '140', style: { format: 'currency', align: 'right' } },
    E3: { raw: '=C3*D3', style: { bold: true, format: 'currency', align: 'right' } },
    A4: { raw: 'Electrical & Panel Finish' },
    B4: { raw: 'Specialty' },
    C4: { raw: '12', style: { format: 'integer', align: 'right' } },
    D4: { raw: '115', style: { format: 'currency', align: 'right' } },
    E4: { raw: '=C4*D4', style: { bold: true, format: 'currency', align: 'right' } },
    A5: { raw: 'Safety Inspection & Permit' },
    B5: { raw: 'Compliance' },
    C5: { raw: '1', style: { format: 'integer', align: 'right' } },
    D5: { raw: '420', style: { format: 'currency', align: 'right' } },
    E5: { raw: '=C5*D5', style: { bold: true, format: 'currency', align: 'right' } },
    A6: { raw: 'Commissioning & Cleanup' },
    B6: { raw: 'Closeout' },
    C6: { raw: '6', style: { format: 'integer', align: 'right' } },
    D6: { raw: '75', style: { format: 'currency', align: 'right' } },
    E6: { raw: '=C6*D6', style: { bold: true, format: 'currency', align: 'right' } },
    A7: { raw: 'Subtotal', style: { bold: true, bg: '#F0F6FF' } },
    E7: { raw: '=SUM(E2:E6)', style: { bold: true, format: 'currency', align: 'right', bg: '#F0F6FF' } },
    A8: { raw: 'Contingency Reserve (8%)', style: { bg: '#F0F6FF' } },
    E8: { raw: '=E7*0.08', style: { format: 'currency', align: 'right', bg: '#F0F6FF' } },
    A9: { raw: 'Grand Total Bid', style: { bold: true, bg: '#E6F4EA', color: '#064E3B' } },
    E9: { raw: '=E7+E8', style: { bold: true, format: 'currency', align: 'right', bg: '#E6F4EA', color: '#064E3B' } },
    A10: { raw: 'Approval Tier', style: { bold: true } },
    E10: { raw: '=IF(E9>5000,"Executive Sign-Off","Standard Approval")', style: { bold: true, align: 'right' } },
  }
}

export const SHEET_TEMPLATES: SheetTemplateItem[] = [
  {
    id: 'project-bid',
    name: 'Project Bid & Estimate',
    category: 'Estimating',
    description: 'Itemized labor & materials bid with auto-calculated totals, reserve, and approval rules.',
    buildSheets: () => [
      { id: 'sheet-estimate', name: 'Bid Estimate', rowCount: 22, colCount: 10, cells: buildBidSheetCells() },
      {
        id: 'sheet-assumptions',
        name: 'Rates & Notes',
        rowCount: 16,
        colCount: 8,
        cells: {
          A1: { raw: 'Rate Card Metric', style: { bold: true, bg: '#0B1F3A', color: '#FFFFFF' } },
          B1: { raw: 'Value', style: { bold: true, align: 'right', bg: '#0B1F3A', color: '#FFFFFF' } },
          A2: { raw: 'Standard Field Rate ($/hr)' },
          B2: { raw: '85', style: { format: 'currency', align: 'right' } },
          A3: { raw: 'Specialty Trade Rate ($/hr)' },
          B3: { raw: '115', style: { format: 'currency', align: 'right' } },
          A4: { raw: 'Contingency Percentage' },
          B4: { raw: '0.08', style: { format: 'percent', align: 'right' } },
        },
      },
    ],
  },
  {
    id: 'monthly-pnl',
    name: 'Monthly Business Budget & P&L',
    category: 'Finance',
    description: 'Track revenue streams, operating expenses, net profit, and margin percentage.',
    buildSheets: () => [
      {
        id: 'sheet-pnl',
        name: 'Monthly P&L',
        rowCount: 20,
        colCount: 8,
        cells: {
          A1: { raw: 'Line Item', style: { bold: true, bg: '#0B1F3A', color: '#FFFFFF' } },
          B1: { raw: 'Actual', style: { bold: true, align: 'right', bg: '#0B1F3A', color: '#FFFFFF' } },
          C1: { raw: 'Budget', style: { bold: true, align: 'right', bg: '#0B1F3A', color: '#FFFFFF' } },
          D1: { raw: 'Variance', style: { bold: true, align: 'right', bg: '#0B1F3A', color: '#FFFFFF' } },
          A2: { raw: 'Contract Service Revenue' },
          B2: { raw: '28400', style: { format: 'currency', align: 'right' } },
          C2: { raw: '26000', style: { format: 'currency', align: 'right' } },
          D2: { raw: '=B2-C2', style: { format: 'currency', align: 'right' } },
          A3: { raw: 'Marketplace Storefront Sales' },
          B3: { raw: '9250', style: { format: 'currency', align: 'right' } },
          C3: { raw: '8500', style: { format: 'currency', align: 'right' } },
          D3: { raw: '=B3-C3', style: { format: 'currency', align: 'right' } },
          A4: { raw: 'Consulting Retainers' },
          B4: { raw: '6500', style: { format: 'currency', align: 'right' } },
          C4: { raw: '6500', style: { format: 'currency', align: 'right' } },
          D4: { raw: '=B4-C4', style: { format: 'currency', align: 'right' } },
          A5: { raw: 'Total Revenue', style: { bold: true, bg: '#F0F6FF' } },
          B5: { raw: '=SUM(B2:B4)', style: { bold: true, format: 'currency', align: 'right', bg: '#F0F6FF' } },
          C5: { raw: '=SUM(C2:C4)', style: { bold: true, format: 'currency', align: 'right', bg: '#F0F6FF' } },
          D5: { raw: '=B5-C5', style: { bold: true, format: 'currency', align: 'right', bg: '#F0F6FF' } },
          A7: { raw: 'Crew Payroll & Subcontractors' },
          B7: { raw: '16200', style: { format: 'currency', align: 'right' } },
          C7: { raw: '16000', style: { format: 'currency', align: 'right' } },
          D7: { raw: '=B7-C7', style: { format: 'currency', align: 'right' } },
          A8: { raw: 'Materials & Supplies' },
          B8: { raw: '5800', style: { format: 'currency', align: 'right' } },
          C8: { raw: '6000', style: { format: 'currency', align: 'right' } },
          D8: { raw: '=B8-C8', style: { format: 'currency', align: 'right' } },
          A9: { raw: 'Fleet, Fuel & Logistics' },
          B9: { raw: '2150', style: { format: 'currency', align: 'right' } },
          C9: { raw: '2300', style: { format: 'currency', align: 'right' } },
          D9: { raw: '=B9-C9', style: { format: 'currency', align: 'right' } },
          A10: { raw: 'Insurance & Compliance' },
          B10: { raw: '1450', style: { format: 'currency', align: 'right' } },
          C10: { raw: '1450', style: { format: 'currency', align: 'right' } },
          D10: { raw: '=B10-C10', style: { format: 'currency', align: 'right' } },
          A11: { raw: 'Software & Communications' },
          B11: { raw: '490', style: { format: 'currency', align: 'right' } },
          C11: { raw: '550', style: { format: 'currency', align: 'right' } },
          D11: { raw: '=B11-C11', style: { format: 'currency', align: 'right' } },
          A12: { raw: 'Total Operating Expenses', style: { bold: true, bg: '#FEF3C7' } },
          B12: { raw: '=SUM(B7:B11)', style: { bold: true, format: 'currency', align: 'right', bg: '#FEF3C7' } },
          C12: { raw: '=SUM(C7:C11)', style: { bold: true, format: 'currency', align: 'right', bg: '#FEF3C7' } },
          D12: { raw: '=B12-C12', style: { bold: true, format: 'currency', align: 'right', bg: '#FEF3C7' } },
          A13: { raw: 'Net Operating Profit', style: { bold: true, bg: '#E6F4EA', color: '#064E3B' } },
          B13: { raw: '=B5-B12', style: { bold: true, format: 'currency', align: 'right', bg: '#E6F4EA', color: '#064E3B' } },
          C13: { raw: '=C5-C12', style: { bold: true, format: 'currency', align: 'right', bg: '#E6F4EA', color: '#064E3B' } },
          D13: { raw: '=B13-C13', style: { bold: true, format: 'currency', align: 'right', bg: '#E6F4EA', color: '#064E3B' } },
          A14: { raw: 'Operating Margin (%)', style: { bold: true } },
          B14: { raw: '=B13/B5', style: { bold: true, format: 'percent', align: 'right' } },
          C14: { raw: '=C13/C5', style: { bold: true, format: 'percent', align: 'right' } },
        },
      },
    ],
  },
  {
    id: 'crew-payroll',
    name: 'Crew Schedule & Payroll',
    category: 'Workforce',
    description: 'Automatic regular hours, overtime differential, and total gross pay.',
    buildSheets: () => [
      {
        id: 'sheet-payroll',
        name: 'Weekly Payroll',
        rowCount: 18,
        colCount: 8,
        cells: {
          A1: { raw: 'Crew Member', style: { bold: true, bg: '#0B1F3A', color: '#FFFFFF' } },
          B1: { raw: 'Trade Role', style: { bold: true, bg: '#0B1F3A', color: '#FFFFFF' } },
          C1: { raw: 'Hours', style: { bold: true, align: 'right', bg: '#0B1F3A', color: '#FFFFFF' } },
          D1: { raw: 'Hourly Rate', style: { bold: true, align: 'right', bg: '#0B1F3A', color: '#FFFFFF' } },
          E1: { raw: 'OT Bonus', style: { bold: true, align: 'right', bg: '#0B1F3A', color: '#FFFFFF' } },
          F1: { raw: 'Gross Pay', style: { bold: true, align: 'right', bg: '#0B1F3A', color: '#FFFFFF' } },
          A2: { raw: 'Kwesi Asiedu' },
          B2: { raw: 'Master Carpenter' },
          C2: { raw: '44', style: { format: 'integer', align: 'right' } },
          D2: { raw: '62', style: { format: 'currency', align: 'right' } },
          E2: { raw: '=IF(C2>40,(C2-40)*D2*0.5,0)', style: { format: 'currency', align: 'right' } },
          F2: { raw: '=C2*D2+E2', style: { bold: true, format: 'currency', align: 'right' } },
          A3: { raw: 'Maya Brooks' },
          B3: { raw: 'Licensed Electrician' },
          C3: { raw: '40', style: { format: 'integer', align: 'right' } },
          D3: { raw: '58', style: { format: 'currency', align: 'right' } },
          E3: { raw: '=IF(C3>40,(C3-40)*D3*0.5,0)', style: { format: 'currency', align: 'right' } },
          F3: { raw: '=C3*D3+E3', style: { bold: true, format: 'currency', align: 'right' } },
          A4: { raw: 'David Morales' },
          B4: { raw: 'HVAC Specialist' },
          C4: { raw: '42', style: { format: 'integer', align: 'right' } },
          D4: { raw: '54', style: { format: 'currency', align: 'right' } },
          E4: { raw: '=IF(C4>40,(C4-40)*D4*0.5,0)', style: { format: 'currency', align: 'right' } },
          F4: { raw: '=C4*D4+E4', style: { bold: true, format: 'currency', align: 'right' } },
          A6: { raw: 'Total Weekly Payroll', style: { bold: true, bg: '#E6F4EA' } },
          C6: { raw: '=SUM(C2:C4)', style: { bold: true, format: 'integer', align: 'right', bg: '#E6F4EA' } },
          E6: { raw: '=SUM(E2:E4)', style: { bold: true, format: 'currency', align: 'right', bg: '#E6F4EA' } },
          F6: { raw: '=SUM(F2:F4)', style: { bold: true, format: 'currency', align: 'right', bg: '#E6F4EA' } },
        },
      },
    ],
  },
  {
    id: 'materials-inventory',
    name: 'Materials & Equipment Inventory',
    category: 'Inventory',
    description: 'Track stock quantities, valuation, and automated reorder alerts.',
    buildSheets: () => [
      {
        id: 'sheet-inventory',
        name: 'Inventory Stock',
        rowCount: 18,
        colCount: 8,
        cells: {
          A1: { raw: 'SKU / Item', style: { bold: true, bg: '#0B1F3A', color: '#FFFFFF' } },
          B1: { raw: 'Location', style: { bold: true, bg: '#0B1F3A', color: '#FFFFFF' } },
          C1: { raw: 'On Hand', style: { bold: true, align: 'right', bg: '#0B1F3A', color: '#FFFFFF' } },
          D1: { raw: 'Unit Cost', style: { bold: true, align: 'right', bg: '#0B1F3A', color: '#FFFFFF' } },
          E1: { raw: 'Min Level', style: { bold: true, align: 'right', bg: '#0B1F3A', color: '#FFFFFF' } },
          F1: { raw: 'Stock Value', style: { bold: true, align: 'right', bg: '#0B1F3A', color: '#FFFFFF' } },
          G1: { raw: 'Alert Status', style: { bold: true, bg: '#0B1F3A', color: '#FFFFFF' } },
          A2: { raw: 'Heavy Timber Beams (12ft)' },
          B2: { raw: 'Bay A1' },
          C2: { raw: '32', style: { format: 'integer', align: 'right' } },
          D2: { raw: '68', style: { format: 'currency', align: 'right' } },
          E2: { raw: '15', style: { format: 'integer', align: 'right' } },
          F2: { raw: '=C2*D2', style: { format: 'currency', align: 'right' } },
          G2: { raw: '=IF(C2<=E2,"Reorder Now","In Stock")', style: { bold: true } },
          A3: { raw: '200A Sub-Panel Kit' },
          B3: { raw: 'Vault B2' },
          C3: { raw: '4', style: { format: 'integer', align: 'right' } },
          D3: { raw: '310', style: { format: 'currency', align: 'right' } },
          E3: { raw: '6', style: { format: 'integer', align: 'right' } },
          F3: { raw: '=C3*D3', style: { format: 'currency', align: 'right' } },
          G3: { raw: '=IF(C3<=E3,"Reorder Now","In Stock")', style: { bold: true, bg: '#FEE2E2', color: '#991B1B' } },
          A5: { raw: 'Total Warehouse Value', style: { bold: true, bg: '#F0F6FF' } },
          F5: { raw: '=SUM(F2:F3)', style: { bold: true, format: 'currency', align: 'right', bg: '#F0F6FF' } },
        },
      },
    ],
  },
  {
    id: 'blank-sheet',
    name: 'Blank Spreadsheet',
    category: 'General',
    description: 'Empty multi-row formula grid ready for custom analysis.',
    buildSheets: () => [
      { id: 'sheet-1', name: 'Sheet 1', rowCount: 24, colCount: 10, cells: {} },
    ],
  },
]

export const DECK_TEMPLATES: DeckTemplateItem[] = [
  {
    id: 'exec-pitch',
    name: 'ConnectLn Executive Pitch',
    category: 'Strategy',
    description: 'High-contrast 5-slide stakeholder deck with metrics, dual tracks, and closing brief.',
    themeId: 'connectln-navy',
    buildSlides: () => [
      {
        id: 'sl-1',
        layout: 'cover',
        title: 'Operational Excellence Across Every Trade & Team',
        subtitle: 'Built natively with ConnectLn Slides · 2026 Briefing',
        bullets: ['Verified Workforce Network', 'Real-Time Project Delivery'],
        notes: 'Welcome stakeholders and establish why unified execution matters.',
      },
      {
        id: 'sl-2',
        layout: 'bullets',
        title: 'Why Integrated First-Party Tools Matter',
        subtitle: 'Eliminating context switching across field, office, and client teams',
        bullets: [
          'Documents, financial sheets, and presentations live alongside messaging and calls.',
          'Export open standard files (.docx, .xlsx, .pptx) without third-party lock-in.',
          'Share milestone updates straight to your verified ConnectLn network in one click.',
        ],
        notes: 'Emphasize speed, ownership, and client readiness.',
      },
      {
        id: 'sl-3',
        layout: 'metrics',
        title: 'Platform Performance & Field Impact',
        subtitle: 'Measured quarterly benchmarks across active business hubs',
        metrics: [
          { value: '99.4%', label: 'On-Time Milestone Rate', delta: '+4.2% QoQ' },
          { value: '3.2x', label: 'Faster Bid Turnaround', delta: 'Integrated formulas' },
          { value: '100%', label: 'First-Party Owned Stack', delta: 'Zero external dependency' },
        ],
        notes: 'Highlight formula-backed estimating and rapid client sign-off.',
      },
      {
        id: 'sl-4',
        layout: 'two_column',
        title: 'Execution Model: Field + Executive Office',
        subtitle: 'Two synchronized tracks under one workspace',
        leftTitle: 'Field & Crew Operations',
        leftBullets: [
          'Site inspection reports in ConnectLn Docs',
          'Live crew hours & payroll in ConnectLn Sheets',
          'Instant HD video check-ins on site',
        ],
        rightTitle: 'Client & Commercial Desk',
        rightBullets: [
          'Itemized bids with automatic contingency reserves',
          'Interactive pitch decks in Present Mode',
          'Transparent milestone & escrow tracking',
        ],
        notes: 'Walk through how both sides stay aligned.',
      },
      {
        id: 'sl-5',
        layout: 'quote',
        title: 'Closing Commitment',
        subtitle: 'Ready for immediate kickoff',
        quote: 'When teams own their craft, their data, and their tools together, delivery becomes effortless.',
        quoteAuthor: 'ConnectLn 360 Studio Brief',
        notes: 'Open floor for questions and confirm next milestone date.',
      },
    ],
  },
  {
    id: 'client-proposal-deck',
    name: 'Client Project Proposal',
    category: 'Sales & Bids',
    description: 'Present scope, pricing tiers, delivery timeline, and approval path clearly.',
    themeId: 'sandstone-editorial',
    buildSlides: () => [
      {
        id: 'cp-1',
        layout: 'cover',
        title: 'Commercial Build & Advisory Proposal',
        subtitle: 'Prepared for Client Review · Valid for 30 Days',
        bullets: ['Turnkey Delivery', 'Fixed Milestone Transparency'],
        notes: 'Introduce the lead architect and site manager.',
      },
      {
        id: 'cp-2',
        layout: 'bullets',
        title: 'Core Scope & Quality Standards',
        subtitle: 'What is included in our fixed engagement',
        bullets: [
          'Comprehensive pre-work inspection and materials certification.',
          'Dedicated licensed specialists assigned throughout every phase.',
          'Weekly visual documentation uploaded to ConnectLn Business Hub.',
        ],
      },
      {
        id: 'cp-3',
        layout: 'metrics',
        title: 'Delivery Timeline & Investment Summary',
        subtitle: 'Clear phase gates from mobilization to warranty closeout',
        metrics: [
          { value: '6 Weeks', label: 'Total Project Duration', delta: 'Weather buffer included' },
          { value: '$8,240', label: 'Estimated Total Bid', delta: '8% reserve built in' },
          { value: '24 Mos', label: 'Workmanship Warranty', delta: 'Backed by verification' },
        ],
      },
      {
        id: 'cp-4',
        layout: 'two_column',
        title: 'Roles & Communication Cadence',
        leftTitle: 'Our Delivery Responsibilities',
        leftBullets: ['Daily crew supervision', 'Permits & code compliance', 'Weekly progress briefings'],
        rightTitle: 'Client Review Gates',
        rightBullets: ['Site access coordination', 'Material finish selection', 'Milestone sign-off checks'],
      },
    ],
  },
  {
    id: 'safety-briefing',
    name: 'Safety & Field Operations Briefing',
    category: 'Trades & Field',
    description: 'Clear morning toolbox talk and hazard readiness slides for jobsite crews.',
    themeId: 'emerald-craft',
    buildSlides: () => [
      {
        id: 'sb-1',
        layout: 'cover',
        title: 'Morning Jobsite Safety & Quality Briefing',
        subtitle: 'Zero-Incident Standard · Active Site Crew',
        bullets: ['PPE Verified', 'Lockout/Tagout Active'],
      },
      {
        id: 'sb-2',
        layout: 'bullets',
        title: 'Critical Focus Areas Today',
        bullets: [
          'Verify fall protection anchors prior to upper-deck framing.',
          'Confirm power isolation before panel tie-in inspection.',
          'Log afternoon material deliveries in ConnectLn Sheets inventory.',
        ],
      },
      {
        id: 'sb-3',
        layout: 'quote',
        title: 'Crew Standard',
        quote: 'Precision workmanship starts with every specialist returning home safely.',
        quoteAuthor: 'Field Operations Lead',
      },
    ],
  },
  {
    id: 'blank-deck',
    name: 'Blank Deck',
    category: 'General',
    description: 'Clean 2-slide starter presentation ready for custom storytelling.',
    themeId: 'cobalt-studio',
    buildSlides: () => [
      {
        id: 'bd-1',
        layout: 'cover',
        title: 'Untitled Presentation',
        subtitle: 'Created with ConnectLn Slides',
        bullets: ['Click any field to customize text & layout'],
      },
      {
        id: 'bd-2',
        layout: 'bullets',
        title: 'Key Agenda Points',
        subtitle: 'Outline your main discussion points',
        bullets: ['First key takeaway', 'Supporting evidence or milestone', 'Recommended next action'],
      },
    ],
  },
]

function normalizeUserStorageKey(user?: { email?: string; id?: string; name?: string } | null): string {
  const email = (user?.email || '').trim().toLowerCase()
  const id = (user?.id || '').trim().toLowerCase()
  const name = (user?.name || '').trim().toLowerCase()
  return email || id || name || 'guest'
}

export function loadStudioDocs(user?: { email?: string; id?: string; name?: string } | null): StudioDocRecord[] {
  const key = `connectln_studio_docs_v1:${normalizeUserStorageKey(user)}`
  const now = new Date().toISOString()
  const authorName = user?.name || 'ConnectLn Member'
  const seedDocs = (): StudioDocRecord[] => [
    {
      id: 'doc-starter-proposal',
      title: DOC_TEMPLATES[1].name,
      category: DOC_TEMPLATES[1].category,
      contentHtml: DOC_TEMPLATES[1].contentHtml,
      createdAt: now,
      updatedAt: now,
      authorName,
      starred: true,
    },
    {
      id: 'doc-starter-notes',
      title: DOC_TEMPLATES[3].name,
      category: DOC_TEMPLATES[3].category,
      contentHtml: DOC_TEMPLATES[3].contentHtml,
      createdAt: now,
      updatedAt: now,
      authorName,
    },
  ]

  if (typeof window === 'undefined') return seedDocs()
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      const seeded = seedDocs()
      localStorage.setItem(key, JSON.stringify(seeded))
      return seeded
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {
    // Fallback to fresh seed if corrupted
  }
  const seeded = seedDocs()
  try {
    localStorage.setItem(key, JSON.stringify(seeded))
  } catch {
    // ignore storage quota
  }
  return seeded
}

export function saveStudioDocs(
  user: { email?: string; id?: string; name?: string } | null | undefined,
  docs: StudioDocRecord[]
): void {
  if (typeof window === 'undefined') return
  const key = `connectln_studio_docs_v1:${normalizeUserStorageKey(user)}`
  try {
    localStorage.setItem(key, JSON.stringify(docs))
  } catch {
    // ignore quota exceeded
  }
  pushStudioModuleCloud(user, 'docs', docs)
}

export function loadStudioWorkbooks(
  user?: { email?: string; id?: string; name?: string } | null
): StudioWorkbookRecord[] {
  const key = `connectln_studio_sheets_v1:${normalizeUserStorageKey(user)}`
  const now = new Date().toISOString()
  const authorName = user?.name || 'ConnectLn Member'
  const seedWorkbooks = (): StudioWorkbookRecord[] => {
    const bidSheets = SHEET_TEMPLATES[0].buildSheets()
    const pnlSheets = SHEET_TEMPLATES[1].buildSheets()
    return [
      {
        id: 'wb-starter-bid',
        title: 'Project Bid & Estimate — 2026',
        category: 'Estimating',
        sheets: bidSheets,
        activeSheetId: bidSheets[0].id,
        createdAt: now,
        updatedAt: now,
        authorName,
        starred: true,
      },
      {
        id: 'wb-starter-pnl',
        title: 'Monthly Operating Budget & P&L',
        category: 'Finance',
        sheets: pnlSheets,
        activeSheetId: pnlSheets[0].id,
        createdAt: now,
        updatedAt: now,
        authorName,
      },
    ]
  }

  if (typeof window === 'undefined') return seedWorkbooks()
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      const seeded = seedWorkbooks()
      localStorage.setItem(key, JSON.stringify(seeded))
      return seeded
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {
    // Fallback
  }
  const seeded = seedWorkbooks()
  try {
    localStorage.setItem(key, JSON.stringify(seeded))
  } catch {
    // ignore
  }
  return seeded
}

export function saveStudioWorkbooks(
  user: { email?: string; id?: string; name?: string } | null | undefined,
  workbooks: StudioWorkbookRecord[]
): void {
  if (typeof window === 'undefined') return
  const key = `connectln_studio_sheets_v1:${normalizeUserStorageKey(user)}`
  try {
    localStorage.setItem(key, JSON.stringify(workbooks))
  } catch {
    // ignore
  }
  pushStudioModuleCloud(user, 'workbooks', workbooks)
}

export function loadStudioDecks(
  user?: { email?: string; id?: string; name?: string } | null
): StudioDeckRecord[] {
  const key = `connectln_studio_slides_v1:${normalizeUserStorageKey(user)}`
  const now = new Date().toISOString()
  const authorName = user?.name || 'ConnectLn Member'
  const seedDecks = (): StudioDeckRecord[] => [
    {
      id: 'deck-starter-pitch',
      title: 'ConnectLn Executive Pitch Deck',
      category: 'Strategy',
      themeId: DECK_TEMPLATES[0].themeId,
      slides: DECK_TEMPLATES[0].buildSlides(),
      createdAt: now,
      updatedAt: now,
      authorName,
      starred: true,
    },
    {
      id: 'deck-starter-proposal',
      title: 'Client Project Proposal Deck',
      category: 'Sales & Bids',
      themeId: DECK_TEMPLATES[1].themeId,
      slides: DECK_TEMPLATES[1].buildSlides(),
      createdAt: now,
      updatedAt: now,
      authorName,
    },
  ]

  if (typeof window === 'undefined') return seedDecks()
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      const seeded = seedDecks()
      localStorage.setItem(key, JSON.stringify(seeded))
      return seeded
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {
    // Fallback
  }
  const seeded = seedDecks()
  try {
    localStorage.setItem(key, JSON.stringify(seeded))
  } catch {
    // ignore
  }
  return seeded
}

export function saveStudioDecks(
  user: { email?: string; id?: string; name?: string } | null | undefined,
  decks: StudioDeckRecord[]
): void {
  if (typeof window === 'undefined') return
  const key = `connectln_studio_slides_v1:${normalizeUserStorageKey(user)}`
  try {
    localStorage.setItem(key, JSON.stringify(decks))
  } catch {
    // ignore
  }
  pushStudioModuleCloud(user, 'decks', decks)
}
