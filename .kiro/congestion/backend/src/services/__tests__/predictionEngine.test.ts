import { MockPredictionEngine, PredictionContext } from '../predictionEngine';
import { weatherGenerator } from '../weatherGenerator';
import { eventGenerator } from '../eventGenerator';
import { dataStore } from '../dataStore';

describe('MockPredictionEngine', () => {
  let engine: MockPredictionEngine;
  let mockContext: PredictionContext;

  beforeEach(() => {
    engine = new MockPredictionEngine();
    
    mockContext = {
      routeId: 'line-2',
      currentTime: new Date('2025-01-08T08:00:00Z'),
      historicalData: [],
      weatherForecast: weatherGenerator.generateWeatherForecast(3),
      activeEvents: [],
      timeHorizon: 3,
      granularity: 15
    };
  });

  describe('predictCongestion', () => {
    it('should generate prediction data with correct structure', async () => {
      const prediction = await engine.predictCongestion(mockContext);
      
      expect(prediction).toHaveProperty('id');
      expect(prediction).toHaveProperty('routeId', 'line-2');
      expect(prediction).toHaveProperty('predictionTime');
      expect(prediction).toHaveProperty('predictions');
      expect(prediction).toHaveProperty('modelVersion');
      expect(prediction).toHaveProperty('accuracy');
      expect(prediction).toHaveProperty('transportType');
      
      expect(Array.isArray(prediction.predictions)).toBe(true);
      expect(prediction.predictions.length).toBeGreaterThan(0);
    });

    it('should generate predictions for specified time horizon', async () => {
      const timeHorizon = 2; // 2 hours
      const granularity = 30; // 30 minutes
      const expectedPredictions = timeHorizon * (60 / granularity); // 4 predictions
      
      const context = { ...mockContext, timeHorizon, granularity };
      const prediction = await engine.predictCongestion(context);
      
      expect(prediction.predictions).toHaveLength(expectedPredictions);
    });

    it('should generate valid prediction items', async () => {
      const prediction = await engine.predictCongestion(mockContext);
      
      prediction.predictions.forEach(item => {
        expect(item).toHaveProperty('time');
        expect(item).toHaveProperty('congestionLevel');
        expect(item).toHaveProperty('congestionPercentage');
        expect(item).toHaveProperty('confidence');
        
        expect(['low', 'medium', 'high']).toContain(item.congestionLevel);
        expect(item.congestionPercentage).toBeGreaterThanOrEqual(0);
        expect(item.congestionPercentage).toBeLessThanOrEqual(100);
        expect(item.confidence).toBeGreaterThanOrEqual(0);
        expect(item.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should have consistent congestion level and percentage', async () => {
      const prediction = await engine.predictCongestion(mockContext);
      
      prediction.predictions.forEach(item => {
        const { congestionPercentage, congestionLevel } = item;
        
        if (congestionPercentage <= 40) {
          expect(congestionLevel).toBe('low');
        } else if (congestionPercentage <= 70) {
          expect(congestionLevel).toBe('medium');
        } else {
          expect(congestionLevel).toBe('high');
        }
      });
    });

    it('should cache predictions for same context', async () => {
      const prediction1 = await engine.predictCongestion(mockContext);
      const prediction2 = await engine.predictCongestion(mockContext);
      
      // 캐시된 결과는 같은 ID를 가져야 함
      expect(prediction1.id).toBe(prediction2.id);
    });
  });

  describe('predictMultipleRoutes', () => {
    it('should generate predictions for multiple routes', async () => {
      const routeIds = ['line-1', 'line-2', 'bus-146'];
      const predictions = await engine.predictMultipleRoutes(routeIds, 2);
      
      expect(predictions).toHaveLength(routeIds.length);
      
      predictions.forEach((prediction, index) => {
        expect(prediction.routeId).toBe(routeIds[index]);
        expect(prediction.predictions.length).toBeGreaterThan(0);
      });
    });

    it('should handle empty route list', async () => {
      const predictions = await engine.predictMultipleRoutes([], 2);
      expect(predictions).toHaveLength(0);
    });
  });

  describe('validatePredictionAccuracy', () => {
    it('should calculate accuracy metrics correctly', () => {
      const predictions = [
        {
          time: '2025-01-08T08:00:00Z',
          congestionLevel: 'medium' as const,
          congestionPercentage: 60,
          confidence: 0.8
        },
        {
          time: '2025-01-08T08:15:00Z',
          congestionLevel: 'high' as const,
          congestionPercentage: 80,
          confidence: 0.7
        }
      ];

      const actualData = [
        {
          id: 'actual-1',
          routeId: 'line-2',
          stationId: 'station-1',
          timestamp: '2025-01-08T08:00:00Z',
          congestionLevel: 'medium' as const,
          congestionPercentage: 65,
          passengerCount: 900,
          vehicleCapacity: 1400,
          weatherCondition: 'clear' as const,
          specialEvents: [],
          source: 'realtime-sensor' as const,
          transportType: 'subway' as const
        },
        {
          id: 'actual-2',
          routeId: 'line-2',
          stationId: 'station-1',
          timestamp: '2025-01-08T08:15:00Z',
          congestionLevel: 'high' as const,
          congestionPercentage: 75,
          passengerCount: 1050,
          vehicleCapacity: 1400,
          weatherCondition: 'clear' as const,
          specialEvents: [],
          source: 'realtime-sensor' as const,
          transportType: 'subway' as const
        }
      ];

      const accuracy = engine.validatePredictionAccuracy(predictions, actualData);
      
      expect(accuracy).toHaveProperty('mae');
      expect(accuracy).toHaveProperty('rmse');
      expect(accuracy).toHaveProperty('mape');
      expect(accuracy).toHaveProperty('accuracy');
      expect(accuracy).toHaveProperty('confidence');
      
      expect(accuracy.mae).toBeGreaterThanOrEqual(0);
      expect(accuracy.accuracy).toBeGreaterThanOrEqual(0);
      expect(accuracy.accuracy).toBeLessThanOrEqual(1);
    });

    it('should handle empty data gracefully', () => {
      const accuracy = engine.validatePredictionAccuracy([], []);
      
      expect(accuracy.mae).toBe(0);
      expect(accuracy.rmse).toBe(0);
      expect(accuracy.mape).toBe(0);
      expect(accuracy.accuracy).toBe(0);
      expect(accuracy.confidence).toBe(0);
    });
  });

  describe('analyzeModelPerformance', () => {
    beforeEach(() => {
      // 테스트용 데이터 설정
      jest.spyOn(dataStore, 'getPredictionsByRoute').mockReturnValue([]);
      jest.spyOn(dataStore, 'getCongestionDataByRoute').mockReturnValue([]);
    });

    it('should analyze model performance with correct structure', () => {
      const analysis = engine.analyzeModelPerformance('line-2', 7);
      
      expect(analysis).toHaveProperty('overallAccuracy');
      expect(analysis).toHaveProperty('timeOfDayAccuracy');
      expect(analysis).toHaveProperty('weatherImpactAccuracy');
      
      expect(typeof analysis.timeOfDayAccuracy).toBe('object');
      expect(typeof analysis.weatherImpactAccuracy).toBe('object');
    });

    it('should analyze all 24 hours', () => {
      const analysis = engine.analyzeModelPerformance('line-2', 7);
      
      // 24시간 모두 분석되어야 함
      for (let hour = 0; hour < 24; hour++) {
        expect(analysis.timeOfDayAccuracy).toHaveProperty(hour.toString());
      }
    });

    it('should analyze all weather conditions', () => {
      const analysis = engine.analyzeModelPerformance('line-2', 7);
      const weatherConditions = ['clear', 'cloudy', 'rainy', 'snowy', 'foggy'];
      
      weatherConditions.forEach(weather => {
        expect(analysis.weatherImpactAccuracy).toHaveProperty(weather);
      });
    });
  });
});