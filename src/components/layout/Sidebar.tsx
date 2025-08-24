'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import UserMenu from '../features/auth/UserMenu';
import { 
  Home, 
  Search, 
  Zap, 
  User, 
  Settings, 
  Heart, 
  MessageSquare, 
  Bell,
  TrendingUp,
  Calendar,
  Bookmark,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { state } = useApp();

  const menuItems = [
    {
      label: '홈',
      href: '/',
      icon: Home,
      forAll: true
    },
    {
      label: '대시보드',
      href: state.user?.type === 'artist' ? '/dashboard/artist' : '/dashboard/curator',
      icon: TrendingUp,
      requiresAuth: true
    },
    {
      label: '프로젝트 찾기',
      href: '/projects',
      icon: Search,
      forAll: true
    },
    {
      label: 'AI 매칭',
      href: '/matching',
      icon: Zap,
      forAll: true
    },
    {
      label: '내 프로필',
      href: '/profile',
      icon: User,
      requiresAuth: true
    },
    {
      label: '찜한 프로젝트',
      href: '/favorites',
      icon: Heart,
      requiresAuth: true,
      forArtist: true
    },
    {
      label: '내 프로젝트',
      href: '/my-projects',
      icon: Bookmark,
      requiresAuth: true,
      forCurator: true
    },
    {
      label: '메시지',
      href: '/messages',
      icon: MessageSquare,
      requiresAuth: true,
      badge: 3
    },
    {
      label: '일정관리',
      href: '/schedule',
      icon: Calendar,
      requiresAuth: true
    },
    {
      label: '성과분석',
      href: '/analytics',
      icon: Award,
      requiresAuth: true,
      forCurator: true
    },
    {
      label: '알림',
      href: '/notifications',
      icon: Bell,
      requiresAuth: true,
      badge: 5
    },
    {
      label: '설정',
      href: '/settings',
      icon: Settings,
      requiresAuth: true
    }
  ];

  // 사용자 타입과 권한에 따라 메뉴 필터링
  const filteredMenuItems = menuItems.filter(item => {
    if (item.forAll) return true;
    if (!state.user && item.requiresAuth) return false;
    if (item.forArtist && state.user?.type !== 'artist') return false;
    if (item.forCurator && state.user?.type !== 'curator') return false;
    return true;
  });

  const isActiveRoute = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* 사이드바 */}
      <div className={`
        fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'w-64' : 'lg:w-64'}
        bg-white border-r border-gray-200 flex flex-col
      `}>
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">천</span>
            </div>
            <span className="font-semibold text-gray-900">아트네트워크</span>
          </div>
          <button
            onClick={onToggle}
            className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* 사용자 정보 (로그인된 경우) */}
        {state.user && (
          <div className="p-4 border-b border-gray-200">
            <UserMenu />
          </div>
        )}

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md
                  transition-colors duration-150 ease-in-out
                  ${isActive
                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
                onClick={() => {
                  // 모바일에서 메뉴 클릭시 사이드바 닫기
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
              >
                <Icon className={`
                  flex-shrink-0 w-5 h-5 mr-3
                  ${isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'}
                `} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="ml-3 inline-block py-0.5 px-2 text-xs bg-red-100 text-red-800 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* 하단 정보 */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">
            천안아트네트워크 v1.0
          </div>
          {!state.user && !state.isLoading && (
            <div className="space-y-2">
              <Link
                href="/login"
                className="block w-full text-center py-2 px-4 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="block w-full text-center py-2 px-4 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// 사이드바 토글 버튼 컴포넌트
interface SidebarToggleProps {
  onClick: () => void;
  isOpen: boolean;
}

export function SidebarToggle({ onClick, isOpen }: SidebarToggleProps) {
  return (
    <button
      onClick={onClick}
      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors lg:hidden"
    >
      {isOpen ? (
        <ChevronLeft className="w-5 h-5" />
      ) : (
        <ChevronRight className="w-5 h-5" />
      )}
    </button>
  );
}