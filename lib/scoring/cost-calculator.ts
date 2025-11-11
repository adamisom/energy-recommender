import { Plan, CostBreakdown } from '@/types';

/**
 * Calculates the total cost for a plan based on monthly usage
 * @param plan The energy plan to calculate cost for
 * @param monthlyUsageKwh Array of 12 monthly usage values
 * @param currentPlanEarlyTerminationFee ETF from current plan if switching early
 * @returns CostBreakdown with detailed cost information
 */
export function calculatePlanCost(
  plan: Plan,
  monthlyUsageKwh: number[],
  currentPlanEarlyTerminationFee: number = 0
): CostBreakdown {
  const totalAnnualKwh = monthlyUsageKwh.reduce((sum, val) => sum + val, 0);
  
  let energyCharges = 0;

  switch (plan.rateType) {
    case 'fixed':
      // Simple: rate per kWh × total kWh
      energyCharges = plan.ratePerKwh * totalAnnualKwh;
      break;

    case 'variable':
      // Variable rate plans - use current rate as estimate
      energyCharges = plan.ratePerKwh * totalAnnualKwh;
      break;

    case 'tou':
      // Time-of-use: assume 40% on-peak, 60% off-peak (rough estimate)
      if (!plan.onPeakRate || !plan.offPeakRate) {
        // Fallback to average rate if TOU rates not specified
        energyCharges = plan.ratePerKwh * totalAnnualKwh;
      } else {
        const onPeakKwh = totalAnnualKwh * 0.4;
        const offPeakKwh = totalAnnualKwh * 0.6;
        energyCharges = (plan.onPeakRate * onPeakKwh) + (plan.offPeakRate * offPeakKwh);
      }
      break;

    default:
      console.warn(`Unknown rate type: ${plan.rateType}, using standard calculation`);
      energyCharges = plan.ratePerKwh * totalAnnualKwh;
  }

  // Monthly fees for 12 months
  const monthlyFees = plan.monthlyFee * 12;

  // Switching cost (early termination fee from CURRENT plan, if applicable)
  const switchingCost = currentPlanEarlyTerminationFee;

  // First year total includes one-time switching cost
  const firstYearTotal = energyCharges + monthlyFees + switchingCost;

  return {
    energyCharges,
    monthlyFees,
    firstYearTotal,
    switchingCost,
  };
}

/**
 * Calculate annual savings compared to current plan
 */
export function calculateSavings(
  newPlanCost: number,
  currentPlanCost: number
): number {
  return currentPlanCost - newPlanCost;
}

