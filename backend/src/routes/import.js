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

    const { projectId, documentId } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Initialize import service
    const service = initializeImportService(req.app.locals.db);
    
    // Import the file
    const result = await service.importFromFile(
      req.file.path, 
      parseInt(projectId), 
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

// POST /api/import/testlink/content - Import TestLink XML from content
router.post('/testlink/content', async (req, res) => {
  try {
    const { xmlContent, projectId, documentId, fileName } = req.body;
    
    if (!xmlContent) {
      return res.status(400).json({ error: 'XML content is required' });
    }

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Initialize import service
    const service = initializeImportService(req.app.locals.db);
    
    // Import the content
    const result = await service.importFromContent(
      xmlContent,
      parseInt(projectId),
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