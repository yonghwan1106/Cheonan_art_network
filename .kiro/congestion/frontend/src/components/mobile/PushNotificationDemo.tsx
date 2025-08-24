import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface PushNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface PushNotificationDemoProps {
  enabled?: boolean;
  onNotificationClick?: (notification: PushNotification) => void;
}

export const PushNotificationDemo: React.FC<PushNotificationDemoProps> = ({
  enabled = true,
  onNotificationClick
}) => {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Mock notification templates
  const notificationTemplates: Omit<PushNotification, 'id' | 'timestamp'>[] = [
    {
      title: '혼잡도 경고',
      body: '2호선 강남역에서 높은 혼잡도가 감지되었습니다. 대체 경로를 확인해보세요.',
      type: 'warning',
      action: {
        label: '경로 보기',
        onClick: () => console.log('Navigate to routes')
      }
    },
    {
      title: '출발 시간 알림',
      body: '15분 후 홍대입구역으로 출발하세요. 예상 소요시간: 25분',
      type: 'info',
      action: {
        label: '일정 보기',
        onClick: () => console.log('Navigate to schedule')
      }
    },
    {
      title: '포인트 적립',
      body: '혼잡 시간대 회피로 25포인트가 적립되었습니다!',
      type: 'success'
    },
    {
      title: '서비스 점검 안내',
      body: '오늘 밤 2시-4시 시스템 점검이 예정되어 있습니다.',
      type: 'info'
    },
    {
      title: '경로 최적화',
      body: '6호선 경유 시 12분 절약 가능합니다. 경로를 변경하시겠습니까?',
      type: 'info',
      action: {
        label: '경로 변경',
        onClick: () => console.log('Change route')
      }
    }
  ];

  // Request notification permission
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission;
    }
    return 'denied';
  };

  // Generate random notification
  const generateNotification = () => {
    const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
    const notification: PushNotification = {
      ...template,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 notifications

    // Show browser notification if permission granted
    if (permission === 'granted' && 'Notification' in window) {
      const browserNotification = new Notification(notification.title, {
        body: notification.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: false,
        silent: false
      });

      browserNotification.onclick = () => {
        onNotificationClick?.(notification);
        browserNotification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }

    return notification;
  };

  // Auto-generate notifications for demo
  useEffect(() => {
    if (!enabled) return;

    // Generate initial notification after 3 seconds
    const initialTimer = setTimeout(() => {
      generateNotification();
    }, 3000);

    // Generate random notifications every 30-60 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance
        generateNotification();
      }
    }, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [enabled, permission]);

  const getNotificationIcon = (type: PushNotification['type']) => {
    switch (type) {
      case 'warning':
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: PushNotification['type']) => {
    switch (type) {
      case 'warning':
        return 'border-orange-200 bg-orange-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed top-20 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] space-y-2">
      {/* Permission Request */}
      {permission === 'default' && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-start space-x-3">
            <Bell className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">알림 허용</h4>
              <p className="text-xs text-gray-600 mt-1">
                실시간 혼잡도 알림을 받으시겠습니까?
              </p>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={requestPermission}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 active:bg-blue-800"
                >
                  허용
                </button>
                <button
                  onClick={() => setPermission('denied')}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300 active:bg-gray-400"
                >
                  거부
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-white border rounded-lg shadow-lg p-4 transform transition-all duration-300 hover:shadow-xl ${getNotificationColor(notification.type)}`}
          onClick={() => onNotificationClick?.(notification)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {getNotificationIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {notification.title}
                  </h4>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTime(notification.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {notification.body}
                </p>
                {notification.action && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      notification.action!.onClick();
                    }}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 active:bg-blue-800"
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Hook for managing push notifications
export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return 'denied';
    
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission !== 'granted' || !isSupported) return null;

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    return notification;
  };

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification
  };
};