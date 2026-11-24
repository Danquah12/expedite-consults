import { NextRequest, NextResponse } from "next/server"
import { getOrRunAdditive24HourVideoArchive } from "@/lib/connectin-live-video-sync"
import { getOrSync24HourLearningVideos } from "@/lib/connectln-learning-video-sync"
import { persistDailyPlatformCronRun } from "@/lib/connectin-cloud-video-archive"
import { connectinDb } from "@/lib/connectin-db"
import {
  getElapsed24HourScheduleDays,
  getAccumulatedDailyJobs,
  getAccumulatedDailyAlerts,
  getAccumulatedDailyMarketProducts,
  getAccumulatedDailyLearningCourses,
  getAccumulatedDailyLabs,
  getAccumulatedDailyMediaVideos,
  getAccumulatedDailyMediaClips,
  getAccumulatedDailyPulseArticles,
  getAccumulatedDailyPulseRooms,
  getAccumulatedDailyRfps,
  getAccumulatedDailyBounties,
  getAccumulatedDailyEvents,
  getAccumulatedDailyGuilds,
  getAccumulatedDailyLaunchpad,
  getAccumulatedDailyWatercooler,
  getAccumulatedDailyWorkOpportunities,
  getAccumulatedDailyServiceListings,
} from "@/lib/connectin-daily-platform-growth"
import type { GlobalJobItem } from "@/lib/global-jobs-data"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Official 24-Hour Unified Platform Cron Endpoint (`0 6 * * *` in vercel.json).
 * Runs every 24 hours to ADD new items across:
 *   - Videos (Home, Jobs, Market, Media, Pulse via 12 live RSS feeds + Cloud Sync archive)
 *   - Jobs (`Jobs` tab & `/api/connectin/jobs`)
 *   - Alerts (`Alerts` tab & `/api/connectin/alerts`)
 *   - Market (`Market` tab)
 *   - Learning Materials (`Learning` tab: video courses + interactive labs)
 *   - Different Media (`Media` tab: featured videos + short vertical reels)
 *   - Pulse (`Pulse` tab: editorial dispatches + live roundtables)
 *   - More Tabs (`Procurement RFPs`, `Bounties`, `Events`, `Guilds`, `Launchpad`, `Watercooler`, `Work & Business`)
 *
 * STRICTLY ADDITIVE: Existing videos and items across all tabs are NEVER deleted.
 */
