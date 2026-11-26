import type { StudioSheetTab } from './connectln-studio-storage'
import { pushStudioModuleCloud } from './connectln-studio-cloud'

export type BoardPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface BoardColumn {
  id: string
  title: string
  colorHex: string
  wipLimit?: number
}

export interface BoardChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface BoardTaskCard {
  id: string
  code: string
  columnId: string
  title: string
  description: string
  priority: BoardPriority
  assignee: string
  dueDate: string
  startDate?: string
  estimatedHours: number
  loggedHours: number
  hourlyRate: number
  billable: boolean
  tags: string[]
  checklist: BoardChecklistItem[]
  createdAt: string
  updatedAt: string
}

export interface BoardRecord {
  id: string
  boardCode: string
  title: string
  category: string
  clientOrTeam: string
  columns: BoardColumn[]
  tasks: BoardTaskCard[]
  starred?: boolean
  createdAt: string
  updatedAt: string
}

export interface BoardTemplateItem {
  id: string
  name: string
  category: string
  description: string
  columns: BoardColumn[]
  tasks: Array<Omit<BoardTaskCard, 'id' | 'createdAt' | 'updatedAt'>>
}

export interface BoardMetricsResult {
  totalTasks: number
  doneTasks: number
  inProgressTasks: number
  overdueTasks: number
  completionPct: number
  totalEstimatedHours: number
  totalLoggedHours: number
  billableValue: number
  checklistDone: number
  checklistTotal: number
  byColumn: Array<{
    columnId: string
    title: string
    colorHex: string
    count: number
    wipLimit?: number
    overWip: boolean
  }>
}

function round2(value: number): number {
  const safe = Number.isFinite(value) ? value : 0
  return Math.round((safe + Number.EPSILON) * 100) / 100
}

export function generateBoardCode(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `CLN-BRD-${year}-${rand}`
}

export function computeBoardMetrics(
  board: Pick<BoardRecord, 'columns' | 'tasks'>,
  nowIso?: string
): BoardMetricsResult {
  const columns = Array.isArray(board.columns) ? board.columns : []
  const tasks = Array.isArray(board.tasks) ? board.tasks : []
  const doneColumnIds = new Set(
    columns
      .filter((c) => /done|complete|closed|shipped|approved/i.test(c.title))
      .map((c) => c.id)
  )
  if (doneColumnIds.size === 0 && columns.length > 0) {
    doneColumnIds.add(columns[columns.length - 1].id)
  }

  const backlogColumnId = columns[0]?.id
  const todayYmd = (nowIso ? new Date(nowIso) : new Date()).toISOString().slice(0, 10)

  let doneTasks = 0
  let inProgressTasks = 0
  let overdueTasks = 0
  let totalEstimatedHours = 0
  let totalLoggedHours = 0
  let billableValue = 0
  let checklistDone = 0
  let checklistTotal = 0

  for (const t of tasks) {
    const isDone = doneColumnIds.has(t.columnId)
    if (isDone) {
      doneTasks += 1
    } else if (t.columnId !== backlogColumnId) {
      inProgressTasks += 1
    }
    if (!isDone && t.dueDate && t.dueDate < todayYmd) {
      overdueTasks += 1
    }
    const est = Math.max(0, Number(t.estimatedHours) || 0)
    const logged = Math.max(0, Number(t.loggedHours) || 0)
    const rate = Math.max(0, Number(t.hourlyRate) || 0)
    totalEstimatedHours += est
    totalLoggedHours += logged
    if (t.billable) {
      billableValue += (logged > 0 ? logged : est) * rate
    }
    for (const chk of t.checklist || []) {
      checklistTotal += 1
      if (chk.done) checklistDone += 1
    }
  }

  const totalTasks = tasks.length
  const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const byColumn = columns.map((col) => {
    const count = tasks.filter((t) => t.columnId === col.id).length
    return {
      columnId: col.id,
      title: col.title,
      colorHex: col.colorHex,
      count,
      wipLimit: col.wipLimit,
      overWip: typeof col.wipLimit === 'number' && col.wipLimit > 0 && count > col.wipLimit,
    }
  })

  return {
    totalTasks,
    doneTasks,
    inProgressTasks,
    overdueTasks,
    completionPct,
    totalEstimatedHours: round2(totalEstimatedHours),
    totalLoggedHours: round2(totalLoggedHours),
    billableValue: round2(billableValue),
    checklistDone,
    checklistTotal,
    byColumn,
  }
}

