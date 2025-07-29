const axios = require('axios');

const API_BASE = 'http://192.168.5.176:3001/api';

async function testSuiteStatistics() {
  try {
    console.log('🔍 Testing Test Suite Statistics with Real Data...\n');

    // Fetch hierarchical test suites with test cases
    console.log('📊 Fetching hierarchical test suites...');
    const response = await axios.get(`${API_BASE}/testsuites?hierarchical=true`);
    const suites = response.data.data;

    if (!suites || suites.length === 0) {
      console.log('❌ No test suites found');
      return;
    }

    console.log(`✅ Found ${suites.length} root test suites\n`);

    // Test statistics for the first root suite
    const rootSuite = suites[0];
    console.log(`🏠 Root Suite: "${rootSuite.name}" (ID: ${rootSuite.id})`);
    
    // Calculate total test cases (including nested)
    const getTotalTestCases = (suite) => {
      let count = suite.test_cases ? suite.test_cases.length : 0;
      if (suite.test_suites) {
        suite.test_suites.forEach(childSuite => {
          count += getTotalTestCases(childSuite);
        });
      }
      return count;
    };

    // Calculate test cases by status
    const getTestCasesByStatus = (suite) => {
      const statusCounts = { pending: 0, passed: 0, failed: 0, blocked: 0, skipped: 0 };
      
      const countStatuses = (testCases) => {
        testCases.forEach(testCase => {
          switch (testCase.status) {
            case 1: statusCounts.pending++; break;
            case 2: statusCounts.passed++; break;
            case 3: statusCounts.failed++; break;
            case 4: statusCounts.blocked++; break;
            case 5: statusCounts.skipped++; break;
            default: break;
          }
        });
      };

      if (suite.test_cases) {
        countStatuses(suite.test_cases);
      }
      
      if (suite.test_suites) {
        suite.test_suites.forEach(childSuite => {
          if (childSuite.test_cases) {
            countStatuses(childSuite.test_cases);
          }
        });
      }

      return statusCounts;
    };

    // Calculate test cases by priority
    const getTestCasesByPriority = (suite) => {
      const priorityCounts = { low: 0, medium: 0, high: 0 };
      
      const countPriorities = (testCases) => {
        testCases.forEach(testCase => {
          switch (testCase.priority) {
            case 1: priorityCounts.low++; break;
            case 2: priorityCounts.medium++; break;
            case 3: priorityCounts.high++; break;
            default: break;
          }
        });
      };

      if (suite.test_cases) {
        countPriorities(suite.test_cases);
      }
      
      if (suite.test_suites) {
        suite.test_suites.forEach(childSuite => {
          if (childSuite.test_cases) {
            countPriorities(childSuite.test_cases);
          }
        });
      }

      return priorityCounts;
    };

    const totalTestCases = getTotalTestCases(rootSuite);
    const statusCounts = getTestCasesByStatus(rootSuite);
    const priorityCounts = getTestCasesByPriority(rootSuite);
    const subSuitesCount = rootSuite.test_suites ? rootSuite.test_suites.length : 0;

    // Calculate execution coverage
    const executedCount = statusCounts.passed + statusCounts.failed + statusCounts.blocked + statusCounts.skipped;
    const coveragePercentage = totalTestCases > 0 ? Math.round((executedCount / totalTestCases) * 100) : 0;

    // Calculate suite health score (0-100)
    const healthScore = totalTestCases > 0 
      ? Math.round(((statusCounts.passed * 100) + (statusCounts.skipped * 50) + (statusCounts.blocked * 25) + (statusCounts.failed * 0)) / totalTestCases)
      : 100;

    console.log('\n📈 Suite Statistics:');
    console.log(`   Total Test Cases: ${totalTestCases}`);
    console.log(`   Sub-Suites: ${subSuitesCount}`);
    console.log(`   Execution Coverage: ${coveragePercentage}%`);
    console.log(`   Health Score: ${healthScore}%`);

    console.log('\n📊 Test Cases by Status:');
    console.log(`   Pending: ${statusCounts.pending}`);
    console.log(`   Passed: ${statusCounts.passed}`);
    console.log(`   Failed: ${statusCounts.failed}`);
    console.log(`   Blocked: ${statusCounts.blocked}`);
    console.log(`   Skipped: ${statusCounts.skipped}`);

    console.log('\n🎯 Test Cases by Priority:');
    console.log(`   Low: ${priorityCounts.low}`);
    console.log(`   Medium: ${priorityCounts.medium}`);
    console.log(`   High: ${priorityCounts.high}`);

    // Test child suites
    if (rootSuite.test_suites && rootSuite.test_suites.length > 0) {
      console.log('\n📁 Child Suites:');
      rootSuite.test_suites.forEach((childSuite, index) => {
        const childTotalCases = getTotalTestCases(childSuite);
        console.log(`   ${index + 1}. "${childSuite.name}" (ID: ${childSuite.id}) - ${childTotalCases} test cases`);
        
        if (childSuite.test_suites && childSuite.test_suites.length > 0) {
          childSuite.test_suites.forEach((grandChildSuite, gIndex) => {
            const grandChildTotalCases = getTotalTestCases(grandChildSuite);
            console.log(`      ${index + 1}.${gIndex + 1}. "${grandChildSuite.name}" (ID: ${grandChildSuite.id}) - ${grandChildTotalCases} test cases`);
          });
        }
      });
    }

    console.log('\n✅ Test Suite Statistics Test Completed Successfully!');
    console.log('\n💡 The statistics are now displaying real data from the database.');
    console.log('   You can verify this by:');
    console.log('   1. Opening http://192.168.5.176:3000/test-suites');
    console.log('   2. Clicking on any test suite in the tree');
    console.log('   3. Viewing the statistics in the right panel');

  } catch (error) {
    console.error('❌ Error testing suite statistics:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testSuiteStatistics(); 