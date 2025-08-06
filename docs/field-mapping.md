# Test Case Field Mapping Reference

## Overview

This document provides a comprehensive mapping of test case fields across all system layers: TestLink XML format, Database Schema, Backend API, and MCP Server. This ensures 100% TestLink compatibility and prevents field mapping errors.

## Quick Reference Table

| Field | TestLink XML | Database Schema | Backend API | MCP Server | Status |
|-------|-------------|-----------------|-------------|------------|---------|
| **Title/Name** | `<testcase name="">` | `title VARCHAR(255)` | ✅ Required | ✅ Required | ✅ ALIGNED |
| **Description/Summary** | `<summary>` | `description TEXT` | ✅ Optional | ✅ Optional | ✅ ALIGNED |
| **Steps** | `<steps><step>` | `test_steps` table | ✅ Array support | ✅ Array support | ✅ ALIGNED |
| **Expected Results** | `<expectedresults>` | `expected_result TEXT` | ✅ Optional | ✅ Optional | ✅ ALIGNED |
| **External ID** | `<externalid>` | `external_id VARCHAR(100)` | ✅ Optional | ✅ Optional | ✅ ALIGNED |
| **Internal ID** | `internalid=""` (attr) | `internal_id VARCHAR(100)` | ✅ Optional | ✅ Optional | ✅ ALIGNED |
| **Node Order** | `<node_order>` | `node_order INTEGER` | ✅ Optional | ✅ Optional | ✅ ALIGNED |
| **Version** | Not standard | `version VARCHAR(20)` | ✅ Optional | ✅ Optional | ✅ ALIGNED |
| **Execution Type** | `<execution_type>` | `execution_type INTEGER` | ✅ Optional | ✅ Optional | ✅ ALIGNED |
| **Importance** | `<importance>` | `importance INTEGER` | ✅ Optional | ✅ Optional | ✅ ALIGNED |
| **Priority** | Custom field | `priority INTEGER` | ✅ Optional | ✅ Optional | ✅ ALIGNED |
| **Prerequisites** | `<preconditions>` | `prerequisites TEXT` | ✅ Optional | ✅ Optional | ✅ ALIGNED |
| **Estimated Duration** | Custom field | `estimated_exec_duration DECIMAL` | ✅ Optional | ✅ Optional | ✅ ALIGNED |
| **Keywords** | `<keywords><keyword>` | `keywords` table | ✅ Supported | ❌ Pending | 🟡 PARTIAL |
| **Requirements** | `<requirements><requirement>` | `requirements` table | ✅ Supported | ❌ Pending | 🟡 PARTIAL |
| **Custom Fields** | `<custom_fields><custom_field>` | `custom_fields` table | ✅ Supported | ❌ Pending | 🟡 PARTIAL |

## Detailed Field Specifications

### Core Required Fields (TestLink)

#### 1. Test Case Name/Title
- **TestLink XML**: `<testcase name="Test Name">`
- **Database**: `title VARCHAR(255) NOT NULL`
- **Backend API**: `title` (required)
- **MCP Server**: `title` (required)
- **Validation**: Must not be empty, max 255 characters

#### 2. Summary/Description
- **TestLink XML**: `<summary><![CDATA[Description]]></summary>`
- **Database**: `description TEXT`
- **Backend API**: `description` (optional)
- **MCP Server**: `description` (optional)
- **Note**: TestLink requires CDATA wrapping for HTML content

#### 3. Test Steps
- **TestLink XML**: 
  ```xml
  <steps>
    <step>
      <step_number>1</step_number>
      <actions>Action text</actions>
      <expectedresults>Expected result</expectedresults>
      <execution_type>1</execution_type>
    </step>
  </steps>
  ```
- **Database**: `test_steps` table with structured data
- **Backend API**: `steps` array with step objects
- **MCP Server**: `steps` array parameter
- **Legacy Support**: `test_steps` TEXT field for backward compatibility

