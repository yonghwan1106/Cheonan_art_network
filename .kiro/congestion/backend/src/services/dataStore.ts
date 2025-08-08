import { 
  User, 
  CongestionData, 
  PredictionData, 
  FeedbackData, 
  RouteInfo, 
  StationInfo 
} from '../types';
import { allRoutes, allStations } from '../data/seoulTransit';

/**
 * 인메모리 데이터 저장소
 * 프로토타입용 간단한 데이터 관리 시스템
 */
class InMemoryDataStore {
  private users: Map<string, User> = new Map();
  private congestionData: Map<string, CongestionData> = new Map();
  private predictions: Map<string, PredictionData> = new Map();
  private feedback: Map<string, FeedbackData> = new Map();
  private routes: Map<string, RouteInfo> = new Map();
  private stations: Map<string, StationInfo> = new Map();

  constructor() {
    this.initializeStaticData();
    this.initializeMockUsers();
  }

  /**
   * 정적 데이터 초기화 (노선, 역 정보)
   */
  private initializeStaticData(): void {
    // 노선 정보 초기화
    allRoutes.forEach(route => {
      this.routes.set(route.id, route);
    });

    // 역 정보 초기화
    allStations.forEach(station => {
      this.stations.set(station.id, station);
    });

    console.log(`✅ Initialized ${this.routes.size} routes and ${this.stations.size} stations`);
  }

