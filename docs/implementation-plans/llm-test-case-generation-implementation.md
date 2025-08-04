# LLM Test Case Generation - Implementation Status

## 🎯 Phase 0: Infrastructure - ✅ COMPLETED (August 2025)

The foundational infrastructure for LLM test case generation has been successfully implemented:

### ✅ Completed Infrastructure Components

#### 1. **LLM Settings Management System**
- **Modal Interface**: Apple-designed settings modal accessible via TopNav gear icon
- **Connection States**: Visual connection status (Connected/Disconnected/Connecting/Error) 
- **Provider Support**: OpenAI, Anthropic, Azure OpenAI configuration
- **Model Selection**: Dynamic model options based on provider
- **Real-time Testing**: Connection validation with live API testing

#### 2. **Backend Security & Storage**
- **API Routes**: Complete `/api/settings/llm` endpoints (GET/PUT/POST)
- **Encryption**: AES-256-CBC encryption for API keys at rest
- **Database Schema**: `app_settings` table with encrypted field support
- **Migration**: Database migration 005 with default LLM settings
- **Error Handling**: Comprehensive error management and logging

#### 3. **Frontend Integration**
- **TopNav Integration**: Settings icon opens LLM configuration modal
- **Apple Design System**: Consistent UI with gradients, proper spacing, SF fonts
- **API Service Layer**: `settingsAPI` with complete CRUD operations
- **State Management**: React state management for settings and connection status
- **User Experience**: Loading states, success/error feedback, form validation

### 🔧 Technical Implementation Details

#### Files Created/Modified:
- `backend/src/routes/settings.js` - Settings API routes with encryption
- `database/migrations/005_app_settings.sql` - Settings table schema
- `frontend/src/components/settings/LLMSettingsModal.jsx` - Main settings interface
- `frontend/src/components/layout/TopNav.jsx` - Settings icon integration
- `frontend/src/services/api.js` - Settings API service methods
- `backend/src/index.js` - Settings routes registration

#### Security Features:
- API keys encrypted using `crypto.createCipher` with environment-based key
- Masked API key display (shows only last 4 characters)
- Secure environment variable configuration
- Input validation and sanitization

### 📋 Next Phase: Test Case Generation Implementation

With the infrastructure complete, the next phase will implement:

#### Phase 1: Core Generation Service
1. **Content Parser Service** - Extract text from various file formats
2. **LLM Test Case Service** - Generate structured test cases from content
3. **Schema Mapping** - Convert LLM output to test_cases format
4. **API Integration** - Smart import endpoints for file processing

#### Phase 2: Frontend Integration  
1. **Smart Import Tab** - Add to existing Import page
2. **Preview Interface** - Review generated test cases before import
3. **File Upload** - Support MD, TXT, PDF, DOCX formats
4. **Progress Indicators** - Real-time processing feedback

#### Phase 3: Quality & Production
1. **Validation Systems** - Confidence scoring and quality checks
2. **Batch Operations** - Approve/reject multiple test cases
3. **Error Recovery** - Graceful handling of generation failures
4. **Documentation** - User guides and API documentation

### 🎯 Current State Summary
The LLM Settings infrastructure is production-ready and provides:
- ✅ Secure configuration management for LLM providers
- ✅ Real-time connection testing and validation  
- ✅ Apple-consistent user interface design
- ✅ Encrypted storage of sensitive API credentials
- ✅ Multi-provider support architecture

**Status**: Ready to proceed with Phase 1 implementation of actual test case generation features.

---

## 📚 Archive: Planned Implementation Details

The sections below contain the detailed implementation plans for the upcoming phases. These will be moved to active implementation status as each phase is completed.

<details>
<summary>Click to expand: Phase 1 Implementation Details</summary>

## Phase 1: Foundation Implementation

### Backend Services

#### 1. Content Parser Service
**File**: `/backend/src/services/ContentParserService.js`

```javascript
class ContentParserService {
  async parseFile(filePath, originalName) {
    const extension = path.extname(originalName).toLowerCase();
    
    switch (extension) {
      case '.md':
        return await this.parseMarkdown(filePath);
      case '.txt':
        return await this.parseText(filePath);
      case '.pdf':
        return await this.parsePDF(filePath);
      case '.docx':
        return await this.parseDocx(filePath);
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  }
  
  async parseMarkdown(filePath) {
    // Extract content preserving structure
    // Return: { content, sections, metadata }
  }
  
  async parseText(filePath) {
    // Simple text extraction
    // Return: { content, lineBreaks, metadata }
  }
}
```

#### 2. LLM Test Case Service
**File**: `/backend/src/services/LLMTestCaseService.js`

