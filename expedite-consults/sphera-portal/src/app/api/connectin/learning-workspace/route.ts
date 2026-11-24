import { NextRequest, NextResponse } from "next/server"
import {
  addLessonNote,
  addLessonQa,
  addLessonQaReply,
  addLessonRegionalTip,
  CredentialTier,
  deleteLessonNote,
  getLessonWorkspace,
  issueLessonCredential,
  publishLessonProofOfWork,
  recordLessonMentorRequest,
  RegionalTipCode,
  toggleProofOfWorkVouch,
} from "@/lib/connectln-learning-workspace-db"
import { upsertConnectLnSharedPost } from "@/lib/connectln-mongodb"
import { buildLessonChecklist } from "@/lib/connectln-learning-tools"
import type { SkilledTradesCategory } from "@/lib/skilled-trades-learn-by-doing-data"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const runtime = "nodejs"
export const maxDuration = 25

const NOCTIS_API_URL = process.env.NOCTIS_API_URL || "https://dstrike.app/api/noctis"

function sanitizeCoachOutput(rawText: string, lessonTitle: string, category: string): string | null {
  if (!rawText || !rawText.trim()) return null

  const mismatchPatterns = [
    /NOCTIS-ARCH-001/i,
    /4-Bedroom,\s*3\.5-Bath/i,
    /Transitional Colonial/i,
    /IfcOpenShell/i,
    /FreeCAD/i,
    /GS\s*1207:2018/i,
    /```noctis-dashboard/i,
    /buildingSMART\s+IFC/i,
  ]
  for (const pat of mismatchPatterns) {
    if (pat.test(rawText)) return null
  }

  const cleaned = rawText
    .replace(/\r\n/g, "\n")
    .replace(/https?:\/\/(?:www\.)?dstrike\.app\/noctis/gi, "ConnectLn Trade Coach")
    .trim()

  if (cleaned.length < 24) return null

  // Require at least mild topical anchor unless question was general
  const lower = cleaned.toLowerCase()
  const tokens = `${lessonTitle} ${category}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4)

  const hasAnchor =
    tokens.length === 0 ||
    tokens.some((tok) => lower.includes(tok)) ||
    /\b(safety|ppe|tool|measure|check|inspect|test|step|code|practice)\b/i.test(cleaned)

  return hasAnchor ? cleaned : null
}

function buildStructuredCoachFallback(params: {
  lessonTitle: string
  category: SkilledTradesCategory
  question: string
  description?: string
  skills?: string[]
  fieldTip?: string
  studyNotes?: string[]
  language?: string
}): string {
  const fakeLesson = {
    id: "coach_ctx",
    lessonNumber: 1,
    videoLabel: "Coach",
    title: params.lessonTitle,
    category: params.category,
    enclaveId: "trades_construction",
    professionId: "general",
    level: "Beginner" as const,
    originalCreator: "ConnectLn",
    creatorDomain: "conectln.com",
    description: params.description || "",
    skillsCovered: params.skills || [],
    sourceVideoUrl: "",
    referenceArticleUrl: "",
    embedAvailable: true,
    duration: "",
    thumbnailUrl: "",
    practiceActivity: "",
    practiceDeliverablePrompt: "",
    knowledgeCheck: { question: "", options: [], correctIndex: 0, explanation: "" },
    detailedStudyNotes: params.studyNotes || [],
    fieldTip: params.fieldTip || "",
  }
  const checklist = buildLessonChecklist(fakeLesson)
  const qLower = params.question.toLowerCase()

  const bullets: string[] = []
  if (/mistake|error|avoid|wrong|fail|problem|troubleshoot/.test(qLower)) {
    bullets.push(
      `Common Pitfalls in ${params.lessonTitle}:`,
      `• Skipping pre-work verification: ${checklist.ppe[0] || "PPE"} and baseline zero/datum checks cause 70% of rework.`,
      `• Rushing Step 1: ${checklist.steps[0] || "Confirm clean alignment and specs before cutting, fastening, or energizing."}`,
      `• Ignoring final inspection: ${params.fieldTip || checklist.steps[checklist.steps.length - 1]}`
    )
  } else if (/tool|material|need|buy|kit|ppe|safety/.test(qLower)) {
    bullets.push(
      `Essential Jobsite Kit for ${params.lessonTitle}:`,
      `• PPE Required: ${checklist.ppe.slice(0, 3).join("; ")}.`,
      `• Core Tools: ${checklist.tools.slice(0, 4).join("; ")}.`,
      `• Key Verification: ${params.fieldTip || checklist.steps[checklist.steps.length - 1]}`
    )
  } else {
    bullets.push(
      `Noctis Trade Coach Guidance (${params.category}):`,
      `• Question Focus: "${params.question.slice(0, 140)}"`,
      `• Key Steps: ${checklist.steps.slice(0, 3).join(" → ")}`,
      params.skills && params.skills.length > 0
        ? `• Core Skills Applied: ${params.skills.slice(0, 4).join(", ")}.`
        : "",
      params.fieldTip ? `• Pro Field Tip: ${params.fieldTip}` : ""
    )
  }

  return bullets.filter(Boolean).join("\n")
}

