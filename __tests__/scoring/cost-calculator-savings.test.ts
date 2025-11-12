import { calculatePlanCost } from '@/lib/scoring/cost-calculator';
import { Plan } from '@/types';

describe('Cost Calculator - Savings Calculation', () => {
  const mockPlan: Plan = {
    id: 'plan-1',
    planId: 'plan-1',
    state: 'TX',
    supplierName: 'Test Supplier',
    planName: 'Test Plan',
    rateType: 'fixed',
    ratePerKwh: 0.10,
    monthlyFee: 5.0,
    contractLengthMonths: 12,
    earlyTerminationFee: 100,
    renewablePct: 50,
    supplierRating: 4.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const monthlyUsage = [800, 750, 700, 650, 600, 900, 1000, 1100, 950, 850, 750, 800]; // 9,850 kWh/year

  it('should calculate cost correctly for fixed rate plan', () => {
    const cost = calculatePlanCost(mockPlan, monthlyUsage, 0);
    
    expect(cost.energyCharges).toBe(985); // 9,850 kWh * $0.10
    expect(cost.monthlyFees).toBe(60); // $5 * 12 months
    expect(cost.firstYearTotal).toBe(1045);
    expect(cost.switchingCost).toBe(0);
  });

  it('should include early termination fee in switching cost', () => {
    const cost = calculatePlanCost(mockPlan, monthlyUsage, 150);
    
    expect(cost.switchingCost).toBe(150);
    expect(cost.firstYearTotal).toBe(1195); // 1045 + 150
  });

  it('should calculate savings when current plan is more expensive', () => {
    const currentPlanCost = 1200;
    const newPlanCost = calculatePlanCost(mockPlan, monthlyUsage, 0).firstYearTotal;
    const savings = currentPlanCost - newPlanCost;
    
    expect(savings).toBe(155); // $1200 - $1045
  });

  it('should handle TOU rate plans', () => {
    const touPlan: Plan = {
      ...mockPlan,
      rateType: 'tou',
      onPeakRate: 0.15,
      offPeakRate: 0.08,
    };

    const cost = calculatePlanCost(touPlan, monthlyUsage, 0);
    
    // 40% on-peak, 60% off-peak
    const totalKwh = 9850; // Sum of monthlyUsage
    const onPeakKwh = totalKwh * 0.4;
    const offPeakKwh = totalKwh * 0.6;
    const expectedEnergy = (onPeakKwh * 0.15) + (offPeakKwh * 0.08);
    
    expect(cost.energyCharges).toBeCloseTo(expectedEnergy, 2);
  });

  it('should handle variable rate plans', () => {
    const variablePlan: Plan = {
      ...mockPlan,
      rateType: 'variable',
    };

    const cost = calculatePlanCost(variablePlan, monthlyUsage, 0);
    
    // Variable rate uses current rate as estimate
    expect(cost.energyCharges).toBe(985); // 9,850 kWh * $0.10
  });
});

