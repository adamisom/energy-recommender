import { NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { prisma } from '@/lib/database/client';

/**
 * Sync Supabase Auth user to our Prisma User table
 * Called after sign-up or on first data save
 */
export async function POST() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Authentication not configured' },
        { status: 503 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find or create user in our database
    const dbUser = await prisma.user.upsert({
      where: { email: user.email! },
      update: {
        // Update name if it changed
        name: user.user_metadata?.name || null,
      },
      create: {
        email: user.email!,
        password: '', // Not used with Supabase Auth
        name: user.user_metadata?.name || null,
      },
    });

    return NextResponse.json({ success: true, user: dbUser });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}

