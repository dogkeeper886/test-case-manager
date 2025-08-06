const express = require('express');
const TestLinkXMLExporter = require('../services/TestLinkXMLExporter');
const database = require('../services/database');

const router = express.Router();

/**
 * Export routes for TestLink XML functionality
 * Addresses Epic 4 Story 4.2 - Missing TestLink Export Functionality
 */

/**
 * Export test cases as TestLink XML
 * POST /api/export/testlink
 */
router.post('/testlink', async (req, res) => {
  try {
    const {
      project_id,
      test_suite_id,
      test_case_ids,
      include_keywords = true,
      include_requirements = true,
      include_custom_fields = true,
      format = 'xml' // xml or file
    } = req.body;

    const exporter = new TestLinkXMLExporter(database);

    const options = {
      project_id,
      test_suite_id,
      test_case_ids,
      include_keywords,
      include_requirements,
      include_custom_fields
    };

    const xmlContent = await exporter.exportTestCases(options);

    // Validate the generated XML
    const validation = exporter.validateExportedXML(xmlContent);
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Generated XML validation failed',
        errors: validation.errors,
        warnings: validation.warnings
      });
    }

    if (format === 'file') {
      // Return as downloadable file
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', 'attachment; filename="testlink-export.xml"');
      return res.send(xmlContent);
    } else {
      // Return as JSON with XML content
      return res.json({
        success: true,
        xml_content: xmlContent,
        validation: {
          warnings: validation.warnings
        },
        export_info: {
          timestamp: new Date().toISOString(),
          options: options
        }
      });
    }

  } catch (error) {
    console.error('TestLink export error:', error);
    res.status(500).json({
      error: 'Export failed',
      message: error.message
    });
  }
});

/**
 * Export single test case as TestLink XML
 * GET /api/export/testlink/testcase/:id
 */
router.get('/testlink/testcase/:id', async (req, res) => {
  try {
    const testCaseId = parseInt(req.params.id);
    const {
      include_keywords = true,
      include_requirements = true,
      include_custom_fields = true,
      format = 'xml'
    } = req.query;

    if (isNaN(testCaseId)) {
      return res.status(400).json({
        error: 'Invalid test case ID'
      });
    }

    const exporter = new TestLinkXMLExporter(database);

    const options = {
      include_keywords: include_keywords === 'true',
      include_requirements: include_requirements === 'true',
      include_custom_fields: include_custom_fields === 'true'
    };

    const xmlContent = await exporter.exportSingleTestCase(testCaseId, options);

    // Validate the generated XML
    const validation = exporter.validateExportedXML(xmlContent);
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Generated XML validation failed',
        errors: validation.errors,
        warnings: validation.warnings
      });
    }

    if (format === 'file') {
      // Return as downloadable file
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="testcase-${testCaseId}-export.xml"`);
      return res.send(xmlContent);
    } else {
      // Return as JSON with XML content
      return res.json({
        success: true,
        xml_content: xmlContent,
        test_case_id: testCaseId,
        validation: {
          warnings: validation.warnings
        },
        export_info: {
          timestamp: new Date().toISOString(),
          options: options
        }
      });
    }

  } catch (error) {
    console.error('Single test case export error:', error);
    res.status(500).json({
      error: 'Export failed',
      message: error.message
    });
  }
});

/**
 * Export project as TestLink XML
 * GET /api/export/testlink/project/:id
 */
router.get('/testlink/project/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const {
      include_keywords = true,
      include_requirements = true,
      include_custom_fields = true,
      format = 'xml'
    } = req.query;

    if (isNaN(projectId)) {
      return res.status(400).json({
        error: 'Invalid project ID'
      });
    }

    const exporter = new TestLinkXMLExporter(database);

    const options = {
      project_id: projectId,
      include_keywords: include_keywords === 'true',
      include_requirements: include_requirements === 'true',
      include_custom_fields: include_custom_fields === 'true'
    };

    const xmlContent = await exporter.exportTestCases(options);

    // Validate the generated XML
    const validation = exporter.validateExportedXML(xmlContent);
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Generated XML validation failed',
        errors: validation.errors,
        warnings: validation.warnings
      });
    }

    if (format === 'file') {
      // Return as downloadable file
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="project-${projectId}-export.xml"`);
      return res.send(xmlContent);
    } else {
      // Return as JSON with XML content
      return res.json({
        success: true,
        xml_content: xmlContent,
        project_id: projectId,
        validation: {
          warnings: validation.warnings
        },
        export_info: {
          timestamp: new Date().toISOString(),
          options: options
        }
      });
    }

  } catch (error) {
    console.error('Project export error:', error);
    res.status(500).json({
      error: 'Export failed',
      message: error.message
    });
  }
});

/**
 * Validate TestLink XML content
 * POST /api/export/testlink/validate
 */
router.post('/testlink/validate', async (req, res) => {
  try {
    const { xml_content } = req.body;

    if (!xml_content) {
      return res.status(400).json({
        error: 'XML content is required'
      });
    }

    const exporter = new TestLinkXMLExporter(database);
    const validation = exporter.validateExportedXML(xml_content);

    return res.json({
      success: true,
      validation: validation
    });

  } catch (error) {
    console.error('XML validation error:', error);
    res.status(500).json({
      error: 'Validation failed',
      message: error.message
    });
  }
});

module.exports = router;