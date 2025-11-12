import { POST, GET } from '@/app/api/user/current-plan/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/database/client';

// Mock Prisma
jest.mock('@/lib/database/client', () => ({
  prisma: {
    userCurrentPlan: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

// Mock auth
jest.mock('@/lib/auth/server', () => ({
  getCurrentUser: jest.fn(),
}));

import { getCurrentUser } from '@/lib/auth/server';

describe('Current Plan API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/user/current-plan', () => {
    it('should save current plan for authenticated user', async () => {
      getCurrentUser.mockResolvedValue({ id: 'user-123' });
      prisma.userCurrentPlan.upsert.mockResolvedValue({
        id: 'plan-1',
        userId: 'user-123',
        supplierName: 'Test Supplier',
        planName: 'Test Plan',
        ratePerKwh: 0.12,
        rateType: 'fixed',
        monthlyFee: 5.0,
        contractStartDate: new Date('2024-01-01'),
        contractEndDate: null,
        contractLengthMonths: 12,
        earlyTerminationFee: 100,
        onPeakRate: null,
        offPeakRate: null,
        planId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest('http://localhost/api/user/current-plan', {
        method: 'POST',
        body: JSON.stringify({
          supplierName: 'Test Supplier',
          planName: 'Test Plan',
          ratePerKwh: 0.12,
          rateType: 'fixed',
          monthlyFee: 5.0,
          contractStartDate: '2024-01-01',
          contractEndDate: null,
          contractLengthMonths: 12,
          earlyTerminationFee: 100,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.userCurrentPlan.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        update: expect.objectContaining({
          supplierName: 'Test Supplier',
          ratePerKwh: 0.12,
        }),
        create: expect.objectContaining({
          userId: 'user-123',
          supplierName: 'Test Supplier',
        }),
      });
    });

    it('should return 401 for unauthenticated user', async () => {
      getCurrentUser.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/user/current-plan', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/user/current-plan', () => {
    it('should return current plan for authenticated user', async () => {
      getCurrentUser.mockResolvedValue({ id: 'user-123' });
      prisma.userCurrentPlan.findUnique.mockResolvedValue({
        id: 'plan-1',
        userId: 'user-123',
        supplierName: 'Test Supplier',
        planName: 'Test Plan',
        ratePerKwh: 0.12,
        rateType: 'fixed',
        monthlyFee: 5.0,
        contractStartDate: new Date('2024-01-01'),
        contractEndDate: new Date('2025-01-01'),
        contractLengthMonths: 12,
        earlyTerminationFee: 100,
        onPeakRate: null,
        offPeakRate: null,
        planId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest('http://localhost/api/user/current-plan', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(data.data.supplierName).toBe('Test Supplier');
      expect(data.data.ratePerKwh).toBe(0.12);
    });

    it('should return null if no current plan exists', async () => {
      getCurrentUser.mockResolvedValue({ id: 'user-123' });
      prisma.userCurrentPlan.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/user/current-plan', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeNull();
    });
  });
});

