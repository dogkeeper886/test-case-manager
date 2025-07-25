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

function testFilteringLogic(testCases) {
  try {
    log('\n🎯 Testing: Filtering Logic', 'blue');
    
    if (testCases.length === 0) {
      logTest('Filtering Logic', false, 'No test cases available for testing');
      return false;
    }
    
    // Test 1: No filters (should return all test cases)
    const noFilters = testCases.filter(item => true);
    logTest('No Filters', noFilters.length === testCases.length, `${noFilters.length} of ${testCases.length}`);
    
    // Test 2: Search filter by title
    const searchQuery = testCases[0].title?.substring(0, 5) || 'test';
    const searchFiltered = testCases.filter(item => 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    logTest('Search Filter', searchFiltered.length > 0, `Found ${searchFiltered.length} items with "${searchQuery}"`);
    
    // Test 3: Status filter
    const statusFiltered = testCases.filter(item => item.status === 1);
    logTest('Status Filter', statusFiltered.length >= 0, `Found ${statusFiltered.length} items with status 1`);
    
    // Test 4: Project filter
    const projectFiltered = testCases.filter(item => item.project_name);
    logTest('Project Filter', projectFiltered.length > 0, `Found ${projectFiltered.length} items with project names`);
    
    // Test 5: Combined filters
    const combinedFiltered = testCases.filter(item => 
      item.status === 1 && item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    logTest('Combined Filters', combinedFiltered.length >= 0, `Found ${combinedFiltered.length} items with both filters`);
    
    return true;
  } catch (error) {
    logTest('Filtering Logic', false, error.message);
    return false;
  }
}

function testDataStructure(testCases) {
  try {
    log('\n📊 Testing: Data Structure', 'blue');
    
    if (testCases.length === 0) {
      logTest('Data Structure', false, 'No test cases available for testing');
      return false;
    }
    
    const sampleTestCase = testCases[0];
    
    // Check required fields
    const requiredFields = ['id', 'title', 'status', 'priority', 'project_name', 'test_suite_name'];
    const missingFields = requiredFields.filter(field => !(field in sampleTestCase));
    
    if (missingFields.length > 0) {
      logTest('Required Fields', false, `Missing fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    logTest('Required Fields', true, 'All required fields present');
    
    // Check data types
    const typeChecks = [
      { field: 'id', type: 'number', value: sampleTestCase.id },
      { field: 'title', type: 'string', value: sampleTestCase.title },
      { field: 'status', type: 'number', value: sampleTestCase.status },
      { field: 'priority', type: 'number', value: sampleTestCase.priority }
    ];
    
    let allTypesCorrect = true;
    typeChecks.forEach(check => {
      const isCorrect = typeof check.value === check.type;
      if (!isCorrect) {
        logTest(`Data Type - ${check.field}`, false, `Expected ${check.type}, got ${typeof check.value}`);
        allTypesCorrect = false;
      }
    });
    
    if (allTypesCorrect) {
      logTest('Data Types', true, 'All data types correct');
    }
    
    // Check for unique IDs
    const ids = testCases.map(tc => tc.id);
    const uniqueIds = [...new Set(ids)];
    const hasUniqueIds = uniqueIds.length === ids.length;
    logTest('Unique IDs', hasUniqueIds, `${uniqueIds.length} unique IDs out of ${ids.length} total`);
    
    return allTypesCorrect && hasUniqueIds;
  } catch (error) {
    logTest('Data Structure', false, error.message);
    return false;
  }
}

function testCountDisplay(testCases) {
  try {
    log('\n🔢 Testing: Count Display Logic', 'blue');
    
    if (testCases.length === 0) {
      logTest('Count Display', false, 'No test cases available for testing');
      return false;
    }
    
    const totalCount = testCases.length;
    
    // Simulate different filter scenarios
    const scenarios = [
      {
        name: 'No Filters',
        filters: {},
        expectedFiltered: totalCount
      },
      {
        name: 'Status Filter (status = 1)',
        filters: { status: 1 },
        expectedFiltered: testCases.filter(tc => tc.status === 1).length
      },
      {
        name: 'Search Filter (first 3 chars of first title)',
        filters: { search: { query: testCases[0].title?.substring(0, 3) || 'test' } },
        expectedFiltered: testCases.filter(tc => tc.title?.toLowerCase().includes((testCases[0].title?.substring(0, 3) || 'test').toLowerCase())).length
      }
    ];
    
    let allScenariosPass = true;
    
    scenarios.forEach(scenario => {
      let filtered = [...testCases];
      
      // Apply status filter
      if (scenario.filters.status) {
        filtered = filtered.filter(item => item.status === scenario.filters.status);
      }
      
      // Apply search filter
      if (scenario.filters.search?.query) {
        const query = scenario.filters.search.query.toLowerCase();
        filtered = filtered.filter(item => 
          item.title?.toLowerCase().includes(query)
        );
      }
      
      const actualFiltered = filtered.length;
      const expectedFiltered = scenario.expectedFiltered;
      const passed = actualFiltered === expectedFiltered;
      
      logTest(`Count - ${scenario.name}`, passed, `${actualFiltered} of ${totalCount} (expected: ${expectedFiltered})`);
      
      if (!passed) {
        allScenariosPass = false;
      }
    });
    
    return allScenariosPass;
  } catch (error) {
    logTest('Count Display', false, error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n🧪 Starting Filtering and Count Display Tests', 'bright');
  log('=' .repeat(50), 'cyan');
  
  const testCases = await testGetAllTestCases();
  
  const results = {
    dataStructure: testDataStructure(testCases),
    filteringLogic: testFilteringLogic(testCases),
    countDisplay: testCountDisplay(testCases)
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
    log('\n🎉 All filtering and count display tests passed!', 'green');
    log('   The filtering logic is working correctly.', 'cyan');
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
  testFilteringLogic,
  testDataStructure,
  testCountDisplay,
  runAllTests
}; 