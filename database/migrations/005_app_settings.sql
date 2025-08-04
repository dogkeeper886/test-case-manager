-- Migration 005: Create app_settings table for application configuration
-- Created: 2025-08-04

CREATE TABLE IF NOT EXISTS app_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  is_encrypted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);

-- Insert default LLM settings
INSERT INTO app_settings (setting_key, setting_value, is_encrypted) VALUES
  ('llm_provider', 'openai', false),
  ('llm_model', 'gpt-4.1', false),
  ('llm_temperature', '0.1', false),
  ('llm_maxTokens', '16000', false),
  ('llm_enabled', 'false', false)
ON CONFLICT (setting_key) DO NOTHING;