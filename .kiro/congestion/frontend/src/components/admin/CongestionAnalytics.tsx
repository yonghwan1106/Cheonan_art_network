import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar,
  Filter
} from 'lucide-react';

interface CongestionData {
  overview: {
    totalStations: number;
    highCongestionStations: number;
    averageCongestion: number;
    peakHour: string;
  };
  stationData: Array<{
    id: string;
    name: string;
    line: string;
    currentCongestion: number;
    averageCongestion: number;
    peakCongestion: number;
    status: 'normal' | 'warning' | 'critical';
    lastUpdate: string;
  }>;
  hourlyTrends: Array<{
    hour: string;
    congestion: number;
    passengers: number;
  }>;
  lineComparison: Array<{
    line: string;
    averageCongestion: number;
    totalPassengers: number;
    incidents: number;
  }>;
  predictions: Array<{
    time: string;
    predicted: number;
    actual?: number;
    accuracy: number;
  }>;
}

export const CongestionAnalytics: React.FC = () => {
  const [data, setData] = useState<CongestionData | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [selectedLine, setSelectedLine] = useState<string>('all');

  // Generate mock congestion data
  const generateCongestionData = (): CongestionData => {
    const stations = [
      { name: '강남역', line: '2호선' },
      { name: '홍대입구역', line: '2호선' },
      { name: '신촌역', line: '2호선' },
      { name: '을지로입구역', line: '2호선' },
      { name: '잠실역', line: '2호선' },
      { name: '종각역', line: '1호선' },
      { name: '서울역', line: '1호선' },
      { name: '동대문역', line: '1호선' },
      { name: '압구정역', line: '3호선' },
      { name: '교대역', line: '3호선' }
    ];

    const stationData = stations.map((station, index) => {
      const currentCongestion = Math.floor(Math.random() * 100);
      const averageCongestion = Math.floor(Math.random() * 80) + 10;
      const peakCongestion = Math.floor(Math.random() * 20) + 80;
      
      let status: 'normal' | 'warning' | 'critical' = 'normal';
      if (currentCongestion > 80) status = 'critical';
      else if (currentCongestion > 60) status = 'warning';

      return {
        id: `station-${index}`,
        name: station.name,
        line: station.line,
        currentCongestion,
        averageCongestion,
        peakCongestion,
        status,
        lastUpdate: new Date(Date.now() - Math.random() * 300000).toISOString()
      };
    });

    const hourlyTrends = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      congestion: Math.floor(Math.random() * 60) + 20,
      passengers: Math.floor(Math.random() * 5000) + 1000
    }));

    const lineComparison = [
      { line: '1호선', averageCongestion: 65, totalPassengers: 45000, incidents: 2 },
      { line: '2호선', averageCongestion: 78, totalPassengers: 67000, incidents: 5 },
      { line: '3호선', averageCongestion: 58, totalPassengers: 38000, incidents: 1 },
      { line: '4호선', averageCongestion: 62, totalPassengers: 42000, incidents: 3 },
      { line: '5호선', averageCongestion: 55, totalPassengers: 35000, incidents: 1 }
    ];

    const predictions = Array.from({ length: 12 }, (_, i) => {
      const predicted = Math.floor(Math.random() * 40) + 30;
      const actual = i < 8 ? Math.floor(Math.random() * 40) + 30 : undefined;
      const accuracy = actual ? Math.max(0, 100 - Math.abs(predicted - actual) * 2) : 0;

      return {
        time: `${(new Date().getHours() + i) % 24}:00`,
        predicted,
        actual,
        accuracy
      };
    });

    return {
      overview: {
        totalStations: stationData.length,
        highCongestionStations: stationData.filter(s => s.status === 'critical').length,
        averageCongestion: Math.floor(stationData.reduce((sum, s) => sum + s.currentCongestion, 0) / stationData.length),
        peakHour: '08:30'
      },
      stationData,
      hourlyTrends,
      lineComparison,
      predictions
    };
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData(generateCongestionData());
    }, 500);
  }, [timeRange, selectedLine]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getCongestionColor = (level: number) => {
    if (level > 80) return 'bg-red-500';
    if (level > 60) return 'bg-yellow-500';
    if (level > 40) return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-2 text-gray-600">혼잡도 데이터 로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h3 className="text-lg font-semibold text-gray-900">혼잡도 분석</h3>
        <div className="flex space-x-3">
          <select
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">전체 노선</option>
            <option value="1호선">1호선</option>
            <option value="2호선">2호선</option>
            <option value="3호선">3호선</option>
            <option value="4호선">4호선</option>
            <option value="5호선">5호선</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="1h">1시간</option>
            <option value="6h">6시간</option>
            <option value="24h">24시간</option>
            <option value="7d">7일</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 역 수</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalStations}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">고혼잡 역</p>
              <p className="text-2xl font-bold text-red-600">{data.overview.highCongestionStations}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">평균 혼잡도</p>
              <p className="text-2xl font-bold text-orange-600">{data.overview.averageCongestion}%</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">피크 시간</p>
              <p className="text-2xl font-bold text-purple-600">{data.overview.peakHour}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Station Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">역별 혼잡도 현황</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  역명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  노선
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  현재 혼잡도
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  평균 혼잡도
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  마지막 업데이트
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.stationData
                .filter(station => selectedLine === 'all' || station.line === selectedLine)
                .map((station) => (
                <tr key={station.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{station.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {station.line}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className={`h-2 rounded-full ${getCongestionColor(station.currentCongestion)}`}
                          style={{ width: `${station.currentCongestion}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{station.currentCongestion}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {station.averageCongestion}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(station.status)}`}>
                      {getStatusIcon(station.status)}
                      <span className="ml-1 capitalize">{station.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(station.lastUpdate).toLocaleTimeString('ko-KR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Trends */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">시간대별 혼잡도 추이</h4>
          <div className="space-y-2">
            {data.hourlyTrends.filter((_, index) => index % 2 === 0).map((trend) => (
              <div key={trend.hour} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 w-12">{trend.hour}</span>
                <div className="flex-1 mx-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getCongestionColor(trend.congestion)}`}
                      style={{ width: `${trend.congestion}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-8">{trend.congestion}%</span>
                <span className="text-xs text-gray-500 w-16 text-right">{trend.passengers.toLocaleString()}명</span>
              </div>
            ))}
          </div>
        </div>

        {/* Line Comparison */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">노선별 비교</h4>
          <div className="space-y-4">
            {data.lineComparison.map((line) => (
              <div key={line.line} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{line.line}</span>
                  <span className="text-sm text-gray-600">{line.averageCongestion}% 평균</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${getCongestionColor(line.averageCongestion)}`}
                    style={{ width: `${line.averageCongestion}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{line.totalPassengers.toLocaleString()}명</span>
                  <span>사고 {line.incidents}건</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prediction Accuracy */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">예측 정확도</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-900 mb-3">시간별 예측 vs 실제</h5>
            <div className="space-y-2">
              {data.predictions.slice(0, 8).map((pred, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="w-12 text-gray-600">{pred.time}</span>
                  <div className="flex-1 mx-3 flex space-x-2">
                    <div className="flex-1">
                      <div className="w-full bg-blue-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${pred.predicted}%` }}
                        ></div>
                      </div>
                    </div>
                    {pred.actual && (
                      <div className="flex-1">
                        <div className="w-full bg-green-100 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${pred.actual}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="w-16 text-right text-gray-600">
                    {pred.actual ? `${pred.accuracy}%` : '예측중'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                <span>예측값</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                <span>실제값</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 mb-3">예측 성능 지표</h5>
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">87.3%</p>
                <p className="text-sm text-blue-800">전체 정확도</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">92.1%</p>
                  <p className="text-xs text-green-800">피크시간 정확도</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-lg font-bold text-yellow-600">82.5%</p>
                  <p className="text-xs text-yellow-800">비피크시간 정확도</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};