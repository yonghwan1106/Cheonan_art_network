import request from 'supertest';
import express from 'express';
import feedbackRoutes from '../feedback';
import { dataStore } from '../../services/dataStore';
import { User } from '../../types';

// Express 앱 설정
const app = express();
app.use(express.json());

// 인증 미들웨어 모킹
app.use((req: any, res, next) => {
  req.user = { id: 'test-user-id' };
  next();
});

app.use('/api/feedback', feedbackRoutes);

describe('Feedback Routes', () => {
  let testUser: User;

  beforeEach(() => {
    // 테스트용 사용자 생성
    testUser = dataStore.createUser({
      email: 'test@feedback.com',
      name: '피드백 테스트 사용자',
      preferences: {
        congestionTolerance: 'medium',
        maxWalkingDistance: 800,
        maxTransfers: 2,
        notificationEnabled: true,
        notificationTiming: 30
      },
      frequentRoutes: [],
      points: 500
    });

    // 모킹된 사용자 ID를 실제 사용자 ID로 업데이트
    app.use((req: any, res, next) => {
      req.user = { id: testUser.id };
      next();
    });
  });

  afterEach(() => {
    dataStore.clearAllData();
  });

  describe('POST /api/feedback/congestion', () => {
    it('should submit congestion feedback successfully', async () => {
      const feedbackData = {
        routeId: 'line2',
        predictedCongestion: 'medium',
        actualCongestion: 'high',
        rating: 4,
        comment: 'Traffic was heavier than expected'
      };

      const response = await request(app)
        .post('/api/feedback/congestion')
        .send(feedbackData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.feedbackId).toBeDefined();
      expect(response.body.data.pointsEarned).toBeGreaterThan(0);
      expect(response.body.data.message).toContain('포인트');
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        routeId: 'line2',
        predictedCongestion: 'medium'
        // missing actualCongestion and rating
      };

      const response = await request(app)
        .post('/api/feedback/congestion')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    it('should return 400 for invalid congestion level', async () => {
      const invalidData = {
        routeId: 'line2',
        predictedCongestion: 'invalid',
        actualCongestion: 'high',
        rating: 4
      };

      const response = await request(app)
        .post('/api/feedback/congestion')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid congestion level');
    });

    it('should return 400 for invalid rating', async () => {
      const invalidData = {
        routeId: 'line2',
        predictedCongestion: 'medium',
        actualCongestion: 'high',
        rating: 10 // out of range
      };

      const response = await request(app)
        .post('/api/feedback/congestion')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Rating must be between 1 and 5');
    });
  });

  describe('POST /api/feedback/incentive', () => {
    it('should calculate behavior incentive successfully', async () => {
      const incentiveData = {
        actionType: 'congestion_avoidance'
      };

      const response = await request(app)
        .post('/api/feedback/incentive')
        .send(incentiveData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.points).toBeGreaterThan(0);
      expect(response.body.data.reason).toBeDefined();
      expect(response.body.data.levelMultiplier).toBeGreaterThan(0);
    });

    it('should return 400 for invalid action type', async () => {
      const invalidData = {
        actionType: 'invalid_action'
      };

      const response = await request(app)
        .post('/api/feedback/incentive')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid action type');
    });

    it('should return 400 for missing action type', async () => {
      const response = await request(app)
        .post('/api/feedback/incentive')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid action type');
    });
  });

  describe('GET /api/feedback/history', () => {
    beforeEach(async () => {
      // 테스트 피드백 생성
      await request(app)
        .post('/api/feedback/congestion')
        .send({
          routeId: 'line2',
          predictedCongestion: 'medium',
          actualCongestion: 'high',
          rating: 4
        });
    });

    it('should return user feedback history', async () => {
      const response = await request(app)
        .get('/api/feedback/history')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.feedbacks).toBeInstanceOf(Array);
      expect(response.body.data.total).toBeGreaterThan(0);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/feedback/history?limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.feedbacks).toHaveLength(1);
    });

    it('should return 400 for invalid limit', async () => {
      const response = await request(app)
        .get('/api/feedback/history?limit=invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Limit must be a number');
    });
  });

  describe('GET /api/feedback/route-stats/:routeId', () => {
    beforeEach(async () => {
      // 테스트 피드백 생성
      await request(app)
        .post('/api/feedback/congestion')
        .send({
          routeId: 'line2',
          predictedCongestion: 'medium',
          actualCongestion: 'high',
          rating: 4
        });
    });

    it('should return route feedback statistics', async () => {
      const response = await request(app)
        .get('/api/feedback/route-stats/line2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.routeId).toBe('line2');
      expect(response.body.data.totalFeedbacks).toBeGreaterThan(0);
      expect(response.body.data.averageRating).toBeGreaterThan(0);
      expect(response.body.data.congestionDistribution).toBeDefined();
    });

    it('should return empty stats for route with no feedback', async () => {
      const response = await request(app)
        .get('/api/feedback/route-stats/non-existent-route')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalFeedbacks).toBe(0);
    });
  });

  describe('GET /api/feedback/monthly-report', () => {
    beforeEach(async () => {
      // 테스트 피드백 생성
      await request(app)
        .post('/api/feedback/congestion')
        .send({
          routeId: 'line2',
          predictedCongestion: 'medium',
          actualCongestion: 'high',
          rating: 4
        });
    });

    it('should return monthly report', async () => {
      const response = await request(app)
        .get('/api/feedback/monthly-report')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(testUser.id);
      expect(response.body.data.month).toBeDefined();
      expect(response.body.data.userLevel).toBeDefined();
      expect(response.body.data.achievements).toBeInstanceOf(Array);
      expect(response.body.data.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/feedback/leaderboard', () => {
    it('should return incentive leaderboard', async () => {
      const response = await request(app)
        .get('/api/feedback/leaderboard')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.leaderboard).toBeInstanceOf(Array);
      expect(response.body.data.total).toBeGreaterThanOrEqual(0);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/feedback/leaderboard?limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.leaderboard.length).toBeLessThanOrEqual(5);
    });

    it('should return 400 for invalid limit', async () => {
      const response = await request(app)
        .get('/api/feedback/leaderboard?limit=100')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Limit must be a number between 1 and 50');
    });
  });

  describe('GET /api/feedback/stats', () => {
    it('should return system feedback statistics', async () => {
      const response = await request(app)
        .get('/api/feedback/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalFeedbacks).toBeGreaterThan(0);
      expect(response.body.data.totalUsers).toBeGreaterThan(0);
      expect(response.body.data.averageRating).toBeGreaterThan(0);
      expect(response.body.data.topRoutes).toBeInstanceOf(Array);
      expect(response.body.data.monthlyGrowth).toBeGreaterThan(0);
    });
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests to protected routes', async () => {
      // 인증 미들웨어 제거
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use('/api/feedback', feedbackRoutes);

      const response = await request(unauthApp)
        .post('/api/feedback/congestion')
        .send({
          routeId: 'line2',
          predictedCongestion: 'medium',
          actualCongestion: 'high',
          rating: 4
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('authentication required');
    });
  });
});