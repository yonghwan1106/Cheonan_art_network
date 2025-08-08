import React from 'react';
import { BarChart3, Users, TrendingUp, Clock, MapPin, Star } from 'lucide-react';
import { LoadingCard } from '../components/common/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingCard message="대시보드를 불러오는 중..." />
      </div>
    );
  }

  const stats = [
    {
      name: '오늘 예측 정확도',
      value: '94.2%',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      name: '활성 사용자',
      value: '1,247',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      name: '평균 대기시간',
      value: '3.2분',
      change: '-0.8분',
      changeType: 'positive' as const,
      icon: Clock,
    },
    {
      name: '피드백 수집',
      value: '89',
      change: '+23',
      changeType: 'positive' as const,
      icon: BarChart3,
    },
  ];

  const recentRoutes = [
    { id: 1, from: '홍익대입구', to: '강남', time: '08:30', congestion: 'high', saved: '5분' },
    { id: 2, from: '잠실', to: '명동', time: '09:15', congestion: 'medium', saved: '3분' },
    { id: 3, from: '여의도', to: '신촌', time: '18:45', congestion: 'low', saved: '8분' },
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-1 text-sm text-gray-600">
          실시간 혼잡도 현황과 개인화된 추천을 확인하세요
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {item.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {item.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Routes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              최근 이용 경로
            </h3>
            <div className="space-y-4">
              {recentRoutes.map((route) => (
                <div key={route.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {route.from} → {route.to}
                      </p>
                      <p className="text-xs text-gray-500">{route.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCongestionColor(route.congestion)}`}>
                      {getCongestionText(route.congestion)}
                    </span>
                    <span className="text-xs text-green-600 font-medium">
                      {route.saved} 절약
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              빠른 실행
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">실시간 혼잡도 확인</span>
                </div>
                <span className="text-blue-600">→</span>
              </button>
              
              <button className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">경로 추천 받기</span>
                </div>
                <span className="text-green-600">→</span>
              </button>
              
              <button className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">피드백 제출하기</span>
                </div>
                <span className="text-purple-600">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Recommendations */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            오늘의 추천
          </h3>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  오후 6시 이후 이용을 권장합니다
                </h4>
                <p className="mt-1 text-sm text-gray-600">
                  현재 시간대(오후 5-6시)는 평소보다 20% 더 혼잡합니다. 
                  1시간 후 이용하시면 15분 정도 시간을 절약할 수 있어요.
                </p>
                <div className="mt-3">
                  <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                    자세히 보기 →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};