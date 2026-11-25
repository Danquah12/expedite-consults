"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  FilePlus2,
  FileSignature,
  FileText,
  History,
  LayoutTemplate,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  PenTool,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Star,
  Trash2,
  Type,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react"
import type { UserProfile } from "@/lib/connectln-data"
import {
  computeSignEnvelopeHash,
  createEnvelopeFromStudioDoc,
  generateEnvelopeCode,
  loadSignEnvelopes,
  saveSignEnvelopes,
  SIGN_TEMPLATES,
  type SignEnvelopeRecord,
  type SignEnvelopeStatus,
  type SignTemplateItem,
  verifySignEnvelopeIntegrity,
} from "@/lib/connectln-sign-storage"
import {
  buildDocxBytes,
  buildPrintableSignedContractHtml,
  downloadStudioFile,
  extractTextHtmlFromDocxBytes,
  sanitizeSafeHtml,
} from "@/lib/connectln-studio-export"
import { loadStudioDocs, type StudioDocRecord } from "@/lib/connectln-studio-storage"
import type { StudioSharePayload } from "./ConnectLnDocsEditor"
import { ConnectLnStudioPrintModal } from "./ConnectLnStudioPrintModal"

interface ConnectLnSignAppProps {
  user: UserProfile
  pendingImportDoc?: StudioDocRecord | null
  onClearPendingImport?: () => void
  onShareToFeed?: (payload: StudioSharePayload) => void
}

type SignWorkspaceTab = "document" | "signers" | "audit"
type SignCaptureMode = "draw" | "type" | "upload"

const SIGNATURE_FONTS = [
  { label: "Executive Script", css: '"Brush Script MT", "Segoe Script", cursive' },
  { label: "Classic Cursive", css: 'Georgia, "Times New Roman", serif' },
  { label: "Architectural Italic", css: '"Palatino Linotype", Palatino, serif' },
  { label: "Formal Serif", css: 'Cambria, Georgia, serif' },
]

function safeSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "connectln-agreement"
  )
}

