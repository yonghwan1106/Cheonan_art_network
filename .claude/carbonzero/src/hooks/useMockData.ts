import { useEffect } from 'react';
import { PowerPlant } from '../types';
import { useAppStore } from '../stores/useAppStore';

export const useMockData = () => {
  const { 
    powerPlants, 
    companies, 
    predictions, 
    setPowerPlants, 
    setCompanies,
    updatePredictions,
    isLoading,
    setLoading 
  } = useAppStore();

  const loadInitialData = async () => {
    if (powerPlants.length > 0) return; // 이미 로드됨

    setLoading(true);
    
    try {
      // Mock 데이터 로딩
      const [powerPlantsResponse, companiesResponse, predictionsResponse] = await Promise.all([
        fetch('/mock-data/power-plants.json'),
        fetch('/mock-data/companies.json'),
        fetch('/mock-data/predictions.json')
      ]);
      
      const powerPlantsData = await powerPlantsResponse.json();
      const companiesData = await companiesResponse.json();
      await predictionsResponse.json();
      
      setPowerPlants(powerPlantsData.powerPlants);
      setCompanies(companiesData.companies);
      
      // 실시간 예측 데이터 생성
      const plantIds = powerPlantsData.powerPlants.map((plant: PowerPlant) => plant.id);
      updatePredictions(plantIds);
      
    } catch (error) {
      console.error('Failed to load mock data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  return {
    powerPlants,
    companies,
    predictions,
    isLoading,
    refreshData: () => {
      const plantIds = powerPlants.map(plant => plant.id);
      updatePredictions(plantIds);
    }
  };
};

export const useMockPowerPlants = () => {
  const { powerPlants, predictions, isLoading } = useMockData();
  
  return {
    plants: powerPlants,
    predictions,
    isLoading,
    getCurrentPredictions: (plantId: string) => {
      return predictions.find(p => p.plantId === plantId);
    }
  };
};

export const useMockCompanies = () => {
  const { companies, isLoading } = useMockData();
  
  return {
    companies,
    isLoading,
    getCompanyById: (companyId: string) => {
      return companies.find(c => c.id === companyId);
    }
  };
};

export const useRealTimeUpdates = (intervalMs: number = 10000) => {
  const { updatePredictions, powerPlants } = useAppStore();
  
  useEffect(() => {
    if (powerPlants.length === 0) return;
    
    const interval = setInterval(() => {
      const plantIds = powerPlants.map(plant => plant.id);
      updatePredictions(plantIds);
    }, intervalMs);
    
    return () => clearInterval(interval);
  }, [powerPlants, intervalMs, updatePredictions]);
};