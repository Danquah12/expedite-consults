import { evaluateSheet, makeCellKey } from './connectln-sheets-engine'
import type { StudioSheetTab } from './connectln-studio-storage'

export type InvoiceDocKind = 'invoice' | 'estimate' | 'receipt'
export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'void'
export type InvoiceCurrency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'GHS' | 'NGN'

export interface InvoiceLineItem {
  id: string
  description: string
  category: string
  qty: number
  unitPrice: number
  taxable: boolean
}

export interface InvoicePaymentRecord {
  id: string
  amount: number
  date: string
  method: string
  reference: string
  note?: string
}

export interface InvoiceRecord {
  id: string
  invoiceNumber: string
  kind: InvoiceDocKind
  status: InvoiceStatus
  currency: InvoiceCurrency
  title: string
  poNumber?: string
  issueDate: string
  dueDate: string
  paymentTerms: string
  senderName: string
  senderEmail: string
  senderCompany: string
  senderAddress: string
  clientName: string
  clientEmail: string
  clientCompany: string
  clientAddress: string
  items: InvoiceLineItem[]
  taxRatePct: number
  discountType: 'percent' | 'fixed'
  discountValue: number
  retainagePct: number
  payments: InvoicePaymentRecord[]
  notes: string
  paymentInstructions: string
  sourceSheetName?: string
  starred?: boolean
  createdAt: string
  updatedAt: string
}

export interface LedgerEntry {
  id: string
  date: string
  type: 'income' | 'expense'
  category: string
  description: string
  counterparty: string
  amount: number
  currency: InvoiceCurrency
  taxDeductible: boolean
  linkedInvoiceId?: string
  reference?: string
  createdAt: string
}

export interface InvoiceTemplateItem {
  id: string
  name: string
  kind: InvoiceDocKind
  category: string
  description: string
  defaultTerms: string
  defaultTaxRatePct: number
  defaultRetainagePct?: number
  notes: string
  paymentInstructions: string
  items: Array<Omit<InvoiceLineItem, 'id'>>
}

export interface InvoiceTotalsResult {
  subtotal: number
  discountAmount: number
  taxableSubtotal: number
  taxAmount: number
  retainageAmount: number
  grandTotal: number
  amountPaid: number
  balanceDue: number
  computedStatus: InvoiceStatus
}

export interface LedgerSummaryResult {
  totalInvoiced: number
  totalCollected: number
  totalOutstanding: number
  overdueCount: number
  overdueTotal: number
  totalExpenses: number
  deductibleExpenses: number
  netCashFlow: number
  expensesByCategory: Array<{ category: string; total: number }>
}

export const CURRENCY_META: Record<InvoiceCurrency, { symbol: string; label: string }> = {
  USD: { symbol: '$', label: 'USD — US Dollar ($)' },
  EUR: { symbol: '€', label: 'EUR — Euro (€)' },
  GBP: { symbol: '£', label: 'GBP — British Pound (£)' },
  CAD: { symbol: 'C$', label: 'CAD — Canadian Dollar (C$)' },
  GHS: { symbol: '₵', label: 'GHS — Ghana Cedi (₵)' },
  NGN: { symbol: '₦', label: 'NGN — Nigerian Naira (₦)' },
}

export const LEDGER_CATEGORIES = [
  'Labor & Subcontractors',
  'Materials & Supplies',
  'Software & Cloud Tools',
  'Travel & Field Mileage',
  'Equipment & Gear',
  'Professional & Legal Fees',
  'Client Retainer & Milestone',
  'General Operations',
] as const

function round2(value: number): number {
  const safe = Number.isFinite(value) ? value : 0
  return Math.round((safe + Number.EPSILON) * 100) / 100
}

export function formatInvoiceMoney(amount: number, currency: InvoiceCurrency = 'USD'): string {
  const meta = CURRENCY_META[currency] || CURRENCY_META.USD
  const rounded = round2(amount)
  const absFormatted = Math.abs(rounded).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return rounded < 0 ? `-${meta.symbol}${absFormatted}` : `${meta.symbol}${absFormatted}`
}

