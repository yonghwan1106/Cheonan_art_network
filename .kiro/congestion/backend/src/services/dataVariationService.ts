import { CongestionData, CongestionLevel } from '../types';
import { 
  generateRandomCongestion, 
  getCongestionLevel, 
  clamp,
  getRandomElement 
} from '../utils/helpers';

/**
 * 데이터 변동 패턴 타입
 */
export type VariationPattern = 
  | 'smooth' 
  | 'volatile' 
  | 'trending_up' 
  | 'trending_down' 
  | 'cyclical' 
  | 'random_walk'
  | 'spike'
  | 'dip';

/**
 * 변동 설정
 */
export interface VariationConfig {
  pattern: VariationPattern;
  intensity: number; // 0-1, 변동 강도
  frequency: number; // 변동 빈도 (분 단위)
  duration: number; // 패턴 지속 시간 (분 단위)
  baseValue?: number; // 기준값 (없으면 현재값 사용)
}

/**
 * 시계열 데이터 포인트
 */
export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  level: CongestionLevel;
  trend: 'up' | 'down' | 'stable';
  volatility: number;
}

/**
 * 데이터 변동 서비스
 * 현실적인 혼잡도 변화 패턴을 생성합니다.
 */
export class DataVariationService {
  private readonly patterns = {
    smooth: {
      description: '부드러운 변화',
      volatility: 0.1,
      trendStrength: 0.05
    },
    volatile: {
      description: '급격한 변동',
      volatility: 0.3,
      trendStrength: 0.15
    },
    trending_up: {
      description: '상승 추세',
      volatility: 0.15,
      trendStrength: 0.2
    },
    trending_down: {
      description: '하락 추세',
      volatility: 0.15,
      trendStrength: -0.2
    },
    cyclical: {
      description: '주기적 변동',
      volatility: 0.2,
      trendStrength: 0
    },
    random_walk: {
      description: '무작위 보행',
      volatility: 0.25,
      trendStrength: 0
    },
    spike: {
      description: '급상승',
      volatility: 0.4,
      trendStrength: 0.3
    },
    dip: {
      description: '급하락',
      volatility: 0.4,
      trendStrength: -0.3
    }
  };

  /**
   * 시계열 데이터 생성
   */
  generateTimeSeries(
    startValue: number,
    config: VariationConfig,
    dataPoints: number
  ): TimeSeriesPoint[] {
    const series: TimeSeriesPoint[] = [];
    const pattern = this.patterns[config.pattern];
    
    let currentValue = config.baseValue || startValue;
    let trend = 0;
    let cyclePosition = 0;
    
    const now = new Date();
    
    for (let i = 0; i < dataPoints; i++) {
      const timestamp = new Date(now.getTime() + i * config.frequency * 60 * 1000);
      
      // 패턴별 변동 계산
      const variation = this.calculateVariation(
        config.pattern,
        currentValue,
        i,
        cyclePosition,
        pattern,
        config.intensity
      );
      
      currentValue = clamp(currentValue + variation, 0, 100);
      
      // 트렌드 계산
      const trendDirection = this.calculateTrend(series, currentValue);
      
      // 변동성 계산
      const volatility = this.calculateVolatility(series, pattern.volatility);
      
      const point: TimeSeriesPoint = {
        timestamp: timestamp.toISOString(),
        value: Math.round(currentValue * 10) / 10,
        level: getCongestionLevel(currentValue),
        trend: trendDirection,
        volatility: Math.round(volatility * 100) / 100
      };
      
      series.push(point);
      
      // 주기적 패턴을 위한 사이클 위치 업데이트
      cyclePosition = (cyclePosition + 1) % 24; // 24시간 주기
    }
    
    return series;
  }

  /**
   * 기존 데이터에 변동 적용
   */
  applyVariation(
    baseData: CongestionData[],
    config: VariationConfig
  ): CongestionData[] {
    const modifiedData = [...baseData];
    const pattern = this.patterns[config.pattern];
    
    modifiedData.forEach((data, index) => {
      const variation = this.calculateVariation(
        config.pattern,
        data.congestionPercentage,
        index,
        index % 24,
        pattern,
        config.intensity
      );
      
      const newPercentage = clamp(data.congestionPercentage + variation, 0, 100);
      
      data.congestionPercentage = Math.round(newPercentage);
      data.congestionLevel = getCongestionLevel(newPercentage);
      data.passengerCount = Math.floor((data.vehicleCapacity * newPercentage) / 100);
    });
    
    return modifiedData;
  }

