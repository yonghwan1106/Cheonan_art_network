import { generateId, getCurrentTimestamp, getRandomElement } from '../utils/helpers';

/**
 * 특수 이벤트 타입
 */
export type EventType = 
  | 'concert' 
  | 'sports' 
  | 'festival' 
  | 'protest' 
  | 'construction' 
  | 'accident' 
  | 'delay' 
  | 'signal_failure' 
  | 'rescue' 
  | 'weather_disruption'
  | 'holiday'
  | 'rush_hour_special';

/**
 * 특수 이벤트 데이터
 */
export interface EventData {
  id: string;
  type: EventType;
  title: string;
  description: string;
  location: {
    stationIds: string[];
    routeIds: string[];
    area: string;
  };
  timeRange: {
    start: string;
    end: string;
    duration: number; // minutes
  };
  impact: EventImpact;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  source: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 이벤트가 교통에 미치는 영향
 */
export interface EventImpact {
  congestionIncrease: number; // 퍼센트
  delayProbability: number; // 0-1
  affectedRoutes: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  alternativeRoutes?: string[];
}

/**
 * 특수 이벤트 생성 서비스
 * 서울 지역의 다양한 이벤트와 돌발 상황을 시뮬레이션합니다.
 */
export class EventGenerator {
  private readonly eventTemplates = {
    concert: {
      titles: ['K-POP 콘서트', '클래식 공연', '록 페스티벌', '아이돌 팬미팅'],
      locations: ['jamsil', 'yeouido', 'hongik-univ', 'gangnam'],
      duration: { min: 180, max: 300 },
      impact: { congestionIncrease: 30, severity: 'high' as const }
    },
    sports: {
      titles: ['야구 경기', '축구 경기', '농구 경기', '올림픽 경기'],
      locations: ['jamsil', 'yeouido'],
      duration: { min: 120, max: 240 },
      impact: { congestionIncrease: 25, severity: 'high' as const }
    },
    festival: {
      titles: ['벚꽃축제', '한강축제', '불꽃축제', '문화축제'],
      locations: ['yeouido', 'hangangjin', 'hongik-univ'],
      duration: { min: 300, max: 600 },
      impact: { congestionIncrease: 20, severity: 'medium' as const }
    },
    protest: {
      titles: ['집회', '시위', '행진', '집단행동'],
      locations: ['yeouido', 'jonggak', 'myeongdong'],
      duration: { min: 60, max: 300 },
      impact: { congestionIncrease: 35, severity: 'high' as const }
    },
    construction: {
      titles: ['도로공사', '지하철공사', '건물공사', '인프라 보수'],
      locations: ['gangnam', 'hongik-univ', 'seoul-station'],
      duration: { min: 480, max: 1440 }, // 8-24시간
      impact: { congestionIncrease: 15, severity: 'medium' as const }
    },
    accident: {
      titles: ['교통사고', '추돌사고', '차량고장', '응급상황'],
      locations: ['gangnam', 'jamsil', 'hongik-univ'],
      duration: { min: 30, max: 120 },
      impact: { congestionIncrease: 40, severity: 'critical' as const }
    },
    delay: {
      titles: ['지연운행', '운행중단', '차량점검', '시설점검'],
      locations: ['line-2', 'line-9', 'line-1'],
      duration: { min: 15, max: 60 },
      impact: { congestionIncrease: 20, severity: 'medium' as const }
    },
    signal_failure: {
      titles: ['신호장애', '시스템오류', '통신장애', '전력장애'],
      locations: ['line-2', 'line-1', 'line-3'],
      duration: { min: 20, max: 90 },
      impact: { congestionIncrease: 30, severity: 'high' as const }
    },
    rescue: {
      titles: ['승객구조', '응급환자', '안전사고', '구조작업'],
      locations: ['gangnam', 'seoul-station', 'jamsil'],
      duration: { min: 10, max: 45 },
      impact: { congestionIncrease: 25, severity: 'high' as const }
    },
    weather_disruption: {
      titles: ['기상악화', '폭우영향', '폭설영향', '강풍영향'],
      locations: ['line-1', 'line-2', 'bus-146'],
      duration: { min: 60, max: 360 },
      impact: { congestionIncrease: 35, severity: 'high' as const }
    },
    holiday: {
      titles: ['설날', '추석', '어린이날', '크리스마스', '신정'],
      locations: ['seoul-station', 'gangnam', 'jamsil'],
      duration: { min: 720, max: 1440 }, // 12-24시간
      impact: { congestionIncrease: -20, severity: 'low' as const } // 공휴일은 혼잡도 감소
    },
    rush_hour_special: {
      titles: ['출근길 집중', '퇴근길 집중', '등교시간', '하교시간'],
      locations: ['gangnam', 'yeouido', 'hongik-univ'],
      duration: { min: 90, max: 180 },
      impact: { congestionIncrease: 15, severity: 'medium' as const }
    }
  };

