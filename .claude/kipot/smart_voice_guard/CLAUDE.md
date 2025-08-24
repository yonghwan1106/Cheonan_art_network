# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart Voice Guard (SVG) is a multi-tier AI-based fraud call detection system with:
- **Backend**: FastAPI server with AI/ML fraud detection services
- **Frontend**: React TypeScript web dashboard for monitoring and management  
- **Mobile**: React Native cross-platform mobile app
- **Testing**: Comprehensive test suite with API and system tests

## Architecture

### Backend (Python/FastAPI)
- **Entry Point**: `backend/main.py` - FastAPI server with CORS middleware
- **API Routes**: `backend/api/voice_analysis.py` - Voice analysis endpoints
- **Services**: `backend/services/` - Core business logic
  - `fraud_detector.py` - AI-based fraud pattern detection
  - `speech_analyzer.py` - Speech-to-text conversion
- **Models**: `backend/models/` - Data models and schemas
- **Config**: `backend/config.py` - Application configuration

### Frontend (React/TypeScript)
- **Entry Point**: `frontend/src/index.tsx`
- **Main App**: `frontend/src/App.tsx` - React Router setup
- **Pages**: `frontend/src/pages/` - Main application screens
  - Dashboard, VoiceAnalysis, KeywordManagement, Statistics, About
- **Components**: `frontend/src/components/` - Reusable UI components
- **Services**: `frontend/src/services/` - API client code
- **Proxy**: Frontend proxies API calls to `http://127.0.0.1:8000`

### Mobile (React Native/TypeScript)
- **Entry Point**: `mobile/index.js`
- **Main App**: `mobile/App.tsx` - Navigation setup  
- **Screens**: `mobile/src/screens/` - Mobile screen components
- **Components**: `mobile/src/components/` - Reusable mobile components
- **Services**: `mobile/src/services/api.ts` - API client
- **Types**: `mobile/src/types/` - TypeScript definitions

## Development Commands

### Backend Development
```bash
# Setup virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run backend server (auto-reload enabled)
cd backend
python main.py
# Server runs at http://127.0.0.1:8000
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
# Runs at http://localhost:3000

# Build for production
npm run build

# Run tests
npm test
```

### Mobile Development
```bash
cd mobile

# Install dependencies  
npm install

# Start Metro bundler
npm start

# Run on platforms
npm run android
npm run ios

# Lint code
npm run lint

# Build for release
npm run build-android
npm run build-ios
```

## Testing Commands

### System Tests
```bash
# Run comprehensive system tests
python test_system.py

# Run API tests
python test_api.py

# Run direct component tests
python direct_test.py
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Mobile Tests
```bash
cd mobile
npm test
```

## Key Technical Details

### API Architecture
- **Base URL**: `http://127.0.0.1:8000`
- **Documentation**: Available at `/docs` (Swagger UI)
- **Health Check**: Available at `/health`
- **CORS**: Configured for all origins (development setup)

### AI/ML Components
- **Speech Recognition**: Uses SpeechRecognition library with Google Speech API
- **Fraud Detection**: Keyword-based pattern matching with weighted scoring
- **Audio Processing**: Supports .wav, .mp3, .m4a, .webm formats via pydub
- **Risk Scoring**: 0-10 scale with 5-tier risk levels (VERY_LOW to VERY_HIGH)

### Dependencies
- **Backend**: FastAPI, uvicorn, speechrecognition, transformers, scikit-learn, loguru
- **Frontend**: React 18, TypeScript, Material-UI, recharts, axios, react-router-dom
- **Mobile**: React Native 0.72, React Navigation, chart-kit, vector-icons, permissions

### Database
- **Primary**: PostgreSQL with SQLAlchemy ORM
- **Migrations**: Alembic for database schema management
- **Connection**: psycopg2-binary driver

### Deployment
- **Docker**: docker-compose.yml provided for containerized deployment
- **Production**: See DEPLOYMENT_GUIDE.md for detailed deployment instructions

## File Structure Notes

- **Tests**: System tests are in root directory (`test_*.py`)
- **Data**: Test scenarios and sample data in `data/`
- **Docs**: Additional documentation in `docs/`
- **Config**: TypeScript configs in respective frontend/mobile directories

## Common Tasks

### Adding New API Endpoints
1. Add route handler in `backend/api/voice_analysis.py`
2. Update corresponding service in `backend/services/`
3. Update frontend API client in `frontend/src/services/`

### Adding New UI Components
1. Create component in appropriate `/components/` directory
2. Export from component index if needed
3. Import and use in pages/screens

### Running Full Stack
1. Start backend: `cd backend && python main.py`
2. Start frontend: `cd frontend && npm start`
3. Optionally start mobile: `cd mobile && npm start`

## Important Notes

- Backend uses port 8000, frontend uses port 3000
- Mobile app connects to backend at `http://127.0.0.1:8000`
- All components use TypeScript for type safety
- CORS is configured for development (allow all origins)
- Voice analysis requires internet connection for Google Speech API