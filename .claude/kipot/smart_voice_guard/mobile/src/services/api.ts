import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, VoiceAnalysisResult, DashboardStats, AlertNotification } from '@types/index';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://127.0.0.1:8000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const response = await this.api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch dashboard stats',
      };
    }
  }

  async getRecentCalls(limit: number = 10): Promise<ApiResponse<VoiceAnalysisResult[]>> {
    try {
      const response = await this.api.get(`/calls/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch recent calls',
      };
    }
  }

  async getCallDetails(callId: string): Promise<ApiResponse<VoiceAnalysisResult>> {
    try {
      const response = await this.api.get(`/calls/${callId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch call details',
      };
    }
  }

  async getNotifications(): Promise<ApiResponse<AlertNotification[]>> {
    try {
      const response = await this.api.get('/notifications');
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch notifications',
      };
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to mark notification as read',
      };
    }
  }

  async analyzeVoice(audioFile: FormData): Promise<ApiResponse<VoiceAnalysisResult>> {
    try {
      const response = await this.api.post('/voice/analyze', audioFile, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to analyze voice',
      };
    }
  }

  async updateSettings(settings: any): Promise<ApiResponse<void>> {
    try {
      const response = await this.api.put('/settings', settings);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update settings',
      };
    }
  }
}

export default new ApiService();