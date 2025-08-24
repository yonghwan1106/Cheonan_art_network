import { User, FrequentRoute, CongestionLevel, TransportType } from '../types';
import { dataStore } from './dataStore';

/**
 * 사용자 행동 패턴 시뮬레이션 서비스
 * 목 사용자 데이터를 기반으로 현실적인 이용 패턴을 생성
 */
export class UserBehaviorSimulation {
  /**
   * 사용자의 이동 패턴을 분석하여 행동 프로필 생성
   */
  generateUserBehaviorProfile(userId: string): UserBehaviorProfile | null {
    const user = dataStore.getUserById(userId);
    if (!user) return null;

    const behaviorProfile: UserBehaviorProfile = {
      userId,
      travelPatterns: this.analyzeTravelPatterns(user),
      timePreferences: this.analyzeTimePreferences(user),
      congestionSensitivity: this.calculateCongestionSensitivity(user),
      routeFlexibility: this.calculateRouteFlexibility(user),
      incentiveMotivation: this.calculateIncentiveMotivation(user),
      lastUpdated: new Date().toISOString()
    };

    return behaviorProfile;
  }

  /**
   * 사용자의 이동 패턴 분석
   */
  private analyzeTravelPatterns(user: User): TravelPattern[] {
    return user.frequentRoutes.map(route => {
      const basePattern = this.getBasePatternForRoute(route);
      
      return {
        routeId: route.id,
        origin: route.origin,
        destination: route.destination,
        frequency: route.frequency,
        preferredTime: route.preferredTime,
        transportType: route.transportType,
        reliability: this.calculateReliability(route.frequency),
        flexibility: this.calculateTimeFlexibility(user.preferences.congestionTolerance),
        alternativeRoutes: this.generateAlternativeRoutes(route.origin, route.destination)
      };
    });
  }

  /**
   * 시간대별 선호도 분석
   */
  private analyzeTimePreferences(user: User): TimePreference[] {
    const preferences: TimePreference[] = [];
    
    // 출근 시간대 선호도
    const morningRushHour = user.frequentRoutes.find(route => {
      const time = parseInt(route.preferredTime?.split(':')[0] || '0');
      return time >= 7 && time <= 9;
    });

    if (morningRushHour) {
      preferences.push({
        timeSlot: 'morning-rush',
        startTime: '07:00',
        endTime: '09:00',
        preference: this.calculateTimeSlotPreference(user.preferences.congestionTolerance, 'rush'),
        flexibility: user.preferences.notificationTiming
      });
    }

    // 퇴근 시간대 선호도
    preferences.push({
      timeSlot: 'evening-rush',
      startTime: '18:00',
      endTime: '20:00',
      preference: this.calculateTimeSlotPreference(user.preferences.congestionTolerance, 'rush'),
      flexibility: user.preferences.notificationTiming
    });

    // 평시 선호도
    preferences.push({
      timeSlot: 'off-peak',
      startTime: '10:00',
      endTime: '17:00',
      preference: 0.8, // 대부분 사용자가 평시를 선호
      flexibility: user.preferences.notificationTiming * 2
    });

    return preferences;
  }

  /**
   * 혼잡도 민감도 계산
   */
  private calculateCongestionSensitivity(user: User): number {
    const toleranceMap = {
      'low': 0.9,      // 높은 민감도
      'medium': 0.6,   // 중간 민감도
      'high': 0.3      // 낮은 민감도
    };

    return toleranceMap[user.preferences.congestionTolerance];
  }

  /**
   * 경로 유연성 계산
   */
  private calculateRouteFlexibility(user: User): number {
    // 최대 환승 횟수와 도보 거리를 기반으로 유연성 계산
    const transferFactor = Math.min(user.preferences.maxTransfers / 3, 1);
    const walkingFactor = Math.min(user.preferences.maxWalkingDistance / 1000, 1);
    
    return (transferFactor + walkingFactor) / 2;
  }

