#!/usr/bin/env tsx

/**
 * Test LLM Explanation Feature
 * 
 * Tests that the AI explanation generation is working correctly
 * 
 * Usage:
 *   npm run test:explanations
 */

// Load environment variables
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
const myEnv = config({ path: '.env.local' });
expand(myEnv);

import { generateExplanation } from '@/lib/anthropic/explanations';
import { analyzeUsage } from '@/lib/scoring/usage-analysis';
import { calculatePlanCost } from '@/lib/scoring/cost-calculator';
import { prisma } from '@/lib/database/client';
import { Plan, UserPreferences } from '@/types';

async function testExplanations() {
  console.log('🧪 Testing LLM Explanation Feature\n');
  console.log('='.repeat(80));
  console.log();

  try {
    // Check if API key is set
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not found in environment variables');
      console.error('   Please set it in .env.local\n');
      process.exit(1);
    }

    console.log('✅ ANTHROPIC_API_KEY found\n');

    // Get a sample plan from database
    const plan = await prisma.plan.findFirst({
      where: { state: 'TX' },
    });

    if (!plan) {
      console.error('❌ No plans found in database');
      console.error('   Run `npm run seed` first to seed the database.\n');
      process.exit(1);
    }

    console.log(`📋 Testing with plan: ${plan.planName} (${plan.planId})\n`);

    // Sample usage data
    const monthlyUsage = [
      1150, 980, 720, 650, 890, 1420, 1850, 1920, 1540, 890, 720, 1100
    ];

    // Analyze usage
    const usageAnalysis = analyzeUsage(monthlyUsage);

    // Calculate cost
    const cost = calculatePlanCost(plan as Plan, monthlyUsage, 0);

    // Sample preferences
    const preferences: UserPreferences = {
      priority: 'balanced',
      minRenewablePct: 0,
      maxContractMonths: 24,
      minSupplierRating: 3.0,
    };

    console.log('🤖 Generating AI explanation...\n');

    const startTime = Date.now();
    const explanation = await generateExplanation({
      plan: plan as Plan,
      rank: 1,
      usageAnalysis,
      cost,
      preferences,
      currentPlanCost: 2000, // Sample current plan cost
    });
    const duration = Date.now() - startTime;

    console.log('✅ Explanation generated successfully!');
    console.log(`⏱️  Duration: ${duration}ms\n`);
    console.log('📝 Explanation:');
    console.log('-'.repeat(80));
    console.log(explanation);
    console.log('-'.repeat(80));
    console.log();

    // Validate explanation
    if (explanation.length < 50) {
      console.warn('⚠️  Warning: Explanation seems too short');
    }
    if (explanation.length > 500) {
      console.warn('⚠️  Warning: Explanation seems too long');
    }
    if (!/\d/.test(explanation)) {
      console.warn('⚠️  Warning: Explanation doesn\'t contain numbers');
    }

    console.log('\n✅ Test complete! LLM explanation feature is working.\n');
  } catch (error) {
    console.error('❌ Error testing explanations:', error);
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
      if (error.message.includes('API key')) {
        console.error('\n   💡 Make sure ANTHROPIC_API_KEY is set in .env.local');
      }
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testExplanations();

