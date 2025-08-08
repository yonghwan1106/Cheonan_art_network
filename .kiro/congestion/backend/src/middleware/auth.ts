import { Request, Response, NextFunction } from 'express';
import { User } from '../types';
import { dataStore } from '../services/dataStore';

// 세션 저장소 (프로토타입용 간단한 메모리 저장소)
const sessions: Map<string, { userId: string; createdAt: Date; lastAccess: Date }> = new Map();

// 세션 만료 시간 (30분)
const SESSION_TIMEOUT = 30 * 60 * 1000;

/**
 * 확장된 Request 타입 (사용자 정보 포함)
 */
export interface AuthenticatedRequest extends Request {
  user?: User;
  sessionId?: string;
}

/**
 * 세션 ID 생성
 */
function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 세션 생성
 */
export function createSession(userId: string): string {
  const sessionId = generateSessionId();
  const now = new Date();
  
  sessions.set(sessionId, {
    userId,
    createdAt: now,
    lastAccess: now
  });

  console.log(`🔐 Session created for user ${userId}: ${sessionId}`);
  return sessionId;
}

/**
 * 세션 검증
 */
export function validateSession(sessionId: string): { userId: string } | null {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return null;
  }

  const now = new Date();
  const timeSinceLastAccess = now.getTime() - session.lastAccess.getTime();
  
  // 세션 만료 확인
  if (timeSinceLastAccess > SESSION_TIMEOUT) {
    sessions.delete(sessionId);
    console.log(`⏰ Session expired: ${sessionId}`);
    return null;
  }

  // 마지막 접근 시간 업데이트
  session.lastAccess = now;
  
  return { userId: session.userId };
}

/**
 * 세션 삭제
 */
export function destroySession(sessionId: string): boolean {
  const deleted = sessions.delete(sessionId);
  if (deleted) {
    console.log(`🗑️ Session destroyed: ${sessionId}`);
  }
  return deleted;
}

/**
 * 인증 미들웨어
 */
export function authenticateSession(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const sessionId = req.headers['x-session-id'] as string || req.cookies?.sessionId;

  if (!sessionId) {
    res.status(401).json({
      success: false,
      error: 'No session ID provided',
      timestamp: new Date().toISOString()
    });
    return;
  }

  const sessionData = validateSession(sessionId);
  
  if (!sessionData) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired session',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // 사용자 정보 조회
  const user = dataStore.getUserById(sessionData.userId);
  
  if (!user) {
    // 사용자가 삭제된 경우 세션도 삭제
    destroySession(sessionId);
    res.status(401).json({
      success: false,
      error: 'User not found',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // 요청 객체에 사용자 정보 추가
  req.user = user;
  req.sessionId = sessionId;
  
  next();
}

/**
 * 선택적 인증 미들웨어 (인증되지 않아도 통과)
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const sessionId = req.headers['x-session-id'] as string || req.cookies?.sessionId;

  if (sessionId) {
    const sessionData = validateSession(sessionId);
    
    if (sessionData) {
      const user = dataStore.getUserById(sessionData.userId);
      if (user) {
        req.user = user;
        req.sessionId = sessionId;
      }
    }
  }

  next();
}

/**
 * 관리자 권한 확인 미들웨어
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // 간단한 관리자 확인 (이메일 기반)
  const adminEmails = ['admin@example.com', 'demo@example.com'];
  
  if (!adminEmails.includes(req.user.email)) {
    res.status(403).json({
      success: false,
      error: 'Admin privileges required',
      timestamp: new Date().toISOString()
    });
    return;
  }

  next();
}

/**
 * 세션 정리 (만료된 세션 삭제)
 */
export function cleanupExpiredSessions(): void {
  const now = new Date();
  let cleanedCount = 0;

  for (const [sessionId, session] of sessions.entries()) {
    const timeSinceLastAccess = now.getTime() - session.lastAccess.getTime();
    
    if (timeSinceLastAccess > SESSION_TIMEOUT) {
      sessions.delete(sessionId);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
  }
}

/**
 * 세션 통계
 */
export function getSessionStats(): {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
} {
  const now = new Date();
  let activeSessions = 0;
  let expiredSessions = 0;

  for (const session of sessions.values()) {
    const timeSinceLastAccess = now.getTime() - session.lastAccess.getTime();
    
    if (timeSinceLastAccess > SESSION_TIMEOUT) {
      expiredSessions++;
    } else {
      activeSessions++;
    }
  }

  return {
    totalSessions: sessions.size,
    activeSessions,
    expiredSessions
  };
}

// 주기적으로 만료된 세션 정리 (10분마다)
setInterval(cleanupExpiredSessions, 10 * 60 * 1000);