"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  ArrowRightLeft,
  CheckCircle2,
  CreditCard,
  Download,
  Eye,
  FilePlus2,
  FileSignature,
  FileSpreadsheet,
  LayoutTemplate,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Printer,
  Receipt,
  Search,
  Send,
  Share2,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react"
import type { UserProfile } from "@/lib/connectln-data"
import {
  buildInvoiceAgreementHtml,
  calculateInvoiceTotals,
  calculateLedgerSummary,
  convertEstimateToInvoice,
  createInvoiceFromSheetTab,
  CURRENCY_META,
  exportLedgerToCsv,
  formatInvoiceMoney,
  generateInvoiceNumber,
  INVOICE_TEMPLATES,
  LEDGER_CATEGORIES,
  loadInvoices,
  loadLedgerEntries,
  saveInvoices,
  saveLedgerEntries,
  type InvoiceCurrency,
  type InvoiceDocKind,
  type InvoiceLineItem,
  type InvoiceRecord,
  type InvoiceTemplateItem,
  type LedgerEntry,
} from "@/lib/connectln-invoice-storage"
import {
  buildPrintableInvoiceHtml,
  buildXlsxBytes,
  downloadStudioFile,
  type PrintableInvoiceInput,
  type SheetExportCell,
} from "@/lib/connectln-studio-export"
import {
  loadStudioWorkbooks,
  type StudioSheetTab,
  type StudioWorkbookRecord,
} from "@/lib/connectln-studio-storage"
import type { StudioSharePayload } from "./ConnectLnDocsEditor"
import { ConnectLnStudioPrintModal } from "./ConnectLnStudioPrintModal"

interface ConnectLnInvoiceAppProps {
  user: UserProfile
  pendingImportSheet?: { workbookTitle: string; sheet: StudioSheetTab } | null
  onClearPendingImport?: () => void
  onSendToSign?: (doc: { id: string; title: string; contentHtml: string; category?: string }) => void
  onShareToFeed?: (payload: StudioSharePayload) => void
}

type InvoiceWorkspaceTab = "builder" | "ledger" | "preview"
type InvoiceFilterKind = "all" | "invoice" | "estimate" | "paid" | "open"

function statusPillClasses(status: string): string {
  if (status === "paid") return "bg-emerald-100 text-emerald-800 border-emerald-200"
  if (status === "overdue") return "bg-rose-100 text-rose-800 border-rose-200"
  if (status === "partial") return "bg-sky-100 text-sky-800 border-sky-200"
  if (status === "sent") return "bg-amber-100 text-amber-800 border-amber-200"
  if (status === "void") return "bg-zinc-200 text-zinc-600 border-zinc-300"
  return "bg-zinc-100 text-zinc-700 border-zinc-200"
}

