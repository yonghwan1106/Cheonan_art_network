import { 
  User, 
  RecommendedRoute, 
  RouteSegment, 
  StationInfo, 
  CongestionLevel,
  TransportType 
} from '../types';
import { dataStore } from './dataStore';
import { userBehaviorSimulation, UserBehaviorProfile } from './userBehaviorSimulation';
import { congestionGenerator } from './congestionGenerator';

/**
 * 규칙 기반 경로 추천 엔진
 * 사용자 선호도와 실시간 혼잡도를 고려한 개인화된 경로 추천
 */
export class RecommendationEngine {
  /**
   * 개인화된 경로 추천 생성
   */
  async generatePersonalizedRecommendations(
    userId: string,
    origin: string,
    destination: string,
    departureTime?: string
  ): Promise<PersonalizedRecommendation> {
    const user = dataStore.getUserById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const originStation = this.findStationByName(origin);
    const destinationStation = this.findStationByName(destination);
    
    if (!originStation || !destinationStation) {
      throw new Error('Origin or destination station not found');
    }

    // 사용자 행동 프로필 생성
    const behaviorProfile = userBehaviorSimulation.generateUserBehaviorProfile(userId);
    
    // 기본 경로 옵션 생성
    const baseRoutes = await this.generateBaseRoutes(originStation, destinationStation);
    
    // 사용자 선호도 기반 필터링 및 순위 매기기
    const filteredRoutes = this.applyPreferenceFiltering(baseRoutes, user, behaviorProfile);
    
    // 실시간 혼잡도 적용
    const routesWithCongestion = await this.applyCongestionData(filteredRoutes, departureTime);
    
    // 인센티브 계산
    const routesWithIncentives = this.calculateIncentives(routesWithCongestion, user);
    
    // 최종 순위 매기기
    const rankedRoutes = this.rankRoutes(routesWithIncentives, user, behaviorProfile);
    
    // 알림 타이밍 계산
    const alertTiming = this.calculateAlertTiming(user, rankedRoutes[0], departureTime);

    return {
      userId,
      origin: originStation,
      destination: destinationStation,
      requestTime: new Date().toISOString(),
      departureTime: departureTime || new Date().toISOString(),
      recommendedRoutes: rankedRoutes.slice(0, 3), // 최대 3개 추천
      alertTiming,
      personalizedInsights: this.generatePersonalizedInsights(user, behaviorProfile, rankedRoutes),
      confidence: this.calculateRecommendationConfidence(rankedRoutes)
    };
  }

  /**
   * 기본 경로 옵션 생성
   */
  private async generateBaseRoutes(
    origin: StationInfo, 
    destination: StationInfo
  ): Promise<RecommendedRoute[]> {
    const routes: RecommendedRoute[] = [];

    // 직통 지하철 경로
    const subwayRoute = this.generateSubwayRoute(origin, destination);
    if (subwayRoute) routes.push(subwayRoute);

    // 버스 경로
    const busRoute = this.generateBusRoute(origin, destination);
    if (busRoute) routes.push(busRoute);

    // 환승 경로
    const transferRoute = this.generateTransferRoute(origin, destination);
    if (transferRoute) routes.push(transferRoute);

    // 도보 + 대중교통 조합 경로
    const walkingComboRoute = this.generateWalkingComboRoute(origin, destination);
    if (walkingComboRoute) routes.push(walkingComboRoute);

    return routes;
  }

  /**
   * 지하철 직통 경로 생성
   */
  private generateSubwayRoute(origin: StationInfo, destination: StationInfo): RecommendedRoute | null {
    // 실제로는 경로 탐색 알고리즘을 사용하지만, 목 데이터로 구현
    const segment: RouteSegment = {
      transportType: 'subway',
      routeId: 'line2',
      routeName: '2호선',
      fromStation: origin,
      toStation: destination,
      duration: 25 + Math.floor(Math.random() * 15),
      congestionLevel: 'medium',
      congestionPercentage: 60 + Math.floor(Math.random() * 30)
    };

    return {
      id: `subway-${origin.id}-${destination.id}`,
      origin,
      destination,
      routes: [segment],
      totalTime: segment.duration,
      totalDistance: 15000 + Math.floor(Math.random() * 10000),
      transfers: 0,
      congestionScore: segment.congestionPercentage,
      confidence: 0.9
    };
  }

