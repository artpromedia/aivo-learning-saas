import type { Redis } from "ioredis";
import type { FlagDefinition } from "./types.js";

const REDIS_FLAG_PREFIX = "ff:";
const DEFAULT_TTL_MS = 30_000;
const MAX_ENTRIES = 1000;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  constructor(private maxSize: number) {}

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    this.cache.delete(key);
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value as string;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export class FlagCache {
  private flagCache = new LRUCache<FlagDefinition>(MAX_ENTRIES);
  private overrideCache = new LRUCache<unknown>(MAX_ENTRIES);

  constructor(private redis: Redis) {}

  async getFlag(key: string): Promise<FlagDefinition | null> {
    const cached = this.flagCache.get(key);
    if (cached) return cached;

    const raw = await this.redis.get(`${REDIS_FLAG_PREFIX}${key}`);
    if (raw === null) return null;

    const parsed = JSON.parse(raw) as unknown;

    let flag: FlagDefinition;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "type" in parsed &&
      "enabled" in parsed
    ) {
      flag = parsed as FlagDefinition;
    } else {
      flag = {
        key,
        type: "BOOLEAN",
        defaultValue: parsed,
        enabled: true,
      };
    }

    this.flagCache.set(key, flag, DEFAULT_TTL_MS);
    return flag;
  }

  async getOverride(key: string, tenantId: string): Promise<unknown | null> {
    const cacheKey = `${key}:${tenantId}`;
    const cached = this.overrideCache.get(cacheKey);
    if (cached !== undefined) return cached;

    const raw = await this.redis.get(`${REDIS_FLAG_PREFIX}${key}:${tenantId}`);
    if (raw === null) return null;

    const value: unknown = JSON.parse(raw);
    this.overrideCache.set(cacheKey, value, DEFAULT_TTL_MS);
    return value;
  }

  invalidate(key: string): void {
    this.flagCache.delete(key);
    this.overrideCache.delete(key);
  }

  invalidateAll(): void {
    this.flagCache.clear();
    this.overrideCache.clear();
  }
}