export function generateInvoiceNumber(kind: InvoiceDocKind = 'invoice'): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(1000 + Math.random() * 9000)
  const prefix = kind === 'estimate' ? 'CLN-EST' : kind === 'receipt' ? 'CLN-RCP' : 'CLN-INV'
  return `${prefix}-${year}-${rand}`
}

export function calculateInvoiceTotals(
  invoice: Pick<
    InvoiceRecord,
    'items' | 'taxRatePct' | 'discountType' | 'discountValue' | 'retainagePct' | 'payments' | 'status' | 'dueDate'
  >,
  nowIso?: string
): InvoiceTotalsResult {
  const items = Array.isArray(invoice.items) ? invoice.items : []
  let subtotalRaw = 0
  let taxableRaw = 0

  for (const item of items) {
    const qty = Math.max(0, Number(item.qty) || 0)
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0)
    const lineTotal = qty * unitPrice
    subtotalRaw += lineTotal
    if (item.taxable) {
      taxableRaw += lineTotal
    }
  }

  const subtotal = round2(subtotalRaw)
  const rawDiscVal = Math.max(0, Number(invoice.discountValue) || 0)
  const discountAmount =
    invoice.discountType === 'percent'
      ? round2(Math.min(subtotal, subtotal * (Math.min(100, rawDiscVal) / 100)))
      : round2(Math.min(subtotal, rawDiscVal))

  const discountFactor = subtotal > 0 ? Math.max(0, subtotal - discountAmount) / subtotal : 0
  const taxableSubtotal = round2(taxableRaw * discountFactor)
  const taxRate = Math.max(0, Number(invoice.taxRatePct) || 0)
  const taxAmount = round2(taxableSubtotal * (taxRate / 100))
  const afterTax = round2(subtotal - discountAmount + taxAmount)
  const retainagePct = Math.min(50, Math.max(0, Number(invoice.retainagePct) || 0))
  const retainageAmount = round2(afterTax * (retainagePct / 100))
  const grandTotal = round2(Math.max(0, afterTax - retainageAmount))

  const payments = Array.isArray(invoice.payments) ? invoice.payments : []
  const amountPaid = round2(
    payments.reduce((acc, p) => acc + Math.max(0, Number(p.amount) || 0), 0)
  )
  const balanceDue = round2(Math.max(0, grandTotal - amountPaid))

  const todayYmd = (nowIso ? new Date(nowIso) : new Date()).toISOString().slice(0, 10)
  let computedStatus: InvoiceStatus = invoice.status
  if (invoice.status === 'void') {
    computedStatus = 'void'
  } else if (grandTotal > 0 && balanceDue <= 0.005) {
    computedStatus = 'paid'
  } else if (amountPaid > 0 && balanceDue > 0.005) {
    computedStatus = 'partial'
  } else if (
    invoice.status === 'sent' &&
    invoice.dueDate &&
    invoice.dueDate < todayYmd &&
    balanceDue > 0.005
  ) {
    computedStatus = 'overdue'
  }

  return {
    subtotal,
    discountAmount,
    taxableSubtotal,
    taxAmount,
    retainageAmount,
    grandTotal,
    amountPaid,
    balanceDue,
    computedStatus,
  }
}

