import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { getCurrentUser } from '@/lib/auth/server';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userId = user.id;

    const currentPlan = await prisma.userCurrentPlan.findUnique({
      where: { userId },
    });

    if (!currentPlan) {
      return NextResponse.json({ data: null });
    }

    // Convert to format expected by frontend
    const planData = {
      supplierName: currentPlan.supplierName,
      planName: currentPlan.planName,
      ratePerKwh: currentPlan.ratePerKwh,
      rateType: currentPlan.rateType as 'fixed' | 'variable' | 'tou',
      monthlyFee: currentPlan.monthlyFee,
      contractStartDate: currentPlan.contractStartDate.toISOString(),
      contractEndDate: currentPlan.contractEndDate?.toISOString(),
      contractLengthMonths: currentPlan.contractLengthMonths,
      earlyTerminationFee: currentPlan.earlyTerminationFee,
      onPeakRate: currentPlan.onPeakRate,
      offPeakRate: currentPlan.offPeakRate,
      planId: currentPlan.planId,
    };

    return NextResponse.json({ data: planData });
  } catch (error) {
    console.error('Error fetching current plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current plan' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userId = user.id;

    const body = await request.json();
    const {
      supplierName,
      planName,
      ratePerKwh,
      rateType,
      monthlyFee,
      contractStartDate,
      contractEndDate,
      contractLengthMonths,
      earlyTerminationFee,
      onPeakRate,
      offPeakRate,
      planId,
    } = body;

    // Upsert current plan (create or update)
    const currentPlan = await prisma.userCurrentPlan.upsert({
      where: { userId },
      update: {
        supplierName,
        planName,
        ratePerKwh: parseFloat(ratePerKwh),
        rateType,
        monthlyFee: parseFloat(monthlyFee) || 0,
        contractStartDate: new Date(contractStartDate),
        contractEndDate: contractEndDate ? new Date(contractEndDate) : null,
        contractLengthMonths: contractLengthMonths ? parseInt(contractLengthMonths, 10) : null,
        earlyTerminationFee: parseFloat(earlyTerminationFee) || 0,
        onPeakRate: onPeakRate ? parseFloat(onPeakRate) : null,
        offPeakRate: offPeakRate ? parseFloat(offPeakRate) : null,
        planId: planId || null,
      },
      create: {
        userId,
        supplierName,
        planName,
        ratePerKwh: parseFloat(ratePerKwh),
        rateType,
        monthlyFee: parseFloat(monthlyFee) || 0,
        contractStartDate: new Date(contractStartDate),
        contractEndDate: contractEndDate ? new Date(contractEndDate) : null,
        contractLengthMonths: contractLengthMonths ? parseInt(contractLengthMonths, 10) : null,
        earlyTerminationFee: parseFloat(earlyTerminationFee) || 0,
        onPeakRate: onPeakRate ? parseFloat(onPeakRate) : null,
        offPeakRate: offPeakRate ? parseFloat(offPeakRate) : null,
        planId: planId || null,
      },
    });

    return NextResponse.json({ data: currentPlan, success: true });
  } catch (error) {
    console.error('Error saving current plan:', error);
    return NextResponse.json(
      { error: 'Failed to save current plan' },
      { status: 500 }
    );
  }
}

