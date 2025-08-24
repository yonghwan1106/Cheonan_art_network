import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  Activity, 
  BarChart3, 
  MessageSquare,
  Settings,
  AlertTriangle,
  TrendingUp,
  Server,
  Database,
  Wifi,
  Clock
} from 'lucide-react';
import { SystemMonitoring } from '../components/admin/SystemMonitoring';
import { CongestionAnalytics } from '../components/admin/CongestionAnalytics';
import { FeedbackAnalysis } from '../components/admin/FeedbackAnalysis';
import { UserManagement } from '../components/admin/UserManagement';
import { SystemSettings } from '../components/admin/SystemSettings';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'congestion' | 'feedback' | 'users' | 'settings'>('monitoring');

  const tabs = [
    { id: 'monitoring', label: '시스템 모니터링', icon: Activity },
    { id: 'congestion', label: '혼잡도 분석', icon: BarChart3 },
    { id: 'feedback', label: '피드백 분석', icon: MessageSquare },
    { id: 'users', label: '사용자 관리', icon: Users },
    { id: 'settings', label: '시스템 설정', icon: Settings }
  ];

  // Mock system status data
  const systemStatus = {
    overallHealth: 98.5,
    activeUsers: 15247,
    totalRequests: 892456,
    avgResponseTime: 145,
    uptime: '99.9%',
    lastUpdate: new Date().toISOString()
  };

  const alerts = [
    {
      id: 1,
      type: 'warning',
      message: '2호선 강남역 센서 응답 지연 (3분)',
      timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      type: 'info',
      message: '시스템 업데이트 완료 - v2.1.3',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      type: 'error',
      message: '데이터베이스 연결 일시 중단 (복구됨)',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
              <p className="text-gray-600">시스템 상태 및 운영 현황 모니터링</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">마지막 업데이트</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(systemStatus.lastUpdate).toLocaleString('ko-KR')}
            </p>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">시스템 상태</p>
              <p className="text-2xl font-bold text-green-600">{systemStatus.overallHealth}%</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">활성 사용자</p>
              <p className="text-2xl font-bold text-blue-600">{systemStatus.activeUsers.toLocaleString()}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 요청 수</p>
              <p className="text-2xl font-bold text-purple-600">{systemStatus.totalRequests.toLocaleString()}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">평균 응답시간</p>
              <p className="text-2xl font-bold text-orange-600">{systemStatus.avgResponseTime}ms</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">가동률</p>
              <p className="text-2xl font-bold text-green-600">{systemStatus.uptime}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Server className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 알림</h3>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                <p className="text-xs text-gray-500">{formatTimeAgo(alert.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'monitoring' && <SystemMonitoring />}
          {activeTab === 'congestion' && <CongestionAnalytics />}
          {activeTab === 'feedback' && <FeedbackAnalysis />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'settings' && <SystemSettings />}
        </div>
      </div>
    </div>
  );
};