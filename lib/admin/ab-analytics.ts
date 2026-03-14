/**
 * A/B Test Analytics utilities for admin dashboard.
 * Provides functions to calculate conversion rates and statistical significance.
 */

import { type Variant } from "@/lib/ab-testing";

export type ABTestEventData = {
  variant: Variant;
  event: "paywall_view" | "paywall_start_checkout" | "paywall_complete";
  timestamp: number;
  userId: string;
};

export type ConversionData = {
  variant: Variant;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  clickRate: number;
  conversionRate: number;
};

export type ABTestResult = {
  variants: ConversionData[];
  winner: Variant | null;
  isSignificant: boolean;
  pValue: number;
  sampleSize: number;
};

/**
 * Calculate conversion data from raw events.
 */
export function calculateConversionData(events: ABTestEventData[]): ConversionData[] {
  const variants: Variant[] = ["a", "b", "c"];

  return variants.map((variant) => {
    const variantEvents = events.filter((e) => e.variant === variant);
    const impressions = variantEvents.filter((e) => e.event === "paywall_view").length;
    const clicks = variantEvents.filter((e) => e.event === "paywall_start_checkout").length;
    const conversions = variantEvents.filter((e) => e.event === "paywall_complete").length;

    return {
      variant,
      impressions,
      clicks,
      conversions,
      revenue: conversions * 9.99, // Assuming $9.99 subscription
      clickRate: impressions > 0 ? clicks / impressions : 0,
      conversionRate: clicks > 0 ? conversions / clicks : 0,
    };
  });
}

/**
 * Calculate Z-score for two proportions.
 * Used for A/B test statistical significance.
 */
function calculateZScore(
  controlSuccesses: number,
  controlTotal: number,
  variantSuccesses: number,
  variantTotal: number,
): number {
  const p1 = controlSuccesses / controlTotal;
  const p2 = variantSuccesses / variantTotal;
  const p = (controlSuccesses + variantSuccesses) / (controlTotal + variantTotal);
  const se = Math.sqrt(p * (1 - p) * (1 / controlTotal + 1 / variantTotal));

  if (se === 0) return 0;
  return (p2 - p1) / se;
}

/**
 * Calculate p-value from Z-score (two-tailed test).
 */
function calculatePValue(zScore: number): number {
  // Approximation of the standard normal CDF
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const x = Math.abs(zScore) / Math.sqrt(2);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 2 * (1 - 0.5 * (1 + (zScore < 0 ? -y : y)));
}

/**
 * Determine if result is statistically significant (p < 0.05).
 */
export function isStatisticallySignificant(pValue: number): boolean {
  return pValue < 0.05;
}

/**
 * Analyze A/B test results and determine winner.
 */
export function analyzeABTest(data: ConversionData[]): ABTestResult {
  const control = data.find((d) => d.variant === "a");
  if (!control || control.impressions === 0) {
    return {
      variants: data,
      winner: null,
      isSignificant: false,
      pValue: 1,
      sampleSize: data.reduce((sum, d) => sum + d.impressions, 0),
    };
  }

  // Find best performing variant by conversion rate
  const bestVariant = data.reduce((best, current) =>
    current.conversionRate > best.conversionRate ? current : best,
  );

  if (bestVariant.variant === "a") {
    return {
      variants: data,
      winner: null,
      isSignificant: false,
      pValue: 1,
      sampleSize: data.reduce((sum, d) => sum + d.impressions, 0),
    };
  }

  // Calculate statistical significance
  const zScore = calculateZScore(
    control.conversions,
    control.clicks,
    bestVariant.conversions,
    bestVariant.clicks,
  );
  const pValue = calculatePValue(zScore);
  const significant = isStatisticallySignificant(pValue);

  return {
    variants: data,
    winner: significant ? bestVariant.variant : null,
    isSignificant: significant,
    pValue,
    sampleSize: data.reduce((sum, d) => sum + d.impressions, 0),
  };
}

/**
 * Format percentage for display.
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Format currency for display.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
