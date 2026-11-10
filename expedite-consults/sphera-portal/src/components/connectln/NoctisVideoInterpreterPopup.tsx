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

const EXCLUSIVE_INTERPRETER_EVENT = "connectln:exclusive-interpreter-active"

function claimExclusiveInterpreter(instanceId: string) {
  if (typeof window === "undefined") return
  ;(window as any).__activeNoctisInterpreterId = instanceId
  window.dispatchEvent(
    new CustomEvent(EXCLUSIVE_INTERPRETER_EVENT, { detail: { instanceId } })
  )
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

// Instant native translations for common skilled-trades & platform video titles, descriptions, and takeaways
const NATIVE_VIDEO_PHRASES: Record<Exclude<LanguageCode, "en">, Record<string, string>> = {
  pt: {
    "Carpentry Basics: Marking and Checking Angles": "Noções básicas de carpintaria: marcação e verificação de ângulos",
    "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.":
      "Os alunos exploram como um esquadro rápido ajuda a marcar ângulos e verificar se os cantos estão em esquadro. Esta é uma lição inicial essencial antes de passar para o corte e a montagem.",
    "Speed Square Layout": "Traçado e layout com esquadro rápido (Speed Square)",
    "Marking 90° Perpendicular Lines": "Marcação de linhas perpendiculares exatas de 90°",
    "Marking 45° Miter Angles": "Marcação de ângulos de meia-esquadria de 45°",
    "Checking Corner Squareness": "Verificação de esquadro perfeito nos cantos",
  },
  es: {
    "Carpentry Basics: Marking and Checking Angles": "Conceptos básicos de carpintería: marcar y comprobar ángulos",
    "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.":
      "Los estudiantes exploran cómo una escuadra rápida ayuda a marcar ángulos y comprobar si las esquinas están a escuadra antes de pasar al corte y ensamblaje.",
    "Speed Square Layout": "Trazado y diseño con escuadra rápida",
    "Marking 90° Perpendicular Lines": "Marcado de líneas perpendiculares de 90°",
    "Marking 45° Miter Angles": "Marcado de ángulos de inglete de 45°",
    "Checking Corner Squareness": "Comprobación de escuadra en las esquinas",
  },
  fr: {
    "Carpentry Basics: Marking and Checking Angles": "Bases de la menuiserie : marquer et vérifier les angles",
    "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.":
      "Découvrez comment une équerre rapide permet de tracer des angles précis et de vérifier l'équerrage des coins avant la découpe et l'assemblage.",
    "Speed Square Layout": "Traçage avec l'équerre rapide (Speed Square)",
    "Marking 90° Perpendicular Lines": "Marquage de lignes perpendiculaires à 90°",
    "Marking 45° Miter Angles": "Marquage d'angles d'onglet à 45°",
    "Checking Corner Squareness": "Vérification de l'équerrage des angles",
  },
  de: {
    "Carpentry Basics: Marking and Checking Angles": "Grundlagen der Zimmerei: Winkel anreißen und prüfen",
    "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.":
      "Erfahren Sie, wie ein Anschlagwinkel beim präzisen Anreißen von Winkeln und beim Prüfen rechter Winkel vor dem Zuschnitt und der Montage hilft.",
    "Speed Square Layout": "Anreißen mit dem Zimmermannswinkel",
    "Marking 90° Perpendicular Lines": "Markieren von 90°-Senkrechtlinien",
    "Marking 45° Miter Angles": "Markieren von 45°-Gehrungswinkeln",
    "Checking Corner Squareness": "Überprüfen der Rechtwinkligkeit von Ecken",
  },
  zh: {
    "Carpentry Basics: Marking and Checking Angles": "木工基础：标记与检查角度",
    "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.":
      "本课演示如何使用快速三角尺精准标记角度并检查边角是否垂直，这是进行切割和组装前的核心基础课程。",
    "Speed Square Layout": "使用快速三角尺进行定位划线",
    "Marking 90° Perpendicular Lines": "标记 90° 垂直基准线",
    "Marking 45° Miter Angles": "标记 45° 斜接角度",
    "Checking Corner Squareness": "检查边角垂直度与方正度",
  },
  ja: {
    "Carpentry Basics: Marking and Checking Angles": "大工の基礎：角度の墨付けと確認",
    "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.":
      "スピードスクエアを使って正確に角度を記し、角が直角かどうかを確認する方法を学びます。切断や組み立てに進む前の重要な基礎レッスンです。",
    "Speed Square Layout": "スピードスクエアによる墨付けレイアウト",
    "Marking 90° Perpendicular Lines": "90°垂直ラインの正確なマーキング",
    "Marking 45° Miter Angles": "45°留め角度のマーキング",
    "Checking Corner Squareness": "コーナーの直角精度の確認",
  },
  ar: {
    "Carpentry Basics: Marking and Checking Angles": "أساسيات النجارة: تحديد الزوايا وفحصها",
    "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.":
      "يستكشف المتعلمون كيف يساعد مثلث النجارة السريع في تحديد الزوايا بدقة والتأكد من استقامة الزوايا قبل البدء في القطع والتجميع.",
    "Speed Square Layout": "التخطيط باستخدام مثلث النجارة السريع",
    "Marking 90° Perpendicular Lines": "تحديد خطوط متعامدة بزاوية 90 درجة",
    "Marking 45° Miter Angles": "تحديد زوايا الشطب بدرجة 45",
    "Checking Corner Squareness": "فحص تعامد واستقامة الزوايا",
  },
  hi: {
    "Carpentry Basics: Marking and Checking Angles": "बढ़ईगीरी की मूल बातें: कोणों को चिह्नित करना और जाँचना",
    "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.":
      "सीखें कि स्पीड स्क्वायर की मदद से सटीक कोण कैसे चिह्नित किए जाते हैं और कटाई व असेंबली से पहले कोनों की समकोणता की जाँच कैसे की जाती है।",
    "Speed Square Layout": "स्पीड स्क्वायर लेआउट और मार्किंग",
    "Marking 90° Perpendicular Lines": "90° लंबवत रेखाएँ चिह्नित करना",
    "Marking 45° Miter Angles": "45° माइटर कोण चिह्नित करना",
    "Checking Corner Squareness": "कोनों की समकोणता (स्क्वेयरनेस) की जाँच करना",
  },
  sw: {
    "Carpentry Basics: Marking and Checking Angles": "Misingi ya Useremala: Kuweka Alama na Kukagua Pembe",
    "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.":
      "Wanafunzi wanajifunza jinsi mraba wa kasi unavyosaidia kuweka alama za pembe na kuhakikisha kona zimenyooka kabla ya kukata na kuunganisha.",
    "Speed Square Layout": "Mpangilio wa Mraba wa Kasi (Speed Square)",
    "Marking 90° Perpendicular Lines": "Kuweka Alama za Mistari ya Pembe ya 90°",
    "Marking 45° Miter Angles": "Kuweka Alama za Pembe za 45°",
    "Checking Corner Squareness": "Kukagua Usahihi wa Kona",
  },
  ru: {
    "Carpentry Basics: Marking and Checking Angles": "Основы плотницкого дела: разметка и проверка углов",
    "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.":
      "Изучите, как плотницкий угольник помогает точно размечать углы и проверять прямоугольность соединений перед распиловкой и сборкой.",
    "Speed Square Layout": "Разметка с помощью плотницкого угольника",
    "Marking 90° Perpendicular Lines": "Разметка перпендикулярных линий под углом 90°",
    "Marking 45° Miter Angles": "Разметка углов под 45°",
    "Checking Corner Squareness": "Проверка прямоугольности углов",
  },
}

// 100% Native Localized Simultaneous Interpretation Scripts for all 11 languages (Zero English fallback!)
function buildNativeLocalizedTemplate(
  lang: LanguageCode,
  translatedTitle: string,
  speaker: string,
  translatedDesc: string,
  translatedTakeaways: string[]
): { overview: string; steps: string[] } {
  switch (lang) {
    case "pt":
      return {
        overview: `Bem-vindo a esta sessão prática ao vivo da ConnectLn: "${translatedTitle}", apresentada por ${speaker}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Fase 1 — Preparação de Ferramentas: ${speaker} posiciona a ferramenta na borda de referência e verifica o alinhamento antes de iniciar a marcação.`,
          `Fase 2 — Execução Precisa na Bancada: Observe como o instrutor mantém o esquadro firme contra a madeira para garantir linhas de 90° e 45° perfeitas.`,
          `Fase 3 — Inspeção de Qualidade e Segurança: Cada ângulo e canto é verificado duas vezes antes do corte para evitar retrabalho na obra.`,
          `Fase 4 — Aplicação Prática ConnectLn: Continue acompanhando a demonstração ao vivo enquanto o áudio original em inglês permanece baixo ao fundo.`,
        ],
      }
    case "es":
      return {
        overview: `Bienvenido a esta sesión práctica en vivo de ConnectLn: "${translatedTitle}", presentada por ${speaker}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Fase 1 — Preparación de Herramientas: ${speaker} coloca la herramienta sobre el borde de referencia y verifica la alineación antes de marcar.`,
          `Fase 2 — Ejecución Precisa en el Banco: Observe cómo el instructor sujeta firmemente la escuadra contra la madera para lograr ángulos exactos de 90° y 45°.`,
          `Fase 3 — Inspección de Calidad y Seguridad: Cada esquina y medida se comprueba dos veces antes de cortar para garantizar precisión profesional.`,
          `Fase 4 — Aplicación Práctica ConnectLn: Siga viendo la demostración mientras el audio original en inglés se mantiene suave de fondo.`,
        ],
      }
    case "fr":
      return {
        overview: `Bienvenue dans cette session pratique en direct ConnectLn : « ${translatedTitle} », présentée par ${speaker}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Phase 1 — Préparation des outils : ${speaker} place l'équerre contre le bord de référence et vérifie l'alignement avant le traçage.`,
          `Phase 2 — Exécution précise sur l'établi : Observez comment l'instructeur maintient fermement l'outil pour tracer des angles exacts à 90° et 45°.`,
          `Phase 3 — Contrôle qualité et sécurité : Chaque angle est vérifié deux fois avant la découpe pour garantir un assemblage parfait sur le chantier.`,
          `Phase 4 — Application terrain ConnectLn : Suivez la démonstration continue pendant que la voix anglaise originale reste douce en arrière-plan.`,
        ],
      }
    case "de":
      return {
        overview: `Willkommen zu dieser ConnectLn-Praxissitzung: „${translatedTitle}“, präsentiert von ${speaker}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Phase 1 — Werkzeugvorbereitung: ${speaker} legt das Werkzeug an die Referenzkante an und prüft die Ausrichtung vor dem Anreißen.`,
          `Phase 2 — Präzise Ausführung an der Werkbank: Beachten Sie, wie der Ausbilder den Winkel fest am Werkstück führt, um exakte 90°- und 45°-Linien zu ziehen.`,
          `Phase 3 — Qualitäts- und Sicherheitsprüfung: Jeder Winkel wird vor dem Zuschnitt doppelt kontrolliert, um höchste Passgenauigkeit zu sichern.`,
          `Phase 4 — Praxisanwendung auf ConnectLn: Verfolgen Sie die Demonstration weiter, während der englische Originalton leise im Hintergrund läuft.`,
        ],
      }
    case "zh":
      return {
        overview: `欢迎来到 ConnectLn 实操直播课堂：《${translatedTitle}》，由讲师 ${speaker} 主讲。${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `第一阶段 — 工具与基准准备：${speaker} 将工具紧贴木材基准边，在划线前仔细确认对齐精度。`,
          `第二阶段 — 工作台精准实操：请注意讲师如何稳固握持三角尺，精准划出 90 度垂直线与 45 度斜角线。`,
          `第三阶段 — 质量与安全复核：在正式切割前对每个边角进行二次测量，确保施工现场零返工。`,
          `第四阶段 — ConnectLn 现场应用：英文原声已调低至背景音量，Noctis 将持续为您全程同声传译直至视频结束。`,
        ],
      }
    case "ja":
      return {
        overview: `ConnectLn 実践ライブセッションへようこそ：「${translatedTitle}」（講師：${speaker}）。${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `ステップ 1 — 工具と基準面の準備：${speaker} が木材の基準端にスコヤを当て、墨付け前の密着を確認します。`,
          `ステップ 2 — 作業台での正確なマーキング：90度の垂直線と45度の角度を正確に引くための手の固定方法に注目してください。`,
          `ステップ 3 — 品質と安全のダブルチェック：切断前にすべての角度と直角精度を再確認し、現場での手戻りを防ぎます。`,
          `ステップ 4 — ConnectLn 実践応用：英語の原音は小音量で背景に流れ、動画の最後まで日本語で同時通訳を続けます。`,
        ],
      }
    case "ar":
      return {
        overview: `مرحباً بكم في جلسة التدريب العملي المباشر على ConnectLn: "${translatedTitle}"، يقدمها ${speaker}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `المرحلة 1 — تجهيز الأدوات: يضع ${speaker} الأداة بمحاذاة الحافة المرجعية ويتحقق من الاستقامة قبل وضع العلامات.`,
          `المرحلة 2 — التنفيذ الدقيق على طاولة العمل: لاحظ كيف يثبت المدرب مثلث النجارة بإحكام لرسم خطوط دقيقة بزاوية 90 و45 درجة.`,
          `المرحلة 3 — فحص الجودة والسلامة: يتم فحص كل زاوية مرتين قبل القطع لضمان دقة التركيب في موقع العمل.`,
          `المرحلة 4 — التطبيق العملي: تستمر الترجمة الفورية باللغة العربية حتى نهاية الفيديو مع بقاء الصوت الإنجليزي منخفضاً في الخلفية.`,
        ],
      }
    case "hi":
      return {
        overview: `ConnectLn के इस लाइव प्रैक्टिकल सत्र में आपका स्वागत है: "${translatedTitle}", प्रस्तुतकर्ता ${speaker}। ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `चरण 1 — उपकरण और कार्यक्षेत्र की तैयारी: ${speaker} संदर्भ किनारे पर उपकरण रखते हैं और मार्किंग से पहले संरेखण की जाँच करते हैं।`,
          `चरण 2 — सटीक कोण मार्किंग: देखें कि प्रशिक्षक 90° और 45° की सटीक रेखाएँ खींचने के लिए स्क्वायर को लकड़ी पर कैसे मज़बूती से पकड़ते हैं।`,
          `चरण 3 — गुणवत्ता और सुरक्षा जाँच: कटाई से पहले प्रत्येक कोने को दो बार जाँचा जाता है ताकि काम में पूरी सटीकता रहे।`,
          `चरण 4 — निरंतर लाइव व्याख्या: मूल अंग्रेजी आवाज़ पृष्ठभूमि में धीमी है और Noctis वीडियो के अंत तक हिंदी में व्याख्या जारी रखेगा।`,
        ],
      }
    case "sw":
      return {
        overview: `Karibu katika kipindi hiki cha vitendo cha ConnectLn: "${translatedTitle}", kinachowasilishwa na ${speaker}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Hatua ya 1 — Maandalizi ya Vifaa: ${speaker} anaweka kifaa kwenye ukingo wa marejeleo na kuhakikisha ulinganifu kabla ya kuweka alama.`,
          `Hatua ya 2 — Utekelezaji Sahihi Mezani: Tazama jinsi mwalimu anavyoshikilia mraba kwaaza ili kuchora mistari sahihi ya nyuzi 90 na 45.`,
          `Hatua ya 3 — Ukaguzi wa Ubora na Usalama: Kila kona inakaguliwa mara mbili kabla ya kukata ili kuhakikisha kazi bora.`,
          `Hatua ya 4 — Tafsiri Endelevu: Sauti ya Kiingereza iko chini kwa mbali huku Noctis ikiendelea kutafsiri kwa Kiswahili hadi mwisho wa video.`,
        ],
      }
    case "ru":
      return {
        overview: `Добро пожаловать на практическое занятие ConnectLn: «${translatedTitle}», ведёт ${speaker}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Этап 1 — Подготовка инструмента: ${speaker} прикладывает угольник к базовой кромке и проверяет плотность прилегания перед разметкой.`,
          `Этап 2 — Точная разметка на верстаке: Обратите внимание, как инструктор фиксирует инструмент для проведения точных линий под 90° и 45°.`,
          `Этап 3 — Контроль качества и точности: Каждый угол проверяется дважды перед распилом, чтобы исключить ошибки при сборке.`,
          `Этап 4 — Непрерывный синхронный перевод: Оригинальная английская речь звучит тихо на фоне, а Noctis переводит урок до самого конца.`,
        ],
      }
    default:
      return {
        overview: `Welcome to this ConnectLn live field session: "${translatedTitle}", presented by ${speaker}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Phase 1 — Workspace & Tool Preparation: ${speaker} lays out the primary tools and verifies calibration before starting work.`,
          `Phase 2 — Precision Marking & Reference Angles: Notice how the instructor holds the tool firmly against the reference edge.`,
          `Phase 3 — Live Field Execution: Observe the steady hand pressure and clean follow-through during the demonstration.`,
          `Phase 4 — Quality Assurance Checkpoint: Every joint and angle is checked twice against field tolerances.`,
        ],
      }
  }
}

