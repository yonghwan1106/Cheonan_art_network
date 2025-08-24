import express from 'express';
import { feedbackIncentiveSystem, IncentiveActionType } from '../services/feedbackIncentiveSystem';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse, CongestionLevel } from '../types';

const router = express.Router();

/**
 * POST /api/feedback/congestion
 * 혼잡도 피드백 제출
 */
router.post('/congestion', authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User authentication required',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }

    const { 
      routeId, 
      predictedCongestion, 
      actualCongestion, 
      rating, 
      comment 
    } = req.body;

    // 필수 파라미터 검증
    if (!routeId || !predictedCongestion || !actualCongestion || rating === undefined) {
      res.status(400).json({
        success: false,
        error: 'RouteId, predictedCongestion, actualCongestion, and rating are required',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }

    // 혼잡도 레벨 검증
    const validCongestionLevels: CongestionLevel[] = ['low', 'medium', 'high'];
    if (!validCongestionLevels.includes(predictedCongestion) || 
        !validCongestionLevels.includes(actualCongestion)) {
      res.status(400).json({
        success: false,
        error: 'Invalid congestion level. Must be low, medium, or high',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }

    // 평점 검증
    if (rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }

    // 피드백 제출
    const result = feedbackIncentiveSystem.submitCongestionFeedback(
      userId,
      routeId,
      predictedCongestion,
      actualCongestion,
      rating,
      comment
    );

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    } as ApiResponse<typeof result>);

  } catch (error) {
    console.error('Error submitting congestion feedback:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    } as ApiResponse<null>);
  }
});

/**
 * POST /api/feedback/incentive
 * 행동 기반 인센티브 적립
 */
router.post('/incentive', authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User authentication required',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }

    const { actionType } = req.body;

    // 액션 타입 검증
    const validActionTypes: IncentiveActionType[] = [
      'congestion_avoidance',
      'off_peak_usage',
      'route_sharing',
      'monthly_active',
      'streak_bonus'
    ];

    if (!actionType || !validActionTypes.includes(actionType)) {
      res.status(400).json({
        success: false,
        error: `Invalid action type. Must be one of: ${validActionTypes.join(', ')}`,
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }

    // 인센티브 계산 및 적립
    const result = feedbackIncentiveSystem.calculateBehaviorIncentive(userId, actionType);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    } as ApiResponse<typeof result>);

  } catch (error) {
    console.error('Error calculating behavior incentive:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    } as ApiResponse<null>);
  }
});

/**
 * GET /api/feedback/history
 * 사용자 피드백 히스토리 조회
 */
router.get('/history', authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User authentication required',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }

    const { limit } = req.query;
    const limitNumber = limit ? parseInt(limit as string) : 20;

    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      res.status(400).json({
        success: false,
        error: 'Limit must be a number between 1 and 100',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }

    const history = feedbackIncentiveSystem.getUserFeedbackHistory(userId, limitNumber);

    res.json({
      success: true,
      data: {
        feedbacks: history,
        total: history.length
      },
      timestamp: new Date().toISOString()
    } as ApiResponse<any>);

  } catch (error) {
    console.error('Error fetching feedback history:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    } as ApiResponse<null>);
  }
});

/**
 * GET /api/feedback/route-stats/:routeId
 * 경로별 피드백 통계 조회
 */
router.get('/route-stats/:routeId', async (req, res): Promise<void> => {
  try {
    const { routeId } = req.params;

    if (!routeId) {
      res.status(400).json({
        success: false,
        error: 'Route ID is required',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }

    const stats = feedbackIncentiveSystem.getRouteFeedbackStats(routeId);

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    } as ApiResponse<typeof stats>);

  } catch (error) {
    console.error('Error fetching route feedback stats:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    } as ApiResponse<null>);
  }
});

/**
 * GET /api/feedback/monthly-report
 * 월간 리포트 조회
 */
router.get('/monthly-report', authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User authentication required',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }

    const report = feedbackIncentiveSystem.generateMonthlyReport(userId);

    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    } as ApiResponse<typeof report>);

  } catch (error) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    } as ApiResponse<null>);
  }
});

/**
 * GET /api/feedback/leaderboard
 * 인센티브 랭킹 조회
 */
router.get('/leaderboard', async (req, res): Promise<void> => {
  try {
    const { limit } = req.query;
    const limitNumber = limit ? parseInt(limit as string) : 10;

    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 50) {
      res.status(400).json({
        success: false,
        error: 'Limit must be a number between 1 and 50',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }

    const leaderboard = feedbackIncentiveSystem.getIncentiveLeaderboard(limitNumber);

    res.json({
      success: true,
      data: {
        leaderboard,
        total: leaderboard.length
      },
      timestamp: new Date().toISOString()
    } as ApiResponse<any>);

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    } as ApiResponse<null>);
  }
});

/**
 * GET /api/feedback/stats
 * 전체 피드백 시스템 통계
 */
router.get('/stats', async (req, res): Promise<void> => {
  try {
    // 전체 시스템 통계 생성 (시뮬레이션)
    const stats = {
      totalFeedbacks: Math.floor(Math.random() * 1000) + 500,
      totalUsers: Math.floor(Math.random() * 200) + 100,
      averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
      totalPointsAwarded: Math.floor(Math.random() * 50000) + 25000,
      topRoutes: [
        { routeId: 'line2', name: '2호선', feedbackCount: 150 },
        { routeId: 'line1', name: '1호선', feedbackCount: 120 },
        { routeId: 'bus-472', name: '472번', feedbackCount: 95 }
      ],
      monthlyGrowth: Math.round((Math.random() * 20 + 5) * 10) / 10 // 5-25%
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    } as ApiResponse<typeof stats>);

  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    } as ApiResponse<null>);
  }
});

export default router;