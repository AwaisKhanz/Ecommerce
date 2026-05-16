import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

import { env } from '@/lib/env';
import { memoryRateLimit } from '@/lib/rate-limit/memory';

export async function withRateLimit(
  key: string,
  limit: number,
  window: `${number} ${'s' | 'm' | 'h'}`,
): Promise<boolean> {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    const [amount, unit] = window.split(' ');
    const multiplier = unit === 'h' ? 3_600_000 : unit === 'm' ? 60_000 : 1_000;
    return memoryRateLimit(key, limit, Number(amount) * multiplier);
  }

  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
  });
  const result = await limiter.limit(key);
  return result.success;
}