  private activeEvents: Map<string, EventData> = new Map();

  /**
   * 랜덤 이벤트 생성
   */
  generateRandomEvent(): EventData {
    const eventTypes = Object.keys(this.eventTemplates) as EventType[];
    const eventType = getRandomElement(eventTypes) ?? 'accident'; // 기본값으로 'accident' 사용
    
    return this.generateEventByType(eventType);
  }

  /**
   * 특정 타입의 이벤트 생성
   */
  generateEventByType(eventType: EventType): EventData {
    const template = this.eventTemplates[eventType];
    const now = new Date();
    
    // 이벤트 시작 시간 (현재부터 24시간 이내)
    const startTime = new Date(now.getTime() + Math.random() * 24 * 60 * 60 * 1000);
    
    // 이벤트 지속 시간
    const duration = Math.floor(
      Math.random() * (template.duration.max - template.duration.min) + template.duration.min
    );
    
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    
    // 영향받는 위치 선택
    const affectedLocation = getRandomElement(template.locations) ?? 'gangnam'; // 기본값으로 'gangnam' 사용
    const affectedRoutes = this.getAffectedRoutes(affectedLocation, eventType);
    
    const event: EventData = {
      id: generateId('event'),
      type: eventType,
      title: getRandomElement(template.titles) ?? `${eventType} 이벤트`, // 기본 타이틀 제공
      description: this.generateEventDescription(eventType, affectedLocation),
      location: {
        stationIds: [affectedLocation],
        routeIds: affectedRoutes,
        area: this.getAreaName(affectedLocation)
      },
      timeRange: {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        duration
      },
      impact: this.calculateEventImpact(eventType, template.impact, affectedRoutes),
      status: startTime <= now ? 'active' : 'scheduled',
      source: 'event-generator',
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };

    return event;
  }

  /**
   * 예정된 이벤트 생성 (공휴일, 정기 행사 등)
   */
  generateScheduledEvents(days: number = 30): EventData[] {
    const scheduledEvents: EventData[] = [];
    const now = new Date();

    // 주요 공휴일 및 정기 행사
    const scheduledEventData = [
      { type: 'holiday' as EventType, date: '2025-01-01', title: '신정' },
      { type: 'holiday' as EventType, date: '2025-02-10', title: '설날' },
      { type: 'festival' as EventType, date: '2025-04-15', title: '벚꽃축제' },
      { type: 'concert' as EventType, date: '2025-05-01', title: '어린이날 특별공연' },
    ];

    scheduledEventData.forEach(eventInfo => {
      const eventDate = new Date(eventInfo.date);
      if (eventDate >= now && eventDate <= new Date(now.getTime() + days * 24 * 60 * 60 * 1000)) {
        const event = this.generateEventByType(eventInfo.type);
        event.title = eventInfo.title;
        event.timeRange.start = eventDate.toISOString();
        event.timeRange.end = new Date(eventDate.getTime() + 12 * 60 * 60 * 1000).toISOString();
        event.status = 'scheduled';
        
        scheduledEvents.push(event);
      }
    });

    return scheduledEvents;
  }

  /**
   * 돌발 상황 시뮬레이션
   */
  simulateEmergencyEvent(): EventData {
    const emergencyTypes: EventType[] = ['accident', 'signal_failure', 'rescue', 'weather_disruption'];
    const eventType = getRandomElement(emergencyTypes) ?? 'accident'; // 기본값으로 'accident' 사용
    
    const event = this.generateEventByType(eventType);
    event.status = 'active';
    event.timeRange.start = getCurrentTimestamp();
    
    // 돌발 상황은 즉시 시작
    const now = new Date();
    event.timeRange.end = new Date(now.getTime() + event.timeRange.duration * 60 * 1000).toISOString();
    
    return event;
  }

