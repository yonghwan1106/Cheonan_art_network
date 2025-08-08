import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface TimeSlot {
  time: string;
  hour: number;
  congestionLevel: 'low' | 'medium' | 'high';
  congestionPercentage: number;
  isRushHour: boolean;
  prediction?: {
    accuracy: number;
    trend: 'up' | 'down' | 'stable';
  };
  alerts?: {
    type: 'warning' | 'info' | 'success';
    message: string;
  }[];
}

interface TimelineProps {
  selectedRoute?: string;
  selectedDate?: Date;
  onTimeSelect?: (time: string) => void;
  onOptimizationRequest?: (currentTime: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  selectedRoute = '2호선',
  selectedDate = new Date(),
  onTimeSelect,
  onOptimizationRequest
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Generate mock timeline data
  const generateTimelineData = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    for (let hour = 7; hour <= 21; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 20);
      
      let congestionLevel: 'low' | 'medium' | 'high';
      let congestionPercentage: number;
      
      if (isRushHour) {
        congestionLevel = 'high';
        congestionPercentage = 75 + Math.floor(Math.random() * 20);
      } else if ((hour >= 11 && hour <= 14) || (hour >= 16 && hour <= 17)) {
        congestionLevel = 'medium';
        congestionPercentage = 45 + Math.floor(Math.random() * 25);
      } else {
        congestionLevel = 'low';
        congestionPercentage = 15 + Math.floor(Math.random() * 25);
      }

      const alerts: TimeSlot['alerts'] = [];
      
      if (congestionLevel === 'high') {
        alerts.push({
          type: 'warning',
          message: '혼잡 시간대입니다. 대체 시간을 고려해보세요.'
        });
      } else if (congestionLevel === 'low') {
        alerts.push({
          type: 'success',
          message: '여유로운 시간대입니다. 편안한 이용이 가능해요.'
        });
      }

      // Add special alerts for certain times
      if (hour === 8) {
        alerts.push({
          type: 'info',
          message: '출근 시간대 최고 혼잡 예상'
        });
      } else if (hour === 19) {
        alerts.push({
          type: 'info',
          message: '퇴근 시간대 혼잡 예상'
        });
      }

      slots.push({
        time,
        hour,
        congestionLevel,
        congestionPercentage: Math.max(0, Math.min(100, congestionPercentage)),
        isRushHour,
        prediction: {
          accuracy: Math.floor(Math.random() * 20) + 80,
          trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
        },
        alerts
      });
    }
    
