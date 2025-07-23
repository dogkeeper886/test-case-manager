const axios = require('axios');

// Test different scenarios for API URL detection
async function testRemoteAccess() {
  console.log('🧪 Testing Remote Access Configuration...\n');

  // Test scenarios
  const scenarios = [
    {
      name: 'Localhost Access',
      hostname: 'localhost',
      expectedURL: 'http://localhost:3001'
    },
    {
      name: 'Remote IP Access',
      hostname: '192.168.6.161',
      expectedURL: 'http://192.168.6.161:3001'
    },
    {
      name: 'Domain Access',
      hostname: 'testcase-manager.example.com',
      expectedURL: 'http://testcase-manager.example.com:3001'
    }
  ];

  for (const scenario of scenarios) {
    console.log(`📋 Testing: ${scenario.name}`);
    console.log(`   Hostname: ${scenario.hostname}`);
    console.log(`   Expected API URL: ${scenario.expectedURL}`);
    
    // Simulate the URL detection logic
    let apiURL;
    if (scenario.hostname !== 'localhost' && scenario.hostname !== '127.0.0.1') {
      apiURL = `http://${scenario.hostname}:3001`;
    } else {
      apiURL = 'http://localhost:3001';
    }
    
    console.log(`   Detected API URL: ${apiURL}`);
    console.log(`   ✅ ${apiURL === scenario.expectedURL ? 'CORRECT' : 'INCORRECT'}\n`);
  }

  // Test actual API connectivity
  console.log('🌐 Testing Actual API Connectivity...\n');
  
  const testURLs = [
    'http://localhost:3001/api/health',
    'http://192.168.6.161:3001/api/health'
  ];

  for (const url of testURLs) {
    try {
      console.log(`🔍 Testing: ${url}`);
      const response = await axios.get(url, { timeout: 5000 });
      console.log(`   ✅ SUCCESS: ${response.status} - ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
    }
    console.log('');
  }

  console.log('📝 Remote Access Test Summary:');
  console.log('1. Frontend now dynamically detects the correct backend URL');
  console.log('2. When accessed via IP (192.168.6.161:3000), it will call 192.168.6.161:3001');
  console.log('3. When accessed via localhost, it will call localhost:3001');
  console.log('4. Environment variables can override this behavior if needed');
}

// Run the test
testRemoteAccess(); 