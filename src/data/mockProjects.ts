export interface Project {
  id: string;
  curatorId: string;
  title: string;
  description: string;
  genre: string;
  categories: string[];
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  timeline: {
    applicationDeadline: string;
    selectionNotification: string;
    preparationPeriod: {
      start: string;
      end: string;
    };
    eventPeriod: {
      start: string;
      end: string;
    };
  };
  requirements: {
    experienceLevel: string;
    ageRange: { min: number; max: number };
    location: string[];
    portfolioMinimum: number;
    additionalRequirements: string[];
  };
  venue: {
    name: string;
    address: string;
    space: string;
    facilities: string[];
  };
  targetAudience: {
    primary: string[];
    secondary: string[];
    expectedVisitors: number;
  };
  selectionCriteria: {
    criteria: string;
    weight: number;
  }[];
  benefits: string[];
  status: string;
  applicantCount: number;
  maxParticipants: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const mockProjects: Project[] = [
  {
    id: 'project_001',
    curatorId: 'curator_001',
    title: '2025 천안 신진작가 발굴전',
    description: '천안 지역의 재능 있는 신진 작가들을 발굴하고 지원하는 기획전시입니다. 회화, 조각, 설치미술 등 다양한 장르의 작품을 선보일 예정입니다.',
    genre: 'exhibition',
    categories: ['painting', 'sculpture', 'installation'],
    budget: {
      min: 30000000,
      max: 50000000,
      currency: 'KRW'
    },
    timeline: {
      applicationDeadline: '2025-09-15',
      selectionNotification: '2025-09-30', 
      preparationPeriod: {
        start: '2025-10-01',
        end: '2025-11-30'
      },
      eventPeriod: {
        start: '2025-12-01',
        end: '2025-12-31'
      }
    },
    requirements: {
      experienceLevel: 'beginner_to_intermediate',
      ageRange: { min: 20, max: 40 },
      location: ['천안', '충남', '수도권'],
      portfolioMinimum: 3,
      additionalRequirements: [
        '작품 설명서 제출',
        '작가 인터뷰 참여 가능자',
        '전시 기간 중 작가 토크 참여'
      ]
    },
    venue: {
      name: '천안시립미술관',
      address: '천안시 동남구 문화로 100',
      space: '제1전시실 (200평)',
      facilities: ['조명시설', '보안시설', '작품보관실']
    },
    targetAudience: {
      primary: ['art_lover', 'young_adult'],
      secondary: ['family', 'tourist'],
      expectedVisitors: 2000
    },
    selectionCriteria: [
      { criteria: '작품성', weight: 40 },
      { criteria: '창의성', weight: 25 },
      { criteria: '완성도', weight: 20 },
      { criteria: '전시 적합성', weight: 15 }
    ],
    benefits: [
      '작품 제작비 지원 (작가당 300만원)',
      '도록 제작 및 배포',
      '언론 홍보 지원',
      '작품 판매 수수료 면제',
      '다음 기획전 우선 추천'
    ],
    status: 'recruiting',
    applicantCount: 0,
    maxParticipants: 8,
    tags: ['신진작가', '전시기회', '제작비지원', '판매가능'],
    createdAt: '2025-08-24',
    updatedAt: '2025-08-24'
  },
  {
    id: 'project_002',
    curatorId: 'curator_002',
    title: '융합예술 실험실: 소리와 색깔의 만남',
    description: '음악과 시각예술의 경계를 허무는 실험적 융합 공연 프로젝트입니다. 디지털 기술을 활용한 인터랙티브 공연을 통해 새로운 예술 경험을 선사합니다.',
    genre: 'performance',
    categories: ['music', 'digital_art', 'performance'],
    budget: {
      min: 40000000,
      max: 80000000,
      currency: 'KRW'
    },
    timeline: {
      applicationDeadline: '2025-10-01',
      selectionNotification: '2025-10-15',
      preparationPeriod: {
        start: '2025-10-20',
        end: '2025-12-15'
      },
      eventPeriod: {
        start: '2025-12-20',
        end: '2025-12-22'
      }
    },
    requirements: {
      experienceLevel: 'intermediate',
      ageRange: { min: 25, max: 45 },
      location: ['천안', '충남', '수도권', '충북'],
      portfolioMinimum: 5,
      additionalRequirements: [
        '음악 또는 디지털아트 전문성 필수',
        '협업 경험 보유자',
        '기술 활용 능력',
        '리허설 전 과정 참여 필수'
      ]
    },
    venue: {
      name: '천안아트센터 대공연장',
      address: '천안시 서북구 공원로 223',
      space: '대공연장 (800석)',
      facilities: ['프로젝션시설', '음향시설', '조명시설', '무대장비']
    },
    targetAudience: {
      primary: ['art_lover', 'music_lover'],
      secondary: ['young_adult', 'culture_enthusiast'],
      expectedVisitors: 2400
    },
    selectionCriteria: [
      { criteria: '실험성', weight: 35 },
      { criteria: '기술활용도', weight: 25 },
      { criteria: '예술성', weight: 25 },
      { criteria: '관객소통력', weight: 15 }
    ],
    benefits: [
      '공연 제작비 전액 지원',
      '기술 장비 및 인력 제공',
      '전문 멘토링 제공',
      '영상 기록 및 아카이브',
      '해외 교류전 추천'
    ],
    status: 'recruiting',
    applicantCount: 3,
    maxParticipants: 6,
    tags: ['융합예술', '실험적', '기술활용', '고예산'],
    createdAt: '2025-08-20',
    updatedAt: '2025-08-24'
  },
  {
    id: 'project_003',
    curatorId: 'curator_003',
    title: '우리동네 아트스토리',
    description: '지역민과 함께 만들어가는 참여형 공공미술 프로젝트입니다. 천안의 각 동네별 특성을 반영한 아트워크를 시민들과 함께 기획하고 제작합니다.',
    genre: 'community_art',
    categories: ['community_art', 'public_art', 'workshop'],
    budget: {
      min: 60000000,
      max: 120000000,
      currency: 'KRW'
    },
    timeline: {
      applicationDeadline: '2025-09-30',
      selectionNotification: '2025-10-10',
      preparationPeriod: {
        start: '2025-10-15',
        end: '2026-02-28'
      },
      eventPeriod: {
        start: '2026-03-01',
        end: '2026-08-31'
      }
    },
    requirements: {
      experienceLevel: 'intermediate',
      ageRange: { min: 30, max: 55 },
      location: ['천안', '충남'],
      portfolioMinimum: 4,
      additionalRequirements: [
        '지역사회 프로젝트 경험 보유',
        '시민 교육 및 워크숍 진행 능력',
        '장기 프로젝트 몰입 가능자',
        '지역사회 네트워킹 능력'
      ]
    },
    venue: {
      name: '천안시 각 동별 공공공간',
      address: '천안시 전역',
      space: '동별 지정 공간 (광장, 공원 등)',
      facilities: ['야외 전시 공간', '커뮤니티 센터']
    },
    targetAudience: {
      primary: ['community', 'family'],
      secondary: ['senior', 'children'],
      expectedVisitors: 50000
    },
    selectionCriteria: [
      { criteria: '사회적 가치', weight: 30 },
      { criteria: '참여도 설계', weight: 25 },
      { criteria: '지속가능성', weight: 25 },
      { criteria: '예술성', weight: 20 }
    ],
    benefits: [
      '프로젝트 전체 예산 지원',
      '지역사회 네트워크 연결',
      '행정 지원 및 허가 협조',
      '지속적인 모니터링 지원',
      '성과 발표회 개최'
    ],
    status: 'planning',
    applicantCount: 0,
    maxParticipants: 12,
    tags: ['사회참여', '지역밀착', '장기프로젝트', '교육포함'],
    createdAt: '2025-08-22',
    updatedAt: '2025-08-24'
  },
  {
    id: 'project_004',
    curatorId: 'curator_001',
    title: '천안 디지털아트 비엔날레 2026',
    description: '미래 지향적 디지털 아트와 AI 기술을 활용한 작품들을 선보이는 대규모 국제 비엔날레입니다. 국내외 아티스트들의 혁신적인 작품을 통해 디지털 예술의 새로운 지평을 제시합니다.',
    genre: 'exhibition',
    categories: ['digital_art', 'ai_art', 'interactive_art'],
    budget: {
      min: 100000000,
      max: 300000000,
      currency: 'KRW'
    },
    timeline: {
      applicationDeadline: '2025-12-31',
      selectionNotification: '2026-01-31',
      preparationPeriod: {
        start: '2026-02-01',
        end: '2026-08-31'
      },
      eventPeriod: {
        start: '2026-09-01',
        end: '2026-11-30'
      }
    },
    requirements: {
      experienceLevel: 'expert',
      ageRange: { min: 25, max: 60 },
      location: ['전국', '해외'],
      portfolioMinimum: 8,
      additionalRequirements: [
        '디지털아트 전문 작가',
        '대규모 전시 경험',
        '기술적 완성도 필수',
        '국제적 네트워킹 보유',
        '영어 소통 가능자'
      ]
    },
    venue: {
      name: '천안컨벤션센터 전관',
      address: '천안시 서북구 월봉로 234',
      space: '전시관 전체 (5000평)',
      facilities: ['대형 스크린', '고성능 프로젝터', 'VR/AR 장비', '네트워킹 인프라']
    },
    targetAudience: {
      primary: ['art_professional', 'tech_enthusiast'],
      secondary: ['international_visitor', 'media'],
      expectedVisitors: 100000
    },
    selectionCriteria: [
      { criteria: '혁신성', weight: 30 },
      { criteria: '기술적 완성도', weight: 25 },
      { criteria: '예술성', weight: 25 },
      { criteria: '국제적 어필', weight: 20 }
    ],
    benefits: [
      '작품 제작비 최대 5000만원 지원',
      '국제적 홍보 및 마케팅',
      '해외 갤러리 연결',
      '작품 영구 소장 기회',
      '차회 국제전 우선 초청'
    ],
    status: 'upcoming',
    applicantCount: 0,
    maxParticipants: 30,
    tags: ['국제비엔날레', '디지털아트', '고예산', '프레스티지'],
    createdAt: '2025-08-24',
    updatedAt: '2025-08-24'
  }
];