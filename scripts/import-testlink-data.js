const fs = require('fs');
const path = require('path');
const TestLinkImportService = require('../backend/src/services/TestLinkImportService');
const { query, pool } = require('../backend/src/services/database');

async function importTestLinkData() {
  try {
    console.log('🚀 Starting TestLink data import...');
    
    // Initialize import service
    const importService = new TestLinkImportService({ query, connect: () => pool.connect() });
    
    // Path to the TestLink XML file
    const xmlFilePath = path.join(__dirname, '../testlink-samples/Network Control Profile.testsuite-deep.xml');
    
    // Check if file exists
    if (!fs.existsSync(xmlFilePath)) {
      throw new Error(`XML file not found: ${xmlFilePath}`);
    }
    
    console.log(`📁 Found XML file: ${xmlFilePath}`);
    
    // Create a project for the imported data
    console.log('📋 Creating project for imported data...');
    const projectResult = await query(`
      INSERT INTO projects (name, description)
      VALUES ($1, $2)
      RETURNING id
    `, ['Network Control Profile', 'Imported from TestLink XML']);
    
    const projectId = projectResult.rows[0].id;
    console.log(`✅ Created project with ID: ${projectId}`);
    
    // Import the XML file
    console.log('📥 Importing TestLink XML data...');
    const result = await importService.importFromFile(xmlFilePath, projectId);
    
    console.log('🎉 Import completed successfully!');
    console.log('📊 Import Statistics:');
    console.log(`   - Test Suites: ${result.importedSuites}`);
    console.log(`   - Test Cases: ${result.importedCases}`);
    console.log(`   - Import Log ID: ${result.importLogId}`);
    
    // Get final statistics
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_test_cases,
        COUNT(CASE WHEN status = 2 THEN 1 END) as passed_tests,
        COUNT(CASE WHEN status = 3 THEN 1 END) as failed_tests,
        COUNT(CASE WHEN status = 1 THEN 1 END) as pending_tests
      FROM test_cases 
      WHERE test_suite_id IN (
        SELECT id FROM test_suites WHERE project_id = $1
      )
    `, [projectId]);
    
    const stats = statsResult.rows[0];
    console.log('📈 Database Statistics:');
    console.log(`   - Total Test Cases: ${stats.total_test_cases}`);
    console.log(`   - Passed Tests: ${stats.passed_tests}`);
    console.log(`   - Failed Tests: ${stats.failed_tests}`);
    console.log(`   - Pending Tests: ${stats.pending_tests}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

// Run the import if this script is executed directly
if (require.main === module) {
  importTestLinkData()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { importTestLinkData }; 