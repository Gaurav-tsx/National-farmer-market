/**
 * NAM-Core Ephemeral & Caching Layer
 * Implements:
 * 1. District feed discovery cache: SET listing:district:[id] EX 180 (3-minute TTL)
 * 2. Active APMC Mandi spot rates cache with 15-minute invalidation TTL
 * 3. Sliding-window rate limiter for auth & listing endpoints
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface RateLimitEntry {
  timestamps: number[];
}

class EphemeralRedisClient {
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map();
  private rateLimits: Map<string, RateLimitEntry> = new Map();

  /**
   * Set key with optional expiration in seconds
   * Matches Redis: SET key value EX [seconds]
   */
  async set<T>(key: string, value: T, options?: { ex?: number }): Promise<void> {
    const ttlSeconds = options?.ex ?? 3600;
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.memoryCache.set(key, { value, expiresAt });
  }

  /**
   * Get value if key has not expired
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Delete key
   */
  async del(key: string): Promise<void> {
    this.memoryCache.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix or pattern
   */
  async invalidatePattern(prefix: string): Promise<number> {
    let count = 0;
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Sliding window rate limiter
   * Returns { allowed: boolean, remaining: number, resetInSeconds: number }
   */
  checkRateLimit(
    identifier: string,
    limit: number = 30,
    windowSeconds: number = 60
  ): { allowed: boolean; remaining: number; resetInSeconds: number } {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const windowStart = now - windowMs;

    let entry = this.rateLimits.get(identifier);
    if (!entry) {
      entry = { timestamps: [] };
      this.rateLimits.set(identifier, entry);
    }

    // Filter out timestamps older than window
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    if (entry.timestamps.length >= limit) {
      const oldestInWindow = entry.timestamps[0];
      const resetInSeconds = Math.ceil((oldestInWindow + windowMs - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: Math.max(1, resetInSeconds),
      };
    }

    // Record this hit
    entry.timestamps.push(now);
    return {
      allowed: true,
      remaining: limit - entry.timestamps.length,
      resetInSeconds: windowSeconds,
    };
  }

  /**
   * District listings helper: SET listing:district:[id] EX 180
   */
  async getCachedDistrictListings<T>(districtId: string): Promise<T | null> {
    return this.get<T>(`listing:district:${districtId}`);
  }

  async setCachedDistrictListings<T>(districtId: string, data: T): Promise<void> {
    await this.set(`listing:district:${districtId}`, data, { ex: 180 });
  }

  /**
   * APMC Mandi rates helper with 15-minute invalidation TTL (900 seconds)
   */
  async getCachedMandiRates<T>(): Promise<T | null> {
    return this.get<T>("mandi:rates:active");
  }

  async setCachedMandiRates<T>(data: T): Promise<void> {
    await this.set("mandi:rates:active", data, { ex: 900 });
  }

  async invalidateMandiRates(): Promise<void> {
    await this.del("mandi:rates:active");
  }
}

export const redis = new EphemeralRedisClient();
