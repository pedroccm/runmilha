export const PLANS = {
  free: {
    slug: "free",
    name: "Free",
    priceCents: 0,
    conversionRate: 0.5,
    monthlyCap: 100,
    features: [
      "Connect Strava account",
      "Earn up to 100 milhas/month",
      "1 km = 0.5 milha",
      "Access marketplace",
    ],
  },
  basico: {
    slug: "basico",
    name: "Básico",
    priceCents: 1990,
    conversionRate: 0.8,
    monthlyCap: null,
    features: [
      "Everything in Free",
      "1 km = 0.8 milhas",
      "Unlimited milhas/month",
      "Priority rewards",
    ],
  },
  pro: {
    slug: "pro",
    name: "Pro",
    priceCents: 2990,
    conversionRate: 1.0,
    monthlyCap: null,
    popular: true,
    features: [
      "Everything in Básico",
      "1 km = 1 milha",
      "Exclusive rewards",
      "Early access to new partners",
    ],
  },
  elite: {
    slug: "elite",
    name: "Elite",
    priceCents: 6990,
    conversionRate: 1.5,
    monthlyCap: null,
    features: [
      "Everything in Pro",
      "1 km = 1.5 milhas",
      "VIP rewards",
      "Race entry access",
      "Dedicated support",
    ],
  },
} as const;

export type PlanSlug = keyof typeof PLANS;

export const SUPPORTED_ACTIVITY_TYPES = ["Run", "Ride", "VirtualRun", "VirtualRide"] as const;

export const STRAVA_OAUTH_URL = "https://www.strava.com/oauth/authorize";
export const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
export const STRAVA_API_BASE = "https://www.strava.com/api/v3";
