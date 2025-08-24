import { 
  CongestionData, 
  PredictionData, 
  PredictionItem, 
  CongestionLevel 
} from '../types';
import { generateId, getCurrentTimestamp, clamp } from '../utils/helpers';
import { dataStore } from './dataStore';
import { feedbackIntegration } from './feedbackIntegration';

/**
 * 정확도 시뮬레이션 결과
 */
export interface AccuracySimulationResult {
  simulationId: string;
  routeId: string;
  timeRange: {
    start: string;
    end: string;
    duration: number; // hours
  };
  metrics: {
    mae: number; // Mean Absolute Error
    rmse: number; // Root Mean Square Error
    mape: number; // Mean Absolute Percentage Error
    accuracy: number; // Classification accuracy (0-1)
    precision: { [level in CongestionLevel]: number };
    recall: { [level in CongestionLevel]: number };
    f1Score: { [level in CongestionLevel]: number };
  };
  confusionMatrix: {
    [predicted in CongestionLevel]: {
      [actual in CongestionLevel]: number;
    };
  };
  timeBasedAccuracy: {
    hourly: { [hour: number]: number };
    daily: { [day: string]: number };
  };
  errorAnalysis: {
    systematicBias: number;
    randomError: number;
    outliers: number;
    errorDistribution: { [range: string]: number };
  };
  recommendations: string[];
}

/**
 * 예측 정확도 시뮬레이션 서비스
 * 실제 데이터와 예측 데이터를 비교하여 모델 성능을 평가합니다.
 */
export class AccuracySimulationService {
  private readonly errorThresholds = {
    excellent: 5,   // 5% 이하 오차
    good: 10,       // 10% 이하 오차
    acceptable: 20, // 20% 이하 오차
    poor: 30       // 30% 이하 오차
  };

  /**
   * 예측 정확도 시뮬레이션 실행
   */
  async runAccuracySimulation(
    routeId: string, 
    hours: number = 24
  ): Promise<AccuracySimulationResult> {
    const simulationId = generateId('accuracy-sim');
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

    // 실제 데이터와 예측 데이터 수집
    const actualData = this.getActualData(routeId, startTime, endTime);
    const predictions = this.getPredictionData(routeId, startTime, endTime);

    // 데이터 매칭 및 정확도 계산
    const matchedData = this.matchPredictionsWithActual(predictions, actualData);
    
    if (matchedData.length === 0) {
      throw new Error('No matching data found for accuracy simulation');
    }

    // 메트릭 계산
    const metrics = this.calculateMetrics(matchedData);
    const confusionMatrix = this.buildConfusionMatrix(matchedData);
    const timeBasedAccuracy = this.calculateTimeBasedAccuracy(matchedData);
    const errorAnalysis = this.analyzeErrors(matchedData);
    const recommendations = this.generateRecommendations(metrics, errorAnalysis);

    const result: AccuracySimulationResult = {
      simulationId,
      routeId,
      timeRange: {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        duration: hours
      },
      metrics,
      confusionMatrix,
      timeBasedAccuracy,
      errorAnalysis,
      recommendations
    };

    // 결과 로깅
    console.log(`📊 Accuracy simulation completed for ${routeId}:`);
    console.log(`   - MAE: ${metrics.mae.toFixed(2)}%`);
    console.log(`   - Accuracy: ${(metrics.accuracy * 100).toFixed(1)}%`);
    console.log(`   - Samples: ${matchedData.length}`);

    return result;
  }

  /**
   * 다중 노선 정확도 비교
   */
  async compareRouteAccuracy(routeIds: string[], hours: number = 24): Promise<{
    comparison: { [routeId: string]: AccuracySimulationResult };
    ranking: { routeId: string; accuracy: number; mae: number }[];
    insights: string[];
  }> {
    const comparison: { [routeId: string]: AccuracySimulationResult } = {};
    
    // 각 노선별 시뮬레이션 실행
    for (const routeId of routeIds) {
      try {
        comparison[routeId] = await this.runAccuracySimulation(routeId, hours);
      } catch (error) {
        console.warn(`Failed to simulate accuracy for ${routeId}:`, error);
      }
    }

    // 순위 계산
    const ranking = Object.entries(comparison)
      .map(([routeId, result]) => ({
        routeId,
        accuracy: result.metrics.accuracy,
        mae: result.metrics.mae
      }))
      .sort((a, b) => b.accuracy - a.accuracy);

    // 인사이트 생성
    const insights = this.generateComparisonInsights(comparison, ranking);

    return { comparison, ranking, insights };
  }

