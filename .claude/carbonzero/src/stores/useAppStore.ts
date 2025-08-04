import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  PowerPlant, 
  Company, 
  PredictionData, 
  Certificate, 
  User, 
  TimeRange, 
  UserPreferences,
  MatchResult 
} from '../types';
import { generateRealTimeData } from '../utils/mockDataGenerator';

interface AppState {
  // 사용자 상태
  currentUser: User | null;
  userType: 'company' | 'powerplant' | 'admin';
  
  // 데이터 상태
  powerPlants: PowerPlant[];
  companies: Company[];
  predictions: PredictionData[];
  certificates: Certificate[];
  matchResults: MatchResult[];
  
  // UI 상태
  selectedTimeRange: TimeRange;
  isLoading: boolean;
  
  // 사용자 설정
  userPreferences: UserPreferences;
  
  // 액션
  setUser: (user: User) => void;
  setUserType: (type: 'company' | 'powerplant' | 'admin') => void;
  setPowerPlants: (plants: PowerPlant[]) => void;
  setCompanies: (companies: Company[]) => void;
  updatePredictions: (plantIds: string[]) => void;
  addCertificate: (cert: Certificate) => void;
  setMatchResults: (results: MatchResult[]) => void;
  setSelectedTimeRange: (range: TimeRange) => void;
  setLoading: (loading: boolean) => void;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;
  
  // 데이터 로딩
  loadMockData: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        currentUser: null,
        userType: 'company',
        powerPlants: [],
        companies: [],
        predictions: [],
        certificates: [],
        matchResults: [],
        selectedTimeRange: '24h',
        isLoading: false,
        userPreferences: {
          theme: 'light',
          language: 'ko',
          notifications: true,
        },

        // 액션 구현
        setUser: (user) => set({ currentUser: user }),
        
        setUserType: (type) => set({ userType: type }),
        
        setPowerPlants: (plants) => set({ powerPlants: plants }),
        
        setCompanies: (companies) => set({ companies: companies }),
        
        updatePredictions: (plantIds) => {
          const newPredictions: PredictionData[] = plantIds.map(plantId => ({
            plantId,
            timestamp: new Date().toISOString(),
            hourlyPredictions: generateRealTimeData(plantId)
          }));
          
          set({ predictions: newPredictions });
        },
        
        addCertificate: (certificate) => set((state) => ({
          certificates: [...state.certificates, certificate]
        })),
        
        setMatchResults: (results) => set({ matchResults: results }),
        
        setSelectedTimeRange: (range) => set({ selectedTimeRange: range }),
        
        setLoading: (loading) => set({ isLoading: loading }),
        
        updateUserPreferences: (prefs) => set((state) => ({
          userPreferences: { ...state.userPreferences, ...prefs }
        })),
        
        loadMockData: async () => {
          set({ isLoading: true });
          
          try {
            // Mock 데이터 로딩 시뮬레이션
            const [powerPlantsResponse, companiesResponse] = await Promise.all([
              fetch('/mock-data/power-plants.json'),
              fetch('/mock-data/companies.json')
            ]);
            
            const powerPlantsData = await powerPlantsResponse.json();
            const companiesData = await companiesResponse.json();
            
            set({ 
              powerPlants: powerPlantsData.powerPlants,
              companies: companiesData.companies
            });
            
            // 예측 데이터 생성
            const plantIds = powerPlantsData.powerPlants.map((plant: PowerPlant) => plant.id);
            get().updatePredictions(plantIds);
            
          } catch (error) {
            console.error('Failed to load mock data:', error);
          } finally {
            set({ isLoading: false });
          }
        }
      }),
      {
        name: 'carbonzero-storage',
        partialize: (state) => ({
          userPreferences: state.userPreferences,
          certificates: state.certificates,
          currentUser: state.currentUser,
          userType: state.userType,
        }),
      }
    ),
    { name: 'carbonzero-store' }
  )
);