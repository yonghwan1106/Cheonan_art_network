import express from 'express';
import { recommendationEngine } from '../services/recommendationEngine';
import { userBehaviorSimulation } from '../services/userBehaviorSimulation';
import { authMiddleware } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = express.Router();

/**
 * GET /api/user/recommendations
 * 개인화된 경로 추천 조회
 */
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
    }

    const { origin, destination, departureTime } = req.query;

    // 필수 파라미터 검증
    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Origin and destination are required',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
    }

    // 개인화된 추천 생성
    const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
      userId,
      origin as string,
      destination as string,
      departureTime as string
    );

    res.json({
      success: true,
      data: recommendations,
      timestamp: new Date().toISOString()
    } as ApiResponse<typeof recommendations>);

  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    } as ApiResponse<null>);
  }
});

/**
 * GET /api/user/behavior-profile
 * 사용자 행동 프로필 조회
 */
router.get('/behavior-profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
    }

    const behaviorProfile = userBehaviorSimulation.generateUserBehaviorProfile(userId);
    
    if (!behaviorProfile) {
      return res.status(404).json({
        success: false,
        error: 'User behavior profile not found',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
    }

    res.json({
      success: true,
      data: behaviorProfile,
      timestamp: new Date().toISOString()
    } as ApiResponse<typeof behaviorProfile>);

  } catch (error) {
    console.error('Error fetching behavior profile:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    } as ApiResponse<null>);
  }
});

/**
 * POST /api/user/behavior-prediction
 * 사용자 행동 예측
 */
router.post('/behavior-prediction', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
    }

    const { scenario } = req.body;

    // 시나리오 검증
    if (!scenario || !scenario.currentCongestion || !scenario.departureTime) {
      return res.status(400).json({
        success: false,
        error: 'Valid scenario with currentCongestion and departureTime is required',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
    }

    const behaviorPrediction = userBehaviorSimulation.predictUserBehavior(userId, scenario);

    res.json({
      success: true,
      data: behaviorPrediction,
      timestamp: new Date().toISOString()
    } as ApiResponse<typeof behaviorPrediction>);

  } catch (error) {
    console.error('Error predicting user behavior:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    } as ApiResponse<null>);
  }
});

/**
 * GET /api/user/alert-timing
 * 개인화된 알림 타이밍 계산
 */
router.get('/alert-timing', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
    }

    const { origin, destination, departureTime } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Origin and destination are required',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
    }

    // 추천 경로 생성하여 알림 타이밍 계산
    const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
      userId,
      origin as string,
      destination as string,
      departureTime as string
    );

    res.json({
      success: true,
      data: {
        alertTiming: recommendations.alertTiming,
        recommendedRoute: recommendations.recommendedRoutes[0],
        personalizedInsights: recommendations.personalizedInsights
      },
      timestamp: new Date().toISOString()
    } as ApiResponse<any>);

  } catch (error) {
    console.error('Error calculating alert timing:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    } as ApiResponse<null>);
  }
});

/**
 * GET /api/user/route-alternatives
 * 대체 경로 추천 (혼잡 상황 대응)
 */
router.get('/route-alternatives', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
    }

    const { origin, destination, currentRouteId, congestionLevel } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Origin and destination are required',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
    }

    // 전체 추천 경로 생성
    const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
      userId,
      origin as string,
      destination as string
    );

    // 현재 경로 제외하고 대체 경로만 반환
    const alternatives = recommendations.recommendedRoutes.filter(route => 
      route.id !== currentRouteId
    );

    // 혼잡도 수준에 따른 추가 필터링
    if (congestionLevel === 'high') {
      alternatives.sort((a, b) => a.congestionScore - b.congestionScore);
    }

    res.json({
      success: true,
      data: {
        alternatives: alternatives.slice(0, 3),
        reason: congestionLevel === 'high' ? 'high-congestion-avoidance' : 'general-alternatives',
        originalRoute: currentRouteId,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    } as ApiResponse<any>);

  } catch (error) {
    console.error('Error generating route alternatives:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    } as ApiResponse<null>);
  }
});

/**
 * POST /api/user/recommendation-feedback
 * 추천 결과에 대한 피드백 수집
 */
router.post('/recommendation-feedback', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
    }

    const { recommendationId, selectedRouteId, rating, feedback } = req.body;

    if (!recommendationId || !selectedRouteId || rating === undefined) {
      return res.status(400).json({
        success: false,
        error: 'RecommendationId, selectedRouteId, and rating are required',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
    }

    // 피드백 데이터 저장 (실제로는 데이터베이스에 저장)
    const feedbackData = {
      id: `rec-feedback-${Date.now()}`,
      userId,
      recommendationId,
      selectedRouteId,
      rating: Math.max(1, Math.min(5, rating)), // 1-5 범위로 제한
      feedback: feedback || '',
      timestamp: new Date().toISOString()
    };

    // 여기서는 로그만 출력 (실제로는 데이터 저장)
    console.log('Recommendation feedback received:', feedbackData);

    res.json({
      success: true,
      data: {
        message: 'Feedback received successfully',
        feedbackId: feedbackData.id
      },
      timestamp: new Date().toISOString()
    } as ApiResponse<any>);

  } catch (error) {
    console.error('Error processing recommendation feedback:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    } as ApiResponse<null>);
  }
});

export default router;