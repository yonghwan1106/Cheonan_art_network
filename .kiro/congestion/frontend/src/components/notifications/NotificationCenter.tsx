import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  Star, 
  Clock,
  Settings,
  Trash2,
  CheckCheck
} from 'lucide-react';

interface NotificationData {
  id: string;
  userId: string;
  type: 'congestion_alert' | 'route_suggestion' | 'schedule_reminder' | 'system_update' | 'incentive_earned';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'traffic' | 'schedule' | 'system' | 'reward';
  data?: any;
  scheduledFor?: string;
  expiresAt?: string;
  isRead: boolean;
  createdAt: string;
  sentAt?: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick?: (notification: NotificationData) => void;
  onSettingsClick?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onNotificationClick,
  onSettingsClick
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byCategory: {},
    byPriority: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'traffic' | 'schedule' | 'system' | 'reward'>('all');

  // Mock data generation
  const generateMockNotifications = (): NotificationData[] => {
    const mockNotifications: NotificationData[] = [
      {
        id: 'notif-1',
        userId: 'user-1',
        type: 'congestion_alert',
        title: '혼잡도 경고',
        message: '2호선에서 높은 혼잡도가 감지되었습니다. 대체 경로를 고려해보세요.',
        priority: 'high',
        category: 'traffic',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        sentAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        id: 'notif-2',
        userId: 'user-1',
        type: 'route_suggestion',
        title: '경로 최적화 제안',
        message: '6호선 경유를 이용하시면 12분 절약할 수 있습니다.',
        priority: 'medium',
        category: 'traffic',
        isRead: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        sentAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        id: 'notif-3',
        userId: 'user-1',
        type: 'schedule_reminder',
        title: '출발 시간 알림',
        message: '15분 후 강남역으로 출발하세요. 예상 소요시간: 25분',
        priority: 'high',
        category: 'schedule',
        isRead: true,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'notif-4',
        userId: 'user-1',
        type: 'incentive_earned',
        title: '포인트 적립',
        message: '25포인트가 적립되었습니다! 총 1275포인트를 보유하고 있어요.',
        priority: 'low',
        category: 'reward',
        isRead: false,
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        sentAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      },
      {
        id: 'notif-5',
        userId: 'user-1',
        type: 'system_update',
        title: '시스템 점검 안내',
        message: '2025년 1월 10일 02:00에 시스템 점검이 예정되어 있습니다.',
        priority: 'medium',
        category: 'system',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ];

    return mockNotifications;
  };

  // Load notifications
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockData = generateMockNotifications();
        setNotifications(mockData);
        
        // Calculate stats
        const newStats: NotificationStats = {
          total: mockData.length,
          unread: mockData.filter(n => !n.isRead).length,
          byCategory: {},
          byPriority: {}
        };

        mockData.forEach(notification => {
          newStats.byCategory[notification.category] = (newStats.byCategory[notification.category] || 0) + 1;
          newStats.byPriority[notification.priority] = (newStats.byPriority[notification.priority] || 0) + 1;
        });

        setStats(newStats);
        setIsLoading(false);
      }, 500);
    }
  }, [isOpen]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'traffic':
        return <AlertTriangle className="w-4 h-4" />;
      case 'schedule':
        return <Clock className="w-4 h-4" />;
      case 'reward':
        return <Star className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  const handleNotificationClick = (notification: NotificationData) => {
    if (!notification.isRead) {
      // Mark as read
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
      setStats(prev => ({ ...prev, unread: prev.unread - 1 }));
    }
    onNotificationClick?.(notification);
  };

  const handleMarkAsRead = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setStats(prev => ({ ...prev, unread: 0 }));
  };

  const handleDeleteNotification = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const notification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setStats(prev => ({
      ...prev,
      total: prev.total - 1,
      unread: notification && !notification.isRead ? prev.unread - 1 : prev.unread
    }));
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'traffic':
      case 'schedule':
      case 'system':
      case 'reward':
        return notification.category === filter;
      default:
        return true;
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">알림</h2>
            {stats.unread > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {stats.unread}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {stats.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="모두 읽음 처리"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onSettingsClick}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="알림 설정"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { key: 'all', label: '전체', count: stats.total },
            { key: 'unread', label: '읽지 않음', count: stats.unread },
            { key: 'traffic', label: '교통', count: stats.byCategory.traffic || 0 },
            { key: 'schedule', label: '일정', count: stats.byCategory.schedule || 0 }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                filter === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
              {count > 0 && (
                <span className="ml-1 text-xs text-gray-400">({count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">로딩 중...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">알림이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'unread' ? '읽지 않은 알림이 없습니다.' : '새로운 알림이 도착하면 여기에 표시됩니다.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${
                    notification.isRead ? 'bg-white' : getPriorityColor(notification.priority)
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-0.5">
                        {getCategoryIcon(notification.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            notification.isRead ? 'text-gray-900' : 'text-gray-900 font-semibold'
                          }`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-1">
                            {getPriorityIcon(notification.priority)}
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className={`mt-1 text-sm ${
                          notification.isRead ? 'text-gray-600' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="읽음 처리"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};