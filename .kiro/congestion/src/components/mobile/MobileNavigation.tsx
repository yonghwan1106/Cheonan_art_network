import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  Calendar, 
  Route, 
  MessageSquare,
  User,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface MobileNavigationProps {
  user?: {
    id: string;
    name: string;
    points: number;
  };
  onNotificationClick?: () => void;
  unreadNotifications?: number;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  user,
  onNotificationClick,
  unreadNotifications = 0
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const navigationItems = [
    { name: '대시보드', href: '/', icon: Home },
    { name: '혼잡도', href: '/congestion', icon: BarChart3 },
    { name: '일정', href: '/schedule', icon: Calendar },
    { name: '경로', href: '/routes', icon: Route },
    { name: '피드백', href: '/feedback', icon: MessageSquare }
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsMenuOpen(false);
  };

  if (!isMobile) {
    return null; // Only show on mobile
  }

  return (
    <>
      {/* Top Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">혼잡도 예측</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Notification Bell */}
            <button
              onClick={onNotificationClick}
              className="relative p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200"
            >
              <Bell className="w-6 h-6" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[20px] h-5">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </button>
            
            {/* User Avatar */}
            {user && (
              <button
                onClick={() => handleNavigation('/profile')}
                className="flex items-center space-x-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.points}P</p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 h-16">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);
            
            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 active:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slide-out Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">메뉴</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            {user && (
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.points} 포인트</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <nav className="py-4">
              <div className="space-y-1 px-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.href);
                  
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className={`w-full flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`mr-4 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Additional Menu Items */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <button
                onClick={() => handleNavigation('/profile')}
                className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
              >
                <User className="mr-4 h-5 w-5 text-gray-400" />
                프로필 설정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed elements */}
      <div className="h-16" /> {/* Top spacer */}
      <div className="h-16" /> {/* Bottom spacer */}
    </>
  );
};