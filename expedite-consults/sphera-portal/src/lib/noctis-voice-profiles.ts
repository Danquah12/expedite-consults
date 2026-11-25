import type { LanguageCode } from "@/lib/translations"

export type LanguageVoiceMode = "server-native" | "client-mms-native" | "subtitles-only"

export type MmsEngineKind = "transformers-vits" | "onnx-vits" | "sherpa-vits"

export interface LanguageVoiceProfile {
  code: LanguageCode
  mode: LanguageVoiceMode
  engineLabel: string
  nativeSpeakerLabel: string
  mmsRepo?: string
  mmsFormat?: MmsEngineKind
  mmsDtype?: "fp32" | "fp16" | "q8" | "q4" | "q4f16"
  mmsOnnxFile?: string
  mmsTokensFile?: string
  mmsVocabFile?: string
  mmsConfigFile?: string
}

const SERVER_EDGE_PROFILES: Record<string, { label: string }> = {
  en: { label: "Studio Neural · English" },
  es: { label: "Native Neural · Español" },
  fr: { label: "Native Neural · Français" },
  de: { label: "Native Neural · Deutsch" },
  pt: { label: "Native Neural · Português" },
  it: { label: "Native Neural · Italiano" },
  nl: { label: "Native Neural · Nederlands" },
  pl: { label: "Native Neural · Polski" },
  uk: { label: "Native Neural · Українська" },
  ru: { label: "Native Neural · Русский" },
  tr: { label: "Native Neural · Türkçe" },
  el: { label: "Native Neural · Ελληνικά" },
  sv: { label: "Native Neural · Svenska" },
  ar: { label: "Native Neural · العربية" },
  fa: { label: "Native Neural · فارسی" },
  he: { label: "Native Neural · עברית" },
  hi: { label: "Native Neural · हिन्दी" },
  bn: { label: "Native Neural · বাংলা" },
  ur: { label: "Native Neural · اردو" },
  ta: { label: "Native Neural · தமிழ்" },
  zh: { label: "Native Neural · 中文" },
  ja: { label: "Native Neural · 日本語" },
  ko: { label: "Native Neural · 한국어" },
  vi: { label: "Native Neural · Tiếng Việt" },
  th: { label: "Native Neural · ไทย" },
  id: { label: "Native Neural · Indonesia" },
  ms: { label: "Native Neural · Melayu" },
  tl: { label: "Native Neural · Filipino" },
  sw: { label: "Native Neural · Kiswahili" },
  am: { label: "Native Neural · አማርኛ" },
  so: { label: "Native Neural · Af-Soomaali" },
  zu: { label: "Native Neural · isiZulu" },
}

const SERVER_GOOGLE_NATIVE_PROFILES: Record<string, { label: string }> = {
  ha: { label: "Native Voice · Hausa" },
  pa: { label: "Native Voice · ਪੰਜਾਬੀ" },
}