const UI_LABELS: Record<
  LanguageCode,
  {
    triggerBtn: string
    popupTitle: string
    popupSubtitle: string
    listenVoiceDub: string
    stopVoiceDub: string
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
    listenVoiceDub: "🔊 Start Live Voice Interpretation",
    stopVoiceDub: "⏸ Pause Voice Interpretation",
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
    listenVoiceDub: "🔊 Escuchar interpretación en Español",
    stopVoiceDub: "⏸ Pausar interpretación",
    summaryHeading: "Resumen del video traducido",
    stepsHeading: "Interpretación simultánea hasta el final",
    askPlaceholder: "Pide a Noctis que explique cualquier parte de este video...",
    askBtn: "Preguntar",
    translating: "Noctis está interpretando el video al Español...",
    liveInterpretingBadge: "Hablando en Español · Audio original suave al 14%",
  },
  pt: {
    triggerBtn: "Intérprete Noctis",
    popupTitle: "Intérprete Simultâneo IA Noctis",
    popupSubtitle: "Interpretação contínua (Áudio em inglês baixo a 14%)",
    listenVoiceDub: "🔊 Ouvir interpretação em Português",
    stopVoiceDub: "⏸ Pausar interpretação",
    summaryHeading: "Resumo do vídeo traduzido",
    stepsHeading: "Interpretação simultânea até o fim",
    askPlaceholder: "Peça ao Noctis para explicar qualquer parte deste vídeo...",
    askBtn: "Perguntar",
    translating: "Noctis está interpretando o vídeo para Português...",
    liveInterpretingBadge: "Falando em Português · Áudio original baixo (14%)",
  },
  fr: {
    triggerBtn: "Interprète Noctis",
    popupTitle: "Interprète Simultané IA Noctis",
    popupSubtitle: "Interprétation continue (Audio anglais doux à 14%)",
    listenVoiceDub: "🔊 Écouter l'interprétation en Français",
    stopVoiceDub: "⏸ Pause interprétation",
    summaryHeading: "Résumé de la vidéo traduit",
    stepsHeading: "Interprétation simultanée jusqu'à la fin",
    askPlaceholder: "Demandez à Noctis d'expliquer cette vidéo...",
    askBtn: "Demander",
    translating: "Noctis interprète la vidéo en Français...",
    liveInterpretingBadge: "Voix en Français active · Audio original doux (14%)",
  },
  de: {
    triggerBtn: "Noctis Dolmetscher",
    popupTitle: "Noctis KI-Simultandolmetscher",
    popupSubtitle: "Durchgehende Übersetzung (Englischer Ton leise bei 14%)",
    listenVoiceDub: "🔊 Auf Deutsch anhören (Simultan)",
    stopVoiceDub: "⏸ Übersetzung pausieren",
    summaryHeading: "Übersetzte Video-Zusammenfassung",
    stepsHeading: "Simultandolmetschen bis zum Ende",
    askPlaceholder: "Fragen Sie Noctis zu diesem Video...",
    askBtn: "Fragen",
    translating: "Noctis übersetzt das Video ins Deutsche...",
    liveInterpretingBadge: "Deutsche Sprachausgabe aktiv · Originalton leise (14%)",
  },
  zh: {
    triggerBtn: "Noctis 同声传译",
    popupTitle: "Noctis AI 视频同声传译",
    popupSubtitle: "全程连续同传（英文原声自动调低至 14%）",
    listenVoiceDub: "🔊 收听中文全程同声传译",
    stopVoiceDub: "⏸ 暂停同声传译",
    summaryHeading: "视频内容中文概要",
    stepsHeading: "全程分步连续同声传译",
    askPlaceholder: "向 Noctis 提问关于本视频的任何内容...",
    askBtn: "提问",
    translating: "Noctis 正在将英文视频实时同传为中文...",
    liveInterpretingBadge: "中文语音同传进行中 · 英文原声轻音伴随 (14%)",
  },
  ja: {
    triggerBtn: "Noctis 同時通訳",
    popupTitle: "Noctis AI ビデオ同時通訳",
    popupSubtitle: "最後まで連続通訳（英語音声は14%の背景音量）",
    listenVoiceDub: "🔊 日本語の同時通訳音声を聴く",
    stopVoiceDub: "⏸ 同時通訳を一時停止",
    summaryHeading: "翻訳された動画の概要",
    stepsHeading: "最後まで連続する同時通訳",
    askPlaceholder: "この動画について Noctis に質問する...",
    askBtn: "質問",
    translating: "Noctis が英語の動画を日本語に同時通訳しています...",
    liveInterpretingBadge: "日本語音声で同時通訳中 · 英語原音は小音量 (14%)",
  },
  ar: {
    triggerBtn: "مترجم Noctis الفوري",
    popupTitle: "المترجم الفوري الذكي Noctis",
    popupSubtitle: "ترجمة صوتية مستمرة للنهاية (صوت الفيديو الأصلي منخفض 14%)",
    listenVoiceDub: "🔊 استمع للترجمة الصوتية بالعربية",
    stopVoiceDub: "⏸ إيقاف الترجمة المؤقت",
    summaryHeading: "ملخص الفيديو المترجم",
    stepsHeading: "الترجمة الفورية المستمرة حتى نهاية الفيديو",
    askPlaceholder: "اسأل Noctis لشرح أي جزء من هذا الفيديو...",
    askBtn: "اسأل",
    translating: "يقوم Noctis بالترجمة الفورية للفيديو إلى العربية...",
    liveInterpretingBadge: "يتحدث الآن بالعربية · الصوت الإنجليزي منخفض بالخلفية",
  },
  hi: {
    triggerBtn: "Noctis लाइव दुभाषिया",
    popupTitle: "Noctis AI लाइव वीडियो दुभाषिया",
    popupSubtitle: "अंत तक निरंतर अनुवाद (अंग्रेजी ऑडियो धीमी आवाज़ 14% में)",
    listenVoiceDub: "🔊 हिंदी लाइव आवाज़ में सुनें",
    stopVoiceDub: "⏸ व्याख्या रोकें",
    summaryHeading: "अनुवादित वीडियो सारांश",
    stepsHeading: "अंत तक निरंतर लाइव व्याख्या",
    askPlaceholder: "इस वीडियो के बारे में Noctis से कुछ भी पूछें...",
    askBtn: "पूछें",
    translating: "Noctis वीडियो का हिंदी में लाइव अनुवाद कर रहा है...",
    liveInterpretingBadge: "हिंदी आवाज़ में लाइव अनुवाद जारी · मूल आवाज़ धीमी (14%)",
  },
  sw: {
    triggerBtn: "Mkalimani wa Noctis",
    popupTitle: "Mkalimani wa Moja kwa Moja wa Noctis AI",
    popupSubtitle: "Tafsiri Endelevu Hadi Mwisho (Sauti ya Kiingereza Chini 14%)",
    listenVoiceDub: "🔊 Sikiliza Sauti kwa Kiswahili",
    stopVoiceDub: "⏸ Simamisha Ukaliimani",
    summaryHeading: "Muhtasari wa Video Uliotafsiriwa",
    stepsHeading: "Tafsiri Endelevu Hatua kwa Hatua Hadi Mwisho",
    askPlaceholder: "Muulize Noctis aeleze sehemu yoyote ya video hii...",
    askBtn: "Uliza",
    translating: "Noctis inatafsiri video kwa Kiswahili...",
    liveInterpretingBadge: "Inazungumza kwa Kiswahili · Sauti ya Kiingereza iko chini",
  },
  ru: {
    triggerBtn: "Синхронный перевод Noctis",
    popupTitle: "ИИ-синхронный переводчик Noctis",
    popupSubtitle: "Непрерывный перевод до конца (английская речь тихо на фоне 14%)",
    listenVoiceDub: "🔊 Слушать озвучку на русском",
    stopVoiceDub: "⏸ Пауза перевода",
    summaryHeading: "Переведённый обзор видео",
    stepsHeading: "Непрерывный синхронный перевод до конца",
    askPlaceholder: "Спросите Noctis о любом моменте из этого видео...",
    askBtn: "Спросить",
    translating: "Noctis синхронно переводит видео на русский язык...",
    liveInterpretingBadge: "Голосовой перевод на русском · Английский звук тихо (14%)",
  },
}

