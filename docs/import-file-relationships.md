# Import File Relationships and Dependencies

## File Structure Overview

```
test-case-manager/
├── frontend/
│   └── src/
│       ├── pages/
│       │   └── Import.js                    # Frontend upload interface
│       └── services/
│           └── api.js                       # API client for backend calls
├── backend/
│   └── src/
│       ├── routes/
│       │   └── import.js                    # API endpoints for import
│       ├── services/
│       │   ├── database.js                  # Database connection pool
│       │   └── TestLinkImportService.js     # Main import logic
│       └── utils/
│           └── TestLinkXMLParser.js         # XML parsing utilities
├── database/
│   ├── schema.sql                           # Base database schema
│   └── migrations/
│       └── 001_testlink_import_schema.sql   # Import-specific tables
└── testlink-samples/
    ├── Network Control (Services).testsuite-deep.xml
    └── Network Control (Policies).testsuite-deep.xml
```

## File Dependencies Flow

### 1. Frontend Layer
```
Import.js (User Interface)
    ↓ imports
api.js (API Client)
    ↓ HTTP POST
Backend API
```

**Key Dependencies:**
- `Import.js` → `api.js` (for HTTP requests)
- `Import.js` → UI components (Button, Card, Badge, etc.)

### 2. Backend API Layer
```
import.js (Routes)
    ↓ imports
TestLinkImportService.js
    ↓ imports
TestLinkXMLParser.js
    ↓ imports
database.js
```

**Key Dependencies:**
- `import.js` → `multer` (file upload handling)
- `import.js` → `TestLinkImportService` (import logic)
- `import.js` → `fs` (file system operations)

### 3. Service Layer
```
TestLinkImportService.js
    ↓ uses
TestLinkXMLParser.js
    ↓ uses
database.js (PostgreSQL connection)
```

**Key Dependencies:**
- `TestLinkImportService.js` → `xml2js` (XML parsing)
- `TestLinkImportService.js` → `pg` (PostgreSQL client)

## Detailed File Relationships

### Frontend Files

#### `frontend/src/pages/Import.js`
**Purpose**: User interface for file upload
**Dependencies**:
- `../components/ui` (UI components)
- `../services/api` (API client)
- `../components/layout/Layout` (page layout)

**Key Functions**:
```javascript
// File upload handling
handleFileUpload(file) → api.post('/import/testlink', formData)

// File selection
handleFileSelect(event) → handleFileUpload(file)

// Drag and drop
handleDrop(event) → handleFileUpload(file)
```

#### `frontend/src/services/api.js`
**Purpose**: HTTP client for backend communication
**Dependencies**:
- `axios` (HTTP library)

**Key Functions**:
```javascript
// API base configuration
const api = axios.create({
  baseURL: 'http://192.168.4.121:3001/api'
});

// POST request for file upload
api.post('/import/testlink', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### Backend Files

#### `backend/src/routes/import.js`
**Purpose**: API endpoints for import functionality
**Dependencies**:
- `multer` (file upload middleware)
- `TestLinkImportService` (import logic)
- `fs` (file system)

**Key Endpoints**:
```javascript
// File upload import
POST /api/import/testlink
  ↓
multer.single('xmlFile')
  ↓
TestLinkImportService.importFromFile()

// Import history
GET /api/import/logs/:projectId
  ↓
TestLinkImportService.getImportLogs()

// Import status
GET /api/import/status/:importLogId
  ↓
TestLinkImportService.getImportLog()
```

#### `backend/src/services/TestLinkImportService.js`
**Purpose**: Core import logic and database operations
**Dependencies**:
- `TestLinkXMLParser` (XML parsing)
- `database.js` (PostgreSQL connection)

**Key Methods**:
```javascript
// Main import method
importFromFile(filePath, projectId, documentId)
  ↓
createImportLog() → database
  ↓
parser.parseFile() → TestLinkXMLParser
  ↓
importTestSuiteRecursive() → database operations
  ↓
updateImportLog() → database

// Recursive import
importTestSuiteRecursive(suiteData, projectId, parentId, client)
  ↓
