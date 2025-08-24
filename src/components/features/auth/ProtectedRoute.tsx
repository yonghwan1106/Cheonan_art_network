'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import Card from '../../common/Card';
import Button from '../../common/Button';
import { Lock, LogIn, User } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredUserType?: 'artist' | 'curator';
  fallback?: ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredUserType, 
  fallback 
}: ProtectedRouteProps) {
  const { state } = useApp();
  const router = useRouter();

  // Show loading spinner while checking auth
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩중...</p>
        </div>
      </div>
    );
  }

  // User not authenticated
  if (!state.isAuthenticated || !state.user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            로그인이 필요합니다
          </h2>
          <p className="text-gray-600 mb-6">
            이 페이지에 접근하려면 먼저 로그인해주세요.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/login')}
              className="w-full flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>로그인</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/register')}
              className="w-full flex items-center justify-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>회원가입</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // User type doesn't match requirement
  if (requiredUserType && state.user.type !== requiredUserType) {
    const requiredTypeName = requiredUserType === 'artist' ? '작가' : '기획자';
    const currentTypeName = state.user.type === 'artist' ? '작가' : '기획자';
    
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            접근 권한이 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            이 페이지는 {requiredTypeName} 전용입니다.<br />
            현재 {currentTypeName}으로 로그인되어 있습니다.
          </p>
          <Button 
            variant="outline"
            onClick={() => router.push('/')}
            className="w-full"
          >
            홈으로 돌아가기
          </Button>
        </Card>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}

// HOC for easier usage
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredUserType?: 'artist' | 'curator'
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requiredUserType={requiredUserType}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}