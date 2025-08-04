-- Migration 006: Remove app_settings table (no longer needed after removing LLM functionality)
-- Created: 2025-08-04

-- Drop the app_settings table and its index
DROP INDEX IF EXISTS idx_app_settings_key;
DROP TABLE IF EXISTS app_settings;