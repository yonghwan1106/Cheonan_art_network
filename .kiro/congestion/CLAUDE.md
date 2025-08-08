# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **개인 맞춤형 혼잡도 예측 알림 서비스** (Personal Congestion Prediction & Notification Service) - a smart mobility solution for the 2025 National Railway & Public Transportation & Logistics Idea Competition. The system uses AI to analyze real-time traffic data and personal movement patterns to provide optimized route and timing recommendations.

## Development Commands

### Installation
```bash
# Install all dependencies (root, frontend, backend)
npm run install:all

# Individual installations
cd frontend && npm install
cd backend && npm install
```

### Development
```bash
# Start both frontend and backend concurrently
npm run dev

# Start individually  
npm run dev:frontend  # Starts on http://localhost:3000
npm run dev:backend   # Starts on http://localhost:3001
```

### Building
```bash
# Build both frontend and backend
npm run build

# Build individually
npm run build:frontend  # Output: frontend/dist
npm run build:backend   # Output: backend/dist
```

### Testing
```bash
# Run all tests
npm run test

# Frontend-specific testing
cd frontend
npm run test:unit          # Component/hook/utility tests
npm run test:integration   # Page-level integration tests  
npm run test:e2e          # End-to-end user journey tests
npm run test:performance  # Performance tests
npm run test:coverage     # Generate coverage report
npm run test:watch        # Watch mode
npm run test:ci           # CI environment

# Backend testing
cd backend
npm run test
npm run test:watch
```

### Linting
```bash
# Frontend
cd frontend && npm run lint

# Backend  
cd backend && npm run lint
cd backend && npm run lint:fix
```

## Architecture Overview

This is a full-stack TypeScript application with a React frontend and Express.js backend:

**Frontend (React + Vite)**
- `/src/components/` - Organized by feature areas (auth, congestion, feedback, admin, mobile)
- `/src/pages/` - Main application pages with routing
- `/src/contexts/` - React Context for authentication and state management
- `/src/hooks/` - Custom React hooks (useRetry, useMediaQuery)
- `/src/services/` - API service layer for backend communication
- Authentication-protected routes with automatic redirect to `/login`

**Backend (Express.js + TypeScript)**
- `/src/routes/` - RESTful API endpoints organized by feature
- `/src/services/` - Core business logic including:
  - `predictionEngine.ts` - AI-based congestion prediction
  - `congestionGenerator.ts` - Real-time data simulation
  - `recommendationEngine.ts` - Route optimization algorithms
  - `websocketServer.ts` - Real-time data broadcasting
  - `cacheService.ts` - In-memory caching layer
- Mock data services for prototype demonstration
- WebSocket support for real-time updates at `/ws/congestion`

## Key Service Architecture

The backend implements a sophisticated service layer:

1. **Integrated Prediction Service** (`integratedPredictionService.ts`) - Orchestrates all prediction components
2. **Data Generators** - Simulate real-world data for prototype:
   - Weather data simulation
   - Event lifecycle simulation  
   - User behavior patterns
3. **Cache Service** - Performance optimization with configurable TTL
4. **WebSocket Server** - Real-time congestion updates to connected clients

## Development Patterns

### Component Structure
Components are organized by feature areas with co-located tests:
```
/components/congestion/
  CongestionMap.tsx
  RouteList.tsx
  __tests__/
    CongestionMap.test.tsx
```

### API Communication
- Frontend uses Axios for HTTP requests
- Proxy configuration routes `/api/*` to backend during development
- WebSocket connection for real-time data at `ws://localhost:3001/ws/congestion`

### State Management
- React Context (`AuthContext`) for authentication state
- Local component state for UI-specific data
- WebSocket subscriptions for real-time data updates

## Testing Strategy

The project implements comprehensive testing:

- **Unit Tests**: Components, hooks, utilities (minimum 80% coverage)
- **Integration Tests**: Page-level functionality and API integration
- **E2E Tests**: Complete user journeys from login to feature usage
- **Performance Tests**: Component rendering and memory usage

Use the custom test runner at `/scripts/run-tests.js` for organized test execution.

## Development Environment

- **Node.js**: 18.x recommended
- **Package Manager**: npm
- **Development Server**: Vite (frontend), tsx watch (backend)
- **TypeScript**: Strict configuration enabled
- **CSS Framework**: Tailwind CSS

## API Endpoints

Backend provides comprehensive API at `/api/*`:
- `/api/auth/*` - Authentication endpoints
- `/api/user/*` - User management and preferences
- `/api/congestion/*` - Real-time congestion data
- `/api/feedback/*` - User feedback system
- `/health` - Service health check
- `/api/status` - Detailed service status

## Deployment

The project is configured for multiple deployment targets:
- **Vercel**: Primary deployment platform (vercel.json configured)
- **Netlify**: Alternative deployment (netlify.toml configured)
- Build process optimized for static frontend deployment with API proxy

## Mock Data System

For prototype demonstration, the backend generates realistic mock data:
- Seoul transit system simulation
- Dynamic congestion patterns based on time/weather/events
- User behavior modeling with feedback integration
- Historical data patterns for prediction accuracy simulation