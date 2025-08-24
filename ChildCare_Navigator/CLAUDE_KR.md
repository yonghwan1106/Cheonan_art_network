# CLAUDE_KR.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소의 코드를 작업할 때 참고할 가이드라인을 제공합니다.

## 프로젝트 개요

**스마트 보육 네비게이터**는 2025년 한국보육진흥원 선제적 행정 및 규제혁신 공모전을 위해 개발된 보육 형평성 실현을 위한 AI 기반 플랫폼입니다. 이 플랫폼은 빅데이터와 머신러닝을 활용하여 보육 수요를 예측하고 인프라 배치를 최적화합니다.

## 아키텍처

이 프로젝트는 세 가지 주요 서비스로 구성된 **마이크로서비스 아키텍처**를 따릅니다:

### 서비스 구조
```
📱 프론트엔드 (Next.js 14 + TypeScript)
├── 포트: 3000
├── 3D 지도 시각화 (Mapbox GL JS)
├── React Query를 사용한 실시간 대시보드
└── Tailwind CSS를 사용한 컴포넌트 기반 UI

⚙️ 백엔드 API (Node.js/Express + TypeScript)  
├── 포트: 8000
├── JWT 인증 및 속도 제한
├── 공간 쿼리를 포함한 지역 데이터 관리
└── 실시간 기능을 위한 WebSocket 지원

🤖 AI 서비스 (Python/FastAPI)
├── 포트: 8001  
├── 수요 예측 알고리즘
├── 위치 추천 엔진
└── Redis 캐싱을 활용한 트렌드 분석

💾 데이터 레이어
├── PostgreSQL + PostGIS (공간 데이터)
├── Redis (캐싱 및 세션)
└── MongoDB (로그 및 비정형 데이터)
```

## 개발 명령어

### Docker 환경 (권장)
```bash
# 모든 서비스 시작
docker-compose up -d

# 서비스 로그 확인
docker-compose logs -f [service-name]

# 모든 서비스 중지
docker-compose down

# 특정 서비스 재빌드
docker-compose build [service-name]
```

### 로컬 개발
```bash
# AI 서비스 (Python/FastAPI)
cd ai-service
python app.py
# http://localhost:8001에서 실행
# API 문서: http://localhost:8001/docs

# 백엔드 API (Node.js/Express)
cd backend
npm run dev
# http://localhost:8000에서 실행

# 프론트엔드 (Next.js)
cd frontend  
npm run dev
# http://localhost:3000에서 실행
```

### 데이터베이스 관리
```bash
# PostgreSQL 연결
docker exec -it childcare-postgres psql -U childcare_user -d childcare_db

# 공간 데이터베이스 초기화
psql -f database/init/01-init.sql

# Redis CLI
docker exec -it childcare-redis redis-cli
```

## 핵심 컴포넌트 아키텍처

### 프론트엔드 컴포넌트 계층구조
- **Layout**: `app/layout.tsx` - 프로바이더와 글로벌 스타일을 포함한 루트 레이아웃
- **메인 대시보드**: `app/page.tsx` - 지도, 통계, 예측을 포함한 주요 인터페이스
- **지도 시각화**: `components/MapView.tsx` - 공간 데이터와 3D Mapbox 통합
- **데이터 컴포넌트**: API 상태 관리 및 캐싱을 위한 React Query 사용
- **UI 컴포넌트**: 일관된 디자인 시스템을 위한 Headless UI + Tailwind CSS

### 백엔드 서비스 통합
- **인증 플로우**: 속도 제한 미들웨어가 포함된 JWT 기반 인증
- **공간 쿼리**: 지리적 데이터 처리를 위한 PostGIS 통합  
- **API 라우팅**: `src/routes/`의 모듈식 라우트 구조
- **실시간 기능**: 실시간 데이터 업데이트를 위한 Socket.io

### AI 서비스 엔드포인트
- **수요 예측**: `POST /predict/demand` - 6개월 보육 수요 예측
- **위치 추천**: `POST /recommend/locations` - 최적 시설 배치
- **트렌드 분석**: `POST /analyze/demand-trends` - 과거 패턴 분석
- **모델 상태**: `GET /models/status` - AI 모델 상태 및 성능 지표

## 데이터 모델 및 지역 코드

### 지역 코드 시스템
애플리케이션은 5자리 행정 코드를 사용합니다:
- `11680`: 강남구 (Gangnam-gu)
- `11290`: 성북구 (Seongbuk-gu) 
- `11240`: 송파구 (Songpa-gu)
- `11380`: 은평구 (Eunpyeong-gu)
- `11545`: 금천구 (Geumcheon-gu)

### 주요 데이터베이스 테이블
- `regions`: 공간 경계를 포함한 행정 구역
- `childcare_centers`: 용량과 유형을 포함한 시설 위치
- `predictions`: AI가 생성한 수요 예측
- `user_feedback`: 시민 참여 데이터

## 환경 설정

### 필수 환경 변수
```bash
# 데이터베이스
DATABASE_URL=postgresql://childcare_user:childcare_pass@localhost:5432/childcare_db
REDIS_URL=redis://localhost:6379

# 서비스
AI_SERVICE_URL=http://localhost:8001
NEXT_PUBLIC_API_URL=http://localhost:8000

# 외부 API
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token-here
JWT_SECRET=your-super-secret-jwt-key

# 개발
NODE_ENV=development
```

## 주요 개발 패턴

### API 통합
- **프론트엔드**: 자동 캐싱을 포함한 서버 상태 관리를 위한 React Query 사용
- **에러 처리**: 모든 서비스에서 표준화된 에러 응답
- **검증**: AI 서비스의 Pydantic 모델, 백엔드의 Joi 검증

### 공간 데이터 처리
- **프론트엔드**: 사용자 정의 마커와 히트맵을 포함한 3D 시각화를 위한 Mapbox GL JS
- **백엔드**: 공간 쿼리 및 지리적 계산을 위한 PostGIS
- **AI 서비스**: 공간 분석 및 위치 최적화를 위한 GeoPandas

### 실시간 기능
- **WebSocket 통합**: 대시보드 통계의 실시간 데이터 업데이트
- **캐싱 전략**: AI 예측 및 지역 데이터를 위한 Redis 기반 캐싱
- **백그라운드 작업**: 무거운 ML 계산을 위한 비동기 처리

## 디버깅 및 모니터링

### 서비스 상태 확인
- 프론트엔드: API 호출을 위한 React 개발자 도구 및 네트워크 탭 확인
- 백엔드: Express 로그 및 데이터베이스 연결 모니터링
- AI 서비스: `/docs` 엔드포인트에서 FastAPI 자동 문서 사용

### 일반적인 문제
- **Mapbox 렌더링**: `NEXT_PUBLIC_MAPBOX_TOKEN`이 올바르게 설정되었는지 확인
- **CORS 오류**: 환경 설정에서 서비스 URL 확인  
- **데이터베이스 연결**: PostgreSQL PostGIS 확장이 활성화되어 있는지 확인
- **AI 서비스**: Python 의존성에는 NumPy, Pandas, FastAPI, Redis가 필요

### 포트 설정
다음 포트들이 사용 가능한지 확인하세요:
- 3000: 프론트엔드 (Next.js)
- 8000: 백엔드 API (Express)
- 8001: AI 서비스 (FastAPI)  
- 5432: PostgreSQL
- 6379: Redis
- 27017: MongoDB