#### 4. Expected Results
- **TestLink XML**: `<expectedresults><![CDATA[Results]]></expectedresults>`
- **Database**: `expected_result TEXT`
- **Backend API**: `expected_result` (optional)
- **MCP Server**: `expected_result` (optional)

### TestLink Identity Fields

#### 5. Internal ID
- **TestLink XML**: `<testcase internalid="12345">` (XML attribute)
- **Database**: `internal_id VARCHAR(100)`
- **Backend API**: `internal_id` (optional)
- **MCP Server**: `internal_id` (optional)
- **Usage**: Database primary key representation in TestLink

#### 6. External ID
- **TestLink XML**: `<externalid><![CDATA[EXT-001]]></externalid>`
- **Database**: `external_id VARCHAR(100)`
- **Backend API**: `external_id` (optional)
- **MCP Server**: `external_id` (optional)
- **Usage**: User-defined identifier for test case

#### 7. Node Order
- **TestLink XML**: `<node_order><![CDATA[0]]></node_order>`
- **Database**: `node_order INTEGER DEFAULT 0`
- **Backend API**: `node_order` (optional, default: 0)
- **MCP Server**: `node_order` (optional, default: 0)
- **Usage**: Defines hierarchy position in TestLink tree structure

### TestLink Metadata Fields

#### 8. Execution Type
- **TestLink XML**: `<execution_type>1</execution_type>`
- **Database**: `execution_type INTEGER DEFAULT 1`
- **Backend API**: `execution_type` (optional, default: 1)
- **MCP Server**: `execution_type` (optional, default: 1)
- **Values**: 1=Manual, 2=Automated

#### 9. Importance
- **TestLink XML**: `<importance>3</importance>`
- **Database**: `importance INTEGER DEFAULT 2`
- **Backend API**: `importance` (optional, default: 2)
- **MCP Server**: `importance` (optional, default: 2)
- **Values**: 1=Low, 2=Medium, 3=High

#### 10. Prerequisites/Preconditions
- **TestLink XML**: `<preconditions><![CDATA[Prerequisites]]></preconditions>`
- **Database**: `prerequisites TEXT`
- **Backend API**: `prerequisites` (optional)
- **MCP Server**: `prerequisites` (optional)

### System-Specific Fields

#### 11. Priority
- **TestLink XML**: Custom field implementation
- **Database**: `priority INTEGER DEFAULT 2`
- **Backend API**: `priority` (optional, default: 2)
- **MCP Server**: `priority` (optional, default: 2)
- **Values**: 1=High, 2=Medium, 3=Low

#### 12. Version
- **TestLink XML**: Not standard TestLink field
- **Database**: `version VARCHAR(20) DEFAULT '1.0'`
- **Backend API**: `version` (optional, default: '1.0')
- **MCP Server**: `version` (optional, default: '1.0')
- **Format**: Semantic versioning (e.g., "1.0", "2.1")

#### 13. Status Fields
- **Database**: 
  - `status INTEGER DEFAULT 1` (1=Active, 0=Inactive)
  - `is_open BOOLEAN DEFAULT true`
  - `active BOOLEAN DEFAULT true`
- **Backend API**: All optional with defaults
- **MCP Server**: All optional with defaults

#### 14. Estimated Duration
- **TestLink XML**: Custom field implementation
- **Database**: `estimated_exec_duration DECIMAL(10,2)`
- **Backend API**: `estimated_duration` (optional)
- **MCP Server**: `estimated_duration` (optional)
- **Units**: Minutes (decimal format)

### Advanced TestLink Features

#### 15. Keywords (Future Enhancement)
- **TestLink XML**: 
  ```xml
  <keywords>
    <keyword name="Keyword1">
      <notes><![CDATA[Notes]]></notes>
    </keyword>
  </keywords>
  ```
- **Database**: `keywords` table + junction table
- **Backend API**: ✅ Supported (not implemented in MCP)
- **MCP Server**: ❌ Pending implementation

