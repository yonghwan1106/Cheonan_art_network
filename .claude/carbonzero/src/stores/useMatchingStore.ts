import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  Company, 
  MatchingCriteria, 
  MatchResult 
} from '../types';

interface MatchingState {
  // 현재 선택된 상태
  selectedCompany: Company | null;
  matchingCriteria: MatchingCriteria;
  matchResults: MatchResult[];
  
  // UI 상태
  isMatching: boolean;
  isContractInProgress: boolean;
  
  // 액션
  setSelectedCompany: (company: Company | null) => void;
  updateMatchingCriteria: (criteria: Partial<MatchingCriteria>) => void;
  setMatchResults: (results: MatchResult[]) => void;
  setIsMatching: (matching: boolean) => void;
  setIsContractInProgress: (inProgress: boolean) => void;
  clearMatchingData: () => void;
}

export const useMatchingStore = create<MatchingState>()(
  devtools(
    (set) => ({
      // 초기 상태
      selectedCompany: null,
      matchingCriteria: {
        targetOffset: 100,
        maxPricePerTon: 50000,
        preferredTimeSlots: []
      },
      matchResults: [],
      isMatching: false,
      isContractInProgress: false,

      // 액션 구현
      setSelectedCompany: (company) => set({ selectedCompany: company }),
      
      updateMatchingCriteria: (criteria) => set((state) => ({
        matchingCriteria: { ...state.matchingCriteria, ...criteria }
      })),
      
      setMatchResults: (results) => set({ matchResults: results }),
      
      setIsMatching: (matching) => set({ isMatching: matching }),
      
      setIsContractInProgress: (inProgress) => set({ isContractInProgress: inProgress }),
      
      clearMatchingData: () => set({
        selectedCompany: null,
        matchResults: [],
        matchingCriteria: {
          targetOffset: 100,
          maxPricePerTon: 50000,
          preferredTimeSlots: []
        }
      }),
    }),
    { name: 'matching-store' }
  )
);