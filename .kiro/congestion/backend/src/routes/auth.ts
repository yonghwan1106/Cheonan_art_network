import express, { Request, Response } from 'express';
import { User, UserPreferences, FrequentRoute } from '../types';
import { dataStore } from '../services/dataStore';
import { createSession, destroySession, AuthenticatedRequest, authenticateSession } from '../middleware/auth';
import { validators } from '../utils/helpers';

const router = express.Router();

/**
 * 사용자 등록 (데모용 하드코딩된 사용자)
 */
router.post('/register', (req: Request, res: Response) => {
  const { email, name, password } = req.body;

  // 입력 검증
  if (!email || !name || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email, name, and password are required',
      timestamp: new Date().toISOString()
    });
  }

  if (!validators.isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format',
      timestamp: new Date().toISOString()
    });
  }

  // 기존 사용자 확인
  const existingUser = dataStore.getUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: 'User already exists',
      timestamp: new Date().toISOString()
    });
  }

  // 기본 선호도 설정
  const defaultPreferences: UserPreferences = {
    congestionTolerance: 'medium',
    maxWalkingDistance: 800,
    maxTransfers: 2,
    notificationEnabled: true,
    notificationTiming: 30
  };

  // 새 사용자 생성
  const newUser = dataStore.createUser({
    email,
    name,
    preferences: defaultPreferences,
    frequentRoutes: [],
    points: 0
  });

  // 세션 생성
  const sessionId = createSession(newUser.id);

  // 비밀번호 제외하고 응답
  const { ...userWithoutPassword } = newUser;

  res.status(201).json({
    success: true,
    data: {
      user: userWithoutPassword,
      sessionId
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * 사용자 로그인
 */
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 입력 검증
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
      timestamp: new Date().toISOString()
    });
  }

  // 데모용 하드코딩된 로그인 (실제로는 비밀번호 해시 비교)
  const demoCredentials = [
    { email: 'demo@example.com', password: 'demo123' },
    { email: 'test@example.com', password: 'test123' },
    { email: 'admin@example.com', password: 'admin123' }
  ];

  const validCredential = demoCredentials.find(
    cred => cred.email === email && cred.password === password
  );

  if (!validCredential) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password',
      timestamp: new Date().toISOString()
    });
  }

  // 사용자 조회 또는 생성
  let user = dataStore.getUserByEmail(email);
  
  if (!user) {
    // 데모 사용자가 없으면 생성
    const defaultPreferences: UserPreferences = {
      congestionTolerance: 'medium',
      maxWalkingDistance: 800,
      maxTransfers: 2,
      notificationEnabled: true,
      notificationTiming: 30
    };

    const frequentRoutes: FrequentRoute[] = email === 'demo@example.com' ? [
      {
        id: 'freq-route-001',
        origin: 'hongik-univ',
        destination: 'gangnam',
        frequency: 5,
        preferredTime: '08:30',
        transportType: 'subway'
      }
    ] : [];

    user = dataStore.createUser({
      email,
      name: email.split('@')[0],
      preferences: defaultPreferences,
      frequentRoutes,
      points: email === 'demo@example.com' ? 1250 : 0
    });
  }

  // 세션 생성
  const sessionId = createSession(user.id);

  res.json({
    success: true,
    data: {
      user,
      sessionId
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * 사용자 로그아웃
 */
router.post('/logout', authenticateSession, (req: AuthenticatedRequest, res: Response) => {
  if (req.sessionId) {
    destroySession(req.sessionId);
  }

  res.json({
    success: true,
    data: { message: 'Logged out successfully' },
    timestamp: new Date().toISOString()
  });
});

/**
 * 현재 사용자 정보 조회
 */
router.get('/me', authenticateSession, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: { user: req.user },
    timestamp: new Date().toISOString()
  });
});

/**
 * 사용자 프로필 업데이트
 */
router.put('/profile', authenticateSession, (req: AuthenticatedRequest, res: Response) => {
  const { name, preferences } = req.body;
  const userId = req.user!.id;

  const updates: Partial<User> = {};

  if (name) {
    updates.name = name;
  }

  if (preferences) {
    // 선호도 검증
    const validTolerances = ['low', 'medium', 'high'];
    if (preferences.congestionTolerance && !validTolerances.includes(preferences.congestionTolerance)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid congestion tolerance level',
        timestamp: new Date().toISOString()
      });
    }

    if (preferences.maxWalkingDistance && (preferences.maxWalkingDistance < 0 || preferences.maxWalkingDistance > 2000)) {
      return res.status(400).json({
        success: false,
        error: 'Walking distance must be between 0 and 2000 meters',
        timestamp: new Date().toISOString()
      });
    }

    if (preferences.maxTransfers && (preferences.maxTransfers < 0 || preferences.maxTransfers > 5)) {
      return res.status(400).json({
        success: false,
        error: 'Max transfers must be between 0 and 5',
        timestamp: new Date().toISOString()
      });
    }

    updates.preferences = { ...req.user!.preferences, ...preferences };
  }

  const updatedUser = dataStore.updateUser(userId, updates);

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    data: { user: updatedUser },
    timestamp: new Date().toISOString()
  });
});

