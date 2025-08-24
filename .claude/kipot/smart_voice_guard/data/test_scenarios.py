"""
테스트 시나리오 데이터
다양한 사기 전화 시나리오를 텍스트로 정의합니다.
"""

# 고위험 사기 시나리오
HIGH_RISK_SCENARIOS = [
    {
        "title": "금융감독원 사칭 - 계좌 동결",
        "text": "안녕하세요, 금융감독원입니다. 고객님의 계좌에 이상 거래가 발견되어 즉시 계좌가 동결될 예정입니다. 계좌 동결을 해제하려면 지금 당장 보안카드 번호를 알려주세요.",
        "expected_risk": "VERY_HIGH",
        "fraud_type": "기관 사칭 + 금융 사기"
    },
    {
        "title": "검찰청 사칭 - 체포 위협",
        "text": "검찰청 수사관입니다. 고객님이 보이스피싱 사건에 연루되어 체포 영장이 발부되었습니다. 체포를 피하려면 1시간 안에 안전계좌로 돈을 이체해야 합니다. 즉시 계좌번호를 알려주세요.",
        "expected_risk": "VERY_HIGH",
        "fraud_type": "기관 사칭 + 협박 + 금융 사기"
    },
    {
        "title": "은행 사칭 - 보안 업그레이드",
        "text": "국민은행 보안팀입니다. 고객님의 인터넷뱅킹 보안을 업그레이드해야 합니다. 지금 당장 공인인증서 비밀번호와 보안카드 뒷면의 숫자를 알려주세요. 5분 안에 처리하지 않으면 계좌가 정지됩니다.",
        "expected_risk": "VERY_HIGH",
        "fraud_type": "기관 사칭 + 보안 정보 탈취"
    }
]

# 중간위험 시나리오
MEDIUM_RISK_SCENARIOS = [
    {
        "title": "투자 권유 - 고수익 보장",
        "text": "안녕하세요, 투자상담사입니다. 고객님께 특별한 투자 기회를 제안드리고 싶습니다. 이 상품은 원금 보장에 월 20% 수익이 보장되는 특별한 상품입니다. 오늘까지만 가입 가능합니다.",
        "expected_risk": "MEDIUM",
        "fraud_type": "투자 사기"
    },
    {
        "title": "카드사 사칭 - 포인트 소멸",
        "text": "신한카드 고객센터입니다. 고객님의 포인트가 오늘 자정에 소멸됩니다. 포인트를 현금으로 전환하려면 카드번호와 CVV 번호를 확인해주세요.",
        "expected_risk": "MEDIUM",
        "fraud_type": "기관 사칭 + 개인정보 탈취"
    }
]

# 낮은위험 시나리오
LOW_RISK_SCENARIOS = [
    {
        "title": "일반 텔레마케팅",
        "text": "안녕하세요, 보험회사 상담사입니다. 새로운 보험 상품을 소개해드리고 싶어서 전화드렸습니다. 시간 되실 때 상담 가능하신지 문의드립니다.",
        "expected_risk": "LOW",
        "fraud_type": "일반 영업"
    },
    {
        "title": "설문조사",
        "text": "안녕하세요, 시장조사업체입니다. 짧은 설문조사에 참여해주시면 소정의 상품권을 드립니다. 2-3분 정도 소요됩니다.",
        "expected_risk": "LOW",
        "fraud_type": "일반 설문"
    }
]

# 정상 통화 시나리오
NORMAL_SCENARIOS = [
    {
        "title": "친구와의 일상 대화",
        "text": "안녕 철수야, 오늘 점심 뭐 먹었어? 나는 회사 근처 한식집에서 김치찌개 먹었어. 맛있더라. 주말에 영화 볼래?",
        "expected_risk": "VERY_LOW",
        "fraud_type": "정상 대화"
    },
    {
        "title": "업무 통화",
        "text": "안녕하세요, 마케팅팀 김과장입니다. 내일 회의 자료 준비 상황이 어떻게 되시나요? 혹시 도움이 필요하시면 말씀해주세요.",
        "expected_risk": "VERY_LOW",
        "fraud_type": "정상 업무"
    }
]

# 모든 시나리오를 하나의 리스트로 통합
ALL_SCENARIOS = HIGH_RISK_SCENARIOS + MEDIUM_RISK_SCENARIOS + LOW_RISK_SCENARIOS + NORMAL_SCENARIOS

def get_scenario_by_risk_level(risk_level: str):
    """위험도별 시나리오 반환"""
    scenarios = {
        "VERY_HIGH": HIGH_RISK_SCENARIOS,
        "HIGH": HIGH_RISK_SCENARIOS,  # HIGH도 VERY_HIGH와 동일하게 처리
        "MEDIUM": MEDIUM_RISK_SCENARIOS,
        "LOW": LOW_RISK_SCENARIOS,
        "VERY_LOW": NORMAL_SCENARIOS
    }
    return scenarios.get(risk_level, [])