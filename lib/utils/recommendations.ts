import { PlanRecommendation } from '@/types';

export type SortOption = 
  | 'original-rank'
  | 'cost-asc'
  | 'cost-desc'
  | 'renewable-desc'
  | 'rating-desc'
  | 'contract-asc'
  | 'supplier-asc';

export function sortRecommendations(
  recommendations: PlanRecommendation[],
  sortBy: SortOption
): PlanRecommendation[] {
  const sorted = [...recommendations];

  switch (sortBy) {
    case 'original-rank':
      return sorted.sort((a, b) => a.rank - b.rank);

    case 'cost-asc':
      return sorted.sort((a, b) => a.projectedAnnualCost - b.projectedAnnualCost);

    case 'cost-desc':
      return sorted.sort((a, b) => b.projectedAnnualCost - a.projectedAnnualCost);

    case 'renewable-desc':
      return sorted.sort((a, b) => b.plan.renewablePct - a.plan.renewablePct);

    case 'rating-desc':
      return sorted.sort((a, b) => b.plan.supplierRating - a.plan.supplierRating);

    case 'contract-asc':
      return sorted.sort((a, b) => {
        const aContract = a.plan.contractLengthMonths ?? 999; // null = month-to-month (most flexible)
        const bContract = b.plan.contractLengthMonths ?? 999;
        return aContract - bContract;
      });

    case 'supplier-asc':
      return sorted.sort((a, b) => 
        a.plan.supplierName.localeCompare(b.plan.supplierName)
      );

    default:
      return sorted;
  }
}

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

