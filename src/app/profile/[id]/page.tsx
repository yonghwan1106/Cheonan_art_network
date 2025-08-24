'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '../../../components/layout/Layout';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { 
  MapPin, 
  Calendar, 
  Star, 
  Award, 
  Eye, 
  Heart,
  MessageSquare,
  Share2,
  Mail,
  Palette,
  Users,
  TrendingUp
} from 'lucide-react';
import { mockArtists, Artist } from '../../../data/mockArtists';
import { mockCurators, Curator } from '../../../data/mockCurators';

export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // 프로필 데이터 찾기 (실제로는 API 호출)
  const artist = mockArtists.find(a => a.id === id);
  const curator = mockCurators.find(c => c.id === id);
  const profile = artist || curator;
  const profileType = artist ? 'artist' : 'curator';

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">프로필을 찾을 수 없습니다</h1>
            <Button onClick={() => window.location.href = '/'}>홈으로 돌아가기</Button>
          </div>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 이미지/배너 */}
        <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-700 relative">
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end space-x-6">
                {/* 프로필 이미지 */}
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                  {profile.profileImage ? (
                    <img 
                      src={profile.profileImage} 
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Users className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                </div>
                
                {/* 기본 정보 */}
                <div className="flex-1 text-white pb-4">
                  <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {profileType === 'artist' ? 
                        (profile as Artist).location : 
                        (profile as Curator).organization
                      }
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      경력 {profile.experienceYears}년
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-current text-yellow-400" />
                      {profile.ratings.averageScore} ({profile.ratings.reviewCount}리뷰)
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center space-x-3 pb-4">
                  <Button 
                    variant="outline" 
                    className="bg-white text-gray-900 border-white hover:bg-gray-100"
                    onClick={() => setIsContactModalOpen(true)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    연락하기
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-white text-gray-900 border-white hover:bg-gray-100"
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    {isLiked ? '찜 해제' : '찜하기'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-white text-gray-900 border-white hover:bg-gray-100"
                    size="sm"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 메인 콘텐츠 */}
            <div className="lg:col-span-2 space-y-8">
              {/* 소개 */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">소개</h2>
                <p className="text-gray-700 leading-relaxed">
                  {profile.bio}
                </p>
              </Card>

              {/* 작가의 경우: 포트폴리오 */}
              {profileType === 'artist' && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">포트폴리오</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(profile as Artist).portfolio?.map((work, index) => (
                      <div key={work.id} className="group cursor-pointer">
                        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-3">
                          {work.imageUrl ? (
                            <img 
                              src={work.imageUrl} 
                              alt={work.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                              <Palette className="w-12 h-12 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                          {work.title}
                        </h3>
                        <p className="text-sm text-gray-600">{work.medium} · {work.year}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {work.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* 기획자의 경우: 과거 프로젝트 */}
              {profileType === 'curator' && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">주요 프로젝트</h2>
                  <div className="space-y-6">
                    {(profile as Curator).pastProjects?.map((project) => (
                      <div key={project.id} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{project.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>{project.year}년</span>
                              <span>참여자 {project.participants}명</span>
                              <span>관람객 {project.visitorCount.toLocaleString()}명</span>
                              <div className="flex items-center">
                                <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                                <span>{project.satisfaction}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium text-gray-900">{project.budget}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* 수상 경력 */}
              {profileType === 'artist' && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">수상 경력</h2>
                  <div className="space-y-3">
                    {(profile as Artist).awards?.map((award, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Award className="w-5 h-5 text-yellow-600" />
                        <span className="text-gray-700">{award}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* 전시/공연 이력 */}
              {profileType === 'artist' && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">전시 이력</h2>
                  <div className="space-y-3">
                    {(profile as Artist).exhibitions?.map((exhibition, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700">{exhibition}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* 사이드바 */}
            <div className="space-y-6">
              {/* 기본 정보 */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">이메일</label>
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                  
                  {profileType === 'artist' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-600">전문 분야</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {(profile as Artist).genres?.map((genre) => (
                            <span key={genre} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">작업 스타일</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {(profile as Artist).workStyle?.map((style) => (
                            <span key={style} className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded">
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">희망 예산</label>
                        <p className="text-gray-900">
                          {((profile as Artist).preferredBudget?.min / 10000)?.toFixed(0) || 0}만원 ~ {((profile as Artist).preferredBudget?.max / 10000)?.toFixed(0) || 0}만원
                        </p>
                      </div>
                    </>
                  )}

                  {profileType === 'curator' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-600">소속 기관</label>
                        <p className="text-gray-900">{(profile as Curator).organization}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">직책</label>
                        <p className="text-gray-900">{(profile as Curator).position}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">전문 분야</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {(profile as Curator).specialization?.map((spec) => (
                            <span key={spec} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* 태그/키워드 */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">태그</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </Card>

              {/* 통계 */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">활동 통계</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">프로필 조회</span>
                    </div>
                    <span className="text-sm font-medium">1,247회</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">찜하기</span>
                    </div>
                    <span className="text-sm font-medium">89명</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">매칭율</span>
                    </div>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                </div>
              </Card>

              {/* 연락하기 버튼 */}
              <Button 
                className="w-full" 
                onClick={() => setIsContactModalOpen(true)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                연락하기
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 연락하기 모달 */}
      <Modal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)}
        title={`${profile.name}님께 연락하기`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연락 방법 선택
            </label>
            <div className="space-y-3">
              <button className="w-full flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Mail className="w-5 h-5 text-gray-500 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">이메일로 연락</div>
                  <div className="text-sm text-gray-600">{profile.email}</div>
                </div>
              </button>
              
              <button className="w-full flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <MessageSquare className="w-5 h-5 text-gray-500 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">플랫폼 메시지 보내기</div>
                  <div className="text-sm text-gray-600">안전한 플랫폼 내 메시징</div>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-4">
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={4}
              placeholder="메시지를 입력하세요..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsContactModalOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setIsContactModalOpen(false)}>
              메시지 보내기
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}