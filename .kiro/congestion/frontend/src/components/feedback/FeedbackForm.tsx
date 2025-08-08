import React, { useState } from 'react';
import { 
  Star, 
  Send, 
  AlertTriangle, 
  Lightbulb, 
  Bug, 
  Heart,
  CheckCircle
} from 'lucide-react';

interface FeedbackData {
  type: 'bug' | 'suggestion' | 'compliment' | 'complaint';
  category: 'congestion' | 'route' | 'schedule' | 'ui' | 'performance' | 'other';
  rating: number;
  title: string;
  description: string;
  route?: string;
  station?: string;
}

export const FeedbackForm: React.FC = () => {
  const [formData, setFormData] = useState<FeedbackData>({
    type: 'suggestion',
    category: 'congestion',
    rating: 0,
    title: '',
    description: '',
    route: '',
    station: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const feedbackTypes = [
    { id: 'suggestion', label: '개선 제안', icon: Lightbulb, color: 'blue' },
    { id: 'bug', label: '버그 신고', icon: Bug, color: 'red' },
    { id: 'compliment', label: '칭찬', icon: Heart, color: 'green' },
    { id: 'complaint', label: '불만사항', icon: AlertTriangle, color: 'orange' }
  ];

  const categories = [
    { id: 'congestion', label: '혼잡도 정보' },
    { id: 'route', label: '경로 추천' },
    { id: 'schedule', label: '일정 관리' },
    { id: 'ui', label: '사용자 인터페이스' },
    { id: 'performance', label: '성능' },
    { id: 'other', label: '기타' }
  ];

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Save to localStorage for demo
    const existingFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
    const newFeedback = {
      ...formData,
      id: `feedback-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      response: null
    };
    existingFeedback.push(newFeedback);
    localStorage.setItem('userFeedback', JSON.stringify(existingFeedback));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        type: 'suggestion',
        category: 'congestion',
        rating: 0,
        title: '',
        description: '',
        route: '',
        station: ''
      });
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">피드백이 제출되었습니다!</h3>
        <p className="text-gray-600 mb-4">
          소중한 의견 감사합니다. 검토 후 빠른 시일 내에 답변드리겠습니다.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
          <span>피드백 ID: FB-{Date.now().toString().slice(-6)}</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Feedback Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          피드백 유형
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {feedbackTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = formData.type === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: type.id as any }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? `border-${type.color}-500 bg-${type.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-5 h-5 mx-auto mb-2 ${
                  isSelected ? `text-${type.color}-600` : 'text-gray-400'
                }`} />
                <span className={`text-sm font-medium ${
                  isSelected ? `text-${type.color}-700` : 'text-gray-600'
                }`}>
                  {type.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          카테고리
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          서비스 만족도
        </label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(star)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= formData.rating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {formData.rating > 0 && (
              <>
                {formData.rating}/5 
                {formData.rating === 5 && ' (매우 만족)'}
                {formData.rating === 4 && ' (만족)'}
                {formData.rating === 3 && ' (보통)'}
                {formData.rating === 2 && ' (불만족)'}
                {formData.rating === 1 && ' (매우 불만족)'}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Route/Station (conditional) */}
      {(formData.category === 'congestion' || formData.category === 'route') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관련 노선 (선택사항)
            </label>
            <select
              value={formData.route}
              onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">선택하세요</option>
              <option value="line1">1호선</option>
              <option value="line2">2호선</option>
              <option value="line3">3호선</option>
              <option value="line4">4호선</option>
              <option value="line5">5호선</option>
              <option value="line6">6호선</option>
              <option value="line7">7호선</option>
              <option value="line8">8호선</option>
              <option value="line9">9호선</option>
              <option value="bundang">분당선</option>
              <option value="sinbundang">신분당선</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관련 역 (선택사항)
            </label>
            <input
              type="text"
              value={formData.station}
              onChange={(e) => setFormData(prev => ({ ...prev, station: e.target.value }))}
              placeholder="예: 강남역"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          제목 *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="피드백 제목을 입력하세요"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          상세 내용 *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="구체적인 내용을 작성해주세요. 문제 상황, 개선 아이디어, 사용 환경 등을 포함하면 더욱 도움이 됩니다."
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          최소 10자 이상 작성해주세요. ({formData.description.length}/500)
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || formData.title.length < 2 || formData.description.length < 10}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              제출 중...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              피드백 제출
            </>
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 더 나은 피드백을 위한 팁</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 구체적인 상황과 예시를 포함해주세요</li>
          <li>• 문제가 발생한 시간과 장소를 명시해주세요</li>
          <li>• 기대했던 결과와 실제 결과를 비교해주세요</li>
          <li>• 개선 아이디어가 있다면 함께 제안해주세요</li>
        </ul>
      </div>
    </form>
  );
};