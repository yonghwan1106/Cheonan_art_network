import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Bell, Star, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  location: string;
  route: {
    from: string;
    to: string;
    routeName: string;
    estimatedTime: number;
    congestionLevel: 'low' | 'medium' | 'high';
    congestionPercentage: number;
  };
  alerts: {
    type: 'warning' | 'info' | 'success';
    message: string;
    time?: string;
  }[];
  optimization?: {
    suggestedDepartureTime: string;
    timeSaved: number;
    reason: string;
  };
  isOptimal: boolean;
}

interface DailyScheduleProps {
  selectedDate?: Date;
  onScheduleOptimize?: (scheduleId: string) => void;
  onAlertDismiss?: (scheduleId: string, alertIndex: number) => void;
}

export const DailySchedule: React.FC<DailyScheduleProps> = ({
  selectedDate = new Date(),
  onScheduleOptimize,
  onAlertDismiss
}) => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [notifications, setNotifications] = useState<{
    id: string;
    type: 'alert' | 'optimization' | 'reminder';
    title: string;
    message: string;
    time: string;
    scheduleId?: string;
  }[]>([]);

  // Generate mock schedule data
  const generateScheduleData = (): ScheduleItem[] => {
    const items: ScheduleItem[] = [
      {
        id: 'schedule-1',
        title: '회사 출근',
        time: '08:30',
        location: '강남역',
        route: {
          from: '홍익대입구',
          to: '강남',
          routeName: '2호선',
          estimatedTime: 35,
          congestionLevel: 'high',
          congestionPercentage: 85
        },
        alerts: [
          {
            type: 'warning',
            message: '출근 시간대 혼잡이 예상됩니다. 15분 일찍 출발하세요.',
            time: '08:00'
          }
        ],
        optimization: {
          suggestedDepartureTime: '08:15',
          timeSaved: 12,
          reason: '혼잡 시간대 회피'
        },
        isOptimal: false
      },
      {
        id: 'schedule-2',
        title: '점심 약속',
        time: '12:00',
        location: '명동',
        route: {
          from: '강남',
          to: '명동',
          routeName: '4호선',
          estimatedTime: 25,
          congestionLevel: 'medium',
          congestionPercentage: 55
        },
        alerts: [
          {
            type: 'info',
            message: '점심시간 약간 혼잡할 수 있습니다.',
            time: '11:30'
          }
        ],
        isOptimal: true
      },
      {
        id: 'schedule-3',
        title: '저녁 모임',
        time: '18:30',
        location: '홍대입구',
        route: {
          from: '강남',
          to: '홍익대입구',
          routeName: '2호선',
          estimatedTime: 40,
          congestionLevel: 'high',
          congestionPercentage: 90
        },
        alerts: [
          {
            type: 'warning',
            message: '퇴근 시간대 최고 혼잡 예상. 대체 경로를 고려하세요.',
            time: '18:00'
          },
          {
            type: 'info',
            message: '6호선 경유 시 10분 단축 가능',
            time: '18:00'
          }
        ],
        optimization: {
          suggestedDepartureTime: '18:00',
          timeSaved: 15,
          reason: '대체 경로 이용'
        },
        isOptimal: false
      },
      {
        id: 'schedule-4',
        title: '야간 수업',
        time: '20:00',
        location: '신촌',
        route: {
          from: '홍익대입구',
          to: '신촌',
          routeName: '2호선',
          estimatedTime: 8,
          congestionLevel: 'low',
          congestionPercentage: 25
        },
        alerts: [
          {
            type: 'success',
            message: '여유로운 시간대입니다. 편안한 이동이 가능해요.',
            time: '19:45'
          }
        ],
        isOptimal: true
      }
    ];

    return items;
  };

  // Generate mock notifications
  const generateNotifications = () => {
    const now = new Date();
    const notifications = [
      {
        id: 'notif-1',
        type: 'alert' as const,
        title: '출근 시간 알림',
        message: '15분 후 출발하세요. 현재 2호선 혼잡도 85%',
        time: new Date(now.getTime() + 15 * 60 * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        scheduleId: 'schedule-1'
      },
      {
        id: 'notif-2',
        type: 'optimization' as const,
        title: '경로 최적화 제안',
        message: '6호선 경유 시 12분 단축 가능합니다.',
        time: new Date(now.getTime() + 30 * 60 * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        scheduleId: 'schedule-3'
      },
      {
        id: 'notif-3',
        type: 'reminder' as const,
        title: '일정 알림',
        message: '1시간 후 점심 약속이 있습니다.',
        time: new Date(now.getTime() + 60 * 60 * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        scheduleId: 'schedule-2'
      }
    ];

    return notifications;
  };

  useEffect(() => {
    setScheduleItems(generateScheduleData());
    setNotifications(generateNotifications());
  }, [selectedDate]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setScheduleItems(prevItems =>
        prevItems.map(item => {
          // Randomly update congestion levels
          if (Math.random() < 0.3) {
            const variation = Math.floor(Math.random() * 10) - 5;
            const newPercentage = Math.max(0, Math.min(100, item.route.congestionPercentage + variation));
            const newLevel = newPercentage > 70 ? 'high' : newPercentage > 40 ? 'medium' : 'low';
            
            return {
              ...item,
              route: {
                ...item.route,
                congestionLevel: newLevel,
                congestionPercentage: newPercentage
              }
            };
          }
          return item;
        })
      );
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCongestionText = (level: string) => {
    switch (level) {
      case 'high': return '혼잡';
      case 'medium': return '보통';
      case 'low': return '여유';
      default: return '알 수 없음';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'optimization': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleOptimize = (scheduleId: string) => {
    setScheduleItems(prevItems =>
      prevItems.map(item =>
        item.id === scheduleId
          ? { ...item, isOptimal: true, optimization: undefined }
          : item
      )
    );
    onScheduleOptimize?.(scheduleId);
  };

  const dismissAlert = (scheduleId: string, alertIndex: number) => {
    setScheduleItems(prevItems =>
      prevItems.map(item =>
        item.id === scheduleId
          ? {
              ...item,
              alerts: item.alerts.filter((_, index) => index !== alertIndex)
            }
          : item
      )
    );
    onAlertDismiss?.(scheduleId, alertIndex);
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">일일 스케줄</h3>
          <p className="text-sm text-gray-500 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {selectedDate.toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
        </div>
        <div className="text-sm text-gray-600">
          총 {scheduleItems.length}개 일정
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">알림</h4>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h5>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.time}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Items */}
      <div className="space-y-4">
        {scheduleItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
              item.isOptimal ? 'border-green-200' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    item.isOptimal ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {item.isOptimal ? (
                      <Star className="w-6 h-6 text-green-600" />
                    ) : (
                      <Clock className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">
                    {item.title}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {item.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {item.location}
                    </div>
                  </div>
                </div>
              </div>
              {item.isOptimal && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  최적화됨
                </span>
              )}
            </div>

            {/* Route Information */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {item.route.from} → {item.route.to}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({item.route.routeName})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {item.route.estimatedTime}분
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCongestionColor(item.route.congestionLevel)}`}>
                    {getCongestionText(item.route.congestionLevel)} {item.route.congestionPercentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {item.alerts.length > 0 && (
              <div className="space-y-2 mb-4">
                {item.alerts.map((alert, alertIndex) => (
                  <div
                    key={alertIndex}
                    className={`flex items-start justify-between p-3 rounded-lg ${
                      alert.type === 'warning' 
                        ? 'bg-red-50 border border-red-200'
                        : alert.type === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <div className={`${
                        alert.type === 'warning' ? 'text-red-500' :
                        alert.type === 'success' ? 'text-green-500' : 'text-blue-500'
                      }`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${
                          alert.type === 'warning' ? 'text-red-700' :
                          alert.type === 'success' ? 'text-green-700' : 'text-blue-700'
                        }`}>
                          {alert.message}
                        </p>
                        {alert.time && (
                          <p className={`text-xs mt-1 ${
                            alert.type === 'warning' ? 'text-red-600' :
                            alert.type === 'success' ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            알림 시간: {alert.time}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => dismissAlert(item.id, alertIndex)}
                      className={`text-sm ${
                        alert.type === 'warning' ? 'text-red-400 hover:text-red-600' :
                        alert.type === 'success' ? 'text-green-400 hover:text-green-600' : 'text-blue-400 hover:text-blue-600'
                      }`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Optimization Suggestion */}
            {item.optimization && !item.isOptimal && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-medium text-blue-800">
                        최적화 제안
                      </h5>
                      <p className="text-sm text-blue-700 mt-1">
                        {item.optimization.suggestedDepartureTime}에 출발하시면 {item.optimization.timeSaved}분 절약 가능
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        이유: {item.optimization.reason}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOptimize(item.id)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    적용
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800">
                수정
              </button>
              <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
                경로 상세보기
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">오늘의 요약</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {scheduleItems.filter(item => item.isOptimal).length}
            </div>
            <div className="text-sm text-gray-600">최적화된 일정</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {scheduleItems.reduce((total, item) => 
                total + (item.optimization?.timeSaved || 0), 0
              )}분
            </div>
            <div className="text-sm text-gray-600">절약 가능 시간</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {scheduleItems.reduce((total, item) => 
                total + item.alerts.length, 0
              )}
            </div>
            <div className="text-sm text-gray-600">활성 알림</div>
          </div>
        </div>
      </div>
    </div>
  );
};