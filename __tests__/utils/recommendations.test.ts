import { searchRecommendations, filterViewedPlans } from '@/lib/utils/recommendations';
import { PlanRecommendation, Plan } from '@/types';

// Helper to create a mock plan
function createMockPlan(overrides: Partial<Plan> = {}): Plan {
  return {
    id: 'plan-1',
    planId: 'TX-001',
    state: 'TX',
    supplierName: 'Test Supplier',
    planName: 'Test Plan',
    rateType: 'fixed',
    ratePerKwh: 0.10,
    monthlyFee: 0,
    contractLengthMonths: 12,
    earlyTerminationFee: 0,
    renewablePct: 50,
    supplierRating: 4.0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// Helper to create a mock recommendation
function createMockRecommendation(overrides: Partial<PlanRecommendation> = {}): PlanRecommendation {
  return {
    rank: 1,
    plan: createMockPlan(),
    projectedAnnualCost: 1000,
    annualSavings: 0,
    explanation: 'Test explanation',
    score: 80,
    breakdown: {
      costScore: 20,
      flexibilityScore: 20,
      renewableScore: 20,
      ratingScore: 20,
      seasonalScore: 0,
      finalScore: 80,
    },
    ...overrides,
  };
}

describe('Recommendation Utilities', () => {
  describe('searchRecommendations', () => {
    const recommendations: PlanRecommendation[] = [
      createMockRecommendation({
        plan: createMockPlan({ planName: 'Green Energy Plan', supplierName: 'EcoPower' }),
      }),
      createMockRecommendation({
        plan: createMockPlan({ planName: 'Budget Saver', supplierName: 'CheapEnergy' }),
      }),
      createMockRecommendation({
        plan: createMockPlan({ planName: 'Premium Plan', supplierName: 'GreenEnergy Co' }),
      }),
    ];

    test('should return all recommendations when search query is empty', () => {
      const results = searchRecommendations(recommendations, '');
      expect(results.length).toBe(3);
    });

    test('should return all recommendations when search query is only whitespace', () => {
      const results = searchRecommendations(recommendations, '   ');
      expect(results.length).toBe(3);
    });

    test('should search by plan name (case insensitive)', () => {
      const results = searchRecommendations(recommendations, 'green energy');
      expect(results.length).toBe(1);
      expect(results[0].plan.planName).toBe('Green Energy Plan');
    });

    test('should search by supplier name (case insensitive)', () => {
      const results = searchRecommendations(recommendations, 'ecopower');
      expect(results.length).toBe(1);
      expect(results[0].plan.supplierName).toBe('EcoPower');
    });

    test('should find partial matches', () => {
      const results = searchRecommendations(recommendations, 'budget');
      expect(results.length).toBe(1);
      expect(results[0].plan.planName).toBe('Budget Saver');
    });

    test('should find multiple matches', () => {
      const results = searchRecommendations(recommendations, 'energy');
      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results.some(r => r.plan.planName === 'Green Energy Plan')).toBe(true);
      expect(results.some(r => r.plan.supplierName === 'GreenEnergy Co')).toBe(true);
    });

    test('should return empty array when no matches', () => {
      const results = searchRecommendations(recommendations, 'nonexistent');
      expect(results.length).toBe(0);
    });
  });

  describe('filterViewedPlans', () => {
    const recommendations: PlanRecommendation[] = [
      createMockRecommendation({ plan: createMockPlan({ id: 'plan-1' }) }),
      createMockRecommendation({ plan: createMockPlan({ id: 'plan-2' }) }),
      createMockRecommendation({ plan: createMockPlan({ id: 'plan-3' }) }),
    ];

    test('should return all recommendations when hideViewed is false', () => {
      const viewedIds = ['plan-1'];
      const results = filterViewedPlans(recommendations, viewedIds, false);
      expect(results.length).toBe(3);
    });

    test('should return all recommendations when hideViewed is true but no viewed plans', () => {
      const viewedIds: string[] = [];
      const results = filterViewedPlans(recommendations, viewedIds, true);
      expect(results.length).toBe(3);
    });

    test('should filter out viewed plans when hideViewed is true', () => {
      const viewedIds = ['plan-1', 'plan-3'];
      const results = filterViewedPlans(recommendations, viewedIds, true);
      expect(results.length).toBe(1);
      expect(results[0].plan.id).toBe('plan-2');
    });

    test('should return empty array when all plans are viewed', () => {
      const viewedIds = ['plan-1', 'plan-2', 'plan-3'];
      const results = filterViewedPlans(recommendations, viewedIds, true);
      expect(results.length).toBe(0);
    });
  });
});

