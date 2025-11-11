import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.plan.deleteMany({});
  console.log('Cleared existing plans');

  // Texas Plans (15 plans)
  const texasPlans = [
    {
      planId: 'TX-001',
      state: 'TX',
      supplierName: 'TXU Energy',
      planName: 'TXU Energy Secure 12',
      rateType: 'fixed',
      ratePerKwh: 0.1199,
      monthlyFee: 9.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 150,
      renewablePct: 0,
      supplierRating: 3.8,
    },
    {
      planId: 'TX-002',
      state: 'TX',
      supplierName: 'Reliant Energy',
      planName: 'Reliant Basic Power 12',
      rateType: 'fixed',
      ratePerKwh: 0.1149,
      monthlyFee: 9.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 150,
      renewablePct: 0,
      supplierRating: 4.1,
    },
    {
      planId: 'TX-003',
      state: 'TX',
      supplierName: 'Green Mountain Energy',
      planName: 'Pollution Free e-Plus 12',
      rateType: 'fixed',
      ratePerKwh: 0.1299,
      monthlyFee: 9.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 150,
      renewablePct: 100,
      supplierRating: 4.5,
    },
    {
      planId: 'TX-004',
      state: 'TX',
      supplierName: 'Direct Energy',
      planName: 'Live Brighter 12',
      rateType: 'fixed',
      ratePerKwh: 0.1089,
      monthlyFee: 9.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 150,
      renewablePct: 0,
      supplierRating: 3.9,
    },
    {
      planId: 'TX-005',
      state: 'TX',
      supplierName: 'Champion Energy',
      planName: 'Champ Saver 12',
      rateType: 'fixed',
      ratePerKwh: 0.1059,
      monthlyFee: 9.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 150,
      renewablePct: 0,
      supplierRating: 3.7,
    },
    {
      planId: 'TX-006',
      state: 'TX',
      supplierName: 'Gexa Energy',
      planName: 'Gexa Saver Supreme 24',
      rateType: 'fixed',
      ratePerKwh: 0.1029,
      monthlyFee: 9.95,
      contractLengthMonths: 24,
      earlyTerminationFee: 240,
      renewablePct: 0,
      supplierRating: 4.0,
    },
    {
      planId: 'TX-007',
      state: 'TX',
      supplierName: 'Pulse Power',
      planName: 'Pulse Premier 12',
      rateType: 'fixed',
      ratePerKwh: 0.1179,
      monthlyFee: 9.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 150,
      renewablePct: 25,
      supplierRating: 3.6,
    },
    {
      planId: 'TX-008',
      state: 'TX',
      supplierName: 'TriEagle Energy',
      planName: 'Freedom Flex',
      rateType: 'variable',
      ratePerKwh: 0.1399,
      monthlyFee: 9.95,
      contractLengthMonths: null,
      earlyTerminationFee: 0,
      renewablePct: 0,
      supplierRating: 3.5,
    },
    {
      planId: 'TX-009',
      state: 'TX',
      supplierName: 'Frontier Utilities',
      planName: 'Frontier Saver Plus 12',
      rateType: 'fixed',
      ratePerKwh: 0.1129,
      monthlyFee: 9.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 150,
      renewablePct: 0,
      supplierRating: 3.8,
    },
    {
      planId: 'TX-010',
      state: 'TX',
      supplierName: '4Change Energy',
      planName: 'Maxx Saver Select 12',
      rateType: 'fixed',
      ratePerKwh: 0.1249,
      monthlyFee: 9.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 150,
      renewablePct: 100,
      supplierRating: 4.3,
    },
    {
      planId: 'TX-011',
      state: 'TX',
      supplierName: 'Cirro Energy',
      planName: 'Simple Rate 12',
      rateType: 'fixed',
      ratePerKwh: 0.1159,
      monthlyFee: 9.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 150,
      renewablePct: 0,
      supplierRating: 4.0,
    },
    {
      planId: 'TX-012',
      state: 'TX',
      supplierName: 'Discount Power',
      planName: 'Smart Saver 12',
      rateType: 'fixed',
      ratePerKwh: 0.1099,
      monthlyFee: 9.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 150,
      renewablePct: 0,
      supplierRating: 3.7,
    },
    {
      planId: 'TX-013',
      state: 'TX',
      supplierName: 'Rhythm Energy',
      planName: 'Texas Power Saver 12',
      rateType: 'fixed',
      ratePerKwh: 0.1189,
      monthlyFee: 9.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 150,
      renewablePct: 100,
      supplierRating: 4.4,
    },
    {
      planId: 'TX-014',
      state: 'TX',
      supplierName: 'Ambit Energy',
      planName: 'Free Power Perk 12',
      rateType: 'fixed',
      ratePerKwh: 0.1219,
      monthlyFee: 9.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 150,
      renewablePct: 0,
      supplierRating: 3.9,
    },
    {
      planId: 'TX-015',
      state: 'TX',
      supplierName: 'Constellation Energy',
      planName: 'Renewable Choice 12',
      rateType: 'fixed',
      ratePerKwh: 0.1279,
      monthlyFee: 9.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 150,
      renewablePct: 100,
      supplierRating: 4.2,
    },
    {
      planId: 'TX-016',
      state: 'TX',
      supplierName: 'Now Power',
      planName: 'TOU Saver 12',
      rateType: 'tou',
      ratePerKwh: 0.1099, // Average rate
      onPeakRate: 0.1499,
      offPeakRate: 0.0899,
      monthlyFee: 9.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 150,
      renewablePct: 0,
      supplierRating: 3.8,
    },
    {
      planId: 'TX-017',
      state: 'TX',
      supplierName: 'Express Energy',
      planName: 'Flash 24',
      rateType: 'fixed',
      ratePerKwh: 0.0999,
      monthlyFee: 9.95,
      contractLengthMonths: 24,
      earlyTerminationFee: 240,
      renewablePct: 0,
      supplierRating: 3.9,
    },
  ];

  // Pennsylvania Plans (2 plans)
  const pennsylvaniaPlans = [
    {
      planId: 'PA-001',
      state: 'PA',
      supplierName: 'Constellation Energy',
      planName: 'PA Standard 12',
      rateType: 'fixed',
      ratePerKwh: 0.0899,
      monthlyFee: 7.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 125,
      renewablePct: 0,
      supplierRating: 4.2,
    },
    {
      planId: 'PA-002',
      state: 'PA',
      supplierName: 'Direct Energy',
      planName: 'PA Green 12',
      rateType: 'fixed',
      ratePerKwh: 0.0999,
      monthlyFee: 7.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 125,
      renewablePct: 100,
      supplierRating: 4.0,
    },
  ];

  // Ohio Plans (2 plans)
  const ohioPlans = [
    {
      planId: 'OH-001',
      state: 'OH',
      supplierName: 'AEP Energy',
      planName: 'OH Simple Rate 12',
      rateType: 'fixed',
      ratePerKwh: 0.0849,
      monthlyFee: 6.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 100,
      renewablePct: 0,
      supplierRating: 4.1,
    },
    {
      planId: 'OH-002',
      state: 'OH',
      supplierName: 'IGS Energy',
      planName: 'OH Green Choice 12',
      rateType: 'fixed',
      ratePerKwh: 0.0949,
      monthlyFee: 6.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 100,
      renewablePct: 100,
      supplierRating: 4.3,
    },
  ];

  // Illinois Plans (2 plans)
  const illinoisPlans = [
    {
      planId: 'IL-001',
      state: 'IL',
      supplierName: 'Ameren Energy',
      planName: 'IL Standard 12',
      rateType: 'fixed',
      ratePerKwh: 0.0799,
      monthlyFee: 5.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 100,
      renewablePct: 0,
      supplierRating: 4.0,
    },
    {
      planId: 'IL-002',
      state: 'IL',
      supplierName: 'Verde Energy',
      planName: 'IL Renewable 12',
      rateType: 'fixed',
      ratePerKwh: 0.0899,
      monthlyFee: 5.95,
      contractLengthMonths: 12,
      earlyTerminationFee: 100,
      renewablePct: 100,
      supplierRating: 4.4,
    },
  ];

  // Combine all plans
  const allPlans = [
    ...texasPlans,
    ...pennsylvaniaPlans,
    ...ohioPlans,
    ...illinoisPlans,
  ];

  // Create plans
  for (const planData of allPlans) {
    await prisma.plan.create({
      data: planData,
    });
  }

  console.log(`Seeded ${allPlans.length} plans`);
  console.log(`  - Texas: ${texasPlans.length} plans`);
  console.log(`  - Pennsylvania: ${pennsylvaniaPlans.length} plans`);
  console.log(`  - Ohio: ${ohioPlans.length} plans`);
  console.log(`  - Illinois: ${illinoisPlans.length} plans`);
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

