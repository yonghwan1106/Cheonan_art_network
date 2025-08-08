import { FeedbackData, CongestionLevel, PredictionData } from '../types';
import { generateId, getCurrentTimestamp } from '../utils/helpers';
import { dataStore } from './dataStore';
import { mockPredictionEngine, PredictionAccuracy } from './predictionEngine';

/**
 * 피드백 분석 결과
 */
export interface FeedbackAnalysis {
  totalFeedbacks: number;
  averageRating: number;
  accuracyByLevel: { [level in CongestionLevel]: number };
  commonIssues: string[];
  improvementSuggestions: string[];
  userSatisfaction: number; // 0-1
}

/**
 * 모델 개선 제안
 */
export interface ModelImprovement {
  type: 'accuracy' | 'bias' | 'timing' | 'weather' | 'event';
  description: string;
  priority: 'low' | 'medium' | 'high';
  expectedImprovement: number; // 예상 개선율 (%)
  implementationComplexity: 'easy' | 'medium' | 'hard';
}

/**
 * 피드백 통합 서비스
 * 사용자 피드백을 분석하여 예측 모델을 개선합니다.
 */
export class FeedbackIntegrationService {
  private readonly feedbackWeights = {
    rating_5: 1.0,
    rating_4: 0.8,
    rating_3: 0.6,
    rating_2: 0.4,
    rating_1: 0.2
  };

  private readonly biasThreshold = 0.15; // 15% 이상 편향 시 조정
  private modelAdjustments: Map<string, number> = new Map(); // 노선별 조정값

  /**
   * 피드백 데이터 생성 (시뮬레이션용)
   */
  generateMockFeedback(
    userId: string, 
    routeId: string, 
    predictedLevel: CongestionLevel, 
    actualLevel: CongestionLevel
  ): FeedbackData {
    // 예측 정확도에 따른 평점 계산
    const rating = this.calculateRatingFromAccuracy(predictedLevel, actualLevel);
    
    // 코멘트 생성
    const comment = this.generateFeedbackComment(predictedLevel, actualLevel, rating);

    const feedbackInput: Omit<FeedbackData, 'id'> = {
      userId,
      routeId,
      timestamp: getCurrentTimestamp(),
      predictedCongestion: predictedLevel,
      actualCongestion: actualLevel,
      rating,
      ...(comment !== undefined && { comment }),
      verified: Math.random() > 0.1 // 90% 검증됨
    };

    // 데이터 저장소에 저장
    const savedFeedback = dataStore.createFeedback(feedbackInput);
    if (!savedFeedback) {
      throw new Error('Failed to create feedback');
    }
    
    return savedFeedback;
  }

  /**
   * 피드백 분석
   */
  analyzeFeedback(routeId?: string, days: number = 30): FeedbackAnalysis {
    let feedbacks: FeedbackData[];
    
    if (routeId) {
      feedbacks = dataStore.getFeedbackByRoute(routeId);
    } else {
      // 전체 피드백 (실제 구현에서는 getAllFeedback 메서드 필요)
      feedbacks = dataStore.getAllUsers().flatMap(user => 
        dataStore.getFeedbackByUser(user.id)
      );
    }

    // 최근 N일 데이터만 필터링
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    feedbacks = feedbacks.filter(f => new Date(f.timestamp) >= cutoffDate);

    if (feedbacks.length === 0) {
      return {
        totalFeedbacks: 0,
        averageRating: 0,
        accuracyByLevel: { low: 0, medium: 0, high: 0 },
        commonIssues: [],
        improvementSuggestions: [],
        userSatisfaction: 0
      };
    }

    // 기본 통계
    const totalFeedbacks = feedbacks.length;
    const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks;
    const userSatisfaction = averageRating / 5;

    // 혼잡도 레벨별 정확도
    const accuracyByLevel = this.calculateAccuracyByLevel(feedbacks);

    // 공통 이슈 분석
    const commonIssues = this.identifyCommonIssues(feedbacks);

    // 개선 제안
    const improvementSuggestions = this.generateImprovementSuggestions(feedbacks, accuracyByLevel);

    return {
      totalFeedbacks,
      averageRating: Math.round(averageRating * 100) / 100,
      accuracyByLevel,
      commonIssues,
      improvementSuggestions,
      userSatisfaction: Math.round(userSatisfaction * 100) / 100
    };
  }

