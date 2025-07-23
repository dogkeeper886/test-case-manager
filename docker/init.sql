-- Database initialization script for Test Case Manager
-- This script runs when the PostgreSQL container starts

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE testcasemanager'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'testcasemanager')\gexec

-- Connect to the database
\c testcasemanager;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (this will be replaced by the actual schema.sql content)
-- For now, we'll create a basic structure

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test suites table
CREATE TABLE IF NOT EXISTS test_suites (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES test_suites(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test cases table (with TestLink compatibility)
CREATE TABLE IF NOT EXISTS test_cases (
    id SERIAL PRIMARY KEY,
    test_suite_id INTEGER REFERENCES test_suites(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    prerequisites TEXT, -- TestLink preconditions
    execution_type INTEGER DEFAULT 1, -- 1=Manual, 2=Automated
    external_id VARCHAR(100), -- TestLink externalid
    version INTEGER DEFAULT 1, -- TestLink version
    priority INTEGER DEFAULT 2, -- TestLink importance (1=Low, 2=Medium, 3=High)
    is_open BOOLEAN DEFAULT true, -- TestLink is_open
    active BOOLEAN DEFAULT true, -- TestLink active
    status INTEGER DEFAULT 1, -- TestLink status
    estimated_duration INTEGER, -- TestLink estimated_exec_duration
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test steps table (with TestLink compatibility)
CREATE TABLE IF NOT EXISTS test_steps (
    id SERIAL PRIMARY KEY,
    test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    action TEXT NOT NULL,
    expected_result TEXT NOT NULL,
    execution_type INTEGER DEFAULT 1, -- 1=Manual, 2=Automated
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom fields table (for TestLink custom_fields)
CREATE TABLE IF NOT EXISTS custom_fields (
    id SERIAL PRIMARY KEY,
    test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
    field_name VARCHAR(255) NOT NULL,
    field_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test executions table
CREATE TABLE IF NOT EXISTS test_executions (
    id SERIAL PRIMARY KEY,
    test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- passed, failed, blocked, skipped
    executed_by VARCHAR(255),
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    duration INTEGER -- execution time in seconds
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),
    parsed_content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_cases_suite_id ON test_cases(test_suite_id);
CREATE INDEX IF NOT EXISTS idx_test_steps_case_id ON test_steps(test_case_id);
CREATE INDEX IF NOT EXISTS idx_custom_fields_case_id ON custom_fields(test_case_id);
CREATE INDEX IF NOT EXISTS idx_test_executions_case_id ON test_executions(test_case_id);
CREATE INDEX IF NOT EXISTS idx_test_suites_project_id ON test_suites(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);

-- Insert sample data
INSERT INTO projects (name, description) VALUES 
('Sample Project', 'A sample project for testing the system')
ON CONFLICT DO NOTHING;

-- Insert sample test suite
INSERT INTO test_suites (project_id, name, description) VALUES 
(1, 'Sample Test Suite', 'A sample test suite')
ON CONFLICT DO NOTHING;

-- Insert sample test case
INSERT INTO test_cases (test_suite_id, title, description, execution_type, priority) VALUES 
(1, 'Sample Test Case', 'A sample test case for demonstration', 1, 2)
ON CONFLICT DO NOTHING;

-- Insert sample test steps
INSERT INTO test_steps (test_case_id, step_number, action, expected_result) VALUES 
(1, 1, 'Navigate to the application', 'Application loads successfully'),
(1, 2, 'Click on the login button', 'Login form appears')
ON CONFLICT DO NOTHING;

-- Insert sample custom field
INSERT INTO custom_fields (test_case_id, field_name, field_value) VALUES 
(1, 'CF_AUTOMATION_STATUS', 'Not Automated')
ON CONFLICT DO NOTHING; 