  /**
   * 인센티브 동기 계산
   */
  private calculateIncentiveMotivation(user: User): number {
    // 현재 포인트와 사용 패턴을 기반으로 인센티브 동기 계산
    const pointsFactor = Math.min(user.points / 2000, 1);
    const usageFrequency = user.frequentRoutes.reduce((sum, route) => sum + route.frequency, 0);
    const frequencyFactor = Math.min(usageFrequency / 20, 1);
    
    return (pointsFactor + frequencyFactor) / 2;
  }

  /**
   * 경로별 기본 패턴 생성
   */
  private getBasePatternForRoute(route: FrequentRoute): any {
    const hour = parseInt(route.preferredTime?.split(':')[0] || '0');
    
    return {
      isRushHour: (hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 20),
      expectedCongestion: this.predictRouteCongestion(route, hour),
      travelTime: this.estimateTravelTime(route)
    };
  }

  /**
   * 경로 혼잡도 예측
   */
  private predictRouteCongestion(route: FrequentRoute, hour: number): CongestionLevel {
    // 시간대별 혼잡도 패턴
    if ((hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 20)) {
      return 'high';
    } else if ((hour >= 11 && hour <= 14) || (hour >= 16 && hour <= 17)) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 이동 시간 추정
   */
  private estimateTravelTime(route: FrequentRoute): number {
    // 교통수단별 기본 이동 시간 (분)
    const baseTimeMap = {
      'subway': 30,
      'bus': 45,
      'shuttle': 25
    };

    return baseTimeMap[route.transportType] + Math.random() * 15;
  }

  /**
   * 신뢰도 계산
   */
  private calculateReliability(frequency: number): number {
    // 주간 이용 빈도가 높을수록 신뢰도 높음
    return Math.min(frequency / 7, 1);
  }

  /**
   * 시간 유연성 계산
   */
  private calculateTimeFlexibility(tolerance: CongestionLevel): number {
    const flexibilityMap = {
      'low': 0.3,      // 낮은 유연성
      'medium': 0.6,   // 중간 유연성
      'high': 0.9      // 높은 유연성
    };

    return flexibilityMap[tolerance];
  }

  /**
   * 시간대별 선호도 계산
   */
  private calculateTimeSlotPreference(tolerance: CongestionLevel, timeType: 'rush' | 'off-peak'): number {
    if (timeType === 'rush') {
      const rushPreferenceMap = {
        'low': 0.2,      // 러시아워 기피
        'medium': 0.5,   // 보통
        'high': 0.8      // 러시아워도 괜찮음
      };
      return rushPreferenceMap[tolerance];
    } else {
      return 0.8; // 대부분 평시를 선호
    }
  }

  /**
   * 대체 경로 생성
   */
  private generateAlternativeRoutes(origin: string, destination: string): string[] {
    // 실제로는 경로 탐색 알고리즘을 사용하지만, 목 데이터로 대체
    const alternatives = [
      `${origin}-${destination}-alt1`,
      `${origin}-${destination}-alt2`,
      `${origin}-${destination}-alt3`
    ];

    return alternatives.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  /**
   * 사용자 행동 예측
   */
  predictUserBehavior(userId: string, scenario: BehaviorScenario): BehaviorPrediction {
    const profile = this.generateUserBehaviorProfile(userId);
    if (!profile) {
      throw new Error(`User profile not found for user: ${userId}`);
    }

    const prediction: BehaviorPrediction = {
      userId,
      scenario,
      likelyActions: this.predictLikelyActions(profile, scenario),
      decisionFactors: this.identifyDecisionFactors(profile, scenario),
      confidence: this.calculatePredictionConfidence(profile, scenario),
      timestamp: new Date().toISOString()
    };

    return prediction;
  }

  /**
   * 가능한 행동 예측
   */
  private predictLikelyActions(profile: UserBehaviorProfile, scenario: BehaviorScenario): LikelyAction[] {
    const actions: LikelyAction[] = [];

    // 혼잡도 기반 행동 예측
    if (scenario.currentCongestion === 'high' && profile.congestionSensitivity > 0.7) {
      actions.push({
        action: 'delay-departure',
        probability: 0.8,
        reason: 'High congestion sensitivity'
      });
      
      actions.push({
        action: 'find-alternative-route',
        probability: profile.routeFlexibility,
        reason: 'Seeking less congested route'
      });
    }

    // 인센티브 기반 행동 예측
    if (scenario.incentiveAvailable && profile.incentiveMotivation > 0.5) {
      actions.push({
        action: 'accept-incentive',
        probability: profile.incentiveMotivation,
        reason: 'Motivated by incentive points'
      });
    }

    // 시간 기반 행동 예측
    const timePreference = profile.timePreferences.find(tp => 
      this.isTimeInSlot(scenario.departureTime, tp.startTime, tp.endTime)
    );

    if (timePreference && timePreference.preference < 0.5) {
      actions.push({
        action: 'reschedule-trip',
        probability: 0.6,
        reason: 'Preferred time slot avoidance'
      });
    }

    return actions.sort((a, b) => b.probability - a.probability);
  }

  /**
   * 의사결정 요인 식별
   */
  private identifyDecisionFactors(profile: UserBehaviorProfile, scenario: BehaviorScenario): DecisionFactor[] {
    const factors: DecisionFactor[] = [
      {
        factor: 'congestion-level',
        weight: profile.congestionSensitivity,
        currentValue: scenario.currentCongestion
      },
      {
        factor: 'travel-time',
        weight: 0.8,
        currentValue: scenario.estimatedTravelTime?.toString() || 'unknown'
      },
      {
        factor: 'incentive-points',
        weight: profile.incentiveMotivation,
        currentValue: scenario.incentiveAvailable ? 'available' : 'none'
      }
    ];

    return factors.sort((a, b) => b.weight - a.weight);
  }

  /**
   * 예측 신뢰도 계산
   */
  private calculatePredictionConfidence(profile: UserBehaviorProfile, scenario: BehaviorScenario): number {
    // 사용자 데이터의 완성도와 시나리오의 명확성을 기반으로 신뢰도 계산
    const profileCompleteness = profile.travelPatterns.length > 0 ? 0.8 : 0.4;
    const scenarioClarity = scenario.currentCongestion && scenario.departureTime ? 0.9 : 0.6;
    
    return (profileCompleteness + scenarioClarity) / 2;
  }

  /**
   * 시간이 특정 슬롯에 포함되는지 확인
   */
  private isTimeInSlot(time: string, startTime: string, endTime: string): boolean {
    const timeHour = parseInt(time?.split(':')[0] || '0');
    const startHour = parseInt(startTime?.split(':')[0] || '0');
    const endHour = parseInt(endTime?.split(':')[0] || '0');
    
    return timeHour >= startHour && timeHour <= endHour;
  }
}

// 타입 정의
export interface UserBehaviorProfile {
  userId: string;
  travelPatterns: TravelPattern[];
  timePreferences: TimePreference[];
  congestionSensitivity: number; // 0-1
  routeFlexibility: number; // 0-1
  incentiveMotivation: number; // 0-1
  lastUpdated: string;
}

export interface TravelPattern {
  routeId: string;
  origin: string;
  destination: string;
  frequency: number;
  preferredTime: string;
  transportType: TransportType;
  reliability: number;
  flexibility: number;
  alternativeRoutes: string[];
}

export interface TimePreference {
  timeSlot: string;
  startTime: string;
  endTime: string;
  preference: number; // 0-1
  flexibility: number; // minutes
}

export interface BehaviorScenario {
  currentCongestion: CongestionLevel;
  departureTime: string;
  estimatedTravelTime?: number;
  incentiveAvailable: boolean;
  weatherCondition?: string;
  specialEvents?: string[];
}

export interface BehaviorPrediction {
  userId: string;
  scenario: BehaviorScenario;
  likelyActions: LikelyAction[];
  decisionFactors: DecisionFactor[];
  confidence: number;
  timestamp: string;
}

export interface LikelyAction {
  action: string;
  probability: number;
  reason: string;
}

export interface DecisionFactor {
  factor: string;
  weight: number;
  currentValue: string;
}

// 싱글톤 인스턴스 생성
export const userBehaviorSimulation = new UserBehaviorSimulation();