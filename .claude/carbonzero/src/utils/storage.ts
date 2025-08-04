import { Certificate, UserPreferences, MatchResult } from '../types';

const STORAGE_KEYS = {
  CERTIFICATES: 'carbonzero_certificates',
  USER_PREFERENCES: 'carbonzero_prefs',
  MATCH_HISTORY: 'carbonzero_match_history',
  USER_SESSION: 'carbonzero_session'
} as const;

export const storage = {
  // 인증서 관리
  saveCertificates: (certificates: Certificate[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certificates));
    } catch (error) {
      console.error('Failed to save certificates:', error);
    }
  },
  
  loadCertificates: (): Certificate[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load certificates:', error);
      return [];
    }
  },
  
  // 사용자 설정 관리
  saveUserPreferences: (prefs: UserPreferences): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(prefs));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  },
  
  loadUserPreferences: (): UserPreferences | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return null;
    }
  },
  
  // 매칭 이력 관리
  saveMatchHistory: (matches: MatchResult[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(matches));
    } catch (error) {
      console.error('Failed to save match history:', error);
    }
  },
  
  loadMatchHistory: (): MatchResult[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load match history:', error);
      return [];
    }
  },
  
  // 세션 관리
  saveSession: (sessionData: any): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  },
  
  loadSession: (): any => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  },
  
  // 특정 키 삭제
  remove: (key: keyof typeof STORAGE_KEYS): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS[key]);
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
    }
  },
  
  // 모든 데이터 삭제
  clear: (): void => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
};