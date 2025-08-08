import express, { Request, Response } from 'express';
import { AuthenticatedRequest, optionalAuth } from '../middleware/auth';
import { congestionGenerator } from '../services/congestionGenerator';
import { integratedPredictionService } from '../services/integratedPredictionService';
import { dataStore } from '../services/dataStore';
import { weatherGenerator } from '../services/weatherGenerator';
import { eventGenerator } from '../services/eventGenerator';
import { validators } from '../utils/helpers';

const router = express.Router();

/**
 * 현재 혼잡도 조회
 * GET /api/congestion/current
 */
router.get('/current', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { 
    location, 
    radius = 1000, 
    transportTypes = 'subway,bus',
    limit = 50 
  } = req.query;

  try {
    // 현재 혼잡도 데이터 생성
    let congestionData = congestionGenerator.generateCurrentCongestion();

    // 교통수단 타입 필터링
    const allowedTypes = (transportTypes as string).split(',');
    congestionData = congestionData.filter(data => 
      allowedTypes.includes(data.transportType)
    );

    // 위치 기반 필터링 (시뮬레이션)
    if (location) {
      const [lat, lng] = (location as string).split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        // 간단한 거리 기반 필터링 (실제로는 더 정교한 지리적 계산 필요)
        congestionData = congestionData.slice(0, Math.floor(congestionData.length * 0.3));
      }
    }

    // 결과 제한
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    congestionData = congestionData.slice(0, limitNum);

    // 사용자별 개인화 (로그인된 경우)
    if (req.user) {
      const userPreferences = req.user.preferences;
      
      // 혼잡도 허용 수준에 따른 필터링
      if (userPreferences.congestionTolerance === 'low') {
        congestionData = congestionData.filter(data => data.congestionLevel !== 'high');
      }
    }

    // 응답 데이터 구성
    const responseData = {
      timestamp: new Date().toISOString(),
      location: location ? { lat: parseFloat((location as string).split(',')[0]), lng: parseFloat((location as string).split(',')[1]) } : null,
      radius: parseInt(radius as string),
      transportTypes: allowedTypes,
      totalResults: congestionData.length,
      data: congestionData.map(data => ({
        id: data.id,
        routeId: data.routeId,
        stationId: data.stationId,
        routeName: getRouteName(data.routeId),
        stationName: getStationName(data.stationId),
        congestionLevel: data.congestionLevel,
        congestionPercentage: data.congestionPercentage,
        passengerCount: data.passengerCount,
        vehicleCapacity: data.vehicleCapacity,
        transportType: data.transportType,
        weatherCondition: data.weatherCondition,
        specialEvents: data.specialEvents,
        lastUpdated: data.timestamp
      }))
    };

    res.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching current congestion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch congestion data',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 혼잡도 예측 조회
 * GET /api/congestion/prediction
 */
router.get('/prediction', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { 
    routeId, 
    timeRange = '3', 
    date,
    granularity = '15'
  } = req.query;

  try {
    if (!routeId) {
      return res.status(400).json({
        success: false,
        error: 'Route ID is required',
        timestamp: new Date().toISOString()
      });
    }

    // 노선 존재 확인
    const route = dataStore.getRouteById(routeId as string);
    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found',
        timestamp: new Date().toISOString()
      });
    }

    const timeHours = Math.min(parseInt(timeRange as string), 6); // 최대 6시간
    const granularityMinutes = Math.max(parseInt(granularity as string), 5); // 최소 5분

    // 예측 데이터 조회
    const prediction = await integratedPredictionService.getRoutePrediction(
      routeId as string, 
      timeHours
    );

    if (!prediction) {
      return res.status(404).json({
        success: false,
        error: 'Prediction data not available',
        timestamp: new Date().toISOString()
      });
    }

    // 사용자 개인화 적용
    let personalizedPredictions = prediction.predictions;
    if (req.user) {
      const userTolerance = req.user.preferences.congestionTolerance;
      
      // 개인화된 추천 메시지 추가
      personalizedPredictions = personalizedPredictions.map(pred => ({
        ...pred,
        recommendation: generatePersonalizedRecommendation(pred, userTolerance),
        userSpecific: true
      }));
    }

    const responseData = {
      routeId: prediction.routeId,
      routeName: getRouteName(prediction.routeId),
      transportType: prediction.transportType,
      predictionTime: prediction.predictionTime,
      timeRange: timeHours,
      granularity: granularityMinutes,
      modelVersion: prediction.modelVersion,
      accuracy: prediction.accuracy,
      predictions: personalizedPredictions,
      metadata: {
        totalPredictions: personalizedPredictions.length,
        averageConfidence: personalizedPredictions.reduce((sum, p) => sum + p.confidence, 0) / personalizedPredictions.length,
        highCongestionPeriods: personalizedPredictions.filter(p => p.congestionLevel === 'high').length,
        recommendedDepartureTimes: personalizedPredictions
          .filter(p => p.congestionLevel === 'low')
          .slice(0, 3)
          .map(p => p.time)
      }
    };

    res.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching prediction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prediction data',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 특정 노선의 실시간 혼잡도
 * GET /api/congestion/route/:routeId
 */
