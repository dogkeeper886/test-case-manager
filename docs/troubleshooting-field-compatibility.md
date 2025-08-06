# Field Compatibility Troubleshooting Guide

## Overview

This guide helps diagnose and resolve common field compatibility issues in the Test Case Management System, focusing on TestLink integration, API errors, and MCP server problems.

## Common Field Compatibility Issues

### 1. Version Field Type Mismatch ✅ RESOLVED

**Symptoms:**
- Error: `invalid input syntax for type integer: "1.0"`
- Test case creation fails through MCP server
- Backend expects integer but receives string

**Root Cause:**
Database schema inconsistency where `version` column was `integer` instead of `VARCHAR(20)`.

**Resolution:**
Fixed in migration `010_fix_version_field_type.sql`:
```sql
ALTER TABLE test_cases 
ALTER COLUMN version TYPE VARCHAR(20) USING version::text;
ALTER TABLE test_cases 
ALTER COLUMN version SET DEFAULT '1.0';
```

**Verification:**
```bash
# Check column type
docker compose -f docker/docker-compose.yml exec postgres psql -U postgres -d testcasemanager -c "\d test_cases" | grep version
# Should show: version | character varying(20) | | | '1.0'::character varying
```

### 2. Missing Backend API Fields ✅ RESOLVED

**Symptoms:**
- Fields exist in database but not accessible via API
- MCP server can't set important fields like `importance`, `node_order`
- TestLink export missing critical metadata

**Root Cause:**
Backend API only exposed subset of database fields.

**Resolution:**
Enhanced backend API in `/backend/src/routes/testcases.js`:
- Added `internal_id`, `importance`, `node_order` to CREATE endpoint
- Added structured `steps` array processing
- Fixed field parameter mapping

**Verification:**
```bash
# Test API with all fields
curl -X POST "http://192.168.4.121:3001/api/testcases" \
  -H "Content-Type: application/json" \
  -d '{"project_id": 9, "test_suite_id": 121, "title": "Test All Fields", "importance": 3, "node_order": 1, "internal_id": "TEST-001"}'
```

### 3. MCP Server Field Coverage Gaps ✅ RESOLVED

**Symptoms:**
- MCP server missing fields available in backend API
- Can't create complete TestLink-compatible test cases
- Agent unable to access full field set

**Root Cause:**
MCP server schema incomplete, missing critical TestLink fields.

**Resolution:**
Enhanced MCP server schema with:
- Added `node_order` parameter
- Fixed version field handling
- Added comprehensive field documentation

**Verification:**
Test MCP server with complete field set (requires MCP server restart).

### 4. Database Migration Issues

**Symptoms:**
- Fields missing after migrations
- Schema inconsistencies between environments
- Migration fails or partially applies

**Diagnosis Steps:**
```bash
# Check migration status
docker compose -f docker/docker-compose.yml logs backend | grep -i migration

# Verify all migrations applied
docker compose -f docker/docker-compose.yml exec postgres psql -U postgres -d testcasemanager -c "SELECT migration_name, applied_at FROM migration_history ORDER BY applied_at;"

# Check table structure
docker compose -f docker/docker-compose.yml exec postgres psql -U postgres -d testcasemanager -c "\d test_cases"
```

**Common Fixes:**
1. **Migration not found**: Ensure migration file exists in `/database/migrations/`
2. **Permission issues**: Check docker container permissions
3. **Syntax errors**: Validate SQL syntax in migration files
4. **Order dependencies**: Ensure migrations run in correct sequence

### 5. TestLink Export Compatibility Issues

**Symptoms:**
- XML export fails validation in TestLink
- Missing required TestLink elements
- Import into TestLink produces errors

**Common Issues & Fixes:**

#### Missing CDATA Sections
**Problem**: HTML content not wrapped in CDATA
```xml
<!-- WRONG -->
<summary>Test with <b>HTML</b> content</summary>

<!-- CORRECT -->
<summary><![CDATA[Test with <b>HTML</b> content]]></summary>
```

#### Incorrect Step Structure
**Problem**: Flat step structure instead of nested
```xml
<!-- WRONG -->
<steps>Step 1: Action</steps>

<!-- CORRECT -->
<steps>
  <step>
    <step_number>1</step_number>
    <actions>Action text</actions>
    <expectedresults>Expected result</expectedresults>
  </step>
</steps>
```

#### Missing Internal ID Attribute
**Problem**: Internal ID as element instead of attribute
```xml
<!-- WRONG -->
<testcase name="Test">
  <internalid>123</internalid>
</testcase>

<!-- CORRECT -->
<testcase name="Test" internalid="123">
</testcase>
```

### 6. Foreign Key Constraint Violations

**Symptoms:**
- Error: `violates foreign key constraint`
- Test case creation fails with constraint errors
- Referenced entities don't exist

**Diagnosis:**
```bash
# Check if project exists
docker compose -f docker/docker-compose.yml exec postgres psql -U postgres -d testcasemanager -c "SELECT id, name FROM projects WHERE id = [PROJECT_ID];"

# Check if test suite exists  
docker compose -f docker/docker-compose.yml exec postgres psql -U postgres -d testcasemanager -c "SELECT id, name FROM test_suites WHERE id = [SUITE_ID];"
```

**Resolution:**
1. Create missing parent entities first
2. Verify ID references are correct
3. Check for typos in ID parameters

### 7. Data Type Validation Errors

**Symptoms:**
- Error: `invalid input syntax for type [TYPE]`
- Numeric fields receiving string values
- Boolean fields receiving non-boolean values

