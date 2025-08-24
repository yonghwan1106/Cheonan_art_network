'use client';

import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout';
import ProtectedRoute from '../../../components/features/auth/ProtectedRoute';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  CheckCircle,
  Plus,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  Star
} from 'lucide-react';
import { mockCurators } from '../../../data/mockCurators';
import { mockProjects } from '../../../data/mockProjects';
import { mockArtists } from '../../../data/mockArtists';

export default function CuratorDashboard() {
  const [timeRange, setTimeRange] = useState('30days');
  
  // 현재 로그인된 기획자 정보
  const currentCurator = mockCurators[0];

  // 통계 데이터
  const stats = {
    activeProjects: 4,
    totalApplications: 156,
    completedProjects: 12,
    averageRating: 4.6
  };

  // 최근 활동
  const recentActivities = [
    {
      id: 1,
      type: 'application',
      title: '새로운 지원서 도착',
      description: '이서현 작가가 디지털아트 비엔날레에 지원했습니다',
      timestamp: '1시간 전',
      status: 'new'
    },
    {
      id: 2,
      type: 'selection',
      title: '작가 선정 완료',
      description: '천안 신진작가 발굴전 참여 작가 8명 최종 선정',
      timestamp: '2일 전',
      status: 'completed'
    },
    {
      id: 3,
      type: 'message',
      title: '작가 문의',
      description: '김민수 작가로부터 프로젝트 일정 관련 문의',
      timestamp: '3일 전',
      status: 'unread'
    }
  ];

  // 진행중인 프로젝트
  const activeProjects = mockProjects.filter(p => 
    p.curatorId === currentCurator.id && ['recruiting', 'planning'].includes(p.status)
  );

  // 최근 지원자 현황
  const recentApplicants = [
    {
      id: 1,
      artistName: '김민수',
      projectTitle: '천안 신진작가 발굴전',
      applicationDate: '2025-08-20',
      status: 'pending',
      matchScore: 87
    },
    {
      id: 2,
      artistName: '이서현',
      projectTitle: '디지털아트 비엔날레 2026',
      applicationDate: '2025-08-19',
      status: 'approved',
      matchScore: 92
    },
    {
      id: 3,
      artistName: '박지영',
      projectTitle: '융합예술 실험실',
      applicationDate: '2025-08-18',
      status: 'reviewing',
      matchScore: 78
    }
  ];

  return (
    <ProtectedRoute requiredUserType="curator">
      <Layout>
        <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">기획자 대시보드</h1>
                <p className="text-gray-600 mt-1">안녕하세요, {currentCurator.name}님</p>
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
                  새 프로젝트
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
                  <p className="text-sm font-medium text-gray-600">진행중인 프로젝트</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeProjects}</p>
                  <p className="text-sm text-blue-600 mt-1">2개 모집중</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 지원자 수</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
                  <p className="text-sm text-green-600 mt-1">+23 이번 주</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">완료된 프로젝트</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completedProjects}</p>
                  <p className="text-sm text-purple-600 mt-1">성공률 95%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">평균 평점</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
                  <p className="text-sm text-yellow-600 mt-1">⭐ 28개 리뷰</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 진행중인 프로젝트 관리 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">진행중인 프로젝트</h2>
                <Button variant="outline" size="sm">
                  전체관리
                </Button>
              </div>
              <div className="space-y-4">
                {activeProjects.slice(0, 3).map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{project.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          지원자: {project.applicantCount}명 / {project.maxParticipants}명
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'recruiting' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status === 'recruiting' ? '모집중' : '기획중'}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">모집률</span>
                        <span className="font-medium">
                          {Math.round((project.applicantCount / project.maxParticipants) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(project.applicantCount / project.maxParticipants) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        마감: {project.timeline.applicationDeadline}
                      </span>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                          지원자보기
                        </button>
                        <button className="text-gray-600 hover:text-gray-700">
                          수정
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 최근 지원자 현황 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">최근 지원자</h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                {recentApplicants.map((applicant) => (
                  <div key={applicant.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{applicant.artistName}</p>
                        <div className="flex items-center text-green-600 text-sm">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {applicant.matchScore}%
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{applicant.projectTitle}</p>
                      <p className="text-xs text-gray-500">{applicant.applicationDate}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      applicant.status === 'approved' ? 'bg-green-100 text-green-800' :
                      applicant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {applicant.status === 'approved' ? '승인' :
                       applicant.status === 'pending' ? '대기' : '검토중'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 추천 작가 */}
          <Card className="p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">추천 작가</h2>
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
              {mockArtists.slice(0, 3).map((artist) => (
                <div key={artist.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                      {artist.profileImage ? (
                        <img src={artist.profileImage} alt={artist.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{artist.name}</h3>
                      <p className="text-sm text-gray-600">{artist.location} · {artist.experienceYears}년 경력</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {artist.bio}
                  </p>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    {artist.genres.slice(0, 2).map((genre) => (
                      <span key={genre} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                        {genre}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center text-yellow-600">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      <span>{artist.ratings.averageScore} ({artist.ratings.reviewCount})</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>매칭률 높음</span>
                    </div>
                  </div>
                  
                  <Button className="w-full" size="sm" variant="outline">
                    프로필 보기
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* 최근 활동 타임라인 */}
          <Card className="p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">최근 활동</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'application' ? 'bg-blue-100' :
                    activity.type === 'selection' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    {activity.type === 'application' && <Users className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'selection' && <CheckCircle className="w-4 h-4 text-green-600" />}
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
      </div>
      </Layout>
    </ProtectedRoute>
  );
}