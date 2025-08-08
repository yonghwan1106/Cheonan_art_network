# 배포 가이드

## 🚀 Vercel 배포

### 자동 배포 (권장)

1. **GitHub 연동**
   - Vercel 대시보드에서 "New Project" 클릭
   - GitHub 저장소 `yonghwan1106/congestion` 선택
   - 자동으로 설정이 감지됨

2. **빌드 설정 확인**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: cd frontend && npm run build
   Output Directory: frontend/dist
   Install Command: cd frontend && npm install
   ```

3. **환경 변수 (선택사항)**
   ```
   NODE_ENV=production
   ```

### 수동 배포

```bash
# 로컬에서 빌드 테스트
cd frontend
npm install
npm run build

# Vercel CLI 사용
npm i -g vercel
vercel --prod
```

## 🌐 Netlify 배포 (대안)

1. **netlify.toml 설정 사용**
   - 프로젝트 루트의 `netlify.toml` 파일이 자동으로 설정 적용

2. **수동 배포**
   ```bash
   cd frontend
   npm run build
   # dist 폴더를 Netlify에 드래그 앤 드롭
   ```

## 🔧 배포 문제 해결

### 404 에러 발생 시

1. **SPA 라우팅 설정 확인**
   - Vercel: `vercel.json`의 rewrites 설정
   - Netlify: `netlify.toml`의 redirects 설정

2. **빌드 출력 디렉토리 확인**
   ```bash
   cd frontend
   npm run build
   ls -la dist/  # index.html이 있는지 확인
   ```

3. **의존성 설치 확인**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

### 빌드 실패 시

1. **Node.js 버전 확인**
   - 권장: Node.js 18.x

2. **TypeScript 에러**
   ```bash
   cd frontend
   npx tsc --noEmit  # 타입 체크만 실행
   ```

3. **의존성 충돌**
   ```bash
   cd frontend
   npm audit fix
   ```

## 📊 배포 후 확인사항

### 기능 테스트

1. **로그인 페이지**
   - URL: `/login`
   - 데모 계정: `demo@example.com` / `demo123`

2. **대시보드**
   - URL: `/dashboard`
   - 혼잡도 데이터 표시 확인

3. **주요 페이지**
   - `/congestion` - 실시간 혼잡도
   - `/routes` - 경로 추천
   - `/schedule` - 일정 관리
   - `/feedback` - 피드백 시스템
   - `/admin` - 관리자 대시보드

### 성능 확인

1. **로딩 속도**
   - 초기 로딩: < 3초
   - 페이지 전환: < 1초

2. **모바일 반응형**
   - 다양한 화면 크기에서 테스트

3. **브라우저 호환성**
   - Chrome, Firefox, Safari, Edge

## 🔗 배포된 사이트

- **Production**: https://congestion.vercel.app
- **Preview**: 각 PR마다 자동 생성

## 📝 배포 로그 분석

### 성공적인 배포 로그
```
✓ Build Completed in /vercel/output [XXXms]
✓ Deployment completed
```

### 실패 시 확인사항
```
❌ Build failed
- 에러 메시지 확인
- 의존성 문제 해결
- 빌드 설정 재확인
```

## 🚨 긴급 롤백

```bash
# Vercel CLI로 이전 버전으로 롤백
vercel rollback [deployment-url]
```

## 📞 지원

배포 관련 문제가 있을 경우:
1. GitHub Issues에 문제 보고
2. 빌드 로그와 에러 메시지 첨부
3. 브라우저 개발자 도구 콘솔 확인