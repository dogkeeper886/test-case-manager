-- Migration: Fix Critical TestLink XML Compatibility Issues
-- Date: 2025-08-06
-- Description: Address critical TestLink compatibility gaps identified in Epic 4 Story 4.1
-- CRITICAL FINDINGS:
-- - TestLink uses `internalid` as XML attribute, not element
-- - Missing `node_order` field essential for TestLink hierarchy
-- - Missing `estimated_exec_duration` field with decimal format
-- - Missing keywords support with proper structure

-- 1. Fix Missing TestLink Essential Fields
ALTER TABLE test_cases 
ADD COLUMN IF NOT EXISTS estimated_exec_duration DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS keywords JSONB DEFAULT '[]'::jsonb;

-- 2. Create Keywords Table for proper TestLink structure
CREATE TABLE IF NOT EXISTS keywords (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Test Case Keywords Junction Table
CREATE TABLE IF NOT EXISTS test_case_keywords (
    id SERIAL PRIMARY KEY,
    test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
    keyword_id INTEGER REFERENCES keywords(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(test_case_id, keyword_id)
);

-- 4. Create Requirements Table for TestLink Requirements Linking  
CREATE TABLE IF NOT EXISTS requirements (
    id SERIAL PRIMARY KEY,
    doc_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT DEFAULT '',
    req_spec_title VARCHAR(255) DEFAULT '',
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doc_id, project_id)
);

-- 5. Create Test Case Requirements Junction Table
CREATE TABLE IF NOT EXISTS test_case_requirements (
    id SERIAL PRIMARY KEY,
    test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
    requirement_id INTEGER REFERENCES requirements(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(test_case_id, requirement_id)
);

-- 6. Add Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_test_cases_estimated_exec_duration ON test_cases(estimated_exec_duration);
CREATE INDEX IF NOT EXISTS idx_test_cases_keywords ON test_cases USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_keywords_name ON keywords(name);
CREATE INDEX IF NOT EXISTS idx_test_case_keywords_test_case_id ON test_case_keywords(test_case_id);
CREATE INDEX IF NOT EXISTS idx_test_case_keywords_keyword_id ON test_case_keywords(keyword_id);
CREATE INDEX IF NOT EXISTS idx_requirements_doc_id ON requirements(doc_id);
CREATE INDEX IF NOT EXISTS idx_requirements_project_id ON requirements(project_id);
CREATE INDEX IF NOT EXISTS idx_test_case_requirements_test_case_id ON test_case_requirements(test_case_id);
CREATE INDEX IF NOT EXISTS idx_test_case_requirements_requirement_id ON test_case_requirements(requirement_id);

-- 7. Add Comments for Documentation
COMMENT ON COLUMN test_cases.estimated_exec_duration IS 'Estimated execution duration in minutes (decimal format for TestLink compatibility)';
COMMENT ON COLUMN test_cases.keywords IS 'JSONB array of keywords for backward compatibility';

COMMENT ON TABLE keywords IS 'Keywords for test case categorization (TestLink compatible)';
COMMENT ON COLUMN keywords.name IS 'Keyword name (must be unique)';
COMMENT ON COLUMN keywords.notes IS 'Keyword description/notes';

COMMENT ON TABLE test_case_keywords IS 'Many-to-many relationship between test cases and keywords';

COMMENT ON TABLE requirements IS 'Requirements for test case linking (TestLink compatible)';
COMMENT ON COLUMN requirements.doc_id IS 'Document ID for the requirement (TestLink doc_id)';
COMMENT ON COLUMN requirements.title IS 'Requirement title';
COMMENT ON COLUMN requirements.req_spec_title IS 'Requirement specification title (TestLink req_spec_title)';

COMMENT ON TABLE test_case_requirements IS 'Many-to-many relationship between test cases and requirements';

-- 8. Update existing data - ensure node_order has defaults where missing
UPDATE test_suites SET node_order = 0 WHERE node_order IS NULL;
UPDATE test_cases SET node_order = 0 WHERE node_order IS NULL;