import { NextRequest, NextResponse } from "next/server"

const TTS_LANG_MAP: Record<string, string> = {
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
  pt: "pt-BR",
  zh: "zh-CN",
  ja: "ja",
  ar: "ar",
  hi: "hi",
  sw: "sw",
  ru: "ru",
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawText = (searchParams.get("text") || "").trim().slice(0, 200)
  const rawLang = (searchParams.get("lang") || "en").trim().toLowerCase()
  const tl = TTS_LANG_MAP[rawLang] || rawLang || "en"

  if (!rawText) {
    return new NextResponse("Missing text", { status: 400 })
  }

  const endpoints = [
    `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(rawText)}&tl=${encodeURIComponent(tl)}&total=1&idx=0&textlen=${rawText.length}&client=tw-ob`,
    `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(rawText)}&tl=${encodeURIComponent(tl)}&client=gtx`,
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
      // Try next endpoint
    }
  }

  return new NextResponse("TTS unavailable", { status: 502 })
}