  /**
   * 목 사용자 데이터 초기화
   */
  private initializeMockUsers(): void {
    const mockUsers: User[] = [
      {
        id: 'user-001',
        email: 'demo@example.com',
        name: '김철수',
        preferences: {
          congestionTolerance: 'medium',
          maxWalkingDistance: 800,
          maxTransfers: 2,
          notificationEnabled: true,
          notificationTiming: 30
        },
        frequentRoutes: [
          {
            id: 'freq-route-001',
            origin: 'hongik-univ',
            destination: 'gangnam',
            frequency: 5,
            preferredTime: '08:30',
            transportType: 'subway'
          }
        ],
        points: 1250,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'user-002',
        email: 'test@example.com',
        name: '이영희',
        preferences: {
          congestionTolerance: 'low',
          maxWalkingDistance: 600,
          maxTransfers: 1,
          notificationEnabled: true,
          notificationTiming: 45
        },
        frequentRoutes: [
          {
            id: 'freq-route-002',
            origin: 'jamsil',
            destination: 'myeongdong',
            frequency: 3,
            preferredTime: '09:00',
            transportType: 'subway'
          }
        ],
        points: 890,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    mockUsers.forEach(user => {
      this.users.set(user.id, user);
    });

    console.log(`✅ Initialized ${this.users.size} mock users`);
  }

  // === User CRUD Operations ===
  
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      ...updates,
      id: user.id, // ID는 변경 불가
      updatedAt: new Date().toISOString()
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // === Congestion Data CRUD Operations ===

  createCongestionData(data: Omit<CongestionData, 'id'>): CongestionData {
    const newData: CongestionData = {
      ...data,
      id: `congestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.congestionData.set(newData.id, newData);
    return newData;
  }

  getCongestionDataById(id: string): CongestionData | undefined {
    return this.congestionData.get(id);
  }

  getCongestionDataByRoute(routeId: string, limit?: number): CongestionData[] {
    const data = Array.from(this.congestionData.values())
      .filter(item => item.routeId === routeId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? data.slice(0, limit) : data;
  }

  getCongestionDataByTimeRange(startTime: string, endTime: string): CongestionData[] {
    return Array.from(this.congestionData.values())
      .filter(item => {
        const timestamp = new Date(item.timestamp).getTime();
        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();
        return timestamp >= start && timestamp <= end;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // === Prediction Data CRUD Operations ===

  createPrediction(data: Omit<PredictionData, 'id'>): PredictionData {
    const newPrediction: PredictionData = {
      ...data,
      id: `prediction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.predictions.set(newPrediction.id, newPrediction);
    return newPrediction;
  }

  getPredictionById(id: string): PredictionData | undefined {
    return this.predictions.get(id);
  }

  getPredictionsByRoute(routeId: string): PredictionData[] {
    return Array.from(this.predictions.values())
      .filter(item => item.routeId === routeId)
      .sort((a, b) => new Date(b.predictionTime).getTime() - new Date(a.predictionTime).getTime());
  }

  // === Feedback CRUD Operations ===

  createFeedback(data: Omit<FeedbackData, 'id'>): FeedbackData {
    const newFeedback: FeedbackData = {
      ...data,
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.feedback.set(newFeedback.id, newFeedback);
    return newFeedback;
  }

  getFeedbackById(id: string): FeedbackData | undefined {
    return this.feedback.get(id);
  }

  getFeedbackByUser(userId: string): FeedbackData[] {
    return Array.from(this.feedback.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getFeedbackByRoute(routeId: string): FeedbackData[] {
    return Array.from(this.feedback.values())
      .filter(item => item.routeId === routeId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  updateFeedback(id: string, updates: Partial<FeedbackData>): FeedbackData | undefined {
    const feedback = this.feedback.get(id);
    if (!feedback) return undefined;

    const updatedFeedback: FeedbackData = {
      ...feedback,
      ...updates,
      id: feedback.id // ID는 변경 불가
    };

    this.feedback.set(id, updatedFeedback);
    return updatedFeedback;
  }

  // === Route and Station Operations ===

  getRouteById(id: string): RouteInfo | undefined {
    return this.routes.get(id);
  }

  getAllRoutes(): RouteInfo[] {
    return Array.from(this.routes.values());
  }

  getRoutesByType(transportType: string): RouteInfo[] {
    return Array.from(this.routes.values())
      .filter(route => route.transportType === transportType);
  }

  getStationById(id: string): StationInfo | undefined {
    return this.stations.get(id);
  }

  getAllStations(): StationInfo[] {
    return Array.from(this.stations.values());
  }

  searchStations(query: string): StationInfo[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.stations.values())
      .filter(station => 
        station.name.toLowerCase().includes(lowerQuery) ||
        station.id.toLowerCase().includes(lowerQuery)
      );
  }

  // === Utility Methods ===

  /**
   * 데이터 통계 정보 반환
   */
  getStats() {
    return {
      users: this.users.size,
      congestionData: this.congestionData.size,
      predictions: this.predictions.size,
      feedback: this.feedback.size,
      routes: this.routes.size,
      stations: this.stations.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 데이터 초기화 (테스트용)
   */
  clearAllData(): void {
    this.users.clear();
    this.congestionData.clear();
    this.predictions.clear();
    this.feedback.clear();
    
    // 정적 데이터는 다시 초기화
    this.initializeStaticData();
    this.initializeMockUsers();
  }

  /**
   * 특정 시간 이전의 오래된 데이터 정리
   */
  cleanupOldData(hoursAgo: number = 24): void {
    const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    
    // 오래된 혼잡도 데이터 삭제
    for (const [id, data] of this.congestionData.entries()) {
      if (new Date(data.timestamp) < cutoffTime) {
        this.congestionData.delete(id);
      }
    }

    // 오래된 예측 데이터 삭제
    for (const [id, prediction] of this.predictions.entries()) {
      if (new Date(prediction.predictionTime) < cutoffTime) {
        this.predictions.delete(id);
      }
    }

    console.log(`🧹 Cleaned up old data (older than ${hoursAgo} hours)`);
  }
}

// 싱글톤 인스턴스 생성
export const dataStore = new InMemoryDataStore();

// 주기적으로 오래된 데이터 정리 (1시간마다)
setInterval(() => {
  dataStore.cleanupOldData(24);
}, 60 * 60 * 1000);