export function moveTaskToColumn(
  board: BoardRecord,
  taskId: string,
  targetColumnId: string
): BoardRecord {
  if (!board.columns.some((c) => c.id === targetColumnId)) return board
  const nowIso = new Date().toISOString()
  return {
    ...board,
    tasks: board.tasks.map((t) =>
      t.id === taskId ? { ...t, columnId: targetColumnId, updatedAt: nowIso } : t
    ),
    updatedAt: nowIso,
  }
}

export function buildBoardBillableSheet(board: BoardRecord): {
  workbookTitle: string
  sheet: StudioSheetTab
} {
  const billableTasks = board.tasks.filter(
    (t) => t.billable || t.loggedHours > 0 || t.estimatedHours > 0
  )
  const colNameById = new Map(board.columns.map((c) => [c.id, c.title]))
  const cells: StudioSheetTab['cells'] = {
    A1: { raw: 'Deliverable / Task' },
    B1: { raw: 'Stage & Owner' },
    C1: { raw: 'Hours' },
    D1: { raw: 'Hourly Rate' },
    E1: { raw: 'Total' },
  }

  billableTasks.forEach((task, idx) => {
    const r = idx + 2
    const hrs = round2((task.loggedHours > 0 ? task.loggedHours : task.estimatedHours) || 1)
    const rate = round2(task.hourlyRate || 125)
    cells[`A${r}`] = { raw: `${task.code}: ${task.title}` }
    cells[`B${r}`] = { raw: `${colNameById.get(task.columnId) || 'Active'} (${task.assignee})` }
    cells[`C${r}`] = { raw: String(hrs) }
    cells[`D${r}`] = { raw: String(rate) }
    cells[`E${r}`] = { raw: `=C${r}*D${r}` }
  })

  return {
    workbookTitle: `${board.title} (${board.boardCode})`,
    sheet: {
      id: `sheet_brd_${Date.now()}`,
      name: 'Billable Tasks',
      rowCount: Math.max(15, billableTasks.length + 5),
      colCount: 6,
      cells,
    },
  }
}

