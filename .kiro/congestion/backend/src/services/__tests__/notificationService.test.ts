import { notificationService, NotificationService } from '../notificationService';
import { dataStore } from '../dataStore';

// Mock dataStore
jest.mock('../dataStore', () => ({
  dataStore: {
    getUserById: jest.fn(),
    getAllUsers: jest.fn()
  }
}));

describe('NotificationService', () => {
  let service: NotificationService;
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    points: 100,
    preferences: {
      preferredTransportModes: ['subway'],
      avoidCrowdedRoutes: true,
      maxWalkingDistance: 1000,
      preferredDepartureTime: '09:00',
      notificationSettings: {
        congestionAlerts: true,
        routeRecommendations: true,
        scheduleReminders: true
      }
    },
    frequentRoutes: [
      {
        origin: '강남역',
        destination: '홍대입구역',
        routeName: '2호선',
        frequency: 5
      }
    ],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  beforeEach(() => {
    service = new NotificationService();
    jest.clearAllMocks();
    (dataStore.getUserById as jest.Mock).mockReturnValue(mockUser);
    (dataStore.getAllUsers as jest.Mock).mockReturnValue([mockUser]);
  });

  describe('createNotification', () => {
    it('creates a notification with valid template', () => {
      const notification = service.createNotification(
        'user-1',
        'congestion_high',
        { routeName: '2호선' }
      );

      expect(notification).toBeDefined();
      expect(notification.userId).toBe('user-1');
      expect(notification.type).toBe('congestion_high');
      expect(notification.title).toBe('혼잡도 경고');
      expect(notification.message).toContain('2호선');
      expect(notification.priority).toBe('high');
      expect(notification.category).toBe('traffic');
      expect(notification.isRead).toBe(false);
    });

    it('throws error for unknown notification type', () => {
      expect(() => {
        service.createNotification('user-1', 'unknown_type', {});
      }).toThrow('Unknown notification type: unknown_type');
    });

    it('interpolates template variables correctly', () => {
      const notification = service.createNotification(
        'user-1',
        'route_optimization',
        { 
          currentRoute: '2호선',
          alternativeRoute: '6호선',
          timeSaved: 10
        }
      );

      expect(notification.message).toContain('6호선');
      expect(notification.message).toContain('10분');
    });

    it('schedules notification for future time', () => {
      const futureTime = new Date(Date.now() + 60000).toISOString();
      const notification = service.createNotification(
        'user-1',
        'departure_reminder',
        { destination: '강남역', duration: 25, minutes: 15 },
        futureTime
      );

      expect(notification.scheduledFor).toBe(futureTime);
      expect(notification.sentAt).toBeUndefined();
    });
  });

  describe('createCongestionAlert', () => {
    it('creates high congestion alert', () => {
      const notification = service.createCongestionAlert(
        'user-1',
        '2호선',
        'high',
        85
      );

      expect(notification).toBeDefined();
      expect(notification!.type).toBe('congestion_high');
      expect(notification!.priority).toBe('high');
      expect(notification!.message).toContain('2호선');
    });

    it('creates low congestion improvement alert', () => {
      const notification = service.createCongestionAlert(
        'user-1',
        '2호선',
        'low',
        25
      );

      expect(notification).toBeDefined();
      expect(notification!.type).toBe('congestion_improved');
      expect(notification!.priority).toBe('medium');
    });

    it('returns null for medium congestion levels', () => {
      const notification = service.createCongestionAlert(
        'user-1',
        '2호선',
        'medium',
        50
      );

      expect(notification).toBeNull();
    });

    it('returns null for non-existent user', () => {
      (dataStore.getUserById as jest.Mock).mockReturnValue(null);
      
      const notification = service.createCongestionAlert(
        'non-existent-user',
        '2호선',
        'high',
        85
      );

      expect(notification).toBeNull();
    });
  });

  describe('createRouteOptimizationAlert', () => {
    it('creates route optimization alert for significant time savings', () => {
      const notification = service.createRouteOptimizationAlert(
        'user-1',
        '2호선',
        '6호선',
        10
      );

      expect(notification).toBeDefined();
      expect(notification!.type).toBe('route_optimization');
      expect(notification!.message).toContain('6호선');
      expect(notification!.message).toContain('10분');
    });

    it('returns null for minimal time savings', () => {
      const notification = service.createRouteOptimizationAlert(
        'user-1',
        '2호선',
        '6호선',
        3
      );

      expect(notification).toBeNull();
    });
  });

  describe('createDepartureReminder', () => {
    it('creates departure reminder with correct scheduling', () => {
      const departureTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const notification = service.createDepartureReminder(
        'user-1',
        '강남역',
        departureTime,
        25
      );

      expect(notification).toBeDefined();
      expect(notification!.type).toBe('departure_reminder');
      expect(notification!.scheduledFor).toBeDefined();
      expect(notification!.message).toContain('강남역');
      expect(notification!.message).toContain('25분');
    });
  });

  describe('createPointsEarnedNotification', () => {
    it('creates points earned notification', () => {
      const notification = service.createPointsEarnedNotification(
        'user-1',
        25,
        1275,
        '혼잡 시간대 회피'
      );

      expect(notification).toBeDefined();
      expect(notification!.type).toBe('points_earned');
      expect(notification!.category).toBe('reward');
      expect(notification!.message).toContain('25포인트');
      expect(notification!.message).toContain('1275포인트');
    });
  });

  describe('getUserNotifications', () => {
    beforeEach(() => {
      // Create some test notifications
      service.createNotification('user-1', 'congestion_high', { routeName: '2호선' });
      service.createNotification('user-1', 'route_optimization', { alternativeRoute: '6호선', timeSaved: 10 });
      service.createNotification('user-1', 'points_earned', { points: 25, totalPoints: 1275 });
    });

    it('returns user notifications with default pagination', () => {
      const notifications = service.getUserNotifications('user-1');
      
      expect(notifications).toHaveLength(3);
      expect(notifications[0].userId).toBe('user-1');
    });

    it('filters unread notifications only', () => {
      const notifications = service.getUserNotifications('user-1');
      service.markAsRead(notifications[0].id);
      
      const unreadNotifications = service.getUserNotifications('user-1', { unreadOnly: true });
      
      expect(unreadNotifications).toHaveLength(2);
      expect(unreadNotifications.every(n => !n.isRead)).toBe(true);
    });

    it('filters by category', () => {
      const trafficNotifications = service.getUserNotifications('user-1', { category: 'traffic' });
      
      expect(trafficNotifications).toHaveLength(2);
      expect(trafficNotifications.every(n => n.category === 'traffic')).toBe(true);
    });

    it('respects pagination limits', () => {
      const notifications = service.getUserNotifications('user-1', { limit: 2 });
      
      expect(notifications).toHaveLength(2);
    });

    it('applies offset correctly', () => {
      const firstPage = service.getUserNotifications('user-1', { limit: 2, offset: 0 });
      const secondPage = service.getUserNotifications('user-1', { limit: 2, offset: 2 });
      
      expect(firstPage).toHaveLength(2);
      expect(secondPage).toHaveLength(1);
      expect(firstPage[0].id).not.toBe(secondPage[0].id);
    });
  });

  describe('markAsRead', () => {
    it('marks notification as read', () => {
      const notification = service.createNotification('user-1', 'congestion_high', { routeName: '2호선' });
      
      expect(notification.isRead).toBe(false);
      
      const success = service.markAsRead(notification.id);
      
      expect(success).toBe(true);
      
      const updatedNotifications = service.getUserNotifications('user-1');
      const updatedNotification = updatedNotifications.find(n => n.id === notification.id);
      expect(updatedNotification!.isRead).toBe(true);
    });

    it('returns false for non-existent notification', () => {
      const success = service.markAsRead('non-existent-id');
      
      expect(success).toBe(false);
    });
  });

  describe('markAllAsRead', () => {
    it('marks all user notifications as read', () => {
      service.createNotification('user-1', 'congestion_high', { routeName: '2호선' });
      service.createNotification('user-1', 'route_optimization', { alternativeRoute: '6호선', timeSaved: 10 });
      
      const count = service.markAllAsRead('user-1');
      
      expect(count).toBe(2);
      
      const notifications = service.getUserNotifications('user-1');
      expect(notifications.every(n => n.isRead)).toBe(true);
    });
  });

  describe('deleteNotification', () => {
    it('deletes notification successfully', () => {
      const notification = service.createNotification('user-1', 'congestion_high', { routeName: '2호선' });
      
      const success = service.deleteNotification(notification.id);
      
      expect(success).toBe(true);
      
      const notifications = service.getUserNotifications('user-1');
      expect(notifications.find(n => n.id === notification.id)).toBeUndefined();
    });

    it('returns false for non-existent notification', () => {
      const success = service.deleteNotification('non-existent-id');
      
      expect(success).toBe(false);
    });
  });

  describe('getUserSettings', () => {
    it('returns default settings for new user', () => {
      const settings = service.getUserSettings('new-user');
      
      expect(settings.userId).toBe('new-user');
      expect(settings.enabled).toBe(true);
      expect(settings.congestionAlerts).toBe(true);
      expect(settings.routeSuggestions).toBe(true);
      expect(settings.scheduleReminders).toBe(true);
    });

    it('returns existing settings for user', () => {
      const initialSettings = service.getUserSettings('user-1');
      const updatedSettings = service.updateUserSettings('user-1', { enabled: false });
      
      expect(updatedSettings.enabled).toBe(false);
      
      const retrievedSettings = service.getUserSettings('user-1');
      expect(retrievedSettings.enabled).toBe(false);
    });
  });

  describe('updateUserSettings', () => {
    it('updates user settings correctly', () => {
      const updates = {
        congestionAlerts: false,
        quietHours: {
          enabled: true,
          startTime: '23:00',
          endTime: '06:00'
        }
      };
      
      const updatedSettings = service.updateUserSettings('user-1', updates);
      
      expect(updatedSettings.congestionAlerts).toBe(false);
      expect(updatedSettings.quietHours.enabled).toBe(true);
      expect(updatedSettings.quietHours.startTime).toBe('23:00');
    });
  });

  describe('getNotificationStats', () => {
    beforeEach(() => {
      service.createNotification('user-1', 'congestion_high', { routeName: '2호선' });
      service.createNotification('user-1', 'route_optimization', { alternativeRoute: '6호선', timeSaved: 10 });
      service.createNotification('user-1', 'points_earned', { points: 25, totalPoints: 1275 });
      
      const notifications = service.getUserNotifications('user-1');
      service.markAsRead(notifications[0].id);
    });

    it('calculates notification statistics correctly', () => {
      const stats = service.getNotificationStats('user-1');
      
      expect(stats.total).toBe(3);
      expect(stats.unread).toBe(2);
      expect(stats.byCategory.traffic).toBe(2);
      expect(stats.byCategory.reward).toBe(1);
      expect(stats.byPriority.high).toBe(1);
      expect(stats.byPriority.medium).toBe(1);
      expect(stats.byPriority.low).toBe(1);
    });
  });

  describe('notification blocking', () => {
    it('blocks notifications when user settings disabled', () => {
      service.updateUserSettings('user-1', { enabled: false });
      
      expect(() => {
        service.createNotification('user-1', 'congestion_high', { routeName: '2호선' });
      }).toThrow('Notification blocked by user settings');
    });

    it('blocks congestion alerts when disabled', () => {
      service.updateUserSettings('user-1', { congestionAlerts: false });
      
      const notification = service.createCongestionAlert('user-1', '2호선', 'high', 85);
      
      expect(notification).toBeNull();
    });

    it('allows urgent notifications during quiet hours', () => {
      service.updateUserSettings('user-1', {
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '07:00'
        }
      });
      
      // Mock current time to be within quiet hours
      const originalDate = Date;
      const mockDate = new Date('2025-01-09T23:30:00Z');
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = jest.fn(() => mockDate.getTime());
      
      // Should still create urgent notifications
      const notification = service.createNotification(
        'user-1',
        'schedule_conflict',
        { appointment: '중요한 회의' }
      );
      
      expect(notification).toBeDefined();
      expect(notification.priority).toBe('urgent');
      
      // Restore original Date
      global.Date = originalDate;
    });
  });
});"