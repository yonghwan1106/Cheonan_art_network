import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Navigation,
  Heart,
  AlertTriangle,
  CheckCircle,
  Train,
  Bus,
  ArrowRight
} from 'lucide-react';

interface RouteOption {
  id: string;
  name: string;
  type: 'recommended' | 'fastest' | 'least-crowded';
  segments: RouteSegment[];
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

interface RouteSegment {
  id: string;
  transportType: 'subway' | 'bus' | 'walk';
  routeName: string;
  from: string;
  to: string;
  duration: number;
  congestionLevel: 'low' | 'medium' | 'high';
  congestionPercentage: number;
  color?: string;
}

interface RouteComparisonProps {
  origin: string;
  destination: string;
  departureTime?: string;
  onRouteSelect: (route: RouteOption) => void;
  onRouteSave: (route: RouteOption) => void;
  savedRoutes?: string[];
}

export const RouteComparison: React.FC<RouteComparisonProps> = ({
  origin,
  destination,
  departureTime,
  onRouteSelect,
  onRouteSave,
  savedRoutes = []
}) => {
  const [selectedRoute, setSelectedRoute] = useState<string>('');

  // Generate mock route alternatives
  const generateRouteOptions = (): RouteOption[] => {
    return [
      {
        id: 'route-recommended',
        name: '추천 경로',
        type: 'recommended',
        segments: [
          {
            id: 'seg-1',
            transportType: 'subway',
            routeName: '2호선',
            from: origin,
            to: destination,
            duration: 28,
            congestionLevel: 'medium',
            congestionPercentage: 65,
            color: '#00A84D'
          }
        ],
        totalTime: 28,
        totalDistance: 15.2,
        transfers: 0,
        congestionScore: 65,
        cost: 1370,
        incentivePoints: 15,
        pros: [
          '직통 노선으로 환승 없음',
          '평균적인 혼잡도',
          '포인트 적립 가능'
        ],
        cons: [
          '러시아워 시간대 약간 혼잡'
        ],
        reliability: 92,
        carbonFootprint: 2.1
      },
      {
        id: 'route-fastest',
        name: '최단 시간',
        type: 'fastest',
        segments: [
          {
            id: 'seg-2a',
            transportType: 'subway',
            routeName: '6호선',
            from: origin,
            to: '공덕',
            duration: 12,
            congestionLevel: 'high',
            congestionPercentage: 85,
            color: '#CD7C2F'
          },
          {
            id: 'seg-2b',
            transportType: 'subway',
            routeName: '9호선',
            from: '공덕',
            to: destination,
            duration: 10,
            congestionLevel: 'medium',
            congestionPercentage: 55,
            color: '#BDB092'
          }
        ],
        totalTime: 25,
        totalDistance: 18.7,
        transfers: 1,
        congestionScore: 70,
        cost: 1370,
        incentivePoints: 25,
        pros: [
          '가장 빠른 경로',
          '높은 인센티브 포인트'
        ],
        cons: [
          '환승 1회 필요',
          '6호선 구간 혼잡'
        ],
        reliability: 88,
        carbonFootprint: 2.8
      },
      {
        id: 'route-comfortable',
        name: '쾌적한 경로',
        type: 'least-crowded',
        segments: [
          {
            id: 'seg-3a',
            transportType: 'bus',
            routeName: '472번',
            from: origin,
            to: '신촌역',
            duration: 18,
            congestionLevel: 'low',
            congestionPercentage: 25,
            color: '#53A0FD'
          },
          {
            id: 'seg-3b',
            transportType: 'subway',
            routeName: '2호선',
            from: '신촌',
            to: destination,
            duration: 15,
            congestionLevel: 'low',
            congestionPercentage: 35,
            color: '#00A84D'
          }
        ],
        totalTime: 35,
        totalDistance: 12.8,
        transfers: 1,
        congestionScore: 30,
        cost: 1370,
        incentivePoints: 30,
        pros: [
          '가장 쾌적한 이동',
          '최고 인센티브 포인트',
          '낮은 혼잡도'
        ],
        cons: [
          '소요 시간이 가장 김',
          '버스-지하철 환승'
        ],
        reliability: 85,
        carbonFootprint: 1.9
      }
    ];
  };

  const routes = generateRouteOptions();

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCongestionText = (level: string) => {
    switch (level) {
      case 'high': return '혼잡';
      case 'medium': return '보통';
      case 'low': return '여유';
      default: return '알 수 없음';
    }
  };

  const getRouteTypeIcon = (type: string) => {
    switch (type) {
      case 'recommended': return <Star className="w-5 h-5 text-blue-500" />;
      case 'fastest': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'least-crowded': return <Users className="w-5 h-5 text-green-500" />;
      default: return <Navigation className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'subway': return <Train className="w-4 h-4" />;
      case 'bus': return <Bus className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const handleRouteSelect = (route: RouteOption) => {
    setSelectedRoute(route.id);
    onRouteSelect(route);
  };

  const handleRouteSave = (route: RouteOption) => {
    onRouteSave(route);
  };

  const isRouteSaved = (routeId: string) => {
    return savedRoutes.includes(routeId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          경로 추천
        </h3>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{origin}</span>
          <ArrowRight className="w-4 h-4" />
          <span>{destination}</span>
        </div>
        {departureTime && (
          <p className="text-sm text-gray-500 mt-1">
            출발 시간: {departureTime}
          </p>
        )}
      </div>

      {/* Route Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {routes.map((route) => (
          <div
            key={route.id}
            className={`bg-white rounded-lg border-2 p-6 transition-all duration-200 hover:shadow-lg ${
              selectedRoute === route.id 
                ? 'border-blue-500 ring-2 ring-blue-200' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Route Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getRouteTypeIcon(route.type)}
                <h4 className="font-medium text-gray-900">{route.name}</h4>
              </div>
              <button
                onClick={() => handleRouteSave(route)}
                className={`p-1 rounded-full transition-colors ${
                  isRouteSaved(route.id)
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-400 hover:text-red-500'
                }`}
                title={isRouteSaved(route.id) ? '저장됨' : '저장하기'}
              >
                <Heart className={`w-4 h-4 ${isRouteSaved(route.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{route.totalTime}분</div>
                <div className="text-xs text-gray-500">소요 시간</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{route.transfers}</div>
                <div className="text-xs text-gray-500">환승</div>
              </div>
            </div>

            {/* Route Segments */}
            <div className="space-y-2 mb-4">
              {route.segments.map((segment, index) => (
                <div key={segment.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getTransportIcon(segment.transportType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {segment.routeName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {segment.duration}분
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500 truncate">
                        {segment.from} → {segment.to}
                      </span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getCongestionColor(segment.congestionLevel)}`}>
                        {getCongestionText(segment.congestionLevel)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">거리:</span>
                <span className="text-gray-900">{route.totalDistance}km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">요금:</span>
                <span className="text-gray-900">{route.cost.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">신뢰도:</span>
                <span className="text-gray-900">{route.reliability}%</span>
              </div>
              {route.incentivePoints && (
                <div className="flex justify-between">
                  <span className="text-gray-500">포인트:</span>
                  <span className="text-blue-600 font-medium">+{route.incentivePoints}P</span>
                </div>
              )}
            </div>

            {/* Pros and Cons */}
            <div className="space-y-3 mb-4">
              {route.pros.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-green-700 mb-1">장점</h5>
                  <ul className="space-y-1">
                    {route.pros.map((pro, index) => (
                      <li key={index} className="flex items-start space-x-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {route.cons.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-red-700 mb-1">단점</h5>
                  <ul className="space-y-1">
                    {route.cons.map((con, index) => (
                      <li key={index} className="flex items-start space-x-1 text-xs text-red-600">
                        <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleRouteSelect(route)}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                selectedRoute === route.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {selectedRoute === route.id ? '선택됨' : '이 경로 선택'}
            </button>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">상세 비교</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  항목
                </th>
                {routes.map((route) => (
                  <th key={route.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {route.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  소요 시간
                </td>
                {routes.map((route) => (
                  <td key={route.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {route.totalTime}분
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  환승 횟수
                </td>
                {routes.map((route) => (
                  <td key={route.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {route.transfers}회
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  혼잡도
                </td>
                {routes.map((route) => (
                  <td key={route.id} className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCongestionColor(
                      route.congestionScore > 70 ? 'high' : route.congestionScore > 40 ? 'medium' : 'low'
                    )}`}>
                      {route.congestionScore}%
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  포인트
                </td>
                {routes.map((route) => (
                  <td key={route.id} className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                    +{route.incentivePoints || 0}P
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  탄소 발자국
                </td>
                {routes.map((route) => (
                  <td key={route.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {route.carbonFootprint}kg CO₂
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 경로 선택 팁</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• 출근 시간에는 쾌적한 경로를 선택하여 스트레스를 줄이세요</p>
          <p>• 급한 일정이 있을 때는 최단 시간 경로를 이용하세요</p>
          <p>• 포인트를 모으고 싶다면 인센티브가 높은 경로를 선택하세요</p>
          <p>• 환경을 생각한다면 탄소 발자국이 낮은 경로를 이용하세요</p>
        </div>
      </div>
    </div>
  );
};