    return slots;
  };

  // Initialize data
  useEffect(() => {
    setTimeSlots(generateTimelineData());
    
    // Set current time
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour >= 7 && currentHour <= 21) {
      setCurrentTime(`${currentHour.toString().padStart(2, '0')}:00`);
    }
  }, [selectedRoute, selectedDate]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSlots(prevSlots => 
        prevSlots.map(slot => {
          // Randomly update some slots
          if (Math.random() < 0.2) {
            const variation = Math.floor(Math.random() * 10) - 5;
            const newPercentage = Math.max(0, Math.min(100, slot.congestionPercentage + variation));
            const newLevel = newPercentage > 70 ? 'high' : newPercentage > 40 ? 'medium' : 'low';
            
            return {
              ...slot,
              congestionLevel: newLevel,
              congestionPercentage: newPercentage
            };
          }
          return slot;
        })
      );
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCongestionBorderColor = (level: string) => {
    switch (level) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-green-500" />;
      default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
    onTimeSelect?.(time);
  };

  const handleOptimization = () => {
    if (selectedTime) {
      onOptimizationRequest?.(selectedTime);
    }
  };

  const getOptimizationSuggestion = () => {
    if (!selectedTime) return null;
    
    const selectedSlot = timeSlots.find(slot => slot.time === selectedTime);
    if (!selectedSlot) return null;

    if (selectedSlot.congestionLevel === 'high') {
      // Find better alternatives
      const alternatives = timeSlots.filter(slot => 
        slot.congestionLevel === 'low' && 
        Math.abs(slot.hour - selectedSlot.hour) <= 2
      );
      
      if (alternatives.length > 0) {
        const bestAlternative = alternatives[0];
        return {
          type: 'suggestion' as const,
          message: `${bestAlternative.time}에 출발하시면 ${selectedSlot.congestionPercentage - bestAlternative.congestionPercentage}% 덜 혼잡해요!`,
          alternativeTime: bestAlternative.time
        };
      }
    }

    return null;
  };

  const optimizationSuggestion = getOptimizationSuggestion();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {selectedRoute} 시간대별 혼잡도 예측
          </h3>
          <p className="text-sm text-gray-500">
            {selectedDate.toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            현재 시간: {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">시간대별 혼잡도 (7:00 - 21:00)</h4>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>여유 (0-40%)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>보통 (41-70%)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>혼잡 (71-100%)</span>
            </div>
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="relative">
          <div className="grid grid-cols-15 gap-1 mb-4">
            {timeSlots.map((slot) => (
              <div key={slot.time} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{slot.time}</div>
                <button
                  onClick={() => handleTimeClick(slot.time)}
                  className={`w-full h-16 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                    selectedTime === slot.time 
                      ? `${getCongestionBorderColor(slot.congestionLevel)} ring-2 ring-blue-500 ring-opacity-50` 
                      : 'border-transparent'
                  } ${
                    currentTime === slot.time ? 'ring-2 ring-blue-400' : ''
                  }`}
                  title={`${slot.time} - ${slot.congestionPercentage}% 혼잡`}
                >
                  <div className={`w-full h-full rounded-md ${getCongestionColor(slot.congestionLevel)} flex flex-col items-center justify-center text-white text-xs font-medium`}>
                    <div>{slot.congestionPercentage}%</div>
                    {slot.prediction && (
                      <div className="mt-1">
                        {getTrendIcon(slot.prediction.trend)}
                      </div>
                    )}
                  </div>
                </button>
                {slot.isRushHour && (
                  <div className="text-xs text-orange-600 mt-1">러시아워</div>
                )}
              </div>
            ))}
          </div>

          {/* Current time indicator */}
          {currentTime && (
            <div className="absolute top-8 pointer-events-none">
              <div 
                className="w-0.5 h-16 bg-blue-400"
                style={{
                  left: `${((timeSlots.findIndex(slot => slot.time === currentTime) + 0.5) / timeSlots.length) * 100}%`
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Selected Time Details */}
      {selectedTime && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {selectedTime} 상세 정보
          </h4>
          
          {(() => {
            const selectedSlot = timeSlots.find(slot => slot.time === selectedTime);
            if (!selectedSlot) return null;

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">혼잡도</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedSlot.congestionPercentage}%
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full ${getCongestionColor(selectedSlot.congestionLevel)}`} />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">예측 정확도</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedSlot.prediction?.accuracy}%
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">트렌드</p>
                        <p className="text-sm text-gray-700">
                          {selectedSlot.prediction?.trend === 'up' ? '증가' : 
                           selectedSlot.prediction?.trend === 'down' ? '감소' : '안정'}
                        </p>
                      </div>
                      {selectedSlot.prediction && getTrendIcon(selectedSlot.prediction.trend)}
                    </div>
                  </div>
                </div>

                {/* Alerts */}
                {selectedSlot.alerts && selectedSlot.alerts.length > 0 && (
                  <div className="space-y-2">
                    {selectedSlot.alerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          alert.type === 'warning' 
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : alert.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-blue-50 border-blue-200 text-blue-700'
                        }`}
                      >
                        <div className="flex items-center">
                          {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 mr-2" />}
                          {alert.type === 'success' && <CheckCircle className="w-4 h-4 mr-2" />}
                          {alert.type === 'info' && <Clock className="w-4 h-4 mr-2" />}
                          <span className="text-sm">{alert.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optimization Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleOptimization}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    최적 시간 찾기
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Optimization Suggestion */}
      {optimizationSuggestion && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                더 나은 시간 추천
              </h4>
              <p className="mt-1 text-sm text-blue-700">
                {optimizationSuggestion.message}
              </p>
              <button
                onClick={() => handleTimeClick(optimizationSuggestion.alternativeTime)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                {optimizationSuggestion.alternativeTime}로 변경하기 →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};