'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { mockProjects } from '../../data/mockProjects';
import { mockCurators } from '../../data/mockCurators';
import { Calendar, MapPin, Users, DollarSign, Clock, Target } from 'lucide-react';

export default function ProjectsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState('all');

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string } } = {
      recruiting: { bg: 'bg-green-100', text: 'text-green-700', label: '모집중' },
      planning: { bg: 'bg-blue-100', text: 'text-blue-700', label: '기획중' },
      upcoming: { bg: 'bg-purple-100', text: 'text-purple-700', label: '예정' },
      ongoing: { bg: 'bg-orange-100', text: 'text-orange-700', label: '진행중' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: '완료' },
    };

    const statusInfo = statusMap[status] || statusMap.recruiting;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getCurator = (curatorId: string) => {
    return mockCurators.find(c => c.id === curatorId);
  };

  // Filter projects based on selected filters
  const filteredProjects = mockProjects.filter(project => {
    const statusMatch = statusFilter === 'all' || project.status === statusFilter;
    const categoryMatch = categoryFilter === 'all' || project.categories.includes(categoryFilter);
    const budgetMatch = budgetFilter === 'all' || 
      (budgetFilter === 'low' && project.budget.max <= 100000000) ||
      (budgetFilter === 'medium' && project.budget.min >= 100000000 && project.budget.max <= 500000000) ||
      (budgetFilter === 'high' && project.budget.min >= 500000000);
    
    return statusMatch && categoryMatch && budgetMatch;
  });

  const handleApplyFilters = () => {
    // Filters are applied automatically through filteredProjects
    console.log('Filters applied:', { statusFilter, categoryFilter, budgetFilter });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            문화예술 프로젝트
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            천안 지역의 다양한 문화예술 프로젝트에 참여해보세요.
          </p>
          
          {/* Mock Data Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-amber-600 text-sm">ℹ️</span>
              <span className="text-amber-700 text-sm font-medium">
                현재 표시되는 프로젝트들은 시연을 위한 가상 데이터입니다.
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex flex-wrap gap-3">
              <select 
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">모든 상태</option>
                <option value="recruiting">모집중</option>
                <option value="planning">기획중</option>
                <option value="upcoming">예정</option>
                <option value="ongoing">진행중</option>
              </select>
              <select 
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">모든 장르</option>
                <option value="전시">전시</option>
                <option value="공연">공연</option>
                <option value="커뮤니티 아트">커뮤니티 아트</option>
                <option value="워크숍">워크숍</option>
              </select>
              <select 
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value)}
              >
                <option value="all">예산 범위</option>
                <option value="low">1천만원 이하</option>
                <option value="medium">1천만원 ~ 5천만원</option>
                <option value="high">5천만원 이상</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {filteredProjects.length}개의 프로젝트
              </span>
              <Button size="sm" onClick={handleApplyFilters}>
                필터 적용
              </Button>
            </div>
          </div>
        </Card>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredProjects.map((project) => {
            const curator = getCurator(project.curatorId);
            
            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {project.title}
                    </h2>
                    {getStatusBadge(project.status)}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>#{project.id}</div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Project Details */}
                <div className="space-y-3 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{project.timeline.eventPeriod.start} ~ {project.timeline.eventPeriod.end}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{project.venue.name}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{(project.budget.min / 10000).toFixed(0)}만원 ~ {(project.budget.max / 10000).toFixed(0)}만원</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>최대 {project.maxParticipants}명</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>지원마감: {project.timeline.applicationDeadline}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Target className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>예상 관객: {project.targetAudience.expectedVisitors.toLocaleString()}명</span>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.categories.map((category) => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Curator Info */}
                {curator && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-xs">기획</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{curator.name}</div>
                        <div className="text-gray-600 text-xs">{curator.organization} {curator.position}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Link href={`/projects/${project.id}`}>
                    <Button className="flex-1" size="sm">
                      상세보기
                    </Button>
                  </Link>
                  <Link href={`/matching?projectId=${project.id}`}>
                    <Button variant="outline" className="flex-1" size="sm">
                      AI 매칭 보기
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex justify-center">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              이전
            </Button>
            <Button size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">
              다음
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}