import { Redis } from '@upstash/redis'

// Initialize Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Helper functions for common Redis operations
export class RedisService {
  // Cache operations
  static async set(key: string, value: unknown, ttl?: number) {
    if (ttl) {
      return await redis.setex(key, ttl, JSON.stringify(value))
    }
    return await redis.set(key, JSON.stringify(value))
  }

  static async get<T>(key: string): Promise<T | null> {
    const result = await redis.get(key)
    if (!result) return null
    
    try {
      return JSON.parse(result as string) as T
    } catch {
      return result as T
    }
  }

  static async del(key: string) {
    return await redis.del(key)
  }

  static async exists(key: string) {
    return await redis.exists(key)
  }

  // Session management
  static async setSession(sessionId: string, data: unknown, ttl: number = 3600) {
    return await this.set(`session:${sessionId}`, data, ttl)
  }

  static async getSession<T>(sessionId: string): Promise<T | null> {
    return await this.get<T>(`session:${sessionId}`)
  }

  static async deleteSession(sessionId: string) {
    return await this.del(`session:${sessionId}`)
  }

  // Rate limiting
  static async rateLimit(key: string, limit: number, window: number) {
    const current = await redis.incr(key)
    
    if (current === 1) {
      await redis.expire(key, window)
    }
    
    return {
      count: current,
      remaining: Math.max(0, limit - current),
      reset: Date.now() + (window * 1000)
    }
  }

  // List operations
  static async lpush(key: string, ...values: unknown[]) {
    return await redis.lpush(key, ...values.map(v => JSON.stringify(v)))
  }

  static async rpop<T>(key: string): Promise<T | null> {
    const result = await redis.rpop(key)
    if (!result) return null
    
    try {
      return JSON.parse(result as string) as T
    } catch {
      return result as T
    }
  }

  static async llen(key: string) {
    return await redis.llen(key)
  }

  // Hash operations
  static async hset(key: string, field: string, value: unknown) {
    return await redis.hset(key, { [field]: JSON.stringify(value) })
  }

  static async hget<T>(key: string, field: string): Promise<T | null> {
    const result = await redis.hget(key, field)
    if (!result) return null
    
    try {
      return JSON.parse(result as string) as T
    } catch {
      return result as T
    }
  }

  static async hdel(key: string, field: string) {
    return await redis.hdel(key, field)
  }
}

export default redis