import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/client';
import { analyzeUsage } from '@/lib/scoring/usage-analysis';
import { calculatePlanCost } from '@/lib/scoring/cost-calculator';
import { scorePlan } from '@/lib/scoring/plan-scorer';
import { filterAndRankPlans } from '@/lib/scoring/plan-ranker';
import { generateAllExplanations } from '@/lib/anthropic/batch-explanations';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { Plan, RecommendationResponse, PlanRecommendation, ScoredPlan } from '@/types';

// Validation schema
const recommendationRequestSchema = z.object({
  userId: z.string(),
  state: z.enum(['TX', 'PA', 'OH', 'IL']).optional(),
  monthlyUsageKwh: z.array(z.number().positive()).length(12),
  currentPlan: z.object({
    planId: z.string().optional(),
    supplierName: z.string().optional(),
    planName: z.string().optional(),
    ratePerKwh: z.number().optional(),
    rateType: z.enum(['fixed', 'variable', 'tou']).optional(),
    monthlyFee: z.number().optional(),
    contractStartDate: z.string().optional(),
    contractEndDate: z.string().optional(),
    contractLengthMonths: z.number().optional(),
    earlyTerminationFee: z.number().optional(),
    onPeakRate: z.number().optional(),
    offPeakRate: z.number().optional(),
  }).optional(),
  preferences: z.object({
    priority: z.enum(['cost', 'renewable', 'flexibility', 'balanced']),
    minRenewablePct: z.number().min(0).max(100),
    maxContractMonths: z.number().min(1).max(36),
    minSupplierRating: z.number().min(1.0).max(5.0),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(clientIp, 10, 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
          },
        }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validatedData = recommendationRequestSchema.parse(body);

    // 3. Fetch plans from database
    const where: Record<string, unknown> = {};
    if (validatedData.state) {
      where.state = validatedData.state;
    }

    const allPlans = await prisma.plan.findMany({ where });

    if (allPlans.length === 0) {
      return NextResponse.json(
        {
          error: `No plans available${validatedData.state ? ` for state ${validatedData.state}` : ''}. Please try a different state.`,
        },
        { status: 503 }
      );
    }

    // 4. Analyze usage
    const usageAnalysis = analyzeUsage(validatedData.monthlyUsageKwh);

    // 5. Get current plan details if provided
    let currentPlanCost: number | undefined;
    let currentPlanEarlyTerminationFee = 0;

    if (validatedData.currentPlan) {
      // Try to find current plan in database first
      let currentPlan: Plan | null = null;
      if (validatedData.currentPlan.planId) {
        currentPlan = allPlans.find(
          p => p.planId === validatedData.currentPlan!.planId
        ) as Plan | null;
      }

      // If not found in database, calculate from provided data
      if (!currentPlan && validatedData.currentPlan.ratePerKwh) {
        // Create a temporary plan object from current plan data
        const tempPlan: Plan = {
          id: 'current-plan',
          planId: validatedData.currentPlan.planId || 'current-plan',
          state: validatedData.state || 'TX',
          supplierName: validatedData.currentPlan.supplierName || 'Current Supplier',
          planName: validatedData.currentPlan.planName || 'Current Plan',
          rateType: validatedData.currentPlan.rateType || 'fixed',
          ratePerKwh: validatedData.currentPlan.ratePerKwh,
          onPeakRate: validatedData.currentPlan.onPeakRate,
          offPeakRate: validatedData.currentPlan.offPeakRate,
          monthlyFee: validatedData.currentPlan.monthlyFee || 0,
          contractLengthMonths: validatedData.currentPlan.contractLengthMonths || null,
          earlyTerminationFee: validatedData.currentPlan.earlyTerminationFee || 0,
          renewablePct: 0, // Unknown
          supplierRating: 3.0, // Default
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        currentPlan = tempPlan;
      }

      if (currentPlan) {
        const currentCost = calculatePlanCost(
          currentPlan,
          validatedData.monthlyUsageKwh,
          0
        );
        currentPlanCost = currentCost.firstYearTotal;

        // Check if we'd incur early termination fee
        if (validatedData.currentPlan.contractEndDate) {
          const endDate = new Date(validatedData.currentPlan.contractEndDate);
          if (endDate > new Date()) {
            currentPlanEarlyTerminationFee = currentPlan.earlyTerminationFee;
          }
        } else if (validatedData.currentPlan.earlyTerminationFee) {
          // Use provided ETF if contract end date not specified
          currentPlanEarlyTerminationFee = validatedData.currentPlan.earlyTerminationFee;
        }
      }
    }

    // 6. Calculate costs for all plans
    const allCosts = allPlans.map(plan =>
      calculatePlanCost(
        plan as Plan,
        validatedData.monthlyUsageKwh,
        currentPlanEarlyTerminationFee
      )
    );

    // 7. Score all plans
    const scoredPlans: ScoredPlan[] = allPlans.map((plan, index) => {
      const cost = allCosts[index];
      const score = scorePlan(
        plan as Plan,
        cost,
        allCosts,
        validatedData.preferences,
        usageAnalysis.pattern
      );

      return { plan: plan as Plan, cost, score };
    });

    // 8. Filter and rank to get top 5
    const topFive = filterAndRankPlans(scoredPlans, validatedData.preferences);

    // Don't error if < 5 plans - just return what we have
    // The UI will show a call-out box to inform the user

    // 9. Generate AI explanations in parallel
    const explanations = await generateAllExplanations(
      topFive,
      usageAnalysis,
      validatedData.preferences,
      currentPlanCost
    );

    // 10. Build response
    const recommendations: PlanRecommendation[] = topFive.map((scoredPlan, index) => ({
      rank: index + 1,
      plan: scoredPlan.plan,
      projectedAnnualCost: scoredPlan.cost.firstYearTotal,
      annualSavings: currentPlanCost
        ? currentPlanCost - scoredPlan.cost.firstYearTotal
        : 0,
      explanation: explanations[index],
      score: scoredPlan.score.finalScore,
      breakdown: scoredPlan.score,
    }));

    // Determine confidence level
    const confidence = determineConfidence(
      topFive,
      validatedData.monthlyUsageKwh,
      usageAnalysis
    );

    const response: RecommendationResponse = {
      recommendations,
      metadata: {
        totalAnnualUsageKwh: usageAnalysis.totalAnnualKwh,
        usagePattern: usageAnalysis.pattern,
        currentPlanAnnualCost: currentPlanCost,
        generatedAt: new Date().toISOString(),
        confidence,
      },
    };

    return NextResponse.json(response, {
      headers: {
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.reset.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);

    // Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Determine confidence level based on results and data quality
 */
function determineConfidence(
  topFive: ScoredPlan[],
  usageData: number[],
  usageAnalysis: { pattern: string; totalAnnualKwh: number }
): 'high' | 'medium' | 'low' {
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  
  // Check data completeness
  const missingMonths = usageData.filter(v => v === 0 || !v).length;
  if (missingMonths > 3) {
    confidence = 'low';
  }
  
  // Check usage pattern clarity
  if (usageAnalysis.pattern === 'variable') {
    confidence = confidence === 'low' ? 'low' : 'medium';
  }
  
  // Check if we have enough plans to compare
  if (topFive.length < 5) {
    confidence = 'low';
  } else {
    // Check score spread
    const scores = topFive.map(p => p.score.finalScore);
    const scoreDiff = scores[0] - scores[4];
    
    if (scoreDiff < 5) {
      confidence = 'low'; // Very close scores = uncertain
    } else if (scoreDiff < 15) {
      confidence = confidence === 'low' ? 'low' : 'medium';
    } else if (scoreDiff > 20 && missingMonths <= 2 && usageAnalysis.pattern !== 'variable') {
      confidence = 'high'; // Clear winner with good data
    }
  }
  
  return confidence;
}

