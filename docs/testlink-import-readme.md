# TestLink XML Import Functionality

## Overview

This module provides comprehensive TestLink XML import functionality for the test case management system. It allows importing test cases, test suites, and related data from TestLink XML export files.

## Features

- ✅ **XML Parsing**: Parse TestLink XML files with nested test suite support
- ✅ **Database Import**: Import parsed data into the database with transaction support
- ✅ **Duplicate Detection**: Handle existing test cases with update logic
- ✅ **Import Logging**: Track import operations with detailed logging
- ✅ **API Endpoints**: RESTful API for file upload and content import
- ✅ **Validation**: Comprehensive validation of XML structure and content
- ✅ **Error Handling**: Robust error handling with rollback support

## Quick Start

### 1. Database Setup

Run the migration script to add TestLink import support:

```sql
-- Run the migration
\i database/migrations/001_testlink_import_schema.sql
```

### 2. Install Dependencies

```bash
cd backend
npm install xml2js
```

### 3. API Usage

#### Import XML File

```bash
curl -X POST http://localhost:3001/api/import/testlink \
  -F "xmlFile=@path/to/testlink-export.xml" \
  -F "projectId=1"
```

#### Import XML Content

```bash
curl -X POST http://localhost:3001/api/import/testlink/content \
  -H "Content-Type: application/json" \
  -d '{
    "xmlContent": "<?xml version=\"1.0\"?>...",
    "projectId": 1,
    "fileName": "test-import.xml"
  }'
```

#### Validate XML Content

```bash
curl -X POST http://localhost:3001/api/import/validate \
  -H "Content-Type: application/json" \
  -d '{
    "xmlContent": "<?xml version=\"1.0\"?>..."
  }'
```

#### Check Import Status

```bash
curl http://localhost:3001/api/import/status/123
```

#### Get Import History

```bash
curl http://localhost:3001/api/import/logs/1
```

## API Reference

### POST `/api/import/testlink`

Import TestLink XML file.

**Parameters:**
- `xmlFile` (multipart): XML file to import
- `projectId` (form): Target project ID
- `documentId` (form, optional): Associated document ID

**Response:**
```json
{
  "message": "Import completed successfully",
  "data": {
    "success": true,
    "importLogId": 123,
    "importedSuites": 18,
    "importedCases": 182,
    "statistics": {
      "totalTestSuites": 18,
      "totalTestCases": 182,
      "hasNestedSuites": true,
      "maxDepth": 3
    }
  }
}
```

### POST `/api/import/testlink/content`

Import TestLink XML from content string.

**Parameters:**
- `xmlContent` (string): XML content
- `projectId` (number): Target project ID
- `documentId` (number, optional): Associated document ID
- `fileName` (string, optional): File name for logging

### POST `/api/import/validate`

Validate TestLink XML content without importing.

**Parameters:**
- `xmlContent` (string): XML content to validate

**Response:**
```json
{
  "message": "Validation completed",
  "data": {
    "isValid": true,
    "errors": [],
    "statistics": {
      "totalTestSuites": 18,
      "totalTestCases": 182,
      "hasNestedSuites": true,
      "maxDepth": 3
    },
    "preview": {
      "name": "Network Control Profile",
      "testSuitesCount": 18,
      "testCasesCount": 182,
      "maxDepth": 3
    }
  }
}
```

### GET `/api/import/status/:importLogId`

Get import operation status.

**Response:**
```json
{
  "message": "Import status retrieved",
  "data": {
    "id": 123,
    "project_id": 1,
    "import_type": "testlink",
    "file_name": "testlink-export.xml",
    "status": "completed",
    "total_test_suites": 18,
    "total_test_cases": 182,
    "imported_test_suites": 18,
    "imported_test_cases": 182,
    "errors": null,
    "started_at": "2024-01-15T10:30:00Z",
    "completed_at": "2024-01-15T10:31:00Z"
  }
}
```

### GET `/api/import/logs/:projectId`

Get import history for a project.

## Database Schema

### Enhanced Tables

#### `test_suites`
- `external_id`: TestLink external ID
- `node_order`: Order within parent
- `parent_suite_id`: Parent suite for hierarchy
- `details`: Additional details
- `import_source`: Import source tracking
- `imported_at`: Import timestamp

#### `test_cases`
- `external_id`: TestLink external ID
- `internal_id`: TestLink internal ID
- `version`: Version number
- `node_order`: Order within suite
- `execution_type`: Manual/Automated (1/2)
- `importance`: Priority level (1-3)
- `is_open`: Open status
- `active`: Active status
- `import_source`: Import source tracking
- `imported_at`: Import timestamp

### New Tables

#### `test_steps`
- `test_case_id`: Reference to test case
- `step_number`: Step order
- `actions`: Action to perform
- `expected_results`: Expected outcome
- `execution_type`: Step execution type

#### `custom_fields`
- `test_case_id`: Reference to test case
- `field_name`: Custom field name
- `field_value`: Custom field value

#### `import_logs`
- `project_id`: Target project
- `document_id`: Associated document
- `import_type`: Import type
- `file_name`: Imported file name
- `status`: Import status
- `total_test_suites`: Total suites found
- `total_test_cases`: Total cases found
- `imported_test_suites`: Successfully imported suites
- `imported_test_cases`: Successfully imported cases
- `errors`: JSON array of errors
- `started_at`: Import start time
- `completed_at`: Import completion time

## Testing

Run the test script to validate the XML parser:

```bash
cd backend
node test-import.js
```

Expected output:
```
Testing TestLink XML Parser...

1. Parsing XML file...
✅ XML file parsed successfully

2. Validating parsed data...
✅ Validation result: PASSED

3. Getting statistics...
✅ Statistics:
   - Total test suites: 18
   - Total test cases: 182
   - Has nested suites: true
   - Max depth: 3

🎉 All tests completed successfully!
```

## Error Handling

The import system provides comprehensive error handling:

1. **File Validation**: Checks file type and size
2. **XML Validation**: Validates XML structure and content
3. **Database Errors**: Handles constraint violations
4. **Partial Imports**: Supports partial imports with error reporting
5. **Rollback**: Automatic rollback on failure

## Performance Considerations

- **File Size Limit**: 50MB maximum file size
- **Batch Processing**: Test cases processed in batches
- **Database Transactions**: Ensures data consistency
- **Memory Management**: Efficient XML parsing for large files
- **Indexing**: Optimized database indexes for performance

## Security

- **File Type Validation**: Only XML files allowed
- **HTML Sanitization**: Cleans HTML content in test steps
- **Path Validation**: Prevents directory traversal attacks
- **File Cleanup**: Automatic cleanup of uploaded files

## Troubleshooting

### Common Issues

1. **File Upload Fails**
   - Check file size (max 50MB)
   - Ensure file is valid XML
   - Verify file extension is .xml

2. **Import Fails**
   - Check database connection
   - Verify project ID exists
   - Review import logs for specific errors

3. **Validation Errors**
   - Ensure XML follows TestLink format
   - Check for required fields (name, internal_id)
   - Verify XML structure is valid

### Debug Mode

Enable detailed logging by setting environment variable:

```bash
export DEBUG=testlink-import:*
```

## Future Enhancements

- [ ] Support for different TestLink XML versions
- [ ] Export functionality to TestLink format
- [ ] Batch import capabilities
- [ ] Import rollback functionality
- [ ] Real-time import progress updates
- [ ] Import templates and presets 