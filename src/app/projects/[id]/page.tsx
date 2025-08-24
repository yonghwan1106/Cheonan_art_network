'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '../../../components/layout/Layout';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Award, 
  Heart,
  Share2,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Star,
  Eye,
  MessageSquare,
  FileText,
  ExternalLink,
  ArrowRight,
  Info,
  Target,
  Gift
} from 'lucide-react';
import { mockProjects } from '../../../data/mockProjects';
import { mockCurators } from '../../../data/mockCurators';

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  // 프로젝트 데이터 찾기
  const project = mockProjects.find(p => p.id === id);
  const curator = project ? mockCurators.find(c => c.id === project.curatorId) : null;

  if (!project || !curator) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">프로젝트를 찾을 수 없습니다</h1>
            <Button href="/projects">프로젝트 목록으로</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      recruiting: { label: '모집중', color: 'bg-green-100 text-green-800' },
      planning: { label: '기획중', color: 'bg-yellow-100 text-yellow-800' },
      upcoming: { label: '예정', color: 'bg-blue-100 text-blue-800' },
      closed: { label: '마감', color: 'bg-gray-100 text-gray-800' }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.recruiting;
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getDaysUntilDeadline = () => {
    const deadline = new Date(project.timeline.applicationDeadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const tabs = [
    { id: 'overview', label: '개요', icon: Info },
    { id: 'requirements', label: '지원 요건', icon: CheckCircle },
    { id: 'timeline', label: '일정', icon: Calendar },
    { id: 'venue', label: '장소', icon: MapPin },
    { id: 'curator', label: '기획자', icon: Users }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  {getStatusBadge(project.status)}
                  <div className="flex items-center text-sm text-gray-600">
                    <Eye className="w-4 h-4 mr-1" />
                    <span>조회수 1,247</span>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{project.title}</h1>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>지원자 {project.applicantCount}명 / {project.maxParticipants}명</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>마감 {getDaysUntilDeadline()}일 전</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>{(project.budget.min / 10000).toFixed(0)}~{(project.budget.max / 10000).toFixed(0)}만원</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  {isLiked ? '찜 해제' : '찜하기'}
                </Button>
                <Button variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  공유
                </Button>
                {project.status === 'recruiting' && (
                  <Button onClick={() => setIsApplicationModalOpen(true)}>
                    지원하기
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 급한 마감 알림 */}
          {getDaysUntilDeadline() <= 7 && project.status === 'recruiting' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">마감 임박!</h3>
                  <p className="text-sm text-red-700">지원 마감까지 {getDaysUntilDeadline()}일 남았습니다.</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 메인 콘텐츠 */}
            <div className="lg:col-span-2">
              {/* 탭 네비게이션 */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                        className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                          selectedTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* 탭 콘텐츠 */}
              <div className="space-y-6">
                {selectedTab === 'overview' && (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">프로젝트 개요</h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {project.description}
                    </p>
                    
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-3">카테고리</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.categories.map((category) => (
                          <span key={category} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-3">태그</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">대상 관객</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">주요 타겟</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.targetAudience.primary.map((audience) => (
                              <span key={audience} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                {audience}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">부차 타겟</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.targetAudience.secondary.map((audience) => (
                              <span key={audience} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {audience}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        예상 관람객: {project.targetAudience.expectedVisitors.toLocaleString()}명
                      </p>
                    </div>
                  </Card>
                )}

                {selectedTab === 'requirements' && (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">지원 요건</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">경력 수준</h3>
                        <p className="text-gray-700">{project.requirements.experienceLevel}</p>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">나이 제한</h3>
                        <p className="text-gray-700">
                          {project.requirements.ageRange.min}세 ~ {project.requirements.ageRange.max}세
                        </p>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">지역</h3>
                        <div className="flex flex-wrap gap-2">
                          {project.requirements.location.map((loc) => (
                            <span key={loc} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                              {loc}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">포트폴리오</h3>
                        <p className="text-gray-700">최소 {project.requirements.portfolioMinimum}개 작품 제출</p>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">추가 요건</h3>
                        <ul className="space-y-2">
                          {project.requirements.additionalRequirements.map((req, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">선정 기준</h3>
                        <div className="space-y-2">
                          {project.selectionCriteria.map((criteria, index) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-700">{criteria.criteria}</span>
                              <span className="font-medium text-blue-600">{criteria.weight}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {selectedTab === 'timeline' && (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">프로젝트 일정</h2>
                    
                    <div className="space-y-6">
                      <div className="relative">
                        <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-200"></div>
                        
                        <div className="relative flex items-start space-x-4 pb-6">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <Clock className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">지원 마감</h3>
                            <p className="text-gray-600">{project.timeline.applicationDeadline}</p>
                          </div>
                        </div>

                        <div className="relative flex items-start space-x-4 pb-6">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-yellow-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">선정 결과 발표</h3>
                            <p className="text-gray-600">{project.timeline.selectionNotification}</p>
                          </div>
                        </div>

                        <div className="relative flex items-start space-x-4 pb-6">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">준비 기간</h3>
                            <p className="text-gray-600">
                              {project.timeline.preparationPeriod.start} ~ {project.timeline.preparationPeriod.end}
                            </p>
                          </div>
                        </div>

                        <div className="relative flex items-start space-x-4">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Star className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">행사 기간</h3>
                            <p className="text-gray-600">
                              {project.timeline.eventPeriod.start} ~ {project.timeline.eventPeriod.end}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {selectedTab === 'venue' && (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">장소 정보</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">장소명</h3>
                        <p className="text-gray-700">{project.venue.name}</p>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">주소</h3>
                        <div className="flex items-start justify-between">
                          <p className="text-gray-700">{project.venue.address}</p>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            지도 보기
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">공간 정보</h3>
                        <p className="text-gray-700">{project.venue.space}</p>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">제공 시설</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {project.venue.facilities.map((facility, index) => (
                            <div key={index} className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              <span className="text-gray-700">{facility}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {selectedTab === 'curator' && curator && (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">기획자 정보</h2>
                    
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                        {curator.profileImage ? (
                          <img src={curator.profileImage} alt={curator.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                            <Users className="w-8 h-8 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{curator.name}</h3>
                        <p className="text-gray-600">{curator.organization} · {curator.position}</p>
                        <div className="flex items-center mt-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm text-gray-600">
                            {curator.ratings.averageScore} ({curator.ratings.reviewCount}리뷰)
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        프로필 보기
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">소개</h4>
                        <p className="text-gray-700">{curator.bio}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">전문 분야</h4>
                        <div className="flex flex-wrap gap-2">
                          {curator.specialization.map((spec) => (
                            <span key={spec} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">주요 프로젝트</h4>
                        <div className="space-y-3">
                          {curator.pastProjects.slice(0, 2).map((pastProject) => (
                            <div key={pastProject.id} className="border-l-2 border-blue-500 pl-3">
                              <h5 className="font-medium text-gray-900">{pastProject.title}</h5>
                              <p className="text-sm text-gray-600">{pastProject.description}</p>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                <span>{pastProject.year}년</span>
                                <span>참여자 {pastProject.participants}명</span>
                                <span>관람객 {pastProject.visitorCount.toLocaleString()}명</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* 사이드바 */}
            <div className="space-y-6">
              {/* 신청 정보 */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">지원 정보</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">현재 지원자</span>
                    <span className="font-medium">{project.applicantCount}명</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">모집 인원</span>
                    <span className="font-medium">{project.maxParticipants}명</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">경쟁률</span>
                    <span className="font-medium">
                      {project.applicantCount > 0 ? `${(project.applicantCount / project.maxParticipants).toFixed(1)}:1` : '-'}
                    </span>
                  </div>
                  
                  {project.status === 'recruiting' && (
                    <div className="pt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((project.applicantCount / project.maxParticipants) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 text-center">
                        모집률 {Math.round((project.applicantCount / project.maxParticipants) * 100)}%
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* 예산 정보 */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">예산 및 혜택</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-600">예산 범위</span>
                    <p className="font-medium text-lg">
                      {(project.budget.min / 10000).toFixed(0)}~{(project.budget.max / 10000).toFixed(0)}만원
                    </p>
                    <p className="text-xs text-gray-500">({project.budget.currency})</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600 mb-2 block">제공 혜택</span>
                    <div className="space-y-2">
                      {project.benefits.slice(0, 3).map((benefit, index) => (
                        <div key={index} className="flex items-start">
                          <Gift className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </div>
                      ))}
                      {project.benefits.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{project.benefits.length - 3}개 추가 혜택
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* 마감일 카운트다운 */}
              {project.status === 'recruiting' && (
                <Card className="p-6 bg-blue-50 border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">지원 마감</h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {getDaysUntilDeadline()}일
                    </div>
                    <p className="text-sm text-blue-700">남았습니다</p>
                    <p className="text-xs text-blue-600 mt-2">
                      {project.timeline.applicationDeadline}
                    </p>
                  </div>
                </Card>
              )}

              {/* 액션 버튼 */}
              <div className="space-y-3">
                {project.status === 'recruiting' && (
                  <Button 
                    className="w-full" 
                    onClick={() => setIsApplicationModalOpen(true)}
                  >
                    지원하기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
                
                <Button variant="outline" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  기획자에게 문의
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  프로젝트 공유
                </Button>
              </div>

              {/* 관련 프로젝트 */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">관련 프로젝트</h3>
                <div className="space-y-3">
                  {mockProjects
                    .filter(p => p.id !== project.id && 
                      p.categories.some(cat => project.categories.includes(cat)))
                    .slice(0, 2)
                    .map((relatedProject) => (
                    <div key={relatedProject.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                        {relatedProject.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {(relatedProject.budget.min / 10000).toFixed(0)}~{(relatedProject.budget.max / 10000).toFixed(0)}만원
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          마감: {relatedProject.timeline.applicationDeadline}
                        </span>
                        {getStatusBadge(relatedProject.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 지원하기 모달 */}
      <Modal 
        isOpen={isApplicationModalOpen} 
        onClose={() => setIsApplicationModalOpen(false)}
        title="프로젝트 지원하기"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-1">{project.title}</h3>
            <p className="text-sm text-blue-700">지원하기 전 아래 정보를 확인해주세요.</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">필수 제출 서류</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span className="text-sm">포트폴리오 (최소 {project.requirements.portfolioMinimum}개 작품)</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span className="text-sm">작가 소개서</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span className="text-sm">지원 동기서</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              지원 메시지
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={4}
              placeholder="기획자에게 전할 메시지를 입력하세요..."
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">지원 시 안내사항</p>
                <ul className="space-y-1 text-xs">
                  <li>• 지원서 제출 후 수정이 불가합니다.</li>
                  <li>• 선정 결과는 {project.timeline.selectionNotification}에 발표됩니다.</li>
                  <li>• 추가 문의사항은 기획자에게 직접 연락 가능합니다.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsApplicationModalOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setIsApplicationModalOpen(false)}>
              지원서 제출
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}