import React from 'react';
import { useIsMobile, useIsTouchDevice } from '../../hooks/useMediaQuery';

interface MobileCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  onClick,
  className = '',
  padding = 'md',
  shadow = 'sm',
  rounded = 'lg',
  interactive = false
}) => {
  const isMobile = useIsMobile();
  const isTouchDevice = useIsTouchDevice();

  const baseClasses = `
    bg-white border border-gray-200 transition-all duration-200
    ${interactive || onClick ? 'cursor-pointer' : ''}
    ${isTouchDevice && (interactive || onClick) ? 'active:scale-98 active:shadow-sm' : ''}
    ${!isTouchDevice && (interactive || onClick) ? 'hover:shadow-md hover:border-gray-300' : ''}
  `;

  const paddingClasses = {
    sm: isMobile ? 'p-3' : 'p-2',
    md: isMobile ? 'p-4' : 'p-4',
    lg: isMobile ? 'p-6' : 'p-6'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg'
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        ${baseClasses}
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${roundedClasses[rounded]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface MobileCardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const MobileCardHeader: React.FC<MobileCardHeaderProps> = ({
  title,
  subtitle,
  action,
  icon
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={`flex items-center justify-between ${isMobile ? 'mb-4' : 'mb-3'}`}>
      <div className="flex items-center space-x-3">
        {icon && (
          <div className={`flex-shrink-0 ${isMobile ? 'w-8 h-8' : 'w-6 h-6'}`}>
            {icon}
          </div>
        )}
        <div>
          <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-base'}`}>
            {title}
          </h3>
          {subtitle && (
            <p className={`text-gray-500 ${isMobile ? 'text-sm' : 'text-xs'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

interface MobileCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileCardContent: React.FC<MobileCardContentProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
};

interface MobileCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileCardFooter: React.FC<MobileCardFooterProps> = ({
  children,
  className = ''
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={`${isMobile ? 'mt-4 pt-4' : 'mt-3 pt-3'} border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
};