import React, { useState, useEffect } from 'react';
import { MapPin, Clock, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { CongestionMap } from '../components/congestion/CongestionMap';
import { RouteList } from '../components/congestion/RouteList';
import { CongestionDetailModal } from '../components/congestion/CongestionDetailModal';
import { LoadingCard } from '../components/common/LoadingSpinner';

interface CongestionData {
  id: string;
  routeId: string;
  routeName: string;
  stationId: string;
  stationName: string;
  congestionLevel: 'low' | 'medium' | 'high';
  congestionPercentage: number;
  passengerCount: number;
  vehicleCapacity: number;
  transportType: 'subway' | 'bus';
  timestamp: string;
  prediction?: {
    nextHour: 'low' | 'medium' | 'high';
    confidence: number;
  };
}

export const CongestionPage: React.FC = () => {
  const [congestionData, setCongestionData] = useState<CongestionData[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<CongestionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Mock data generation
  const generateMockData = (): CongestionData[] => {
    const routes = [
      { id: 'line1', name: '1호선', type: 'subway' as const },
      { id: 'line2', name: '2호선', type: 'subway' as const },
      { id: 'line3', name: '3호선', type: 'subway' as const },
      { id: 'line4', name: '4호선', type: 'subway' as const },
      { id: 'bus-472', name: '472번', type: 'bus' as const },
      { id: 'bus-146', name: '146번', type: 'bus' as const },
    ];

    const stations = [
      '홍익대입구', '신촌', '이대', '아현', '충정로',
      '강남', '역삼', '선릉', '삼성', '종합운동장',
      '잠실', '석촌', '송파', '가락시장', '문정',
      '명동', '을지로입구', '종각', '종로3가', '안국'
    ];

    const congestionLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    
    return routes.flatMap(route => 
      stations.slice(0, Math.floor(Math.random() * 8) + 3).map((station, index) => {
        const congestionLevel = congestionLevels[Math.floor(Math.random() * 3)];
        const basePercentage = congestionLevel === 'low' ? 30 : congestionLevel === 'medium' ? 60 : 85;
        const congestionPercentage = basePercentage + Math.floor(Math.random() * 20) - 10;
        const capacity = route.type === 'subway' ? 1200 : 45;
        const passengerCount = Math.floor((congestionPercentage / 100) * capacity);

        return {
          id: `${route.id}-${index}`,
          routeId: route.id,
          routeName: route.name,
          stationId: `${route.id}-station-${index}`,
          stationName: station,
          congestionLevel,
          congestionPercentage: Math.max(0, Math.min(100, congestionPercentage)),
          passengerCount,
          vehicleCapacity: capacity,
          transportType: route.type,
          timestamp: new Date().toISOString(),
          prediction: {
            nextHour: congestionLevels[Math.floor(Math.random() * 3)],
            confidence: Math.floor(Math.random() * 30) + 70
          }
        };
      })
    );
  };

  // Initialize data
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      setTimeout(() => {
        setCongestionData(generateMockData());
        setLastUpdated(new Date());
        setIsLoading(false);
      }, 1000);
    };

    loadData();
  }, []);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCongestionData(prevData => 
        prevData.map(item => {
          // Randomly update some items
          if (Math.random() < 0.3) {
            const congestionLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
            const newLevel = congestionLevels[Math.floor(Math.random() * 3)];
            const basePercentage = newLevel === 'low' ? 30 : newLevel === 'medium' ? 60 : 85;
            const newPercentage = basePercentage + Math.floor(Math.random() * 20) - 10;
            const newPassengerCount = Math.floor((newPercentage / 100) * item.vehicleCapacity);

            return {
              ...item,
              congestionLevel: newLevel,
              congestionPercentage: Math.max(0, Math.min(100, newPercentage)),
              passengerCount: newPassengerCount,
              timestamp: new Date().toISOString(),
              prediction: {
                nextHour: congestionLevels[Math.floor(Math.random() * 3)],
                confidence: Math.floor(Math.random() * 30) + 70
              }
            };
          }
          return item;
        })
      );
      setLastUpdated(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getCongestionStats = () => {
    const total = congestionData.length;
    const low = congestionData.filter(item => item.congestionLevel === 'low').length;
    const medium = congestionData.filter(item => item.congestionLevel === 'medium').length;
    const high = congestionData.filter(item => item.congestionLevel === 'high').length;

    return { total, low, medium, high };
  };

  const stats = getCongestionStats();

  if (isLoading) {
    return <LoadingCard message="혼잡도 데이터를 불러오는 중..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">실시간 혼잡도 현황</h1>
          <p className="mt-1 text-sm text-gray-600">
            서울 지하철 및 버스 실시간 혼잡도 정보
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            마지막 업데이트: {lastUpdated.toLocaleTimeString()}
          </div>
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'map'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              지도 보기
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                viewMode === 'list'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              목록 보기
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    전체 구간
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    여유
                  </dt>
                  <dd className="text-2xl font-semibold text-green-600">
                    {stats.low}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    보통
                  </dt>
                  <dd className="text-2xl font-semibold text-yellow-600">
                    {stats.medium}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    혼잡
                  </dt>
                  <dd className="text-2xl font-semibold text-red-600">
                    {stats.high}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {stats.high > 5 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                혼잡 구간 주의
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  현재 {stats.high}개 구간에서 높은 혼잡도가 감지되었습니다. 
                  가능하면 대체 경로를 이용하시거나 시간을 조정해 주세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {viewMode === 'map' ? (
            <CongestionMap 
              data={congestionData} 
              onRouteClick={setSelectedRoute}
            />
          ) : (
            <RouteList 
              data={congestionData} 
              onRouteClick={setSelectedRoute}
            />
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">범례</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">여유 (0-40%)</p>
                <p className="text-xs text-gray-500">승차 가능</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">보통 (41-70%)</p>
                <p className="text-xs text-gray-500">약간 혼잡</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">혼잡 (71-100%)</p>
                <p className="text-xs text-gray-500">매우 혼잡</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRoute && (
        <CongestionDetailModal
          data={selectedRoute}
          onClose={() => setSelectedRoute(null)}
        />
      )}
    </div>
  );
};