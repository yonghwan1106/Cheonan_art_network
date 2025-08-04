import dayjs from 'dayjs';
import { HourlyPrediction } from '../types';

export const generateRealTimeData = (plantId: string): HourlyPrediction[] => {
  const now = dayjs();
  const predictions: HourlyPrediction[] = [];
  
  for (let i = 0; i < 24; i++) {
    const hour = now.add(i, 'hour').hour();
    const baseEmission = getBaseEmissionByPlant(plantId);
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 ~ 1.2
    const timeOfDayFactor = getTimeOfDayFactor(hour);
    
    const emission = baseEmission * randomFactor * timeOfDayFactor;
    const carbonIntensity = getCarbonIntensityByPlant(plantId) * randomFactor * timeOfDayFactor;
    
    predictions.push({
      hour,
      emission: Math.round(emission * 100) / 100,
      carbonIntensity: Math.round(carbonIntensity * 1000) / 1000,
      confidence: 0.85 + Math.random() * 0.15,
      isCleanPeriod: randomFactor < 0.9 && timeOfDayFactor < 0.8
    });
  }
  
  return predictions;
};

const getTimeOfDayFactor = (hour: number): number => {
  // 새벽 시간대는 낮은 배출, 오후 시간대는 높은 배출
  if (hour >= 2 && hour <= 5) return 0.6;  // 새벽
  if (hour >= 14 && hour <= 17) return 1.2; // 오후 피크
  if (hour >= 20 && hour <= 22) return 1.1; // 저녁 피크
  return 1.0; // 기본
};

const getBaseEmissionByPlant = (plantId: string): number => {
  const emissionMap: { [key: string]: number } = {
    'pp_boryeong_1': 1000,
    'pp_boryeong_2': 950,
    'pp_dangjin_1': 1100,
    'pp_taean_1': 980,
    'pp_seocheon_gas': 400,
    'pp_solar_farm_1': 15
  };
  
  return emissionMap[plantId] || 800;
};

const getCarbonIntensityByPlant = (plantId: string): number => {
  const intensityMap: { [key: string]: number } = {
    'pp_boryeong_1': 0.95,
    'pp_boryeong_2': 0.98,
    'pp_dangjin_1': 0.92,
    'pp_taean_1': 0.94,
    'pp_seocheon_gas': 0.35,
    'pp_solar_farm_1': 0.02
  };
  
  return intensityMap[plantId] || 0.70;
};

export const generateDailyPredictions = (plantId: string, _date: Date): HourlyPrediction[] => {
  const predictions: HourlyPrediction[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    const baseEmission = getBaseEmissionByPlant(plantId);
    const timeOfDayFactor = getTimeOfDayFactor(hour);
    const randomFactor = 0.85 + Math.random() * 0.3;
    
    const emission = baseEmission * randomFactor * timeOfDayFactor;
    const carbonIntensity = getCarbonIntensityByPlant(plantId) * randomFactor * timeOfDayFactor;
    
    predictions.push({
      hour,
      emission: Math.round(emission * 100) / 100,
      carbonIntensity: Math.round(carbonIntensity * 1000) / 1000,
      confidence: 0.85 + Math.random() * 0.15,
      isCleanPeriod: isCleanTime(hour, carbonIntensity)
    });
  }
  
  return predictions;
};

const isCleanTime = (hour: number, carbonIntensity: number): boolean => {
  // 새벽 시간대이거나 탄소집약도가 낮으면 청정시간
  const isLowDemandTime = hour >= 1 && hour <= 6;
  const isLowIntensity = carbonIntensity < 0.7;
  
  return isLowDemandTime || isLowIntensity;
};

export const calculatePrice = (carbonIntensity: number, plantType: string): number => {
  const basePrice = 45000; // 기본 가격 (원/톤)
  const intensityFactor = Math.max(0.5, 1 - carbonIntensity); // 낮은 탄소집약도일수록 저렴
  const typeFactor = getTypeFactor(plantType);
  
  return Math.round(basePrice * intensityFactor * typeFactor);
};

const getTypeFactor = (plantType: string): number => {
  const typeFactors: { [key: string]: number } = {
    'renewable': 0.6,
    'lng': 0.8,
    'coal': 1.0,
    'nuclear': 0.7
  };
  
  return typeFactors[plantType] || 1.0;
};

export const calculateSavings = (carbonIntensity: number): number => {
  const marketPrice = 50000; // 시장 기준가격
  const platformPrice = calculatePrice(carbonIntensity, 'coal');
  
  return Math.max(0, marketPrice - platformPrice);
};