router.get('/route/:routeId', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { routeId } = req.params;
  const { includeStations = 'true' } = req.query;

  try {
    // 노선 존재 확인
    const route = dataStore.getRouteById(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found',
        timestamp: new Date().toISOString()
      });
    }

    // 노선별 실시간 혼잡도 생성
    const congestionData = congestionGenerator.generateRouteRealtime(routeId);

    // 역별 상세 정보 포함 여부
    const includeStationDetails = includeStations === 'true';

    const responseData = {
      route: {
        id: route.id,
        name: route.name,
        transportType: route.transportType,
        operatingHours: route.operatingHours,
        averageInterval: route.averageInterval
      },
      congestionSummary: {
        averageCongestion: Math.round(
          congestionData.reduce((sum, d) => sum + d.congestionPercentage, 0) / congestionData.length
        ),
        highCongestionStations: congestionData.filter(d => d.congestionLevel === 'high').length,
        totalStations: congestionData.length,
        lastUpdated: new Date().toISOString()
      },
      stations: includeStationDetails ? congestionData.map(data => ({
        stationId: data.stationId,
        stationName: getStationName(data.stationId),
        congestionLevel: data.congestionLevel,
        congestionPercentage: data.congestionPercentage,
        passengerCount: data.passengerCount,
        vehicleCapacity: data.vehicleCapacity,
        weatherImpact: data.weatherCondition !== 'clear',
        specialEvents: data.specialEvents,
        timestamp: data.timestamp
      })) : undefined
    };

    res.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching route congestion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch route congestion data',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 혼잡도 히스토리 조회
 * GET /api/congestion/history
 */
