'use client';

import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout';
import ProtectedRoute from '../../../components/features/auth/ProtectedRoute';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { 
  TrendingUp, 
  Calendar, 
  Heart, 
  MessageSquare, 
  Award,
  Eye,
  Star,
  ArrowUpRight,
  Plus,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { mockProjects } from '../../../data/mockProjects';
import { mockArtists } from '../../../data/mockArtists';

export default function ArtistDashboard() {
  const [timeRange, setTimeRange] = useState('30days');
  
  // 현재 로그인된 작가 정보 (실제로는 Context에서 가져와야 함)
  const currentArtist = mockArtists[0];

  // 통계 데이터 (실제로는 API에서 가져와야 함)
  const stats = {
    profileViews: 1247,
    projectMatches: 23,
    applications: 8,
    acceptanceRate: 62
  };

  // 최근 활동
  const recentActivities = [
    {
      id: 1,
      type: 'match',
      title: '새로운 프로젝트 매칭',
      description: '2025 천안 신진작가 발굴전과 87% 일치',
      timestamp: '2시간 전',
      status: 'new'
    },
    {
      id: 2,
      type: 'application',
      title: '지원서 검토 완료',
      description: '융합예술 실험실 프로젝트 지원서가 검토되었습니다',
      timestamp: '1일 전',
      status: 'pending'
    },
    {
      id: 3,
      type: 'message',
      title: '새 메시지',
      description: '이수진 기획자님으로부터 메시지가 도착했습니다',
      timestamp: '3일 전',
      status: 'unread'
    }
  ];

  // 진행중인 프로젝트
  const ongoingProjects = [
    {
      id: 'project_001',
      title: '2025 천안 신진작가 발굴전',
      curator: '이수진',
      status: 'in_progress',
      progress: 75,
      deadline: '2025-11-30'
    },
    {
      id: 'project_005',
      title: '디지털 아트 워크숍',
      curator: '박민규',
      status: 'preparing',
      progress: 30,
      deadline: '2025-12-15'
    }
  ];

  return (
    <ProtectedRoute requiredUserType="artist">
      <Layout>
        <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
                <p className="text-gray-600 mt-1">안녕하세요, {currentArtist.name}님</p>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="7days">최근 7일</option>
                  <option value="30days">최근 30일</option>
                  <option value="3months">최근 3개월</option>
                </select>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  프로필 편집
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">프로필 조회수</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.profileViews.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-1">+12% 전월 대비</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">매칭된 프로젝트</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.projectMatches}</p>
                  <p className="text-sm text-green-600 mt-1">+5 이번 주</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">지원한 프로젝트</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.applications}</p>
                  <p className="text-sm text-blue-600 mt-1">3개 검토중</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">선정률</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.acceptanceRate}%</p>
                  <p className="text-sm text-green-600 mt-1">업계 평균 45%</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 진행중인 프로젝트 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">진행중인 프로젝트</h2>
                <Button variant="outline" size="sm">
                  전체보기
                </Button>
              </div>
              <div className="space-y-4">
                {ongoingProjects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{project.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">기획자: {project.curator}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'in_progress' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status === 'in_progress' ? '진행중' : '준비중'}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">진행률</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">마감일: {project.deadline}</span>
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        상세보기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 최근 활동 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">최근 활동</h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'match' ? 'bg-blue-100' :
                      activity.type === 'application' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {activity.type === 'match' && <TrendingUp className="w-4 h-4 text-blue-600" />}
                      {activity.type === 'application' && <Calendar className="w-4 h-4 text-green-600" />}
                      {activity.type === 'message' && <MessageSquare className="w-4 h-4 text-purple-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                    {activity.status === 'new' && (
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 추천 프로젝트 */}
          <Card className="p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">추천 프로젝트</h2>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  필터
                </Button>
                <Button variant="outline" size="sm">
                  전체보기
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockProjects.slice(0, 3).map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-gray-900 line-clamp-2">{project.title}</h3>
                    <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    {project.categories.slice(0, 2).map((category) => (
                      <span key={category} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                      예산: {(project.budget.min / 10000).toFixed(0)}~{(project.budget.max / 10000).toFixed(0)}만원
                    </div>
                    <div className="flex items-center text-green-600">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      <span>85% 일치</span>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" size="sm">
                    상세보기
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      </Layout>
    </ProtectedRoute>
  );
}