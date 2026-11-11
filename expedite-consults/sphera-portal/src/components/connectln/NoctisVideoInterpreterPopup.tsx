"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { Sparkles, Volume2, VolumeX, Globe, X, Subtitles, Send, CheckCircle2, Radio, Mic } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { LanguageCode, SUPPORTED_LANGUAGES } from "@/lib/translations"
import { translateLinesLive, translateTextLive } from "@/lib/live-page-translator"
import { getVerbatimSpokenSegmentsForVideo } from "@/lib/video-verbatim-transcripts"

export const NOCTIS_LANGUAGE_COMMAND_EVENT = "connectln:noctis-command-language"

const LANGUAGE_COMMAND_ALIASES: Array<{ code: LanguageCode; patterns: RegExp[] }> = [
  { code: "zh", patterns: [/\b(chinese|mandarin|cantonese|chinois|chino|chiński|chińskim|chinesisch|chinês)\b/i, /中文|汉语|漢語|普通话|国语/] },
  { code: "es", patterns: [/\b(spanish|español|espanol|espagnol|hiszpański|hiszpańskim|spanisch|espanhol|castellano)\b/i] },
  { code: "pl", patterns: [/\b(polish|polski|polskim|polonais|polaco|polnisch|polonês)\b/i] },
  { code: "fr", patterns: [/\b(french|français|francais|francés|frances|francuski|francuskim|französisch|francês|in france)\b/i] },
  { code: "vi", patterns: [/\b(vietnamese|vietnamis|vietnamien|vietnamita|wietnamski|tiếng việt|tieng viet)\b/i] },
  { code: "en", patterns: [/\b(english|anglais|inglés|ingles|angielski|angielskim|englisch|inglês|borɔfo|bekee|turanci)\b/i] },
  { code: "ak", patterns: [/\b(twi|akan|asante)\b/i] },
  { code: "ee", patterns: [/\b(ewe|eʋegbe|evegbe)\b/i] },
  { code: "gaa", patterns: [/\b(ga language|gã|in ga)\b/i] },
  { code: "ha", patterns: [/\b(hausa|harshen hausa)\b/i] },
  { code: "yo", patterns: [/\b(yoruba|yorùbá)\b/i] },
  { code: "ig", patterns: [/\b(igbo|ìgbò)\b/i] },
  { code: "sw", patterns: [/\b(swahili|kiswahili)\b/i] },
  { code: "am", patterns: [/\b(amharic)\b/i, /አማርኛ/] },
  { code: "om", patterns: [/\b(oromo|afaan oromoo)\b/i] },
  { code: "so", patterns: [/\b(somali|soomaali)\b/i] },
  { code: "zu", patterns: [/\b(zulu|isizulu)\b/i] },
  { code: "xh", patterns: [/\b(xhosa|isixhosa)\b/i] },
  { code: "rw", patterns: [/\b(kinyarwanda|ikinyarwanda)\b/i] },
  { code: "sn", patterns: [/\b(shona|chishona)\b/i] },
  { code: "wo", patterns: [/\b(wolof)\b/i] },
  { code: "lg", patterns: [/\b(luganda|oluganda)\b/i] },
  { code: "de", patterns: [/\b(german|deutsch|allemand|alemán|aleman|niemiecki|niemiecko|alemão)\b/i] },
  { code: "pt", patterns: [/\b(portuguese|português|portugues|portugais|portugalski)\b/i] },
  { code: "it", patterns: [/\b(italian|italiano|italien|włoski|italienisch)\b/i] },
  { code: "nl", patterns: [/\b(dutch|nederlands|néerlandais|holandés|niderlandzki)\b/i] },
  { code: "uk", patterns: [/\b(ukrainian|ukrainien|ucraniano|ukraiński)\b/i, /українська/i] },
  { code: "ru", patterns: [/\b(russian|russe|ruso|rosyjski|russisch)\b/i, /русский/i] },
  { code: "tr", patterns: [/\b(turkish|türkçe|turkce|turc|turco|turecki)\b/i] },
  { code: "el", patterns: [/\b(greek|grec|griego|grecki)\b/i, /ελληνικά/i] },
  { code: "sv", patterns: [/\b(swedish|svenska|suédois|sueco|szwedzki)\b/i] },
  { code: "ar", patterns: [/\b(arabic|arabe|árabe|arabski|arabisch)\b/i, /العربية|عربي/] },
  { code: "fa", patterns: [/\b(persian|farsi|persan|persa)\b/i, /فارسی/] },
  { code: "he", patterns: [/\b(hebrew|hébreu|hebreo|hebrajski)\b/i, /עברית/] },
  { code: "hi", patterns: [/\b(hindi)\b/i, /हिन्दी|हिंदी/] },
  { code: "bn", patterns: [/\b(bengali|bangla)\b/i, /বাংলা/] },
  { code: "ur", patterns: [/\b(urdu)\b/i, /اردو/] },
  { code: "pa", patterns: [/\b(punjabi)\b/i, /ਪੰਜਾਬੀ/] },
  { code: "ta", patterns: [/\b(tamil)\b/i, /தமிழ்/] },
  { code: "ja", patterns: [/\b(japanese|japonais|japonés|japones|japoński|japanisch)\b/i, /日本語/] },
  { code: "ko", patterns: [/\b(korean|coréen|coreano|koreański)\b/i, /한국어/] },
  { code: "th", patterns: [/\b(thai|thaï|tailandés)\b/i, /ไทย/] },
  { code: "id", patterns: [/\b(indonesian|bahasa indonesia|indonésien|indonesio)\b/i] },
  { code: "ms", patterns: [/\b(malay|bahasa melayu|malais)\b/i] },
  { code: "tl", patterns: [/\b(filipino|tagalog)\b/i] },
]

/**
 * Parses natural-language commands such as:
 * - "Play this video in Chinese"
 * - "Interpret in Spanish"
 * - "Speak Polish"
 * - "Translate audio to French"
 * - Or simply typing/saying a language name ("Chinese", "Spanish", "Polish", "French", "Vietnamese", "Twi")
 */
export function parseNoctisLanguageCommand(rawInput: string): LanguageCode | null {
  const text = (rawInput || "").trim()
  if (!text) return null

  for (const entry of LANGUAGE_COMMAND_ALIASES) {
    if (entry.patterns.some((re) => re.test(text))) {
      return entry.code
    }
  }

  const lower = text.toLowerCase()
  for (const meta of SUPPORTED_LANGUAGES) {
    if (
      lower === meta.code.toLowerCase() ||
      lower.includes(meta.name.toLowerCase()) ||
      lower.includes(meta.localName.toLowerCase())
    ) {
      return meta.code
    }
  }

  return null
}

export function dispatchNoctisLanguageCommand(langCode: LanguageCode) {
  if (typeof window === "undefined") return
  ;(window as any).__noctisPreferredAudioLang = langCode
  window.dispatchEvent(
    new CustomEvent(NOCTIS_LANGUAGE_COMMAND_EVENT, { detail: { langCode } })
  )
}

