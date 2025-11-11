import { calculatePlanCost, calculateSavings } from '@/lib/scoring/cost-calculator';
import { Plan } from '@/types';

const mockFixedPlan: Plan = {
  id: 'test-1',
  planId: 'TX-TEST-001',
  state: 'TX',
  supplierName: 'Test Energy',
  planName: 'Test Fixed Plan',
  rateType: 'fixed',
  ratePerKwh: 0.10,
  monthlyFee: 10.0,
  contractLengthMonths: 12,
  earlyTerminationFee: 150,
  renewablePct: 0,
  supplierRating: 4.0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('calculatePlanCost', () => {
  const monthlyUsage = [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000];

  test('should calculate fixed rate plan correctly', () => {
    const result = calculatePlanCost(mockFixedPlan, monthlyUsage, 0);

    // 12,000 kWh × $0.10 = $1,200
    expect(result.energyCharges).toBe(1200);
    
    // $10/month × 12 = $120
    expect(result.monthlyFees).toBe(120);
    
    // No switching cost
    expect(result.switchingCost).toBe(0);
    
    // Total: $1,320
    expect(result.firstYearTotal).toBe(1320);
  });

  test('should include early termination fee when switching', () => {
    const result = calculatePlanCost(mockFixedPlan, monthlyUsage, 150);

    expect(result.switchingCost).toBe(150);
    expect(result.firstYearTotal).toBe(1470); // 1320 + 150
  });

  test('should calculate TOU plan with on/off peak rates', () => {
    const touPlan: Plan = {
      ...mockFixedPlan,
      rateType: 'tou',
      onPeakRate: 0.15,
      offPeakRate: 0.08,
    };

    const result = calculatePlanCost(touPlan, monthlyUsage, 0);

    // 40% on-peak: 4,800 kWh × $0.15 = $720
    // 60% off-peak: 7,200 kWh × $0.08 = $576
    // Total: $1,296
    expect(result.energyCharges).toBe(1296);
  });

  test('should handle variable rate plans', () => {
    const variablePlan: Plan = {
      ...mockFixedPlan,
      rateType: 'variable',
      ratePerKwh: 0.12,
    };

    const result = calculatePlanCost(variablePlan, monthlyUsage, 0);

    // 12,000 kWh × $0.12 = $1,440
    expect(result.energyCharges).toBe(1440);
  });

  test('should handle month-to-month plans', () => {
    const monthToMonthPlan: Plan = {
      ...mockFixedPlan,
      contractLengthMonths: null,
      earlyTerminationFee: 0,
    };

    const result = calculatePlanCost(monthToMonthPlan, monthlyUsage, 0);
    expect(result.firstYearTotal).toBe(1320); // No ETF
  });
});

describe('calculateSavings', () => {
  test('should calculate positive savings', () => {
    const savings = calculateSavings(1200, 1500);
    expect(savings).toBe(300); // Saving $300
  });

  test('should calculate negative savings (more expensive)', () => {
    const savings = calculateSavings(1500, 1200);
    expect(savings).toBe(-300); // Costs $300 more
  });

  test('should return zero for same cost', () => {
    const savings = calculateSavings(1200, 1200);
    expect(savings).toBe(0);
  });
});

