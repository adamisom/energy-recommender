import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { prisma } from '@/lib/database/client';

const saveUsageSchema = z.object({
  monthlyKwh: z.array(z.number().positive()).length(12),
  state: z.string().optional(),
});

/**
 * Save user's usage data to database
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
    const validatedData = saveUsageSchema.parse(body);

    // Upsert usage data (replace if exists)
    await prisma.savedUsageData.deleteMany({
      where: { userId: user.id },
    });

    const savedData = await prisma.savedUsageData.create({
      data: {
        userId: user.id,
        monthlyKwh: validatedData.monthlyKwh,
        state: validatedData.state,
      },
    });

    return NextResponse.json(savedData);
  } catch (error) {
    console.error('Error saving usage data:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save usage data' },
      { status: 500 }
    );
  }
}

/**
 * Get user's saved usage data
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

    const savedData = await prisma.savedUsageData.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
    });

    if (!savedData) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({
      data: {
        monthlyKwh: savedData.monthlyKwh,
        state: savedData.state,
        updatedAt: savedData.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching usage data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}

