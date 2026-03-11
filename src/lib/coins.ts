import { SUPPORTED_ACTIVITY_TYPES } from "./constants";

interface ConversionInput {
  distanceKm: number;
  activityType: string;
  conversionRate: number;
  monthlyCap: number | null;
  currentMonthlyEarned: number;
}

interface ConversionResult {
  milhasEarned: number;
  cappedAt: number | null;
  wasLimited: boolean;
}

export function calculateMilhas(input: ConversionInput): ConversionResult {
  const { distanceKm, activityType, conversionRate, monthlyCap, currentMonthlyEarned } = input;

  // Only supported activity types earn milhas
  if (!SUPPORTED_ACTIVITY_TYPES.includes(activityType as typeof SUPPORTED_ACTIVITY_TYPES[number])) {
    return { milhasEarned: 0, cappedAt: null, wasLimited: false };
  }

  let milhas = distanceKm * conversionRate;

  // Apply monthly cap for free tier
  if (monthlyCap !== null) {
    const remaining = Math.max(0, monthlyCap - currentMonthlyEarned);
    if (milhas > remaining) {
      return {
        milhasEarned: Math.round(remaining * 100) / 100,
        cappedAt: monthlyCap,
        wasLimited: true,
      };
    }
  }

  return {
    milhasEarned: Math.round(milhas * 100) / 100,
    cappedAt: monthlyCap,
    wasLimited: false,
  };
}