```javascript
class LLMTestCaseService {
  constructor(db, llmProvider = 'openai') {
    this.db = db;
    this.llmProvider = llmProvider;
    this.contentParser = new ContentParserService();
  }
  
  async generateTestCases(content, projectId, options = {}) {
    // Main generation method
    const prompt = this.buildPrompt(content, options);
    const llmResponse = await this.callLLM(prompt);
    const testCases = this.parseTestCases(llmResponse);
    
    return await this.validateAndEnrich(testCases, projectId);
  }
  
  buildPrompt(content, options) {
    return `
      Analyze this test plan document and extract structured test cases.
      
      Document Content:
      ${content}
      
      Extract test cases in this JSON format:
      {
        "testCases": [
          {
            "title": "Test case title",
            "description": "Brief description",
            "preconditions": "Prerequisites",
            "steps": [
              {"stepNumber": 1, "action": "Action to perform", "expectedResult": "Expected outcome"}
            ],
            "priority": "high|medium|low",
            "testType": "functional|integration|regression",
            "tags": ["tag1", "tag2"]
          }
        ]
      }
      
      Guidelines:
      - Extract only genuine test scenarios
      - Preserve original language and terminology
      - Ensure steps are actionable
      - Include meaningful expected results
    `;
  }
  
  async validateAndEnrich(testCases, projectId) {
    // Validate against schema
    // Add project context
    // Calculate confidence scores
    // Return enriched test cases
  }
}
```

#### 3. API Route Extensions
**File**: `/backend/src/routes/import.js` (add new endpoints)

```javascript
// POST /api/import/smart-import - Main smart import endpoint
router.post('/smart-import', upload.single('file'), async (req, res) => {
  try {
    const { projectId, strategy = 'update_existing' } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Initialize services
    const llmService = new LLMTestCaseService(req.app.locals.db);
    
    // Parse content
    const parsedContent = await llmService.contentParser.parseFile(
      req.file.path, 
      req.file.originalname
    );
    
    // Generate test cases
    const result = await llmService.generateTestCases(
      parsedContent.content, 
      parseInt(projectId),
      { filename: req.file.originalname }
    );
    
    // Use existing import pipeline
    const importService = new TestLinkImportService(req.app.locals.db);
    const importResult = await importService.importGeneratedTestCases(
      result.testCases,
      parseInt(projectId),
      strategy
    );
    
    // Log activity
    await ActivityService.logImportActivity(
      'smart_import_complete',
      `Smart import completed. Generated ${result.testCases.length} test cases from ${req.file.originalname}`,
      {
        fileName: req.file.originalname,
        projectId: parseInt(projectId),
        generatedTestCases: result.testCases.length,
        strategy: strategy
      }
    );
    
    res.status(201).json({
      message: 'Smart import completed successfully',
      data: {
        ...importResult,
        generatedCount: result.testCases.length,
        confidence: result.averageConfidence
      }
    });
    
  } catch (error) {
    console.error('Smart import error:', error);
    res.status(500).json({ 
      error: 'Smart import failed', 
      details: error.message 
    });
  }
});

// POST /api/import/smart-import/preview - Preview without importing
router.post('/smart-import/preview', upload.single('file'), async (req, res) => {
  try {
    const { projectId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const llmService = new LLMTestCaseService(req.app.locals.db);
    
    // Parse and generate preview
    const parsedContent = await llmService.contentParser.parseFile(
      req.file.path,
      req.file.originalname
    );
    
    const preview = await llmService.generateTestCases(
      parsedContent.content,
      parseInt(projectId),
      { preview: true }
    );
    
    // Clean up uploaded file
    await fs.unlink(req.file.path);
    
    res.json({
      message: 'Smart import preview completed',
      data: preview
    });
    
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(err => 
        console.warn('Failed to cleanup file:', err)
      );
    }
    
    console.error('Smart import preview error:', error);
    res.status(500).json({ 
      error: 'Preview failed', 
      details: error.message 
    });
  }
});

// GET /api/import/supported-formats - List supported file formats
router.get('/supported-formats', (req, res) => {
  res.json({
    message: 'Supported file formats for smart import',
    data: {
      formats: [
        { extension: '.md', type: 'Markdown', description: 'Markdown documents with test scenarios' },
        { extension: '.txt', type: 'Plain Text', description: 'Plain text test plans' },
        { extension: '.pdf', type: 'PDF', description: 'PDF documents containing test specifications' },
        { extension: '.docx', type: 'Word Document', description: 'Microsoft Word test plan documents' }
      ],
      maxFileSize: '50MB',
      processing: 'AI-powered test case extraction'
    }
  });
});
```

### Frontend Implementation

#### 1. Smart Import Component
**File**: `/frontend/src/components/import/SmartImportTab.jsx`

