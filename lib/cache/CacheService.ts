// Cache configuration
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items in cache
}

// Cache item with timestamp
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100, // 100 items max
      ...config
    };
    
    // Clean up expired items every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  // Get item from cache
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  // Set item in cache
  set<T>(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl;
    
    // Remove oldest items if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Delete item from cache
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Check if item exists and not expired
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }

  // Clean up expired items
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Singleton instances for different cache types
export const productCache = new CacheService({ ttl: 10 * 60 * 1000 }); // 10 minutes for products
export const bahanCache = new CacheService({ ttl: 15 * 60 * 1000 }); // 15 minutes for bahan items
export const searchCache = new CacheService({ ttl: 2 * 60 * 1000 }); // 2 minutes for search results

export default CacheService;
