// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      headers: init?.headers || {},
    })),
  },
}));

import { POST } from '@/app/api/recommendations/rate/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/database/client';

// Mock Prisma
jest.mock('@/lib/database/client', () => ({
  prisma: {
    recommendationRating: {
      create: jest.fn(),
    },
  },
}));

// Mock rate limit
jest.mock('@/lib/rate-limit', () => ({
  getClientIp: jest.fn(() => '127.0.0.1'),
}));

describe('Rating API', () => {
  // Suppress console.error for these tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save rating successfully', async () => {
    prisma.recommendationRating.create.mockResolvedValue({
      id: 'rating-1',
      userId: null,
      sessionId: 'session-123',
      recommendationId: 'plan-1',
      planId: 'plan-1',
      rank: 1,
      rating: 5,
      ratingType: 'star',
      feedback: null,
      helpful: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = {
      json: async () => ({
        planId: 'plan-1',
        rank: 1,
        rating: 5,
        ratingType: 'star',
        sessionId: 'session-123',
      }),
      headers: {
        get: jest.fn(() => null),
      },
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
      expect(prisma.recommendationRating.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        planId: 'plan-1',
        rank: 1,
        rating: 5,
        ratingType: 'star',
        sessionId: 'session-123',
      }),
    });
  });

  it('should handle thumbs up rating', async () => {
    prisma.recommendationRating.create.mockResolvedValue({
      id: 'rating-2',
      userId: null,
      sessionId: 'session-123',
      recommendationId: 'plan-2',
      planId: 'plan-2',
      rank: 2,
      rating: 1,
      ratingType: 'thumbs',
      feedback: null,
      helpful: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = {
      json: async () => ({
        planId: 'plan-2',
        rank: 2,
        rating: 1,
        ratingType: 'thumbs',
        sessionId: 'session-123',
      }),
      headers: {
        get: jest.fn(() => null),
      },
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('should handle feedback with rating', async () => {
    prisma.recommendationRating.create.mockResolvedValue({
      id: 'rating-3',
      userId: null,
      sessionId: 'session-123',
      recommendationId: 'plan-3',
      planId: 'plan-3',
      rank: 3,
      rating: -1,
      ratingType: 'thumbs',
      feedback: 'Could be better',
      helpful: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = {
      json: async () => ({
        planId: 'plan-3',
        rank: 3,
        rating: -1,
        ratingType: 'thumbs',
        feedback: 'Could be better',
        sessionId: 'session-123',
      }),
      headers: {
        get: jest.fn(() => null),
      },
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(prisma.recommendationRating.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        feedback: 'Could be better',
      }),
    });
  });

  it('should return 400 for invalid rating data', async () => {
    const request = {
      json: async () => ({
        // Missing required fields
        planId: 'plan-1',
      }),
      headers: {
        get: jest.fn(() => null),
      },
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

