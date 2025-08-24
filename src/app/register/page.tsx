'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { UserPlus, Palette } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'artist' as 'artist' | 'curator',
    location: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        return;
      }

      if (formData.password.length < 6) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }

      // Mock registration success
      setTimeout(() => {
        alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
        router.push('/login');
      }, 1000);

    } catch {
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Palette className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            천안아트네트워크와 함께 새로운 협업을 시작하세요
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  가입 유형 *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('userType', 'artist')}
                    className={`p-4 text-sm font-medium rounded-lg border transition-colors ${
                      formData.userType === 'artist'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">🎨</div>
                      <div>작가</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('userType', 'curator')}
                    className={`p-4 text-sm font-medium rounded-lg border transition-colors ${
                      formData.userType === 'curator'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">📋</div>
                      <div>기획자</div>
                    </div>
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {formData.userType === 'artist' 
                    ? '작품을 창작하고 전시나 공연에 참여하고 싶은 예술가'
                    : '문화예술 프로젝트를 기획하고 관리하는 전문가'
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Input
                  label="이름"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="실명을 입력하세요"
                />

                <Input
                  label="이메일"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder="example@email.com"
                />

                <Input
                  label="비밀번호"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  placeholder="최소 6자 이상"
                />

                <Input
                  label="비밀번호 확인"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  placeholder="비밀번호를 다시 입력하세요"
                />

                <Input
                  label="지역"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  required
                  placeholder="예: 천안, 서울, 부산"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    자기소개 *
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    required
                    rows={3}
                    placeholder={formData.userType === 'artist' 
                      ? '작품 스타일, 주요 경력, 관심 분야 등을 간단히 소개해주세요'
                      : '기획 경험, 전문 분야, 협업 스타일 등을 간단히 소개해주세요'
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

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
                <UserPlus className="w-4 h-4" />
                <span>{loading ? '가입 중...' : '회원가입'}</span>
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  로그인
                </Link>
              </span>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}