# Smart Voice Guard (SVG) 프로토타입

AI 기반 사기 전화 차단 시스템 프로토타입

## 프로젝트 구조

```
smart_voice_guard/
├── backend/           # 백엔드 서버 (Python FastAPI)
├── frontend/          # 프론트엔드 (React.js)
├── data/             # 테스트 데이터
├── tests/            # 테스트 코드
├── docs/             # 문서
└── README.md         # 이 파일
```

## 개발 환경 설정

### 1. Python 가상환경 설정
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
```

### 2. 필수 라이브러리 설치
```bash
pip install -r requirements.txt
```

### 3. 서버 실행
```bash
cd backend
python main.py
```

## 기능 설명

- **음성 분석**: 실시간 음성을 텍스트로 변환
- **사기 탐지**: AI가 사기 패턴을 분석
- **웹 대시보드**: 실시간 모니터링 화면
- **시뮬레이션**: 테스트용 가상 통화 생성