export async function GET(req: NextRequest) {
  try {
    const lessonId = (req.nextUrl.searchParams.get("lessonId") || "").trim()
    const userKey = (req.nextUrl.searchParams.get("userKey") || "guest").trim()

    if (!lessonId) {
      return NextResponse.json(
        { ok: false, error: "lessonId query parameter is required" },
        { status: 400 }
      )
    }

    const workspace = await getLessonWorkspace(lessonId, userKey)
    return NextResponse.json(
      {
        ok: true,
        workspace,
        mongoConnected: workspace.mongoConnected,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    )
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as any)?.message || "Failed to load classroom workspace" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, any> | null
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 })
    }

    const action = String(body.action || "").trim()
    const lessonId = String(body.lessonId || "").trim()
    const userKey = String(body.userKey || body.authorKey || "guest").trim()

    if (!lessonId) {
      return NextResponse.json({ ok: false, error: "lessonId is required" }, { status: 400 })
    }

    if (action === "add_note") {
      const text = String(body.text || "").trim()
      if (!text) {
        return NextResponse.json({ ok: false, error: "Note text is required" }, { status: 400 })
      }
      const workspace = await addLessonNote(lessonId, userKey, {
        id: String(body.noteId || `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`),
        timeSeconds: Number(body.timeSeconds) || 0,
        text,
        createdAtIso: new Date().toISOString(),
      })
      return NextResponse.json({ ok: true, workspace, mongoConnected: workspace.mongoConnected })
    }

    if (action === "delete_note") {
      const noteId = String(body.noteId || "").trim()
      if (!noteId) {
        return NextResponse.json({ ok: false, error: "noteId is required" }, { status: 400 })
      }
      const workspace = await deleteLessonNote(lessonId, userKey, noteId)
      return NextResponse.json({ ok: true, workspace, mongoConnected: workspace.mongoConnected })
    }

    if (action === "add_qa") {
      const question = String(body.question || "").trim()
      if (!question) {
        return NextResponse.json({ ok: false, error: "Question is required" }, { status: 400 })
      }
      const workspace = await addLessonQa(lessonId, userKey, {
        id: String(body.qaId || `qa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`),
        authorName: String(body.authorName || "ConnectLn Member"),
        authorRole: String(body.authorRole || "Field Practitioner"),
        authorAvatar: String(body.authorAvatar || ""),
        question,
        createdAtIso: new Date().toISOString(),
      })
      return NextResponse.json({ ok: true, workspace, mongoConnected: workspace.mongoConnected })
    }

    if (action === "add_reply") {
      const qaId = String(body.qaId || "").trim()
      const text = String(body.text || "").trim()
      if (!qaId || !text) {
        return NextResponse.json(
          { ok: false, error: "qaId and reply text are required" },
          { status: 400 }
        )
      }
      const workspace = await addLessonQaReply(lessonId, userKey, qaId, {
        id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        authorName: String(body.authorName || "ConnectLn Member"),
        authorRole: String(body.authorRole || "Peer Pro"),
        authorAvatar: String(body.authorAvatar || ""),
        text,
        createdAtIso: new Date().toISOString(),
      })
      return NextResponse.json({ ok: true, workspace, mongoConnected: workspace.mongoConnected })
    }

    if (action === "add_regional_tip") {
      const title = String(body.title || "").trim()
      const detail = String(body.detail || "").trim()
      if (!title || !detail) {
        return NextResponse.json(
          { ok: false, error: "Regional tip title and detail are required" },
          { status: 400 }
        )
      }
      const workspace = await addLessonRegionalTip(lessonId, userKey, {
        id: `rtip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        region: (body.region as RegionalTipCode) || "Global Metric",
        title,
        detail,
        authorName: String(body.authorName || "ConnectLn Member"),
        createdAtIso: new Date().toISOString(),
      })
      return NextResponse.json({ ok: true, workspace, mongoConnected: workspace.mongoConnected })
    }

    if (action === "publish_proof") {
      const notes = String(body.notes || "").trim()
      const photoDataUrl = typeof body.photoDataUrl === "string" ? body.photoDataUrl : undefined
      if (!notes && !photoDataUrl) {
        return NextResponse.json(
          { ok: false, error: "Practice notes or a photo are required to publish Proof-of-Work" },
          { status: 400 }
        )
      }

      let feedPostId: string | undefined
      const authorName = String(body.authorName || "ConnectLn Member").trim()
      const lessonTitle = String(body.lessonTitle || "Hands-On Trade Lesson").trim()
      const category = String(body.category || "Skilled Trades").trim()

      if (body.alsoPublishToFeed === true) {
        const nowMs = Date.now()
        feedPostId = `pow_post_${nowMs}_${Math.random().toString(36).slice(2, 6)}`
        const postContent =
          `🛠️ Proof-of-Work Completed: "${lessonTitle}" (${category})\n\n` +
          (notes ? `${notes}\n\n` : "") +
          `#ProofOfWork #ConnectLnLearning #${category.replace(/[^a-zA-Z0-9]/g, "")}`

        await upsertConnectLnSharedPost({
          id: feedPostId,
          createdAtMs: nowMs,
          feedCategory: "for_you",
          feedSubCategory: "Learn By Doing",
          content: postContent,
          hashtags: ["ProofOfWork", "ConnectLnLearning", category.replace(/\s+/g, "")],
          author: {
            id: String(body.authorId || `USR-${nowMs}`),
            name: authorName,
            headline: String(body.authorHeadline || `${category} Practitioner`),
            avatar: String(body.authorAvatar || ""),
            email: userKey.includes("@") ? userKey : undefined,
          },
          ...(photoDataUrl && photoDataUrl.startsWith("data:image/") && photoDataUrl.length <= 240_000
            ? {
                media: {
                  type: "image",
                  url: photoDataUrl,
                  title: `Proof-of-Work: ${lessonTitle}`,
                },
              }
            : {}),
        }).catch(() => {})
      }

      const workspace = await publishLessonProofOfWork(lessonId, userKey, {
        id: `pow_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        authorName,
        authorHeadline: String(body.authorHeadline || `${category} Practitioner`),
        authorAvatar: String(body.authorAvatar || ""),
        notes: notes || `Completed hands-on practice deliverable for ${lessonTitle}.`,
        photoDataUrl,
        lessonTitle,
        category,
        feedPostId,
        createdAtIso: new Date().toISOString(),
      })

      return NextResponse.json({
        ok: true,
        feedPostId,
        workspace,
        mongoConnected: workspace.mongoConnected,
      })
    }

    if (action === "vouch_proof") {
      const proofId = String(body.proofId || "").trim()
      if (!proofId) {
        return NextResponse.json({ ok: false, error: "proofId is required" }, { status: 400 })
      }
      const workspace = await toggleProofOfWorkVouch(lessonId, proofId, userKey)
      return NextResponse.json({ ok: true, workspace, mongoConnected: workspace.mongoConnected })
    }

    if (action === "issue_credential") {
      const workspace = await issueLessonCredential(lessonId, {
        id: String(body.credentialId || `cred_${lessonId}_${Date.now()}`),
        rawUserKey: userKey,
        holderName: String(body.holderName || "ConnectLn Member"),
        lessonId,
        lessonTitle: String(body.lessonTitle || "Hands-On Trade Lesson"),
        category: String(body.category || "Skilled Trades"),
        tier: (body.tier as CredentialTier) || "Practitioner",
        vouchCount: Number(body.vouchCount) || 0,
        issuedAtIso: new Date().toISOString(),
      })
      return NextResponse.json({ ok: true, workspace, mongoConnected: workspace.mongoConnected })
    }

    if (action === "request_mentor") {
      const question = String(body.question || "").trim()
      const workspace = await recordLessonMentorRequest(lessonId, userKey, {
        id: `mreq_${Date.now()}`,
        requesterName: String(body.requesterName || "ConnectLn Member"),
        channel: body.channel === "video" || body.channel === "audio" ? body.channel : "message",
        question: question || "Requested Verified Pro technique review",
        category: String(body.category || "Skilled Trades"),
        createdAtIso: new Date().toISOString(),
      })
      return NextResponse.json({ ok: true, workspace, mongoConnected: workspace.mongoConnected })
    }

    if (action === "ask_coach") {
      const question = String(body.question || "").trim()
      const lessonTitle = String(body.lessonTitle || "Hands-On Lesson").trim()
      const category = (String(body.category || "Carpentry").trim() ||
        "Carpentry") as SkilledTradesCategory
      const language = String(body.language || "English").trim()
      const description = String(body.description || "").trim()
      const fieldTip = String(body.fieldTip || "").trim()
      const skills = Array.isArray(body.skills) ? body.skills.map(String) : []
      const studyNotes = Array.isArray(body.studyNotes) ? body.studyNotes.map(String) : []
      const history = Array.isArray(body.history) ? body.history.slice(-6) : []

      if (!question) {
        return NextResponse.json({ ok: false, error: "Question is required" }, { status: 400 })
      }

      const fallbackReply = buildStructuredCoachFallback({
        lessonTitle,
        category,
        question,
        description,
        skills,
        fieldTip,
        studyNotes,
        language,
      })

      const systemContext =
        `You are Noctis Trade Coach inside ConnectLn Classroom (stay strictly inside ConnectLn; NEVER link externally to dstrike.app/noctis).\n` +
        `Active Lesson: "${lessonTitle}" | Trade Category: "${category}"\n` +
        (description ? `Summary: ${description}\n` : "") +
        (skills.length > 0 ? `Key Skills: ${skills.join(", ")}\n` : "") +
        (studyNotes.length > 0 ? `Study Notes: ${studyNotes.join(" | ")}\n` : "") +
        (fieldTip ? `Field Tip: ${fieldTip}\n` : "") +
        `Respond in ${language}. Give practical, jobsite-accurate, safety-first guidance (PPE, measurements, common mistakes, inspection checks) in under 140 words using concise bullet points.`

      const turns = [
        ...history
          .filter(
            (t: any) =>
              t &&
              (t.role === "user" || t.role === "assistant") &&
              typeof t.content === "string"
          )
          .map((t: any) => ({ role: t.role, content: t.content.slice(0, 600) })),
        {
          role: "user",
          content: `${systemContext}\n\nStudent Question: ${question}`,
        },
      ]

      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 8500)
      try {
        const res = await fetch(NOCTIS_API_URL, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(process.env.NOCTIS_API_KEY
              ? { "x-noctis-key": process.env.NOCTIS_API_KEY }
              : {}),
          },
          body: JSON.stringify({
            turns,
            language,
            context: "ConnectLn-Classroom-Trade-Coach",
          }),
          signal: ctrl.signal,
          cache: "no-store",
        })

        if (res.ok) {
          const data = (await res.json()) as { text?: string }
          const valid = sanitizeCoachOutput(data?.text || "", lessonTitle, category)
          if (valid) {
            return NextResponse.json(
              { ok: true, answer: valid, source: "noctis-live-coach" },
              { headers: { "Cache-Control": "no-store" } }
            )
          }
        }
      } catch {
        // Fallback below handles offline/timeout cleanly
      } finally {
        clearTimeout(timer)
      }

      return NextResponse.json(
        { ok: true, answer: fallbackReply, source: "connectln-structured-coach" },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    return NextResponse.json(
      { ok: false, error: `Unsupported workspace action: ${action}` },
      { status: 400 }
    )
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as any)?.message || "Classroom workspace error" },
      { status: 500 }
    )
  }
}
