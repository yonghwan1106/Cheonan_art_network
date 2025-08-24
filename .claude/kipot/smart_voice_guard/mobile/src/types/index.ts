export interface VoiceAnalysisResult {
  id: string;
  timestamp: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  keywords: string[];
  transcript: string;
  emotion: string;
  duration: number;
  phoneNumber?: string;
}

export interface DashboardStats {
  totalCalls: number;
  fraudCalls: number;
  blockedCalls: number;
  detectionRate: number;
  todayStats: {
    calls: number;
    fraud: number;
    blocked: number;
  };
}

export interface AlertNotification {
  id: string;
  type: 'high_risk' | 'system' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface UserSettings {
  notifications: boolean;
  autoBlock: boolean;
  riskThreshold: number;
  audioRecording: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type RootStackParamList = {
  Home: undefined;
  Dashboard: undefined;
  Analytics: undefined;
  Settings: undefined;
  CallDetails: { callId: string };
  Notifications: undefined;
};