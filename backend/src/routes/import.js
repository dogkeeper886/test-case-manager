const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const TestLinkImportService = require('../services/TestLinkImportService');
const ActivityService = require('../services/ActivityService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Only allow XML files
    if (file.mimetype === 'application/xml' || file.mimetype === 'text/xml' || 
        path.extname(file.originalname).toLowerCase() === '.xml') {
      cb(null, true);
    } else {
      cb(new Error('Only XML files are allowed'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Initialize import service
let importService = null;

// Initialize import service with database connection
const initializeImportService = (db) => {
  if (!importService) {
    importService = new TestLinkImportService(db);
  }
  return importService;
};

// POST /api/import/testlink - Import TestLink XML file
router.post('/testlink', upload.single('xmlFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No XML file uploaded' });
    }

    const { projectId, newProjectName, newProjectDescription, documentId, strategy } = req.body;
    
    // Validate strategy
    const validStrategies = Object.values(TestLinkImportService.IMPORT_STRATEGIES);
    const importStrategy = strategy && validStrategies.includes(strategy) 
      ? strategy 
      : TestLinkImportService.IMPORT_STRATEGIES.UPDATE_EXISTING;

    // Initialize services
    const importService = initializeImportService(req.app.locals.db);
    const ProjectService = require('../services/ProjectService');
    const projectService = new ProjectService(req.app.locals.db);
    
    let actualProjectId = projectId ? parseInt(projectId) : null;
    let projectCreated = false;
    
    // If creating a new project
    if (!actualProjectId && newProjectName) {
      try {
        const newProject = await projectService.createProject(newProjectName, newProjectDescription || '');
        actualProjectId = newProject.id;
        projectCreated = true;
      } catch (projectError) {
        return res.status(400).json({ 
          error: 'Failed to create project', 
          details: projectError.message 
        });
      }
    }
    
    if (!actualProjectId) {
      return res.status(400).json({ error: 'Either projectId or newProjectName is required' });
    }
    
    // Import the file
    const result = await importService.importFromFile(
      req.file.path, 
      actualProjectId, 
      importStrategy,
      documentId ? parseInt(documentId) : null
    );

    // Note: File is kept for 48 hours for potential retry functionality
    // Files will be automatically cleaned up after the retry window expires

    // Log activity
    await ActivityService.logImportActivity(
      'import_complete',
      `TestLink XML import completed successfully. Imported ${result.importedTestSuites} test suites and ${result.importedTestCases} test cases.`,
      {
        fileName: req.file.originalname,
        projectId: actualProjectId,
        importedTestSuites: result.importedTestSuites,
        importedTestCases: result.importedTestCases,
        strategy: importStrategy,
        projectCreated: projectCreated
      }
    );

    res.status(201).json({
      message: 'Import completed successfully',
      data: {
        ...result,
        projectCreated: projectCreated
      }
    });

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.warn('Failed to cleanup uploaded file on error:', cleanupError);
      }
    }

    console.error('Import error:', error);
    res.status(500).json({ 
      error: 'Import failed', 
      details: error.message 
    });
  }
});

// POST /api/import/testlink/preview - Preview import without importing
router.post('/testlink/preview', upload.single('xmlFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No XML file uploaded' });
    }

    const { projectId, newProjectName, newProjectDescription } = req.body;
    
    // Initialize services
    const importService = initializeImportService(req.app.locals.db);
    const ProjectService = require('../services/ProjectService');
    const projectService = new ProjectService(req.app.locals.db);
    
    let actualProjectId = projectId ? parseInt(projectId) : null;
    
    // If creating a new project, validate the project name
    if (!actualProjectId && newProjectName) {
      // Check if project name already exists
      const existingProject = await projectService.db.query(
        'SELECT id FROM projects WHERE name = $1',
        [newProjectName.trim()]
      );
      
      if (existingProject.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Project name already exists', 
          details: `A project with the name "${newProjectName}" already exists. Please choose a different name.`
        });
      }
      
      // For preview, we don't create the project yet, just validate the name
      // The actual project creation will happen in the main import route
    }
    
    // Preview the import (without projectId for new projects, so no duplicate analysis)
    const preview = await importService.previewImport(req.file.path, actualProjectId);

    // Clean up uploaded file
    try {
      await fs.unlink(req.file.path);
    } catch (cleanupError) {
      console.warn('Failed to cleanup uploaded file:', cleanupError);
    }

    res.json({
      message: 'Import preview completed',
      data: preview
    });

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.warn('Failed to cleanup uploaded file on error:', cleanupError);
      }
    }

    console.error('Preview error:', error);
    res.status(500).json({ 
      error: 'Preview failed', 
      details: error.message 
    });
  }
});

