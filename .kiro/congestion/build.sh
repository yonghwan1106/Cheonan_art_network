#!/bin/bash

# Vercel 배포용 빌드 스크립트

echo "🚀 Starting build process..."

# Frontend 디렉토리로 이동
cd frontend

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"

# 빌드 결과 확인
if [ -d "dist" ]; then
    echo "📁 Build output directory exists"
    ls -la dist/
else
    echo "❌ Build output directory not found"
    exit 1
fi

echo "🎉 Ready for deployment!"