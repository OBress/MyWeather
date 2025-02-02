-- Add locations JSON array column and API key column to user_settings
ALTER TABLE user_settings 
ADD COLUMN locations JSONB DEFAULT '[]'::jsonb,
ADD COLUMN openai_api_key TEXT; 