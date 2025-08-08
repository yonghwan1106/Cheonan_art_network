import { 
  PredictionData, 
  PredictionItem, 
  CongestionData, 
  CongestionLevel, 
  WeatherCondition,
  TransportType 
} from '../types';
import { 
  generateId, 
  getCurrentTimestamp, 
  getCongestionByTimePattern,
  adjustCongestionForWeather,
  getBaselineByTransportType,
  clamp
} from '../utils/helpers';
import { dataStore } from './dataStore';
import { weatherGenerator, WeatherData } from './weatherGenerator';
import { eventGenerator, EventData } from './eventGenerator';
import { dataVariationService, VariationPattern } from './dataVariationService';

/**
 * 예측 정확도 메트릭
 */
export interface PredictionAccuracy {
  mae: number; // Mean Absolute Error
  rmse: number; // Root Mean Square Error
  mape: number; // Mean Absolute Percentage Error
  accuracy: number; // Overall accuracy (0-1)
  confidence: number; // Confidence level (0-1)
}

/**
 * 예측 컨텍스트
 */
export interface PredictionContext {
  routeId: string;
  currentTime: Date;
  historicalData: CongestionData[];
  weatherForecast: WeatherData[];
  activeEvents: EventData[];
  timeHorizon: number; // hours
  granularity: number; // minutes
}

/**
 * 목 예측 엔진
 * 규칙 기반 알고리즘으로 현실적인 혼잡도 예측을 생성합니다.
 */
export class MockPredictionEngine {
  private readonly modelVersion = 'mock-v1.2.3';
  private readonly baseAccuracy = 0.85;
  private predictionCache: Map<string, PredictionData> = new Map();

  /**
   * 단일 노선 혼잡도 예측
   */
  async predictCongestion(context: PredictionContext): Promise<PredictionData> {
    const cacheKey = this.generateCacheKey(context);
    
    // 캐시된 예측이 있고 5분 이내라면 반환
    const cached = this.predictionCache.get(cacheKey);
    if (cached && this.isCacheValid(cached, 5)) {
      return cached;
    }

    const predictions: PredictionItem[] = [];
    const startTime = context.currentTime;
    
    // 예측 시간 범위 생성
    for (let i = 0; i < context.timeHorizon * (60 / context.granularity); i++) {
      const predictionTime = new Date(startTime.getTime() + i * context.granularity * 60 * 1000);
      const prediction = await this.predictSingleTimePoint(context, predictionTime, i);
      predictions.push(prediction);
    }

    // 예측 정확도 계산
    const accuracy = this.calculatePredictionAccuracy(context, predictions);

    const predictionData: PredictionData = {
      id: generateId('prediction'),
      routeId: context.routeId,
      predictionTime: getCurrentTimestamp(),
      predictions,
      modelVersion: this.modelVersion,
      accuracy: accuracy.accuracy,
      transportType: this.getTransportType(context.routeId)
    };

    // 캐시에 저장
    this.predictionCache.set(cacheKey, predictionData);
    
    // 데이터 저장소에 저장
    dataStore.createPrediction(predictionData);

    return predictionData;
  }

  /**
   * 다중 노선 예측
   */
  async predictMultipleRoutes(routeIds: string[], timeHorizon: number = 3): Promise<PredictionData[]> {
    const predictions: PredictionData[] = [];
    const currentTime = new Date();
    
    // 공통 컨텍스트 데이터 수집
    const weatherForecast = weatherGenerator.generateWeatherForecast(timeHorizon);
    const activeEvents = eventGenerator.getActiveEvents();

    for (const routeId of routeIds) {
      const historicalData = dataStore.getCongestionDataByRoute(routeId, 24); // 최근 24개 데이터
      
      const context: PredictionContext = {
        routeId,
        currentTime,
        historicalData,
        weatherForecast,
        activeEvents: activeEvents.filter(e => e.location.routeIds.includes(routeId)),
        timeHorizon,
        granularity: 15 // 15분 간격
      };

      const prediction = await this.predictCongestion(context);
      predictions.push(prediction);
    }

    return predictions;
  }

  /**
   * 실시간 예측 업데이트
   */
  async updateRealtimePredictions(): Promise<void> {
    const allRoutes = dataStore.getAllRoutes();
    const routeIds = allRoutes.map(r => r.id);
    
    try {
      const predictions = await this.predictMultipleRoutes(routeIds, 2); // 2시간 예측
      console.log(`🔮 Updated predictions for ${predictions.length} routes`);
    } catch (error) {
      console.error('Failed to update realtime predictions:', error);
    }
  }

