import { Redis } from "@upstash/redis";

type LimitKind = "login" | "ai" | "redacao" | "skills" | "publicApi";

const limits: Record<LimitKind, { max: number; windowSec: number }> = {
  login: { max: 10, windowSec: 60 },
  ai: { max: 60, windowSec: 60 },
  redacao: { max: 8, windowSec: 60 * 60 },
  skills: { max: 40, windowSec: 60 * 10 },
  publicApi: { max: 120, windowSec: 60 },
};

const memoryStore = new Map<string, { count: number; resetAt: number }>();

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return Redis.fromEnv();
}

export async function rateLimit(kind: LimitKind, key: string): Promise<void> {
  const limit = limits[kind];
  const redis = getRedis();
  const now = Date.now();
  const bucket = `rl:${kind}:${key}:${Math.floor(now / (limit.windowSec * 1000))}`;

  if (redis) {
    const count = await redis.incr(bucket);
    if (count === 1) await redis.expire(bucket, limit.windowSec);
    if (count > limit.max) throw new Response("Rate limit exceeded", { status: 429 });
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Response("Rate limiting is not configured", { status: 503 });
  }

  const current = memoryStore.get(bucket);
  if (!current || current.resetAt < now) {
    memoryStore.set(bucket, { count: 1, resetAt: now + limit.windowSec * 1000 });
    return;
  }
  current.count += 1;
  if (current.count > limit.max) throw new Response("Rate limit exceeded", { status: 429 });
}
