-- Migration: Add Activity Tracking System
-- Date: 2024-12-XX
-- Description: Add activity tracking for user actions across the system

-- 1. Create Activity Table
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

-- 2. Create Activity Types Table for better organization
CREATE TABLE IF NOT EXISTS activity_types (
    id SERIAL PRIMARY KEY,
    type_code VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100), -- Icon name for UI display
    color VARCHAR(50), -- Color for UI display
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Insert default activity types
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
('report_export', 'Report Exported', 'A report was exported', 'Download', 'apple-blue');

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_action_type ON activities(action_type);
CREATE INDEX IF NOT EXISTS idx_activities_entity_type ON activities(entity_type);
CREATE INDEX IF NOT EXISTS idx_activities_entity_id ON activities(entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_action ON activities(user_id, action_type);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);

-- 5. Add comments for documentation
COMMENT ON TABLE activities IS 'System activity log for tracking user actions and system events';
COMMENT ON COLUMN activities.action_type IS 'Type of action performed (create, update, delete, etc.)';
COMMENT ON COLUMN activities.entity_type IS 'Type of entity affected (project, test_case, etc.)';
COMMENT ON COLUMN activities.entity_id IS 'ID of the affected entity';
COMMENT ON COLUMN activities.entity_name IS 'Name/title of the affected entity for display';
COMMENT ON COLUMN activities.description IS 'Human-readable description of the action';
COMMENT ON COLUMN activities.metadata IS 'Additional JSON data about the action';

COMMENT ON TABLE activity_types IS 'Predefined activity types for consistent categorization';
COMMENT ON COLUMN activity_types.type_code IS 'Unique code for the activity type';
COMMENT ON COLUMN activity_types.display_name IS 'Human-readable name for UI display';
COMMENT ON COLUMN activity_types.icon IS 'Icon name for UI display';
COMMENT ON COLUMN activity_types.color IS 'Color for UI display';

-- 6. Create a function to log activities
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

-- 7. Create a function to get recent activities
CREATE OR REPLACE FUNCTION get_recent_activities(
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    id INTEGER,
    user_id VARCHAR(255),
    action_type VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id INTEGER,
    entity_name VARCHAR(255),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP,
    display_name VARCHAR(255),
    icon VARCHAR(100),
    color VARCHAR(50)
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
        a.created_at,
        at.display_name,
        at.icon,
        at.color
    FROM activities a
    LEFT JOIN activity_types at ON a.action_type = at.type_code
    ORDER BY a.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql; 