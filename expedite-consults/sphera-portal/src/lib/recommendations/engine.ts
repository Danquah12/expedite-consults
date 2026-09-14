import { FeedPost } from "@/lib/feed-store";
import { getUserAffinities, updateUserAffinity, UserAffinityProfile } from "@/lib/events/handlers/recommendation-handler";

export interface AlgorithmExplanation {
  contentId: string;
  primaryReason: string;
  matchedTopics: { name: string; userAffinityScore: number }[];
  socialSignals: { type: string; description: string }[];
  recommendationScore: number;
  transparencyTip: string;
}

export interface UserAlgorithmControls {
  topicSliders: Record<string, number>; // e.g. { "Cybersecurity": 85, "AI Protocols": 90, "Career": 70 }
  mutedTopics: string[];
  mutedCreators: string[];
  engagementThreshold: "balanced" | "viral_only" | "niche_specialized";
}

/**
 * Computes hybrid recommendation score for a piece of content:
 * Score = w_social * I_social + w_topic * Sim(U_topic, C_topic) + w_engagement * EngRate - w_penalty * I_muted + Decay(t)
 */
export function scoreContentForUser(
  post: FeedPost,
  userProfile: UserAffinityProfile,
  viewerId?: string
): { score: number; explanation: AlgorithmExplanation } {
  let score = 50.0; // Base score
  const matchedTopics: { name: string; userAffinityScore: number }[] = [];
  const socialSignals: { type: string; description: string }[] = [];

  // 1. Check if Creator or Topic is Muted
  if (userProfile.mutedCreators.includes(post.author.username) || userProfile.mutedCreators.includes(post.author.id)) {
    return {
      score: -100,
      explanation: {
        contentId: post.id,
        primaryReason: "This creator is currently muted in your algorithm settings.",
        matchedTopics: [],
        socialSignals: [],
        recommendationScore: -100,
        transparencyTip: "You can unmute this creator in your Algorithm Preferences.",
      },
    };
  }

  // 2. Social Graph Scoring (Mutual friends, Follower connection)
  if (post.author.isFriend) {
    score += 35;
    socialSignals.push({ type: "friend", description: `Mutual Campus Connection with @${post.author.username}` });
  } else if (post.author.isFollowed) {
    score += 25;
    socialSignals.push({ type: "following", description: `You follow @${post.author.username}` });
  }

  if (post.likedByFriend) {
    score += 15;
    socialSignals.push({ type: "friend_liked", description: `Liked by ${post.likedByFriend}` });
  }

  // 3. Content Graph & Topic Matching
  const contentTopics = [
    ...(post.hashtags || []).map((t) => t.replace(/^#/, "")),
    post.type === "pulse_thread" ? "ZeroTrust" : "",
    post.bounty ? "Career" : "",
    post.article ? "Architecture" : "",
  ].filter(Boolean);

  let highestTopicMatch = 0;
  let dominantTopicName = "";

  contentTopics.forEach((topic) => {
    // Check if muted
    if (userProfile.mutedTopics.some((m) => m.toLowerCase() === topic.toLowerCase())) {
      score -= 50;
      return;
    }

    // Check user topic weight
    const userWeight = userProfile.topicWeights[topic] ?? userProfile.topicWeights["Cybersecurity"] ?? 5.0;
    matchedTopics.push({ name: topic, userAffinityScore: Math.round(userWeight * 10) });

    if (userWeight > highestTopicMatch) {
      highestTopicMatch = userWeight;
      dominantTopicName = topic;
    }
  });

  score += highestTopicMatch * 4.5;

  // 4. Content Quality / Engagement Signals
  const engagementRate = Math.min(25, (post.likes / Math.max(100, post.viewsCount || 500)) * 50);
  score += engagementRate;

  // 5. Recency Decay
  const postAgeHours = (Date.now() - new Date(post.createdAt).getTime()) / 3600000;
  const recencyBonus = Math.max(0, 20 - postAgeHours * 0.8);
  score += recencyBonus;

  // Primary Explanation Sentence
  let primaryReason = "Recommended based on top trending collegiate activity in your campus graph.";
  if (socialSignals.length > 0) {
    primaryReason = socialSignals[0].description;
  } else if (dominantTopicName) {
    primaryReason = `You recently engaged with #${dominantTopicName} and related zero-trust cyber topics.`;
  }

  const explanation: AlgorithmExplanation = {
    contentId: post.id,
    primaryReason,
    matchedTopics,
    socialSignals,
    recommendationScore: Math.round(score),
    transparencyTip: "SpheraNet gives you 100% sovereign control over these weights via Algorithm Preferences.",
  };

  return { score, explanation };
}

/**
 * Re-ranks a list of feed posts using the hybrid recommendation engine
 */
export function rankFeedPostsForUser(
  posts: FeedPost[],
  userId: string = "kwesi"
): { posts: FeedPost[]; explanations: Record<string, AlgorithmExplanation> } {
  const userProfile = getUserAffinities(userId);
  const explanations: Record<string, AlgorithmExplanation> = {};

  const scoredPosts = posts
    .map((post) => {
      const { score, explanation } = scoreContentForUser(post, userProfile, userId);
      explanations[post.id] = explanation;
      return { post, score };
    })
    .filter((item) => item.score > 0) // Filter out completely muted items
    .sort((a, b) => b.score - a.score)
    .map((item) => item.post);

  return { posts: scoredPosts, explanations };
}

export function getUserAlgorithmControls(userId: string): UserAlgorithmControls {
  const profile = getUserAffinities(userId);
  const topicSliders: Record<string, number> = {};

  Object.entries(profile.topicWeights).forEach(([topic, weight]) => {
    topicSliders[topic] = Math.round(Math.min(100, (weight / 15) * 100));
  });

  return {
    topicSliders: {
      Cybersecurity: topicSliders["Cybersecurity"] ?? 85,
      "AI Protocols": topicSliders["AI Protocols"] ?? 80,
      "Campus & Web3": topicSliders["Campus & Web3"] ?? 75,
      Career: topicSliders["Career"] ?? 70,
      "Robotics & Dev": topicSliders["Robotics & Dev"] ?? 65,
      Entertainment: topicSliders["Entertainment"] ?? 50,
      Sports: topicSliders["Sports"] ?? 40,
    },
    mutedTopics: profile.mutedTopics,
    mutedCreators: profile.mutedCreators,
    engagementThreshold: "balanced",
  };
}

export function saveUserAlgorithmControls(
  userId: string,
  controls: Partial<UserAlgorithmControls>
): UserAlgorithmControls {
  const topicWeights: Record<string, number> = {};
  if (controls.topicSliders) {
    Object.entries(controls.topicSliders).forEach(([topic, percent]) => {
      topicWeights[topic] = (percent / 100) * 15;
    });
  }

  updateUserAffinity(userId, {
    topicWeights: Object.keys(topicWeights).length > 0 ? topicWeights : undefined,
    mutedTopics: controls.mutedTopics,
    mutedCreators: controls.mutedCreators,
  });

  return getUserAlgorithmControls(userId);
}
