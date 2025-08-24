import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Wifi, 
  Cpu, 
  HardDrive,
  Monitor,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    inbound: number;
    outbound: number;
    latency: number;
  };
  database: {
    connections: number;
    maxConnections: number;
    queryTime: number;
    status: 'healthy' | 'warning' | 'error';
  };
  services: Array<{
    name: string;
    status: 'running' | 'stopped' | 'error';
    uptime: string;
    memory: number;
    cpu: number;
  }>;
}

export const SystemMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Generate mock system metrics
  const generateMetrics = (): SystemMetrics => {
    return {
      cpu: {
        usage: Math.floor(Math.random() * 30) + 20, // 20-50%
        cores: 8,
        temperature: Math.floor(Math.random() * 20) + 45 // 45-65°C
      },
      memory: {
        used: Math.floor(Math.random() * 4) + 6, // 6-10 GB
        total: 16,
        percentage: 0
      },
      disk: {
        used: Math.floor(Math.random() * 100) + 200, // 200-300 GB
        total: 500,
        percentage: 0
      },
      network: {
        inbound: Math.floor(Math.random() * 50) + 10, // 10-60 Mbps
        outbound: Math.floor(Math.random() * 30) + 5, // 5-35 Mbps
        latency: Math.floor(Math.random() * 20) + 10 // 10-30 ms
      },
      database: {
        connections: Math.floor(Math.random() * 50) + 20,
        maxConnections: 100,
        queryTime: Math.floor(Math.random() * 50) + 10,
        status: Math.random() > 0.8 ? 'warning' : 'healthy'
      },
      services: [
        {
          name: 'API Server',
          status: 'running',
          uptime: '15d 8h 23m',
          memory: Math.floor(Math.random() * 500) + 200,
          cpu: Math.floor(Math.random() * 20) + 5
        },
        {
          name: 'WebSocket Server',
          status: 'running',
          uptime: '15d 8h 23m',
          memory: Math.floor(Math.random() * 200) + 100,
          cpu: Math.floor(Math.random() * 15) + 3
        },
        {
          name: 'Prediction Engine',
          status: 'running',
          uptime: '12d 4h 15m',
          memory: Math.floor(Math.random() * 800) + 400,
          cpu: Math.floor(Math.random() * 40) + 15
        },
        {
          name: 'Data Collector',
          status: 'running',
          uptime: '15d 8h 23m',
          memory: Math.floor(Math.random() * 300) + 150,
          cpu: Math.floor(Math.random() * 25) + 8
        },
        {
          name: 'Cache Service',
          status: Math.random() > 0.9 ? 'error' : 'running',
          uptime: '7d 12h 45m',
          memory: Math.floor(Math.random() * 400) + 200,
          cpu: Math.floor(Math.random() * 10) + 2
        }
      ]
    };
  };

  const loadMetrics = async () => {
    setIsRefreshing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newMetrics = generateMetrics();
    newMetrics.memory.percentage = Math.round((newMetrics.memory.used / newMetrics.memory.total) * 100);
    newMetrics.disk.percentage = Math.round((newMetrics.disk.used / newMetrics.disk.total) * 100);
    
    setMetrics(newMetrics);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'stopped':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'error':
      case 'stopped':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-2 text-gray-600">시스템 메트릭 로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">시스템 리소스 모니터링</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR')}
          </span>
          <button
            onClick={loadMetrics}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>
      </div>

      {/* Resource Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">CPU</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{metrics.cpu.usage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(metrics.cpu.usage)}`}
              style={{ width: `${metrics.cpu.usage}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500">
            <p>{metrics.cpu.cores} 코어 • {metrics.cpu.temperature}°C</p>
          </div>
        </div>

        {/* Memory */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">메모리</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{metrics.memory.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(metrics.memory.percentage)}`}
              style={{ width: `${metrics.memory.percentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500">
            <p>{metrics.memory.used}GB / {metrics.memory.total}GB</p>
          </div>
        </div>

        {/* Disk */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">디스크</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{metrics.disk.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(metrics.disk.percentage)}`}
              style={{ width: `${metrics.disk.percentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500">
            <p>{metrics.disk.used}GB / {metrics.disk.total}GB</p>
          </div>
        </div>

        {/* Network */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Wifi className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-gray-900">네트워크</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{metrics.network.latency}ms</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">인바운드</span>
              <span className="font-medium">{metrics.network.inbound} Mbps</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">아웃바운드</span>
              <span className="font-medium">{metrics.network.outbound} Mbps</span>
            </div>
          </div>
        </div>
      </div>

      {/* Database Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <Database className="w-5 h-5 text-blue-600 mr-2" />
            데이터베이스 상태
          </h4>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(metrics.database.status)}`}>
            {getStatusIcon(metrics.database.status)}
            <span className="ml-1 capitalize">{metrics.database.status}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{metrics.database.connections}</p>
            <p className="text-sm text-gray-500">활성 연결 / {metrics.database.maxConnections}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{metrics.database.queryTime}ms</p>
            <p className="text-sm text-gray-500">평균 쿼리 시간</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">99.9%</p>
            <p className="text-sm text-gray-500">가용성</p>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Server className="w-5 h-5 text-green-600 mr-2" />
          서비스 상태
        </h4>
        
        <div className="space-y-3">
          {metrics.services.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                  {getStatusIcon(service.status)}
                  <span className="ml-1 capitalize">{service.status}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{service.name}</p>
                  <p className="text-sm text-gray-500">가동시간: {service.uptime}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <p className="font-medium text-gray-900">{service.memory}MB</p>
                  <p className="text-gray-500">메모리</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">{service.cpu}%</p>
                  <p className="text-gray-500">CPU</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
          성능 트렌드 (24시간)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-green-500 mr-1" />
              <span className="text-sm font-medium text-green-600">+2.3%</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">응답 시간 개선</p>
            <p className="text-sm text-gray-500">평균 145ms → 142ms</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500 mr-1" />
              <span className="text-sm font-medium text-blue-600">+15.7%</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">처리량 증가</p>
            <p className="text-sm text-gray-500">시간당 3,247 → 3,756 요청</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingDown className="w-5 h-5 text-red-500 mr-1" />
              <span className="text-sm font-medium text-red-600">-0.8%</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">오류율 감소</p>
            <p className="text-sm text-gray-500">0.12% → 0.11%</p>
          </div>
        </div>
      </div>
    </div>
  );
};