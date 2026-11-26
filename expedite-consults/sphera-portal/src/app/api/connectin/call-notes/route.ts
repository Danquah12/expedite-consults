import { NextResponse } from 'next/server'
import { firebaseKvGetItem, firebaseKvSetItem } from '@/lib/connectin-firebase-kv'

export const dynamic = 'force-dynamic'

const CALL_NOTES_KV_MAP = 'connectln_call_notes_v1'

export interface CallTranscriptEntry {
  id: string
  speaker: string
  text: string
  tsMs: number
}

export interface SavedCallNoteRecord {
  id: string
  callId: string
  roomTitle: string
  participants: string[]
  startedAtIso: string
  savedAtIso: string
  durationSec: number
  summary: string
  decisions: string[]
  actionItems: string[]
  transcript: CallTranscriptEntry[]
  savedBy: string
}

interface CallNotesBucket {
  notes: SavedCallNoteRecord[]
}

function makeCallNotesBucketKey(raw: string): string {
  const cleaned = String(raw || 'default')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, '_')
    .slice(0, 72)
  return `cn_${cleaned || 'default'}`
}

async function getBucket(userKey: string): Promise<CallNotesBucket> {
  const bucket = await firebaseKvGetItem<CallNotesBucket>(
    CALL_NOTES_KV_MAP,
    makeCallNotesBucketKey(userKey)
  ).catch(() => null)
  return {
    notes: Array.isArray(bucket?.notes) ? bucket.notes : [],
  }
}

async function saveBucket(userKey: string, bucket: CallNotesBucket): Promise<void> {
  await firebaseKvSetItem(CALL_NOTES_KV_MAP, makeCallNotesBucketKey(userKey), bucket)
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userKey = (url.searchParams.get('userKey') || 'default').trim()
    const callId = (url.searchParams.get('callId') || '').trim()

    const bucket = await getBucket(userKey)
    let notes = [...bucket.notes].sort((a, b) =>
      String(b.savedAtIso || '').localeCompare(String(a.savedAtIso || ''))
    )
    if (callId) {
      notes = notes.filter((n) => n.callId === callId || n.id === callId)
    }

    return NextResponse.json({
      ok: true,
      notes,
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Failed to read call notes' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const action = String(body?.action || '').trim().toLowerCase()
    const userKey = String(body?.userKey || body?.savedBy || 'default').trim() || 'default'
    const bucket = await getBucket(userKey)

    if (action === 'delete') {
      const noteId = String(body?.noteId || body?.id || '').trim()
      const callIdFilter = String(body?.callId || '').trim()
      if (!noteId && !callIdFilter) {
        return NextResponse.json(
          { ok: false, error: 'noteId or callId is required to delete a note.' },
          { status: 400 }
        )
      }
      const nextNotes = bucket.notes.filter(
        (n) =>
          (noteId ? n.id !== noteId : true) &&
          (callIdFilter ? n.callId !== callIdFilter : true)
      )
      await saveBucket(userKey, { notes: nextNotes })
      return NextResponse.json({
        ok: true,
        deleted: bucket.notes.length - nextNotes.length,
        total: nextNotes.length,
      })
    }

    const callId = String(body?.callId || '').trim()
    if (!callId) {
      return NextResponse.json(
        { ok: false, error: 'callId is required.' },
        { status: 400 }
      )
    }

    const nowIso = new Date().toISOString()
    const existing = bucket.notes.find((n) => n.callId === callId)

    const cleanTranscript: CallTranscriptEntry[] = Array.isArray(body?.transcript)
      ? body.transcript
          .slice(-250)
          .map((item: any, idx: number) => ({
            id: String(item?.id || `tr_${idx}_${Date.now()}`),
            speaker: String(item?.speaker || 'Participant').slice(0, 80),
            text: String(item?.text || '').trim().slice(0, 1200),
            tsMs: Number(item?.tsMs) || Date.now(),
          }))
          .filter((item: CallTranscriptEntry) => Boolean(item.text))
      : []

    const cleanParticipants: string[] = Array.isArray(body?.participants)
      ? body.participants
          .map((p: any) => String(p || '').trim().slice(0, 80))
          .filter(Boolean)
          .slice(0, 32)
      : []

    const cleanDecisions: string[] = Array.isArray(body?.decisions)
      ? body.decisions
          .map((d: any) => String(d || '').trim().slice(0, 240))
          .filter(Boolean)
          .slice(0, 20)
      : []

    const cleanActionItems: string[] = Array.isArray(body?.actionItems)
      ? body.actionItems
          .map((a: any) => String(a || '').trim().slice(0, 240))
          .filter(Boolean)
          .slice(0, 25)
      : []

    const noteRecord: SavedCallNoteRecord = {
      id: existing?.id || String(body?.id || `cn_${callId.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 48)}`),
      callId,
      roomTitle: String(body?.roomTitle || 'ConnectLn Call').trim().slice(0, 140),
      participants: cleanParticipants,
      startedAtIso: String(body?.startedAtIso || existing?.startedAtIso || nowIso),
      savedAtIso: nowIso,
      durationSec: Math.max(0, Math.round(Number(body?.durationSec) || 0)),
      summary: String(body?.summary || '').trim().slice(0, 2400),
      decisions: cleanDecisions,
      actionItems: cleanActionItems,
      transcript: cleanTranscript,
      savedBy: String(body?.savedBy || userKey).trim().slice(0, 80),
    }

    const nextNotes = [
      noteRecord,
      ...bucket.notes.filter((n) => n.callId !== callId && n.id !== noteRecord.id),
    ]
      .sort((a, b) => String(b.savedAtIso || '').localeCompare(String(a.savedAtIso || '')))
      .slice(0, 50)

    await saveBucket(userKey, { notes: nextNotes })

    return NextResponse.json({
      ok: true,
      note: noteRecord,
      total: nextNotes.length,
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Failed to save call notes' },
      { status: 500 }
    )
  }
}
