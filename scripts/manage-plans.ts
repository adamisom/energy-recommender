#!/usr/bin/env tsx

/**
 * Plan Management Script
 * 
 * Usage:
 *   Export plans: npm run plans:export
 *   Import/Update plans: npm run plans:import
 * 
 * This script allows you to:
 * 1. Export all existing plans to JSON (easy to edit)
 * 2. Import/update plans from JSON file
 */

// Load environment variables
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
const myEnv = config({ path: '.env.local' });
expand(myEnv);

import { PrismaClient, Prisma } from '@prisma/client';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

const PLANS_FILE = join(process.cwd(), 'prisma', 'plans.json');

interface PlanData {
  planId: string;
  state: string;
  supplierName: string;
  planName: string;
  rateType: string;
  ratePerKwh: number;
  monthlyFee: number;
  contractLengthMonths: number | null;
  earlyTerminationFee: number;
  renewablePct: number;
  supplierRating: number;
  onPeakRate?: number | null;
  offPeakRate?: number | null;
  planDetails?: object | null;
}

/**
 * Export all plans to JSON file
 */
async function exportPlans() {
  console.log('📤 Exporting plans from database...\n');

  try {
    const plans = await prisma.plan.findMany({
      orderBy: [
        { state: 'asc' },
        { planId: 'asc' },
      ],
    });

    if (plans.length === 0) {
      console.log('⚠️  No plans found in database.');
      console.log('   Run `npm run seed` first to create initial plans.\n');
      return;
    }

    // Convert to plain objects (remove Prisma metadata)
    const plansData: PlanData[] = plans.map(plan => ({
      planId: plan.planId,
      state: plan.state,
      supplierName: plan.supplierName,
      planName: plan.planName,
      rateType: plan.rateType,
      ratePerKwh: plan.ratePerKwh,
      monthlyFee: plan.monthlyFee,
      contractLengthMonths: plan.contractLengthMonths,
      earlyTerminationFee: plan.earlyTerminationFee,
      renewablePct: plan.renewablePct,
      supplierRating: plan.supplierRating,
      onPeakRate: plan.onPeakRate ?? null,
      offPeakRate: plan.offPeakRate ?? null,
      planDetails: plan.planDetails as object | null,
    }));

    // Group by state for easier editing
    const groupedPlans: Record<string, PlanData[]> = {};
    plansData.forEach(plan => {
      if (!groupedPlans[plan.state]) {
        groupedPlans[plan.state] = [];
      }
      groupedPlans[plan.state].push(plan);
    });

    // Write to file with pretty formatting
    const output = {
      _comment: 'Edit this file to add/update plans. Run `npm run plans:import` to apply changes.',
      _lastExported: new Date().toISOString(),
      plans: plansData,
      groupedByState: groupedPlans,
    };

    writeFileSync(PLANS_FILE, JSON.stringify(output, null, 2), 'utf-8');

    console.log(`✅ Exported ${plans.length} plans to: ${PLANS_FILE}\n`);
    console.log('📝 Next steps:');
    console.log('   1. Edit the JSON file to add/update plans');
    console.log('   2. Run `npm run plans:import` to apply changes\n');
  } catch (error) {
    console.error('❌ Error exporting plans:', error);
    process.exit(1);
  }
}

/**
 * Import/update plans from JSON file
 */
async function importPlans() {
  console.log('📥 Importing plans from JSON file...\n');

  try {
    // Read JSON file
    const fileContent = readFileSync(PLANS_FILE, 'utf-8');
    const data = JSON.parse(fileContent);

    const plansData: PlanData[] = data.plans || data;

    if (!Array.isArray(plansData) || plansData.length === 0) {
      console.error('❌ No plans found in JSON file.');
      console.error('   Make sure the file contains an array of plans.\n');
      process.exit(1);
    }

    console.log(`Found ${plansData.length} plans in JSON file.\n`);

    // Validate and upsert each plan
    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const planData of plansData) {
      try {
        // Validate required fields
        if (!planData.planId || !planData.state || !planData.supplierName || !planData.planName) {
          console.error(`⚠️  Skipping plan with missing required fields:`, planData);
          errors++;
          continue;
        }

        // Check if plan exists to determine if it's create or update
        const existing = await prisma.plan.findUnique({
          where: { planId: planData.planId },
        });

        const isUpdate = !!existing;

        // Upsert plan (create if doesn't exist, update if it does)
        await prisma.plan.upsert({
          where: { planId: planData.planId },
          update: {
            state: planData.state,
            supplierName: planData.supplierName,
            planName: planData.planName,
            rateType: planData.rateType,
            ratePerKwh: planData.ratePerKwh,
            monthlyFee: planData.monthlyFee,
            contractLengthMonths: planData.contractLengthMonths ?? null,
            earlyTerminationFee: planData.earlyTerminationFee,
            renewablePct: planData.renewablePct,
            supplierRating: planData.supplierRating,
            onPeakRate: planData.onPeakRate ?? null,
            offPeakRate: planData.offPeakRate ?? null,
            planDetails: planData.planDetails ? (planData.planDetails as Prisma.InputJsonValue) : Prisma.JsonNull,
          },
          create: {
            planId: planData.planId,
            state: planData.state,
            supplierName: planData.supplierName,
            planName: planData.planName,
            rateType: planData.rateType,
            ratePerKwh: planData.ratePerKwh,
            monthlyFee: planData.monthlyFee,
            contractLengthMonths: planData.contractLengthMonths ?? null,
            earlyTerminationFee: planData.earlyTerminationFee,
            renewablePct: planData.renewablePct,
            supplierRating: planData.supplierRating,
            onPeakRate: planData.onPeakRate ?? null,
            offPeakRate: planData.offPeakRate ?? null,
            planDetails: planData.planDetails ? (planData.planDetails as Prisma.InputJsonValue) : Prisma.JsonNull,
          },
        });

        if (isUpdate) {
          updated++;
        } else {
          created++;
        }
      } catch (error) {
        console.error(`❌ Error processing plan ${planData.planId}:`, error);
        errors++;
      }
    }

    console.log('\n✅ Import complete!');
    console.log(`   Created: ${created} plans`);
    console.log(`   Updated: ${updated} plans`);
    if (errors > 0) {
      console.log(`   Errors: ${errors} plans\n`);
    } else {
      console.log();
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      console.error(`❌ File not found: ${PLANS_FILE}`);
      console.error('   Run `npm run plans:export` first to create the file.\n');
    } else {
      console.error('❌ Error importing plans:', error);
    }
    process.exit(1);
  }
}

// Main execution
async function main() {
  const command = process.argv[2];

  if (command === 'export') {
    await exportPlans();
  } else if (command === 'import') {
    await importPlans();
  } else {
    console.log('📋 Plan Management Script\n');
    console.log('Usage:');
    console.log('  npm run plans:export  - Export all plans to JSON file');
    console.log('  npm run plans:import  - Import/update plans from JSON file\n');
    console.log('Workflow:');
    console.log('  1. Run `npm run plans:export` to export current plans');
    console.log('  2. Edit `prisma/plans.json` to add/update plans');
    console.log('  3. Run `npm run plans:import` to apply changes\n');
    process.exit(0);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

