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
    planId: z.string(),
    startDate: z.string().optional(), // Made optional per PRD v3.2
    contractEndDate: z.string().optional(),
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
    const rateLimit = checkRateLimit(clientIp, 10, 60 * 1000);

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
      const currentPlan = allPlans.find(
        p => p.planId === validatedData.currentPlan!.planId
      );

      if (currentPlan) {
        const currentCost = calculatePlanCost(
          currentPlan as Plan,
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
        }
      } else {
        console.warn(`Current plan ${validatedData.currentPlan.planId} not found in database`);
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

    // 8. Filter and rank to get top 3
    const topThree = filterAndRankPlans(scoredPlans, validatedData.preferences);

    if (topThree.length === 0) {
      return NextResponse.json(
        {
          error: 'No plans match your criteria. Please try relaxing your preferences.',
        },
        { status: 404 }
      );
    }

    // 9. Generate AI explanations in parallel
    const explanations = await generateAllExplanations(
      topThree,
      usageAnalysis,
      validatedData.preferences,
      currentPlanCost
    );

    // 10. Build response
    const recommendations: PlanRecommendation[] = topThree.map((scoredPlan, index) => ({
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
    const confidence = determineConfidence(topThree);

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
 * Determine confidence level based on results
 */
function determineConfidence(
  topThree: ScoredPlan[]
): 'high' | 'medium' | 'low' {
  if (topThree.length < 3) {
    return 'low'; // Not enough plans to choose from
  }

  // Check score spread
  const scores = topThree.map(p => p.score.finalScore);
  const scoreDiff = scores[0] - scores[2];

  if (scoreDiff > 20) {
    return 'high'; // Clear winner
  } else if (scoreDiff > 10) {
    return 'medium'; // Some differentiation
  } else {
    return 'low'; // Very close scores
  }
}

