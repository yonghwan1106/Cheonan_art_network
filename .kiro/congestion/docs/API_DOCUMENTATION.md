# 🔌 API 문서

## 개요

혼잡도 예측 서비스의 Mock API 엔드포인트 문서입니다. 
프로토타입에서는 실제 서버 대신 클라이언트 사이드에서 Mock 데이터를 생성하여 사용합니다.

**Base URL**: `http://localhost:3001` (개발 환경)
**Production**: Mock 데이터로 클라이언트에서 처리

## 🔐 인증

### POST /api/auth/login
사용자 로그인

**Request Body:**
```json
{
  "email": "demo@example.com",
  "password": "demo123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-001",
      "email": "demo@example.com",
      "name": "김철수",
      "points": 1250,
      "preferences": {
        "congestionTolerance": "medium",
        "maxWalkingDistance": 800,
        "maxTransfers": 2,
        "notificationEnabled": true,
        "notificationTiming": 30
      }
    },
    "token": "mock-jwt-token-123456789"
  }
}
```

### POST /api/auth/register
사용자 회원가입

**Request Body:**
```json
{
  "name": "홍길동",
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /api/auth/logout
로그아웃

## 🚇 혼잡도 데이터

### GET /api/congestion/current
실시간 혼잡도 데이터 조회

**Query Parameters:**
- `line` (optional): 노선 필터 (예: "2호선")
- `station` (optional): 역 필터 (예: "강남역")

**Response:**
```json
{
  "success": true,
  "data": {
    "stations": [
      {
        "id": "station-gangnam",
        "name": "강남역",
        "line": "2호선",
        "congestionLevel": "high",
        "congestionPercentage": 85,
        "predictedCongestion": {
          "next30min": 78,
          "next60min": 65,
          "next90min": 45
        },
        "lastUpdated": "2025-01-08T10:30:00Z",
        "coordinates": {
          "lat": 37.4979,
          "lng": 127.0276
        }
      }
    ],
    "timestamp": "2025-01-08T10:30:00Z",
    "updateInterval": 300
  }
}
```

### GET /api/congestion/prediction
혼잡도 예측 데이터

**Query Parameters:**
- `station`: 역명 (필수)
- `time`: 예측 시간 (ISO 8601 형식)
- `duration`: 예측 기간 (분 단위, 기본값: 120)

**Response:**
```json
{
  "success": true,
  "data": {
    "station": "강남역",
    "predictions": [
      {
        "time": "2025-01-08T11:00:00Z",
        "congestionLevel": "medium",
        "congestionPercentage": 65,
        "confidence": 0.85
      }
    ],
    "factors": {
      "weather": "clear",
      "events": [],
      "dayOfWeek": "wednesday",
      "isHoliday": false
    }
  }
}
```

## 🗺️ 경로 추천

### POST /api/routes/search
경로 검색 및 추천

**Request Body:**
```json
{
  "origin": "강남역",
  "destination": "홍대입구역",
  "departureTime": "2025-01-08T09:00:00Z",
  "preferences": {
    "avoidCrowded": true,
    "maxWalkingDistance": 1000,
    "maxTransfers": 2,
    "preferredModes": ["subway", "bus"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "routes": [
      {
        "id": "route-001",
        "summary": {
          "duration": 45,
          "distance": 15.2,
          "transfers": 1,
          "walkingDistance": 800,
          "congestionScore": 6.5,
          "cost": 1370
        },
        "steps": [
          {
            "mode": "walking",
            "instruction": "강남역까지 도보 이동",
            "duration": 5,
            "distance": 400
          },
          {
            "mode": "subway",
            "line": "2호선",
            "from": "강남역",
            "to": "신촌역",
            "duration": 25,
            "congestionLevel": "medium"
          },
          {
            "mode": "subway",
            "line": "6호선",
            "from": "신촌역",
            "to": "홍대입구역",
            "duration": 10,
            "congestionLevel": "low"
          }
        ],
        "alternatives": [
          {
            "reason": "less_crowded",
            "additionalTime": 8,
            "congestionImprovement": 2.1
          }
        ]
      }
    ],
    "searchTime": "2025-01-08T10:30:00Z"
  }
}
```

### GET /api/routes/favorites
사용자 즐겨찾기 경로 조회

**Response:**
```json
{
  "success": true,
  "data": {
    "routes": [
      {
        "id": "fav-001",
        "name": "출근 경로",
        "origin": "강남역",
        "destination": "홍대입구역",
        "frequency": 5,
        "lastUsed": "2025-01-07T09:00:00Z",
        "averageDuration": 42,
        "averageCongestion": 6.8
      }
    ]
  }
}
```

## 📅 일정 관리

### GET /api/schedule
사용자 일정 조회

**Query Parameters:**
- `date`: 조회 날짜 (YYYY-MM-DD)
- `range`: 조회 범위 (day, week, month)

**Response:**
```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": "schedule-001",
        "title": "회사 미팅",
        "location": "강남역",
        "startTime": "2025-01-08T09:00:00Z",
        "endTime": "2025-01-08T10:00:00Z",
        "travelTime": 45,
        "recommendedDeparture": "2025-01-08T08:15:00Z",
        "route": {
          "origin": "홍대입구역",
          "destination": "강남역",
          "congestionScore": 7.2
        }
      }
    ]
  }
}
```

### POST /api/schedule
새 일정 추가

**Request Body:**
```json
{
  "title": "병원 예약",
  "location": "신촌역",
  "startTime": "2025-01-08T14:00:00Z",
  "endTime": "2025-01-08T15:00:00Z",
  "origin": "강남역",
  "notificationEnabled": true
}
```

## 💬 피드백

### POST /api/feedback/congestion
혼잡도 피드백 제출

**Request Body:**
```json
{
  "stationId": "station-gangnam",
  "actualCongestion": 7,
  "predictedCongestion": 8,
  "timestamp": "2025-01-08T09:30:00Z",
  "comment": "예상보다 덜 혼잡했습니다",
  "photoUrl": "optional-photo-url"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "feedbackId": "feedback-001",
    "pointsEarned": 10,
    "accuracy": 0.92,
    "message": "피드백 감사합니다! 10포인트가 적립되었습니다."
  }
}
```

### GET /api/feedback/history
사용자 피드백 히스토리

**Response:**
```json
{
  "success": true,
  "data": {
    "feedbacks": [
      {
        "id": "feedback-001",
        "station": "강남역",
        "rating": 7,
        "timestamp": "2025-01-08T09:30:00Z",
        "pointsEarned": 10,
        "status": "verified"
      }
    ],
    "stats": {
      "totalFeedbacks": 25,
      "totalPoints": 250,
      "averageAccuracy": 0.89
    }
  }
}
```

## 👤 사용자 관리

### GET /api/user/profile
사용자 프로필 조회

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-001",
      "name": "김철수",
      "email": "demo@example.com",
      "points": 1250,
      "level": "Gold",
      "joinDate": "2024-12-01T00:00:00Z",
      "preferences": {
        "congestionTolerance": "medium",
        "maxWalkingDistance": 800,
        "maxTransfers": 2,
        "notificationEnabled": true,
        "notificationTiming": 30
      },
      "stats": {
        "totalTrips": 156,
        "totalFeedbacks": 45,
        "accuracyRate": 0.91
      }
    }
  }
}
```

