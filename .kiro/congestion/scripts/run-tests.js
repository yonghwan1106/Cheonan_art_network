#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Test configuration
const TEST_TYPES = {
  unit: {
    description: 'Unit tests for components, hooks, and utilities',
    pattern: 'src/components/**/__tests__/**/*.test.{ts,tsx} src/hooks/**/__tests__/**/*.test.{ts,tsx} src/utils/**/__tests__/**/*.test.{ts,tsx}',
    coverage: true
  },
  integration: {
    description: 'Integration tests for pages and user flows',
    pattern: 'src/__tests__/integration/**/*.test.{ts,tsx} src/pages/**/__tests__/**/*.test.{ts,tsx}',
    coverage: true
  },
  e2e: {
    description: 'End-to-end user journey tests',
    pattern: 'src/__tests__/e2e/**/*.test.{ts,tsx}',
    coverage: false,
    timeout: 30000
  },
  performance: {
    description: 'Performance and load tests',
    pattern: 'src/__tests__/performance/**/*.test.{ts,tsx}',
    coverage: false,
    timeout: 15000
  },
  all: {
    description: 'All tests',
    pattern: 'src/**/*.test.{ts,tsx}',
    coverage: true
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const testType = args[0] || 'all';
const watchMode = args.includes('--watch') || args.includes('-w');
const coverageMode = args.includes('--coverage') || args.includes('-c');
const verboseMode = args.includes('--verbose') || args.includes('-v');
const updateSnapshots = args.includes('--updateSnapshot') || args.includes('-u');

// Validate test type
if (!TEST_TYPES[testType]) {
  console.error(`❌ Invalid test type: ${testType}`);
  console.log('Available test types:');
  Object.entries(TEST_TYPES).forEach(([type, config]) => {
    console.log(`  ${type}: ${config.description}`);
  });
  process.exit(1);
}

const config = TEST_TYPES[testType];

// Build Jest command
const jestArgs = [];

// Test pattern
if (config.pattern) {
  jestArgs.push('--testPathPattern', config.pattern);
}

// Coverage
if ((coverageMode || config.coverage) && !watchMode) {
  jestArgs.push('--coverage');
  jestArgs.push('--coverageReporters', 'text', 'lcov', 'html');
}

// Watch mode
if (watchMode) {
  jestArgs.push('--watch');
}

// Verbose mode
if (verboseMode) {
  jestArgs.push('--verbose');
}

// Update snapshots
if (updateSnapshots) {
  jestArgs.push('--updateSnapshot');
}

// Timeout
if (config.timeout) {
  jestArgs.push('--testTimeout', config.timeout.toString());
}

// Additional Jest options
jestArgs.push('--passWithNoTests');
jestArgs.push('--detectOpenHandles');
jestArgs.push('--forceExit');

// Environment setup
const env = {
  ...process.env,
  NODE_ENV: 'test',
  CI: process.env.CI || 'false'
};

// Create test results directory
const resultsDir = path.join(process.cwd(), 'test-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

console.log(`🧪 Running ${testType} tests...`);
console.log(`📝 Description: ${config.description}`);
console.log(`🔧 Jest args: ${jestArgs.join(' ')}`);
console.log('');

// Run Jest
const jestProcess = spawn('npx', ['jest', ...jestArgs], {
  stdio: 'inherit',
  env,
  cwd: path.join(__dirname, '../frontend')
});

jestProcess.on('close', (code) => {
  if (code === 0) {
    console.log('');
    console.log('✅ All tests passed!');
    
    // Generate test summary
    generateTestSummary(testType);
  } else {
    console.log('');
    console.log('❌ Some tests failed.');
    process.exit(code);
  }
});

jestProcess.on('error', (error) => {
  console.error('❌ Failed to run tests:', error);
  process.exit(1);
});

function generateTestSummary(testType) {
  const summaryPath = path.join(resultsDir, `${testType}-summary.json`);
  const summary = {
    testType,
    timestamp: new Date().toISOString(),
    description: config.description,
    success: true
  };
  
  try {
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`📊 Test summary saved to: ${summaryPath}`);
  } catch (error) {
    console.warn('⚠️  Could not save test summary:', error.message);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test execution interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test execution terminated');
  process.exit(0);
});