  /**
   * 버스 경로 생성
   */
  private generateBusRoute(origin: StationInfo, destination: StationInfo): RecommendedRoute | null {
    const segment: RouteSegment = {
      transportType: 'bus',
      routeId: 'bus-472',
      routeName: '472번',
      fromStation: origin,
      toStation: destination,
      duration: 35 + Math.floor(Math.random() * 20),
      congestionLevel: 'low',
      congestionPercentage: 40 + Math.floor(Math.random() * 30)
    };

    return {
      id: `bus-${origin.id}-${destination.id}`,
      origin,
      destination,
      routes: [segment],
      totalTime: segment.duration,
      totalDistance: 18000 + Math.floor(Math.random() * 8000),
      transfers: 0,
      congestionScore: segment.congestionPercentage,
      confidence: 0.75
    };
  }

  /**
   * 환승 경로 생성
   */
  private generateTransferRoute(origin: StationInfo, destination: StationInfo): RecommendedRoute | null {
    // 중간 환승역 생성 (목 데이터)
    const transferStation: StationInfo = {
      id: 'transfer-station',
      name: '환승역',
      location: {
        lat: (origin.location.lat + destination.location.lat) / 2,
        lng: (origin.location.lng + destination.location.lng) / 2
      },
      facilities: ['환승통로']
    };

    const segment1: RouteSegment = {
      transportType: 'subway',
      routeId: 'line1',
      routeName: '1호선',
      fromStation: origin,
      toStation: transferStation,
      duration: 15 + Math.floor(Math.random() * 10),
      congestionLevel: 'high',
      congestionPercentage: 75 + Math.floor(Math.random() * 20)
    };

    const segment2: RouteSegment = {
      transportType: 'subway',
      routeId: 'line3',
      routeName: '3호선',
      fromStation: transferStation,
      toStation: destination,
      duration: 20 + Math.floor(Math.random() * 10),
      congestionLevel: 'medium',
      congestionPercentage: 55 + Math.floor(Math.random() * 25)
    };

    return {
      id: `transfer-${origin.id}-${destination.id}`,
      origin,
      destination,
      routes: [segment1, segment2],
      totalTime: segment1.duration + segment2.duration + 5, // 환승 시간 추가
      totalDistance: 20000 + Math.floor(Math.random() * 12000),
      transfers: 1,
      congestionScore: (segment1.congestionPercentage + segment2.congestionPercentage) / 2,
      confidence: 0.8
    };
  }

  /**
   * 도보 + 대중교통 조합 경로 생성
   */
  private generateWalkingComboRoute(origin: StationInfo, destination: StationInfo): RecommendedRoute | null {
    // 도보로 이동할 중간 지점 생성
    const walkingStation: StationInfo = {
      id: 'walking-point',
      name: '도보 경유지',
      location: {
        lat: origin.location.lat + (Math.random() - 0.5) * 0.01,
        lng: origin.location.lng + (Math.random() - 0.5) * 0.01
      },
      facilities: []
    };

    const walkingSegment: RouteSegment = {
      transportType: 'bus', // 도보 후 버스 이용
      routeId: 'walking-bus',
      routeName: '도보 + 버스',
      fromStation: walkingStation,
      toStation: destination,
      duration: 30 + Math.floor(Math.random() * 15),
      congestionLevel: 'low',
      congestionPercentage: 30 + Math.floor(Math.random() * 25)
    };

    return {
      id: `walking-combo-${origin.id}-${destination.id}`,
      origin,
      destination,
      routes: [walkingSegment],
      totalTime: walkingSegment.duration + 10, // 도보 시간 추가
      totalDistance: 12000 + Math.floor(Math.random() * 8000),
      transfers: 0,
      congestionScore: walkingSegment.congestionPercentage,
      confidence: 0.7
    };
  }

  /**
   * 사용자 선호도 기반 필터링
   */
  private applyPreferenceFiltering(
    routes: RecommendedRoute[], 
    user: User, 
    behaviorProfile: UserBehaviorProfile | null
  ): RecommendedRoute[] {
    return routes.filter(route => {
      // 최대 환승 횟수 체크
      if (route.transfers > user.preferences.maxTransfers) {
        return false;
      }

      // 최대 도보 거리 체크 (간단한 추정)
      const estimatedWalkingDistance = route.totalDistance * 0.1; // 전체 거리의 10%를 도보로 가정
      if (estimatedWalkingDistance > user.preferences.maxWalkingDistance) {
        return false;
      }

      // 혼잡도 허용 수준 체크
      if (user.preferences.congestionTolerance === 'low' && route.congestionScore > 70) {
        return false;
      }

      return true;
    });
  }

