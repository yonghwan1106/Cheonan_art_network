import {
  Company,
  MatchingCriteria,
  PowerPlant,
  PredictionData,
  MatchResult
} from '../types';
import { calculatePrice, calculateSavings } from '../utils/mockDataGenerator';

export const mockMatchingService = {
  findMatches: (
    _company: Company,
    criteria: MatchingCriteria,
    powerPlants: PowerPlant[],
    predictions: PredictionData[]
  ): MatchResult[] => {
    const matches: MatchResult[] = [];
    
    powerPlants.forEach(plant => {
      const plantPredictions = predictions.find(p => p.plantId === plant.id);
      
      if (!plantPredictions) return;
      
      const cleanPeriods = plantPredictions.hourlyPredictions.filter(p => p.isCleanPeriod);
      
      if (cleanPeriods.length > 0) {
        const avgIntensity = cleanPeriods.reduce((sum, p) => sum + p.carbonIntensity, 0) / cleanPeriods.length;
        const pricePerTon = calculatePrice(avgIntensity, plant.type);
        
        if (pricePerTon <= criteria.maxPricePerTon) {
          const maxOffset = Math.min(criteria.targetOffset, plant.capacity * 0.1);
          
          matches.push({
            id: `match_${plant.id}_${Date.now()}`,
            plantId: plant.id,
            plantName: plant.name,
            timeSlots: cleanPeriods.map(p => `${String(p.hour).padStart(2, '0')}:00-${String(p.hour + 1).padStart(2, '0')}:00`),
            offsetAmount: maxOffset,
            pricePerTon,
            carbonIntensity: Math.round(avgIntensity * 1000) / 1000,
            confidence: cleanPeriods.reduce((sum, p) => sum + p.confidence, 0) / cleanPeriods.length,
            estimatedSavings: calculateSavings(avgIntensity)
          });
        }
      }
    });
    
    // 가격순으로 정렬하여 반환
    return matches.sort((a, b) => a.pricePerTon - b.pricePerTon);
  },

  executeContract: async (_matchResult: MatchResult, _company: Company): Promise<{ success: boolean; contractId?: string; error?: string }> => {
    // 계약 실행 시뮬레이션 (2초 지연)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 90% 확률로 성공
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        success: true,
        contractId: `contract_${Date.now()}`
      };
    } else {
      return {
        success: false,
        error: '계약 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      };
    }
  }
};