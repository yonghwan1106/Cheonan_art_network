import { 
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
  generateRandomCongestion,
  getRandomElement
} from '../utils/helpers';
import { allRoutes, allStations } from '../data/seoulTransit';
import { dataStore } from './dataStore';

/**
 * 혼잡도 데이터 생성 서비스
 * 현실적인 패턴을 가진 가상 혼잡도 데이터를 생성합니다.
 */
export class CongestionGenerator {
  private weatherConditions: WeatherCondition[] = ['clear', 'cloudy', 'rainy', 'snowy', 'foggy'];
  private specialEvents: string[] = [
    '콘서트', '스포츠 경기', '축제', '시위', '공사', '사고', 
    '지연운행', '신호장애', '승객구조', '기상악화'
  ];

  /**
   * 현재 시간 기준 실시간 혼잡도 데이터 생성
   */
  generateCurrentCongestion(): CongestionData[] {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentWeather = this.getCurrentWeather();
    
    const congestionData: CongestionData[] = [];

    // 모든 노선에 대해 혼잡도 데이터 생성
    allRoutes.forEach(route => {
      route.stations.forEach(station => {
        const baseCongestionLevel = getCongestionByTimePattern(currentHour, currentMinute);
        const basePercentage = generateRandomCongestion(baseCongestionLevel);
        const transportBaseline = getBaselineByTransportType(route.transportType);
        
        // 교통수단별 기본값과 시간 패턴 조합
        let finalPercentage = Math.floor((basePercentage + transportBaseline) / 2);
        
        // 날씨 보정
        finalPercentage = adjustCongestionForWeather(finalPercentage, currentWeather);
        
        // 특수 이벤트 적용 (10% 확률)
        const hasSpecialEvent = Math.random() < 0.1;
        const events = hasSpecialEvent ? [getRandomElement(this.specialEvents)] : [];
        
        if (hasSpecialEvent) {
          finalPercentage = Math.min(100, finalPercentage + Math.floor(Math.random() * 20));
        }

        const congestionData_item: CongestionData = {
          id: generateId('congestion'),
          routeId: route.id,
          stationId: station.id,
          timestamp: getCurrentTimestamp(),
          congestionLevel: this.getLevel(finalPercentage),
          congestionPercentage: finalPercentage,
          passengerCount: this.calculatePassengerCount(finalPercentage, route.transportType),
          vehicleCapacity: this.getVehicleCapacity(route.transportType),
          weatherCondition: currentWeather,
          specialEvents: events,
          source: 'realtime-sensor',
          transportType: route.transportType
        };

        congestionData.push(congestionData_item);
      });
    });

    return congestionData;
  }

  /**
   * 특정 시간대의 혼잡도 데이터 생성
   */
  generateCongestionForTime(targetTime: Date): CongestionData[] {
    const hour = targetTime.getHours();
    const minute = targetTime.getMinutes();
    const weather = this.getWeatherForTime(targetTime);
    
    const congestionData: CongestionData[] = [];

    allRoutes.forEach(route => {
      route.stations.forEach(station => {
        const baseCongestionLevel = getCongestionByTimePattern(hour, minute);
        let percentage = generateRandomCongestion(baseCongestionLevel);
        
        // 교통수단별 보정
        const transportBaseline = getBaselineByTransportType(route.transportType);
        percentage = Math.floor((percentage + transportBaseline) / 2);
        
        // 날씨 보정
        percentage = adjustCongestionForWeather(percentage, weather);
        
        // 주말/공휴일 보정
        if (this.isWeekend(targetTime)) {
          percentage = Math.floor(percentage * 0.7); // 주말은 30% 감소
        }

        const congestionData_item: CongestionData = {
          id: generateId('congestion'),
          routeId: route.id,
          stationId: station.id,
          timestamp: targetTime.toISOString(),
          congestionLevel: this.getLevel(percentage),
          congestionPercentage: percentage,
          passengerCount: this.calculatePassengerCount(percentage, route.transportType),
          vehicleCapacity: this.getVehicleCapacity(route.transportType),
          weatherCondition: weather,
          specialEvents: [],
          source: 'realtime-sensor',
          transportType: route.transportType
        };

        congestionData.push(congestionData_item);
      });
    });

    return congestionData;
  }

  /**
   * 과거 데이터 생성 (분석용)
   */
  generateHistoricalData(days: number = 7): CongestionData[] {
    const historicalData: CongestionData[] = [];
    const now = new Date();

    for (let day = 0; day < days; day++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - day);

      // 하루 중 주요 시간대 데이터 생성 (2시간 간격)
      for (let hour = 6; hour <= 22; hour += 2) {
        const targetTime = new Date(targetDate);
        targetTime.setHours(hour, 0, 0, 0);
        
        const dayData = this.generateCongestionForTime(targetTime);
        historicalData.push(...dayData);
      }
    }