// POST /api/import/testlink/content - Import TestLink XML from content
router.post('/testlink/content', async (req, res) => {
  try {
    const { xmlContent, projectId, documentId, fileName, strategy } = req.body;
    
    if (!xmlContent) {
      return res.status(400).json({ error: 'XML content is required' });
    }

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Validate strategy
    const validStrategies = Object.values(TestLinkImportService.IMPORT_STRATEGIES);
    const importStrategy = strategy && validStrategies.includes(strategy) 
      ? strategy 
      : TestLinkImportService.IMPORT_STRATEGIES.UPDATE_EXISTING;

    // Initialize import service
    const service = initializeImportService(req.app.locals.db);
    
    // Import the content
    const result = await service.importFromContent(
      xmlContent,
      parseInt(projectId), 
      importStrategy,
      documentId ? parseInt(documentId) : null,
      fileName || 'uploaded.xml'
    );

    // Log activity
    await ActivityService.logImportActivity(
      'import_complete',
      `TestLink XML content import completed successfully. Imported ${result.importedTestSuites} test suites and ${result.importedTestCases} test cases.`,
      {
        fileName: fileName || 'uploaded.xml',
        projectId: parseInt(projectId),
        importedTestSuites: result.importedTestSuites,
        importedTestCases: result.importedTestCases,
        strategy: importStrategy
      }
    );

    res.status(201).json({
      message: 'Import completed successfully',
      data: result
    });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ 
      error: 'Import failed', 
      details: error.message 
    });
  }
});

// POST /api/import/testlink/content/preview - Preview import from content
router.post('/testlink/content/preview', async (req, res) => {
  try {
    const { xmlContent, projectId } = req.body;
    
    if (!xmlContent) {
      return res.status(400).json({ error: 'XML content is required' });
    }

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Initialize import service
    const service = initializeImportService(req.app.locals.db);
    
    // Preview the import
    const preview = await service.previewImportFromContent(xmlContent, parseInt(projectId));

    res.json({
      message: 'Import preview completed',
      data: preview
    });

  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ 
      error: 'Preview failed', 
      details: error.message 
    });
  }
});

// GET /api/import/strategies - Get available import strategies
router.get('/strategies', (req, res) => {
  res.json({
    message: 'Available import strategies',
    data: {
      strategies: TestLinkImportService.IMPORT_STRATEGIES,
      descriptions: {
        [TestLinkImportService.IMPORT_STRATEGIES.SKIP_DUPLICATES]: 'Skip importing if test case already exists',
        [TestLinkImportService.IMPORT_STRATEGIES.UPDATE_EXISTING]: 'Update existing test cases with new data',
        [TestLinkImportService.IMPORT_STRATEGIES.CREATE_NEW]: 'Create new test cases even if duplicates exist',
        [TestLinkImportService.IMPORT_STRATEGIES.MERGE_DATA]: 'Merge data from both existing and new test cases'
      }
    }
  });
});

// GET /api/import/status/:importLogId - Get import status
router.get('/status/:importLogId', async (req, res) => {
  try {
    const { importLogId } = req.params;
    
    // Initialize import service
    const service = initializeImportService(req.app.locals.db);
    
    // Get import log
    const importLog = await service.getImportLog(parseInt(importLogId));
    
    if (!importLog) {
      return res.status(404).json({ error: 'Import log not found' });
    }

    res.json({
      message: 'Import status retrieved',
      data: importLog
    });

  } catch (error) {
    console.error('Get import status error:', error);
    res.status(500).json({ 
      error: 'Failed to get import status', 
      details: error.message 
    });
  }
});

// GET /api/import/logs/:projectId - Get import logs for project
router.get('/logs/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Initialize import service
    const service = initializeImportService(req.app.locals.db);
    
    // Get import logs
    const importLogs = await service.getImportLogs(parseInt(projectId));
    
    res.json({
      message: 'Import logs retrieved',
      data: importLogs
    });

  } catch (error) {
    console.error('Get import logs error:', error);
    res.status(500).json({ 
      error: 'Failed to get import logs', 
      details: error.message 
    });
  }
});

// GET /api/import/logs - Get all import logs across all projects
router.get('/logs', async (req, res) => {
  try {
    // Initialize import service
    const service = initializeImportService(req.app.locals.db);
    
    // Get all import logs
    const importLogs = await service.getAllImportLogs();
    
    res.json({
      message: 'All import logs retrieved',
      data: importLogs
    });

  } catch (error) {
    console.error('Get all import logs error:', error);
    res.status(500).json({ 
      error: 'Failed to get all import logs', 
      details: error.message 
    });
  }
});

