import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Star, 
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  ThumbsUp,
  Calendar,
  Users,
  Target,
  Award
} from 'lucide-react';

interface AnalyticsData {
  totalFeedback: number;
  averageRating: number;
  responseRate: number;
  resolutionTime: number;
  categoryBreakdown: Record<string, number>;
  typeBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  monthlyTrends: Array<{
    month: string;
    count: number;
    rating: number;
  }>;
  topIssues: Array<{
    category: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export const FeedbackAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Generate mock analytics data
  const generateAnalytics = (): AnalyticsData => {
    return {
      totalFeedback: 127,
      averageRating: 4.2,
      responseRate: 89,
      resolutionTime: 2.3,
      categoryBreakdown: {
        'congestion': 45,
        'route': 32,
        'ui': 28,
        'schedule': 15,
        'performance': 7
      },
      typeBreakdown: {
        'suggestion': 58,
        'bug': 31,
        'compliment': 23,
        'complaint': 15
      },
      statusBreakdown: {
        'resolved': 67,
        'in_progress': 28,
        'pending': 22,
        'closed': 10
      },
      monthlyTrends: [
        { month: '10월', count: 23, rating: 3.8 },
        { month: '11월', count: 31, rating: 4.1 },
        { month: '12월', count: 28, rating: 4.3 },
        { month: '1월', count: 45, rating: 4.2 }
      ],
      topIssues: [
        { category: '혼잡도 예측 정확도', count: 18, trend: 'up' },
        { category: '모바일 UI 개선', count: 12, trend: 'down' },
        { category: '경로 추천 알고리즘', count: 9, trend: 'stable' },
        { category: '알림 기능', count: 7, trend: 'up' },
        { category: '성능 최적화', count: 5, trend: 'down' }
      ]
    };
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAnalytics(generateAnalytics());
    }, 500);
  }, [timeRange]);

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">분석 데이터 로딩 중...</span>
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-green-500 transform rotate-180" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">피드백 분석</h3>
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: '7d', label: '7일' },
            { key: '30d', label: '30일' },
            { key: '90d', label: '90일' },
            { key: '1y', label: '1년' }
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setTimeRange(option.key as any)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === option.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 피드백</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalFeedback}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% 전월 대비
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">평균 만족도</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.averageRating}</p>
              <div className="flex items-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= Math.round(analytics.averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">응답률</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.responseRate}%</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <ThumbsUp className="w-3 h-3 mr-1" />
                목표 85% 달성
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">평균 해결 시간</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.resolutionTime}일</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <Clock className="w-3 h-3 mr-1" />
                -0.5일 개선
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 분포</h4>
          <div className="space-y-3">
            {Object.entries(analytics.categoryBreakdown).map(([category, count]) => {
              const percentage = (count / analytics.totalFeedback) * 100;
              const categoryLabels: Record<string, string> = {
                'congestion': '혼잡도 정보',
                'route': '경로 추천',
                'ui': '사용자 인터페이스',
                'schedule': '일정 관리',
                'performance': '성능'
              };
              
              return (
                <div key={category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {categoryLabels[category] || category}
                    </span>
                    <span className="text-sm text-gray-600">{count}개 ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Type Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">유형별 분포</h4>
          <div className="space-y-3">
            {Object.entries(analytics.typeBreakdown).map(([type, count]) => {
              const percentage = (count / analytics.totalFeedback) * 100;
              const typeLabels: Record<string, string> = {
                'suggestion': '개선 제안',
                'bug': '버그 신고',
                'compliment': '칭찬',
                'complaint': '불만사항'
              };
              const colors: Record<string, string> = {
                'suggestion': 'bg-blue-600',
                'bug': 'bg-red-600',
                'compliment': 'bg-green-600',
                'complaint': 'bg-orange-600'
              };
              
              return (
                <div key={type}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {typeLabels[type] || type}
                    </span>
                    <span className="text-sm text-gray-600">{count}개 ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${colors[type] || 'bg-gray-600'} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">월별 트렌드</h4>
        <div className="grid grid-cols-4 gap-4">
          {analytics.monthlyTrends.map((month, index) => (
            <div key={month.month} className="text-center">
              <div className="mb-2">
                <div 
                  className="bg-blue-600 rounded-t-md mx-auto transition-all duration-300"
                  style={{ 
                    width: '40px',
                    height: `${(month.count / 50) * 100}px`,
                    minHeight: '20px'
                  }}
                ></div>
                <div className="bg-gray-200 h-1 w-10 mx-auto"></div>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{month.month}</p>
                <p className="text-gray-600">{month.count}개</p>
                <div className="flex items-center justify-center mt-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                  <span className="text-xs text-gray-600">{month.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Issues */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">주요 이슈</h4>
        <div className="space-y-3">
          {analytics.topIssues.map((issue, index) => (
            <div key={issue.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                  {index + 1}
                </div>
                <span className="font-medium text-gray-900">{issue.category}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">{issue.count}건</span>
                {getTrendIcon(issue.trend)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="w-5 h-5 text-blue-600 mr-2" />
          인사이트 및 개선 제안
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">👍 잘하고 있는 점</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 응답률이 목표치(85%)를 상회하고 있습니다</li>
              <li>• 평균 만족도가 4.2점으로 양호합니다</li>
              <li>• 칭찬 피드백이 꾸준히 증가하고 있습니다</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">🎯 개선이 필요한 점</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 혼잡도 예측 정확도 관련 피드백이 증가 중</li>
              <li>• 모바일 UI 개선 요청이 지속되고 있습니다</li>
              <li>• 성능 관련 불만이 발생하고 있습니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};