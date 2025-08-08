import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import congestionRoutes from './routes/congestion';
import recommendationRoutes from './routes/recommendations';
import feedbackRoutes from './routes/feedback';

// Import services
import { integratedPredictionService } from './services/integratedPredictionService';
import { congestionGenerator } from './services/congestionGenerator';
import { weatherGenerator } from './services/weatherGenerator';
import { eventGenerator } from './services/eventGenerator';
import { congestionWebSocketServer } from './services/websocketServer';
import { cacheService } from './services/cacheService';
import { userBehaviorSimulation } from './services/userBehaviorSimulation';
import { feedbackIncentiveSystem } from './services/feedbackIncentiveSystem';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    timestamp: new Date().toISOString()
  }
});
app.use('/api', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Congestion Prediction API',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/congestion', congestionRoutes);
app.use('/api/user', recommendationRoutes);
app.use('/api/feedback', feedbackRoutes);

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    data: {
      message: '개인 맞춤형 혼잡도 예측 알림 서비스 API',
      description: '2025 국민행복증진 철도·대중교통·물류 아이디어 공모전 출품작',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        auth: '/api/auth/*',
        user: '/api/user/*',
        congestion: '/api/congestion/*',
        recommendations: '/api/recommendations/*',
        feedback: '/api/feedback/*',
        websocket: '/ws/congestion'
      },
      status: 'operational'
    },
    timestamp: new Date().toISOString()
  });
});

// Service status endpoint
app.get('/api/status', (req, res) => {
  const serviceStatus = integratedPredictionService.getServiceStatus();
  const cacheStats = cacheService.getStats();
  const wsStats = congestionWebSocketServer.getStats();
  
  res.json({
    success: true,
    data: {
      api: {
        status: 'operational',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
      },
      prediction: serviceStatus,
      cache: {
        status: 'operational',
        ...cacheStats
      },
      websocket: {
        status: 'operational',
        ...wsStats
      },
      services: {
        congestionGenerator: 'operational',
        weatherGenerator: 'operational',
        eventGenerator: 'operational',
        cacheService: 'operational',
        websocketServer: 'operational',
        userBehaviorSimulation: 'operational',
        feedbackIncentiveSystem: 'operational'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err.stack);
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Initialize services
async function initializeServices() {
  try {
    console.log('🔧 Initializing services...');
    
    // Initialize WebSocket server
    congestionWebSocketServer.initialize(server);
    
    // Start prediction service
    await integratedPredictionService.startService();
    
    // Start data generators
    congestionGenerator.simulateRealtimeUpdates();
    weatherGenerator.simulateWeatherChange();
    eventGenerator.simulateEventLifecycle();
    
    // User behavior simulation is ready (no continuous simulation needed)
    
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
  }
}

// Start server
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API status: http://localhost:${PORT}/api/status`);
  console.log(`🔗 API docs: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws/congestion`);
  
  // Initialize services after server starts
  await initializeServices();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  integratedPredictionService.stopService();
  congestionWebSocketServer.shutdown();
  cacheService.shutdown();
  // User behavior simulation cleanup (if needed)
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  integratedPredictionService.stopService();
  congestionWebSocketServer.shutdown();
  cacheService.shutdown();
  // User behavior simulation cleanup (if needed)
  process.exit(0);
});