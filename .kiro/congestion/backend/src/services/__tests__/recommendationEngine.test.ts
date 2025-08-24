import { recommendationEngine } from '../recommendationEngine';
import { dataStore } from '../dataStore';
import { User } from '../../types';

describe('RecommendationEngine', () => {
  let testUser: User;

  beforeEach(() => {
    // 테스트용 사용자 생성
    testUser = dataStore.createUser({
      email: 'test@recommendation.com',
      name: '추천 테스트 사용자',
      preferences: {
        congestionTolerance: 'medium',
        maxWalkingDistance: 800,
        maxTransfers: 2,
        notificationEnabled: true,
        notificationTiming: 30
      },
      frequentRoutes: [
        {
          id: 'test-route-1',
          origin: 'hongik-univ',
          destination: 'gangnam',
          frequency: 5,
          preferredTime: '08:30',
          transportType: 'subway'
        }
      ],
      points: 1500
    });
  });

  afterEach(() => {
    dataStore.clearAllData();
  });

  describe('generatePersonalizedRecommendations', () => {
    it('should generate personalized recommendations for valid user and stations', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        testUser.id,
        '홍익대',
        '강남',
        '2025-01-08T08:30:00Z'
      );

      expect(recommendations).toBeDefined();
      expect(recommendations.userId).toBe(testUser.id);
      expect(recommendations.origin).toBeDefined();
      expect(recommendations.destination).toBeDefined();
      expect(recommendations.recommendedRoutes).toHaveLength(3); // 최대 3개 추천
      expect(recommendations.alertTiming).toBeDefined();
      expect(recommendations.personalizedInsights).toBeDefined();
      expect(recommendations.confidence).toBeGreaterThan(0);
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        recommendationEngine.generatePersonalizedRecommendations(
          'non-existent-user',
          '홍익대',
          '강남'
        )
      ).rejects.toThrow('User not found');
    });

    it('should throw error for invalid stations', async () => {
      await expect(
        recommendationEngine.generatePersonalizedRecommendations(
          testUser.id,
          'invalid-origin',
          'invalid-destination'
        )
      ).rejects.toThrow('Origin or destination station not found');
    });

    it('should include different route types', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        testUser.id,
        '홍익대',
        '강남'
      );

      const routeTypes = recommendations.recommendedRoutes.map(route => 
        route.routes[0]?.transportType
      ).filter(Boolean);

      // Should include different transport types
      expect(routeTypes).toContain('subway');
      expect(routeTypes.length).toBeGreaterThan(1);
    });

    it('should calculate alert timing based on user preferences', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        testUser.id,
        '홍익대',
        '강남',
        '2025-01-08T08:30:00Z'
      );

      expect(recommendations.alertTiming.minutesBeforeDeparture).toBeGreaterThanOrEqual(
        testUser.preferences.notificationTiming
      );
      expect(recommendations.alertTiming.message).toContain('분 후 출발하시면');
      expect(recommendations.alertTiming.priority).toMatch(/^(low|normal|high)$/);
    });

    it('should generate personalized insights', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        testUser.id,
        '홍익대',
        '강남'
      );

      expect(recommendations.personalizedInsights).toBeInstanceOf(Array);
      
      if (recommendations.personalizedInsights.length > 0) {
        const insight = recommendations.personalizedInsights[0];
        if (insight) {
          expect(insight.type).toMatch(/^(congestion-tip|incentive-opportunity|time-saving|personalized-tip)$/);
          expect(insight.message).toBeDefined();
          expect(insight.confidence).toBeGreaterThan(0);
          expect(insight.confidence).toBeLessThanOrEqual(1);
        }
      }
    });
  });

  describe('route filtering and ranking', () => {
    it('should filter routes based on user preferences', async () => {
      // Create user with strict preferences
      const strictUser = dataStore.createUser({
        ...testUser,
        email: 'strict@test.com',
        preferences: {
          congestionTolerance: 'low',
          maxWalkingDistance: 500,
          maxTransfers: 1,
          notificationEnabled: true,
          notificationTiming: 45
        }
      });

      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        strictUser.id,
        '홍익대',
        '강남'
      );

      // All recommended routes should respect user preferences
      recommendations.recommendedRoutes.forEach(route => {
        expect(route.transfers).toBeLessThanOrEqual(1);
        // Congestion score should be reasonable for low tolerance user
        if (route.congestionScore > 70) {
          // High congestion routes might still be included if they're the only options
          // but they should be ranked lower
          expect(route.score || 0).toBeLessThan(100);
        }
      });
    });

    it('should rank routes by score', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        testUser.id,
        '홍익대',
        '강남'
      );

      // Routes should be sorted by score (highest first)
      for (let i = 0; i < recommendations.recommendedRoutes.length - 1; i++) {
        const currentRoute = recommendations.recommendedRoutes[i];
        const nextRoute = recommendations.recommendedRoutes[i + 1];
        if (currentRoute && nextRoute) {
          const currentScore = currentRoute.score || 0;
          const nextScore = nextRoute.score || 0;
          expect(currentScore).toBeGreaterThanOrEqual(nextScore);
        }
      }
    });

    it('should calculate incentive points for qualifying routes', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        testUser.id,
        '홍익대',
        '강남'
      );

      // At least some routes should have incentive points
      const routesWithIncentives = recommendations.recommendedRoutes.filter(
        route => route.incentivePoints && route.incentivePoints > 0
      );

      expect(routesWithIncentives.length).toBeGreaterThan(0);
    });
  });

  describe('congestion data integration', () => {
    it('should apply real-time congestion data to routes', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        testUser.id,
        '홍익대',
        '강남',
        '2025-01-08T08:30:00Z' // Rush hour
      );

      // Routes should have congestion data
      recommendations.recommendedRoutes.forEach(route => {
        route.routes.forEach(segment => {
          expect(segment.congestionLevel).toMatch(/^(low|medium|high)$/);
          expect(segment.congestionPercentage).toBeGreaterThanOrEqual(0);
          expect(segment.congestionPercentage).toBeLessThanOrEqual(100);
        });
      });
    });

    it('should update congestion scores based on real-time data', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        testUser.id,
        '홍익대',
        '강남'
      );

      recommendations.recommendedRoutes.forEach(route => {
        expect(route.congestionScore).toBeGreaterThanOrEqual(0);
        expect(route.congestionScore).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('alert timing calculation', () => {
    it('should adjust notification time based on route complexity', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        testUser.id,
        '홍익대',
        '강남'
      );

      const alertTiming = recommendations.alertTiming;
      
      // More complex routes (with transfers) should have longer notification times
      const bestRoute = recommendations.recommendedRoutes[0];
      if (bestRoute) {
        const expectedMinTime = testUser.preferences.notificationTiming + (bestRoute.transfers + 1) * 5;
        
        expect(alertTiming.minutesBeforeDeparture).toBeGreaterThanOrEqual(expectedMinTime);
      }
    });

    it('should set high priority for highly congested routes', async () => {
      // Mock a highly congested scenario by testing during rush hour
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        testUser.id,
        '홍익대',
        '강남',
        '2025-01-08T08:00:00Z' // Peak rush hour
      );

      // If the best route has high congestion, priority should be high
      const bestRoute = recommendations.recommendedRoutes[0];
      if (bestRoute && bestRoute.congestionScore > 80) {
        expect(recommendations.alertTiming.priority).toBe('high');
      }
    });

    it('should generate appropriate alert messages', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        testUser.id,
        '홍익대',
        '강남'
      );

      const message = recommendations.alertTiming.message;
      
      expect(message).toContain('분 후 출발하시면');
      expect(message).toContain('분 소요됩니다');
      expect(message).toContain('혼잡도:');
    });
  });

  describe('personalized insights generation', () => {
    it('should generate congestion tips for low congestion periods', async () => {
      // Test during off-peak hours
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        testUser.id,
        '홍익대',
        '강남',
        '2025-01-08T14:00:00Z' // Off-peak
      );

      const congestionTip = recommendations.personalizedInsights.find(
        insight => insight.type === 'congestion-tip'
      );

      const bestRoute = recommendations.recommendedRoutes[0];
      if (bestRoute && bestRoute.congestionScore < 50) {
        expect(congestionTip).toBeDefined();
        expect(congestionTip?.message).toContain('덜 혼잡');
      }
    });

    it('should generate incentive opportunities when available', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        testUser.id,
        '홍익대',
        '강남'
      );

      const bestRoute = recommendations.recommendedRoutes[0];
      if (bestRoute && bestRoute.incentivePoints && bestRoute.incentivePoints > 0) {
        const incentiveInsight = recommendations.personalizedInsights.find(
          insight => insight.type === 'incentive-opportunity'
        );

        expect(incentiveInsight).toBeDefined();
        expect(incentiveInsight?.message).toContain('포인트');
      }
    });

    it('should generate time-saving insights when applicable', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        testUser.id,
        '홍익대',
        '강남'
      );

      if (recommendations.recommendedRoutes.length > 1) {
        const route1 = recommendations.recommendedRoutes[1];
        const route0 = recommendations.recommendedRoutes[0];
        if (route1 && route0) {
          const timeDifference = route1.totalTime - route0.totalTime;
          
          if (timeDifference > 10) {
            const timeSavingInsight = recommendations.personalizedInsights.find(
              insight => insight.type === 'time-saving'
            );

            expect(timeSavingInsight).toBeDefined();
            expect(timeSavingInsight?.message).toContain('절약');
          }
        }
      }
    });
  });

  describe('recommendation confidence calculation', () => {
    it('should calculate confidence based on route quality', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        testUser.id,
        '홍익대',
        '강남'
      );

      expect(recommendations.confidence).toBeGreaterThan(0);
      expect(recommendations.confidence).toBeLessThanOrEqual(1);
      
      // Confidence should be higher when we have multiple good route options
      if (recommendations.recommendedRoutes.length === 3) {
        expect(recommendations.confidence).toBeGreaterThan(0.5);
      }
    });

    it('should have higher confidence for users with more travel data', async () => {
      // Create user with more frequent routes
      const experiencedUser = dataStore.createUser({
        ...testUser,
        email: 'experienced@test.com',
        frequentRoutes: [
          ...testUser.frequentRoutes,
          {
            id: 'route-2',
            origin: 'jamsil',
            destination: 'myeongdong',
            frequency: 7,
            preferredTime: '18:00',
            transportType: 'bus'
          },
          {
            id: 'route-3',
            origin: 'hongik-univ',
            destination: 'jamsil',
            frequency: 3,
            preferredTime: '12:00',
            transportType: 'subway'
          }
        ]
      });

      const experiencedRecommendations = await recommendationEngine.generatePersonalizedRecommendations(
        experiencedUser.id,
        '홍익대',
        '강남'
      );

      const newUserRecommendations = await recommendationEngine.generatePersonalizedRecommendations(
        testUser.id,
        '홍익대',
        '강남'
      );

      // Experienced user should have higher or equal confidence
      expect(experiencedRecommendations.confidence).toBeGreaterThanOrEqual(
        newUserRecommendations.confidence
      );
    });
  });

  describe('edge cases', () => {
    it('should handle same origin and destination', async () => {
      await expect(
        recommendationEngine.generatePersonalizedRecommendations(
          testUser.id,
          '홍익대',
          '홍익대'
        )
      ).resolves.toBeDefined();
    });

    it('should handle user with no frequent routes', async () => {
      const newUser = dataStore.createUser({
        ...testUser,
        email: 'newuser@test.com',
        frequentRoutes: []
      });

      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        newUser.id,
        '홍익대',
        '강남'
      );

      expect(recommendations).toBeDefined();
      expect(recommendations.recommendedRoutes.length).toBeGreaterThan(0);
    });

    it('should handle extreme user preferences', async () => {
      const extremeUser = dataStore.createUser({
        ...testUser,
        email: 'extreme@test.com',
        preferences: {
          congestionTolerance: 'low',
          maxWalkingDistance: 100, // Very short walking distance
          maxTransfers: 0, // No transfers allowed
          notificationEnabled: true,
          notificationTiming: 60 // Long notification time
        }
      });

      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        extremeUser.id,
        '홍익대',
        '강남'
      );

      expect(recommendations).toBeDefined();
      expect(recommendations.alertTiming.minutesBeforeDeparture).toBeGreaterThanOrEqual(60);
    });
  });
});