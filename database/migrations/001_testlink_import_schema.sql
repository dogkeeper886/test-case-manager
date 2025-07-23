-- Migration: Add TestLink Import Support
-- Date: 2024-01-XX
-- Description: Enhance database schema to support TestLink XML import functionality

-- 1. Enhanced Test Suites Table
ALTER TABLE test_suites 
ADD COLUMN IF NOT EXISTS external_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS node_order INTEGER,
ADD COLUMN IF NOT EXISTS parent_suite_id INTEGER REFERENCES test_suites(id),
ADD COLUMN IF NOT EXISTS details TEXT,
ADD COLUMN IF NOT EXISTS import_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS imported_at TIMESTAMP;

-- 2. Enhanced Test Cases Table
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

-- 3. Create Test Steps Table
CREATE TABLE IF NOT EXISTS test_steps (
    id SERIAL PRIMARY KEY,
    test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    actions TEXT NOT NULL,
    expected_results TEXT NOT NULL,
    execution_type INTEGER DEFAULT 1, -- 1=Manual, 2=Automated
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Custom Fields Table
CREATE TABLE IF NOT EXISTS custom_fields (
    id SERIAL PRIMARY KEY,
    test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
    field_name VARCHAR(255) NOT NULL,
    field_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Import Logs Table
CREATE TABLE IF NOT EXISTS import_logs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    import_type VARCHAR(50) NOT NULL, -- 'testlink', 'other'
    file_name VARCHAR(255) NOT NULL,
    total_test_suites INTEGER DEFAULT 0,
    total_test_cases INTEGER DEFAULT 0,
    imported_test_suites INTEGER DEFAULT 0,
    imported_test_cases INTEGER DEFAULT 0,
    errors JSONB, -- Store import errors
    status VARCHAR(50) DEFAULT 'processing', -- processing, completed, failed
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL
);

-- 6. Add Indexes for Performance
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

-- 7. Add Comments for Documentation
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