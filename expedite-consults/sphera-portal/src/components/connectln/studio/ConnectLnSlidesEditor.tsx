"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BarChart2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eraser,
  Eye,
  EyeOff,
  FilePlus2,
  Globe2,
  Grid,
  HelpCircle,
  ImagePlus,
  LayoutGrid,
  LayoutTemplate,
  Link2,
  ListTree,
  Maximize2,
  MessageSquare,
  Mic,
  MicOff,
  MonitorPlay,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  PenLine,
  Play,
  Plus,
  Presentation,
  Printer,
  Redo2,
  RotateCcw,
  Search,
  Share2,
  ShieldCheck,
  Sigma,
  Sparkles,
  Square,
  Star,
  StickyNote,
  Table2,
  Timer,
  Trash2,
  Type,
  Undo2,
  Workflow,
  X,
} from "lucide-react"
import type { UserProfile } from "@/lib/connectln-data"
import {
  buildSlideDiagramElements,
  computeDeckStats,
  runDeckAccessibilityAudit,
  SLIDE_FONT_PAIRINGS,
  SLIDE_MOTION_PRESETS,
  SLIDES_COMMAND_CATALOG,
  type SlideDiagramKind,
  type SlideMotionPresetId,
} from "@/lib/connectln-slides-pro-tools"
import {
  buildPptxBytes,
  buildStandaloneHtmlDeck,
  downloadStudioFile,
  type SlideThemePalette,
} from "@/lib/connectln-studio-export"
import {
  DECK_TEMPLATES,
  getSlideThemeById,
  loadStudioDecks,
  saveStudioDecks,
  STUDIO_SLIDE_THEMES,
  type DeckTemplateItem,
  type SlideExtraElement,
  type SlideLayoutType,
  type SlideTransitionType,
  type StudioDeckRecord,
  type StudioSlideItem,
} from "@/lib/connectln-studio-storage"
import type { StudioSharePayload } from "./ConnectLnDocsEditor"
import { ConnectLnSlidesNoctisPanel } from "./ConnectLnSlidesNoctisPanel"
import { ConnectLnStudioHubDrawer } from "./ConnectLnStudioHubDrawer"
import { ConnectLnStudioPrintModal } from "./ConnectLnStudioPrintModal"

interface ConnectLnSlidesEditorProps {
  user: UserProfile
  onShareToFeed?: (payload: StudioSharePayload) => void
}

type SlidesRibbonTab =
  | "home"
  | "insert"
  | "design"
  | "transitions"
  | "motion"
  | "slideshow"
  | "record"
  | "review"
  | "view"

const LAYOUT_OPTIONS: Array<{ id: SlideLayoutType; label: string }> = [
  { id: "cover", label: "Title Cover" },
  { id: "bullets", label: "Title + Bullets" },
  { id: "two_column", label: "Two Columns" },
  { id: "metrics", label: "KPI Metrics" },
  { id: "quote", label: "Quote & Takeaway" },
  { id: "visual_split", label: "Visual Split" },
  { id: "section", label: "Section Header" },
  { id: "table", label: "Editable Table" },
  { id: "chart", label: "Live Chart" },
  { id: "blank", label: "Blank Canvas" },
]

function safeSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "connectln-presentation"
  )
}

