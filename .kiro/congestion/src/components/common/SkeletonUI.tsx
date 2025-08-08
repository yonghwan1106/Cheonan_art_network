import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'md',
  animate = true
}) => {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`
        bg-gray-200 
        ${animate ? 'animate-pulse' : ''} 
        ${roundedClasses[rounded]} 
        ${className}
      `}
      style={style}
    />
  );
};

// Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
    <div className="flex items-center space-x-3 mb-4">
      <Skeleton width={40} height={40} rounded="full" />
      <div className="flex-1">
        <Skeleton height={20} className="mb-2" />
        <Skeleton height={16} width="60%" />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton height={16} />
      <Skeleton height={16} width="80%" />
      <Skeleton height={16} width="90%" />
    </div>
  </div>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string;
}> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => (
  <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
    {/* Header */}
    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} height={20} />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} height={16} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Chart Skeleton
export const ChartSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
    <div className="flex items-center justify-between mb-6">
      <Skeleton height={24} width="30%" />
      <Skeleton height={32} width={100} />
    </div>
    
    {/* Chart area */}
    <div className="relative h-64 mb-4">
      <div className="absolute inset-0 flex items-end justify-between space-x-2">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton
            key={index}
            width="100%"
            height={`${Math.random() * 80 + 20}%`}
            className="flex-1"
          />
        ))}
      </div>
    </div>
    
    {/* Legend */}
    <div className="flex items-center justify-center space-x-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Skeleton width={12} height={12} rounded="full" />
          <Skeleton height={16} width={60} />
        </div>
      ))}
    </div>
  </div>
);

// List Skeleton
export const ListSkeleton: React.FC<{ 
  items?: number; 
  showAvatar?: boolean;
  className?: string;
}> = ({ 
  items = 5, 
  showAvatar = true, 
  className = '' 
}) => (
  <div className={`bg-white rounded-lg shadow-sm divide-y divide-gray-200 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="p-4">
        <div className="flex items-center space-x-3">
          {showAvatar && (
            <Skeleton width={48} height={48} rounded="full" />
          )}
          <div className="flex-1">
            <Skeleton height={20} className="mb-2" />
            <Skeleton height={16} width="70%" className="mb-1" />
            <Skeleton height={14} width="40%" />
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Skeleton height={16} width={60} />
            <Skeleton height={14} width={40} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Dashboard Skeleton
export const DashboardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    {/* Header */}
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton height={32} width={200} className="mb-2" />
          <Skeleton height={20} width={300} />
        </div>
        <Skeleton height={40} width={120} />
      </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton height={16} width="60%" className="mb-2" />
              <Skeleton height={28} width="40%" className="mb-1" />
              <Skeleton height={14} width="80%" />
            </div>
            <Skeleton width={32} height={32} rounded="lg" />
          </div>
        </div>
      ))}
    </div>

    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ListSkeleton />
    </div>
  </div>
);

// Form Skeleton
export const FormSkeleton: React.FC<{ 
  fields?: number; 
  className?: string;
}> = ({ 
  fields = 5, 
  className = '' 
}) => (
  <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
    <Skeleton height={28} width="40%" className="mb-6" />
    
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index}>
          <Skeleton height={20} width="30%" className="mb-2" />
          <Skeleton height={40} className="mb-1" />
          <Skeleton height={14} width="60%" />
        </div>
      ))}
    </div>
    
    <div className="flex justify-end space-x-3 mt-8">
      <Skeleton height={40} width={80} />
      <Skeleton height={40} width={100} />
    </div>
  </div>
);

// Navigation Skeleton
export const NavigationSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white shadow-lg ${className}`}>
    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <Skeleton width={32} height={32} rounded="lg" />
        <Skeleton height={24} width={120} />
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton width={32} height={32} rounded="full" />
        <Skeleton width={32} height={32} rounded="full" />
        <Skeleton width={40} height={40} rounded="full" />
      </div>
    </div>
    
    <nav className="py-4">
      <div className="space-y-1 px-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center px-4 py-3">
            <Skeleton width={20} height={20} className="mr-3" />
            <Skeleton height={16} width={100} />
          </div>
        ))}
      </div>
    </nav>
  </div>
);

// Page Loading Skeleton
export const PageLoadingSkeleton: React.FC<{ 
  type?: 'dashboard' | 'list' | 'form' | 'chart';
  className?: string;
}> = ({ 
  type = 'dashboard', 
  className = '' 
}) => {
  const skeletonComponents = {
    dashboard: DashboardSkeleton,
    list: () => <ListSkeleton items={10} />,
    form: FormSkeleton,
    chart: ChartSkeleton
  };

  const SkeletonComponent = skeletonComponents[type];

  return (
    <div className={`animate-pulse ${className}`}>
      <SkeletonComponent />
    </div>
  );
};