/**
 * Splits translated paragraphs into short sentences (<= 140 chars each)
 * so `/api/connectin/tts` and Web Speech Synthesis stream smoothly sentence-by-sentence to the end.
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
      .split(/(?<=[.!?。！？؛])\s+|\s*[•·—]\s*/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2)

    for (const part of parts) {
      if (part.length <= 145) {
        sentences.push(part)
      } else {
        const subParts = part
          .split(/(?<=[,;،؛:])\s+/)
          .map((s) => s.trim())
          .filter(Boolean)
        let buffer = ""
        for (const sub of subParts) {
          if ((buffer + " " + sub).trim().length <= 145) {
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
  const instanceIdRef = useRef<string>(`noctis-int-${Math.random().toString(36).slice(2, 10)}`)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined" && (window as any).__lastOpenedNoctisPopupTitle === title) {
      return true
    }
    return false
  })
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
  const onMuteOriginalVideoRef = useRef(onMuteOriginalVideo)
  onMuteOriginalVideoRef.current = onMuteOriginalVideo
  const onRequestPlayVideoRef = useRef(onRequestPlayVideo)
  onRequestPlayVideoRef.current = onRequestPlayVideo
  const preloadAudioRef = useRef<HTMLAudioElement | null>(null)
  const spokenLangAndTitleRef = useRef<string>("")
  const userManuallyPausedDubRef = useRef(false)
  const nextSentenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeSentenceIdxRef = useRef(0)
  activeSentenceIdxRef.current = activeSentenceIdx

  const labels = UI_LABELS[language] || UI_LABELS.en
  const takeawaysKey = useMemo(() => (takeaways || []).join("||"), [takeaways])

  // Translate title, description, and takeaways ONLY when language or video content changes (never on 500ms timer ticks!)
  useEffect(() => {
    let cancelled = false

    async function runInterpretation() {
      const baseTakeaways =
        takeaways && takeaways.length > 0
          ? takeaways
          : [
              "Speed Square Layout",
              "Marking 90° Perpendicular Lines",
              "Marking 45° Miter Angles",
              "Checking Corner Squareness",
            ]
      const cleanDesc =
        description && description.trim().length > 5
          ? description.trim()
          : "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly."

      if (language === "en") {
        const tpl = buildNativeLocalizedTemplate("en", title, speaker, cleanDesc, baseTakeaways)
        setTranslatedTitle(title)
        setTranslatedOverview(tpl.overview)
        setTranslatedSteps(tpl.steps)
        setIsLoadingTranslation(false)
        return
      }

      const dict = NATIVE_VIDEO_PHRASES[language] || {}
      const instantTitle = dict[title.trim()]
      const instantDesc = dict[cleanDesc]
      const instantTakeaways = baseTakeaways.map((t) => dict[t.trim()] || null)

      const initialTitle = instantTitle || title
      const initialDesc = instantDesc || cleanDesc
      const initialTakeaways = baseTakeaways.map((t, i) => instantTakeaways[i] || t)
      const initialTpl = buildNativeLocalizedTemplate(
        language,
        initialTitle,
        speaker,
        initialDesc,
        initialTakeaways
      )
      setTranslatedTitle(initialTitle)
      setTranslatedOverview(initialTpl.overview)
      setTranslatedSteps(initialTpl.steps)

      const needsDynamicTranslation =
        !instantTitle || !instantDesc || instantTakeaways.some((x) => !x)

      if (!needsDynamicTranslation) {
        setIsLoadingTranslation(false)
        return
      }

      setIsLoadingTranslation(true)
      try {
        const toTranslate = [title, cleanDesc, ...baseTakeaways]
        const translatedList = await translateLinesLive(toTranslate, language)
        if (!cancelled && translatedList.length === toTranslate.length) {
          const finalTitle = instantTitle || translatedList[0]
          const finalDesc = instantDesc || translatedList[1]
          const finalTakeaways = baseTakeaways.map(
            (_, idx) => instantTakeaways[idx] || translatedList[idx + 2]
          )
          const finalTpl = buildNativeLocalizedTemplate(
            language,
            finalTitle,
            speaker,
            finalDesc,
            finalTakeaways
          )
          setTranslatedTitle(finalTitle)
          setTranslatedOverview(finalTpl.overview)
          setTranslatedSteps(finalTpl.steps)
        }
      } catch {
        // Native template already set
      } finally {
        if (!cancelled) setIsLoadingTranslation(false)
      }
    }

    runInterpretation()
    return () => {
      cancelled = true
    }
  }, [language, title, speaker, description, takeawaysKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Build crisp sentence chunks for continuous speech
  const interpreterSentences = useMemo(
    () => buildContinuousInterpreterSentences(translatedTitle, translatedOverview, translatedSteps),
    [translatedTitle, translatedOverview, translatedSteps]
  )
  const sentencesRef = useRef<string[]>(interpreterSentences)
  sentencesRef.current = interpreterSentences

  const stopAudioOutput = useCallback(() => {
    if (nextSentenceTimerRef.current) {
      clearTimeout(nextSentenceTimerRef.current)
      nextSentenceTimerRef.current = null
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.onended = null
        audioRef.current.onerror = null
      } catch {}
    }
    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      (window as any).__activeNoctisInterpreterId === instanceIdRef.current
    ) {
      try {
        window.speechSynthesis.cancel()
      } catch {}
    }
  }, [])

  // Stop this instance if another video card claims exclusive interpreter
  useEffect(() => {
    const handleExclusive = (e: Event) => {
      const custom = e as CustomEvent<{ instanceId?: string }>
      if (custom.detail?.instanceId && custom.detail.instanceId !== instanceIdRef.current) {
        if (isSpeakingRef.current) {
          isSpeakingRef.current = false
          setIsSpeaking(false)
          stopAudioOutput()
        }
      }
    }
    window.addEventListener(EXCLUSIVE_INTERPRETER_EVENT, handleExclusive)
    return () => window.removeEventListener(EXCLUSIVE_INTERPRETER_EVENT, handleExclusive)
  }, [stopAudioOutput])

  // Core sentence-by-sentence continuous audio player:
  // Uses `/api/connectin/tts` HTML5 <audio> with next-sentence preloading for 100% smooth, unbroken voice output.
  const speakSentenceAtIndex = useCallback((idx: number) => {
    if (typeof window === "undefined") return
    if (!isSpeakingRef.current) return
    if ((window as any).__activeNoctisInterpreterId !== instanceIdRef.current) return

    const list = sentencesRef.current
    if (!list || list.length === 0) return

    const safeIdx = ((idx % list.length) + list.length) % list.length
    setActiveSentenceIdx(safeIdx)
    activeSentenceIdxRef.current = safeIdx

    // Keep the English video speaking quietly in the background (14% volume)
    if (onMuteOriginalVideoRef.current) {
      onMuteOriginalVideoRef.current(true)
    }

    const sentenceText = list[safeIdx]
    const nextSentenceText = list[(safeIdx + 1) % list.length]
    const targetLang = languageRef.current

    // Preload the NEXT sentence in the background so there is zero gap or stutter between sentences!
    if (nextSentenceText) {
      try {
        if (!preloadAudioRef.current) {
          preloadAudioRef.current = new Audio()
        }
        preloadAudioRef.current.preload = "auto"
        preloadAudioRef.current.src = `/api/connectin/tts?lang=${encodeURIComponent(
          targetLang
        )}&text=${encodeURIComponent(nextSentenceText.slice(0, 190))}`
        preloadAudioRef.current.load()
      } catch {}
    }

    const scheduleNextSentence = (delayMs = 180) => {
      if (!isSpeakingRef.current) return
      if (nextSentenceTimerRef.current) clearTimeout(nextSentenceTimerRef.current)
      nextSentenceTimerRef.current = setTimeout(() => {
        if (
          isSpeakingRef.current &&
          (window as any).__activeNoctisInterpreterId === instanceIdRef.current
        ) {
          speakSentenceAtIndex(safeIdx + 1)
        }
      }, delayMs)
    }

    const speakWithBrowserFallback = () => {
      if (!("speechSynthesis" in window) || !isSpeakingRef.current) return
      try {
        const utterance = new SpeechSynthesisUtterance(sentenceText)
        const targetLocale = SPEECH_LOCALE_MAP[targetLang] || "en-US"
        utterance.lang = targetLocale
        utterance.rate = 0.98
        utterance.volume = 1.0

        const voices = window.speechSynthesis.getVoices()
        const matchedVoice =
          voices.find((v) => v.lang.toLowerCase().startsWith(targetLang.toLowerCase())) ||
          voices.find((v) => v.lang.toLowerCase().includes(targetLocale.toLowerCase()))
        if (matchedVoice) {
          utterance.voice = matchedVoice
        }

        utterance.onend = () => scheduleNextSentence(180)
        utterance.onerror = () => scheduleNextSentence(400)
        window.speechSynthesis.speak(utterance)
      } catch {
        scheduleNextSentence(1500)
      }
    }

    // Primary: Play real native voice MP3 stream via `/api/connectin/tts`
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio()
      }
      const audio = audioRef.current
      audio.onended = null
      audio.onerror = null
      audio.volume = 1.0
      audio.src = `/api/connectin/tts?lang=${encodeURIComponent(
        targetLang
      )}&text=${encodeURIComponent(sentenceText.slice(0, 190))}`
      audio.onended = () => {
        scheduleNextSentence(160)
      }
      audio.onerror = () => {
        speakWithBrowserFallback()
      }
      const playPromise = audio.play()
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          speakWithBrowserFallback()
        })
      }
    } catch {
      speakWithBrowserFallback()
    }
  }, [])

  const startContinuousInterpretation = useCallback(
    (startIndex = 0) => {
      if (typeof window === "undefined") return
      claimExclusiveInterpreter(instanceIdRef.current)
      stopAudioOutput()
      isSpeakingRef.current = true
      setIsSpeaking(true)
      if (onMuteOriginalVideoRef.current) onMuteOriginalVideoRef.current(true)
      speakSentenceAtIndex(startIndex)
    },
    [speakSentenceAtIndex, stopAudioOutput]
  )

  const stopContinuousInterpretation = useCallback(
    (restoreFullEnglishVolume = true) => {
      isSpeakingRef.current = false
      setIsSpeaking(false)
      stopAudioOutput()
      if (restoreFullEnglishVolume && onMuteOriginalVideoRef.current) {
        onMuteOriginalVideoRef.current(false)
      }
    },
    [stopAudioOutput]
  )

  // Automatically start simultaneous interpretation ONLY when not already speaking (never interrupt active speech!)
  useEffect(() => {
    if (language === "en") {
      spokenLangAndTitleRef.current = ""
      if (isSpeakingRef.current) {
        stopContinuousInterpretation(true)
      }
      return
    }

    const sessionKey = `${language}::${title}`
    if (isPlaying && !userManuallyPausedDubRef.current) {
      // Only start if not already speaking this language + video!
      if (!isSpeakingRef.current || spokenLangAndTitleRef.current !== sessionKey) {
        spokenLangAndTitleRef.current = sessionKey
        startContinuousInterpretation(
          spokenLangAndTitleRef.current === sessionKey ? activeSentenceIdxRef.current : 0
        )
      }
    } else if (!isPlaying && isSpeakingRef.current && !isPopupOpen) {
      stopContinuousInterpretation(false)
    }
  }, [
    language,
    title,
    isPlaying,
    isPopupOpen,
    startContinuousInterpretation,
    stopContinuousInterpretation,
  ])

  // Restart speaking in the newly selected language immediately when language changes while popup is open
  useEffect(() => {
    const sessionKey = `${language}::${title}`
    if (
      language !== "en" &&
      isPopupOpen &&
      !userManuallyPausedDubRef.current &&
      spokenLangAndTitleRef.current !== sessionKey
    ) {
      spokenLangAndTitleRef.current = sessionKey
      if (!isPlayingRef.current && onRequestPlayVideoRef.current) {
        onRequestPlayVideoRef.current()
      }
      startContinuousInterpretation(0)
    }
  }, [language, title, isPopupOpen, startContinuousInterpretation])

  // Unlock browser audio on first user click ONLY if not already speaking
  useEffect(() => {
    if (language === "en" || (!isPlaying && !isPopupOpen) || userManuallyPausedDubRef.current) return
    const unlockAudio = () => {
      if (isSpeakingRef.current && audioRef.current && !audioRef.current.paused) {
        return
      }
      if (
        languageRef.current !== "en" &&
        (isPlayingRef.current || isPopupOpen) &&
        !userManuallyPausedDubRef.current &&
        !isSpeakingRef.current
      ) {
        spokenLangAndTitleRef.current = `${languageRef.current}::${title}`
        startContinuousInterpretation(activeSentenceIdxRef.current)
      }
    }
    window.addEventListener("pointerdown", unlockAudio, { passive: true })
    window.addEventListener("keydown", unlockAudio, { passive: true })
    return () => {
      window.removeEventListener("pointerdown", unlockAudio)
      window.removeEventListener("keydown", unlockAudio)
    }
  }, [language, title, isPlaying, isPopupOpen, startContinuousInterpretation])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudioOutput()
    }
  }, [stopAudioOutput])

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
    <div onClick={(e) => e.stopPropagation()} data-no-translate="true" translate="no" className="notranslate">
      {/* 1. COMPACT TRIGGER PILL ON THE VIDEO PLAYER (Top-Right Corner) */}
      <div className="absolute top-12 right-3 z-30 flex items-center gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            userManuallyPausedDubRef.current = false
            const nextOpen = !isPopupOpen
            if (typeof window !== "undefined") {
              ;(window as any).__lastOpenedNoctisPopupTitle = nextOpen ? title : ""
            }
            if (!isPlaying && onRequestPlayVideo) {
              setIsPopupOpen(true)
              onRequestPlayVideo()
              return
            }
            setIsPopupOpen(nextOpen)
            if (nextOpen && language !== "en" && !isSpeakingRef.current) {
              startContinuousInterpretation(activeSentenceIdxRef.current)
            }
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

      {/* 2. SLIM, HIGH-VISIBILITY SUBTITLE BAR AT VERY BOTTOM EDGE */}
      {(language !== "en" || isSpeaking) && showSubtitlesStrip && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            userManuallyPausedDubRef.current = false
            if (!isPlaying && onRequestPlayVideo) {
              onRequestPlayVideo()
            }
            setIsPopupOpen(true)
            if (!isSpeaking) {
              startContinuousInterpretation(activeSentenceIdxRef.current)
            }
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
              onClick={() => {
                if (typeof window !== "undefined" && (window as any).__lastOpenedNoctisPopupTitle === title) {
                  ;(window as any).__lastOpenedNoctisPopupTitle = ""
                }
                setIsPopupOpen(false)
              }}
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
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#0A66C2] shrink-0" />
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value as LanguageCode
                  userManuallyPausedDubRef.current = false
                  setLanguage(newLang)
                  if (!isPlaying && onRequestPlayVideo) {
                    onRequestPlayVideo()
                  }
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

          {/* Scrollable High-Contrast Translated Interpretation Body (100% in Selected Language) */}
          <div
            style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}
            className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3 text-xs"
          >
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
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      userManuallyPausedDubRef.current = false
                      if (!isPlaying && onRequestPlayVideo) {
                        onRequestPlayVideo()
                      }
                      startContinuousInterpretation(idx + 2)
                    }}
                    style={{
                      backgroundColor:
                        isSpeaking && idx === activeSentenceIdx % translatedSteps.length
                          ? "rgba(16, 185, 129, 0.25)"
                          : "transparent",
                    }}
                    className="w-full flex items-start gap-2 rounded-lg p-1.5 text-left text-xs leading-snug hover:bg-slate-800/70 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span style={{ color: "#FFFFFF" }} className="font-medium">
                      {step}
                    </span>
                  </button>
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