// POST /api/import/retry/:importLogId - Retry failed import
router.post('/retry/:importLogId', async (req, res) => {
  try {
    const { importLogId } = req.params;
    const { strategy } = req.body;
    
    // Initialize import service
    const service = initializeImportService(req.app.locals.db);
    
    // Get the original import log
    const originalLog = await service.getImportLog(parseInt(importLogId));
    
    if (!originalLog) {
      return res.status(404).json({ error: 'Import log not found' });
    }
    
    if (originalLog.status !== 'failed') {
      return res.status(400).json({ error: 'Can only retry failed imports' });
    }
    
    // Check if retry is still allowed (within retry window)
    const isRetryAllowed = await service.isRetryAllowed(parseInt(importLogId));
    if (!isRetryAllowed) {
      return res.status(400).json({ 
        error: 'Retry window has expired. Retry is only allowed within 48 hours of the original import.' 
      });
    }
    
    // Check if the original file still exists
    if (!originalLog.file_path || !fs.existsSync(originalLog.file_path)) {
      return res.status(404).json({ error: 'Original file not found for retry' });
    }
    
    // Retry the import with the same or new strategy
    const retryStrategy = strategy || originalLog.additional_data?.strategy || 'update_existing';
    const result = await service.importFromFile(
      originalLog.file_path, 
      originalLog.project_id, 
      retryStrategy
    );
    
    res.json({
      message: 'Import retry completed',
      data: result
    });

  } catch (error) {
    console.error('Retry import error:', error);
    res.status(500).json({ 
      error: 'Retry failed', 
      details: error.message 
    });
  }
});

// DELETE /api/import/logs/:importLogId - Delete import log
router.delete('/logs/:importLogId', async (req, res) => {
  try {
    const { importLogId } = req.params;
    
    // Initialize import service
    const service = initializeImportService(req.app.locals.db);
    
    // Get the import log
    const importLog = await service.getImportLog(parseInt(importLogId));
    
    if (!importLog) {
      return res.status(404).json({ error: 'Import log not found' });
    }
    
    // Delete the import log
    await service.deleteImportLog(parseInt(importLogId));
    
    // Optionally delete the associated file if it exists
    if (importLog.file_path && fs.existsSync(importLog.file_path)) {
      try {
        await fs.unlink(importLog.file_path);
      } catch (fileError) {
        console.warn('Failed to delete associated file:', fileError);
      }
    }
    
    res.json({
      message: 'Import log deleted successfully'
    });

  } catch (error) {
    console.error('Delete import log error:', error);
    res.status(500).json({ 
      error: 'Failed to delete import log', 
      details: error.message 
    });
  }
});

// POST /api/import/validate - Validate TestLink XML content
router.post('/validate', async (req, res) => {
  try {
    const { xmlContent } = req.body;
    
    if (!xmlContent) {
      return res.status(400).json({ error: 'XML content is required' });
    }

    // Initialize import service
    const service = initializeImportService(req.app.locals.db);
    
    // Parse and validate
    const parsedData = await service.parser.parseContent(xmlContent);
    const validation = service.parser.validateParsedData(parsedData);
    const statistics = service.parser.getStatistics(parsedData);

    res.json({
      message: 'Validation completed',
      data: {
        isValid: validation.isValid,
        errors: validation.errors,
        statistics: statistics,
        preview: {
          name: parsedData.name,
          testSuitesCount: statistics.totalTestSuites,
          testCasesCount: statistics.totalTestCases,
          maxDepth: statistics.maxDepth
        }
      }
    });

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ 
      error: 'Validation failed', 
      details: error.message 
    });
  }
});

// GET /api/import/template - Download TestLink XML template
router.get('/template', (req, res) => {
  try {
    const templatePath = path.join(__dirname, '../../public/templates/testlink-template.xml');
    
    // Check if template file exists
    if (!fsSync.existsSync(templatePath)) {
      return res.status(404).json({ error: 'Template file not found' });
    }
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="testlink-template.xml"');
    
    // Send the file
    res.sendFile(templatePath);
    
  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({ 
      error: 'Failed to download template', 
      details: error.message 
    });
  }
});

// POST /api/import/cleanup - Clean up expired files
router.post('/cleanup', async (req, res) => {
  try {
    // Initialize import service
    const service = initializeImportService(req.app.locals.db);
    
    // Clean up expired files
    const cleanedCount = await service.cleanupExpiredFiles();
    
    res.json({
      message: 'File cleanup completed',
      data: {
        cleanedCount: cleanedCount
      }
    });

  } catch (error) {
    console.error('File cleanup error:', error);
    res.status(500).json({ 
      error: 'Failed to cleanup files', 
      details: error.message 
    });
  }
});

// GET /api/import/cleanup/status - Get cleanup status
router.get('/cleanup/status', async (req, res) => {
  try {
    // Initialize import service
    const service = initializeImportService(req.app.locals.db);
    
    // Get expired import logs
    const expiredLogs = await service.getExpiredImportLogs();
    
    res.json({
      message: 'Cleanup status retrieved',
      data: {
        expiredCount: expiredLogs.length,
        expiredLogs: expiredLogs
      }
    });

  } catch (error) {
    console.error('Get cleanup status error:', error);
    res.status(500).json({ 
      error: 'Failed to get cleanup status', 
      details: error.message 
    });
  }
});

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large', 
        details: 'Maximum file size is 50MB' 
      });
    }
    return res.status(400).json({ 
      error: 'File upload error', 
      details: error.message 
    });
  }
  
  if (error.message === 'Only XML files are allowed') {
    return res.status(400).json({ 
      error: 'Invalid file type', 
      details: 'Only XML files are allowed' 
    });
  }
  
  next(error);
});

module.exports = router; 