-- Migration: Add retry window fields to import_logs table
-- This enables temporary file retention for retry functionality

-- Add retry window fields to import_logs table
ALTER TABLE import_logs 
ADD COLUMN IF NOT EXISTS file_path VARCHAR(500), -- Path to uploaded file
ADD COLUMN IF NOT EXISTS retry_until TIMESTAMP NULL, -- Until when retry is allowed
ADD COLUMN IF NOT EXISTS cleanup_scheduled BOOLEAN DEFAULT FALSE; -- Whether cleanup is scheduled

-- Add index for retry window cleanup
CREATE INDEX IF NOT EXISTS idx_import_logs_retry_until ON import_logs(retry_until);
CREATE INDEX IF NOT EXISTS idx_import_logs_cleanup_scheduled ON import_logs(cleanup_scheduled);

-- Add comments for documentation
COMMENT ON COLUMN import_logs.file_path IS 'Path to uploaded file for retry functionality';
COMMENT ON COLUMN import_logs.retry_until IS 'Timestamp until when retry is allowed (48 hours from import)';
COMMENT ON COLUMN import_logs.cleanup_scheduled IS 'Whether file cleanup has been scheduled'; 