  /**
   * 이벤트 관리
   */
  addActiveEvent(event: EventData): void {
    this.activeEvents.set(event.id, event);
    console.log(`📅 Event added: ${event.title} (${event.type})`);
  }

  getActiveEvents(): EventData[] {
    return Array.from(this.activeEvents.values())
      .filter(event => event.status === 'active');
  }

  updateEventStatus(eventId: string, status: EventData['status']): boolean {
    const event = this.activeEvents.get(eventId);
    if (event) {
      event.status = status;
      event.updatedAt = getCurrentTimestamp();
      return true;
    }
    return false;
  }

  /**
   * 이벤트 자동 관리 시뮬레이션
   */
  simulateEventLifecycle(): void {
    // 새 이벤트 생성 (1시간마다)
    setInterval(() => {
      if (Math.random() < 0.3) { // 30% 확률
        const newEvent = this.generateRandomEvent();
        this.addActiveEvent(newEvent);
      }
    }, 60 * 60 * 1000);

    // 돌발 상황 생성 (30분마다 체크)
    setInterval(() => {
      if (Math.random() < 0.1) { // 10% 확률
        const emergencyEvent = this.simulateEmergencyEvent();
        this.addActiveEvent(emergencyEvent);
        console.log(`🚨 Emergency event: ${emergencyEvent.title}`);
      }
    }, 30 * 60 * 1000);

    // 이벤트 상태 업데이트 (10분마다)
    setInterval(() => {
      const now = new Date();
      
      this.activeEvents.forEach((event, eventId) => {
        const endTime = new Date(event.timeRange.end);
        
        if (now >= endTime && event.status === 'active') {
          this.updateEventStatus(eventId, 'completed');
          console.log(`✅ Event completed: ${event.title}`);
        }
      });
    }, 10 * 60 * 1000);
  }

  // === Private Helper Methods ===

  private getAffectedRoutes(location: string, eventType: EventType): string[] {
    // 위치와 이벤트 타입에 따른 영향받는 노선 결정
    const routeMapping: { [key: string]: string[] } = {
      'gangnam': ['line-2', 'line-3', 'bus-146'],
      'hongik-univ': ['line-2', 'line-6', 'bus-472'],
      'jamsil': ['line-2', 'line-8', 'bus-146'],
      'yeouido': ['line-5', 'line-9', 'bus-6002'],
      'seoul-station': ['line-1', 'line-4'],
      'myeongdong': ['line-4', 'bus-146'],
      'line-1': ['line-1'],
      'line-2': ['line-2'],
      'line-3': ['line-3']
    };

    const baseRoutes = routeMapping[location] || [];
    
    // 이벤트 타입에 따른 추가 영향
    if (eventType === 'protest' || eventType === 'festival') {
      // 대규모 이벤트는 주변 노선도 영향
      return [...baseRoutes, ...this.getNearbyRoutes(location)];
    }

    return baseRoutes;
  }

  private getNearbyRoutes(location: string): string[] {
    const nearbyMapping: { [key: string]: string[] } = {
      'gangnam': ['line-7', 'bus-472'],
      'hongik-univ': ['line-2', 'bus-146'],
      'jamsil': ['line-3', 'bus-472'],
      'yeouido': ['line-1', 'bus-146']
    };

    return nearbyMapping[location] || [];
  }

  private calculateEventImpact(
    eventType: EventType, 
    templateImpact: { congestionIncrease: number; severity: 'low' | 'medium' | 'high' | 'critical' }, 
    affectedRoutes: string[]
  ): EventImpact {
    const baseIncrease = templateImpact.congestionIncrease;
    const severity = templateImpact.severity;
    
    // 영향받는 노선 수에 따른 보정
    const routeMultiplier = Math.min(2, affectedRoutes.length * 0.2 + 1);
    const finalIncrease = Math.floor(baseIncrease * routeMultiplier);
    
    const delayProbability = this.getDelayProbability(severity);
    const recommendations = this.generateRecommendations(eventType, severity);
    const alternativeRoutes = this.getAlternativeRoutes(affectedRoutes);

    return {
      congestionIncrease: finalIncrease,
      delayProbability,
      affectedRoutes,
      severity,
      recommendations,
      alternativeRoutes
    };
  }

