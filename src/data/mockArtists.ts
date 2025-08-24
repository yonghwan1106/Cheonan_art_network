export interface Artist {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  genres: string[];
  experienceYears: number;
  workStyle: string[];
  location: string;
  bio: string;
  portfolio: {
    id: string;
    title: string;
    imageUrl?: string;
    description: string;
    year: number;
    medium: string;
    size?: string;
    duration?: string;
  }[];
  ratings: {
    averageScore: number;
    reviewCount: number;
  };
  awards: string[];
  exhibitions: string[];
  availability: {
    startDate: string;
    endDate: string;
  };
  preferredBudget: {
    min: number;
    max: number;
  };
  tags: string[];
}

export const mockArtists: Artist[] = [
  {
    id: 'artist_001',
    name: '김민수',
    email: 'minsu.kim@email.com',
    profileImage: '/images/artists/artist1.jpg',
    genres: ['painting', 'sculpture'],
    experienceYears: 5,
    workStyle: ['abstract', 'contemporary'],
    location: '천안',
    bio: '추상화와 조각을 통해 현대인의 감정을 표현하는 작가입니다.',
    portfolio: [
      {
        id: 'work_001',
        title: '도시의 리듬',
        imageUrl: '/images/portfolio/work1.jpg',
        description: '도시의 빠른 변화를 추상적으로 표현한 작품',
        year: 2023,
        medium: 'Oil on Canvas',
        size: '100x80cm'
      },
      {
        id: 'work_002', 
        title: '침묵의 소리',
        imageUrl: '/images/portfolio/work2.jpg',
        description: '현대인의 고독을 주제로 한 설치 작품',
        year: 2024,
        medium: 'Mixed Media',
        size: '150x200x100cm'
      }
    ],
    ratings: {
      averageScore: 4.2,
      reviewCount: 15
    },
    awards: [
      '2023 천안미술대전 우수상',
      '2022 충남도전 입선'
    ],
    exhibitions: [
      '2024 천안문화재단 기획전 "새로운 시각"',
      '2023 갤러리 아트스페이스 개인전'
    ],
    availability: {
      startDate: '2025-09-01',
      endDate: '2025-12-31'
    },
    preferredBudget: {
      min: 3000000,
      max: 10000000
    },
    tags: ['실험적', '감성적', '현대적', '도전적']
  },
  {
    id: 'artist_002',
    name: '박지영',
    email: 'jiyoung.park@email.com', 
    profileImage: '/images/artists/artist2.jpg',
    genres: ['music', 'performance'],
    experienceYears: 8,
    workStyle: ['classical', 'fusion'],
    location: '천안',
    bio: '클래식과 국악의 퓨전을 통해 새로운 음악적 경험을 선사합니다.',
    portfolio: [
      {
        id: 'work_003',
        title: '한국의 소리, 세계의 울림',
        imageUrl: '/images/portfolio/work3.jpg',
        description: '국악기와 서양 악기의 협연',
        year: 2024,
        medium: 'Live Performance',
        duration: '45분'
      }
    ],
    ratings: {
      averageScore: 4.8,
      reviewCount: 23
    },
    awards: [
      '2024 천안음악제 대상',
      '2023 충남국악경연대회 금상'
    ],
    exhibitions: [
      '2024 천안아트센터 정기공연',
      '2023 서울국악원 초청공연'
    ],
    availability: {
      startDate: '2025-10-01', 
      endDate: '2026-03-31'
    },
    preferredBudget: {
      min: 5000000,
      max: 15000000  
    },
    tags: ['혁신적', '전통과현대', '감동적', '전문적']
  },
  {
    id: 'artist_003',
    name: '이서현',
    email: 'seohyun.lee@email.com',
    profileImage: '/images/artists/artist3.jpg',
    genres: ['digital_art', 'installation'],
    experienceYears: 3,
    workStyle: ['experimental', 'interactive'],
    location: '천안',
    bio: '디지털 기술과 예술의 융합을 통해 관객과 소통하는 인터랙티브 작품을 만듭니다.',
    portfolio: [
      {
        id: 'work_004',
        title: '디지털 숲',
        imageUrl: '/images/portfolio/work4.jpg',
        description: '센서를 이용한 인터랙티브 디지털 설치 작품',
        year: 2024,
        medium: 'Digital Installation',
        size: '5x3x3m'
      },
      {
        id: 'work_005',
        title: '메모리 오브 시티',
        imageUrl: '/images/portfolio/work5.jpg',
        description: '도시의 기억을 시각화한 미디어 아트',
        year: 2023,
        medium: 'Video Art',
        duration: '12분'
      }
    ],
    ratings: {
      averageScore: 4.5,
      reviewCount: 12
    },
    awards: [
      '2024 디지털아트페스타 신인상',
      '2023 천안청년작가전 특별상'
    ],
    exhibitions: [
      '2024 서울미디어아트비엔날레',
      '2023 천안테크노파크 기획전'
    ],
    availability: {
      startDate: '2025-08-01',
      endDate: '2026-01-31'
    },
    preferredBudget: {
      min: 2000000,
      max: 8000000
    },
    tags: ['기술융합', '인터랙티브', '혁신적', '젊은감각']
  },
  {
    id: 'artist_004',
    name: '최준호',
    email: 'junho.choi@email.com',
    profileImage: '/images/artists/artist4.jpg',
    genres: ['sculpture', 'installation'],
    experienceYears: 12,
    workStyle: ['minimalist', 'conceptual'],
    location: '서울',
    bio: '최소한의 형태로 최대의 의미를 전달하는 미니멀 조각 작품을 추구합니다.',
    portfolio: [
      {
        id: 'work_006',
        title: '공간의 침묵',
        imageUrl: '/images/portfolio/work6.jpg',
        description: '공간과 시간의 관계를 탐구한 대형 조각',
        year: 2023,
        medium: 'Steel, Concrete',
        size: '4x4x6m'
      },
      {
        id: 'work_007',
        title: '흔적',
        imageUrl: '/images/portfolio/work7.jpg',
        description: '인간의 존재와 부재를 표현한 설치 작품',
        year: 2024,
        medium: 'Bronze, Light',
        size: '3x2x2m'
      }
    ],
    ratings: {
      averageScore: 4.7,
      reviewCount: 31
    },
    awards: [
      '2024 한국조각가협회 대상',
      '2022 서울조각페스타 대상'
    ],
    exhibitions: [
      '2024 국립현대미술관 개인전',
      '2023 부산비엔날레 참여'
    ],
    availability: {
      startDate: '2025-11-01',
      endDate: '2026-05-31'
    },
    preferredBudget: {
      min: 8000000,
      max: 25000000
    },
    tags: ['베테랑', '미니멀', '철학적', '대형작품']
  }
];