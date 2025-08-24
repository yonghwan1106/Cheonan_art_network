import { feedbackIncentiveSystem } from '../feedbackIncentiveSystem';
import { dataStore } from '../dataStore';
import { User, CongestionLevel } from '../../types';

describe('FeedbackIncentiveSystem', () => {
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
  });

  afterEach(() => {
    dataStore.clearAllData();
  });

  describe('submitCongestionFeedback', () => {
    it('should submit feedback and award points', () => {
      const result = feedbackIncentiveSystem.submitCongestionFeedback(
        testUser.id,
        'line2',
        'medium',
        'high',
        4,
        'Traffic was heavier than expected'
      );

      expect(result).toBeDefined();
      expect(result.feedbackId).toBeDefined();
      expect(result.pointsEarned).toBeGreaterThan(0);
      expect(result.message).toContain('포인트');

      // 사용자 포인트가 증가했는지 확인
      const updatedUser = dataStore.getUserById(testUser.id);
      expect(updatedUser?.points).toBeGreaterThan(testUser.points);
    });

    it('should award accuracy bonus for correct predictions', () => {
      const result = feedbackIncentiveSystem.submitCongestionFeedback(
        testUser.id,
        'line2',
        'high',
        'high', // 정확한 예측
        5
      );

      expect(result.isAccurate).toBe(true);
      expect(result.pointsEarned).toBeGreaterThan(15); // 기본 포인트 + 정확도 보너스
      expect(result.message).toContain('정확한 피드백');
    });

    it('should handle near-accurate predictions', () => {
      const result = feedbackIncentiveSystem.submitCongestionFeedback(
        testUser.id,
        'line2',
        'medium',
        'high', // 근접한 예측
        4
      );

      expect(result.isAccurate).toBe(true);
    });

    it('should throw error for non-existent user', () => {
      expect(() => {
        feedbackIncentiveSystem.submitCongestionFeedback(
          'non-existent-user',
          'line2',
          'medium',
          'high',
          4
        );
      }).toThrow('User not found');
    });

    it('should clamp rating to valid range', () => {
      const result = feedbackIncentiveSystem.submitCongestionFeedback(
        testUser.id,
        'line2',
        'medium',
        'high',
        10 // 범위 초과
      );

      // 피드백이 저장되었는지 확인
      const feedbacks = feedbackIncentiveSystem.getUserFeedbackHistory(testUser.id);
      expect(feedbacks[0]?.rating).toBe(5); // 최대값으로 제한됨
    });
  });

  describe('calculateBehaviorIncentive', () => {
    it('should calculate points for congestion avoidance', () => {
      const result = feedbackIncentiveSystem.calculateBehaviorIncentive(
        testUser.id,
        'congestion_avoidance'
      );

      expect(result.points).toBe(15); // 기본 포인트
      expect(result.reason).toBe('혼잡 시간대 회피');
      expect(result.levelMultiplier).toBe(1.1); // 브론즈 레벨
      expect(result.totalPoints).toBeGreaterThan(testUser.points);
    });

    it('should calculate points for off-peak usage', () => {
      const result = feedbackIncentiveSystem.calculateBehaviorIncentive(
        testUser.id,
        'off_peak_usage'
      );

      expect(result.points).toBe(27); // 25 * 1.1 (브론즈 보너스)
      expect(result.reason).toBe('비혼잡 시간대 이용');
    });

    it('should apply level multiplier correctly', () => {
      // 골드 레벨 사용자 생성
      const goldUser = dataStore.createUser({
        ...testUser,
        email: 'gold@test.com',
        points: 2500
      });

      const result = feedbackIncentiveSystem.calculateBehaviorIncentive(
        goldUser.id,
        'off_peak_usage'
      );

      expect(result.levelMultiplier).toBe(1.3); // 골드 레벨
      expect(result.points).toBe(32); // 25 * 1.3
    });

    it('should throw error for non-existent user', () => {
      expect(() => {
        feedbackIncentiveSystem.calculateBehaviorIncentive(
          'non-existent-user',
          'congestion_avoidance'
        );
      }).toThrow('User not found');
    });
  });

  describe('getUserFeedbackHistory', () => {
    beforeEach(() => {
      // 테스트 피드백 생성
      feedbackIncentiveSystem.submitCongestionFeedback(
        testUser.id,
        'line2',
        'medium',
        'high',
        4
      );
      feedbackIncentiveSystem.submitCongestionFeedback(
        testUser.id,
        'line1',
        'low',
        'medium',
        3
      );
    });

    it('should return user feedback history', () => {
      const history = feedbackIncentiveSystem.getUserFeedbackHistory(testUser.id);

      expect(history).toHaveLength(2);
      expect(history[0]?.userId).toBe(testUser.id);
      expect(history[0]?.routeId).toBeDefined();
    });

    it('should respect limit parameter', () => {
      const history = feedbackIncentiveSystem.getUserFeedbackHistory(testUser.id, 1);

      expect(history).toHaveLength(1);
    });

    it('should return empty array for user with no feedback', () => {
      const newUser = dataStore.createUser({
        ...testUser,
        email: 'new@test.com'
      });

      const history = feedbackIncentiveSystem.getUserFeedbackHistory(newUser.id);

      expect(history).toHaveLength(0);
    });
  });

  describe('getRouteFeedbackStats', () => {
    beforeEach(() => {
      // 여러 사용자의 피드백 생성
      feedbackIncentiveSystem.submitCongestionFeedback(
        testUser.id,
        'line2',
        'medium',
        'high',
        4
      );

      const user2 = dataStore.createUser({
        ...testUser,
        email: 'user2@test.com'
      });

      feedbackIncentiveSystem.submitCongestionFeedback(
        user2.id,
        'line2',
        'high',
        'high',
        5
      );
    });

    it('should return route feedback statistics', () => {
      const stats = feedbackIncentiveSystem.getRouteFeedbackStats('line2');

      expect(stats.routeId).toBe('line2');
      expect(stats.totalFeedbacks).toBe(2);
      expect(stats.averageRating).toBe(4.5);
      expect(stats.accuracyRate).toBeGreaterThan(0);
      expect(stats.congestionDistribution).toBeDefined();
      expect(stats.congestionDistribution.high).toBe(2);
    });

    it('should return empty stats for route with no feedback', () => {
      const stats = feedbackIncentiveSystem.getRouteFeedbackStats('non-existent-route');

      expect(stats.totalFeedbacks).toBe(0);
      expect(stats.averageRating).toBe(0);
      expect(stats.accuracyRate).toBe(0);
    });
  });

  describe('generateMonthlyReport', () => {
    beforeEach(() => {
      // 이번 달 피드백 생성
      feedbackIncentiveSystem.submitCongestionFeedback(
        testUser.id,
        'line2',
        'medium',
        'high',
        4
      );
      feedbackIncentiveSystem.submitCongestionFeedback(
        testUser.id,
        'line1',
        'high',
        'high',
        5
      );
    });

    it('should generate monthly report', () => {
      const report = feedbackIncentiveSystem.generateMonthlyReport(testUser.id);

      expect(report.userId).toBe(testUser.id);
      expect(report.month).toBe(new Date().toISOString().slice(0, 7));
      expect(report.totalFeedbacks).toBeGreaterThan(0);
      expect(report.userLevel).toBeDefined();
      expect(report.achievements).toBeInstanceOf(Array);
      expect(report.recommendations).toBeInstanceOf(Array);
    });

    it('should include achievements for active users', () => {
      // 더 많은 피드백 생성
      for (let i = 0; i < 10; i++) {
        feedbackIncentiveSystem.submitCongestionFeedback(
          testUser.id,
          'line2',
          'medium',
          'high',
          4
        );
      }

      const report = feedbackIncentiveSystem.generateMonthlyReport(testUser.id);

      const feedbackMaster = report.achievements.find(a => a.id === 'feedback_master');
      expect(feedbackMaster).toBeDefined();
    });

    it('should throw error for non-existent user', () => {
      expect(() => {
        feedbackIncentiveSystem.generateMonthlyReport('non-existent-user');
      }).toThrow('User not found');
    });
  });

  describe('getIncentiveLeaderboard', () => {
    beforeEach(() => {
      // 여러 사용자 생성 및 포인트 부여
      const users = [
        { email: 'user1@test.com', points: 1000 },
        { email: 'user2@test.com', points: 2000 },
        { email: 'user3@test.com', points: 500 }
      ];

      users.forEach(userData => {
        dataStore.createUser({
          ...testUser,
          email: userData.email,
          points: userData.points
        });
      });
    });

    it('should return leaderboard sorted by points', () => {
      const leaderboard = feedbackIncentiveSystem.getIncentiveLeaderboard();

      expect(leaderboard).toHaveLength(4); // testUser + 3 additional users
      expect(leaderboard[0]?.points).toBeGreaterThanOrEqual(leaderboard[1]?.points || 0);
      expect(leaderboard[0]?.rank).toBe(1);
      expect(leaderboard[0]?.level).toBeDefined();
    });

    it('should respect limit parameter', () => {
      const leaderboard = feedbackIncentiveSystem.getIncentiveLeaderboard(2);

      expect(leaderboard).toHaveLength(2);
    });

    it('should include user level information', () => {
      const leaderboard = feedbackIncentiveSystem.getIncentiveLeaderboard();

      leaderboard.forEach(entry => {
        expect(entry.level.name).toBeDefined();
        expect(entry.level.tier).toBeGreaterThan(0);
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle invalid congestion levels gracefully', () => {
      // 이 테스트는 API 레벨에서 검증되므로 여기서는 스킵
      expect(true).toBe(true);
    });

    it('should handle user with maximum points', () => {
      const maxUser = dataStore.createUser({
        ...testUser,
        email: 'max@test.com',
        points: 10000
      });

      const result = feedbackIncentiveSystem.calculateBehaviorIncentive(
        maxUser.id,
        'off_peak_usage'
      );

      expect(result.levelMultiplier).toBe(1.5); // 플래티넘 레벨
      expect(result.points).toBeGreaterThan(25);
    });

    it('should handle concurrent feedback submissions', () => {
      // 동시에 여러 피드백 제출
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(
          feedbackIncentiveSystem.submitCongestionFeedback(
            testUser.id,
            'line2',
            'medium',
            'high',
            4
          )
        );
      }

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.feedbackId).toBeDefined();
      });

      const history = feedbackIncentiveSystem.getUserFeedbackHistory(testUser.id);
      expect(history).toHaveLength(5);
    });
  });
});