export const CLIENT_MMS_PROFILES: Partial<Record<LanguageCode, Omit<LanguageVoiceProfile, "code" | "mode">>> = {
  ak: {
    engineLabel: "Meta MMS Native (Akan/Twi)",
    nativeSpeakerLabel: "Native Akan/Twi Speaker · Meta MMS",
    mmsRepo: "onnx-community/mms-tts-aka-ONNX",
    mmsFormat: "onnx-vits",
    mmsOnnxFile: "onnx/model.onnx",
    mmsVocabFile: "vocab.json",
  },
  yo: {
    engineLabel: "Meta MMS Native (Yorùbá)",
    nativeSpeakerLabel: "Native Yorùbá Speaker · Meta MMS",
    mmsRepo: "Xenova/mms-tts-yor",
    mmsFormat: "onnx-vits",
    mmsOnnxFile: "onnx/model_quantized.onnx",
    mmsVocabFile: "vocab.json",
  },
  ig: {
    engineLabel: "Meta MMS Native (Igbo)",
    nativeSpeakerLabel: "Native Igbo Speaker · Meta MMS",
    mmsRepo: "alsonNifemi/mms-tts-ibo",
    mmsFormat: "onnx-vits",
    mmsOnnxFile: "onnx/model_quantized.onnx",
    mmsVocabFile: "vocab.json",
  },
  wo: {
    engineLabel: "Meta MMS Native (Wolof)",
    nativeSpeakerLabel: "Native Wolof Speaker · Meta MMS",
    mmsRepo: "jaguaman09/mms-tts-wol-onnx",
    mmsFormat: "onnx-vits",
    mmsOnnxFile: "onnx/model_quantized.onnx",
    mmsVocabFile: "vocab.json",
  },
  rw: {
    engineLabel: "Meta MMS Native (Ikinyarwanda)",
    nativeSpeakerLabel: "Native Kinyarwanda Speaker · Meta MMS",
    mmsRepo: "gloire2/mms-tts-kin-onnx",
    mmsFormat: "onnx-vits",
    mmsOnnxFile: "model.onnx",
    mmsVocabFile: "vocab.json",
    mmsConfigFile: "config.json",
  },
  ee: {
    engineLabel: "Meta MMS Native (Eʋegbe)",
    nativeSpeakerLabel: "Native Ewe Speaker · Meta MMS",
    mmsRepo: "Devsyril/mms-tts-ewe-sherpa-onnx",
    mmsFormat: "sherpa-vits",
    mmsOnnxFile: "model.onnx",
    mmsTokensFile: "tokens.txt",
  },
  om: {
    engineLabel: "Meta MMS Native (Afaan Oromoo)",
    nativeSpeakerLabel: "Native Oromo Speaker · Meta MMS",
    mmsRepo: "hadamard-2/mms-tts-orm-onnx",
    mmsFormat: "sherpa-vits",
    mmsOnnxFile: "model.onnx",
    mmsTokensFile: "tokens.txt",
  },
}

export function getLanguageVoiceProfile(code: LanguageCode): LanguageVoiceProfile {
  if (SERVER_EDGE_PROFILES[code]) {
    return {
      code,
      mode: "server-native",
      engineLabel: "Studio Native Neural",
      nativeSpeakerLabel: SERVER_EDGE_PROFILES[code].label,
    }
  }
  if (SERVER_GOOGLE_NATIVE_PROFILES[code]) {
    return {
      code,
      mode: "server-native",
      engineLabel: "Native Regional Voice",
      nativeSpeakerLabel: SERVER_GOOGLE_NATIVE_PROFILES[code].label,
    }
  }
  const mms = CLIENT_MMS_PROFILES[code]
  if (mms) {
    return {
      code,
      mode: "client-mms-native",
      ...mms,
    }
  }
  return {
    code,
    mode: "subtitles-only",
    engineLabel: "Live Translated Subtitles",
    nativeSpeakerLabel: "Live Subtitles · Native Voice Coming Soon",
  }
}

const AKAN_UNITS = ["hwee", "baako", "mmienu", "mmiɛnsa", "nnan", "nnum", "nsia", "nson", "nwɔtwe", "nkron"]
const AKAN_TENS = [
  "",
  "du",
  "aduonu",
  "aduasa",
  "aduanan",
  "aduonum",
  "aduosia",
  "aduɔson",
  "aduɔwɔtwe",
  "aduɔkron",
]

function numberToAkanWords(n: number): string {
  if (!Number.isFinite(n) || n < 0) return ""
  const int = Math.round(n)
  if (int < 10) return AKAN_UNITS[int]
  if (int === 10) return "du"
  if (int < 20) return `du ${AKAN_UNITS[int - 10]}`
  if (int < 100) {
    const tens = Math.floor(int / 10)
    const unit = int % 10
    return unit === 0 ? AKAN_TENS[tens] : `${AKAN_TENS[tens]} ${AKAN_UNITS[unit]}`
  }
  if (int < 1000) {
    const hundreds = Math.floor(int / 100)
    const rem = int % 100
    const hWord = hundreds === 1 ? "ɔha" : `ahanu ${hundreds === 2 ? "" : AKAN_UNITS[hundreds]}`.trim()
    const prefix =
      hundreds === 1
        ? "ɔha"
        : hundreds === 2
        ? "ahanu"
        : hundreds === 3
        ? "ahasa"
        : hundreds === 4
        ? "ahanan"
        : hundreds === 5
        ? "ahanum"
        : hundreds === 6
        ? "ahasia"
        : hundreds === 7
        ? "ahason"
        : hundreds === 8
        ? "ahanwɔtwe"
        : "ahankron"
    return rem === 0 ? prefix : `${prefix} ne ${numberToAkanWords(rem)}`
    void hWord
  }
  return String(int)
    .split("")
    .map((d) => AKAN_UNITS[Number(d)] || "")
    .join(" ")
}