  /**
   * 실시간 정확도 모니터링
   */
  startAccuracyMonitoring(routeIds: string[]): void {
    // 1시간마다 정확도 체크
    setInterval(async () => {
      for (const routeId of routeIds) {
        try {
          const result = await this.runAccuracySimulation(routeId, 1);
          
          // 정확도가 임계값 이하로 떨어지면 알림
          if (result.metrics.accuracy < 0.7) {
            console.warn(`⚠️ Low accuracy detected for ${routeId}: ${(result.metrics.accuracy * 100).toFixed(1)}%`);
            
            // 자동 피드백 생성 (시뮬레이션용)
            this.generateAutoFeedback(routeId, result);
          }
        } catch (error) {
          console.error(`Failed to monitor accuracy for ${routeId}:`, error);
        }
      }
    }, 60 * 60 * 1000); // 1시간

    console.log(`📈 Started accuracy monitoring for ${routeIds.length} routes`);
  }

  /**
   * 정확도 개선 시뮬레이션
   */
  async simulateAccuracyImprovement(
    routeId: string, 
    improvementScenarios: {
      name: string;
      biasReduction: number; // 편향 감소율 (0-1)
      noiseReduction: number; // 노이즈 감소율 (0-1)
      dataQualityImprovement: number; // 데이터 품질 개선율 (0-1)
    }[]
  ): Promise<{
    baseline: AccuracySimulationResult;
    scenarios: { [scenarioName: string]: AccuracySimulationResult };
    bestScenario: string;
    expectedImprovement: number;
  }> {
    // 기준선 정확도 측정
    const baseline = await this.runAccuracySimulation(routeId, 24);
    const scenarios: { [scenarioName: string]: AccuracySimulationResult } = {};

    // 각 시나리오별 개선 효과 시뮬레이션
    for (const scenario of improvementScenarios) {
      const improvedResult = this.applyImprovementScenario(baseline, scenario);
      scenarios[scenario.name] = improvedResult;
    }

    // 최고 시나리오 선택
    const scenarioEntries = Object.entries(scenarios);
    if (scenarioEntries.length === 0) {
      throw new Error('No improvement scenarios provided');
    }

    const firstEntry = scenarioEntries[0];
    if (!firstEntry) {
      throw new Error('No scenario entries found');
    }
    
    const bestScenario = scenarioEntries
      .reduce((best, [name, result]) => {
        const bestResult = scenarios[best];
        if (!bestResult) return name;
        return result.metrics.accuracy > bestResult.metrics.accuracy ? name : best;
      }, firstEntry[0]);

    const bestScenarioResult = scenarios[bestScenario];
    if (!bestScenarioResult) {
      throw new Error(`Best scenario result not found: ${bestScenario}`);
    }

    const expectedImprovement = bestScenarioResult.metrics.accuracy - baseline.metrics.accuracy;

    return {
      baseline,
      scenarios,
      bestScenario,
      expectedImprovement
    };
  }

  // === Private Helper Methods ===

  private getActualData(routeId: string, startTime: Date, endTime: Date): CongestionData[] {
    const allData = dataStore.getCongestionDataByRoute(routeId);
    return allData.filter(data => {
      const dataTime = new Date(data.timestamp);
      return dataTime >= startTime && dataTime <= endTime;
    });
  }

  private getPredictionData(routeId: string, startTime: Date, endTime: Date): PredictionItem[] {
    const predictions = dataStore.getPredictionsByRoute(routeId);
    const allPredictions: PredictionItem[] = [];

    predictions.forEach(pred => {
      pred.predictions.forEach(item => {
        const predTime = new Date(item.time);
        if (predTime >= startTime && predTime <= endTime) {
          allPredictions.push(item);
        }
      });
    });

    return allPredictions;
  }

