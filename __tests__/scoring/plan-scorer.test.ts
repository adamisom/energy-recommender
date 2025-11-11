import { scorePlan } from '@/lib/scoring/plan-scorer';
import { Plan, CostBreakdown, UserPreferences } from '@/types';

const mockPlan: Plan = {
  id: 'test-1',
  planId: 'TX-TEST-001',
  state: 'TX',
  supplierName: 'Test Energy',
  planName: 'Test Plan',
  rateType: 'fixed',
  ratePerKwh: 0.10,
  monthlyFee: 10.0,
  contractLengthMonths: 12,
  earlyTerminationFee: 150,
  renewablePct: 50,
  supplierRating: 4.0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCost: CostBreakdown = {
  energyCharges: 1200,
  monthlyFees: 120,
  firstYearTotal: 1320,
  switchingCost: 0,
};

const allCosts: CostBreakdown[] = [
  { energyCharges: 1000, monthlyFees: 120, firstYearTotal: 1120, switchingCost: 0 }, // Cheapest
  mockCost, // Middle
  { energyCharges: 1500, monthlyFees: 120, firstYearTotal: 1620, switchingCost: 0 }, // Most expensive
];

describe('scorePlan', () => {
  test('should score with cost priority', () => {
    const preferences: UserPreferences = {
      priority: 'cost',
      minRenewablePct: 0,
      maxContractMonths: 24,
      minSupplierRating: 3.0,
    };

    const score = scorePlan(mockPlan, mockCost, allCosts, preferences, 'flat');

    // Cost score should dominate (60% weight)
    expect(score.costScore).toBeGreaterThan(0);
    expect(score.costScore).toBeLessThan(100);
    expect(score.finalScore).toBeGreaterThan(0);
    expect(score.finalScore).toBeLessThan(100);
  });

  test('should score with renewable priority', () => {
    const preferences: UserPreferences = {
      priority: 'renewable',
      minRenewablePct: 0,
      maxContractMonths: 24,
      minSupplierRating: 3.0,
    };

    const score = scorePlan(mockPlan, mockCost, allCosts, preferences, 'flat');

    // Renewable score = 50% (from plan)
    expect(score.renewableScore).toBe(50);
    
    // With 50% weight on renewable, should heavily influence final score
    expect(score.finalScore).toBeGreaterThan(0);
  });

  test('should score flexibility based on contract length', () => {
    const monthToMonthPlan: Plan = { ...mockPlan, contractLengthMonths: null };
    const score = scorePlan(monthToMonthPlan, mockCost, allCosts, { 
      priority: 'flexibility',
      minRenewablePct: 0,
      maxContractMonths: 24,
      minSupplierRating: 3.0,
    }, 'flat');

    // Month-to-month should get perfect flexibility score
    expect(score.flexibilityScore).toBe(100);
  });

  test('should normalize cost score correctly', () => {
    // Test with cheapest plan
    const cheapestCost = allCosts[0];
    const score = scorePlan(mockPlan, cheapestCost, allCosts, {
      priority: 'cost',
      minRenewablePct: 0,
      maxContractMonths: 24,
      minSupplierRating: 3.0,
    }, 'flat');

    expect(score.costScore).toBe(100); // Cheapest should get 100
  });

  test('should handle all plans with same cost (edge case)', () => {
    const sameCosts = [mockCost, mockCost, mockCost];
    
    const score = scorePlan(mockPlan, mockCost, sameCosts, {
      priority: 'cost',
      minRenewablePct: 0,
      maxContractMonths: 24,
      minSupplierRating: 3.0,
    }, 'flat');

    // Should return neutral score when all costs equal
    expect(score.costScore).toBe(50);
  });

  test('should calculate renewable score as direct percentage', () => {
    const greenPlan: Plan = { ...mockPlan, renewablePct: 100 };
    const score = scorePlan(greenPlan, mockCost, allCosts, {
      priority: 'renewable',
      minRenewablePct: 0,
      maxContractMonths: 24,
      minSupplierRating: 3.0,
    }, 'flat');

    expect(score.renewableScore).toBe(100);
  });

  test('should normalize supplier rating to 0-100 scale', () => {
    const topRatedPlan: Plan = { ...mockPlan, supplierRating: 5.0 };
    const score = scorePlan(topRatedPlan, mockCost, allCosts, {
      priority: 'balanced',
      minRenewablePct: 0,
      maxContractMonths: 24,
      minSupplierRating: 3.0,
    }, 'flat');

    expect(score.ratingScore).toBe(100); // 5.0/5.0 × 100
  });
});

