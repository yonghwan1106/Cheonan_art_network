import { dataStore } from './dataStore';
import { FeedbackData, User, CongestionLevel } from '../types';

/**
 * 피드백 및 인센티브 시스템
 * 사용자 피드백 수집, 포인트 적립, 인센티브 계산을 담당
 */
export class FeedbackIncentiveSystem {
  private readonly POINT_RULES = {
    FEEDBACK_SUBMISSION: 10,
    ACCURATE_FEEDBACK: 20,
    CONGESTION_AVOIDANCE: 15,
    OFF_PEAK_USAGE: 25,
    ROUTE_SHARING: 30,
    MONTHLY_ACTIVE: 100,
    STREAK_BONUS: 50
  };

  /**
   * 혼잡도 피드백 제출
   */
  submitCongestionFeedback(
    userId: string,
    routeId: string,
    predictedCongestion: CongestionLevel,
    actualCongestion: CongestionLevel,
    rating: number,
    comment?: string
  ): FeedbackSubmissionResult {
    const user = dataStore.getUserById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // 피드백 데이터 생성
    const feedbackData: Omit<FeedbackData, 'id'> = {
      userId,
      routeId,
      timestamp: new Date().toISOString(),
      predictedCongestion,
      actualCongestion,
      rating: Math.max(1, Math.min(5, rating)),
      comment,
      verified: false
    };

    // 피드백 저장
    const savedFeedback = dataStore.createFeedback(feedbackData);

    // 포인트 계산 및 적립
    const pointsEarned = this.calculateFeedbackPoints(
      predictedCongestion,
      actualCongestion,
      rating
    );

    this.awardPoints(userId, pointsEarned, 'feedback_submission');

    // 피드백 정확도 검증 (시뮬레이션)
    const isAccurate = this.verifyFeedbackAccuracy(predictedCongestion, actualCongestion);
    if (isAccurate) {
      const accuracyBonus = this.POINT_RULES.ACCURATE_FEEDBACK;
      this.awardPoints(userId, accuracyBonus, 'accurate_feedback');
      
      // 피드백을 검증됨으로 표시
      dataStore.updateFeedback(savedFeedback.id, { verified: true });
    }

    return {
      feedbackId: savedFeedback.id,
      pointsEarned: pointsEarned + (isAccurate ? this.POINT_RULES.ACCURATE_FEEDBACK : 0),
      isAccurate,
      message: this.generateFeedbackMessage(pointsEarned, isAccurate)
    };
  }

  /**
   * 사용자 행동 기반 인센티브 계산
   */
  calculateBehaviorIncentive(userId: string, actionType: IncentiveActionType): IncentiveResult {
    const user = dataStore.getUserById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    let points = 0;
    let reason = '';

    switch (actionType) {
      case 'congestion_avoidance':
        points = this.POINT_RULES.CONGESTION_AVOIDANCE;
        reason = '혼잡 시간대 회피';
        break;
      case 'off_peak_usage':
        points = this.POINT_RULES.OFF_PEAK_USAGE;
        reason = '비혼잡 시간대 이용';
        break;
      case 'route_sharing':
        points = this.POINT_RULES.ROUTE_SHARING;
        reason = '경로 정보 공유';
        break;
      case 'monthly_active':
        points = this.POINT_RULES.MONTHLY_ACTIVE;
        reason = '월간 활성 사용자';
        break;
      case 'streak_bonus':
        points = this.POINT_RULES.STREAK_BONUS;
        reason = '연속 사용 보너스';
        break;
      default:
        points = 0;
        reason = '알 수 없는 행동';
    }

    // 사용자 레벨에 따른 보너스 적용
    const levelMultiplier = this.getUserLevelMultiplier(user.points);
    const finalPoints = Math.floor(points * levelMultiplier);

    this.awardPoints(userId, finalPoints, actionType);

    return {
      points: finalPoints,
      reason,
      levelMultiplier,
      totalPoints: user.points + finalPoints
    };
  }

  /**
   * 포인트 적립
   */
  private awardPoints(userId: string, points: number, reason: string): void {
    const user = dataStore.getUserById(userId);
    if (!user) return;

    const updatedUser = dataStore.updateUser(userId, {
      points: user.points + points,
      updatedAt: new Date().toISOString()
    });

    // 포인트 히스토리 기록 (실제로는 별도 테이블에 저장)
    console.log(`Points awarded: ${points} to user ${userId} for ${reason}`);
  }

