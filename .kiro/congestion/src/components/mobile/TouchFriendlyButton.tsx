import React from 'react';
import { useIsTouchDevice } from '../../hooks/useMediaQuery';

interface TouchFriendlyButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon,
  fullWidth = false
}) => {
  const isTouchDevice = useIsTouchDevice();

  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${fullWidth ? 'w-full' : ''}
    ${isTouchDevice ? 'active:scale-95' : 'hover:scale-105'}
  `;

  const variantClasses = {
    primary: `
      bg-blue-600 text-white border border-blue-600
      ${!disabled && !isTouchDevice ? 'hover:bg-blue-700 hover:border-blue-700' : ''}
      ${!disabled && isTouchDevice ? 'active:bg-blue-700' : ''}
      focus:ring-blue-500
    `,
    secondary: `
      bg-gray-600 text-white border border-gray-600
      ${!disabled && !isTouchDevice ? 'hover:bg-gray-700 hover:border-gray-700' : ''}
      ${!disabled && isTouchDevice ? 'active:bg-gray-700' : ''}
      focus:ring-gray-500
    `,
    outline: `
      bg-transparent text-blue-600 border border-blue-600
      ${!disabled && !isTouchDevice ? 'hover:bg-blue-50' : ''}
      ${!disabled && isTouchDevice ? 'active:bg-blue-50' : ''}
      focus:ring-blue-500
    `,
    ghost: `
      bg-transparent text-gray-600 border border-transparent
      ${!disabled && !isTouchDevice ? 'hover:bg-gray-100' : ''}
      ${!disabled && isTouchDevice ? 'active:bg-gray-100' : ''}
      focus:ring-gray-500
    `
  };

  const sizeClasses = {
    sm: isTouchDevice ? 'px-4 py-3 text-sm min-h-[44px]' : 'px-3 py-2 text-sm',
    md: isTouchDevice ? 'px-6 py-3 text-base min-h-[48px]' : 'px-4 py-2 text-base',
    lg: isTouchDevice ? 'px-8 py-4 text-lg min-h-[52px]' : 'px-6 py-3 text-lg'
  };

  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};