import { NextRequest, NextResponse } from "next/server"
import { parseResumeRawText } from "@/lib/resume-parser"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || ""

    let textContent = ""

    if (contentType.includes("application/json")) {
      const body = await req.json()
      textContent = body.text || ""
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      const file = formData.get("file") as File | null
      const rawText = formData.get("text") as string | null

      if (rawText) {
        textContent = rawText
      } else if (file) {
        textContent = await file.text()
      }
    }

    if (!textContent || textContent.trim().length === 0) {
      return NextResponse.json(
        { error: "No resume text or file provided" },
        { status: 400 }
      )
    }

    const parsed = parseResumeRawText(textContent)

    return NextResponse.json({
      success: true,
      data: parsed
    })
  } catch (error: any) {
    console.error("Resume parse API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to parse resume" },
      { status: 500 }
    )
  }
}
