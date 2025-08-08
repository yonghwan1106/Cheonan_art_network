import { mockPredictionEngine, PredictionContext } from './predictionEngine';
import { congestionGenerator } from './congestionGenerator';
import { weatherGenerator } from './weatherGenerator';
import { eventGenerator } from './eventGenerator';
import { feedbackIntegration } from './feedbackIntegration';
import { accuracySimulation } from './accuracySimulation';
import { dataStore } from './dataStore';
import { PredictionData, CongestionData } from '../types';

/**
 * 통합 예측 서비스 상태
 */
export interface PredictionServiceStatus {
  isRunning: boolean;
  lastUpdate: string;
  totalPredictions: number;
  averageAccuracy: number;
  activeRoutes: number;
  systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
  uptime: number; // seconds
}

/**
 * 예측 서비스 설정
 */
export interface PredictionServiceConfig {
  updateInterval: number; // minutes
  predictionHorizon: number; // hours
  granularity: number; // minutes
  enableAccuracyMonitoring: boolean;
  enableFeedbackIntegration: boolean;
  cacheTimeout: number; // minutes
}

/**
 * 통합 예측 서비스
 * 모든 예측 관련 서비스를 통합하여 관리합니다.
 */
export class IntegratedPredictionService {
  private isRunning = false;
  private startTime: Date | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  
  private readonly defaultConfig: PredictionServiceConfig = {
    updateInterval: 15, // 15분마다 업데이트
    predictionHorizon: 3, // 3시간 예측
    granularity: 15, // 15분 간격
    enableAccuracyMonitoring: true,
    enableFeedbackIntegration: true,
    cacheTimeout: 30 // 30분 캐시
  };

  private config: PredictionServiceConfig;

  constructor(config?: Partial<PredictionServiceConfig>) {
    this.config = { ...this.defaultConfig, ...config };
  }

  /**
   * 예측 서비스 시작
   */
  async startService(): Promise<void> {
    if (this.isRunning) {
      console.warn('Prediction service is already running');
      return;
    }

    console.log('🚀 Starting Integrated Prediction Service...');
    
    this.isRunning = true;
    this.startTime = new Date();

    // 초기 데이터 생성
    await this.initializeData();

    // 정기 업데이트 시작
    this.startPeriodicUpdates();

    // 정확도 모니터링 시작 (설정된 경우)
    if (this.config.enableAccuracyMonitoring) {
      this.startAccuracyMonitoring();
    }

    // 피드백 통합 시작 (설정된 경우)
    if (this.config.enableFeedbackIntegration) {
      this.startFeedbackIntegration();
    }

    console.log('✅ Integrated Prediction Service started successfully');
    console.log(`   - Update interval: ${this.config.updateInterval} minutes`);
    console.log(`   - Prediction horizon: ${this.config.predictionHorizon} hours`);
    console.log(`   - Granularity: ${this.config.granularity} minutes`);
  }

  /**
   * 예측 서비스 중지
   */
  stopService(): void {
    if (!this.isRunning) {
      console.warn('Prediction service is not running');
      return;
    }

    console.log('🛑 Stopping Integrated Prediction Service...');

    this.isRunning = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('✅ Integrated Prediction Service stopped');
  }

  /**
   * 서비스 상태 조회
   */
  getServiceStatus(): PredictionServiceStatus {
    const uptime = this.startTime 
      ? Math.floor((Date.now() - this.startTime.getTime()) / 1000)
      : 0;

    // 전체 예측 수 계산
    const allRoutes = dataStore.getAllRoutes();
    let totalPredictions = 0;
    let totalAccuracy = 0;
    let routeCount = 0;

    allRoutes.forEach(route => {
      const predictions = dataStore.getPredictionsByRoute(route.id);
      totalPredictions += predictions.length;
      
      if (predictions.length > 0) {
        const avgAccuracy = predictions.reduce((sum, p) => sum + p.accuracy, 0) / predictions.length;
        totalAccuracy += avgAccuracy;
        routeCount++;
      }
    });

    const averageAccuracy = routeCount > 0 ? totalAccuracy / routeCount : 0;
    const systemHealth = this.calculateSystemHealth(averageAccuracy, uptime);

    return {
      isRunning: this.isRunning,
      lastUpdate: new Date().toISOString(),
      totalPredictions,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      activeRoutes: routeCount,
      systemHealth,
      uptime
    };
  }

