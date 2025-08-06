-- Migration: Add project_id column to test_cases table
-- Date: 2025-08-05
-- Description: Add missing project_id column to test_cases table to match API expectations

-- Add project_id column to test_cases table
ALTER TABLE test_cases 
ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE;

-- Update existing test cases to get project_id from their test_suite
UPDATE test_cases 
SET project_id = ts.project_id 
FROM test_suites ts 
WHERE test_cases.test_suite_id = ts.id 
AND test_cases.project_id IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_test_cases_project_id ON test_cases(project_id);

-- Add comment for documentation
COMMENT ON COLUMN test_cases.project_id IS 'Reference to the project this test case belongs to';