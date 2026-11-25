import { NextRequest, NextResponse } from "next/server"

const TRANSLATE_TARGET_MAP: Record<string, string> = {
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
  he: "iw",
  zh: "zh-CN",
}

/**
 * Fixes literal/awkward machine-translation artifacts and leftover English jargon
 * so African language subtitles and speech sound natural to native speakers.
 */
function polishAfricanTranslation(text: string, targetLang: string): string {
  if (!text) return text
  if (targetLang === "ak") {
    return text
      .replace(/^Hey\s+obiara\b[,!]*/i, "Me ma mo akwaaba,")
      .replace(/\bHey\s+obiara\b/gi, "akwaaba")
      .replace(/\bspeed\s*square\b/gi, "susudua ahinanan")
      .replace(/\bdimensional\s*lumber\b/gi, "nnua a wɔasusuw")
      .replace(/\blumber\b/gi, "dua")
      .replace(/\bangles?\b/gi, "ntwea")
      .replace(/\ba awu\b/gi, "")
      .replace(/\bsotɔɔ no mu\b/gi, "adwumayɛbea ha")
      .replace(/\bworkshop\b/gi, "adwumayɛbea")
      .replace(/\bmiter\b/gi, "ntwea nkyekyɛmu")
      .replace(/\bcrosscut\b/gi, "dua twa")
      .replace(/\s+/g, " ")
      .replace(/\s+([.,!?])/g, "$1")
      .trim()
  }
  return text
}

async function translateSingleText(text: string, targetLang: string): Promise<string> {
  const trimmed = (text || "").trim()
  if (!trimmed) return text

  const tl = TRANSLATE_TARGET_MAP[targetLang] || targetLang

  try {
    // Use sl=auto so any source language (English or previously translated DOM text) translates cleanly to targetLang (including "en"!)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
      tl
    )}&dt=t&q=${encodeURIComponent(trimmed)}`
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    })
    if (!res.ok) return text
    const data = await res.json()
    const translated = Array.isArray(data?.[0])
      ? data[0].map((seg: any) => seg?.[0] || "").join("")
      : ""
    return translated ? polishAfricanTranslation(translated.trim(), targetLang) : text
  } catch {
    return text
  }
}

const GEMINI_IDIOMATIC_LANG_LABELS: Record<string, string> = {
  ak: "Asante Twi (Ghanaian Akan, natural Kumasi/Accra spoken style using clean Twi orthography ɛ and ɔ)",
  ee: "Eʋegbe (Ghana/Togo Ewe, natural spoken style using ɛ, ɔ, ɖ, ƒ, ŋ, ʋ)",
  gaa: "Gã (Accra, Ghana spoken style using ɛ, ɔ, ŋ)",
  yo: "Yorùbá (natural Nigerian spoken style with proper tonal diacritics)",
  ig: "Igbo (natural Nigerian spoken style)",
  ha: "Hausa (natural Northern Nigerian/West African spoken style)",
  om: "Afaan Oromoo (natural Ethiopian spoken style)",
  rw: "Ikinyarwanda (natural Rwandan spoken style)",
  sn: "chiShona (natural Zimbabwean spoken style)",
  xh: "isiXhosa (natural South African spoken style)",
  wo: "Wolof (natural Senegalese spoken style)",
  lg: "Oluganda (natural Ugandan spoken style)",
  sw: "Kiswahili (natural East African spoken style)",
  zu: "isiZulu (natural South African spoken style)",
  am: "Amharic (natural Ethiopian spoken style in Ge'ez script)",
  so: "Af-Soomaali (natural Somali spoken style)",
  pa: "Punjabi (natural spoken Gurmukhi Punjabi)",
}

async function translateBatchWithGemini(texts: string[], targetLang: string): Promise<string[] | null> {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim()
  const langDesc = GEMINI_IDIOMATIC_LANG_LABELS[targetLang]
  if (!apiKey || !langDesc || texts.length === 0) return null

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const prompt =
      `Translate each string in the JSON array below into natural, idiomatic, everyday spoken ${langDesc}.\n` +
      `Rules:\n` +
      `- Translate every concept naturally for native listeners (never leave untranslated English words like "speed square", "lumber", "angles", or "hey" unless it is a proper brand/person name like Noctis).\n` +
      `- Write numbers as spoken words when appropriate and keep sentences concise and clear for speech.\n` +
      `- Return strictly a JSON array of strings with the EXACT same length (${texts.length}) and order.`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${prompt}\n\n${JSON.stringify(texts)}` }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
        signal: controller.signal,
      }
    )
    clearTimeout(timer)
    if (!res.ok) return null
    const data = await res.json()
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!rawText) return null
    const parsed = JSON.parse(rawText)
    if (!Array.isArray(parsed) || parsed.length !== texts.length) return null
    return parsed.map((item, idx) => {
      const s = typeof item === "string" ? item.trim() : ""
      return s ? polishAfricanTranslation(s, targetLang) : texts[idx]
    })
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const texts: string[] = Array.isArray(body?.texts) ? body.texts.slice(0, 40) : []
    const targetLang = String(body?.targetLang || "en").trim()

    if (!texts.length) {
      return NextResponse.json({ translations: texts })
    }

    // 1. Prefer Gemini 2.5 Flash idiomatic native translation when GEMINI_API_KEY is configured
    const geminiTranslations = await translateBatchWithGemini(texts, targetLang)
    if (geminiTranslations) {
      return NextResponse.json({ translations: geminiTranslations })
    }

    // 2. Fallback: batch with separator first for speed, fallback to individual if count mismatches
    const joined = texts.join("\n ||| \n")
    const batchResult = await translateSingleText(joined, targetLang)
    const splitParts = batchResult.split(/\s*\|\|\|\s*/)

    if (splitParts.length === texts.length) {
      return NextResponse.json({
        translations: splitParts.map((p, idx) => p.trim() || texts[idx]),
      })
    }

    const individual = await Promise.all(texts.map((t) => translateSingleText(t, targetLang)))
    return NextResponse.json({ translations: individual })
  } catch {
    return NextResponse.json({ translations: [] }, { status: 500 })
  }
}