export function calculateLedgerSummary(
  invoices: InvoiceRecord[],
  ledgerEntries: LedgerEntry[]
): LedgerSummaryResult {
  let totalInvoiced = 0
  let invoiceCollected = 0
  let totalOutstanding = 0
  let overdueCount = 0
  let overdueTotal = 0

  for (const inv of invoices) {
    if (inv.kind === 'estimate') continue
    const totals = calculateInvoiceTotals(inv)
    if (totals.computedStatus === 'void') continue
    totalInvoiced += totals.grandTotal
    invoiceCollected += totals.amountPaid
    totalOutstanding += totals.balanceDue
    if (totals.computedStatus === 'overdue') {
      overdueCount += 1
      overdueTotal += totals.balanceDue
    }
  }

  let unlinkedIncome = 0
  let totalExpenses = 0
  let deductibleExpenses = 0
  const categoryMap = new Map<string, number>()

  for (const entry of ledgerEntries) {
    const amt = Math.max(0, Number(entry.amount) || 0)
    if (entry.type === 'income') {
      if (!entry.linkedInvoiceId) {
        unlinkedIncome += amt
      }
    } else {
      totalExpenses += amt
      if (entry.taxDeductible) {
        deductibleExpenses += amt
      }
      const cat = entry.category || 'General Operations'
      categoryMap.set(cat, round2((categoryMap.get(cat) || 0) + amt))
    }
  }

  const totalCollected = round2(invoiceCollected + unlinkedIncome)
  const expensesByCategory = Array.from(categoryMap.entries())
    .map(([category, total]) => ({ category, total: round2(total) }))
    .sort((a, b) => b.total - a.total)

  return {
    totalInvoiced: round2(totalInvoiced),
    totalCollected,
    totalOutstanding: round2(totalOutstanding),
    overdueCount,
    overdueTotal: round2(overdueTotal),
    totalExpenses: round2(totalExpenses),
    deductibleExpenses: round2(deductibleExpenses),
    netCashFlow: round2(totalCollected - totalExpenses),
    expensesByCategory,
  }
}

export const INVOICE_TEMPLATES: InvoiceTemplateItem[] = [
  {
    id: 'consulting-retainer',
    name: 'Advisory & Architecture Retainer Invoice',
    kind: 'invoice',
    category: 'Consulting & Advisory',
    description: 'Monthly advisory retainer, executive deliverables, and reimbursable expenses.',
    defaultTerms: 'Net 15',
    defaultTaxRatePct: 0,
    notes: 'Thank you for partnering through ConnectLn 360. Deliverable artifacts are archived in your client workspace.',
    paymentInstructions: 'Remit via ACH routing, Corporate Card, or ConnectLn Invoice Reference # listed above.',
    items: [
      { description: 'Executive Systems Architecture & Risk Review', category: 'Advisory', qty: 18, unitPrice: 195, taxable: false },
      { description: 'Executive Security Briefings & Governance Audit', category: 'Deliverables', qty: 2, unitPrice: 950, taxable: false },
      { description: 'Reimbursable On-Site Workshop Expenses', category: 'Travel & Field Mileage', qty: 1, unitPrice: 280, taxable: false },
    ],
  },
  {
    id: 'trades-field-estimate',
    name: 'Skilled Trades & Field Services Estimate',
    kind: 'estimate',
    category: 'Skilled Trades & Construction',
    description: 'Itemized labor hours, materials, permit fees, and optional 10% project retainage.',
    defaultTerms: 'Due Upon Approval (50% Deposit)',
    defaultTaxRatePct: 6,
    defaultRetainagePct: 10,
    notes: 'Estimate valid for 30 calendar days. Approve directly via ConnectLn Sign or convert to an Invoice upon kickoff.',
    paymentInstructions: '50% mobilization deposit due upon contract execution; balance billed upon inspection sign-off.',
    items: [
      { description: 'Lead Licensed Technician Labor (Code-Compliant Install)', category: 'Labor & Subcontractors', qty: 16, unitPrice: 110, taxable: false },
      { description: 'Commercial Panel, Breakers & Conduit Package', category: 'Materials & Supplies', qty: 1, unitPrice: 1450, taxable: true },
      { description: 'Municipal Inspection Filing & Load Test', category: 'Compliance', qty: 1, unitPrice: 325, taxable: false },
    ],
  },
  {
    id: 'software-milestone',
    name: 'Software & Product Delivery Milestone',
    kind: 'invoice',
    category: 'Engineering & Product',
    description: 'Sprint engineering milestones, QA automation, and production cloud rollout.',
    defaultTerms: 'Net 30',
    defaultTaxRatePct: 0,
    notes: 'All source pull requests, automated test reports, and production deployment IDs delivered in Milestone Package.',
    paymentInstructions: 'Wire transfer or corporate ACH referencing Invoice # within 30 days.',
    items: [
      { description: 'Full-Stack Portal Feature Build & API Integrations', category: 'Engineering', qty: 1, unitPrice: 4200, taxable: false },
      { description: 'End-to-End Regression Test Suite & Security Hardening', category: 'QA & Security', qty: 1, unitPrice: 1250, taxable: false },
    ],
  },
  {
    id: 'health-clinical-statement',
    name: 'Clinical & Specialized Consultation Statement',
    kind: 'invoice',
    category: 'Healthcare & Practice',
    description: 'Clean itemized patient or corporate wellness consultation and diagnostic statement.',
    defaultTerms: 'Due on Receipt',
    defaultTaxRatePct: 0,
    notes: 'Prepared for private reimbursement or HSA/FSA documentation. Contains no sensitive clinical chart notes.',
    paymentInstructions: 'Payable via HSA/FSA card, clinic portal, or bank transfer.',
    items: [
      { description: 'Comprehensive Functional Assessment Consultation (60 min)', category: 'Clinical Care', qty: 1, unitPrice: 320, taxable: false },
      { description: 'Follow-Up Diagnostic Care Plan Review', category: 'Care Plan', qty: 1, unitPrice: 145, taxable: false },
    ],
  },
  {
    id: 'creative-production-receipt',
    name: 'Media, Brand & Event Production Receipt',
    kind: 'receipt',
    category: 'Media & Creative',
    description: 'Settled production invoice/receipt for shoots, editing, licensing, and usage rights.',
    defaultTerms: 'Paid in Full',
    defaultTaxRatePct: 5,
    notes: 'Commercial usage rights granted in perpetuity upon settlement reflected on this receipt.',
    paymentInstructions: 'Settled electronically; retain this receipt for corporate tax and audit records.',
    items: [
      { description: 'Full-Day Keyframe Shoot & Direction', category: 'Production', qty: 1, unitPrice: 1800, taxable: false },
      { description: 'Color Grading, Sound Mastering & Final Cut Deliverables', category: 'Post-Production', qty: 1, unitPrice: 950, taxable: true },
    ],
  },
]

