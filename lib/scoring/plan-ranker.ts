import { ScoredPlan, UserPreferences } from '@/types';

/**
 * Filters and ranks plans based on user preferences and scores
 * @param scoredPlans Array of plans with their scores
 * @param preferences User preferences for filtering
 * @returns Top 3 scored plans that meet criteria
 */
export function filterAndRankPlans(
  scoredPlans: ScoredPlan[],
  preferences: UserPreferences
): ScoredPlan[] {
  // Apply hard constraints
  let filtered = applyConstraints(scoredPlans, preferences);

  // If we have fewer than 3 plans, relax constraints
  if (filtered.length < 3) {
    console.warn(`Only ${filtered.length} plans match strict criteria. Relaxing constraints.`);
    filtered = relaxConstraints(scoredPlans, preferences);
  }

  // Sort by final score (descending)
  const sorted = filtered.sort((a, b) => b.score.finalScore - a.score.finalScore);

  // Return top 3
  return sorted.slice(0, 3);
}

/**
 * Apply user-specified constraints
 */
function applyConstraints(
  scoredPlans: ScoredPlan[],
  preferences: UserPreferences
): ScoredPlan[] {
  return scoredPlans.filter(({ plan }) => {
    // Renewable percentage requirement
    if (plan.renewablePct < preferences.minRenewablePct) {
      return false;
    }

    // Contract length requirement (null = month-to-month is always acceptable)
    if (
      plan.contractLengthMonths !== null &&
      plan.contractLengthMonths > preferences.maxContractMonths
    ) {
      return false;
    }

    // Supplier rating requirement
    if (plan.supplierRating < preferences.minSupplierRating) {
      return false;
    }

    return true;
  });
}

/**
 * Relax constraints to ensure at least 3 recommendations
 */
function relaxConstraints(
  scoredPlans: ScoredPlan[],
  preferences: UserPreferences
): ScoredPlan[] {
  // Try relaxing renewable requirement first
  let filtered = scoredPlans.filter(({ plan }) => {
    if (
      plan.contractLengthMonths !== null &&
      plan.contractLengthMonths > preferences.maxContractMonths
    ) {
      return false;
    }
    if (plan.supplierRating < preferences.minSupplierRating) {
      return false;
    }
    return true;
  });

  if (filtered.length >= 3) {
    return filtered;
  }

  // Relax contract length too
  filtered = scoredPlans.filter(({ plan }) => {
    if (plan.supplierRating < preferences.minSupplierRating) {
      return false;
    }
    return true;
  });

  if (filtered.length >= 3) {
    return filtered;
  }

  // Last resort: only filter by rating, lower threshold
  filtered = scoredPlans.filter(({ plan }) => {
    return plan.supplierRating >= Math.max(3.0, preferences.minSupplierRating - 0.5);
  });

  if (filtered.length >= 3) {
    return filtered;
  }

  // If still not enough, return all plans sorted by score
  console.warn('Not enough plans even with relaxed constraints. Returning all available plans.');
  return scoredPlans;
}

