const TestLinkXMLParser = require('./src/utils/TestLinkXMLParser');
const TestLinkImportService = require('./src/services/TestLinkImportService');
const path = require('path');
const fs = require('fs').promises;

// Mock database connection for testing
class MockDatabase {
  constructor() {
    this.data = {
      test_suites: [],
      test_cases: [],
      test_steps: [],
      custom_fields: [],
      import_logs: []
    };
    this.nextId = 1;
  }

  async connect() {
    return this;
  }

  async query(sql, params = []) {
    console.log(`🔍 Mock DB Query: ${sql.substring(0, 50)}...`);
    
    // Parse the SQL to determine the operation
    const isInsert = sql.toLowerCase().includes('insert');
    const isSelect = sql.toLowerCase().includes('select');
    const isUpdate = sql.toLowerCase().includes('update');
    
    if (isInsert) {
      // Handle INSERT operations
      if (sql.includes('test_suites')) {
        const suite = {
          id: this.nextId++,
          project_id: params[0],
          name: params[1],
          description: params[2],
          external_id: params[3],
          node_order: params[4],
          parent_suite_id: params[5],
          details: params[6],
          import_source: params[7]
        };
        this.data.test_suites.push(suite);
        return { rows: [{ id: suite.id }] };
      }
      
      if (sql.includes('test_cases')) {
        const testCase = {
          id: this.nextId++,
          project_id: params[0],
          test_suite_id: params[1],
          title: params[2],
          description: params[3],
          preconditions: params[4],
          external_id: params[5],
          internal_id: params[6],
          version: params[7],
          node_order: params[8],
          execution_type: params[9],
          importance: params[10],
          is_open: params[11],
          active: params[12],
          import_source: params[13]
        };
        this.data.test_cases.push(testCase);
        return { rows: [{ id: testCase.id }] };
      }
      
      if (sql.includes('test_steps')) {
        const step = {
          id: this.nextId++,
          test_case_id: params[0],
          step_number: params[1],
          actions: params[2],
          expected_results: params[3],
          execution_type: params[4]
        };
        this.data.test_steps.push(step);
        return { rows: [{ id: step.id }] };
      }
      
      if (sql.includes('custom_fields')) {
        const field = {
          id: this.nextId++,
          test_case_id: params[0],
          field_name: params[1],
          field_value: params[2]
        };
        this.data.custom_fields.push(field);
        return { rows: [{ id: field.id }] };
      }
      
      if (sql.includes('import_logs')) {
        const log = {
          id: this.nextId++,
          project_id: params[0],
          document_id: params[1],
          import_type: params[2],
          file_name: params[3],
          status: params[4]
        };
        this.data.import_logs.push(log);
        return { rows: [{ id: log.id }] };
      }
    }
    
    if (isSelect) {
      // Handle SELECT operations
      if (sql.includes('test_cases') && sql.includes('internal_id')) {
        const internalId = params[0];
        const existing = this.data.test_cases.find(tc => tc.internal_id === internalId);
        return { rows: existing ? [existing] : [] };
      }
      
      if (sql.includes('import_logs') && sql.includes('WHERE id')) {
        const logId = params[0];
        const log = this.data.import_logs.find(l => l.id === logId);
        return { rows: log ? [log] : [] };
      }
    }
    
    if (isUpdate) {
      // Handle UPDATE operations
      if (sql.includes('import_logs')) {
        const logId = params[params.length - 1];
        const log = this.data.import_logs.find(l => l.id === logId);
        if (log) {
          // Update log fields based on parameters
          if (params[0] === 'completed' || params[0] === 'failed') {
            log.status = params[0];
            log.completed_at = new Date().toISOString();
          }
          // Add other field updates as needed
        }
        return { rows: [] };
      }
      
      if (sql.includes('test_cases')) {
        const testCaseId = params[params.length - 1];
        const testCase = this.data.test_cases.find(tc => tc.id === testCaseId);
        if (testCase) {
          // Update test case fields
          testCase.title = params[0];
          testCase.description = params[1];
          testCase.preconditions = params[2];
          testCase.version = params[3];
          testCase.execution_type = params[4];
          testCase.importance = params[5];
          testCase.is_open = params[6];
          testCase.active = params[7];
        }
        return { rows: [] };
      }
    }
    
    // Handle DELETE operations
    if (sql.includes('DELETE FROM test_steps')) {
      const testCaseId = params[0];
      this.data.test_steps = this.data.test_steps.filter(step => step.test_case_id !== testCaseId);
      return { rows: [] };
    }
    
    if (sql.includes('DELETE FROM custom_fields')) {
      const testCaseId = params[0];
      this.data.custom_fields = this.data.custom_fields.filter(field => field.test_case_id !== testCaseId);
      return { rows: [] };
    }
    
    return { rows: [] };
  }

  async release() {
    // Mock release
  }
}

