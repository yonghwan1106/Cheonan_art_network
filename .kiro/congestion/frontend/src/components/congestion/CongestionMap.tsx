import React from 'react';
import { MapPin, Train, Bus } from 'lucide-react';

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

interface CongestionMapProps {
  data: CongestionData[];
  onRouteClick: (route: CongestionData) => void;
}

export const CongestionMap: React.FC<CongestionMapProps> = ({ data, onRouteClick }) => {
  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRouteColor = (routeId: string) => {
    const colors = {
      'line1': 'border-blue-600',
      'line2': 'border-green-600',
      'line3': 'border-orange-600',
      'line4': 'border-cyan-600',
      'bus-472': 'border-purple-600',
      'bus-146': 'border-pink-600',
    };
    return colors[routeId as keyof typeof colors] || 'border-gray-600';
  };

  // Group data by route for better visualization
  const routeGroups = data.reduce((groups, item) => {
    if (!groups[item.routeId]) {
      groups[item.routeId] = [];
    }
    groups[item.routeId].push(item);
    return groups;
  }, {} as Record<string, CongestionData[]>);

  return (
    <div className="space-y-6">
      <div className="text-center text-sm text-gray-500 mb-4">
        서울 지하철 및 버스 노선 혼잡도 현황 (시뮬레이션)
      </div>

      {/* Simplified Map View */}
      <div className="bg-gray-50 rounded-lg p-6 min-h-96">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Subway Lines */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Train className="w-5 h-5 mr-2" />
              지하철 노선
            </h3>
            <div className="space-y-4">
              {Object.entries(routeGroups)
                .filter(([routeId]) => routeId.startsWith('line'))
                .map(([routeId, stations]) => (
                  <div key={routeId} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className={`border-l-4 ${getRouteColor(routeId)} pl-3 mb-3`}>
                      <h4 className="font-medium text-gray-900">
                        {stations[0]?.routeName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {stations.length}개 구간
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {stations.map((station) => (
                        <button
                          key={station.id}
                          onClick={() => onRouteClick(station)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getCongestionColor(station.congestionLevel)} hover:opacity-80 transition-opacity`}
                          title={`${station.stationName} - ${station.congestionPercentage}%`}
                        >
                          <MapPin className="w-3 h-3 mr-1" />
                          {station.stationName}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Bus Routes */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Bus className="w-5 h-5 mr-2" />
              버스 노선
            </h3>
            <div className="space-y-4">
              {Object.entries(routeGroups)
                .filter(([routeId]) => routeId.startsWith('bus'))
                .map(([routeId, stations]) => (
                  <div key={routeId} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className={`border-l-4 ${getRouteColor(routeId)} pl-3 mb-3`}>
                      <h4 className="font-medium text-gray-900">
                        {stations[0]?.routeName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {stations.length}개 정류장
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {stations.map((station) => (
                        <button
                          key={station.id}
                          onClick={() => onRouteClick(station)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getCongestionColor(station.congestionLevel)} hover:opacity-80 transition-opacity`}
                          title={`${station.stationName} - ${station.congestionPercentage}%`}
                        >
                          <MapPin className="w-3 h-3 mr-1" />
                          {station.stationName}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Network Overview */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">노선별 평균 혼잡도</h4>
        <div className="space-y-3">
          {Object.entries(routeGroups).map(([routeId, stations]) => {
            const avgCongestion = stations.reduce((sum, station) => sum + station.congestionPercentage, 0) / stations.length;
            const avgLevel = avgCongestion > 70 ? 'high' : avgCongestion > 40 ? 'medium' : 'low';
            
            return (
              <div key={routeId} className="flex items-center justify-between">
                <div className="flex items-center">
                  {stations[0]?.transportType === 'subway' ? (
                    <Train className="w-4 h-4 mr-2 text-gray-400" />
                  ) : (
                    <Bus className="w-4 h-4 mr-2 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {stations[0]?.routeName}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getCongestionColor(avgLevel)}`}
                      style={{ width: `${avgCongestion}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {Math.round(avgCongestion)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};