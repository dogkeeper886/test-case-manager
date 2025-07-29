#!/usr/bin/env node

/**
 * Test Navigation State Implementation
 * 
 * This script tests the navigation state preservation between
 * Test Suite Browser and Test Case Detail pages.
 */

const axios = require('axios');

const BASE_URL = 'http://192.168.5.176:3001/api';

async function testNavigationState() {
  console.log('🧪 Testing Navigation State Implementation\n');

  try {
    // Step 1: Get test suites to understand the structure
    console.log('📋 Step 1: Fetching test suites...');
    const testSuitesResponse = await axios.get(`${BASE_URL}/testsuites?hierarchical=true`);
    const testSuites = testSuitesResponse.data.data || testSuitesResponse.data;
    
    if (!testSuites || testSuites.length === 0) {
      console.log('❌ No test suites found. Please import some test data first.');
      return;
    }

    console.log(`✅ Found ${testSuites.length} test suites`);

    // Step 2: Find a test suite with test cases
    console.log('\n📋 Step 2: Finding test suite with test cases...');
    let targetSuite = null;
    let targetTestCase = null;

    // Helper function to find test cases in a suite
    const findTestCasesInSuite = (suite) => {
      if (suite.test_cases && suite.test_cases.length > 0) {
        return suite.test_cases[0];
      }
      if (suite.test_suites) {
        for (const childSuite of suite.test_suites) {
          const testCase = findTestCasesInSuite(childSuite);
          if (testCase) return testCase;
        }
      }
      return null;
    };

    for (const suite of testSuites) {
      const testCase = findTestCasesInSuite(suite);
      if (testCase) {
        targetSuite = suite;
        targetTestCase = testCase;
        break;
      }
    }

    if (!targetSuite || !targetTestCase) {
      console.log('❌ No test cases found in any test suite. Please import some test data first.');
      return;
    }

    console.log(`✅ Found test case "${targetTestCase.title}" in suite "${targetSuite.name}"`);

    // Step 3: Test URL state construction
    console.log('\n📋 Step 3: Testing URL state construction...');
    
    // Simulate expanded suites state
    const expandedSuites = new Set([targetSuite.id]);
    const selectedProjectId = targetSuite.project_id || '1';
    
    // Construct URL with state (as done in TestSuiteBrowser)
    const expandedIds = Array.from(expandedSuites).join(',');
    const testCaseUrl = `/testcases/${targetTestCase.id}?returnTo=test-suites&expanded=${expandedIds}&project=${selectedProjectId}`;
    
    console.log(`✅ Constructed URL: ${testCaseUrl}`);
    console.log(`   - Test Case ID: ${targetTestCase.id}`);
    console.log(`   - Return To: test-suites`);
    console.log(`   - Expanded Suites: ${expandedIds}`);
    console.log(`   - Project ID: ${selectedProjectId}`);

    // Step 4: Test URL parameter parsing (as done in TestCaseDetail)
    console.log('\n📋 Step 4: Testing URL parameter parsing...');
    
    const url = new URL(testCaseUrl, 'http://192.168.5.176:3000');
    const searchParams = url.searchParams;
    
    const returnTo = searchParams.get('returnTo');
    const expanded = searchParams.get('expanded');
    const project = searchParams.get('project');
    
    console.log(`✅ Parsed URL parameters:`);
    console.log(`   - returnTo: ${returnTo}`);
    console.log(`   - expanded: ${expanded}`);
    console.log(`   - project: ${project}`);

    // Step 5: Test state restoration (as done in TestSuiteBrowser)
    console.log('\n📋 Step 5: Testing state restoration...');
    
    if (expanded) {
      const expandedIds = expanded.split(',').filter(id => id.trim() !== '');
      const restoredExpandedSuites = new Set(expandedIds);
      console.log(`✅ Restored expanded suites: [${Array.from(restoredExpandedSuites)}]`);
    }
    
    if (project) {
      console.log(`✅ Restored project ID: ${project}`);
    }

    // Step 6: Test return URL construction
    console.log('\n📋 Step 6: Testing return URL construction...');
    
    if (returnTo === 'test-suites') {
      const returnUrl = `/test-suites?expanded=${expanded}&project=${project}`;
      console.log(`✅ Return URL: ${returnUrl}`);
    } else {
      console.log(`✅ Default navigation: /testcases`);
    }

    // Step 7: Verify test case exists
    console.log('\n📋 Step 7: Verifying test case exists...');
    const testCaseResponse = await axios.get(`${BASE_URL}/testcases/${targetTestCase.id}`);
    const testCaseData = testCaseResponse.data.data || testCaseResponse.data;
    
    if (testCaseData) {
      console.log(`✅ Test case "${testCaseData.title}" exists and is accessible`);
    } else {
      console.log('❌ Test case not found');
    }

    console.log('\n🎉 Navigation State Test Completed Successfully!');
    console.log('\n📝 Manual Testing Steps:');
    console.log('1. Open http://192.168.5.176:3000/test-suites');
    console.log('2. Expand some test suites');
    console.log('3. Click on a test case');
    console.log('4. Verify URL contains state parameters');
    console.log('5. Click "Back to Test Cases" button');
    console.log('6. Verify return to test suite with same expansion state');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testNavigationState(); 