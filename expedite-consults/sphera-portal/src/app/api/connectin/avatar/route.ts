import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"
import { pullCloudUsersIntoDb } from "@/lib/connectin-cloud-sync"
import { firebaseKvGetItem, firebaseKvListItems } from "@/lib/connectin-firebase-kv"
import { lookupWhatsAppRecipient } from "@/lib/connectin-whatsapp-directory"
import {
  isPlaceholderCallAvatar,
  isSelfAvatarEndpoint,
  pickRealCallAvatar,
} from "@/lib/connectin-avatar-signal"

export const dynamic = "force-dynamic"

const CALLS_SYNC_MAP_NAME = "vibe_active_calls_map_v1"

function normalizeDigits(phone?: string | null): string {
  return String(phone || "").replace(/\D/g, "")
}

function samePhoneLoose(a?: string | null, b?: string | null): boolean {
  const da = normalizeDigits(a)
  const db = normalizeDigits(b)
  if (!da || !db) return false
  if (da === db) return true
  if (da.length >= 7 && db.length >= 7) {
    return da.slice(-7) === db.slice(-7)
  }
  return false
}

async function resolveFromActiveCallKv(params: {
  callId: string
  userId?: string
  phone?: string
  name?: string
}): Promise<string | undefined> {
  const { callId, userId, phone, name } = params
  const cleanRosterCallId = callId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 48)
  const cleanPartCallId = callId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 36)
  const directKeys = Array.from(new Set([`r__${cleanRosterCallId}`, `r__${callId}`]))

  for (const rKey of directKeys) {
    try {
      const roster = await firebaseKvGetItem<any>(CALLS_SYNC_MAP_NAME, rKey)
      const fromRoster = pickRealCallAvatar(roster?.initiator_avatar)
      if (fromRoster && !userId) {
        return fromRoster
      }
    } catch {
      // Ignore transient KV errors
    }
  }

  try {
    const items = await firebaseKvListItems<any>(CALLS_SYNC_MAP_NAME, true)
    const callItems = items.filter((item) => {
      const d = item?.data
      if (!d) return false
      const key = String(item.key || "")
      return (
        d.call_id === callId ||
        key.includes(`__${cleanPartCallId}__`) ||
        key.endsWith(`__${cleanPartCallId}`) ||
        key === `r__${cleanRosterCallId}`
      )
    })

    if (userId) {
      for (const item of callItems) {
        const d = item.data
        if (d?.user_id === userId) {
          const hit = pickRealCallAvatar(d?.avatar, !d?.is_answering_recipient ? d?.initiator_avatar : undefined)
          if (hit) return hit
        }
      }
    }

    if (phone || name) {
      const lowerName = (name || "").trim().toLowerCase()
      for (const item of callItems) {
        const d = item.data
        const phoneMatch = phone && (samePhoneLoose(d?.phone, phone) || samePhoneLoose(d?.initiator_phone, phone))
        const nameMatch = lowerName && (
          String(d?.display_name || "").trim().toLowerCase() === lowerName ||
          String(d?.initiator_name || "").trim().toLowerCase() === lowerName
        )
        if (phoneMatch || nameMatch) {
          const hit = pickRealCallAvatar(
            phoneMatch && samePhoneLoose(d?.phone, phone) ? d?.avatar : undefined,
            d?.initiator_avatar,
            !d?.is_answering_recipient ? d?.avatar : undefined
          )
          if (hit) return hit
        }
      }
    }

    // Fallback to call initiator avatar in any participant/roster record of this call
    for (const item of callItems) {
      const d = item.data
      const hit = pickRealCallAvatar(
        d?.initiator_avatar,
        d?.kind !== "roster" && !d?.is_answering_recipient ? d?.avatar : undefined
      )
      if (hit) return hit
    }
  } catch {
    // Ignore KV scan failure and continue to directory/user lookup
  }

  return undefined
}

async function resolveFromDirectoryAndUsers(params: {
  userId?: string
  phone?: string
  email?: string
  name?: string
}): Promise<string | undefined> {
  const { userId, phone, email, name } = params

  if (phone || email || name) {
    try {
      const found = await Promise.race([
        lookupWhatsAppRecipient({
          targetPhone: phone || undefined,
          targetEmail: email || undefined,
          targetName: name || undefined,
        }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
      ])
      const dirAvatar = pickRealCallAvatar(found?.member?.avatar)
      if (dirAvatar) return dirAvatar
    } catch {
      // Continue to ConnectIn user store
    }
  }

  try {
    await Promise.race([
      pullCloudUsersIntoDb().catch(() => {}),
      new Promise<void>((resolve) => setTimeout(resolve, 1500)),
    ])
    const users = connectinDb.getAllUsersWithProfiles()
    const cleanEmail = (email || "").trim().toLowerCase()
    const cleanName = (name || "").trim().toLowerCase()

    const matched = users.find((u) => {
      if (userId && u.id === userId && !isPlaceholderCallAvatar(u.avatar)) return true
      if (cleanEmail && (u.email || "").trim().toLowerCase() === cleanEmail) return true
      if (phone && samePhoneLoose(u.phone, phone)) return true
      if (cleanName && (u.name || "").trim().toLowerCase() === cleanName) return true
      return false
    })

    if (matched) {
      const userAvatar = pickRealCallAvatar(matched.avatar)
      if (userAvatar) return userAvatar
    }
  } catch {
    // Ignore DB fallback errors
  }

  return undefined
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const callId = (sp.get("callId") || sp.get("call_id") || "").trim()
  const userId = (sp.get("userId") || sp.get("user_id") || "").trim()
  const phone = (sp.get("phone") || "").trim()
  const email = (sp.get("email") || "").trim()
  const name = (sp.get("name") || "").trim()

  if (!callId && !userId && !phone && !email && !name) {
    return new NextResponse("Missing lookup parameter", {
      status: 400,
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  }

  let resolved: string | undefined
  if (callId) {
    resolved = await resolveFromActiveCallKv({ callId, userId, phone, name })
  }
  if (!resolved) {
    resolved = await resolveFromDirectoryAndUsers({ userId, phone, email, name })
  }

  if (!resolved) {
    return new NextResponse("Avatar not found", {
      status: 404,
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  }

  if (resolved.startsWith("data:image/")) {
    const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/.exec(resolved)
    if (match) {
      try {
        const mime = match[1]
        const base64Body = match[2].replace(/\s+/g, "")
        const buffer = Buffer.from(base64Body, "base64")
        if (buffer.length > 0) {
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              "Content-Type": mime,
              "Content-Length": String(buffer.length),
              "Cache-Control": "no-store, max-age=0",
            },
          })
        }
      } catch {
        // Fall through to 404 on malformed data URI
      }
    }
    return new NextResponse("Invalid avatar image data", {
      status: 404,
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  }

  if (resolved.startsWith("/") || resolved.startsWith("https://") || resolved.startsWith("http://")) {
    if (isSelfAvatarEndpoint(resolved)) {
      return new NextResponse("Avatar not found", {
        status: 404,
        headers: { "Cache-Control": "no-store, max-age=0" },
      })
    }
    if (resolved.startsWith("/")) {
      const absUrl = new URL(resolved, req.url).toString()
      return NextResponse.redirect(absUrl, {
        status: 302,
        headers: { "Cache-Control": "no-store, max-age=0" },
      })
    }
    return NextResponse.redirect(resolved, {
      status: 302,
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  }

  return new NextResponse("Avatar not found", {
    status: 404,
    headers: { "Cache-Control": "no-store, max-age=0" },
  })
}
