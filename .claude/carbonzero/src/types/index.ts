export interface PowerPlant {
  id: string;
  name: string;
  type: 'coal' | 'lng' | 'renewable' | 'nuclear';
  capacity: number;
  location: string;
  currentOutput: number;
  efficiency: number;
  fuelMix: {
    coal?: number;
    lng?: number;
    ammonia?: number;
    renewable?: number;
  };
  emissionFactor: number;
  status: 'operating' | 'maintenance' | 'stopped';
}

export interface PredictionData {
  plantId: string;
  timestamp: string;
  hourlyPredictions: HourlyPrediction[];
}

export interface HourlyPrediction {
  hour: number;
  emission: number;
  carbonIntensity: number;
  confidence: number;
  isCleanPeriod: boolean;
}

export interface Company {
  id: string;
  name: string;
  businessType: string;
  annualElectricityUsage: number;
  carbonReductionTarget: number;
  re100Participant: boolean;
  usagePattern: {
    peakHours: string[];
    baseLoad: number;
    peakLoad: number;
  };
  esgManager: {
    name: string;
    email: string;
  };
}

export interface MatchingCriteria {
  targetOffset: number;
  maxPricePerTon: number;
  preferredTimeSlots: string[];
}

export interface MatchResult {
  id: string;
  plantId: string;
  plantName: string;
  timeSlots: string[];
  offsetAmount: number;
  pricePerTon: number;
  carbonIntensity: number;
  confidence: number;
  estimatedSavings: number;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  companyName: string;
  powerPlantName: string;
  offsetAmount: number;
  carbonIntensity: number;
  timeSlot: string;
  issuedDate: string;
  blockchainHash: string;
  qrCode: string;
  status: 'issued' | 'verified' | 'expired';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'company' | 'powerplant' | 'admin';
  organization: string;
}

export type TimeRange = '1h' | '24h' | '7d' | '30d';

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'ko' | 'en';
  notifications: boolean;
}