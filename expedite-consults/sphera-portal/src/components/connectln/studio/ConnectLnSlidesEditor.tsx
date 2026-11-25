"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FilePlus2,
  ImagePlus,
  LayoutTemplate,
  Maximize2,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Plus,
  Presentation,
  Printer,
  Search,
  Share2,
  Star,
  StickyNote,
  Trash2,
  X,
} from "lucide-react"
import type { UserProfile } from "@/lib/connectln-data"
import {
  buildPptxBytes,
  buildStandaloneHtmlDeck,
  downloadStudioFile,
  escapeHtml,
  type SlideThemePalette,
} from "@/lib/connectln-studio-export"
import {
  DECK_TEMPLATES,
  getSlideThemeById,
  loadStudioDecks,
  saveStudioDecks,
  STUDIO_SLIDE_THEMES,
  type DeckTemplateItem,
  type SlideLayoutType,
  type StudioDeckRecord,
  type StudioSlideItem,
} from "@/lib/connectln-studio-storage"
import type { StudioSharePayload } from "./ConnectLnDocsEditor"

interface ConnectLnSlidesEditorProps {
  user: UserProfile
  onShareToFeed?: (payload: StudioSharePayload) => void
}

const LAYOUT_OPTIONS: Array<{ id: SlideLayoutType; label: string }> = [
  { id: "cover", label: "Title Cover" },
  { id: "bullets", label: "Title + Bullets" },
  { id: "two_column", label: "Two Columns" },
  { id: "metrics", label: "KPI Metrics" },
  { id: "quote", label: "Quote & Takeaway" },
  { id: "visual_split", label: "Visual Split" },
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
  const [sidebarTab, setSidebarTab] = useState<"slides" | "decks">("slides")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [deckSearch, setDeckSearch] = useState("")
  const [showNotesDrawer, setShowNotesDrawer] = useState(false)
  const [showPresentNotes, setShowPresentNotes] = useState(false)
  const [isPresenting, setIsPresenting] = useState(false)
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [statusNotice, setStatusNotice] = useState<string | null>(null)
  const [savedLabel, setSavedLabel] = useState("Saved locally")

  const slideImageInputRef = useRef<HTMLInputElement>(null)

  const activeDeck = decks.find((d) => d.id === activeDeckId) || decks[0]
  const safeSlideIndex = Math.max(
    0,
    Math.min((activeDeck?.slides.length || 1) - 1, activeSlideIndex)
  )
  const activeSlide = activeDeck?.slides[safeSlideIndex] || createEmptySlide("cover")
  const theme: SlideThemePalette = getSlideThemeById(activeDeck?.themeId || "sandstone-editorial")

  useEffect(() => {
    saveStudioDecks(user, decks)
  }, [decks, user])

  useEffect(() => {
    if (!isPresenting) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPresenting(false)
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault()
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
  }, [isPresenting, activeDeck?.slides.length])

  const notify = (msg: string) => {
    setStatusNotice(msg)
    setTimeout(() => {
      setStatusNotice((prev) => (prev === msg ? null : prev))
    }, 3200)
  }

  const updateActiveDeck = (updater: (deck: StudioDeckRecord) => StudioDeckRecord) => {
    if (!activeDeck) return
    const now = new Date().toISOString()
    setDecks((prev) =>
      prev.map((d) => (d.id === activeDeck.id ? { ...updater(d), updatedAt: now } : d))
    )
    setSavedLabel(
      `Saved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    )
  }

  const updateActiveSlide = (patch: Partial<StudioSlideItem>) => {
    updateActiveDeck((deck) => ({
      ...deck,
      slides: deck.slides.map((s, idx) => (idx === safeSlideIndex ? { ...s, ...patch } : s)),
    }))
  }

  const handleLayoutChange = (nextLayout: SlideLayoutType) => {
    const defaults = createEmptySlide(nextLayout)
    updateActiveSlide({
      layout: nextLayout,
      leftTitle: activeSlide.leftTitle || defaults.leftTitle,
      leftBullets: activeSlide.leftBullets?.length ? activeSlide.leftBullets : defaults.leftBullets,
      rightTitle: activeSlide.rightTitle || defaults.rightTitle,
      rightBullets: activeSlide.rightBullets?.length ? activeSlide.rightBullets : defaults.rightBullets,
      metrics: activeSlide.metrics?.length ? activeSlide.metrics : defaults.metrics,
      quote: activeSlide.quote || defaults.quote,
      quoteAuthor: activeSlide.quoteAuthor || defaults.quoteAuthor,
      bullets: activeSlide.bullets?.length ? activeSlide.bullets : defaults.bullets,
    })
  }

  const handleAddSlide = () => {
    const nextSlide = createEmptySlide("bullets")
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
      ...src,
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
      const bytes = buildPptxBytes(activeDeck.title, activeDeck.slides, theme)
      downloadStudioFile(
        bytes,
        `${slug}.pptx`,
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      )
      notify(`Exported ${slug}.pptx`)
      return
    }

    if (kind === "html") {
      const html = buildStandaloneHtmlDeck(activeDeck.title, activeDeck.slides, theme)
      downloadStudioFile(html, `${slug}-deck.html`, "text/html;charset=utf-8")
      notify(`Exported ${slug}-deck.html`)
      return
    }

    const printSlidesHtml = activeDeck.slides
      .map(
        (s, idx) =>
          `<div style="page-break-after:always;border:1px solid #d1d5db;border-radius:12px;padding:42px;margin-bottom:24px;background:${theme.bgHex};color:${theme.textHex};">
            <h1 style="margin:0 0 8px 0;color:${theme.primaryHex};">${escapeHtml(s.title)}</h1>
            ${s.subtitle ? `<p style="margin:0 0 18px 0;color:${theme.mutedHex};">${escapeHtml(s.subtitle)}</p>` : ""}
            <ul>${(s.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
            <p style="font-size:11px;opacity:0.6;margin-top:24px;">Slide ${idx + 1} · ConnectLn Slides</p>
          </div>`
      )
      .join("")
    const win = window.open("", "_blank", "width=960,height=720")
    if (!win) {
      notify("Allow pop-ups to print slides")
      return
    }
    win.document.write(
      `<!DOCTYPE html><html><head><title>${escapeHtml(activeDeck.title)}</title></head><body style="font-family:sans-serif;padding:24px;">${printSlidesHtml}</body></html>`
    )
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 250)
  }

  const handleShareDeck = () => {
    if (!activeDeck || !onShareToFeed) return
    const feedSlides = activeDeck.slides.map((s, idx) => ({
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
      summary: `Published ${activeDeck.slides.length}-slide deck "${activeDeck.title}" from ConnectLn Slides.`,
      appLabel: "ConnectLn Slides",
      slides: feedSlides,
    })
    notify("Published slide deck to ConnectLn Home Feed")
  }

  const filteredDecks = decks.filter((d) => {
    const q = deckSearch.trim().toLowerCase()
    return !q || d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
  })

  const renderPresentSlideBody = (slide: StudioSlideItem) => {
    if (slide.layout === "cover") {
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
              {slide.bullets.map((tag, i) => (
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
          <div
            style={{ backgroundColor: theme.surfaceHex }}
            className="rounded-2xl p-6 border border-white/10 space-y-3 h-full"
          >
            <h3 style={{ color: theme.accentHex }} className="text-xl font-extrabold">
              {slide.leftTitle || "Left Track"}
            </h3>
            <ul className="space-y-2.5 text-base sm:text-lg list-disc pl-5">
              {(slide.leftBullets || []).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
          <div
            style={{ backgroundColor: theme.surfaceHex }}
            className="rounded-2xl p-6 border border-white/10 space-y-3 h-full"
          >
            <h3 style={{ color: theme.accentHex }} className="text-xl font-extrabold">
              {slide.rightTitle || "Right Track"}
            </h3>
            <ul className="space-y-2.5 text-base sm:text-lg list-disc pl-5">
              {(slide.rightBullets || []).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
      )
    }

    if (slide.layout === "metrics") {
      return (
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-5 items-center pt-4">
          {(slide.metrics || []).map((m, i) => (
            <div
              key={i}
              style={{ backgroundColor: theme.surfaceHex }}
              className="rounded-2xl p-6 border border-white/10 space-y-2 text-center"
            >
              <div style={{ color: theme.accentHex }} className="text-4xl font-black">
                {m.value}
              </div>
              <div className="text-base font-bold">{m.label}</div>
              {m.delta && (
                <div style={{ color: theme.mutedHex }} className="text-xs font-semibold">
                  {m.delta}
                </div>
              )}
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
            <p style={{ color: theme.accentHex }} className="text-lg font-extrabold">
              — {slide.quoteAuthor}
            </p>
          )}
        </div>
      )
    }

    if (slide.layout === "visual_split") {
      return (
        <div className="flex-1 grid grid-cols-2 gap-6 items-center pt-2">
          <ul className="space-y-3 text-lg sm:text-xl list-disc pl-6">
            {(slide.bullets || []).map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <div
            style={{ backgroundColor: theme.surfaceHex }}
            className="rounded-2xl overflow-hidden border border-white/10 aspect-video flex items-center justify-center"
          >
            {slide.imageUrl ? (
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span style={{ color: theme.mutedHex }} className="text-sm font-semibold">
                Visual Frame
              </span>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="flex-1 pt-4">
        <ul className="space-y-3.5 text-lg sm:text-2xl list-disc pl-7">
          {(slide.bullets || []).map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm min-h-[760px]">
      {/* Left Sidebar: Slide Filmstrip OR Deck Library */}
      {sidebarOpen && (
        <aside className="w-full lg:w-[270px] shrink-0 border-b lg:border-b-0 lg:border-r border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2]/80 dark:bg-zinc-950/60 flex flex-col">
          <div className="p-2.5 border-b border-[#E7E2DA] dark:border-zinc-800 space-y-2">
            <div className="grid grid-cols-2 rounded-xl bg-[#EFECE6] dark:bg-zinc-900 p-1">
              <button
                type="button"
                onClick={() => setSidebarTab("slides")}
                className={`rounded-lg py-1.5 text-xs font-bold cursor-pointer ${
                  sidebarTab === "slides"
                    ? "bg-white dark:bg-zinc-800 text-[#C84B28] shadow-2xs"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                Slides ({activeDeck?.slides.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab("decks")}
                className={`rounded-lg py-1.5 text-xs font-bold cursor-pointer ${
                  sidebarTab === "decks"
                    ? "bg-white dark:bg-zinc-800 text-[#C84B28] shadow-2xs"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                My Decks ({decks.length})
              </button>
            </div>

            {sidebarTab === "slides" ? (
              <button
                type="button"
                onClick={handleAddSlide}
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
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
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
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`group rounded-xl border p-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#C84B28] ring-2 ring-[#C84B28]/20 bg-white dark:bg-zinc-900"
                        : "border-[#E7E2DA] dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 hover:border-[#C84B28]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-extrabold text-zinc-500">
                        SLIDE {idx + 1} · {s.layout.replace("_", " ").toUpperCase()}
                      </span>
                      <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMoveSlide(idx, -1)
                          }}
                          title="Move up"
                          className="p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMoveSlide(idx, 1)
                          }}
                          title="Move down"
                          className="p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDuplicateSlide(idx)
                          }}
                          title="Duplicate slide"
                          className="p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSlide(idx)
                          }}
                          title="Delete slide"
                          className="p-0.5 rounded hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Mini Visual Preview Card */}
                    <div
                      style={{ backgroundColor: theme.bgHex, color: theme.textHex }}
                      className="rounded-lg p-2.5 aspect-[16/9] flex flex-col justify-between overflow-hidden border border-black/10"
                    >
                      <p
                        style={{ color: theme.primaryHex }}
                        className="text-[10.5px] font-extrabold leading-snug line-clamp-2"
                      >
                        {s.title || "Untitled Slide"}
                      </p>
                      <p
                        style={{ color: theme.mutedHex }}
                        className="text-[9px] line-clamp-2 opacity-90"
                      >
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
                    onClick={() => {
                      setActiveDeckId(d.id)
                      setActiveSlideIndex(0)
                      setSidebarTab("slides")
                    }}
                    className={`group rounded-xl border p-2.5 cursor-pointer ${
                      isSel
                        ? "border-[#C84B28] bg-white dark:bg-zinc-900 shadow-xs"
                        : "border-transparent hover:border-[#E7E2DA] hover:bg-white/70 dark:hover:bg-zinc-900/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#0B1F3A] dark:text-zinc-100 truncate">
                          {d.title}
                        </p>
                        <p className="text-[10.5px] text-zinc-500 mt-0.5 truncate">
                          {d.slides.length} slides · {d.category}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDecks((prev) =>
                            prev.map((x) => (x.id === d.id ? { ...x, starred: !x.starred } : x))
                          )
                        }}
                        className="p-1 rounded cursor-pointer"
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${
                            d.starred ? "fill-amber-400 text-amber-500" : "text-zinc-400"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </aside>
      )}

      {/* Main Slide Canvas Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Deck Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-[#E7E2DA] dark:border-zinc-800">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen((s) => !s)}
              className="rounded-lg p-1.5 border border-[#E7E2DA] dark:border-zinc-700 hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer shrink-0"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </button>
            <input
              type="text"
              aria-label="Deck title"
              value={activeDeck?.title || ""}
              onChange={(e) => updateActiveDeck((d) => ({ ...d, title: e.target.value }))}
              className="min-w-[160px] flex-1 max-w-md rounded-lg border border-transparent hover:border-[#E7E2DA] focus:border-[#C84B28] bg-transparent px-2 py-1 text-sm sm:text-base font-extrabold text-[#0B1F3A] dark:text-white outline-none"
            />
            <span className="hidden sm:inline-flex items-center rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 px-2.5 py-0.5 text-[11px] font-semibold text-[#C84B28] dark:text-orange-300">
              {savedLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {statusNotice && (
              <span className="rounded-lg bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 px-2.5 py-1 text-xs font-semibold text-[#C84B28] dark:text-orange-300">
                {statusNotice}
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsPresenting(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0067B8] hover:bg-[#00559b] text-white px-3.5 py-1.5 text-xs font-bold shadow-xs cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Present
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
                  <button
                    type="button"
                    onClick={() => handleExport("pptx")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <span>Standard Deck (.pptx)</span>
                    <span className="text-[10px] font-mono text-[#C84B28]">OpenXML</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("html")}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <span>Interactive Web Deck (.html)</span>
                    <span className="text-[10px] font-mono text-zinc-400">HTML5</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("print")}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5 text-[#C84B28]" />
                    <span>Print / Save PDF Slides</span>
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

        {/* Layout + Theme Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950/70">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-zinc-500 mr-1">Layout:</span>
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleLayoutChange(opt.id)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                  activeSlide.layout === opt.id
                    ? "bg-[#C84B28] text-white"
                    : "bg-white dark:bg-zinc-900 border border-[#E7E2DA] dark:border-zinc-700 text-[#0B1F3A] dark:text-zinc-200 hover:border-[#C84B28]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-zinc-500">Theme:</span>
            <div className="flex items-center gap-1.5">
              {STUDIO_SLIDE_THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  title={t.name}
                  onClick={() => updateActiveDeck((d) => ({ ...d, themeId: t.id }))}
                  style={{ backgroundColor: t.bgHex, borderColor: t.accentHex }}
                  className={`h-5 w-5 rounded-full border-2 cursor-pointer transition-transform ${
                    theme.id === t.id ? "scale-125 ring-2 ring-[#C84B28]" : ""
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowNotesDrawer((n) => !n)}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                showNotesDrawer
                  ? "border-[#C84B28] bg-orange-50 text-[#C84B28]"
                  : "border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900"
              }`}
            >
              <StickyNote className="h-3.5 w-3.5" />
              Notes
            </button>
          </div>
        </div>

        {/* Interactive 16:9 Canvas Stage */}
        <div className="flex-1 overflow-y-auto bg-[#EFECE6] dark:bg-zinc-950 p-4 sm:p-8 flex flex-col items-center justify-center">
          <div
            style={{ backgroundColor: theme.bgHex, color: theme.textHex }}
            className="w-full max-w-[920px] min-h-[480px] lg:aspect-[16/9] rounded-2xl border border-black/15 shadow-[0_24px_60px_rgba(11,31,58,0.16)] p-6 sm:p-10 flex flex-col justify-between gap-4"
          >
            {/* Title & Subtitle Area */}
            <div className={activeSlide.layout === "cover" ? "text-center pt-4" : ""}>
              <input
                type="text"
                aria-label="Slide title"
                value={activeSlide.title}
                onChange={(e) => updateActiveSlide({ title: e.target.value })}
                style={{ color: theme.primaryHex }}
                className={`w-full bg-transparent outline-none border border-transparent hover:border-white/25 focus:border-[#38BDF8] rounded-lg px-2 py-1 font-black tracking-tight ${
                  activeSlide.layout === "cover"
                    ? "text-center text-2xl sm:text-4xl"
                    : "text-xl sm:text-3xl"
                }`}
              />
              <input
                type="text"
                aria-label="Slide subtitle"
                value={activeSlide.subtitle || ""}
                onChange={(e) => updateActiveSlide({ subtitle: e.target.value })}
                placeholder="Add slide subtitle or context..."
                style={{ color: theme.mutedHex }}
                className={`w-full bg-transparent outline-none border border-transparent hover:border-white/20 focus:border-[#38BDF8] rounded-lg px-2 py-1 text-sm sm:text-base mt-1 ${
                  activeSlide.layout === "cover" ? "text-center" : ""
                }`}
              />
            </div>

            {/* Dynamic Editable Slide Body by Layout */}
            {activeSlide.layout === "two_column" ? (
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(
                  [
                    {
                      titleKey: "leftTitle" as const,
                      bulletsKey: "leftBullets" as const,
                      titleVal: activeSlide.leftTitle || "",
                      bulletsVal: activeSlide.leftBullets || [],
                    },
                    {
                      titleKey: "rightTitle" as const,
                      bulletsKey: "rightBullets" as const,
                      titleVal: activeSlide.rightTitle || "",
                      bulletsVal: activeSlide.rightBullets || [],
                    },
                  ] as const
                ).map((col) => (
                  <div
                    key={col.titleKey}
                    style={{ backgroundColor: theme.surfaceHex }}
                    className="rounded-xl p-4 border border-white/15 space-y-2.5 flex flex-col"
                  >
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
                          <button
                            type="button"
                            onClick={() =>
                              updateActiveSlide({
                                [col.bulletsKey]: col.bulletsVal.filter((_, i) => i !== bIdx),
                              })
                            }
                            className="opacity-50 hover:opacity-100 text-xs cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateActiveSlide({
                          [col.bulletsKey]: [...col.bulletsVal, "New column point"],
                        })
                      }
                      style={{ color: theme.accentHex }}
                      className="text-xs font-bold text-left hover:underline cursor-pointer"
                    >
                      + Add item
                    </button>
                  </div>
                ))}
              </div>
            ) : activeSlide.layout === "metrics" ? (
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                {(activeSlide.metrics || []).map((m, mIdx) => (
                  <div
                    key={mIdx}
                    style={{ backgroundColor: theme.surfaceHex }}
                    className="rounded-xl p-4 border border-white/15 space-y-2 text-center"
                  >
                    <input
                      type="text"
                      value={m.value}
                      onChange={(e) => {
                        const next = [...(activeSlide.metrics || [])]
                        next[mIdx] = { ...m, value: e.target.value }
                        updateActiveSlide({ metrics: next })
                      }}
                      style={{ color: theme.accentHex }}
                      className="w-full bg-transparent text-center text-3xl font-black outline-none"
                    />
                    <input
                      type="text"
                      value={m.label}
                      onChange={(e) => {
                        const next = [...(activeSlide.metrics || [])]
                        next[mIdx] = { ...m, label: e.target.value }
                        updateActiveSlide({ metrics: next })
                      }}
                      className="w-full bg-transparent text-center text-sm font-bold outline-none"
                    />
                    <input
                      type="text"
                      value={m.delta || ""}
                      placeholder="Benchmark note"
                      onChange={(e) => {
                        const next = [...(activeSlide.metrics || [])]
                        next[mIdx] = { ...m, delta: e.target.value }
                        updateActiveSlide({ metrics: next })
                      }}
                      style={{ color: theme.mutedHex }}
                      className="w-full bg-transparent text-center text-xs outline-none"
                    />
                  </div>
                ))}
              </div>
            ) : activeSlide.layout === "quote" ? (
              <div
                style={{ backgroundColor: theme.surfaceHex }}
                className="flex-1 rounded-2xl p-6 border border-white/15 flex flex-col justify-center gap-3"
              >
                <textarea
                  rows={3}
                  value={activeSlide.quote || ""}
                  onChange={(e) => updateActiveSlide({ quote: e.target.value })}
                  placeholder="Enter featured executive quote or takeaway..."
                  className="w-full bg-transparent text-center text-xl sm:text-2xl italic font-semibold outline-none resize-none"
                />
                <input
                  type="text"
                  value={activeSlide.quoteAuthor || ""}
                  onChange={(e) => updateActiveSlide({ quoteAuthor: e.target.value })}
                  placeholder="Attribution / Speaker"
                  style={{ color: theme.accentHex }}
                  className="w-full bg-transparent text-center text-sm font-extrabold outline-none"
                />
              </div>
            ) : activeSlide.layout === "visual_split" ? (
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                <div className="space-y-2">
                  {(activeSlide.bullets || []).map((b, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2">
                      <span style={{ color: theme.accentHex }} className="font-bold">
                        •
                      </span>
                      <input
                        type="text"
                        value={b}
                        onChange={(e) => {
                          const next = [...(activeSlide.bullets || [])]
                          next[bIdx] = e.target.value
                          updateActiveSlide({ bullets: next })
                        }}
                        className="flex-1 bg-transparent text-sm sm:text-base outline-none border-b border-white/15 py-1"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      updateActiveSlide({
                        bullets: [...(activeSlide.bullets || []), "New visual point"],
                      })
                    }
                    style={{ color: theme.accentHex }}
                    className="text-xs font-bold hover:underline cursor-pointer"
                  >
                    + Add talking point
                  </button>
                </div>

                <div
                  style={{ backgroundColor: theme.surfaceHex }}
                  className="rounded-xl border border-dashed border-white/25 aspect-video flex flex-col items-center justify-center overflow-hidden p-3 gap-2"
                >
                  {activeSlide.imageUrl ? (
                    <img
                      src={activeSlide.imageUrl}
                      alt={activeSlide.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => slideImageInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 text-xs font-bold cursor-pointer"
                    >
                      <ImagePlus className="h-4 w-4" />
                      Upload Slide Visual
                    </button>
                  )}
                  <input
                    ref={slideImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSlideImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center space-y-2.5">
                {(activeSlide.bullets || []).map((b, bIdx) => (
                  <div
                    key={bIdx}
                    style={{ backgroundColor: theme.surfaceHex }}
                    className="flex items-center gap-3 rounded-xl px-4 py-2.5 border border-white/10"
                  >
                    <span style={{ color: theme.accentHex }} className="font-black text-base">
                      •
                    </span>
                    <input
                      type="text"
                      value={b}
                      onChange={(e) => {
                        const next = [...(activeSlide.bullets || [])]
                        next[bIdx] = e.target.value
                        updateActiveSlide({ bullets: next })
                      }}
                      className="flex-1 bg-transparent text-sm sm:text-base outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateActiveSlide({
                          bullets: (activeSlide.bullets || []).filter((_, i) => i !== bIdx),
                        })
                      }
                      className="opacity-50 hover:opacity-100 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    updateActiveSlide({
                      bullets: [...(activeSlide.bullets || []), "Add talking point"],
                    })
                  }
                  style={{ color: theme.accentHex }}
                  className="text-xs font-bold text-left px-1 hover:underline cursor-pointer"
                >
                  + Add bullet point
                </button>
              </div>
            )}

            {/* Slide Footer Stamp */}
            <div className="flex items-center justify-between text-[11px] opacity-75 pt-2 border-t border-white/10">
              <span>ConnectLn Slides · {theme.name}</span>
              <span>
                Slide {safeSlideIndex + 1} of {activeDeck?.slides.length || 1}
              </span>
            </div>
          </div>

          {showNotesDrawer && (
            <div className="w-full max-w-[920px] mt-4 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0B1F3A] dark:text-zinc-200">
                  Presenter Speaker Notes — Slide {safeSlideIndex + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setShowNotesDrawer(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  Hide
                </button>
              </div>
              <textarea
                rows={2}
                value={activeSlide.notes || ""}
                onChange={(e) => updateActiveSlide({ notes: e.target.value })}
                placeholder="Add talking cues, reminders, or timing notes for Present Mode..."
                className="w-full rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-[#FAF7F2]/60 dark:bg-zinc-950 px-3 py-2 text-xs outline-none focus:border-[#C84B28]"
              />
            </div>
          )}
        </div>

        {/* Bottom Navigation Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safeSlideIndex === 0}
              onClick={() => setActiveSlideIndex((i) => Math.max(0, i - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 font-semibold disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>
            <span className="font-bold">
              Slide {safeSlideIndex + 1} / {activeDeck?.slides.length || 1}
            </span>
            <button
              type="button"
              disabled={safeSlideIndex >= (activeDeck?.slides.length || 1) - 1}
              onClick={() =>
                setActiveSlideIndex((i) => Math.min((activeDeck?.slides.length || 1) - 1, i + 1))
              }
              className="inline-flex items-center gap-1 rounded-lg border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 font-semibold disabled:opacity-40 cursor-pointer"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsPresenting(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0067B8] hover:underline cursor-pointer"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Full-Screen Present Mode
          </button>
        </div>
      </div>

      {/* Full-Screen Live Present Mode */}
      {isPresenting && (
        <div
          role="dialog"
          aria-label="ConnectLn Slides Present Mode"
          className="fixed inset-0 z-[120] bg-zinc-950 flex flex-col items-center justify-between p-4 sm:p-8"
        >
          <div className="w-full max-w-6xl flex items-center justify-between text-xs text-zinc-300">
            <span className="font-bold">
              {activeDeck?.title} · ConnectLn Slides Presenter
            </span>
            <button
              type="button"
              onClick={() => setIsPresenting(false)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 font-bold text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
              Exit Present (Esc)
            </button>
          </div>

          <div
            style={{ backgroundColor: theme.bgHex, color: theme.textHex }}
            className="w-full max-w-6xl aspect-[16/9] max-h-[75vh] rounded-2xl p-8 sm:p-14 shadow-2xl border border-white/15 flex flex-col justify-between"
          >
            {activeSlide.layout !== "cover" && (
              <div>
                <h2
                  style={{ color: theme.primaryHex }}
                  className="text-2xl sm:text-4xl font-black tracking-tight"
                >
                  {activeSlide.title}
                </h2>
                {activeSlide.subtitle && (
                  <p style={{ color: theme.mutedHex }} className="text-base sm:text-xl mt-1">
                    {activeSlide.subtitle}
                  </p>
                )}
              </div>
            )}

            {renderPresentSlideBody(activeSlide)}

            <div className="flex items-center justify-between text-xs opacity-70 pt-3 border-t border-white/10">
              <span>{activeDeck?.title}</span>
              <span>
                {safeSlideIndex + 1} / {activeDeck?.slides.length || 1}
              </span>
            </div>
          </div>

          <div className="w-full max-w-6xl space-y-2">
            {showPresentNotes && activeSlide.notes && (
              <div className="rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2 text-xs text-zinc-200">
                <strong>Speaker Notes:</strong> {activeSlide.notes}
              </div>
            )}
            <div className="flex items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safeSlideIndex === 0}
                  onClick={() => setActiveSlideIndex((i) => Math.max(0, i - 1))}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-35 px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="button"
                  disabled={safeSlideIndex >= (activeDeck?.slides.length || 1) - 1}
                  onClick={() =>
                    setActiveSlideIndex((i) =>
                      Math.min((activeDeck?.slides.length || 1) - 1, i + 1)
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0067B8] hover:bg-[#00559b] disabled:opacity-35 px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 max-w-md h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  style={{
                    width: `${((safeSlideIndex + 1) / Math.max(1, activeDeck?.slides.length || 1)) * 100}%`,
                  }}
                  className="h-full bg-[#38BDF8] transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPresentNotes((v) => !v)}
                className="rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold cursor-pointer"
              >
                {showPresentNotes ? "Hide Notes" : "Show Notes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deck Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
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
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
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
                    <span className="text-sm font-extrabold text-[#0B1F3A] dark:text-white">
                      {tpl.name}
                    </span>
                    <span className="rounded-full bg-orange-100 dark:bg-orange-900/50 px-2 py-0.5 text-[10px] font-bold text-[#C84B28] dark:text-orange-300">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{tpl.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