  /**
   * 예측 정확도 검증
   */
  validatePredictionAccuracy(
    predictions: PredictionItem[], 
    actualData: CongestionData[]
  ): PredictionAccuracy {
    if (predictions.length === 0 || actualData.length === 0) {
      return {
        mae: 0,
        rmse: 0,
        mape: 0,
        accuracy: 0,
        confidence: 0
      };
    }

    const errors: number[] = [];
    const percentageErrors: number[] = [];
    
    // 시간 매칭하여 오차 계산
    predictions.forEach(pred => {
      const actual = actualData.find(a => 
        Math.abs(new Date(a.timestamp).getTime() - new Date(pred.time).getTime()) < 5 * 60 * 1000 // 5분 오차 허용
      );
      
      if (actual) {
        const error = Math.abs(pred.congestionPercentage - actual.congestionPercentage);
        errors.push(error);
        
        if (actual.congestionPercentage > 0) {
          percentageErrors.push((error / actual.congestionPercentage) * 100);
        }
      }
    });

    if (errors.length === 0) {
      return {
        mae: 0,
        rmse: 0,
        mape: 0,
        accuracy: 0,
        confidence: 0
      };
    }

    // 메트릭 계산
    const mae = errors.reduce((sum, e) => sum + e, 0) / errors.length;
    const rmse = Math.sqrt(errors.reduce((sum, e) => sum + e * e, 0) / errors.length);
    const mape = percentageErrors.length > 0 
      ? percentageErrors.reduce((sum, e) => sum + e, 0) / percentageErrors.length 
      : 0;
    
    // 정확도 계산 (MAE 기반, 0-1 스케일)
    const accuracy = Math.max(0, 1 - mae / 50); // 50% 오차를 기준으로 정규화
    const confidence = Math.max(0, 1 - rmse / 30); // RMSE 기반 신뢰도

    return {
      mae: Math.round(mae * 100) / 100,
      rmse: Math.round(rmse * 100) / 100,
      mape: Math.round(mape * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100,
      confidence: Math.round(confidence * 100) / 100
    };
  }

  /**
   * 예측 모델 성능 분석
   */
  analyzeModelPerformance(routeId: string, days: number = 7): {
    overallAccuracy: PredictionAccuracy;
    timeOfDayAccuracy: { [hour: number]: PredictionAccuracy };
    weatherImpactAccuracy: { [weather: string]: PredictionAccuracy };
  } {
    const predictions = dataStore.getPredictionsByRoute(routeId);
    const actualData = dataStore.getCongestionDataByRoute(routeId, days * 24);
    
    // 전체 정확도
    const overallAccuracy = this.validatePredictionAccuracy(
      predictions.flatMap(p => p.predictions),
      actualData
    );

    // 시간대별 정확도
    const timeOfDayAccuracy: { [hour: number]: PredictionAccuracy } = {};
    for (let hour = 0; hour < 24; hour++) {
      const hourPredictions = predictions.flatMap(p => 
        p.predictions.filter(pred => new Date(pred.time).getHours() === hour)
      );
      const hourActual = actualData.filter(a => new Date(a.timestamp).getHours() === hour);
      
      timeOfDayAccuracy[hour] = this.validatePredictionAccuracy(hourPredictions, hourActual);
    }

    // 날씨별 정확도
    const weatherImpactAccuracy: { [weather: string]: PredictionAccuracy } = {};
    const weatherConditions: WeatherCondition[] = ['clear', 'cloudy', 'rainy', 'snowy', 'foggy'];
    
    weatherConditions.forEach(weather => {
      const weatherActual = actualData.filter(a => a.weatherCondition === weather);
      const weatherPredictions = predictions.flatMap(p => p.predictions); // 간단화
      
      weatherImpactAccuracy[weather] = this.validatePredictionAccuracy(weatherPredictions, weatherActual);
    });

    return {
      overallAccuracy,
      timeOfDayAccuracy,
      weatherImpactAccuracy
    };
  }

  // === Private Helper Methods ===

  private async predictSingleTimePoint(
    context: PredictionContext, 
    targetTime: Date, 
    stepIndex: number
  ): Promise<PredictionItem> {
    const hour = targetTime.getHours();
    const minute = targetTime.getMinutes();
    
    // 1. 기본 시간 패턴 기반 예측
    const basePattern = getCongestionByTimePattern(hour, minute);
    let basePrediction = this.getBaselinePrediction(basePattern, context.routeId);
    
    // 2. 과거 데이터 기반 조정
    basePrediction = this.adjustWithHistoricalData(basePrediction, context.historicalData, targetTime);
    
    // 3. 날씨 영향 적용
    basePrediction = this.adjustWithWeatherForecast(basePrediction, context.weatherForecast, targetTime);
    
    // 4. 이벤트 영향 적용
    basePrediction = this.adjustWithEvents(basePrediction, context.activeEvents, targetTime);
    
    // 5. 시간 거리에 따른 불확실성 증가
    const uncertainty = this.calculateUncertainty(stepIndex, context.granularity);
    basePrediction = this.addUncertainty(basePrediction, uncertainty);
    
    // 6. 신뢰도 계산
    const confidence = this.calculateConfidence(context, targetTime, stepIndex);

    return {
      time: targetTime.toISOString(),
      congestionLevel: this.getCongestionLevel(basePrediction),
      congestionPercentage: Math.round(clamp(basePrediction, 0, 100)),
      confidence: Math.round(confidence * 100) / 100
    };
  }

  private getBaselinePrediction(pattern: CongestionLevel, routeId: string): number {
    const transportType = this.getTransportType(routeId);
    const baseline = getBaselineByTransportType(transportType);
    
    // 패턴에 따른 기본 예측값
    const patternValues = {
      low: baseline * 0.6,
      medium: baseline * 0.9,
      high: baseline * 1.3
    };
    
    return patternValues[pattern];
  }

  private adjustWithHistoricalData(
    basePrediction: number, 
    historicalData: CongestionData[], 
    targetTime: Date
  ): number {
    if (historicalData.length === 0) return basePrediction;
    
    // 같은 시간대의 과거 데이터 찾기
    const targetHour = targetTime.getHours();
    const sameHourData = historicalData.filter(d => 
      new Date(d.timestamp).getHours() === targetHour
    );
    
    if (sameHourData.length === 0) return basePrediction;
    
    // 과거 평균과 현재 예측의 가중 평균
    const historicalAvg = sameHourData.reduce((sum, d) => sum + d.congestionPercentage, 0) / sameHourData.length;
    const weight = Math.min(0.7, sameHourData.length / 10); // 데이터가 많을수록 높은 가중치
    
    return basePrediction * (1 - weight) + historicalAvg * weight;
  }

  private adjustWithWeatherForecast(
    basePrediction: number, 
    weatherForecast: WeatherData[], 
    targetTime: Date
  ): number {
    const targetWeather = weatherForecast.find(w => 
      Math.abs(new Date(w.timestamp).getTime() - targetTime.getTime()) < 60 * 60 * 1000 // 1시간 오차 허용
    );
    
    if (!targetWeather) return basePrediction;
    
    return adjustCongestionForWeather(basePrediction, targetWeather.condition);
  }

  private adjustWithEvents(
    basePrediction: number, 
    activeEvents: EventData[], 
    targetTime: Date
  ): number {
    let adjustment = 0;
    
    activeEvents.forEach(event => {
      const eventStart = new Date(event.timeRange.start);
      const eventEnd = new Date(event.timeRange.end);
      
      // 이벤트 시간 범위 내에 있는지 확인
      if (targetTime >= eventStart && targetTime <= eventEnd) {
        adjustment += event.impact.congestionIncrease;
      }
      
      // 이벤트 전후 영향 (30분 전후)
      const preEventTime = new Date(eventStart.getTime() - 30 * 60 * 1000);
      const postEventTime = new Date(eventEnd.getTime() + 30 * 60 * 1000);
      
      if (targetTime >= preEventTime && targetTime < eventStart) {
        adjustment += event.impact.congestionIncrease * 0.5; // 이벤트 전 50% 영향
      } else if (targetTime > eventEnd && targetTime <= postEventTime) {
        adjustment += event.impact.congestionIncrease * 0.3; // 이벤트 후 30% 영향
      }
    });
    
    return basePrediction + adjustment;
  }

  private calculateUncertainty(stepIndex: number, granularity: number): number {
    // 시간이 멀어질수록 불확실성 증가
    const timeDistance = stepIndex * granularity; // 분 단위
    const maxUncertainty = 15; // 최대 15% 불확실성
    
    return Math.min(maxUncertainty, timeDistance / 60 * 5); // 1시간당 5% 증가
  }

  private addUncertainty(basePrediction: number, uncertainty: number): number {
    const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
    const adjustment = randomFactor * uncertainty;
    
    return basePrediction + adjustment;
  }

  private calculateConfidence(
    context: PredictionContext, 
    targetTime: Date, 
    stepIndex: number
  ): number {
    let confidence = this.baseAccuracy;
    
    // 시간 거리에 따른 신뢰도 감소
    const timeDistance = stepIndex * context.granularity / 60; // 시간 단위
    confidence -= timeDistance * 0.05; // 1시간당 5% 감소
    
    // 과거 데이터 양에 따른 신뢰도 조정
    const dataQuality = Math.min(1, context.historicalData.length / 20);
    confidence *= (0.7 + dataQuality * 0.3);
    
    // 이벤트 영향에 따른 신뢰도 조정
    const eventImpact = context.activeEvents.reduce((sum, e) => sum + e.impact.congestionIncrease, 0);
    if (eventImpact > 20) {
      confidence *= 0.8; // 큰 이벤트가 있으면 신뢰도 감소
    }
    
    return Math.max(0.3, Math.min(0.95, confidence)); // 30%-95% 범위
  }

  private calculatePredictionAccuracy(
    context: PredictionContext, 
    predictions: PredictionItem[]
  ): PredictionAccuracy {
    // 모의 정확도 계산 (실제 구현에서는 과거 예측과 실제 데이터 비교)
    const baseAccuracy = this.baseAccuracy;
    const dataQuality = Math.min(1, context.historicalData.length / 20);
    const timeHorizonPenalty = context.timeHorizon * 0.02; // 시간 범위가 길수록 정확도 감소
    
    const accuracy = Math.max(0.5, baseAccuracy * dataQuality - timeHorizonPenalty);
    
    return {
      mae: (1 - accuracy) * 20, // 정확도가 낮을수록 높은 MAE
      rmse: (1 - accuracy) * 25,
      mape: (1 - accuracy) * 30,
      accuracy: Math.round(accuracy * 100) / 100,
      confidence: Math.round(accuracy * 100) / 100
    };
  }

  private getCongestionLevel(percentage: number): CongestionLevel {
    if (percentage <= 40) return 'low';
    if (percentage <= 70) return 'medium';
    return 'high';
  }

  private getTransportType(routeId: string): TransportType {
    if (routeId.startsWith('line-')) return 'subway';
    if (routeId.startsWith('bus-')) return 'bus';
    return 'shuttle';
  }

  private generateCacheKey(context: PredictionContext): string {
    return `${context.routeId}-${context.currentTime.getTime()}-${context.timeHorizon}`;
  }

  private isCacheValid(cached: PredictionData, maxAgeMinutes: number): boolean {
    const cacheTime = new Date(cached.predictionTime);
    const now = new Date();
    const ageMinutes = (now.getTime() - cacheTime.getTime()) / (1000 * 60);
    
    return ageMinutes < maxAgeMinutes;
  }

  /**
   * 예측 엔진 시뮬레이션 시작
   */
  startPredictionSimulation(): void {
    // 15분마다 예측 업데이트
    setInterval(() => {
      this.updateRealtimePredictions();
    }, 15 * 60 * 1000);

    // 1시간마다 캐시 정리
    setInterval(() => {
      this.cleanupCache();
    }, 60 * 60 * 1000);

    console.log('🔮 Prediction engine simulation started');
  }

  private cleanupCache(): void {
    const now = new Date();
    const maxAge = 30 * 60 * 1000; // 30분
    
    for (const [key, prediction] of this.predictionCache.entries()) {
      const predictionTime = new Date(prediction.predictionTime);
      if (now.getTime() - predictionTime.getTime() > maxAge) {
        this.predictionCache.delete(key);
      }
    }
    
    console.log(`🧹 Cleaned up prediction cache, ${this.predictionCache.size} entries remaining`);
  }
}

// 싱글톤 인스턴스 생성
export const mockPredictionEngine = new MockPredictionEngine();