  private getDelayProbability(severity: 'low' | 'medium' | 'high' | 'critical'): number {
    switch (severity) {
      case 'low': return 0.1;
      case 'medium': return 0.3;
      case 'high': return 0.6;
      case 'critical': return 0.9;
    }
  }

  private generateRecommendations(eventType: EventType, severity: 'low' | 'medium' | 'high' | 'critical'): string[] {
    const baseRecommendations: { [key in EventType]: string[] } = {
      concert: ['대중교통 이용 권장', '여유시간 확보', '혼잡시간 피하기'],
      sports: ['경기 시작 2시간 전 출발', '대중교통 이용', '주변 주차장 만차 예상'],
      festival: ['대중교통 필수', '도보 이동 구간 있음', '혼잡 지속 예상'],
      protest: ['우회 경로 이용', '해당 지역 피하기', '교통통제 가능'],
      construction: ['우회 도로 이용', '공사시간 확인', '소음 주의'],
      accident: ['즉시 우회', '응급차량 양보', '안전운전'],
      delay: ['대체 교통수단 이용', '지연 정보 확인', '여유시간 확보'],
      signal_failure: ['복구 시간 확인', '대체 노선 이용', '실시간 정보 확인'],
      rescue: ['해당 구간 피하기', '응급상황 협조', '우회 경로 이용'],
      weather_disruption: ['기상 정보 확인', '안전 우선', '불필요한 외출 자제'],
      holiday: ['평소보다 여유로운 교통', '관광지 혼잡 예상', '대중교통 감편 운행'],
      rush_hour_special: ['출퇴근 시간 조정', '재택근무 고려', '대중교통 이용']
    };

    const recommendations = [...baseRecommendations[eventType]];
    
    if (severity === 'critical') {
      recommendations.unshift('긴급상황 - 즉시 대응 필요');
    } else if (severity === 'high') {
      recommendations.unshift('심각한 지연 예상');
    }

    return recommendations;
  }

  private getAlternativeRoutes(affectedRoutes: string[]): string[] {
    const allRoutes = ['line-1', 'line-2', 'line-3', 'line-4', 'line-5', 'line-6', 'line-7', 'line-8', 'line-9', 'bus-146', 'bus-472', 'bus-6002'];
    return allRoutes.filter(route => !affectedRoutes.includes(route)).slice(0, 3);
  }

  private generateEventDescription(eventType: EventType, location: string): string {
    const locationName = this.getAreaName(location);
    const descriptions: { [key in EventType]: string } = {
      concert: `${locationName} 일대에서 대규모 콘서트가 개최됩니다.`,
      sports: `${locationName}에서 스포츠 경기로 인한 교통 혼잡이 예상됩니다.`,
      festival: `${locationName} 지역 축제로 인한 도로 통제 및 혼잡이 있습니다.`,
      protest: `${locationName} 일대 집회로 인한 교통 통제가 시행됩니다.`,
      construction: `${locationName} 지역 공사로 인한 교통 우회가 필요합니다.`,
      accident: `${locationName}에서 교통사고가 발생하여 통행에 지장이 있습니다.`,
      delay: `${locationName} 노선에서 지연 운행이 발생하고 있습니다.`,
      signal_failure: `${locationName} 구간에서 신호 장애가 발생했습니다.`,
      rescue: `${locationName}에서 응급 상황으로 인한 일시적 운행 중단입니다.`,
      weather_disruption: `기상 악화로 인해 ${locationName} 일대 교통에 영향이 있습니다.`,
      holiday: `${locationName} 지역은 공휴일로 인한 교통량 변화가 있습니다.`,
      rush_hour_special: `${locationName} 일대에서 출퇴근 시간 집중으로 인한 혼잡입니다.`
    };

    return descriptions[eventType];
  }

  private getAreaName(location: string): string {
    const areaNames: { [key: string]: string } = {
      'gangnam': '강남',
      'hongik-univ': '홍대',
      'jamsil': '잠실',
      'yeouido': '여의도',
      'seoul-station': '서울역',
      'myeongdong': '명동',
      'line-1': '1호선',
      'line-2': '2호선',
      'line-3': '3호선'
    };

    return areaNames[location] || location;
  }
}

// 싱글톤 인스턴스 생성
export const eventGenerator = new EventGenerator();