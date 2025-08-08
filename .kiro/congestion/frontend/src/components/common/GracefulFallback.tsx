import React, { useState, useEffect, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Skeleton } from './SkeletonUI';

interface FallbackProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  loadingFallback?: ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  retry?: () => void;
  showErrorDetails?: boolean;
  className?: string;
}

export const GracefulFallback: React.FC<FallbackProps> = ({
  children,
  fallback,
  errorFallback,
  loadingFallback,
  isLoading = false,
  error = null,
  retry,
  showErrorDetails = false,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Loading state
  if (isLoading) {
    if (loadingFallback) {
      return <div className={className}>{loadingFallback}</div>;
    }
    
    return (
      <div className={`animate-pulse ${className}`}>
        <Skeleton height={200} />
      </div>
    );
  }

  // Error state
  if (error) {
    if (errorFallback) {
      return <div className={className}>{errorFallback}</div>;
    }

    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-red-800">
              데이터를 불러올 수 없습니다
            </h4>
            <p className="text-sm text-red-700 mt-1">
              일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
            
            {showErrorDetails && (
              <div className="mt-3 p-3 bg-red-100 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-red-800">오류 세부사항</span>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-red-600 hover:text-red-800"
                  >
                    {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {showDetails && (
                  <div className="text-xs font-mono text-red-700 break-all">
                    {error.message}
                  </div>
                )}
              </div>
            )}
            
            {retry && (
              <button
                onClick={retry}
                className="mt-3 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                다시 시도
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback for missing data
  if (!children && fallback) {
    return <div className={className}>{fallback}</div>;
  }

  // Normal state
  return <div className={className}>{children}</div>;
};

// Specific fallback components
export const DataFallback: React.FC<{
  data: any;
  isLoading?: boolean;
  error?: Error | null;
  retry?: () => void;
  emptyMessage?: string;
  children: ReactNode;
  className?: string;
}> = ({
  data,
  isLoading = false,
  error = null,
  retry,
  emptyMessage = '데이터가 없습니다',
  children,
  className = ''
}) => {
  const isEmpty = !data || (Array.isArray(data) && data.length === 0) || 
                  (typeof data === 'object' && Object.keys(data).length === 0);

  return (
    <GracefulFallback
      isLoading={isLoading}
      error={error}
      retry={retry}
      className={className}
      fallback={
        isEmpty ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">{emptyMessage}</p>
          </div>
        ) : null
      }
    >
      {!isEmpty && children}
    </GracefulFallback>
  );
};

// List fallback
export const ListFallback: React.FC<{
  items: any[];
  isLoading?: boolean;
  error?: Error | null;
  retry?: () => void;
  emptyMessage?: string;
  children: ReactNode;
  className?: string;
}> = ({
  items,
  isLoading = false,
  error = null,
  retry,
  emptyMessage = '항목이 없습니다',
  children,
  className = ''
}) => {
  return (
    <DataFallback
      data={items}
      isLoading={isLoading}
      error={error}
      retry={retry}
      emptyMessage={emptyMessage}
      className={className}
    >
      {children}
    </DataFallback>
  );
};

// Chart fallback
export const ChartFallback: React.FC<{
  data: any;
  isLoading?: boolean;
  error?: Error | null;
  retry?: () => void;
  children: ReactNode;
  className?: string;
}> = ({
  data,
  isLoading = false,
  error = null,
  retry,
  children,
  className = ''
}) => {
  return (
    <GracefulFallback
      isLoading={isLoading}
      error={error}
      retry={retry}
      className={className}
      loadingFallback={
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="flex justify-center space-x-4">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      }
      fallback={
        !data ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">차트 데이터가 없습니다</p>
            </div>
          </div>
        ) : null
      }
    >
      {data && children}
    </GracefulFallback>
  );
};

// Image fallback
export const ImageFallback: React.FC<{
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  onError?: () => void;
}> = ({
  src,
  alt,
  fallbackSrc,
  className = '',
  onError
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setError(false);
    setLoading(true);
  }, [src]);

  const handleError = () => {
    setError(true);
    setLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setLoading(false);
  };

  if (error && !fallbackSrc) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400">
          <svg className="mx-auto h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">이미지를 불러올 수 없습니다</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded"></div>
      )}
      <img
        src={error && fallbackSrc ? fallbackSrc : src}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200 w-full h-full object-cover`}
      />
    </div>
  );
};