export interface Plan {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  conversion_rate: number;
  monthly_cap: number | null;
  stripe_price_id: string | null;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface User {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  plan_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: "active" | "canceled" | "past_due" | "inactive";
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  plan?: Plan;
  wallet?: Wallet;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  updated_at: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cost_milhas: number;
  category: string | null;
  partner_name: string | null;
  promo_code_prefix: string | null;
  total_stock: number | null;
  remaining_stock: number | null;
  min_plan_slug: string | null;
  is_active: boolean;
  valid_until: string | null;
  created_at: string;
}

export interface Redemption {
  id: string;
  user_id: string;
  reward_id: string;
  transaction_id: string | null;
  promo_code: string | null;
  status: "active" | "used" | "expired" | "refunded";
  redeemed_at: string;
  used_at: string | null;
  expires_at: string | null;
  reward?: Reward;
  user?: User;
}
