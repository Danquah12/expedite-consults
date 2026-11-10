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

// Phonetic fallback voice engines for African & regional languages whose text uses pure phonetic vowels
const PHONETIC_FALLBACK_TTS_VOICE: Record<string, string[]> = {
  ak: ["sw", "yo", "id", "pt-BR"],
  ee: ["sw", "yo", "fr", "id"],
  gaa: ["sw", "yo", "id", "pt-BR"],
  ha: ["ha", "sw", "id", "ar"],
  yo: ["yo", "sw", "id", "pt-BR"],
  ig: ["ig", "sw", "yo", "id"],
  am: ["am", "ar", "sw"],
  om: ["sw", "so", "id"],
  so: ["so", "sw", "ar"],
  zu: ["zu", "sw", "id"],
  xh: ["zu", "sw", "id"],
  rw: ["sw", "fr", "id"],
  sn: ["sw", "zu", "id"],
  wo: ["fr", "sw", "id"],
  lg: ["sw", "id", "en"],
  fa: ["fa", "ar", "ur"],
  he: ["iw", "he", "ar"],
  pa: ["pa", "hi", "ur"],
}

const DEGREE_WORD_BY_LANG: Record<string, string> = {
  en: " degrees",
  ak: " ",
  ee: " ",
  gaa: " ",
  ha: " digiri",
  yo: " ìwọ̀n",
  ig: " digrii",
  sw: " nyuzi",
  es: " grados",
  pt: " graus",
  fr: " degrés",
  de: " Grad",
  it: " gradi",
  nl: " graden",
  pl: " stopni",
  uk: " градусів",
  ru: " градусов",
  tr: " derece",
  ar: " درجة",
  hi: " डिग्री",
  zh: "度",
  ja: "度",
  ko: "도",
}

/**
 * Reshapes written text into crystal-clear spoken phonetics for each language:
 * - Converts Asante Twi digraphs (ky -> ch, gy -> j, tw -> chw, dw -> j, hw -> shw, hy -> sh, ɛ -> e, ɔ -> o)
 * - Converts Ewe & Ga orthography (ɖ -> d, ƒ -> f, ʋ -> v, ŋ -> ng, ts -> ch, jw -> j)
 * - Expands symbols (° -> spoken degree word, — / · / • -> natural comma pause)
 */
