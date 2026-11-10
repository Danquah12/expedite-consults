import { NextRequest, NextResponse } from "next/server"

const PRIMARY_TTS_LANG_MAP: Record<string, string> = {
  en: "en",
  ak: "ak",
  ee: "ee",
  gaa: "gaa",
  ha: "ha",
  yo: "yo",
  ig: "ig",
  sw: "sw",
  am: "am",
  om: "om",
  so: "so",
  zu: "zu",
  xh: "xh",
  rw: "rw",
  sn: "sn",
  wo: "wo",
  lg: "lg",
  es: "es",
  fr: "fr",
  de: "de",
  pt: "pt-BR",
  it: "it",
  nl: "nl",
  pl: "pl",
  uk: "uk",
  ru: "ru",
  tr: "tr",
  el: "el",
  sv: "sv",
  ar: "ar",
  fa: "fa",
  he: "iw",
  hi: "hi",
  bn: "bn",
  ur: "ur",
  pa: "pa",
  ta: "ta",
  zh: "zh-CN",
  ja: "ja",
  ko: "ko",
  vi: "vi",
  th: "th",
  id: "id",
  ms: "ms",
  tl: "tl",
}

// Phonetic fallback voice engines for African & regional languages whose text uses phonetic vowels (a, e, ɛ, i, o, ɔ, u)
const PHONETIC_FALLBACK_TTS_VOICE: Record<string, string[]> = {
  ak: ["sw", "yo", "af", "pt-BR"],
  ee: ["sw", "yo", "fr", "af"],
  gaa: ["sw", "yo", "af", "pt-BR"],
  ha: ["ha", "sw", "ar", "af"],
  yo: ["yo", "sw", "af", "pt-BR"],
  ig: ["ig", "sw", "yo", "af"],
  am: ["am", "ar", "sw"],
  om: ["sw", "so", "af"],
  so: ["so", "sw", "ar"],
  zu: ["zu", "sw", "af"],
  xh: ["zu", "sw", "af"],
  rw: ["sw", "fr", "af"],
  sn: ["sw", "zu", "af"],
  wo: ["fr", "sw", "af"],
  lg: ["sw", "af", "en"],
  fa: ["fa", "ar", "ur"],
  he: ["iw", "he", "ar"],
  pa: ["pa", "hi", "ur"],
}

// Normalizes Extended African Alphabet characters (Twi ɛ/ɔ, Ewe ɖ/ƒ/ŋ/ʋ/ɣ, Ga ŋ/ɛ/ɔ) for smooth phonetic TTS reading
function normalizeAfricanPhonetics(text: string): string {
  return text
    .replace(/ɛ/g, "e")
    .replace(/Ɛ/g, "E")
    .replace(/ɔ/g, "o")
    .replace(/Ɔ/g, "O")
    .replace(/ɖ/g, "d")
    .replace(/Ɖ/g, "D")
    .replace(/ƒ/g, "f")
    .replace(/Ƒ/g, "F")
    .replace(/ŋ/g, "ng")
    .replace(/Ŋ/g, "Ng")
    .replace(/ʋ/g, "v")
    .replace(/Ʋ/g, "V")
    .replace(/ɣ/g, "g")
    .replace(/Ɣ/g, "G")
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawText = (searchParams.get("text") || "").trim().slice(0, 200)
  const rawLang = (searchParams.get("lang") || "en").trim().toLowerCase()
  const primaryTl = PRIMARY_TTS_LANG_MAP[rawLang] || rawLang || "en"

  if (!rawText) {
    return new NextResponse("Missing text", { status: 400 })
  }

  const candidateLangs = Array.from(
    new Set([primaryTl, ...(PHONETIC_FALLBACK_TTS_VOICE[rawLang] || []), "sw", "en"])
  )

  for (let i = 0; i < candidateLangs.length; i++) {
    const tl = candidateLangs[i]
    // Use exact text for primary language, and phonetically normalized text if using a phonetic fallback voice
    const textForVoice = i === 0 ? rawText : normalizeAfricanPhonetics(rawText)

    const endpoints = [
      `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textForVoice)}&tl=${encodeURIComponent(tl)}&total=1&idx=0&textlen=${textForVoice.length}&client=tw-ob`,
      `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textForVoice)}&tl=${encodeURIComponent(tl)}&client=gtx`,
    ]

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            Referer: "https://translate.google.com/",
          },
        })

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer()
          if (arrayBuffer.byteLength > 100) {
            return new NextResponse(arrayBuffer, {
              status: 200,
              headers: {
                "Content-Type": "audio/mpeg",
                "Cache-Control": "public, max-age=86400, s-maxage=86400",
              },
            })
          }
        }
      } catch {
        // Try next endpoint / fallback voice
      }
    }
  }

  return new NextResponse("TTS unavailable", { status: 502 })
}
