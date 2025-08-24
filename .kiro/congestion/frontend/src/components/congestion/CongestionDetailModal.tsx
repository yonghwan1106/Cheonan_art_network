import React from 'react';
import { X, MapPin, Users, Clock, TrendingUp, TrendingDown, Minus, Train, Bus, AlertTriangle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

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

interface CongestionDetailModalProps {
  data: CongestionData;
  onClose: () => void;
}

export const CongestionDetailModal: React.FC<CongestionDetailModalProps> = ({ data, onClose }) => {
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
      return <TrendingUp className="w-5 h-5 text-red-500" />;
    } else if (nextLevel < currentLevel) {
      return <TrendingDown className="w-5 h-5 text-green-500" />;
    } else {
      return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  // Generate mock historical data
  const generateHistoricalData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = time.getHours();
      
      // Simulate rush hour patterns
      let baseCongestion = 30;
      if ((hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 20)) {
        baseCongestion = 75;
      } else if ((hour >= 11 && hour <= 14) || (hour >= 16 && hour <= 17)) {
        baseCongestion = 55;
      }
      
      const congestion = baseCongestion + Math.floor(Math.random() * 20) - 10;
      
      data.push({
        time: time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        congestion: Math.max(0, Math.min(100, congestion)),
        passengers: Math.floor((congestion / 100) * data.vehicleCapacity || 1000)
      });
    }
    
    return data;
  };

  // Generate mock weekly pattern
  const generateWeeklyPattern = () => {
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    return days.map(day => ({
      day,
      avgCongestion: Math.floor(Math.random() * 40) + 40,
      peakCongestion: Math.floor(Math.random() * 30) + 70
    }));
  };

  const historicalData = generateHistoricalData();
  const weeklyData = generateWeeklyPattern();

  const getRecommendation = () => {
    if (data.congestionLevel === 'high') {
      return {
        type: 'warning',
        icon: AlertTriangle,
        title: '혼잡 구간',
        message: '현재 매우 혼잡합니다. 가능하면 30분 후 이용하시거나 대체 경로를 고려해보세요.',
        color: 'text-red-600'
      };
    } else if (data.congestionLevel === 'medium') {
      return {
        type: 'info',
        icon: Clock,
        title: '보통 혼잡',
        message: '약간 혼잡하지만 이용 가능합니다. 승차 시 양보 부탁드립니다.',
        color: 'text-yellow-600'
      };
    } else {
      return {
        type: 'success',
        icon: CheckCircle,
        title: '이용 권장',
        message: '현재 여유로운 상태입니다. 편안한 이용이 가능합니다.',
        color: 'text-green-600'
      };
    }
  };

  const recommendation = getRecommendation();
  const RecommendationIcon = recommendation.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {data.transportType === 'subway' ? (
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Train className="h-5 w-5 text-blue-600" />
                </div>
              ) : (
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Bus className="h-5 w-5 text-green-600" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {data.routeName} - {data.stationName}
                </h3>
                <p className="text-sm text-gray-500">
                  마지막 업데이트: {new Date(data.timestamp).toLocaleString('ko-KR')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">현재 혼잡도</p>
                  <p className="text-2xl font-bold text-gray-900">{data.congestionPercentage}%</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCongestionColor(data.congestionLevel)}`}>
                  {getCongestionText(data.congestionLevel)}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">승객 수</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.passengerCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    / {data.vehicleCapacity.toLocaleString()}명
                  </p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">1시간 후 예측</p>
                  {data.prediction && (
                    <>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-medium ${getCongestionColor(data.prediction.nextHour)}`}>
                          {getCongestionText(data.prediction.nextHour)}
                        </span>
                        {getPredictionIcon(data.congestionLevel, data.prediction.nextHour)}
                      </div>
                      <p className="text-xs text-gray-500">
                        신뢰도: {data.prediction.confidence}%
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="mb-6">
            <div className={`bg-${recommendation.type === 'warning' ? 'red' : recommendation.type === 'success' ? 'green' : 'yellow'}-50 border border-${recommendation.type === 'warning' ? 'red' : recommendation.type === 'success' ? 'green' : 'yellow'}-200 rounded-lg p-4`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <RecommendationIcon className={`h-5 w-5 ${recommendation.color}`} />
                </div>
                <div className="ml-3">
                  <h4 className={`text-sm font-medium ${recommendation.color}`}>
                    {recommendation.title}
                  </h4>
                  <p className={`mt-1 text-sm ${recommendation.color.replace('600', '700')}`}>
                    {recommendation.message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 24-hour trend */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">24시간 혼잡도 추이</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      label={{ value: '혼잡도 (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, '혼잡도']}
                      labelFormatter={(label) => `시간: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="congestion" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly pattern */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">주간 혼잡도 패턴</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      label={{ value: '혼잡도 (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `${value}%`, 
                        name === 'avgCongestion' ? '평균 혼잡도' : '최대 혼잡도'
                      ]}
                    />
                    <Bar dataKey="avgCongestion" fill="#60A5FA" name="avgCongestion" />
                    <Bar dataKey="peakCongestion" fill="#EF4444" name="peakCongestion" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">운행 정보</h5>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>차량 종류:</span>
                  <span>{data.transportType === 'subway' ? '지하철' : '버스'}</span>
                </div>
                <div className="flex justify-between">
                  <span>최대 수용 인원:</span>
                  <span>{data.vehicleCapacity.toLocaleString()}명</span>
                </div>
                <div className="flex justify-between">
                  <span>현재 이용률:</span>
                  <span>{Math.round((data.passengerCount / data.vehicleCapacity) * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">이용 팁</h5>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• 출입문 앞에서는 먼저 내리는 승객을 기다려주세요</p>
                <p>• 가방은 앞으로 메고 다른 승객을 배려해주세요</p>
                <p>• 노약자석은 필요한 분들을 위해 양보해주세요</p>
                <p>• 큰 소리로 통화하지 말아주세요</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              닫기
            </button>
            <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              경로 추천 받기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};