importTestSuite() → database
  ↓
importTestCase() → database
  ↓
importTestSteps() → database
```

#### `backend/src/utils/TestLinkXMLParser.js`
**Purpose**: XML parsing and validation
**Dependencies**:
- `xml2js` (XML to JavaScript parser)
- `fs` (file reading)

**Key Methods**:
```javascript
// Parse XML file
parseFile(filePath)
  ↓
fs.readFile() → read XML content
  ↓
parser.parseStringPromise() → xml2js
  ↓
parseTestSuite() → recursive parsing

// Parse test suite
parseTestSuite(suiteElement)
  ↓
parseTestCase() → for each test case
  ↓
parseTestStep() → for each test step
```

#### `backend/src/services/database.js`
**Purpose**: Database connection and query utilities
**Dependencies**:
- `pg` (PostgreSQL client)

**Key Functions**:
```javascript
// Database pool
const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// Query helper
query(text, params) → pool.query()
```

### Database Files

#### `database/schema.sql`
**Purpose**: Base database schema
**Tables**:
- `projects` (project information)
- `test_suites` (test suite hierarchy)
- `test_cases` (individual test cases)
- `test_steps` (detailed test steps)
- `test_executions` (execution results)

#### `database/migrations/001_testlink_import_schema.sql`
**Purpose**: Import-specific database enhancements
**Additions**:
- Enhanced `test_suites` table (external_id, parent_suite_id, import_source)
- Enhanced `test_cases` table (external_id, internal_id, import_source)
- `import_logs` table (import tracking)
- `test_steps` table (detailed steps)
- `custom_fields` table (TestLink custom fields)

## Data Flow Between Files

### 1. File Upload Flow
```
User selects XML file
    ↓
Import.js (frontend)
    ↓
api.js → HTTP POST
    ↓
import.js (backend route)
    ↓
multer → save file temporarily
    ↓
TestLinkImportService.importFromFile()
    ↓
TestLinkXMLParser.parseFile()
    ↓
Database operations (test_suites, test_cases, test_steps)
    ↓
Import log update
    ↓
Response to frontend
```

### 2. XML Parsing Flow
```
XML file content
    ↓
TestLinkXMLParser.parseFile()
    ↓
xml2js.parseStringPromise()
    ↓
parseTestSuite() (recursive)
    ↓
parseTestCase() → parseTestStep()
    ↓
Structured JavaScript objects
    ↓
Database insertion
```

### 3. Database Storage Flow
```
Parsed XML data
    ↓
TestLinkImportService.importTestSuiteRecursive()
    ↓
Database transaction BEGIN
    ↓
INSERT test_suites (with parent relationships)
    ↓
INSERT test_cases (with suite relationships)
    ↓
INSERT test_steps (with case relationships)
    ↓
INSERT custom_fields (if any)
    ↓
Database transaction COMMIT
    ↓
UPDATE import_logs (success status)
```

## Error Handling Flow

### 1. File Upload Errors
```
Invalid file type
    ↓
multer fileFilter → reject file
    ↓
Return 400 error to frontend
    ↓
Import.js displays error message
```

### 2. XML Parsing Errors
```
Corrupted XML
    ↓
TestLinkXMLParser.parseFile() → throws error
    ↓
TestLinkImportService catches error
    ↓
UPDATE import_logs (failed status)
    ↓
Return 500 error to frontend
```

### 3. Database Errors
```
Constraint violation
    ↓
Database transaction ROLLBACK
    ↓
TestLinkImportService catches error
    ↓
UPDATE import_logs (failed status)
    ↓
Return 500 error to frontend
```

## Performance Considerations

### File Size Impact
- **Small files (<1MB)**: All processing in memory
- **Large files (>10MB)**: May need streaming parser
- **Database**: Transaction-based for consistency

### Memory Usage
- XML parsing loads entire file into memory
- Database connections are pooled
- Temporary files are cleaned up after processing

### Optimization Points
- Batch inserts for test steps
- Database indexes on foreign keys
- Connection pooling for database operations 