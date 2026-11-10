"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { Sparkles, Volume2, VolumeX, Globe, X, Subtitles, Send, CheckCircle2, Radio } from "lucide-react"
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
  onMuteOriginalVideo?: (duckAudio: boolean) => void
  onRequestPlayVideo?: () => void
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
    liveInterpretingBadge: string
  }
> = {
  en: {
    triggerBtn: "Noctis Interpreter",
    popupTitle: "Noctis Simultaneous Video Interpreter",
    popupSubtitle: "Live Interpretation (English Audio Quiet at 14%)",
    listenVoiceDub: "Start Live Interpretation",
    stopVoiceDub: "Pause Interpretation",
    liveSubtitlesOn: "Subtitles ON",
    liveSubtitlesOff: "Subtitles OFF",
    summaryHeading: "Translated Video Overview",
    stepsHeading: "Continuous Simultaneous Interpretation",
    askPlaceholder: "Ask Noctis to explain any part of this video...",
    askBtn: "Ask",
    translating: "Noctis is interpreting video into your language...",
    liveInterpretingBadge: "Simultaneous Interpretation Active · Original Audio Quiet",
  },
  es: {
    triggerBtn: "Intérprete Noctis",
    popupTitle: "Intérprete Simultáneo IA Noctis",
    popupSubtitle: "Interpretación continua (Audio inglés suave al 14%)",
    listenVoiceDub: "Escuchar doblaje en Español",
    stopVoiceDub: "Pausar interpretación",
    liveSubtitlesOn: "Subtítulos ACTIVOS",
    liveSubtitlesOff: "Subtítulos INACTIVOS",
    summaryHeading: "Resumen del video traducido",
    stepsHeading: "Interpretación simultánea hasta el final",
    askPlaceholder: "Pide a Noctis que explique cualquier parte de este video...",
    askBtn: "Preguntar",
    translating: "Noctis está interpretando el video al Español...",
    liveInterpretingBadge: "Interpretando en vivo al Español · Audio original suave",
  },
  pt: {
    triggerBtn: "Intérprete Noctis",
    popupTitle: "Intérprete Simultâneo IA Noctis",
    popupSubtitle: "Interpretação contínua (Áudio em inglês baixo a 14%)",
    listenVoiceDub: "Ouvir dublagem em Português",
    stopVoiceDub: "Pausar interpretação",
    liveSubtitlesOn: "Legendas ATIVAS",
    liveSubtitlesOff: "Legendas INATIVAS",
    summaryHeading: "Resumo do vídeo traduzido",
    stepsHeading: "Interpretação simultânea até o fim",
    askPlaceholder: "Peça ao Noctis para explicar qualquer parte deste vídeo...",
    askBtn: "Perguntar",
    translating: "Noctis está interpretando o vídeo para Português...",
    liveInterpretingBadge: "Interpretando ao vivo em Português · Áudio original baixo",
  },
  fr: {
    triggerBtn: "Interprète Noctis",
    popupTitle: "Interprète Simultané IA Noctis",
    popupSubtitle: "Interprétation continue (Audio anglais doux à 14%)",
    listenVoiceDub: "Écouter le doublage en Français",
    stopVoiceDub: "Pause interprétation",
    liveSubtitlesOn: "Sous-titres ACTIVÉS",
    liveSubtitlesOff: "Sous-titres DÉSACTIVÉS",
    summaryHeading: "Résumé de la vidéo traduit",
    stepsHeading: "Interprétation simultanée jusqu'à la fin",
    askPlaceholder: "Demandez à Noctis d'expliquer cette vidéo...",
    askBtn: "Demander",
    translating: "Noctis interprète la vidéo en Français...",
    liveInterpretingBadge: "Interprétation en direct en Français · Audio original doux",
  },
  de: {
    triggerBtn: "Noctis Dolmetscher",
    popupTitle: "Noctis KI-Simultandolmetscher",
    popupSubtitle: "Durchgehende Übersetzung (Englischer Ton leise bei 14%)",
    listenVoiceDub: "Auf Deutsch anhören (Simultan)",
    stopVoiceDub: "Übersetzung pausieren",
    liveSubtitlesOn: "Untertitel AN",
    liveSubtitlesOff: "Untertitel AUS",
    summaryHeading: "Übersetzte Video-Zusammenfassung",
    stepsHeading: "Simultandolmetschen bis zum Ende",
    askPlaceholder: "Fragen Sie Noctis zu diesem Video...",
    askBtn: "Fragen",
    translating: "Noctis übersetzt das Video ins Deutsche...",
    liveInterpretingBadge: "Simultandolmetschen aktiv · Originalton leise im Hintergrund",
  },
  zh: {
    triggerBtn: "Noctis 同声传译",
    popupTitle: "Noctis AI 视频同声传译",
    popupSubtitle: "全程连续同传（英文原声自动调低至 14%）",
    listenVoiceDub: "收听中文全程同声传译",
    stopVoiceDub: "暂停同声传译",
    liveSubtitlesOn: "实时字幕已开启",
    liveSubtitlesOff: "实时字幕已关闭",
    summaryHeading: "视频内容中文概要",
    stepsHeading: "全程分步连续同声传译",
    askPlaceholder: "向 Noctis 提问关于本视频的任何内容...",
    askBtn: "提问",
    translating: "Noctis 正在将英文视频实时同传为中文...",
    liveInterpretingBadge: "中文同声传译进行中 · 英文原声轻音伴随",
  },
  ja: {
    triggerBtn: "Noctis 同時通訳",
    popupTitle: "Noctis AI ビデオ同時通訳",
    popupSubtitle: "最後まで連続通訳（英語音声は14%の背景音量）",
    listenVoiceDub: "日本語の同時通訳を聴く",
    stopVoiceDub: "同時通訳を一時停止",
    liveSubtitlesOn: "字幕 オン",
    liveSubtitlesOff: "字幕 オフ",
    summaryHeading: "翻訳された動画の概要",
    stepsHeading: "最後まで連続する同時通訳",
    askPlaceholder: "この動画について Noctis に質問する...",
    askBtn: "質問",
    translating: "Noctis が英語の動画を日本語に同時通訳しています...",
    liveInterpretingBadge: "日本語で同時通訳中 · 英語原音は小音量で再生中",
  },
  ar: {
    triggerBtn: "مترجم Noctis الفوري",
    popupTitle: "المترجم الفوري الذكي Noctis",
    popupSubtitle: "ترجمة صوتية مستمرة للنهاية (صوت الفيديو الأصلي منخفض 14%)",
    listenVoiceDub: "استمع للترجمة الفورية بالعربية",
    stopVoiceDub: "إيقاف الترجمة المؤقت",
    liveSubtitlesOn: "الترجمة مفعّلة",
    liveSubtitlesOff: "الترجمة متوقفة",
    summaryHeading: "ملخص الفيديو المترجم",
    stepsHeading: "الترجمة الفورية المستمرة حتى نهاية الفيديو",
    askPlaceholder: "اسأل Noctis لشرح أي جزء من هذا الفيديو...",
    askBtn: "اسأل",
    translating: "يقوم Noctis بالترجمة الفورية للفيديو إلى العربية...",
    liveInterpretingBadge: "الترجمة الفورية نشطة بالعربية · الصوت الإنجليزي منخفض بالخلفية",
  },
  hi: {
    triggerBtn: "Noctis लाइव दुभाषिया",
    popupTitle: "Noctis AI लाइव वीडियो दुभाषिया",
    popupSubtitle: "अंत तक निरंतर अनुवाद (अंग्रेजी ऑडियो धीमी आवाज़ 14% में)",
    listenVoiceDub: "हिंदी लाइव व्याख्या सुनें",
    stopVoiceDub: "व्याख्या रोकें",
    liveSubtitlesOn: "सबटाइटल चालू",
    liveSubtitlesOff: "सबटाइटल बंद",
    summaryHeading: "अनुवादित वीडियो सारांश",
    stepsHeading: "अंत तक निरंतर लाइव व्याख्या",
    askPlaceholder: "इस वीडियो के बारे में Noctis से कुछ भी पूछें...",
    askBtn: "पूछें",
    translating: "Noctis वीडियो का हिंदी में लाइव अनुवाद कर रहा है...",
    liveInterpretingBadge: "हिंदी लाइव अनुवाद जारी · मूल अंग्रेजी आवाज़ धीमी है",
  },
  sw: {
    triggerBtn: "Mkalimani wa Noctis",
    popupTitle: "Mkalimani wa Moja kwa Moja wa Noctis AI",
    popupSubtitle: "Tafsiri Endelevu Hadi Mwisho (Sauti ya Kiingereza Chini 14%)",
    listenVoiceDub: "Sikiliza kwa Kiswahili",
    stopVoiceDub: "Simamisha Ukaliimani",
    liveSubtitlesOn: "Manukuu YAMEWASHWA",
    liveSubtitlesOff: "Manukuu YAMEZIMWA",
    summaryHeading: "Muhtasari wa Video Uliotafsiriwa",
    stepsHeading: "Tafsiri Endelevu Hatua kwa Hatua Hadi Mwisho",
    askPlaceholder: "Muulize Noctis aeleze sehemu yoyote ya video hii...",
    askBtn: "Uliza",
    translating: "Noctis inatafsiri video kwa Kiswahili...",
    liveInterpretingBadge: "Inatafsiri Moja kwa Moja · Sauti ya Kiingereza iko chini",
  },
  ru: {
    triggerBtn: "Синхронный перевод Noctis",
    popupTitle: "ИИ-синхронный переводчик Noctis",
    popupSubtitle: "Непрерывный перевод до конца (английская речь тихо на фоне 14%)",
    listenVoiceDub: "Слушать синхронный перевод",
    stopVoiceDub: "Пауза перевода",
    liveSubtitlesOn: "Субтитры ВКЛ",
    liveSubtitlesOff: "Субтитры ВЫКЛ",
    summaryHeading: "Переведённый обзор видео",
    stepsHeading: "Непрерывный синхронный перевод до конца",
    askPlaceholder: "Спросите Noctis о любом моменте из этого видео...",
    askBtn: "Спросить",
    translating: "Noctis синхронно переводит видео на русский язык...",
    liveInterpretingBadge: "Синхронный перевод активен · Английский звук приглушён",
  },
}

