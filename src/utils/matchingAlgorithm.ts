import { Artist } from '../data/mockArtists';
import { Project } from '../data/mockProjects';
import { Curator } from '../data/mockCurators';

export interface MatchingResult {
  artist: Artist;
  totalScore: number;
  breakdown: {
    basicCompatibility: number;
    stylePreference: number;
    experienceMatch: number;
    audiencePrediction: number;
  };
  explanation: string;
}

export interface AudienceData {
  genrePreferences: { [key: string]: number };
  ageGroups: { [key: string]: number };
  locationPreferences: { [key: string]: number };
}

export function calculateMatchingScore(
  artist: Artist, 
  project: Project, 
  curator: Curator, 
  audienceData: AudienceData
): MatchingResult {
  const weights = {
    basicCompatibility: 0.4,    // 40%
    stylePreference: 0.25,      // 25%
    experienceMatch: 0.2,       // 20% 
    audiencePrediction: 0.15    // 15%
  };

  // 1. 기본 호환성 (40점)
  const basicScore = calculateBasicCompatibility(artist, project);
  
  // 2. 스타일 선호도 매칭 (25점)  
  const styleScore = calculateStyleMatch(artist, curator);
  
  // 3. 경력 수준 적합성 (20점)
  const experienceScore = calculateExperienceMatch(artist, project);
  
  // 4. 예상 관객 반응 (15점)
  const audienceScore = predictAudienceReaction(artist, project, audienceData);

  const totalScore = (
    basicScore * weights.basicCompatibility +
    styleScore * weights.stylePreference + 
    experienceScore * weights.experienceMatch +
    audienceScore * weights.audiencePrediction
  );

  return {
    artist,
    totalScore: Math.round(totalScore),
    breakdown: {
      basicCompatibility: Math.round(basicScore),
      stylePreference: Math.round(styleScore),
      experienceMatch: Math.round(experienceScore), 
      audiencePrediction: Math.round(audienceScore)
    },
    explanation: generateMatchingExplanation(basicScore, styleScore, experienceScore, audienceScore)
  };
}

function calculateBasicCompatibility(artist: Artist, project: Project): number {
  let score = 0;
  
  // 장르 일치도 (50%)
  const genreMatch = artist.genres.some(genre => 
    project.categories.includes(genre)
  );
  score += genreMatch ? 50 : 0;
  
  // 예산 범위 (25%)
  const budgetFit = (
    artist.preferredBudget.min <= project.budget.max &&
    artist.preferredBudget.max >= project.budget.min
  );
  score += budgetFit ? 25 : 0;
  
  // 일정 가능 (25%)
  const timelineFit = (
    new Date(artist.availability.startDate) <= new Date(project.timeline.preparationPeriod.start) &&
    new Date(artist.availability.endDate) >= new Date(project.timeline.eventPeriod.end)
  );
  score += timelineFit ? 25 : 0;
  
  return score;
}

function calculateStyleMatch(artist: Artist, curator: Curator): number {
  const artistStyles = new Set(artist.workStyle);
  const curatorPreferences = new Set(curator.preferences.preferredStyles);
  
  const intersection = [...artistStyles].filter(style => 
    curatorPreferences.has(style)
  );
  
  const matchRatio = intersection.length / Math.max(artistStyles.size, curatorPreferences.size);
  return matchRatio * 100;
}

function calculateExperienceMatch(artist: Artist, project: Project): number {
  const artistExp = artist.experienceYears;
  
  switch(project.requirements.experienceLevel) {
    case 'beginner':
      return artistExp <= 3 ? 100 : Math.max(0, 100 - (artistExp - 3) * 20);
    case 'intermediate': 
      return artistExp >= 3 && artistExp <= 8 ? 100 : Math.max(0, 100 - Math.abs(artistExp - 5.5) * 15);
    case 'expert':
      return artistExp >= 8 ? 100 : Math.max(0, artistExp * 12.5);
    case 'beginner_to_intermediate':
      return artistExp <= 8 ? 100 : Math.max(0, 100 - (artistExp - 8) * 15);
    default:
      return 70; // 기본값
  }
}

function predictAudienceReaction(artist: Artist, project: Project, audienceData: AudienceData): number {
  // 가상의 관객 만족도 예측 로직
  const artistRating = artist.ratings.averageScore;
  const genrePopularity = getGenrePopularity(artist.genres[0], audienceData);
  const locationBonus = artist.location === '천안' ? 10 : 0;
  
  const predictedScore = (
    (artistRating / 5) * 60 +  // 작가 평점을 60점 만점으로 변환
    genrePopularity * 30 +      // 장르 인기도 30점
    locationBonus               // 지역 보너스 10점
  );
  
  return Math.min(100, predictedScore);
}

function getGenrePopularity(genre: string, audienceData: AudienceData): number {
  const popularityMap: { [key: string]: number } = {
    'painting': 0.8,
    'sculpture': 0.6,
    'music': 0.9,
    'performance': 0.7,
    'installation': 0.5,
    'digital_art': 0.4,
    'community_art': 0.9
  };
  
  return (popularityMap[genre] || 0.5) * 100;
}

function generateMatchingExplanation(
  basicScore: number, 
  styleScore: number, 
  experienceScore: number, 
  audienceScore: number
): string {
  const explanations = [];
  
  if (basicScore >= 80) {
    explanations.push('프로젝트 기본 요구사항과 완벽하게 일치합니다.');
  } else if (basicScore >= 60) {
    explanations.push('프로젝트 요구사항과 대부분 일치합니다.');
  } else {
    explanations.push('프로젝트 요구사항과 일부 차이가 있습니다.');
  }
  
  if (styleScore >= 70) {
    explanations.push('기획자의 선호 스타일과 잘 맞습니다.');
  } else if (styleScore >= 40) {
    explanations.push('기획자 선호도와 적당히 일치합니다.');
  } else {
    explanations.push('새로운 스타일 도전의 기회가 될 수 있습니다.');
  }
  
  if (experienceScore >= 80) {
    explanations.push('요구되는 경력 수준에 적합합니다.');
  } else {
    explanations.push('경력 수준에 약간의 차이가 있지만 성장 가능성이 있습니다.');
  }
  
  if (audienceScore >= 70) {
    explanations.push('관객들의 높은 만족도가 예상됩니다.');
  } else {
    explanations.push('관객들에게 새로운 경험을 제공할 수 있습니다.');
  }
  
  return explanations.join(' ');
}

// 매칭 결과 생성 함수
export function generateMatchingResults(
  project: Project, 
  allArtists: Artist[], 
  curator: Curator, 
  audienceData: AudienceData
): MatchingResult[] {
  const results = allArtists.map(artist => {
    return calculateMatchingScore(artist, project, curator, audienceData);
  });
  
  // 점수 순으로 정렬
  return results.sort((a, b) => b.totalScore - a.totalScore);
}