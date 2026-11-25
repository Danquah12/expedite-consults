"use client"

import React, { useEffect, useState } from "react"
import {
  Check,
  Copy,
  FilePlus2,
  Globe2,
  Loader2,
  Sparkles,
  StickyNote,
  Wand2,
  X,
} from "lucide-react"
import type { UserProfile } from "@/lib/connectln-data"
import type { StudioSlideItem } from "@/lib/connectln-studio-storage"

interface ConnectLnSlidesNoctisPanelProps {
  deckTitle: string
  activeSlide: StudioSlideItem
  slideIndex: number
  totalSlides: number
  user: UserProfile
  initialPrompt?: string
  initialMode?: "generate" | "notes" | "tighten" | "translate"
  onClose: () => void
  onAddGeneratedSlide: (slide: {
    title: string
    subtitle: string
    bullets: string[]
    notes: string
  }) => void
  onApplyNotes: (notes: string) => void
  onApplyBullets: (bullets: string[]) => void
  onNotify: (msg: string) => void
}

function buildLocalSlideFallback(
  mode: "generate" | "notes" | "tighten" | "translate" | "custom",
  deckTitle: string,
  slide: StudioSlideItem,
  slideIdx: number,
  totalSlides: number,
  lang: string,
  customPrompt: string
): {
  text: string
  generatedSlide?: { title: string; subtitle: string; bullets: string[]; notes: string }
  notesText?: string
  bulletsList?: string[]
} {
  const safeTitle = slide.title || deckTitle || "Key Executive Milestone"
  if (mode === "generate" || mode === "custom") {
    const topic = customPrompt.trim() || `Execution & Value Summary for ${deckTitle}`
    const gen = {
      title: topic.slice(0, 62),
      subtitle: "Verified outcomes, stakeholder alignment, and immediate next actions",
      bullets: [
        "Baseline milestone verified against target timeline and budget",
        "Key risk mitigations assigned with accountable owners",
        "Final deliverable packaged for stakeholder sign-off",
      ],
      notes: `Walk the audience through why ${topic} directly supports "${deckTitle}". Pause on metric milestones before moving to the closing CTA.`,
    }
    return {
      text: `### ${gen.title}\n_${gen.subtitle}_\n\n- ${gen.bullets.join("\n- ")}\n\nSpeaker Notes: ${gen.notes}`,
      generatedSlide: gen,
    }
  }

  if (mode === "notes") {
    const bullets = slide.bullets?.join("; ") || slide.subtitle || safeTitle
    const notesText = `Slide ${slideIdx + 1} of ${totalSlides} — Start by framing "${safeTitle}". Highlight the core takeaway: ${bullets}. Invite quick questions on next steps before advancing.`
    return {
      text: notesText,
      notesText,
    }
  }

  if (mode === "tighten") {
    const base = slide.bullets && slide.bullets.length > 0
      ? slide.bullets
      : [safeTitle, slide.subtitle || "Clear execution path", "Measured client impact"]
    const tightened = base.map((b) => b.replace(/\s+/g, " ").trim().slice(0, 72))
    return {
      text: tightened.map((b) => `• ${b}`).join("\n"),
      bulletsList: tightened,
    }
  }

  const translateBullets = (slide.bullets || [safeTitle]).map((b) => `[${lang}] ${b}`)
  return {
    text: `[Noctis ${lang} Preview — ${safeTitle}]\n\n${translateBullets.map((b) => `• ${b}`).join("\n")}`,
    bulletsList: translateBullets,
  }
}

