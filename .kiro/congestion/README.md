# 스마트 교통 예측 시스템 (Smart Transit Predictor)

**2025 국민행복증진 철도·대중교통·물류 아이디어 공모전 출품작**

AI 기술을 활용하여 실시간 교통 데이터와 개인 이동 패턴을 분석하고, 각 이용자에게 최적화된 이동 경로와 시간을 제안하는 스마트 모빌리티 솔루션입니다.

🌐 **Live Demo**: [https://smart-transit-predictor.vercel.app](https://smart-transit-predictor.vercel.app)
📚 **GitHub**: [https://github.com/yonghwan1106/smart-transit-predictor](https://github.com/yonghwan1106/smart-transit-predictor)

## 🚀 주요 기능

- **실시간 혼잡도 모니터링**: 색상 코드 기반 직관적 혼잡도 표시
- **AI 기반 예측**: 1-3시간 내 혼잡도 변화 예측
- **개인화된 추천**: 사용자 패턴과 선호도 기반 맞춤형 경로 제안
- **대체 경로 추천**: 혼잡 상황 시 최적 대안 제시
- **인센티브 시스템**: 분산 이용 유도를 위한 포인트 적립
- **피드백 시스템**: 사용자 의견 수집 및 서비스 개선

## 🛠 기술 스택

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Recharts** for data visualization

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **WebSocket** for real-time updates
- **Mock APIs** for prototype demonstration

## 📦 설치 및 실행

### 전체 프로젝트 설치
```bash
npm run install:all
```

### 개발 서버 실행
```bash
# 프론트엔드와 백엔드 동시 실행
npm run dev

# 개별 실행
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:3001
```

### 빌드
```bash
npm run build
```

### 테스트
```bash
npm run test
```

## 📁 프로젝트 구조

```
congestion-prediction-service/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/      # 재사용 가능한 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── services/       # API 서비스
│   │   ├── types/          # TypeScript 타입 정의
│   │   └── utils/          # 유틸리티 함수
│   └── public/             # 정적 파일
├── backend/                 # Node.js 백엔드
│   └── src/
│       ├── routes/         # API 라우트
│       ├── services/       # 비즈니스 로직
│       ├── types/          # TypeScript 타입 정의
│       └── utils/          # 유틸리티 함수
└── docs/                   # 문서
```

## 🚀 배포

### Vercel 배포
```bash
# 프론트엔드 빌드
npm run build:frontend

# Vercel CLI를 통한 배포 (선택사항)
vercel --prod
```

### 환경 변수
```bash
NODE_ENV=production
REACT_APP_API_URL=https://smart-transit-predictor-backend.vercel.app
```

## 🎯 개발 현황

현재 완전한 프로토타입이 구현되어 있습니다:

- [x] 프로젝트 구조 설정 및 개발 환경 구축
- [x] 목 데이터 모델 및 인메모리 저장소 구현
- [x] 목 데이터 생성 서비스 구축
- [x] 목 예측 알고리즘 개발
- [x] 백엔드 API 서버 구현
- [x] 프론트엔드 컴포넌트 개발
- [x] 통합 테스트 및 배포

## 📄 라이선스

MIT License

## 👥 팀 정보

개인 맞춤형 혼잡도 예측 알림 서비스 개발팀

---

**본 프로젝트는 국민의 교통 편의성 향상과 행복 증진을 목표로 개발되었습니다.**