'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { LogOut, User, Palette } from 'lucide-react';
import Button from '../common/Button';

export default function Header() {
  const { state, logout } = useApp();
  const { user, isAuthenticated } = state;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Palette className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                천안아트네트워크
              </span>
            </Link>

            <nav className="hidden md:flex space-x-6">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                홈
              </Link>
              <Link 
                href="/projects" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                프로젝트
              </Link>
              <Link 
                href="/matching" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                매칭
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">{user.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {user.type === 'artist' ? '작가' : '기획자'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    회원가입
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}