  private matchPredictionsWithActual(
    predictions: PredictionItem[], 
    actualData: CongestionData[]
  ): Array<{
    prediction: PredictionItem;
    actual: CongestionData;
    error: number;
    absoluteError: number;
    levelMatch: boolean;
  }> {
    const matched: Array<{
      prediction: PredictionItem;
      actual: CongestionData;
      error: number;
      absoluteError: number;
      levelMatch: boolean;
    }> = [];

    predictions.forEach(pred => {
      // 가장 가까운 시간의 실제 데이터 찾기
      const predTime = new Date(pred.time);
      let closestActual: CongestionData | null = null;
      let minTimeDiff = Infinity;

      actualData.forEach(actual => {
        const actualTime = new Date(actual.timestamp);
        const timeDiff = Math.abs(predTime.getTime() - actualTime.getTime());
        
        if (timeDiff < minTimeDiff && timeDiff < 15 * 60 * 1000) { // 15분 이내
          minTimeDiff = timeDiff;
          closestActual = actual;
        }
      });

      if (closestActual && 
          typeof pred.congestionPercentage === 'number' && 
          typeof (closestActual as any).congestionPercentage === 'number' &&
          (pred as any).congestionLevel && (closestActual as any).congestionLevel) {
        const predPercentage = pred.congestionPercentage as number;
        const actualPercentage = (closestActual as any).congestionPercentage as number;
        const error = predPercentage - actualPercentage;
        const absoluteError = Math.abs(error);
        const levelMatch = (pred as any).congestionLevel === (closestActual as any).congestionLevel;

        matched.push({
          prediction: pred,
          actual: closestActual,
          error,
          absoluteError,
          levelMatch
        });
      }
    });

    return matched;
  }

