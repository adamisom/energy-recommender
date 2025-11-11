import { checkRateLimit } from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  test('should allow first request', () => {
    const result = checkRateLimit('test-ip-1', 10, 60000);

    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(10);
    expect(result.remaining).toBe(9);
  });

  test('should track multiple requests', () => {
    const ip = 'test-ip-2';
    
    // First request
    let result = checkRateLimit(ip, 10, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);

    // Second request
    result = checkRateLimit(ip, 10, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(8);

    // Third request
    result = checkRateLimit(ip, 10, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(7);
  });

  test('should block requests after limit exceeded', () => {
    const ip = 'test-ip-3';
    
    // Make 10 requests (at limit)
    for (let i = 0; i < 10; i++) {
      checkRateLimit(ip, 10, 60000);
    }

    // 11th request should be blocked
    const result = checkRateLimit(ip, 10, 60000);
    
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  test('should reset after window expires', () => {
    const ip = 'test-ip-4';
    const shortWindow = 100; // 100ms window
    
    // First request
    const first = checkRateLimit(ip, 3, shortWindow);
    expect(first.allowed).toBe(true);

    // Make 2 more to hit limit
    checkRateLimit(ip, 3, shortWindow);
    checkRateLimit(ip, 3, shortWindow);

    // Next request should fail
    const blocked = checkRateLimit(ip, 3, shortWindow);
    expect(blocked.allowed).toBe(false);

    // Wait for window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Should be allowed again
        const afterReset = checkRateLimit(ip, 3, shortWindow);
        expect(afterReset.allowed).toBe(true);
        expect(afterReset.remaining).toBe(2);
        resolve();
      }, 150);
    });
  });

  test('should track different IPs separately', () => {
    const ip1 = 'test-ip-5';
    const ip2 = 'test-ip-6';

    // IP1 makes 5 requests
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip1, 10, 60000);
    }

    // IP2 should still have full quota
    const ip2Result = checkRateLimit(ip2, 10, 60000);
    expect(ip2Result.allowed).toBe(true);
    expect(ip2Result.remaining).toBe(9);

    // IP1 should have used 5
    const ip1Result = checkRateLimit(ip1, 10, 60000);
    expect(ip1Result.allowed).toBe(true);
    expect(ip1Result.remaining).toBe(4);
  });

  test('should handle concurrent requests', () => {
    const ip = 'test-ip-7';
    
    // Simulate concurrent requests
    const results = [];
    for (let i = 0; i < 5; i++) {
      results.push(checkRateLimit(ip, 10, 60000));
    }

    // All should be allowed
    expect(results.every(r => r.allowed)).toBe(true);
    
    // Remaining should decrease
    expect(results[0].remaining).toBe(9);
    expect(results[4].remaining).toBe(5);
  });

  test('should provide reset timestamp', () => {
    const ip = 'test-ip-8';
    const beforeNow = Date.now();
    
    const result = checkRateLimit(ip, 10, 60000);
    
    const afterNow = Date.now();
    
    // Reset should be ~60 seconds in future
    expect(result.reset).toBeGreaterThan(beforeNow);
    expect(result.reset).toBeLessThanOrEqual(afterNow + 60000);
  });
});

