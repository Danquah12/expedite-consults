import { NextRequest, NextResponse } from "next/server"
import { firebaseKvGetItem, firebaseKvSetItem } from "@/lib/connectin-firebase-kv"

const NETWORK_PREFS_MAP = "connectln_network_prefs_v1"

export interface NetworkPrefsCloudState {
  followedCompanyIds: string[] | null
  followedOrgIds: string[] | null
  joinedCircleIds: string[] | null
  followedTopicIds: string[] | null
  endorsedSkillsByConn: Record<string, string[]>
  celebratedEventIds: string[]
  removedConnectionNames: string[]
  updatedAtMs: number
}

function defaultPrefs(): NetworkPrefsCloudState {
  return {
    followedCompanyIds: null,
    followedOrgIds: null,
    joinedCircleIds: null,
    followedTopicIds: null,
    endorsedSkillsByConn: {},
    celebratedEventIds: [],
    removedConnectionNames: [],
    updatedAtMs: 0,
  }
}

function sanitizeUserKey(raw?: string | null): string {
  const clean = String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80)
  return clean ? `np_${clean}` : "np_guest"
}

function dedupStrList(arr: unknown): string[] {
  if (!Array.isArray(arr)) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of arr) {
    const val = String(item || "").trim()
    if (!val || seen.has(val)) continue
    seen.add(val)
    out.push(val.slice(0, 140))
  }
  return out
}

function sanitizeEndorseMap(raw: unknown): Record<string, string[]> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const out: Record<string, string[]> = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const cleanKey = String(k || "").trim().slice(0, 120)
    if (!cleanKey) continue
    const list = dedupStrList(v)
    if (list.length > 0) {
      out[cleanKey] = list
    }
  }
  return out
}

function normalizePrefs(raw?: Partial<NetworkPrefsCloudState> | null): NetworkPrefsCloudState {
  const base = defaultPrefs()
  if (!raw || typeof raw !== "object") return base
  return {
    followedCompanyIds: Array.isArray(raw.followedCompanyIds) ? dedupStrList(raw.followedCompanyIds) : null,
    followedOrgIds: Array.isArray(raw.followedOrgIds) ? dedupStrList(raw.followedOrgIds) : null,
    joinedCircleIds: Array.isArray(raw.joinedCircleIds) ? dedupStrList(raw.joinedCircleIds) : null,
    followedTopicIds: Array.isArray(raw.followedTopicIds) ? dedupStrList(raw.followedTopicIds) : null,
    endorsedSkillsByConn: sanitizeEndorseMap(raw.endorsedSkillsByConn),
    celebratedEventIds: dedupStrList(raw.celebratedEventIds),
    removedConnectionNames: dedupStrList(raw.removedConnectionNames),
    updatedAtMs: typeof raw.updatedAtMs === "number" ? raw.updatedAtMs : 0,
  }
}

export async function GET(req: NextRequest) {
  try {
    const userKey = sanitizeUserKey(req.nextUrl.searchParams.get("userKey"))
    const stored = await firebaseKvGetItem<NetworkPrefsCloudState>(NETWORK_PREFS_MAP, userKey)
    const prefs = normalizePrefs(stored)
    return NextResponse.json({ ok: true, prefs })
  } catch (err) {
    console.error("[network-state GET] Error:", err)
    return NextResponse.json({ ok: false, prefs: defaultPrefs(), error: "Failed to read network state" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const userKey = sanitizeUserKey(body?.userKey)
    const patch = body?.patch && typeof body.patch === "object" ? body.patch : {}

    const existing = normalizePrefs(await firebaseKvGetItem<NetworkPrefsCloudState>(NETWORK_PREFS_MAP, userKey))
    const next: NetworkPrefsCloudState = {
      followedCompanyIds:
        patch.followedCompanyIds !== undefined
          ? Array.isArray(patch.followedCompanyIds)
            ? dedupStrList(patch.followedCompanyIds)
            : null
          : existing.followedCompanyIds,
      followedOrgIds:
        patch.followedOrgIds !== undefined
          ? Array.isArray(patch.followedOrgIds)
            ? dedupStrList(patch.followedOrgIds)
            : null
          : existing.followedOrgIds,
      joinedCircleIds:
        patch.joinedCircleIds !== undefined
          ? Array.isArray(patch.joinedCircleIds)
            ? dedupStrList(patch.joinedCircleIds)
            : null
          : existing.joinedCircleIds,
      followedTopicIds:
        patch.followedTopicIds !== undefined
          ? Array.isArray(patch.followedTopicIds)
            ? dedupStrList(patch.followedTopicIds)
            : null
          : existing.followedTopicIds,
      endorsedSkillsByConn:
        patch.endorsedSkillsByConn !== undefined
          ? sanitizeEndorseMap(patch.endorsedSkillsByConn)
          : existing.endorsedSkillsByConn,
      celebratedEventIds:
        patch.celebratedEventIds !== undefined ? dedupStrList(patch.celebratedEventIds) : existing.celebratedEventIds,
      removedConnectionNames:
        patch.removedConnectionNames !== undefined
          ? dedupStrList(patch.removedConnectionNames)
          : existing.removedConnectionNames,
      updatedAtMs: Date.now(),
    }

    await firebaseKvSetItem(NETWORK_PREFS_MAP, userKey, next)
    return NextResponse.json({ ok: true, prefs: next })
  } catch (err) {
    console.error("[network-state POST] Error:", err)
    return NextResponse.json({ ok: false, error: "Failed to persist network state" }, { status: 500 })
  }
}