function parsePositiveNumber(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  const cleaned = String(raw ?? '')
    .replace(/[$,€£₵₦,\s]/g, '')
    .trim()
  if (!cleaned) return null
  const n = Number.parseFloat(cleaned)
  return Number.isFinite(n) ? n : null
}

export function createInvoiceFromSheetTab(
  workbookTitle: string,
  sheet: StudioSheetTab,
  user?: { name?: string; email?: string } | null
): InvoiceRecord {
  const now = new Date()
  const nowIso = now.toISOString()
  const due = new Date(now.getTime() + 14 * 86400000)
  const evalMap = evaluateSheet(sheet.cells)
  const extractedItems: InvoiceLineItem[] = []

  const maxRow = Math.min(sheet.rowCount - 1, 60)
  const maxCol = Math.min(sheet.colCount - 1, 10)

  for (let r = 1; r <= maxRow; r++) {
    const colA = String(evalMap[makeCellKey(0, r)]?.value ?? '').trim()
    if (!colA || /^(total|subtotal|grand total|tax|balance|summary)/i.test(colA)) {
      continue
    }

    const rowValues: Array<{ col: number; str: string; num: number | null }> = []
    for (let c = 0; c <= maxCol; c++) {
      const k = makeCellKey(c, r)
      const ev = evalMap[k]
      const rawVal = ev?.value ?? sheet.cells[k]?.raw ?? ''
      const str = String(rawVal ?? '').trim()
      const num = typeof ev?.numeric === 'number' ? ev.numeric : parsePositiveNumber(str)
      if (str || num !== null) {
        rowValues.push({ col: c, str, num })
      }
    }

    const numericCols = rowValues.filter((v) => v.col > 0 && v.num !== null && v.num > 0)
    if (numericCols.length === 0) continue

    const colB = rowValues.find((v) => v.col === 1 && v.num === null)?.str || 'Imported Line'
    let qty = 1
    let unitPrice = numericCols[numericCols.length - 1].num as number

    if (numericCols.length >= 2) {
      const maybeQty = numericCols[0].num as number
      const maybeUnit = numericCols[1].num as number
      if (maybeQty > 0 && maybeUnit > 0) {
        qty = maybeQty
        unitPrice = maybeUnit
      }
    }

    extractedItems.push({
      id: `item_sheet_${r}_${Date.now()}`,
      description: colA,
      category: colB,
      qty: round2(qty),
      unitPrice: round2(unitPrice),
      taxable: false,
    })
  }

  if (extractedItems.length === 0) {
    extractedItems.push({
      id: `item_fallback_${Date.now()}`,
      description: `${workbookTitle} — ${sheet.name} Deliverables`,
      category: 'Studio Workbook Import',
      qty: 1,
      unitPrice: 1200,
      taxable: false,
    })
  }

  const actorName = user?.name || 'ConnectLn Member'
  const actorEmail = user?.email || 'billing@conectln.com'

  return {
    id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    invoiceNumber: generateInvoiceNumber('invoice'),
    kind: 'invoice',
    status: 'draft',
    currency: 'USD',
    title: `${workbookTitle} — ${sheet.name}`,
    poNumber: '',
    issueDate: nowIso.slice(0, 10),
    dueDate: due.toISOString().slice(0, 10),
    paymentTerms: 'Net 14',
    senderName: actorName,
    senderEmail: actorEmail,
    senderCompany: `${actorName} Studio`,
    senderAddress: 'ConnectLn 360 Verified Practice',
    clientName: 'Client Billing Contact',
    clientEmail: 'accounts@client-org.com',
    clientCompany: 'Client Enterprise LLC',
    clientAddress: 'Suite 400 · Verified Client Account',
    items: extractedItems,
    taxRatePct: 0,
    discountType: 'percent',
    discountValue: 0,
    retainagePct: 0,
    payments: [],
    notes: `Imported ${extractedItems.length} priced line item(s) directly from ConnectLn Sheets (${workbookTitle} / ${sheet.name}).`,
    paymentInstructions: 'Please reference the ConnectLn Invoice # on ACH, Wire, or Corporate Card remittance.',
    sourceSheetName: `${workbookTitle} (${sheet.name})`,
    createdAt: nowIso,
    updatedAt: nowIso,
  }
}