function reshapeForAuthenticSpokenPronunciation(rawText: string, lang: string, isFallbackVoice: boolean): string {
  const degReplacement = DEGREE_WORD_BY_LANG[lang] ?? " "
  let text = rawText
    // Replace degree symbols with natural spoken words
    .replace(/(\d+)\s*°/g, `$1${degReplacement}`)
    // Replace bullets, middots, em-dashes, and colons with natural comma pauses so TTS never reads punctuation names
    .replace(/\s*[—–·•|✓✕🔊⏸]\s*/g, ", ")
    .replace(/ConnectLn/gi, "Connect-Line")
    .replace(/\s+/g, " ")
    .trim()

  if (lang === "ak") {
    // Authentic Ghanaian Asante Twi spoken phonology
    text = text
      .replace(/nhwehwɛmu/gi, "nshwe-shwe-mu")
      .replace(/hwehwɛ/gi, "shwe-shwe")
      .replace(/nhyehyɛeɛ/gi, "nshe-she-eh")
      .replace(/kyerɛkyerɛfoɔ/gi, "chere-chere-fo-o")
      .replace(/nkyerɛaseɛ/gi, "nchere-ase-eh")
      .replace(/kyerɛkyerɛ/gi, "chere-chere")
      .replace(/kyerɛ/gi, "chere")
      .replace(/adwumayɛfoɔ/gi, "ajuma-yefo-o")
      .replace(/duadwuma/gi, "dua-juma")
      .replace(/nsaanodwuma/gi, "nsaano-juma")
      .replace(/adwinnadeɛ/gi, "ajwin-nade-eh")
      .replace(/nnwinnadeɛ/gi, "nnwin-nade-eh")
      .replace(/adwuma/gi, "ajuma")
      .replace(/dwuma/gi, "juma")
      .replace(/agyiraehyɛ/gi, "ajira-eshe")
      .replace(/agyiraeɛ/gi, "ajira-eh")
      .replace(/gyina/gi, "jina")
      .replace(/ntwea/gi, "nchwe-a")
      .replace(/atwa/gi, "achwa")
      .replace(/watwa/gi, "wachwa")
      .replace(/twa/gi, "chwa")
      .replace(/hwɛ/gi, "shwe")
      .replace(/ahwɛ/gi, "ashwe")
      .replace(/hyɛ/gi, "sheh")
      .replace(/ahyɛ/gi, "asheh")
      .replace(/wahyɛ/gi, "washeh")
      .replace(/ɛhyia/gi, "eshia")
      .replace(/hyia/gi, "shia")
      .replace(/mfitiaseɛ/gi, "mfitia-se-eh")
      .replace(/adesuafoɔ/gi, "adesua-fo-o")
      .replace(/sɛnea/gi, "sene-a")
      .replace(/pɛpɛɛpɛ/gi, "pe-pee-pe")
      .replace(/tẽẽ/gi, "tee")
      .replace(/kɔsi/gi, "kosi")
      .replace(/anammɔn/gi, "anam-mon")
      .replace(/ɛ/g, "e")
      .replace(/Ɛ/g, "E")
      .replace(/ɔ/g, "o")
      .replace(/Ɔ/g, "O")
  } else if (lang === "ee") {
    // Authentic Ewe (Eʋegbe) spoken phonology
    text = text
      .replace(/eʋegbe/gi, "eve-gbe")
      .replace(/nusrɔ̃lawo/gi, "nusro-lawo")
      .replace(/nusrɔ̃ƒe/gi, "nusro-fe")
      .replace(/srɔ̃a/gi, "sro-a")
      .replace(/afɔɖeɖe/gi, "afo-dede")
      .replace(/dzesiɖoɖo/gi, "dzesi-dodo")
      .replace(/dzadzraɖo/gi, "dzadzra-do")
      .replace(/gbegɔmeɖeɖe/gi, "gbe-gome-dede")
      .replace(/gbeɖiɖi/gi, "gbe-didi")
      .replace(/pɛpɛpɛ/gi, "pe-pe-pe")
      .replace(/ɖ/g, "d")
      .replace(/Ɖ/g, "D")
      .replace(/ƒ/g, "f")
      .replace(/Ƒ/g, "F")
      .replace(/ʋ/g, "v")
      .replace(/Ʋ/g, "V")
      .replace(/ŋ/g, "ng")
      .replace(/Ŋ/g, "Ng")
      .replace(/ɣ/g, "g")
      .replace(/Ɣ/g, "G")
      .replace(/ɛ/g, "e")
      .replace(/Ɛ/g, "E")
      .replace(/ɔ/g, "o")
      .replace(/Ɔ/g, "O")
      .replace(/ã/g, "a")
      .replace(/ẽ/g, "e")
      .replace(/ĩ/g, "i")
      .replace(/õ/g, "o")
      .replace(/ũ/g, "u")
  } else if (lang === "gaa") {
    // Authentic Ga (Gã) spoken phonology
    text = text
      .replace(/shishitsɔɔmɔ/gi, "shishi-choomo")
      .replace(/tsɔɔlɔ/gi, "choolo")
      .replace(/tsɔɔ/gi, "choo")
      .replace(/tsei/gi, "chei")
      .replace(/tso/gi, "cho")
      .replace(/jogbaŋŋ/gi, "jo-gbang")
      .replace(/gbɛfaŋ/gi, "gbe-fang")
      .replace(/kpɛŋŋ/gi, "kpeng")
      .replace(/koŋi/gi, "kong-i")
      .replace(/shĩa/gi, "shia")
      .replace(/jw/gi, "j")
      .replace(/ŋ/g, "ng")
      .replace(/Ŋ/g, "Ng")
      .replace(/ɛ/g, "e")
      .replace(/Ɛ/g, "E")
      .replace(/ɔ/g, "o")
      .replace(/Ɔ/g, "O")
      .replace(/ã/g, "a")
  } else if (isFallbackVoice) {
    text = text
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

  return text
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
    const textForVoice = reshapeForAuthenticSpokenPronunciation(rawText, rawLang, i > 0)

    const endpoints = [
      `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textForVoice)}&tl=${encodeURIComponent(tl)}&total=1&idx=0&textlen=${textForVoice.length}&client=tw-ob&ttsspeed=0.9`,
      `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textForVoice)}&tl=${encodeURIComponent(tl)}&client=gtx&ttsspeed=0.9`,
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
