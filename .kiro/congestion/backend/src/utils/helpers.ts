import { CongestionLevel, WeatherCondition, TransportType } from '../types';

/**
 * 유틸리티 함수 모음
 */

/**
 * UUID 생성 (간단한 버전)
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}-${timestamp}-${randomStr}` : `${timestamp}-${randomStr}`;
}

/**
 * 현재 시간을 ISO 문자열로 반환
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * 시간 문자열을 Date 객체로 변환
 */
export function parseTimestamp(timestamp: string): Date {
  return new Date(timestamp);
}

/**
 * 두 시간 사이의 차이를 분 단위로 계산
 */
export function getMinutesDifference(start: string, end: string): number {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  return Math.floor((endTime - startTime) / (1000 * 60));
}

/**
 * 혼잡도 퍼센티지를 레벨로 변환
 */
export function getCongestionLevel(percentage: number): CongestionLevel {
  if (percentage <= 40) return 'low';
  if (percentage <= 70) return 'medium';
  return 'high';
}

/**
 * 혼잡도 레벨을 퍼센티지 범위로 변환
 */
export function getCongestionPercentageRange(level: CongestionLevel): { min: number; max: number } {
  switch (level) {
    case 'low':
      return { min: 0, max: 40 };
    case 'medium':
      return { min: 41, max: 70 };
    case 'high':
      return { min: 71, max: 100 };
  }
}

/**
 * 랜덤 혼잡도 퍼센티지 생성
 */
export function generateRandomCongestion(level?: CongestionLevel): number {
  if (!level) {
    return Math.floor(Math.random() * 100);
  }
  
  const range = getCongestionPercentageRange(level);
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

/**
 * 시간대별 혼잡도 패턴 생성
 */
export function getCongestionByTimePattern(hour: number, minute: number = 0): CongestionLevel {
  const timeInMinutes = hour * 60 + minute;
  
  // 출근 시간대 (7:00-9:30)
  if (timeInMinutes >= 420 && timeInMinutes <= 570) {
    return Math.random() > 0.3 ? 'high' : 'medium';
  }
  
  // 점심 시간대 (11:30-13:30)
  if (timeInMinutes >= 690 && timeInMinutes <= 810) {
    return Math.random() > 0.5 ? 'medium' : 'low';
  }
  
  // 퇴근 시간대 (17:30-20:00)
  if (timeInMinutes >= 1050 && timeInMinutes <= 1200) {
    return Math.random() > 0.2 ? 'high' : 'medium';
  }
  
  // 심야 시간대 (22:00-05:00)
  if (timeInMinutes >= 1320 || timeInMinutes <= 300) {
    return 'low';
  }
  
  // 기타 시간대
  return Math.random() > 0.6 ? 'medium' : 'low';
}

/**
 * 날씨에 따른 혼잡도 보정
 */
export function adjustCongestionForWeather(
  baseCongestion: number, 
  weather: WeatherCondition
): number {
  let adjustment = 0;
  
  switch (weather) {
    case 'rainy':
      adjustment = 15; // 비 오는 날 혼잡도 증가
      break;
    case 'snowy':
      adjustment = 25; // 눈 오는 날 혼잡도 크게 증가
      break;
    case 'foggy':
      adjustment = 10; // 안개 낀 날 약간 증가
      break;
    case 'clear':
      adjustment = -5; // 맑은 날 약간 감소
      break;
    case 'cloudy':
    default:
      adjustment = 0; // 흐린 날은 변화 없음
      break;
  }
  
  return Math.max(0, Math.min(100, baseCongestion + adjustment));
}

/**
 * 교통수단별 기본 혼잡도 패턴
 */
export function getBaselineByTransportType(transportType: TransportType): number {
  switch (transportType) {
    case 'subway':
      return 60; // 지하철은 기본적으로 높은 이용률
    case 'bus':
      return 45; // 버스는 중간 정도
    case 'shuttle':
      return 30; // 셔틀은 상대적으로 낮음
    default:
      return 50;
  }
}

/**
 * 거리 계산 (Haversine formula)
 */
export function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // 미터 단위로 반환
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 배열을 무작위로 섞기
 */
export function shuffleArray<T>(array: T[]): T[] {
  if (!array || array.length === 0) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

/**
 * 배열에서 랜덤 요소 선택
 */
export function getRandomElement<T>(array: T[]): T | undefined {
  if (!array || array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 숫자를 범위 내로 제한
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * 퍼센티지를 색상으로 변환 (혼잡도 시각화용)
 */
export function getColorByPercentage(percentage: number): string {
  if (percentage <= 40) return '#10b981'; // 녹색
  if (percentage <= 70) return '#f59e0b'; // 노란색
  return '#ef4444'; // 빨간색
}

/**
 * 시간 문자열 포맷팅 (HH:mm)
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}

/**
 * 날짜 문자열 포맷팅
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
}

/**
 * 상대적 시간 표시 (예: "3분 전", "1시간 후")
 */
export function getRelativeTime(timestamp: string): string {
  if (!timestamp) return '알 수 없음';
  
  const now = new Date();
  const target = new Date(timestamp);
  
  // Invalid date check
  if (isNaN(target.getTime()) || isNaN(now.getTime())) {
    return '알 수 없음';
  }
  
  const diffMs = target.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (Math.abs(diffMinutes) < 1) {
    return '방금';
  }
  
  if (diffMinutes > 0) {
    // 미래
    if (diffMinutes < 60) {
      return `${diffMinutes}분 후`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours}시간 후`;
    }
  } else {
    // 과거
    const absDiffMinutes = Math.abs(diffMinutes);
    if (absDiffMinutes < 60) {
      return `${absDiffMinutes}분 전`;
    } else {
      const hours = Math.floor(absDiffMinutes / 60);
      return `${hours}시간 전`;
    }
  }
}

/**
 * 데이터 검증 함수들
 */
export const validators = {
  isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidCongestionLevel(level: string): level is CongestionLevel {
    if (!level || typeof level !== 'string') return false;
    return ['low', 'medium', 'high'].includes(level);
  },

  isValidTransportType(type: string): type is TransportType {
    if (!type || typeof type !== 'string') return false;
    return ['subway', 'bus', 'shuttle'].includes(type);
  },

  isValidWeatherCondition(condition: string): condition is WeatherCondition {
    if (!condition || typeof condition !== 'string') return false;
    return ['clear', 'cloudy', 'rainy', 'snowy', 'foggy'].includes(condition);
  },

  isValidRating(rating: number): boolean {
    return typeof rating === 'number' && Number.isInteger(rating) && rating >= 1 && rating <= 5;
  },
};