### PUT /api/user/preferences
사용자 선호도 업데이트

**Request Body:**
```json
{
  "congestionTolerance": "low",
  "maxWalkingDistance": 600,
  "maxTransfers": 1,
  "notificationEnabled": true,
  "notificationTiming": 15,
  "preferredModes": ["subway"]
}
```

## 🔔 알림

### GET /api/notifications
사용자 알림 조회

**Query Parameters:**
- `unread`: 읽지 않은 알림만 조회 (true/false)
- `limit`: 조회 개수 제한 (기본값: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-001",
        "type": "congestion_alert",
        "title": "혼잡도 경고",
        "message": "2호선에서 높은 혼잡도가 예상됩니다. 30분 일찍 출발하세요.",
        "timestamp": "2025-01-08T08:30:00Z",
        "read": false,
        "actionUrl": "/routes?from=강남역&to=홍대입구역"
      }
    ],
    "stats": {
      "total": 15,
      "unread": 3
    }
  }
}
```

### PUT /api/notifications/:id/read
알림 읽음 처리

## 📊 관리자 API

### GET /api/admin/stats
시스템 통계 조회

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "active": 890,
      "newToday": 15
    },
    "predictions": {
      "totalRequests": 15420,
      "accuracy": 0.87,
      "averageResponseTime": 120
    },
    "feedback": {
      "totalSubmissions": 3420,
      "averageRating": 4.2,
      "responseRate": 0.68
    }
  }
}
```

## 🚨 에러 응답

모든 API는 다음과 같은 에러 형식을 사용합니다:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "요청 데이터가 올바르지 않습니다.",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2025-01-08T10:30:00Z"
}
```

### 에러 코드

- `INVALID_REQUEST`: 잘못된 요청 데이터
- `UNAUTHORIZED`: 인증 실패
- `FORBIDDEN`: 권한 없음
- `NOT_FOUND`: 리소스를 찾을 수 없음
- `RATE_LIMIT_EXCEEDED`: 요청 한도 초과
- `INTERNAL_ERROR`: 서버 내부 오류

## 🔄 실시간 데이터 (WebSocket)

### 연결
```javascript
const ws = new WebSocket('ws://localhost:3001/ws');
```

### 혼잡도 업데이트 구독
```json
{
  "type": "subscribe",
  "channel": "congestion",
  "filters": {
    "lines": ["2호선", "3호선"],
    "stations": ["강남역", "홍대입구역"]
  }
}
```

### 실시간 데이터 수신
```json
{
  "type": "congestion_update",
  "data": {
    "station": "강남역",
    "congestionLevel": "high",
    "congestionPercentage": 87,
    "timestamp": "2025-01-08T10:35:00Z"
  }
}
```

---

**참고**: 이 문서는 프로토타입용 Mock API를 기준으로 작성되었습니다. 실제 서비스에서는 실시간 데이터 연동 및 추가 보안 기능이 필요합니다.