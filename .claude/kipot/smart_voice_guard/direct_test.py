"""
직접 텍스트 분석 테스트 
API 없이 사기 탐지 모듈을 직접 테스트합니다.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from services.fraud_detector import FraudDetector
from data.test_scenarios import HIGH_RISK_SCENARIOS, MEDIUM_RISK_SCENARIOS, LOW_RISK_SCENARIOS

def test_fraud_detection():
    """사기 탐지 기능 직접 테스트"""
    
    print("=== Smart Voice Guard 사기 탐지 테스트 ===")
    print()
    
    # 사기 탐지기 생성
    detector = FraudDetector()
    
    # 모든 시나리오 테스트
    all_scenarios = HIGH_RISK_SCENARIOS + MEDIUM_RISK_SCENARIOS + LOW_RISK_SCENARIOS
    
    for i, scenario in enumerate(all_scenarios, 1):
        print(f"{i}. {scenario['title']}")
        print(f"   예상 위험도: {scenario['expected_risk']}")
        print(f"   내용: {scenario['text'][:80]}...")
        
        # 분석 수행
        result = detector.analyze_text(scenario['text'])
        
        print(f"   → 실제 위험도: {result['risk_level']}")
        print(f"   → 위험 점수: {result['risk_score']:.2f}/10")
        print(f"   → 사기 의심: {'예' if result['is_fraud_suspected'] else '아니오'}")
        
        # 키워드 매칭 결과
        if result['keyword_matches']:
            print(f"   → 탐지된 키워드 카테고리: {len(result['keyword_matches'])}개")
            for category, keywords in result['keyword_matches'].items():
                print(f"      - {category}: {keywords}")
        
        # 권장사항
        if result['recommendations']:
            print(f"   → 권장사항: {result['recommendations'][0]}")
        
        print()

if __name__ == "__main__":
    test_fraud_detection()