  /**
   * 피드백 포인트 계산
   */
  private calculateFeedbackPoints(
    predicted: CongestionLevel,
    actual: CongestionLevel,
    rating: number
  ): number {
    let basePoints = this.POINT_RULES.FEEDBACK_SUBMISSION;

    // 평점에 따른 보너스
    if (rating >= 4) {
      basePoints += 5;
    }

    // 상세한 피드백에 대한 보너스 (실제로는 comment 길이 등을 고려)
    basePoints += 5;

    return basePoints;
  }

  /**
   * 피드백 정확도 검증 (시뮬레이션)
   */
  private verifyFeedbackAccuracy(
    predicted: CongestionLevel,
    actual: CongestionLevel
  ): boolean {
    // 정확한 예측인 경우
    if (predicted === actual) {
      return true;
    }

    // 근접한 예측인 경우 (medium과 high, low와 medium)
    const levelOrder = { 'low': 0, 'medium': 1, 'high': 2 };
    const predictedLevel = levelOrder[predicted];
    const actualLevel = levelOrder[actual];

    return Math.abs(predictedLevel - actualLevel) <= 1;
  }

  /**
   * 사용자 레벨 배수 계산
   */
  private getUserLevelMultiplier(totalPoints: number): number {
    if (totalPoints >= 5000) return 1.5;      // 플래티넘
    if (totalPoints >= 2000) return 1.3;      // 골드
    if (totalPoints >= 1000) return 1.2;      // 실버
    if (totalPoints >= 500) return 1.1;       // 브론즈
    return 1.0;                               // 뉴비
  }

  /**
   * 피드백 메시지 생성
   */
  private generateFeedbackMessage(points: number, isAccurate: boolean): string {
    let message = `피드백 제출로 ${points}포인트를 획득했습니다!`;
    
    if (isAccurate) {
      message += ` 정확한 피드백으로 추가 ${this.POINT_RULES.ACCURATE_FEEDBACK}포인트 보너스!`;
    }

    return message;
  }

  /**
   * 사용자 피드백 히스토리 조회
   */
  getUserFeedbackHistory(userId: string, limit: number = 20): FeedbackData[] {
    return dataStore.getFeedbackByUser(userId).slice(0, limit);
  }

  /**
   * 경로별 피드백 통계
   */
  getRouteFeedbackStats(routeId: string): RouteFeedbackStats {
    const feedbacks = dataStore.getFeedbackByRoute(routeId);
    
    if (feedbacks.length === 0) {
      return {
        routeId,
        totalFeedbacks: 0,
        averageRating: 0,
        accuracyRate: 0,
        congestionDistribution: { low: 0, medium: 0, high: 0 }
      };
    }

    const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = totalRating / feedbacks.length;

    const verifiedFeedbacks = feedbacks.filter(f => f.verified);
    const accuracyRate = verifiedFeedbacks.length / feedbacks.length;

    const congestionDistribution = feedbacks.reduce((dist, f) => {
      dist[f.actualCongestion]++;
      return dist;
    }, { low: 0, medium: 0, high: 0 });

    return {
      routeId,
      totalFeedbacks: feedbacks.length,
      averageRating: Math.round(averageRating * 10) / 10,
      accuracyRate: Math.round(accuracyRate * 100) / 100,
      congestionDistribution
    };
  }

