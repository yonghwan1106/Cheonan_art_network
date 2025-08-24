import React, { useState, useEffect } from 'react';
import { WifiOff, AlertTriangle, RefreshCw, Clock } from 'lucide-react';

interface NetworkError {
  type: 'timeout' | 'server_error' | 'network_error' | 'rate_limit';
  message: string;
  retryable: boolean;
  retryAfter?: number;
}

interface NetworkErrorSimulatorProps {
  onRetry?: () => void;
  error?: NetworkError;
  isVisible?: boolean;
  className?: string;
}

export const NetworkErrorSimulator: React.FC<NetworkErrorSimulatorProps> = ({
  onRetry,
  error,
  isVisible = false,
  className = ''
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [retryCountdown, setRetryCountdown] = useState(0);

  // Mock network errors for demonstration
  const mockErrors: NetworkError[] = [
    {
      type: 'timeout',
      message: '요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.',
      retryable: true
    },
    {
      type: 'server_error',
      message: '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      retryable: true,
      retryAfter: 30
    },
    {
      type: 'network_error',
      message: '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.',
      retryable: true
    },
    {
      type: 'rate_limit',
      message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
      retryable: true,
      retryAfter: 60
    }
  ];

  const currentError = error || mockErrors[0];

  // Countdown timer for retry after
  useEffect(() => {
    if (currentError.retryAfter && retryCountdown > 0) {
      const timer = setTimeout(() => {
        setRetryCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [retryCountdown, currentError.retryAfter]);

  const handleRetry = async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    // Set countdown if retryAfter is specified
    if (currentError.retryAfter) {
      setRetryCountdown(currentError.retryAfter);
    }

    try {
      // Simulate retry delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call retry callback
      onRetry?.();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const getErrorIcon = (type: NetworkError['type']) => {
    switch (type) {
      case 'timeout':
        return <Clock className="w-6 h-6 text-orange-500" />;
      case 'server_error':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'network_error':
        return <WifiOff className="w-6 h-6 text-red-500" />;
      case 'rate_limit':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getErrorColor = (type: NetworkError['type']) => {
    switch (type) {
      case 'timeout':
        return 'border-orange-200 bg-orange-50';
      case 'server_error':
        return 'border-red-200 bg-red-50';
      case 'network_error':
        return 'border-red-200 bg-red-50';
      case 'rate_limit':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const canRetry = currentError.retryable && !isRetrying && retryCountdown === 0;

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 ${className}`}>
      <div className={`border rounded-lg shadow-lg p-4 ${getErrorColor(currentError.type)}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getErrorIcon(currentError.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900">
              네트워크 오류
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {currentError.message}
            </p>
            
            {retryCount > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                재시도 횟수: {retryCount}회
              </p>
            )}
            
            {retryCountdown > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {retryCountdown}초 후 재시도 가능
              </p>
            )}
          </div>
          
          <div className="flex-shrink-0">
            {canRetry ? (
              <button
                onClick={handleRetry}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                재시도
              </button>
            ) : isRetrying ? (
              <div className="inline-flex items-center px-3 py-1 text-sm text-gray-600">
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                재시도 중...
              </div>
            ) : retryCountdown > 0 ? (
              <div className="inline-flex items-center px-3 py-1 text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                {retryCountdown}초
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for simulating network errors
export const useNetworkErrorSimulator = () => {
  const [error, setError] = useState<NetworkError | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const simulateError = (type?: NetworkError['type']) => {
    const errorTypes: NetworkError['type'][] = ['timeout', 'server_error', 'network_error', 'rate_limit'];
    const selectedType = type || errorTypes[Math.floor(Math.random() * errorTypes.length)];
    
    const mockErrors: Record<NetworkError['type'], NetworkError> = {
      timeout: {
        type: 'timeout',
        message: '요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.',
        retryable: true
      },
      server_error: {
        type: 'server_error',
        message: '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        retryable: true,
        retryAfter: 30
      },
      network_error: {
        type: 'network_error',
        message: '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.',
        retryable: true
      },
      rate_limit: {
        type: 'rate_limit',
        message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
        retryable: true,
        retryAfter: 60
      }
    };

    setError(mockErrors[selectedType]);
    setIsVisible(true);
  };

  const clearError = () => {
    setError(null);
    setIsVisible(false);
  };

  const handleRetry = () => {
    console.log('Retrying network request...');
    // Simulate successful retry (50% chance)
    if (Math.random() > 0.5) {
      clearError();
    } else {
      // Simulate another error
      setTimeout(() => {
        simulateError();
      }, 1000);
    }
  };

  return {
    error,
    isVisible,
    simulateError,
    clearError,
    handleRetry
  };
};