-- Migration: Fix Version Field Type Mismatch
-- Date: 2025-08-06
-- Description: Fix version column type from integer to VARCHAR(20) to match TestLink requirements

-- 1. Fix version column type mismatch
ALTER TABLE test_cases 
ALTER COLUMN version TYPE VARCHAR(20) USING version::text;

-- 2. Update default value to match TestLink format
ALTER TABLE test_cases 
ALTER COLUMN version SET DEFAULT '1.0';

-- 3. Add comment for documentation
COMMENT ON COLUMN test_cases.version IS 'Test case version in TestLink format (e.g., 1.0, 2.1)';