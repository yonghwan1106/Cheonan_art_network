export interface Curator {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  organization: string;
  position: string;
  experienceYears: number;
  specialization: string[];
  bio: string;
  pastProjects: {
    id: string;
    title: string;
    year: number;
    budget: string;
    description: string;
    participants: number;
    visitorCount: number;
    satisfaction: number;
  }[];
  preferences: {
    preferredGenres: string[];
    preferredStyles: string[];
    targetAudience: string[];
    budgetRange: {
      min: number;
      max: number;
    };
  };
  ratings: {
    averageScore: number;
    reviewCount: number;
  };
  workingStyle: string[];
  tags: string[];
}

export const mockCurators: Curator[] = [
  {
    id: 'curator_001',
    name: '이수진',
    email: 'sujin.lee@cfac.or.kr',
    profileImage: '/images/curators/curator1.jpg',
    organization: '천안문화재단',
    position: '기획팀장',
    experienceYears: 12,
    specialization: ['exhibition', 'cultural_event'],
    bio: '지역 문화 발전과 시민 문화 향유 증진에 힘쓰는 기획자입니다.',
    pastProjects: [
      {
        id: 'project_001',
        title: '2024 천안청년작가전',
        year: 2024,
        budget: '50,000,000원',
        description: '지역 청년 작가들의 작품을 소개하는 기획전',
        participants: 15,
        visitorCount: 3200,
        satisfaction: 4.5
      },
      {
        id: 'project_002',
        title: '천안역사문화축제',
        year: 2023, 
        budget: '200,000,000원',
        description: '천안의 역사와 문화를 체험할 수 있는 대형 축제',
        participants: 50,
        visitorCount: 15000,
        satisfaction: 4.7
      }
    ],
    preferences: {
      preferredGenres: ['painting', 'sculpture', 'installation'],
      preferredStyles: ['contemporary', 'experimental'],
      targetAudience: ['young_adult', 'family'],
      budgetRange: {
        min: 10000000,
        max: 100000000
      }
    },
    ratings: {
      averageScore: 4.6,
      reviewCount: 28
    },
    workingStyle: ['collaborative', 'detail_oriented', 'innovative'],
    tags: ['경험풍부', '소통잘함', '창의적기획', '예산관리우수']
  },
  {
    id: 'curator_002',
    name: '박민규',
    email: 'mingyu.park@cheonanart.com',
    profileImage: '/images/curators/curator2.jpg',
    organization: '천안아트센터',
    position: '전시기획실장',
    experienceYears: 8,
    specialization: ['performance', 'music', 'multimedia'],
    bio: '공연예술과 시각예술의 경계를 넘나드는 실험적인 기획을 추구합니다.',
    pastProjects: [
      {
        id: 'project_003',
        title: '소리와 빛의 향연',
        year: 2024,
        budget: '80,000,000원',
        description: '음악과 미디어아트가 결합된 멀티미디어 공연',
        participants: 8,
        visitorCount: 2800,
        satisfaction: 4.8
      },
      {
        id: 'project_004',
        title: '천안 퓨전아트페스티벌',
        year: 2023,
        budget: '150,000,000원',
        description: '전통과 현대가 만나는 융합 예술 축제',
        participants: 25,
        visitorCount: 8500,
        satisfaction: 4.6
      }
    ],
    preferences: {
      preferredGenres: ['music', 'performance', 'digital_art'],
      preferredStyles: ['fusion', 'experimental', 'interactive'],
      targetAudience: ['art_lover', 'young_adult'],
      budgetRange: {
        min: 15000000,
        max: 200000000
      }
    },
    ratings: {
      averageScore: 4.7,
      reviewCount: 22
    },
    workingStyle: ['experimental', 'risk_taking', 'visionary'],
    tags: ['실험정신', '융합예술전문', '트렌드세터', '도전적']
  },
  {
    id: 'curator_003',
    name: '김현아',
    email: 'hyuna.kim@caf.or.kr',
    profileImage: '/images/curators/curator3.jpg',
    organization: '충남문화재단',
    position: '문화기획부 부장',
    experienceYears: 15,
    specialization: ['community_art', 'education', 'cultural_policy'],
    bio: '지역사회와 함께하는 참여형 문화예술 프로그램을 기획하고 있습니다.',
    pastProjects: [
      {
        id: 'project_005',
        title: '우리마을 아트프로젝트',
        year: 2024,
        budget: '120,000,000원',
        description: '지역민 참여형 공공미술 프로젝트',
        participants: 30,
        visitorCount: 12000,
        satisfaction: 4.9
      },
      {
        id: 'project_006',
        title: '문화나눔 아카데미',
        year: 2023,
        budget: '60,000,000원',
        description: '시민 대상 문화예술 교육 프로그램',
        participants: 12,
        visitorCount: 5000,
        satisfaction: 4.8
      }
    ],
    preferences: {
      preferredGenres: ['community_art', 'workshop', 'education'],
      preferredStyles: ['accessible', 'participatory', 'social'],
      targetAudience: ['family', 'senior', 'community'],
      budgetRange: {
        min: 20000000,
        max: 150000000
      }
    },
    ratings: {
      averageScore: 4.8,
      reviewCount: 35
    },
    workingStyle: ['community_focused', 'inclusive', 'educational'],
    tags: ['사회참여', '교육전문', '지역밀착', '포용적기획']
  }
];