#### 16. Requirements (Future Enhancement)
- **TestLink XML**: 
  ```xml
  <requirements>
    <requirement>
      <req_spec_title><![CDATA[SPEC-001]]></req_spec_title>
      <doc_id><![CDATA[REQ-001]]></doc_id>
      <title><![CDATA[Requirement Title]]></title>
    </requirement>
  </requirements>
  ```
- **Database**: `requirements` table + junction table
- **Backend API**: ✅ Supported (not implemented in MCP)
- **MCP Server**: ❌ Pending implementation

#### 17. Custom Fields (Future Enhancement)
- **TestLink XML**: 
  ```xml
  <custom_fields>
    <custom_field>
      <name><![CDATA[FIELD_NAME]]></name>
      <value><![CDATA[Field Value]]></value>
    </custom_field>
  </custom_fields>
  ```
- **Database**: `custom_fields` table
- **Backend API**: ✅ Supported (not implemented in MCP)
- **MCP Server**: ❌ Pending implementation

## Data Type Mappings

| Database Type | Backend API Type | MCP Server Type | TestLink XML Format |
|---------------|------------------|-----------------|---------------------|
| `VARCHAR(n)` | `string` | `string` | `<![CDATA[text]]>` |
| `TEXT` | `string` | `string` | `<![CDATA[text]]>` |
| `INTEGER` | `number` | `number` | `<element>123</element>` |
| `DECIMAL(10,2)` | `number` | `number` | `<element>12.5</element>` |
| `BOOLEAN` | `boolean` | `boolean` | `<element>true</element>` |
| `TIMESTAMP` | `string (ISO)` | `string (ISO)` | Not exported |

## Migration History

| Migration | Date | Purpose | Fields Added/Modified |
|-----------|------|---------|----------------------|
| `001_testlink_import_schema.sql` | Initial | TestLink compatibility | `external_id`, `internal_id`, `version`, `node_order`, `execution_type`, `importance`, `is_open`, `active` |
| `007_add_project_id_to_test_cases.sql` | 2025-08-05 | API compatibility | `project_id` |
| `008_add_missing_test_case_fields.sql` | 2025-08-05 | API requirements | `test_steps`, `expected_result` |
| `009_fix_testlink_compatibility.sql` | 2025-08-06 | TestLink 100% compatibility | `estimated_exec_duration`, keywords/requirements/custom_fields tables |
| `010_fix_version_field_type.sql` | 2025-08-06 | Version type mismatch fix | `version` type fixed to VARCHAR(20) |

## Validation Rules

### Required Fields (Backend API)
- `project_id`: Must reference existing project
- `title`: Non-empty string, max 255 characters
- `test_suite_id`: Must reference existing test suite (optional)

### TestLink Export Requirements
- All text fields with HTML content should use CDATA sections
- `internalid` must be included as XML attribute
- Steps must follow nested XML structure
- Node order determines hierarchy in TestLink

### Data Integrity
- Foreign key constraints enforced at database level
- Step numbers must be sequential for each test case
- Custom field names must be unique per test case
- Keywords must exist before linking to test cases

## Performance Considerations

### Database Indexes
- Primary keys: All tables have serial primary keys
- Foreign keys: All foreign key columns indexed
- Search fields: `external_id`, `internal_id`, `title` indexed
- Junction tables: Both foreign key columns indexed

### API Performance
- Bulk operations supported for test case creation
- Pagination implemented for large result sets
- Query optimization for complex joins
- Connection pooling for database efficiency

## Error Handling

### Common Field Errors
1. **Version Type Mismatch**: Fixed in migration 010
2. **Missing Required Fields**: Validation at API level
3. **Invalid Foreign Keys**: Database constraint errors
4. **Field Length Exceeded**: Database length constraints
5. **Invalid Enum Values**: API validation with descriptive errors

### Troubleshooting Steps
1. Check database migration status
2. Verify API field names match documentation
3. Confirm data types match expected formats
4. Validate foreign key references exist
5. Review error logs for detailed messages