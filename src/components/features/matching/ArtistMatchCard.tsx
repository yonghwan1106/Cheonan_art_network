'use client';

import React from 'react';
import { Star, MapPin, Calendar } from 'lucide-react';
import { MatchingResult } from '../../../utils/matchingAlgorithm';
import Card from '../../common/Card';
import Button from '../../common/Button';

interface ArtistMatchCardProps {
  matchResult: MatchingResult;
  onViewDetails: (artistId: string) => void;
}

export default function ArtistMatchCard({ matchResult, onViewDetails }: ArtistMatchCardProps) {
  const { artist, totalScore, breakdown, explanation } = matchResult;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };
  
  const getScoreText = (score: number) => {
    if (score >= 80) return '매우 적합';
    if (score >= 60) return '적합';
    return '보통';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-500 text-xs">프로필</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{artist.name}</h3>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              {artist.location}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              {artist.genres.slice(0, 2).map(genre => (
                <span 
                  key={genre}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* 매칭 점수 */}
        <div className="text-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(totalScore)}`}>
            {totalScore}점
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {getScoreText(totalScore)}
          </div>
        </div>
      </div>
      
      {/* 작가 정보 */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            경력 {artist.experienceYears}년
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
            {artist.ratings.averageScore} ({artist.ratings.reviewCount}리뷰)
          </div>
        </div>
        
        <p className="text-gray-700 text-sm line-clamp-2">
          {artist.bio}
        </p>
      </div>
      
      {/* 매칭 상세 점수 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">기본 호환성</div>
          <div className="font-semibold">{breakdown.basicCompatibility}점</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">스타일 매칭</div>
          <div className="font-semibold">{breakdown.stylePreference}점</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">경력 적합성</div>
          <div className="font-semibold">{breakdown.experienceMatch}점</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">관객 반응</div>
          <div className="font-semibold">{breakdown.audiencePrediction}점</div>
        </div>
      </div>
      
      {/* 매칭 설명 */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          💡 {explanation}
        </p>
      </div>
      
      {/* 액션 버튼 */}
      <div className="flex space-x-3">
        <Button
          onClick={() => onViewDetails(artist.id)}
          className="flex-1"
          size="sm"
        >
          상세 프로필 보기
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          size="sm"
        >
          협업 제안하기
        </Button>
      </div>
    </Card>
  );
}