-- RunMilha Initial Schema

-- Plans table (seeded)
CREATE TABLE rm_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  conversion_rate NUMERIC(4,2) NOT NULL,
  monthly_cap INTEGER,
  stripe_price_id TEXT,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Extended user profile
CREATE TABLE rm_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  plan_id UUID REFERENCES rm_plans(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Strava OAuth connections
CREATE TABLE rm_strava_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES rm_users(id) ON DELETE CASCADE,
  strava_athlete_id BIGINT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  scope TEXT,
  connected_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Synced activities from Strava
CREATE TABLE rm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES rm_users(id) ON DELETE CASCADE,
  strava_activity_id BIGINT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  name TEXT,
  distance_meters NUMERIC(10,2) NOT NULL,
  distance_km NUMERIC(8,3) GENERATED ALWAYS AS (distance_meters / 1000.0) STORED,
  moving_time_seconds INTEGER,
  elapsed_time_seconds INTEGER,
  start_date TIMESTAMPTZ NOT NULL,
  milhas_earned NUMERIC(10,2),
  processed BOOLEAN DEFAULT false,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User wallet (one per user)
CREATE TABLE rm_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES rm_users(id) ON DELETE CASCADE,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_earned NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transaction ledger
CREATE TABLE rm_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES rm_users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES rm_wallets(id),
  type TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  balance_after NUMERIC(12,2) NOT NULL,
  description TEXT,
  reference_type TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Marketplace rewards
CREATE TABLE rm_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cost_milhas NUMERIC(10,2) NOT NULL,
  category TEXT,
  partner_name TEXT,
  promo_code_prefix TEXT,
  total_stock INTEGER,
  remaining_stock INTEGER,
  min_plan_slug TEXT,
  is_active BOOLEAN DEFAULT true,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User redemptions
CREATE TABLE rm_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES rm_users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rm_rewards(id),
  transaction_id UUID REFERENCES rm_transactions(id),
  promo_code TEXT,
  status TEXT DEFAULT 'active',
  redeemed_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_rm_activities_user ON rm_activities(user_id, start_date DESC);
CREATE INDEX idx_rm_activities_strava ON rm_activities(strava_activity_id);
CREATE INDEX idx_rm_transactions_user ON rm_transactions(user_id, created_at DESC);
CREATE INDEX idx_rm_redemptions_user ON rm_redemptions(user_id);
CREATE INDEX idx_rm_strava_athlete ON rm_strava_connections(strava_athlete_id);

-- RLS Policies
ALTER TABLE rm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rm_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE rm_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE rm_strava_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE rm_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rm_rewards ENABLE ROW LEVEL SECURITY;

-- Users can manage their own data
CREATE POLICY "users_own" ON rm_users FOR ALL USING (id = auth.uid());
CREATE POLICY "wallets_own" ON rm_wallets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "transactions_own" ON rm_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "activities_own" ON rm_activities FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "strava_own" ON rm_strava_connections FOR ALL USING (user_id = auth.uid());
CREATE POLICY "redemptions_own" ON rm_redemptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "rewards_public" ON rm_rewards FOR SELECT USING (is_active = true);

-- Function to auto-create user profile + wallet on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Get the free plan ID
  SELECT id INTO free_plan_id FROM rm_plans WHERE slug = 'free' LIMIT 1;

  -- Create user profile
  INSERT INTO rm_users (id, full_name, plan_id)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', free_plan_id);

  -- Create wallet
  INSERT INTO rm_wallets (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Seed plans
INSERT INTO rm_plans (slug, name, price_cents, conversion_rate, monthly_cap, features) VALUES
  ('free', 'Free', 0, 0.5, 100, '["Connect Strava account", "Earn up to 100 milhas/month", "1 km = 0.5 milha", "Access marketplace"]'),
  ('basico', 'Básico', 1990, 0.8, NULL, '["Everything in Free", "1 km = 0.8 milhas", "Unlimited milhas/month", "Priority rewards"]'),
  ('pro', 'Pro', 2990, 1.0, NULL, '["Everything in Básico", "1 km = 1 milha", "Exclusive rewards", "Early access to new partners"]'),
  ('elite', 'Elite', 6990, 1.5, NULL, '["Everything in Pro", "1 km = 1.5 milhas", "VIP rewards", "Race entry access", "Dedicated support"]');

-- Enable realtime for wallet updates
ALTER PUBLICATION supabase_realtime ADD TABLE rm_wallets;
