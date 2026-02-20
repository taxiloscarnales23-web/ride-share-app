export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message: string; // Error message
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitStore {
  userId: string;
  requestCount: number;
  resetTime: number;
  blockedUntil?: number;
}

export interface RateLimitStats {
  totalRequests: number;
  blockedRequests: number;
  activeUsers: number;
  topUsers: Array<{ userId: string; requestCount: number }>;
}

export class RateLimitingService {
  private store: Map<string, RateLimitStore> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();
  private stats = {
    totalRequests: 0,
    blockedRequests: 0,
  };

  constructor() {
    this.initializeConfigs();
  }

  private initializeConfigs(): void {
    // Default rate limits for different endpoints
    this.configs.set("default", {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
      message: "Too many requests, please try again later",
    });

    this.configs.set("auth", {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      message: "Too many login attempts, please try again later",
    });

    this.configs.set("api", {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60,
      message: "API rate limit exceeded",
    });

    this.configs.set("search", {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30,
      message: "Search rate limit exceeded",
    });

    this.configs.set("upload", {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10,
      message: "Upload limit exceeded",
    });
  }

  /**
   * Check if request is allowed
   */
  async checkLimit(userId: string, endpoint: string = "default"): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const config = this.configs.get(endpoint) || this.configs.get("default")!;
    const now = Date.now();

    let store = this.store.get(userId);

    // Initialize or reset store if window expired
    if (!store || now >= store.resetTime) {
      store = {
        userId,
        requestCount: 0,
        resetTime: now + config.windowMs,
      };
      this.store.set(userId, store);
    }

    // Check if user is blocked
    if (store.blockedUntil && now < store.blockedUntil) {
      this.stats.blockedRequests++;
      return {
        allowed: false,
        remaining: 0,
        resetTime: store.blockedUntil,
      };
    }

    // Increment request count
    store.requestCount++;
    this.stats.totalRequests++;

    const remaining = Math.max(0, config.maxRequests - store.requestCount);

    // Check if limit exceeded
    if (store.requestCount > config.maxRequests) {
      // Block user for 5 minutes on excessive requests
      store.blockedUntil = now + 5 * 60 * 1000;
      this.stats.blockedRequests++;

      return {
        allowed: false,
        remaining: 0,
        resetTime: store.blockedUntil,
      };
    }

    return {
      allowed: true,
      remaining,
      resetTime: store.resetTime,
    };
  }

  /**
   * Get rate limit status for user
   */
  async getStatus(userId: string, endpoint: string = "default"): Promise<RateLimitStore | null> {
    return this.store.get(userId) || null;
  }

  /**
   * Reset rate limit for user
   */
  async reset(userId: string): Promise<void> {
    this.store.delete(userId);
  }

  /**
   * Reset all rate limits
   */
  async resetAll(): Promise<void> {
    this.store.clear();
  }

  /**
   * Block user temporarily
   */
  async blockUser(userId: string, durationMs: number = 5 * 60 * 1000): Promise<void> {
    let store = this.store.get(userId);

    if (!store) {
      store = {
        userId,
        requestCount: 0,
        resetTime: Date.now() + durationMs,
        blockedUntil: Date.now() + durationMs,
      };
    } else {
      store.blockedUntil = Date.now() + durationMs;
    }

    this.store.set(userId, store);
  }

  /**
   * Unblock user
   */
  async unblockUser(userId: string): Promise<void> {
    const store = this.store.get(userId);
    if (store) {
      delete store.blockedUntil;
    }
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<RateLimitStats> {
    const topUsers = Array.from(this.store.values())
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, 10)
      .map((s) => ({
        userId: s.userId,
        requestCount: s.requestCount,
      }));

    return {
      totalRequests: this.stats.totalRequests,
      blockedRequests: this.stats.blockedRequests,
      activeUsers: this.store.size,
      topUsers,
    };
  }

  /**
   * Get quota usage
   */
  async getQuotaUsage(userId: string, endpoint: string = "default"): Promise<{
    used: number;
    limit: number;
    remaining: number;
    percentageUsed: number;
  }> {
    const config = this.configs.get(endpoint) || this.configs.get("default")!;
    const store = this.store.get(userId);

    const used = store?.requestCount || 0;
    const limit = config.maxRequests;
    const remaining = Math.max(0, limit - used);
    const percentageUsed = (used / limit) * 100;

    return {
      used,
      limit,
      remaining,
      percentageUsed,
    };
  }

  /**
   * Add custom endpoint config
   */
  async addConfig(endpoint: string, config: RateLimitConfig): Promise<void> {
    this.configs.set(endpoint, config);
  }

  /**
   * Get all configs
   */
  async getConfigs(): Promise<Record<string, RateLimitConfig>> {
    const result: Record<string, RateLimitConfig> = {};
    for (const [key, value] of this.configs) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Cleanup expired entries
   */
  async cleanup(): Promise<number> {
    const now = Date.now();
    let cleaned = 0;

    for (const [userId, store] of this.store) {
      if (now >= store.resetTime && (!store.blockedUntil || now >= store.blockedUntil)) {
        this.store.delete(userId);
        cleaned++;
      }
    }

    return cleaned;
  }
}

export const rateLimitingService = new RateLimitingService();
