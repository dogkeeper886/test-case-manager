#!/usr/bin/env node

/**
 * TestLink Compatibility Validation Test
 * Tests for Epic 4 Story 4.1 - Critical TestLink XML Structure Gaps
 * 
 * This script validates the fixes for:
 * 1. Missing TestLink attributes (internalid as XML attribute, node_order)
 * 2. Steps structure to match TestLink's nested format
 * 3. Proper CDATA section wrapping for HTML content
 * 4. XML parser handling both attribute and element formats
 * 5. Generated XML against TestLink format requirements
 */

const fs = require('fs').promises;
const TestLinkXMLParser = require('./src/utils/TestLinkXMLParser');
const TestLinkXMLExporter = require('./src/services/TestLinkXMLExporter');
const database = require('./src/services/database');

class TestLinkCompatibilityTester {
  constructor() {
    this.parser = new TestLinkXMLParser();
    this.exporter = new TestLinkXMLExporter(database);
    this.testResults = [];
  }

  /**
   * Run all compatibility tests
   */
  async runAllTests() {
    console.log('🧪 Starting TestLink Compatibility Validation Tests');
    console.log('=' .repeat(60));

    try {
      // Test 1: XML Attribute Parsing
      await this.testXMLAttributeParsing();
      
      // Test 2: CDATA Handling
      await this.testCDATAHandling();
      
      // Test 3: Nested Steps Structure
      await this.testNestedStepsStructure();
      
      // Test 4: Keywords and Requirements Support
      await this.testKeywordsAndRequirements();
      
      // Test 5: Export Functionality
      await this.testExportFunctionality();
      
      // Test 6: Round-trip Compatibility
      await this.testRoundTripCompatibility();

      // Report results
      this.reportResults();

    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Test XML attribute parsing (internalid as attribute vs element)
   */
  async testXMLAttributeParsing() {
    console.log('\n🔍 Test 1: XML Attribute Parsing');
    
    // TestLink format with internalid as attribute
    const xmlWithAttributes = `<?xml version="1.0" encoding="UTF-8"?>
<testcases>
  <testcase name="Test Case 1" internalid="123">
    <node_order><![CDATA[1]]></node_order>
    <externalid><![CDATA[TC-001]]></externalid>
    <summary><![CDATA[Test case summary]]></summary>
    <steps><![CDATA[Test steps]]></steps>
    <expectedresults><![CDATA[Expected results]]></expectedresults>
  </testcase>
</testcases>`;

    try {
      const result = await this.parser.parseContent(xmlWithAttributes);
      
      // Check if internal_id was parsed correctly from attribute
      const testCase = result.test_cases[0];
      const hasInternalId = testCase.internal_id === '123';
      const hasName = testCase.name === 'Test Case 1';
      const hasNodeOrder = testCase.node_order === 1;
      
      this.testResults.push({
        test: 'XML Attribute Parsing',
        passed: hasInternalId && hasName && hasNodeOrder,
        details: {
          internal_id: testCase.internal_id,
          name: testCase.name,
          node_order: testCase.node_order,
          expected: { internal_id: '123', name: 'Test Case 1', node_order: 1 }
        }
      });

      console.log(`  ✅ Internal ID from attribute: ${hasInternalId ? 'PASS' : 'FAIL'}`);
      console.log(`  ✅ Name from attribute: ${hasName ? 'PASS' : 'FAIL'}`);
      console.log(`  ✅ Node order parsing: ${hasNodeOrder ? 'PASS' : 'FAIL'}`);

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      this.testResults.push({
        test: 'XML Attribute Parsing',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test CDATA content handling
   */
  async testCDATAHandling() {
    console.log('\n🔍 Test 2: CDATA Handling');
    
    const htmlContent = '<p>This is <strong>HTML</strong> content with &amp; special characters</p>';
    const xmlWithCDATA = `<?xml version="1.0" encoding="UTF-8"?>
<testcases>
  <testcase name="CDATA Test" internalid="124">
    <summary><![CDATA[${htmlContent}]]></summary>
    <steps><![CDATA[<ol><li>Step 1</li><li>Step 2</li></ol>]]></steps>
    <expectedresults><![CDATA[<p>Expected <em>result</em></p>]]></expectedresults>
  </testcase>
</testcases>`;

    try {
      const result = await this.parser.parseContent(xmlWithCDATA);
      const testCase = result.test_cases[0];
      
      const cdataExtracted = testCase.summary.includes('<p>') && testCase.summary.includes('<strong>');
      const stepsExtracted = testCase.steps.length > 0 || (typeof testCase.steps === 'string' && testCase.steps.includes('<ol>'));
      
      // Test wrapping content in CDATA using the exporter
      const wrappedContent = this.exporter.wrapInCDATA(htmlContent);
      const properlyWrapped = wrappedContent.includes('<![CDATA[') && wrappedContent.includes(']]>');

      this.testResults.push({
        test: 'CDATA Handling',
        passed: cdataExtracted && properlyWrapped,
        details: {
          extracted_summary: testCase.summary.substring(0, 50) + '...',
          wrapped_content: wrappedContent.substring(0, 50) + '...',
          cdata_extraction: cdataExtracted,
          cdata_wrapping: properlyWrapped
        }
      });

      console.log(`  ✅ CDATA extraction: ${cdataExtracted ? 'PASS' : 'FAIL'}`);
      console.log(`  ✅ CDATA wrapping: ${properlyWrapped ? 'PASS' : 'FAIL'}`);

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      this.testResults.push({
        test: 'CDATA Handling',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test nested steps structure parsing
   */
  async testNestedStepsStructure() {
    console.log('\n🔍 Test 3: Nested Steps Structure');
    
    const xmlWithNestedSteps = `<?xml version="1.0" encoding="UTF-8"?>
<testcases>
  <testcase name="Nested Steps Test" internalid="125">
    <summary><![CDATA[Test with nested steps]]></summary>
    <steps>
      <step>
        <step_number>1</step_number>
        <actions><![CDATA[First action]]></actions>
        <expectedresults><![CDATA[First result]]></expectedresults>
        <execution_type>1</execution_type>
      </step>
      <step>
        <step_number>2</step_number>
        <actions><![CDATA[Second action]]></actions>
        <expectedresults><![CDATA[Second result]]></expectedresults>
        <execution_type>1</execution_type>
      </step>
    </steps>
  </testcase>
</testcases>`;

    try {
      const result = await this.parser.parseContent(xmlWithNestedSteps);
      const testCase = result.test_cases[0];
      
      const hasNestedSteps = Array.isArray(testCase.steps) && testCase.steps.length === 2;
      const firstStepValid = hasNestedSteps && testCase.steps[0].step_number === 1 && testCase.steps[0].actions === 'First action';
      const secondStepValid = hasNestedSteps && testCase.steps[1].step_number === 2 && testCase.steps[1].expected_results === 'Second result';

      this.testResults.push({
        test: 'Nested Steps Structure',
        passed: hasNestedSteps && firstStepValid && secondStepValid,
        details: {
          steps_count: testCase.steps.length,
          first_step: testCase.steps[0],
          second_step: testCase.steps[1]
        }
      });

      console.log(`  ✅ Nested steps parsing: ${hasNestedSteps ? 'PASS' : 'FAIL'}`);
      console.log(`  ✅ First step structure: ${firstStepValid ? 'PASS' : 'FAIL'}`);
      console.log(`  ✅ Second step structure: ${secondStepValid ? 'PASS' : 'FAIL'}`);

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      this.testResults.push({
        test: 'Nested Steps Structure',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test keywords and requirements support
   */
  async testKeywordsAndRequirements() {
    console.log('\n🔍 Test 4: Keywords and Requirements Support');
    
    const xmlWithMetadata = `<?xml version="1.0" encoding="UTF-8"?>
<testcases>
  <testcase name="Metadata Test" internalid="126">
    <summary><![CDATA[Test with metadata]]></summary>
    <steps><![CDATA[Test steps]]></steps>
    <expectedresults><![CDATA[Expected results]]></expectedresults>
    <keywords>
      <keyword name="Regression">
        <notes><![CDATA[Regression testing keyword]]></notes>
      </keyword>
      <keyword name="Critical">
        <notes><![CDATA[Critical functionality]]></notes>
      </keyword>
    </keywords>
    <requirements>
      <requirement>
        <req_spec_title><![CDATA[SPEC-001]]></req_spec_title>
        <doc_id><![CDATA[REQ-123]]></doc_id>
        <title><![CDATA[User Authentication]]></title>
      </requirement>
    </requirements>
    <custom_fields>
      <custom_field>
        <name><![CDATA[CF_PRIORITY]]></name>
        <value><![CDATA[High]]></value>
      </custom_field>
    </custom_fields>
  </testcase>
</testcases>`;

    try {
      const result = await this.parser.parseContent(xmlWithMetadata);
      const testCase = result.test_cases[0];
      
      const hasKeywords = testCase.keywords && testCase.keywords.length === 2;
      const hasRequirements = testCase.requirements && testCase.requirements.length === 1;
      const hasCustomFields = testCase.custom_fields && testCase.custom_fields.length === 1;
      
      const keywordValid = hasKeywords && testCase.keywords[0].name === 'Regression';
      const requirementValid = hasRequirements && testCase.requirements[0].doc_id === 'REQ-123';
      const customFieldValid = hasCustomFields && testCase.custom_fields[0].name === 'CF_PRIORITY';

      this.testResults.push({
        test: 'Keywords and Requirements Support',
        passed: hasKeywords && hasRequirements && hasCustomFields && keywordValid && requirementValid && customFieldValid,
        details: {
          keywords_count: testCase.keywords?.length || 0,
          requirements_count: testCase.requirements?.length || 0,
          custom_fields_count: testCase.custom_fields?.length || 0,
          keyword_sample: testCase.keywords?.[0],
          requirement_sample: testCase.requirements?.[0],
          custom_field_sample: testCase.custom_fields?.[0]
        }
      });

      console.log(`  ✅ Keywords parsing: ${hasKeywords ? 'PASS' : 'FAIL'} (${testCase.keywords?.length || 0} found)`);
      console.log(`  ✅ Requirements parsing: ${hasRequirements ? 'PASS' : 'FAIL'} (${testCase.requirements?.length || 0} found)`);
      console.log(`  ✅ Custom fields parsing: ${hasCustomFields ? 'PASS' : 'FAIL'} (${testCase.custom_fields?.length || 0} found)`);

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      this.testResults.push({
        test: 'Keywords and Requirements Support',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test export functionality
   */
  async testExportFunctionality() {
    console.log('\n🔍 Test 5: Export Functionality');
    
    try {
      // Mock test case data structure
      const mockTestCase = {
        id: 1,
        title: 'Export Test Case',
        internal_id: '127',
        node_order: 1,
        external_id: 'ETC-001',
        description: 'Test case for export functionality',
        prerequisites: 'Prerequisites for test',
        execution_type: 1,
        importance: 2,
        estimated_exec_duration: 15.5,
        steps: [
          {
            step_number: 1,
            action: 'Perform first action',
            expected_result: 'First expected result',
            execution_type: 1
          }
        ],
        keywords: [
          { name: 'Export', notes: 'Export functionality test' }
        ],
        requirements: [
          { req_spec_title: 'SPEC-001', doc_id: 'REQ-200', title: 'Export Feature' }
        ],
        custom_fields: [
          { name: 'CF_TEST_TYPE', value: 'Functional' }
        ]
      };

      // Test XML generation
      const xmlTestCase = this.exporter.convertTestCaseToXML(mockTestCase);
      
      const hasAttributes = xmlTestCase.$ && xmlTestCase.$.name === 'Export Test Case';
      const hasInternalIdAttribute = xmlTestCase.$ && xmlTestCase.$.internalid === '127';
      const hasNestedSteps = xmlTestCase.steps && xmlTestCase.steps.step;
      const hasKeywords = xmlTestCase.keywords && xmlTestCase.keywords.keyword;
      const hasRequirements = xmlTestCase.requirements && xmlTestCase.requirements.requirement;
      const hasCustomFields = xmlTestCase.custom_fields && xmlTestCase.custom_fields.custom_field;

      this.testResults.push({
        test: 'Export Functionality',
        passed: hasAttributes && hasInternalIdAttribute && hasNestedSteps && hasKeywords && hasRequirements && hasCustomFields,
        details: {
          xml_structure: Object.keys(xmlTestCase),
          has_attributes: hasAttributes,
          has_internal_id_attr: hasInternalIdAttribute,
          has_nested_steps: hasNestedSteps,
          has_keywords: hasKeywords,
          has_requirements: hasRequirements,
          has_custom_fields: hasCustomFields
        }
      });

      console.log(`  ✅ XML attributes: ${hasAttributes ? 'PASS' : 'FAIL'}`);
      console.log(`  ✅ Internal ID as attribute: ${hasInternalIdAttribute ? 'PASS' : 'FAIL'}`);
      console.log(`  ✅ Nested steps structure: ${hasNestedSteps ? 'PASS' : 'FAIL'}`);
      console.log(`  ✅ Keywords export: ${hasKeywords ? 'PASS' : 'FAIL'}`);
      console.log(`  ✅ Requirements export: ${hasRequirements ? 'PASS' : 'FAIL'}`);
      console.log(`  ✅ Custom fields export: ${hasCustomFields ? 'PASS' : 'FAIL'}`);

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      this.testResults.push({
        test: 'Export Functionality',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test round-trip compatibility (import -> export -> import)
   */
  async testRoundTripCompatibility() {
    console.log('\n🔍 Test 6: Round-trip Compatibility');
    
    const originalXML = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="Round-trip Test Suite">
  <details><![CDATA[Test suite for round-trip validation]]></details>
  <testcase name="Round-trip Test" internalid="128">
    <node_order><![CDATA[1]]></node_order>
    <externalid><![CDATA[RT-001]]></externalid>
    <summary><![CDATA[<p>HTML content with <strong>formatting</strong></p>]]></summary>
    <steps>
      <step>
        <step_number>1</step_number>
        <actions><![CDATA[Action with <em>HTML</em>]]></actions>
        <expectedresults><![CDATA[Result with <code>code</code>]]></expectedresults>
      </step>
    </steps>
    <keywords>
      <keyword name="RoundTrip">
        <notes><![CDATA[Round-trip test keyword]]></notes>
      </keyword>
    </keywords>
    <custom_fields>
      <custom_field>
        <name><![CDATA[CF_ROUND_TRIP]]></name>
        <value><![CDATA[Success]]></value>
      </custom_field>
    </custom_fields>
  </testcase>
</testsuite>`;

    try {
      // Step 1: Parse original XML
      const parsed = await this.parser.parseContent(originalXML);
      
      // Step 2: Convert back to XML structure
      const xmlStructure = this.exporter.convertToTestLinkXML(parsed);
      
      // Step 3: Build XML string
      const rebuiltXML = this.exporter.builder.buildObject(xmlStructure);
      
      // Step 4: Parse the rebuilt XML
      const reparsed = await this.parser.parseContent(rebuiltXML);

      // Compare key elements
      if (!parsed.test_cases || !parsed.test_cases.length || !reparsed.test_cases || !reparsed.test_cases.length) {
        throw new Error('Test cases not found in parsed data');
      }
      
      const originalTC = parsed.test_cases[0];
      const reparsedTC = reparsed.test_cases[0];
      
      const nameMatch = originalTC.name === reparsedTC.name;
      const internalIdMatch = originalTC.internal_id === reparsedTC.internal_id;
      const summaryMatch = originalTC.summary === reparsedTC.summary;
      const stepsMatch = originalTC.steps.length === reparsedTC.steps.length;
      const keywordsMatch = originalTC.keywords.length === reparsedTC.keywords.length;
      const customFieldsMatch = originalTC.custom_fields.length === reparsedTC.custom_fields.length;

      this.testResults.push({
        test: 'Round-trip Compatibility',
        passed: nameMatch && internalIdMatch && summaryMatch && stepsMatch && keywordsMatch && customFieldsMatch,
        details: {
          original_data: {
            name: originalTC.name,
            internal_id: originalTC.internal_id,
            steps_count: originalTC.steps.length,
            keywords_count: originalTC.keywords.length,
            custom_fields_count: originalTC.custom_fields.length
          },
          reparsed_data: {
            name: reparsedTC.name,
            internal_id: reparsedTC.internal_id,
            steps_count: reparsedTC.steps.length,
            keywords_count: reparsedTC.keywords.length,
            custom_fields_count: reparsedTC.custom_fields.length
          },
          matches: {
            name: nameMatch,
            internal_id: internalIdMatch,
            summary: summaryMatch,
            steps: stepsMatch,
            keywords: keywordsMatch,
            custom_fields: customFieldsMatch
          }
        }
      });

      console.log(`  ✅ Name preservation: ${nameMatch ? 'PASS' : 'FAIL'}`);
      console.log(`  ✅ Internal ID preservation: ${internalIdMatch ? 'PASS' : 'FAIL'}`);
      console.log(`  ✅ Summary preservation: ${summaryMatch ? 'PASS' : 'FAIL'}`);
      console.log(`  ✅ Steps preservation: ${stepsMatch ? 'PASS' : 'FAIL'}`);
      console.log(`  ✅ Keywords preservation: ${keywordsMatch ? 'PASS' : 'FAIL'}`);
      console.log(`  ✅ Custom fields preservation: ${customFieldsMatch ? 'PASS' : 'FAIL'}`);

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      this.testResults.push({
        test: 'Round-trip Compatibility',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Report test results
   */
  reportResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🏁 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`\n📊 Overall Results:`);
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${passedTests} ✅`);
    console.log(`  Failed: ${failedTests} ${failedTests > 0 ? '❌' : ''}`);
    console.log(`  Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(result => {
          console.log(`  • ${result.test}: ${result.error || 'Assertion failed'}`);
        });
    }

    console.log('\n📋 TESTLINK COMPATIBILITY ASSESSMENT:');
    
    // Calculate compatibility based on Epic 4 requirements
    const criticalFeatures = {
      'XML Attribute Parsing': 'internalid as XML attribute support',
      'CDATA Handling': 'HTML content in CDATA sections',
      'Nested Steps Structure': 'Proper TestLink steps format',
      'Keywords and Requirements Support': 'Essential metadata support',
      'Export Functionality': 'Missing export capability',
      'Round-trip Compatibility': 'Import/export data integrity'
    };

    const passedCriticalFeatures = this.testResults.filter(r => r.passed && criticalFeatures[r.test]).length;
    const totalCriticalFeatures = Object.keys(criticalFeatures).length;
    const compatibilityPercentage = ((passedCriticalFeatures / totalCriticalFeatures) * 100).toFixed(1);

    console.log(`  TestLink Compatibility: ${compatibilityPercentage}%`);
    
    if (compatibilityPercentage >= 100) {
      console.log('  🎉 FULL TESTLINK COMPATIBILITY ACHIEVED!');
      console.log('  Epic 4 Story 4.1 objectives completed successfully.');
    } else if (compatibilityPercentage >= 80) {
      console.log('  🟡 HIGH COMPATIBILITY - Minor issues remain');
    } else {
      console.log('  🔴 COMPATIBILITY ISSUES DETECTED - Review failed tests');
    }

    // Write detailed results to file
    this.writeDetailedResults();

    if (failedTests > 0) {
      process.exit(1);
    }
  }

  /**
   * Write detailed results to JSON file
   */
  async writeDetailedResults() {
    const detailedResults = {
      summary: {
        timestamp: new Date().toISOString(),
        epic: 'Epic 4 - Critical TestLink Compatibility Fixes',
        story: 'Story 4.1 - Fix Critical TestLink XML Structure Gaps',
        total_tests: this.testResults.length,
        passed_tests: this.testResults.filter(r => r.passed).length,
        failed_tests: this.testResults.filter(r => !r.passed).length,
        compatibility_percentage: ((this.testResults.filter(r => r.passed).length / this.testResults.length) * 100).toFixed(1)
      },
      test_results: this.testResults
    };

    try {
      await fs.writeFile(
        './testlink-compatibility-results.json', 
        JSON.stringify(detailedResults, null, 2)
      );
      console.log('\n📄 Detailed results saved to: testlink-compatibility-results.json');
    } catch (error) {
      console.log(`\n⚠️  Failed to save detailed results: ${error.message}`);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new TestLinkCompatibilityTester();
  tester.runAllTests().catch(console.error);
}

module.exports = TestLinkCompatibilityTester;