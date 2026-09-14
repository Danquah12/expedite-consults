import { DomainEvent, eventBus } from "../index";

export interface UserAffinityProfile {
  userId: string;
  topicWeights: Record<string, number>; // e.g. { "cybersecurity": 8.5, "ai": 7.0, "web3": 4.2 }
  creatorWeights: Record<string, number>; // e.g. { "kwesi": 10.0, "amara_creates": 6.5 }
  mutedTopics: string[];
  mutedCreators: string[];
  lastUpdated: string;
}

const userAffinities: Map<string, UserAffinityProfile> = new Map();

export function getUserAffinities(userId: string): UserAffinityProfile {
  if (!userAffinities.has(userId)) {
    userAffinities.set(userId, {
      userId,
      topicWeights: {
        Cybersecurity: 5.0,
        "AI Protocols": 5.0,
        "Campus & Web3": 5.0,
        Career: 5.0,
        "Robotics & Dev": 5.0,
        Entertainment: 5.0,
      },
      creatorWeights: {},
      mutedTopics: [],
      mutedCreators: [],
      lastUpdated: new Date().toISOString(),
    });
  }
  return userAffinities.get(userId)!;
}

export function updateUserAffinity(userId: string, updates: Partial<UserAffinityProfile>): UserAffinityProfile {
  const current = getUserAffinities(userId);
  const updated = {
    ...current,
    ...updates,
    topicWeights: { ...current.topicWeights, ...(updates.topicWeights || {}) },
    lastUpdated: new Date().toISOString(),
  };
  userAffinities.set(userId, updated);
  return updated;
}

export async function handleRecommendationEvent(event: DomainEvent) {
  const { actorId, type, metadata, targetAuthorId } = event;
  if (!actorId) return;

  const profile = getUserAffinities(actorId);
  const topics: string[] = metadata?.topics || metadata?.hashtags || [];

  let weightDelta = 0;
  if (type === "POST_LIKED" || type === "REEL_LIKED") weightDelta = 1.2;
  else if (type === "CONTENT_SAVED") weightDelta = 2.0;
  else if (type === "COMMENT_ADDED") weightDelta = 1.5;
  else if (type === "REEL_COMPLETED") weightDelta = 1.8;
  else if (type === "CONTENT_SHARED") weightDelta = 2.5;
  else if (type === "CREATOR_FOLLOWED") weightDelta = 3.0;
  else if (type === "CONTENT_NOT_INTERESTED") weightDelta = -2.5;

  // Update Topic Affinities
  if (topics.length > 0 && weightDelta !== 0) {
    topics.forEach((t) => {
      const cleanTopic = t.replace(/^#/, "");
      const currentVal = profile.topicWeights[cleanTopic] || 5.0;
      profile.topicWeights[cleanTopic] = Math.max(0, Math.min(20, currentVal + weightDelta));
    });
  }

  // Update Creator Affinity
  if (targetAuthorId && weightDelta !== 0) {
    const currentVal = profile.creatorWeights[targetAuthorId] || 0;
    profile.creatorWeights[targetAuthorId] = Math.max(0, currentVal + weightDelta);
  }

  profile.lastUpdated = new Date().toISOString();
}

eventBus.subscribeAll(handleRecommendationEvent);