  /**
   * 실시간 변동 시뮬레이션
   */
  simulateRealtimeVariation(
    currentValue: number,
    pattern: VariationPattern,
    intensity: number = 0.5
  ): number {
    const patternConfig = this.patterns[pattern];
    const variation = this.calculateVariation(
      pattern,
      currentValue,
      0,
      new Date().getHours(),
      patternConfig,
      intensity
    );
    
    return clamp(currentValue + variation, 0, 100);
  }

  /**
   * 이상치 생성
   */
  generateAnomalies(
    normalData: TimeSeriesPoint[],
    anomalyRate: number = 0.05
  ): TimeSeriesPoint[] {
    const dataWithAnomalies = [...normalData];
    const anomalyCount = Math.floor(normalData.length * anomalyRate);
    
    for (let i = 0; i < anomalyCount; i++) {
      const randomIndex = Math.floor(Math.random() * dataWithAnomalies.length);
      const point = dataWithAnomalies[randomIndex];
      
      // 이상치 타입 결정
      const anomalyType = getRandomElement(['spike', 'dip', 'plateau']);
      
      switch (anomalyType) {
        case 'spike':
          point.value = Math.min(100, point.value + Math.random() * 30 + 20);
          break;
        case 'dip':
          point.value = Math.max(0, point.value - Math.random() * 30 - 20);
          break;
        case 'plateau':
          // 주변 값들을 비슷하게 만들기
          const plateauValue = point.value;
          for (let j = Math.max(0, randomIndex - 2); j <= Math.min(dataWithAnomalies.length - 1, randomIndex + 2); j++) {
            dataWithAnomalies[j].value = plateauValue + (Math.random() - 0.5) * 5;
          }
          break;
      }
      
      point.level = getCongestionLevel(point.value);
      point.volatility = Math.min(1, point.volatility + 0.3);
    }
    
    return dataWithAnomalies;
  }

  /**
   * 계절적 패턴 적용
   */
  applySeasonalPattern(
    baseData: TimeSeriesPoint[],
    season: 'spring' | 'summer' | 'autumn' | 'winter'
  ): TimeSeriesPoint[] {
    const seasonalAdjustments = {
      spring: { multiplier: 1.1, volatility: 0.15 }, // 봄철 증가
      summer: { multiplier: 0.9, volatility: 0.2 },  // 여름철 감소 (휴가철)
      autumn: { multiplier: 1.05, volatility: 0.1 }, // 가을철 약간 증가
      winter: { multiplier: 0.95, volatility: 0.25 } // 겨울철 감소, 높은 변동성
    };
    
    const adjustment = seasonalAdjustments[season];
    
    return baseData.map(point => ({
      ...point,
      value: clamp(point.value * adjustment.multiplier, 0, 100),
      volatility: Math.min(1, point.volatility + adjustment.volatility),
      level: getCongestionLevel(point.value * adjustment.multiplier)
    }));
  }

  /**
   * 요일별 패턴 적용
   */
  applyWeekdayPattern(
    baseData: TimeSeriesPoint[],
    dayOfWeek: number // 0=일요일, 6=토요일
  ): TimeSeriesPoint[] {
    const weekdayMultipliers = [
      0.6,  // 일요일
      1.0,  // 월요일
      1.1,  // 화요일
      1.1,  // 수요일
      1.1,  // 목요일
      1.2,  // 금요일
      0.8   // 토요일
    ];
    
    const multiplier = weekdayMultipliers[dayOfWeek];
    
    return baseData.map(point => ({
      ...point,
      value: clamp(point.value * multiplier, 0, 100),
      level: getCongestionLevel(point.value * multiplier)
    }));
  }

  // === Private Helper Methods ===

