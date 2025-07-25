#!/usr/bin/env node

/**
 * Test Delete Functionality
 * 
 * This script tests the delete functionality to ensure it works correctly
 * after the recent fixes for toast dismiss and bulk delete issues.
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, result, details = '') {
  const status = result ? '✅ PASS' : '❌ FAIL';
  const color = result ? 'green' : 'red';
  log(`${status} ${testName}`, color);
  if (details) {
    log(`   ${details}`, 'blue');
  }
}

async function testGetTestCases() {
  try {
    log('\n🔍 Testing: Get Test Cases', 'blue');
    
    const response = await axios.get(`${API_BASE_URL}/testcases`, TEST_CONFIG);
    
    if (response.status === 200 && response.data.success) {
      const testCases = response.data.data;
      logTest('Get Test Cases', true, `Found ${testCases.length} test cases`);
      return testCases;
    } else {
      logTest('Get Test Cases', false, 'Invalid response format');
      return [];
    }
  } catch (error) {
    logTest('Get Test Cases', false, error.message);
    return [];
  }
}

async function testDeleteExistingTestCase(testCaseId) {
  try {
    log(`\n🗑️  Testing: Delete Existing Test Case (ID: ${testCaseId})`, 'blue');
    
    const response = await axios.delete(`${API_BASE_URL}/testcases/${testCaseId}`, TEST_CONFIG);
    
    if (response.status === 200 && response.data.success) {
      logTest('Delete Existing Test Case', true, `Successfully deleted test case ${testCaseId}`);
      return true;
    } else {
      logTest('Delete Existing Test Case', false, 'Invalid response format');
      return false;
    }
  } catch (error) {
    logTest('Delete Existing Test Case', false, error.message);
    return false;
  }
}

async function testDeleteNonExistentTestCase() {
  try {
    log('\n🗑️  Testing: Delete Non-Existent Test Case (ID: 99999)', 'blue');
    
    const response = await axios.delete(`${API_BASE_URL}/testcases/99999`, TEST_CONFIG);
    
    // This should not succeed
    logTest('Delete Non-Existent Test Case', false, 'Expected 404 but got success');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      logTest('Delete Non-Existent Test Case', true, 'Correctly returned 404 for non-existent test case');
      return true;
    } else {
      logTest('Delete Non-Existent Test Case', false, `Unexpected error: ${error.message}`);
      return false;
    }
  }
}

async function testBulkDeleteSimulation() {
  try {
    log('\n🗑️  Testing: Bulk Delete Simulation', 'blue');
    
    // Get test cases first
    const testCases = await testGetTestCases();
    if (testCases.length === 0) {
      logTest('Bulk Delete Simulation', false, 'No test cases available for testing');
      return false;
    }
    
    // Take first 3 test cases for bulk delete simulation
    const testCaseIds = testCases.slice(0, 3).map(tc => tc.id);
    log(`   Simulating bulk delete of test cases: ${testCaseIds.join(', ')}`, 'blue');
    
    // Simulate bulk delete with Promise.allSettled
    const deletePromises = testCaseIds.map(id => 
      axios.delete(`${API_BASE_URL}/testcases/${id}`, TEST_CONFIG)
        .then(() => ({ id, success: true }))
        .catch(error => ({ id, success: false, error: error.message }))
    );
    
    const results = await Promise.allSettled(deletePromises);
    
    // Analyze results
    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;
    
    const failed = results.filter(result => 
      result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
    ).length;
    
    if (successful > 0) {
      logTest('Bulk Delete Simulation', true, `Successfully deleted ${successful} test cases, ${failed} failed`);
      return true;
    } else {
      logTest('Bulk Delete Simulation', false, `Failed to delete any test cases`);
      return false;
    }
  } catch (error) {
    logTest('Bulk Delete Simulation', false, error.message);
    return false;
  }
}

async function testHealthCheck() {
  try {
    log('\n🏥 Testing: Health Check', 'blue');
    
    const response = await axios.get(`${API_BASE_URL}/health`, TEST_CONFIG);
    
    if (response.status === 200) {
      logTest('Health Check', true, 'API is healthy and responding');
      return true;
    } else {
      logTest('Health Check', false, 'API health check failed');
      return false;
    }
  } catch (error) {
    logTest('Health Check', false, error.message);
    return false;
  }
}

async function runAllTests() {
  log('\n🚀 Starting Delete Functionality Tests', 'bold');
  log('=====================================', 'bold');
  
  const results = {
    healthCheck: false,
    getTestCases: false,
    deleteExisting: false,
    deleteNonExistent: false,
    bulkDelete: false
  };
  
  // Run tests
  results.healthCheck = await testHealthCheck();
  
  if (results.healthCheck) {
    results.getTestCases = await testGetTestCases();
    
    if (results.getTestCases) {
      // Get a test case to delete
      const testCases = await testGetTestCases();
      if (testCases.length > 0) {
        results.deleteExisting = await testDeleteExistingTestCase(testCases[0].id);
      }
    }
    
    results.deleteNonExistent = await testDeleteNonExistentTestCase();
    results.bulkDelete = await testBulkDeleteSimulation();
  }
  
  // Summary
  log('\n📊 Test Results Summary', 'bold');
  log('======================', 'bold');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const failedTests = totalTests - passedTests;
  
  log(`Total Tests: ${totalTests}`, 'blue');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  
  if (failedTests === 0) {
    log('\n🎉 All tests passed! Delete functionality is working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the implementation.', 'yellow');
  }
  
  return results;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests()
    .then(() => {
      log('\n✨ Test execution completed.', 'blue');
      process.exit(0);
    })
    .catch(error => {
      log(`\n💥 Test execution failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testHealthCheck,
  testGetTestCases,
  testDeleteExistingTestCase,
  testDeleteNonExistentTestCase,
  testBulkDeleteSimulation
}; 