  /**
   * 실시간 혼잡도 데이터 적용
   */
  private async applyCongestionData(
    routes: RecommendedRoute[], 
    departureTime?: string
  ): Promise<RecommendedRoute[]> {
    const currentTime = departureTime || new Date().toISOString();
    
    return routes.map(route => {
      // 각 구간별 실시간 혼잡도 업데이트
      const updatedSegments = route.routes.map(segment => {
        const congestionData = congestionGenerator.generateRealtimeCongestion(
          segment.routeId,
          segment.fromStation.id,
          currentTime
        );

        return {
          ...segment,
          congestionLevel: congestionData.congestionLevel,
          congestionPercentage: congestionData.congestionPercentage
        };
      });

      // 전체 혼잡도 점수 재계산
      const avgCongestion = updatedSegments.reduce(
        (sum, segment) => sum + segment.congestionPercentage, 0
      ) / updatedSegments.length;

      return {
        ...route,
        routes: updatedSegments,
        congestionScore: avgCongestion
      };
    });
  }

  /**
   * 인센티브 계산
   */
  private calculateIncentives(routes: RecommendedRoute[], user: User): RecommendedRoute[] {
    return routes.map(route => {
      let incentivePoints = 0;

      // 혼잡하지 않은 시간대 이용 인센티브
      if (route.congestionScore < 50) {
        incentivePoints += 10;
      }

      // 환승 이용 인센티브 (분산 효과)
      if (route.transfers > 0) {
        incentivePoints += route.transfers * 5;
      }

      // 버스 이용 인센티브
      const hasBusSegment = route.routes.some(segment => segment.transportType === 'bus');
      if (hasBusSegment) {
        incentivePoints += 15;
      }

      return {
        ...route,
        incentivePoints: incentivePoints > 0 ? incentivePoints : undefined
      };
    });
  }