  /**
   * 특정 노선 예측 조회
   */
  async getRoutePrediction(routeId: string, hours?: number): Promise<PredictionData | null> {
    const timeHorizon = hours || this.config.predictionHorizon;
    const currentTime = new Date();
    
    // 최근 예측 데이터 확인
    const recentPredictions = dataStore.getPredictionsByRoute(routeId);
    if (recentPredictions.length === 0) {
      // 새로운 예측 생성
      const context = await this.buildPredictionContext(routeId, currentTime, timeHorizon);
      return await mockPredictionEngine.predictCongestion(context);
    }
    
    const latestPrediction = recentPredictions
      .sort((a, b) => new Date(b.predictionTime).getTime() - new Date(a.predictionTime).getTime())[0];

    // 캐시된 예측이 유효한지 확인
    if (latestPrediction && this.isPredictionValid(latestPrediction)) {
      return latestPrediction;
    }

    // 새로운 예측 생성
    const context = await this.buildPredictionContext(routeId, currentTime, timeHorizon);
    return await mockPredictionEngine.predictCongestion(context);
  }

  /**
   * 다중 노선 예측 조회
   */
  async getMultipleRoutePredictions(routeIds: string[], hours?: number): Promise<PredictionData[]> {
    const timeHorizon = hours || this.config.predictionHorizon;
    const predictions: PredictionData[] = [];

    for (const routeId of routeIds) {
      try {
        const prediction = await this.getRoutePrediction(routeId, timeHorizon);
        if (prediction) {
          predictions.push(prediction);
        }
      } catch (error) {
        console.error(`Failed to get prediction for ${routeId}:`, error);
      }
    }

    return predictions;
  }

  /**
   * 실시간 혼잡도와 예측 비교
   */
  async compareRealtimeWithPrediction(routeId: string): Promise<{
    current: CongestionData[];
    predictions: PredictionData | null;
    comparison: {
      accuracy: number;
      avgError: number;
      trend: 'improving' | 'stable' | 'declining';
    };
  }> {
    // 현재 혼잡도 데이터
    const current = congestionGenerator.generateRouteRealtime(routeId);
    
    // 예측 데이터
    const predictions = await this.getRoutePrediction(routeId, 1);
    
    // 비교 분석
    let comparison: {
      accuracy: number;
      avgError: number;
      trend: 'improving' | 'stable' | 'declining';
    } = {
      accuracy: 0,
      avgError: 0,
      trend: 'stable'
    };

    if (predictions && predictions.predictions && current.length > 0) {
      // 현재 시간과 가장 가까운 예측 찾기
      const now = new Date();
      const closestPrediction = predictions.predictions.find(p => {
        const predTime = new Date(p.time);
        return Math.abs(predTime.getTime() - now.getTime()) < 30 * 60 * 1000; // 30분 이내
      });

      if (closestPrediction) {
        const currentAvg = current.reduce((sum, c) => sum + c.congestionPercentage, 0) / current.length;
        const error = Math.abs(closestPrediction.congestionPercentage - currentAvg);
        
        comparison = {
          accuracy: Math.max(0, 1 - error / 50), // 50% 오차를 기준으로 정확도 계산
          avgError: error,
          trend: this.calculateTrend(routeId)
        };
      }
    }

    return { current, predictions, comparison };
  }