**Common Type Mismatches:**
| Field | Expected Type | Common Wrong Type | Fix |
|-------|---------------|-------------------|-----|
| `priority` | INTEGER (1-3) | STRING ("high") | Use numeric values |
| `execution_type` | INTEGER (1-2) | STRING ("manual") | 1=Manual, 2=Automated |
| `importance` | INTEGER (1-3) | STRING ("critical") | 1=Low, 2=Medium, 3=High |
| `is_open` | BOOLEAN | STRING ("true") | Use boolean true/false |
| `estimated_duration` | DECIMAL | STRING | Use numeric minutes |

**Validation:**
```bash
# Test with correct types
curl -X POST "http://192.168.4.121:3001/api/testcases" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 9,
    "title": "Type Test",
    "priority": 1,
    "execution_type": 1, 
    "importance": 3,
    "is_open": true,
    "estimated_duration": 15.5
  }'
```

## Diagnostic Tools and Commands

### Backend Health Check
```bash
# Check backend service status
docker compose -f docker/docker-compose.yml ps backend

# View recent backend logs
docker compose -f docker/docker-compose.yml logs backend | tail -20

# Test API connectivity
curl -s http://192.168.4.121:3001/api/projects | jq .
```

### Database Inspection
```bash
# Connect to database
docker compose -f docker/docker-compose.yml exec postgres psql -U postgres -d testcasemanager

# List all tables
\dt

# Describe test_cases table structure
\d test_cases

# Check recent test cases
SELECT id, title, created_at FROM test_cases ORDER BY created_at DESC LIMIT 5;

# Check step relationships
SELECT tc.title, ts.step_number, ts.action 
FROM test_cases tc 
JOIN test_steps ts ON tc.id = ts.test_case_id 
WHERE tc.id = [TEST_CASE_ID];
```

### MCP Server Debugging
```bash
# Rebuild MCP server
cd /home/jack/Documents/test-case-manager/mcp-server && docker build -t test-case-manager-mcp .

# Test direct API connection
docker run --rm -e API_BASE_URL=http://192.168.4.121:3001/api test-case-manager-mcp

# Check MCP server logs (if available)
docker logs test-case-manager-mcp 2>&1
```

### Field Validation Testing
```bash
# Test minimal required fields
curl -X POST "http://192.168.4.121:3001/api/testcases" \
  -H "Content-Type: application/json" \
  -d '{"project_id": 9, "title": "Minimal Test"}'

# Test with all optional fields
curl -X POST "http://192.168.4.121:3001/api/testcases" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 9,
    "test_suite_id": 121,
    "title": "Complete Test",
    "description": "Full field test",
    "prerequisites": "Test prerequisites",
    "external_id": "EXT-001",
    "internal_id": "INT-001", 
    "version": "2.1",
    "priority": 1,
    "importance": 3,
    "execution_type": 1,
    "estimated_duration": 30,
    "node_order": 5,
    "is_open": true,
    "active": true,
    "status": 1,
    "steps": [
      {
        "step_number": 1,
        "action": "Test action",
        "expected_result": "Expected result",
        "execution_type": 1
      }
    ]
  }'
```

## Recovery Procedures

### 1. Reset to Clean State
```bash
# Stop all services
docker compose -f docker/docker-compose.yml down

# Remove database volumes (DESTRUCTIVE)
docker volume rm test-case-manager_postgres_data

# Restart services (will recreate database)
docker compose -f docker/docker-compose.yml up -d

# Wait for migrations to complete
docker compose -f docker/docker-compose.yml logs backend | grep -i migration
```

### 2. Fix Migration Issues
```bash
# Check migration table
docker compose -f docker/docker-compose.yml exec postgres psql -U postgres -d testcasemanager -c "SELECT * FROM migration_history;"

# Manual migration if needed
docker compose -f docker/docker-compose.yml exec postgres psql -U postgres -d testcasemanager -f /path/to/migration.sql

# Restart backend to retry migrations  
docker compose -f docker/docker-compose.yml restart backend
```

### 3. Field Type Corrections
If you encounter type mismatches in production:

```sql
-- Example: Fix boolean field stored as string
UPDATE test_cases SET is_open = CASE 
  WHEN is_open::text = 'true' THEN true 
  WHEN is_open::text = 'false' THEN false 
  ELSE true END;

-- Example: Fix integer field stored as string  
UPDATE test_cases SET priority = CASE
  WHEN priority = 'high' THEN 1
  WHEN priority = 'medium' THEN 2  
  WHEN priority = 'low' THEN 3
  ELSE 2 END;
```

## Prevention Strategies

### 1. Schema Validation
- Always run migration tests in development first
- Validate field types match across all layers
- Use database constraints to enforce data integrity
- Regular schema consistency checks

### 2. API Testing  
- Test all field combinations during development
- Validate type conversions and defaults
- Use automated API tests for regression prevention
- Document expected field formats clearly

### 3. MCP Server Validation
- Keep MCP schema synchronized with backend API
- Validate all parameters before sending to API
- Implement client-side type checking
- Regular compatibility testing

### 4. Monitoring
- Log field validation errors with details
- Monitor migration application success
- Track API error rates by field type
- Alert on foreign key constraint violations

## Getting Help

### Documentation References
- Field mapping: `/docs/field-mapping.md`
- MCP server usage: `/mcp-server/README.md`  
- PRD with full requirements: `/docs/prd.md`

### Common Log Locations
- Backend API: `docker compose logs backend`
- Database: `docker compose logs postgres`
- Migration status: Backend logs filtered for "migration"

### Support Information
When reporting field compatibility issues, include:
1. Exact error message and stack trace
2. API request payload (sanitized)
3. Database migration status
4. Backend and MCP server versions
5. Steps to reproduce the issue