export function ConnectLnInvoiceApp({
  user,
  pendingImportSheet,
  onClearPendingImport,
  onSendToSign,
  onShareToFeed,
}: ConnectLnInvoiceAppProps) {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => loadInvoices(user))
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(() => loadLedgerEntries(user))
  const [activeInvoiceId, setActiveInvoiceId] = useState<string>(() => invoices[0]?.id || "")
  const [workspaceTab, setWorkspaceTab] = useState<InvoiceWorkspaceTab>("builder")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterKind, setFilterKind] = useState<InvoiceFilterKind>("all")

  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [showSheetsModal, setShowSheetsModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [statusNotice, setStatusNotice] = useState<string | null>(null)
  const [savedLabel, setSavedLabel] = useState("Saved")

  // Payment capture modal state
  const [payAmount, setPayAmount] = useState("0.00")
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [payMethod, setPayMethod] = useState("ACH Transfer")
  const [payRef, setPayRef] = useState("")
  const [payNote, setPayNote] = useState("")

  // Quick-add ledger entry form state
  const [ledgerType, setLedgerType] = useState<"expense" | "income">("expense")
  const [ledgerCategory, setLedgerCategory] = useState<string>(LEDGER_CATEGORIES[0])
  const [ledgerDesc, setLedgerDesc] = useState("")
  const [ledgerCounterparty, setLedgerCounterparty] = useState("")
  const [ledgerAmount, setLedgerAmount] = useState("")
  const [ledgerTaxDeductible, setLedgerTaxDeductible] = useState(true)

  const notify = (msg: string) => {
    setStatusNotice(msg)
    setTimeout(() => setStatusNotice((prev) => (prev === msg ? null : prev)), 4000)
  }

  useEffect(() => {
    setSavedLabel("Saving...")
    const timer = setTimeout(() => {
      saveInvoices(user, invoices)
      saveLedgerEntries(user, ledgerEntries)
      setSavedLabel("Saved cleanly")
    }, 200)
    return () => clearTimeout(timer)
  }, [invoices, ledgerEntries, user])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault()
        setShowPrintModal(true)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  // Handle 1-click Create Invoice import from ConnectLn Sheets
  useEffect(() => {
    if (!pendingImportSheet) return
    const imported = createInvoiceFromSheetTab(
      pendingImportSheet.workbookTitle,
      pendingImportSheet.sheet,
      user
    )
    setInvoices((prev) => [imported, ...prev])
    setActiveInvoiceId(imported.id)
    setWorkspaceTab("builder")
    notify(`Imported ${imported.items.length} line(s) from "${pendingImportSheet.workbookTitle}"`)
    onClearPendingImport?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingImportSheet])

  const activeInvoice = useMemo(
    () => invoices.find((inv) => inv.id === activeInvoiceId) || invoices[0] || null,
    [invoices, activeInvoiceId]
  )

  const activeTotals = useMemo(
    () => (activeInvoice ? calculateInvoiceTotals(activeInvoice) : null),
    [activeInvoice]
  )

  const ledgerSummary = useMemo(
    () => calculateLedgerSummary(invoices, ledgerEntries),
    [invoices, ledgerEntries]
  )

  const printableInvoice: PrintableInvoiceInput | null = useMemo(() => {
    if (!activeInvoice || !activeTotals) return null
    const sym = CURRENCY_META[activeInvoice.currency]?.symbol || "$"
    return {
      invoiceNumber: activeInvoice.invoiceNumber,
      kind: activeInvoice.kind,
      status: activeTotals.computedStatus,
      currencySymbol: sym,
      title: activeInvoice.title,
      poNumber: activeInvoice.poNumber,
      issueDate: activeInvoice.issueDate,
      dueDate: activeInvoice.dueDate,
      paymentTerms: activeInvoice.paymentTerms,
      senderCompany: activeInvoice.senderCompany,
      senderName: activeInvoice.senderName,
      senderEmail: activeInvoice.senderEmail,
      senderAddress: activeInvoice.senderAddress,
      clientCompany: activeInvoice.clientCompany,
      clientName: activeInvoice.clientName,
      clientEmail: activeInvoice.clientEmail,
      clientAddress: activeInvoice.clientAddress,
      items: activeInvoice.items,
      subtotal: activeTotals.subtotal,
      discountAmount: activeTotals.discountAmount,
      taxRatePct: activeInvoice.taxRatePct,
      taxAmount: activeTotals.taxAmount,
      retainagePct: activeInvoice.retainagePct,
      retainageAmount: activeTotals.retainageAmount,
      grandTotal: activeTotals.grandTotal,
      amountPaid: activeTotals.amountPaid,
      balanceDue: activeTotals.balanceDue,
      payments: activeInvoice.payments,
      notes: activeInvoice.notes,
      paymentInstructions: activeInvoice.paymentInstructions,
    }
  }, [activeInvoice, activeTotals])

  const previewDocumentHtml = useMemo(
    () =>
      printableInvoice
        ? buildPrintableInvoiceHtml(printableInvoice, { showPaymentHistory: true })
        : "",
    [printableInvoice]
  )

  const studioWorkbooks = useMemo<StudioWorkbookRecord[]>(
    () => (showSheetsModal ? loadStudioWorkbooks(user) : []),
    [showSheetsModal, user]
  )

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return invoices.filter((inv) => {
      const totals = calculateInvoiceTotals(inv)
      if (filterKind === "invoice" && inv.kind !== "invoice") return false
      if (filterKind === "estimate" && inv.kind !== "estimate") return false
      if (filterKind === "paid" && totals.computedStatus !== "paid") return false
      if (
        filterKind === "open" &&
        !["draft", "sent", "partial", "overdue"].includes(totals.computedStatus)
      ) {
        return false
      }
      if (!q) return true
      return (
        inv.title.toLowerCase().includes(q) ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.clientCompany.toLowerCase().includes(q) ||
        inv.clientName.toLowerCase().includes(q)
      )
    })
  }, [invoices, filterKind, searchQuery])

  const updateActiveInvoice = (patch: Partial<InvoiceRecord>) => {
    if (!activeInvoice) return
    const nowIso = new Date().toISOString()
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === activeInvoice.id ? { ...inv, ...patch, updatedAt: nowIso } : inv
      )
    )
  }

  const handleCreateBlank = (kind: InvoiceDocKind = "invoice") => {
    const now = new Date()
    const nowIso = now.toISOString()
    const due = new Date(now.getTime() + 14 * 86400000).toISOString().slice(0, 10)
    const created: InvoiceRecord = {
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      invoiceNumber: generateInvoiceNumber(kind),
      kind,
      status: "draft",
      currency: "USD",
      title:
        kind === "estimate"
          ? `New Project Estimate ${invoices.length + 1}`
          : kind === "receipt"
          ? `Payment Receipt ${invoices.length + 1}`
          : `New Client Invoice ${invoices.length + 1}`,
      poNumber: "",
      issueDate: nowIso.slice(0, 10),
      dueDate: due,
      paymentTerms: kind === "receipt" ? "Paid in Full" : "Net 14",
      senderName: user.name || "ConnectLn Member",
      senderEmail: user.email || "billing@conectln.com",
      senderCompany: `${user.name || "ConnectLn"} Practice`,
      senderAddress: "ConnectLn 360 Verified Studio",
      clientName: "Client Contact",
      clientEmail: "accounts@client.com",
      clientCompany: "Client Organization LLC",
      clientAddress: "Client Street Address",
      items: [
        {
          id: `li_${Date.now()}`,
          description: "Professional Advisory & Implementation Service",
          category: "Advisory",
          qty: 1,
          unitPrice: 750,
          taxable: false,
        },
      ],
      taxRatePct: 0,
      discountType: "fixed",
      discountValue: 0,
      retainagePct: 0,
      payments: [],
      notes: "Prepared with ConnectLn Invoice & Ledger.",
      paymentInstructions: "ACH Transfer or Wire referencing the Invoice # above.",
      createdAt: nowIso,
      updatedAt: nowIso,
    }
    setInvoices((prev) => [created, ...prev])
    setActiveInvoiceId(created.id)
    setWorkspaceTab("builder")
    notify(`Created ${created.invoiceNumber}`)
  }

  const handleCreateFromTemplate = (tpl: InvoiceTemplateItem) => {
    const now = new Date()
    const nowIso = now.toISOString()
    const due = new Date(now.getTime() + 14 * 86400000).toISOString().slice(0, 10)
    const created: InvoiceRecord = {
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      invoiceNumber: generateInvoiceNumber(tpl.kind),
      kind: tpl.kind,
      status: tpl.kind === "receipt" ? "paid" : "draft",
      currency: "USD",
      title: tpl.name,
      poNumber: "",
      issueDate: nowIso.slice(0, 10),
      dueDate: due,
      paymentTerms: tpl.defaultTerms,
      senderName: user.name || "ConnectLn Member",
      senderEmail: user.email || "billing@conectln.com",
      senderCompany: `${user.name || "ConnectLn"} Practice`,
      senderAddress: "ConnectLn 360 Verified Studio",
      clientName: "Client Contact",
      clientEmail: "ap@client-org.com",
      clientCompany: "Client Organization LLC",
      clientAddress: "Verified Client Address",
      items: tpl.items.map((it, idx) => ({
        ...it,
        id: `tpl_li_${Date.now()}_${idx}`,
      })),
      taxRatePct: tpl.defaultTaxRatePct,
      discountType: "percent",
      discountValue: 0,
      retainagePct: tpl.defaultRetainagePct || 0,
      payments: [],
      notes: tpl.notes,
      paymentInstructions: tpl.paymentInstructions,
      createdAt: nowIso,
      updatedAt: nowIso,
    }
    setInvoices((prev) => [created, ...prev])
    setActiveInvoiceId(created.id)
    setShowTemplatesModal(false)
    setWorkspaceTab("builder")
    notify(`Loaded template "${tpl.name}"`)
  }

  const handleImportSheet = (wb: StudioWorkbookRecord, sheet: StudioSheetTab) => {
    const imported = createInvoiceFromSheetTab(wb.title, sheet, user)
    setInvoices((prev) => [imported, ...prev])
    setActiveInvoiceId(imported.id)
    setShowSheetsModal(false)
    setWorkspaceTab("builder")
    notify(`Imported ${imported.items.length} line item(s) from "${wb.title}"`)
  }

  const handleAddLineItem = () => {
    if (!activeInvoice) return
    const nextItem: InvoiceLineItem = {
      id: `li_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      description: "Additional Deliverable / Service Line",
      category: "Services",
      qty: 1,
      unitPrice: 250,
      taxable: false,
    }
    updateActiveInvoice({ items: [...activeInvoice.items, nextItem] })
    notify("Added line item")
  }

  const handleUpdateLineItem = (itemId: string, patch: Partial<InvoiceLineItem>) => {
    if (!activeInvoice) return
    updateActiveInvoice({
      items: activeInvoice.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
    })
  }

  const handleRemoveLineItem = (itemId: string) => {
    if (!activeInvoice) return
    if (activeInvoice.items.length <= 1) {
      notify("Keep at least one line item")
      return
    }
    updateActiveInvoice({ items: activeInvoice.items.filter((it) => it.id !== itemId) })
  }

  const openRecordPaymentModal = () => {
    if (!activeTotals) return
    const suggested = activeTotals.balanceDue > 0 ? activeTotals.balanceDue : activeTotals.grandTotal
    setPayAmount(suggested.toFixed(2))
    setPayDate(new Date().toISOString().slice(0, 10))
    setPayRef(`PAY-${Math.floor(1000 + Math.random() * 9000)}`)
    setPayNote("Invoice payment settled via ConnectLn Invoice & Ledger")
    setShowPaymentModal(true)
  }

  const handleSavePayment = () => {
    if (!activeInvoice) return
    const parsedAmt = Math.max(0, Number.parseFloat(payAmount) || 0)
    if (parsedAmt <= 0) {
      notify("Enter a positive payment amount")
      return
    }
    const newPayment = {
      id: `pay_${Date.now()}`,
      amount: parsedAmt,
      date: payDate || new Date().toISOString().slice(0, 10),
      method: payMethod || "ACH Transfer",
      reference: payRef.trim() || `REF-${Date.now().toString().slice(-4)}`,
      note: payNote.trim() || "Recorded payment",
    }
    const nextPayments = [...activeInvoice.payments, newPayment]
    const nextTotals = calculateInvoiceTotals({ ...activeInvoice, payments: nextPayments })
    updateActiveInvoice({
      payments: nextPayments,
      status: nextTotals.computedStatus,
    })

    const syncedLedger: LedgerEntry = {
      id: `led_pay_${Date.now()}`,
      date: newPayment.date,
      type: "income",
      category: "Client Retainer & Milestone",
      description: `Payment (${activeInvoice.invoiceNumber}): ${activeInvoice.title}`,
      counterparty: activeInvoice.clientCompany || activeInvoice.clientName,
      amount: parsedAmt,
      currency: activeInvoice.currency,
      taxDeductible: false,
      linkedInvoiceId: activeInvoice.id,
      reference: newPayment.reference,
      createdAt: new Date().toISOString(),
    }
    setLedgerEntries((prev) => [syncedLedger, ...prev])
    setShowPaymentModal(false)
    notify(
      nextTotals.computedStatus === "paid"
        ? `Recorded ${formatInvoiceMoney(parsedAmt, activeInvoice.currency)} — ${activeInvoice.invoiceNumber} is PAID!`
        : `Recorded partial payment of ${formatInvoiceMoney(parsedAmt, activeInvoice.currency)}`
    )
  }

  const handleConvertEstimate = () => {
    if (!activeInvoice || activeInvoice.kind !== "estimate") return
    const converted = convertEstimateToInvoice(activeInvoice)
    setInvoices((prev) => [converted, ...prev])
    setActiveInvoiceId(converted.id)
    notify(`Converted Estimate into Invoice ${converted.invoiceNumber}`)
  }

  const handleSendToSign = () => {
    if (!activeInvoice || !onSendToSign) return
    onSendToSign({
      id: activeInvoice.id,
      title: `${activeInvoice.invoiceNumber} — ${activeInvoice.title}`,
      contentHtml: buildInvoiceAgreementHtml(activeInvoice),
      category: activeInvoice.kind === "estimate" ? "Estimate Approval" : "Invoice Authorization",
    })
  }

  const handleAddLedgerEntry = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = Number.parseFloat(ledgerAmount)
    if (!ledgerDesc.trim() || !Number.isFinite(amt) || amt <= 0) {
      notify("Enter a description and positive amount")
      return
    }
    const created: LedgerEntry = {
      id: `led_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      type: ledgerType,
      category: ledgerCategory,
      description: ledgerDesc.trim(),
      counterparty: ledgerCounterparty.trim() || "General Vendor / Client",
      amount: Math.round(amt * 100) / 100,
      currency: activeInvoice?.currency || "USD",
      taxDeductible: ledgerType === "expense" ? ledgerTaxDeductible : false,
      reference: `${ledgerType === "expense" ? "EXP" : "INC"}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    }
    setLedgerEntries((prev) => [created, ...prev])
    setLedgerDesc("")
    setLedgerCounterparty("")
    setLedgerAmount("")
    notify(`Logged ${ledgerType} entry (${formatInvoiceMoney(created.amount, created.currency)})`)
  }

  const handleExport = (fmt: "xlsx" | "html" | "csv" | "print") => {
    setShowExportMenu(false)
    if (!activeInvoice || !activeTotals || !printableInvoice) return
    const slug = (activeInvoice.invoiceNumber || "connectln-invoice").toLowerCase()

    if (fmt === "print") {
      setShowPrintModal(true)
      return
    }
    if (fmt === "html") {
      downloadStudioFile(
        buildPrintableInvoiceHtml(printableInvoice, { showPaymentHistory: true }),
        `${slug}.html`,
        "text/html;charset=utf-8"
      )
      notify(`Exported ${slug}.html`)
      return
    }
    if (fmt === "csv") {
      const csv = exportLedgerToCsv(ledgerEntries, invoices)
      downloadStudioFile(csv, "connectln-invoice-ledger.csv", "text/csv;charset=utf-8")
      notify("Exported connectln-invoice-ledger.csv")
      return
    }

    const cells: Record<string, SheetExportCell> = {
      A1: { raw: "Item Description" },
      B1: { raw: "Category" },
      C1: { raw: "Qty" },
      D1: { raw: "Unit Price" },
      E1: { raw: "Line Total" },
    }
    activeInvoice.items.forEach((it, idx) => {
      const r = idx + 2
      cells[`A${r}`] = { raw: it.description }
      cells[`B${r}`] = { raw: it.category }
      cells[`C${r}`] = { raw: String(it.qty), isNumeric: true, evaluated: it.qty }
      cells[`D${r}`] = { raw: String(it.unitPrice), isNumeric: true, evaluated: it.unitPrice }
      cells[`E${r}`] = {
        raw: `=C${r}*D${r}`,
        isNumeric: true,
        evaluated: it.qty * it.unitPrice,
      }
    })
    const lastRow = activeInvoice.items.length + 2
    cells[`A${lastRow}`] = { raw: "Grand Total" }
    cells[`E${lastRow}`] = {
      raw: String(activeTotals.grandTotal),
      isNumeric: true,
      evaluated: activeTotals.grandTotal,
    }

    const bytes = buildXlsxBytes(activeInvoice.title || "ConnectLn Invoice", [
      {
        name: activeInvoice.invoiceNumber.slice(0, 28),
        rowCount: Math.max(15, lastRow + 3),
        colCount: 6,
        cells,
      },
    ])
    downloadStudioFile(
      bytes,
      `${slug}.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    notify(`Exported ${slug}.xlsx`)
  }

  const handleShareMilestone = () => {
    if (!activeInvoice || !activeTotals || !onShareToFeed) return
    onShareToFeed({
      title: `${activeInvoice.title} (${activeInvoice.invoiceNumber})`,
      summary: `Billing package structured in ConnectLn Invoice & Ledger: ${formatInvoiceMoney(
        activeTotals.grandTotal,
        activeInvoice.currency
      )} total · Status: ${activeTotals.computedStatus.toUpperCase()} (${activeInvoice.items.length} line item(s)).`,
      appLabel: "ConnectLn Invoice",
    })
  }

  const sortedLedger = useMemo(
    () =>
      [...ledgerEntries].sort((a, b) =>
        b.date === a.date
          ? b.createdAt.localeCompare(a.createdAt)
          : b.date.localeCompare(a.date)
      ),
    [ledgerEntries]
  )

  return (
    <div className="flex flex-col lg:flex-row gap-3 min-h-[760px]">
      {/* Left Invoice Library Sidebar */}
      {sidebarOpen && (
        <aside className="w-full lg:w-72 shrink-0 rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[#E7E2DA] dark:border-zinc-800 space-y-2">
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleCreateBlank("invoice")}
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white px-2 py-2 text-xs font-bold shadow-xs cursor-pointer"
              >
                <FilePlus2 className="h-3.5 w-3.5" />
                New
              </button>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(true)}
                className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-2 text-xs font-bold text-[#0B1F3A] dark:text-zinc-200 hover:border-[#0F766E] cursor-pointer"
              >
                <LayoutTemplate className="h-3.5 w-3.5 text-[#0F766E]" />
                Templates
              </button>
              <button
                type="button"
                onClick={() => setShowSheetsModal(true)}
                className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-2 text-xs font-bold text-[#107C41] dark:text-emerald-300 hover:border-[#107C41] cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Sheets
              </button>
            </div>

            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoices & clients..."
                className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-8 pr-2.5 py-1.5 text-xs outline-none focus:border-[#0F766E]"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "invoice", label: "Invoices" },
                  { id: "estimate", label: "Estimates" },
                  { id: "paid", label: "Paid" },
                  { id: "open", label: "Open" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterKind(f.id)}
                  className={`rounded-lg px-2 py-1 text-[10.5px] font-bold cursor-pointer ${
                    filterKind === f.id
                      ? "bg-[#0F766E] text-white"
                      : "bg-white dark:bg-zinc-900 text-zinc-600 border border-[#E7E2DA] dark:border-zinc-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[250px] lg:max-h-none">
            {filteredInvoices.map((inv) => {
              const isSelected = inv.id === activeInvoice?.id
              const tot = calculateInvoiceTotals(inv)
              return (
                <div
                  key={inv.id}
                  onClick={() => setActiveInvoiceId(inv.id)}
                  className={`group rounded-xl border p-2.5 transition-all cursor-pointer space-y-1 ${
                    isSelected
                      ? "border-[#0F766E] bg-white dark:bg-zinc-900 shadow-xs"
                      : "border-transparent hover:border-[#E7E2DA] hover:bg-white/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <p className="text-xs font-bold text-[#0B1F3A] dark:text-zinc-100 line-clamp-1 flex-1">
                      {inv.title}
                    </p>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setInvoices((prev) =>
                            prev.map((x) =>
                              x.id === inv.id ? { ...x, starred: !x.starred } : x
                            )
                          )
                        }}
                        className="p-0.5 cursor-pointer"
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${
                            inv.starred ? "fill-amber-400 text-amber-500" : "text-zinc-400"
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (invoices.length <= 1) {
                            notify("Keep at least one invoice record")
                            return
                          }
                          const rem = invoices.filter((x) => x.id !== inv.id)
                          setInvoices(rem)
                          if (activeInvoiceId === inv.id && rem[0]) {
                            setActiveInvoiceId(rem[0].id)
                          }
                        }}
                        className="p-0.5 text-zinc-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[10px]">
                    <span
                      className={`rounded-full border px-2 py-0.5 font-extrabold uppercase ${statusPillClasses(
                        tot.computedStatus
                      )}`}
                    >
                      {inv.kind === "estimate"
                        ? "Estimate"
                        : tot.computedStatus.toUpperCase()}
                    </span>
                    <span className="font-mono font-bold text-[#0B1F3A] dark:text-zinc-200">
                      {formatInvoiceMoney(tot.grandTotal, inv.currency)}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {inv.invoiceNumber} · {inv.clientCompany || inv.clientName}
                  </p>
                </div>
              )
            })}
          </div>
        </aside>
      )}

      {/* Main Invoice & Ledger Workspace */}
      <div className="flex-1 min-w-0 rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 border-b border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/60 dark:bg-zinc-950/60">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              title="Toggle invoice library"
              className="p-1.5 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 hover:text-[#0F766E] cursor-pointer"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </button>
            <input
              type="text"
              aria-label="Invoice project title"
              value={activeInvoice?.title || ""}
              onChange={(e) => updateActiveInvoice({ title: e.target.value })}
              placeholder="Invoice / Project title..."
              className="min-w-[160px] flex-1 max-w-md rounded-lg border border-transparent hover:border-[#E7E2DA] focus:border-[#0F766E] bg-transparent px-2 py-1 text-sm sm:text-base font-extrabold text-[#0B1F3A] dark:text-white outline-none"
            />
            {activeTotals && (
              <span
                className={`hidden sm:inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase ${statusPillClasses(
                  activeTotals.computedStatus
                )}`}
              >
                {activeTotals.computedStatus.toUpperCase()}
              </span>
            )}
            <span className="hidden xl:inline-flex text-[11px] font-semibold text-zinc-500">
              {savedLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {statusNotice && (
              <span className="rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 px-2.5 py-1 text-xs font-semibold text-[#0F766E] dark:text-teal-300">
                {statusNotice}
              </span>
            )}

            {activeInvoice && activeTotals && activeTotals.balanceDue > 0.005 && (
              <button
                type="button"
                onClick={openRecordPaymentModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white px-3 py-1.5 text-xs font-extrabold shadow-xs cursor-pointer"
              >
                <CreditCard className="h-3.5 w-3.5" />
                Record Payment
              </button>
            )}

            {activeInvoice?.kind === "estimate" && (
              <button
                type="button"
                onClick={handleConvertEstimate}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#0F766E] bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 px-3 py-1.5 text-xs font-extrabold text-[#0F766E] dark:text-teal-300 cursor-pointer"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Convert to Invoice
              </button>
            )}

            {onSendToSign && activeInvoice && (
              <button
                type="button"
                onClick={handleSendToSign}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#4338CA] bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 px-3 py-1.5 text-xs font-extrabold text-[#4338CA] dark:text-indigo-300 cursor-pointer"
              >
                <FileSignature className="h-3.5 w-3.5" />
                Send to Sign
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              title="Print or Save as PDF (Ctrl+P)"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#0F766E] bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 px-3 py-1.5 text-xs font-extrabold text-[#0F766E] dark:text-teal-300 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 px-3 py-1.5 text-xs font-bold hover:border-[#0F766E] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#0F766E]" />
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-10 z-30 w-60 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1.5 shadow-xl space-y-1">
                  <button
                    type="button"
                    onClick={() => handleExport("xlsx")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <span>Workbook Schedule (.xlsx)</span>
                    <span className="text-[10px] font-mono text-[#0F766E]">OpenXML</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("html")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <span>Client Statement (.html)</span>
                    <span className="text-[10px] font-mono text-zinc-400">Web</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("csv")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <span>Full Ledger (.csv)</span>
                    <span className="text-[10px] font-mono text-zinc-400">RFC 4180</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("print")}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5 text-[#0F766E]" />
                    <span>Print / Save as PDF</span>
                  </button>
                </div>
              )}
            </div>

            {onShareToFeed && (
              <button
                type="button"
                onClick={handleShareMilestone}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0067B8] hover:bg-[#00559b] text-white px-3 py-1.5 text-xs font-bold shadow-xs cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share Milestone
              </button>
            )}
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 pt-1.5 border-b border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {(
              [
                { id: "builder", label: "Invoice Builder", Icon: Receipt },
                { id: "ledger", label: "Income & Expense Ledger", Icon: Wallet },
                { id: "preview", label: "Client Preview", Icon: Eye },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setWorkspaceTab(id)}
                className={`inline-flex items-center gap-1.5 rounded-t-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  workspaceTab === id
                    ? "bg-white dark:bg-zinc-900 text-[#0F766E] dark:text-teal-300 border-t-2 border-x border-t-[#0F766E] border-x-[#E7E2DA] dark:border-x-zinc-800"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-[#0B1F3A]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {activeInvoice && (
            <div className="flex items-center gap-2 pb-1.5 text-xs">
              <select
                aria-label="Document type"
                value={activeInvoice.kind}
                onChange={(e) =>
                  updateActiveInvoice({ kind: e.target.value as InvoiceDocKind })
                }
                className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 font-bold"
              >
                <option value="invoice">Invoice</option>
                <option value="estimate">Estimate / Quote</option>
                <option value="receipt">Payment Receipt</option>
              </select>
              <select
                aria-label="Invoice currency"
                value={activeInvoice.currency}
                onChange={(e) =>
                  updateActiveInvoice({ currency: e.target.value as InvoiceCurrency })
                }
                className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 font-bold"
              >
                {Object.entries(CURRENCY_META).map(([code, meta]) => (
                  <option key={code} value={code}>
                    {code} ({meta.symbol})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#FAF7F2]/40 dark:bg-zinc-950/40 space-y-4">
          {/* TAB 1: INVOICE BUILDER */}
          {workspaceTab === "builder" && activeInvoice && activeTotals && (
            <div className="space-y-4">
              {/* Summary Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
                  <p className="text-[11px] font-bold uppercase text-zinc-500">Grand Total</p>
                  <p className="text-lg font-extrabold text-[#0B1F3A] dark:text-white font-mono">
                    {formatInvoiceMoney(activeTotals.grandTotal, activeInvoice.currency)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
                  <p className="text-[11px] font-bold uppercase text-zinc-500">Amount Paid</p>
                  <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                    {formatInvoiceMoney(activeTotals.amountPaid, activeInvoice.currency)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
                  <p className="text-[11px] font-bold uppercase text-zinc-500">Balance Due</p>
                  <p className="text-lg font-extrabold text-[#0F766E] dark:text-teal-300 font-mono">
                    {formatInvoiceMoney(activeTotals.balanceDue, activeInvoice.currency)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
                  <p className="text-[11px] font-bold uppercase text-zinc-500">Tax &amp; Retainage</p>
                  <p className="text-sm font-bold text-[#0B1F3A] dark:text-zinc-200 mt-1">
                    Tax {formatInvoiceMoney(activeTotals.taxAmount, activeInvoice.currency)} · Hold{" "}
                    {formatInvoiceMoney(activeTotals.retainageAmount, activeInvoice.currency)}
                  </p>
                </div>
              </div>

              {/* Metadata & Parties Card */}
              <div className="rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                      Document #
                    </label>
                    <input
                      type="text"
                      value={activeInvoice.invoiceNumber}
                      onChange={(e) => updateActiveInvoice({ invoiceNumber: e.target.value })}
                      className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 px-2.5 py-1.5 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={activeInvoice.issueDate}
                      onChange={(e) => updateActiveInvoice({ issueDate: e.target.value })}
                      className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={activeInvoice.dueDate}
                      onChange={(e) => updateActiveInvoice({ dueDate: e.target.value })}
                      className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                      Payment Terms
                    </label>
                    <input
                      type="text"
                      value={activeInvoice.paymentTerms}
                      onChange={(e) => updateActiveInvoice({ paymentTerms: e.target.value })}
                      className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                      PO / Reference
                    </label>
                    <input
                      type="text"
                      value={activeInvoice.poNumber || ""}
                      onChange={(e) => updateActiveInvoice({ poNumber: e.target.value })}
                      placeholder="Optional PO #"
                      className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 px-2.5 py-1.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#E7E2DA] dark:border-zinc-800 text-xs">
                  <div className="space-y-2 rounded-xl bg-[#FAF7F2] dark:bg-zinc-950 p-3 border border-[#E7E2DA] dark:border-zinc-800">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0F766E]">
                      From (Your Business / Practice)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={activeInvoice.senderCompany}
                        onChange={(e) => updateActiveInvoice({ senderCompany: e.target.value })}
                        placeholder="Business Name"
                        className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 font-semibold"
                      />
                      <input
                        type="text"
                        value={activeInvoice.senderName}
                        onChange={(e) => updateActiveInvoice({ senderName: e.target.value })}
                        placeholder="Sender Contact"
                        className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5"
                      />
                      <input
                        type="email"
                        value={activeInvoice.senderEmail}
                        onChange={(e) => updateActiveInvoice({ senderEmail: e.target.value })}
                        placeholder="Sender Email"
                        className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5"
                      />
                      <input
                        type="text"
                        value={activeInvoice.senderAddress}
                        onChange={(e) => updateActiveInvoice({ senderAddress: e.target.value })}
                        placeholder="Sender Address"
                        className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl bg-[#FAF7F2] dark:bg-zinc-950 p-3 border border-[#E7E2DA] dark:border-zinc-800">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0B5CAD]">
                      Bill To (Client / Counterparty)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={activeInvoice.clientCompany}
                        onChange={(e) => updateActiveInvoice({ clientCompany: e.target.value })}
                        placeholder="Client Company"
                        className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 font-semibold"
                      />
                      <input
                        type="text"
                        value={activeInvoice.clientName}
                        onChange={(e) => updateActiveInvoice({ clientName: e.target.value })}
                        placeholder="Client Contact"
                        className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5"
                      />
                      <input
                        type="email"
                        value={activeInvoice.clientEmail}
                        onChange={(e) => updateActiveInvoice({ clientEmail: e.target.value })}
                        placeholder="Client Email"
                        className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5"
                      />
                      <input
                        type="text"
                        value={activeInvoice.clientAddress}
                        onChange={(e) => updateActiveInvoice({ clientAddress: e.target.value })}
                        placeholder="Client Address"
                        className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#0B1F3A] dark:text-zinc-200">
                    Line Items ({activeInvoice.items.length})
                  </h2>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white px-3 py-1.5 text-xs font-bold cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Line Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#FAF7F2] dark:bg-zinc-950 text-zinc-500 uppercase text-[10.5px]">
                        <th className="border border-[#E7E2DA] dark:border-zinc-800 px-2.5 py-2 text-left">
                          Description
                        </th>
                        <th className="border border-[#E7E2DA] dark:border-zinc-800 px-2.5 py-2 text-left w-36">
                          Category
                        </th>
                        <th className="border border-[#E7E2DA] dark:border-zinc-800 px-2.5 py-2 text-right w-20">
                          Qty
                        </th>
                        <th className="border border-[#E7E2DA] dark:border-zinc-800 px-2.5 py-2 text-right w-28">
                          Unit Price
                        </th>
                        <th className="border border-[#E7E2DA] dark:border-zinc-800 px-2 py-2 text-center w-16">
                          Tax
                        </th>
                        <th className="border border-[#E7E2DA] dark:border-zinc-800 px-2.5 py-2 text-right w-28">
                          Amount
                        </th>
                        <th className="border border-[#E7E2DA] dark:border-zinc-800 px-2 py-2 w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {activeInvoice.items.map((item) => (
                        <tr key={item.id}>
                          <td className="border border-[#E7E2DA] dark:border-zinc-800 p-1.5">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) =>
                                handleUpdateLineItem(item.id, { description: e.target.value })
                              }
                              className="w-full rounded px-2 py-1 bg-transparent font-semibold outline-none focus:bg-teal-50/40"
                            />
                          </td>
                          <td className="border border-[#E7E2DA] dark:border-zinc-800 p-1.5">
                            <input
                              type="text"
                              value={item.category}
                              onChange={(e) =>
                                handleUpdateLineItem(item.id, { category: e.target.value })
                              }
                              className="w-full rounded px-2 py-1 bg-transparent outline-none focus:bg-teal-50/40"
                            />
                          </td>
                          <td className="border border-[#E7E2DA] dark:border-zinc-800 p-1.5">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={item.qty}
                              onChange={(e) =>
                                handleUpdateLineItem(item.id, {
                                  qty: Number.parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full rounded px-2 py-1 text-right bg-transparent font-mono outline-none"
                            />
                          </td>
                          <td className="border border-[#E7E2DA] dark:border-zinc-800 p-1.5">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleUpdateLineItem(item.id, {
                                  unitPrice: Number.parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full rounded px-2 py-1 text-right bg-transparent font-mono outline-none"
                            />
                          </td>
                          <td className="border border-[#E7E2DA] dark:border-zinc-800 p-1.5 text-center">
                            <input
                              type="checkbox"
                              checked={item.taxable}
                              onChange={(e) =>
                                handleUpdateLineItem(item.id, { taxable: e.target.checked })
                              }
                            />
                          </td>
                          <td className="border border-[#E7E2DA] dark:border-zinc-800 px-2.5 py-1.5 text-right font-mono font-bold">
                            {formatInvoiceMoney(
                              (item.qty || 0) * (item.unitPrice || 0),
                              activeInvoice.currency
                            )}
                          </td>
                          <td className="border border-[#E7E2DA] dark:border-zinc-800 p-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(item.id)}
                              className="p-1 text-zinc-400 hover:text-rose-600 cursor-pointer"
                              title="Remove line item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tax / Discount / Retainage + Notes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                        Client Notes &amp; Scope Summary
                      </label>
                      <textarea
                        rows={2}
                        value={activeInvoice.notes}
                        onChange={(e) => updateActiveInvoice({ notes: e.target.value })}
                        className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 px-3 py-2 outline-none focus:border-[#0F766E]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                        Payment / Remittance Instructions
                      </label>
                      <textarea
                        rows={2}
                        value={activeInvoice.paymentInstructions}
                        onChange={(e) =>
                          updateActiveInvoice({ paymentInstructions: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 px-3 py-2 outline-none focus:border-[#0F766E]"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 p-3.5 space-y-2.5 text-xs">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                          Tax Rate %
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.25"
                          value={activeInvoice.taxRatePct}
                          onChange={(e) =>
                            updateActiveInvoice({
                              taxRatePct: Number.parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                          Discount ({activeInvoice.discountType === "percent" ? "%" : CURRENCY_META[activeInvoice.currency].symbol})
                        </label>
                        <div className="flex gap-1">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={activeInvoice.discountValue}
                            onChange={(e) =>
                              updateActiveInvoice({
                                discountValue: Number.parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateActiveInvoice({
                                discountType:
                                  activeInvoice.discountType === "percent" ? "fixed" : "percent",
                              })
                            }
                            className="rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2 font-bold cursor-pointer"
                            title="Switch % vs fixed discount"
                          >
                            {activeInvoice.discountType === "percent" ? "%" : "$"}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                          Retainage %
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          step="1"
                          value={activeInvoice.retainagePct}
                          onChange={(e) =>
                            updateActiveInvoice({
                              retainagePct: Number.parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-[#E7E2DA] dark:border-zinc-800">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-mono font-semibold">
                          {formatInvoiceMoney(activeTotals.subtotal, activeInvoice.currency)}
                        </span>
                      </div>
                      {activeTotals.discountAmount > 0 && (
                        <div className="flex justify-between text-rose-700">
                          <span>Discount</span>
                          <span className="font-mono">
                            -{formatInvoiceMoney(activeTotals.discountAmount, activeInvoice.currency)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Tax ({activeInvoice.taxRatePct}%)</span>
                        <span className="font-mono">
                          {formatInvoiceMoney(activeTotals.taxAmount, activeInvoice.currency)}
                        </span>
                      </div>
                      {activeTotals.retainageAmount > 0 && (
                        <div className="flex justify-between text-amber-700">
                          <span>Retainage ({activeInvoice.retainagePct}%)</span>
                          <span className="font-mono">
                            -{formatInvoiceMoney(activeTotals.retainageAmount, activeInvoice.currency)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-[#E7E2DA] dark:border-zinc-800">
                        <span>Balance Due</span>
                        <span className="font-mono text-[#0F766E] dark:text-teal-300">
                          {formatInvoiceMoney(activeTotals.balanceDue, activeInvoice.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recorded Payments List */}
              {activeInvoice.payments.length > 0 && (
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Logged Payments ({activeInvoice.payments.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {activeInvoice.payments.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-zinc-900 px-3 py-2"
                      >
                        <div>
                          <p className="font-bold text-[#0B1F3A] dark:text-white">
                            {p.method} · <span className="font-mono">{p.reference}</span>
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            {p.date} {p.note ? `· ${p.note}` : ""}
                          </p>
                        </div>
                        <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                          {formatInvoiceMoney(p.amount, activeInvoice.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INCOME & EXPENSE LEDGER */}
          {workspaceTab === "ledger" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
                  <p className="text-[10.5px] font-bold uppercase text-zinc-500">Total Invoiced</p>
                  <p className="text-base font-extrabold font-mono text-[#0B1F3A] dark:text-white">
                    {formatInvoiceMoney(ledgerSummary.totalInvoiced, "USD")}
                  </p>
                </div>
                <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
                  <p className="text-[10.5px] font-bold uppercase text-zinc-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                    Collected
                  </p>
                  <p className="text-base font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
                    {formatInvoiceMoney(ledgerSummary.totalCollected, "USD")}
                  </p>
                </div>
                <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
                  <p className="text-[10.5px] font-bold uppercase text-zinc-500">Outstanding A/R</p>
                  <p className="text-base font-extrabold font-mono text-amber-700 dark:text-amber-400">
                    {formatInvoiceMoney(ledgerSummary.totalOutstanding, "USD")}
                  </p>
                </div>
                <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
                  <p className="text-[10.5px] font-bold uppercase text-zinc-500 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3 text-rose-600" />
                    Expenses
                  </p>
                  <p className="text-base font-extrabold font-mono text-rose-700 dark:text-rose-400">
                    {formatInvoiceMoney(ledgerSummary.totalExpenses, "USD")}
                  </p>
                </div>
                <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
                  <p className="text-[10.5px] font-bold uppercase text-zinc-500">Net Cash Flow</p>
                  <p
                    className={`text-base font-extrabold font-mono ${
                      ledgerSummary.netCashFlow >= 0
                        ? "text-[#0F766E] dark:text-teal-300"
                        : "text-rose-700"
                    }`}
                  >
                    {formatInvoiceMoney(ledgerSummary.netCashFlow, "USD")}
                  </p>
                </div>
                <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
                  <p className="text-[10.5px] font-bold uppercase text-zinc-500">Tax-Deductible</p>
                  <p className="text-base font-extrabold font-mono text-[#0B5CAD] dark:text-sky-400">
                    {formatInvoiceMoney(ledgerSummary.deductibleExpenses, "USD")}
                  </p>
                </div>
              </div>

              {/* Quick-Add Ledger Entry Form */}
              <form
                onSubmit={handleAddLedgerEntry}
                className="rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#0F766E]">
                    Log Income or Expense Transaction
                  </h2>
                  <span className="text-[11px] text-zinc-500">
                    Synced with Invoice Payments &amp; .csv Tax Export
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-2.5 items-end">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                      Type
                    </label>
                    <select
                      aria-label="Ledger entry type"
                      value={ledgerType}
                      onChange={(e) => setLedgerType(e.target.value as "expense" | "income")}
                      className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 px-2.5 py-2 font-bold"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                      Category
                    </label>
                    <select
                      aria-label="Ledger category"
                      value={ledgerCategory}
                      onChange={(e) => setLedgerCategory(e.target.value)}
                      className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 px-2.5 py-2"
                    >
                      {LEDGER_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      aria-label="Ledger description"
                      value={ledgerDesc}
                      onChange={(e) => setLedgerDesc(e.target.value)}
                      placeholder="e.g., Site Permit Fee or Client Retainer..."
                      className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      aria-label="Ledger amount"
                      value={ledgerAmount}
                      onChange={(e) => setLedgerAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 px-3 py-2 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white px-4 py-2 font-extrabold cursor-pointer"
                  >
                    Add Entry
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <input
                    type="text"
                    value={ledgerCounterparty}
                    onChange={(e) => setLedgerCounterparty(e.target.value)}
                    placeholder="Vendor or Payer Name (optional)"
                    className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 px-2.5 py-1 text-xs w-64"
                  />
                  {ledgerType === "expense" && (
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ledgerTaxDeductible}
                        onChange={(e) => setLedgerTaxDeductible(e.target.checked)}
                      />
                      <span>Mark as Business Tax-Deductible Expense</span>
                    </label>
                  )}
                </div>
              </form>

              {/* Expense Category Breakdown + Ledger Table */}
              {ledgerSummary.expensesByCategory.length > 0 && (
                <div className="rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                    Expense Breakdown by Category
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                    {ledgerSummary.expensesByCategory.map((cat) => {
                      const pct =
                        ledgerSummary.totalExpenses > 0
                          ? Math.round((cat.total / ledgerSummary.totalExpenses) * 100)
                          : 0
                      return (
                        <div
                          key={cat.category}
                          className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 p-2.5 space-y-1.5"
                        >
                          <div className="flex justify-between font-bold">
                            <span className="truncate">{cat.category}</span>
                            <span className="font-mono">
                              {formatInvoiceMoney(cat.total, "USD")} ({pct}%)
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-[#0F766E] rounded-full"
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF7F2] dark:bg-zinc-950 text-zinc-500 uppercase text-[10.5px]">
                      <th className="border border-[#E7E2DA] dark:border-zinc-800 px-3 py-2 text-left">
                        Date
                      </th>
                      <th className="border border-[#E7E2DA] dark:border-zinc-800 px-3 py-2 text-left">
                        Type
                      </th>
                      <th className="border border-[#E7E2DA] dark:border-zinc-800 px-3 py-2 text-left">
                        Category
                      </th>
                      <th className="border border-[#E7E2DA] dark:border-zinc-800 px-3 py-2 text-left">
                        Description &amp; Counterparty
                      </th>
                      <th className="border border-[#E7E2DA] dark:border-zinc-800 px-3 py-2 text-right">
                        Amount
                      </th>
                      <th className="border border-[#E7E2DA] dark:border-zinc-800 px-2 py-2 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLedger.map((entry) => (
                      <tr key={entry.id}>
                        <td className="border border-[#E7E2DA] dark:border-zinc-800 px-3 py-2 font-mono">
                          {entry.date}
                        </td>
                        <td className="border border-[#E7E2DA] dark:border-zinc-800 px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                              entry.type === "income"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {entry.type}
                          </span>
                        </td>
                        <td className="border border-[#E7E2DA] dark:border-zinc-800 px-3 py-2">
                          {entry.category}
                          {entry.taxDeductible && (
                            <span className="ml-1.5 rounded bg-sky-100 text-sky-800 px-1.5 py-0.5 text-[9.5px] font-bold">
                              Deductible
                            </span>
                          )}
                        </td>
                        <td className="border border-[#E7E2DA] dark:border-zinc-800 px-3 py-2">
                          <span className="font-semibold text-[#0B1F3A] dark:text-zinc-100">
                            {entry.description}
                          </span>
                          <span className="block text-[11px] text-zinc-500">
                            {entry.counterparty} {entry.reference ? `· ${entry.reference}` : ""}
                          </span>
                        </td>
                        <td
                          className={`border border-[#E7E2DA] dark:border-zinc-800 px-3 py-2 text-right font-mono font-bold ${
                            entry.type === "income" ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {entry.type === "income" ? "+" : "-"}
                          {formatInvoiceMoney(entry.amount, entry.currency)}
                        </td>
                        <td className="border border-[#E7E2DA] dark:border-zinc-800 px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setLedgerEntries((prev) => prev.filter((x) => x.id !== entry.id))
                            }
                            className="p-1 text-zinc-400 hover:text-rose-600 cursor-pointer"
                            title="Delete entry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CLIENT PREVIEW */}
          {workspaceTab === "preview" && activeInvoice && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-xs">
                <span className="font-bold text-[#0B1F3A] dark:text-zinc-200">
                  Client-Ready Statement — {activeInvoice.invoiceNumber}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {activeInvoice.status === "draft" && (
                    <button
                      type="button"
                      onClick={() => {
                        updateActiveInvoice({ status: "sent" })
                        notify(`Marked ${activeInvoice.invoiceNumber} as Sent`)
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 font-bold text-amber-800 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Mark as Sent
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPrintModal(true)}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#0F766E] text-white px-3 py-1.5 font-bold cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print / Save PDF
                  </button>
                </div>
              </div>
              <iframe
                title="ConnectLn Invoice Client Preview Frame"
                srcDoc={previewDocumentHtml}
                className="w-full h-[680px] rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white shadow-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && activeInvoice && (
        <div
          role="dialog"
          aria-label="ConnectLn Invoice Record Payment"
          className="fixed inset-0 z-[105] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#0B1F3A] dark:text-white">
                  Record Client Payment
                </h3>
                <p className="text-zinc-500 font-mono">{activeInvoice.invoiceNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-lg hover:bg-zinc-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                  Payment Amount ({activeInvoice.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  aria-label="Payment amount input"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 px-3 py-2 text-sm font-mono font-bold outline-none focus:border-[#0F766E]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                    Method
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 px-2.5 py-2 font-bold"
                  >
                    <option>ACH Transfer</option>
                    <option>Wire Transfer</option>
                    <option>Corporate Card</option>
                    <option>Bank Check</option>
                    <option>Mobile Money</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                  Reference / Receipt #
                </label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-bold uppercase text-zinc-500 mb-1">
                  Payment Note
                </label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="rounded-xl border border-[#E7E2DA] px-4 py-2 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePayment}
                className="rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white px-5 py-2 font-extrabold cursor-pointer"
              >
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-3">
              <h3 className="text-base font-extrabold text-[#0B1F3A] dark:text-white">
                ConnectLn Invoice &amp; Estimate Templates
              </h3>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[62vh] overflow-y-auto">
              {INVOICE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleCreateFromTemplate(tpl)}
                  className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 p-3.5 text-left hover:border-[#0F766E] hover:bg-teal-50/40 space-y-1.5 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase text-[#0F766E]">
                      {tpl.category}
                    </span>
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9.5px] font-bold uppercase text-zinc-600">
                      {tpl.kind}
                    </span>
                  </div>
                  <p className="text-xs font-extrabold text-[#0B1F3A] dark:text-white">
                    {tpl.name}
                  </p>
                  <p className="text-[11px] text-zinc-500">{tpl.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Import From ConnectLn Sheets Modal */}
      {showSheetsModal && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#0B1F3A] dark:text-white">
                  Import Workbook from ConnectLn Sheets
                </h3>
                <p className="text-xs text-zinc-500">
                  Evaluates sheet formulas and converts priced rows into invoice line items.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSheetsModal(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
              {studioWorkbooks.map((wb) => (
                <div
                  key={wb.id}
                  className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 p-3 space-y-2"
                >
                  <p className="text-xs font-extrabold text-[#0B1F3A] dark:text-white">
                    {wb.title}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {wb.sheets.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleImportSheet(wb, st)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#107C41]/40 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 text-xs font-bold text-[#107C41] cursor-pointer"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        Import &ldquo;{st.name}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Print Preview Modal */}
      {printableInvoice && activeInvoice && (
        <ConnectLnStudioPrintModal
          mode="invoice"
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          title={`${activeInvoice.invoiceNumber} — ${activeInvoice.title}`}
          invoice={printableInvoice}
          onDownloadOpenXml={() => handleExport("xlsx")}
        />
      )}
    </div>
  )
}
