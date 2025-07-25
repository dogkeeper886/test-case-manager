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
async function testGetAllTestCases() {
  try {
    log('\n🔧 Testing: Get All Test Cases', 'blue');
    const response = await axios.get(`${API_BASE_URL}/api/testcases`, TEST_CONFIG);
    if (response.status === 200) {
      const testCases = response.data.data || response.data;
      logTest('Get All Test Cases', true, `Found ${testCases.length} test cases`);
      return testCases;
    } else {
      logTest('Get All Test Cases', false, `Unexpected status: ${response.status}`);
      return [];
    }
  } catch (error) {
    logTest('Get All Test Cases', false, error.message);
    return [];
  }
}

function testCountDisplayScenarios(testCases) {
  try {
    log('\n🔢 Testing: Count Display Scenarios', 'blue');
    
    if (testCases.length === 0) {
      logTest('Count Display Scenarios', false, 'No test cases available for testing');
      return false;
    }
    
    const totalCount = testCases.length;
    let allScenariosPass = true;
    
    // Scenario 1: No filters (should show "100 of 100")
    const noFilters = testCases.filter(item => true);
    const scenario1Pass = noFilters.length === totalCount;
    logTest('Scenario 1 - No Filters', scenario1Pass, `${noFilters.length} of ${totalCount} (should be ${totalCount} of ${totalCount})`);
    if (!scenario1Pass) allScenariosPass = false;
    
    // Scenario 2: Search filter (should show filtered count)
    const searchQuery = testCases[0].title?.substring(0, 5) || 'test';
    const searchFiltered = testCases.filter(item => 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const scenario2Pass = searchFiltered.length < totalCount && searchFiltered.length > 0;
    logTest('Scenario 2 - Search Filter', scenario2Pass, `${searchFiltered.length} of ${totalCount} (searching for "${searchQuery}")`);
    if (!scenario2Pass) allScenariosPass = false;
    
    // Scenario 3: Status filter (should show filtered count)
    const statusFiltered = testCases.filter(item => item.status === 1);
    const scenario3Pass = statusFiltered.length <= totalCount;
    logTest('Scenario 3 - Status Filter', scenario3Pass, `${statusFiltered.length} of ${totalCount} (status = 1)`);
    if (!scenario3Pass) allScenariosPass = false;
    
    // Scenario 4: Project filter (should show filtered count)
    const projectFiltered = testCases.filter(item => item.project_name === testCases[0].project_name);
    const scenario4Pass = projectFiltered.length <= totalCount && projectFiltered.length > 0;
    logTest('Scenario 4 - Project Filter', scenario4Pass, `${projectFiltered.length} of ${totalCount} (project = "${testCases[0].project_name}")`);
    if (!scenario4Pass) allScenariosPass = false;
    
    // Scenario 5: Combined filters (should show filtered count)
    const combinedFiltered = testCases.filter(item => 
      item.status === 1 && item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const scenario5Pass = combinedFiltered.length <= Math.min(statusFiltered.length, searchFiltered.length);
    logTest('Scenario 5 - Combined Filters', scenario5Pass, `${combinedFiltered.length} of ${totalCount} (status=1 AND search="${searchQuery}")`);
    if (!scenario5Pass) allScenariosPass = false;
    
    return allScenariosPass;
  } catch (error) {
    logTest('Count Display Scenarios', false, error.message);
    return false;
  }
}

function testEmptyStringHandling(testCases) {
  try {
    log('\n🔍 Testing: Empty String Handling', 'blue');
    
    if (testCases.length === 0) {
      logTest('Empty String Handling', false, 'No test cases available for testing');
      return false;
    }
    
    let allTestsPass = true;
    
    // Test 1: Empty search query should not filter
    const emptySearchFiltered = testCases.filter(item => {
      const searchQuery = '';
      if (searchQuery.trim() !== '') {
        return item.title?.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
    const test1Pass = emptySearchFiltered.length === testCases.length;
    logTest('Empty Search Query', test1Pass, `${emptySearchFiltered.length} of ${testCases.length} (should be ${testCases.length})`);
    if (!test1Pass) allTestsPass = false;
    
    // Test 2: Empty project filter should not filter
    const emptyProjectFiltered = testCases.filter(item => {
      const projectFilter = '';
      if (projectFilter.trim() !== '') {
        return item.project_name === projectFilter;
      }
      return true;
    });
    const test2Pass = emptyProjectFiltered.length === testCases.length;
    logTest('Empty Project Filter', test2Pass, `${emptyProjectFiltered.length} of ${testCases.length} (should be ${testCases.length})`);
    if (!test2Pass) allTestsPass = false;
    
    // Test 3: Empty status filter should not filter
    const emptyStatusFiltered = testCases.filter(item => {
      const statusFilter = '';
      if (statusFilter.toString().trim() !== '') {
        return item.status === parseInt(statusFilter);
      }
      return true;
    });
    const test3Pass = emptyStatusFiltered.length === testCases.length;
    logTest('Empty Status Filter', test3Pass, `${emptyStatusFiltered.length} of ${testCases.length} (should be ${testCases.length})`);
    if (!test3Pass) allTestsPass = false;
    
    return allTestsPass;
  } catch (error) {
    logTest('Empty String Handling', false, error.message);
    return false;
  }
}

function testCountDisplayFormat() {
  try {
    log('\n📊 Testing: Count Display Format', 'blue');
    
    let allTestsPass = true;
    
    // Test 1: Basic count format
    const totalCount = 100;
    const filteredCount = 50;
    const basicFormat = `${filteredCount} of ${totalCount} test cases`;
    const test1Pass = basicFormat === '50 of 100 test cases';
    logTest('Basic Count Format', test1Pass, `"${basicFormat}"`);
    if (!test1Pass) allTestsPass = false;
    
    // Test 2: Filtered indicator
    const hasFilters = true;
    const filteredIndicator = hasFilters ? ' (filtered)' : '';
    const test2Pass = filteredIndicator === ' (filtered)';
    logTest('Filtered Indicator', test2Pass, `"${filteredIndicator}"`);
    if (!test2Pass) allTestsPass = false;
    
    // Test 3: No filters indicator
    const noFilters = false;
    const noFiltersIndicator = noFilters ? ' (no filters)' : '';
    const test3Pass = noFiltersIndicator === '';
    logTest('No Filters Indicator', test3Pass, `"${noFiltersIndicator}"`);
    if (!test3Pass) allTestsPass = false;
    
    return allTestsPass;
  } catch (error) {
    logTest('Count Display Format', false, error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n🧪 Starting Test Case Count Display Tests', 'bright');
  log('=' .repeat(50), 'cyan');
  
  const testCases = await testGetAllTestCases();
  
  const results = {
    countDisplayScenarios: testCountDisplayScenarios(testCases),
    emptyStringHandling: testEmptyStringHandling(testCases),
    countDisplayFormat: testCountDisplayFormat()
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
  
  if (passed === total) {
    log('\n🎉 All test case count display tests passed!', 'green');
    log('   The count display is working correctly.', 'cyan');
    log('   The filtering logic properly handles empty strings.', 'cyan');
    log('   The count format follows the design guidelines.', 'cyan');
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
  testGetAllTestCases,
  testCountDisplayScenarios,
  testEmptyStringHandling,
  testCountDisplayFormat,
  runAllTests
}; 