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
    case "ak":
      return {
        overview: `Akwaaba ba nsaanodwuma adesua yi mu: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Nea ɛdi kan, Nnwinnadeɛ Ahoboa: Kyerɛkyerɛfoɔ no de susudua no to dua no ano pɛpɛɛpɛ, na ɔhwɛ sɛ ɛhyia yie ansa na wahyɛ agyiraeɛ.`,
          `Nea ɛtɔ so mmienu, Ntwea Agyiraehyɛ Wɔ Pon So: Hwɛ sɛnea kyerɛkyerɛfoɔ no sɔ adwinnadeɛ no mu dennen twa nsensaneeɛ tẽẽ pɛpɛɛpɛ.`,
          `Nea ɛtɔ so mmiɛnsa, Nhwehwɛmu ne Ahobammɔ: Wɔsan susuw ntwea biara mprenu ansa na wɔatwa dua no, sɛnea mfomsoɔ biara remma wɔ adwuma no mu.`,
          `Nea ɛtɔ so nnan, Nkyerɛaseɛ Toa So: Borɔfo nne no ano yɛ brɛoo wɔ akyi, na yɛrekyerɛ aseɛ wɔ Twi kasa mu kɔsi video no awiei.`,
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
          `Enelia, Gbegɔmeɖeɖe Yi Edzi: Yevugbe ƒe gbeɖiɖi bɔbɔ ɖe megbe, eye míele egɔme ɖem ɖe Eʋegbe me vaseɖe nuwuwu.`,
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
          `Ejwɛ, Wiemɔ Shishitsɔɔmɔ: Blɔfo gbee lɛ baa shi yɛ sɛɛ, ni atsɔɔ shishi yɛ Gã mli kɛyashi naagbee.`,
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
          `Mataki na huɗu, Fassara Har Karshe: Muryar Turanci tana ƙasa a baya yayin da ake ci gaba da fassara cikin harshen Hausa har zuwa ƙarshen bidiyon.`,
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
          `Ìpele kẹrin, Ìtumọ̀ Títí Dé Opin: Ohùn Gẹ̀ẹ́sì wà ní ìsàlẹ̀ nígbà tí a ń gbé ìtumọ̀ jáde ní Èdè Yorùbá títí dé ìparí fídíò náà.`,
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
          `Nzọụkwụ nke anọ, Ntụgharị Asụsụ Ruo Njedebe: Olu Bekee dị ala n'azụ ebe anyị na-atụgharị n'asụsụ Igbo ruo na ngwụcha vidio a.`,
        ],
      }
    case "pt":
      return {
        overview: `Bem-vindo a esta aula prática ao vivo: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Primeiro passo, preparação das ferramentas: O instrutor posiciona o esquadro na borda da madeira e verifica o alinhamento antes de iniciar a marcação.`,
          `Segundo passo, execução precisa na bancada: Observe como o instrutor mantém o esquadro firme contra a madeira para garantir linhas de 90 graus e 45 graus perfeitas.`,
          `Terceiro passo, inspeção de qualidade e segurança: Cada ângulo e canto é verificado duas vezes antes do corte para evitar retrabalho na obra.`,
          `Quarto passo, aplicação prática: Continue acompanhando a demonstração ao vivo enquanto o áudio original em inglês permanece baixo ao fundo.`,
        ],
      }
    case "es":
      return {
        overview: `Bienvenido a esta clase práctica en vivo: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Primer paso, preparación de herramientas: El instructor coloca la escuadra sobre el borde de la madera y verifica la alineación antes de marcar.`,
          `Segundo paso, ejecución precisa en el banco: Observe cómo el instructor sujeta firmemente la escuadra contra la madera para lograr ángulos exactos de 90 grados y 45 grados.`,
          `Tercer paso, inspección de calidad y seguridad: Cada esquina y medida se comprueba dos veces antes de cortar para garantizar precisión profesional.`,
          `Cuarto paso, aplicación práctica: Siga viendo la demostración mientras el audio original en inglés se mantiene suave de fondo.`,
        ],
      }
    case "fr":
      return {
        overview: `Bienvenue dans cette séance pratique en direct : ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Première étape, préparation des outils : L'instructeur place l'équerre contre le bord du bois et vérifie l'alignement avant le traçage.`,
          `Deuxième étape, exécution précise sur l'établi : Observez comment l'instructeur maintient fermement l'outil pour tracer des angles exacts à 90 degrés et 45 degrés.`,
          `Troisième étape, contrôle qualité et sécurité : Chaque angle est vérifié deux fois avant la découpe pour garantir un assemblage parfait sur le chantier.`,
          `Quatrième étape, application pratique : Suivez la démonstration continue pendant que la voix anglaise originale reste très douce en arrière-plan.`,
        ],
      }
    case "de":
      return {
        overview: `Willkommen zu dieser praktischen Lehrstunde: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Erster Schritt, Werkzeugvorbereitung: Der Ausbilder legt den Winkel an die Holzkante an und prüft die Ausrichtung vor dem Anreißen.`,
          `Zweiter Schritt, präzise Ausführung an der Werkbank: Beachten Sie, wie der Ausbilder den Winkel fest am Werkstück führt, um exakte 90 Grad und 45 Grad Linien zu ziehen.`,
          `Dritter Schritt, Qualitäts- und Sicherheitsprüfung: Jeder Winkel wird vor dem Zuschnitt doppelt kontrolliert, um höchste Passgenauigkeit zu sichern.`,
          `Vierter Schritt, Praxisanwendung: Verfolgen Sie die Demonstration weiter, während der englische Originalton ganz leise im Hintergrund läuft.`,
        ],
      }
    case "zh":
      return {
        overview: `欢迎来到实操教学课堂：${translatedTitle}。${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `第一步，工具与基准准备：讲师将三角尺紧贴木材基准边，在划线前仔细确认对齐精度。`,
          `第二步，工作台精准实操：请注意讲师如何稳固握持三角尺，精准划出90度垂直线与45度斜角线。`,
          `第三步，质量与安全复核：在正式切割前对每个边角进行二次测量，确保施工现场零误差。`,
          `第四步，现场应用：英文原声已调低至背景音量，我们将持续为您全程同声传译直至视频结束。`,
        ],
      }
    case "ja":
      return {
        overview: `実践トレーニングセッションへようこそ：${translatedTitle}。${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `ステップ1、工具と基準面の準備：講師が木材の基準端にスコヤを当て、墨付け前の密着を確認します。`,
          `ステップ2、作業台での正確なマーキング：90度の垂直線と45度の角度を正確に引くための手の固定方法に注目してください。`,
          `ステップ3、品質と安全のダブルチェック：切断前にすべての角度と直角精度を再確認し、現場での手戻りを防ぎます。`,
          `ステップ4、実践応用：英語の原音は小音量で背景に流れ、動画の最後まで日本語で同時通訳を続けます。`,
        ],
      }
    case "ar":
      return {
        overview: `مرحباً بكم في جلسة التدريب العملي المباشر: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `الخطوة الأولى، تجهيز الأدوات: يضع المدرب مثلث النجارة بمحاذاة حافة الخشب ويتحقق من الاستقامة قبل وضع العلامات.`,
          `الخطوة الثانية، التنفيذ الدقيق على طاولة العمل: لاحظ كيف يثبت المدرب الأداة بإحكام لرسم خطوط دقيقة بزاوية تسعين درجة وخمس وأربعين درجة.`,
          `الخطوة الثالثة، فحص الجودة والسلامة: يتم فحص كل زاوية مرتين قبل القطع لضمان دقة التركيب في موقع العمل.`,
          `الخطوة الرابعة، التطبيق العملي: تستمر الترجمة الفورية باللغة العربية حتى نهاية الفيديو مع بقاء الصوت الإنجليزي منخفضاً في الخلفية.`,
        ],
      }
    case "hi":
      return {
        overview: `इस लाइव प्रैक्टिकल प्रशिक्षण सत्र में आपका स्वागत है: ${translatedTitle}। ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `पहला चरण, उपकरण की तैयारी: प्रशिक्षक लकड़ी के किनारे पर स्क्वायर रखते हैं और मार्किंग से पहले संरेखण की जाँच करते हैं।`,
          `दूसरा चरण, सटीक कोण मार्किंग: देखें कि प्रशिक्षक नब्बे डिग्री और पैंतालीस डिग्री की सटीक रेखाएँ खींचने के लिए उपकरण को लकड़ी पर कैसे मज़बूती से पकड़ते हैं।`,
          `तीसरा चरण, गुणवत्ता और सुरक्षा जाँच: कटाई से पहले प्रत्येक कोने को दो बार जाँचा जाता है ताकि काम में पूरी सटीकता रहे।`,
          `चौथा चरण, निरंतर लाइव व्याख्या: मूल अंग्रेजी आवाज़ पृष्ठभूमि में धीमी है और वीडियो के अंत तक हिंदी में व्याख्या जारी रहेगी।`,
        ],
      }
    case "sw":
      return {
        overview: `Karibu katika kipindi hiki cha mafunzo kwa vitendo: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Hatua ya kwanza, maandalizi ya vifaa: Mwalimu anaweka mraba kwenye ukingo wa ubao na kuhakikisha ulinganifu kabla ya kuweka alama.`,
          `Hatua ya pili, utekelezaji sahihi mezani: Tazama jinsi mwalimu anavyoshikilia kifaa kwa imara ili kuchora mistari sahihi ya nyuzi tisini na nyuzi arobaini na tano.`,
          `Hatua ya tatu, ukaguzi wa ubora na usalama: Kila kona inakaguliwa mara mbili kabla ya kukata ubao ili kuhakikisha kazi bora.`,
          `Hatua ya nne, tafsiri endelevu: Sauti ya Kiingereza iko chini kwa mbali huku tafsiri ya Kiswahili ikiendelea hadi mwisho wa video.`,
        ],
      }
    case "ru":
      return {
        overview: `Добро пожаловать на практическое занятие: ${translatedTitle}. ${translatedDesc}`,
        steps: [
          ...translatedTakeaways,
          `Шаг первый, подготовка инструмента: Инструктор прикладывает угольник к базовой кромке доски и проверяет плотность прилегания перед разметкой.`,
          `Шаг второй, точная разметка на верстаке: Обратите внимание, как инструктор фиксирует инструмент для проведения точных линий под углом девяносто и сорок пять градусов.`,
          `Шаг третий, контроль качества и точности: Каждый угол проверяется дважды перед распилом, чтобы исключить ошибки при сборке.`,
          `Шаг четвёртый, непрерывный синхронный перевод: Оригинальная английская речь звучит тихо на фоне, а урок переводится на русский язык до самого конца.`,
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
    listenVoiceDub: "🔊 Listen to English Interpretation",
    stopVoiceDub: "⏸ Pause English Interpretation",
    summaryHeading: "Interpreted English Video Overview",
    stepsHeading: "Continuous English Simultaneous Interpretation",
    askPlaceholder: "Ask Noctis in English to explain any part of this video...",
    askBtn: "Ask",
    translating: "Noctis is interpreting this global video into English...",
    liveInterpretingBadge: "Interpreting into English · Original Audio Lowered",
  },
  es: {
    triggerBtn: "Intérprete Noctis",
    popupTitle: "Intérprete Simultáneo IA Noctis",
    popupSubtitle: "Interpretación continua (Audio inglés al 4% · Voz aumentada)",
    listenVoiceDub: "🔊 Escuchar interpretación en Español",
    stopVoiceDub: "⏸ Pausar interpretación",
    summaryHeading: "Resumen del video traducido",
    stepsHeading: "Interpretación simultánea hasta el final",
    askPlaceholder: "Pide a Noctis que explique cualquier parte de este video...",
    askBtn: "Preguntar",
    translating: "Noctis está interpretando el video al Español...",
    liveInterpretingBadge: "Voz en Español aumentada · Audio inglés bajo (4%)",
  },
  pt: {
    triggerBtn: "Intérprete Noctis",
    popupTitle: "Intérprete Simultâneo IA Noctis",
    popupSubtitle: "Interpretação contínua (Inglês reduzido a 4% · Voz ampliada)",
    listenVoiceDub: "🔊 Ouvir interpretação em Português",
    stopVoiceDub: "⏸ Pausar interpretação",
    summaryHeading: "Resumo do vídeo traduzido",
    stepsHeading: "Interpretação simultânea até o fim",
    askPlaceholder: "Peça ao Noctis para explicar qualquer parte deste vídeo...",
    askBtn: "Perguntar",
    translating: "Noctis está interpretando o vídeo para Português...",
    liveInterpretingBadge: "Voz em Português ampliada · Inglês reduzido (4%)",
  },
  fr: {
    triggerBtn: "Interprète Noctis",
    popupTitle: "Interprète Simultané IA Noctis",
    popupSubtitle: "Interprétation continue (Audio anglais à 4% · Voix amplifiée)",
    listenVoiceDub: "🔊 Écouter l'interprétation en Français",
    stopVoiceDub: "⏸ Pause interprétation",
    summaryHeading: "Résumé de la vidéo traduit",
    stepsHeading: "Interprétation simultanée jusqu'à la fin",
    askPlaceholder: "Demandez à Noctis d'expliquer cette vidéo...",
    askBtn: "Demander",
    translating: "Noctis interprète la vidéo en Français...",
    liveInterpretingBadge: "Voix en Français amplifiée · Audio anglais bas (4%)",
  },
  de: {
    triggerBtn: "Noctis Dolmetscher",
    popupTitle: "Noctis KI-Simultandolmetscher",
    popupSubtitle: "Durchgehende Übersetzung (Englisch 4% · Stimme verstärkt)",
    listenVoiceDub: "🔊 Auf Deutsch anhören (Simultan)",
    stopVoiceDub: "⏸ Übersetzung pausieren",
    summaryHeading: "Übersetzte Video-Zusammenfassung",
    stepsHeading: "Simultandolmetschen bis zum Ende",
    askPlaceholder: "Fragen Sie Noctis zu diesem Video...",
    askBtn: "Fragen",
    translating: "Noctis übersetzt das Video ins Deutsche...",
    liveInterpretingBadge: "Deutsche Stimme verstärkt · Originalton leise (4%)",
  },
  zh: {
    triggerBtn: "Noctis 同声传译",
    popupTitle: "Noctis AI 视频同声传译",
    popupSubtitle: "全程连续同传（英文原声调低至 4% · 同传语音增强）",
    listenVoiceDub: "🔊 收听中文全程同声传译",
    stopVoiceDub: "⏸ 暂停同声传译",
    summaryHeading: "视频内容中文概要",
    stepsHeading: "全程分步连续同声传译",
    askPlaceholder: "向 Noctis 提问关于本视频的任何内容...",
    askBtn: "提问",
    translating: "Noctis 正在将英文视频实时同传为中文...",
    liveInterpretingBadge: "中文语音增强同传中 · 英文原声调低 (4%)",
  },
  ja: {
    triggerBtn: "Noctis 同時通訳",
    popupTitle: "Noctis AI ビデオ同時通訳",
    popupSubtitle: "最後まで連続通訳（英語原音4%・通訳音声ブースト）",
    listenVoiceDub: "🔊 日本語の同時通訳音声を聴く",
    stopVoiceDub: "⏸ 同時通訳を一時停止",
    summaryHeading: "翻訳された動画の概要",
    stepsHeading: "最後まで連続する同時通訳",
    askPlaceholder: "この動画について Noctis に質問する...",
    askBtn: "質問",
    translating: "Noctis が英語の動画を日本語に同時通訳しています...",
    liveInterpretingBadge: "日本語通訳音声ブースト中 · 英語原音は小音量 (4%)",
  },
  ar: {
    triggerBtn: "مترجم Noctis الفوري",
    popupTitle: "المترجم الفوري الذكي Noctis",
    popupSubtitle: "ترجمة صوتية مستمرة (خفض الصوت الإنجليزي إلى 4% وتقوية صوت الترجمة)",
    listenVoiceDub: "🔊 استمع للترجمة الصوتية بالعربية",
    stopVoiceDub: "⏸ إيقاف الترجمة المؤقت",
    summaryHeading: "ملخص الفيديو المترجم",
    stepsHeading: "الترجمة الفورية المستمرة حتى نهاية الفيديو",
    askPlaceholder: "اسأل Noctis لشرح أي جزء من هذا الفيديو...",
    askBtn: "اسأل",
    translating: "يقوم Noctis بالترجمة الفورية للفيديو إلى العربية...",
    liveInterpretingBadge: "صوت الترجمة العربية مُعزّز · الصوت الإنجليزي منخفض (4%)",
  },
  hi: {
    triggerBtn: "Noctis लाइव दुभाषिया",
    popupTitle: "Noctis AI लाइव वीडियो दुभाषिया",
    popupSubtitle: "अंत तक निरंतर अनुवाद (अंग्रेजी ऑडियो 4% · अनुवाद की आवाज़ तेज़)",
    listenVoiceDub: "🔊 हिंदी लाइव आवाज़ में सुनें",
    stopVoiceDub: "⏸ व्याख्या रोकें",
    summaryHeading: "अनुवादित वीडियो सारांश",
    stepsHeading: "अंत तक निरंतर लाइव व्याख्या",
    askPlaceholder: "इस वीडियो के बारे में Noctis से कुछ भी पूछें...",
    askBtn: "पूछें",
    translating: "Noctis वीडियो का हिंदी में लाइव अनुवाद कर रहा है...",
    liveInterpretingBadge: "हिंदी अनुवाद आवाज़ तेज़ · मूल आवाज़ धीमी (4%)",
  },
  sw: {
    triggerBtn: "Mkalimani wa Noctis",
    popupTitle: "Mkalimani wa Moja kwa Moja wa Noctis AI",
    popupSubtitle: "Tafsiri Endelevu (Sauti ya Kiingereza 4% · Sauti ya Tafsiri Imeongezwa)",
    listenVoiceDub: "🔊 Sikiliza Sauti kwa Kiswahili",
    stopVoiceDub: "⏸ Simamisha Ukaliimani",
    summaryHeading: "Muhtasari wa Video Uliotafsiriwa",
    stepsHeading: "Tafsiri Endelevu Hatua kwa Hatua Hadi Mwisho",
    askPlaceholder: "Muulize Noctis aeleze sehemu yoyote ya video hii...",
    askBtn: "Uliza",
    translating: "Noctis inatafsiri video kwa Kiswahili...",
    liveInterpretingBadge: "Sauti ya Kiswahili Imeongezwa · Kiingereza Chini (4%)",
  },
  ru: {
    triggerBtn: "Синхронный перевод Noctis",
    popupTitle: "ИИ-синхронный переводчик Noctis",
    popupSubtitle: "Непрерывный перевод (английский звук 4% · громкость перевода усилена)",
    listenVoiceDub: "🔊 Слушать озвучку на русском",
    stopVoiceDub: "⏸ Пауза перевода",
    summaryHeading: "Переведённый обзор видео",
    stepsHeading: "Непрерывный синхронный перевод до конца",
    askPlaceholder: "Спросите Noctis о любом моменте из этого видео...",
    askBtn: "Спросить",
    translating: "Noctis синхронно переводит видео на русский язык...",
    liveInterpretingBadge: "Голос перевода усилен · Английский звук тихо (4%)",
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

// Cache translated video scripts by `${language}::${title}` so scrolling to the next video has 0ms translation delay
const TRANSLATED_VIDEO_SCRIPT_CACHE = new Map<
  string,
  { title: string; overview: string; steps: string[]; isFullyTranslated: boolean }
>()

function getInitialVideoScript(
  language: LanguageCode,
  title: string,
  speaker: string,
  description: string,
  takeaways: string[]
): { title: string; overview: string; steps: string[]; isFullyTranslated: boolean } {
  const cacheKey = `${language}::${title}`
  const cached = TRANSLATED_VIDEO_SCRIPT_CACHE.get(cacheKey)
  if (cached) return cached

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
    return { title, overview: tpl.overview, steps: tpl.steps, isFullyTranslated: true }
  }

  const dict = NATIVE_VIDEO_PHRASES[language] || {}
  const instantTitle = dict[title.trim()]
  const instantDesc = dict[cleanDesc]
  const instantTakeaways = baseTakeaways.map((t) => dict[t.trim()] || null)
  const hasNativeTemplate = [
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
  ].includes(language)
  const isFullyTranslated = Boolean(
    hasNativeTemplate && instantTitle && instantDesc && instantTakeaways.every(Boolean)
  )

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
  return {
    title: initialTitle,
    overview: initialTpl.overview,
    steps: initialTpl.steps,
    isFullyTranslated,
  }
}

// Singleton shared HTMLAudioElement + Web Audio Broadcast Vocal Clarity EQ & 2.6x Gain across all video cards on the page.
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

        // 1. Low-cut highpass filter (removes muddy rumble below 95 Hz)
        const highpass = ctx.createBiquadFilter()
        highpass.type = "highpass"
        highpass.frequency.setValueAtTime(95, ctx.currentTime)

        // 2. Vocal articulation presence boost (+3.5 dB at 2.8 kHz for crisp consonant & vowel clarity)
        const presenceEq = ctx.createBiquadFilter()
        presenceEq.type = "peaking"
        presenceEq.frequency.setValueAtTime(2800, ctx.currentTime)
        presenceEq.Q.setValueAtTime(1.1, ctx.currentTime)
        presenceEq.gain.setValueAtTime(3.5, ctx.currentTime)

        // 3. Broadcast vocal compressor
        const compressor = ctx.createDynamicsCompressor()
        compressor.threshold.setValueAtTime(-24, ctx.currentTime)
        compressor.knee.setValueAtTime(16, ctx.currentTime)
        compressor.ratio.setValueAtTime(4, ctx.currentTime)
        compressor.attack.setValueAtTime(0.003, ctx.currentTime)
        compressor.release.setValueAtTime(0.15, ctx.currentTime)

        // 4. 2.6x (260%) Master Output Gain
        const gain = ctx.createGain()
        gain.gain.setValueAtTime(2.6, ctx.currentTime)

        source.connect(highpass)
        highpass.connect(presenceEq)
        presenceEq.connect(compressor)
        compressor.connect(gain)
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

export function NoctisVideoInterpreterPopup({
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
  const { language, setLanguage, currentLanguage, languages } = useLanguage()
  const normalizedSourceLang = (sourceLanguage || "en").toLowerCase()
  const isInterpretingNeeded = language !== normalizedSourceLang
  const instanceIdRef = useRef<string>(`noctis-int-${Math.random().toString(36).slice(2, 10)}`)

  const initialScript = useMemo(
    () => getInitialVideoScript(language, title, speaker, description, takeaways),
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
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false)
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
  const languageRef = useRef(language)
  languageRef.current = language
  const sourceLangRef = useRef(normalizedSourceLang)
  sourceLangRef.current = normalizedSourceLang
  const onMuteOriginalVideoRef = useRef(onMuteOriginalVideo)
  onMuteOriginalVideoRef.current = onMuteOriginalVideo
  const onRequestPlayVideoRef = useRef(onRequestPlayVideo)
  onRequestPlayVideoRef.current = onRequestPlayVideo
  const spokenLangAndTitleRef = useRef<string>("")
  const userManuallyPausedDubRef = useRef(false)
  const nextSentenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeSentenceIdxRef = useRef(0)
  activeSentenceIdxRef.current = activeSentenceIdx

  // Connect the Noctis TTS <audio> element to Broadcast Vocal Clarity EQ + DynamicsCompressor + 2.6x GainNode
  const boostInterpretationAudioElement = useCallback((audioEl: HTMLAudioElement) => {
    ensureSharedAudioBoostGraph(audioEl)
  }, [])

  // Also lower or restore any HTML5 <video> elements on the page when Noctis interpretation is active
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
    if (UI_LABELS[language]) return UI_LABELS[language]!
    return {
      triggerBtn: `Noctis · ${currentLanguage.localName}`,
      popupTitle: `Noctis AI Interpreter (${currentLanguage.localName})`,
      popupSubtitle: `${currentLanguage.localName} Live Voice (+260%) · English Audio Lowered (4%)`,
      listenVoiceDub: `🔊 Listen in ${currentLanguage.localName}`,
      stopVoiceDub: `⏸ Pause ${currentLanguage.localName} Voice`,
      summaryHeading: `Translated Video Overview (${currentLanguage.localName})`,
      stepsHeading: `Simultaneous Interpretation (${currentLanguage.localName})`,
      askPlaceholder: `Ask Noctis in ${currentLanguage.localName}...`,
      askBtn: "Ask",
      translating: `Noctis is interpreting into ${currentLanguage.localName}...`,
      liveInterpretingBadge: `Speaking in ${currentLanguage.localName} · English Lowered (4%)`,
    }
  }, [language, currentLanguage.localName])
  const takeawaysKey = useMemo(() => (takeaways || []).join("||"), [takeaways])

  // Build crisp sentence chunks for continuous speech
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

  // Core sentence-by-sentence continuous audio player:
  // Uses singleton `/api/connectin/tts` HTML5 <audio> with next-sentence preloading for 100% smooth, unbroken voice output across scroll.
  const speakSentenceAtIndex = useCallback((idx: number) => {
    if (typeof window === "undefined") return
    if (!isSpeakingRef.current) return
    if ((window as any).__activeNoctisInterpreterId !== instanceIdRef.current) return

    const list = sentencesRef.current
    if (!list || list.length === 0) return

    const safeIdx = ((idx % list.length) + list.length) % list.length
    setActiveSentenceIdx(safeIdx)
    activeSentenceIdxRef.current = safeIdx

    // Keep the English video speaking very quietly in the background (4% volume)
    if (onMuteOriginalVideoRef.current) {
      onMuteOriginalVideoRef.current(true)
    }
    setPageVideoElementsDucking(true)

    const sentenceText = list[safeIdx]
    const nextSentenceText = list[(safeIdx + 1) % list.length]
    const targetLang = languageRef.current

    // Preload the NEXT sentence in the background so there is zero gap or stutter between sentences!
    if (nextSentenceText) {
      try {
        const preloadAudio = getSharedNoctisPreloadAudio()
        if (preloadAudio) {
          preloadAudio.src = `/api/connectin/tts?lang=${encodeURIComponent(
            targetLang
          )}&text=${encodeURIComponent(nextSentenceText.slice(0, 190))}`
          preloadAudio.load()
        }
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
      if ((window as any).__activeNoctisInterpreterId !== instanceIdRef.current) return
      try {
        const utterance = new SpeechSynthesisUtterance(sentenceText)
        const targetLocale = SPEECH_LOCALE_MAP[targetLang] || "en-US"
        utterance.lang = targetLocale
        utterance.rate = 0.96
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

    // Primary: Play real native voice MP3 stream via `/api/connectin/tts` on singleton HTMLAudioElement with 260% Web Audio Gain Boost
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
          audio.playbackRate = 0.96
        } catch {}
        boostInterpretationAudioElement(audio)
      }
      audio.volume = 1.0
      boostInterpretationAudioElement(audio)
      audio.src = `/api/connectin/tts?lang=${encodeURIComponent(
        targetLang
      )}&text=${encodeURIComponent(sentenceText.slice(0, 190))}`
      audio.onended = () => {
        if ((window as any).__activeNoctisInterpreterId === instanceIdRef.current) {
          scheduleNextSentence(260)
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
    (restoreFullEnglishVolume = true) => {
      isSpeakingRef.current = false
      setIsSpeaking(false)
      stopAudioOutput(false)
      if (restoreFullEnglishVolume) {
        if (onMuteOriginalVideoRef.current) {
          onMuteOriginalVideoRef.current(false)
        }
        setPageVideoElementsDucking(false)
      }
    },
    [stopAudioOutput, setPageVideoElementsDucking]
  )

  // Translate title, description, and takeaways ONLY when language or video content changes (never on 500ms timer ticks!)
  useEffect(() => {
    let cancelled = false

    async function runInterpretation() {
      const cacheKey = `${language}::${title}`
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
        setIsLoadingTranslation(false)
        if (
          language !== sourceLangRef.current &&
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
        TRANSLATED_VIDEO_SCRIPT_CACHE.set(cacheKey, {
          title,
          overview: tpl.overview,
          steps: tpl.steps,
          isFullyTranslated: true,
        })
        setTranslatedTitle(title)
        setTranslatedOverview(tpl.overview)
        setTranslatedSteps(tpl.steps)
        sentencesRef.current = buildContinuousInterpreterSentences(title, tpl.overview, tpl.steps)
        setIsLoadingTranslation(false)
        // If this is a non-English international training video (e.g. Spanish, French, Japanese, Arabic, Hindi, Swahili)
        // and the user's selected language is English ("en"), automatically interpret it back into English aloud!
        if (
          sourceLangRef.current !== "en" &&
          (isPlayingRef.current || isPopupOpenRef.current) &&
          !userManuallyPausedDubRef.current &&
          (!isSpeakingRef.current || spokenLangAndTitleRef.current !== cacheKey)
        ) {
          spokenLangAndTitleRef.current = cacheKey
          startContinuousInterpretation(0)
        }
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
      sentencesRef.current = buildContinuousInterpreterSentences(
        initialTitle,
        initialTpl.overview,
        initialTpl.steps
      )

      const hasNativeTemplate = [
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
      ].includes(language)

      const needsDynamicTranslation =
        !hasNativeTemplate || !instantTitle || !instantDesc || instantTakeaways.some((x) => !x)

      if (!needsDynamicTranslation) {
        TRANSLATED_VIDEO_SCRIPT_CACHE.set(cacheKey, {
          title: initialTitle,
          overview: initialTpl.overview,
          steps: initialTpl.steps,
          isFullyTranslated: true,
        })
        setIsLoadingTranslation(false)
        if (
          (isPlayingRef.current || isPopupOpenRef.current) &&
          !userManuallyPausedDubRef.current &&
          (!isSpeakingRef.current || spokenLangAndTitleRef.current !== cacheKey)
        ) {
          spokenLangAndTitleRef.current = cacheKey
          startContinuousInterpretation(0)
        }
        return
      }

      setIsLoadingTranslation(true)
      try {
        let finalTitle = initialTitle
        let finalOverview = initialTpl.overview
        let finalSteps = initialTpl.steps

        if (hasNativeTemplate) {
          const toTranslate = [title, cleanDesc, ...baseTakeaways]
          const translatedList = await translateLinesLive(toTranslate, language)
          if (!cancelled && translatedList.length === toTranslate.length) {
            finalTitle = instantTitle || translatedList[0]
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
            finalOverview = finalTpl.overview
            finalSteps = finalTpl.steps
          }
        } else {
          // Translate full English template overview + steps into any of the 46 world/African languages!
          const enTpl = buildNativeLocalizedTemplate("en", title, speaker, cleanDesc, baseTakeaways)
          const toTranslate = [title, enTpl.overview, ...enTpl.steps]
          const translatedList = await translateLinesLive(toTranslate, language)
          if (!cancelled && translatedList.length === toTranslate.length) {
            finalTitle = translatedList[0]
            finalOverview = translatedList[1]
            finalSteps = translatedList.slice(2)
          }
        }

        if (!cancelled) {
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
          // As soon as translation finishes for a newly scrolled-to video, start speaking in the target language!
          if (
            languageRef.current !== sourceLangRef.current &&
            (isPlayingRef.current || isPopupOpenRef.current) &&
            !userManuallyPausedDubRef.current
          ) {
            spokenLangAndTitleRef.current = cacheKey
            startContinuousInterpretation(0)
          }
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
  }, [language, normalizedSourceLang, title, speaker, description, takeawaysKey, startContinuousInterpretation]) // eslint-disable-line react-hooks/exhaustive-deps

  // Automatically start simultaneous interpretation when video becomes active on scroll or click
  useEffect(() => {
    if (language === normalizedSourceLang) {
      spokenLangAndTitleRef.current = ""
      if (isSpeakingRef.current) {
        stopContinuousInterpretation(true)
      }
      return
    }

    const sessionKey = `${language}::${title}`
    if (isPlaying && !userManuallyPausedDubRef.current) {
      if (typeof window !== "undefined" && (window as any).__noctisPopupOpenGlobal) {
        setIsPopupOpen(true)
      }
      // If script is already translated (cached or native dictionary), start immediately;
      // otherwise runInterpretation() will start it as soon as translateLinesLive finishes (~150ms)
      const cached = TRANSLATED_VIDEO_SCRIPT_CACHE.get(sessionKey)
      if (cached?.isFullyTranslated || !isLoadingTranslation || language === "en") {
        if (!isSpeakingRef.current || spokenLangAndTitleRef.current !== sessionKey) {
          spokenLangAndTitleRef.current = sessionKey
          startContinuousInterpretation(0)
        }
      }
    } else if (!isPlaying && isSpeakingRef.current && !isPopupOpen) {
      stopContinuousInterpretation(false)
    }
  }, [
    language,
    normalizedSourceLang,
    title,
    isPlaying,
    isPopupOpen,
    isLoadingTranslation,
    startContinuousInterpretation,
    stopContinuousInterpretation,
  ])

  // Restart speaking in the newly selected language immediately when language changes while popup is open
  useEffect(() => {
    const sessionKey = `${language}::${title}`
    if (
      language !== normalizedSourceLang &&
      isPopupOpen &&
      !userManuallyPausedDubRef.current &&
      spokenLangAndTitleRef.current !== sessionKey
    ) {
      if (!isPlayingRef.current && onRequestPlayVideoRef.current) {
        onRequestPlayVideoRef.current()
      }
      const cached = TRANSLATED_VIDEO_SCRIPT_CACHE.get(sessionKey)
      if (cached?.isFullyTranslated || !isLoadingTranslation || language === "en") {
        spokenLangAndTitleRef.current = sessionKey
        startContinuousInterpretation(0)
      }
    }
  }, [language, normalizedSourceLang, title, isPopupOpen, isLoadingTranslation, startContinuousInterpretation])

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
      if (
        languageRef.current !== sourceLangRef.current &&
        (isPlayingRef.current || isPopupOpenRef.current) &&
        !userManuallyPausedDubRef.current &&
        (!isSpeakingRef.current ||
          (window as any).__activeNoctisInterpreterId !== instanceIdRef.current ||
          !sharedAudio ||
          sharedAudio.paused)
      ) {
        spokenLangAndTitleRef.current = `${languageRef.current}::${title}`
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
  }, [language, isInterpretingNeeded, title, isPlaying, isPopupOpen, startContinuousInterpretation])

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
            if (nextOpen && isInterpretingNeeded && !isSpeakingRef.current) {
              startContinuousInterpretation(activeSentenceIdxRef.current)
            }
          }}
          style={{
            backgroundColor: isPopupOpen || isSpeaking || isInterpretingNeeded ? "#0A66C2" : "rgba(15, 23, 42, 0.92)",
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
          <span style={{ color: "#FFFFFF" }}>
            {sourceLanguageLabel && language === "en"
              ? `${sourceLanguageLabel}`
              : labels.triggerBtn}
          </span>
          <span
            style={{ backgroundColor: "#0F172A", color: "#FDE68A" }}
            className="rounded px-1.5 py-0.5 text-[10px] font-mono font-black border border-white/25"
          >
            {currentLanguage.flag} {currentLanguage.code.toUpperCase()}
          </span>
        </button>
      </div>

      {/* 2. SLIM, HIGH-VISIBILITY SUBTITLE BAR AT VERY BOTTOM EDGE */}
      {(isInterpretingNeeded || isSpeaking) && showSubtitlesStrip && (
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
