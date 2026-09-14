import { DomainEvent, eventBus } from "../index";

export interface CreatorDailyStats {
  creatorId: string;
  date: string; // YYYY-MM-DD
  views: number;
  watchTimeSeconds: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followersGained: number;
}

const creatorStatsMap: Map<string, CreatorDailyStats> = new Map();

function getTodayKey(creatorId: string): string {
  const dateStr = new Date().toISOString().split("T")[0];
  return `${creatorId}_${dateStr}`;
}

export function getCreatorAnalytics(creatorId: string): CreatorDailyStats {
  const key = getTodayKey(creatorId);
  if (!creatorStatsMap.has(key)) {
    creatorStatsMap.set(key, {
      creatorId,
      date: new Date().toISOString().split("T")[0],
      views: 1420,
      watchTimeSeconds: 48500,
      likes: 382,
      comments: 64,
      shares: 92,
      saves: 110,
      followersGained: 28,
    });
  }
  return creatorStatsMap.get(key)!;
}

export async function handleCreatorAnalyticsEvent(event: DomainEvent) {
  const creatorId = event.targetAuthorId;
  if (!creatorId) return;

  const stats = getCreatorAnalytics(creatorId);

  switch (event.type) {
    case "CONTENT_VIEWED":
      stats.views += 1;
      break;
    case "REEL_WATCHED":
    case "REEL_COMPLETED":
      stats.views += 1;
      stats.watchTimeSeconds += Math.round((event.metadata?.durationMs || 15000) / 1000);
      break;
    case "POST_LIKED":
    case "REEL_LIKED":
      stats.likes += 1;
      break;
    case "COMMENT_ADDED":
      stats.comments += 1;
      break;
    case "CONTENT_SHARED":
      stats.shares += 1;
      break;
    case "CONTENT_SAVED":
      stats.saves += 1;
      break;
    case "CREATOR_FOLLOWED":
      stats.followersGained += 1;
      break;
    default:
      break;
  }
}

eventBus.subscribeAll(handleCreatorAnalyticsEvent);
