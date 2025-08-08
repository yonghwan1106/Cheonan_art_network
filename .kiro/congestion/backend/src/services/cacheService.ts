/**
 * 간단한 인메모리 캐시 서비스
 * 프로토타입용 Redis 대체 솔루션
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  totalItems: number;
  totalSize: number; // Approximate size in bytes
  hitRate: number;
  missRate: number;
  oldestItem: number;
  newestItem: number;
}

/**
 * 인메모리 캐시 서비스 클래스
 */
export class InMemoryCacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private hits: number = 0;
  private misses: number = 0;
  private maxSize: number;
  private defaultTTL: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxSize: number = 1000, defaultTTL: number = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL; // 5분 기본 TTL
    
    // 주기적 정리 시작 (1분마다)
    this.startCleanup();
    
    console.log(`💾 Cache service initialized (max: ${maxSize} items, TTL: ${defaultTTL}ms)`);
  }

  /**
   * 캐시에 데이터 저장
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const itemTTL = ttl || this.defaultTTL;
    
    // 캐시 크기 제한 확인
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      ttl: itemTTL,
      accessCount: 0,
      lastAccessed: now
    };

    this.cache.set(key, cacheItem);
  }

  /**
   * 캐시에서 데이터 조회
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.misses++;
      return null;
    }

    const now = Date.now();
    
    // TTL 확인
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // 접근 정보 업데이트
    item.accessCount++;
    item.lastAccessed = now;
    this.hits++;

    return item.data as T;
  }

  /**
   * 캐시에서 데이터 삭제
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 키 존재 여부 확인
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // TTL 확인
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 캐시 전체 삭제
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    console.log('🧹 Cache cleared');
  }

  /**
   * 패턴 매칭으로 키 삭제
   */
  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let deletedCount = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    console.log(`🗑️ Deleted ${deletedCount} cache items matching pattern: ${pattern}`);
    return deletedCount;
  }

  /**
   * 캐시 통계 조회
   */
  getStats(): CacheStats {
    const now = Date.now();
    let totalSize = 0;
    let oldestItem = now;
    let newestItem = 0;

    for (const item of this.cache.values()) {
      // 대략적인 크기 계산
      totalSize += JSON.stringify(item.data).length;
      
      if (item.timestamp < oldestItem) {
        oldestItem = item.timestamp;
      }
      if (item.timestamp > newestItem) {
        newestItem = item.timestamp;
      }
    }

    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;
    const missRate = totalRequests > 0 ? this.misses / totalRequests : 0;

    return {
      totalItems: this.cache.size,
      totalSize,
      hitRate: Math.round(hitRate * 100) / 100,
      missRate: Math.round(missRate * 100) / 100,
      oldestItem,
      newestItem
    };
  }

  /**
   * 만료된 항목들 조회
   */
  getExpiredKeys(): string[] {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expiredKeys.push(key);
      }
    }

    return expiredKeys;
  }

  /**
   * 특정 접두사를 가진 모든 키 조회
   */
  getKeysByPrefix(prefix: string): string[] {
    const keys: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keys.push(key);
      }
    }

    return keys;
  }

  /**
   * 캐시 항목의 TTL 업데이트
   */
  updateTTL(key: string, newTTL: number): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    item.ttl = newTTL;
    item.timestamp = Date.now(); // TTL 시작 시간 재설정
    
    return true;
  }

  /**
   * 가장 자주 접근된 키들 조회
   */
  getMostAccessedKeys(limit: number = 10): Array<{ key: string; accessCount: number }> {
    const entries = Array.from(this.cache.entries())
      .map(([key, item]) => ({ key, accessCount: item.accessCount }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);

    return entries;
  }

  // === Private Methods ===

  /**
   * LRU 방식으로 캐시 항목 제거
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < lruTime) {
        lruTime = item.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      console.log(`🗑️ Evicted LRU cache item: ${lruKey}`);
    }
  }

  /**
   * 주기적 정리 시작
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000); // 1분마다
  }

  /**
   * 만료된 캐시 항목 정리
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired cache items`);
    }
  }

  /**
   * 서비스 종료
   */
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
    console.log('🛑 Cache service shutdown');
  }
}

/**
 * 캐시 키 생성 헬퍼 함수들
 */
export const CacheKeys = {
  congestionCurrent: (location?: string, transportTypes?: string) => 
    `congestion:current:${location || 'all'}:${transportTypes || 'all'}`,
  
  congestionRoute: (routeId: string) => 
    `congestion:route:${routeId}`,
  
  prediction: (routeId: string, timeRange: number) => 
    `prediction:${routeId}:${timeRange}h`,
  
  predictionMultiple: (routeIds: string[], timeRange: number) => 
    `prediction:multiple:${routeIds.sort().join(',')}:${timeRange}h`,
  
  congestionHistory: (routeId: string, startTime: string, endTime: string, interval: string) => 
    `history:${routeId}:${startTime}:${endTime}:${interval}`,
  
  routeComparison: (routeIds: string[], timeRange: number) => 
    `compare:${routeIds.sort().join(',')}:${timeRange}h`,
  
  userRecommendations: (userId: string, origin: string, destination: string) => 
    `recommendations:${userId}:${origin}:${destination}`,
  
  weatherForecast: (hours: number) => 
    `weather:forecast:${hours}h`,
  
  serviceStatus: () => 
    'service:status'
};

// 싱글톤 인스턴스 생성
export const cacheService = new InMemoryCacheService(2000, 5 * 60 * 1000); // 2000개 항목, 5분 TTL