    return historicalData;
  }

  /**
   * 특정 노선의 실시간 혼잡도 생성
   */
  generateRouteRealtime(routeId: string): CongestionData[] {
    const route = allRoutes.find(r => r.id === routeId);
    if (!route) return [];

    const now = new Date();
    const currentWeather = this.getCurrentWeather();
    const congestionData: CongestionData[] = [];

    route.stations.forEach(station => {
      const baseCongestionLevel = getCongestionByTimePattern(now.getHours(), now.getMinutes());
      let percentage = generateRandomCongestion(baseCongestionLevel);
      
      // 노선별 특성 반영
      percentage = this.adjustForRouteCharacteristics(percentage, routeId);
      
      // 날씨 보정
      percentage = adjustCongestionForWeather(percentage, currentWeather);

      const congestionData_item: CongestionData = {
        id: generateId('congestion'),
        routeId: route.id,
        stationId: station.id,
        timestamp: getCurrentTimestamp(),
        congestionLevel: this.getLevel(percentage),
        congestionPercentage: percentage,
        passengerCount: this.calculatePassengerCount(percentage, route.transportType),
        vehicleCapacity: this.getVehicleCapacity(route.transportType),
        weatherCondition: currentWeather,
        specialEvents: [],
        source: 'realtime-sensor',
        transportType: route.transportType
      };

      congestionData.push(congestionData_item);
    });

    return congestionData;
  }

  /**
   * 혼잡도 시뮬레이션 (실시간 업데이트용)
   */
  simulateRealtimeUpdates(): void {
    setInterval(() => {
      const currentData = this.generateCurrentCongestion();
      
      // 데이터 저장소에 저장
      currentData.forEach(data => {
        dataStore.createCongestionData(data);
      });

      console.log(`📊 Generated ${currentData.length} congestion data points`);
    }, 5 * 60 * 1000); // 5분마다 업데이트
  }

  // === Private Helper Methods ===

  private getLevel(percentage: number): CongestionLevel {
    if (percentage <= 40) return 'low';
    if (percentage <= 70) return 'medium';
    return 'high';
  }

  private getCurrentWeather(): WeatherCondition {
    // 현실적인 날씨 분포 (서울 기준)
    const weatherProbabilities = {
      clear: 0.4,
      cloudy: 0.3,
      rainy: 0.2,
      foggy: 0.08,
      snowy: 0.02
    };

    const random = Math.random();
    let cumulative = 0;

    for (const [weather, probability] of Object.entries(weatherProbabilities)) {
      cumulative += probability;
      if (random <= cumulative) {
        return weather as WeatherCondition;
      }
    }

    return 'clear';
  }

  private getWeatherForTime(time: Date): WeatherCondition {
    // 시간대별 날씨 패턴 (간단한 시뮬레이션)
    const hour = time.getHours();
    
    if (hour >= 6 && hour <= 8) {
      // 아침 시간대는 안개 확률 높음
      return Math.random() < 0.3 ? 'foggy' : this.getCurrentWeather();
    }
    
    return this.getCurrentWeather();
  }

  private calculatePassengerCount(percentage: number, transportType: TransportType): number {
    const capacity = this.getVehicleCapacity(transportType);
    return Math.floor((capacity * percentage) / 100);
  }

  private getVehicleCapacity(transportType: TransportType): number {
    switch (transportType) {
      case 'subway':
        return 1400; // 지하철 10량 편성 기준
      case 'bus':
        return 90;   // 시내버스 기준
      case 'shuttle':
        return 45;   // 셔틀버스 기준
      default:
        return 100;
    }
  }

  private isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // 일요일(0) 또는 토요일(6)
  }

  private adjustForRouteCharacteristics(percentage: number, routeId: string): number {
    // 노선별 특성 반영
    const routeAdjustments: { [key: string]: number } = {
      'line-2': 10,  // 2호선은 항상 혼잡
      'line-9': 15,  // 9호선은 매우 혼잡
      'line-1': 5,   // 1호선은 약간 혼잡
      'bus-6002': -10, // 광역버스는 상대적으로 여유
    };

    const adjustment = routeAdjustments[routeId] || 0;
    return Math.max(0, Math.min(100, percentage + adjustment));
  }

  /**
   * 특수 상황 시뮬레이션
   */
  simulateSpecialEvent(eventType: string, affectedRoutes: string[], duration: number): void {
    console.log(`🚨 Special event simulation: ${eventType} for ${duration} minutes`);
    
    const endTime = Date.now() + duration * 60 * 1000;
    
    const eventInterval = setInterval(() => {
      if (Date.now() > endTime) {
        clearInterval(eventInterval);
        console.log(`✅ Special event ended: ${eventType}`);
        return;
      }

      affectedRoutes.forEach(routeId => {
        const route = allRoutes.find(r => r.id === routeId);
        if (!route) return;

        route.stations.forEach(station => {
          const basePercentage = generateRandomCongestion('high');
          const eventData: CongestionData = {
            id: generateId('congestion'),
            routeId: route.id,
            stationId: station.id,
            timestamp: getCurrentTimestamp(),
            congestionLevel: 'high',
            congestionPercentage: Math.min(100, basePercentage + 20),
            passengerCount: this.calculatePassengerCount(basePercentage + 20, route.transportType),
            vehicleCapacity: this.getVehicleCapacity(route.transportType),
            weatherCondition: this.getCurrentWeather(),
            specialEvents: [eventType],
            source: 'realtime-sensor',
            transportType: route.transportType
          };

          dataStore.createCongestionData(eventData);
        });
      });
    }, 2 * 60 * 1000); // 2분마다 업데이트
  }
}

// 싱글톤 인스턴스 생성
export const congestionGenerator = new CongestionGenerator();