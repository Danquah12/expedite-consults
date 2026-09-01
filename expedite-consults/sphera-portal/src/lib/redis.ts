import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const hasRedisConfig =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "https://dummy-redis.upstash.io",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "dummy_token",
});

// Helper for safe rate limit execution
function createSafeLimiter(prefix: string, requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  if (!hasRedisConfig) {
    return {
      limit: async (_identifier: string) => ({
        success: true,
        limit: requests,
        remaining: requests,
        reset: 0,
      }),
    };
  }
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix,
  });
}

// 60 requests per minute per user — general API
export const generalRatelimit = createSafeLimiter("sphera:ratelimit:general", 60, "1 m");

// 5 requests per minute — auth endpoints (sign-in, sign-up)
export const authRatelimit = createSafeLimiter("sphera:ratelimit:auth", 5, "1 m");

// 20 posts per hour — content creation
export const postRatelimit = createSafeLimiter("sphera:ratelimit:post", 20, "1 h");

// Feed cache helpers
export async function getCachedFeed(userId: string) {
  if (!hasRedisConfig) return null;
  return redis.get<string[]>(`sphera:feed:${userId}`);
}

export async function setCachedFeed(userId: string, postIds: string[]) {
  if (!hasRedisConfig) return;
  await redis.set(`sphera:feed:${userId}`, postIds, { ex: 300 });
}

export async function invalidateFeedCache(userId: string) {
  if (!hasRedisConfig) return;
  await redis.del(`sphera:feed:${userId}`);
}