  /**
   * 예측 성능 리포트 생성
   */
  async generatePerformanceReport(routeId?: string): Promise<{
    summary: {
      totalPredictions: number;
      averageAccuracy: number;
      lastWeekAccuracy: number;
      improvementRate: number;
    };
    detailedAnalysis: any;
    recommendations: string[];
  }> {
    let totalPredictions = 0;
    let totalAccuracy = 0;
    let routesToAnalyze: string[] = [];

    if (routeId) {
      routesToAnalyze = [routeId];
    } else {
      routesToAnalyze = dataStore.getAllRoutes().map(r => r.id);
    }

    // 기본 통계 수집
    routesToAnalyze.forEach(rId => {
      const predictions = dataStore.getPredictionsByRoute(rId);
      totalPredictions += predictions.length;
      
      if (predictions.length > 0) {
        const avgAccuracy = predictions.reduce((sum, p) => sum + p.accuracy, 0) / predictions.length;
        totalAccuracy += avgAccuracy;
      }
    });

    const averageAccuracy = routesToAnalyze.length > 0 ? totalAccuracy / routesToAnalyze.length : 0;

    // 지난 주 정확도 계산 (시뮬레이션)
    const lastWeekAccuracy = averageAccuracy * (0.95 + Math.random() * 0.1); // 약간의 변동

    // 개선율 계산
    const improvementRate = ((averageAccuracy - lastWeekAccuracy) / lastWeekAccuracy) * 100;

    // 상세 분석
    let detailedAnalysis = {};
    if (routeId) {
      try {
        detailedAnalysis = await accuracySimulation.runAccuracySimulation(routeId, 24);
      } catch (error) {
        console.warn(`Failed to run detailed analysis for ${routeId}:`, error);
      }
    }

    // 권장사항 생성
    const recommendations = this.generatePerformanceRecommendations(averageAccuracy, improvementRate);

    return {
      summary: {
        totalPredictions,
        averageAccuracy: Math.round(averageAccuracy * 100) / 100,
        lastWeekAccuracy: Math.round(lastWeekAccuracy * 100) / 100,
        improvementRate: Math.round(improvementRate * 100) / 100
      },
      detailedAnalysis,
      recommendations
    };
  }

  // === Private Helper Methods ===

  private async initializeData(): Promise<void> {
    console.log('📊 Initializing prediction data...');
    
    // 기본 혼잡도 데이터 생성
    const initialCongestionData = congestionGenerator.generateCurrentCongestion();
    console.log(`   - Generated ${initialCongestionData.length} congestion data points`);

    // 과거 데이터 생성 (7일)
    const historicalData = congestionGenerator.generateHistoricalData(7);
    console.log(`   - Generated ${historicalData.length} historical data points`);

    // 초기 예측 생성
    const allRoutes = dataStore.getAllRoutes();
    const routeIds = allRoutes.map(r => r.id).slice(0, 5); // 처음 5개 노선만
    
    try {
      const initialPredictions = await mockPredictionEngine.predictMultipleRoutes(
        routeIds, 
        this.config.predictionHorizon
      );
      console.log(`   - Generated initial predictions for ${initialPredictions.length} routes`);
    } catch (error) {
      console.warn('Failed to generate initial predictions:', error);
    }
  }

  private startPeriodicUpdates(): void {
    this.updateInterval = setInterval(async () => {
      try {
        await this.performPeriodicUpdate();
      } catch (error) {
        console.error('Error during periodic update:', error);
      }
    }, this.config.updateInterval * 60 * 1000);

    console.log(`⏰ Periodic updates scheduled every ${this.config.updateInterval} minutes`);
  }

  private async performPeriodicUpdate(): Promise<void> {
    console.log('🔄 Performing periodic prediction update...');
    
    // 새로운 혼잡도 데이터 생성
    const newCongestionData = congestionGenerator.generateCurrentCongestion();
    
    // 예측 업데이트
    await mockPredictionEngine.updateRealtimePredictions();
    
    // 피드백 기반 모델 조정 (설정된 경우)
    if (this.config.enableFeedbackIntegration) {
      const allRoutes = dataStore.getAllRoutes();
      allRoutes.forEach(route => {
        feedbackIntegration.adjustModelBasedOnFeedback(route.id);
      });
    }

    console.log('✅ Periodic update completed');
  }

  private startAccuracyMonitoring(): void {
    const allRoutes = dataStore.getAllRoutes();
    const routeIds = allRoutes.map(r => r.id);
    
    accuracySimulation.startAccuracyMonitoring(routeIds);
    
    console.log('📈 Accuracy monitoring started');
  }

  private startFeedbackIntegration(): void {
    // 피드백 통합 시뮬레이션 시작
    setInterval(() => {
      this.simulateFeedbackGeneration();
    }, 30 * 60 * 1000); // 30분마다

    console.log('💬 Feedback integration started');
  }

