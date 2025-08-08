import request from 'supertest';
import express from 'express';
import authRouter from '../auth';
import { dataStore } from '../../services/dataStore';

// Express 앱 설정
const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Routes', () => {
  beforeEach(() => {
    // 각 테스트 전에 데이터 초기화
    dataStore.clearAllData();
  });

  describe('POST /auth/login', () => {
    it('should login with valid demo credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'demo@example.com',
          password: 'demo123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('sessionId');
      expect(response.body.data.user.email).toBe('demo@example.com');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should require email and password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'demo@example.com'
          // password missing
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email and password are required');
    });
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          name: 'New User',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('sessionId');
      expect(response.body.data.user.email).toBe('newuser@example.com');
      expect(response.body.data.user.name).toBe('New User');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          name: 'Test User',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email format');
    });

    it('should reject duplicate email', async () => {
      // 첫 번째 등록
      await request(app)
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          name: 'First User',
          password: 'password123'
        });

      // 중복 등록 시도
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          name: 'Second User',
          password: 'password456'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User already exists');
    });

    it('should require all fields', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          // name and password missing
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email, name, and password are required');
    });
  });

  describe('GET /auth/me', () => {
    let sessionId: string;

    beforeEach(async () => {
      // 로그인하여 세션 ID 획득
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'demo@example.com',
          password: 'demo123'
        });

      sessionId = loginResponse.body.data.sessionId;
    });

    it('should return current user info with valid session', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('x-session-id', sessionId);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe('demo@example.com');
    });

    it('should reject request without session', async () => {
      const response = await request(app)
        .get('/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No session ID provided');
    });

    it('should reject request with invalid session', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('x-session-id', 'invalid-session-id');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or expired session');
    });
  });

  describe('POST /auth/logout', () => {
    let sessionId: string;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'demo@example.com',
          password: 'demo123'
        });

      sessionId = loginResponse.body.data.sessionId;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('x-session-id', sessionId);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Logged out successfully');
    });

    it('should invalidate session after logout', async () => {
      // 로그아웃
      await request(app)
        .post('/auth/logout')
        .set('x-session-id', sessionId);

      // 로그아웃 후 인증이 필요한 엔드포인트 접근 시도
      const response = await request(app)
        .get('/auth/me')
        .set('x-session-id', sessionId);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /auth/profile', () => {
    let sessionId: string;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'demo@example.com',
          password: 'demo123'
        });

      sessionId = loginResponse.body.data.sessionId;
    });

    it('should update user profile', async () => {
      const response = await request(app)
        .put('/auth/profile')
        .set('x-session-id', sessionId)
        .send({
          name: 'Updated Name',
          preferences: {
            congestionTolerance: 'high',
            maxWalkingDistance: 1000
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe('Updated Name');
      expect(response.body.data.user.preferences.congestionTolerance).toBe('high');
      expect(response.body.data.user.preferences.maxWalkingDistance).toBe(1000);
    });

    it('should reject invalid congestion tolerance', async () => {
      const response = await request(app)
        .put('/auth/profile')
        .set('x-session-id', sessionId)
        .send({
          preferences: {
            congestionTolerance: 'invalid'
          }
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid congestion tolerance level');
    });

    it('should reject invalid walking distance', async () => {
      const response = await request(app)
        .put('/auth/profile')
        .set('x-session-id', sessionId)
        .send({
          preferences: {
            maxWalkingDistance: -100
          }
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Walking distance must be between 0 and 2000 meters');
    });
  });

  describe('POST /auth/frequent-routes', () => {
    let sessionId: string;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'demo@example.com',
          password: 'demo123'
        });

      sessionId = loginResponse.body.data.sessionId;
    });

    it('should add frequent route', async () => {
      const response = await request(app)
        .post('/auth/frequent-routes')
        .set('x-session-id', sessionId)
        .send({
          origin: 'gangnam',
          destination: 'hongik-univ',
          frequency: 5,
          preferredTime: '09:00',
          transportType: 'subway'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('route');
      expect(response.body.data.route.origin).toBe('gangnam');
      expect(response.body.data.route.destination).toBe('hongik-univ');
    });

    it('should reject invalid transport type', async () => {
      const response = await request(app)
        .post('/auth/frequent-routes')
        .set('x-session-id', sessionId)
        .send({
          origin: 'gangnam',
          destination: 'hongik-univ',
          frequency: 5,
          preferredTime: '09:00',
          transportType: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid transport type');
    });

    it('should require all fields', async () => {
      const response = await request(app)
        .post('/auth/frequent-routes')
        .set('x-session-id', sessionId)
        .send({
          origin: 'gangnam',
          // destination missing
          frequency: 5,
          preferredTime: '09:00',
          transportType: 'subway'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('All route fields are required');
    });
  });
});