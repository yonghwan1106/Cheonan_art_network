import express, { Response } from 'express';
import { AuthenticatedRequest, authenticateSession } from '../middleware/auth';
import { dataStore } from '../services/dataStore';
import { feedbackIntegration } from '../services/feedbackIntegration';
import { validators } from '../utils/helpers';

const router = express.Router();

/**
 * 사용자 선호도 조회
 */
router.get('/preferences', authenticateSession, (req: AuthenticatedRequest, res: Response) => {
  const preferences = req.user!.preferences;
  
  res.json({
    success: true,
    data: { preferences },
    timestamp: new Date().toISOString()
  });
});

/**
 * 사용자 선호도 업데이트
 */
router.put('/preferences', authenticateSession, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const updates = req.body;

  // 선호도 검증
  if (updates.congestionTolerance && !validators.isValidCongestionLevel(updates.congestionTolerance)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid congestion tolerance level',
      timestamp: new Date().toISOString()
    });
  }

  if (updates.maxWalkingDistance !== undefined) {
    if (typeof updates.maxWalkingDistance !== 'number' || updates.maxWalkingDistance < 0 || updates.maxWalkingDistance > 3000) {
      return res.status(400).json({
        success: false,
        error: 'Max walking distance must be between 0 and 3000 meters',
        timestamp: new Date().toISOString()
      });
    }
  }

  if (updates.maxTransfers !== undefined) {
    if (typeof updates.maxTransfers !== 'number' || updates.maxTransfers < 0 || updates.maxTransfers > 5) {
      return res.status(400).json({
        success: false,
        error: 'Max transfers must be between 0 and 5',
        timestamp: new Date().toISOString()
      });
    }
  }

  if (updates.notificationTiming !== undefined) {
    if (typeof updates.notificationTiming !== 'number' || updates.notificationTiming < 5 || updates.notificationTiming > 120) {
      return res.status(400).json({
        success: false,
        error: 'Notification timing must be between 5 and 120 minutes',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 현재 선호도와 병합
  const currentPreferences = req.user!.preferences;
  const newPreferences = { ...currentPreferences, ...updates };

  const updatedUser = dataStore.updateUser(userId, {
    preferences: newPreferences
  });

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    data: { preferences: updatedUser.preferences },
    timestamp: new Date().toISOString()
  });
});

/**
 * 개인화된 추천 조회
 */
router.get('/recommendations', authenticateSession, (req: AuthenticatedRequest, res: Response) => {
  const { origin, destination, departureTime } = req.query;
  const user = req.user!;

  // 쿼리 파라미터 검증
  if (!origin || !destination) {
    return res.status(400).json({
      success: false,
      error: 'Origin and destination are required',
      timestamp: new Date().toISOString()
    });
  }

  // 사용자 선호도 기반 추천 생성 (시뮬레이션)
  const recommendations = generatePersonalizedRecommendations(
    user,
    origin as string,
    destination as string,
    departureTime as string
  );

  res.json({
    success: true,
    data: { recommendations },
    timestamp: new Date().toISOString()
  });
});

/**
 * 사용자 활동 통계
 */
