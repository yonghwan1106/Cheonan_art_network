# 천안아트네트워크

AI 기반 예술가-기획자 매칭 플랫폼

## 프로젝트 개요

천안아트네트워크는 천안 지역의 예술가와 기획자를 AI 알고리즘으로 매칭하여 최적의 문화예술 프로젝트를 만들어가는 플랫폼입니다.

### 주요 기능

- **AI 매칭 시스템**: 작품 스타일, 경력, 예산, 일정 등을 종합 분석한 매칭
- **프로젝트 관리**: 다양한 문화예술 프로젝트 등록 및 관리
- **프로필 시스템**: 예술가와 기획자의 상세 프로필 관리
- **실시간 매칭**: 프로젝트별 최적 예술가 실시간 추천

### 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API
- **Deployment**: Vercel

## 시작하기

### 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3000 열기
```

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 실행
npm start
```

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지들
│   ├── page.tsx           # 랜딩 페이지
│   ├── login/             # 로그인 페이지
│   ├── register/          # 회원가입 페이지
│   ├── projects/          # 프로젝트 목록 페이지
│   └── matching/          # AI 매칭 결과 페이지
├── components/            # 재사용 가능한 컴포넌트들
│   ├── common/           # 공통 UI 컴포넌트 (Button, Card, Input)
│   ├── layout/           # 레이아웃 컴포넌트 (Header, Layout)
│   └── features/         # 기능별 컴포넌트 (매칭 결과 카드 등)
├── context/              # React Context (전역 상태 관리)
├── data/                 # Mock 데이터
│   ├── mockArtists.ts   # 예술가 샘플 데이터
│   ├── mockCurators.ts  # 기획자 샘플 데이터
│   └── mockProjects.ts  # 프로젝트 샘플 데이터
└── utils/               # 유틸리티 함수
    └── matchingAlgorithm.ts  # AI 매칭 알고리즘
```

## 매칭 알고리즘

AI 매칭 시스템은 다음 4가지 요소를 종합적으로 분석합니다:

1. **기본 호환성 (40%)**: 장르 일치도, 예산 범위, 일정 적합성
2. **스타일 매칭 (25%)**: 예술가 작품 스타일과 기획자 선호도 매칭
3. **경력 적합성 (20%)**: 프로젝트 요구 경력 수준과 예술가 경력 매칭
4. **관객 반응 예측 (15%)**: 예상 관객 만족도 및 지역적 특성

## 데모 계정

개발 및 테스트를 위한 데모 계정:

### 예술가 계정
- **이메일**: minsu.kim@email.com
- **비밀번호**: password
- **이름**: 김민수 (추상화/조각 작가)

### 기획자 계정
- **이메일**: sujin.lee@cfac.or.kr
- **비밀번호**: password
- **이름**: 이수진 (천안문화재단 기획팀장)

## 배포

이 프로젝트는 Vercel에 배포할 수 있습니다:

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

## 라이센스

이 프로젝트는 2025 천안문화재단 문화예술 아이디어 공모전을 위한 프로토타입입니다.

## 기여하기

버그 리포트나 기능 제안은 Issues를 통해 등록해 주세요.

---

천안문화재단 문화예술 아이디어 공모전 출품작
개발: Claude Code AI Assistant
