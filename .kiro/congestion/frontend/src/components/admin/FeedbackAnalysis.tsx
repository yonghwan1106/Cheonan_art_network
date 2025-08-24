import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Reply
} from 'lucide-react';

interface FeedbackAnalysisData {
  overview: {
    totalFeedback: number;
    newFeedback: number;
    averageRating: number;
    responseRate: number;
    avgResponseTime: number;
  };
  categoryBreakdown: Array<{
    category: string;
    count: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
    avgRating: number;
  }>;
  recentFeedback: Array<{
    id: string;
    type: 'bug' | 'suggestion' | 'compliment' | 'complaint';
    title: string;
    description: string;
    rating: number;
    category: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'closed';
    createdAt: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    user: {
      id: string;
      name: string;
    };
  }>;
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topIssues: Array<{
    issue: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
    trend: 'up' | 'down' | 'stable';
  }>;
}

export const FeedbackAnalysis: React.FC = () => {
  const [data, setData] = useState<FeedbackAnalysisData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);

  // Generate mock feedback analysis data
  const generateFeedbackData = (): FeedbackAnalysisData => {
    return {
      overview: {
        totalFeedback: 1247,
        newFeedback: 23,
        averageRating: 4.2,
        responseRate: 89.3,
        avgResponseTime: 2.4
      },
      categoryBreakdown: [
        {
          category: '혼잡도 정보',
          count: 456,
          percentage: 36.6,
          trend: 'up',
          avgRating: 3.8
        },
        {
          category: '경로 추천',
          count: 298,
          percentage: 23.9,
          trend: 'stable',
          avgRating: 4.3
        },
        {
          category: 'UI/UX',
          count: 187,
          percentage: 15.0,
          trend: 'down',
          avgRating: 4.1
        },
        {
          category: '일정 관리',
          count: 156,
          percentage: 12.5,
          trend: 'up',
          avgRating: 4.5
        },
        {
          category: '성능',
          count: 89,
          percentage: 7.1,
          trend: 'down',
          avgRating: 3.2
        },
        {
          category: '기타',
          count: 61,
          percentage: 4.9,
          trend: 'stable',
          avgRating: 4.0
        }
      ],
      recentFeedback: [
        {
          id: 'fb-001',
          type: 'bug',
          title: '2호선 혼잡도 데이터 오류',
          description: '강남역에서 혼잡도가 실제보다 낮게 표시됩니다.',
          rating: 2,
          category: '혼잡도 정보',
          status: 'in_progress',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          priority: 'high',
          user: { id: 'user-1', name: '김철수' }
        },
        {
          id: 'fb-002',
          type: 'suggestion',
          title: '알림 설정 개선 요청',
          description: '더 세밀한 알림 설정 옵션이 필요합니다.',
          rating: 4,
          category: 'UI/UX',
          status: 'pending',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          priority: 'medium',
          user: { id: 'user-2', name: '이영희' }
        },
        {
          id: 'fb-003',
          type: 'compliment',
          title: '경로 추천 기능 만족',
          description: '정확한 경로 추천으로 시간을 많이 절약했습니다.',
          rating: 5,
          category: '경로 추천',
          status: 'closed',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          priority: 'low',
          user: { id: 'user-3', name: '박민수' }
        },
        {
          id: 'fb-004',
          type: 'complaint',
          title: '앱 로딩 속도 개선 필요',
          description: '앱 실행 시 로딩 시간이 너무 오래 걸립니다.',
          rating: 2,
          category: '성능',
          status: 'pending',
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          priority: 'urgent',
          user: { id: 'user-4', name: '정수진' }
        }
      ],
      sentimentAnalysis: {
        positive: 62.3,
        neutral: 25.1,
        negative: 12.6
      },
      topIssues: [
        { issue: '혼잡도 예측 정확도', count: 89, severity: 'high', trend: 'up' },
        { issue: '모바일 앱 성능', count: 67, severity: 'medium', trend: 'stable' },
        { issue: '알림 기능 개선', count: 45, severity: 'medium', trend: 'up' },
        { issue: 'UI 사용성', count: 34, severity: 'low', trend: 'down' },
        { issue: '데이터 동기화', count: 23, severity: 'high', trend: 'down' }
      ]
    };
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData(generateFeedbackData());
    }, 500);
  }, [timeRange]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug':
        return 'bg-red-100 text-red-800';
      case 'suggestion':
        return 'bg-blue-100 text-blue-800';
      case 'compliment':
        return 'bg-green-100 text-green-800';
      case 'complaint':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return '1시간 미만';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    return `${Math.floor(diffInHours / 24)}일 전`;
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-2 text-gray-600">피드백 분석 데이터 로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">피드백 분석</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option value="7d">7일</option>
          <option value="30d">30일</option>
          <option value="90d">90일</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 피드백</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalFeedback}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{data.overview.newFeedback} 신규
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">평균 만족도</p>
              <p className="text-2xl font-bold text-yellow-600">{data.overview.averageRating}</p>
              <div className="flex items-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= Math.round(data.overview.averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">응답률</p>
              <p className="text-2xl font-bold text-green-600">{data.overview.responseRate}%</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <ThumbsUp className="w-3 h-3 mr-1" />
                목표 달성
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">평균 응답시간</p>
              <p className="text-2xl font-bold text-purple-600">{data.overview.avgResponseTime}일</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingDown className="w-3 h-3 mr-1" />
                -0.3일 개선
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">감정 분석</p>
              <p className="text-2xl font-bold text-green-600">{data.sentimentAnalysis.positive}%</p>
              <p className="text-xs text-gray-500">긍정적</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <ThumbsUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 분석</h4>
          <div className="space-y-4">
            {data.categoryBreakdown.map((category) => (
              <div key={category.category} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{category.category}</span>
                    {getTrendIcon(category.trend)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{category.count}건</span>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm text-gray-600">{category.avgRating}</span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {category.percentage}% of total feedback
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">감정 분석</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ThumbsUp className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-900">긍정적</span>
              </div>
              <span className="text-lg font-bold text-green-600">{data.sentimentAnalysis.positive}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full"
                style={{ width: `${data.sentimentAnalysis.positive}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                <span className="font-medium text-gray-900">중립적</span>
              </div>
              <span className="text-lg font-bold text-gray-600">{data.sentimentAnalysis.neutral}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gray-400 h-3 rounded-full"
                style={{ width: `${data.sentimentAnalysis.neutral}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ThumbsDown className="w-4 h-4 text-red-600" />
                <span className="font-medium text-gray-900">부정적</span>
              </div>
              <span className="text-lg font-bold text-red-600">{data.sentimentAnalysis.negative}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-red-500 h-3 rounded-full"
                style={{ width: `${data.sentimentAnalysis.negative}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">최근 피드백</h4>
        <div className="space-y-4">
          {data.recentFeedback.map((feedback) => (
            <div key={feedback.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(feedback.type)}`}>
                      {feedback.type}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                      {feedback.status}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
                      {feedback.priority}
                    </span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= feedback.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <h5 className="font-medium text-gray-900 mb-1">{feedback.title}</h5>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{feedback.description}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{feedback.user.name}</span>
                    <span>{feedback.category}</span>
                    <span>{formatTimeAgo(feedback.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setSelectedFeedback(feedback)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                    title="자세히 보기"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                    title="답변하기"
                  >
                    <Reply className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Issues */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">주요 이슈</h4>
        <div className="space-y-3">
          {data.topIssues.map((issue, index) => (
            <div key={issue.issue} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold text-red-600">
                  {index + 1}
                </div>
                <span className="font-medium text-gray-900">{issue.issue}</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                  issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {issue.severity}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">{issue.count}건</span>
                {getTrendIcon(issue.trend)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedFeedback(null)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">피드백 상세</h3>
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedFeedback.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedFeedback.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">유형:</span>
                      <span className="ml-2">{selectedFeedback.type}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">상태:</span>
                      <span className="ml-2">{selectedFeedback.status}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">우선순위:</span>
                      <span className="ml-2">{selectedFeedback.priority}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">만족도:</span>
                      <span className="ml-2">{selectedFeedback.rating}/5</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-end space-x-3">
                      <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        상태 변경
                      </button>
                      <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700">
                        답변하기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};