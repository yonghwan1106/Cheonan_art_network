"""
Smart Voice Guard - 설정 파일
"""

from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    """
    앱 설정 클래스
    환경 변수나 .env 파일에서 설정값을 읽어옵니다
    """
    
    # 기본 설정
    APP_NAME: str = "Smart Voice Guard"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # 서버 설정
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # AI 모델 설정
    WHISPER_MODEL: str = "base"  # tiny, base, small, medium, large
    FRAUD_DETECTION_THRESHOLD: float = 0.7  # 사기 탐지 임계값
    
    # 데이터베이스 설정 (나중에 사용)
    DATABASE_URL: str = "sqlite:///./smart_voice_guard.db"
    
    # 로깅 설정
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/app.log"
    
    class Config:
        env_file = ".env"  # .env 파일에서 설정 읽기

# 설정 인스턴스 생성
settings = Settings()