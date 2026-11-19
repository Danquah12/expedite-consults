import { HarvestedMediaItem, dedupeHarvestedItems } from "./connectin-media-harvester"

const VIDEO_ARCHIVE_MAP_NAME = "connectln_video_archive_map_v1"
const DAILY_SCHEDULE_META_KEY = "meta_daily_schedule_v1"
const DAILY_PLATFORM_MAP_NAME = "connectln_daily_platform_map_v1"

export interface DailyVideoScheduleMeta {
  lastDailySyncIso: string
  nextScheduledSyncIso: string
  totalVideosArchived: number
  lastAddedCount: number
  cadenceHours: number
  triggeredBy: string
}

function getTwilioAuthHeader(): string | null {
  const sid = process.env.TWILIO_ACCOUNT_SID || ""
  const token = process.env.TWILIO_AUTH_TOKEN || ""
  if (!sid || !token) return null
  return `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`
}

function makeArchiveItemKey(item: HarvestedMediaItem): string {
  if (item.youtubeId && /^[a-zA-Z0-9_-]{6,16}$/.test(item.youtubeId)) {
    return `vid_yt_${item.youtubeId}`
  }
  const slug = `${item.kind}_${item.title || item.id}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64)
  return `vid_${slug || item.id}`
}

async function ensureVideoArchiveMapExists(auth: string): Promise<void> {
  await fetch("https://sync.twilio.com/v1/Services/default/Maps", {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ UniqueName: VIDEO_ARCHIVE_MAP_NAME }).toString(),
  }).catch(() => {})
}

async function upsertRawMapItem(auth: string, key: string, dataObj: unknown): Promise<boolean> {
  const baseUrl = `https://sync.twilio.com/v1/Services/default/Maps/${VIDEO_ARCHIVE_MAP_NAME}`
  const serialized = JSON.stringify(dataObj)

  const updateRes = await fetch(`${baseUrl}/Items/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ Data: serialized }).toString(),
  })
  if (updateRes.ok) return true

  if (updateRes.status === 404) {
    await ensureVideoArchiveMapExists(auth)
    const createRes = await fetch(`${baseUrl}/Items`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ Key: key, Data: serialized }).toString(),
    })
    return createRes.ok || createRes.status === 409
  }

  return false
}

/**
 * Loads all permanently archived platform videos + 24h schedule metadata from Twilio Sync.
 * Strictly additive: old videos are never deleted.
 */
export async function pullCloudVideoArchive(): Promise<{
  items: HarvestedMediaItem[]
  meta: DailyVideoScheduleMeta | null
}> {
  const auth = getTwilioAuthHeader()
  if (!auth) return { items: [], meta: null }

  try {
    const items: HarvestedMediaItem[] = []
    let meta: DailyVideoScheduleMeta | null = null
    let nextUrl: string | null =
      `https://sync.twilio.com/v1/Services/default/Maps/${VIDEO_ARCHIVE_MAP_NAME}/Items?PageSize=200`
    let pagesFetched = 0

    while (nextUrl && pagesFetched < 5) {
      pagesFetched += 1
      const res: Response = await fetch(nextUrl, {
        method: "GET",
        headers: { Authorization: auth },
        cache: "no-store",
      })
      if (!res.ok) break

      const json: any = await res.json()
      const rawItems = Array.isArray(json?.items) ? json.items : []
      for (const entry of rawItems) {
        if (!entry?.key || !entry?.data) continue
        if (entry.key === DAILY_SCHEDULE_META_KEY) {
          meta = entry.data as DailyVideoScheduleMeta
        } else if (entry.data.id && entry.data.title) {
          items.push(entry.data as HarvestedMediaItem)
        }
      }
      nextUrl = json?.meta?.next_page_url || null
    }

    return {
      items: dedupeHarvestedItems(items),
      meta,
    }
  } catch (err) {
    console.error("[video-archive] pullCloudVideoArchive error:", err)
    return { items: [], meta: null }
  }
}

/**
 * Appends only brand-new unseen videos into the permanent Cloud Sync archive (never deletes existing videos)
 * and updates the 24-hour schedule metadata.
 */
export async function appendNewVideosToCloudArchive(params: {
  existingCloudItems: HarvestedMediaItem[]
  candidateItems: HarvestedMediaItem[]
  triggeredBy: string
}): Promise<{
  addedItems: HarvestedMediaItem[]
  allArchivedItems: HarvestedMediaItem[]
  meta: DailyVideoScheduleMeta
}> {
  const { existingCloudItems, candidateItems, triggeredBy } = params
  const existingKeys = new Set(existingCloudItems.map((i) => makeArchiveItemKey(i)))

  const toInsert: HarvestedMediaItem[] = []
  for (const item of candidateItems) {
    const k = makeArchiveItemKey(item)
    if (!existingKeys.has(k)) {
      existingKeys.add(k)
      toInsert.push(item)
    }
  }

  const allArchivedItems = dedupeHarvestedItems([...toInsert, ...existingCloudItems])
  const nowIso = new Date().toISOString()
  const nextIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  const meta: DailyVideoScheduleMeta = {
    lastDailySyncIso: nowIso,
    nextScheduledSyncIso: nextIso,
    totalVideosArchived: allArchivedItems.length,
    lastAddedCount: toInsert.length,
    cadenceHours: 24,
    triggeredBy,
  }

  const auth = getTwilioAuthHeader()
  if (auth) {
    try {
      await ensureVideoArchiveMapExists(auth)
      // Write new videos in small batches so we never delete old ones
      const batch = toInsert.slice(0, 40)
      await Promise.allSettled(
        batch.map((item) => upsertRawMapItem(auth, makeArchiveItemKey(item), item))
      )
      await upsertRawMapItem(auth, DAILY_SCHEDULE_META_KEY, meta)
    } catch (err) {
      console.error("[video-archive] appendNewVideosToCloudArchive error:", err)
    }
  }

  return {
    addedItems: toInsert,
    allArchivedItems,
    meta,
  }
}

/**
 * Persists each 24-hour unified platform cron cycle (Jobs, Alerts, Market, Learning, Media, Pulse, More tabs)
 * into Twilio Cloud Sync (`connectln_daily_platform_map_v1`) without ever deleting prior daily cycles.
 */
export async function persistDailyPlatformCronRun(
  cycleDay: number,
  manifest: Record<string, unknown>
): Promise<boolean> {
  const auth = getTwilioAuthHeader()
  if (!auth) return false
  try {
    await fetch("https://sync.twilio.com/v1/Services/default/Maps", {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ UniqueName: DAILY_PLATFORM_MAP_NAME }).toString(),
    }).catch(() => {})

    const baseUrl = `https://sync.twilio.com/v1/Services/default/Maps/${DAILY_PLATFORM_MAP_NAME}`
    const serialized = JSON.stringify(manifest)
    const cycleKey = `cycle_day_${cycleDay}`

    for (const key of [cycleKey, "latest_24h_platform_manifest"]) {
      const upd = await fetch(`${baseUrl}/Items/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ Data: serialized }).toString(),
      })
      if (upd.status === 404) {
        await fetch(`${baseUrl}/Items`, {
          method: "POST",
          headers: {
            Authorization: auth,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ Key: key, Data: serialized }).toString(),
        }).catch(() => {})
      }
    }
    return true
  } catch (err) {
    console.error("[daily-platform-archive] persistDailyPlatformCronRun error:", err)
    return false
  }
}