  /**
   * 모델 개선 제안 생성
   */
  generateModelImprovements(routeId: string): ModelImprovement[] {
    const feedbacks = dataStore.getFeedbackByRoute(routeId);
    const analysis = this.analyzeFeedback(routeId);
    const improvements: ModelImprovement[] = [];

    // 정확도 개선
    if (analysis.averageRating < 3.5) {
      improvements.push({
        type: 'accuracy',
        description: '전반적인 예측 정확도가 낮습니다. 기본 알고리즘 개선이 필요합니다.',
        priority: 'high',
        expectedImprovement: 15,
        implementationComplexity: 'hard'
      });
    }

    // 편향 개선
    const bias = this.detectPredictionBias(feedbacks);
    if (Math.abs(bias) > this.biasThreshold) {
      improvements.push({
        type: 'bias',
        description: bias > 0 
          ? '예측이 실제보다 높게 나오는 경향이 있습니다.' 
          : '예측이 실제보다 낮게 나오는 경향이 있습니다.',
        priority: 'medium',
        expectedImprovement: 10,
        implementationComplexity: 'easy'
      });
    }

    // 시간대별 정확도 개선
    const timeAccuracy = this.analyzeTimeAccuracy(feedbacks);
    if (timeAccuracy.worstHours.length > 0) {
      improvements.push({
        type: 'timing',
        description: `${timeAccuracy.worstHours.join(', ')}시 예측 정확도가 낮습니다.`,
        priority: 'medium',
        expectedImprovement: 8,
        implementationComplexity: 'medium'
      });
    }

    // 날씨 영향 개선
    if (analysis.commonIssues.includes('날씨 영향 과소평가')) {
      improvements.push({
        type: 'weather',
        description: '날씨가 교통에 미치는 영향을 더 정확히 반영해야 합니다.',
        priority: 'medium',
        expectedImprovement: 12,
        implementationComplexity: 'medium'
      });
    }

    // 이벤트 영향 개선
    if (analysis.commonIssues.includes('특수 상황 대응 부족')) {
      improvements.push({
        type: 'event',
        description: '특수 이벤트나 돌발 상황에 대한 대응이 부족합니다.',
        priority: 'high',
        expectedImprovement: 20,
        implementationComplexity: 'hard'
      });
    }

    return improvements.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 피드백 기반 모델 조정
   */
  adjustModelBasedOnFeedback(routeId: string): void {
    const feedbacks = dataStore.getFeedbackByRoute(routeId);
    if (feedbacks.length < 10) return; // 최소 10개 피드백 필요

    const bias = this.detectPredictionBias(feedbacks);
    
    if (Math.abs(bias) > this.biasThreshold) {
      // 편향 조정값 계산
      const adjustment = -bias * 0.5; // 편향의 50%만큼 반대 방향으로 조정
      this.modelAdjustments.set(routeId, adjustment);
      
      console.log(`📊 Model adjustment for ${routeId}: ${adjustment.toFixed(2)}%`);
    }
  }

  /**
   * 조정된 예측값 반환
   */
  getAdjustedPrediction(routeId: string, originalPrediction: number): number {
    const adjustment = this.modelAdjustments.get(routeId) || 0;
    return Math.max(0, Math.min(100, originalPrediction + adjustment));
  }

  /**
   * 피드백 품질 검증
   */
  validateFeedbackQuality(feedback: FeedbackData): {
    isValid: boolean;
    confidence: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let confidence = 1.0;

    // 시간 일관성 검증
    const feedbackTime = new Date(feedback.timestamp);
    const now = new Date();
    const timeDiff = now.getTime() - feedbackTime.getTime();
    
    if (timeDiff > 24 * 60 * 60 * 1000) { // 24시간 이상 지난 피드백
      issues.push('피드백이 너무 늦게 제출됨');
      confidence *= 0.7;
    }

    // 평점과 실제 차이의 일관성 검증
    const levelDifference = this.getLevelDifference(feedback.predictedCongestion, feedback.actualCongestion);
    const expectedRating = this.calculateRatingFromAccuracy(feedback.predictedCongestion, feedback.actualCongestion);
    
    if (Math.abs(feedback.rating - expectedRating) > 2) {
      issues.push('평점과 실제 차이가 일관되지 않음');
      confidence *= 0.8;
    }

    // 사용자 신뢰도 (과거 피드백 기록 기반)
    const userFeedbacks = dataStore.getFeedbackByUser(feedback.userId);
    if (userFeedbacks.length > 5) {
      const userReliability = this.calculateUserReliability(userFeedbacks);
      confidence *= userReliability;
    }

    return {
      isValid: confidence > 0.5,
      confidence: Math.round(confidence * 100) / 100,
      issues
    };
  }

  /**
   * 월간 피드백 리포트 생성
   */
  generateMonthlyReport(routeId?: string): {
    summary: FeedbackAnalysis;
    trends: {
      ratingTrend: number[]; // 주간별 평점 추이
      accuracyTrend: number[]; // 주간별 정확도 추이
      volumeTrend: number[]; // 주간별 피드백 수
    };
    improvements: ModelImprovement[];
    recommendations: string[];
  } {
    const summary = this.analyzeFeedback(routeId, 30);
    const improvements = routeId ? this.generateModelImprovements(routeId) : [];
    
    // 주간별 트렌드 계산 (4주)
    const trends = this.calculateTrends(routeId, 4);
    
    // 권장사항 생성
    const recommendations = this.generateRecommendations(summary, improvements);

    return {
      summary,
      trends,
      improvements,
      recommendations
    };
  }

  // === Private Helper Methods ===

  private calculateRatingFromAccuracy(predicted: CongestionLevel, actual: CongestionLevel): number {
    const levelDiff = this.getLevelDifference(predicted, actual);
    
    switch (levelDiff) {
      case 0: return 5; // 정확한 예측
      case 1: return 4; // 1단계 차이
      case 2: return 2; // 2단계 차이 (low <-> high)
      default: return 3; // 기본값
    }
  }

  private getLevelDifference(level1: CongestionLevel, level2: CongestionLevel): number {
    const levels = { low: 0, medium: 1, high: 2 };
    return Math.abs(levels[level1] - levels[level2]);
  }

  private generateFeedbackComment(
    predicted: CongestionLevel, 
    actual: CongestionLevel, 
    rating: number
  ): string | undefined {
    const comments = {
      accurate: [
        '예측이 정확했습니다',
        '실제 상황과 일치했어요',
        '도움이 되었습니다',
        '믿을 만한 정보였습니다'
      ],
      overestimated: [
        '예측보다 덜 혼잡했습니다',
        '생각보다 여유로웠어요',
        '예측이 과도했습니다',
        '실제로는 괜찮았습니다'
      ],
      underestimated: [
        '예측보다 더 혼잡했습니다',
        '생각보다 붐볐어요',
        '예측이 부족했습니다',
        '실제로는 매우 혼잡했습니다'
      ],
      poor: [
        '예측이 부정확했습니다',
        '실제와 많이 달랐어요',
        '개선이 필요합니다',
        '신뢰하기 어려웠습니다'
      ]
    };

    if (rating >= 4) {
      return comments.accurate[Math.floor(Math.random() * comments.accurate.length)];
    } else if (rating <= 2) {
      return comments.poor[Math.floor(Math.random() * comments.poor.length)];
    } else {
      const levels = { low: 0, medium: 1, high: 2 };
      if (levels[predicted] > levels[actual]) {
        return comments.overestimated[Math.floor(Math.random() * comments.overestimated.length)];
      } else {
        return comments.underestimated[Math.floor(Math.random() * comments.underestimated.length)];
      }
    }
  }

  private calculateAccuracyByLevel(feedbacks: FeedbackData[]): { [level in CongestionLevel]: number } {
    const accuracy = { low: 0, medium: 0, high: 0 };
    const counts = { low: 0, medium: 0, high: 0 };

    feedbacks.forEach(feedback => {
      const level = feedback.predictedCongestion;
      const isAccurate = feedback.predictedCongestion === feedback.actualCongestion;
      
      counts[level]++;
      if (isAccurate) {
        accuracy[level]++;
      }
    });

    // 정확도 비율 계산
    Object.keys(accuracy).forEach(level => {
      const l = level as CongestionLevel;
      accuracy[l] = counts[l] > 0 ? accuracy[l] / counts[l] : 0;
      accuracy[l] = Math.round(accuracy[l] * 100) / 100;
    });

    return accuracy;
  }

  private identifyCommonIssues(feedbacks: FeedbackData[]): string[] {
    const issues: string[] = [];
    const lowRatingFeedbacks = feedbacks.filter(f => f.rating <= 2);
    
    if (lowRatingFeedbacks.length > feedbacks.length * 0.3) {
      issues.push('전반적인 예측 정확도 부족');
    }

    // 편향 분석
    const bias = this.detectPredictionBias(feedbacks);
    if (bias > this.biasThreshold) {
      issues.push('과대 예측 경향');
    } else if (bias < -this.biasThreshold) {
      issues.push('과소 예측 경향');
    }

    // 코멘트 분석 (키워드 기반)
    const comments = feedbacks
      .map(f => f.comment || '')
      .filter(comment => comment.length > 0)
      .join(' ')
      .toLowerCase();
    
    if (comments.includes('날씨') || comments.includes('비') || comments.includes('눈')) {
      issues.push('날씨 영향 과소평가');
    }
    
    if (comments.includes('이벤트') || comments.includes('행사') || comments.includes('사고')) {
      issues.push('특수 상황 대응 부족');
    }
    
    if (comments.includes('시간') || comments.includes('지연')) {
      issues.push('시간대별 예측 부정확');
    }

    return issues;
  }

  private generateImprovementSuggestions(
    feedbacks: FeedbackData[], 
    accuracyByLevel: { [level in CongestionLevel]: number }
  ): string[] {
    const suggestions: string[] = [];

    // 레벨별 정확도 기반 제안
    Object.entries(accuracyByLevel).forEach(([level, accuracy]) => {
      if (accuracy < 0.7) {
        suggestions.push(`${level} 혼잡도 예측 알고리즘 개선 필요`);
      }
    });

    // 전체 만족도 기반 제안
    const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
    if (avgRating < 3.5) {
      suggestions.push('사용자 인터페이스 및 정보 제공 방식 개선');
      suggestions.push('예측 신뢰도 표시 기능 추가');
    }

    // 피드백 빈도 기반 제안
    if (feedbacks.length < 50) {
      suggestions.push('사용자 피드백 수집 확대 필요');
      suggestions.push('피드백 인센티브 제도 도입 검토');
    }

    return suggestions;
  }

  private detectPredictionBias(feedbacks: FeedbackData[]): number {
    if (feedbacks.length === 0) return 0;

    const levels = { low: 0, medium: 1, high: 2 };
    let totalBias = 0;

    feedbacks.forEach(feedback => {
      const predictedLevel = levels[feedback.predictedCongestion];
      const actualLevel = levels[feedback.actualCongestion];
      totalBias += (predictedLevel - actualLevel);
    });

    return totalBias / feedbacks.length * 50; // 퍼센트로 변환
  }

  private analyzeTimeAccuracy(feedbacks: FeedbackData[]): {
    accuracyByHour: { [hour: number]: number };
    worstHours: number[];
  } {
    const accuracyByHour: { [hour: number]: number } = {};
    const countsByHour: { [hour: number]: number } = {};

    // 시간대별 정확도 계산
    feedbacks.forEach(feedback => {
      const hour = new Date(feedback.timestamp).getHours();
      const isAccurate = feedback.predictedCongestion === feedback.actualCongestion;
      
      if (!accuracyByHour[hour]) {
        accuracyByHour[hour] = 0;
        countsByHour[hour] = 0;
      }
      
      if (countsByHour[hour] !== undefined) {
        countsByHour[hour]++;
      }
      if (isAccurate) {
        accuracyByHour[hour]++;
      }
    });

    // 정확도 비율 계산
    Object.keys(accuracyByHour).forEach(hour => {
      const h = parseInt(hour);
      if (countsByHour[h] && countsByHour[h] > 0) {
        accuracyByHour[h] = (accuracyByHour[h] || 0) / countsByHour[h];
      } else {
        accuracyByHour[h] = 0;
      }
    });

    // 정확도가 낮은 시간대 찾기 (70% 미만)
    const worstHours = Object.entries(accuracyByHour)
      .filter(([_, accuracy]) => typeof accuracy === 'number' && accuracy < 0.7)
      .map(([hour, _]) => parseInt(hour))
      .sort();

    return { accuracyByHour, worstHours };
  }

  private calculateUserReliability(userFeedbacks: FeedbackData[]): number {
    // 사용자의 과거 피드백 일관성 분석
    let reliability = 1.0;
    
    if (userFeedbacks.length === 0) {
      return reliability;
    }
    
    // 극단적인 평점만 주는 사용자는 신뢰도 감소
    const ratings = userFeedbacks.map(f => f.rating);
    const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    const variance = ratings.reduce((sum, r) => sum + Math.pow(r - avgRating, 2), 0) / ratings.length;
    
    if (variance < 0.5) { // 분산이 너무 낮으면 (항상 같은 점수)
      reliability *= 0.8;
    }

    // 피드백 빈도가 너무 높으면 신뢰도 감소 (스팸 가능성)
    const recentFeedbacks = userFeedbacks.filter(f => 
      new Date().getTime() - new Date(f.timestamp).getTime() < 24 * 60 * 60 * 1000
    );
    
    if (recentFeedbacks.length > 10) {
      reliability *= 0.7;
    }

    return Math.max(0.3, reliability);
  }

  private calculateTrends(routeId: string | undefined, weeks: number): {
    ratingTrend: number[];
    accuracyTrend: number[];
    volumeTrend: number[];
  } {
    const trends = {
      ratingTrend: [],
      accuracyTrend: [],
      volumeTrend: []
    };

    for (let week = weeks - 1; week >= 0; week--) {
      const startDate = new Date(Date.now() - (week + 1) * 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() - week * 7 * 24 * 60 * 60 * 1000);
      
      let weekFeedbacks: FeedbackData[];
      if (routeId) {
        weekFeedbacks = dataStore.getFeedbackByRoute(routeId);
      } else {
        weekFeedbacks = dataStore.getAllUsers().flatMap(user => 
          dataStore.getFeedbackByUser(user.id)
        );
      }
      
      weekFeedbacks = weekFeedbacks.filter(f => {
        if (!f || !f.timestamp) return false;
        const feedbackDate = new Date(f.timestamp);
        return feedbackDate >= startDate && feedbackDate < endDate;
      });

      // 주간 평균 평점
      const avgRating = weekFeedbacks.length > 0 
        ? weekFeedbacks.reduce((sum, f) => sum + f.rating, 0) / weekFeedbacks.length 
        : 0;
      (trends.ratingTrend as number[]).push(Math.round(avgRating * 100) / 100);

      // 주간 정확도
      const accurateCount = weekFeedbacks.filter(f => 
        f.predictedCongestion === f.actualCongestion
      ).length;
      const accuracy = weekFeedbacks.length > 0 ? accurateCount / weekFeedbacks.length : 0;
      (trends.accuracyTrend as number[]).push(Math.round(accuracy * 100) / 100);

      // 주간 피드백 수
      (trends.volumeTrend as number[]).push(weekFeedbacks.length);
    }

    return trends;
  }

  private generateRecommendations(
    summary: FeedbackAnalysis, 
    improvements: ModelImprovement[]
  ): string[] {
    const recommendations: string[] = [];

    if (summary.averageRating < 3.0) {
      recommendations.push('긴급: 예측 모델 전면 재검토 필요');
    } else if (summary.averageRating < 3.5) {
      recommendations.push('예측 정확도 개선을 위한 알고리즘 조정 권장');
    }

    if (summary.totalFeedbacks < 100) {
      recommendations.push('피드백 수집 확대를 위한 사용자 참여 유도 방안 필요');
    }

    if (improvements.some(i => i.priority === 'high')) {
      recommendations.push('고우선순위 개선사항에 대한 즉시 대응 필요');
    }

    if (summary.userSatisfaction > 0.8) {
      recommendations.push('현재 서비스 품질 유지 및 추가 기능 개발 검토');
    }

    return recommendations;
  }
}

// 싱글톤 인스턴스 생성
export const feedbackIntegration = new FeedbackIntegrationService();