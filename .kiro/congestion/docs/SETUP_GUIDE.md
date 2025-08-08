# 🛠️ 개발 환경 설정 가이드

## 📋 시스템 요구사항

### 필수 소프트웨어

- **Node.js**: 18.x 이상
- **npm**: 9.x 이상 (또는 yarn 1.22.x 이상)
- **Git**: 2.30.x 이상
- **VS Code**: 최신 버전 (권장)

### 권장 VS Code 확장

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-jest",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## 🚀 프로젝트 설정

### 1. 저장소 클론

```bash
# HTTPS
git clone https://github.com/yonghwan1106/congestion.git

# SSH
git clone git@github.com:yonghwan1106/congestion.git

cd congestion
```

### 2. 의존성 설치

```bash
# Frontend 의존성 설치
cd frontend
npm install

# Backend 의존성 설치 (선택사항)
cd ../backend
npm install

# 루트로 돌아가기
cd ..
```

### 3. 환경 변수 설정

#### Frontend 환경 변수

```bash
# frontend/.env.local 파일 생성
cd frontend
cat > .env.local << EOF
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_APP_NAME=혼잡도 예측 서비스
VITE_APP_VERSION=1.0.0
EOF
```

#### Backend 환경 변수 (선택사항)

```bash
# backend/.env 파일 생성
cd backend
cat > .env << EOF
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
EOF
```

## 🏃‍♂️ 개발 서버 실행

### Frontend 개발 서버

```bash
cd frontend
npm run dev
```

브라우저에서 http://localhost:3000 접속

### Backend 개발 서버 (선택사항)

```bash
cd backend
npm run dev
```

API 서버가 http://localhost:3001 에서 실행됩니다.

### 동시 실행 (권장)

```bash
# 루트 디렉토리에서
npm run dev
```

이 명령어는 frontend와 backend를 동시에 실행합니다.

## 🧪 테스트 실행

### 단위 테스트

```bash
cd frontend
npm test
```

### 특정 테스트 유형 실행

```bash
# 단위 테스트만
npm run test:unit

# 통합 테스트만
npm run test:integration

# E2E 테스트만
npm run test:e2e

# 성능 테스트만
npm run test:performance
```

### 테스트 커버리지

```bash
npm run test:coverage
```

커버리지 리포트는 `coverage/` 폴더에 생성됩니다.

## 🔨 빌드

### 프로덕션 빌드

```bash
cd frontend
npm run build
```

빌드 결과물은 `frontend/dist/` 폴더에 생성됩니다.

### 빌드 미리보기

```bash
npm run preview
```

## 📝 코드 품질 관리

### ESLint 실행

```bash
cd frontend
npm run lint

# 자동 수정
npm run lint:fix
```

### Prettier 포맷팅

```bash
# 포맷팅 확인
npm run format:check

# 자동 포맷팅
npm run format
```

### 타입 체크

```bash
# TypeScript 타입 체크
npx tsc --noEmit
```

## 🐛 디버깅 설정

### VS Code 디버깅 설정

`.vscode/launch.json` 파일 생성:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Frontend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/frontend/node_modules/.bin/vite",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/frontend",
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/frontend/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "cwd": "${workspaceFolder}/frontend",
      "console": "integratedTerminal"
    }
  ]
}
```

### 브라우저 개발자 도구

React Developer Tools 설치:
- [Chrome 확장](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox 확장](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

## 📦 패키지 관리

### 새 패키지 추가

```bash
# 프로덕션 의존성
cd frontend
npm install package-name

# 개발 의존성
npm install -D package-name
```

### 패키지 업데이트

```bash
# 모든 패키지 업데이트 확인
npm outdated

# 패키지 업데이트
npm update

# 특정 패키지 업데이트
npm install package-name@latest
```

### 보안 취약점 확인

```bash
npm audit

# 자동 수정
npm audit fix
```

## 🔧 개발 도구 설정

### Git Hooks 설정

```bash
# Husky 설치 (이미 설정되어 있음)
npx husky install

# Pre-commit hook 추가
npx husky add .husky/pre-commit "npm run lint && npm run test"
```

### EditorConfig 설정

`.editorconfig` 파일이 이미 설정되어 있습니다:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

## 🌐 브라우저 호환성

### 지원 브라우저

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 폴리필 설정

필요한 폴리필은 Vite에서 자동으로 처리됩니다.

## 📱 모바일 개발

### 모바일 테스트

```bash
# 네트워크 IP로 접근 가능하게 설정
npm run dev -- --host
```

모바일 기기에서 `http://[your-ip]:3000` 접속

### 반응형 테스트

브라우저 개발자 도구에서 다양한 기기 크기로 테스트:
- iPhone 12/13/14
- iPad
- Galaxy S21
- Desktop (1920x1080)

## 🚨 문제 해결

### 일반적인 문제

#### 1. 포트 충돌

```bash
# 다른 포트 사용
npm run dev -- --port 3001
```

#### 2. 캐시 문제

```bash
# npm 캐시 정리
npm cache clean --force

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 3. TypeScript 에러

```bash
# TypeScript 캐시 정리
npx tsc --build --clean
```

#### 4. 빌드 실패

```bash
# 의존성 확인
npm ls

# 빌드 로그 확인
npm run build -- --verbose
```

### 성능 문제

#### 1. 개발 서버 느림

```bash
# Vite 캐시 정리
rm -rf node_modules/.vite
```

#### 2. 메모리 부족

```bash
# Node.js 메모리 증가
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

## 📚 추가 리소스

### 공식 문서

- [React 문서](https://react.dev/)
- [TypeScript 문서](https://www.typescriptlang.org/docs/)
- [Vite 문서](https://vitejs.dev/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

### 커뮤니티

- [React 커뮤니티](https://react.dev/community)
- [TypeScript 커뮤니티](https://www.typescriptlang.org/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/reactjs)

## 🤝 기여 가이드

### 코드 스타일

- ESLint 규칙 준수
- Prettier 포맷팅 적용
- 의미 있는 커밋 메시지 작성
- 테스트 코드 포함

### Pull Request 프로세스

1. Feature 브랜치 생성
2. 코드 작성 및 테스트
3. 린트 및 포맷팅 확인
4. Pull Request 생성
5. 코드 리뷰 및 머지

### 이슈 리포팅

GitHub Issues를 통해 버그 리포트 및 기능 요청을 해주세요.

---

**도움이 필요하시면 GitHub Issues에 문의해주세요!** 🙋‍♂️