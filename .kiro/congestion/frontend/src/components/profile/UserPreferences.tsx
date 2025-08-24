import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  Clock, 
  MapPin, 
  Bell, 
  Volume2, 
  VolumeX,
  Save,
  RotateCcw
} from 'lucide-react';

interface UserPreferences {
  congestionTolerance: 'low' | 'medium' | 'high';
  maxWalkingDistance: number;
  maxTransfers: number;
  notificationEnabled: boolean;
  notificationTiming: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoOptimization: boolean;
  dataUsage: 'minimal' | 'standard' | 'unlimited';
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en';
}

interface UserPreferencesProps {
  onPreferencesUpdate?: (preferences: UserPreferences) => void;
}

export const UserPreferences: React.FC<UserPreferencesProps> = ({ onPreferencesUpdate }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    congestionTolerance: 'medium',
    maxWalkingDistance: 800,
    maxTransfers: 2,
    notificationEnabled: true,
    notificationTiming: 30,
    soundEnabled: true,
    vibrationEnabled: true,
    autoOptimization: false,
    dataUsage: 'standard',
    theme: 'light',
    language: 'ko'
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('userPreferences');
    if (stored) {
      const parsedPreferences = JSON.parse(stored);
      setPreferences(parsedPreferences);
    }
  }, []);

  const handlePreferenceChange = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    setHasChanges(false);
    onPreferencesUpdate?.(preferences);
  };

  const handleReset = () => {
    const defaultPreferences: UserPreferences = {
      congestionTolerance: 'medium',
      maxWalkingDistance: 800,
      maxTransfers: 2,
      notificationEnabled: true,
      notificationTiming: 30,
      soundEnabled: true,
      vibrationEnabled: true,
      autoOptimization: false,
      dataUsage: 'standard',
      theme: 'light',
      language: 'ko'
    };
    setPreferences(defaultPreferences);
    setHasChanges(true);
  };

  const getCongestionToleranceText = (level: string) => {
    switch (level) {
      case 'low': return '낮음 (혼잡 회피)';
      case 'medium': return '보통 (균형)';
      case 'high': return '높음 (시간 우선)';
      default: return '보통';
    }
  };

  const getDataUsageText = (usage: string) => {
    switch (usage) {
      case 'minimal': return '최소 (Wi-Fi만)';
      case 'standard': return '표준 (적당한 사용)';
      case 'unlimited': return '무제한 (모든 기능)';
      default: return '표준';
    }
  };

  const getThemeText = (theme: string) => {
    switch (theme) {
      case 'light': return '라이트';
      case 'dark': return '다크';
      case 'auto': return '시스템 설정';
      default: return '라이트';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">환경 설정</h3>
          <p className="text-sm text-gray-600">개인 맞춤 설정을 조정하세요</p>
        </div>
        {hasChanges && (
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              초기화
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-1" />
              저장
            </button>
          </div>
        )}
      </div>

      {/* Congestion Tolerance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-gray-600" />
          <h4 className="text-lg font-medium text-gray-900">혼잡도 허용 수준</h4>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          얼마나 혼잡한 교통수단을 이용할 수 있는지 설정하세요
        </p>
        
        <div className="space-y-3">
          {(['low', 'medium', 'high'] as const).map((level) => (
            <label key={level} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="congestionTolerance"
                value={level}
                checked={preferences.congestionTolerance === level}
                onChange={(e) => handlePreferenceChange('congestionTolerance', e.target.value as any)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {getCongestionToleranceText(level)}
                </div>
                <div className="text-xs text-gray-500">
                  {level === 'low' && '혼잡한 시간대와 경로를 피합니다'}
                  {level === 'medium' && '적당한 혼잡도까지 허용합니다'}
                  {level === 'high' && '혼잡해도 빠른 경로를 선호합니다'}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Sample Data Visualization */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">현재 설정 기준 추천 예시:</p>
          <div className="flex space-x-2">
            <div className={`px-2 py-1 rounded text-xs ${
              preferences.congestionTolerance === 'low' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              여유 경로 우선
            </div>
            <div className={`px-2 py-1 rounded text-xs ${
              preferences.congestionTolerance === 'medium' 
                ? 'bg-yellow-100 text-yellow-700' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              균형 잡힌 추천
            </div>
            <div className={`px-2 py-1 rounded text-xs ${
              preferences.congestionTolerance === 'high' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              빠른 경로 우선
            </div>
          </div>
        </div>
      </div>

      {/* Travel Preferences */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h4 className="text-lg font-medium text-gray-900">이동 선호도</h4>
        </div>

        <div className="space-y-6">
          {/* Max Walking Distance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최대 도보 거리: {preferences.maxWalkingDistance}m
            </label>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={preferences.maxWalkingDistance}
              onChange={(e) => handlePreferenceChange('maxWalkingDistance', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>200m</span>
              <span>1km</span>
              <span>2km</span>
            </div>
          </div>

          {/* Max Transfers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최대 환승 횟수
            </label>
            <select
              value={preferences.maxTransfers}
              onChange={(e) => handlePreferenceChange('maxTransfers', parseInt(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>환승 없음</option>
              <option value={1}>1회 환승</option>
              <option value={2}>2회 환승</option>
              <option value={3}>3회 환승</option>
              <option value={4}>4회 이상</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="w-5 h-5 text-gray-600" />
          <h4 className="text-lg font-medium text-gray-900">알림 설정</h4>
        </div>

        <div className="space-y-6">
          {/* Notification Enabled */}
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900">알림 사용</h5>
              <p className="text-xs text-gray-500">출발 시간 및 경로 변경 알림</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notificationEnabled}
                onChange={(e) => handlePreferenceChange('notificationEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Notification Timing */}
          {preferences.notificationEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                알림 시간: 출발 {preferences.notificationTiming}분 전
              </label>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={preferences.notificationTiming}
                onChange={(e) => handlePreferenceChange('notificationTiming', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5분</span>
                <span>30분</span>
                <span>60분</span>
              </div>
            </div>
          )}

          {/* Sound and Vibration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {preferences.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-gray-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-600" />
                )}
                <span className="text-sm text-gray-900">소리</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.soundEnabled}
                  onChange={(e) => handlePreferenceChange('soundEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 text-gray-600">📳</div>
                <span className="text-sm text-gray-900">진동</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.vibrationEnabled}
                  onChange={(e) => handlePreferenceChange('vibrationEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-gray-600" />
          <h4 className="text-lg font-medium text-gray-900">고급 설정</h4>
        </div>

        <div className="space-y-6">
          {/* Auto Optimization */}
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900">자동 최적화</h5>
              <p className="text-xs text-gray-500">실시간 상황에 따라 경로를 자동으로 변경</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.autoOptimization}
                onChange={(e) => handlePreferenceChange('autoOptimization', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Data Usage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              데이터 사용량
            </label>
            <select
              value={preferences.dataUsage}
              onChange={(e) => handlePreferenceChange('dataUsage', e.target.value as any)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="minimal">최소 (Wi-Fi만)</option>
              <option value="standard">표준 (적당한 사용)</option>
              <option value="unlimited">무제한 (모든 기능)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {getDataUsageText(preferences.dataUsage)}
            </p>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              테마
            </label>
            <select
              value={preferences.theme}
              onChange={(e) => handlePreferenceChange('theme', e.target.value as any)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="light">라이트</option>
              <option value="dark">다크</option>
              <option value="auto">시스템 설정</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              언어
            </label>
            <select
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value as any)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Changes Banner */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm">변경사항이 있습니다</span>
            <button
              onClick={handleSave}
              className="text-sm underline hover:no-underline"
            >
              저장
            </button>
          </div>
        </div>
      )}
    </div>
  );
};