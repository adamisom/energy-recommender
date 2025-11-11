import { filterAndRankPlans } from '@/lib/scoring/plan-ranker';
import { ScoredPlan, Plan, UserPreferences } from '@/types';

const createMockScoredPlan = (
  overrides: Partial<Plan> = {},
  finalScore: number = 50
): ScoredPlan => ({
  plan: {
    id: 'test-' + Math.random(),
    planId: 'TX-TEST-' + Math.random(),
    state: 'TX',
    supplierName: 'Test Energy',
    planName: 'Test Plan',
    rateType: 'fixed',
    ratePerKwh: 0.10,
    monthlyFee: 10.0,
    contractLengthMonths: 12,
    earlyTerminationFee: 150,
    renewablePct: 0,
    supplierRating: 4.0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  },
  cost: {
    energyCharges: 1200,
    monthlyFees: 120,
    firstYearTotal: 1320,
    switchingCost: 0,
  },
  score: {
    costScore: 50,
    flexibilityScore: 50,
    renewableScore: 50,
    ratingScore: 80,
    seasonalScore: 50,
    finalScore,
  },
});

describe('filterAndRankPlans', () => {
  test('should return top 3 plans sorted by score', () => {
    const scoredPlans = [
      createMockScoredPlan({}, 85),
      createMockScoredPlan({}, 70),
      createMockScoredPlan({}, 90),
      createMockScoredPlan({}, 60),
      createMockScoredPlan({}, 75),
    ];

    const preferences: UserPreferences = {
      priority: 'balanced',
      minRenewablePct: 0,
      maxContractMonths: 24,
      minSupplierRating: 3.0,
    };

    const result = filterAndRankPlans(scoredPlans, preferences);

    expect(result).toHaveLength(3);
    expect(result[0].score.finalScore).toBe(90); // Highest
    expect(result[1].score.finalScore).toBe(85);
    expect(result[2].score.finalScore).toBe(75);
  });

  test('should filter by renewable percentage', () => {
    const scoredPlans = [
      createMockScoredPlan({ renewablePct: 100, supplierRating: 4.0 }, 85),
      createMockScoredPlan({ renewablePct: 80, supplierRating: 4.0 }, 80),
      createMockScoredPlan({ renewablePct: 75, supplierRating: 4.0 }, 75),
      createMockScoredPlan({ renewablePct: 0, supplierRating: 4.0 }, 90), // High score but 0% renewable
    ];

    const preferences: UserPreferences = {
      priority: 'renewable',
      minRenewablePct: 75, // Require at least 75%
      maxContractMonths: 24,
      minSupplierRating: 3.0,
    };

    const result = filterAndRankPlans(scoredPlans, preferences);

    // Should have 3 plans that meet criteria (no relaxation needed)
    expect(result).toHaveLength(3);
    expect(result.every(p => p.plan.renewablePct >= 75)).toBe(true);
  });

  test('should filter by contract length', () => {
    const scoredPlans = [
      createMockScoredPlan({ contractLengthMonths: 6, supplierRating: 4.0 }, 85),
      createMockScoredPlan({ contractLengthMonths: 12, supplierRating: 4.0 }, 80),
      createMockScoredPlan({ contractLengthMonths: null, supplierRating: 4.0 }, 75), // Month-to-month
      createMockScoredPlan({ contractLengthMonths: 36, supplierRating: 4.0 }, 90), // Too long
    ];

    const preferences: UserPreferences = {
      priority: 'flexibility',
      minRenewablePct: 0,
      maxContractMonths: 12,
      minSupplierRating: 3.0,
    };

    const result = filterAndRankPlans(scoredPlans, preferences);

    // Should have 3 plans (6, 12, and month-to-month)
    expect(result).toHaveLength(3);
    expect(result.every(p => 
      p.plan.contractLengthMonths === null || 
      p.plan.contractLengthMonths <= 12
    )).toBe(true);
  });

  test('should filter by supplier rating', () => {
    const scoredPlans = [
      createMockScoredPlan({ supplierRating: 4.5 }, 85),
      createMockScoredPlan({ supplierRating: 4.0 }, 82),
      createMockScoredPlan({ supplierRating: 3.5 }, 80),
      createMockScoredPlan({ supplierRating: 2.5 }, 90), // Too low rating
    ];

    const preferences: UserPreferences = {
      priority: 'balanced',
      minRenewablePct: 0,
      maxContractMonths: 24,
      minSupplierRating: 3.5,
    };

    const result = filterAndRankPlans(scoredPlans, preferences);

    // Should have 3 plans that meet rating requirement
    expect(result).toHaveLength(3);
    expect(result.every(p => p.plan.supplierRating >= 3.5)).toBe(true);
  });

  test('should relax constraints if fewer than 3 plans', () => {
    const scoredPlans = [
      createMockScoredPlan({ renewablePct: 0, supplierRating: 4.5 }, 85),
      createMockScoredPlan({ renewablePct: 10, supplierRating: 4.0 }, 80),
    ];

    const strictPreferences: UserPreferences = {
      priority: 'renewable',
      minRenewablePct: 100, // Very strict
      maxContractMonths: 12,
      minSupplierRating: 4.0,
    };

    const result = filterAndRankPlans(scoredPlans, strictPreferences);

    // Should relax constraints and return plans anyway
    expect(result.length).toBeGreaterThan(0);
  });

  test('should handle month-to-month plans in contract filter', () => {
    const monthToMonthPlan = createMockScoredPlan({ contractLengthMonths: null }, 85);

    const preferences: UserPreferences = {
      priority: 'flexibility',
      minRenewablePct: 0,
      maxContractMonths: 6,
      minSupplierRating: 3.0,
    };

    const result = filterAndRankPlans([monthToMonthPlan], preferences);

    // Month-to-month should always pass contract filter
    expect(result).toHaveLength(1);
  });
});