export function ConnectLnSignApp({
  user,
  pendingImportDoc,
  onClearPendingImport,
  onShareToFeed,
}: ConnectLnSignAppProps) {
  const [envelopes, setEnvelopes] = useState<SignEnvelopeRecord[]>(() =>
    loadSignEnvelopes(user)
  )
  const [activeEnvId, setActiveEnvId] = useState<string>(() => envelopes[0]?.id || "")
  const [workspaceTab, setWorkspaceTab] = useState<SignWorkspaceTab>("document")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [statusFilter, setStatusFilter] = useState<"all" | SignEnvelopeStatus>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditingAgreement, setIsEditingAgreement] = useState(false)

  // Modals & menus
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [showFromDocsModal, setShowFromDocsModal] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)

  // Signature capture modal
  const [signingForSignerId, setSigningForSignerId] = useState<string | null>(null)
  const [captureMode, setCaptureMode] = useState<SignCaptureMode>("type")
  const [typedSig, setTypedSig] = useState<string>(() => user.name || "Authorized Signer")
  const [selectedSigFontIdx, setSelectedSigFontIdx] = useState(0)
  const [penColor, setPenColor] = useState<"#0B1F3A" | "#1D4ED8" | "#111827">("#0B1F3A")
  const [uploadedSigDataUrl, setUploadedSigDataUrl] = useState<string>("")
  const [hasDrawnInk, setHasDrawnInk] = useState(false)
  const [legalConsent, setLegalConsent] = useState(false)

  // Add signer draft
  const [newSignerName, setNewSignerName] = useState("")
  const [newSignerEmail, setNewSignerEmail] = useState("")
  const [newSignerRole, setNewSignerRole] = useState("Counterparty Signer")

  // Integrity check readout
  const [integrityResult, setIntegrityResult] = useState<{
    checkedAt: string
    verified: boolean
    computedHash: string
  } | null>(null)

  const [statusNotice, setStatusNotice] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const uploadAgreementInputRef = useRef<HTMLInputElement>(null)
  const uploadSigInputRef = useRef<HTMLInputElement>(null)

  const activeEnv = useMemo(
    () => envelopes.find((e) => e.id === activeEnvId) || envelopes[0],
    [envelopes, activeEnvId]
  )

  useEffect(() => {
    saveSignEnvelopes(user, envelopes)
  }, [envelopes, user])

  // Handle "Send to Sign" directly from ConnectLn Docs
  useEffect(() => {
    if (!pendingImportDoc) return
    const created = createEnvelopeFromStudioDoc(pendingImportDoc, user)
    setEnvelopes((prev) => [created, ...prev])
    setActiveEnvId(created.id)
    setWorkspaceTab("document")
    onClearPendingImport?.()
    notify(`Imported "${pendingImportDoc.title}" from ConnectLn Docs`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingImportDoc?.id])

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

  const notify = (msg: string) => {
    setStatusNotice(msg)
    setTimeout(() => {
      setStatusNotice((prev) => (prev === msg ? null : prev))
    }, 3400)
  }

  const updateActiveEnv = (
    updater: (env: SignEnvelopeRecord) => SignEnvelopeRecord
  ) => {
    if (!activeEnv) return
    const now = new Date().toISOString()
    setEnvelopes((prev) =>
      prev.map((env) => (env.id === activeEnv.id ? { ...updater(env), updatedAt: now } : env))
    )
    setIntegrityResult(null)
  }

  const openSignModalFor = (signerId?: string) => {
    if (!activeEnv) return
    if (activeEnv.status === "completed") {
      notify("This agreement is already executed and cryptographically sealed")
      return
    }
    const target =
      (signerId && activeEnv.signers.find((s) => s.id === signerId)) ||
      activeEnv.signers.find((s) => s.status === "pending") ||
      activeEnv.signers[0]
    if (!target) {
      notify("Add at least one signer in Signers & Routing first")
      return
    }
    setSigningForSignerId(target.id)
    setTypedSig(target.name || user.name || "Authorized Signer")
    setUploadedSigDataUrl("")
    setHasDrawnInk(false)
    setLegalConsent(false)
    setCaptureMode("type")
  }

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    ctx.strokeStyle = penColor
    ctx.lineWidth = 2.6
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.beginPath()
    ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY)
    isDrawingRef.current = true
    setHasDrawnInk(true)
  }

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY)
    ctx.stroke()
  }

  const handleClearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    ctx?.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawnInk(false)
  }

  const handleAdoptAndSign = async () => {
    if (!activeEnv || !signingForSignerId) return
    if (!legalConsent) {
      notify("Check the electronic signature consent box to continue")
      return
    }

    let sigDataUrl: string | undefined
    let typedVal: string | undefined
    let fontName: string | undefined

    if (captureMode === "draw") {
      if (!hasDrawnInk || !canvasRef.current) {
        notify("Draw your signature on the pad first")
        return
      }
      sigDataUrl = canvasRef.current.toDataURL("image/png")
    } else if (captureMode === "upload") {
      if (!uploadedSigDataUrl) {
        notify("Upload a PNG or JPG signature stamp image first")
        return
      }
      sigDataUrl = uploadedSigDataUrl
    } else {
      if (!typedSig.trim()) {
        notify("Enter your full signature name")
        return
      }
      typedVal = typedSig.trim()
      fontName = SIGNATURE_FONTS[selectedSigFontIdx]?.label || "Executive Script"
    }

    const nowIso = new Date().toISOString()
    const targetSigner = activeEnv.signers.find((s) => s.id === signingForSignerId)
    const nextSigners = activeEnv.signers.map((s) =>
      s.id === signingForSignerId
        ? {
            ...s,
            status: "signed" as const,
            signedAt: nowIso,
            signatureDataUrl: sigDataUrl,
            typedSignature: typedVal,
            signatureFont: fontName,
          }
        : s
    )

    const allSigned = nextSigners.every((s) => s.status === "signed")
    const nextAudit = [
      ...activeEnv.auditTrail,
      {
        id: `aud_${Date.now()}_sig`,
        timestamp: nowIso,
        actor: targetSigner?.name || "Signatory",
        action: "Signer Adopted Signature",
        detail: `${targetSigner?.name || "Signer"} (${targetSigner?.email || ""}) signed via ${captureMode} mode as ${targetSigner?.role || "Signer"}.`,
      },
      ...(allSigned
        ? [
            {
              id: `aud_${Date.now()}_seal`,
              timestamp: nowIso,
              actor: "ConnectLn Sign Engine",
              action: "Sealed & Completed",
              detail: "All signatories executed. Cryptographic SHA-256 seal applied.",
            },
          ]
        : []),
    ]

    const nextChecks = allSigned
      ? activeEnv.requiredChecks.map((c) => ({ ...c, checked: true }))
      : activeEnv.requiredChecks

    const updatedBase: SignEnvelopeRecord = {
      ...activeEnv,
      status: allSigned ? "completed" : "sent",
      signers: nextSigners,
      requiredChecks: nextChecks,
      auditTrail: nextAudit,
      completedAt: allSigned ? nowIso : undefined,
      updatedAt: nowIso,
    }

    const hash = allSigned ? await computeSignEnvelopeHash(updatedBase) : undefined
    const finalRecord: SignEnvelopeRecord = {
      ...updatedBase,
      documentSha256: hash,
    }

    setEnvelopes((prev) =>
      prev.map((env) => (env.id === activeEnv.id ? finalRecord : env))
    )
    setSigningForSignerId(null)
    setIsEditingAgreement(false)
    notify(
      allSigned
        ? "All signatures complete — agreement sealed with SHA-256 certificate!"
        : `Signature recorded for ${targetSigner?.name || "signer"}`
    )
  }

  const handleSendForSignature = () => {
    if (!activeEnv) return
    if (activeEnv.status === "completed") {
      notify("Agreement already executed")
      return
    }
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/connectin?tab=sign&envelope=${encodeURIComponent(
            activeEnv.envelopeCode
          )}`
        : ""
    if (shareUrl && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {})
    }
    const nowIso = new Date().toISOString()
    updateActiveEnv((env) => ({
      ...env,
      status: "sent",
      auditTrail: [
        ...env.auditTrail,
        {
          id: `aud_${Date.now()}`,
          timestamp: nowIso,
          actor: user.name || "Sender",
          action: "Envelope Sent",
          detail: `Dispatched ${env.envelopeCode} to ${env.signers.length} signer(s).`,
        },
      ],
    }))
    setIsEditingAgreement(false)
    notify("Envelope marked Sent & signing link copied to clipboard")
  }

  const handleCreateFromTemplate = (tpl: SignTemplateItem) => {
    const now = new Date().toISOString()
    const code = generateEnvelopeCode()
    const actorName = user.name || "ConnectLn Member"
    const actorEmail = user.email || "member@conectln.com"
    const env: SignEnvelopeRecord = {
      id: `env_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      envelopeCode: code,
      title: tpl.name,
      category: tpl.category,
      status: "draft",
      documentHtml: tpl.documentHtml,
      signers: tpl.defaultRoles.map((role, idx) => ({
        id: `s_${Date.now()}_${idx}`,
        name: idx === 0 ? actorName : `${role}`,
        email: idx === 0 ? actorEmail : `signer${idx + 1}@example.com`,
        role,
        order: idx + 1,
        status: "pending",
      })),
      requiredChecks: tpl.requiredChecks.map((label, idx) => ({
        id: `chk_${Date.now()}_${idx}`,
        label,
        checked: false,
      })),
      auditTrail: [
        {
          id: `aud_${Date.now()}`,
          timestamp: now,
          actor: actorName,
          action: "Created from Template",
          detail: `Initialized ${code} using "${tpl.name}".`,
        },
      ],
      createdAt: now,
      updatedAt: now,
      authorName: actorName,
    }
    setEnvelopes((prev) => [env, ...prev])
    setActiveEnvId(env.id)
    setShowTemplatesModal(false)
    setWorkspaceTab("document")
    notify(`Created "${env.title}"`)
  }

  const handleImportStudioDoc = (doc: StudioDocRecord) => {
    const created = createEnvelopeFromStudioDoc(doc, user)
    setEnvelopes((prev) => [created, ...prev])
    setActiveEnvId(created.id)
    setShowFromDocsModal(false)
    setWorkspaceTab("document")
    notify(`Imported "${doc.title}" into ConnectLn Sign`)
  }

  const handleUploadAgreementFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const ext = file.name.split(".").pop()?.toLowerCase() || ""
    try {
      let bodyHtml = ""
      if (ext === "docx") {
        bodyHtml = await extractTextHtmlFromDocxBytes(new Uint8Array(await file.arrayBuffer()))
      } else {
        const text = await file.text()
        bodyHtml =
          ext === "html" || ext === "htm"
            ? sanitizeSafeHtml(text)
            : text
                .split(/\r?\n\r?\n/)
                .map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>`)
                .join("\n")
      }
      const created = createEnvelopeFromStudioDoc(
        {
          id: `upload_${Date.now()}`,
          title: file.name.replace(/\.[^.]+$/, "") || "Uploaded Agreement",
          contentHtml: bodyHtml,
          category: "Uploaded Contract",
        },
        user
      )
      setEnvelopes((prev) => [created, ...prev])
      setActiveEnvId(created.id)
      setWorkspaceTab("document")
      notify(`Loaded "${file.name}" for signature`)
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not load agreement file")
    }
  }

  const handleVerifyIntegrity = async () => {
    if (!activeEnv) return
    const res = await verifySignEnvelopeIntegrity(activeEnv)
    setIntegrityResult({
      checkedAt: new Date().toLocaleTimeString(),
      verified: res.verified,
      computedHash: res.computedHash,
    })
    notify(
      res.verified
        ? "SHA-256 Seal Verified — 0 modifications detected"
        : "Not sealed yet or content modified after sealing"
    )
  }

  const handleExport = (kind: "html" | "docx" | "json" | "print") => {
    if (!activeEnv) return
    setShowExportMenu(false)
    const slug = safeSlug(activeEnv.title)
    if (kind === "html") {
      const html = buildPrintableSignedContractHtml(activeEnv, {
        includeAuditCertificate: true,
      })
      downloadStudioFile(html, `${slug}-signed.html`, "text/html;charset=utf-8")
      notify(`Exported ${slug}-signed.html`)
      return
    }
    if (kind === "docx") {
      downloadStudioFile(
        buildDocxBytes(activeEnv.title, activeEnv.documentHtml),
        `${slug}.docx`,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
      notify(`Exported ${slug}.docx`)
      return
    }
    if (kind === "json") {
      downloadStudioFile(
        JSON.stringify(
          {
            envelopeCode: activeEnv.envelopeCode,
            title: activeEnv.title,
            status: activeEnv.status,
            documentSha256: activeEnv.documentSha256 || null,
            completedAt: activeEnv.completedAt || null,
            signers: activeEnv.signers.map((s) => ({
              name: s.name,
              email: s.email,
              role: s.role,
              status: s.status,
              signedAt: s.signedAt || null,
            })),
            auditTrail: activeEnv.auditTrail,
          },
          null,
          2
        ),
        `${slug}-audit-certificate.json`,
        "application/json;charset=utf-8"
      )
      notify(`Exported ${slug}-audit-certificate.json`)
      return
    }
    setShowPrintModal(true)
  }

  const handleShareMilestone = () => {
    if (!activeEnv || !onShareToFeed) return
    const signedCount = activeEnv.signers.filter((s) => s.status === "signed").length
    onShareToFeed({
      title: activeEnv.title,
      summary: `ConnectLn Sign envelope ${activeEnv.envelopeCode} (${activeEnv.status.toUpperCase()} — ${signedCount}/${activeEnv.signers.length} signatures verified).`,
      appLabel: "ConnectLn Sign",
      slides: [
        {
          slideNumber: 1,
          title: `${activeEnv.title} · ${activeEnv.envelopeCode}`,
          content: `Status: ${activeEnv.status.toUpperCase()}\nSignatories Executed: ${signedCount} of ${activeEnv.signers.length}`,
          visualTag: "ConnectLn Sign",
        },
      ],
    })
    notify("Shared execution milestone to ConnectLn Feed")
  }

  const availableStudioDocs = useMemo(() => loadStudioDocs(user), [user, showFromDocsModal])

  const filteredEnvelopes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const list = envelopes.filter((env) => {
      if (statusFilter !== "all" && env.status !== statusFilter) return false
      if (!q) return true
      return (
        env.title.toLowerCase().includes(q) ||
        env.envelopeCode.toLowerCase().includes(q) ||
        env.category.toLowerCase().includes(q)
      )
    })
    return [...list].sort((a, b) => Number(Boolean(b.starred)) - Number(Boolean(a.starred)))
  }, [envelopes, statusFilter, searchQuery])

  const statusBadge = (st: SignEnvelopeStatus) => {
    if (st === "completed")
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
    if (st === "sent")
      return "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300"
    return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300"
  }

  return (
    <div className="flex flex-col lg:flex-row rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm min-h-[780px]">
      {/* Left Envelope Library */}
      {sidebarOpen && (
        <aside className="w-full lg:w-[285px] shrink-0 border-b lg:border-b-0 lg:border-r border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/80 dark:bg-zinc-950/60 flex flex-col">
          <div className="p-3 border-b border-[#E7E2DA] dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#4338CA] dark:text-indigo-400 flex items-center gap-1.5">
                <FileSignature className="h-3.5 w-3.5" />
                Envelopes ({envelopes.length})
              </span>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-[#4338CA] hover:bg-[#3730A3] text-white px-2.5 py-1 text-[11px] font-bold cursor-pointer"
              >
                <FilePlus2 className="h-3.5 w-3.5" />
                New
              </button>
            </div>

            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contracts & IDs..."
                className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-8 pr-3 py-1.5 text-xs outline-none focus:border-[#4338CA]"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setShowFromDocsModal(true)}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-[11px] font-semibold hover:border-[#4338CA] cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5 text-[#0B5CAD]" />
                From Docs
              </button>
              <button
                type="button"
                onClick={() => uploadAgreementInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-[11px] font-semibold hover:border-[#4338CA] cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5 text-[#4338CA]" />
                Upload File
              </button>
              <input
                ref={uploadAgreementInputRef}
                type="file"
                accept=".docx,.html,.htm,.md,.txt"
                onChange={handleUploadAgreementFile}
                className="hidden"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {(["all", "draft", "sent", "completed"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  className={`rounded-lg px-2 py-1 text-[10.5px] font-bold capitalize cursor-pointer ${
                    statusFilter === f
                      ? "bg-[#4338CA] text-white"
                      : "bg-white dark:bg-zinc-900 text-zinc-600 border border-[#E7E2DA]"
                  }`}
                >
                  {f === "completed" ? "Signed" : f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[250px] lg:max-h-none">
            {filteredEnvelopes.map((env) => {
              const isSelected = env.id === activeEnv?.id
              const signedCount = env.signers.filter((s) => s.status === "signed").length
              return (
                <div
                  key={env.id}
                  onClick={() => {
                    setActiveEnvId(env.id)
                    setIsEditingAgreement(false)
                    setIntegrityResult(null)
                  }}
                  className={`group rounded-xl border p-2.5 transition-all cursor-pointer space-y-1 ${
                    isSelected
                      ? "border-[#4338CA] bg-white dark:bg-zinc-900 shadow-xs"
                      : "border-transparent hover:border-[#E7E2DA] hover:bg-white/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <p className="text-xs font-bold text-[#0B1F3A] dark:text-zinc-100 line-clamp-1 flex-1">
                      {env.title}
                    </p>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEnvelopes((prev) =>
                            prev.map((x) => (x.id === env.id ? { ...x, starred: !x.starred } : x))
                          )
                        }}
                        className="p-0.5 cursor-pointer"
                      >
                        <Star className={`h-3.5 w-3.5 ${env.starred ? "fill-amber-400 text-amber-500" : "text-zinc-400"}`} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (envelopes.length <= 1) {
                            notify("Keep at least one envelope")
                            return
                          }
                          const rem = envelopes.filter((x) => x.id !== env.id)
                          setEnvelopes(rem)
                          if (activeEnvId === env.id && rem[0]) setActiveEnvId(rem[0].id)
                        }}
                        className="p-0.5 text-zinc-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[10px]">
                    <span className={`rounded-full border px-2 py-0.5 font-extrabold uppercase ${statusBadge(env.status)}`}>
                      {env.status === "completed" ? "Sealed & Signed" : env.status}
                    </span>
                    <span className="font-mono text-zinc-500">
                      {signedCount}/{env.signers.length} signed
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>
      )}

      {/* Main Sign Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-[#E7E2DA] dark:border-zinc-800">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen((s) => !s)}
              className="rounded-lg p-1.5 border border-[#E7E2DA] dark:border-zinc-700 hover:bg-[#FAF7F2] cursor-pointer shrink-0"
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
            <input
              type="text"
              aria-label="Agreement title"
              disabled={activeEnv?.status === "completed"}
              value={activeEnv?.title || ""}
              onChange={(e) => updateActiveEnv((env) => ({ ...env, title: e.target.value }))}
              className="min-w-[150px] flex-1 max-w-md rounded-lg border border-transparent hover:border-[#E7E2DA] focus:border-[#4338CA] bg-transparent px-2 py-1 text-sm sm:text-base font-extrabold text-[#0B1F3A] dark:text-white outline-none disabled:opacity-90"
            />
            {activeEnv && (
              <span className="hidden md:inline-flex items-center rounded-lg bg-[#FAF7F2] dark:bg-zinc-800 border border-[#E7E2DA] dark:border-zinc-700 px-2 py-0.5 text-[10.5px] font-mono font-bold text-zinc-600 dark:text-zinc-300">
                {activeEnv.envelopeCode}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {statusNotice && (
              <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-[#4338CA] dark:text-indigo-300">
                {statusNotice}
              </span>
            )}

            {activeEnv?.status !== "completed" && (
              <button
                type="button"
                onClick={() => openSignModalFor()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] text-white px-3.5 py-1.5 text-xs font-extrabold shadow-xs cursor-pointer"
              >
                <PenTool className="h-3.5 w-3.5" />
                Sign Now
              </button>
            )}

            {activeEnv?.status !== "completed" && (
              <button
                type="button"
                onClick={handleSendForSignature}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[#4338CA] px-3 py-1.5 text-xs font-bold cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 text-[#4338CA]" />
                Send Link
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              title="Print Signed Agreement & Audit Certificate (Ctrl+P)"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#4338CA] bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 px-3 py-1.5 text-xs font-extrabold text-[#4338CA] dark:text-indigo-300 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 px-3 py-1.5 text-xs font-bold hover:border-[#4338CA] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#4338CA]" />
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-10 z-30 w-60 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1.5 shadow-xl space-y-1">
                  <button type="button" onClick={() => handleExport("html")} className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer">
                    <span>Signed Package (.html)</span>
                    <span className="text-[10px] font-mono text-[#4338CA]">Complete</span>
                  </button>
                  <button type="button" onClick={() => handleExport("docx")} className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer">
                    <span>Agreement Text (.docx)</span>
                    <span className="text-[10px] font-mono text-zinc-400">OpenXML</span>
                  </button>
                  <button type="button" onClick={() => handleExport("json")} className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer">
                    <span>Audit Certificate (.json)</span>
                    <span className="text-[10px] font-mono text-zinc-400">SHA-256</span>
                  </button>
                  <button type="button" onClick={() => handleExport("print")} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer">
                    <Printer className="h-3.5 w-3.5 text-[#4338CA]" />
                    <span>Print / Save Signed PDF</span>
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
        <div className="flex items-center justify-between gap-2 px-3 pt-1.5 border-b border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {(
              [
                { id: "document", label: "Document & Sign", Icon: FileSignature },
                { id: "signers", label: `Signers & Routing (${activeEnv?.signers.length || 0})`, Icon: Users },
                { id: "audit", label: "Audit Certificate", Icon: ShieldCheck },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setWorkspaceTab(id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-t-lg border-b-2 transition-colors cursor-pointer ${
                  workspaceTab === id
                    ? "border-[#4338CA] bg-white dark:bg-zinc-900 text-[#4338CA] dark:text-indigo-400"
                    : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-[#0B1F3A]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {workspaceTab === "document" && activeEnv?.status === "draft" && (
            <button
              type="button"
              onClick={() => setIsEditingAgreement((e) => !e)}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer mb-1 ${
                isEditingAgreement
                  ? "bg-[#4338CA] text-white"
                  : "bg-white dark:bg-zinc-900 border border-[#E7E2DA] text-[#0B1F3A]"
              }`}
            >
              <Edit3 className="h-3 w-3" />
              {isEditingAgreement ? "Done Editing Clauses" : "Edit Agreement Clauses"}
            </button>
          )}
        </div>

        {/* Workspace Tab Content */}
        <div className="flex-1 overflow-y-auto bg-[#EFECE6] dark:bg-zinc-950 p-4 sm:p-7">
          {workspaceTab === "document" && activeEnv && (
            <div className="mx-auto max-w-[840px] space-y-5">
              {activeEnv.status === "completed" && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center gap-2.5">
                    <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-extrabold">
                        Executed &amp; Sealed Agreement · All Signatories Verified
                      </p>
                      <p className="font-mono text-[10.5px] opacity-85 truncate max-w-lg">
                        SHA-256: {activeEnv.documentSha256}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWorkspaceTab("audit")}
                    className="rounded-lg bg-emerald-700 text-white px-3 py-1.5 font-bold cursor-pointer"
                  >
                    View Audit Certificate
                  </button>
                </div>
              )}

              {/* Agreement Paper Sheet */}
              <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 sm:px-12 py-8 sm:py-10 shadow-md space-y-6">
                {isEditingAgreement && activeEnv.status === "draft" ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#4338CA]">
                      Agreement Body (HTML / Plain Paragraphs)
                    </label>
                    <textarea
                      rows={12}
                      value={activeEnv.documentHtml}
                      onChange={(e) =>
                        updateActiveEnv((env) => ({ ...env, documentHtml: e.target.value }))
                      }
                      className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-[#FAF7F2]/50 dark:bg-zinc-950 p-3 font-mono text-xs outline-none focus:border-[#4338CA]"
                    />
                  </div>
                ) : (
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none text-[#0B1F3A] dark:text-zinc-100 [&_h1]:text-2xl [&_h1]:font-extrabold [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#0B5CAD] [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-zinc-300 [&_th]:bg-zinc-100 [&_th]:px-3 [&_th]:py-1.5 [&_td]:border [&_td]:border-zinc-300 [&_td]:px-3 [&_td]:py-1.5 [&_ul]:list-disc [&_ul]:pl-6"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeSafeHtml(activeEnv.documentHtml),
                    }}
                  />
                )}

                {/* Compliance Checkmarks */}
                {activeEnv.requiredChecks.length > 0 && (
                  <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-[#FAF7F2] dark:bg-zinc-950/60 p-4 space-y-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500">
                      Signer Compliance Acknowledgements
                    </p>
                    {activeEnv.requiredChecks.map((chk) => (
                      <label
                        key={chk.id}
                        className="flex items-start gap-2.5 text-xs text-[#0B1F3A] dark:text-zinc-200 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          disabled={activeEnv.status === "completed"}
                          checked={chk.checked}
                          onChange={(e) =>
                            updateActiveEnv((env) => ({
                              ...env,
                              requiredChecks: env.requiredChecks.map((c) =>
                                c.id === chk.id ? { ...c, checked: e.target.checked } : c
                              ),
                            }))
                          }
                          className="mt-0.5"
                        />
                        <span>{chk.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Live Signature Blocks */}
                <div className="pt-4 border-t border-[#E7E2DA] dark:border-zinc-800 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                    Electronic Signature Blocks
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeEnv.signers.map((signer) => {
                      const isSigned = signer.status === "signed"
                      return (
                        <div
                          key={signer.id}
                          className={`rounded-xl border p-4 space-y-2.5 ${
                            isSigned
                              ? "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20"
                              : "border-dashed border-indigo-300 bg-indigo-50/40 dark:bg-indigo-950/20"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10.5px] font-extrabold uppercase">
                            <span className="text-zinc-500">
                              {signer.order}. {signer.role}
                            </span>
                            <span
                              className={
                                isSigned ? "text-emerald-700" : "text-[#4338CA]"
                              }
                            >
                              {isSigned ? "Verified Signature" : "Awaiting Signature"}
                            </span>
                          </div>

                          <div className="min-h-[60px] flex items-center justify-center rounded-lg bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 px-3 py-2">
                            {isSigned ? (
                              signer.signatureDataUrl ? (
                                <img
                                  src={signer.signatureDataUrl}
                                  alt={`${signer.name} signature`}
                                  className="max-h-[52px] object-contain"
                                />
                              ) : (
                                <span
                                  style={{
                                    fontFamily:
                                      SIGNATURE_FONTS.find(
                                        (f) => f.label === signer.signatureFont
                                      )?.css || SIGNATURE_FONTS[0].css,
                                  }}
                                  className="text-2xl italic font-bold text-[#0B1F3A] dark:text-white"
                                >
                                  {signer.typedSignature || signer.name}
                                </span>
                              )
                            ) : (
                              <button
                                type="button"
                                onClick={() => openSignModalFor(signer.id)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#4338CA] hover:bg-[#3730A3] text-white px-3.5 py-1.5 text-xs font-bold cursor-pointer"
                              >
                                <PenTool className="h-3.5 w-3.5" />
                                Click to Sign as {signer.name}
                              </button>
                            )}
                          </div>

                          <div className="text-xs">
                            <p className="font-bold text-[#0B1F3A] dark:text-white">
                              {signer.name}
                            </p>
                            <p className="text-[11px] text-zinc-500">{signer.email}</p>
                            {isSigned && signer.signedAt && (
                              <p className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                                Signed UTC: {new Date(signer.signedAt).toISOString()}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {workspaceTab === "signers" && activeEnv && (
            <div className="mx-auto max-w-3xl space-y-4">
              <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
                <h2 className="text-sm font-extrabold text-[#0B1F3A] dark:text-white flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-[#4338CA]" />
                  Add Counterparty or Internal Signer
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <input
                    type="text"
                    disabled={activeEnv.status === "completed"}
                    value={newSignerName}
                    onChange={(e) => setNewSignerName(e.target.value)}
                    placeholder="Full Name"
                    className="rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-transparent px-3 py-2"
                  />
                  <input
                    type="email"
                    disabled={activeEnv.status === "completed"}
                    value={newSignerEmail}
                    onChange={(e) => setNewSignerEmail(e.target.value)}
                    placeholder="Email address"
                    className="rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-transparent px-3 py-2"
                  />
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      disabled={activeEnv.status === "completed"}
                      value={newSignerRole}
                      onChange={(e) => setNewSignerRole(e.target.value)}
                      placeholder="Role"
                      className="flex-1 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-transparent px-3 py-2"
                    />
                    <button
                      type="button"
                      disabled={activeEnv.status === "completed" || !newSignerName.trim()}
                      onClick={() => {
                        updateActiveEnv((env) => ({
                          ...env,
                          signers: [
                            ...env.signers,
                            {
                              id: `s_${Date.now()}`,
                              name: newSignerName.trim(),
                              email: newSignerEmail.trim() || "signer@example.com",
                              role: newSignerRole.trim() || "Signer",
                              order: env.signers.length + 1,
                              status: "pending",
                            },
                          ],
                          auditTrail: [
                            ...env.auditTrail,
                            {
                              id: `aud_${Date.now()}`,
                              timestamp: new Date().toISOString(),
                              actor: user.name || "Owner",
                              action: "Signer Added",
                              detail: `Added ${newSignerName.trim()} (${newSignerRole.trim() || "Signer"}).`,
                            },
                          ],
                        }))
                        setNewSignerName("")
                        setNewSignerEmail("")
                        notify("Added signer to routing list")
                      }}
                      className="rounded-xl bg-[#4338CA] text-white px-3 font-bold disabled:opacity-40 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                  Signing Order &amp; In-Person Execution
                </h3>
                {activeEnv.signers.map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E7E2DA] dark:border-zinc-800 p-3 text-xs"
                  >
                    <div>
                      <p className="font-extrabold text-[#0B1F3A] dark:text-white">
                        {idx + 1}. {s.name}{" "}
                        <span className="font-semibold text-[#4338CA]">({s.role})</span>
                      </p>
                      <p className="text-[11px] text-zinc-500">{s.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {s.status === "signed" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Signed
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => openSignModalFor(s.id)}
                            className="rounded-lg bg-[#4338CA] text-white px-2.5 py-1 font-bold cursor-pointer"
                          >
                            Sign In-Person
                          </button>
                          {activeEnv.status === "draft" && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  if (idx === 0) return
                                  updateActiveEnv((env) => {
                                    const arr = [...env.signers]
                                    ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
                                    return {
                                      ...env,
                                      signers: arr.map((x, i) => ({ ...x, order: i + 1 })),
                                    }
                                  })
                                }}
                                className="p-1 rounded border cursor-pointer"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (idx >= activeEnv.signers.length - 1) return
                                  updateActiveEnv((env) => {
                                    const arr = [...env.signers]
                                    ;[arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]]
                                    return {
                                      ...env,
                                      signers: arr.map((x, i) => ({ ...x, order: i + 1 })),
                                    }
                                  })
                                }}
                                className="p-1 rounded border cursor-pointer"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              {activeEnv.signers.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateActiveEnv((env) => ({
                                      ...env,
                                      signers: env.signers
                                        .filter((x) => x.id !== s.id)
                                        .map((x, i) => ({ ...x, order: i + 1 })),
                                    }))
                                  }
                                  className="p-1 rounded text-rose-600 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {workspaceTab === "audit" && activeEnv && (
            <div className="mx-auto max-w-4xl space-y-4">
              <div className="rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7E2DA] dark:border-zinc-800 pb-3">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#4338CA]">
                      Certificate of Completion &amp; Cryptographic Verification
                    </p>
                    <h2 className="text-base font-extrabold text-[#0B1F3A] dark:text-white">
                      {activeEnv.title} ({activeEnv.envelopeCode})
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyIntegrity}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] text-white px-3.5 py-2 text-xs font-bold cursor-pointer"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Verify Integrity Now
                  </button>
                </div>

                <div className="rounded-xl bg-[#FAF7F2] dark:bg-zinc-950 border border-[#E7E2DA] dark:border-zinc-800 p-3 space-y-1 text-xs">
                  <span className="font-bold text-zinc-500">Document SHA-256 Digest:</span>
                  <p className="font-mono text-[11px] break-all text-[#0B1F3A] dark:text-zinc-200">
                    {activeEnv.documentSha256 || "Seal pending — applied automatically once all signers sign."}
                  </p>
                  {integrityResult && (
                    <div
                      className={`mt-2 rounded-lg px-3 py-2 font-bold flex items-center gap-2 ${
                        integrityResult.verified
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        {integrityResult.verified
                          ? `Verified (${integrityResult.checkedAt}): Canonical contract + signature hash matches sealed SHA-256.`
                          : `Envelope has not been sealed yet or was modified (${integrityResult.checkedAt}).`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5" />
                    Chronological Audit Log ({activeEnv.auditTrail.length} events)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#FAF7F2] dark:bg-zinc-950">
                          <th className="border border-[#E7E2DA] dark:border-zinc-800 px-3 py-2 text-left">Timestamp (UTC)</th>
                          <th className="border border-[#E7E2DA] dark:border-zinc-800 px-3 py-2 text-left">Actor</th>
                          <th className="border border-[#E7E2DA] dark:border-zinc-800 px-3 py-2 text-left">Event</th>
                          <th className="border border-[#E7E2DA] dark:border-zinc-800 px-3 py-2 text-left">Detail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeEnv.auditTrail.map((ev) => (
                          <tr key={ev.id}>
                            <td className="border border-[#E7E2DA] dark:border-zinc-800 px-3 py-2 font-mono text-[10.5px] whitespace-nowrap">
                              {new Date(ev.timestamp).toISOString()}
                            </td>
                            <td className="border border-[#E7E2DA] dark:border-zinc-800 px-3 py-2 font-bold">
                              {ev.actor}
                            </td>
                            <td className="border border-[#E7E2DA] dark:border-zinc-800 px-3 py-2">
                              {ev.action}
                            </td>
                            <td className="border border-[#E7E2DA] dark:border-zinc-800 px-3 py-2 text-zinc-600 dark:text-zinc-300">
                              {ev.detail}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Signature Capture Modal */}
      {signingForSignerId && activeEnv && (
        <div
          role="dialog"
          aria-label="ConnectLn Sign Adopt Signature"
          className="fixed inset-0 z-[105] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#0B1F3A] dark:text-white">
                  Adopt Your Electronic Signature
                </h3>
                <p className="text-xs text-zinc-500">
                  Signing: <strong>{activeEnv.title}</strong> (
                  {activeEnv.signers.find((s) => s.id === signingForSignerId)?.name})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSigningForSignerId(null)}
                className="p-1 rounded-lg hover:bg-zinc-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-[#FAF7F2] dark:bg-zinc-950 p-1">
              {(
                [
                  { id: "type", label: "Type", Icon: Type },
                  { id: "draw", label: "Draw", Icon: PenTool },
                  { id: "upload", label: "Upload Stamp", Icon: Upload },
                ] as const
              ).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCaptureMode(id)}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold cursor-pointer ${
                    captureMode === id
                      ? "bg-[#4338CA] text-white"
                      : "text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {captureMode === "type" && (
              <div className="space-y-3">
                <input
                  type="text"
                  aria-label="Typed signature input"
                  value={typedSig}
                  onChange={(e) => setTypedSig(e.target.value)}
                  placeholder="Type your full legal name..."
                  className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-transparent px-3 py-2 text-sm font-bold outline-none focus:border-[#4338CA]"
                />
                <div className="grid grid-cols-2 gap-2">
                  {SIGNATURE_FONTS.map((f, idx) => (
                    <button
                      key={f.label}
                      type="button"
                      onClick={() => setSelectedSigFontIdx(idx)}
                      className={`rounded-xl border p-3 text-center cursor-pointer ${
                        selectedSigFontIdx === idx
                          ? "border-[#4338CA] bg-indigo-50/50 dark:bg-indigo-950/30"
                          : "border-[#E7E2DA]"
                      }`}
                    >
                      <span style={{ fontFamily: f.css }} className="text-xl italic font-bold block truncate">
                        {typedSig || "Signature"}
                      </span>
                      <span className="text-[10px] text-zinc-500">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {captureMode === "draw" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-zinc-500">Ink:</span>
                    {(["#0B1F3A", "#1D4ED8", "#111827"] as const).map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setPenColor(hex)}
                        style={{ backgroundColor: hex }}
                        className={`h-5 w-5 rounded-full border-2 cursor-pointer ${
                          penColor === hex ? "border-indigo-400 scale-110" : "border-white"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleClearCanvas}
                    className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-800 font-bold cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Clear Pad
                  </button>
                </div>
                <canvas
                  ref={canvasRef}
                  width={520}
                  height={160}
                  onPointerDown={handleCanvasPointerDown}
                  onPointerMove={handleCanvasPointerMove}
                  onPointerUp={() => { isDrawingRef.current = false }}
                  onPointerLeave={() => { isDrawingRef.current = false }}
                  className="w-full h-40 rounded-xl border-2 border-dashed border-[#CBD5E1] bg-white touch-none cursor-crosshair"
                />
              </div>
            )}

            {captureMode === "upload" && (
              <div className="rounded-xl border-2 border-dashed border-[#E7E2DA] p-6 text-center space-y-2">
                {uploadedSigDataUrl ? (
                  <img
                    src={uploadedSigDataUrl}
                    alt="Uploaded signature"
                    className="mx-auto max-h-24 object-contain"
                  />
                ) : (
                  <p className="text-xs text-zinc-500">Upload a PNG or JPG image of your signature stamp.</p>
                )}
                <button
                  type="button"
                  onClick={() => uploadSigInputRef.current?.click()}
                  className="rounded-xl bg-[#FAF7F2] border border-[#E7E2DA] px-4 py-1.5 text-xs font-bold cursor-pointer"
                >
                  Choose Image File
                </button>
                <input
                  ref={uploadSigInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    e.target.value = ""
                    if (!f) return
                    const reader = new FileReader()
                    reader.onload = () => {
                      if (typeof reader.result === "string") setUploadedSigDataUrl(reader.result)
                    }
                    reader.readAsDataURL(f)
                  }}
                  className="hidden"
                />
              </div>
            )}

            <label className="flex items-start gap-2 rounded-xl bg-[#FAF7F2] dark:bg-zinc-950 p-3 border border-[#E7E2DA] dark:border-zinc-800 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={legalConsent}
                onChange={(e) => setLegalConsent(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I agree to adopt this electronic signature as my legally binding signature on{" "}
                <strong>{activeEnv.envelopeCode}</strong>.
              </span>
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSigningForSignerId(null)}
                className="rounded-xl border border-[#E7E2DA] px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdoptAndSign}
                className="rounded-xl bg-[#4338CA] hover:bg-[#3730A3] text-white px-5 py-2 text-xs font-extrabold cursor-pointer"
              >
                Adopt &amp; Sign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Picker Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-3">
              <div>
                <h3 className="text-base font-extrabold">Choose a ConnectLn Sign Template</h3>
                <p className="text-xs text-zinc-500">Launch a verified legal, trade, or client agreement ready to sign.</p>
              </div>
              <button type="button" onClick={() => setShowTemplatesModal(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
              {SIGN_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleCreateFromTemplate(tpl)}
                  className="rounded-xl border border-[#E7E2DA] bg-[#FAF7F2]/60 hover:border-[#4338CA] p-4 text-left space-y-1.5 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold">{tpl.name}</span>
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-[#4338CA]">{tpl.category}</span>
                  </div>
                  <p className="text-xs text-zinc-600">{tpl.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Import From ConnectLn Docs Modal */}
      {showFromDocsModal && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-3">
              <div>
                <h3 className="text-base font-extrabold">Import Document from ConnectLn Docs</h3>
                <p className="text-xs text-zinc-500">Turn any proposal, SOW, or report into a signable envelope.</p>
              </div>
              <button type="button" onClick={() => setShowFromDocsModal(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-2 max-h-[55vh] overflow-y-auto">
              {availableStudioDocs.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleImportStudioDoc(d)}
                  className="w-full flex items-center justify-between rounded-xl border border-[#E7E2DA] hover:border-[#4338CA] p-3 text-left cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-extrabold">{d.title}</p>
                    <p className="text-[11px] text-zinc-500">{d.category} · Updated {new Date(d.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <span className="rounded-lg bg-indigo-50 text-[#4338CA] px-2.5 py-1 text-xs font-bold">Send to Sign</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Print Preview & Audit Certificate Print Studio */}
      {activeEnv && (
        <ConnectLnStudioPrintModal
          mode="sign"
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          title={activeEnv.title}
          envelope={activeEnv}
          onDownloadOpenXml={() => handleExport("docx")}
        />
      )}
    </div>
  )
}
