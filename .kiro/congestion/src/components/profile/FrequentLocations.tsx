import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Home, 
  Briefcase, 
  Heart, 
  Star,
  Clock,
  Save,
  X
} from 'lucide-react';

interface FrequentLocation {
  id: string;
  name: string;
  address: string;
  type: 'home' | 'work' | 'favorite' | 'other';
  coordinates?: {
    lat: number;
    lng: number;
  };
  visitCount: number;
  lastVisited: string;
  alias?: string;
}

interface FrequentLocationsProps {
  onLocationUpdate?: (locations: FrequentLocation[]) => void;
}

export const FrequentLocations: React.FC<FrequentLocationsProps> = ({ onLocationUpdate }) => {
  const [locations, setLocations] = useState<FrequentLocation[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    type: 'other' as FrequentLocation['type'],
    alias: ''
  });

  // Seoul landmarks for quick selection
  const seoulLandmarks = [
    { name: '강남역', address: '서울특별시 강남구 강남대로 지하 396' },
    { name: '홍익대학교', address: '서울특별시 마포구 와우산로 94' },
    { name: '명동', address: '서울특별시 중구 명동길' },
    { name: '잠실역', address: '서울특별시 송파구 올림픽로 지하 265' },
    { name: '신촌역', address: '서울특별시 서대문구 신촌로 지하 120' },
    { name: '이태원', address: '서울특별시 용산구 이태원로' },
    { name: '여의도', address: '서울특별시 영등포구 여의도동' },
    { name: '종로3가', address: '서울특별시 종로구 종로 지하 99' },
    { name: '건대입구', address: '서울특별시 광진구 능동로 지하 110' },
    { name: '신림역', address: '서울특별시 관악구 신림로 지하 340' },
    { name: '노원역', address: '서울특별시 노원구 노원로 지하 1414' },
    { name: '수원역', address: '경기도 수원시 팔달구 덕영대로 924' }
  ];

  // Load locations from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('frequentLocations');
    if (stored) {
      setLocations(JSON.parse(stored));
    } else {
      // Initialize with sample data
      const sampleLocations: FrequentLocation[] = [
        {
          id: 'loc-1',
          name: '집',
          address: '서울특별시 마포구 와우산로 94',
          type: 'home',
          visitCount: 45,
          lastVisited: '2025-01-07T22:30:00Z',
          alias: '우리집'
        },
        {
          id: 'loc-2',
          name: '회사',
          address: '서울특별시 강남구 강남대로 지하 396',
          type: 'work',
          visitCount: 38,
          lastVisited: '2025-01-07T18:00:00Z',
          alias: '직장'
        },
        {
          id: 'loc-3',
          name: '명동',
          address: '서울특별시 중구 명동길',
          type: 'favorite',
          visitCount: 12,
          lastVisited: '2025-01-05T15:30:00Z',
          alias: '쇼핑'
        }
      ];
      setLocations(sampleLocations);
      localStorage.setItem('frequentLocations', JSON.stringify(sampleLocations));
    }
  }, []);

  const getLocationIcon = (type: FrequentLocation['type']) => {
    switch (type) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'work': return <Briefcase className="w-4 h-4" />;
      case 'favorite': return <Heart className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getLocationTypeText = (type: FrequentLocation['type']) => {
    switch (type) {
      case 'home': return '집';
      case 'work': return '직장';
      case 'favorite': return '즐겨찾기';
      default: return '기타';
    }
  };

  const getLocationTypeColor = (type: FrequentLocation['type']) => {
    switch (type) {
      case 'home': return 'text-green-600 bg-green-100';
      case 'work': return 'text-blue-600 bg-blue-100';
      case 'favorite': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setNewLocation({ name: '', address: '', type: 'other', alias: '' });
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
    setNewLocation({ name: '', address: '', type: 'other', alias: '' });
  };

  const handleSaveNew = () => {
    if (!newLocation.name || !newLocation.address) {
      alert('이름과 주소를 모두 입력해주세요.');
      return;
    }

    const location: FrequentLocation = {
      id: `loc-${Date.now()}`,
      name: newLocation.name,
      address: newLocation.address,
      type: newLocation.type,
      alias: newLocation.alias,
      visitCount: 0,
      lastVisited: new Date().toISOString()
    };

    const updatedLocations = [...locations, location];
    setLocations(updatedLocations);
    localStorage.setItem('frequentLocations', JSON.stringify(updatedLocations));
    onLocationUpdate?.(updatedLocations);
    
    setIsAddingNew(false);
    setNewLocation({ name: '', address: '', type: 'other', alias: '' });
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = (id: string, updatedData: Partial<FrequentLocation>) => {
    const updatedLocations = locations.map(loc =>
      loc.id === id ? { ...loc, ...updatedData } : loc
    );
    setLocations(updatedLocations);
    localStorage.setItem('frequentLocations', JSON.stringify(updatedLocations));
    onLocationUpdate?.(updatedLocations);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('이 장소를 삭제하시겠습니까?')) {
      const updatedLocations = locations.filter(loc => loc.id !== id);
      setLocations(updatedLocations);
      localStorage.setItem('frequentLocations', JSON.stringify(updatedLocations));
      onLocationUpdate?.(updatedLocations);
    }
  };

  const handleQuickAdd = (landmark: { name: string; address: string }) => {
    setNewLocation({
      name: landmark.name,
      address: landmark.address,
      type: 'favorite',
      alias: ''
    });
    setIsAddingNew(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">자주 가는 장소</h3>
          <p className="text-sm text-gray-600">자주 방문하는 장소를 등록하여 빠르게 검색하세요</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          장소 추가
        </button>
      </div>

      {/* Add New Location Form */}
      {isAddingNew && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">새 장소 추가</h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  장소명 *
                </label>
                <input
                  type="text"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="예: 강남역, 우리집"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  별칭 (선택)
                </label>
                <input
                  type="text"
                  value={newLocation.alias}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, alias: e.target.value }))}
                  placeholder="예: 우리집, 직장"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주소 *
              </label>
              <input
                type="text"
                value={newLocation.address}
                onChange={(e) => setNewLocation(prev => ({ ...prev, address: e.target.value }))}
                placeholder="서울특별시 강남구 강남대로 지하 396"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                장소 유형
              </label>
              <select
                value={newLocation.type}
                onChange={(e) => setNewLocation(prev => ({ ...prev, type: e.target.value as any }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="home">집</option>
                <option value="work">직장</option>
                <option value="favorite">즐겨찾기</option>
                <option value="other">기타</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelAdd}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSaveNew}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add from Seoul Landmarks */}
      {isAddingNew && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="text-sm font-medium text-blue-900 mb-3">서울 주요 장소 빠른 추가</h5>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {seoulLandmarks.map((landmark) => (
              <button
                key={landmark.name}
                onClick={() => handleQuickAdd(landmark)}
                className="text-left p-2 text-sm text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
              >
                {landmark.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Locations List */}
      <div className="space-y-4">
        {locations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            isEditing={editingId === location.id}
            onEdit={() => handleEdit(location.id)}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={(updatedData) => handleSaveEdit(location.id, updatedData)}
            onDelete={() => handleDelete(location.id)}
            getLocationIcon={getLocationIcon}
            getLocationTypeText={getLocationTypeText}
            getLocationTypeColor={getLocationTypeColor}
          />
        ))}
      </div>

      {locations.length === 0 && !isAddingNew && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">등록된 장소가 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">
            자주 방문하는 장소를 추가하여 빠르게 경로를 검색하세요.
          </p>
          <div className="mt-6">
            <button
              onClick={handleAddNew}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              첫 번째 장소 추가
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      {locations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">이용 통계</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{locations.length}</div>
              <div className="text-sm text-gray-600">등록된 장소</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {locations.reduce((sum, loc) => sum + loc.visitCount, 0)}
              </div>
              <div className="text-sm text-gray-600">총 방문 횟수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.max(...locations.map(loc => loc.visitCount))}
              </div>
              <div className="text-sm text-gray-600">최다 방문</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Location Card Component
interface LocationCardProps {
  location: FrequentLocation;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (data: Partial<FrequentLocation>) => void;
  onDelete: () => void;
  getLocationIcon: (type: FrequentLocation['type']) => React.ReactNode;
  getLocationTypeText: (type: FrequentLocation['type']) => string;
  getLocationTypeColor: (type: FrequentLocation['type']) => string;
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  isEditing,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  getLocationIcon,
  getLocationTypeText,
  getLocationTypeColor
}) => {
  const [editData, setEditData] = useState({
    name: location.name,
    address: location.address,
    type: location.type,
    alias: location.alias || ''
  });

  const handleSave = () => {
    onSaveEdit(editData);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">장소명</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">별칭</label>
              <input
                type="text"
                value={editData.alias}
                onChange={(e) => setEditData(prev => ({ ...prev, alias: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
            <input
              type="text"
              value={editData.address}
              onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">유형</label>
            <select
              value={editData.type}
              onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value as any }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="home">집</option>
              <option value="work">직장</option>
              <option value="favorite">즐겨찾기</option>
              <option value="other">기타</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={onCancelEdit}
              className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-1" />
              취소
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-1" />
              저장
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className={`p-2 rounded-lg ${getLocationTypeColor(location.type)}`}>
            {getLocationIcon(location.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="text-lg font-medium text-gray-900">{location.name}</h4>
              {location.alias && (
                <span className="text-sm text-gray-500">({location.alias})</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{location.address}</p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center">
                <Star className="w-3 h-3 mr-1" />
                {location.visitCount}회 방문
              </span>
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(location.lastVisited).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title="편집"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};