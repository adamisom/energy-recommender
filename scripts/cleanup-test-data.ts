/**
 * Cleanup script to delete all test users and their related data
 * Run with: npx tsx scripts/cleanup-test-data.ts
 * 
 * Note: This deletes from both Prisma database AND Supabase Auth
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local for Supabase Auth deletion
 */

import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
const myEnv = config({ path: '.env.local' });
expand(myEnv);

import { prisma } from '../lib/database/client';
import { config as appConfig } from '../lib/config';

async function cleanup() {
  console.log('🧹 Starting cleanup of test data...\n');

  try {
    // First, show what we're about to delete
    const userCount = await prisma.user.count();
    const recommendationsCount = await prisma.savedRecommendation.count();
    const usageDataCount = await prisma.savedUsageData.count();
    
    console.log('📊 Current database state:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Saved Recommendations: ${recommendationsCount}`);
    console.log(`   - Saved Usage Data: ${usageDataCount}\n`);

    // Delete all saved recommendations
    const deletedRecommendations = await prisma.savedRecommendation.deleteMany({});
    console.log(`✅ Deleted ${deletedRecommendations.count} saved recommendations`);

    // Delete all saved usage data
    const deletedUsageData = await prisma.savedUsageData.deleteMany({});
    console.log(`✅ Deleted ${deletedUsageData.count} saved usage data records`);

    // Delete all users from Prisma
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✅ Deleted ${deletedUsers.count} users from Prisma database`);

    // Delete users from Supabase Auth (requires service role key)
    const supabaseUrl = appConfig.supabase.url();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && serviceRoleKey) {
      console.log('\n🗑️  Deleting users from Supabase Auth...');
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      // List all users
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.warn(`⚠️  Could not list Supabase Auth users: ${listError.message}`);
        console.warn('   You may need to delete users manually from Supabase Dashboard');
      } else if (users && users.length > 0) {
        console.log(`   Found ${users.length} user(s) in Supabase Auth`);
        
        // Delete each user
        for (const user of users) {
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
          if (deleteError) {
            console.warn(`   ⚠️  Failed to delete user ${user.email}: ${deleteError.message}`);
          } else {
            console.log(`   ✅ Deleted user: ${user.email}`);
          }
        }
      } else {
        console.log('   No users found in Supabase Auth');
      }
    } else {
      console.log('\n⚠️  Supabase Auth cleanup skipped:');
      if (!supabaseUrl) {
        console.log('   - NEXT_PUBLIC_SUPABASE_URL not set');
      }
      if (!serviceRoleKey) {
        console.log('   - SUPABASE_SERVICE_ROLE_KEY not set');
      }
      console.log('\n   To delete Supabase Auth users:');
      console.log('   1. Go to Supabase Dashboard → Authentication → Users');
      console.log('   2. Delete users manually, OR');
      console.log('   3. Add SUPABASE_SERVICE_ROLE_KEY to .env.local and run this script again');
    }

    console.log('\n✨ Cleanup complete! Database is now clean.');
    console.log('You can now sign up with a fresh user account.\n');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();

