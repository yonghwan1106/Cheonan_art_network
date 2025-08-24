'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useApp } from '../../context/AppContext';
import { mockArtists } from '../../data/mockArtists';
import { mockCurators } from '../../data/mockCurators';
import { LogIn, Palette } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'artist' | 'curator'>('artist');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useApp();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Mock authentication logic
      let user = null;
      
      if (userType === 'artist') {
        const artist = mockArtists.find(a => a.email === email);
        if (artist) {
          user = {
            id: artist.id,
            name: artist.name,
            email: artist.email,
            type: 'artist' as const,
            profile: artist
          };
        }
      } else {
        const curator = mockCurators.find(c => c.email === email);
        if (curator) {
          user = {
            id: curator.id,
            name: curator.name,
            email: curator.email,
            type: 'curator' as const,
            profile: curator
          };
        }
      }

      if (user && password === 'password') { // Simple mock password
        login(user);
        router.push('/');
      } else {
        setError('이메일 또는 비밀번호가 잘못되었습니다.');
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Quick login options for demo
  const quickLogin = (email: string, type: 'artist' | 'curator') => {
    setEmail(email);
    setPassword('password');
    setUserType(type);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Palette className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            천안아트네트워크에 오신 것을 환영합니다
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  계정 유형
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType('artist')}
                    className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                      userType === 'artist'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    작가
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('curator')}
                    className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                      userType === 'curator'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    기획자
                  </button>
                </div>
              </div>

              <Input
                label="이메일"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="이메일을 입력하세요"
              />

              <Input
                label="비밀번호"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="비밀번호를 입력하세요"
              />

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? '로그인 중...' : '로그인'}</span>
              </Button>
            </form>

            {/* Demo Quick Login */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-center text-gray-600 mb-4">
                데모용 빠른 로그인
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => quickLogin('minsu.kim@email.com', 'artist')}
                >
                  작가로 로그인 (김민수)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => quickLogin('sujin.lee@cfac.or.kr', 'curator')}
                >
                  기획자로 로그인 (이수진)
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">
                아직 계정이 없으신가요?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  회원가입
                </Link>
              </span>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}