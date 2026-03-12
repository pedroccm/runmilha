-- Migration: Add Garmin and Polar integrations + multi-provider support

-- Add provider columns to activities
ALTER TABLE rm_activities ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'strava';
ALTER TABLE rm_activities ADD COLUMN IF NOT EXISTS provider_activity_id TEXT;

-- Backfill provider_activity_id from strava_activity_id
UPDATE rm_activities SET provider_activity_id = strava_activity_id::TEXT WHERE provider_activity_id IS NULL;

-- Make strava_activity_id nullable (new providers won't have it)
ALTER TABLE rm_activities ALTER COLUMN strava_activity_id DROP NOT NULL;

-- Unique constraint: one activity per provider per external ID
CREATE UNIQUE INDEX IF NOT EXISTS idx_rm_activities_provider ON rm_activities(provider, provider_activity_id);

-- Index for provider-based queries
CREATE INDEX IF NOT EXISTS idx_rm_activities_provider_user ON rm_activities(user_id, provider, start_date DESC);

-- Garmin OAuth connections
CREATE TABLE IF NOT EXISTS rm_garmin_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES rm_users(id) ON DELETE CASCADE,
  garmin_user_id TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  scope TEXT,
  connected_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Polar OAuth connections
CREATE TABLE IF NOT EXISTS rm_polar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES rm_users(id) ON DELETE CASCADE,
  polar_user_id TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at BIGINT,
  scope TEXT,
  connected_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rm_garmin_user ON rm_garmin_connections(garmin_user_id);
CREATE INDEX IF NOT EXISTS idx_rm_polar_user ON rm_polar_connections(polar_user_id);

-- RLS
ALTER TABLE rm_garmin_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE rm_polar_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "garmin_own" ON rm_garmin_connections FOR ALL USING (user_id = auth.uid());
CREATE POLICY "polar_own" ON rm_polar_connections FOR ALL USING (user_id = auth.uid());

-- Update plan features to mention all providers
UPDATE rm_plans SET features = '["Connect Strava, Garmin or Polar", "Earn up to 100 milhas/month", "1 km = 0.5 milha", "Access marketplace"]' WHERE slug = 'free';
UPDATE rm_plans SET features = '["Everything in Free", "1 km = 0.8 milhas", "Unlimited milhas/month", "Priority rewards"]' WHERE slug = 'basico';
