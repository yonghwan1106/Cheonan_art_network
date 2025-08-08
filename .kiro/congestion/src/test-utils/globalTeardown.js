module.exports = async () => {
  // Global teardown for all tests
  console.log('🧹 Cleaning up test suite...');
  
  // Restore original performance.now
  if (global.__originalPerformanceNow) {
    performance.now = global.__originalPerformanceNow;
  }
  
  // Calculate total test time
  if (global.__testStartTime) {
    const totalTime = Date.now() - global.__testStartTime;
    console.log(`⏱️  Total test execution time: ${totalTime}ms`);
  }
  
  // Clean up any global resources
  if (global.gc) {
    global.gc();
  }
  
  console.log('✅ Global test teardown completed');
};