export async function GET(req: NextRequest) {
  try {
    const cronSecret = (process.env.CRON_SECRET || "").trim()
    const authHeader = req.headers.get("authorization") || ""
    const isVercelCronHeader = Boolean(req.headers.get("x-vercel-cron"))

    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !isVercelCronHeader) {
      return NextResponse.json({ ok: false, error: "Unauthorized cron invocation" }, { status: 401 })
    }

    const triggeredBy = isVercelCronHeader ? "vercel-24h-cron" : "scheduled-24h-endpoint"

    // 1. Additive 24h Live Video Sync across all 12 RSS channels + permanent Cloud Archive
    const [videoResult, learningVideoResult] = await Promise.all([
      getOrRunAdditive24HourVideoArchive({
        forceSync: true,
        triggeredBy,
      }),
      getOrSync24HourLearningVideos({
        forceSync: true,
        triggeredBy,
      }),
    ])

    // 2. Additive 24h Platform Content Sync across Jobs, Alerts, Market, Learning, Media, Pulse & More Tabs
    const nowMs = Date.now()
    const cycleDay = getElapsed24HourScheduleDays(nowMs)
    const dailyJobs = getAccumulatedDailyJobs(nowMs)
    const dailyAlerts = getAccumulatedDailyAlerts(nowMs)
    const dailyMarket = getAccumulatedDailyMarketProducts(nowMs)
    const dailyCourses = getAccumulatedDailyLearningCourses(nowMs)
    const dailyLabs = getAccumulatedDailyLabs(nowMs)
    const dailyMediaVideos = getAccumulatedDailyMediaVideos(nowMs)
    const dailyMediaClips = getAccumulatedDailyMediaClips(nowMs)
    const dailyPulseArticles = getAccumulatedDailyPulseArticles(nowMs)
    const dailyPulseRooms = getAccumulatedDailyPulseRooms(nowMs)
    const dailyRfps = getAccumulatedDailyRfps(nowMs)
    const dailyBounties = getAccumulatedDailyBounties(nowMs)
    const dailyEvents = getAccumulatedDailyEvents(nowMs)
    const dailyGuilds = getAccumulatedDailyGuilds(nowMs)
    const dailyLaunchpad = getAccumulatedDailyLaunchpad(nowMs)
    const dailyWatercooler = getAccumulatedDailyWatercooler(nowMs)
    const dailyWorkOpps = getAccumulatedDailyWorkOpportunities(nowMs)
    const dailyServices = getAccumulatedDailyServiceListings(nowMs)

    // Sync new daily jobs into live in-memory Jobs API store (deduplicated, never deleting existing jobs)
    const globalForJobs = globalThis as unknown as {
      __connectinCustomPostedJobs?: GlobalJobItem[]
    }
    if (!globalForJobs.__connectinCustomPostedJobs) {
      globalForJobs.__connectinCustomPostedJobs = []
    }
    const existingJobIds = new Set(globalForJobs.__connectinCustomPostedJobs.map((j) => j.id))
    let jobsInsertedCount = 0
    for (const job of dailyJobs) {
      if (!existingJobIds.has(job.id)) {
        globalForJobs.__connectinCustomPostedJobs.unshift(job)
        existingJobIds.add(job.id)
        jobsInsertedCount += 1
      }
    }

    // Sync new daily alerts into live Alerts DB store (deduplicated, never deleting existing alerts)
    const existingAlertIds = new Set(connectinDb.getAlerts().map((a: any) => a.id))
    let alertsInsertedCount = 0
    for (const alert of dailyAlerts) {
      if (!existingAlertIds.has(alert.id)) {
        connectinDb.addAlert(alert)
        existingAlertIds.add(alert.id)
        alertsInsertedCount += 1
      }
    }

    const platformSummary = {
      cycleDay,
      syncedAtIso: videoResult.meta.lastDailySyncIso,
      nextScheduledSyncIso: videoResult.meta.nextScheduledSyncIso,
      triggeredBy,
      videos: {
        newlyAddedThisRun: videoResult.addedItems.length,
        totalArchivedPreserved: videoResult.items.length,
      },
      jobs: {
        newlyInsertedLiveStore: jobsInsertedCount,
        accumulatedDailyJobs: dailyJobs.length,
      },
      alerts: {
        newlyInsertedLiveStore: alertsInsertedCount,
        accumulatedDailyAlerts: dailyAlerts.length,
      },
      market: {
        accumulatedDailyProducts: dailyMarket.length,
      },
      learning: {
        accumulatedDailyCourses: dailyCourses.length,
        accumulatedDailyLabs: dailyLabs.length,
        learningVideoSync: {
          newlyAddedThisRun: learningVideoResult.addedCount,
          totalSyncedPreserved: learningVideoResult.lessons.length,
          nextScheduledSyncIso: learningVideoResult.meta.nextSyncIso,
        },
      },
      media: {
        accumulatedDailyBroadcasts: dailyMediaVideos.length,
        accumulatedDailyReels: dailyMediaClips.length,
      },
      pulse: {
        accumulatedDailyArticles: dailyPulseArticles.length,
        accumulatedDailyRooms: dailyPulseRooms.length,
      },
      moreTabs: {
        procurementRfps: dailyRfps.length,
        bountiesAndHackathons: dailyBounties.length,
        eventsAndWorkshops: dailyEvents.length,
        guilds: dailyGuilds.length,
        launchpadDrops: dailyLaunchpad.length,
        watercoolerThreads: dailyWatercooler.length,
        workOpportunities: dailyWorkOpps.length,
        serviceListings: dailyServices.length,
      },
    }

    const cloudSaved = await persistDailyPlatformCronRun(cycleDay, platformSummary)

    return NextResponse.json(
      {
        ok: true,
        schedule: "0 6 * * * (Every 24 Hours)",
        mode: "additive_preserve_all_existing",
        cloudPersisted: cloudSaved,
        addedCount: videoResult.addedItems.length,
        totalArchivedVideos: videoResult.items.length,
        lastDailySyncIso: videoResult.meta.lastDailySyncIso,
        nextScheduledSyncIso: videoResult.meta.nextScheduledSyncIso,
        addedTitles: videoResult.addedItems.slice(0, 10).map((i) => i.title),
        learningVideoSync: {
          newlyAddedThisRun: learningVideoResult.addedCount,
          totalSyncedPreserved: learningVideoResult.lessons.length,
          nextScheduledSyncIso: learningVideoResult.meta.nextSyncIso,
        },
        platformSummary,
      },
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    )
  } catch (err: any) {
    console.error("[daily-video-sync cron] failed:", err)
    return NextResponse.json(
      { ok: false, error: err?.message || "Daily platform & video sync failed" },
      { status: 500 }
    )
  }
}