/**
 * 자주 이용하는 경로 추가
 */
router.post('/frequent-routes', authenticateSession, (req: AuthenticatedRequest, res: Response) => {
  const { origin, destination, frequency, preferredTime, transportType } = req.body;
  const userId = req.user!.id;

  // 입력 검증
  if (!origin || !destination || !frequency || !preferredTime || !transportType) {
    return res.status(400).json({
      success: false,
      error: 'All route fields are required',
      timestamp: new Date().toISOString()
    });
  }

  if (!validators.isValidTransportType(transportType)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid transport type',
      timestamp: new Date().toISOString()
    });
  }

  // 새 경로 생성
  const newRoute: FrequentRoute = {
    id: `freq-route-${Date.now()}`,
    origin,
    destination,
    frequency,
    preferredTime,
    transportType
  };

  // 사용자 업데이트
  const currentUser = req.user!;
  const updatedRoutes = [...currentUser.frequentRoutes, newRoute];
  
  const updatedUser = dataStore.updateUser(userId, {
    frequentRoutes: updatedRoutes
  });

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      timestamp: new Date().toISOString()
    });
  }

  res.status(201).json({
    success: true,
    data: { route: newRoute, user: updatedUser },
    timestamp: new Date().toISOString()
  });
});

/**
 * 자주 이용하는 경로 삭제
 */
router.delete('/frequent-routes/:routeId', authenticateSession, (req: AuthenticatedRequest, res: Response) => {
  const { routeId } = req.params;
  const userId = req.user!.id;

  const currentUser = req.user!;
  const updatedRoutes = currentUser.frequentRoutes.filter(route => route.id !== routeId);

  if (updatedRoutes.length === currentUser.frequentRoutes.length) {
    return res.status(404).json({
      success: false,
      error: 'Route not found',
      timestamp: new Date().toISOString()
    });
  }

  const updatedUser = dataStore.updateUser(userId, {
    frequentRoutes: updatedRoutes
  });

  res.json({
    success: true,
    data: { user: updatedUser },
    timestamp: new Date().toISOString()
  });
});

/**
 * 사용자 포인트 조회
 */
router.get('/points', authenticateSession, (req: AuthenticatedRequest, res: Response) => {
  const points = req.user!.points;
  
  // 포인트 히스토리 시뮬레이션
  const pointHistory = [
    { date: '2025-01-07', points: 50, reason: '비혼잡 시간대 이용' },
    { date: '2025-01-06', points: 30, reason: '대체 경로 이용' },
    { date: '2025-01-05', points: 25, reason: '피드백 제출' },
    { date: '2025-01-04', points: 40, reason: '비혼잡 시간대 이용' }
  ];

  res.json({
    success: true,
    data: {
      currentPoints: points,
      history: pointHistory,
      availableRewards: [
        { id: 'discount-10', name: '교통비 10% 할인', cost: 100 },
        { id: 'discount-20', name: '교통비 20% 할인', cost: 200 },
        { id: 'free-coffee', name: '커피 쿠폰', cost: 150 }
      ]
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * 포인트 사용 (보상 교환)
 */
router.post('/points/redeem', authenticateSession, (req: AuthenticatedRequest, res: Response) => {
  const { rewardId, cost } = req.body;
  const userId = req.user!.id;
  const currentPoints = req.user!.points;

  if (!rewardId || !cost) {
    return res.status(400).json({
      success: false,
      error: 'Reward ID and cost are required',
      timestamp: new Date().toISOString()
    });
  }

  if (currentPoints < cost) {
    return res.status(400).json({
      success: false,
      error: 'Insufficient points',
      timestamp: new Date().toISOString()
    });
  }

  // 포인트 차감
  const updatedUser = dataStore.updateUser(userId, {
    points: currentPoints - cost
  });

  res.json({
    success: true,
    data: {
      message: 'Reward redeemed successfully',
      rewardId,
      pointsUsed: cost,
      remainingPoints: updatedUser!.points
    },
    timestamp: new Date().toISOString()
  });
});

export default router;