  private simulateFeedbackGeneration(): void {
    const allRoutes = dataStore.getAllRoutes();
    const users = dataStore.getAllUsers();
    
    if (!users || users.length === 0 || !allRoutes || allRoutes.length === 0) {
      return;
    }

    // 랜덤하게 몇 개의 피드백 생성
    const feedbackCount = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < feedbackCount; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomRoute = allRoutes[Math.floor(Math.random() * allRoutes.length)];
      
      if (!randomUser || !randomRoute) continue;
      
      // 랜덤한 예측/실제 레벨 생성
      const levels = ['low', 'medium', 'high'] as const;
      const predictedLevel = levels[Math.floor(Math.random() * levels.length)];
      const actualLevel = levels[Math.floor(Math.random() * levels.length)];
      
      try {
        feedbackIntegration.generateMockFeedback(
          randomUser.id,
          randomRoute.id,
          predictedLevel,
          actualLevel
        );
      } catch (error) {
        console.warn('Failed to generate mock feedback:', error);
      }
    }
  }

  private async buildPredictionContext(
    routeId: string, 
    currentTime: Date, 
    timeHorizon: number
  ): Promise<PredictionContext> {
    const historicalData = dataStore.getCongestionDataByRoute(routeId, 24) || [];
    const weatherForecast = weatherGenerator.generateWeatherForecast(timeHorizon);
    const activeEvents = eventGenerator.getActiveEvents()
      .filter(e => e && e.location && e.location.routeIds && e.location.routeIds.includes(routeId));

    return {
      routeId,
      currentTime,
      historicalData,
      weatherForecast,
      activeEvents,
      timeHorizon,
      granularity: this.config.granularity
    };
  }

  private isPredictionValid(prediction: PredictionData): boolean {
    const predictionTime = new Date(prediction.predictionTime);
    const now = new Date();
    const ageMinutes = (now.getTime() - predictionTime.getTime()) / (1000 * 60);
    
    return ageMinutes < this.config.cacheTimeout;
  }

  private calculateSystemHealth(averageAccuracy: number, uptime: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (averageAccuracy > 0.9 && uptime > 3600) return 'excellent';
    if (averageAccuracy > 0.8 && uptime > 1800) return 'good';
    if (averageAccuracy > 0.7 && uptime > 900) return 'fair';
    return 'poor';
  }

  private calculateTrend(routeId: string): 'improving' | 'stable' | 'declining' {
    // 간단한 트렌드 계산 (실제로는 더 복잡한 로직 필요)
    const predictions = dataStore.getPredictionsByRoute(routeId);
    if (predictions.length < 2) return 'stable';

    const recent = predictions.slice(-5); // 최근 5개
    const older = predictions.slice(-10, -5); // 그 이전 5개

    if (recent.length === 0 || older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, p) => sum + p.accuracy, 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + p.accuracy, 0) / older.length;

    const diff = recentAvg - olderAvg;
    
    if (diff > 0.05) return 'improving';
    if (diff < -0.05) return 'declining';
    return 'stable';
  }

  private generatePerformanceRecommendations(averageAccuracy: number, improvementRate: number): string[] {
    const recommendations: string[] = [];

    if (averageAccuracy < 0.7) {
      recommendations.push('긴급: 예측 모델 전면 재검토 필요');
      recommendations.push('기본 알고리즘 정확도 개선 우선 진행');
    } else if (averageAccuracy < 0.8) {
      recommendations.push('예측 정확도 개선을 위한 파라미터 튜닝 권장');
    }

    if (improvementRate < -5) {
      recommendations.push('성능 저하 추세 - 모델 재학습 필요');
    } else if (improvementRate > 5) {
      recommendations.push('성능 개선 추세 유지 - 현재 전략 지속');
    }

    if (recommendations.length === 0) {
      recommendations.push('현재 성능 수준 양호 - 정기 모니터링 지속');
    }

    return recommendations;
  }
}

// 싱글톤 인스턴스 생성
export const integratedPredictionService = new IntegratedPredictionService();