"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Sparkles, Volume2, VolumeX, Globe, X, Subtitles, Send, CheckCircle2, ChevronDown } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { LanguageCode } from "@/lib/translations"
import { translateLinesLive, translateTextLive } from "@/lib/live-page-translator"

export interface NoctisVideoInterpreterProps {
  title: string
  speaker?: string
  speakerRole?: string
  serialPlate?: string
  description?: string
  takeaways?: string[]
  currentTime?: number
  duration?: number
  isPlaying?: boolean
  onMuteOriginalVideo?: (mute: boolean) => void
}

const SPEECH_LOCALE_MAP: Record<LanguageCode, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-BR",
  zh: "zh-CN",
  ja: "ja-JP",
  ar: "ar-SA",
  hi: "hi-IN",
  sw: "sw-KE",
  ru: "ru-RU",
}

const UI_LABELS: Record<
  LanguageCode,
  {
    triggerBtn: string
    popupTitle: string
    popupSubtitle: string
    listenVoiceDub: string
    stopVoiceDub: string
    liveSubtitlesOn: string
    liveSubtitlesOff: string
    summaryHeading: string
    stepsHeading: string
    askPlaceholder: string
    askBtn: string
    translating: string
  }
> = {
  en: {
    triggerBtn: "Noctis Interpreter",
    popupTitle: "Noctis AI Video Interpreter",
    popupSubtitle: "Live Multi-Language Translation & Voice Dubbing",
    listenVoiceDub: "Listen with Voice Dubbing",
    stopVoiceDub: "Stop Voice Dubbing",
    liveSubtitlesOn: "Subtitles ON",
    liveSubtitlesOff: "Subtitles OFF",
    summaryHeading: "Translated Video Overview",
    stepsHeading: "Step-by-Step Field Interpretation",
    askPlaceholder: "Ask Noctis to explain any part of this video...",
    askBtn: "Ask",
    translating: "Noctis is interpreting video into your language...",
  },
  es: {
    triggerBtn: "Intérprete Noctis",
    popupTitle: "Intérprete de Video IA Noctis",
    popupSubtitle: "Traducción en vivo y doblaje de voz",
    listenVoiceDub: "Escuchar doblaje en Español",
    stopVoiceDub: "Detener doblaje de voz",
    liveSubtitlesOn: "Subtítulos ACTIVOS",
    liveSubtitlesOff: "Subtítulos INACTIVOS",
    summaryHeading: "Resumen del video traducido",
    stepsHeading: "Interpretación paso a paso",
    askPlaceholder: "Pide a Noctis que explique cualquier parte de este video...",
    askBtn: "Preguntar",
    translating: "Noctis está interpretando el video al Español...",
  },
  pt: {
    triggerBtn: "Intérprete Noctis",
    popupTitle: "Intérprete de Vídeo IA Noctis",
    popupSubtitle: "Tradução ao vivo e dublagem de voz",
    listenVoiceDub: "Ouvir dublagem em Português",
    stopVoiceDub: "Parar dublagem de voz",
    liveSubtitlesOn: "Legendas ATIVAS",
    liveSubtitlesOff: "Legendas INATIVAS",
    summaryHeading: "Resumo do vídeo traduzido",
    stepsHeading: "Interpretação passo a passo",
    askPlaceholder: "Peça ao Noctis para explicar qualquer parte deste vídeo...",
    askBtn: "Perguntar",
    translating: "Noctis está interpretando o vídeo para Português...",
  },
  fr: {
    triggerBtn: "Interprète Noctis",
    popupTitle: "Interprète Vidéo IA Noctis",
    popupSubtitle: "Traduction en direct et doublage vocal",
    listenVoiceDub: "Écouter le doublage en Français",
    stopVoiceDub: "Arrêter le doublage",
    liveSubtitlesOn: "Sous-titres ACTIVÉS",
    liveSubtitlesOff: "Sous-titres DÉSACTIVÉS",
    summaryHeading: "Résumé de la vidéo traduit",
    stepsHeading: "Interprétation étape par étape",
    askPlaceholder: "Demandez à Noctis d'expliquer cette vidéo...",
    askBtn: "Demander",
    translating: "Noctis interprète la vidéo en Français...",
  },
  de: {
    triggerBtn: "Noctis Dolmetscher",
    popupTitle: "Noctis KI-Video-Dolmetscher",
    popupSubtitle: "Live-Übersetzung & Sprachsynchronisation",
    listenVoiceDub: "Auf Deutsch anhören (Sprach-Dub)",
    stopVoiceDub: "Sprachausgabe stoppen",
    liveSubtitlesOn: "Untertitel AN",
    liveSubtitlesOff: "Untertitel AUS",
    summaryHeading: "Übersetzte Video-Zusammenfassung",
    stepsHeading: "Schritt-für-Schritt-Erklärung",
    askPlaceholder: "Fragen Sie Noctis zu diesem Video...",
    askBtn: "Fragen",
    translating: "Noctis übersetzt das Video ins Deutsche...",
  },
  zh: {
    triggerBtn: "Noctis 视频口译",
    popupTitle: "Noctis AI 视频同声传译",
    popupSubtitle: "实时多语言字幕与语音配音",
    listenVoiceDub: "收听中文语音配音",
    stopVoiceDub: "停止语音配音",
    liveSubtitlesOn: "实时字幕已开启",
    liveSubtitlesOff: "实时字幕已关闭",
    summaryHeading: "视频内容中文概要",
    stepsHeading: "分步实操同声解析",
    askPlaceholder: "向 Noctis 提问关于本视频的任何内容...",
    askBtn: "提问",
    translating: "Noctis 正在将英文视频实时传译为中文...",
  },
  ja: {
    triggerBtn: "Noctis 映像通訳",
    popupTitle: "Noctis AI ビデオ通訳",
    popupSubtitle: "リアルタイム翻訳字幕＆音声吹き替え",
    listenVoiceDub: "日本語の吹き替え音声を聴く",
    stopVoiceDub: "音声を停止",
    liveSubtitlesOn: "字幕 オン",
    liveSubtitlesOff: "字幕 オフ",
    summaryHeading: "翻訳された動画の概要",
    stepsHeading: "ステップごとの解説",
    askPlaceholder: "この動画について Noctis に質問する...",
    askBtn: "質問",
    translating: "Noctis が英語の動画を日本語に通訳しています...",
  },
  ar: {
    triggerBtn: "مترجم Noctis الفوري",
    popupTitle: "مترجم الفيديو الذكي Noctis",
    popupSubtitle: "ترجمة فورية ودبلجة صوتية",
    listenVoiceDub: "استمع للدبلجة باللغة العربية",
    stopVoiceDub: "إيقاف الدبلجة الصوتية",
    liveSubtitlesOn: "الترجمة مفعّلة",
    liveSubtitlesOff: "الترجمة متوقفة",
    summaryHeading: "ملخص الفيديو المترجم",
    stepsHeading: "الشرح التفصيلي خطوة بخطوة",
    askPlaceholder: "اسأل Noctis لشرح أي جزء من هذا الفيديو...",
    askBtn: "اسأل",
    translating: "يقوم Noctis بترجمة الفيديو إلى العربية...",
  },
  hi: {
    triggerBtn: "Noctis वीडियो दुभाषिया",
    popupTitle: "Noctis AI वीडियो दुभाषिया",
    popupSubtitle: "लाइव अनुवाद और हिंदी वॉइस डबिंग",
    listenVoiceDub: "हिंदी आवाज़ में सुनें (डबिंग)",
    stopVoiceDub: "आवाज़ बंद करें",
    liveSubtitlesOn: "सबटाइटल चालू",
    liveSubtitlesOff: "सबटाइटल बंद",
    summaryHeading: "अनुवादित वीडियो सारांश",
    stepsHeading: "चरण-दर-चरण व्याख्या",
    askPlaceholder: "इस वीडियो के बारे में Noctis से कुछ भी पूछें...",
    askBtn: "पूछें",
    translating: "Noctis वीडियो का हिंदी में अनुवाद कर रहा है...",
  },
  sw: {
    triggerBtn: "Mkalimani wa Noctis",
    popupTitle: "Mkalimani wa Video wa Noctis AI",
    popupSubtitle: "Tafsiri ya Moja kwa Moja na Sauti",
    listenVoiceDub: "Sikiliza kwa Kiswahili",
    stopVoiceDub: "Simamisha Sauti",
    liveSubtitlesOn: "Manukuu YAMEWASHWA",
    liveSubtitlesOff: "Manukuu YAMEZIMWA",
    summaryHeading: "Muhtasari wa Video Uliotafsiriwa",
    stepsHeading: "Maelezo Hatua kwa Hatua",
    askPlaceholder: "Muulize Noctis aeleze sehemu yoyote ya video hii...",
    askBtn: "Uliza",
    translating: "Noctis inatafsiri video kwa Kiswahili...",
  },
  ru: {
    triggerBtn: "Переводчик Noctis",
    popupTitle: "ИИ-переводчик видео Noctis",
    popupSubtitle: "Синхронный перевод и голосовая озвучка",
    listenVoiceDub: "Слушать озвучку на русском",
    stopVoiceDub: "Остановить озвучку",
    liveSubtitlesOn: "Субтитры ВКЛ",
    liveSubtitlesOff: "Субтитры ВЫКЛ",
    summaryHeading: "Переведённый обзор видео",
    stepsHeading: "Пошаговый разбор урока",
    askPlaceholder: "Спросите Noctis о любом моменте из этого видео...",
    askBtn: "Спросить",
    translating: "Noctis переводит видео на русский язык...",
  },
}

