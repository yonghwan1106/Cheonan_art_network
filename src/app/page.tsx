'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Palette, Users, Zap, Award, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroSlides = [
    {
      id: 1,
      title: "천안아트네트워크",
      subtitle: "AI 기반 예술가-기획자 매칭 플랫폼",
      description: "천안의 재능 있는 예술가들과 전문 기획자들을 똑똑하게 연결하여 최적의 문화예술 프로젝트를 만들어갑니다.",
      backgroundStyle: {
        background: 'linear-gradient(to bottom right, #2563eb, #7c3aed, #3730a3)'
      },
      primaryButton: { text: "지금 시작하기", href: "/register" },
      secondaryButton: { text: "프로젝트 둘러보기", href: "/projects" }
    },
    {
      id: 2,
      title: "AI 매칭 시스템",
      subtitle: "완벽한 협업 파트너를 찾아드립니다",
      description: "작품 스타일, 경력, 예산을 종합 분석하여 95%의 높은 매칭 성공률로 최적의 예술가와 기획자를 연결합니다.",
      backgroundStyle: {
        background: 'linear-gradient(to bottom right, #059669, #0f766e, #155e75)'
      },
      primaryButton: { text: "AI 매칭 체험하기", href: "/matching" },
      secondaryButton: { text: "성공 사례 보기", href: "/projects" }
    },
    {
      id: 3,
      title: "검증된 전문가 네트워크",
      subtitle: "신뢰할 수 있는 예술 파트너십",
      description: "엄선된 150명의 예술가와 50명의 전문 기획자들이 200개 이상의 성공적인 문화예술 프로젝트를 함께 만들어왔습니다.",
      backgroundStyle: {
        background: 'linear-gradient(to bottom right, #dc2626, #be185d, #7c3aed)'
      },
      primaryButton: { text: "전문가 둘러보기", href: "/projects" },
      secondaryButton: { text: "성과 확인하기", href: "/projects" }
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentSlideData = heroSlides[currentSlide];

  return (
    <Layout>
      {/* Hero Section with Slider */}
      <section 
        className="relative overflow-hidden text-white transition-all duration-1000 ease-in-out"
        style={currentSlideData.backgroundStyle}
      >
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-200"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-200"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeIn">
              {currentSlideData.title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fadeIn delay-100">
              {currentSlideData.subtitle}
            </p>
            <p className="text-lg mb-12 text-white/80 max-w-3xl mx-auto animate-fadeIn delay-200">
              {currentSlideData.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn delay-300">
              <Link href={currentSlideData.primaryButton.href}>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-800 font-semibold transform hover:scale-105 transition-all duration-200">
                  {currentSlideData.primaryButton.text}
                </Button>
              </Link>
              <Link href={currentSlideData.secondaryButton.href}>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-800 transform hover:scale-105 transition-all duration-200">
                  {currentSlideData.secondaryButton.text}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex space-x-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              왜 천안아트네트워크를 선택해야 할까요?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              AI 기술과 예술 전문성이 만나 최적의 협업 파트너를 찾아드립니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI 매칭 시스템</h3>
              <p className="text-gray-600 text-sm">
                작품 스타일, 경력, 예산 등을 종합 분석하여 최적의 매칭을 제공합니다.
              </p>
            </Card>

            <Card className="text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">전문가 네트워크</h3>
              <p className="text-gray-600 text-sm">
                검증된 예술가와 기획자들만이 활동하는 신뢰할 수 있는 플랫폼입니다.
              </p>
            </Card>

            <Card className="text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">다양한 장르</h3>
              <p className="text-gray-600 text-sm">
                회화, 조각, 음악, 퍼포먼스 등 모든 예술 장르를 아우르는 플랫폼입니다.
              </p>
            </Card>

            <Card className="text-center">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">성공 보장</h3>
              <p className="text-gray-600 text-sm">
                데이터 기반 매칭으로 프로젝트 성공률을 극대화합니다.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
              <div className="text-gray-600">등록된 예술가</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">전문 기획자</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">200+</div>
              <div className="text-gray-600">성공한 프로젝트</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            당신의 예술적 여정을 시작해보세요
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            천안아트네트워크와 함께 새로운 협업의 기회를 발견하고,
            더 큰 무대에서 여러분의 재능을 선보이세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?type=artist">
              <Button size="lg" className="flex items-center space-x-2">
                <span>작가로 참여하기</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/register?type=curator">
              <Button variant="outline" size="lg" className="flex items-center space-x-2">
                <span>기획자로 참여하기</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