async function testFullImport() {
  console.log('🧪 Testing Full TestLink Import Workflow...\n');
  
  try {
    // 1. Initialize components
    console.log('1. Initializing components...');
    const parser = new TestLinkXMLParser();
    const mockDb = new MockDatabase();
    const importService = new TestLinkImportService(mockDb);
    console.log('✅ Components initialized');

    // 2. Parse XML file
    console.log('\n2. Parsing XML file...');
    const xmlFilePath = path.join(__dirname, '../testlink-samples/Network Control Profile.testsuite-deep.xml');
    const parsedData = await parser.parseFile(xmlFilePath);
    console.log('✅ XML file parsed successfully');

    // 3. Validate parsed data
    console.log('\n3. Validating parsed data...');
    const validation = parser.validateParsedData(parsedData);
    console.log(`✅ Validation result: ${validation.isValid ? 'PASSED' : 'FAILED'}`);
    if (!validation.isValid) {
      console.log('❌ Validation errors:');
      validation.errors.forEach(error => console.log(`   - ${error}`));
      return;
    }

    // 4. Get statistics
    console.log('\n4. Getting statistics...');
    const stats = parser.getStatistics(parsedData);
    console.log('✅ Statistics:');
    console.log(`   - Total test suites: ${stats.totalTestSuites}`);
    console.log(`   - Total test cases: ${stats.totalTestCases}`);
    console.log(`   - Has nested suites: ${stats.hasNestedSuites}`);
    console.log(`   - Max depth: ${stats.maxDepth}`);

    // 5. Test import service with mock database
    console.log('\n5. Testing import service...');
    
    // Test import from content
    const importResult = await importService.importFromContent(
      await fs.readFile(xmlFilePath, 'utf8'),
      1, // projectId
      null, // documentId
      'test-import.xml'
    );

    console.log('✅ Import completed successfully');
    console.log(`   - Import log ID: ${importResult.importLogId}`);
    console.log(`   - Imported suites: ${importResult.importedSuites}`);
    console.log(`   - Imported cases: ${importResult.importedCases}`);

    // 6. Verify database state
    console.log('\n6. Verifying database state...');
    console.log(`   - Test suites in DB: ${mockDb.data.test_suites.length}`);
    console.log(`   - Test cases in DB: ${mockDb.data.test_cases.length}`);
    console.log(`   - Test steps in DB: ${mockDb.data.test_steps.length}`);
    console.log(`   - Custom fields in DB: ${mockDb.data.custom_fields.length}`);
    console.log(`   - Import logs in DB: ${mockDb.data.import_logs.length}`);

    // 7. Show sample imported data
    console.log('\n7. Sample imported data:');
    if (mockDb.data.test_suites.length > 0) {
      const sampleSuite = mockDb.data.test_suites[0];
      console.log(`   Test Suite: "${sampleSuite.name}" (ID: ${sampleSuite.id})`);
    }
    
    if (mockDb.data.test_cases.length > 0) {
      const sampleCase = mockDb.data.test_cases[0];
      console.log(`   Test Case: "${sampleCase.title}" (ID: ${sampleCase.id})`);
      console.log(`     - Internal ID: ${sampleCase.internal_id}`);
      console.log(`     - External ID: ${sampleCase.external_id}`);
      console.log(`     - Version: ${sampleCase.version}`);
      console.log(`     - Execution Type: ${sampleCase.execution_type}`);
      console.log(`     - Importance: ${sampleCase.importance}`);
    }

    if (mockDb.data.test_steps.length > 0) {
      const sampleStep = mockDb.data.test_steps[0];
      console.log(`   Test Step: Step ${sampleStep.step_number} (ID: ${sampleStep.id})`);
      console.log(`     - Actions: ${sampleStep.actions.substring(0, 50)}...`);
      console.log(`     - Expected Results: ${sampleStep.expected_results.substring(0, 50)}...`);
    }

    if (mockDb.data.custom_fields.length > 0) {
      const sampleField = mockDb.data.custom_fields[0];
      console.log(`   Custom Field: ${sampleField.field_name} = ${sampleField.field_value}`);
    }

    // 8. Test import log retrieval
    console.log('\n8. Testing import log retrieval...');
    const importLog = await importService.getImportLog(importResult.importLogId);
    if (importLog) {
      console.log('✅ Import log retrieved successfully');
      console.log(`   - Status: ${importLog.status}`);
      console.log(`   - File: ${importLog.file_name}`);
      console.log(`   - Started: ${importLog.started_at}`);
    }

    console.log('\n🎉 Full import test completed successfully!');
    console.log('\n📊 Final Statistics:');
    console.log(`   - Test Suites: ${mockDb.data.test_suites.length}`);
    console.log(`   - Test Cases: ${mockDb.data.test_cases.length}`);
    console.log(`   - Test Steps: ${mockDb.data.test_steps.length}`);
    console.log(`   - Custom Fields: ${mockDb.data.custom_fields.length}`);
    console.log(`   - Import Logs: ${mockDb.data.import_logs.length}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testFullImport(); 