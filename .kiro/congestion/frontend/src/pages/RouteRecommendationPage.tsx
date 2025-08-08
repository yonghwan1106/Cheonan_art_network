import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Navigation, Search, Bookmark, History } from 'lucide-react';
import { RouteComparison } from '../components/routes/RouteComparison';
import { LoadingCard } from '../components/common/LoadingSpinner';

interface RouteOption {
  id: string;
  name: string;
  type: 'recommended' | 'fastest' | 'least-crowded';
  segments: any[];
  totalTime: number;
  totalDistance: number;
  transfers: number;
  congestionScore: number;
  cost: number;
  incentivePoints?: number;
  pros: string[];
  cons: string[];
  reliability: number;
  carbonFootprint: number;
}

interface SavedRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  savedAt: string;
  usageCount: number;
}

interface RecentSearch {
  id: string;
  origin: string;
  destination: string;
  searchedAt: string;
}

export const RouteRecommendationPage: React.FC = () => {
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [departureTime, setDepartureTime] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Popular destinations for quick selection
  const popularDestinations = [
    '강남역', '홍대입구', '명동', '잠실', '신촌', '이태원',
    '여의도', '종로3가', '건대입구', '신림', '노원', '수원'
  ];

  // Load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedRoutes');
    if (saved) {
      setSavedRoutes(JSON.parse(saved));
    }

    const recent = localStorage.getItem('recentSearches');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }

    // Set default departure time to current time
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    setDepartureTime(timeString);
  }, []);

  const handleSearch = async () => {
    if (!origin || !destination) {
      alert('출발지와 도착지를 모두 입력해주세요.');
      return;
    }

    if (origin === destination) {
      alert('출발지와 도착지가 같습니다.');
      return;
    }

    setIsSearching(true);
    
    // Add to recent searches
    const newSearch: RecentSearch = {
      id: `search-${Date.now()}`,
      origin,
      destination,
      searchedAt: new Date().toISOString()
    };

    const updatedRecentSearches = [newSearch, ...recentSearches.slice(0, 4)];
    setRecentSearches(updatedRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecentSearches));

    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
      setShowResults(true);
    }, 1500);
  };

  const handleRouteSelect = (route: RouteOption) => {
    setSelectedRoute(route);
    console.log('Selected route:', route);
  };

  const handleRouteSave = (route: RouteOption) => {
    const existingRoute = savedRoutes.find(saved => 
      saved.origin === origin && saved.destination === destination
    );

    if (existingRoute) {
      // Update usage count
      const updatedRoutes = savedRoutes.map(saved =>
        saved.id === existingRoute.id
          ? { ...saved, usageCount: saved.usageCount + 1 }
          : saved
      );
      setSavedRoutes(updatedRoutes);
      localStorage.setItem('savedRoutes', JSON.stringify(updatedRoutes));
    } else {
      // Add new saved route
      const newSavedRoute: SavedRoute = {
        id: `saved-${Date.now()}`,
        name: `${origin} → ${destination}`,
        origin,
        destination,
        savedAt: new Date().toISOString(),
        usageCount: 1
      };

      const updatedRoutes = [newSavedRoute, ...savedRoutes.slice(0, 9)]; // Keep max 10
      setSavedRoutes(updatedRoutes);
      localStorage.setItem('savedRoutes', JSON.stringify(updatedRoutes));
    }
  };

  const handleQuickDestination = (dest: string) => {
    setDestination(dest);
  };

  const handleRecentSearch = (search: RecentSearch) => {
    setOrigin(search.origin);
    setDestination(search.destination);
  };

  const handleSavedRoute = (saved: SavedRoute) => {
    setOrigin(saved.origin);
    setDestination(saved.destination);
  };

  const clearForm = () => {
    setOrigin('');
    setDestination('');
    setShowResults(false);
    setSelectedRoute(null);
  };

  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">경로 추천</h1>
        <p className="mt-1 text-sm text-gray-600">
          최적의 경로를 찾아 시간과 비용을 절약하세요
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Origin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출발지
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="출발지를 입력하세요"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              도착지
            </label>
            <div className="relative">
              <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="도착지를 입력하세요"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Departure Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출발 시간
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col justify-end space-y-2">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              {isSearching ? '검색 중...' : '경로 검색'}
            </button>
            <div className="flex space-x-2">
              <button
                onClick={swapLocations}
                className="flex-1 px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                ⇄ 바꾸기
              </button>
              <button
                onClick={clearForm}
                className="flex-1 px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                초기화
              </button>
            </div>
          </div>
        </div>

        {/* Quick Destinations */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">인기 목적지</h4>
          <div className="flex flex-wrap gap-2">
            {popularDestinations.map((dest) => (
              <button
                key={dest}
                onClick={() => handleQuickDestination(dest)}
                className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                {dest}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <History className="w-4 h-4 mr-2" />
              최근 검색
            </h4>
            <div className="space-y-2">
              {recentSearches.slice(0, 3).map((search) => (
                <button
                  key={search.id}
                  onClick={() => handleRecentSearch(search)}
                  className="w-full text-left p-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {search.origin} → {search.destination}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(search.searchedAt).toLocaleDateString('ko-KR')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Saved Routes */}
        {savedRoutes.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Bookmark className="w-4 h-4 mr-2" />
              저장된 경로
            </h4>
            <div className="space-y-2">
              {savedRoutes.slice(0, 3).map((saved) => (
                <button
                  key={saved.id}
                  onClick={() => handleSavedRoute(saved)}
                  className="w-full text-left p-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {saved.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {saved.usageCount}회 이용
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 검색 팁</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• 역명이나 주요 건물명으로 검색하세요</p>
            <p>• 출발 시간을 설정하면 더 정확한 예측을 받을 수 있어요</p>
            <p>• 자주 이용하는 경로는 저장해두세요</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isSearching && (
        <LoadingCard message="최적의 경로를 찾고 있습니다..." />
      )}

      {/* Search Results */}
      {showResults && !isSearching && (
        <RouteComparison
          origin={origin}
          destination={destination}
          departureTime={departureTime}
          onRouteSelect={handleRouteSelect}
          onRouteSave={handleRouteSave}
          savedRoutes={savedRoutes.map(r => r.id)}
        />
      )}

      {/* Selected Route Navigation */}
      {selectedRoute && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-medium text-green-900">
                경로가 선택되었습니다!
              </h4>
              <p className="text-sm text-green-700 mt-1">
                {selectedRoute.name} - {selectedRoute.totalTime}분 소요
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                길찾기 시작
              </button>
              <button className="px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors">
                상세 보기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">이용 통계</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{recentSearches.length}</div>
            <div className="text-sm text-gray-600">총 검색 횟수</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{savedRoutes.length}</div>
            <div className="text-sm text-gray-600">저장된 경로</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {savedRoutes.reduce((sum, route) => sum + route.usageCount, 0)}
            </div>
            <div className="text-sm text-gray-600">총 이용 횟수</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.floor(Math.random() * 50) + 20}분
            </div>
            <div className="text-sm text-gray-600">평균 절약 시간</div>
          </div>
        </div>
      </div>
    </div>
  );
};