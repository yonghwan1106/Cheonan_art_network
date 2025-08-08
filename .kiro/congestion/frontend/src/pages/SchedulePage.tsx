import React, { useState } from 'react';
import { Calendar, Clock, TrendingUp, Bell } from 'lucide-react';
import { Timeline } from '../components/schedule/Timeline';
import { DailySchedule } from '../components/schedule/DailySchedule';

export const SchedulePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedRoute, setSelectedRoute] = useState<string>('2호선');
  const [activeTab, setActiveTab] = useState<'timeline' | 'schedule'>('timeline');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const routes = [
    '1호선', '2호선', '3호선', '4호선', '5호선',
    '6호선', '7호선', '8호선', '9호선',
    '472번', '146번', '6002번'
  ];

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleOptimizationRequest = (currentTime: string) => {
    // Mock optimization logic
    console.log(`Optimizing schedule for ${currentTime}`);
    // In a real app, this would call an API
  };

  const handleScheduleOptimize = (scheduleId: string) => {
    console.log(`Optimizing schedule item: ${scheduleId}`);
  };

  const handleAlertDismiss = (scheduleId: string, alertIndex: number) => {
    console.log(`Dismissing alert ${alertIndex} for schedule ${scheduleId}`);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">스케줄 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            시간대별 혼잡도 예측과 개인 일정을 관리하세요
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            현재 시간: {new Date().toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              날짜 선택
            </label>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {formatDate(selectedDate)}
            </p>
          </div>

          {/* Route Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              노선 선택
            </label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {routes.map((route) => (
                <option key={route} value={route}>
                  {route}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'timeline'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>시간대별 혼잡도</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedule'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>일일 스케줄</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'timeline' ? (
          <Timeline
            selectedRoute={selectedRoute}
            selectedDate={selectedDate}
            onTimeSelect={handleTimeSelect}
            onOptimizationRequest={handleOptimizationRequest}
          />
        ) : (
          <DailySchedule
            selectedDate={selectedDate}
            onScheduleOptimize={handleScheduleOptimize}
            onAlertDismiss={handleAlertDismiss}
          />
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">오늘의 통계</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">4</div>
            <div className="text-sm text-gray-600">예정된 일정</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">27분</div>
            <div className="text-sm text-gray-600">절약 가능 시간</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">3</div>
            <div className="text-sm text-gray-600">활성 알림</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">92%</div>
            <div className="text-sm text-gray-600">예측 정확도</div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-blue-900 mb-2">💡 스마트 스케줄링 팁</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h5 className="font-medium mb-1">출근 시간 최적화</h5>
            <p>출근 시간을 15분 앞당기면 평균 12분의 시간을 절약할 수 있어요.</p>
          </div>
          <div>
            <h5 className="font-medium mb-1">대체 경로 활용</h5>
            <p>혼잡한 시간대에는 환승이 있더라도 대체 경로가 더 빠를 수 있어요.</p>
          </div>
          <div>
            <h5 className="font-medium mb-1">알림 설정</h5>
            <p>출발 30분 전 알림을 설정하면 실시간 혼잡도를 확인할 수 있어요.</p>
          </div>
          <div>
            <h5 className="font-medium mb-1">주간 패턴 분석</h5>
            <p>요일별 혼잡도 패턴을 파악하여 주간 스케줄을 최적화하세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
};