/**
 * Character-level VITS models (Meta MMS) require clean orthographic text matching their trained charset:
 * no unexpanded numbers/symbols ("90°"), no emojis, and clean sentence punctuation pauses.
 * Crucially: this PRESERVES genuine indigenous vowels/diacritics (ɛ, ɔ, á, ɛ, ɖ, ƒ, ŋ, ʋ, ẹ, ọ, ṣ, etc.).
 */
export function normalizeTextForMms(rawText: string, lang: LanguageCode): string {
  let text = (rawText || "")
    .replace(/^\s*\[\d{1,2}:\d{2}(?::\d{2})?\]\s*/g, "")
    .replace(/^\s*\(\d{1,2}:\d{2}(?::\d{2})?\)\s*/g, "")
    .replace(/[🔊⏸🎬🎯🤖✨✓✕•·|]/g, " ")
    .replace(/[—–]/g, ", ")
    .replace(/["“”«»()[\]{}]/g, " ")
    .replace(/ConnectLn/gi, lang === "ak" ? "kɔnɛktlin" : "konektlin")
    .replace(/Noctis/gi, "noktis")

  if (lang === "ak") {
    // Expand common numbers & degree angles into authentic Asante Twi words
    text = text
      .replace(/(\d+)\s*°/g, (_m, num) => `digrii ${numberToAkanWords(Number(num))}`)
      .replace(/\b(\d+)\b/g, (_m, num) => numberToAkanWords(Number(num)))
      // Clean Unicode normalization to composed forms and lowercase preserving ɛ, ɔ, á
      .normalize("NFC")
      .toLowerCase()
      // Map stray loanword letters not present in Meta's Akan MMS-TTS vocab (a-z sans c,j,q,v,x,z plus ɛ,ɔ,á)
      .replace(/video/g, "fidio")
      .replace(/speed\s*square/g, "susudua ahinanan")
      .replace(/obd-?ii/g, "o bi di mmienu")
      .replace(/q/g, "kw")
      .replace(/x/g, "ks")
      .replace(/c(?=[ei])/g, "s")
      .replace(/c/g, "k")
      .replace(/j/g, "gy")
      .replace(/v/g, "f")
      .replace(/z/g, "s")
      // Replace any remaining apostrophes/symbols outside MMS Akan vocab
      .replace(/[;:?!.]+/g, ". ")
      .replace(/,/g, " ")
      .replace(/[^a-zɛɔá\s\-'.]/g, " ")
  } else if (lang === "yo") {
    text = text
      .replace(/(\d+)\s*°/g, "$1 ")
      .replace(/\b(\d+)\b/g, " ")
      .normalize("NFC")
      .toLowerCase()
  } else if (lang === "ig") {
    // rnjema-unima/mms-tts-ibo-baseline uses Yoruba VITS charset (no subdotted ị / ụ / ṅ), map those closest vowels
    text = text
      .replace(/(\d+)\s*°/g, "digrii ")
      .replace(/\b(\d+)\b/g, " ")
      .normalize("NFC")
      .toLowerCase()
      .replace(/ị/g, "i")
      .replace(/ụ/g, "u")
      .replace(/ṅ/g, "n")
  } else {
    text = text
      .replace(/(\d+)\s*°/g, " ")
      .replace(/\b(\d+)\b/g, " ")
      .normalize("NFC")
      .toLowerCase()
  }

  return text.replace(/\s+/g, " ").trim()
}

/**
 * Splits a normalized utterance into clause-sized chunks (3..120 chars) so VITS
 * generates natural rhythm and intonation without rushing long run-on sentences.
 */
export function splitMmsSpeakableChunks(normalizedText: string): string[] {
  const cleaned = (normalizedText || "").trim()
  if (!cleaned) return []
  const rawParts = cleaned
    .split(/[.!?]+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 0)

  const chunks: string[] = []
  for (const part of rawParts) {
    if (part.length <= 120) {
      chunks.push(part)
      continue
    }
    const words = part.split(" ")
    let buf = ""
    for (const w of words) {
      if ((buf + " " + w).trim().length <= 105) {
        buf = (buf + " " + w).trim()
      } else {
        if (buf) chunks.push(buf)
        buf = w
      }
    }
    if (buf) chunks.push(buf)
  }
  return chunks
}
