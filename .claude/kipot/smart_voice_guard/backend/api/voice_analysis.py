"""
음성 분석 API 엔드포인트
음성 파일 업로드 및 분석 기능을 제공합니다.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, Any
import io
from loguru import logger

from services.speech_analyzer import SpeechAnalyzer
from services.fraud_detector import FraudDetector


# API 라우터 생성
router = APIRouter(prefix="/api/voice", tags=["voice-analysis"])

# 서비스 인스턴스 생성
speech_analyzer = SpeechAnalyzer()
fraud_detector = FraudDetector()


@router.post("/upload-and-analyze")
async def upload_and_analyze_audio(
    audio_file: UploadFile = File(..., description="분석할 음성 파일")
) -> Dict[str, Any]:
    """
    음성 파일을 업로드하고 사기 패턴을 분석합니다.
    
    Args:
        audio_file: 업로드된 음성 파일 (.wav, .mp3, .m4a, .webm 지원)
        
    Returns:
        Dict: 분석 결과
    """
    try:
        # 1. 파일 유효성 검사
        if not audio_file.filename:
            raise HTTPException(status_code=400, detail="파일이 선택되지 않았습니다.")
        
        # 지원되는 파일 형식 확인
        supported_formats = ['.wav', '.mp3', '.m4a', '.webm', '.ogg']
        file_extension = '.' + audio_file.filename.split('.')[-1].lower()
        
        if file_extension not in supported_formats:
            raise HTTPException(
                status_code=400, 
                detail=f"지원되지 않는 파일 형식입니다. 지원 형식: {', '.join(supported_formats)}"
            )
        
        # 파일 크기 제한 (10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        audio_content = await audio_file.read()
        
        if len(audio_content) > max_size:
            raise HTTPException(
                status_code=400,
                detail="파일 크기가 너무 큽니다. 최대 10MB까지 지원합니다."
            )
        
        # 파일 포인터 초기화
        audio_file.file = io.BytesIO(audio_content)
        
        logger.info(f"음성 파일 업로드 시작: {audio_file.filename} ({len(audio_content)} bytes)")
        
        # 2. 음성 속성 분석
        audio_file.file.seek(0)  # 파일 포인터 초기화
        audio_properties = speech_analyzer.analyze_audio_properties(audio_file.file)
        
        # 3. 음성을 텍스트로 변환
        audio_file.file.seek(0)  # 파일 포인터 초기화
        speech_result = speech_analyzer.audio_to_text(audio_file.file)
        
        if not speech_result["success"]:
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": "음성 인식 실패",
                    "details": speech_result["error"],
                    "audio_properties": audio_properties
                }
            )
        
        # 4. 사기 패턴 분석
        fraud_analysis = fraud_detector.analyze_text(speech_result["text"])
        
        # 5. 종합 결과 생성
        result = {
            "success": True,
            "filename": audio_file.filename,
            "audio_properties": audio_properties,
            "speech_recognition": {
                "text": speech_result["text"],
                "confidence": speech_result["confidence"],
                "language": speech_result["language"],
                "duration": speech_result["duration"]
            },
            "fraud_analysis": {
                "risk_score": fraud_analysis["risk_score"],
                "risk_level": fraud_analysis["risk_level"],
                "is_fraud_suspected": fraud_analysis["is_fraud_suspected"],
                "keyword_matches": fraud_analysis["keyword_matches"],
                "pattern_analysis": fraud_analysis["pattern_analysis"],
                "recommendations": fraud_analysis["recommendations"]
            },
            "analysis_summary": {
                "total_analysis_time": fraud_analysis["analysis_time"],
                "final_verdict": _generate_final_verdict(fraud_analysis),
                "confidence_level": _calculate_confidence_level(speech_result, fraud_analysis)
            }
        }
        
        logger.info(f"음성 분석 완료: {audio_file.filename}, 위험도: {fraud_analysis['risk_score']:.2f}")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"음성 분석 중 예상치 못한 오류: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"음성 분석 중 오류가 발생했습니다: {str(e)}"
        )


@router.post("/analyze-text")
async def analyze_text_only(
    text: str,
    confidence: float = 1.0
) -> Dict[str, Any]:
    """
    텍스트만으로 사기 패턴을 분석합니다.
    
    Args:
        text: 분석할 텍스트
        confidence: 텍스트 신뢰도 (0.0 - 1.0)
        
    Returns:
        Dict: 분석 결과
    """
    try:
        if not text or not text.strip():
            raise HTTPException(status_code=400, detail="분석할 텍스트가 비어있습니다.")
        
        # 사기 패턴 분석
        fraud_analysis = fraud_detector.analyze_text(text)
        
        # 결과 생성
        result = {
            "success": True,
            "input_text": text,
            "input_confidence": confidence,
            "fraud_analysis": {
                "risk_score": fraud_analysis["risk_score"],
                "risk_level": fraud_analysis["risk_level"],
                "is_fraud_suspected": fraud_analysis["is_fraud_suspected"],
                "keyword_matches": fraud_analysis["keyword_matches"],
                "pattern_analysis": fraud_analysis["pattern_analysis"],
                "recommendations": fraud_analysis["recommendations"]
            },
            "analysis_summary": {
                "analysis_time": fraud_analysis["analysis_time"],
                "final_verdict": _generate_final_verdict(fraud_analysis),
                "confidence_level": confidence
            }
        }
        
        logger.info(f"텍스트 분석 완료: 위험도 {fraud_analysis['risk_score']:.2f}")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"텍스트 분석 중 오류: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"텍스트 분석 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/fraud-keywords")
async def get_fraud_keywords() -> Dict[str, Any]:
    """
    현재 사용 중인 사기 키워드 목록을 반환합니다.
    
    Returns:
        Dict: 카테고리별 키워드 목록
    """
    try:
        keywords = fraud_detector.fraud_keywords
        weights = fraud_detector.scoring_weights
        
        result = {
            "success": True,
            "keywords_by_category": keywords,
            "category_weights": weights,
            "total_keywords": sum(len(kw_list) for kw_list in keywords.values()),
            "categories": list(keywords.keys())
        }
        
        return result
        
    except Exception as e:
        logger.error(f"키워드 조회 중 오류: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"키워드 조회 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/analysis-stats")
async def get_analysis_stats() -> Dict[str, Any]:
    """
    분석 시스템의 통계 정보를 반환합니다.
    
    Returns:
        Dict: 시스템 통계 정보
    """
    try:
        # 실제 운영 환경에서는 데이터베이스에서 통계를 가져옴
        # 현재는 더미 데이터로 대체
        
        result = {
            "success": True,
            "statistics": {
                "total_analyses": 0,
                "fraud_detected": 0,
                "false_positives": 0,
                "average_risk_score": 0.0,
                "most_common_keywords": [],
                "supported_audio_formats": [".wav", ".mp3", ".m4a", ".webm", ".ogg"],
                "max_file_size_mb": 10,
                "average_processing_time_ms": 0
            },
            "system_health": {
                "speech_analyzer_status": "healthy",
                "fraud_detector_status": "healthy",
                "total_keywords": sum(len(kw_list) for kw_list in fraud_detector.fraud_keywords.values())
            }
        }
        
        return result
        
    except Exception as e:
        logger.error(f"통계 조회 중 오류: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"통계 조회 중 오류가 발생했습니다: {str(e)}"
        )


def _generate_final_verdict(fraud_analysis: Dict[str, Any]) -> str:
    """
    최종 판정 메시지를 생성합니다.
    
    Args:
        fraud_analysis: 사기 분석 결과
        
    Returns:
        str: 최종 판정 메시지
    """
    risk_level = fraud_analysis["risk_level"]
    risk_score = fraud_analysis["risk_score"]
    
    verdicts = {
        "VERY_HIGH": f"🚨 매우 위험! 사기 전화로 의심됩니다. (위험도: {risk_score:.1f}/10)",
        "HIGH": f"⚠️ 위험! 사기 전화일 가능성이 높습니다. (위험도: {risk_score:.1f}/10)",
        "MEDIUM": f"🔍 주의! 의심스러운 내용이 포함되어 있습니다. (위험도: {risk_score:.1f}/10)",
        "LOW": f"✅ 비교적 안전하나 주의가 필요합니다. (위험도: {risk_score:.1f}/10)",
        "VERY_LOW": f"✅ 안전한 통화로 판단됩니다. (위험도: {risk_score:.1f}/10)"
    }
    
    return verdicts.get(risk_level, f"분석 결과: {risk_level} (위험도: {risk_score:.1f}/10)")


def _calculate_confidence_level(speech_result: Dict[str, Any], 
                              fraud_analysis: Dict[str, Any]) -> float:
    """
    전체 분석 결과의 신뢰도를 계산합니다.
    
    Args:
        speech_result: 음성 인식 결과
        fraud_analysis: 사기 분석 결과
        
    Returns:
        float: 신뢰도 점수 (0.0 - 1.0)
    """
    speech_confidence = speech_result.get("confidence", 0.0)
    
    # 키워드 매칭 수가 많을수록 신뢰도 증가
    keyword_count = sum(len(keywords) for keywords in fraud_analysis.get("keyword_matches", {}).values())
    keyword_confidence = min(keyword_count * 0.1, 1.0)
    
    # 패턴 분석 결과가 있을수록 신뢰도 증가
    pattern_count = sum(1 for value in fraud_analysis.get("pattern_analysis", {}).values() if value)
    pattern_confidence = min(pattern_count * 0.1, 1.0)
    
    # 가중 평균 계산
    total_confidence = (
        speech_confidence * 0.5 +
        keyword_confidence * 0.3 +
        pattern_confidence * 0.2
    )
    
    return round(total_confidence, 2)