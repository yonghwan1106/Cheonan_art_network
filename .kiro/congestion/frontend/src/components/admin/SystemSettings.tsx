import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Database,
  Server,
  Bell,
  Shield,
  Clock,
  BarChart3,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface SystemConfig {
  general: {
    systemName: string;
    maintenanceMode: boolean;
    debugMode: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
  };
  database: {
    connectionTimeout: number;
    maxConnections: number;
    backupInterval: number;
    retentionDays: number;
  };
  api: {
    rateLimit: number;
    timeout: number;
    cacheEnabled: boolean;
    cacheTTL: number;
  };
  notifications: {
    enabled: boolean;
    maxPerUser: number;
    retryAttempts: number;
    batchSize: number;
  };
  monitoring: {
    metricsEnabled: boolean;
    alertThreshold: number;
    healthCheckInterval: number;
    logRetentionDays: number;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    twoFactorRequired: boolean;
  };
}

export const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [activeSection, setActiveSection] = useState<string>('general');

  // Generate mock system configuration
  const generateSystemConfig = (): SystemConfig => {
    return {
      general: {
        systemName: '혼잡도 예측 서비스',
        maintenanceMode: false,
        debugMode: false,
        logLevel: 'info'
      },
      database: {
        connectionTimeout: 30,
        maxConnections: 100,
        backupInterval: 24,
        retentionDays: 90
      },
      api: {
        rateLimit: 1000,
        timeout: 30,
        cacheEnabled: true,
        cacheTTL: 300
      },
      notifications: {
        enabled: true,
        maxPerUser: 50,
        retryAttempts: 3,
        batchSize: 100
      },
      monitoring: {
        metricsEnabled: true,
        alertThreshold: 80,
        healthCheckInterval: 60,
        logRetentionDays: 30
      },
      security: {
        sessionTimeout: 1440,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        twoFactorRequired: false
      }
    };
  };

  useEffect(() => {
    // Simulate API call to load configuration
    setTimeout(() => {
      setConfig(generateSystemConfig());
    }, 500);
  }, []);

  const handleConfigChange = (section: keyof SystemConfig, key: string, value: any) => {
    if (!config) return;
    
    setConfig(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSaveMessage({ type: 'success', message: '설정이 성공적으로 저장되었습니다.' });
    } catch (error) {
      setSaveMessage({ type: 'error', message: '설정 저장 중 오류가 발생했습니다.' });
    } finally {
      setIsSaving(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const sections = [
    { id: 'general', label: '일반 설정', icon: Settings },
    { id: 'database', label: '데이터베이스', icon: Database },
    { id: 'api', label: 'API 설정', icon: Server },
    { id: 'notifications', label: '알림 설정', icon: Bell },
    { id: 'monitoring', label: '모니터링', icon: BarChart3 },
    { id: 'security', label: '보안 설정', icon: Shield }
  ];

  if (!config) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-2 text-gray-600">시스템 설정 로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">시스템 설정</h3>
        <div className="flex items-center space-x-3">
          {saveMessage && (
            <div className={`flex items-center px-3 py-2 rounded-md text-sm ${
              saveMessage.type === 'success' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {saveMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <AlertTriangle className="w-4 h-4 mr-2" />
              )}
              {saveMessage.message}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                설정 저장
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeSection === section.id
                      ? 'bg-red-100 text-red-700 border-r-2 border-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`mr-3 h-4 w-4 ${
                    activeSection === section.id ? 'text-red-700' : 'text-gray-400'
                  }`} />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {/* General Settings */}
            {activeSection === 'general' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">일반 설정</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        시스템 이름
                      </label>
                      <input
                        type="text"
                        value={config.general.systemName}
                        onChange={(e) => handleConfigChange('general', 'systemName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">유지보수 모드</label>
                        <p className="text-xs text-gray-500">활성화 시 사용자 접근이 제한됩니다</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.general.maintenanceMode}
                          onChange={(e) => handleConfigChange('general', 'maintenanceMode', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">디버그 모드</label>
                        <p className="text-xs text-gray-500">개발 및 디버깅용 상세 로그 활성화</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.general.debugMode}
                          onChange={(e) => handleConfigChange('general', 'debugMode', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        로그 레벨
                      </label>
                      <select
                        value={config.general.logLevel}
                        onChange={(e) => handleConfigChange('general', 'logLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="error">Error</option>
                        <option value="warn">Warning</option>
                        <option value="info">Info</option>
                        <option value="debug">Debug</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Database Settings */}
            {activeSection === 'database' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">데이터베이스 설정</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        연결 타임아웃 (초)
                      </label>
                      <input
                        type="number"
                        value={config.database.connectionTimeout}
                        onChange={(e) => handleConfigChange('database', 'connectionTimeout', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        최대 연결 수
                      </label>
                      <input
                        type="number"
                        value={config.database.maxConnections}
                        onChange={(e) => handleConfigChange('database', 'maxConnections', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        백업 주기 (시간)
                      </label>
                      <input
                        type="number"
                        value={config.database.backupInterval}
                        onChange={(e) => handleConfigChange('database', 'backupInterval', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        데이터 보관 기간 (일)
                      </label>
                      <input
                        type="number"
                        value={config.database.retentionDays}
                        onChange={(e) => handleConfigChange('database', 'retentionDays', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Settings */}
            {activeSection === 'api' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">API 설정</h4>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          요청 제한 (분당)
                        </label>
                        <input
                          type="number"
                          value={config.api.rateLimit}
                          onChange={(e) => handleConfigChange('api', 'rateLimit', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          타임아웃 (초)
                        </label>
                        <input
                          type="number"
                          value={config.api.timeout}
                          onChange={(e) => handleConfigChange('api', 'timeout', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">캐시 활성화</label>
                        <p className="text-xs text-gray-500">API 응답 캐싱으로 성능 향상</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.api.cacheEnabled}
                          onChange={(e) => handleConfigChange('api', 'cacheEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    {config.api.cacheEnabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          캐시 TTL (초)
                        </label>
                        <input
                          type="number"
                          value={config.api.cacheTTL}
                          onChange={(e) => handleConfigChange('api', 'cacheTTL', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">알림 설정</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">알림 시스템 활성화</label>
                        <p className="text-xs text-gray-500">전체 알림 기능 활성화/비활성화</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.notifications.enabled}
                          onChange={(e) => handleConfigChange('notifications', 'enabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    {config.notifications.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            사용자당 최대 알림 수
                          </label>
                          <input
                            type="number"
                            value={config.notifications.maxPerUser}
                            onChange={(e) => handleConfigChange('notifications', 'maxPerUser', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            재시도 횟수
                          </label>
                          <input
                            type="number"
                            value={config.notifications.retryAttempts}
                            onChange={(e) => handleConfigChange('notifications', 'retryAttempts', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            배치 크기
                          </label>
                          <input
                            type="number"
                            value={config.notifications.batchSize}
                            onChange={(e) => handleConfigChange('notifications', 'batchSize', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Monitoring Settings */}
            {activeSection === 'monitoring' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">모니터링 설정</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">메트릭 수집 활성화</label>
                        <p className="text-xs text-gray-500">시스템 성능 메트릭 수집</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.monitoring.metricsEnabled}
                          onChange={(e) => handleConfigChange('monitoring', 'metricsEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    {config.monitoring.metricsEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            알림 임계값 (%)
                          </label>
                          <input
                            type="number"
                            value={config.monitoring.alertThreshold}
                            onChange={(e) => handleConfigChange('monitoring', 'alertThreshold', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            헬스체크 주기 (초)
                          </label>
                          <input
                            type="number"
                            value={config.monitoring.healthCheckInterval}
                            onChange={(e) => handleConfigChange('monitoring', 'healthCheckInterval', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            로그 보관 기간 (일)
                          </label>
                          <input
                            type="number"
                            value={config.monitoring.logRetentionDays}
                            onChange={(e) => handleConfigChange('monitoring', 'logRetentionDays', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">보안 설정</h4>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          세션 타임아웃 (분)
                        </label>
                        <input
                          type="number"
                          value={config.security.sessionTimeout}
                          onChange={(e) => handleConfigChange('security', 'sessionTimeout', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          최대 로그인 시도 횟수
                        </label>
                        <input
                          type="number"
                          value={config.security.maxLoginAttempts}
                          onChange={(e) => handleConfigChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          최소 비밀번호 길이
                        </label>
                        <input
                          type="number"
                          value={config.security.passwordMinLength}
                          onChange={(e) => handleConfigChange('security', 'passwordMinLength', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">2단계 인증 필수</label>
                        <p className="text-xs text-gray-500">모든 사용자에게 2단계 인증 강제</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.security.twoFactorRequired}
                          onChange={(e) => handleConfigChange('security', 'twoFactorRequired', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};