"""
Smart Voice Guard 시스템 상태 테스트
백엔드와 프론트엔드의 실행 상태를 확인합니다.
"""

import requests
import sys
import time

def test_backend():
    """백엔드 API 서버 테스트"""
    print("=== 백엔드 API 서버 테스트 ===")
    
    try:
        # 기본 상태 확인
        response = requests.get("http://127.0.0.1:8000/health", timeout=5)
        if response.status_code == 200:
            print("[OK] 백엔드 서버 정상 응답")
        else:
            print(f"[ERROR] 백엔드 서버 오류: {response.status_code}")
            return False
            
        # 텍스트 분석 테스트
        test_text = "안녕하세요, 금융감독원입니다. 계좌가 동결됩니다."
        response = requests.post(
            "http://127.0.0.1:8000/api/voice/analyze-text",
            params={"text": test_text, "confidence": 1.0},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            risk_score = result['fraud_analysis']['risk_score']
            print(f"[OK] 텍스트 분석 성공 - 위험도: {risk_score:.1f}/10")
        else:
            print(f"[ERROR] 텍스트 분석 실패: {response.status_code}")
            return False
            
        return True
        
    except requests.exceptions.ConnectionError:
        print("[ERROR] 백엔드 서버에 연결할 수 없습니다.")
        print("        해결방법: cd backend && python main.py")
        return False
    except Exception as e:
        print(f"[ERROR] 백엔드 테스트 중 오류: {str(e)}")
        return False

def test_frontend():
    """프론트엔드 웹 서버 테스트"""
    print("\n=== 프론트엔드 웹 서버 테스트 ===")
    
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            if "Smart Voice Guard" in response.text:
                print("[OK] 프론트엔드 서버 정상 응답")
                return True
            else:
                print("[ERROR] 프론트엔드 내용 오류")
                return False
        else:
            print(f"[ERROR] 프론트엔드 서버 오류: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("[ERROR] 프론트엔드 서버에 연결할 수 없습니다.")
        print("        해결방법: cd frontend && npm start")
        return False
    except Exception as e:
        print(f"[ERROR] 프론트엔드 테스트 중 오류: {str(e)}")
        return False

def main():
    """시스템 전체 테스트"""
    print("Smart Voice Guard 시스템 상태 테스트")
    print("=" * 50)
    
    backend_ok = test_backend()
    frontend_ok = test_frontend()
    
    print("\n" + "=" * 50)
    print("[RESULT] 테스트 결과 요약")
    print("=" * 50)
    
    if backend_ok and frontend_ok:
        print("[SUCCESS] 모든 시스템이 정상 작동중입니다!")
        print("\n[INFO] 접속 주소:")
        print("   - 웹 대시보드: http://localhost:3000")
        print("   - API 문서: http://127.0.0.1:8000/docs")
        print("   - API 상태: http://127.0.0.1:8000/health")
        
        print("\n[GUIDE] 사용 방법:")
        print("   1. 웹 브라우저에서 http://localhost:3000 접속")
        print("   2. 좌측 메뉴에서 원하는 기능 선택")
        print("   3. '음성 분석' 페이지에서 텍스트 분석 테스트")
        
        return True
    else:
        print("[ERROR] 일부 시스템에 문제가 있습니다.")
        print("\n[FIX] 해결 방법:")
        if not backend_ok:
            print("   - 백엔드: cd backend && python main.py")
        if not frontend_ok:
            print("   - 프론트엔드: cd frontend && npm start")
        
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)