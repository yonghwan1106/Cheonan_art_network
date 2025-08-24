'use client';

import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ArtistMatchCard from '../../components/features/matching/ArtistMatchCard';
import { mockArtists } from '../../data/mockArtists';
import { mockCurators } from '../../data/mockCurators';
import { mockProjects } from '../../data/mockProjects';
import { mockAudienceData } from '../../data/mockAudience';
import { generateMatchingResults } from '../../utils/matchingAlgorithm';
import { Filter, Users, Clock, DollarSign, RefreshCw, Sparkles } from 'lucide-react';

export default function MatchingPage() {
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterScore, setFilterScore] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [matchingResults, setMatchingResults] = useState(() => 
    generateMatchingResults(
      mockProjects[0], 
      mockArtists, 
      mockCurators[0], 
      mockAudienceData
    )
  );

  const handleProjectChange = async (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId);
    const curator = mockCurators.find(c => c.id === project?.curatorId);
    
    if (project && curator) {
      setIsLoading(true);
      setSelectedProject(project);
      
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const results = generateMatchingResults(
        project,
        mockArtists,
        curator,
        mockAudienceData
      );
      setMatchingResults(results);
      setIsLoading(false);
    }
  };

  const handleRefreshResults = async () => {
    setIsLoading(true);
    
    // Simulate AI recalculation with updated data
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const curator = mockCurators.find(c => c.id === selectedProject.curatorId);
    if (curator) {
      const results = generateMatchingResults(
        selectedProject,
        mockArtists,
        curator,
        mockAudienceData
      );
      setMatchingResults(results);
    }
    setIsLoading(false);
  };

  const handleViewDetails = (artistId: string) => {
    window.open(`/profile/${artistId}`, '_blank');
  };

  // Filter matching results based on selected filters
  const filteredResults = matchingResults.filter(result => {
    const scoreFilter = 
      filterScore === 'all' ||
      (filterScore === '80+' && result.totalScore >= 80) ||
      (filterScore === '60+' && result.totalScore >= 60);
    
    const locationFilter = 
      filterLocation === 'all' ||
      result.artist.location.includes(filterLocation);
    
    return scoreFilter && locationFilter;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  AI 매칭 시스템
                </h1>
              </div>
              <p className="text-lg text-gray-600">
                최신 AI 알고리즘으로 프로젝트에 가장 적합한 예술가를 실시간 추천합니다.
              </p>
              <div className="mt-3 text-sm text-blue-600">
                현재 AI 알고리즘으로 관람객 데이터를 기반으로 분석
              </div>
            </div>
            <Button 
              onClick={handleRefreshResults} 
              disabled={isLoading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>새로고침</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Project Selection */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-xl font-semibold mb-4">프로젝트 선택</h2>
              <div className="space-y-3">
                {mockProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectChange(project.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedProject.id === project.id
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <h3 className="font-medium text-sm mb-1">{project.title}</h3>
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {(project.budget.min / 10000).toFixed(0)}만원 ~ {(project.budget.max / 10000).toFixed(0)}만원
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {project.categories.slice(0, 2).map(cat => (
                        <span key={cat} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Selected Project Details */}
            {selectedProject && (
              <Card className="mt-4">
                <h3 className="font-semibold mb-3">프로젝트 상세</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-gray-500 mb-1">장소</div>
                    <div>{selectedProject.venue.name}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">기간</div>
                    <div>{selectedProject.timeline.eventPeriod.start} ~ {selectedProject.timeline.eventPeriod.end}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">모집인원</div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      최대 {selectedProject.maxParticipants}명
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">지원마감</div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {selectedProject.timeline.applicationDeadline}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Main Content - Matching Results */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <Card className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium">필터:</span>
                  </div>
                  <select 
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                    value={filterScore}
                    onChange={(e) => setFilterScore(e.target.value)}
                  >
                    <option value="all">모든 점수</option>
                    <option value="80+">80점 이상</option>
                    <option value="60+">60점 이상</option>
                  </select>
                  <select 
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                  >
                    <option value="all">모든 지역</option>
                    <option value="천안">천안</option>
                    <option value="충남">충남</option>
                    <option value="수도권">수도권</option>
                  </select>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{filteredResults.length}명의 결과</span>
                  </div>
                  {isLoading && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>AI 분석중...</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Results Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">
                &ldquo;{selectedProject.title}&rdquo; 매칭 결과
              </h2>
              <p className="text-gray-600">
                AI가 분석한 가장 적합한 예술가들을 점수 순으로 보여드립니다.
              </p>
            </div>

            {/* Matching Results */}
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, index) => (
                  <Card key={index} className="p-6 animate-pulse">
                    <div className="flex space-x-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="space-y-6">
                {filteredResults.map((result, index) => (
                  <div key={result.artist.id} className="relative">
                    {/* Rank Badge */}
                    {index < 3 && filterScore === 'all' && filterLocation === 'all' && (
                      <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold z-10 ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                      }`}>
                        {index + 1}
                      </div>
                    )}
                    <ArtistMatchCard
                      matchResult={result}
                      onViewDetails={handleViewDetails}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  조건에 맞는 예술가가 없습니다
                </h3>
                <p className="text-gray-600 mb-4">
                  필터 조건을 조정하거나 다른 프로젝트를 선택해보세요.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilterScore('all');
                    setFilterLocation('all');
                  }}
                >
                  필터 초기화
                </Button>
              </Card>
            )}

            {/* Load More */}
            {!isLoading && filteredResults.length > 5 && (
              <div className="text-center mt-8">
                <Button variant="outline">
                  더 많은 결과 보기 ({matchingResults.length - filteredResults.length}명 더)
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}