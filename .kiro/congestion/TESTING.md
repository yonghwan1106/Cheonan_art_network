# Testing Guide

이 문서는 혼잡도 예측 서비스의 테스트 전략과 실행 방법을 설명합니다.

## 📋 테스트 구조

### 테스트 유형

1. **Unit Tests** - 개별 컴포넌트, 훅, 유틸리티 함수 테스트
2. **Integration Tests** - 페이지 레벨 통합 테스트
3. **E2E Tests** - 전체 사용자 여정 테스트
4. **Performance Tests** - 성능 및 메모리 사용량 테스트

### 디렉토리 구조

```
frontend/src/
├── __tests__/
│   ├── integration/          # 통합 테스트
│   ├── e2e/                 # E2E 테스트
│   └── performance/         # 성능 테스트
├── components/
│   └── **/__tests__/        # 컴포넌트 단위 테스트
├── hooks/
│   └── __tests__/           # 훅 테스트
├── pages/
│   └── **/__tests__/        # 페이지 테스트
├── services/
│   └── __tests__/           # 서비스 테스트
├── utils/
│   └── __tests__/           # 유틸리티 테스트
└── test-utils/              # 테스트 유틸리티
```

## 🚀 테스트 실행

### 기본 명령어

```bash
# 모든 테스트 실행
npm test

# 특정 테스트 유형 실행
npm run test:unit          # 단위 테스트
npm run test:integration   # 통합 테스트
npm run test:e2e          # E2E 테스트
npm run test:performance  # 성능 테스트

# 감시 모드로 테스트 실행
npm run test:watch

# 커버리지 포함 테스트 실행
npm run test:coverage

# CI 환경에서 테스트 실행
npm run test:ci
```

### 고급 옵션

```bash
# 특정 파일 테스트
npm test -- LoginForm.test.tsx

# 패턴으로 테스트 필터링
npm test -- --testNamePattern="should render"

# 스냅샷 업데이트
npm test -- --updateSnapshot

# 디버그 모드
npm run test:debug
```

## 🧪 테스트 작성 가이드

### 1. 컴포넌트 테스트

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  it('should render login form elements', () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    
    expect(screen.getByPlaceholderText('이메일')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument();
  });

  it('should call onSubmit with form data', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();
    
    render(<LoginForm onSubmit={mockSubmit} />);
    
    await user.type(screen.getByPlaceholderText('이메일'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('비밀번호'), 'password123');
    await user.click(screen.getByRole('button', { name: /로그인/i }));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

### 2. 훅 테스트

```typescript
import { renderHook, act } from '@testing-library/react';
import { useRetry } from '../useRetry';

describe('useRetry', () => {
  it('should retry failed operations', async () => {
    let attempts = 0;
    const mockOperation = jest.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Operation failed');
      }
      return 'success';
    });

    const { result } = renderHook(() => useRetry(mockOperation, { maxRetries: 3 }));

    await act(async () => {
      const response = await result.current.execute();
      expect(response).toBe('success');
      expect(attempts).toBe(3);
    });
  });
});
```

### 3. 통합 테스트

```typescript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render as customRender, mockApiResponses } from '../../test-utils';
import { CongestionPage } from '../CongestionPage';

describe('CongestionPage Integration', () => {
  it('should load and display congestion data', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponses.congestionData)
    });

    customRender(<CongestionPage />);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('강남역')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });
});
```

### 4. E2E 테스트

```typescript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

describe('User Journey E2E', () => {
  it('should complete login to route planning flow', async () => {
    const user = userEvent.setup();
    
    render(<App />);

    // Login
    await user.type(screen.getByPlaceholderText('이메일'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('비밀번호'), 'password123');
    await user.click(screen.getByRole('button', { name: /로그인/i }));

    // Navigate to route planning
    await waitFor(() => {
      expect(screen.getByText('대시보드')).toBeInTheDocument();
    });

    await user.click(screen.getByText('경로'));
    
    // Plan route
    await user.type(screen.getByPlaceholderText('출발지'), '강남역');
    await user.type(screen.getByPlaceholderText('도착지'), '홍대입구역');
    await user.click(screen.getByRole('button', { name: /경로 검색/i }));

    await waitFor(() => {
      expect(screen.getByText('추천 경로')).toBeInTheDocument();
    });
  });
});
```

## 🛠 테스트 유틸리티

### Custom Render

```typescript
import { render as customRender } from '../test-utils';

// 프로바이더와 함께 렌더링
customRender(<Component />, {
  user: mockUser,
  initialEntries: ['/dashboard']
});
```

### Mock 데이터

```typescript
import { 
  mockUser, 
  mockApiResponses, 
  generateMockCongestionData 
} from '../test-utils';

// 사전 정의된 목 데이터 사용
const congestionData = mockApiResponses.congestionData;

// 동적 목 데이터 생성
const largeCongestionData = generateMockCongestionData(100);
```

### API 모킹

```typescript
import { mockFetch } from '../test-utils';

// 성공 응답 모킹
global.fetch = mockFetch(mockApiResponses.userProfile);

// 실패 응답 모킹
global.fetch = mockFetch(
  { success: false, error: 'Network error' },
  { shouldFail: true }
);

// 지연 응답 모킹
global.fetch = mockFetch(
  mockApiResponses.congestionData,
  { delay: 2000 }
);
```

## 📊 커버리지 목표

- **전체 커버리지**: 80% 이상
- **함수 커버리지**: 80% 이상
- **라인 커버리지**: 80% 이상
- **브랜치 커버리지**: 80% 이상

### 커버리지 확인

```bash
# 커버리지 리포트 생성
npm run test:coverage

# HTML 리포트 확인
open coverage/lcov-report/index.html
```

## 🔧 CI/CD 통합

### GitHub Actions 예시

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## 🐛 디버깅

### 테스트 디버깅

```bash
# 디버그 모드로 테스트 실행
npm run test:debug

# 특정 테스트만 디버그
npm run test:debug -- --testNamePattern="specific test"
```

### 일반적인 문제 해결

1. **비동기 테스트 실패**
   ```typescript
   // ❌ 잘못된 방법
   expect(screen.getByText('Loading...')).toBeInTheDocument();
   
   // ✅ 올바른 방법
   await waitFor(() => {
     expect(screen.getByText('Loading...')).toBeInTheDocument();
   });
   ```

2. **Mock 정리**
   ```typescript
   afterEach(() => {
     jest.clearAllMocks();
   });
   ```

3. **타이머 모킹**
   ```typescript
   beforeEach(() => {
     jest.useFakeTimers();
   });
   
   afterEach(() => {
     jest.useRealTimers();
   });
   ```

## 📚 추가 리소스

- [Testing Library 문서](https://testing-library.com/docs/)
- [Jest 문서](https://jestjs.io/docs/getting-started)
- [React Testing 가이드](https://reactjs.org/docs/testing.html)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🤝 기여 가이드

새로운 기능을 추가할 때는 반드시 테스트를 포함해주세요:

1. 단위 테스트 작성
2. 통합 테스트 추가 (필요시)
3. 커버리지 확인
4. CI 테스트 통과 확인

테스트 관련 질문이나 개선 제안이 있으시면 이슈를 생성해주세요.