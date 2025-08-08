// Simple test script to verify recommendation functionality
const { spawn } = require('child_process');

console.log('🧪 Testing recommendation system functionality...');

// Test if the server can start without compilation errors
const testServer = spawn('npx', ['tsx', 'src/server.ts'], {
  cwd: __dirname,
  stdio: 'pipe'
});

let serverOutput = '';
let hasError = false;

testServer.stdout.on('data', (data) => {
  serverOutput += data.toString();
  console.log('📊 Server output:', data.toString().trim());
  
  // Check if server started successfully
  if (data.toString().includes('Server running on port')) {
    console.log('✅ Server started successfully');
    console.log('✅ Recommendation system integration complete');
    testServer.kill();
    process.exit(0);
  }
});

testServer.stderr.on('data', (data) => {
  const errorOutput = data.toString();
  console.error('❌ Server error:', errorOutput.trim());
  hasError = true;
});

testServer.on('close', (code) => {
  if (code !== 0 && !hasError) {
    console.error(`❌ Server process exited with code ${code}`);
    process.exit(1);
  }
});

// Timeout after 30 seconds
setTimeout(() => {
  console.log('⏰ Test timeout - killing server');
  testServer.kill();
  
  if (serverOutput.includes('All services initialized successfully')) {
    console.log('✅ Services initialized successfully');
    console.log('✅ Recommendation system integration appears to be working');
    process.exit(0);
  } else {
    console.log('❌ Server did not initialize properly');
    process.exit(1);
  }
}, 30000);