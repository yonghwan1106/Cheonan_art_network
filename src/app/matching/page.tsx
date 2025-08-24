'use client';

import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ArtistMatchCard from '../../components/features/matching/ArtistMatchCard';
import { mockArtists } from '../../data/mockArtists';
import { mockCurators } from '../../data/mockCurators';
import { mockProjects } from '../../data/mockProjects';
import { generateMatchingResults, AudienceData } from '../../utils/matchingAlgorithm';
import { Filter, Users, Clock, DollarSign } from 'lucide-react';

const mockAudienceData: AudienceData = {
  genrePreferences: {
    painting: 0.8,
    sculpture: 0.6,
    music: 0.9,
    performance: 0.7,
    installation: 0.5,
    digital_art: 0.4,
    community_art: 0.9
  },
  ageGroups: {
    '20-30': 0.4,
    '31-40': 0.3,
    '41-50': 0.2,
    '51+': 0.1
  },
  locationPreferences: {
    '천안': 1.0,
    '충남': 0.8,
    '수도권': 0.6
  }
};

export default function MatchingPage() {
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [matchingResults, setMatchingResults] = useState(() => 
    generateMatchingResults(
      mockProjects[0], 
      mockArtists, 
      mockCurators[0], 
      mockAudienceData
    )
  );

  const handleProjectChange = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId);
    const curator = mockCurators.find(c => c.id === project?.curatorId);
    
    if (project && curator) {
      setSelectedProject(project);
      const results = generateMatchingResults(
        project,
        mockArtists,
        curator,
        mockAudienceData
      );
      setMatchingResults(results);
    }
  };

  const handleViewDetails = (artistId: string) => {
    console.log('View details for artist:', artistId);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI 매칭 시스템
          </h1>
          <p className="text-lg text-gray-600">
            프로젝트에 가장 적합한 예술가를 AI가 추천해드립니다.
          </p>
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
                  <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
                    <option>모든 점수</option>
                    <option>80점 이상</option>
                    <option>60점 이상</option>
                  </select>
                  <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
                    <option>모든 지역</option>
                    <option>천안</option>
                    <option>충남</option>
                    <option>수도권</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{matchingResults.length}명의 매칭 결과</span>
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
            <div className="space-y-6">
              {matchingResults.map((result, index) => (
                <div key={result.artist.id} className="relative">
                  {/* Rank Badge */}
                  {index < 3 && (
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

            {/* Load More */}
            {matchingResults.length > 5 && (
              <div className="text-center mt-8">
                <Button variant="outline">
                  더 많은 결과 보기
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}