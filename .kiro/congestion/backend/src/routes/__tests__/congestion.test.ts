import request from 'supertest';
import express from 'express';
import congestionRouter from '../congestion';
import { dataStore } from '../../services/dataStore';

// Express 앱 설정
const app = express();
app.use(express.json());
app.use('/api/congestion', congestionRouter);

describe('Congestion Routes', () => {
  beforeEach(() => {
    // 각 테스트 전에 데이터 초기화
    dataStore.clearAllData();
  });

  describe('GET /api/congestion/current', () => {
    it('should return current congestion data', async () => {
      const response = await request(app)
        .get('/api/congestion/current');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('data');
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('should filter by transport types', async () => {
      const response = await request(app)
        .get('/api/congestion/current')
        .query({ transportTypes: 'subway' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.transportTypes).toEqual(['subway']);
      
      // 모든 데이터가 지하철인지 확인
      response.body.data.data.forEach((item: any) => {
        expect(item.transportType).toBe('subway');
      });
    });

    it('should limit results', async () => {
      const response = await request(app)
        .get('/api/congestion/current')
        .query({ limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeLessThanOrEqual(10);
    });

    it('should handle location parameter', async () => {
      const response = await request(app)
        .get('/api/congestion/current')
        .query({ location: '37.5665,126.9780', radius: 500 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.location).toEqual({
        lat: 37.5665,
        lng: 126.9780
      });
      expect(response.body.data.radius).toBe(500);
    });
  });

  describe('GET /api/congestion/prediction', () => {
    it('should require routeId parameter', async () => {
      const response = await request(app)
        .get('/api/congestion/prediction');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Route ID is required');
    });

    it('should return 404 for invalid route', async () => {
      const response = await request(app)
        .get('/api/congestion/prediction')
        .query({ routeId: 'invalid-route' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Route not found');
    });

    it('should return prediction data for valid route', async () => {
      const response = await request(app)
        .get('/api/congestion/prediction')
        .query({ routeId: 'line-2', timeRange: '2' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('routeId', 'line-2');
      expect(response.body.data).toHaveProperty('predictions');
      expect(response.body.data).toHaveProperty('metadata');
      expect(Array.isArray(response.body.data.predictions)).toBe(true);
    });

    it('should validate timeRange parameter', async () => {
      const response = await request(app)
        .get('/api/congestion/prediction')
        .query({ routeId: 'line-2', timeRange: '10' }); // 최대 6시간

      expect(response.status).toBe(200);
      expect(response.body.data.timeRange).toBeLessThanOrEqual(6);
    });
  });

  describe('GET /api/congestion/route/:routeId', () => {
    it('should return route congestion data', async () => {
      const response = await request(app)
        .get('/api/congestion/route/line-2');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('route');
      expect(response.body.data).toHaveProperty('congestionSummary');
      expect(response.body.data.route.id).toBe('line-2');
    });

    it('should return 404 for invalid route', async () => {
      const response = await request(app)
        .get('/api/congestion/route/invalid-route');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Route not found');
    });

    it('should include stations when requested', async () => {
      const response = await request(app)
        .get('/api/congestion/route/line-2')
        .query({ includeStations: 'true' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('stations');
      expect(Array.isArray(response.body.data.stations)).toBe(true);
    });

    it('should exclude stations when not requested', async () => {
      const response = await request(app)
        .get('/api/congestion/route/line-2')
        .query({ includeStations: 'false' });

      expect(response.status).toBe(200);
      expect(response.body.data.stations).toBeUndefined();
    });
  });

  describe('GET /api/congestion/history', () => {
    it('should require routeId parameter', async () => {
      const response = await request(app)
        .get('/api/congestion/history');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Route ID is required');
    });

    it('should return historical data', async () => {
      const response = await request(app)
        .get('/api/congestion/history')
        .query({ 
          routeId: 'line-2',
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date().toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('routeId', 'line-2');
      expect(response.body.data).toHaveProperty('timeRange');
      expect(response.body.data).toHaveProperty('statistics');
      expect(response.body.data).toHaveProperty('data');
    });

    it('should validate time range', async () => {
      const startTime = new Date().toISOString();
      const endTime = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1시간 전

      const response = await request(app)
        .get('/api/congestion/history')
        .query({ 
          routeId: 'line-2',
          startTime,
          endTime
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Start time must be before end time');
    });

    it('should limit results', async () => {
      const response = await request(app)
        .get('/api/congestion/history')
        .query({ 
          routeId: 'line-2',
          limit: 5
        });

      expect(response.status).toBe(200);
      expect(response.body.data.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/congestion/compare', () => {
    it('should require routeIds parameter', async () => {
      const response = await request(app)
        .get('/api/congestion/compare');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Route IDs are required');
    });

    it('should compare multiple routes', async () => {
      const response = await request(app)
        .get('/api/congestion/compare')
        .query({ routeIds: 'line-1,line-2,bus-146' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('routes');
      expect(response.body.data).toHaveProperty('bestRoute');
      expect(response.body.data).toHaveProperty('summary');
      expect(Array.isArray(response.body.data.routes)).toBe(true);
    });

    it('should limit to maximum 5 routes', async () => {
      const routeIds = 'line-1,line-2,line-3,line-4,line-5,line-6,line-7';
      const response = await request(app)
        .get('/api/congestion/compare')
        .query({ routeIds });

      expect(response.status).toBe(200);
      expect(response.body.data.routes.length).toBeLessThanOrEqual(5);
    });

    it('should rank routes by congestion level', async () => {
      const response = await request(app)
        .get('/api/congestion/compare')
        .query({ routeIds: 'line-1,line-2' });

      expect(response.status).toBe(200);
      
      const routes = response.body.data.routes;
      expect(routes.length).toBe(2);
      
      // 첫 번째 노선이 가장 낮은 혼잡도를 가져야 함
      expect(routes[0].rank).toBe(1);
      expect(routes[1].rank).toBe(2);
      expect(routes[0].averageCongestion).toBeLessThanOrEqual(routes[1].averageCongestion);
    });
  });

  describe('GET /api/congestion/websocket-info', () => {
    it('should return websocket connection information', async () => {
      const response = await request(app)
        .get('/api/congestion/websocket-info');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('websocketUrl');
      expect(response.body.data).toHaveProperty('protocols');
      expect(response.body.data).toHaveProperty('supportedEvents');
      expect(response.body.data).toHaveProperty('connectionInfo');
      
      expect(response.body.data.websocketUrl).toContain('ws://');
      expect(Array.isArray(response.body.data.supportedEvents)).toBe(true);
    });
  });
});