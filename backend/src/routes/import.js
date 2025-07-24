const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const TestLinkImportService = require('../services/TestLinkImportService');

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

    const { projectId, documentId, strategy } = req.body;
    
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
    
    // Import the file
    const result = await service.importFromFile(
      req.file.path, 
      parseInt(projectId), 
      importStrategy,
      documentId ? parseInt(documentId) : null
    );

    // Clean up uploaded file
    try {
      await fs.unlink(req.file.path);
    } catch (cleanupError) {
      console.warn('Failed to cleanup uploaded file:', cleanupError);
    }

    res.status(201).json({
      message: 'Import completed successfully',
      data: result
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

    const { projectId } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Initialize import service
    const service = initializeImportService(req.app.locals.db);
    
    // Preview the import
    const preview = await service.previewImport(req.file.path, parseInt(projectId));

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