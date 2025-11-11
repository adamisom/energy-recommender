import { generateExplanation } from './explanations';
import { ScoredPlan, UsageAnalysis, UserPreferences } from '@/types';

/**
 * Generate explanations for top 3 plans in parallel
 * @param topPlans Array of top 3 scored plans
 * @param usageAnalysis User's usage analysis
 * @param preferences User preferences
 * @param currentPlanCost Optional current plan cost for savings calculation
 * @returns Array of 3 explanations
 */
export async function generateAllExplanations(
  topPlans: ScoredPlan[],
  usageAnalysis: UsageAnalysis,
  preferences: UserPreferences,
  currentPlanCost?: number
): Promise<string[]> {
  // Generate all explanations in parallel
  const explanationPromises = topPlans.map((scoredPlan, index) => {
    return generateExplanation({
      plan: scoredPlan.plan,
      rank: index + 1,
      usageAnalysis,
      cost: scoredPlan.cost,
      preferences,
      currentPlanCost,
    });
  });

  // Wait for all to complete
  const explanations = await Promise.all(explanationPromises);

  return explanations;
}