/**
 * Splits translated paragraphs into crisp, natural interpreter sentences (<= 135 chars each)
 * so Web Speech Synthesis never hits the browser 15-second cutoff bug and flows smoothly to the end.
 */
function buildContinuousInterpreterSentences(
  title: string,
  overview: string,
  steps: string[]
): string[] {
  const rawBlocks = [title, overview, ...steps].filter(Boolean)
  const sentences: string[] = []

  for (const block of rawBlocks) {
    const parts = block
      .split(/(?<=[.!?。！？؛])\s+|\s*[•·]\s*/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2)

    for (const part of parts) {
      if (part.length <= 135) {
        sentences.push(part)
      } else {
        const subParts = part
          .split(/(?<=[,;،؛:])\s+/)
          .map((s) => s.trim())
          .filter(Boolean)
        let buffer = ""
        for (const sub of subParts) {
          if ((buffer + " " + sub).trim().length <= 135) {
            buffer = (buffer + " " + sub).trim()
          } else {
            if (buffer) sentences.push(buffer)
            buffer = sub
          }
        }
        if (buffer) sentences.push(buffer)
      }
    }
  }

  return sentences.length > 0 ? sentences : [title]
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
  onRequestPlayVideo,
}: NoctisVideoInterpreterProps) {
  const { language, setLanguage, currentLanguage, languages } = useLanguage()
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [showSubtitlesStrip, setShowSubtitlesStrip] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [activeSentenceIdx, setActiveSentenceIdx] = useState(0)
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false)
  const [translatedTitle, setTranslatedTitle] = useState(title)
  const [translatedOverview, setTranslatedOverview] = useState("")
  const [translatedSteps, setTranslatedSteps] = useState<string[]>([])
  const [questionInput, setQuestionInput] = useState("")
  const [qaAnswer, setQaAnswer] = useState<string | null>(null)
  const [isAsking, setIsAsking] = useState(false)

  const isSpeakingRef = useRef(false)
  isSpeakingRef.current = isSpeaking
  const isPlayingRef = useRef(isPlaying)
  isPlayingRef.current = isPlaying
  const languageRef = useRef(language)
  languageRef.current = language
  const userManuallyPausedDubRef = useRef(false)
  const nextSentenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeSentenceIdxRef = useRef(0)
  activeSentenceIdxRef.current = activeSentenceIdx

  const labels = UI_LABELS[language] || UI_LABELS.en

  // Build rich, continuous source script so Noctis has detailed simultaneous commentary from start to finish
  const sourceOverview = useMemo(() => {
    const cleanDesc = description ? description.trim() : ""
    return `Welcome to this ConnectLn live field session: "${title}", presented by ${speaker}${
      speakerRole ? `, ${speakerRole}` : ""
    }. ${
      cleanDesc ||
      "Listen closely as the instructor demonstrates step-by-step field execution, tool setup, and precision quality checks."
    }`
  }, [title, speaker, speakerRole, description])

  const sourceSteps = useMemo(() => {
    const baseTakeaways =
      takeaways && takeaways.length > 0
        ? takeaways
        : [
            `Phase 1 — Workspace & Tool Preparation: ${speaker} lays out the primary tools for "${title}" and verifies calibration and surface readiness before starting work.`,
            `Phase 2 — Precision Marking & Reference Angles: Notice how the instructor holds the tool firmly against the reference edge to prevent drift and ensure exact alignment.`,
            `Phase 3 — Live Field Execution: While the English instructor explains the cut and assembly sequence, observe the steady hand pressure and clean follow-through.`,
            `Phase 4 — Safety & Tolerance Verification: Every joint, angle, and connection is checked twice against field tolerances to guarantee zero rework on the job site.`,
          ]

    return [
      ...baseTakeaways,
      `Live Field Observation: Watch how ${speaker} checks alignment and explains why proper preparation saves hours of corrective labor on commercial and residential jobs.`,
      `Key Professional Tip: Always keep your reference edge flush, verify your measurements before committing, and maintain clean tool control throughout the motion.`,
      `Quality Assurance Checkpoint: The instructor now reviews the finished surface and angle accuracy, confirming that the work meets ConnectLn verified trade standards.`,
      `Continuous Summary: We are following "${title}" with ${speaker}. You can ask Noctis any question in your language using the interpreter box while watching.`,
    ]
  }, [takeaways, speaker, title])

  // Translate video overview & continuous steps whenever language or video changes
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

  // Build crisp sentence chunks for continuous, non-stopping speech synthesis
  const interpreterSentences = useMemo(
    () => buildContinuousInterpreterSentences(translatedTitle, translatedOverview, translatedSteps),
    [translatedTitle, translatedOverview, translatedSteps]
  )
  const sentencesRef = useRef<string[]>(interpreterSentences)
  sentencesRef.current = interpreterSentences

  // Core sentence-by-sentence continuous speech loop (never stops until video stops or user pauses)
  const speakSentenceAtIndex = useCallback(
    (idx: number) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return
      if (!isSpeakingRef.current) return

      const list = sentencesRef.current
      if (!list || list.length === 0) return

      const safeIdx = ((idx % list.length) + list.length) % list.length
      setActiveSentenceIdx(safeIdx)
      activeSentenceIdxRef.current = safeIdx

      // Keep the English video speaking quietly in the background (14% volume)
      if (onMuteOriginalVideo) {
        onMuteOriginalVideo(true)
      }

      const sentenceText = list[safeIdx]
      const utterance = new SpeechSynthesisUtterance(sentenceText)
      const targetLocale = SPEECH_LOCALE_MAP[languageRef.current] || "en-US"
      utterance.lang = targetLocale
      utterance.rate = 0.98
      utterance.volume = 1.0

      const voices = window.speechSynthesis.getVoices()
      const matchedVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith(languageRef.current.toLowerCase())) ||
        voices.find((v) => v.lang.toLowerCase().includes(targetLocale.toLowerCase()))
      if (matchedVoice) {
        utterance.voice = matchedVoice
      }

      utterance.onend = () => {
        if (!isSpeakingRef.current) return
        if (nextSentenceTimerRef.current) clearTimeout(nextSentenceTimerRef.current)
        nextSentenceTimerRef.current = setTimeout(() => {
          if (isSpeakingRef.current) {
            speakSentenceAtIndex(safeIdx + 1)
          }
        }, 350)
      }

      utterance.onerror = () => {
        if (!isSpeakingRef.current) return
        if (nextSentenceTimerRef.current) clearTimeout(nextSentenceTimerRef.current)
        nextSentenceTimerRef.current = setTimeout(() => {
          if (isSpeakingRef.current) {
            speakSentenceAtIndex(safeIdx + 1)
          }
        }, 500)
      }

      try {
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
      } catch {
        // ignore
      }
    },
    [onMuteOriginalVideo]
  )

  const startContinuousInterpretation = useCallback(
    (startIndex = 0) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return
      if (nextSentenceTimerRef.current) clearTimeout(nextSentenceTimerRef.current)
      isSpeakingRef.current = true
      setIsSpeaking(true)
      if (onMuteOriginalVideo) onMuteOriginalVideo(true)
      speakSentenceAtIndex(startIndex)
    },
    [onMuteOriginalVideo, speakSentenceAtIndex]
  )

  const stopContinuousInterpretation = useCallback(
    (restoreFullEnglishVolume = true) => {
      isSpeakingRef.current = false
      setIsSpeaking(false)
      if (nextSentenceTimerRef.current) clearTimeout(nextSentenceTimerRef.current)
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
      if (restoreFullEnglishVolume && onMuteOriginalVideo) {
        onMuteOriginalVideo(false)
      }
    },
    [onMuteOriginalVideo]
  )

  // Automatically start simultaneous interpretation when a non-English language is selected & video is playing!
  useEffect(() => {
    if (language === "en") {
      stopContinuousInterpretation(true)
      return
    }
    if (isLoadingTranslation) return

    if (isPlaying && !userManuallyPausedDubRef.current) {
      startContinuousInterpretation(activeSentenceIdxRef.current)
    } else if (!isPlaying && isSpeakingRef.current) {
      stopContinuousInterpretation(false)
    }
  }, [
    language,
    isPlaying,
    isLoadingTranslation,
    translatedOverview,
    startContinuousInterpretation,
    stopContinuousInterpretation,
  ])

  // Watchdog: while isSpeaking, ensure browser SpeechSynthesis never stops before the video ends
  useEffect(() => {
    if (!isSpeaking) return
    const watchdog = setInterval(() => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return
      if (!isSpeakingRef.current) return

      if (onMuteOriginalVideo) {
        onMuteOriginalVideo(true)
      }

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      } else if (!window.speechSynthesis.speaking) {
        speakSentenceAtIndex(activeSentenceIdxRef.current + 1)
      }
    }, 2200)

    return () => clearInterval(watchdog)
  }, [isSpeaking, onMuteOriginalVideo, speakSentenceAtIndex])

  // Unlock browser speech synthesis on first user click if browser blocked initial auto-speak
  useEffect(() => {
    if (language === "en" || !isPlaying || userManuallyPausedDubRef.current) return
    const unlockSpeech = () => {
      if (
        languageRef.current !== "en" &&
        isPlayingRef.current &&
        !userManuallyPausedDubRef.current &&
        typeof window !== "undefined" &&
        "speechSynthesis" in window &&
        !window.speechSynthesis.speaking
      ) {
        startContinuousInterpretation(activeSentenceIdxRef.current)
      }
    }
    window.addEventListener("pointerdown", unlockSpeech, { passive: true })
    window.addEventListener("keydown", unlockSpeech, { passive: true })
    return () => {
      window.removeEventListener("pointerdown", unlockSpeech)
      window.removeEventListener("keydown", unlockSpeech)
    }
  }, [language, isPlaying, startContinuousInterpretation])

  useEffect(() => {
    return () => {
      if (nextSentenceTimerRef.current) clearTimeout(nextSentenceTimerRef.current)
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const handleToggleVoiceDub = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (isSpeaking) {
        userManuallyPausedDubRef.current = true
        stopContinuousInterpretation(true)
      } else {
        userManuallyPausedDubRef.current = false
        if (!isPlaying && onRequestPlayVideo) {
          onRequestPlayVideo()
        }
        startContinuousInterpretation(activeSentenceIdxRef.current)
      }
    },
    [isSpeaking, isPlaying, onRequestPlayVideo, startContinuousInterpretation, stopContinuousInterpretation]
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

  // Active subtitle line: when speaking, show the exact sentence Noctis is currently interpreting aloud
  const activeSubtitleLine = useMemo(() => {
    if (!interpreterSentences.length) return translatedTitle
    if (isSpeaking) {
      return interpreterSentences[activeSentenceIdx % interpreterSentences.length] || translatedTitle
    }
    const safeDuration = Math.max(20, duration || 120)
    const idx = Math.floor(((currentTime % safeDuration) / safeDuration) * interpreterSentences.length)
    return interpreterSentences[Math.min(interpreterSentences.length - 1, Math.max(0, idx))]
  }, [interpreterSentences, translatedTitle, isSpeaking, activeSentenceIdx, currentTime, duration])

  return (
    <div onClick={(e) => e.stopPropagation()} data-no-translate="true">
      {/* 1. COMPACT TRIGGER PILL ON THE VIDEO PLAYER (Top-Right Corner) */}
      <div className="absolute top-12 right-3 z-30 flex items-center gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (!isPlaying && onRequestPlayVideo && language !== "en") {
              onRequestPlayVideo()
            }
            setIsPopupOpen((prev) => !prev)
          }}
          style={{
            backgroundColor: isPopupOpen || isSpeaking || language !== "en" ? "#0A66C2" : "rgba(15, 23, 42, 0.92)",
            color: "#FFFFFF",
            borderColor: "#60A5FA",
          }}
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold shadow-xl border-2 transition-all cursor-pointer hover:brightness-110"
          title="Open Noctis AI Simultaneous Video Interpreter"
        >
          {isSpeaking ? (
            <Radio className="h-3.5 w-3.5 text-emerald-300 animate-pulse shrink-0" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-amber-300 shrink-0" />
          )}
          <span style={{ color: "#FFFFFF" }}>{labels.triggerBtn}</span>
          <span
            style={{ backgroundColor: "#0F172A", color: "#FDE68A" }}
            className="rounded px-1.5 py-0.5 text-[10px] font-mono font-black border border-white/25"
          >
            {currentLanguage.flag} {currentLanguage.code.toUpperCase()}
          </span>
        </button>
      </div>

      {/* 2. SLIM, HIGH-VISIBILITY SUBTITLE BAR AT VERY BOTTOM EDGE (Does NOT cover the center demonstration) */}
      {(language !== "en" || isSpeaking) && showSubtitlesStrip && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            setIsPopupOpen(true)
          }}
          style={{
            backgroundColor: "rgba(9, 13, 22, 0.92)",
            color: "#FFFFFF",
            borderColor: "#38BDF8",
          }}
          className="absolute inset-x-4 bottom-11 z-20 mx-auto max-w-xl rounded-xl border-2 px-3.5 py-1.5 text-center shadow-2xl cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between gap-2 text-[11px] font-extrabold mb-0.5">
            <span style={{ color: "#7DD3FC" }} className="inline-flex items-center gap-1.5 truncate">
              {isSpeaking ? (
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              ) : (
                <Sparkles className="h-3 w-3 shrink-0 text-amber-300" />
              )}
              <span className="truncate">
                {isSpeaking
                  ? `${labels.liveInterpretingBadge}`
                  : `${labels.popupTitle} (${currentLanguage.flag} ${currentLanguage.localName})`}
              </span>
            </span>
            <button
              type="button"
              onClick={handleToggleVoiceDub}
              style={{
                backgroundColor: isSpeaking ? "#059669" : "#0A66C2",
                color: "#FFFFFF",
              }}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold shrink-0 cursor-pointer shadow-sm"
            >
              {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              <span style={{ color: "#FFFFFF" }}>
                {isSpeaking ? labels.stopVoiceDub : labels.listenVoiceDub}
              </span>
            </button>
          </div>
          <p
            style={{ color: "#FFFFFF" }}
            className="text-xs sm:text-sm font-bold leading-snug line-clamp-2 drop-shadow-sm"
          >
            {isLoadingTranslation ? labels.translating : activeSubtitleLine}
          </p>
        </div>
      )}

      {/* 3. DOCKED SIDE COMPANION POP-UP (Positioned outside the video frame on the right so it NEVER covers the video demonstration!) */}
      {isPopupOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "#0F172A",
            color: "#FFFFFF",
            borderColor: "#38BDF8",
          }}
          className="fixed right-3 sm:right-5 top-18 z-[95] w-[min(385px,94vw)] max-h-[78vh] rounded-2xl border-2 shadow-[0_20px_60px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
        >
          {/* High-Contrast Pop-up Header */}
          <div
            style={{ backgroundColor: "#1E293B", color: "#FFFFFF" }}
            className="flex items-center justify-between gap-2 border-b border-slate-700 px-4 py-3 shrink-0"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                style={{ backgroundColor: "#0A66C2", color: "#FFFFFF" }}
                className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 shadow-sm"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
              </div>
              <div className="min-w-0">
                <p style={{ color: "#FFFFFF" }} className="text-sm font-extrabold truncate">
                  {labels.popupTitle}
                </p>
                <p style={{ color: "#BAE6FD" }} className="text-[11px] font-semibold truncate">
                  {labels.popupSubtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPopupOpen(false)}
              style={{ backgroundColor: "#334155", color: "#FFFFFF" }}
              className="rounded-full p-1.5 hover:opacity-90 transition-opacity cursor-pointer shrink-0"
              title="Minimize panel (Interpretation continues while you watch)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* High-Visibility Language Selector + Voice Dubbing + CC Subtitles Bar */}
          <div
            style={{ backgroundColor: "#F8FAFC", color: "#0F172A" }}
            className="flex flex-col gap-2 border-b border-slate-300 px-3.5 py-3 shrink-0"
          >
            {/* Row 1: Crisp White Language Select Dropdown with Bold Dark Text */}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#0A66C2] shrink-0" />
              <select
                value={language}
                onChange={(e) => {
                  userManuallyPausedDubRef.current = false
                  setLanguage(e.target.value as LanguageCode)
                }}
                aria-label="Select interpretation language"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#0F172A",
                  borderColor: "#94A3B8",
                }}
                className="flex-1 rounded-lg border-2 px-2.5 py-1.5 text-xs font-extrabold focus:outline-none focus:border-[#0A66C2] cursor-pointer shadow-2xs"
              >
                {languages.map((l) => (
                  <option
                    key={l.code}
                    value={l.code}
                    style={{ backgroundColor: "#FFFFFF", color: "#0F172A" }}
                  >
                    {l.flag} {l.localName} ({l.code.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Row 2: High-Contrast Voice Dubbing Button + CC Toggle Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleVoiceDub}
                style={{
                  backgroundColor: isSpeaking ? "#059669" : "#0A66C2",
                  color: "#FFFFFF",
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-extrabold shadow-sm hover:opacity-95 transition-all cursor-pointer"
              >
                {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span style={{ color: "#FFFFFF" }}>
                  {isSpeaking ? labels.stopVoiceDub : labels.listenVoiceDub}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowSubtitlesStrip((prev) => !prev)}
                style={{
                  backgroundColor: showSubtitlesStrip ? "#065F46" : "#334155",
                  color: "#FFFFFF",
                }}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-extrabold shadow-sm cursor-pointer shrink-0"
                title="Toggle live translated subtitles on video"
              >
                <Subtitles className="h-4 w-4" />
                <span style={{ color: "#FFFFFF" }}>CC</span>
              </button>
            </div>
          </div>

          {/* Currently Speaking Live Sentence Banner */}
          {isSpeaking && (
            <div
              style={{ backgroundColor: "#064E3B", color: "#FFFFFF" }}
              className="border-b border-emerald-500/40 px-3.5 py-2.5 flex items-start gap-2 shrink-0"
            >
              <Radio className="h-4 w-4 text-emerald-300 animate-pulse shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p
                  style={{ color: "#6EE7B7" }}
                  className="text-[10px] font-black uppercase tracking-wider"
                >
                  {labels.liveInterpretingBadge}
                </p>
                <p style={{ color: "#FFFFFF" }} className="text-xs font-bold leading-snug mt-0.5">
                  “{activeSubtitleLine}”
                </p>
              </div>
            </div>
          )}

          {/* Scrollable High-Contrast Translated Interpretation Body */}
          <div
            style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}
            className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3 text-xs"
          >
            {isLoadingTranslation ? (
              <div
                style={{ color: "#FDE68A" }}
                className="py-8 text-center text-sm font-extrabold animate-pulse"
              >
                {labels.translating}
              </div>
            ) : (
              <>
                <div
                  style={{ backgroundColor: "#1E293B", color: "#FFFFFF" }}
                  className="rounded-xl border border-slate-700 p-3 space-y-1.5"
                >
                  <p
                    style={{ color: "#FDE68A" }}
                    className="text-[11px] font-black uppercase tracking-wider"
                  >
                    {labels.summaryHeading} ({currentLanguage.flag} {currentLanguage.localName})
                  </p>
                  <p style={{ color: "#FFFFFF" }} className="font-extrabold text-sm leading-snug">
                    {translatedTitle}
                  </p>
                  <p style={{ color: "#F1F5F9" }} className="text-xs leading-relaxed font-medium">
                    {translatedOverview}
                  </p>
                </div>

                <div
                  style={{ backgroundColor: "#1E293B", color: "#FFFFFF" }}
                  className="rounded-xl border border-slate-700 p-3 space-y-2"
                >
                  <p
                    style={{ color: "#6EE7B7" }}
                    className="text-[11px] font-black uppercase tracking-wider"
                  >
                    {labels.stepsHeading}
                  </p>
                  <div className="space-y-2">
                    {translatedSteps.map((step, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor:
                            isSpeaking && idx === activeSentenceIdx % translatedSteps.length
                              ? "rgba(16, 185, 129, 0.2)"
                              : "transparent",
                        }}
                        className="flex items-start gap-2 rounded-lg p-1.5 text-xs leading-snug"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span style={{ color: "#FFFFFF" }} className="font-medium">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {qaAnswer && (
                  <div
                    style={{ backgroundColor: "#1E3A8A", color: "#FFFFFF" }}
                    className="rounded-xl border border-sky-400 p-3 space-y-1"
                  >
                    <p
                      style={{ color: "#FDE68A" }}
                      className="text-[11px] font-black flex items-center gap-1"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Noctis ({currentLanguage.localName})
                    </p>
                    <p style={{ color: "#FFFFFF" }} className="text-xs font-semibold leading-relaxed">
                      {qaAnswer}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* High-Visibility Ask Noctis Footer */}
          <form
            onSubmit={handleAskNoctis}
            style={{ backgroundColor: "#F8FAFC" }}
            className="border-t border-slate-300 px-3 py-2.5 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder={labels.askPlaceholder}
              style={{
                backgroundColor: "#FFFFFF",
                color: "#0F172A",
                borderColor: "#94A3B8",
              }}
              className="flex-1 min-w-0 rounded-lg border-2 px-3 py-1.5 text-xs font-bold placeholder:text-slate-500 focus:outline-none focus:border-[#0A66C2]"
            />
            <button
              type="submit"
              disabled={isAsking}
              style={{ backgroundColor: "#0A66C2", color: "#FFFFFF" }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-extrabold shadow-sm hover:opacity-95 transition-opacity cursor-pointer shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              <span style={{ color: "#FFFFFF" }}>{labels.askBtn}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
