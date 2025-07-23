const TestLinkXMLParser = require('./src/utils/TestLinkXMLParser');
const path = require('path');

async function testXMLParser() {
  console.log('Testing TestLink XML Parser...\n');
  
  const parser = new TestLinkXMLParser();
  const xmlFilePath = path.join(__dirname, '../testlink-samples/Network Control Profile.testsuite-deep.xml');
  
  try {
    // Test parsing the XML file
    console.log('1. Parsing XML file...');
    const parsedData = await parser.parseFile(xmlFilePath);
    console.log('✅ XML file parsed successfully');
    
    // Test validation
    console.log('\n2. Validating parsed data...');
    const validation = parser.validateParsedData(parsedData);
    console.log(`✅ Validation result: ${validation.isValid ? 'PASSED' : 'FAILED'}`);
    if (!validation.isValid) {
      console.log('❌ Validation errors:');
      validation.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    // Test statistics
    console.log('\n3. Getting statistics...');
    const stats = parser.getStatistics(parsedData);
    console.log('✅ Statistics:');
    console.log(`   - Total test suites: ${stats.totalTestSuites}`);
    console.log(`   - Total test cases: ${stats.totalTestCases}`);
    console.log(`   - Has nested suites: ${stats.hasNestedSuites}`);
    console.log(`   - Max depth: ${stats.maxDepth}`);
    
    // Test data structure
    console.log('\n4. Analyzing data structure...');
    console.log(`✅ Root test suite: "${parsedData.name}"`);
    console.log(`✅ Test suites count: ${parsedData.test_suites ? parsedData.test_suites.length : 0}`);
    console.log(`✅ Test cases count: ${parsedData.test_cases ? parsedData.test_cases.length : 0}`);
    
    // Test nested structure
    if (parsedData.test_suites && parsedData.test_suites.length > 0) {
      console.log('\n5. Analyzing nested structure...');
      parsedData.test_suites.forEach((suite, index) => {
        console.log(`   Suite ${index + 1}: "${suite.name}"`);
        console.log(`     - Test cases: ${suite.test_cases ? suite.test_cases.length : 0}`);
        console.log(`     - Nested suites: ${suite.test_suites ? suite.test_suites.length : 0}`);
      });
    }
    
    // Test test case details
    if (parsedData.test_cases && parsedData.test_cases.length > 0) {
      console.log('\n6. Analyzing test case details...');
      const firstTestCase = parsedData.test_cases[0];
      console.log(`✅ First test case: "${firstTestCase.name}"`);
      console.log(`   - Internal ID: ${firstTestCase.internal_id}`);
      console.log(`   - External ID: ${firstTestCase.external_id}`);
      console.log(`   - Version: ${firstTestCase.version}`);
      console.log(`   - Execution type: ${firstTestCase.execution_type}`);
      console.log(`   - Importance: ${firstTestCase.importance}`);
      console.log(`   - Steps count: ${firstTestCase.steps ? firstTestCase.steps.length : 0}`);
      console.log(`   - Custom fields count: ${firstTestCase.custom_fields ? firstTestCase.custom_fields.length : 0}`);
      
      if (firstTestCase.steps && firstTestCase.steps.length > 0) {
        console.log('\n   Test steps:');
        firstTestCase.steps.forEach((step, stepIndex) => {
          console.log(`     Step ${step.step_number}: ${step.actions.substring(0, 50)}...`);
        });
      }
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testXMLParser(); 