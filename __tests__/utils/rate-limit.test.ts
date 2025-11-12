// Mock Vercel KV for testing (since it uses ESM which Jest doesn't handle well)
jest.mock('@vercel/kv', () => ({
  kv: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

import { checkRateLimit } from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  test('should allow first request', async () => {
    const result = await checkRateLimit('test-ip-1', 10, 60000);

    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(10);
    expect(result.remaining).toBe(9);
  });

  test('should track multiple requests', async () => {
    const ip = 'test-ip-2';
    
    // First request
    let result = await checkRateLimit(ip, 10, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);

    // Second request
    result = await checkRateLimit(ip, 10, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(8);

    // Third request
    result = await checkRateLimit(ip, 10, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(7);
  });

  test('should block requests after limit exceeded', async () => {
    const ip = 'test-ip-3';
    
    // Make 10 requests (at limit)
    for (let i = 0; i < 10; i++) {
      await checkRateLimit(ip, 10, 60000);
    }

    // 11th request should be blocked
    const result = await checkRateLimit(ip, 10, 60000);
    
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  test('should reset after window expires', async () => {
    const ip = 'test-ip-4';
    const shortWindow = 100; // 100ms window
    
    // First request
    const first = await checkRateLimit(ip, 3, shortWindow);
    expect(first.allowed).toBe(true);

    // Make 2 more to hit limit
    await checkRateLimit(ip, 3, shortWindow);
    await checkRateLimit(ip, 3, shortWindow);

    // Next request should fail
    const blocked = await checkRateLimit(ip, 3, shortWindow);
    expect(blocked.allowed).toBe(false);

    // Wait for window to expire
    return new Promise<void>((resolve) => {
      setTimeout(async () => {
        // Should be allowed again
        const afterReset = await checkRateLimit(ip, 3, shortWindow);
        expect(afterReset.allowed).toBe(true);
        expect(afterReset.remaining).toBe(2);
        resolve();
      }, 150);
    });
  });

  test('should track different IPs separately', async () => {
    const ip1 = 'test-ip-5';
    const ip2 = 'test-ip-6';

    // IP1 makes 5 requests
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(ip1, 10, 60000);
    }

    // IP2 should still have full quota
    const ip2Result = await checkRateLimit(ip2, 10, 60000);
    expect(ip2Result.allowed).toBe(true);
    expect(ip2Result.remaining).toBe(9);

    // IP1 should have used 5
    const ip1Result = await checkRateLimit(ip1, 10, 60000);
    expect(ip1Result.allowed).toBe(true);
    expect(ip1Result.remaining).toBe(4);
  });

  test('should handle concurrent requests', async () => {
    const ip = 'test-ip-7';
    
    // Simulate concurrent requests
    const results = await Promise.all(
      Array.from({ length: 5 }, () => checkRateLimit(ip, 10, 60000))
    );

    // All should be allowed
    expect(results.every(r => r.allowed)).toBe(true);
    
    // Remaining should decrease (note: concurrent requests may have same remaining due to race conditions)
    expect(results[0].remaining).toBeGreaterThanOrEqual(5);
    expect(results[0].remaining).toBeLessThanOrEqual(9);
  });

  test('should provide reset timestamp', async () => {
    const ip = 'test-ip-8';
    const beforeNow = Date.now();
    
    const result = await checkRateLimit(ip, 10, 60000);
    
    const afterNow = Date.now();
    
    // Reset should be ~60 seconds in future
    expect(result.reset).toBeGreaterThan(beforeNow);
    expect(result.reset).toBeLessThanOrEqual(afterNow + 60000);
  });
});