export function ConnectLnSlidesNoctisPanel({
  deckTitle,
  activeSlide,
  slideIndex,
  totalSlides,
  user,
  initialPrompt = "",
  initialMode,
  onClose,
  onAddGeneratedSlide,
  onApplyNotes,
  onApplyBullets,
  onNotify,
}: ConnectLnSlidesNoctisPanelProps) {
  const [promptText, setPromptText] = useState(initialPrompt)
  const [translateLang, setTranslateLang] = useState<"Twi" | "French" | "Spanish" | "German">("Spanish")
  const [loading, setLoading] = useState(false)
  const [resultText, setResultText] = useState("")
  const [pendingSlide, setPendingSlide] = useState<{
    title: string
    subtitle: string
    bullets: string[]
    notes: string
  } | null>(null)
  const [pendingNotes, setPendingNotes] = useState("")
  const [pendingBullets, setPendingBullets] = useState<string[] | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (initialPrompt) setPromptText(initialPrompt)
  }, [initialPrompt])

  useEffect(() => {
    if (initialMode === "translate") {
      setPromptText("Translate this slide cleanly while keeping bullet structure concise.")
    }
  }, [initialMode])

  const runPitchNoctis = async (mode: "generate" | "notes" | "tighten" | "translate" | "custom") => {
    const slideSummary = `Deck: "${deckTitle}", Slide ${slideIndex + 1}/${totalSlides}: "${activeSlide.title}" (${activeSlide.subtitle || ""}). Bullets: ${(activeSlide.bullets || []).join(" | ")}`
    const questionMap: Record<typeof mode, string> = {
      generate: `Create one executive presentation slide for "${deckTitle}". Return a concise Title, Subtitle, and 3 crisp bullet points plus 2 sentences of speaker notes. Context: ${slideSummary}`,
      notes: `Write clear, natural presenter talking points (speaker notes) for Slide ${slideIndex + 1}: ${slideSummary}`,
      tighten: `Rewrite these slide bullets to be sharper and punchier for an executive slide: ${(activeSlide.bullets || [activeSlide.title]).join(" ; ")}`,
      translate: `Translate this presentation slide title and bullets into ${translateLang}, keeping bullets short: ${slideSummary}`,
      custom: `${promptText.trim() || "Suggest a high-impact next slide."} Context: ${slideSummary}`,
    }

    setLoading(true)
    setCopied(false)
    setPendingSlide(null)
    setPendingNotes("")
    setPendingBullets(null)

    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 14000)

    try {
      const res = await fetch("/api/connectin/noctis", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question: questionMap[mode],
          language: mode === "translate" ? translateLang : "English",
          profile: {
            name: user.name || "ConnectLn Presenter",
            profession: user.profession || "Presenter",
          },
        }),
        signal: ctrl.signal,
      })

      if (res.ok) {
        const data = (await res.json()) as { text?: string }
        if (data?.text && data.text.trim()) {
          const text = data.text.trim()
          setResultText(text)
          const bulletLines = text
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => /^[-•*]\s+/.test(l) || /^[0-9]+\.\s+/.test(l))
            .map((l) => l.replace(/^([-•*]|\d+\.)\s+/, "").trim())
            .filter(Boolean)
            .slice(0, 5)

          if (mode === "notes") {
            setPendingNotes(text)
          } else if (mode === "tighten" || mode === "translate") {
            if (bulletLines.length > 0) setPendingBullets(bulletLines)
          } else {
            const firstHeading = text.split("\n").find((l) => l.trim())?.replace(/^#+\s*/, "") || "Generated Slide"
            setPendingSlide({
              title: (promptText.trim() || firstHeading).slice(0, 65),
              subtitle: `Drafted for ${deckTitle}`,
              bullets: bulletLines.length > 0 ? bulletLines : [text.slice(0, 120)],
              notes: `Key talking points: ${text.slice(0, 220)}`,
            })
          }
          clearTimeout(timer)
          setLoading(false)
          return
        }
      }
      throw new Error("Fallback to Noctis Pitch Studio writer")
    } catch {
      const local = buildLocalSlideFallback(
        mode,
        deckTitle,
        activeSlide,
        slideIndex,
        totalSlides,
        translateLang,
        promptText
      )
      setResultText(local.text)
      if (local.generatedSlide) setPendingSlide(local.generatedSlide)
      if (local.notesText) setPendingNotes(local.notesText)
      if (local.bulletsList) setPendingBullets(local.bulletsList)
    } finally {
      clearTimeout(timer)
      setLoading(false)
    }
  }

  return (
    <aside
      aria-label="Noctis Pitch Studio"
      className="w-full sm:w-[310px] shrink-0 border-l border-[#E7E2DA] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-950 p-3.5 flex flex-col gap-3 overflow-y-auto"
    >
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E7E2DA] dark:border-zinc-800">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B1F3A] to-[#C84B28] text-white shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-[#0B1F3A] dark:text-white leading-tight truncate">
              Noctis Pitch Studio
            </p>
            <p className="text-[10px] font-semibold text-[#C84B28] dark:text-orange-400">
              Slide {slideIndex + 1} of {totalSlides}
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close Noctis Pitch Studio"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          disabled={loading}
          onClick={() => runPitchNoctis("generate")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#C84B28] px-2.5 py-1.5 text-[11px] font-bold text-[#0B1F3A] dark:text-zinc-100 cursor-pointer"
        >
          <FilePlus2 className="h-3.5 w-3.5 text-[#C84B28]" />
          Generate Slide
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => runPitchNoctis("notes")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#C84B28] px-2.5 py-1.5 text-[11px] font-bold text-[#0B1F3A] dark:text-zinc-100 cursor-pointer"
        >
          <StickyNote className="h-3.5 w-3.5 text-[#C84B28]" />
          Speaker Notes
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => runPitchNoctis("tighten")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#C84B28] px-2.5 py-1.5 text-[11px] font-bold text-[#0B1F3A] dark:text-zinc-100 cursor-pointer"
        >
          <Wand2 className="h-3.5 w-3.5 text-[#C84B28]" />
          Tighten Bullets
        </button>
        <div className="flex items-center gap-1">
          <select
            aria-label="Noctis slide translation language"
            value={translateLang}
            onChange={(e) => setTranslateLang(e.target.value as any)}
            className="flex-1 rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 py-1.5 text-[11px] font-bold cursor-pointer"
          >
            <option value="Twi">Twi</option>
            <option value="French">French</option>
            <option value="Spanish">Spanish</option>
            <option value="German">German</option>
          </select>
          <button
            type="button"
            disabled={loading}
            onClick={() => runPitchNoctis("translate")}
            title="Translate slide bullets"
            className="rounded-xl bg-[#0B1F3A] text-white p-1.5 cursor-pointer"
          >
            <Globe2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <textarea
          rows={2}
          aria-label="Prompt Noctis Pitch Studio"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Ask Noctis to draft a new slide, pitch narrative, or speaking script..."
          className="w-full rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 text-xs outline-none focus:border-[#C84B28]"
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => runPitchNoctis("custom")}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0B1F3A] to-[#C84B28] hover:opacity-95 text-white py-2 text-xs font-extrabold shadow-xs cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Noctis is designing...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Ask Noctis
            </>
          )}
        </button>
      </div>

      {resultText && (
        <div className="rounded-xl border border-[#C84B28]/30 bg-white dark:bg-zinc-900 p-2.5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#C84B28]">
            <span>Noctis Pitch Draft</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(resultText)
                  setCopied(true)
                  onNotify("Copied Noctis pitch text")
                } catch {}
              }}
              className="inline-flex items-center gap-1 text-zinc-500 hover:text-[#C84B28] cursor-pointer"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto whitespace-pre-wrap text-[11.5px] leading-relaxed text-[#0B1F3A] dark:text-zinc-200 border-t border-zinc-100 dark:border-zinc-800 pt-1.5">
            {resultText}
          </div>
          <div className="space-y-1.5 pt-1">
            {pendingSlide && (
              <button
                type="button"
                onClick={() => {
                  onAddGeneratedSlide(pendingSlide)
                  onNotify(`Added "${pendingSlide.title}" to deck`)
                }}
                className="w-full rounded-lg bg-[#C84B28] hover:bg-[#a93c1e] text-white py-1.5 text-[11px] font-bold cursor-pointer"
              >
                Add Slide to Deck
              </button>
            )}
            {pendingNotes && (
              <button
                type="button"
                onClick={() => {
                  onApplyNotes(pendingNotes)
                  onNotify(`Applied Noctis speaker notes to Slide ${slideIndex + 1}`)
                }}
                className="w-full rounded-lg bg-[#0B1F3A] hover:bg-[#132D52] text-white py-1.5 text-[11px] font-bold cursor-pointer"
              >
                Apply to Notes
              </button>
            )}
            {pendingBullets && (
              <button
                type="button"
                onClick={() => {
                  onApplyBullets(pendingBullets)
                  onNotify(`Updated bullets on Slide ${slideIndex + 1}`)
                }}
                className="w-full rounded-lg bg-[#0B1F3A] hover:bg-[#132D52] text-white py-1.5 text-[11px] font-bold cursor-pointer"
              >
                Apply to Slide
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