export function NoctisVideoInterpreterPopup({
  title,
  speaker = "ConnectLn Instructor",
  speakerRole = "",
  serialPlate = "CLN-VID",
  description = "",
  takeaways = [],
  currentTime = 0,
  duration = 120,
  isPlaying = false,
  onMuteOriginalVideo,
}: NoctisVideoInterpreterProps) {
  const { language, setLanguage, currentLanguage, languages } = useLanguage()
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [showSubtitlesStrip, setShowSubtitlesStrip] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false)
  const [translatedTitle, setTranslatedTitle] = useState(title)
  const [translatedOverview, setTranslatedOverview] = useState("")
  const [translatedSteps, setTranslatedSteps] = useState<string[]>([])
  const [questionInput, setQuestionInput] = useState("")
  const [qaAnswer, setQaAnswer] = useState<string | null>(null)
  const [isAsking, setIsAsking] = useState(false)

  const labels = UI_LABELS[language] || UI_LABELS.en

  // Build rich source lines from the video metadata
  const sourceOverview = useMemo(() => {
    if (description && description.trim().length > 15) {
      return `${title} — Presented by ${speaker}${speakerRole ? ` (${speakerRole})` : ""}. ${description.trim()}`
    }
    return `In this masterclass "${title}", instructor ${speaker}${
      speakerRole ? ` (${speakerRole})` : ""
    } demonstrates practical field techniques, safety verification, and step-by-step execution standards.`
  }, [title, speaker, speakerRole, description])

  const sourceSteps = useMemo(() => {
    if (takeaways && takeaways.length > 0) {
      return takeaways
    }
    return [
      `1. Introduction & Tool Setup: ${speaker} introduces "${title}" and verifies workspace readiness and proper tool calibration.`,
      `2. Core Technique & Measurement: Demonstrates accurate layout, angle/readings check, and professional hand positioning.`,
      `3. Quality & Safety Inspection: Verifies code compliance, clean tolerances, and common field mistakes to avoid.`,
      `4. Field Application Summary: Reviews how to apply this skill on live job sites and log completion in your ConnectLn portfolio.`,
    ]
  }, [takeaways, speaker, title])

  // Translate video overview & steps whenever language or video changes
  useEffect(() => {
    let cancelled = false

    async function runInterpretation() {
      if (language === "en") {
        setTranslatedTitle(title)
        setTranslatedOverview(sourceOverview)
        setTranslatedSteps(sourceSteps)
        setIsLoadingTranslation(false)
        return
      }

      setIsLoadingTranslation(true)
      try {
        const [tTitle, tOverview, tSteps] = await Promise.all([
          translateTextLive(title, language),
          translateTextLive(sourceOverview, language),
          translateLinesLive(sourceSteps, language),
        ])
        if (!cancelled) {
          setTranslatedTitle(tTitle)
          setTranslatedOverview(tOverview)
          setTranslatedSteps(tSteps)
          setIsLoadingTranslation(false)
        }
      } catch {
        if (!cancelled) {
          setTranslatedTitle(title)
          setTranslatedOverview(sourceOverview)
          setTranslatedSteps(sourceSteps)
          setIsLoadingTranslation(false)
        }
      }
    }

    runInterpretation()
    return () => {
      cancelled = true
    }
  }, [language, title, sourceOverview, sourceSteps])

  // Stop speech synthesis on unmount or when language/video changes
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [language, title])

  const handleToggleVoiceDub = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return

      if (isSpeaking) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
        if (onMuteOriginalVideo) onMuteOriginalVideo(false)
        return
      }

      window.speechSynthesis.cancel()
      const fullScript = [translatedTitle, translatedOverview, ...translatedSteps].join(". ")
      const utterance = new SpeechSynthesisUtterance(fullScript)
      const targetLocale = SPEECH_LOCALE_MAP[language] || "en-US"
      utterance.lang = targetLocale
      utterance.rate = 1.0

      // Pick best matching native voice if available
      const voices = window.speechSynthesis.getVoices()
      const matchedVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith(language.toLowerCase())) ||
        voices.find((v) => v.lang.toLowerCase().includes(targetLocale.toLowerCase()))
      if (matchedVoice) {
        utterance.voice = matchedVoice
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
        if (onMuteOriginalVideo) onMuteOriginalVideo(true)
      }
      utterance.onend = () => {
        setIsSpeaking(false)
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
      }

      window.speechSynthesis.speak(utterance)
    },
    [isSpeaking, translatedTitle, translatedOverview, translatedSteps, language, onMuteOriginalVideo]
  )

  const handleAskNoctis = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const q = questionInput.trim()
    if (!q) return
    setIsAsking(true)
    const baseResponse = `Regarding "${title}" by ${speaker}: Focus on accurate preparation, verifying measurements twice before execution, and following all safety and quality checkpoints shown in this briefing. (${q})`
    const translatedAns =
      language === "en" ? baseResponse : await translateTextLive(baseResponse, language)
    setQaAnswer(translatedAns)
    setIsAsking(false)
    setQuestionInput("")
  }

  // Pick synchronized live subtitle line based on current playback progress
  const activeSubtitleLine = useMemo(() => {
    const allLines = [translatedOverview, ...translatedSteps].filter(Boolean)
    if (!allLines.length) return translatedTitle
    const safeDuration = Math.max(20, duration || 120)
    const idx = Math.floor(((currentTime % safeDuration) / safeDuration) * allLines.length)
    return allLines[Math.min(allLines.length - 1, Math.max(0, idx))]
  }, [translatedOverview, translatedSteps, translatedTitle, currentTime, duration])

  return (
    <div onClick={(e) => e.stopPropagation()} data-no-translate="true">
      {/* 1. COMPACT TRIGGER PILL ON THE VIDEO PLAYER (Top-Right Below Header) */}
      <div className="absolute top-12 right-3 z-30 flex items-center gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setIsPopupOpen((prev) => !prev)
          }}
          style={{ color: "#FFFFFF" }}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold shadow-lg backdrop-blur-md border transition-all cursor-pointer ${
            isPopupOpen || language !== "en"
              ? "bg-gradient-to-r from-[#7A4B00]/95 via-[#9A6004]/95 to-[#7A4B00]/95 border-amber-300/70 hover:brightness-110"
              : "bg-black/80 hover:bg-black border-white/25"
          }`}
          title="Open Noctis AI Live Video Language Interpreter & Voice Dubbing"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300 shrink-0" />
          <span style={{ color: "#FFFFFF" }}>{labels.triggerBtn}</span>
          <span className="rounded bg-black/40 px-1.5 py-0.2 text-[10px] font-mono text-amber-200 border border-white/15">
            {currentLanguage.flag} {currentLanguage.code.toUpperCase()}
          </span>
        </button>
      </div>

      {/* 2. LIVE TRANSLATED SUBTITLE STRIP (Automatically visible when a non-English language is selected) */}
      {language !== "en" && showSubtitlesStrip && !isPopupOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            setIsPopupOpen(true)
          }}
          className="absolute inset-x-3 bottom-14 z-20 mx-auto max-w-2xl rounded-xl bg-black/85 backdrop-blur-md border border-amber-400/40 px-3.5 py-2 text-center shadow-xl cursor-pointer hover:border-amber-300 transition-all"
        >
          <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-amber-300 mb-0.5">
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Noctis Live Interpretation ({currentLanguage.flag} {currentLanguage.localName})
            </span>
            <button
              type="button"
              onClick={handleToggleVoiceDub}
              className="inline-flex items-center gap-1 rounded-full bg-amber-500/25 hover:bg-amber-500/40 border border-amber-300/40 px-2 py-0.5 text-[10px] font-extrabold text-amber-100 cursor-pointer"
            >
              {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              <span>{isSpeaking ? labels.stopVoiceDub : labels.listenVoiceDub}</span>
            </button>
          </div>
          <p style={{ color: "#FFFFFF" }} className="text-xs sm:text-[13px] font-semibold leading-snug line-clamp-2">
            {isLoadingTranslation ? labels.translating : activeSubtitleLine}
          </p>
        </div>
      )}

      {/* 3. NOCTIS AI LIVE VIDEO INTERPRETER POP-UP BOX */}
      {isPopupOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-3 top-22 bottom-14 z-40 w-[min(370px,92vw)] rounded-2xl border border-amber-400/50 bg-zinc-950/95 text-white shadow-2xl backdrop-blur-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
        >
          {/* Pop-up Header */}
          <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-gradient-to-r from-amber-950/80 via-zinc-900 to-zinc-950 px-3.5 py-2.5 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-400/40 shrink-0">
                <Sparkles className="h-4 w-4 text-amber-300" />
              </div>
              <div className="min-w-0">
                <p style={{ color: "#FFFFFF" }} className="text-xs font-extrabold truncate">
                  {labels.popupTitle}
                </p>
                <p className="text-[10px] text-amber-200/80 truncate">{labels.popupSubtitle}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPopupOpen(false)}
              className="rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="Minimize Noctis Interpreter"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Language Selector + Voice Dubbing + Subtitles Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-white/10 bg-zinc-900/90 px-3 py-2 shrink-0">
            {/* Quick Language Selector */}
            <div className="relative flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-amber-300 shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                aria-label="Select interpretation language"
                className="rounded-lg border border-white/15 bg-zinc-800 px-2 py-1 text-[11px] font-bold text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-zinc-900 text-white">
                    {l.flag} {l.localName} ({l.code.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Voice Dubbing Button */}
              <button
                type="button"
                onClick={handleToggleVoiceDub}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition-all cursor-pointer ${
                  isSpeaking
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-xs"
                }`}
              >
                {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                <span>{isSpeaking ? labels.stopVoiceDub : labels.listenVoiceDub}</span>
              </button>

              {/* Toggle Subtitles Strip */}
              <button
                type="button"
                onClick={() => setShowSubtitlesStrip((prev) => !prev)}
                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold cursor-pointer ${
                  showSubtitlesStrip
                    ? "border-emerald-500/50 bg-emerald-950/60 text-emerald-300"
                    : "border-white/15 bg-zinc-800 text-zinc-400"
                }`}
                title="Toggle live translated subtitles on video"
              >
                <Subtitles className="h-3 w-3" />
                <span>CC</span>
              </button>
            </div>
          </div>

          {/* Scrollable Translated Interpretation Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5 text-xs">
            {isLoadingTranslation ? (
              <div className="py-6 text-center text-amber-200 font-semibold animate-pulse">
                {labels.translating}
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 space-y-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                    {labels.summaryHeading} ({currentLanguage.flag} {currentLanguage.localName})
                  </p>
                  <p style={{ color: "#FFFFFF" }} className="font-bold text-xs leading-snug">
                    {translatedTitle}
                  </p>
                  <p className="text-[11px] text-zinc-200 leading-relaxed">{translatedOverview}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 space-y-1.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                    {labels.stepsHeading}
                  </p>
                  <div className="space-y-1.5">
                    {translatedSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-200 leading-snug">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {qaAnswer && (
                  <div className="rounded-xl border border-amber-400/40 bg-amber-950/40 p-2.5 space-y-1">
                    <p className="text-[10px] font-extrabold text-amber-300 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Noctis Response ({currentLanguage.localName})
                    </p>
                    <p className="text-[11px] text-amber-100 leading-relaxed">{qaAnswer}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Ask Noctis About This Video Footer */}
          <form
            onSubmit={handleAskNoctis}
            className="border-t border-white/10 bg-zinc-900/95 px-2.5 py-2 flex items-center gap-1.5 shrink-0"
          >
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder={labels.askPlaceholder}
              className="flex-1 min-w-0 rounded-lg border border-white/15 bg-zinc-800 px-2.5 py-1.5 text-[11px] text-white placeholder:text-zinc-400 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={isAsking}
              className="inline-flex items-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-400 px-2.5 py-1.5 text-[11px] font-extrabold text-zinc-950 transition-colors cursor-pointer shrink-0"
            >
              <Send className="h-3 w-3" />
              <span>{labels.askBtn}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
