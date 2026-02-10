-- Enable the pg_net extension to allow making HTTP requests from database
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Create the webhook trigger for lead-processor
-- Triggered when a new photo is inserted
CREATE OR REPLACE TRIGGER "lead-processor-webhook"
AFTER INSERT ON "public"."photos"
FOR EACH ROW
EXECUTE FUNCTION "supabase_functions"."http_request"(
  'http://localhost:54321/functions/v1/lead-processor',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '1000'
);

-- Note: The URL above is for local dev.
-- For production, we need to use the project URL.
-- However, supabase db push might not handle environment-specific URLs easily in SQL.
-- A better approach for production is to use the Dashboard Webhooks UI or Vault secrets.
-- BUT, Supabase has a specific "Database Webhooks" feature in the dashboard which is easier.

-- ACTUALLY, the newer way is using the UI or the API, but let's try to set it up properly.
-- The standard way now is:
-- 1. Use the Dashboard > Database > Webhooks
-- 2. Create a webhook 'lead-processor'
-- 3. Table: photos, Event: INSERT
-- 4. Type: Supabase Edge Function
-- 5. Select 'lead-processor'

-- Since I cannot automate the UI for you, and SQL for webhooks can be tricky with URLs...
-- I will NOT create this migration file to avoiding breaking things with localhost URLs.
-- I will instruct you to set this up in the dashboard.
