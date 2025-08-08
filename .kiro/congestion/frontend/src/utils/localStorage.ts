import { User, UserPreferences, FrequentRoute } from '../types';

/**
 * LocalStorage 기반 클라이언트 데이터 관리
 * 프로토타입용 간단한 데이터 영속성 제공
 */

const STORAGE_KEYS = {
  USER: 'congestion-app-user',
  PREFERENCES: 'congestion-app-preferences',
  FREQUENT_ROUTES: 'congestion-app-frequent-routes',
  RECENT_SEARCHES: 'congestion-app-recent-searches',
  NOTIFICATIONS: 'congestion-app-notifications',
  THEME: 'congestion-app-theme',
} as const;

/**
 * 안전한 JSON 파싱
 */
function safeJsonParse<T>(value: string | null, defaultValue: T): T {
  if (!value) return defaultValue;
  
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('Failed to parse JSON from localStorage:', error);
    return defaultValue;
  }
}

/**
 * 안전한 localStorage 저장
 */
function safeSetItem(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

// === User Data Management ===

export const userStorage = {
  /**
   * 현재 사용자 정보 저장
   */
  setUser(user: User): boolean {
    return safeSetItem(STORAGE_KEYS.USER, user);
  },

  /**
   * 현재 사용자 정보 조회
   */
  getUser(): User | null {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return safeJsonParse(userData, null);
  },

  /**
   * 사용자 정보 삭제 (로그아웃)
   */
  removeUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  /**
   * 사용자 선호도 업데이트
   */
  updatePreferences(preferences: UserPreferences): boolean {
    const user = this.getUser();
    if (!user) return false;

    const updatedUser: User = {
      ...user,
      preferences,
      updatedAt: new Date().toISOString(),
    };

    return this.setUser(updatedUser);
  },

  /**
   * 자주 이용하는 경로 추가
   */
  addFrequentRoute(route: FrequentRoute): boolean {
    const user = this.getUser();
    if (!user) return false;

    const existingRouteIndex = user.frequentRoutes.findIndex(r => r.id === route.id);
    
    if (existingRouteIndex >= 0) {
      // 기존 경로 업데이트
      user.frequentRoutes[existingRouteIndex] = route;
    } else {
      // 새 경로 추가
      user.frequentRoutes.push(route);
    }

    user.updatedAt = new Date().toISOString();
    return this.setUser(user);
  },

  /**
   * 자주 이용하는 경로 삭제
   */
  removeFrequentRoute(routeId: string): boolean {
    const user = this.getUser();
    if (!user) return false;

    user.frequentRoutes = user.frequentRoutes.filter(r => r.id !== routeId);
    user.updatedAt = new Date().toISOString();
    
    return this.setUser(user);
  },

  /**
   * 포인트 업데이트
   */
  updatePoints(points: number): boolean {
    const user = this.getUser();
    if (!user) return false;

    user.points = points;
    user.updatedAt = new Date().toISOString();
    
    return this.setUser(user);
  },
};

// === Recent Searches Management ===

export interface RecentSearch {
  id: string;
  origin: string;
  destination: string;
  timestamp: string;
}

export const searchStorage = {
  /**
   * 최근 검색 기록 조회
   */
  getRecentSearches(): RecentSearch[] {
    const searches = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    return safeJsonParse(searches, []);
  },

  /**
   * 새 검색 기록 추가
   */
  addRecentSearch(origin: string, destination: string): boolean {
    const searches = this.getRecentSearches();
    
    // 중복 검색 제거
    const filteredSearches = searches.filter(
      s => !(s.origin === origin && s.destination === destination)
    );

    const newSearch: RecentSearch = {
      id: `search-${Date.now()}`,
      origin,
      destination,
      timestamp: new Date().toISOString(),
    };

    // 최대 10개까지만 저장
    const updatedSearches = [newSearch, ...filteredSearches].slice(0, 10);
    
    return safeSetItem(STORAGE_KEYS.RECENT_SEARCHES, updatedSearches);
  },

  /**
   * 검색 기록 삭제
   */
  removeRecentSearch(searchId: string): boolean {
    const searches = this.getRecentSearches();
    const filteredSearches = searches.filter(s => s.id !== searchId);
    
    return safeSetItem(STORAGE_KEYS.RECENT_SEARCHES, filteredSearches);
  },

  /**
   * 모든 검색 기록 삭제
   */
  clearRecentSearches(): void {
    localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
  },
};

// === Notifications Management ===

export interface StoredNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  persistent?: boolean; // 지속적으로 표시할지 여부
}

export const notificationStorage = {
  /**
   * 알림 목록 조회
   */
  getNotifications(): StoredNotification[] {
    const notifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return safeJsonParse(notifications, []);
  },

  /**
   * 새 알림 추가
   */
  addNotification(notification: Omit<StoredNotification, 'id' | 'timestamp'>): boolean {
    const notifications = this.getNotifications();
    
    const newNotification: StoredNotification = {
      ...notification,
      id: `notification-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    const updatedNotifications = [newNotification, ...notifications].slice(0, 50); // 최대 50개
    
    return safeSetItem(STORAGE_KEYS.NOTIFICATIONS, updatedNotifications);
  },

  /**
   * 알림 읽음 처리
   */
  markAsRead(notificationId: string): boolean {
    const notifications = this.getNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.read = true;
      return safeSetItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
    
    return false;
  },

  /**
   * 모든 알림 읽음 처리
   */
  markAllAsRead(): boolean {
    const notifications = this.getNotifications();
    notifications.forEach(n => n.read = true);
    
    return safeSetItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },

  /**
   * 알림 삭제
   */
  removeNotification(notificationId: string): boolean {
    const notifications = this.getNotifications();
    const filteredNotifications = notifications.filter(n => n.id !== notificationId);
    
    return safeSetItem(STORAGE_KEYS.NOTIFICATIONS, filteredNotifications);
  },

  /**
   * 읽은 알림 모두 삭제
   */
  clearReadNotifications(): boolean {
    const notifications = this.getNotifications();
    const unreadNotifications = notifications.filter(n => !n.read);
    
    return safeSetItem(STORAGE_KEYS.NOTIFICATIONS, unreadNotifications);
  },
};

// === Theme Management ===

export type Theme = 'light' | 'dark' | 'system';

export const themeStorage = {
  /**
   * 테마 설정 조회
   */
  getTheme(): Theme {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    return (theme as Theme) || 'system';
  },

  /**
   * 테마 설정 저장
   */
  setTheme(theme: Theme): boolean {
    return safeSetItem(STORAGE_KEYS.THEME, theme);
  },
};

// === Utility Functions ===

/**
 * 모든 앱 데이터 삭제 (초기화)
 */
export function clearAllAppData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * 저장된 데이터 크기 확인 (디버깅용)
 */
export function getStorageSize(): { [key: string]: number } {
  const sizes: { [key: string]: number } = {};
  
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const value = localStorage.getItem(key);
    sizes[name] = value ? new Blob([value]).size : 0;
  });
  
  return sizes;
}

/**
 * localStorage 사용 가능 여부 확인
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}