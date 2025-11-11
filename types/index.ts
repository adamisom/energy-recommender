// Core TypeScript types for Energy Plan Recommender

export type UsagePattern = 'summer_peak' | 'winter_peak' | 'flat' | 'variable';

export type RateType = 'fixed' | 'variable' | 'tou';

export type Priority = 'cost' | 'renewable' | 'flexibility' | 'balanced';

export interface Plan {
  id: string;
  planId: string;
  state: string;
  supplierName: string;
  planName: string;
  rateType: RateType;
  ratePerKwh: number;
  onPeakRate?: number;
  offPeakRate?: number;
  monthlyFee: number;
  contractLengthMonths: number | null;
  earlyTerminationFee: number;
  renewablePct: number;
  supplierRating: number;
  planDetails?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  priority: Priority;
  minRenewablePct: number;
  maxContractMonths: number;
  minSupplierRating: number;
}

export interface CurrentPlan {
  planId: string;
  startDate?: string; // ISO date string - made optional per PRD v3.2
  contractEndDate?: string; // ISO date string
}

export interface RecommendationRequest {
  userId: string;
  state?: string; // Added per PRD v3.2
  monthlyUsageKwh: number[]; // Exactly 12 months
  currentPlan?: CurrentPlan;
  preferences: UserPreferences;
}

export interface UsageAnalysis {
  totalAnnualKwh: number;
  averageMonthlyKwh: number;
  medianMonthlyKwh: number;
  peakMonth: number; // 0-11
  lowMonth: number; // 0-11
  pattern: UsagePattern;
}

export interface CostBreakdown {
  energyCharges: number;
  monthlyFees: number;
  firstYearTotal: number;
  switchingCost: number;
}

export interface ScoreBreakdown {
  costScore: number;
  flexibilityScore: number;
  renewableScore: number;
  ratingScore: number;
  seasonalScore: number;
  finalScore: number;
}

export interface ScoredPlan {
  plan: Plan;
  cost: CostBreakdown;
  score: ScoreBreakdown;
}

export interface PlanRecommendation {
  rank: number;
  plan: Plan;
  projectedAnnualCost: number;
  annualSavings: number;
  explanation: string;
  score: number;
  breakdown: ScoreBreakdown; // Includes finalScore per PRD v3.2
}

export interface RecommendationResponse {
  recommendations: PlanRecommendation[];
  metadata: {
    totalAnnualUsageKwh: number;
    usagePattern: UsagePattern;
    currentPlanAnnualCost?: number;
    generatedAt: string;
    confidence: 'high' | 'medium' | 'low';
  };
}

export interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

