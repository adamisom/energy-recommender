// Mock NextResponse before importing route
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      headers: init?.headers || {},
    })),
  },
}));

import { POST } from '@/app/api/user/recommendations/route';
import { prisma } from '@/lib/database/client';
import { createClient } from '@/lib/auth/server';

// Mock Prisma
jest.mock('@/lib/database/client', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    savedRecommendation: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

// Mock Supabase auth
jest.mock('@/lib/auth/server', () => ({
  createClient: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('POST /api/user/recommendations - Deduplication', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: '',
    name: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSupabaseUser = {
    id: 'supabase-user-123',
    email: 'test@example.com',
    user_metadata: { name: null },
  };

  const mockSupabase = {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: mockSupabaseUser },
      }),
    },
  };

  const sampleRecommendation = {
    recommendations: [
      {
        rank: 1,
        plan: { planId: 'TX-001', planName: 'Test Plan' },
        projectedAnnualCost: 1000,
      },
    ],
    monthlyUsageKwh: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200],
    preferences: {
      priority: 'cost' as const,
      minRenewablePct: 0,
      maxContractMonths: 12,
      minSupplierRating: 3.0,
    },
    state: 'TX',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
  });

  function createRequest(body: unknown): Request {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as Request;
  }

  test('should save a new recommendation when no duplicates exist', async () => {
    // No existing recommendations
    mockPrisma.savedRecommendation.findMany.mockResolvedValueOnce([]);
    mockPrisma.savedRecommendation.create.mockResolvedValueOnce({
      id: 'rec-1',
      userId: mockUser.id,
      ...sampleRecommendation,
      createdAt: new Date(),
    } as unknown as Awaited<ReturnType<typeof mockPrisma.savedRecommendation.create>>);
    // After save, still only 1 recommendation
    mockPrisma.savedRecommendation.findMany.mockResolvedValueOnce([
      { id: 'rec-1', userId: mockUser.id },
    ] as unknown as Awaited<ReturnType<typeof mockPrisma.savedRecommendation.findMany>>);

    const request = createRequest(sampleRecommendation);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockPrisma.savedRecommendation.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.savedRecommendation.deleteMany).not.toHaveBeenCalled();
    expect(data.id).toBe('rec-1');
  });

  test('should delete duplicate recommendations before saving new one', async () => {
    const duplicateRec1 = {
      id: 'rec-duplicate-1',
      userId: mockUser.id,
      recommendations: sampleRecommendation.recommendations,
      monthlyUsageKwh: sampleRecommendation.monthlyUsageKwh,
      preferences: sampleRecommendation.preferences,
      state: sampleRecommendation.state,
      createdAt: new Date('2024-01-01'),
    };

    const duplicateRec2 = {
      id: 'rec-duplicate-2',
      userId: mockUser.id,
      recommendations: sampleRecommendation.recommendations,
      monthlyUsageKwh: sampleRecommendation.monthlyUsageKwh,
      preferences: sampleRecommendation.preferences,
      state: sampleRecommendation.state,
      createdAt: new Date('2024-01-02'),
    };

    // Existing recommendations include duplicates
    mockPrisma.savedRecommendation.findMany.mockResolvedValueOnce([
      duplicateRec1,
      duplicateRec2,
    ] as unknown as Awaited<ReturnType<typeof mockPrisma.savedRecommendation.findMany>>);

    // Mock deleteMany for duplicates
    mockPrisma.savedRecommendation.deleteMany.mockResolvedValueOnce({ count: 2 });

    // Mock create for new recommendation
    mockPrisma.savedRecommendation.create.mockResolvedValueOnce({
      id: 'rec-new',
      userId: mockUser.id,
      ...sampleRecommendation,
      createdAt: new Date(),
    } as unknown as Awaited<ReturnType<typeof mockPrisma.savedRecommendation.create>>);

    // After save, only the new one exists
    mockPrisma.savedRecommendation.findMany.mockResolvedValueOnce([
      { id: 'rec-new', userId: mockUser.id },
    ] as unknown as Awaited<ReturnType<typeof mockPrisma.savedRecommendation.findMany>>);

    const request = createRequest(sampleRecommendation);
    const response = await POST(request);

    expect(response.status).toBe(200);
    // Should delete duplicates
    expect(mockPrisma.savedRecommendation.deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['rec-duplicate-1', 'rec-duplicate-2'] },
      },
    });
    // Should create new recommendation
    expect(mockPrisma.savedRecommendation.create).toHaveBeenCalledTimes(1);
  });

  test('should not delete non-duplicate recommendations', async () => {
    const differentPreferences = {
      ...sampleRecommendation,
      preferences: {
        priority: 'renewable' as const,
        minRenewablePct: 50,
        maxContractMonths: 24,
        minSupplierRating: 4.0,
      },
    };

    const differentUsage = {
      ...sampleRecommendation,
      monthlyUsageKwh: [200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300],
    };

    const differentState = {
      ...sampleRecommendation,
      state: 'PA',
    };

    const nonDuplicate1 = {
      id: 'rec-nondup-1',
      userId: mockUser.id,
      ...differentPreferences,
      createdAt: new Date('2024-01-01'),
    };

    const nonDuplicate2 = {
      id: 'rec-nondup-2',
      userId: mockUser.id,
      ...differentUsage,
      createdAt: new Date('2024-01-02'),
    };

    const nonDuplicate3 = {
      id: 'rec-nondup-3',
      userId: mockUser.id,
      ...differentState,
      createdAt: new Date('2024-01-03'),
    };

    // Existing recommendations are different
    mockPrisma.savedRecommendation.findMany.mockResolvedValueOnce([
      nonDuplicate1,
      nonDuplicate2,
      nonDuplicate3,
    ] as unknown as Awaited<ReturnType<typeof mockPrisma.savedRecommendation.findMany>>);

    mockPrisma.savedRecommendation.create.mockResolvedValueOnce({
      id: 'rec-new',
      userId: mockUser.id,
      ...sampleRecommendation,
      createdAt: new Date(),
    } as unknown as Awaited<ReturnType<typeof mockPrisma.savedRecommendation.create>>);

    // After save, all 4 recommendations exist
    mockPrisma.savedRecommendation.findMany.mockResolvedValueOnce([
      { id: 'rec-new' },
      nonDuplicate1,
      nonDuplicate2,
      nonDuplicate3,
    ] as unknown as Awaited<ReturnType<typeof mockPrisma.savedRecommendation.findMany>>);

    const request = createRequest(sampleRecommendation);
    const response = await POST(request);

    expect(response.status).toBe(200);
    // Should NOT delete non-duplicates
    expect(mockPrisma.savedRecommendation.deleteMany).not.toHaveBeenCalled();
    expect(mockPrisma.savedRecommendation.create).toHaveBeenCalledTimes(1);
  });

  test('should delete oldest recommendations when more than 5 exist', async () => {
    const existingRecs = Array.from({ length: 5 }, (_, i) => ({
      id: `rec-${i + 1}`,
      userId: mockUser.id,
      recommendations: [{ rank: 1, plan: { planId: `TX-00${i + 1}` } }],
      monthlyUsageKwh: [100 * (i + 1)] as number[],
      preferences: { priority: 'cost' as const, minRenewablePct: 0, maxContractMonths: 12, minSupplierRating: 3.0 },
      state: 'TX',
      createdAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
    }));

    // No duplicates
    mockPrisma.savedRecommendation.findMany.mockResolvedValueOnce(existingRecs as unknown as Awaited<ReturnType<typeof mockPrisma.savedRecommendation.findMany>>);

    mockPrisma.savedRecommendation.create.mockResolvedValueOnce({
      id: 'rec-new',
      userId: mockUser.id,
      ...sampleRecommendation,
      createdAt: new Date('2024-01-06'),
    } as unknown as Awaited<ReturnType<typeof mockPrisma.savedRecommendation.create>>);

    // After save, we have 6 recommendations (5 existing + 1 new)
    // When ordered by createdAt desc: rec-new (Jan 6), rec-5 (Jan 5), rec-4 (Jan 4), rec-3 (Jan 3), rec-2 (Jan 2), rec-1 (Jan 1)
    // We keep the 5 newest: rec-new, rec-5, rec-4, rec-3, rec-2
    // We delete the 1 oldest: rec-1
    const allRecsAfterSave = [
      { id: 'rec-new', createdAt: new Date('2024-01-06') },
      ...existingRecs.reverse(), // Reverse to match desc order (newest first)
    ];
    mockPrisma.savedRecommendation.findMany.mockResolvedValueOnce(allRecsAfterSave as unknown as Awaited<ReturnType<typeof mockPrisma.savedRecommendation.findMany>>);

    // Mock deleteMany for oldest (rec-1, which is oldest)
    // No duplicates, so deleteMany only called once for the limit
    mockPrisma.savedRecommendation.deleteMany.mockResolvedValueOnce({ count: 1 });

    const request = createRequest(sampleRecommendation);
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockPrisma.savedRecommendation.create).toHaveBeenCalledTimes(1);
    // Should delete the oldest (rec-1) - only one call since no duplicates
    expect(mockPrisma.savedRecommendation.deleteMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.savedRecommendation.deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['rec-1'] },
      },
    });
  });

  test('should keep exactly 5 most recent recommendations', async () => {
    // Create 7 existing recommendations (ordered by date, oldest first)
    const existingRecs = Array.from({ length: 7 }, (_, i) => ({
      id: `rec-${i + 1}`,
      userId: mockUser.id,
      recommendations: [{ rank: 1, plan: { planId: `TX-00${i + 1}` } }],
      monthlyUsageKwh: [100 * (i + 1)] as number[],
      preferences: { priority: 'cost' as const, minRenewablePct: 0, maxContractMonths: 12, minSupplierRating: 3.0 },
      state: 'TX',
      createdAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
    }));

    // No duplicates
    mockPrisma.savedRecommendation.findMany.mockResolvedValueOnce(existingRecs as unknown as Awaited<ReturnType<typeof mockPrisma.savedRecommendation.findMany>>);

    mockPrisma.savedRecommendation.create.mockResolvedValueOnce({
      id: 'rec-new',
      userId: mockUser.id,
      ...sampleRecommendation,
      createdAt: new Date('2024-01-08'),
    } as unknown as Awaited<ReturnType<typeof mockPrisma.savedRecommendation.create>>);

    // After save, we have 8 recommendations (7 existing + 1 new)
    // When ordered by createdAt desc, newest first: rec-new, rec-7, rec-6, rec-5, rec-4, rec-3, rec-2, rec-1
    // We keep the 5 newest: rec-new, rec-7, rec-6, rec-5, rec-4
    // We delete the 3 oldest: rec-3, rec-2, rec-1
    const allRecsAfterSave = [
      { id: 'rec-new', createdAt: new Date('2024-01-08') },
      ...existingRecs.reverse(), // Reverse to match desc order (newest first)
    ];
    mockPrisma.savedRecommendation.findMany.mockResolvedValueOnce(allRecsAfterSave as unknown as Awaited<ReturnType<typeof mockPrisma.savedRecommendation.findMany>>);

    // Should delete the 3 oldest (rec-1, rec-2, rec-3)
    // No duplicates, so deleteMany only called once for the limit
    mockPrisma.savedRecommendation.deleteMany.mockResolvedValueOnce({ count: 3 });

    const request = createRequest(sampleRecommendation);
    const response = await POST(request);

    expect(response.status).toBe(200);
    // Should delete the 3 oldest to keep only 5
    // Note: The actual implementation deletes slice(5), which are the oldest after ordering desc
    expect(mockPrisma.savedRecommendation.deleteMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.savedRecommendation.deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['rec-3', 'rec-2', 'rec-1'] }, // Oldest 3 after desc ordering
      },
    });
  });

  test('should handle duplicate deletion and 5-item limit together', async () => {
    const duplicateRec = {
      id: 'rec-duplicate',
      userId: mockUser.id,
      recommendations: sampleRecommendation.recommendations,
      monthlyUsageKwh: sampleRecommendation.monthlyUsageKwh,
      preferences: sampleRecommendation.preferences,
      state: sampleRecommendation.state,
      createdAt: new Date('2024-01-01'),
    };

    // Create 5 existing recommendations, one is a duplicate
    const existingRecs = [
      duplicateRec,
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `rec-${i + 2}`,
        userId: mockUser.id,
        recommendations: [{ rank: 1, plan: { planId: `TX-00${i + 2}` } }],
        monthlyUsageKwh: [100 * (i + 2)] as number[],
        preferences: { priority: 'cost' as const, minRenewablePct: 0, maxContractMonths: 12, minSupplierRating: 3.0 },
        state: 'TX',
        createdAt: new Date(`2024-01-${String(i + 2).padStart(2, '0')}`),
      })),
    ];

    // First call: check for duplicates
    mockPrisma.savedRecommendation.findMany.mockResolvedValueOnce(existingRecs as unknown as Awaited<ReturnType<typeof mockPrisma.savedRecommendation.findMany>>);
    // Delete duplicate
    mockPrisma.savedRecommendation.deleteMany.mockResolvedValueOnce({ count: 1 });

    mockPrisma.savedRecommendation.create.mockResolvedValueOnce({
      id: 'rec-new',
      userId: mockUser.id,
      ...sampleRecommendation,
      createdAt: new Date('2024-01-06'),
    } as unknown as Awaited<ReturnType<typeof mockPrisma.savedRecommendation.create>>);

    // After save, we have 5 recommendations (4 non-duplicates + 1 new)
    const allRecsAfterSave = [
      { id: 'rec-new', createdAt: new Date('2024-01-06') },
      ...existingRecs.slice(1), // Exclude duplicate
    ];
    mockPrisma.savedRecommendation.findMany.mockResolvedValueOnce(allRecsAfterSave as unknown as Awaited<ReturnType<typeof mockPrisma.savedRecommendation.findMany>>);

    const request = createRequest(sampleRecommendation);
    const response = await POST(request);

    expect(response.status).toBe(200);
    // Should delete duplicate first
    expect(mockPrisma.savedRecommendation.deleteMany).toHaveBeenNthCalledWith(1, {
      where: {
        id: { in: ['rec-duplicate'] },
      },
    });
    // Should not need to delete for 5-item limit (we have exactly 5 after duplicate deletion)
    expect(mockPrisma.savedRecommendation.deleteMany).toHaveBeenCalledTimes(1);
  });

  test('should create user if not exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(mockUser);

    mockPrisma.savedRecommendation.findMany.mockResolvedValueOnce([]);
    mockPrisma.savedRecommendation.create.mockResolvedValueOnce({
      id: 'rec-1',
      userId: mockUser.id,
      ...sampleRecommendation,
      createdAt: new Date(),
    } as unknown as Awaited<ReturnType<typeof mockPrisma.savedRecommendation.create>>);
    mockPrisma.savedRecommendation.findMany.mockResolvedValueOnce([
      { id: 'rec-1', userId: mockUser.id },
    ] as unknown as Awaited<ReturnType<typeof mockPrisma.savedRecommendation.findMany>>);

    const request = createRequest(sampleRecommendation);
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: {
        email: mockSupabaseUser.email,
        password: '',
        name: null,
      },
    });
  });
});

