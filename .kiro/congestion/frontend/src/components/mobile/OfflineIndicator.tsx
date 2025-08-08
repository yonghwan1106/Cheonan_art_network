import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

interface OfflineIndicatorProps {
  onRetry?: () => void;
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  onRetry,
  className = ''
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show offline message if already offline
    if (!navigator.onLine) {
      setShowOfflineMessage(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-hide online message after 3 seconds
  useEffect(() => {
    if (isOnline && !showOfflineMessage) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, showOfflineMessage]);

  if (!showOfflineMessage && isOnline) {
    return null;
  }

  return (
    <div className={`fixed top-20 left-4 right-4 z-40 ${className}`}>
      <div className={`
        flex items-center justify-between p-3 rounded-lg shadow-lg transition-all duration-300
        ${isOnline 
          ? 'bg-green-100 border border-green-200 text-green-800' 
          : 'bg-red-100 border border-red-200 text-red-800'
        }
      `}>
        <div className="flex items-center space-x-3">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-600" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-600" />
          )}
          <div>
            <p className="font-medium text-sm">
              {isOnline ? '연결됨' : '오프라인'}
            </p>
            <p className="text-xs opacity-90">
              {isOnline 
                ? '인터넷 연결이 복구되었습니다' 
                : '인터넷 연결을 확인해주세요'
              }
            </p>
          </div>
        </div>
        
        {!isOnline && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center space-x-1 px-3 py-1 bg-red-200 hover:bg-red-300 active:bg-red-400 rounded-md text-red-800 text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>재시도</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Hook for online/offline status
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};