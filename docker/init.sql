-- Database initialization script for Test Case Manager
-- This script runs when the PostgreSQL container starts

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE testcasemanager'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'testcasemanager')\gexec

-- Connect to the database
\c testcasemanager;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- BASIC SCHEMA (from schema.sql)
-- ============================================================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    content TEXT,
    status VARCHAR(50) DEFAULT 'uploaded',
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test suites table
CREATE TABLE IF NOT EXISTS test_suites (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test cases table
CREATE TABLE IF NOT EXISTS test_cases (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    test_suite_id INTEGER REFERENCES test_suites(id) ON DELETE SET NULL,
    document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    preconditions TEXT,
    test_steps TEXT NOT NULL,
    expected_result TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'pending',
    test_type VARCHAR(50) DEFAULT 'functional',
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test executions table
CREATE TABLE IF NOT EXISTS test_executions (
    id SERIAL PRIMARY KEY,
    test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
    executed_by VARCHAR(255),
    execution_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result VARCHAR(20) NOT NULL, -- passed, failed, blocked, skipped
    actual_result TEXT,
    notes TEXT,
    execution_time INTEGER, -- in seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test execution environments table
CREATE TABLE IF NOT EXISTS test_environments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    configuration JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test execution environment mapping
CREATE TABLE IF NOT EXISTS test_execution_environments (
    id SERIAL PRIMARY KEY,
    test_execution_id INTEGER REFERENCES test_executions(id) ON DELETE CASCADE,
    environment_id INTEGER REFERENCES test_environments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Requirements table (extracted from documents)
CREATE TABLE IF NOT EXISTS requirements (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    requirement_text TEXT NOT NULL,
    requirement_type VARCHAR(50) DEFAULT 'functional',
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test case requirements mapping
CREATE TABLE IF NOT EXISTS test_case_requirements (
    id SERIAL PRIMARY KEY,
    test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
    requirement_id INTEGER REFERENCES requirements(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test reports table
CREATE TABLE IF NOT EXISTS test_reports (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- execution, coverage, etc.
    report_data JSONB NOT NULL,
    generated_by VARCHAR(255),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MIGRATION 001: TestLink Import Schema
-- ============================================================================

-- Enhanced Test Suites Table
ALTER TABLE test_suites 
ADD COLUMN IF NOT EXISTS external_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS node_order INTEGER,
ADD COLUMN IF NOT EXISTS parent_suite_id INTEGER REFERENCES test_suites(id),
ADD COLUMN IF NOT EXISTS details TEXT,
ADD COLUMN IF NOT EXISTS import_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS imported_at TIMESTAMP;

-- Enhanced Test Cases Table
ALTER TABLE test_cases 
ADD COLUMN IF NOT EXISTS external_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS internal_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS version VARCHAR(20),
ADD COLUMN IF NOT EXISTS node_order INTEGER,
ADD COLUMN IF NOT EXISTS execution_type INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS importance INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS import_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS imported_at TIMESTAMP;

-- Create Test Steps Table (if not exists)
CREATE TABLE IF NOT EXISTS test_steps (
    id SERIAL PRIMARY KEY,
    test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    actions TEXT NOT NULL,
    expected_results TEXT NOT NULL,
    execution_type INTEGER DEFAULT 1, -- 1=Manual, 2=Automated
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Custom Fields Table (if not exists)
CREATE TABLE IF NOT EXISTS custom_fields (
    id SERIAL PRIMARY KEY,
    test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
    field_name VARCHAR(255) NOT NULL,
    field_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Import Logs Table (if not exists)
CREATE TABLE IF NOT EXISTS import_logs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    import_type VARCHAR(50) NOT NULL, -- 'testlink', 'other'
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER DEFAULT 0, -- File size in bytes
    total_test_suites INTEGER DEFAULT 0,
    total_test_cases INTEGER DEFAULT 0,
    imported_test_suites INTEGER DEFAULT 0,
    imported_test_cases INTEGER DEFAULT 0,
    errors JSONB, -- Store import errors
    status VARCHAR(50) DEFAULT 'processing', -- processing, completed, failed
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL
);

-- ============================================================================
-- MIGRATION 003: Add Status to Projects
-- ============================================================================

-- Add status column to projects table (already exists in basic schema, but ensure it's there)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- ============================================================================
-- MIGRATION 004: Import File Retry Window
-- ============================================================================

-- Add retry window fields to import_logs table
ALTER TABLE import_logs 
ADD COLUMN IF NOT EXISTS file_path VARCHAR(500), -- Path to uploaded file
ADD COLUMN IF NOT EXISTS retry_until TIMESTAMP NULL, -- Until when retry is allowed
ADD COLUMN IF NOT EXISTS cleanup_scheduled BOOLEAN DEFAULT FALSE; -- Whether cleanup is scheduled

-- ============================================================================
-- MIGRATION 002: Activity Tracking System
-- ============================================================================

-- Create Activity Table
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) DEFAULT 'system', -- For now, default to 'system' since we don't have user auth yet
    action_type VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'import', 'export', 'execute'
    entity_type VARCHAR(100) NOT NULL, -- 'project', 'test_case', 'test_suite', 'document', 'report'
    entity_id INTEGER, -- ID of the affected entity
    entity_name VARCHAR(255), -- Name/title of the affected entity
    description TEXT NOT NULL, -- Human-readable description of the action
    metadata JSONB, -- Additional data about the action
    ip_address INET, -- IP address of the user (optional)
    user_agent TEXT, -- User agent string (optional)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Activity Types Table for better organization
CREATE TABLE IF NOT EXISTS activity_types (
    id SERIAL PRIMARY KEY,
    type_code VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100), -- Icon name for UI display
    color VARCHAR(50), -- Color for UI display
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default activity types
INSERT INTO activity_types (type_code, display_name, description, icon, color) VALUES
('project_create', 'Project Created', 'A new project was created', 'FolderOpen', 'success'),
('project_update', 'Project Updated', 'An existing project was modified', 'FolderOpen', 'apple-blue'),
('project_delete', 'Project Deleted', 'A project was deleted', 'FolderOpen', 'error'),
('test_case_create', 'Test Case Created', 'A new test case was created', 'FileText', 'success'),
('test_case_update', 'Test Case Updated', 'An existing test case was modified', 'FileText', 'apple-blue'),
('test_case_delete', 'Test Case Deleted', 'A test case was deleted', 'FileText', 'error'),
('test_case_execute', 'Test Case Executed', 'A test case was executed', 'CheckCircle', 'success'),
('test_suite_create', 'Test Suite Created', 'A new test suite was created', 'FolderOpen', 'success'),
('test_suite_update', 'Test Suite Updated', 'An existing test suite was modified', 'FolderOpen', 'apple-blue'),
('test_suite_delete', 'Test Suite Deleted', 'A test suite was deleted', 'FolderOpen', 'error'),
('document_upload', 'Document Uploaded', 'A new document was uploaded', 'File', 'success'),
('document_process', 'Document Processed', 'A document was processed for requirements extraction', 'FileText', 'apple-blue'),
('import_start', 'Import Started', 'A data import operation was initiated', 'Upload', 'warning'),
('import_complete', 'Import Completed', 'A data import operation was completed', 'CheckCircle', 'success'),
('import_failed', 'Import Failed', 'A data import operation failed', 'XCircle', 'error'),
('report_generate', 'Report Generated', 'A new report was generated', 'BarChart3', 'success'),
('report_export', 'Report Exported', 'A report was exported', 'Download', 'apple-blue')
ON CONFLICT (type_code) DO NOTHING;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Basic schema indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_test_cases_project_id ON test_cases(project_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_status ON test_cases(status);
CREATE INDEX IF NOT EXISTS idx_test_cases_priority ON test_cases(priority);
CREATE INDEX IF NOT EXISTS idx_test_executions_test_case_id ON test_executions(test_case_id);
CREATE INDEX IF NOT EXISTS idx_test_executions_result ON test_executions(result);
CREATE INDEX IF NOT EXISTS idx_test_executions_date ON test_executions(execution_date);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_requirements_document_id ON requirements(document_id);

-- TestLink import indexes
CREATE INDEX IF NOT EXISTS idx_test_suites_external_id ON test_suites(external_id);
CREATE INDEX IF NOT EXISTS idx_test_suites_parent_id ON test_suites(parent_suite_id);
CREATE INDEX IF NOT EXISTS idx_test_suites_import_source ON test_suites(import_source);

CREATE INDEX IF NOT EXISTS idx_test_cases_external_id ON test_cases(external_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_internal_id ON test_cases(internal_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_execution_type ON test_cases(execution_type);
CREATE INDEX IF NOT EXISTS idx_test_cases_importance ON test_cases(importance);
CREATE INDEX IF NOT EXISTS idx_test_cases_import_source ON test_cases(import_source);

CREATE INDEX IF NOT EXISTS idx_test_steps_test_case_id ON test_steps(test_case_id);
CREATE INDEX IF NOT EXISTS idx_test_steps_step_number ON test_steps(step_number);

CREATE INDEX IF NOT EXISTS idx_custom_fields_test_case_id ON custom_fields(test_case_id);
CREATE INDEX IF NOT EXISTS idx_custom_fields_name ON custom_fields(field_name);

CREATE INDEX IF NOT EXISTS idx_import_logs_project_id ON import_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON import_logs(status);
CREATE INDEX IF NOT EXISTS idx_import_logs_started_at ON import_logs(started_at);
CREATE INDEX IF NOT EXISTS idx_import_logs_retry_until ON import_logs(retry_until);
CREATE INDEX IF NOT EXISTS idx_import_logs_cleanup_scheduled ON import_logs(cleanup_scheduled);

-- Activity tracking indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_action_type ON activities(action_type);
CREATE INDEX IF NOT EXISTS idx_activities_entity_type ON activities(entity_type);
CREATE INDEX IF NOT EXISTS idx_activities_entity_id ON activities(entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_action ON activities(user_id, action_type);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Create a function to log activities
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id VARCHAR(255),
    p_action_type VARCHAR(100),
    p_entity_type VARCHAR(100),
    p_entity_id INTEGER,
    p_entity_name VARCHAR(255),
    p_description TEXT,
    p_metadata JSONB
) RETURNS INTEGER AS $$
DECLARE
    activity_id INTEGER;
BEGIN
    INSERT INTO activities (
        user_id, 
        action_type, 
        entity_type, 
        entity_id, 
        entity_name, 
        description, 
        metadata
    ) VALUES (
        p_user_id,
        p_action_type,
        p_entity_type,
        p_entity_id,
        p_entity_name,
        p_description,
        p_metadata
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get recent activities
CREATE OR REPLACE FUNCTION get_recent_activities(
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0,
    p_user_id VARCHAR(255) DEFAULT NULL,
    p_action_type VARCHAR(100) DEFAULT NULL,
    p_entity_type VARCHAR(100) DEFAULT NULL
) RETURNS TABLE (
    id INTEGER,
    user_id VARCHAR(255),
    action_type VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id INTEGER,
    entity_name VARCHAR(255),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.user_id,
        a.action_type,
        a.entity_type,
        a.entity_id,
        a.entity_name,
        a.description,
        a.metadata,
        a.created_at
    FROM activities a
    WHERE (p_user_id IS NULL OR a.user_id = p_user_id)
      AND (p_action_type IS NULL OR a.action_type = p_action_type)
      AND (p_entity_type IS NULL OR a.entity_type = p_entity_type)
    ORDER BY a.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN test_suites.external_id IS 'TestLink external ID for import tracking';
COMMENT ON COLUMN test_suites.node_order IS 'Order within parent suite';
COMMENT ON COLUMN test_suites.parent_suite_id IS 'Parent test suite for hierarchy';
COMMENT ON COLUMN test_suites.import_source IS 'Source of import (testlink, manual, etc.)';
COMMENT ON COLUMN test_suites.imported_at IS 'Timestamp when imported';

COMMENT ON COLUMN test_cases.external_id IS 'TestLink external ID for import tracking';
COMMENT ON COLUMN test_cases.internal_id IS 'TestLink internal ID';
COMMENT ON COLUMN test_cases.execution_type IS '1=Manual, 2=Automated';
COMMENT ON COLUMN test_cases.importance IS '1=Low, 2=Medium, 3=High';
COMMENT ON COLUMN test_cases.import_source IS 'Source of import (testlink, manual, etc.)';
COMMENT ON COLUMN test_cases.imported_at IS 'Timestamp when imported';

COMMENT ON TABLE test_steps IS 'Individual test steps for test cases';
COMMENT ON COLUMN test_steps.execution_type IS '1=Manual, 2=Automated';

COMMENT ON TABLE custom_fields IS 'Custom fields from TestLink import';
COMMENT ON TABLE import_logs IS 'Log of import operations for tracking and debugging';
COMMENT ON COLUMN import_logs.file_path IS 'Path to uploaded file for retry functionality';
COMMENT ON COLUMN import_logs.retry_until IS 'Timestamp until when retry is allowed (48 hours from import)';
COMMENT ON COLUMN import_logs.cleanup_scheduled IS 'Whether file cleanup has been scheduled';

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert sample data
INSERT INTO projects (name, description) VALUES 
('Sample Project', 'A sample project for testing the system')
ON CONFLICT DO NOTHING;

-- Insert sample test suite
INSERT INTO test_suites (project_id, name, description) VALUES 
(1, 'Sample Test Suite', 'A sample test suite')
ON CONFLICT DO NOTHING;

-- Insert sample test case
INSERT INTO test_cases (test_suite_id, title, description, execution_type, importance) VALUES 
(1, 'Sample Test Case', 'A sample test case for demonstration', 1, 2)
ON CONFLICT DO NOTHING;

-- Insert sample test steps
INSERT INTO test_steps (test_case_id, step_number, actions, expected_results) VALUES 
(1, 1, 'Navigate to the application', 'Application loads successfully'),
(1, 2, 'Click on the login button', 'Login form appears')
ON CONFLICT DO NOTHING;

-- Insert sample custom field
INSERT INTO custom_fields (test_case_id, field_name, field_value) VALUES 
(1, 'CF_AUTOMATION_STATUS', 'Not Automated')
ON CONFLICT DO NOTHING; 