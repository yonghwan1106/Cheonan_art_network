module.exports = async () => {
  // Global setup for all tests
  console.log('🚀 Starting test suite...');
  
  // Set up test environment variables
  process.env.NODE_ENV = 'test';
  process.env.REACT_APP_API_URL = 'http://localhost:3001';
  process.env.REACT_APP_WS_URL = 'ws://localhost:3001';
  
  // Mock performance.now for consistent timing in tests
  const originalPerformanceNow = performance.now;
  let mockTime = 0;
  
  performance.now = jest.fn(() => {
    mockTime += 16.67; // Simulate 60fps
    return mockTime;
  });
  
  // Store original for cleanup
  global.__originalPerformanceNow = originalPerformanceNow;
  
  // Set up global test data
  global.__testStartTime = Date.now();
  
  console.log('✅ Global test setup completed');
};