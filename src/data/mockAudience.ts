export interface AudienceData {
  genrePreferences: { [key: string]: number };
  ageGroups: { [key: string]: number };
  locationPreferences: { [key: string]: number };
  visitFrequency: { [key: string]: number };
  spendingHabits: { [key: string]: number };
}

export const mockAudienceData: AudienceData = {
  genrePreferences: {
    'painting': 0.8,
    'sculpture': 0.6,
    'music': 0.9,
    'performance': 0.7,
    'installation': 0.5,
    'digital_art': 0.4,
    'community_art': 0.9,
    'workshop': 0.6,
    'public_art': 0.7
  },
  ageGroups: {
    'teens': 0.15,        // 13-19세
    'young_adult': 0.35,  // 20-35세
    'adult': 0.30,        // 36-50세
    'senior': 0.20        // 51세 이상
  },
  locationPreferences: {
    '천안': 1.0,
    '충남': 0.8,
    '서울': 0.6,
    '수도권': 0.7,
    '충북': 0.5,
    '대전': 0.4
  },
  visitFrequency: {
    'first_time': 0.4,     // 첫 방문자
    'occasional': 0.35,    // 가끔 방문 (년 2-3회)
    'regular': 0.20,       // 정기 방문 (월 1-2회)
    'frequent': 0.05       // 자주 방문 (주 1회 이상)
  },
  spendingHabits: {
    'low': 0.40,          // 1-2만원
    'medium': 0.35,       // 3-5만원
    'high': 0.20,         // 6-10만원
    'premium': 0.05       // 10만원 이상
  }
};

// 관객 세그먼트별 선호도 데이터
export interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  demographics: {
    ageRange: string;
    income: string;
    education: string;
    location: string[];
  };
  preferences: {
    genres: string[];
    styles: string[];
    venues: string[];
    timePreference: string[];
  };
  behavior: {
    avgSpending: number;
    visitFrequency: string;
    groupSize: number;
    planningTime: string;
  };
  satisfaction: {
    contentQuality: number;
    accessibility: number;
    valueForMoney: number;
    overallExperience: number;
  };
}

export const audienceSegments: AudienceSegment[] = [
  {
    id: 'young_art_lovers',
    name: '젊은 예술 애호가',
    description: '20-30대 예술에 관심이 많은 젊은 층',
    demographics: {
      ageRange: '20-35세',
      income: '연 3000-5000만원',
      education: '대학교 재학/졸업',
      location: ['천안', '수도권', '충남']
    },
    preferences: {
      genres: ['contemporary', 'digital_art', 'installation', 'performance'],
      styles: ['experimental', 'interactive', 'modern'],
      venues: ['갤러리', '문화센터', '대안공간'],
      timePreference: ['주말', '저녁시간']
    },
    behavior: {
      avgSpending: 25000,
      visitFrequency: 'monthly',
      groupSize: 2.3,
      planningTime: '1-2주 전'
    },
    satisfaction: {
      contentQuality: 4.2,
      accessibility: 4.0,
      valueForMoney: 3.8,
      overallExperience: 4.1
    }
  },
  {
    id: 'family_visitors',
    name: '가족 단위 관람객',
    description: '자녀와 함께 문화활동을 즐기는 가족들',
    demographics: {
      ageRange: '30-50세 (자녀 포함)',
      income: '연 4000-7000만원',
      education: '대학교 졸업',
      location: ['천안', '충남']
    },
    preferences: {
      genres: ['workshop', 'community_art', 'education', 'family_friendly'],
      styles: ['accessible', 'interactive', 'educational'],
      venues: ['문화센터', '박물관', '공원'],
      timePreference: ['주말', '오후시간']
    },
    behavior: {
      avgSpending: 40000,
      visitFrequency: 'quarterly',
      groupSize: 3.8,
      planningTime: '2-3주 전'
    },
    satisfaction: {
      contentQuality: 4.1,
      accessibility: 4.5,
      valueForMoney: 4.2,
      overallExperience: 4.3
    }
  },
  {
    id: 'senior_culture_enthusiasts',
    name: '시니어 문화 애호가',
    description: '50대 이상의 성숙한 문화 향유층',
    demographics: {
      ageRange: '50세 이상',
      income: '연 5000만원 이상',
      education: '고등학교 졸업 이상',
      location: ['천안', '충남', '수도권']
    },
    preferences: {
      genres: ['traditional', 'painting', 'sculpture', 'music'],
      styles: ['classic', 'traditional', 'refined'],
      venues: ['미술관', '음악회', '전통공간'],
      timePreference: ['평일', '오전시간']
    },
    behavior: {
      avgSpending: 35000,
      visitFrequency: 'bi-monthly',
      groupSize: 2.1,
      planningTime: '1주 전'
    },
    satisfaction: {
      contentQuality: 4.4,
      accessibility: 4.1,
      valueForMoney: 4.0,
      overallExperience: 4.2
    }
  },
  {
    id: 'art_professionals',
    name: '예술 전문가',
    description: '예술 관련 업계 종사자 및 전문가들',
    demographics: {
      ageRange: '25-55세',
      income: '연 4000만원 이상',
      education: '예술 관련 전공',
      location: ['전국', '해외']
    },
    preferences: {
      genres: ['all_genres'],
      styles: ['innovative', 'experimental', 'professional'],
      venues: ['갤러리', '아트페어', '비엔날레'],
      timePreference: ['평일', '오프닝']
    },
    behavior: {
      avgSpending: 80000,
      visitFrequency: 'weekly',
      groupSize: 1.8,
      planningTime: '즉석'
    },
    satisfaction: {
      contentQuality: 4.6,
      accessibility: 3.9,
      valueForMoney: 3.7,
      overallExperience: 4.3
    }
  },
  {
    id: 'casual_visitors',
    name: '일반 관람객',
    description: '특별한 관심사 없이 가볍게 문화생활을 즐기는 층',
    demographics: {
      ageRange: '20-60세',
      income: '연 3000-6000만원',
      education: '다양',
      location: ['천안', '충남']
    },
    preferences: {
      genres: ['popular', 'accessible', 'entertaining'],
      styles: ['easy_to_understand', 'visually_appealing'],
      venues: ['대형 전시장', '문화센터'],
      timePreference: ['주말', '휴일']
    },
    behavior: {
      avgSpending: 15000,
      visitFrequency: 'rarely',
      groupSize: 2.5,
      planningTime: '당일'
    },
    satisfaction: {
      contentQuality: 3.8,
      accessibility: 4.3,
      valueForMoney: 4.1,
      overallExperience: 3.9
    }
  }
];

