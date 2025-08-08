#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// CI Test Configuration
const CI_CONFIG = {
  maxRetries: 3,
  timeout: 600000, // 10 minutes
  parallel: true,
  coverage: true,
  failFast: false
};

// Test stages for CI pipeline
const TEST_STAGES = [
  {
    name: 'lint',
    description: 'Code linting and formatting',
    command: 'npm',
    args: ['run', 'lint'],
    required: true
  },
  {
    name: 'type-check',
    description: 'TypeScript type checking',
    command: 'npx',
    args: ['tsc', '--noEmit'],
    required: true
  },
  {
    name: 'unit',
    description: 'Unit tests',
    command: 'node',
    args: ['../scripts/run-tests.js', 'unit', '--coverage'],
    required: true
  },
  {
    name: 'integration',
    description: 'Integration tests',
    command: 'node',
    args: ['../scripts/run-tests.js', 'integration', '--coverage'],
    required: true
  },
  {
    name: 'performance',
    description: 'Performance tests',
    command: 'node',
    args: ['../scripts/run-tests.js', 'performance'],
    required: false
  },
  {
    name: 'e2e',
    description: 'End-to-end tests',
    command: 'node',
    args: ['../scripts/run-tests.js', 'e2e'],
    required: false
  }
];

// Parse command line arguments
const args = process.argv.slice(2);
const stageFilter = args.find(arg => arg.startsWith('--stage='))?.split('=')[1];
const skipOptional = args.includes('--skip-optional');
const verbose = args.includes('--verbose');

// Filter stages based on arguments
let stagesToRun = TEST_STAGES;
if (stageFilter) {
  stagesToRun = TEST_STAGES.filter(stage => stage.name === stageFilter);
}
if (skipOptional) {
  stagesToRun = stagesToRun.filter(stage => stage.required);
}

// Results tracking
const results = {
  startTime: Date.now(),
  stages: {},
  summary: {
    total: stagesToRun.length,
    passed: 0,
    failed: 0,
    skipped: 0
  }
};

console.log('🚀 Starting CI test pipeline...');
console.log(`📋 Running ${stagesToRun.length} test stages`);
console.log('');

// Run stages sequentially
async function runStages() {
  for (const stage of stagesToRun) {
    await runStage(stage);
  }
  
  generateFinalReport();
}

async function runStage(stage) {
  console.log(`🔄 Running ${stage.name}: ${stage.description}`);
  
  const stageResult = {
    name: stage.name,
    description: stage.description,
    startTime: Date.now(),
    attempts: 0,
    success: false,
    output: [],
    error: null
  };
  
  let attempts = 0;
  let success = false;
  
  while (attempts < CI_CONFIG.maxRetries && !success) {
    attempts++;
    stageResult.attempts = attempts;
    
    if (attempts > 1) {
      console.log(`🔄 Retry attempt ${attempts}/${CI_CONFIG.maxRetries} for ${stage.name}`);
    }
    
    try {
      success = await executeStage(stage, stageResult);
    } catch (error) {
      stageResult.error = error.message;
      console.error(`❌ Stage ${stage.name} failed:`, error.message);
    }
  }
  
  stageResult.endTime = Date.now();
  stageResult.duration = stageResult.endTime - stageResult.startTime;
  stageResult.success = success;
  
  results.stages[stage.name] = stageResult;
  
  if (success) {
    results.summary.passed++;
    console.log(`✅ ${stage.name} completed successfully (${stageResult.duration}ms)`);
  } else {
    results.summary.failed++;
    console.log(`❌ ${stage.name} failed after ${attempts} attempts`);
    
    if (stage.required && CI_CONFIG.failFast) {
      console.log('🛑 Failing fast due to required stage failure');
      process.exit(1);
    }
  }
  
  console.log('');
}

function executeStage(stage, stageResult) {
  return new Promise((resolve, reject) => {
    const workingDir = stage.name === 'lint' || stage.name === 'type-check' 
      ? path.join(__dirname, '../frontend')
      : __dirname;
    
    const process = spawn(stage.command, stage.args, {
      cwd: workingDir,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        CI: 'true'
      }
    });
    
    let stdout = '';
    let stderr = '';
    
    process.stdout?.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      if (verbose) {
        console.log(output);
      }
    });
    
    process.stderr?.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      if (verbose) {
        console.error(output);
      }
    });
    
    const timeout = setTimeout(() => {
      process.kill('SIGKILL');
      reject(new Error(`Stage ${stage.name} timed out after ${CI_CONFIG.timeout}ms`));
    }, CI_CONFIG.timeout);
    
    process.on('close', (code) => {
      clearTimeout(timeout);
      
      stageResult.output.push({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code
      });
      
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
    
    process.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

function generateFinalReport() {
  results.endTime = Date.now();
  results.totalDuration = results.endTime - results.startTime;
  
  console.log('📊 CI Test Pipeline Results');
  console.log('================================');
  console.log(`Total Duration: ${results.totalDuration}ms`);
  console.log(`Stages: ${results.summary.total}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`⏭️  Skipped: ${results.summary.skipped}`);
  console.log('');
  
  // Stage details
  Object.values(results.stages).forEach(stage => {
    const status = stage.success ? '✅' : '❌';
    console.log(`${status} ${stage.name}: ${stage.duration}ms (${stage.attempts} attempts)`);
  });
  
  console.log('');
  
  // Save detailed results
  const resultsPath = path.join(__dirname, '../test-results/ci-results.json');
  try {
    fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`📄 Detailed results saved to: ${resultsPath}`);
  } catch (error) {
    console.warn('⚠️  Could not save detailed results:', error.message);
  }
  
  // Generate JUnit XML for CI systems
  generateJUnitReport();
  
  // Exit with appropriate code
  const exitCode = results.summary.failed > 0 ? 1 : 0;
  console.log('');
  console.log(exitCode === 0 ? '🎉 All tests passed!' : '💥 Some tests failed!');
  process.exit(exitCode);
}

function generateJUnitReport() {
  const testSuites = Object.values(results.stages).map(stage => {
    const testCase = `
    <testcase 
      classname="CI.${stage.name}" 
      name="${stage.description}" 
      time="${(stage.duration / 1000).toFixed(3)}"
      ${stage.success ? '' : `>
      <failure message="${stage.error || 'Stage failed'}" type="StageFailure">
        ${stage.error || 'Stage execution failed'}
      </failure>
    </testcase>`}
    ${stage.success ? '/>' : ''}`;
    
    return `
  <testsuite 
    name="${stage.name}" 
    tests="1" 
    failures="${stage.success ? 0 : 1}" 
    time="${(stage.duration / 1000).toFixed(3)}"
  >
    ${testCase}
  </testsuite>`;
  }).join('');
  
  const junitXml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites 
  name="CI Pipeline" 
  tests="${results.summary.total}" 
  failures="${results.summary.failed}" 
  time="${(results.totalDuration / 1000).toFixed(3)}"
>
  ${testSuites}
</testsuites>`;
  
  const junitPath = path.join(__dirname, '../test-results/junit.xml');
  try {
    fs.writeFileSync(junitPath, junitXml);
    console.log(`📄 JUnit report saved to: ${junitPath}`);
  } catch (error) {
    console.warn('⚠️  Could not save JUnit report:', error.message);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 CI pipeline interrupted');
  generateFinalReport();
});

process.on('SIGTERM', () => {
  console.log('\n🛑 CI pipeline terminated');
  generateFinalReport();
});

// Start the pipeline
runStages().catch(error => {
  console.error('💥 CI pipeline failed:', error);
  process.exit(1);
});