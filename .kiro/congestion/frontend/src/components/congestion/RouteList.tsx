import React, { useState, useMemo } from 'react';
import { Train, Bus, MapPin, Users, TrendingUp, TrendingDown, Minus, Search, Filter } from 'lucide-react';

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

interface RouteListProps {
  data: CongestionData[];
  onRouteClick: (route: CongestionData) => void;
}

type SortField = 'name' | 'congestion' | 'passengers' | 'prediction';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'subway' | 'bus';
type CongestionFilter = 'all' | 'low' | 'medium' | 'high';

export const RouteList: React.FC<RouteListProps> = ({ data, onRouteClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('congestion');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [transportFilter, setTransportFilter] = useState<FilterType>('all');
  const [congestionFilter, setCongestionFilter] = useState<CongestionFilter>('all');

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

  const getPredictionIcon = (current: string, next: string) => {
    const currentLevel = current === 'low' ? 0 : current === 'medium' ? 1 : 2;
    const nextLevel = next === 'low' ? 0 : next === 'medium' ? 1 : 2;
    
    if (nextLevel > currentLevel) {
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    } else if (nextLevel < currentLevel) {
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.stationName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Transport type filter
    if (transportFilter !== 'all') {
      filtered = filtered.filter(item => item.transportType === transportFilter);
    }

    // Congestion level filter
    if (congestionFilter !== 'all') {
      filtered = filtered.filter(item => item.congestionLevel === congestionFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'name':
          aValue = `${a.routeName} ${a.stationName}`;
          bValue = `${b.routeName} ${b.stationName}`;
          break;
        case 'congestion':
          aValue = a.congestionPercentage;
          bValue = b.congestionPercentage;
          break;
        case 'passengers':
          aValue = a.passengerCount;
          bValue = b.passengerCount;
          break;
        case 'prediction': {
          const aNext = a.prediction?.nextHour === 'low' ? 0 : a.prediction?.nextHour === 'medium' ? 1 : 2;
          const bNext = b.prediction?.nextHour === 'low' ? 0 : b.prediction?.nextHour === 'medium' ? 1 : 2;
          aValue = aNext;
          bValue = bNext;
          break;
        }
        default:
          aValue = a.congestionPercentage;
          bValue = b.congestionPercentage;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [data, searchTerm, sortField, sortOrder, transportFilter, congestionFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="노선명 또는 역명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={transportFilter}
            onChange={(e) => setTransportFilter(e.target.value as FilterType)}
            className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">전체</option>
            <option value="subway">지하철</option>
            <option value="bus">버스</option>
          </select>

          <select
            value={congestionFilter}
            onChange={(e) => setCongestionFilter(e.target.value as CongestionFilter)}
            className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">모든 혼잡도</option>
            <option value="low">여유</option>
            <option value="medium">보통</option>
            <option value="high">혼잡</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        총 {filteredAndSortedData.length}개 구간
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>노선/역명</span>
                    {sortField === 'name' && (
                      <span className="text-blue-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('congestion')}
                >
                  <div className="flex items-center space-x-1">
                    <span>혼잡도</span>
                    {sortField === 'congestion' && (
                      <span className="text-blue-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('passengers')}
                >
                  <div className="flex items-center space-x-1">
                    <span>승객 수</span>
                    {sortField === 'passengers' && (
                      <span className="text-blue-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('prediction')}
                >
                  <div className="flex items-center space-x-1">
                    <span>1시간 후 예측</span>
                    {sortField === 'prediction' && (
                      <span className="text-blue-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        {item.transportType === 'subway' ? (
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Train className="h-4 w-4 text-blue-600" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Bus className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.routeName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {item.stationName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCongestionColor(item.congestionLevel)}`}>
                        {getCongestionText(item.congestionLevel)}
                      </span>
                      <span className="ml-2 text-sm text-gray-600">
                        {item.congestionPercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {item.passengerCount.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        / {item.vehicleCapacity.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.prediction && (
                      <div className="flex items-center">
                        {getPredictionIcon(item.congestionLevel, item.prediction.nextHour)}
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCongestionColor(item.prediction.nextHour)}`}>
                          {getCongestionText(item.prediction.nextHour)}
                        </span>
                        <span className="ml-1 text-xs text-gray-500">
                          ({item.prediction.confidence}%)
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onRouteClick(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      상세보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-12">
            <Filter className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">검색 결과가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">
              다른 검색어나 필터를 시도해보세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};