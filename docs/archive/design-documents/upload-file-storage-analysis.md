# Upload File Storage Analysis

## Overview
This document analyzes how uploaded files are handled, stored, and managed in the test case management system, specifically focusing on the differences between TestLink XML imports and general document uploads.

## Current File Storage Implementation

### 1. TestLink XML Import Files

#### Storage Strategy: **Temporary Storage (Auto-Cleanup)**
- **Location**: `backend/uploads/` directory
- **Duration**: Temporary (deleted after processing)
- **Cleanup**: Automatic deletion after import completion

#### Implementation Details:
```javascript
// backend/src/routes/import.js
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // Saves to backend/uploads/
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File cleanup after processing
try {
  await fs.unlink(req.file.path);  // Delete file after import
} catch (cleanupError) {
  console.warn('Failed to cleanup uploaded file:', cleanupError);
}
```

#### File Lifecycle:
1. **Upload**: File saved to `backend/uploads/` with unique timestamp
2. **Processing**: XML parsed and data imported to database
3. **Cleanup**: File automatically deleted from filesystem
4. **Persistence**: Only the parsed data remains in database

### 2. General Document Uploads

#### Storage Strategy: **Permanent Storage**
- **Location**: `backend/uploads/` directory
- **Duration**: Permanent (stored indefinitely)
- **Cleanup**: Manual deletion only

#### Implementation Details:
```javascript
// backend/src/routes/documents.js
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')  // Saves to backend/uploads/
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)  // Timestamp prefix
  }
});

// No automatic cleanup - files remain stored
```

#### File Lifecycle:
1. **Upload**: File saved to `backend/uploads/` with timestamp
2. **Storage**: File remains in filesystem permanently
3. **Database**: File metadata stored in `documents` table
4. **Access**: Files can be retrieved and processed later

## Database Storage Comparison

### TestLink Import Data Storage
```sql
-- Data extracted from XML and stored in database
test_suites (id, project_id, name, description, external_id, import_source)
test_cases (id, project_id, test_suite_id, title, description, external_id, import_source)
test_steps (id, test_case_id, step_number, actions, expected_results)
import_logs (id, project_id, import_type, file_name, status, started_at, completed_at)
```

### Document Upload Data Storage
```sql
-- File metadata stored in database
documents (
    id, project_id, filename, original_name, 
    file_path, file_size, mime_type, parsed_content
)
```

## Current Status Analysis

### ✅ What's Working

1. **TestLink XML Import**:
   - ✅ Files uploaded temporarily to `backend/uploads/`
   - ✅ XML content parsed and stored in database
   - ✅ Files automatically cleaned up after processing
   - ✅ Import logs track all operations
   - ✅ No file storage overhead (temporary only)

2. **Document Uploads**:
   - ✅ Files uploaded to `backend/uploads/`
   - ✅ File metadata stored in `documents` table
   - ✅ Files persist for later access

### ❌ What's Not Complete

1. **Document Processing**:
   - ❌ Document parsing logic not implemented
   - ❌ Content extraction from PDF/Word/Markdown files
   - ❌ Test case generation from documents
   - ❌ Document retrieval functionality

2. **File Management**:
   - ❌ No file size monitoring
   - ❌ No cleanup strategy for old documents
   - ❌ No file access controls
   - ❌ No backup strategy

## File Storage Architecture

### Directory Structure
```
backend/
├── uploads/                    # File storage directory
│   ├── xmlFile-1234567890.xml  # Temporary TestLink files
│   ├── 1234567890-document.pdf # Permanent document files
│   └── 1234567890-report.docx  # Permanent document files
└── src/
    └── routes/
        ├── import.js           # TestLink import (temporary storage)
        └── documents.js        # Document uploads (permanent storage)
```

### Docker Volume Mapping
```yaml
# docker-compose.yml
volumes:
  - ../backend/uploads:/app/uploads  # Persistent file storage
```

## Storage Strategy Comparison

| Aspect | TestLink XML Import | Document Uploads |
|--------|-------------------|------------------|
| **Storage Duration** | Temporary (auto-delete) | Permanent |
| **File Size** | Up to 50MB | Up to 10MB |
| **File Types** | XML only | PDF, Word, Markdown |
| **Database Storage** | Parsed data only | File metadata + content |
| **Cleanup** | Automatic | Manual |
| **Use Case** | One-time import | Document management |

## Implementation Gaps

### 1. Document Processing (High Priority)
```javascript
// TODO: Implement in documents.js
router.post('/upload', upload.single('document'), async (req, res) => {
  // Current: Just stores file
  // Needed: Parse content and extract text
  const parsedContent = await parseDocument(req.file.path);
  // Store parsed content in database
});
```

### 2. File Management (Medium Priority)
- File size monitoring and cleanup
- Access control and permissions
- Backup and recovery procedures
- File versioning

### 3. Storage Optimization (Low Priority)
- File compression
- CDN integration for large files
- Storage quotas per project

## Recommendations

### Immediate Actions (Priority 1)
1. **Complete Document Processing**:
   - Implement PDF parsing with `pdf-parse`
   - Implement Word document parsing with `mammoth`
   - Implement Markdown parsing with `marked`
   - Store extracted content in database

2. **Add File Validation**:
   - File size limits enforcement
   - File type validation
   - Virus scanning (optional)

### Medium-term Actions (Priority 2)
1. **File Management System**:
   - File listing and search
   - File deletion functionality
   - File access controls

2. **Storage Monitoring**:
   - Disk space monitoring
   - File usage analytics
   - Cleanup policies

### Long-term Actions (Priority 3)
1. **Storage Optimization**:
   - File compression
   - Cloud storage integration
   - CDN for large files

## Current File Storage Status

### TestLink Import Files
- **Status**: ✅ Complete and working
- **Storage**: Temporary (auto-cleanup)
- **Database**: Parsed data stored
- **Files**: No persistent files

### Document Upload Files
- **Status**: 🔄 Partially implemented
- **Storage**: Permanent (manual cleanup)
- **Database**: File metadata stored
- **Files**: Persistent in filesystem
- **Processing**: ❌ Not implemented

## Summary

The current implementation has **two different storage strategies**:

1. **TestLink XML Import**: Uses temporary storage with automatic cleanup - files are processed and deleted, only parsed data remains in database.

2. **Document Uploads**: Uses permanent storage - files are kept indefinitely and can be accessed later, but processing logic is incomplete.

**Key Finding**: The TestLink import functionality is complete and working properly with temporary file storage, while the general document upload functionality is incomplete and needs document processing implementation. 