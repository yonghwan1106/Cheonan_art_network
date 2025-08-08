import React, { useState } from 'react';
import { 
  MessageSquare, 
  Star, 
  Send, 
  ThumbsUp, 
  ThumbsDown,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { FeedbackForm } from '../components/feedback/FeedbackForm';
import { FeedbackHistory } from '../components/feedback/FeedbackHistory';
import { FeedbackAnalytics } from '../components/feedback/FeedbackAnalytics';

export const FeedbackPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'submit' | 'history' | 'analytics'>('submit');

  const tabs = [
    { id: 'submit', label: '피드백 제출', icon: MessageSquare },
    { id: 'history', label: '제출 내역', icon: Clock },
    { id: 'analytics', label: '통계', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">피드백 센터</h1>
            <p className="text-gray-600">서비스 개선을 위한 소중한 의견을 들려주세요</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">제출한 피드백</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">평균 만족도</p>
              <p className="text-2xl font-bold text-gray-900">4.2</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">처리 완료</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">처리 대기</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
          </div>
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
                      ? 'border-blue-500 text-blue-600'
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
          {activeTab === 'submit' && <FeedbackForm />}
          {activeTab === 'history' && <FeedbackHistory />}
          {activeTab === 'analytics' && <FeedbackAnalytics />}
        </div>
      </div>
    </div>
  );
};