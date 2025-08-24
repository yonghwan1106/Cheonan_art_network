# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

천안아트네트워크 (Cheonan Art Network) is an AI-powered artist-curator matching platform built with Next.js 14 and TypeScript. The platform connects local artists with professional curators to create optimal cultural art projects in the Cheonan area.

## Development Commands

### Core Development Commands
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production application  
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Package Management
- `npm install` - Install all dependencies
- Dependencies include: Next.js 15.5.0, React 19.1.0, Tailwind CSS 4, lucide-react icons, TypeScript 5

## Project Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **State Management**: React Context API + useState
- **Data**: Mock JSON data with realistic matching algorithms
- **Authentication**: Local state simulation (no backend)

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── login/             # Authentication pages  
│   ├── register/          
│   ├── projects/          # Project listings
│   ├── matching/          # AI matching results
│   └── profile/           # User profiles
├── components/            # Reusable UI components
│   ├── common/           # Generic UI (Button, Card, Input)
│   ├── layout/           # Layout components (Header, Layout)
│   └── features/         # Feature-specific components
├── context/              # React Context for global state
├── data/                 # Mock data files
│   ├── mockArtists.ts    # Artist sample data with portfolios
│   ├── mockCurators.ts   # Curator data with preferences  
│   └── mockProjects.ts   # Project data with requirements
└── utils/               # Utility functions
    └── matchingAlgorithm.ts  # AI matching logic
```

## Key Components & Systems

### AI Matching Algorithm
The core matching system (`utils/matchingAlgorithm.ts`) uses a weighted scoring system:
- **Basic Compatibility (40%)**: Genre matching, budget range, timeline fit
- **Style Preference (25%)**: Artist style vs curator preferences  
- **Experience Match (20%)**: Required experience level alignment
- **Audience Prediction (15%)**: Expected audience satisfaction based on ratings and genre popularity

### Data Architecture
All data uses TypeScript interfaces defined in mock data files:
- `Artist`: Complete artist profiles with portfolios, ratings, availability
- `Curator`: Curator profiles with past projects and preferences
- `Project`: Detailed project requirements, budgets, timelines
- `MatchingResult`: Scoring breakdown with explanations

### Context System
`AppContext.tsx` manages global application state including:
- Current user authentication state
- Selected projects and matching results
- User preferences and settings

## Development Guidelines

### Component Patterns
- All components use TypeScript with proper interface definitions
- Common UI components are reusable and styled with Tailwind CSS
- Feature components are organized by domain (auth, matching, profile)
- Use React hooks for state management within components

### Styling Approach
- Tailwind CSS 4 for all styling
- Responsive design with mobile-first approach
- Consistent color scheme: Blue primary, purple accents
- Lucide React icons throughout the interface

### Mock Data Usage
- All data is simulated - no external APIs or databases
- Mock data includes realistic Korean names, locations, and cultural contexts
- Matching algorithms work with actual data relationships
- Artist portfolios include detailed work information

### Authentication Flow
- Simulated login/register with predefined demo accounts
- Demo artist: minsu.kim@email.com / password
- Demo curator: sujin.lee@cfac.or.kr / password
- Session state managed in React Context

## Testing & Quality

- ESLint configuration extends Next.js recommended rules
- TypeScript strict mode enabled
- No specific test framework configured - tests should be added as needed

## Deployment

- Configured for Vercel deployment
- Build process optimizes for production
- Static assets served from `/public` directory
- Environment variables not currently used (mock data only)

## Cultural Context

This platform specifically targets the Cheonan cultural community with:
- Korean language interface
- Local artist and venue references
- Cultural project types common in Korean art scene
- Budget ranges in Korean Won (KRW)