export function convertEstimateToInvoice(estimate: InvoiceRecord): InvoiceRecord {
  const now = new Date()
  const nowIso = now.toISOString()
  const due = new Date(now.getTime() + 14 * 86400000)
  return {
    ...estimate,
    id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    invoiceNumber: generateInvoiceNumber('invoice'),
    kind: 'invoice',
    status: 'draft',
    title: estimate.title.replace(/\bEstimate\b/i, 'Invoice'),
    issueDate: nowIso.slice(0, 10),
    dueDate: due.toISOString().slice(0, 10),
    payments: [],
    notes: `Converted from approved Estimate ${estimate.invoiceNumber}. ${estimate.notes}`,
    createdAt: nowIso,
    updatedAt: nowIso,
  }
}

function escapeHtmlText(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function buildInvoiceAgreementHtml(invoice: InvoiceRecord): string {
  const totals = calculateInvoiceTotals(invoice)
  const kindLabel = invoice.kind === 'estimate' ? 'Project Estimate & Work Authorization' : 'Commercial Billing & Scope Acceptance'
  const rowsHtml = invoice.items
    .map(
      (item) =>
        `<tr><td>${escapeHtmlText(item.description)}</td><td>${escapeHtmlText(item.category)}</td><td>${
          item.qty
        }</td><td>${escapeHtmlText(formatInvoiceMoney(item.unitPrice, invoice.currency))}</td><td>${escapeHtmlText(
          formatInvoiceMoney(item.qty * item.unitPrice, invoice.currency)
        )}</td></tr>`
    )
    .join('')

  return `<h1>${escapeHtmlText(kindLabel)} — ${escapeHtmlText(invoice.invoiceNumber)}</h1>
<p><strong>Project:</strong> ${escapeHtmlText(invoice.title)} &nbsp;|&nbsp; <strong>Issue Date:</strong> ${escapeHtmlText(
    invoice.issueDate
  )} &nbsp;|&nbsp; <strong>Due / Target Date:</strong> ${escapeHtmlText(invoice.dueDate)}</p>
<p><strong>Service Provider:</strong> ${escapeHtmlText(invoice.senderCompany || invoice.senderName)} (${escapeHtmlText(
    invoice.senderEmail
  )})<br/><strong>Client / Authorizing Party:</strong> ${escapeHtmlText(
    invoice.clientCompany || invoice.clientName
  )} (${escapeHtmlText(invoice.clientEmail)})</p>
<h2>1. Approved Line Schedule</h2>
<table>
  <thead><tr><th>Deliverable / Description</th><th>Category</th><th>Qty</th><th>Unit Rate</th><th>Amount</th></tr></thead>
  <tbody>${rowsHtml}</tbody>
</table>
<h2>2. Financial Authorization Summary</h2>
<ul>
  <li><strong>Subtotal:</strong> ${escapeHtmlText(formatInvoiceMoney(totals.subtotal, invoice.currency))}</li>
  <li><strong>Discount Applied:</strong> ${escapeHtmlText(formatInvoiceMoney(totals.discountAmount, invoice.currency))}</li>
  <li><strong>Tax (${invoice.taxRatePct}%):</strong> ${escapeHtmlText(formatInvoiceMoney(totals.taxAmount, invoice.currency))}</li>
  <li><strong>Authorized Total:</strong> ${escapeHtmlText(formatInvoiceMoney(totals.grandTotal, invoice.currency))}</li>
  <li><strong>Payment Terms:</strong> ${escapeHtmlText(invoice.paymentTerms)}</li>
</ul>
<h2>3. Acceptance</h2>
<p>${escapeHtmlText(invoice.notes || 'Signing party approves the itemized scope, rates, and payment terms listed above.')}</p>`
}

function escapeCsvCell(value: unknown): string {
  const raw = String(value ?? '')
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`
  }
  return raw
}

export function exportLedgerToCsv(entries: LedgerEntry[], invoices: InvoiceRecord[]): string {
  const header = ['Date', 'RecordType', 'Reference', 'Category', 'Counterparty', 'Description', 'Currency', 'Amount', 'TaxDeductible', 'Status']
  const lines = [header.join(',')]

  for (const e of entries) {
    lines.push(
      [
        e.date,
        e.type.toUpperCase(),
        e.reference || e.id,
        e.category,
        e.counterparty,
        e.description,
        e.currency,
        e.type === 'expense' ? (-Math.abs(e.amount)).toFixed(2) : Math.abs(e.amount).toFixed(2),
        e.taxDeductible ? 'Yes' : 'No',
        'Recorded',
      ]
        .map(escapeCsvCell)
        .join(',')
    )
  }

  for (const inv of invoices) {
    const t = calculateInvoiceTotals(inv)
    lines.push(
      [
        inv.issueDate,
        `DOC_${inv.kind.toUpperCase()}`,
        inv.invoiceNumber,
        inv.paymentTerms,
        inv.clientCompany || inv.clientName,
        inv.title,
        inv.currency,
        t.grandTotal.toFixed(2),
        'N/A',
        t.computedStatus.toUpperCase(),
      ]
        .map(escapeCsvCell)
        .join(',')
    )
  }

  return lines.join('\r\n')
}

function normalizeUserStorageKey(user?: { email?: string; id?: string; name?: string } | null): string {
  const email = (user?.email || '').trim().toLowerCase()
  const id = (user?.id || '').trim().toLowerCase()
  const name = (user?.name || '').trim().toLowerCase()
  return email || id || name || 'guest'
}

export function loadInvoices(
  user?: { email?: string; id?: string; name?: string } | null
): InvoiceRecord[] {
  const key = `connectln_power_invoice_v1:${normalizeUserStorageKey(user)}`
  const now = new Date()
  const todayYmd = now.toISOString().slice(0, 10)
  const plus14Ymd = new Date(now.getTime() + 14 * 86400000).toISOString().slice(0, 10)
  const minus20Ymd = new Date(now.getTime() - 20 * 86400000).toISOString().slice(0, 10)
  const nowIso = now.toISOString()
  const actorName = user?.name || 'ConnectLn Member'
  const actorEmail = user?.email || 'member@conectln.com'

  const seed = (): InvoiceRecord[] => [
    {
      id: 'inv-starter-advisory',
      invoiceNumber: 'CLN-INV-2026-4102',
      kind: 'invoice',
      status: 'sent',
      currency: 'USD',
      title: 'Q4 Systems Advisory & Security Audit',
      poNumber: 'PO-88412',
      issueDate: todayYmd,
      dueDate: plus14Ymd,
      paymentTerms: 'Net 14',
      senderName: actorName,
      senderEmail: actorEmail,
      senderCompany: 'Expedite & ConnectLn Practice',
      senderAddress: 'ConnectLn Verified Studio · Baltimore, MD',
      clientName: 'Elena Vance',
      clientEmail: 'ap@harbor-ventures.com',
      clientCompany: 'Harbor Ventures LLC',
      clientAddress: '200 Light St, Suite 1400, Baltimore, MD',
      items: [
        { id: 'li_1', description: 'Zero-Trust Cloud Architecture Review & Roadmap', category: 'Advisory', qty: 12, unitPrice: 185, taxable: false },
        { id: 'li_2', description: 'Executive Compliance Readiness Packet', category: 'Deliverables', qty: 1, unitPrice: 950, taxable: false },
        { id: 'li_3', description: 'On-Site Team Workshop Materials', category: 'Materials & Supplies', qty: 1, unitPrice: 240, taxable: true },
      ],
      taxRatePct: 6,
      discountType: 'fixed',
      discountValue: 0,
      retainagePct: 0,
      payments: [
        {
          id: 'pay_seed_1',
          amount: 1000,
          date: todayYmd,
          method: 'ACH Transfer',
          reference: 'ACH-2026-881',
          note: 'Initial kickoff tranche',
        },
      ],
      notes: 'Thank you for working with our team through ConnectLn 360. Remaining balance due on Net 14.',
      paymentInstructions: 'ACH / Wire Transfer referencing CLN-INV-2026-4102.',
      starred: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'est-starter-field-job',
      invoiceNumber: 'CLN-EST-2026-3089',
      kind: 'estimate',
      status: 'sent',
      currency: 'USD',
      title: 'Commercial Suite Buildout & Panel Upgrade Estimate',
      poNumber: 'BID-19C',
      issueDate: todayYmd,
      dueDate: plus14Ymd,
      paymentTerms: 'Due Upon Signing (50% Deposit)',
      senderName: actorName,
      senderEmail: actorEmail,
      senderCompany: 'Expedite & ConnectLn Practice',
      senderAddress: 'ConnectLn Verified Studio · Baltimore, MD',
      clientName: 'Marcus Reid',
      clientEmail: 'm.reid@client-holdings.com',
      clientCompany: 'Reid Properties Group',
      clientAddress: '740 Fleet St, Baltimore, MD',
      items: [
        { id: 'ei_1', description: 'Licensed Master Electrical Upgrade & Load Balancing', category: 'Labor & Subcontractors', qty: 20, unitPrice: 115, taxable: false },
        { id: 'ei_2', description: '200A Commercial Distribution Panel & Breakers', category: 'Materials & Supplies', qty: 1, unitPrice: 1680, taxable: true },
        { id: 'ei_3', description: 'County Permit & Final Sign-Off Testing', category: 'Compliance', qty: 1, unitPrice: 310, taxable: false },
      ],
      taxRatePct: 6,
      discountType: 'percent',
      discountValue: 0,
      retainagePct: 10,
      payments: [],
      notes: 'Send directly to ConnectLn Sign for client authorization, or click Convert to Invoice when work begins.',
      paymentInstructions: '50% mobilization deposit upon electronic signature.',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'rcp-starter-settled',
      invoiceNumber: 'CLN-RCP-2026-1904',
      kind: 'receipt',
      status: 'paid',
      currency: 'USD',
      title: 'Infrastructure Hardening Sprint #1 Receipt',
      poNumber: 'PO-77201',
      issueDate: minus20Ymd,
      dueDate: minus20Ymd,
      paymentTerms: 'Paid in Full',
      senderName: actorName,
      senderEmail: actorEmail,
      senderCompany: 'Expedite & ConnectLn Practice',
      senderAddress: 'ConnectLn Verified Studio · Baltimore, MD',
      clientName: 'Dr. Amara Okafor',
      clientEmail: 'finance@civicmed.org',
      clientCompany: 'CivicMed Health Partners',
      clientAddress: '1100 Pratt St, Baltimore, MD',
      items: [
        { id: 'ri_1', description: 'HIPAA API Gateway & Audit Telemetry Implementation', category: 'Engineering', qty: 1, unitPrice: 3400, taxable: false },
      ],
      taxRatePct: 0,
      discountType: 'fixed',
      discountValue: 0,
      retainagePct: 0,
      payments: [
        {
          id: 'pay_seed_2',
          amount: 3400,
          date: minus20Ymd,
          method: 'Corporate ACH',
          reference: 'ACH-CIVIC-904',
          note: 'Settled in full',
        },
      ],
      notes: 'Paid in full. Keep this receipt for corporate audit and procurement records.',
      paymentInstructions: 'Settled — zero balance remaining.',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
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

export function saveInvoices(
  user: { email?: string; id?: string; name?: string } | null | undefined,
  invoices: InvoiceRecord[]
): void {
  if (typeof window === 'undefined') return
  const key = `connectln_power_invoice_v1:${normalizeUserStorageKey(user)}`
  try {
    localStorage.setItem(key, JSON.stringify(invoices.slice(0, 60)))
  } catch {
    // ignore quota issues
  }
}

export function loadLedgerEntries(
  user?: { email?: string; id?: string; name?: string } | null
): LedgerEntry[] {
  const key = `connectln_power_ledger_v1:${normalizeUserStorageKey(user)}`
  const now = new Date()
  const todayYmd = now.toISOString().slice(0, 10)
  const minus5Ymd = new Date(now.getTime() - 5 * 86400000).toISOString().slice(0, 10)
  const minus12Ymd = new Date(now.getTime() - 12 * 86400000).toISOString().slice(0, 10)
  const nowIso = now.toISOString()

  const seed = (): LedgerEntry[] => [
    {
      id: 'led_seed_1',
      date: todayYmd,
      type: 'expense',
      category: 'Software & Cloud Tools',
      description: 'Dedicated Production Cluster & Backup Vault',
      counterparty: 'Cloud Infrastructure Provider',
      amount: 215,
      currency: 'USD',
      taxDeductible: true,
      reference: 'EXP-4401',
      createdAt: nowIso,
    },
    {
      id: 'led_seed_2',
      date: minus5Ymd,
      type: 'expense',
      category: 'Materials & Supplies',
      description: 'Field Diagnostics Kit & Calibrated Test Probes',
      counterparty: 'Atlantic Supply Co.',
      amount: 460,
      currency: 'USD',
      taxDeductible: true,
      reference: 'EXP-4392',
      createdAt: nowIso,
    },
    {
      id: 'led_seed_3',
      date: minus12Ymd,
      type: 'expense',
      category: 'Professional & Legal Fees',
      description: 'Annual Liability Coverage & Contract Review',
      counterparty: 'Chesapeake Commercial Group',
      amount: 580,
      currency: 'USD',
      taxDeductible: true,
      reference: 'EXP-4310',
      createdAt: nowIso,
    },
    {
      id: 'led_seed_4',
      date: minus12Ymd,
      type: 'income',
      category: 'Client Retainer & Milestone',
      description: 'Workshop Seat Licensing (Standalone)',
      counterparty: 'Mid-Atlantic Builders Assoc.',
      amount: 750,
      currency: 'USD',
      taxDeductible: false,
      reference: 'INC-2201',
      createdAt: nowIso,
    },
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

export function saveLedgerEntries(
  user: { email?: string; id?: string; name?: string } | null | undefined,
  entries: LedgerEntry[]
): void {
  if (typeof window === 'undefined') return
  const key = `connectln_power_ledger_v1:${normalizeUserStorageKey(user)}`
  try {
    localStorage.setItem(key, JSON.stringify(entries.slice(0, 150)))
  } catch {
    // ignore
  }
}
