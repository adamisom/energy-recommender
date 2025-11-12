import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { prisma } from '@/lib/database/client';

const saveRecommendationSchema = z.object({
  recommendations: z.unknown(), // Full recommendation response
  monthlyUsageKwh: z.array(z.number()).length(12),
  preferences: z.unknown(),
  state: z.string(),
});

/**
 * Save user's recommendation to history
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = saveRecommendationSchema.parse(body);

    // Ensure User record exists in our database (Supabase Auth users need to be synced)
    // Find or create user by email (Prisma uses CUID for ID, Supabase uses UUID)
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      // Create new user record (Prisma will generate CUID for id)
      dbUser = await prisma.user.create({
        data: {
          email: user.email!,
          password: '', // Not used with Supabase Auth
          name: user.user_metadata?.name || null,
        },
      });
    }

    const savedRec = await prisma.savedRecommendation.create({
      data: {
        userId: dbUser.id, // Use Prisma-generated ID
        recommendations: validatedData.recommendations as object,
        monthlyUsageKwh: validatedData.monthlyUsageKwh,
        preferences: validatedData.preferences as object,
        state: validatedData.state,
      },
    });

    return NextResponse.json(savedRec);
  } catch (error) {
    console.error('Error saving recommendation:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save recommendation' },
      { status: 500 }
    );
  }
}

/**
 * Get user's recommendation history
 */
export async function GET() {
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

    // Find user by email (Prisma uses CUID, Supabase uses UUID)
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json({
        data: [], // No saved recommendations if user doesn't exist in DB yet
      });
    }

    const savedRecommendations = await prisma.savedRecommendation.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      take: 10, // Last 10 recommendations
    });

    return NextResponse.json({
      data: savedRecommendations,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