  private calculateVariation(
    pattern: VariationPattern,
    currentValue: number,
    index: number,
    cyclePosition: number,
    patternConfig: { volatility: number; trendStrength: number },
    intensity: number
  ): number {
    let variation = 0;
    
    switch (pattern) {
      case 'smooth':
        variation = (Math.random() - 0.5) * patternConfig.volatility * 10;
        break;
        
      case 'volatile':
        variation = (Math.random() - 0.5) * patternConfig.volatility * 30;
        break;
        
      case 'trending_up':
        variation = patternConfig.trendStrength * 10 + (Math.random() - 0.5) * patternConfig.volatility * 15;
        break;
        
      case 'trending_down':
        variation = patternConfig.trendStrength * 10 + (Math.random() - 0.5) * patternConfig.volatility * 15;
        break;
        
      case 'cyclical':
        const cycleValue = Math.sin((cyclePosition / 24) * 2 * Math.PI) * 15;
        variation = cycleValue + (Math.random() - 0.5) * patternConfig.volatility * 10;
        break;
        
      case 'random_walk':
        const direction = Math.random() > 0.5 ? 1 : -1;
        variation = direction * Math.random() * patternConfig.volatility * 20;
        break;
        
      case 'spike':
        if (index < 3) { // 처음 몇 포인트에서 급상승
          variation = Math.random() * 25 + 10;
        } else {
          variation = (Math.random() - 0.5) * 5; // 이후 안정화
        }
        break;
        
      case 'dip':
        if (index < 3) { // 처음 몇 포인트에서 급하락
          variation = -(Math.random() * 25 + 10);
        } else {
          variation = (Math.random() - 0.5) * 5; // 이후 안정화
        }
        break;
    }
    
    return variation * intensity;
  }

  private calculateTrend(
    series: TimeSeriesPoint[],
    currentValue: number
  ): 'up' | 'down' | 'stable' {
    if (series.length < 2) return 'stable';
    
    const recentPoints = series.slice(-3); // 최근 3개 포인트
    const avgRecent = recentPoints.reduce((sum, p) => sum + p.value, 0) / recentPoints.length;
    
    const difference = currentValue - avgRecent;
    
    if (difference > 2) return 'up';
    if (difference < -2) return 'down';
    return 'stable';
  }

  private calculateVolatility(
    series: TimeSeriesPoint[],
    baseVolatility: number
  ): number {
    if (series.length < 5) return baseVolatility;
    
    const recentPoints = series.slice(-5);
    const values = recentPoints.map(p => p.value);
    
    // 표준편차 계산
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // 정규화된 변동성 (0-1 범위)
    return Math.min(1, stdDev / 50);
  }

  /**
   * 패턴 추천
   */
  recommendPattern(
    historicalData: number[],
    timeOfDay: number
  ): VariationPattern {
    if (historicalData.length < 5) return 'smooth';
    
    const volatility = this.calculateHistoricalVolatility(historicalData);
    const trend = this.calculateHistoricalTrend(historicalData);
    
    // 출퇴근 시간대
    if ((timeOfDay >= 7 && timeOfDay <= 9) || (timeOfDay >= 17 && timeOfDay <= 19)) {
      return volatility > 0.3 ? 'volatile' : 'trending_up';
    }
    
    // 심야 시간대
    if (timeOfDay >= 22 || timeOfDay <= 5) {
      return 'smooth';
    }
    
    // 트렌드 기반 추천
    if (trend > 0.1) return 'trending_up';
    if (trend < -0.1) return 'trending_down';
    
    // 변동성 기반 추천
    if (volatility > 0.4) return 'volatile';
    if (volatility < 0.1) return 'smooth';
    
    return 'cyclical';
  }

  private calculateHistoricalVolatility(data: number[]): number {
    if (data.length < 2) return 0;
    
    const mean = data.reduce((sum, v) => sum + v, 0) / data.length;
    const variance = data.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / data.length;
    
    return Math.sqrt(variance) / 50; // 정규화
  }

  private calculateHistoricalTrend(data: number[]): number {
    if (data.length < 2) return 0;
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
    
    return (secondAvg - firstAvg) / 50; // 정규화
  }
}

// 싱글톤 인스턴스 생성
export const dataVariationService = new DataVariationService();