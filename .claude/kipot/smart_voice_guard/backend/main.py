"""
Smart Voice Guard - 메인 서버 파일
AI 기반 사기 전화 차단 시스템
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import uvicorn

# API 라우터 import
from api.voice_analysis import router as voice_router

# FastAPI 앱 생성
app = FastAPI(
    title="Smart Voice Guard API",
    description="AI 기반 사기 전화 차단 시스템",
    version="1.0.0"
)

# CORS 설정 (웹 브라우저에서 API에 접근할 수 있도록)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 도메인 허용 (개발용)
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

# API 라우터 등록
app.include_router(voice_router)

# 기본 라우트 (홈페이지)
@app.get("/")
async def root():
    """
    API 서버 상태 확인
    """
    return {
        "message": "Smart Voice Guard API 서버가 실행 중입니다!",
        "status": "healthy",
        "version": "1.0.0"
    }

# 서버 상태 확인용 라우트
@app.get("/health")
async def health_check():
    """
    서버 상태 체크
    """
    return {"status": "OK", "message": "서버가 정상 작동중입니다"}

# 서버 실행 함수
if __name__ == "__main__":
    logger.info("Smart Voice Guard 서버를 시작합니다...")
    uvicorn.run(
        "main:app",
        host="127.0.0.1",  # 로컬 주소
        port=8000,         # 포트 번호
        reload=True        # 코드 변경시 자동 재시작
    )