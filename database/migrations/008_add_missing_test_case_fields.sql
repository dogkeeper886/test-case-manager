-- Migration: Add missing test_steps and expected_result columns to test_cases table
-- Date: 2025-08-05
-- Description: Add missing columns that the API expects for test case creation

-- Add missing columns to test_cases table
ALTER TABLE test_cases 
ADD COLUMN IF NOT EXISTS test_steps TEXT,
ADD COLUMN IF NOT EXISTS expected_result TEXT;

-- Add comments for documentation
COMMENT ON COLUMN test_cases.test_steps IS 'Step-by-step instructions for executing the test case';
COMMENT ON COLUMN test_cases.expected_result IS 'Expected outcome/result of the test case execution';