// Jest 설정 파일
// 테스트 실행 전 공통 설정

// 콘솔 로그 억제 (테스트 중 불필요한 로그 제거)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// 타임존 설정 (일관된 테스트 결과를 위해)
process.env.TZ = 'Asia/Seoul';

// 테스트용 환경 변수 설정
process.env.NODE_ENV = 'test';