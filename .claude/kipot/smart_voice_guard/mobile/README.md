# Smart Voice Guard Mobile

AI 기반 사기 전화 차단 시스템의 모바일 앱입니다.

## 주요 기능

### 1. 홈 화면 (Home)
- 실시간 통계 요약
- 최근 통화 분석 결과
- 사기 탐지 현황

### 2. 대시보드 (Dashboard)
- 상세 통계 및 분석
- 위험도 분포 차트
- 시간대별 통화량 그래프
- 오늘의 통계

### 3. 설정 (Settings)
- 알림 설정
- 자동 차단 설정
- 위험도 임계값 조정
- 음성 녹음 설정

## 기술 스택

- **React Native**: 크로스 플랫폼 모바일 앱 개발
- **TypeScript**: 타입 안정성
- **React Navigation**: 네비게이션 관리
- **Chart Kit**: 차트 및 그래프 렌더링
- **Vector Icons**: 아이콘
- **Axios**: API 통신

## 설치 및 실행

### 1. 의존성 설치
```bash
cd mobile
npm install
```

### 2. iOS 실행
```bash
npm run ios
```

### 3. Android 실행
```bash
npm run android
```

### 4. 개발 서버 시작
```bash
npm start
```

## 프로젝트 구조

```
mobile/
├── src/
│   ├── components/          # 공통 컴포넌트
│   │   ├── RiskBadge.tsx   # 위험도 뱃지
│   │   ├── StatsCard.tsx   # 통계 카드
│   │   └── CallListItem.tsx # 통화 목록 아이템
│   ├── screens/            # 화면 컴포넌트
│   │   ├── HomeScreen.tsx  # 홈 화면
│   │   ├── DashboardScreen.tsx # 대시보드
│   │   └── SettingsScreen.tsx  # 설정 화면
│   ├── services/           # API 및 서비스
│   │   └── api.ts         # API 클라이언트
│   ├── types/              # 타입 정의
│   │   └── index.ts       # 공통 타입
│   └── utils/              # 유틸리티 함수
│       └── formatters.ts  # 데이터 포맷팅
├── App.tsx                 # 메인 앱 컴포넌트
├── index.js               # 앱 진입점
├── package.json           # 의존성 관리
└── tsconfig.json          # TypeScript 설정
```

## API 연동

백엔드 API 서버(`http://127.0.0.1:8000`)와 연동하여 다음 기능을 제공합니다:

- 실시간 통계 조회
- 최근 통화 분석 결과 조회
- 알림 관리
- 설정 저장/조회
- 음성 분석 요청

## 빌드

### Android 빌드
```bash
npm run build-android
```

### iOS 빌드
```bash
npm run build-ios
```

## 주의사항

1. 실제 디바이스에서 실행하려면 개발자 계정이 필요합니다
2. 음성 녹음 기능은 적절한 권한 설정이 필요합니다
3. 백엔드 API 서버가 실행 중이어야 합니다

## 라이선스

MIT License