function escapeCsvCell(value: unknown): string {
  const raw = String(value ?? '')
  if (/[",\n\r]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`
  return raw
}

export function exportBoardToCsv(board: BoardRecord): string {
  const colNameById = new Map(board.columns.map((c) => [c.id, c.title]))
  const header = [
    'Code',
    'Stage',
    'Title',
    'Priority',
    'Assignee',
    'DueDate',
    'EstimatedHours',
    'LoggedHours',
    'HourlyRate',
    'Billable',
    'ChecklistProgress',
  ]
  const lines = [header.join(',')]
  for (const t of board.tasks) {
    const doneChk = t.checklist.filter((c) => c.done).length
    lines.push(
      [
        t.code,
        colNameById.get(t.columnId) || t.columnId,
        t.title,
        t.priority.toUpperCase(),
        t.assignee,
        t.dueDate,
        t.estimatedHours.toFixed(1),
        t.loggedHours.toFixed(1),
        t.hourlyRate.toFixed(2),
        t.billable ? 'Yes' : 'No',
        `${doneChk}/${t.checklist.length}`,
      ]
        .map(escapeCsvCell)
        .join(',')
    )
  }
  return lines.join('\r\n')
}

export const BOARD_TEMPLATES: BoardTemplateItem[] = [
  {
    id: 'client-delivery-sprint',
    name: 'Client Delivery Sprint Board',
    category: 'Consulting & Engineering',
    description: 'Four-stage Kanban board with sprint velocity, billable hours & sign-off tracking.',
    columns: [
      { id: 'col_backlog', title: 'Backlog', colorHex: '#64748B' },
      { id: 'col_active', title: 'In Progress', colorHex: '#0B5CAD', wipLimit: 4 },
      { id: 'col_review', title: 'Client Review', colorHex: '#B45309' },
      { id: 'col_done', title: 'Done & Approved', colorHex: '#107C41' },
    ],
    tasks: [
      {
        code: 'TASK-101',
        columnId: 'col_done',
        title: 'Kickoff Architecture & Access Audit',
        description: 'Confirm stakeholder roster and technical baseline.',
        priority: 'high',
        assignee: 'Lead Architect',
        dueDate: '2026-11-30',
        estimatedHours: 6,
        loggedHours: 6,
        hourlyRate: 185,
        billable: true,
        tags: ['Architecture', 'Sprint 1'],
        checklist: [
          { id: 'c1', text: 'System diagram approved', done: true },
          { id: 'c2', text: 'Access controls verified', done: true },
        ],
      },
      {
        code: 'TASK-102',
        columnId: 'col_active',
        title: 'Implement Core Integration Pipeline',
        description: 'Build telemetry webhook handlers and retry guardrails.',
        priority: 'urgent',
        assignee: 'Platform Engineer',
        dueDate: '2026-12-05',
        estimatedHours: 14,
        loggedHours: 8,
        hourlyRate: 175,
        billable: true,
        tags: ['API', 'Critical Path'],
        checklist: [
          { id: 'c3', text: 'Unit tests green', done: true },
          { id: 'c4', text: 'Load test report', done: false },
        ],
      },
      {
        code: 'TASK-103',
        columnId: 'col_review',
        title: 'Executive Security Sign-Off Packet',
        description: 'Compile governance checklist for ConnectLn Sign routing.',
        priority: 'medium',
        assignee: 'Delivery Lead',
        dueDate: '2026-12-08',
        estimatedHours: 4,
        loggedHours: 3.5,
        hourlyRate: 185,
        billable: true,
        tags: ['Governance', 'Sign-Off'],
        checklist: [{ id: 'c5', text: 'Reviewed by counsel', done: false }],
      },
    ],
  },
  {
    id: 'trades-job-site',
    name: 'Skilled Trades & Field Job Site Tracker',
    category: 'Skilled Trades & Construction',
    description: 'Track site mobilization, rough-in, municipal inspection, and punch-list billing.',
    columns: [
      { id: 'col_prep', title: 'Permits & Materials', colorHex: '#64748B' },
      { id: 'col_field', title: 'On-Site Work', colorHex: '#B45309', wipLimit: 5 },
      { id: 'col_inspect', title: 'Inspection & QA', colorHex: '#0B5CAD' },
      { id: 'col_done', title: 'Completed', colorHex: '#107C41' },
    ],
    tasks: [
      {
        code: 'JOB-201',
        columnId: 'col_field',
        title: 'Main Distribution Panel Upgrade (200A)',
        description: 'Install commercial feeder, bonding, and labeled circuits.',
        priority: 'urgent',
        assignee: 'Master Electrician',
        dueDate: '2026-12-02',
        estimatedHours: 12,
        loggedHours: 10,
        hourlyRate: 120,
        billable: true,
        tags: ['Electrical', 'Panel'],
        checklist: [
          { id: 'j1', text: 'Lockout/tagout verified', done: true },
          { id: 'j2', text: 'Torque inspection log', done: false },
        ],
      },
      {
        code: 'JOB-202',
        columnId: 'col_inspect',
        title: 'County Electrical Final Walkthrough',
        description: 'Meet inspector on-site with test logs and permit packet.',
        priority: 'high',
        assignee: 'Site Foreman',
        dueDate: '2026-12-04',
        estimatedHours: 3,
        loggedHours: 3,
        hourlyRate: 110,
        billable: true,
        tags: ['Permit', 'QA'],
        checklist: [{ id: 'j3', text: 'Sign permit placard', done: true }],
      },
    ],
  },
  {
    id: 'product-launch',
    name: 'Product Launch & Release Board',
    category: 'Product & Marketing',
    description: 'Coordinate release QA, press kit, webinar enablement, and launch day readiness.',
    columns: [
      { id: 'col_idea', title: 'Scoped', colorHex: '#64748B' },
      { id: 'col_build', title: 'In Production', colorHex: '#0B5CAD' },
      { id: 'col_qa', title: 'Launch Readiness', colorHex: '#9333EA' },
      { id: 'col_done', title: 'Shipped', colorHex: '#107C41' },
    ],
    tasks: [
      {
        code: 'REL-301',
        columnId: 'col_qa',
        title: 'Customer Demo Deck & Press Brief',
        description: 'Finalize ConnectLn Slides deck and customer announcement.',
        priority: 'high',
        assignee: 'Product Marketing',
        dueDate: '2026-12-06',
        estimatedHours: 5,
        loggedHours: 4,
        hourlyRate: 140,
        billable: false,
        tags: ['Launch', 'Slides'],
        checklist: [{ id: 'r1', text: 'Brand review complete', done: true }],
      },
    ],
  },
  {
    id: 'compliance-remediation',
    name: 'Compliance & Audit Remediation',
    category: 'Security & Legal',
    description: 'Track audit controls, evidence collection, and executive sign-off.',
    columns: [
      { id: 'col_open', title: 'Identified', colorHex: '#E11D48' },
      { id: 'col_fix', title: 'Remediation', colorHex: '#B45309' },
      { id: 'col_verify', title: 'Evidence Verify', colorHex: '#0B5CAD' },
      { id: 'col_done', title: 'Closed Verified', colorHex: '#107C41' },
    ],
    tasks: [
      {
        code: 'AUD-401',
        columnId: 'col_verify',
        title: 'MFA & Passkey Coverage Evidence',
        description: 'Verify 100% administrative passkey enrollment.',
        priority: 'urgent',
        assignee: 'Security Lead',
        dueDate: '2026-12-03',
        estimatedHours: 4,
        loggedHours: 4,
        hourlyRate: 210,
        billable: true,
        tags: ['SOC2', 'Identity'],
        checklist: [{ id: 'a1', text: 'Export signed ledger', done: true }],
      },
    ],
  },
  {
    id: 'hiring-pipeline',
    name: 'Candidate & Onboarding Pipeline',
    category: 'People & Operations',
    description: 'Manage applicants, interviews, offer routing, and day-one onboarding.',
    columns: [
      { id: 'col_screen', title: 'Screening', colorHex: '#64748B' },
      { id: 'col_interview', title: 'Panel Interviews', colorHex: '#0B5CAD' },
      { id: 'col_offer', title: 'Offer & Sign', colorHex: '#4338CA' },
      { id: 'col_done', title: 'Onboarded', colorHex: '#107C41' },
    ],
    tasks: [
      {
        code: 'HIR-501',
        columnId: 'col_offer',
        title: 'Senior Systems Consultant Offer Packet',
        description: 'Finalize offer terms and route through ConnectLn Sign.',
        priority: 'high',
        assignee: 'People Ops',
        dueDate: '2026-12-07',
        estimatedHours: 2,
        loggedHours: 1.5,
        hourlyRate: 0,
        billable: false,
        tags: ['Hiring', 'Sign'],
        checklist: [{ id: 'h1', text: 'Reference check clear', done: true }],
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

export function loadBoards(
  user?: { email?: string; id?: string; name?: string } | null
): BoardRecord[] {
  const key = `connectln_power_boards_v1:${normalizeUserStorageKey(user)}`
  const nowIso = new Date().toISOString()

  const instantiate = (tpl: BoardTemplateItem, id: string, code: string, starred = false): BoardRecord => ({
    id,
    boardCode: code,
    title: tpl.name,
    category: tpl.category,
    clientOrTeam: user?.name ? `${user.name} Delivery Team` : 'ConnectLn 360 Workspace Team',
    columns: tpl.columns.map((c) => ({ ...c })),
    tasks: tpl.tasks.map((t, idx) => ({
      ...t,
      id: `${id}_t_${idx + 1}`,
      checklist: t.checklist.map((c) => ({ ...c })),
      createdAt: nowIso,
      updatedAt: nowIso,
    })),
    starred,
    createdAt: nowIso,
    updatedAt: nowIso,
  })

  const seed = (): BoardRecord[] => [
    instantiate(BOARD_TEMPLATES[0], 'brd-starter-sprint', 'CLN-BRD-2026-6102', true),
    instantiate(BOARD_TEMPLATES[1], 'brd-starter-trades', 'CLN-BRD-2026-6108', false),
  ]

  if (typeof window === 'undefined') return seed()
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // Fallback
  }
  const initial = seed()
  try {
    localStorage.setItem(key, JSON.stringify(initial))
  } catch {
    // ignore
  }
  return initial
}

export function saveBoards(
  user: { email?: string; id?: string; name?: string } | null | undefined,
  boards: BoardRecord[]
): void {
  if (typeof window === 'undefined') return
  const key = `connectln_power_boards_v1:${normalizeUserStorageKey(user)}`
  const sliced = boards.slice(0, 40)
  try {
    localStorage.setItem(key, JSON.stringify(sliced))
  } catch {
    // ignore
  }
  pushStudioModuleCloud(user, 'boards', sliced)
}
