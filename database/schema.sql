-- Test Case Management System Database Schema

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
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
CREATE TABLE test_suites (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test cases table
CREATE TABLE test_cases (
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
CREATE TABLE test_executions (
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
CREATE TABLE test_environments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    configuration JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test execution environment mapping
CREATE TABLE test_execution_environments (
    id SERIAL PRIMARY KEY,
    test_execution_id INTEGER REFERENCES test_executions(id) ON DELETE CASCADE,
    environment_id INTEGER REFERENCES test_environments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Requirements table (extracted from documents)
CREATE TABLE requirements (
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
CREATE TABLE test_case_requirements (
    id SERIAL PRIMARY KEY,
    test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
    requirement_id INTEGER REFERENCES requirements(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test reports table
CREATE TABLE test_reports (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    report_data JSONB,
    file_path VARCHAR(500),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by VARCHAR(255)
);

-- Indexes for better performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_test_cases_project_id ON test_cases(project_id);
CREATE INDEX idx_test_cases_status ON test_cases(status);
CREATE INDEX idx_test_cases_priority ON test_cases(priority);
CREATE INDEX idx_test_executions_test_case_id ON test_executions(test_case_id);
CREATE INDEX idx_test_executions_result ON test_executions(result);
CREATE INDEX idx_test_executions_date ON test_executions(execution_date);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_requirements_document_id ON requirements(document_id);

-- Sample data for testing
INSERT INTO projects (name, description, status) VALUES
('E-commerce Platform', 'Online shopping platform with payment integration', 'active'),
('Mobile Banking App', 'Secure mobile banking application', 'active'),
('CRM System', 'Customer relationship management system', 'completed');

INSERT INTO test_suites (project_id, name, description) VALUES
(1, 'User Authentication', 'Test suite for user login and registration'),
(1, 'Product Management', 'Test suite for product catalog and search'),
(1, 'Payment Processing', 'Test suite for payment and checkout flow'),
(2, 'Account Management', 'Test suite for bank account operations'),
(2, 'Transaction Processing', 'Test suite for money transfers and payments');

INSERT INTO test_cases (project_id, test_suite_id, title, description, test_steps, expected_result, priority, status) VALUES
(1, 1, 'User Login with Valid Credentials', 'Verify that users can login with valid username and password', 
 '1. Navigate to login page\n2. Enter valid username\n3. Enter valid password\n4. Click login button', 
 'User should be successfully logged in and redirected to dashboard', 'high', 'passed'),
(1, 1, 'User Login with Invalid Credentials', 'Verify that login fails with invalid credentials', 
 '1. Navigate to login page\n2. Enter invalid username\n3. Enter invalid password\n4. Click login button', 
 'Login should fail with appropriate error message', 'high', 'failed'),
(1, 2, 'Product Search Functionality', 'Verify that product search returns relevant results', 
 '1. Navigate to product page\n2. Enter search term\n3. Click search button\n4. Review results', 
 'Search should return products matching the search term', 'medium', 'pending');