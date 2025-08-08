import { CongestionGenerator } from '../congestionGenerator';
import { allRoutes } from '../../data/seoulTransit';

describe('CongestionGenerator', () => {
  let generator: CongestionGenerator;

  beforeEach(() => {
    generator = new CongestionGenerator();
  });

  describe('generateCurrentCongestion', () => {
    it('should generate congestion data for all routes and stations', () => {
      const congestionData = generator.generateCurrentCongestion();
      
      expect(congestionData).toBeDefined();
      expect(congestionData.length).toBeGreaterThan(0);
      
      // 모든 노선의 모든 역에 대한 데이터가 생성되는지 확인
      const expectedCount = allRoutes.reduce((sum, route) => sum + route.stations.length, 0);
      expect(congestionData.length).toBe(expectedCount);
    });

    it('should generate valid congestion data structure', () => {
      const congestionData = generator.generateCurrentCongestion();
      const firstData = congestionData[0];
      
      expect(firstData).toHaveProperty('id');
      expect(firstData).toHaveProperty('routeId');
      expect(firstData).toHaveProperty('stationId');
      expect(firstData).toHaveProperty('timestamp');
      expect(firstData).toHaveProperty('congestionLevel');
      expect(firstData).toHaveProperty('congestionPercentage');
      expect(firstData).toHaveProperty('passengerCount');
      expect(firstData).toHaveProperty('vehicleCapacity');
      expect(firstData).toHaveProperty('weatherCondition');
      expect(firstData).toHaveProperty('specialEvents');
      expect(firstData).toHaveProperty('source');
      expect(firstData).toHaveProperty('transportType');
    });

    it('should generate congestion percentage within valid range', () => {
      const congestionData = generator.generateCurrentCongestion();
      
      congestionData.forEach(data => {
        expect(data.congestionPercentage).toBeGreaterThanOrEqual(0);
        expect(data.congestionPercentage).toBeLessThanOrEqual(100);
      });
    });

    it('should generate consistent congestion level with percentage', () => {
      const congestionData = generator.generateCurrentCongestion();
      
      congestionData.forEach(data => {
        const { congestionPercentage, congestionLevel } = data;
        
        if (congestionPercentage <= 40) {
          expect(congestionLevel).toBe('low');
        } else if (congestionPercentage <= 70) {
          expect(congestionLevel).toBe('medium');
        } else {
          expect(congestionLevel).toBe('high');
        }
      });
    });

    it('should generate passenger count within vehicle capacity', () => {
      const congestionData = generator.generateCurrentCongestion();
      
      congestionData.forEach(data => {
        expect(data.passengerCount).toBeGreaterThanOrEqual(0);
        expect(data.passengerCount).toBeLessThanOrEqual(data.vehicleCapacity);
      });
    });
  });

  describe('generateCongestionForTime', () => {
    it('should generate congestion data for specific time', () => {
      const targetTime = new Date('2025-01-08T08:30:00Z');
      const congestionData = generator.generateCongestionForTime(targetTime);
      
      expect(congestionData).toBeDefined();
      expect(congestionData.length).toBeGreaterThan(0);
      
      // 모든 데이터의 타임스탬프가 지정된 시간인지 확인
      congestionData.forEach(data => {
        expect(data.timestamp).toBe(targetTime.toISOString());
      });
    });

    it('should apply weekend adjustment', () => {
      const weekday = new Date('2025-01-08T08:30:00Z'); // 수요일
      const weekend = new Date('2025-01-11T08:30:00Z'); // 토요일
      
      const weekdayData = generator.generateCongestionForTime(weekday);
      const weekendData = generator.generateCongestionForTime(weekend);
      
      // 주말 데이터의 평균 혼잡도가 평일보다 낮아야 함
      const weekdayAvg = weekdayData.reduce((sum, d) => sum + d.congestionPercentage, 0) / weekdayData.length;
      const weekendAvg = weekendData.reduce((sum, d) => sum + d.congestionPercentage, 0) / weekendData.length;
      
      expect(weekendAvg).toBeLessThan(weekdayAvg);
    });
  });

  describe('generateRouteRealtime', () => {
    it('should generate data for specific route only', () => {
      const routeId = 'line-2';
      const congestionData = generator.generateRouteRealtime(routeId);
      
      expect(congestionData).toBeDefined();
      expect(congestionData.length).toBeGreaterThan(0);
      
      // 모든 데이터가 지정된 노선의 것인지 확인
      congestionData.forEach(data => {
        expect(data.routeId).toBe(routeId);
      });
    });

    it('should return empty array for invalid route', () => {
      const invalidRouteId = 'invalid-route';
      const congestionData = generator.generateRouteRealtime(invalidRouteId);
      
      expect(congestionData).toEqual([]);
    });
  });

  describe('generateHistoricalData', () => {
    it('should generate historical data for specified days', () => {
      const days = 3;
      const historicalData = generator.generateHistoricalData(days);
      
      expect(historicalData).toBeDefined();
      expect(historicalData.length).toBeGreaterThan(0);
      
      // 데이터가 시간순으로 정렬되어 있는지 확인
      for (let i = 1; i < historicalData.length; i++) {
        const prevTime = new Date(historicalData[i - 1].timestamp);
        const currTime = new Date(historicalData[i].timestamp);
        expect(currTime.getTime()).toBeGreaterThanOrEqual(prevTime.getTime());
      }
    });

    it('should generate data for multiple time points per day', () => {
      const days = 1;
      const historicalData = generator.generateHistoricalData(days);
      
      // 하루에 여러 시간대 데이터가 생성되는지 확인
      const uniqueHours = new Set(
        historicalData.map(d => new Date(d.timestamp).getHours())
      );
      
      expect(uniqueHours.size).toBeGreaterThan(1);
    });
  });
});