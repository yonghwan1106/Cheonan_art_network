'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 메인 푸터 콘텐츠 */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 브랜드 정보 */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">천</span>
              </div>
              <span className="text-xl font-bold">천안아트네트워크</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              AI 기반 예술가-기획자 매칭 플랫폼으로<br />
              천안 지역의 문화예술 발전에 기여합니다.
            </p>
            
            {/* 소셜 미디어 */}
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* 서비스 링크 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">서비스</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/projects" className="text-gray-300 hover:text-white transition-colors text-sm">
                  프로젝트 찾기
                </Link>
              </li>
              <li>
                <Link href="/matching" className="text-gray-300 hover:text-white transition-colors text-sm">
                  AI 매칭
                </Link>
              </li>
              <li>
                <Link href="/register?type=artist" className="text-gray-300 hover:text-white transition-colors text-sm">
                  작가 등록
                </Link>
              </li>
              <li>
                <Link href="/register?type=curator" className="text-gray-300 hover:text-white transition-colors text-sm">
                  기획자 등록
                </Link>
              </li>
            </ul>
          </div>

          {/* 지원 및 정보 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">지원</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  이용 가이드
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  자주 묻는 질문
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  고객 지원
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  공지사항
                </a>
              </li>
            </ul>
          </div>

          {/* 연락처 정보 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">연락처</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <MapPin className="w-4 h-4" />
                <span>충남 천안시 동남구 문화로 100</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Phone className="w-4 h-4" />
                <span>041-123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Mail className="w-4 h-4" />
                <span>info@cheonan-art.network</span>
              </div>
            </div>

            {/* 운영 시간 */}
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium mb-2">운영 시간</h4>
              <div className="text-xs text-gray-300 space-y-1">
                <div>평일: 09:00 - 18:00</div>
                <div>주말: 10:00 - 17:00</div>
                <div className="text-red-300">공휴일 휴무</div>
              </div>
            </div>
          </div>
        </div>

        {/* Competition Notice */}
        <div className="border-t border-gray-800 py-6">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">🏆</span>
              </div>
              <span className="text-blue-200 font-medium text-center">
                2025 문화예술 아이디어 공모전 출품작
              </span>
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">🏆</span>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
              <span>© {currentYear} 천안아트네트워크. All rights reserved.</span>
              <div className="flex space-x-4">
                <Link href="/privacy" className="hover:text-white transition-colors">
                  개인정보처리방침
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors">
                  이용약관
                </Link>
                <Link href="/contact" className="hover:text-white transition-colors">
                  문의하기
                </Link>
              </div>
            </div>
            
            {/* 파트너/후원 기관 */}
            <div className="text-xs text-gray-500">
              <span>후원: 천안시 · 충남문화재단 · 한국문화예술위원회</span>
            </div>
          </div>
          
          {/* 기술 정보 */}
          <div className="mt-6 pt-4 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              Powered by AI Technology · Developed with ❤️ by Claude Code
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}