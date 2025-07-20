"""
API 테스트 스크립트
음성 분석 API의 기본 기능을 테스트합니다.
"""

import requests
import json
from data.test_scenarios import ALL_SCENARIOS

def test_text_analysis():
    """텍스트 분석 API 테스트"""
    url = "http://127.0.0.1:8000/api/voice/analyze-text"
    
    print("[TEST] 텍스트 분석 API 테스트 시작")
    print("=" * 60)
    
    for i, scenario in enumerate(ALL_SCENARIOS[:5], 1):  # 처음 5개만 테스트
        print(f"\n{i}. {scenario['title']}")
        print(f"예상 위험도: {scenario['expected_risk']}")
        print(f"텍스트: {scenario['text'][:100]}...")
        
        # API 호출
        response = requests.post(url, params={
            "text": scenario['text'],
            "confidence": 1.0
        })
        
        if response.status_code == 200:
            result = response.json()
            fraud_analysis = result['fraud_analysis']
            
            print(f"[OK] 분석 완료")
            print(f"   실제 위험도: {fraud_analysis['risk_level']}")
            print(f"   위험 점수: {fraud_analysis['risk_score']:.2f}/10")
            print(f"   사기 의심: {'예' if fraud_analysis['is_fraud_suspected'] else '아니오'}")
            print(f"   키워드 매칭: {len(fraud_analysis['keyword_matches'])}개 카테고리")
            
            # 권장사항 출력
            if fraud_analysis['recommendations']:
                print(f"   권장사항: {fraud_analysis['recommendations'][0]}")
        else:
            print(f"[ERROR] 오류 발생: {response.status_code}")
            print(f"   {response.text}")
    
    print("\n" + "=" * 60)
    print("테스트 완료!")

def test_fraud_keywords():
    """사기 키워드 조회 API 테스트"""
    url = "http://127.0.0.1:8000/api/voice/fraud-keywords"
    
    print("\n[TEST] 사기 키워드 조회 API 테스트")
    print("=" * 60)
    
    response = requests.get(url)
    
    if response.status_code == 200:
        result = response.json()
        
        print(f"[OK] 키워드 조회 완료")
        print(f"   총 키워드 수: {result['total_keywords']}개")
        print(f"   카테고리 수: {len(result['categories'])}개")
        
        print("\n[INFO] 카테고리별 키워드 수:")
        for category, keywords in result['keywords_by_category'].items():
            weight = result['category_weights'][category]
            print(f"   - {category}: {len(keywords)}개 키워드 (가중치: {weight})")
    else:
        print(f"[ERROR] 오류 발생: {response.status_code}")

def test_analysis_stats():
    """분석 통계 조회 API 테스트"""
    url = "http://127.0.0.1:8000/api/voice/analysis-stats"
    
    print("\n[TEST] 분석 통계 조회 API 테스트")
    print("=" * 60)
    
    response = requests.get(url)
    
    if response.status_code == 200:
        result = response.json()
        stats = result['statistics']
        health = result['system_health']
        
        print(f"[OK] 통계 조회 완료")
        print(f"   지원 오디오 형식: {', '.join(stats['supported_audio_formats'])}")
        print(f"   최대 파일 크기: {stats['max_file_size_mb']}MB")
        print(f"   시스템 상태: {health['speech_analyzer_status']}, {health['fraud_detector_status']}")
        print(f"   등록된 키워드: {health['total_keywords']}개")
    else:
        print(f"[ERROR] 오류 발생: {response.status_code}")

if __name__ == "__main__":
    try:
        test_text_analysis()
        test_fraud_keywords()
        test_analysis_stats()
    except requests.exceptions.ConnectionError:
        print("[ERROR] 서버에 연결할 수 없습니다. 서버가 실행되고 있는지 확인해주세요.")
        print("   서버 실행 명령: cd backend && python main.py")
    except Exception as e:
        print(f"[ERROR] 테스트 중 오류 발생: {str(e)}")