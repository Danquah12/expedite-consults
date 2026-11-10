import { NextRequest, NextResponse } from "next/server"

async function translateSingleText(text: string, targetLang: string): Promise<string> {
  const trimmed = (text || "").trim()
  if (!trimmed || targetLang === "en") return text

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(
      targetLang
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

    if (!texts.length || targetLang === "en") {
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