  /**
   * 월간 리포트 생성 (시뮬레이션)
   */
  generateMonthlyReport(userId: string): MonthlyReport {
    const user = dataStore.getUserById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const feedbacks = this.getUserFeedbackHistory(userId, 100);
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // 이번 달 피드백 필터링
    const monthlyFeedbacks = feedbacks.filter(f => 
      f.timestamp.startsWith(currentMonth)
    );

    // 통계 계산
    const totalFeedbacks = monthlyFeedbacks.length;
    const verifiedFeedbacks = monthlyFeedbacks.filter(f => f.verified).length;
    const averageRating = totalFeedbacks > 0 
      ? monthlyFeedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks 
      : 0;

    // 포인트 계산 (시뮬레이션)
    const pointsEarned = totalFeedbacks * this.POINT_RULES.FEEDBACK_SUBMISSION + 
                        verifiedFeedbacks * this.POINT_RULES.ACCURATE_FEEDBACK;

    // 레벨 계산
    const userLevel = this.getUserLevel(user.points);

    return {
      userId,
      month: currentMonth,
      totalFeedbacks,
      verifiedFeedbacks,
      averageRating: Math.round(averageRating * 10) / 10,
      pointsEarned,
      totalPoints: user.points,
      userLevel,
      achievements: this.generateAchievements(totalFeedbacks, verifiedFeedbacks),
      recommendations: this.generateRecommendations(totalFeedbacks, averageRating)
    };
  }

  /**
   * 사용자 레벨 계산
   */
  private getUserLevel(totalPoints: number): UserLevel {
    if (totalPoints >= 5000) return { name: '플래티넘', tier: 5 };
    if (totalPoints >= 2000) return { name: '골드', tier: 4 };
    if (totalPoints >= 1000) return { name: '실버', tier: 3 };
    if (totalPoints >= 500) return { name: '브론즈', tier: 2 };
    return { name: '뉴비', tier: 1 };
  }

  /**
   * 성취 목록 생성
   */
  private generateAchievements(totalFeedbacks: number, verifiedFeedbacks: number): Achievement[] {
    const achievements: Achievement[] = [];

    if (totalFeedbacks >= 10) {
      achievements.push({
        id: 'feedback_master',
        name: '피드백 마스터',
        description: '이번 달 10개 이상의 피드백 제출',
        earnedAt: new Date().toISOString()
      });
    }

    if (verifiedFeedbacks >= 5) {
      achievements.push({
        id: 'accuracy_expert',
        name: '정확도 전문가',
        description: '이번 달 5개 이상의 정확한 피드백 제출',
        earnedAt: new Date().toISOString()
      });
    }

    return achievements;
  }

  /**
   * 추천사항 생성
   */
  private generateRecommendations(totalFeedbacks: number, averageRating: number): string[] {
    const recommendations: string[] = [];

    if (totalFeedbacks < 5) {
      recommendations.push('더 많은 피드백을 제출하여 포인트를 획득하세요!');
    }

    if (averageRating < 3) {
      recommendations.push('더 정확한 피드백을 제공하여 시스템 개선에 도움을 주세요.');
    }

    if (recommendations.length === 0) {
      recommendations.push('훌륭한 활동입니다! 계속해서 시스템 개선에 기여해주세요.');
    }

    return recommendations;
  }

  /**
   * 인센티브 랭킹 조회
   */
  getIncentiveLeaderboard(limit: number = 10): LeaderboardEntry[] {
    const users = dataStore.getAllUsers();
    
    return users
      .sort((a, b) => b.points - a.points)
      .slice(0, limit)
      .map((user, index) => ({
        rank: index + 1,
        userId: user.id,
        userName: user.name,
        points: user.points,
        level: this.getUserLevel(user.points)
      }));
  }
}

// 타입 정의
export interface FeedbackSubmissionResult {
  feedbackId: string;
  pointsEarned: number;
  isAccurate: boolean;
  message: string;
}

export interface IncentiveResult {
  points: number;
  reason: string;
  levelMultiplier: number;
  totalPoints: number;
}

export interface RouteFeedbackStats {
  routeId: string;
  totalFeedbacks: number;
  averageRating: number;
  accuracyRate: number;
  congestionDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface MonthlyReport {
  userId: string;
  month: string;
  totalFeedbacks: number;
  verifiedFeedbacks: number;
  averageRating: number;
  pointsEarned: number;
  totalPoints: number;
  userLevel: UserLevel;
  achievements: Achievement[];
  recommendations: string[];
}

export interface UserLevel {
  name: string;
  tier: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  points: number;
  level: UserLevel;
}

export type IncentiveActionType = 
  | 'congestion_avoidance'
  | 'off_peak_usage'
  | 'route_sharing'
  | 'monthly_active'
  | 'streak_bonus';

// 싱글톤 인스턴스 생성
export const feedbackIncentiveSystem = new FeedbackIncentiveSystem();