  /**
   * 경로 순위 매기기
   */
  private rankRoutes(
    routes: RecommendedRoute[], 
    user: User, 
    behaviorProfile: UserBehaviorProfile | null
  ): RecommendedRoute[] {
    return routes.map(route => {
      let score = 0;

      // 시간 점수 (짧을수록 높은 점수)
      const timeScore = Math.max(0, 100 - route.totalTime);
      score += timeScore * 0.3;

      // 혼잡도 점수 (낮을수록 높은 점수)
      const congestionScore = Math.max(0, 100 - route.congestionScore);
      const congestionWeight = user.preferences.congestionTolerance === 'low' ? 0.4 : 0.2;
      score += congestionScore * congestionWeight;

      // 환승 점수 (적을수록 높은 점수)
      const transferScore = Math.max(0, 100 - route.transfers * 25);
      score += transferScore * 0.2;

      // 인센티브 점수
      if (route.incentivePoints) {
        score += route.incentivePoints * 0.1;
      }

      // 개인화 점수 (행동 프로필 기반)
      if (behaviorProfile) {
        const personalizedScore = this.calculatePersonalizedScore(route, behaviorProfile);
        score += personalizedScore * 0.2;
      }

      return {
        ...route,
        score
      };
    }).sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  /**
   * 개인화 점수 계산
   */
  private calculatePersonalizedScore(route: RecommendedRoute, profile: UserBehaviorProfile): number {
    let score = 0;

    // 자주 이용하는 경로와의 유사성
    const similarPattern = profile.travelPatterns.find(pattern => 
      pattern.origin === route.origin.id || pattern.destination === route.destination.id
    );

    if (similarPattern) {
      score += 20;
      
      // 선호 교통수단 일치
      const hasPreferredTransport = route.routes.some(segment => 
        segment.transportType === similarPattern.transportType
      );
      if (hasPreferredTransport) {
        score += 15;
      }
    }

    return score;
  }

  /**
   * 알림 타이밍 계산
   */
  private calculateAlertTiming(
    user: User, 
    recommendedRoute: RecommendedRoute, 
    departureTime?: string
  ): AlertTiming {
    const baseNotificationTime = user.preferences.notificationTiming;
    const routeComplexity = recommendedRoute.transfers + 1;
    const congestionFactor = recommendedRoute.congestionScore > 70 ? 10 : 0;
    
    const adjustedNotificationTime = baseNotificationTime + (routeComplexity * 5) + congestionFactor;

    const departureDateTime = departureTime ? new Date(departureTime) : new Date();
    const alertTime = new Date(departureDateTime.getTime() - adjustedNotificationTime * 60 * 1000);

    return {
      alertTime: alertTime.toISOString(),
      minutesBeforeDeparture: adjustedNotificationTime,
      message: this.generateAlertMessage(recommendedRoute, adjustedNotificationTime),
      priority: recommendedRoute.congestionScore > 80 ? 'high' : 'normal'
    };
  }

  /**
   * 알림 메시지 생성
   */
  private generateAlertMessage(route: RecommendedRoute, minutesBefore: number): string {
    const congestionText = route.congestionScore > 70 ? '혼잡' : 
                          route.congestionScore > 40 ? '보통' : '여유';
    
    return `${minutesBefore}분 후 출발하시면 ${route.routes[0].routeName}으로 ${route.totalTime}분 소요됩니다. 현재 혼잡도: ${congestionText}`;
  }

  /**
   * 개인화된 인사이트 생성
   */
  private generatePersonalizedInsights(
    user: User, 
    behaviorProfile: UserBehaviorProfile | null, 
    routes: RecommendedRoute[]
  ): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = [];

    // 혼잡도 기반 인사이트
    const bestRoute = routes[0];
    if (bestRoute.congestionScore < 50) {
      insights.push({
        type: 'congestion-tip',
        message: '현재 시간대는 평소보다 덜 혼잡합니다. 지금 출발하시면 편안한 이동이 가능해요!',
        confidence: 0.8
      });
    }

    // 인센티브 인사이트
    if (bestRoute.incentivePoints && bestRoute.incentivePoints > 0) {
      insights.push({
        type: 'incentive-opportunity',
        message: `이 경로를 이용하시면 ${bestRoute.incentivePoints}포인트를 적립할 수 있어요!`,
        confidence: 0.9
      });
    }

    // 시간 절약 인사이트
    if (routes.length > 1) {
      const timeDifference = routes[1].totalTime - routes[0].totalTime;
      if (timeDifference > 10) {
        insights.push({
          type: 'time-saving',
          message: `추천 경로를 이용하시면 평소보다 ${timeDifference}분 절약할 수 있어요!`,
          confidence: 0.7
        });
      }
    }

    // 개인화 인사이트
    if (behaviorProfile && behaviorProfile.congestionSensitivity > 0.7) {
      insights.push({
        type: 'personalized-tip',
        message: '혼잡한 환경을 선호하지 않으시는 것 같아요. 30분 후 출발하시면 더 쾌적할 것 같습니다.',
        confidence: 0.6
      });
    }

    return insights;
  }

  /**
   * 추천 신뢰도 계산
   */
  private calculateRecommendationConfidence(routes: RecommendedRoute[]): number {
    if (routes.length === 0) return 0;

    const avgConfidence = routes.reduce((sum, route) => sum + route.confidence, 0) / routes.length;
    const routeVariety = Math.min(routes.length / 3, 1); // 경로 다양성
    
    return (avgConfidence + routeVariety) / 2;
  }

  /**
   * 역 이름으로 역 정보 찾기
   */
  private findStationByName(name: string): StationInfo | null {
    const stations = dataStore.getAllStations();
    return stations.find(station => 
      station.name.includes(name) || 
      station.id.includes(name.toLowerCase())
    ) || null;
  }
}

// 타입 정의
export interface PersonalizedRecommendation {
  userId: string;
  origin: StationInfo;
  destination: StationInfo;
  requestTime: string;
  departureTime: string;
  recommendedRoutes: RecommendedRoute[];
  alertTiming: AlertTiming;
  personalizedInsights: PersonalizedInsight[];
  confidence: number;
}

export interface AlertTiming {
  alertTime: string;
  minutesBeforeDeparture: number;
  message: string;
  priority: 'low' | 'normal' | 'high';
}

export interface PersonalizedInsight {
  type: 'congestion-tip' | 'incentive-opportunity' | 'time-saving' | 'personalized-tip';
  message: string;
  confidence: number;
}

// 싱글톤 인스턴스 생성
export const recommendationEngine = new RecommendationEngine();