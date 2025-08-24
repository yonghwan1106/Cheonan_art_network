import { userBehaviorSimulation, BehaviorScenario } from '../userBehaviorSimulation';
import { dataStore } from '../dataStore';
import { User, CongestionLevel } from '../../types';

describe('UserBehaviorSimulation', () => {
  let testUser: User;

  beforeEach(() => {
    // 테스트용 사용자 생성
    testUser = dataStore.createUser({
      email: 'test@behavior.com',
      name: '테스트 사용자',
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
      points: 1000
    });
  });

  afterEach(() => {
    dataStore.clearAllData();
  });

  describe('generateUserBehaviorProfile', () => {
    it('should generate behavior profile for existing user', () => {
      const profile = userBehaviorSimulation.generateUserBehaviorProfile(testUser.id);
      
      expect(profile).toBeDefined();
      expect(profile?.userId).toBe(testUser.id);
      expect(profile?.travelPatterns).toHaveLength(1);
      expect(profile?.timePreferences).toHaveLength(3); // morning-rush, evening-rush, off-peak
      expect(profile?.congestionSensitivity).toBeGreaterThan(0);
      expect(profile?.routeFlexibility).toBeGreaterThan(0);
      expect(profile?.incentiveMotivation).toBeGreaterThan(0);
    });

    it('should return null for non-existent user', () => {
      const profile = userBehaviorSimulation.generateUserBehaviorProfile('non-existent-user');
      expect(profile).toBeNull();
    });

    it('should calculate congestion sensitivity based on tolerance level', () => {
      // Low tolerance user
      const lowToleranceUser = dataStore.createUser({
        ...testUser,
        email: 'low@test.com',
        preferences: {
          ...testUser.preferences,
          congestionTolerance: 'low'
        }
      });

      const lowProfile = userBehaviorSimulation.generateUserBehaviorProfile(lowToleranceUser.id);
      expect(lowProfile?.congestionSensitivity).toBeGreaterThan(0.8);

      // High tolerance user
      const highToleranceUser = dataStore.createUser({
        ...testUser,
        email: 'high@test.com',
        preferences: {
          ...testUser.preferences,
          congestionTolerance: 'high'
        }
      });

      const highProfile = userBehaviorSimulation.generateUserBehaviorProfile(highToleranceUser.id);
      expect(highProfile?.congestionSensitivity).toBeLessThan(0.5);
    });

    it('should analyze travel patterns correctly', () => {
      const profile = userBehaviorSimulation.generateUserBehaviorProfile(testUser.id);
      
      expect(profile?.travelPatterns[0]).toMatchObject({
        routeId: 'test-route-1',
        origin: 'hongik-univ',
        destination: 'gangnam',
        frequency: 5,
        preferredTime: '08:30',
        transportType: 'subway'
      });
    });

    it('should generate time preferences for different time slots', () => {
      const profile = userBehaviorSimulation.generateUserBehaviorProfile(testUser.id);
      
      const timeSlots = profile?.timePreferences.map(tp => tp.timeSlot);
      expect(timeSlots).toContain('morning-rush');
      expect(timeSlots).toContain('evening-rush');
      expect(timeSlots).toContain('off-peak');
    });
  });

  describe('predictUserBehavior', () => {
    it('should predict behavior for high congestion scenario', () => {
      const scenario: BehaviorScenario = {
        currentCongestion: 'high',
        departureTime: '08:30',
        estimatedTravelTime: 45,
        incentiveAvailable: false
      };

      const prediction = userBehaviorSimulation.predictUserBehavior(testUser.id, scenario);
      
      expect(prediction).toBeDefined();
      expect(prediction.userId).toBe(testUser.id);
      expect(prediction.scenario).toEqual(scenario);
      expect(prediction.likelyActions).toHaveLength(2); // delay-departure, find-alternative-route
      expect(prediction.confidence).toBeGreaterThan(0);
    });

    it('should predict incentive acceptance when available', () => {
      const scenario: BehaviorScenario = {
        currentCongestion: 'medium',
        departureTime: '10:00',
        incentiveAvailable: true
      };

      const prediction = userBehaviorSimulation.predictUserBehavior(testUser.id, scenario);
      
      const incentiveAction = prediction.likelyActions.find(action => 
        action.action === 'accept-incentive'
      );
      expect(incentiveAction).toBeDefined();
      expect(incentiveAction?.probability).toBeGreaterThan(0);
    });

    it('should suggest trip rescheduling for non-preferred time slots', () => {
      // Create user with low rush hour preference
      const lowRushUser = dataStore.createUser({
        ...testUser,
        email: 'lowrush@test.com',
        preferences: {
          ...testUser.preferences,
          congestionTolerance: 'low'
        }
      });

      const scenario: BehaviorScenario = {
        currentCongestion: 'high',
        departureTime: '08:00', // Rush hour
        incentiveAvailable: false
      };

      const prediction = userBehaviorSimulation.predictUserBehavior(lowRushUser.id, scenario);
      
      const rescheduleAction = prediction.likelyActions.find(action => 
        action.action === 'reschedule-trip'
      );
      expect(rescheduleAction).toBeDefined();
    });

    it('should identify decision factors correctly', () => {
      const scenario: BehaviorScenario = {
        currentCongestion: 'high',
        departureTime: '08:30',
        estimatedTravelTime: 45,
        incentiveAvailable: true
      };

      const prediction = userBehaviorSimulation.predictUserBehavior(testUser.id, scenario);
      
      expect(prediction.decisionFactors).toHaveLength(3);
      
      const factors = prediction.decisionFactors.map(f => f.factor);
      expect(factors).toContain('congestion-level');
      expect(factors).toContain('travel-time');
      expect(factors).toContain('incentive-points');
      
      // Factors should be sorted by weight
      if (prediction.decisionFactors.length >= 2) {
        const factor0 = prediction.decisionFactors[0];
        const factor1 = prediction.decisionFactors[1];
        if (factor0 && factor1) {
          expect(factor0.weight).toBeGreaterThanOrEqual(factor1.weight);
        }
      }
    });

    it('should calculate prediction confidence', () => {
      const scenario: BehaviorScenario = {
        currentCongestion: 'medium',
        departureTime: '10:00',
        incentiveAvailable: false
      };

      const prediction = userBehaviorSimulation.predictUserBehavior(testUser.id, scenario);
      
      expect(prediction.confidence).toBeGreaterThan(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
    });

    it('should throw error for non-existent user', () => {
      const scenario: BehaviorScenario = {
        currentCongestion: 'medium',
        departureTime: '10:00',
        incentiveAvailable: false
      };

      expect(() => {
        userBehaviorSimulation.predictUserBehavior('non-existent-user', scenario);
      }).toThrow('User profile not found');
    });
  });

  describe('behavior profile calculations', () => {
    it('should calculate route flexibility based on user preferences', () => {
      // User with high flexibility (more transfers, longer walking)
      const flexibleUser = dataStore.createUser({
        ...testUser,
        email: 'flexible@test.com',
        preferences: {
          ...testUser.preferences,
          maxTransfers: 3,
          maxWalkingDistance: 1200
        }
      });

      const flexibleProfile = userBehaviorSimulation.generateUserBehaviorProfile(flexibleUser.id);
      
      // User with low flexibility
      const rigidUser = dataStore.createUser({
        ...testUser,
        email: 'rigid@test.com',
        preferences: {
          ...testUser.preferences,
          maxTransfers: 1,
          maxWalkingDistance: 400
        }
      });

      const rigidProfile = userBehaviorSimulation.generateUserBehaviorProfile(rigidUser.id);
      
      expect(flexibleProfile?.routeFlexibility).toBeGreaterThan(rigidProfile?.routeFlexibility || 0);
    });

    it('should calculate incentive motivation based on points and usage', () => {
      // User with high points and frequent usage
      const motivatedUser = dataStore.createUser({
        ...testUser,
        email: 'motivated@test.com',
        points: 2500,
        frequentRoutes: [
          ...testUser.frequentRoutes,
          {
            id: 'route-2',
            origin: 'jamsil',
            destination: 'myeongdong',
            frequency: 7,
            preferredTime: '18:00',
            transportType: 'bus'
          }
        ]
      });

      const motivatedProfile = userBehaviorSimulation.generateUserBehaviorProfile(motivatedUser.id);
      
      // User with low points and infrequent usage
      const unmotivatedUser = dataStore.createUser({
        ...testUser,
        email: 'unmotivated@test.com',
        points: 100,
        frequentRoutes: [
          {
            id: 'route-3',
            origin: 'hongik-univ',
            destination: 'gangnam',
            frequency: 1,
            preferredTime: '08:30',
            transportType: 'subway'
          }
        ]
      });

      const unmotivatedProfile = userBehaviorSimulation.generateUserBehaviorProfile(unmotivatedUser.id);
      
      expect(motivatedProfile?.incentiveMotivation).toBeGreaterThan(unmotivatedProfile?.incentiveMotivation || 0);
    });
  });

  describe('edge cases', () => {
    it('should handle user with no frequent routes', () => {
      const userWithoutRoutes = dataStore.createUser({
        ...testUser,
        email: 'noroutes@test.com',
        frequentRoutes: []
      });

      const profile = userBehaviorSimulation.generateUserBehaviorProfile(userWithoutRoutes.id);
      
      expect(profile).toBeDefined();
      expect(profile?.travelPatterns).toHaveLength(0);
      expect(profile?.timePreferences).toHaveLength(3); // Still has default time preferences
    });

    it('should handle extreme preference values', () => {
      const extremeUser = dataStore.createUser({
        ...testUser,
        email: 'extreme@test.com',
        preferences: {
          congestionTolerance: 'low',
          maxWalkingDistance: 0,
          maxTransfers: 0,
          notificationEnabled: true,
          notificationTiming: 0
        }
      });

      const profile = userBehaviorSimulation.generateUserBehaviorProfile(extremeUser.id);
      
      expect(profile).toBeDefined();
      expect(profile?.routeFlexibility).toBeGreaterThanOrEqual(0);
      expect(profile?.congestionSensitivity).toBeGreaterThanOrEqual(0);
    });
  });
});