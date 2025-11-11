import { Plan, CostBreakdown, ScoreBreakdown, UserPreferences, UsagePattern } from '@/types';
import { config } from '@/lib/config';

/**
 * Scores a plan based on user preferences and usage patterns
 * @param plan The energy plan to score
 * @param cost The cost breakdown for this plan
 * @param allCosts All cost breakdowns for normalization
 * @param preferences User preferences
 * @param usagePattern User's usage pattern
 * @returns ScoreBreakdown with individual and final scores
 */
export function scorePlan(
  plan: Plan,
  cost: CostBreakdown,
  allCosts: CostBreakdown[],
  preferences: UserPreferences,
  usagePattern: UsagePattern
): ScoreBreakdown {
  // Calculate individual scores (0-100)
  const costScore = calculateCostScore(cost, allCosts);
  const flexibilityScore = calculateFlexibilityScore(plan);
  const renewableScore = calculateRenewableScore(plan);
  const ratingScore = calculateRatingScore(plan);
  const seasonalScore = calculateSeasonalScore(plan, usagePattern);

  // Get weights based on user priority
  const weights = getWeights(preferences.priority);

  // Calculate weighted final score
  const finalScore = 
    costScore * weights.cost +
    flexibilityScore * weights.flexibility +
    renewableScore * weights.renewable +
    ratingScore * weights.rating +
    seasonalScore * weights.seasonal;

  return {
    costScore,
    flexibilityScore,
    renewableScore,
    ratingScore,
    seasonalScore,
    finalScore,
  };
}

/**
 * Calculate cost score (0-100, higher is better/cheaper)
 */
function calculateCostScore(cost: CostBreakdown, allCosts: CostBreakdown[]): number {
  const allFirstYearCosts = allCosts.map(c => c.firstYearTotal);
  const minCost = Math.min(...allFirstYearCosts);
  const maxCost = Math.max(...allFirstYearCosts);

  // Prevent division by zero if all plans have same cost
  if (maxCost === minCost) {
    return 50; // Neutral score if all costs are equal
  }

  // Normalize: cheapest plan gets 100, most expensive gets 0
  const normalized = 100 * (1 - (cost.firstYearTotal - minCost) / (maxCost - minCost));
  
  return Math.max(0, Math.min(100, normalized));
}

/**
 * Calculate flexibility score based on contract length (0-100)
 */
function calculateFlexibilityScore(plan: Plan): number {
  if (plan.contractLengthMonths === null) {
    return 100; // Month-to-month is most flexible
  }

  if (plan.contractLengthMonths <= 6) {
    return 70;
  } else if (plan.contractLengthMonths <= 12) {
    return 50;
  } else if (plan.contractLengthMonths <= 24) {
    return 30;
  } else {
    return 10;
  }
}

/**
 * Calculate renewable energy score (0-100)
 */
function calculateRenewableScore(plan: Plan): number {
  // Direct mapping: renewable percentage is the score
  return plan.renewablePct;
}

/**
 * Calculate supplier rating score (0-100)
 */
function calculateRatingScore(plan: Plan): number {
  // Normalize 1.0-5.0 rating to 0-100 scale
  return (plan.supplierRating / 5.0) * 100;
}

/**
 * Calculate seasonal fit score based on rate type and usage pattern (0-100)
 */
function calculateSeasonalScore(plan: Plan, usagePattern: UsagePattern): number {
  // Feature flag check
  const seasonalScoringEnabled = config.features.seasonalScoring();
  
  if (!seasonalScoringEnabled) {
    return 50; // Neutral score when disabled
  }

  // TOU plans work well for predictable peak patterns
  if (plan.rateType === 'tou') {
    if (usagePattern === 'summer_peak') {
      return 75; // Good fit if can shift usage to off-peak
    } else if (usagePattern === 'winter_peak') {
      return 40; // Less beneficial
    } else if (usagePattern === 'flat') {
      return 60; // Moderate benefit
    } else {
      return 50; // Variable pattern
    }
  }

  // Fixed rate plans are stable regardless of pattern
  if (plan.rateType === 'fixed') {
    return 60; // Consistently good
  }

  // Variable rate plans have more risk with high usage
  if (plan.rateType === 'variable') {
    if (usagePattern === 'summer_peak' || usagePattern === 'winter_peak') {
      return 40; // Higher risk during peak months
    } else {
      return 55; // More stable with flat usage
    }
  }

  return 50; // Default neutral
}

/**
 * Get scoring weights based on user priority
 */
function getWeights(priority: string) {
  switch (priority) {
    case 'cost':
      return {
        cost: 0.60,
        flexibility: 0.10,
        renewable: 0.10,
        rating: 0.10,
        seasonal: 0.10,
      };
    
    case 'renewable':
      return {
        cost: 0.30,
        flexibility: 0.10,
        renewable: 0.50,
        rating: 0.05,
        seasonal: 0.05,
      };
    
    case 'flexibility':
      return {
        cost: 0.25,
        flexibility: 0.50,
        renewable: 0.10,
        rating: 0.10,
        seasonal: 0.05,
      };
    
    case 'balanced':
    default:
      return {
        cost: 0.35,
        flexibility: 0.20,
        renewable: 0.25,
        rating: 0.15,
        seasonal: 0.05,
      };
  }
}