export interface NoctisVideoInterpreterProps {
  youtubeId?: string
  title: string
  speaker?: string
  speakerRole?: string
  serialPlate?: string
  description?: string
  takeaways?: string[]
  /** Spoken language of the source video (defaults to "en"). If non-English (e.g. "es", "fr", "ja") and user is on English, Noctis interprets it into English! */
  sourceLanguage?: string
  sourceLanguageLabel?: string
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

const SPEECH_LOCALE_MAP: Partial<Record<LanguageCode, string>> = {
  en: "en-US",
  ak: "ak-GH",
  ee: "ee-GH",
  gaa: "ak-GH",
  ha: "ha-NG",
  yo: "yo-NG",
  ig: "ig-NG",
  sw: "sw-KE",
  am: "am-ET",
  om: "om-ET",
  so: "so-SO",
  zu: "zu-ZA",
  xh: "xh-ZA",
  rw: "rw-RW",
  sn: "sn-ZW",
  wo: "wo-SN",
  lg: "lg-UG",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-BR",
  it: "it-IT",
  nl: "nl-NL",
  pl: "pl-PL",
  uk: "uk-UA",
  ru: "ru-RU",
  tr: "tr-TR",
  el: "el-GR",
  sv: "sv-SE",
  ar: "ar-SA",
  fa: "fa-IR",
  he: "he-IL",
  hi: "hi-IN",
  bn: "bn-BD",
  ur: "ur-PK",
  pa: "pa-IN",
  ta: "ta-IN",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
  vi: "vi-VN",
  th: "th-TH",
  id: "id-ID",
  ms: "ms-MY",
  tl: "fil-PH",
}

// Instant native translations for common skilled-trades & platform video titles, descriptions, and takeaways
const NATIVE_VIDEO_PHRASES: Partial<Record<Exclude<LanguageCode, "en">, Record<string, string>>> = {
  ak: {
    "Carpentry Basics: Marking and Checking Angles": "Duadwuma Mfitiaseɛ: Ntwea Agyiraehyɛ ne Nhwehwɛmu",
    "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.":
      "Adesuafoɔ sua sɛnea susudua boa ma wɔhyɛ ntwea agyiraeɛ pɛpɛɛpɛ, na wɔhwɛ sɛ ntwea no gyina hɔ tẽẽ ansa na wɔatwa nnua no aka abom.",
    "Speed Square Layout": "Susudua Nhyehyɛeɛ ne Nsusuwiiɛ",
    "Marking 90° Perpendicular Lines": "Nsensaneeɛ Tẽẽ Agyiraehyɛ Pɛpɛɛpɛ",
    "Marking 45° Miter Angles": "Ntwea Nkyekyɛmu Agyiraehyɛ",
    "Checking Corner Squareness": "Ntwea Pɛpɛɛpɛ Nhwehwɛmu",
  },
  ee: {
    "Carpentry Basics: Marking and Checking Angles": "Atikpakpa Gɔmedzenuwo: Dzogoewo Dzesiɖoɖo Kple Dodokpɔ",
    "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.":
      "Nusrɔ̃lawo srɔ̃a ale si dzidzenu kpena ɖe ame ŋu woɖoa dzesi dzogoewo, eye wokpɔa egbɔ be dzogoewo sɔ nyuie hafi woatso atia aƒo ƒu.",
    "Speed Square Layout": "Dzidzenu Ɖoɖo Kple Dzesiɖoɖo",
    "Marking 90° Perpendicular Lines": "Fli Dzɔdzɔewo Dzesiɖoɖo Pɛpɛpɛ",
    "Marking 45° Miter Angles": "Dzogoewo Dzesiɖoɖo Nyuie",
    "Checking Corner Squareness": "Dzogoewo Ƒe Sɔsɔ Dodokpɔ",
  },
  gaa: {
    "Carpentry Basics: Marking and Checking Angles": "Gbɛjianɔtoo Shishijee: Koŋi Kadimɔ Kɛ Kwɛmɔ",
    "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.":
      "Nikaselɔi kaseɔ bɔ ni susumɔ dade yeɔ ebuaa kɛkadiɔ koŋi, ni akwɛɔ akɛ koŋi lɛ ja jogbaŋŋ dani afolɔ tsei lɛ.",
    "Speed Square Layout": "Susumɔ Dade Nitsumɔ Kɛ Kadimɔ",
    "Marking 90° Perpendicular Lines": "Fligbɛi Jajɛi Kadimɔ",
    "Marking 45° Miter Angles": "Koŋi Kadimɔ Jogbaŋŋ",
    "Checking Corner Squareness": "Koŋi Jajamɔ Kwɛmɔ",
  },
  ha: {
    "Carpentry Basics: Marking and Checking Angles": "Tushen Aikin Kafinta: Yin Alama da Duba Kusurwoyi",
    "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.":
      "Dalibai suna koyon yadda ma'aunin kusurwa ke taimakawa wajen yi wa katako alama da tabbatar da daidaiton kusurwa kafin yankawa da haɗawa.",
    "Speed Square Layout": "Tsarin Ma'aunin Kusurwa",
    "Marking 90° Perpendicular Lines": "Yin Alamar Layukan 90° Madaidaici",
    "Marking 45° Miter Angles": "Yin Alamar Kusurwar 45°",
    "Checking Corner Squareness": "Duba Daidaiton Kusurwoyi",
  },
  yo: {
    "Carpentry Basics: Marking and Checking Angles": "Ìpìlẹ̀ Iṣẹ́ Káfíńtà: Fífi Àmì Sí àti Yíyẹ Àwọn Igùn Wò",
    "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.":
      "Àwọn akẹ́kọ̀ọ́ ń kọ́ bí irinṣẹ́ ìwọ̀n igùn ṣe ń ràn wọ́n lọ́wọ́ láti fi àmì sí àwọn igùn àti láti rí i dájú pé igùn náà gún régé kí wọ́n tó gé igi.",
    "Speed Square Layout": "Ìlànà Irinṣẹ́ Ìwọ̀n Igùn",
    "Marking 90° Perpendicular Lines": "Fífi Àmì Sí Ìlà 90° Títọ́",
    "Marking 45° Miter Angles": "Fífi Àmì Sí Igùn 45°",
    "Checking Corner Squareness": "Yíyẹ Bóyá Igùn Gún Régé Wò",
  },
  ig: {
    "Carpentry Basics: Marking and Checking Angles": "Ntọala Ọrụ Ọkwa Nka: Ịka Akara na Ịlele Nkuku",
    "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.":
      "Ndị na-amụ ihe na-achọpụta otu ngwá ọrụụtụ nkuku si enyere aka ịka akara nkuku ma lelee ma nkuku hà kwụ ọtọ tupu ịkpụ na ijikọ osisi.",
    "Speed Square Layout": "Nhazi Ngwá Ọrụ Ụtụ Nkuku",
    "Marking 90° Perpendicular Lines": "Ịka Akara Ahịrị 90° Kwụ Ọtọ",
    "Marking 45° Miter Angles": "Ịka Akara Nkuku 45°",
    "Checking Corner Squareness": "Ịlele Igwe Ngụkọta Nkuku",
  },
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
  pl: {
    "Carpentry Basics: Marking and Checking Angles": "Podstawy ciesielstwa: trasowanie i sprawdzanie kątów",
    "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.":
      "Uczestnicy poznają, jak kątownik ciesielski pomaga wyznaczać kąty i sprawdzać prostopadłość narożników przed przystąpieniem do cięcia i montażu.",
    "Speed Square Layout": "Trasowanie kątownikiem ciesielskim (Speed Square)",
    "Marking 90° Perpendicular Lines": "Wyznaczanie linii prostopadłych 90°",
    "Marking 45° Miter Angles": "Wyznaczanie kątów uciosowych 45°",
    "Checking Corner Squareness": "Sprawdzanie kąta prostego w narożnikach",
  },
  vi: {
    "Carpentry Basics: Marking and Checking Angles": "Cơ bản nghề mộc: Đánh dấu và kiểm tra góc vuông",
    "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.":
      "Học viên khám phá cách thước ê-ke tam giác giúp lấy dấu các góc chính xác và kiểm tra độ vuông góc trước khi tiến hành cắt và lắp ráp.",
    "Speed Square Layout": "Lấy dấu bằng thước ê-ke tam giác (Speed Square)",
    "Marking 90° Perpendicular Lines": "Kẻ đường vuông góc 90° chính xác",
    "Marking 45° Miter Angles": "Đánh dấu góc cắt mộng 45°",
    "Checking Corner Squareness": "Kiểm tra độ vuông góc của các cạnh",
  },
  it: {
    "Carpentry Basics: Marking and Checking Angles": "Basi di falegnameria: tracciare e verificare gli angoli",
    "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.":
      "Scopri come la squadra rapida aiuta a tracciare angoli precisi e a verificare la squadratura degli spigoli prima del taglio e dell'assemblaggio.",
    "Speed Square Layout": "Tracciatura con la squadra rapida (Speed Square)",
    "Marking 90° Perpendicular Lines": "Tracciatura di linee perpendicolari a 90°",
    "Marking 45° Miter Angles": "Tracciatura di angoli di quartabuono a 45°",
    "Checking Corner Squareness": "Verifica della squadratura degli angoli",
  },
}

const NATIVE_TEMPLATE_LANGS: LanguageCode[] = [
  "ak",
  "ee",
  "gaa",
  "ha",
  "yo",
  "ig",
  "pt",
  "es",
  "fr",
  "de",
  "zh",
  "ja",
  "ar",
  "hi",
  "sw",
  "ru",
  "pl",
  "vi",
  "it",
  "nl",
  "uk",
  "tr",
  "ko",
]

// 100% Native Localized Simultaneous Interpretation Scripts across world & African languages
function buildNativeLocalizedTemplate(
  lang: LanguageCode,
  translatedTitle: string,
  speaker: string,
  translatedDesc: string,
  translatedTakeaways: string[]
): { overview: string; steps: string[] } {
  switch (lang) {
    case "ak":
      return {
        overview: `Akwaaba ba nsaanodwuma adesua yi mu: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Nea ɛdi kan, Nnwinnadeɛ Ahoboa: Kyerɛkyerɛfoɔ no de susudua no to dua no ano pɛpɛɛpɛ, na ɔhwɛ sɛ ɛhyia yie ansa na wahyɛ agyiraeɛ.`,
          `Nea ɛtɔ so mmienu, Ntwea Agyiraehyɛ Wɔ Pon So: Hwɛ sɛnea kyerɛkyerɛfoɔ no sɔ adwinnadeɛ no mu dennen twa nsensaneeɛ tẽẽ pɛpɛɛpɛ.`,
          `Nea ɛtɔ so mmiɛnsa, Nhwehwɛmu ne Ahobammɔ: Wɔsan susuw ntwea biara mprenu ansa na wɔatwa dua no, sɛnea mfomsoɔ biara remma wɔ adwuma no mu.`,
          `Nea ɛtɔ so nnan, Nkyerɛaseɛ Toa So: Video no ankasa nne yɛ brɛoo wɔ akyi, na yɛrekyerɛ aseɛ wɔ Twi kasa mu kɔsi video no awiei.`,
        ],
      }
    case "ee":
      return {
        overview: `Woezɔ va dɔwɔwɔ ƒe nusrɔ̃ƒe sia: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Gbãtɔ, Dɔwɔnuwo Dzadzraɖo: Nufiala la daa dzidzenu la ɖe atia ƒe to tututu, eye wòléa ŋku ɖe eŋu nyuie hafi ɖoa dzesi.`,
          `Evelia, Dzogoewo Dzesiɖoɖo Pɛpɛpɛ: Kpɔ ale si nufiala la lé dɔwɔnua sesĩe be wòate fli dzɔdzɔe nyuie.`,
          `Etɔ̃lia, Dodokpɔ Kple Dedienɔnɔ: Wodoa dzogoe sia dzogoe kpɔna zi eve hafi tsoa atia be vodada aɖeke nagava o.`,
          `Enelia, Gbegɔmeɖeɖe Yi Edzi: Video la ƒe gbeɖiɖi bɔbɔ ɖe megbe, eye míele egɔme ɖem ɖe Eʋegbe me vaseɖe nuwuwu.`,
        ],
      }
    case "gaa":
      return {
        overview: `Atuu kɛba nitsumɔ nikasemɔ nɛɛ mli: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Klɛŋklɛŋ, Nitsumɔnii Toomɔ: Tsɔɔlɔ lɛ maa susumɔ dade lɛ yɛ tso lɛ naa pɛpɛɛpɛ dani ekadiɔ.`,
          `Enyɔ, Koŋi Kadimɔ Yɛ Okpɔlɔ Nɔ: Kwɛmɔ bɔ ni tsɔɔlɔ lɛ hiɛɔ dade lɛ mli kpɛŋŋ kɛha fligbɛi jajɛi.`,
          `Etɛ, Kwɛmɔ Jogbaŋŋ: Akwɛɔ koŋi fɛɛ koŋi shii enyɔ dani afolɔ tso lɛ.`,
          `Ejwɛ, Wiemɔ Shishitsɔɔmɔ: Video lɛ gbee baa shi yɛ sɛɛ, ni atsɔɔ shishi yɛ Gã mli kɛyashi naagbee.`,
        ],
      }
    case "ha":
      return {
        overview: `Barka da zuwa wannan darasin koyon aiki: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Mataki na farko, Shirya Kayan Aiki: Malamin yana sanya ma'aunin a gefen katako don tabbatar da daidaito kafin yin alama.`,
          `Mataki na biyu, Yin Alama Daidai: Lura da yadda malamin ke riƙe ma'aunin sosai don zana layuka madaidaici.`,
          `Mataki na uku, Duba Inganci da Tsaro: Ana auna kowace kusurwa sau biyu kafin yankawa don guje wa kuskure.`,
          `Mataki na huɗu, Fassara Har Karshe: Muryar asali ta bidiyon tana ƙasa a baya yayin da ake ci gaba da fassara cikin harshen Hausa har zuwa ƙarshen bidiyon.`,
        ],
      }
    case "yo":
      return {
        overview: `Ẹ káàbọ̀ sí ìdánilẹ́kọ̀ọ́ iṣẹ́-ọwọ́ yìí: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Ìpele kìíní, Ìmúrasílẹ̀ Irinṣẹ́: Olùkọ́ náà gbé irinṣẹ́ ìwọ̀n sórí etí igi láti rí i dájú pé ó dọ́gba kí ó tó fi àmì sí i.`,
          `Ìpele kejì, Fífi Àmì Sí Igùn Pẹ̀lú Ìpéye: Ẹ kíyè sí bí olùkọ́ náà ṣe di irinṣẹ́ náà mú ṣinṣin láti fa ìlà títọ́ gún régé.`,
          `Ìpele kẹta, Àyẹ̀wò Ìdánilójú: Gbogbo igùn ni a ń yẹ̀ wò lẹ́ẹ̀mejì kí a tó gé igi náà.`,
          `Ìpele kẹrin, Ìtumọ̀ Títí Dé Opin: Ohùn fídíò náà wà ní ìsàlẹ̀ nígbà tí a ń gbé ìtumọ̀ jáde ní Èdè Yorùbá títí dé ìparí fídíò náà.`,
        ],
      }
    case "ig":
      return {
        overview: `Nnọọ na ọmụmụ ihe ọrụ aka a: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Nzọụkwụ nke mbụ, Nkwadebe Ngwá Ọrụ: Onye nkuzi ahụ na-etinye ngwá ọrụ n'akụkụ osisi iji hụ na ọ kwụ ọtọ tupu ịka akara.`,
          `Nzọụkwụ nke abụọ, Ịka Akara Ziri Ezi: Hụ ka onye nkuzi si ejide ngwá ọrụ ahụ ike iji dọta ahịrị kwụ ọtọ ziri ezi.`,
          `Nzọụkwụ nke atọ, Nyocha Ọdịmma na Nchekwa: A na-elele nkuku ọ bụla ugboro abụọ tupu ịkpụ osisi.`,
          `Nzọụkwụ nke anọ, Ntụgharị Asụsụ Ruo Njedebe: Olu vidio dị ala n'azụ ebe anyị na-atụgharị n'asụsụ Igbo ruo na ngwụcha vidio a.`,
        ],
      }
    case "pt":
      return {
        overview: `Bem-vindo a esta aula prática ao vivo: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Primeiro passo, preparação das ferramentas: O instrutor posiciona a ferramenta de referência e verifica o alinhamento antes de iniciar a marcação.`,
          `Segundo passo, execução precisa na bancada: Observe como o instrutor mantém o instrumento firme para garantir precisão técnica absoluta.`,
          `Terceiro passo, inspeção de qualidade e segurança: Cada medida e conexão é verificada duas vezes para evitar retrabalho na obra.`,
          `Quarto passo, aplicação prática: Continue acompanhando a demonstração ao vivo enquanto o áudio original do vídeo permanece baixo ao fundo.`,
        ],
      }
    case "es":
      return {
        overview: `Bienvenido a esta clase práctica en vivo: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Primer paso, preparación de herramientas: El instructor prepara el equipo de referencia y verifica la alineación antes de comenzar.`,
          `Segundo paso, ejecución precisa en el banco: Observe cómo el instructor ejecuta cada movimiento con precisión técnica y control seguro.`,
          `Tercer paso, inspección de calidad y seguridad: Cada unión, ángulo y medida se comprueba dos veces para garantizar calidad profesional.`,
          `Cuarto paso, aplicación práctica: Siga viendo la demostración mientras el audio original del video se mantiene suave de fondo y Noctis interpreta en Español.`,
        ],
      }
    case "fr":
      return {
        overview: `Bienvenue dans cette séance pratique en direct : ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Première étape, préparation des outils : L'instructeur prépare les outils de référence et vérifie l'alignement avant l'exécution.`,
          `Deuxième étape, exécution précise sur l'établi : Observez comment l'instructeur maintient fermement l'outil pour garantir une précision technique parfaite.`,
          `Troisième étape, contrôle qualité et sécurité : Chaque mesure et assemblage est vérifié deux fois pour garantir un résultat irréprochable sur le chantier.`,
          `Quatrième étape, application pratique : Suivez la démonstration continue pendant que l'audio original de la vidéo reste très doux en arrière-plan.`,
        ],
      }
    case "pl":
      return {
        overview: `Witamy na praktycznym szkoleniu technicznym na żywo: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Krok pierwszy, przygotowanie narzędzi i stanowiska: Instruktor ustawia narzędzia pomiarowe i dokładnie sprawdza wyrównanie przed rozpoczęciem pracy.`,
          `Krok drugi, precyzyjne wykonanie na warsztacie: Zwróć uwagę, jak instruktor pewnie prowadzi narzędzie, zachowując pełną dokładność wymiarową.`,
          `Krok trzeci, kontrola jakości i bezpieczeństwa: Każde połączenie oraz pomiar są sprawdzane dwukrotnie przed montażem końcowym.`,
          `Krok czwarty, tłumaczenie symultaniczne do końca: Oryginalny dźwięk wideo jest wyciszony w tle, a Noctis tłumaczy całe szkolenie na język polski.`,
        ],
      }
    case "vi":
      return {
        overview: `Chào mừng bạn đến với buổi đào tạo thực hành trực tiếp: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Bước một, chuẩn bị dụng cụ và mặt phẳng chuẩn: Giảng viên kiểm tra độ chính xác của dụng cụ đo và căn chỉnh kỹ lưỡng trước khi thao tác.`,
          `Bước hai, thực hành kỹ thuật chính xác: Quan sát cách giảng viên cố định phôi và thao tác chuẩn xác theo đúng tiêu chuẩn kỹ thuật.`,
          `Bước ba, kiểm tra chất lượng và an toàn: Mọi góc độ và mối ghép đều được đo kiểm hai lần để đảm bảo độ bền vững tuyệt đối.`,
          `Bước bốn, phiên dịch cabin liên tục: Âm thanh gốc của video đã được hạ nhỏ ở nền trong khi Noctis thuyết minh trực tiếp bằng Tiếng Việt đến cuối bài.`,
        ],
      }
    case "it":
      return {
        overview: `Benvenuti a questa sessione pratica dal vivo: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Primo passo, preparazione degli utensili: L'istruttore posiziona gli strumenti di misura e verifica l'allineamento prima di iniziare.`,
          `Secondo passo, esecuzione precisa sul banco: Osservate come l'istruttore mantiene saldo l'utensile per garantire la massima precisione.`,
          `Terzo passo, controllo qualità e sicurezza: Ogni misura e giunzione viene controllata due volte prima del completamento.`,
          `Quarto passo, interpretazione simultanea continua: L'audio originale del video resta basso in sottofondo mentre Noctis traduce in Italiano fino alla fine.`,
        ],
      }
    case "nl":
      return {
        overview: `Welkom bij deze praktische trainingssessie: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Stap één, voorbereiding van het gereedschap: De instructeur controleert de uitlijning en het meetgereedschap vóór de uitvoering.`,
          `Stap twee, nauwkeurige uitvoering op de werkbank: Let op hoe de instructeur het gereedschap stevig vasthoudt voor maximale precisie.`,
          `Stap drie, kwaliteits- en veiligheidscontrole: Elke maat en verbinding wordt dubbel gecontroleerd.`,
          `Stap vier, continue simultaanvertaling: Het originele videogeluidsniveau blijft zacht op de achtergrond terwijl Noctis in het Nederlands vertaalt.`,
        ],
      }
    case "uk":
      return {
        overview: `Ласкаво просимо на практичне заняття: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Крок перший, підготовка інструменту: Інструктор перевіряє вирівнювання та точність інструментів перед початком роботи.`,
          `Крок другий, точне виконання на верстаті: Зверніть увагу, як інструктор надійно фіксує інструмент для максимальної точності.`,
          `Крок третій, контроль якості та безпеки: Кожен вимір і з'єднання перевіряються двічі.`,
          `Крок четвертий, безперервний синхронний переклад: Оригінальний звук відео приглушено на фоні, а Noctis перекладає урок українською мовою.`,
        ],
      }
    case "tr":
      return {
        overview: `Bu uygulamalı canlı eğitim oturumuna hoş geldiniz: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Birinci adım, ekipman hazırlığı: Eğitmen işe başlamadan önce ölçü aletlerini ve hizalamayı dikkatle kontrol eder.`,
          `İkinci adım, tezgahta hassas uygulama: Eğitmenin tam doğruluk sağlamak için aleti nasıl sabit tuttuğuna dikkat edin.`,
          `Üçüncü adım, kalite ve güvenlik kontrolü: Her açı ve bağlantı kesim veya montaj öncesinde iki kez kontrol edilir.`,
          `Dördüncü adım, kesintisiz simultane çeviri: Videonun orijinal sesi arka planda kısılırken Noctis eğitimi sonuna kadar Türkçe olarak seslendirir.`,
        ],
      }
    case "ko":
      return {
        overview: `실전 기술 교육 세션에 오신 것을 환영합니다: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `1단계, 공구 및 기준면 준비: 강사가 작업 시작 전 측정 공구와 기준선 정렬을 정밀하게 확인합니다.`,
          `2단계, 작업대에서의 정밀 시공: 정확한 각도와 치수를 유지하기 위해 공구를 단단히 고정하는 방법을 확인하세요.`,
          `3단계, 품질 및 안전 이중 점검: 모든 접합부와 치수를 두 번씩 확인하여 시공 오차를 방지합니다.`,
          `4단계, 연속 동시통역: 원본 비디오 오디오는 배경으로 낮추고 영상이 끝날 때까지 한국어로 동시통역을 제공합니다.`,
        ],
      }
    case "de":
      return {
        overview: `Willkommen zu dieser praktischen Lehrstunde: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Erster Schritt, Werkzeugvorbereitung: Der Ausbilder legt das Messwerkzeug an und prüft die Ausrichtung vor dem Arbeitsbeginn.`,
          `Zweiter Schritt, präzise Ausführung an der Werkbank: Beachten Sie, wie der Ausbilder das Werkzeug fest am Werkstück führt.`,
          `Dritter Schritt, Qualitäts- und Sicherheitsprüfung: Jedes Maß wird doppelt kontrolliert, um höchste Passgenauigkeit zu sichern.`,
          `Vierter Schritt, Praxisanwendung: Verfolgen Sie die Demonstration weiter, während der Originalton des Videos ganz leise im Hintergrund läuft.`,
        ],
      }
    case "zh":
      return {
        overview: `欢迎来到实操教学课堂：${translatedTitle}。${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `第一步，工具与基准准备：讲师将测量与操作工具紧贴基准边，在施工前仔细确认对齐精度。`,
          `第二步，工作台精准实操：请注意讲师如何稳固操作工具，确保每一个角度与连接完全符合专业标准。`,
          `第三步，质量与安全复核：在正式完成前对每个节点进行二次测量，确保施工现场零误差。`,
          `第四步，现场应用：视频原声已调低至背景音量，Noctis 将持续为您全程中文同声传译直至视频结束。`,
        ],
      }
    case "ja":
      return {
        overview: `実践トレーニングセッションへようこそ：${translatedTitle}。${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `ステップ1、工具と基準面の準備：講師が基準端に工具を当て、作業前の密着と精度を確認します。`,
          `ステップ2、作業台での正確な実演：正確な角度と寸法を保つための手の固定方法に注目してください。`,
          `ステップ3、品質と安全のダブルチェック：すべての角度と接合精度を再確認し、現場での手戻りを防ぎます。`,
          `ステップ4、実践応用：動画の原音は小音量で背景に流れ、動画の最後まで日本語で同時通訳を続けます。`,
        ],
      }
    case "ar":
      return {
        overview: `مرحباً بكم في جلسة التدريب العملي المباشر: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `الخطوة الأولى، تجهيز الأدوات: يضع المدرب أدوات القياس ويتحقق من الاستقامة والمحاذاة قبل البدء.`,
          `الخطوة الثانية، التنفيذ الدقيق على طاولة العمل: لاحظ كيف يثبت المدرب الأداة بإحكام لضمان أعلى درجات الدقة المهنية.`,
          `الخطوة الثالثة، فحص الجودة والسلامة: يتم فحص كل زاوية وقياس مرتين لضمان دقة التركيب في موقع العمل.`,
          `الخطوة الرابعة، التطبيق العملي: تستمر الترجمة الفورية باللغة العربية حتى نهاية الفيديو مع بقاء الصوت الأصلي للفيديو منخفضاً في الخلفية.`,
        ],
      }
    case "hi":
      return {
        overview: `इस लाइव प्रैक्टिकल प्रशिक्षण सत्र में आपका स्वागत है: ${translatedTitle}। ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `पहला चरण, उपकरण की तैयारी: प्रशिक्षक कार्य शुरू करने से पहले उपकरण और संरेखण की सावधानीपूर्वक जाँच करते हैं।`,
          `दूसरा चरण, सटीक तकनीकी निष्पादन: देखें कि प्रशिक्षक पूरी सटीकता के लिए उपकरण को कैसे मज़बूती से पकड़ते हैं।`,
          `तीसरा चरण, गुणवत्ता और सुरक्षा जाँच: प्रत्येक माप और जोड़ को दो बार जाँचा जाता है ताकि काम में पूरी सटीकता रहे।`,
          `चौथा चरण, निरंतर लाइव व्याख्या: वीडियो की मूल आवाज़ पृष्ठभूमि में धीमी है और वीडियो के अंत तक हिंदी में व्याख्या जारी रहेगी।`,
        ],
      }
    case "sw":
      return {
        overview: `Karibu katika kipindi hiki cha mafunzo kwa vitendo: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Hatua ya kwanza, maandalizi ya vifaa: Mwalimu anaweka vifaa vya kupimia na kuhakikisha ulinganifu kabla ya kuanza kazi.`,
          `Hatua ya pili, utekelezaji sahihi mezani: Tazama jinsi mwalimu anavyoshikilia kifaa kwa imara ili kupata vipimo sahihi.`,
          `Hatua ya tatu, ukaguzi wa ubora na usalama: Kila kipimo kinakaguliwa mara mbili ili kuhakikisha kazi bora.`,
          `Hatua ya nne, tafsiri endelevu: Sauti ya asili ya video iko chini kwa mbali huku tafsiri ya Kiswahili ikiendelea hadi mwisho wa video.`,
        ],
      }
    case "ru":
      return {
        overview: `Добро пожаловать на практическое занятие: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Шаг первый, подготовка инструмента: Инструктор проверяет точность и прилегание рабочего инструмента перед началом операции.`,
          `Шаг второй, точное выполнение на верстаке: Обратите внимание, как инструктор фиксирует инструмент для соблюдения всех допусков.`,
          `Шаг третий, контроль качества и точности: Каждое соединение проверяется дважды, чтобы исключить ошибки при сборке.`,
          `Шаг четвёртый, непрерывный синхронный перевод: Оригинальная дорожка видео звучит тихо на фоне, а урок переводится на русский язык до самого конца.`,
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

const UI_LABELS: Partial<
  Record<
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
  >
> = {
  ak: {
    triggerBtn: "Noctis Kasa Kyerɛfoɔ",
    popupTitle: "Noctis AI Video Kasa Kyerɛfoɔ (Twi)",
    popupSubtitle: "Nkyerɛaseɛ Toa So (Borɔfo 4% · Twi Nne Kɔ Soro 260%)",
    listenVoiceDub: "🔊 Tie Nkyerɛaseɛ Wɔ Twi Mu",
    stopVoiceDub: "⏸ Gyina Twi Nkyerɛaseɛ",
    summaryHeading: "Video Mu Nsɛm Titiriw (Twi)",
    stepsHeading: "Anammɔn Biara Nkyerɛaseɛ Kɔsi Awiei",
    askPlaceholder: "Bisa Noctis asɛm biara fa video yi ho...",
    askBtn: "Bisa",
    translating: "Noctis rekyerɛ video yi ase akɔ Twi mu...",
    liveInterpretingBadge: "Twi Nkyerɛaseɛ Rekɔ So · Borɔfo Nne Brɛoo (4%)",
  },
  ee: {
    triggerBtn: "Noctis Gbegɔmeɖela",
    popupTitle: "Noctis AI Video Gbegɔmeɖela (Eʋegbe)",
    popupSubtitle: "Gbegɔmeɖeɖe Yi Edzi (Yevugbe 4% · Eʋegbe Gbe Sesĩe)",
    listenVoiceDub: "🔊 Đó To Gbegɔmeɖeɖe Le Eʋegbe Me",
    stopVoiceDub: "⏸ Dzudzɔ Gbegɔmeɖeɖe Vie",
    summaryHeading: "Video Ƒe Nuƒoƒo Kpui (Eʋegbe)",
    stepsHeading: "Gbegɔmeɖeɖe Ɖeka-Ɖeka Vaseɖe Nuwuwu",
    askPlaceholder: "Bia Noctis be wòaɖe video sia me...",
    askBtn: "Bia",
    translating: "Noctis le video la gɔme ɖem ɖe Eʋegbe me...",
    liveInterpretingBadge: "Eʋegbe Gbegɔmeɖeɖe Le Edzi Yim · Yevugbe Bɔbɔ (4%)",
  },
  gaa: {
    triggerBtn: "Noctis Shishitsɔɔlɔ",
    popupTitle: "Noctis AI Video Shishitsɔɔlɔ (Gã)",
    popupSubtitle: "Shishitsɔɔmɔ (Blɔfo 4% · Gã Gbee Waa)",
    listenVoiceDub: "🔊 Bo Shishitsɔɔmɔ Toi Yɛ Gã Mli",
    stopVoiceDub: "⏸ Wa Shishitsɔɔmɔ",
    summaryHeading: "Video Mli Sane (Gã)",
    stepsHeading: "Shishitsɔɔmɔ Kɛyashi Naagbee",
    askPlaceholder: "Bi Noctis sane yɛ video nɛɛ he...",
    askBtn: "Bi",
    translating: "Noctis miitsɔɔ video lɛ shishi kɛya Gã mli...",
    liveInterpretingBadge: "Gã Shishitsɔɔmɔ Miya Nɔ · Blɔfo Gbee Shi (4%)",
  },
  ha: {
    triggerBtn: "Mai Fassara Noctis",
    popupTitle: "Mai Fassara Bidiyo na Noctis AI (Hausa)",
    popupSubtitle: "Fassara Kai Tsaye (Turanci 4% · Muryar Hausa Mai Ƙarfi)",
    listenVoiceDub: "🔊 Saurari Fassara Cikin Hausa",
    stopVoiceDub: "⏸ Dakatar da Fassara",
    summaryHeading: "Taƙaitaccen Bayanin Bidiyo",
    stepsHeading: "Fassara Daki-daki Har Karshe",
    askPlaceholder: "Tambayi Noctis game da wannan bidiyon...",
    askBtn: "Tambaya",
    translating: "Noctis yana fassara bidiyon zuwa Hausa...",
    liveInterpretingBadge: "Ana Fassara Cikin Hausa · Turanci Ƙasa (4%)",
  },
  yo: {
    triggerBtn: "Ògbùfọ̀ Noctis",
    popupTitle: "Ògbùfọ̀ Fídíò Noctis AI (Yorùbá)",
    popupSubtitle: "Ìtumọ̀ Lójú Ẹsẹ̀ (Gẹ̀ẹ́sì 4% · Ohùn Yorùbá Lókè)",
    listenVoiceDub: "🔊 Tẹ́tí Sí Ìtumọ̀ Ní Èdè Yorùbá",
    stopVoiceDub: "⏸ Dá Ìtumọ̀Dúró",
    summaryHeading: "Àkópọ̀ Fídíò Tí A Túmọ̀",
    stepsHeading: "Ìtumọ̀ Lẹ́sẹẹsẹ Títí Dé Opin",
    askPlaceholder: "Béèrè lọ́wọ́ Noctis nípa fídíò yìí...",
    askBtn: "Béèrè",
    translating: "Noctis ń túmọ̀ fídíò náà sí Yorùbá...",
    liveInterpretingBadge: "Ìtumọ̀ Yorùbá Ń Lọ Lọ́wọ́ · Ohùn Gẹ̀ẹ́sì Ní Ìsàlẹ̀ (4%)",
  },
  ig: {
    triggerBtn: "Onye Ntụgharị Noctis",
    popupTitle: "Onye Ntụgharị Vidio Noctis AI (Igbo)",
    popupSubtitle: "Ntụgharị Na-aga N'ihu (Bekee 4% · Olu Igbo Dị Elu)",
    listenVoiceDub: "🔊 Gee Ntụgharị N'asụsụ Igbo",
    stopVoiceDub: "⏸ Kwụsịtụ Ntụgharị",
    summaryHeading: "Nchịkọta Vidio A Tụgharịrị",
    stepsHeading: "Ntụgharị Nzọụkwụ Ruo Njedebe",
    askPlaceholder: "Jụọ Noctis ka ọ kọwaa akụkụ ọ bụla nke vidio a...",
    askBtn: "Jụọ",
    translating: "Noctis na-atụgharị vidio a n'asụsụ Igbo...",
    liveInterpretingBadge: "Ntụgharị Igbo Na-aga N'ihu · Olu Bekee Dị Ala (4%)",
  },
  en: {
    triggerBtn: "Noctis Interpreter",
    popupTitle: "Noctis Simultaneous Video Interpreter (English)",
    popupSubtitle: "Live English Interpretation (Original Audio Lowered · English Voice Boosted 260%)",
    listenVoiceDub: "🔊 Listen in English",
    stopVoiceDub: "⏸ Pause English Audio",
    summaryHeading: "Interpreted English Video Overview",
    stepsHeading: "Continuous English Simultaneous Interpretation",
    askPlaceholder: "Tell Noctis: “Play this video in Chinese / Spanish / Polish...” or ask a question",
    askBtn: "Send",
    translating: "Noctis is translating this video into English...",
    liveInterpretingBadge: "Speaking in English · Original Video Audio Lowered",
  },
  es: {
    triggerBtn: "Intérprete Noctis",
    popupTitle: "Intérprete Simultáneo IA Noctis (Español)",
    popupSubtitle: "Interpretación continua en Español (Audio original al 4% · Voz aumentada)",
    listenVoiceDub: "🔊 Escuchar en Español",
    stopVoiceDub: "⏸ Pausar Español",
    summaryHeading: "Resumen del video traducido (Español)",
    stepsHeading: "Interpretación simultánea hasta el final",
    askPlaceholder: "Di a Noctis: «Reproducir en Polaco / Chino / Francés...» o haz una pregunta",
    askBtn: "Enviar",
    translating: "Noctis está traduciendo el video al Español...",
    liveInterpretingBadge: "Hablando en Español · Audio original bajo (4%)",
  },
  pt: {
    triggerBtn: "Intérprete Noctis",
    popupTitle: "Intérprete Simultâneo IA Noctis (Português)",
    popupSubtitle: "Interpretação contínua em Português (Áudio original a 4% · Voz ampliada)",
    listenVoiceDub: "🔊 Ouvir em Português",
    stopVoiceDub: "⏸ Pausar Português",
    summaryHeading: "Resumo do vídeo traduzido (Português)",
    stepsHeading: "Interpretação simultânea até o fim",
    askPlaceholder: "Peça ao Noctis: «Reproduzir em Chinês / Espanhol...» ou faça uma pergunta",
    askBtn: "Enviar",
    translating: "Noctis está traduzindo o vídeo para Português...",
    liveInterpretingBadge: "Falando em Português · Áudio original reduzido (4%)",
  },
  fr: {
    triggerBtn: "Interprète Noctis",
    popupTitle: "Interprète Simultané IA Noctis (Français)",
    popupSubtitle: "Interprétation continue en Français (Audio original à 4% · Voix amplifiée)",
    listenVoiceDub: "🔊 Écouter en Français",
    stopVoiceDub: "⏸ Pause Français",
    summaryHeading: "Résumé de la vidéo traduit (Français)",
    stepsHeading: "Interprétation simultanée jusqu'à la fin",
    askPlaceholder: "Dites à Noctis : « Jouer en Chinois / Espagnol / Polonais... » ou posez une question",
    askBtn: "Envoyer",
    translating: "Noctis traduit la vidéo en Français...",
    liveInterpretingBadge: "Voix en Français active · Audio original bas (4%)",
  },
  pl: {
    triggerBtn: "Tłumacz Noctis",
    popupTitle: "Tłumacz Symultaniczny AI Noctis (Polski)",
    popupSubtitle: "Ciągłe tłumaczenie głosowe na Polski (Oryginalny dźwięk 4% · Głos wzmocniony)",
    listenVoiceDub: "🔊 Słuchaj po Polsku",
    stopVoiceDub: "⏸ Wstrzymaj Polski",
    summaryHeading: "Przetłumaczone podsumowanie wideo (Polski)",
    stepsHeading: "Tłumaczenie symultaniczne krok po kroku",
    askPlaceholder: "Powiedz Noctis: „Odtwórz po chińsku / hiszpańsku / francusku...” lub zadaj pytanie",
    askBtn: "Wyślij",
    translating: "Noctis tłumaczy wideo na język polski...",
    liveInterpretingBadge: "Mówi po Polsku · Oryginalny dźwięk wyciszony (4%)",
  },
  vi: {
    triggerBtn: "Phiên dịch Noctis",
    popupTitle: "Phiên Dịch Cabin AI Noctis (Tiếng Việt)",
    popupSubtitle: "Thuyết minh Tiếng Việt liên tục (Âm gốc 4% · Giọng đọc tăng cường)",
    listenVoiceDub: "🔊 Nghe bằng Tiếng Việt",
    stopVoiceDub: "⏸ Tạm dừng Tiếng Việt",
    summaryHeading: "Tóm tắt nội dung video (Tiếng Việt)",
    stepsHeading: "Thuyết minh trực tiếp từng bước đến cuối video",
    askPlaceholder: "Nói với Noctis: “Phát bằng tiếng Trung / Pháp / Tây Ban Nha...” hoặc đặt câu hỏi",
    askBtn: "Gửi",
    translating: "Noctis đang dịch video sang Tiếng Việt...",
    liveInterpretingBadge: "Đang thuyết minh Tiếng Việt · Âm gốc hạ nhỏ (4%)",
  },
  it: {
    triggerBtn: "Interprete Noctis",
    popupTitle: "Interprete Simultaneo IA Noctis (Italiano)",
    popupSubtitle: "Interpretazione continua in Italiano (Audio originale 4% · Voce amplificata)",
    listenVoiceDub: "🔊 Ascolta in Italiano",
    stopVoiceDub: "⏸ Pausa Italiano",
    summaryHeading: "Riepilogo video tradotto (Italiano)",
    stepsHeading: "Interpretazione simultanea fino alla fine",
    askPlaceholder: "Chiedi a Noctis: «Riproduci in Cinese / Spagnolo / Francese...»",
    askBtn: "Invia",
    translating: "Noctis sta traducendo il video in Italiano...",
    liveInterpretingBadge: "Parla in Italiano · Audio originale abbassato (4%)",
  },
  de: {
    triggerBtn: "Noctis Dolmetscher",
    popupTitle: "Noctis KI-Simultandolmetscher (Deutsch)",
    popupSubtitle: "Durchgehende Übersetzung (Originalton 4% · Stimme verstärkt)",
    listenVoiceDub: "🔊 Auf Deutsch anhören",
    stopVoiceDub: "⏸ Deutsch pausieren",
    summaryHeading: "Übersetzte Video-Zusammenfassung (Deutsch)",
    stepsHeading: "Simultandolmetschen bis zum Ende",
    askPlaceholder: "Sagen Sie Noctis: „Auf Chinesisch / Spanisch / Polnisch abspielen...“",
    askBtn: "Senden",
    translating: "Noctis übersetzt das Video ins Deutsche...",
    liveInterpretingBadge: "Spricht Deutsch · Originalton leise (4%)",
  },
  zh: {
    triggerBtn: "Noctis 同声传译",
    popupTitle: "Noctis AI 视频同声传译 (中文)",
    popupSubtitle: "全程连续中文同传（视频原声调低至 4% · 中文语音增强）",
    listenVoiceDub: "🔊 收听中文语音同传",
    stopVoiceDub: "⏸ 暂停中文同传",
    summaryHeading: "视频内容中文概要",
    stepsHeading: "全程分步连续中文同声传译",
    askPlaceholder: "告诉 Noctis：“用中文 / 法语 / 西班牙语 / 波兰语播放” 或提问...",
    askBtn: "发送",
    translating: "Noctis 正在将视频实时同传为中文...",
    liveInterpretingBadge: "正在用中文同声传译 · 视频原声已调低 (4%)",
  },
  ja: {
    triggerBtn: "Noctis 同時通訳",
    popupTitle: "Noctis AI ビデオ同時通訳 (日本語)",
    popupSubtitle: "最後まで連続通訳（原音4%・通訳音声ブースト）",
    listenVoiceDub: "🔊 日本語で聴く",
    stopVoiceDub: "⏸ 日本語を一時停止",
    summaryHeading: "翻訳された動画の概要 (日本語)",
    stepsHeading: "最後まで連続する同時通訳",
    askPlaceholder: "Noctisに「中国語 / スペイン語 / フランス語で再生」と指示、または質問...",
    askBtn: "送信",
    translating: "Noctis が動画を日本語に同時通訳しています...",
    liveInterpretingBadge: "日本語で同時通訳中 · 原音は小音量 (4%)",
  },
  ar: {
    triggerBtn: "مترجم Noctis الفوري",
    popupTitle: "المترجم الفوري الذكي Noctis (العربية)",
    popupSubtitle: "ترجمة صوتية مستمرة (خفض الصوت الأصلي إلى 4% وتقوية صوت الترجمة)",
    listenVoiceDub: "🔊 استمع بالعربية",
    stopVoiceDub: "⏸ إيقاف مؤقت",
    summaryHeading: "ملخص الفيديو المترجم (العربية)",
    stepsHeading: "الترجمة الفورية المستمرة حتى نهاية الفيديو",
    askPlaceholder: "اطلب من Noctis: «شغّل الفيديو بالصينية / الإسبانية / الفرنسية...»",
    askBtn: "إرسال",
    translating: "يقوم Noctis بالترجمة الفورية للفيديو إلى العربية...",
    liveInterpretingBadge: "يتحدث بالعربية · الصوت الأصلي منخفض (4%)",
  },
  hi: {
    triggerBtn: "Noctis लाइव दुभाषिया",
    popupTitle: "Noctis AI लाइव वीडियो दुभाषिया (हिन्दी)",
    popupSubtitle: "अंत तक निरंतर अनुवाद (मूल ऑडियो 4% · अनुवाद की आवाज़ तेज़)",
    listenVoiceDub: "🔊 हिंदी में सुनें",
    stopVoiceDub: "⏸ व्याख्या रोकें",
    summaryHeading: "अनुवादित वीडियो सारांश (हिन्दी)",
    stepsHeading: "अंत तक निरंतर लाइव व्याख्या",
    askPlaceholder: "Noctis से कहें: “यह वीडियो चीनी / स्पेनिश / फ्रेंच में चलाएं”...",
    askBtn: "भेजें",
    translating: "Noctis वीडियो का हिंदी में लाइव अनुवाद कर रहा है...",
    liveInterpretingBadge: "हिंदी में बोल रहा है · मूल आवाज़ धीमी (4%)",
  },
  sw: {
    triggerBtn: "Mkalimani wa Noctis",
    popupTitle: "Mkalimani wa Moja kwa Moja wa Noctis AI (Kiswahili)",
    popupSubtitle: "Tafsiri Endelevu (Sauti ya Asili 4% · Sauti ya Tafsiri Imeongezwa)",
    listenVoiceDub: "🔊 Sikiliza kwa Kiswahili",
    stopVoiceDub: "⏸ Simamisha",
    summaryHeading: "Muhtasari wa Video Uliotafsiriwa (Kiswahili)",
    stepsHeading: "Tafsiri Endelevu Hatua kwa Hatua Hadi Mwisho",
    askPlaceholder: "Mwambie Noctis: “Cheza video hii kwa Kichina / Kihispania / Kifaransa...”",
    askBtn: "Tuma",
    translating: "Noctis inatafsiri video kwa Kiswahili...",
    liveInterpretingBadge: "Inazungumza Kiswahili · Sauti ya Asili Chini (4%)",
  },
  ru: {
    triggerBtn: "Синхронный перевод Noctis",
    popupTitle: "ИИ-синхронный переводчик Noctis (Русский)",
    popupSubtitle: "Непрерывный перевод (оригинальный звук 4% · громкость перевода усилена)",
    listenVoiceDub: "🔊 Слушать на русском",
    stopVoiceDub: "⏸ Пауза",
    summaryHeading: "Переведённый обзор видео (Русский)",
    stepsHeading: "Непрерывный синхронный перевод до конца",
    askPlaceholder: "Скажите Noctis: «Воспроизвести на китайском / испанском / польском...»",
    askBtn: "Отправить",
    translating: "Noctis синхронно переводит видео на русский язык...",
    liveInterpretingBadge: "Говорит по-русски · Оригинальный звук тихо (4%)",
  },
}

/**
 * Builds the exact verbatim spoken lines to be voiced by the studio human voice actor.
 * CRITICAL: Never speaks the video title or third-person overview/meta-commentary!
 * Speaks ONLY the word-for-word first-person verbatim spoken transcript lines (`steps`),
 * stripping `[MM:SS]` timestamp tags so only the instructor's spoken words are voiced.
 */
function stripTimestampTagForSpeech(line: string): string {
  return (line || "")
    .replace(/^\s*\[\d{1,2}:\d{2}(?::\d{2})?\]\s*/g, "")
    .replace(/^\s*\(\d{1,2}:\d{2}(?::\d{2})?\)\s*/g, "")
    .trim()
}

function buildContinuousInterpreterSentences(
  _title: string,
  _overview: string,
  steps: string[]
): string[] {
  const rawBlocks = (steps || []).map(stripTimestampTagForSpeech).filter(Boolean)
  const sentences: string[] = []

  for (const block of rawBlocks) {
    if (block.length <= 185) {
      sentences.push(block)
      continue
    }
    const parts = block
      .split(/(?<=[.!?。！？؛])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2)

    for (const part of parts) {
      if (part.length <= 185) {
        sentences.push(part)
      } else {
        const subParts = part
          .split(/(?<=[,;،؛:])\s+/)
          .map((s) => s.trim())
          .filter(Boolean)
        let buffer = ""
        for (const sub of subParts) {
          if ((buffer + " " + sub).trim().length <= 185) {
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

  return sentences
}

// Cache translated verbatim video scripts by `${targetLang}::${youtubeId || title}` so scrolling or switching back has 0ms delay
const TRANSLATED_VIDEO_SCRIPT_CACHE = new Map<
  string,
  { title: string; overview: string; steps: string[]; isFullyTranslated: boolean }
>()

function cleanSourceTextForTranslation(raw: string): string {
  return (raw || "")
    .replace(/\s*[—–-]\s*Interpreted to English/gi, "")
    .replace(/\s*\(Interpreted to English\)/gi, "")
    .replace(/simultaneously interpreted into English by Noctis/gi, "presented in this training session")
    .replace(/interpreted live into English by Noctis/gi, "presented in this training session")
    .replace(/interpreted live into English/gi, "demonstrated step by step")
    .replace(/simultaneously interpreted into English/gi, "demonstrated step by step")
    .replace(/interpreted back into English/gi, "demonstrated step by step")
    .trim()
}

function getInitialVideoScript(
  targetLang: LanguageCode,
  sourceLang: string,
  youtubeId: string | undefined,
  title: string,
  _speaker: string,
  description: string,
  takeaways: string[]
): { title: string; overview: string; steps: string[]; isFullyTranslated: boolean } {
  const cleanTitle = cleanSourceTextForTranslation(title)
  const cacheKey = `${targetLang}::${youtubeId || cleanTitle}`
  const cached = TRANSLATED_VIDEO_SCRIPT_CACHE.get(cacheKey)
  if (cached) return cached

  const baseTakeaways =
    takeaways && takeaways.length > 0
      ? takeaways.map(cleanSourceTextForTranslation)
      : [
          "Speed Square Layout",
          "Marking 90° Perpendicular Lines",
          "Marking 45° Miter Angles",
          "Checking Corner Squareness",
        ]
  const cleanDesc =
    description && description.trim().length > 5
      ? cleanSourceTextForTranslation(description)
      : "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly."

  const verbatimEnglishSteps = getVerbatimSpokenSegmentsForVideo(
    youtubeId,
    cleanTitle,
    cleanDesc,
    baseTakeaways
  )

  if (targetLang === "en") {
    const isPureEnglishSource = (sourceLang || "en").toLowerCase() === "en"
    return {
      title: cleanTitle,
      overview: cleanDesc,
      steps: verbatimEnglishSteps,
      isFullyTranslated: isPureEnglishSource,
    }
  }

  const dict = NATIVE_VIDEO_PHRASES[targetLang] || {}
  const instantTitle = dict[cleanTitle] || cleanTitle
  const instantDesc = dict[cleanDesc] || cleanDesc

  return {
    title: instantTitle,
    overview: instantDesc,
    steps: verbatimEnglishSteps,
    isFullyTranslated: false,
  }
}

// Singleton shared HTMLAudioElement + Clean Studio Gain across all video cards on the page.
// Reusing a single unlocked HTMLAudioElement allows IntersectionObserver scroll-to-next-video auto-play to work in Chrome/Safari/Edge without NotAllowedError!
function getSharedNoctisAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null
  const win = window as any
  if (!win.__noctisSharedAudioEl) {
    const audio = new Audio()
    audio.crossOrigin = "anonymous"
    audio.preload = "auto"
    win.__noctisSharedAudioEl = audio
  }
  return win.__noctisSharedAudioEl as HTMLAudioElement
}

function getSharedNoctisPreloadAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null
  const win = window as any
  if (!win.__noctisSharedPreloadAudioEl) {
    const preload = new Audio()
    preload.preload = "auto"
    win.__noctisSharedPreloadAudioEl = preload
  }
  return win.__noctisSharedPreloadAudioEl as HTMLAudioElement
}

function ensureSharedAudioBoostGraph(audioEl: HTMLAudioElement) {
  audioEl.volume = 1.0
  if (typeof window === "undefined") return
  const win = window as any
  try {
    const AudioCtx = window.AudioContext || win.webkitAudioContext
    if (!AudioCtx) return
    if (!win.__noctisSharedAudioCtx) {
      win.__noctisSharedAudioCtx = new AudioCtx()
    }
    const ctx: AudioContext = win.__noctisSharedAudioCtx
    const connectChain = () => {
      if (win.__noctisSharedAudioBoosted || ctx.state !== "running") return
      try {
        const source = ctx.createMediaElementSource(audioEl)

        // Clean studio gain without artificial EQ distortion so the natural human voice sounds 100% authentic and warm
        const gain = ctx.createGain()
        gain.gain.setValueAtTime(1.85, ctx.currentTime)

        source.connect(gain)
        gain.connect(ctx.destination)
        win.__noctisSharedAudioBoosted = true
      } catch {
        // Ignore if already connected
      }
    }
    if (ctx.state === "suspended") {
      ctx.resume().then(connectChain).catch(() => {})
    } else {
      connectChain()
    }
  } catch {
    // Fallback: standard volume = 1.0 remains active
  }
}

const QUICK_AUDIO_LANG_CHIPS: LanguageCode[] = ["es", "pl", "fr", "zh", "vi", "en", "ak", "ar"]

export function NoctisVideoInterpreterPopup({
  youtubeId,
  title,
  speaker = "ConnectLn Instructor",
  speakerRole = "",
  serialPlate = "CLN-VID",
  description = "",
  takeaways = [],
  sourceLanguage = "en",
  sourceLanguageLabel,
  currentTime = 0,
  duration = 120,
  isPlaying = false,
  onMuteOriginalVideo,
  onRequestPlayVideo,
}: NoctisVideoInterpreterProps) {
  const { language, setLanguage, languages } = useLanguage()
  const normalizedSourceLang = (sourceLanguage || "en").toLowerCase() as LanguageCode
  const instanceIdRef = useRef<string>(`noctis-int-${Math.random().toString(36).slice(2, 10)}`)

  // `audioLang` is the active spoken target language for this video's audio translation.
  // It syncs automatically when the user changes the global navbar language, AND can also be switched
  // independently via "Play this video in Chinese", the Noctis audio language dropdown, or quick chips!
  const [audioLang, setAudioLang] = useState<LanguageCode>(() => {
    if (typeof window !== "undefined") {
      const pref = (window as any).__noctisPreferredAudioLang as LanguageCode | undefined
      if (pref && SUPPORTED_LANGUAGES.some((l) => l.code === pref)) {
        return pref
      }
    }
    return language
  })
  const [forceSpeakEvenIfSameLang, setForceSpeakEvenIfSameLang] = useState(false)
  const [isListeningVoiceCmd, setIsListeningVoiceCmd] = useState(false)

  // Sync audioLang whenever the global navbar `language` changes
  const prevGlobalLangRef = useRef<LanguageCode>(language)
  useEffect(() => {
    if (prevGlobalLangRef.current !== language) {
      prevGlobalLangRef.current = language
      if (typeof window !== "undefined") {
        ;(window as any).__noctisPreferredAudioLang = language
      }
      userManuallyPausedDubRef.current = false
      setAudioLang(language)
    }
  }, [language])

  const sourceLanguageMeta = useMemo(
    () =>
      languages.find((l) => l.code === normalizedSourceLang) ||
      SUPPORTED_LANGUAGES.find((l) => l.code === normalizedSourceLang) ||
      SUPPORTED_LANGUAGES[0],
    [languages, normalizedSourceLang]
  )

  const targetAudioLanguageMeta = useMemo(
    () =>
      languages.find((l) => l.code === audioLang) ||
      SUPPORTED_LANGUAGES.find((l) => l.code === audioLang) ||
      SUPPORTED_LANGUAGES[0],
    [languages, audioLang]
  )

  const isInterpretingNeeded = audioLang !== normalizedSourceLang || forceSpeakEvenIfSameLang

  const cleanTitle = useMemo(() => cleanSourceTextForTranslation(title), [title])
  const scriptIdKey = useMemo(() => youtubeId || cleanTitle, [youtubeId, cleanTitle])

  const initialScript = useMemo(
    () => getInitialVideoScript(audioLang, normalizedSourceLang, youtubeId, title, speaker, description, takeaways),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const win = window as any
      if (win.__lastOpenedNoctisPopupTitle === title) return true
      if (win.__noctisPopupOpenGlobal && isPlaying) return true
    }
    return false
  })
  const [showSubtitlesStrip, setShowSubtitlesStrip] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [activeSentenceIdx, setActiveSentenceIdx] = useState(0)
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(!initialScript.isFullyTranslated)
  const [translatedTitle, setTranslatedTitle] = useState(initialScript.title)
  const [translatedOverview, setTranslatedOverview] = useState(initialScript.overview)
  const [translatedSteps, setTranslatedSteps] = useState<string[]>(initialScript.steps)
  const [questionInput, setQuestionInput] = useState("")
  const [qaAnswer, setQaAnswer] = useState<string | null>(null)
  const [isAsking, setIsAsking] = useState(false)

  const isSpeakingRef = useRef(false)
  isSpeakingRef.current = isSpeaking
  const isPlayingRef = useRef(isPlaying)
  isPlayingRef.current = isPlaying
  const isPopupOpenRef = useRef(isPopupOpen)
  isPopupOpenRef.current = isPopupOpen
  const audioLangRef = useRef<LanguageCode>(audioLang)
  audioLangRef.current = audioLang
  const sourceLangRef = useRef(normalizedSourceLang)
  sourceLangRef.current = normalizedSourceLang
  const forceSpeakRef = useRef(forceSpeakEvenIfSameLang)
  forceSpeakRef.current = forceSpeakEvenIfSameLang
  const speakerNameRef = useRef(speaker)
  speakerNameRef.current = speaker
  const onMuteOriginalVideoRef = useRef(onMuteOriginalVideo)
  onMuteOriginalVideoRef.current = onMuteOriginalVideo
  const onRequestPlayVideoRef = useRef(onRequestPlayVideo)
  onRequestPlayVideoRef.current = onRequestPlayVideo
  const spokenLangAndTitleRef = useRef<string>("")
  const readyScriptKeyRef = useRef<string>(
    initialScript.isFullyTranslated ? `${audioLang}::${scriptIdKey}` : ""
  )
  const userManuallyPausedDubRef = useRef(false)
  const nextSentenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeSentenceIdxRef = useRef(0)
  activeSentenceIdxRef.current = activeSentenceIdx

  const boostInterpretationAudioElement = useCallback((audioEl: HTMLAudioElement) => {
    ensureSharedAudioBoostGraph(audioEl)
  }, [])

  // Lower or restore any HTML5 <video> elements on the page when Noctis interpretation is active
  // (On iOS/Android mobile browsers where video.volume is read-only and always 100%, set video.muted = true while interpreting)
  const setPageVideoElementsDucking = useCallback((duck: boolean) => {
    if (typeof document === "undefined" || typeof window === "undefined") return
    try {
      const isMobileDevice =
        window.matchMedia?.("(pointer: coarse)").matches ||
        /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent || "") ||
        window.innerWidth < 768
      const videos = document.querySelectorAll("video")
      videos.forEach((v) => {
        if (!v.srcObject) {
          if (duck) {
            v.volume = 0.04
            if (isMobileDevice) {
              v.muted = true
            }
          } else {
            v.volume = 1.0
            v.muted = false
          }
        }
      })
    } catch {}
  }, [])

  const labels = useMemo(() => {
    const pairLabel = `${sourceLanguageMeta.flag} ${sourceLanguageMeta.localName} → ${targetAudioLanguageMeta.flag} ${targetAudioLanguageMeta.localName}`
    if (UI_LABELS[audioLang]) {
      const base = UI_LABELS[audioLang]!
      return {
        ...base,
        popupSubtitle: `${pairLabel} · Studio Human Voice`,
        liveInterpretingBadge: `${pairLabel} · Verbatim Human Voice`,
      }
    }
    return {
      triggerBtn: `Noctis · ${targetAudioLanguageMeta.localName}`,
      popupTitle: `Noctis Verbatim Interpreter (${targetAudioLanguageMeta.localName})`,
      popupSubtitle: `${pairLabel} · Studio Human Voice`,
      listenVoiceDub: `🔊 Listen in ${targetAudioLanguageMeta.localName}`,
      stopVoiceDub: `⏸ Pause ${targetAudioLanguageMeta.localName} Audio`,
      summaryHeading: `Lesson Context (${targetAudioLanguageMeta.localName})`,
      stepsHeading: `Verbatim Spoken Transcript (${targetAudioLanguageMeta.localName})`,
      askPlaceholder: `Tell Noctis: “Play this video in Chinese / Spanish / Polish...”`,
      askBtn: "Send",
      translating: `Noctis is translating verbatim speech from ${sourceLanguageMeta.localName} into ${targetAudioLanguageMeta.localName}...`,
      liveInterpretingBadge: `${pairLabel} · Verbatim Human Voice`,
    }
  }, [audioLang, sourceLanguageMeta, targetAudioLanguageMeta])

  const takeawaysKey = useMemo(() => (takeaways || []).join("||"), [takeaways])

  // Build crisp verbatim spoken sentences (NEVER includes video title or meta-overview!)
  const interpreterSentences = useMemo(
    () => buildContinuousInterpreterSentences(translatedTitle, translatedOverview, translatedSteps),
    [translatedTitle, translatedOverview, translatedSteps]
  )
  const sentencesRef = useRef<string[]>(interpreterSentences)
  sentencesRef.current = interpreterSentences

  const stopAudioOutput = useCallback((forceStopShared = false) => {
    if (nextSentenceTimerRef.current) {
      clearTimeout(nextSentenceTimerRef.current)
      nextSentenceTimerRef.current = null
    }
    const isCurrentActiveOwner =
      typeof window !== "undefined" &&
      (forceStopShared || (window as any).__activeNoctisInterpreterId === instanceIdRef.current)

    if (isCurrentActiveOwner) {
      const sharedAudio = getSharedNoctisAudio()
      if (sharedAudio) {
        try {
          sharedAudio.pause()
          sharedAudio.onended = null
          sharedAudio.onerror = null
        } catch {}
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel()
        } catch {}
      }
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
          stopAudioOutput(false)
        }
        if (isPopupOpenRef.current) {
          setIsPopupOpen(false)
        }
      }
    }
    window.addEventListener(EXCLUSIVE_INTERPRETER_EVENT, handleExclusive)
    return () => window.removeEventListener(EXCLUSIVE_INTERPRETER_EVENT, handleExclusive)
  }, [stopAudioOutput])

  // Core sentence-by-sentence continuous verbatim human voice player:
  // Uses singleton `/api/connectin/tts` (Studio Natural Human Voice Actors) with next-sentence preloading.
  const speakSentenceAtIndex = useCallback((idx: number) => {
    if (typeof window === "undefined") return
    if (!isSpeakingRef.current) return
    if ((window as any).__activeNoctisInterpreterId !== instanceIdRef.current) return

    const list = sentencesRef.current
    if (!list || list.length === 0) return

    const safeIdx = ((idx % list.length) + list.length) % list.length
    setActiveSentenceIdx(safeIdx)
    activeSentenceIdxRef.current = safeIdx

    // Duck/mute original video track while Noctis speaks the target language
    if (onMuteOriginalVideoRef.current) {
      onMuteOriginalVideoRef.current(true)
    }
    setPageVideoElementsDucking(true)

    const sentenceText = stripTimestampTagForSpeech(list[safeIdx])
    const nextSentenceText = stripTimestampTagForSpeech(list[(safeIdx + 1) % list.length])
    const targetLang = audioLangRef.current
    const speakerParam = speakerNameRef.current || ""

    // Preload the NEXT verbatim spoken line in the background so there is zero gap between sentences!
    if (nextSentenceText) {
      try {
        const preloadAudio = getSharedNoctisPreloadAudio()
        if (preloadAudio) {
          preloadAudio.src = `/api/connectin/tts?lang=${encodeURIComponent(
            targetLang
          )}&speaker=${encodeURIComponent(speakerParam)}&text=${encodeURIComponent(
            nextSentenceText.slice(0, 260)
          )}`
          preloadAudio.load()
        }
      } catch {}
    }

    const scheduleNextSentence = (delayMs = 150) => {
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
      if ((window as any).__activeNoctisInterpreterId !== instanceIdRef.current) return
      try {
        const utterance = new SpeechSynthesisUtterance(sentenceText)
        const targetLocale = SPEECH_LOCALE_MAP[targetLang] || "en-US"
        utterance.lang = targetLocale
        utterance.rate = 1.0
        utterance.volume = 1.0

        const voices = window.speechSynthesis.getVoices()
        const langVoices = voices.filter(
          (v) =>
            v.lang.toLowerCase().startsWith(targetLang.toLowerCase()) ||
            v.lang.toLowerCase().includes(targetLocale.toLowerCase())
        )
        // Prefer Natural / Online (Natural) / Siri / Premium human voices over robotic desktop synths
        const naturalHumanVoice =
          langVoices.find((v) => /natural|online|siri|premium|neural|enhanced/i.test(v.name)) ||
          langVoices[0]
        if (naturalHumanVoice) {
          utterance.voice = naturalHumanVoice
        }

        utterance.onend = () => scheduleNextSentence(150)
        utterance.onerror = () => scheduleNextSentence(350)
        window.speechSynthesis.speak(utterance)
      } catch {
        scheduleNextSentence(1500)
      }
    }

    // Primary: Play Studio Natural Human Voice Actor MP3 stream via `/api/connectin/tts` at natural 1.0x cadence
    try {
      const audio = getSharedNoctisAudio()
      if (!audio) {
        speakWithBrowserFallback()
        return
      }
      audio.onended = null
      audio.onerror = null
      audio.onplay = () => {
        try {
          ;(audio as any).preservesPitch = true
          audio.playbackRate = 1.0
        } catch {}
        boostInterpretationAudioElement(audio)
      }
      audio.volume = 1.0
      boostInterpretationAudioElement(audio)
      audio.src = `/api/connectin/tts?lang=${encodeURIComponent(
        targetLang
      )}&speaker=${encodeURIComponent(speakerParam)}&text=${encodeURIComponent(
        sentenceText.slice(0, 260)
      )}`
      audio.onended = () => {
        if ((window as any).__activeNoctisInterpreterId === instanceIdRef.current) {
          scheduleNextSentence(160)
        }
      }
      audio.onerror = () => {
        if ((window as any).__activeNoctisInterpreterId === instanceIdRef.current) {
          speakWithBrowserFallback()
        }
      }
      const playPromise = audio.play()
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          if ((window as any).__activeNoctisInterpreterId === instanceIdRef.current) {
            speakWithBrowserFallback()
          }
        })
      }
    } catch {
      speakWithBrowserFallback()
    }
  }, [boostInterpretationAudioElement, setPageVideoElementsDucking])

  const startContinuousInterpretation = useCallback(
    (startIndex = 0) => {
      if (typeof window === "undefined") return
      stopAudioOutput(true)
      claimExclusiveInterpreter(instanceIdRef.current)
      isSpeakingRef.current = true
      setIsSpeaking(true)
      if (onMuteOriginalVideoRef.current) onMuteOriginalVideoRef.current(true)
      setPageVideoElementsDucking(true)
      speakSentenceAtIndex(startIndex)
    },
    [speakSentenceAtIndex, stopAudioOutput, setPageVideoElementsDucking]
  )

  const stopContinuousInterpretation = useCallback(
    (restoreFullOriginalVolume = true) => {
      isSpeakingRef.current = false
      setIsSpeaking(false)
      stopAudioOutput(false)
      if (restoreFullOriginalVolume) {
        if (onMuteOriginalVideoRef.current) {
          onMuteOriginalVideoRef.current(false)
        }
        setPageVideoElementsDucking(false)
      }
    },
    [stopAudioOutput, setPageVideoElementsDucking]
  )

  // Helper to switch the spoken target language for this video (and across Noctis) and immediately play it
  const selectSpokenAudioLanguage = useCallback(
    (targetCode: LanguageCode, alsoSyncPlatformLanguage = false) => {
      userManuallyPausedDubRef.current = false
      setForceSpeakEvenIfSameLang(true)
      forceSpeakRef.current = true
      if (typeof window !== "undefined") {
        ;(window as any).__noctisPreferredAudioLang = targetCode
      }
      stopAudioOutput(true)
      setAudioLang(targetCode)
      audioLangRef.current = targetCode
      if (alsoSyncPlatformLanguage && targetCode !== language) {
        setLanguage(targetCode)
      }
      if (!isPlayingRef.current && onRequestPlayVideoRef.current) {
        onRequestPlayVideoRef.current()
      }
    },
    [language, setLanguage, stopAudioOutput]
  )

  // Listen for global Noctis language commands (e.g. from sidebar "Ask Noctis" or navbar Q&A: "Play this video in Chinese")
  useEffect(() => {
    const handleGlobalNoctisCommand = (e: Event) => {
      const custom = e as CustomEvent<{ langCode?: LanguageCode }>
      const targetCode = custom.detail?.langCode
      if (!targetCode) return
      setAudioLang(targetCode)
      audioLangRef.current = targetCode
      userManuallyPausedDubRef.current = false
      setForceSpeakEvenIfSameLang(true)
      forceSpeakRef.current = true
      if (isPlayingRef.current || isPopupOpenRef.current) {
        stopAudioOutput(true)
      }
    }
    window.addEventListener(NOCTIS_LANGUAGE_COMMAND_EVENT, handleGlobalNoctisCommand)
    return () => window.removeEventListener(NOCTIS_LANGUAGE_COMMAND_EVENT, handleGlobalNoctisCommand)
  }, [stopAudioOutput])

  // Translate the instructor's word-for-word first-person verbatim spoken transcript into `audioLang`
  // and ONLY start speaking once `sentencesRef.current` holds the verbatim spoken lines in `audioLang`!
  useEffect(() => {
    let cancelled = false

    async function runInterpretation() {
      const targetLang = audioLang
      const cacheKey = `${targetLang}::${scriptIdKey}`

      // Stop any ongoing speech from a previous language immediately so languages never mix
      if (isSpeakingRef.current && spokenLangAndTitleRef.current !== cacheKey) {
        stopAudioOutput(true)
      }

      const cached = TRANSLATED_VIDEO_SCRIPT_CACHE.get(cacheKey)
      if (cached && cached.isFullyTranslated) {
        setTranslatedTitle(cached.title)
        setTranslatedOverview(cached.overview)
        setTranslatedSteps(cached.steps)
        sentencesRef.current = buildContinuousInterpreterSentences(
          cached.title,
          cached.overview,
          cached.steps
        )
        readyScriptKeyRef.current = cacheKey
        setIsLoadingTranslation(false)
        if (
          (targetLang !== sourceLangRef.current || forceSpeakRef.current) &&
          (isPlayingRef.current || isPopupOpenRef.current) &&
          !userManuallyPausedDubRef.current &&
          (!isSpeakingRef.current || spokenLangAndTitleRef.current !== cacheKey)
        ) {
          spokenLangAndTitleRef.current = cacheKey
          startContinuousInterpretation(0)
        }
        return
      }

      const baseTakeaways =
        takeaways && takeaways.length > 0
          ? takeaways.map(cleanSourceTextForTranslation)
          : [
              "Speed Square Layout",
              "Marking 90° Perpendicular Lines",
              "Marking 45° Miter Angles",
              "Checking Corner Squareness",
            ]
      const cleanDesc =
        description && description.trim().length > 5
          ? cleanSourceTextForTranslation(description)
          : "Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly."

      // Get the exact word-for-word, first-person verbatim spoken transcript lines for this video (`[00:00] ...`, `[00:10] ...`)
      const verbatimEnglishSteps = getVerbatimSpokenSegmentsForVideo(
        youtubeId,
        cleanTitle,
        cleanDesc,
        baseTakeaways
      )

      // Case 1: Target audio language is English ("en")
      if (targetLang === "en") {
        // If source video is non-English (e.g. French, Spanish, Vietnamese, Polish, Chinese), ensure title & overview are also translated to English while speaking the English verbatim transcript
        if (sourceLangRef.current !== "en") {
          setIsLoadingTranslation(true)
          try {
            const toTranslate = [cleanTitle, cleanDesc]
            const translatedList = await translateLinesLive(toTranslate, "en", true)
            if (!cancelled) {
              const enTitle = translatedList[0] || cleanTitle
              const enDesc = translatedList[1] || cleanDesc
              TRANSLATED_VIDEO_SCRIPT_CACHE.set(cacheKey, {
                title: enTitle,
                overview: enDesc,
                steps: verbatimEnglishSteps,
                isFullyTranslated: true,
              })
              setTranslatedTitle(enTitle)
              setTranslatedOverview(enDesc)
              setTranslatedSteps(verbatimEnglishSteps)
              sentencesRef.current = buildContinuousInterpreterSentences(
                enTitle,
                enDesc,
                verbatimEnglishSteps
              )
              readyScriptKeyRef.current = cacheKey
              setIsLoadingTranslation(false)
              if (
                (isPlayingRef.current || isPopupOpenRef.current) &&
                !userManuallyPausedDubRef.current &&
                (!isSpeakingRef.current || spokenLangAndTitleRef.current !== cacheKey)
              ) {
                spokenLangAndTitleRef.current = cacheKey
                startContinuousInterpretation(0)
              }
            }
          } catch {
            if (!cancelled) setIsLoadingTranslation(false)
          }
          return
        }

        TRANSLATED_VIDEO_SCRIPT_CACHE.set(cacheKey, {
          title: cleanTitle,
          overview: cleanDesc,
          steps: verbatimEnglishSteps,
          isFullyTranslated: true,
        })
        setTranslatedTitle(cleanTitle)
        setTranslatedOverview(cleanDesc)
        setTranslatedSteps(verbatimEnglishSteps)
        sentencesRef.current = buildContinuousInterpreterSentences(
          cleanTitle,
          cleanDesc,
          verbatimEnglishSteps
        )
        readyScriptKeyRef.current = cacheKey
        setIsLoadingTranslation(false)
        if (
          forceSpeakRef.current &&
          (isPlayingRef.current || isPopupOpenRef.current) &&
          !userManuallyPausedDubRef.current
        ) {
          spokenLangAndTitleRef.current = cacheKey
          startContinuousInterpretation(0)
        }
        return
      }

      // Case 2: Target audio language is any of the 45 non-English languages (Spanish, Polish, French, Chinese, Vietnamese, Twi, etc.)
      // Translate the exact word-for-word first-person verbatim transcript lines directly into `targetLang`!
      setIsLoadingTranslation(true)
      try {
        const timestamps = verbatimEnglishSteps.map((line) => {
          const m = line.match(/^\s*(\[\d{1,2}:\d{2}(?::\d{2})?\])\s*/)
          return m ? m[1] : ""
        })
        const pureSpokenLines = verbatimEnglishSteps.map(stripTimestampTagForSpeech)

        const toTranslate = [cleanTitle, cleanDesc, ...pureSpokenLines]
        const translatedList = await translateLinesLive(toTranslate, targetLang, true)

        if (!cancelled) {
          const dict = NATIVE_VIDEO_PHRASES[targetLang] || {}
          const finalTitle = dict[cleanTitle] || translatedList[0] || cleanTitle
          const finalOverview = dict[cleanDesc] || translatedList[1] || cleanDesc
          const finalSteps = pureSpokenLines.map((origLine, idx) => {
            const translatedLine = stripTimestampTagForSpeech(translatedList[idx + 2] || origLine)
            const ts = timestamps[idx]
            return ts ? `${ts} ${translatedLine}` : translatedLine
          })

          TRANSLATED_VIDEO_SCRIPT_CACHE.set(cacheKey, {
            title: finalTitle,
            overview: finalOverview,
            steps: finalSteps,
            isFullyTranslated: true,
          })
          setTranslatedTitle(finalTitle)
          setTranslatedOverview(finalOverview)
          setTranslatedSteps(finalSteps)
          sentencesRef.current = buildContinuousInterpreterSentences(
            finalTitle,
            finalOverview,
            finalSteps
          )
          readyScriptKeyRef.current = cacheKey
          setIsLoadingTranslation(false)

          // Start speaking the translated verbatim speech in `audioLang` immediately!
          if (
            audioLangRef.current === targetLang &&
            (targetLang !== sourceLangRef.current || forceSpeakRef.current) &&
            (isPlayingRef.current || isPopupOpenRef.current) &&
            !userManuallyPausedDubRef.current
          ) {
            spokenLangAndTitleRef.current = cacheKey
            startContinuousInterpretation(0)
          }
        }
      } catch {
        if (!cancelled) setIsLoadingTranslation(false)
      }
    }

    runInterpretation()
    return () => {
      cancelled = true
    }
  }, [audioLang, normalizedSourceLang, scriptIdKey, cleanTitle, speaker, description, takeawaysKey, youtubeId, startContinuousInterpretation, stopAudioOutput]) // eslint-disable-line react-hooks/exhaustive-deps

  // Automatically start or stop simultaneous interpretation when video play state changes
  useEffect(() => {
    if (audioLang === normalizedSourceLang && !forceSpeakEvenIfSameLang) {
      spokenLangAndTitleRef.current = ""
      if (isSpeakingRef.current) {
        stopContinuousInterpretation(true)
      }
      return
    }

    const sessionKey = `${audioLang}::${scriptIdKey}`
    if (isPlaying && !userManuallyPausedDubRef.current) {
      if (typeof window !== "undefined" && (window as any).__noctisPopupOpenGlobal) {
        setIsPopupOpen(true)
      }
      // Only start immediately if the translated script for `sessionKey` is already ready;
      // otherwise `runInterpretation()` will start it as soon as `translateLinesLive` finishes!
      if (readyScriptKeyRef.current === sessionKey) {
        if (!isSpeakingRef.current || spokenLangAndTitleRef.current !== sessionKey) {
          spokenLangAndTitleRef.current = sessionKey
          startContinuousInterpretation(0)
        }
      }
    } else if (!isPlaying && isSpeakingRef.current && !isPopupOpen) {
      stopContinuousInterpretation(false)
    }
  }, [
    audioLang,
    normalizedSourceLang,
    forceSpeakEvenIfSameLang,
    scriptIdKey,
    isPlaying,
    isPopupOpen,
    startContinuousInterpretation,
    stopContinuousInterpretation,
  ])

  // Unlock shared browser audio & AudioContext on any user interaction and resume if needed
  useEffect(() => {
    if (!isInterpretingNeeded || (!isPlaying && !isPopupOpen) || userManuallyPausedDubRef.current) return
    const unlockAudio = () => {
      const sharedAudio = getSharedNoctisAudio()
      if (sharedAudio) {
        ensureSharedAudioBoostGraph(sharedAudio)
      }
      if (
        isSpeakingRef.current &&
        (window as any).__activeNoctisInterpreterId === instanceIdRef.current &&
        sharedAudio &&
        !sharedAudio.paused
      ) {
        return
      }
      const sessionKey = `${audioLangRef.current}::${scriptIdKey}`
      if (
        readyScriptKeyRef.current === sessionKey &&
        (audioLangRef.current !== sourceLangRef.current || forceSpeakRef.current) &&
        (isPlayingRef.current || isPopupOpenRef.current) &&
        !userManuallyPausedDubRef.current &&
        (!isSpeakingRef.current ||
          (window as any).__activeNoctisInterpreterId !== instanceIdRef.current ||
          !sharedAudio ||
          sharedAudio.paused)
      ) {
        spokenLangAndTitleRef.current = sessionKey
        startContinuousInterpretation(activeSentenceIdxRef.current)
      }
    }
    window.addEventListener("pointerdown", unlockAudio, { passive: true })
    window.addEventListener("keydown", unlockAudio, { passive: true })
    window.addEventListener("touchstart", unlockAudio, { passive: true })
    return () => {
      window.removeEventListener("pointerdown", unlockAudio)
      window.removeEventListener("keydown", unlockAudio)
      window.removeEventListener("touchstart", unlockAudio)
    }
  }, [audioLang, isInterpretingNeeded, scriptIdKey, isPlaying, isPopupOpen, startContinuousInterpretation])

  // Cleanup on unmount (only stops shared audio if this instance is still the active interpreter)
  useEffect(() => {
    return () => {
      stopAudioOutput(false)
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
        setForceSpeakEvenIfSameLang(true)
        forceSpeakRef.current = true
        if (!isPlaying && onRequestPlayVideo) {
          onRequestPlayVideo()
        }
        startContinuousInterpretation(activeSentenceIdxRef.current)
      }
    },
    [isSpeaking, isPlaying, onRequestPlayVideo, startContinuousInterpretation, stopContinuousInterpretation]
  )

  const executeNoctisQueryOrLanguageCommand = useCallback(
    async (rawQuery: string) => {
      const q = rawQuery.trim()
      if (!q) return
      setIsAsking(true)
      setQuestionInput("")

      // 1. Check if the user is commanding Noctis to play/interpret the video in a specific language
      // e.g. "Play this video in Chinese", "Interpret in Spanish", "Play in Polish", "Speak French"
      const detectedLangCode = parseNoctisLanguageCommand(q)
      if (detectedLangCode) {
        const targetMeta =
          SUPPORTED_LANGUAGES.find((l) => l.code === detectedLangCode) || SUPPORTED_LANGUAGES[0]
        selectSpokenAudioLanguage(detectedLangCode, false)
        dispatchNoctisLanguageCommand(detectedLangCode)

        const confirmBase = `Noctis Audio Translation Active: Translating this ${sourceLanguageMeta.name} video and playing spoken audio in ${targetMeta.name} (${targetMeta.localName}).`
        const localizedConfirm =
          detectedLangCode === "en"
            ? confirmBase
            : await translateTextLive(confirmBase, detectedLangCode, true)
        setQaAnswer(`${targetMeta.flag} ${localizedConfirm}`)
        setIsAsking(false)
        return
      }

      // 2. Otherwise answer the technical question about the video in `audioLang`
      const baseResponse = `Regarding "${cleanTitle}" by ${speaker}: Focus on accurate preparation, verifying measurements twice before execution, and following all safety and quality checkpoints shown in this briefing. (${q})`
      const translatedAns =
        audioLang === "en" ? baseResponse : await translateTextLive(baseResponse, audioLang, true)
      setQaAnswer(translatedAns)
      setIsAsking(false)
    },
    [audioLang, cleanTitle, selectSpokenAudioLanguage, sourceLanguageMeta.name, speaker]
  )

  const handleAskNoctis = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await executeNoctisQueryOrLanguageCommand(questionInput)
  }

  // Voice Command Microphone ("Play this video in Chinese", "Spanish", "Polish", "French", etc.)
  const handleVoiceCommandMic = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (typeof window === "undefined") return
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRec) {
      setIsPopupOpen(true)
      return
    }
    try {
      const recognition = new SpeechRec()
      recognition.lang = SPEECH_LOCALE_MAP[language] || "en-US"
      recognition.interimResults = false
      recognition.maxAlternatives = 1
      setIsListeningVoiceCmd(true)
      recognition.onresult = (event: any) => {
        const transcript = event?.results?.[0]?.[0]?.transcript || ""
        setIsListeningVoiceCmd(false)
        if (transcript) {
          setQuestionInput(transcript)
          executeNoctisQueryOrLanguageCommand(transcript)
        }
      }
      recognition.onerror = () => setIsListeningVoiceCmd(false)
      recognition.onend = () => setIsListeningVoiceCmd(false)
      recognition.start()
    } catch {
      setIsListeningVoiceCmd(false)
    }
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
              ;(window as any).__noctisPopupOpenGlobal = nextOpen
            }
            if (!isPlaying && onRequestPlayVideo) {
              if (typeof window !== "undefined") {
                ;(window as any).__noctisPopupOpenGlobal = true
              }
              setIsPopupOpen(true)
              onRequestPlayVideo()
              return
            }
            setIsPopupOpen(nextOpen)
            if (nextOpen && !isSpeakingRef.current) {
              setForceSpeakEvenIfSameLang(true)
              forceSpeakRef.current = true
              startContinuousInterpretation(activeSentenceIdxRef.current)
            }
          }}
          style={{
            backgroundColor: isPopupOpen || isSpeaking || isInterpretingNeeded ? "#0A66C2" : "rgba(15, 23, 42, 0.92)",
            color: "#FFFFFF",
            borderColor: "#60A5FA",
          }}
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold shadow-xl border-2 transition-all cursor-pointer hover:brightness-110"
          title="Open Noctis Multilingual Video Audio Interpreter"
        >
          {isSpeaking ? (
            <Radio className="h-3.5 w-3.5 text-emerald-300 animate-pulse shrink-0" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-amber-300 shrink-0" />
          )}
          <span style={{ color: "#FFFFFF" }}>Noctis Audio</span>
          <span
            style={{ backgroundColor: "#0F172A", color: "#FDE68A" }}
            className="rounded px-1.5 py-0.5 text-[10px] font-mono font-black border border-white/25"
          >
            {sourceLanguageMeta.flag} {sourceLanguageMeta.code.toUpperCase()} → 🔊 {targetAudioLanguageMeta.flag}{" "}
            {targetAudioLanguageMeta.code.toUpperCase()}
          </span>
        </button>
      </div>

      {/* 2. SLIM, HIGH-VISIBILITY SUBTITLE BAR AT VERY BOTTOM EDGE */}
      {(isInterpretingNeeded || isSpeaking || normalizedSourceLang !== "en") && showSubtitlesStrip && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            userManuallyPausedDubRef.current = false
            if (typeof window !== "undefined") {
              ;(window as any).__lastOpenedNoctisPopupTitle = title
              ;(window as any).__noctisPopupOpenGlobal = true
            }
            if (!isPlaying && onRequestPlayVideo) {
              onRequestPlayVideo()
            }
            setIsPopupOpen(true)
            if (!isSpeaking) {
              setForceSpeakEvenIfSameLang(true)
              forceSpeakRef.current = true
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
                {sourceLanguageMeta.flag} {sourceLanguageMeta.localName} → 🔊 {targetAudioLanguageMeta.flag}{" "}
                {targetAudioLanguageMeta.localName}
              </span>
            </span>

            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              <select
                value={audioLang}
                onChange={(e) => {
                  const newTarget = e.target.value as LanguageCode
                  selectSpokenAudioLanguage(newTarget, false)
                }}
                aria-label="Select target audio language"
                style={{
                  backgroundColor: "#1E293B",
                  color: "#FDE68A",
                  borderColor: "#475569",
                }}
                className="rounded-md border px-1.5 py-0.5 text-[10px] font-extrabold cursor-pointer focus:outline-none"
                title="Choose which language to hear this video in"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>
                    🔊 {l.flag} {l.localName} ({l.code.toUpperCase()})
                  </option>
                ))}
              </select>

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
          className="fixed right-3 sm:right-5 top-18 z-[95] w-[min(395px,94vw)] max-h-[80vh] rounded-2xl border-2 shadow-[0_20px_60px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
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
                  {sourceLanguageMeta.flag} {sourceLanguageMeta.localName} → 🔊 {targetAudioLanguageMeta.flag}{" "}
                  {targetAudioLanguageMeta.localName}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  ;(window as any).__lastOpenedNoctisPopupTitle = ""
                  ;(window as any).__noctisPopupOpenGlobal = false
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

          {/* High-Visibility Target Audio Language Selector + Quick Cross-Language Chips + Voice Dubbing */}
          <div
            style={{ backgroundColor: "#F8FAFC", color: "#0F172A" }}
            className="flex flex-col gap-2 border-b border-slate-300 px-3.5 py-2.5 shrink-0"
          >
            <div className="flex items-center justify-between gap-2 text-[11px] font-extrabold text-slate-700">
              <span className="inline-flex items-center gap-1">
                <span>🎬 Video:</span>
                <span className="rounded bg-slate-200 px-1.5 py-0.5 text-slate-900">
                  {sourceLanguageMeta.flag} {sourceLanguageMeta.localName}
                </span>
              </span>
              <span>→</span>
              <span className="inline-flex items-center gap-1 text-[#0A66C2]">
                <span>🔊 Hear Audio In:</span>
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[#0A66C2]">
                  {targetAudioLanguageMeta.flag} {targetAudioLanguageMeta.localName}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#0A66C2] shrink-0" />
              <select
                value={audioLang}
                onChange={(e) => {
                  const newLang = e.target.value as LanguageCode
                  selectSpokenAudioLanguage(newLang, true)
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
                    {l.flag} {l.localName} — {l.name} ({l.code.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Instant Cross-Language Audio Pills (Spanish, Polish, French, Chinese, Vietnamese, English, Twi, Arabic) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
              {QUICK_AUDIO_LANG_CHIPS.map((code) => {
                const meta = SUPPORTED_LANGUAGES.find((l) => l.code === code)
                if (!meta) return null
                const isSelected = audioLang === code
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => selectSpokenAudioLanguage(code, false)}
                    style={{
                      backgroundColor: isSelected ? "#0A66C2" : "#E2E8F0",
                      color: isSelected ? "#FFFFFF" : "#0F172A",
                    }}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold shrink-0 cursor-pointer transition-colors"
                    title={`Hear this ${sourceLanguageMeta.name} video in ${meta.name}`}
                  >
                    <span>{meta.flag}</span>
                    <span>{meta.localName}</span>
                  </button>
                )
              })}
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

          {/* Scrollable High-Contrast Translated Interpretation Body (100% in Selected Audio Language) */}
          <div
            style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}
            className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3 text-xs"
          >
            {qaAnswer && (
              <div
                style={{ backgroundColor: "#1E3A8A", color: "#FFFFFF" }}
                className="rounded-xl border border-sky-400 p-3 space-y-1"
              >
                <p
                  style={{ color: "#FDE68A" }}
                  className="text-[11px] font-black flex items-center gap-1"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Noctis ({targetAudioLanguageMeta.localName})
                </p>
                <p style={{ color: "#FFFFFF" }} className="text-xs font-semibold leading-relaxed">
                  {qaAnswer}
                </p>
              </div>
            )}

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
                      setForceSpeakEvenIfSameLang(true)
                      forceSpeakRef.current = true
                      if (!isPlaying && onRequestPlayVideo) {
                        onRequestPlayVideo()
                      }
                      startContinuousInterpretation(idx)
                    }}
                    style={{
                      backgroundColor:
                        isSpeaking && idx === activeSentenceIdx % Math.max(1, translatedSteps.length)
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
          </div>

          {/* High-Visibility Ask / Command Noctis Footer ("Play this video in Chinese", etc.) */}
          <form
            onSubmit={handleAskNoctis}
            style={{ backgroundColor: "#F8FAFC" }}
            className="border-t border-slate-300 px-3 py-2.5 flex items-center gap-1.5 shrink-0"
          >
            <button
              type="button"
              onClick={handleVoiceCommandMic}
              style={{
                backgroundColor: isListeningVoiceCmd ? "#DC2626" : "#E2E8F0",
                color: isListeningVoiceCmd ? "#FFFFFF" : "#0F172A",
              }}
              className="inline-flex items-center justify-center rounded-lg p-2 text-xs font-extrabold cursor-pointer shrink-0"
              title="Speak a command to Noctis (e.g., 'Play this video in Chinese')"
            >
              <Mic className={`h-3.5 w-3.5 ${isListeningVoiceCmd ? "animate-pulse" : ""}`} />
            </button>
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
              className="flex-1 min-w-0 rounded-lg border-2 px-2.5 py-1.5 text-xs font-bold placeholder:text-slate-500 focus:outline-none focus:border-[#0A66C2]"
            />
            <button
              type="submit"
              disabled={isAsking}
              style={{ backgroundColor: "#0A66C2", color: "#FFFFFF" }}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-extrabold shadow-sm hover:opacity-95 transition-opacity cursor-pointer shrink-0"
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