// 시기별 관객 트렌드 데이터
export interface SeasonalTrend {
  month: number;
  monthName: string;
  visitorMultiplier: number;
  popularGenres: string[];
  specialEvents: string[];
}

export const seasonalTrends: SeasonalTrend[] = [
  {
    month: 1,
    monthName: '1월',
    visitorMultiplier: 0.7,
    popularGenres: ['traditional', 'painting'],
    specialEvents: ['신년 기획전', '전통예술 축제']
  },
  {
    month: 2,
    monthName: '2월',
    visitorMultiplier: 0.8,
    popularGenres: ['workshop', 'community_art'],
    specialEvents: ['설날 특별전', '가족 체험 프로그램']
  },
  {
    month: 3,
    monthName: '3월',
    visitorMultiplier: 1.0,
    popularGenres: ['contemporary', 'installation'],
    specialEvents: ['봄맞이 기획전']
  },
  {
    month: 4,
    monthName: '4월',
    visitorMultiplier: 1.2,
    popularGenres: ['outdoor', 'public_art'],
    specialEvents: ['벚꽃축제 연계전']
  },
  {
    month: 5,
    monthName: '5월',
    visitorMultiplier: 1.3,
    popularGenres: ['family_friendly', 'workshop'],
    specialEvents: ['어린이날 특별전', '가정의달 기획전']
  },
  {
    month: 6,
    monthName: '6월',
    visitorMultiplier: 1.1,
    popularGenres: ['contemporary', 'digital_art'],
    specialEvents: ['청년작가전']
  },
  {
    month: 7,
    monthName: '7월',
    visitorMultiplier: 0.9,
    popularGenres: ['performance', 'music'],
    specialEvents: ['여름 페스티벌']
  },
  {
    month: 8,
    monthName: '8월',
    visitorMultiplier: 0.8,
    popularGenres: ['workshop', 'education'],
    specialEvents: ['여름방학 특별 프로그램']
  },
  {
    month: 9,
    monthName: '9월',
    visitorMultiplier: 1.1,
    popularGenres: ['contemporary', 'sculpture'],
    specialEvents: ['가을 기획전']
  },
  {
    month: 10,
    monthName: '10월',
    visitorMultiplier: 1.4,
    popularGenres: ['all_genres'],
    specialEvents: ['문화예술축제', '비엔날레']
  },
  {
    month: 11,
    monthName: '11월',
    visitorMultiplier: 1.2,
    popularGenres: ['painting', 'photography'],
    specialEvents: ['가을 단풍 연계전']
  },
  {
    month: 12,
    monthName: '12월',
    visitorMultiplier: 1.0,
    popularGenres: ['festive', 'community_art'],
    specialEvents: ['연말 기획전', '송년 이벤트']
  }
];