router.get('/stats', authenticateSession, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  
  // 사용자 피드백 통계
  const userFeedbacks = dataStore.getFeedbackByUser(userId);
  const totalFeedbacks = userFeedbacks.length;
  const averageRating = totalFeedbacks > 0 
    ? userFeedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks 
    : 0;

  // 자주 이용하는 경로 통계
  const frequentRoutes = req.user!.frequentRoutes;
  const totalRoutes = frequentRoutes.length;
  const weeklyUsage = frequentRoutes.reduce((sum, route) => sum + route.frequency, 0);

  // 포인트 통계
  const currentPoints = req.user!.points;
  const pointsEarnedThisMonth = Math.floor(Math.random() * 200) + 50; // 시뮬레이션

  // 예측 정확도 만족도 (사용자별)
  const satisfactionRate = totalFeedbacks > 0 ? (averageRating / 5) * 100 : 0;

  res.json({
    success: true,
    data: {
      feedback: {
        totalFeedbacks,
        averageRating: Math.round(averageRating * 100) / 100,
        satisfactionRate: Math.round(satisfactionRate)
      },
      routes: {
        totalRoutes,
        weeklyUsage
      },
      points: {
        current: currentPoints,
        earnedThisMonth: pointsEarnedThisMonth
      },
      usage: {
        daysActive: Math.floor(Math.random() * 30) + 1,
        predictionsViewed: Math.floor(Math.random() * 100) + 20,
        alternativeRoutesUsed: Math.floor(Math.random() * 15) + 3
      }
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * 사용자 알림 설정 조회
 */
router.get('/notifications', authenticateSession, (req: AuthenticatedRequest, res: Response) => {
  const preferences = req.user!.preferences;
  
  // 알림 히스토리 시뮬레이션
  const notificationHistory = [
    {
      id: 'notif-001',
      type: 'congestion_alert',
      title: '혼잡도 알림',
      message: '2호선 강남역 혼잡도가 높습니다. 30분 후 출발을 권장합니다.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'notif-002',
      type: 'route_suggestion',
      title: '경로 추천',
      message: '평소 경로보다 3호선 이용 시 10분 단축 가능합니다.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      read: false
    },
    {
      id: 'notif-003',
      type: 'points_earned',
      title: '포인트 적립',
      message: '비혼잡 시간대 이용으로 50포인트가 적립되었습니다.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true
    }
  ];

  res.json({
    success: true,
    data: {
      settings: {
        enabled: preferences.notificationEnabled,
        timing: preferences.notificationTiming,
        types: {
          congestionAlerts: true,
          routeSuggestions: true,
          pointsUpdates: true,
          serviceUpdates: false
        }
      },
      history: notificationHistory
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * 알림 설정 업데이트
 */
router.put('/notifications', authenticateSession, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { enabled, timing, types } = req.body;

  const updates: any = {};

  if (enabled !== undefined) {
    updates.notificationEnabled = Boolean(enabled);
  }

  if (timing !== undefined) {
    if (typeof timing !== 'number' || timing < 5 || timing > 120) {
      return res.status(400).json({
        success: false,
        error: 'Notification timing must be between 5 and 120 minutes',
        timestamp: new Date().toISOString()
      });
    }
    updates.notificationTiming = timing;
  }

  if (Object.keys(updates).length > 0) {
    const currentPreferences = req.user!.preferences;
    const newPreferences = { ...currentPreferences, ...updates };

    const updatedUser = dataStore.updateUser(userId, {
      preferences: newPreferences
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString()
      });
    }
  }

  res.json({
    success: true,
    data: {
      message: 'Notification settings updated',
      settings: {
        enabled: req.user!.preferences.notificationEnabled,
        timing: req.user!.preferences.notificationTiming,
        types: types || {
          congestionAlerts: true,
          routeSuggestions: true,
          pointsUpdates: true,
          serviceUpdates: false
        }
      }
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * 사용자 데이터 내보내기 (GDPR 준수)
 */
router.get('/export', authenticateSession, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const user = req.user!;
  
  // 사용자 관련 모든 데이터 수집
  const userFeedbacks = dataStore.getFeedbackByUser(userId);
  
  const exportData = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      preferences: user.preferences,
      frequentRoutes: user.frequentRoutes,
      points: user.points,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    },
    feedbacks: userFeedbacks,
    exportedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: exportData,
    timestamp: new Date().toISOString()
  });
});

/**
 * 사용자 계정 삭제
 */
router.delete('/account', authenticateSession, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { confirmation } = req.body;

  if (confirmation !== 'DELETE_MY_ACCOUNT') {
    return res.status(400).json({
      success: false,
      error: 'Account deletion requires confirmation',
      timestamp: new Date().toISOString()
    });
  }

  // 사용자 데이터 삭제
  const deleted = dataStore.deleteUser(userId);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    data: { message: 'Account deleted successfully' },
    timestamp: new Date().toISOString()
  });
});

// === Helper Functions ===

function generatePersonalizedRecommendations(
  user: any,
  origin: string,
  destination: string,
  departureTime?: string
) {
  const { preferences } = user;
  
  // 시뮬레이션된 추천 경로들
  const baseRoutes = [
    {
      id: 'route-1',
      name: '2호선 직통',
      duration: 35,
      transfers: 0,
      walkingDistance: 400,
      congestionLevel: 'high',
      congestionPercentage: 85,
      incentivePoints: 0
    },
    {
      id: 'route-2',
      name: '3호선 + 버스',
      duration: 42,
      transfers: 1,
      walkingDistance: 600,
      congestionLevel: 'medium',
      congestionPercentage: 60,
      incentivePoints: 25
    },
    {
      id: 'route-3',
      name: '9호선 + 도보',
      duration: 38,
      transfers: 0,
      walkingDistance: 800,
      congestionLevel: 'low',
      congestionPercentage: 35,
      incentivePoints: 50
    }
  ];

  // 사용자 선호도에 따른 필터링 및 점수 계산
  const filteredRoutes = baseRoutes
    .filter(route => {
      // 최대 환승 횟수 필터
      if (route.transfers > preferences.maxTransfers) return false;
      
      // 최대 도보 거리 필터
      if (route.walkingDistance > preferences.maxWalkingDistance) return false;
      
      // 혼잡도 허용 수준 필터
      const congestionLevels = { low: 0, medium: 1, high: 2 };
      const userTolerance = congestionLevels[preferences.congestionTolerance];
      const routeCongestion = congestionLevels[route.congestionLevel];
      
      if (routeCongestion > userTolerance) return false;
      
      return true;
    })
    .map(route => {
      // 사용자 선호도 기반 점수 계산
      let score = 100;
      
      // 시간 가중치
      score -= route.duration * 0.5;
      
      // 환승 가중치
      score -= route.transfers * 10;
      
      // 도보 거리 가중치
      score -= route.walkingDistance * 0.01;
      
      // 혼잡도 가중치
      score -= route.congestionPercentage * 0.3;
      
      // 인센티브 보너스
      score += route.incentivePoints * 0.2;
      
      return {
        ...route,
        score: Math.round(score),
        recommended: score > 70,
        reason: generateRecommendationReason(route, preferences)
      };
    })
    .sort((a, b) => b.score - a.score);

  return filteredRoutes;
}

function generateRecommendationReason(route: any, preferences: any): string {
  const reasons = [];
  
  if (route.congestionLevel === 'low') {
    reasons.push('혼잡도가 낮음');
  }
  
  if (route.transfers === 0) {
    reasons.push('환승 없음');
  }
  
  if (route.walkingDistance <= preferences.maxWalkingDistance * 0.5) {
    reasons.push('도보 거리 짧음');
  }
  
  if (route.incentivePoints > 0) {
    reasons.push(`${route.incentivePoints}포인트 적립`);
  }
  
  return reasons.length > 0 ? reasons.join(', ') : '기본 추천 경로';
}

export default router;