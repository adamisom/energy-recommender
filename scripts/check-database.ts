/**
 * Quick script to check what's in the database
 */

import { config } from 'dotenv';
import { expand } from 'dotenv-expand';

const myEnv = config({ path: '.env.local' });
expand(myEnv);

import { prisma } from '../lib/database/client';

async function check() {
  try {
    const users = await prisma.user.findMany();
    const recommendations = await prisma.savedRecommendation.findMany();
    const usageData = await prisma.savedUsageData.findMany();

    console.log('📊 Current database contents:\n');
    console.log(`Users (${users.length}):`);
    users.forEach(u => {
      console.log(`  - ${u.email} (ID: ${u.id}, Name: ${u.name || 'N/A'})`);
    });

    console.log(`\nSaved Recommendations (${recommendations.length}):`);
    recommendations.forEach(r => {
      console.log(`  - ID: ${r.id}, User: ${r.userId}, State: ${r.state}`);
    });

    console.log(`\nSaved Usage Data (${usageData.length}):`);
    usageData.forEach(u => {
      console.log(`  - ID: ${u.id}, User: ${u.userId}, State: ${u.state || 'N/A'}`);
    });

    if (users.length === 0 && recommendations.length === 0 && usageData.length === 0) {
      console.log('\n✅ Database is clean - no users or data found!');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();