router.get('/history', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { 
    routeId, 
    startTime, 
    endTime, 
    interval = '1h',
    limit = 100 
  } = req.query;

  try {
    if (!routeId) {
      return res.status(400).json({
        success: false,
        error: 'Route ID is required',
        timestamp: new Date().toISOString()
      });
    }

    // 시간 범위 검증
    const start = startTime ? new Date(startTime as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const end = endTime ? new Date(endTime as string) : new Date();

    if (start >= end) {
      return res.status(400).json({
        success: false,
        error: 'Start time must be before end time',
        timestamp: new Date().toISOString()
      });
    }

    // 과거 데이터 생성 (시뮬레이션)
    const historicalData = congestionGenerator.generateHistoricalData(7);
    
    // 시간 범위 필터링
    const filteredData = historicalData.filter(data => {
      const dataTime = new Date(data.timestamp);
      return dataTime >= start && dataTime <= end && data.routeId === routeId;
    });

    // 간격에 따른 데이터 집계
    const aggregatedData = aggregateDataByInterval(filteredData, interval as string);

    // 결과 제한
    const limitNum = Math.min(parseInt(limit as string) || 100, 500);
    const limitedData = aggregatedData.slice(0, limitNum);

    const responseData = {
      routeId: routeId as string,
      routeName: getRouteName(routeId as string),
      timeRange: {
        start: start.toISOString(),
        end: end.toISOString(),
        interval: interval as string
      },
      totalDataPoints: limitedData.length,
      statistics: {
        averageCongestion: Math.round(
          limitedData.reduce((sum, d) => sum + d.averageCongestion, 0) / limitedData.length
        ),
        peakCongestion: Math.max(...limitedData.map(d => d.maxCongestion)),
        lowCongestion: Math.min(...limitedData.map(d => d.minCongestion))
      },
      data: limitedData
    };

    res.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching congestion history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch historical data',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 혼잡도 비교 (여러 노선)
 * GET /api/congestion/compare
 */
router.get('/compare', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { routeIds, timeRange = '2' } = req.query;

  try {
    if (!routeIds) {
      return res.status(400).json({
        success: false,
        error: 'Route IDs are required',
        timestamp: new Date().toISOString()
      });
    }

    const routeIdArray = (routeIds as string).split(',').slice(0, 5); // 최대 5개 노선
    const timeHours = Math.min(parseInt(timeRange as string), 4); // 최대 4시간

    // 각 노선별 예측 데이터 조회
    const predictions = await integratedPredictionService.getMultipleRoutePredictions(
      routeIdArray, 
      timeHours
    );

    // 비교 데이터 구성
    const comparisonData = predictions.map(prediction => {
      const avgCongestion = prediction.predictions.reduce(
        (sum, p) => sum + p.congestionPercentage, 0
      ) / prediction.predictions.length;

      const peakTime = prediction.predictions.reduce((peak, current) => 
        current.congestionPercentage > peak.congestionPercentage ? current : peak
      );

      const lowTime = prediction.predictions.reduce((low, current) => 
        current.congestionPercentage < low.congestionPercentage ? current : low
      );

      return {
        routeId: prediction.routeId,
        routeName: getRouteName(prediction.routeId),
        transportType: prediction.transportType,
        averageCongestion: Math.round(avgCongestion),
        peakCongestion: {
          percentage: peakTime.congestionPercentage,
          time: peakTime.time,
          level: peakTime.congestionLevel
        },
        lowCongestion: {
          percentage: lowTime.congestionPercentage,
          time: lowTime.time,
          level: lowTime.congestionLevel
        },
        accuracy: prediction.accuracy,
        recommendation: generateRouteRecommendation(avgCongestion, prediction.transportType)
      };
    });

    // 추천 순위 계산
    const rankedRoutes = comparisonData
      .sort((a, b) => a.averageCongestion - b.averageCongestion)
      .map((route, index) => ({
        ...route,
        rank: index + 1,
        score: calculateRouteScore(route)
      }));

    const responseData = {
      comparisonTime: new Date().toISOString(),
      timeRange: timeHours,
      totalRoutes: rankedRoutes.length,
      bestRoute: rankedRoutes[0],
      routes: rankedRoutes,
      summary: {
        averageSystemCongestion: Math.round(
          rankedRoutes.reduce((sum, r) => sum + r.averageCongestion, 0) / rankedRoutes.length
        ),
        recommendedRoute: rankedRoutes[0]?.routeId,
        alternativeRoutes: rankedRoutes.slice(1, 3).map(r => r.routeId)
      }
    };

    res.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error comparing routes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare routes',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 실시간 업데이트를 위한 WebSocket 정보
 * GET /api/congestion/websocket-info
 */
router.get('/websocket-info', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      websocketUrl: `ws://localhost:3001/ws/congestion`,
      protocols: ['congestion-updates'],
      updateInterval: 300000, // 5분 (밀리초)
      supportedEvents: [
        'congestion-update',
        'prediction-update',
        'alert-notification',
        'service-status'
      ],
      connectionInfo: {
        maxConnections: 1000,
        heartbeatInterval: 30000, // 30초
        reconnectDelay: 5000 // 5초
      }
    },
    timestamp: new Date().toISOString()
  });
});

// === Helper Functions ===

function getRouteName(routeId: string): string {
  const route = dataStore.getRouteById(routeId);
  return route ? route.name : routeId;
}

function getStationName(stationId: string): string {
  const station = dataStore.getStationById(stationId);
  return station ? station.name : stationId;
}

function generatePersonalizedRecommendation(
  prediction: any, 
  userTolerance: string
): string {
  const { congestionLevel, congestionPercentage } = prediction;
  
  if (userTolerance === 'low' && congestionLevel === 'high') {
    return '혼잡도가 높습니다. 다른 시간대를 고려해보세요.';
  } else if (userTolerance === 'high' && congestionLevel === 'low') {
    return '여유로운 시간대입니다. 이용하기 좋습니다.';
  } else if (congestionPercentage < 40) {
    return '쾌적한 이용이 가능합니다.';
  } else if (congestionPercentage > 80) {
    return '매우 혼잡합니다. 대기 시간이 길 수 있습니다.';
  } else {
    return '보통 수준의 혼잡도입니다.';
  }
}

function generateRouteRecommendation(avgCongestion: number, transportType: string): string {
  if (avgCongestion < 40) {
    return `${transportType === 'subway' ? '지하철' : '버스'} 이용이 쾌적합니다.`;
  } else if (avgCongestion > 80) {
    return `${transportType === 'subway' ? '지하철' : '버스'} 혼잡도가 높습니다. 대체 경로를 고려하세요.`;
  } else {
    return `${transportType === 'subway' ? '지하철' : '버스'} 보통 수준의 혼잡도입니다.`;
  }
}

function calculateRouteScore(route: any): number {
  let score = 100;
  
  // 평균 혼잡도에 따른 점수 차감
  score -= route.averageCongestion * 0.5;
  
  // 정확도에 따른 보너스
  score += route.accuracy * 20;
  
  // 교통수단별 보정
  if (route.transportType === 'subway') {
    score += 10; // 지하철 선호
  }
  
  return Math.round(Math.max(0, score));
}

function aggregateDataByInterval(data: any[], interval: string): any[] {
  // 간단한 시간 간격별 집계 (실제로는 더 정교한 로직 필요)
  const intervalMs = getIntervalMs(interval);
  const aggregated: any[] = [];
  
  // 시간순 정렬
  const sortedData = data.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  if (sortedData.length === 0) return [];
  
  let currentBucket: any[] = [];
  let bucketStart = new Date(sortedData[0].timestamp);
  
  sortedData.forEach(item => {
    const itemTime = new Date(item.timestamp);
    
    if (itemTime.getTime() - bucketStart.getTime() >= intervalMs) {
      if (currentBucket.length > 0) {
        aggregated.push(aggregateBucket(currentBucket, bucketStart));
      }
      currentBucket = [item];
      bucketStart = itemTime;
    } else {
      currentBucket.push(item);
    }
  });
  
  // 마지막 버킷 처리
  if (currentBucket.length > 0) {
    aggregated.push(aggregateBucket(currentBucket, bucketStart));
  }
  
  return aggregated;
}

function getIntervalMs(interval: string): number {
  const intervalMap: { [key: string]: number } = {
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '30m': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '2h': 2 * 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000
  };
  
  return intervalMap[interval] || intervalMap['1h'];
}

function aggregateBucket(bucket: any[], bucketStart: Date): any {
  const congestionValues = bucket.map(item => item.congestionPercentage);
  
  return {
    timestamp: bucketStart.toISOString(),
    averageCongestion: Math.round(
      congestionValues.reduce((sum, val) => sum + val, 0) / congestionValues.length
    ),
    maxCongestion: Math.max(...congestionValues),
    minCongestion: Math.min(...congestionValues),
    dataPoints: bucket.length
  };
}

export default router;