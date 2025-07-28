-- Migration: Add status column to projects table
-- Date: 2025-07-28
-- Description: Add status column to projects table to support project status management

-- Add status column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Add index on status column for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Update existing projects to have 'active' status if they don't have one
UPDATE projects SET status = 'active' WHERE status IS NULL; 