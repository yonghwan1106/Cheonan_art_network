import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Camera,
  Award,
  TrendingUp
} from 'lucide-react';

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  profileImage?: string;
  level: {
    name: string;
    tier: number;
    currentPoints: number;
    nextLevelPoints: number;
  };
  stats: {
    totalTrips: number;
    timeSaved: number;
    co2Saved: number;
    pointsEarned: number;
  };
}

interface UserProfileProps {
  onProfileUpdate?: (profile: UserProfileData) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onProfileUpdate }) => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Load profile data
  useEffect(() => {
    const loadProfile = () => {
      const stored = localStorage.getItem('userProfile');
      if (stored) {
        setProfile(JSON.parse(stored));
      } else {
        // Generate mock profile
        const mockProfile: UserProfileData = {
          id: 'user-001',
          name: '김철수',
          email: 'demo@example.com',
          phone: '010-1234-5678',
          joinDate: '2024-03-15',
          level: {
            name: '실버',
            tier: 3,
            currentPoints: 1250,
            nextLevelPoints: 2000
          },
          stats: {
            totalTrips: 127,
            timeSaved: 340,
            co2Saved: 45.2,
            pointsEarned: 1250
          }
        };
        setProfile(mockProfile);
        localStorage.setItem('userProfile', JSON.stringify(mockProfile));
      }
    };

    loadProfile();
  }, []);

  const handleEditStart = () => {
    if (profile) {
      setEditForm({
        name: profile.name,
        email: profile.email,
        phone: profile.phone
      });
      setIsEditing(true);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditForm({ name: '', email: '', phone: '' });
  };

  const handleEditSave = () => {
    if (profile) {
      const updatedProfile = {
        ...profile,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone
      };
      
      setProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setIsEditing(false);
      onProfileUpdate?.(updatedProfile);
    }
  };

  const handleInputChange = (field: keyof typeof editForm, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const getLevelProgress = () => {
    if (!profile) return 0;
    const { currentPoints, nextLevelPoints } = profile.level;
    return (currentPoints / nextLevelPoints) * 100;
  };

  const getLevelColor = (tier: number) => {
    switch (tier) {
      case 1: return 'text-gray-600 bg-gray-100';
      case 2: return 'text-yellow-600 bg-yellow-100';
      case 3: return 'text-gray-600 bg-gray-200';
      case 4: return 'text-yellow-600 bg-yellow-200';
      case 5: return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                {profile.profileImage ? (
                  <img 
                    src={profile.profileImage} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-blue-600" />
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Camera className="w-3 h-3 text-white" />
              </button>
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-xl font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    placeholder="이름"
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="text-gray-600 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    placeholder="이메일"
                  />
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="text-gray-600 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    placeholder="전화번호"
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                  <div className="flex items-center space-x-1 text-gray-600 mt-1">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600 mt-1">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      가입일: {new Date(profile.joinDate).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleEditSave}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  title="저장"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={handleEditCancel}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                  title="취소"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={handleEditStart}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                title="편집"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Level Information */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getLevelColor(profile.level.tier)}`}>
                {profile.level.name} 레벨
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {profile.level.currentPoints} / {profile.level.nextLevelPoints} P
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getLevelProgress()}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            다음 레벨까지 {profile.level.nextLevelPoints - profile.level.currentPoints}P 남음
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">이용 통계</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{profile.stats.totalTrips}</div>
            <div className="text-sm text-gray-600">총 이용 횟수</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{profile.stats.timeSaved}분</div>
            <div className="text-sm text-gray-600">절약한 시간</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{profile.stats.co2Saved}kg</div>
            <div className="text-sm text-gray-600">CO₂ 절약</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{profile.stats.pointsEarned}P</div>
            <div className="text-sm text-gray-600">획득 포인트</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">최근 활동</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">레벨 업 달성!</p>
              <p className="text-xs text-gray-500">실버 레벨로 승급했습니다</p>
            </div>
            <span className="text-xs text-gray-400">2일 전</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">경로 최적화 완료</p>
              <p className="text-xs text-gray-500">홍익대입구 → 강남 경로에서 15분 절약</p>
            </div>
            <span className="text-xs text-gray-400">3일 전</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Award className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">포인트 적립</p>
              <p className="text-xs text-gray-500">비혼잡 시간대 이용으로 25P 획득</p>
            </div>
            <span className="text-xs text-gray-400">5일 전</span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">성취 배지</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900">첫 이용</h4>
            <p className="text-xs text-gray-500">서비스 첫 이용 완료</p>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900">시간 절약왕</h4>
            <p className="text-xs text-gray-500">100분 이상 절약</p>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg opacity-50">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="text-sm font-medium text-gray-400">환경 지킴이</h4>
            <p className="text-xs text-gray-400">100kg CO₂ 절약 (진행중)</p>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg opacity-50">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="text-sm font-medium text-gray-400">탐험가</h4>
            <p className="text-xs text-gray-400">50개 역 방문 (진행중)</p>
          </div>
        </div>
      </div>
    </div>
  );
};