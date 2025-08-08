import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

interface NotificationBellProps {
  onClick: () => void;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onClick,
  className = ''
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // Mock unread count simulation
  useEffect(() => {
    // Simulate initial unread count
    setUnreadCount(3);

    // Simulate new notifications arriving
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every 30 seconds
        setUnreadCount(prev => prev + 1);
        setHasNewNotification(true);
        
        // Reset animation after 2 seconds
        setTimeout(() => {
          setHasNewNotification(false);
        }, 2000);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    onClick();
    // Reset new notification indicator when bell is clicked
    setHasNewNotification(false);
  };

  return (
    <button
      onClick={handleClick}
      className={`relative p-2 text-gray-600 hover:text-gray-900 transition-colors ${className}`}
      title={`알림 ${unreadCount > 0 ? `(${unreadCount}개 읽지 않음)` : ''}`}
    >
      <Bell 
        className={`w-6 h-6 transition-all duration-200 ${
          hasNewNotification ? 'animate-bounce text-blue-600' : ''
        }`} 
      />
      
      {unreadCount > 0 && (
        <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 rounded-full min-w-[20px] h-5 transition-all duration-200 ${
          hasNewNotification 
            ? 'bg-blue-600 animate-pulse' 
            : 'bg-red-600'
        }`}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      
      {hasNewNotification && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-ping"></span>
      )}
    </button>
  );
};