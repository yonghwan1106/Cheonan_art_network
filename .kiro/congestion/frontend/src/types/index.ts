// Backend와 동일한 타입 정의 (프론트엔드용)

// 혼잡도 레벨 타입
export type CongestionLevel = 'low' | 'medium' | 'high';

// 교통수단 타입
export type TransportType = 'subway' | 'bus' | 'shuttle';

// 사용자 모델
export interface User {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
  frequentRoutes: FrequentRoute[];
  points: number;
  createdAt: string;
  updatedAt: string;
}

// 사용자 선호도
export interface UserPreferences {
  congestionTolerance: CongestionLevel;
  maxWalkingDistance: number; // meters
  maxTransfers: number;
  notificationEnabled: boolean;
  notificationTiming: number; // minutes before departure
}

// 자주 이용하는 경로
export interface FrequentRoute {
  id: string;
  origin: string;
  destination: string;
  frequency: number; // times per week
  preferredTime: string; // HH:mm format
  transportType: TransportType;
}

// 혼잡도 데이터 모델
export interface CongestionData {
  id: string;
  routeId: string;
  stationId: string;
  timestamp: string;
  congestionLevel: CongestionLevel;
  congestionPercentage: number;
  passengerCount: number;
  vehicleCapacity: number;
  weatherCondition: WeatherCondition;
  specialEvents: string[];
  source: 'realtime-sensor' | 'prediction' | 'user-feedback';
  transportType: TransportType;
}

// 날씨 조건
export type WeatherCondition = 'clear' | 'cloudy' | 'rainy' | 'snowy' | 'foggy';

// 예측 모델
export interface PredictionData {
  id: string;
  routeId: string;
  predictionTime: string;
  predictions: PredictionItem[];
  modelVersion: string;
  accuracy: number;
  transportType: TransportType;
}

// 예측 항목
export interface PredictionItem {
  time: string;
  congestionLevel: CongestionLevel;
  congestionPercentage: number;
  confidence: number;
}

// 피드백 모델
export interface FeedbackData {
  id: string;
  userId: string;
  routeId: string;
  timestamp: string;
  predictedCongestion: CongestionLevel;
  actualCongestion: CongestionLevel;
  rating: number; // 1-5 scale
  comment?: string;
  verified: boolean;
}

// 경로 정보
export interface RouteInfo {
  id: string;
  name: string;
  transportType: TransportType;
  stations: StationInfo[];
  operatingHours: {
    start: string;
    end: string;
  };
  averageInterval: number; // minutes
}

// 역/정류장 정보
export interface StationInfo {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  facilities: string[];
}

// 추천 경로
export interface RecommendedRoute {
  id: string;
  origin: StationInfo;
  destination: StationInfo;
  routes: RouteSegment[];
  totalTime: number; // minutes
  totalDistance: number; // meters
  transfers: number;
  congestionScore: number; // 0-100
  incentivePoints?: number;
  confidence: number;
}

// 경로 구간
export interface RouteSegment {
  transportType: TransportType;
  routeId: string;
  routeName: string;
  fromStation: StationInfo;
  toStation: StationInfo;
  duration: number; // minutes
  congestionLevel: CongestionLevel;
  congestionPercentage: number;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// 페이지네이션
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// UI 관련 타입
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// 알림 타입
export interface NotificationItem {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// 차트 데이터 타입
export interface ChartDataPoint {
  time: string;
  congestion: number;
  prediction?: number;
  confidence?: number;
}

// 혼잡도 색상 매핑
export const CONGESTION_COLORS = {
  low: '#10b981',    // 녹색
  medium: '#f59e0b', // 노란색
  high: '#ef4444',   // 빨간색
} as const;

// 혼잡도 레벨 한글 매핑
export const CONGESTION_LABELS = {
  low: '여유',
  medium: '보통',
  high: '혼잡',
} as const;

// 교통수단 한글 매핑
export const TRANSPORT_LABELS = {
  subway: '지하철',
  bus: '버스',
  shuttle: '셔틀',
} as const;