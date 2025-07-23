const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testDashboardAPI() {
  try {
    console.log('🧪 Testing Dashboard API Endpoints...\n');

    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthRes = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check:', healthRes.data);

    // Test projects endpoint
    console.log('\n2. Testing projects endpoint...');
    const projectsRes = await axios.get(`${API_BASE}/projects`);
    console.log('✅ Projects count:', projectsRes.data.data.length);
    console.log('📊 Projects data:', projectsRes.data.data.slice(0, 2).map(p => ({ id: p.id, name: p.name })));

    // Test test cases endpoint
    console.log('\n3. Testing test cases endpoint...');
    const testCasesRes = await axios.get(`${API_BASE}/testcases?limit=1000`);
    console.log('✅ Test cases count:', testCasesRes.data.data.length);
    
    // Calculate statistics
    const testCases = testCasesRes.data.data;
    const passedTests = testCases.filter(tc => tc.status === 2).length;
    const failedTests = testCases.filter(tc => tc.status === 3).length;
    const pendingTests = testCases.filter(tc => tc.status === 1).length;
    const successRate = testCases.length > 0 ? Math.round((passedTests / testCases.length) * 100) : 0;

    console.log('📊 Dashboard Statistics:');
    console.log(`   - Total Projects: ${projectsRes.data.data.length}`);
    console.log(`   - Total Test Cases: ${testCases.length}`);
    console.log(`   - Passed Tests: ${passedTests}`);
    console.log(`   - Failed Tests: ${failedTests}`);
    console.log(`   - Pending Tests: ${pendingTests}`);
    console.log(`   - Success Rate: ${successRate}%`);

    // Test sample test case
    if (testCases.length > 0) {
      console.log('\n4. Testing sample test case...');
      const sampleTestCase = testCases[0];
      console.log('✅ Sample test case:', {
        id: sampleTestCase.id,
        title: sampleTestCase.title,
        status: sampleTestCase.status,
        test_suite_name: sampleTestCase.test_suite_name,
        project_name: sampleTestCase.project_name
      });
    }

    console.log('\n🎉 All API tests passed! Dashboard should be showing real data.');
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

// Run the test
testDashboardAPI(); 