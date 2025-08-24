import axios from 'axios';

// 환경변수에서 API URL 가져오기
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API 함수들
export const apiService = {
  // 서버 상태 확인
  healthCheck: () => api.get('/health'),
  
  // 음성 분석
  analyzeAudio: (formData: FormData) => 
    api.post('/analyze-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  // 텍스트 분석
  analyzeText: (text: string) => 
    api.post('/analyze-text', { text }),
  
  // 통계 조회
  getStats: () => api.get('/stats'),
  
  // 키워드 관리
  getKeywords: () => api.get('/keywords'),
  addKeyword: (keyword: string, category: string, weight: number) => 
    api.post('/keywords', { keyword, category, weight }),
  deleteKeyword: (keywordId: string) => 
    api.delete(`/keywords/${keywordId}`),
};

export default api;