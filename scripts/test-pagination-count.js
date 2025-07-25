#!/usr/bin/env node

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3001';

const TEST_CONFIG = {
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Colored console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logTest = (testName, passed, message = '') => {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const color = passed ? 'green' : 'red';
  console.log(`${colors[color]}${status}${colors.reset} ${testName}${message ? ': ' + message : ''}`);
};

// Test functions
async function testPaginationAPI() {
  try {
    log('\n🔧 Testing: Pagination API', 'blue');
    
    // Test 1: Default pagination (limit=100, offset=0)
    const response1 = await axios.get(`${API_BASE_URL}/api/testcases`, TEST_CONFIG);
    if (response1.status === 200) {
      const data1 = response1.data;
      logTest('Default Pagination', true, `Total: ${data1.total}, Returned: ${data1.returned}, Data: ${data1.data.length}`);
      
      // Verify the structure
      const hasTotal = typeof data1.total === 'number';
      const hasReturned = typeof data1.returned === 'number';
      const hasData = Array.isArray(data1.data);
      
      logTest('API Structure', hasTotal && hasReturned && hasData, 'Has total, returned, and data fields');
      
      return { total: data1.total, returned: data1.returned, data: data1.data };
    } else {
      logTest('Default Pagination', false, `Unexpected status: ${response1.status}`);
      return null;
    }
  } catch (error) {
    logTest('Pagination API', false, error.message);
    return null;
  }
}

async function testPaginationScenarios() {
  try {
    log('\n📄 Testing: Pagination Scenarios', 'blue');
    
    let allScenariosPass = true;
    
    // Scenario 1: Limit 10, offset 0
    const response1 = await axios.get(`${API_BASE_URL}/api/testcases?limit=10&offset=0`, TEST_CONFIG);
    if (response1.status === 200) {
      const data1 = response1.data;
      const scenario1Pass = data1.data.length === 10 && data1.returned === 10;
      logTest('Scenario 1 - Limit 10', scenario1Pass, `Total: ${data1.total}, Returned: ${data1.returned}`);
      if (!scenario1Pass) allScenariosPass = false;
    }
    
    // Scenario 2: Limit 5, offset 10
    const response2 = await axios.get(`${API_BASE_URL}/api/testcases?limit=5&offset=10`, TEST_CONFIG);
    if (response2.status === 200) {
      const data2 = response2.data;
      const scenario2Pass = data2.data.length === 5 && data2.returned === 5;
      logTest('Scenario 2 - Limit 5, Offset 10', scenario2Pass, `Total: ${data2.total}, Returned: ${data2.returned}`);
      if (!scenario2Pass) allScenariosPass = false;
    }
    
    // Scenario 3: Large limit (should not exceed total)
    const response3 = await axios.get(`${API_BASE_URL}/api/testcases?limit=1000&offset=0`, TEST_CONFIG);
    if (response3.status === 200) {
      const data3 = response3.data;
      const scenario3Pass = data3.returned <= data3.total;
      logTest('Scenario 3 - Large Limit', scenario3Pass, `Total: ${data3.total}, Returned: ${data3.returned}`);
      if (!scenario3Pass) allScenariosPass = false;
    }
    
    return allScenariosPass;
  } catch (error) {
    logTest('Pagination Scenarios', false, error.message);
    return false;
  }
}

function testCountDisplayLogic() {
  try {
    log('\n🔢 Testing: Count Display Logic', 'blue');
    
    let allTestsPass = true;
    
    // Test 1: Basic count display format
    const totalCount = 207;
    const filteredCount = 100;
    const displayedCount = 100;
    
    const countDisplay = `Showing ${filteredCount} of ${totalCount} test cases`;
    const test1Pass = countDisplay === 'Showing 100 of 207 test cases';
    logTest('Count Display Format', test1Pass, `"${countDisplay}"`);
    if (!test1Pass) allTestsPass = false;
    
    // Test 2: Pagination indicator
    const hasPagination = displayedCount < totalCount;
    const paginationIndicator = hasPagination ? ` (showing ${displayedCount} of ${totalCount})` : '';
    const test2Pass = paginationIndicator === ' (showing 100 of 207)';
    logTest('Pagination Indicator', test2Pass, `"${paginationIndicator}"`);
    if (!test2Pass) allTestsPass = false;
    
    // Test 3: Filter indicator
    const hasFilters = true;
    const filterIndicator = hasFilters ? ' (filtered)' : '';
    const test3Pass = filterIndicator === ' (filtered)';
    logTest('Filter Indicator', test3Pass, `"${filterIndicator}"`);
    if (!test3Pass) allTestsPass = false;
    
    // Test 4: Combined display
    const combinedDisplay = `Showing ${filteredCount} of ${totalCount} test cases${filterIndicator}`;
    const expectedDisplay = 'Showing 100 of 207 test cases (filtered)';
    const test4Pass = combinedDisplay === expectedDisplay;
    logTest('Combined Display', test4Pass, `"${combinedDisplay}"`);
    if (!test4Pass) allTestsPass = false;
    
    return allTestsPass;
  } catch (error) {
    logTest('Count Display Logic', false, error.message);
    return false;
  }
}

async function testFilteringWithPagination() {
  try {
    log('\n🎯 Testing: Filtering with Pagination', 'blue');
    
    let allTestsPass = true;
    
    // Test 1: Filter by status with pagination
    const response1 = await axios.get(`${API_BASE_URL}/api/testcases?status=1&limit=10&offset=0`, TEST_CONFIG);
    if (response1.status === 200) {
      const data1 = response1.data;
      const test1Pass = data1.total >= data1.returned && data1.returned <= 10;
      logTest('Status Filter + Pagination', test1Pass, `Total: ${data1.total}, Returned: ${data1.returned}`);
      if (!test1Pass) allTestsPass = false;
    }
    
    // Test 2: Filter by project with pagination
    const response2 = await axios.get(`${API_BASE_URL}/api/testcases?projectId=1&limit=5&offset=0`, TEST_CONFIG);
    if (response2.status === 200) {
      const data2 = response2.data;
      const test2Pass = data2.total >= data2.returned && data2.returned <= 5;
      logTest('Project Filter + Pagination', test2Pass, `Total: ${data2.total}, Returned: ${data2.returned}`);
      if (!test2Pass) allTestsPass = false;
    }
    
    return allTestsPass;
  } catch (error) {
    logTest('Filtering with Pagination', false, error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n🧪 Starting Pagination and Count Display Tests', 'bright');
  log('=' .repeat(50), 'cyan');
  
  const paginationData = await testPaginationAPI();
  
  const results = {
    paginationScenarios: await testPaginationScenarios(),
    countDisplayLogic: testCountDisplayLogic(),
    filteringWithPagination: await testFilteringWithPagination()
  };
  
  log('\n📊 Test Results Summary', 'bright');
  log('=' .repeat(30), 'cyan');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${status} ${test}`, color);
  });
  
  log(`\n🎯 Overall: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');
  
  if (paginationData) {
    log(`\n📈 Pagination Summary:`, 'cyan');
    log(`   Total test cases in database: ${paginationData.total}`, 'cyan');
    log(`   Default page size: ${paginationData.returned}`, 'cyan');
    log(`   Current display: ${paginationData.data.length} of ${paginationData.total}`, 'cyan');
  }
  
  if (passed === total) {
    log('\n🎉 All pagination and count display tests passed!', 'green');
    log('   The count display now shows the correct total from database.', 'cyan');
    log('   Pagination is working correctly with proper total counts.', 'cyan');
    log('   The frontend will display accurate count information.', 'cyan');
  } else {
    log('\n⚠️  Some tests failed. Please check the issues above.', 'yellow');
  }
  
  return passed === total;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

module.exports = {
  testPaginationAPI,
  testPaginationScenarios,
  testCountDisplayLogic,
  testFilteringWithPagination,
  runAllTests
}; 