function createEmptySlide(layout: SlideLayoutType = "bullets"): StudioSlideItem {
  const baseId = `slide_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
  switch (layout) {
    case "cover":
      return {
        id: baseId,
        layout: "cover",
        title: "Presentation Title",
        subtitle: "Prepared with ConnectLn Slides",
        bullets: ["Verified Team Briefing", "2026"],
      }
    case "section":
      return {
        id: baseId,
        layout: "section",
        title: "Section 01 — Core Strategy",
        subtitle: "Transitioning to operational milestones",
        bullets: ["Section Milestone"],
      }
    case "two_column":
      return {
        id: baseId,
        layout: "two_column",
        title: "Comparison & Workstreams",
        subtitle: "Structured execution tracks",
        leftTitle: "Track A · Operations",
        leftBullets: ["Milestone one", "Milestone two"],
        rightTitle: "Track B · Delivery",
        rightBullets: ["Outcome one", "Outcome two"],
      }
    case "metrics":
      return {
        id: baseId,
        layout: "metrics",
        title: "Key Performance Highlights",
        subtitle: "Quarterly benchmarks",
        metrics: [
          { value: "98%", label: "On-Schedule Delivery", delta: "+3.5%" },
          { value: "$120K", label: "Active Pipeline", delta: "12 Deals" },
          { value: "24h", label: "Response SLA", delta: "Verified" },
        ],
      }
    case "quote":
      return {
        id: baseId,
        layout: "quote",
        title: "Executive Takeaway",
        quote: "Quality craftsmanship and clear communication turn every project into lasting trust.",
        quoteAuthor: "Team Leadership",
      }
    case "visual_split":
      return {
        id: baseId,
        layout: "visual_split",
        title: "Visual Walkthrough",
        subtitle: "Field spotlight & highlights",
        bullets: ["Key visual takeaway #1", "Supporting operational detail #2"],
      }
    case "table":
      return {
        id: baseId,
        layout: "table",
        title: "Schedule & Deliverable Matrix",
        subtitle: "Editable project breakdown table",
        tableData: {
          headers: ["Phase", "Owner", "Timeline", "Status"],
          rows: [
            ["Mobilization", "Field Lead", "Week 1", "On Track"],
            ["Inspection", "QA Officer", "Week 3", "Scheduled"],
            ["Handover", "Client Rep", "Week 6", "Planned"],
          ],
        },
      }
    case "chart":
      return {
        id: baseId,
        layout: "chart",
        title: "Performance Breakdown",
        subtitle: "Visual benchmark comparison",
        chartData: {
          kind: "bar",
          title: "Quarterly Output ($K)",
          items: [
            { label: "Q1", value: 42 },
            { label: "Q2", value: 58 },
            { label: "Q3", value: 74 },
            { label: "Q4", value: 92 },
          ],
        },
      }
    case "blank":
      return {
        id: baseId,
        layout: "blank",
        title: "Custom Canvas Slide",
        subtitle: "Use the Insert tab to add text boxes, badges, charts, or visuals",
        elements: [],
      }
    case "bullets":
    default:
      return {
        id: baseId,
        layout: "bullets",
        title: "New Discussion Slide",
        subtitle: "Summary point or milestone focus",
        bullets: ["First talking point", "Second talking point", "Third talking point"],
      }
  }
}

export function ConnectLnSlidesEditor({ user, onShareToFeed }: ConnectLnSlidesEditorProps) {
  const [decks, setDecks] = useState<StudioDeckRecord[]>(() => loadStudioDecks(user))
  const [activeDeckId, setActiveDeckId] = useState<string>(() => decks[0]?.id || "")
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [ribbonTab, setRibbonTab] = useState<SlidesRibbonTab>("home")
  const [sidebarTab, setSidebarTab] = useState<"slides" | "decks">("slides")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sorterMode, setSorterMode] = useState(false)
  const [deckSearch, setDeckSearch] = useState("")
  const [showNotesDrawer, setShowNotesDrawer] = useState(false)
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false)
  const [commentDraft, setCommentDraft] = useState("")
  const [showFindBar, setShowFindBar] = useState(false)
  const [findTerm, setFindTerm] = useState("")
  const [replaceTerm, setReplaceTerm] = useState("")

  // Present & Presenter View states
  const [isPresenting, setIsPresenting] = useState(false)
  const [presenterViewMode, setPresenterViewMode] = useState(false)
  const [showPresentNotes, setShowPresentNotes] = useState(false)
  const [autoPlaySec, setAutoPlaySec] = useState<0 | 3 | 5 | 10>(0)
  const [revealStep, setRevealStep] = useState(99)
  const [penActive, setPenActive] = useState(false)
  const [inkStrokes, setInkStrokes] = useState<Array<Array<{ x: number; y: number }>>>([])
  const [drawingNow, setDrawingNow] = useState(false)
  const [presentSeconds, setPresentSeconds] = useState(0)

  const [transitionPulseKey, setTransitionPulseKey] = useState(0)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [showHubDrawer, setShowHubDrawer] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [undoDecks, setUndoDecks] = useState<StudioDeckRecord[]>([])
  const [redoDecks, setRedoDecks] = useState<StudioDeckRecord[]>([])
  const [statusNotice, setStatusNotice] = useState<string | null>(null)
  const [savedLabel, setSavedLabel] = useState("Saved locally")

  // Command Deck, Noctis Pitch Studio & Pro View/Record/Motion States
  const [commandQuery, setCommandQuery] = useState("")
  const [commandMenuOpen, setCommandMenuOpen] = useState(false)
  const [showNoctisPanel, setShowNoctisPanel] = useState(false)
  const [noctisInitialPrompt, setNoctisInitialPrompt] = useState("")
  const [noctisInitialMode, setNoctisInitialMode] = useState<
    "generate" | "notes" | "tighten" | "translate" | undefined
  >(undefined)
  const [showDiagramMenu, setShowDiagramMenu] = useState(false)
  const [showFooterEditor, setShowFooterEditor] = useState(false)
  const [fontPairingId, setFontPairingId] = useState("editorial-sans")
  const [showAccentBar, setShowAccentBar] = useState(true)
  const [motionPreset, setMotionPreset] = useState<SlideMotionPresetId>("rise_up")
  const [motionDurationMs, setMotionDurationMs] = useState(450)
  const [motionPulseActive, setMotionPulseActive] = useState(false)
  const [viewMode, setViewMode] = useState<"normal" | "outline" | "notes_page">("normal")
  const [showGuides, setShowGuides] = useState(false)
  const [colorMode, setColorMode] = useState<"color" | "grayscale" | "contrast">("color")
  const [stageZoomPct, setStageZoomPct] = useState<85 | 100>(100)
  const [isRecordingAudio, setIsRecordingAudio] = useState(false)
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null)
  const [showTeleprompter, setShowTeleprompter] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [showA11yModal, setShowA11yModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const slideImageInputRef = useRef<HTMLInputElement>(null)

  const activeDeck = decks.find((d) => d.id === activeDeckId) || decks[0]
  const safeSlideIndex = Math.max(
    0,
    Math.min((activeDeck?.slides.length || 1) - 1, activeSlideIndex)
  )
  const activeSlide = activeDeck?.slides[safeSlideIndex] || createEmptySlide("cover")
  const theme: SlideThemePalette = getSlideThemeById(activeDeck?.themeId || "sandstone-editorial")
  const effectiveSlideBg = activeSlide.customBgHex || theme.bgHex
  const aspectClass = activeDeck?.aspectRatio === "4:3" ? "aspect-[4/3]" : "aspect-[16/9]"

  useEffect(() => {
    saveStudioDecks(user, decks)
  }, [decks, user])

  useEffect(() => {
    const onGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault()
        setShowPrintModal(true)
      } else if (e.key === "F5" && !isPresenting) {
        e.preventDefault()
        setActiveSlideIndex(0)
        setPresenterViewMode(false)
        setIsPresenting(true)
      }
    }
    window.addEventListener("keydown", onGlobalKey)
    return () => window.removeEventListener("keydown", onGlobalKey)
  }, [isPresenting])

  useEffect(() => {
    if (!isPresenting) {
      setPresentSeconds(0)
      setInkStrokes([])
      setPenActive(false)
      return
    }
    const timer = window.setInterval(() => setPresentSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(timer)
  }, [isPresenting])

  useEffect(() => {
    if (!isPresenting || autoPlaySec === 0) return
    const total = activeDeck?.slides.length || 1
    const timer = window.setInterval(() => {
      setActiveSlideIndex((idx) => (idx + 1 >= total ? 0 : idx + 1))
    }, autoPlaySec * 1000)
    return () => window.clearInterval(timer)
  }, [isPresenting, autoPlaySec, activeDeck?.slides.length])

  useEffect(() => {
    if (!isPresenting) return
    setRevealStep(activeSlide.animateBullets ? 1 : 99)
    setInkStrokes([])
  }, [activeSlideIndex, isPresenting, activeSlide.animateBullets])

  useEffect(() => {
    if (!isPresenting) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPresenting(false)
        setPresenterViewMode(false)
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault()
        const maxBullets = activeSlide.bullets?.length || 0
        if (activeSlide.animateBullets && revealStep < maxBullets) {
          setRevealStep((r) => r + 1)
          return
        }
        setActiveSlideIndex((idx) =>
          Math.min((activeDeck?.slides.length || 1) - 1, idx + 1)
        )
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault()
        setActiveSlideIndex((idx) => Math.max(0, idx - 1))
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isPresenting, activeDeck?.slides.length, activeSlide.animateBullets, activeSlide.bullets?.length, revealStep])

  const notify = (msg: string) => {
    setStatusNotice(msg)
    setTimeout(() => {
      setStatusNotice((prev) => (prev === msg ? null : prev))
    }, 3200)
  }

  const updateActiveDeck = (
    updater: (deck: StudioDeckRecord) => StudioDeckRecord,
    recordHistory = true
  ) => {
    if (!activeDeck) return
    if (recordHistory) {
      setUndoDecks((prev) => [...prev.slice(-19), JSON.parse(JSON.stringify(activeDeck))])
      setRedoDecks([])
    }
    const now = new Date().toISOString()
    setDecks((prev) =>
      prev.map((d) => (d.id === activeDeck.id ? { ...updater(d), updatedAt: now } : d))
    )
    setSavedLabel(
      `Saved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    )
  }

  const handleDeckUndo = () => {
    if (undoDecks.length === 0 || !activeDeck) return
    const prevDeck = undoDecks[undoDecks.length - 1]
    setUndoDecks((u) => u.slice(0, -1))
    setRedoDecks((r) => [...r, JSON.parse(JSON.stringify(activeDeck))])
    setDecks((prev) => prev.map((d) => (d.id === activeDeck.id ? prevDeck : d)))
    notify("Undid deck change")
  }

  const handleDeckRedo = () => {
    if (redoDecks.length === 0 || !activeDeck) return
    const nextDeck = redoDecks[redoDecks.length - 1]
    setRedoDecks((r) => r.slice(0, -1))
    setUndoDecks((u) => [...u, JSON.parse(JSON.stringify(activeDeck))])
    setDecks((prev) => prev.map((d) => (d.id === activeDeck.id ? nextDeck : d)))
    notify("Redid deck change")
  }

  const updateActiveSlide = (patch: Partial<StudioSlideItem>, recordHistory = false) => {
    updateActiveDeck(
      (deck) => ({
        ...deck,
        slides: deck.slides.map((s, idx) => (idx === safeSlideIndex ? { ...s, ...patch } : s)),
      }),
      recordHistory
    )
  }

  const handleLayoutChange = (nextLayout: SlideLayoutType) => {
    const defaults = createEmptySlide(nextLayout)
    updateActiveSlide(
      {
        layout: nextLayout,
        leftTitle: activeSlide.leftTitle || defaults.leftTitle,
        leftBullets: activeSlide.leftBullets?.length ? activeSlide.leftBullets : defaults.leftBullets,
        rightTitle: activeSlide.rightTitle || defaults.rightTitle,
        rightBullets: activeSlide.rightBullets?.length ? activeSlide.rightBullets : defaults.rightBullets,
        metrics: activeSlide.metrics?.length ? activeSlide.metrics : defaults.metrics,
        quote: activeSlide.quote || defaults.quote,
        quoteAuthor: activeSlide.quoteAuthor || defaults.quoteAuthor,
        bullets: activeSlide.bullets?.length ? activeSlide.bullets : defaults.bullets,
        tableData: activeSlide.tableData || defaults.tableData,
        chartData: activeSlide.chartData || defaults.chartData,
      },
      true
    )
  }

  const handleAddSlide = (layout: SlideLayoutType = "bullets") => {
    const nextSlide = createEmptySlide(layout)
    updateActiveDeck((deck) => ({
      ...deck,
      slides: [
        ...deck.slides.slice(0, safeSlideIndex + 1),
        nextSlide,
        ...deck.slides.slice(safeSlideIndex + 1),
      ],
    }))
    setActiveSlideIndex(safeSlideIndex + 1)
    notify("Added new slide")
  }

  const handleDuplicateSlide = (idx: number) => {
    if (!activeDeck) return
    const src = activeDeck.slides[idx]
    if (!src) return
    const copy: StudioSlideItem = {
      ...JSON.parse(JSON.stringify(src)),
      id: `slide_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: `${src.title} (Copy)`,
    }
    updateActiveDeck((deck) => ({
      ...deck,
      slides: [...deck.slides.slice(0, idx + 1), copy, ...deck.slides.slice(idx + 1)],
    }))
    setActiveSlideIndex(idx + 1)
    notify("Duplicated slide")
  }

  const handleMoveSlide = (idx: number, dir: -1 | 1) => {
    if (!activeDeck) return
    const target = idx + dir
    if (target < 0 || target >= activeDeck.slides.length) return
    updateActiveDeck((deck) => {
      const arr = [...deck.slides]
      const [moved] = arr.splice(idx, 1)
      arr.splice(target, 0, moved)
      return { ...deck, slides: arr }
    })
    setActiveSlideIndex(target)
  }

  const handleDeleteSlide = (idx: number) => {
    if (!activeDeck || activeDeck.slides.length <= 1) {
      notify("Keep at least one slide in the deck")
      return
    }
    updateActiveDeck((deck) => ({
      ...deck,
      slides: deck.slides.filter((_, i) => i !== idx),
    }))
    setActiveSlideIndex(Math.max(0, idx - 1))
    notify("Slide removed")
  }

  const handleInsertExtraElement = (kind: SlideExtraElement["kind"]) => {
    const newEl: SlideExtraElement = {
      id: `el_${Date.now()}`,
      kind,
      text:
        kind === "callout"
          ? "Key Highlight: Summarize takeaway here."
          : kind === "badge"
          ? "PRIORITY MILESTONE"
          : kind === "arrow"
          ? "Next Step → Proceed to Execution"
          : "Custom Text Box — double click to edit",
      bgHex: theme.surfaceHex,
      textHex: kind === "badge" ? theme.accentHex : theme.textHex,
    }
    updateActiveSlide({ elements: [...(activeSlide.elements || []), newEl] }, true)
    notify(`Inserted ${kind} element onto slide`)
  }

  const handleAddSlideComment = () => {
    if (!commentDraft.trim()) return
    const next = [
      {
        id: `sc_${Date.now()}`,
        author: user.name || "Presenter",
        text: commentDraft.trim(),
        createdAt: new Date().toISOString(),
      },
      ...(activeSlide.comments || []),
    ]
    updateActiveSlide({ comments: next })
    setCommentDraft("")
  }

  const handleFindReplaceDeck = () => {
    if (!findTerm.trim() || !activeDeck) return
    const escaped = findTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const re = new RegExp(escaped, "gi")
    const replStr = (s?: string) => (s ? s.replace(re, replaceTerm) : s)
    updateActiveDeck((deck) => ({
      ...deck,
      slides: deck.slides.map((s) => ({
        ...s,
        title: replStr(s.title) || s.title,
        subtitle: replStr(s.subtitle),
        quote: replStr(s.quote),
        bullets: s.bullets?.map((b) => b.replace(re, replaceTerm)),
        leftBullets: s.leftBullets?.map((b) => b.replace(re, replaceTerm)),
        rightBullets: s.rightBullets?.map((b) => b.replace(re, replaceTerm)),
      })),
    }))
    notify(`Replaced "${findTerm}" across all slides`)
  }

  const handleCreateDeckFromTemplate = (tpl: DeckTemplateItem) => {
    const now = new Date().toISOString()
    const newDeck: StudioDeckRecord = {
      id: `deck_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: tpl.name === "Blank Deck" ? `Untitled Deck ${decks.length + 1}` : tpl.name,
      category: tpl.category,
      themeId: tpl.themeId,
      slides: tpl.buildSlides(),
      createdAt: now,
      updatedAt: now,
      authorName: user.name || "ConnectLn Member",
      aspectRatio: "16:9",
      showSlideNumbers: true,
    }
    setDecks((prev) => [newDeck, ...prev])
    setActiveDeckId(newDeck.id)
    setActiveSlideIndex(0)
    setShowTemplatesModal(false)
    setSidebarTab("slides")
    notify(`Created "${newDeck.title}"`)
  }

  const handleSlideImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateActiveSlide({ imageUrl: reader.result })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleExport = (kind: "pptx" | "html" | "print") => {
    if (!activeDeck) return
    setShowExportMenu(false)
    const slug = safeSlug(activeDeck.title)

    if (kind === "pptx") {
      const bytes = buildPptxBytes(
        activeDeck.title,
        activeDeck.slides,
        theme,
        activeDeck.aspectRatio || "16:9"
      )
      downloadStudioFile(
        bytes,
        `${slug}.pptx`,
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      )
      notify(`Exported ${slug}.pptx`)
      return
    }

    if (kind === "html") {
      const visible = activeDeck.slides.filter((s) => !s.hidden)
      const html = buildStandaloneHtmlDeck(
        activeDeck.title,
        visible.length > 0 ? visible : activeDeck.slides,
        theme
      )
      downloadStudioFile(html, `${slug}-deck.html`, "text/html;charset=utf-8")
      notify(`Exported ${slug}-deck.html`)
      return
    }

    setShowPrintModal(true)
  }

  const handleShareDeck = () => {
    if (!activeDeck || !onShareToFeed) return
    const visible = activeDeck.slides.filter((s) => !s.hidden)
    const feedSlides = visible.map((s, idx) => ({
      slideNumber: idx + 1,
      title: s.title,
      content:
        s.bullets?.join(" · ") ||
        s.quote ||
        s.metrics?.map((m) => `${m.value} ${m.label}`).join(" · ") ||
        s.subtitle ||
        activeDeck.title,
      visualTag: "ConnectLn Slides",
    }))
    onShareToFeed({
      title: activeDeck.title,
      summary: `Published ${visible.length}-slide deck "${activeDeck.title}" from ConnectLn Slides.`,
      appLabel: "ConnectLn Slides",
      slides: feedSlides,
    })
    notify("Published slide deck to ConnectLn Home Feed")
  }

  const activeFontFamily = useMemo(
    () =>
      SLIDE_FONT_PAIRINGS.find((f) => f.id === fontPairingId)?.fontFamily ||
      SLIDE_FONT_PAIRINGS[0].fontFamily,
    [fontPairingId]
  )

  const deckStats = useMemo(() => computeDeckStats(activeDeck), [activeDeck])
  const deckA11yReport = useMemo(
    () => runDeckAccessibilityAudit(activeDeck, theme),
    [activeDeck, theme]
  )

  const slidesCommandResults = useMemo(() => {
    const q = commandQuery.trim().toLowerCase()
    if (!q) return SLIDES_COMMAND_CATALOG.slice(0, 6)
    return SLIDES_COMMAND_CATALOG.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.keywords.toLowerCase().includes(q)
    ).slice(0, 6)
  }, [commandQuery])

  const openSlidesNoctis = (
    prompt = "",
    mode?: "generate" | "notes" | "tighten" | "translate"
  ) => {
    setNoctisInitialPrompt(prompt)
    setNoctisInitialMode(mode)
    setShowNoctisPanel(true)
    setCommandMenuOpen(false)
  }

  const handleInsertDiagramElements = (kind: SlideDiagramKind) => {
    const added = buildSlideDiagramElements(kind, theme)
    updateActiveSlide({ elements: [...(activeSlide.elements || []), ...added] }, true)
    setShowDiagramMenu(false)
    notify("Added visual diagram elements onto active slide")
  }

  const handleToggleNarrationRecord = async () => {
    if (isRecordingAudio) {
      try {
        mediaRecorderRef.current?.stop()
      } catch {}
      setIsRecordingAudio(false)
      notify("Saved slide narration rehearsal take")
      return
    }
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream)
        audioChunksRef.current = []
        recorder.ondataavailable = (ev) => {
          if (ev.data.size > 0) audioChunksRef.current.push(ev.data)
        }
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop())
          if (audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
            setRecordedAudioUrl(URL.createObjectURL(blob))
          }
        }
        mediaRecorderRef.current = recorder
        recorder.start()
        setIsRecordingAudio(true)
        notify("Recording voiceover narration for slide...")
        return
      } catch {
        // Gracefully start rehearsal capture timer mode if mic permission denied
      }
    }
    setIsRecordingAudio(true)
    notify("Narration timing mode active — speak alongside Teleprompter Notes")
  }

  const triggerMotionPreview = () => {
    setMotionPulseActive(true)
    setTransitionPulseKey((k) => k + 1)
    setTimeout(() => setMotionPulseActive(false), Math.min(900, motionDurationMs + 150))
  }

  const executeSlidesCommand = (cmdId: string) => {
    setCommandMenuOpen(false)
    setCommandQuery("")
    switch (cmdId) {
      case "open_noctis":
        openSlidesNoctis()
        break
      case "open_hub":
        setShowHubDrawer(true)
        break
      case "add_slide":
        handleAddSlide("bullets")
        break
      case "add_section":
        handleAddSlide("section")
        break
      case "insert_diagram":
        handleInsertDiagramElements("process_3step")
        break
      case "insert_table":
        handleLayoutChange("table")
        break
      case "insert_chart":
        handleLayoutChange("chart")
        break
      case "open_design":
        setRibbonTab("design")
        break
      case "open_motion":
        setRibbonTab("motion")
        triggerMotionPreview()
        break
      case "start_present":
        setActiveSlideIndex(0)
        setPresenterViewMode(false)
        setIsPresenting(true)
        break
      case "open_presenter":
        setPresenterViewMode(true)
        setIsPresenting(true)
        break
      case "open_record":
        setRibbonTab("record")
        setShowTeleprompter(true)
        break
      case "open_sorter":
        setViewMode("normal")
        setSorterMode(true)
        break
      case "open_outline":
        setSorterMode(false)
        setViewMode("outline")
        break
      case "toggle_guides":
        setShowGuides((g) => !g)
        break
      case "open_stats":
        setShowStatsModal(true)
        break
      case "run_a11y":
        setShowA11yModal(true)
        break
      case "open_print":
        setShowPrintModal(true)
        break
      default:
        break
    }
  }

  const filteredDecks = decks.filter((d) => {
    const q = deckSearch.trim().toLowerCase()
    return !q || d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
  })

  const renderSlidePreviewVisual = (slide: StudioSlideItem, stepLimit = 99) => {
    if (slide.layout === "cover" || slide.layout === "section") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 space-y-5">
          <h1
            style={{ color: theme.primaryHex }}
            className="text-3xl sm:text-5xl font-black tracking-tight max-w-4xl leading-tight"
          >
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p style={{ color: theme.mutedHex }} className="text-lg sm:text-2xl max-w-3xl">
              {slide.subtitle}
            </p>
          )}
          {slide.bullets && slide.bullets.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              {slide.bullets.slice(0, stepLimit).map((tag, i) => (
                <span
                  key={i}
                  style={{ backgroundColor: theme.surfaceHex, color: theme.accentHex }}
                  className="rounded-full px-4 py-1.5 text-sm font-bold border border-white/15"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (slide.layout === "two_column") {
      return (
        <div className="flex-1 grid grid-cols-2 gap-6 items-start pt-4">
          <div style={{ backgroundColor: theme.surfaceHex }} className="rounded-2xl p-6 border border-white/10 space-y-3 h-full">
            <h3 style={{ color: theme.accentHex }} className="text-xl font-extrabold">{slide.leftTitle || "Left Track"}</h3>
            <ul className="space-y-2 text-base sm:text-lg list-disc pl-5">
              {(slide.leftBullets || []).map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
          <div style={{ backgroundColor: theme.surfaceHex }} className="rounded-2xl p-6 border border-white/10 space-y-3 h-full">
            <h3 style={{ color: theme.accentHex }} className="text-xl font-extrabold">{slide.rightTitle || "Right Track"}</h3>
            <ul className="space-y-2 text-base sm:text-lg list-disc pl-5">
              {(slide.rightBullets || []).map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
        </div>
      )
    }

    if (slide.layout === "metrics") {
      return (
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-5 items-center pt-4">
          {(slide.metrics || []).map((m, i) => (
            <div key={i} style={{ backgroundColor: theme.surfaceHex }} className="rounded-2xl p-6 border border-white/10 space-y-2 text-center">
              <div style={{ color: theme.accentHex }} className="text-4xl font-black">{m.value}</div>
              <div className="text-base font-bold">{m.label}</div>
              {m.delta && <div style={{ color: theme.mutedHex }} className="text-xs font-semibold">{m.delta}</div>}
            </div>
          ))}
        </div>
      )
    }

    if (slide.layout === "quote") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 space-y-4">
          <blockquote className="text-2xl sm:text-4xl italic font-semibold leading-snug max-w-4xl">
            “{slide.quote || slide.subtitle || ""}”
          </blockquote>
          {slide.quoteAuthor && (
            <p style={{ color: theme.accentHex }} className="text-lg font-extrabold">— {slide.quoteAuthor}</p>
          )}
        </div>
      )
    }

    if (slide.layout === "table" && slide.tableData) {
      return (
        <div className="flex-1 overflow-auto pt-4">
          <table className="w-full border-collapse text-sm sm:text-base">
            <thead>
              <tr>
                {slide.tableData.headers.map((h, i) => (
                  <th key={i} style={{ backgroundColor: theme.surfaceHex, color: theme.accentHex }} className="border border-white/20 px-4 py-2 text-left font-extrabold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slide.tableData.rows.map((r, rIdx) => (
                <tr key={rIdx}>
                  {r.map((cell, cIdx) => (
                    <td key={cIdx} className="border border-white/15 px-4 py-2">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (slide.layout === "chart" && slide.chartData) {
      const items = slide.chartData.items
      const maxV = Math.max(1, ...items.map((x) => x.value))
      return (
        <div style={{ backgroundColor: theme.surfaceHex }} className="flex-1 rounded-2xl p-6 border border-white/10 flex flex-col justify-between mt-3">
          <p style={{ color: theme.accentHex }} className="text-base font-extrabold">{slide.chartData.title}</p>
          <div className="flex-1 flex items-end gap-6 pt-4 pb-2">
            {items.map((it, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                <span className="text-sm font-mono font-bold">{it.value}</span>
                <div style={{ height: `${Math.max(10, Math.round((it.value / maxV) * 100))}%`, backgroundColor: theme.accentHex }} className="w-full max-w-[64px] rounded-t-lg" />
                <span className="text-xs font-bold">{it.label}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (slide.layout === "visual_split") {
      return (
        <div className="flex-1 grid grid-cols-2 gap-6 items-center pt-2">
          <ul className="space-y-3 text-lg sm:text-xl list-disc pl-6">
            {(slide.bullets || []).slice(0, stepLimit).map((b, i) => <li key={i}>{b}</li>)}
          </ul>
          <div style={{ backgroundColor: theme.surfaceHex }} className="rounded-2xl overflow-hidden border border-white/10 aspect-video flex items-center justify-center">
            {slide.imageUrl ? <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" /> : <span style={{ color: theme.mutedHex }}>Visual Frame</span>}
          </div>
        </div>
      )
    }

    return (
      <div className="flex-1 pt-4 space-y-4">
        <ul className="space-y-3.5 text-lg sm:text-2xl list-disc pl-7">
          {(slide.bullets || []).slice(0, stepLimit).map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
        {slide.elements && slide.elements.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-2">
            {slide.elements.map((el) => (
              <div
                key={el.id}
                style={{ backgroundColor: el.bgHex, color: el.textHex }}
                className="rounded-xl px-4 py-2 text-sm font-bold border border-white/15"
              >
                {el.text}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const transitionAnimStyle: React.CSSProperties =
    activeSlide.transition && activeSlide.transition !== "none"
      ? { transition: `all ${activeSlide.transitionDurationMs || 400}ms ease` }
      : {}

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col lg:flex-row rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm min-h-[780px]">
      {/* Left Filmstrip / Deck Library Sidebar */}
      {sidebarOpen && (
        <aside className="w-full lg:w-[270px] shrink-0 border-b lg:border-b-0 lg:border-r border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/80 dark:bg-zinc-950/60 flex flex-col">
          <div className="p-2.5 border-b border-[#E7E2DA] dark:border-zinc-800 space-y-2">
            <div className="grid grid-cols-2 rounded-xl bg-[#EFECE6] dark:bg-zinc-900 p-1">
              <button
                type="button"
                onClick={() => setSidebarTab("slides")}
                className={`rounded-lg py-1.5 text-xs font-bold cursor-pointer ${
                  sidebarTab === "slides" ? "bg-white dark:bg-zinc-800 text-[#C84B28] shadow-2xs" : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                Slides ({activeDeck?.slides.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab("decks")}
                className={`rounded-lg py-1.5 text-xs font-bold cursor-pointer ${
                  sidebarTab === "decks" ? "bg-white dark:bg-zinc-800 text-[#C84B28] shadow-2xs" : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                My Decks ({decks.length})
              </button>
            </div>

            {sidebarTab === "slides" ? (
              <button
                type="button"
                onClick={() => handleAddSlide("bullets")}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#C84B28] hover:bg-[#a93c1e] text-white py-1.5 text-xs font-bold cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add New Slide
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowTemplatesModal(true)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-[#C84B28] hover:bg-[#a93c1e] text-white py-1.5 text-xs font-bold cursor-pointer"
                  >
                    <FilePlus2 className="h-3.5 w-3.5" />
                    New Deck
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTemplatesModal(true)}
                    className="inline-flex items-center justify-center rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs cursor-pointer"
                  >
                    <LayoutTemplate className="h-3.5 w-3.5 text-[#C84B28]" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={deckSearch}
                    onChange={(e) => setDeckSearch(e.target.value)}
                    placeholder="Search decks..."
                    className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-8 pr-3 py-1.5 text-xs outline-none focus:border-[#C84B28]"
                  />
                </div>
              </div>
            )}
          </div>

          {sidebarTab === "slides" ? (
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2 max-h-[260px] lg:max-h-none">
              {activeDeck?.slides.map((s, idx) => {
                const isSelected = idx === safeSlideIndex
                return (
                  <div
                    key={s.id}
                    onClick={() => { setActiveSlideIndex(idx); setSorterMode(false) }}
                    className={`group rounded-xl border p-2 transition-all cursor-pointer ${
                      s.hidden ? "opacity-50" : ""
                    } ${
                      isSelected
                        ? "border-[#C84B28] ring-2 ring-[#C84B28]/20 bg-white dark:bg-zinc-900"
                        : "border-[#E7E2DA] dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 hover:border-[#C84B28]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-extrabold text-zinc-500">
                        {idx + 1}. {s.layout.replace("_", " ").toUpperCase()} {s.hidden ? "(HIDDEN)" : ""}
                      </span>
                      <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleMoveSlide(idx, -1) }} title="Move up" className="p-0.5 rounded hover:bg-zinc-100 cursor-pointer"><ArrowUp className="h-3 w-3" /></button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleMoveSlide(idx, 1) }} title="Move down" className="p-0.5 rounded hover:bg-zinc-100 cursor-pointer"><ArrowDown className="h-3 w-3" /></button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleDuplicateSlide(idx) }} title="Duplicate" className="p-0.5 rounded hover:bg-zinc-100 cursor-pointer"><Copy className="h-3 w-3" /></button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteSlide(idx) }} title="Delete" className="p-0.5 rounded hover:text-rose-600 cursor-pointer"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </div>

                    <div
                      style={{ backgroundColor: s.customBgHex || theme.bgHex, color: theme.textHex }}
                      className="rounded-lg p-2.5 aspect-[16/9] flex flex-col justify-between overflow-hidden border border-black/10"
                    >
                      <p style={{ color: theme.primaryHex }} className="text-[10.5px] font-extrabold leading-snug line-clamp-2">
                        {s.title || "Untitled Slide"}
                      </p>
                      <p style={{ color: theme.mutedHex }} className="text-[9px] line-clamp-2 opacity-90">
                        {s.quote || s.bullets?.[0] || s.subtitle || ""}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[260px] lg:max-h-none">
              {filteredDecks.map((d) => {
                const isSel = d.id === activeDeck?.id
                return (
                  <div
                    key={d.id}
                    onClick={() => { setActiveDeckId(d.id); setActiveSlideIndex(0); setSidebarTab("slides") }}
                    className={`group rounded-xl border p-2.5 cursor-pointer ${
                      isSel ? "border-[#C84B28] bg-white dark:bg-zinc-900 shadow-xs" : "border-transparent hover:border-[#E7E2DA] hover:bg-white/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#0B1F3A] dark:text-zinc-100 truncate">{d.title}</p>
                        <p className="text-[10.5px] text-zinc-500 mt-0.5 truncate">{d.slides.length} slides · {d.category}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDecks((prev) => prev.map((x) => (x.id === d.id ? { ...x, starred: !x.starred } : x)))
                        }}
                        className="p-1 rounded cursor-pointer"
                      >
                        <Star className={`h-3.5 w-3.5 ${d.starred ? "fill-amber-400 text-amber-500" : "text-zinc-400"}`} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </aside>
      )}

      {/* Main Deck Studio Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Deck Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-[#E7E2DA] dark:border-zinc-800">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen((s) => !s)}
              className="rounded-lg p-1.5 border border-[#E7E2DA] dark:border-zinc-700 hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer shrink-0"
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
            <button
              type="button"
              aria-label="Open ConnectLn Slides Hub"
              onClick={() => setShowHubDrawer(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B1F3A] hover:bg-[#132D52] text-white px-2.5 py-1.5 text-xs font-extrabold shadow-2xs cursor-pointer shrink-0"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-orange-300" />
              <span className="hidden sm:inline">Studio Hub</span>
            </button>
            <input
              type="text"
              aria-label="Deck title"
              value={activeDeck?.title || ""}
              onChange={(e) => updateActiveDeck((d) => ({ ...d, title: e.target.value }), false)}
              className="min-w-[130px] flex-1 max-w-xs rounded-lg border border-transparent hover:border-[#E7E2DA] focus:border-[#C84B28] bg-transparent px-2 py-1 text-sm sm:text-base font-extrabold text-[#0B1F3A] dark:text-white outline-none"
            />
            <span className="hidden xl:inline-flex items-center rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 px-2.5 py-0.5 text-[11px] font-semibold text-[#C84B28] dark:text-orange-300">
              {savedLabel}
            </span>
          </div>

          {/* Centered Command Palette Search */}
          <div className="relative w-full sm:w-56 md:w-64 order-last lg:order-none">
            <Sparkles className="h-3.5 w-3.5 text-[#C84B28] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="Ask Noctis or find a slide tool"
              value={commandQuery}
              onFocus={() => setCommandMenuOpen(true)}
              onChange={(e) => {
                setCommandQuery(e.target.value)
                setCommandMenuOpen(true)
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setCommandMenuOpen(false)
                if (e.key === "Enter" && commandQuery.trim()) {
                  openSlidesNoctis(commandQuery.trim(), "generate")
                }
              }}
              placeholder="Ask Noctis or find a slide tool..."
              className="w-full rounded-full border border-[#E7E2DA] dark:border-zinc-700 bg-[#FAF7F2] dark:bg-zinc-950 pl-8 pr-7 py-1.5 text-xs font-medium text-[#0B1F3A] dark:text-zinc-100 outline-none focus:border-[#C84B28] focus:bg-white"
            />
            {commandMenuOpen && (
              <button
                type="button"
                aria-label="Close slides command search"
                onClick={() => setCommandMenuOpen(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {commandMenuOpen && (
              <div className="absolute left-0 right-0 top-9 z-40 rounded-2xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1.5 shadow-2xl space-y-1">
                {commandQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => openSlidesNoctis(commandQuery.trim(), "generate")}
                    className="w-full flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0B1F3A] to-[#C84B28] text-white px-2.5 py-2 text-left text-xs font-bold cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-200" />
                    <span className="truncate">Ask Noctis: {commandQuery.trim()}</span>
                  </button>
                )}
                {slidesCommandResults.map((cmd) => (
                  <button
                    key={cmd.id}
                    type="button"
                    onClick={() => executeSlidesCommand(cmd.id)}
                    className="w-full flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <span className="font-bold text-[#0B1F3A] dark:text-zinc-100 truncate">
                      {cmd.label}
                    </span>
                    <span className="text-[10px] font-semibold text-[#C84B28] shrink-0">
                      {cmd.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {statusNotice && (
              <span className="rounded-lg bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 px-2.5 py-1 text-xs font-semibold text-[#C84B28] dark:text-orange-300">
                {statusNotice}
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                setPresenterViewMode(false)
                setIsPresenting(true)
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0067B8] hover:bg-[#00559b] text-white px-3 py-1.5 text-xs font-bold shadow-xs cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Present
            </button>

            <button
              type="button"
              onClick={() => {
                setPresenterViewMode(true)
                setIsPresenting(true)
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#0067B8] text-[#0067B8] bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 px-3 py-1.5 text-xs font-bold cursor-pointer"
            >
              <MonitorPlay className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Presenter View</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              title="Print Slides, Handouts, or Speaker Notes (Ctrl+P)"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#C84B28] bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 px-3 py-1.5 text-xs font-extrabold text-[#C84B28] dark:text-orange-300 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 px-3 py-1.5 text-xs font-bold hover:border-[#C84B28] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#C84B28]" />
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-10 z-30 w-56 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1.5 shadow-xl space-y-1">
                  <button type="button" onClick={() => handleExport("pptx")} className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer">
                    <span>Standard Deck (.pptx)</span>
                    <span className="text-[10px] font-mono text-[#C84B28]">OpenXML</span>
                  </button>
                  <button type="button" onClick={() => handleExport("html")} className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer">
                    <span>Interactive Web Deck (.html)</span>
                    <span className="text-[10px] font-mono text-zinc-400">HTML5</span>
                  </button>
                  <button type="button" onClick={() => handleExport("print")} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer">
                    <Printer className="h-3.5 w-3.5 text-[#C84B28]" />
                    <span>Print Slides / Handouts</span>
                  </button>
                </div>
              )}
            </div>

            {onShareToFeed && (
              <button
                type="button"
                onClick={handleShareDeck}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#C84B28] hover:bg-[#a93c1e] text-white px-3 py-1.5 text-xs font-bold shadow-xs cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share Deck
              </button>
            )}
          </div>
        </div>

        {/* ConnectLn Floating Pill Command Deck */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950">
          <div className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-[#EFECE6]/90 dark:bg-zinc-900 p-1 overflow-x-auto no-scrollbar">
            {(
              [
                { id: "home", label: "Home" },
                { id: "insert", label: "Insert" },
                { id: "design", label: "Design" },
                { id: "transitions", label: "Transitions" },
                { id: "motion", label: "Motion" },
                { id: "slideshow", label: "Slide Show" },
                { id: "record", label: "Record" },
                { id: "review", label: "Review" },
                { id: "view", label: "View" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRibbonTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  ribbonTab === tab.id
                    ? "bg-[#0B1F3A] text-white shadow-2xs"
                    : "text-[#0B1F3A]/80 dark:text-zinc-300 hover:bg-white/80 dark:hover:bg-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden xl:inline text-[10.5px] font-mono text-zinc-500">
              {activeDeck?.aspectRatio || "16:9"} · {STUDIO_SLIDE_THEMES.length} Themes · Handouts &amp; Presenter View
            </span>
            <button
              type="button"
              aria-label="Open Noctis Pitch Studio"
              onClick={() => setShowNoctisPanel((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold shadow-xs transition-all cursor-pointer ${
                showNoctisPanel
                  ? "bg-[#C84B28] text-white ring-2 ring-[#C84B28]/30"
                  : "bg-gradient-to-r from-[#0B1F3A] to-[#C84B28] text-white hover:opacity-95"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
              Noctis
            </button>
            <button
              type="button"
              aria-label="Open ConnectLn Slides Help"
              onClick={() => setShowHelpModal(true)}
              className="inline-flex items-center gap-1 rounded-full border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[#C84B28] px-2.5 py-1.5 text-xs font-bold text-[#0B1F3A] dark:text-zinc-200 cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5 text-[#C84B28]" />
              <span className="hidden sm:inline">Help</span>
            </button>
          </div>
        </div>

        {/* Ribbon Tool Strip */}
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 border-b border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/70 dark:bg-zinc-950/70 text-xs">
          {ribbonTab === "home" && (
            <>
              <button type="button" onClick={handleDeckUndo} disabled={undoDecks.length === 0} title="Undo" className="p-1.5 rounded-lg hover:bg-white disabled:opacity-35 cursor-pointer"><Undo2 className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={handleDeckRedo} disabled={redoDecks.length === 0} title="Redo" className="p-1.5 rounded-lg hover:bg-white disabled:opacity-35 cursor-pointer"><Redo2 className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => handleAddSlide("bullets")} className="inline-flex items-center gap-1 rounded-lg bg-[#C84B28] text-white px-2.5 py-1 font-bold cursor-pointer"><Plus className="h-3.5 w-3.5" />New Slide</button>
              <button type="button" onClick={() => handleDuplicateSlide(safeSlideIndex)} className="rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2 py-1 font-semibold cursor-pointer">Duplicate</button>

              <span className="h-5 w-px bg-[#E7E2DA] dark:bg-zinc-700 mx-0.5" />

              <select
                aria-label="Slide layout selector"
                value={activeSlide.layout}
                onChange={(e) => handleLayoutChange(e.target.value as SlideLayoutType)}
                className="rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 font-bold cursor-pointer"
              >
                {LAYOUT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>Layout: {opt.label}</option>
                ))}
              </select>

              {(
                [
                  { align: "left", Icon: AlignLeft },
                  { align: "center", Icon: AlignCenter },
                  { align: "right", Icon: AlignRight },
                ] as const
              ).map(({ align, Icon }) => (
                <button key={align} type="button" onClick={() => updateActiveSlide({ titleAlign: align })} title={`Title align ${align}`} className="p-1.5 rounded-lg hover:bg-white cursor-pointer">
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}

              <button
                type="button"
                onClick={() => updateActiveSlide({ hidden: !activeSlide.hidden }, true)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  activeSlide.hidden ? "bg-amber-600 text-white" : "border border-[#E7E2DA] bg-white dark:bg-zinc-900"
                }`}
              >
                {activeSlide.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {activeSlide.hidden ? "Hidden" : "Hide Slide"}
              </button>

              <button
                type="button"
                onClick={() => setShowFindBar((v) => !v)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2 py-1 font-semibold cursor-pointer"
              >
                <Search className="h-3.5 w-3.5" />
                Find
              </button>

              <button
                type="button"
                onClick={() => handleAddSlide("section")}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 hover:border-[#C84B28] px-2 py-1 font-bold cursor-pointer"
              >
                + Section
              </button>

              <button
                type="button"
                onClick={() => {
                  updateActiveSlide({ customBgHex: undefined, titleAlign: undefined }, true)
                  notify("Reset active slide styling & alignment")
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2 py-1 font-semibold cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Layout
              </button>

              <button
                type="button"
                onClick={() => openSlidesNoctis("", "generate")}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0B1F3A] text-white px-2.5 py-1 font-extrabold hover:bg-[#132D52] cursor-pointer"
              >
                <Sparkles className="h-3 w-3 text-amber-300" />
                Ask Noctis
              </button>
            </>
          )}

          {ribbonTab === "insert" && (
            <>
              <button type="button" onClick={() => handleInsertExtraElement("textbox")} className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold cursor-pointer"><Type className="h-3.5 w-3.5 text-[#C84B28]" />Text Box</button>
              <button type="button" onClick={() => handleInsertExtraElement("callout")} className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold cursor-pointer"><StickyNote className="h-3.5 w-3.5 text-[#C84B28]" />Callout</button>
              <button type="button" onClick={() => handleInsertExtraElement("badge")} className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold cursor-pointer"><Square className="h-3.5 w-3.5 text-[#C84B28]" />Shape Badge</button>
              <button type="button" onClick={() => handleInsertExtraElement("arrow")} className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold cursor-pointer"><ArrowRight className="h-3.5 w-3.5 text-[#C84B28]" />Step Arrow</button>

              <span className="h-5 w-px bg-[#E7E2DA] dark:bg-zinc-700 mx-0.5" />

              <button type="button" onClick={() => handleLayoutChange("table")} className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold cursor-pointer"><Table2 className="h-3.5 w-3.5 text-[#C84B28]" />Data Table</button>
              <button type="button" onClick={() => handleLayoutChange("chart")} className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold cursor-pointer"><BarChart3 className="h-3.5 w-3.5 text-[#C84B28]" />Live Chart</button>
              <button type="button" onClick={() => slideImageInputRef.current?.click()} className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2.5 py-1 font-bold cursor-pointer"><ImagePlus className="h-3.5 w-3.5 text-[#C84B28]" />Picture</button>
              <input ref={slideImageInputRef} type="file" accept="image/*" onChange={handleSlideImageUpload} className="hidden" />

              <button
                type="button"
                onClick={() => updateActiveDeck((d) => ({ ...d, showSlideNumbers: !(d.showSlideNumbers !== false) }))}
                className="rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2 py-1 font-semibold cursor-pointer"
              >
                Slide # {activeDeck?.showSlideNumbers === false ? "OFF" : "ON"}
              </button>
              <button
                type="button"
                onClick={() => setShowCommentsDrawer((c) => !c)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  showCommentsDrawer ? "bg-[#C84B28] text-white" : "border border-[#E7E2DA] bg-white dark:bg-zinc-900"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Comments ({activeSlide.comments?.length || 0})
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDiagramMenu((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 hover:border-[#C84B28] px-2.5 py-1 font-bold cursor-pointer"
                >
                  <Workflow className="h-3.5 w-3.5 text-[#C84B28]" />
                  Visual Diagrams
                </button>
                {showDiagramMenu && (
                  <div className="absolute left-0 top-9 z-30 w-52 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1.5 shadow-xl space-y-1">
                    {(
                      [
                        { id: "process_3step", label: "3-Step Process" },
                        { id: "kpi_strip", label: "KPI Metric Strip" },
                        { id: "milestone_timeline", label: "Milestone Timeline" },
                        { id: "banner_title", label: "Banner Title Highlight" },
                      ] as const
                    ).map((dg) => (
                      <button
                        key={dg.id}
                        type="button"
                        onClick={() => handleInsertDiagramElements(dg.id)}
                        className="w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-bold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        {dg.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  updateActiveSlide({
                    elements: [
                      ...(activeSlide.elements || []),
                      {
                        id: `eq_${Date.now()}`,
                        kind: "badge",
                        text: "ROI (%) = [(Net Gain - Cost) / Cost] × 100",
                        bgHex: theme.surfaceHex,
                        textHex: theme.accentHex,
                      },
                    ],
                  }, true)
                }
                className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2 py-1 font-bold cursor-pointer"
              >
                <Sigma className="h-3.5 w-3.5 text-[#C84B28]" />
                Equation Badge
              </button>

              <button
                type="button"
                onClick={() => setShowFooterEditor((v) => !v)}
                className={`rounded-lg px-2 py-1 font-bold cursor-pointer ${
                  showFooterEditor ? "bg-[#0B1F3A] text-white" : "border border-[#E7E2DA] bg-white dark:bg-zinc-900"
                }`}
              >
                Footer Text
              </button>
            </>
          )}

          {ribbonTab === "design" && (
            <>
              <span className="font-bold text-zinc-500">Theme:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {STUDIO_SLIDE_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => updateActiveDeck((d) => ({ ...d, themeId: t.id }))}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-bold cursor-pointer ${
                      theme.id === t.id ? "border-[#C84B28] bg-white shadow-2xs" : "border-[#E7E2DA] bg-white/70"
                    }`}
                  >
                    <span style={{ backgroundColor: t.bgHex, borderColor: t.accentHex }} className="h-3.5 w-3.5 rounded-full border-2" />
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
              <span className="h-5 w-px bg-[#E7E2DA] mx-1" />
              <label className="inline-flex items-center gap-1 font-bold cursor-pointer">
                <Palette className="h-3.5 w-3.5 text-[#C84B28]" />
                Slide Bg:
                <input
                  type="color"
                  value={effectiveSlideBg}
                  onChange={(e) => updateActiveSlide({ customBgHex: e.target.value })}
                  className="h-5 w-6 border-0 bg-transparent cursor-pointer"
                />
              </label>
              {activeSlide.customBgHex && (
                <button type="button" onClick={() => updateActiveSlide({ customBgHex: undefined })} className="underline text-zinc-500 cursor-pointer">Reset Bg</button>
              )}
              <select
                aria-label="Slide aspect ratio"
                value={activeDeck?.aspectRatio || "16:9"}
                onChange={(e) => updateActiveDeck((d) => ({ ...d, aspectRatio: e.target.value as "16:9" | "4:3" }))}
                className="rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2 py-1 font-bold cursor-pointer"
              >
                <option value="16:9">16:9 Widescreen</option>
                <option value="4:3">4:3 Standard</option>
              </select>

              <select
                aria-label="Slide typography pairing"
                value={fontPairingId}
                onChange={(e) => {
                  setFontPairingId(e.target.value)
                  notify("Updated deck typography pairing")
                }}
                className="rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2 py-1 font-bold cursor-pointer"
              >
                {SLIDE_FONT_PAIRINGS.map((fp) => (
                  <option key={fp.id} value={fp.id}>{fp.label}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowAccentBar((v) => !v)}
                className={`rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  showAccentBar ? "bg-[#0B1F3A] text-white" : "border border-[#E7E2DA] bg-white"
                }`}
              >
                Accent Header Bar
              </button>
            </>
          )}

          {ribbonTab === "transitions" && (
            <>
              <span className="font-bold text-zinc-500">Effect:</span>
              {(["none", "fade", "slide", "zoom", "flip"] as SlideTransitionType[]).map((tr) => (
                <button
                  key={tr}
                  type="button"
                  onClick={() => updateActiveSlide({ transition: tr }, true)}
                  className={`rounded-lg px-2.5 py-1 font-bold capitalize cursor-pointer ${
                    (activeSlide.transition || "none") === tr
                      ? "bg-[#C84B28] text-white"
                      : "border border-[#E7E2DA] bg-white dark:bg-zinc-900"
                  }`}
                >
                  {tr}
                </button>
              ))}
              <select
                aria-label="Transition duration"
                value={activeSlide.transitionDurationMs || 400}
                onChange={(e) => updateActiveSlide({ transitionDurationMs: Number(e.target.value) })}
                className="rounded-lg border border-[#E7E2DA] bg-white px-2 py-1 font-semibold cursor-pointer"
              >
                <option value={250}>Fast (0.25s)</option>
                <option value={450}>Smooth (0.45s)</option>
                <option value={800}>Dramatic (0.8s)</option>
              </select>
              <button
                type="button"
                onClick={() => updateActiveSlide({ animateBullets: !activeSlide.animateBullets }, true)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  activeSlide.animateBullets ? "bg-[#0067B8] text-white" : "border border-[#E7E2DA] bg-white"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Step-by-Step Bullets
              </button>
              <button
                type="button"
                onClick={() => {
                  updateActiveDeck((d) => ({
                    ...d,
                    slides: d.slides.map((s) => ({
                      ...s,
                      transition: activeSlide.transition || "fade",
                      transitionDurationMs: activeSlide.transitionDurationMs || 450,
                    })),
                  }))
                  notify("Applied transition to all slides")
                }}
                className="rounded-lg border border-[#E7E2DA] bg-white px-2.5 py-1 font-bold cursor-pointer"
              >
                Apply to All
              </button>
              <button type="button" onClick={() => setTransitionPulseKey((k) => k + 1)} className="rounded-lg bg-[#0B1F3A] text-white px-2.5 py-1 font-bold cursor-pointer">Preview</button>
            </>
          )}

          {ribbonTab === "motion" && (
            <>
              <span className="font-bold text-zinc-500">Motion Preset:</span>
              {SLIDE_MOTION_PRESETS.map((mp) => (
                <button
                  key={mp.id}
                  type="button"
                  title={mp.desc}
                  onClick={() => {
                    setMotionPreset(mp.id)
                    triggerMotionPreview()
                  }}
                  className={`rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                    motionPreset === mp.id
                      ? "bg-[#C84B28] text-white"
                      : "border border-[#E7E2DA] bg-white dark:bg-zinc-900"
                  }`}
                >
                  {mp.label}
                </button>
              ))}
              <select
                aria-label="Motion timing"
                value={motionDurationMs}
                onChange={(e) => setMotionDurationMs(Number(e.target.value))}
                className="rounded-lg border border-[#E7E2DA] bg-white px-2 py-1 font-semibold cursor-pointer"
              >
                <option value={250}>Quick (0.25s)</option>
                <option value={450}>Balanced (0.45s)</option>
                <option value={750}>Measured (0.75s)</option>
              </select>
              <button
                type="button"
                onClick={() => updateActiveSlide({ animateBullets: !activeSlide.animateBullets }, true)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  activeSlide.animateBullets ? "bg-[#0067B8] text-white" : "border border-[#E7E2DA] bg-white"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Step-by-Step Reveal
              </button>
              <button
                type="button"
                onClick={triggerMotionPreview}
                className="rounded-lg bg-[#0B1F3A] text-white px-2.5 py-1 font-bold cursor-pointer"
              >
                Preview Motion
              </button>
            </>
          )}

          {ribbonTab === "slideshow" && (
            <>
              <button type="button" onClick={() => { setActiveSlideIndex(0); setPresenterViewMode(false); setIsPresenting(true) }} className="inline-flex items-center gap-1 rounded-lg bg-[#0067B8] text-white px-2.5 py-1 font-bold cursor-pointer"><Play className="h-3.5 w-3.5" />From Start</button>
              <button type="button" onClick={() => { setPresenterViewMode(false); setIsPresenting(true) }} className="rounded-lg border border-[#0067B8] text-[#0067B8] bg-white px-2.5 py-1 font-bold cursor-pointer">From Current</button>
              <button type="button" onClick={() => { setPresenterViewMode(true); setIsPresenting(true) }} className="inline-flex items-center gap-1 rounded-lg bg-[#0B1F3A] text-white px-2.5 py-1 font-bold cursor-pointer"><MonitorPlay className="h-3.5 w-3.5" />Presenter View</button>
              <button
                type="button"
                onClick={() => {
                  setPresenterViewMode(true)
                  setIsPresenting(true)
                  notify("Rehearsal pacing timer active in Presenter View")
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white px-2.5 py-1 font-bold cursor-pointer"
              >
                <Timer className="h-3.5 w-3.5 text-[#C84B28]" />
                Rehearse Timings
              </button>
              <button
                type="button"
                onClick={() => setSorterMode((m) => !m)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  sorterMode ? "bg-[#C84B28] text-white" : "border border-[#E7E2DA] bg-white"
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                Slide Sorter Grid
              </button>
              <div className="flex items-center gap-1">
                <Timer className="h-3.5 w-3.5 text-zinc-500" />
                <span className="font-bold text-zinc-500">Auto-Advance:</span>
                <select
                  aria-label="Auto advance timer"
                  value={autoPlaySec}
                  onChange={(e) => setAutoPlaySec(Number(e.target.value) as 0 | 3 | 5 | 10)}
                  className="rounded-lg border border-[#E7E2DA] bg-white px-2 py-1 font-semibold cursor-pointer"
                >
                  <option value={0}>Manual Click</option>
                  <option value={3}>Every 3s</option>
                  <option value={5}>Every 5s</option>
                  <option value={10}>Every 10s</option>
                </select>
              </div>
              <button type="button" onClick={() => setShowNotesDrawer((n) => !n)} className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white px-2.5 py-1 font-bold cursor-pointer"><StickyNote className="h-3.5 w-3.5 text-[#C84B28]" />Notes</button>
              <button type="button" onClick={() => setShowPrintModal(true)} className="inline-flex items-center gap-1 rounded-lg border border-[#C84B28] text-[#C84B28] bg-orange-50 px-2.5 py-1 font-bold cursor-pointer"><Printer className="h-3.5 w-3.5" />Print Handouts</button>
            </>
          )}

          {ribbonTab === "record" && (
            <>
              <button
                type="button"
                onClick={handleToggleNarrationRecord}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-extrabold cursor-pointer ${
                  isRecordingAudio ? "bg-rose-600 text-white" : "bg-[#C84B28] text-white"
                }`}
              >
                {isRecordingAudio ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                {isRecordingAudio ? "Stop Narration" : "Record Narration"}
              </button>
              <button
                type="button"
                onClick={() => setShowTeleprompter((v) => !v)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  showTeleprompter ? "bg-[#0B1F3A] text-white" : "border border-[#E7E2DA] bg-white"
                }`}
              >
                <StickyNote className="h-3.5 w-3.5" />
                Teleprompter Notes
              </button>
              <button
                type="button"
                onClick={() => handleExport("html")}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white px-2.5 py-1 font-bold cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#C84B28]" />
                Export Interactive Show
              </button>
              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white px-2.5 py-1 font-bold cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5 text-[#C84B28]" />
                Handouts Studio
              </button>
            </>
          )}

          {ribbonTab === "review" && (
            <>
              <button
                type="button"
                onClick={() => setShowStatsModal(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 hover:border-[#C84B28] px-2.5 py-1 font-bold cursor-pointer"
              >
                <BarChart2 className="h-3.5 w-3.5 text-[#C84B28]" />
                Deck Statistics
              </button>
              <button
                type="button"
                onClick={() => setShowA11yModal(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 hover:border-[#C84B28] px-2.5 py-1 font-bold cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Accessibility Check
              </button>
              <button
                type="button"
                onClick={() => openSlidesNoctis("", "translate")}
                className="inline-flex items-center gap-1 rounded-lg border border-[#C84B28]/40 bg-orange-50/70 text-[#C84B28] px-2.5 py-1 font-bold cursor-pointer"
              >
                <Globe2 className="h-3.5 w-3.5" />
                Translate (Noctis)
              </button>
              <button
                type="button"
                onClick={() => setShowCommentsDrawer((c) => !c)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  showCommentsDrawer ? "bg-[#0B1F3A] text-white" : "border border-[#E7E2DA] bg-white"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Comments ({activeSlide.comments?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => {
                  setInkStrokes([])
                  notify("Cleared annotation ink strokes")
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white px-2.5 py-1 font-semibold cursor-pointer"
              >
                <Eraser className="h-3.5 w-3.5" />
                Clear Ink
              </button>
            </>
          )}

          {ribbonTab === "view" && (
            <>
              <div className="inline-flex items-center rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 p-0.5 gap-0.5">
                <button
                  type="button"
                  onClick={() => { setSorterMode(false); setViewMode("normal") }}
                  className={`rounded-md px-2 py-1 text-[11px] font-bold cursor-pointer ${
                    !sorterMode && viewMode === "normal" ? "bg-[#0B1F3A] text-white" : "text-zinc-600"
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => { setSorterMode(false); setViewMode("outline") }}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold cursor-pointer ${
                    !sorterMode && viewMode === "outline" ? "bg-[#0B1F3A] text-white" : "text-zinc-600"
                  }`}
                >
                  <ListTree className="h-3 w-3" />
                  Outline View
                </button>
                <button
                  type="button"
                  onClick={() => setSorterMode(true)}
                  className={`rounded-md px-2 py-1 text-[11px] font-bold cursor-pointer ${
                    sorterMode ? "bg-[#0B1F3A] text-white" : "text-zinc-600"
                  }`}
                >
                  Sorter Grid
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSorterMode(false)
                    setViewMode("notes_page")
                    setShowNotesDrawer(true)
                  }}
                  className={`rounded-md px-2 py-1 text-[11px] font-bold cursor-pointer ${
                    !sorterMode && viewMode === "notes_page" ? "bg-[#0B1F3A] text-white" : "text-zinc-600"
                  }`}
                >
                  Notes Page
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowGuides((g) => !g)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold cursor-pointer ${
                  showGuides ? "bg-[#C84B28] text-white" : "border border-[#E7E2DA] bg-white"
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                Guides &amp; Grid
              </button>

              <select
                aria-label="Slide color mode"
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value as any)}
                className="rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2 py-1 font-bold cursor-pointer"
              >
                <option value="color">Color Mode</option>
                <option value="grayscale">Grayscale Preview</option>
                <option value="contrast">High Contrast</option>
              </select>

              <div className="inline-flex items-center gap-1">
                {([85, 100] as const).map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setStageZoomPct(pct)}
                    className={`rounded-lg px-2 py-1 font-bold cursor-pointer ${
                      stageZoomPct === pct ? "bg-[#0B1F3A] text-white" : "border border-[#E7E2DA] bg-white"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Optional Footer Label Strip */}
        {showFooterEditor && (
          <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-[#FAF7F2] dark:bg-zinc-900 border-b border-[#E7E2DA] text-xs">
            <span className="font-bold text-zinc-600">Deck Footer Label:</span>
            <input
              type="text"
              value={activeDeck?.footerText || ""}
              onChange={(e) =>
                updateActiveDeck((d) => ({ ...d, footerText: e.target.value }), false)
              }
              placeholder="e.g. ConnectLn Confidential · Q4 Review"
              className="flex-1 min-w-[200px] rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-950 px-2.5 py-1 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowFooterEditor(false)}
              className="text-zinc-500 hover:text-zinc-800 cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

        {/* Active Teleprompter & Narration Bar */}
        {(showTeleprompter || isRecordingAudio || recordedAudioUrl) && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-[#0B1F3A] text-white text-xs">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 mr-2">
                {isRecordingAudio ? "● RECORDING NARRATION" : "TELEPROMPTER NOTES"}:
              </span>
              <span className="text-slate-100">
                {activeSlide.notes?.trim() || "No speaker notes yet — use Noctis → Speaker Notes to generate talking points."}
              </span>
            </div>
            {recordedAudioUrl && (
              <audio controls src={recordedAudioUrl} className="h-7 max-w-[220px]" />
            )}
          </div>
        )}

        {/* Optional Find & Replace Bar */}
        {showFindBar && (
          <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-orange-50/70 dark:bg-zinc-800 border-b border-[#E7E2DA] text-xs">
            <input type="text" value={findTerm} onChange={(e) => setFindTerm(e.target.value)} placeholder="Find across all slides..." className="rounded-lg border px-2.5 py-1 bg-white dark:bg-zinc-900" />
            <input type="text" value={replaceTerm} onChange={(e) => setReplaceTerm(e.target.value)} placeholder="Replace with..." className="rounded-lg border px-2.5 py-1 bg-white dark:bg-zinc-900" />
            <button type="button" onClick={handleFindReplaceDeck} className="rounded-lg bg-[#C84B28] text-white px-3 py-1 font-bold cursor-pointer">Replace Across Deck</button>
            <button type="button" onClick={() => setShowFindBar(false)} className="ml-auto p-1 cursor-pointer"><X className="h-4 w-4" /></button>
          </div>
        )}

        {/* Stage Area: Slide Sorter Grid OR Editable Canvas + Optional Comments Drawer */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {sorterMode ? (
            <div className="flex-1 overflow-y-auto bg-[#EFECE6] dark:bg-zinc-950 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-extrabold text-[#0B1F3A] dark:text-white">
                  Slide Sorter Grid — Click any slide to edit
                </h2>
                <button type="button" onClick={() => setSorterMode(false)} className="rounded-xl bg-[#0B1F3A] text-white px-3 py-1.5 text-xs font-bold cursor-pointer">Back to Slide View</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {activeDeck?.slides.map((s, idx) => (
                  <div
                    key={s.id}
                    onClick={() => { setActiveSlideIndex(idx); setSorterMode(false) }}
                    className={`rounded-xl border p-3 cursor-pointer bg-white dark:bg-zinc-900 space-y-2 ${
                      idx === safeSlideIndex ? "border-[#C84B28] ring-2 ring-[#C84B28]/25" : "border-[#E7E2DA]"
                    }`}
                  >
                    <div
                      style={{ backgroundColor: s.customBgHex || theme.bgHex, color: theme.textHex }}
                      className="aspect-[16/9] rounded-lg p-3 flex flex-col justify-between border border-black/10"
                    >
                      <p style={{ color: theme.primaryHex }} className="text-xs font-extrabold line-clamp-2">{s.title}</p>
                      <p style={{ color: theme.mutedHex }} className="text-[10px] line-clamp-2">{s.subtitle || s.bullets?.[0] || ""}</p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span>Slide {idx + 1}</span>
                      <span className="text-zinc-400 capitalize">{s.layout.replace("_", " ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : viewMode === "outline" ? (
            <div className="flex-1 overflow-y-auto bg-[#EFECE6] dark:bg-zinc-950 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-[#0B1F3A] dark:text-white flex items-center gap-1.5">
                  <ListTree className="h-4 w-4 text-[#C84B28]" />
                  Outline View — Edit Slide Structure ({activeDeck?.slides.length || 0} Slides)
                </h2>
                <button
                  type="button"
                  onClick={() => setViewMode("normal")}
                  className="rounded-xl bg-[#0B1F3A] text-white px-3 py-1.5 text-xs font-bold cursor-pointer"
                >
                  Back to Normal Slide
                </button>
              </div>
              <div className="space-y-2.5">
                {activeDeck?.slides.map((s, idx) => (
                  <div
                    key={s.id}
                    className="rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-extrabold text-[#C84B28]">
                        Slide {idx + 1} · {s.layout.replace("_", " ").toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSlideIndex(idx)
                          setViewMode("normal")
                        }}
                        className="text-[11px] font-bold text-[#0B5CAD] hover:underline cursor-pointer"
                      >
                        Focus Canvas →
                      </button>
                    </div>
                    <input
                      type="text"
                      value={s.title}
                      onChange={(e) =>
                        updateActiveDeck((d) => ({
                          ...d,
                          slides: d.slides.map((x, i) =>
                            i === idx ? { ...x, title: e.target.value } : x
                          ),
                        }))
                      }
                      className="w-full rounded-lg border border-[#E7E2DA] bg-[#FAF7F2]/60 dark:bg-zinc-950 px-2.5 py-1 text-xs font-extrabold outline-none focus:border-[#C84B28]"
                    />
                    {s.bullets && s.bullets.length > 0 && (
                      <ul className="pl-4 list-disc text-xs text-zinc-600 dark:text-zinc-300 space-y-0.5">
                        {s.bullets.map((b, bi) => (
                          <li key={bi}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-[#EFECE6] dark:bg-zinc-950 p-4 sm:p-7 flex flex-col items-center justify-center">
              <div
                key={`${activeSlide.id}_${transitionPulseKey}`}
                style={{
                  backgroundColor: effectiveSlideBg,
                  color: theme.textHex,
                  fontFamily: activeFontFamily,
                  transform: motionPulseActive
                    ? motionPreset === "zoom_pop"
                      ? "scale(1.015)"
                      : motionPreset === "rise_up"
                      ? "translateY(-4px)"
                      : undefined
                    : undefined,
                  transition: `all ${motionDurationMs}ms ease`,
                  ...transitionAnimStyle,
                }}
                className={`relative w-full max-w-[920px] min-h-[480px] ${aspectClass} rounded-2xl border border-black/15 shadow-[0_24px_60px_rgba(11,31,58,0.16)] p-6 sm:p-10 flex flex-col justify-between gap-4 overflow-hidden ${
                  colorMode === "grayscale"
                    ? "grayscale"
                    : colorMode === "contrast"
                    ? "contrast-125"
                    : ""
                } ${stageZoomPct === 85 ? "scale-[0.88] origin-center" : ""}`}
              >
                {showAccentBar && (
                  <div
                    aria-hidden="true"
                    style={{ backgroundColor: theme.accentHex }}
                    className="absolute left-0 right-0 top-0 h-1.5"
                  />
                )}
                {showGuides && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-0"
                  >
                    <div className="absolute left-1/2 top-0 bottom-0 w-px border-l border-dashed border-sky-400/50" />
                    <div className="absolute top-1/2 left-0 right-0 h-px border-t border-dashed border-sky-400/50" />
                  </div>
                )}
                {/* Title & Subtitle */}
                <div className={activeSlide.layout === "cover" || activeSlide.layout === "section" ? "text-center pt-4" : ""}>
                  <input
                    type="text"
                    aria-label="Slide title"
                    value={activeSlide.title}
                    onChange={(e) => updateActiveSlide({ title: e.target.value })}
                    style={{
                      color: theme.primaryHex,
                      textAlign:
                        activeSlide.titleAlign ||
                        (activeSlide.layout === "cover" || activeSlide.layout === "section" ? "center" : "left"),
                    }}
                    className={`w-full bg-transparent outline-none border border-transparent hover:border-white/25 focus:border-[#38BDF8] rounded-lg px-2 py-1 font-black tracking-tight ${
                      activeSlide.layout === "cover" || activeSlide.layout === "section"
                        ? "text-2xl sm:text-4xl"
                        : "text-xl sm:text-3xl"
                    }`}
                  />
                  <input
                    type="text"
                    aria-label="Slide subtitle"
                    value={activeSlide.subtitle || ""}
                    onChange={(e) => updateActiveSlide({ subtitle: e.target.value })}
                    placeholder="Add slide subtitle or context..."
                    style={{
                      color: theme.mutedHex,
                      textAlign:
                        activeSlide.titleAlign ||
                        (activeSlide.layout === "cover" || activeSlide.layout === "section" ? "center" : "left"),
                    }}
                    className="w-full bg-transparent outline-none border border-transparent hover:border-white/20 focus:border-[#38BDF8] rounded-lg px-2 py-1 text-sm sm:text-base mt-1"
                  />
                </div>

                {/* Editable Layout Bodies */}
                {activeSlide.layout === "two_column" ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(
                      [
                        { titleKey: "leftTitle" as const, bulletsKey: "leftBullets" as const, titleVal: activeSlide.leftTitle || "", bulletsVal: activeSlide.leftBullets || [] },
                        { titleKey: "rightTitle" as const, bulletsKey: "rightBullets" as const, titleVal: activeSlide.rightTitle || "", bulletsVal: activeSlide.rightBullets || [] },
                      ] as const
                    ).map((col) => (
                      <div key={col.titleKey} style={{ backgroundColor: theme.surfaceHex }} className="rounded-xl p-4 border border-white/15 space-y-2 flex flex-col">
                        <input
                          type="text"
                          value={col.titleVal}
                          onChange={(e) => updateActiveSlide({ [col.titleKey]: e.target.value })}
                          style={{ color: theme.accentHex }}
                          className="bg-transparent font-extrabold text-base outline-none border-b border-white/15 pb-1"
                        />
                        <div className="space-y-1.5 flex-1">
                          {col.bulletsVal.map((b, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-2">
                              <span style={{ color: theme.accentHex }}>•</span>
                              <input
                                type="text"
                                value={b}
                                onChange={(e) => {
                                  const next = [...col.bulletsVal]
                                  next[bIdx] = e.target.value
                                  updateActiveSlide({ [col.bulletsKey]: next })
                                }}
                                className="flex-1 bg-transparent text-sm outline-none border-b border-transparent focus:border-white/30"
                              />
                              <button type="button" onClick={() => updateActiveSlide({ [col.bulletsKey]: col.bulletsVal.filter((_, i) => i !== bIdx) })} className="opacity-50 hover:opacity-100 cursor-pointer"><X className="h-3 w-3" /></button>
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={() => updateActiveSlide({ [col.bulletsKey]: [...col.bulletsVal, "New column point"] })} style={{ color: theme.accentHex }} className="text-xs font-bold text-left cursor-pointer">+ Add item</button>
                      </div>
                    ))}
                  </div>
                ) : activeSlide.layout === "metrics" ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    {(activeSlide.metrics || []).map((m, mIdx) => (
                      <div key={mIdx} style={{ backgroundColor: theme.surfaceHex }} className="rounded-xl p-4 border border-white/15 space-y-2 text-center">
                        <input type="text" value={m.value} onChange={(e) => { const n = [...(activeSlide.metrics || [])]; n[mIdx] = { ...m, value: e.target.value }; updateActiveSlide({ metrics: n }) }} style={{ color: theme.accentHex }} className="w-full bg-transparent text-center text-3xl font-black outline-none" />
                        <input type="text" value={m.label} onChange={(e) => { const n = [...(activeSlide.metrics || [])]; n[mIdx] = { ...m, label: e.target.value }; updateActiveSlide({ metrics: n }) }} className="w-full bg-transparent text-center text-sm font-bold outline-none" />
                        <input type="text" value={m.delta || ""} placeholder="Benchmark note" onChange={(e) => { const n = [...(activeSlide.metrics || [])]; n[mIdx] = { ...m, delta: e.target.value }; updateActiveSlide({ metrics: n }) }} style={{ color: theme.mutedHex }} className="w-full bg-transparent text-center text-xs outline-none" />
                      </div>
                    ))}
                  </div>
                ) : activeSlide.layout === "quote" ? (
                  <div style={{ backgroundColor: theme.surfaceHex }} className="flex-1 rounded-2xl p-6 border border-white/15 flex flex-col justify-center gap-3">
                    <textarea rows={3} value={activeSlide.quote || ""} onChange={(e) => updateActiveSlide({ quote: e.target.value })} placeholder="Enter featured executive quote..." className="w-full bg-transparent text-center text-xl sm:text-2xl italic font-semibold outline-none resize-none" />
                    <input type="text" value={activeSlide.quoteAuthor || ""} onChange={(e) => updateActiveSlide({ quoteAuthor: e.target.value })} placeholder="Attribution / Speaker" style={{ color: theme.accentHex }} className="w-full bg-transparent text-center text-sm font-extrabold outline-none" />
                  </div>
                ) : activeSlide.layout === "table" ? (
                  <div className="flex-1 overflow-auto space-y-2">
                    <table className="w-full border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr>
                          {(activeSlide.tableData?.headers || ["Column 1", "Column 2"]).map((h, cIdx) => (
                            <th key={cIdx} style={{ backgroundColor: theme.surfaceHex, color: theme.accentHex }} className="border border-white/20 p-2">
                              <input
                                type="text"
                                value={h}
                                onChange={(e) => {
                                  const tbl = activeSlide.tableData || { headers: ["Col 1", "Col 2"], rows: [["A", "B"]] }
                                  const nextH = [...tbl.headers]
                                  nextH[cIdx] = e.target.value
                                  updateActiveSlide({ tableData: { ...tbl, headers: nextH } })
                                }}
                                className="w-full bg-transparent font-extrabold outline-none"
                              />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(activeSlide.tableData?.rows || []).map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="border border-white/15 p-2">
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) => {
                                    const tbl = activeSlide.tableData!
                                    const nextRows = tbl.rows.map((rr, ri) =>
                                      ri === rIdx ? rr.map((cc, ci) => (ci === cIdx ? e.target.value : cc)) : rr
                                    )
                                    updateActiveSlide({ tableData: { ...tbl, rows: nextRows } })
                                  }}
                                  className="w-full bg-transparent outline-none"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button
                      type="button"
                      onClick={() => {
                        const tbl = activeSlide.tableData || { headers: ["Phase", "Owner"], rows: [] }
                        updateActiveSlide({
                          tableData: {
                            ...tbl,
                            rows: [...tbl.rows, tbl.headers.map(() => "New Entry")],
                          },
                        })
                      }}
                      style={{ color: theme.accentHex }}
                      className="text-xs font-bold cursor-pointer"
                    >
                      + Add Table Row
                    </button>
                  </div>
                ) : activeSlide.layout === "chart" ? (
                  <div style={{ backgroundColor: theme.surfaceHex }} className="flex-1 rounded-xl p-4 border border-white/15 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={activeSlide.chartData?.title || "Slide Chart"}
                        onChange={(e) =>
                          updateActiveSlide({
                            chartData: { ...(activeSlide.chartData || { kind: "bar", title: "", items: [] }), title: e.target.value },
                          })
                        }
                        style={{ color: theme.accentHex }}
                        className="bg-transparent font-extrabold text-sm outline-none flex-1"
                      />
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="space-y-1.5">
                        {(activeSlide.chartData?.items || []).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => {
                                const cd = activeSlide.chartData!
                                updateActiveSlide({
                                  chartData: {
                                    ...cd,
                                    items: cd.items.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)),
                                  },
                                })
                              }}
                              className="flex-1 rounded bg-white/10 px-2 py-1 outline-none"
                            />
                            <input
                              type="number"
                              value={item.value}
                              onChange={(e) => {
                                const cd = activeSlide.chartData!
                                updateActiveSlide({
                                  chartData: {
                                    ...cd,
                                    items: cd.items.map((x, i) => (i === idx ? { ...x, value: Number(e.target.value) || 0 } : x)),
                                  },
                                })
                              }}
                              className="w-20 rounded bg-white/10 px-2 py-1 font-mono outline-none"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-end gap-3 h-36 pt-2">
                        {(activeSlide.chartData?.items || []).map((item, idx) => {
                          const maxV = Math.max(1, ...(activeSlide.chartData?.items || []).map((x) => x.value))
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                              <span className="text-[10px] font-mono">{item.value}</span>
                              <div style={{ height: `${Math.max(10, Math.round((item.value / maxV) * 100))}%`, backgroundColor: theme.accentHex }} className="w-full max-w-[40px] rounded-t" />
                              <span className="text-[10px] font-bold truncate max-w-full">{item.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : activeSlide.layout === "visual_split" ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                    <div className="space-y-2">
                      {(activeSlide.bullets || []).map((b, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2">
                          <span style={{ color: theme.accentHex }} className="font-bold">•</span>
                          <input type="text" value={b} onChange={(e) => { const next = [...(activeSlide.bullets || [])]; next[bIdx] = e.target.value; updateActiveSlide({ bullets: next }) }} className="flex-1 bg-transparent text-sm sm:text-base outline-none border-b border-white/15 py-1" />
                        </div>
                      ))}
                      <button type="button" onClick={() => updateActiveSlide({ bullets: [...(activeSlide.bullets || []), "New visual point"] })} style={{ color: theme.accentHex }} className="text-xs font-bold cursor-pointer">+ Add talking point</button>
                    </div>
                    <div style={{ backgroundColor: theme.surfaceHex }} className="rounded-xl border border-dashed border-white/25 aspect-video flex flex-col items-center justify-center overflow-hidden p-3">
                      {activeSlide.imageUrl ? (
                        <img src={activeSlide.imageUrl} alt={activeSlide.title} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <button type="button" onClick={() => slideImageInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 text-xs font-bold cursor-pointer"><ImagePlus className="h-4 w-4" />Upload Slide Visual</button>
                      )}
                    </div>
                  </div>
                ) : activeSlide.layout === "blank" ? (
                  <div className="flex-1 flex flex-col justify-center gap-2">
                    {(activeSlide.elements || []).length === 0 && (
                      <p style={{ color: theme.mutedHex }} className="text-center text-sm">
                        Open the <strong>Insert</strong> ribbon tab to add Text Boxes, Callouts, Badges, or Tables.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center space-y-2">
                    {(activeSlide.bullets || []).map((b, bIdx) => (
                      <div key={bIdx} style={{ backgroundColor: theme.surfaceHex }} className="flex items-center gap-3 rounded-xl px-4 py-2.5 border border-white/10">
                        <span style={{ color: theme.accentHex }} className="font-black text-base">•</span>
                        <input type="text" value={b} onChange={(e) => { const next = [...(activeSlide.bullets || [])]; next[bIdx] = e.target.value; updateActiveSlide({ bullets: next }) }} className="flex-1 bg-transparent text-sm sm:text-base outline-none" />
                        <button type="button" onClick={() => updateActiveSlide({ bullets: (activeSlide.bullets || []).filter((_, i) => i !== bIdx) })} className="opacity-50 hover:opacity-100 cursor-pointer"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => updateActiveSlide({ bullets: [...(activeSlide.bullets || []), "Add talking point"] })} style={{ color: theme.accentHex }} className="text-xs font-bold text-left px-1 cursor-pointer">+ Add bullet point</button>
                  </div>
                )}

                {/* Inserted Freeform Callouts / Textboxes / Badges */}
                {activeSlide.elements && activeSlide.elements.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {activeSlide.elements.map((el) => (
                      <div key={el.id} style={{ backgroundColor: el.bgHex, color: el.textHex }} className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold border border-white/20">
                        <input
                          type="text"
                          value={el.text}
                          onChange={(e) =>
                            updateActiveSlide({
                              elements: activeSlide.elements?.map((x) => (x.id === el.id ? { ...x, text: e.target.value } : x)),
                            })
                          }
                          className="bg-transparent outline-none min-w-[160px]"
                        />
                        <button type="button" onClick={() => updateActiveSlide({ elements: activeSlide.elements?.filter((x) => x.id !== el.id) })} className="opacity-60 hover:opacity-100 cursor-pointer"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Stamp */}
                <div className="flex items-center justify-between text-[11px] opacity-75 pt-2 border-t border-white/10">
                  <span>{activeDeck?.footerText || `ConnectLn Slides · ${theme.name}`}</span>
                  {activeDeck?.showSlideNumbers !== false && (
                    <span>Slide {safeSlideIndex + 1} of {activeDeck?.slides.length || 1}</span>
                  )}
                </div>
              </div>

              {showNotesDrawer && (
                <div className="w-full max-w-[920px] mt-4 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Presenter Speaker Notes — Slide {safeSlideIndex + 1}</span>
                    <button type="button" onClick={() => setShowNotesDrawer(false)} className="text-xs text-zinc-400 cursor-pointer">Hide</button>
                  </div>
                  <textarea
                    rows={2}
                    value={activeSlide.notes || ""}
                    onChange={(e) => updateActiveSlide({ notes: e.target.value })}
                    placeholder="Add talking cues, reminders, or timing notes for Present Mode & Notes Print..."
                    className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-[#FAF7F2]/60 dark:bg-zinc-950 px-3 py-2 text-xs outline-none focus:border-[#C84B28]"
                  />
                </div>
              )}
            </div>
          )}

          {/* Optional Slide Comments Drawer */}
          {showCommentsDrawer && (
            <aside className="w-full sm:w-[270px] shrink-0 border-l border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 p-3 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-2">
                <span className="text-xs font-extrabold">Slide {safeSlideIndex + 1} Comments</span>
                <button type="button" onClick={() => setShowCommentsDrawer(false)} className="p-1 cursor-pointer"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-1.5">
                <textarea rows={2} value={commentDraft} onChange={(e) => setCommentDraft(e.target.value)} placeholder="Add feedback on this slide..." className="w-full rounded-xl border bg-white dark:bg-zinc-900 p-2 text-xs" />
                <button type="button" onClick={handleAddSlideComment} className="w-full rounded-xl bg-[#C84B28] text-white py-1.5 text-xs font-bold cursor-pointer">Post Comment</button>
              </div>
              <div className="space-y-2 overflow-y-auto">
                {(activeSlide.comments || []).map((c) => (
                  <div key={c.id} className="rounded-xl border bg-white dark:bg-zinc-900 p-2.5 text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>{c.author}</span>
                      <button type="button" onClick={() => updateActiveSlide({ comments: activeSlide.comments?.filter((x) => x.id !== c.id) })} className="text-rose-500 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <p>{c.text}</p>
                  </div>
                ))}
              </div>
            </aside>
          )}

          {showNoctisPanel && activeDeck && (
            <ConnectLnSlidesNoctisPanel
              deckTitle={activeDeck.title}
              activeSlide={activeSlide}
              slideIndex={safeSlideIndex}
              totalSlides={activeDeck.slides.length}
              user={user}
              initialPrompt={noctisInitialPrompt}
              initialMode={noctisInitialMode}
              onClose={() => setShowNoctisPanel(false)}
              onAddGeneratedSlide={(gen) => {
                const newSl: StudioSlideItem = {
                  id: `sl_${Date.now()}`,
                  layout: "bullets",
                  title: gen.title,
                  subtitle: gen.subtitle,
                  bullets: gen.bullets,
                  notes: gen.notes,
                }
                updateActiveDeck((d) => ({ ...d, slides: [...d.slides, newSl] }))
                setActiveSlideIndex(activeDeck.slides.length)
                setViewMode("normal")
                setSorterMode(false)
              }}
              onApplyNotes={(notes) => updateActiveSlide({ notes }, false)}
              onApplyBullets={(bullets) => updateActiveSlide({ bullets }, true)}
              onNotify={notify}
            />
          )}
        </div>

        {/* Bottom Navigation Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 text-xs">
          <div className="flex items-center gap-2">
            <button type="button" disabled={safeSlideIndex === 0} onClick={() => setActiveSlideIndex((i) => Math.max(0, i - 1))} className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2.5 py-1 font-semibold disabled:opacity-40 cursor-pointer"><ChevronLeft className="h-3.5 w-3.5" />Prev</button>
            <span className="font-bold">Slide {safeSlideIndex + 1} / {activeDeck?.slides.length || 1}</span>
            <button type="button" disabled={safeSlideIndex >= (activeDeck?.slides.length || 1) - 1} onClick={() => setActiveSlideIndex((i) => Math.min((activeDeck?.slides.length || 1) - 1, i + 1))} className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] bg-white dark:bg-zinc-900 px-2.5 py-1 font-semibold disabled:opacity-40 cursor-pointer">Next<ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSorterMode((m) => !m)} className="text-xs font-bold text-zinc-600 hover:text-[#C84B28] cursor-pointer">Slide Sorter</button>
            <button type="button" onClick={() => { setPresenterViewMode(false); setIsPresenting(true) }} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0067B8] hover:underline cursor-pointer"><Maximize2 className="h-3.5 w-3.5" />Full-Screen Present Mode</button>
          </div>
        </div>
      </div>

      {/* Full-Screen Live Present Mode OR Presenter View */}
      {isPresenting && (
        <div
          role="dialog"
          aria-label="ConnectLn Slides Present Mode"
          className="fixed inset-0 z-[120] bg-zinc-950 flex flex-col items-center justify-between p-4 sm:p-6"
        >
          <div className="w-full max-w-6xl flex items-center justify-between gap-3 text-xs text-zinc-300">
            <span className="font-bold">
              {activeDeck?.title} · {presenterViewMode ? "Presenter View" : "ConnectLn Slides Presenter"} · ⏱ {formatTimer(presentSeconds)}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPresenterViewMode((v) => !v)}
                className="inline-flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 font-bold text-white cursor-pointer"
              >
                <MonitorPlay className="h-3.5 w-3.5" />
                {presenterViewMode ? "Single Screen" : "Presenter View"}
              </button>
              <button
                type="button"
                onClick={() => setPenActive((p) => !p)}
                className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 font-bold cursor-pointer ${
                  penActive ? "bg-rose-600 text-white" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                <PenLine className="h-3.5 w-3.5" />
                {penActive ? "Pen ON" : "Annotation Pen"}
              </button>
              {inkStrokes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setInkStrokes([])}
                  className="inline-flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 px-2.5 py-1.5 font-bold text-white cursor-pointer"
                >
                  <Eraser className="h-3.5 w-3.5" />
                  Clear Ink
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsPresenting(false)
                  setPresenterViewMode(false)
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 font-bold text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
                Exit Present (Esc)
              </button>
            </div>
          </div>

          {presenterViewMode ? (
            <div className="w-full max-w-6xl flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center py-3 min-h-0">
              <div
                style={{ backgroundColor: effectiveSlideBg, color: theme.textHex }}
                className="lg:col-span-8 aspect-[16/9] max-h-[68vh] w-full rounded-2xl p-6 sm:p-10 border border-white/15 flex flex-col justify-between shadow-2xl"
              >
                {activeSlide.layout !== "cover" && activeSlide.layout !== "section" && (
                  <div>
                    <h2 style={{ color: theme.primaryHex }} className="text-2xl sm:text-3xl font-black">{activeSlide.title}</h2>
                    {activeSlide.subtitle && <p style={{ color: theme.mutedHex }} className="text-sm sm:text-base mt-1">{activeSlide.subtitle}</p>}
                  </div>
                )}
                {renderSlidePreviewVisual(activeSlide, revealStep)}
                <div className="flex justify-between text-xs opacity-70 pt-2 border-t border-white/10">
                  <span>Current Slide</span>
                  <span>{safeSlideIndex + 1} / {activeDeck?.slides.length || 1}</span>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-3 h-full max-h-[68vh]">
                <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-3 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Next Slide Preview
                  </span>
                  {activeDeck?.slides[safeSlideIndex + 1] ? (
                    <div
                      style={{
                        backgroundColor: activeDeck.slides[safeSlideIndex + 1].customBgHex || theme.bgHex,
                        color: theme.textHex,
                      }}
                      className="aspect-[16/9] rounded-xl p-4 flex flex-col justify-between border border-white/10"
                    >
                      <p style={{ color: theme.primaryHex }} className="text-sm font-extrabold line-clamp-2">
                        {activeDeck.slides[safeSlideIndex + 1].title}
                      </p>
                      <p style={{ color: theme.mutedHex }} className="text-xs line-clamp-2">
                        {activeDeck.slides[safeSlideIndex + 1].subtitle ||
                          activeDeck.slides[safeSlideIndex + 1].bullets?.[0] ||
                          ""}
                      </p>
                    </div>
                  ) : (
                    <div className="aspect-[16/9] rounded-xl border border-dashed border-zinc-700 flex items-center justify-center text-xs text-zinc-500">
                      End of Presentation
                    </div>
                  )}
                </div>

                <div className="flex-1 rounded-2xl border border-zinc-700 bg-zinc-900 p-4 flex flex-col gap-2 overflow-y-auto">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    Speaker Notes
                  </span>
                  <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {activeSlide.notes || "No speaker notes recorded for this slide."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              onPointerDown={(e) => {
                if (!penActive) return
                const rect = e.currentTarget.getBoundingClientRect()
                const pt = { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 }
                setDrawingNow(true)
                setInkStrokes((prev) => [...prev, [pt]])
              }}
              onPointerMove={(e) => {
                if (!penActive || !drawingNow) return
                const rect = e.currentTarget.getBoundingClientRect()
                const pt = { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 }
                setInkStrokes((prev) => prev.map((st, idx) => (idx === prev.length - 1 ? [...st, pt] : st)))
              }}
              onPointerUp={() => setDrawingNow(false)}
              style={{ backgroundColor: effectiveSlideBg, color: theme.textHex }}
              className={`relative w-full max-w-6xl ${aspectClass} max-h-[75vh] rounded-2xl p-8 sm:p-14 shadow-2xl border border-white/15 flex flex-col justify-between ${
                penActive ? "cursor-crosshair" : ""
              }`}
            >
              {/* Ink Overlay */}
              {inkStrokes.length > 0 && (
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 w-full h-full z-20">
                  {inkStrokes.map((st, sIdx) => (
                    <polyline
                      key={sIdx}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="0.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={st.map((p) => `${p.x},${p.y}`).join(" ")}
                    />
                  ))}
                </svg>
              )}

              {activeSlide.layout !== "cover" && activeSlide.layout !== "section" && (
                <div>
                  <h2 style={{ color: theme.primaryHex }} className="text-2xl sm:text-4xl font-black tracking-tight">{activeSlide.title}</h2>
                  {activeSlide.subtitle && <p style={{ color: theme.mutedHex }} className="text-base sm:text-xl mt-1">{activeSlide.subtitle}</p>}
                </div>
              )}

              {renderSlidePreviewVisual(activeSlide, revealStep)}

              <div className="flex items-center justify-between text-xs opacity-70 pt-3 border-t border-white/10">
                <span>{activeDeck?.title}</span>
                <span>{safeSlideIndex + 1} / {activeDeck?.slides.length || 1}</span>
              </div>
            </div>
          )}

          <div className="w-full max-w-6xl space-y-2">
            {!presenterViewMode && showPresentNotes && activeSlide.notes && (
              <div className="rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2 text-xs text-zinc-200">
                <strong>Speaker Notes:</strong> {activeSlide.notes}
              </div>
            )}
            <div className="flex items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-2">
                <button type="button" disabled={safeSlideIndex === 0} onClick={() => setActiveSlideIndex((i) => Math.max(0, i - 1))} className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-35 px-4 py-2 text-xs font-bold cursor-pointer"><ArrowLeft className="h-4 w-4" />Previous</button>
                <button type="button" disabled={safeSlideIndex >= (activeDeck?.slides.length || 1) - 1} onClick={() => setActiveSlideIndex((i) => Math.min((activeDeck?.slides.length || 1) - 1, i + 1))} className="inline-flex items-center gap-1.5 rounded-xl bg-[#0067B8] hover:bg-[#00559b] disabled:opacity-35 px-4 py-2 text-xs font-bold cursor-pointer">Next<ArrowRight className="h-4 w-4" /></button>
              </div>
              <div className="flex-1 max-w-md h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div style={{ width: `${((safeSlideIndex + 1) / Math.max(1, activeDeck?.slides.length || 1)) * 100}%` }} className="h-full bg-[#38BDF8] transition-all" />
              </div>
              <button type="button" onClick={() => setShowPresentNotes((v) => !v)} className="rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold cursor-pointer">
                {showPresentNotes ? "Hide Notes" : "Show Notes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deck Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#0B1F3A] dark:text-white flex items-center gap-2">
                  <Presentation className="h-4 w-4 text-[#C84B28]" />
                  Choose a ConnectLn Slides Template
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Launch a themed widescreen presentation or start with clean slides.
                </p>
              </div>
              <button type="button" onClick={() => setShowTemplatesModal(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
              {DECK_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleCreateDeckFromTemplate(tpl)}
                  className="rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/60 dark:bg-zinc-950/60 hover:border-[#C84B28] p-4 text-left transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold text-[#0B1F3A] dark:text-white">{tpl.name}</span>
                    <span className="rounded-full bg-orange-100 dark:bg-orange-900/50 px-2 py-0.5 text-[10px] font-bold text-[#C84B28] dark:text-orange-300">{tpl.category}</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{tpl.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Print Preview & Handouts Studio Modal */}
      {activeDeck && (
        <ConnectLnStudioPrintModal
          mode="slides"
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          title={activeDeck.title}
          slides={activeDeck.slides}
          currentSlideIndex={safeSlideIndex}
          theme={theme}
          onDownloadOpenXml={() => handleExport("pptx")}
        />
      )}

      {/* ConnectLn Slides Studio Hub Drawer */}
      {showHubDrawer && (
        <ConnectLnStudioHubDrawer
          app="slides"
          user={user}
          activeTitle={activeDeck?.title || "Untitled Deck"}
          activeStatsSummary={`${activeDeck?.slides.length || 1} slide(s) · Theme: ${theme.name}`}
          items={decks.map((d) => ({
            id: d.id,
            title: d.title,
            category: d.category,
            updatedAt: d.updatedAt,
            starred: d.starred,
          }))}
          templates={DECK_TEMPLATES.map((t) => ({
            id: t.id,
            name: t.name,
            category: t.category,
            description: t.description,
          }))}
          onClose={() => setShowHubDrawer(false)}
          onSelectItem={(id) => {
            setActiveDeckId(id)
            setActiveSlideIndex(0)
            setSidebarTab("slides")
          }}
          onToggleStar={(id) =>
            setDecks((prev) =>
              prev.map((d) => (d.id === id ? { ...d, starred: !d.starred } : d))
            )
          }
          onCreateBlank={() => {
            const blank = DECK_TEMPLATES[0]
            if (blank) handleCreateDeckFromTemplate(blank)
          }}
          onCreateFromTemplate={(tid) => {
            if (tid === "tour_slides_quick") {
              const now = new Date().toISOString()
              const tourDeck: StudioDeckRecord = {
                id: `deck_tour_${Date.now()}`,
                title: "ConnectLn Slides Quick Tour",
                category: "Guided Tour",
                themeId: "sandstone-editorial",
                aspectRatio: "16:9",
                showSlideNumbers: true,
                createdAt: now,
                updatedAt: now,
                authorName: user.name || "ConnectLn Member",
                slides: [
                  {
                    id: `sl_${Date.now()}_1`,
                    layout: "cover",
                    title: "Welcome to ConnectLn Slides 360",
                    subtitle: "Design crisp executive decks with Presenter View & 16:9 exports",
                    bullets: ["Presenter Timer", "Slide Sorter", ".pptx OpenXML"],
                    notes: "Welcome your audience and introduce key metrics cleanly.",
                  },
                  {
                    id: `sl_${Date.now()}_2`,
                    layout: "bullets",
                    title: "Three Ways to Impress",
                    bullets: [
                      "Switch full ConnectLn color themes under Design",
                      "Use Slide Sorter Grid to reorder narrative flow fast",
                      "Print 4-up Handouts or export standard .pptx anytime",
                    ],
                  },
                ],
              }
              setDecks((prev) => [tourDeck, ...prev])
              setActiveDeckId(tourDeck.id)
              setActiveSlideIndex(0)
              setSidebarTab("slides")
              notify("Opened ConnectLn Slides Quick Tour")
              return
            }
            const tpl = DECK_TEMPLATES.find((t) => t.id === tid)
            if (tpl) handleCreateDeckFromTemplate(tpl)
          }}
          onTriggerImport={() => setShowTemplatesModal(true)}
          onTriggerPrint={() => setShowPrintModal(true)}
          onTriggerExportPrimary={() => handleExport("pptx")}
        />
      )}

      {/* Deck Statistics Modal */}
      {showStatsModal && (
        <div
          role="dialog"
          aria-label="ConnectLn Deck Statistics"
          className="fixed inset-0 z-[105] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] dark:border-zinc-800 pb-2">
              <h3 className="text-sm font-extrabold text-[#0B1F3A] dark:text-white">
                Deck Statistics
              </h3>
              <button type="button" aria-label="Close Deck Statistics" onClick={() => setShowStatsModal(false)} className="p-1 rounded cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-1.5 text-xs">
              {[
                ["Total Slides", deckStats.slideCount],
                ["Hidden Slides", deckStats.hiddenCount],
                ["Total Words", deckStats.totalWords],
                ["Estimated Present Time", `${deckStats.estimatedMinutes} min`],
                ["Speaker Notes Coverage", `${deckStats.notesCoveragePct}%`],
                ["Slide Comments", deckStats.totalComments],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">{k}</span>
                  <strong className="text-[#0B1F3A] dark:text-white">{v}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Deck Accessibility Audit Modal */}
      {showA11yModal && (
        <div
          role="dialog"
          aria-label="ConnectLn Deck Accessibility Audit"
          className="fixed inset-0 z-[105] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#0B1F3A] dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Deck Accessibility Audit
                </h3>
                <p className="text-xs text-zinc-500">
                  Readiness score: <strong className="text-[#C84B28]">{deckA11yReport.score}%</strong>
                </p>
              </div>
              <button type="button" aria-label="Close Deck Accessibility Audit" onClick={() => setShowA11yModal(false)} className="p-1 rounded-lg hover:bg-zinc-100 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-2">
              {deckA11yReport.checks.map((chk) => (
                <div
                  key={chk.title}
                  className={`rounded-xl border p-3 text-xs space-y-1 ${
                    chk.status === "pass"
                      ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20"
                      : "border-amber-200 bg-amber-50/60 dark:bg-amber-950/20"
                  }`}
                >
                  <p className="font-extrabold text-[#0B1F3A] dark:text-white">
                    {chk.status === "pass" ? "PASS · " : "CHECK · "}
                    {chk.title}
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-300">{chk.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Slides Help & Quick Guide Modal */}
      {showHelpModal && (
        <div
          role="dialog"
          aria-label="ConnectLn Slides Help and Shortcuts"
          className="fixed inset-0 z-[105] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-extrabold text-[#0B1F3A] dark:text-white flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-[#C84B28]" />
                ConnectLn Slides Quick Guide &amp; Help
              </h3>
              <button type="button" aria-label="Close Slides Help" onClick={() => setShowHelpModal(false)} className="p-1 rounded-lg hover:bg-zinc-100 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-2 text-xs">
              {[
                ["Noctis Pill", "Generate new slides, speaker notes & translate bullets"],
                ["F5 / Esc", "Launch or exit Full-Screen Present Mode"],
                ["Insert → Visual Diagrams", "Drop 3-Step Process, KPI Strip, or Timeline callouts"],
                ["Record Tab", "Capture narration rehearsal with Teleprompter Notes"],
                ["View → Outline View", "Edit all slide titles & bullet structure in one tree"],
                ["Ctrl / Cmd + P", "Open 4-up Handouts & Speaker Notes Print Studio"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-2 rounded-xl bg-[#FAF7F2] dark:bg-zinc-950 px-3 py-2">
                  <kbd className="font-mono font-bold text-[#C84B28]">{k}</kbd>
                  <span className="text-zinc-600 dark:text-zinc-300 text-right">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E7E2DA] dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setShowHelpModal(false)
                  setShowHubDrawer(true)
                }}
                className="rounded-xl bg-[#0B1F3A] text-white px-3 py-1.5 text-xs font-bold cursor-pointer"
              >
                Open Studio Hub &amp; Tours
              </button>
              <Link
                href="/connectin-portal#download-app"
                className="text-xs font-extrabold text-[#C84B28] hover:underline"
              >
                Get ConnectLn Mobile App →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