  private calculateMetrics(matchedData: Array<{
    prediction: PredictionItem;
    actual: CongestionData;
    error: number;
    absoluteError: number;
    levelMatch: boolean;
  }>): AccuracySimulationResult['metrics'] {
    if (matchedData.length === 0) {
      return {
        mae: 0, rmse: 0, mape: 0, accuracy: 0,
        precision: { low: 0, medium: 0, high: 0 },
        recall: { low: 0, medium: 0, high: 0 },
        f1Score: { low: 0, medium: 0, high: 0 }
      };
    }

    // 기본 메트릭 계산
    const mae = matchedData.reduce((sum, d) => sum + d.absoluteError, 0) / matchedData.length;
    const rmse = Math.sqrt(
      matchedData.reduce((sum, d) => sum + d.error * d.error, 0) / matchedData.length
    );
    
    const mape = matchedData.reduce((sum, d) => {
      if (d.actual.congestionPercentage > 0) {
        return sum + (d.absoluteError / d.actual.congestionPercentage) * 100;
      }
      return sum;
    }, 0) / (matchedData.length || 1);

    const accuracy = matchedData.filter(d => d.levelMatch).length / matchedData.length;

    // 레벨별 정밀도, 재현율, F1 점수 계산
    const levels: CongestionLevel[] = ['low', 'medium', 'high'];
    const precision: { [level in CongestionLevel]: number } = { low: 0, medium: 0, high: 0 };
    const recall: { [level in CongestionLevel]: number } = { low: 0, medium: 0, high: 0 };
    const f1Score: { [level in CongestionLevel]: number } = { low: 0, medium: 0, high: 0 };

    levels.forEach(level => {
      const truePositive = matchedData.filter(d => 
        d.prediction.congestionLevel === level && d.actual.congestionLevel === level
      ).length;
      
      const falsePositive = matchedData.filter(d => 
        d.prediction.congestionLevel === level && d.actual.congestionLevel !== level
      ).length;
      
      const falseNegative = matchedData.filter(d => 
        d.prediction.congestionLevel !== level && d.actual.congestionLevel === level
      ).length;

      precision[level] = truePositive + falsePositive > 0 
        ? truePositive / (truePositive + falsePositive) 
        : 0;
      
      recall[level] = truePositive + falseNegative > 0 
        ? truePositive / (truePositive + falseNegative) 
        : 0;
      
      f1Score[level] = precision[level] + recall[level] > 0 
        ? 2 * (precision[level] * recall[level]) / (precision[level] + recall[level]) 
        : 0;
    });

    return {
      mae: Math.round(mae * 100) / 100,
      rmse: Math.round(rmse * 100) / 100,
      mape: Math.round(mape * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100,
      precision,
      recall,
      f1Score
    };
  }

  private buildConfusionMatrix(matchedData: Array<{
    prediction: PredictionItem;
    actual: CongestionData;
    error: number;
    absoluteError: number;
    levelMatch: boolean;
  }>): AccuracySimulationResult['confusionMatrix'] {
    const matrix: AccuracySimulationResult['confusionMatrix'] = {
      low: { low: 0, medium: 0, high: 0 },
      medium: { low: 0, medium: 0, high: 0 },
      high: { low: 0, medium: 0, high: 0 }
    };

    matchedData.forEach(d => {
      const predLevel = d.prediction.congestionLevel;
      const actualLevel = d.actual.congestionLevel;
      if (predLevel && actualLevel) {
        matrix[predLevel][actualLevel]++;
      }
    });

    return matrix;
  }

  private calculateTimeBasedAccuracy(matchedData: Array<{
    prediction: PredictionItem;
    actual: CongestionData;
    error: number;
    absoluteError: number;
    levelMatch: boolean;
  }>): AccuracySimulationResult['timeBasedAccuracy'] {
    const hourly: { [hour: number]: number } = {};
    const daily: { [day: string]: number } = {};
    const hourlyCounts: { [hour: number]: number } = {};
    const dailyCounts: { [day: string]: number } = {};

    matchedData.forEach(d => {
      const time = new Date(d.prediction.time);
      const hour = time.getHours();
      const day = time.toISOString().split('T')[0];

      // 시간별 정확도
      if (hour !== undefined && hourly[hour] === undefined) {
        hourly[hour] = 0;
        hourlyCounts[hour] = 0;
      }
      if (hour !== undefined) {
        if (hourlyCounts[hour] !== undefined) hourlyCounts[hour]++;
        if (d.levelMatch && hourly[hour] !== undefined) hourly[hour]++;
      }

      // 일별 정확도
      if (day && daily[day] === undefined) {
        daily[day] = 0;
        dailyCounts[day] = 0;
      }
      if (day) {
        if (dailyCounts[day] !== undefined) dailyCounts[day]++;
        if (d.levelMatch && daily[day] !== undefined) daily[day]++;
      }
    });

    // 비율로 변환
    Object.keys(hourly).forEach(hour => {
      const h = parseInt(hour);
      const count = hourlyCounts[h];
      if (count && count > 0 && hourly[h] !== undefined) {
        hourly[h] = hourly[h] / count;
      }
    });

    Object.keys(daily).forEach(day => {
      const count = dailyCounts[day];
      if (count && count > 0 && daily[day] !== undefined) {
        daily[day] = daily[day] / count;
      }
    });

    return { hourly, daily };
  }

  private analyzeErrors(matchedData: Array<{
    prediction: PredictionItem;
    actual: CongestionData;
    error: number;
    absoluteError: number;
    levelMatch: boolean;
  }>): AccuracySimulationResult['errorAnalysis'] {
    const errors = matchedData.map(d => d.error);
    const absoluteErrors = matchedData.map(d => d.absoluteError);

    // 체계적 편향 (평균 오차)
    const systematicBias = errors.length > 0 ? errors.reduce((sum, e) => sum + e, 0) / errors.length : 0;

    // 랜덤 오차 (표준편차)
    const mean = systematicBias;
    const variance = errors.length > 0 ? errors.reduce((sum, e) => sum + Math.pow(e - mean, 2), 0) / errors.length : 0;
    const randomError = Math.sqrt(variance);

    // 이상치 (절대 오차가 30% 이상)
    const outliers = absoluteErrors.filter(e => e > 30).length;

    // 오차 분포
    const errorDistribution = {
      '0-5%': absoluteErrors.filter(e => e <= 5).length,
      '5-10%': absoluteErrors.filter(e => e > 5 && e <= 10).length,
      '10-20%': absoluteErrors.filter(e => e > 10 && e <= 20).length,
      '20-30%': absoluteErrors.filter(e => e > 20 && e <= 30).length,
      '30%+': absoluteErrors.filter(e => e > 30).length
    };

    return {
      systematicBias: Math.round(systematicBias * 100) / 100,
      randomError: Math.round(randomError * 100) / 100,
      outliers,
      errorDistribution
    };
  }

  private generateRecommendations(
    metrics: AccuracySimulationResult['metrics'],
    errorAnalysis: AccuracySimulationResult['errorAnalysis']
  ): string[] {
    const recommendations: string[] = [];

    // 전체 정확도 기반 권장사항
    if (metrics.accuracy < 0.6) {
      recommendations.push('긴급: 예측 모델 전면 재검토 필요 (정확도 60% 미만)');
    } else if (metrics.accuracy < 0.7) {
      recommendations.push('예측 알고리즘 개선 필요 (정확도 70% 미만)');
    } else if (metrics.accuracy > 0.9) {
      recommendations.push('우수한 성능 유지 중 - 현재 모델 지속 사용 권장');
    }

    // MAE 기반 권장사항
    if (metrics.mae > 20) {
      recommendations.push('높은 평균 절대 오차 - 기본 예측 로직 점검 필요');
    } else if (metrics.mae < 5) {
      recommendations.push('매우 낮은 오차율 - 모델 성능 우수');
    }

    // 편향 기반 권장사항
    if (Math.abs(errorAnalysis.systematicBias) > 10) {
      const direction = errorAnalysis.systematicBias > 0 ? '과대' : '과소';
      recommendations.push(`체계적 ${direction} 예측 편향 감지 - 보정 알고리즘 적용 필요`);
    }

    // 이상치 기반 권장사항
    if (errorAnalysis.outliers > 0) {
      recommendations.push(`${errorAnalysis.outliers}개 이상치 감지 - 특수 상황 대응 로직 강화 필요`);
    }

    // 레벨별 성능 기반 권장사항
    Object.entries(metrics.precision).forEach(([level, precision]) => {
      if (precision < 0.6) {
        recommendations.push(`${level} 혼잡도 예측 정밀도 개선 필요 (${(precision * 100).toFixed(1)}%)`);
      }
    });

    return recommendations;
  }

  private generateComparisonInsights(
    comparison: { [routeId: string]: AccuracySimulationResult },
    ranking: { routeId: string; accuracy: number; mae: number }[]
  ): string[] {
    const insights: string[] = [];

    if (ranking.length === 0) return insights;

    const best = ranking[0];
    const worst = ranking[ranking.length - 1];
    
    if (!best || !worst) {
      insights.push('랭킹 데이터를 분석할 수 없습니다.');
      return insights;
    }
    
    const avgAccuracy = ranking.reduce((sum, r) => sum + r.accuracy, 0) / ranking.length;

    insights.push(`최고 성능: ${best.routeId} (정확도 ${(best.accuracy * 100).toFixed(1)}%)`);
    insights.push(`최저 성능: ${worst.routeId} (정확도 ${(worst.accuracy * 100).toFixed(1)}%)`);
    insights.push(`평균 정확도: ${(avgAccuracy * 100).toFixed(1)}%`);

    // 성능 격차 분석
    const performanceGap = best.accuracy - worst.accuracy;
    if (performanceGap > 0.2) {
      insights.push('노선 간 성능 격차가 큼 - 개별 노선 특성 반영 필요');
    }

    // 우수/부진 노선 그룹 분석
    const excellentRoutes = ranking.filter(r => r.accuracy > 0.8).length;
    const poorRoutes = ranking.filter(r => r.accuracy < 0.6).length;

    if (excellentRoutes > 0) {
      insights.push(`${excellentRoutes}개 노선이 우수한 성능 (80% 이상)`);
    }
    if (poorRoutes > 0) {
      insights.push(`${poorRoutes}개 노선이 개선 필요 (60% 미만)`);
    }

    return insights;
  }

  private generateAutoFeedback(routeId: string, result: AccuracySimulationResult): void {
    // 시뮬레이션 결과를 바탕으로 자동 피드백 생성
    const mockUserId = 'system-monitor';
    
    // 정확도가 낮은 경우의 가상 피드백
    if (result.metrics.accuracy < 0.7) {
      const predictedLevel: CongestionLevel = 'medium'; // 예시
      const actualLevel: CongestionLevel = 'high'; // 예시
      
      feedbackIntegration.generateMockFeedback(
        mockUserId,
        routeId,
        predictedLevel,
        actualLevel
      );
    }
  }

  private applyImprovementScenario(
    baseline: AccuracySimulationResult,
    scenario: {
      name: string;
      biasReduction: number;
      noiseReduction: number;
      dataQualityImprovement: number;
    }
  ): AccuracySimulationResult {
    // 개선 시나리오 적용 (시뮬레이션)
    const improved = JSON.parse(JSON.stringify(baseline)) as AccuracySimulationResult;
    
    // 편향 감소 적용
    improved.errorAnalysis.systematicBias *= (1 - scenario.biasReduction);
    
    // 노이즈 감소 적용
    improved.errorAnalysis.randomError *= (1 - scenario.noiseReduction);
    
    // 데이터 품질 개선 적용
    const qualityMultiplier = 1 + scenario.dataQualityImprovement;
    improved.metrics.accuracy = Math.min(0.95, improved.metrics.accuracy * qualityMultiplier);
    improved.metrics.mae *= (1 - scenario.dataQualityImprovement * 0.5);
    improved.metrics.rmse *= (1 - scenario.dataQualityImprovement * 0.5);
    
    return improved;
  }
}

// 싱글톤 인스턴스 생성
export const accuracySimulation = new AccuracySimulationService();