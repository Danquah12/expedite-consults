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
    return translated ? translated.trim() : text
  } catch {
    return text
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

    // Batch with separator first for speed, fallback to individual if count mismatches
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
