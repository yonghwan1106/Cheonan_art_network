import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageCircle,
  Star,
  Filter,
  Search,
  Calendar,
  Tag,
  Eye,
  Trash2
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  type: 'bug' | 'suggestion' | 'compliment' | 'complaint';
  category: string;
  rating: number;
  title: string;
  description: string;
  route?: string;
  station?: string;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  response?: {
    message: string;
    respondedAt: string;
    respondedBy: string;
  };
}

export const FeedbackHistory: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [filteredList, setFilteredList] = useState<FeedbackItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

  // Mock data generation
  const generateMockFeedback = (): FeedbackItem[] => {
    const mockData: FeedbackItem[] = [
      {
        id: 'feedback-1',
        type: 'suggestion',
        category: 'congestion',
        rating: 4,
        title: '2호선 혼잡도 예측 정확도 개선 요청',
        description: '출근 시간대 2호선 혼잡도 예측이 실제와 차이가 있어요. 특히 강남역-역삼역 구간에서 예측보다 더 혼잡한 경우가 많습니다.',
        route: '2호선',
        station: '강남역',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'resolved',
        response: {
          message: '소중한 의견 감사합니다. 해당 구간의 데이터 수집 센서를 추가 설치하여 예측 정확도를 개선했습니다. 앞으로 더 정확한 정보를 제공하겠습니다.',
          respondedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          respondedBy: '혼잡도팀'
        }
      },
      {
        id: 'feedback-2',
        type: 'bug',
        category: 'ui',
        rating: 2,
        title: '모바일에서 경로 선택 버튼이 잘림',
        description: '아이폰 12에서 경로 추천 페이지의 선택 버튼이 화면 밖으로 잘려서 터치가 안 됩니다.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'in_progress',
        response: {
          message: '버그 신고 감사합니다. 현재 모바일 반응형 이슈를 수정 중이며, 이번 주 내로 업데이트 예정입니다.',
          respondedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          respondedBy: '개발팀'
        }
      },
      {
        id: 'feedback-3',
        type: 'compliment',
        category: 'route',
        rating: 5,
        title: '경로 추천 기능이 정말 유용해요!',
        description: '매일 출퇴근할 때 경로 추천을 사용하는데, 실제로 시간을 많이 절약하고 있어요. 특히 대체 경로 제안이 정확해서 만족합니다.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'closed',
        response: {
          message: '따뜻한 칭찬 감사합니다! 더 나은 서비스를 위해 계속 노력하겠습니다.',
          respondedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          respondedBy: '고객지원팀'
        }
      },
      {
        id: 'feedback-4',
        type: 'complaint',
        category: 'performance',
        rating: 2,
        title: '앱 로딩 속도가 너무 느려요',
        description: '앱을 실행할 때마다 로딩이 10초 이상 걸립니다. 급할 때 사용하기 어려워요.',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      },
      {
        id: 'feedback-5',
        type: 'suggestion',
        category: 'schedule',
        rating: 4,
        title: '일정 알림 기능 추가 요청',
        description: '중요한 약속이 있을 때 미리 출발 시간을 알려주는 기능이 있으면 좋겠어요.',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'resolved',
        response: {
          message: '좋은 아이디어 감사합니다! 일정 알림 기능을 개발하여 다음 업데이트에 포함할 예정입니다.',
          respondedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          respondedBy: '기획팀'
        }
      }
    ];

    return mockData;
  };

  useEffect(() => {
    // Load from localStorage and merge with mock data
    const storedFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
    const mockFeedback = generateMockFeedback();
    const allFeedback = [...storedFeedback, ...mockFeedback];
    
    // Sort by creation date (newest first)
    allFeedback.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFeedbackList(allFeedback);
    setFilteredList(allFeedback);
  }, []);

  useEffect(() => {
    let filtered = feedbackList;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    setFilteredList(filtered);
  }, [feedbackList, searchTerm, statusFilter, typeFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'in_progress':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기 중';
      case 'in_progress':
        return '처리 중';
      case 'resolved':
        return '해결됨';
      case 'closed':
        return '완료';
      default:
        return '알 수 없음';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bug':
        return '버그 신고';
      case 'suggestion':
        return '개선 제안';
      case 'compliment':
        return '칭찬';
      case 'complaint':
        return '불만사항';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return '오늘';
    } else if (diffInDays === 1) {
      return '어제';
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('이 피드백을 삭제하시겠습니까?')) {
      const updatedList = feedbackList.filter(item => item.id !== id);
      setFeedbackList(updatedList);
      
      // Update localStorage
      const storedFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
      const updatedStored = storedFeedback.filter((item: any) => item.id !== id);
      localStorage.setItem('userFeedback', JSON.stringify(updatedStored));
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="피드백 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">모든 상태</option>
            <option value="pending">대기 중</option>
            <option value="in_progress">처리 중</option>
            <option value="resolved">해결됨</option>
            <option value="closed">완료</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">모든 유형</option>
            <option value="suggestion">개선 제안</option>
            <option value="bug">버그 신고</option>
            <option value="compliment">칭찬</option>
            <option value="complaint">불만사항</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      {filteredList.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">피드백이 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? '검색 조건에 맞는 피드백이 없습니다.'
              : '아직 제출한 피드백이 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      feedback.type === 'bug' ? 'bg-red-100 text-red-800' :
                      feedback.type === 'suggestion' ? 'bg-blue-100 text-blue-800' :
                      feedback.type === 'compliment' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {getTypeLabel(feedback.type)}
                    </span>
                    <span className="inline-flex items-center space-x-1">
                      {getStatusIcon(feedback.status)}
                      <span className="text-sm text-gray-600">{getStatusLabel(feedback.status)}</span>
                    </span>
                    {feedback.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{feedback.rating}/5</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {feedback.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {feedback.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(feedback.createdAt)}</span>
                    </span>
                    {feedback.route && (
                      <span className="flex items-center space-x-1">
                        <Tag className="w-3 h-3" />
                        <span>{feedback.route}</span>
                      </span>
                    )}
                    {feedback.station && (
                      <span>{feedback.station}</span>
                    )}
                  </div>

                  {feedback.response && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          {feedback.response.respondedBy} 답변
                        </span>
                        <span className="text-xs text-blue-600">
                          {formatDate(feedback.response.respondedAt)}
                        </span>
                      </div>
                      <p className="text-sm text-blue-800">
                        {feedback.response.message}
                      </p>
                    </div>
                  )}
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
                    onClick={() => handleDelete(feedback.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
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

      {/* Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedFeedback(null)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    피드백 상세
                  </h3>
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
                      <span className="ml-2">{getTypeLabel(selectedFeedback.type)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">상태:</span>
                      <span className="ml-2">{getStatusLabel(selectedFeedback.status)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">만족도:</span>
                      <span className="ml-2">{selectedFeedback.rating}/5</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">제출일:</span>
                      <span className="ml-2">{formatDate(selectedFeedback.createdAt)}</span>
                    </div>
                  </div>
                  
                  {selectedFeedback.response && (
                    <div className="border-t pt-4">
                      <h5 className="font-medium text-gray-900 mb-2">답변</h5>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">{selectedFeedback.response.message}</p>
                        <div className="mt-2 text-xs text-blue-600">
                          {selectedFeedback.response.respondedBy} • {formatDate(selectedFeedback.response.respondedAt)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};