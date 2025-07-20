"""
음성 분석 서비스
음성을 텍스트로 변환하고 기본적인 분석을 수행합니다.
"""

import speech_recognition as sr
from pydub import AudioSegment
import io
import tempfile
import os
from typing import Dict, Optional, Tuple
from loguru import logger


class SpeechAnalyzer:
    """
    음성 분석기 클래스
    음성 파일을 텍스트로 변환하는 기능을 제공합니다.
    """
    
    def __init__(self):
        """음성 분석기 초기화"""
        self.recognizer = sr.Recognizer()
        logger.info("음성 분석기가 초기화되었습니다.")
    
    def audio_to_text(self, audio_file) -> Dict[str, any]:
        """
        음성 파일을 텍스트로 변환합니다.
        
        Args:
            audio_file: 업로드된 음성 파일
            
        Returns:
            Dict: 변환 결과 (텍스트, 신뢰도, 오류 정보 등)
        """
        try:
            # 1. 음성 파일 읽기
            logger.info("음성 파일 처리를 시작합니다...")
            
            # 파일 내용을 메모리에 로드
            audio_content = audio_file.read()
            
            # 임시 파일로 저장
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
                temp_file.write(audio_content)
                temp_file_path = temp_file.name
            
            # 2. 음성 파일 형식 변환 (WAV로 통일)
            processed_audio_path = self._convert_to_wav(temp_file_path)
            
            # 3. 음성 인식 수행
            text_result = self._perform_speech_recognition(processed_audio_path)
            
            # 4. 임시 파일 정리
            os.unlink(temp_file_path)
            if processed_audio_path != temp_file_path:
                os.unlink(processed_audio_path)
            
            # 5. 결과 반환
            return {
                "success": True,
                "text": text_result["text"],
                "confidence": text_result["confidence"],
                "language": "ko-KR",
                "duration": text_result.get("duration", 0),
                "error": None
            }
            
        except Exception as e:
            logger.error(f"음성 분석 중 오류 발생: {str(e)}")
            return {
                "success": False,
                "text": "",
                "confidence": 0.0,
                "language": "ko-KR",
                "duration": 0,
                "error": str(e)
            }
    
    def _convert_to_wav(self, file_path: str) -> str:
        """
        음성 파일을 WAV 형식으로 변환합니다.
        
        Args:
            file_path: 원본 파일 경로
            
        Returns:
            str: 변환된 WAV 파일 경로
        """
        try:
            # 파일 확장자 확인
            file_extension = os.path.splitext(file_path)[1].lower()
            
            if file_extension == '.wav':
                return file_path
            
            # 다른 형식의 경우 WAV로 변환
            logger.info(f"음성 파일을 WAV 형식으로 변환합니다: {file_extension}")
            
            # AudioSegment로 파일 읽기
            if file_extension == '.mp3':
                audio = AudioSegment.from_mp3(file_path)
            elif file_extension == '.m4a':
                audio = AudioSegment.from_file(file_path, format="m4a")
            elif file_extension == '.webm':
                audio = AudioSegment.from_file(file_path, format="webm")
            else:
                # 기본적으로 시도
                audio = AudioSegment.from_file(file_path)
            
            # WAV 형식으로 변환 후 저장
            wav_path = file_path.replace(file_extension, '.wav')
            audio.export(wav_path, format="wav")
            
            return wav_path
            
        except Exception as e:
            logger.error(f"음성 파일 변환 중 오류: {str(e)}")
            return file_path
    
    def _perform_speech_recognition(self, wav_file_path: str) -> Dict[str, any]:
        """
        WAV 파일에 대해 음성 인식을 수행합니다.
        
        Args:
            wav_file_path: WAV 파일 경로
            
        Returns:
            Dict: 인식 결과
        """
        try:
            # 음성 파일 로드
            with sr.AudioFile(wav_file_path) as source:
                # 배경 소음 제거
                self.recognizer.adjust_for_ambient_noise(source)
                
                # 음성 데이터 읽기
                audio_data = self.recognizer.record(source)
                
                # 음성 파일 길이 계산
                duration = len(audio_data.frame_data) / audio_data.sample_rate
            
            # Google Speech Recognition API 사용 (무료)
            try:
                text = self.recognizer.recognize_google(
                    audio_data, 
                    language='ko-KR',  # 한국어 설정
                    show_all=False
                )
                
                return {
                    "text": text,
                    "confidence": 0.8,  # Google API는 신뢰도 점수를 제공하지 않음
                    "duration": duration
                }
                
            except sr.UnknownValueError:
                logger.warning("음성을 인식할 수 없습니다.")
                return {
                    "text": "",
                    "confidence": 0.0,
                    "duration": duration
                }
                
            except sr.RequestError as e:
                logger.error(f"Google Speech Recognition API 오류: {str(e)}")
                # 대체 방법으로 Sphinx 엔진 사용
                return self._fallback_recognition(audio_data, duration)
                
        except Exception as e:
            logger.error(f"음성 인식 중 오류: {str(e)}")
            return {
                "text": "",
                "confidence": 0.0,
                "duration": 0
            }
    
    def _fallback_recognition(self, audio_data, duration: float) -> Dict[str, any]:
        """
        Google API 실패 시 대체 음성 인식 엔진 사용
        
        Args:
            audio_data: 음성 데이터
            duration: 음성 길이
            
        Returns:
            Dict: 인식 결과
        """
        try:
            # PocketSphinx 엔진 사용 (오프라인)
            text = self.recognizer.recognize_sphinx(audio_data, language='ko-KR')
            
            return {
                "text": text,
                "confidence": 0.6,  # 대체 엔진은 낮은 신뢰도
                "duration": duration
            }
            
        except Exception as e:
            logger.error(f"대체 음성 인식 엔진 오류: {str(e)}")
            return {
                "text": "",
                "confidence": 0.0,
                "duration": duration
            }
    
    def analyze_audio_properties(self, audio_file) -> Dict[str, any]:
        """
        음성 파일의 기본적인 속성을 분석합니다.
        
        Args:
            audio_file: 음성 파일
            
        Returns:
            Dict: 음성 속성 분석 결과
        """
        try:
            # 파일 내용 읽기
            audio_content = audio_file.read()
            
            # 임시 파일로 저장
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
                temp_file.write(audio_content)
                temp_file_path = temp_file.name
            
            # AudioSegment로 분석
            audio = AudioSegment.from_file(temp_file_path)
            
            properties = {
                "duration": len(audio) / 1000.0,  # 초 단위
                "sample_rate": audio.frame_rate,
                "channels": audio.channels,
                "bit_depth": audio.sample_width * 8,
                "file_size": len(audio_content),
                "loudness": audio.dBFS,  # 데시벨 단위
                "format": "audio/wav"
            }
            
            # 임시 파일 정리
            os.unlink(temp_file_path)
            
            return properties
            
        except Exception as e:
            logger.error(f"음성 속성 분석 중 오류: {str(e)}")
            return {
                "duration": 0,
                "sample_rate": 0,
                "channels": 0,
                "bit_depth": 0,
                "file_size": 0,
                "loudness": 0,
                "format": "unknown"
            }