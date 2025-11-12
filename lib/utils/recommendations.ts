import { PlanRecommendation } from '@/types';

export function searchRecommendations(
  recommendations: PlanRecommendation[],
  searchQuery: string
): PlanRecommendation[] {
  if (!searchQuery.trim()) {
    return recommendations;
  }

  const query = searchQuery.toLowerCase().trim();
  return recommendations.filter(rec => {
    const planName = rec.plan.planName.toLowerCase();
    const supplierName = rec.plan.supplierName.toLowerCase();
    return planName.includes(query) || supplierName.includes(query);
  });
}

export function filterViewedPlans(
  recommendations: PlanRecommendation[],
  viewedPlanIds: string[],
  hideViewed: boolean
): PlanRecommendation[] {
  if (!hideViewed) {
    return recommendations;
  }
  return recommendations.filter(rec => !viewedPlanIds.includes(rec.plan.id));
}

