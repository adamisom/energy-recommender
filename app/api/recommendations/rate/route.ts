import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/client';
import { getClientIp } from '@/lib/rate-limit';

const ratingSchema = z.object({
  planId: z.string(),
  rank: z.number().int().min(1).max(5),
  rating: z.number().int().min(-1).max(5),
  ratingType: z.enum(['star', 'thumbs']),
  feedback: z.string().optional(),
  helpful: z.boolean().optional(),
  sessionId: z.string().optional(), // For anonymous users
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ratingSchema.parse(body);

    // Get user ID from header (if authenticated) or use session ID from body
    const userId = request.headers.get('x-user-id') || null;
    const sessionId = validated.sessionId || getClientIp(request);

    // Store rating
    await prisma.recommendationRating.create({
      data: {
        userId,
        sessionId: userId ? null : sessionId,
        recommendationId: validated.planId, // Using planId as recommendationId
        planId: validated.planId,
        rank: validated.rank,
        rating: validated.rating,
        ratingType: validated.ratingType,
        feedback: validated.feedback,
        helpful: validated.helpful,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving rating:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid rating data', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to save rating' },
      { status: 500 }
    );
  }
}

