#!/usr/bin/env tsx

/**
 * Test Recommendations Script
 * 
 * Tests different preference sets to see which plans are recommended
 * 
 * Usage:
 *   npm run test:recommendations
 */

// Load environment variables
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
const myEnv = config({ path: '.env.local' });
expand(myEnv);

import { prisma } from '@/lib/database/client';
import { analyzeUsage } from '@/lib/scoring/usage-analysis';
import { calculatePlanCost } from '@/lib/scoring/cost-calculator';
import { scorePlan } from '@/lib/scoring/plan-scorer';
import { filterAndRankPlans } from '@/lib/scoring/plan-ranker';
import { Plan, UserPreferences, ScoredPlan } from '@/types';

// Sample usage data (12 months)
const SAMPLE_USAGE = [
  1150, 980, 720, 650, 890, 1420, 1850, 1920, 1540, 890, 720, 1100
];

interface TestCase {
  name: string;
  preferences: UserPreferences;
}

const testCases: TestCase[] = [
  {
    name: 'Cost Priority',
    preferences: {
      priority: 'cost',
      minRenewablePct: 0,
      maxContractMonths: 24,
      minSupplierRating: 3.0,
    },
  },
  {
    name: 'Renewable Priority',
    preferences: {
      priority: 'renewable',
      minRenewablePct: 50,
      maxContractMonths: 24,
      minSupplierRating: 3.0,
    },
  },
  {
    name: 'High Rating Required (4.8)',
    preferences: {
      priority: 'balanced',
      minRenewablePct: 0,
      maxContractMonths: 24,
      minSupplierRating: 4.8,
    },
  },
  {
    name: 'Flexibility Priority',
    preferences: {
      priority: 'flexibility',
      minRenewablePct: 0,
      maxContractMonths: 12,
      minSupplierRating: 3.0,
    },
  },
  {
    name: 'Balanced (Default)',
    preferences: {
      priority: 'balanced',
      minRenewablePct: 0,
      maxContractMonths: 24,
      minSupplierRating: 3.0,
    },
  },
  {
    name: '100% Renewable + High Rating',
    preferences: {
      priority: 'renewable',
      minRenewablePct: 100,
      maxContractMonths: 24,
      minSupplierRating: 4.3,
    },
  },
];

async function testRecommendations() {
  console.log('🧪 Testing Recommendations with Different Preferences\n');
  console.log('=' .repeat(80));
  console.log();

  try {
    // Fetch all Texas plans
    const allPlans = await prisma.plan.findMany({
      where: { state: 'TX' },
    });

    if (allPlans.length === 0) {
      console.error('❌ No Texas plans found in database.');
      console.error('   Run `npm run seed` first to seed the database.\n');
      process.exit(1);
    }

    console.log(`📊 Found ${allPlans.length} Texas plans\n`);

    // Analyze usage
    const usageAnalysis = analyzeUsage(SAMPLE_USAGE);

    // Calculate costs for all plans
    const allCosts = allPlans.map(plan =>
      calculatePlanCost(plan as Plan, SAMPLE_USAGE, 0)
    );

    // Score all plans
    const scoredPlans: ScoredPlan[] = allPlans.map((plan, index) => {
      const cost = allCosts[index];
      const score = scorePlan(
        plan as Plan,
        cost,
        allCosts,
        { priority: 'balanced', minRenewablePct: 0, maxContractMonths: 24, minSupplierRating: 3.0 },
        usageAnalysis.pattern
      );
      return { plan: plan as Plan, cost, score };
    });

    // Test each preference set
    for (const testCase of testCases) {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`📋 Test: ${testCase.name}`);
      console.log(`   Priority: ${testCase.preferences.priority}`);
      console.log(`   Min Renewable: ${testCase.preferences.minRenewablePct}%`);
      console.log(`   Max Contract: ${testCase.preferences.maxContractMonths} months`);
      console.log(`   Min Rating: ${testCase.preferences.minSupplierRating}`);
      console.log();

      // Re-score with this priority
      const rescoredPlans: ScoredPlan[] = allPlans.map((plan, index) => {
        const cost = allCosts[index];
        const score = scorePlan(
          plan as Plan,
          cost,
          allCosts,
          testCase.preferences,
          usageAnalysis.pattern
        );
        return { plan: plan as Plan, cost, score };
      });

      // Filter and rank
      const topThree = filterAndRankPlans(rescoredPlans, testCase.preferences);

      if (topThree.length === 0) {
        console.log('   ⚠️  No plans match criteria');
        continue;
      }

      console.log('   Top 3 Recommendations:');
      topThree.forEach((scoredPlan, index) => {
        const { plan, score, cost } = scoredPlan;
        console.log(`   ${index + 1}. ${plan.planId} - ${plan.planName}`);
        console.log(`      Supplier: ${plan.supplierName}`);
        console.log(`      Score: ${score.finalScore.toFixed(2)}`);
        console.log(`      Cost: $${cost.firstYearTotal.toFixed(2)}/yr`);
        console.log(`      Rate: $${plan.ratePerKwh.toFixed(4)}/kWh`);
        console.log(`      Renewable: ${plan.renewablePct}%`);
        console.log(`      Rating: ${plan.supplierRating}/5.0`);
        console.log(`      Contract: ${plan.contractLengthMonths || 'Month-to-month'} months`);
        console.log(`      Score Breakdown:`);
        console.log(`        - Cost: ${score.costScore.toFixed(1)}`);
        console.log(`        - Renewable: ${score.renewableScore.toFixed(1)}`);
        console.log(`        - Rating: ${score.ratingScore.toFixed(1)}`);
        console.log(`        - Flexibility: ${score.flexibilityScore.toFixed(1)}`);
        console.log();
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Testing complete!\n');
  } catch (error) {
    console.error('❌ Error testing recommendations:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testRecommendations();

