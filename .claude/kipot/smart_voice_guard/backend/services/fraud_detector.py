"""
사기 전화 탐지 서비스
텍스트 내용을 분석하여 사기 패턴을 탐지합니다.
"""

import re
from typing import Dict, List, Tuple
from datetime import datetime
from loguru import logger


class FraudDetector:
    """
    사기 전화 탐지기 클래스
    텍스트 분석을 통해 사기 패턴을 탐지합니다.
    """
    
    def __init__(self):
        """사기 탐지기 초기화"""
        self.fraud_keywords = self._load_fraud_keywords()
        self.scoring_weights = self._load_scoring_weights()
        logger.info("사기 탐지기가 초기화되었습니다.")
    
    def _load_fraud_keywords(self) -> Dict[str, List[str]]:
        """
        사기 관련 키워드를 카테고리별로 로드합니다.
        
        Returns:
            Dict: 카테고리별 키워드 목록
        """
        return {
            # 기관 사칭 관련
            "institution_impersonation": [
                "금융감독원", "금감원", "검찰청", "경찰청", "국세청", 
                "금융위원회", "국정원", "수사기관", "검찰", "경찰",
                "대법원", "법원", "법무부", "국가기관", "공공기관"
            ],
            
            # 금융 관련
            "financial_terms": [
                "계좌이체", "계좌 이체", "송금", "입금", "출금", "이체",
                "보안카드", "공인인증서", "OTP", "비밀번호", "카드번호",
                "계좌번호", "통장", "카드", "신용카드", "체크카드",
                "대출", "투자", "수익", "이자", "원금", "금리"
            ],
            
            # 긴급성/압박 관련
            "urgency_pressure": [
                "긴급", "즉시", "바로", "당장", "지금", "급하게", "빨리",
                "서둘러", "시간이 없어", "마감", "오늘까지", "내일까지",
                "한시간", "30분", "10분", "5분", "지금 당장"
            ],
            
            # 협박/위협 관련
            "threat_intimidation": [
                "체포", "구속", "압수수색", "영장", "수배", "범죄", "사기",
                "피의자", "용의자", "수사", "조사", "신문", "출두",
                "고발", "고소", "처벌", "벌금", "징역", "실형"
            ],
            
            # 보안/인증 관련
            "security_authentication": [
                "본인인증", "신분확인", "신원확인", "확인절차", "인증",
                "보안 절차", "안전 확인", "계정 보안", "해킹", "보안 위험",
                "개인정보", "주민번호", "생년월일", "휴대폰 번호"
            ],
            
            # 피싱/스미싱 관련
            "phishing_smishing": [
                "문자메시지", "링크", "URL", "홈페이지", "웹사이트",
                "접속", "클릭", "다운로드", "설치", "앱", "어플",
                "인터넷뱅킹", "모바일뱅킹", "온라인", "사이트"
            ],
            
            # 수상한 혜택 관련
            "suspicious_benefits": [
                "당첨", "상금", "보상", "혜택", "할인", "무료", "공짜",
                "이벤트", "프로모션", "특가", "특별가", "한정", "제한",
                "선착순", "추첨", "복권", "로또"
            ]
        }
    
    def _load_scoring_weights(self) -> Dict[str, float]:
        """
        각 카테고리별 가중치를 로드합니다.
        
        Returns:
            Dict: 카테고리별 가중치
        """
        return {
            "institution_impersonation": 3.0,  # 기관 사칭 (매우 높음)
            "financial_terms": 2.5,           # 금융 관련 (높음)
            "urgency_pressure": 2.0,          # 긴급성/압박 (높음)
            "threat_intimidation": 3.0,       # 협박/위협 (매우 높음)
            "security_authentication": 2.0,   # 보안/인증 (높음)
            "phishing_smishing": 2.5,         # 피싱/스미싱 (높음)
            "suspicious_benefits": 1.5        # 수상한 혜택 (중간)
        }
    
    def analyze_text(self, text: str) -> Dict[str, any]:
        """
        텍스트를 분석하여 사기 패턴을 탐지합니다.
        
        Args:
            text: 분석할 텍스트
            
        Returns:
            Dict: 분석 결과
        """
        try:
            if not text or not text.strip():
                return self._create_empty_result()
            
            # 텍스트 전처리
            processed_text = self._preprocess_text(text)
            
            # 키워드 매칭
            keyword_matches = self._find_keyword_matches(processed_text)
            
            # 패턴 분석
            pattern_analysis = self._analyze_patterns(processed_text)
            
            # 위험도 점수 계산
            risk_score = self._calculate_risk_score(keyword_matches, pattern_analysis)
            
            # 위험도 등급 결정
            risk_level = self._determine_risk_level(risk_score)
            
            # 결과 생성
            result = {
                "text": text,
                "processed_text": processed_text,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "is_fraud_suspected": risk_score >= 5.0,
                "keyword_matches": keyword_matches,
                "pattern_analysis": pattern_analysis,
                "analysis_time": datetime.now().isoformat(),
                "recommendations": self._generate_recommendations(risk_level, keyword_matches)
            }
            
            logger.info(f"사기 분석 완료 - 위험도: {risk_score:.2f}, 등급: {risk_level}")
            return result
            
        except Exception as e:
            logger.error(f"텍스트 분석 중 오류: {str(e)}")
            return self._create_error_result(str(e))
    
    def _preprocess_text(self, text: str) -> str:
        """
        텍스트를 전처리합니다.
        
        Args:
            text: 원본 텍스트
            
        Returns:
            str: 전처리된 텍스트
        """
        # 소문자 변환
        processed = text.lower()
        
        # 특수문자 제거 (공백으로 대체)
        processed = re.sub(r'[^\w\s가-힣]', ' ', processed)
        
        # 연속된 공백 제거
        processed = re.sub(r'\s+', ' ', processed)
        
        # 앞뒤 공백 제거
        processed = processed.strip()
        
        return processed
    
    def _find_keyword_matches(self, text: str) -> Dict[str, List[str]]:
        """
        텍스트에서 사기 관련 키워드를 찾습니다.
        
        Args:
            text: 분석할 텍스트
            
        Returns:
            Dict: 카테고리별 매칭된 키워드 목록
        """
        matches = {}
        
        for category, keywords in self.fraud_keywords.items():
            found_keywords = []
            
            for keyword in keywords:
                # 키워드를 소문자로 변환하여 검색
                if keyword.lower() in text:
                    found_keywords.append(keyword)
            
            if found_keywords:
                matches[category] = found_keywords
        
        return matches
    
    def _analyze_patterns(self, text: str) -> Dict[str, any]:
        """
        텍스트에서 사기 패턴을 분석합니다.
        
        Args:
            text: 분석할 텍스트
            
        Returns:
            Dict: 패턴 분석 결과
        """
        patterns = {
            "phone_numbers": self._find_phone_numbers(text),
            "account_numbers": self._find_account_numbers(text),
            "urls": self._find_urls(text),
            "time_pressure": self._detect_time_pressure(text),
            "authority_claim": self._detect_authority_claim(text),
            "financial_instruction": self._detect_financial_instruction(text)
        }
        
        return patterns
    
    def _find_phone_numbers(self, text: str) -> List[str]:
        """전화번호 패턴 찾기"""
        phone_pattern = r'\b\d{2,3}[-.]?\d{3,4}[-.]?\d{4}\b'
        return re.findall(phone_pattern, text)
    
    def _find_account_numbers(self, text: str) -> List[str]:
        """계좌번호 패턴 찾기"""
        account_pattern = r'\b\d{3,4}[-.]?\d{2,6}[-.]?\d{2,8}\b'
        return re.findall(account_pattern, text)
    
    def _find_urls(self, text: str) -> List[str]:
        """URL 패턴 찾기"""
        url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        return re.findall(url_pattern, text)
    
    def _detect_time_pressure(self, text: str) -> bool:
        """시간 압박 표현 탐지"""
        time_pressure_words = ["지금", "당장", "즉시", "바로", "빨리", "급하게", "서둘러"]
        return any(word in text for word in time_pressure_words)
    
    def _detect_authority_claim(self, text: str) -> bool:
        """권위 주장 표현 탐지"""
        authority_words = ["검찰", "경찰", "수사", "조사", "체포", "구속", "영장"]
        return any(word in text for word in authority_words)
    
    def _detect_financial_instruction(self, text: str) -> bool:
        """금융 지시 표현 탐지"""
        financial_instructions = ["이체", "송금", "입금", "계좌", "카드", "비밀번호"]
        return any(word in text for word in financial_instructions)
    
    def _calculate_risk_score(self, keyword_matches: Dict[str, List[str]], 
                             pattern_analysis: Dict[str, any]) -> float:
        """
        위험도 점수를 계산합니다.
        
        Args:
            keyword_matches: 키워드 매칭 결과
            pattern_analysis: 패턴 분석 결과
            
        Returns:
            float: 위험도 점수 (0-10)
        """
        total_score = 0.0
        
        # 키워드 기반 점수
        for category, keywords in keyword_matches.items():
            weight = self.scoring_weights.get(category, 1.0)
            keyword_score = len(keywords) * weight
            total_score += keyword_score
            
            logger.debug(f"카테고리 '{category}': {len(keywords)}개 키워드 × {weight} = {keyword_score}")
        
        # 패턴 기반 점수
        pattern_score = 0.0
        if pattern_analysis.get("phone_numbers"):
            pattern_score += 1.0
        if pattern_analysis.get("account_numbers"):
            pattern_score += 2.0
        if pattern_analysis.get("urls"):
            pattern_score += 1.5
        if pattern_analysis.get("time_pressure"):
            pattern_score += 1.0
        if pattern_analysis.get("authority_claim"):
            pattern_score += 2.0
        if pattern_analysis.get("financial_instruction"):
            pattern_score += 1.5
        
        total_score += pattern_score
        
        # 최대 10점으로 제한
        final_score = min(total_score, 10.0)
        
        logger.debug(f"키워드 점수: {total_score - pattern_score:.2f}, 패턴 점수: {pattern_score:.2f}, 최종 점수: {final_score:.2f}")
        
        return final_score
    
    def _determine_risk_level(self, risk_score: float) -> str:
        """
        위험도 점수를 기반으로 위험 등급을 결정합니다.
        
        Args:
            risk_score: 위험도 점수
            
        Returns:
            str: 위험 등급
        """
        if risk_score >= 7.0:
            return "VERY_HIGH"
        elif risk_score >= 5.0:
            return "HIGH"
        elif risk_score >= 3.0:
            return "MEDIUM"
        elif risk_score >= 1.0:
            return "LOW"
        else:
            return "VERY_LOW"
    
    def _generate_recommendations(self, risk_level: str, 
                                 keyword_matches: Dict[str, List[str]]) -> List[str]:
        """
        위험도에 따른 권장사항을 생성합니다.
        
        Args:
            risk_level: 위험 등급
            keyword_matches: 키워드 매칭 결과
            
        Returns:
            List[str]: 권장사항 목록
        """
        recommendations = []
        
        if risk_level in ["VERY_HIGH", "HIGH"]:
            recommendations.append("⚠️ 즉시 통화를 종료하세요")
            recommendations.append("🚨 절대 개인정보를 제공하지 마세요")
            recommendations.append("📞 해당 기관에 직접 전화로 확인하세요")
            
        if "financial_terms" in keyword_matches:
            recommendations.append("💳 금융 정보 요청 시 의심하세요")
            recommendations.append("🏦 은행에 직접 문의하세요")
            
        if "institution_impersonation" in keyword_matches:
            recommendations.append("🏛️ 공공기관 사칭 의심")
            recommendations.append("✅ 공식 채널로 확인하세요")
            
        if "threat_intimidation" in keyword_matches:
            recommendations.append("⚖️ 협박성 발언 시 신고하세요")
            recommendations.append("📱 112 또는 182로 신고 가능")
            
        if not recommendations:
            recommendations.append("✅ 현재 위험도는 낮으나 주의하세요")
            recommendations.append("🔍 의심스러운 요청 시 확인하세요")
        
        return recommendations
    
    def _create_empty_result(self) -> Dict[str, any]:
        """빈 텍스트에 대한 기본 결과 생성"""
        return {
            "text": "",
            "processed_text": "",
            "risk_score": 0.0,
            "risk_level": "VERY_LOW",
            "is_fraud_suspected": False,
            "keyword_matches": {},
            "pattern_analysis": {},
            "analysis_time": datetime.now().isoformat(),
            "recommendations": ["📝 분석할 텍스트가 없습니다"]
        }
    
    def _create_error_result(self, error_message: str) -> Dict[str, any]:
        """오류 발생 시 결과 생성"""
        return {
            "text": "",
            "processed_text": "",
            "risk_score": 0.0,
            "risk_level": "UNKNOWN",
            "is_fraud_suspected": False,
            "keyword_matches": {},
            "pattern_analysis": {},
            "analysis_time": datetime.now().isoformat(),
            "recommendations": [],
            "error": error_message
        }