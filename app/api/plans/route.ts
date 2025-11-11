import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build where clause from query params
    const where: Record<string, unknown> = {};

    // State filter
    const state = searchParams.get('state');
    if (state) {
      where.state = state;
    }

    // Renewable percentage filter
    const minRenewable = searchParams.get('minRenewable');
    if (minRenewable) {
      where.renewablePct = {
        gte: parseInt(minRenewable, 10),
      };
    }

    // Max contract length filter
    const maxContract = searchParams.get('maxContract');
    if (maxContract) {
      where.OR = [
        { contractLengthMonths: null }, // Month-to-month
        { contractLengthMonths: { lte: parseInt(maxContract, 10) } },
      ];
    }

    // Min supplier rating filter
    const minRating = searchParams.get('minRating');
    if (minRating) {
      where.supplierRating = {
        gte: parseFloat(minRating),
      };
    }

    // Search by supplier or plan name
    const search = searchParams.get('search');
    if (search) {
      where.OR = [
        { supplierName: { contains: search, mode: 'insensitive' } },
        { planName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch plans
    const plans = await prisma.plan.findMany({
      where,
      orderBy: {
        supplierRating: 'desc',
      },
    });

    return NextResponse.json({
      plans,
      count: plans.length,
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