```jsx
import React, { useState, useRef } from 'react';
import { Upload, FileText, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import { Button, Card, Badge } from '../ui';
import { importAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';

const SmartImportTab = ({ projects, selectedProjectId, onImportComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const supportedFormats = ['.md', '.txt', '.pdf', '.docx'];

  const handleFileUpload = async (file) => {
    if (!selectedProjectId) {
      showError('Please select a project first');
      return;
    }

    setProcessing(true);
    try {
      // Generate preview first
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', selectedProjectId);

      const response = await importAPI.smartImportPreview(formData);
      setPreview(response.data.data);
      setShowPreview(true);
      
    } catch (error) {
      console.error('Smart import preview failed:', error);
      showError('Failed to process document: ' + (error.response?.data?.details || error.message));
    } finally {
      setProcessing(false);
    }
  };

  const handleImportConfirm = async (strategy = 'update_existing') => {
    try {
      const formData = new FormData();
      formData.append('file', preview.originalFile);
      formData.append('projectId', selectedProjectId);
      formData.append('strategy', strategy);

      const response = await importAPI.smartImport(formData);
      
      showSuccess(`Successfully generated ${response.data.data.generatedCount} test cases!`);
      setShowPreview(false);
      setPreview(null);
      onImportComplete();
      
    } catch (error) {
      console.error('Smart import failed:', error);
      showError('Import failed: ' + (error.response?.data?.details || error.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
        <div 
          className={`p-8 text-center ${dragActive ? 'bg-blue-50' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) handleFileUpload(files[0]);
          }}
        >
          <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Smart Test Case Generation</h3>
          <p className="text-gray-600 mb-4">
            Upload test plan documents in any format. AI will extract and structure test cases automatically.
          </p>
          
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="mb-4"
          >
            {processing ? 'Processing...' : 'Choose Document'}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={supportedFormats.join(',')}
            onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
          />
          
          <div className="text-sm text-gray-500">
            Supported formats: {supportedFormats.join(', ')} • Max size: 50MB
          </div>
        </div>
      </Card>

      {/* Preview Section */}
      {showPreview && preview && (
        <PreviewSection 
          preview={preview}
          onConfirm={handleImportConfirm}
          onCancel={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

const PreviewSection = ({ preview, onConfirm, onCancel }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Generated Test Cases Preview</h3>
        <Badge variant="success">
          {preview.testCases.length} test cases generated
        </Badge>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
        {preview.testCases.map((testCase, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{testCase.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{testCase.description}</p>
                
                <div className="mt-2 text-xs text-gray-500">
                  {testCase.steps.length} steps • Priority: {testCase.priority}
                  {testCase.confidence && (
                    <span className="ml-2">• Confidence: {Math.round(testCase.confidence * 100)}%</span>
                  )}
                </div>
              </div>
              
              {testCase.confidence && (
                <div className="ml-4">
                  {testCase.confidence > 0.8 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex space-x-3">
        <Button onClick={() => onConfirm('update_existing')} className="flex-1">
          Import Test Cases
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
};

export default SmartImportTab;
```

#### 2. Integration with Import Page
**File**: `/frontend/src/pages/Import.js` (modify existing)

```jsx
// Add import
import SmartImportTab from '../components/import/SmartImportTab';

// Add tab to existing tab structure
const [activeTab, setActiveTab] = useState('testlink'); // Add 'smart' as option

// Add tab button
<div className="border-b border-gray-200">
  <nav className="-mb-px flex space-x-8">
    <button
      onClick={() => setActiveTab('testlink')}
      className={`py-2 px-1 border-b-2 font-medium text-sm ${
        activeTab === 'testlink'
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      TestLink Import
    </button>
    <button
      onClick={() => setActiveTab('smart')}
      className={`py-2 px-1 border-b-2 font-medium text-sm ${
        activeTab === 'smart'
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Brain className="w-4 h-4 inline mr-2" />
      Smart Import
    </button>
  </nav>
</div>

// Add tab content
{activeTab === 'smart' && (
  <SmartImportTab
    projects={projects}
    selectedProjectId={selectedProjectId}
    onImportComplete={fetchImportHistory}
  />
)}
```

### Dependencies & Configuration

#### 1. Backend Dependencies
```json
// package.json additions
{
  "dependencies": {
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0",
    "marked": "^9.1.6",
    "openai": "^4.20.1"
  }
}
```

#### 2. Environment Configuration
```bash
# .env additions
OPENAI_API_KEY=your_openai_api_key_here
LLM_PROVIDER=openai
LLM_MODEL=gpt-4-turbo-preview
LLM_MAX_TOKENS=4000
LLM_TEMPERATURE=0.1
```

#### 3. File Upload Configuration
```javascript
// Update multer config in import.js
const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'application/xml', 'text/xml',
      'text/markdown', 'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const allowedExtensions = ['.xml', '.md', '.txt', '.pdf', '.docx'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});
```

### Testing Strategy

#### 1. Unit Tests
- Content parser for each file format
- LLM service test case generation
- Schema validation and mapping

#### 2. Integration Tests  
- End-to-end import workflow
- API endpoint testing
- Frontend component testing

#### 3. Test Documents
Create sample documents in `/testplan-samples/`:
- `sample-test-plan.md`
- `requirements-doc.txt` 
- `test-scenarios.pdf`

This implementation plan provides a complete foundation for the LLM test case generation feature while maintaining integration with existing systems and patterns.

</details>

---

*Last Updated: August 2025 - Phase 0 Infrastructure Complete*